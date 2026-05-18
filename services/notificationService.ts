
import { AdminTask, AdminTaskStatus, Hearing } from '../types';
import { initialMockTasks } from '../data/taskData';
import { generateMockHearings } from '../pages/AutomatedDocketPage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_overdue' | 'hearing_urgent' | 'system';
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.checkNotifications();
  }

  // Check for overdue tasks and urgent hearings
  public checkNotifications() {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // 1. Check Tasks
    initialMockTasks.forEach(task => {
      if (task.status !== AdminTaskStatus.COMPLETED && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < now) {
          newNotifications.push({
            id: `task-overdue-${task.id}`,
            title: 'مهمة متأخرة!',
            message: `المهمة "${task.title}" تجاوزت موعد استحقاقها.`,
            type: 'task_overdue',
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    });

    // 2. Check Urgent Hearings (within 24 hours)
    const hearings = generateMockHearings();
    hearings.forEach(hearing => {
      const hearingDateTime = new Date(`${hearing.date}T${hearing.time}`);
      const diffInHours = (hearingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffInHours > 0 && diffInHours <= 24 && hearing.status === 'Scheduled') {
          newNotifications.push({
            id: `hearing-urgent-${hearing.id}`,
            title: 'جلسة عاجلة قادمة!',
            message: `لديك جلسة "${hearing.caseTitle}" خلال أقل من 24 ساعة.`,
            type: 'hearing_urgent',
            timestamp: new Date().toISOString(),
            read: false,
          });
      }
    });

    // Add unique notifications only
    newNotifications.forEach(notif => {
      if (!this.notifications.find(n => n.id === notif.id)) {
        this.notifications = [notif, ...this.notifications];
      }
    });

    this.notifyListeners();
  }

  public getNotifications() {
    return this.notifications;
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.notifyListeners();
  }

  public subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.notifications));
  }
}

export const notificationService = new NotificationService();
