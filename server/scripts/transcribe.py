import sys
import os
import speech_recognition as sr

# Check if the audio file path is provided
if len(sys.argv) < 2:
    print("Error: No audio file path provided.", file=sys.stderr)
    sys.exit(1)

audio_file_path = sys.argv[1]

# Check if the audio file exists
if not os.path.exists(audio_file_path):
    print(f"Error: Audio file not found at {audio_file_path}", file=sys.stderr)
    sys.exit(1)

# Initialize the recognizer
r = sr.Recognizer()

try:
    # Use the audio file as the audio source
    with sr.AudioFile(audio_file_path) as source:
        audio_data = r.record(source)  # Read the entire audio file

    # Recognize speech using Google Web Speech API
    text = r.recognize_google(audio_data)
    
    # Print the transcribed text to stdout
    print(text)

except sr.UnknownValueError:
    print("Google Web Speech API could not understand audio", file=sys.stderr)
    sys.exit(1)
except sr.RequestError as e:
    print(f"Could not request results from Google Web Speech API; {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"An error occurred during transcription: {e}", file=sys.stderr)
    sys.exit(1)

