# from bullmq import Worker
# import asyncio

# async def process(job):
#     print("Received job:", job.data)
#     # Do audio processing, LUFS normalization, etc.
#     return {"status": "done"}

# worker = Worker(
#     "audio-tasks",
#     process,
#     connection={"host": "localhost", "port": 6379}
# )

# asyncio.get_event_loop().run_forever()



from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.generate_signed_url import router as signed_url_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(signed_url_router, prefix="/signed_url", tags=["Signed URL"])

if __name__ == "__main__":
    app.run()



# from utils.generate_signed_url import generate_signed_url

# result = generate_signed_url('addis-music', 'music/1763712750227-65614671-22141818-b3d1-454e-be39-c82afdd2748e.mp3')

# print(result)




# from utils.generate_signed_url import generate_signed_urls_for_folder

# result = generate_signed_urls_for_folder("7c0cf737-4c65-4515-a90c-df6a54f0c087")

# print(result)

