
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import { 
    CalendarDaysIcon, PlusCircleIcon, EyeIcon, CheckCircleIcon, XCircleIcon, 
    PrinterIcon, ClockIcon, MagnifyingGlassIcon, UserGroupIcon,
    BriefcaseIcon, TrashIcon, ScaleIcon, TableCellsIcon, ArchiveBoxIcon
} from '../constants';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
    LeaveRequest, LeaveTypeKuwait
} from '../types'; 
import { initialEmployees } from './EmployeeProfilePage';
import { useJurisdiction } from '../components/JurisdictionContext';

// --- Extended Interface for Local Use ---
interface DetailedLeaveRequest extends LeaveRequest {
    substituteEmployeeId?: string;
    substituteEmployeeName?: string;
    emergencyContact?: string;
    expectedReturnDate?: string;
    isPaid?: boolean;
    paymentPercentage?: number;
    photoUrl?: string;
    remainingBalanceBefore?: number;
    department?: string;
    jobTitle?: string;
}

// --- Mock Data ---
export const mockLeaveRequests: DetailedLeaveRequest[] = [
    { 
        id: 'lr1', 
        employeeId: initialEmployees[0]?.id || 'emp1', 
        employeeName: initialEmployees[0]?.fullNameAr || 'صبري شطا', 
        leaveType: LeaveTypeKuwait.ANNUAL, 
        startDate: '2024-08-01', 
        endDate: '2024-08-15', 
        numberOfDays: 15, 
        reason: 'إجازة سنوية للسفر مع العائلة', 
        status: 'Approved', 
        requestedAt: '2024-07-01', 
        managerComments: 'تمت الموافقة، يرجى تسليم العهدة قبل السفر.', 
        approvedAt: '2024-07-02',
        substituteEmployeeName: 'فهد محمد الشمري',
        expectedReturnDate: '2024-08-16',
        isPaid: true,
        paymentPercentage: 100,
        photoUrl: initialEmployees[0]?.photoUrl,
        remainingBalanceBefore: 30,
        department: 'الإدارة العليا',
        jobTitle: 'شريك مدير'
    },
    { 
        id: 'lr2', 
        employeeId: initialEmployees[1]?.id || 'emp2', 
        employeeName: initialEmployees[1]?.fullNameAr || 'ليلى محمود', 
        leaveType: LeaveTypeKuwait.SICK, 
        startDate: '2024-05-10', 
        endDate: '2024-05-12', 
        numberOfDays: 3, 
        reason: 'عارض صحي مفاجئ - مرفق التقرير', 
        status: 'Approved', 
        requestedAt: '2024-05-10', 
        attachments: [{id:'att1', name:'medical_report.pdf', fileType:'PDF', uploadedAt:'2024-05-10'}],
        isPaid: true,
        paymentPercentage: 100,
        photoUrl: initialEmployees[1]?.photoUrl,
        remainingBalanceBefore: 15,
        department: 'الشؤون الإدارية',
        jobTitle: 'مديرة الموارد البشرية'
    },
    { 
        id: 'lr3', 
        employeeId: initialEmployees[5]?.id || 'emp6', 
        employeeName: initialEmployees[5]?.fullNameAr || 'ياسمين حسن', 
        leaveType: LeaveTypeKuwait.EMERGENCY, 
        startDate: '2026-06-15', 
        endDate: '2026-06-16', 
        numberOfDays: 2, 
        status: 'Pending', 
        requestedAt: '2026-05-10',
        photoUrl: initialEmployees[5]?.photoUrl,
        remainingBalanceBefore: 4,
        department: 'قسم المحاسبة',
        jobTitle: 'محاسب أول'
    }
];

// --- Helpers ---
const calculateNumberOfDays = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (endDate < startDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const getStatusColor = (status: LeaveRequest['status']) => {
    switch(status) {
        case 'Approved': return 'emerald';
        case 'Pending': return 'amber';
        case 'Rejected': return 'rose';
        case 'Cancelled': return 'slate';
        default: return 'slate';
    }
};

const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', {year:'numeric', month:'long', day:'numeric'}) : '-';

const KUWAIT_LABOR_LAW_LEAVE_ARTICLES = {
    ANNUAL: "المادة (70): للعامل الحق في إجازة سنوية مدفوعة الأجر مدتها 30 يوماً، بشرط أن يكون قد أمضى في خدمة صاحب العمل سنة على الأقل، ولا يحسب ضمنها أيام العطل الرسمية والراحات الأسبوعية.",
    SICK: "المادة (73): يستحق العامل إجازة مرضية خلال السنة: (15) يوماً بمرتب كامل، (10) أيام بـ 3/4 المرتب، (10) أيام بنصف مرتب، و(10) أيام بربع مرتب، و(30) يوماً بدون مرتب.",
    EMERGENCY: "المادة (76): للعامل الحق في إجازة عرضية (طارئة) لا تزيد على (4) أيام في السنة وبحد أقصى يومين في المرة الواحدة، وتخصم من رصيد إجازته السنوية.",
    MATERNITY: "المادة (24): تستحق المرأة العاملة إجازة وضع مدفوعة الأجر بالكامل لمدة (70) يوماً، بشرط أن يتم الوضع خلالها، ولا يجوز تشغيلها قبل انقضاء 40 يوماً من تاريخ الوضع.",
    HAJJ: "المادة (76): للعامل الذي أمضى سنتين متصلتين في خدمة صاحب العمل الحق في إجازة مدفوعة الأجر لمدة (21) يوماً لأداء فريضة الحج، وتمنح لمرة واحدة طوال مدة الخدمة.",
    COMPASSIONATE: "المادة (77): للعامل الحق في إجازة بمرتب كامل لمدة (3) أيام في حالة وفاة قريب من الدرجة الأولى أو الدرجة الثانية.",
    IDDAH: "المادة (77): للمرأة المسلمة التي يتوفى زوجها الحق في إجازة عدة بمرتب كامل لمدة (أربعة أشهر وعشرة أيام) من تاريخ الوفاة، ولا يجوز ممارسة أي عمل لدى الغير خلالها.",
    STUDY: "الباب الرابع: يجوز منح العامل إجازة دراسية للحصول على مؤهل أعلى في مجال العمل، وتحدد شروطها ومدى الالتزام بالراتب وفق الاتفاق أو اللائحة الداخلية.",
    OFFICIAL: "المادة (68): أيام العطل الرسمية المقررة للعامل بأجر كامل تشمل: رأس السنة الهجرية، الإسراء والمعراج، عيد الفطر (3 أيام)، عيد الأضحى (3 أيام)، رأس السنة الميلادية، العيد الوطني، يوم التحرير، والمولد النبوي.",
    PATERNITY: "اللائحة الداخلية: تمنح الشركة إجازة أبوة اختيارية لمدة 3 أيام لمشاركة الأسرة فرحة المولود الجديد، وذلك تعزيزاً للروابط الأسرية."
};

// --- Sub-components ---
const StatsCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <Card className={`border-none shadow-sm rounded-3xl h-32 flex flex-col justify-center overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800`}>
        <div className={`absolute right-0 top-0 w-1 h-full bg-${color}-500 group-hover:w-2 transition-all`}></div>
        <div className="flex items-center gap-4 px-6">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
            </div>
        </div>
    </Card>
);

const PrintableLeaveRequest: React.FC<{ request: DetailedLeaveRequest }> = ({ request }) => {
    return (
        <div className="p-10 space-y-12 relative overflow-hidden text-right" dir="rtl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none -rotate-45 select-none print:opacity-[0.05]">
                <p className="text-[10rem] font-black whitespace-nowrap">نموذج طلب إجازة</p>
            </div>
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">مكتب صبري شطا للمحاماة</h2>
                    <p className="text-sm font-bold text-slate-500">إدارة الموارد البشرية والشؤون الإدارية</p>
                </div>
                <div className="text-left font-mono">
                    <p className="text-sm font-black mb-1">ID: #{request.id.toUpperCase()}</p>
                    <p className="text-sm font-black">Date: {request.requestedAt}</p>
                </div>
            </div>
            <div className="text-center py-6 bg-slate-50 border-y-2 border-slate-200">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">طلب إجازة ومعلومات الرصيد المتبقي</h1>
                <p className="text-sm font-bold text-slate-500 mt-2 tracking-widest uppercase">LEAVE AUTHORIZATION & BALANCE STATEMENT</p>
            </div>
            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">بيانات الموظف / Employee Details</p>
                    <div className="space-y-3 text-sm font-bold">
                        <p className="flex justify-between"><span>الاسم الكامل:</span> <span className="text-lg leading-none">{request.employeeName}</span></p>
                        <p className="flex justify-between"><span>الرقم الوظيفي:</span> <span>{request.employeeId}</span></p>
                        <p className="flex justify-between"><span>القسم / الإدارة:</span> <span>{request.department || 'إدارة المحاماة'}</span></p>
                        <p className="flex justify-between"><span>المسمى الوظيفي:</span> <span>{request.jobTitle || 'عضو فني'}</span></p>
                        {request.emergencyContact && <p className="flex justify-between"><span>هاتف الطوارئ:</span> <span>{request.emergencyContact}</span></p>}
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">تفاصيل الإجازة / Leave Details</p>
                    <div className="space-y-3 text-sm font-bold">
                        <p className="flex justify-between"><span>نوع الإجازة:</span> <span className="text-indigo-600 font-black">{request.leaveType}</span></p>
                        <p className="flex justify-between"><span>من تاريخ:</span> <span>{formatDate(request.startDate)}</span></p>
                        <p className="flex justify-between"><span>إلى تاريخ:</span> <span>{formatDate(request.endDate)}</span></p>
                        {request.substituteEmployeeName && <p className="flex justify-between"><span>الموظف البديل:</span> <span>{request.substituteEmployeeName}</span></p>}
                        <p className="flex justify-between border-t border-slate-100 pt-2 font-black"><span>المدة الإجمالية:</span> <span className="bg-slate-900 text-white px-3 py-1 rounded-lg">{request.numberOfDays} أيـام</span></p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">بيان الأرصدة / Balance Statement</p>
                <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-black text-sm">
                                <th className="p-4">البيان الوصفي</th>
                                <th className="p-4 text-center">عدد الأيام</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold">
                            <tr className="border-b-2">
                                <td className="p-4">إجمالي الرصيد المستحق (حتى تاريخ تقديم الطلب)</td>
                                <td className="p-4 text-center text-emerald-600 font-black">{request.remainingBalanceBefore || 30}</td>
                            </tr>
                            <tr className="border-b-2 bg-slate-50/50">
                                <td className="p-4 italic">ناقصاً: أيام الإجازة الحالية المطلوبة</td>
                                <td className="p-4 text-center text-rose-600 font-black">({request.numberOfDays})</td>
                            </tr>
                            <tr className="bg-emerald-50 text-emerald-900 font-black">
                                <td className="p-4">صافي الرصيد المتبقي (عند استئناف الدوام)</td>
                                <td className="p-4 text-center text-lg">{(request.remainingBalanceBefore || 30) - request.numberOfDays} يـوم</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border-r-8 border-indigo-600 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                     سند قانون العمل الكويتي <ScaleIcon className="w-4" />
                </p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    {request.leaveType === LeaveTypeKuwait.ANNUAL ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.ANNUAL :
                     request.leaveType === LeaveTypeKuwait.SICK ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.SICK :
                     request.leaveType === LeaveTypeKuwait.EMERGENCY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.EMERGENCY :
                     request.leaveType === LeaveTypeKuwait.MATERNITY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.MATERNITY :
                     request.leaveType === LeaveTypeKuwait.HAJJ ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.HAJJ :
                     request.leaveType === LeaveTypeKuwait.COMPASSIONATE ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.COMPASSIONATE :
                     request.leaveType === LeaveTypeKuwait.IDDAH ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.IDDAH :
                     request.leaveType === LeaveTypeKuwait.STUDY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.STUDY :
                     request.leaveType === LeaveTypeKuwait.OFFICIAL_HOLIDAY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.OFFICIAL :
                     request.leaveType === LeaveTypeKuwait.PATERNITY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.PATERNITY :
                     "يخضع طلب هذه الإجازة لموافقة صاحب العمل وفقاً لمقتضيات سير العمل واللوائح المعتمدة في النظام الداخلي للشركة ونصوص قانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010."}
                </p>
            </div>
            <div className="pt-24 grid grid-cols-2 gap-20">
                <div className="space-y-6 text-center">
                    <div className="bg-slate-50 py-2 mb-4 rounded-xl">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">توقيع الموظف / Employee Signature</p>
                    </div>
                    <div className="h-24 flex items-center justify-center italic text-slate-300 font-serif text-3xl select-none">
                        {request.employeeName}
                    </div>
                    <div className="border-b-4 border-slate-900 mx-auto w-3/4"></div>
                    <p className="text-xs text-slate-500 mt-2 font-black">أقر بصحة البيانات المذكورة أعلاه وأوافق على خصم المدة من رصيدي</p>
                </div>
                <div className="space-y-6 text-center">
                    <div className="bg-slate-900 py-2 mb-4 rounded-xl">
                        <p className="text-sm font-black text-white uppercase tracking-widest">اعتماد المدير العام / General Manager</p>
                    </div>
                    <div className="h-24 flex items-center justify-center italic text-slate-900 font-serif text-3xl select-none">
                        S. Shatta
                    </div>
                    <div className="border-b-4 border-slate-900 mx-auto w-3/4"></div>
                    <p className="text-xs text-slate-500 mt-2 font-black italic">يسمح بالإجازة اعتباراً من التاريخ المذكور أعلاه</p>
                </div>
            </div>
            <div className="pt-12 border-t flex justify-between font-black text-[10px] text-slate-400 uppercase tracking-widest italic">
                <span>Adala ERP - Legal Affairs Management System</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const LeaveManagementPage: React.FC = () => {
    const { selectedJurisdiction } = useJurisdiction();
    const [requests, setRequests] = useState<DetailedLeaveRequest[]>(mockLeaveRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DetailedLeaveRequest | null>(null);
    const [isPrintView, setIsPrintView] = useState(false);

    const [formData, setFormData] = useState<Partial<DetailedLeaveRequest>>({
        leaveType: LeaveTypeKuwait.ANNUAL,
        startDate: '',
        endDate: '',
        numberOfDays: 0,
        reason: '',
        employeeId: '',
        employeeName: '',
        isPaid: true,
        paymentPercentage: 100,
        status: 'Pending'
    });

    const filteredRequests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return requests.filter(r => 
            r.employeeName.toLowerCase().includes(term) ||
            r.leaveType.toLowerCase().includes(term)
        );
    }, [requests, searchTerm]);

    const stats = useMemo(() => ({
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        onLeave: requests.filter(r => {
            const today = new Date().toISOString().split('T')[0];
            return r.status === 'Approved' && r.startDate <= today && r.endDate >= today;
        }).length,
        balance: 440
    }), [requests]);

    const handleAddRequest = () => {
        if (!formData.employeeId || !formData.startDate || !formData.endDate) {
            alert('يرجى استيفاء جميع الحقول المطلوبة (الموظف، التواريخ)');
            return;
        }
        const emp = initialEmployees.find(e => e.id === formData.employeeId);
        const newReq: DetailedLeaveRequest = {
            id: `LR-${Date.now()}`,
            employeeId: formData.employeeId!,
            employeeName: emp?.fullNameAr || 'موظف جديد',
            leaveType: formData.leaveType as LeaveTypeKuwait,
            startDate: formData.startDate!,
            endDate: formData.endDate!,
            numberOfDays: calculateNumberOfDays(formData.startDate!, formData.endDate!),
            reason: formData.reason || '',
            status: 'Pending',
            requestedAt: new Date().toISOString().split('T')[0],
            photoUrl: emp?.photoUrl,
            remainingBalanceBefore: 30,
            department: emp?.department,
            jobTitle: emp?.jobTitle
        };
        setRequests([newReq, ...requests]);
        setIsAddModalOpen(false);
        setFormData({ leaveType: LeaveTypeKuwait.ANNUAL, status: 'Pending', isPaid: true, paymentPercentage: 100 });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('هل تريد حذف هذا السجل بشكل نهائي؟')) {
            setRequests(requests.filter(r => r.id !== id));
            setSelectedRequest(null);
        }
    };

    const handleUpdateStatus = (id: string, status: LeaveRequest['status']) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status, approvedAt: status === 'Approved' ? new Date().toISOString().split('T')[0] : undefined } : r));
        setSelectedRequest(null);
    };

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            setFormData(prev => ({ ...prev, numberOfDays: calculateNumberOfDays(prev.startDate!, prev.endDate!) }));
        }
    }, [formData.startDate, formData.endDate]);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 space-y-10">
            {/* Header */}
            <header className="border-b bg-white dark:bg-slate-900 p-8 shadow-sm print:hidden">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl">
                            <CalendarDaysIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">إدارة الإجازات والأرصدة</h1>
                            <p className="text-sm text-slate-400 font-medium italic">أداء احترافي وفق قانون العمل الكويتي (الباب الرابع)</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 font-black border-slate-200" leftIcon={<TableCellsIcon className="w-4"/>}>سجل الأرصدة التراكمي</Button>
                        <Button variant="primary" className="rounded-2xl h-12 px-8 font-black bg-indigo-600 shadow-lg shadow-indigo-600/20" leftIcon={<PlusCircleIcon className="w-5"/>} onClick={() => setIsAddModalOpen(true)}>تقديم طلب إجازة جديد</Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-8 print:hidden">
                {/* Legal Quick Guide Mini Section */}
                <div className="mb-10 p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
                    <ScaleIcon className="absolute -left-10 -bottom-10 w-64 h-64 text-white opacity-[0.03] pointer-events-none" />
                    <div className="text-right z-10">
                        <div className="flex items-center gap-3 mb-2">
                             <ScaleIcon className="w-6 h-6 text-indigo-400" />
                             <h2 className="text-xl font-black">الدليل السريع لإجازات قانون العمل الكويتي</h2>
                        </div>
                        <p className="text-slate-400 text-sm font-bold">ملخص الحقوق المقررة في القانون رقم 6 لسنة 2010 (الباب الرابع)</p>
                    </div>
                    <div className="flex gap-2 z-10 flex-wrap justify-end">
                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-indigo-300 mb-1">السنوية</p>
                            <p className="text-sm font-black italic">30 يوماً</p>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-emerald-300 mb-1">المرضية</p>
                            <p className="text-sm font-black italic">15 فول / 10 ثلاث أرباع</p>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-amber-300 mb-1">الطارئة</p>
                            <p className="text-sm font-black italic">4 أيام سنوياً</p>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-rose-300 mb-1">الوفاة</p>
                            <p className="text-sm font-black italic">3 أيام (درجة 1 و 2)</p>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-indigo-300 mb-1">الحج</p>
                            <p className="text-sm font-black italic">21 يوماً (مرة واحدة)</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatsCard title="طلبات قيد المراجعة" value={stats.pending} color="amber" icon={<ClockIcon/>} />
                    <StatsCard title="على رأس عملهم بالخارج" value={stats.onLeave} color="indigo" icon={<UserGroupIcon/>} />
                    <StatsCard title="تمت الموافقة مؤخراً" value={stats.approved} color="emerald" icon={<CheckCircleIcon/>} />
                    <StatsCard title="إجمالي الأيام المرحلة" value={stats.balance} color="emerald" icon={<CalendarDaysIcon/>} />
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/10 mb-8">
                    <div className="relative flex-1 w-full text-right">
                        <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            placeholder="ابحث باسم الموظف أو نوع الإجازة..." 
                            className="w-full h-12 pr-12 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-bold dark:text-white text-right"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Request List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(req => (
                        <Card key={req.id} className="group border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 cursor-pointer" onClick={() => setSelectedRequest(req)}>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <img src={req.photoUrl || `https://ui-avatars.com/api/?name=${req.employeeName}&background=random`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                                        <div className="text-right">
                                            <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight">{req.employeeName}</h3>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{req.leaveType}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-${getStatusColor(req.status)}-100 dark:bg-${getStatusColor(req.status)}-900/30 text-${getStatusColor(req.status)}-700 dark:text-${getStatusColor(req.status)}-400 ring-1 ring-${getStatusColor(req.status)}-200`}>
                                        {req.status === 'Approved' ? 'معتمد' : req.status === 'Pending' ? 'منتظر' : 'مرفوض'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 text-right">المدة</p>
                                        <p className="font-black text-slate-700 dark:text-slate-200 text-right">{req.numberOfDays} أيـام</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">تبدأ في</p>
                                        <p className="font-black text-slate-700 dark:text-slate-200">{req.startDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
                                    <div className="flex gap-1 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                        <CalendarDaysIcon className="w-4" />
                                        طلب في: {req.requestedAt}
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <EyeIcon className="w-5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {filteredRequests.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto" />
                            <p className="text-slate-400 font-bold">لا يوجد سجلات مطابقة للبحث حالياً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="تقديم طلب إجازة رسمي" size="xl">
                <div className="p-8 space-y-8 text-right" dir="rtl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-black text-slate-400 mb-3 block">الموظف المعني</label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                >
                                    <option value="">اختر الموظف...</option>
                                    {initialEmployees.map(e => <option key={e.id} value={e.id}>{e.fullNameAr}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-black text-slate-400 mb-3 block">تصنيف الإجازة القانوني</label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/10 font-black text-indigo-600 appearance-none"
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({...formData, leaveType: e.target.value as LeaveTypeKuwait})}
                                >
                                    <optgroup label="الإجازات الدورية والأساسية">
                                        <option value={LeaveTypeKuwait.ANNUAL}>{LeaveTypeKuwait.ANNUAL}</option>
                                        <option value={LeaveTypeKuwait.SICK}>{LeaveTypeKuwait.SICK}</option>
                                        <option value={LeaveTypeKuwait.EMERGENCY}>{LeaveTypeKuwait.EMERGENCY}</option>
                                    </optgroup>
                                    <optgroup label="إجازات المناسبات والأسرة">
                                        <option value={LeaveTypeKuwait.MATERNITY}>{LeaveTypeKuwait.MATERNITY}</option>
                                        <option value={LeaveTypeKuwait.HAJJ}>{LeaveTypeKuwait.HAJJ}</option>
                                        <option value={LeaveTypeKuwait.COMPASSIONATE}>{LeaveTypeKuwait.COMPASSIONATE}</option>
                                        <option value={LeaveTypeKuwait.IDDAH}>{LeaveTypeKuwait.IDDAH}</option>
                                        <option value={LeaveTypeKuwait.MARRIAGE}>{LeaveTypeKuwait.MARRIAGE}</option>
                                        <option value={LeaveTypeKuwait.PATERNITY}>{LeaveTypeKuwait.PATERNITY}</option>
                                    </optgroup>
                                    <optgroup label="أخرى">
                                        <option value={LeaveTypeKuwait.STUDY}>{LeaveTypeKuwait.STUDY}</option>
                                        <option value={LeaveTypeKuwait.UNPAID}>{LeaveTypeKuwait.UNPAID}</option>
                                        <option value={LeaveTypeKuwait.OFFICIAL_HOLIDAY}>{LeaveTypeKuwait.OFFICIAL_HOLIDAY}</option>
                                        <option value={LeaveTypeKuwait.OTHER}>{LeaveTypeKuwait.OTHER}</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-black text-slate-400 mb-3 block">تاريخ البدء</label>
                                    <input type="date" className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent font-bold" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-sm font-black text-slate-400 mb-3 block">تاريخ الانتهاء</label>
                                    <input type="date" className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent font-bold" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-black text-slate-400 mb-3 block">المبرر أو السبب</label>
                                <textarea 
                                    className="w-full h-40 p-6 rounded-3xl bg-slate-50 border-transparent font-bold resize-none"
                                    placeholder="يرجى ذكر سبب الطلب هنا..."
                                    value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-dashed border-indigo-200 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">مدة الطلب الحالية</p>
                                    <p className="text-3xl font-black text-indigo-700">{formData.numberOfDays || 0} أيـام</p>
                                </div>
                                <ClockIcon className="w-12 h-12 text-indigo-200" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-end pt-8 border-t">
                        <Button variant="ghost" className="px-8 font-black" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                        <Button variant="primary" className="px-12 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 font-black" onClick={handleAddRequest}>تقديم الطلب رسمياً</Button>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={!!selectedRequest && !isPrintView} onClose={() => setSelectedRequest(null)} title="مراجعة طلب الإجازة" size="lg">
                {selectedRequest && (
                    <div className="space-y-8 p-1 text-right" dir="rtl">
                        <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center gap-8">
                            <img src={selectedRequest.photoUrl || `https://ui-avatars.com/api/?name=${selectedRequest.employeeName}&background=random`} className="w-24 h-24 rounded-3xl object-cover shadow-2xl border-4 border-white" />
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedRequest.employeeName}</h3>
                                <div className="flex items-center gap-4 justify-end">
                                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{selectedRequest.leaveType}</span>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-${getStatusColor(selectedRequest.status)}-100 text-${getStatusColor(selectedRequest.status)}-700`}>
                                        {selectedRequest.status === 'Approved' ? 'معتمد رسمياً' : selectedRequest.status === 'Pending' ? 'تحت التدقيق' : 'مرفوض'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="rounded-[2.5rem] border-slate-100 p-6 text-right">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">تفاصيل المدة</p>
                                <div className="space-y-4 font-bold text-sm">
                                    <div className="flex justify-between border-b pb-2"><span>البداية:</span> <span>{formatDate(selectedRequest.startDate)}</span></div>
                                    <div className="flex justify-between border-b pb-2"><span>النهاية:</span> <span>{formatDate(selectedRequest.endDate)}</span></div>
                                    <div className="flex justify-between items-center pt-2"><span className="text-slate-400">إجمالي الأيام:</span> <span className="text-xl font-black text-indigo-600">{selectedRequest.numberOfDays} يـوم</span></div>
                                </div>
                            </Card>
                            <Card className="rounded-[2.5rem] border-slate-100 p-6 text-right">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">معلومات الرصيد</p>
                                <div className="space-y-4 font-bold text-sm">
                                    <div className="flex justify-between border-b pb-2"><span>الرصيد المتاح:</span> <span>{selectedRequest.remainingBalanceBefore || 30} أيـام</span></div>
                                    <div className="flex justify-between border-b pb-2"><span>المتبقي لاحقاً:</span> <span>{(selectedRequest.remainingBalanceBefore || 30) - selectedRequest.numberOfDays} أيـام</span></div>
                                    <div className="flex justify-between pt-2"><span className="text-slate-400">حالة الراتب:</span> <span className="text-emerald-600">كامل الأجر (100%)</span></div>
                                </div>
                            </Card>
                        </div>
                        <div className="p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-300 mb-2">سبب الطلب</p>
                                <p className="font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">{selectedRequest.reason || 'لم يتم تسجيل سبب للطلب.'}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-700">
                                <p className="text-[10px] font-black text-indigo-400 mb-2 flex items-center gap-2">
                                     السند القانوني الكويتي <ScaleIcon className="w-3" />
                                </p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                    {selectedRequest.leaveType === LeaveTypeKuwait.ANNUAL ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.ANNUAL :
                                     selectedRequest.leaveType === LeaveTypeKuwait.SICK ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.SICK :
                                     selectedRequest.leaveType === LeaveTypeKuwait.EMERGENCY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.EMERGENCY :
                                     selectedRequest.leaveType === LeaveTypeKuwait.MATERNITY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.MATERNITY :
                                     selectedRequest.leaveType === LeaveTypeKuwait.HAJJ ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.HAJJ :
                                     selectedRequest.leaveType === LeaveTypeKuwait.COMPASSIONATE ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.COMPASSIONATE :
                                     selectedRequest.leaveType === LeaveTypeKuwait.IDDAH ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.IDDAH :
                                     selectedRequest.leaveType === LeaveTypeKuwait.STUDY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.STUDY :
                                     selectedRequest.leaveType === LeaveTypeKuwait.OFFICIAL_HOLIDAY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.OFFICIAL :
                                     selectedRequest.leaveType === LeaveTypeKuwait.PATERNITY ? KUWAIT_LABOR_LAW_LEAVE_ARTICLES.PATERNITY :
                                     "يخضع هذا الطلب لموافقة صاحب العمل وفق قانون العمل الكويتي رقم 6 لسنة 2010."}
                                </p>
                            </div>
                        </div>
                        {selectedRequest.status === 'Pending' && (
                            <div className="p-8 bg-indigo-900 rounded-[2.5rem] flex flex-col items-center gap-6 text-white shadow-2xl shadow-indigo-900/40">
                                <p className="font-black text-indigo-200">القرار الإداري الفوري</p>
                                <div className="flex gap-4 w-full">
                                    <Button className="flex-1 rounded-2xl h-14 font-black border-red-400 text-red-100 hover:bg-red-800" variant="outline" onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}>رفض الطلب</Button>
                                    <Button className="flex-1 rounded-2xl h-14 font-black bg-emerald-500 hover:bg-emerald-600" variant="primary" onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}>اعتماد الموافقة</Button>
                                </div>
                            </div>
                        )}
                        <div className="pt-8 border-t flex justify-between items-center">
                            <Button variant="ghost" className="text-rose-500 font-bold" leftIcon={<TrashIcon className="w-4"/>} onClick={() => handleDelete(selectedRequest.id)}>حذف السجل</Button>
                            <div className="flex gap-3">
                                <Button variant="outline" className="rounded-2xl px-8 font-bold" leftIcon={<PrinterIcon className="w-5"/>} onClick={() => setIsPrintView(true)}>عرض الطباعة الرسمي</Button>
                                <Button variant="secondary" className="rounded-2xl px-10 font-bold" onClick={() => setSelectedRequest(null)}>إغلاق</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Print Modal */}
            <Modal isOpen={isPrintView} onClose={() => setIsPrintView(false)} title="معاينة المستند الرسمي للطباعة" size="xl">
                {selectedRequest && (
                    <div className="flex flex-col h-[70vh]">
                        <div className="flex-1 overflow-y-auto bg-white" id="printable-area">
                            <PrintableLeaveRequest request={selectedRequest} />
                        </div>
                        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 font-black">
                            <Button variant="ghost" onClick={() => setIsPrintView(false)}>رجوع</Button>
                            <Button variant="primary" className="rounded-2xl px-12 bg-slate-900" leftIcon={<PrinterIcon className="w-5"/>} onClick={() => window.print()}>طباعة المستند الآن</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeaveManagementPage;
