from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.db.models import MindMap, FlowChart, BehaviorPack, Requirement, Goal
from backend.deps import get_db
from backend.dashboard.schemas import ProjectCreate, ProjectRead, ProjectStatus
from backend.dashboard.service import create_project, list_projects, get_project, delete_project

router = APIRouter()


@router.post("/projects", response_model=ProjectRead)
def api_create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(db, data)


@router.get("/projects", response_model=list[ProjectRead])
def api_list_projects(db: Session = Depends(get_db)):
    return list_projects(db)


@router.get("/projects/{project_id}", response_model=ProjectStatus)
def api_get_project(project_id: str, db: Session = Depends(get_db)):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return ProjectStatus(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        requirement_count=db.query(Requirement).filter(Requirement.project_id == project_id).count(),
        goal_count=db.query(Goal).filter(Goal.project_id == project_id).count(),
        has_mind_map=db.query(MindMap).filter(MindMap.project_id == project_id).first() is not None,
        has_flow_chart=db.query(FlowChart).filter(FlowChart.project_id == project_id).first() is not None,
        behavior_pack_count=db.query(BehaviorPack).filter(BehaviorPack.project_id == project_id).count(),
    )


@router.delete("/projects/{project_id}")
def api_delete_project(project_id: str, db: Session = Depends(get_db)):
    if not delete_project(db, project_id):
        raise HTTPException(404, "Project not found")
    return {"ok": True}
