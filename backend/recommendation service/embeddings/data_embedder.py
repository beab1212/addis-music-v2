import os
import torch
from sentence_transformers import SentenceTransformer

def load_model(model_path: str) -> SentenceTransformer:
    """
    Load the SentenceTransformer model from a local path.
    If not found, download the model from the Hugging Face Model Hub.
    
    Args:
        model_path (str): The local directory where the model is stored.
    
    Returns:
        SentenceTransformer: The loaded model.
    """
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Downloading the model...")
        # Download the model from Hugging Face (or the default source)
        model = SentenceTransformer('all-MiniLM-L6-v2')
        model.save(model_path)  # Save the model locally for future use
        print(f"Model downloaded and saved to {model_path}")
    else:
        print(f"Loading model from local path: {model_path}")
        model = SentenceTransformer(model_path)
    
    return model


# Define the model path
model_path = './models/all-MiniLM-L6-v2'

# Load the model (either from local path or download)
model = load_model(model_path)
print(f"Model Loaded successfully")

def embed_text(text: str) -> torch.Tensor:
    """
    Embed a single text into a vector using the SentenceTransformer model.
    
    Args:
        text (str): Text to be embedded.
        
    Returns:
        torch.Tensor: Tensor containing the embedding.
    """
    embedding = model.encode([text], convert_to_tensor=True)[0]
    return embedding
