import sys
import os
import tempfile
from gradio_client import Client, handle_file

# Optional: Mongo imports for image-enabled flow
from pymongo import MongoClient
from bson.objectid import ObjectId


def error_and_exit(msg: str, code: int = 1):
    print(msg, file=sys.stderr)
    sys.exit(code)


def get_gradio_client():
    gradio_url = os.environ.get("GRADIO_URL")
    if not gradio_url:
        error_and_exit("Error: GRADIO_URL environment variable not set.")
    return Client(gradio_url, verbose=False)


def predict_text_only(question: str, session_id: str):
    try:
        client = get_gradio_client()
        result = client.predict(
            transcription=None,
            text_input_val=question,
            image=None,
            session_id=session_id,
            api_name="/process_basic_question"
        )
        print(str(result))
    except Exception as e:
        error_and_exit(f"An error occurred: {e}")


def predict_with_image(question_text: str, chat_id: str, session_id: str):
    mongo_uri = os.environ.get("MONGO_URI")
    if not mongo_uri:
        error_and_exit("Error: MONGO_URI environment variable not set.")

    temp_path = None
    try:
        mclient = MongoClient(mongo_uri)
        db = mclient.get_default_database()
        if db is None:
            db_name = os.environ.get("MONGO_DB_NAME", "test")
            db = mclient[db_name]
        images = db.get_collection("images")
        doc = images.find_one({"chat": ObjectId(chat_id)})
        if not doc or not doc.get("data"):
            error_and_exit("No persisted image found for this chat.")

        # Save image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(doc["data"])
            temp_path = tmp.name

        client = get_gradio_client()
        result = client.predict( 
            transcription=None,
            text_input_val=question_text,
            image=handle_file(temp_path),
            session_id=session_id,
            api_name="/process_basic_question"
        )
        print(str(result))

    except Exception as e:
        error_and_exit(f"An error occurred: {e}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        error_and_exit("Usage: predict.py <question> <session_id> | predict.py get_answer <question_text> <chatId> <session_id>")

    # Mode 1: text+image
    if sys.argv[1] == "get_answer":
        if len(sys.argv) < 5:
            error_and_exit("Usage: predict.py get_answer <question_text> <chatId> <session_id>")
        _, _, question_text, chat_id, session_id = sys.argv[0], sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
        predict_with_image(question_text, chat_id, session_id)
    else:
        # Mode 2: text-only
        question = sys.argv[1]
        session_id = sys.argv[2]
        predict_text_only(question, session_id)
