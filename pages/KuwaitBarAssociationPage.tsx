import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { Badge, KBALawyerEnrollmentStatusBadge, KBASeminarStatusBadge, KBARegistrationStatusBadge } from '../components/ui/Badge'; 
import { 
    GavelIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, CalendarDaysIcon, DocumentTextIcon, BellAlertIcon, CheckCircleIcon,
    CurrencyDollarIcon, BriefcaseIcon, BookOpenIcon, UserGroupIcon, MagnifyingGlassIcon,
    ArrowDownTrayIcon, ShareIcon, SparklesIcon, ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon,
    BuildingLibraryIcon, IdentificationIcon, ArrowPathIcon, ClipboardDocumentListIcon,
    HistoryIcon, UserTieIcon
} from '../constants'; 
import { 
    KBALawyerEnrollment, KBALawyerEnrollmentStatus, KBAPublication, KBAPublicationType, 
    KBASeminar, KBASeminarStatus, KBASeminarRegistrationStatus, KBAAlert, Employee,
    KBAProBonoAssignment, KBAProBonoStatus, KBAMembershipFee
} from '../types';
import { 
    kbaLawyerEnrollmentStatusOptions, kbaPublicationTypeOptions, kbaSeminarStatusOptions, 
    kbaSeminarRegistrationStatusOptions, kbaMembershipTypeOptions, kbaProBonoStatusOptions 
} from '../constants';
import { initialEmployees } from './EmployeeProfilePage'; 

type TabKey = 'enrollments' | 'publications' | 'seminars' | 'probono' | 'fees' | 'alerts' | 'integration';

const mockKBAProBonoAssignments: KBAProBonoAssignment[] = [
    { id: 'pb-1', lawyerId: 'emp-001', lawyerName: 'أحمد محمود مبارك', caseNumber: 'PRO-2024-001', clientName: 'أسرة متعففة (أ)', courtName: 'محكمة الأسرة - الأحمدي', assignmentDate: '2024-06-01', status: KBAProBonoStatus.ACTIVE, notes: 'قضية نفقة وحضانة.', createdAt: '2024-06-01' },
    { id: 'pb-2', lawyerId: 'emp-002', lawyerName: 'فاطمة علي حسين', caseNumber: 'PRO-2024-002', clientName: 'عامل متضرر (ب)', courtName: 'المحكمة الكلية - الدائرة العمالية', assignmentDate: '2024-05-15', completionDate: '2024-07-20', status: KBAProBonoStatus.COMPLETED, notes: 'تم استرداد المستحقات العمالية كاملة.', createdAt: '2024-05-15' },
];

const mockKBAMembershipFees: KBAMembershipFee[] = [
    { id: 'fee-1', employeeId: 'emp-001', employeeName: 'أحمد محمود مبارك', year: 2024, amount: 50, dueDate: '2024-01-31', paymentDate: '2024-01-15', receiptNumber: 'REC-KBA-1001', isPaid: true, createdAt: '2024-01-15' },
    { id: 'fee-2', employeeId: 'emp-002', employeeName: 'فاطمة علي حسين', year: 2024, amount: 50, dueDate: '2024-01-31', isPaid: false, notes: 'بانتظار سداد المكتب.', createdAt: '2024-01-15' },
];

// Mock Data
const mockKBALawyerEnrollments: KBALawyerEnrollment[] = [
    { id: 'kba-enroll-1', employeeId: 'emp-001', lawyerName: 'أحمد محمود مبارك الأنصاري', kbaEnrollmentId: '12345', enrollmentDate: '2015-01-10', lastRenewalDate: '2024-01-05', expiryDate: '2025-01-09', status: KBALawyerEnrollmentStatus.ACTIVE, membershipType: 'مقبول أمام التمييز والدستورية', notes: 'عضوية فعالة، تم إرفاق صورة البطاقة الجديدة.', kbaCardCopyUrl:"#", createdAt: '2015-01-10', updatedAt: '2024-01-05'},
    { id: 'kba-enroll-2', employeeId: 'emp-002', lawyerName: 'فاطمة علي حسين السيد', kbaEnrollmentId: '67890', enrollmentDate: '2019-06-20', lastRenewalDate: '2023-06-15', expiryDate: '2024-06-19', status: KBALawyerEnrollmentStatus.EXPIRED, membershipType: 'محام جدول (ب) - مشتغلون', notes: 'تحتاج إلى تجديد عاجل.', createdAt: '2019-06-20', updatedAt: '2023-06-15'},
];

const mockKBAPublications: KBAPublication[] = [
    { id: 'kba-pub-1', title: 'تعميم رقم (5/2024) بشأن رسوم تجديد الاشتراك السنوي', type: KBAPublicationType.CIRCULAR, documentNumber: '5/2024', publishDate: '2024-07-15', summary: 'يوضح التعميم الرسوم الجديدة لتجديد الاشتراك السنوي لأعضاء الجمعية لعام 2025، وآلية السداد الإلكتروني.', filePathOrLink: '#sample-circular.pdf', tags:['رسوم', 'تجديد', '2025'], createdAt: '2024-07-15' },
    { id: 'kba-pub-2', title: 'تحديث لائحة تنظيم مهنة المحاماة - تعديلات مادة (15)', type: KBAPublicationType.REGULATION_UPDATE, publishDate: '2024-06-01', summary: 'تعديلات على المادة 15 من لائحة تنظيم المهنة المتعلقة بشروط القيد أمام محكمة الاستئناف.', filePathOrLink: '#regulation-update.pdf', tags:['لائحة', 'تعديل', 'قيد'], createdAt: '2024-06-01' },
];

const mockKBASeminars: KBASeminar[] = [
    { id: 'kba-sem-1', title: 'التحكيم التجاري الدولي: التحديات والآفاق', startDate: '2024-09-10', endDate: '2024-09-12', time: '09:00 - 14:00', location: 'مقر جمعية المحامين - قاعة المؤتمرات', organizer: 'لجنة التحكيم بالجمعية', status: KBASeminarStatus.UPCOMING, accreditedHours: 15, registrationLink: '#seminar-reg-1', topics: ['أساسيات التحكيم', 'صياغة شرط التحكيم', 'إجراءات التحكيم الدولي'], speakers: ['د. أحمد الفلاني', 'أ. سارة العيسى'], employeeAttendance: [{employeeId: 'emp-001', employeeName: 'أحمد محمود مبارك', registrationStatus: KBASeminarRegistrationStatus.REGISTERED}], createdAt: '2024-07-20'},
    { id: 'kba-sem-2', title: 'ورشة عمل: الجرائم الإلكترونية وأساليب الإثبات الحديثة', startDate: '2024-05-20', endDate: '2024-05-21', location: 'فندق كراون بلازا', status: KBASeminarStatus.COMPLETED, accreditedHours: 10, employeeAttendance: [{employeeId: 'emp-002', employeeName: 'فاطمة علي حسين السيد', registrationStatus: KBASeminarRegistrationStatus.ATTENDED, attendanceCertificateUrl: '#cert-sem-2.pdf'}], createdAt: '2024-04-15'},
];

const mockKBAAlerts: KBAAlert[] = [
    { id: 'alert1', title: 'انتهاء قيد المحامي أحمد محمود', message: 'قيد المحامي أحمد محمود (رقم 12345) سينتهي بتاريخ 2025-01-09. يرجى اتخاذ إجراءات التجديد.', type: 'ENROLLMENT_EXPIRY', relatedEntityId: 'kba-enroll-1', date: '2024-11-09', isRead: false },
    { id: 'alert2', title: 'تذكير بندوة التحكيم التجاري', message: 'ندوة "التحكيم التجاري الدولي" ستبدأ بتاريخ 2024-09-10. تأكد من تسجيل الحضور للمحامين المسجلين.', type: 'SEMINAR_REMINDER', relatedEntityId: 'kba-sem-1', date: '2024-09-01', isRead: false },
    { id: 'alert3', title: 'صدور تعميم جديد من الجمعية', message: 'تم إصدار "تعميم رقم (5/2024) بشأن رسوم تجديد الاشتراك السنوي". يرجى الاطلاع.', type: 'NEW_PUBLICATION', relatedEntityId: 'kba-pub-1', date: '2024-07-15', isRead: true },
];

const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('ar-EG') : '-';

const StatCard = ({ label, value, icon: Icon, color, pulse }: { label: string, value: string | number, icon: any, color: 'blue' | 'yellow' | 'green' | 'red', pulse?: boolean }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
        <Card className={`relative overflow-hidden border ${colors[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-2xl font-black mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-white/50 border border-white ${pulse ? 'animate-pulse' : ''}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className={`absolute -right-2 -bottom-2 opacity-5`}>
                <Icon className="w-16 h-16" />
            </div>
        </Card>
    );
};

const KuwaitBarAssociationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('enrollments');
  
  // States for each section
  const [enrollments, setEnrollments] = useState<KBALawyerEnrollment[]>(mockKBALawyerEnrollments);
  const [publications, setPublications] = useState<KBAPublication[]>(mockKBAPublications);
  const [seminars, setSeminars] = useState<KBASeminar[]>(mockKBASeminars);
  const [probonos, setProbonos] = useState<KBAProBonoAssignment[]>(mockKBAProBonoAssignments);
  const [fees, setFees] = useState<KBAMembershipFee[]>(mockKBAMembershipFees);
  const [alerts, setAlerts] = useState<KBAAlert[]>(mockKBAAlerts);

  // Modals state
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Partial<KBALawyerEnrollment> | null>(null);
  
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Partial<KBAPublication> | null>(null);

  const [isSeminarModalOpen, setIsSeminarModalOpen] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState<Partial<KBASeminar> | null>(null);

  const [isProbonoModalOpen, setIsProbonoModalOpen] = useState(false);
  const [editingProbono, setEditingProbono] = useState<Partial<KBAProBonoAssignment> | null>(null);

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Partial<KBAMembershipFee> | null>(null);
  
  const [viewingItem, setViewingItem] = useState<any>(null);
  
  const employeeOptions = useMemo(() => initialEmployees.map(emp => ({value: emp.id, label: emp.fullNameAr})), []);

  const stats = useMemo(() => {
    return {
        totalLawyers: enrollments.filter(e => e.status === KBALawyerEnrollmentStatus.ACTIVE).length,
        pendingRenewals: enrollments.filter(e => e.status === KBALawyerEnrollmentStatus.EXPIRED || e.status === KBALawyerEnrollmentStatus.UNDER_REVIEW).length,
        unpaidFees: fees.filter(f => !f.isPaid).length,
        activeProBono: probonos.filter(p => p.status === KBAProBonoStatus.ACTIVE).length,
    };
  }, [enrollments, fees, probonos]);

  // Generic CRUD handlers
  const handleAdd = (type: TabKey) => {
    if (type === 'enrollments') { setEditingEnrollment(null); setIsEnrollmentModalOpen(true); }
    else if (type === 'publications') { setEditingPublication(null); setIsPublicationModalOpen(true); }
    else if (type === 'seminars') { setEditingSeminar(null); setIsSeminarModalOpen(true); }
    else if (type === 'probono') { setEditingProbono(null); setIsProbonoModalOpen(true); }
    else if (type === 'fees') { setEditingFee(null); setIsFeeModalOpen(true); }
  };
  const handleEdit = (item: any, type: TabKey) => {
    if (type === 'enrollments') { setEditingEnrollment(item); setIsEnrollmentModalOpen(true); }
    else if (type === 'publications') { setEditingPublication(item); setIsPublicationModalOpen(true); }
    else if (type === 'seminars') { setEditingSeminar(item); setIsSeminarModalOpen(true); }
    else if (type === 'probono') { setEditingProbono(item); setIsProbonoModalOpen(true); }
    else if (type === 'fees') { setEditingFee(item); setIsFeeModalOpen(true); }
  };
  const handleDelete = (id: string, type: TabKey) => {
    if(window.confirm('هل أنت متأكد أنك تريد حذف هذا السجل؟')) {
        if (type === 'enrollments') setEnrollments(prev => prev.filter(e => e.id !== id));
        else if (type === 'publications') setPublications(prev => prev.filter(p => p.id !== id));
        else if (type === 'seminars') setSeminars(prev => prev.filter(s => s.id !== id));
    }
  };
  const handleView = (item: any) => setViewingItem(item);

  // Tabs Definition
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'enrollments', label: 'قيد المحامين', icon: <GavelIcon className="w-5 h-5 me-2" /> },
    { key: 'fees', label: 'اشتراكات الجمعية', icon: <CurrencyDollarIcon className="w-5 h-5 me-2" /> },
    { key: 'probono', label: 'الإنابات والمعونة', icon: <UserGroupIcon className="w-5 h-5 me-2" /> },
    { key: 'seminars', label: 'الندوات والدورات', icon: <BookOpenIcon className="w-5 h-5 me-2" /> },
    { key: 'publications', label: 'الإصدارات', icon: <DocumentTextIcon className="w-5 h-5 me-2" /> },
    { key: 'alerts', label: 'التنبيهات', icon: <BellAlertIcon className="w-5 h-5 me-2" /> },
    { key: 'integration', label: 'الربط (API)', icon: <ArrowPathIcon className="w-5 h-5 me-2" /> },
  ];

  const renderEnrollmentsTab = () => (
    <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}>
        <Card title="سجلات قيد المحامين لدى الجمعية" icon={<IdentificationIcon className="w-5 h-5 text-primary"/>}>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full md:w-64">
                <Input placeholder="بحث برقم القيد..." className="pr-9" />
                <MagnifyingGlassIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Button onClick={() => handleAdd('enrollments')} leftIcon={<PlusCircleIcon className="w-5" />}>إضافة قيد جديد</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 uppercase tracking-wider text-xs font-semibold text-gray-500">
                <tr>{['اسم المحامي', 'رقم القيد', 'نوع الجدول', 'تاريخ الانتهاء', 'الحالة', 'إجراءات'].map(h => <th key={h} className="px-4 py-3 text-right">{h}</th>)}</tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {enrollments.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3 font-bold text-gray-900">{e.lawyerName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.kbaEnrollmentId}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{e.membershipType}</td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs">
                            <CalendarDaysIcon className="w-3 h-3 text-gray-400" />
                            {formatDate(e.expiryDate)}
                        </div>
                    </td>
                    <td className="px-4 py-3"><KBALawyerEnrollmentStatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(e)} className="h-8 w-8 !p-0"><EyeIcon className="w-4 text-primary"/></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(e, 'enrollments')} className="h-8 w-8 !p-0"><PencilIcon className="w-4 text-yellow-600"/></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id, 'enrollments')} className="h-8 w-8 !p-0 text-danger"><TrashIcon className="w-4"/></Button>
                        </div>
                    </td>
                </tr>
                ))}
                {enrollments.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-500">لا توجد سجلات قيد.</td></tr>}
            </tbody>
            </table>
        </div>
        </Card>
    </motion.div>
  );

  const renderFeesTab = () => (
    <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}>
        <Card title="إدارة رسوم الاشتراك السنوي" icon={<CurrencyDollarIcon className="w-5 h-5 text-primary"/>}>
            <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex gap-2 w-full md:w-auto">
                    <Select options={[{value: '2024', label: '2024'}, {value: '2023', label: '2023'}]} containerClassName="mb-0 w-32" />
                    <Select options={[{value: '', label: 'كل الحالات'}, {value: 'paid', label: 'مدفوع'}, {value: 'unpaid', label: 'غير مدفوع'}]} containerClassName="mb-0 w-40" />
                </div>
                <Button onClick={() => handleAdd('fees')} leftIcon={<PlusCircleIcon className="w-5" />}>تسجيل دفع جديد</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 uppercase tracking-wider text-xs font-semibold text-gray-500">
                        <tr>{['المحامي', 'السنة', 'المبلغ', 'آخر موعد', 'تاريخ الدفع', 'الحالة', 'إجراءات'].map(h => <th key={h} className="px-4 py-3 text-right">{h}</th>)}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {fees.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-bold">{f.employeeName}</td>
                                <td className="px-4 py-3">{f.year}</td>
                                <td className="px-4 py-3 font-mono font-bold text-primary">{f.amount} د.ك</td>
                                <td className="px-4 py-3 text-xs">{formatDate(f.dueDate)}</td>
                                <td className="px-4 py-3 text-xs">{f.paymentDate ? formatDate(f.paymentDate) : '--'}</td>
                                <td className="px-4 py-3">
                                    {f.isPaid ? 
                                        <Badge text="تم الدفع" variant="success" /> : 
                                        <Badge text="مطلوب السداد" variant="danger" />
                                    }
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(f, 'fees')}><PencilIcon className="w-4 text-yellow-600"/></Button>
                                        <Button variant="ghost" size="sm" className="text-gray-400"><ArrowDownTrayIcon className="w-4"/></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </motion.div>
  );

  const renderProBonoTab = () => (
    <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}>
        <Card title="إنابات المعونة القضائية والتمثيل المجاني" icon={<UserGroupIcon className="w-5 h-5 text-primary"/>}>
            <div className="mb-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">متابعة قضايا المعونة القضائية المسندة للمكتب من الجمعية</p>
                <Button onClick={() => handleAdd('probono')} leftIcon={<PlusCircleIcon className="w-5" />}>إضافة إنابة معونة</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {probonos.map(pb => (
                    <Card key={pb.id} className="border-s-4 border-s-primary hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{pb.caseNumber}</span>
                            <Badge text={pb.status} variant={pb.status === KBAProBonoStatus.COMPLETED ? 'success' : 'warning'} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{pb.clientName}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                            <BuildingLibraryIcon className="w-3 h-3" />
                            {pb.courtName}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                    {pb.lawyerName.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold">{pb.lawyerName}</span>
                             </div>
                             <Button variant="ghost" size="sm" onClick={() => handleEdit(pb, 'probono')} className="text-gray-400 hover:text-primary"><PencilIcon className="w-4"/></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    </motion.div>
  );
  
  const renderPublicationsTab = () => (
     <Card title="الإصدارات الرسمية من جمعية المحامين">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleAdd('publications')} leftIcon={<PlusCircleIcon className="w-5" />}>إضافة إصدار جديد</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>{['العنوان', 'النوع', 'رقم المستند', 'تاريخ النشر', 'إجراءات'].map(h => <th key={h} className="px-3 py-2 text-right">{h}</th>)}</tr>
          </thead>
          <tbody>
            {publications.map(p => (
              <tr key={p.id}>
                <td className="px-3 py-2 max-w-xs truncate" title={p.title}>{p.title}</td>
                <td className="px-3 py-2">{p.type}</td>
                <td className="px-3 py-2">{p.documentNumber || '-'}</td>
                <td className="px-3 py-2">{formatDate(p.publishDate)}</td>
                <td className="px-3 py-2 space-x-1 space-x-reverse">
                   <Button variant="ghost" size="sm" onClick={() => handleView(p)}><EyeIcon className="w-4 text-primary"/></Button>
                   <Button variant="ghost" size="sm" onClick={() => handleEdit(p, 'publications')}><PencilIcon className="w-4 text-yellow-600"/></Button>
                   <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id, 'publications')} className="text-danger"><TrashIcon className="w-4"/></Button>
                </td>
              </tr>
            ))}
            {publications.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-500">لا توجد إصدارات.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
  
  const renderSeminarsTab = () => (
    <Card title="الندوات والدورات التدريبية المعتمدة">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleAdd('seminars')} leftIcon={<PlusCircleIcon className="w-5" />}>إضافة ندوة/دورة</Button>
      </div>
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>{['عنوان الندوة/الدورة', 'تاريخ البدء', 'الموقع', 'الحالة', 'الساعات المعتمدة', 'إجراءات'].map(h => <th key={h} className="px-3 py-2 text-right">{h}</th>)}</tr>
          </thead>
          <tbody>
            {seminars.map(s => (
              <tr key={s.id}>
                <td className="px-3 py-2 max-w-xs truncate" title={s.title}>{s.title}</td>
                <td className="px-3 py-2">{formatDate(s.startDate)}</td>
                <td className="px-3 py-2">{s.location}</td>
                <td className="px-3 py-2"><KBASeminarStatusBadge status={s.status}/></td>
                <td className="px-3 py-2">{s.accreditedHours || '-'}</td>
                <td className="px-3 py-2 space-x-1 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => handleView(s)}><EyeIcon className="w-4 text-primary"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(s, 'seminars')}><PencilIcon className="w-4 text-yellow-600"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id, 'seminars')} className="text-danger"><TrashIcon className="w-4"/></Button>
                </td>
              </tr>
            ))}
            {seminars.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-500">لا توجد ندوات أو دورات.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
  
  const renderAlertsTab = () => (
    <Card title="الإشعارات والتنبيهات الهامة من الجمعية">
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={alert.id} 
                className={`p-4 rounded-xl border-s-4 shadow-sm flex gap-4 ${alert.isRead ? 'bg-white border-gray-200' : 'bg-primary/5 border-primary animate-pulse-subtle shadow-primary/10'}`}
            >
              <div className={`p-3 rounded-full flex-shrink-0 ${alert.isRead ? 'bg-gray-100 text-gray-400' : 'bg-white text-primary shadow-sm'}`}>
                {alert.type === 'ENROLLMENT_EXPIRY' ? <ExclamationTriangleIcon className="w-6 h-6" /> : <BellAlertIcon className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${alert.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{alert.title}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">{formatDate(alert.date)}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{alert.message}</p>
                {!alert.isRead && 
                    <Button size="sm" variant="ghost" onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? {...a, isRead: true} : a))} className="h-7 text-[10px] text-primary hover:bg-primary/10">
                        <CheckCircleIcon className="w-3 h-3 me-1"/> تعليم كمقروء
                    </Button>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-gray-200">
                <BellAlertIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-500">لا توجد تنبيهات جديدة</p>
        </div>
      )}
    </Card>
  );

  const renderIntegrationTab = () => (
    <Card title="بوابة الربط الرقمي للهيئات المهنية" icon={<ArrowPathIcon className="w-5 h-5 text-primary"/>}>
      <div className="max-w-4xl">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6 flex gap-5">
            <div className="p-4 bg-white rounded-2xl shadow-sm h-fit">
                <ShieldCheckIcon className="w-10 h-10 text-blue-500"/>
            </div>
            <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">حول الربط المباشر مع جمعية المحامين</h3>
                <p className="text-sm text-blue-800/80 leading-relaxed max-w-2xl">
                    هذا القسم مخصص لإعداد الاتصال المباشر مع قواعد بيانات جمعية المحامين الكويتية لتحديث بيانات القيد والاشتراكات والمؤتمرات بشكل لحظي وتلقائي.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                    المزايا التقنية للربط (قريباً)
                </h4>
                <ul className="space-y-3">
                    {[
                        'تحديث تلقائي لبيانات الجدول فور تغييرها بالجمعية.',
                        'سداد الرسوم السنوية إلكترونياً من خلال المكتب.',
                        'استلام التعاميم فور نشرها على بوابة الجمعية.',
                        'تسجيل المحامين في الدورات التدريبية بضغطة زر.'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <Card className="bg-gray-50 border-dashed border-2 flex flex-col items-center justify-center py-8">
                <IdentificationIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500 mb-2">بانتظار تفعيل الخدمة من الجمعية</p>
                <p className="text-[10px] text-gray-400 text-center px-6">
                    نحن على تواصل مستمر مع الفريق التقني بالجمعية لتفعيل واجهات برمجة التطبيقات (APIs) لجميع المكاتب القانونية في الكويت.
                </p>
            </Card>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div className="flex items-center gap-3">
                <GavelIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">شؤون جمعية المحامين الكويتية</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">إدارة بيانات القيد، الاشتراكات، والنشاط الأكاديمي والمهني</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowDownTrayIcon className="w-4" />}>تصدير تقرير</Button>
            <Button variant="outline" leftIcon={<ShareIcon className="w-4" />}>مشاركة</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="محامين مقيدين" value={stats.totalLawyers} icon={UserTieIcon} color="blue" />
          <StatCard label="تجديدات مطلوبة" value={stats.pendingRenewals} icon={ClockIcon} color="yellow" pulse={stats.pendingRenewals > 0} />
          <StatCard label="رسوم غير مسددة" value={stats.unpaidFees} icon={CurrencyDollarIcon} color="red" />
          <StatCard label="معونة قضائية" value={stats.activeProBono} icon={BriefcaseIcon} color="green" />
      </div>
      
      <div className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10 pt-2 transition-all">
        <nav className="flex space-x-2 space-x-reverse overflow-x-auto no-scrollbar py-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`whitespace-nowrap py-2 px-5 rounded-full font-bold text-sm transition-all duration-300 flex items-center
                ${activeTab === tab.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
          {activeTab === 'enrollments' && renderEnrollmentsTab()}
          {activeTab === 'publications' && renderPublicationsTab()}
          {activeTab === 'seminars' && renderSeminarsTab()}
          {activeTab === 'probono' && renderProBonoTab()}
          {activeTab === 'fees' && renderFeesTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'integration' && renderIntegrationTab()}
      </AnimatePresence>

      {/* --- Enrollment Modal --- */}
      {isEnrollmentModalOpen && (
        <Modal isOpen={isEnrollmentModalOpen} onClose={() => setIsEnrollmentModalOpen(false)} title={editingEnrollment?.id ? "تعديل بيانات القيد" : "إضافة قيد جديد"} size="lg">
            <form className="space-y-4 p-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="اسم المحامي (*)" name="employeeId" value={editingEnrollment?.employeeId || ''} options={[{value: '', label: 'اختر محامي'}, ...employeeOptions]} onChange={(e) => setEditingEnrollment(prev => ({...prev, employeeId: e.target.value, lawyerName: employeeOptions.find(emp=>emp.value === e.target.value)?.label || ''}))} required />
                    <Input label="رقم القيد بالجمعية (*)" name="kbaEnrollmentId" value={editingEnrollment?.kbaEnrollmentId || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, kbaEnrollmentId: e.target.value}))} required />
                </div>
                <Select label="نوع الجدول / العضوية" name="membershipType" value={editingEnrollment?.membershipType || ''} options={kbaMembershipTypeOptions} onChange={(e) => setEditingEnrollment(prev => ({...prev, membershipType: e.target.value}))} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="تاريخ أول قيد" name="enrollmentDate" type="date" value={editingEnrollment?.enrollmentDate || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, enrollmentDate: e.target.value}))} />
                    <Input label="تاريخ آخر تجديد" name="lastRenewalDate" type="date" value={editingEnrollment?.lastRenewalDate || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, lastRenewalDate: e.target.value}))} />
                    <Input label="تاريخ انتهاء القيد" name="expiryDate" type="date" value={editingEnrollment?.expiryDate || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, expiryDate: e.target.value}))} />
                </div>
                <Select label="حالة القيد الحالية" name="status" value={editingEnrollment?.status || KBALawyerEnrollmentStatus.ACTIVE} options={kbaLawyerEnrollmentStatusOptions} onChange={(e) => setEditingEnrollment(prev => ({...prev, status: e.target.value as KBALawyerEnrollmentStatus}))} />
                <TextArea label="ملاحظات إضافية" name="notes" value={editingEnrollment?.notes || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, notes: e.target.value}))} rows={3}/>
                <Input label="رابط نسخة البطاقة الممغنطة" name="kbaCardCopyUrl" placeholder="https://" value={editingEnrollment?.kbaCardCopyUrl || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, kbaCardCopyUrl: e.target.value}))}/>
                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                    <Button variant="outline" onClick={()=> setIsEnrollmentModalOpen(false)}>إلغاء</Button>
                    <Button onClick={() => {
                        const submitted = {
                            ...editingEnrollment,
                            id: editingEnrollment?.id || `kba-enroll-${Date.now()}`,
                            createdAt: editingEnrollment?.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        } as KBALawyerEnrollment;
                        if(editingEnrollment?.id) setEnrollments(prev => prev.map(e => e.id === submitted.id ? submitted : e));
                        else setEnrollments(prev => [submitted, ...prev]);
                        setIsEnrollmentModalOpen(false);
                    }}>حفظ البيانات</Button>
                </div>
            </form>
        </Modal>
      )}

      {/* --- Pro-Bono Modal --- */}
      {isProbonoModalOpen && (
        <Modal isOpen={isProbonoModalOpen} onClose={() => setIsProbonoModalOpen(false)} title={editingProbono?.id ? "تعديل إنابة المعونة" : "تسجيل إنابة معونة قضائية"} size="lg">
            <form className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="المحامي المناب" name="lawyerId" value={editingProbono?.lawyerId || ''} options={[{value: '', label: 'اختر محامي'}, ...employeeOptions]} onChange={(e) => setEditingProbono(prev => ({...prev, lawyerId: e.target.value, lawyerName: employeeOptions.find(emp=>emp.value === e.target.value)?.label || ''}))} />
                    <Input label="رقم قضية المعونة" name="caseNumber" value={editingProbono?.caseNumber || ''} onChange={(e) => setEditingProbono(prev => ({...prev, caseNumber: e.target.value}))} />
                </div>
                <Input label="اسم الموكل (المستحق للمعونة)" name="clientName" value={editingProbono?.clientName || ''} onChange={(e) => setEditingProbono(prev => ({...prev, clientName: e.target.value}))} />
                <Input label="المحكمة المعنية" name="courtName" value={editingProbono?.courtName || ''} onChange={(e) => setEditingProbono(prev => ({...prev, courtName: e.target.value}))} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="تاريخ الإنابة" type="date" name="assignmentDate" value={editingProbono?.assignmentDate || ''} onChange={(e) => setEditingProbono(prev => ({...prev, assignmentDate: e.target.value}))} />
                    <Select label="الحالة" options={kbaProBonoStatusOptions} value={editingProbono?.status || KBAProBonoStatus.ACTIVE} onChange={(e) => setEditingProbono(prev => ({...prev, status: e.target.value as KBAProBonoStatus}))} />
                </div>
                <TextArea label="ملاحظات" value={editingProbono?.notes || ''} onChange={(e) => setEditingProbono(prev => ({...prev, notes: e.target.value}))} />
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={()=> setIsProbonoModalOpen(false)}>إلغاء</Button>
                    <Button onClick={() => {
                        const submitted = {
                            ...editingProbono,
                            id: editingProbono?.id || `pb-${Date.now()}`,
                            status: editingProbono?.status || KBAProBonoStatus.ACTIVE,
                            createdAt: new Date().toISOString()
                        } as KBAProBonoAssignment;
                        if(editingProbono?.id) setProbonos(prev => prev.map(p => p.id === submitted.id ? submitted : p));
                        else setProbonos(prev => [submitted, ...prev]);
                        setIsProbonoModalOpen(false);
                    }}>حفظ الإنابة</Button>
                </div>
            </form>
        </Modal>
      )}

      {/* --- Fee Modal --- */}
      {isFeeModalOpen && (
        <Modal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} title="تسجيل رسوم اشتراك" size="md">
            <form className="space-y-4 p-4">
                <Select label="المحامي" value={editingFee?.employeeId || ''} options={employeeOptions} onChange={(e) => setEditingFee(prev => ({...prev, employeeId: e.target.value, employeeName: employeeOptions.find(emp=>emp.value === e.target.value)?.label || ''}))} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="السنة" type="number" value={editingFee?.year || 2024} onChange={(e) => setEditingFee(prev => ({...prev, year: parseInt(e.target.value)}))} />
                    <Input label="المبلغ (د.ك)" type="number" value={editingFee?.amount || 50} onChange={(e) => setEditingFee(prev => ({...prev, amount: parseInt(e.target.value)}))} />
                </div>
                <Input label="تاريخ الاستحقاق" type="date" value={editingFee?.dueDate || ''} onChange={(e) => setEditingFee(prev => ({...prev, dueDate: e.target.value}))} />
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <input type="checkbox" checked={editingFee?.isPaid || false} onChange={(e) => setEditingFee(prev => ({...prev, isPaid: e.target.checked}))} id="isPaid" className="w-4 h-4 text-primary rounded" />
                    <label htmlFor="isPaid" className="text-sm font-bold text-gray-700">تم السداد؟</label>
                </div>
                {editingFee?.isPaid && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <Input label="تاريخ الدفع" type="date" value={editingFee?.paymentDate || ''} onChange={(e) => setEditingFee(prev => ({...prev, paymentDate: e.target.value}))} />
                        <Input label="رقم الإيصال" value={editingFee?.receiptNumber || ''} onChange={(e) => setEditingFee(prev => ({...prev, receiptNumber: e.target.value}))} />
                   </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={()=> setIsFeeModalOpen(false)}>إلغاء</Button>
                    <Button onClick={() => {
                        const submitted = { ...editingFee, id: editingFee?.id || `fee-${Date.now()}`, createdAt: new Date().toISOString() } as KBAMembershipFee;
                        if(editingFee?.id) setFees(prev => prev.map(f => f.id === submitted.id ? submitted : f));
                        else setFees(prev => [submitted, ...prev]);
                        setIsFeeModalOpen(false);
                    }}>حفظ السجل</Button>
                </div>
            </form>
        </Modal>
      )}

      {/* Viewing Modal (Generic for now) */}
      {viewingItem && (
        <Modal isOpen={!!viewingItem} onClose={() => setViewingItem(null)} title="تفاصيل السجل" size="md">
            <div className="p-4 space-y-4">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <h5 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">المحتوى التقني للسجل</h5>
                    <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-gray-600 bg-white p-3 rounded-xl border border-gray-100 max-h-60 overflow-y-auto ltr">
                        {JSON.stringify(viewingItem, null, 4)}
                    </pre>
                 </div>
                 <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setViewingItem(null)}>إغلاق</Button>
                 </div>
            </div>
        </Modal>
      )}

    </div>
  );
};

export default KuwaitBarAssociationPage;