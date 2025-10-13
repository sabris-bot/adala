import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { UserCircleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon } from '../constants';
import { Employee, ContractTypeKuwait } from '../types';
import { contractTypeKuwaitOptions } from '../constants';

export const initialEmployees: Employee[] = [ // Added export
  {
    id: 'emp-001',
    employeeId: 'EMP001',
    fullNameAr: 'أحمد محمود مبارك الأنصاري',
    fullNameEn: 'Ahmed Mahmoud Mubarak Al-Ansari',
    civilId: '285010112345',
    nationality: 'كويتي',
    jobTitle: 'محام أول متخصص بالقضايا التجارية',
    department: 'القسم التجاري والشركات',
    joiningDate: '2018-05-15',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 1200,
    allowances: [{ name: 'بدل سكن', value: 200, subjectToIndemnity: true }, { name: 'بدل انتقال', value: 50, subjectToIndemnity: false }],
    email: 'ahmed.m@example.com',
    phone: '98765432',
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/emp1/100/100',
    address: 'السالمية، قطعة 3، شارع 5، منزل 10',
    dateOfBirth: '1985-01-01',
    gender: 'Male',
    notes: 'محام قدير ذو خبرة واسعة في القضايا التجارية المعقدة.'
  },
  {
    id: 'emp-002',
    employeeId: 'EMP002',
    fullNameAr: 'فاطمة علي حسين السيد',
    fullNameEn: 'Fatima Ali Hussein Elsayed',
    civilId: '290030323456',
    nationality: 'مصرية',
    jobTitle: 'مساعدة قانونية وباحثة',
    department: 'قسم القضايا العمالية والأحوال الشخصية',
    joiningDate: '2020-01-20',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 750,
    allowances: [{ name: 'بدل سكن', value: 150, subjectToIndemnity: true }, {name: 'بدل طبيعة عمل', value: 75, subjectToIndemnity: true}],
    email: 'fatima.a@example.com',
    phone: '65432109',
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/emp2/100/100',
    address: 'حولي، شارع تونس، بناية 50، شقة 3',
    dateOfBirth: '1990-03-03',
    gender: 'Female',
  },
  {
    id: 'emp-003',
    employeeId: 'EMP003',
    fullNameAr: 'علي محمد جاسم الخالدي',
    fullNameEn: 'Ali Mohammed Jassim Al-Khaldi',
    civilId: '300070734567',
    nationality: 'كويتي',
    jobTitle: 'سكرتير تنفيذي ومسؤول إداري',
    department: 'الإدارة العامة والشؤون الإدارية',
    joiningDate: '2022-11-01',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 600,
    allowances: [{name: 'بدل مواصلات', value: 40, subjectToIndemnity: false}],
    email: 'ali.j@example.com',
    phone: '54321098',
    status: 'OnLeave',
    photoUrl: 'https://picsum.photos/seed/emp3/100/100',
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
    nationality: 'سعودية',
    jobTitle: 'مستشارة قانونية (عقود دولية)',
    department: 'القسم الدولي والاستشارات',
    joiningDate: '2021-08-10',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 1500,
    allowances: [{ name: 'بدل خبرة', value: 300, subjectToIndemnity: true }, { name: 'بدل هاتف', value: 25, subjectToIndemnity: false }],
    email: 'noura.k@example.com',
    phone: '00966501234567',
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/emp4/100/100',
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
    jobTitle: 'مندوب مبيعات (سابق)',
    department: 'المبيعات',
    joiningDate: '2019-06-01',
    contractType: ContractTypeKuwait.LIMITED,
    basicSalary: 600,
    allowances: [{ name: 'عمولة مبيعات', value: 150, subjectToIndemnity: false }],
    status: 'Terminated',
    terminationDate: '2024-03-15',
    photoUrl: 'https://picsum.photos/seed/empt01/100/100',
    address: 'الفروانية، قطعة 1، شارع 2، منزل 3',
    dateOfBirth: '1970-11-22',
    gender: 'Male',
    notes: 'تم إنهاء الخدمة بسبب إعادة هيكلة القسم. تم صرف كامل المستحقات.',
  },
  {
    id: 'emp-S01',
    employeeId: 'EMPS01',
    fullNameAr: 'سالم عبدالله الصالح',
    fullNameEn: 'Salem Abdullah Al-Saleh',
    civilId: '275020223456',
    nationality: 'كويتي',
    jobTitle: 'محاسب',
    department: 'المالية',
    joiningDate: '2019-03-10',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 900,
    allowances: [{ name: 'بدل طبيعة عمل', value: 100, subjectToIndemnity: true }],
    email: 'salem.a@example.com',
    phone: '97778888',
    status: 'Suspended',
    photoUrl: 'https://picsum.photos/seed/emps01/100/100',
    address: 'المنقف، قطعة 2، شارع 4، منزل 12',
    dateOfBirth: '1975-02-02',
    gender: 'Male',
    notes: 'الموظف موقوف عن العمل مؤقتًا لإجراء تحقيق إداري بخصوص مخالفة مالية.',
  }
];

interface EmployeeFormProps {
  initialData?: Partial<Employee> | null;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSubmit, onCancel }) => {
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
  
  const handleAllowanceChange = (
    index: number, 
    field: 'name' | 'value' | 'subjectToIndemnity', 
    value: string | boolean | number
  ) => {
    const currentAllowances = formData.allowances ? [...formData.allowances] : [];
    if (index < 0 || index >= currentAllowances.length) {
      console.error("Invalid allowance index");
      return;
    }

    const allowanceItemToUpdate = { ...currentAllowances[index] };

    if (field === 'name') {
      allowanceItemToUpdate.name = String(value);
    } else if (field === 'value') {
      allowanceItemToUpdate.value = parseFloat(String(value)) || 0;
    } else if (field === 'subjectToIndemnity') {
      allowanceItemToUpdate.subjectToIndemnity = Boolean(value);
    } 

    currentAllowances[index] = allowanceItemToUpdate;
    setFormData(prev => ({ ...prev, allowances: currentAllowances }));
  };


  const addAllowance = () => {
    setFormData(prev => ({ ...prev, allowances: [...(prev.allowances || []), { name: '', value: 0, subjectToIndemnity: false }] }));
  };
  
  const removeAllowance = (index: number) => {
    setFormData(prev => ({ ...prev, allowances: prev.allowances?.filter((_, i) => i !== index) }));
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <Card title="المعلومات الأساسية" titleClassName="text-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="employeeId" label="الرقم الوظيفي" value={formData.employeeId} onChange={handleChange} required />
          <Input name="fullNameAr" label="الاسم الكامل (عربي)" value={formData.fullNameAr} onChange={handleChange} required />
          <Input name="fullNameEn" label="الاسم الكامل (إنجليزي)" value={formData.fullNameEn || ''} onChange={handleChange} />
          <Input name="civilId" label="الرقم المدني" value={formData.civilId} onChange={handleChange} required />
          <Input name="nationality" label="الجنسية" value={formData.nationality} onChange={handleChange} />
           <Input name="dateOfBirth" label="تاريخ الميلاد" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
          <Select name="gender" label="الجنس" value={formData.gender || ''} onChange={handleChange} options={[{value: '', label: 'غير محدد'}, {value: 'Male', label: 'ذكر'}, {value: 'Female', label: 'أنثى'}]} />
          <Input name="photoUrl" label="رابط الصورة الشخصية" value={formData.photoUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg"/>
        </div>
      </Card>
      <Card title="معلومات التوظيف" titleClassName="text-md">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="jobTitle" label="المسمى الوظيفي" value={formData.jobTitle} onChange={handleChange} required />
            <Input name="department" label="القسم/الإدارة" value={formData.department} onChange={handleChange} />
            <Input name="joiningDate" label="تاريخ الالتحاق" type="date" value={formData.joiningDate} onChange={handleChange} required />
            <Select name="contractType" label="نوع العقد (وفق قانون العمل الكويتي)" value={formData.contractType} options={contractTypeKuwaitOptions} onChange={handleChange} required/>
            <Select name="status" label="حالة الموظف" value={formData.status} onChange={handleChange} 
                options={[{value: 'Active', label: 'نشط'}, {value: 'OnLeave', label: 'في إجازة'}, {value: 'Terminated', label: 'منتهية خدمته'}, {value: 'Suspended', label: 'موقوف'}]} 
            />
            <Input name="terminationDate" label="تاريخ إنهاء الخدمة (إن وجد)" type="date" value={formData.terminationDate || ''} onChange={handleChange} />
         </div>
      </Card>
      <Card title="الراتب والبدلات" titleClassName="text-md">
        <Input name="basicSalary" label="الراتب الأساسي (د.ك)" type="number" value={String(formData.basicSalary || 0)} onChange={handleChange} required />
        <h4 className="text-sm font-medium text-gray-700 mt-3 mb-1">البدلات:</h4>
        {formData.allowances?.map((allowance, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2 p-2 border rounded-md">
            <Input containerClassName="col-span-4 mb-0" name={`allowanceName${index}`} placeholder="اسم البدل" value={allowance.name} onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)} />
            <Input containerClassName="col-span-3 mb-0" name={`allowanceValue${index}`} type="number" placeholder="القيمة" value={String(allowance.value)} onChange={(e) => handleAllowanceChange(index, 'value', e.target.value)} />
            <label className="col-span-4 flex items-center text-xs text-gray-600">
              <input type="checkbox" className="form-checkbox me-1 text-primary" checked={!!allowance.subjectToIndemnity} onChange={(e) => handleAllowanceChange(index, 'subjectToIndemnity', e.target.checked)} />
              خاضع للمكافأة؟
            </label>
            <Button type="button" variant="danger" size="sm" onClick={() => removeAllowance(index)} className="col-span-1 !p-1.5">X</Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addAllowance} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>إضافة بدل</Button>
      </Card>
       <Card title="معلومات الاتصال" titleClassName="text-md">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="email" label="البريد الإلكتروني" type="email" value={formData.email || ''} onChange={handleChange} />
            <Input name="phone" label="رقم الهاتف" value={formData.phone || ''} onChange={handleChange} />
         </div>
         <TextArea name="address" label="العنوان" value={formData.address || ''} onChange={handleChange} rows={2} />
      </Card>
      <TextArea name="notes" label="ملاحظات إضافية" value={formData.notes || ''} onChange={handleChange} rows={3} />
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary">{initialData?.id ? 'حفظ التعديلات' : 'إضافة موظف'}</Button>
      </div>
    </form>
  );
};


const EmployeeProfilePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.fullNameEn && emp.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.civilId.includes(searchTerm) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };
  
  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
  };

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
    setIsModalOpen(false);
    setEditingEmployee(null);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
        return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return dateString; }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-dark flex items-center">
          <UserCircleIcon className="w-8 h-8 me-3 text-primary" />
          إدارة ملفات الموظفين
        </h1>
        <Button onClick={handleAddEmployee} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
          إضافة موظف جديد
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">ملاحظة هامة بشأن قانون العمل الكويتي</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    وفقًا لقانون العمل الكويتي رقم 6 لسنة 2010 في القطاع الأهلي، يجب على صاحب العمل الاحتفاظ بملف خاص لكل عامل يتضمن بياناته الشخصية، نسخة من عقد العمل، إذن العمل، وأي مستندات أخرى تتعلق بخدمته. يهدف هذا النظام إلى مساعدتك في تلبية هذه المتطلبات القانونية.
                </p>
            </div>
        </div>
      </Card>

      <Card>
        <Input
          placeholder="ابحث بالاسم، الرقم الوظيفي، الرقم المدني، المسمى الوظيفي..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-6"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['الصورة', 'الرقم الوظيفي', 'الاسم', 'المسمى الوظيفي', 'القسم', 'تاريخ الالتحاق', 'الحالة', 'إجراءات'].map(header => (
                  <th key={header} scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary-dark uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-primary-light/5 transition-colors">
                  <td className="px-4 py-3"><img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr.replace(/\s+/g, '+')}&background=random&color=fff`} alt={emp.fullNameAr} className="w-10 h-10 rounded-full object-cover"/></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">{emp.employeeId}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{emp.fullNameAr}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.jobTitle}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.department}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(emp.joiningDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${emp.status === 'Active' ? 'bg-success/20 text-success' : emp.status === 'OnLeave' ? 'bg-blue-500/20 text-blue-700' : emp.status === 'Terminated' ? 'bg-gray-500/20 text-gray-700' : 'bg-danger/20 text-danger'}`}>
                        {emp.status === 'Active' ? 'نشط' : emp.status === 'OnLeave' ? 'في إجازة' : emp.status === 'Terminated' ? 'منتهية خدمته' : 'موقوف'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => handleViewEmployee(emp)} title="عرض الملف"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditEmployee(emp)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(emp.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500 text-lg">
                    <FolderIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>لا يوجد موظفون يطابقون بحثك.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEmployee(null); }}
        title={editingEmployee?.id ? `تعديل بيانات الموظف: ${editingEmployee.fullNameAr}` : 'إضافة موظف جديد'}
        size="xl"
      >
        <EmployeeForm
          initialData={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingEmployee(null); }}
        />
      </Modal>
      
      {viewingEmployee && (
        <Modal isOpen={!!viewingEmployee} onClose={() => setViewingEmployee(null)} title={`ملف الموظف: ${viewingEmployee.fullNameAr}`} size="lg">
            <div className="space-y-4 p-2 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <img src={viewingEmployee.photoUrl || `https://ui-avatars.com/api/?name=${viewingEmployee.fullNameAr.replace(/\s+/g, '+')}&background=random&color=fff`} alt={viewingEmployee.fullNameAr} className="w-24 h-24 rounded-full object-cover shadow-md"/>
                    <div>
                        <h3 className="text-xl font-bold text-primary-dark">{viewingEmployee.fullNameAr}</h3>
                        {viewingEmployee.fullNameEn && <p className="text-sm text-gray-500">{viewingEmployee.fullNameEn}</p>}
                        <p className="text-md text-gray-700">{viewingEmployee.jobTitle} - {viewingEmployee.department}</p>
                    </div>
                </div>
                <Card title="المعلومات الشخصية والوظيفية" titleClassName="text-base">
                    <p><strong>الرقم الوظيفي:</strong> {viewingEmployee.employeeId}</p>
                    <p><strong>الرقم المدني:</strong> {viewingEmployee.civilId}</p>
                    <p><strong>الجنسية:</strong> {viewingEmployee.nationality}</p>
                    <p><strong>تاريخ الميلاد:</strong> {formatDate(viewingEmployee.dateOfBirth)}</p>
                    <p><strong>الجنس:</strong> {viewingEmployee.gender === 'Male' ? 'ذكر' : viewingEmployee.gender === 'Female' ? 'أنثى' : 'غير محدد'}</p>
                    <hr className="my-2"/>
                    <p><strong>تاريخ الالتحاق:</strong> {formatDate(viewingEmployee.joiningDate)}</p>
                    <p><strong>نوع العقد:</strong> {contractTypeKuwaitOptions.find(c=>c.value === viewingEmployee.contractType)?.label}</p>
                    <p><strong>الحالة:</strong> <span className={`font-semibold ${viewingEmployee.status === 'Active' ? 'text-success' : viewingEmployee.status === 'OnLeave' ? 'text-blue-700' : viewingEmployee.status === 'Terminated' ? 'text-gray-700' : 'text-danger'}`}>{viewingEmployee.status === 'Active' ? 'نشط' : viewingEmployee.status === 'OnLeave' ? 'في إجازة' : viewingEmployee.status === 'Terminated' ? 'منتهية خدمته' : 'موقوف'}</span></p>
                     {viewingEmployee.status === 'Terminated' && viewingEmployee.terminationDate && <p><strong>تاريخ إنهاء الخدمة:</strong> {formatDate(viewingEmployee.terminationDate)}</p>}
                </Card>
                 <Card title="الراتب والبدلات" titleClassName="text-base">
                    <p><strong>الراتب الأساسي:</strong> {viewingEmployee.basicSalary.toFixed(3)} د.ك</p>
                    {viewingEmployee.allowances && viewingEmployee.allowances.length > 0 && (
                        <div>
                            <strong>البدلات:</strong>
                            <ul className="list-disc ps-5 text-sm">
                                {viewingEmployee.allowances.map((al, i) => <li key={i}>{al.name}: {al.value.toFixed(3)} د.ك {al.subjectToIndemnity ? '(خاضع للمكافأة)' : ''}</li>)}
                            </ul>
                        </div>
                    )}
                </Card>
                <Card title="معلومات الاتصال" titleClassName="text-base">
                    <p><strong>البريد الإلكتروني:</strong> {viewingEmployee.email || 'غير متوفر'}</p>
                    <p><strong>الهاتف:</strong> {viewingEmployee.phone || 'غير متوفر'}</p>
                    <p><strong>العنوان:</strong> {viewingEmployee.address || 'غير متوفر'}</p>
                </Card>
                 {viewingEmployee.notes && <Card title="ملاحظات" titleClassName="text-base"><p className="whitespace-pre-wrap">{viewingEmployee.notes}</p></Card>}
            </div>
        </Modal>
      )}

    </div>
  );
};

export default EmployeeProfilePage;