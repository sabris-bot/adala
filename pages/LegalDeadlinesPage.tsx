import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  PlusCircleIcon, 
  TrashIcon, 
  PrinterIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CalendarDaysIcon as CalendarIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellAlertIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ScaleIcon,
  TagIcon,
  ClipboardListCheckIcon
} from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';
import PrintHeader from '../components/ui/PrintHeader';
import { initialCases } from '../data/caseData';
import { 
  CaseStatus, 
  CasePriority, 
  RiskLevel, 
  LitigationStage,
  Case 
} from '../types';

// --- TYPES ---

export enum DeadlineStatus {
  ACTIVE = 'نشط',
  SOON = 'قريب جداً',
  EXPIRED = 'منتهي',
  COMPLETED = 'منجز',
  LATE = 'متأخر',
  PENDING_REVIEW = 'بانتظار المراجعة',
  FOLLOWING = 'قيد المتابعة'
}

export interface LegalProcedure {
  id: string;
  label: string;
  days: number;
  reference: string;
  category: 'Civil' | 'Commercial' | 'Penal' | 'Labor' | 'Administrative' | 'Execution' | 'Personal';
  description: string;
}

export interface TrackedDeadline {
  id: string;
  title: string;
  caseId?: string;
  caseNumber?: string;
  startDate: string; // ISO
  endDate: string; // ISO
  procedureId: string;
  procedureLabel: string;
  status: DeadlineStatus;
  priority: CasePriority;
  risk: RiskLevel;
  notes?: string;
  clientName?: string;
  court?: string;
  remainingDays: number;
  percentage: number;
}

// --- DATA & CONSTANTS ---

const KUWAIT_LEGAL_PROCEDURES: LegalProcedure[] = [
  // Civil & Commercial
  { id: 'cv-appeal', label: 'استئناف حكم كلي (مدني/تجاري)', days: 30, reference: 'المادة 129 مرافعات', category: 'Civil', description: 'ميعاد الاستئناف في الأحكام الصادرة من بصفة ابتدائية من الدوائر الكلية.' },
  { id: 'cv-cassation', label: 'تمييز حكم مدني/تجاري', days: 60, reference: 'المادة 153 مرافعات', category: 'Civil', description: 'ميعاد الطعن بالتمييز في الأحكام الصادرة من محكمة الاستئناف.' },
  { id: 'cv-opp-judg', label: 'تظلم من أمر أداء', days: 10, reference: 'المادة 167 مرافعات', category: 'Commercial', description: 'ميعاد التظلم من أمر الأداء من المدين.' },
  { id: 'cv-renewal', label: 'تجديد الدعوى من الشطب', days: 60, reference: 'المادة 59 مرافعات', category: 'Civil', description: 'ميعاد تجديد الدعوى بعد قرار الشطب للمرة الأولى.' },
  
  // Penal (Criminal)
  { id: 'pn-appeal', label: 'استئناف حكم جنح/جنايات', days: 20, reference: 'المادة 201 إجراءات جزائية', category: 'Penal', description: 'ميعاد استئناف الأحكام الصادرة في المواد الجزائية.' },
  { id: 'pn-cassation', label: 'تمييز حكم جزائي', days: 60, reference: 'قانون حالات الطعن بالتمييز', category: 'Penal', description: 'ميعاد الطعن بالتمييز في الأحكام الجزائية.' },
  { id: 'pn-opp-default', label: 'معارضة في حكم غيابي', days: 7, reference: 'المادة 188 إجراءات جزائية', category: 'Penal', description: 'ميعاد المعارضة في الاحكام الغيابية الصادرة في الجنح.' },

  // Administrative
  { id: 'ad-appeal', label: 'استئناف حكم إداري', days: 30, reference: 'قانون إنشاء الدائرة الإدارية', category: 'Administrative', description: 'ميعاد استئناف الأحكام الصادرة من الدائرة الإدارية.' },
  { id: 'ad-grievance', label: 'تظلم إداري (قبل الرفع)', days: 60, reference: 'المادة 7 من قانون الإداري', category: 'Administrative', description: 'ميعاد التظلم من القرار الإداري قبل رفع دعوى الإلغاء.' },

  // Labor
  { id: 'lb-appeal', label: 'استئناف حكم عمالي', days: 30, reference: 'المادة 129 مرافعات / قانون العمل', category: 'Labor', description: 'ميعاد استئناف الأحكام الصادرة في المنازعات العمالية.' },
  { id: 'lb-discontinuity', label: 'انقطاع العمل (فصل)', days: 7, reference: 'المادة 41 قانون العمل', category: 'Labor', description: 'المدة التي يعتبر فيها العامل مستقيلاً إذا انقطع عن العمل.' },

  // Personal Status
  { id: 'ps-appeal', label: 'استئناف حكم أحوال شخصية', days: 30, reference: 'قانون الأحوال الشخصية', category: 'Personal', description: 'ميعاد استئناف أحكام الأحوال الشخصية.' },

  // Execution
  { id: 'ex-grievance', label: 'تظلم من إجراء تنفيذ', days: 7, reference: 'المادة 212 مرافعات', category: 'Execution', description: 'ميعاد التظلم من إجراءات التنفيذ أمام قاضي التنفيذ.' },
  { id: 'ex-eviction', label: 'موعد إخلاء إداري/قضائي', days: 15, reference: 'قانون الإيجارات', category: 'Execution', description: 'المهلة المعتادة للإخلاء بعد الإخطار.' },
];

const KUWAIT_HOLIDAYS = {
  '2024': [
    '2024-01-01', // New Year
    '2024-02-08', // Isra and Mi'raj
    '2024-02-25', // National Day
    '2024-02-26', // Liberation Day
    '2024-04-10', '2024-04-11', '2024-04-12', // Eid Al-Fitr
    '2024-06-16', '2024-06-17', '2024-06-18', // Eid Al-Adha
    '2024-07-07', // Islamic New Year
    '2024-09-15', // Prophet's Birthday
  ],
  '2025': [
    '2025-01-01',
    '2025-01-27',
    '2025-02-25',
    '2025-02-26',
    '2025-03-31', '2025-04-01', '2025-04-02',
    '2025-06-06', '2025-06-07', '2025-06-08',
    '2025-06-26',
    '2025-09-04',
  ]
};

// --- HELPER FUNCTIONS ---

const formatDate = (dateString: string) => {
  if (!dateString) return '---';
  const d = new Date(dateString);
  return d.toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
};

const getStatusColor = (status: DeadlineStatus) => {
  switch (status) {
    case DeadlineStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case DeadlineStatus.SOON: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case DeadlineStatus.EXPIRED: return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    case DeadlineStatus.LATE: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case DeadlineStatus.COMPLETED: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

// --- COMPONENTS ---

export default function LegalDeadlinesPage() {
  
  // State
  const [activeTab, setActiveTab] = useState<'calculator' | 'tracked' | 'insights'>('calculator');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProcedureId, setSelectedProcedureId] = useState(KUWAIT_LEGAL_PROCEDURES[0].id);
  const [distance, setDistance] = useState(0);
  const [customDays, setCustomDays] = useState(0);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [trackedDeadlines, setTrackedDeadlines] = useState<TrackedDeadline[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [notes, setNotes] = useState('');
  const [linkedCase, setLinkedCase] = useState<Case | null>(null);

  // Derived Procedures
  const filteredProcedures = useMemo(() => {
    if (filterCategory === 'All') return KUWAIT_LEGAL_PROCEDURES;
    return KUWAIT_LEGAL_PROCEDURES.filter(p => p.category === filterCategory);
  }, [filterCategory]);

  // Core Calculation Logic
  const calculateDeadlines = (start: string, procId: string, dist: number, extra: number) => {
    const procedure = KUWAIT_LEGAL_PROCEDURES.find(p => p.id === procId);
    if (!procedure) return null;

    let totalDays = procedure.days + dist + extra;
    let current = new Date(start);
    
    // Per Article 17: Date of judgment/notification doesn't count. Start counting from next day.
    current.setDate(current.getDate() + 1);
    const dayStartCount = new Date(current);
    
    const steps = [];
    steps.push({
      label: `بداية احتساب الموعد (المادة 17)`,
      date: dayStartCount.toISOString().split('T')[0],
      note: 'لا يحسب يوم صدور الحكم أو الإعلان في الميعاد'
    });

    // Add normal days
    current.setDate(current.getDate() + totalDays - 1);
    const deadlineBeforeExtension = new Date(current);

    steps.push({
      label: `الموعد القانوني الأصلي (${totalDays} يوماً)`,
      date: deadlineBeforeExtension.toISOString().split('T')[0],
      note: `شامل ميعاد المسافة (${dist}) والأيام الإضافية (${extra})`
    });

    // Check for Article 18 Extensions (Holidays/Weekends)
    let finalDeadline = new Date(current);
    let extended = false;

    const isHoliday = (date: Date) => {
      const ds = date.toISOString().split('T')[0];
      const year = date.getFullYear().toString();
      const holidayList = (KUWAIT_HOLIDAYS as any)[year] || [];
      return holidayList.includes(ds);
    };

    const isWeekend = (date: Date) => {
      const day = date.getDay();
      return day === 5 || day === 6; // Friday or Saturday in Kuwait
    };

    while (isHoliday(finalDeadline) || isWeekend(finalDeadline)) {
      finalDeadline.setDate(finalDeadline.getDate() + 1);
      extended = true;
    }

    if (extended) {
      steps.push({
        label: `تمديد للمصادفة مع عطلة (المادة 18)`,
        date: finalDeadline.toISOString().split('T')[0],
        note: `يمتد الميعاد إلى أول يوم عمل تالٍ للعطلة`
      });
    }

    // Remaining Calculation
    const today = new Date();
    const diffTime = finalDeadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const percentage = Math.max(0, Math.min(100, (diffDays / totalDays) * 100));

    let status = DeadlineStatus.ACTIVE;
    if (diffDays <= 0) status = DeadlineStatus.EXPIRED;
    else if (diffDays <= 3) status = DeadlineStatus.SOON;

    return {
      procedure,
      startDate: start,
      finalDeadline: finalDeadline.toISOString().split('T')[0],
      steps,
      remainingDays: diffDays,
      percentage,
      status,
      totalDays
    };
  };

  // Initial Calculation
  useEffect(() => {
    const res = calculateDeadlines(startDate, selectedProcedureId, distance, customDays);
    setCalculationResult(res);
  }, [startDate, selectedProcedureId, distance, customDays]);

  const handleSave = () => {
    if (!calculationResult) return;
    
    const newDeadline: TrackedDeadline = {
      id: Math.random().toString(36).substr(2, 9),
      title: linkedCase ? linkedCase.title : `ميعاد ${calculationResult.procedure.label}`,
      caseId: linkedCase?.id,
      caseNumber: linkedCase?.caseNumber,
      startDate: calculationResult.startDate,
      endDate: calculationResult.finalDeadline,
      procedureId: calculationResult.procedure.id,
      procedureLabel: calculationResult.procedure.label,
      status: calculationResult.status,
      priority: linkedCase?.priority || CasePriority.NORMAL,
      risk: calculationResult.status === DeadlineStatus.SOON ? RiskLevel.HIGH : RiskLevel.LOW,
      notes,
      clientName: linkedCase?.clientName,
      remainingDays: calculationResult.remainingDays,
      percentage: calculationResult.percentage
    };

    setTrackedDeadlines([newDeadline, ...trackedDeadlines]);
    setActiveTab('tracked');
    // Reset inputs
    setNotes('');
    setLinkedCase(null);
  };

  const handleImportCase = (c: Case) => {
    setLinkedCase(c);
    if (c.judgmentDate) setStartDate(c.judgmentDate);
    setIsImportModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors duration-300 rtl" dir="rtl">
      <PrintHeader title="تقرير المواعيد والإجراءات القانونية" />
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
            <ClockIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">حاسبة المواعيد القانونية</h1>
            <p className="text-slate-500 dark:text-slate-400">النظام الذكي لاحتساب مدد الطعون والمواعيد القضائية طبقاً للقوانين الكويتية</p>
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
            حساب ميعاد جديد
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
          <ScaleIcon className="w-4 h-4" />
          المحرك الذكي
        </button>
        <button
          onClick={() => setActiveTab('tracked')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'tracked' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardListCheckIcon className="w-4 h-4" />
          المواعيد المتابعة
          {trackedDeadlines.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold mr-2">
              {trackedDeadlines.length}
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
          <BellAlertIcon className="w-4 h-4" />
          أمثلة وتنبيهات
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'calculator' && (
          <motion.div 
            key="calculator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Input Column */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
                  مدخلات الحساب
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">تاريخ الحكم / الإعلان</label>
                    <div className="relative">
                      <Input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pr-10 dark:bg-slate-800 dark:border-slate-700 text-right"
                      />
                      <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">تصنيف الميعاد</label>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="dark:bg-slate-800 text-right"
                    >
                      <option value="All">جميع التصنيفات</option>
                      <option value="Civil">مدني وتجاري</option>
                      <option value="Penal">جزائي (جنائي)</option>
                      <option value="Labor">عمالي</option>
                      <option value="Execution">تنفيذ وإيجارات</option>
                      <option value="Administrative">إداري</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">الإجراء المطلوب</label>
                    <Select
                      value={selectedProcedureId}
                      onChange={(e) => setSelectedProcedureId(e.target.value)}
                      className="dark:bg-slate-800 text-right"
                    >
                      {filteredProcedures.map(p => (
                        <option key={p.id} value={p.id}>{p.label} ({p.days} يوماً)</option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">ميعاد المسافة (أيام)</label>
                      <Input 
                        type="number" 
                        min="0"
                        value={distance}
                        onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
                        className="dark:bg-slate-800 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">أيام إضافية</label>
                      <Input 
                        type="number" 
                        min="0"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value) || 0)}
                        className="dark:bg-slate-800 text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">ربط بالقضية (اختياري)</label>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportModalOpen(true)}
                      className="w-full flex items-center justify-between border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 px-4"
                    >
                      {linkedCase ? (
                        <span className="text-emerald-600 font-medium truncate">{linkedCase.title}</span>
                      ) : (
                        <span className="text-slate-400">اختر قضية من الملفات...</span>
                      )}
                      <TagIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-right">ملاحظات</label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-right"
                      placeholder="أضف أي تفاصيل إضافية هنا..."
                    />
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handleSave}
                disabled={!calculationResult}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 py-6 text-lg font-bold rounded-xl shadow-lg"
              >
                حفظ ومتابعة الميعاد
              </Button>
            </div>

            {/* Result Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {calculationResult && (
                <>
                  {/* Result Header Card */}
                  <Card className="p-8 border-none bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative overflow-hidden shadow-xl shadow-emerald-100 dark:shadow-none text-right">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 justify-end">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mr-2">نتائج الحساب</span>
                        <h2 className="text-2xl font-bold">{calculationResult.procedure.label}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="md:order-2">
                          <p className="text-emerald-50 text-sm mb-1 opacity-80 uppercase tracking-wider">آخر موعد لاتخاذ الإجراء</p>
                          <p className="text-5xl font-black mb-4 tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
                            {new Date(calculationResult.finalDeadline).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-4 justify-end">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{calculationResult.procedure.reference}</span>
                              <ScaleIcon className="w-4 h-4 opacity-70" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">الوقت المتبقي: {calculationResult.remainingDays} يوماً</span>
                              <InformationCircleIcon className="w-4 h-4 opacity-70" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 md:order-1">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-2xl font-black">{Math.round(calculationResult.percentage)}%</span>
                            <span className="text-sm font-medium">الحالة الأمنية للميعاد</span>
                          </div>
                          <div className="h-4 bg-black/20 rounded-full overflow-hidden mb-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${calculationResult.percentage}%` }}
                              className={`h-full ${calculationResult.remainingDays > 7 ? 'bg-emerald-400' : calculationResult.remainingDays > 3 ? 'bg-amber-400' : 'bg-rose-500'}`}
                            />
                          </div>
                          <p className="text-[10px] text-white/60 text-center tracking-wide">نسبة الوقت المتبقي قبل السقوط</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Timeline / Steps Card */}
                  <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex-1 text-right">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">التفصيل القانوني لاحتساب الميعاد</h4>
                    
                    <div className="space-y-0 relative">
                      <div className="absolute top-0 bottom-0 left-[25px] w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block" />
                      
                      {calculationResult.steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative pl-12 pb-10 last:pb-0 text-right pr-0">
                          <div className={`absolute left-4 top-0 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 z-10 transition-colors ${
                            idx === 0 ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 
                            idx === calculationResult.steps.length - 1 ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-slate-400'
                          }`} />
                          
                          <div className={`p-5 rounded-2xl border transition-all ${
                            idx === calculationResult.steps.length - 1 
                              ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30' 
                              : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800'
                          }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums order-2 md:order-1">
                                {formatDate(step.date)}
                              </span>
                              <h5 className="font-bold text-slate-800 dark:text-white order-1 md:order-2">{step.label}</h5>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Warning Box */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-4 text-right">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">تنبيه قانوني هام</p>
                      <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                        هذه الحاسبة تعتمد القواعد العامة. يرجى دائماً مراجعة المواد القانونية الخاصة بطبيعة الدعوى والتحقق من صدور أي تعديلات تشريعية حديثة أو قرارات استثنائية بتمديد المواعيد من المجلس الأعلى للقضاء.
                      </p>
                    </div>
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0" />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'tracked' && (
          <motion.div 
            key="tracked"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right">
                <div className="relative z-10">
                  <div className="text-slate-500 dark:text-slate-400 text-sm mb-2">إجمالي المواعيد</div>
                  <div className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{trackedDeadlines.length}</div>
                </div>
                <ClockIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-slate-50 dark:text-slate-800/20" />
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right">
                <div className="relative z-10">
                  <div className="text-amber-600 text-sm mb-2">مواعيد قريبة</div>
                  <div className="text-3xl font-black text-amber-600 tabular-nums">
                    {trackedDeadlines.filter(d => d.status === DeadlineStatus.SOON).length}
                  </div>
                </div>
                <ExclamationTriangleIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-amber-50 dark:text-amber-900/10" />
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right">
                <div className="relative z-10">
                  <div className="text-rose-600 text-sm mb-2">مواعيد منتهية</div>
                  <div className="text-3xl font-black text-rose-600 tabular-nums">
                    {trackedDeadlines.filter(d => d.status === DeadlineStatus.EXPIRED).length}
                  </div>
                </div>
                <BellAlertIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-rose-50 dark:text-rose-900/10" />
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right">
                <div className="relative z-10">
                  <div className="text-emerald-600 text-sm mb-2">تم الإجراء</div>
                  <div className="text-3xl font-black text-emerald-600 tabular-nums">
                    {trackedDeadlines.filter(d => d.status === DeadlineStatus.COMPLETED).length}
                  </div>
                </div>
                <CheckCircleIcon className="absolute -bottom-2 -right-2 w-20 h-20 text-emerald-50 dark:text-emerald-900/10" />
              </Card>
            </div>

            {/* List Table */}
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96 order-1 md:order-2">
                  <Input 
                    placeholder="بحث في المواعيد أو القضايا..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 dark:bg-slate-800 dark:border-slate-700 text-right"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                
                <div className="flex items-center gap-3 order-2 md:order-1">
                  <Button variant="ghost" className="text-slate-500 flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4" />
                    تصفية
                  </Button>
                  <Button variant="ghost" className="text-slate-500 flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    تصدير Excel
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">الإجراء / القضية</th>
                      <th className="px-6 py-4">تاريخ البداية</th>
                      <th className="px-6 py-4">الموعد النهائي</th>
                      <th className="px-6 py-4 text-center">الوقت المتبقي</th>
                      <th className="px-6 py-4 text-center">الحالة</th>
                      <th className="px-6 py-4 text-left">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {trackedDeadlines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <ClockIcon className="w-10 h-10 opacity-20" />
                          </div>
                          <span>لا توجد مواعيد متابعة حالياً</span>
                        </td>
                      </tr>
                    ) : (
                      trackedDeadlines.map((deadline) => (
                        <tr key={deadline.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 dark:text-white mb-0.5">{deadline.procedureLabel}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                              {deadline.title}
                              <BriefcaseIcon className="w-3 h-3 ml-1" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                            {formatDate(deadline.startDate)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatDate(deadline.endDate)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full text-xs font-black tabular-nums ${
                              deadline.remainingDays > 7 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 font-bold'
                            }`}>
                              {deadline.remainingDays} يوماً
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase whitespace-nowrap ${getStatusColor(deadline.status)}`}>
                              {deadline.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <InformationCircleIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setTrackedDeadlines(trackedDeadlines.filter(d => d.id !== deadline.id))}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm"
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
              { title: 'طعن بالاستئناف - حكم كلي', details: 'استئناف حكم صادر من الدائرة التجارية بمبلغ 50,000 د.ك', procId: 'cv-appeal', category: 'Commercial' },
              { title: 'تجديد دعوى من الشطب', details: 'تجديد دعوى تعويض لم يتم الحضور فيها بجلسة الأمس', procId: 'cv-renewal', category: 'Civil' },
              { title: 'طعن بالتمييز - حكم استئناف', details: 'تمييز حكم استئناف مدني صادر برفض الدعوى', procId: 'cv-cassation', category: 'Civil' },
              { title: 'استئناف قضية جنح', details: 'حكم حبس سنة مع الشغل والنفاذ وبكفالة لوقف التنفيذ', procId: 'pn-appeal', category: 'Penal' },
              { title: 'تظلم إداري من قرار ترقية', details: 'تخطي في الترقية لدرجة مدير إدارة بمؤسسة عامة', procId: 'ad-grievance', category: 'Administrative' }
            ].map((example, i) => (
              <Card key={i} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors group text-right">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{example.category}</span>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                    <ScaleIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">{example.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed h-10 overflow-hidden">{example.details}</p>
                <Button 
                  variant="outline" 
                  className="w-full text-xs font-bold border-slate-200 dark:border-slate-800"
                  onClick={() => {
                    setSelectedProcedureId(example.procId);
                    setActiveTab('calculator');
                  }}
                >
                  استخدام هذا السيناريو
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
        title="استيراد بيانات من القضايا المسجلة"
        className="max-w-3xl rtl"
      >
        <div className="p-6 text-right">
          <div className="relative mb-6">
            <Input 
              placeholder="ابحث برقم القضية أو اسم الموكل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 h-12 dark:bg-slate-800 dark:border-slate-700 text-right"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-0 pl-2 custom-scrollbar rtl" dir="rtl">
            {initialCases
              .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.caseNumber.includes(searchTerm))
              .map(c => (
                <div 
                  key={c.id} 
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all cursor-pointer group text-right"
                  onClick={() => handleImportCase(c)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 tabular-nums">{c.caseNumber}</span>
                    <h5 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{c.title}</h5>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 justify-end">
                    <div className="flex items-center gap-1">
                      {c.judgmentDate || 'غير محدد'}
                      <CalendarDaysIcon className="w-3 h-3" />
                    </div>
                    <div className="flex items-center gap-1">
                      {c.caseMainType}
                      <TagIcon className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .p-8 { padding: 1rem !important; }
          .rtl { direction: rtl !important; }
        }
      `}</style>
    </div>
  );
}
