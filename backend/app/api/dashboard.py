from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.content_generation import ContentGeneration
from app.models.project import Project

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    total_projects = await db.scalar(select(func.count(Project.id)))
    scripts_generated = await db.scalar(select(func.count(ContentGeneration.id)))

    scheduled_projects = await db.scalar(
        select(func.count(Project.id)).where(func.lower(Project.status) == "scheduled")
    )

    return {
        "total_projects": total_projects or 0,
        "scripts_generated": scripts_generated or 0,
        "storyboards_created": scripts_generated or 0,
        "content_scheduled": scheduled_projects or 0,
        "best_performing_tone": "Strategic",
        "recommended_upload_time": "19:30",
        "weekly_focus": "Create 3 short videos and 1 story chapter",
    }
