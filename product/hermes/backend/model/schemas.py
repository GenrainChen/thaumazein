import datetime
from typing import Optional

from pydantic import BaseModel


class MindMapData(BaseModel):
    nodes: list["MindMapNode"]
    edges: list["MindMapEdge"]


class MindMapNode(BaseModel):
    id: str
    label: str
    type: str  # bastion, terminal-sensor, terminal-operator, subsystem
    x: float = 0
    y: float = 0
    properties: dict = {}


class MindMapEdge(BaseModel):
    source: str
    target: str
    label: str = ""


class FlowChartData(BaseModel):
    nodes: list["FlowChartNode"]
    edges: list["FlowChartEdge"]


class FlowChartNode(BaseModel):
    id: str
    type: str  # process, decision, input, output
    data: dict = {}
    position: dict = {}  # { x, y }


class FlowChartEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None


class MindMapSave(BaseModel):
    name: str = "Untitled Mind Map"
    data: MindMapData


class FlowChartSave(BaseModel):
    name: str = "Untitled Flow Chart"
    data: FlowChartData


class MindMapRead(BaseModel):
    id: str
    project_id: str
    name: str
    data: dict
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class FlowChartRead(BaseModel):
    id: str
    project_id: str
    name: str
    data: dict
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}
