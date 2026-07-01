from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.content_generation import ContentGeneration
from app.models.project import Project
from app.schemas.ai import GenerateContentRequest, GenerationOut
from app.services.groq_service import generate_content_with_groq

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate-content", response_model=GenerationOut, status_code=status.HTTP_201_CREATED)
async def generate_content(payload: GenerateContentRequest, db: AsyncSession = Depends(get_db)):
    if payload.project_id:
        project = await db.get(Project, payload.project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    generated = await generate_content_with_groq(payload)

    generation = ContentGeneration(
        project_id=payload.project_id,
        idea=payload.idea,
        platform=payload.platform,
        tone=payload.tone,
        title=generated.get("title"),
        hook=generated.get("hook"),
        script=generated.get("script"),
        storyboard=generated.get("storyboard"),
        visual_prompts=generated.get("visual_prompts"),
        caption=generated.get("caption"),
        hashtags=generated.get("hashtags"),
        editing_checklist=generated.get("editing_checklist"),
        raw_response=generated,
    )

    db.add(generation)
    await db.commit()
    await db.refresh(generation)
    return generation


@router.get("/generations", response_model=list[GenerationOut])
async def list_generations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContentGeneration).order_by(ContentGeneration.created_at.desc()))
    return result.scalars().all()


@router.get("/generations/{generation_id}", response_model=GenerationOut)
async def get_generation(generation_id: UUID, db: AsyncSession = Depends(get_db)):
    generation = await db.get(ContentGeneration, generation_id)
    if not generation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
    return generation
