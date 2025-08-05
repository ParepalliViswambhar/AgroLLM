import sys
import os
import whisper
import librosa
import numpy as np

# Check if the audio file path is provided
if len(sys.argv) < 2:
    print("Error: No audio file path provided.", file=sys.stderr)
    sys.exit(1)

audio_file_path = sys.argv[1]

# Check if the audio file exists
if not os.path.exists(audio_file_path):
    print(f"Error: Audio file not found at {audio_file_path}", file=sys.stderr)
    sys.exit(1)

try:
    # Load the audio file using librosa
    # This will resample the audio to the required sample rate for Whisper (16kHz)
    audio, sr = librosa.load(audio_file_path, sr=16000)

    # Ensure the audio is in the correct format (float32)
    audio = audio.astype(np.float32)

    # Load the whisper model
    model = whisper.load_model("base")

    # Transcribe the audio data
    result = model.transcribe(audio)
    
    # Print the transcribed text to stdout
    print(result["text"])

except Exception as e:
    print(f"An error occurred during transcription: {e}", file=sys.stderr)
    sys.exit(1)
