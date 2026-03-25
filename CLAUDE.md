# AICFO 项目上下文

## 项目概述
- **名称**：AICFO — AI财税助手
- **类型**：微信小程序 → MVP先做H5网页版
- **一句话定位**：每个小老板都有一个深度AI CFO，"会说话就能管财税"
- **目标用户**：1-20人小微企业老板，手机重度依赖，不懂财税
- **核心交互**：AI Chat对话完成财税管理闭环
- **文档版本**：V1.0（PRD + 技术方案 + API文档 + 测试用例）

## 需求来源
- `/workspace/projects/aicfo/docs/AICFO_业务需求文档_V1.0.docx`（已解析）

## 团队成员
| 角色 | Agent | 状态 |
|------|-------|------|
| 总调度 | 一休 | ✅ |
| 🎨 设计小兵 | operator（原运营转型） | ✅ 已召唤 |
| 💻 Coder | coder | ✅ 已召唤 |
| ✍️ 文档工 | writer | ✅ 已召唤 |
| 🧪 测试员 | tester | ✅ 已召唤 |
| 📊 进度监工 | progress | ⏳ 监控中 |
| 🏗️ 架构师 | architect | ✅ 已完成 |

## Sub-Agent Session Keys
- aicfo-architect: `agent:architect:subagent:ef53e701-20a2-4669-ae30-9d26baaea467` ✅ done
- aicfo-designer: `agent:operator:subagent:afd204bf-6ebc-4f87-922d-0d75f04b0fa4` 🚀 running
- aicfo-coder: `agent:coder:subagent:d44ab72c-a815-4410-980a-9b6b47977a18` 🚀 running
- aicfo-writer: `agent:writer:subagent:34b103f1-65dc-4798-ac47-d93a294aa110` 🚀 running
- aicfo-tester: `agent:tester:subagent:372dbec0-e706-46d0-8d8c-18589709c6cd` 🚀 running

## 交付物清单
| 文档 | 状态 |
|------|------|
| PRD_AICFO_V1.0.md | ✅ |
| 技术方案_V1.0.md | ✅ |
| UI设计稿 design_v1.html | ✅ |
| 测试用例_V1.0.md | ✅ |
| 测试报告_V1.0.md | ✅ |
| aicfo-mvp/（代码） | ✅ |
| API文档_V1.0.md | ⏳ 文档工进行中 |
| 用户手册_V1.0.md | ⏳ 文档工进行中 |

## 部署URL（最新）
- **https://ahllk6ke1btj.space.minimaxi.com**（微信风格版 v2）
- 历史版本：https://c4u2svs8k1f9.space.minimaxi.com / https://9zzk6wor0fob.space.minimaxi.com / https://gj3wod1dwxtv.space.minimaxi.com

## Phase 3 开发中
- 💻 Coder：仪表盘改造 + 空状态 + 作废样式 + Profile完善

## 版本历史
| 日期 | 版本 | 主要内容 |
|------|------|---------|
| 2026-03-25 AM | v0.1 | 冷启动+AI记账+凭证+日历 MVP |
| 2026-03-25 PM v1 | v0.2 | Phase2: 快捷按钮+演示数据+一键算税 |
| 2026-03-25 PM v2 | v0.3 | 微信风格UI改造（配色+气泡+Tab） |
| 2026-03-25 PM v3 | v0.4 | Phase3: 仪表盘+空状态+Profile完善（进行中） |

## MVP一周范围
**做**：AI对话记账 + 冷启动 + 凭证管理 + 报税日历 + 专家转人工
**不做**：发票OCR、微信支付导入、旧系统迁移、实时财务报表

## 状态
- [x] 业务需求文档解析
- [x] PRD文档生成
- [x] 技术方案评审
- [x] 军团分工计划确认
- [ ] 设计稿（design_v1.html）
- [ ] 代码开发（aicfo-mvp/）
- [ ] API文档
- [ ] 用户手册
- [ ] 测试用例
- [ ] 冒烟测试
- [ ] 部署上线
