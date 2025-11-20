"""
"""
import asyncio
from workers.metadata_worker import metadata_embedding_worker
from workers.sonic_worker import sonic_embedding_worker


async def main():
    tasks = [
        metadata_embedding_worker(),
        sonic_embedding_worker(),
    ]

    # Wait for all tasks to complete
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    # Run the main function with asyncio
    asyncio.run(main())








# import subprocess

# workers = [
#     "workers.metadata_worker",  # Use the module path instead of the script path
#     "workers.sonic_worker",
#     # "workers.lufs_worker",
# ]

# processes = []

# for worker in workers:
#     p = subprocess.Popen(["python", "-m", worker])  # Run as module
#     processes.append(p)
#     print(f"Started {worker} with PID {p.pid}")

# # Keep the main script alive
# for p in processes:
#     p.wait()







# import asyncio
# from workers.metadata_worker import metadata_embedding_worker

# if __name__ == "__main__":
#     asyncio.run(metadata_embedding_worker())



# from  embeddings.audio_embedding import extract_audio_features


# result = extract_audio_features("/home/parrobaba/Music/sami_dan - wede_lay.mp3")
# print("Extracted audio features shape:", result.shape)
# print(result)



# from embedder.data_embedder import embed_texts

# texts = ["This is a test", "This is another sentence"]
# embeddings = embed_texts(texts)
# print(embeddings.shape)
# print(embeddings)







# import torch


# print("torch version:", torch.__version__)
# print("CUDA available:", torch.cuda.is_available())
# if torch.cuda.is_available():
#     print("CUDA device name:", torch.cuda.get_device_name(0))
#     print("CUDA device count:", torch.cuda.device_count())
#     print("Current CUDA device index:", torch.cuda.current_device())





# This will download and save the model from https://huggingface.co/
# from sentence_transformers import SentenceTransformer

# model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
# model.save('./models/all-MiniLM-L6-v2')


# import time
# from sentence_transformers import SentenceTransformer

# start_time = time.time()
# # Load model from a local path
# model = SentenceTransformer('./models/all-MiniLM-L6-v2')
# end_time = time.time()

# print(f"Model Loaded successfully Execution time: {end_time - start_time:.4f} seconds")


# start_time = time.time()
# sentences = ["This is a test", "This is another sentence"]
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# end_time = time.time()

# print(f"Embedding Completed successfully Execution time: {end_time - start_time:.4f} seconds")

# print(embeddings.shape)
# # print(embeddings)

# import time
# from sentence_transformers import SentenceTransformer

# start_time = time.time()
# # Load model from a local path
# model = SentenceTransformer('./models/all-MiniLM-L6-v2')
# end_time = time.time()

# print(f"Model Loaded successfully Execution time: {end_time - start_time:.4f} seconds")


# start_time = time.time()
# sentences = ["This is a test", "This is another sentence"]
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# embeddings = model.encode(sentences)
# end_time = time.time()

# print(f"Embedding Completed successfully Execution time: {end_time - start_time:.4f} seconds")

# print(embeddings.shape)
# # print(embeddings)
