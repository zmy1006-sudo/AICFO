/**
 * 发票OCR识别页面
 * 支持拍照/相册选择，模拟OCR识别结果
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface InvoiceResult {
  type: string;
  invoiceNo: string;
  date: string;
  buyer: string;
  seller: string;
  amountExclTax: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

const MOCK_INVOICE: InvoiceResult = {
  type: '增值税普通发票',
  invoiceNo: '12345678',
  date: '2026-03-25',
  buyer: '北京云起科技有限公司',
  seller: '京东电商平台',
  amountExclTax: 2680.0,
  taxRate: 1,
  taxAmount: 26.8,
  totalAmount: 2706.8,
};

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

type Step = 'idle' | 'scanning' | 'success' | 'error';

export default function InvoiceOCR() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('idle');

  function handleScan() {
    setStep('scanning');
    setTimeout(() => {
      setStep('success');
    }, 1500);
  }

  function handleGallery() {
    setStep('scanning');
    setTimeout(() => {
      setStep('success');
    }, 1500);
  }

  function handleGenerateVoucher() {
    navigate('/chat');
    // 通过URL参数传递信息
    setTimeout(() => {
      const msg = '付了京东货款2680元';
      // 使用自定义事件通知Chat页面
      window.dispatchEvent(new CustomEvent('aicfo-ocr-voucher', { detail: { text: msg } }));
    }, 300);
  }

  function handleRetry() {
    setStep('idle');
  }

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
            {/* 扫描框示意 */}
            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-[#F0F9F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera size={36} className="text-[#07C160]" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">对准发票拍照</p>
              <p className="text-xs text-gray-400">请确保发票文字清晰，光线充足</p>

              {/* 扫描框 */}
              <div className="relative mt-6 mx-auto" style={{ width: 240, height: 160 }}>
                <div className="absolute inset-0 border-2 border-[#07C160] rounded-xl opacity-50" />
                {/* 四角 */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#07C160] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#07C160] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#07C160] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#07C160] rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-[#07C160] font-medium opacity-70">将发票放入框内</p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
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

            {/* 提示 */}
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

        {/* 识别成功 */}
        {step === 'success' && (
          <div className="space-y-4">
            {/* 成功提示 */}
            <div className="flex items-center gap-2 bg-[#F0F9F0] rounded-xl px-4 py-3">
              <CheckCircle2 size={18} className="text-[#07C160]" />
              <span className="text-sm text-[#07C160] font-medium">识别成功！</span>
              <span className="text-sm text-gray-400">发票信息已提取</span>
            </div>

            {/* 发票卡片 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* 发票类型标签 */}
              <div className="bg-[#07C160] px-4 py-2.5 flex items-center justify-between">
                <span className="text-white text-sm font-medium">{MOCK_INVOICE.type}</span>
                <span className="text-white/70 text-xs">{MOCK_INVOICE.invoiceNo}</span>
              </div>

              {/* 基本信息 */}
              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-400">开票日期</span>
                  <span className="text-sm text-gray-800 font-medium">{MOCK_INVOICE.date}</span>
                </div>
                <div className="flex items-start justify-between px-4 py-3">
                  <span className="text-sm text-gray-400 shrink-0">购买方</span>
                  <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{MOCK_INVOICE.buyer}</span>
                </div>
                <div className="flex items-start justify-between px-4 py-3">
                  <span className="text-sm text-gray-400 shrink-0">销售方</span>
                  <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{MOCK_INVOICE.seller}</span>
                </div>
              </div>

              {/* 金额明细 */}
              <div className="bg-[#F7F7F7] px-4 py-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">不含税金额</p>
                    <p className="text-sm font-bold text-gray-800">¥{fmt(MOCK_INVOICE.amountExclTax)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">税率</p>
                    <p className="text-sm font-bold text-gray-800">{MOCK_INVOICE.taxRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">税额</p>
                    <p className="text-sm font-bold text-red-500">¥{fmt(MOCK_INVOICE.taxAmount)}</p>
                  </div>
                </div>
              </div>

              {/* 价税合计 */}
              <div className="flex items-center justify-between px-4 py-4 bg-[#07C160]">
                <span className="text-white/80 text-sm">价税合计</span>
                <span className="text-white text-xl font-bold">¥{fmt(MOCK_INVOICE.totalAmount)}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-500 text-sm font-medium bg-white rounded-xl border border-red-100 active:scale-95 transition-transform"
              >
                <XCircle size={16} />
                识别失败
              </button>
              <button
                onClick={handleGenerateVoucher}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-white text-sm font-medium bg-[#07C160] rounded-xl active:scale-95 transition-transform"
              >
                生成凭证
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 识别失败 */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <XCircle size={40} className="text-red-400" />
            </div>
            <p className="text-base font-medium text-gray-800 mb-1">识别失败</p>
            <p className="text-sm text-gray-400 mb-6 text-center px-8">
              未能识别发票内容，请重新拍照或上传清晰的发票照片
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-[#07C160] text-white text-sm font-medium px-6 py-2.5 rounded-full active:scale-95 transition-transform"
            >
              <Camera size={16} />
              重新识别
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
