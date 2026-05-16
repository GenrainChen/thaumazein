from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.deps import get_db
from backend.db.models import Project
from backend.intent.schemas import RequirementCreate, RequirementRead, ParseRequest, ParseResponse, GoalRead
from backend.intent.service import (
    create_requirement, list_requirements, parse_requirement_with_ai, save_goals, list_goals,
)

router = APIRouter()


def _get_project(db: Session, project_id: str) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.post("/projects/{project_id}/requirements", response_model=RequirementRead)
def api_create_requirement(project_id: str, data: RequirementCreate, db: Session = Depends(get_db)):
    _get_project(db, project_id)
    return create_requirement(db, project_id, data.text)


@router.get("/projects/{project_id}/requirements", response_model=list[RequirementRead])
def api_list_requirements(project_id: str, db: Session = Depends(get_db)):
    _get_project(db, project_id)
    return list_requirements(db, project_id)


@router.post("/projects/{project_id}/parse", response_model=ParseResponse)
def api_parse_requirement(project_id: str, data: ParseRequest, db: Session = Depends(get_db)):
    _get_project(db, project_id)
    goals = parse_requirement_with_ai(data.text)
    return ParseResponse(goals=goals)


@router.post("/projects/{project_id}/goals", response_model=list[GoalRead])
def api_save_goals(project_id: str, data: ParseResponse, db: Session = Depends(get_db)):
    _get_project(db, project_id)
    return save_goals(db, project_id, data.goals)


@router.get("/projects/{project_id}/goals", response_model=list[GoalRead])
def api_list_goals(project_id: str, db: Session = Depends(get_db)):
    _get_project(db, project_id)
    return list_goals(db, project_id)
