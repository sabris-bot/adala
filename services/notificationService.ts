import { 
    SystemNotification, 
    NotificationType, 
    NotificationCategory, 
    NotificationPriority, 
    AdminTaskStatus, 
    LeaseAgreementStatus,
    ComplianceStatus,
    Hearing,
    AdminTask,
    NotificationLogEntry,
    NotificationChannel,
    SystemNotificationStatus
} from '../types';
import { mockLeaseAgreements } from './../data/propertyData';

// Custom Arabized classifications for 11 core categories
export enum ArabicCategory {
    SESSION = "إشعارات الجلسات",
    CALENDAR = "إشعارات التقويم",
    AUTOMATED_ROLL = "إشعارات الرول الآلي",
    CASE = "إشعارات القضايا",
    CONTRACT = "إشعارات العقود",
    EOS = "إشعارات نهاية الخدمة",
    HR = "إشعارات الموارد البشرية",
    FINANCE = "إشعارات الإدارة المالية",
    DOCUMENT = "إشعارات المستندات",
    APPROVAL = "إشعارات الاعتمادات",
    SYSTEM = "إشعارات النظام"
}

export interface ReminderOffsetSetting {
    key: string;
    label: string;
    minutes: number;
    enabled: boolean;
}

class NotificationService {
  private notifications: SystemNotification[] = [];
  private listeners: ((notifications: SystemNotification[]) => void)[] = [];
  private auditLogs: NotificationLogEntry[] = [];
  
  // Customizable offsets setting
  private reminderOffsets: ReminderOffsetSetting[] = [
    { key: '1h', label: 'قبل ساعة', minutes: 60, enabled: true },
    { key: '3h', label: 'قبل 3 ساعات', minutes: 180, enabled: false },
    { key: '6h', label: 'قبل 6 ساعات', minutes: 360, enabled: false },
    { key: '12h', label: 'قبل 12 ساعة', minutes: 720, enabled: false },
    { key: '24h', label: 'قبل 24 ساعة', minutes: 1440, enabled: true },
    { key: '2d', label: 'قبل يومين', minutes: 2880, enabled: true },
    { key: '1w', label: 'قبل أسبوع', minutes: 10080, enabled: false }
  ];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedNotifs = localStorage.getItem('adalalaw_notifications');
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      }
      
      const storedOffsets = localStorage.getItem('adalalaw_reminder_offsets');
      if (storedOffsets) {
        this.reminderOffsets = JSON.parse(storedOffsets);
      }

      const storedLogs = localStorage.getItem('adalalaw_notification_logs');
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        // Fallback or seed initial logs
        this.auditLogs = [
          { 
            id: 'L-init-1', 
            notificationType: NotificationType.GENERAL_ANNOUNCEMENT, 
            channel: NotificationChannel.SYSTEM, 
            recipient: 'جميع مستخدمي النظام', 
            dateTime: new Date(Date.now() - 3600000 * 2).toISOString(), 
            status: SystemNotificationStatus.VIEWED, 
            messagePreview: 'تم تهيئة وتدشين نظام الإشعارات المتزامن بالكامل مع رول الجلسات والتقويم الذكي.',
            reason: 'تشغيل النظام للمرة الأولى',
            relatedEntityTitle: 'حالة النظام'
          }
        ];
        this.saveLogs();
      }
    } catch (e) {
      console.error("Failed to load notification storage state", e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem('adalalaw_notifications', JSON.stringify(this.notifications));
    } catch (e) {
      console.error("Failed to save notifications", e);
    }
  }

  private saveOffsets() {
    try {
      localStorage.setItem('adalalaw_reminder_offsets', JSON.stringify(this.reminderOffsets));
    } catch (e) {
      console.error("Failed to save offsets", e);
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem('adalalaw_notification_logs', JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error("Failed to save audit logs", e);
    }
  }

  public getReminderOffsets(): ReminderOffsetSetting[] {
    return this.reminderOffsets;
  }

  public setReminderOffsets(offsets: ReminderOffsetSetting[]) {
    this.reminderOffsets = offsets;
    this.saveOffsets();
  }

  public toggleReminderOffset(key: string) {
    this.reminderOffsets = this.reminderOffsets.map(o => o.key === key ? { ...o, enabled: !o.enabled } : o);
    this.saveOffsets();
  }

  public getAuditLogs(): NotificationLogEntry[] {
    return this.auditLogs;
  }

  public clearAuditLogs() {
    this.auditLogs = [];
    this.saveLogs();
  }

  public addToAuditLog(log: Omit<NotificationLogEntry, 'id'>) {
    const newLog: NotificationLogEntry = {
      ...log,
      id: `L-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    this.auditLogs = [newLog, ...this.auditLogs].slice(0, 500); // limit to last 500 entries
    this.saveLogs();
  }

  /**
   * Core Two-Way Synchronization Engine
   * Synchronizes notifications dynamically reacting to the live tasks and hearings state in React Context.
   */
  public syncWithSystem(tasks: AdminTask[], hearings: Hearing[]) {
    const now = new Date();
    const syncedNotifs: SystemNotification[] = [];

    // --- 1. PROCESS CALENDAR HEARINGS & SESSION REMINDERS ---
    hearings.forEach(hearing => {
      // Event Date/Time
      const eventDateStr = hearing.date;
      const eventTimeStr = hearing.time || '09:00';
      const eventDateTime = new Date(`${eventDateStr}T${eventTimeStr}`);

      // If scheduled, check active reminder offsets
      if (hearing.status === 'Scheduled') {
        this.reminderOffsets.forEach(offset => {
          if (!offset.enabled) return;

          const diffMs = eventDateTime.getTime() - now.getTime();
          const diffMins = diffMs / (1000 * 60);

          // If current time is within or past the trigger threshold, and event hasn't started yet
          // E.g., if offset is 60 mins and time-to-event is <= 60 mins (and event is still in the future)
          if (diffMins > 0 && diffMins <= offset.minutes) {
            const notifId = `hearing-${hearing.id}-${offset.key}`;
            const timeDesc = offset.label;

            syncedNotifs.push({
              id: notifId,
              type: NotificationType.HEARING_REMINDER,
              category: NotificationCategory.REMINDER,
              categoryArabic: ArabicCategory.SESSION, // Arabized Category
              priority: NotificationPriority.HIGH,
              priorityArabic: 'عالي',
              title: `تذكير بجلسة قادمة (${timeDesc})`,
              message: `الجلسة "${hearing.caseTitle}" مستهدفة في القاعة ${hearing.courtRoomOrLocation || 'المحكمة'} خلال ${timeDesc} (الساعة ${eventTimeStr}).`,
              timestamp: now.toISOString(),
              isRead: false,
              relatedEntityId: hearing.id,
              actionUrl: '/docket',
              source: 'نظام التقويم ورول الجلسات',
              eventDate: eventDateStr,
              eventTime: eventTimeStr,
              typeArabic: 'تذكير بجلسة'
            } as any);
          }
        });
      }

      // If status completed or postponed, show corresponding notification
      if (hearing.status === 'Completed') {
        const notifId = `hearing-completed-${hearing.id}`;
        syncedNotifs.push({
          id: notifId,
          type: NotificationType.CASE_STATUS_UPDATED,
          category: NotificationCategory.INFORMATIONAL,
          categoryArabic: ArabicCategory.AUTOMATED_ROLL,
          priority: NotificationPriority.NORMAL,
          priorityArabic: 'عادي',
          title: 'جلسة قضائية مكتملة',
          message: `تم تدوين حضور الجلسة لـ "${hearing.caseTitle}" واستكمال حضور الرول الآلي بنجاح.`,
          timestamp: now.toISOString(),
          isRead: false,
          relatedEntityId: hearing.id,
          actionUrl: '/docket',
          source: 'الرول الآلي للمحاكم',
          eventDate: eventDateStr,
          eventTime: eventTimeStr,
          typeArabic: 'تحديث الجلسات'
        } as any);
      } else if (hearing.status === 'Postponed') {
        const notifId = `hearing-postponed-${hearing.id}`;
        syncedNotifs.push({
          id: notifId,
          type: NotificationType.CASE_STATUS_UPDATED,
          category: NotificationCategory.URGENT,
          categoryArabic: ArabicCategory.AUTOMATED_ROLL,
          priority: NotificationPriority.HIGH,
          priorityArabic: 'عالي',
          title: 'تأجيل جلسة قضائية',
          message: `تم اتخاذ قرار تأجيل الجلسة لـ "${hearing.caseTitle}" لـ: ${hearing.notes || 'قصور مستندات الخصم'}.`,
          timestamp: now.toISOString(),
          isRead: false,
          relatedEntityId: hearing.id,
          actionUrl: '/docket',
          source: 'الرول الآلي للمحاكم',
          eventDate: eventDateStr,
          eventTime: eventTimeStr,
          typeArabic: 'تحديث الجلسات'
        } as any);
      }
    });

    // --- 2. PROCESS TASKS ---
    tasks.forEach(task => {
      if (task.status !== AdminTaskStatus.COMPLETED && task.status !== AdminTaskStatus.CANCELLED) {
        const dueDate = new Date(task.dueDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
          // Overdue task alert
          const notifId = `task-overdue-${task.id}`;
          syncedNotifs.push({
            id: notifId,
            type: NotificationType.TASK_OVERDUE_ALERT,
            category: NotificationCategory.URGENT,
            categoryArabic: task.relatedCaseId ? ArabicCategory.CASE : ArabicCategory.CALENDAR,
            priority: NotificationPriority.URGENT,
            priorityArabic: 'عاجل جداً',
            title: 'مهمة مكتبية متأخرة!',
            message: `المهمة "${task.title}" تجاوزت موعد استحقاقها المحدد (${task.dueDate}) وبحاجة للإنجاز الفوري.`,
            timestamp: now.toISOString(),
            isRead: false,
            relatedEntityId: task.id,
            actionUrl: '/tasks',
            source: 'منظومة المهام القانونية',
            eventDate: task.dueDate,
            eventTime: '15:00',
            typeArabic: 'مهمة متأخرة'
          } as any);
        } else if (diffDays <= 2) {
          // Due soon task
          const notifId = `task-due-soon-${task.id}`;
          syncedNotifs.push({
            id: notifId,
            type: NotificationType.TASK_DUE_REMINDER,
            category: NotificationCategory.REMINDER,
            categoryArabic: task.relatedCaseId ? ArabicCategory.CASE : ArabicCategory.CALENDAR,
            priority: NotificationPriority.HIGH,
            priorityArabic: 'عالي',
            title: 'اقتراب تسليم مهمة',
            message: `المهمة النشطة "${task.title}" تستحق التسليم قريباً خلال أقل من 48 ساعة (${task.dueDate}).`,
            timestamp: now.toISOString(),
            isRead: false,
            relatedEntityId: task.id,
            actionUrl: '/tasks',
            source: 'منظومة المهام القانونية',
            eventDate: task.dueDate,
            eventTime: '15:00',
            typeArabic: 'تذكير مهمة'
          } as any);
        }
      }
    });

    // --- 3. LEASES & CONTRACTS EXPIRY ---
    mockLeaseAgreements.forEach(lease => {
      if (lease.status === LeaseAgreementStatus.ACTIVE) {
        const endDate = new Date(lease.endDate);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 30 && diffDays > 0) {
          const notifId = `lease-exp-${lease.id}`;
          syncedNotifs.push({
            id: notifId,
            type: NotificationType.LEASE_EXPIRY_APPROACHING,
            category: NotificationCategory.IMPORTANT,
            categoryArabic: ArabicCategory.CONTRACT,
            priority: NotificationPriority.HIGH,
            priorityArabic: 'عالي',
            title: 'اقتراب انتهاء عقد الإيجار للمقر',
            message: `العقد التأجيري رقم ${lease.contractNumber} سينتهي قريباً في ${lease.endDate} (${diffDays} يوم متبقي على الإخلاء/التجديد).`,
            timestamp: now.toISOString(),
            isRead: false,
            relatedEntityId: lease.id,
            actionUrl: '/properties',
            source: 'إدارة أصول المكتب وحجوزات العقود',
            eventDate: lease.endDate,
            eventTime: '12:00',
            typeArabic: 'تجديد عقود'
          } as any);
        }
      }
    });

    // --- 4. REAL HR, END OF SERVICE, FINANCIALS & APPROVALS (Static & Event triggered Seeds) ---
    // Seed real notifications for leaves, financial installments, end-of-service, & documents warning so we always cover all 11 core categories!
    
    // HR & Approvals (أجازات وقروض نشطة للمصادقة عمالياً)
    syncedNotifs.push({
      id: "hr-leave-approval-101",
      type: NotificationType.NEW_LEAVE_REQUEST_FOR_APPROVAL,
      category: NotificationCategory.ADMINISTRATIVE,
      categoryArabic: ArabicCategory.HR,
      priority: NotificationPriority.NORMAL,
      priorityArabic: 'عادي',
      title: 'طلب إجازة سنوية جديد للموافقة',
      message: 'قام الموكل/الموظف (م. أحمد مرزوق) بتقديم طلب إجازة سنوية مدتها 14 يوماً معلق بانتظار توقيع الشريك المسؤول.',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      isRead: false,
      relatedEntityId: "leave-101",
      actionUrl: "/leaves",
      source: "بوابة الموارد البشرية والاعتمادات",
      eventDate: "2026-07-01",
      typeArabic: "طلب إجازة"
    } as any);

    syncedNotifs.push({
      id: "approval-loan-202",
      type: NotificationType.NEW_LOAN_REQUEST_FOR_APPROVAL,
      category: NotificationCategory.ADMINISTRATIVE,
      categoryArabic: ArabicCategory.APPROVAL,
      priority: NotificationPriority.HIGH,
      priorityArabic: 'عالي',
      title: 'اعتماد طلب دفعة مالية/قرض عمالي',
      message: 'طلب موافقة عمالية على سلفة راتب مستحق للمحامي المتدرب بانتظار مصادقة الإدارة المباشرة للرواتب.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      isRead: false,
      relatedEntityId: "loan-202",
      actionUrl: "/leaves",
      source: "إدارة الاعتمادات والرقابة المباشرة",
      eventDate: "2026-06-25",
      typeArabic: "اعتماد مالي"
    } as any);

    // End Of Service (نهاية الخدمة والمستندات)
    syncedNotifs.push({
      id: "eos-reconciliation-303",
      type: NotificationType.DISCIPLINARY_ACTION_UPDATE,
      category: NotificationCategory.IMPORTANT,
      categoryArabic: ArabicCategory.EOS,
      priority: NotificationPriority.HIGH,
      priorityArabic: 'عالي',
      title: 'الخلاصة المالية لنهاية الخدمة معلقة',
      message: 'يرجى مراجعة وتصفية المستحقات عمالياً لملف الموظف المنتهية خدماته تمهيداً لطباعتها وتوقيعها رقمياً.',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      isRead: false,
      relatedEntityId: "eos-303",
      actionUrl: "/eos",
      source: "منظومة مستحقات نهاية الخدمة عمالياً",
      eventDate: "2026-06-30",
      typeArabic: "تسوية مستحقات"
    } as any);

    // Documents (المستندات)
    syncedNotifs.push({
      id: "doc-expiry-404",
      type: NotificationType.IMPORTANT_DOCUMENT_EXPIRY_WARNING,
      category: NotificationCategory.URGENT,
      categoryArabic: ArabicCategory.DOCUMENT,
      priority: NotificationPriority.URGENT,
      priorityArabic: 'عاجل جداً',
      title: 'تحذير انتهاء تصريح المهنة والتوثيقات',
      message: 'تبقت 15 يوماً فقط على سريان رخصة الشركة والتوكيل الكلي العام بجمعية المحامين الكويتية وقصر العدل.',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      isRead: false,
      relatedEntityId: "doc-404",
      actionUrl: "/legal-resource",
      source: "أرشيف المستندات والوكالات الرسمية",
      eventDate: "2026-06-28",
      typeArabic: "انتهاء مستند"
    } as any);

    // Finance (المالية)
    syncedNotifs.push({
      id: "fin-due-505",
      type: NotificationType.PAYMENT_DUE_REMINDER,
      category: NotificationCategory.IMPORTANT,
      categoryArabic: ArabicCategory.FINANCE,
      priority: NotificationPriority.NORMAL,
      priorityArabic: 'عادي',
      title: 'موعد استحقاق الدفعة القضائية الكلية',
      message: 'تذكير بضرورة استلام وتحصيل رسم أمانة المحكمة بقيمة 450 د.ك والمستحق على الموكل ورثة سالم الأنصاري.',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      isRead: false,
      relatedEntityId: "fin-505",
      actionUrl: "/finance",
      source: "الدائرة المالية والحسابات القضائية",
      eventDate: "2026-06-20",
      typeArabic: "تحصيل رسوم"
    } as any);

    // System (النظام)
    syncedNotifs.push({
      id: "sys-maintenance-606",
      type: NotificationType.SYSTEM_MAINTENANCE_NOTICE,
      category: NotificationCategory.INFORMATIONAL,
      categoryArabic: ArabicCategory.SYSTEM,
      priority: NotificationPriority.LOW,
      priorityArabic: 'منخفض',
      title: 'إشعار صيانة أسبوعية ذكية للنظام',
      message: 'ستجرى صيانة مجدولة لقاعدة بيانات الرول الآلي لتسريع قصر العدل غداً من الساعة 02:00 ص إلى 04:00 ص.',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      isRead: false,
      relatedEntityId: "sys-606",
      actionUrl: "/settings",
      source: "نظام التشغيل ومراقب الخادم الكوني",
      eventDate: "2026-06-14",
      typeArabic: "صيانة النظام"
    } as any);

    // --- 5. DETAILED MERGING & AUDIT LOGGING ---
    // Reconcile and merge results safely
    const previousNotifications = [...this.notifications];
    const newResolvedNotifications: SystemNotification[] = [];

    syncedNotifs.forEach(notif => {
      const existing = previousNotifications.find(p => p.id === notif.id);
      if (existing) {
        // Retain Read and Snoozed attributes of existing active notifications!
        newResolvedNotifications.push({
          ...notif,
          isRead: existing.isRead,
          isSnoozed: existing.isSnoozed,
          snoozedUntil: existing.snoozedUntil,
          isMuted: existing.isMuted
        });
      } else {
        // Newly generated notification! Log to the Notification Audit Tracker!
        newResolvedNotifications.push(notif);
        
        // Log to Audit Logger
        this.addToAuditLog({
          notificationType: notif.type,
          channel: NotificationChannel.SYSTEM,
          recipient: 'الشريك والمسؤول الإداري',
          dateTime: now.toISOString(),
          status: SystemNotificationStatus.SENT,
          subject: notif.title,
          messagePreview: notif.message,
          reason: `توليد تلقائي: تطابق شروط التنبيه (${notif.categoryArabic})`,
          relatedEntityId: notif.relatedEntityId,
          relatedEntityTitle: notif.title
        });
      }
    });

    // Check for deleted or orphaned events that were in previous notifications but NOT in current sync
    previousNotifications.forEach(oldNotif => {
      // Dynamic alerts e.g. starting with "hearing-" or "task-" or "lease-"
      const isDynamic = oldNotif.id.startsWith('hearing-') || oldNotif.id.startsWith('task-') || oldNotif.id.startsWith('lease-');
      const remainsActive = syncedNotifs.some(s => s.id === oldNotif.id);
      
      if (isDynamic && !remainsActive) {
        // Document this deletion in Audit Log (Very professional!)
        this.addToAuditLog({
          notificationType: oldNotif.type,
          channel: NotificationChannel.SYSTEM,
          recipient: 'أرشيف النظام التلقائي',
          dateTime: now.toISOString(),
          status: SystemNotificationStatus.VIEWED,
          subject: `إلغاء/حذف تذكير: ${oldNotif.title}`,
          messagePreview: 'تم تصفية وإزالة هذا الإشعار تلقائياً بعد حذف أو تعديل الحدث المصدر في التقويم الرول.',
          reason: 'سحب الحدث أو انتهاء الصلاحية وتحديث الحالة بالتقويم',
          relatedEntityId: oldNotif.relatedEntityId,
          relatedEntityTitle: oldNotif.title
        });
      }
    });

    // Replace and notify
    this.notifications = newResolvedNotifications;
    this.saveState();
    this.notifyListeners();
  }

  public getNotifications() {
    const now = new Date().getTime();
    return this.notifications.filter(n => {
        if (n.isMuted) return false;
        if (n.isSnoozed && n.snoozedUntil && new Date(n.snoozedUntil).getTime() > now) return false;
        return true;
    });
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => {
      if (n.id === id) {
        this.addToAuditLog({
          notificationType: n.type,
          channel: NotificationChannel.SYSTEM,
          recipient: 'الشريك المسؤول والمسجل',
          dateTime: new Date().toISOString(),
          status: SystemNotificationStatus.VIEWED,
          subject: `قراءة الإشعار: ${n.title}`,
          messagePreview: n.message,
          reason: 'تم الضغط والتأشير كمقروء من قبل المستخدم',
          relatedEntityId: n.relatedEntityId,
          relatedEntityTitle: n.title
        });
        return { ...n, isRead: true };
      }
      return n;
    });
    this.saveState();
    this.notifyListeners();
  }

  public addNotification(notif: { title: string; message: string; category: keyof typeof NotificationCategory; priority: keyof typeof NotificationPriority; relatedId?: string }) {
    const newNotif: SystemNotification = {
        id: `manual-${Date.now()}`,
        type: NotificationType.GENERAL_ANNOUNCEMENT,
        category: NotificationCategory[notif.category],
        categoryArabic: ArabicCategory.SYSTEM,
        priority: NotificationPriority[notif.priority],
        title: notif.title,
        message: notif.message,
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedEntityId: notif.relatedId,
        source: 'إضافة يدوية من مسؤول النظام'
    } as any;
    
    this.notifications = [newNotif, ...this.notifications];
    this.saveState();

    this.addToAuditLog({
      notificationType: NotificationType.GENERAL_ANNOUNCEMENT,
      channel: NotificationChannel.SYSTEM,
      recipient: 'نظام الإشعار المباشر',
      dateTime: new Date().toISOString(),
      status: SystemNotificationStatus.SENT,
      subject: notif.title,
      messagePreview: notif.message,
      reason: 'إضافة يدوية فورية وإشراك للموظفين',
      relatedEntityId: notif.relatedId,
      relatedEntityTitle: notif.title
    });

    this.notifyListeners();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => {
      if (!n.isRead) {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.saveState();
    
    this.addToAuditLog({
      notificationType: NotificationType.GENERAL_ANNOUNCEMENT,
      channel: NotificationChannel.SYSTEM,
      recipient: 'الشغالين والشركاء',
      dateTime: new Date().toISOString(),
      status: SystemNotificationStatus.VIEWED,
      subject: 'تحديد كافة التنبيهات كمقروءة دفعة واحدة',
      messagePreview: 'قراءة جماعية من واجهة المستخدم السريعة',
      reason: 'تصفية العداد وقراءة الكل عاجلاً'
    });

    this.notifyListeners();
  }

  public deleteNotification(id: string) {
    const target = this.notifications.find(n => n.id === id);
    if (target) {
      this.addToAuditLog({
        notificationType: target.type,
        channel: NotificationChannel.SYSTEM,
        recipient: 'صندوق المهملات',
        dateTime: new Date().toISOString(),
        status: SystemNotificationStatus.VIEWED,
        subject: `حذف إشعار: ${target.title}`,
        messagePreview: target.message,
        reason: 'حذف يدوي مباشر من قبل المنسق الإداري',
        relatedEntityId: target.relatedEntityId,
        relatedEntityTitle: target.title
      });
    }

    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveState();
    this.notifyListeners();
  }

  public snoozeNotification(id: string, minutes: number = 30) {
    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    this.notifications = this.notifications.map(n => {
        if (n.id === id) {
          this.addToAuditLog({
            notificationType: n.type,
            channel: NotificationChannel.SYSTEM,
            recipient: 'مؤجل المواعيد',
            dateTime: new Date().toISOString(),
            status: SystemNotificationStatus.VIEWED,
            subject: `صوت الخمول لتنبيه: ${n.title}`,
            messagePreview: `تم الإغفاء لمدّة ${minutes} دقيقة حتى ${new Date(snoozeTime).toLocaleTimeString()}`,
            reason: 'غلق مؤقت من لوحة التحكم لتأجيل الإشعار لاحقاً',
            relatedEntityId: n.relatedEntityId,
            relatedEntityTitle: n.title
          });
          return { ...n, isSnoozed: true, snoozedUntil: snoozeTime };
        }
        return n;
    });
    this.saveState();
    this.notifyListeners();
  }

  public subscribe(listener: (notifications: SystemNotification[]) => void) {
    this.listeners.push(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const activeNotifications = this.getNotifications();
    this.listeners.forEach(l => l(activeNotifications));
  }
}

export const notificationService = new NotificationService();
