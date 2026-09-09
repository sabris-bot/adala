
import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MainContent from './components/layout/MainContent';
import { notificationService } from './services/notificationService';
import { ExclamationTriangleIcon } from './constants';
import { NotificationPriority, NotificationCategory } from './types';

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="bg-white dark:bg-dm-card p-8 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-900/50 max-w-lg w-full">
            <div className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <ExclamationTriangleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">عفواً، حدث تنبيه فني غير متوقع</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              نأسف لحدوث هذا الاستثناء. تم عزل الخطأ لضمان استقرار بقية أقسام النظام. يمكنك إعادة المحاولة أو الانتقال للصفحة الرئيسية.
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-left font-mono text-[11px] text-rose-600 dark:text-rose-400 overflow-auto mb-6 max-h-28 border border-slate-200 dark:border-slate-800" dir="ltr">
              {this.state.error?.message || this.state.error?.toString()}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 bg-accent-dark hover:bg-accent text-white py-3 rounded-xl font-bold transition-all shadow-md text-sm"
              >
                إعادة المحاولة
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-bold transition-all shadow-md text-sm"
              >
                الرئيسية
              </button>
            </div>
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
import AdvancedAutomationPage from './pages/AdvancedAutomationPage';
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
import GlobalSearchPage from './pages/GlobalSearchPage'; // New Global System-wide Search Page
import LitigationToolsPage from './pages/LitigationToolsPage';
import SmartJudicialSystemPage from './pages/SmartJudicialSystemPage';


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
import { PropertyFieldInspectionPage } from './pages/PropertyFieldInspectionPage';

// New Tools Pages
import LegalDeadlinesPage from './pages/LegalDeadlinesPage';
import LegalGanttChartPage from './pages/LegalGanttChartPage';
import LegalFinancialCalculatorPage from './pages/LegalFinancialCalculatorPage';
import InheritanceCalculatorPage from './pages/InheritanceCalculatorPage';
import { DeedsPrintingStudioPage } from './pages/DeedsPrintingStudioPage';
import KuwaitPoaGeneratorPage from './pages/KuwaitPoaGeneratorPage';


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
      {/* Global Print Layout Header & Footer */}
      <div className="global-print-header">
        <div className="global-print-header-logo">عدالة</div>
        <div className="global-print-header-office">مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</div>
      </div>
      <div className="global-print-footer">
        بيانات التواصل: هاتف: 22440099 | واتساب: 99001122 | البريد الإلكتروني: info@shattalaw.com | برج الحمراء، الدور 35، الكويت
      </div>

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
                <Route path="/employee-affairs/disciplinary-actions" element={<DisciplinaryActionsPage />} />
                <Route path="/employee-affairs/investigations" element={<InvestigationsPage />} />
                <Route path="/employee-affairs/performance" element={<EmployeePerformancePage />} />
                <Route path="/employee-affairs/requests" element={<EmployeeRequestsPage />} />
                <Route path="/employee-affairs/recruitment" element={<RecruitmentHiringPage />} />
                <Route path="/employee-affairs/contracts" element={<EmployeeContractsPage />} />
                <Route path="/employee-affairs/payroll" element={<PayrollManagementPage />} />

                {/* HR Aliases for direct /hr access */}
                <Route path="/hr" element={<EmployeeAffairsPage />} />
                <Route path="/hr/profiles" element={<EmployeeProfilePage />} />
                <Route path="/hr/end-of-service" element={<EndOfServicePage />} />
                <Route path="/hr/leave-management" element={<LeaveManagementPage />} />
                <Route path="/hr/loans" element={<LoanManagementPage />} />
                <Route path="/hr/disciplinary" element={<DisciplinaryActionsPage />} />
                <Route path="/hr/disciplinary-actions" element={<DisciplinaryActionsPage />} />
                <Route path="/hr/investigations" element={<InvestigationsPage />} />
                <Route path="/hr/performance" element={<EmployeePerformancePage />} />
                <Route path="/hr/requests" element={<EmployeeRequestsPage />} />
                <Route path="/hr/recruitment" element={<RecruitmentHiringPage />} />
                <Route path="/hr/contracts" element={<EmployeeContractsPage />} />
                <Route path="/hr/payroll" element={<PayrollManagementPage />} />
                
                <Route path="/litigation-tools" element={<LitigationToolsPage initialTab="dashboard" />} />
                <Route path="/court-hearing-simulator" element={<LitigationToolsPage initialTab="court_hearing_simulator" />} />
                <Route path="/hearing-simulator" element={<LitigationToolsPage initialTab="court_hearing_simulator" />} />
                <Route path="/litigation-simulator" element={<LitigationToolsPage initialTab="litigation_simulator" />} />
                <Route path="/smart-judicial-system" element={<SmartJudicialSystemPage />} />
                <Route path="/kba" element={<KuwaitBarAssociationPage />} /> 
                <Route path="/legal-representation" element={<LegalRepresentationPage />} /> 
                <Route path="/notifications" element={<NotificationsManagementPage />} /> 
                <Route path="/legal-forms" element={<LegalFormsPage />} />
                <Route path="/deeds-print" element={<DeedsPrintingStudioPage />} />
                <Route path="/kuwait-poa" element={<KuwaitPoaGeneratorPage />} />
                <Route path="/resources" element={<LegalResourcesPage />} /> 
                
                <Route path="/property-management" element={<PropertyManagementPage />} />
                <Route path="/property-management/inspections" element={<PropertyFieldInspectionPage />} />
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
                <Route path="/search" element={<GlobalSearchPage />} />
                <Route path="/party-tracking" element={<PartyTrackingPage />} />

                <Route path="/admin-tools" element={<AdminToolsPage />} />
                <Route path="/admin-tools/tasks" element={<TaskManagementPage />} />
                <Route path="/admin-tools/contacts" element={<ContactsPage />} />
                <Route path="/admin-tools/gantt" element={<LegalGanttChartPage />} />
                <Route path="/gantt-chart" element={<LegalGanttChartPage />} />
                <Route path="/legal-gantt-chart" element={<LegalGanttChartPage />} />
                
                <Route path="/tools/legal-deadlines" element={<LegalDeadlinesPage />} />
                <Route path="/tools/court-fees" element={<LegalFinancialCalculatorPage />} />
                <Route path="/tools/legal-interests" element={<LegalFinancialCalculatorPage />} />
                <Route path="/tools/legal-financial-calc" element={<LegalFinancialCalculatorPage />} />
                <Route path="/tools/inheritance" element={<InheritanceCalculatorPage />} />
                <Route path="/inheritance" element={<InheritanceCalculatorPage />} />

                <Route path="/settings" element={<SettingsPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />} /> 
                <Route path="/settings/automation" element={<AdvancedAutomationPage />} />
                <Route path="/automation-rules" element={<AdvancedAutomationPage />} /> 
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
