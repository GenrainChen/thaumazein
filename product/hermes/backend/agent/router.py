import json

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from backend.deps import get_db
from backend.db.models import Project
from backend.agent.schemas import ChatRequest, ChatMessageRead
from backend.agent.service import save_message, list_messages, build_context
from backend.agent.llm_client import chat_sync, chat_stream

router = APIRouter()


def _check_project(db: Session, project_id: str):
    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(404, "Project not found")


@router.post("/projects/{project_id}/chat", response_model=ChatMessageRead)
def api_chat(project_id: str, data: ChatRequest, db: Session = Depends(get_db)):
    _check_project(db, project_id)

    save_message(db, project_id, "user", data.message)
    history = list_messages(db, project_id)
    context = build_context(db, project_id)

    messages = [{"role": "user", "content": f"Design context:\n{context}"}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    reply = chat_sync(messages)
    return save_message(db, project_id, "assistant", reply)


@router.get("/projects/{project_id}/messages", response_model=list[ChatMessageRead])
def api_list_messages(project_id: str, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    return list_messages(db, project_id)


@router.websocket("/ws/projects/{project_id}/chat")
async def ws_chat(websocket: WebSocket, project_id: str):
    await websocket.accept()

    db_gen = get_db()
    db = next(db_gen)
    try:
        if not db.query(Project).filter(Project.id == project_id).first():
            await websocket.send_json({"error": "Project not found"})
            await websocket.close()
            return

        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            user_msg = data.get("message", "")
            if not user_msg:
                continue

            save_message(db, project_id, "user", user_msg)
            context = build_context(db, project_id)
            history = list_messages(db, project_id)

            messages = [{"role": "user", "content": f"Design context:\n{context}"}]
            for msg in history:
                messages.append({"role": msg.role, "content": msg.content})

            full_reply = ""
            async for chunk in chat_stream(messages):
                full_reply += chunk
                await websocket.send_json({"chunk": chunk})

            save_message(db, project_id, "assistant", full_reply)
            await websocket.send_json({"done": True})
    except WebSocketDisconnect:
        pass
    finally:
        next(db_gen, None)
