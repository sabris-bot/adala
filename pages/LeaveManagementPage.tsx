
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import { 
    CalendarDaysIcon, PlusCircleIcon, EyeIcon, CheckCircleIcon, XCircleIcon, 
    PrinterIcon, PaperClipIcon, PencilIcon, UsersIcon, ClockIcon, 
    MagnifyingGlassIcon, FolderIcon, CalculatorIcon, PhoneIcon, UserGroupIcon,
    CurrencyDollarIcon, ArrowUturnLeftIcon, DocumentTextIcon, InformationCircleIcon,
    ScaleIcon, ShieldCheckIcon, CalendarDaysIcon as CalendarIcon, BriefcaseIcon, OFFICE_NAME
} from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    LeaveRequest, LeaveTypeKuwait, Employee, RequestAttachment, 
    DisciplinaryActionStatus, EmployeeRequestStatus 
} from '../types'; 
import { leaveTypeKuwaitOptions, employeeRequestStatusOptions as leaveRequestStatusOptions } from '../constants';
import { Badge, EmployeeRequestStatusBadge as LeaveRequestStatusBadge } from '../components/ui/Badge';
import { initialEmployees } from './EmployeeProfilePage';

import { useJurisdiction } from '../components/JurisdictionContext';
import { Jurisdiction } from '../types';

const StatsCard: React.FC<{ title: string; value: string; icon: React.ReactElement<any>; color: string; trend?: string }> = ({ title, value, icon, color, trend }) => (
    <Card className={`border-b-4 ${color} shadow-sm transition-all hover:shadow-md ring-1 ring-slate-200/50`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
                {trend && <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium bg-slate-50 px-1.5 py-0.5 rounded-full w-fit">{trend}</p>}
            </div>
            <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
            </div>
        </div>
    </Card>
);

// --- Extended Interface for Local Use ---
// We extend the base type to include new detailed fields for this page's logic
interface DetailedLeaveRequest extends LeaveRequest {
    substituteEmployeeId?: string;
    substituteEmployeeName?: string;
    emergencyContact?: string;
    expectedReturnDate?: string;
    isPaid?: boolean;
    paymentPercentage?: number; // 100, 75, 50, 0
}

// --- Types & Interfaces ---
interface LeaveStats {
    totalPending: number;
    onLeaveToday: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
}

// --- Mock Data for Requests ---
export const mockLeaveRequests: DetailedLeaveRequest[] = [
    { 
        id: 'lr1', 
        employeeId: initialEmployees[0]?.id || 'emp1', 
        employeeName: initialEmployees[0]?.fullNameAr || 'أحمد محمود', 
        leaveType: LeaveTypeKuwait.ANNUAL, 
        startDate: '2024-08-01', 
        endDate: '2024-08-05', 
        numberOfDays: 5, 
        reason: 'إجازة صيفية سنوية مع العائلة', 
        status: 'Approved', 
        requestedAt: '2024-07-15', 
        managerComments: 'تمت الموافقة، إجازة سعيدة.', 
        approvedAt: '2024-07-16',
        substituteEmployeeName: 'فاطمة علي حسين',
        emergencyContact: '99998888',
        expectedReturnDate: '2024-08-06',
        isPaid: true,
        paymentPercentage: 100
    },
    { 
        id: 'lr2', 
        employeeId: initialEmployees[1]?.id || 'emp2', 
        employeeName: initialEmployees[1]?.fullNameAr || 'فاطمة علي', 
        leaveType: LeaveTypeKuwait.SICK, 
        startDate: '2024-07-20', 
        endDate: '2024-07-22', 
        numberOfDays: 3, 
        reason: 'وعكة صحية مفاجئة', 
        status: 'Approved', 
        requestedAt: '2024-07-20', 
        managerComments: 'مرفق التقرير الطبي. سلامات.', 
        attachments: [{id:'att1', name:'medical_report.pdf', fileType:'PDF', uploadedAt:'2024-07-20'}],
        expectedReturnDate: '2024-07-23',
        isPaid: true,
        paymentPercentage: 100
    },
    { 
        id: 'lr3', 
        employeeId: initialEmployees[2]?.id || 'emp3', 
        employeeName: initialEmployees[2]?.fullNameAr || 'علي جاسم', 
        leaveType: LeaveTypeKuwait.EMERGENCY, 
        startDate: '2024-09-10', 
        endDate: '2024-09-11', 
        numberOfDays: 2, 
        reason: 'ظرف عائلي طارئ', 
        status: 'Pending', 
        requestedAt: '2024-07-25',
        substituteEmployeeName: 'نورة خالد',
        expectedReturnDate: '2024-09-12',
        isPaid: true,
        paymentPercentage: 100
    },
];

// --- Helper Functions ---
const calculateNumberOfDays = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (endDate < startDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    return diffDays;
};

const getReturnDate = (endDateStr: string): string => {
    if (!endDateStr) return '';
    const date = new Date(endDateStr);
    date.setDate(date.getDate() + 1); // Return next day
    // In a real app, logic to skip weekends (Fri/Sat) would go here
    return date.toISOString().split('T')[0];
};

const getStatusColor = (status: LeaveRequest['status']) => {
    switch(status) {
        case 'Approved': return 'green';
        case 'Pending': return 'yellow';
        case 'Rejected': return 'red';
        case 'Cancelled': return 'gray';
        default: return 'gray';
    }
};

const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', {year:'numeric', month:'long', day:'numeric'}) : '-';

// --- Detailed Sick Leave Calculator ---
const calculateSickLeavePay = (days: number, alreadyTakenThisYear: number, jurisdiction: Jurisdiction): { totalPayPercentage: number, breakdown: string[] } => {
    let remainingDays = days;
    let currentBalance = alreadyTakenThisYear;
    let totalPayRel = 0;
    const breakdown: string[] = [];
    const rules = jurisdiction.laborLaw.sickLeaveRules;

    // Tiers mapping
    const tiers = [
        { limit: rules.fullPayDays, pay: 1, label: 'أجر كامل' },
        { limit: rules.threeQuarterPayDays, pay: 0.75, label: '75% من الأجر' },
        { limit: rules.halfPayDays, pay: 0.5, label: '50% من الأجر' },
        { limit: rules.quarterPayDays, pay: 0.25, label: '25% من الأجر' },
        { limit: rules.noPayDays, pay: 0, label: 'بدون أجر' }
    ];

    for (const tier of tiers) {
        if (remainingDays <= 0) break;
        if (tier.limit === 0) continue;
        
        const availableInTier = Math.max(0, tier.limit - currentBalance);
        if (availableInTier > 0) {
            const daysInThisTier = Math.min(remainingDays, availableInTier);
            totalPayRel += daysInThisTier * tier.pay;
            breakdown.push(`${daysInThisTier} يوم بـ ${tier.label}`);
            remainingDays -= daysInThisTier;
            currentBalance += daysInThisTier;
        } else {
            currentBalance -= tier.limit;
        }
    }

    if (remainingDays > 0) {
        breakdown.push(`${remainingDays} يوم بدون أجر إضافي`);
    }

    return { 
        totalPayPercentage: days > 0 ? (totalPayRel / days) * 100 : 0, 
        breakdown 
    };
};

// --- Form Component ---
interface LeaveRequestFormProps {
    onSubmit: (data: Partial<DetailedLeaveRequest>) => void;
    onCancel: () => void;
    employees: Employee[];
    initialData?: Partial<DetailedLeaveRequest> | null;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSubmit, onCancel, employees, initialData }) => {
    const { selectedJurisdiction } = useJurisdiction();
    const [employeeId, setEmployeeId] = useState(initialData?.employeeId || '');
    const [leaveType, setLeaveType] = useState<LeaveTypeKuwait>(initialData?.leaveType || LeaveTypeKuwait.ANNUAL);
    const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initialData?.endDate || new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState(initialData?.reason || '');
    const [numberOfDays, setNumberOfDays] = useState(initialData?.numberOfDays || 0);
    
    // New Detailed Fields
    const [substituteEmployeeId, setSubstituteEmployeeId] = useState(initialData?.substituteEmployeeId || '');
    const [emergencyContact, setEmergencyContact] = useState(initialData?.emergencyContact || '');
    const [isPaid, setIsPaid] = useState(initialData?.isPaid ?? true);
    const [paymentPercentage, setPaymentPercentage] = useState(initialData?.paymentPercentage || 100);
    
    const [formError, setFormError] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string>(initialData?.attachments?.[0]?.name || '');
    const [sickLeaveBreakdown, setSickLeaveBreakdown] = useState<string[]>([]);

    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    
    // Calculate balances
    const annualEntitlement = selectedEmployee?.annualLeaveEntitlement || selectedJurisdiction.laborLaw.annualLeaveDays;
    const takenThisYear = selectedEmployee?.leaveTakenThisYear || 0;
    const availableBalance = annualEntitlement - takenThisYear;
    const remainingAfterRequest = availableBalance - numberOfDays;

    useEffect(() => {
        const days = calculateNumberOfDays(startDate, endDate);
        setNumberOfDays(days);
        let errorMsg = null;
        
        if (days <= 0 && startDate && endDate) {
            errorMsg = 'تاريخ النهاية يجب أن يكون بعد أو نفس تاريخ البداية.';
        } else if (leaveType === LeaveTypeKuwait.ANNUAL && selectedEmployee && days > availableBalance) {
            errorMsg = `عدد الأيام المطلوبة (${days}) يتجاوز الرصيد المتاح (${availableBalance} أيام).`;
        } 
        
        // Auto logic based on type
        if (leaveType === LeaveTypeKuwait.UNPAID) {
            setIsPaid(false);
            setPaymentPercentage(0);
            setSickLeaveBreakdown([]);
        } else if (leaveType === LeaveTypeKuwait.SICK) {
            const res = calculateSickLeavePay(days, selectedEmployee?.leaveTakenThisYear || 0, selectedJurisdiction);
            setPaymentPercentage(res.totalPayPercentage);
            setSickLeaveBreakdown(res.breakdown);
            setIsPaid(res.totalPayPercentage > 0);
        } else {
            setIsPaid(true);
            setPaymentPercentage(100);
            setSickLeaveBreakdown([]);
        }

        setFormError(errorMsg);
    }, [startDate, endDate, leaveType, selectedEmployee, availableBalance]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId || !startDate || !endDate) {
            alert("يرجى اختيار الموظف وتحديد تواريخ الإجازة."); return;
        }
        if (numberOfDays <= 0) {
            alert("عدد أيام الإجازة يجب أن يكون يومًا واحدًا على الأقل."); return;
        }
        if (formError) {
             alert(formError); return;
        }
        
        const attachments: RequestAttachment[] = attachmentName ? [{id:'att-temp', name: attachmentName, fileType: attachmentName.split('.').pop() || 'unknown', uploadedAt: new Date().toISOString()}] : [];
        const substituteName = employees.find(e => e.id === substituteEmployeeId)?.fullNameAr;

        onSubmit({ 
            ...initialData,
            employeeId, 
            employeeName: selectedEmployee?.fullNameAr || 'غير معروف',
            leaveType, startDate, endDate, numberOfDays, reason, attachments,
            substituteEmployeeId,
            substituteEmployeeName: substituteName,
            emergencyContact,
            expectedReturnDate: getReturnDate(endDate),
            isPaid,
            paymentPercentage
        });
    };
    
    const substituteOptions = employees
        .filter(e => e.id !== employeeId)
        .map(e => ({value: e.id, label: e.fullNameAr}));

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-2">
                <Select 
                    label="اختر الموظف (استيراد من الموارد البشرية)" name="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                    options={[{value: '', label: '--- اختر الموظف ---'}, ...employees.map(emp => ({value: emp.id, label: `${emp.fullNameAr} (${emp.employeeId})`}))]} required
                />
            </div>
            
            {selectedEmployee && (
                <div className="grid grid-cols-2 gap-4 text-xs bg-white p-2 rounded border border-gray-100 italic text-gray-500">
                    <div><span>الوظيفة:</span> <span className="font-bold">{selectedEmployee.jobTitle}</span></div>
                    <div><span>تاريخ الالتحاق:</span> <span className="font-bold">{selectedEmployee.joiningDate}</span></div>
                </div>
            )}

            {/* Visual Balance Indicator */}
            {selectedEmployee && leaveType === LeaveTypeKuwait.ANNUAL && (
                <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800 mb-2 font-semibold flex items-center gap-2">
                        <InformationCircleIcon className="w-4 h-4"/> 
                        بيانات الرصيد السنوي
                    </p>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span>المتاح: <strong className="text-primary">{availableBalance}</strong></span>
                        <span className="text-red-500">- الطلب: {numberOfDays > 0 ? numberOfDays : 0}</span>
                        <span>= المتبقي: <strong className={remainingAfterRequest < 0 ? "text-red-600" : "text-green-600"}>{remainingAfterRequest}</strong></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex">
                        <div className="bg-primary h-2.5 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (remainingAfterRequest / annualEntitlement) * 100))}%` }}></div>
                         {numberOfDays > 0 && remainingAfterRequest >= 0 && (
                            <div className="bg-yellow-400 h-2.5" style={{ width: `${Math.min(100, (numberOfDays / annualEntitlement) * 100)}%` }}></div>
                         )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="نوع الإجازة" name="leaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveTypeKuwait)} options={leaveTypeKuwaitOptions} required />
                <Select label="القائم بالأعمال (البديل)" name="substituteEmployeeId" value={substituteEmployeeId} onChange={(e) => setSubstituteEmployeeId(e.target.value)} options={[{value:'', label:'غير محدد'}, ...substituteOptions]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="تاريخ البداية" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <Input label="تاريخ النهاية" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm text-gray-700 border border-gray-200">
                <div className="flex gap-4">
                    <span>عدد الأيام: <strong>{numberOfDays} يوم</strong></span>
                    <span>تاريخ التحاق الموظف بالعمل (العودة): <strong>{formatDate(getReturnDate(endDate))}</strong></span>
                </div>
            </div>

            {leaveType === LeaveTypeKuwait.SICK && sickLeaveBreakdown.length > 0 && (
                <div className="animate-fade-in p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                        <CalculatorIcon className="w-4 h-4"/> احتساب الراتب للمرضية {selectedJurisdiction.laborLaw.references?.sickLeaveArticle || ''}:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                        {sickLeaveBreakdown.map((line, i) => <li key={i} className="flex justify-between"><span>- {line}</span></li>)}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between font-bold text-sm">
                        <span>نسبة الأجر الإجمالية:</span>
                        <span>{paymentPercentage >= 100 ? 'أجر كامل' : `${paymentPercentage.toFixed(1)}%`}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="هاتف الطوارئ" name="emergencyContact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="00965..." />
                <div className="flex items-center pt-6">
                    <label className="flex items-center cursor-pointer group">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
                            <div className={`block w-10 h-6 rounded-full transition ${isPaid ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isPaid ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="ms-3 text-sm font-medium text-gray-700">إجازة مدفوعة؟ ({paymentPercentage.toFixed(0)}%)</span>
                    </label>
                </div>
            </div>

            {formError && <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-100">{formError}</p>}
            
            <TextArea label="الأسباب والمبررات" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المرفقات الإلزامية (ثبوتيات)</label>
                <div className="flex items-center p-2 border border-gray-300 rounded-md bg-white hover:border-primary transition-colors">
                    <PaperClipIcon className="w-5 h-5 text-gray-400 me-2"/>
                    <input type="text" className="text-sm text-gray-700 flex-grow bg-transparent outline-none" placeholder="أسحب الملف هنا أو اكتب اسمه..." value={attachmentName} onChange={e => setAttachmentName(e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
                <Button type="submit" variant="primary" disabled={!!formError || numberOfDays <= 0} className="px-8">اعتماد الطلب</Button>
            </div>
        </form>
    )
}

// --- Modals ---
const ViewLeaveRequestModal: React.FC<{ request: DetailedLeaveRequest | null; onClose: () => void; onPrint: (request: LeaveRequest) => void; }> = ({ request, onClose, onPrint }) => {
  if (!request) return null;
  return (
    <Modal isOpen={!!request} onClose={onClose} title={`تفاصيل طلب إجازة`} size="lg">
      <div className="space-y-4 p-1">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b pb-3">
            <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold me-3">
                    {request.employeeName.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{request.employeeName}</h3>
                    <p className="text-sm text-gray-500">تاريخ الطلب: {formatDate(request.requestedAt)}</p>
                </div>
            </div>
            <Badge text={request.status} color={getStatusColor(request.status)} size="sm" />
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time & Duration */}
            <Card title="الوقت والمدة" className="bg-gray-50" titleClassName="text-sm text-primary">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">نوع الإجازة:</span> <span className="font-semibold">{request.leaveType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">المدة:</span> <span className="font-bold">{request.numberOfDays} أيام</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">من تاريخ:</span> <span>{formatDate(request.startDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">إلى تاريخ:</span> <span>{formatDate(request.endDate)}</span></div>
                    <div className="flex justify-between border-t pt-1 mt-1"><span className="text-gray-500">العودة المتوقعة:</span> <span className="text-primary font-bold">{formatDate(request.expectedReturnDate) || '-'}</span></div>
                </div>
            </Card>

            {/* Coverage & Financials */}
            <Card title="التغطية والبيانات المالية" className="bg-gray-50" titleClassName="text-sm text-primary">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">الموظف البديل:</span> <span>{request.substituteEmployeeName || 'غير محدد'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">رقم الطوارئ:</span> <span>{request.emergencyContact || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">حالة الراتب:</span> 
                        {request.isPaid ? 
                            <span className="text-green-600 flex items-center"><CurrencyDollarIcon className="w-4 h-4 me-1"/> مدفوعة الأجر</span> : 
                            <span className="text-red-600">بدون راتب</span>
                        }
                    </div>
                </div>
            </Card>
        </div>

        {/* Reason & Comments */}
        <div className="space-y-3">
             <div className="p-3 bg-white border rounded-md">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">السبب / المبرر</p>
                <p className="text-sm text-gray-700">{request.reason || 'لا يوجد سبب مسجل'}</p>
             </div>
             
             {request.attachments && request.attachments.length > 0 && (
                 <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-blue-800 text-sm">
                     <PaperClipIcon className="w-4 h-4"/>
                     <span>مرفق: {request.attachments[0].name}</span>
                 </div>
             )}

             {(request.managerComments || request.rejectionReason) && (
                <div className={`p-3 border rounded-md ${request.status === 'Rejected' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <p className={`text-xs font-bold uppercase mb-1 ${request.status === 'Rejected' ? 'text-red-500' : 'text-green-600'}`}>
                        {request.status === 'Rejected' ? 'سبب الرفض' : 'ملاحظات الموافقة'}
                    </p>
                    <p className="text-sm text-gray-800">{request.rejectionReason || request.managerComments}</p>
                </div>
             )}
        </div>
      </div>

      {(request.status === 'Approved') && (
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button variant="secondary" onClick={() => onPrint(request)} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة القرار</Button>
        </div>
      )}
    </Modal>
  );
};

const ProcessLeaveRequestModal: React.FC<{
  requestToProcess: LeaveRequest | null;
  initialAction: 'approve' | 'reject' | null;
  onClose: () => void;
  onConfirm: (action: 'approve' | 'reject', comments: string, rejectionReason?: string) => void;
}> = ({ requestToProcess, initialAction, onClose, onConfirm }) => {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
      if (requestToProcess && initialAction) {
          setCurrentAction(initialAction);
          setComments(requestToProcess.managerComments || '');
          setRejectionReason(requestToProcess.rejectionReason || '');
      }
  }, [requestToProcess, initialAction]);
  
  if (!requestToProcess || !currentAction) return null;

  return (
    <Modal isOpen={true} onClose={() => { setCurrentAction(null); onClose(); }} title={`معالجة الطلب: ${currentAction === 'approve' ? 'موافقة' : 'رفض'}`} size="md">
      <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">أنت بصدد {currentAction === 'approve' ? 'الموافقة على' : 'رفض'} طلب الإجازة المقدم من <strong>{requestToProcess.employeeName}</strong>.</p>
          <div className="text-xs bg-gray-100 p-2 rounded">
              {requestToProcess.leaveType} | {requestToProcess.numberOfDays} أيام | من {formatDate(requestToProcess.startDate)}
          </div>
      </div>
      <TextArea label="ملاحظات إدارية" value={comments} onChange={e => setComments(e.target.value)} rows={3} placeholder="ملاحظات للحفظ في السجل..." />
      {currentAction === 'reject' && (
        <TextArea label="سبب الرفض (سيظهر للموظف)" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={2} required placeholder="مثال: ضغط العمل، الرصيد لا يسمح..."/>
      )}
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button variant="outline" onClick={() => { setCurrentAction(null); onClose(); }}>إلغاء</Button>
        <Button variant={currentAction === 'approve' ? 'primary' : 'danger'} onClick={() => onConfirm(currentAction!, comments, rejectionReason)} disabled={currentAction === 'reject' && !rejectionReason.trim()}>
          {currentAction === 'approve' ? 'اعتماد الموافقة' : 'تأكيد الرفض'}
        </Button>
      </div>
    </Modal>
  );
};

// --- Annual Leave Calculator Guide Component ---
const LeaveCalculatorCard: React.FC<{ employees: Employee[] }> = ({ employees }) => {
    const { selectedJurisdiction } = useJurisdiction();
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [calcDate, setCalcDate] = useState(new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<{serviceYears: number, entitlement: number, note: string} | null>(null);

    const handleCalculate = () => {
        const emp = employees.find(e => e.id === selectedEmpId);
        if(!emp || !emp.joiningDate) return;

        const join = new Date(emp.joiningDate);
        const calc = new Date(calcDate);
        
        // Calculate diff in years
        const diffTime = Math.abs(calc.getTime() - join.getTime());
        const serviceYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        
        // Dynamic rule
        const annualBase = selectedJurisdiction.laborLaw.annualLeaveDays;
        const entitlement = Math.round(serviceYears * annualBase);
        
        let note = `استحقاق كامل (${annualBase} يوم/سنة).`;
        if(serviceYears < 0.5) note = `${selectedJurisdiction.laborLaw.references?.annualLeaveArticle || 'المادة القانونية'} تقتضي عدم استحقاق إجازة قبل مرور 6 أشهر.`;
        else if (serviceYears < 1) note = "استحقاق نسبي (أكثر من 6 أشهر وأقل من سنة).";

        setResult({ serviceYears, entitlement, note });
    };

    return (
        <Card title="حاسبة استحقاق الإجازة (دليل)" className="border-t-4 border-primary">
            <div className="grid grid-cols-1 gap-2">
                <Select label="اختر الموظف" value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)} options={[{value:'', label:'اختر...'}, ...employees.map(e => ({value: e.id, label: e.fullNameAr}))]} />
                <Input label="تاريخ الحساب" type="date" value={calcDate} onChange={e => setCalcDate(e.target.value)} />
                <Button onClick={handleCalculate} disabled={!selectedEmpId} variant="outline" size="sm" className="mb-2">احسب الاستحقاق</Button>
            </div>
            
            {result && (
                <div className="bg-gray-50 p-3 rounded text-sm mt-2 border">
                    <p><strong>مدة الخدمة:</strong> {result.serviceYears.toFixed(2)} سنة</p>
                    <p><strong>الرصيد التقديري المتراكم:</strong> <span className="text-green-600 font-bold text-lg">{result.entitlement}</span> يوم</p>
                    <p className="text-gray-500 text-xs mt-1">{result.note}</p>
                </div>
            )}
        </Card>
    );
};

// --- Leave Policy Reference Component ---
const LeavePolicyReference: React.FC = () => {
    const { selectedJurisdiction } = useJurisdiction();
    const refs = selectedJurisdiction.laborLaw.references;
    const sick = selectedJurisdiction.laborLaw.sickLeaveRules;

    return (
        <Card title={`الدليل القانوني للإجازات - ${selectedJurisdiction.name}`} icon={<ScaleIcon className="w-5 h-5 text-blue-600"/>} className="bg-slate-900 text-slate-200 border-none shadow-xl ring-1 ring-slate-800">
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{refs?.annualLeaveArticle || 'نص'}</span>
                        <h5 className="text-xs font-bold">السنوية الكاملة</h5>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">تمنح للموظف إجازة {selectedJurisdiction.laborLaw.annualLeaveDays} يوماً مدفوعة الأجر سنوياً.</p>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{refs?.sickLeaveArticle || 'نص'}</span>
                        <h5 className="text-xs font-bold">المرضية المتدرجة</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-[10px] text-slate-400">
                        {sick.fullPayDays > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {sick.fullPayDays}ي: 100%</div>}
                        {sick.threeQuarterPayDays > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> {sick.threeQuarterPayDays}ي: 75%</div>}
                        {sick.halfPayDays > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {sick.halfPayDays}ي: 50%</div>}
                        {sick.quarterPayDays > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {sick.quarterPayDays}ي: 25%</div>}
                    </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">القانون العام</span>
                        <h5 className="text-xs font-bold">النظام القانوني</h5>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">{refs?.lawNameAr || 'قانون العمل الوطني'}</p>
                </div>
            </div>
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 shrink-0"/>
                <p className="text-[10px] text-slate-400">
                    يتم تطبيق هذه القواعد آلياً بناءً على اختيار الدولة في إعدادات النظام.
                </p>
            </div>
        </Card>
    );
};

// --- Employee Leave Report Modal ---
const EmployeeLeaveReportModal: React.FC<{ 
    employee: Employee | null; 
    requests: DetailedLeaveRequest[]; 
    onClose: () => void; 
}> = ({ employee, requests, onClose }) => {
    if (!employee) return null;
    
    const employeeRequests = requests.filter(r => r.employeeId === employee.id);
    const annualTaken = employeeRequests.filter(r => r.leaveType === LeaveTypeKuwait.ANNUAL && r.status === 'Approved').reduce((s, r) => s + r.numberOfDays, 0);
    const sickTaken = employeeRequests.filter(r => r.leaveType === LeaveTypeKuwait.SICK && r.status === 'Approved').reduce((s, r) => s + r.numberOfDays, 0);
    const unpaidTaken = employeeRequests.filter(r => r.leaveType === LeaveTypeKuwait.UNPAID && r.status === 'Approved').reduce((s, r) => s + r.numberOfDays, 0);
    
    return (
        <Modal isOpen={!!employee} onClose={onClose} title={`تقرير الإجازات للموظف: ${employee.fullNameAr}`} size="xl">
            <div className="space-y-6 p-1">
                {/* Summary Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded border text-center">
                        <p className="text-xs text-gray-500">رصيد سنوي متاح</p>
                        <p className="text-xl font-bold">{(employee.annualLeaveEntitlement || 30) - annualTaken}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-100 text-center">
                        <p className="text-xs text-green-600">سنوية مستهلكة</p>
                        <p className="text-xl font-bold text-green-700">{annualTaken}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-100 text-center">
                        <p className="text-xs text-red-600">مرضية (هذا العام)</p>
                        <p className="text-xl font-bold text-red-700">{sickTaken}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border border-purple-100 text-center">
                        <p className="text-xs text-purple-600">إجمالي الطلبات</p>
                        <p className="text-xl font-bold text-purple-700">{employeeRequests.length}</p>
                    </div>
                </div>

                {/* History Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-600">التاريخ</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-600">النوع</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-600">المدة</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-600">الحالة</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-600">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {employeeRequests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2">{formatDate(req.startDate)}</td>
                                    <td className="px-4 py-2 font-medium">{req.leaveType}</td>
                                    <td className="px-4 py-2">{req.numberOfDays} يوم</td>
                                    <td className="px-4 py-2"><Badge text={req.status} color={getStatusColor(req.status)} size="xs"/></td>
                                    <td className="px-4 py-2 text-xs text-gray-500 truncate max-w-[150px]">{req.reason || '-'}</td>
                                </tr>
                            ))}
                            {employeeRequests.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">لا يوجد سجل إجازات سابق.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-4 border-t gap-2">
                    <Button variant="outline" onClick={onClose}>إغلاق</Button>
                    <Button variant="secondary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة التقرير</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Main Page ---
const PrintableLeaveRequestModal: React.FC<{ request: LeaveRequest | null; employees: Employee[]; onClose: () => void }> = ({ request, employees, onClose }) => {
    if (!request) return null;
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
    const employee = employees.find(e => e.id === request.employeeId);
    const substitute = employees.find(e => e.id === (request as any).substituteEmployeeId);

    return (
        <Modal isOpen={!!request} onClose={onClose} title="نموذج طلب إجازة (نسخة الطباعة)" size="lg">
            <div id="printable-leave-content" className="p-10 bg-white text-slate-900 print:p-0" dir="rtl">
                <style>{`
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        #printable-leave-content { p: 0 !important; font-size: 11pt !important; line-height: 1.6; }
                        .no-print { display: none !important; }
                    }
                    .doc-header { border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 2rem; }
                    .doc-title { text-align: center; font-size: 1.6rem; font-weight: 800; margin-bottom: 2rem; color: #1e293b; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; }
                    .signature-box { border: 1px solid #e2e8f0; padding: 1.5rem; text-align: center; border-radius: 8px; min-height: 120px; }
                `}</style>

                <div className="doc-header flex justify-between items-start">
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{OFFICE_NAME}</h2>
                        <p className="text-sm text-slate-500">إدارة الموارد البشرية - نموذج رقم (HR-04)</p>
                    </div>
                    <div className="text-left">
                        <p className="font-bold">تاريخ الطلب: {formatDate(request.requestedAt || new Date().toISOString())}</p>
                    </div>
                </div>

                <h1 className="doc-title">طـلـب إجــازة</h1>

                <div className="info-grid text-sm">
                    <p><strong>اسم الموظف:</strong> {request.employeeName}</p>
                    <p><strong>الرقم الوظيفي:</strong> {employee?.employeeId || '-'}</p>
                    <p><strong>المسمى الوظيفي:</strong> {employee?.jobTitle || '-'}</p>
                    <p><strong>الإدارة / القسم:</strong> {employee?.department || '-'}</p>
                    <p><strong>نوع الإجازة:</strong> {request.leaveType}</p>
                    <p><strong>مدة الإجازة:</strong> {request.numberOfDays} أيـام</p>
                    <p><strong>تبدأ مـن:</strong> {formatDate(request.startDate)}</p>
                    <p><strong>تنتهي في:</strong> {formatDate(request.endDate)}</p>
                    <p><strong>تاريخ العودة للعمل:</strong> {formatDate((request as any).expectedReturnDate || request.endDate)}</p>
                    <p><strong>الموظف البديل:</strong> {substitute?.fullNameAr || 'لا يوجد'}</p>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold mb-2 border-b pb-1">مبررات الطلب / ملاحظات:</h3>
                    <p className="text-sm p-4 bg-slate-50 rounded italic min-h-[60px]">
                        {request.reason || "لا توجد ملاحظات إضافية."}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-12">
                    <div className="signature-box">
                        <p className="font-bold text-xs mb-10">توقيع الموظف</p>
                        <p className="text-[10px]">التاريخ: .....................</p>
                    </div>
                    <div className="signature-box">
                        <p className="font-bold text-xs mb-10">اعتماد المدير المباشر</p>
                        <p className="text-[10px]">التاريخ: .....................</p>
                    </div>
                    <div className="signature-box bg-slate-50">
                        <p className="font-bold text-xs mb-10">مدير الموارد البشرية</p>
                        <p className="text-[10px]">الختم الرسمي</p>
                    </div>
                </div>

                <div className="mt-20 pt-4 border-t border-slate-100 text-[9px] text-slate-400 text-center">
                    تم إصدار هذا النموذج إلكترونياً عبر منظومة عدالة القانونية
                </div>
            </div>

            <div className="flex justify-end p-4 border-t gap-3 no-print bg-slate-50">
                <Button variant="ghost" onClick={onClose}>إغلاق</Button>
                <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>بدء الطباعة</Button>
            </div>
        </Modal>
    );
};

const LeaveManagementPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<DetailedLeaveRequest[]>(mockLeaveRequests);
  const [employees, setEmployees] = useState(initialEmployees);
  
  // Refresh employees list when mounted to ensure sync
  useEffect(() => {
     setEmployees(initialEmployees.map(emp => ({
         ...emp,
         annualLeaveEntitlement: emp.annualLeaveEntitlement || 30,
         leaveTakenThisYear: emp.leaveTakenThisYear || 0
     })));
  }, []);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<DetailedLeaveRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<DetailedLeaveRequest | null>(null);
  const [requestToProcess, setRequestToProcess] = useState<DetailedLeaveRequest | null>(null);
  const [currentActionForModal, setCurrentActionForModal] = useState<'approve' | 'reject' | null>(null);
  const [requestToPrint, setRequestToPrint] = useState<DetailedLeaveRequest | null>(null);
  const [reportingEmployee, setReportingEmployee] = useState<Employee | null>(null);

  // Stats Calculation
  const stats: LeaveStats = useMemo(() => {
      const now = new Date();
      now.setHours(0,0,0,0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      return {
          totalPending: leaveRequests.filter(r => r.status === 'Pending').length,
          onLeaveToday: leaveRequests.filter(r => r.status === 'Approved' && new Date(r.startDate) <= now && new Date(r.endDate) >= now).length,
          approvedThisMonth: leaveRequests.filter(r => r.status === 'Approved' && r.approvedAt && new Date(r.approvedAt) >= startOfMonth).length,
          rejectedThisMonth: leaveRequests.filter(r => r.status === 'Rejected' && r.approvedAt && new Date(r.approvedAt) >= startOfMonth).length,
      };
  }, [leaveRequests]);

  const employeesOnLeave = useMemo(() => {
      const now = new Date();
      now.setHours(0,0,0,0);
      return leaveRequests.filter(r => r.status === 'Approved' && new Date(r.startDate) <= now && new Date(r.endDate) >= now);
  }, [leaveRequests]);

  // Filtering
  const filteredRequests = useMemo(() => {
      return leaveRequests.filter(req => 
          (searchTerm === '' || req.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterType === '' || req.leaveType === filterType) &&
          (filterStatus === '' || req.status === filterStatus)
      ).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [leaveRequests, searchTerm, filterType, filterStatus]);

  // Handlers
  const handleAddOrEditLeaveRequest = (data: Partial<DetailedLeaveRequest>) => {
    let updatedRequests;
    if (editingRequest) { 
        updatedRequests = leaveRequests.map(req => req.id === editingRequest.id ? { ...req, ...data, updatedAt: new Date().toISOString() } as DetailedLeaveRequest : req);
    } else { 
        const newRequest: DetailedLeaveRequest = { ...data, id: `lr-${Date.now()}`, status: 'Pending', requestedAt: new Date().toISOString() } as DetailedLeaveRequest;
        updatedRequests = [newRequest, ...leaveRequests];
    }
    setLeaveRequests(updatedRequests);
    setIsFormModalOpen(false); setEditingRequest(null);
  };

  const handleProcessRequestConfirm = (actionType: 'approve' | 'reject', comments: string, rejectionReason?: string) => {
    if (!requestToProcess) return;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestToProcess.id) {
        const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
        return { ...req, status: newStatus, managerComments: comments, approvedAt: new Date().toISOString(), rejectionReason, updatedAt: new Date().toISOString() };
      }
      return req;
    }));
    setRequestToProcess(null); setCurrentActionForModal(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-2xl me-4 ring-1 ring-blue-100">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">إدارة الإجازات والغياب</h1>
                <p className="text-slate-500 font-medium">حوكمة الاستحقاقات العمالية ومراقبة الدوام قانونياً</p>
            </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
             <Button variant="outline" className="border-slate-300" onClick={() => window.scrollTo({ top: document.getElementById('policy-section')?.offsetTop, behavior: 'smooth'})} leftIcon={<ScaleIcon className="w-5 h-5"/>}>الدليل القانوني</Button>
            <Button onClick={() => { setEditingRequest(null); setIsFormModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
                تقديم طلب إجازة
            </Button>
        </div>
      </div>
      
      {/* Dashboard Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="طلبات معلقة" value={stats.totalPending.toString()} icon={<ClockIcon className="text-orange-500"/>} color="border-orange-500" trend="تحتاج معالجة فورية" />
        <StatsCard title="إجازات جارية (اليوم)" value={stats.onLeaveToday.toString()} icon={<UsersIcon className="text-blue-600"/>} color="border-blue-600" trend={`${((stats.onLeaveToday/employees.length)*100).toFixed(0)}% من طاقة العمل`} />
        <StatsCard title="الموافقات (هذا الشهر)" value={stats.approvedThisMonth.toString()} icon={<CheckCircleIcon className="text-green-600"/>} color="border-green-600" trend="ضمن المعدل الطبيعي" />
        <StatsCard title="معدل الغياب المرضي" value={`${((stats.approvedThisMonth > 0) ? (leaveRequests.filter(r => r.leaveType === LeaveTypeKuwait.SICK).length) : 0)}`} icon={<ShieldCheckIcon className="text-purple-600"/>} color="border-purple-600" trend="دراسة حالة مرضية" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content: Table and Search */}
        <div className="lg:col-span-3 space-y-6">
            <Card className="overflow-hidden border-none shadow-md ring-1 ring-slate-200">
                <div className="bg-slate-50 border-b border-slate-200 p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow">
                            <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                placeholder="ابحث باسم الموظف أو مبرر الإجازة..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="w-full md:w-44">
                            <Select value={filterStatus} options={[{value: '', label: 'كافة الحالات'}, ...leaveRequestStatusOptions]} onChange={e => setFilterStatus(e.target.value)} />
                        </div>
                        <div className="w-full md:w-44">
                            <Select value={filterType} options={[{value: '', label: 'كافة أنواع الإجازات'}, ...leaveTypeKuwaitOptions]} onChange={e => setFilterType(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-right font-bold text-slate-700">الموظف</th>
                                <th className="px-5 py-4 text-right font-bold text-slate-700">نوع الإجازة</th>
                                <th className="px-5 py-4 text-right font-bold text-slate-700">الفترة</th>
                                <th className="px-5 py-4 text-right font-bold text-slate-700">الأيام</th>
                                <th className="px-5 py-4 text-right font-bold text-slate-700">الحالة</th>
                                <th className="px-5 py-4 text-center font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold me-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {req.employeeName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900">{req.employeeName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase transition-colors group-hover:bg-white group-hover:shadow-sm">
                                            {req.leaveType}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-slate-500 text-xs">
                                            <span>{formatDate(req.startDate)}</span>
                                            <span className="mx-1 text-slate-300">←</span>
                                            <span>{formatDate(req.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-mono font-bold text-slate-700">{req.numberOfDays}</td>
                                    <td className="px-5 py-4"><Badge text={req.status} color={getStatusColor(req.status)} size="xs" /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setViewingRequest(req)} className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 shadow-sm border border-transparent hover:border-blue-100" title="عرض">
                                                <EyeIcon className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => setRequestToPrint(req)} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-600 shadow-sm border border-transparent hover:border-slate-100" title="طباعة">
                                                <PrinterIcon className="w-4 h-4"/>
                                            </button>
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => { setRequestToProcess(req); setCurrentActionForModal('approve'); }} className="p-1.5 hover:bg-green-50 rounded-md text-green-600 shadow-sm border border-transparent hover:border-green-100" title="موافقة">
                                                        <CheckCircleIcon className="w-4 h-4"/>
                                                    </button>
                                                    <button onClick={() => { setRequestToProcess(req); setCurrentActionForModal('reject'); }} className="p-1.5 hover:bg-red-50 rounded-md text-red-600 shadow-sm border border-transparent hover:border-red-100" title="رفض">
                                                        <XCircleIcon className="w-4 h-4"/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-20 text-center text-slate-400 italic bg-white flex-col">
                                        <FolderIcon className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                        <span>لم يتم العثور على طلبات مطابقة للمعايير...</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        {/* Sidebar: Utils & Guidelines */}
        <div className="lg:col-span-1 space-y-6">
            <div id="policy-section">
                <LeavePolicyReference />
            </div>

            <Card title="تقارير الموظفين" icon={<DocumentTextIcon className="w-5 h-5 text-blue-600"/>}>
                <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 mb-2 font-medium">اختر موظفاً لعرض سجله وإصدار تقريره:</p>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                        {employees.map(emp => (
                            <div key={emp.id} className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer" onClick={() => setReportingEmployee(emp)}>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-800">{emp.fullNameAr}</span>
                                    <span className="text-[9px] text-slate-400 font-mono italic">{emp.employeeId}</span>
                                </div>
                                <DocumentTextIcon className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
            
            <LeaveCalculatorCard employees={employees} />

            <Card title="إحصائيات الغياب الجاري" icon={<UsersIcon className="w-5 h-5 text-blue-600"/>}>
                <div className="space-y-3">
                    {employeesOnLeave.map(req => (
                        <div key={req.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setViewingRequest(req)}>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">{req.employeeName}</span>
                                <span className="text-[10px] text-slate-500 italic">{req.leaveType}</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded-full ring-1 ring-blue-100">
                                تعود في {new Date(req.endDate).getDate()}/{new Date(req.endDate).getMonth()+1}
                            </span>
                        </div>
                    ))}
                    {employeesOnLeave.length === 0 && <p className="text-xs text-slate-400 text-center py-4 italic">لا يوجد موظفين في إجازة اليوم.</p>}
                </div>
            </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingRequest ? "تعديل طلب" : "طلب إجازة جديد"} size="lg">
        <LeaveRequestForm 
            initialData={editingRequest}
            onSubmit={handleAddOrEditLeaveRequest} 
            onCancel={() => { setIsFormModalOpen(false); setEditingRequest(null); }}
            employees={employees}
        />
      </Modal>

      <ViewLeaveRequestModal request={viewingRequest} onClose={() => setViewingRequest(null)} onPrint={(req) => setRequestToPrint(req as DetailedLeaveRequest)} />
      
      {requestToProcess && currentActionForModal && (
        <ProcessLeaveRequestModal 
            requestToProcess={requestToProcess}
            initialAction={currentActionForModal}
            onClose={() => { setRequestToProcess(null); setCurrentActionForModal(null); }}
            onConfirm={handleProcessRequestConfirm}
        />
      )}
      <PrintableLeaveRequestModal request={requestToPrint} employees={employees} onClose={() => setRequestToPrint(null)} />
       
       <EmployeeLeaveReportModal 
            employee={reportingEmployee} 
            requests={leaveRequests} 
            onClose={() => setReportingEmployee(null)} 
       />

    </div>
  );
};

export default LeaveManagementPage;
