from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=180)
    niche: str | None = Field(default=None, max_length=120)
    target_platform: str = Field(default="TikTok", max_length=60)
    status: str = Field(default="Draft", max_length=40)
    description: str | None = None


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    niche: str | None = Field(default=None, max_length=120)
    target_platform: str | None = Field(default=None, max_length=60)
    status: str | None = Field(default=None, max_length=40)
    description: str | None = None


class ProjectOut(BaseModel):
    id: UUID
    title: str
    niche: str | None
    target_platform: str
    status: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
