import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { ChatBubbleLeftEllipsisIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon, DocumentTextIcon } from '../constants';
import { 
    Employee, EmployeeRequest, EmployeeRequestType, EmployeeRequestStatus, 
    SalaryCertificateRequestDetails, ExperienceLetterRequestDetails, LeaveEncashmentRequestDetails, 
    GrievanceFormDetails, TransferRequestDetails, DocumentRequestDetails, DataUpdateRequestDetails,
    RequestAttachment, ContractTypeKuwait
} from '../types';
import { employeeRequestTypeOptions, employeeRequestStatusOptions, contractTypeKuwaitOptions } from '../constants';
import { EmployeeRequestStatusBadge } from '../components/ui/Badge';

const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    employeeId: 'EMP001',
    fullNameAr: 'أحمد محمود مبارك',
    fullNameEn: 'Ahmed Mahmoud Mubarak',
    civilId: '285010112345',
    nationality: 'كويتي',
    jobTitle: 'محام أول',
    department: 'القسم التجاري',
    joiningDate: '2018-05-15',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 1200,
    allowances: [{ name: 'بدل سكن', value: 200, subjectToIndemnity: true }, { name: 'بدل انتقال', value: 50 }],
    email: 'ahmed.m@example.com',
    phone: '98765432',
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/emp1/100/100',
    annualLeaveEntitlement: 30,
    leaveTakenThisYear: 5,
    monthlySalaryForLeaveCalc: 1400, 
  },
  {
    id: 'emp-002',
    employeeId: 'EMP002',
    fullNameAr: 'فاطمة علي حسين',
    civilId: '290030323456',
    nationality: 'مصرية',
    jobTitle: 'مساعدة قانونية',
    department: 'قسم القضايا العمالية',
    joiningDate: '2020-01-20',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 750,
    allowances: [{ name: 'بدل سكن', value: 150, subjectToIndemnity: true }],
    email: 'fatima.a@example.com',
    phone: '65432109',
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/emp2/100/100',
    annualLeaveEntitlement: 30,
    leaveTakenThisYear: 10,
    monthlySalaryForLeaveCalc: 900, 
  },
  {
    id: 'emp-003',
    employeeId: 'EMP003',
    fullNameAr: 'علي محمد جاسم',
    civilId: '300070734567',
    nationality: 'كويتي',
    jobTitle: 'سكرتير تنفيذي',
    department: 'الإدارة',
    joiningDate: '2022-11-01',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 600,
    allowances: [],
    status: 'Active',
    annualLeaveEntitlement: 30,
    leaveTakenThisYear: 0,
    monthlySalaryForLeaveCalc: 600,
  }
];

export const initialRequests: EmployeeRequest[] = [ // Added export
  {
    id: 'req1',
    employeeId: 'emp-001',
    employeeName: 'أحمد محمود مبارك',
    requestType: EmployeeRequestType.SALARY_CERTIFICATE,
    requestDate: '2024-07-20',
    status: EmployeeRequestStatus.COMPLETED,
    details: {
      purposeType: 'bank',
      specificRecipient: 'بنك الخليج',
      includeSalaryDetails: true,
      language: 'ar',
    } as SalaryCertificateRequestDetails,
    hrAdminNotes: 'تم إصدار الشهادة وتسليمها للموظف.',
    completionDate: '2024-07-21',
    createdAt: '2024-07-20',
    updatedAt: '2024-07-21',
  },
  {
    id: 'req2',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين',
    requestType: EmployeeRequestType.LEAVE_ENCASHMENT,
    requestDate: '2024-06-15',
    status: EmployeeRequestStatus.APPROVED,
    details: {
      numberOfDays: 5,
      currentLeaveBalance: 20, 
      calculatedAmount: (900/26) * 5, // Use 26 working days for leave calculation
    } as LeaveEncashmentRequestDetails,
    hrAdminNotes: 'تمت الموافقة على تسييل 5 أيام. سيتم الصرف مع راتب الشهر القادم.',
    createdAt: '2024-06-15',
    updatedAt: '2024-06-16',
  },
   {
    id: 'req3',
    employeeId: 'emp-001',
    employeeName: 'أحمد محمود مبارك',
    requestType: EmployeeRequestType.DOCUMENT_REQUEST,
    requestDate: '2024-07-28',
    status: EmployeeRequestStatus.PENDING,
    details: {
      documentNeeded: "نسخة من عقد العمل المجدد",
      reasonForRequest: "لتقديمها لجهة خارجية",
    } as DocumentRequestDetails,
    notes: "أحتاجها بشكل عاجل، شكراً.",
    createdAt: '2024-07-28',
  },
  {
    id: 'req4',
    employeeId: 'emp-003',
    employeeName: 'علي محمد جاسم',
    requestType: EmployeeRequestType.EXPERIENCE_LETTER,
    requestDate: '2024-08-01',
    status: EmployeeRequestStatus.PENDING,
    details: {
      language: 'ar',
      highlightResponsibilities: "سكرتارية تنفيذية، تنظيم مواعيد، إعداد مراسلات."
    } as ExperienceLetterRequestDetails,
    createdAt: '2024-08-01',
  },
  {
    id: 'req5',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين',
    requestType: EmployeeRequestType.GRIEVANCE_FORM,
    requestDate: '2024-07-25',
    status: EmployeeRequestStatus.PROCESSING,
    details: {
      grievanceNature: "تأخير في صرف بدل إضافي",
      detailedDescription: "لم يتم صرف بدل العمل الإضافي عن شهر يونيو 2024 حتى تاريخه.",
      desiredOutcome: "صرف البدل المستحق بأسرع وقت."
    } as GrievanceFormDetails,
    createdAt: '2024-07-25',
  }
];

const getDefaultDetailsForRequestType = (requestType: EmployeeRequestType): EmployeeRequest['details'] => {
    switch (requestType) {
        case EmployeeRequestType.SALARY_CERTIFICATE:
            return {
                purposeType: 'general',
                specificRecipient: '',
                includeSalaryDetails: true,
                language: 'ar',
            } as SalaryCertificateRequestDetails;
        case EmployeeRequestType.EXPERIENCE_LETTER:
            return {
                language: 'ar',
                specificPeriodFrom: undefined,
                specificPeriodTo: undefined,
                highlightResponsibilities: undefined,
            } as ExperienceLetterRequestDetails;
        case EmployeeRequestType.LEAVE_ENCASHMENT:
            return {
                numberOfDays: 0,
                currentLeaveBalance: 0,
                calculatedAmount: 0,
            } as LeaveEncashmentRequestDetails;
        case EmployeeRequestType.GRIEVANCE_FORM:
            return {
                grievanceNature: '',
                detailedDescription: '',
                desiredOutcome: undefined,
            } as GrievanceFormDetails;
        case EmployeeRequestType.TRANSFER_REQUEST:
            return {
                currentDepartment: '',
                currentPosition: '',
                requestedDepartment: '',
                requestedPosition: '',
                reasonForTransfer: '',
            } as TransferRequestDetails;
        case EmployeeRequestType.DOCUMENT_REQUEST:
            return {
                documentNeeded: '',
                reasonForRequest: undefined,
            } as DocumentRequestDetails;
        case EmployeeRequestType.DATA_UPDATE_REQUEST:
            return {
                fieldToUpdate: '',
                oldValue: undefined,
                newValue: '',
                reasonForUpdate: undefined,
            } as DataUpdateRequestDetails;
        case EmployeeRequestType.OTHER:
            return { typeNote: '' };
        default:
            return { typeNote: '' }; // Fallback to a valid type
    }
};

interface EmployeeRequestFormProps {
  initialData?: Partial<EmployeeRequest> | null;
  onSubmit: (data: EmployeeRequest) => void;
  onCancel: () => void;
  employees: Array<Pick<Employee, 'id' | 'fullNameAr' | 'employeeId' | 'annualLeaveEntitlement' | 'leaveTakenThisYear' | 'department' | 'jobTitle' | 'joiningDate'>>;
  isAdminView?: boolean; 
}

const EmployeeRequestForm: React.FC<EmployeeRequestFormProps> = ({ initialData, onSubmit, onCancel, employees, isAdminView = false }) => {
    const [formData, setFormData] = useState<Partial<EmployeeRequest>>({});

    useEffect(() => {
        const defaultData: Partial<EmployeeRequest> = {
            employeeId: isAdminView && employees.length > 0 ? employees[0].id : (employees.find(e => e.id === 'user-id-placeholder') || employees[0])?.id,
            requestType: EmployeeRequestType.SALARY_CERTIFICATE,
            requestDate: new Date().toISOString().split('T')[0],
            status: EmployeeRequestStatus.PENDING,
            details: getDefaultDetailsForRequestType(EmployeeRequestType.SALARY_CERTIFICATE),
            createdAt: new Date().toISOString().split('T')[0],
        };

        if (initialData) {
            setFormData({
                ...defaultData,
                ...initialData,
                details: initialData.details || getDefaultDetailsForRequestType(initialData.requestType || defaultData.requestType!),
            });
        } else {
            setFormData(defaultData);
        }
    }, [initialData, employees, isAdminView]);

  const selectedEmployeeData = employees.find(emp => emp.id === formData.employeeId);
  const availableLeaveBalance = selectedEmployeeData?.annualLeaveEntitlement !== undefined && selectedEmployeeData?.leaveTakenThisYear !== undefined 
                               ? selectedEmployeeData.annualLeaveEntitlement - selectedEmployeeData.leaveTakenThisYear 
                               : 0;


  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value),
      } as EmployeeRequest['details']
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "employeeId") {
        setFormData(prev => {
            const newEmployeeId = value;
            const employee = employees.find(emp => emp.id === newEmployeeId);
            const currentRequestType = prev.requestType || EmployeeRequestType.SALARY_CERTIFICATE;
            const defaultDetails = getDefaultDetailsForRequestType(currentRequestType);
            if (currentRequestType === EmployeeRequestType.TRANSFER_REQUEST && employee) {
                (defaultDetails as TransferRequestDetails).currentDepartment = employee.department;
                (defaultDetails as TransferRequestDetails).currentPosition = employee.jobTitle;
            }
            return { ...prev, employeeId: newEmployeeId, details: defaultDetails };
        });
    } else if (name === "requestType") {
        const newRequestType = value as EmployeeRequestType;
        const defaultDetails = getDefaultDetailsForRequestType(newRequestType);
        const employee = employees.find(emp => emp.id === formData.employeeId);
         if (newRequestType === EmployeeRequestType.TRANSFER_REQUEST && employee) {
            (defaultDetails as TransferRequestDetails).currentDepartment = employee.department;
            (defaultDetails as TransferRequestDetails).currentPosition = employee.jobTitle;
        }
        setFormData(prev => ({ ...prev, requestType: newRequestType, details: defaultDetails }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.requestType) {
      alert("يرجى اختيار الموظف ونوع الطلب.");
      return;
    }
    const employee = employees.find(emp => emp.id === formData.employeeId);
    onSubmit({ 
        ...formData, 
        employeeName: employee?.fullNameAr || 'غير معروف',
        updatedAt: new Date().toISOString().split('T')[0]
    } as EmployeeRequest);
  };
  
  const renderDetailsFields = () => {
    const details = formData.details as any; 
    switch (formData.requestType) {
      case EmployeeRequestType.SALARY_CERTIFICATE:
        return (
          <>
            <Select label="الغرض من الشهادة" name="purposeType" value={details.purposeType || 'general'} onChange={handleDetailChange}
              options={[{value:'general', label:'لمن يهمه الأمر'}, {value:'bank', label:'لبنك'}, {value:'embassy', label:'لسفارة'}, {value:'other', label:'لجهة أخرى (تحدد)'}]}
            />
            {(details.purposeType === 'bank' || details.purposeType === 'embassy' || details.purposeType === 'other') && (
              <Input label="اسم الجهة الموجهة إليها الشهادة" name="specificRecipient" value={details.specificRecipient || ''} onChange={handleDetailChange} />
            )}
            <label className="flex items-center mt-2">
              <input type="checkbox" className="form-checkbox" name="includeSalaryDetails" checked={!!details.includeSalaryDetails} onChange={handleDetailChange} />
              <span className="ms-2 text-sm">تضمين تفاصيل الراتب في الشهادة</span>
            </label>
            <Select label="لغة الشهادة" name="language" value={details.language || 'ar'} onChange={handleDetailChange} options={[{value:'ar', label:'العربية'}, {value:'en', label:'الإنجليزية'}]} />
          </>
        );
      case EmployeeRequestType.EXPERIENCE_LETTER:
        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="تحديد فترة خبرة (من تاريخ)" type="date" name="specificPeriodFrom" value={details.specificPeriodFrom || selectedEmployeeData?.joiningDate || ''} onChange={handleDetailChange} />
                    <Input label="تحديد فترة خبرة (إلى تاريخ)" type="date" name="specificPeriodTo" value={details.specificPeriodTo || new Date().toISOString().split('T')[0]} onChange={handleDetailChange} />
                </div>
                <TextArea label="أهم المسؤوليات المطلوب ذكرها (اختياري)" name="highlightResponsibilities" value={details.highlightResponsibilities || ''} onChange={handleDetailChange} rows={3}/>
                <Select label="لغة الشهادة" name="language" value={details.language || 'ar'} onChange={handleDetailChange} options={[{value:'ar', label:'العربية'}, {value:'en', label:'الإنجليزية'}]} />
            </>
        );
      case EmployeeRequestType.LEAVE_ENCASHMENT:
        return (
          <>
            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">الرصيد السنوي المتاح للتسييل حاليًا: <strong className="text-primary">{availableLeaveBalance}</strong> أيام.</p>
            <Input label="عدد أيام الإجازة المطلوب تسييلها" name="numberOfDays" type="number" value={String(details.numberOfDays || 0)} onChange={handleDetailChange} max={availableLeaveBalance} min={1} required />
            { (details.numberOfDays || 0) > availableLeaveBalance && <p className="text-xs text-danger">العدد المطلوب يتجاوز الرصيد المتاح.</p>}
          </>
        );
      case EmployeeRequestType.GRIEVANCE_FORM:
        return (
            <>
                <Input label="طبيعة التظلم/الشكوى" name="grievanceNature" value={details.grievanceNature || ''} onChange={handleDetailChange} required />
                <TextArea label="وصف تفصيلي للتظلم/الشكوى" name="detailedDescription" value={details.detailedDescription || ''} onChange={handleDetailChange} rows={5} required />
                <TextArea label="النتيجة المرجوة من هذا التظلم (اختياري)" name="desiredOutcome" value={details.desiredOutcome || ''} onChange={handleDetailChange} rows={2}/>
            </>
        );
      case EmployeeRequestType.TRANSFER_REQUEST:
        return (
            <>
                <Input label="القسم الحالي" name="currentDepartment" value={details.currentDepartment || selectedEmployeeData?.department || ''} onChange={handleDetailChange} required />
                <Input label="الوظيفة الحالية" name="currentPosition" value={details.currentPosition || selectedEmployeeData?.jobTitle || ''} onChange={handleDetailChange} required />
                <Input label="القسم المطلوب النقل إليه" name="requestedDepartment" value={details.requestedDepartment || ''} onChange={handleDetailChange} required />
                <Input label="الوظيفة المطلوبة" name="requestedPosition" value={details.requestedPosition || ''} onChange={handleDetailChange} required />
                <TextArea label="سبب طلب النقل" name="reasonForTransfer" value={details.reasonForTransfer || ''} onChange={handleDetailChange} rows={3} required />
            </>
        );
       case EmployeeRequestType.DOCUMENT_REQUEST:
        return (
            <>
                <Input label="اسم المستند المطلوب" name="documentNeeded" value={details.documentNeeded || ''} onChange={handleDetailChange} placeholder="مثال: نسخة من عقد العمل، شهادة تحويل راتب" required />
                <TextArea label="سبب طلب المستند (اختياري)" name="reasonForRequest" value={details.reasonForRequest || ''} onChange={handleDetailChange} rows={2}/>
            </>
        );
      case EmployeeRequestType.DATA_UPDATE_REQUEST:
        return (
            <>
                <Input label="البيان المراد تعديله" name="fieldToUpdate" value={details.fieldToUpdate || ''} onChange={handleDetailChange} placeholder="مثال: العنوان، رقم الهاتف" required />
                <Input label="القيمة القديمة (للتوثيق)" name="oldValue" value={details.oldValue || ''} onChange={handleDetailChange} />
                <Input label="القيمة الجديدة" name="newValue" value={details.newValue || ''} onChange={handleDetailChange} required />
                <TextArea label="سبب طلب التعديل (اختياري)" name="reasonForUpdate" value={details.reasonForUpdate || ''} onChange={handleDetailChange} rows={2}/>
            </>
        );
      case EmployeeRequestType.OTHER:
        return <TextArea label="تفاصيل الطلب الآخر" name="typeNote" value={details.typeNote || ''} onChange={handleDetailChange} rows={4} required />;
      default:
        return <p className="text-gray-500">يرجى اختيار نوع طلب لعرض الحقول المناسبة.</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
      {isAdminView && (
          <Select label="اختيار الموظف" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
      )}
      <Select label="نوع الطلب" name="requestType" value={formData.requestType} options={employeeRequestTypeOptions} onChange={handleChange} required />
      
      <Card title="تفاصيل الطلب" className="bg-gray-50" titleClassName="text-sm">
          {renderDetailsFields()}
      </Card>
      
      <TextArea label="ملاحظات إضافية (اختياري)" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} />
      
      {isAdminView && (
        <Card title="معالجة الطلب (للمسؤول)" className="border-t pt-4" titleClassName="text-sm">
          <Select label="تحديث حالة الطلب" name="status" value={formData.status} options={employeeRequestStatusOptions} onChange={handleChange} />
          <TextArea label="ملاحظات المسؤول/الموارد البشرية" name="hrAdminNotes" value={formData.hrAdminNotes || ''} onChange={handleChange} rows={3} />
        </Card>
      )}

      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary">{formData.id ? 'حفظ التعديلات' : 'تقديم الطلب'}</Button>
      </div>
    </form>
  );
};

// View Leave Request Modal
interface ViewRequestDetailsModalProps {
  request: EmployeeRequest | null;
  employee: Employee | undefined;
  onClose: () => void;
  onUpdateStatus: (requestId: string, newStatus: EmployeeRequestStatus, hrNotes: string) => void;
  onPrintCertificate: (request: EmployeeRequest, employee: Employee) => void;
}
const ViewRequestDetailsModal: React.FC<ViewRequestDetailsModalProps> = ({ request, employee, onClose, onUpdateStatus, onPrintCertificate }) => {
    if (!request) return null;

    const [hrNotes, setHrNotes] = useState(request.hrAdminNotes || '');
    const [newStatus, setNewStatus] = useState(request.status);

    const handleStatusUpdate = () => {
        onUpdateStatus(request.id, newStatus, hrNotes);
        onClose();
    };
    
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';
    const details = request.details as any;

    const canPrintCertificate = (request.status === EmployeeRequestStatus.COMPLETED || request.status === EmployeeRequestStatus.APPROVED) && 
                                (request.requestType === EmployeeRequestType.SALARY_CERTIFICATE || request.requestType === EmployeeRequestType.EXPERIENCE_LETTER);

    return (
        <Modal isOpen={!!request} onClose={onClose} title={`تفاصيل طلب: ${request.requestType} - ${request.employeeName}`} size="lg">
            <div className="space-y-3 max-h-[75vh] overflow-y-auto p-2">
                <Card title="معلومات الطلب الأساسية" className="bg-gray-50" titleClassName="text-sm">
                    <p><strong>الموظف:</strong> {request.employeeName} (ID: {request.employeeId})</p>
                    <p><strong>نوع الطلب:</strong> {request.requestType}</p>
                    <p><strong>تاريخ الطلب:</strong> {formatDate(request.requestDate)}</p>
                    <p><strong>الحالة الحالية:</strong> <EmployeeRequestStatusBadge status={request.status} size="sm"/></p>
                    {request.notes && <p><strong>ملاحظات الموظف:</strong> {request.notes}</p>}
                </Card>
                
                <Card title="تفاصيل محتوى الطلب" className="bg-gray-50" titleClassName="text-sm">
                    {request.requestType === EmployeeRequestType.SALARY_CERTIFICATE && (
                        <>
                            <p><strong>الغرض:</strong> {details.purposeType === 'general' ? 'لمن يهمه الأمر' : `لـ ${details.specificRecipient || details.purposeType}`}</p>
                            <p><strong>تضمين تفاصيل الراتب:</strong> {details.includeSalaryDetails ? 'نعم' : 'لا'}</p>
                            <p><strong>اللغة:</strong> {details.language === 'ar' ? 'العربية' : 'الإنجليزية'}</p>
                        </>
                    )}
                    {request.requestType === EmployeeRequestType.EXPERIENCE_LETTER && (
                         <>
                            <p><strong>لغة الشهادة:</strong> {details.language === 'ar' ? 'العربية' : 'الإنجليزية'}</p>
                            {(details.specificPeriodFrom || details.specificPeriodTo) && (
                                <p><strong>فترة الخبرة المطلوبة:</strong> من {formatDate(details.specificPeriodFrom)} إلى {formatDate(details.specificPeriodTo)}</p>
                            )}
                            {details.highlightResponsibilities && <p><strong>المسؤوليات المطلوب ذكرها:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-1 bg-white border rounded">{details.highlightResponsibilities}</pre></p>}
                        </>
                    )}
                    {request.requestType === EmployeeRequestType.LEAVE_ENCASHMENT && (
                        <p><strong>عدد أيام الإجازة المطلوب تسييلها:</strong> {details.numberOfDays} أيام</p>
                    )}
                     {request.requestType === EmployeeRequestType.DOCUMENT_REQUEST && <p><strong>المستند المطلوب:</strong> {details.documentNeeded}</p>}
                     {request.requestType === EmployeeRequestType.OTHER && <p><strong>تفاصيل الطلب:</strong> {details.typeNote}</p>}
                     {/* Display for other types like Grievance, Transfer, Data Update */}
                     {request.requestType === EmployeeRequestType.GRIEVANCE_FORM && (
                        <>
                            <p><strong>طبيعة التظلم:</strong> {details.grievanceNature}</p>
                            <p><strong>الوصف التفصيلي:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-1 bg-white border rounded">{details.detailedDescription}</pre></p>
                            {details.desiredOutcome && <p><strong>النتيجة المرجوة:</strong> {details.desiredOutcome}</p>}
                        </>
                     )}
                     {request.requestType === EmployeeRequestType.TRANSFER_REQUEST && (
                        <>
                            <p><strong>من:</strong> {details.currentDepartment} - {details.currentPosition}</p>
                            <p><strong>إلى:</strong> {details.requestedDepartment} - {details.requestedPosition}</p>
                            <p><strong>سبب النقل:</strong> {details.reasonForTransfer}</p>
                        </>
                     )}
                     {request.requestType === EmployeeRequestType.DATA_UPDATE_REQUEST && (
                        <>
                            <p><strong>البيان المراد تعديله:</strong> {details.fieldToUpdate}</p>
                            <p><strong>القيمة القديمة:</strong> {details.oldValue || '-'}</p>
                            <p><strong>القيمة الجديدة:</strong> {details.newValue}</p>
                            {details.reasonForUpdate && <p><strong>سبب التعديل:</strong> {details.reasonForUpdate}</p>}
                        </>
                     )}
                </Card>

                <Card title="معالجة الطلب (للمسؤول)" className="border-t pt-3" titleClassName="text-sm">
                    <Select label="تحديث حالة الطلب" value={newStatus} options={employeeRequestStatusOptions} onChange={(e) => setNewStatus(e.target.value as EmployeeRequestStatus)} />
                    <TextArea label="ملاحظات المسؤول/الموارد البشرية" value={hrNotes} onChange={(e) => setHrNotes(e.target.value)} rows={3} className="mt-2"/>
                    <div className="mt-3 flex justify-end space-x-2 space-x-reverse">
                        {canPrintCertificate && employee && (
                             <Button variant="secondary" onClick={() => onPrintCertificate(request, employee)}>عرض/طباعة الشهادة</Button>
                        )}
                        <Button variant="primary" onClick={handleStatusUpdate}>تحديث الحالة</Button>
                    </div>
                </Card>
                {request.completionDate && <p className="text-xs text-gray-500">تاريخ الإكمال: {formatDate(request.completionDate)}</p>}
            </div>
        </Modal>
    );
};

const PrintableCertificateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  request: EmployeeRequest | null;
  employee: Employee | null;
}> = ({ isOpen, onClose, request, employee }) => {
  if (!isOpen || !request || !employee) return null;

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
  const today = formatDate(new Date().toISOString());
  const details = request.details as any;
  const companyName = "[اسم الشركة هنا]"; // Placeholder, should be dynamic
  
  let certificateContent = '';
  let title = "شهادة";

  if (request.requestType === EmployeeRequestType.SALARY_CERTIFICATE) {
    title = "شهادة راتب";
    const totalAllowances = employee.allowances?.reduce((sum, al) => sum + al.value, 0) || 0;
    const totalSalary = employee.basicSalary + totalAllowances;
    const salaryDetailsText = details.includeSalaryDetails ? 
        `ويتقاضى المذكور راتباً أساسياً شهرياً وقدره ( ${employee.basicSalary.toFixed(3)} د.ك )${totalAllowances > 0 ? ` بالإضافة إلى بدلات أخرى شهرية وقدرها ( ${totalAllowances.toFixed(3)} د.ك )، ليصبح إجمالي الراتب الشهري ( ${totalSalary.toFixed(3)} د.ك ).` : '.'}`
        : '';
    const recipientText = details.purposeType === 'general' ? 'لمن يهمه الأمر' 
        : (details.specificRecipient ? `إلى السيد مدير/ ${details.specificRecipient}` : 'لمن يهمه الأمر');

    certificateContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <p>التاريخ: ${today}</p>
            ${details.language === 'en' ? `<p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>` : ''}
        </div>
        <p style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 25px;">${title}</p>
        ${details.language === 'en' ? `<p style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 25px;">Salary Certificate</p>` : ''}
        
        <p style="margin-bottom: 20px;">${recipientText}</p>
        ${details.language === 'en' ? `<p style="margin-bottom: 20px;">${details.purposeType === 'general' ? 'To Whom It May Concern' : (details.specificRecipient ? `To: The Manager, ${details.specificRecipient}` : 'To Whom It May Concern')}</p>` : ''}

        <p>تشهد شركة/مؤسسة ${companyName} بأن السيد/ ${employee.fullNameAr}، ${employee.nationality} الجنسية، حامل البطاقة المدنية رقم (${employee.civilId})، يعمل لدينا بوظيفة (${employee.jobTitle}) اعتبارًا من تاريخ ${formatDate(employee.joiningDate)} وحتى تاريخه.</p>
        ${details.language === 'en' ? `<p>This is to certify that Mr./Ms. ${employee.fullNameEn || employee.fullNameAr}, ${employee.nationality} national, holder of Civil ID No. (${employee.civilId}), is employed by ${companyName} as (${employee.jobTitle}) since ${formatDate(employee.joiningDate)} and is still working with us to date.</p>` : ''}
        
        ${details.includeSalaryDetails ? `<p>${salaryDetailsText}</p>` : ''}
        ${details.includeSalaryDetails && details.language === 'en' ? `<p>The aforementioned employee receives a monthly basic salary of KWD ${employee.basicSalary.toFixed(3)}${totalAllowances > 0 ? `, in addition to other monthly allowances amounting to KWD ${totalAllowances.toFixed(3)}, making the total monthly salary KWD ${totalSalary.toFixed(3)}.` : '.'}</p>` : ''}
        
        <p>وقد أُعطيت له هذه الشهادة بناءً على طلبه، دون أدنى مسؤولية على الشركة تجاه حقوق الغير.</p>
        ${details.language === 'en' ? `<p>This certificate has been issued upon the employee's request, without any liability on the part of the company towards third parties.</p>` : ''}
        
        <div style="margin-top: 40px;">
            <p style="text-align: ${details.language === 'en' ? 'left' : 'right'};">وتفضلوا بقبول فائق الاحترام،</p>
            ${details.language === 'en' ? `<p style="text-align: left;">Sincerely,</p>` : ''}
            <p style="text-align: ${details.language === 'en' ? 'left' : 'right'}; margin-top: 30px;">إدارة الموارد البشرية</p>
            ${details.language === 'en' ? `<p style="text-align: left;">Human Resources Department</p>` : ''}
            <p style="text-align: ${details.language === 'en' ? 'left' : 'right'};">${companyName}</p>
        </div>
    `;
  } else if (request.requestType === EmployeeRequestType.EXPERIENCE_LETTER) {
    title = "شهادة خبرة";
    const periodFrom = details.specificPeriodFrom ? formatDate(details.specificPeriodFrom) : formatDate(employee.joiningDate);
    const periodTo = details.specificPeriodTo ? formatDate(details.specificPeriodTo) : 'تاريخه';
    const periodFromEn = details.specificPeriodFrom ? new Date(details.specificPeriodFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : new Date(employee.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});
    const periodToEn = details.specificPeriodTo ? new Date(details.specificPeriodTo).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : 'date hereof';


    certificateContent = `
        <div style="text-align: center; margin-bottom: 20px;">
             <p>التاريخ: ${today}</p>
            ${details.language === 'en' ? `<p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>` : ''}
        </div>
        <p style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 25px;">${title}</p>
         ${details.language === 'en' ? `<p style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 25px;">Experience Certificate</p>` : ''}

        <p style="margin-bottom: 20px;">لمن يهمه الأمر</p>
        ${details.language === 'en' ? `<p style="margin-bottom: 20px;">To Whom It May Concern</p>` : ''}

        <p>تشهد شركة/مؤسسة ${companyName} بأن السيد/ ${employee.fullNameAr}، ${employee.nationality} الجنسية، حامل البطاقة المدنية رقم (${employee.civilId})، قد عمل لدينا بوظيفة (${employee.jobTitle}) خلال الفترة من ${periodFrom} وحتى ${periodTo}.</p>
        ${details.language === 'en' ? `<p>This is to certify that Mr./Ms. ${employee.fullNameEn || employee.fullNameAr}, ${employee.nationality} national, holder of Civil ID No. (${employee.civilId}), has worked with ${companyName} as (${employee.jobTitle}) during the period from ${periodFromEn} until ${periodToEn}.</p>` : ''}
        
        <p>وخلال فترة عمله معنا، أظهر المذكور كفاءة وتفانياً في أداء مهامه الوظيفية.</p>
        ${details.language === 'en' ? `<p>During his/her tenure with us, he/she demonstrated efficiency and dedication in performing his/her job duties.</p>` : ''}

        ${details.highlightResponsibilities ? `<p>ومن أبرز مسؤولياته كانت: <br/> <pre style="font-family: inherit; white-space: pre-wrap; padding-right:15px;">${details.highlightResponsibilities}</pre></p>` : ''}
        ${details.highlightResponsibilities && details.language === 'en' ? `<p>His/Her key responsibilities included: <br/> <pre style="font-family: inherit; white-space: pre-wrap; padding-left:15px;">${details.highlightResponsibilities}</pre></p>` : ''}
        
        <p>وقد أُعطيت له هذه الشهادة بناءً على طلبه، لتقديمها للجهات التي قد يهمها الأمر، دون أدنى مسؤولية على الشركة.</p>
        ${details.language === 'en' ? `<p>This certificate has been issued upon his/her request, to be presented to whom it may concern, without any liability on the part of the company.</p>` : ''}
        
         <div style="margin-top: 40px;">
            <p style="text-align: ${details.language === 'en' ? 'left' : 'right'};">وتفضلوا بقبول فائق الاحترام،</p>
            ${details.language === 'en' ? `<p style="text-align: left;">Sincerely,</p>` : ''}
            <p style="text-align: ${details.language === 'en' ? 'left' : 'right'}; margin-top: 30px;">إدارة الموارد البشرية</p>
            ${details.language === 'en' ? `<p style="text-align: left;">Human Resources Department</p>` : ''}
            <p style="text-align: ${details.language === 'en' ? 'left' : 'right'};">${companyName}</p>
        </div>
    `;
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div id="printable-certificate-content" className="p-4 print-statement" style={{direction: details.language === 'en' ? 'ltr' : 'rtl'}} dangerouslySetInnerHTML={{ __html: certificateContent }}>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print-hide-in-modal">
        <Button variant="outline" onClick={onClose} className="me-2">إغلاق</Button>
        <Button variant="primary" onClick={() => window.print()}>طباعة الشهادة</Button>
      </div>
    </Modal>
  );
};


const EmployeeRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<EmployeeRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EmployeeRequestType | ''>('');
  const [filterStatus, setFilterStatus] = useState<EmployeeRequestStatus | ''>('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Partial<EmployeeRequest> | null>(null);
  const [viewingRequest, setViewingRequest] = useState<EmployeeRequest | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [requestToPrint, setRequestToPrint] = useState<{request: EmployeeRequest, employee: Employee} | null>(null);


  const filteredRequests = useMemo(() => {
    return requests.filter(req =>
      (req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (req.notes && req.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterType ? req.requestType === filterType : true) &&
      (filterStatus ? req.status === filterStatus : true)
    ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, searchTerm, filterType, filterStatus]);

  const handleAddRequest = () => {
    setEditingRequest(null);
    setIsFormModalOpen(true);
  };

  const handleEditRequest = (req: EmployeeRequest) => { 
    setEditingRequest(req);
    setIsFormModalOpen(true);
  };

  const handleViewRequest = (req: EmployeeRequest) => {
    setViewingRequest(req);
  };
  
  const handleDeleteRequest = useCallback((requestId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب؟')) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  }, []);

  const handleFormSubmit = (data: EmployeeRequest) => {
    let updatedRequests;
    if (editingRequest && editingRequest.id) {
      updatedRequests = requests.map(r => r.id === editingRequest.id ? { ...data, id: r.id, createdAt: r.createdAt } : r);
    } else {
      updatedRequests = [{ ...data, id: `req-${Date.now()}` }, ...requests];
    }
    setRequests(updatedRequests);
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const handleUpdateStatus = (requestId: string, newStatus: EmployeeRequestStatus, hrNotes: string) => {
    setRequests(prevReqs => prevReqs.map(req => {
        if (req.id === requestId) {
            return { 
                ...req, 
                status: newStatus, 
                hrAdminNotes: hrNotes, 
                updatedAt: new Date().toISOString().split('T')[0],
                completionDate: (newStatus === EmployeeRequestStatus.COMPLETED || newStatus === EmployeeRequestStatus.REJECTED || newStatus === EmployeeRequestStatus.CANCELLED) 
                                ? new Date().toISOString().split('T')[0] 
                                : req.completionDate,
            };
        }
        return req;
    }));
    if (viewingRequest && viewingRequest.id === requestId) {
        setViewingRequest(prev => prev ? ({
            ...prev,
            status: newStatus,
            hrAdminNotes: hrNotes,
            updatedAt: new Date().toISOString().split('T')[0],
            completionDate: (newStatus === EmployeeRequestStatus.COMPLETED || newStatus === EmployeeRequestStatus.REJECTED || newStatus === EmployeeRequestStatus.CANCELLED) 
                            ? new Date().toISOString().split('T')[0] 
                            : prev.completionDate,
        }) : null);
    }
  };
  
  const handleOpenPrintModal = (request: EmployeeRequest, employee: Employee) => {
      setRequestToPrint({ request, employee });
      setIsPrintModalOpen(true);
  };

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">طلبات الموظفين الإدارية</h1>
        </div>
        <Button onClick={handleAddRequest} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            تقديم طلب جديد
        </Button>
      </div>

       <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">إدارة طلبات الموظفين</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    تتيح هذه الوحدة للموظفين تقديم طلبات إدارية متنوعة مثل طلب شهادة راتب، شهادة خبرة، تسييل رصيد إجازات، أو تقديم تظلم. كما تمكن الإدارة من متابعة هذه الطلبات ومعالجتها بكفاءة. 
                    <br/>يتم توثيق جميع مراحل الطلب من التقديم وحتى الإنجاز أو الرفض.
                </p>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input placeholder="ابحث باسم الموظف أو ملاحظات..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select label="تصفية بنوع الطلب" options={[{value: '', label: 'الكل'}, ...employeeRequestTypeOptions]} value={filterType} onChange={e => setFilterType(e.target.value as EmployeeRequestType | '')} containerClassName="mb-0"/>
            <Select label="تصفية بالحالة" options={[{value: '', label: 'الكل'}, ...employeeRequestStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as EmployeeRequestStatus | '')} containerClassName="mb-0"/>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {['الموظف', 'نوع الطلب', 'تاريخ الطلب', 'الحالة', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-primary-light/5">
                            <td className="px-3 py-2 whitespace-nowrap font-medium">{req.employeeName}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{req.requestType}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(req.requestDate)}</td>
                            <td className="px-3 py-2 whitespace-nowrap"><EmployeeRequestStatusBadge status={req.status}/></td>
                            <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                                <Button variant="ghost" size="sm" onClick={() => handleViewRequest(req)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditRequest(req)} title="تعديل/معالجة"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                { (req.status === EmployeeRequestStatus.PENDING || req.status === EmployeeRequestStatus.CANCELLED) &&
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(req.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                                }
                            </td>
                        </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>لا توجد طلبات تطابق بحثك.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingRequest(null);}} title={editingRequest?.id ? `تعديل طلب: ${editingRequest.employeeName}` : "تقديم طلب موظف جديد"} size="lg">
          <EmployeeRequestForm 
            initialData={editingRequest} 
            onSubmit={handleFormSubmit} 
            onCancel={() => { setIsFormModalOpen(false); setEditingRequest(null); }} 
            employees={mockEmployees.map(e => ({
                id: e.id, 
                fullNameAr: e.fullNameAr, 
                employeeId: e.employeeId,
                annualLeaveEntitlement: e.annualLeaveEntitlement || 0, 
                leaveTakenThisYear: e.leaveTakenThisYear || 0,
                department: e.department,
                jobTitle: e.jobTitle,
                joiningDate: e.joiningDate,
            }))}
            isAdminView={true} 
          />
      </Modal>
      
      <ViewRequestDetailsModal 
        request={viewingRequest} 
        employee={mockEmployees.find(emp => emp.id === viewingRequest?.employeeId)}
        onClose={() => setViewingRequest(null)} 
        onUpdateStatus={handleUpdateStatus}
        onPrintCertificate={handleOpenPrintModal}
      />

      <PrintableCertificateModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        request={requestToPrint?.request || null}
        employee={requestToPrint?.employee || null}
      />
    </div>
  );
};

export default EmployeeRequestsPage;