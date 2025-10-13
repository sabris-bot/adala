import React, { useState, useMemo, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { 
    BellAlertIcon, InformationCircleIcon, EnvelopeIcon, CogIcon, CalendarDaysIcon, UserGroupIcon, ChatBubbleLeftEllipsisIcon
} from '../constants';
import { 
    NotificationChannel, NotificationStatus, NotificationType, 
    NotificationSettingItem, NotificationLogEntry, NotificationModuleSettings 
} from '../types';
import { Badge } from '../components/ui/Badge';
import TextArea from '../components/ui/TextArea';

// Create local options from enums as they are not exported from constants
const notificationChannelOptions = Object.values(NotificationChannel).map(channel => ({ value: channel, label: channel }));
const notificationStatusOptions = Object.values(NotificationStatus).map(status => ({ value: status, label: status }));
const notificationTypeOptions = Object.values(NotificationType).map(type => ({ value: type, label: type }));


// Initial settings for notifications (Revised for "Adala" system)
const initialNotificationSettings: NotificationSettingItem[] = [
    // Case Management
    { id: 'NEW_CASE_ASSIGNED', type: NotificationType.NEW_CASE_ASSIGNED, description: 'إشعار للمحامي عند إسناد قضية جديدة إليه.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'HEARING_REMINDER', type: NotificationType.HEARING_REMINDER, description: 'تذكير للمحامي المسؤول قبل موعد الجلسة بيوم.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'CASE_STATUS_UPDATED', type: NotificationType.CASE_STATUS_UPDATED, description: 'إشعار للأطراف المعنية بتحديث حالة قضية (مثل: إقفال، استئناف).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'CASE_DEADLINE_APPROACHING', type: NotificationType.CASE_DEADLINE_APPROACHING, description: 'تنبيه للمحامي المسؤول باقتراب موعد هام في قضية (مثل: تقديم مذكرة).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    
    // Contract Analysis
    { id: 'CONTRACT_ANALYSIS_COMPLETED', type: NotificationType.CONTRACT_ANALYSIS_COMPLETED, description: 'إشعار باكتمال تحليل عقد بواسطة الذكاء الاصطناعي.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },

    // Compliance
    { id: 'COMPLIANCE_DUE_SOON', type: NotificationType.COMPLIANCE_DUE_SOON, description: 'تنبيه للمسؤول عن الامتثال باقتراب تاريخ استحقاق متطلب.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'COMPLIANCE_OVERDUE', type: NotificationType.COMPLIANCE_OVERDUE, description: 'تنبيه للمسؤول عن الامتثال بتجاوز متطلب لتاريخ استحقاقه.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },

    // Employee Affairs
    { id: 'NEW_LEAVE_REQUEST_FOR_APPROVAL', type: NotificationType.NEW_LEAVE_REQUEST_FOR_APPROVAL, description: 'إشعار للمدير/المسؤول بوجود طلب إجازة جديد بانتظار الموافقة.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'LEAVE_REQUEST_STATUS_CHANGED', type: NotificationType.LEAVE_REQUEST_STATUS_CHANGED, description: 'إشعار للموظف بتحديث حالة طلب الإجازة الخاص به (موافقة/رفض).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'NEW_LOAN_REQUEST_FOR_APPROVAL', type: NotificationType.NEW_LOAN_REQUEST_FOR_APPROVAL, description: 'إشعار للمدير/المسؤول بوجود طلب قرض جديد بانتظار الموافقة.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'LOAN_REQUEST_STATUS_CHANGED', type: NotificationType.LOAN_REQUEST_STATUS_CHANGED, description: 'إشعار للموظف بتحديث حالة طلب القرض الخاص به.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'LOAN_INSTALLMENT_DUE', type: NotificationType.LOAN_INSTALLMENT_DUE, description: 'تذكير للموظف بقرب موعد استحقاق قسط قرض.', emailEnabled: true, whatsappEnabled: false, systemEnabled: false, managerAlertEnabled: false },
    { id: 'DISCIPLINARY_ACTION_UPDATE', type: NotificationType.DISCIPLINARY_ACTION_UPDATE, description: 'إشعار للموظف المعني أو الإدارة بتحديث على إجراء تأديبي.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'NEW_EMPLOYEE_REQUEST', type: NotificationType.NEW_EMPLOYEE_REQUEST, description: 'إشعار للإدارة بتقديم طلب موظف جديد (مثل شهادة راتب، خبرة).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'EMPLOYEE_REQUEST_PROCESSED', type: NotificationType.EMPLOYEE_REQUEST_PROCESSED, description: 'إشعار للموظف بأنه تم معالجة طلبه الإداري.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },

    // Legal Representation
    { id: 'NEW_LEGAL_REPRESENTATION_REQUEST', type: NotificationType.NEW_LEGAL_REPRESENTATION_REQUEST, description: 'إشعار للمحامي المناب بوجود طلب إنابة قانونية جديد موجه إليه.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'LEGAL_REPRESENTATION_STATUS_UPDATE', type: NotificationType.LEGAL_REPRESENTATION_STATUS_UPDATE, description: 'تحديث على حالة طلب إنابة قانونية (قبول، رفض، إكمال).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },

    // Task Management
    { id: 'TASK_ASSIGNED_TO_YOU', type: NotificationType.TASK_ASSIGNED_TO_YOU, description: 'إشعار عند إسناد مهمة جديدة إليك.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'TASK_DUE_REMINDER', type: NotificationType.TASK_DUE_REMINDER, description: 'تذكير بمهمة قريبة من تاريخ استحقاقها.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'TASK_OVERDUE_ALERT', type: NotificationType.TASK_OVERDUE_ALERT, description: 'تنبيه بمهمة تجاوزت تاريخ استحقاقها.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'TASK_STATUS_UPDATED', type: NotificationType.TASK_STATUS_UPDATED, description: 'إشعار بتحديث حالة مهمة مكلف بها أو تتابعها.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    
    // Document & Lease Expiry
    { id: 'IMPORTANT_DOCUMENT_EXPIRY_WARNING', type: NotificationType.IMPORTANT_DOCUMENT_EXPIRY_WARNING, description: 'تحذير عام باقتراب انتهاء صلاحية مستند هام (ترخيص، كفالة، إلخ).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },
    { id: 'LEASE_EXPIRY_APPROACHING', type: NotificationType.LEASE_EXPIRY_APPROACHING, description: 'تنبيه قبل 30 يومًا من انتهاء عقد إيجار مسجل بالنظام (للمسؤولين).', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: true },

    // Financial
    { id: 'PAYMENT_DUE_REMINDER', type: NotificationType.PAYMENT_DUE_REMINDER, description: 'إرسال تذكير للعميل/الموكل بموعد استحقاق دفعة مالية.', emailEnabled: true, whatsappEnabled: false, systemEnabled: false, managerAlertEnabled: false },

    // General System
    { id: 'SYSTEM_MAINTENANCE_NOTICE', type: NotificationType.SYSTEM_MAINTENANCE_NOTICE, description: 'إشعار للمستخدمين بصيانة مجدولة للنظام.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
    { id: 'GENERAL_ANNOUNCEMENT', type: NotificationType.GENERAL_ANNOUNCEMENT, description: 'إعلان عام من إدارة النظام/المكتب لجميع المستخدمين.', emailEnabled: true, whatsappEnabled: false, systemEnabled: true, managerAlertEnabled: false },
];

const mockNotificationLog: NotificationLogEntry[] = [
    { id: 'log1', notificationType: NotificationType.NEW_CASE_ASSIGNED, channel: NotificationChannel.EMAIL, recipient: 'lawyer_ahmed@example.com', dateTime: new Date(Date.now() - 3600000).toISOString(), status: NotificationStatus.SENT, subject: 'إسناد قضية جديدة: CML-2024-102' },
    { id: 'log2', notificationType: NotificationType.HEARING_REMINDER, channel: NotificationChannel.SYSTEM, recipient: 'أ. أحمد محمود', dateTime: new Date(Date.now() - 7200000).toISOString(), status: NotificationStatus.VIEWED, messagePreview: 'تذكير بجلسة قضية CML-2024-101 غدًا.' },
    { id: 'log3', notificationType: NotificationType.PAYMENT_DUE_REMINDER, channel: NotificationChannel.EMAIL, recipient: 'client_abc@mail.com', dateTime: new Date(Date.now() - 86400000).toISOString(), status: NotificationStatus.FAILED, subject: 'تذكير بدفعة مستحقة لأتعاب القضية X' },
    { id: 'log4', notificationType: NotificationType.IMPORTANT_DOCUMENT_EXPIRY_WARNING, channel: NotificationChannel.EMAIL, recipient: 'admin_dept@example.com', dateTime: new Date().toISOString(), status: NotificationStatus.PENDING, subject: 'تنبيه: الرخصة التجارية للمكتب على وشك الانتهاء' },
    { id: 'log5', notificationType: NotificationType.NEW_LEAVE_REQUEST_FOR_APPROVAL, channel: NotificationChannel.SYSTEM, recipient: 'مدير الإدارة', dateTime: new Date(Date.now() - 120000).toISOString(), status: NotificationStatus.SENT, messagePreview: 'طلب إجازة جديد من الموظف/ة فاطمة علي.' },
];

const userRoleOptionsForNotifications = [
    { value: 'admin', label: 'مدير النظام' },
    { value: 'legal_manager', label: 'مدير الإدارة القانونية' },
    { value: 'technical_support', label: 'المسؤول التقني' },
    { value: 'lawyer', label: 'محامي' },
];

const formatDateForLog = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return dateString; }
};


const NotificationsManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'internal' | 'log'>('email');
  
    const [settings, setSettings] = useState<NotificationModuleSettings>({
      senderEmail: 'noreply@adala-system.com', // Updated placeholder
      managerEmailForAlerts: 'manager@adala-system.com', // Updated placeholder
      notificationSettings: JSON.parse(JSON.stringify(initialNotificationSettings)), // Deep copy
      whatsappBusinessNumber: '+965',
    });
  
    const [logEntries, setLogEntries] = useState<NotificationLogEntry[]>(mockNotificationLog);
    const [logFilterType, setLogFilterType] = useState<NotificationType | ''>('');
    const [logFilterChannel, setLogFilterChannel] = useState<NotificationChannel | ''>('');
    const [logFilterStatus, setLogFilterStatus] = useState<NotificationStatus | ''>('');
    const [logFilterDateFrom, setLogFilterDateFrom] = useState('');
    const [logFilterDateTo, setLogFilterDateTo] = useState('');
    
    // Permissions state (simulated)
    const [notificationAccessRoles, setNotificationAccessRoles] = useState<string[]>(['admin']);
  
  
    const handleSettingChange = (id: string, field: keyof NotificationSettingItem, value: boolean | string) => {
      setSettings(prev => ({
          ...prev,
          notificationSettings: prev.notificationSettings.map(item =>
              item.id === id ? { ...item, [field]: value } : item
          )
      }));
    };
    
    const handleMainSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSettings(prev => ({...prev, [name]: value}));
    };
  
    const handleSaveSettings = (section: 'email' | 'whatsapp' | 'internal') => {
      console.log(`Saving ${section} settings:`, settings);
      alert(`تم حفظ إعدادات ${section} (محاكاة).`);
    };
    
    const filteredLogEntries = useMemo(() => {
      return logEntries.filter(entry => 
        (logFilterType ? entry.notificationType === logFilterType : true) &&
        (logFilterChannel ? entry.channel === logFilterChannel : true) &&
        (logFilterStatus ? entry.status === logFilterStatus : true) &&
        (logFilterDateFrom ? new Date(entry.dateTime) >= new Date(logFilterDateFrom) : true) &&
        (logFilterDateTo ? new Date(entry.dateTime) <= new Date(new Date(logFilterDateTo).setHours(23,59,59,999)) : true)
      ).sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    }, [logEntries, logFilterType, logFilterChannel, logFilterStatus, logFilterDateFrom, logFilterDateTo]);
  
  
    const tabsConfig = [
      { key: 'email', label: 'إعدادات البريد الإلكتروني', icon: <EnvelopeIcon className="w-5 h-5 me-2" /> },
      { key: 'whatsapp', label: 'تنبيهات واتساب', icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 me-2" /> },
      { key: 'internal', label: 'إشعارات النظام الداخلية', icon: <BellAlertIcon className="w-5 h-5 me-2" /> },
      { key: 'log', label: 'سجل الإشعارات المرسلة', icon: <CalendarDaysIcon className="w-5 h-5 me-2" /> },
    ];

    const getStatusBadgeColor = (status: NotificationStatus): 'green' | 'red' | 'yellow' | 'blue' | 'gray' => {
        switch(status) {
            case NotificationStatus.SENT: return 'green';
            case NotificationStatus.FAILED: return 'red';
            case NotificationStatus.PENDING: return 'yellow';
            case NotificationStatus.VIEWED: return 'blue';
            default: return 'gray';
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <BellAlertIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark">إدارة التنبيهات والإشعارات</h1>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 space-x-reverse overflow-x-auto scrollbar-thin pb-1">
                    {tabsConfig.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'email' && (
                <Card title="إعدادات إشعارات البريد الإلكتروني">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input label="البريد الإلكتروني للمرسل" name="senderEmail" value={settings.senderEmail} onChange={handleMainSettingChange} />
                        <Input label="بريد المدير لتلقي التنبيهات الهامة" name="managerEmailForAlerts" value={settings.managerEmailForAlerts} onChange={handleMainSettingChange} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100"><tr><th className="px-3 py-2 text-right">وصف الإشعار</th><th className="px-3 py-2 text-center">تفعيل البريد</th><th className="px-3 py-2 text-center">إرسال تنبيه للمدير</th></tr></thead>
                            <tbody>
                                {settings.notificationSettings.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2">{item.description}</td>
                                        <td className="px-3 py-2 text-center"><input type="checkbox" className="form-checkbox" checked={item.emailEnabled} onChange={e => handleSettingChange(item.id, 'emailEnabled', e.target.checked)} /></td>
                                        <td className="px-3 py-2 text-center"><input type="checkbox" className="form-checkbox" checked={!!item.managerAlertEnabled} onChange={e => handleSettingChange(item.id, 'managerAlertEnabled', e.target.checked)} disabled={item.managerAlertEnabled === undefined} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => handleSaveSettings('email')}>حفظ إعدادات البريد</Button>
                    </div>
                </Card>
            )}
            {activeTab === 'whatsapp' && (
                 <Card title="إعدادات إشعارات واتساب">
                    <InformationCircleIcon className="w-6 h-6 text-blue-500 float-right" />
                    <p className="mb-4">هذه الميزة تتطلب اشتراكًا في خدمة WhatsApp Business API وتكوينًا خاصًا. المعلومات أدناه للعرض التوضيحي.</p>
                    <Input label="رقم واتساب بزنس المسجل" name="whatsappBusinessNumber" value={settings.whatsappBusinessNumber} onChange={handleMainSettingChange} />
                    <TextArea label="قوالب الرسائل (مثال)" rows={5} readOnly value={"مثال قالب:\nمرحبًا {{1}}،\nنود تذكيركم بموعد جلستكم في القضية رقم {{2}} غدًا الساعة {{3}}.\nمع تحيات مكتب عدالة."}/>
                     <div className="mt-4 flex justify-end">
                        <Button onClick={() => handleSaveSettings('whatsapp')} disabled>حفظ (معطل)</Button>
                    </div>
                 </Card>
            )}
            {activeTab === 'internal' && (
                <Card title="إعدادات الإشعارات داخل النظام">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100"><tr><th className="px-3 py-2 text-right">وصف الإشعار</th><th className="px-3 py-2 text-center">تفعيل الإشعار بالنظام</th></tr></thead>
                            <tbody>
                                {settings.notificationSettings.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2">{item.description}</td>
                                        <td className="px-3 py-2 text-center"><input type="checkbox" className="form-checkbox" checked={item.systemEnabled} onChange={e => handleSettingChange(item.id, 'systemEnabled', e.target.checked)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="mt-4 flex justify-end">
                        <Button onClick={() => handleSaveSettings('internal')}>حفظ الإعدادات الداخلية</Button>
                    </div>
                </Card>
            )}
            {activeTab === 'log' && (
                <Card title="سجل الإشعارات المرسلة">
                    <div className="p-3 bg-gray-50 rounded-md mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        <Select label="النوع" options={[{value:'', label:'الكل'}, ...notificationTypeOptions]} value={logFilterType} onChange={e => setLogFilterType(e.target.value as NotificationType | '')} containerClassName="mb-0"/>
                        <Select label="القناة" options={[{value:'', label:'الكل'}, ...notificationChannelOptions]} value={logFilterChannel} onChange={e => setLogFilterChannel(e.target.value as NotificationChannel | '')} containerClassName="mb-0"/>
                        <Select label="الحالة" options={[{value:'', label:'الكل'}, ...notificationStatusOptions]} value={logFilterStatus} onChange={e => setLogFilterStatus(e.target.value as NotificationStatus | '')} containerClassName="mb-0"/>
                        <Input label="من تاريخ" type="date" value={logFilterDateFrom} onChange={e => setLogFilterDateFrom(e.target.value)} containerClassName="mb-0"/>
                        <Input label="إلى تاريخ" type="date" value={logFilterDateTo} onChange={e => setLogFilterDateTo(e.target.value)} containerClassName="mb-0"/>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 text-xs">
                             <thead className="bg-gray-100"><tr>{['الوقت', 'النوع', 'القناة', 'المستلم', 'الحالة', 'معاينة الرسالة'].map(h=><th key={h} className="px-2 py-2 text-right">{h}</th>)}</tr></thead>
                             <tbody>
                                 {filteredLogEntries.map(log => (
                                     <tr key={log.id}>
                                         <td className="px-2 py-1">{formatDateForLog(log.dateTime)}</td>
                                         <td className="px-2 py-1">{log.notificationType}</td>
                                         <td className="px-2 py-1">{log.channel}</td>
                                         <td className="px-2 py-1 truncate" title={log.recipient}>{log.recipient}</td>
                                         <td className="px-2 py-1"><Badge text={log.status} color={getStatusBadgeColor(log.status)} /></td>
                                         <td className="px-2 py-1 truncate max-w-xs" title={log.messagePreview || log.subject}>{log.messagePreview || log.subject}</td>
                                     </tr>
                                 ))}
                                 {filteredLogEntries.length === 0 && <tr><td colSpan={6} className="text-center py-4">لا توجد سجلات تطابق البحث.</td></tr>}
                             </tbody>
                         </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default NotificationsManagementPage;
