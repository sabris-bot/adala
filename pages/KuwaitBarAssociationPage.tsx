import React, { useState, useMemo, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { Badge, KBALawyerEnrollmentStatusBadge, KBASeminarStatusBadge, KBARegistrationStatusBadge } from '../components/ui/Badge'; 
import { 
    GavelIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, CalendarDaysIcon, DocumentTextIcon, BellAlertIcon, CheckCircleIcon 
} from '../constants'; 
import { 
    KBALawyerEnrollment, KBALawyerEnrollmentStatus, KBAPublication, KBAPublicationType, 
    KBASeminar, KBASeminarStatus, KBASeminarRegistrationStatus, KBAAlert, Employee 
} from '../types';
import { 
    kbaLawyerEnrollmentStatusOptions, kbaPublicationTypeOptions, kbaSeminarStatusOptions, 
    kbaSeminarRegistrationStatusOptions, kbaMembershipTypeOptions 
} from '../constants';
import { initialEmployees } from './EmployeeProfilePage'; // To link lawyers

type TabKey = 'enrollments' | 'publications' | 'seminars' | 'alerts' | 'integration';

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


const KuwaitBarAssociationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('enrollments');
  
  // States for each section
  const [enrollments, setEnrollments] = useState<KBALawyerEnrollment[]>(mockKBALawyerEnrollments);
  const [publications, setPublications] = useState<KBAPublication[]>(mockKBAPublications);
  const [seminars, setSeminars] = useState<KBASeminar[]>(mockKBASeminars);
  const [alerts, setAlerts] = useState<KBAAlert[]>(mockKBAAlerts);

  // Modals state
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Partial<KBALawyerEnrollment> | null>(null);
  
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Partial<KBAPublication> | null>(null);

  const [isSeminarModalOpen, setIsSeminarModalOpen] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState<Partial<KBASeminar> | null>(null);
  
  const [viewingItem, setViewingItem] = useState<KBALawyerEnrollment | KBAPublication | KBASeminar | null>(null);
  
  const employeeOptions = useMemo(() => initialEmployees.map(emp => ({value: emp.id, label: emp.fullNameAr})), []);

  // Generic CRUD handlers (can be specialized if needed)
  const handleAdd = (type: TabKey) => {
    if (type === 'enrollments') { setEditingEnrollment(null); setIsEnrollmentModalOpen(true); }
    else if (type === 'publications') { setEditingPublication(null); setIsPublicationModalOpen(true); }
    else if (type === 'seminars') { setEditingSeminar(null); setIsSeminarModalOpen(true); }
  };
  const handleEdit = (item: any, type: TabKey) => {
    if (type === 'enrollments') { setEditingEnrollment(item); setIsEnrollmentModalOpen(true); }
    else if (type === 'publications') { setEditingPublication(item); setIsPublicationModalOpen(true); }
    else if (type === 'seminars') { setEditingSeminar(item); setIsSeminarModalOpen(true); }
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
    { key: 'publications', label: 'الإصدارات الرسمية', icon: <DocumentTextIcon className="w-5 h-5 me-2" /> },
    { key: 'seminars', label: 'الندوات والدورات', icon: <CalendarDaysIcon className="w-5 h-5 me-2" /> },
    { key: 'alerts', label: 'الإشعارات والتنبيهات', icon: <BellAlertIcon className="w-5 h-5 me-2" /> },
    { key: 'integration', label: 'الربط الآلي (API)', icon: <InformationCircleIcon className="w-5 h-5 me-2" /> },
  ];

  const renderEnrollmentsTab = () => (
    <Card title="سجلات قيد المحامين بالمكتب لدى الجمعية">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleAdd('enrollments')} leftIcon={<PlusCircleIcon className="w-5" />}>إضافة قيد جديد</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>{['اسم المحامي', 'رقم القيد بالجمعية', 'تاريخ القيد', 'تاريخ الانتهاء', 'الحالة', 'نوع العضوية', 'إجراءات'].map(h => <th key={h} className="px-3 py-2 text-right">{h}</th>)}</tr>
          </thead>
          <tbody>
            {enrollments.map(e => (
              <tr key={e.id}>
                <td className="px-3 py-2">{e.lawyerName}</td>
                <td className="px-3 py-2">{e.kbaEnrollmentId}</td>
                <td className="px-3 py-2">{formatDate(e.enrollmentDate)}</td>
                <td className="px-3 py-2">{formatDate(e.expiryDate)}</td>
                <td className="px-3 py-2"><KBALawyerEnrollmentStatusBadge status={e.status} /></td>
                <td className="px-3 py-2">{e.membershipType}</td>
                <td className="px-3 py-2 space-x-1 space-x-reverse">
                  <Button variant="ghost" size="sm" onClick={() => handleView(e)}><EyeIcon className="w-4 text-primary"/></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(e, 'enrollments')}><PencilIcon className="w-4 text-yellow-600"/></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id, 'enrollments')} className="text-danger"><TrashIcon className="w-4"/></Button>
                </td>
              </tr>
            ))}
             {enrollments.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-gray-500">لا توجد سجلات قيد.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
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
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-3 rounded-md border-s-4 ${alert.isRead ? 'bg-gray-100 border-gray-300' : 'bg-yellow-50 border-yellow-400 animate-pulse'}`}>
              <div className="flex justify-between items-start">
                <h4 className={`font-semibold ${alert.isRead ? 'text-gray-700' : 'text-yellow-800'}`}>{alert.title}</h4>
                <span className="text-xs text-gray-500">{formatDate(alert.date)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              {!alert.isRead && 
                <Button size="sm" variant="ghost" onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? {...a, isRead: true} : a))} className="mt-1 text-xs text-primary">
                    <CheckCircleIcon className="w-3 h-3 me-1"/> تم الاطلاع
                </Button>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-5">لا توجد إشعارات حالية.</p>
      )}
    </Card>
  );

  const renderIntegrationTab = () => (
    <Card title="الربط الآلي (API Integration) مع جمعية المحامين">
      <div className="flex items-start">
        <InformationCircleIcon className="w-8 h-8 text-blue-500 me-4 flex-shrink-0"/>
        <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">حول إمكانية الربط الآلي</h3>
            <p className="text-gray-700 leading-relaxed">
                تهدف هذه الميزة المستقبلية إلى تسهيل عملية تحديث بيانات قيد المحامين والاطلاع على الفعاليات والإصدارات الرسمية من جمعية المحامين الكويتية بشكل مباشر وآلي من خلال النظام.
            </p>
            <p className="text-gray-700 mt-3 leading-relaxed">
                <strong>الحالة الحالية:</strong> في الوقت الحالي، لا توفر جمعية المحامين الكويتية (على حد علمنا حتى تاريخ تطوير هذه النسخة) واجهة برمجة تطبيقات (API) عامة ومتاحة للربط المباشر مع أنظمة المكاتب القانونية.
            </p>
            <p className="text-gray-700 mt-3 leading-relaxed">
                <strong>ماذا يعني هذا؟</strong> هذا يعني أن تحديث بيانات القيد والإصدارات والفعاليات ضمن هذا النظام يتم حاليًا بشكل يدوي من قبل مستخدمي النظام بناءً على المعلومات الصادرة من الجمعية عبر قنواتها الرسمية (الموقع الإلكتروني، التعاميم الورقية/الإلكترونية، إلخ).
            </p>
            <p className="text-gray-700 mt-3 leading-relaxed">
                <strong>الخطط المستقبلية:</strong> في حال قامت جمعية المحامين الكويتية بتوفير واجهة API رسمية، سيتم العمل على دراسة وتطوير إمكانية الربط الآلي معها. هذا سيتيح:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1 ps-4">
                <li>تحديث تلقائي لتواريخ انتهاء القيد وتجديده للمحامين المسجلين.</li>
                <li>جلب تلقائي للتعاميم والإصدارات الجديدة فور نشرها من الجمعية.</li>
                <li>عرض تلقائي لجدول الندوات والدورات المعتمدة مباشرة من مصدرها.</li>
            </ul>
            <p className="text-gray-700 mt-3 leading-relaxed">
                سنقوم بمتابعة أي تطورات في هذا الشأن وسنسعى لتوفير هذه الميزة حالما تصبح ممكنة تقنيًا.
            </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <GavelIcon className="w-8 h-8 text-primary me-3" />
        <h1 className="text-3xl font-bold text-primary-dark">شؤون جمعية المحامين الكويتية</h1>
      </div>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 space-x-reverse overflow-x-auto scrollbar-thin pb-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'enrollments' && renderEnrollmentsTab()}
      {activeTab === 'publications' && renderPublicationsTab()}
      {activeTab === 'seminars' && renderSeminarsTab()}
      {activeTab === 'alerts' && renderAlertsTab()}
      {activeTab === 'integration' && renderIntegrationTab()}

      {/* Modals: TODO - Create specific form components for each type */}
      {isEnrollmentModalOpen && editingEnrollment !== undefined && (
        <Modal isOpen={isEnrollmentModalOpen} onClose={() => setIsEnrollmentModalOpen(false)} title={editingEnrollment?.id ? "تعديل بيانات القيد" : "إضافة قيد جديد"} size="lg">
            <form className="space-y-3 p-2">
                <Select label="المحامي (من ملفات الموظفين)" name="employeeId" value={editingEnrollment?.employeeId || ''} options={employeeOptions} onChange={(e) => setEditingEnrollment(prev => ({...prev, employeeId: e.target.value, lawyerName: employeeOptions.find(emp=>emp.value === e.target.value)?.label || ''}))} required />
                <Input label="رقم القيد بالجمعية" name="kbaEnrollmentId" value={editingEnrollment?.kbaEnrollmentId || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, kbaEnrollmentId: e.target.value}))} required />
                <Select label="نوع العضوية/جدول القيد" name="membershipType" value={editingEnrollment?.membershipType || ''} options={kbaMembershipTypeOptions} onChange={(e) => setEditingEnrollment(prev => ({...prev, membershipType: e.target.value}))} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ أول قيد" name="enrollmentDate" type="date" value={editingEnrollment?.enrollmentDate || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, enrollmentDate: e.target.value}))} />
                    <Input label="تاريخ آخر تجديد" name="lastRenewalDate" type="date" value={editingEnrollment?.lastRenewalDate || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, lastRenewalDate: e.target.value}))} />
                </div>
                <Input label="تاريخ انتهاء القيد الحالي" name="expiryDate" type="date" value={editingEnrollment?.expiryDate || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, expiryDate: e.target.value}))} />
                <Select label="حالة القيد" name="status" value={editingEnrollment?.status || KBALawyerEnrollmentStatus.ACTIVE} options={kbaLawyerEnrollmentStatusOptions} onChange={(e) => setEditingEnrollment(prev => ({...prev, status: e.target.value as KBALawyerEnrollmentStatus}))} />
                <TextArea label="ملاحظات" name="notes" value={editingEnrollment?.notes || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, notes: e.target.value}))} rows={2}/>
                <Input label="رابط صورة بطاقة الجمعية (إن وجد)" name="kbaCardCopyUrl" type="url" value={editingEnrollment?.kbaCardCopyUrl || ''} onChange={(e) => setEditingEnrollment(prev => ({...prev, kbaCardCopyUrl: e.target.value}))}/>
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={()=> setIsEnrollmentModalOpen(false)}>إلغاء</Button>
                    <Button type="button" onClick={() => {
                        const submittedEnrollment = {
                            ...editingEnrollment,
                            id: editingEnrollment?.id || `kba-enroll-${Date.now()}`,
                            createdAt: editingEnrollment?.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        } as KBALawyerEnrollment;
                        if(editingEnrollment?.id) {
                            setEnrollments(prev => prev.map(e => e.id === submittedEnrollment.id ? submittedEnrollment : e));
                        } else {
                            setEnrollments(prev => [submittedEnrollment, ...prev]);
                        }
                        setIsEnrollmentModalOpen(false);
                    }}>حفظ</Button>
                </div>
            </form>
        </Modal>
      )}
      {/* TODO: Add modals for Publications and Seminars */}

      {/* Viewing Modal (Generic for now) */}
      {viewingItem && (
        <Modal isOpen={!!viewingItem} onClose={() => setViewingItem(null)} title="تفاصيل السجل" size="md">
          <pre className="text-xs whitespace-pre-wrap p-2 bg-gray-100 rounded max-h-60 overflow-y-auto">{JSON.stringify(viewingItem, null, 2)}</pre>
        </Modal>
      )}

    </div>
  );
};

export default KuwaitBarAssociationPage;