# AI 融合架构

## 四阶段模型

```
设计态（Hermes）──行为包──→ 部署态（Hermes → Bastion）
                                    │
                                    ▼
反馈态（Hermes ← Bastion）←──执行态（Bastion 本地运行）
```

- **设计态**：Hermes 的 AI 创造控制律、推理模型、安全规则等智能产物
- **部署态**：Hermes 将验证过的产物打包为行为包，下发给 Bastion
- **执行态**：Bastion 的程序执行引擎加载行为包，确定性运行
- **反馈态**：Bastion 采集遥测和经验数据上报 Hermes，Hermes 吸收后优化未来设计

AI 只存在于 Hermes。传到 Bastion 的不是 AI，而是 AI 的产物。

## 知识流

```
设计态（Hermes）──模型/策略/行为包──→ 执行态（Bastion）
执行态（Bastion）──遥测/经验数据──→ 设计态（Hermes）
设计态 ←──知识沉淀──→ 知识库
```
