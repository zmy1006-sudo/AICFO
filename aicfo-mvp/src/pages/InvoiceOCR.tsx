/**
 * 发票OCR识别页面
 * 支持拍照/相册选择，识别结果可编辑，生成凭证
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Loader2, CheckCircle2, XCircle, ArrowRight, Edit3, Save } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface InvoiceForm {
  type: string;
  invoiceNo: string;
  date: string;
  buyer: string;
  seller: string;
  amountExclTax: string;
  taxRate: string;
  taxAmount: string;
  totalAmount: string;
}

function calcTax(amount: string, rate: string): string {
  const a = parseFloat(amount) || 0;
  const r = parseFloat(rate) || 0;
  return (a * r / 100).toFixed(2);
}

function calcTotal(amount: string, tax: string): string {
  const a = parseFloat(amount) || 0;
  const t = parseFloat(tax) || 0;
  return (a + t).toFixed(2);
}

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

type Step = 'idle' | 'scanning' | 'result';

export default function InvoiceOCR() {
  const navigate = useNavigate();
  const { addInvoice, addMessage, enterprise } = useAppStore();

  const [step, setStep] = useState<Step>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<InvoiceForm>({
    type: '增值税普通发票',
    invoiceNo: '',
    date: new Date().toISOString().slice(0, 10),
    buyer: enterprise?.name || '',
    seller: '',
    amountExclTax: '',
    taxRate: '1',
    taxAmount: '',
    totalAmount: '',
  });

  function handleScan() {
    setStep('scanning');
    setTimeout(() => {
      const mockData: InvoiceForm = {
        type: '增值税普通发票',
        invoiceNo: `FP${Date.now().toString().slice(-8)}`,
        date: new Date().toISOString().slice(0, 10),
        buyer: enterprise?.name || '北京云起科技有限公司',
        seller: '京东电商平台',
        amountExclTax: '2680.00',
        taxRate: '1',
        taxAmount: '26.80',
        totalAmount: '2706.80',
      };
      setForm(mockData);
      setStep('result');
    }, 1500);
  }

  function handleGallery() {
    setStep('scanning');
    setTimeout(() => {
      const mockData: InvoiceForm = {
        type: '增值税普通发票',
        invoiceNo: `FP${Date.now().toString().slice(-8)}`,
        date: new Date().toISOString().slice(0, 10),
        buyer: enterprise?.name || '北京云起科技有限公司',
        seller: '天猫商城',
        amountExclTax: '1580.00',
        taxRate: '1',
        taxAmount: '15.80',
        totalAmount: '1595.80',
      };
      setForm(mockData);
      setStep('result');
    }, 1500);
  }

  function updateField(field: keyof InvoiceForm, value: string) {
    const newForm = { ...form, [field]: value };
    if (field === 'amountExclTax' || field === 'taxRate') {
      newForm.taxAmount = calcTax(newForm.amountExclTax, newForm.taxRate);
      newForm.totalAmount = calcTotal(newForm.amountExclTax, newForm.taxAmount);
    }
    setForm(newForm);
  }

  function handleSaveInvoice() {
    setIsSaving(true);
    const invoice = {
      type: form.type,
      invoiceNo: form.invoiceNo,
      date: form.date,
      buyer: form.buyer,
      seller: form.seller,
      amountExclTax: parseFloat(form.amountExclTax) || 0,
      taxRate: parseFloat(form.taxRate) || 0,
      taxAmount: parseFloat(form.taxAmount) || 0,
      totalAmount: parseFloat(form.totalAmount) || 0,
    };
    addInvoice(invoice);
    setIsSaving(false);
    alert('发票已保存到发票列表');
    setIsEditing(false);
  }

  function handleGenerateVoucher() {
    const amount = parseFloat(form.totalAmount) || 0;
    if (amount === 0) {
      alert('请先填写正确的金额');
      return;
    }
    addInvoice({
      type: form.type,
      invoiceNo: form.invoiceNo,
      date: form.date,
      buyer: form.buyer,
      seller: form.seller,
      amountExclTax: parseFloat(form.amountExclTax) || 0,
      taxRate: parseFloat(form.taxRate) || 0,
      taxAmount: parseFloat(form.taxAmount) || 0,
      totalAmount: parseFloat(form.totalAmount) || 0,
    });
    addMessage({
      sessionId: '',
      role: 'user',
      content: `付了${form.seller}${form.totalAmount}元货款，发票号${form.invoiceNo}`,
    });
    navigate('/chat');
  }

  function handleRetry() {
    setStep('idle');
    setForm({
      type: '增值税普通发票',
      invoiceNo: '',
      date: new Date().toISOString().slice(0, 10),
      buyer: enterprise?.name || '',
      seller: '',
      amountExclTax: '',
      taxRate: '1',
      taxAmount: '',
      totalAmount: '',
    });
    setIsEditing(false);
  }

  const taxRateOptions = ['0', '1', '3', '5', '6', '9', '13'];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 头部 */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Camera size={20} className="text-[#07C160]" />
          <h1 className="text-lg font-bold text-gray-900">发票识别</h1>
        </div>
        <p className="text-xs text-gray-400">拍照或上传发票，自动提取关键信息</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 扫描区 */}
        {step === 'idle' && (
          <>
            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-[#F0F9F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera size={36} className="text-[#07C160]" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">对准发票拍照</p>
              <p className="text-xs text-gray-400">请确保发票文字清晰，光线充足</p>

              <div className="relative mt-6 mx-auto" style={{ width: 240, height: 160 }}>
                <div className="absolute inset-0 border-2 border-[#07C160] rounded-xl opacity-50" />
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#07C160] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#07C160] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#07C160] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#07C160] rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-[#07C160] font-medium opacity-70">将发票放入框内</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleScan}
                className="flex flex-col items-center gap-2 bg-[#07C160] text-white rounded-2xl py-5 shadow-sm active:scale-95 transition-transform"
              >
                <Camera size={28} />
                <span className="text-sm font-medium">拍照识别</span>
              </button>
              <button
                onClick={handleGallery}
                className="flex flex-col items-center gap-2 bg-white text-gray-700 rounded-2xl py-5 border border-gray-200 shadow-sm active:scale-95 transition-transform"
              >
                <Image size={28} className="text-gray-400" />
                <span className="text-sm font-medium">从相册选择</span>
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
              <div className="text-blue-400 text-sm mt-0.5">💡</div>
              <div>
                <p className="text-xs text-blue-600 font-medium">支持发票类型</p>
                <p className="text-xs text-blue-400 mt-0.5">增值税专用发票 · 增值税普通发票 · 电子发票 · 通用机打发票</p>
              </div>
            </div>
          </>
        )}

        {/* 扫描中 */}
        {step === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#07C160]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#07C160] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera size={32} className="text-[#07C160]" />
              </div>
            </div>
            <p className="text-base font-medium text-gray-800 mb-1">正在识别发票...</p>
            <p className="text-sm text-gray-400">AI正在提取发票信息，请稍候</p>
          </div>
        )}

        {/* 识别结果 */}
        {step === 'result' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-[#F0F9F0] rounded-xl px-4 py-3">
              <CheckCircle2 size={18} className="text-[#07C160]" />
              <span className="text-sm text-[#07C160] font-medium">识别成功！</span>
              <span className="text-sm text-gray-400">请核对信息，如有错误可编辑</span>
            </div>

            {/* 发票卡片 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* 发票类型 */}
              <div className="bg-[#07C160] px-4 py-2.5 flex items-center justify-between">
                {isEditing ? (
                  <select
                    value={form.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="bg-transparent text-white text-sm border-none outline-none"
                  >
                    <option value="增值税普通发票" className="text-gray-800">增值税普通发票</option>
                    <option value="增值税专用发票" className="text-gray-800">增值税专用发票</option>
                    <option value="电子发票" className="text-gray-800">电子发票</option>
                  </select>
                ) : (
                  <span className="text-white text-sm font-medium">{form.type}</span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-white/80 hover:text-white"
                  >
                    <Edit3 size={16} />
                  </button>
                  <span className="text-white/70 text-xs">{form.invoiceNo}</span>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-400">开票日期</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="text-sm text-gray-800 border border-gray-200 rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-sm text-gray-800 font-medium">{form.date}</span>
                  )}
                </div>
                <div className="flex items-start justify-between px-4 py-3">
                  <span className="text-sm text-gray-400 shrink-0">购买方</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.buyer}
                      onChange={(e) => updateField('buyer', e.target.value)}
                      className="text-sm text-gray-800 border border-gray-200 rounded px-2 py-1 w-48 text-right"
                    />
                  ) : (
                    <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{form.buyer}</span>
                  )}
                </div>
                <div className="flex items-start justify-between px-4 py-3">
                  <span className="text-sm text-gray-400 shrink-0">销售方</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.seller}
                      onChange={(e) => updateField('seller', e.target.value)}
                      className="text-sm text-gray-800 border border-gray-200 rounded px-2 py-1 w-48 text-right"
                    />
                  ) : (
                    <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{form.seller}</span>
                  )}
                </div>
              </div>

              {/* 金额明细 */}
              <div className="bg-[#F7F7F7] px-4 py-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">不含税金额</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={form.amountExclTax}
                        onChange={(e) => updateField('amountExclTax', e.target.value)}
                        className="text-sm font-bold text-gray-800 border border-gray-200 rounded px-1 py-0.5 w-full text-center"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-800">¥{form.amountExclTax || '0.00'}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">税率</p>
                    {isEditing ? (
                      <select
                        value={form.taxRate}
                        onChange={(e) => updateField('taxRate', e.target.value)}
                        className="text-sm font-bold text-gray-800 border border-gray-200 rounded px-1 py-0.5 w-full text-center"
                      >
                        {taxRateOptions.map((r) => (
                          <option key={r} value={r} className="text-gray-800">{r}%</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-gray-800">{form.taxRate}%</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">税额</p>
                    <p className="text-sm font-bold text-red-500">¥{form.taxAmount || '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* 价税合计 */}
              <div className="flex items-center justify-between px-4 py-4 bg-[#07C160]">
                <span className="text-white/80 text-sm">价税合计</span>
                {isEditing ? (
                  <span className="text-white text-xl font-bold">¥{form.totalAmount || '0.00'}</span>
                ) : (
                  <span className="text-white text-xl font-bold">¥{form.totalAmount || '0.00'}</span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-gray-500 text-sm font-medium bg-white rounded-xl border border-gray-200 active:scale-95 transition-transform"
              >
                <XCircle size={16} />
                重新识别
              </button>
              {isEditing ? (
                <button
                  onClick={handleSaveInvoice}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-white text-sm font-medium bg-[#07C160] rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Save size={16} />
                  保存发票
                </button>
              ) : (
                <button
                  onClick={handleGenerateVoucher}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-white text-sm font-medium bg-[#07C160] rounded-xl active:scale-95 transition-transform"
                >
                  生成凭证
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleGenerateVoucher}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-[#07C160] text-sm font-medium bg-[#E8F5E9] rounded-xl active:scale-95 transition-transform"
              >
                保存发票并生成凭证
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
