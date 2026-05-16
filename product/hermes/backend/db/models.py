import datetime
from typing import Optional

from sqlalchemy import String, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.connection import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    requirements: Mapped[list["Requirement"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    goals: Mapped[list["Goal"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    mind_maps: Mapped[list["MindMap"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    flow_charts: Mapped[list["FlowChart"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    behavior_packs: Mapped[list["BehaviorPack"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    text: Mapped[str] = mapped_column(Text)
    structured_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    project: Mapped["Project"] = relationship(back_populates="requirements")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    parent_id: Mapped[Optional[str]] = mapped_column(ForeignKey("goals.id"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    order: Mapped[int] = mapped_column(default=0)

    project: Mapped["Project"] = relationship(back_populates="goals")
    children: Mapped[list["Goal"]] = relationship()


class MindMap(Base):
    __tablename__ = "mind_maps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String(200))
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    project: Mapped["Project"] = relationship(back_populates="mind_maps")


class FlowChart(Base):
    __tablename__ = "flow_charts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String(200))
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    project: Mapped["Project"] = relationship(back_populates="flow_charts")


class BehaviorPack(Base):
    __tablename__ = "behavior_packs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    version: Mapped[str] = mapped_column(String(20))
    manifest: Mapped[dict] = mapped_column(JSON)
    signature: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="created")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    project: Mapped["Project"] = relationship(back_populates="behavior_packs")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
