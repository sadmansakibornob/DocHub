from uuid import UUID
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["reader", "contributor", "admin"]


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    role: UserRole | None = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
