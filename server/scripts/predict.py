import sys
import os
from gradio_client import Client

# Get Gradio URL from environment variable
gradio_url = os.environ.get("GRADIO_URL")
if not gradio_url:
    print("Error: GRADIO_URL environment variable not set.", file=sys.stderr)
    sys.exit(1)

question = sys.argv[1]

try:
    client = Client(gradio_url, verbose=False)
    result = client.predict(
            question=question,
            image=None,
            api_name="/answer_question"
    )
    print(result)
except Exception as e:
    print(f"An error occurred: {e}", file=sys.stderr)
    sys.exit(1)
