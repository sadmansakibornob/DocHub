from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ArticleStatus = Literal["draft", "review", "published"]


class ArticleCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    content: str = Field(min_length=1)
    category_id: int | None = None


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    category_id: int | None = None
    status: ArticleStatus | None = None


class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    category_id: int | None = None
    author_id: str
    status: ArticleStatus
    created_at: datetime | None = None
    updated_at: datetime | None = None
