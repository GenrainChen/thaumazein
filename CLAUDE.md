# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thaumazein — 三层架构智能感知-操作系统，核心原则是"下载式智能"：**Hermes 创造所有智能，Bastion 执行智能产物，Terminal 转换物理信号。** 项目当前处于设计阶段，尚无可执行代码。

- **Hermes（高层）**— 唯一具备智能创造能力的节点。AI 只存在于 Hermes
- **Bastion（中间层+高层）**— "包工头"，执行 Hermes 下发的行为包，具备四种物理形态（Ground/Aerial/Submarine/Extreme）
- **Terminal（底层）**— 纯信号转换节点，无智能，仅含传感器和操作器两类产品

通信拓扑：`Hermes ←→ Bastion (Hub) ←→ Terminal (Node)`，双向数据流通。

## Architecture

```
product/
├── hermes/       # 高层：intent/ model/ agent/ dashboard/
├── bastion/      # 中间层+高层：physics/ codes/(hal,engine,system,bridge)
└── terminal/     # 底层：sensor/ operator/ common/
```

### 核心概念

**行为包（Behavior Pack）** — Hermes 将验证过的控制律、推理模型、安全规则打包为自包含、版本化的部署单元，部署到 Bastion 本地执行。包含 manifest、models、pipelines、control_laws、safety_rules、schedules、fallback。

**三级控制时序：**
- 硬实时（100Hz-10kHz）：Bastion 本地执行（电机 PID、传感器采样）
- 软实时（1Hz-100Hz）：Bastion 本地执行（路径规划、传感器融合）
- 非实时（<1Hz）：Hermes 在线智能（任务规划、系统重构）

**AI 四阶段：** 设计态（Hermes 创造）→ 部署态（打包下发）→ 执行态（Bastion 确定性执行）→ 反馈态（Bastion 采集经验，Hermes 吸收）

**降级梯次：** Hermes 不可达时，Bastion 按预设梯次响应——链路降级 → 链路丢失 → 长期中断。所有降级程序由 Hermes 编写并打包下发。

**Bastion 关键约束：** 有执行自主性，但没有创造自主性。不可自创控制策略、修改行为包参数、改变运营目标。

## Code Creation Rules

创建代码时必须遵循 `docs/详细设计/模块设计.md` 中的目录结构：

- **Hermes** `product/hermes/`：intent/（requirement/、goal/）、model/（architecture/、interface/、simulation/、behavior_design/）、agent/（designer/、generator/、knowledge/、safety_auditor/）、dashboard/（monitor/、analytics/、deployment/）
- **Bastion** `product/bastion/`：physics/（cad、cae、produce）、codes/hal/（sensor_driver、actuator_driver、comm）、codes/engine/（model_exec、signal_proc、control_exec、behavior_pack、safety）、codes/system/（task、config、update、fallback）、codes/bridge/（sync、protocol、pack_deploy、telemetry）
- **Terminal** `product/terminal/`：sensor/（firmware、driver、protocol）、operator/（firmware、driver、protocol）、common/（仅 power/ 和 bootstrap/，**无 ai_core/**）

## Tech Stack

| 层次 | 推荐方向 |
|---|---|
| Hermes 框架 | Electron / Tauri / Web |
| Hermes AI | Claude API / 本地大模型 |
| Bastion 引擎 | ONNX Runtime / TensorRT / TFLite |
| Bastion HAL | C / 汇编 / Rust |
| Terminal 固件 | C/C++ / Rust |
| 通信协议 | MQTT / gRPC / 自定义二进制 |
| 建模语言 | SysML / 自定义 DSL |

## Documentation Structure

- `docs/方法论.md` — 四因说认识论重构与 MBSE 融合框架
- `docs/架构设计.md` — 三层架构骨架、产品线定义、通信接口
- `docs/详细设计/` — 详细设计文档目录
  - `模块设计.md` — 三大产品线模块划分与完整目录结构
  - `AI融合架构.md` — AI 四阶段模型与知识流
  - `通信设计.md` — 通信架构细节
  - `技术选型.md` — 技术选型指引
  - `故障与安全.md` — 安全原则、降级梯次、节点故障处理
  - `星际接口.md` — 预留设计，当前不实现

## Language

文档使用中文。代码注释和提交信息可中英混合，保持语义清晰。

## Design Philosophy

四因说作为认知框架（非本体论）：形式因（概念抽象）→ 质料因（空间抽象）→ 动力因（时间对质料的抽象）→ 目的因（人的选择，可选）。设计原则：形式因优先、拥抱抽象化、目的因自觉、四因正交、简约惊奇。
