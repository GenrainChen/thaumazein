import logging
from typing import AsyncGenerator

from backend.config import ZHIPU_API_KEY, ZHIPU_MODEL

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """你是 Thaumazein 系统的 AI 设计助手。Thaumazein 是三层智能感知-操作系统：
- Hermes（高层）：你所在的位置，负责创造所有智能
- Bastion（中间层）：执行行为包，有执行自主性但无创造自主性
- Terminal（底层）：纯信号转换，无智能

你可以帮助用户：
1. 理解和结构化系统需求
2. 设计系统架构（思维导图）
3. 设计流程和控制逻辑（流程图）
4. 生成行为包内容（控制律、安全规则等）
5. 审查安全规则的完整性

当前项目的设计数据（如有）会随消息一起提供。请基于这些上下文给出建议。"""


def get_client():
    if not ZHIPU_API_KEY:
        return None
    from zhipuai import ZhipuAI
    return ZhipuAI(api_key=ZHIPU_API_KEY)


def chat_sync(messages: list[dict]) -> str:
    client = get_client()
    if not client:
        return "[AI not configured] Set ZHIPU_API_KEY environment variable."

    response = client.chat.completions.create(
        model=ZHIPU_MODEL,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, *messages],
        temperature=0.7,
    )
    return response.choices[0].message.content


async def chat_stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    client = get_client()
    if not client:
        yield "[AI not configured] Set ZHIPU_API_KEY environment variable."
        return

    response = client.chat.completions.create(
        model=ZHIPU_MODEL,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, *messages],
        temperature=0.7,
        stream=True,
    )
    for chunk in response:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
