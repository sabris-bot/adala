import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Card from '../components/ui/Card';
import { 
    UsersIcon, CalculatorIcon, CalendarDaysIcon, UserCircleIcon, 
    CurrencyDollarIcon, ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, 
    GavelIcon, IdentificationIcon, DocumentTextIcon, ShieldCheckIcon, 
    BuildingOffice2Icon, ChartBarIcon, ArrowRightIcon, BellIcon,
    TableCellsIcon, DocumentDuplicateIcon, SparklesIcon, ChevronRightIcon,
    ArrowDownTrayIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon, ClockIcon,
    BriefcaseIcon, AcademicCapIcon, MapPinIcon, ShieldExclamationIcon,
    ArrowPathIcon, PlusIcon, PrinterIcon, CheckIcon, WrenchScrewdriverIcon,
    XMarkIcon, BanknotesIcon, PlusCircleIcon
} from '../constants';
import Button from '../components/ui/Button';
import PrintHeader from '../components/ui/PrintHeader';
import { useToast } from '../components/ui/Toast';
import { geminiService } from '../services/geminiService';
import { KuwaitLaborComplianceEngine, DisciplinaryPenaltyKuwait } from '../services/kuwaitLaborComplianceService';
import { initialEmployees } from './EmployeeProfilePage';
import { format } from 'date-fns';

// --- Types & Interfaces ---
interface FeatureCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.ReactNode;
  color?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, linkTo, icon, color = 'indigo' }) => (
  <Link to={linkTo} className="group block h-full">
    <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group-hover:-translate-y-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
      <div className="p-6 flex flex-col h-full">
        <div className={`mb-5 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 truncate tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 flex-grow line-clamp-2">
          {description}
        </p>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
            <span>استكشاف القسم</span>
            <ArrowRightIcon className="w-3.5 h-3.5 ms-1.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  </Link>
);

const EmployeeAffairsPage: React.FC = () => {
    const { addToast } = useToast();
    // --- State and Local Storage Integrations ---
    const [employees, setEmployees] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        return stored ? JSON.parse(stored) : initialEmployees;
    });

    const [leaveRequests, setLeaveRequests] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_leave_requests');
        if (stored) return JSON.parse(stored);
        return [
            { id: 'lr1', employeeName: 'أحمد محمود العبدالله', leaveType: 'سنوية', startDate: '2026-06-16', endDate: '2026-06-30', numberOfDays: 14, status: 'Approved', department: 'Senior Management' },
            { id: 'lr2', employeeName: 'مريم ناصر الصقر', leaveType: 'مرضية', startDate: '2026-05-20', endDate: '2026-05-22', numberOfDays: 3, status: 'Pending', department: 'Consultation' },
            { id: 'lr3', employeeName: 'فهد محمد الشمري', leaveType: 'طارئة', startDate: '2026-05-24', endDate: '2026-05-25', numberOfDays: 2, status: 'Pending', department: 'Litigation' }
        ];
    });

    const [loans, setLoans] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_loans');
        return stored ? JSON.parse(stored) : [
            { id: 'loan1', employeeName: 'فهد محمد الشمري', amount: 1500, installment: 150, remaining: 1050, status: 'Active' },
            { id: 'loan2', employeeName: 'خالد جاسم محمد', amount: 800, installment: 80, remaining: 400, status: 'Active' }
        ];
    });

    const [disciplinaryLogs, setDisciplinaryLogs] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_disciplinary');
        return stored ? JSON.parse(stored) : [
            { id: 'disc1', employeeName: 'خالد جاسم محمد', type: 'تنبيه شفهي', date: '2026-04-12', reason: 'التأخر المتكرر عن الدوام دون عذر مقنع', authority: 'إدارة الموارد البشرية' },
            { id: 'disc2', employeeName: 'عبدالرحمن العتيبي', type: 'إنذار كتابي أول', date: '2026-05-02', reason: 'عدم تسليم تقرير متابعة الجلسات في الوقت المحدد', authority: 'مدير قسم التقاضي' }
        ];
    });

    const [timeline, setTimeline] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_timeline');
        return stored ? JSON.parse(stored) : [
            { id: 't1', date: '2026-05-20', employeeName: 'أحمد محمود العبدالله', action: 'اعتماد الخطة السنوية للإجازات لعام 2026', type: 'قرار إداري' },
            { id: 't2', date: '2026-05-18', employeeName: 'مريم ناصر الصقر', action: 'تجديد عقد العمل السنوي لمدة عامين إضافيين', type: 'عقد' },
            { id: 't3', date: '2026-05-15', employeeName: 'عبدالرحمن العتيبي', action: 'اجتياز فترة التجربة بنجاح وتثبيته في المسمى', type: 'ترقية' },
            { id: 't4', date: '2026-05-10', employeeName: 'فهد محمد الشمري', action: 'صرف قرض طارئ معتمد بقيمة 1500 د.ك', type: 'مالية' }
        ];
    });

    const [requests, setRequests] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_requests');
        if (stored) return JSON.parse(stored);
        return [
            { id: 'r1', employeeName: 'مريم ناصر الصقر', type: 'شهادة راتب', date: '2026-05-21', status: 'Pending', purpose: 'لتقديمها إلى بيت التمويل الكويتي' },
            { id: 'r2', employeeName: 'خالد جاسم محمد', type: 'شهادة خبرة', date: '2026-05-19', status: 'Completed', purpose: 'لأغراض إدارية شخصية' },
            { id: 'r3', employeeName: 'فهد محمد الشمري', type: 'تسييل إجازات سنوية', date: '2026-05-18', status: 'Completed', detail: 'تسييل 10 أيام رصيد متراكم' }
        ];
    });

    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'submodules' | 'alerts' | 'requests' | 'timeline' | 'official_docs' | 'ai' | 'compliance_audit'>('dashboard');

    // --- Official Doc Generator Selection State ---
    const [docType, setDocType] = useState<'salary' | 'experience' | 'warning' | 'social_pifss' | 'settlement'>('salary');
    const [docEmployeeId, setDocEmployeeId] = useState<string>(employees[0]?.id || '');
    const [docRefNo, setDocRefNo] = useState<string>(`HR-REF-${Math.floor(100000 + Math.random() * 900000)}`);
    const [docDate, setDocDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [docCustomNote, setDocCustomNote] = useState<string>('');
    const [docReason, setDocReason] = useState<string>('الغياب المتكرر والملحوظ والمستمر دون عذر مقبول');
    const [generatedDoc, setGeneratedDoc] = useState<any | null>(null);

    // Timeline custom log dialog state
    const [showLogModal, setShowLogModal] = useState(false);
    const [logEmpName, setLogEmpName] = useState('');
    const [logAction, setLogAction] = useState('');
    const [logType, setLogType] = useState('إداري');

    // Save modifications to localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('alwagayan_leave_requests', JSON.stringify(leaveRequests));
        localStorage.setItem('alwagayan_loans', JSON.stringify(loans));
        localStorage.setItem('alwagayan_disciplinary', JSON.stringify(disciplinaryLogs));
        localStorage.setItem('alwagayan_timeline', JSON.stringify(timeline));
        localStorage.setItem('alwagayan_requests', JSON.stringify(requests));
    };

    useEffect(() => {
        saveToLocalStorage();
    }, [leaveRequests, loans, disciplinaryLogs, timeline, requests]);

    const translate = (ar: string, en: string) => {
        return language === 'ar' ? ar : en;
    };

    // --- Kuwaiti Labor Law No.6/2010 Automated Compliance Audit States & Handlers ---
    const [complianceIsScanning, setComplianceIsScanning] = useState(false);

    // Dynamic state modifiers to simulate compliance violations for interactive demonstration!
    // This allows users to experience the "Auto-Correct" feature in a fully functioning sandbox.
    const auditedEmployeesList = useMemo(() => {
        return employees.map((emp, index) => {
            // Induce a probation days excess on Employee 0 (if not already modified)
            if (index === 0 && emp.probationDays === undefined) {
                return { ...emp, probationDays: 120 }; // Article 24 Violation (> 100 days probation)
            }
            // Induce an annual leave under-entitlement on Employee 1 
            if (index === 1 && (emp.annualLeaveBalance === undefined || emp.annualLeaveBalance >= 30)) {
                return { ...emp, annualLeaveBalance: 20 }; // Article 70 Violation (< 30 days leave entitlement)
            }
            return emp;
        });
    }, [employees]);

    const auditedLoansList = useMemo(() => {
        return loans.map((loan, index) => {
            // Induce a 10% basic salary loan deduction limit violation on first loan
            if (index === 0 && loan.installment === 150) {
                return { ...loan, installment: 280, monthlyInstallment: 280 }; // Exceeds 10% basic salary limit!
            }
            return loan;
        });
    }, [loans]);

    const auditedLeavesList = useMemo(() => {
        return leaveRequests.map((req, index) => {
            // Ensure first leave request of first employee violates the "after 9 months" requirement
            if (index === 0 && req.leaveType === 'سنوية') {
                return { ...req, startDate: '2026-06-01' }; 
            }
            return req;
        });
    }, [leaveRequests]);

    // Compute active compliance warnings on-the-fly
    const complianceReportIssues = useMemo(() => {
        // Run personnel checks
        const personnelIssues = KuwaitLaborComplianceEngine.auditEmployeePersonnel(
            auditedEmployeesList,
            auditedLeavesList,
            auditedLoansList
        );

        // Standard investigations to audit
        const mockInvs = [
            {
                id: 'inv-100',
                investigationNumber: 'INV-2026-044',
                subject: 'غرامة إدارية والتحقيق في شكوى تسريب وأسرار العمل العقدية',
                status: 'CLOSED',
                employeeName: 'فاطمة علي حسين السيد',
                sessions: [
                    { id: 's-1', sessionDate: '2024-08-11', partyName: 'فاطمة السيد', partySignature: '' } // Missing signature!
                ]
            },
            {
                id: 'inv-101',
                investigationNumber: 'INV-2026-045',
                subject: 'تحقيق عاجل في تكرار الغياب عن طابور الصباح والمرافعة',
                status: 'CLOSED',
                employeeName: 'أحمد محمود مبارك',
                sessions: [] // Closed with no inquiry sessions - Critical!
            }
        ];

        const mockActs = [
            {
                id: 'da1001',
                employeeId: 'K-20921',
                employeeName: 'أحمد محمود مبارك',
                violationDate: '2026-05-10',
                actionEffectiveDate: '2026-05-29', // Delay > 15 days from proven violation
                actionTaken: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_3,
                linkedInvestigationId: 'INV-2026-045'
            },
            {
                id: 'da1002',
                employeeId: 'K-20921',
                employeeName: 'فاطمة علي حسين السيد',
                violationDate: '2026-05-15',
                actionEffectiveDate: '2026-05-16',
                actionTaken: 'خصم من الراتب يعادل 7 أيام' // Exceeds 5 days ceiling!
            }
        ];

        const invIssues = KuwaitLaborComplianceEngine.auditInvestigations(mockInvs as any);
        const actIssues = KuwaitLaborComplianceEngine.auditDisciplinaryActions(mockActs as any, mockInvs as any);

        return [...personnelIssues, ...invIssues, ...actIssues];
    }, [auditedEmployeesList, auditedLoansList, auditedLeavesList]);

    // Handler to execute automatic, 100% legal compliance corrections in active state
    const handleApplyAutoFix = (technicalRuleId: string, recordId: string) => {
        setComplianceIsScanning(true);
        setTimeout(() => {
            setComplianceIsScanning(false);
            if (technicalRuleId === 'RULE_PROBATION_100_DAYS') {
                const updated = employees.map((emp, idx) => {
                    if (idx === 0 || emp.id === recordId) {
                        return { ...emp, probationDays: 100 };
                    }
                    return emp;
                });
                setEmployees(updated);
                localStorage.setItem('alwagayan_employees', JSON.stringify(updated));
                addToast({
                    type: 'success',
                    title: 'تم تصحيح المادة 24 تلقائياً',
                    message: 'تم حصر فترة التجربة بـ 100 يوم عمل في سجل الموظف ليتوافق مع اللائحة الكويتية.'
                });
            } else if (technicalRuleId === 'RULE_LOAN_DEDUCTION_10_PERCENT') {
                const updated = loans.map((loan, idx) => {
                    if (idx === 0 || loan.employeeId === recordId || loan.id === recordId) {
                        return { ...loan, installment: 120, monthlyInstallment: 120 }; // Safe 10% maximum
                    }
                    return loan;
                });
                setLoans(updated);
                localStorage.setItem('alwagayan_loans', JSON.stringify(updated));
                addToast({
                    type: 'success',
                    title: 'تم تصحيح المادة 39 تلقائياً',
                    message: 'تم ضبط القسط الشهري ليكون ممتثلاً (10% كحد أقصى من الأجر الأساسي المعتمد).'
                });
            } else if (technicalRuleId === 'RULE_ANNUAL_LEAVE_30_DAYS') {
                const updated = employees.map((emp, idx) => {
                    if (idx === 1 || emp.id === recordId) {
                        return { ...emp, annualLeaveBalance: 30, yearlyLeaveDaysSet: 30 };
                    }
                    return emp;
                });
                setEmployees(updated);
                localStorage.setItem('alwagayan_employees', JSON.stringify(updated));
                addToast({
                    type: 'success',
                    title: 'تم تصحيح المادة 70 تلقائياً',
                    message: 'تم ترقية الرصيد السنوي للإجازات إلى 30 يوماً كاملة لتفادي المخالفة الإدارية.'
                });
            } else if (technicalRuleId === 'RULE_LEAVE_BEFORE_9_MONTHS') {
                const updated = leaveRequests.map((req, idx) => {
                    if (idx === 0 || req.id === recordId) {
                        return { ...req, leaveType: 'طارئة' };
                    }
                    return req;
                });
                setLeaveRequests(updated);
                localStorage.setItem('alwagayan_leave_requests', JSON.stringify(updated));
                addToast({
                    type: 'success',
                    title: 'تم إعادة تصنيف الإجازة تلقائياً',
                    message: 'تم حماية العطاء العمالي وتصنيف الإجازة كـ (إجازة طارئة) امتثالاً للمادة 70.'
                });
            } else {
                addToast({
                    type: 'info',
                    title: 'إيقاف وتعويض تأديبي ممتثل',
                    message: 'تم تدوين الإرشاد الإجرائي وحفظ سجل براءة ذمة بالتعديل لملف شؤون الموظفين.'
                });
            }
        }, 800);
    };

    // Live Compliance Sandbox State
    const [sandboxSalary, setSandboxSalary] = useState(1200);
    const [sandboxInstallment, setSandboxInstallment] = useState(200);
    const [sandboxProbationDays, setSandboxProbationDays] = useState(120);

    const sandboxFeedback = useMemo(() => {
        const issues: string[] = [];
        const maxInstallment = sandboxSalary * 0.10;
        if (sandboxInstallment > maxInstallment) {
            issues.push(`⚠️ مخالفة للمادة 39: القسط المقترح يمثل ${(sandboxInstallment / sandboxSalary * 100).toFixed(0)}% من الراتب الأساسي. الحد الأقصى المسموح هو 10% من الأجر الأساسي (${maxInstallment.toFixed(0)} د.ك).`);
        }
        if (sandboxProbationDays > 100) {
            issues.push(`⚠️ مخالفة للمادة 24: فترة التجربة المقترحة (${sandboxProbationDays} أيام) تتجاوز الحد الدستوري الصارم البالغ 100 يوم عمل كحد أقصى.`);
        }
        return issues;
    }, [sandboxSalary, sandboxInstallment, sandboxProbationDays]);

    // AI legal drafting state
    const [aiDraftPrompt, setAiDraftPrompt] = useState('صياغة مادة في عقد عمل لتعيين مستشار قانوني كويتي مع بيان فترة التجربة بـ 100 يوم عمل وحصة التأمينات الاجتماعية تبعا للقانون');
    const [aiDraftedText, setAiDraftedText] = useState('');
    const [aiDraftLoading, setAiDraftLoading] = useState(false);

    const handleGenerateLegalDraftWithAI = async () => {
        if (!aiDraftPrompt.trim()) return;
        setAiDraftLoading(true);
        try {
            const prompt = `أنت مستشار قانوني كويتي وخبير موارد بشرية بمكتب المحاماة الوجيان والروضان الرائد. بناءً على قانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010 والقرارات الوزارية المكملة له، قم بصياغة مستند رسمي فخم وبليغ باللغة العربية مطابق لطلب المستخدم:
"${aiDraftPrompt}"
يجب أن تتسم الصياغة بالدقة القانونية الكويتية المتناهية، وتذكر المواد القانونية مثل المادة 24 أو 35 أو 39 أو 44 أو 51 أو 70 بوضوح كامل، مع استخدام مصطلحات رسمية ومسميات حكومية معتمدة بدولة الكويت. صغ المسودة فوراً دون مقدمات أو جمل تفاعلية.`;
            const result = await geminiService.generateContent(prompt);
            setAiDraftedText(result || 'عذراً، تعذر توليد الصياغة القانونية حالياً. يرجى مراجعة الاتصال بالخادم.');
        } catch (error) {
            console.error('AI Draft failed:', error);
            setAiDraftedText('فشل التوليد، يرجى تزويد النظام بمفتاح ذكي صالح للذكاء الاصطناعي بدفق هادئ.');
        } finally {
            setAiDraftLoading(false);
        }
    };

    // --- Stats & Calculations based on local state ---
    const statsSummary = useMemo(() => {
        const total = employees.length;
        const active = employees.filter(e => e.status === 'Active' || e.status === 'Probation').length;
        const onLeave = employees.filter(e => e.status === 'OnLeave').length;
        const suspended = employees.filter(e => e.status === 'Suspended').length;
        const netSalaryTotal = employees.reduce((acc, curr) => {
            const allowancesVal = (curr.allowances || []).reduce((sum: number, a: any) => sum + a.value, 0);
            return acc + curr.basicSalary + allowancesVal;
        }, 0);

        // Expirations checks (within 60 days)
        const today = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(today.getDate() + 60);

        let expiringCivilIds = 0;
        let expiringPassports = 0;
        let expiringResidencies = 0;
        let expiringContracts = 0;

        employees.forEach(emp => {
            if (emp.civilIdExpiry) {
                const expiry = new Date(emp.civilIdExpiry);
                if (expiry <= sixtyDaysFromNow && expiry >= today) expiringCivilIds++;
            }
            if (emp.passportExpiry) {
                const expiry = new Date(emp.passportExpiry);
                if (expiry <= sixtyDaysFromNow && expiry >= today) expiringPassports++;
            }
            if (emp.residencyExpiry) {
                const expiry = new Date(emp.residencyExpiry);
                if (expiry <= sixtyDaysFromNow && expiry >= today) expiringResidencies++;
            }
            if (emp.contractEndDate) {
                const expiry = new Date(emp.contractEndDate);
                if (expiry <= sixtyDaysFromNow && expiry >= today) expiringContracts++;
            }
        });

        // Nationality breakdown
        let kuwaitiCount = 0;
        let expatCount = 0;
        employees.forEach(emp => {
            if (emp.nationality === 'كويتي' || emp.nationality === 'Kuwaiti') {
                kuwaitiCount++;
            } else {
                expatCount++;
            }
        });

        // Department count breakdown
        const departmentCounts: { [key: string]: number } = {};
        employees.forEach(emp => {
            const dept = emp.department || 'الشؤون الإدارية';
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });

        return {
            total,
            active,
            onLeave,
            suspended,
            netSalaryTotal,
            expiringCivilIds,
            expiringPassports,
            expiringResidencies,
            expiringContracts,
            kuwaitiCount,
            expatCount,
            departmentCounts
        };
    }, [employees]);

    // Kuwait PIFSS (Social Insurance) calculator for Kuwaiti staff
    const pifssCalculation = useMemo(() => {
        // According to Kuwaiti Social Insurance (PIFSS) Law:
        // Employee share is 8.5% of basic salary + subject allowances up to a cap of 3000 KWD
        // Employer share is 11.5% or 11% (standard in private sector is 11%)
        // Total contribution pool
        let totalKuwaitiSalaries = 0;
        let totalEmployeeShare = 0;
        let totalEmployerShare = 0;
        let activeKuwaitisCount = 0;

        employees.forEach(emp => {
            if (emp.nationality === 'كويتي' || emp.nationality === 'Kuwaiti') {
                activeKuwaitisCount++;
                const totalAllowancesSubject = (emp.allowances || [])
                    .filter((a: any) => a.subjectToIndemnity)
                    .reduce((sum: number, a: any) => sum + a.value, 0);
                
                let subjectSalary = emp.basicSalary + totalAllowancesSubject;
                if (subjectSalary > 3000) subjectSalary = 3000; // Cap limit is 3000 KWD

                totalKuwaitiSalaries += subjectSalary;
                totalEmployeeShare += parseFloat((subjectSalary * 0.085).toFixed(2));
                totalEmployerShare += parseFloat((subjectSalary * 0.11).toFixed(2));
            }
        });

        return {
            activeKuwaitisCount,
            totalKuwaitiSalaries,
            totalEmployeeShare,
            totalEmployerShare,
            totalPoolShare: totalEmployeeShare + totalEmployerShare
        };
    }, [employees]);

    // AI Assistant state & logic
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
        { role: 'model', content: 'مرحباً بك في مركز استشارات الموارد البشرية الذكي. يمكنني مساعدتك في صياغة لوائح العمل، أو تقديم استشارات تفصيلية حول قانون العمل الكويتي (القطاع الأهلي رقم 6/2010)، أو حساب مكافأة نهاية الخدمة، أو مراجعة اشتراكات المؤسسة العامة للتأمينات الاجتماعية. كيف يمكنني مساعدتك اليوم؟' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (activeTab === 'ai') scrollToBottom();
    }, [chatMessages, activeTab]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isAiLoading) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsAiLoading(true);

        try {
            const history = chatMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const contextPrompt = `
                أنت خبير قانوني ومستشار موارد بشرية مدمج في نظام الإدارة القانونية الكويتي "مكتب الوجيان والروضان للمحاماة والاستشارات القانونية".
                بيانات حالية للمكتب:
                - عدد الموظفين الكلي: ${statsSummary.total} موظفاً
                - الكويتيين (مشتركي التأمينات): ${pifssCalculation.activeKuwaitisCount} موظفين كويتيين
                - الموظفين الوافدين: ${statsSummary.expatCount} موظفاً وافداً
                - إجمالي الرواتب الشهرية والبدلات: ${statsSummary.netSalaryTotal} د.ك
                
                قدم استشارة قانونية مهنية وموثقة ترتكز على قانون العمل الكويتي رقم 6 لسنة 2010 والقرارات الوزارية المعدلة في دولة الكويت. صغ إجابتك بلغة قانونية رصينة ومحددة ومهنية مع ذكر أرقام المواد الدستورية والعمالية إن أمكن.
                
                طلب المستخدم: ${userMessage}
            `;

            const response = await geminiService.getChatbotResponse(contextPrompt, history);
            setChatMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'عذراً، واجه المساعد مشكلة في معالجة طلبك حالياً. يرجى مراجعة الاتصال والمحاولة مرة أخرى.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- Submodule feature cards lists ---
    const features: FeatureCardProps[] = [
        {
            title: 'ملفات الموظفين والكوادر',
            description: 'السجلات القانونية الكاملة، الأوراق الثبوتية، البيانات الاجتماعية والعملية والبنكية.',
            linkTo: '/employee-affairs/profiles',
            icon: <UserCircleIcon className="w-7 h-7" />,
            color: 'indigo'
        },
        {
            title: 'رواتب الموظفين والبدلات',
            description: 'مسير الرواتب الشهري الموحد، البدلات والخصومات ومطابقة شروط حماية الأجور WPS.',
            linkTo: '/employee-affairs/payroll',
            icon: <CurrencyDollarIcon className="w-7 h-7" />,
            color: 'emerald'
        },
        {
            title: 'سلف وقروض الموظفين',
            description: 'إدارة السلف والقروض الحسنة للموظفين واحتساب الأقساط الشهرية والتسويات القانونية.',
            linkTo: '/employee-affairs/loans',
            icon: <BanknotesIcon className="w-7 h-7" />,
            color: 'teal'
        },
        {
            title: 'نهاية الخدمة والمستحقات',
            description: 'تنفيذ احتساب مكافأة نهاية الخدمة الفورية بالتوافق الكامل مع المادة 51 من قانون العمل.',
            linkTo: '/employee-affairs/end-of-service',
            icon: <CalculatorIcon className="w-7 h-7" />,
            color: 'rose'
        },
        {
            title: 'الاستقطاب والتوظيف الجديد',
            description: 'إدارة فرص العمل الشاغرة، فرز المترشحين، ومطابقات المستندات مع الهيئة العامة للقوى العاملة.',
            linkTo: '/employee-affairs/recruitment',
            icon: <PlusCircleIcon className="w-7 h-7" />,
            color: 'cyan'
        },
        {
            title: 'عقود العمل الوطنية والوافدة',
            description: 'صياغة وتوثيق العقود المحددة وغير المحددة، ومراقبة فترات الاختبار والديباجات الثنائية.',
            linkTo: '/employee-affairs/contracts',
            icon: <DocumentTextIcon className="w-7 h-7" />,
            color: 'indigo'
        },
        {
            title: 'إدارة الإجازات والأرصدة',
            description: 'نظام رصد وحساب استهلاك الإجازات (السنوية، العائلية، الطارئة والمرضية المتدرجة).',
            linkTo: '/employee-affairs/leave-management',
            icon: <CalendarDaysIcon className="w-7 h-7" />,
            color: 'amber'
        },
        {
            title: 'الإجراءات التأديبية والإنذارات',
            description: 'تنفيذ القواعد الإدارية والجزاءات التراكمية المعتمدة وفقاً للائحة والمواد العمالية.',
            linkTo: '/employee-affairs/disciplinary',
            icon: <ExclamationTriangleIcon className="w-7 h-7" />,
            color: 'orange'
        },
        {
            title: 'لجان التحقيق الإداري',
            description: 'تحضير وإتمام التحقيقات الإدارية والعرائض القانونية بمحاضر اجتماعات متماسكة.',
            linkTo: '/employee-affairs/investigations',
            icon: <GavelIcon className="w-7 h-7" />,
            color: 'amber'
        },
        {
            title: 'تقييم الأداء والتقارير الشاملة',
            description: 'نظام رصد الكفاءات السنوي وربط مؤشرات العمل والتقديرات لغايات الترقيات والعلاوات.',
            linkTo: '/employee-affairs/performance',
            icon: <ChartBarIcon className="w-7 h-7" />,
            color: 'blue'
        },
        {
            title: 'إدارة طلبات الموظفين',
            description: 'قبول وتعديل واعتماد الطلبات الإدارية كطلب شهادات الرواتب وتسييل الإجازات المتراكمة.',
            linkTo: '/employee-affairs/requests',
            icon: <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />,
            color: 'indigo'
        }
    ];

    // Documents layout generation helper
    const handleGenerateDoc = () => {
        const selectedEmp = employees.find(e => e.id === docEmployeeId);
        if (!selectedEmp) return;

        let titleAr = '';
        let titleEn = '';
        const curDate = new Date();
        const refNo = docRefNo;
        const totalRawAllowances = (selectedEmp.allowances || []).reduce((acc: number, cur: any) => acc + cur.value, 0);
        const grossVal = selectedEmp.basicSalary + totalRawAllowances;

        // Custom QR code payload representation
        const qrPayload = `KWT-HR|OFFICE-ALWAGAYAN|REF:${refNo}|EMP:${selectedEmp.employeeId}|VAL:${grossVal}KWD`;

        if (docType === 'salary') {
            titleAr = 'شهادة تفصيل راتب ولمن يهمه الأمر';
            titleEn = 'Salary Details Certificate';
        } else if (docType === 'experience') {
            titleAr = 'شهادة خبرة وتقدير أداء متميز';
            titleEn = 'Certificate of Professional Experience';
        } else if (docType === 'warning') {
            titleAr = 'إنذار إداري كتابي رسمي أول ومقيد بالملف';
            titleEn = 'Official Written Administrative Warning';
        } else if (docType === 'social_pifss') {
            titleAr = 'شهادة اشتراك وتفصيل حصة التأمينات الاجتماعية (PIFSS)';
            titleEn = 'Kuwait Pension Social Insurance Statement';
        } else {
            titleAr = 'مخالصة نهائية تامة وإبراء ذمة مالية وقانونية عمالية';
            titleEn = 'Final Financial Discharge and Discharge Statement';
        }

        setGeneratedDoc({
            type: docType,
            titleAr,
            titleEn,
            refNo,
            date: docDate,
            employee: selectedEmp,
            qrPayload,
            customNote: docCustomNote,
            reason: docReason,
            gross: grossVal,
            subjectPIFSS: selectedEmp.nationality === 'كويتي' || selectedEmp.nationality === 'Kuwaiti' 
                ? selectedEmp.basicSalary + (selectedEmp.allowances || []).filter((a: any) => a.subjectToIndemnity).reduce((sum: number, a: any) => sum + a.value, 0)
                : 0
        });

        // Add action to timeline
        const actionType = docType === 'warning' ? 'إنذار' : 'وثيقة';
        const actionDesc = docType === 'warning' 
            ? `إصدار إنذار إدري رسمي رقم ${refNo} بسبب: ${docReason}`
            : `إصدار وثيقة وتوثيق "${titleAr}" برقم إشاري ${refNo}`;

        const newTimelineEvent = {
            id: Math.random().toString(),
            date: docDate,
            employeeName: selectedEmp.fullNameAr,
            action: actionDesc,
            type: actionType
        };
        setTimeline(prev => [newTimelineEvent, ...prev]);
    };

    // Add Timeline log helper
    const handleAddTimelineLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!logEmpName || !logAction) return;

        const newEvent = {
            id: Math.random().toString(),
            date: format(new Date(), 'yyyy-MM-dd'),
            employeeName: logEmpName,
            action: logAction,
            type: logType
        };

        setTimeline(prev => [newEvent, ...prev]);
        setLogEmpName('');
        setLogAction('');
        setShowLogModal(false);
    };

    const handlePrintDoc = () => {
        window.print();
    };

    return (
        <div className="space-y-8 pb-20 font-sans" dir="rtl">
            {/* Printable official document layout container. Built dynamically for premium print rendering! */}
            {generatedDoc && (
                <div className="hidden print-only-container print:block bg-white p-12 relative text-black" style={{ direction: 'rtl', fontFamily: 'Inter, Arial, sans-serif' }}>
                    {/* Official Head */}
                    <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="text-xl font-black text-slate-900 font-sans">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h1>
                            <p className="text-xs font-bold text-slate-500">منظومة الموارد البشرية والشؤون الإدارية المعتمدة</p>
                            <p className="text-[10px] text-slate-400">دولة الكويت - العاصمة - شارع فهد السالم / برج السحاب</p>
                        </div>
                        <div className="text-left space-y-1">
                            <p className="text-xs font-bold font-mono">الرقم الإشاري: <span className="font-extrabold">{generatedDoc.refNo}</span></p>
                            <p className="text-xs font-bold font-mono">التاريخ: <span className="font-extrabold">{generatedDoc.date}</span></p>
                            <p className="text-[9px] text-slate-400">حالة الاعتماد: قانوني نشط</p>
                        </div>
                    </div>

                    {/* Doc Title */}
                    <div className="text-center my-10 space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 underline underline-offset-8 decoration-slate-300">{generatedDoc.titleAr}</h2>
                        <p className="text-sm font-bold text-slate-500 italic uppercase font-mono">{generatedDoc.titleEn}</p>
                    </div>

                    {/* Doc Content Template */}
                    <div className="text-md leading-loose text-slate-800 space-y-6 text-justify">
                        {generatedDoc.type === 'salary' && (
                            <>
                                <p>تشهد إدارة الموارد البشرية بمكتب الوجيان والروضان للمحاماة والاستشارات القانونية، بأن الفاضل/تة <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong>، حامل البطاقة المدنية الكويتية رقم (<span className="font-mono font-bold">{generatedDoc.employee.civilId}</span>) يعمل لدينا في منصب <strong className="text-indigo-600">{generatedDoc.employee.jobTitle}</strong> بقسم ({generatedDoc.employee.department}) منذ تاريخ التحاقه بالعمل في <span className="font-mono font-bold">{generatedDoc.employee.joiningDate}</span>، وتحت عقد عمل ({generatedDoc.employee.contractType}) وهو على رأس عمله حتى تاريخه.</p>
                                <p>ونبين أدناه التفاصيل المالية والرواتب المخصصة له بموجب سجلاتنا الرسمية:</p>
                                <div className="my-8 border border-slate-300 rounded-2xl overflow-hidden shadow-inner max-w-xl mx-auto">
                                    <table className="w-full text-right" style={{ borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr className="bg-slate-100 border-b border-slate-300">
                                                <th className="p-4 font-black">البند المالي والراتب</th>
                                                <th className="p-4 font-black text-left">القيمة بالدينار الكويتي (KWD)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            <tr>
                                                <td className="p-4 font-medium">الراتب الأساسي المعتمد</td>
                                                <td className="p-4 text-left font-mono font-bold">{generatedDoc.employee.basicSalary.toLocaleString()} د.ك</td>
                                            </tr>
                                            {(generatedDoc.employee.allowances || []).map((a: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="p-4 font-medium">{a.name}</td>
                                                    <td className="p-4 text-left font-mono font-bold">{a.value.toLocaleString()} د.ك</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                                                <td className="p-4">إجمالي الراتب المستحق (الأجر الكامل)</td>
                                                <td className="p-4 text-left font-mono text-lg">{generatedDoc.gross.toLocaleString()} د.ك</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p>قد أعطيت هذه الشهادة للموظف المذكور بناءً على طلبه لتقديمها إلى <strong className="text-slate-900">{generatedDoc.customNote || "من يهمه الأمر / البنوك الكويتية المحترمة"}</strong> دون أدنى مسؤولية أو التزام مالي أو قانوني على عاتق هذا المكتب.</p>
                            </>
                        )}

                        {generatedDoc.type === 'experience' && (
                            <>
                                <p>تشهد الشؤون الإدارية وشؤون الموظفين، بأن السيد/ة <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong>، ذو الجنسية ({generatedDoc.employee.nationality}) كان يعمل لدينا في مكتب الاستشارات بمسمى <strong className="text-indigo-600">{generatedDoc.employee.jobTitle}</strong> بقسم المتابعة القضائية في الفترة من تاريخ تعيينه في <span className="font-mono font-bold">{generatedDoc.employee.joiningDate}</span> وحتى تاريخ إصدار هذه الشهادة.</p>
                                <p>وخلال فترة عمله وعطائه الممتدة بالمكتب، أظهر السيد المذكور كفاءة فنية متميزة في البحث القانوني وصياغة المذكرات وتجهيز الملفات، فضلاً عن الالتزام التام بالقوانين العمالية والسرية الكاملة وحسن السيرة والتعامل مع زملائه ورؤسائه بمهنية رفيعة تعكس هوية مكتبنا العريقة.</p>
                                <p>لقد أعطي له هذا المستند بناءً على رغبته في التعبير التاريخي عن مجهوده وعطائه، متمنين له دوام التوفيق والنجاح ومستقبلاً قانونياً باهراً.</p>
                            </>
                        )}

                        {generatedDoc.type === 'warning' && (
                            <>
                                <p className="text-rose-600 font-bold border-l-4 border-rose-500 pr-3">مستند تأديبي رسمي يخضع للمادة 101 من قانون العمل الكويتي رقم 6 لسنة 2010 واللائحة الداخلية المنظمة للعمل بالمكتب.</p>
                                <p>يوجه هذا الإنذار الرسمي المكتوب والموقع من رئيس القطاع الإداري إلى الموظف: <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> بمسمى <strong className="text-slate-900">{generatedDoc.employee.jobTitle}</strong>.</p>
                                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200 space-y-3 my-6">
                                    <h4 className="font-black text-slate-900 text-sm">تفاصيل الإخلال والسبب الموجه للاحتجاج:</h4>
                                    <p className="text-sm font-semibold text-rose-800 underline underline-offset-4 decoration-rose-300">{generatedDoc.reason || docReason}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">بموجب كشوف الحضور والانصراف، تبين تكرار المخالفة المذكورة مع الإجراء الإداري رقم ({generatedDoc.refNo}) في الفترة الأخيرة. يمثل هذا التكرار سلوكاً ضاراً بسير أعمال الموكلين والقضايا المنظورة من قبل المحاكم العمالية والتجارية.</p>
                                </div>
                                <p>بناءً عليه، ننذر الموظف بضرورة تدارك هذا الإجراء والامتثال الصارم لتعليمات وتوقيت الدوام واللوائح الداخلية فوراً. وفي حال عدم الاستجابة أو تكرار المخالفة، فسنضطر إلى توجيه العقوبات المنصوص عليها في قانون السلوك والمهنة، ومنها خصم الراتب أو الفصل دون تعويض بموجب المادة 41 من قانون العمل الكويتي.</p>
                            </>
                        )}

                        {generatedDoc.type === 'social_pifss' && (
                            <>
                                <p>تفيد المؤسسة المعتمدة للشؤون الإدارية والتأمينية بمكتبنا، بأن الموظف الكويتي الجنسية السيد/ <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> مسجل لدينا رسمياً في السجل الوطني لاشتراكات المؤسسة العامة للتأمينات الاجتماعية بدولة الكويت (PIFSS) تحت رقم الاشتراك المرجعي الموثق (<span className="font-mono font-bold font-extrabold">{generatedDoc.employee.socialSecurityNumber || "KT-76543-98"}</span>).</p>
                                <p>ونقدم تالياً ملخصاً شهرياً لحساب الاشتراك والخصم التأميني الذي يقوم المكتب بسداده وتوريده آلياً لصندوق التأمينات الوطني الكويتي:</p>
                                <div className="my-8 border border-slate-300 rounded-2xl overflow-hidden max-w-xl mx-auto">
                                    <div className="bg-slate-50 p-4 border-b border-slate-300 flex justify-between">
                                        <span className="font-black text-sm">صافي الأجر الخاضع للتأمين (Cap: 3000 KWD)</span>
                                        <span className="font-mono font-bold text-slate-900">{(generatedDoc.subjectPIFSS).toLocaleString()} د.ك</span>
                                    </div>
                                    <div className="divide-y divide-slate-200">
                                        <div className="p-4 flex justify-between text-sm">
                                            <span>حصة الموظف الشهرية المخصومة (8.5%)</span>
                                            <span className="font-mono font-bold">{(generatedDoc.subjectPIFSS * 0.085).toFixed(2)} د.ك</span>
                                        </div>
                                        <div className="p-4 flex justify-between text-sm">
                                            <span>حصة صاحب العمل الشهرية المسددة من المكتب (11.0%)</span>
                                            <span className="font-mono font-bold">{(generatedDoc.subjectPIFSS * 0.11).toFixed(2)} د.ك</span>
                                        </div>
                                        <div className="p-4 flex justify-between text-sm bg-indigo-50/50 font-black text-indigo-900">
                                            <span>إجمالي اشتراك الخصم الشهري المسدد لصندوق التأمينات (19.5%)</span>
                                            <span className="font-mono font-extrabold text-indigo-600">{(generatedDoc.subjectPIFSS * 0.195).toFixed(2)} د.ك</span>
                                        </div>
                                    </div>
                                </div>
                                <p>تم تسليم العقد والتأكيد على سداد الحصص القانونية والاشتراكات لتقديمها للمستشارين القانونيين أو المؤسسة العامة للتأمينات الكائنة بمدينة الكويت كدليل على الامتثال.</p>
                            </>
                        )}

                        {generatedDoc.type === 'settlement' && (
                            <>
                                <p>بموجب هذا الإقرار والموجب القانوني للمصادقة المبرمة، يقر مكتب الوجيان والروضان للمحاماة، بأن السيد/ة <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> بانتهاء علاقته التعاقدية في المكتب بتاريخ <span className="font-mono font-bold">{generatedDoc.employee.joiningDate}</span>، قد تسلم كافة مستحقاته المالية والعمالية المعتمدة.</p>
                                <p>وتشمل هذه المستحقات راتبه المتأخر والبدلات السكنية ومقابل رصيد إجازاته المستحقة بالإضافة إلى كامل مكافأة نهاية الخدمة (Indemnity Calculation) القانونية وذلك بالتوافق التام مع المواد المنصوص عليها في قانون العمل الكويتي.</p>
                                <p>وبناءً عليه، يقر عهد الموارد البشرية بإبراء ذمة الطرفين إبراءً عمالياً نهائياً ومانعاً لأي مطالبة مستقبلية أو ملاحقة قضائية من أي نوع وقانون، مع التأكيد على تحصيل جميع الأصول والعهد والمستندات القضائية وأكواد المستندات الموحدة من الموظف.</p>
                            </>
                        )}
                    </div>

                    {/* Footer, Stamp and Signatures for authentic look */}
                    <div className="mt-20 grid grid-cols-2 gap-12 pt-10 border-t border-slate-200 text-center">
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-500">معد التقرير والمصادق الإداري</p>
                            <p className="font-black text-sm text-slate-800">إدارة شؤون الموظفين والمستندات</p>
                            <div className="h-16 flex items-center justify-center">
                                <span className="text-[10px] text-slate-400 italic">(توقيع إلكتروني آمن)</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative">
                            <p className="text-xs font-bold text-slate-500">المدير العام والترخيص القانوني</p>
                            <p className="font-black text-sm text-slate-800">الأستاذ المستشار صبري شطا</p>
                            <div className="h-16 flex items-center justify-center relative">
                                {/* Digital Stamp Rendering */}
                                <div className="absolute border-4 border-dashed border-red-500/30 rounded-full w-24 h-24 flex items-center justify-center text-center opacity-70 rotate-12 -top-10 mx-auto left-0 right-0">
                                    <span className="text-[9px] font-black text-red-500/60 leading-tight">الوجيان والروضان<br/>محامون ومستشارون<br/>الكويت</span>
                                </div>
                                <span className="text-[10px] text-slate-400 italic">(الختم الرسمي للمكتب)</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code integration in document margin */}
                    <div className="mt-16 pt-6 border-t border-dashed border-slate-200 flex justify-between items-center text-slate-400 text-xs">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 w-12 h-12 flex flex-wrap gap-0.5 justify-center items-center">
                                {/* Simulated QR pixels for ultra realistic design element! */}
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-transparent"></div>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-transparent"></div>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500">رمز التحقق الفوري (QR Code)</p>
                                <p className="text-[8px] text-slate-400 font-mono select-all uppercase">{generatedDoc.qrPayload}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-400">نظام إدارة المحاماة المتكامل والشؤون الإدارية (v3.0) • صفحة 1 من 1</p>
                    </div>
                </div>
            )}

            {/* Print Header */}
            <PrintHeader title="تقرير إدارة الموارد البشرية وشؤون الموظفين" />

            {/* Premium Header Container (Hidden during print) */}
            <div className="max-w-7xl mx-auto no-print">
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="text-indigo-650 font-black uppercase tracking-[0.1em] text-[10px] block">Human Resources Platform</span>
                                    <span className="text-slate-400 text-[10px] font-medium block">Kuwait Labor Law Compliant (6/2010)</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                                شؤون الموظفين <span className="text-indigo-650">والموارد البشرية</span>
                            </h1>
                            <p className="text-slate-500 text-sm max-w-2xl font-medium leading-relaxed">
                                نظام إدارة وتتبع الكوادر البشرية والإدارية والمالية مع تفعيل التأمينات الاجتماعية الوطنية (PIFSS)، مكافآت نهاية الخدمة العمالية، تتبع الإجازات ومستجدات الدوام.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                            {/* Language Button Toggle */}
                            <button 
                                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                                className="h-12 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-black text-xs flex items-center justify-center gap-2 shrink-0 bg-white"
                            >
                                <GlobeAltIcon className="w-4 h-4 text-emerald-500" />
                                <span>{translate('English EN', 'العربية AR')}</span>
                            </button>

                            <div className="flex bg-slate-100 p-1.5 rounded-xl">
                                <button 
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`py-2 px-4 rounded-lg transition-all font-black text-xs ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm font-sans' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {translate('الرئيسية', 'Dashboard')}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('submodules')}
                                    className={`py-2 px-4 rounded-lg transition-all font-black text-xs ${activeTab === 'submodules' ? 'bg-white text-indigo-600 shadow-sm font-sans' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {translate('الأقسام', 'Submodules')}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('alerts')}
                                    className={`py-2 px-3 rounded-lg transition-all font-black text-xs flex items-center gap-1.5 ${activeTab === 'alerts' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {translate('التنبيهات', 'Alerts')}
                                    {statsSummary.expiringCivilIds + statsSummary.expiringResidencies > 0 && (
                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('official_docs')}
                                    className={`py-2 px-3 rounded-lg transition-all font-black text-xs ${activeTab === 'official_docs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {translate('إصدار وثيقة', 'Documents')}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('compliance_audit')}
                                    className={`py-2 px-3 rounded-lg transition-all font-black text-xs flex items-center gap-1 ${activeTab === 'compliance_audit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                    {translate('تدقيق الامتثال ⚖️', 'Law Audit')}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('ai')}
                                    className={`py-2 px-3 rounded-lg transition-all font-black text-xs flex items-center gap-1.5 ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-505" />
                                    {translate('المستشار', 'AI')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs Interaction Container (Hidden on Print) */}
            <div className="max-w-7xl mx-auto no-print">
                <AnimatePresence mode="wait">
                    {/* 1. Executive HR Dashboard */}
                    {activeTab === 'dashboard' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="dashboard"
                            className="space-y-8"
                        >
                            {/* Summary Statistic Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatPanel 
                                    title={translate('إجمالي الموظفين', 'Total Employees')} 
                                    value={statsSummary.total} 
                                    unit={translate('موظف', 'Staff')} 
                                    icon={<UsersIcon className="w-6 h-6 text-indigo-600"/>} 
                                    color="indigo"
                                    meta={`نشط: ${statsSummary.active} | إجازة: ${statsSummary.onLeave}`}
                                />
                                <StatPanel 
                                    title={translate('الرواتب والبدلات الشهري', 'Total Monthly Payroll')} 
                                    value={statsSummary.netSalaryTotal.toLocaleString()} 
                                    unit="د.ك" 
                                    icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-600"/>} 
                                    color="emerald"
                                    meta={translate('متوسط الراتب: 1,930 د.ك', 'Avg Salary: 1,930 KWD')}
                                />
                                <StatPanel 
                                    title={translate('اشتراكات التأمينات الكويتيين', 'KUWAITI PIFSS Contributions')} 
                                    value={pifssCalculation.totalPoolShare.toFixed(0)} 
                                    unit="د.ك" 
                                    icon={<BuildingOffice2Icon className="w-6 h-6 text-amber-600"/>} 
                                    color="amber"
                                    meta={`${translate('منتسب كويتي:', 'Kuwaiti staff:')} ${pifssCalculation.activeKuwaitisCount}`}
                                />
                                <StatPanel 
                                    title={translate('تنبيهات قانونية ووثائق', 'Legal Expiry Alerts')} 
                                    value={statsSummary.expiringCivilIds + statsSummary.expiringResidencies} 
                                    unit={translate('وثيقة', 'Docs')} 
                                    icon={<ExclamationTriangleIcon className="w-6 h-6 text-rose-650"/>} 
                                    color="rose"
                                    meta={translate('تستدعي المتابعة الفورية', 'Requires urgent action')}
                                />
                            </div>

                            {/* Section 2: Distribution Analytics & Quick Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Technical/Aesthetic Data Visualisation: Staff Distribution */}
                                <Card className="lg:col-span-8 p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">{translate('الهيكل الوطني وتوزيع القوة العاملة', 'Labor Demographics & Departments')}</h3>
                                            <p className="text-xs text-slate-400 font-medium">{translate('تتبع نسبة التكويت ونشاط المجموعات في مكتب الوجيان', 'Monitoring Kuwaitisation and staff layout')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">{translate('التوطين (التكويت): ', 'Kuwaitisation: ')}{((statsSummary.kuwaitiCount / statsSummary.total) * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                        {/* Left Side: Demographic Bar */}
                                        <div className="md:col-span-2 space-y-5 p-4 bg-slate-50 rounded-3xl border border-slate-150">
                                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">{translate('تصنيف الجنسية والأمان', 'Nationality Categories')}</h4>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                                    <span>{translate('الكوادر الكويتية (التأمينات)', 'Kuwaiti Staff (PIFSS)')}</span>
                                                    <span>{statsSummary.kuwaitiCount} / {statsSummary.total}</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                                                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(statsSummary.kuwaitiCount / statsSummary.total) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 block leading-tight">{translate('خاضع لصندوق زيادة المعاشات والورثة (م.ع.ت.أ)', 'Subject to Social Pension Schemes')}</span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                                    <span>{translate('الكوادر الوافدة (مكافأة)', 'Expatriate Staff (Indemnity)')}</span>
                                                    <span>{statsSummary.expatCount} / {statsSummary.total}</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(statsSummary.expatCount / statsSummary.total) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 block leading-tight">{translate('خاضع لحساب مكافأة نهاية الخدمة (المادة 51)', 'Subject to final end-of-service indemnity')}</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Department Staff distributions */}
                                        <div className="md:col-span-3 space-y-4">
                                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">{translate('شغل الأقسام الرئيسية في المنشأة', 'Department Distribution')}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Object.entries(statsSummary.departmentCounts).map(([dept, count]) => {
                                                    const deptLabel = dept === 'Senior Management' ? translate('الإدارة العليا', 'Senior Org') :
                                                                      dept === 'Consultation' ? translate('الاستشارات والعقود', 'Consults') :
                                                                      dept === 'Litigation' ? translate('قسم التقاضي', 'Litigations') : 
                                                                      dept === 'HR' ? translate('الموارد البشرية', 'HR') :
                                                                      dept === 'Finance' ? translate('الحسابات والمالية', 'Finances') : dept;
                                                    return (
                                                        <div key={dept} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-indigo-550"></div>
                                                                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{deptLabel}</span>
                                                            </div>
                                                            <span className="font-mono text-xs font-black bg-slate-50 text-slate-600 rounded-lg px-2 py-1">{count} {translate('موظف', 'staff')}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Footnotes */}
                                    <div className="mt-6 pt-5 border-t border-slate-100 text-slate-400 text-xs flex justify-between items-center">
                                        <span>* {translate('البيانات مرتبطة بالكامل ومتزامنة مع سجل ملفات الموظفين النشطة.', 'All data is live synced with active staff profile records.')}</span>
                                        <button onClick={() => setActiveTab('submodules')} className="text-indigo-650 font-black hover:underline">{translate('عرض تفصيلي للرواتب والبدلات ←', 'Payroll settings & allowances Details ←')}</button>
                                    </div>
                                </Card>

                                {/* Quick HR Actions Panel with print tools */}
                                <Card className="lg:col-span-4 p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">{translate('التحكم السريع والقرارات', 'Operational Panel')}</h3>
                                        <p className="text-xs text-slate-400 mb-6">{translate('خطوات سريعة لإصدار القرارات وتسجيلTimeline', 'Initiate actions & timeline events on the fly')}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => { setDocType('salary'); setActiveTab('official_docs'); }}
                                            className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-150 hover:border-indigo-300 transition-all text-right flex items-center justify-between text-slate-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                                                <span className="text-xs font-black">{translate('توليد شهادة راتب موثقة', 'Issue Salary Certificate')}</span>
                                            </div>
                                            <ArrowRightIcon className="w-4 h-4 text-slate-400 rotate-180" />
                                        </button>

                                        <button 
                                            onClick={() => { setDocType('warning'); setActiveTab('official_docs'); }}
                                            className="w-full p-3.5 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-150 hover:border-rose-350 transition-all text-right flex items-center justify-between text-slate-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />
                                                <span className="text-xs font-black">{translate('صياغة إنذار رسمي كتابي', 'Issue Disciplinary Warning')}</span>
                                            </div>
                                            <ArrowRightIcon className="w-4 h-4 text-slate-400 rotate-180" />
                                        </button>

                                        <button 
                                            onClick={() => setShowLogModal(true)}
                                            className="w-full p-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white font-black text-xs shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 h-12"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            <span>{translate('إضافة ترقية / قرار للتاريخ', 'Log Custom Timeline Promotion')}</span>
                                        </button>
                                        
                                        <Link 
                                            to="/employee-affairs/profiles"
                                            className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs text-center flex items-center justify-center h-12 transition-colors mt-2"
                                        >
                                            {translate('إدارة السجلات ومرقاة الملفات ←', 'Go to Staff Profiles Center ←')}
                                        </Link>
                                    </div>

                                    <div className="mt-5 text-center">
                                        <p className="text-[10px] text-slate-300 uppercase tracking-widest leading-relaxed">الوجيان والروضان محامون ومستشارون</p>
                                    </div>
                                </Card>
                            </div>

                            {/* Section 3: Interactive Requests overview & Recent activity logs */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Recent Requests to accept/deny in place */}
                                <div className="lg:col-span-7">
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm h-full">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">{translate('معالجة الطلبات الإدارية المعلقة', 'Pending Staff Requests')}</h3>
                                                <p className="text-xs text-slate-400">{translate('مراجعة الطلبات العاجلة المقدمة من الموظفين للحصول على كشوف وتصديقات', 'View and authorize certificates and loans')}</p>
                                            </div>
                                            <button onClick={() => setActiveTab('requests')} className="text-xs font-black text-indigo-600 hover:underline">{translate('إدارة الطلبات', 'Manage Requests')}</button>
                                        </div>

                                        <div className="space-y-3">
                                            {requests.slice(0, 3).map((req) => (
                                                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between hover:scale-[1.01] transition-transform">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-xs font-black text-slate-800">{req.employeeName}</span>
                                                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{req.type}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500">{req.purpose || req.detail}</p>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {req.status === 'Pending' ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => {
                                                                        const up = requests.map(r => r.id === req.id ? {...r, status: 'Completed'} : r);
                                                                        setRequests(up);
                                                                        // Log to timeline
                                                                        setTimeline(prev => [{
                                                                            id: Math.random().toString(),
                                                                            date: format(new Date(), 'yyyy-MM-dd'),
                                                                            employeeName: req.employeeName,
                                                                            action: `موافقة واعتماد الطلب الإداري: ${req.type}`,
                                                                            type: 'طلب'
                                                                        }, ...prev]);
                                                                    }}
                                                                    className="p-1.5 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 font-bold text-xs"
                                                                    title="قبول واعتماد"
                                                                >
                                                                    <CheckIcon className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const up = requests.map(r => r.id === req.id ? {...r, status: 'Rejected'} : r);
                                                                        setRequests(up);
                                                                    }}
                                                                    className="p-1.5 bg-rose-500 rounded-lg text-white hover:bg-rose-650 font-bold text-xs"
                                                                    title="رفض"
                                                                >
                                                                    <XMarkIcon className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                {req.status === 'Completed' ? translate('تم الاعتماد', 'Approved') : translate('مرفوض', 'Rejected')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {requests.length === 0 && (
                                                <p className="text-center py-8 text-xs text-slate-400">{translate('لا توجد طلبات معلقة حالياً', 'No requests pending.')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Timeline */}
                                <div className="lg:col-span-5">
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 mb-1">{translate('سجل الإجراءات والقرارات', 'HR Actions Timeline')}</h3>
                                            <p className="text-xs text-slate-400 mb-6">{translate('أحدث الترقيات، التعديلات المالية والإدارية المعتمدة والتاريخية', 'Live timeline of HR and legal actions')}</p>
                                        </div>

                                        <div className="space-y-4 flex-grow">
                                            {timeline.slice(0, 4).map((evt) => (
                                                <div key={evt.id} className="relative flex gap-3 pb-3 border-r-2 border-dashed border-slate-100 last:border-0 pr-4">
                                                    <div className="absolute top-1 right-[-6px] w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] text-slate-400 tabular-nums font-bold tracking-tight">{evt.date}</span>
                                                            <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full">{evt.type}</span>
                                                        </div>
                                                        <h4 className="text-xs font-black text-slate-850">{evt.employeeName}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5 leading-tight">{evt.action}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button onClick={() => setActiveTab('timeline')} className="w-full mt-4 text-center py-2 border-t border-slate-100 text-xs font-black text-indigo-600 hover:text-indigo-800">{translate('عرض سجل الأنشطة الكامل ←', 'View Full Timeline Logs ←')}</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. HR Submodules Directory Hub */}
                    {activeTab === 'submodules' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            key="submodules"
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                                    <h2 className="text-2xl font-black text-slate-900">{translate('منظومة الموارد البشرية وشؤون الموظفين المتطورة', 'Advanced HR & Personnel Management Submodules')}</h2>
                                </div>
                                <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest">{features.length} ACTIVE Submodules</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {features.map(f => (
                                    <FeatureCard key={f.title} {...f} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* 3. Alerts & Expirations Tracker with Warnings */}
                    {activeTab === 'alerts' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="alerts"
                            className="space-y-6"
                        >
                            <Card className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{translate('حالة صلاحية والتحقق من الوثائق الثبوتية والإقامة', 'Identification & Residency Validity Tracker')}</h3>
                                        <p className="text-sm text-slate-400">{translate('نظام المتابعة القانونية المبكر لتفادي مخالفات قانون الهجرة والعمل الكويتي (مهلة 60 يوماً)', 'Kuwait regulation monitor for passports, residencies, and civil IDs')}</p>
                                    </div>
                                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0">
                                        <BellIcon className="w-6 h-6 animate-swing" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {employees.map(emp => {
                                        const parts = [];
                                        const now = new Date();
                                        const limit = new Date();
                                        limit.setDate(now.getDate() + 60);

                                        if (emp.civilIdExpiry) {
                                            const exp = new Date(emp.civilIdExpiry);
                                            if (exp <= limit) parts.push({ label: translate('البطاقة المدنية', 'Civil ID'), date: emp.civilIdExpiry, style: exp <= now ? 'critical' : 'warning' });
                                        }
                                        if (emp.passportExpiry) {
                                            const exp = new Date(emp.passportExpiry);
                                            if (exp <= limit) parts.push({ label: translate('جواز السفر', 'Passport'), date: emp.passportExpiry, style: exp <= now ? 'critical' : 'warning' });
                                        }
                                        if (emp.residencyExpiry) {
                                            const exp = new Date(emp.residencyExpiry);
                                            if (exp <= limit) parts.push({ label: translate('تأشيرة الإقامة', 'Residency Visa'), date: emp.residencyExpiry, style: exp <= now ? 'critical' : 'warning' });
                                        }
                                        if (emp.contractEndDate) {
                                            const exp = new Date(emp.contractEndDate);
                                            if (exp <= limit) parts.push({ label: translate('عقد العمل', 'Employment Contract'), date: emp.contractEndDate, style: exp <= now ? 'critical' : 'warning' });
                                        }

                                        if (parts.length === 0) return null;

                                        return (
                                            <div key={emp.id} className="p-5 bg-slate-50 border border-slate-150 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} className="w-12 h-12 rounded-xl object-cover border" />
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-sm leading-tight">{emp.fullNameAr}</h4>
                                                        <p className="text-xs text-slate-400 mt-1">{emp.jobTitle} • {emp.department} • ({emp.nationality})</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 w-full md:w-auto flex-1 md:max-w-md">
                                                    {parts.map((p, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${p.style === 'critical' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                                                <span className="font-bold text-slate-600">{p.label}</span>
                                                            </div>
                                                            <div className="text-left">
                                                                <span className="font-mono font-black tabular-nums text-slate-700">{p.date}</span>
                                                                <span className={`ms-2 px-2 py-0.5 rounded-full text-[9px] font-black ${p.style === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {p.style === 'critical' ? translate('منتهي!', 'Expired!') : translate('قريب انتهاء', 'Expiring')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
                                                    <button 
                                                        onClick={() => {
                                                            // Log reminder to timeline
                                                            setTimeline(prev => [{
                                                                id: Math.random().toString(),
                                                                date: format(new Date(), 'yyyy-MM-dd'),
                                                                employeeName: emp.fullNameAr,
                                                                action: 'إرسال بريد إلكتروني تلقائي ونظام التنبيه لتجديد المستندات الرسمية الموشكة على الانتهاء',
                                                                type: 'تنبيه'
                                                            }, ...prev]);
                                                            alert(`تم إرسال تنبيه بالبريد الإلكتروني وتنبيهات الجوال للموظف ${emp.fullNameAr} لتحديث مستنداته العمالية.`);
                                                        }}
                                                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-xl border border-indigo-200 transition-colors"
                                                    >
                                                        {translate('إرسال تنبيه آلي', 'Trigger Alert')}
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            setDocEmployeeId(emp.id);
                                                            setDocType('warning');
                                                            setActiveTab('official_docs');
                                                        }}
                                                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl border border-rose-200 transition-colors"
                                                    >
                                                        {translate('توجيه إنذار', 'Warn Employee')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {employees.filter(emp => {
                                        const limit = new Date();
                                        limit.setDate(new Date().getDate() + 60);
                                        return (emp.civilIdExpiry && new Date(emp.civilIdExpiry) <= limit) || 
                                               (emp.passportExpiry && new Date(emp.passportExpiry) <= limit) || 
                                               (emp.residencyExpiry && new Date(emp.residencyExpiry) <= limit) || 
                                               (emp.contractEndDate && new Date(emp.contractEndDate) <= limit);
                                    }).length === 0 && (
                                        <div className="py-16 text-center text-slate-400 text-sm">
                                            {translate('الحمد لله، جميع مستندات وإقامات الموظفين صالحة لأكثر من 60 يوماً.', 'All staff documents and credentials are valid and secure.')}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* 4. Requests & Workflow Manager */}
                    {activeTab === 'requests' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="requests"
                            className="space-y-6"
                        >
                            <Card className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{translate('مركز الطلبات والعرائض الإدارية والورقية', 'Administrative Requests Dashboard')}</h3>
                                        <p className="text-sm text-slate-400">{translate('تتبع الطلبات الصادرة من الكوادر والبدء باعتماداتها وتوثيقها فوراً', 'Approve leaves, salary certifications, and final clearances')}</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const newReq = {
                                                id: 'req-' + Math.random().toString(36).substr(2, 5),
                                                employeeName: employees[Math.floor(Math.random() * employees.length)].fullNameAr,
                                                type: 'طلب مستندات',
                                                date: format(new Date(), 'yyyy-MM-dd'),
                                                status: 'Pending',
                                                purpose: 'تحديث بيانات إلكترونية وقانونية'
                                            };
                                            setRequests([newReq, ...requests]);
                                        }}
                                        className="h-10 px-4 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        <span>{translate('إضافة كطلب تجريبي معلق', 'Generate Demo Request')}</span>
                                    </button>
                                </div>

                                <div className="overflow-hidden rounded-3xl border border-slate-150">
                                    <table className="w-full text-right">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="p-4">{translate('اسم الموظف طالب العريضة', 'Employee Name')}</th>
                                                <th className="p-4">{translate('نوع المعاملة العمالية', 'Request Category')}</th>
                                                <th className="p-4">{translate('تاريخ التقديم المالي', 'Applied Date')}</th>
                                                <th className="p-4">{translate('البيان والوجهة', 'Purpose / Details')}</th>
                                                <th className="p-4">{translate('الحالة الحالية', 'Authorized Status')}</th>
                                                <th className="p-4 text-center">{translate('القرار والاعتماد', 'Action')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-150 text-xs">
                                            {requests.map(req => (
                                                <tr key={req.id} className="hover:bg-slate-50/50 transition-all font-medium">
                                                    <td className="p-4 font-black">{req.employeeName}</td>
                                                    <td className="p-4">
                                                        <span className="bg-slate-150 text-slate-650 px-2.5 py-1 rounded-full font-bold text-[10px]">{req.type}</span>
                                                    </td>
                                                    <td className="p-4 font-mono select-all tabular-nums">{req.date}</td>
                                                    <td className="p-4 text-slate-500 max-w-[200px] truncate">{req.purpose || req.detail || '-'}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide ${req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : req.status === 'Pending' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-rose-100 text-rose-700'}`}>
                                                            {req.status === 'Completed' ? translate('معتمد ومنجز', 'Approved') : req.status === 'Pending' ? translate('قيد المراجعة', 'Review pending') : translate('مرفوض إدارياً', 'Rejected')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 flex justify-center gap-1.5">
                                                        {req.status === 'Pending' ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => {
                                                                        const up = requests.map(r => r.id === req.id ? {...r, status: 'Completed'} : r);
                                                                        setRequests(up);
                                                                        setTimeline(prev => [{
                                                                            id: Math.random().toString(),
                                                                            date: format(new Date(), 'yyyy-MM-dd'),
                                                                            employeeName: req.employeeName,
                                                                            action: `موافقة واعتماد الطلب الإداري: ${req.type}`,
                                                                            type: 'طلب'
                                                                        }, ...prev]);
                                                                    }}
                                                                    className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-black text-[10px] flex items-center gap-1"
                                                                >
                                                                    <CheckIcon className="w-3.5 h-3.5" />
                                                                    <span>{translate('موافق', 'Approve')}</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const up = requests.map(r => r.id === req.id ? {...r, status: 'Rejected'} : r);
                                                                        setRequests(up);
                                                                    }}
                                                                    className="px-2.5 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-black text-[10px] flex items-center gap-1"
                                                                >
                                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                                    <span>{translate('رفض', 'Reject')}</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button 
                                                                onClick={() => {
                                                                    const up = requests.filter(r => r.id !== req.id);
                                                                    setRequests(up);
                                                                }}
                                                                className="px-2 py-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
                                                                title="مسح السجل"
                                                            >
                                                                {translate('حذف', 'Delete')}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* 5. Complete Activity Timeline */}
                    {activeTab === 'timeline' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            key="timeline"
                            className="space-y-6"
                        >
                            <Card className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{translate('السجل التاريخي الشامل ومسيرة التوظيف بالمكتب', 'Unified HR Activity and Promotion Timeline')}</h3>
                                        <p className="text-sm text-slate-400">{translate('أرشيف كامل يوضح تعديل الدرجات الوظيفية، الصرف المالي، الإنذارات والقبول القانوني', 'Comprehensive administrative log of all personnel events')}</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowLogModal(true)}
                                        className="h-10 px-4 bg-indigo-600 text-white hover:bg-indigo-700 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/15"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        <span>{translate('تدوين حدث وظيفي مخصص', 'Log Custom HR Event')}</span>
                                    </button>
                                </div>

                                <div className="relative pr-6 border-r-2 border-slate-200 py-4 space-y-8">
                                    {timeline.map((evt) => (
                                        <div key={evt.id} className="relative class-timeline-item">
                                            {/* Pulsing indicator anchor */}
                                            <span className="absolute right-[-29px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 flex items-center justify-center">
                                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                            </span>

                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 hover:bg-white hover:shadow-lg transition-all duration-300 max-w-4xl">
                                                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded-full">{evt.type}</span>
                                                        <h4 className="font-black text-slate-800 text-sm">{evt.employeeName}</h4>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-mono tracking-tighter block md:text-left">{evt.date}</span>
                                                </div>
                                                <p className="text-xs text-slate-650 leading-relaxed font-semibold">{evt.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* 6. Official Documents & HR Certificate Generator */}
                    {activeTab === 'official_docs' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="official_docs"
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Doc settings side panel */}
                                <Card className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-5 lg:col-span-1">
                                    <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">{translate('إعدادات الوثيقة الرسمية', 'Select Document Parameters')}</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 block">{translate('نوع المستند وتفصيلاته:', 'Document Type:')}</label>
                                        <select 
                                            value={docType}
                                            onChange={(e) => setDocType(e.target.value as any)}
                                            className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-xs"
                                        >
                                            <option value="salary">{translate('شهادة راتب ولمن يهمه الأمر', 'Certificate of Salary')}</option>
                                            <option value="experience">{translate('شهادة خبرة وتوصية مهنية', 'Certificate of Experience')}</option>
                                            <option value="warning">{translate('إنذار إداري كتابي رسمي أول', 'Written Warning Notice')}</option>
                                            <option value="social_pifss">{translate('شهادة اشتراك التأمينات (PIFSS)', 'Kuwaiti Social Insurance Statement')}</option>
                                            <option value="settlement">{translate('مخالصة نهائية وإبراء ذمة براءة ذمة', 'Final Clearance and Discharge')}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 block">{translate('الموظف المعني بالمعاملة:', 'Select Employee:')}</label>
                                        <select 
                                            value={docEmployeeId}
                                            onChange={(e) => setDocEmployeeId(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-xs"
                                        >
                                            {employees.map(e => (
                                                <option key={e.id} value={e.id}>{e.fullNameAr} ({e.nationality})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 block">{translate('الرقم الإشاري للمستند:', 'Reference Number:')}</label>
                                        <input 
                                            type="text" 
                                            value={docRefNo}
                                            onChange={(e) => setDocRefNo(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl font-mono font-bold text-xs"
                                        />
                                    </div>

                                    {docType === 'salary' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 block">{translate('الجهة الموجه إليها الشهادة:', 'To: (Recipient bank/ministry)')}</label>
                                            <input 
                                                type="text" 
                                                value={docCustomNote}
                                                placeholder={translate('بيت التمويل الكويتي / بنك الخليج', 'To Whom it May Concern')}
                                                onChange={(e) => setDocCustomNote(e.target.value)}
                                                className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-xs"
                                            />
                                        </div>
                                    )}

                                    {docType === 'warning' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 block">{translate('سبب الإجراء التأديبي والإنذار:', 'Reason for Warning Alert:')}</label>
                                            <textarea 
                                                rows={3}
                                                value={docReason}
                                                onChange={(e) => setDocReason(e.target.value)}
                                                className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-xs"
                                            />
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleGenerateDoc}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>{translate('توليد الوثيقة ومصادقتها المعتمدة', 'Generate & Authenticate')}</span>
                                    </button>
                                </Card>

                                {/* Doc preview card */}
                                <div className="lg:col-span-3 space-y-4">
                                    {generatedDoc ? (
                                        <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 bg-emerald-500 text-white px-5 py-2 rounded-bl-3xl font-black text-[10px] tracking-wider uppercase z-20">
                                                {translate('مستند معتمد وجاهز للطباعة', 'Authenticated Document Live Preview')}
                                            </div>

                                            {/* Action tools right above paper */}
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-8">
                                                <span className="text-xs text-slate-400 font-bold">{translate('مُلاحظة: المستند مطابق للمعايير الحكومية والوزارية بدولة الكويت.', 'Legal template loaded based on Kuwait regulations.')}</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={handlePrintDoc}
                                                        className="h-10 px-4 bg-emerald-555 hover:bg-emerald-600 text-slate-900 border border-emerald-520 font-black text-xs rounded-xl flex items-center gap-2 shadow-sm"
                                                    >
                                                        <PrinterIcon className="w-4 h-4 text-emerald-600" />
                                                        <span>{translate('بدء الطباعة الفورية / تصدير PDF', 'Print / PDF Export')}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Doc Visual Render in Screen View */}
                                            <div className="border border-slate-200 shadow-inner rounded-3xl p-8 bg-slate-50/50">
                                                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl mx-auto space-y-6 text-slate-800">
                                                    
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start border-b border-slate-205 pb-4">
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900 leading-tight">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h4>
                                                            <p className="text-[10px] text-slate-400 block mt-0.5">ترخيص مهني وعناية الموارد الإدارية</p>
                                                        </div>
                                                        <div className="text-left select-all text-[9px] font-mono font-bold space-y-0.5 text-slate-500">
                                                            <p>REF: {generatedDoc.refNo}</p>
                                                            <p>DATE: {generatedDoc.date}</p>
                                                        </div>
                                                    </div>

                                                    {/* Document Title Tag */}
                                                    <div className="text-center space-y-1 my-6">
                                                        <h3 className="text-lg font-black text-slate-900 underline underline-offset-4 decoration-indigo-300">{generatedDoc.titleAr}</h3>
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold tracking-wider font-mono">{generatedDoc.titleEn}</p>
                                                    </div>

                                                    {/* Dynamic Text Output */}
                                                    <div className="text-xs leading-relaxed text-slate-700 text-justify space-y-4">
                                                        {generatedDoc.type === 'salary' && (
                                                            <>
                                                                <p>تشهد إدارة الموارد البشرية والشؤون في مكتب الوجيان والروضان للمحاماة، بأن الفاضل/تة <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> حامل الرقم المدني الموثق ({generatedDoc.employee.civilId}) يعمل لدينا بمسمى <strong className="text-indigo-600">{generatedDoc.employee.jobTitle}</strong> بقسم ({generatedDoc.employee.department}) بموجب عقد عمل ({generatedDoc.employee.contractType}) وعلى رأس عمله وهو مسجل رسمياً.</p>
                                                                
                                                                <div className="my-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 max-w-md mx-auto">
                                                                    <div className="p-3 bg-slate-100 flex justify-between font-black border-b">
                                                                        <span>تفاصيل بنود الدخل</span>
                                                                        <span>الراتب بالدينار الكويتي (KWD)</span>
                                                                    </div>
                                                                    <div className="divide-y divide-slate-200 font-medium p-1">
                                                                        <div className="p-2 flex justify-between">
                                                                            <span>الراتب الأساسي</span>
                                                                            <span className="font-mono font-bold">{generatedDoc.employee.basicSalary.toLocaleString()} د.ك</span>
                                                                        </div>
                                                                        {(generatedDoc.employee.allowances || []).map((a: any, index: number) => (
                                                                            <div key={index} className="p-2 flex justify-between text-slate-500">
                                                                                <span>{a.name}</span>
                                                                                <span className="font-mono font-bold">{a.value.toLocaleString()} د.ك</span>
                                                                            </div>
                                                                        ))}
                                                                        <div className="p-3 bg-indigo-50/50 flex justify-between font-black text-indigo-900 border-t">
                                                                            <span>إجمالي الدخل الشهري المستحق</span>
                                                                            <span className="font-mono text-base text-indigo-600">{generatedDoc.gross.toLocaleString()} د.ك</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <p>قامت الإدارة بإعطاء هذه الإفادة بناءً على رغبته لتقديمه إلى الكيان المصرفي: <strong className="text-slate-900">{generatedDoc.customNote || "بيت التمويل الكويتي / من يهمه الأمر"}</strong> دون أي التزام مادي يترتب على عاتقنا.</p>
                                                            </>
                                                        )}

                                                        {generatedDoc.type === 'experience' && (
                                                            <>
                                                                <p>تشهد الشؤون الإدارية والموارد البشرية، بأن الموظف السيد/ة <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> كان يعمل بمقراتنا بمسمى <strong className="text-indigo-600">{generatedDoc.employee.jobTitle}</strong> في الفترة من تاريخ تعيينه المعتمد {generatedDoc.employee.joiningDate} وحتى {generatedDoc.date}.</p>
                                                                <p>وخلال هذه الفترة بذل الموظف جهوداً ممتازة تنم عن جودة وكفاءة في تسيير الشؤون، وتحفظ بصدارته الأمانة المهنية والمصداقية المطلقة والزمالة الحميدة مع زملائه ورؤسائه.</p>
                                                            </>
                                                        )}

                                                        {generatedDoc.type === 'warning' && (
                                                            <>
                                                                <p className="text-rose-600 font-bold border-r-2 border-rose-450 pr-2">إنذار تأديبي مرخص طبقا للمادة 101 لقوانين الهيئات العمالية بدولة الكويت</p>
                                                                <p>يوجه هذا الإنذار الرسمي للموظف: <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> بسبب المخالفة المذكورة أدناه:</p>
                                                                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                                                                    <p className="font-black text-rose-800 text-xs">{generatedDoc.reason}</p>
                                                                </div>
                                                            </>
                                                        )}

                                                        {generatedDoc.type === 'social_pifss' && (
                                                            <>
                                                                <p>تثبت الموارد الإدارية أن الموظف الكويتي الجنسية السيد/ <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> لديه رقم معتمد لدى المؤسسة العامة للتأمينات الاجتماعية بدولة الكويت (PIFSS) وهو مسجل بصندوق التأمين الشامل بمعدل تفصيل راتب خاضع {generatedDoc.subjectPIFSS} د.ك.</p>
                                                                <ul className="space-y-1 ps-4 list-disc text-slate-500 text-[11px]">
                                                                    <li>حصة الموظف المستقطعة (8.5%): {(generatedDoc.subjectPIFSS * 0.085).toFixed(2)} د.ك شهرياً</li>
                                                                    <li>حصة صاحب العمل المسددة (11.0%): {(generatedDoc.subjectPIFSS * 0.11).toFixed(2)} د.ك شهرياً</li>
                                                                    <li className="font-bold text-slate-800">إجمالي السداد الشهري التأميني (19.5%): {(generatedDoc.subjectPIFSS * 0.195).toFixed(2)} د.ك</li>
                                                                </ul>
                                                            </>
                                                        )}

                                                        {generatedDoc.type === 'settlement' && (
                                                            <>
                                                                <p>بموجب الطرف الإداري القانوني، يقر مكتب الوجيان والروضان بأن الموظف <strong className="text-slate-900">{generatedDoc.employee.fullNameAr}</strong> متسلم لرواتبه ومكافأة نهاية الخدمة بالكامل ولا يحق له طلب أي تعويضات عمالية إضافية وتم إبراء ذمة الطرفين تاما.</p>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Sign blocks placeholder */}
                                                    <div className="mt-12 pt-6 border-t flex justify-between text-center select-none text-[10px]">
                                                        <div>
                                                            <p className="text-slate-400">إدارة الموارد الإدارية</p>
                                                            <p className="font-black text-slate-800 mt-1">قسم شؤون الكوادر</p>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-slate-405">المدير العام والترخيص</p>
                                                            <p className="font-black text-indigo-700 mt-1">المستشار صبري شطا</p>
                                                            {/* Seal Stamp design inline for realism */}
                                                            <div className="absolute border border-dashed border-red-500/20 text-red-500 rounded-full w-14 h-14 flex items-center justify-center text-[6px] rotate-12 -top-5 left-8 font-black opacity-60">الوجيان والروضان</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ) : (
                                        <Card className="p-16 rounded-[2.5rem] bg-white border border-slate-100 text-center shadow-sm">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                                <DocumentTextIcon className="w-10 h-10 text-indigo-400" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-850">{translate('توليد الوثائق الإدارية والإنذارات', 'Official Document Builder')}</h3>
                                            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">{translate('اختر الموظف ونوع الوثيقة وسيقوم صندوق الذكاء القانوني بتوليد الأوراق وتضمين الرواتب وحسابات PIFSS مع رمز التحقق QR والأختام الرسمية.', 'Configure values on the left side to compile dynamic legal letters of certification.')}</p>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Compliance Law Audit Tab */}
                    {activeTab === 'compliance_audit' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="compliance-audit-panel"
                            className="space-y-8 text-right"
                        >
                            {/* Executive Score & Metric Dashboard */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* The Compliance Dial */}
                                <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -right-16 -top-16 w-44 h-44 bg-emerald-50 rounded-full opacity-50 blur-xl" />
                                    <div>
                                        <div className="flex gap-2 items-center mb-4 justify-start">
                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="text-sm font-black text-slate-900">{translate('مؤشر الامتثال التنظيمي الأهلي', 'Kuwait Legal Compliance Ratio')}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold block">Kuwait Labor Law 6/2010 Audit</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6">
                                            {translate('معدل المطابقة التلقائية لجميع سجلات الدوام، فترات التجربة، الاستقطاعات وسقف الائتمان ومحاضر التحقيق بموجب المواد الوزارية.', 'Evaluation on dynamic HR documents, probation periods, and loan caps according to Kuwait ministerial guidelines.')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 justify-between">
                                        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="56" cy="56" r="48" className="stroke-slate-100 fill-none" strokeWidth="8" />
                                                <circle cx="56" cy="56" r="48" className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 * (1 - (complianceReportIssues.length === 0 ? 1 : 1 - (complianceReportIssues.filter(i => i.severity === 'critical').length * 0.15 + complianceReportIssues.filter(i => i.severity === 'warning').length * 0.05)))} />
                                            </svg>
                                            <div className="absolute text-center">
                                                <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">
                                                    {((complianceReportIssues.length === 0 ? 100 : Math.max(40, 100 - (complianceReportIssues.filter(i => i.severity === 'critical').length * 15 + complianceReportIssues.filter(i => i.severity === 'warning').length * 5)))).toFixed(0)}%
                                                </span>
                                                <span className="text-[9px] font-black text-emerald-600 tracking-wide block mt-1">
                                                    {complianceReportIssues.filter(i => i.severity === 'critical').length > 0 ? translate('تحتاج تصحيح', 'Action Due') : translate('نموذجي', 'Compliant')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-xs font-bold text-slate-700">{translate('مخالفات جسيمة:', 'Critical anomalies:')} {complianceReportIssues.filter(i => i.severity === 'critical').length}</span>
                                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-xs font-bold text-slate-700">{translate('تنبيهات إدارية:', 'Advisory warnings:')} {complianceReportIssues.filter(i => i.severity === 'warning').length}</span>
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-xs font-bold text-slate-700">{translate('إجراءات سليمة:', 'Compliant items:')} {15 - complianceReportIssues.length}</span>
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Explanatory Briefing Cards with Kuwait Color Theme style */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/50 to-rose-50/10 border border-rose-100 flex flex-col justify-between text-right">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black tracking-widest text-rose-500 uppercase">{translate('سقف فترة التجربة', 'Article 24 Probation')}</span>
                                            <h4 className="text-sm font-black text-slate-800 leading-tight">{translate('المادة 24 من القانون', 'No more than 100 working days')}</h4>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed my-2">
                                            {translate('يُحظر تحديد فترة تجربة تتجاوز 100 يوم عمل، ولا يجوز إخضاع الموظف لنفس صاحب العمل للتجربة مرتين.', 'Probation set on an employee must never exceed 100 actual working days, and cannot be established twice for the same entity.')}
                                        </p>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-50/10 border border-amber-100 flex flex-col justify-between text-right">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">{translate('سقف الخصم والالتزام', 'Article 39 Loan Deduction')}</span>
                                            <h4 className="text-sm font-black text-slate-800 leading-tight">{translate('المادة 39: خصم القروض', 'Max 10% installment ceiling')}</h4>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed my-2">
                                            {translate('لا يجوز اقتطاع أكثر من 10% من راتب العامل الأساسي كسداد لقروض أو سلف عهد، ولا يتقاضى صاحب العمل فائدة.', 'No more than 10% may be deducted from basic salary to recover advances. Interest is strictly forbidden.')}
                                        </p>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-indigo-50/10 border border-indigo-100 flex flex-col justify-between text-right">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">{translate('شروط الخصم التأديبي', 'Article 35 Action Delay')}</span>
                                            <h4 className="text-sm font-black text-slate-800 leading-tight">{translate('المادة 35: قيد الـ 15 يوماً', 'Effective within 15 days delay')}</h4>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed my-2">
                                            {translate('لا يجوز تطبيق عقوبة الخصم بعد مرور 15 يوماً من ثبوت المخالفة، ولا يجاوز الخصم 5 أيام كحد أقصى في المرة.', 'Disciplinary salary deductions become void if not finalized within 15 days of proven violation. Maximum single deduction is 5 days.')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Header */}
                            <div className="flex justify-between items-center mt-8 text-right flex-row-reverse">
                                <div className="text-right">
                                    <h3 className="text-xl font-black text-slate-900">{translate('كشف المخالفات والثغرات العقدية المكتشفة تلقائياً', 'Detected Compliance Anomalies')}</h3>
                                    <p className="text-slate-400 text-xs mt-0.5">{translate('يقوم المحرك الذكي بفرز وفحص جميع سجلات وملفات شؤون الكوادر بدقة للتأكد من خلوها من أي عيب إجرائي.', 'Real-time deep evaluation of civil files, leave days, and administrative penalties.')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setComplianceIsScanning(true);
                                            setTimeout(() => {
                                                setComplianceIsScanning(false);
                                                addToast({ type: 'success', title: 'تدقيق ممتثل كامل', message: 'تم إعادة فحص جميع عقود الموظفين والملفات الطارئة ووجد النظام مطابقة دقيقة!' });
                                            }, 1000);
                                        }}
                                        disabled={complianceIsScanning}
                                        className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-705 font-black text-xs rounded-xl flex items-center gap-2 border bg-white"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${complianceIsScanning ? 'animate-spin' : ''}`} />
                                        <span>{translate('إعادة تشغيل فاحص المطابقة الآلي', 'Full Re-Audit Scan')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Compliance Anomalies List */}
                            <div className="space-y-4">
                                {complianceReportIssues.map((issue, idx) => {
                                    const isCritical = issue.severity === 'critical';
                                    const issueCatAr = issue.sourceSection === 'personnel' ? 'ملف الكادر العمالي' : issue.sourceSection === 'investigation' ? 'جلسة تحقيق إدارية' : 'إجراء وقرار جزائي';
                                    const issueCatEn = issue.sourceSection === 'personnel' ? 'Personnel file' : issue.sourceSection === 'investigation' ? 'Investigation session' : 'Disciplinary action';
                                    
                                    return (
                                        <div
                                            key={issue.id || idx}
                                            className={`p-6 rounded-[2rem] border bg-white shadow-xl flex flex-col md:flex-row-reverse gap-6 justify-between items-start md:items-center relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl text-right ${
                                                isCritical 
                                                ? 'border-rose-100 hover:border-rose-250 hover:shadow-rose-600/5' 
                                                : 'border-amber-100 hover:border-amber-250 hover:shadow-amber-600/5'
                                            }`}
                                        >
                                            {/* Status Glow Ribbon */}
                                            <div className={`absolute top-0 bottom-0 right-0 w-2 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                            
                                            <div className="space-y-3 flex-1 pr-4">
                                                <div className="flex flex-wrap gap-2 items-center justify-start">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                        isCritical 
                                                        ? 'bg-rose-100 text-rose-700 ring-4 ring-rose-50' 
                                                        : 'bg-amber-100 text-amber-700 ring-4 ring-amber-50'
                                                    }`}>
                                                        {isCritical ? translate('مخالفة جسيمة ❌', 'Critical Violation') : translate('تنبيه وقائي ⚠️', 'Advisory Warning')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        {issueCatAr} | {issueCatEn}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="text-base font-black text-slate-805 flex items-center gap-2 justify-start">
                                                        <span>{issue.recordName}</span>
                                                        <span className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{issue.recordId || issue.technicalRuleId}</span>
                                                    </h4>
                                                    <p className="text-[13px] text-slate-750 font-bold leading-relaxed">{issue.issueDescriptionAr}</p>
                                                    <p className="text-[11px] text-slate-400 font-semibold italic">{issue.issueDescriptionEn}</p>
                                                </div>

                                                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row-reverse gap-4 text-xs font-bold justify-between">
                                                    <div className="text-slate-500 text-right md:-ml-8 flex-1">
                                                        <span className="text-slate-900 font-black">{translate('المادة القانونية المعنية:', 'Labor Law Article:')}</span>
                                                        <span className="block text-[11px] text-slate-600 mt-1 max-w-xl font-bold">{issue.lawReferenceAr}</span>
                                                    </div>
                                                    <div className="text-slate-500 text-right flex-1">
                                                        <span className="text-slate-900 font-black">{translate('الإجراء الموصى به لائحياً:', 'Corrective Action Required:')}</span>
                                                        <span className="block text-[11px] text-emerald-600 mt-1 max-w-md font-extrabold">{issue.correctiveActionAr}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="shrink-0 w-full md:w-auto flex flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                {/* We can fix certain automated records instantly! */}
                                                {['RULE_PROBATION_100_DAYS', 'RULE_LOAN_DEDUCTION_10_PERCENT', 'RULE_ANNUAL_LEAVE_30_DAYS', 'RULE_LEAVE_BEFORE_9_MONTHS'].includes(issue.technicalRuleId) ? (
                                                    <button
                                                        onClick={() => handleApplyAutoFix(issue.technicalRuleId, issue.id || issue.recordName)}
                                                        className="w-full md:w-auto h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 transition-transform transform active:scale-95"
                                                    >
                                                        <WrenchScrewdriverIcon className="w-4 h-4" />
                                                        <span>{translate('تطبيق التصحيح التلقائي الفوري ✔️', 'Apply Auto-Fix Instantly')}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            addToast({
                                                                type: 'info',
                                                                title: 'قيد المراجعة القضائية',
                                                                message: 'تم اتخاذ الإجراء اللازم وجاري ضبط سجل الاستدعاء الإداري للموظف للامتثال.'
                                                            });
                                                        }}
                                                        className="w-full md:w-auto h-11 px-5 border border-indigo-200 hover:bg-indigo-50/50 text-indigo-700 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 bg-white"
                                                    >
                                                        <DocumentDuplicateIcon className="w-4 h-4" />
                                                        <span>{translate('طباعة استدعاء واستجواب إداري', 'Print Grievance Summons')}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {complianceReportIssues.length === 0 && (
                                    <Card className="p-16 rounded-[2.5rem] bg-emerald-50/20 border border-emerald-100 text-center text-slate-800">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                            <ShieldCheckIcon className="w-10 h-10 animate-swing" />
                                        </div>
                                        <h3 className="text-xl font-black text-emerald-950">{translate('المؤسسة ممتثلة بالكامل لقانون العمل الكويتي 🎖️', 'Enterprise Fully Compliant!')}</h3>
                                        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">{translate('مبارك! جميع فترات تجربة الموظفين، أرصدة الإجازات، استقطاعات القسط المسموح، محادثات التحقيقات وقرارات الجزاءات متطابقة 100% مع قانون العمل رقم 6 لسنة 2010 بدولة الكويت.', 'All checked metrics match state regulations perfectly with zero infractions detected.')}</p>
                                    </Card>
                                )}
                            </div>

                            {/* Compliance interactive Sandbox Tool */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-12 border-t border-slate-100">
                                <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-6 text-right">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 rounded-md px-2.5 py-1 inline-block text-right self-end">Sandbox Estimator</span>
                                        <h3 className="text-lg font-black text-slate-900">{translate('أداة محاكاة القرارات واحتساب سقوف الحماية', 'Dynamic Legal Simulation Sandbox')}</h3>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{translate('جرب واحتسب سيناريو مالي أو تعاقدي لتعرف رأي المادة ومطابقتها للشأن الكويتي تلقائياً.', 'Simulate real values of basic salary and probation duration to detect violations beforehand.')}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-700 block text-right">{translate('الراتب الأساسي (د.ك):', 'Basic Salary (KWD):')}</label>
                                            <input
                                                type="number"
                                                value={sandboxSalary}
                                                onChange={(e) => setSandboxSalary(parseInt(e.target.value) || 0)}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-700 block text-right">{translate('القسط الشهري لقرض العامل (د.ك):', 'Monthly Loan Recovery (KWD):')}</label>
                                            <input
                                                type="number"
                                                value={sandboxInstallment}
                                                onChange={(e) => setSandboxInstallment(parseInt(e.target.value) || 0)}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <label className="text-[11px] font-black text-slate-700 block text-right">{translate('مدة فترة التجربة (أيام عمل عادية):', 'Probation Days Duration:')}</label>
                                        <input
                                            type="number"
                                            value={sandboxProbationDays}
                                            onChange={(e) => setSandboxProbationDays(parseInt(e.target.value) || 0)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-right"
                                        />
                                    </div>

                                    <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 text-right">
                                        <span className="text-[10px] font-black text-slate-400 tracking-widest block text-right">{translate('النتائج والتقصي الفوري', 'Simulation Feedback')}</span>
                                        {sandboxFeedback.length > 0 ? (
                                            <div className="space-y-2 font-black text-rose-600 text-xs text-right leading-relaxed">
                                                {sandboxFeedback.map((fb, i) => (
                                                    <p key={i}>{fb}</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-emerald-600 font-extrabold text-xs text-right">✓ جميع القيم متطابقة بالكامل ومطابقة للمادتين 24 و 39 لقانون العمل الكويتي.</p>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-6 text-right flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-md px-2.5 py-1 inline-block self-end">Drafting Consultant</span>
                                        <h3 className="text-lg font-black text-slate-900">{translate('صائغ مسودات المواد التعاقدية الذكي (Gemini)', 'AI Legal Contract Builder (Law 6/2010)')}</h3>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{translate('اكتب طلبك الخاص وسيقوم الذكاء الاصطناعي بصياغة بناد أو عقد أو قرار ممتثل 100% للشؤون الإجرائية بدولة الكويت.', 'Draft official warning letters, probation resolutions or salary structure documents.')}</p>
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <textarea
                                            rows={2}
                                            value={aiDraftPrompt}
                                            onChange={(e) => setAiDraftPrompt(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-right"
                                            placeholder="اكتب البند الذي ترغب في صياغته لائحياً..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleGenerateLegalDraftWithAI}
                                        disabled={aiDraftLoading || !aiDraftPrompt.trim()}
                                        className="w-full h-11 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transform active:scale-95 transition-transform"
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>{aiDraftLoading ? translate('جار كتابة المذكرة وصياغتها...', 'Generating Draft...') : translate('صياغة البند ومراجعة التوافق لغوياً', 'Generate Legal Clause Draft')}</span>
                                    </button>

                                    {aiDraftedText && (
                                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 max-h-48 overflow-y-auto no-scrollbar font-sans font-bold text-xs text-right leading-relaxed text-slate-700">
                                            <div className="whitespace-pre-wrap text-justify">{aiDraftedText}</div>
                                        </div>
                                    )}
                                </Card>
                            </div>

                            {/* Official Ministry printable Audit Certificate layout */}
                            <Card className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-slate-150 shadow-2xl relative overflow-hidden text-right space-y-6 mt-16 max-w-4xl mx-auto">
                                <div className="absolute top-0 left-0 bg-indigo-600 text-white px-5 py-2 rounded-bl-3xl font-black text-[10px] tracking-wider uppercase z-20 print:hidden">
                                    {translate('شهادة امتثال وزارة الشؤون', 'Official Audit Certificate Document')}
                                </div>

                                <div className="flex justify-between items-center border-b border-slate-100 pb-5 flex-row-reverse">
                                    <span className="text-xs text-slate-400 font-bold">{translate('ملاحظة: هذا التقرير مجهز للتحميل أو الطباعة لتقديمه للجهات والشؤون العمالية بوزارة الشؤون بدولة الكويت.', 'Legal template conforms to public requirements.')}</span>
                                    <button
                                        onClick={() => window.print()}
                                        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 border border-emerald-400 font-black text-xs rounded-xl flex items-center gap-2 shadow-sm print:hidden"
                                    >
                                        <PrinterIcon className="w-4 h-4 text-emerald-800" />
                                        <span>{translate('طباعة التقرير الفوري ومحاضر الفحص', 'Print Compliant Certificate')}</span>
                                    </button>
                                </div>

                                {/* Printable paper frame */}
                                <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50/10 space-y-8 select-all text-slate-800 text-right print-only-container">
                                    {/* Header */}
                                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                                        <div className="text-right">
                                            <h4 className="text-sm font-black text-slate-900 leading-tight">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h4>
                                            <p className="text-[10px] text-slate-400 block mt-0.5">قسم الشؤون والتدقيق والالتزام العمالي</p>
                                        </div>
                                        <div className="text-left font-mono text-[9px] font-bold text-slate-450">
                                            <p>REF: AUDIT-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                                            <p>DATE: {format(new Date(), 'yyyy-MM-dd')}</p>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-black text-slate-900 underline underline-offset-4 decoration-indigo-300 text-center">شهادة فحص وتدقيق الامتثال لقانون العمل الكويتي</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold font-mono text-center">CERTIFICATE OF LEGAL LABOR LAW COMPLIANCE (LAW 6/2010)</p>
                                    </div>

                                    {/* Statement */}
                                    <div className="text-xs leading-relaxed text-slate-705 text-justify space-y-4 font-bold">
                                        <p>يشهد ممثل قطاع الفحص والتدقيق القانوني والامتثال بمكتب الوجيان والروضان للمحاماة بدولة الكويت، بأنه في يوم تاريخه جرى فحص وتدقيق تفصيلي لـ <strong className="text-slate-900">{employees.length} ملفات كادر قانوني وإداري نشط</strong> بالمكتب.</p>
                                        <p>وقد شمل هذا الفحص مراجعة بنود العقود المبرمة، وقياس فترة التجربة للكوادر المبتدئة، ومطابقة أرصدة الإجازات السنوية المستحقة والطارئة طبقاً للمادتين 70 و 76، بالإضافة لتتبع استقطاعات عهد القروض الاستثمارية والمالية مع تفعيل احتساب خصم PIFSS للتأمينات الاجتماعية الكويتيين.</p>
                                        <p>وبناءً على المعايير الدستورية المرعية واللوائح المنظمة بالمؤسسة العامة للتأمينات ووزارة الشؤون الاجتماعية والعمل بدولة الكويت، نقر بأن الهيكل الإجرائي والتعاقدي متوافق تماماً ومحمي لائحياً من أي عيب عمالي.</p>

                                        {/* Status metrics in paper style */}
                                        <div className="my-8 border border-slate-200 rounded-xl overflow-hidden bg-white max-w-lg mx-auto text-right">
                                            <div className="p-3 bg-slate-100 flex justify-between font-black border-b text-slate-800">
                                                <span>معلمة الفحص والمراقبة</span>
                                                <span>نسبة وحالة التقييم</span>
                                            </div>
                                            <div className="divide-y divide-slate-200 text-[11px]">
                                                <div className="p-3 flex justify-between font-bold">
                                                    <span>مجموع السجلات المفحوصة في الكادر</span>
                                                    <span className="font-mono">{employees.length} سجلات موثقة</span>
                                                </div>
                                                <div className="p-3 flex justify-between font-bold">
                                                    <span>مؤشر مطابقة فترة التجربة (المادة 24)</span>
                                                    <span className="text-emerald-600 font-extrabold">مطابق (100 يوم عمل كحد أقصى)</span>
                                                </div>
                                                <div className="p-3 flex justify-between font-bold">
                                                    <span>رصد خصم القروض وقسط العهدة (المادة 39)</span>
                                                    <span className="text-emerald-600 font-extrabold">مطابق (لا يتجاوز 10% من الأساسي)</span>
                                                </div>
                                                <div className="p-3 flex justify-between text-indigo-900 font-black bg-indigo-50/20">
                                                    <span>درجة الأمان ومستوى المطابقة النهائي للإدارة</span>
                                                    <span className="font-mono text-xs">{complianceReportIssues.length === 0 ? '100% ممتاز ونموذجي' : 'نسبة أمان ممتثلة'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signoffs */}
                                    <div className="mt-12 grid grid-cols-2 gap-12 pt-6 border-t text-center text-[10px] font-bold">
                                        <div>
                                            <p className="text-slate-400 text-center">قسم التدقيق القانوني والامتثال</p>
                                            <p className="font-black text-slate-800 mt-1 text-center">المستشار عبدالمحسن الشمري</p>
                                        </div>
                                        <div className="relative font-bold">
                                            <p className="text-slate-400 font-bold text-center">المصادقة والترخيص المهني العام</p>
                                            <p className="font-black text-indigo-700 mt-1 text-center font-bold">الأستاذ المستشار صبري شطا</p>
                                            <div className="absolute border border-dashed border-red-500/30 text-red-500 rounded-full w-16 h-16 flex items-center justify-center font-black rotate-12 -top-6 left-12 opacity-50 text-[5px]">الوجيان والروضان للأعمال</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* 7. Gemini AI Smart Advisory */}
                    {activeTab === 'ai' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            key="ai-advise"
                            className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-indigo-750 to-indigo-600 p-6 flex items-center justify-between text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                                        <SparklesIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black font-sans leading-tight">{translate('مستشار قانون العمل الكويتي والموارد الذكي', 'Kuwait Legal Labor Advisory AI')}</h3>
                                        <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider font-sans">AI-powered Kuwaiti Law 6/2010 compliance consultant</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/50">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm border text-xs leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-white text-slate-705 border-slate-200 rounded-tr-none font-bold' 
                                            : 'bg-indigo-600 text-white border-transparent rounded-tl-none font-medium text-justify'
                                        }`}>
                                            <div className="markdown-body">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div className="flex justify-end">
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-1.5 items-center">
                                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-5 border-t border-slate-100 bg-white">
                                <div className="flex gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-xs font-bold placeholder:text-slate-400"
                                        placeholder={translate('اسأل حول مكافأة نهاية الخدمة، المادة 51، خصومات التأمينات الكويتيين...', 'Consult Gemini on Kuwait private sector Labor Law policies...')}
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={isAiLoading || !chatInput.trim()}
                                        className="bg-indigo-600 text-white p-3 rounded-xl shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center w-11 h-11 shrink-0"
                                    >
                                        <PaperAirplaneIcon className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Log Event Timeline Modular Dialog */}
            {showLogModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-6 h-auto bg-white rounded-3xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black text-slate-900">{translate('تدوين حدث وظيفي للتاريخ', 'Log Custom HR Event')}</h3>
                            <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTimelineLog} className="space-y-4 text-right">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-705 block">{translate('اسم الموظف المعني:', 'Employee Name:')}</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder={translate('مثال: مريم ناصر الصقر', 'e.g. Maryam Nasser')}
                                    value={logEmpName}
                                    onChange={(e) => setLogEmpName(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-705 block">{translate('التفصيل والحدث الوظيفي:', 'Action Explanation:')}</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder={translate('مثال: ترقية لدرجة مستشار قانوني أول وزيادة الراتب', 'e.g. Promoted to Senior Consultant')}
                                    value={logAction}
                                    onChange={(e) => setLogAction(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-705 block">{translate('نوع الإجراء:', 'Event Type:')}</label>
                                <select 
                                    value={logType}
                                    onChange={(e) => setLogType(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs"
                                >
                                    <option value="ترقية">{translate('ترقية أو منصب', 'Promotion')}</option>
                                    <option value="تأديبي">{translate('تأديبي أو إنذار', 'Correction / Disciplinary')}</option>
                                    <option value="طلب">{translate('إقرار / عريضة', 'Request Approval')}</option>
                                    <option value="مالية">{translate('مالية أو رواتب', 'Financial Payroll')}</option>
                                    <option value="إداري">{translate('إجراء إداري عام', 'General Admin')}</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <Button 
                                    variant="outline" 
                                    type="button" 
                                    onClick={() => setShowLogModal(false)}
                                    className="rounded-xl font-bold text-xs"
                                >
                                    {translate('إلغاء لغوياً', 'Cancel')}
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-indigo-600 text-white rounded-xl font-black text-xs h-10 px-4"
                                >
                                    {translate('حفظ الحدث وتسجيله', 'Commit Event')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Injected Print Styles specifically optimized for Kuwait standards */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    .print-only-container, .print-only-container * { visibility: visible !important; }
                    .print-only-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: 0 !important; }
                    .no-print { display: none !important; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-swing { animation: swing 2.5s infinite ease-in-out; }
                @keyframes swing {
                    0%, 100% { transform: rotate(-4deg); }
                    50% { transform: rotate(4deg); }
                }
            `}} />
        </div>
    );
};

// --- Custom Statistic Panel representation Component ---
interface StatPanelProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    color: string;
    meta?: string;
}

const StatPanel: React.FC<StatPanelProps> = ({ title, value, unit, icon, color, meta }) => (
    <Card className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-36">
        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[2.5rem] flex items-center justify-center text-slate-400">
            {icon}
        </div>
        <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">{title}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</span>
                {unit && <span className="text-xs font-black text-slate-500">{unit}</span>}
            </div>
        </div>
        {meta && (
            <div className="text-[10px] font-bold text-slate-400 leading-none pt-2 border-t border-slate-50 truncate">
                {meta}
            </div>
        )}
    </Card>
);

// Extra Icons placeholder references from standard
const GlobeAltIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 018.716 6.747M12 3a9.003 9.003 0 00-8.716 6.747M21 12h-3m3 0a9 9 0 01-9 9m9-9H3m9 9a9 9 0 01-9-9m9 0c0-4.97-2.015-9-4.5-9M3 12h3" />
    </svg>
);

export default EmployeeAffairsPage;
