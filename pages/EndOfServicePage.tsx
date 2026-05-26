import React, { useState, useMemo } from 'react';
import { 
  Eye, Edit, Trash2, Search, Scale, ShieldCheck, Printer, 
  FileText, CheckCircle2, AlertTriangle, AlertCircle, Plus, 
  Check, UserCheck, History, FileSignature, Coins, BookOpen, 
  User, Sparkles, ChevronLeft, Calendar, BadgeInfo, Download, 
  RefreshCw, X, Laptop, Award, Landmark, Lock, CheckSquare, 
  Clock, FileSpreadsheet, Key, AlertOctagon, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EOS_Settlement, EOS_SettlementStatus, TerminationReasonKuwait, ContractTypeKuwait } from '../types';
import { calculateKuwaitEOS } from '../services/eosService';
import { initialExtendedEmployees, ExtendedEmployee } from '../data/employeeExtendedData';
import { OFFICE_NAME } from '../constants';

// Modular imported components
import { EndOfServiceDashboard } from '../components/eos/EndOfServiceDashboard';
import { EndOfServiceDocumentViewer } from '../components/eos/EndOfServiceDocumentViewer';
import { EndOfServiceWizard } from '../components/eos/EndOfServiceWizard';
import { EmployeeInfoPanel } from '../components/eos/EmployeeInfoPanel';

// Default mock cases to preserve previous transactions and records flawlessly
const initialSavedCases: EOS_Settlement[] = [
  {
    id: 'EOS-1029',
    settlementNumber: 'EOS-2026-1029',
    employeeId: '291040512345',
    employeeName: 'عبدالرحمن العجمي',
    jobTitle: 'Senior Corporate Counsel',
    department: 'قطاع العقود والاستشارات',
    settlementDate: '2026-05-15',
    joiningDate: '2021-03-01',
    lastWorkingDay: '2026-05-15',
    terminationReason: TerminationReasonKuwait.RESIGNATION,
    status: 'PendingReview',
    basicSalary: 1250,
    allowances: 350,
    grossSalary: 1600,
    serviceYears: 5,
    serviceMonths: 2,
    serviceDays: 14,
    indemnityAmount: 1820.500,
    leaveBalanceAmount: 615.380,
    accruedSalaryAmount: 923.000,
    noticePeriodAmount: 0,
    otherBonuses: 300,
    loansDeduction: 500,
    absenceDeduction: 123.076,
    otherDeductions: 0,
    netPayable: 3035.804,
    legalArticles: [
      'المادة (٥١): استحقاق مكافأة نهاية خدمة في القطاع الأهلي.',
      'المادة (٥٣): نسب مكافأة نهاية الخدمة في حال الاستقالة (تستحق ثلثي المكافأة لفترة بين ٥ و ١٠ سنوات).'
    ],
    preparedBy: 'شيرين النجار',
    notes: 'تمت المباشرة الودية وجاري مراجعة المديونية مع الشؤون الإدارية.',
    approvals: { hr: 'مكتمل', legal: 'معلق', finance: 'معلق', gm: 'معلق' },
    signatures: { employee: '', hr: 'شيرين النجار', fin: '', legal: '' }
  },
  {
    id: 'EOS-1030',
    settlementNumber: 'EOS-2026-1030',
    employeeId: '281081112345',
    employeeName: 'ريان جوردان ووكر',
    jobTitle: 'Investment Specialist',
    department: 'القطاع الاستثماري والمصرفي',
    settlementDate: '2026-05-20',
    joiningDate: '2019-11-10',
    lastWorkingDay: '2026-05-20',
    terminationReason: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE,
    status: 'LegallyApproved',
    basicSalary: 2100,
    allowances: 400,
    grossSalary: 2500,
    serviceYears: 6,
    serviceMonths: 6,
    serviceDays: 10,
    indemnityAmount: 5120.000,
    leaveBalanceAmount: 1153.840,
    accruedSalaryAmount: 1923.076,
    noticePeriodAmount: 0,
    otherBonuses: 0,
    loansDeduction: 0,
    absenceDeduction: 0,
    otherDeductions: 0,
    netPayable: 8196.916,
    legalArticles: [
      'المادة (٥١): مكافأة كاملة غير منقوصة للأهلي بإنهاء من رب العمل.',
      'المادة (٤٤): استيفاء مهلة الإخطار والعمل خلالها.'
    ],
    preparedBy: 'شيرين النجار',
    notes: 'تم فحص العهد والتوقيع القانوني من مستشار المنشأة وجاري إعداد التحويل المصرفي.',
    approvals: { hr: 'مكتمل', legal: 'معتمد', finance: 'مكتمل', gm: 'معلق' },
    signatures: { employee: 'بصمة الكترونية للطرف الثاني', hr: 'شيرين النجار', fin: 'مساعد شيرين', legal: 'المستشار القانوني معتمد' }
  },
  {
    id: 'EOS-1031',
    settlementNumber: 'EOS-2026-1031',
    employeeId: '295112112345',
    employeeName: 'سارة خالد المطيري',
    jobTitle: 'Administrative Support Specialist',
    department: 'الشؤون الإدارية والتشغيل',
    settlementDate: '2026-05-24',
    joiningDate: '2024-02-01',
    lastWorkingDay: '2026-05-24',
    terminationReason: TerminationReasonKuwait.MARRIAGE_RESIGNATION_WOMEN,
    status: 'Completed',
    basicSalary: 750,
    allowances: 150,
    grossSalary: 900,
    serviceYears: 2,
    serviceMonths: 3,
    serviceDays: 23,
    indemnityAmount: 1021.500,
    leaveBalanceAmount: 415.380,
    accruedSalaryAmount: 692.300,
    noticePeriodAmount: 0,
    otherBonuses: 150,
    loansDeduction: 150,
    absenceDeduction: 0,
    otherDeductions: 0,
    netPayable: 2129.180,
    legalArticles: [
      'المادة (٥٤): مكافأة نهاية الخدمة كاملة للمرأة في حال استقالتها خلال عام من زواجها.'
    ],
    preparedBy: 'هدايل الباجي',
    notes: 'تم صرف المبلغ بنجاح عبر البنك ومصادقة براءة الذمة ومخالصة مديونية العهد.',
    approvals: { hr: 'مكتمل', legal: 'معتمد', finance: 'مكتمل', gm: 'معتمد' },
    signatures: { employee: 'سارة المطيري', hr: 'شيرين النجار', fin: 'المالية', legal: 'معتمد قانونياً' }
  }
];

export default function EndOfServicePage() {
  const [savedCases, setSavedCases] = useState<EOS_Settlement[]>(initialSavedCases);
  const [activeCaseId, setActiveCaseId] = useState<string>('EOS-1029');
  
  // Filtering & search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Interactive Level of Authority (Role playing)
  const [activeRole, setActiveRole] = useState<'hr' | 'legal' | 'finance' | 'gm'>('hr');

  // Tab selections
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'employee_directory'>('dashboard');

  // Wizard switch
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [editCase, setEditCase] = useState<EOS_Settlement | null>(null);

  // Directory selected employee card identifier
  const [selectedDirectoryEmpId, setSelectedDirectoryEmpId] = useState<string>('');

  // Active case object computation
  const activeCase = useMemo(() => {
    return savedCases.find(c => c.id === activeCaseId) || savedCases[0] || null;
  }, [savedCases, activeCaseId]);

  // Selected Directory Employee computation
  const selectedDirectoryEmployee = useMemo(() => {
    return initialExtendedEmployees.find(e => e.id === selectedDirectoryEmpId) || initialExtendedEmployees[0] || null;
  }, [selectedDirectoryEmpId]);

  // Handle case deletion
  const handleDeleteCase = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك بالتمحيص وحذف ملف براءة الذمة عمالي للموظف (${name})؟\nهذا الإجراء غير قابل للتراجع.`)) {
      const updated = savedCases.filter(c => c.id !== id);
      setSavedCases(updated);
      if (activeCaseId === id && updated.length) {
        setActiveCaseId(updated[0].id);
      }
    }
  };

  // Archive case scenario update
  const handleArchiveCase = (id: string) => {
    const updated = savedCases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Disbursed' as EOS_SettlementStatus,
          timeline: [
            ...(c.timeline || []),
            { date: new Date().toISOString().split('T')[0], actionAr: 'تم تسييل الحقوق رسمياً وحفظ الإبرام عمالياً', actionEn: 'Funds disbursed, file archived', user: 'عدالة سيستم' }
          ]
        };
      }
      return c;
    });
    setSavedCases(updated);
    alert('تم تعديل تصنيف الملف وتصفيره إلى "منته ومصروف عمالياً" وحفظ المعاملة الكلية.');
  };

  // Recieve and save cases from Wizard form
  const handleSaveWizardCase = (record: EOS_Settlement) => {
    // Audit timeline update
    const finalRecord = {
      ...record,
      timeline: [
        ...(record.timeline || []),
        { date: new Date().toISOString().split('T')[0], actionAr: editCase ? 'تم تعديل موازنة الحساب بالتحديثات العمالية' : 'تأسيس وبدء معالجة مسودة المستحقات', actionEn: 'File logged into local storage', user: `${activeRole.toUpperCase()} Specialist` }
      ]
    };

    if (editCase) {
      setSavedCases(prev => prev.map(c => c.id === editCase.id ? finalRecord : c));
    } else {
      setSavedCases(prev => [finalRecord, ...prev]);
    }

    setActiveCaseId(finalRecord.id);
    setEditCase(null);
    setWizardOpen(false);
  };

  // Sign off & Affix Digital Seal trigger function
  const handleSignOffCase = (updatedSignatures: any, updatedApprovals: any, comment: string) => {
    if (!activeCase) return;

    let finalStatus: EOS_SettlementStatus = activeCase.status;
    const currentTimeline = [...(activeCase.timeline || [])];

    if (activeRole === 'hr') {
      finalStatus = 'UnderFinancialReview';
      currentTimeline.push({ date: new Date().toISOString().split('T')[0], actionAr: 'مصادقة مستشار HR مع الختم المبدئي', actionEn: 'Approved by HR core', user: 'أخصائي شؤون الموظفين' });
    } else if (activeRole === 'legal') {
      finalStatus = 'LegallyApproved';
      currentTimeline.push({ date: new Date().toISOString().split('T')[0], actionAr: 'تثبيت التوافق التام مع قانون العمل رقم 6 لعام 2010', actionEn: 'Legally signed', user: 'المستشار القانوني' });
    } else if (activeRole === 'finance') {
      finalStatus = 'FinanciallyApproved';
      currentTimeline.push({ date: new Date().toISOString().split('T')[0], actionAr: 'تدقيق مقاصة السلف وموافقة موازنة الصرف النقدي', actionEn: 'Financially audited and OKed', user: 'المراقب المالي البنك' });
    } else if (activeRole === 'gm') {
      finalStatus = 'Completed';
      currentTimeline.push({ date: new Date().toISOString().split('T')[0], actionAr: 'موافقة وختم المدير العام النهائي على براءة الذمة والصرف', actionEn: 'Fully completed and signed by GM', user: 'المدير العام والتنفيذي' });
    }

    if (comment.trim()) {
      currentTimeline.push({ date: new Date().toISOString().split('T')[0], actionAr: `إضافة حاشية تدقيقية: "${comment}"`, actionEn: 'User audit footnote logged', user: activeRole.toUpperCase() });
    }

    const updated = savedCases.map(c => {
      if (c.id === activeCase.id) {
        return {
          ...c,
          signatures: updatedSignatures,
          approvals: updatedApprovals,
          status: finalStatus,
          timeline: currentTimeline
        };
      }
      return c;
    });

    setSavedCases(updated);
    alert(`تمت المصادقة الرقمية والختم كـ [${activeRole.toUpperCase()}] بنجاح، وتحويل حالة المعاملة القانونية.`);
  };

  // Filter saved records based on UI parameters
  const filteredCases = useMemo(() => {
    return savedCases.filter(c => {
      const matchSearch = c.employeeName.includes(searchTerm) || c.employeeId.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [savedCases, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6" dir="rtl">
      
      {/* HEADER BANNER ZONE */}
      <div className="max-w-7xl mx-auto mb-6 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Scale className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-950 dark:text-white leading-tight">إدارة مكافآت نهاية الخدمة وبراءة الذمة العمالية</h1>
            <p className="text-[11px] text-gray-400 mt-1 font-bold">بوابة صياغة، تدقيق، واعتماد مستندات المباشرة والتصفية والنسب المطابقة لقانون العمل الكويتي رقم (6) لعام 2010</p>
          </div>
        </div>

        {/* ROLE SIMULATION SELECTION */}
        <div className="p-1 bg-gray-100 dark:bg-slate-900 rounded-xl flex items-center gap-1 border">
          <span className="text-[10px] font-bold text-gray-450 px-2 leading-none uppercase select-none">المحاكاة والاعتماد كـ:</span>
          {[
            { id: 'hr', label: 'HR أخصائي' },
            { id: 'legal', label: 'قانوني' },
            { id: 'finance', label: 'مالي وبنك' },
            { id: 'gm', label: 'المدير العام' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id as any)}
              className={`h-7 px-3 rounded-lg text-[10px] font-black transition-all cursor-pointer ${activeRole === r.id ? 'bg-primary text-white shadow-xs font-black' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* THREE-WAY MAIN SEGMENT NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-0.5 select-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-2.5 px-4 text-xs font-black transition-all relative cursor-pointer flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'text-primary font-black' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <Coins className="w-4 h-4" />
          <span>المؤشرات والتحليلات العمالية</span>
          {activeTab === 'dashboard' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
        </button>

        <button
          onClick={() => {
            setActiveTab('cases');
            if (savedCases.length && !activeCaseId) {
              setActiveCaseId(savedCases[0].id);
            }
          }}
          className={`pb-2.5 px-4 text-xs font-black transition-all relative cursor-pointer flex items-center gap-1.5 ${activeTab === 'cases' ? 'text-primary font-black' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <FileText className="w-4 h-4" />
          <span>إدارة براءات الذمم والتصفيات ({savedCases.length})</span>
          {activeTab === 'cases' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
        </button>

        <button
          onClick={() => {
            setActiveTab('employee_directory');
            if (initialExtendedEmployees.length && !selectedDirectoryEmpId) {
              setSelectedDirectoryEmpId(initialExtendedEmployees[0].id);
            }
          }}
          className={`pb-2.5 px-4 text-xs font-black transition-all relative cursor-pointer flex items-center gap-1.5 ${activeTab === 'employee_directory' ? 'text-primary font-black' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <User className="w-4 h-4" />
          <span>سجل العلاقات وملفات الكادر</span>
          {activeTab === 'employee_directory' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {/* PRIMARY VIEWER ZONE */}
      <div className="max-w-7xl mx-auto">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <EndOfServiceDashboard 
            savedCases={savedCases}
            onAddNewCase={() => {
              setEditCase(null);
              setWizardOpen(true);
            }}
            activeRole={activeRole}
          />
        )}

        {/* TAB 2: DETAILED LAWSUIT CASES, PAPERS, DOCUMENT FORMING COGNITIONS */}
        {activeTab === 'cases' && activeCase && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SIDE PANEL LIST OF SAVED TRANSACTIONS */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Filter controls */}
              <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-xs space-y-3 text-right">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الرقم المدني..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full text-xs h-9 pr-8 pl-3 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 text-gray-800 dark:text-white rounded-lg outline-none focus:border-primary"
                  />
                  <Search className="w-4 h-4 text-gray-420 absolute top-2.5 right-2" />
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-gray-400 self-center whitespace-nowrap">الحالة:</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-900 border text-[10px] font-bold rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
                  >
                    <option value="all">الكل</option>
                    <option value="PendingReview">قيد المراجعة</option>
                    <option value="UnderFinancialReview">تدقيق الحسابات</option>
                    <option value="LegallyApproved">معتمد قانونياً</option>
                    <option value="Completed">منته ومكتمل</option>
                    <option value="Disbursed">منته ومصروف</option>
                  </select>
                </div>
              </div>

              {/* Grid of cases */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredCases.map(c => {
                  const isActive = c.id === activeCaseId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveCaseId(c.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${isActive ? 'bg-primary/5 dark:bg-primary-dark/20 border-primary shadow-sm' : 'bg-white dark:bg-dm-card border-gray-100 dark:border-gray-850 hover:bg-gray-50/50'}`}
                    >
                      <div className="flex justify-between items-start text-right">
                        <div>
                          <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">{c.employeeName}</h4>
                          <span className="text-[9px] text-[#00796B] bg-primary/10 px-1 py-0.2 rounded font-mono font-bold mt-1 inline-block shrink-0 select-none">ID: {c.employeeId}</span>
                        </div>
                        <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold select-none leading-none ${c.status === 'Completed' || c.status === 'Disbursed' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-500 font-semibold'}`}>
                          {c.status === 'Completed' ? 'مكتمل' : c.status === 'Disbursed' ? 'مصروف ومقفل' : 'تحت التدقيق'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold border-t border-gray-150/40 pt-2 text-gray-400">
                        <span>الصافي المالي:</span>
                        <span className="font-mono text-gray-950 dark:text-white font-extrabold">{c.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                      </div>

                      {/* Management actions buttons */}
                      <div className="flex gap-2 justify-end border-t border-gray-100/50 pt-2 text-[10px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditCase(c);
                            setWizardOpen(true);
                          }}
                          className="h-7 px-2.5 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 border text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        {c.status !== 'Completed' && c.status !== 'Disbursed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveCase(c.id);
                            }}
                            className="h-7 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>صرف</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCase(c.id, c.employeeName);
                          }}
                          className="h-7 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-md transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredCases.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-xs font-bold leading-none">لم يتم رصد أي معاملات عمالية براءة ذمة مطابقة للتوليفة المذكورة.</p>
                )}
              </div>
            </div>

            {/* MAIN CONTENT WORKSPACE: HIGH FIDELITY PRINTABLE DOCUMENTS ACTS */}
            <div className="lg:col-span-8">
              <EndOfServiceDocumentViewer 
                activeCase={activeCase}
                activeRole={activeRole}
                onSignOff={handleSignOffCase}
              />
            </div>

          </div>
        )}

        {/* TAB 3: RELATIONSHIP LIST ROSTER AND 3D DIRECTORY LOGS */}
        {activeTab === 'employee_directory' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Direct list of original employees */}
            <div className="md:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {initialExtendedEmployees.map(emp => {
                const isSelected = emp.id === selectedDirectoryEmpId;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedDirectoryEmpId(emp.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 text-right ${isSelected ? 'bg-primary/5 dark:bg-primary-dark/20 border-primary' : 'bg-white dark:bg-dm-card border-gray-100 dark:border-gray-850 hover:bg-gray-50/50'}`}
                  >
                    <img
                      src={emp.photoUrl}
                      alt={emp.fullNameEn}
                      className="w-11 h-11 rounded-xl object-cover border border-primary/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-gray-950 dark:text-white leading-none">{emp.fullNameAr}</h4>
                      <p className="text-[10px] text-gray-500 leading-none">{emp.jobTitle}</p>
                      <span className="text-[9px] text-[#00796B] dark:text-primary-light font-bold block leading-none pt-0.5">{emp.department}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3D Details file */}
            <div className="md:col-span-8">
              <EmployeeInfoPanel employee={selectedDirectoryEmployee} />
            </div>

          </div>
        )}

      </div>

      {/* MODAL WIZARD AT LARGE */}
      <AnimatePresence>
        {wizardOpen && (
          <EndOfServiceWizard 
            onClose={() => {
              setWizardOpen(false);
              setEditCase(null);
            }}
            onSave={handleSaveWizardCase}
            editCase={editCase}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
