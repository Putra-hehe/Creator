from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class GenerateContentRequest(BaseModel):
    idea: str = Field(..., min_length=5, description="Raw content idea from user")
    platform: str = Field(default="TikTok")
    tone: str = Field(default="Strategic")
    project_id: UUID | None = None
    language: str = Field(default="Indonesian")


class StoryboardItem(BaseModel):
    scene: int
    visual: str
    voice_over: str
    editing_note: str


class GeneratedContent(BaseModel):
    title: str
    hook: str
    script: str
    storyboard: list[StoryboardItem]
    visual_prompts: list[str]
    caption: str
    hashtags: list[str]
    editing_checklist: list[str]


class GenerationOut(BaseModel):
    id: UUID
    project_id: UUID | None
    idea: str
    platform: str
    tone: str
    title: str | None
    hook: str | None
    script: str | None
    storyboard: list | None
    visual_prompts: list | None
    caption: str | None
    hashtags: list | None
    editing_checklist: list | None
    created_at: datetime

    model_config = {"from_attributes": True}
