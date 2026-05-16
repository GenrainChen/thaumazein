import json
import uuid
import logging

from sqlalchemy.orm import Session

from backend.config import ZHIPU_API_KEY, ZHIPU_MODEL
from backend.db.models import Requirement, Goal
from backend.intent.schemas import GoalCreateItem

logger = logging.getLogger(__name__)

PARSE_SYSTEM_PROMPT = """你是 Thaumazein 系统的需求分析助手。用户会用自然语言描述一个感知-操作系统的需求。
你的任务是将需求解析为结构化的目标树。

请严格按以下 JSON 格式返回，不要包含其他内容：
[
  {
    "text": "目标描述",
    "children": [
      { "text": "子目标描述", "children": [] }
    ]
  }
]

要求：
- 每个目标应该是一个明确的、可验证的陈述
- 层级分解要合理，通常 2-3 层
- 目标应覆盖功能需求和安全需求"""


def create_requirement(db: Session, project_id: str, text: str) -> Requirement:
    req = Requirement(id=str(uuid.uuid4()), project_id=project_id, text=text, status="draft")
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def list_requirements(db: Session, project_id: str) -> list[Requirement]:
    return db.query(Requirement).filter(Requirement.project_id == project_id).all()


def parse_requirement_with_ai(text: str) -> list[GoalCreateItem]:
    if not ZHIPU_API_KEY:
        return _fallback_parse(text)

    try:
        from zhipuai import ZhipuAI
        client = ZhipuAI(api_key=ZHIPU_API_KEY)
        response = client.chat.completions.create(
            model=ZHIPU_MODEL,
            messages=[
                {"role": "system", "content": PARSE_SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            temperature=0.3,
        )
        content = response.choices[0].message.content.strip()
        content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        items = json.loads(content)
        return [GoalCreateItem(**item) for item in items]
    except Exception:
        logger.exception("AI parse failed, using fallback")
        return _fallback_parse(text)


def _fallback_parse(text: str) -> list[GoalCreateItem]:
    return [GoalCreateItem(text=text)]


def save_goals(db: Session, project_id: str, items: list[GoalCreateItem], parent_id: str | None = None) -> list[Goal]:
    goals = []
    for i, item in enumerate(items):
        goal = Goal(
            id=str(uuid.uuid4()),
            project_id=project_id,
            parent_id=parent_id,
            text=item.text,
            status="pending",
            order=i,
        )
        db.add(goal)
        db.flush()
        goals.append(goal)
        if item.children:
            children = save_goals(db, project_id, item.children, goal.id)
            goals.extend(children)
    db.commit()
    return goals


def list_goals(db: Session, project_id: str) -> list[Goal]:
    return db.query(Goal).filter(Goal.project_id == project_id).order_by(Goal.order).all()
