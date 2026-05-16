import uuid
import json

from sqlalchemy.orm import Session

from backend.db.models import ChatMessage, MindMap, FlowChart, Goal, Requirement


def save_message(db: Session, project_id: str, role: str, content: str) -> ChatMessage:
    msg = ChatMessage(id=str(uuid.uuid4()), project_id=project_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def list_messages(db: Session, project_id: str) -> list[ChatMessage]:
    return db.query(ChatMessage).filter(ChatMessage.project_id == project_id).order_by(ChatMessage.created_at).all()


def build_context(db: Session, project_id: str) -> str:
    parts: list[str] = []

    reqs = db.query(Requirement).filter(Requirement.project_id == project_id).all()
    if reqs:
        parts.append("## Requirements\n" + "\n".join(f"- {r.text}" for r in reqs))

    goals = db.query(Goal).filter(Goal.project_id == project_id).all()
    if goals:
        parts.append("## Goals\n" + "\n".join(f"- {g.text} [{g.status}]" for g in goals))

    mm = db.query(MindMap).filter(MindMap.project_id == project_id).first()
    if mm and mm.data.get("nodes"):
        nodes = mm.data["nodes"]
        parts.append("## Mind Map\n" + json.dumps(nodes, ensure_ascii=False, indent=2))

    fc = db.query(FlowChart).filter(FlowChart.project_id == project_id).first()
    if fc and fc.data.get("nodes"):
        parts.append("## Flow Chart\n" + json.dumps(fc.data, ensure_ascii=False, indent=2))

    return "\n\n".join(parts) if parts else "No design data yet."
