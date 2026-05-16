import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.deps import get_db
from backend.db.models import Project, BehaviorPack
from backend.model.schemas import MindMapSave, MindMapRead, FlowChartSave, FlowChartRead
from backend.model.service import save_mind_map, load_mind_map, save_flow_chart, load_flow_chart
from backend.model.behavior_pack import build_manifest, sign_manifest, verify_signature

router = APIRouter()


def _check_project(db: Session, project_id: str):
    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(404, "Project not found")


@router.put("/projects/{project_id}/mindmap", response_model=MindMapRead)
def api_save_mindmap(project_id: str, data: MindMapSave, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    return save_mind_map(db, project_id, data)


@router.get("/projects/{project_id}/mindmap", response_model=MindMapRead)
def api_load_mindmap(project_id: str, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    mm = load_mind_map(db, project_id)
    if not mm:
        raise HTTPException(404, "Mind map not found")
    return mm


@router.put("/projects/{project_id}/flowchart", response_model=FlowChartRead)
def api_save_flowchart(project_id: str, data: FlowChartSave, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    return save_flow_chart(db, project_id, data)


@router.get("/projects/{project_id}/flowchart", response_model=FlowChartRead)
def api_load_flowchart(project_id: str, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    fc = load_flow_chart(db, project_id)
    if not fc:
        raise HTTPException(404, "Flow chart not found")
    return fc


class AssembleRequest(BaseModel):
    version: str = "0.1.0"
    target_bastion_type: str = "ground"
    target_bastion_id: str | None = None


class AssembleResponse(BaseModel):
    pack_id: str
    manifest: dict
    signature: dict
    verified: bool


@router.post("/projects/{project_id}/assemble", response_model=AssembleResponse)
def api_assemble_pack(project_id: str, data: AssembleRequest, db: Session = Depends(get_db)):
    _check_project(db, project_id)

    manifest = build_manifest(
        version=data.version,
        target_bastion_type=data.target_bastion_type,
        target_bastion_id=data.target_bastion_id,
    )
    sig = sign_manifest(manifest)
    verified = verify_signature(manifest, sig)

    pack = BehaviorPack(
        id=manifest["id"],
        project_id=project_id,
        version=data.version,
        manifest=manifest,
        signature=sig,
        status="created",
    )
    db.add(pack)
    db.commit()

    return AssembleResponse(pack_id=manifest["id"], manifest=manifest, signature=sig, verified=verified)


@router.get("/projects/{project_id}/packs")
def api_list_packs(project_id: str, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    packs = db.query(BehaviorPack).filter(BehaviorPack.project_id == project_id).all()
    return [
        {"id": p.id, "version": p.version, "status": p.status, "created_at": p.created_at.isoformat()}
        for p in packs
    ]
