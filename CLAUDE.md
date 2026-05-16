# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Hermes 产品线已进入实现阶段（`product/hermes/`），含 FastAPI 后端和 React/Vite 前端。Bastion 和 Terminal 仍为设计阶段。设计文档在 `docs/` 下，是实现的规格依据。

## Development Commands

### Hermes Backend (Python 3.12+)

```bash
cd product/hermes
python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

环境变量：`ZHIPU_API_KEY`（AI 功能）、`HERMES_HOST`/`HERMES_PORT`（默认 127.0.0.1:8000）。SQLite 数据库自动创建在 `data/hermes.db`。

### Hermes Frontend (React 19 + Vite 8 + TypeScript 6)

```bash
cd product/hermes/frontend
npm install
npm run dev        # dev server at localhost:5173
npm run build      # tsc + vite build
npm run lint       # eslint
```

前端通过 `/api` 前缀代理到后端。依赖：Tailwind CSS 4、React Router 7、@xyflow/react（思维导图/流程图）、Zustand。

## Project Overview

Thaumazein — 三层架构智能感知-操作系统。核心原则是**下载式智能**：Hermes 创造所有智能，Bastion 执行智能产物，Terminal 转换物理信号。

通信拓扑：`Hermes ←→ Bastion (Hub) ←→ Terminal (Node)`，双向数据流通。

## Code Architecture

### Hermes Backend (`product/hermes/backend/`)

```
backend/
├── main.py              # FastAPI app, lifespan, CORS, router registration
├── config.py            # paths, env vars (ZHIPU_API_KEY, model, host/port)
├── deps.py              # get_db() dependency injection
├── db/
│   ├── connection.py    # SQLAlchemy engine + session (SQLite)
│   └── models.py        # ORM models: Project, Requirement, Goal, MindMap, FlowChart, BehaviorPack, ChatMessage
├── intent/              # router.py, service.py, schemas.py — 需求录入、AI 解析、目标管理
├── model/               # router.py, service.py, schemas.py, behavior_pack.py — 思维导图、流程图、行为包构建与签名
├── agent/               # router.py, service.py, schemas.py, llm_client.py — AI 设计助手聊天（智谱 API）
└── dashboard/           # router.py, service.py, schemas.py — 项目概览
```

每个模块遵循 `router → service → db` 分层。API 路径：`/api/{module}`。行为包使用 Ed25519 签名。

### Hermes Frontend (`product/hermes/frontend/src/`)

```
src/
├── App.tsx              # BrowserRouter, routes: /, /intent, /model, /agent
├── main.tsx
├── api/
│   ├── client.ts        # 基础 fetch wrapper (get/post/del → /api/*)
│   ├── intent.ts        # 需求与目标 API
│   ├── model.ts         # 思维导图与流程图 API
│   ├── agent.ts         # AI 聊天 API
│   └── dashboard.ts     # 项目概览 API
├── intent/              # IntentPage, RequirementCapture
├── model/               # ModelPage, MindMap (@xyflow/react), FlowChart, BehaviorPackView
├── agent/               # AgentPage, ChatPanel
├── dashboard/           # Overview
└── shared/              # Layout, types
```

### Design Docs (`docs/`)

阅读路线：`docs/README.md` → 方法论 → 架构设计 → 详细设计（7 份） → 技术探索。

关键文档：
- `docs/架构设计.md` — 三层架构骨架、通信接口、执行自主性边界
- `docs/详细设计/模块设计.md` — 完整目录结构（hermes/bastion/terminal）
- `docs/详细设计/AI融合架构.md` — AI 四阶段、知识流
- `docs/详细设计/通信设计.md` — 协议、帧格式、manifest schema
- `docs/详细设计/功能安全设计.md` — 降级梯次、安全规则、故障分类
- `docs/详细设计/信息安全架构.md` — 认证、加密、威胁模型

## Core Concepts

**行为包（Behavior Pack）** — Hermes 将验证过的控制律、推理模型、安全规则打包为自包含、版本化的部署单元，部署到 Bastion 本地执行。

**三级控制时序：** 硬实时（100Hz-10kHz, Bastion 本地）→ 软实时（1Hz-100Hz, Bastion 本地）→ 非实时（<1Hz, Hermes 在线）。

**AI 四阶段：** 设计态 → 部署态 → 执行态 → 反馈态。

**降级梯次：** 链路降级 → 链路丢失 → 长期中断。所有降级程序由 Hermes 编写并下发。

## Hard Constraints

1. **Bastion 不可自创控制策略、修改行为包参数、改变运营目标。** 有执行自主性，没有创造自主性。
2. **设计与实现一一对应：** 系统设计中的每个元素必须对应到物理实体或代码程序。四因框架提供检查维度。
3. **Terminal 的 common/ 仅含 power/ 和 bootstrap/，禁止添加 ai_core/ 或任何智能模块。**
4. **所有安全规则由 Hermes 设计并打包下发。** Bastion 强制执行但不能修改。

## Language

文档使用中文。代码注释和提交信息可中英混合，保持语义清晰。

## Design Philosophy

四因说作为认知框架（非本体论）——形式因（概念抽象）→ 质料因（空间维度）→ 动力因（时间维度）→ 目的因（人的选择）。AI 是人类的语言模块，核心能力是翻译和搜索。设计原则：形式因优先、拥抱抽象化、目的因自觉、简约惊奇、思维到实在的映射。
