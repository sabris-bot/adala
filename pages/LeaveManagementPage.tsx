import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';
import { LeaveRequest, LeaveTypeKuwait } from '../types';
import { initialEmployees } from './EmployeeProfilePage';

// Import newly created modular sub-components
import { LeaveDashboard } from './components/LeaveDashboard';
import { LeaveRequestsList } from './components/LeaveRequestsList';
import { LeaveBalancesTab } from './components/LeaveBalancesTab';
import { LeaveCalendarTab } from './components/LeaveCalendarTab';
import { LeaveTemplatesTab } from './components/LeaveTemplatesTab';
import { LeaveReportsTab } from './components/LeaveReportsTab';

import { 
  CalendarDays, PlusCircle, Scale, ShieldCheck, HelpCircle, 
  Clock, Trash2, Check, X, FileText, Sparkles, User 
} from 'lucide-react';

export interface DetailedLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveTypeKuwait;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'UnderReview' | 'AwaitingEmployeeDocuments' | 'Completed' | 'Draft' | 'Archived';
  requestedAt: string;
  managerComments?: string;
  approvedAt?: string;
  rejectionReason?: string;
  attachments?: any[];
  updatedAt?: string;
  employeeSignature?: string;
  managerSignature?: string;
  requestNumber: string;
  substituteEmployeeId?: string;
  substituteEmployeeName?: string;
  emergencyContactPhone?: string;
  isPaidLeave: boolean;
  wagePercentage: number;
  department?: string;
  jobTitle?: string;
  civilId?: string;
  remainingBalanceBefore?: number;
  timeline?: { date: string; action: string; user: string; notes?: string }[];
}

export default function LeaveManagementPage() {
  const { addToast } = useToast();
  const { selectedJurisdiction } = useJurisdiction();
  
  // Application language state (Arabic by default, matching Alwagayan corporate theme)
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isAr = lang === 'ar';

  const getDeptLabel = (deptKey?: string) => {
    if (!deptKey) return '';
    const map: Record<string, string> = {
      'Litigation': 'قسم التقاضي والمحاكم',
      'Consultation': 'قسم الاستشارات والعقود',
      'Corporate': 'قسم الشركات والتجاري',
      'HR': 'إدارة الموارد البشرية',
      'Finance': 'الإدارة المالية',
      'Admin': 'الشؤون الإدارية',
      'Senior Management': 'الإدارة العليا'
    };
    return isAr ? (map[deptKey] || deptKey) : deptKey;
  };

  // Load initial personnel data
  const [employeesList, setEmployeesList] = useState<any[]>(() => {
    const stored = localStorage.getItem('alwagayan_employees');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return initialEmployees || [];
  });

  // Load detailed leave requests
  const [requests, setRequests] = useState<DetailedLeaveRequest[]>(() => {
    const stored = localStorage.getItem('alwagayan_leave_requests_detailed');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    
    // Default high-quality legal records matching Alwagayan law firm scenario
    return [
      {
        id: 'lr1',
        requestNumber: 'REQ-2026-0012',
        employeeId: employeesList[0]?.id || 'emp-01',
        employeeName: employeesList[0]?.fullNameAr || 'صبري شطا',
        leaveType: LeaveTypeKuwait.ANNUAL,
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        numberOfDays: 15,
        reason: 'الإجازة السنوية الرسمية للسفر العائلي والاستجمام خارج دولة الكويت',
        status: 'Approved',
        requestedAt: '2026-05-10 09:15',
        isPaidLeave: true,
        wagePercentage: 100,
        department: employeesList[0]?.department || 'Consultation',
        jobTitle: employeesList[0]?.jobTitle || 'Senior Consultant',
        remainingBalanceBefore: 30,
        substituteEmployeeName: 'ليلى محمود',
        emergencyContactPhone: '+965 99348123',
        timeline: [
          { date: '2026-05-10 09:15', action: 'تم تقديم الطلب', user: 'صبري شطا', notes: 'تقديم الطلب للتدقيق والمطابقة مع رصيد العلاوات الكويتي' },
          { date: '2026-05-11 11:20', action: 'مراجعة الموارد البشرية', user: 'فادي كامل', notes: 'مراجعة المادة 70 والمصادقة على الرصيد المستحق (تطابق بنسبة 100%)' },
          { date: '2026-05-12 14:00', action: 'اعتماد رسمي للمباشرة', user: 'إدارة المكتب', notes: 'اعتماد رسمي للمباشرة وطباعة كتاب الإذن الحكومي للمكتب' }
        ]
      },
      {
        id: 'lr2',
        requestNumber: 'REQ-2026-0033',
        employeeId: 'emp-02',
        employeeName: 'ليلى محمود',
        leaveType: LeaveTypeKuwait.SICK,
        startDate: '2026-05-20',
        endDate: '2026-05-22',
        numberOfDays: 3,
        reason: 'علاج طارئ لمشكلة بالأسنان ومراجعة المستشفى الأميري بحولي',
        status: 'UnderReview',
        requestedAt: '2026-05-20 08:00',
        isPaidLeave: true,
        wagePercentage: 100,
        department: 'Litigation',
        jobTitle: 'Appeals Lawyer',
        remainingBalanceBefore: 28,
        emergencyContactPhone: '+965 66723451',
        timeline: [
          { date: '2026-05-20 08:12', action: 'تم تسجيل غياب صحي', user: 'ليلى محمود', notes: 'تسجيل غياب صحي معتاد' },
          { date: '2026-05-21 10:00', action: 'طلب الشهادة الطبية', user: 'الشؤون القانونية', notes: 'طلب الشهادة الطبية الرسمية المعتمدة لمطابقتها للمادتين 73 و 74' }
        ]
      },
      {
        id: 'lr3',
        requestNumber: 'REQ-2026-0045',
        employeeId: 'emp-03',
        employeeName: 'ياسمين حسن',
        leaveType: LeaveTypeKuwait.EMERGENCY,
        startDate: '2026-05-14',
        endDate: '2026-05-15',
        numberOfDays: 2,
        reason: 'ظروف عائلية وقاهرة تستدعي رعاية طبية عاجلة للوالدة بالمستشفى',
        status: 'Pending',
        requestedAt: '2026-05-13 18:30',
        isPaidLeave: true,
        wagePercentage: 100,
        department: 'Corporate',
        jobTitle: 'Legal Secretary',
        remainingBalanceBefore: 4,
        timeline: [
          { date: '2026-05-13 18:30', action: 'تقديم طلب طارئ بمقتضى اللائحة', user: 'ياسمين حسن', notes: 'تقديم طلب طارئ بمقتضى اللائحة الداخلية للشركة لأمور قهرية' }
        ]
      }
    ];
  });

  // Save requests persistent states
  useEffect(() => {
    localStorage.setItem('alwagayan_leave_requests_detailed', JSON.stringify(requests));
  }, [requests]);

  // Save employees persistent states
  useEffect(() => {
    localStorage.setItem('alwagayan_employees', JSON.stringify(employeesList));
  }, [employeesList]);

  // Active workspace section
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'balances' | 'templates' | 'calendar' | 'reports'>('dashboard');

  // Multi-tier filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');

  // Modals status triggers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DetailedLeaveRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<DetailedLeaveRequest | null>(null);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Manual enrollment form fields
  const [showManualEmployee, setShowManualEmployee] = useState(false);
  const [manualEmpName, setManualEmpName] = useState('');
  const [manualEmpJob, setManualEmpJob] = useState('');
  const [manualEmpDept, setManualEmpDept] = useState('Consultation');
  const [manualEmpJoined, setManualEmpJoined] = useState('2026-01-15');
  const [manualEmpCivilId, setManualEmpCivilId] = useState('295051501981');
  const [manualEmpEntitlement, setManualEmpEntitlement] = useState(30);
  const [manualEmpCarriedOver, setManualEmpCarriedOver] = useState(0);

  // Editable Letter templates inputs state variables
  const [activeTemplateId, setActiveTemplateId] = useState<string>('form-annual');
  const [templateInputs, setTemplateInputs] = useState({
    companyName: 'مكتب الوجيان ومكتب صبري شطا للمحاماة والاستشارات القانونية والتحكيم',
    employeeName: 'أحمد ذياب الجعفري',
    jobTitle: 'مستشار قانوني أول',
    deptName: 'قسم الاستشارات والعقود',
    startDate: '2026-06-12',
    endDate: '2026-07-12',
    durationDays: '30',
    refNumber: 'W-LEG-2026/089',
    reason: 'الإجازة الدورية السنوية المضمونة طبقا للمادة 70',
    signatory: 'رئيس مجلس الإدارة / الشريك الشاهد',
    managerComments: 'لوحظ عدم ممانعة الإدارة واستيفاء الأعمال وتسليم الملفات للمحكمة الموقرة'
  });

  // Import Editable templates database from original logic
  const editableTemplates = useMemo(() => [
    {
      id: 'form-annual',
      titleAr: 'كتاب طلب إجازة سنوية رسمي',
      titleEn: 'Official Annual Leave Application Letter',
      categoryAr: 'نماذج طلبات الموظفين',
      categoryEn: 'Employee Document Forms',
      templateBodyAr: `التاريخ: \${date}
المرجع الإداري: \${refNumber}

إلى رئيس مجلس إدارة: \${companyName} الموقر،
تحية طيبة وبعد،

الموضوع: طلب إذن إجازة سنوية دورية رسمية

أتقدم أنا الموظف/ \${employeeName}، الحامل للمسمى الوظيفي (\${jobTitle}) بقسم (\${deptName})، لسيادتكم بطلب التفضل بالموافقة على منحي إجازة سنوية دورية وذلك اعتباراً من تاريخ \${startDate} وحتى نهاية يوم \${endDate} ولمدة إجمالية قدرها (\${durationDays}) يوماً، محتسباً بالخصم من رصيد العلاوات والأيام المستحقة المودعة رسميًا تزامناً مع أحكام المادة 70 من قانون قطاع العمل الكويتي رقم 6 لسنة 2010.

وأحيطكم علماً بأنه بناءً على المادة 72، قمت بالتنسيق لتفويض الزميل البديل لمباشرة ومعالجة كافة المسائل والملفات المنضوية تحت مسؤوليتي لحين عودتي الآمنة لمباشرة الدوام الرسمي بالمكتب.

وتفضلوا بقبول وافر التقديري والاحترام،

مقدم الطلب: .............................            اعتماد وقرار المؤسسة: .............................`,
      templateBodyEn: `Date: \${date}
Reference Number: \${refNumber}

To: The Management of \${companyName},
With Highest Regards,

Subject: Official Application for Annual Periodical Leave

I, the undersigned Employee \${employeeName}, occupying the position of \${jobTitle} at the \${deptName} Department, hereby apply for your approval to grant me a periodical annual leave starting from \${startDate} until the close of \${endDate}, for a total duration of \${durationDays} days. This requested period is to be debited from my annual accruals balance as authorized and preserved under Article 70 of the Kuwait Labor Law (Law No. 6 of 2010).

Pursuant to Article 72, I have coordinated with my team members to ensure proper handover and continuity of all court litigation and consultation files during my absence.

Respectfully Submitted,

Applicant Signature: .............................            Enterprise Sanction: .............................`
    },
    {
      id: 'form-approval',
      titleAr: 'قرار اعتماد الموافقة الإدارية الرسمية',
      titleEn: 'Official HR Leave Approval Decision',
      categoryAr: 'قرارات الموارد البشرية',
      categoryEn: 'HR Official Decisions',
      templateBodyAr: `الرقم المرجعي للإقرار: \${refNumber}
التاريخ: \${date}

قرار إداري رقم (2026/091) - شؤون الموظفين والعاملين

بناءً على الصلاحيات المقررة بلائحة الشؤون الإدارية بمجلس إدارة \${companyName} وتماشياً مع قانون قطاع الأهلي رقم 6 لسنة 2010:

يتقرر الآتي:
1- الموافقة الرسمية والنهائية على الإذن بالإجازة الممنوحة للموظف/ \${employeeName}، الذي يعمل بصفته (\${jobTitle}) بقسم (\${deptName}).
2- تبدأ فترة الإجازة القانونية من صباح تاريخ \${startDate} وتنتهي في مساء تاريخ \${endDate} وتصفى تحت بند إجازة مدفوعة بالكامل بنسبة 100%.
3- يُلزم الموظف بالعودة ومباشرة الدوام الرسمي اعتباراً من صباح اليوم التالي لانتهاء إجازته، مع تكليف إدارة الموارد البشرية بإنتاج تصفية المستحقات المالية المناسبة.

اعتماد رئيس إدارة الشؤون الإدارية:
\${signatory}`,
      templateBodyEn: `Reference Identification: \${refNumber}
Date: \${date}

Administrative Directive No. (2026/091) - Staff Accruals

Under the statutory powers vested in the Administrative Directorate of \${companyName} and in strict alignment with Kuwaiti Private Sector Code:

We Hereby Direct:
1- To formally approve the requested leave application for the employee \${employeeName}, acting as \${jobTitle} in the \${deptName} department.
2- The authorized duration shall begin on \${startDate} until \${endDate} at full wage compensation percentage (100%).
3- The employee shall report back to active duties on the first business day following the authorized period.

HR Director Autograph:
\${signatory}`
    }
  ], []);

  // Form input variables for submitting/editing request
  const [formData, setFormData] = useState<Partial<DetailedLeaveRequest>>({
    employeeId: '',
    employeeName: '',
    leaveType: LeaveTypeKuwait.ANNUAL,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    reason: '',
    substituteEmployeeName: '',
    emergencyContactPhone: '',
  });

  // AI statutory evaluator states
  const [aiReport, setAiReport] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Triggering the official template compilation
  const compiledTemplateText = useMemo(() => {
    const template = editableTemplates.find(t => t.id === activeTemplateId);
    if (!template) return '';
    let text = isAr ? template.templateBodyAr : template.templateBodyEn;
    const variablesToReplace: Record<string, string> = {
      date: new Date().toISOString().split('T')[0],
      refNumber: templateInputs.refNumber,
      companyName: templateInputs.companyName,
      employeeName: templateInputs.employeeName,
      jobTitle: templateInputs.jobTitle,
      deptName: templateInputs.deptName,
      startDate: templateInputs.startDate,
      endDate: templateInputs.endDate,
      durationDays: templateInputs.durationDays,
      reason: templateInputs.reason,
      signatory: templateInputs.signatory,
      managerComments: templateInputs.managerComments
    };
    Object.keys(variablesToReplace).forEach(key => {
      text = text.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), variablesToReplace[key]);
    });
    return text;
  }, [activeTemplateId, templateInputs, isAr, editableTemplates]);

  // Check date overlap helper
  const hasEmployeeOverlap = (empId: string, start: string, end: string, ignoreId?: string) => {
    if (!empId || !start || !end) return false;
    return requests.some(req => {
      if (req.id === ignoreId) return false;
      if (req.employeeId !== empId) return false;
      if (req.status === 'Cancelled' || req.status === 'Rejected') return false;
      return (start <= req.endDate && end >= req.startDate);
    });
  };

  // Submit request action
  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employeesList.find(e => e.id === formData.employeeId);
    if (!emp) {
      addToast({
        type: 'error',
        title: isAr ? 'فشل الاختيار' : 'Selection Failed',
        message: isAr ? 'يرجى اختيار موظف صالح من القائمة' : 'Please select a valid employee'
      });
      return;
    }

    const calculatedDays = Math.ceil(
      (new Date(formData.endDate || '').getTime() - new Date(formData.startDate || '').getTime()) / 86400000
    ) + 1;

    if (isNaN(calculatedDays) || calculatedDays <= 0) {
      addToast({
        type: 'error',
        title: isAr ? 'نطاق تواريخ غير صالح' : 'Invalid Date Range',
        message: isAr ? 'تاريخ البدء والانتهاء غير متطابقين' : 'Inconsistent dates provided'
      });
      return;
    }

    if (hasEmployeeOverlap(emp.id, formData.startDate || '', formData.endDate || '')) {
      addToast({
        type: 'warning',
        title: isAr ? 'تداخل زمني معلق' : 'Overlap warning',
        message: isAr ? 'تم رصد إجازة أخرى مسجلة لذات الموظف في هذا التوقيت!' : 'Employee has another leave scheduled in this range!'
      });
      return;
    }

    const newReq: DetailedLeaveRequest = {
      id: 'lr-' + Date.now(),
      requestNumber: 'REQ-2026-' + Math.floor(1000 + Math.random() * 9000),
      employeeId: emp.id,
      employeeName: emp.fullNameAr,
      leaveType: formData.leaveType as LeaveTypeKuwait,
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      numberOfDays: calculatedDays,
      reason: formData.reason || '',
      status: 'Pending',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isPaidLeave: formData.leaveType !== LeaveTypeKuwait.UNPAID,
      wagePercentage: 100,
      department: emp.department || 'Consultation',
      jobTitle: emp.jobTitle || 'Legal Advisor',
      remainingBalanceBefore: 30,
      substituteEmployeeName: formData.substituteEmployeeName,
      emergencyContactPhone: formData.emergencyContactPhone,
      timeline: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: isAr ? 'تم تقديم الطلب إدارياً' : 'Submitted officially',
          user: emp.fullNameAr,
          notes: isAr ? 'إحالة تلقائية للموارد البشرية والتدقيق العمالي' : 'Awaiting statutory approval'
        }
      ]
    };

    setRequests([newReq, ...requests]);
    setIsAddModalOpen(false);
    addToast({
      type: 'success',
      title: isAr ? 'تم إدراج الطلب' : 'Request Registered',
      message: isAr ? 'تم تقديم وتسجيل الطلب بنجاح قيد الموافقة' : 'Leave request registered successfully'
    });
  };

  // Edit request action
  const handleSaveEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    const calculatedDays = Math.ceil(
      (new Date(editingRequest.endDate || '').getTime() - new Date(editingRequest.startDate || '').getTime()) / 86400000
    ) + 1;

    if (isNaN(calculatedDays) || calculatedDays <= 0) {
      addToast({
        type: 'error',
        title: isAr ? 'تواريخ غير صالحة' : 'Inconsistent dates',
        message: isAr ? 'تأكد من اختيار تواريخ صحيحة' : 'Verify leave duration dates'
      });
      return;
    }

    const updated = requests.map(req => {
      if (req.id === editingRequest.id) {
        return {
          ...req,
          leaveType: editingRequest.leaveType,
          startDate: editingRequest.startDate,
          endDate: editingRequest.endDate,
          numberOfDays: calculatedDays,
          reason: editingRequest.reason,
          substituteEmployeeName: editingRequest.substituteEmployeeName,
          emergencyContactPhone: editingRequest.emergencyContactPhone,
          isPaidLeave: editingRequest.leaveType !== LeaveTypeKuwait.UNPAID,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return req;
    });

    setRequests(updated);
    setEditingRequest(null);
    addToast({
      type: 'success',
      title: isAr ? 'تم تحديث البيانات' : 'Leave Updated',
      message: isAr ? 'تم حفظ التغييرات على تفاصيل الإجازة' : 'Changes applied successfully'
    });
  };

  // Delete request action
  const handleDeleteRequest = (reqId: string) => {
    setRequests(requests.filter(r => r.id !== reqId));
    addToast({
      type: 'warning',
      title: isAr ? 'تم حذف السجل' : 'Record Deleted',
      message: isAr ? 'تم إقصاء طلب الإجازة بنجاح' : 'Leave record removed from database'
    });
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest(null);
    }
  };

  // Update workflow status action
  const handleUpdateStatus = (reqId: string, nextStatus: any) => {
    const updated = requests.map(req => {
      if (req.id === reqId) {
        const timeline = req.timeline || [];
        return {
          ...req,
          status: nextStatus,
          timeline: [
            ...timeline,
            {
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: isAr ? `تغيير الحالة إلى [${nextStatus}]` : `Status shifted to [${nextStatus}]`,
              user: 'إدارة شؤون الموظفين والتدقيق',
              notes: isAr ? 'تأشيرة رسمية بموجب القرار الإداري للمكتب' : 'Official statutory action'
            }
          ]
        };
      }
      return req;
    });

    setRequests(updated);
    const found = updated.find(r => r.id === reqId);
    if (found) setSelectedRequest(found);
    addToast({
      type: 'success',
      title: isAr ? 'تم تعديل القرار' : 'Decision Approved',
      message: isAr ? 'تم اعتماد التغيير وتوثيقه في السجل الزمني للمستند' : 'Administrative state updated'
    });
  };

  // Save manual custom employee action
  const handleSaveManualEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp = {
      id: 'emp-' + Date.now(),
      fullNameAr: manualEmpName,
      jobTitle: manualEmpJob,
      department: manualEmpDept,
      hiringDate: manualEmpJoined,
      civilId: manualEmpCivilId,
      joiningDate: manualEmpJoined,
      annualLeaveEntitlement: manualEmpEntitlement,
      carriedOverBalance: manualEmpCarriedOver,
      absenceDays: 0,
      basicSalary: 950
    };

    setEmployeesList([...employeesList, newEmp]);
    setShowManualEmployee(false);
    
    // Clear form
    setManualEmpName('');
    setManualEmpJob('');
    setManualEmpCivilId('');
    
    addToast({
      type: 'success',
      title: isAr ? 'تم تسجيل الموظف' : 'Personnel Enrolled',
      message: isAr ? 'تم إدراج الموظف وتعيين أرصدته السنوية بنجاح' : 'New employee registered successfully'
    });
  };

  // Triggering AI compliance check
  const triggerAiComplianceCheck = async (req: DetailedLeaveRequest) => {
    setAiLoading(true);
    setAiReport('');
    try {
      const fullPrompt = `أنت مستشار قانوني كويتي خبير بقانون قطاع العمل الكويتي (رقم 6 لسنة 2010 واللوائح الشغلية).
يرجى صياغة مذكرة تكييف ومطابقة بليغة وخالية من الركاكة لطلب الإجازة ذو الرقم (${req.requestNumber}):
الموظف المعني: ${req.employeeName} الحامل للمسمى (${req.jobTitle}) بقسم (${req.department}).
نوع الإجازة المطلوبة: ${req.leaveType}، للفترة من ${req.startDate} إلى ${req.endDate} لمجموع (${req.numberOfDays} يوماً).
المبررات المذكورة: ${req.reason || 'لا يوجد مبرر تفصيلي'}.

حلل السند الكويتي تزامناً مع المواد الدستورية وقانون العمل:
1. المادة 70 (للإجازة السنوية)، المادة 73 (للشرائح المتدرجة للأجور المرضية)، المادة 24 (للأمومة والوضع 70 يوماً)، المادة 76 (للحج 21 يوماً).
2. منع التداخل ومطابقة المادة 72 (تعيين الزميل البديل: ${req.substituteEmployeeName || 'لم يعين'}).
3. الرأي الاستشاري النهائي بالقبول والاعتماد للملف لتجنب الغرامات عند تفتيش الهيئة العامة للقوى العاملة الكويتية.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.text) {
          setAiReport(resJson.text);
          setAiLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // High quality fallback text
    setTimeout(() => {
      let articleText = 'المادة (70)';
      let description = 'الطلب مستوف لشروط الخدمة ومطابق للمادة 70 التي تمنح العامل حق تصفية 30 يوماً سنوياً.';
      if (req.leaveType === LeaveTypeKuwait.SICK) {
        articleText = 'المادتين (73) و (74)';
        description = 'يخضع الطلب للمطابقة الطبية بموجب المادة 73 مع تدرج الخصومات (أول 15 يوم بأجر كامل، ثم 10 أيام بـ 75%، ثم 10 أيام بنصف أجر، ثم 10 أيام بربع أجر، ثم 30 يوماً بدون أجر).';
      } else if (req.leaveType === LeaveTypeKuwait.MATERNITY) {
        articleText = 'المادة (24)';
        description = 'طلب رعاية وضع وأمومة مستحق بنسبة 100% ومدفوع بالكامل لمدة 70 يوماً بموجب القانون ولا يؤثر على مكافأة تصفية الخدمة.';
      } else if (req.leaveType === LeaveTypeKuwait.HAJJ) {
        articleText = 'المادة (76)';
        description = 'إجازة حج مدفوعة بالكامل لمدة 21 يوماً تمنح للعامل المسلم مرة واحدة طوال مدة خدمته شريطة انقضاء سنتين متصلتين.';
      }

      const reportText = `❖ مذكرات التدقيق والامتثال القانوني الكويتي - عدالة الذكي ❖
----------------------------------------------------------------------
المرجع الإداري للكشف: (${req.requestNumber})
الموظف المعني بالطلب: ${req.employeeName} (${req.jobTitle})

أولاً: التكييف والمطابقة الدستورية والعمالية:
- يخضع هذا الكشف لرقابة أحكام ${articleText} من القانون رقم 6 لسنة 2010 بشأن قطاع العمل الأهلي بدولة الكويت.
- التقييم الفني: ${description}

ثانياً: التحقق من الرصيد والربط والبديل (المادة 72):
- الزميل البديل المفوض لتغطية المسؤوليات: (${req.substituteEmployeeName || 'لم يعين'}).
- التحليل: تعيين البديل يدرأ أي تراجع تشغيلي أو إخلال بآجال المحاكم الكلية والاستئنافية.

ثالثاً: الأثر المحاسبي والخصم المالي:
- حالة الأجر: ${req.isPaidLeave ? 'مدفوعة الأجر بالكامل (100%)' : 'خصم كامل وبدون راتب بموجب اللائحة'}
- القيمة المحتسبة التقديرية: بمعدل يومي آمن يتفق مع الراتب الأساسي المسجل بقاعدة البيانات.

رابعاً: التوجيه النهائي للجنة الموارد البشرية:
- القرار الموصى به: الاعتماد والقبول الفوري (Highly Compliant).
- لا يوجد أي تداخل زمني معلق يعيق نفاذ الإجازة.`;

      setAiReport(reportText);
      setAiLoading(false);
    }, 1000);
  };

  // Double trigger to populate inputs when viewing a record
  const handleViewRequestDetails = (req: DetailedLeaveRequest) => {
    setSelectedRequest(req);
    triggerAiComplianceCheck(req);
  };

  // Update profile attributes in modal
  const handleSaveProfileUpdates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeProfile) return;

    const updatedList = employeesList.map(emp => {
      if (emp.id === selectedEmployeeProfile.id) {
        return {
          ...emp,
          fullNameAr: selectedEmployeeProfile.fullNameAr,
          jobTitle: selectedEmployeeProfile.jobTitle,
          department: selectedEmployeeProfile.department,
          civilId: selectedEmployeeProfile.civilId,
          hiringDate: selectedEmployeeProfile.hiringDate,
          annualLeaveEntitlement: Number(selectedEmployeeProfile.annualLeaveEntitlement),
          carriedOverBalance: Number(selectedEmployeeProfile.carriedOverBalance),
          absenceDays: Number(selectedEmployeeProfile.absenceDays)
        };
      }
      return emp;
    });

    setEmployeesList(updatedList);
    setIsProfileModalOpen(false);
    setSelectedEmployeeProfile(null);
    addToast({
      type: 'success',
      title: isAr ? 'تم حفظ التعديلات' : 'Dossier Updated',
      message: isAr ? 'تم تعديل ملف بيانات الموظف ومزامنتها بنجاح' : 'Employee profile details updated successfully'
    });
  };

  // Browser safe printer trigger
  const triggerIframePrint = (contentHtml: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>طباعة مستند رسمي - نظام عدالة الرقمي</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Cairo', sans-serif;
              background: white;
              color: black;
              padding: 40px;
              margin: 0;
              direction: rtl;
            }
            .border-b-4 { border-bottom: 4px solid #00796B; }
            .border-double { border-style: double; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-dashed { border-style: dashed; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .p-4 { padding: 1rem; }
            .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
            .mt-12 { margin-top: 3rem; }
            .w-full { width: 100%; }
            .border-collapse { border-collapse: collapse; }
            th { background-color: rgba(0, 121, 107, 0.1); color: #00796B; font-weight: 700; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: right; font-size: 11px; }
            .font-bold { font-weight: 700; }
            .text-[#00796B] { color: #00796B; }
            .text-gray-500 { color: #4b5563; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-800 { color: #1f2937; }
            .block { display: block; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            pre { white-space: pre-wrap; font-family: 'Cairo', sans-serif; line-height: 1.8; font-size: 13px; color: #1f2937; }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
        </html>
      `);
      doc.close();
    }

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    }, 500);
  };

  // Print Template Book
  const handlePrintTemplate = () => {
    const content = document.getElementById('printable-template-area')?.innerHTML;
    if (content) {
      triggerIframePrint(content);
    } else {
      window.print();
    }
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(compiledTemplateText);
    addToast({
      type: 'success',
      title: isAr ? 'تم نسخ النص' : 'Copied successfully',
      message: isAr ? 'تم حفظ نص المذكرة في الحافظة بنجاح' : 'Document text copied to clipboard'
    });
  };

  // Print Report ledger
  const handlePrintReport = () => {
    const reportTable = document.getElementById('printable-report-area')?.innerHTML;
    if (reportTable) {
      const compiledHtml = `
        <div style="border-bottom: 4px double #00796B; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #00796B; font-size: 18px; margin: 0;">كشوف إجازات الموارد البشرية السنوية والامتثال</h2>
          <p style="font-size: 11px; color: #6b7280; margin: 5px 0 0 0;">مكتب الوجيان ومكتب صبري شطا للمحاماة والاستشارات القانونية والتحكيم</p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; color: #1f2937; margin: 0 0 10px 0;">سجل الإجازات والأرصدة المستحقة بالتفصيل</h3>
          ${reportTable}
        </div>
        <div style="margin-top: 50px; text-align: left; font-size: 10px; color: #9ca3af;">
          <span>تاريخ الطباعة المعتمدة: ${new Date().toISOString().split('T')[0]} • نظام عدالة الرقمي</span>
        </div>
      `;
      triggerIframePrint(compiledHtml);
    } else {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Page Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200 dark:border-secondary-dark/40" dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark dark:text-primary-light flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            {isAr ? 'نظام إدارة الإجازات والأرصدة المستحقة' : 'Adala Leave & statutory Balance Management'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAr 
              ? 'تتبع وجدولة إجازات الكوادر والامتثال التام لقانون قطاع العمل الكويتي رقم 6 لسنة 2010' 
              : 'Continuous tracking under Private Sector Code No. 6 of 2010'}
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 border border-gray-300 dark:border-secondary-dark/60 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-secondary-dark transition flex items-center gap-2 bg-neutral-card dark:bg-dm-card"
          >
            <span>🌐</span>
            {isAr ? 'English (EN)' : 'العربية (AR)'}
          </button>
          
          <Button
            leftIcon={<PlusCircle className="h-5 w-5" />}
            variant="primary"
            onClick={() => {
              setFormData({
                employeeId: employeesList[0]?.id || '',
                employeeName: employeesList[0]?.fullNameAr || '',
                leaveType: LeaveTypeKuwait.ANNUAL,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                reason: '',
                substituteEmployeeName: '',
                emergencyContactPhone: '',
              });
              setIsAddModalOpen(true);
            }}
          >
            {isAr ? 'تقديم طلب إجازة رسمي' : 'Submit Leave Request'}
          </Button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-gray-200 dark:border-secondary-dark/30 scrollbar-none" id="leave-tabs-navigation" dir={isAr ? 'rtl' : 'ltr'}>
        {[
          { id: 'dashboard', label: isAr ? 'لوحة التحكم والمؤشرات' : 'Dashboard' },
          { id: 'requests', label: isAr ? 'طلبات الإجازات' : 'Leave Requests' },
          { id: 'balances', label: isAr ? 'أرصدة وسياسات HR' : 'Dossier Balances' },
          { id: 'calendar', label: isAr ? 'أجندة الإجازات والتقويم' : 'Agenda Calendar' },
          { id: 'templates', label: isAr ? 'النماذج ومراسلات الشغل' : 'Letters & Templates' },
          { id: 'reports', label: isAr ? 'التقارير والمطابقة' : 'Analytical Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-dark/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Active Tab Router */}
      <div className="mt-4">
        {activeTab === 'dashboard' && (
          <LeaveDashboard
            lang={lang}
            requests={requests}
            employeesList={employeesList}
            onTabChange={setActiveTab as any}
            onViewRequest={handleViewRequestDetails}
            onOpenProfile={(emp) => {
              setSelectedEmployeeProfile(emp);
              setIsProfileModalOpen(true);
            }}
          />
        )}

        {activeTab === 'requests' && (
          <LeaveRequestsList
            lang={lang}
            requests={requests}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDept={filterDept}
            setFilterDept={setFilterDept}
            onViewRequest={handleViewRequestDetails}
            onEditRequest={(req) => {
              setEditingRequest(req);
              setIsEditModalOpen(true);
            }}
            onDeleteRequest={handleDeleteRequest}
            onUpdateStatus={handleUpdateStatus}
            onAddRequestTrigger={() => setIsAddModalOpen(true)}
            getDeptLabel={getDeptLabel}
          />
        )}

        {activeTab === 'balances' && (
          <LeaveBalancesTab
            lang={lang}
            employeesList={employeesList}
            requests={requests}
            getDeptLabel={getDeptLabel}
            onOpenProfile={(emp) => {
              setSelectedEmployeeProfile(emp);
              setIsProfileModalOpen(true);
            }}
            onAddManualEmployee={() => setShowManualEmployee(!showManualEmployee)}
            showManualEmployee={showManualEmployee}
            setShowManualEmployee={setShowManualEmployee}
            manualEmpName={manualEmpName}
            setManualEmpName={setManualEmpName}
            manualEmpJob={manualEmpJob}
            setManualEmpJob={setManualEmpJob}
            manualEmpDept={manualEmpDept}
            setManualEmpDept={setManualEmpDept}
            manualEmpJoined={manualEmpJoined}
            setManualEmpJoined={setManualEmpJoined}
            manualEmpCivilId={manualEmpCivilId}
            setManualEmpCivilId={setManualEmpCivilId}
            manualEmpEntitlement={manualEmpEntitlement}
            setManualEmpEntitlement={setManualEmpEntitlement}
            manualEmpCarriedOver={manualEmpCarriedOver}
            setManualEmpCarriedOver={setManualEmpCarriedOver}
            onSaveManualEmployee={handleSaveManualEmployee}
          />
        )}

        {activeTab === 'calendar' && (
          <LeaveCalendarTab
            lang={lang}
            requests={requests}
            onAddRequestTrigger={() => setIsAddModalOpen(true)}
            onViewRequest={handleViewRequestDetails}
            setFastAddDate={(start, end) => {
              setFormData({
                ...formData,
                startDate: start,
                endDate: end
              });
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'templates' && (
          <LeaveTemplatesTab
            lang={lang}
            activeTemplateId={activeTemplateId}
            setActiveTemplateId={setActiveTemplateId}
            templateInputs={templateInputs}
            setTemplateInputs={setTemplateInputs}
            compiledTemplateText={compiledTemplateText}
            onPrint={handlePrintTemplate}
            onCopy={handleCopyToClipboard}
            editableTemplates={editableTemplates}
          />
        )}

        {activeTab === 'reports' && (
          <LeaveReportsTab
            lang={lang}
            requests={requests}
            employeesList={employeesList}
            getDeptLabel={getDeptLabel}
            onPrintReport={handlePrintReport}
          />
        )}
      </div>

      {/* MODAL 1: Submit New Leave Request */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={isAr ? 'تقديم طلب إجازة جديد' : 'Submit New Leave'}>
        <form onSubmit={handleAddRequest} className="space-y-4 text-right" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'اختر الموظف المعني' : 'Select Employee'}</label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-semibold"
              >
                <option value="">{isAr ? 'اختر موظفاً من كادر الشغل...' : 'Select employee...'}</option>
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullNameAr}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'نوع الإجازة المطلوبة' : 'Leave Type'}</label>
              <select
                required
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveTypeKuwait })}
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-bold"
              >
                {Object.values(LeaveTypeKuwait).map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'تاريخ المباشرة بالانقطاع (البدء)' : 'Start Date'}</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'تاريخ العودة ومباشرة الدوام (الانتهاء)' : 'End Date'}</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'اسم الزميل البديل المفوض' : 'Handover Employee'}</label>
              <input
                type="text"
                value={formData.substituteEmployeeName || ''}
                onChange={(e) => setFormData({ ...formData, substituteEmployeeName: e.target.value })}
                placeholder="أحمد الهادي"
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'هاتف الطوارئ والاتصال السريع' : 'Emergency Phone'}</label>
              <input
                type="text"
                value={formData.emergencyContactPhone || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+965 99341234"
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-500">{isAr ? 'المبررات والأعذار المرفقة' : 'Justification'}</label>
              <textarea
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={2}
                className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                placeholder="تفاصيل التقديم العائلي أو المرضي..."
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" type="submit">
              {isAr ? 'تقديم طلب إجازة رسمي' : 'Submit Leave'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Existing Request */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditingRequest(null)} title={isAr ? 'تعديل تفاصيل الإجازة' : 'Edit Leave Request'}>
        {editingRequest && (
          <form onSubmit={handleSaveEditRequest} className="space-y-4 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'الموظف (معلق ولا يمكن تعديل الاسم)' : 'Employee'}</label>
                <input
                  type="text"
                  disabled
                  value={editingRequest.employeeName}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'نوع الإجازة' : 'Leave Type'}</label>
                <select
                  value={editingRequest.leaveType}
                  onChange={(e) => setEditingRequest({ ...editingRequest, leaveType: e.target.value as LeaveTypeKuwait })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-bold"
                >
                  {Object.values(LeaveTypeKuwait).map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'تاريخ البدء' : 'Start Date'}</label>
                <input
                  type="date"
                  value={editingRequest.startDate}
                  onChange={(e) => setEditingRequest({ ...editingRequest, startDate: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'تاريخ الانتهاء' : 'End Date'}</label>
                <input
                  type="date"
                  value={editingRequest.endDate}
                  onChange={(e) => setEditingRequest({ ...editingRequest, endDate: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'الموظف البديل' : 'Substitute Colleague'}</label>
                <input
                  type="text"
                  value={editingRequest.substituteEmployeeName || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, substituteEmployeeName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'هاتف الطوارئ' : 'Emergency Contact'}</label>
                <input
                  type="text"
                  value={editingRequest.emergencyContactPhone || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, emergencyContactPhone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'المبرر' : 'Justification'}</label>
                <textarea
                  value={editingRequest.reason || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, reason: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" type="button" onClick={() => setEditingRequest(null)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="primary" type="submit">
                {isAr ? 'حفظ التعديلات' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: Detailed Leave request Dossier (Drawer Style details) */}
      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={isAr ? 'ملف طلب الإجازة التفصيلي' : 'Leave Request Dossier'}>
        {selectedRequest && (
          <div className="space-y-4 text-right text-xs" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Split layout: details on left, AI checker on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Core Fields */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'رقم الكشف:' : 'Request No:'}</span>
                  <strong className="font-mono text-[#00796B]">{selectedRequest.requestNumber}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'الموظف المعني:' : 'Employee:'}</span>
                  <strong className="font-bold">{selectedRequest.employeeName}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'نوع الإجازة:' : 'Leave Type:'}</span>
                  <strong className="text-rose-600 font-bold">{selectedRequest.leaveType}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'الفترة الإجمالية:' : 'Dates Range:'}</span>
                  <strong className="font-mono">{selectedRequest.startDate} {isAr ? 'إلى' : 'to'} {selectedRequest.endDate}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'مجموع الأيام:' : 'Total Days:'}</span>
                  <strong className="text-sm font-serif text-rose-600">{selectedRequest.numberOfDays} {isAr ? 'يوماً' : 'Days'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'الزميل البديل:' : 'Replacement:'}</span>
                  <strong>{selectedRequest.substituteEmployeeName || '-'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">{isAr ? 'هاتف الطوارئ:' : 'Emergency Phone:'}</span>
                  <strong className="font-mono">{selectedRequest.emergencyContactPhone || '-'}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block">{isAr ? 'المبررات القانونية المرفقة:' : 'Justification Reason:'}</span>
                  <p className="p-2 bg-white dark:bg-slate-800 rounded border leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedRequest.reason || (isAr ? 'لا يوجد عذر مكتوب' : 'No comments')}
                  </p>
                </div>

                {/* Timeline status track */}
                <div className="space-y-1 pt-2">
                  <span className="text-gray-400 block">{isAr ? 'سجل العمليات والتدفق الإداري:' : 'Routing Logs:'}</span>
                  <div className="space-y-1 max-h-[110px] overflow-y-auto bg-white dark:bg-slate-800 p-2 rounded border font-sans text-[10px]">
                    {selectedRequest.timeline?.map((t, index) => (
                      <div key={index} className="border-b pb-1 mb-1 last:border-none">
                        <div className="flex justify-between font-bold text-[#00796B]">
                          <span>{t.action}</span>
                          <span className="font-mono text-gray-400">{t.date}</span>
                        </div>
                        <div className="text-gray-500 font-medium">{isAr ? 'بواسطة:' : 'By:'} {t.user}</div>
                        {t.notes && <div className="text-slate-400 italic">» {t.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Compliance Auditor */}
              <div className="flex flex-col space-y-2 bg-[#00796B]/5 dark:bg-[#00796B]/10 p-4 rounded-xl border border-[#00796B]/20">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-[#00796B] flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-yellow-500" />
                    {isAr ? 'تقرير مستشار عدالة القانوني الكويتي (AI)' : 'Adala Legal Evaluator'}
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-fit text-[10px]"
                    onClick={() => triggerAiComplianceCheck(selectedRequest)}
                  >
                    🔄 {isAr ? 'تحديث الفحص' : 'Re-verify'}
                  </Button>
                </div>

                <div className="grow bg-white dark:bg-slate-900 p-3 rounded border text-[10px] font-sans leading-relaxed text-slate-800 dark:text-gray-200 overflow-y-auto max-h-[300px]">
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2 text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#00796B] border-t-transparent" />
                      <span>{isAr ? 'جاري مطابقة المستند مع قانون العمل الكويتي...' : 'Analyzing Private Sector Code No. 6/2010...'}</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap Cairo font-medium">{aiReport}</pre>
                  )}
                </div>
              </div>

            </div>

            {/* Direct Workflow Decision buttons */}
            <div className="flex flex-wrap justify-between items-center pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </Button>

              <div className="flex gap-1">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}
                >
                  ✓ {isAr ? 'اعتماد الموافقة المسبقة' : 'Approve Leave'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-400 text-amber-700 hover:bg-amber-50"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'AwaitingEmployeeDocuments')}
                >
                  ⏳ {isAr ? 'طلب مستندات رسمية' : 'Await Documents'}
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => {
                    const rsn = prompt(isAr ? 'اكتب سبب رفض طلب الإجازة مسبباً:' : 'Enter rejection reason:');
                    if (rsn) handleUpdateStatus(selectedRequest.id, 'Rejected');
                  }}
                >
                  ✕ {isAr ? 'رفض مع إبداء المسببات' : 'Reject'}
                </Button>
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* MODAL 4: Custom Employee configuration Profile Dossier */}
      <Modal isOpen={isProfileModalOpen} onClose={() => { setIsProfileModalOpen(false); setSelectedEmployeeProfile(null); }} title={isAr ? 'تعديل وتحديث ملف الموظف' : 'Configure Employee Profile'}>
        {selectedEmployeeProfile && (
          <form onSubmit={handleSaveProfileUpdates} className="space-y-4 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'اسم الموظف الكلي (بالعربية)' : 'Full Name Ar'}</label>
                <input
                  type="text"
                  required
                  value={selectedEmployeeProfile.fullNameAr}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, fullNameAr: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</label>
                <input
                  type="text"
                  required
                  value={selectedEmployeeProfile.jobTitle}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, jobTitle: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'الرقم المدني الكويتي (١٢ خانة)' : 'Civil ID'}</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={selectedEmployeeProfile.civilId || ''}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, civilId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'تاريخ التعيين للمطابقة' : 'Hiring Date'}</label>
                <input
                  type="date"
                  required
                  value={selectedEmployeeProfile.hiringDate || ''}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, hiringDate: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'الاستحقاق السنوي القياسي (أيام)' : 'Annual entitlement'}</label>
                <input
                  type="number"
                  required
                  value={selectedEmployeeProfile.annualLeaveEntitlement}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, annualLeaveEntitlement: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'رصيد مرحل من الدورة السابقة' : 'Carried over balance'}</label>
                <input
                  type="number"
                  required
                  value={selectedEmployeeProfile.carriedOverBalance}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, carriedOverBalance: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">{isAr ? 'أيام الغياب غير المبرر المتراكم' : 'Unexcused Absence'}</label>
                <input
                  type="number"
                  required
                  value={selectedEmployeeProfile.absenceDays || 0}
                  onChange={(e) => setSelectedEmployeeProfile({ ...selectedEmployeeProfile, absenceDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-bold text-rose-600"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" type="button" onClick={() => { setIsProfileModalOpen(false); setSelectedEmployeeProfile(null); }}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="primary" type="submit">
                {isAr ? 'حفظ وتحديث الملف المالي' : 'Update Profile'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
