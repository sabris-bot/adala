
import React, { useState, useMemo, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import PrintHeader from '../components/ui/PrintHeader';
import { 
    UserCircleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, PrinterIcon, UsersIcon, 
    BanknotesIcon, DocumentTextIcon, CheckCircleIcon, ListBulletIcon, 
    ViewColumnsIcon, BuildingOffice2Icon, PhoneIcon, EnvelopeIcon,
    CloudArrowUpIcon, ArrowDownTrayIcon, ExclamationTriangleIcon,
    BriefcaseIcon, IdentificationIcon, ShieldCheckIcon, CalendarDaysIcon,
    AcademicCapIcon, CreditCardIcon, ClockIcon, MapPinIcon, MagnifyingGlassIcon,
    ClipboardDocumentCheckIcon, BeakerIcon, ChartBarIcon, BellIcon,
    TableCellsIcon, DocumentDuplicateIcon, HistoryIcon, ArrowPathIcon, GlobeAltIcon
} from '../constants';
import { Employee, ContractTypeKuwait, Gender, EmployeeStatus } from '../types';
import { contractTypeKuwaitOptions } from '../constants';
import { Badge } from '../components/ui/Badge';

// --- Multi-lingual Constants ---
const getHRConstants = (t: any) => ({
    DEPARTMENTS_LIST: [
        { value: 'Senior Management', label: 'الإدارة العليا' },
        { value: 'Litigation', label: 'قسم التقاضي والمحاكم' },
        { value: 'Consultation', label: 'قسم الاستشارات والعقود' },
        { value: 'Corporate', label: 'قسم الشركات والتجاري' },
        { value: 'Labor', label: 'قسم القضايا العمالية' },
        { value: 'HR', label: 'إدارة الموارد البشرية' },
        { value: 'Finance', label: 'الإدارة المالية' },
        { value: 'Admin', label: 'الشؤون الإدارية والسكرتارية' },
        { value: 'IT', label: 'تقنية المعلومات' },
    ],
    JOB_TITLES_LIST: [
        { value: 'Managing Partner', label: 'شريك مدير' },
        { value: 'Senior Consultant', label: 'مستشار قانوني أول' },
        { value: 'Cassation Lawyer', label: 'محام (تمييز ودستورية)' },
        { value: 'Appeals Lawyer', label: 'محام (استئناف)' },
        { value: 'Trainee Lawyer', label: 'محام تحت التدريب' },
        { value: 'HR Manager', label: 'مدير الموارد البشرية' },
        { value: 'Accountant', label: 'محاسب' },
        { value: 'Legal Secretary', label: 'سكرتير قانوني' },
        { value: 'Court Representative', label: 'مندوب محاكم' },
    ],
    NATIONALITIES_LIST: [
        { value: 'Kuwaiti', label: 'كويتي' },
        { value: 'Egyptian', label: 'مصري' },
        { value: 'Saudi', label: 'سعودي' },
        { value: 'Jordanian', label: 'أردني' },
        { value: 'Lebanese', label: 'لبناني' },
        { value: 'Indian', label: 'هندي' },
        { value: 'Other', label: 'جنسية أخرى' },
    ],
    SOCIAL_STATUS_LIST: [
        { value: 'Single', label: 'أعزب' },
        { value: 'Married', label: 'متزوج' },
        { value: 'Divorced', label: 'مطلق' },
        { value: 'Widowed', label: 'أرمل' },
    ],
    DUAL_GENDER_LIST: [
        { value: 'Male', label: 'ذكر' },
        { value: 'Female', label: 'أنثى' },
    ],
    EMPLOYEE_STATUS_OPTIONS: [
        { value: 'Active', label: 'نشط (على رأس العمل)' },
        { value: 'OnLeave', label: 'في إجازة' },
        { value: 'Probation', label: 'فترة تجربة' },
        { value: 'Terminated', label: 'منتهي الخدمة' },
        { value: 'Suspended', label: 'موقوف إدارياً' },
    ],
    BRANCHES_LIST: [
        { value: 'Main', label: 'الفرع الرئيسي - مدينة الكويت' },
        { value: 'Fahaheel', label: 'فرع الفحيحيل' },
        { value: 'Jahra', label: 'فرع الجهراء' },
    ]
});

// --- Mock Data ---
export const initialEmployees: Employee[] = [
    {
        id: 'emp-101',
        employeeId: 'EMP-1001',
        fullNameAr: 'أحمد محمود العبدالله',
        fullNameEn: 'Ahmed Mahmoud Al-Abdullah',
        civilId: '285010112345',
        nationality: 'كويتي',
        jobTitle: 'Managing Partner',
        department: 'Senior Management',
        joiningDate: '2010-01-01',
        contractType: ContractTypeKuwait.UNLIMITED,
        basicSalary: 4500,
        allowances: [{ name: 'بدل مدير شريك', value: 1500, subjectToIndemnity: true }],
        email: 'ahmed.m@alwagayan.com',
        phone: '99001122',
        status: 'Active',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        gender: 'Male',
        socialStatus: 'Married',
        dateOfBirth: '1980-05-15',
        address: 'الخالدية، قطعة 2، شارع 21، منزل 5',
        bankName: 'بنك الكويت الوطني (NBK)',
        bankIban: 'KW65NBOK0000000123456789',
        branch: 'Main',
        jobGrade: 'A1',
        contractStartDate: '2010-01-01',
        workHoursPerDay: 8,
        workSystem: 'دوام كامل',
        restDays: ['Friday', 'Saturday'],
    },
    {
        id: 'emp-102',
        employeeId: 'EMP-1002',
        fullNameAr: 'مريم ناصر الصقر',
        fullNameEn: 'Maryam Nasser Al-Saqer',
        civilId: '292040556789',
        nationality: 'كويتي',
        jobTitle: 'Senior Consultant',
        department: 'Consultation',
        joiningDate: '2015-06-15',
        contractType: ContractTypeKuwait.LIMITED,
        contractDuration: '2 سنة',
        contractStartDate: '2015-06-15',
        contractEndDate: '2025-06-15',
        basicSalary: 2800,
        allowances: [
            { name: 'بدل سكن', value: 400, subjectToIndemnity: true },
            { name: 'بدل انتقال', value: 100, subjectToIndemnity: false }
        ],
        email: 'm.alsaqer@alwagayan.com',
        phone: '66554433',
        status: 'Active',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
        gender: 'Female',
        civilIdExpiry: '2026-12-30',
        passportExpiry: '2028-01-01',
        residencyExpiry: '2026-12-30',
        workPermitExpiry: '2026-12-30',
        jobGrade: 'B1',
    },
    {
        id: 'emp-103',
        employeeId: 'EMP-1003',
        fullNameAr: 'فهد محمد الشمري',
        fullNameEn: 'Fahad Mohammed Al-Shammari',
        civilId: '295080811223',
        nationality: 'كويتي',
        jobTitle: 'Appeals Lawyer',
        department: 'Litigation',
        joiningDate: '2019-09-01',
        contractType: ContractTypeKuwait.UNLIMITED,
        basicSalary: 1900,
        allowances: [{ name: 'بدل ترافع', value: 350, subjectToIndemnity: true }],
        email: 'f.alshammari@alwagayan.com',
        phone: '55443322',
        status: 'Active',
        gender: 'Male',
        socialStatus: 'Single',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    },
    {
        id: 'emp-104',
        employeeId: 'EMP-1004',
        fullNameAr: 'سارة خالد العتيبي',
        fullNameEn: 'Sara Khaled Al-Otaibi',
        civilId: '298101033445',
        nationality: 'كويتي',
        jobTitle: 'HR Manager',
        department: 'HR',
        joiningDate: '2020-02-10',
        contractType: ContractTypeKuwait.UNLIMITED,
        basicSalary: 2100,
        email: 's.alotaibi@alwagayan.com',
        status: 'Active',
        gender: 'Female',
        photoUrl: 'https://images.unsplash.com/photo-1598550874175-4d0fe4a2c90b?auto=format&fit=crop&q=80&w=150',
    },
    {
        id: 'emp-105',
        employeeId: 'EMP-1005',
        fullNameAr: 'خالد جاسم محمد',
        fullNameEn: 'Khaled Jassem Mohammed',
        civilId: '290111244556',
        nationality: 'مصري',
        jobTitle: 'Accountant',
        department: 'Finance',
        joiningDate: '2021-11-20',
        contractType: ContractTypeKuwait.LIMITED,
        basicSalary: 950,
        status: 'Active',
        gender: 'Male',
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    },
    {
        id: 'emp-106',
        employeeId: 'EMP-1006',
        fullNameAr: 'نورة حمد الراشد',
        fullNameEn: 'Noura Hamad Al-Rashed',
        civilId: '296030388990',
        nationality: 'كويتي',
        jobTitle: 'Legal Secretary',
        department: 'Admin',
        joiningDate: '2022-03-01',
        contractType: ContractTypeKuwait.LIMITED,
        contractEndDate: '2025-03-01',
        basicSalary: 850,
        status: 'Active',
        gender: 'Female',
        photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=150',
    },
    {
        id: 'emp-107',
        employeeId: 'EMP-1007',
        fullNameAr: 'عبدالرحمن العتيبي',
        fullNameEn: 'Abdulrahman Al-Otaibi',
        civilId: '299010177889',
        nationality: 'كويتي',
        jobTitle: 'Court Representative',
        department: 'Admin',
        joiningDate: '2023-01-15',
        contractType: ContractTypeKuwait.UNLIMITED,
        basicSalary: 600,
        status: 'Probation',
        gender: 'Male',
        photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=150',
    }
];

// --- Sub-components (Detail Tabs) ---
const DetailsTabProfile: React.FC<{ emp: Employee }> = ({ emp }) => {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="md:col-span-2 shadow-sm border-slate-100">
                <div className="p-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <IdentificationIcon className="w-5 h-5 text-indigo-500" />
                        البيانات الشخصية والأساسية
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                        <DetailItem label="الرقم المدني" value={emp.civilId} />
                        <DetailItem label="الجنسية" value={emp.nationality} />
                        <DetailItem label="تاريخ الميلاد" value={emp.dateOfBirth} />
                        <DetailItem label="الجنس" value={emp.gender === 'Male' ? 'ذكر' : 'أنثى'} />
                        <DetailItem label="الحالة الاجتماعية" value={emp.socialStatus || 'غير محدد'} />
                        <DetailItem label="رقم الهاتف" value={emp.phone} />
                        <DetailItem label="البريد الإلكتروني" value={emp.email} />
                        <DetailItem label="فصيلة الدم" value={emp.bloodType} />
                        <div className="sm:col-span-2">
                            <DetailItem label="العنوان السكني" value={emp.address} />
                        </div>
                    </div>
                </div>
            </Card>
            <Card className="shadow-sm border-slate-100 bg-indigo-50/20">
                 <div className="p-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-indigo-500" />
                        صلاحية المستندات
                    </h3>
                    <div className="space-y-4">
                        <StatusItem label="انتهاء البطاقة المدنية" value={emp.civilIdExpiry} critical />
                        <StatusItem label="انتهاء جواز السفر" value={emp.passportExpiry} />
                        <StatusItem label="انتهاء الإقامة" value={emp.residencyExpiry} critical />
                        <StatusItem label="انتهاء إذن العمل" value={emp.workPermitExpiry} />
                        <StatusItem label="رقم التأمين الصحي" value={emp.healthInsuranceNumber || 'غير مسجل'} />
                    </div>
                 </div>
            </Card>
        </div>
    );
};

const DetailsTabContract: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="shadow-sm border-slate-100">
            <div className="p-2">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-indigo-500" />
                    بيانات الوظيفة والقسم
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                    <DetailItem label="القسم" value={emp.department} />
                    <DetailItem label="المسمى الوظيفي" value={emp.jobTitle} />
                    <DetailItem label="الدرجة الوظيفية" value={emp.jobGrade || 'غير محدد'} />
                    <DetailItem label="الفرع" value={emp.branch || 'الرئيسي'} />
                    <DetailItem label="تاريخ التعيين" value={emp.joiningDate} />
                    <DetailItem label="المدير المباشر" value={emp.managerName || 'الإدارة العليا'} />
                </div>
            </div>
        </Card>
        <Card className="shadow-sm border-slate-100">
            <div className="p-2">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                    تفاصيل العقد والدوام
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                    <DetailItem label="نوع العقد" value={emp.contractType} />
                    <DetailItem label="مدة العقد" value={emp.contractDuration || 'غير محدد'} />
                    <DetailItem label="بداية العقد" value={emp.contractStartDate} />
                    <DetailItem label="نهاية العقد" value={emp.contractEndDate || 'مستمر'} />
                    <DetailItem label="ساعات العمل" value={emp.workHoursPerDay ? `${emp.workHoursPerDay} ساعة` : '-'} />
                    <DetailItem label="نظام الدوام" value={emp.workSystem || 'دوام كامل'} />
                    <div className="sm:col-span-2">
                        <DetailItem label="أيام الراحة" value={emp.restDays?.join(' - ') || 'الجمعة / السبت'} />
                    </div>
                </div>
            </div>
        </Card>
    </div>
);

const DetailsTabPayroll: React.FC<{ emp: Employee }> = ({ emp }) => {
    const totalAllowances = emp.allowances?.reduce((sum, a) => sum + a.value, 0) || 0;
    const grossSalary = emp.basicSalary + totalAllowances;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-sm border-slate-100">
                <div className="p-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BanknotesIcon className="w-5 h-5 text-indigo-500" />
                        هيكل الرواتب والبدلات
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm">الراتب الأساسي</span>
                            <span className="font-bold text-slate-900">{emp.basicSalary.toLocaleString()} د.ك</span>
                        </div>
                        {emp.allowances?.map((a, i) => (
                            <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-dashed border-slate-200">
                                <span className="text-slate-500 text-sm">{a.name}</span>
                                <span className="font-semibold text-slate-700">{a.value.toLocaleString()} د.ك</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center p-4 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <span className="font-medium">إجمالي الراتب (Gross)</span>
                            <span className="font-black text-2xl">{grossSalary.toLocaleString()} د.ك</span>
                        </div>
                    </div>
                </div>
            </Card>
            <Card className="shadow-sm border-slate-100 bg-emerald-50/20">
                <div className="p-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CreditCardIcon className="w-5 h-5 text-indigo-500" />
                        البيانات البنكية والتأمينات
                    </h3>
                    <div className="space-y-6">
                        <DetailItem label="اسم البنك" value={emp.bankName || 'غير مسجل'} />
                        <DetailItem label="رقم الحساب" value={emp.bankAccount || '-'} font="mono" />
                        <DetailItem label="IBAN" value={emp.bankIban || '-'} font="mono" size="xs" />
                        <hr className="border-slate-200 border-dashed" />
                        <DetailItem label="رقم التأمينات الاجتماعية" value={emp.socialSecurityNumber || 'غير مسجل'} />
                    </div>
                </div>
            </Card>
        </div>
    );
};

const DetailsTabReports: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="الإنتاجية" value="92%" icon={<CheckCircleIcon className="w-6 h-6"/>} trend="+5%" />
            <StatCard label="الالتزام بالوقت" value="88%" icon={<ClockIcon className="w-6 h-6"/>} />
            <StatCard label="المهام المنجزة" value="142" icon={<FolderIcon className="w-6 h-6"/>} />
            <StatCard label="تقييم الإدارة" value="4.8/5" icon={<UserCircleIcon className="w-6 h-6"/>} />
        </div>
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100">
                <h5 className="text-lg font-black text-slate-800">سجل التقييمات السنوية</h5>
            </div>
            <div className="divide-y divide-slate-100">
                {[
                    { year: '2023', score: 'إمتياز (95%)', note: 'أداء متميز في الترافع والبحث القانوني.', author: 'أحمد الصباح' },
                    { year: '2022', score: 'جيد جداً (88%)', note: 'تطور ملحوظ في المهارات العملية.', author: 'سارة العبدالله' },
                ].map((r, i) => (
                    <div key={i} className="p-6 flex items-start justify-between bg-white hover:bg-slate-50 transition-colors">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{r.year}</span>
                                <h6 className="font-black text-slate-800">{r.score}</h6>
                            </div>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-xl">{r.note}</p>
                        </div>
                        <div className="text-left text-xs text-slate-400">
                            <p className="font-bold">المقيم: {r.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

const DetailsTabLeaves: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard label="رصيد الإجازات المتبقي" value="22 يوم" icon={<CalendarDaysIcon className="w-6 h-6"/>} trend="محدث" />
            <StatCard label="إجازات مستنفذة" value="8 أيام" icon={<ClockIcon className="w-6 h-6"/>} />
            <StatCard label="طلبات معلقة" value="1" icon={<ExclamationTriangleIcon className="w-6 h-6"/>} critical />
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h5 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                تاريخ الإجازات الأخير
            </h5>
            <div className="space-y-3">
                {[
                    { type: 'إجازة سنوية', date: '2024/03/01 - 2024/03/10', status: 'Approved', days: 10 },
                    { type: 'إجازة مرضية', date: '2024/01/15', status: 'Approved', days: 1 },
                ].map((l, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{l.type}</p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{l.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-indigo-600 text-xs">{l.days} يوم</p>
                            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">معتمد</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const DetailsTabAttendance: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
            <h5 className="text-lg font-black text-slate-800">سجل الدوام والحضور</h5>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl font-bold">الشهر الحالي</Button>
                <Button variant="outline" size="sm" className="rounded-xl font-bold">تصدير PDF</Button>
            </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">الحضور</p>
                <p className="text-xl font-black text-emerald-700">95%</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">التأخير</p>
                <p className="text-xl font-black text-amber-700">120 د</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">الغياب</p>
                <p className="text-xl font-black text-rose-700">1 يوم</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">إضافي</p>
                <p className="text-xl font-black text-indigo-700">15 س</p>
            </div>
        </div>
        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
             <table className="w-full">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 text-right text-[10px] font-black text-slate-400">التاريخ</th>
                        <th className="p-4 text-right text-[10px] font-black text-slate-400">الدخول</th>
                        <th className="p-4 text-right text-[10px] font-black text-slate-400">الخروج</th>
                        <th className="p-4 text-right text-[10px] font-black text-slate-400">الحالة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                    {[
                        { date: '2024/05/10', in: '08:05', out: '16:15', status: 'Present' },
                        { date: '2024/05/09', in: '08:30', out: '16:00', status: 'Late' },
                        { date: '2024/05/08', in: '08:00', out: '16:05', status: 'Present' },
                    ].map((a, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono">{a.date}</td>
                            <td className="p-4 font-mono font-bold text-slate-600">{a.in}</td>
                            <td className="p-4 font-mono font-bold text-slate-600">{a.out}</td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] ${a.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {a.status === 'Present' ? 'حاضر' : 'تأخير'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </Card>
    </div>
);

const DetailsTabDocs: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
            <h5 className="text-lg font-black text-slate-800 tracking-tight">الأرشيف الرقمي</h5>
            <Button className="rounded-2xl bg-slate-900 h-10 px-6 text-xs font-black shadow-lg shadow-slate-900/10" leftIcon={<CloudArrowUpIcon className="w-4"/>}>رفع مستند جديد</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { title: 'البطاقة المدنية', icon: <IdentificationIcon/>, expires: '2025/12/30', status: 'Valid' },
                { title: 'جواز السفر', icon: <GlobeAltIcon/>, expires: '2026/05/15', status: 'Valid' },
                { title: 'عقد العمل الموثق', icon: <BriefcaseIcon/>, expires: 'N/A', status: 'Permanent' },
                { title: 'إذن العمل', icon: <ShieldCheckIcon/>, expires: '2024/11/20', status: 'Expiring Soon' },
                { title: 'الشهادة الجامعية', icon: <AcademicCapIcon/>, expires: 'N/A', status: 'Permanent' },
                { title: 'شهادة الراتب', icon: <BanknotesIcon/>, expires: 'N/A', status: 'Permanent' },
            ].map((doc, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-indigo-500">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {React.cloneElement(doc.icon as React.ReactElement, { className: 'w-6 h-6' } as any)}
                        </div>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors"><EyeIcon className="w-4"/></button>
                            <button className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors"><ArrowDownTrayIcon className="w-4"/></button>
                        </div>
                    </div>
                    <h6 className="font-black text-slate-800 text-sm mb-1">{doc.title}</h6>
                    <div className="flex items-center justify-between mt-4">
                         <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">Expiry: {doc.expires}</p>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg ${doc.status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 uppercase'}`}>{doc.status}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DetailsTabAlerts: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h5 className="text-lg font-black text-slate-800 mb-6 px-2">تنبيهات النظام الذكية</h5>
        <div className="space-y-4">
            {[
                { title: 'اقتراب موعد انتهاء الإقامة', date: 'بعد 15 يوم', priority: 'High', msg: 'يرجى البدء في إجراءات الفحص الطبي وتجديد الإقامة.' },
                { title: 'موعد التقييم السنوي', date: 'بعد 5 أيام', priority: 'Medium', msg: 'تم تحديد موعد لمقابلة الأداء مع مدير القسم المختص.' },
                { title: 'علاوة دورية مستحقة', date: 'الشهر القادم', priority: 'Low', msg: 'الموظف يستحق الترقية الوظيفية حسب سنوات الخبرة.' },
            ].map((al, i) => (
                <div key={i} className={`p-6 rounded-[2rem] border ${al.priority === 'High' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'} shadow-sm flex gap-5 animate-in slide-in-from-right duration-700 delay-${i*100}`}>
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${al.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
                         <BellIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h6 className={`font-black text-lg ${al.priority === 'High' ? 'text-rose-900' : 'text-slate-800'}`}>{al.title}</h6>
                             <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${al.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>{al.date}</span>
                        </div>
                        <p className={`text-sm ${al.priority === 'High' ? 'text-rose-700/80' : 'text-slate-500'} leading-relaxed font-medium`}>{al.msg}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DetailsTabHistory: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h5 className="text-lg font-black text-slate-800 mb-8 px-2 tracking-tight">التسلسل الزمني الوظيفي</h5>
        <div className="relative border-r-2 border-slate-100 pr-8 space-y-12 py-4">
            {[
                { title: 'ترقية إلى مسمى رفيع', date: '2024/01/01', desc: 'تمت ترقية الموظف تقديراً للأداء الاستثنائي في إدارة القضايا المعقدة.' },
                { title: 'تعديل الراتب الأساسي', date: '2023/06/15', desc: 'زيادة سنوية بنسبة 10% بناءً على نتائج التقييم السنوي.' },
                { title: 'اجتياز فترة التجربة', date: '2022/03/01', desc: 'تثبيت الموظف في ملاك الوظائف الدائم بالدائرة القانونية.' },
                { title: 'تاريخ التعيين', date: '2021/11/01', desc: 'الانضمام للمكتب بصفة باحث قانوني مبتدئ.' },
            ].map((h, i) => (
                <div key={i} className="relative animate-in slide-in-from-right duration-500 delay-150">
                    <div className="absolute -right-[41px] top-0 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white ring-4 ring-indigo-50"></div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-500 mb-1 tabular-nums bg-indigo-50 inline-block px-2 py-0.5 rounded-lg">{h.date}</p>
                        <h6 className="font-black text-slate-800 text-md mb-2">{h.title}</h6>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{h.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DetailsTabNotes: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
            <h5 className="text-lg font-black text-slate-800 mb-6 px-2">ملاحظات ومرئيات الإدارة</h5>
            <Button className="rounded-2xl bg-indigo-600 h-10 px-6 text-xs font-black" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة ملاحظة</Button>
        </div>
        <div className="space-y-4">
            {[
                { author: 'أحمد الصباح', role: 'المدير العام', date: 'منذ يومين', text: 'الموظف يبدي التزاماً كبيراً بمواعيد الجلسات ودقة في صياغة المذكرات القانونية.' },
                { author: 'سارة العبدالله', role: 'مدير HR', date: 'منذ أسبوع', text: 'يرجى مراجعة ملف الدورات التدريبية المتبقية للموظف لهذا العام.' },
            ].map((n, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">{(n.author[0])}</div>
                            <div>
                                <p className="font-black text-slate-800 text-sm">{n.author}</p>
                                <p className="text-[9px] text-indigo-500 font-bold uppercase">{n.role}</p>
                            </div>
                         </div>
                         <p className="text-[10px] text-slate-400 font-bold">{n.date}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{n.text}"</p>
                </div>
            ))}
        </div>
    </div>
);

const DetailsTabChangeLog: React.FC<{ emp: Employee }> = ({ emp }) => (
    <div className="p-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                 <h5 className="text-sm font-black text-slate-800">سجل النشاطات والتعديلات الآلي</h5>
             </div>
             <div className="divide-y divide-slate-50">
                 {[
                    { action: 'تغيير الحالة', detail: 'من "تجربة" إلى "نشط"', user: 'System Agent', time: 'اليوم، 10:30 صباحاً' },
                    { action: 'تعديل الراتب', detail: 'زيادة 150 د.ك على الراتب الأساسي', user: 'Admin User', time: 'أمس، 02:20 مساءً' },
                    { action: 'تحديث مستند', detail: 'تجديد البطاقة المدنية', user: 'Admin User', time: '05 مايو 2024' },
                    { action: 'إضافة إجازة', detail: 'إجازة سنوية لمدة 10 أيام', user: 'Employee Portal', time: '01 مايو 2024' },
                 ].map((log, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50/30 transition-colors flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></div>
                            <div>
                                <p className="font-black text-slate-800">{log.action}</p>
                                <p className="text-slate-400 font-medium">{log.detail}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-indigo-600 font-black">{log.user}</p>
                            <p className="text-[10px] text-slate-300 font-mono tracking-tighter uppercase">{log.time}</p>
                        </div>
                    </div>
                 ))}
             </div>
        </div>
        <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-center">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 font-mono">End of Encrypted Log</p>
             <p className="text-xs text-slate-400 font-medium tracking-tight">يحتفظ النظام بسجل كامل لكافة التغييرات لأغراض الرقابة والامتثال القانوني.</p>
        </div>
    </div>
);

// --- Helpers ---
const DetailItem = ({ label, value, font = 'sans', size = 'sm' }: { label: string, value?: string | number, font?: 'sans' | 'mono', size?: 'xs' | 'sm' | 'md' }) => (
    <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-${size} font-bold text-slate-800 ${font === 'mono' ? 'font-mono' : ''}`}>{value || '-'}</p>
    </div>
);

const StatusItem = ({ label, value, critical = false }: { label: string, value?: string, critical?: boolean }) => {
    const isExpiring = value && new Date(value) < new Date(new Date().setMonth(new Date().getMonth() + 2));
    return (
        <div className="flex justify-between items-center text-sm group">
            <span className="text-slate-500">{label}</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold leading-tight ${
                isExpiring && critical ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-200' : 
                isExpiring ? 'bg-amber-100 text-amber-600 ring-1 ring-amber-200' : 
                'bg-slate-100 text-slate-500'
            }`}>
                {value || 'غير مسجل'}
            </span>
        </div>
    );
};

const EmployeeStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const configs: Record<string, { label: string, class: string }> = {
        'Active': { label: 'نشط', class: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
        'OnLeave': { label: 'في إجازة', class: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
        'Probation': { label: 'فترة تجربة', class: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' },
        'Terminated': { label: 'منتهي', class: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' },
        'Suspended': { label: 'موقوف', class: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
    };
    const config = configs[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${config.class}`}>{config.label}</span>;
};

// --- Modern HR Helpers ---
const SidebarLink = ({ icon, label, count, active = false }: { icon: any, label: string, count?: number, active?: boolean }) => (
    <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
        <div className="flex items-center gap-3">
            <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
            <span className="text-sm font-bold">{label}</span>
        </div>
        {count && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg">{count}</span>}
    </button>
);

const StatCard = ({ label, value, icon, trend, critical = false }: { label: string, value: string | number, icon: any, trend?: string, critical?: boolean }) => (
    <div className={`bg-white p-6 rounded-[2.5rem] border ${critical ? 'border-rose-100 ring-4 ring-rose-50/50' : 'border-slate-100'} shadow-sm relative overflow-hidden group`}>
        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${critical ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center gap-1.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">{trend}</span>
            </div>
        )}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
    </div>
);

const HeroStat = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5 group hover:bg-white/20 transition-all">
        <div className="text-indigo-300 group-hover:scale-110 transition-transform">{icon}</div>
        <div>
            <p className="text-[9px] font-black text-indigo-200/50 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xs font-bold font-mono tracking-tighter leading-none">{value}</p>
        </div>
    </div>
);

const TabBtn = ({ id, icon, label, active, onClick }: { id: string, icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
            active 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-y-[-2px]' 
            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
        }`}
    >
        <span className={active ? 'text-white' : 'text-slate-400'}>{React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' } as any)}</span>
        {label}
    </button>
);


// --- Main Page Component ---
const EmployeeProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'contract' | 'payroll' | 'leaves' | 'attendance' | 'docs' | 'evaluations' | 'alerts' | 'history' | 'notes' | 'changelog'>('profile');

    // Form State
    const [formData, setFormData] = useState<Partial<Employee>>({
        fullNameAr: '',
        fullNameEn: '',
        civilId: '',
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        nationality: 'كويتي',
        jobTitle: '',
        department: '',
        joiningDate: new Date().toISOString().split('T')[0],
        contractType: ContractTypeKuwait.UNLIMITED,
        status: 'Active',
        basicSalary: 0,
        gender: 'Male',
        email: '',
        phone: '',
    });

    // Filtering logic
    const filteredEmployees = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return employees.filter(e => 
            e.fullNameAr.toLowerCase().includes(term) ||
            (e.fullNameEn && e.fullNameEn.toLowerCase().includes(term)) ||
            e.employeeId.toLowerCase().includes(term) ||
            e.civilId.includes(term) ||
            (e.jobTitle && e.jobTitle.toLowerCase().includes(term))
        );
    }, [employees, searchTerm]);

    const handleAddExample = () => {
        setEmployees(prev => [...prev, ...initialEmployees.map(e => ({...e, id: Math.random().toString(36).substr(2, 9)}))]);
        addToast({
            type: 'success',
            title: 'تمت الإضافة',
            message: 'تمت إضافة موظفين نموذجيين إضافيين للسجل المحلي.'
        });
    };

    const handleOpenForm = (emp?: Employee) => {
        if (emp) {
            setEditingEmployee(emp);
            setFormData(emp);
        } else {
            setEditingEmployee(null);
            setFormData({
                fullNameAr: '',
                fullNameEn: '',
                civilId: '',
                employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                nationality: 'كويتي',
                jobTitle: '',
                department: '',
                joiningDate: new Date().toISOString().split('T')[0],
                contractType: ContractTypeKuwait.UNLIMITED,
                status: 'Active',
                basicSalary: 0,
                gender: 'Male',
                email: '',
                phone: '',
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmployee) {
            setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } as Employee : emp));
            addToast({
                type: 'success',
                title: 'تم التحديث',
                message: `تم تحديث بيانات الموظف ${formData.fullNameAr} بنجاح.`
            });
        } else {
            const newEmp: Employee = {
                ...formData,
                id: Math.random().toString(36).substr(2, 9),
            } as Employee;
            setEmployees(prev => [newEmp, ...prev]);
            addToast({
                type: 'success',
                title: 'تمت الإضافة',
                message: 'تم إضافة الموظف الجديد إلى النظام.'
            });
        }
        setIsFormOpen(false);
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الموظف نهائياً من السجل؟")) {
            setEmployees(prev => prev.filter(emp => emp.id !== id));
            if (selectedEmployee?.id === id) setSelectedEmployee(null);
            addToast({
                type: 'warning',
                title: 'تم حذف الموظف',
                message: 'تم حذف سجل الموظف من قاعدة البيانات.'
            });
        }
    };

    const handleView = (emp: Employee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedEmployee(emp);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Sidebar-based Layout for HR System */}
            <div className="flex">
                {/* Internal Module Sidebar */}
                <aside className="w-64 bg-white border-l h-screen sticky top-0 hidden lg:block overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-indigo-600 p-2 rounded-xl">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-slate-800 tracking-tight">إدارة الكوادر</span>
                        </div>

                        <nav className="space-y-1">
                            <SidebarLink icon={<ViewColumnsIcon className="w-5"/>} label="نظرة عامة" active />
                            <SidebarLink icon={<IdentificationIcon className="w-5"/>} label="دليل الموظفين" />
                            <SidebarLink icon={<BriefcaseIcon className="w-5"/>} label="عقود العمل" count={2} />
                            <SidebarLink icon={<ShieldCheckIcon className="w-5"/>} label="الإقامات والتراخيص" count={3} />
                            <SidebarLink icon={<CalendarDaysIcon className="w-5"/>} label="الإجازات والدوام" />
                            <SidebarLink icon={<BanknotesIcon className="w-5"/>} label="كشوف الرواتب" />
                            <SidebarLink icon={<AcademicCapIcon className="w-5"/>} label="التقييم السنوي" />
                            <SidebarLink icon={<FolderIcon className="w-5"/>} label="الأرشيف الرقمي" />
                        </nav>

                        <div className="mt-10 pt-10 border-t">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-3">الإعدادات والتقارير</p>
                            <nav className="space-y-1">
                                <SidebarLink icon={<ChartBarIcon className="w-5"/>} label="التحليلات" />
                                <SidebarLink icon={<DocumentTextIcon className="w-5"/>} label="اللوائح الداخلية" />
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden">
                    {/* Header */}
                    <header className="bg-white border-b sticky top-0 z-30 px-8 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">ملفات الموظفين</h1>
                            <p className="text-xs text-slate-400 font-medium">إدارة شاملة لبيانات الموظفين والامتثال القانوني</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 relative group transition-all">
                                <BellIcon className="w-5 h-5 text-slate-400" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                            </button>
                            <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
                            <Button variant="outline" className="rounded-xl border-slate-200 h-11 text-xs font-bold" leftIcon={<CloudArrowUpIcon className="w-4"/>}>استيراد</Button>
                            <Button variant="outline" className="rounded-xl border-slate-200 h-11 text-xs font-bold" leftIcon={<ArrowDownTrayIcon className="w-4"/>}>تصدير</Button>
                            <Button className="rounded-xl bg-indigo-600 h-11 px-6 text-xs font-black shadow-lg shadow-indigo-600/10" leftIcon={<PlusCircleIcon className="w-5"/>} onClick={() => handleOpenForm()}>إضافة موظف</Button>
                        </div>
                    </header>

                    <div className="p-8">
                        {/* Dashboard Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard 
                                label="إجمالي الموظفين" 
                                value={employees.length} 
                                icon={<UsersIcon className="w-6 h-6 text-indigo-600"/>} 
                                trend="+2 هذا الشهر"
                            />
                            <StatCard 
                                label="الموظفون النشطون" 
                                value={employees.filter(e => e.status === 'Active').length} 
                                icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600"/>}
                            />
                            <StatCard 
                                label="إقامات تنتهي قريباً" 
                                value={3} 
                                icon={<ShieldCheckIcon className="w-6 h-6 text-rose-600"/>}
                                critical
                            />
                            <StatCard 
                                label="عقود تنتهي قريباً" 
                                value={2} 
                                icon={<BriefcaseIcon className="w-6 h-6 text-amber-600"/>}
                            />
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 group">
                                <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                    className="w-full h-12 pr-12 pl-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
                                    placeholder="ابحث بذكاء (الاسم، الرقم المدني، المسمى)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <select className="h-12 px-4 rounded-2xl bg-slate-50 border-none text-xs font-bold">
                                    <option>كافة الأقسام</option>
                                    <option>التقاضي</option>
                                    <option>الاستشارات</option>
                                </select>
                                <select className="h-12 px-4 rounded-2xl bg-slate-50 border-none text-xs font-bold">
                                    <option>كافة الحالات</option>
                                    <option>نشط</option>
                                    <option>إجازة</option>
                                </select>
                                <div className="flex bg-slate-100/50 p-1 rounded-2xl">
                                    <button onClick={() => setViewMode('grid')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}><ViewColumnsIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setViewMode('table')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}><ListBulletIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Render */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {filteredEmployees.map(emp => (
                                    <div 
                                        key={emp.id} 
                                        onClick={() => handleView(emp)}
                                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-4">
                                                <img 
                                                    src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} 
                                                    className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-50 shadow-inner group-hover:scale-105 transition-transform"
                                                    alt=""
                                                />
                                                <div className={`absolute -bottom-1 -left-1 w-6 h-6 rounded-full border-4 border-white ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500 shadow-sm'}`}></div>
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg mb-1">{emp.fullNameAr}</h3>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">{emp.jobTitle}</p>
                                            
                                            <div className="w-full grid grid-cols-2 gap-2 mb-6">
                                                <div className="bg-slate-50 p-2 rounded-2xl">
                                                    <p className="text-[9px] text-slate-400 font-bold mb-0.5">ID</p>
                                                    <p className="text-xs font-black text-slate-600">{emp.employeeId}</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-2xl">
                                                    <p className="text-[9px] text-slate-400 font-bold mb-0.5">الحالة</p>
                                                    <p className="text-[10px] font-black text-emerald-600">نشط</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-auto w-full">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(emp); }} className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-xs font-bold">تعديل</button>
                                                <button onClick={(e) => handleDelete(emp.id, e)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"><TrashIcon className="w-5"/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                                            <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">المنصب والقسم</th>
                                            <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">التوظيف</th>
                                            <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                                            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredEmployees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => handleView(emp)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} className="w-11 h-11 rounded-2xl object-cover border border-slate-100" />
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm">{emp.fullNameAr}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">ID: {emp.employeeId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-700 text-sm">{emp.jobTitle}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.department}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-600 text-xs">{emp.contractType}</p>
                                                    <p className="text-[10px] text-slate-400 tabular-nums">{emp.joiningDate}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <EmployeeStatusBadge status={emp.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); handleOpenForm(emp); }} className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><PencilIcon className="w-4.5"/></button>
                                                        <button onClick={(e) => handleDelete(emp.id, e)} className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"><TrashIcon className="w-4.5"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>


                {filteredEmployees.length === 0 && (
                    <div className="py-32 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                            <IdentificationIcon className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">لا توجد نتائج مطابقة</h3>
                        <p className="text-slate-400 text-sm mt-1">حاول استخدام كلمات بحث أخرى أو تغيير الفلاتر</p>
                    </div>
                )}

            {/* Modal: Add/Edit Form */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingEmployee ? 'تعديل بيانات موظف' : 'تسجيل موظف جديد'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="الاسم الكامل (عربي)" value={formData.fullNameAr} onChange={e => setFormData({...formData, fullNameAr: e.target.value})} required />
                        <Input label="الاسم الكامل (English)" value={formData.fullNameEn} onChange={e => setFormData({...formData, fullNameEn: e.target.value})} />
                        <Input label="الرقم المدني" value={formData.civilId} onChange={e => setFormData({...formData, civilId: e.target.value})} required maxLength={12} />
                        <Input label="الرقم الوظيفي" value={formData.employeeId} disabled />
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الجنس</label>
                            <div className="flex bg-slate-50 p-1 rounded-2xl">
                                <button type="button" onClick={() => setFormData({...formData, gender: 'Male'})} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${formData.gender === 'Male' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>ذكر</button>
                                <button type="button" onClick={() => setFormData({...formData, gender: 'Female'})} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${formData.gender === 'Female' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>أنثى</button>
                            </div>
                        </div>

                        <Input label="الجنسية" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                        <Input label="المسمى الوظيفي" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} required />
                        <Input label="القسم" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
                        <Input label="تاريخ التعيين" type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} required />
                        <Input label="الراتب الأساسي (د.ك)" type="number" value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: parseFloat(e.target.value)})} required />
                        
                        <Select 
                            label="نوع العقد" 
                            options={contractTypeKuwaitOptions} 
                            value={formData.contractType} 
                            onChange={e => setFormData({...formData, contractType: e.target.value as any})} 
                        />
                        <Select 
                            label="الحالة الوظيفية" 
                            options={[
                                { value: 'Active', label: 'نشط' },
                                { value: 'OnLeave', label: 'إجازة' },
                                { value: 'Probation', label: 'تجربة' },
                                { value: 'Terminated', label: 'ملغي' }
                            ]} 
                            value={formData.status} 
                            onChange={e => setFormData({...formData, status: e.target.value as any})} 
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t font-black">
                        <Button variant="secondary" className="rounded-xl px-8 h-12" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
                        <Button type="submit" variant="primary" className="rounded-xl px-12 h-12 bg-indigo-600 shadow-lg shadow-indigo-600/20">{editingEmployee ? 'حفظ التغييرات' : 'إتمام التسجيل'}</Button>
                    </div>
                </form>
            </Modal>

            {/* 5. Detailed HR Profile Modal */}
            <Modal 
                isOpen={!!selectedEmployee} 
                onClose={() => setSelectedEmployee(null)} 
                title={selectedEmployee ? `الملف الكامل للموظف: ${selectedEmployee.fullNameAr}` : ''}
                size="xl"
            >
                {selectedEmployee && (
                    <div className="flex flex-col h-full max-h-[85vh]">
                        {/* Hero Section */}
                        <div className="shrink-0 p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-[3rem] mb-6 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[120%] bg-white rounded-full blur-[120px]"></div>
                                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[120%] bg-indigo-500 rounded-full blur-[120px]"></div>
                            </div>

                            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-right">
                                <div className="relative group mx-auto md:mx-0">
                                    <img 
                                        src={selectedEmployee.photoUrl || `https://ui-avatars.com/api/?name=${selectedEmployee.fullNameAr}&background=random`} 
                                        className="w-44 h-44 rounded-[2.5rem] border-4 border-white/20 shadow-2xl object-cover"
                                    />
                                    <button className="absolute bottom-2 right-2 p-3 rounded-2xl bg-white text-indigo-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        <CloudArrowUpIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4 mb-3">
                                        <h2 className="text-4xl font-black tracking-tight">{selectedEmployee.fullNameAr}</h2>
                                        <EmployeeStatusBadge status={selectedEmployee.status} />
                                    </div>
                                    <p className="text-indigo-200 text-lg font-medium mb-6 uppercase tracking-widest">{selectedEmployee.jobTitle} • {selectedEmployee.department}</p>
                                    
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                        <HeroStat icon={<IdentificationIcon className="w-5 h-5"/>} label="رقم الموظف" value={selectedEmployee.employeeId} />
                                        <HeroStat icon={<CalendarDaysIcon className="w-5 h-5"/>} label="تاريخ الانضمام" value={selectedEmployee.joiningDate} />
                                        <HeroStat icon={<MapPinIcon className="w-5 h-5"/>} label="الفرع" value={selectedEmployee.branch || 'الرئيسي'} />
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mt-6 md:mt-0 md:self-center">
                                    <Button variant="outline" className="h-12 border-white/20 text-white hover:bg-white/10 rounded-2xl border-2" leftIcon={<PrinterIcon className="w-5"/>}>طباعة الملف</Button>
                                    <Button className="h-12 bg-white text-indigo-900 hover:bg-indigo-50 rounded-2xl font-black px-6 border-none" onClick={() => handleOpenForm(selectedEmployee)}>تعديل البيانات</Button>
                                </div>
                            </div>
                        </div>

                        {/* Horizontal Scrollable Tabs */}
                        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none px-4 bg-slate-50/50 border-y border-slate-100">
                            <TabBtn id="profile" icon={<UserCircleIcon/>} label="البيانات الأساسية" active={activeDetailTab === 'profile'} onClick={() => setActiveDetailTab('profile')} />
                            <TabBtn id="contract" icon={<BriefcaseIcon/>} label="العقد الوظيفي" active={activeDetailTab === 'contract'} onClick={() => setActiveDetailTab('contract')} />
                            <TabBtn id="payroll" icon={<BanknotesIcon/>} label="الراتب والبدلات" active={activeDetailTab === 'payroll'} onClick={() => setActiveDetailTab('payroll')} />
                            <TabBtn id="leaves" icon={<CalendarDaysIcon/>} label="الإجازات" active={activeDetailTab === 'leaves'} onClick={() => setActiveDetailTab('leaves')} />
                            <TabBtn id="attendance" icon={<ClockIcon/>} label="الحضور والدوام" active={activeDetailTab === 'attendance'} onClick={() => setActiveDetailTab('attendance')} />
                            <TabBtn id="docs" icon={<FolderIcon/>} label="المستندات" active={activeDetailTab === 'docs'} onClick={() => setActiveDetailTab('docs')} />
                            <TabBtn id="evaluations" icon={<AcademicCapIcon/>} label="التقييمات" active={activeDetailTab === 'evaluations'} onClick={() => setActiveDetailTab('evaluations')} />
                            <TabBtn id="alerts" icon={<BellIcon/>} label="التنبيهات" active={activeDetailTab === 'alerts'} onClick={() => setActiveDetailTab('alerts')} />
                            <TabBtn id="history" icon={<HistoryIcon/>} label="السجل الوظيفي" active={activeDetailTab === 'history'} onClick={() => setActiveDetailTab('history')} />
                            <TabBtn id="notes" icon={<PencilIcon/>} label="الملاحظات" active={activeDetailTab === 'notes'} onClick={() => setActiveDetailTab('notes')} />
                            <TabBtn id="changelog" icon={<ArrowPathIcon/>} label="سجل التعديلات" active={activeDetailTab === 'changelog'} onClick={() => setActiveDetailTab('changelog')} />
                        </div>

                        {/* Detail Content Area */}
                        <div className="flex-1 overflow-y-auto min-h-0 pt-4 px-2">
                             {activeDetailTab === 'profile' && <DetailsTabProfile emp={selectedEmployee} />}
                             {activeDetailTab === 'contract' && <DetailsTabContract emp={selectedEmployee} />}
                             {activeDetailTab === 'payroll' && <DetailsTabPayroll emp={selectedEmployee} />}
                             {activeDetailTab === 'leaves' && <DetailsTabLeaves emp={selectedEmployee} />}
                             {activeDetailTab === 'attendance' && <DetailsTabAttendance emp={selectedEmployee} />}
                             {activeDetailTab === 'docs' && <DetailsTabDocs emp={selectedEmployee} />}
                             {activeDetailTab === 'evaluations' && <DetailsTabReports emp={selectedEmployee} />}
                             {activeDetailTab === 'alerts' && <DetailsTabAlerts emp={selectedEmployee} />}
                             {activeDetailTab === 'history' && <DetailsTabHistory emp={selectedEmployee} />}
                             {activeDetailTab === 'notes' && <DetailsTabNotes emp={selectedEmployee} />}
                             {activeDetailTab === 'changelog' && <DetailsTabChangeLog emp={selectedEmployee} />}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeProfilePage;
