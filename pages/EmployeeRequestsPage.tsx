
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import PrintHeader from '../components/ui/PrintHeader';
import { ChatBubbleLeftEllipsisIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon, DocumentTextIcon, PrinterIcon, CheckCircleIcon, XCircleIcon, OFFICE_NAME, ScaleIcon } from '../constants';
import { 
    Employee, EmployeeRequest, EmployeeRequestType, EmployeeRequestStatus, 
    SalaryCertificateRequestDetails, ExperienceLetterRequestDetails, LeaveEncashmentRequestDetails, 
    GrievanceFormDetails, TransferRequestDetails, DocumentRequestDetails, DataUpdateRequestDetails,
    RequestAttachment, ContractTypeKuwait
} from '../types';
import { employeeRequestTypeOptions, employeeRequestStatusOptions, contractTypeKuwaitOptions } from '../constants';
import { EmployeeRequestStatusBadge } from '../components/ui/Badge';
import { initialEmployees } from './EmployeeProfilePage';

// --- Mock Data ---
export const initialRequests: EmployeeRequest[] = [
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
      calculatedAmount: (750/26) * 5, 
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
  },
  {
      id: 'req6',
      employeeId: 'emp-004',
      employeeName: 'نورة خالد السبيعي',
      requestType: EmployeeRequestType.DATA_UPDATE_REQUEST,
      requestDate: '2024-08-05',
      status: EmployeeRequestStatus.COMPLETED,
      details: {
          fieldToUpdate: 'العنوان',
          oldValue: 'الرياض',
          newValue: 'الكويت - السالمية',
          reasonForUpdate: 'الانتقال للإقامة الدائمة'
      } as DataUpdateRequestDetails,
      createdAt: '2024-08-05',
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
            return { typeNote: '' };
    }
};

interface EmployeeRequestFormProps {
  initialData?: Partial<EmployeeRequest> | null;
  onSubmit: (data: EmployeeRequest) => void;
  onCancel: () => void;
  employees: Employee[];
}

const EmployeeRequestForm: React.FC<EmployeeRequestFormProps> = ({ initialData, onSubmit, onCancel, employees }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<EmployeeRequest>>({});

    useEffect(() => {
        const defaultData: Partial<EmployeeRequest> = {
            employeeId: employees.length > 0 ? employees[0].id : '',
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
    }, [initialData, employees]);

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
      addToast({
        type: 'warning',
        title: 'بيانات ناقصة',
        message: 'يرجى اختيار الموظف ونوع الطلب.'
      });
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
              <input type="checkbox" className="form-checkbox text-primary h-4 w-4" name="includeSalaryDetails" checked={!!details.includeSalaryDetails} onChange={handleDetailChange} />
              <span className="ms-2 text-sm text-gray-700">تضمين تفاصيل الراتب في الشهادة</span>
            </label>
            <Select label="لغة الشهادة" name="language" value={details.language || 'ar'} onChange={handleDetailChange} options={[{value:'ar', label:'العربية'}, {value:'en', label:'الإنجليزية'}]} containerClassName="mt-2" />
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
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 p-2 rounded-md mb-2 flex justify-between items-center">
                <span>الرصيد المتاح حاليًا:</span>
                <strong className="text-primary text-lg">{availableLeaveBalance} يوم</strong>
            </div>
            <Input label="عدد أيام الإجازة المطلوب تسييلها" name="numberOfDays" type="number" value={String(details.numberOfDays || 0)} onChange={handleDetailChange} max={availableLeaveBalance} min={1} required />
            { (details.numberOfDays || 0) > availableLeaveBalance && <p className="text-xs text-danger mt-1">العدد المطلوب يتجاوز الرصيد المتاح.</p>}
          </>
        );
      case EmployeeRequestType.GRIEVANCE_FORM:
        return (
            <>
                <Input label="عنوان التظلم/الشكوى" name="grievanceNature" value={details.grievanceNature || ''} onChange={handleDetailChange} required placeholder="مثال: تظلم من تقييم الأداء، تأخير مستحقات..." />
                <TextArea label="شرح تفصيلي للمشكلة" name="detailedDescription" value={details.detailedDescription || ''} onChange={handleDetailChange} rows={5} required />
                <TextArea label="ما هي النتيجة التي ترجوها؟" name="desiredOutcome" value={details.desiredOutcome || ''} onChange={handleDetailChange} rows={2}/>
            </>
        );
      case EmployeeRequestType.TRANSFER_REQUEST:
        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="القسم الحالي" name="currentDepartment" value={details.currentDepartment || selectedEmployeeData?.department || ''} onChange={handleDetailChange} readOnly className="bg-gray-100" />
                    <Input label="الوظيفة الحالية" name="currentPosition" value={details.currentPosition || selectedEmployeeData?.jobTitle || ''} onChange={handleDetailChange} readOnly className="bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="القسم المطلوب النقل إليه" name="requestedDepartment" value={details.requestedDepartment || ''} onChange={handleDetailChange} required />
                    <Input label="الوظيفة المطلوبة" name="requestedPosition" value={details.requestedPosition || ''} onChange={handleDetailChange} required />
                </div>
                <TextArea label="سبب طلب النقل" name="reasonForTransfer" value={details.reasonForTransfer || ''} onChange={handleDetailChange} rows={3} required />
            </>
        );
       case EmployeeRequestType.DOCUMENT_REQUEST:
        return (
            <>
                <Input label="اسم المستند المطلوب" name="documentNeeded" value={details.documentNeeded || ''} onChange={handleDetailChange} placeholder="مثال: صورة جواز السفر، نسخة العقد..." required />
                <TextArea label="سبب الحاجة للمستند (اختياري)" name="reasonForRequest" value={details.reasonForRequest || ''} onChange={handleDetailChange} rows={2}/>
            </>
        );
      case EmployeeRequestType.DATA_UPDATE_REQUEST:
        return (
            <>
                <Input label="نوع البيانات المراد تعديلها" name="fieldToUpdate" value={details.fieldToUpdate || ''} onChange={handleDetailChange} placeholder="مثال: رقم الهاتف، العنوان، الحالة الاجتماعية" required />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="القيمة القديمة" name="oldValue" value={details.oldValue || ''} onChange={handleDetailChange} />
                    <Input label="القيمة الجديدة (الصحيحة)" name="newValue" value={details.newValue || ''} onChange={handleDetailChange} required />
                </div>
                <TextArea label="ملاحظات / سبب التعديل" name="reasonForUpdate" value={details.reasonForUpdate || ''} onChange={handleDetailChange} rows={2}/>
            </>
        );
      case EmployeeRequestType.OTHER:
        return <TextArea label="تفاصيل الطلب" name="typeNote" value={details.typeNote || ''} onChange={handleDetailChange} rows={4} required />;
      default:
        return <p className="text-gray-500 italic">يرجى اختيار نوع طلب لعرض الحقول المناسبة.</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
      <Select label="اختيار الموظف" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
      <Select label="نوع الطلب" name="requestType" value={formData.requestType} options={employeeRequestTypeOptions} onChange={handleChange} required />
      
      <Card title="بيانات الطلب" className="bg-gray-50 border-gray-200" titleClassName="text-sm">
          {renderDetailsFields()}
      </Card>
      
      <TextArea label="ملاحظات إضافية (اختياري)" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} />
      
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary">{formData.id ? 'حفظ التعديلات' : 'تقديم الطلب'}</Button>
      </div>
    </form>
  );
};

// View Request Modal
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
        <Modal isOpen={!!request} onClose={onClose} title={`طلب رقم #${request.id.slice(-4)}: ${request.requestType}`} size="lg">
            <div className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                {/* Header Info */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div>
                        <h3 className="font-bold text-gray-800">{request.employeeName}</h3>
                        <p className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
                            <span>ID: {request.employeeId} | التاريخ: {formatDate(request.requestDate)}</span>
                            {request.completionDate && (
                                <span className="text-primary-dark font-semibold">تاريخ إنجاز المعاملة: {formatDate(request.completionDate)}</span>
                            )}
                        </p>
                    </div>
                    <EmployeeRequestStatusBadge status={request.status} size="sm"/>
                </div>
                
                {/* Request Content based on Type */}
                <Card title="تفاصيل الطلب" className="bg-white" titleClassName="text-sm">
                    {request.requestType === EmployeeRequestType.SALARY_CERTIFICATE && (
                        <div className="text-sm space-y-2">
                            <p><span className="text-gray-500">الغرض:</span> {details.purposeType === 'general' ? 'لمن يهمه الأمر' : `لـ ${details.specificRecipient || details.purposeType}`}</p>
                            <p><span className="text-gray-500">تفاصيل الراتب:</span> {details.includeSalaryDetails ? 'مطلوب ذكرها' : 'غير مطلوبة'}</p>
                            <p><span className="text-gray-500">اللغة:</span> {details.language === 'ar' ? 'العربية' : 'الإنجليزية'}</p>
                        </div>
                    )}
                    {request.requestType === EmployeeRequestType.EXPERIENCE_LETTER && (
                         <div className="text-sm space-y-2">
                            <p><span className="text-gray-500">اللغة:</span> {details.language === 'ar' ? 'العربية' : 'الإنجليزية'}</p>
                            {(details.specificPeriodFrom || details.specificPeriodTo) && (
                                <p><span className="text-gray-500">الفترة المحددة:</span> من {formatDate(details.specificPeriodFrom)} إلى {formatDate(details.specificPeriodTo)}</p>
                            )}
                            {details.highlightResponsibilities && (
                                <div>
                                    <span className="text-gray-500 block mb-1">المسؤوليات المراد إبرازها:</span>
                                    <p className="bg-gray-50 p-2 rounded border text-gray-700">{details.highlightResponsibilities}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {request.requestType === EmployeeRequestType.LEAVE_ENCASHMENT && (
                        <p className="text-sm"><span className="text-gray-500">عدد الأيام المطلوب تسييلها:</span> <strong className="text-lg">{details.numberOfDays}</strong> يوم</p>
                    )}
                     {request.requestType === EmployeeRequestType.DOCUMENT_REQUEST && <p className="text-sm"><span className="text-gray-500">المستند:</span> <strong>{details.documentNeeded}</strong></p>}
                     
                     {request.requestType === EmployeeRequestType.GRIEVANCE_FORM && (
                        <div className="text-sm space-y-2">
                            <p><strong>العنوان:</strong> {details.grievanceNature}</p>
                            <div className="bg-red-50 p-2 rounded border border-red-100 text-red-900">
                                <span className="block text-xs font-bold text-red-700 mb-1">التفاصيل:</span>
                                {details.detailedDescription}
                            </div>
                            {details.desiredOutcome && <p className="text-gray-600"><strong>المطلوب:</strong> {details.desiredOutcome}</p>}
                        </div>
                     )}
                     {request.requestType === EmployeeRequestType.TRANSFER_REQUEST && (
                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-2 rounded">
                            <div>
                                <p className="text-xs text-gray-500">الحالي</p>
                                <p>{details.currentDepartment} / {details.currentPosition}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">المطلوب</p>
                                <p className="font-bold text-primary">{details.requestedDepartment} / {details.requestedPosition}</p>
                            </div>
                            <div className="col-span-2 text-xs text-gray-600 mt-1"><strong>السبب:</strong> {details.reasonForTransfer}</div>
                        </div>
                     )}
                     {request.requestType === EmployeeRequestType.DATA_UPDATE_REQUEST && (
                        <div className="text-sm grid grid-cols-2 gap-4">
                            <p className="col-span-2"><strong>البيان:</strong> {details.fieldToUpdate}</p>
                            <p className="text-red-500 line-through">{details.oldValue || '(فارغ)'}</p>
                            <p className="text-green-600 font-bold">{details.newValue}</p>
                        </div>
                     )}
                     {request.notes && <p className="text-sm mt-3 pt-2 border-t text-gray-500"><strong>ملاحظات إضافية:</strong> {request.notes}</p>}
                </Card>

                {/* Admin Actions */}
                <Card title="إجراءات الإدارة" className="border-t-4 border-primary" titleClassName="text-sm">
                    <Select label="تحديث الحالة" value={newStatus} options={employeeRequestStatusOptions} onChange={(e) => setNewStatus(e.target.value as EmployeeRequestStatus)} containerClassName="mb-3"/>
                    <TextArea label="ملاحظات إدارية / سبب الرفض" value={hrNotes} onChange={(e) => setHrNotes(e.target.value)} rows={3} placeholder="اكتب ملاحظاتك هنا..."/>
                    <div className="mt-4 flex justify-between items-center">
                        <div>
                             {canPrintCertificate && employee && (
                                <Button variant="secondary" size="sm" onClick={() => onPrintCertificate(request, employee)} leftIcon={<PrinterIcon className="w-4"/>}>طباعة الشهادة الرسمية</Button>
                            )}
                        </div>
                        <Button variant="primary" onClick={handleStatusUpdate} leftIcon={<CheckCircleIcon className="w-4"/>}>حفظ وتحديث</Button>
                    </div>
                </Card>
            </div>
        </Modal>
    );
};

// Printable Certificate Modal
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
  const companyName = OFFICE_NAME; // Should be dynamic from settings
  
  let certificateContent = '';
  let title = "شهادة";

  // Template Logic
  if (request.requestType === EmployeeRequestType.SALARY_CERTIFICATE) {
    title = "شهادة راتب";
    const totalAllowances = employee.allowances?.reduce((sum, al) => sum + al.value, 0) || 0;
    const totalSalary = employee.basicSalary + totalAllowances;
    
    // Arabic Template
    if (details.language !== 'en') {
         certificateContent = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; text-decoration: underline;">شهادة راتب</h2>
                <p>التاريخ: ${today}</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>${details.purposeType === 'general' ? 'إلى من يهمه الأمر' : `إلى السادة / ${details.specificRecipient || details.purposeType}`}،،،</strong></p>

            <p style="font-size: 16px; line-height: 2; text-align: justify; margin-bottom: 20px;">
                تشهد <strong>${companyName}</strong> بأن السيد/ <strong>${employee.fullNameAr}</strong>، 
                ${employee.nationality} الجنسية، ويحمل بطاقة مدنية رقم (<strong>${employee.civilId}</strong>)، 
                يعمل لدينا بوظيفة (<strong>${employee.jobTitle}</strong>) اعتبارًا من تاريخ ${formatDate(employee.joiningDate)} ولا يزال على رأس عمله حتى تاريخه.
            </p>
            
            ${details.includeSalaryDetails ? `
            <div style="margin: 20px 0; border: 1px solid #000; padding: 15px;">
                <p style="font-weight: bold; text-align: center; margin-bottom: 10px;">تفاصيل الراتب الشهري</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 5px; border-bottom: 1px solid #ccc;">الراتب الأساسي:</td>
                        <td style="padding: 5px; border-bottom: 1px solid #ccc; text-align: left;">${employee.basicSalary.toFixed(3)} د.ك</td>
                    </tr>
                    ${employee.allowances?.map(all => `
                    <tr>
                        <td style="padding: 5px; border-bottom: 1px solid #ccc;">${all.name}:</td>
                        <td style="padding: 5px; border-bottom: 1px solid #ccc; text-align: left;">${all.value.toFixed(3)} د.ك</td>
                    </tr>`).join('') || ''}
                    <tr>
                        <td style="padding: 10px 5px; font-weight: bold;">إجمالي الراتب:</td>
                        <td style="padding: 10px 5px; font-weight: bold; text-align: left;">${totalSalary.toFixed(3)} د.ك</td>
                    </tr>
                </table>
            </div>
            ` : ''}
            
            <p style="font-size: 14px; margin-top: 20px;">وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها لـ ${details.specificRecipient || 'من يهمه الأمر'}، دون أدنى مسؤولية على الشركة تجاه حقوق الغير.</p>
            
            <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                <div style="text-align: center;">
                    <p style="font-weight: bold;">مدير الموارد البشرية</p>
                    <p style="margin-top: 40px;">.........................</p>
                </div>
                <div style="text-align: center;">
                    <p style="font-weight: bold;">الختم الرسمي</p>
                    <div style="width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 50%; margin: 10px auto;"></div>
                </div>
            </div>
        `;
    } else {
        // English Template (Simplified)
        title = "Salary Certificate";
         certificateContent = `
            <div style="text-align: center; margin-bottom: 30px; direction: ltr;">
                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; text-decoration: underline;">Salary Certificate</h2>
                <p>Date: ${new Date().toLocaleDateString('en-US')}</p>
            </div>
            
            <div style="direction: ltr;">
                <p style="font-size: 16px; margin-bottom: 20px;"><strong>To Whom It May Concern,</strong></p>

                <p style="font-size: 16px; line-height: 2; text-align: justify; margin-bottom: 20px;">
                    This is to certify that Mr./Ms. <strong>${employee.fullNameEn || employee.fullNameAr}</strong>, 
                    <strong>${employee.nationality}</strong> national, holder of Civil ID No. (<strong>${employee.civilId}</strong>), 
                    is employed with <strong>${companyName}</strong> as (<strong>${employee.jobTitle}</strong>) since ${new Date(employee.joiningDate).toLocaleDateString('en-US')}.
                </p>
                
                ${details.includeSalaryDetails ? `
                <p>The employee receives a total monthly salary of <strong>KWD ${(employee.basicSalary + (employee.allowances?.reduce((s,a)=>s+a.value,0)||0)).toFixed(3)}</strong>.</p>
                ` : ''}
                
                <p style="font-size: 14px; margin-top: 20px;">This certificate is issued upon the employee's request without any liability on the company.</p>
                
                <div style="margin-top: 60px;">
                    <p style="font-weight: bold;">Human Resources Department</p>
                    <p>${companyName}</p>
                </div>
            </div>
        `;
    }

  } else if (request.requestType === EmployeeRequestType.EXPERIENCE_LETTER) {
    title = "شهادة خبرة";
    // Simplified logic for experience letter
     certificateContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; text-decoration: underline;">شهادة خبرة</h2>
            <p>التاريخ: ${today}</p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;"><strong>إلى من يهمه الأمر،،،</strong></p>

        <p style="font-size: 16px; line-height: 2; text-align: justify; margin-bottom: 20px;">
            تشهد إدارة <strong>${companyName}</strong> بأن السيد/ <strong>${employee.fullNameAr}</strong> قد عمل لدينا في وظيفة (<strong>${employee.jobTitle}</strong>) 
            في الفترة من <strong>${formatDate(details.specificPeriodFrom || employee.joiningDate)}</strong> وحتى <strong>${formatDate(details.specificPeriodTo) || 'تاريخه'}</strong>.
        </p>
        
        <p style="font-size: 16px; line-height: 2; text-align: justify; margin-bottom: 20px;">
            وخلال فترة عمله، اتسم بالمواظبة وحسن السلوك والكفاءة في أداء المهام الموكلة إليه.
            ${details.highlightResponsibilities ? `<br/><br/><strong>أبرز المهام:</strong> ${details.highlightResponsibilities}` : ''}
        </p>

        <p style="font-size: 14px; margin-top: 20px;">وقد أعطيت له هذه الشهادة بناءً على طلبه، متمنين له دوام التوفيق والنجاح.</p>
        
        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div style="text-align: center;">
                <p style="font-weight: bold;">المدير العام</p>
                <p style="margin-top: 40px;">.........................</p>
            </div>
             <div style="text-align: center;">
                <p style="font-weight: bold;">الختم الرسمي</p>
                <div style="width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 50%; margin: 10px auto;"></div>
            </div>
        </div>
    `;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div id="printable-certificate-content" className="printable-sheet bg-white text-black font-serif p-10 min-h-[29cm]" style={{direction: details.language === 'en' ? 'ltr' : 'rtl'}}>
        <PrintHeader title={title} subtitle={details.specificRecipient || 'إلى من يهمه الأمر'} />
        
        <div className="mt-12 text-lg leading-[2.5] text-justify" dangerouslySetInnerHTML={{ __html: certificateContent }}></div>
        
        <div className="mt-20 flex justify-between items-end signature-area no-print-bg">
            <div className="text-center w-64">
                <p className="font-bold border-b border-gray-400 pb-16 mb-2">اعتماد الإدارة</p>
                <div className="text-[10px] text-gray-400">التاريخ: {today}</div>
            </div>
            <div className="text-center">
                <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-300 transform rotate-12">
                   الختم الرسمي
                </div>
            </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print:hidden">
        <Button variant="ghost" onClick={onClose} className="me-2">إغلاق</Button>
        <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4"/>}>طباعة الشهادة</Button>
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

  const stats = useMemo(() => {
      return {
          total: requests.length,
          pending: requests.filter(r => r.status === EmployeeRequestStatus.PENDING).length,
          processing: requests.filter(r => r.status === EmployeeRequestStatus.PROCESSING).length,
          completed: requests.filter(r => r.status === EmployeeRequestStatus.COMPLETED || r.status === EmployeeRequestStatus.APPROVED).length,
      }
  }, [requests]);

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
        setViewingRequest(null);
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

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="flex items-center p-3 bg-white border-l-4 border-blue-500 shadow-sm">
             <div><p className="text-xs text-gray-500">إجمالي الطلبات</p><p className="text-xl font-bold">{stats.total}</p></div>
          </Card>
          <Card className="flex items-center p-3 bg-white border-l-4 border-yellow-500 shadow-sm">
             <div><p className="text-xs text-gray-500">معلقة</p><p className="text-xl font-bold">{stats.pending}</p></div>
          </Card>
          <Card className="flex items-center p-3 bg-white border-l-4 border-cyan-500 shadow-sm">
             <div><p className="text-xs text-gray-500">قيد المعالجة</p><p className="text-xl font-bold">{stats.processing}</p></div>
          </Card>
          <Card className="flex items-center p-3 bg-white border-l-4 border-green-500 shadow-sm">
             <div><p className="text-xs text-gray-500">مكتملة</p><p className="text-xl font-bold">{stats.completed}</p></div>
          </Card>
       </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input placeholder="ابحث باسم الموظف أو ملاحظات..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select options={[{value: '', label: 'كل الأنواع'}, ...employeeRequestTypeOptions]} value={filterType} onChange={e => setFilterType(e.target.value as EmployeeRequestType | '')} containerClassName="mb-0"/>
            <Select options={[{value: '', label: 'كل الحالات'}, ...employeeRequestStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as EmployeeRequestStatus | '')} containerClassName="mb-0"/>
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
                            <td className="px-3 py-2 font-medium">{req.employeeName}</td>
                            <td className="px-3 py-2">{req.requestType}</td>
                            <td className="px-3 py-2">{formatDate(req.requestDate)}</td>
                            <td className="px-3 py-2"><EmployeeRequestStatusBadge status={req.status}/></td>
                            <td className="px-3 py-2 space-x-1 space-x-reverse">
                                <Button variant="ghost" size="sm" onClick={() => handleViewRequest(req)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditRequest(req)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(req.id)} className="text-danger"><TrashIcon className="w-4 h-4" /></Button>
                            </td>
                        </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>لا توجد طلبات تطابق البحث.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingRequest(null);}} title={editingRequest?.id ? `تعديل طلب: ${editingRequest.employeeName}` : "تقديم طلب إداري جديد"} size="xl">
          <EmployeeRequestForm 
            initialData={editingRequest} 
            onSubmit={handleFormSubmit} 
            onCancel={() => { setIsFormModalOpen(false); setEditingRequest(null); }} 
            employees={initialEmployees}
          />
      </Modal>
      
      <ViewRequestDetailsModal 
        request={viewingRequest} 
        employee={initialEmployees.find(emp => emp.id === viewingRequest?.employeeId)}
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
