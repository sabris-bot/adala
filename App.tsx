
import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MainContent from './components/layout/MainContent';
import { useCaseTask } from './components/CaseTaskContext';
import { BellAlertIcon, XCircleIcon, ExclamationTriangleIcon } from './constants'; // Icons
import { AdminTaskStatus, LeaseAgreementStatus } from './types';
import { mockLeaseAgreements } from './data/propertyData';

// Error Boundary Component
interface EBProps { children: ReactNode; }
interface EBState { hasError: boolean; error?: Error; }
class AppErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("App Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-10 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-rose-100 max-w-lg">
            <div className="bg-rose-100 text-rose-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">عصراً، حدث خطأ غير متوقع</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">نأسف، يبدو أن هناك مشكلة فنية تمنع عرض هذا القسم حالياً. تم تسجيل الخطأ للمراجعة.</p>
            <div className="bg-slate-50 p-4 rounded-xl text-left font-mono text-[10px] text-rose-500 overflow-auto mb-8 max-h-32">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Import page components using relative paths
import DashboardPage from './pages/DashboardPage'; // Ensured this is a default import
import CaseListPage from './pages/CaseListPage';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import LegalResourcesPage from './pages/LegalResourcesPage'; // Added import
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import AiAssistantPage from './pages/AiAssistantPage';
import CompliancePage from './pages/CompliancePage'; 
import EmployeeAffairsPage from './pages/EmployeeAffairsPage';
import EndOfServicePage from './pages/EndOfServicePage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import LegalFormsPage from './pages/LegalFormsPage';
import PropertyManagementPage from './pages/PropertyManagementPage'; 
import CompanyAffairsPage from './pages/CompanyAffairsPage';
import AdminToolsPage from './pages/AdminToolsPage';
import TaskManagementPage from './pages/TaskManagementPage'; 
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
import EmployeePerformancePage from './pages/EmployeePerformancePage';

// Property Management Sub-modules (NEW)
import PropertyMaintenancePage from './pages/PropertyMaintenancePage';
import PropertySpecificReportsPage from './pages/PropertySpecificReportsPage';
import PropertyDocumentsPage from './pages/PropertyDocumentsPage';

// New Tools Pages
import LegalDeadlinesPage from './pages/LegalDeadlinesPage';
import LegalFinancialCalculatorPage from './pages/LegalFinancialCalculatorPage';
import InheritanceCalculatorPage from './pages/InheritanceCalculatorPage';

interface Toast {
    id: string;
    message: string;
    type: 'info' | 'urgent'; // 24h = info, 1h = urgent
    title: string;
}

const ToastNotification: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(toast.id), 10000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    return (
        <div className={`
            w-85 p-5 mb-4 rounded-xl shadow-2xl border-s-8 flex items-start animate-fade-in-right transition-all
            ${toast.type === 'urgent' 
                ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-900/20 shadow-rose-500/20 ring-1 ring-rose-200 dark:ring-rose-800' 
                : 'border-blue-500 bg-white dark:bg-dm-card'}
        `}>
            <div className={`p-2.5 rounded-2xl flex-shrink-0 shadow-sm ${
                toast.type === 'urgent' 
                    ? 'bg-rose-600 text-white animate-bounce shadow-rose-600/40' 
                    : 'bg-blue-100 text-blue-600 shadow-blue-500/10'
            }`}>
                <BellAlertIcon className="w-6 h-6" />
            </div>
            <div className="ms-4 flex-grow">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-black uppercase tracking-tight ${
                        toast.type === 'urgent' ? 'text-rose-900 dark:text-rose-100' : 'text-blue-900 dark:text-blue-100'
                    }`}>
                        {toast.title}
                    </h4>
                    {toast.type === 'urgent' && (
                        <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">
                            عاجل
                        </span>
                    )}
                </div>
                <p className={`text-[11px] font-medium leading-relaxed ${
                    toast.type === 'urgent' ? 'text-rose-800 dark:text-rose-200' : 'text-gray-600 dark:text-gray-300'
                }`}>
                    {toast.message}
                </p>
            </div>
            <button 
                onClick={() => onClose(toast.id)} 
                className={`p-1 rounded-lg transition-colors ${
                    toast.type === 'urgent' 
                        ? 'text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-800/50 hover:text-rose-600' 
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600'
                }`}
            >
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

  // --- AUTOMATIC UPDATE SYSTEM ---
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/api/version');
        if (!response.ok) return;
        const data = await response.json();
        const serverVersion = data.version;
        const lastSeenVersion = localStorage.getItem('app_version');
        
        if (lastSeenVersion && lastSeenVersion !== serverVersion) {
          console.group('New System Version Detected');
          console.log(`Current: ${lastSeenVersion}`);
          console.log(`New: ${serverVersion}`);
          console.log('Clearing local caches and reloading...');
          console.groupEnd();
          
          // Clear all local storage and session storage to prevent data conflicts
          localStorage.clear();
          sessionStorage.clear();
          
          // Set the new version so we don't loop
          localStorage.setItem('app_version', serverVersion);
          
          // Unregister any active service workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }

          // Hard reload from server
          window.location.reload();
        } else if (!lastSeenVersion) {
          localStorage.setItem('app_version', serverVersion);
        }
      } catch (err) {
        // Fail silently to not disturb user
      }
    };

    checkVersion();
    // Check for updates every 15 minutes
    const interval = setInterval(checkVersion, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { hearings, tasks } = useCaseTask();

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
                        defaultValue: `موعد جلسة قضية "{{title}}" ({{id}}) غدًا الساعة {{time}}. (تم إرسال بريد إلكتروني)`,
                        title: hearing.caseTitle,
                        id: hearing.caseId,
                        time: hearing.time
                    })
                });
                console.log(`[Email System] Sending notification for urgent hearing ${hearing.id} to associated legal team.`);
                sentNotificationsRef.current.add(id24h);
            }

            // 1 Hour Warning
            const id1h = `1h-${hearing.id}`;
            if (diffHours >= 0.75 && diffHours <= 1.25 && !sentNotificationsRef.current.has(id1h)) {
                addToast({
                    id: id1h,
                    type: 'urgent',
                    title: t('urgent_alert_hearing_soon', { defaultValue: 'تنبيه عاجل: جلسة قريبة جداً' }),
                    message: t('urgent_hearing_msg', { 
                        defaultValue: `جلسة "{{title}}" تبدأ خلال ساعة ({{time}}). تم إرسال تنبيه عاجل بالبريد.`,
                        title: hearing.caseTitle,
                        time: hearing.time
                    })
                });
                console.log(`[Email System] URGENT: Sending high-priority alert for hearing ${hearing.id}.`);
                sentNotificationsRef.current.add(id1h);
            }
        });

        // 2. Check Overdue Tasks
        tasks.forEach(task => {
            if (!task.dueDate || task.status === AdminTaskStatus.COMPLETED || task.status === AdminTaskStatus.CANCELLED) return;

            const overdueId = `overdue-${task.id}`;
            if (task.dueDate < todayStr && !sentNotificationsRef.current.has(overdueId)) {
                addToast({
                    id: overdueId,
                    type: 'urgent',
                    title: t('overdue_task', { defaultValue: 'مهمة متأخرة (Overdue)' }),
                    message: t('overdue_task_msg', { 
                        defaultValue: `المهمة "{{title}}" المسندة إلى {{assignedTo}} متأخرة. تم إرسال إشعار للمتابعة.`,
                        title: task.title,
                        assignedTo: task.assignedTo,
                        dueDate: task.dueDate
                    })
                });
                console.log(`[Email System] Overdue Task Alert: Notifying ${task.assignedTo} about task ${task.id}.`);
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
    <BrowserRouter>
      <div className="flex h-screen bg-neutral-bg dark:bg-dm-background relative"> 
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
          <MainContent>
            <AppErrorBoundary>
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
                <Route path="/employee-affairs/performance" element={<EmployeePerformancePage />} />
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
                <Route path="/tools/court-fees" element={<LegalFinancialCalculatorPage />} />
                <Route path="/tools/legal-interests" element={<LegalFinancialCalculatorPage />} />
                <Route path="/tools/legal-financial-calc" element={<LegalFinancialCalculatorPage />} />
                <Route path="/tools/inheritance" element={<InheritanceCalculatorPage />} />

                <Route path="/settings" element={<SettingsPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />} /> 
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppErrorBoundary>
          </MainContent>
          
          <Footer />

          {/* Global Notification Container (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-50 flex flex-col-reverse max-h-screen overflow-hidden">
              {toasts.map(toast => (
                  <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
              ))}
          </div>

        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
