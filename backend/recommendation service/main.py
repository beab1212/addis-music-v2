import asyncio
from workers.metadata_worker import metadata_embedding_worker
from workers.sonic_worker import sonic_embedding_worker


def runserver():
    import uvicorn
    print("Starting the backend server...")
    uvicorn.run("api.main:app", host="0.0.0.0", port=8001, reload=True)
    print("Backend server stopped.")


async def main():
    """
    Main function that coordinates the execution of embedding tasks.

    This function gathers and runs multiple asynchronous tasks concurrently, 
    including the metadata embedding worker and the sonic embedding worker.
    It waits for all tasks to complete before exiting.

    Tasks:
        - `metadata_embedding_worker`: Handles the creation and storage of metadata embeddings.
        - `sonic_embedding_worker`: Handles the creation and storage of sonic/audio embeddings.

    It leverages asyncio to run these tasks concurrently for improved efficiency.

    Returns:
        None
    """
    # Define the tasks to be executed concurrently
    tasks = [
        metadata_embedding_worker(),
        sonic_embedding_worker(),
        runserver(),
    ]

    # Wait for all tasks to complete and handle them concurrently
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    """
    This checks if the script is being run directly and then runs the `main` function 
    using asyncio to handle asynchronous execution of embedding workers.
    """
    # Run the main function using asyncio
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



# import asyncio
# from workers.sonic_worker import sonic_embedding_worker

# if __name__ == "__main__":
#     asyncio.run(sonic_embedding_worker())




# # http://127.0.0.1:9000/addis-music/music/1763578002140-771026425-426c0f7b-4277-404c-af92-6c3416e9ee81.mp3

# from utils.download_audio_from_s3 import download_audio_from_s3, get_audio_duration
# from config.config import settings


# audio_stream = download_audio_from_s3(settings.s3_storage.s3_bucket_name, "music/1763657989527-972775464-c581c553-47cc-49f8-a035-5fe48b322810.mp3")
# audio_duration = get_audio_duration(audio_stream)

# print("Audio Duration: ", audio_duration)





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
