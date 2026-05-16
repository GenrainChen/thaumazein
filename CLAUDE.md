# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**设计阶段，无可执行代码。** 没有 build/test/lint 命令，没有依赖安装步骤。所有当前工作产物为 `docs/` 下的设计文档。创建代码时需遵循 `docs/详细设计/模块设计.md` 中的完整目录结构。

## Project Overview

Thaumazein — 三层架构智能感知-操作系统。核心原则是**下载式智能**：Hermes 创造所有智能，Bastion 执行智能产物，Terminal 转换物理信号。

- **Hermes（高层）**— 唯一具备智能创造能力的节点。AI 只存在于 Hermes
- **Bastion（中间层+高层）**— "包工头"，执行 Hermes 下发的行为包，有执行自主性但无创造自主性。四种物理形态：Ground / Aerial / Submarine / Extreme
- **Terminal（底层）**— 纯信号转换节点，无智能，仅含传感器和操作器两类产品

通信拓扑：`Hermes ←→ Bastion (Hub) ←→ Terminal (Node)`，双向数据流通。

## Core Architecture

```
product/
├── hermes/       # 高层：intent/ model/ agent/ dashboard/
├── bastion/      # 中间层+高层：physics/ codes/(hal, engine, system, bridge)
└── terminal/     # 底层：sensor/ operator/ common/(power, bootstrap — 无 ai_core)
```

### 核心概念

**行为包（Behavior Pack）** — Hermes 将验证过的控制律、推理模型、安全规则打包为自包含、版本化的部署单元，部署到 Bastion 本地执行。包含 manifest、models、pipelines、control_laws、safety_rules、schedules、fallback。

**三级控制时序：**
- 硬实时（100Hz-10kHz）：Bastion 本地执行（电机 PID、传感器采样）
- 软实时（1Hz-100Hz）：Bastion 本地执行（路径规划、传感器融合）
- 非实时（<1Hz）：Hermes 在线智能（任务规划、系统重构）

**AI 四阶段：** 设计态（Hermes 创造）→ 部署态（打包下发）→ 执行态（Bastion 确定性执行）→ 反馈态（Bastion 采集经验，Hermes 吸收）

**降级梯次：** Hermes 不可达时，Bastion 按预设梯次响应——链路降级 → 链路丢失 → 长期中断。所有降级程序由 Hermes 编写并打包下发。

## Hard Constraints

1. **Bastion 不可自创控制策略、修改行为包参数、改变运营目标。** 有执行自主性，但没有创造自主性。
2. **设计与实现一一对应：** 系统设计中的每一个元素都必须对应到一个物理实体或代码程序。没有悬浮的设计文档，也没有脱离设计的实现代码。四因框架提供检查维度——形式因→代码结构、质料因→硬件/数据、动力因→可执行程序、目的因→验证手段。任何一项无法对应，则设计不可交付。
3. **Terminal 的 common/ 仅含 power/ 和 bootstrap/，禁止添加 ai_core/ 或任何智能模块。**
4. **所有安全规则由 Hermes 设计并打包下发。** Bastion 的 safety/ 引擎强制执行但不能修改规则。安全规则在架构上独立于控制执行。

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

阅读路线：`docs/README.md` → 方法论 → 架构设计 → 详细设计（7 份，无严格先后） → 技术探索（参考）。

- `docs/方法论.md` — 四因说认识论重构、AI 语言模块角色定位与思维-实在映射框架
- `docs/架构设计.md` — 三层架构骨架、产品线定义、通信接口、多节点拓扑、执行自主性边界
- `docs/详细设计/` — 详细设计文档目录
  - `模块设计.md` — 三大产品线模块划分、完整目录结构、行为包生命周期
  - `AI融合架构.md` — AI 四阶段能力边界、知识流细节、Hermes AI 内部架构
  - `通信设计.md` — 通信协议、帧格式、数据模型（manifest schema、遥测格式、帧格式）
  - `技术选型.md` — 各项技术选型的依据与适用场景
  - `功能安全设计.md` — 功能安全（Safety）、降级梯次、安全规则类型、故障分类
  - `信息安全架构.md` — 信息安全（Security）、认证、加密、威胁模型、固件安全
  - `星际接口.md` — 预留设计，当前不实现
- `docs/技术探索/` — 独立研究报告，支撑方法论概念论述，非工程规格

## Language

文档使用中文。代码注释和提交信息可中英混合，保持语义清晰。

## Design Philosophy

四因说作为认知框架（非本体论）——四因是人类认识世界、改造世界的基本思维模式：形式因（概念抽象，根本）→ 质料因（空间维度分化）→ 动力因（时间维度分化）→ 目的因（人的选择；安全目的是强制底线，其余可选；决定验证路径）。AI 是人类的语言模块，核心能力是翻译（意图→代码）和搜索（设计空间寻优）。Thaumazein 的职能是映射：将四因设计落实到程序（Hermes），再落实到物理实体（Bastion）。设计原则：形式因优先、拥抱抽象化、目的因自觉、简约惊奇、思维到实在的映射。
