
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    UserCircleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, PrinterIcon, UsersIcon, 
    BanknotesIcon, DocumentTextIcon, CheckCircleIcon, ListBulletIcon, 
    ViewColumnsIcon, BuildingOffice2Icon, PhoneIcon, EnvelopeIcon,
    CloudArrowUpIcon, ArrowDownTrayIcon, ExclamationTriangleIcon
} from '../constants';
import { Employee, ContractTypeKuwait } from '../types';
import { contractTypeKuwaitOptions } from '../constants';
import { Badge } from '../components/ui/Badge';

// --- COMPREHENSIVE LISTS (Terminologies) ---
const getEmployeeConstants = (t: any) => ({
    DEPARTMENTS_LIST: [
        { value: 'الإدارة العليا', label: t('senior_management', { defaultValue: 'الإدارة العليا' }) },
        { value: 'مكتب الشركاء', label: t('partners_office', { defaultValue: 'مكتب الشركاء' }) },
        { value: 'قسم التقاضي والمحاكم', label: t('litigation_dept', { defaultValue: 'قسم التقاضي والمحاكم' }) },
        { value: 'قسم الاستشارات والعقود', label: t('consultation_contracts_dept', { defaultValue: 'قسم الاستشارات والعقود' }) },
        { value: 'قسم القضايا التجارية والشركات', label: t('corporate_commercial_dept', { defaultValue: 'قسم القضايا التجارية والشركات' }) },
        { value: 'قسم القضايا العمالية', label: t('labor_cases_dept', { defaultValue: 'قسم القضايا العمالية' }) },
        { value: 'قسم الأحوال الشخصية والأسرة', label: t('personal_status_family_dept', { defaultValue: 'قسم الأحوال الشخصية والأسرة' }) },
        { value: 'قسم الجنايات والجنح', label: t('criminal_dept', { defaultValue: 'قسم الجنايات والجنح' }) },
        { value: 'قسم التنفيذ والتحصيل', label: t('execution_collection_dept', { defaultValue: 'قسم التنفيذ والتحصيل' }) },
        { value: 'قسم التمييز والمحكمة الدستورية', label: t('cassation_constitutional_dept', { defaultValue: 'قسم التمييز والمحكمة الدستورية' }) },
        { value: 'إدارة الشؤون الإدارية', label: t('admin_affairs_dept', { defaultValue: 'إدارة الشؤون الإدارية' }) },
        { value: 'إدارة الموارد البشرية', label: t('hr_dept', { defaultValue: 'إدارة الموارد البشرية' }) },
        { value: 'الإدارة المالية والمحاسبة', label: t('finance_accounting_dept', { defaultValue: 'الإدارة المالية والمحاسبة' }) },
        { value: 'قسم تقنية المعلومات', label: t('it_dept', { defaultValue: 'قسم تقنية المعلومات' }) },
        { value: 'قسم العلاقات العامة والتسويق', label: t('pr_marketing_dept', { defaultValue: 'قسم العلاقات العامة والتسويق' }) },
        { value: 'السكرتارية والأرشيف', label: t('secretariat_archive_dept', { defaultValue: 'السكرتارية والأرشيف' }) },
        { value: 'الخدمات العامة والمراسلين', label: t('public_services_couriers', { defaultValue: 'الخدمات العامة والمراسلين' }) },
    ],
    JOB_TITLES_LIST: [
        { value: 'شريك مؤسس', label: t('founding_partner', { defaultValue: 'شريك مؤسس' }) },
        { value: 'شريك مدير', label: t('managing_partner', { defaultValue: 'شريك مدير' }) },
        { value: 'كبير مستشارين', label: t('senior_consultant', { defaultValue: 'كبير مستشارين' }) },
        { value: 'مستشار قانوني', label: t('legal_consultant', { defaultValue: 'مستشار قانوني' }) },
        { value: 'محام مقيد أمام التمييز والدستورية', label: t('lawyer_cassation', { defaultValue: 'محام (تمييز ودستورية)' }) },
        { value: 'محام مقيد أمام الاستئناف', label: t('lawyer_appeals', { defaultValue: 'محام (استئناف)' }) },
        { value: 'محام مقيد أمام الكلية', label: t('lawyer_court_first_instance', { defaultValue: 'محام (محكمة كلية)' }) },
        { value: 'محام تحت التدريب', label: t('trainee_lawyer', { defaultValue: 'محام تحت التدريب' }) },
        { value: 'باحث قانوني', label: t('legal_researcher', { defaultValue: 'باحث قانوني' }) },
        { value: 'مساعد قانوني (Paralegal)', label: t('paralegal', { defaultValue: 'مساعد قانوني' }) },
        { value: 'كاتب قانوني', label: t('legal_clerk', { defaultValue: 'كاتب قانوني' }) },
        { value: 'مدير مكتب', label: t('office_manager', { defaultValue: 'مدير مكتب' }) },
        { value: 'مدير مالي', label: t('finance_manager', { defaultValue: 'مدير مالي' }) },
        { value: 'محاسب أول', label: t('senior_accountant', { defaultValue: 'محاسب أول' }) },
        { value: 'محاسب', label: t('accountant', { defaultValue: 'محاسب' }) },
        { value: 'مدير موارد بشرية', label: t('hr_manager', { defaultValue: 'مدير موارد بشرية' }) },
        { value: 'أخصائي موارد بشرية', label: t('hr_specialist', { defaultValue: 'أخصائي موارد بشرية' }) },
        { value: 'سكرتير تنفيذي', label: t('executive_secretary', { defaultValue: 'سكرتير تنفيذي' }) },
        { value: 'سكرتير قانوني', label: t('legal_secretary', { defaultValue: 'سكرتير قانوني' }) },
        { value: 'موظف استقبال', label: t('receptionist', { defaultValue: 'موظف استقبال' }) },
        { value: 'مدخل بيانات', label: t('data_entry', { defaultValue: 'مدخل بيانات' }) },
        { value: 'أمين أرشيف', label: t('archivist', { defaultValue: 'أمين أرشيف' }) },
        { value: 'مندوب عام', label: t('general_representative', { defaultValue: 'مندوب عام' }) },
        { value: 'مندوب محكمة', label: t('court_representative', { defaultValue: 'مندوب محكمة' }) },
        { value: 'مندوب شؤون وجوازات', label: t('immigration_representative', { defaultValue: 'مندوب شؤون وجوازات' }) },
        { value: 'معقب معاملات', label: t('transaction_follower', { defaultValue: 'معقب معاملات' }) },
        { value: 'سائق', label: t('driver', { defaultValue: 'سائق' }) },
        { value: 'مراسل', label: t('courier', { defaultValue: 'مراسل' }) },
        { value: 'مسؤول تقنية معلومات', label: t('it_officer', { defaultValue: 'مسؤول تقنية معلومات' }) },
        { value: 'دعم فني', label: t('tech_support', { defaultValue: 'دعم فني' }) },
    ],
    NATIONALITIES_LIST: [
        { value: 'كويتي', label: t('kuwaiti', { defaultValue: 'كويتي' }) },
        { value: 'سعودي', label: t('saudi', { defaultValue: 'سعودي' }) },
        { value: 'مصري', label: t('egyptian', { defaultValue: 'مصري' }) },
        { value: 'أردني', label: t('jordanian', { defaultValue: 'أردني' }) },
        { value: 'لبناني', label: t('lebanese', { defaultValue: 'لبناني' }) },
        { value: 'سوري', label: t('syrian', { defaultValue: 'سوري' }) },
        { value: 'هندي', label: t('indian', { defaultValue: 'هندي' }) },
        { value: 'فلبيني', label: t('filipino', { defaultValue: 'فلبيني' }) },
        { value: 'سريلانكي', label: t('sri_lankan', { defaultValue: 'سريلانكي' }) },
        { value: 'بنجلاديشي', label: t('bangladeshi', { defaultValue: 'بنجلاديشي' }) },
        { value: 'باكستاني', label: t('pakistani', { defaultValue: 'باكستاني' }) },
        { value: 'أخرى', label: t('other_nationality', { defaultValue: 'جنسية أخرى' }) },
    ],
    EMPLOYEE_STATUS_OPTIONS: [
        {value: 'Active', label: t('active_working', { defaultValue: 'نشط (على رأس العمل)' })},
        {value: 'OnLeave', label: t('on_leave', { defaultValue: 'في إجازة' })},
        {value: 'Probation', label: t('probation', { defaultValue: 'فترة تجربة' })},
        {value: 'Terminated', label: t('terminated_service', { defaultValue: 'منتهية خدمته' })},
        {value: 'Resigned', label: t('resigned', { defaultValue: 'مستقيل' })},
        {value: 'Suspended', label: t('suspended', { defaultValue: 'موقوف عن العمل' })},
    ]
});

// --- Mock Data ---

export const initialEmployees: Employee[] = [
  {
    id: 'emp-001',
    employeeId: 'EMP001',
    fullNameAr: 'أحمد محمود مبارك الأنصاري',
    fullNameEn: 'Ahmed Mahmoud Mubarak Al-Ansari',
    civilId: '285010112345',
    nationality: 'كويتي',
    jobTitle: 'محام مقيد أمام التمييز والدستورية',
    department: 'قسم القضايا التجارية والشركات',
    joiningDate: '2018-05-15',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 1200,
    allowances: [{ name: 'بدل سكن', value: 200, subjectToIndemnity: true }, { name: 'بدل انتقال', value: 50, subjectToIndemnity: false }],
    email: 'ahmed.m@example.com',
    phone: '98765432',
    status: 'Active',
    photoUrl: 'https://ui-avatars.com/api/?name=Ahmed+Mahmoud&background=0D8ABC&color=fff',
    address: 'السالمية، قطعة 3، شارع 5، منزل 10',
    dateOfBirth: '1985-01-01',
    gender: 'Male',
    civilIdExpiry: '2024-09-15',
    passportExpiry: '2025-05-20',
    residencyExpiry: '2024-09-15', // Matches Civil ID usually
    notes: 'محام قدير ذو خبرة واسعة في القضايا التجارية المعقدة.',
    emergencyContact: { name: 'مريم الأنصاري', phone: '99887766', relation: 'زوجة' },
    bloodType: 'O+',
    skills: ['English', 'Arabic', 'Corporate Law', 'Negotiation'],
    qualifications: [{ degree: 'ليسانس حقوق', major: 'القانون الخاص', university: 'جامعة الكويت', graduationYear: '2007' }],
    assets: [{ id: 'a1', assetName: 'Laptop MacBook Pro', assignedDate: '2018-05-16', serialNumber: 'MBP-2018-001' }]
  },
  {
    id: 'emp-002',
    employeeId: 'EMP002',
    fullNameAr: 'فاطمة علي حسين السيد',
    fullNameEn: 'Fatima Ali Hussein Elsayed',
    civilId: '290030323456',
    nationality: 'مصري',
    jobTitle: 'باحث قانوني',
    department: 'قسم القضايا العمالية',
    joiningDate: '2020-01-20',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 750,
    allowances: [{ name: 'بدل سكن', value: 150, subjectToIndemnity: true }, {name: 'بدل طبيعة عمل', value: 75, subjectToIndemnity: true}],
    email: 'fatima.a@example.com',
    phone: '65432109',
    status: 'Active',
    photoUrl: 'https://ui-avatars.com/api/?name=Fatima+Ali&background=E91E63&color=fff',
    address: 'حولي، شارع تونس، بناية 50، شقة 3',
    dateOfBirth: '1990-03-03',
    gender: 'Female',
    civilIdExpiry: '2024-11-30',
    passportExpiry: '2024-09-01', // Expiring soon for demo
    residencyExpiry: '2024-11-30',
  },
  {
    id: 'emp-003',
    employeeId: 'EMP003',
    fullNameAr: 'علي محمد جاسم الخالدي',
    fullNameEn: 'Ali Mohammed Jassim Al-Khaldi',
    civilId: '300070734567',
    nationality: 'كويتي',
    jobTitle: 'سكرتير تنفيذي',
    department: 'السكرتارية والأرشيف',
    joiningDate: '2022-11-01',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 600,
    allowances: [{name: 'بدل مواصلات', value: 40, subjectToIndemnity: false}],
    email: 'ali.j@example.com',
    phone: '54321098',
    status: 'OnLeave',
    photoUrl: 'https://ui-avatars.com/api/?name=Ali+Mohammed&background=4CAF50&color=fff',
    address: 'الجهراء، القصر، قطعة 1، شارع 2، منزل 15',
    dateOfBirth: '2000-07-07',
    gender: 'Male',
  },
  {
    id: 'emp-004',
    employeeId: 'EMP004',
    fullNameAr: 'نورة خالد السبيعي',
    fullNameEn: 'Noura Khalid Alsubaie',
    civilId: '295121045678',
    nationality: 'سعودي',
    jobTitle: 'مستشار قانوني',
    department: 'قسم الاستشارات والعقود',
    joiningDate: '2021-08-10',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 1500,
    allowances: [{ name: 'بدل خبرة', value: 300, subjectToIndemnity: true }, { name: 'بدل هاتف', value: 25, subjectToIndemnity: false }],
    email: 'noura.k@example.com',
    phone: '00966501234567',
    status: 'Active',
    photoUrl: 'https://ui-avatars.com/api/?name=Noura+Khalid&background=9C27B0&color=fff',
    address: 'الرياض، حي العليا (مقر العمل المؤقت في الكويت)',
    dateOfBirth: '1995-12-10',
    gender: 'Female',
  },
  {
    id: 'emp-T01',
    employeeId: 'EMPT01',
    fullNameAr: 'عادل إبراهيم كامل',
    fullNameEn: 'Adel Ibrahim Kamel',
    civilId: '270112233445',
    nationality: 'مصري',
    jobTitle: 'مندوب عام',
    department: 'الخدمات العامة والمراسلين',
    joiningDate: '2019-06-01',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 600,
    allowances: [{ name: 'عمولة', value: 150, subjectToIndemnity: false }],
    status: 'Terminated',
    terminationDate: '2024-03-15',
    photoUrl: 'https://ui-avatars.com/api/?name=Adel+Ibrahim&background=607D8B&color=fff',
    address: 'الفروانية، قطعة 1، شارع 2، منزل 3',
    dateOfBirth: '1970-11-22',
    gender: 'Male',
    notes: 'تم إنهاء الخدمة بسبب إعادة هيكلة القسم. تم صرف كامل المستحقات.',
  }
];

interface EmployeeFormProps {
  initialData?: Partial<Employee> | null;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const { DEPARTMENTS_LIST, JOB_TITLES_LIST, NATIONALITIES_LIST, EMPLOYEE_STATUS_OPTIONS } = useMemo(() => getEmployeeConstants(t), [t]);

  const [formData, setFormData] = useState<Partial<Employee>>(
    initialData || {
      employeeId: '',
      fullNameAr: '',
      civilId: '',
      nationality: 'كويتي',
      jobTitle: '',
      department: '',
      joiningDate: new Date().toISOString().split('T')[0],
      contractType: ContractTypeKuwait.UNLIMITED,
      basicSalary: 0,
      allowances: [],
      status: 'Active',
      photoUrl: '',
      notes: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "basicSalary") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAllowanceChange = (index: number, field: string, value: any) => {
    const currentAllowances = formData.allowances ? [...formData.allowances] : [];
    if (index >= 0 && index < currentAllowances.length) {
        currentAllowances[index] = { ...currentAllowances[index], [field]: value };
        setFormData(prev => ({ ...prev, allowances: currentAllowances }));
    }
  };

  const addAllowance = () => {
    setFormData(prev => ({ ...prev, allowances: [...(prev.allowances || []), { name: '', value: 0, subjectToIndemnity: false }] }));
  };
  
  const removeAllowance = (index: number) => {
    setFormData(prev => ({ ...prev, allowances: prev.allowances?.filter((_, i) => i !== index) }));
  };

  const handleEmergencyChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...(prev.emergencyContact || { name: '', phone: '', relation: '' }), [field]: value }
    }));
  };

  const handleQualificationChange = (index: number, field: string, value: string) => {
    const quals = [...(formData.qualifications || [])];
    if (index >= 0) {
      quals[index] = { ...quals[index], [field]: value };
      setFormData(prev => ({ ...prev, qualifications: quals }));
    }
  };

  const addQualification = () => {
    setFormData(prev => ({ 
      ...prev, 
      qualifications: [...(prev.qualifications || []), { degree: '', major: '', university: '', graduationYear: '' }] 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullNameAr || !formData.employeeId || !formData.civilId) {
        alert("يرجى ملء الحقول الإلزامية: الاسم، الرقم الوظيفي، والرقم المدني.");
        return;
    }
    onSubmit(formData as Employee);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 scrollbar-thin">
      <Card title={t('basic_information', { defaultValue: 'المعلومات الأساسية' })} titleClassName="text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="employeeId" label={t('employee_id_req', { defaultValue: 'الرقم الوظيفي (*)' })} value={formData.employeeId} onChange={handleChange} required />
          <Input name="fullNameAr" label={t('full_name_ar', { defaultValue: 'الاسم الكامل (عربي) (*)' })} value={formData.fullNameAr} onChange={handleChange} required />
          <Input name="fullNameEn" label={t('full_name_en', { defaultValue: 'الاسم الكامل (إنجليزي)' })} value={formData.fullNameEn || ''} onChange={handleChange} />
          <Input name="civilId" label={t('civil_id_req', { defaultValue: 'الرقم المدني (*)' })} value={formData.civilId} onChange={handleChange} required />
          <Select name="nationality" label={t('nationality', { defaultValue: 'الجنسية' })} value={formData.nationality || ''} onChange={handleChange} options={NATIONALITIES_LIST} />
          <Input name="dateOfBirth" label={t('birth_date', { defaultValue: 'تاريخ الميلاد' })} type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
          <Select name="gender" label={t('gender', { defaultValue: 'الجنس' })} value={formData.gender || ''} onChange={handleChange} options={[{value: '', label: t('not_specified', { defaultValue: 'غير محدد' })}, {value: 'Male', label: t('male', { defaultValue: 'ذكر' })}, {value: 'Female', label: t('female', { defaultValue: 'أنثى' })}]} />
          <Input name="bloodType" label={t('blood_type', { defaultValue: 'فصيلة الدم' })} value={formData.bloodType || ''} onChange={handleChange} placeholder="A+, O-, ..." />
          <Input name="photoUrl" label={t('photo_url', { defaultValue: 'رابط الصورة الشخصية' })} value={formData.photoUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg"/>
        </div>
      </Card>

      <Card title={t('contact_emergency', { defaultValue: 'الاتصال والطوارئ' })} titleClassName="text-sm">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="email" label={t('email', { defaultValue: 'البريد الإلكتروني' })} type="email" value={formData.email || ''} onChange={handleChange} />
            <Input name="phone" label={t('phone_number', { defaultValue: 'رقم الهاتف' })} value={formData.phone || ''} onChange={handleChange} />
            <TextArea name="address" label={t('address', { defaultValue: 'العنوان' })} value={formData.address || ''} onChange={handleChange} containerClassName="md:col-span-2" rows={2} />
         </div>
         <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <h4 className="text-xs font-bold text-red-800 mb-3">{t('emergency_contact', { defaultValue: 'جهة اتصال للطوارئ' })}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <Input label={t('name', { defaultValue: 'الاسم' })} value={formData.emergencyContact?.name || ''} onChange={(e) => handleEmergencyChange('name', e.target.value)} />
               <Input label={t('phone', { defaultValue: 'الهاتف' })} value={formData.emergencyContact?.phone || ''} onChange={(e) => handleEmergencyChange('phone', e.target.value)} />
               <Input label={t('relation', { defaultValue: 'الصلة' })} value={formData.emergencyContact?.relation || ''} onChange={(e) => handleEmergencyChange('relation', e.target.value)} />
            </div>
         </div>
      </Card>
      
      <Card title={t('id_documents_financial', { defaultValue: 'بيانات الثبوتيات والمالية' })} titleClassName="text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="civilIdExpiry" label={t('civil_id_expiry', { defaultValue: 'تاريخ انتهاء البطاقة المدنية' })} type="date" value={formData.civilIdExpiry || ''} onChange={handleChange} />
              <Input name="passportNumber" label={t('passport_number', { defaultValue: 'رقم الجواز' })} value={formData.passportNumber || ''} onChange={handleChange} />
              <Input name="passportExpiry" label={t('passport_expiry', { defaultValue: 'تاريخ انتهاء الجواز' })} type="date" value={formData.passportExpiry || ''} onChange={handleChange} />
              <Input name="residencyExpiry" label={t('residency_expiry', { defaultValue: 'تاريخ انتهاء الإقامة' })} type="date" value={formData.residencyExpiry || ''} onChange={handleChange} />
              <Input name="bankIban" label={t('iban', { defaultValue: 'رقم الآيبان (IBAN)' })} value={formData.bankIban || ''} onChange={handleChange} placeholder="KW00..." />
              <Input name="bankName" label={t('bank', { defaultValue: 'البنك' })} value={formData.bankName || ''} onChange={handleChange} />
          </div>
      </Card>

      <Card title={t('educational_qualifications', { defaultValue: 'المؤهلات العلمية' })} titleClassName="text-sm">
         {formData.qualifications?.map((q, idx) => (
           <div key={idx} className="p-3 border rounded-lg mb-2 relative bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                 <Input label={t('academic_degree', { defaultValue: 'الدرجة العلمية' })} value={q.degree} onChange={(e) => handleQualificationChange(idx, 'degree', e.target.value)} />
                 <Input label={t('major', { defaultValue: 'التخصص' })} value={q.major} onChange={(e) => handleQualificationChange(idx, 'major', e.target.value)} />
                 <Input label={t('university', { defaultValue: 'الجامعة' })} value={q.university} onChange={(e) => handleQualificationChange(idx, 'university', e.target.value)} />
                 <Input label={t('graduation_year', { defaultValue: 'سنة التخرج' })} value={q.graduationYear} onChange={(e) => handleQualificationChange(idx, 'graduationYear', e.target.value)} />
              </div>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, qualifications: prev.qualifications?.filter((_, i) => i !== idx) }))}
                className="absolute top-2 left-2 text-danger"
              >
                <TrashIcon className="w-4 h-4"/>
              </button>
           </div>
         ))}
         <Button type="button" variant="ghost" size="sm" onClick={addQualification} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>{t('add_qualification', { defaultValue: 'إضافة مؤهل' })}</Button>
      </Card>

      <Card title={t('employment_information', { defaultValue: 'معلومات التوظيف' })} titleClassName="text-sm">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select name="jobTitle" label={t('job_title_req', { defaultValue: 'المسمى الوظيفي (*)' })} value={formData.jobTitle || ''} onChange={handleChange} options={JOB_TITLES_LIST} required />
            <Select name="department" label={t('department_management', { defaultValue: 'القسم/الإدارة' })} value={formData.department || ''} onChange={handleChange} options={DEPARTMENTS_LIST} required />
            <Input name="joiningDate" label={t('joining_date_req', { defaultValue: 'تاريخ الالتحاق (*)' })} type="date" value={formData.joiningDate} onChange={handleChange} required />
            <Select name="contractType" label={t('contract_type_label', { defaultValue: 'نوع العقد' })} value={formData.contractType} options={contractTypeKuwaitOptions} onChange={handleChange} required/>
            <Select name="status" label={t('employee_status_label', { defaultValue: 'حالة الموظف' })} value={formData.status} onChange={handleChange} options={EMPLOYEE_STATUS_OPTIONS} />
            <Input name="terminationDate" label={t('termination_date_optional', { defaultValue: 'تاريخ إنهاء الخدمة (إن وجد)' })} type="date" value={formData.terminationDate || ''} onChange={handleChange} />
         </div>
      </Card>
      <Card title={t('salary_allowances', { defaultValue: 'الراتب والبدلات' })} titleClassName="text-sm">
        <Input name="basicSalary" label={t('basic_salary_val', { defaultValue: 'الراتب الأساسي (د.ك)' })} type="number" value={String(formData.basicSalary || 0)} onChange={handleChange} required />
        <h4 className="text-sm font-medium text-gray-700 mt-3 mb-1">{t('allowances', { defaultValue: 'البدلات' })}:</h4>
        {formData.allowances?.map((allowance, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2 p-2 border rounded-md bg-gray-50">
            <Input containerClassName="col-span-4 mb-0" name={`allowanceName${index}`} placeholder={t('allowance_name_placeholder', { defaultValue: 'اسم البدل' })} value={allowance.name} onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)} />
            <Input containerClassName="col-span-3 mb-0" name={`allowanceValue${index}`} type="number" placeholder={t('value', { defaultValue: 'القيمة' })} value={String(allowance.value)} onChange={(e) => handleAllowanceChange(index, 'value', parseFloat(e.target.value))} />
            <label className="col-span-4 flex items-center text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" className="form-checkbox me-1 text-primary" checked={!!allowance.subjectToIndemnity} onChange={(e) => handleAllowanceChange(index, 'subjectToIndemnity', e.target.checked)} />
              {t('subject_to_bonus', { defaultValue: 'خاضع للمكافأة؟' })}
            </label>
            <Button type="button" variant="danger" size="sm" onClick={() => removeAllowance(index)} className="col-span-1 !p-1.5"><TrashIcon className="w-4 h-4"/></Button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={addAllowance} leftIcon={<PlusCircleIcon className="w-4 h-4"/>} className="mt-2 text-primary">{t('add_allowance', { defaultValue: 'إضافة بدل' })}</Button>
      </Card>
      <TextArea name="notes" label={t('additional_notes', { defaultValue: 'ملاحظات إضافية' })} value={formData.notes || ''} onChange={handleChange} rows={3} />
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
        <Button type="submit" variant="primary">{initialData?.id ? t('save_changes', { defaultValue: 'حفظ التعديلات' }) : t('add_employee', { defaultValue: 'إضافة موظف' })}</Button>
      </div>
    </form>
  );
};

// --- Mock Documents Data ---
const mockEmployeeDocuments = [
    { name: 'صورة البطاقة المدنية.pdf', type: 'إثبات شخصية', date: '2023-01-10' },
    { name: 'عقد العمل - نسخة موقعة.pdf', type: 'عقد', date: '2018-05-15' },
    { name: 'الشهادة الجامعية.jpg', type: 'مؤهل دراسي', date: '2018-05-10' },
    { name: 'إذن العمل 2024.pdf', type: 'رسمي', date: '2024-01-01' },
];

const PrintableEmployeeProfileModal: React.FC<{ employee: Employee | null; onClose: () => void }> = ({ employee, onClose }) => {
    const { t } = useTranslation();
    if (!employee) return null;
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    return (
        <Modal isOpen={!!employee} onClose={onClose} title={t('employee_profile_print_preview', { defaultValue: 'معاينة طباعة ملف الموظف' })} size="xl">
            <div className="p-10 bg-white text-black min-h-[80vh] font-sans" dir="rtl">
                {/* Header Profile */}
                <div className="flex justify-between items-start border-b-4 border-primary pb-6 mb-8">
                    <div className="flex items-center">
                        <img 
                            src={employee.photoUrl || `https://ui-avatars.com/api/?name=${employee.fullNameAr}&background=random`} 
                            className="w-24 h-24 rounded-full border-2 border-gray-200 me-6 object-cover"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-black">{employee.fullNameAr}</h1>
                            <p className="text-lg text-gray-700">{employee.jobTitle}</p>
                            <p className="text-sm text-gray-500">{employee.department} • {employee.employeeId}</p>
                        </div>
                    </div>
                    <div className="text-left font-bold text-primary-dark">
                        <h2 className="text-xl">{t('official_employee_profile', { defaultValue: 'ملف موظف رسمي' })}</h2>
                        <p className="text-xs text-gray-400">{t('internal_file_num', { defaultValue: 'رقم الملف الداخلي' })}: {employee.id}</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-2 gap-8 text-black mb-8">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 text-primary">{t('personal_information', { defaultValue: 'البيانات الشخصية' })}</h3>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <p><strong>{t('name_en', { defaultValue: 'الاسم الإنجليزي' })}:</strong> {employee.fullNameEn || '-'}</p>
                                <p><strong>{t('nationality', { defaultValue: 'الجنسية' })}:</strong> {employee.nationality}</p>
                                <p><strong>{t('civil_id', { defaultValue: 'الرقم المدني' })}:</strong> {employee.civilId}</p>
                                <p><strong>{t('birth_date', { defaultValue: 'تاريخ الميلاد' })}:</strong> {formatDate(employee.dateOfBirth)}</p>
                                <p><strong>{t('gender', { defaultValue: 'الجنس' })}:</strong> {employee.gender === 'Male' ? t('male', { defaultValue: 'ذكر' }) : employee.gender === 'Female' ? t('female', { defaultValue: 'أنثى' }) : '-'}</p>
                                <p><strong>{t('address', { defaultValue: 'العنوان' })}:</strong> {employee.address || '-'}</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 text-primary">المؤهلات العلمية والطوارئ</h3>
                            <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                                {employee.qualifications?.map((q, idx) => (
                                    <p key={idx}><strong>{q.degree}:</strong> {q.major} من {q.university} ({q.graduationYear})</p>
                                ))}
                                {(!employee.qualifications || employee.qualifications.length === 0) && <p className="italic text-gray-400">لا توجد مؤهلات مسجلة</p>}
                            </div>
                            <div className="p-3 bg-red-50 rounded border border-red-100 text-sm">
                                <p className="font-bold text-red-800 mb-1">في حالات الطوارئ (Emergency Contact):</p>
                                {employee.emergencyContact ? (
                                    <>
                                        <p><strong>الاسم:</strong> {employee.emergencyContact.name}</p>
                                        <p><strong>الهاتف:</strong> {employee.emergencyContact.phone}</p>
                                        <p><strong>الصلة:</strong> {employee.emergencyContact.relation}</p>
                                        <p><strong>فصيلة الدم:</strong> {employee.bloodType || '-'}</p>
                                    </>
                                ) : <p className="italic">لم يتم تسجيل بيانات للطوارئ</p>}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 text-primary">معلومات الاتصال والبنك</h3>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <p><strong>الهاتف:</strong> {employee.phone || '-'}</p>
                                <p><strong>البريد الإلكتروني:</strong> {employee.email || '-'}</p>
                                <p><strong>البنك:</strong> {employee.bankName || '-'}</p>
                                <p><strong>الآيبان:</strong> <span className="font-mono text-xs">{employee.bankIban || '-'}</span></p>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 text-primary">{t('employment_data', { defaultValue: 'بيانات التوظيف' })}</h3>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <p><strong>{t('joining_date', { defaultValue: 'تاريخ الالتحاق' })}:</strong> {formatDate(employee.joiningDate)}</p>
                                <p><strong>{t('contract_type', { defaultValue: 'نوع العقد' })}:</strong> {employee.contractType}</p>
                                <p><strong>{t('department', { defaultValue: 'القسم' })}:</strong> {employee.department}</p>
                                <p><strong>{t('job_title', { defaultValue: 'المسمى الوظيفي' })}:</strong> {employee.jobTitle}</p>
                                <p><strong>{t('current_status', { defaultValue: 'الحالة الحالية' })}:</strong> {EMPLOYEE_STATUS_OPTIONS.find(s=>s.value===employee.status)?.label || employee.status}</p>
                                {employee.terminationDate && <p className="text-red-600 font-bold"><strong>{t('termination_date', { defaultValue: 'تاريخ إنهاء الخدمة' })}:</strong> {formatDate(employee.terminationDate)}</p>}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 text-primary">المعلومات المالية (شهري)</h3>
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <span>الراتب الأساسي:</span>
                                    <span className="font-bold">{employee.basicSalary.toLocaleString()} د.ك</span>
                                </div>
                                {employee.allowances?.map((al, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1 border-t border-dashed">
                                        <span>{al.name}:</span>
                                        <span>{al.value.toLocaleString()} د.ك</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-2 mt-2">
                                    <span>إجمالي الراتب:</span>
                                    <span>{(employee.basicSalary + (employee.allowances?.reduce((s,a)=>s+a.value,0)||0)).toLocaleString()} د.ك</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 text-primary">العهد والأصول المسلمة</h3>
                            <div className="space-y-2 text-sm">
                                {employee.assets?.map((asset, idx) => (
                                    <div key={idx} className="flex justify-between border-b pb-1">
                                        <span>{asset.assetName} {asset.serialNumber && `(SN: ${asset.serialNumber})`}</span>
                                        <span className="text-gray-500">{asset.assignedDate}</span>
                                    </div>
                                ))}
                                {(!employee.assets || employee.assets.length === 0) && <p className="italic text-gray-400">لا توجد أصول مسجلة</p>}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer and Signatures */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                            <p className="border-b border-gray-400 pb-16 mb-2">{t('employee_signature', { defaultValue: 'توقيع الموظف' })}</p>
                        </div>
                        <div>
                            <p className="border-b border-gray-400 pb-16 mb-2">{t('department_manager', { defaultValue: 'مدير القسم' })}</p>
                        </div>
                        <div>
                            <p className="border-b border-gray-400 pb-16 mb-2">{t('hr', { defaultValue: 'الموارد البشرية' })}</p>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-10 italic">{t('document_generated_footer', { defaultValue: 'هذا المستند صادر إلكترونياً من نظام "قانوني برو" لإدارة الموارد البشرية' })} - {new Date().toLocaleString('ar-KW')}</p>
                </div>
            </div>
            <div className="flex justify-end p-4 border-t gap-2 no-print bg-gray-50">
                <Button variant="outline" onClick={onClose}>إغلاق</Button>
                <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>بدء الطباعة</Button>
            </div>
        </Modal>
    );
};

const EmployeeProfilePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [printingEmployee, setPrintingEmployee] = useState<Employee | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'profile' | 'employment' | 'finance' | 'docs' | 'education' | 'assets'>('profile');

  // Computed Lists for Filters
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))), [employees]);
  
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      (emp.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.fullNameEn && emp.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.civilId.includes(searchTerm) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDepartment ? emp.department === filterDepartment : true) &&
      (filterStatus ? emp.status === filterStatus : true)
    );
  }, [employees, searchTerm, filterDepartment, filterStatus]);

  const stats = useMemo(() => {
      return {
          total: employees.length,
          active: employees.filter(e => e.status === 'Active').length,
          onLeave: employees.filter(e => e.status === 'OnLeave').length,
          terminated: employees.filter(e => e.status === 'Terminated').length,
          totalSalaries: employees.filter(e => e.status === 'Active').reduce((sum, e) => sum + e.basicSalary + (e.allowances?.reduce((s, a) => s + a.value, 0) || 0), 0)
      };
  }, [employees]);

  // Handlers
  const handleAddEmployee = () => { setEditingEmployee(null); setIsModalOpen(true); };
  const handleEditEmployee = (employee: Employee) => { setEditingEmployee(employee); setIsModalOpen(true); };
  const handleViewEmployee = (employee: Employee) => { setViewingEmployee(employee); setActiveViewTab('profile'); };
  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف ملف هذا الموظف؟')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };
  const handleFormSubmit = (data: Employee) => {
    if (editingEmployee && editingEmployee.id) {
      setEmployees(prev => prev.map(emp => (emp.id === editingEmployee.id ? { ...data, id: emp.id } : emp)));
    } else {
      setEmployees(prev => [{ ...data, id: `emp-${Date.now()}` }, ...prev]);
    }
    setIsModalOpen(false); setEditingEmployee(null);
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try { return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return dateString; }
  }

  // --- Renderers ---

  const renderGridCard = (emp: Employee) => (
      <Card key={emp.id} className="hover:shadow-lg transition-all duration-300 group border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center text-center p-2">
              <div className="relative">
                  <img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr.replace(/\s+/g, '+')}&background=random&color=fff`} 
                       alt={emp.fullNameAr} 
                       className="w-20 h-20 rounded-full object-cover shadow-sm mb-3 border-2 border-white ring-2 ring-gray-100"
                  />
                  <span className={`absolute bottom-3 right-0 w-4 h-4 rounded-full border-2 border-white ${emp.status === 'Active' ? 'bg-green-500' : emp.status === 'OnLeave' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-md line-clamp-1" title={emp.fullNameAr}>{emp.fullNameAr}</h3>
              <p className="text-xs text-primary font-medium mb-1">{emp.jobTitle}</p>
              <p className="text-xs text-gray-500 mb-3">{emp.department}</p>
              
              <div className="w-full flex justify-between items-center text-xs text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded mb-3">
                  <span>{t('salary', { defaultValue: 'الراتب' })}: <strong>{emp.basicSalary}</strong></span>
                  <span>{t('appointment', { defaultValue: 'التعيين' })}: {new Date(emp.joiningDate).getFullYear()}</span>
              </div>

              <div className="flex space-x-2 space-x-reverse w-full pt-2 border-t dark:border-gray-700">
                  <Button variant="ghost" size="sm" className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleViewEmployee(emp)}>{t('employee_profile', { defaultValue: 'ملف الموظف' })}</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditEmployee(emp)}><PencilIcon className="w-4 h-4 text-gray-500"/></Button>
              </div>
          </div>
      </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-dark flex items-center">
                <UsersIcon className="w-8 h-8 me-3 text-primary" />
                {t('employee_files_management', { defaultValue: 'إدارة ملفات الموظفين' })}
            </h1>
            <Button onClick={handleAddEmployee} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
                {t('add_new_employee', { defaultValue: 'إضافة موظف جديد' })}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center py-3 bg-blue-50 border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">{t('total_employees', { defaultValue: 'إجمالي الموظفين' })}</p>
                  <p className="text-xl font-bold text-blue-800">{stats.total}</p>
              </Card>
              <Card className="text-center py-3 bg-green-50 border-green-200">
                  <p className="text-xs text-green-600 mb-1">{t('active', { defaultValue: 'نشط' })}</p>
                  <p className="text-xl font-bold text-green-800">{stats.active}</p>
              </Card>
              <Card className="text-center py-3 bg-yellow-50 border-yellow-200">
                  <p className="text-xs text-yellow-600 mb-1">{t('on_leave', { defaultValue: 'في إجازة' })}</p>
                  <p className="text-xl font-bold text-yellow-800">{stats.onLeave}</p>
              </Card>
              <Card className="text-center py-3 bg-purple-50 border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">{t('total_salaries', { defaultValue: 'إجمالي الرواتب' })}</p>
                  <p className="text-xl font-bold text-purple-800">{stats.totalSalaries.toLocaleString()} {t('currency_label', { defaultValue: 'د.ك' })}</p>
              </Card>
          </div>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-2">
            <div className="flex-grow w-full md:w-auto flex flex-col md:flex-row gap-3">
                <Input placeholder={t('comprehensive_search_placeholder', { defaultValue: 'بحث شامل (الاسم، الرقم، الوظيفة)...' })} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} containerClassName="mb-0 flex-grow"/>
                <Select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} options={[{value:'', label:t('all_departments', { defaultValue: 'كل الأقسام' })}, ...DEPARTMENTS_LIST]} containerClassName="mb-0 w-full md:w-48"/>
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[{value:'', label:t('all_statuses', { defaultValue: 'كل الحالات' })}, ...EMPLOYEE_STATUS_OPTIONS]} containerClassName="mb-0 w-full md:w-40"/>
            </div>
            <div className="flex border rounded-lg overflow-hidden shrink-0">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><ViewColumnsIcon className="w-5 h-5"/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><ListBulletIcon className="w-5 h-5"/></button>
            </div>
        </div>
      </Card>

      {/* Content */}
      {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
              <FolderIcon className="w-16 h-16 mx-auto mb-3 text-gray-400"/>
              <p>{t('no_employee_files_found', { defaultValue: 'لا توجد ملفات موظفين تطابق البحث.' })}</p>
          </div>
      ) : (
          viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-right">
                  {filteredEmployees.map(emp => renderGridCard(emp))}
              </div>
          ) : (
              <Card className="overflow-hidden animate-fade-in-right">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-right">{t('employee', { defaultValue: 'الموظف' })}</th>
                            <th className="px-4 py-3 text-right">{t('department_job', { defaultValue: 'القسم/الوظيفة' })}</th>
                            <th className="px-4 py-3 text-right">{t('joining_date', { defaultValue: 'تاريخ الالتحاق' })}</th>
                            <th className="px-4 py-3 text-right">{t('status', { defaultValue: 'الحالة' })}</th>
                            <th className="px-4 py-3 text-right">{t('actions', { defaultValue: 'الإجراءات' })}</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 flex items-center">
                                    <img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} className="w-8 h-8 rounded-full me-3"/>
                                    <div>
                                        <p className="font-semibold text-gray-900">{emp.fullNameAr}</p>
                                        <p className="text-xs text-gray-500">{emp.employeeId}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-gray-900">{emp.jobTitle}</p>
                                    <p className="text-xs text-gray-500">{emp.department}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(emp.joiningDate)}</td>
                                <td className="px-4 py-3">
                                    <Badge text={EMPLOYEE_STATUS_OPTIONS.find(s => s.value === emp.status)?.label || emp.status} color={emp.status === 'Active' ? 'green' : 'gray'} size="sm"/>
                                </td>
                                <td className="px-4 py-3 space-x-1 space-x-reverse">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewEmployee(emp)}><EyeIcon className="w-4 h-4 text-blue-600"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditEmployee(emp)}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(emp.id)}><TrashIcon className="w-4 h-4 text-red-600"/></Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                  </div>
              </Card>
          )
      )}

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEmployee(null); }}
        title={editingEmployee?.id ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
        size="xl"
      >
        <EmployeeForm
          initialData={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingEmployee(null); }}
        />
      </Modal>
      
      {/* Detailed View Modal (Tabbed) */}
      {viewingEmployee && (
        <Modal isOpen={!!viewingEmployee} onClose={() => setViewingEmployee(null)} title={`الملف الشخصي: ${viewingEmployee.fullNameAr}`} size="lg">
            <div className="flex flex-col h-[75vh]">
                {/* Header Profile */}
                <div className="flex items-center space-x-4 space-x-reverse p-4 bg-primary/5 rounded-lg mb-2">
                    <img src={viewingEmployee.photoUrl || `https://ui-avatars.com/api/?name=${viewingEmployee.fullNameAr}&background=random`} className="w-20 h-20 rounded-full border-4 border-white shadow"/>
                    <div>
                        <h2 className="text-xl font-bold text-primary-dark">{viewingEmployee.fullNameAr}</h2>
                        <p className="text-sm text-gray-600">{viewingEmployee.jobTitle} | {viewingEmployee.department}</p>
                        <div className="flex gap-2 mt-2 text-xs">
                            <span className="bg-white border px-2 py-1 rounded flex items-center"><UserCircleIcon className="w-3 h-3 me-1 text-gray-400"/> {viewingEmployee.employeeId}</span>
                            <span className="bg-white border px-2 py-1 rounded flex items-center"><CheckCircleIcon className="w-3 h-3 me-1 text-green-500"/> {EMPLOYEE_STATUS_OPTIONS.find(s => s.value === viewingEmployee.status)?.label || viewingEmployee.status}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                    <button onClick={() => setActiveViewTab('profile')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeViewTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>البيانات الشخصية</button>
                    <button onClick={() => setActiveViewTab('employment')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeViewTab === 'employment' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>الوظيفة والعقد</button>
                    <button onClick={() => setActiveViewTab('finance')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeViewTab === 'finance' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>الراتب والبدلات</button>
                    <button onClick={() => setActiveViewTab('education')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeViewTab === 'education' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>التطوير والطوارئ</button>
                    <button onClick={() => setActiveViewTab('assets')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeViewTab === 'assets' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>الأصول والعهد</button>
                    <button onClick={() => setActiveViewTab('docs')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeViewTab === 'docs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>المستندات والأرشيف</button>
                </div>

                {/* Tab Content */}
                <div className="flex-grow overflow-y-auto p-1 scrollbar-thin space-y-4">
                    {activeViewTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card title="الهوية والثبوتيات" titleClassName="text-sm">
                                <p className="text-sm mb-2"><strong>الاسم الإنجليزي:</strong> {viewingEmployee.fullNameEn || '-'}</p>
                                <p className="text-sm mb-2"><strong>الرقم المدني:</strong> {viewingEmployee.civilId}</p>
                                <p className="text-sm mb-2"><strong>انتهاء البطاقة:</strong> {formatDate(viewingEmployee.civilIdExpiry)}</p>
                                <p className="text-sm mb-2"><strong>رقم الجواز:</strong> {viewingEmployee.passportNumber || '-'}</p>
                                <p className="text-sm mb-2"><strong>انتهاء الجواز:</strong> {formatDate(viewingEmployee.passportExpiry)}</p>
                                <p className="text-sm mb-2"><strong>انتهاء الإقامة:</strong> {formatDate(viewingEmployee.residencyExpiry)}</p>
                                <p className="text-sm mb-2"><strong>الجنسية:</strong> {viewingEmployee.nationality}</p>
                                <p className="text-sm mb-2"><strong>الميلاد:</strong> {formatDate(viewingEmployee.dateOfBirth)} ({viewingEmployee.gender === 'Male' ? 'ذكر' : viewingEmployee.gender === 'Female' ? 'أنثى' : 'غير محدد'})</p>
                            </Card>
                            <Card title="الاتصال والبيانات البنكية" titleClassName="text-sm">
                                <p className="text-sm mb-2 flex items-center"><PhoneIcon className="w-4 h-4 text-gray-400 me-2"/> {viewingEmployee.phone || '-'}</p>
                                <p className="text-sm mb-2 flex items-center"><EnvelopeIcon className="w-4 h-4 text-gray-400 me-2"/> {viewingEmployee.email || '-'}</p>
                                <p className="text-sm mb-2"><strong>البنك:</strong> {viewingEmployee.bankName || '-'}</p>
                                <p className="text-sm mb-2"><strong>IBAN:</strong> <span className="font-mono text-xs">{viewingEmployee.bankIban || '-'}</span></p>
                                <p className="text-sm mt-2 p-2 bg-gray-50 rounded border"><strong className="block mb-1 text-xs text-gray-500">العنوان:</strong> {viewingEmployee.address || '-'}</p>
                            </Card>
                        </div>
                    )}

                    {activeViewTab === 'employment' && (
                        <div className="space-y-4">
                            <Card title="بيانات العقد" titleClassName="text-sm">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><strong>تاريخ الالتحاق:</strong> {formatDate(viewingEmployee.joiningDate)}</p>
                                    <p><strong>نوع العقد:</strong> {contractTypeKuwaitOptions.find(c=>c.value===viewingEmployee.contractType)?.label}</p>
                                    <p><strong>سنوات الخدمة (تقريبي):</strong> {Math.floor((new Date().getTime() - new Date(viewingEmployee.joiningDate).getTime()) / (365.25 * 24 * 3600 * 1000))} سنة</p>
                                    {viewingEmployee.terminationDate && <p className="text-red-600"><strong>تاريخ الانتهاء:</strong> {formatDate(viewingEmployee.terminationDate)}</p>}
                                </div>
                            </Card>
                            <Card title="ملاحظات" titleClassName="text-sm bg-yellow-50">
                                <p className="text-sm whitespace-pre-wrap">{viewingEmployee.notes || 'لا توجد ملاحظات مسجلة.'}</p>
                            </Card>
                        </div>
                    )}

                    {activeViewTab === 'finance' && (
                        <Card title="تفاصيل الراتب الشهري" titleClassName="text-sm">
                            <div className="space-y-3">
                                <div className="flex justify-between p-2 bg-gray-50 rounded border">
                                    <span className="font-semibold text-gray-700">الراتب الأساسي</span>
                                    <span className="font-bold text-gray-900">{viewingEmployee.basicSalary.toLocaleString()} د.ك</span>
                                </div>
                                {viewingEmployee.allowances && viewingEmployee.allowances.length > 0 ? (
                                    viewingEmployee.allowances.map((al, idx) => (
                                        <div key={idx} className="flex justify-between p-2 border-b border-dashed">
                                            <span className="text-sm text-gray-600">{al.name} {al.subjectToIndemnity && <span className="text-xs text-green-600">(خاضع للمكافأة)</span>}</span>
                                            <span className="text-sm font-semibold">{al.value.toLocaleString()} د.ك</span>
                                        </div>
                                    ))
                                ) : <p className="text-sm text-gray-500 italic">لا توجد بدلات إضافية.</p>}
                                <div className="flex justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 mt-2">
                                    <span className="font-bold text-primary-dark">إجمالي الراتب</span>
                                    <span className="font-bold text-primary-dark text-lg">{(viewingEmployee.basicSalary + (viewingEmployee.allowances?.reduce((s,a)=>s+a.value,0)||0)).toLocaleString()} د.ك</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeViewTab === 'education' && (
                        <div className="space-y-4">
                            <Card title="المؤهلات العلمية" titleClassName="text-sm">
                                {viewingEmployee.qualifications && viewingEmployee.qualifications.length > 0 ? (
                                    <div className="space-y-3">
                                        {viewingEmployee.qualifications.map((q, idx) => (
                                            <div key={idx} className="p-3 border rounded bg-gray-50 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <p><strong>الدرجة:</strong> {q.degree}</p>
                                                    <p><strong>التخصص:</strong> {q.major}</p>
                                                    <p><strong>الجامعة:</strong> {q.university}</p>
                                                    <p><strong>التخرج:</strong> {q.graduationYear}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">لا توجد مؤهلات مسجلة.</p>}
                            </Card>
                            <Card title="بيانات الطوارئ" titleClassName="text-sm border-s-4 border-red-500">
                                {viewingEmployee.emergencyContact ? (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <p><strong>اسم جهة الاتصال:</strong> {viewingEmployee.emergencyContact.name}</p>
                                        <p><strong>رقم الهاتف:</strong> {viewingEmployee.emergencyContact.phone}</p>
                                        <p><strong>الصلة:</strong> {viewingEmployee.emergencyContact.relation}</p>
                                        <p><strong>فصيلة الدم:</strong> <span className="font-bold text-red-600">{viewingEmployee.bloodType || 'غير مسجل'}</span></p>
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">لم يتم تسجيل بيانات طوارئ.</p>}
                            </Card>
                        </div>
                    )}

                    {activeViewTab === 'assets' && (
                        <div className="space-y-4">
                            <Card title="الأصول والعهد المسلمة" titleClassName="text-sm">
                                {viewingEmployee.assets && viewingEmployee.assets.length > 0 ? (
                                    <div className="space-y-2">
                                        {viewingEmployee.assets.map((asset, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                                                <div>
                                                    <p className="font-bold text-sm">{asset.assetName}</p>
                                                    <p className="text-xs text-gray-500">S/N: {asset.serialNumber || 'N/A'}</p>
                                                </div>
                                                <div className="text-left text-xs bg-white px-2 py-1 rounded border">
                                                    تاريخ الاستلام: {asset.assignedDate}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">لا توجد أصول مسجلة في عهدة الموظف.</p>}
                            </Card>
                            <Card title="الدورات التدريبية" titleClassName="text-sm">
                                {viewingEmployee.trainings && viewingEmployee.trainings.length > 0 ? (
                                    <div className="space-y-2">
                                        {viewingEmployee.trainings.map((tr, idx) => (
                                            <div key={idx} className="p-3 border rounded bg-gray-50">
                                                <p className="font-bold text-sm">{tr.courseName}</p>
                                                <p className="text-xs text-gray-500">{tr.provider} | {tr.completionDate}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">لا توجد دورات تدريبية مسجلة.</p>}
                            </Card>
                        </div>
                    )}

                    {activeViewTab === 'docs' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg flex flex-col items-center justify-center border-dashed border-2 cursor-pointer hover:bg-blue-100 transition-colors group" onClick={() => alert("سيتم فتح نافذة اختيار الملفات قريباً. هذه ميزة تجريبية في النسخة الحالية.")}>
                                <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-sm font-bold text-blue-800">سحب وإفلات المستندات هنا أو انقر للرفع</p>
                                <p className="text-xs text-blue-600 mt-1">(PDF, JPG, PNG - بحد أقصى 5MB)</p>
                            </div>

                            <Card title="الأرشيف الرقمي للمستندات" titleClassName="text-sm">
                                <div className="grid grid-cols-1 gap-2">
                                    {mockEmployeeDocuments.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center me-3 group-hover:bg-blue-50 transition-colors">
                                                    <DocumentTextIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-800">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{doc.type} | تاريخ: {formatDate(doc.date)}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="!p-1.5"><EyeIcon className="w-4 h-4 text-blue-600"/></Button>
                                                <Button variant="ghost" size="sm" className="!p-1.5"><ArrowDownTrayIcon className="w-4 h-4 text-green-600"/></Button>
                                                <Button variant="ghost" size="sm" className="!p-1.5"><TrashIcon className="w-4 h-4 text-red-600"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t mt-2 flex justify-between">
                    <Button variant="secondary" onClick={() => { setPrintingEmployee(viewingEmployee); setViewingEmployee(null); }} leftIcon={<PrinterIcon className="w-4"/>}>طباعة الملف</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setIsModalOpen(true); setEditingEmployee(viewingEmployee); }}>تعديل</Button>
                        <Button variant="ghost" onClick={() => setViewingEmployee(null)}>إغلاق</Button>
                    </div>
                </div>
            </div>
        </Modal>
      )}

      <PrintableEmployeeProfileModal employee={printingEmployee} onClose={() => setPrintingEmployee(null)} />


    </div>
  );
};

export default EmployeeProfilePage;
