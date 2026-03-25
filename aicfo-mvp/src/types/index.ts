// ==================== 基础类型 ====================

/** 纳税类型 */
export type TaxType = '一般纳税人' | '小规模纳税人';

/** 凭证状态 */
export type VoucherStatus = '草稿' | '待审核' | '已入账' | '已作废';

/** 借贷方向 */
export type Direction = '借' | '贷';

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 提醒级别 */
export type AlertLevel = '紧急' | '警告' | '提示';

/** 凭证分录 */
export interface VoucherItem {
  id: string;
  voucherId: string;
  direction: Direction;
  accountName: string; // 科目名称
  amount: number;
}

// ==================== 业务类型 ====================

/** 企业信息 */
export interface Enterprise {
  id: string;
  creditCode: string; // 统一社会信用代码
  name: string;
  taxType: TaxType;
  registeredAddress: string;
  registeredCapital: string;
}

/** 用户信息 */
export interface User {
  id: string;
  enterpriseId: string;
  openid: string;
  name: string;
  phone: string;
}

/** 凭证 */
export interface Voucher {
  id: string;
  enterpriseId: string;
  voucherNo: string; // 凭证编号
  date: string; // YYYY-MM-DD
  summary: string; // 摘要
  status: VoucherStatus;
  amount: number;
  items: VoucherItem[];
  creator: string;
  reviewer?: string;
  createdAt: string;
  updatedAt: string;
}

/** 对话会话 */
export interface ChatSession {
  id: string;
  enterpriseId: string;
  createdAt: string;
}

/** 对话消息 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  attachments?: string[];
  createdAt: string;
  confidence?: number; // AI回复置信度
  voucherDraft?: VoucherDraft; // AI生成的凭证草稿
}

/** AI凭证草稿（Mock生成） */
export interface VoucherDraft {
  summary: string;
  amount: number;
  items: Array<{
    direction: Direction;
    accountName: string;
    amount: number;
  }>;
  confidence: number; // 0-1
  needEscalation: boolean; // 是否需要转人工
  escalationReason?: string;
}

/** 报税日历项 */
export interface TaxCalendarItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  level: AlertLevel;
  description: string;
  deadline: string; // YYYY-MM-DD
}

// ==================== Mock规则引擎 ====================

/** 解析结果 */
export interface ParseResult {
  success: boolean;
  draft?: VoucherDraft;
  needOption?: boolean; // 需要用户选择
  options?: Array<{ label: string; value: string; draft: VoucherDraft }>;
  errorMsg?: string;
}
