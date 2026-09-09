import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../services/notificationService';
import { SystemNotification, NotificationPriority, NotificationCategory } from '../../types';
import { 
    XIcon, 
    BellAlertIcon, 
    ClockIcon, 
    CheckCircleIcon,
    TrashIcon,
    EyeIcon,
    Bars3Icon as InfoIcon
} from '../../constants';

const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe(setNotifications);
        return unsubscribe;
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        notificationService.markAsRead(id);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        notificationService.deleteNotification(id);
    };

    const handleSnooze = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        notificationService.snoozeNotification(id, 60); // Default 1 hour
    };

    const handleNotificationClick = (notif: SystemNotification) => {
        notificationService.markAsRead(notif.id);
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
        }
        onClose();
    };

    const getPriorityColor = (priority: NotificationPriority) => {
        switch (priority) {
            case NotificationPriority.URGENT: return 'text-rose-600 bg-rose-50 border-rose-100';
            case NotificationPriority.HIGH: return 'text-orange-600 bg-orange-50 border-orange-100';
            case NotificationPriority.NORMAL: return 'text-blue-600 bg-blue-50 border-blue-100';
            case NotificationPriority.LOW: return 'text-gray-500 bg-gray-50 border-gray-100';
            default: return 'text-gray-500 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div 
            ref={dropdownRef}
            className="absolute top-14 end-0 w-80 sm:w-96 bg-white dark:bg-dm-card rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-fade-in-down"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-dm-background/50">
                <h3 className="font-black text-sm text-gray-900 dark:text-dm-text flex items-center gap-2">
                    <BellAlertIcon className="w-4 h-4 text-primary" />
                    {t('notifications', { defaultValue: 'الإشعارات' })}
                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                        {notifications.filter(n => !n.isRead).length}
                    </span>
                </h3>
                <button 
                    onClick={() => { notificationService.markAllAsRead(); }}
                    className="text-[10px] font-bold text-primary hover:underline"
                >
                    {t('mark_all_read', { defaultValue: 'تحديد الكل كمقروء' })}
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-dm-background rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClockIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{t('no_new_notifications', { defaultValue: 'لا توجد إشعارات جديدة حالياً' })}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-dm-background cursor-pointer transition-all relative group ${!notif.isRead ? 'bg-primary/[0.02]' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getPriorityColor(notif.priority)}`}>
                                        {notif.category === NotificationCategory.URGENT ? <BellAlertIcon className="w-5 h-5" /> : <InfoIcon className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <span className="text-[10px] font-black text-primary/70 uppercase tracking-tighter">{notif.categoryArabic || notif.category}</span>
                                            <span className="text-[9px] text-gray-400 font-medium">{new Date(notif.timestamp).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h4 className={`text-xs font-bold truncate ${!notif.isRead ? 'text-gray-900 dark:text-dm-text' : 'text-gray-500'}`}>
                                            {notif.title}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                                            {notif.message}
                                        </p>

                                        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                            >
                                                <CheckCircleIcon className="w-3 h-3" />
                                                {t('mark_read', { defaultValue: 'مقروء' })}
                                            </button>
                                            <button 
                                                onClick={(e) => handleSnooze(notif.id, e)}
                                                className="text-[9px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <ClockIcon className="w-3 h-3" />
                                                {t('snooze', { defaultValue: 'تأجيل' })}
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(notif.id, e)}
                                                className="text-[9px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                                {t('delete', { defaultValue: 'حذف' })}
                                            </button>
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0 shadow-sm shadow-primary/40 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50/50 dark:bg-dm-background/50 border-t border-gray-100 dark:border-gray-800 text-center">
                <button 
                    onClick={() => { navigate('/notifications'); onClose(); }}
                    className="text-[10px] font-black text-gray-500 hover:text-primary transition-colors tracking-widest uppercase"
                >
                    {t('view_all_notifications', { defaultValue: 'عرض جميع الإشعارات' })}
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
