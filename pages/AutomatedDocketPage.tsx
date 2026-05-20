
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
} from 'date-fns';
import { ar } from 'date-fns/locale';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select'; 
import TextArea from '../components/ui/TextArea'; 
import Modal from '../components/ui/Modal'; 
import { Hearing, Case, ExpertField, ExpertActionStatus, CourtLevel } from '../types';
import { useCaseTask } from '../components/CaseTaskContext';
import { initialCases } from '../data/caseData';
import { 
    ListBulletIcon, 
    CalendarDaysIcon, 
    PrinterIcon, 
    MagnifyingGlassIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon, 
    EyeIcon, 
    PencilIcon, 
    BriefcaseIcon,
    PlusCircleIcon, 
    UserGroupIcon, 
    ClockIcon,
    CalculatorIcon,
    ScaleIcon,
    GavelIcon,
    InformationCircleIcon,
    HomeIcon,
    BuildingLibraryIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    ShareIcon
} from '../constants';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, ExpertActionStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';

// --- Types ---
interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description?: string;
    attendees?: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

// Unified interface for display
interface ScheduleEvent {
    id: string;
    type: 'Hearing' | 'Appointment';
    date: string;
    time: string;
    title: string;
    subtitle?: string; // Client name for hearings, attendees for appointments
    location: string;
    status: string;
    notes?: string;
    rawSource: Hearing | Appointment;
}

// --- Enhanced Mock Data Generation ---
// Exported to be used by App.tsx for global notifications
export const generateMockHearings = (): Hearing[] => {
    const today = new Date();
    const hearings: Hearing[] = [];
    const casesSource = [...initialCases, ...initialCases, ...initialCases];

    // 1. Standard Mock Data
    casesSource.forEach((caseItem, index) => {
        const offset = Math.floor((index - casesSource.length / 2) * 2);
        const hearingDate = new Date(today);
        hearingDate.setDate(today.getDate() + offset);
        
        if (hearingDate.getDay() === 5) hearingDate.setDate(hearingDate.getDate() + 2);
        if (hearingDate.getDay() === 6) hearingDate.setDate(hearingDate.getDate() + 1);

        const hour = 9 + (index % 4);
        const minute = (index * 15) % 60;
        const hearingTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const hearingDateTime = new Date(hearingDate);
        hearingDateTime.setHours(hour, minute);

        let status: Hearing['status'] = 'Scheduled';
        if (hearingDateTime < new Date()) {
            status = index % 5 === 0 ? 'Postponed' : (index % 7 === 0 ? 'Cancelled' : 'Completed');
        }

        hearings.push({
            id: `h-docket-${index}`, // Stable ID based on index
            caseId: caseItem.id,
            caseTitle: caseItem.title,
            clientName: caseItem.clientName,
            date: hearingDate.toISOString().split('T')[0],
            time: hearingTime,
            courtRoomOrLocation: `${caseItem.courtName} - ${caseItem.courtLevel}`,
            type: index % 3 === 0 ? 'جلسة مرافعة' : (index % 3 === 1 ? 'تقديم مستندات' : 'النطق بالحكم'),
            status: status,
            notes: status === 'Postponed' ? 'تأجلت إدارياً.' : (status === 'Completed' ? 'تم الحضور.' : 'مدرجة بالرول.'),
            attendedBy: status === 'Completed' ? [caseItem.assignedLawyer] : [],
        });
    });

    // 2. INJECT TEST DATA FOR NOTIFICATIONS (24h and 1h)
    // We use stable IDs (no Date.now()) so the notification system can dedup them.
    const now = new Date();
    
    // Case A: Exactly 24 hours from now
    const tomorrowTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    hearings.push({
        id: `h-notify-24h-static`, 
        caseId: '1',
        caseTitle: 'جلسة تجربة تنبيه 24 ساعة',
        clientName: 'النظام الآلي',
        date: tomorrowTime.toISOString().split('T')[0],
        time: `${String(tomorrowTime.getHours()).padStart(2, '0')}:${String(tomorrowTime.getMinutes()).padStart(2, '0')}`,
        courtRoomOrLocation: 'قاعة الاختبار 1',
        type: 'جلسة تنبيه',
        status: 'Scheduled',
        notes: 'هذه جلسة اختبار لتنبيه 24 ساعة.',
    });

    // Case B: Exactly 1 hour from now
    const nextHourTime = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    hearings.push({
        id: `h-notify-1h-static`,
        caseId: '2',
        caseTitle: 'جلسة تجربة تنبيه 1 ساعة',
        clientName: 'النظام الآلي',
        date: nextHourTime.toISOString().split('T')[0],
        time: `${String(nextHourTime.getHours()).padStart(2, '0')}:${String(nextHourTime.getMinutes()).padStart(2, '0')}`,
        courtRoomOrLocation: 'قاعة الاختبار 2',
        type: 'جلسة عاجلة',
        status: 'Scheduled',
        notes: 'هذه جلسة اختبار لتنبيه 1 ساعة.',
    });

    return hearings.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
};

const mockInitialAppointments: Appointment[] = [
    { id: 'apt-1', title: 'اجتماع مع الموكل (شركة الأمل)', date: new Date().toISOString().split('T')[0], time: '11:00', location: 'المكتب الرئيسي - قاعة الاجتماعات', description: 'مناقشة استراتيجية القضية الجديدة', status: 'Scheduled', attendees: 'أحمد محمود, ممثل الشركة' },
    { id: 'apt-2', title: 'زيارة لوزارة العدل - إدارة التوثيق', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '09:00', location: 'مجمع الوزارات', description: 'توثيق وكالة عامة', status: 'Scheduled', attendees: 'المندوب محمد' },
];

const allMockHearings = generateMockHearings();

// --- Components for Modals ---

const AppointmentFormModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (apt: Appointment) => void;
    initialData?: Appointment | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<Appointment>>(
        initialData || {
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            status: 'Scheduled'
        }
    );

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { date: new Date().toISOString().split('T')[0], time: '10:00', status: 'Scheduled' });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.title || !formData.date || !formData.time) {
            addToast({
                type: 'warning',
                title: 'تنبيه',
                message: t('fill_required_fields', { defaultValue: 'يرجى تعبئة الحقول الأساسية (العنوان، التاريخ، الوقت)' })
            });
            return;
        }
        onSubmit({
            ...formData,
            id: formData.id || `apt-${Date.now()}`
        } as Appointment);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? t('edit_appointment', { defaultValue: 'تعديل موعد' }) : t('add_new_appointment', { defaultValue: 'إضافة موعد جديد' })} size="md">
            <form onSubmit={handleSubmit} className="space-y-3">
                <Input label={t('appointment_title', { defaultValue: 'عنوان الموعد / الاجتماع' })} name="title" value={formData.title || ''} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-3">
                    <Input label={t('date', { defaultValue: 'التاريخ' })} type="date" name="date" value={formData.date || ''} onChange={handleChange} required />
                    <Input label={t('time', { defaultValue: 'الوقت' })} type="time" name="time" value={formData.time || ''} onChange={handleChange} required />
                </div>
                <Input label={t('location', { defaultValue: 'المكان' })} name="location" value={formData.location || ''} onChange={handleChange} />
                <Input label={t('attendees', { defaultValue: 'الحضور (أسماء)' })} name="attendees" value={formData.attendees || ''} onChange={handleChange} />
                <TextArea label={t('details_agenda', { defaultValue: 'التفاصيل / الأجندة' })} name="description" value={formData.description || ''} onChange={handleChange} rows={3} />
                <Select label={t('status', { defaultValue: 'الحالة' })} name="status" value={formData.status} onChange={handleChange} options={[{value:'Scheduled', label: t('scheduled', { defaultValue: 'مجدول' })}, {value:'Completed', label: t('completed', { defaultValue: 'تم' })}, {value:'Cancelled', label: t('cancelled', { defaultValue: 'ملغي' })}]} />
                
                <div className="flex justify-end pt-3 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                    <Button type="submit">{initialData ? t('save_changes', { defaultValue: 'حفظ التعديلات' }) : t('add_appointment', { defaultValue: 'إضافة الموعد' })}</Button>
                </div>
            </form>
        </Modal>
    );
};

const ViewEventModal: React.FC<{ event: ScheduleEvent | null; onClose: () => void }> = ({ event, onClose }) => {
    const { t, i18n } = useTranslation();
    if (!event) return null;
    
    const isHearing = event.type === 'Hearing';
    const relatedCase = isHearing ? initialCases.find(c => c.id === (event.rawSource as Hearing).caseId) : null;

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <Modal isOpen={!!event} onClose={onClose} title={isHearing ? t('hearing_details', { defaultValue: 'تفاصيل الجلسة' }) : t('appointment_details', { defaultValue: 'تفاصيل الموعد' })} size="lg">
            <div id="printable-event-details" className="space-y-4 p-2">
                <div className="text-center border-b pb-4 mb-4 hidden print:block">
                    <h2 className="text-xl font-bold">{isHearing ? t('court_hearing_card', { defaultValue: 'بطاقة جلسة محكمة' }) : t('appointment_card', { defaultValue: 'بطاقة موعد' })}</h2>
                </div>
                
                <div className={`p-4 rounded-lg border-s-4 mb-4 ${isHearing ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'}`}>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-sm opacity-80">{event.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card title={t('details', { defaultValue: 'التفاصيل' })} className="bg-gray-50" titleClassName="text-sm">
                        <p className="text-sm mb-2"><strong>{t('date', { defaultValue: 'التاريخ' })}:</strong> {event.date}</p>
                        <p className="text-sm mb-2"><strong>{t('time', { defaultValue: 'الوقت' })}:</strong> {event.time}</p>
                        <p className="text-sm mb-2"><strong>{t('location', { defaultValue: 'المكان' })}:</strong> {event.location}</p>
                        <p className="text-sm mb-2"><strong>{t('status', { defaultValue: 'الحالة' })}:</strong> {event.status}</p>
                    </Card>
                    
                    {isHearing && relatedCase && (
                        <Card title={t('related_case_data', { defaultValue: 'بيانات القضية المرتبطة' })} className="bg-gray-50" titleClassName="text-sm">
                            <p className="text-sm mb-2"><strong>{t('case_number', { defaultValue: 'رقم القضية' })}:</strong> {relatedCase.caseNumber}</p>
                            <p className="text-sm mb-2"><strong>{t('client', { defaultValue: 'الموكل' })}:</strong> {relatedCase.clientName}</p>
                            <p className="text-sm mb-2"><strong>{t('opponent', { defaultValue: 'الخصم' })}:</strong> {relatedCase.opposingPartyName}</p>
                            <p className="text-sm mb-2"><strong>{t('lawyer', { defaultValue: 'المحامي' })}:</strong> {relatedCase.assignedLawyer}</p>
                        </Card>
                    )}
                    
                    {!isHearing && (event.rawSource as Appointment).attendees && (
                        <Card title={t('attendees', { defaultValue: 'الحضور' })} className="bg-gray-50" titleClassName="text-sm">
                            <p className="text-sm">{(event.rawSource as Appointment).attendees}</p>
                        </Card>
                    )}
                </div>

                {event.notes && (
                    <Card title={t('notes_description', { defaultValue: 'ملاحظات / وصف' })}>
                        <p className="text-sm">{event.notes}</p>
                    </Card>
                )}
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse mt-4 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>{t('close', { defaultValue: 'إغلاق' })}</Button>
                <Button onClick={handlePrint} leftIcon={<PrinterIcon className="w-4"/>}>{t('print_details', { defaultValue: 'طباعة التفاصيل' })}</Button>
            </div>
        </Modal>
    );
};

// --- Calendar Components ---

const MonthView: React.FC<{
    currentDate: Date;
    events: ScheduleEvent[];
    onEventClick: (event: ScheduleEvent) => void;
}> = ({ currentDate, events, onEventClick }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    return (
        <div className="bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-7 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                {weekDays.map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-l last:border-l-0 dark:border-gray-800">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr h-[650px]">
                {calendarDays.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div 
                            key={idx} 
                            className={`min-h-[110px] p-2 border-l border-b last:border-l-0 dark:border-gray-800 transition-all group relative ${
                                !isCurrentMonth ? 'bg-gray-50/30 dark:bg-gray-900/10 opacity-30 pointer-events-none' : 'bg-white dark:bg-dm-card hover:bg-gray-50/50 dark:hover:bg-gray-800/20'
                            } ${isToday ? 'z-10' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                                    isToday 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                        : 'text-gray-400 group-hover:text-primary'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && isCurrentMonth && (
                                    <div className="flex -space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-hide">
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-bold truncate cursor-pointer transition-all hover:translate-y-[-1px] shadow-sm hover:shadow-md border ${
                                            event.type === 'Hearing' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'
                                        }`}
                                    >
                                        <span className="opacity-60 tabular-nums font-mono me-1">{event.time}</span>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const WeekView: React.FC<{
    currentDate: Date;
    events: ScheduleEvent[];
    onEventClick: (event: ScheduleEvent) => void;
}> = ({ currentDate, events, onEventClick }) => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({
        start: startDate,
        end: endOfWeek(startDate, { weekStartsOn: 0 }),
    });

    return (
        <div className="bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-7 h-[650px] divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                {weekDays.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={idx} className={`flex flex-col transition-colors ${isToday ? 'bg-primary/[0.02] dark:bg-primary/[0.05]' : 'bg-white dark:bg-dm-card'}`}>
                            <div className={`p-5 border-b dark:border-gray-800 text-center relative ${isToday ? 'bg-primary/[0.03]' : 'bg-gray-50/30'}`}>
                                {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />}
                                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                                    {format(day, 'EEEE', { locale: ar })}
                                </div>
                                <div className={`text-2xl font-black mx-auto w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                                    isToday 
                                        ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' 
                                        : 'text-gray-800 dark:text-white group-hover:scale-110'
                                }`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="mt-2 text-[9px] font-bold text-gray-300 tracking-tighter">
                                    {format(day, 'MMM yyyy', { locale: ar })}
                                </div>
                            </div>
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
                                {dayEvents.length === 0 ? (
                                    <div className="h-full flex items-center justify-center opacity-10">
                                        <div className="text-center">
                                            <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">فارغ</p>
                                        </div>
                                    </div>
                                ) : (
                                    dayEvents.map(event => (
                                        <div 
                                            key={event.id}
                                            onClick={() => onEventClick(event)}
                                            className={`p-3.5 rounded-2xl border-r-4 shadow-sm cursor-pointer transition-all hover:translate-x-1 hover:shadow-md active:scale-95 group ${
                                                event.type === 'Hearing' 
                                                    ? 'bg-blue-50/50 border-blue-500 text-blue-900 hover:bg-blue-100/70 dark:bg-blue-900/10 dark:text-blue-100 dark:border-blue-800' 
                                                    : 'bg-emerald-50/50 border-emerald-500 text-emerald-900 hover:bg-emerald-100/70 dark:bg-emerald-900/10 dark:text-emerald-100 dark:border-emerald-800'
                                            }`}
                                        >
                                            <div className="text-[10px] font-black opacity-60 uppercase mb-2 flex items-center justify-between">
                                                <span className="font-mono tabular-nums">{event.time}</span>
                                                <div className={`p-1 rounded-md ${event.type === 'Hearing' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-emerald-100 dark:bg-emerald-800'}`}>
                                                    {event.type === 'Hearing' ? <GavelIcon className="w-3 h-3"/> : <UsersIcon className="w-3 h-3"/>}
                                                </div>
                                            </div>
                                            <h5 className="text-[11px] font-black leading-tight line-clamp-3 mb-2 group-hover:text-primary transition-colors">{event.title}</h5>
                                            <div className="flex items-center gap-1.5 text-[9px] opacity-70 font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Page ---
type ViewMode = 'day' | 'week' | 'month';
type TabType = 'roll' | 'experts' | 'deadlines';

const AutomatedDocketPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { hearings, updateHearingStatus } = useCaseTask();
    const [activeTab, setActiveTab] = useState<TabType>('roll');
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [filterType, setFilterType] = useState<'all' | 'hearings' | 'appointments'>('all');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    
    // Data State
    const [appointments, setAppointments] = useState<Appointment[]>(mockInitialAppointments);
    
    // Modals State
    const [viewEvent, setViewEvent] = useState<ScheduleEvent | null>(null);
    const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
    const [isAptModalOpen, setIsAptModalOpen] = useState(false);

    // --- Deadline Calculator State ---
    const [dlStartDate, setDlStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dlDistance, setDlDistance] = useState<number>(0);
    const [dlCustomDays, setDlCustomDays] = useState<number>(0);

    // --- Expert Meetings View State ---
    const expertMeetings = useMemo(() => {
        const meetings: any[] = [];
        initialCases.forEach(c => {
            if (c.expertActions) {
                c.expertActions.forEach(action => {
                    meetings.push({
                        ...action,
                        caseId: c.id,
                        caseTitle: c.title,
                        caseNumber: c.caseNumber,
                        clientName: c.clientName,
                        lawyer: c.assignedLawyer
                    });
                });
            }
        });
        return meetings;
    }, []);

    // --- Combine Data into Unified Events ---
    const allEvents: ScheduleEvent[] = useMemo(() => {
        const hearingEvents: ScheduleEvent[] = hearings.map(h => ({
            id: h.id,
            type: 'Hearing',
            date: h.date,
            time: h.time || '00:00',
            title: `${initialCases.find(c => c.id === h.caseId)?.caseNumber || ''} - ${h.caseTitle}`,
            subtitle: `${t('client', { defaultValue: 'الموكل' })}: ${h.clientName}`,
            location: h.courtRoomOrLocation || t('undefined', { defaultValue: 'غير محدد' }),
            status: h.status === 'Scheduled' ? t('scheduled_f', { defaultValue: 'مجدولة' }) : h.status === 'Completed' ? t('completed_f', { defaultValue: 'منتهية' }) : h.status === 'Postponed' ? t('postponed_f', { defaultValue: 'مؤجلة' }) : t('cancelled_f', { defaultValue: 'ملغاة' }),
            notes: h.notes,
            rawSource: h
        }));

        const aptEvents: ScheduleEvent[] = appointments.map(a => ({
            id: a.id,
            type: 'Appointment',
            date: a.date,
            time: a.time,
            title: a.title,
            subtitle: a.attendees ? `${t('attendees', { defaultValue: 'الحضور' })}: ${a.attendees}` : undefined,
            location: a.location || t('undefined', { defaultValue: 'غير محدد' }),
            status: a.status === 'Scheduled' ? t('scheduled', { defaultValue: 'مجدول' }) : a.status === 'Completed' ? t('completed', { defaultValue: 'تم' }) : t('cancelled', { defaultValue: 'ملغي' }),
            notes: a.description,
            rawSource: a
        }));

        return [...hearingEvents, ...aptEvents].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    }, [hearings, appointments, t]);

    // --- Navigation Handlers ---
    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (viewMode === 'month') {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const getRangeLabel = () => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        if (viewMode === 'day') {
            return currentDate.toLocaleDateString('ar-EG', { ...options, weekday: 'long' });
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        }
    };

    // --- Filtering Logic ---
    const searchFilteredEvents = useMemo(() => {
        let filtered = allEvents;
        
        // 0. Event Type Filter
        if (filterType === 'hearings') filtered = filtered.filter(e => e.type === 'Hearing');
        if (filterType === 'appointments') filtered = filtered.filter(e => e.type === 'Appointment');

        // 1. Text Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(query) ||
                e.subtitle?.toLowerCase().includes(query) ||
                e.location.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [allEvents, searchQuery, filterType]);

    const filteredEvents = useMemo(() => {
        let filtered = searchFilteredEvents;

        // 1. Time Range Filter (Only for List View / Day View)
        if (viewMode === 'day') {
            const dateStr = currentDate.toISOString().split('T')[0];
            filtered = filtered.filter(e => e.date === dateStr);
        }
        return filtered;
    }, [searchFilteredEvents, viewMode, currentDate]);

    // --- Grouping for Week/Month Views ---
    const groupedEvents = useMemo(() => {
        if (viewMode === 'day') return null;
        const groups: Record<string, ScheduleEvent[]> = {};
        filteredEvents.forEach(e => {
            if (!groups[e.date]) groups[e.date] = [];
            groups[e.date].push(e);
        });
        return Object.keys(groups).sort().map(date => ({
            date,
            events: groups[date]
        }));
    }, [filteredEvents, viewMode]);

    // --- Handlers ---
    const handleAddAppointment = () => {
        setEditAppointment(null);
        setIsAptModalOpen(true);
    };

    const handleSaveAppointment = (apt: Appointment) => {
        if (editAppointment) {
            setAppointments(prev => prev.map(a => a.id === apt.id ? apt : a));
        } else {
            setAppointments(prev => [...prev, apt]);
        }
        setIsAptModalOpen(false);
    };

    const handleExportCSV = () => {
        const headers = ['النوع', 'التاريخ', 'الوقت', 'العنوان', 'التفاصيل الفرعية', 'المكان', 'الحالة', 'ملاحظات'];
        const csvRows = filteredEvents.map(e => [
            e.type === 'Hearing' ? 'جلسة' : 'موعد',
            e.date,
            e.time,
            `"${e.title}"`,
            `"${e.subtitle || ''}"`,
            `"${e.location}"`,
            e.status,
            `"${e.notes || ''}"`
        ].join(','));

        const csvString = '\uFEFF' + [headers.join(','), ...csvRows].join('\n'); 
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `schedule_export_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    };

    // --- MOJ Link ---
    const openMojPortal = () => {
        window.open('https://www.moj.gov.kw/AR/Pages/default.aspx', '_blank');
    };

    const EventRow: React.FC<{ event: ScheduleEvent }> = ({ event }) => (
        <tr className="hover:bg-gray-50 border-b last:border-b-0 print:border-gray-300 break-inside-avoid">
            <td className="px-3 py-3 font-mono text-gray-700 text-center align-top">
                <div className="font-bold text-primary">{event.time}</div>
                <div className="text-[10px] text-gray-400 print:text-gray-600 uppercase font-bold tracking-tighter">
                    {event.type === 'Hearing' ? 'جلسة محكمة' : 'موعد داخلي'}
                </div>
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex items-start">
                    <div className={`p-2 rounded-lg me-3 mt-1 ${event.type === 'Hearing' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {event.type === 'Hearing' ? <GavelIcon className="w-4 h-4"/> : <UsersIcon className="w-4 h-4"/>}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 print:text-black leading-tight mb-1">{event.title}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">{event.subtitle}</span>
                            {event.type === 'Hearing' && (
                                <span className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-1 font-bold">
                                    <EyeIcon className="w-3 h-3"/> ملف القضية
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-3 py-3 text-sm max-w-xs truncate print:max-w-none print:whitespace-normal align-top" title={event.location}>
                <div className="flex items-center gap-1 text-gray-600">
                    <HomeIcon className="w-3 h-3 text-gray-400"/>
                    <span className="truncate">{event.location}</span>
                </div>
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex flex-col gap-1">
                    <Badge 
                        text={event.status} 
                        variant={
                            event.status === 'منتهية' || event.status === 'تم' || event.status === 'Completed' ? 'success' : 
                            event.status === 'مؤجلة' || event.status === 'Postponed' ? 'warning' : 
                            event.status === 'ملغاة' || event.status === 'ملغي' || event.status === 'Cancelled' ? 'danger' : 'primary'
                        } 
                        size="sm"
                    />
                    {event.type === 'Hearing' && event.status !== 'Completed' && event.status !== 'منتهية' && (
                        <button 
                            onClick={() => updateHearingStatus(event.id, 'Completed')}
                            className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 underline text-right transition-colors"
                        >
                            تم الحضور (أتمتة المهام)
                        </button>
                    )}
                </div>
            </td>
            <td className="px-3 py-3 text-[11px] text-gray-500 max-w-xs truncate print:max-w-none print:whitespace-normal align-top" title={event.notes}>
                {event.notes || '---'}
            </td>
            <td className="px-3 py-3 print:hidden align-top">
                <div className="flex space-x-1 space-x-reverse justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setViewEvent(event)} title="عرض وتفاصيل" className="!p-2">
                        <EyeIcon className="w-4 h-4 text-primary"/>
                    </Button>
                    {event.type === 'Appointment' && (
                        <Button variant="ghost" size="sm" onClick={() => { setEditAppointment(event.rawSource as Appointment); setIsAptModalOpen(true); }} title="تعديل" className="!p-2">
                            <PencilIcon className="w-4 h-4 text-yellow-600"/>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );

    const ExpertMeetingRow: React.FC<{ meeting: any }> = ({ meeting }) => (
        <tr className="hover:bg-gray-50 border-b last:border-b-0 transition-colors">
            <td className="px-4 py-4">
                <div className="font-bold text-gray-800">{meeting.caseTitle}</div>
                <div className="text-[10px] text-gray-500 font-mono">{meeting.caseNumber}</div>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <Badge text={meeting.expertField} variant="secondary" size="xs" />
                    <span className="text-sm font-bold text-gray-600">{meeting.expertName || 'غير محدد'}</span>
                </div>
            </td>
            <td className="px-4 py-4 text-xs max-w-xs truncate" title={meeting.assignedTask}>
                {meeting.assignedTask}
            </td>
            <td className="px-4 py-4">
                <div className="text-xs font-bold text-gray-700">{new Date(meeting.referralDate).toLocaleDateString('ar-EG')}</div>
                <div className="text-[10px] text-gray-400">تاريخ الإحالة</div>
            </td>
            <td className="px-4 py-4">
                <ExpertActionStatusBadge status={meeting.status} size="sm" />
            </td>
            <td className="px-4 py-4 text-left">
                <Button variant="ghost" size="sm" leftIcon={<EyeIcon className="w-4 h-4"/>}>التفاصيل</Button>
            </td>
        </tr>
    );

    // --- Deadline Helper Functions ---
    const isHoliday = (date: Date): string | null => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Key Kuwait Holidays (Simplified)
        const holidays: Record<number, {m: number, d: number, name: string}[]> = {
            2024: [
                {m: 1, d: 1, name: "رأس السنة"},
                {m: 2, d: 25, name: "اليوم الوطني"},
                {m: 2, d: 26, name: "يوم التحرير"}
            ],
            2025: [
                {m: 1, d: 1, name: "رأس السنة"},
                {m: 2, d: 25, name: "اليوم الوطني"},
                {m: 2, d: 26, name: "يوم التحرير"}
            ]
        };

        const h = holidays[year]?.find(h => h.m === month && h.d === day);
        if (h) return h.name;
        if (date.getDay() === 5) return "عطلة الجمعة";
        if (date.getDay() === 6) return "عطلة السبت";
        return null;
    };

    const calculateDeadlines = () => {
        if (!dlStartDate) return [];
        const procedures = [
            { label: 'استئناف حكم (مدني/تجاري)', days: 30, ref: 'مادة 129 مرافعات' },
            { label: 'استئناف حكم (مستعجل)', days: 15, ref: 'مادة 129 مرافعات' },
            { label: 'تمييز حكم (مدني/تجاري)', days: 60, ref: 'مادة 152 مرافعات' },
            { label: 'معارضة في حكم غيابي (مدني)', days: 8, ref: 'مادة 188 مرافعات' },
            { label: 'استئناف جزائي', days: 20, ref: 'مادة 202 إجراءات' },
        ];

        return procedures.map(p => {
            let resDate = new Date(dlStartDate);
            // Day 1 is the next day after judgement (Art 17)
            resDate.setDate(resDate.getDate() + 1);
            // Add procedure days
            resDate.setDate(resDate.getDate() + p.days - 1);
            
            // Add Distance days (Art 16)
            if (dlDistance > 0) {
                resDate.setDate(resDate.getDate() + Math.ceil(dlDistance / 50));
            }

            // Extend if end falls on holiday/weekend (Art 18)
            while (isHoliday(resDate)) {
                resDate.setDate(resDate.getDate() + 1);
            }

            const diff = resDate.getTime() - new Date().getTime();
            const daysRem = Math.ceil(diff / (1000 * 60 * 60 * 24));

            return {
                ...p,
                finalDate: resDate,
                daysRemaining: daysRem,
                isExpired: daysRem < 0
            };
        });
    };

    const deadlineResults = useMemo(() => calculateDeadlines(), [dlStartDate, dlDistance, dlCustomDays]);

    return (
        <div className="space-y-6 pb-12">
            {/* Header Area */}
            <div className="bg-white dark:bg-dm-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 print:hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary/10 rounded-2xl me-4">
                            <ScaleIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 dark:text-white">{t('docket_system_title', { defaultValue: 'نظام الرول الآلي وإدارة المواعيد' })}</h1>
                            <p className="text-sm text-gray-500 font-bold">{t('docket_system_subtitle', { defaultValue: 'بوابة العدل الذكية لإدارة الجلسات والخبراء والمواعيد الإجرائية' })}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            onClick={openMojPortal} 
                            variant="outline" 
                            className="bg-white border-primary/20 text-primary hover:bg-primary/5"
                            leftIcon={<ShareIcon className="w-5 h-5"/>}
                        >
                            {t('moj_inquiry', { defaultValue: 'الاستعلام القضائي (MOJ)' })}
                        </Button>
                        <Button 
                            onClick={handleAddAppointment} 
                            variant="primary" 
                            className="shadow-lg shadow-primary/20"
                            leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
                        >
                            {t('add_new_appointment', { defaultValue: 'إضافة موعد جديد' })}
                        </Button>
                        <div className="flex border rounded-xl overflow-hidden bg-white dark:bg-dm-card">
                            <button onClick={() => setTimeout(() => window.print(), 350)} className="p-2 hover:bg-gray-100 text-gray-600 border-l" title={t('print', { defaultValue: 'طباعة' })}><PrinterIcon className="w-5 h-5"/></button>
                            <button onClick={handleExportCSV} className="p-2 hover:bg-gray-100 text-gray-600" title={t('export_excel', { defaultValue: 'تصدير Excel' })}><DocumentDuplicateIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-8 border-b border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={() => setActiveTab('roll')}
                        className={`px-6 py-3 text-sm font-black transition-all relative ${activeTab === 'roll' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {t('daily_roll_hearings', { defaultValue: 'الرول اليومي والجلسات' })}
                        {activeTab === 'roll' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"/>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('experts')}
                        className={`px-6 py-3 text-sm font-black transition-all relative ${activeTab === 'experts' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {t('expert_meetings', { defaultValue: 'جلسات الخبراء (Expert)' })}
                        <span className="ms-2 px-1.5 py-0.5 bg-gray-100 text-[10px] rounded-full text-gray-500 font-bold">{expertMeetings.length}</span>
                        {activeTab === 'experts' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"/>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('deadlines')}
                        className={`px-6 py-3 text-sm font-black transition-all relative ${activeTab === 'deadlines' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {t('procedural_deadlines_calculator', { defaultValue: 'حاسبة المواعيد الإجرائية' })}
                        {activeTab === 'deadlines' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"/>}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'roll' && (
                    <motion.div
                        key="roll-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Filters Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center print:hidden">
                            <div className="md:col-span-4 flex bg-white dark:bg-dm-card p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <button onClick={() => setViewMode('day')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'day' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{t('daily_roll', { defaultValue: 'رول يومي' })}</button>
                                <button onClick={() => setViewMode('week')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'week' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{t('weekly_roll', { defaultValue: 'رول أسبوعي' })}</button>
                                <button onClick={() => setViewMode('month')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{t('monthly_planner', { defaultValue: 'مخطط شهري' })}</button>
                            </div>

                            <div className="md:col-span-4 bg-white dark:bg-dm-card rounded-xl border border-gray-100 dark:border-gray-800 p-1 flex items-center justify-between shadow-sm">
                                <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-gray-50 rounded-lg text-primary"><span className="text-xl font-black">&gt;</span></button>
                                <span className="font-black text-gray-800 dark:text-gray-200 text-sm">{getRangeLabel()}</span>
                                <button onClick={() => navigateDate('next')} className="p-2 hover:bg-gray-50 rounded-lg text-primary"><span className="text-xl font-black">&lt;</span></button>
                            </div>
                            
                            <div className="md:col-span-4 relative">
                                <input 
                                    type="text" 
                                    className="w-full pr-10 pl-4 py-3 text-sm bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-bold" 
                                    placeholder={t('search_placeholder_docket', { defaultValue: 'ابحث عن رقم قضية، موكل، أو مكان...' })}
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>

                        {/* List / Calendar View Content */}
                        {viewMode === 'day' ? (
                            <div className="bg-white dark:bg-dm-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                {/* Filter Sub-Tabs */}
                                <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between print:hidden">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setFilterType('all')}
                                            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${filterType === 'all' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >{t('all', { defaultValue: 'الكل' })}</button>
                                        <button 
                                            onClick={() => setFilterType('hearings')}
                                            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${filterType === 'hearings' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        >{t('hearings_only', { defaultValue: 'الجلسات فقط' })}</button>
                                        <button 
                                            onClick={() => setFilterType('appointments')}
                                            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${filterType === 'appointments' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >{t('appointments_only', { defaultValue: 'المواعيد فقط' })}</button>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold">{t('showing_x_results', { count: filteredEvents.length, defaultValue: `عرض ${filteredEvents.length} نتيجة مختارة` })}</div>
                                </div>

                                {/* Print Header */}
                                <div className="hidden print:block p-8 border-b-2 border-black">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="text-right">
                                            <h2 className="text-2xl font-black mb-1">{t('report_for', { type: filterType === 'hearings' ? t('hearings_count', { defaultValue: 'الجلسات' }) : filterType === 'appointments' ? t('appointments_count', { defaultValue: 'المواعيد' }) : t('general_roll', { defaultValue: 'الرول العام' }), defaultValue: `كشف ${filterType === 'hearings' ? 'الجلسات' : filterType === 'appointments' ? 'المواعيد' : 'الرول العام'}` })}</h2>
                                            <p className="text-sm font-bold text-gray-600">{t('period', { defaultValue: 'الفترة' })}: {getRangeLabel()}</p>
                                        </div>
                                        <div className="p-4 border-2 border-black rounded-xl">
                                            <div className="text-center font-black text-xl mb-1">{t('justice', { defaultValue: 'عدالة' })}</div>
                                            <div className="text-[8px] uppercase tracking-widest font-bold">Kuwait Legal Management</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8 text-[10px] font-bold text-gray-500">
                                        <div>{t('print_date', { defaultValue: 'تاريخ الطباعة' })}: {new Date().toLocaleDateString('ar-EG')}</div>
                                        <div className="text-center">{t('by', { defaultValue: 'بواسطة' })}: {window.location.hostname}</div>
                                        <div className="text-left">{t('records_count', { defaultValue: 'عدد السجلات' })}: {filteredEvents.length}</div>
                                    </div>
                                </div>

                                {filteredEvents.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ClockIcon className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('no_current_records', { defaultValue: 'لا توجد سجلات حالية' })}</h3>
                                        <p className="text-sm text-gray-500">{t('try_changing_filters', { defaultValue: 'جرب تغيير التاريخ أو معايير البحث' })}</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-right">
                                            <thead className="bg-gray-50 dark:bg-dm-card border-b text-gray-500 dark:text-gray-400">
                                                <tr>
                                                    <th className="px-4 py-4 font-black">{t('time', { defaultValue: 'الوقت' })}</th>
                                                    <th className="px-4 py-4 font-black">{t('event_case_details', { defaultValue: 'تفاصيل الحدث / القضية' })}</th>
                                                    <th className="px-4 py-4 font-black">{t('location_court', { defaultValue: 'المكان / المحكمة' })}</th>
                                                    <th className="px-4 py-4 font-black">{t('admin_status', { defaultValue: 'الحالة الإدارية' })}</th>
                                                    <th className="px-4 py-4 font-black">{t('member_notes', { defaultValue: 'ملاحظات العضو' })}</th>
                                                    <th className="px-4 py-4 font-black text-left print:hidden">{t('actions', { defaultValue: 'إجراءات' })}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                                {filteredEvents.map(event => <EventRow key={event.id} event={event} />)}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : viewMode === 'week' ? (
                            <WeekView currentDate={currentDate} events={searchFilteredEvents} onEventClick={setViewEvent} />
                        ) : (
                            <MonthView currentDate={currentDate} events={searchFilteredEvents} onEventClick={setViewEvent} />
                        )}
                    </motion.div>
                )}

                {activeTab === 'experts' && (
                    <motion.div
                        key="experts-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Card title={t('manage_active_expert_meetings', { defaultValue: 'إدارة جلسات الخبراء النشطة' })} icon={<UsersIcon className="w-5 h-5 text-accent"/>}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-right">
                                    <thead className="bg-gray-50 dark:bg-dm-card border-b text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-3">{t('case', { defaultValue: 'القضية' })}</th>
                                            <th className="px-4 py-3">{t('expert_field_name', { defaultValue: 'تخصص الخبرة / الخبير' })}</th>
                                            <th className="px-4 py-3">{t('assigned_task', { defaultValue: 'المهمة الموكلة' })}</th>
                                            <th className="px-4 py-3">{t('referral_date', { defaultValue: 'تاريخ الإحالة' })}</th>
                                            <th className="px-4 py-3">{t('status', { defaultValue: 'الحالة' })}</th>
                                            <th className="px-4 py-3 text-left">{t('actions', { defaultValue: 'إجراءات' })}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {expertMeetings.map(meeting => <ExpertMeetingRow key={meeting.id} meeting={meeting} />)}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex items-center gap-4">
                            <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0"/>
                            <div>
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">{t('legal_note_kuwait', { defaultValue: 'ملاحظة قانونية لمواطني الكويت' })}</h4>
                                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">{t('expert_department_compliance_note', { defaultValue: 'وفقاً لقانون الإثبات الكويتي، تلتزم إدارة الخبراء بتحديد الجلسات خلال المواعيد المحددة في قرار الندب. يرجى تزويد النظام بتقرير مسبق لمراجعة الدفوع القانونية قبل جلسة المناقشة.' })}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'deadlines' && (
                    <motion.div
                        key="deadlines-tab"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Calculation Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card title={t('deadline_calculation_criteria', { defaultValue: 'معايير حساب المواعيد' })} icon={<CalculatorIcon className="w-5 h-5 text-primary"/>}>
                                <div className="space-y-4">
                                    <Input 
                                        label={t('judgment_issuance_date', { defaultValue: 'تاريخ صدور الحكم' })}
                                        type="date" 
                                        value={dlStartDate} 
                                        onChange={e => setDlStartDate(e.target.value)}
                                        helperText={t('calculation_starts_next_day', { defaultValue: 'يبدأ الحساب من اليوم التالي وفق مادة 17 مرافعات' })}
                                    />
                                    <Input 
                                        label={t('client_distance_km', { defaultValue: 'مسافة الموكل (كم)' })}
                                        type="number" 
                                        value={dlDistance.toString()} 
                                        onChange={e => setDlDistance(parseInt(e.target.value) || 0)}
                                        placeholder={t('example_50km', { defaultValue: 'مثال: 50 كم' })}
                                    />
                                    <Input 
                                        label={t('custom_additional_days', { defaultValue: 'أيام إضافية مخصصة' })}
                                        type="number" 
                                        value={dlCustomDays.toString()} 
                                        onChange={e => setDlCustomDays(parseInt(e.target.value) || 0)}
                                        placeholder={t('example_7days', { defaultValue: 'مثال: 7 أيـام' })}
                                    />
                                    <div className="p-4 bg-gray-50 dark:bg-dm-card border-r-4 border-primary rounded-lg text-xs space-y-2">
                                        <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                                            <ScaleIcon className="w-4 h-4 text-primary"/>
                                            {t('important_legal_texts', { defaultValue: 'نصوص قانونية هامة:' })}
                                        </div>
                                        <p className="text-gray-500 italic">{t('article_16_distance_rule', { defaultValue: '"مادة 16: يضاف ميعاد مسافة يوم واحد لكل 50 كم"' })}</p>
                                        <p className="text-gray-500 italic">{t('article_18_holiday_extension', { defaultValue: '"مادة 18: يمتد الميعاد لأول يوم عمل إذا صادف عطلة رسمية"' })}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Results Area */}
                        <div className="lg:col-span-8 space-y-4">
                            <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <ArrowPathIcon className="w-5 h-5 text-primary"/> {t('inferred_legal_deadlines', { defaultValue: 'المواعيد القانونية المستنتجة' })}
                            </h3>
                            {deadlineResults.map((res, i) => (
                                <div key={i} className="bg-white dark:bg-dm-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:border-primary/40 transition-all">
                                    <div className="mb-4 md:mb-0">
                                        <div className="text-[10px] uppercase font-black text-primary-dark dark:text-primary-light tracking-tighter mb-1">{res.ref}</div>
                                        <h4 className="font-bold text-gray-800 dark:text-white">{res.label}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded font-mono font-bold text-gray-500 italic">{t('x_days_deadline', { count: res.days, defaultValue: `${res.days} يوماً ميعاد` })}</span>
                                            {dlDistance > 0 && <span className="text-[10px] text-accent font-bold">+{t('distance_deadline', { defaultValue: ' ميعاد مسافة' })}</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="text-center md:text-left flex flex-col items-center md:items-end">
                                        <div className="text-[10px] text-gray-400 font-bold mb-1">{t('final_expiry_deadline', { defaultValue: 'الموعد النهائي للسقوط' })}</div>
                                        <div className={`text-xl font-black ${res.isExpired ? 'text-red-500' : 'text-primary'}`}>
                                            {res.finalDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${res.isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400'}`}>
                                            {res.isExpired ? t('case_expired', { defaultValue: 'القضية تجاوزت الموعد' }) : t('days_remaining_before_expiry', { count: res.daysRemaining, defaultValue: `متبقي ${res.daysRemaining} يوماً قبل السقوط` })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" fullWidth className="border-2 border-dashed border-gray-200 dark:border-gray-800 mt-4 text-gray-400">{t('customize_new_deadline', { defaultValue: 'تخصيص ميعاد إضافي جديد' })}</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AppointmentFormModal isOpen={isAptModalOpen} onClose={() => setIsAptModalOpen(false)} onSubmit={handleSaveAppointment} initialData={editAppointment} />
            <ViewEventModal event={viewEvent} onClose={() => setViewEvent(null)} />
        </div>
    );
};

export default AutomatedDocketPage;
