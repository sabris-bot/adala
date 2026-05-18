import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalculatorIcon, 
  InformationCircleIcon, 
  GavelIcon, 
  PrinterIcon, 
  ScaleIcon, 
  PlusCircleIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BanknotesIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  CreditCardIcon,
  ChevronDownIcon
} from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';
import PrintHeader from '../components/ui/PrintHeader';
import { initialCases } from '../data/caseData';
import { CaseStatus, CasePriority, CaseMainType, LitigationStage, Case } from '../types';
import { legalFinancialService } from '../services/legalFinancialService';

// --- TYPES & DATA ---

export enum FeeStatus {
  PAID = 'مدفوع بالكامل',
  UNPAID = 'غير مدفوع',
  PARTIAL = 'مدفوع جزئياً',
  PENDING_REVIEW = 'بانتظار المراجعة',
  LATE = 'متأخر',
  EXEMPTED = 'معفى (قانوناً)'
}

export interface FeeCalculation {
  id: string;
  title: string;
  caseId?: string;
  caseNumber?: string;
  claimAmount: number;
  totalFee: number;
  proportionalFee: number;
  fixedFee: number;
  attorneyFees: number;
  expertFees: number;
  notificationFees: number;
  status: FeeStatus;
  date: string;
  notes?: string;
  category: string;
}

const KUWAIT_FEE_CATEGORIES = [
  { id: 'litigation', label: 'رسوم قيد الدعاوى والطعون' },
  { id: 'execution', label: 'رسوم التنفيذ والمزادات' },
  { id: 'labor', label: 'المنازعات العمالية (إعفاءات)' },
  { id: 'family', label: 'قضايا الأسرة والأحوال شخصية' },
  { id: 'notary', label: 'خدمات التوثيق وكاتب العدل' },
  { id: 'attorney', label: 'أتعاب المحاماة والخبراء' },
];

const KUWAIT_FEE_TYPES = [
  // Litigation
  { id: 'cv-known', label: 'دعوى معلومة القيمة (نسبي)', category: 'litigation', ref: 'مادة 6 مرافعات', isProportional: true },
  { id: 'cv-unknown', label: 'دعوى غير مقدرة القيمة', category: 'litigation', fixed: 100, ref: 'مادة 7 مرافعات' },
  { id: 'cv-performance', label: 'طلب أمر أداء', category: 'litigation', isProportional: true, ref: 'مادة 161 مرافعات' },
  { id: 'cv-appeal', label: 'استئناف (قيمة معلومة)', category: 'litigation', isProportional: true, ref: 'قانون الرسوم' },
  { id: 'cv-cassation', label: 'تمييز (رسم ثابت)', category: 'litigation', fixed: 100, ref: 'قانون التمييز' },

  // Execution
  { id: 'ex-dispute', label: 'إشكال في التنفيذ', category: 'execution', fixed: 150, ref: 'مادة 212 مرافعات' },
  { id: 'ex-sale', label: 'بيع عقار جبرياً (ثابت)', category: 'execution', fixed: 500, ref: 'قانون الرسوم' },
  { id: 'ex-notarize', label: 'إيداع محضر مزاد', category: 'execution', fixed: 50, ref: 'قانون الرسوم' },

  // Labor
  { id: 'lb-indemnity', label: 'مطالبة بمستحقات عمالية', category: 'labor', isExempt: true, ref: 'مادة 6 قانون العمل', note: 'يسري الإعفاء للعامل فقط في جميع درجات التقاضي' },
  
  // Notary
  { id: 'nt-poa', label: 'توكيل رسمي (قضايا)', category: 'notary', fixed: 12, ref: 'قانون التوثيق' },
  { id: 'nt-contract', label: 'تصديق توقيع على عقد', category: 'notary', fixed: 20, ref: 'قانون التوثيق' },
];

// --- COMPONENTS ---

export default function CourtFeesPage() {
  const { selectedJurisdiction } = useJurisdiction();
  
  // State
  const [activeTab, setActiveTab] = useState<'calculator' | 'saved' | 'insights'>('calculator');
  const [claimAmount, setClaimAmount] = useState(0);
  const [selectedFeeTypeId, setSelectedFeeTypeId] = useState(KUWAIT_FEE_TYPES[0].id);
  const [attorneyFeesRequested, setAttorneyFeesRequested] = useState(0);
  const [expertFeesRequested, setExpertFeesRequested] = useState(0);
  const [notificationCount, setNotificationCount] = useState(1);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [savedFees, setSavedFees] = useState<FeeCalculation[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedCase, setLinkedCase] = useState<Case | null>(null);
  const [notes, setNotes] = useState('');

  // Main Calculation
  useEffect(() => {
    const feeType = KUWAIT_FEE_TYPES.find(f => f.id === selectedFeeTypeId);
    if (!feeType) return;

    let stage: 'FIRST_INSTANCE' | 'APPEAL' | 'CASSATION' | 'EXECUTION' = 'FIRST_INSTANCE';
    if (selectedFeeTypeId.includes('appeal')) stage = 'APPEAL';
    if (selectedFeeTypeId.includes('cassation')) stage = 'CASSATION';
    if (selectedFeeTypeId.startsWith('ex')) stage = 'EXECUTION';

    let feeCalc = { proportionalFee: 0, fixedFee: 0, total: 0, ref: '' };
    
    if (feeType.isProportional) {
      feeCalc = legalFinancialService.calculateKuwaitCourtFee(claimAmount, stage);
    } else {
      feeCalc.fixedFee = feeType.fixed || 0;
      feeCalc.total = feeCalc.fixedFee;
    }
    
    if (feeType.isExempt) {
      feeCalc = { proportionalFee: 0, fixedFee: 0, total: 0, ref: 'مادة 6 قانون العمل (معفى)' };
    }

    const totalNotification = notificationCount * 5;
    const total = feeCalc.total + attorneyFeesRequested + expertFeesRequested + totalNotification;

    setCalculationResult({
      feeType: { ...feeType, ref: feeCalc.ref || feeType.ref },
      claimAmount,
      proportionalFee: feeCalc.proportionalFee,
      fixedFee: feeCalc.fixedFee,
      attorneyFees: attorneyFeesRequested,
      expertFees: expertFeesRequested,
      notificationFees: totalNotification,
      total,
      isExempt: feeType.isExempt
    });
  }, [claimAmount, selectedFeeTypeId, attorneyFeesRequested, expertFeesRequested, notificationCount]);

  const handleSaveFee = () => {
    if (!calculationResult) return;
    
    const newFee: FeeCalculation = {
      id: Math.random().toString(36).substr(2, 9),
      title: linkedCase ? `رسوم قضية: ${linkedCase.title}` : `حساب ${calculationResult.feeType.label}`,
      caseId: linkedCase?.id,
      caseNumber: linkedCase?.caseNumber,
      claimAmount: calculationResult.claimAmount,
      totalFee: calculationResult.totalFee,
      proportionalFee: calculationResult.proportionalFee,
      fixedFee: calculationResult.fixedFee,
      attorneyFees: calculationResult.attorneyFees,
      expertFees: calculationResult.expertFees,
      notificationFees: calculationResult.notificationFees,
      status: calculationResult.isExempt ? FeeStatus.EXEMPTED : FeeStatus.UNPAID,
      date: new Date().toISOString(),
      notes,
      category: calculationResult.feeType.category
    };

    setSavedFees([newFee, ...savedFees]);
    setActiveTab('saved');
    setNotes('');
    setLinkedCase(null);
  };

  const handleImportCase = (c: Case) => {
    setLinkedCase(c);
    setClaimAmount(c.budget || 0);
    setIsImportModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors duration-300 rtl" dir="rtl">
      <PrintHeader title="تقرير الرسوم والمصاريف القضائية" subtitle={selectedJurisdiction as unknown as string} />
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
            <BanknotesIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">حاسبة الرسوم القانونية</h1>
            <p className="text-slate-500 dark:text-slate-400">تقدير دقيق لرسوم التقاضي والتنفيذ وأتعاب الخبراء والمحاماة في الكويت</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 border-slate-200 dark:border-slate-800"
          >
            <PrinterIcon className="w-4 h-4" />
            طباعة التقرير
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6 shadow-md shadow-emerald-100 dark:shadow-none"
            onClick={() => setActiveTab('calculator')}
          >
            <PlusCircleIcon className="w-4 h-4" />
            حساب رسوم جديدة
          </Button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-fit print:hidden">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'calculator' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <CalculatorIcon className="w-4 h-4" />
          المحرك المالي
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'saved' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardDocumentListIcon className="w-4 h-4" />
          الرسوم المحفوظة
          {savedFees.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold mr-2">
              {savedFees.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'insights' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUpIcon className="w-4 h-4" />
          أمثلة وتقارير
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'calculator' && (
          <motion.div 
            key="calculator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Input Column */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <CalculatorIcon className="w-5 h-5 text-emerald-600" />
                  مدخلات الحساب المالي
                </h3>
                
                <div className="space-y-6 text-right">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نوع الإجراء / الرسوم</label>
                    <Select
                      value={selectedFeeTypeId}
                      onChange={(e) => setSelectedFeeTypeId(e.target.value)}
                      className="dark:bg-slate-800"
                    >
                      {KUWAIT_FEE_CATEGORIES.map(cat => (
                        <optgroup key={cat.id} label={cat.label}>
                          {KUWAIT_FEE_TYPES.filter(t => t.category === cat.id).map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">قيمة المطالبة (د.ك)</label>
                    <Input 
                      type="number" 
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)}
                      className="text-right dark:bg-slate-800 font-bold tabular-nums"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">أتعاب المحاماة</label>
                      <Input 
                        type="number" 
                        value={attorneyFeesRequested}
                        onChange={(e) => setAttorneyFeesRequested(parseFloat(e.target.value) || 0)}
                        className="text-right dark:bg-slate-800 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">أمانة الخبراء</label>
                      <Input 
                        type="number" 
                        value={expertFeesRequested}
                        onChange={(e) => setExpertFeesRequested(parseFloat(e.target.value) || 0)}
                        className="text-right dark:bg-slate-800 tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">عدد الإعلانات (5 د.ك لكل إعلان)</label>
                    <Input 
                      type="number" 
                      min="0"
                      value={notificationCount}
                      onChange={(e) => setNotificationCount(parseInt(e.target.value) || 0)}
                      className="text-right dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ربط بالقضية (اختياري)</label>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportModalOpen(true)}
                      className="w-full flex items-center justify-between border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 px-4"
                    >
                      {linkedCase ? (
                        <span className="text-emerald-600 font-medium truncate">{linkedCase.title}</span>
                      ) : (
                        <span className="text-slate-400">اختر قضية لجلب البيانات...</span>
                      )}
                      <TagIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ملاحظات إضافية</label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-right"
                      placeholder="أضف أي ملاحظات خاصة بالحساب المالي..."
                    />
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handleSaveFee}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 py-6 text-lg font-bold rounded-xl shadow-lg border-none"
              >
                حفظ وتسجيل الرسوم
              </Button>
            </div>

            {/* Result Column */}
            <div className="lg:col-span-8 flex flex-col gap-6 text-right">
              {calculationResult && (
                <>
                  {/* Financial Summary Card */}
                  <Card className="p-8 border-none bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden shadow-xl shadow-emerald-100 dark:shadow-none">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4 justify-end">
                          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mr-2">تقرير مالي تقديري</span>
                          <h2 className="text-2xl font-black">{calculationResult.feeType.label}</h2>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-emerald-50 text-sm opacity-80 font-medium">إجمالي المبالغ المستحقة</p>
                          <p className="text-6xl font-black tabular-nums">
                            {calculationResult.total.toLocaleString()} <span className="text-2xl font-normal opacity-60">د.ك</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 w-full md:w-72">
                        <div className="text-[10px] font-bold text-white/60 mb-4 tracking-widest uppercase">توزيع الرسوم</div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="tabular-nums">{calculationResult.proportionalFee.toLocaleString()} د.ك</span>
                            <span className="opacity-60">الرسم النسبي</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="tabular-nums">{calculationResult.fixedFee.toLocaleString()} د.ك</span>
                            <span className="opacity-60">الرسم الثابت</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="tabular-nums">{calculationResult.expertFees.toLocaleString()} د.ك</span>
                            <span className="opacity-60">أتعاب الخبراء</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold border-t border-white/10 pt-2 text-emerald-300">
                            <span className="tabular-nums">{(calculationResult.total).toLocaleString()} د.ك</span>
                            <span>الإجمالي</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  </Card>

                  {/* Legal Basis Card */}
                  <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">التفاصيل والأسس القانونية</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3 mb-2 justify-end">
                            <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">السند القانوني لـ (الرسم النسبي)</span>
                            <GavelIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic pr-8">
                            يندرج هذا الإجراء تحت {calculationResult.feeType.ref} من قانون الرسوم القضائية الكويتي.
                            {calculationResult.feeType.isProportional && ' يتم احتساب الرسم على أساس شرائح تبدأ من 5% لأول 3000 د.ك ثم تتناقص نسبياً.'}
                            {calculationResult.feeType.isExempt && ' تعفى الدعاوى العمالية المرفوعة من العمال من الرسوم في جميع مراحل التقاضي طبقاً للمادة 6 من قانون العمل.'}
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3 mb-2 justify-end">
                            <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">أتعاب المحاماة والخبراء</span>
                            <ScaleIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-8">
                            يتم تقدير أمانة الخبير مبدئياً بمعرفة المحكمة ولا تقل عادة عن 300 د.ك. أتعاب المحاماة هي مبالغ تقديرية يطالب بها الخصم ويحكم بها القاضي وفقاً لمجهود المحامي وقيمة الدعوى.
                          </p>
                        </div>
                      </div>

                      <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-3 mb-6 justify-end">
                          <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 leading-none">خلاصة المبالغ الصافية</span>
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <ul className="space-y-4">
                          <li className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-50 dark:border-emerald-800/50">
                            <span className="text-sm font-black tabular-nums">{calculationResult.proportionalFee.toLocaleString()} د.ك</span>
                            <span className="text-xs text-slate-500">الرسم القضائي (الصافي)</span>
                          </li>
                          <li className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-50 dark:border-emerald-800/50">
                            <span className="text-sm font-black tabular-nums">{calculationResult.notificationFees.toLocaleString()} د.ك</span>
                            <span className="text-xs text-slate-500">مصاريف الإعلانات والإخطارات</span>
                          </li>
                          <li className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-50 dark:border-emerald-800/50">
                            <span className="text-sm font-black tabular-nums">{calculationResult.expertFees.toLocaleString()} د.ك</span>
                            <span className="text-xs text-slate-500">أمانات الخبراء</span>
                          </li>
                          <li className="flex justify-between items-center bg-emerald-600 text-white p-4 rounded-xl shadow-lg mt-4">
                            <span className="text-lg font-black tabular-nums">{calculationResult.total.toLocaleString()} د.ك</span>
                            <span className="text-sm font-bold">المجموع الكلي للحساب</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  {/* Warning Box */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-4 text-right items-start">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1 italic">تنبيه قانوني ومحاسبي</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed">
                        هذا التقدير مخصص للاسترشاد فقط. الرسوم الفعلية يتم تقديرها من قبل (رئيس إدارة الكتاب) أو (محضر التنفيذ) عند قيد المعاملة رسمياً في قصر العدل أو مراكز الخدمة. قد تطرأ رسوم طوابع إضافية أو رسوم فنية لم تدخل في هذا الحساب المبسط.
                      </p>
                    </div>
                    <InformationCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div 
            key="saved"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-slate-500 text-xs mb-2">إجمالي الرسوم المسجلة</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">
                    {savedFees.reduce((acc, curr) => acc + curr.totalFee, 0).toLocaleString()} <span className="text-sm font-normal opacity-40">د.ك</span>
                  </div>
                </div>
                <BanknotesIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-slate-50 dark:text-slate-800/10" />
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-rose-600 text-xs mb-2">رسوم غير مدفوعة</div>
                  <div className="text-2xl font-black text-rose-600 tabular-nums">
                    {savedFees.filter(f => f.status === FeeStatus.UNPAID).length}
                  </div>
                </div>
                <CreditCardIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-rose-50 dark:text-rose-900/10" />
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-emerald-600 text-xs mb-2">رسوم مدفوعة</div>
                  <div className="text-2xl font-black text-emerald-600 tabular-nums">
                    {savedFees.filter(f => f.status === FeeStatus.PAID).length}
                  </div>
                </div>
                <ShieldCheckIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-emerald-50 dark:text-emerald-900/10" />
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-blue-600 text-xs mb-2">أتعاب المحاماة المحكوم بها</div>
                  <div className="text-2xl font-black text-blue-600 tabular-nums">
                    {savedFees.reduce((acc, curr) => acc + curr.attorneyFees, 0).toLocaleString()} <span className="text-sm font-normal opacity-40">د.ك</span>
                  </div>
                </div>
                <ScaleIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-blue-50 dark:text-blue-900/10" />
              </Card>
            </div>

            {/* List Table */}
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96 order-1 md:order-2">
                  <Input 
                    placeholder="بحث في قيود الرسوم أو أرقام القضايا..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 dark:bg-slate-800 dark:border-slate-700 text-right"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                
                <div className="flex items-center gap-3 order-2 md:order-1">
                  <Button variant="ghost" className="text-slate-500 flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4" />
                    تصفية متقدمة
                  </Button>
                  <Button variant="ghost" className="text-slate-500 flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    تحميل الكشف (PDF)
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto h-[500px] custom-scrollbar">
                <table className="w-full text-right">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest z-10">
                    <tr>
                      <th className="px-6 py-4">الإجراء / القضية</th>
                      <th className="px-6 py-4">المبلغ المطالب به</th>
                      <th className="px-6 py-4">إجمالي الرسم</th>
                      <th className="px-6 py-4">الحالة المادية</th>
                      <th className="px-6 py-4">تاريخ الحساب</th>
                      <th className="px-6 py-4 text-left">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {savedFees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-32 text-center text-slate-400 italic">
                          <div className="flex flex-col items-center gap-6 opacity-20">
                            <CalculatorIcon className="w-16 h-16" />
                            <span className="font-bold uppercase tracking-[0.4em]">لا توجد سجلات مالية محفوظة</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      savedFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="font-black text-slate-800 dark:text-white mb-0.5 tracking-tight group-hover:text-emerald-600 transition-colors">{fee.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end italic">
                              رقم القضية: {fee.caseNumber || '---'}
                              <TagIcon className="w-3 h-3 ml-1" />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-300">
                              {fee.claimAmount.toLocaleString()} د.ك
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-lg font-black tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tighter">
                              {fee.totalFee.toLocaleString()} <span className="text-[10px] opacity-60 font-normal">د.ك</span>
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-2 w-fit mr-auto ml-0 ${
                              fee.status === FeeStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 
                              fee.status === FeeStatus.EXEMPTED ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${fee.status === FeeStatus.PAID ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {fee.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-500 tabular-nums">
                            {new Date(fee.date).toLocaleDateString('ar-KW')}
                          </td>
                          <td className="px-6 py-5 text-left">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <InformationCircleIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setSavedFees(savedFees.filter(f => f.id !== fee.id))}
                                className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'مطالبة بمستحقات عمالية', details: 'مطالبة ببدل إنذار، مكافأة نهاية خدمة، وعطل وإجازات بقيمة 15,000 د.ك', type: 'lb-indemnity' },
              { title: 'دعوى تجارية في الدائرة الكلية', details: 'مطالبة مالية ثابتة بقيمة 45,000 د.ك بموجب عقد توريد', type: 'cv-known' },
              { title: 'إشكال في التنفيذ (أول مرة)', details: 'طلب وقف نفاذ حكم صادر لعدم صحة الإعلان في قصر العدل', type: 'ex-dispute' },
              { title: 'طلب أمر أداء مستعجل', details: 'مطالبة بقيمة شيك مرتجع بمبلغ 5,000 د.ك مع الفوائد القانونية', type: 'cv-performance' },
              { title: 'توثيق وكالة عامة شاملة', details: 'وكالة عامة تصدر من كاتب العدل لأعمال التصرف والإدارة والقضايا', type: 'nt-poa' }
            ].map((example, i) => (
              <Card key={i} className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all group text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowPathIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-500">
                  <BriefcaseIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-white" />
                </div>
                <h4 className="font-black text-slate-800 dark:text-white mb-2 text-lg italic">{example.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed h-10 overflow-hidden">{example.details}</p>
                <Button 
                  variant="outline" 
                  className="w-full text-[10px] font-black uppercase tracking-widest border-slate-100 dark:border-slate-800"
                  onClick={() => {
                    setSelectedFeeTypeId(example.type);
                    setActiveTab('calculator');
                  }}
                >
                  استيراد هذا الموديل المالي
                </Button>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- IMPORT MODAL --- */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="قاعدة بيانات القضايا - جلب بيانات الربط المالي"
        className="max-w-3xl rtl"
      >
        <div className="p-8 text-right">
          <div className="relative mb-8">
            <Input 
              placeholder="ابحث برقم القضية، اسم الموكل، أو مسمى النزاع..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 h-14 dark:bg-slate-800 dark:border-slate-700 text-right font-bold"
            />
            <MagnifyingGlassIcon className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          
          <div className="max-h-[450px] overflow-y-auto space-y-4 pr-0 pl-3 custom-scrollbar rtl" dir="rtl">
            {initialCases
              .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.caseNumber.includes(searchTerm))
              .map(c => (
                <div 
                  key={c.id} 
                  className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer group text-right shadow-sm"
                  onClick={() => handleImportCase(c)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 tabular-nums tracking-tighter">{c.caseNumber}</span>
                    <h5 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 transition-colors uppercase italic">{c.title}</h5>
                  </div>
                  <div className="flex items-center gap-6 text-[10px] text-slate-400 justify-end">
                    <div className="flex items-center gap-1">
                       الرصيد: {c.budget ? c.budget.toLocaleString() : 0} د.ك
                      <BanknotesIcon className="w-3 h-3 ml-1" />
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      {c.clientName}
                      <BriefcaseIcon className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .p-8 { padding: 1rem !important; }
          .shadow-xl { shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
