import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Investigation, InvestigationStatus, InvestigationPartyType, Employee } from '../types';
import { OFFICE_NAME, investigationStatusOptions, KUWAIT_LABOR_LAW_INVESTIGATION_RULES } from '../constants';
import { sampleEmployees } from '../data/employeeData';
import { Badge } from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';

// Modular Workspace Subcomponents Imports
import { InvestigationSummonsModal } from './investigations/InvestigationSummonsModal';
import { InvestigationPrintModal } from './investigations/InvestigationPrintModal';
import { InvestigationCaseProfile } from './investigations/InvestigationCaseProfile';

// Lucide Icons
import { 
    Gavel, Folder, Clock, CheckCircle, TrendingUp, PlusCircle, Calendar, 
    Users, Printer, Search, FileText, LayoutGrid, List, History, 
    Scale, Filter, Trash2, Edit3, ShieldAlert, Award, FileSpreadsheet, Eye,
    Sparkles
} from 'lucide-react';

// Upgraded Prosecution-style Mock Database
const upgradedMockInvestigations: Investigation[] = [
    {
        id: 'inv-001',
        investigationNumber: 'INV-2024-001',
        subject: 'التحقيق في شكوى تسريب وأخذ أوراق منسوبة لمستندات أسرار العمل (قضية العميل س)',
        investigator: 'أ. عبدالله الفهد (رئيس قطاع الامتثال القانوني)',
        status: InvestigationStatus.ONGOING,
        startDate: '2024-08-11',
        createdAt: '2024-08-10',
        relatedCaseIds: ['1'],
        employeeId: 'EMP002',
        employeeName: 'فاطمة علي حسين السيد',
        employeeDepartment: 'المشاريع الهندسية',
        employeeJobTitle: 'مهندس تنفيذ مشاريع',
        complainantName: 'وليد العتيبي',
        complainantTitle: 'إدارة أمن النظم والمعلومات',
        violations: ['إفشاء معلومات سرية والتعدي على حقوق الملكية الفكرية للمنشأة'],
        legalReferences: ['المادة 55 من قانون العمل الكويتي رقم 6 لسنة 2010', 'المادة 41 من الكود العمالي الموحد'],
        summary: "بناءً على التقرير المرفوع من إدارة النظم، تم رصد نشاط مريب وتصدير ملفات حساسة من الحساب الوظيفي للموظفة فاطمة السيد لصالح جهة بريدية خارجية. تم مواجهة الموظفة بسجلات الخادم وأقرت بأنها تركت الجهاز مفتوحاً بالخطأ.",
        evidence: [
            { id: 'ev-1', name: 'سجلات تتبع تصدير البيانات من نظام تخطيط موارد المؤسسة (ERP Logs)', type: 'أحراز إلكترونية برمجية', dateAdded: '2024-08-11', notes: 'تثبت عملية النقل والتصديق لحساب خارجي في يوم الأربعاء المذكور' }
        ],
        witnesses: [
            { id: 'wi-1', name: 'جاسم المطيري', status: 'attended', phone: '90011223' }
        ],
        attachments: [
            { id: 'at-1', name: 'تقرير فحص خادم البريد المعتمد المسمى.pdf', url: '#', size: '2.5 MB', dateAdded: '2024-08-11' }
        ],
        approvals: [
            { id: 'ap-1', role: 'المحقق القانوني المباشر', name: 'أ. عبدالله الفهد', status: 'APPROVED', date: '2024-08-12' },
            { id: 'ap-2', role: 'مدير الشؤون القانونية', name: 'أ. عبدالعزيز العصفور', status: 'PENDING' }
        ],
        activityLogs: [
            { id: 'log-1', action: 'إنشاء ملف التحقيق وتكليف المحقق الرسمي', user: 'إدارة النظام الإلكتروني', timestamp: '2024-08-10T08:30:00Z' },
            { id: 'log-2', action: 'إصدار إعلان بالحضور ومباشرة سماع الأقوال لخصم الواقعة', user: 'أ. عبدالله الفهد', timestamp: '2024-08-11T10:00:00Z' }
        ],
        sessions: [
            {
                id: 'inv-001-s1',
                partyName: 'فاطمة علي حسين السيد',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-08-11',
                sessionTime: '10:00',
                questions: [
                    { id: 'q1', questionText: 'س: ما هو قولك فيما هو منسوب إليك بخصوص نقل أوراق وملفات حساسة للعملاء خارج الشركة؟', answerText: 'ج: أنكر ذلك تماماً بسوء نية، ربما تم استغلال وجودي خارج المكتب والدخول من حاسوبي.', timestamp: '2024-08-11T10:15:00Z' },
                    { id: 'q2', questionText: 'س: سجلات النظم تشير إلى تصدير تام بكلمة المرور الخاصة بك، فبماذا تفسرين ذلك؟', answerText: 'ج: نعم، أقر بأني تركت جهازي للأسف مفتوحاً دون القفل السري وهو إهمال غير مقصود مني.', timestamp: '2024-08-11T10:20:00Z' },
                ],
                partySignature: 'data:image/png;base64,...',
                investigatorSignature: 'data:image/png;base64,...'
            }
        ]
    },
    {
        id: 'inv-002',
        investigationNumber: 'INV-2024-002',
        subject: 'تحقيق في رصد عجز مالي بالخزينة الرئيسية للمنشأة',
        investigator: 'لجنة الرقابة الشاملة والتدقيق المالي',
        status: InvestigationStatus.ON_HOLD,
        startDate: '2024-07-25',
        createdAt: '2024-07-24',
        employeeId: 'EMP001',
        employeeName: 'أحمد محمود مبارك',
        employeeDepartment: 'المالية والحسابات',
        employeeJobTitle: 'محاسب أول للخزانة',
        complainantName: 'د. يوسف الملا',
        complainantTitle: 'نائب رئيس التدقيق المالي',
        violations: ['وجود فروقات مالية وعجز نقدي مقداره 150 د.ك غير مثبت بالدفاتر'],
        legalReferences: ['المادة 58 من قانون التنظيم المالي الكويتي', 'لوائح الائتمان ومسؤولية الصندوق'],
        summary: "تلاحظ للمراجع المالي وجود عجز نقدي في صندوق العهدة اليومية المعتمدة لليوم الجاري. تم رصد إفادة المحاسب بأنه سيتم تسديد العجز فوراً وقيد الواقعة قيد التعليق لاستخراج تسجيلات كاميرات المراقبة.",
        evidence: [
            { id: 'ev-2', name: 'تقرير جرد اليومية الختامية لصندوق العهدة المودع', type: 'تقارير محاسبية فنية', dateAdded: '2024-07-25' }
        ],
        witnesses: [],
        approvals: [],
        activityLogs: [
            { id: 'log-3', action: 'فتح محضر عجز الخزينة وإحالة الملف للجنة التدقيق', user: 'د. يوسف الملا', timestamp: '2024-07-24T12:00:00Z' }
        ],
        sessions: [
            {
                id: 'inv-002-s1',
                partyName: 'أحمد محمود مبارك',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-07-25',
                sessionTime: '09:00',
                questions: [
                    { id: 'q3', questionText: 'س: متى تلاحظ لك وجود هذا الفرق المالي بالتحديد في حساب الخزينة الموكل لعهدتك؟', answerText: 'ج: تلاحظ ذلك عند قيامي بالجرد اليدوي السريع قبل إغلاق النظام الالي بنصف ساعة.', timestamp: '2024-07-25T09:00:00Z' },
                    { id: 'q4', questionText: 'س: هل قمت بتسليم مفتاح عهدتك لأي من موظفي الإدارة في تلك الفترة؟', answerText: 'ج: لا، المفتاح لا يفارق حوزتي مطلقاً وهو في جيبي دائماً.', timestamp: '2024-07-25T09:05:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-003',
        investigationNumber: 'INV-2024-003',
        subject: 'مخالفة لائحة الانضباط (مشادة لفظية كلامية مع المدير العام المباشر)',
        investigator: 'مديرة الموارد البشرية والاتصال',
        status: InvestigationStatus.CLOSED,
        startDate: '2024-06-10',
        endDate: '2024-06-12',
        createdAt: '2024-06-09',
        employeeId: 'EMP001',
        employeeName: 'أحمد محمود مبارك',
        employeeDepartment: 'المالية',
        employeeJobTitle: 'محاسب أول',
        complainantName: 'أ. جاسم الصبيح',
        complainantTitle: 'المدير التنفيذي للقطاع الإداري',
        violations: ['التطاول وتجاوز ميثاق السلوك والمشادات اللفظية أثناء الدوام المباشر'],
        legalReferences: ['المادة 102 من قانون العمل الكويتي بالقطاع الأهلي'],
        summary: "ثبوت واقعة التطاول اللفظي المشهود في مكاتب الإدارة المالية، حيث تم مواجهة العامل وأبدى اعتذاراً مكتوباً ورصيد ندم تام. تم تطبيق لائحة الجزاءات بخصم خصم يوم عمل وتوجيه إنذار كتابي نهائي.",
        evidence: [
            { id: 'ev-3', name: 'إقرار واعتذار كتابي بخط يد الموظف أحمد مبارك', type: 'مستند مكتوب يدوي', dateAdded: '2024-06-11' }
        ],
        witnesses: [
            { id: 'wi-2', name: 'أ. دلال الماروق', status: 'attended', phone: '94433221' }
        ],
        approvals: [
            { id: 'ap-3', role: 'رئيس الشؤون القانونية والمستشار الإداري', name: 'د. يوسف الملا', status: 'APPROVED', date: '2024-06-12' }
        ],
        activityLogs: [
            { id: 'log-4', action: 'إنهاء التحقيق الإداري وتطبيق الجزاء المتدرج بخصم يوم', user: 'مدير الموارد البشرية', timestamp: '2024-06-12T15:00:00Z' }
        ],
        sessions: [
            {
                id: 'inv-003-s1',
                partyName: 'أ. دلال الماروق (شاهد الحادثة)',
                partyType: InvestigationPartyType.WITNESS,
                sessionDate: '2024-06-10',
                sessionTime: '11:00',
                questions: [
                    { id: 'q5', questionText: 'س: هل كنت متواجدة بصورة مباشرة ورأيت تفاصيل المشادة في مكتب الإدارة المالية؟', answerText: 'ج: نعم، كنت متواجدة لتسليم كشف الحساب وسمعت صراخاً وألفاظاً غير ملائمة مهنياً.', timestamp: '2024-06-10T11:00:00Z' }
                ]
            }
        ],
        recommendation: "ثبوت التهمة بإقرار المتهم وشهادة الشهود. يوصى بخصم يوم عمل وتوجيه لفت نظر نهائي كتابياً لمنع التكرار."
    }
];

const InvestigationsPage: React.FC = () => {
    const { addToast } = useToast();
    
    // Core Database State
    const [investigations, setInvestigations] = useState<Investigation[]>(upgradedMockInvestigations);
    
    // Filters & States
    const [viewMode, setViewMode] = useState<'dashboard' | 'table' | 'grid' | 'sessions' | 'timeline'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<InvestigationStatus | ''>('');
    
    // Creation Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newInvNum, setNewInvNum] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
    const [newInvSubject, setNewInvSubject] = useState('');
    const [newInvInvestigator, setNewInvInvestigator] = useState('');
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [newInvStatus, setNewInvStatus] = useState<InvestigationStatus>(InvestigationStatus.NEW);
    const [newInvStartDate, setNewInvStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Active Modals States
    const [viewingInvestigation, setViewingInvestigation] = useState<Investigation | null>(null);
    const [printingInvestigation, setPrintingInvestigation] = useState<Investigation | null>(null);
    const [summonsInvestigation, setSummonsInvestigation] = useState<Investigation | null>(null);
    const [summonsWitnessName, setSummonsWitnessName] = useState<string | undefined>(undefined);

    // Dashboard calculations
    const stats = useMemo(() => {
        return {
            total: investigations.length,
            new: investigations.filter(i => i.status === InvestigationStatus.NEW).length,
            ongoing: investigations.filter(i => i.status === InvestigationStatus.ONGOING).length,
            closed: investigations.filter(i => i.status === InvestigationStatus.CLOSED).length,
            onHold: investigations.filter(i => i.status === InvestigationStatus.ON_HOLD).length,
        };
    }, [investigations]);

    const filteredInvestigations = useMemo(() => {
        return investigations.filter(inv => {
            const matchesSearch = 
                inv.investigationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inv.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = filterStatus ? inv.status === filterStatus : true;
            return matchesSearch && matchesStatus;
        });
    }, [investigations, searchTerm, filterStatus]);

    // Handle create new investigation with smart validation
    const handleCreateInvestigation = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newInvSubject.trim() || !newInvInvestigator.trim()) {
            addToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى استيفاء الحقول وعنوان موضوع الواقعة.' });
            return;
        }

        // Duplicate Investigation number check
        const isNumDup = investigations.some(i => i.investigationNumber === newInvNum.trim());
        if (isNumDup) {
            addToast({ type: 'error', title: 'رقم مكرر للملف', message: 'رقم التحقيق هذا مستعمل ومسجل بقضية أخرى مسبقاً.' });
            return;
        }

        const linkedEmp = sampleEmployees.find(emp => emp.id === selectedEmpId);

        const newInv: Investigation = {
            id: `inv-${Date.now()}`,
            investigationNumber: newInvNum.trim(),
            subject: newInvSubject,
            investigator: newInvInvestigator,
            status: newInvStatus,
            startDate: newInvStartDate,
            createdAt: new Date().toISOString().split('T')[0],
            employeeId: linkedEmp?.employeeId || 'EMP00',
            employeeName: linkedEmp?.fullNameAr || 'الموظف المحال للتحقيق',
            employeeDepartment: linkedEmp?.department || 'الإدارة القانونية',
            employeeJobTitle: linkedEmp?.jobTitle || 'وظيفة إدارية',
            sessions: [],
            witnesses: [],
            evidence: [],
            approvals: [
                { id: `ap1-${Date.now()}`, role: 'الباحث والمحقق الإداري القانوني', name: newInvInvestigator, status: 'PENDING' },
                { id: `ap2-${Date.now()}`, role: 'مدير الشؤون القانونية للمنظمة', name: 'أ. عبدالعزيز العصفور', status: 'PENDING' }
            ],
            activityLogs: [
                { id: `log-${Date.now()}`, action: 'تم فتح وقيد ملف التحقيق الإداري ومباشرة الإجراء الاستقصائي', user: newInvInvestigator, timestamp: new Date().toISOString() }
            ]
        };

        setInvestigations([newInv, ...investigations]);
        setIsFormOpen(false);
        setNewInvSubject('');
        setNewInvInvestigator('');
        setSelectedEmpId('');
        // Regenerate random file number for next submit
        setNewInvNum(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
        
        addToast({ type: 'success', title: 'تم فتح الملف', message: 'تم قيد وتسجيل قضية التحقيق الجديدة في لوحة الامتثال.' });
    };

    const handleDeleteInvestigation = (id: string, number: string) => {
        if (!window.confirm(`هل أنت متأكد من مسح وحذف ملف التحقيق الإداري رقم (${number}) نهائياً من أرشيف المنشأة؟`)) return;
        setInvestigations(prev => prev.filter(i => i.id !== id));
        addToast({ type: 'success', title: 'تم الحذف والأرشفة', message: 'تم إزالة سجل القضية ومسح أوراق الإفادة بنجاح.' });
    };

    const handleUpdateInvestigationInList = (updated: Investigation) => {
        setInvestigations(prev => prev.map(i => i.id === updated.id ? updated : i));
        // Refresh active viewing investigation to keep detailed modal sync
        if (viewingInvestigation?.id === updated.id) {
            setViewingInvestigation(updated);
        }
    };

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* Upper Banner Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900 border p-5 rounded-2xl shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
                        <Gavel className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1">
                            <span className="hover:underline">نظام إدارة عدالة</span>
                            <span>/</span>
                            <span>الامتثال الإداري</span>
                            <span>/</span>
                            <span className="text-slate-600">التحقيقات الإدارية والعمالية</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">نظام التحقيقات الإدارية ورصد الجزاءات والتأديبيات</h1>
                    </div>
                </div>
                <Button variant="primary" onClick={() => setIsFormOpen(true)} leftIcon={<PlusCircle className="w-5 h-5"/>}>فتح وقيد ملف تحقيق جديد</Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { title: "إجمالي الملفات المقيدة", count: stats.total, color: "text-slate-900", icon: <Folder className="w-5 h-5 text-indigo-500" /> },
                    { title: "تحقيقات حديثة", count: stats.new, color: "text-blue-600", icon: <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" /> },
                    { title: "جلسات جارية والتحقيق", count: stats.ongoing, color: "text-amber-600", icon: <Clock className="w-5 h-5 text-amber-500" /> },
                    { title: "معلق / قيد التدقيق", count: stats.onHold, color: "text-rose-600", icon: <ShieldAlert className="w-5 h-5 text-rose-500" /> },
                    { title: "ملفات مغلقة ومحفوظة", count: stats.closed, color: "text-emerald-600", icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between hover:scale-105 transition-transform duration-200">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400">{stat.title}</p>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border">{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* Workplace Navigation Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white border p-3 rounded-2xl gap-3 shadow-sm select-none">
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {[
                        { id: 'dashboard', label: 'اللوحة التحليلية', icon: <TrendingUp className="w-4 h-4"/> },
                        { id: 'table', label: 'قائمة السجلات', icon: <List className="w-4 h-4"/> },
                        { id: 'grid', label: 'بطاقات القضايا', icon: <LayoutGrid className="w-4 h-4"/> },
                        { id: 'sessions', label: 'المستمعين والجلسات المفتوحة', icon: <Users className="w-4 h-4"/> },
                        { id: 'timeline', label: 'التاريخ والأرشيف الإجرائي', icon: <History className="w-4 h-4"/> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap border transition-all ${viewMode === tab.id ? 'bg-indigo-600 border-indigo-600 text-white shadow font-black' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Filters Row */}
                <div className="flex gap-2 w-full md:w-auto items-center">
                    <div className="relative flex-grow md:flex-initial">
                        <input 
                            placeholder="بحث بالرقم، المتهم، الموضوع..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans w-full md:w-60 focus:ring-1 focus:ring-indigo-600 focus:bg-white text-right placeholder-right"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <Select 
                        value={filterStatus} 
                        options={[{value: '', label: 'فلترة بكل الحالات'}, ...investigationStatusOptions]} 
                        onChange={e => setFilterStatus(e.target.value as any)} 
                        containerClassName="mb-0 w-36 text-xs text-right"
                    />
                </div>
            </div>

            {/* Primary View Body switcher */}
            <div className="space-y-4">
                {viewMode === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Analytical subject distribution */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card title="الأدلة والإرشادات العمالية في القانون الكويتي">
                                <p className="text-xs text-slate-500 mb-4 font-sans">أهم الضوابط الحاكمة وصلاحيات تفتيش وتحقيق العمل وفق أحكام ديوان الخدمة المدنية وجزاءات القطاع الأهلي:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {KUWAIT_LABOR_LAW_INVESTIGATION_RULES.map((rule, idx) => (
                                        <div key={idx} className="bg-slate-50 border rounded-xl p-3 space-y-2">
                                            <div className="flex justify-between items-center border-b pb-1">
                                                <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">مادة رقم ({rule.article})</span>
                                                <Award className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-slate-700 font-sans font-medium">{rule.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card title="نظرة إجمالية لقضايا التحقيق الحالي">
                                    <div className="space-y-3 font-sans text-xs">
                                        <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                                            <span className="text-slate-500">تحقيقات جارية ومفتوحة</span>
                                            <span className="font-bold text-slate-900 font-sans">{stats.ongoing}</span>
                                        </div>
                                        <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                                            <span className="text-slate-500">تحت الدرس والتصديق الإداري</span>
                                            <span className="font-bold text-slate-900 font-sans">{stats.new}</span>
                                        </div>
                                        <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                                            <span className="text-slate-500">منتهية وتم تسيير الجزاء العمالي</span>
                                            <span className="font-bold text-slate-900 font-sans">{stats.closed}</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card title="أحدث النشاطات القانونية المسجلة">
                                    <div className="space-y-2 text-[10px] text-slate-500">
                                        <div className="p-2 border rounded-lg bg-indigo-50/50 flex items-start gap-2">
                                            <Gavel className="w-3.5 h-3.5 text-indigo-600 mt-0.5" />
                                            <span>تم فتح محضر التسريب وتصدير المستند للواقعة (فاطمة السيد)</span>
                                        </div>
                                        <div className="p-2 border rounded-lg bg-indigo-50/50 flex items-start gap-2">
                                            <Clock className="w-3.5 h-3.5 text-amber-600 mt-0.5" />
                                            <span>تعليق تحقيق العجز المالي لحين توفير المراجعة الأمنية للكاميرات</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Sidebar help desk */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card title="لوائح الممارسات للمحقق الناجح">
                                <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-sans font-bold pr-1">
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-indigo-600 mt-0.5">▪</span>
                                        <span>وجوب إخطار الموظف بالمثول كتابياً بحد أدنى 24 ساعة للتهيئة.</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-indigo-600 mt-0.5">▪</span>
                                        <span>تفريغ محادثات الاستجواب بدقة بالغة وبألفاظها المنطوقة حرفياً.</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-indigo-600 mt-0.5">▪</span>
                                        <span>التصديق الرقمي وتمرير مذكرات التوصية للمكلفين لاعتماد القرار النهائي.</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-indigo-600 mt-0.5">▪</span>
                                        <span>لا يسير أي خصم أو قرار إنهاء دون ثبوت تفريغ المحاضر والتوقيع عليها.</span>
                                    </li>
                                </ul>
                            </Card>
                            <Card title="إحصائيات الممتثلين">
                                <div className="space-y-3 text-xs font-sans">
                                    <div className="p-3 bg-slate-100 border text-slate-800 rounded-xl text-center">
                                         إدارة ومتابعة سلوك موظفي {OFFICE_NAME} لضمان بيئة عمل أخلاقية وقانونية سليمة.
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {viewMode === 'table' && (
                    <Card className="shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 font-bold text-xs text-slate-600">
                                    <tr>
                                        {['رقم ملف التحقيق', 'الموضوع العام للواقعة', 'الموظف المتهم', 'المحقق المسؤول', 'تاريخ المباشرة', 'حالة القضية', 'إجراءات السيطرة والطباعة'].map((h, i) => (
                                            <th key={i} className="px-4 py-3 text-right">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 font-sans">
                                    {filteredInvestigations.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-900">{inv.investigationNumber}</td>
                                            <td className="px-4 py-3 max-w-xs truncate font-bold text-slate-800">{inv.subject}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-900">{inv.employeeName || "إهمال عام"}</p>
                                                <p className="text-[10px] text-slate-400 font-sans">{inv.employeeJobTitle || "منصب إداري"} • {inv.employeeDepartment}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{inv.investigator}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600 font-sans">{inv.startDate}</td>
                                            <td className="px-4 py-3">
                                                <Badge text={inv.status} color={inv.status === InvestigationStatus.CLOSED ? 'green' : inv.status === InvestigationStatus.ONGOING ? 'yellow' : inv.status === InvestigationStatus.ON_HOLD ? 'rose' : 'blue'} size="sm" />
                                            </td>
                                            <td className="px-4 py-3 text-xs space-x-1 space-x-reverse whitespace-nowrap">
                                                <Button size="sm" variant="outline" className="text-[10px] py-1" onClick={() => { setViewingInvestigation(inv); }} leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-700" />}>فحص وبحث</Button>
                                                <Button size="sm" variant="ghost" className="text-slate-600" onClick={() => setPrintingInvestigation(inv)} title="عرض نسخة للطباعة"><Printer className="w-3.5 h-3.5" /></Button>
                                                <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDeleteInvestigation(inv.id, inv.investigationNumber)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInvestigations.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-slate-400 italic text-xs">لا توجد أي خلايا أو سجلات قضايا تحقيق مطابقة لعملية الفرز والبحث الجاري.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredInvestigations.map((inv) => (
                            <div key={inv.id} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-xs font-black text-indigo-700 font-sans">{inv.investigationNumber}</span>
                                        <Badge text={inv.status} color={inv.status === InvestigationStatus.CLOSED ? 'green' : inv.status === InvestigationStatus.ONGOING ? 'yellow' : 'gray'} size="sm" />
                                    </div>
                                    <h4 className="font-black text-slate-900 text-xs min-h-[32px] line-clamp-2 leading-relaxed">{inv.subject}</h4>
                                    
                                    {/* Defendant Profile Preview */}
                                    <div className="bg-slate-50 p-2.5 rounded-lg border text-xs leading-tight">
                                        <p className="font-sans text-[10px] text-slate-400">عن الموظف المشكو بحقه:</p>
                                        <p className="font-bold text-slate-950 mt-1">{inv.employeeName || 'غير مدرج'}</p>
                                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">{inv.employeeJobTitle} • {inv.employeeDepartment}</p>
                                    </div>
                                    
                                    <p className="text-[11px] text-slate-500 font-sans leading-relaxed line-clamp-3">{inv.summary || 'لم يدون أي ملخص وقائع شامل للتحقيق الجاري بعد.'}</p>
                                </div>

                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-sans">بدأ في: {inv.startDate}</span>
                                    <div className="flex gap-1.5">
                                        <Button size="sm" variant="outline" className="text-[10px]" onClick={() => setViewingInvestigation(inv)} leftIcon={<Eye className="w-3.5 h-3.5"/>}>الملف الكامل</Button>
                                        <Button size="sm" variant="ghost" className="text-slate-600 hover:bg-slate-50" onClick={() => setPrintingInvestigation(inv)}><Printer className="w-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === 'sessions' && (
                    <div className="space-y-4">
                        <div className="bg-white border p-4 rounded-xl shadow-sm text-xs leading-relaxed">
                            <h4 className="font-black text-slate-900 text-sm mb-1">جدول محاضر الجلسات والاستماعات المفتوحة</h4>
                            <p className="text-slate-500 font-sans">قائمة مجمعة بكافة الجلسات المسجلة عبر جميع تحقيقات الامتثال:</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {investigations.flatMap(inv => 
                                inv.sessions.map((sess, idx) => (
                                    <div key={sess.id} className="bg-white border rounded-xl p-4 shadow-sm hover:border-indigo-600 transition-colors flex flex-col justify-between gap-3">
                                        <div>
                                            <div className="flex justify-between items-start border-b pb-2 mb-2">
                                                <div>
                                                    <span className="text-[9px] font-sans font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">جلسة رقم ({idx + 1})</span>
                                                    <h5 className="font-black text-slate-900 text-xs mt-1.5">{sess.partyName} ({sess.partyType})</h5>
                                                </div>
                                                <Badge text={inv.status} color="slate" size="sm" />
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-sans">تابع لنفس التحقيق: <strong className="text-indigo-600">{inv.investigationNumber}</strong></p>
                                            <p className="text-xs text-slate-700 mt-1">{inv.subject}</p>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                                            <span>جداول الموعد: {sess.sessionDate} • الوقت: {sess.sessionTime || "10:00"}</span>
                                            <Button size="sm" variant="outline" className="text-[9px] py-0.5 px-2" onClick={() => setViewingInvestigation(inv)}>تحديث المحضر</Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'timeline' && (
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                        <h4 className="font-black text-slate-900 text-base mb-6 border-b pb-2">الخط الاستدلالي التاريخي لقضايا التحقيق (Audit Timeline Ledger)</h4>
                        
                        <div className="flow-root font-sans">
                            <ul className="-mb-8 text-xs font-sans text-slate-600">
                                {investigations.flatMap(inv => 
                                    (inv.activityLogs || []).map(log => ({ ...log, caseNum: inv.investigationNumber }))
                                ).slice(0, 15).map((log, idx, arr) => (
                                    <li key={log.id}>
                                        <div className="relative pb-8">
                                            {idx !== arr.length - 1 ? (
                                                <span className="absolute top-4 right-4 -mr-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                            ) : null}
                                            <div className="relative flex space-x-3 space-x-reverse items-start text-right">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white border">
                                                        <History className="w-4 h-4 text-indigo-600" />
                                                    </span>
                                                </div>
                                                <div className="flex-grow pt-1.5 min-w-0">
                                                    <p className="text-slate-900 font-sans font-bold">
                                                        <span>{log.action}</span>
                                                        <span className="text-indigo-600 font-sans font-black mr-2">({log.caseNum})</span>
                                                    </p>
                                                    <div className="text-[10px] text-slate-400 mt-1 font-sans flex gap-3">
                                                        <span>المجرى بواسطة: {log.user}</span>
                                                        <span>•</span>
                                                        <span>تاريخ النشاط: {new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Creation Modal of Investigations with employee selections */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="قيد وفتح ملف تحقيق عمالي جديد" size="lg">
                <form onSubmit={handleCreateInvestigation} className="space-y-4 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="رقم ملف التحقيق" value={newInvNum} onChange={e => setNewInvNum(e.target.value)} required />
                        <Select label="التأشير والحالة الإدارية الفورية" value={newInvStatus} options={[{value: InvestigationStatus.NEW, label:'جديد'}, {value: InvestigationStatus.ONGOING, label: 'جارٍ ومباشر الاستدلال'}, {value: InvestigationStatus.ON_HOLD, label: 'معلق بالدراسة'}]} onChange={e => setNewInvStatus(e.target.value as any)} />
                    </div>

                    <Input label="موضوع الواقعة وعنوان التحقيق بالتفصيل" value={newInvSubject} onChange={e => setNewInvSubject(e.target.value)} placeholder="مثال: تحقيق في مشادة كلامية أو عجز بالخزينة..." required />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="اسم رئيس لجنة التحقيق / الباحث المكلف" value={newInvInvestigator} onChange={e => setNewInvInvestigator(e.target.value)} required />
                        <Select 
                            label="الموظف المحال للتحقيق (من الكادر البشري للشركة)" 
                            value={selectedEmpId} 
                            options={[{value: '', label: '-- اختر الموظف لربط ملفه --'}, ...sampleEmployees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.jobTitle})` }))]} 
                            onChange={e => setSelectedEmpId(e.target.value)} 
                        />
                    </div>

                    <Input label="تاريخ مباشرة القيد الإداري" type="date" value={newInvStartDate} onChange={e => setNewInvStartDate(e.target.value)} required />

                    <div className="flex justify-end gap-2 p-2 border-t mt-4 text-xs font-bold">
                        <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
                        <Button type="submit">قيد وتسجيل الملف الآن</Button>
                    </div>
                </form>
            </Modal>

            {/* Modular Overlaid Working Panels */}
            {viewingInvestigation && (
                <InvestigationCaseProfile 
                    isOpen={!!viewingInvestigation} 
                    onClose={() => setViewingInvestigation(null)} 
                    investigation={viewingInvestigation}
                    onUpdate={handleUpdateInvestigationInList}
                    onTriggerSummons={(witnessName) => {
                        setSummonsWitnessName(witnessName);
                        setSummonsInvestigation(viewingInvestigation);
                    }}
                />
            )}

            <InvestigationPrintModal 
                investigation={printingInvestigation} 
                onClose={() => setPrintingInvestigation(null)} 
            />

            {summonsInvestigation && (
                <InvestigationSummonsModal 
                    isOpen={!!summonsInvestigation} 
                    onClose={() => {
                        setSummonsInvestigation(null);
                        setSummonsWitnessName(undefined);
                    }}
                    investigation={summonsInvestigation}
                    employee={sampleEmployees.find(e => e.fullNameAr === summonsInvestigation.employeeName) || null}
                    witnessName={summonsWitnessName}
                />
            )}
        </div>
    );
};

export default InvestigationsPage;
