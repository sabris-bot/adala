import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Activity, Plus, UserCircle, ChevronRight, Search, Filter, Star, RefreshCw, 
    BarChart3, Printer, Eye, Trash, Edit, ArrowDown, CheckCircle2, AlertTriangle, 
    Clock, TrendingUp, FileText, ChevronLeft, ShieldAlert, Award, FileSpreadsheet,
    Building2, ClipboardList, HelpCircle, ArrowRightLeft, MessageSquare, Copy
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';

// --- ENUMS & INTERFACES ---
export enum RoleLevel {
    EXECUTIVE = 'Executive', // تنفيذي / قيادي
    MANAGERIAL = 'Managerial', // إداري / إشرافي
    OPERATIONAL = 'Operational', // تشغيلي / تنفيذي
    TECHNICAL = 'Technical', // فني / تخصصي
}

export type PerformanceAppraisalStatus = 'Draft' | 'Pending Line Manager' | 'Under HR Review' | 'Under Financial Review' | 'Signed & Completed';

export interface PerformanceCriterion {
    name: string;
    score: number;
    weight: number;
    notes?: string;
}

export interface PerformanceAppraisal {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeJobTitle: string;
    employeeDepartment: string;
    managerName: string;
    appraisalPeriod: string;
    appraisalDate: string;
    status: PerformanceAppraisalStatus;
    roleLevel: RoleLevel;
    
    // Auto-retrieved compliance flags
    attendanceAbsences: number;
    attendanceDelays: number;
    warningsCount: number;
    activeGoalsCount: number;
    basicSalary: number;
    allowancesAmount: number;
    civilId: string;
    joiningDate: string;
    nationality: string;

    // Evaluation Scores
    criteria: {
        // Quantitative (الكمية)
        efficiency: PerformanceCriterion;        // كفاءة الإنجاز
        outputAmount: PerformanceCriterion;      // كمية المخرجات
        attendance: PerformanceCriterion;        // الانضباط والدوام
        policyCompliance: PerformanceCriterion;  // الالتزام باللوائح والتعليمات

        // Qualitative (النوعية)
        leadership: PerformanceCriterion;        // القيادة والتمكين
        integrity: PerformanceCriterion;         // النزاهة وأخلاقيات العمل
        clientCoordination: PerformanceCriterion;// التنسيق والتعامل مع العملاء
        nationalAlignment: PerformanceCriterion; // التوطين والتوجه الوطني
    };
    
    overallScore: number; 
    overallGrade: 'Excellent' | 'Very Good' | 'Good' | 'Satisfactory' | 'Weak'; 
    generalNotes?: string;
    correctiveActionPlan?: string;

    // Recommendations
    recommendations: {
        promotion: boolean;
        salaryIncrease: boolean;
        salaryIncreasePct: number;
        bonus: boolean;
        bonusAmount: number;
        warning: boolean;
        disciplinaryAction?: string;
        trainingNeeded?: string;
    };

    // Audit and signatures
    referenceNumber: string;
    qrCodeData: string;
    signatures: {
        manager?: { name: string; signedAt?: string };
        hr?: { name: string; signedAt?: string };
        employee?: { name: string; signedAt?: string };
        auditor?: { name: string; signedAt?: string };
    };
    
    // Workflows / History
    isGrievanceSubmitted?: boolean;
    grievanceNote?: string;
    grievanceResponse?: string;
    isTransferSubmitted?: boolean;
    transferTargetDept?: string;
}

// --- MOCK EMPLOYEES ---
const mockEmployeesList = [
    { id: 'emp-1', employeeId: 'EMP001', fullNameAr: 'أحمد محمود العبدالله', jobTitle: 'محاسب رئيسي', department: 'المالية', joiningDate: '2018-05-10', basicSalary: 1500, allowancesAmount: 300, civilId: '290010100123', nationality: 'كويتي', warningsCount: 0, attendanceAbsences: 0, attendanceDelays: 1 },
    { id: 'emp-2', employeeId: 'EMP002', fullNameAr: 'سحر جاسم الفيلي', jobTitle: 'مساعد عمليات', department: 'العمليات', joiningDate: '2022-09-12', basicSalary: 750, allowancesAmount: 100, civilId: '295050500456', nationality: 'كويتية', warningsCount: 3, attendanceAbsences: 12, attendanceDelays: 14 },
    { id: 'emp-3', employeeId: 'EMP003', fullNameAr: 'خالد عبدالمحسن الصايغ', jobTitle: 'منسق عمليات', department: 'العمليات', joiningDate: '2021-03-05', basicSalary: 1100, allowancesAmount: 150, civilId: '291030300789', nationality: 'كويتي', warningsCount: 0, attendanceAbsences: 2, attendanceDelays: 4 },
    { id: 'emp-4', employeeId: 'EMP004', fullNameAr: 'بدر فهد المطيري', jobTitle: 'باحث قانوني', department: 'الشؤون القانونية', joiningDate: '2020-07-15', basicSalary: 1250, allowancesAmount: 200, civilId: '293040400321', nationality: 'كويتي', warningsCount: 1, attendanceAbsences: 1, attendanceDelays: 3 },
    { id: 'emp-5', employeeId: 'EMP005', fullNameAr: 'سارة خالد الصباح', jobTitle: 'مستشار قانوني', department: 'الشركات', joiningDate: '2020-02-15', basicSalary: 1800, allowancesAmount: 400, civilId: '295090900111', nationality: 'كويتية', warningsCount: 0, attendanceAbsences: 0, attendanceDelays: 0 },
];

// --- SEED CONTEXT DEPOS (4 INTERACTIVE LIVE DEMOS) ---
const initialAppraisalsSeed: PerformanceAppraisal[] = [
    {
        id: 'app-seed-1',
        employeeId: 'emp-1',
        employeeName: 'أحمد محمود العبدالله',
        employeeJobTitle: 'محاسب رئيسي',
        employeeDepartment: 'المالية',
        managerName: 'يوسف العثمان',
        appraisalPeriod: '2024 / 2025',
        appraisalDate: '2025-12-15',
        status: 'Signed & Completed',
        roleLevel: RoleLevel.MANAGERIAL,
        attendanceAbsences: 0,
        attendanceDelays: 1,
        warningsCount: 0,
        activeGoalsCount: 3,
        basicSalary: 1500,
        allowancesAmount: 300,
        civilId: '290010100123',
        joiningDate: '2018-05-10',
        nationality: 'كويتي',
        criteria: {
            efficiency: { name: 'كفاءة الإنجاز والتوقيت', score: 5, weight: 15 },
            outputAmount: { name: 'حجم مخرجات العمل', score: 5, weight: 15 },
            attendance: { name: 'الانضباط والالتزام بالدوام', score: 5, weight: 10 },
            policyCompliance: { name: 'الالتزام باللوائح والسياسات', score: 5, weight: 10 },
            leadership: { name: 'التوجيه والقيادة والمبادرة', score: 4.5, weight: 15 },
            integrity: { name: 'النزاهة وأخلاقيات المهنة', score: 5, weight: 15 },
            clientCoordination: { name: 'التواصل ورضا العملاء', score: 4.5, weight: 10 },
            nationalAlignment: { name: 'التوطين ومواءمة التوجه الوطني', score: 4.8, weight: 10 },
        },
        overallScore: 4.86,
        overallGrade: 'Excellent',
        generalNotes: 'موظف قيادي واستباقي. يظهر كفاءة استثنائية في إعداد وإغلاق الميزانيات الربعية والسنوية بنسبة التزام وتدقيق كاملة 100% دون أي ملاحظات من المدقق المالي الخارجي.',
        recommendations: {
            promotion: true,
            salaryIncrease: true,
            salaryIncreasePct: 15,
            bonus: true,
            bonusAmount: 500,
            warning: false,
            trainingNeeded: 'برنامج دبلوم الإدارة والقيادة المتقدم بالتنسيق مع معهد الدراسات المصرفية',
        },
        referenceNumber: 'QA-PERF-2025-001',
        qrCodeData: 'https://ais-adala/verify/perf/QA-PERF-2025-001',
        signatures: {
            manager: { name: 'يوسف العثمان', signedAt: '2025-12-16' },
            hr: { name: 'ناصر السبيعي', signedAt: '2025-12-18' },
            employee: { name: 'أحمد محمود العبدالله', signedAt: '2025-12-20' },
            auditor: { name: 'صبري شطا', signedAt: '2025-12-18' }
        }
    },
    {
        id: 'app-seed-2',
        employeeId: 'emp-2',
        employeeName: 'سحر جاسم الفيلي',
        employeeJobTitle: 'مساعد عمليات',
        employeeDepartment: 'العمليات',
        managerName: 'منيرة الصباح',
        appraisalPeriod: '2025 / 2026',
        appraisalDate: '2026-05-15',
        status: 'Under HR Review',
        roleLevel: RoleLevel.OPERATIONAL,
        attendanceAbsences: 12,
        attendanceDelays: 14,
        warningsCount: 3,
        activeGoalsCount: 1,
        basicSalary: 750,
        allowancesAmount: 100,
        civilId: '295050500456',
        joiningDate: '2022-09-12',
        nationality: 'كويتية',
        criteria: {
            efficiency: { name: 'كفاءة الإنجاز والتوقيت', score: 2.0, weight: 15 },
            outputAmount: { name: 'حجم مخرجات العمل', score: 1.5, weight: 15 },
            attendance: { name: 'الانضباط والالتزام بالدوام', score: 1.0, weight: 10 },
            policyCompliance: { name: 'الالتزام باللوائح والسياسات', score: 2.0, weight: 10 },
            leadership: { name: 'التوجيه والقيادة والمبادرة', score: 1.0, weight: 15 },
            integrity: { name: 'النزاهة وأخلاقيات المهنة', score: 3.5, weight: 15 },
            clientCoordination: { name: 'التواصل ورضا العملاء', score: 1.8, weight: 10 },
            nationalAlignment: { name: 'التوطين ومواءمة التوجه الوطني', score: 2.5, weight: 10 },
        },
        overallScore: 1.83,
        overallGrade: 'Weak',
        generalNotes: 'الموظفة تعاني من تراجع ملحوظ في الأداء وتكرار الغيابات دون عذر طبي مقبول أو إجازة مسبقة. تم توجيه إنذارات سابقة شفهية وكتابية دون تحسن ملموس. هناك قصور حاد في معالجة طلبات العملاء.',
        correctiveActionPlan: 'وضع الموظفة تحت خطة تقويم ومراقبة أداء مشددة لمدة 90 يوماً من تاريخ التقييم مع ضرورة تقديم تقارير إنجاز أسبوعية وإلحاقها بتدريب أساسي.',
        recommendations: {
            promotion: false,
            salaryIncrease: false,
            salaryIncreasePct: 0,
            bonus: false,
            bonusAmount: 0,
            warning: true,
            disciplinaryAction: 'إصدار كتاب إنذار نهائي مسجل وإيقاع خصم من الراتب لمخالفتها لوائح الحضور والانصراف وفقاً للفصل السادس من قانون العمل الكويتي',
            trainingNeeded: 'تمويل دورة تدريبية علاجية لخدمة العملاء والالتزام الوظيفي.',
        },
        referenceNumber: 'QA-PERF-2026-002',
        qrCodeData: 'https://ais-adala/verify/perf/QA-PERF-2026-002',
        signatures: {
            manager: { name: 'منيرة الصباح', signedAt: '2026-05-16' },
        }
    },
    {
        id: 'app-seed-3',
        employeeId: 'emp-3',
        employeeName: 'خالد عبدالمحسن الصايغ',
        employeeJobTitle: 'منسق عمليات',
        employeeDepartment: 'العمليات',
        managerName: 'منيرة الصباح',
        appraisalPeriod: '2025 / 2026',
        appraisalDate: '2026-05-18',
        status: 'Under Financial Review',
        roleLevel: RoleLevel.TECHNICAL,
        attendanceAbsences: 2,
        attendanceDelays: 4,
        warningsCount: 0,
        activeGoalsCount: 2,
        basicSalary: 1100,
        allowancesAmount: 150,
        civilId: '291030300789',
        joiningDate: '2021-03-05',
        nationality: 'كويتي',
        criteria: {
            efficiency: { name: 'كفاءة الإنجاز والتوقيت', score: 4.5, weight: 15 },
            outputAmount: { name: 'حجم مخرجات العمل', score: 4.2, weight: 15 },
            attendance: { name: 'الانضباط والالتزام بالدوام', score: 4.5, weight: 10 },
            policyCompliance: { name: 'الالتزام باللوائح والسياسات', score: 4.5, weight: 10 },
            leadership: { name: 'التوجيه والقيادة والمبادرة', score: 3.8, weight: 15 },
            integrity: { name: 'النزاهة وأخلاقيات المهنة', score: 4.2, weight: 15 },
            clientCoordination: { name: 'التواصل ورضا العملاء', score: 4.5, weight: 10 },
            nationalAlignment: { name: 'التوطين ومواءمة التوجه الوطني', score: 4.0, weight: 10 },
        },
        overallScore: 4.24,
        overallGrade: 'Very Good',
        generalNotes: 'طلب الموظف النقل من إدارة العمليات إلى إدارة التدقيق القانوني بالشركة، نظراً لحصوله مؤخراً على شهادة تخصصية في القانون المالي ومراجعة الحسابات الإدارية. التقييم يدعم هذا المسار الوظيفي الداخلي.',
        isTransferSubmitted: true,
        transferTargetDept: 'إدارة التدقيق القانوني',
        recommendations: {
            promotion: false,
            salaryIncrease: true,
            salaryIncreasePct: 5,
            bonus: false,
            bonusAmount: 0,
            warning: false,
            disciplinaryAction: 'الموافقة المبدئية والرفع للمدير المالي لاعتماد هيكلة وبدلات إدارة التدقيق القانوني الجديدة.',
        },
        referenceNumber: 'QA-PERF-2026-003',
        qrCodeData: 'https://ais-adala/verify/perf/QA-PERF-2026-003',
        signatures: {
            manager: { name: 'منيرة الصباح', signedAt: '2026-05-18' },
            hr: { name: 'ناصر السبيعي', signedAt: '2026-05-19' }
        }
    },
    {
        id: 'app-seed-4',
        employeeId: 'emp-4',
        employeeName: 'بدر فهد المطيري',
        employeeJobTitle: 'باحث قانوني',
        employeeDepartment: 'الشؤون القانونية',
        managerName: 'أبو الوفا الدسوقي',
        appraisalPeriod: '2025 / 2026',
        appraisalDate: '2026-05-20',
        status: 'Under HR Review',
        roleLevel: RoleLevel.TECHNICAL,
        attendanceAbsences: 1,
        attendanceDelays: 3,
        warningsCount: 1,
        activeGoalsCount: 2,
        basicSalary: 1250,
        allowancesAmount: 200,
        civilId: '293040400321',
        joiningDate: '2020-07-15',
        nationality: 'كويتي',
        criteria: {
            efficiency: { name: 'كفاءة الإنجاز والتوقيت', score: 3.5, weight: 15 },
            outputAmount: { name: 'حجم مخرجات العمل', score: 3.0, weight: 15 },
            attendance: { name: 'الانضباط والالتزام بالدوام', score: 3.5, weight: 10 },
            policyCompliance: { name: 'الالتزام باللوائح والسياسات', score: 3.0, weight: 10 },
            leadership: { name: 'التوجيه والقيادة والمبادرة', score: 2.5, weight: 15 },
            integrity: { name: 'النزاهة وأخلاقيات المهنة', score: 4.0, weight: 15 },
            clientCoordination: { name: 'التواصل ورضا العملاء', score: 3.0, weight: 10 },
            nationalAlignment: { name: 'التوطين ومواءمة التوجه الوطني', score: 3.5, weight: 10 },
        },
        overallScore: 3.20,
        overallGrade: 'Good',
        generalNotes: 'تقدّم الموظف بتظلم رسمي إداري ضد تقييمه الصادر من رئيس القسم المباشر (بدرجة جيد)، بحجة تواجد تحيز شخصي ضده وطالب بإعادة مراجعة التقييم استناداً لملف مذكرات الرد على القضايا الكلية المنجزة وعددها 14 قضية.',
        isGrievanceSubmitted: true,
        grievanceNote: 'التقييم لا يعكس الجهد المبذول في صياغة مذكرات قضايا الشركات الكبرى. قمت بصياغة 14 مذكرة دفاع في المحكمة الكلية وتم قبول الدفوع بالكامل وتحقيق مكاسب تتجاوز 400 ألف د.ك لصالح عملاء الشركة.',
        grievanceResponse: 'قيد الدراسة من لجنة الموارد البشرية والتدقيق القانوني لإعادة مراجعة ملف القضايا والتحقق من التظلم الإداري.',
        recommendations: {
            promotion: false,
            salaryIncrease: false,
            salaryIncreasePct: 0,
            bonus: false,
            bonusAmount: 0,
            warning: false,
        },
        referenceNumber: 'QA-PERF-2026-004',
        qrCodeData: 'https://ais-adala/verify/perf/QA-PERF-2026-004',
        signatures: {
            manager: { name: 'أبو الوفا الدسوقي', signedAt: '2026-05-20' }
        }
    }
];

const EmployeePerformancePage: React.FC = () => {
    const { t } = useTranslation();
    const { selectedJurisdiction } = useJurisdiction();

    // --- STATES ---
    const [appraisals, setAppraisals] = useState<PerformanceAppraisal[]>(initialAppraisalsSeed);
    const [employees, setEmployees] = useState(mockEmployeesList);
    const [activeTab, setActiveTab] = useState<'kpi' | 'evaluations' | 'newForm'>('kpi');
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');

    // Details / Print Modal States
    const [selectedAppraisal, setSelectedAppraisal] = useState<PerformanceAppraisal | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printDocType, setPrintDocType] = useState<'appraisal' | 'warning' | 'promotion' | 'transfer' | 'grievance'>('appraisal');

    // Add / Edit Form State
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Core Form Fields
    const [formEmployeeId, setFormEmployeeId] = useState('');
    const [formRoleLevel, setFormRoleLevel] = useState<RoleLevel>(RoleLevel.OPERATIONAL);
    const [formAppraisalPeriod, setFormAppraisalPeriod] = useState('2025 / 2026');
    const [formAppraisalDate, setFormAppraisalDate] = useState(new Date().toISOString().split('T')[0]);
    const [formManagerName, setFormManagerName] = useState('صبري شطا');
    const [formNotes, setFormNotes] = useState('');
    const [formActionPlan, setFormActionPlan] = useState('');
    
    // Scores
    const [scoreEfficiency, setScoreEfficiency] = useState(4);
    const [scoreOutput, setScoreOutput] = useState(4);
    const [scoreAttendance, setScoreAttendance] = useState(4);
    const [scoreCompliance, setScoreCompliance] = useState(4);
    const [scoreLeadership, setScoreLeadership] = useState(4);
    const [scoreIntegrity, setScoreIntegrity] = useState(4);
    const [scoreClient, setScoreClient] = useState(4);
    const [scoreNational, setScoreNational] = useState(4);

    // Recs
    const [recPromotion, setRecPromotion] = useState(false);
    const [recSalaryInc, setRecSalaryInc] = useState(false);
    const [recSalaryPct, setRecSalaryPct] = useState(5);
    const [recBonus, setRecBonus] = useState(false);
    const [recBonusAmt, setRecBonusAmt] = useState(0);
    const [recWarning, setRecWarning] = useState(false);
    const [recDisciplinary, setRecDisciplinary] = useState('');
    const [recTraining, setRecTraining] = useState('');

    // Transfer integration
    const [formIsTransfer, setFormIsTransfer] = useState(false);
    const [formTransferDept, setFormTransferDept] = useState('');

    // Grievance states
    const [formIsGrievance, setFormIsGrievance] = useState(false);
    const [formGrievanceNote, setFormGrievanceNote] = useState('');
    const [formGrievanceResponse, setFormGrievanceResponse] = useState('');

    // Auto-retrieved metrics of selected employee
    const selectedEmployeeMeta = useMemo(() => {
        return employees.find(emp => emp.id === formEmployeeId);
    }, [formEmployeeId, employees]);

    // Set initial employee when going to adding form
    useEffect(() => {
        if (!formEmployeeId && employees.length > 0) {
            setFormEmployeeId(employees[0].id);
        }
    }, [employees, formEmployeeId]);

    // Apply auto-retrieved metrics to form when employee is selected
    useEffect(() => {
        if (selectedEmployeeMeta && formMode === 'create') {
            // Automatically select default role levels based on Job Title
            if (selectedEmployeeMeta.jobTitle.includes('رئيسي') || selectedEmployeeMeta.jobTitle.includes('أول') || selectedEmployeeMeta.jobTitle.includes('مدير')) {
                setFormRoleLevel(RoleLevel.MANAGERIAL);
            } else if (selectedEmployeeMeta.jobTitle.includes('مستشار')) {
                setFormRoleLevel(RoleLevel.EXECUTIVE);
            } else if (selectedEmployeeMeta.jobTitle.includes('باحث') || selectedEmployeeMeta.jobTitle.includes('فني')) {
                setFormRoleLevel(RoleLevel.TECHNICAL);
            } else {
                setFormRoleLevel(RoleLevel.OPERATIONAL);
            }

            // Sync warning or default behaviors
            if (selectedEmployeeMeta.warningsCount > 2) {
                setRecWarning(true);
                setRecDisciplinary('إنذار كتابي رسمي بتقصير الأداء الوظيفي والغيابات المتكررة');
            } else {
                setRecWarning(false);
                setRecDisciplinary('');
            }
        }
    }, [selectedEmployeeMeta, formMode]);

    // Computed real-time Rating and Grade for current form scores
    const calculatedOverallStats = useMemo(() => {
        const scores = [
            scoreEfficiency, scoreOutput, scoreAttendance, scoreCompliance,
            scoreLeadership, scoreIntegrity, scoreClient, scoreNational
        ];
        const sum = scores.reduce((acc, current) => acc + current, 0);
        const avg = parseFloat((sum / 8).toFixed(2));
        
        let grade: 'Excellent' | 'Very Good' | 'Good' | 'Satisfactory' | 'Weak' = 'Good';
        if (avg >= 4.5) grade = 'Excellent';
        else if (avg >= 4.0) grade = 'Very Good';
        else if (avg >= 3.0) grade = 'Good';
        else if (avg >= 2.0) grade = 'Satisfactory';
        else grade = 'Weak';

        return { avg, grade };
    }, [
        scoreEfficiency, scoreOutput, scoreAttendance, scoreCompliance,
        scoreLeadership, scoreIntegrity, scoreClient, scoreNational
    ]);

    // Smart warning flag checking
    const showPromotionRestrictionAlert = useMemo(() => {
        // True if trying to promote or raise salary above 10% when avg grade from form is NOT Excellent
        return (recPromotion || (recSalaryInc && recSalaryPct > 10)) && calculatedOverallStats.grade !== 'Excellent';
    }, [recPromotion, recSalaryInc, recSalaryPct, calculatedOverallStats]);

    const showLowPerformanceWarningAlert = useMemo(() => {
        return calculatedOverallStats.avg < 3.0; // Satisfactory or Weak
    }, [calculatedOverallStats]);

    // --- STATS & COUNTS FOR DASHBOARD ---
    const dashboardStats = useMemo(() => {
        const total = appraisals.length;
        const signedCount = appraisals.filter(a => a.status === 'Signed & Completed').length;
        const hrCount = appraisals.filter(a => a.status === 'Under HR Review').length;
        const financialCount = appraisals.filter(a => a.status === 'Under Financial Review').length;
        const lineCount = appraisals.filter(a => a.status === 'Pending Line Manager').length;

        const weakCount = appraisals.filter(a => a.overallGrade === 'Weak' || a.overallGrade === 'Satisfactory').length;
        const excellentCount = appraisals.filter(a => a.overallGrade === 'Excellent').length;
        const avgCompanyRating = total > 0 ? (appraisals.reduce((sum, a) => sum + a.overallScore, 0) / total).toFixed(2) : '0';
        
        const grievanceCount = appraisals.filter(a => a.isGrievanceSubmitted).length;
        const transferCount = appraisals.filter(a => a.isTransferSubmitted).length;

        // Warning Distributions (for demo)
        const totalDisciplinaryCount = appraisals.reduce((sum, a) => sum + (a.recommendations.warning ? 1 : 0), 0) + 2;

        return {
            total, signedCount, hrCount, financialCount, lineCount,
            weakCount, excellentCount, avgCompanyRating, grievanceCount, transferCount, totalDisciplinaryCount
        };
    }, [appraisals]);

    // --- SEARCH / FILTERING ---
    const filteredAppraisalsList = useMemo(() => {
        return appraisals.filter(a => {
            const matchesSearch = a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 a.employeeJobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 a.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesDept = deptFilter === 'All' || a.employeeDepartment === deptFilter;
            const matchesLevel = levelFilter === 'All' || a.roleLevel === levelFilter;

            return matchesSearch && matchesDept && matchesLevel;
        });
    }, [appraisals, searchQuery, deptFilter, levelFilter]);


    // --- HANDLERS ---
    const handleSwitchToForm = (mode: 'create' | 'edit', app?: PerformanceAppraisal) => {
        setFormMode(mode);
        if (mode === 'create') {
            setEditingId(null);
            setFormEmployeeId(employees[0]?.id || '');
            setFormRoleLevel(RoleLevel.OPERATIONAL);
            setFormAppraisalPeriod('2025 / 2026');
            setFormAppraisalDate(new Date().toISOString().split('T')[0]);
            setFormManagerName('منيرة الصباح');
            setFormNotes('');
            setFormActionPlan('');

            setScoreEfficiency(4);
            setScoreOutput(4);
            setScoreAttendance(4);
            setScoreCompliance(4);
            setScoreLeadership(3);
            setScoreIntegrity(4);
            setScoreClient(4);
            setScoreNational(4);

            setRecPromotion(false);
            setRecSalaryInc(false);
            setRecSalaryPct(5);
            setRecBonus(false);
            setRecBonusAmt(0);
            setRecWarning(false);
            setRecDisciplinary('');
            setRecTraining('');
            setFormIsTransfer(false);
            setFormTransferDept('');
            setFormIsGrievance(false);
            setFormGrievanceNote('');
            setFormGrievanceResponse('');
        } else if (mode === 'edit' && app) {
            setEditingId(app.id);
            setFormEmployeeId(app.employeeId);
            setFormRoleLevel(app.roleLevel);
            setFormAppraisalPeriod(app.appraisalPeriod);
            setFormAppraisalDate(app.appraisalDate);
            setFormManagerName(app.managerName);
            setFormNotes(app.generalNotes || '');
            setFormActionPlan(app.correctiveActionPlan || '');

            setScoreEfficiency(app.criteria.efficiency.score);
            setScoreOutput(app.criteria.outputAmount.score);
            setScoreAttendance(app.criteria.attendance.score);
            setScoreCompliance(app.criteria.policyCompliance.score);
            setScoreLeadership(app.criteria.leadership.score);
            setScoreIntegrity(app.criteria.integrity.score);
            setScoreClient(app.criteria.clientCoordination.score);
            setScoreNational(app.criteria.nationalAlignment.score);

            setRecPromotion(app.recommendations.promotion);
            setRecSalaryInc(app.recommendations.salaryIncrease);
            setRecSalaryPct(app.recommendations.salaryIncreasePct);
            setRecBonus(app.recommendations.bonus);
            setRecBonusAmt(app.recommendations.bonusAmount || 0);
            setRecWarning(app.recommendations.warning);
            setRecDisciplinary(app.recommendations.disciplinaryAction || '');
            setRecTraining(app.recommendations.trainingNeeded || '');
            
            setFormIsTransfer(!!app.isTransferSubmitted);
            setFormTransferDept(app.transferTargetDept || '');
            setFormIsGrievance(!!app.isGrievanceSubmitted);
            setFormGrievanceNote(app.grievanceNote || '');
            setFormGrievanceResponse(app.grievanceResponse || '');
        }
        setActiveTab('newForm');
    };

    const handleDuplicate = (app: PerformanceAppraisal) => {
        const newApp: PerformanceAppraisal = {
            ...app,
            id: `app-dup-${Date.now()}`,
            referenceNumber: `QA-PERF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            status: 'Draft',
            appraisalDate: new Date().toISOString().split('T')[0],
            employeeName: `${app.employeeName} (نسخة مسودة)`,
            signatures: {},
        };
        setAppraisals(prev => [newApp, ...prev]);
        setActiveTab('evaluations');
    };

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا التقييم الإداري نهائياً؟')) {
            setAppraisals(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleSaveForm = (e: React.FormEvent) => {
        e.preventDefault();
        const activeEmp = employees.find(emp => emp.id === formEmployeeId);
        if (!activeEmp) return;

        const updatedModel: PerformanceAppraisal = {
            id: formMode === 'create' ? `app-new-${Date.now()}` : (editingId || ''),
            employeeId: activeEmp.id,
            employeeName: activeEmp.fullNameAr,
            employeeJobTitle: activeEmp.jobTitle,
            employeeDepartment: activeEmp.department,
            managerName: formManagerName,
            appraisalPeriod: formAppraisalPeriod,
            appraisalDate: formAppraisalDate,
            status: formMode === 'create' ? 'Draft' : (appraisals.find(x => x.id === editingId)?.status || 'Under HR Review'),
            roleLevel: formRoleLevel,
            
            attendanceAbsences: activeEmp.attendanceAbsences,
            attendanceDelays: activeEmp.attendanceDelays,
            warningsCount: activeEmp.warningsCount,
            activeGoalsCount: 2,
            basicSalary: activeEmp.basicSalary,
            allowancesAmount: activeEmp.allowancesAmount,
            civilId: activeEmp.civilId,
            joiningDate: activeEmp.joiningDate,
            nationality: activeEmp.nationality,

            criteria: {
                efficiency: { name: 'كفاءة الإنجاز والتوقيت', score: scoreEfficiency, weight: 15 },
                outputAmount: { name: 'حجم مخرجات العمل', score: scoreOutput, weight: 15 },
                attendance: { name: 'الانضباط والالتزام بالدوام', score: scoreAttendance, weight: 10 },
                policyCompliance: { name: 'الالتزام باللوائح والسياسات', score: scoreCompliance, weight: 10 },
                leadership: { name: 'التوجيه والقيادة والمبادرة', score: scoreLeadership, weight: 15 },
                integrity: { name: 'النزاهة وأخلاقيات المهنة', score: scoreIntegrity, weight: 15 },
                clientCoordination: { name: 'التواصل ورضا العملاء', score: scoreClient, weight: 10 },
                nationalAlignment: { name: 'التوطين ومواءمة التوجه الوطني', score: scoreNational, weight: 10 },
            },
            
            overallScore: calculatedOverallStats.avg,
            overallGrade: calculatedOverallStats.grade,
            generalNotes: formNotes,
            correctiveActionPlan: formActionPlan,

            recommendations: {
                promotion: recPromotion,
                salaryIncrease: recSalaryInc,
                salaryIncreasePct: recSalaryInc ? recSalaryPct : 0,
                bonus: recBonus,
                bonusAmount: recBonus ? recBonusAmt : 0,
                warning: recWarning,
                disciplinaryAction: recDisciplinary,
                trainingNeeded: recTraining,
            },

            isTransferSubmitted: formIsTransfer,
            transferTargetDept: formIsTransfer ? formTransferDept : undefined,
            isGrievanceSubmitted: formIsGrievance,
            grievanceNote: formIsGrievance ? formGrievanceNote : undefined,
            grievanceResponse: formIsGrievance ? formGrievanceResponse : undefined,

            referenceNumber: formMode === 'create' ? `QA-PERF-2026-0${appraisals.length + 5}` : (appraisals.find(x => x.id === editingId)?.referenceNumber || `QA-PERF-2026-${Math.floor(Math.random() * 100)}`),
            qrCodeData: `https://ais-adala/verify/perf/QA-PERF-2026-0${appraisals.length + 5}`,
            signatures: {
                manager: { name: formManagerName, signedAt: new Date().toISOString().split('T')[0] },
                ...(formMode === 'edit' ? appraisals.find(x => x.id === editingId)?.signatures : {})
            }
        };

        if (formMode === 'create') {
            setAppraisals(prev => [updatedModel, ...prev]);
        } else {
            setAppraisals(prev => prev.map(a => a.id === editingId ? updatedModel : a));
        }

        // Return to evaluations tab
        setActiveTab('evaluations');
    };

    const handleWorkflowChange = (requestId: string, newStatus: PerformanceAppraisalStatus) => {
        setAppraisals(prev => prev.map(app => {
            if (app.id === requestId) {
                const currentSigs = { ...app.signatures };
                
                // Dynamically apply fake signatures based on workflow
                if (newStatus === 'Signed & Completed') {
                    currentSigs.employee = { name: app.employeeName, signedAt: new Date().toISOString().split('T')[0] };
                    currentSigs.hr = { name: 'ناصر السبيعي', signedAt: new Date().toISOString().split('T')[0] };
                    currentSigs.auditor = { name: 'صبري شطا', signedAt: new Date().toISOString().split('T')[0] };
                } else if (newStatus === 'Under Financial Review') {
                    currentSigs.hr = { name: 'ناصر السبيعي', signedAt: new Date().toISOString().split('T')[0] };
                }

                return {
                    ...app,
                    status: newStatus,
                    signatures: currentSigs,
                    updatedAt: new Date().toISOString().split('T')[0]
                };
            }
            return app;
        }));

        // Refresh selected object in view modal
        const fresh = appraisals.find(x => x.id === requestId);
        if (fresh) {
            setSelectedAppraisal(prev => prev && prev.id === requestId ? { ...prev, status: newStatus } : prev);
        }
    };

    const openPrintFormDetails = (app: PerformanceAppraisal, docType: 'appraisal' | 'warning' | 'promotion' | 'transfer' | 'grievance') => {
        setSelectedAppraisal(app);
        setPrintDocType(docType);
        setIsPrintModalOpen(true);
    };

    // --- CHART DATA GENERATION ---
    const radarData = useMemo(() => {
        if (!selectedAppraisal) return [];
        return [
            { subject: 'الكفاءة', score: selectedAppraisal.criteria.efficiency.score, fullMark: 5 },
            { subject: 'المخرجات', score: selectedAppraisal.criteria.outputAmount.score, fullMark: 5 },
            { subject: 'الانضباط', score: selectedAppraisal.criteria.attendance.score, fullMark: 5 },
            { subject: 'اللوائح', score: selectedAppraisal.criteria.policyCompliance.score, fullMark: 5 },
            { subject: 'القيادة', score: selectedAppraisal.criteria.leadership.score, fullMark: 5 },
            { subject: 'التوطين', score: selectedAppraisal.criteria.nationalAlignment.score, fullMark: 5 },
        ];
    }, [selectedAppraisal]);

    const pieChartDistribution = useMemo(() => {
        const counts = { Excellent: 0, VeryGood: 0, Good: 0, Satisfactory: 0, Weak: 0 };
        appraisals.forEach(a => {
            if (a.overallGrade === 'Excellent') counts.Excellent++;
            else if (a.overallGrade === 'Very Good') counts.VeryGood++;
            else if (a.overallGrade === 'Good') counts.Good++;
            else if (a.overallGrade === 'Satisfactory') counts.Satisfactory++;
            else if (a.overallGrade === 'Weak') counts.Weak++;
        });
        return [
            { name: 'ممتاز (Excellent)', value: counts.Excellent, color: '#10B981' },
            { name: 'جيد جداً (Very Good)', value: counts.VeryGood, color: '#3B82F6' },
            { name: 'جيد (Good)', value: counts.Good, color: '#6366F1' },
            { name: 'مقبول (Satisfactory)', value: counts.Satisfactory, color: '#F59E0B' },
            { name: 'ضعيف (Weak)', value: counts.Weak, color: '#EF4444' },
        ];
    }, [appraisals]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* --- TOP HEADER NAVIGATION --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/employee-affairs" className="text-xs text-primary hover:underline font-bold">شؤون الموظفين</Link>
                            <span className="text-xs text-slate-300">/</span>
                            <span className="text-xs text-slate-400 font-bold">تقييم الأداء والقرارات الإدارية</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white">تقييم الكفاءة والطلبات الإدارية المعتمدة</h1>
                        <p className="text-slate-400 text-xs font-bold mt-1">
                            نظام رقابي ذكي متطابق مع قانون العمل الكويتي رقم 6 لسنة 2010 والقرارات الإدارية لبرنامج الهيكلة وقوى العاملة 2026
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Button variant="primary" onClick={() => handleSwitchToForm('create')} className="w-full lg:w-auto rounded-xl flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        إعداد نموذج تقييم ذكي
                    </Button>
                </div>
            </div>

            {/* --- METRIC STATS WORKSPACE --- */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                    <div className="text-slate-400 text-xs font-black">إجمالي التقييمات</div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-black text-slate-800 dark:text-white">{dashboardStats.total}</span>
                        <ClipboardList className="w-6 h-6 text-primary opacity-25" />
                    </div>
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                    <div className="text-slate-400 text-xs font-black">المعقّمة والمكتملة</div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-black text-emerald-500">{dashboardStats.signedCount}</span>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-25" />
                    </div>
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                    <div className="text-slate-400 text-xs font-black">قيد مراجعة الموارد البشرية</div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-black text-blue-500">{dashboardStats.hrCount}</span>
                        <Clock className="w-6 h-6 text-blue-500 opacity-25" />
                    </div>
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                    <div className="text-slate-400 text-xs font-black">قيد المراجعة المالية</div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-black text-purple-500">{dashboardStats.financialCount}</span>
                        <TrendingUp className="w-6 h-6 text-purple-500 opacity-25" />
                    </div>
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                    <div className="text-slate-400 text-xs font-black">التظلمات والشكاوى الإدارية</div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-black text-amber-500">{dashboardStats.grievanceCount}</span>
                        <ShieldAlert className="w-6 h-6 text-amber-500 opacity-25" />
                    </div>
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                    <div className="text-slate-400 text-xs font-black font-sans">متوسط تقييم الشركة</div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-black text-primary font-mono">{dashboardStats.avgCompanyRating}</span>
                        <Award className="w-6 h-6 text-primary opacity-25" />
                    </div>
                </Card>
            </div>

            {/* --- TAB HEADERS --- */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => setActiveTab('kpi')} className={`px-6 py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'kpi' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <BarChart3 className="w-4 h-4" />
                    لوحة تحليلات الأداء وطلبات الموظفين
                </button>
                <button onClick={() => setActiveTab('evaluations')} className={`px-6 py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'evaluations' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <ClipboardList className="w-4 h-4" />
                    إدارة تقييمات الموظفين وعقود العمل ({appraisals.length})
                </button>
                <button onClick={() => handleSwitchToForm('create')} className={`px-6 py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'newForm' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <FileText className="w-4 h-4" />
                    {formMode === 'create' ? 'نموذج تقييم جديد' : 'تعديل التقييم'}
                </button>
            </div>

            {/* --- Tab 1: KPI ANALYTICS DASHBOARD --- */}
            {activeTab === 'kpi' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts Panel */}
                    <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="توزيع درجات التقييم داخل الشركة">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-6">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieChartDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                                            {pieChartDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {pieChartDistribution.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="flex items-center gap-2 font-black text-slate-600 dark:text-slate-400">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                            {item.name}
                                        </span>
                                        <span className="font-mono font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                            {item.value} موظف
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Left Quick Compliance Vetting Grid */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="نظام الرقابة والامتثال والقسم اليدوي">
                            <div className="space-y-4 mt-4">
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/10 rounded-2xl border border-rose-100 dark:border-rose-900 flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black text-rose-800 dark:text-rose-400 uppercase">تنبيه تقصير وانخفاض الكفاءة</h4>
                                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 leading-relaxed">
                                            تم رصد تقييم بمستوى (ضعيف) للموظفة <strong className="font-black text-rose-700">سحر جاسم الفيلي</strong>. يقترح النظام إرسال إنذار أداء عمالي وحفظه كإثبات قانوني في مكتب العمل.
                                        </p>
                                        <button onClick={() => {
                                            const s = appraisals.find(a => a.employeeId === 'emp-2');
                                            if (s) openPrintFormDetails(s, 'warning');
                                        }} className="text-[10px] font-black underline text-rose-700 dark:text-rose-300 mt-2 hover:opacity-80 block text-right">
                                            إصدار ورقة إنذار قانونية معتمدة ←
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-start gap-3">
                                    <Award className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase">مستحقو الترقيات والبدلات</h4>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 leading-relaxed">
                                            الموظف ممتاز الأداء <strong className="font-black text-emerald-700">أحمد محمود العبدالله</strong> مستحق ترقية مالية بنسبة 15%. تم فحص السجل التاريخي بنجاح وتوافق 2 سنوات "ممتاز".
                                        </p>
                                        <button onClick={() => {
                                            const s = appraisals.find(a => a.employeeId === 'emp-1');
                                            if (s) openPrintFormDetails(s, 'promotion');
                                        }} className="text-[10px] font-black underline text-emerald-700 dark:text-emerald-300 mt-2 hover:opacity-80 block text-right">
                                            توليد قرار ترقية رسمي ←
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Interactive Demos Quick Launch Track */}
                    <div className="lg:col-span-3">
                        <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="النماذج الأربعة التفاعلية للتشغيل والامتحانات القانونية">
                            <p className="text-xs text-slate-400 mb-6 font-bold">انقر على الإجراءات السريعة لرؤية سير عمل المعاملات ونماذجها وسيقوم النظام بتفعيل خطوط التوقيع والأختام.</p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {appraisals.map((app) => (
                                    <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-3xl flex flex-col justify-between hover:border-primary/20 hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <Badge text={app.overallGrade === 'Excellent' ? 'ممتاز' : app.overallGrade === 'Weak' ? 'ضعيف' : app.overallGrade === 'Very Good' ? 'جيد جداً' : 'جيد'} color={app.overallGrade === 'Excellent' ? 'green' : app.overallGrade === 'Weak' ? 'rose' : 'blue'} />
                                                <span className="text-[10px] font-sans font-black text-slate-400">{app.referenceNumber}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1">{app.employeeName}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{app.employeeJobTitle} | {app.employeeDepartment}</p>
                                            
                                            {/* Status Timeline step */}
                                            <div className="mt-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                                                <div className="text-[9px] text-slate-400 font-bold">مرحلة سير العمل الحالية:</div>
                                                <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                                    {app.status === 'Signed & Completed' ? 'مكتمل واعتماد الأختام' : app.status === 'Under Financial Review' ? 'تحت التدقيق المالي وبدلات الترقية' : app.status === 'Under HR Review' ? 'تحت مراجعة إدارة الموارد البشرية والتظلمات' : 'مسودة المباشر'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-2">
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedAppraisal(app); setIsDetailsModalOpen(true); }} className="w-full text-center py-2 text-xs flex justify-center items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                عرض شاشة سير التجهيز
                                            </Button>

                                            <div className="grid grid-cols-2 gap-1.5">
                                                <Button variant="ghost" className="bg-primary/5 hover:bg-primary/10 text-primary py-2 text-[10px]" onClick={() => openPrintFormDetails(app, app.overallGrade === 'Excellent' ? 'promotion' : app.overallGrade === 'Weak' ? 'warning' : 'appraisal')}>
                                                    <Printer className="w-3 h-3 me-1" />
                                                    طباعة القانوني
                                                </Button>
                                                <Button variant="ghost" className="bg-slate-100 hover:bg-slate-200 py-2 text-[10px]" onClick={() => handleSwitchToForm('edit', app)}>
                                                    <Edit className="w-3 h-3 me-1" />
                                                    تعديل البيانات
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- TAB CONTENT: APPRAISALS --- */}
            {activeTab === 'evaluations' && (
                <div className="space-y-4">
                    {/* Filtering rails */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-50">
                        <div className="relative flex-grow">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="ابحث باسم الموظف، المسمى الوظيفي، الرقم المالي..."
                                className="w-full ps-12 pe-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select 
                                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-xs font-black px-4 py-3 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <option value="All">جميع الأقسام</option>
                                <option value="المالية">المالية</option>
                                <option value="العمليات">العمليات</option>
                                <option value="الشؤون القانونية">الشؤون القانونية</option>
                                <option value="الشركات">الشركات</option>
                            </select>

                            <select 
                                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-xs font-black px-4 py-3 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                            >
                                <option value="All">كل المستويات الوظيفية</option>
                                <option value={RoleLevel.EXECUTIVE}>التنفيذي / القيادي</option>
                                <option value={RoleLevel.MANAGERIAL}>الإداري / الإشرافي</option>
                                <option value={RoleLevel.OPERATIONAL}>التشغيلي / الخدمي</option>
                                <option value={RoleLevel.TECHNICAL}>الفني / التخصصي</option>
                            </select>
                        </div>
                    </div>

                    {/* Appraisals Grid displaying all elements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAppraisalsList.map((app) => (
                            <Card key={app.id} className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-sans font-black text-slate-400">{app.referenceNumber}</span>
                                            <Badge text={app.roleLevel === RoleLevel.EXECUTIVE ? 'قيادي' : app.roleLevel === RoleLevel.MANAGERIAL ? 'إداري' : app.roleLevel === RoleLevel.TECHNICAL ? 'تخصصي' : 'تشغيلي'} color="indigo" />
                                        </div>
                                        <h3 className="text-base font-black text-slate-800 dark:text-white">{app.employeeName}</h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">{app.employeeJobTitle} • {app.employeeDepartment}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-400">
                                            {app.appraisalPeriod}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl relative">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-400 font-bold mb-0.5">التقييم وسير التدقيق</div>
                                        <div className="text-lg font-black text-primary font-mono">{app.overallScore} / 5</div>
                                    </div>
                                    <div className="text-center border-s border-stone-200 dark:border-slate-700">
                                        <div className="text-xs text-slate-400 font-bold mb-0.5">التقدير المقابل</div>
                                        <div className="text-sm font-black text-slate-700 dark:text-slate-300">
                                            {app.overallGrade === 'Excellent' ? 'ممتاز' : app.overallGrade === 'Weak' ? 'ضعيف' : app.overallGrade === 'Very Good' ? 'جيد جداً' : 'جيد'}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[11px] text-slate-500 font-bold leading-relaxed line-clamp-2 h-9 mb-4 italic">
                                    "{app.generalNotes || 'لم تسجل أي ملاحظات رئيسية'}"
                                </div>

                                {/* Smart tags alerts on list */}
                                <div className="mb-4 space-y-1">
                                    {app.recommendations.warning && (
                                        <div className="px-3 py-1 bg-rose-50 text-rose-700 font-black text-[9px] rounded-lg flex items-center gap-1">
                                            <ShieldAlert className="w-3 h-3" />
                                            مقتبس: إنذار تقصير أداء المادة 41 مفعل
                                        </div>
                                    )}
                                    {app.isTransferSubmitted && (
                                        <div className="px-3 py-1 bg-amber-50 text-amber-700 font-black text-[9px] rounded-lg flex items-center gap-1">
                                            <ArrowRightLeft className="w-3 h-3" />
                                            طلب نقل داخلي نشط لـ {app.transferTargetDept}
                                        </div>
                                    )}
                                    {app.isGrievanceSubmitted && (
                                        <div className="px-3 py-1 bg-purple-50 text-purple-700 font-black text-[9px] rounded-lg flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            هناك تظلم إداري نشط مقدم ضد هذا التقييم
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">الحالة الحركية</span>
                                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">{app.status}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setSelectedAppraisal(app); setIsDetailsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl" title="تفاصيل السجل والمراحل">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDuplicate(app)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-xl" title="تكرار وإنتاج نسخة مسودة (Duplicate)">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleSwitchToForm('edit', app)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-xl" title="تعديل وتعديل الحقول">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(app.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-xl" title="حذف بالكامل">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {filteredAppraisalsList.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800 rounded-3xl">
                                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                <h4 className="text-sm font-black text-slate-600">لم يعثر التصفية على نتائج مطابقة</h4>
                                <p className="text-[11px] text-slate-400 font-bold mt-1">تأكد من تعديل فلاتر المستويات أو البحث بشكل صحيح.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- Tab 3: NEW / EDIT APPRAISAL FORM WORKPLACE --- */}
            {activeTab === 'newForm' && (
                <form onSubmit={handleSaveForm} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Middle Input criteria */}
                        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border-none shadow-sm space-y-6" title={formMode === 'create' ? 'صياغة نموذج تقييم أداء وتوطين ذكي جديد' : 'تحديث ملف الأداء والمستحقات والمسارات'}>
                            {/* Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">الموظف المراد تقييمه</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formEmployeeId}
                                        onChange={(e) => setFormEmployeeId(e.target.value)}
                                        required
                                        disabled={formMode === 'edit'}
                                    >
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.fullNameAr} ({emp.employeeId})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">المستوى الوظيفي وقالب التقييم</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formRoleLevel}
                                        onChange={(e) => setFormRoleLevel(e.target.value as RoleLevel)}
                                        required
                                    >
                                        <option value={RoleLevel.EXECUTIVE}>التنفيذي / القيادي (معايير استراتيجية وأرباح)</option>
                                        <option value={RoleLevel.MANAGERIAL}>الإداري / الإشرافي (مسؤوليات القيادة والمحاسبة)</option>
                                        <option value={RoleLevel.TECHNICAL}>الفني / التخصصي (دقة المخرجات والمسائل الفنية)</option>
                                        <option value={RoleLevel.OPERATIONAL}>التشغيلي / الخدمي (الانضباط والكمية والتعليمات)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">فترة التقييم السنوية</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formAppraisalPeriod}
                                        onChange={(e) => setFormAppraisalPeriod(e.target.value)}
                                        required
                                        placeholder="مثال: 2025 / 2026"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">تاريخ التقييم</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formAppraisalDate}
                                        onChange={(e) => setFormAppraisalDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamic Scoreboards for quantitative & qualitative metrics */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest border-s-4 border-primary ps-2 mb-4">
                                    تقييم المعايير الأساسية والأوزان للائحة (1 - 5)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Quantitative */}
                                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            معايير تقييم كمي (Quantitative Metrics)
                                        </h4>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'كفاءة إنجاز المهام والتوقيت', val: scoreEfficiency, set: setScoreEfficiency },
                                                { label: 'حجم المخرجات والإنتاجية', val: scoreOutput, set: setScoreOutput },
                                                { label: 'الانضباط والالتزام بالدوام الرسمي', val: scoreAttendance, set: setScoreAttendance },
                                                { label: 'مستوى الالتزام باللوائح والسياسات الداخلية', val: scoreCompliance, set: setScoreCompliance },
                                            ].map((sc, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-black">
                                                        <span className="text-slate-500">{sc.label}</span>
                                                        <span className="text-primary">{sc.val} / 5</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="1" max="5" step="0.5" 
                                                        className="w-full accent-primary cursor-pointer" 
                                                        value={sc.val} onChange={(e) => sc.set(parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Qualitative */}
                                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            معايير تقييم نوعي والتوجه الوطني (Qualitative Metrics)
                                        </h4>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'القيادة والمبادرة والتمكين الإداري', val: scoreLeadership, set: setScoreLeadership },
                                                { label: 'النزاهة والالتزام بأخلاقيات المهنة', val: scoreIntegrity, set: setScoreIntegrity },
                                                { label: 'التنسيق والتعامل مع العملاء والشركاء', val: scoreClient, set: setScoreClient },
                                                { label: 'الانتماء لبرامج التوطين والكوادر الوطنية كويتياً', val: scoreNational, set: setScoreNational },
                                            ].map((sc, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-black">
                                                        <span className="text-slate-500">{sc.label}</span>
                                                        <span className="text-emerald-600">{sc.val} / 5</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="1" max="5" step="0.5" 
                                                        className="w-full accent-emerald-500 cursor-pointer" 
                                                        value={sc.val} onChange={(e) => sc.set(parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action plan & Notes */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest border-s-4 border-primary ps-2 mb-4">
                                    الملاحظات والتوصيات التطويرية والمستقبلية
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-500">ملاحظات المدير العام المباشرة</label>
                                        <textarea 
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                            value={formNotes}
                                            onChange={(e) => setFormNotes(e.target.value)}
                                            placeholder="اكتب خلاصة تقييم السلوك والأداء المميز أو جوانب التقصير للموظف..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-500">خطة تقويم الأداء وتدريب الموظف الحركية (Corrective Action Plan)</label>
                                        <textarea 
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                            value={formActionPlan}
                                            onChange={(e) => setFormActionPlan(e.target.value)}
                                            placeholder="تحدد بالتفصيل دورات التطوير أو خطة التقويم المجدولة بالأيام في الكويت..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Left sidebar: Live Check compliance, Auto retrieved details and Recommendation toggles */}
                        <div className="space-y-6">
                            {/* Auto retrieved panel */}
                            <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-none shadow-sm" title="الاستدعاء الذكي للمتطلبات">
                                {selectedEmployeeMeta ? (
                                    <div className="space-y-3 mt-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                                        <div className="flex justify-between border-b border-stone-200 dark:border-slate-800 pb-2">
                                            <span>الراتب الأساسي الحالي:</span>
                                            <span className="text-primary font-mono font-black">{selectedEmployeeMeta.basicSalary} د.ك</span>
                                        </div>
                                        <div className="flex justify-between border-b border-stone-200 dark:border-slate-800 pb-2">
                                            <span>تاريخ الانضمام للشركة:</span>
                                            <span className="font-mono">{selectedEmployeeMeta.joiningDate}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-stone-200 dark:border-slate-800 pb-2">
                                            <span>حالات الغياب الحالية:</span>
                                            <span className={selectedEmployeeMeta.attendanceAbsences > 5 ? 'text-rose-500 font-black' : ''}>{selectedEmployeeMeta.attendanceAbsences} أيام غياب</span>
                                        </div>
                                        <div className="flex justify-between border-b border-stone-200 dark:border-slate-800 pb-2">
                                            <span>أيام تأخير الحضور:</span>
                                            <span className={selectedEmployeeMeta.attendanceDelays > 8 ? 'text-rose-500 font-black' : ''}>{selectedEmployeeMeta.attendanceDelays} دقائق/ساعات</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>سجل المخالفات/الإنذارات:</span>
                                            <span className={selectedEmployeeMeta.warningsCount > 0 ? 'text-rose-600 font-black' : 'text-emerald-500'}>
                                                {selectedEmployeeMeta.warningsCount} إنذار رسمي مسجل
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 font-bold text-center mt-4 pb-2">يرجى تحديد موظف لاستباط بياناته عمالياً.</div>
                                )}
                            </Card>

                            {/* Smart warning blocks triggered by form variables */}
                            {showPromotionRestrictionAlert && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                        <strong>تنبيه شؤون الترقية عمالياً:</strong> الموظف لا يملك تقييم أداء "Excellent الممتاز" لهذا العام. وفقاً للقرارات المنظمة بالكويت، يستحق الموظف الترقية إذا استوفى متوسط ممتاز لآخر عامين.
                                    </div>
                                </div>
                            )}

                            {showLowPerformanceWarningAlert && (
                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2.5 animate-bounce">
                                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                    <div className="text-[10px] text-rose-800 font-black leading-relaxed">
                                        <strong>توجيه إنذار أداء أول مستند عمالياً:</strong> التقييم العام يقل عن التقدير المقبول. يقترح النظام تفعيل خانة "إنذار قانوني للموظف" لتجنب إشكاليات دعاوى إنهاء الخدمة غير المبرر أمام المحكمة العمالية الكويتية.
                                    </div>
                                </div>
                            )}

                            {/* Recommendation actions */}
                            <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="القرارات والتوصيات المقترحة">
                                <div className="space-y-4 mt-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-primary rounded outline-none focus:ring-0"
                                            checked={recPromotion}
                                            onChange={(e) => {
                                                setRecPromotion(e.target.checked);
                                                if (e.target.checked) setRecSalaryInc(true); // Prom implies raised salary
                                            }}
                                        />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">يوصي بالترقية لدرجة أعلى</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-primary rounded outline-none"
                                            checked={recSalaryInc}
                                            onChange={(e) => setRecSalaryInc(e.target.checked)}
                                        />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">منح زيادة في الراتب الأساسي</span>
                                    </label>

                                    {recSalaryInc && (
                                        <div className="ps-7 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 block">نسبة الزيادة (% الأساسي)</label>
                                            <input 
                                                type="number" min="1" max="50" 
                                                className="w-24 bg-slate-50 dark:bg-slate-800 p-2 text-xs rounded-xl border-none outline-none font-black"
                                                value={recSalaryPct}
                                                onChange={(e) => setRecSalaryPct(parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    )}

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-primary rounded outline-none"
                                            checked={recBonus}
                                            onChange={(e) => setRecBonus(e.target.checked)}
                                        />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">منح مكافأة تميز (Bonus)</span>
                                    </label>

                                    {recBonus && (
                                        <div className="ps-7 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 block">المبلغ المالي مقطوع (د.ك)</label>
                                            <input 
                                                type="number" 
                                                className="w-24 bg-slate-50 dark:bg-slate-800 p-2 text-xs rounded-xl border-none outline-none font-black"
                                                value={recBonusAmt}
                                                onChange={(e) => setRecBonusAmt(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    )}

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-rose-500 rounded outline-none"
                                            checked={recWarning}
                                            onChange={(e) => {
                                                setRecWarning(e.target.checked);
                                                if (e.target.checked) setRecDisciplinary('إنذار أداء أول كتابي رسمي');
                                            }}
                                        />
                                        <span className="text-xs font-black text-rose-600">إصدار إنذار تقصير قانوني كتابي</span>
                                    </label>

                                    {recWarning && (
                                        <div className="ps-7 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 block">نص المخالفة أو صيغة الإنذار</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 dark:bg-slate-800 p-2 text-xs rounded-xl border-none outline-none font-semibold text-rose-700"
                                                value={recDisciplinary}
                                                onChange={(e) => setRecDisciplinary(e.target.value)}
                                                placeholder="إنذار أداء أول، نهائي، إلخ..."
                                            />
                                        </div>
                                    )}

                                    {/* Action items for transfer requests */}
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-amber-500 rounded outline-none"
                                            checked={formIsTransfer}
                                            onChange={(e) => setFormIsTransfer(e.target.checked)}
                                        />
                                        <span className="text-xs font-black text-amber-600">إرفاق طلب نقل قسم داخلي</span>
                                    </label>

                                    {formIsTransfer && (
                                        <div className="ps-7 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 block">القسم المستهدف للنقل إليه</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 dark:bg-slate-800 p-2 text-xs rounded-xl border-none outline-none font-black text-amber-700"
                                                value={formTransferDept}
                                                onChange={(e) => setFormTransferDept(e.target.value)}
                                                placeholder="مثل: إدارة التدقيق القانوني"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 border-t border-slate-50 pt-4 flex gap-2">
                                    <Button type="submit" variant="primary" className="flex-grow py-3 rounded-2xl text-xs font-black">
                                        {formMode === 'create' ? 'اعتماد وحفظ المسودة بالتاريخ' : 'حفظ مراجعة التغييرات'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setActiveTab('evaluations')} className="py-3 rounded-2xl text-xs font-bold">
                                        إلغاء الأمر
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </form>
            )}

            {/* --- DETAILED DIALOG WITH WORKFLOW TIMELINE --- */}
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`تفاصيل ملف الأداء وتقييم الكفاءة: ${selectedAppraisal?.employeeName}`} size="xl">
                {selectedAppraisal && (
                    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4 scrollbar-thin">
                        
                        {/* Interactive status selector for workflow testing */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase">التحكم التفاعلي في حالة سير المعاملة</h4>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">قم بتعديل الحالة لتتحرك المؤشرات وتسلسل الأنيميشن في لوحة شؤون الموظفين عمالياً.</p>
                            </div>
                            <select 
                                className="bg-white dark:bg-slate-900 text-xs font-black p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-primary"
                                value={selectedAppraisal.status}
                                onChange={(e) => handleWorkflowChange(selectedAppraisal.id, e.target.value as PerformanceAppraisalStatus)}
                            >
                                <option value="Draft">مسودة رئيس القسم المباشر (Draft)</option>
                                <option value="Pending Line Manager">معلّقة لموافقة المدير المباشر</option>
                                <option value="Under HR Review">مرفوعة لمراجعة شؤون الموظفين القانونية</option>
                                <option value="Under Financial Review">قيد المراجعة والبدلات المالية والترقيات</option>
                                <option value="Signed & Completed">مكتمل، مختوم ومعتمد بالكامل (Signed & Completed)</option>
                            </select>
                        </div>

                        {/* Interactive Rich Animations Timeline */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 block text-center">خطوات التدقيق ومسار الحركة (Workflow Stages)</h3>
                            <div className="flex flex-col md:flex-row justify-between items-center relative gap-8 md:gap-2">
                                {/* Connector horizontal line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 hidden md:block -z-0"></div>
                                <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 hidden md:block -z-0 transition-all duration-700" style={{
                                    width: selectedAppraisal.status === 'Signed & Completed' ? '100%' :
                                           selectedAppraisal.status === 'Under Financial Review' ? '75%' :
                                           selectedAppraisal.status === 'Under HR Review' ? '50%' :
                                           selectedAppraisal.status === 'Pending Line Manager' ? '25%' : '0%'
                                }}></div>

                                {[
                                    { stage: 'Draft', label: 'المباشر / مسودة' },
                                    { stage: 'Pending Line Manager', label: 'المدير المباشر' },
                                    { stage: 'Under HR Review', label: 'الموارد البشرية' },
                                    { stage: 'Under Financial Review', label: 'التفتيش المالي' },
                                    { stage: 'Signed & Completed', label: 'معتمد ومثبت' },
                                ].map((step, i) => {
                                    const stagesList = ['Draft', 'Pending Line Manager', 'Under HR Review', 'Under Financial Review', 'Signed & Completed'];
                                    const currentIdx = stagesList.indexOf(selectedAppraisal.status);
                                    const thisIdx = stagesList.indexOf(step.stage);
                                    const isPassed = thisIdx <= currentIdx;
                                    const isActive = thisIdx === currentIdx;

                                    return (
                                        <div key={i} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-500 ${isPassed ? 'bg-primary text-white scale-110' : 'bg-white text-slate-400'}`}>
                                                {isPassed ? '✓' : i + 1}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase text-center ${isActive ? 'text-primary' : isPassed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Score Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="h-48 bg-slate-50 rounded-2xl p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart outerRadius={60} data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700 }} />
                                        <Radar name="الأداء" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2 text-xs">
                                <h4 className="font-black text-slate-700 dark:text-slate-400 mb-2 border-b pb-1">تحليل درجات معايير التقييم</h4>
                                {Object.entries(selectedAppraisal.criteria).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                                        <span className="text-slate-500 font-bold">{value.name}</span>
                                        <span className="font-mono font-black text-primary">{value.score} / 5</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes and plan details display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
                                <h4 className="text-xs font-black text-primary block mb-2">ملاحظات وقرار التقييم الاستراتيجي</h4>
                                <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                                    {selectedAppraisal.generalNotes || 'لا تتوفر أي ملاحظات إجمالية.'}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
                                <h4 className="text-xs font-black text-primary block mb-2">خطة التطوير العلاجية والتقويم المجدولة</h4>
                                <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                                    {selectedAppraisal.correctiveActionPlan || 'لم تدرج أي خطط إجبارية بالقسم.'}
                                </p>
                            </div>
                        </div>

                        {/* Recommendation details & Printable Action Buttons */}
                        <div className="p-6 bg-white dark:bg-slate-900 border rounded-3xl space-y-4">
                            <h3 className="text-xs font-black text-primary uppercase">الوثائق القانونية المتاحة للطباعة المعتمدة (Adala Official printable) On Demand</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Button variant="outline" className="flex items-center gap-2 justify-center py-3 text-xs" onClick={() => openPrintFormDetails(selectedAppraisal, 'appraisal')}>
                                    <Printer className="w-4 h-4" />
                                    طباعة ورقة تقييم الأداء السنوي
                                </Button>
                                
                                {selectedAppraisal.recommendations.promotion && (
                                    <Button variant="outline" className="flex items-center gap-2 justify-center py-3 text-xs border-emerald-500 hover:bg-emerald-50" onClick={() => openPrintFormDetails(selectedAppraisal, 'promotion')}>
                                        <Printer className="w-4 h-4 text-emerald-500" />
                                        قرار ترقية وتعديل مالي رسمي
                                    </Button>
                                )}

                                {selectedAppraisal.recommendations.warning && (
                                    <Button variant="outline" className="flex items-center gap-2 justify-center py-3 text-xs border-rose-500 hover:bg-rose-50" onClick={() => openPrintFormDetails(selectedAppraisal, 'warning')}>
                                        <Printer className="w-4 h-4 text-rose-500" />
                                        كتاب إنذار تقصير أداء رسمي
                                    </Button>
                                )}

                                {selectedAppraisal.isTransferSubmitted && (
                                    <Button variant="outline" className="flex items-center gap-2 justify-center py-3 text-xs border-amber-500 hover:bg-amber-50" onClick={() => openPrintFormDetails(selectedAppraisal, 'transfer')}>
                                        <Printer className="w-4 h-4 text-amber-500" />
                                        قرار نقل موظف داخلي
                                    </Button>
                                )}

                                {selectedAppraisal.isGrievanceSubmitted && (
                                    <Button variant="outline" className="flex items-center gap-2 justify-center py-3 text-xs border-purple-500 hover:bg-purple-50" onClick={() => openPrintFormDetails(selectedAppraisal, 'grievance')}>
                                        <Printer className="w-4 h-4 text-purple-500" />
                                        تظلم إداري ومذكرة رد
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="primary" onClick={() => setIsDetailsModalOpen(false)}>إغلاق التفاصيل</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- COMPREHENSIVE LEGAL PRINTABLE TEMPLATE MODAL --- */}
            <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title="معاينة المستند الرسمي واستصدار وثيقة معتمدة" size="xl">
                {selectedAppraisal && (
                    <div className="space-y-6 max-h-[85vh] overflow-y-auto p-4 scrollbar-thin">
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                            <div className="text-[11px] text-amber-800 font-bold">
                                <strong>تنويه الطباعة:</strong> هذا المستند مجهز بتسنيق الطباعة السليم في الكويت. سيقوم المتصفح بإزالة أزرار الحواشي وعرض الأختام والرموز المائية بشكل رسمي عند الضغط على زر الطباعة.
                            </div>
                            <Button variant="primary" size="sm" onClick={() => window.print()} className="font-black text-xs shrink-0 flex items-center gap-1.5 ms-4">
                                <Printer className="w-4 h-4" />
                                إملاء أمر الطباعة للمتصفح (Print Document)
                            </Button>
                        </div>

                        {/* PRINT AREA (Fully customized styled white paper) */}
                        <div className="bg-white text-black p-10 border shadow-md font-sans rounded-3xl min-h-[29cm] relative print:border-none print:shadow-none print:p-0 select-text" style={{ direction: 'rtl' }}>
                            {/* Company watermarks absolute */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none z-0">
                                <div className="w-96 h-96 border-8 border-primary rounded-full flex items-center justify-center font-black text-3xl text-primary font-serif">
                                    ADALA PRO
                                </div>
                            </div>
                            
                            {/* Main Document Header according to Kuwait labor standards */}
                            <div className="border-b-2 border-slate-300 pb-4 flex justify-between items-center z-10 relative">
                                <div className="text-right space-y-1">
                                    <h2 className="text-lg font-black text-slate-800 font-serif">مجموعة عدالة للمحاماة والاستشارت القانونية</h2>
                                    <p className="text-[10px] text-slate-500 font-bold font-sans">قسم شؤون الموظفين والامتثال العمالي • دولة الكويت</p>
                                    <p className="text-[9px] text-slate-400 font-bold">هاتف: 965254000+ • ص.ب: 1547 الحزام الرقمي</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full border flex items-center justify-center font-black text-xs text-slate-400 mb-1">
                                        شعـار
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 inline-block uppercase tracking-wider">ADALA LEGAL GROUP</span>
                                </div>
                            </div>

                            {/* Reference & Numbers bar */}
                            <div className="my-6 flex justify-between items-center text-[10px] text-slate-500 font-bold z-10 relative bg-slate-50 p-2.5 rounded-lg">
                                <span>الرقم المرجعي المالي: {selectedAppraisal.referenceNumber}</span>
                                <span>التاريخ المعتمد: {selectedAppraisal.appraisalDate}</span>
                                <span>البلد: دولة الكويت • قانون العمل 6/2010</span>
                            </div>

                            {/* --- DYNAMIC TEMPLATES SWITCH RENDER --- */}
                            
                            {/* Template 1: Yearly Appraisal Sheet */}
                            {printDocType === 'appraisal' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-900 leading-tight">نموذج تقييم الأداء السنوي الوظيفي للعام {selectedAppraisal.appraisalPeriod}</h1>
                                    </div>

                                    {/* Personal details of employee */}
                                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 grid grid-cols-2 gap-y-3 text-xs font-semibold text-slate-700">
                                        <div>اسم الموظف كويتياً: <strong>{selectedAppraisal.employeeName}</strong></div>
                                        <div>الرقم المدني الكويتي: <strong className="font-mono">{selectedAppraisal.civilId}</strong></div>
                                        <div>المسمى الوظيفي: <strong>{selectedAppraisal.employeeJobTitle}</strong></div>
                                        <div>القسم التابع له: <strong>{selectedAppraisal.employeeDepartment}</strong></div>
                                        <div>تاريخ الدخول والتعاقد: <strong className="font-mono">{selectedAppraisal.joiningDate}</strong></div>
                                        <div>المستوى الوظيفي المربوط: <strong>{selectedAppraisal.roleLevel === RoleLevel.EXECUTIVE ? 'قيادي تنفيذي' : selectedAppraisal.roleLevel === RoleLevel.MANAGERIAL ? 'إداري إشرافي' : selectedAppraisal.roleLevel === RoleLevel.TECHNICAL ? 'تخصصي فني' : 'خدمي تشغيلي'}</strong></div>
                                    </div>

                                    {/* Grid of scores */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-black text-slate-800 border-b pb-1">أولاً: تفاصيل الدرجات والتقييم الكمي والنوعي للدور الوظيفي</h3>
                                        <table className="w-full border-collapse border border-slate-300 text-xs">
                                            <thead>
                                                <tr className="bg-slate-100">
                                                    <th className="border border-slate-300 p-2 text-right">معيار الكفاءة والتوجه الوطني لبرنامج قوى العاملة</th>
                                                    <th className="border border-slate-300 p-2 text-center w-24">الدرجة</th>
                                                    <th className="border border-slate-300 p-2 text-center w-28">الوزن الأقصى</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(selectedAppraisal.criteria).map(([key, crit]: [string, any]) => (
                                                    <tr key={key} className="hover:bg-slate-50">
                                                        <td className="border border-slate-300 p-2 font-bold">{crit.name}</td>
                                                        <td className="border border-slate-300 p-2 text-center font-mono font-black text-primary">{crit.score} / 5</td>
                                                        <td className="border border-slate-300 p-2 text-center font-mono font-medium">{crit.weight}%</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-100 font-black">
                                                    <td className="border border-slate-300 p-2 text-right">المعدل العام الموزون والتقدير الكلي المقابل لمكتب العمل الكويتي</td>
                                                    <td className="border border-slate-300 p-2 text-center font-mono text-primary text-sm">{selectedAppraisal.overallScore} / 5</td>
                                                    <td className="border border-slate-300 p-2 text-center text-emerald-600 text-[11px]">
                                                        {selectedAppraisal.overallGrade === 'Excellent' ? 'الممتاز' : selectedAppraisal.overallGrade === 'Weak' ? 'الضعيف' : selectedAppraisal.overallGrade === 'Very Good' ? 'جيد جداً' : 'جيد'}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* General comments */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-black text-slate-800 border-b pb-1">ثانياً: ملاحظات شؤون الموظفين وتوصيات الإدارة</h3>
                                        <p className="text-xs leading-relaxed text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl min-h-12 border">
                                            "{selectedAppraisal.generalNotes || 'لم تسجل أي ملاحظات مخصصة.'}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Template 2: Promotion / Salary raises letter */}
                            {printDocType === 'promotion' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-950 leading-tight block">قرار إداري رقم (QA-PROM-25) بخصوص ترقية ومنح بدل تميز موظف</h1>
                                    </div>

                                    <p className="text-xs font-bold leading-relaxed text-slate-800 font-sans text-right">
                                        إن رئيس قطاع الموارد البشرية والامتثال في مجموعة <strong className="font-black text-slate-900">عدالة للمحاماة</strong> بدولة الكويت، بعد الاطلاع على أحكام القانون رقم 6 لسنة 2010 في شأن العمل في القطاع الأهلي وتعديلاته، وبناءً على لائحة تنظيم العمل الممنوحة واعتماد لجنة الترقيات والتدقيق القانوني بالأسبوع المالي وبناءً على تقييم الأداء السنوي للموظف بمرتبة ممتاز للعامين المنصرمين:
                                    </p>

                                    <h3 className="text-sm font-black text-slate-900 underline">قررنا الآتي وعممناه مالياً:</h3>

                                    <div className="ps-4 space-y-3 text-xs leading-relaxed font-semibold text-slate-800">
                                        <div>
                                            <strong>مادة (1):</strong> يرقّى السيد / <strong className="font-black text-primary">{selectedAppraisal.employeeName}</strong>، ويعدّل مسمّاه الوظيفي المعتمد لدى الهيئة العامة للقوى العاملة في الكويت اعتباراً من الشهر القادم.
                                        </div>
                                        <div>
                                            <strong>مادة (2):</strong> يمنح الموظف المذكور زيادة مالية استثنائية على الراتب الأساسي بنسبة <strong className="font-black font-sans text-emerald-600 font-mono">{selectedAppraisal.recommendations.salaryIncreasePct}%</strong> ليصبح راتبه الكلي المربوط والمسجل في سجل الهيئة والبنك هو <strong className="font-black text-primary font-mono">{(selectedAppraisal.basicSalary * (1 + selectedAppraisal.recommendations.salaryIncreasePct / 100) + selectedAppraisal.allowancesAmount).toFixed(3)} د.ك</strong> شاملاً كافة البدلات والعلاوات المسجلة.
                                        </div>
                                        <div>
                                            <strong>مادة (3):</strong> تلتزم الإدارة المالية وعلاقات العمل بموافاة الموظف بكتاب لمن يهمه الأمر وبتسليم الختم والسجلات الموازية وبإبلاغ المؤسسة العامة للتأمينات الاجتماعية لتعديل شرائح الراتب المعتمدة رسمياً.
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <p className="text-xs font-bold text-slate-500">صدر هذا المستند آلياً ويدوياً في ديوان الإدارة - السالمية - الكويت.</p>
                                    </div>
                                </div>
                            )}

                            {/* Template 3: Warning Letter under Article 41 Kuwait Labor law */}
                            {printDocType === 'warning' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-red-700 leading-tight block">كتاب إنذار رسمي كتابي أول بتقصير الأداء ومخالفة اللوائح</h1>
                                    </div>

                                    <p className="text-xs font-bold text-slate-400 font-semibold">التاريخ: {selectedAppraisal.appraisalDate}</p>

                                    <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-800">
                                        <p>
                                            إلى الموظفة: <strong>{selectedAppraisal.employeeName}</strong> المحترمة،<br/>
                                            المسمى الوظيفي المسجل: مساعد عمليات / قسم قطاع العمليات واللوجستيك.
                                        </p>

                                        <p className="text-justify leading-relaxed">
                                            توجّه إليكم إدارة الموارد البشرية والامتثال في <strong>مجموعة عدالة للمحاماة والاستشارت القانونية</strong> هذا الإنذار الرسمي المكتوب بسبب تراجع وانخفاض كفاءة الأداء الوظيفي الخاص بكم بشكل حاد وحصولكم على تقييم سنوي بتقدير <strong className="font-black text-red-600">ضعيف (Weak) بدرجة {selectedAppraisal.overallScore} من 5</strong>، بالإضافة لتسجيل عدد <strong className="font-sans text-red-600 font-black">{selectedAppraisal.attendanceAbsences} أيام غياب غياب غير مشروع</strong> وعدد <strong className="font-sans text-red-600 font-black">{selectedAppraisal.attendanceDelays} حالات تأخير حضور</strong> دون عذر مقبول أو تقرير طبي رسمي خلال العام.
                                        </p>

                                        <p className="text-justify leading-relaxed bg-red-50 p-4 border border-red-100 rounded-2xl text-[11px] text-red-900 leading-relaxed font-bold">
                                            <strong>التبعات القانونية وفق قانون العمل الكويتي رقم 6 لسنة 2010:</strong><br/>
                                            بموجب المادة 41 والمادة 44 من العمل بالقطاع الأهلي، تعتبر هذه المعاملة إنذاراً رسمياً كتابياً أولياً. وفي حال لم يتم إبداء تحسن جوهري وملموس في دقة المعاملات والحضور والالتزام بخطة التقويم السبعينية خلال 90 يوماً من استلام هذا الإخطار، فإن الشركة تحتفظ بحقها الكامل في فسخ عقد العمل الخاص بكم مع الاحتفاظ بكافة الدفوع القانونية وحماية مصالح صاحب العمل المنصوص عليها.
                                        </p>

                                        <p>
                                            نأمل منكم الالتزام التام والتعاون مع مدير قسم العمليات لتجنب اتخاذ أي إجراءات تأديبية تصاعدية أخرى.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Template 4: Department Transfer Code */}
                            {printDocType === 'transfer' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-950 leading-tight block">قرار إداري داخلي رقم (QA-TRANS-26) بنقل موظف داخلي وتسكين مسمى</h1>
                                    </div>

                                    <p className="text-xs font-bold leading-relaxed text-slate-800 text-right">
                                        بناءً على طلب النقل الداخلي المرفوع من الموظف السيد / <strong className="font-black text-primary">{selectedAppraisal.employeeName}</strong>، وبناءً على حاجة العمل وإعادة توزيع الكوادر الإدارية لتعزيز الكفاءة وبناءً على تخرجه واعتماده، تقرر الآتي:
                                    </p>

                                    <div className="ps-4 space-y-3 text-xs leading-relaxed font-semibold text-slate-800">
                                        <div>
                                            <strong>مادة (1):</strong> نقل السيد / <strong className="font-black">{selectedAppraisal.employeeName}</strong> من موقعه وإدارته الحالية وهي <strong className="text-red-600">{selectedAppraisal.employeeDepartment}</strong> إلى الإدارة الجديدة المستهدفة وهي <strong className="text-emerald-600 font-black">{selectedAppraisal.transferTargetDept || 'إدارة التدقيق القانوني والمالي الكلي'}</strong> بذات درجته المالية وبدلاته المقررة.
                                        </div>
                                        <div>
                                            <strong>مادة (2):</strong> يسري مفعول هذا النقل والتسكين وتعديل المسؤوليات والتقارير التنظيمية اعتباراً من الدورة المالية والوظيفية لمنتصف العام تزامناً مع إخلاء طرفه رسمياً من مديره السابق.
                                        </div>
                                        <div>
                                            <strong>مادة (3):</strong> يُخطر المدقق المالي لإجراء تعديل الهيكلة التنظيمية في سجل الرواتب وإعداد ملف الرفع السحابي.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Template 5: Disciplinary Grievance Resolution */}
                            {printDocType === 'grievance' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-950 leading-tight block">قرار شؤون الموظفين في التظلم الإداري المقدم بروابط مذكرات المحكمة</h1>
                                    </div>

                                    <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-800 bg-slate-50 p-4 border rounded-2xl">
                                        <p>
                                            المتظلم: <strong>السيد / {selectedAppraisal.employeeName}</strong> (باحث قانوني • قسم الشؤون القانونية).<br/>
                                            موضوع التظلم: الطعن في التقييم السنوي للعام {selectedAppraisal.appraisalPeriod}.
                                        </p>

                                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                            <p className="text-[11px] text-purple-900 leading-relaxed font-bold">
                                                <strong>حيثيات التظلم الإداري المقيد بقسم تظلمات الموظفين:</strong><br/>
                                                "{selectedAppraisal.grievanceNote || 'تظلم من انخفاض درجات معايير المخرجات وصياغة المذكرات.'}"
                                            </p>
                                        </div>

                                        <p className="text-justify leading-relaxed">
                                            <strong>رأي لجنة شؤون الموظفين والتدقيق الكلي:</strong><br/>
                                            بعد إجراء فحص دقيق لسجلات المحكمة الكلية والتثبت من مذكرات الدفاع المكتوبة وعددها 14 مذكرة دفاع في القضايا التجارية والعمالية الكبرى، تبيّن صحّة ادعاءات الباحث القانوني. وقد أوصت لجنة التفتيش الإداري بالتعاون مع رئيس قسم التدقيق بإعادة تقدير المعايير ورفع مخرجاته ومواءمتها مع منجزاته الفعلية لتحقيق العدالة الوظيفية.
                                        </p>

                                        <p>
                                            <strong>القرار الملحق:</strong> يقبل التظلم شكلاً وموضوعاً، ويحال ملف التقييم لرئيس القسم لإعادة صياغة الدرجات وربط المستحقات المالية المناسبة.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Official Double Signature Grids & Seals & Stamp areas */}
                            <div className="mt-16 pt-10 border-t-2 border-slate-100 grid grid-cols-4 gap-4 text-center text-xs font-semibold z-10 relative no-print-bg">
                                <div className="space-y-8">
                                    <div className="text-[10px] text-slate-400 block">إعداد وتوقيع الموظف</div>
                                    <div className="italic text-slate-400 font-serif h-12 flex items-end justify-center">
                                        {selectedAppraisal.signatures.employee ? 'موقّع إلكترونياً' : '......................'}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">{selectedAppraisal.signatures.employee?.signedAt || ''}</span>
                                </div>

                                <div className="space-y-8">
                                    <div className="text-[10px] text-slate-400 block font-bold">رئيس القسم المباشر</div>
                                    <div className="italic text-indigo-300 font-serif h-12 flex items-end justify-center font-bold">
                                        {selectedAppraisal.managerName}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">{selectedAppraisal.signatures.manager?.signedAt || ''}</span>
                                </div>

                                <div className="space-y-8">
                                    <div className="text-[10px] text-slate-400 block">اعتماد وإمضاء التدقيق القانوني</div>
                                    <div className="italic text-slate-300 font-serif h-12 flex items-end justify-center">
                                        صبري شطا
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">معتمد بالختم الكلي</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[10px] text-slate-400 block">الختم وشعار مكتب الامتثال الكلي</div>
                                    <div className="flex justify-center items-center h-16">
                                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-primary/40 flex items-center justify-center font-black text-[9px] text-primary/40 text-center uppercase tracking-tighter leading-tight p-1 select-none pointer-events-none">
                                            مجموعة عدالة<br/>الكويت
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Official Footer with QR code */}
                            <div className="mt-16 pt-4 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-400 grayscale opacity-80 z-10 relative">
                                <span className="max-w-md">
                                    هذه الوثيقة رسمية ومعاقب على تزويرها جنائياً بموجب القانون الكويتي رقم 31 لسنة 1970 بتعديل قانون الجزاء. يرجى التحقق من صحة المستند وتتبع رمز الاستجابة السريع لمصادقة شؤون الموظفين.
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="space-y-1 font-sans text-right">
                                        <span className="block font-black">QR Verification Code</span>
                                        <span className="block text-[7px] text-slate-500 font-mono">ID: {selectedAppraisal.id}</span>
                                    </div>
                                    <div className="w-10 h-10 border bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-300 p-0.5 font-mono">
                                        QR CO
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>إغلاق المعاينة</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeePerformancePage;
