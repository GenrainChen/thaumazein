import datetime
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatMessageRead(BaseModel):
    id: str
    project_id: str
    role: str
    content: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}
