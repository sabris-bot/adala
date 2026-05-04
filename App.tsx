
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MainContent from './components/layout/MainContent';
import { generateMockHearings } from './pages/AutomatedDocketPage'; // Import hearing generator
import initialMockTasks from './pages/TaskManagementPage'; // Import tasks
import { BellAlertIcon, XCircleIcon } from './constants'; // Icons
import { Hearing, AdminTaskStatus, LeaseAgreementStatus } from './types';
import { mockLeaseAgreements } from './data/propertyData';

// Import page components using relative paths
import DashboardPage from './pages/DashboardPage'; // Ensured this is a default import
import CaseListPage from './pages/CaseListPage';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import LegalResourcesPage from './pages/LegalResourcesPage'; // Added import
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import AiAssistantPage from './pages/AiAssistantPage';
import { CompliancePage } from './pages/CompliancePage'; 
import EmployeeAffairsPage from './pages/EmployeeAffairsPage';
import EndOfServicePage from './pages/EndOfServicePage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import LegalFormsPage from './pages/LegalFormsPage';
import { PropertyManagementPage } from './pages/PropertyManagementPage'; // Changed to named import
import CompanyAffairsPage from './pages/CompanyAffairsPage';
import AdminToolsPage from './pages/AdminToolsPage';
import { TaskManagementPage } from './pages/TaskManagementPage'; // Corrected import
import ContactsPage from './pages/ContactsPage';
import SmartMindMapPage from './pages/SmartMindMapPage'; 
import ReportsPage from './pages/ReportsPage';
import FinancialManagementPage from './pages/FinancialManagementPage';
import KuwaitBarAssociationPage from './pages/KuwaitBarAssociationPage';
import LegalRepresentationPage from './pages/LegalRepresentationPage'; // Changed to default import
import NotificationsManagementPage from './pages/NotificationsManagementPage'; // New Notifications Management Page
import PartyTrackingPage from './pages/PartyTrackingPage'; // New Party Tracking Page
import DebtSettlementPage from './pages/DebtSettlementPage'; // New Debt Settlement Page
import AutomatedDocketPage from './pages/AutomatedDocketPage'; // New Automated Docket Page
import MojSearchPage from './pages/MojSearchPage'; // New MOJ Search Page


// Employee Affairs Sub-modules
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import LoanManagementPage from './pages/LoanManagementPage';
import DisciplinaryActionsPage from './pages/DisciplinaryActionsPage';
import EmployeeRequestsPage from './pages/EmployeeRequestsPage';
import InvestigationsPage from './pages/InvestigationsPage'; // NEW: Investigations Page

// Property Management Sub-modules (NEW)
import PropertyMaintenancePage from './pages/PropertyMaintenancePage';
import PropertySpecificReportsPage from './pages/PropertySpecificReportsPage';
import PropertyDocumentsPage from './pages/PropertyDocumentsPage';

// New Tools Pages
import LegalDeadlinesPage from './pages/LegalDeadlinesPage';
import CourtFeesPage from './pages/CourtFeesPage';
import LegalInterestCalculatorPage from './pages/LegalInterestCalculatorPage';
import InheritanceCalculatorPage from './pages/InheritanceCalculatorPage';

interface Toast {
    id: string;
    message: string;
    type: 'info' | 'urgent'; // 24h = info, 1h = urgent
    title: string;
}

const ToastNotification: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
    return (
        <div className={`
            w-80 p-4 mb-3 rounded-lg shadow-xl border-s-4 flex items-start animate-fade-in-right bg-white dark:bg-dm-card
            ${toast.type === 'urgent' ? 'border-red-500' : 'border-blue-500'}
        `}>
            <div className={`p-2 rounded-full flex-shrink-0 ${toast.type === 'urgent' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
                <BellAlertIcon className="w-6 h-6" />
            </div>
            <div className="ms-3 flex-grow">
                <h4 className={`text-sm font-bold ${toast.type === 'urgent' ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                    {toast.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-snug">{toast.message}</p>
            </div>
            <button onClick={() => onClose(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XCircleIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [toasts, setToasts] = useState<Toast[]>([]);
  const sentNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Update theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Update document direction based on language
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  // --- GLOBAL NOTIFICATION SYSTEM LOGIC ---
  useEffect(() => {
    const checkNotifications = () => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Check Hearings
        const hearings = generateMockHearings();
        hearings.forEach(hearing => {
            const hearingTime = new Date(`${hearing.date}T${hearing.time}`);
            if (isNaN(hearingTime.getTime())) return;

            const diffMs = hearingTime.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            // 24 Hour Warning (Between 23.5 and 24.5 hours)
            const id24h = `24h-${hearing.id}`;
            if (diffHours >= 23.5 && diffHours <= 24.5 && !sentNotificationsRef.current.has(id24h)) {
                addToast({
                    id: id24h,
                    type: 'info',
                    title: t('hearing_reminder_tomorrow', { defaultValue: 'تذكير بجلسة غداً' }),
                    message: t('hearing_reminder_msg', { 
                        defaultValue: `موعد جلسة قضية "{{title}}" ({{id}}) غدًا الساعة {{time}}.`,
                        title: hearing.caseTitle,
                        id: hearing.caseId,
                        time: hearing.time
                    })
                });
                sentNotificationsRef.current.add(id24h);
            }

            // 1 Hour Warning (Between 45m and 75m - approx 1 hour)
            const id1h = `1h-${hearing.id}`;
            if (diffHours >= 0.75 && diffHours <= 1.25 && !sentNotificationsRef.current.has(id1h)) {
                addToast({
                    id: id1h,
                    type: 'urgent',
                    title: t('urgent_alert_hearing_soon', { defaultValue: 'تنبيه عاجل: جلسة قريبة جداً' }),
                    message: t('urgent_hearing_msg', { 
                        defaultValue: `جلسة "{{title}}" تبدأ خلال ساعة ({{time}}). يرجى الاستعداد.`,
                        title: hearing.caseTitle,
                        time: hearing.time
                    })
                });
                sentNotificationsRef.current.add(id1h);
            }
        });

        // 2. Check Overdue Tasks
        initialMockTasks.forEach(task => {
            // Skip if no due date or if completed/cancelled
            if (!task.dueDate || task.status === AdminTaskStatus.COMPLETED || task.status === AdminTaskStatus.CANCELLED) return;

            const overdueId = `overdue-${task.id}`;
            
            // Check if due date is strictly before today (meaning it was due yesterday or earlier)
            if (task.dueDate < todayStr && !sentNotificationsRef.current.has(overdueId)) {
                addToast({
                    id: overdueId,
                    type: 'urgent',
                    title: t('overdue_task', { defaultValue: 'مهمة متأخرة (Overdue)' }),
                    message: t('overdue_task_msg', { 
                        defaultValue: `المهمة "{{title}}" المسندة إلى {{assignedTo}} تجاوزت موعد الاستحقاق ({{dueDate}}).`,
                        title: task.title,
                        assignedTo: task.assignedTo,
                        dueDate: task.dueDate
                    })
                });
                sentNotificationsRef.current.add(overdueId);
            }
        });

        // 3. Check Expiring Leases
        mockLeaseAgreements.forEach(lease => {
            if (lease.status !== LeaseAgreementStatus.ACTIVE) return;
            
            const endDate = new Date(lease.endDate);
            const diffMs = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            const leaseId = `lease-exp-${lease.id}`;
            if (diffDays <= 30 && diffDays > 0 && !sentNotificationsRef.current.has(leaseId)) {
                addToast({
                    id: leaseId,
                    type: 'info',
                    title: t('lease_expiring_alert', { defaultValue: 'تنبيه: عقد إيجار قارب على الانتهاء' }),
                    message: t('lease_expiring_msg', { 
                        defaultValue: `العقد رقم {{contractNo}} سينتهي خلال {{days}} يوم ({{endDate}}).`,
                        contractNo: lease.contractNumber,
                        days: diffDays,
                        endDate: lease.endDate
                    })
                });
                sentNotificationsRef.current.add(leaseId);
            }
        });
    };

    // Run immediately on mount
    checkNotifications();

    // Run every 30 seconds
    const interval = setInterval(checkNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  const addToast = (toast: Toast) => {
      setToasts(prev => [toast, ...prev]);
      // Auto dismiss after 10 seconds
      setTimeout(() => removeToast(toast.id), 10000);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-neutral-bg dark:bg-dm-background relative"> 
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
          <MainContent>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases" element={<CaseListPage />} />
              <Route path="/finance" element={<FinancialManagementPage />} />
              <Route path="/finance/add-expense" element={<FinancialManagementPage />} /> 
              <Route path="/finance/add-purchase" element={<FinancialManagementPage />} />
              <Route path="/finance/add-salary" element={<FinancialManagementPage />} />
              <Route path="/contracts" element={<ContractAnalysisPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              
              <Route path="/employee-affairs" element={<EmployeeAffairsPage />} />
              <Route path="/employee-affairs/profiles" element={<EmployeeProfilePage />} />
              <Route path="/employee-affairs/end-of-service" element={<EndOfServicePage />} />
              <Route path="/employee-affairs/leave-management" element={<LeaveManagementPage />} />
              <Route path="/employee-affairs/loans" element={<LoanManagementPage />} />
              <Route path="/employee-affairs/disciplinary" element={<DisciplinaryActionsPage />} />
              <Route path="/employee-affairs/investigations" element={<InvestigationsPage />} />
              <Route path="/employee-affairs/requests" element={<EmployeeRequestsPage />} />
              
              <Route path="/kba" element={<KuwaitBarAssociationPage />} /> 
              <Route path="/legal-representation" element={<LegalRepresentationPage />} /> 
              <Route path="/notifications" element={<NotificationsManagementPage />} /> 
              <Route path="/legal-forms" element={<LegalFormsPage />} />
              <Route path="/resources" element={<LegalResourcesPage />} /> 
              
              <Route path="/property-management" element={<PropertyManagementPage />} />
              <Route path="/property-management/debt-settlement" element={<DebtSettlementPage />} />
              <Route path="/property-management/maintenance" element={<PropertyMaintenancePage />} />
              <Route path="/property-management/reports" element={<PropertySpecificReportsPage />} />
              <Route path="/property-management/property-documents" element={<PropertyDocumentsPage />} />

              <Route path="/company-affairs" element={<CompanyAffairsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              
              <Route path="/smart-mind-maps" element={<SmartMindMapPage />} /> 
              <Route path="/advanced-mind-maps" element={<SmartMindMapPage />} /> 

              {/* Automation & Integrations Routes */}
              <Route path="/automated-docket" element={<AutomatedDocketPage />} />
              <Route path="/moj-search" element={<MojSearchPage />} />
              <Route path="/party-tracking" element={<PartyTrackingPage />} /> 

              <Route path="/admin-tools" element={<AdminToolsPage />} />
              <Route path="/admin-tools/tasks" element={<TaskManagementPage />} />
              <Route path="/admin-tools/contacts" element={<ContactsPage />} />
              
              <Route path="/tools/legal-deadlines" element={<LegalDeadlinesPage />} />
              <Route path="/tools/court-fees" element={<CourtFeesPage />} />
              <Route path="/tools/legal-interests" element={<LegalInterestCalculatorPage />} />
              <Route path="/tools/inheritance" element={<InheritanceCalculatorPage />} />

              <Route path="/settings" element={<SettingsPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />} /> 
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainContent>

          {/* Global Notification Container (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-50 flex flex-col-reverse max-h-screen overflow-hidden">
              {toasts.map(toast => (
                  <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
              ))}
          </div>

        </div>
      </div>
    </HashRouter>
  );
};

export default App;
