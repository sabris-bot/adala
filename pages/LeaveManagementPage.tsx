
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import { CalendarDaysIcon, PlusCircleIcon, EyeIcon, CheckCircleIcon, XCircleIcon, PrinterIcon, PaperClipIcon, PencilIcon, CalculatorIcon, InformationCircleIcon } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { LeaveRequest, LeaveTypeKuwait, Employee, RequestAttachment } from '../types'; 
import { leaveTypeKuwaitOptions } from '../constants';

// Enhanced Mock Data
const mockEmployeeDataForLeave: Array<Pick<Employee, 'id' | 'fullNameAr' | 'department' | 'basicSalary' | 'allowances' | 'joiningDate' | 'serviceYears'> & { annualLeaveEntitlement: number, leaveTakenThisYear: number, monthlySalaryForLeaveCalc: number }> = [
  { id: 'emp1', fullNameAr: 'أحمد محمود مبارك', department: 'الهندسة', joiningDate: '2018-05-15', serviceYears: 6, basicSalary: 1200, allowances: [{ name: 'بدل سكن', value: 200, subjectToIndemnity: true }, {name: 'بدل انتقال', value: 50}], annualLeaveEntitlement: 30, leaveTakenThisYear: 5, monthlySalaryForLeaveCalc: 1450 },
  { id: 'emp2', fullNameAr: 'فاطمة علي حسين', department: 'المبيعات', joiningDate: '2020-01-20', serviceYears: 4, basicSalary: 750, allowances: [{ name: 'بدل سكن', value: 150, subjectToIndemnity: true }], annualLeaveEntitlement: 30, leaveTakenThisYear: 10, monthlySalaryForLeaveCalc: 900 },
  { id: 'emp3', fullNameAr: 'خالد حسن جاسم', department: 'التسويق', joiningDate: '2022-11-01', serviceYears: 1, basicSalary: 600, allowances: [], annualLeaveEntitlement: 30, leaveTakenThisYear: 2, monthlySalaryForLeaveCalc: 600 },
  { id: 'emp4', fullNameAr: 'نورة خالد السبيعي', department: 'الاستشارات', joiningDate: '2019-08-10', serviceYears: 5, basicSalary: 1500, allowances: [{ name: 'بدل خبرة', value: 300, subjectToIndemnity: true }], annualLeaveEntitlement: 30, leaveTakenThisYear: 0, monthlySalaryForLeaveCalc: 1800 },
];

export const mockLeaveRequests: LeaveRequest[] = [
    { id: 'lr1', employeeId: 'emp1', employeeName: 'أحمد محمود مبارك', leaveType: LeaveTypeKuwait.ANNUAL, startDate: '2024-08-01', endDate: '2024-08-05', numberOfDays: 5, reason: 'إجازة صيفية', status: 'Approved', requestedAt: '2024-07-15', managerComments: 'تمت الموافقة، إجازة سعيدة.', approvedAt: '2024-07-16' },
    { id: 'lr2', employeeId: 'emp2', employeeName: 'فاطمة علي حسين', leaveType: LeaveTypeKuwait.SICK, startDate: '2024-07-20', endDate: '2024-07-22', numberOfDays: 3, reason: 'وعكة صحية', status: 'Approved', requestedAt: '2024-07-20', managerComments: 'مرفق التقرير الطبي.', attachments: [{id:'att1', name:'medical_report.pdf', fileType:'PDF', uploadedAt:'2024-07-20'}] },
    { id: 'lr3', employeeId: 'emp3', employeeName: 'خالد حسن جاسم', leaveType: LeaveTypeKuwait.EMERGENCY, startDate: '2024-09-10', endDate: '2024-09-11', numberOfDays: 2, reason: 'ظرف عائلي طارئ', status: 'Pending', requestedAt: '2024-07-25' },
    { id: 'lr4', employeeId: 'emp1', employeeName: 'أحمد محمود مبارك', leaveType: LeaveTypeKuwait.HAJJ, startDate: '2025-05-10', endDate: '2025-05-30', numberOfDays: 21, reason: 'أداء فريضة الحج', status: 'Pending', requestedAt: '2024-08-01'},
    { id: 'lr5', employeeId: 'emp4', employeeName: 'نورة خالد السبيعي', leaveType: LeaveTypeKuwait.MATERNITY, startDate: '2024-10-01', endDate: '2024-12-09', numberOfDays: 70, reason: 'إجازة أمومة', status: 'Approved', requestedAt: '2024-08-05', approvedAt: '2024-08-06'},
    { id: 'lr6', employeeId: 'emp2', employeeName: 'فاطمة علي حسين', leaveType: LeaveTypeKuwait.IDDAH, startDate: '2024-09-01', endDate: '2025-01-10', numberOfDays: 130, reason: 'إجازة عدة (وفاة الزوج)', status: 'Pending', requestedAt: '2024-08-10'},
    { id: 'lr7', employeeId: 'emp3', employeeName: 'خالد حسن جاسم', leaveType: LeaveTypeKuwait.STUDY, startDate: '2024-11-01', endDate: '2024-11-15', numberOfDays: 15, reason: 'حضور دورة تدريبية متخصصة', status: 'Pending', requestedAt: '2024-08-12'},
    { id: 'lr8', employeeId: 'emp4', employeeName: 'نورة خالد السبيعي', leaveType: LeaveTypeKuwait.UNPAID, startDate: '2025-02-01', endDate: '2025-02-28', numberOfDays: 28, reason: 'مرافقة مريض (بدون راتب)', status: 'Rejected', requestedAt: '2024-08-15', managerComments: 'لا يمكن الموافقة حاليًا بسبب ضغط العمل.', rejectionReason: 'ضغط العمل الحالي'},
];

const calculateNumberOfDays = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (endDate < startDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    return diffDays;
};


interface LeaveRequestFormProps {
    onSubmit: (data: Partial<LeaveRequest>) => void;
    onCancel: () => void;
    employees: Array<Pick<Employee, 'id' | 'fullNameAr' | 'serviceYears'> & { annualLeaveEntitlement: number, leaveTakenThisYear: number }>;
    initialData?: Partial<LeaveRequest> | null;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSubmit, onCancel, employees, initialData }) => {
    const [employeeId, setEmployeeId] = useState(initialData?.employeeId || (employees.length > 0 ? employees[0].id : ''));
    const [leaveType, setLeaveType] = useState<LeaveTypeKuwait>(initialData?.leaveType || LeaveTypeKuwait.ANNUAL);
    const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initialData?.endDate || new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState(initialData?.reason || '');
    const [numberOfDays, setNumberOfDays] = useState(initialData?.numberOfDays || 0);
    const [formError, setFormError] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string>(initialData?.attachments?.[0]?.name || '');


    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    const availableBalance = selectedEmployee ? selectedEmployee.annualLeaveEntitlement - selectedEmployee.leaveTakenThisYear : 0;

    useEffect(() => {
        const days = calculateNumberOfDays(startDate, endDate);
        setNumberOfDays(days);
        let errorMsg = null;
        if (days <= 0 && startDate && endDate) {
            errorMsg = 'تاريخ النهاية يجب أن يكون بعد أو نفس تاريخ البداية.';
        } else if (leaveType === LeaveTypeKuwait.ANNUAL && selectedEmployee && days > availableBalance) {
            errorMsg = `عدد الأيام المطلوبة (${days}) يتجاوز الرصيد المتاح (${availableBalance} أيام).`;
        } else if (leaveType === LeaveTypeKuwait.HAJJ && selectedEmployee && (selectedEmployee.serviceYears === undefined || selectedEmployee.serviceYears < 2)) {
            errorMsg = 'إجازة الحج تستحق لمن أمضى سنتين متصلتين في خدمة صاحب العمل.';
        }
        setFormError(errorMsg);
    }, [startDate, endDate, leaveType, selectedEmployee, availableBalance]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId || !startDate || !endDate) {
            alert("يرجى اختيار الموظف وتحديد تواريخ الإجازة.");
            return;
        }
        if (numberOfDays <= 0) {
            alert("عدد أيام الإجازة يجب أن يكون يومًا واحدًا على الأقل.");
            return;
        }
        if (formError) {
             alert(formError);
             return;
        }
        
        const attachments: RequestAttachment[] = attachmentName ? [{id:'att-temp', name: attachmentName, fileType: attachmentName.split('.').pop() || 'unknown', uploadedAt: new Date().toISOString()}] : [];

        onSubmit({ 
            ...initialData,
            employeeId, 
            employeeName: selectedEmployee?.fullNameAr || 'غير معروف',
            leaveType, 
            startDate, 
            endDate, 
            numberOfDays,
            reason,
            attachments
        });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <Select 
                label="اسم الموظف"
                name="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                options={employees.map(emp => ({value: emp.id, label: emp.fullNameAr}))}
                required
            />
            {selectedEmployee && leaveType === LeaveTypeKuwait.ANNUAL && (
                 <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                    الرصيد السنوي المتاح لـ {selectedEmployee.fullNameAr}: <strong className="text-primary">{availableBalance}</strong> أيام.
                </p>
            )}
            {selectedEmployee && leaveType === LeaveTypeKuwait.HAJJ && (
                 <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                    مدة خدمة {selectedEmployee.fullNameAr}: <strong className="text-primary">{selectedEmployee.serviceYears ?? 0}</strong> سنوات. (يشترط سنتان لآجازة الحج)
                </p>
            )}
            <Select 
                label="نوع الإجازة"
                name="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveTypeKuwait)}
                options={leaveTypeKuwaitOptions}
                required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="تاريخ بدء الإجازة" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <Input label="تاريخ انتهاء الإجازة" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <Input label="عدد أيام الإجازة المطلوبة" type="number" value={numberOfDays.toString()} readOnly disabled className="bg-gray-100"/>
            {formError && <p className="text-xs text-danger mt-1">{formError}</p>}
            <TextArea label="السبب / ملاحظات" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            
            <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                    المرفقات (اختياري)
                </label>
                <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                    <PaperClipIcon className="w-5 h-5 text-gray-400 me-2"/>
                    <input 
                        type="text" 
                        id="attachment"
                        name="attachmentName"
                        className="text-sm text-gray-700 flex-grow bg-transparent outline-none"
                        placeholder="اسم الملف المرفق (مثال: report.pdf)"
                        value={attachmentName}
                        onChange={e => setAttachmentName(e.target.value)}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">لأغراض التوضيح فقط. نظام رفع الملفات الفعلي غير مطبق حاليًا.</p>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
                <Button type="submit" variant="primary" disabled={!!formError || numberOfDays <= 0}>تقديم الطلب</Button>
            </div>
        </form>
    )
}

// View Leave Request Modal
interface ViewLeaveRequestModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  onPrint: (request: LeaveRequest) => void;
}
const ViewLeaveRequestModal: React.FC<ViewLeaveRequestModalProps> = ({ request, onClose, onPrint }) => {
  if (!request) return null;
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', {year:'numeric', month:'long', day:'numeric'}) : '-';

  return (
    <Modal isOpen={!!request} onClose={onClose} title={`تفاصيل طلب إجازة: ${request.employeeName}`} size="lg">
      <div className="space-y-3 p-2">
        <p><strong>الموظف:</strong> {request.employeeName} (ID: {request.employeeId})</p>
        <p><strong>نوع الإجازة:</strong> {request.leaveType}</p>
        <p><strong>من تاريخ:</strong> {formatDate(request.startDate)} <strong>إلى تاريخ:</strong> {formatDate(request.endDate)} (إجمالي: {request.numberOfDays} أيام)</p>
        {request.reason && <p><strong>السبب:</strong> {request.reason}</p>}
        <p><strong>تاريخ الطلب:</strong> {formatDate(request.requestedAt)}</p>
        <p><strong>الحالة:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>{request.status}</span></p>
        {request.managerComments && <p><strong>ملاحظات المدير:</strong> {request.managerComments}</p>}
        {request.rejectionReason && <p><strong>سبب الرفض:</strong> {request.rejectionReason}</p>}
        {request.approvedAt && <p><strong>تاريخ الموافقة/الرفض:</strong> {formatDate(request.approvedAt)}</p>}
        {request.attachments && request.attachments.length > 0 && (
          <div><strong>المرفقات:</strong> {request.attachments.map(att => att.name).join(', ')}</div>
        )}
      </div>
      {(request.status === 'Approved') && (
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button variant="secondary" onClick={() => onPrint(request)} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة ملخص الطلب</Button>
        </div>
      )}
    </Modal>
  );
};

// Process Leave Request Modal
interface ProcessLeaveRequestModalProps {
  requestToProcess: LeaveRequest | null;
  initialAction: 'approve' | 'reject' | null;
  onClose: () => void;
  onConfirm: (action: 'approve' | 'reject', comments: string, rejectionReason?: string) => void;
}
const ProcessLeaveRequestModal: React.FC<ProcessLeaveRequestModalProps> = ({ requestToProcess, initialAction, onClose, onConfirm }) => {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
      if (requestToProcess && initialAction) {
          setCurrentAction(initialAction);
          setComments(requestToProcess.managerComments || '');
          setRejectionReason(requestToProcess.rejectionReason || '');
      } else if (!requestToProcess) {
          setCurrentAction(null); // Reset action when modal is closed or no request
      }
  }, [requestToProcess, initialAction]);
  
  if (!requestToProcess || !currentAction) return null;

  const handleConfirm = () => {
    if (currentAction) {
        onConfirm(currentAction, comments, currentAction === 'reject' ? rejectionReason : undefined);
    }
  };

  return (
    <Modal 
        isOpen={!!requestToProcess && !!currentAction} 
        onClose={() => { setCurrentAction(null); onClose(); }} 
        title={`${currentAction === 'approve' ? 'الموافقة على' : 'رفض'} طلب إجازة: ${requestToProcess.employeeName} (${requestToProcess.leaveType})`} 
        size="md"
    >
      <TextArea label="ملاحظات المدير" value={comments} onChange={e => setComments(e.target.value)} rows={3} />
      {currentAction === 'reject' && (
        <TextArea label="سبب الرفض (إلزامي في حالة الرفض)" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={2} required={currentAction === 'reject'}/>
      )}
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button variant="outline" onClick={() => { setCurrentAction(null); onClose(); }}>إلغاء</Button>
        <Button 
          variant={currentAction === 'approve' ? 'primary' : 'danger'} 
          onClick={handleConfirm}
          disabled={currentAction === 'reject' && !rejectionReason.trim()}
        >
          {currentAction === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
        </Button>
      </div>
    </Modal>
  );
};

const PrintableLeaveSummaryModal: React.FC<{ request: LeaveRequest | null, onClose: () => void }> = ({ request, onClose}) => {
    if (!request) return null;
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', {year:'numeric', month:'long', day:'numeric'}) : '-';
    const companyName = "[اسم الشركة هنا]"; // Placeholder

    return (
         <Modal isOpen={!!request} onClose={onClose} title={`طباعة ملخص طلب إجازة`} size="lg">
            <div id="printable-leave-summary" className="p-4 print-statement">
                 <style>{`
                    .print-statement h2 { font-size: 1.3rem; text-align: center; margin-bottom: 1rem; color: #0D47A1; }
                    .print-statement p { margin-bottom: 0.5rem; font-size: 0.9rem; }
                    @media print { .print-hide-in-modal { display: none !important; } }
                `}</style>
                <h2>إشعار بالموافقة على إجازة</h2>
                <p><strong>اسم الموظف:</strong> {request.employeeName}</p>
                <p><strong>الرقم الوظيفي:</strong> {request.employeeId}</p>
                <p><strong>نوع الإجازة:</strong> {request.leaveType}</p>
                <p><strong>الفترة:</strong> من {formatDate(request.startDate)} إلى {formatDate(request.endDate)} (إجمالي: {request.numberOfDays} أيام)</p>
                {request.reason && <p><strong>السبب:</strong> {request.reason}</p>}
                <p><strong>حالة الطلب:</strong> {request.status}</p>
                {request.managerComments && <p><strong>ملاحظات المدير:</strong> {request.managerComments}</p>}
                <p><strong>تاريخ الموافقة:</strong> {formatDate(request.approvedAt)}</p>
                <div style={{marginTop: "30px", textAlign:"right"}}>
                    <p>مع خالص التمنيات بإجازة سعيدة،</p>
                    <p>إدارة الموارد البشرية</p>
                    <p>{companyName}</p>
                </div>
            </div>
             <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print-hide-in-modal">
                <Button variant="outline" onClick={onClose} className="me-2">إغلاق</Button>
                <Button variant="primary" onClick={() => window.print()}>طباعة</Button>
            </div>
        </Modal>
    );
};


const getStatusColor = (status: LeaveRequest['status']) => {
    switch(status) {
        case 'Approved': return 'bg-success/20 text-success';
        case 'Pending': return 'bg-warning/20 text-yellow-700';
        case 'Rejected': return 'bg-danger/20 text-danger';
        case 'Cancelled': return 'bg-gray-500/20 text-gray-700';
        default: return 'bg-gray-200 text-gray-800';
    }
};


interface AnnualLeaveGuideResults {
    serviceDurationText: string;
    statutoryLeaveDays: number;
    leaveDayValue: number;
    totalLeaveValue: number;
    notes: string[];
}

const LeaveManagementPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [employees, setEmployees] = useState(mockEmployeeDataForLeave);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);
  const [requestToProcess, setRequestToProcess] = useState<LeaveRequest | null>(null);
  const [currentActionForModal, setCurrentActionForModal] = useState<'approve' | 'reject' | null>(null);
  const [requestToPrint, setRequestToPrint] = useState<LeaveRequest | null>(null);

  // State for Annual Leave Calculation Guide
  const [selectedEmployeeIdForGuide, setSelectedEmployeeIdForGuide] = useState<string>(mockEmployeeDataForLeave.length > 0 ? mockEmployeeDataForLeave[0].id : '');
  const [calculationDateForGuide, setCalculationDateForGuide] = useState<string>(new Date().toISOString().split('T')[0]);
  const [annualLeaveGuideResults, setAnnualLeaveGuideResults] = useState<AnnualLeaveGuideResults | null>(null);


  const calculateMonthlySalaryForLeave = (employee: Pick<Employee, 'basicSalary' | 'allowances'>) => {
    return employee.basicSalary + (employee.allowances?.reduce((sum, al) => sum + al.value, 0) || 0);
  };

  const calculateServiceDurationYears = (joiningDate: string): number => {
    const start = new Date(joiningDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const m = now.getMonth() - start.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < start.getDate())) {
        years--;
    }
    return years < 0 ? 0 : years; 
  };

  useEffect(() => { 
    setEmployees(prevEmployees => prevEmployees.map(emp => ({
        ...emp,
        serviceYears: calculateServiceDurationYears(emp.joiningDate),
        monthlySalaryForLeaveCalc: calculateMonthlySalaryForLeave(emp) 
    })));
  }, []); 

  const handleAddOrEditLeaveRequest = (data: Partial<LeaveRequest>) => {
    let updatedRequests;
    if (editingRequest) { 
        updatedRequests = leaveRequests.map(req => 
            req.id === editingRequest.id ? { ...req, ...data, updatedAt: new Date().toISOString() } as LeaveRequest : req
        );
    } else { 
        const newRequest: LeaveRequest = {
            ...data,
            id: `lr-${Date.now()}`,
            status: 'Pending',
            requestedAt: new Date().toISOString(),
        } as LeaveRequest;
        updatedRequests = [newRequest, ...leaveRequests];
    }
    setLeaveRequests(updatedRequests);
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const handleProcessRequestConfirm = (actionType: 'approve' | 'reject', comments: string, rejectionReason?: string) => {
    if (!requestToProcess) return;
    setLeaveRequests(prevReqs => prevReqs.map(req => {
      if (req.id === requestToProcess.id) {
        const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
        if (newStatus === 'Approved' && req.leaveType === LeaveTypeKuwait.ANNUAL) {
            setEmployees(prevEmps => prevEmps.map(emp => 
                emp.id === req.employeeId ? { ...emp, leaveTakenThisYear: (emp.leaveTakenThisYear || 0) + (req.numberOfDays || 0) } : emp
            ));
        }
        return {
          ...req,
          status: newStatus,
          managerComments: comments,
          approvedAt: new Date().toISOString(),
          rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
    setRequestToProcess(null);
    setCurrentActionForModal(null);
  };
  
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  const calculateAnnualLeaveGuide = useCallback(() => {
    const employee = employees.find(emp => emp.id === selectedEmployeeIdForGuide);
    if (!employee || !employee.joiningDate) {
        setAnnualLeaveGuideResults(null);
        return;
    }

    const joiningDate = new Date(employee.joiningDate);
    const calcDate = new Date(calculationDateForGuide);
    calcDate.setHours(23,59,59,999); // Ensure end of day for calculation date

    if (joiningDate > calcDate) {
        setAnnualLeaveGuideResults({
            serviceDurationText: "تاريخ الالتحاق بعد تاريخ الحساب.",
            statutoryLeaveDays: 0,
            leaveDayValue: 0,
            totalLeaveValue: 0,
            notes: ["تاريخ الالتحاق يجب أن يكون قبل أو نفس تاريخ الحساب."]
        });
        return;
    }

    let years = calcDate.getFullYear() - joiningDate.getFullYear();
    let months = calcDate.getMonth() - joiningDate.getMonth();
    let days = calcDate.getDate() - joiningDate.getDate();

    if (days < 0) {
        months--;
        const prevMonthLastDay = new Date(calcDate.getFullYear(), calcDate.getMonth(), 0).getDate();
        days += prevMonthLastDay;
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    days +=1; // Inclusive day
    const currentMonthDays = new Date(joiningDate.getFullYear() + years, joiningDate.getMonth() + months +1, 0).getDate();
    if (days >= currentMonthDays) {
        days -= currentMonthDays;
        months++;
        if (months >= 12) {
            months -= 12;
            years++;
        }
    }

    const totalServiceDays = (calcDate.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const totalServiceMonths = totalServiceDays / (365.25 / 12);
    const totalServiceYearsDecimal = totalServiceDays / 365.25;
    
    let statutoryLeaveDays = 0;
    const notes: string[] = [];

    if (totalServiceYearsDecimal < 0.5) { // Less than 6 months
        statutoryLeaveDays = 0;
        notes.push("المادة 70: لا يستحق العامل إجازة سنوية إلا بعد إتمام 6 أشهر خدمة على الأقل.");
    } else if (totalServiceYearsDecimal < 1) { // Between 6 months and less than 1 year
        statutoryLeaveDays = Math.round((totalServiceMonths / 12) * 30);
        notes.push("المادة 70: استحقاق تناسبي بعد إتمام 6 أشهر وقبل إتمام سنة كاملة (30 يوم / سنة).");
    } else { // 1 year or more
        statutoryLeaveDays = 30;
        notes.push("المادة 70: يستحق العامل 30 يومًا إجازة سنوية مدفوعة الأجر بعد إتمام سنة خدمة.");
    }
    
    const leaveDayValue = employee.monthlySalaryForLeaveCalc / 26;
    const totalLeaveValue = statutoryLeaveDays * leaveDayValue;
    
    notes.push("المادة 72: يُحسب مقابل الإجازة السنوية على أساس آخر أجر كان يتقاضاه العامل (يشمل الراتب الأساسي وكافة البدلات الدورية).");
    notes.push("يُقسم الراتب الشهري على 26 يومًا لتحديد قيمة اليوم الواحد لأغراض حساب الإجازة.");
    notes.push("هذا الحساب استدلالي للحد الأدنى القانوني، وقد تمنح الشركة رصيدًا إضافيًا أو تطبق سياسات مختلفة ضمن إطار القانون.");


    setAnnualLeaveGuideResults({
        serviceDurationText: `${years} سنوات, ${months} أشهر, و ${days} أيام (إجمالي تقريبي: ${totalServiceYearsDecimal.toFixed(2)} سنوات)`,
        statutoryLeaveDays,
        leaveDayValue,
        totalLeaveValue,
        notes
    });

  }, [selectedEmployeeIdForGuide, calculationDateForGuide, employees]);

  useEffect(() => {
      calculateAnnualLeaveGuide();
  }, [calculateAnnualLeaveGuide]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <CalendarDaysIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">إدارة الإجازات للموظفين</h1>
        </div>
         <Button onClick={() => { setEditingRequest(null); setIsFormModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            تقديم طلب إجازة جديد
        </Button>
      </div>
      
      <Card title="ملخص سياسات الإجازات (وفق قانون العمل الكويتي للقطاع الأهلي - رقم 6 لسنة 2010)">
        <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
            <li><strong>الإجازة السنوية (المادة 70):</strong> يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 30 يومًا بعد إتمام سنة خدمة فعلية أولى. لا تحسب أيام العطل الرسمية والأعياد والإجازات المرضية ضمن الإجازة السنوية. <strong>(المادة 72)</strong> بدل الإجازة السنوية (أو المقابل النقدي لها) يُحسب على أساس آخر أجر كان يتقاضاه العامل (يشمل الراتب الأساسي وكافة البدلات الدورية). <strong>(المادة 71)</strong> يستحق العامل أجرًا عن أيام إجازته التي لم يحصل عليها إذا انتهت خدمته قبل استعمالها، بنسبة ما قضاه من خدمة خلال السنة. <strong>(المادة 73)</strong> لصاحب العمل الحق في تحديد موعد الإجازة السنوية أو تجزئتها برضاء العامل بعد النصف الأول منها.</li>
            <li><strong>الإجازات المرضية (بتقرير طبي معتمد - المادة 29):</strong> يستحق العامل خلال السنة ما يلي:
                <ul className="list-circle list-inside ps-6">
                    <li>الخمسة عشر يومًا الأولى: بأجر كامل.</li>
                    <li>العشرة أيام التالية: بثلاثة أرباع الأجر.</li>
                    <li>العشرة أيام التالية: بنصف الأجر.</li>
                    <li>العشرة أيام التالية: بربع الأجر.</li>
                    <li>الثلاثون يومًا التالية: بدون أجر. (إجمالي 75 يومًا سنويًا كحد أقصى).</li>
                </ul>
            </li>
            <li><strong>إجازة الحج (المادة 76):</strong> 21 يومًا مدفوعة الأجر، تمنح مرة واحدة طوال مدة الخدمة لمن أمضى سنتين متصلتين في خدمة صاحب العمل ولم يسبق له الحج.</li>
            <li><strong>إجازة الأمومة (المادة 24):</strong> للمرأة العاملة الحق في إجازة وضع مدفوعة الأجر لمدة 70 يومًا، لا تحسب من إجازاتها الأخرى، بشرط أن تضع حملها خلالها. يجوز لصاحب العمل منحها إجازة بدون أجر بعد إجازة الوضع لمدة لا تزيد على أربعة أشهر لرعاية الطفولة.</li>
            <li><strong>إجازة العدة (المادة 77):</strong> للمرأة المسلمة التي يتوفى زوجها الحق في إجازة عدة بأجر كامل لمدة أربعة أشهر وعشرة أيام من تاريخ الوفاة.</li>
            <li><strong>إجازات أخرى محتملة (حسب سياسة الشركة أو الاتفاق):</strong> إجازة دراسية، إجازة زواج، إجازة أبوة، إجازة وفاة قريب، إجازة طارئة، إجازة بدون راتب. تخضع هذه لشروط الشركة.</li>
            <li><strong>(المادة 74)</strong> لا يجوز للعامل النزول عن حقه في الإجازة السنوية، وله الحق في أن يتقاضى مقابلاً نقدياً عنها.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">ملاحظة: هذا ملخص عام. يجب الرجوع إلى نصوص القانون واللوائح التنفيذية وقرارات الشركة للحصول على التفاصيل الدقيقة والشروط الكاملة.</p>
      </Card>

      <Card title="أرصدة الإجازات السنوية والقيمة التقديرية (مثال توضيحي)">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        {['اسم الموظف', 'القسم', 'مدة الخدمة (تقريبي)', 'الراتب الشهري (للحساب)', 'قيمة يوم الإجازة', 'الرصيد السنوي', 'المأخوذ', 'المتبقي', 'قيمة الرصيد المتبقي'].map(h => (
                           <th key={h} className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map(emp => {
                        const leaveDayValue = emp.monthlySalaryForLeaveCalc / 26; 
                        const remainingBalance = (emp.annualLeaveEntitlement || 0) - (emp.leaveTakenThisYear || 0);
                        const remainingBalanceValue = leaveDayValue * remainingBalance;
                        return (
                            <tr key={emp.id}>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{emp.fullNameAr}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{emp.department}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{emp.serviceYears ?? 0} سنوات</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{emp.monthlySalaryForLeaveCalc.toFixed(3)} د.ك</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{leaveDayValue.toFixed(3)} د.ك</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{emp.annualLeaveEntitlement}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{emp.leaveTakenThisYear}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{remainingBalance}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-primary">{remainingBalanceValue.toFixed(3)} د.ك</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </Card>

      {/* Annual Leave Calculation Guide Section - NEW */}
      <Card title="دليل حساب الإجازة السنوية (استدلالي وفق قانون العمل الكويتي)" className="border-t-4 border-primary-light">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
                label="اختر الموظف"
                value={selectedEmployeeIdForGuide}
                onChange={(e) => setSelectedEmployeeIdForGuide(e.target.value)}
                options={employees.map(emp => ({ value: emp.id, label: emp.fullNameAr }))}
            />
            <Input
                label="تاريخ الحساب المرجعي"
                type="date"
                value={calculationDateForGuide}
                onChange={(e) => setCalculationDateForGuide(e.target.value)}
            />
        </div>
        {annualLeaveGuideResults ? (
            <div className="space-y-2 text-sm p-3 bg-gray-50 rounded-md">
                <p><strong>مدة الخدمة المحسوبة حتى {formatDate(calculationDateForGuide)}:</strong> {annualLeaveGuideResults.serviceDurationText}</p>
                <p><strong>رصيد الإجازة السنوية المستحق قانونًا (تقديري):</strong> <strong className="text-lg text-blue-600">{annualLeaveGuideResults.statutoryLeaveDays}</strong> أيام</p>
                <p><strong>قيمة يوم الإجازة الواحد (تقديري):</strong> <strong className="text-blue-600">{annualLeaveGuideResults.leaveDayValue.toFixed(3)}</strong> د.ك</p>
                <p><strong>القيمة الإجمالية التقديرية لرصيد الإجازة المستحق:</strong> <strong className="text-lg text-green-600">{annualLeaveGuideResults.totalLeaveValue.toFixed(3)}</strong> د.ك</p>
                <div className="mt-3 pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-700">ملاحظات قانونية هامة:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 ps-4">
                        {annualLeaveGuideResults.notes.map((note, idx) => <li key={idx}>{note}</li>)}
                    </ul>
                </div>
            </div>
        ) : (
             <div className="flex items-center justify-center p-6 bg-gray-50 rounded-md">
                <InformationCircleIcon className="w-6 h-6 text-gray-400 me-2"/>
                <p className="text-gray-500">يرجى اختيار موظف وتاريخ لحساب استحقاق الإجازة.</p>
            </div>
        )}
      </Card>


      <Card title="طلبات الإجازات المقدمة">
        {leaveRequests.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            {['اسم الموظف', 'نوع الإجازة', 'من تاريخ', 'إلى تاريخ', 'السبب', 'تاريخ الطلب', 'الحالة', 'إجراءات'].map(h => (
                                <th key={h} className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leaveRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{req.employeeName}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{req.leaveType}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(req.startDate)}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(req.endDate)}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate" title={req.reason}>{req.reason || '-'}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(req.requestedAt)}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm space-x-1 space-x-reverse">
                                    <Button variant="ghost" size="sm" onClick={() => setViewingRequest(req)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-blue-600" /></Button>
                                    {req.status === 'Pending' && (
                                        <>
                                        <Button variant="ghost" size="sm" onClick={() => { setRequestToProcess(req); setCurrentActionForModal('approve'); }} title="موافقة"><CheckCircleIcon className="w-4 h-4 text-success" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => { setRequestToProcess(req); setCurrentActionForModal('reject'); }} title="رفض"><XCircleIcon className="w-4 h-4 text-danger" /></Button>
                                        </>
                                    )}
                                     <Button variant="ghost" size="sm" onClick={() => {setEditingRequest(req); setIsFormModalOpen(true);}} title="تعديل الطلب"><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-center text-gray-500 py-4">لا توجد طلبات إجازة حالية.</p>
        )}
      </Card>
      
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingRequest ? `تعديل طلب إجازة: ${editingRequest.employeeName}` : "تقديم طلب إجازة جديد"}>
        <LeaveRequestForm 
            initialData={editingRequest}
            onSubmit={handleAddOrEditLeaveRequest} 
            onCancel={() => { setIsFormModalOpen(false); setEditingRequest(null); }}
            employees={employees.map(e => ({
                id: e.id, 
                fullNameAr: e.fullNameAr, 
                annualLeaveEntitlement: e.annualLeaveEntitlement, 
                leaveTakenThisYear: e.leaveTakenThisYear,
                serviceYears: e.serviceYears
            }))}
        />
      </Modal>

      <ViewLeaveRequestModal request={viewingRequest} onClose={() => setViewingRequest(null)} onPrint={(req) => setRequestToPrint(req)} />
      
      {requestToProcess && currentActionForModal && (
        <ProcessLeaveRequestModal 
            requestToProcess={requestToProcess}
            initialAction={currentActionForModal}
            onClose={() => { setRequestToProcess(null); setCurrentActionForModal(null); }}
            onConfirm={(actionType, comments, rejectionReason) => {
                 handleProcessRequestConfirm(actionType, comments, rejectionReason);
            }}
        />
      )}
       <PrintableLeaveSummaryModal request={requestToPrint} onClose={() => setRequestToPrint(null)} />

    </div>
  );
};

export default LeaveManagementPage;
