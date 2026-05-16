import uuid

from sqlalchemy.orm import Session

from backend.db.models import MindMap, FlowChart
from backend.model.schemas import MindMapSave, FlowChartSave


def save_mind_map(db: Session, project_id: str, data: MindMapSave) -> MindMap:
    existing = db.query(MindMap).filter(MindMap.project_id == project_id).first()
    if existing:
        existing.name = data.name
        existing.data = data.data.model_dump()
    else:
        existing = MindMap(
            id=str(uuid.uuid4()),
            project_id=project_id,
            name=data.name,
            data=data.data.model_dump(),
        )
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


def load_mind_map(db: Session, project_id: str) -> MindMap | None:
    return db.query(MindMap).filter(MindMap.project_id == project_id).first()


def save_flow_chart(db: Session, project_id: str, data: FlowChartSave) -> FlowChart:
    existing = db.query(FlowChart).filter(FlowChart.project_id == project_id).first()
    if existing:
        existing.name = data.name
        existing.data = data.data.model_dump()
    else:
        existing = FlowChart(
            id=str(uuid.uuid4()),
            project_id=project_id,
            name=data.name,
            data=data.data.model_dump(),
        )
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


def load_flow_chart(db: Session, project_id: str) -> FlowChart | None:
    return db.query(FlowChart).filter(FlowChart.project_id == project_id).first()
