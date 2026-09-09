import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Filter, Printer, Trash, Copy, Edit3, Award, FileText,
  AlertTriangle, Users, BookOpen, Clock, Shield, Archive, RefreshCw, Check, CheckCircle2,
  Lock, ArrowRight, ExternalLink, QrCode, FileSpreadsheet, Fingerprint, Coins, Eye, Star, Map, HelpingHand
} from 'lucide-react';

// Modular Sub-components and types
import {
  LocalEmployee,
  LocalAppraisal,
  PerformanceTier,
  PerformanceAppraisalStatus
} from './PerformanceAppraisalTypes';

import {
  mockEmployeesList,
  initialAppraisalsSeed,
  translations
} from './PerformanceAppraisalData';

import { PrePrintEditorModal } from './PrePrintEditorModal';
import { PerformanceReportsSuite } from './PerformanceReportsSuite';

// Custom Toast System
const Toast: React.FC<{ message: string; sub: string; type: 'success' | 'warn'; onClose: () => void }> = ({
  message,
  sub,
  type,
  onClose
}) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    className="fixed bottom-6 left-6 z-[9999] p-4.5 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl flex items-start gap-3 w-80 text-right leading-relaxed"
    dir="rtl"
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
      type === 'success' ? 'bg-[#E0F2F1] text-[#00796B]' : 'bg-rose-100 text-rose-600'
    }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
    </div>
    <div className="flex-1">
      <p className="font-black text-xs text-white">{message}</p>
      <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">{sub}</p>
    </div>
  </motion.div>
);

const APPRAISAL_TYPES = [
  { id: 'probation', ar: 'تقييم فترة التجربة والتحقق عمالياً', en: 'Probation Period Statutory Evaluation' },
  { id: 'monthly', ar: 'التقييم الشهري المنتظم للأداء بالبصمة', en: 'Regular Monthly Performance Appraisal' },
  { id: 'quarterly', ar: 'التقييم الربع سنوي للمطابقة والإنتاجية', en: 'Quarterly Productivity & Compliance Audit' },
  { id: 'semi_annual', ar: 'التقييم نصف السنوي المبرم للكفاءة', en: 'Semi-annual Performance Ledger Review' },
  { id: 'annual', ar: 'التقييم السنوي الشامل والنهائي لقانون العمل', en: 'Annual Statutory Performance Appraisal' },
  { id: 'promotion', ar: 'تقييم الترقية والزيادة والاستحقاق المالي', en: 'Promotion & Payroll Increment Assessment' },
  { id: 'professional_competency', ar: 'تقييم الكفاءة المهنية وصياغة اللوائح والمذكرات', en: 'Professional Legal Drafting & Counsel Competency' },
  { id: 'behavior_discipline', ar: 'تقييم الانضباط الوظيفي والالتزام بالدوام والتحقيق', en: 'Job Discipline, Leave Tracking & Attendance Evaluation' },
  { id: 'skills_behavior', ar: 'تقييم المهارات والسلوك والأخلاقيات وشرف المهنة', en: 'Skills, Professional Behavior & Client Ethics Review' }
];

export const EmployeePerformancePage: React.FC = () => {
  // --- Languages & General States ---
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('alwagayan_lang') as 'ar' | 'en') || 'ar';
  });
  const isAr = language === 'ar';

  const translate = (ar: string, en: string) => isAr ? ar : en;
  const t = translations[language];

  // --- Dynamic System State Databases Loaded Instantly ---
  
  // 1. Employee Profile Register (Synchronized across ERP)
  const [employees, setEmployees] = useState<any[]>(() => {
    const stored = localStorage.getItem('alwagayan_employees');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed parsing alwagayan_employees', e);
      }
    }
    // Set fallback seed
    localStorage.setItem('alwagayan_employees', JSON.stringify(mockEmployeesList));
    return mockEmployeesList;
  });

  // 2. Performance Appraisals Dossier
  const [appraisals, setAppraisals] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_perf_appraisals_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialAppraisalsSeed;
  });

  // 3. Goals Database
  const [goals, setGoals] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_perf_goals_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'goal-1', employeeId: 'emp-1', titleAr: 'تحسين سرعة إنجاز عقود الاستملاك والتجارة بنسبة 20%', titleEn: 'Optimize acquisitions contract speeds by 20%', targetDate: '2026-08-31', statusAr: 'قيد التنفيذ' },
      { id: 'goal-2', employeeId: 'emp-2', titleAr: 'حضور دورتين تخصصيتين في صياغة دفوع التلبس الجنائي', titleEn: 'Attend two crime defense pleading courses', targetDate: '2026-07-15', statusAr: 'قيد التنفيذ' },
      { id: 'goal-3', employeeId: 'emp-3', titleAr: 'اعتماد ٣ مساحات تحكيم مالي جديدة مع جمعية المحامين', titleEn: 'Accredit 3 commercial arbitration frameworks', targetDate: '2026-12-01', statusAr: 'قيد التنفيذ' }
    ];
  });

  // 4. Development Plans Register (خطط التطوير والتحسين)
  const [developmentPlans, setDevelopmentPlans] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_perf_dev_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'dev-1', employeeId: 'emp-4', titleAr: 'خطة تقويم إجبارية في أصول صياغة اللائحة مع الأستاذ صبري شطا', titleEn: 'Remedial writing and pleading training with Saber Shatta', mentor: 'أ. صبري شطا', targetDate: '2026-06-30', progress: 40 },
      { id: 'dev-2', employeeId: 'emp-2', titleAr: 'خطة تعميق دراسة أوراق قضايا الخبراء وتسليم التقارير بوزارة العدل', titleEn: 'Deeper audits workflow of expert folders with Ministry of Justice', mentor: 'د. يوسف شطا', targetDate: '2026-09-01', progress: 75 }
    ];
  });

  // 5. Recommendations Ledger (التوصيات والقرارات الكادرية لعام 2026)
  const [recommendations, setRecommendations] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_perf_recs_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'rec-1', employeeId: 'emp-1', typeAr: 'ترقية استشارية وعلاوة', typeEn: 'Promotion & Hike', recommendationTextAr: 'توصي لجنة الترقية للمستشار أحمد العبدالله نظراً لامتيازه اللائحي بكتابة مذكرات تجاوزت 5 ملايين د.ك.', recommendationTextEn: 'Recommend Ahmad Al-Abdullah for partnership promotion due to exceptional drafting exceeds 5M KWD.', decisionStatus: 'Approved', effectiveDate: '2026-06-15', refId: 'REC-2026-09' },
      { id: 'rec-2', employeeId: 'emp-4', typeAr: 'صقل وتدريب مهني غليظ', typeEn: 'Remedial training', recommendationTextAr: 'إلزام الباحث بدر المطيري بـ ٤ ورش صياغة وتوجيه إنذار دوام بالبصمة قبل التثبيت.', recommendationTextEn: 'Bader Al-Mutairi requires mandatory biometric schedule compliance before permanent contract lock.', decisionStatus: 'Pending', effectiveDate: '2026-07-01', refId: 'REC-2026-10' }
    ];
  });

  // 6. Archived List
  const [archivedAppraisalIds, setArchivedAppraisalIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('adala_perf_archived_v3');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Dynamic ERP Linkages (CROSS MODULE LOADS) ---
  const disciplinaryLogs = useMemo(() => {
    const stored = localStorage.getItem('alwagayan_disciplinary');
    return stored ? JSON.parse(stored) : [];
  }, []);

  const leaveRequests = useMemo(() => {
    const stored = localStorage.getItem('alwagayan_leave_requests_detailed') || localStorage.getItem('alwagayan_leave_requests');
    return stored ? JSON.parse(stored) : [];
  }, []);

  const payrollLedger = useMemo(() => {
    const stored = localStorage.getItem('alwagayan_employee_payroll');
    return stored ? JSON.parse(stored) : [];
  }, []);

  const eosCases = useMemo(() => {
    const stored = localStorage.getItem('adalah_eos_cases_cache_v3');
    return stored ? JSON.parse(stored) : [];
  }, []);

  // --- Effects for Storage Persistence ---
  useEffect(() => {
    localStorage.setItem('adala_perf_appraisals_v3', JSON.stringify(appraisals));
  }, [appraisals]);

  useEffect(() => {
    localStorage.setItem('adala_perf_archived_v3', JSON.stringify(archivedAppraisalIds));
  }, [archivedAppraisalIds]);

  useEffect(() => {
    localStorage.setItem('adala_perf_goals_v3', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('adala_perf_dev_v3', JSON.stringify(developmentPlans));
  }, [developmentPlans]);

  useEffect(() => {
    localStorage.setItem('adala_perf_recs_v3', JSON.stringify(recommendations));
  }, [recommendations]);

  // --- Dynamic Dashboard & Filter values states ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appraisals_list' | 'kpis_track' | 'development_plans' | 'recommendations' | 'reports_analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- Toast Trigger State ---
  const [toast, setToast] = useState<{ message: string; sub: string; type: 'success' | 'warn' } | null>(null);
  const triggerToast = (msg: string, subText: string, tType: 'success' | 'warn' = 'success') => {
    setToast({ message: msg, sub: subText, type: tType });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Wizard intake forms states (Unified Creating/Editing Form engine) ---
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingAppraisalId, setEditingAppraisalId] = useState<string | null>(null);

  // Form Fields State
  const [wEmployeeId, setWEmployeeId] = useState('');
  const [wPeriod, setWPeriod] = useState('Q1 2026');
  const [wDate, setWDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appraisalFormType, setAppraisalFormType] = useState('annual');

  const [scoreDrafting, setScoreDrafting] = useState<number>(4.5);
  const [scoreSuccess, setScoreSuccess] = useState<number>(4.2);
  const [scoreClient, setScoreClient] = useState<number>(4.8);
  const [scoreCompliance, setScoreCompliance] = useState<number>(4.5);

  const [wStrengthsAr, setWStrengthsAr] = useState('');
  const [wStrengthsEn, setWStrengthsEn] = useState('');
  const [wImprovementsAr, setWImprovementsAr] = useState('');
  const [wImprovementsEn, setWImprovementsEn] = useState('');
  const [wTrainingAr, setWTrainingAr] = useState('');
  const [wTrainingEn, setWTrainingEn] = useState('');
  const [wSigneeAr, setWSigneeAr] = useState('');
  const [wDigitalCode, setWDigitalCode] = useState('');

  // Probation Specific outcome check
  const [probationOutcome, setProbationOutcome] = useState('Confirm'); // Confirm, Extend, Dismiss

  // Wage Hike Specific State
  const [proposedHike, setProposedHike] = useState(50);

  // --- Dynamic Autofill of selected employee (Loads payroll & warns in real-time) ---
  const activeEmployeeMeta = useMemo(() => {
    return employees.find(e => e.id === wEmployeeId);
  }, [wEmployeeId, employees]);

  useEffect(() => {
    if (activeEmployeeMeta) {
      // Find historical warnings
      const warnings = disciplinaryLogs.filter((d: any) => d.employeeName === activeEmployeeMeta.fullName?.ar || d.employeeName === activeEmployeeMeta.fullNameAr);
      // Auto adjust attendance compliance if multiple warnings exist
      if (warnings.length > 0) {
        setScoreCompliance(Math.max(1, parseFloat((4.5 - warnings.length * 0.5).toFixed(1))));
      }

      // Auto load signee defaults
      setWSigneeAr(isAr ? 'أ. صبري شطا' : 'Sabri Shatta, Esq.');
      setWPeriod('Q1 2026');
      setWDigitalCode(`REF-S-CODE-${Math.floor(1000 + Math.random()*9000)}-SHA`);
    }
  }, [wEmployeeId, activeEmployeeMeta, disciplinaryLogs, isAr]);

  // --- Dialog popup drawer details view ---
  const [activeDossierDetail, setActiveDossierDetail] = useState<any | null>(null);

  // --- Print Pre-Print Live Preview Studio Modal ---
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedAppraisalForPrint, setSelectedAppraisalForPrint] = useState<any | null>(null);

  // --- CRUD Modals for Goals or Dev Plans ---
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalData, setNewGoalData] = useState({ employeeId: '', titleAr: '', titleEn: '', targetDate: '', statusAr: 'قيد التنفيذ' });

  const [isDevPlanModalOpen, setIsDevPlanModalOpen] = useState(false);
  const [newDevData, setNewDevData] = useState({ employeeId: '', titleAr: '', titleEn: '', mentor: '', targetDate: '', progress: 10 });

  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [newRecData, setNewRecData] = useState({ employeeId: '', typeAr: 'زيادة راتب بملف المالية', typeEn: 'Increment proposal', recommendationTextAr: '', recommendationTextEn: '', effectiveDate: '', decisionStatus: 'Pending' });

  // Load first employee in setup
  useEffect(() => {
    if (employees.length > 0 && !wEmployeeId) {
      setWEmployeeId(employees[0].id);
    }
  }, [employees, wEmployeeId]);

  // --- Helper state getters ---
  const getEmployeeName = (emp: any) => {
    if (!emp) return '';
    if (typeof emp.fullName === 'object' && emp.fullName !== null) {
      return isAr ? (emp.fullName.ar || emp.fullName.en) : (emp.fullName.en || emp.fullName.ar);
    }
    if (emp.fullNameAr) return emp.fullNameAr;
    if (emp.fullName) return emp.fullName;
    if (emp.name) return emp.name;
    return '';
  };

  const getEmployeeJob = (emp: any) => {
    if (!emp) return '';
    if (typeof emp.jobTitle === 'object' && emp.jobTitle !== null) {
      return isAr ? (emp.jobTitle.ar || emp.jobTitle.en) : (emp.jobTitle.en || emp.jobTitle.ar);
    }
    if (emp.jobTitle) return emp.jobTitle;
    if (emp.position) return emp.position;
    return '';
  };

  const getEmployeeDept = (emp: any) => {
    if (!emp) return '';
    if (typeof emp.department === 'object' && emp.department !== null) {
      return isAr ? (emp.department.ar || emp.department.en) : (emp.department.en || emp.department.ar);
    }
    if (emp.department) return emp.department;
    return '';
  };

  // --- Form calculation rating weights ---
  const formOverallScore = useMemo(() => {
    const avg = (scoreDrafting + scoreSuccess + scoreClient + scoreCompliance) / 4;
    return parseFloat(avg.toFixed(2));
  }, [scoreDrafting, scoreSuccess, scoreClient, scoreCompliance]);

  // --- Actions & State mutations for appraisals ---
  const resetWizard = (mode: 'create' | 'edit', app?: any) => {
    setFormMode(mode);
    setWizardStep(1);
    if (mode === 'create') {
      setEditingAppraisalId(null);
      if (employees.length > 0) setWEmployeeId(employees[0].id);
      setWPeriod('Q1 2026');
      setAppraisalFormType('annual');
      setScoreDrafting(4.5);
      setScoreSuccess(4.2);
      setScoreClient(4.8);
      setScoreCompliance(4.5);
      setWStrengthsAr('');
      setWStrengthsEn('');
      setWImprovementsAr('');
      setWImprovementsEn('');
      setWTrainingAr('');
      setWTrainingEn('');
      setWSigneeAr(isAr ? 'أ. صبري شطا' : 'Sabri Shatta, Esq.');
      setWDigitalCode(`REF-${Math.floor(1000 + Math.random()*9000)}-SHA`);
    } else if (mode === 'edit' && app) {
      setEditingAppraisalId(app.id);
      setWEmployeeId(app.employeeId);
      setWPeriod(app.appraisalPeriod);
      setWDate(app.appraisalDate);
      setAppraisalFormType(app.formType || 'annual');
      setScoreDrafting(app.scores?.drafting ?? 4.5);
      setScoreSuccess(app.scores?.successRate ?? 4.2);
      setScoreClient(app.scores?.clientRelations ?? 4.8);
      setScoreCompliance(app.scores?.compliance ?? 4.5);
      setWStrengthsAr(app.strengths?.ar || app.strengths || '');
      setWStrengthsEn(app.strengths?.en || '');
      setWImprovementsAr(app.improvements?.ar || app.improvements || '');
      setWImprovementsEn(app.improvements?.en || '');
      setWTrainingAr(app.training?.ar || app.training || '');
      setWTrainingEn(app.training?.en || '');
      setWSigneeAr(app.signeeName?.ar || app.signeeName || '');
      setWDigitalCode(app.signatureCode || '');
    }
    setIsWizardOpen(true);
  };

  const handleWizardSubmit = (targetStatus: PerformanceAppraisalStatus) => {
    const ratingTier = formOverallScore >= 4.5 ? PerformanceTier.EXCELLENT :
                       formOverallScore >= 3.8 ? PerformanceTier.EXCEEDS_EXPECTATIONS :
                       formOverallScore >= 3.0 ? PerformanceTier.MEETS_EXPECTATIONS :
                       PerformanceTier.NEEDS_IMPROVEMENT;

    const appraisalObject: any = {
      id: formMode === 'create' ? `app-${Date.now()}` : editingAppraisalId!,
      employeeId: wEmployeeId,
      appraisalPeriod: wPeriod,
      appraisalDate: wDate,
      status: targetStatus,
      formType: appraisalFormType,
      probationAction: appraisalFormType === 'probation' ? probationOutcome : undefined,
      proposedIncrement: appraisalFormType === 'promotion' ? proposedHike : undefined,
      appraiserName: { ar: 'الموارد البشرية والمطابقة', en: 'HR & Audit Bureau' },
      overallScore: formOverallScore,
      scores: {
        drafting: scoreDrafting,
        successRate: scoreSuccess,
        clientRelations: scoreClient,
        compliance: scoreCompliance
      },
      strengths: { ar: wStrengthsAr || 'أداء قانوني متماسك', en: wStrengthsEn || 'Cohesive legal performance' },
      improvements: { ar: wImprovementsAr || 'التوسع في الإلمام بالتجارة الدولية', en: wImprovementsEn || 'Expand international commercial scopes' },
      training: { ar: wTrainingAr || 'برنامج التطوير الموازي', en: wTrainingEn || 'Remedial legal audit training' },
      refId: formMode === 'create' ? `QA-PERF-2026-${Math.floor(100 + Math.random() * 900)}` : appraisals.find(a => a.id === editingAppraisalId)?.refId || `QA-PERF-2026-${Math.floor(100 + Math.random() * 900)}`,
      signatureCode: wDigitalCode || `SHA-2026-${Math.floor(1000 + Math.random()*9000)}`,
      signeeName: { ar: wSigneeAr || 'صبري شطا', en: wSigneeAr || 'Sabri Shatta' },
      signedAt: new Date().toISOString().split('T')[0]
    };

    if (formMode === 'create') {
      setAppraisals([appraisalObject, ...appraisals]);
      triggerToast(t.successMsg, translate('تم صب المستند وتوثيقه وحفظه بالبصمة الرقمية.', 'Document issued & locked with SHA footprint keys.'));
    } else {
      setAppraisals(appraisals.map(a => a.id === editingAppraisalId ? appraisalObject : a));
      triggerToast(translate('تم تحديث صك الأداء بالتغييرات', 'Performance dossier updated'), translate('تم حفظ نسخة التقرير المعدلة بنجاح بالموارد.', 'Modifications synced back to HR records.'));
    }

    // Dynamic promotion/hike processing
    if (appraisalFormType === 'promotion' && targetStatus === 'Certified') {
      handlePushSalaryHike(wEmployeeId, proposedHike);
    }

    setIsWizardOpen(false);
  };

  // --- Dynamic direct updates to other modules (Payroll Link) ---
  const handlePushSalaryHike = (empId: string, hike: number) => {
    const storedPayroll = localStorage.getItem('alwagayan_employee_payroll');
    if (storedPayroll) {
      try {
        const payList = JSON.parse(storedPayroll);
        const emp = employees.find(e => e.id === empId);
        const empName = getEmployeeName(emp);

        const updated = payList.map((p: any) => {
          if (p.employeeId === empId || p.employeeName === empName) {
            return {
              ...p,
              basicSalary: (p.basicSalary || 0) + hike,
              history: [
                ...(p.history || []),
                { date: new Date().toISOString().split('T')[0], type: 'زيادة ترقية الكفاءة', value: hike, desc: 'زيادة تلقائية بناءً على تقييم ناتج ممتاز بمكتب صبري شطا' }
              ]
            };
          }
          return p;
        });
        localStorage.setItem('alwagayan_employee_payroll', JSON.stringify(updated));
        triggerToast(
          translate('تم تمرير الزيادة إلى المحاسبة والرواتب', 'Payroll Incremented Dynamically'),
          translate(`تم زيادة راتب ${empName} بمقدار ${hike} د.ك وتعديل دفتر الموازنة بنظام عدالة تلقائياً.`, `Basic wage raised by ${hike} KWD successfully.`)
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDelete = (id: string) => {
    setAppraisals(appraisals.filter(a => a.id !== id));
    triggerToast(t.deleteMsg, translate('تم مسح السجل نهائياً وتمريره لأرشيف الإتلاف المائي.', 'Dossier dismantled from direct database view.'), 'warn');
  };

  const handleDuplicate = (app: any) => {
    const duplicatedApp: any = {
      ...app,
      id: `app-dup-${Date.now()}`,
      refId: `QA-PERF-2026-DUP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Draft',
      signedAt: ''
    };
    setAppraisals([duplicatedApp, ...appraisals]);
    triggerToast(t.duplicateMsg, translate('يمكنك صياغة أو تعديل الملف المكرر الآن مع الحفاظ على الأوزان.', 'Duplicated elements are editable in drafts.'));
  };

  const handleToggleArchive = (id: string, name: string) => {
    if (archivedAppraisalIds.includes(id)) {
      setArchivedAppraisalIds(archivedAppraisalIds.filter(x => x !== id));
      triggerToast(translate('تم فك ملف الأرشفة بنجاح', 'Dossier Unarchived'), `${name} - ${translate('السجل متاح حالياً للمطابقة اليومية والتدقيق.', 'Record resides back in direct audits.')}`);
    } else {
      setArchivedAppraisalIds([...archivedAppraisalIds, id]);
      triggerToast(translate('تم أرشفة صك الأداء المغلق', 'Dossier Archived'), `${name} - ${translate('تم إرسال الملف لشبكة التخزين طويلة المدى.', 'Record sent to cloud archives storage.')}`);
    }
  };

  // --- CRUD goals helper ---
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalData.employeeId || !newGoalData.titleAr) return;
    const newG = {
      id: `goal-${Date.now()}`,
      employeeId: newGoalData.employeeId,
      titleAr: newGoalData.titleAr,
      titleEn: newGoalData.titleEn || newGoalData.titleAr,
      targetDate: newGoalData.targetDate || new Date().toISOString().split('T')[0],
      statusAr: newGoalData.statusAr
    };
    setGoals([...goals, newG]);
    setIsGoalModalOpen(false);
    triggerToast(translate('تم إدراج هدف سنوي جديد', 'New Target Goal Registered'), translate('تم قفل وحساب الأهداف في سجلات المتنافسين بنجاح.', 'Target goals index recalculated.'));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    triggerToast(translate('تم إقصاء الهدف السنوي', 'Target Goal Removed'), translate('تم شطب الهدف من دفتر التقدم.', 'Deleted from track index.'), 'warn');
  };

  // --- CRUD Dev Plans sub ---
  const handleAddDevPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevData.employeeId || !newDevData.titleAr) return;
    const newD = {
      id: `dev-${Date.now()}`,
      employeeId: newDevData.employeeId,
      titleAr: newDevData.titleAr,
      titleEn: newDevData.titleEn || newDevData.titleAr,
      mentor: newDevData.mentor || 'أ. صبري شطا',
      targetDate: newDevData.targetDate || new Date().toISOString().split('T')[0],
      progress: newDevData.progress
    };
    setDevelopmentPlans([...developmentPlans, newD]);
    setIsDevPlanModalOpen(false);
    triggerToast(translate('تم إطلاق خطة تحسين', 'Improvement Plan Launched'), translate('تم إشراك الموظف والمسؤول في جدول التعلم.', 'Mentor & employee shared in calendar.'));
  };

  const handleDeleteDevPlan = (id: string) => {
    setDevelopmentPlans(developmentPlans.filter(d => d.id !== id));
    triggerToast(translate('تم حذف خطة التطوير', 'Improvement Plan Deleted'), translate('تم إلغاء متابعة البرنامج للموظف.', 'Plan stopped on HR databases.'), 'warn');
  };

  // --- CRUD Recommendations ---
  const handleAddRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecData.employeeId || !newRecData.recommendationTextAr) return;
    const newR = {
      id: `rec-${Date.now()}`,
      employeeId: newRecData.employeeId,
      typeAr: newRecData.typeAr,
      typeEn: newRecData.typeEn,
      recommendationTextAr: newRecData.recommendationTextAr,
      recommendationTextEn: newRecData.recommendationTextEn || newRecData.recommendationTextAr,
      effectiveDate: newRecData.effectiveDate || new Date().toISOString().split('T')[0],
      decisionStatus: newRecData.decisionStatus,
      refId: `REC-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    setRecommendations([...recommendations, newR]);
    setIsRecModalOpen(false);
    triggerToast(translate('تم إدراج توصية كادرية جديدة', 'New Recommendation Logged'), translate('تم صب التوجيه وتوزيع الإشراك بالموارد البشرية.', 'Recommendation sent to HR board.'));
  };

  const handleDeleteRec = (id: string) => {
    setRecommendations(recommendations.filter(r => r.id !== id));
    triggerToast(translate('تم إقصاء التوصية الكادرية', 'Recommendation Revoked'), translate('تم إلغاء تتبع القرار الإداري.', 'Candidacy text removed.'), 'warn');
  };

  // Switch status of recommendations
  const toggleRecStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pending' ? 'Approved' : currentStatus === 'Approved' ? 'Implemented' : 'Pending';
    setRecommendations(recommendations.map(r => {
      if (r.id === id) {
        // Trigger wage hike if changed to Approved/Implemented for promotions
        if (r.typeAr.includes('زيادة') || r.typeEn.toLowerCase().includes('increment') || r.typeEn.toLowerCase().includes('promotion')) {
          if (nextStatus === 'Approved') {
            handlePushSalaryHike(r.employeeId, 100);
          }
        }
        return { ...r, decisionStatus: nextStatus };
      }
      return r;
    }));
    triggerToast(translate('تم تغيير حالة التوصية والقرار', 'Recommendation Status Updated'), translate('تم تحديث حالة التنفيذ ومزامنه الكادر المالي الموصف.', 'Status synced back.'));
  };

  // --- Filtering appraisals list logic ---
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter(app => {
      const emp = employees.find(e => e.id === app.employeeId);
      if (!emp) return false;

      // Unarchived list on general view
      if (archivedAppraisalIds.includes(app.id) && statusFilter !== 'Archived') return false;
      if (statusFilter === 'Archived' && !archivedAppraisalIds.includes(app.id)) return false;

      // search query
      const empName = getEmployeeName(emp).toLowerCase();
      const jobTitleStr = getEmployeeJob(emp).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = empName.includes(searchLower) ||
                          jobTitleStr.includes(searchLower) ||
                          (emp.civilId && emp.civilId.includes(searchLower)) ||
                          (app.refId && app.refId.toLowerCase().includes(searchLower));

      // Department Filter
      const empDept = getEmployeeDept(emp);
      const matchDept = deptFilter === 'All' || empDept === deptFilter;

      // Status Filter (excluding Archived which is handled above)
      const matchStatus = statusFilter === 'All' || statusFilter === 'Archived' || app.status === statusFilter;

      // Score evaluation tier
      let tier = PerformanceTier.NEEDS_IMPROVEMENT;
      if (app.overallScore >= 4.5) tier = PerformanceTier.EXCELLENT;
      else if (app.overallScore >= 3.8) tier = PerformanceTier.EXCEEDS_EXPECTATIONS;
      else if (app.overallScore >= 3.0) tier = PerformanceTier.MEETS_EXPECTATIONS;

      const matchTier = tierFilter === 'All' || tier === tierFilter;

      return matchSearch && matchDept && matchStatus && matchTier;
    });
  }, [appraisals, employees, archivedAppraisalIds, searchTerm, deptFilter, tierFilter, statusFilter, language]);

  // General statistics
  const appraisalListScoreAverage = useMemo(() => {
    if (filteredAppraisals.length === 0) return 0;
    const sum = filteredAppraisals.reduce((acc, cur) => acc + (cur.overallScore || 0), 0);
    return sum / filteredAppraisals.length;
  }, [filteredAppraisals]);



  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-950 p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-200 transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            sub={toast.sub}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Modernized Title & Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-1 bg-gradient-to-l from-[#C5A880] to-[#00796B]" />
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00796B] dark:bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider">{t.firmName}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#004D40] dark:text-white tracking-tight">{t.title}</h1>
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-semibold">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switch */}
          <button
            onClick={() => {
              const next = language === 'ar' ? 'en' : 'ar';
              setLanguage(next);
              localStorage.setItem('alwagayan_lang', next);
            }}
            className="h-11 px-4 text-xs font-black bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-350 cursor-pointer flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00796B] dark:text-emerald-500" style={{ animationDuration: '6s' }} />
            <span>{isAr ? 'ENG' : 'العربية'}</span>
          </button>

          {/* New Appraisal Trigger */}
          <button
            onClick={() => resetWizard('create')}
            className="h-11 bg-[#00796B] dark:bg-emerald-600 hover:bg-[#004D40] dark:hover:bg-emerald-700 text-white border-none px-5 text-xs font-black rounded-2xl cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>{t.newBtn}</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu Section */}
      <div className="flex flex-wrap gap-2 text-xs font-bold select-none pb-2">
        {[
          { id: 'dashboard', label: isAr ? 'لوحة القيادة والرقابة' : 'Appraisal Dashboard', icon: Shield },
          { id: 'appraisals_list', label: isAr ? 'صكوك وسجلات الأداء' : 'Appraisal Records', icon: FileText },
          { id: 'kpis_track', label: isAr ? 'مؤشرات الأداء الكادرية' : 'KPI Comparison Matrix', icon: Fingerprint },
          { id: 'development_plans', label: isAr ? 'خطط التطوير والتحسين' : 'Improvement Plans', icon: BookOpen },
          { id: 'recommendations', label: isAr ? 'التوصيات والقرارات الكادرية' : 'Recommendations Ledger', icon: Coins },
          { id: 'reports_analytics', label: isAr ? 'مستودع التقارير والتحليلات' : 'Reporting Suite & Charts', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`h-11 px-5 rounded-2xl flex items-center gap-2.5 cursor-pointer font-bold transition-all border ${
                isActive 
                  ? 'bg-[#00796B] dark:bg-[#00796B] text-white border-transparent shadow-sm font-black' 
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Panel Content Renderers */}
      <div className="space-y-8">
        
        {/* TAB 1: EXECUTIVE PERFORMANCE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Real ERP warnings & leave status alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs space-y-4 transition-all duration-300">
                <div className="flex items-center gap-2 justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'عقود الموظفين وحالة الفترات' : 'Employee Status Indicators'}</h3>
                  <Users className="w-4 h-4 text-[#00796B] dark:text-emerald-400" />
                </div>
                <div className="space-y-3.5 text-[11px] font-semibold text-slate-650 dark:text-slate-300">
                  {employees.slice(0, 3).map(emp => {
                    const warnings = disciplinaryLogs.filter((d: any) => d.employeeName === emp.name || d.employeeName === emp.fullNameAr || d.employeeName === emp.fullName?.[language]);
                    const isEos = eosCases.some((e: any) => e.employeeId === emp.id);
                    return (
                      <div key={emp.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-2xl hover:border-[#00796B] dark:hover:border-emerald-500 transition-all">
                        <div>
                          <p className="text-xs font-black text-slate-850 dark:text-white">{getEmployeeName(emp)}</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{getEmployeeJob(emp)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 font-sans">
                          {warnings.length > 0 && (
                            <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[8.5px] rounded border border-rose-100 dark:border-rose-900/30 font-bold">
                              {warnings.length} {isAr ? 'إنذارات تأديبية' : 'Dispute warnings'}
                            </span>
                          )}
                          {isEos && (
                            <span className="bg-amber-50 dark:bg-[#513E26]/20 text-amber-600 dark:text-[#C5A880] px-2 py-0.5 text-[8.5px] rounded border border-amber-100 dark:border-amber-900/30 font-bold">
                              {isAr ? 'نهاية الخدمة نشط' : 'EOS Active Case'}
                            </span>
                          )}
                          {!warnings.length && !isEos && (
                            <span className="bg-[#E0F2F1] dark:bg-[#00796B]/20 text-[#00796B] dark:text-emerald-400 px-2 py-0.5 text-[8.5px] rounded border border-emerald-100 dark:border-[#00796B]/20 font-bold">
                              {isAr ? 'حالة امتياز' : 'Compliant'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs space-y-4 transition-all duration-300">
                <div className="flex items-center gap-2 justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'انضباط الحضور والإجازات المعتمدة' : 'Biometric Attendance & Leave Stats'}</h3>
                  <Clock className="w-4 h-4 text-[#00796B] dark:text-emerald-400" />
                </div>
                <div className="space-y-3.5 text-[11px] font-semibold text-slate-650 dark:text-slate-300">
                  {employees.slice(2, 5).map(emp => {
                    const leaves = leaveRequests.filter((l: any) => l.employeeName === emp.name || l.employeeName === emp.fullNameAr || l.employeeName === emp.fullName?.[language]);
                    const totalDays = leaves.reduce((sum: number, current: any) => sum + (current.numberOfDays || current.days || 0), 0);
                    return (
                      <div key={emp.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-2xl transition-all">
                        <div>
                          <p className="text-xs font-black text-slate-850 dark:text-white">{getEmployeeName(emp)}</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{getEmployeeDept(emp)}</p>
                        </div>
                        <div className="text-left font-mono font-black shrink-0">
                          <p className="text-[#00796B] dark:text-emerald-400">{totalDays} {isAr ? 'أيام إجازة' : 'Leave Days'}</p>
                          <p className="text-[9px] text-slate-450 dark:text-slate-400 font-sans font-bold">{isAr ? 'مطابق %96' : '96% Attendance'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs space-y-4 transition-all duration-300">
                <div className="flex items-center gap-2 justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'التصنيف المالي للرواتب والأثر الكادري' : 'Financial & Payroll Evaluation Hub'}</h3>
                  <Coins className="w-4 h-4 text-[#004D40] dark:text-emerald-400" />
                </div>
                <div className="space-y-3.5 text-[11px] font-semibold text-slate-650 dark:text-slate-300">
                  {employees.slice(0, 3).map(emp => {
                    const pay = payrollLedger.find((p: any) => p.employeeName === emp.name || p.employeeName === emp.fullNameAr || p.employeeName === emp.fullName?.[language]);
                    const baseSalary = pay?.basicSalary || emp.basicSalary || 1500;
                    return (
                      <div key={emp.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-2xl transition-all">
                        <div>
                          <p className="text-xs font-black text-slate-850 dark:text-white">{getEmployeeName(emp)}</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-mono mt-0.5">{emp.employeeId}</p>
                        </div>
                        <div className="text-left font-mono font-black shrink-0">
                          <p className="text-slate-850 dark:text-white">{baseSalary} د.ك</p>
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">{isAr ? '+ علاوة سنوية نشطة' : '+ Active bonus'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* General quick stats bar */}
            <div className="bg-gradient-to-br from-[#004D40] via-[#00796B] to-[#26A69A] dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 rounded-[2rem] p-8 text-white grid grid-cols-1 md:grid-cols-4 gap-6 font-bold text-center leading-normal shadow-sm border border-transparent dark:border-slate-800">
              <div className="space-y-1">
                <p className="text-[10.5px] text-emerald-100/80 dark:text-slate-400 font-black uppercase tracking-wider">{isAr ? 'عدد وثائق التقييم' : 'Total Appraisals'}</p>
                <p className="text-3xl font-black font-mono text-white dark:text-[#C5A880]">{appraisals.length}</p>
              </div>
              <div className="space-y-1 border-t md:border-t-0 md:border-r border-white/10 dark:border-slate-800 pt-4 md:pt-0 md:pr-6 text-center">
                <p className="text-[10.5px] text-emerald-100/80 dark:text-slate-400 font-black uppercase tracking-wider">{isAr ? 'المتوسط الحسابي الموحد' : 'System average grade'}</p>
                <p className="text-3xl font-black font-sans text-white dark:text-[#C5A880]">
                  {(appraisals.reduce((sum, curr) => sum + (curr.overallScore || 0), 0) / (appraisals.length || 1)).toFixed(2)} <span className="text-xs font-normal text-emerald-200">/ 5.0</span>
                </p>
              </div>
              <div className="space-y-1 border-t md:border-t-0 md:border-r border-white/10 dark:border-slate-800 pt-4 md:pt-0 md:pr-6 text-center">
                <p className="text-[10.5px] text-emerald-100/80 dark:text-slate-400 font-black uppercase tracking-wider">{isAr ? 'الأهداف السنوية الجارية' : 'Target Goals set'}</p>
                <p className="text-3xl font-black font-mono text-white dark:text-[#C5A880]">{goals.length}</p>
              </div>
              <div className="space-y-1 border-t md:border-t-0 md:border-r border-white/10 dark:border-slate-800 pt-4 md:pt-0 md:pr-6 text-center">
                <p className="text-[10.5px] text-emerald-100/80 dark:text-slate-400 font-black uppercase tracking-wider">{isAr ? 'خطط الـ 90 يوماً للتطوير' : 'Regulatory Dev plans'}</p>
                <p className="text-3xl font-black font-mono text-white dark:text-[#C5A880]">{developmentPlans.length}</p>
              </div>
            </div>

            {/* List of recent activities / alerts */}
            <div className="bg-white dark:bg-[#1E3C50] border border-slate-200/85 dark:border-slate-800/80 rounded-[2rem] p-6 md:p-8 space-y-5 transition-all duration-300">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880] animate-pulse" />
                <span>{isAr ? 'الامتثال وقرارات لجان عدالة للأداء' : 'Statutory Compliance & Legal Decisions'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
                <div className="p-5 bg-emerald-50/40 dark:bg-[#00796B]/10 rounded-2xl border border-emerald-100/60 dark:border-[#00796B]/30 flex items-start gap-3.5 transition-all duration-300 text-right">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[#004D40] dark:text-emerald-300 text-xs">{isAr ? 'تثبيت نهائي وتمرير التوطين' : 'Permanent Localization Confirmed'}</h4>
                    <p className="text-slate-650 dark:text-slate-300 text-[11px] leading-relaxed">
                      {isAr ? 'اجتازت الأستاذة مريم ناصر الصقر تقييم فترة التجربة والتحقق بنجاح بمعدل كفاءة 4.88 ومصادقة الشركاء الشاغلين بالتوقيع.' : 'Sahr Jassem successfully cleared her probation period with score 4.15 and authorized legal stamp.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#FBF9F4] dark:bg-[#513E26]/20 rounded-2xl border border-[#E2D6C5]/70 dark:border-amber-900/40 flex items-start gap-3.5 transition-all duration-300 text-right">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-[#C5A880] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-900 dark:text-amber-300 text-xs">{isAr ? 'خطة تدخل علاجية إجبارية بالبصمة' : 'Mandatory remedial compliance required'}</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {isAr ? 'رصد باحث الموارد انخفاض تتبع البصمة لبدر المطيري لأقل من %87. تم إدراج خطة صقل إجبارية بمجمع وزارة الشؤون لمطابقة لوائح الوفاء.' : 'A corrective training is issued for Bader Al-Mutairi to monitor his presence dockets under Ministry dockets.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SYSTEMATIC APPRAISALS LEDGER WRAPPER */}
        {activeTab === 'appraisals_list' && (
          <div className="space-y-6">
            
            {/* Filters panel */}
            <div className="bg-white dark:bg-[#1E3C50] border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-xs space-y-4 transition-all duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'البحث وتصفية الصكوك الدورية' : 'Filter & Search Appraisal dossiers'}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold">{isAr ? 'فحص السجلات الحالية للمستشارين من خلال مستويات الكفاءة أو تاريخ الاعتماد' : 'Locate past certified files, draft items or archive dockets'}</p>
                </div>
                {/* Score calculated badge */}
                <div className="px-4 py-2 bg-[#E0F2F1] dark:bg-[#00796B]/20 text-[#004D40] dark:text-emerald-400 text-[10.5px] font-black rounded-2xl border border-[#B2DFDB]/20">
                  {isAr ? 'متوسط أداء القائمة الحالية:' : 'Current filtered average:'} <span className="font-mono text-sm">{appraisalListScoreAverage.toFixed(2)}</span> / 5.0
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full h-11 pr-10 pl-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00796B] dark:text-white transition-colors"
                  />
                </div>

                {/* Dept Filter */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
                >
                  <option value="All">{t.allDepts}</option>
                  <option value={isAr ? 'الشؤون التجارية والشركات' : 'Corporate & Commercial'}>{isAr ? 'الشؤون التجارية والشركات' : 'Corporate & Commercial'}</option>
                  <option value={isAr ? 'القانون العام والجنائي' : 'Criminal & Public Law'}>{isAr ? 'القانون العام والجنائي' : 'Criminal & Public Law'}</option>
                  <option value={isAr ? 'التحكيم والوساطة القضائية' : 'Arbitration'}>{isAr ? 'التحكيم والوساطة القضائية' : 'Arbitration'}</option>
                  <option value={isAr ? 'الشؤون القانونية' : 'Legal Affairs'}>{isAr ? 'الشؤون القانونية' : 'Legal Affairs'}</option>
                </select>

                {/* Score Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
                >
                  <option value="All">{t.allTiers}</option>
                  <option value={PerformanceTier.EXCELLENT}>{t.excellent}</option>
                  <option value={PerformanceTier.EXCEEDS_EXPECTATIONS}>{t.veryGood}</option>
                  <option value={PerformanceTier.MEETS_EXPECTATIONS}>{t.good}</option>
                  <option value={PerformanceTier.NEEDS_IMPROVEMENT}>{t.weak}</option>
                </select>

                {/* Approval Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none transition-colors"
                >
                  <option value="All">{t.allStatus}</option>
                  <option value="Certified">{t.certified}</option>
                  <option value="Pending Legal/HR Approval">{t.pending}</option>
                  <option value="Draft">{t.draft}</option>
                  <option value="Archived">{isAr ? 'صكوك مؤرشفة ومؤمنة' : 'Archived ledger items'}</option>
                </select>
              </div>
            </div>

            {/* List Renderer Grid */}
            {filteredAppraisals.length === 0 ? (
              <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-16 text-center space-y-4 transition-colors">
                <FileText className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-800 dark:text-white">{t.emptyList}</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400 max-w-md mx-auto">{t.emptySub}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppraisals.map(app => {
                  const emp = employees.find(e => e.id === app.employeeId);
                  if (!emp) return null;

                  const isArchived = archivedAppraisalIds.includes(app.id);
                  let ratingText = t.good;
                  let ratingColor = 'bg-slate-100 dark:bg-[#102A3A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';

                  if (app.overallScore >= 4.5) {
                    ratingText = t.excellent;
                    ratingColor = 'bg-[#E0F2F1] dark:bg-[#00796B]/25 text-[#004D40] dark:text-emerald-400 border-[#00796B]/20';
                  } else if (app.overallScore >= 3.8) {
                    ratingText = t.veryGood;
                    ratingColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-350 border-emerald-100/40 dark:border-emerald-900/30';
                  } else if (app.overallScore < 3.0) {
                    ratingText = t.weak;
                    ratingColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100/40 dark:border-rose-900/30';
                  }

                  const matchedTypeAr = APPRAISAL_TYPES.find(x => x.id === app.formType)?.ar || 'تقييم كادري شامل';

                  return (
                    <motion.div
                      layout
                      key={app.id}
                      className="bg-white dark:bg-[#1E3C50] border border-slate-200/85 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#00796B] dark:hover:border-emerald-500 relative flex flex-col justify-between gap-5"
                    >
                      <div className="space-y-4">
                        {/* Avatar & Header */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#00796B] dark:bg-emerald-600 text-white flex items-center justify-center font-black text-xs font-sans shrink-0">
                              {emp.avatarInitials || emp.name?.slice(0, 2) || 'MA'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-850 dark:text-white hover:text-[#00796B] dark:hover:text-emerald-400 transition-all cursor-pointer truncate" onClick={() => { setSelectedAppraisalForPrint(app); setIsPrintModalOpen(true); }}>
                                {getEmployeeName(emp)}
                              </h4>
                              <p className="text-[9.5px] text-slate-400 dark:text-slate-400 font-bold truncate">{getEmployeeJob(emp)}</p>
                            </div>
                          </div>
                          
                          <span className={`px-2 py-0.5 text-[8.5px] rounded-lg font-black uppercase text-center border shrink-0 ${ratingColor}`}>
                            {ratingText}
                          </span>
                        </div>

                        {/* Appraisal parameters */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#102A3A]/40 p-3 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-semibold border border-slate-100/60 dark:border-slate-850">
                          <div>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black">{t.civilIdLabel}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-mono font-bold block mt-0.5">{emp.civilId || '296052403198'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t.periodLabel}</span>
                            <span className="text-[#004D40] dark:text-[#C5A880] block font-black mt-0.5">{app.appraisalPeriod}</span>
                          </div>
                        </div>

                        {/* Weighted score display */}
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="block text-[8.5px] text-slate-400 dark:text-slate-500 font-bold uppercase">{t.scoreLabel}</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-lg font-black text-[#004D40] dark:text-emerald-400 font-sans">{app.overallScore}</span>
                              <span className="text-[9.5px] text-slate-400">/ 5</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold">{isAr ? 'نمط وصياغة المستند' : 'Template Type'}</span>
                            <span className="text-[9.5px] text-[#00796B] dark:text-[#C5A880] font-extrabold mt-0.5 block">{isAr ? matchedTypeAr.slice(0, 24) + '...' : app.formType}</span>
                          </div>
                        </div>

                        {/* Satus values & actions */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs">
                          <span className={`px-2 py-0.5 text-[8.5px] rounded-md border ${
                            app.status === 'Certified' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/40 dark:border-emerald-900/30 font-bold' 
                              : app.status === 'Draft'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-[#C5A880] border-amber-100/40 dark:border-amber-900/30 font-bold'
                          }`}>{app.status === 'Certified' ? t.certified : app.status === 'Draft' ? t.draft : t.pending}</span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => { setSelectedAppraisalForPrint(app); setIsPrintModalOpen(true); }} className="p-1.5 hover:bg-slate-50 dark:hover:bg-[#102A3A] text-[#00796B] dark:text-emerald-400 rounded-lg transition-all cursor-pointer bg-transparent border-none">
                              <Printer className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDuplicate(app)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-[#102A3A] text-slate-400 dark:text-slate-450 hover:text-slate-600 dark:hover:text-white rounded-lg transition-all cursor-pointer bg-transparent border-none">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => resetWizard('edit', app)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-[#102A3A] text-slate-400 dark:text-slate-450 hover:text-indigo-600 rounded-lg transition-all cursor-pointer bg-transparent border-none">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleToggleArchive(app.id, getEmployeeName(emp))} className={`p-1.5 hover:bg-slate-50 dark:hover:bg-[#102A3A] rounded-lg transition-all cursor-pointer bg-transparent border-none ${isArchived ? 'text-[#00796B] dark:text-emerald-400' : 'text-slate-400 hover:text-slate-850'}`}>
                              <Archive className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(app.id)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-[#102A3A] text-slate-350 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all cursor-pointer bg-transparent border-none">
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: KEY PERFORMANCE INDICATORS COMPARE MATRIX */}
        {activeTab === 'kpis_track' && (
          <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs transition-all duration-300 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'مصفوفة درجات ومعايير الأداء الرئيسية KPI للمستشارين' : 'Core KPI Metric Analysis Index Ledger'}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold mt-1">{isAr ? 'مراجعة وتعديل درجات الكفاءة الفردية ومحاور العمل القضائي بمكتب صبري شطا' : 'Full system comparison of custom weights, success ratios and hours'}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs font-semibold border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#102A3A] text-slate-800 dark:text-slate-300 uppercase text-[9.5px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">{isAr ? 'اسم المستشار القانوني / الموظف' : 'Advising Associate Name'}</th>
                    <th className="p-4">{isAr ? 'نمط ودورة التقييم' : 'Appraisal Term & Template'}</th>
                    <th className="p-4 text-center">{isAr ? 'الصياغة والبحث (5)' : 'Drafting Briefs'}</th>
                    <th className="p-4 text-center">{isAr ? 'إنجاز الجلسات (5)' : 'Success Ratio'}</th>
                    <th className="p-4 text-center">{isAr ? 'النزاهة والسلوك (5)' : 'Client Ethics'}</th>
                    <th className="p-4 text-center">{isAr ? 'الامتثال والبصمة (5)' : 'Hours Compliance'}</th>
                    <th className="p-4 text-center">{isAr ? 'المعدل النهائي الثابت' : 'Weighted Outcome'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {appraisals.map(app => {
                    const emp = employees.find(e => e.id === app.employeeId);
                    if (!emp) return null;
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-[#102A3A]/40 transition-all font-semibold border-slate-100 dark:border-slate-800">
                        <td className="p-4 font-black text-slate-900 dark:text-white">{getEmployeeName(emp)}</td>
                        <td className="p-4 text-slate-550 dark:text-slate-400 text-[10px]">{app.appraisalPeriod} ({APPRAISAL_TYPES.find(x => x.id === app.formType)?.ar.slice(0, 16) || 'سنوي'}...)</td>
                        <td className="p-4 text-center font-sans font-extrabold text-slate-600 dark:text-slate-350">{app.scores?.drafting ?? 5}</td>
                        <td className="p-4 text-center font-sans font-extrabold text-slate-600 dark:text-slate-350">{app.scores?.successRate ?? 5}</td>
                        <td className="p-4 text-center font-sans font-extrabold text-slate-600 dark:text-slate-350">{app.scores?.clientRelations ?? 5}</td>
                        <td className="p-4 text-center font-sans font-extrabold text-slate-600 dark:text-slate-350">{app.scores?.compliance ?? 5}</td>
                        <td className="p-4 text-center font-sans font-black text-[#00796B] dark:text-emerald-400">{app.overallScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DEVELOPMENT WORK BOARDS & IMPROVEMENTS */}
        {activeTab === 'development_plans' && (
          <div className="space-y-6">
            
            {/* Quick Goals & Dev actions wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Core Goals (CRUD) */}
              <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs space-y-4 transition-all duration-300">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'أهداف الكفاءة والأداء السنوي' : 'Core Statutory Target Goals'}</h3>
                    <p className="text-[9.5px] text-slate-400 dark:text-slate-400 font-bold mt-1">{isAr ? 'تتبع ومطابقة الأهداف المستهدفة للمستشارين' : 'Annual goals mapped for promotion parameters'}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (employees.length > 0) {
                        setNewGoalData({ employeeId: employees[0].id, titleAr: '', titleEn: '', targetDate: new Date().toISOString().split('T')[0], statusAr: 'قيد التنفيذ' });
                        setIsGoalModalOpen(true);
                      }
                    }}
                    className="h-8 px-3.5 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl text-[9.5px] font-black cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إدراج هدف' : 'Add Goal'}</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  {goals.map(g => {
                    const emp = employees.find(e => e.id === g.employeeId);
                    return (
                      <div key={g.id} className="p-4.5 bg-slate-50 dark:bg-[#102A3A]/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 relative transition-all hover:border-[#00796B] dark:hover:border-[#00796B]">
                        <button onClick={() => handleDeleteGoal(g.id)} className="absolute top-4 left-4 p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-600 border-none bg-transparent cursor-pointer transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                        <span className="text-[8px] bg-[#E0F2F1] dark:bg-[#00796B]/20 text-[#00796B] dark:text-emerald-400 border border-[#00796B]/20 font-black px-2 py-0.5 rounded uppercase">الهدف السنوي</span>
                        <h4 className="text-xs font-black text-slate-850 dark:text-white mt-2 leading-relaxed">{translate(g.titleAr, g.titleEn)}</h4>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold mt-2.5 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#00796B] dark:text-emerald-400" />
                          <span>المستشار المتابع: <strong className="text-slate-800 dark:text-slate-200">{getEmployeeName(emp)}</strong></span>
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-400 font-bold border-t border-slate-200/50 dark:border-slate-800/60 pt-3 mt-3">
                          <span>أجل الوفاء: <strong className="font-mono text-slate-700 dark:text-slate-300">{g.targetDate}</strong></span>
                          <span className="bg-emerald-50 dark:bg-[#00796B]/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-100/30 dark:border-[#00796B]/20 font-black">{g.statusAr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Development Corrective 90-days Plans (CRUD) */}
              <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs space-y-4 transition-all duration-300">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'سجلات تقويم الأداء الـ 90 يوماً' : 'Remedial Improvement Plans'}</h3>
                    <p className="text-[9.5px] text-slate-400 dark:text-slate-400 font-bold mt-1">{isAr ? 'خطط التدخل الإجبارية لمطابقة القوانين للمتدني أداؤهم' : 'Mandatory monitoring logs for low scores'}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (employees.length > 0) {
                        setNewDevData({ employeeId: employees[0].id, titleAr: '', titleEn: '', mentor: isAr ? 'أ. صبري شطا' : 'Sabri Shatta', targetDate: new Date().toISOString().split('T')[0], progress: 25 });
                        setIsDevPlanModalOpen(true);
                      }
                    }}
                    className="h-8 px-3.5 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl text-[9.5px] font-black cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إدراج خطة' : 'Add Plan'}</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  {developmentPlans.map(d => {
                    const emp = employees.find(e => e.id === d.employeeId);
                    return (
                      <div key={d.id} className="p-4.5 bg-slate-50 dark:bg-[#102A3A]/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl relative transition-all hover:border-[#00796B] dark:hover:border-[#00796B]">
                        <button onClick={() => handleDeleteDevPlan(d.id)} className="absolute top-4 left-4 p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-600 border-none bg-transparent cursor-pointer transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                        <span className="text-[8px] bg-amber-50 dark:bg-[#513E26]/20 text-[#A3845B] dark:text-[#C5A880] border border-amber-200/30 dark:border-amber-900/30 font-extrabold px-2 py-0.5 rounded uppercase">خطة صقل علاجية</span>
                        <h4 className="text-xs font-black text-slate-850 dark:text-white mt-2 leading-relaxed">{translate(d.titleAr, d.titleEn)}</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 mt-2.5 font-bold leading-normal">
                          <div>المستهدف صقله: <strong className="text-slate-800 dark:text-slate-200">{getEmployeeName(emp)}</strong></div>
                          <div>المعلم المسؤول: <strong className="text-slate-800 dark:text-slate-200">{d.mentor}</strong></div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-mono">تاريخ الصب: <strong className="text-slate-700 dark:text-slate-300 font-normal">{d.targetDate}</strong></span>
                          <div className="w-28 space-y-1 select-none">
                            <div className="flex justify-between items-center text-[8.5px] font-mono text-[#00796B] dark:text-emerald-400 font-bold">
                              <span>قوة التقدم:</span>
                              <span>{d.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-[#00796B] to-emerald-400 h-full rounded-full" style={{ width: `${d.progress}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: RECOMMENDATIONS & EXECUTIVE DECISIONS LOG */}
        {activeTab === 'recommendations' && (
          <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs transition-all duration-300 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{isAr ? 'لوحة التوجيهات وحوكمة التوصيات الاستشارية المعتمدة' : 'Official Recommendations & Statutory HR Decisions Ledger'}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold mt-1">{isAr ? 'عقود ترقيات مستشاري الشركاء، التكافل المالي، وقرارات اللجان بموجب قانون العمل' : 'Manage corporate promotions, scale adjustments and corrective training schedules'}</p>
              </div>
              <button
                onClick={() => {
                  if (employees.length > 0) {
                    setNewRecData({ employeeId: employees[0].id, typeAr: 'زيادة راتب ترقية الأداء', typeEn: 'Scale Promotion Hike', recommendationTextAr: '', recommendationTextEn: '', effectiveDate: new Date().toISOString().split('T')[0], decisionStatus: 'Pending' });
                    setIsRecModalOpen(true);
                  }
                }}
                className="h-9 px-4 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl text-xs font-black cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إدراج توجيه كادري' : 'Record Recommendation'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.map(rec => {
                const emp = employees.find(e => e.id === rec.employeeId);
                return (
                  <div key={rec.id} className="p-5 bg-slate-50 dark:bg-[#102A3A]/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex flex-wrap justify-between items-start gap-4 relative transition-all hover:border-[#00796B]">
                    <button onClick={() => handleDeleteRec(rec.id)} className="absolute top-4 left-4 p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 border-none bg-transparent cursor-pointer transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[8.5px] bg-[#E0F2F1] dark:bg-[#00796B]/20 text-[#00796B] dark:text-emerald-400 border border-[#00796B]/20 px-2.5 py-0.5 rounded font-black uppercase">
                          {translate(rec.typeAr, rec.typeEn)}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">ID: {rec.refId}</span>
                      </div>
                      
                      <h4 className="text-xs font-black text-[#004D40] dark:text-emerald-300">
                        توجيه الترشيح للمستشار المتابع: <span className="text-slate-800 dark:text-white font-black">{getEmployeeName(emp)}</span>
                      </h4>
                      <p className="text-slate-650 dark:text-slate-300 text-[11.5px] leading-relaxed max-w-2xl font-semibold italic">
                        "{translate(rec.recommendationTextAr, rec.recommendationTextEn)}"
                      </p>
                      
                      <div className="flex gap-4 text-[9.5px] text-slate-400 dark:text-slate-400 font-bold font-sans">
                        <span>أجل الوجوب والتنفيذ: <strong className="text-slate-700 dark:text-slate-300">{rec.effectiveDate}</strong></span>
                        <span>مستوى تقييم الموظف بالبصمة: <strong className="text-[#00796B] dark:text-emerald-400">ممتاز واستثنائي</strong></span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-3 py-1 text-[10px] rounded-lg font-black uppercase text-center border shrink-0 ${
                        rec.decisionStatus === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/40 dark:border-emerald-900/30 font-bold' :
                        rec.decisionStatus === 'Implemented' ? 'bg-[#E0F2F1] dark:bg-[#00796B]/20 text-[#00796B] dark:text-emerald-400 border-emerald-100/30 dark:border-[#00796B]/30 font-bold' :
                        'bg-amber-50 dark:bg-[#513E26]/20 text-amber-600 dark:text-[#C5A880] border-amber-100/40 dark:border-amber-900/30 font-bold'
                      }`}>
                        {rec.decisionStatus === 'Pending' ? t.pending : rec.decisionStatus === 'Approved' ? (isAr ? 'مصادق ومعتمد' : 'Approved') : (isAr ? 'تم تنفيذه آلياً بالرواتب' : 'Implemented')}
                      </span>

                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => toggleRecStatus(rec.id, rec.decisionStatus)}
                          className="px-3.5 h-8 bg-[#00796B]/10 hover:bg-[#00796B]/20 dark:bg-emerald-600/10 dark:hover:bg-emerald-600/20 text-[#00796B] dark:text-emerald-400 border-none text-[9.5px] font-black rounded-lg cursor-pointer transition-colors"
                        >
                          {isAr ? 'تحديث الحالة / تفعيل بالرواتب' : 'Progress State'}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & CHARTS VISUALIZERS */}
        {activeTab === 'reports_analytics' && (
          <PerformanceReportsSuite
            appraisals={appraisals}
            employees={employees}
            goals={goals}
            developmentPlans={developmentPlans}
            language={language}
          />
        )}

      </div>

      {/* --- INTAKE WIZARD FOR APPRAISALS (4 STEPS) --- */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4" dir={isAr ? 'rtl' : 'ltr'}>
                <div>
                  <span className="text-[9px] font-black uppercase text-[#00796B] dark:text-emerald-400 bg-[#E0F2F1] dark:bg-[#00796B]/20 px-3 py-1 rounded-md">منظومة المطابقة والامتثال القانوني</span>
                  <h3 className="text-sm md:text-base font-black text-[#004D40] dark:text-white mt-1.5">
                    {formMode === 'create' ? t.wizardTitleAddNew : t.wizardTitleEdit}
                  </h3>
                </div>
                <button onClick={() => setIsWizardOpen(false)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none">
                  <span className="text-lg font-bold">✕</span>
                </button>
              </div>

              {/* Steps Progress slider */}
              <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 dark:text-slate-450 border-b border-slate-100 dark:border-slate-800 pb-3.5 select-none" dir={isAr ? 'rtl' : 'ltr'}>
                {[1, 2, 3, 4].map(stepNum => (
                  <div key={stepNum} className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      wizardStep >= stepNum ? 'bg-[#00796B] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}>{stepNum}</span>
                    <span className={wizardStep === stepNum ? 'text-[#00796B] dark:text-emerald-400 font-black' : 'hidden md:inline font-bold'}>
                      {stepNum === 1 && (isAr ? 'ملف الموظف والنمط' : 'Employee & Pattern')}
                      {stepNum === 2 && (isAr ? 'درجات الـ KPIs' : 'KPI score matrix')}
                      {stepNum === 3 && (isAr ? 'مسار الغايات والتمكين' : 'Goals & Trainings')}
                      {stepNum === 4 && (isAr ? 'بصمة الصك والاعتماد' : 'Digital Stamp')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Form Content wrapper */}
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300 leading-normal" dir={isAr ? 'rtl' : 'ltr'}>
                
                {/* STEP 1: Employee and and evaluation type */}
                {wizardStep === 1 && (
                  <div className="space-y-4 text-right">
                    <div className="space-y-1.5">
                      <label className="text-slate-450 block uppercase font-black text-[9px]">{t.selectEmployee}</label>
                      <select
                        value={wEmployeeId}
                        onChange={(e) => setWEmployeeId(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-slate-700 dark:text-white focus:ring-1 focus:ring-[#00796B] focus:outline-none"
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {getEmployeeName(emp)} ({getEmployeeJob(emp)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Integrated alerts */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border rounded-2xl space-y-3 border-slate-150 dark:border-slate-800 text-[11px] font-bold">
                      <p className="text-emerald-700 dark:text-emerald-400 font-black">✔ {t.autofillAlert}</p>
                      {activeEmployeeMeta && (
                        <div className="grid grid-cols-2 gap-4 pt-1 text-slate-650 dark:text-slate-300 leading-relaxed">
                          <div>{isAr ? 'الرقم المدني الكويتي:' : 'Civil ID:'} <span className="font-mono text-slate-700 dark:text-white font-extrabold">{activeEmployeeMeta.civilId || '296052403198'}</span></div>
                          <div>{isAr ? 'القسم / الدائرة:' : 'Department:'} <span className="text-slate-705 dark:text-slate-200 font-black">{getEmployeeDept(activeEmployeeMeta)}</span></div>
                          <div>{isAr ? 'الحالة والمستحقات بالفريق:' : 'Salary details:'} <span className="text-slate-705 dark:text-slate-200 font-mono">{(activeEmployeeMeta.basicSalary || activeEmployeeMeta.salary || 1500) + (activeEmployeeMeta.allowancesAmount || 0)} د.ك</span></div>
                          <div>{isAr ? 'ساعات الحضور والغياب:' : 'Attendance:'} <span className="text-emerald-600 dark:text-emerald-400 font-black">طبيعي ومطابق %96</span></div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-450 block uppercase font-bold">{isAr ? 'دورة التقييم ومطابقتها' : 'Appraisal Term'}</label>
                        <input
                          type="text"
                          value={wPeriod}
                          onChange={(e) => setWPeriod(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-450 block uppercase font-bold">{isAr ? 'تاريخ التقرير المبرم' : 'Report Date'}</label>
                        <input
                          type="date"
                          value={wDate}
                          onChange={(e) => setWDate(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-mono text-slate-700 dark:text-white text-left focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-450 block uppercase font-bold">{isAr ? 'النموذج القانوني المعتمد' : 'Appraisal Template Template'}</label>
                        <select
                          value={appraisalFormType}
                          onChange={(e) => setAppraisalFormType(e.target.value)}
                          className="w-full h-11 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl px-2 font-black text-slate-700 dark:text-white text-xs focus:outline-none"
                        >
                          {APPRAISAL_TYPES.map(f => (
                            <option key={f.id} value={f.id}>{translate(f.ar, f.en)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: KPI scores */}
                {wizardStep === 2 && (
                  <div className="space-y-4 text-right">
                    <p className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">تحديد درجات الاستحقاق لـ ({APPRAISAL_TYPES.find(x => x.id === appraisalFormType)?.ar || 'بند تقييم الأداء'})</p>
                    
                    <div className="space-y-3">
                      
                      {/* Dynamic form additions based on selection */}
                      {appraisalFormType === 'probation' && (
                        <div className="p-3.5 bg-amber-50/50 dark:bg-[#513E26]/20 border border-amber-200/40 dark:border-[#513E26]/30 rounded-xl space-y-2 mb-2 font-bold text-slate-700 dark:text-slate-300">
                          <p className="text-amber-800 dark:text-[#C5A880] text-[9.5px] font-black uppercase">💡 {isAr ? 'حالة التثبيت عمالياً بموجب المادة 32 (فترة التجربة):' : 'Kuwait labor Article 32 (Probation):'}</p>
                          <div className="flex gap-4 flex-wrap">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="radio" name="probation_radio" checked={probationOutcome === 'Confirm'} onChange={() => setProbationOutcome('Confirm')} className="accent-[#00796B]" />
                              <span>{isAr ? 'تثبيت الموظف نهائياً' : 'Approve Perm Contract'}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="radio" name="probation_radio" checked={probationOutcome === 'Extend'} onChange={() => setProbationOutcome('Extend')} className="accent-[#00796B]" />
                              <span>{isAr ? 'تمديد فترة التجربة الكادرية' : 'Extend Probation'}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="radio" name="probation_radio" checked={probationOutcome === 'Dismiss'} onChange={() => setProbationOutcome('Dismiss')} className="accent-[#00796B]" />
                              <span>{isAr ? 'إنهاء الخدمة لعدم الصلاحية' : 'Dismiss Employee'}</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {appraisalFormType === 'promotion' && (
                        <div className="p-3.5 bg-emerald-50/50 dark:bg-[#00796B]/15 border border-emerald-200/40 dark:border-[#00796B]/20 rounded-xl space-y-2 mb-2 font-bold text-slate-700 dark:text-slate-300">
                          <p className="text-[#004D40] dark:text-emerald-400 text-[9.5px] font-black uppercase">💵 {isAr ? 'الترقية والزيادة المالية المقترحة بالراتب الأساسي:' : 'Proposed Increment (Salary hike):'}</p>
                          <div className="flex items-center gap-2">
                            <span>الزيادة المقترحة بالراتب:</span>
                            <input
                              type="number"
                              value={proposedHike}
                              onChange={(e) => setProposedHike(parseInt(e.target.value) || 0)}
                              className="w-20 text-center h-8.5 bg-white dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-black text-[#00796B] dark:text-emerald-400 focus:outline-none"
                            />
                            <span>د.ك شهرياً</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-[#102A3A]/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 gap-4">
                        <div className="space-y-1 text-right">
                          <h4 className="text-[11.5px] font-black text-slate-850 dark:text-white">{t.kpi1}</h4>
                          <p className="text-[9px] text-[#00796B] dark:text-emerald-400 font-bold max-w-md">{t.kpi1Desc}</p>
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step="0.1"
                          value={scoreDrafting}
                          onChange={(e) => setScoreDrafting(parseFloat(e.target.value))}
                          className="w-16 h-10 text-center border dark:border-slate-800 bg-white dark:bg-[#102A3A] rounded-xl font-sans font-black text-[#00796B] dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-[#102A3A]/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 gap-4">
                        <div className="space-y-1 text-right">
                          <h4 className="text-[11.5px] font-black text-slate-850 dark:text-white">{t.kpi2}</h4>
                          <p className="text-[9px] text-[#00796B] dark:text-emerald-400 font-bold max-w-md">{t.kpi2Desc}</p>
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step="0.1"
                          value={scoreSuccess}
                          onChange={(e) => setScoreSuccess(parseFloat(e.target.value))}
                          className="w-16 h-10 text-center border dark:border-slate-800 bg-white dark:bg-[#102A3A] rounded-xl font-sans font-black text-[#00796B] dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-[#102A3A]/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 gap-4">
                        <div className="space-y-1 text-right">
                          <h4 className="text-[11.5px] font-black text-slate-850 dark:text-white">{t.kpi3}</h4>
                          <p className="text-[9px] text-[#00796B] dark:text-emerald-400 font-bold max-w-md">{t.kpi3Desc}</p>
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step="0.1"
                          value={scoreClient}
                          onChange={(e) => setScoreClient(parseFloat(e.target.value))}
                          className="w-16 h-10 text-center border dark:border-slate-800 bg-white dark:bg-[#102A3A] rounded-xl font-sans font-black text-[#00796B] dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-[#102A3A]/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 gap-4">
                        <div className="space-y-1 text-right">
                          <h4 className="text-[11.5px] font-black text-slate-850 dark:text-white">{t.kpi4}</h4>
                          <p className="text-[9px] text-[#00796B] dark:text-emerald-400 font-bold max-w-md">{t.kpi4Desc}</p>
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step="0.1"
                          value={scoreCompliance}
                          onChange={(e) => setScoreCompliance(parseFloat(e.target.value))}
                          className="w-16 h-10 text-center border dark:border-slate-800 bg-white dark:bg-[#102A3A] rounded-xl font-sans font-black text-[#00796B] dark:text-white focus:outline-none"
                        />
                      </div>

                    </div>
                  </div>
                )}

                {/* STEP 3: Strengths, Areas & Trainings */}
                {wizardStep === 3 && (
                  <div className="space-y-4 text-right">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] text-slate-450 block uppercase font-bold">{t.strengthsLabel} (بالعربية)</label>
                      <input
                        type="text"
                        value={wStrengthsAr}
                        onChange={(e) => setWStrengthsAr(e.target.value)}
                        placeholder="مثال: صياغة متكاملة، كسب قضايا العقود ذات الملايين..."
                        className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] text-slate-450 block uppercase font-bold">{t.improvementsLabel} (بالعربية)</label>
                      <input
                        type="text"
                        value={wImprovementsAr}
                        onChange={(e) => setWImprovementsAr(e.target.value)}
                        placeholder="مثال: تكثيف سرعة المرافعة الشفوية أمام دائر الاستئناف..."
                        className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-400 block uppercase font-bold">Strengths (In English)</label>
                        <input
                          type="text"
                          value={wStrengthsEn}
                          onChange={(e) => setWStrengthsEn(e.target.value)}
                          placeholder="E.g., Exceptional constitutional defenses..."
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-slate-700 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-400 block uppercase font-bold">Improvements (In English)</label>
                        <input
                          type="text"
                          value={wImprovementsEn}
                          onChange={(e) => setWImprovementsEn(e.target.value)}
                          placeholder="E.g., Needs more commercial exposure..."
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-slate-700 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-450 block uppercase font-bold">{t.trainingLabel} (بالعربية)</label>
                        <input
                          type="text"
                          value={wTrainingAr}
                          onChange={(e) => setWTrainingAr(e.target.value)}
                          placeholder="ورشة التحكيم التجاري المعتمدة..."
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-400 block uppercase font-bold">Seminars (In English)</label>
                        <input
                          type="text"
                          value={wTrainingEn}
                          onChange={(e) => setWTrainingEn(e.target.value)}
                          placeholder="Specialized Arbitration training..."
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-slate-700 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Signatures and digital validation Code */}
                {wizardStep === 4 && (
                  <div className="space-y-4 text-right">
                    <div className="bg-[#E0F2F1]/30 dark:bg-[#00796B]/10 p-4.5 rounded-2xl border border-[#B2DFDB]/50 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-black text-[#004D40] dark:text-emerald-300">{translate('مراجعة تفاصيل الحصيلة والمطابقة', 'Weighted appraisal outcomes review')}</h4>
                      <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-slate-800 dark:text-white">المعدل الكلي التراكمي:</span>
                        <span className="text-lg font-black text-[#00796B] dark:text-emerald-400 font-sans">{formOverallScore} / 5</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-450 block uppercase font-bold">{t.signeeLabel}</label>
                        <input
                          type="text"
                          value={wSigneeAr}
                          onChange={(e) => setWSigneeAr(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-450 block uppercase font-bold">بصمة الاعتماد الرقمي للمكتب (SHA-CODE)</label>
                        <input
                          type="text"
                          value={wDigitalCode}
                          onChange={(e) => setWDigitalCode(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-500 dark:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-[#102A3A]/40 rounded-xl border border-slate-150 dark:border-slate-800/80 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-bold">
                      ✔ بموجب الفحوص اللائحية وربط قواعد البيانات، يؤكد مكتب المحامي صبري شطا صحة المطابقة الكادرية ونزاهة الاستقصاء، وتمرير نسخة لقواعد بيانات شؤون الموظفين عمالياً آلياً بنسبة ١٠٠%.
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Footer controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-xs select-none">
                <div>
                  {wizardStep > 1 && (
                    <button type="button" onClick={() => setWizardStep(prev => prev - 1)} className="h-11 px-4 text-xs font-bold bg-slate-100 dark:bg-[#102A3A] hover:bg-slate-200 dark:hover:bg-slate-800 border-none text-slate-650 dark:text-slate-300 rounded-xl cursor-pointer transition-colors">{t.prevBtn}</button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsWizardOpen(false)} className="h-11 px-4 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#102A3A] rounded-xl cursor-pointer font-bold transition-colors">{t.cancel}</button>
                  
                  {wizardStep < 4 ? (
                    <button type="button" onClick={() => setWizardStep(prev => prev + 1)} className="h-11 px-5 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl cursor-pointer text-xs font-black transition-colors">{t.nextBtn}</button>
                  ) : (
                    <>
                      <button type="button" onClick={() => handleWizardSubmit('Draft')} className="h-11 px-4.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#00796B] dark:text-emerald-400 border-none rounded-xl cursor-pointer text-xs font-black transition-colors">{t.saveDraft}</button>
                      <button type="button" onClick={() => handleWizardSubmit('Certified')} className="h-11 px-6 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl cursor-pointer text-xs font-black transition-colors">{t.submitCertify}</button>
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- WYSIWYG PRE-PRINT PREVIEW STUDIO MODAL --- */}
      <PrePrintEditorModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedAppraisalForPrint(null);
        }}
        appraisal={selectedAppraisalForPrint}
        employee={selectedAppraisalForPrint ? employees.find(e => e.id === selectedAppraisalForPrint.employeeId) : null}
        language={language}
        onSave={(updatedApp) => {
          setAppraisals(appraisals.map(a => a.id === updatedApp.id ? updatedApp : a));
          triggerToast(translate('تم حفظ تعديلات التحرير بالدفتر الرئيسي', 'Pre-print edits saved'), translate('تم قفل وحفظ تفاصيل الصك المعدل بالموارد البشرية.', 'Dossier values saved back successfully.'));
        }}
      />

      {/* --- ADD GOAL FORM MODAL --- */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-xs text-slate-700 dark:text-slate-200"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 font-bold">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#00796B] dark:text-emerald-400 bg-[#E0F2F1] dark:bg-[#00796B]/20 px-3 py-1 rounded-md">{isAr ? 'الغايات والـ KPIs' : 'Goals & KPIs'}</span>
                  <h3 className="text-sm font-black text-[#004D40] dark:text-white mt-1.5">إدراج هدف سنوي كادري جديد</h3>
                </div>
                <button onClick={() => setIsGoalModalOpen(false)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-4 font-semibold text-xs leading-normal">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">ربطه بالمستشار الاستهدافي</label>
                  <select
                    value={newGoalData.employeeId}
                    onChange={(e) => setNewGoalData({ ...newGoalData, employeeId: e.target.value })}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-700 dark:text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{getEmployeeName(emp)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">أفق وموضوع الهدف باللغة العربية</label>
                  <textarea
                    rows={2}
                    required
                    value={newGoalData.titleAr}
                    onChange={(e) => setNewGoalData({ ...newGoalData, titleAr: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">Title (In English)</label>
                    <input
                      type="text"
                      value={newGoalData.titleEn}
                      onChange={(e) => setNewGoalData({ ...newGoalData, titleEn: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">أجل الاستحقاق النهائي</label>
                    <input
                      type="date"
                      required
                      value={newGoalData.targetDate}
                      onChange={(e) => setNewGoalData({ ...newGoalData, targetDate: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-[#102A3A] border border-slate-200 dark:border-slate-800 rounded-xl text-left font-mono text-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs font-bold leading-normal select-none">
                  <button type="button" onClick={() => setIsGoalModalOpen(false)} className="h-11 px-4 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#102A3A] rounded-xl cursor-pointer font-bold transition-colors">إلغاء</button>
                  <button type="submit" className="h-11 px-6 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl cursor-pointer font-black text-xs transition-colors">إدراج ومطابقة الهدف بالدفتر</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD DEV PLAN MODAL --- */}
      <AnimatePresence>
        {isDevPlanModalOpen && (
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-xs text-slate-700 dark:text-slate-200"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 font-bold">
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-3 py-1 rounded-md">{isAr ? 'برامج التمكين المهني' : 'Training & Dev'}</span>
                  <h3 className="text-sm font-black text-[#004D40] dark:text-white mt-1.5">إطلاق خطة تقويم وصقل جديدة 90 يوماً</h3>
                </div>
                <button onClick={() => setIsDevPlanModalOpen(false)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <form onSubmit={handleAddDevPlan} className="space-y-4 font-semibold text-xs leading-normal">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">الموظف المقصر المستهدف بصقل الأداء</label>
                  <select
                    value={newDevData.employeeId}
                    onChange={(e) => setNewDevData({ ...newDevData, employeeId: e.target.value })}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-700 dark:text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{getEmployeeName(emp)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">خطة ومحاور التقويم الوجوبية (عربي)</label>
                  <textarea
                    rows={2}
                    required
                    value={newDevData.titleAr}
                    onChange={(e) => setNewDevData({ ...newDevData, titleAr: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">Mentor/المعلم المقيّم</label>
                    <input
                      type="text"
                      required
                      value={newDevData.mentor}
                      onChange={(e) => setNewDevData({ ...newDevData, mentor: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">تاريخ نهاية مسار التقويم</label>
                    <input
                      type="date"
                      required
                      value={newDevData.targetDate}
                      onChange={(e) => setNewDevData({ ...newDevData, targetDate: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-left font-mono text-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">قوة البدء والتقدم للبرنامج (%):</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={newDevData.progress}
                      onChange={(e) => setNewDevData({ ...newDevData, progress: parseInt(e.target.value) || 0 })}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-800 accent-[#00796B]"
                    />
                    <span className="font-mono text-sm font-black text-[#00796B] dark:text-emerald-400 min-w-[40px] text-left">{newDevData.progress}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs font-bold leading-normal select-none">
                  <button type="button" onClick={() => setIsDevPlanModalOpen(false)} className="h-11 px-4 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-950 rounded-xl cursor-pointer font-bold transition-colors">إلغاء</button>
                  <button type="submit" className="h-11 px-6 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl cursor-pointer font-black text-xs transition-colors">تعميد كشف التقويم والمراقبة</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD RECOMMENDATION MODAL --- */}
      <AnimatePresence>
        {isRecModalOpen && (
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-xs text-slate-700 dark:text-slate-200"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 font-bold">
                <div>
                  <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 rounded-md">{isAr ? 'قرارات وتوصيات الكادر' : 'Staff Decisions'}</span>
                  <h3 className="text-sm font-black text-[#004D40] dark:text-white mt-1.5">تسجيل توصية وقرار وتوجيه كادري</h3>
                </div>
                <button onClick={() => setIsRecModalOpen(false)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <form onSubmit={handleAddRec} className="space-y-4 font-semibold text-xs leading-normal">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">الموظف الموصى له بالقرار</label>
                  <select
                    value={newRecData.employeeId}
                    onChange={(e) => setNewRecData({ ...newRecData, employeeId: e.target.value })}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-700 dark:text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{getEmployeeName(emp)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">نوع التوجيه والقرار (عربي)</label>
                    <input
                      type="text"
                      required
                      value={newRecData.typeAr}
                      placeholder="علاوة سنوية، ترقية كادر..."
                      onChange={(e) => setNewRecData({ ...newRecData, typeAr: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-700 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">تاريخ نفاذ ومطابقة التوجيه</label>
                    <input
                      type="date"
                      required
                      value={newRecData.effectiveDate}
                      onChange={(e) => setNewRecData({ ...newRecData, effectiveDate: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-left font-mono text-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-450 block uppercase font-black">صياغة نص القرار والتوصية الوجوبية (عربي)</label>
                  <textarea
                    rows={3}
                    required
                    value={newRecData.recommendationTextAr}
                    placeholder="بناءً على التقارير الفنية ولجنة النزاهة والمطابقة، يوصى بزيادة قدرها..."
                    onChange={(e) => setNewRecData({ ...newRecData, recommendationTextAr: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs font-bold leading-normal select-none">
                  <button type="button" onClick={() => setIsRecModalOpen(false)} className="h-11 px-4 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-950 rounded-xl cursor-pointer font-bold transition-colors">إلغاء</button>
                  <button type="submit" className="h-11 px-6 bg-[#00796B] hover:bg-[#004D40] text-white border-none rounded-xl cursor-pointer font-black text-xs transition-colors">حفظ القرار بالدفاتر وتوزيع الإشراك</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EmployeePerformancePage;
