import datetime
from typing import Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectRead(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class ProjectStatus(ProjectRead):
    requirement_count: int = 0
    goal_count: int = 0
    has_mind_map: bool = False
    has_flow_chart: bool = False
    behavior_pack_count: int = 0
