import torch
from sentence_transformers import SentenceTransformer

# Load model from a local path
model = SentenceTransformer('./models/all-MiniLM-L6-v2')
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
