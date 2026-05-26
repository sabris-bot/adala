
import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MainContent from './components/layout/MainContent';
import { useCaseTask } from './components/CaseTaskContext';
import { notificationService } from './services/notificationService';
import { BellAlertIcon, XCircleIcon, ExclamationTriangleIcon } from './constants'; // Icons
import { AdminTaskStatus, LeaseAgreementStatus, NotificationPriority, NotificationCategory } from './types';
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
import CaseDetailsPage from './pages/CaseDetailsPage';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import LegalResourcesPage from './pages/LegalResourcesPage'; // Added import
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
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
import LitigationToolsPage from './pages/LitigationToolsPage';


// Employee Affairs Sub-modules
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import LoanManagementPage from './pages/LoanManagementPage';
import DisciplinaryActionsPage from './pages/DisciplinaryActionsPage';
import EmployeeRequestsPage from './pages/EmployeeRequestsPage';
import InvestigationsPage from './pages/InvestigationsPage'; // NEW: Investigations Page
import EmployeePerformancePage from './pages/EmployeePerformancePage';
import RecruitmentHiringPage from './pages/RecruitmentHiringPage';
import EmployeeContractsPage from './pages/EmployeeContractsPage';
import PayrollManagementPage from './pages/PayrollManagementPage';

// Property Management Sub-modules (NEW)
import PropertyMaintenancePage from './pages/PropertyMaintenancePage';
import PropertySpecificReportsPage from './pages/PropertySpecificReportsPage';
import PropertyDocumentsPage from './pages/PropertyDocumentsPage';

// New Tools Pages
import LegalDeadlinesPage from './pages/LegalDeadlinesPage';
import LegalFinancialCalculatorPage from './pages/LegalFinancialCalculatorPage';
import InheritanceCalculatorPage from './pages/InheritanceCalculatorPage';


// Removed old manual toast components

import { useTranslation } from 'react-i18next';

import { ToastProvider, useToast } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const { addToast } = useToast();
  const sentNotificationsRef = useRef<Set<string>>(new Set());

  // --- AUTOMATIC UPDATE SYSTEM ---
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`/api/version?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        const serverVersion = data.version;
        const lastSeenVersion = localStorage.getItem('app_version');
        
        if (lastSeenVersion && lastSeenVersion !== serverVersion) {
          // toast notifications for version updates
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
    // Initial mount: capture existing IDs to avoid toasting backlog on load
    const initialNotifications = notificationService.getNotifications();
    initialNotifications.forEach(n => sentNotificationsRef.current.add(n.id));

    const unsubscribe = notificationService.subscribe((notifications) => {
        // Only show toasts for new urgent notifications that haven't been shown yet
        notifications.forEach(notif => {
            if (notif.priority === NotificationPriority.URGENT && !notif.isRead && !sentNotificationsRef.current.has(notif.id)) {
                // Determine toast type
                const toastType = notif.category === NotificationCategory.URGENT ? 'error' : 'info';
                
                // Professional Toast
                addToast({
                    type: toastType as any,
                    title: notif.title,
                    message: notif.message,
                    duration: 6000
                });
                
                sentNotificationsRef.current.add(notif.id);
            }
        });
    });

    return unsubscribe;
  }, [addToast]);

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
                <Route path="/cases/:id" element={<CaseDetailsPage />} />
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
                <Route path="/employee-affairs/recruitment" element={<RecruitmentHiringPage />} />
                <Route path="/employee-affairs/contracts" element={<EmployeeContractsPage />} />
                <Route path="/employee-affairs/payroll" element={<PayrollManagementPage />} />
                
                <Route path="/litigation-tools" element={<LitigationToolsPage initialTab="dashboard" />} />
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
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppErrorBoundary>
          </MainContent>
          
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
};

export default App;
