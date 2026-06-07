import React, { useState, useMemo } from 'react';
import { 
  Search, Scale, ShieldCheck, Printer, FileText, Plus, 
  Calendar, Download, X, Laptop, Award, Landmark, Lock, 
  CheckSquare, Clock, FileSpreadsheet, AlertOctagon, HelpCircle, Filter, 
  ChevronDown, ChevronUp, Sliders, Play, FileDown, Activity, Stamp, 
  Sparkles, Bot, CheckCircle, Calculator, UserCheck, History, 
  ArrowUpRight, FolderClosed, Paperclip, AlertTriangle, 
  FileUp, FileCode, Trash2, ScrollText, TableProperties, Grid, Columns, ChevronLeft, RefreshCw, Key
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { EOS_Settlement, TerminationReasonKuwait } from '../../types';

interface EndOfServiceWorkstationProps {
  savedCases: EOS_Settlement[];
  setSavedCases: React.Dispatch<React.SetStateAction<EOS_Settlement[]>>;
  activeCase: EOS_Settlement | null;
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
  inlineValues: {
    basicSalary: number;
    allowances: number;
    leaveDays: number;
    absenceDays: number;
    otherAdditions: number;
    disciplinaryDeductions: number;
  };
  setInlineValues: React.Dispatch<React.SetStateAction<{
    basicSalary: number;
    allowances: number;
    leaveDays: number;
    absenceDays: number;
    otherAdditions: number;
    disciplinaryDeductions: number;
  }>>;
  liveCalculations: any;
  handleSaveInlineCalculations: () => void;
  checkedAssets: {
    laptop: string;
    badge: string;
    keys: string;
    car: string;
  };
  setCheckedAssets: React.Dispatch<React.SetStateAction<{
    laptop: string;
    badge: string;
    keys: string;
    car: string;
  }>>;
  activeRole: 'hr' | 'legal' | 'finance' | 'manager' | 'gm' | 'executive';
  setActiveRole: (role: any) => void;
  handleDocumentSignOff: (updatedSignatures: any, updatedApprovals: any, comment: string) => void;
  handleDeleteCase: (id: string) => void;
  setWizardOpen: (open: boolean) => void;
  setEditCase: (c: EOS_Settlement | null) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  caseAttachments: Record<string, { name: string; size: string; date: string }[]>;
  setCaseAttachments: React.Dispatch<React.SetStateAction<Record<string, { name: string; size: string; date: string }[]>>>;
  customDeclarationText: string;
  setCustomDeclarationText: (text: string) => void;
  aiReport: string;
  aiPending: boolean;
  aiActive: boolean;
  triggerLegalAuditAI: (mode: 'audit' | 'risk' | 'recs') => void;
  workspaceTab: 'employee' | 'contract' | 'calculation' | 'settlement' | 'leaves_accruals' | 'deductions' | 'declarations' | 'approvals' | 'reports_prints' | 'attachments' | 'legal_log';
  setWorkspaceTab: (tab: any) => void;
  setIsPrintModalOpen: (open: boolean) => void;
  setIsImportModalOpen?: (open: boolean) => void;
}

export const EndOfServiceWorkstation: React.FC<EndOfServiceWorkstationProps> = ({
  savedCases,
  setSavedCases,
  activeCase,
  activeCaseId,
  setActiveCaseId,
  inlineValues,
  setInlineValues,
  liveCalculations,
  handleSaveInlineCalculations,
  checkedAssets,
  setCheckedAssets,
  activeRole,
  setActiveRole,
  handleDocumentSignOff,
  handleDeleteCase,
  setWizardOpen,
  setEditCase,
  notifications,
  setNotifications,
  caseAttachments,
  setCaseAttachments,
  customDeclarationText,
  setCustomDeclarationText,
  aiReport,
  aiPending,
  aiActive,
  triggerLegalAuditAI,
  workspaceTab,
  setWorkspaceTab,
  setIsPrintModalOpen,
  setIsImportModalOpen
}) => {
  // Search & Navigation
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClassification, setFilterClassification] = useState<string>('ALL');
  const [newFileName, setNewFileName] = useState<string>('');
  const [fileUploadProgress, setFileUploadProgress] = useState<string>('');
  
  // Custom states
  const [sidebarLayout, setSidebarLayout] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'employeeName' | 'netPayable' | 'serviceYears' | 'employeeId'>('employeeName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [frozenColumns, setFrozenColumns] = useState<boolean>(true);
  const [visibleColumns, setVisibleColumns] = useState({ civilId: true, department: true, payout: true, serviceYears: true });
  const [showColOptions, setShowColOptions] = useState<boolean>(false);
  const [localApproComment, setLocalApproComment] = useState<string>('');

  // Pre-configured statuses catalog
  const statusesCatalog = [
    { id: 'Completed', labelAr: 'مغلق ومسدد', labelEn: 'Completed', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
    { id: 'PendingReview', labelAr: 'قيد التدقيق والطلب', labelEn: 'Pending Review', color: 'bg-amber-500/10 text-amber-700 border-amber-300' },
    { id: 'UnderFinancialReview', labelAr: 'مراجعة الحسابات', labelEn: 'Financial Review', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
    { id: 'UnderHRReview', labelAr: 'متنازع عليه', labelEn: 'Disputed', color: 'bg-rose-500/10 text-rose-700 border-rose-300' }
  ];

  // Legal articles text logs
  const legalArticlesData = [
    { article: 'المادة 51', text: 'يستحق العامل مكافأة نهاية الخدمة كاملة عند انتهاء العقد من قبل صاحب العمل، وهي: أجر 15 يوماً عن كل سنة من السنوات الخمس الأولى، وأجر شهر عن كل سنة من السنوات التالية، بحيث لا تزيد المكافأة عن أجر سنة ونصف في القطاع الأهلي الكويتي.' },
    { article: 'المادة 53', text: 'في حال استقالة العامل، يستحق نصف المكافأة إذا بلغت مدة خدمته 3 سنوات ولم تبلغ 5 سنوات، وثلثي المكافأة إذا بلغت الخدمة 5 سنوات ولم تبلغ 10 سنوات، ويستحق المكافأة كاملة إذا بلغت الخدمة 10 سنوات فما فوق.' },
    { article: 'المادة 70', text: 'يستحق العامل تعويضاً نقدياً عن رصيد إجازاته السنوية غير المستهلكة عند انتهاء الخدمة، محسوباً على أساس آخر راتب تقاضاه مقسوماً على 26 لليوم الواحد.' },
    { article: 'المادة 41', text: 'يجوز لصاحب العمل فصل العامل دون إنذار أو مكافأة في أحوال حصرية كارتكاب خطأ جسيم أدى بخسارة فادحة، أو الغياب المتكرر، أو الإدانة بجريمة مخلة بالشرف والأمانة.' }
  ];

  // Dynamic civil ID validity check
  const civilIdError = useMemo(() => {
    if (!activeCase) return '';
    const cleanId = activeCase.employeeId?.trim() || '';
    if (cleanId && cleanId.length !== 12) {
      return 'تنبيه: الرقم المدني الكويتي بالبطاقة الشخصية يجب أن يتكون من 12 رقماً (مثال: 295111245678)';
    }
    return '';
  }, [activeCase?.employeeId]);

  // Handle direct updates to employee model in state
  const handleDirectFieldUpdate = (field: string, value: any) => {
    if (!activeCase) return;
    setSavedCases(prev => prev.map(c => {
      if (c.id === activeCase.id) {
        return {
          ...c,
          [field]: value,
          grossSalary: field === 'basicSalary' ? Number(value) + (c.allowances || 0) :
                       field === 'allowances' ? (c.basicSalary || 0) + Number(value) :
                       c.grossSalary
        };
      }
      return c;
    }));
  };

  const currentAttachments = useMemo(() => {
    if (!activeCase) return [];
    return caseAttachments[activeCase.id] || [];
  }, [caseAttachments, activeCase?.id]);

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !newFileName.trim()) return;
    setFileUploadProgress('جاري معالجة وفحص المستند عالي السرعة...');
    setTimeout(() => {
      const newFile = {
        name: newFileName.trim().endsWith('.pdf') || newFileName.trim().endsWith('.doc') || newFileName.trim().endsWith('.png')
          ? newFileName.trim()
          : `${newFileName.trim()}.pdf`,
        size: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0]
      };
      
      setCaseAttachments(prev => ({
        ...prev,
        [activeCase.id]: [newFile, ...(prev[activeCase.id] || [])]
      }));
      
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'info',
          textAr: `تم رفع وتوطين مستند جديد [${newFile.name}] لملف الموظف ${activeCase.employeeName}`,
          textEn: `Uploaded document: [${newFile.name}] integrated into active employee roster.`,
          date: 'الآن',
          isRead: false
        },
        ...prev
      ]);
      
      setNewFileName('');
      setFileUploadProgress('');
    }, 1000);
  };

  // Filter & sorting for list of cases
  const filteredAndSortedCases = useMemo(() => {
    const rawFiltered = savedCases.filter(c => {
      const matchesSearch = c.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.employeeId?.includes(searchTerm) || 
                            c.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesReason = filterClassification === 'ALL' || c.terminationReason === filterClassification;
      return matchesSearch && matchesReason;
    });

    return rawFiltered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'employeeName') {
        comparison = a.employeeName.localeCompare(b.employeeName, 'ar');
      } else if (sortField === 'netPayable') {
        comparison = (a.netPayable || 0) - (b.netPayable || 0);
      } else if (sortField === 'serviceYears') {
        comparison = (a.serviceYears || 0) - (b.serviceYears || 0);
      } else if (sortField === 'employeeId') {
        comparison = (a.employeeId || '').localeCompare(b.employeeId || '');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [savedCases, searchTerm, filterClassification, sortField, sortDirection]);

  const triggerSort = (field: 'employeeName' | 'netPayable' | 'serviceYears' | 'employeeId') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const tabsList = [
    { id: 'employee', label: 'البيانات الشخصية', icon: UserCheck },
    { id: 'contract', label: 'شروط العقد', icon: FileCode },
    { id: 'calculation', label: 'المكافأة والمحتسب', icon: Calculator },
    { id: 'settlement', label: 'التسوية والموازنة', icon: Sliders },
    { id: 'leaves_accruals', label: 'تعويض الإجازات', icon: Calendar },
    { id: 'deductions', label: 'الاستقطاعات والعهد', icon: Landmark },
    { id: 'declarations', label: 'مسودة المخالصة', icon: ScrollText },
    { id: 'approvals', label: 'التواقيع والاعتمادات', icon: Stamp },
    { id: 'reports_prints', label: 'المؤشرات والتحليل', icon: Activity },
    { id: 'attachments', label: 'الملفات والمرفقات', icon: FolderClosed },
    { id: 'legal_log', label: 'القوانين الكويتي المرجعية', icon: History }
  ];

  const handleLocalSigning = () => {
    if (!activeCase) return;
    const currentName = activeCase.signatures?.[activeRole] || '';
    const updatedSignatures = {
      ...activeCase.signatures,
      [activeRole]: currentName ? '' : `بوابة المبرزة: تم الاعتماد السحابي باسم ${activeRole.toUpperCase()} • تفويض رقم #${Math.floor(Math.random() * 90000 + 10000)}`
    };
    const updatedApprovals = {
      ...activeCase.approvals,
      [activeRole]: currentName ? 'قيد الانتظار' : 'معتمد'
    };
    handleDocumentSignOff(updatedSignatures, updatedApprovals, localApproComment);
    setLocalApproComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-right font-sans" dir="rtl">
      
      {/* 1. SIDEBAR FILES LIST CABINET (Cols 4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Dynamic Search & View Configuration */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 select-none">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setSidebarLayout('cards')}
                className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${sidebarLayout === 'cards' ? 'bg-[#0B332A] text-white' : 'text-slate-400 hover:text-slate-750'}`}
                title="عرض بطاقات تفصيلية"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarLayout('table')}
                className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${sidebarLayout === 'table' ? 'bg-[#0B332A] text-white' : 'text-slate-400 hover:text-slate-750'}`}
                title="عرض جدول الامتثال"
              >
                <TableProperties className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xs font-black text-[#0B332A] font-serif uppercase">سجلات أضابير تصفية الخدمة</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditCase(null);
                setWizardOpen(true);
              }}
              className="px-3.5 h-10 text-[11px] font-black bg-[#B59458] text-[#0B332A] hover:bg-[#D4AF37] rounded-xl cursor-pointer flex items-center justify-center gap-1 border-none shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إدراج ملف</span>
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#B59458] absolute right-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، الرقم المدني..."
                className="w-full h-10 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-[#0B332A] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <div>
              <label className="text-[9px] text-slate-455 block mb-1">سبب الصرف</label>
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-[#0B332A] outline-none cursor-pointer"
              >
                <option value="ALL">الكل</option>
                <option value={TerminationReasonKuwait.RESIGNATION}>استقالة عادية</option>
                <option value={TerminationReasonKuwait.DISMISSAL_WITH_NOTICE}>إنهاء بإخطار</option>
                <option value={TerminationReasonKuwait.CONTRACT_EXPIRY}>انتهاء العقد</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-455 block mb-1">نسخة التدقيق</label>
              <div className="h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-550 select-none">
                صبري شطا (v3.5)
              </div>
            </div>
          </div>
        </div>

        {/* Empty Search State */}
        {savedCases.length > 0 && filteredAndSortedCases.length === 0 && (
          <div className="p-8 bg-white border border-slate-150 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-500/5 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-black text-[#0B332A]">لم نجد أطروحات مطابقة!</h5>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                لا تتوافق مدخلات البحث الحالية مع أية أضابير مدرجة. يرجى إعادة تعيين أو تصفير حقول البحث.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterClassification('ALL');
              }}
              className="h-8 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black border-none cursor-pointer"
            >
              عرض كافة الملفات
            </button>
          </div>
        )}

        {/* LIST RENDER: Cards Mode */}
        {sidebarLayout === 'cards' && filteredAndSortedCases.length > 0 && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredAndSortedCases.map(c => {
              const isSelected = c.id === activeCaseId;
              const statusCol = statusesCatalog.find(st => st.id === c.status) || { labelAr: c.status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all duration-200 text-right flex flex-col justify-between hover:translate-y-[-1px] hover:shadow-xs select-none ${
                    isSelected 
                      ? 'bg-[#0B332A] text-white border-[#B59458] shadow-md ring-1 ring-[#B59458]/30' 
                      : 'bg-white text-slate-800 border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                      <span className={isSelected ? 'text-[#D4AF37] font-black' : 'text-slate-400 font-bold'}>{c.settlementNumber || c.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${statusCol.color}`}>
                        {statusCol.labelAr}
                      </span>
                    </div>
                    <h4 className="text-sm font-black tracking-tight leading-tight">{c.employeeName}</h4>
                    <p className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {c.jobTitle} • {c.nationality}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-slate-200/50 pt-2.5 mt-3">
                    <div className="text-left font-mono">
                      <span className={`text-sm font-black block ${isSelected ? 'text-[#D4AF37]' : 'text-[#0B332A]'}`}>
                        {c.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                      </span>
                      <span className="text-[8.5px] font-bold block opacity-65">الصافي النهائي</span>
                    </div>
                    <div className="text-right text-[10px] font-bold">
                      <span className="opacity-80">الخدمة: </span>
                      <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{c.serviceYears} سنوات</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST RENDER: Table Mode */}
        {sidebarLayout === 'table' && filteredAndSortedCases.length > 0 && (
          <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowColOptions(!showColOptions)}
                className="text-[10px] font-black text-[#0B332A] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5 text-[#B59458]" />
                <span>فرز الأعمدة</span>
              </button>
              <span className="text-[9px] font-bold text-slate-400">تحجيم مدمج</span>
            </div>

            {showColOptions && (
              <div className="p-3 bg-[#FAF9F5] border-b border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.civilId} onChange={() => setVisibleColumns(p=>({...p, civilId: !p.civilId}))} className="accent-[#0B332A]" />
                  <span>الرقم المدني</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.department} onChange={() => setVisibleColumns(p=>({...p, department: !p.department}))} className="accent-[#0B332A]" />
                  <span>الإدارة</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.payout} onChange={() => setVisibleColumns(p=>({...p, payout: !p.payout}))} className="accent-[#0B332A]" />
                  <span>الصافي د.ك</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.serviceYears} onChange={() => setVisibleColumns(p=>({...p, serviceYears: !p.serviceYears}))} className="accent-[#0B332A]" />
                  <span>السنوات</span>
                </label>
              </div>
            )}

            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-[10.5px] border-collapse relative">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-150">
                    <th className={`p-2.5 text-right whitespace-nowrap bg-slate-50 ${frozenColumns ? 'sticky right-0 shadow-2xs z-10' : ''}`}>الاسم</th>
                    {visibleColumns.civilId && <th className="p-2 text-right">الرقم المدني</th>}
                    {visibleColumns.payout && <th className="p-2 text-left">الصافي KWD</th>}
                    {visibleColumns.serviceYears && <th className="p-2 text-center">خدمة</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAndSortedCases.map(c => {
                    const isSelected = c.id === activeCaseId;
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setActiveCaseId(c.id)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer select-none ${isSelected ? 'bg-slate-100/55 !font-black text-[#0B332A]' : ''}`}
                      >
                        <td className={`p-2.5 font-bold whitespace-nowrap bg-white text-slate-800 ${frozenColumns ? 'sticky right-0' : ''} ${isSelected ? '!bg-slate-50' : ''}`}>
                          {c.employeeName.split(' ')[0]} {c.employeeName.split(' ')[1] || ''}
                        </td>
                        {visibleColumns.civilId && <td className="p-2 text-slate-500 font-mono">{c.employeeId}</td>}
                        {visibleColumns.payout && <td className="p-2 text-left font-mono font-black text-slate-900">{c.netPayable.toLocaleString()}</td>}
                        {visibleColumns.serviceYears && <td className="p-2 text-center font-semibold">{c.serviceYears}س</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mini Alerts Broadcaster */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-black text-slate-400 font-mono">LIVE SYSTEMS</span>
            <span className="text-xs font-black text-[#0B332A] flex items-center gap-1">
              <span>آخر الاتصالات والاعتمادات</span>
              <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </span>
          </div>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar text-right">
            {notifications.slice(0, 3).map(n => (
              <div 
                key={n.id} 
                className={`p-3 rounded-xl border space-y-1 text-[11px] font-semibold leading-relaxed ${
                  n.type === 'urgent' ? 'bg-rose-500/5 border-rose-200 text-rose-950' :
                  n.type === 'warning' ? 'bg-amber-500/5 border-amber-200 text-amber-950' :
                  'bg-blue-500/5 border-blue-200 text-blue-950'
                }`}
              >
                <p className="font-bold">{n.textAr}</p>
                <span className="text-[9px] text-slate-400 block font-normal">{n.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2. CORE WORKSPACE WORKSTATION CONTROL SUITE (Cols 8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {activeCase ? (
          <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs space-y-5">
            
            {/* Active Dossier Header */}
            <div className="p-6 bg-[#0B332A] border-b border-[#B59458]/40 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#B59458]/5 pointer-events-none" />
              <div className="relative z-10 text-right space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-[#B59458]/30 text-[#D4AF37] text-[10px] px-2.5 py-0.5 rounded-full border border-yellow-300/25 font-black">
                    <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
                    <span>سجل التسوية والامتياز المالي للشركاء</span>
                  </span>
                  <span className="font-mono text-[10px] text-zinc-300">Ref: {activeCase.settlementNumber || activeCase.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-white">{activeCase.employeeName}</h2>
                <p className="text-xs text-slate-300 font-semibold">
                  {activeCase.jobTitle} • قسم {activeCase.department} • جنسية: {activeCase.nationality}
                </p>
              </div>

              {/* Top outstanding balance badge */}
              <div className="bg-white/10 border border-[#B59458]/35 p-4 rounded-xl font-mono text-left shrink-0 relative z-10">
                <span className="text-[10px] text-[#D4AF37] block font-black text-right">رصيد الصرف الصافي (د.ك)</span>
                <span className="text-2xl font-black text-[#D4AF37] tracking-tight">
                  {liveCalculations ? liveCalculations.netPayout.toLocaleString(undefined, { minimumFractionDigits: 3 }) : activeCase.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                </span>
                <span className="text-[9px] text-[#FAF9F5]/70 block text-right mt-1">تصفية شاملة وحوالة معتمدة</span>
              </div>
            </div>

            {/* Smart Validation bar */}
            <div className="px-6 py-3 bg-[#FAF9F5] border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-right text-xs">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#B59458] shrink-0" />
                <p className="font-bold text-slate-700 leading-relaxed text-right">
                  {civilIdError ? (
                    <span className="text-rose-700 font-black">{civilIdError}</span>
                  ) : (
                    <span>تأكيد الأمان الدستوري: ملف العامل معتمد ومطابق لأحكام المادتين (51) و(53) من قوانين التدقيق والإنهاء الكويتية.</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => triggerLegalAuditAI('audit')}
                className="h-8 px-4 bg-[#0B332A] hover:bg-[#134D41] text-[#D4AF37] text-[10.5px] font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shrink-0 border-none shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>تشغيل معالج الفحص AI</span>
              </button>
            </div>

            {/* Direct Workflow Accelarator */}
            <div className="px-6 mt-2">
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-black text-[#0B332A]">
                  <span className="text-[10px] bg-[#B59458] text-white px-2 py-0.5 rounded">تسريع فوري</span>
                  <div className="flex items-center gap-1.5 font-serif">
                    <Sparkles className="w-4 h-4 text-[#B59458]" />
                    <span>شعبة التسييل والاعتماد المباشر (Direct Jump)</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-extrabold text-slate-700 select-none">
                  <button 
                    onClick={() => setWorkspaceTab('calculation')}
                    className={`p-2 rounded-xl bg-white border transition-colors cursor-pointer flex flex-col items-center gap-1.5 ${workspaceTab === 'calculation' ? 'border-[#B59458] bg-[#FAF9F5] text-[#0B332A]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Calculator className="w-4 h-4 text-[#B59458]" />
                    <span>مكافأة الخدمة</span>
                  </button>
                  <button 
                    onClick={() => setWorkspaceTab('settlement')}
                    className={`p-2 rounded-xl bg-white border transition-colors cursor-pointer flex flex-col items-center gap-1.5 ${workspaceTab === 'settlement' ? 'border-[#B59458] bg-[#FAF9F5] text-[#0B332A]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Sliders className="w-4 h-4 text-[#0B332A]" />
                    <span>تعديل الرواتب</span>
                  </button>
                  <button 
                    onClick={() => setWorkspaceTab('declarations')}
                    className={`p-2 rounded-xl bg-white border transition-colors cursor-pointer flex flex-col items-center gap-1.5 ${workspaceTab === 'declarations' ? 'border-[#B59458] bg-[#FAF9F5] text-[#0B332A]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <ScrollText className="w-4 h-4 text-emerald-600" />
                    <span>مسودة الصلح</span>
                  </button>
                  <button 
                    onClick={() => setWorkspaceTab('approvals')}
                    className={`p-2 rounded-xl bg-white border transition-colors cursor-pointer flex flex-col items-center gap-1.5 ${workspaceTab === 'approvals' ? 'border-[#B59458] bg-[#FAF9F5] text-[#0B332A]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Stamp className="w-4 h-4 text-purple-600" />
                    <span>إدراج التواقيع</span>
                  </button>
                  <button 
                    onClick={() => setIsPrintModalOpen(true)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>طباعة الصك</span>
                  </button>
                  <button 
                    onClick={() => {
                      setEditCase(activeCase);
                      setWizardOpen(true);
                    }}
                    className="p-2 rounded-xl bg-[#0B332A] text-white hover:bg-[#134D41] transition-colors cursor-pointer flex flex-col items-center gap-1.5 border-none"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span>تحديث السجل</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Ribbon Horizontal Scroll Navigation Slider */}
            <div className="px-6 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-2 overflow-x-auto select-none py-2.5 no-scrollbar">
                {tabsList.map(tab => {
                  const Icon = tab.icon;
                  const isActive = workspaceTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setWorkspaceTab(tab.id)}
                      className={`h-9 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                        isActive 
                          ? 'bg-[#0B332A] text-[#D4AF37] border-[#B59458] shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:text-[#0B332A] hover:bg-slate-55'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SWITCH THE DYNAMIC WORKSPACE TABS */}
            <div className="p-6">
              
              {/* TAB 1: Employee details form */}
              {workspaceTab === 'employee' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <UserCheck className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">الهوية الشخصية وبيان التعاقد المسجل</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-right text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 block">الاسم القانوني الكامل بالتنقيد</label>
                      <input
                        type="text"
                        value={activeCase.employeeName}
                        onChange={(e) => handleDirectFieldUpdate('employeeName', e.target.value)}
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B332A] font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 block">الرقم المدني الكويتي</label>
                      <input
                        type="text"
                        value={activeCase.employeeId}
                        onChange={(e) => handleDirectFieldUpdate('employeeId', e.target.value)}
                        className={`w-full h-11 px-3 bg-[#FAF9F5] border rounded-xl focus:outline-none font-mono font-bold ${civilIdError ? 'border-rose-400' : 'border-slate-205 focus:border-[#0B332A] text-slate-850'}`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 block">الجنسية العادية المسجلة</label>
                      <input
                        type="text"
                        value={activeCase.nationality}
                        onChange={(e) => handleDirectFieldUpdate('nationality', e.target.value)}
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B332A] font-bold text-slate-850"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 block">المسمى والمهنة</label>
                      <input
                        type="text"
                        value={activeCase.jobTitle}
                        onChange={(e) => handleDirectFieldUpdate('jobTitle', e.target.value)}
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B332A] font-bold text-slate-850"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 block">القطاع / الإدارة الكلية</label>
                      <input
                        type="text"
                        value={activeCase.department}
                        onChange={(e) => handleDirectFieldUpdate('department', e.target.value)}
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B332A] font-bold text-slate-850"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 block">رقم الاتصال المباشر</label>
                      <input
                        type="text"
                        defaultValue="+965-9982-1254"
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl focus:outline-none font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#B59458]/10 text-slate-700 font-bold border border-[#B59458]/30 rounded-xl text-xs leading-relaxed">
                    ملاحظة: تعديل حقول الهوية سينعكس مباشرة في جداول الأضابير، مسودة مخالصة إبراء الذمة، وملف التحويل البنكي.
                  </div>
                </div>
              )}

              {/* TAB 2: Contracts and timing */}
              {workspaceTab === 'contract' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FileCode className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">شروط العقد ومدار الخدمة المسجلة</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-right text-xs">
                    <div className="space-y-1.5 font-bold">
                      <label className="text-[10px] font-black text-slate-400 block">طبيعة العقد عمالياً</label>
                      <select
                        value={activeCase.contractType}
                        onChange={(e) => handleDirectFieldUpdate('contractType', e.target.value)}
                        className="w-full h-11 px-2 bg-[#FAF9F5] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-[#0B332A]"
                      >
                        <option value="UNLIMITED">مفتوح المدة (غير محدد)</option>
                        <option value="LIMITED">محدد المدة والزمن</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 font-bold">
                      <label className="text-[10px] font-black text-slate-400 block">تاريخ مباشرة العمل والتعاقد</label>
                      <input
                        type="date"
                        value={activeCase.joiningDate}
                        onChange={(e) => handleDirectFieldUpdate('joiningDate', e.target.value)}
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl font-semibold focus:border-[#0B332A]"
                      />
                    </div>
                    <div className="space-y-1.5 font-bold">
                      <label className="text-[10px] font-black text-slate-400 block">تاريخ الإنهاء والمغادرة الفعلية</label>
                      <input
                        type="date"
                        value={activeCase.lastWorkingDay}
                        onChange={(e) => handleDirectFieldUpdate('lastWorkingDay', e.target.value)}
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl font-semibold focus:border-[#0B332A]"
                      />
                    </div>
                    <div className="space-y-1.5 font-bold">
                      <label className="text-[10px] font-black text-slate-400 block">طريقة حساب المكافأة وسن القيد</label>
                      <div className="h-11 flex items-center px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl text-slate-800 font-extrabold text-xs">
                        القطاع الأهلي الكويتي (المادة 51)
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0B332A]/5 border border-[#B59458]/25 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black text-[#0B332A] font-serif">الاستحقاق الزمني المعتمد لسنوات العطاء</h4>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs font-extrabold">
                      <div className="bg-white border p-3 rounded-xl shadow-2xs">
                        <span className="block text-xl font-black text-[#0B332A] font-mono">{activeCase.serviceYears}</span>
                        <span className="text-[9px] text-slate-450 block mt-1">سنوات</span>
                      </div>
                      <div className="bg-white border p-3 rounded-xl shadow-2xs">
                        <span className="block text-xl font-black text-[#0B332A] font-mono">{activeCase.serviceMonths}</span>
                        <span className="text-[9px] text-slate-450 block mt-1">شهور متبقية</span>
                      </div>
                      <div className="bg-white border p-3 rounded-xl shadow-2xs">
                        <span className="block text-xl font-black text-[#0B332A] font-mono">{activeCase.serviceDays || 0}</span>
                        <span className="text-[9px] text-slate-450 block mt-1">أيام إضافية</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Statutary calculation bento Math */}
              {workspaceTab === 'calculation' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Calculator className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">حوسبة مكافأة الخدمة بموجب المادتين (51) و(53)</h3>
                  </div>

                  {liveCalculations ? (
                    <div className="space-y-4">
                      {/* Breakdown grid cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold leading-normal">
                        <div className="p-4 bg-[#FAF9F5] border border-slate-200/60 rounded-xl space-y-2 text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-black">الخمس سنوات الأولى (مادة 51)</span>
                          <p className="text-lg font-black text-[#0B332A] font-mono">
                            {liveCalculations.breakdown.firstFiveYearsAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                          </p>
                          <span className="text-[9px] text-amber-800 block">معدل الاحتساب: أجر 15 يوماً عن كل سنة</span>
                        </div>

                        <div className="p-4 bg-[#FAF9F5] border border-slate-200/60 rounded-xl space-y-2 text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-black">السنوات التالية (ماده 51)</span>
                          <p className="text-lg font-black text-[#0B332A] font-mono">
                            {liveCalculations.breakdown.subsequentYearsAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                          </p>
                          <span className="text-[9px] text-emerald-800 block">معدل الاحتساب: أجر شهر كامل عن كل سنة</span>
                        </div>
                      </div>

                      {/* Cumulative detail ledger */}
                      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden text-xs">
                        <div className="p-3.5 bg-slate-50 text-[#0B332A] font-black border-b border-slate-100 uppercase">
                          ميزان تفصيل الحسبة القانونية
                        </div>
                        <div className="divide-y divide-slate-100 font-bold select-none">
                          <div className="p-3 flex justify-between items-center text-right">
                            <span className="text-slate-500">معدل الراتب الإجمالي اليومي (على أساس 26 يوماً)</span>
                            <span className="font-mono text-slate-800">{liveCalculations.dailyRate.toFixed(3)} د.ك / يوم</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-right">
                            <span className="text-slate-500">مدة احتساب الخدمة الكلية</span>
                            <span className="text-slate-800">{activeCase.serviceYears} سنة و {activeCase.serviceMonths} أشهر</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-right bg-slate-50/50">
                            <span className="text-[#0B332A] font-extrabold">المكافأة المحتسبة قبل ضرب معامل الاستقالة</span>
                            <span className="font-mono text-slate-800">{(liveCalculations.breakdown.firstFiveYearsAmount + liveCalculations.breakdown.subsequentYearsAmount).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-right bg-emerald-500/5">
                            <span className="text-emerald-800 font-extrabold">قيمة مكافأة نهاية الخدمة المعتمدة قانونياً للامتثال</span>
                            <span className="font-mono text-emerald-700 text-sm font-black">{liveCalculations.indemnity.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl text-[10.5px] leading-relaxed text-slate-550 border border-slate-150 font-medium">
                        <strong className="text-slate-800">صيغة القانون الكويتي:</strong> يتم جمع (رواتب 15 يوماً عن كل سنة للخمس سنوات الأولى) + (رواتب شهر كامل عن سنوات الخدمة المتبقية)، ويخضع الناتج لمعايير المادة 53 من دوران المخدم ونسب الاستقالات إذا تقدم العامل بطلبه.
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-slate-400">لا تتوفر حسبة صالحة للموظف</div>
                  )}
                </div>
              )}

              {/* TAB 4: Settlement dynamic adjusted knobs */}
              {workspaceTab === 'settlement' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Sliders className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">معالج الضبط وتعديل الأجور والبدلات والموازنة</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right text-xs bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs">
                    
                    {/* Basic salary adjust */}
                    <div className="space-y-2 font-bold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الراتب الأساسي الشهري (د.ك)</span>
                        <span className="font-mono text-[#0B332A] font-black">{inlineValues.basicSalary}</span>
                      </div>
                      <input
                        type="range"
                        min={150}
                        max={3000}
                        step={25}
                        value={inlineValues.basicSalary}
                        onChange={(e) => setInlineValues(p => ({ ...p, basicSalary: Number(e.target.value) }))}
                        className="w-full accent-[#B59458]"
                      />
                    </div>

                    {/* allowances adjust */}
                    <div className="space-y-2 font-bold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">البدلات الثابتة شهرياً (د.ك)</span>
                        <span className="font-mono text-[#0B332A] font-black">{inlineValues.allowances}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2000}
                        step={25}
                        value={inlineValues.allowances}
                        onChange={(e) => setInlineValues(p => ({ ...p, allowances: Number(e.target.value) }))}
                        className="w-full accent-[#B59458]"
                      />
                    </div>

                    {/* other additions adjust */}
                    <div className="space-y-2 font-bold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">مكافآت وإضافات وامتيازات أخرى (د.ك)</span>
                        <span className="font-mono text-emerald-700 font-black">{inlineValues.otherAdditions}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5000}
                        step={50}
                        value={inlineValues.otherAdditions}
                        onChange={(e) => setInlineValues(p => ({ ...p, otherAdditions: Number(e.target.value) }))}
                        className="w-full accent-[#0B332A]"
                      />
                    </div>

                    {/* disciplinary deductions adjust */}
                    <div className="space-y-2 font-bold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">استقطاعات تأديبية ومخالفات لائحة ((-) د.ك)</span>
                        <span className="font-mono text-rose-700 font-black">{inlineValues.disciplinaryDeductions}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        step={10}
                        value={inlineValues.disciplinaryDeductions}
                        onChange={(e) => setInlineValues(p => ({ ...p, disciplinaryDeductions: Number(e.target.value) }))}
                        className="w-full accent-rose-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 font-bold select-none">
                    <button
                      onClick={() => {
                        setInlineValues({
                          basicSalary: activeCase.basicSalary,
                          allowances: activeCase.allowances || 0,
                          leaveDays: activeCase.leaveBalanceDays || 0,
                          absenceDays: activeCase.absenceDays || 0,
                          otherAdditions: activeCase.otherBonuses || 0,
                          disciplinaryDeductions: activeCase.disciplinaryDeductions || 0
                        });
                      }}
                      className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs cursor-pointer border-none"
                    >
                      تصفير التعديلات المؤقتة
                    </button>
                    <button
                      onClick={handleSaveInlineCalculations}
                      className="h-10 px-5 bg-[#0B332A] hover:bg-[#134D41] text-[#D4AF37] rounded-xl text-xs cursor-pointer border-none shadow-sm font-black"
                    >
                      حفظ ومزامنة الحسبة الاستراتيجية للموظف
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: Annual leave compensations */}
              {workspaceTab === 'leaves_accruals' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Calendar className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">حقول احتساب تعويض كاش الإجازات غير المستهلكة (المادة 70)</h3>
                  </div>

                  {liveCalculations ? (
                    <div className="space-y-5 text-right text-xs font-bold leading-normal">
                      <div className="p-5 bg-white border border-slate-150 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-5 shadow-2xs">
                        <div className="space-y-2">
                          <label className="text-slate-500">رصيد الإجازات المتبقية المعترف بها (يوم)</label>
                          <input
                            type="number"
                            value={inlineValues.leaveDays}
                            onChange={(e) => setInlineValues(p => ({ ...p, leaveDays: Number(e.target.value) }))}
                            className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl font-mono text-right font-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-slate-500">الأجر اليومي لتعويض الإجازة (إجمالي / 26 يوماً)</label>
                          <div className="h-11 flex items-center px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl font-mono text-left font-black text-[#0B332A]">
                            {liveCalculations.dailyRate.toFixed(3)} د.ك / يوم
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-200 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-slate-400 font-black">إجمالي قيمة تعويض الإجازات</span>
                          <span className="text-sm text-slate-500 block">يرحل المخصص تلقائياً إلى صك إبراء الذمة وصكوك الصرف الكلية.</span>
                        </div>
                        <span className="font-mono text-xl font-black text-emerald-700 shrink-0">
                          {liveCalculations.leaveCompensation.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-slate-400">لا تتوفر معلومات الحسبة</div>
                  )}
                </div>
              )}

              {/* TAB 6: Deductions & lost assets panel */}
              {workspaceTab === 'deductions' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Landmark className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">بيان لتصفية الأصول والعهود والذمم المالية (-)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-normal text-right">
                    
                    {/* Left Column: Handover table (7 cols) */}
                    <div className="md:col-span-7 bg-white border border-slate-150 rounded-2xl p-4 shadow-2xs space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
                        <span className="text-[10px] text-[#B59458] font-black">أمان تكنولوجيا المعلومات</span>
                        <h4 className="text-xs font-black text-[#0B332A] font-serif">مسرد العهد والأجهزة المسلمة للموظف</h4>
                      </div>

                      <div className="space-y-3.5 text-xs text-slate-700 font-bold select-none">
                        {/* laptop */}
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                          <div className="flex items-center gap-2 text-right">
                            <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>كمبيوتر محمول للوظيفة (العادي / تابلت)</span>
                          </div>
                          <select
                            value={checkedAssets.laptop}
                            onChange={(e) => setCheckedAssets(p => ({ ...p, laptop: e.target.value }))}
                            className="bg-white border rounded h-8 px-1.5 font-bold cursor-pointer text-[10.5px] text-[#0B332A]"
                          >
                            <option value="returned">مستلم سليم</option>
                            <option value="lost">مفقود (خصم 450 دينار)</option>
                          </select>
                        </div>

                        {/* badge */}
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                          <div className="flex items-center gap-2 text-right">
                            <CheckSquare className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>بطاقة المرور والوصول للمركز الرئيسي</span>
                          </div>
                          <select
                            value={checkedAssets.badge}
                            onChange={(e) => setCheckedAssets(p => ({ ...p, badge: e.target.value }))}
                            className="bg-white border rounded h-8 px-1.5 font-bold cursor-pointer text-[10.5px] text-[#0B332A]"
                          >
                            <option value="returned">مستلم سليم</option>
                            <option value="lost">مفقود (خصم 15 دينار)</option>
                          </select>
                        </div>

                        {/* keys */}
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                          <div className="flex items-center gap-2 text-right">
                            <Key className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>المفاتيح الميكانيكية وإبراء الأقفال</span>
                          </div>
                          <select
                            value={checkedAssets.keys}
                            onChange={(e) => setCheckedAssets(p => ({ ...p, keys: e.target.value }))}
                            className="bg-white border rounded h-8 px-1.5 font-bold cursor-pointer text-[10.5px] text-[#0B332A]"
                          >
                            <option value="returned">مستلم سليم</option>
                            <option value="lost">مفقود (خصم 25 دينار)</option>
                          </select>
                        </div>

                        {/* car */}
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                          <div className="flex items-center gap-2 text-right font-bold truncate">
                            <Landmark className="w-4 h-4 text-[#B59458] shrink-0" />
                            <span>عهدة عينية أخرى (سيارة / تابلت كبار)</span>
                          </div>
                          <select
                            value={checkedAssets.car}
                            onChange={(e) => setCheckedAssets(p => ({ ...p, car: e.target.value }))}
                            className="bg-white border rounded h-8 px-1.5 font-bold cursor-pointer text-[10.5px] text-[#0B332A]"
                          >
                            <option value="returned">مستلم سليم</option>
                            <option value="lost">مفقود (خصم 2800 دينار)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right column: outstanding loan offsets (5 cols) */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="bg-[#0B332A]/5 border border-[#B59458]/25 rounded-2xl p-5 space-y-4 text-right">
                        <h4 className="text-xs font-black text-[#0B332A] font-serif">قائمة المقاصة المالية والاقتطاعات</h4>
                        
                        <div className="text-xs font-bold text-slate-700 font-sans space-y-3 select-none">
                          <div className="flex justify-between items-center">
                            <span>عهد مفقودات الأجهزة</span>
                            <span className="font-mono text-rose-700">{liveCalculations ? liveCalculations.assetDeductions : 0} د.ك</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>مقاصة القروض الشخصية</span>
                            <span className="font-mono text-slate-800">{activeCase.loansDeduction} د.ك</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>استقطاعات الغيابات السلوكية</span>
                            <span className="font-mono text-slate-800">{liveCalculations ? (liveCalculations.absenceDeduct + inlineValues.disciplinaryDeductions) : 0} د.ك</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 font-black text-rose-700">
                            <span>جملة مبالغ الخصم المبرز</span>
                            <span className="font-mono ">{activeCase.loansDeduction + (liveCalculations ? liveCalculations.assetDeductions + liveCalculations.absenceDeduct + inlineValues.disciplinaryDeductions : 0)} د.ك</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 7: Declaration Release text editor */}
              {workspaceTab === 'declarations' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <ScrollText className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">صياغة مستند إبراء الذمة المطلق للتوقيع والاعتماد</h3>
                  </div>

                  <div className="space-y-4 text-right leading-relaxed text-xs font-bold">
                    <p className="text-slate-500">بإمكانك صياغة أو إعادة قيد شروط إبراء الذمة المتبادل الموثق في محضر انتهاء العلاقة العمالية، وسيتم طباعته تلقائياً على الترويسة الرسمية.</p>
                    
                    <textarea
                      value={customDeclarationText}
                      onChange={(e) => setCustomDeclarationText(e.target.value)}
                      rows={6}
                      className="w-full p-4 bg-[#FAF9F5] border border-slate-200 rounded-3xl text-slate-800 outline-none focus:border-[#B59458] font-Tajawal font-semibold leading-relaxed text-right"
                    />

                    <div className="p-4 bg-amber-500/5 border border-amber-250 text-amber-940 rounded-xl">
                      <strong>تنبيه قانوني هام:</strong> إقرار إبراء الذمة ينهي تماماً أية مخاصمات عمالية أمام محاكم دولة الكويت طبقاً للأحكام العامة لمخالصات الصلح القضائية بتبادل الامتيازات.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: Corporate approval signing boards */}
              {workspaceTab === 'approvals' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Stamp className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">شعبة مصفوفة اعتمادات صك تصفية نهاية الخدمة</h3>
                  </div>

                  <div className="space-y-5">
                    {/* Active signing role switcher slider */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 block text-right uppercase">الصفة الوظيفية للموقع النشط حالياً</span>
                      <div className="flex flex-wrap gap-2 pt-1 font-bold">
                        {(['hr', 'legal', 'finance', 'gm', 'executive'] as const).map(role => {
                          const isActive = activeRole === role;
                          const currentName = activeCase.signatures?.[role] || '';
                          return (
                            <button
                              key={role}
                              onClick={() => setActiveRole(role as any)}
                              className={`px-3 py-2 rounded-xl text-[10.5px] border cursor-pointer select-none transition-all ${
                                isActive 
                                  ? 'bg-[#0B332A] text-[#D4AF37] border-[#B59458] font-black shadow-xs' 
                                  : 'bg-white text-slate-650 border-slate-200/60 hover:bg-slate-50'
                              }`}
                            >
                              <span>{role.toUpperCase()}</span>
                              {currentName && <span className="mr-1.5 text-xs text-emerald-500">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive review comment */}
                    <div className="space-y-2 text-right text-xs font-bold leading-normal">
                      <label className="text-slate-500 block">مرئيات ومذكرة التدقيق المرفقة للإمضاء</label>
                      <input
                        type="text"
                        value={localApproComment}
                        onChange={(e) => setLocalApproComment(e.target.value)}
                        placeholder="أدخل اية ملاحظات إضافية يتم حوسبتها وتوقيعها مع الختم تلقائياً..."
                        className="w-full h-11 px-3 bg-[#FAF9F5] border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B332A]"
                      />
                    </div>

                    {/* Main seal stamp box */}
                    <div className="p-6 border border-dashed border-slate-250 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-4 text-center select-none font-bold">
                      <Stamp className="w-10 h-10 text-[#0B332A]" />
                      <div className="space-y-1">
                        <h6 className="text-[#0B332A] text-sm font-black">الاعتماد والختم السلكي الوطني الموحد</h6>
                        <p className="text-[10px] text-slate-400 font-semibold max-w-sm">
                          عند النقر، يتم استخدام مفاتيح التشفير الوطنية المترابطة بالمكتب لمصادقة صك حقوق الموظف {activeCase.employeeName} وإرسال إشعار الصرف.
                        </p>
                      </div>

                      <button
                        onClick={handleLocalSigning}
                        className="h-10 px-6 bg-[#0B332A] hover:bg-[#134D41] text-[#D4AF37] rounded-xl text-xs cursor-pointer border-none shadow-sm font-black"
                      >
                        {activeCase.signatures?.[activeRole] ? 'سحب الاعتماد الحالي' : 'إمضاء السند والختم السلكي كمفوض'}
                      </button>
                    </div>

                    {/* All sign status panel */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-3">
                      <h5 className="text-xs font-black text-slate-800">حالة التواقيع المؤرشفة على السند</h5>
                      <div className="divide-y divide-slate-100 text-xs font-bold text-slate-700 select-none text-right">
                        <div className="py-2.5 flex justify-between items-center">
                          <span>الموارد البشرية (HR):</span>
                          <span className={activeCase.signatures?.hr ? 'text-emerald-700' : 'text-slate-450'}>
                            {activeCase.signatures?.hr || 'بانتظار اخصائي الموارد البشرية'}
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between items-center">
                          <span>المستشار القانوني للمنظمة (LEGAL):</span>
                          <span className={activeCase.signatures?.legal ? 'text-emerald-700' : 'text-slate-450'}>
                            {activeCase.signatures?.legal || 'بانتظار توقيع د. صبري شطا'}
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between items-center">
                          <span>الرقابة المالية والتدقيق (FIN):</span>
                          <span className={activeCase.signatures?.fin ? 'text-emerald-700' : 'text-slate-450'}>
                            {activeCase.signatures?.fin || 'بانتظار المدير المالي المعتمد'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 9: High productivity analytics reports for directors */}
              {workspaceTab === 'reports_prints' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 select-none">
                    <Activity className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-[#0B332A] font-serif">بوابات التحليل والمؤشرات وطباعة السندات</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-normal">
                    {/* Charts summary details */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 text-right select-none font-bold">
                      <h4 className="text-xs font-black text-[#0B332A] font-serif">توقعات تكافؤ الخدمة والتدفق النقدي</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        يؤمن مكتب صبري شطا الفرز والتقدير التراكمي لمقاصات المغادرات ومستحقات الموظف لثلاث سنوات مقبلة لتفادي أية جزاءات من الهيئة السنوية للأجور.
                      </p>

                      <div className="h-44 mt-4 w-full text-xs font-serif">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { quarter: 'Q1', dues: 8000 },
                            { quarter: 'Q2', dues: 12400 },
                            { quarter: 'Q3', dues: activeCase.netPayable || 9000 },
                            { quarter: 'Q4', dues: 14000 }
                          ]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <XAxis dataKey="quarter" stroke="#cbd5e1" tick={{ fontSize: 9 }} />
                            <YAxis stroke="#cbd5e1" tick={{ fontSize: 8 }} />
                            <Area type="monotone" dataKey="dues" stroke="#B59458" fill="#B59458" fillOpacity={0.15} strokeWidth={2.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pre-print controls */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 text-right font-bold text-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-[#0B332A] font-serif">توطيد صك إبراء الذمة والطباعة المروّسة</h4>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          بإمكانك إطلاق شاشة المعاينة الفورية وصك الطباعة المروّسة لمخالصة {activeCase.employeeName} المحتسبة لتوقيعها حياً والامتثال التام لقوانين العمل بدولة الكويت.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="w-full h-11 bg-[#0B332A] hover:bg-[#134D41] text-[#D4AF37] rounded-xl text-xs font-black border-none flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-colors"
                      >
                        <Printer className="w-4 h-4 font-black" />
                        <span>معاينة فنية وإطلاق الصك المطبوع</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: Files and attachments details */}
              {workspaceTab === 'attachments' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FolderClosed className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">حقيبة المستندات والمرفقات المعتمدة بالقيد</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-normal text-right">
                    
                    {/* Add attachment form (5 cols) */}
                    <form onSubmit={handleSimulatedUpload} className="md:col-span-5 bg-slate-50 border border-slate-200/50 rounded-2.5xl p-5 space-y-4 font-bold text-xs">
                      <h4 className="text-xs font-black text-[#0B332A] font-serif">رفع مستند جديد للشبكة السلكية</h4>
                      
                      <div className="space-y-2">
                        <label className="text-slate-550 block">اسم المستند التعاقدي / براءة الذمة</label>
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="مثال: البطاقة_المدنية_أحمد.pdf"
                          className="w-full h-11 px-3 bg-white border border-slate-205 rounded-xl font-bold"
                        />
                      </div>

                      {fileUploadProgress && (
                        <div className="text-[10.5px] text-emerald-800 font-semibold flex items-center gap-1.5 py-1">
                          <Bot className="w-4 h-4 text-emerald-600 animate-bounce" />
                          <span>{fileUploadProgress}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!newFileName.trim() || !!fileUploadProgress}
                        className="w-full h-11 bg-[#0B332A] hover:bg-[#134D41] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <FileUp className="w-4 h-4 shrink-0" />
                        <span>تأكيد الرفع السحابي للمستند</span>
                      </button>
                    </form>

                    {/* Files roster list (7 cols) */}
                    <div className="md:col-span-7 bg-white border border-slate-150 rounded-2.5xl p-4 shadow-2xs space-y-3">
                      <h4 className="text-xs font-black text-slate-800 font-serif pb-2 border-b border-slate-100">سجل المستندات المودعة بالقيد</h4>
                      
                      {currentAttachments.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 text-xs font-medium">
                          لا توجد مرفقات مودعة حالياً بالقيد الرقمي للموظف.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {currentAttachments.map((f, i) => (
                            <div key={i} className="p-3 bg-[#FAF9F5] border border-slate-155 rounded-xl flex items-center justify-between text-xs font-bold">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-[#B59458] shrink-0" />
                                <div className="text-right">
                                  <span className="block text-slate-800 font-black text-ellipsis overflow-hidden max-w-[150px]">{f.name}</span>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">{f.size} • {f.date}</span>
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => alert(`محاكاة تحميل ملف: ${f.name}`)}
                                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-[#0B332A] hover:bg-slate-50 cursor-pointer text-[10px]"
                                >
                                  تحميل
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if(confirm('هل تريد حذف المستند سحابياً؟')) {
                                      setCaseAttachments(p => ({
                                        ...p,
                                        [activeCase.id]: p[activeCase.id].filter(x => x.name !== f.name)
                                      }));
                                    }
                                  }}
                                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer text-[10px]"
                                >
                                  حذف
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 11: Statutory references with AI audit logs */}
              {workspaceTab === 'legal_log' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <History className="w-4.5 h-4.5 text-[#B59458]" />
                    <h3 className="text-sm font-black text-[#0B332A] font-serif">الموسوعة الكويتية المرجعية وأصداء قوانين العمل</h3>
                  </div>

                  <div className="space-y-5 leading-relaxed text-xs">
                    
                    {/* Collapsible reference cards of labour law */}
                    <div className="grid grid-cols-1 gap-3 text-right font-bold select-none">
                      {legalArticlesData.map((art, idx) => (
                        <div key={idx} className="p-4 bg-[#FAF9F5] rounded-2xl border border-slate-200 hover:border-[#B59458]/40 transition-colors">
                          <span className="text-[10px] text-[#B59458] font-black uppercase tracking-wider block mb-1">{art.article}</span>
                          <p className="text-slate-800 leading-relaxed font-semibold">{art.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Integrated AI auditor with direct controls */}
                    <div className="bg-[#0B332A] border-2 border-double border-[#B59458]/55 text-white p-5 rounded-2.5xl space-y-4">
                      <div className="flex justify-between items-center text-right border-b border-white/10 pb-3">
                        <span className="font-mono text-[9px] font-black text-[#D4AF37] bg-white/10 px-2 py-0.5 rounded">صبري شطا AI CO-PILOT</span>
                        <h4 className="text-xs sm:text-sm font-black text-white font-serif flex items-center gap-1.5">
                          <Bot className="w-5 h-5 text-[#D4AF37]" />
                          <span>التحقق من الامتثال والتحليل الذكي بواسطة Gemini API</span>
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        قم بتشغيل الفحص التلقائي للامتثال والبحث السحابي لملاءمة مستحقات {activeCase.employeeName} أو تحري مخاطر النزاع القضائي أمام القوى العاملة الكويتية.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1 font-bold">
                        <button
                          onClick={() => triggerLegalAuditAI('audit')}
                          disabled={aiPending}
                          className="px-4 h-9 bg-[#B59458] hover:bg-[#D4AF37] text-[#0B332A] text-[11px] font-black rounded-xl cursor-pointer border-none flex items-center gap-1"
                        >
                          <span>فحص الامتثال الكلي (المادة 51)</span>
                        </button>
                        <button
                          onClick={() => triggerLegalAuditAI('risk')}
                          disabled={aiPending}
                          className="px-4 h-9 bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-black rounded-xl cursor-pointer border-none flex items-center gap-1"
                        >
                          <span>تحليل مخاطر النزاع القضائي</span>
                        </button>
                        <button
                          onClick={() => triggerLegalAuditAI('recs')}
                          disabled={aiPending}
                          className="px-4 h-9 bg-[#134D41] hover:bg-[#186152] text-white text-[11px] font-black rounded-xl cursor-pointer border-none flex items-center gap-1"
                        >
                          <span>صياغة مسودة مخالصة بليغة</span>
                        </button>
                      </div>

                      {aiActive && (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 mt-4 text-right">
                          <h5 className="text-xs font-black text-[#D4AF37] font-serif">تقرير خبير الذكاء الاصطناعي للمنظمة</h5>
                          {aiPending ? (
                            <div className="text-zinc-300 h-10 flex items-center gap-2 font-semibold">
                              <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-pulse shrink-0" />
                              <span>جاري إخضاع السند للتدقيق واستدعاء آراء صبري شطا القانونية...</span>
                            </div>
                          ) : (
                            <p className="text-[11.5px] text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">{aiReport}</p>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="p-16 text-center select-none bg-white border border-slate-150 rounded-3xl space-y-3 font-semibold text-slate-400">
            <X className="w-12 h-12 text-slate-350 mx-auto" />
            <p className="text-sm">لم يتم العثور على أضابير تصفية صالحة. يرجى اختيار ملف من الجانب الأيمن للتصفية.</p>
          </div>
        )}

      </div>

    </div>
  );
};
