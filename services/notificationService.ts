
import { 
    SystemNotification, 
    NotificationType, 
    NotificationCategory, 
    NotificationPriority, 
    AdminTaskStatus, 
    LeaseAgreementStatus,
    ComplianceStatus
} from '../types';
import { initialMockTasks } from '../data/taskData';
import { generateMockHearings } from '../pages/AutomatedDocketPage';
import { mockLeaseAgreements } from './../data/propertyData';

class NotificationService {
  private notifications: SystemNotification[] = [];
  private listeners: ((notifications: SystemNotification[]) => void)[] = [];
  private snoozedIds: Set<string> = new Set();
  private mutedIds: Set<string> = new Set();

  constructor() {
    // Initial check
    this.checkNotifications();
    // Subsequent checks (e.g. every 5 minutes in a real app, here we might trigger manually)
    setInterval(() => this.checkNotifications(), 1000 * 60 * 5); 
  }

  public checkNotifications() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const newNotifications: SystemNotification[] = [];

    // 1. Check Tasks (Urgent/Overdue)
    initialMockTasks.forEach(task => {
      if (task.status !== AdminTaskStatus.COMPLETED && task.status !== AdminTaskStatus.CANCELLED) {
        const dueDate = new Date(task.dueDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
          newNotifications.push(this.createNotification(
            `task-overdue-${task.id}`,
            NotificationType.TASK_OVERDUE_ALERT,
            NotificationCategory.URGENT,
            NotificationPriority.URGENT,
            'مهمة متأخرة!',
            `المهمة "${task.title}" تجاوزت موعد استحقاقها (${task.dueDate}).`,
            task.id
          ));
        } else if (diffDays <= 1) {
          newNotifications.push(this.createNotification(
            `task-due-soon-${task.id}`,
            NotificationType.TASK_DUE_REMINDER,
            NotificationCategory.REMINDER,
            NotificationPriority.HIGH,
            'مهمة تستحق قريباً',
            `المهمة "${task.title}" تنتهي خلال 24 ساعة.`,
            task.id
          ));
        }
      }
    });

    // 2. Check Hearings (Upcoming/Urgent)
    const hearings = generateMockHearings();
    hearings.forEach(hearing => {
      if (hearing.status === 'Scheduled') {
        const hearingTime = new Date(`${hearing.date}T${hearing.time || '09:00'}`);
        const diffInHours = (hearingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffInHours > 0 && diffInHours <= 1) {
            newNotifications.push(this.createNotification(
              `hearing-critical-${hearing.id}`,
              NotificationType.HEARING_REMINDER,
              NotificationCategory.URGENT,
              NotificationPriority.URGENT,
              'جلسة تبدأ الآن تقريباً!',
              `الجلسة "${hearing.caseTitle}" تبدأ خلال أقل من ساعة في ${hearing.courtRoomOrLocation || 'المحكمة'}.`,
              hearing.id
            ));
        } else if (diffInHours > 0 && diffInHours <= 24) {
            newNotifications.push(this.createNotification(
              `hearing-soon-${hearing.id}`,
              NotificationType.HEARING_REMINDER,
              NotificationCategory.REMINDER,
              NotificationPriority.HIGH,
              'تذكير بجلسة غداً',
              `لديك جلسة "${hearing.caseTitle}" غداً الساعة ${hearing.time || '09:00'}.`,
              hearing.id
            ));
        }
      }
    });

    // 3. Lease Expiry
    mockLeaseAgreements.forEach(lease => {
        if (lease.status === LeaseAgreementStatus.ACTIVE) {
            const endDate = new Date(lease.endDate);
            const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays <= 30 && diffDays > 0) {
                newNotifications.push(this.createNotification(
                    `lease-exp-${lease.id}`,
                    NotificationType.LEASE_EXPIRY_APPROACHING,
                    NotificationCategory.IMPORTANT,
                    NotificationPriority.HIGH,
                    'اقتراب انتهاء عقد إيجار',
                    `العقد رقم ${lease.contractNumber} سينتهي في ${lease.endDate} (${diffDays} يوم متبقي).`,
                    lease.id
                ));
            }
        }
    });

    // Merge into local state
    newNotifications.forEach(notif => {
      const existing = this.notifications.find(n => n.id === notif.id);
      if (!existing) {
        this.notifications = [notif, ...this.notifications];
      }
    });

    this.notifyListeners();
  }

  private createNotification(
    id: string, 
    type: NotificationType, 
    category: NotificationCategory, 
    priority: NotificationPriority,
    title: string, 
    message: string,
    relatedId?: string
  ): SystemNotification {
    return {
        id,
        type,
        category,
        priority,
        title,
        message,
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedEntityId: relatedId
    };
  }

  public getNotifications() {
    // Filter out snoozed or muted
    const now = new Date().getTime();
    return this.notifications.filter(n => {
        if (n.isMuted) return false;
        if (n.isSnoozed && n.snoozedUntil && new Date(n.snoozedUntil).getTime() > now) return false;
        return true;
    });
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.notifyListeners();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.notifyListeners();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  public snoozeNotification(id: string, minutes: number = 30) {
    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    this.notifications = this.notifications.map(n => 
        n.id === id ? { ...n, isSnoozed: true, snoozedUntil: snoozeTime } : n
    );
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
