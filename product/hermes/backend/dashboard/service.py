import uuid

from sqlalchemy.orm import Session

from backend.db.models import Project
from backend.dashboard.schemas import ProjectCreate


def create_project(db: Session, data: ProjectCreate) -> Project:
    project = Project(id=str(uuid.uuid4()), name=data.name, description=data.description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def list_projects(db: Session) -> list[Project]:
    return db.query(Project).order_by(Project.updated_at.desc()).all()


def get_project(db: Session, project_id: str) -> Project | None:
    return db.query(Project).filter(Project.id == project_id).first()


def delete_project(db: Session, project_id: str) -> bool:
    project = get_project(db, project_id)
    if not project:
        return False
    db.delete(project)
    db.commit()
    return True
