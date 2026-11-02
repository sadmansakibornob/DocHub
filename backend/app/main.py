from fastapi import FastAPI

from app.routes.user_route import router as user_router
from app.routes.article_route import router as article_router
from app.routes.category_route import router as category_router

app = FastAPI(
    title="DocHub API",
    description="Internal knowledge-sharing platform",
    version="1.0.0",
)

app.include_router(user_router)
app.include_router(article_router)
app.include_router(category_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to DocHub API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}