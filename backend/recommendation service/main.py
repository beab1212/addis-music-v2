from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.personalization_routes import router as personalization_router
from routers.embedding_routes import router as embedding_router

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

app.include_router(personalization_router, prefix="/personalization", tags=["Personalization"])
app.include_router(embedding_router, prefix="/embeddings", tags=["Embeddings"])

if __name__ == "__main__":
    app.run(port=8001)
