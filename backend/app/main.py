from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_route import router as auth_router
from app.routes.user_route import router as user_router
from app.routes.article_route import router as article_router
from app.routes.category_route import router as category_router
from app.routes.group_route import router as group_router
from app.routes.admin_route import router as admin_router


app = FastAPI(
    title="DocHub API",
    description="Internal knowledge-sharing platform",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

# CORS
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

# Authentication routes
app.include_router(auth_router)

# User management routes
app.include_router(user_router)

# Article management routes
app.include_router(article_router)

# Category management routes
app.include_router(category_router)

# Group management routes
app.include_router(group_router)

# Admin dashboard and moderation routes
app.include_router(admin_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to DocHub API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
    }

