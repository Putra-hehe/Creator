import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ContentGeneration(Base):
    __tablename__ = "content_generations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)

    idea: Mapped[str] = mapped_column(Text, nullable=False)
    platform: Mapped[str] = mapped_column(String(60), nullable=False)
    tone: Mapped[str] = mapped_column(String(60), nullable=False)

    title: Mapped[str | None] = mapped_column(String(180), nullable=True)
    hook: Mapped[str | None] = mapped_column(Text, nullable=True)
    script: Mapped[str | None] = mapped_column(Text, nullable=True)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)

    storyboard: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    visual_prompts: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    hashtags: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    editing_checklist: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    raw_response: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project = relationship("Project", back_populates="generations")
