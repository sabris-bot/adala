

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MainContent from './components/layout/MainContent';

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


const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Basic dark mode state

  useEffect(() => {
    // Apply dark mode class to HTML element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-neutral-bg dark:bg-dm-background"> {/* Updated background for new theme */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
            // toggleDarkMode={toggleDarkMode} // Pass toggleDarkMode if Header has the button
            // isDarkMode={isDarkMode}
          />
          <MainContent>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases" element={<CaseListPage />} />
              <Route path="/finance" element={<FinancialManagementPage />} />
              <Route path="/finance/add-expense" element={<FinancialManagementPage />} /> {/* Point to main page, specific handling inside */}
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
              <Route path="/resources" element={<LegalResourcesPage />} /> {/* Added new route */}
              
              <Route path="/property-management" element={<PropertyManagementPage />} />
              <Route path="/property-management/debt-settlement" element={<DebtSettlementPage />} />
              <Route path="/property-management/maintenance" element={<PropertyMaintenancePage />} />
              <Route path="/property-management/property-reports" element={<PropertySpecificReportsPage />} />
              <Route path="/property-management/property-documents" element={<PropertyDocumentsPage />} />

              <Route path="/company-affairs" element={<CompanyAffairsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              
              <Route path="/smart-mind-maps" element={<SmartMindMapPage />} /> 
              {/* Keep advanced-mind-maps route pointing to SmartMindMapPage for now, or decide if it needs a separate component */}
              <Route path="/advanced-mind-maps" element={<SmartMindMapPage />} /> 

              {/* Automation & Integrations Routes */}
              <Route path="/automated-docket" element={<AutomatedDocketPage />} />
              <Route path="/moj-search" element={<MojSearchPage />} />
              <Route path="/party-tracking" element={<PartyTrackingPage />} /> 

              <Route path="/admin-tools" element={<AdminToolsPage />} />
              <Route path="/admin-tools/tasks" element={<TaskManagementPage />} />
              <Route path="/admin-tools/contacts" element={<ContactsPage />} />
              
              {/* New Tools Routes */}
              <Route path="/tools/legal-deadlines" element={<LegalDeadlinesPage />} />
              <Route path="/tools/court-fees" element={<CourtFeesPage />} />

              <Route path="/settings" element={<SettingsPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />} /> {/* Pass dark mode props to Settings */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainContent>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;