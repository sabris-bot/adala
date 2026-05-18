
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { 
    BellAlertIcon, InformationCircleIcon, CalendarDaysIcon, 
    CheckCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon,
    EnvelopeIcon, ChatBubbleLeftRightIcon, DevicePhoneMobileIcon,
    ComputerDesktopIcon, ClockIcon, ShieldCheckIcon, SparklesIcon,
    ExclamationTriangleIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon,
    ArrowDownTrayIcon, AdjustmentsHorizontalIcon,
    FolderIcon, BanknotesIcon, UserGroupIcon, ClipboardDocumentListIcon,
    Squares2X2Icon
} from '../constants';
import { 
    NotificationChannel, SystemNotificationStatus, NotificationType, 
    NotificationSettingItem, NotificationLogEntry, NotificationModuleSettings 
} from '../types';

// --- Helper Components ---
const ToggleSwitch = ({ checked, onChange, label, description, icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">
            {icon && <div className={`p-3 rounded-xl transition-colors ${checked ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>{icon}</div>}
            <div>
                <p className="font-black text-gray-900 dark:text-dm-text leading-none">{label}</p>
                {description && <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{description}</p>}
            </div>
        </div>
        <button 
            type="button" 
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary ${checked ? 'bg-primary' : 'bg-gray-200'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const GroupHeader = ({ title, icon, color = 'bg-primary' }: { title: string; icon: React.ReactNode; color?: string }) => (
    <div className="flex items-center gap-3 mb-6 mt-8 first:mt-0">
        <div className={`p-2 rounded-lg ${color} text-white shadow-lg shadow-${color}/20`}>
            {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-dm-text tracking-tighter">{title}</h3>
        <div className="flex-grow border-t border-dashed border-gray-200 dark:border-gray-800 ms-2"></div>
    </div>
);

// --- Initial Data ---
const initialSettings: NotificationModuleSettings = {
    senderEmail: 'notifications@adalalaw.com',
    managerEmailForAlerts: 'admin@adalalaw.com',
    whatsappBusinessNumber: '96522221111',
    isPaused: false,
    digestFrequency: 'instant',
    quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:30',
        timezone: 'Asia/Kuwait'
    },
    notificationSettings: [
        // Cases
        { id: 'NEW_CASE_ASSIGNED', type: NotificationType.NEW_CASE_ASSIGNED, description: 'إسناد قضية جديدة للدائرة/المحامي', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, priority: 'high' },
        { id: 'HEARING_REMINDER', type: NotificationType.HEARING_REMINDER, description: 'تذكير بموعد جلسة قادمة', emailEnabled: true, whatsappEnabled: true, smsEnabled: true, systemEnabled: true, priority: 'urgent', reminderIntervals: [15, 60, 1440] },
        { id: 'CASE_STATUS_UPDATED', type: NotificationType.CASE_STATUS_UPDATED, description: 'صدور حكم أو تحديث حالة قضية', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'high' },
        { id: 'CASE_DEADLINE_APPROACHING', type: NotificationType.CASE_DEADLINE_APPROACHING, description: 'اقتراب موعد تسليم مذكرات/مستندات', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, priority: 'high', reminderIntervals: [1440, 4320] },

        // Contracts
        { id: 'CONTRACT_RENEWAL', type: NotificationType.CONTRACT_RENEWAL_DUE, description: 'تنبيه استحقاق تجديد عقد (إيجار/عمل)', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, priority: 'high', reminderIntervals: [10080, 43200] },
        
        // Financial
        { id: 'PAYMENT_DUE_REMINDER', type: NotificationType.PAYMENT_DUE_REMINDER, description: 'تذكير العميل بموعد استحقاق دفعة', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: false, managerAlertEnabled: true, priority: 'normal', reminderIntervals: [4320] },
        
        // Employee
        { id: 'NEW_LEAVE_REQUEST', type: NotificationType.NEW_LEAVE_REQUEST_FOR_APPROVAL, description: 'طلبات الإجازة الجديدة', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'normal' },
        { id: 'LOAN_INSTALLMENT', type: NotificationType.LOAN_INSTALLMENT_DUE, description: 'استحقاق أقساط القروض للموظفين', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, priority: 'low', reminderIntervals: [4320] },
        
        // Tasks
        { id: 'TASK_ASSIGNED', type: NotificationType.TASK_ASSIGNED_TO_YOU, description: 'تغيير مهمة أو إسناد مهمة جديدة', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, priority: 'normal' },
        { id: 'TASK_OVERDUE', type: NotificationType.TASK_OVERDUE_ALERT, description: 'تجاوز موعد استحقاق المهمة', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'high' },
        
        // System
        { id: 'DOC_EXPIRY', type: NotificationType.IMPORTANT_DOCUMENT_EXPIRY_WARNING, description: 'تحذيرات انتهاء التراخيص والمستندات', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'high', reminderIntervals: [43200] },
    ]
};

const mockLogs: NotificationLogEntry[] = [
    { id: 'L1', notificationType: NotificationType.HEARING_REMINDER, channel: NotificationChannel.WHATSAPP, recipient: '965 99887766', dateTime: '2024-05-02T10:15:00Z', status: SystemNotificationStatus.VIEWED, messagePreview: 'تذكير: لديكم جلسة غداً الساعة 09:00 ص' },
    { id: 'L2', notificationType: NotificationType.NEW_CASE_ASSIGNED, channel: NotificationChannel.EMAIL, recipient: 'legal.ops@office.com', dateTime: '2024-05-02T09:30:00Z', status: SystemNotificationStatus.SENT, subject: 'إسناد قضية تظلم جديدة #2024/501' },
    { id: 'L3', notificationType: NotificationType.CASE_DEADLINE_APPROACHING, channel: NotificationChannel.SYSTEM, recipient: 'أحمد محمود', dateTime: '2024-05-02T08:00:00Z', status: SystemNotificationStatus.PENDING, messagePreview: 'باقي يومان على تسليم مذكرة الاستئناف لقضية 101' },
    { id: 'L4', notificationType: NotificationType.PAYMENT_DUE_REMINDER, channel: NotificationChannel.EMAIL, recipient: 'client@company.com', dateTime: '2024-05-01T16:45:00Z', status: SystemNotificationStatus.FAILED, subject: 'إشعار استحقاق الدفعة الثانية', messagePreview: 'العنوان البريدي غير صحيح أو ممتلئ' },
    { id: 'L5', notificationType: NotificationType.TASK_OVERDUE_ALERT, channel: NotificationChannel.WHATSAPP, recipient: '965 50505050', dateTime: '2024-05-01T14:20:00Z', status: SystemNotificationStatus.SENT, messagePreview: 'تنبيه: المهمة "مراجعة العقد" متأخرة عن موعدها' },
];

const NotificationsManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'logs' | 'advanced'>('settings');
    const [settingsState, setSettingsState] = useState<NotificationModuleSettings>(initialSettings);
    const [logs, setLogs] = useState<NotificationLogEntry[]>(mockLogs);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<SystemNotificationStatus | ''>('');

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.recipient.includes(searchTerm) || log.notificationType.includes(searchTerm) || (log.subject?.includes(searchTerm));
            const matchesStatus = !statusFilter || log.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    }, [logs, searchTerm, statusFilter]);

    const handleToggleChannel = (id: string, channel: 'emailEnabled' | 'whatsappEnabled' | 'smsEnabled' | 'systemEnabled' | 'managerAlertEnabled') => {
        setSettingsState(prev => ({
            ...prev,
            notificationSettings: prev.notificationSettings.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s)
        }));
    };

    const renderSettingsTab = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Global Switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ToggleSwitch 
                    checked={!settingsState.isPaused} 
                    onChange={(v) => setSettingsState(p => ({ ...p, isPaused: !v }))} 
                    label="نشاط النظام" 
                    description={settingsState.isPaused ? "النظام متوقف حالياً" : "الإشعارات تعمل بشكل طبيعي"}
                    icon={<BellAlertIcon className="w-5 h-5"/>}
                />
                <ToggleSwitch 
                    checked={settingsState.quietHours?.enabled || false} 
                    onChange={(v) => setSettingsState(p => ({ ...p, quietHours: { ...p.quietHours!, enabled: v } }))} 
                    label="ساعات الهدوء" 
                    description={settingsState.quietHours?.enabled ? `من ${settingsState.quietHours.start} إلى ${settingsState.quietHours.end}` : "معطل"}
                    icon={<ClockIcon className="w-5 h-5"/>}
                />
                <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">تكرار الإشعارات</p>
                    <Select 
                        options={[
                            { value: 'instant', label: 'فوري (Real-time)' },
                            { value: 'daily', label: 'ملخص يومي (Digest)' },
                            { value: 'weekly', label: 'ملخص أسبوعي' }
                        ]}
                        value={settingsState.digestFrequency}
                        onChange={(e) => setSettingsState(p => ({ ...p, digestFrequency: e.target.value as any }))}
                        containerClassName="mb-0"
                    />
                </div>
                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">إجمالي التنبيهات المفعلة</p>
                    <p className="text-3xl font-black leading-none">{settingsState.notificationSettings.length}</p>
                </div>
            </div>

            {/* Categorized Settings */}
            <div className="bg-gray-50/50 dark:bg-dm-background/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-900">
                <GroupHeader title="إدارة القضايا والهيئات" icon={<FolderIcon className="w-5 h-5"/>} color="bg-blue-600" />
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {settingsState.notificationSettings.filter(s => s.id.includes('CASE')).map(s => renderSettingRow(s))}
                </div>

                <GroupHeader title="الشؤون المالية والعملاء" icon={<BanknotesIcon className="w-5 h-5"/>} color="bg-emerald-600" />
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {settingsState.notificationSettings.filter(s => s.id.includes('PAYMENT')).map(s => renderSettingRow(s))}
                </div>

                <GroupHeader title="العقود والاتفاقيات" icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} color="bg-rose-600" />
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {settingsState.notificationSettings.filter(s => s.id.includes('CONTRACT')).map(s => renderSettingRow(s))}
                </div>

                <GroupHeader title="شؤون الموظفين والإدارية" icon={<UserGroupIcon className="w-5 h-5"/>} color="bg-violet-600" />
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {settingsState.notificationSettings.filter(s => s.id.includes('LEAVE') || s.id.includes('LOAN')).map(s => renderSettingRow(s))}
                </div>

                <GroupHeader title="المهام والمتابعة" icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} color="bg-amber-600" />
                <div className="grid grid-cols-1 gap-4">
                    {settingsState.notificationSettings.filter(s => s.id.includes('TASK') || s.id.includes('DOC')).map(s => renderSettingRow(s))}
                </div>
            </div>
        </div>
    );

    const renderSettingRow = (s: NotificationSettingItem) => {
        const intervals = [
            { label: '5 د', value: 5 },
            { label: '15 د', value: 15 },
            { label: '1 س', value: 60 },
            { label: '1 ي', value: 1440 },
            { label: '3 ي', value: 4320 },
            { label: 'أسبوع', value: 10080 },
            { label: 'شهر', value: 43200 }
        ];

        const toggleInterval = (value: number) => {
            setSettingsState(prev => ({
                ...prev,
                notificationSettings: prev.notificationSettings.map(item => 
                    item.id === s.id 
                    ? { 
                        ...item, 
                        reminderIntervals: (item.reminderIntervals || []).includes(value)
                            ? (item.reminderIntervals || []).filter(v => v !== value)
                            : [...(item.reminderIntervals || []), value]
                    } 
                    : item
                )
            }));
        };

        return (
            <div key={s.id} className="group bg-white dark:bg-dm-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-grow max-w-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-gray-900 dark:text-dm-text">{s.description}</p>
                            {s.priority && (
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                    s.priority === 'urgent' ? 'bg-red-100 text-red-600' : 
                                    s.priority === 'high' ? 'bg-orange-100 text-orange-600' : 
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {s.priority}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.type}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 lg:bg-gray-50/50 dark:lg:bg-dm-background/50 lg:p-2 lg:rounded-xl">
                        <button 
                            onClick={() => handleToggleChannel(s.id, 'systemEnabled')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black transition-all border ${s.systemEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'}`}
                        >
                            <ComputerDesktopIcon className="w-3.5 h-3.5"/>
                            <span>النظام</span>
                        </button>
                        <button 
                            onClick={() => handleToggleChannel(s.id, 'emailEnabled')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black transition-all border ${s.emailEnabled ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'}`}
                        >
                            <EnvelopeIcon className="w-3.5 h-3.5"/>
                            <span>البريد</span>
                        </button>
                        <button 
                            onClick={() => handleToggleChannel(s.id, 'whatsappEnabled')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black transition-all border ${s.whatsappEnabled ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'}`}
                        >
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5"/>
                            <span>واتساب</span>
                        </button>
                        <button 
                            onClick={() => handleToggleChannel(s.id, 'smsEnabled')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black transition-all border ${s.smsEnabled ? 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'}`}
                        >
                            <DevicePhoneMobileIcon className="w-3.5 h-3.5"/>
                            <span>SMS</span>
                        </button>
                        <div className="w-[1px] h-6 bg-gray-200 hidden lg:block mx-2"></div>
                        <button 
                            onClick={() => handleToggleChannel(s.id, 'managerAlertEnabled')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black transition-all border ${s.managerAlertEnabled ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'}`}
                            title="إرسال نسخة للمدير"
                        >
                            <ShieldCheckIcon className="w-3.5 h-3.5"/>
                            <span>تنبيه المدير</span>
                        </button>
                    </div>
                </div>

                {/* Interval Selection */}
                {(s.id.includes('REMINDER') || s.id.includes('APPROACHING') || s.id.includes('EXPIRY') || s.id.includes('RENEWAL') || s.id.includes('INSTALLMENT')) && (
                    <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ClockIcon className="w-3 h-3"/> توقيت التنبيهات (قبل الموعد بـ):
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {intervals.map(int => (
                                    <button
                                        key={int.value}
                                        onClick={() => toggleInterval(int.value)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${
                                            (s.reminderIntervals || []).includes(int.value)
                                                ? 'bg-primary text-white border-primary shadow-sm scale-105'
                                                : 'bg-white dark:bg-dm-background border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
                                        }`}
                                    >
                                        {int.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderLogsTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="bg-white dark:bg-dm-card p-6 border-b dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input 
                            placeholder="ابحث في السجل..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-dm-background rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Select 
                            options={[
                                { value: '', label: 'كل الحالات' },
                                { value: SystemNotificationStatus.SENT, label: 'مرسل' },
                                { value: SystemNotificationStatus.FAILED, label: 'فشل' },
                                { value: SystemNotificationStatus.VIEWED, label: 'تم العرض' }
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            containerClassName="mb-0 w-40"
                        />
                        <Button variant="outline" className="rounded-2xl" leftIcon={<ArrowPathIcon className="w-5 h-5"/>} onClick={() => setLogs([...mockLogs])}></Button>
                        <Button variant="secondary" className="rounded-2xl" leftIcon={<ArrowDownTrayIcon className="w-5 h-5"/>}>تصدير</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dm-background/50 border-b dark:border-gray-800">
                                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">التاريخ والوقت</th>
                                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">النوع</th>
                                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">القناة</th>
                                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">المستلم</th>
                                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">الحالة</th>
                                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">معاينة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-dm-background/50 transition-colors group">
                                    <td className="p-4 font-mono text-[11px] text-gray-500 font-bold tracking-tight">
                                        {new Date(log.dateTime).toLocaleString('ar-EG', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-4 font-black text-gray-900 dark:text-dm-text">
                                        {log.notificationType}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center p-2 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {log.channel === NotificationChannel.EMAIL && <EnvelopeIcon className="w-4 h-4"/>}
                                            {log.channel === NotificationChannel.WHATSAPP && <ChatBubbleLeftRightIcon className="w-4 h-4"/>}
                                            {log.channel === NotificationChannel.SMS && <DevicePhoneMobileIcon className="w-4 h-4"/>}
                                            {log.channel === NotificationChannel.SYSTEM && <ComputerDesktopIcon className="w-4 h-4"/>}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-600">
                                        {log.recipient}
                                    </td>
                                    <td className="p-4 text-center">
                                        <Badge 
                                            text={log.status} 
                                            variant={log.status === SystemNotificationStatus.SENT ? 'success' : log.status === SystemNotificationStatus.FAILED ? 'danger' : 'info'} 
                                            size="xs"
                                        />
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs italic group-hover:text-gray-600 transition-colors">
                                        {log.subject || log.messagePreview || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredLogs.length === 0 && (
                    <div className="py-20 text-center">
                        <SparklesIcon className="w-16 h-16 mx-auto text-gray-200 mb-2"/>
                        <p className="text-gray-400 font-bold">لا يوجد سجل لمطابقة البحث</p>
                    </div>
                )}
            </Card>
        </div>
    );

    const renderAdvancedTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card title="إعدادات الحسابات والقنوات" className="shadow-xl rounded-3xl overflow-hidden" headerClassName="bg-gray-50 border-b font-black text-lg">
                <div className="p-6 space-y-6">
                    <Input 
                        label="بريد الإرسال الرسمي" 
                        value={settingsState.senderEmail} 
                        onChange={(e) => setSettingsState(p => ({ ...p, senderEmail: e.target.value }))}
                        icon={<EnvelopeIcon className="w-5 h-5"/>}
                    />
                    <Input 
                        label="رقم الواتساب (Business API)" 
                        value={settingsState.whatsappBusinessNumber} 
                        onChange={(e) => setSettingsState(p => ({ ...p, whatsappBusinessNumber: e.target.value }))}
                        icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>}
                    />
                    <Input 
                        label="مفتاح بوابة الرسائل النصية (SMS Gateway)" 
                        value={settingsState.smsGatewayKey || ''} 
                        onChange={(e) => setSettingsState(p => ({ ...p, smsGatewayKey: e.target.value }))}
                        type="password"
                        icon={<DevicePhoneMobileIcon className="w-5 h-5"/>}
                    />
                    <Input 
                        label="بريد المدير لتنبيهات التصعيد" 
                        value={settingsState.managerEmailForAlerts} 
                        onChange={(e) => setSettingsState(p => ({ ...p, managerEmailForAlerts: e.target.value }))}
                        icon={<ShieldCheckIcon className="w-5 h-5"/>}
                    />
                    <Button variant="primary" className="w-full mt-4 h-12 rounded-2xl shadow-lg shadow-primary/20">حفظ الإعدادات المتقدمة</Button>
                </div>
            </Card>

            <div className="space-y-6">
                <Card title="جدولة ساعات الهدوء (DND)" className="shadow-xl rounded-3xl" headerClassName="bg-gray-50 border-b font-black text-lg">
                    <div className="p-6 space-y-4">
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            عند تفعيل هذا الوضع، سيتم تجميع الإشعارات غير العاجلة وإرسالها بمجرد انتهاء ساعات الهدوء. الإشعارات العاجلة (Urgent) ستتخطى هذا الفلتر.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="وقت البدء" type="time" value={settingsState.quietHours?.start} onChange={(e) => setSettingsState(p => ({ ...p, quietHours: { ...p.quietHours!, start: e.target.value } }))} />
                            <Input label="وقت الانتهاء" type="time" value={settingsState.quietHours?.end} onChange={(e) => setSettingsState(p => ({ ...p, quietHours: { ...p.quietHours!, end: e.target.value } }))} />
                        </div>
                        <Select 
                            label="المنطقة الزمنية"
                            options={[{ value: 'Asia/Kuwait', label: 'توقيت الكويت (GMT+3)' }]}
                            value={settingsState.quietHours?.timezone}
                            onChange={(e) => setSettingsState(p => ({ ...p, quietHours: { ...p.quietHours!, timezone: e.target.value } }))}
                        />
                    </div>
                </Card>

                <Card className="bg-amber-50 border-amber-200 border shadow-none rounded-3xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-200 rounded-xl text-amber-700">
                            <ExclamationTriangleIcon className="w-6 h-6"/>
                        </div>
                        <div>
                            <h4 className="font-black text-amber-900 mb-1">منطقة الخطر</h4>
                            <p className="text-xs text-amber-800 leading-relaxed mb-4">سيتم حذف كافة سجلات الإشعارات القديمة بشكل دائم وتصفير عداد التنبيهات.</p>
                            <Button variant="danger" size="sm" className="rounded-xl" leftIcon={<TrashIcon className="w-4"/>}>مسح السجل بالكامل</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary transform -rotate-12 transition-transform hover:rotate-0 duration-300">
                            <BellAlertIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">منظومة الإشعارات</h1>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="w-3 h-3"/> تخصيص تدفق المعلومات والتنبيهات الذكية
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<AdjustmentsHorizontalIcon className="w-5 h-5"/>}>اختبار القنوات</Button>
                    <Button variant="primary" className="shadow-xl shadow-primary/20" leftIcon={<SparklesIcon className="w-5 h-5"/>}>الذكاء الاصطناعي</Button>
                </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700">
                    <BellAlertIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <InformationCircleIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black mb-1">إعدادات توجيه التنبيهات وكفاءة الإبلاغ</h4>
                        <p className="text-blue-100 text-sm leading-relaxed max-w-4xl font-medium tracking-tight">
                            هذه اللوحة تسمح لك بالتحكم المطلق في تدفق الإشعارات لكل وحدة في النظام. يمكنك جدولة وقت الوصول، واختيار القناة الأكثر فعالية (واتساب للمستعجل، بريد للتوثيق)، وضمان وصول المعلومة للمستهدف في الوقت المناسب دون تشتيت.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-100 dark:bg-dm-card p-1.5 rounded-3xl flex w-full md:w-fit shadow-inner">
                {[
                    { id: 'settings', label: 'تكوين القنوات', icon: <AdjustmentsHorizontalIcon className="w-5 h-5"/> },
                    { id: 'logs', label: 'سجل الإرسال', icon: <CalendarDaysIcon className="w-5 h-5"/> },
                    { id: 'advanced', label: 'خيارات متقدمة', icon: <CogIcon className="w-5 h-5"/> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-white dark:bg-dm-background shadow-xl text-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* View Area */}
            <div className="min-h-[500px]">
                {activeTab === 'settings' && renderSettingsTab()}
                {activeTab === 'logs' && renderLogsTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
            </div>
            
        </div>
    );
};

export default NotificationsManagementPage;
