# AICFO API 接口文档 V1.0

> 文档版本：V1.0
> 更新日期：2026-03-25
> 状态：草稿（待 Coder 开发后更新）

---

## 目录

1. [概述](#1-概述)
2. [认证模块](#2-认证模块)
3. [企业模块](#3-企业模块)
4. [AI对话模块](#4-ai对话模块)
5. [凭证模块](#5-凭证模块)
6. [报税模块](#6-报税模块)
7. [合同模块](#7-合同模块)
8. [报表模块](#8-报表模块)
9. [通用错误码](#9-通用错误码)

---

## 1 概述

### 基础信息

| 项目 | 内容 |
|------|------|
| Base URL | https://api.aicfo.cn/api/v1 |
| 认证方式 | Bearer Token（登录后通过 Authorization 头传递） |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

### 通用请求头

| Header | 说明 | 必填 |
|--------|------|------|
| Authorization | Bearer {access_token} | 是（除登录接口外） |
| Content-Type | application/json | 是 |
| X-Request-ID | 请求唯一标识（UUID） | 否 |

### 通用响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，0=成功，非0=失败 |
| message | string | 状态描述 |
| data | object | 响应数据（成功时有值） |

---

## 2 认证模块

### 2.1 微信登录

**POST** `/api/v1/auth/login`

**描述**: 通过微信授权 code 换取用户身份 token，完成登录。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| code | string | body | 是 | 微信授权 code（有效期5分钟） |
| app_id | string | body | 否 | 小程序 AppID（默认使用 AICFO） |

**请求示例**

```json
{
  "code": "0711xXXX0000000000000000",
  "app_id": "wx1234567890abcdef"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200,
    "token_type": "Bearer",
    "user_id": "u_abc123456",
    "is_new_user": true,
    "enterprise_id": null
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 10001 | code 无效或已过期 |
| 10002 | 微信授权失败 |
| 10003 | 参数缺失 |

---

### 2.2 获取当前企业信息

**GET** `/api/v1/auth/enterprise`

**描述**: 获取当前登录用户所属企业的基本信息。

**请求参数**: 无

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "enterprise_id": "e_789xyz",
    "name": "北京示例科技有限公司",
    "credit_code": "91110108MA0XXXXXX",
    "legal_person": "张三",
    "registered_capital": "1000000",
    "registered_capital_unit": "元",
    "industry": "软件开发",
    "province": "北京市",
    "city": "北京市",
    "district": "海淀区",
    "address": "北京市海淀区中关村大街1号",
    "tax_type": "一般纳税人",
    "tax_rate": 0.13,
    "employee_count": "10人以下",
    "status": "active",
    "created_at": "2026-03-01T10:00:00Z",
    "setup_completed": true
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 20001 | 用户未绑定企业 |
| 20002 | 企业不存在 |

---

## 3 企业模块

### 3.1 冷启动初始化

**POST** `/api/v1/enterprise/init`

**描述**: 新用户首次使用，输入统一社会信用代码，完成企业冷启动初始化。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| credit_code | string | body | 是 | 统一社会信用代码（18位） |

**请求示例**

```json
{
  "credit_code": "91110108MA0XXXXXX"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "enterprise_id": "e_789xyz",
    "name": "北京示例科技有限公司",
    "credit_code": "91110108MA0XXXXXX",
    "status": "pending_auto_fill",
    "next_step": "auto_fill",
    "message": "企业创建成功，请完善企业信息"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 30001 | 信用代码格式错误 |
| 30002 | 信用代码已被其他账号绑定 |
| 30003 | 该企业已初始化完成 |

---

### 3.2 企查查API自动填充企业信息

**GET** `/api/v1/enterprise/auto-fill`

**描述**: 调用企查查API，根据已录入的信用代码自动填充企业详细信息。

**请求参数**: 无（企业ID从token中获取）

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "enterprise_id": "e_789xyz",
    "name": "北京示例科技有限公司",
    "credit_code": "91110108MA0XXXXXX",
    "legal_person": "张三",
    "registered_capital": "1000000",
    "registered_capital_unit": "元",
    "industry": "软件开发",
    "province": "北京市",
    "city": "北京市",
    "district": "海淀区",
    "address": "北京市海淀区中关村大街1号",
    "tax_type": "一般纳税人",
    "tax_rate": 0.13,
    "employee_count": "10人以下",
    "status": "active",
    "filled_fields": ["name", "legal_person", "registered_capital", "industry", "province", "city", "district", "address"],
    "auto_fill_source": "qichacha",
    "filled_at": "2026-03-25T10:30:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 40001 | 企业未初始化，请先调用 init 接口 |
| 40002 | 企查查API调用失败 |
| 40003 | 未查到该企业信息，请手动填写 |

---

### 3.3 数据导入

**POST** `/api/v1/enterprise/import`

**描述**: 导入Excel或银行流水文件，批量生成凭证草稿。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| file | File | body | 是 | 上传文件（支持 .xlsx, .xls, .csv） |
| file_type | string | body | 是 | 文件类型：excel 或 bank_statement |
| import_mode | string | body | 否 | 导入模式：merge（默认，合并）/ replace（覆盖） |

**请求示例（multipart/form-data）**

```
file: [Excel文件]
file_type: excel
import_mode: merge
```

**响应示例（处理中）**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": "task_import_001",
    "status": "processing",
    "total_rows": 150,
    "processed_rows": 0,
    "vouchers_generated": 0,
    "message": "导入任务已创建，正在处理中",
    "estimated_time_seconds": 30
  }
}
```

**响应示例（任务完成）**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": "task_import_001",
    "status": "completed",
    "total_rows": 150,
    "processed_rows": 150,
    "vouchers_generated": 148,
    "vouchers_failed": 2,
    "failed_rows": [
      {"row": 12, "reason": "日期格式错误"},
      {"row": 88, "reason": "金额字段为空"}
    ]
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 50001 | 文件格式不支持 |
| 50002 | 文件大小超限（最大50MB） |
| 50003 | 导入任务创建失败 |

---

## 4 AI对话模块

### 4.1 发送对话消息

**POST** `/api/v1/chat/send`

**描述**: 用户发送消息，与AI财税助手对话，支持自然语言记账、查询等功能。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| message | string | body | 是 | 用户发送的消息内容（最长1000字） |
| session_id | string | body | 否 | 会话ID，不传则创建新会话 |
| message_type | string | body | 否 | 消息类型：text（默认）/ voice / image |
| context | object | body | 否 | 附加上下文（如日期范围筛选） |

**请求示例**

```json
{
  "message": "12月15日，办公室购买打印纸花了500元",
  "session_id": "sess_abc123",
  "message_type": "text",
  "context": {"accounting_period": "2026-12"}
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message_id": "msg_xyz789",
    "session_id": "sess_abc123",
    "role": "assistant",
    "content": "好的，已为您生成凭证草稿！\n\n摘要: 办公用品-打印纸\n借方: 管理费用 - 500元\n贷方: 银行存款 - 500元\n日期: 2026-12-15\n\n如确认无误，请回复「确认生成」，我将自动入账。",
    "ai_action": "voucher_generated",
    "voucher_draft_id": "draft_001",
    "suggestions": ["确认生成", "修改金额", "取消"],
    "created_at": "2026-03-25T10:35:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 60001 | 消息内容为空 |
| 60002 | AI服务暂时不可用 |
| 60003 | 敏感信息检测未通过 |

---

### 4.2 获取对话历史

**GET** `/api/v1/chat/history`

**描述**: 获取当前会话或指定会话的历史消息列表。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| session_id | string | query | 否 | 会话ID，不传则返回最近会话列表 |
| page | int | query | 否 | 页码（默认1） |
| page_size | int | query | 否 | 每页条数（默认20，最大100） |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessions": [
      {
        "session_id": "sess_abc123",
        "title": "12月记账",
        "message_count": 8,
        "last_message_at": "2026-03-25T10:40:00Z",
        "created_at": "2026-03-25T09:00:00Z"
      }
    ],
    "messages": [
      {
        "message_id": "msg_001",
        "role": "user",
        "content": "12月15日，办公室购买打印纸花了500元",
        "created_at": "2026-03-25T10:35:00Z"
      },
      {
        "message_id": "msg_002",
        "role": "assistant",
        "content": "好的，已为您生成凭证草稿！",
        "ai_action": "voucher_generated",
        "voucher_draft_id": "draft_001",
        "created_at": "2026-03-25T10:35:01Z"
      }
    ],
    "pagination": {"page": 1, "page_size": 20, "total": 8, "total_pages": 1}
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 70001 | 会话不存在 |
| 70002 | 无权访问该会话 |

---

### 4.3 AI生成凭证草稿

**POST** `/api/v1/voucher/generate`

**描述**: 基于自然语言描述或原始单据，AI自动生成凭证草稿。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| description | string | body | 否 | 业务描述（如"支付12月房租3000元"） |
| image_url | string | body | 否 | 发票/单据图片URL |
| image_base64 | string | body | 否 | 发票/单据图片Base64 |
| voucher_date | string | body | 否 | 凭证日期（YYYY-MM-DD，不填则默认当天） |

**请求示例**

```json
{
  "description": "支付12月办公室房租3000元",
  "voucher_date": "2026-12-01"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "draft_id": "draft_xyz456",
    "status": "draft",
    "date": "2026-12-01",
    "summary": "支付办公室房租",
    "entries": [
      {"id": "entry_01", "type": "debit", "account_code": "6602", "account_name": "管理费用-房租", "amount": 3000.00, "direction": "借"},
      {"id": "entry_02", "type": "credit", "account_code": "1002", "account_name": "银行存款", "amount": 3000.00, "direction": "贷"}
    ],
    "attachments": [],
    "attachments_count": 0,
    "ai_confidence": 0.95,
    "ai_suggestions": ["建议附上租金发票"],
    "created_at": "2026-03-25T10:40:00Z",
    "expires_at": "2026-03-25T23:59:59Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 80001 | 描述内容无法解析为有效凭证 |
| 80002 | 图片识别失败 |
| 80003 | 草稿生成超出当日限额（免费版10条/日） |

---

## 5 凭证模块

### 5.1 凭证列表

**GET** `/api/v1/vouchers`

**描述**: 获取凭证列表，支持分页、状态筛选、日期范围筛选。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| page | int | query | 否 | 页码（默认1） |
| page_size | int | query | 否 | 每页条数（默认20，最大100） |
| status | string | query | 否 | 状态：draft / confirmed / voided |
| start_date | string | query | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | query | 否 | 结束日期（YYYY-MM-DD） |
| keyword | string | query | 否 | 关键词（搜索摘要） |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "vch_001",
        "voucher_no": "记-0001",
        "date": "2026-12-01",
        "summary": "支付办公室房租",
        "total_amount": 3000.00,
        "status": "confirmed",
        "confirmed_at": "2026-03-25T11:00:00Z",
        "confirmed_by": "u_abc123",
        "entries_count": 2,
        "attachments_count": 0,
        "source": "ai_generated",
        "created_at": "2026-03-25T10:40:00Z"
      },
      {
        "id": "vch_002",
        "voucher_no": "记-0002",
        "date": "2026-12-15",
        "summary": "办公用品-打印纸",
        "total_amount": 500.00,
        "status": "draft",
        "confirmed_at": null,
        "confirmed_by": null,
        "entries_count": 2,
        "attachments_count": 0,
        "source": "ai_generated",
        "created_at": "2026-03-25T10:35:00Z"
      }
    ],
    "pagination": {"page": 1, "page_size": 20, "total": 2, "total_pages": 1},
    "summary": {"total_count": 2, "draft_count": 1, "confirmed_count": 1, "voided_count": 0, "total_amount": 3500.00}
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 90001 | 参数格式错误 |
| 90002 | 日期范围超限（最多查询1年） |

---

### 5.2 凭证详情

**GET** `/api/v1/vouchers/:id`

**描述**: 获取指定凭证的完整信息。

**路径参数**

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 凭证ID |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "vch_001",
    "voucher_no": "记-0001",
    "date": "2026-12-01",
    "period": "2026-12",
    "summary": "支付办公室房租",
    "status": "confirmed",
    "confirmed_at": "2026-03-25T11:00:00Z",
    "confirmed_by": "u_abc123",
    "voided_at": null,
    "voided_by": null,
    "void_reason": null,
    "entries": [
      {"id": "entry_01", "type": "debit", "account_code": "6602", "account_name": "管理费用-房租", "amount": 3000.00, "direction": "借", "auxiliary_accounting": []},
      {"id": "entry_02", "type": "credit", "account_code": "1002", "account_name": "银行存款", "amount": 3000.00, "direction": "贷", "auxiliary_accounting": []}
    ],
    "attachments": [],
    "source": "ai_generated",
    "chat_session_id": "sess_abc123",
    "ai_confidence": 0.95,
    "created_at": "2026-03-25T10:40:00Z",
    "updated_at": "2026-03-25T11:00:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 100001 | 凭证不存在 |
| 100002 | 无权查看该凭证 |

---

### 5.3 创建凭证

**POST** `/api/v1/vouchers`

**描述**: 手动创建一条新凭证。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| date | string | body | 是 | 凭证日期（YYYY-MM-DD） |
| summary | string | body | 是 | 摘要（最长200字） |
| entries | array | body | 是 | 分录列表（至少2条） |
| entries[].type | string | body | 是 | 类型：debit（借）/ credit（贷） |
| entries[].account_code | string | body | 是 | 科目编码 |
| entries[].account_name | string | body | 是 | 科目名称 |
| entries[].amount | number | body | 是 | 金额（大于0） |
| entries[].auxiliary_accounting | array | body | 否 | 辅助核算 |
| attachments | array | body | 否 | 附件列表 |

**请求示例**

```json
{
  "date": "2026-12-01",
  "summary": "支付办公室房租",
  "entries": [
    {"type": "debit", "account_code": "6602", "account_name": "管理费用-房租", "amount": 3000.00, "auxiliary_accounting": []},
    {"type": "credit", "account_code": "1002", "account_name": "银行存款", "amount": 3000.00, "auxiliary_accounting": []}
  ],
  "attachments": []
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "vch_003",
    "voucher_no": "记-0003",
    "date": "2026-12-01",
    "summary": "支付办公室房租",
    "status": "draft",
    "entries": [
      {"id": "entry_01", "type": "debit", "account_code": "6602", "account_name": "管理费用-房租", "amount": 3000.00, "direction": "借"},
      {"id": "entry_02", "type": "credit", "account_code": "1002", "account_name": "银行存款", "amount": 3000.00, "direction": "贷"}
    ],
    "created_at": "2026-03-25T11:10:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 110001 | 借贷不平衡 |
| 110002 | 科目不存在或已禁用 |
| 110003 | 必填参数缺失 |

---

### 5.4 修改凭证

**PUT** `/api/v1/vouchers/:id`

**描述**: 修改已有凭证（仅限草稿状态）。

**路径参数**

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 凭证ID |

**请求参数**: 同创建凭证（所有字段均可修改）

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "vch_003",
    "voucher_no": "记-0003",
    "date": "2026-12-01",
    "summary": "支付办公室房租（年付）",
    "status": "draft",
    "updated_at": "2026-03-25T11:15:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 120001 | 凭证不存在 |
| 120002 | 凭证状态不允许修改（已确认或已作废） |
| 120003 | 借贷不平衡 |

---

### 5.5 确认入账

**POST** `/api/v1/vouchers/:id/confirm`

**描述**: 将草稿状态的凭证确认为正式入账凭证。

**路径参数**

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 凭证ID |

**请求参数**: 无

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "vch_001",
    "voucher_no": "记-0001",
    "status": "confirmed",
    "confirmed_at": "2026-03-25T11:00:00Z",
    "confirmed_by": "u_abc123",
    "message": "凭证已确认入账"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 130001 | 凭证不存在 |
| 130002 | 凭证状态不允许确认（已确认/已作废） |
| 130003 | 借贷不平衡，无法入账 |

---

### 5.6 作废凭证

**POST** `/api/v1/vouchers/:id/void`

**描述**: 将凭证作废（仅限已确认的凭证）。

**路径参数**

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 凭证ID |

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| reason | string | body | 是 | 作废原因（必填，10-200字） |

**请求示例**

```json
{
  "reason": "重复录入，需合并至记-001号凭证"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "vch_002",
    "voucher_no": "记-0002",
    "status": "voided",
    "voided_at": "2026-03-25T11:20:00Z",
    "voided_by": "u_abc123",
    "void_reason": "重复录入，需合并至记-001号凭证",
    "message": "凭证已作废"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 140001 | 凭证不存在 |
| 140002 | 凭证状态不允许作废（草稿/已作废） |
| 140003 | 作废原因格式错误 |

---

## 6 报税模块

### 6.1 获取税务日历

**GET** `/api/v1/tax/calendar`

**描述**: 获取当前税务年度的申报日历（按企业注册地）。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| year | int | query | 否 | 年份（默认当前年份） |
| province | string | query | 否 | 省份（默认取企业注册地） |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "year": 2026,
    "province": "北京市",
    "calendar": [
      {"tax_type": "增值税-月报", "period": "2026-01", "deadline": "2026-02-15", "days_left": 22, "status": "pending", "applicable_tax_type": "general"},
      {"tax_type": "企业所得税-季报", "period": "2026-Q1", "deadline": "2026-04-15", "days_left": 51, "status": "pending", "applicable_tax_type": "general"},
      {"tax_type": "企业所得税-年报", "period": "2025", "deadline": "2026-05-31", "days_left": 97, "status": "pending", "applicable_tax_type": "general"}
    ],
    "total_pending": 3,
    "total_overdue": 0
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 150001 | 省份格式错误 |
| 150002 | 企业未设置注册地 |

---

### 6.2 一键算税

**POST** `/api/v1/tax/calculate`

**描述**: 基于当前账务数据，一键计算本期应纳税额。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| tax_type | string | body | 是 | 税种：vat（增值税）/ income（企业所得税）/ individual（个人所得税） |
| period | string | body | 是 | 所属期（如 2026-01 或 2026-Q1） |

**请求示例**

```json
{
  "tax_type": "vat",
  "period": "2026-01"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tax_type": "增值税",
    "period": "2026-01",
    "taxable_amount": 85000.00,
    "tax_rate": 0.13,
    "input_tax": 8500.00,
    "output_tax": 11050.00,
    "taxable_amount_summary": {
      "sales_revenue": 100000.00,
      "tax_exempt_revenue": 0.00,
      "export_revenue": 0.00
    },
    "vat_payable": 2550.00,
    "urban_construction_tax": 178.50,
    "education_fee": 76.50,
    "local_education_fee": 51.00,
    "total_tax_payable": 2856.00,
    "calculated_at": "2026-03-25T10:50:00Z",
    "confidence": 0.98,
    "warnings": ["本期进项税额偏少，建议核查是否遗漏进项票"]
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 160001 | 税种参数错误 |
| 160002 | 所属期格式错误 |
| 160003 | 账务数据不足，无法计算 |
| 160004 | 企业性质未设置（需先完成冷启动） |

---

### 6.3 获取申报截止日

**GET** `/api/v1/tax/deadlines`

**描述**: 获取企业所有税种的申报截止日期列表。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| year | int | query | 否 | 年份（默认当前年份） |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "year": 2026,
    "deadlines": [
      {
        "tax_type": "增值税",
        "frequency": "月报",
        "periods": [
          {"period": "2026-01", "deadline": "2026-02-15"},
          {"period": "2026-02", "deadline": "2026-03-15"},
          {"period": "2026-03", "deadline": "2026-04-15"}
        ]
      },
      {
        "tax_type": "企业所得税",
        "frequency": "季报",
        "periods": [
          {"period": "2026-Q1", "deadline": "2026-04-15"},
          {"period": "2026-Q2", "deadline": "2026-07-15"},
          {"period": "2026-Q3", "deadline": "2026-10-15"},
          {"period": "2026-Q4", "deadline": "2027-01-15"}
        ]
      },
      {
        "tax_type": "个人所得税",
        "frequency": "月报",
        "periods": [{"period": "2026-01", "deadline": "2026-02-15"}]
      }
    ]
  }
}
```

---

### 6.4 合规预警列表

**GET** `/api/v1/tax/warnings`

**描述**: 获取当前企业的税务合规预警信息列表。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| status | string | query | 否 | 状态：pending / resolved / ignored |
| level | string | query | 否 | 级别：warning / danger |
| page | int | query | 否 | 页码（默认1） |
| page_size | int | query | 否 | 每页条数（默认20） |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "warn_001",
        "level": "danger",
        "type": "overdue_filing",
        "title": "增值税月报逾期",
        "description": "检测到2026年1月增值税申报已逾期7天，请尽快完成申报以免产生滞纳金。",
        "tax_type": "增值税",
        "period": "2026-01",
        "deadline": "2026-02-15",
        "overdue_days": 7,
        "penalty_estimate": 125.50,
        "status": "pending",
        "resolved_at": null,
        "resolved_by": null,
        "suggestions": ["立即登录电子税务局完成申报", "如有特殊原因可申请延期"],
        "created_at": "2026-02-22T00:00:00Z"
      },
      {
        "id": "warn_002",
        "level": "warning",
        "type": "missing_invoice",
        "title": "大额支出缺少发票",
        "description": "检测到2026年1月有3笔超过1000元的支出未关联发票，总金额5800元。",
        "tax_type": null,
        "period": "2026-01",
        "missing_amount": 5800.00,
        "missing_count": 3,
        "status": "pending",
        "resolved_at": null,
        "resolved_by": null,
        "suggestions": ["联系供应商补开发票", "发票需在认证期内完成勾选"],
        "created_at": "2026-02-20T10:00:00Z"
      }
    ],
    "pagination": {"page": 1, "page_size": 20, "total": 2, "total_pages": 1},
    "summary": {"total": 2, "danger": 1, "warning": 1, "pending": 2, "resolved": 0}
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 170001 | 参数格式错误 |

---

## 7 合同模块

### 7.1 合同列表

**GET** `/api/v1/contracts`

**描述**: 获取合同列表，支持分页和筛选。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| page | int | query | 否 | 页码（默认1） |
| page_size | int | query | 否 | 每页条数（默认20，最大100） |
| keyword | string | query | 否 | 关键词（搜索合同名称/对方名称） |
| status | string | query | 否 | 状态：active / expired / terminated |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "con_001",
        "contract_no": "HT-2026-001",
        "name": "办公室租赁合同",
        "counterparty": "北京某某物业有限公司",
        "contract_type": "租赁合同",
        "amount": 36000.00,
        "currency": "CNY",
        "sign_date": "2026-01-01",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "status": "active",
        "days_until_expiry": 281,
        "attachments_count": 2,
        "created_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {"page": 1, "page_size": 20, "total": 1, "total_pages": 1}
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 180001 | 参数格式错误 |

---

### 7.2 合同详情

**GET** `/api/v1/contracts/:id`

**描述**: 获取指定合同的完整信息。

**路径参数**

| 参数名 | 类型 | 说明
| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 合同ID |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "con_001",
    "contract_no": "HT-2026-001",
    "name": "办公室租赁合同",
    "counterparty": "北京某某物业有限公司",
    "contract_type": "租赁合同",
    "amount": 36000.00,
    "currency": "CNY",
    "sign_date": "2026-01-01",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "status": "active",
    "days_until_expiry": 281,
    "payment_terms": "按季度支付，每次9000元",
    "payment_schedule": [
      {"period": "Q1", "amount": 9000.00, "due_date": "2026-01-10", "status": "paid"},
      {"period": "Q2", "amount": 9000.00, "due_date": "2026-04-10", "status": "pending"},
      {"period": "Q3", "amount": 9000.00, "due_date": "2026-07-10", "status": "pending"},
      {"period": "Q4", "amount": 9000.00, "due_date": "2026-10-10", "status": "pending"}
    ],
    "attachments": [
      {"id": "att_001", "name": "租赁合同扫描件.pdf", "size": 1024000, "uploaded_at": "2026-01-01T00:00:00Z"}
    ],
    "remarks": "",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 190001 | 合同不存在 |
| 190002 | 无权访问该合同 |

---

### 7.3 创建合同

**POST** `/api/v1/contracts`

**描述**: 创建一条新合同记录。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| name | string | body | 是 | 合同名称 |
| contract_type | string | body | 是 | 合同类型 |
| counterparty | string | body | 是 | 对方名称 |
| amount | number | body | 是 | 合同金额 |
| currency | string | body | 否 | 币种（默认 CNY） |
| sign_date | string | body | 否 | 签订日期（YYYY-MM-DD） |
| start_date | string | body | 是 | 合同开始日期 |
| end_date | string | body | 是 | 合同结束日期 |
| payment_terms | string | body | 否 | 付款条款 |
| remarks | string | body | 否 | 备注 |

**请求示例**

```json
{
  "name": "办公室租赁合同",
  "contract_type": "租赁合同",
  "counterparty": "北京某某物业有限公司",
  "amount": 36000.00,
  "currency": "CNY",
  "sign_date": "2026-01-01",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "payment_terms": "按季度支付，每次9000元",
  "remarks": ""
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "con_002",
    "contract_no": "HT-2026-002",
    "name": "办公室租赁合同",
    "contract_type": "租赁合同",
    "counterparty": "北京某某物业有限公司",
    "amount": 36000.00,
    "currency": "CNY",
    "sign_date": "2026-01-01",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "status": "active",
    "created_at": "2026-03-25T11:30:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 200001 | 必填参数缺失 |
| 200002 | 合同日期逻辑错误（结束日期早于开始日期） |

---

### 7.4 更新合同

**PUT** `/api/v1/contracts/:id`

**描述**: 更新已有合同信息。

**路径参数**

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | string | 合同ID |

**请求参数**: 同创建合同（所有字段均可修改）

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "con_001",
    "contract_no": "HT-2026-001",
    "name": "办公室租赁合同（续签）",
    "contract_type": "租赁合同",
    "counterparty": "北京某某物业有限公司",
    "amount": 40000.00,
    "currency": "CNY",
    "sign_date": "2026-01-01",
    "start_date": "2027-01-01",
    "end_date": "2027-12-31",
    "status": "active",
    "updated_at": "2026-03-25T11:35:00Z"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 210001 | 合同不存在 |
| 210002 | 必填参数缺失 |

---

## 8 报表模块

### 8.1 资产负债表

**GET** `/api/v1/reports/balance`

**描述**: 获取指定期间的资产负债表。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| period | string | query | 是 | 报表期间（格式：YYYY-MM 或 YYYY-QN，如 2026-03 或 2026-Q1） |
| unit | string | query | 否 | 金额单位：元（默认）/ 千元 / 万元 |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "report_type": "资产负债表",
    "period": "2026-03",
    "enterprise_name": "北京示例科技有限公司",
    "unit": "元",
    "currency": "CNY",
    "generated_at": "2026-03-25T12:00:00Z",
    "assets": {
      "total": 500000.00,
      "current_assets": {
        "total": 300000.00,
        "items": [
          {"code": "1001", "name": "库存现金", "amount": 5000.00, "年初数": 3000.00},
          {"code": "1002", "name": "银行存款", "amount": 200000.00, "年初数": 150000.00},
          {"code": "1122", "name": "应收账款", "amount": 80000.00, "年初数": 60000.00},
          {"code": "1231", "name": "其他应收款", "amount": 15000.00, "年初数": 10000.00}
        ]
      },
      "non_current_assets": {
        "total": 200000.00,
        "items": [
          {"code": "1601", "name": "固定资产", "amount": 200000.00, "年初数": 220000.00}
        ]
      }
    },
    "liabilities": {
      "total": 150000.00,
      "current_liabilities": {
        "total": 100000.00,
        "items": [
          {"code": "2001", "name": "短期借款", "amount": 50000.00, "年初数": 50000.00},
          {"code": "2202", "name": "应付账款", "amount": 30000.00, "年初数": 20000.00},
          {"code": "2241", "name": "其他应付款", "amount": 20000.00, "年初数": 15000.00}
        ]
      },
      "non_current_liabilities": {
        "total": 50000.00,
        "items": [
          {"code": "2501", "name": "长期借款", "amount": 50000.00, "年初数": 60000.00}
        ]
      }
    },
    "equity": {
      "total": 350000.00,
      "items": [
        {"code": "4001", "name": "实收资本", "amount": 300000.00, "年初数": 300000.00},
        {"code": "4103", "name": "本年利润", "amount": 50000.00, "年初数": 0.00}
      ]
    },
    "balance_check": "balanced"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 220001 | 报表期间格式错误 |
| 220002 | 期间账务数据不完整，无法生成报表 |
| 220003 | 借贷不平衡，报表数据异常 |

---

### 8.2 利润表

**GET** `/api/v1/reports/income`

**描述**: 获取指定期间的利润表。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| period | string | query | 是 | 报表期间（格式：YYYY-MM 或 YYYY-QN） |
| unit | string | query | 否 | 金额单位：元（默认）/ 千元 / 万元 |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "report_type": "利润表",
    "period": "2026-03",
    "enterprise_name": "北京示例科技有限公司",
    "unit": "元",
    "currency": "CNY",
    "generated_at": "2026-03-25T12:00:00Z",
    "revenue": {
      "total": 150000.00,
      "items": [
        {"code": "6001", "name": "主营业务收入", "amount": 140000.00},
        {"code": "6051", "name": "其他业务收入", "amount": 10000.00}
      ]
    },
    "cost": {
      "total": 90000.00,
      "items": [
        {"code": "6401", "name": "主营业务成本", "amount": 80000.00},
        {"code": "6402", "name": "其他业务成本", "amount": 5000.00},
        {"code": "6403", "name": "营业税金及附加", "amount": 5000.00}
      ]
    },
    "expenses": {
      "total": 30000.00,
      "items": [
        {"code": "6602", "name": "销售费用", "amount": 5000.00},
        {"code": "6603", "name": "管理费用", "amount": 20000.00},
        {"code": "6604", "name": "财务费用", "amount": 5000.00}
      ]
    },
    "profit": {
      "operating_profit": 30000.00,
      "total_profit": 30000.00,
      "net_profit": 22500.00
    },
    "tax_adjustments": {
      "income_tax": 7500.00,
      "tax_rate": 0.25
    }
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 230001 | 报表期间格式错误 |
| 230002 | 期间账务数据不完整，无法生成报表 |

---

### 8.3 现金流量表

**GET** `/api/v1/reports/cashflow`

**描述**: 获取指定期间的现金流量表。

**请求参数**

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| period | string | query | 是 | 报表期间（格式：YYYY-MM 或 YYYY-QN） |
| unit | string | query | 否 | 金额单位：元（默认）/ 千元 / 万元 |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "report_type": "现金流量表",
    "period": "2026-03",
    "enterprise_name": "北京示例科技有限公司",
    "unit": "元",
    "currency": "CNY",
    "generated_at": "2026-03-25T12:00:00Z",
    "operating_activities": {
      "total_inflow": 160000.00,
      "total_outflow": 90000.00,
      "net_amount": 70000.00,
      "items": [
        {"code": "1001", "name": "销售商品、提供劳务收到的现金", "amount": 160000.00},
        {"code": "1002", "name": "购买商品、接受劳务支付的现金", "amount": 60000.00},
        {"code": "1003", "name": "支付给职工以及为职工支付的现金", "amount": 20000.00},
        {"code": "1004", "name": "支付的各项税费", "amount": 10000.00}
      ]
    },
    "investing_activities": {
      "total_inflow": 0.00,
      "total_outflow": 20000.00,
      "net_amount": -20000.00,
      "items": [
        {"code": "2001", "name": "购建固定资产、无形资产支付的现金", "amount": 20000.00}
      ]
    },
    "financing_activities": {
      "total_inflow": 0.00,
      "total_outflow": 10000.00,
      "net_amount": -10000.00,
      "items": [
        {"code": "3001", "name": "分配股利、利润或偿付利息支付的现金", "amount": 10000.00}
      ]
    },
    "summary": {
      "opening_balance": 130000.00,
      "closing_balance": 170000.00,
      "net_increase": 40000.00
    }
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| 240001 | 报表期间格式错误 |
| 240002 | 期间账务数据不完整，无法生成报表 |

---

## 9 通用错误码

以上各模块列出的错误码为模块级错误码，以下为全局通用错误码，在所有接口中均可能返回。

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1 | 系统内部错误 |
| 2 | 服务维护中 |
| 3 | 请求超时 |
| 4 | 接口版本不支持 |
| 5 | 签名验证失败 |
| 6 | 权限不足 |
| 7 | 请求过于频繁（触发限流） |
| 8 | 数据格式错误 |
| 99999 | 未知错误 |

---

*本文档为 V1.0 草稿版本，部分字段定义和响应示例将在 Coder 开发完成后根据实际实现进行更新。*
