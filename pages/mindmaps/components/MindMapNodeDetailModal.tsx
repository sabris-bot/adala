import React from 'react';
import { 
  X, Briefcase, User, FileText, Calendar, Scale, ShieldAlert, 
  ExternalLink, Clock, Building2, Phone, Hash, DollarSign, 
  CheckCircle2, AlertCircle, FileCheck, Layers, ArrowRight, 
  Share2, Printer, Sparkles
} from 'lucide-react';
import { CustomNodeData, LinkedEntity } from '../types';
import { initialCases } from '../../../data/caseData';
import { mockAnalyzedContracts } from '../../../data/contractAnalysisData';
import { RiskLevel } from '../../../types';

interface MindMapNodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: CustomNodeData | null;
  nodeId: string | null;
  onNavigateToCase?: (caseId: string) => void;
  onNavigateToContract?: (contractId: string) => void;
}

export const MindMapNodeDetailModal: React.FC<MindMapNodeDetailModalProps> = ({
  isOpen,
  onClose,
  nodeData,
  nodeId,
  onNavigateToCase,
  onNavigateToContract
}) => {
  if (!isOpen || !nodeData) return null;

  const linked = nodeData.linkedEntity;

  // Resolve matching case or contract from system datasets
  const matchedCase = linked?.type === 'case' 
    ? initialCases.find(c => c.id === linked.id || c.caseNumber === linked.referenceNumber || c.title.includes(linked.name))
    : initialCases.find(c => c.title.includes(nodeData.label) || (c.caseNumber && nodeData.label.includes(c.caseNumber)));

  const matchedContract = linked?.type === 'contract'
    ? mockAnalyzedContracts.find(c => c.id === linked.id || c.referenceNumber === linked.referenceNumber || c.title.includes(linked.name))
    : mockAnalyzedContracts.find(c => c.title.includes(nodeData.label));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient bar */}
        <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-amber-50/40 dark:from-slate-900 dark:to-slate-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                {linked?.type === 'case' ? <Scale className="w-6 h-6" /> :
                 linked?.type === 'contract' ? <FileCheck className="w-6 h-6" /> :
                 linked?.type === 'client' ? <User className="w-6 h-6" /> :
                 linked?.type === 'hearing' ? <Calendar className="w-6 h-6" /> :
                 <Layers className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {linked?.type === 'case' ? 'قضية مرتبطة بالنظام' :
                     linked?.type === 'contract' ? 'عقد موثق ومدقق' :
                     linked?.type === 'client' ? 'بيانات عميل / خصم' :
                     linked?.type === 'hearing' ? 'جلسة قضائية مجدولة' :
                     'عقدة استراتيجية'}
                  </span>
                  {nodeData.legalArticle && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {nodeData.legalArticle}
                    </span>
                  )}
                  {nodeData.status && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      nodeData.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      nodeData.status === 'in_progress' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {nodeData.status === 'completed' ? 'مكتمل' :
                       nodeData.status === 'in_progress' ? 'قيد الإجراء' :
                       nodeData.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {nodeData.label}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Main Node Description */}
          {nodeData.content && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                تفاصيل وبيان العقدة القانونية
              </h4>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {nodeData.content}
              </p>
            </div>
          )}

          {/* If Linked to a Case */}
          {matchedCase && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-slate-800/90 dark:to-blue-950/20 border border-blue-200 dark:border-blue-800/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold">
                  <Scale className="w-5 h-5" />
                  <span>ملف القضية المسجل بالنظام</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-bold">
                  {matchedCase.caseNumber || 'COM-2026'}
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {matchedCase.title}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">الموكل والصفة</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {matchedCase.clientName} ({matchedCase.clientRole || 'مدعي'})
                  </span>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">الخصم</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {matchedCase.opposingPartyName || 'غير محدد'}
                  </span>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">المحكمة والدائرة</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {matchedCase.courtName} - {matchedCase.circuit || 'الدائرة الكلية'}
                  </span>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">الجلسة القادمة</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {matchedCase.nextHearingDate || 'لم تحدد بعد'}
                  </span>
                </div>
              </div>

              {matchedCase.financials && (
                <div className="flex items-center justify-between p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-blue-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">الأتعاب المقررة:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    إجمالي: {matchedCase.financials.totalFees} {matchedCase.financials.currency || 'د.ك'} | المدفوع: {matchedCase.financials.paid} | المتبقي: {matchedCase.financials.remaining}
                  </span>
                </div>
              )}

              {onNavigateToCase && (
                <button
                  onClick={() => onNavigateToCase(matchedCase.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>عرض ملف القضية الكامل والمستندات</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* If Linked to a Contract */}
          {matchedContract && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-slate-800/90 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                  <FileCheck className="w-5 h-5" />
                  <span>بيانات العقد وتدقيق المخاطر</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                  {matchedContract.referenceNumber}
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {matchedContract.title}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">الطرف الأول</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {matchedContract.parties?.firstParty}
                  </span>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">الطرف الثاني</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {matchedContract.parties?.secondParty}
                  </span>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">القيمة الإجمالية</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {matchedContract.financials?.value?.toLocaleString()} {matchedContract.financials?.currency || 'KWD'}
                  </span>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">مستوى المخاطرة</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {matchedContract.overallRisk === RiskLevel.LOW ? 'منخفضة ومأمونة' : 'متوسطة - تتطلب مراجعة'}
                  </span>
                </div>
              </div>

              {matchedContract.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-emerald-100 dark:border-slate-800 leading-relaxed">
                  {matchedContract.summary}
                </p>
              )}

              {onNavigateToContract && (
                <button
                  onClick={() => onNavigateToContract(matchedContract.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>عرض تقرير فحص العقد والبنود الذكية</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* If Linked to Client or other custom entity */}
          {linked && linked.type === 'client' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-slate-800/90 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                  <User className="w-5 h-5" />
                  <span>سجل العميل / الخصم المعتمد</span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold">
                  {linked.referenceNumber || 'موكل رئيسي'}
                </span>
              </div>
              <div className="text-base font-bold text-slate-800 dark:text-white">
                {linked.name}
              </div>
              {linked.subtitle && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {linked.subtitle}
                </div>
              )}
            </div>
          )}

          {/* Tags and Metadata */}
          {nodeData.tags && nodeData.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                الوسوم والتصنيفات
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {nodeData.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {nodeData.attachments && nodeData.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                المرفقات والوثائق ({nodeData.attachments.length})
              </h4>
              <div className="space-y-2">
                {nodeData.attachments.map(att => (
                  <div 
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{att.name}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0">{att.size || 'وثيقة PDF'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {nodeData.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold block mb-1">ملاحظة استراتيجية للمحامي:</span>
              {nodeData.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>نظام الربط الذكي المباشر بقواعد بيانات «عدالة»</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق الكارت
          </button>
        </div>
      </div>
    </div>
  );
};
