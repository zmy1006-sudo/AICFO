/**
 * DeepSeek API 接入模块
 * 接入方式：替换 mockEngine 中的 parseUserInput
 *
 * 使用方法：
 * 1. 从 https://platform.deepseek.com/ 获取 API Key
 * 2. 将 DEEPSEEK_API_KEY 替换为你的真实 Key
 * 3. 在 Chat.tsx 中引入 aiChat() 函数替代 Mock 逻辑
 */

import type { VoucherDraft, Direction, ParseResult } from '../types';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

// ==================== 凭证科目白名单 ====================
const ACCOUNT_WHITELIST = [
  { name: '银行存款', type: 'asset' },
  { name: '应收账款', type: 'asset' },
  { name: '其他应收款', type: 'asset' },
  { name: '固定资产', type: 'asset' },
  { name: '无形资产', type: 'asset' },
  { name: '应付账款', type: 'liability' },
  { name: '应付职工薪酬', type: 'liability' },
  { name: '应交税费', type: 'liability' },
  { name: '其他应付款', type: 'liability' },
  { name: '实收资本', type: 'equity' },
  { name: '利润分配', type: 'equity' },
  { name: '主营业务收入', type: 'revenue' },
  { name: '其他业务收入', type: 'revenue' },
  { name: '主营业务成本', type: 'cost' },
  { name: '销售费用', type: 'expense' },
  { name: '管理费用', type: 'expense' },
  { name: '财务费用', type: 'expense' },
];

// ==================== 系统提示词 ====================
const SYSTEM_PROMPT = `你是一名专业的AI财税助手，擅长将用户的自然语言描述转换为规范的会计凭证。

【工作流程】
1. 理解用户描述的业务内容
2. 判断是收入、支出、工资、还是其他类型
3. 生成规范的借贷分录

【科目使用规则】
- 收入类业务：借 应收账款/银行存款，贷 主营业务收入
- 支出类业务：借 销售费用/管理费用，贷 银行存款
- 工资类业务：借 应付职工薪酬，贷 银行存款
- 大额（>5万）需提醒用户核实

【输出格式（严格遵循JSON）】
{
  "summary": "凭证摘要（简洁明了）",
  "amount": 金额（数字）,
  "debit_account": "借方科目",
  "credit_account": "贷方科目",
  "confidence": 置信度（0-1之间）,
  "need_escalation": false或true,
  "escalation_reason": "转人工原因（如果没有则不填）"
}

【注意】
- 只输出JSON，不要输出其他文字
- 金额精确到分
- 无法理解时返回 {"success": false, "error": "原因"}`;

// ==================== DeepSeek API 调用 ====================
interface DeepSeekResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIServiceResult {
  summary: string;
  amount: number;
  debitAccount: string;
  creditAccount: string;
  confidence: number;
  needEscalation: boolean;
  escalationReason?: string;
}

/**
 * 调用 DeepSeek API 生成凭证
 */
export async function callDeepSeek(userInput: string): Promise<AIServiceResult> {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userInput },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API错误: ${response.status} - ${err}`);
  }

  const data: DeepSeekResponse = await response.json();
  const content = data.choices[0]?.message?.content || '{}';

  // 解析JSON响应
  try {
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || '记账业务',
      amount: parsed.amount || 0,
      debitAccount: parsed.debit_account || '管理费用',
      creditAccount: parsed.credit_account || '银行存款',
      confidence: parsed.confidence || 0.8,
      needEscalation: parsed.need_escalation || false,
      escalationReason: parsed.escalation_reason,
    };
  } catch {
    // JSON解析失败，返回兜底结果
    return {
      summary: userInput,
      amount: 0,
      debitAccount: '管理费用',
      creditAccount: '银行存款',
      confidence: 0.5,
      needEscalation: true,
      escalationReason: 'AI解析异常，已转人工处理',
    };
  }
}

/**
 * 将 DeepSeek 结果转换为 ParseResult（兼容现有代码）
 */
export function convertToParseResult(aiResult: AIServiceResult): ParseResult {
  if (!aiResult.amount) {
    return {
      success: false,
      errorMsg: '未能识别金额，请明确金额（如"收了3万设计费"）',
    };
  }

  const draft: VoucherDraft = {
    summary: aiResult.summary,
    amount: aiResult.amount,
    items: [
      { direction: '借' as Direction, accountName: aiResult.debitAccount, amount: aiResult.amount },
      { direction: '贷' as Direction, accountName: aiResult.creditAccount, amount: aiResult.amount },
    ],
    confidence: aiResult.confidence,
    needEscalation: aiResult.needEscalation,
    escalationReason: aiResult.escalationReason,
  };

  return { success: true, draft };
}

/**
 * 统一入口：AI记账（接入真实API或降级到Mock）
 */
export async function aiChat(userInput: string): Promise<ParseResult> {
  if (!DEEPSEEK_API_KEY) {
    console.warn('DeepSeek API Key未配置，降级到Mock模式');
    const { parseUserInput } = await import('./mockEngine');
    return parseUserInput(userInput);
  }

  try {
    const aiResult = await callDeepSeek(userInput);
    return convertToParseResult(aiResult);
  } catch (error) {
    console.error('DeepSeek API调用失败，降级到Mock：', error);
    const { parseUserInput } = await import('./mockEngine');
    return parseUserInput(userInput);
  }
}

/**
 * 计算Token用量（可用于展示给用户）
 */
export function estimateTokens(text: string): number {
  // 粗略估算：中文约1.5字符/token，英文约4字符/token
  return Math.ceil(text.length / 2);
}
