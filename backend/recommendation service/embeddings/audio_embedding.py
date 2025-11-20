import os
from io import BytesIO
import torch
import librosa
from transformers import ClapProcessor, ClapModel
from utils.download_audio_from_s3 import download_audio_from_s3


def load_clap_model_and_processor(model_path: str) -> (ClapProcessor, ClapModel):
    """
    Load the CLAP model and processor from a local path.
    If not found, download them from Hugging Face.

    Args:
        model_path (str): The local path for the CLAP model.
    
    Returns:
        Tuple[ClapProcessor, ClapModel]: The loaded processor and model.
    """
    # Check if the model and processor already exist locally
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Downloading...")

        # Download the processor and model from Hugging Face (default source)
        processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
        model = ClapModel.from_pretrained("laion/clap-htsat-unfused").to("cpu")
        
        # Save them locally for future use
        processor.save_pretrained(model_path)
        model.save_pretrained(model_path)
        
        print(f"Model and processor downloaded and saved to {model_path}")
    else:
        print(f"Loading model and processor from local paths: {model_path}")
        # Load locally saved processor and model
        processor = ClapProcessor.from_pretrained(model_path)
        model = ClapModel.from_pretrained(model_path).to("cpu")
    
    return processor, model


# Define the local paths where you want to store the model and processor
model_path = "./models/clap-htsat-unfused"

# Load the model and processor
processor, model = load_clap_model_and_processor(model_path)
print("Model and processor loaded successfully.")


def extract_audio_features(audio_stream: BytesIO, sr: int = 48000) -> torch.Tensor:
    """
    Extracts audio features using the CLAP model.

    Args:
        audio_stream (BytesIO): Byte stream of the audio file.
        sr (int): Sampling rate for the audio.

    Returns:
        numpy.ndarray: Extracted audio features as a numpy array.
    """

    # Load audio data using librosa from BytesIO
    audio, _ = librosa.load(audio_stream, sr=sr)

    # Process the audio
    inputs = processor(audios=audio, sampling_rate=sr, return_tensors="pt")

    # Extract features without calculating gradients
    with torch.no_grad():
        emb = model.get_audio_features(**inputs).squeeze().numpy()

    return emb
