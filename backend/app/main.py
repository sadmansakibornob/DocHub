from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user_route import router as user_router
from app.routes.article_route import router as article_router
from app.routes.category_route import router as category_router

app = FastAPI(
    title="DocHub API",
    description="Internal knowledge-sharing platform",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://dochub-mauve.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
