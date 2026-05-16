import datetime
from typing import Optional

from pydantic import BaseModel


class RequirementCreate(BaseModel):
    text: str


class RequirementRead(BaseModel):
    id: str
    project_id: str
    text: str
    structured_data: Optional[dict]
    status: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class GoalRead(BaseModel):
    id: str
    project_id: str
    parent_id: Optional[str]
    text: str
    status: str
    order: int

    model_config = {"from_attributes": True}


class ParseRequest(BaseModel):
    text: str


class GoalCreateItem(BaseModel):
    text: str
    children: list["GoalCreateItem"] = []


class ParseResponse(BaseModel):
    goals: list[GoalCreateItem]
