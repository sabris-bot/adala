import { 
    CompanyProfile, CompanyMeeting, CorporateAction, CompanyDocument
} from '../types';

export interface CompanyProfileExt extends CompanyProfile {
    archived?: boolean;
}

export interface TimelineEvent {
    id: string;
    companyId: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    date: string;
    type: 'registration' | 'meeting' | 'action' | 'document' | 'other';
}

export interface SystemCorporateReminder {
    id: string;
    companyId: string;
    titleAr: string;
    titleEn: string;
    messageAr: string;
    messageEn: string;
    dueDate: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
}

export const initialMockCompanies: CompanyProfileExt[] = [];
export const initialMockMeetings: CompanyMeeting[] = [];
export const initialMockActions: CorporateAction[] = [];
export const initialMockDocuments: CompanyDocument[] = [];
export const initialMockTimeline: TimelineEvent[] = [];
export const initialMockReminders: SystemCorporateReminder[] = [];
