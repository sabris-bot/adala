import React, { useState, useMemo, useEffect } from 'react';
import { 
    Scale, AlertTriangle, ShieldCheck, FileText, CheckCircle2, Search, PlusCircle, 
    Trash2, Printer, Eye, BarChart2, ShieldAlert, Award, FileSpreadsheet, Undo2, Ban,
    HeartHandshake, ChevronRight, Check, X, FilePlus, HelpCircle
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';

// -----------------------------------------------------------------
// 1. TYPES & JURISDICTION CONSTRAINTS (KUWAIT LABOR LAW NO 6 OF 2010)
// -----------------------------------------------------------------
export enum DisciplinaryActionStatus {
    PENDING = 'قيد المراجعة والمصادقة',
    APPROVED = 'معتمد وساري الصرف والخصم',
    APPEALED = 'مقدم تظلم واعتراض',
    CANCELLED = 'مُلغى بقرار تظلم تصحيحي'
}

export interface DisciplinaryRecord {
    id: string;
    recordNumber: string;
    employeeId: string;
    employeeName: string;
    employeeJobTitle: string;
    employeeDepartment: string;
    violationType: string;
    violationDate: string;
    relatedInvestigationNo: string;
    sanctionType: string;
    deductionDays?: number;
    details: string;
    status: DisciplinaryActionStatus;
    issueDate: string;
    appealDeadlineDate: string;
    appealsLogs?: {
        appealDate: string;
        reason: string;
        status: 'pending' | 'accepted' | 'rejected';
        comments?: string;
    };
    createdAt: string;
    customDocTemplateContent?: string;
}

// Kuwaiti Labor Law Limits Rules Engine
const KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS = {
    maxDeductionDaysPerViolation: 5, // Maximum 5 days per single infraction
    maxDeductionDaysPerMonth: 10,   // Maximum 10 days cumulative deduction per month
    investigationRequiredBeforeDeduction: true,
    appealPeriodDays: 15 // 15 days from issue date to file a grievance
};

// Violation catalog linked to standard legal outcomes under Kuwaiti Law
const VIOLATIONS_LAW_CATALOG = [
    { type: 'تأخير متكرر عن الصباح', basePenalty: 'لفت نظر شفهي ثم لفت كتابي', maxDays: 1, text: 'وفق لائحة العمل الموحدة، يتدرج التنبيه من لفت نظر شفهي إلى خصم ربع يوم ثم نصف يوم في حال التكرار الرابع.' },
    { type: 'غياب بدون أعذار مقبولة', basePenalty: 'خصم يوم ونصف عمل لكل يوم غياب', maxDays: 5, text: 'يعاقب العامل مخصوماً من أجره مدة الغياب الفعلية بالإضافة إلى لفت نظر إنذار كتابي بالفصل بعد 7 أيام متواصلة.' },
    { type: 'إهمال وتلف بالعهد الإدارية', basePenalty: 'خصم قيمة التلف بالإضافة لإنذار', maxDays: 5, text: 'بموجب المادة 41، يحق لصاحب العمل إلزام العامل بسداد التلفيات وقيد خصم يصل لمقدار 5 أيام حد أقصى شهرياً.' },
    { type: 'مشادات كلامية وسلوك فظ', basePenalty: 'خصم من يوم إلى 3 أيام مع التنبيه', maxDays: 3, text: 'المشادات تخل ببروتوكول السلوك في المرفق القضائي وتبرر الخصم مع لفت النظر الإداري كتابياً.' },
    { type: 'إفشاء السرية وتسريب البيانات', basePenalty: 'فصل تأديبي فوري دون مكافأة', maxDays: 0, text: 'المادة 41 البند (د)، يعتبر تسريب أسرار المنشأ ومناقصاتها إخلالاً جسيماً يبيح الفصل الفوري وحرمان العمال مكافأة الخدمة.' },
    { type: 'مخالفات نظم المعلومات والحساب', basePenalty: 'إيقاف مؤقت عن العمل لمدة 10 أيام', maxDays: 5, text: 'الولوج غير المصرح به للأنظمة يدخل تحت بند خيانة قواعد الأمان ويعرض الموظف للإيقاف وحرمان نصف الراتب طوال التحقيق.' }
];

// -----------------------------------------------------------------
// 2. MOCK DATA INITIAL SEED (3 REALISTIC CASES)
// -----------------------------------------------------------------
const mockDisciplinarySeed: DisciplinaryRecord[] = [
    {
        id: 'da-101',
        recordNumber: 'QA-DISC-2026-001',
        employeeId: 'emp-101',
        employeeName: 'فاطمة علي حسين السيد',
        employeeJobTitle: 'مهندس تنفيذ وبناء أول',
        employeeDepartment: 'قسم الاستشارات والشركات',
        violationType: 'إفشاء السرية وتسريب البيانات',
        violationDate: '2026-05-15',
        relatedInvestigationNo: 'QA-INV-2026-001',
        sanctionType: 'خصم من الراتب',
        deductionDays: 3,
        details: 'بناءً على نتائج لجنة التحقيق العمالية رقم QA-INV-2026-001، ثبت إهمال الموظفة في تصدير ملفات مناقصات سرية على بريد شخصي، وتم قيد جزاء الخصم المالي المتناسب.',
        status: DisciplinaryActionStatus.APPROVED,
        issueDate: '2026-05-18',
        appealDeadlineDate: '2026-06-02',
        createdAt: '2026-05-18'
    },
    {
        id: 'da-102',
        recordNumber: 'QA-DISC-2026-002',
        employeeId: 'emp-103',
        employeeName: 'بدر فهد المطيري',
        employeeJobTitle: 'مندوب ومتابع قضايا المحاكم',
        employeeDepartment: 'قسم التقاضي والمحاكم',
        violationType: 'تأخير متكرر عن الصباح',
        violationDate: '2026-04-10',
        relatedInvestigationNo: 'QA-INV-2026-003',
        sanctionType: 'إنذار كتابي نهائي رسمي',
        deductionDays: 0,
        details: 'الغياب والتأخير المستمر في استلام ملفات الإعلانات القضائية بمحكمة الفروانية والذي ترتب عليه تأخر إنجاز دفاع القضايا.',
        status: DisciplinaryActionStatus.APPEALED,
        issueDate: '2026-04-15',
        appealDeadlineDate: '2026-04-30',
        appealsLogs: {
            appealDate: '2026-04-20',
            reason: 'تأخر استلام المعاملة كان بداعي حدوث عطل شامل لنظم التسجيل الإلكتروني بوزارة العدل (بوابة السداد الموحد) وصبرت بالمحكمة لتسجيله يدوياً.',
            status: 'pending',
            comments: 'جاري تأكيد عطل النظم من وزارة العدل Kuwait عبر البوابة الذكية.'
        },
        createdAt: '2526-04-15'
    },
    {
        id: 'da-103',
        recordNumber: 'QA-DISC-2026-033',
        employeeId: 'emp-102',
        employeeName: 'أحمد محمود مبارك',
        employeeJobTitle: 'محاسب الخزانة والعهدة الرئيسية',
        employeeDepartment: 'الإدارة المالية',
        violationType: 'المخالفات المالية وعجز الخزينة',
        violationDate: '2026-05-10',
        relatedInvestigationNo: 'QA-INV-2026-002',
        sanctionType: 'خصم من الراتب',
        deductionDays: 4,
        details: 'رصد عجز نقدي بالصندوق أثناء الجرد الميداني المقدر بـ 150 د.ك، وتأخر الموظف في تسويتها رقمياً ودفترياً.',
        status: DisciplinaryActionStatus.PENDING,
        issueDate: '2026-05-28',
        appealDeadlineDate: '2026-06-12',
        createdAt: '2026-05-28'
    }
];

// -----------------------------------------------------------------
// 3. 8 OFFICIAL DISCIPLINARY LETTER TEMPLATES
// -----------------------------------------------------------------
const DISCIPLINARY_TEMPLATES = [
    { id: 'verbal_warn', title: '1. لفت نظر مسلكي شفهي للموظف', text: (c: DisciplinaryRecord) => `لفت نظر شفهي أول:\nإلى السيد/ ${c.employeeName} المحترم\nنود إعلامكم شفهياً بأهمية الالتزام التام بقواعد الانضباط والدوام ومواعيد الحضور داخل مقر العمل بمكتب الوقيان والعبدالله للمحاماة، وتجنب المخالفة المتكررة مستقبلاً تفادياً لقيد جزاء مالي بالملف.` },
    
    { id: 'concern', title: '2. كتاب لفت نظر / تنبيه خطي أولي', text: (c: DisciplinaryRecord) => `خطاب تنبيه خطي أولي وعاجل:\nبناءً على الفحوصات واللوائح والتحقيق، تم رصد المخالفة التالية بحقكم:\n- موضوع المخالفة: ${c.violationType}\n- تاريخها: ${c.violationDate}\nلذا ننبهكم بضرورة مراعاة الدقة وعقد الصلة السليمة في تسيير أعمال الإدارة والتقيد الصارم بأوردا الخدمة عمالياً.` },
    
    { id: 'written_warn', title: '3. إنذار مسلكي كتابي نهائي رسمي', text: (c: DisciplinaryRecord) => `إنذار خطي كتابي رسمي ونهائي:\nإلى السيد الموظف: ${c.employeeName} الرقم الوظيفي: ${c.employeeId}\nلقد تقرر توجيه هذا الإنذار الكتابي النهائي لتكراركم القيام بـ: ${c.violationType}، بالرغم من لفت انتباهكم مسبقاً. وننبه بأنه في حال استمرار أو تكرار الواقعة، سنكون مضطرين لاتخاذ تدابير لائحية مغلظة بموجب مادة 102 قد تصل إلى الفصل مع وقف الراتب والمستحقات.` },
    
    { id: 'pledge', title: '4. وثيقة تعهد كتابي بعدم تكرار المخالفة', text: (c: DisciplinaryRecord) => `وثيقة تعهد والتزام كتابي يدوياً:\nأنا الموقع أدناه الموظف: ${c.employeeName}، الحامل للرقم المدني الموثق بشؤون التوظيف، أتعهد بموجب هذا المستند بعدم تكرار ارتكاب الواقعة الخاصة بـ: ${c.violationType} والالتزام ببروتوكول الأمان المهني للمكتب عمالياً بالحياد المطلق.` },
    
    { id: 'wage_deduct', title: '5. قرار توقيع جزاء خصم مالي من الراتب', text: (c: DisciplinaryRecord) => `قرار رسمي بتطبيق جزاء الخصم المالي من المرتب:\nالسادة قطاع المالية والحسابات بمكتب الوقيان والعبدالله\nتقرر توقيع جزاء الخصم المالي الفعلي على الموظف السيد/ ${c.employeeName}\nالمخالفة المقيدة: ${c.violationType}، والتحقيق المرتبط: ${c.relatedInvestigationNo}\n- مقدار العقوبة: خصم ما يعادل (${c.deductionDays || 3}) أيام من الأجر الأساسي للشهر الحالي، مع الحفاظ على حقوقه في التظلم عمالياً خلال 15 يوماً.` },
    
    { id: 'suspension', title: '6. قرار إيقاف موقت عن العمل مع وقف الأجر', text: (c: DisciplinaryRecord) => `قرار إيقاف تأديبي مؤقت عن العمل لغايات التحقيق المالي:\nبموجب المادة 58 من قانون العمل الكويتي والظروف الاستثنائية للامتثال، تقرر إيقاف الموظف السيد/ ${c.employeeName} بوظيفة ${c.employeeJobTitle} عن مباشرة العمل مؤقتاً لمدة (10 أيام) تبدأ من تاريخ الصدور، مع وقف صرف نصف أجره الأساسي معلقاً بانتهاء تحقيقات لجنة التفتيش القضائي بالمنشأة.` },
    
    { id: 'grievance_form', title: '7. استمارة قيد تظلم واعتراض يدوياً من موظف', text: (c: DisciplinaryRecord) => `الطلب الرسمي للتظلم والاعتراض العمالي:\nإلى الشؤون الإدارية بمكتب الوقيان والعبدالله للمحاماة\nأنا الموظف: ${c.employeeName}\nأتقدم رسمياً بهذا التظلم ضد القرار المسلكي الصادر بـ (${c.sanctionType}) برقم ${c.recordNumber}، مبروزاً دفاعي ومحاوره كالتالي: (يرجى تدوين أسباب التظلم والدفاع عمالياً بوضوح قبل تقديمه للبت).` },
    
    { id: 'appeal_decision', title: '8. قرار البت في التظلم المقدم وإلغاء العقوبة', text: (c: DisciplinaryRecord) => `قرار قانوني بخصوص البت في التظلم المقدم:\nبعد مراجعة عريضة الدفاع القانونية وبطاقات الأعذار المقدمة من الموظف السيد/ ${c.employeeName} بشأن الجزاء رقم ${c.recordNumber}.\nتقرر:\n- قبول التظلم وقبول الاعتذار المقدم شكلاً وموضوعاً\n- إلغاء قرار توقيع العقوبة وتبرئة ملف الموظف نهائياً مع تعويضه عمالياً والمال الموقوف.` }
];

const DisciplinaryActionsPage: React.FC = () => {
    const { addToast } = useToast();

    // ----------------------------------------------------
    // 4. STORAGE LOGICS SYNCHRONIZATION
    // ----------------------------------------------------
    const [employees, setEmployees] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return [];
    });

    const [activeInvestigations, setActiveInvestigations] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_investigations');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return [];
    });

    const [records, setRecords] = useState<DisciplinaryRecord[]>(() => {
        const stored = localStorage.getItem('alwagayan_disciplinary');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return mockDisciplinarySeed;
    });

    useEffect(() => {
        localStorage.setItem('alwagayan_disciplinary', JSON.stringify(records));
    }, [records]);

    // ----------------------------------------------------
    // 5. VIEW & FILTER STATES
    // ----------------------------------------------------
    const [activeRecordId, setActiveRecordId] = useState<string>(records[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'index' | 'new_sanction' | 'rules_engine' | 'appeals' | 'analytics' | 'print'>('index');

    // Formulation fields for creating dynamic sanction
    const [newEmpId, setNewEmpId] = useState('');
    const [newViolation, setNewViolation] = useState('');
    const [newInvesNo, setNewInvesNo] = useState('');
    const [newSanctionType, setNewSanctionType] = useState('خصم من الراتب');
    const [newDeductDays, setNewDeductDays] = useState(3);
    const [newDetails, setNewDetails] = useState('');

    // Appeal/grievance intake inputs
    const [appealText, setAppealText] = useState('');

    // Dynamic pre-print editor state
    const [selectedTemplateId, setSelectedTemplateId] = useState('written_warn');
    const [editorText, setEditorText] = useState('');

    // Match selected record for sidebar
    const selectedRecord = useMemo(() => {
        return records.find(r => r.id === activeRecordId) || records[0];
    }, [records, activeRecordId]);

    // Fill print text editor
    useEffect(() => {
        if (selectedRecord) {
            const template = DISCIPLINARY_TEMPLATES.find(t => t.id === selectedTemplateId);
            if (template) {
                setEditorText(selectedRecord.customDocTemplateContent || template.text(selectedRecord));
            }
        }
    }, [selectedRecord, selectedTemplateId]);

    // ----------------------------------------------------
    // 6. DASHBOARD & ANALYTICAL CALCULATIONS
    // ----------------------------------------------------
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = 
                r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.violationType.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [records, searchQuery, statusFilter]);

    // Metrics for analytics
    const metrics = useMemo(() => {
        const total = records.length;
        const pending = records.filter(r => r.status === DisciplinaryActionStatus.PENDING).length;
        const approved = records.filter(r => r.status === DisciplinaryActionStatus.APPROVED).length;
        const appealed = records.filter(r => r.status === DisciplinaryActionStatus.APPEALED).length;

        // Count violations types
        const counts: Record<string, number> = {};
        records.forEach(r => { counts[r.violationType] = (counts[r.violationType] || 0) + 1; });
        const violationData = Object.keys(counts).map(k => ({ name: k, value: counts[k] }));

        return { total, pending, approved, appealed, violationData };
    }, [records]);

    // ----------------------------------------------------
    // 7. BUSINESS RULE & ACTIONS TRIGGERS
    // ----------------------------------------------------
    const handleCreateSanction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmpId || !newViolation) {
            addToast({ type: 'warning', title: 'بيان ناقص', message: 'يرجى اختيار الموظف المعني ونوع الواقعة لتوليد السند.' });
            return;
        }

        // Smart rules engine validation under Kuwaiti Law
        if (newSanctionType === 'خصم من الراتب' && newDeductDays > KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS.maxDeductionDaysPerViolation) {
            addToast({ 
                type: 'error', 
                title: 'تجاوز حدود القانون الكويتي', 
                message: `مادة 102 تحظر خصم أكثر من ${KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS.maxDeductionDaysPerViolation} أيام من أجر الموظف للمخالفة الواحدة.` 
            });
            return;
        }

        const selectedEmp = employees.find(emp => emp.id === newEmpId) || { fullNameAr: 'موظف مجهول', jobTitle: 'إداري', department: 'العمليات' };
        const recordIdNo = `QA-DISC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

        const newRec: DisciplinaryRecord = {
            id: `da-new-${Date.now()}`,
            recordNumber: recordIdNo,
            employeeId: newEmpId,
            employeeName: selectedEmp.fullNameAr || selectedEmp.fullName || 'موظف مجهول',
            employeeJobTitle: selectedEmp.jobTitle || 'موظف',
            employeeDepartment: selectedEmp.department || 'العمليات',
            violationType: newViolation,
            violationDate: new Date().toISOString().split('T')[0],
            relatedInvestigationNo: newInvesNo || 'غائب (بلا لجنة رسمية)',
            sanctionType: newSanctionType,
            deductionDays: newSanctionType === 'خصم من الراتب' ? newDeductDays : 0,
            details: newDetails || `سند وعقوبة مسلكية طبقاً للوائح الانضباط المعمول بها.`,
            status: DisciplinaryActionStatus.PENDING,
            issueDate: new Date().toISOString().split('T')[0],
            appealDeadlineDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days
            createdAt: new Date().toISOString().split('T')[0]
        };

        const updatedRecords = [newRec, ...records];
        setRecords(updatedRecords);
        setActiveRecordId(newRec.id);
        setActiveWorkspaceTab('index');

        // Clear values
        setNewDetails('');
        setNewInvesNo('');

        // Sync back Warning tags to employee files inside localStorage
        const updatedEmployees = employees.map(emp => {
            if (emp.id === newEmpId) {
                const arr = emp.disciplinaryActions || [];
                return {
                    ...emp,
                    disciplinaryActions: [
                        ...arr,
                        {
                            id: newRec.id,
                            violationDate: newRec.violationDate,
                            violationType: newRec.violationType,
                            violationDetails: newRec.details,
                            penalty: newRec.sanctionType,
                            status: 'Pending'
                        }
                    ]
                };
            }
            return emp;
        });
        setEmployees(updatedEmployees);
        localStorage.setItem('alwagayan_employees', JSON.stringify(updatedEmployees));

        addToast({ type: 'success', title: 'تم فتح سند عقوبة', message: `تم قيد السند رقم ${recordIdNo} وإحالته للمصادقة المباشرة.` });
    };

    const handleApproveSanction = (recordId: string) => {
        const updated = records.map(r => {
            if (r.id === recordId) {
                return { ...r, status: DisciplinaryActionStatus.APPROVED };
            }
            return r;
        });
        setRecords(updated);
        addToast({ type: 'success', title: 'تم المصادقة', message: 'بموجب الاعتماد، تم إشعار الحسابات بتنزيل الجزاء المالي من راتب الموظف للشهر الحالي.' });
    };

    const handleSubmitAppeal = (recordId: string) => {
        if (!appealText) return;
        const updated = records.map(r => {
            if (r.id === recordId) {
                return {
                    ...r,
                    status: DisciplinaryActionStatus.APPEALED,
                    appealsLogs: {
                        appealDate: new Date().toISOString().split('T')[0],
                        reason: appealText,
                        status: 'pending' as const
                    }
                };
            }
            return r;
        });
        setRecords(updated);
        setAppealText('');
        addToast({ type: 'success', title: 'تم استلام التظلم والاستدلال', message: 'تم قيد التظلم وإحالته للمراجعة القانونية المستقلة لمطابقة تبرير الموظف.' });
    };

    const handleProcessAppeal = (recordId: string, verdict: 'accept' | 'reject') => {
        const updated = records.map(r => {
            if (r.id === recordId && r.appealsLogs) {
                return {
                    ...r,
                    status: verdict === 'accept' ? DisciplinaryActionStatus.CANCELLED : DisciplinaryActionStatus.APPROVED,
                    appealsLogs: {
                        ...r.appealsLogs,
                        status: verdict === 'accept' ? ('accepted' as const) : ('rejected' as const),
                        comments: verdict === 'accept' ? 'تم قبول عذر الدفاع العمالي وإلغاء استقطاع الخصم المالي.' : 'تم رفض مستند الاعتراض وتثبيت الجزاء بموجب مادة 102.'
                    }
                };
            }
            return r;
        });
        setRecords(updated);
        addToast({ 
            type: 'info', 
            title: 'تم الفصل بطلب الاعتراض', 
            message: verdict === 'accept' ? 'تم قبول التظلم وإسقاط العقوبة الإدارية.' : 'تم تثبيت توقيع العقوبة على الشاكي.' 
        });
    };

    const handleDeleteRecord = (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف وإلغاء هذه العقوبة نهائياً ومسحها من سجلات شؤون الموظفين؟')) return;
        setRecords(records.filter(r => r.id !== id));
        addToast({ type: 'success', title: 'تم الإلغاء نهائياً', message: 'تم إسقاط السجل من لوحة الجزاءات عمالياً.' });
    };

    const handleSaveCustomDocument = () => {
        const updated = records.map(r => {
            if (r.id === activeRecordId) {
                return {
                    ...r,
                    customDocTemplateContent: editorText
                };
            }
            return r;
        });
        setRecords(updated);
        addToast({ type: 'success', title: 'تم حفظ التعديلات', message: 'تم تدوين التعديلات وحفظها في سند المطبوع لعدالة.' });
    };

    const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-12 font-sans" style={{ direction: 'rtl' }}>
            
            {/* Top branded Header bar */}
            <div className="bg-slate-900 text-white border-b border-amber-600/30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Scale className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                بوابـة عـدالة للجزاءات والتظلمات العمالية
                            </span>
                            <h1 className="text-2xl font-black tracking-tight">منظومة إدارة وتنسيق الجزاءات التأديبية</h1>
                            <p className="text-xs text-slate-400">مراجعة المحاضر، البت بنماذج الاستكشاف، توجيه الإنذارات الكتابية واللفظية لضمان العدالة والامتثال للقانون الكويتي.</p>
                        </div>
                        <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-right">
                            <p className="text-[10px] text-slate-400 font-semibold block">سندات الانضباط ومحاربة التقصير</p>
                            <p className="text-xs font-black text-white">الوقيان والعبدالله والشركاء للمحاماة</p>
                            <p className="text-[9px] text-amber-400 font-mono font-bold mt-1">تاريخ المعاملات: {new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard and sections layout */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                
                {/* Visual Workspace Sub-navigation bar */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white border p-3 rounded-2xl gap-3 shadow-sm select-none">
                    <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {[
                            { id: 'index', label: 'سجل القرارات التأديبية', icon: <FileText className="w-4 h-4"/> },
                            { id: 'new_sanction', label: 'إصدار قرار تأديب جديد', icon: <PlusCircle className="w-4 h-4"/> },
                            { id: 'rules_engine', label: 'محاكاة عقوبات قانون العمل', icon: <HelpCircle className="w-4 h-4"/> },
                            { id: 'appeals', label: 'تظلمات واعتراضات الموظفين', icon: <Undo2 className="w-4 h-4" /> },
                            { id: 'analytics', label: 'الرسومات والتقارير التحليلية', icon: <BarChart2 className="w-4 h-4" /> },
                            { id: 'print', label: 'محرر طباعة النماذج الـ 8', icon: <Printer className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveWorkspaceTab(tab.id as any)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap border transition-all ${activeWorkspaceTab === tab.id ? 'bg-amber-500 border-amber-500 text-slate-950 shadow font-black' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto items-center">
                        <div className="relative flex-grow md:flex-initial">
                            <input 
                                placeholder="بحث الموظف، السند..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full md:w-56 text-right focus:bg-white focus:outline-none"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>
                </div>

                {/* Subview router container */}
                <div className="space-y-6">
                    
                    {/* TAB INDEX: RECORDS DIRECTORIES */}
                    {activeWorkspaceTab === 'index' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left panel listing indices */}
                            <div className="lg:col-span-1 space-y-3">
                                <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-1.5 shadow-sm">
                                    <h3 className="text-xs font-black flex items-center gap-1">
                                        <Award className="w-4 h-4 text-amber-400 animate-pulse" />
                                        سندات الانضباط القانوني
                                    </h3>
                                    <p className="text-[10px] text-slate-400">يرجى الاختيار لعرض التفاصيل وتنزيل وطباعة السندات المعتمدة.</p>
                                </div>

                                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {filteredRecords.map(r => {
                                        const isAct = r.id === activeRecordId;
                                        return (
                                            <div 
                                                key={r.id}
                                                onClick={() => {
                                                    setActiveRecordId(r.id);
                                                    setSelectedTemplateId(r.sanctionType === 'خصم من الراتب' ? 'wage_deduct' : 'written_warn');
                                                }}
                                                className={`p-4 text-right rounded-2xl border cursor-pointer relative transition-all ${isAct ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20' : 'bg-white hover:bg-slate-50 border-slate-250'}`}
                                            >
                                                <div className="flex justify-between items-start gap-1">
                                                    <span className="text-[10px] font-mono font-bold text-slate-400">{r.recordNumber}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${r.status === DisciplinaryActionStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.status === DisciplinaryActionStatus.APPEALED ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{r.status}</span>
                                                </div>
                                                <h4 className="text-xs font-black text-slate-900 mt-2 line-clamp-1">{r.violationType}</h4>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1">المنذر: {r.employeeName}</p>
                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-slate-100">
                                                    <span className="text-[9px] text-slate-400 font-bold">العقوبة: {r.sanctionType}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRecord(r.id); }} className="text-red-500 hover:text-red-700 p-1 rounded-md">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right panel showing card details of specific record */}
                            <div className="lg:col-span-2">
                                {selectedRecord ? (
                                    <div className="bg-white border rounded-3xl p-6 space-y-6 shadow-sm">
                                        <div className="border-b pb-4 flex justify-between items-start">
                                            <div className="space-y-1 text-right">
                                                <span className="text-[10px] font-mono font-bold text-slate-400">سجل انضباط معتمد دولي</span>
                                                <h2 className="text-base font-black text-slate-900">{selectedRecord.employeeName} - {selectedRecord.employeeJobTitle}</h2>
                                                <p className="text-xs text-slate-500">القسم: {selectedRecord.employeeDepartment} • المرجع: {selectedRecord.recordNumber}</p>
                                            </div>
                                            {selectedRecord.status === DisciplinaryActionStatus.PENDING && (
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="bg-emerald-600 border-none font-black text-xs text-white" 
                                                    onClick={() => handleApproveSanction(selectedRecord.id)}
                                                >
                                                    مصادقة واعتماد العقوبة لائحياً
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-xs font-bold leading-relaxed text-right">
                                                <span className="text-[10px] font-black text-amber-700 block mb-1">تفاصيل الواقعة ومطابقتها</span>
                                                <p><strong>نوع المخالفة:</strong> {selectedRecord.violationType}</p>
                                                <p><strong>تاريخ حدوث المخالفة:</strong> {selectedRecord.violationDate}</p>
                                                <p><strong>لجنة التحقيق المرتبطة:</strong> {selectedRecord.relatedInvestigationNo}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-xs font-bold leading-relaxed text-right">
                                                <span className="text-[10px] font-black text-indigo-700 block mb-1">القرار والجزاء المفروض</span>
                                                <p><strong>الجزاء المتفق:</strong> {selectedRecord.sanctionType}</p>
                                                {selectedRecord.deductionDays ? <p><strong>أيام استقطاع الراتب:</strong> {selectedRecord.deductionDays} د.ك أيام عمل</p> : null}
                                                <p><strong>تاريخ الإصدار والنفاذ:</strong> {selectedRecord.issueDate}</p>
                                            </div>
                                        </div>

                                        <Card className="p-4 border border-dashed border-slate-200">
                                            <h4 className="text-[11px] font-black text-indigo-900 block mb-1">حيثيات القرار والأدلة المطبقة:</h4>
                                            <p className="text-xs font-medium leading-relaxed font-sans text-slate-700">{selectedRecord.details}</p>
                                        </Card>

                                        {/* Grievance intake within details */}
                                        {selectedRecord.status !== DisciplinaryActionStatus.CANCELLED && (
                                            <Card className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                                                <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                                    <Undo2 className="w-4 h-4 animate-bounce" />
                                                    تسجيل تظلم أو اعتراض للموظف (مهلة الاستئناف لـ 15 يوماً):
                                                </h4>
                                                
                                                {selectedRecord.appealsLogs ? (
                                                    <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2 text-xs font-bold leading-relaxed">
                                                        <div className="flex justify-between items-center border-b pb-1">
                                                            <span className="text-slate-500">تاريخ التقديم: {selectedRecord.appealsLogs.appealDate}</span>
                                                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200">{selectedRecord.appealsLogs.status === 'pending' ? 'جاري الدراسة' : 'تم البت فيه'}</span>
                                                        </div>
                                                        <p><strong>أسباب اعتراض الموظف:</strong> {selectedRecord.appealsLogs.reason}</p>
                                                        {selectedRecord.appealsLogs.comments ? <p className="text-emerald-700 border-t pt-1 font-black"><strong>القرار النهائي للتظلم (الإدارة العامة):</strong> {selectedRecord.appealsLogs.comments}</p> : null}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <textarea 
                                                            className="w-full text-xs font-bold border rounded-lg p-2 bg-white"
                                                            rows={2}
                                                            placeholder="اكتب أسباب وحيثيات اعتراض الموظف وعقد دفاعه وتبرير الغياب لتقديمه للجنة ..."
                                                            value={appealText}
                                                            onChange={e => setAppealText(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex justify-end">
                                                            <Button variant="outline" size="sm" onClick={() => handleSubmitAppeal(selectedRecord.id)}>تقديم التظلم للجنة العليا</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white text-center p-12 rounded-3xl border text-slate-400 font-bold">يرجى قيد واختيار عقوبة لعرض تفاصيلها.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB NEW: SANCTION MAKER FORM */}
                    {activeWorkspaceTab === 'new_sanction' && (
                        <Card className="max-w-2xl mx-auto p-6 bg-white border rounded-3xl shadow-sm text-right">
                            <h3 className="text-sm font-black text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                <FilePlus className="w-5 h-5 text-amber-600 animate-pulse" />
                                قيد وصياغة قرار جزاء تأديبي جديد
                            </h3>
                            <form onSubmit={handleCreateSanction} className="space-y-4 text-xs font-bold text-slate-700 leading-relaxed text-right">
                                
                                <div>
                                    <label className="block mb-1.5 font-bold">1. اختر الموظف لفرض العقوبة لائحياً:</label>
                                    <select 
                                        className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50"
                                        value={newEmpId}
                                        onChange={e => setNewEmpId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- يرجى اختيار الموظف عاجلاً --</option>
                                        <option value="emp-101">فاطمة علي حسين السيد (مهندس أول)</option>
                                        <option value="emp-102">أحمد محمود مبارك (محاسب الخزانة)</option>
                                        <option value="emp-103">بدر فهد المطيري (مندوب محاكم)</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.fullNameAr} ({emp.jobTitle})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5 font-bold">2. نوع المخالفة المقودة قانونياً:</label>
                                        <select 
                                            className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50"
                                            value={newViolation}
                                            onChange={e => setNewViolation(e.target.value)}
                                            required
                                        >
                                            <option value="">-- اختر نوع المخالفة لربط المسلكي --</option>
                                            <option value="تأخير متكرر عن الصباح">تأخير متكرر عن الصباح</option>
                                            <option value="غياب بدون أعذار مقبولة">غياب بدون أعذار مقبولة</option>
                                            <option value="إهمال وتلف بالعهد الإدارية">إهمال وتلف بالعهد الإدارية</option>
                                            <option value="مشادات كلامية وسلوك فظ">مشادات كلامية وسلوك فظ</option>
                                            <option value="إفشاء السرية وتسريب البيانات">إفشاء السرية وتسريب البيانات</option>
                                            <option value="مخالفات نظم المعلومات والحساب">مخالفات نظم المعلومات والحساب</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 font-bold">3. قضية التحقيق المرتبطة (مادة 35):</label>
                                        <select 
                                            className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50"
                                            value={newInvesNo}
                                            onChange={e => setNewInvesNo(e.target.value)}
                                        >
                                            <option value="">-- اختياري: ارتباط قضائي --</option>
                                            <option value="QA-INV-2026-001">قضية تسريب البيانات - QA-INV-2026-001</option>
                                            <option value="QA-INV-2026-002">عجز بالخزائن والصرف - QA-INV-2026-002</option>
                                            <option value="QA-INV-2026-003">واقعة الخروج بدون إذن - QA-INV-2026-003</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block mb-1.5 font-bold">4. العقوبة والجزاء التأديبي الموصى به:</label>
                                        <select
                                            className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50"
                                            value={newSanctionType}
                                            onChange={e => setNewSanctionType(e.target.value)}
                                            required
                                        >
                                            <option value="خصم من الراتب">خصم من الراتب</option>
                                            <option value="إنذار كتابي نهائي رسمي">إنذار كتابي نهائي رسمي</option>
                                            <option value="تنبيه خطي أولي وعاجل">تنبيه خطي أولي وعاجل</option>
                                            <option value="لفت نظر مسلكي شفهي">لفت نظر مسلكي شفهي</option>
                                            <option value="إيقاف موفت عن العمل">إيقاف موفت عن العمل</option>
                                        </select>
                                    </div>

                                    {newSanctionType === 'خصم من الراتب' && (
                                        <div>
                                            <label className="block mb-1.5 font-bold">5. عدد أيام الاستقطاع (مادة 102):</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={15}
                                                className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50"
                                                value={newDeductDays}
                                                onChange={e => setNewDeductDays(Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label className="block mb-1.5 font-bold">6. مبررات صياغة والتحضير للجزاء:</label>
                                    <textarea
                                        className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50"
                                        rows={4}
                                        placeholder="اكتب أسباب وحيثيات الجزاء بالتفصيل..."
                                        value={newDetails}
                                        onChange={e => setNewDetails(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="submit" variant="primary" size="sm" className="bg-amber-600 border-none font-bold text-xs text-white">إصدار وصرف الجزاء</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* TAB APPEALS: GRIEVANCE CENTER */}
                    {activeWorkspaceTab === 'appeals' && (
                        <div className="space-y-4">
                            <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-1 shadow-sm">
                                <h3 className="text-sm font-black flex items-center gap-1.5">
                                    <Undo2 className="w-5 h-5 text-amber-400" />
                                    بوابة التدقيق والبت في التظلمات والاعتراضات المقيدة
                                </h3>
                                <p className="text-xs text-slate-400">تتيح هذه البوابة للإداريين مراجعة عرائض دفاع الموظفين وإعمال البراءة أو الحفظ وإسقاط الغرامات عمالياً بالتناغم.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {records.filter(r => r.status === DisciplinaryActionStatus.APPEALED || r.status === DisciplinaryActionStatus.CANCELLED).map(r => (
                                    <Card key={r.id} className="p-5 bg-white border rounded-2xl space-y-4 text-right">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">{r.employeeName} - {r.recordNumber}</h4>
                                                <p className="text-[10px] text-slate-400 font-mono">تاريخ التظلم: {r.appealsLogs?.appealDate}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === DisciplinaryActionStatus.CANCELLED ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-150'}`}>{r.status}</span>
                                        </div>
                                        
                                        <div className="space-y-1 text-xs">
                                            <p className="text-indigo-900 font-extrabold pb-1">أسباب وتفسير تظلم المتهم الحركي:</p>
                                            <p className="p-3 bg-slate-50 border rounded-xl leading-relaxed text-slate-700 font-sans font-medium">{r.appealsLogs?.reason}</p>
                                        </div>

                                        {r.status === DisciplinaryActionStatus.APPEALED ? (
                                            <div className="flex justify-end gap-2 pt-2 border-t">
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="bg-red-600 hover:bg-red-700 border-none font-bold text-xs"
                                                    onClick={() => handleProcessAppeal(r.id, 'reject')}
                                                >
                                                    رفض التظلم وتثبيت الخصم
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs"
                                                    onClick={() => handleProcessAppeal(r.id, 'accept')}
                                                >
                                                    قبول العذر وإلغاء العقوبة
                                                </Button>
                                            </div>
                                         ) : (
                                             <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-800">
                                                 <strong>البت الإداري:</strong> تم حفظ الدعوى وتبرئة ملف الموظف وإرجاع كافة الاستقطاعات المالية.
                                             </div>
                                         )}
                                     </Card>
                                 ))}
                             </div>
                         </div>
                     )}

                    {/* TAB RULES: SIMULATION LIMITS */}
                    {activeWorkspaceTab === 'rules_engine' && (
                        <Card className="max-w-3xl mx-auto p-6 bg-white border rounded-3xl shadow-sm text-right space-y-4">
                            <h3 className="text-sm font-black text-slate-900 border-b pb-3 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-amber-500 animate-pulse" />
                                محاكي عقوبات وجزاءات العمل بدولة الكويت (مادة 102 لعام 2010)
                            </h3>
                            <p className="text-xs text-slate-500 font-bold">قمنا بتطوير محرك ذكي يقدم دليلاً وافياً عازلاً لأية أخطاء حسابية أو قانونية أثناء فرض الصلاحيات التأديبية بالمنشأة:</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {VIOLATIONS_LAW_CATALOG.map((v, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 border rounded-2xl space-y-2 text-right">
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span className="text-xs font-black text-slate-900">{v.type}</span>
                                            <Badge text={`الجزاء: ${v.basePenalty}`} className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-lg" />
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-slate-700 font-medium">{v.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold leading-relaxed text-amber-900">
                                <strong>تنبيه للامتثال:</strong> يحظر القانون الكويتي خصم أكثر من 5 أيام لعقوبة واحدة، كما يحظر خصم أكثر من 10 أيام في الشهر الموحد من إجمالي الأجر المستحق للموظف، وإلا تعتبر المنشأة مخالفة لأحكام الهيئة العامة للقوى العاملة.
                            </div>
                        </Card>
                    )}

                    {/* TAB APPEALS: GRIEVANCE CENTER */}
                    {activeWorkspaceTab === 'appeals' && (
                        <div className="space-y-4">
                            <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-1 shadow-sm">
                                <h3 className="text-sm font-black flex items-center gap-1.5">
                                    <Undo2 className="w-5 h-5 text-amber-400" />
                                    بوابة التدقيق والبت في التظلمات والاعتراضات المقيدة
                                </h3>
                                <p className="text-xs text-slate-400">تتيح هذه البوابة للإداريين مراجعة عرائض دفاع الموظفين وإعمال البراءة أو الحفظ وإسقاط الغرامات عمالياً بالتناغم.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {records.filter(r => r.status === DisciplinaryActionStatus.APPEALED || r.status === DisciplinaryActionStatus.CANCELLED).map(r => (
                                    <Card key={r.id} className="p-5 bg-white border rounded-2xl space-y-4 text-right">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">{r.employeeName} - {r.recordNumber}</h4>
                                                <p className="text-[10px] text-slate-400 font-mono">تاريخ التظلم: {r.appealsLogs?.appealDate}</p>
                                            </div>
                                            <Badge text={r.status} className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === DisciplinaryActionStatus.CANCELLED ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`} />
                                        </div>
                                        
                                        <div className="space-y-1 text-xs">
                                            <p className="text-indigo-900 font-extrabold pb-1">أسباب وتفسير تظلم المتهم الحركي:</p>
                                            <p className="p-3 bg-slate-50 border rounded-xl leading-relaxed text-slate-700 font-sans font-medium">{r.appealsLogs?.reason}</p>
                                        </div>

                                        {r.status === DisciplinaryActionStatus.APPEALED ? (
                                            <div className="flex justify-end gap-2 pt-2 border-t">
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="bg-red-600 hover:bg-red-700 border-none font-bold text-xs"
                                                    onClick={() => handleProcessAppeal(r.id, 'reject')}
                                                >
                                                    رفض التظلم وتثبيت الخصم
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs"
                                                    onClick={() => handleProcessAppeal(r.id, 'accept')}
                                                >
                                                    قبول العذر وإلغاء العقوبة
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-800">
                                                <strong>البت الإداري:</strong> تم حفظ الدعوى وتبرئة ملف الموظف وإرجاع كافة الاستقطاعات المالية.
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB ANALYTICS: CHARTS & STATS */}
                    {activeWorkspaceTab === 'analytics' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            <Card className="lg:col-span-2 p-5 bg-white border rounded-3xl shadow-sm text-right space-y-4">
                                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                    <BarChart2 className="w-4.5 h-4.5 text-amber-500" />
                                    توزيع المخالفات والواقعات بحسب الفئات
                                </h3>
                                <div className="h-60 pr-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.violationData}>
                                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#F59E0B" radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="lg:col-span-1 p-5 bg-white border rounded-3xl shadow-sm text-center space-y-4">
                                <h3 className="text-xs font-black text-slate-900 text-right flex items-center gap-1.5">
                                    <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
                                    مؤشر قرارات الانضباط الحالية
                                </h3>
                                <div className="h-44 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'معتمد', value: metrics.approved },
                                                    { name: 'قيد المراجعة', value: metrics.pending },
                                                    { name: 'متظلم فيه', value: metrics.appealed }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={65}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {[0, 1, 2].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-xs font-bold text-slate-600 flex justify-center gap-3">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block"></span>معتمد</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block"></span>جاري الدراسة</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span>متظلم</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB PRINT: EDITOR & LAYOUT WITH BRAND IDENTITIES */}
                    {activeWorkspaceTab === 'print' && (
                        <div className="space-y-6">
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                <div className="lg:col-span-1 space-y-4">
                                    <Card className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                                        <h3 className="text-xs font-black flex items-center gap-1 text-slate-900">
                                            <FileText className="w-4 h-4 text-amber-500" />
                                            سندات العقوبات والتظلمات الـ 8
                                        </h3>
                                        <div className="space-y-1.5">
                                            {DISCIPLINARY_TEMPLATES.map(tmp => (
                                                <button 
                                                    key={tmp.id}
                                                    className={`w-full text-right px-3 py-2 text-[11px] font-black rounded-lg transition-all border ${selectedTemplateId === tmp.id ? 'bg-amber-500 text-slate-950 border-amber-500 shadow' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                                                    onClick={() => {
                                                        setSelectedTemplateId(tmp.id);
                                                        const match = DISCIPLINARY_TEMPLATES.find(t => t.id === tmp.id);
                                                        if (match) setEditorText(match.text(selectedRecord));
                                                    }}
                                                >
                                                    {tmp.title}
                                                </button>
                                            ))}
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                                        <h4 className="text-[11px] font-black text-slate-500">محرر التعديل الفوري للبيان:</h4>
                                        <textarea 
                                            className="w-full border rounded-xl p-2.5 text-xs bg-white min-h-[160px] font-sans font-medium"
                                            value={editorText}
                                            onChange={e => setEditorText(e.target.value)}
                                        ></textarea>
                                        <div className="flex gap-1.5 justify-end">
                                            <Button variant="outline" size="sm" onClick={handleSaveCustomDocument}>حفظ النص بالسجل</Button>
                                            <Button variant="primary" size="sm" className="bg-slate-950 hover:bg-slate-850 text-amber-400" onClick={() => window.print()}>تأكيد وطباعة الجزاء</Button>
                                        </div>
                                    </Card>
                                </div>

                                <div className="lg:col-span-2">
                                    <div id="printableArea" className="bg-white p-8 rounded-3xl border shadow-inner text-slate-900 border-slate-200 overflow-y-auto max-h-[80vh] font-sans text-right">
                                        
                                        {/* Adala corporate letterhead */}
                                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6 text-xs text-slate-700">
                                            <div className="text-left font-sans">
                                                <p className="font-extrabold uppercase text-slate-900">AlWagayan, AlAbdullah & Partners</p>
                                                <p>Attorneys & Legal Consultants - Kuwait City</p>
                                                <p className="font-mono text-[10px] mt-1">Ref: <span className="font-black text-slate-950">{selectedRecord?.recordNumber}</span></p>
                                            </div>
                                            <div className="text-center shrink-0">
                                                <div className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center font-black mx-auto mb-1 text-sm border-2 border-amber-500 shadow-md">عـدالة</div>
                                                <p className="font-black text-slate-900 text-[11px]">مكتب ألوقيان والعبدالله للمحاماة</p>
                                                <p className="text-[9px] text-slate-500 font-bold">بوابة الامتثال والتحقيقات العمالية</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-extrabold text-slate-900">تاريخ المعاملة: {new Date().toLocaleDateString('ar-KW')}</p>
                                                <p>دولة الكويت، العاصمة</p>
                                                <p className="text-[10px] text-slate-500 font-bold">خط الساخن: 1800112</p>
                                            </div>
                                        </div>

                                        {/* Text body */}
                                        <div className="min-h-[250px] text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                                            {editorText}
                                        </div>

                                        {/* Signs and stamps */}
                                        <div className="grid grid-cols-2 text-center mt-12 pt-6 border-t border-dashed border-slate-200 text-[10px] font-bold text-slate-600 leading-loose">
                                            <div>
                                                <p>رئيس لجنة الانضباط والرقابة</p>
                                                <p className="mt-4 text-indigo-700 italic font-black underline underline-offset-4">د. يحيى الشمري</p>
                                                <span className="text-[8px] text-slate-400">الإمضاء والتحقق لعدالة</span>
                                            </div>
                                            <div>
                                                <p>اعتماد الشؤون القانونية والموارد البشرية</p>
                                                <p className="mt-4 text-emerald-700 italic font-black">مكتب الوقيان للمحاماة</p>
                                                <span className="text-[8px] text-slate-400">خاتم المنشأة والتصديق الرسمي</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisciplinaryActionsPage;
