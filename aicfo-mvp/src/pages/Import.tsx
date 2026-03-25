/**
 * 数据迁移/导入页面
 * 支持Excel导入、用友/金蝶导出、银行流水导入
 */

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

type ImportSource = 'excel' | 'yonyou' | 'kingdee' | 'wechat' | 'alipay';
type ImportStep = 'select' | 'mapping' | 'preview' | 'complete';

const SOURCE_CONFIG: Record<ImportSource, { name: string; icon: string; desc: string }> = {
  excel: { name: 'Excel文件', icon: '📊', desc: '导入AICFO专用模板或其他Excel数据' },
  yonyou: { name: '用友U8', icon: '🏢', desc: '从用友U8标准格式导出' },
  kingdee: { name: '金蝶KIS', icon: '💼', desc: '从金蝶KIS标准格式导出' },
  wechat: { name: '微信支付', icon: '💚', desc: '授权拉取微信支付商家流水' },
  alipay: { name: '支付宝', icon: '💙', desc: '授权拉取支付宝商家流水' },
};

const TEMPLATE_FIELDS = [
  { label: '日期', key: 'date', required: true },
  { label: '凭证字号', key: 'voucherNo', required: false },
  { label: '摘要', key: 'summary', required: true },
  { label: '科目编码', key: 'accountCode', required: true },
  { label: '科目名称', key: 'accountName', required: true },
  { label: '借方金额', key: 'debitAmount', required: true },
  { label: '贷方金额', key: 'creditAmount', required: true },
];

const MOCK_IMPORT_RESULT = {
  totalRows: 25,
  successRows: 23,
  errorRows: 2,
  errors: [
    { row: 5, message: '日期格式错误，应为YYYY-MM-DD' },
    { row: 18, message: '借贷不平衡，借方¥100，贷方¥0' },
  ],
};

export default function Import() {
  const { addImportRecord, updateImportRecord, importRecords } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('select');
  const [source, setSource] = useState<ImportSource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<typeof MOCK_IMPORT_RESULT | null>(null);

  function handleSelectSource(src: ImportSource) {
    setSource(src);
    if (src === 'wechat' || src === 'alipay') {
      handleMockAuth(src);
    } else {
      setStep('mapping');
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStep('preview');
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setImportResult(MOCK_IMPORT_RESULT);
      }, 2000);
    }
  }

  async function handleMockAuth(src: ImportSource) {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    setStep('preview');
    setImportResult(MOCK_IMPORT_RESULT);
  }

  function handleConfirmImport() {
    if (!source || !importResult) return;
    const record = addImportRecord({
      source,
      fileName: selectedFile?.name || `${SOURCE_CONFIG[source].name}流水`,
      totalRows: importResult.totalRows,
      successRows: importResult.successRows,
      errorRows: importResult.errorRows,
      status: importResult.errorRows > 0 ? '部分失败' : '成功',
      errors: importResult.errors?.map((e) => `第${e.row}行：${e.message}`),
    });
    setStep('complete');
  }

  function downloadTemplate() {
    const csv = [
      TEMPLATE_FIELDS.map((f) => f.label).join(','),
      '2026-03-01,记-202603-001,收到XX公司设计费,1001,银行存款,30000,0',
      '2026-03-01,记-202603-001,收到XX公司设计费,4001,主营业务收入,0,30000',
      '2026-03-05,记-202603-002,支付京东货款,6001,销售费用,2680,0',
      '2026-03-05,记-202603-002,支付京东货款,1001,银行存款,0,2680',
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AICFO_凭证导入模板.csv';
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-[#07C160]" />
          <h1 className="text-lg font-bold text-gray-900">数据导入</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">从其他系统迁移财务数据</p>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {step === 'select' && (
          <>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">选择数据来源</h2>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(SOURCE_CONFIG) as ImportSource[]).map((src) => (
                  <button
                    key={src}
                    onClick={() => handleSelectSource(src)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#07C160] transition-colors"
                  >
                    <span className="text-2xl">{SOURCE_CONFIG[src].icon}</span>
                    <span className="text-sm font-medium text-gray-800">{SOURCE_CONFIG[src].name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800">模板下载</h2>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}
                >
                  <Download size={12} />
                  下载模板
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">使用AICFO标准模板，确保数据导入顺利</p>
              <div className="bg-gray-50 rounded-lg p-3">
                {TEMPLATE_FIELDS.map((field, i) => (
                  <div key={field.key} className="flex items-center gap-2 text-xs">
                    <span className="text-[#07C160]">{field.required ? '*' : '○'}</span>
                    <span className="text-gray-600">{field.label}</span>
                    <span className="text-gray-400">({field.key})</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'mapping' && source && source !== 'wechat' && source !== 'alipay' && (
          <>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">步骤1：上传文件</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#07C160] transition-colors"
              >
                <Upload size={32} className="text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-800">点击上传文件</p>
                  <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls, .csv 格式</p>
                </div>
              </button>
              {selectedFile && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FileSpreadsheet size={16} className="text-[#07C160]" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">步骤2：字段映射</h2>
              <p className="text-xs text-gray-500 mb-3">确认导入字段与系统字段的对应关系</p>
              <div className="space-y-2">
                {TEMPLATE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20">{field.label}</span>
                    <select className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm">
                      <option value={field.key}>自动匹配</option>
                      <option value="">不导入</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('preview')}
              className="w-full py-3 bg-[#07C160] text-white rounded-xl text-sm font-medium"
            >
              开始导入
            </button>

            <button
              onClick={() => { setStep('select'); setSource(null); }}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
            >
              返回上一步
            </button>
          </>
        )}

        {(step === 'preview' || step === 'mapping') && (source === 'wechat' || source === 'alipay') && (
          <>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="text-4xl">{SOURCE_CONFIG[source].icon}</div>
                <div className="text-center">
                  <p className="font-medium text-gray-800">正在授权获取{source === 'wechat' ? '微信支付' : '支付宝'}流水</p>
                  <p className="text-xs text-gray-400 mt-1">请在弹窗中完成授权</p>
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-[#07C160]">
                    <RefreshCw size={16} className="animate-spin" />
                    处理中...
                  </div>
                )}
              </div>
            </div>

            {!isProcessing && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-3">流水预览</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">2026-03-01 收入</span>
                    <span className="text-sm font-medium text-[#07C160]">+¥30,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">2026-03-05 支出</span>
                    <span className="text-sm font-medium text-red-500">-¥2,680</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">2026-03-15 支出</span>
                    <span className="text-sm font-medium text-red-500">-¥10,000</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">* 显示最近30天内流水</p>
              </div>
            )}
          </>
        )}

        {step === 'preview' && isProcessing && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#07C160]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#07C160] animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-800">正在导入数据...</p>
                <p className="text-xs text-gray-400 mt-1">请稍候，预计需要1-2分钟</p>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && !isProcessing && importResult && (
          <>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">导入结果</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-800">{importResult.totalRows}</p>
                  <p className="text-xs text-gray-500">总行数</p>
                </div>
                <div className="text-center p-3 bg-[#E8F5E9] rounded-xl">
                  <p className="text-2xl font-bold text-[#07C160]">{importResult.successRows}</p>
                  <p className="text-xs text-[#07C160]">成功</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-500">{importResult.errorRows}</p>
                  <p className="text-xs text-red-500">失败</p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">错误详情</h3>
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertCircle size={14} className="text-red-500 mt-0.5" />
                      <span className="text-xs text-red-600">第{err.row}行：{err.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmImport}
              className="w-full py-3 bg-[#07C160] text-white rounded-xl text-sm font-medium"
            >
              确认导入
            </button>
          </>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 size={48} className="text-[#07C160]" />
              <div className="text-center">
                <p className="font-semibold text-gray-800">导入完成</p>
                <p className="text-xs text-gray-400 mt-1">
                  成功导入 {importResult?.successRows} 条数据
                  {importResult?.errorRows ? `，${importResult.errorRows} 条失败` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => { setStep('select'); setSource(null); setSelectedFile(null); setImportResult(null); }}
              className="w-full py-3 bg-[#07C160] text-white rounded-xl text-sm font-medium mt-4"
            >
              继续导入
            </button>
          </div>
        )}

        {importRecords.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">导入历史</h2>
            <div className="space-y-2">
              {importRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    {record.status === '成功' && <CheckCircle2 size={14} className="text-[#07C160]" />}
                    {record.status === '部分失败' && <AlertCircle size={14} className="text-amber-500" />}
                    {record.status === '失败' && <XCircle size={14} className="text-red-500" />}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{SOURCE_CONFIG[record.source]?.name || record.source}</p>
                      <p className="text-xs text-gray-400">{record.createdAt.slice(0, 10)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-800">{record.successRows}/{record.totalRows}</p>
                    <p className="text-xs text-gray-400">成功</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
