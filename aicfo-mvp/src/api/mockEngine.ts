/**
 * Mock规则引擎
 * 将用户自然语言输入转换为凭证草稿
 * 暂不接真实AI API，用规则匹配演示核心流程
 */

import type { VoucherDraft, ParseResult, Direction } from '../types';

// 科目白名单
const ACCOUNT_WHITELIST = [
  '银行存款',
  '应收账款',
  '主营业务收入',
  '销售费用',
  '应付职工薪酬',
  '管理费用',
  '固定资产',
];

/**
 * 从文本中提取金额（支持中文万/元）
 */
function extractAmount(text: string): number | null {
  // 匹配 "3万"、"2680"、"2万元" 等
  const wanMatch = text.match(/(\d+(?:\.\d+)?)\s*万\s*(?:元)?/);
  if (wanMatch) return parseFloat(wanMatch[1]) * 10000;

  const yuanMatch = text.match(/(\d+(?:\.\d+)?)\s*元/);
  if (yuanMatch) return parseFloat(yuanMatch[1]);

  const plainMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (plainMatch) return parseFloat(plainMatch[1]);

  return null;
}

/**
 * 提取交易对象/事由
 */
function extractSubject(text: string): string {
  return text
    .replace(/\d+(?:\.\d+)?\s*万\s*(?:元)?/g, '')
    .replace(/\d+(?:\.\d+)?\s*元/g, '')
    .replace(/收了|付了|发了|转账|转了|公户转私人|公转私/g, '')
    .trim() || '未知';
}

// ==================== 规则匹配 ====================

interface Rule {
  patterns: RegExp[];
  buildDraft: (subject: string, amount: number) => VoucherDraft;
}

const RULES: Rule[] = [
  // 收入规则：收了XX设计费/服务费/咨询费
  {
    patterns: [/收了.*费/, /收到.*款/, /收入/, /入账/],
    buildDraft: (subject, amount) => ({
      summary: `收到${subject}款项`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '应收账款', amount },
        { direction: '贷' as Direction, accountName: '主营业务收入', amount },
      ],
      confidence: 0.92,
      needEscalation: false,
    }),
  },
  // 支出规则：付了XX货款/费用
  {
    patterns: [/付了/, /支付/, /购买/, /采购/],
    buildDraft: (subject, amount) => ({
      summary: `支付${subject}费用`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '销售费用', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.88,
      needEscalation: false,
    }),
  },
  // 工资规则：发了工资
  {
    patterns: [/发工资/, /发.*工资/, /工资.*发/],
    buildDraft: (subject, amount) => ({
      summary: `发放职工薪酬`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '应付职工薪酬', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.95,
      needEscalation: false,
    }),
  },
  // 管理费用规则
  {
    patterns: [/房租|租金|物业|水电|办公/],
    buildDraft: (subject, amount) => ({
      summary: `支付${subject}费用`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '管理费用', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.90,
      needEscalation: false,
    }),
  },
  // 固定资产规则
  {
    patterns: [/购入.*设备|购买.*电脑|采购.*办公|买.*家具/],
    buildDraft: (subject, amount) => ({
      summary: `购入${subject}`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '固定资产', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.85,
      needEscalation: amount > 50000, // 大额需要确认
      escalationReason: amount > 50000 ? '金额较大，建议核实' : undefined,
    }),
  },
];

/**
 * 公户转私人 - 需要用户选择
 */
function handlePublicToPrivate(amount: number): ParseResult {
  const baseSubject = '公转私';
  const options = [
    {
      label: '借款',
      value: '借款',
      draft: {
        summary: `公户转私人-借款`,
        amount,
        items: [
          { direction: '借' as Direction, accountName: '应收账款', amount },
          { direction: '贷' as Direction, accountName: '银行存款', amount },
        ],
        confidence: 0.70,
        needEscalation: true,
        escalationReason: '公转私需明确性质，建议联系专家确认',
      },
    },
    {
      label: '分红',
      value: '分红',
      draft: {
        summary: `公户转私人-分红`,
        amount,
        items: [
          { direction: '借' as Direction, accountName: '利润分配', amount },
          { direction: '贷' as Direction, accountName: '银行存款', amount },
        ],
        confidence: 0.65,
        needEscalation: true,
        escalationReason: '分红涉及税务，建议联系专家确认',
      },
    },
    {
      label: '还款',
      value: '还款',
      draft: {
        summary: `公户转私人-还款`,
        amount,
        items: [
          { direction: '借' as Direction, accountName: '其他应付款', amount },
          { direction: '贷' as Direction, accountName: '银行存款', amount },
        ],
        confidence: 0.75,
        needEscalation: false,
      },
    },
  ];

  return {
    success: true,
    needOption: true,
    options,
  };
}

/**
 * 主解析函数
 */
export function parseUserInput(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, errorMsg: '请输入记账内容' };
  }

  // 公户转私人特殊处理
  if (/公户转私人|公转私/.test(trimmed)) {
    const amount = extractAmount(trimmed) ?? 0;
    return handlePublicToPrivate(amount);
  }

  // 提取金额
  const amount = extractAmount(trimmed);
  if (!amount || amount <= 0) {
    return { success: false, errorMsg: '未能识别金额，请明确金额（如"收了3万设计费"）' };
  }

  // 提取事由
  const subject = extractSubject(trimmed);

  // 遍历规则匹配
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(trimmed)) {
        const draft = rule.buildDraft(subject, amount);
        // 大额（>10万）触发专家转人工
        if (amount > 100000 && !draft.needEscalation) {
          draft.needEscalation = true;
          draft.escalationReason = '金额较大，建议专家审核';
        }
        return { success: true, draft };
      }
    }
  }

  // 无匹配规则，默认生成银行存款凭证
  const defaultDraft: VoucherDraft = {
    summary: subject ? `支付${subject}` : '其他收支',
    amount,
    items: [
      { direction: '借', accountName: '管理费用', amount },
      { direction: '贷', accountName: '银行存款', amount },
    ],
    confidence: 0.50,
    needEscalation: true,
    escalationReason: '未能精确识别业务类型，建议专家确认',
  };

  return { success: true, draft: defaultDraft };
}

/** 工具函数：生成唯一ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 工具函数：生成凭证编号 */
export function generateVoucherNo(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `记-${dateStr}-${seq}`;
}
