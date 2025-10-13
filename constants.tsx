import React from 'react';
import { 
    NavItem, CaseMainType, CasePriority, CourtLevel, CaseStatus, RiskLevel, 
    ComplianceCategory, ComplianceStatus as CompStatusEnum, ComplianceFrequency, 
    ContractTypeKuwait, TerminationReasonKuwait, LeaveTypeKuwait, 
    LoanType, LoanStatus, InstallmentStatus,
    ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus,
    EmployeeRequestType, EmployeeRequestStatus,
    PropertyType, PropertyUnitStatus, LeaseAgreementStatus, RentPaymentFrequency, RentPaymentStatus,
    CompanyDocumentType, CompanyDocumentStatus,
    LegalResourceType, LawBranch, LegalResourceStatus,
    PropertyCategoryKuwait, PropertyUnitTypeKuwait, PropertyIntendedUseKuwait, LeaseTermType, // ENHANCED
    CompanyLegalFormKuwait, BoardMemberPosition, CompanyMeetingType, CorporateActionType, CorporateActionStatus,
    MindMapLayoutType, MindMapShape,
    AdminTaskStatus, AdminTaskPriority, ContactType,
    FinancialTransactionType, PaymentMethod, ExpenseCategory, PurchaseCategory,
    UserStatus, UserRole, Permission,
    KBALawyerEnrollmentStatus, KBAPublicationType, KBASeminarStatus, KBASeminarRegistrationStatus, // KBA Types
    Country, CountryCode, // Country Context Types
    LegalFormCategoryOptions, // For LegalFormsPage
    RepresentationRequestStatus, // For Legal Representation Unit
    NotificationChannel, NotificationStatus, NotificationType, // For Notifications Management
    PartyRelationshipType, TrackingStatus, // For Party Tracking Module
    SettlementStatus, // For Debt Settlement Module
    MaintenanceCategory, MaintenancePriority, MaintenanceStatus, PropertyDocumentType, // Added PropertyDocumentType for options
    ExecutionActionType, ExecutionActionStatus, // Added for Case Execution Actions
    InvestigationStatus, InvestigationPartyType, // NEW: For Investigations
    ExpertActionStatus, ExpertField // NEW
} from './types';

// --- GENERAL ICONS (Heroicons - Outline variant) ---
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Replaced with Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>
);
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Replaced with Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25V14.15M18.75 18.75v-6.75A2.25 2.25 0 0 0 16.5 9.75h-9A2.25 2.25 0 0 0 5.25 12v6.75m13.5-6.75V6.75a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 3.75 6.75v3.375M15 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
);
export const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Replaced with Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Replaced with Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.242-3.722a4.998 4.998 0 0 0-.916-3.528M18 18.72M18 18.72v-2.28m0 2.28c.212 0 .424.002.636.006M18 18.72Zm-4.5-4.5v.779c0 .184-.158.338-.35.338h-1.5a.339.339 0 0 1-.35-.338v-.779M18 18.72Zm-4.5-4.5a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0ZM13.5 12a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5V10.5a1.5 1.5 0 0 1 1.5-1.5h1.5A1.5 1.5 0 0 1 13.5 10.5v1.5Zm-4.5-4.5v-.779c0-.184.158-.338.35-.338h1.5a.339.339 0 0 1 .35.338v.779M9 9.75a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1.5A1.5 1.5 0 0 1 10.5 9.75h-1.5Zm-4.5 4.5a1.5 1.5 0 0 1-1.5-1.5V10.5a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-1.5-1.5h-1.5Z" /></svg>
);
export const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Replaced with Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
);
export const CogIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Replaced with Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.153-.96M17.785 5.106l1.153-.96m-14.736 14.736L5.106 5.106M17.785 17.785l-2.829-2.829m0 0a3 3 0 1 0-4.243-4.243 3 3 0 0 0 4.243 4.243m-4.243-4.243L6.171 6.171M12 12l6.171 6.171" /></svg>
);
export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline Bars3Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
);
export const XIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline XMarkIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
);
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline ChevronDownIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
);
export const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
);
export const ScaleIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props} className="w-6 h-6">
    <path d="M12 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM3.75 6.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zM12 6a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V6.75A.75.75 0 0112 6z" />
    <path fillRule="evenodd" d="M4.928 9.34a3 3 0 100 5.32.75.75 0 01-.722.533H2.25a.75.75 0 01-.75-.75V9.555a.75.75 0 011.28-.533l.002.002c.11.11.24.2.388.27.353.164.746.258 1.16.258.415 0 .807-.094 1.16-.258a2.5 2.5 0 00.388-.27l.002-.002zM19.072 9.34L19.07 9.34a3 3 0 110 5.32.75.75 0 00.722.533H21.75a.75.75 0 00.75-.75V9.555a.75.75 0 00-1.28-.533l-.002.002a2.502 2.502 0 01-1.548-.001l-.002-.001z" clipRule="evenodd" />
    <path d="M7 18.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM17 18.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /> {/* Placeholder for book and pillar */}
    <path d="M6 20.25c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V19.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v.75z" />
    <path d="M4.168 14.23c.173.233.388.448.612.638V13.25c0-.414-.336-.75-.75-.75H2.25v.83c.386.225.748.493 1.085.792.05.045.093.096.133.149zM19.832 14.23a3.023 3.023 0 00.612-.638V13.25c0-.414.336-.75.75-.75H21.75v.83c-.386.225-.748.493-1.085.792a2.755 2.755 0 01-.133.149z" />
  </svg>
);
export const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 0 1 5.25 7.5h13.5a2.25 2.25 0 0 1 2.25 2.25m-16.5 0v6.75a2.25 2.25 0 0 0 2.25 2.25h12a2.25 2.25 0 0 0 2.25-2.25v-6.75m-16.5 0H3.75m16.5 0H20.25m-16.5 0V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v3.75m-16.5 0h16.5" /></svg>
);
export const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);
export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
);
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.242.267M10.5 6A2.25 2.25 0 0 0 8.25 8.25V6m2.25 0V8.25m0 0V6m0 0H6.75M10.5 6H13.5m0 0V8.25m0 0V6" /></svg>
);
export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline (Stars variant)
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12h3.375M12 15.75V21M5.25 9.75H3M12 2.25V9" /></svg>
);
export const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
);
export const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
);
export const ShieldExclamationIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
);
export const ClipboardListCheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For tasks, Heroicons ClipboardDocumentCheckIcon (Outline)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" /></svg>
);
export const ArrowUpCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const ArrowDownCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
);
export const CalculatorIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM15.75 18v-2.25A2.25 2.25 0 0 0 13.5 13.5h-3A2.25 2.25 0 0 0 8.25 15.75V18Zm-7.5 0h3V6.75H6.75A2.25 2.25 0 0 0 4.5 9v.003M15.75 18H18M15.75 18h-3V6.75A2.25 2.25 0 0 1 15 4.5h.003V18Z" /></svg>
);
export const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Solid (as used in profiles often) - if Outline is preferred, can switch
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>
);
export const UserCircleIconOutline = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);
export const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
);
export const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25C7.625 20.25 4.5 19.25 3 18m18-6c0-4.556-3.861-8.25-8.625-8.25C7.625 3.75 4.5 4.75 3 6m18 6v-3.375c0-.621-.504-1.125-1.125-1.125H19.5m-15 0H5.625c-.621 0-1.125.504-1.125 1.125v3.375m0 0a8.25 8.25 0 0 0 15 0Z" /></svg>
);
export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);
// Keep CheckCircleIcon and XCircleIcon as they are (solid variants are fine for status indicators)
export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.093 3.093-1.407-1.407a.75.75 0 0 0-1.06 1.06L10.94 14.72l4.157-4.157Z" clipRule="evenodd" /></svg>
);
export const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75 9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" /></svg>
);
export const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0c1.081-.765 1.833-1.913 2.022-3.217C20.015 13.482 19.042 12 17.75 12h-11.5c-1.292 0-2.265 1.482-2.022 2.783c.19.1304.941 2.452 2.022 3.217m11.318 0m-11.318 0c.661.03.987.042 1.35.042h8.618c.363 0 .69-.012 1.35-.042M6.34 18V2.25A2.25 2.25 0 0 1 8.59 0h6.82a2.25 2.25 0 0 1 2.25 2.25v15.75M17.66 18V2.25A2.25 2.25 0 0 0 15.41 0h-6.82a2.25 2.25 0 0 0-2.25 2.25v15.75" /></svg>
);
export const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3.375 3.375 0 1 1 18.375 12.74Z" /></svg>
);
export const DocumentDuplicateIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125V17.25m0 0v1.125c0 .621.504 1.125 1.125 1.125H9.75d" /></svg>
);
export const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
);
export const BuildingOffice2Icon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>
);
export const BuildingLibraryIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V5.63C19.5 5.015 19.005 4.5 18.375 4.5H5.625C5.005 4.5 4.5 5.015 4.5 5.63V21m14.25-8.625c.228.033.45.066.675.102V11.25a4.5 4.5 0 0 0-9 0v.377c.225-.036.447-.069.675-.102M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const WrenchScrewdriverIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83M11.42 15.17l-4.47-4.47M11.42 15.17l4.47 4.47M11.42 15.17L15.17 11.42m-5.83 5.83A2.652 2.652 0 0 1 2.75 21L8.58 15.17m3.837-3.837L15.17 11.42m0 0L21 5.25A2.652 2.652 0 0 0 17.25 1.5L11.42 7.33m0 0L7.33 11.42M12.75 7.5h3.75M12.75 7.5h-3.75M12.75 7.5V11.25M12.75 7.5V3.75M3 12h3.75M3 12h-3.75M3 12v3.75M3 12V8.25m15-4.5H14.25M18 3h3.75M18 3h-3.75M18 3V6.75M18 3V0" /></svg>
);
export const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
);
export const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.242-3.722a4.998 4.998 0 0 0-.916-3.528M18 18.72M18 18.72v-2.28m0 2.28c.212 0 .424.002.636.006M18 18.72Zm-4.5-4.5v.779c0 .184-.158.338-.35.338h-1.5a.339.339 0 0 1-.35-.338v-.779M18 18.72Zm-4.5-4.5a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0ZM13.5 12a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5V10.5a1.5 1.5 0 0 1 1.5-1.5h1.5A1.5 1.5 0 0 1 13.5 10.5v1.5Zm-4.5-4.5v-.779c0-.184.158-.338.35-.338h1.5a.339.339 0 0 1 .35.338v.779M9 9.75a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1.5A1.5 1.5 0 0 1 10.5 9.75h-1.5Zm-4.5 4.5a1.5 1.5 0 0 1-1.5-1.5V10.5a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-1.5-1.5h-1.5Z" /></svg>
);
export const ReportMoneyIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Reports, ChartBarSquareIcon Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>
);
export const PresentationChartLineIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5M3.75 16.5v2.25A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25V16.5m0 0h1.5m-1.5 0h-16.5m16.5 0H3.75M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.29a.75.75 0 0 1 .04.04l2.25 2.25a.75.75 0 0 1-.04 1.06l-2.25 2.25a.75.75 0 0 1-1.042-.018L9.375 8.25M15 11.25l-3-3m0 0l-3 3m3-3v6" />
    </svg>
);
export const CpuChipIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M12 8.25h.01M12 12h.01M12 15.75h.01M4.5 4.5l.75.75A.75.75 0 0 1 6 4.5l.75-.75M4.5 15.75l.75.75a.75.75 0 0 1 .75.75l-.75.75M19.5 4.5l-.75.75a.75.75 0 0 0-.75-.75l-.75-.75M19.5 15.75l-.75.75a.75.75 0 0 0 .75.75l.75-.75M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6h7.5v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 16.5V18h7.5v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25H18V15.75h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25H6V15.75h1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
export const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Placeholder, custom or other library
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v1.5c1.075 0 2.053.25 2.89.674a.75.75 0 0 1 .283 1.034A9.012 9.012 0 0 1 12 15a9.012 9.012 0 0 1-3.923-7.288.75.75 0 0 1 .283-1.034A8.94 8.94 0 0 1 10.5 6v-1.5A.75.75 0 0 1 11.25 3.75H12Zm-2.625 8.192c0-1.29.692-2.018 1.375-2.482.251-.172.518-.31.796-.412a.75.75 0 0 1 .628.126.75.75 0 0 1 .263.64c0 .09-.013.177-.038.262a7.093 7.093 0 0 0-.263 1.204 7.135 7.135 0 0 0 .89 3.31A.75.75 0 0 1 12.75 15a.75.75 0 0 1-.589-.277 5.635 5.635 0 0 1-.89-3.31c.01-.044.024-.087.038-.129a.75.75 0 0 1-.062-.064c-.173-.252-.418-.481-.733-.657a4.088 4.088 0 0 0-1.375-.506V11.942Z" clipRule="evenodd" />
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75 9.75S17.385 2.25 12 2.25Zm-.375 3a2.25 2.25 0 0 0-2.25 2.25v.008c0 1.913.826 3.706 2.174 4.968.21.2.443.382.69.548a.75.75 0 0 0 .622 0c.247-.166.48-.347.69-.548 1.348-1.262 2.174-3.055 2.174-4.968V7.5A2.25 2.25 0 0 0 12.375 5.25h-.75Z" />
  </svg>
);
export const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v-.093c0-.668.536-1.2.19-1.2H5.25M16.783 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v-.093c0-.668-.536-1.2-.19-1.2h1.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 4.5h.008v.008H12v-.008Z" />
  </svg>
);
export const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
export const MinusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
export const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 0 6.624l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.091-1.091M13.19 8.688 18.5 3.375a4.5 4.5 0 0 1 6.364 6.364l-4.5 4.5M13.19 8.688l-4.5-4.5m4.5 4.5-4.5 4.5M13.19 8.688 18.5 3.375" />
  </svg>
);
export const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline (same as MenuIcon)
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
export const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);
export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.018-.991-.053-1.464S21.75 16.182 21.75 12c0-4.182 0-6.136-.053-7.464S21.75 4.484 21.75 4.5V3.125A2.25 2.25 0 0 0 19.5 0.875H17.25C9 0.875 2.25 7.716 2.25 15.75V18c0 .516.018.991.053 1.464S2.25 19.818 2.25 21.75c0 1.242 1.008 2.25 2.25 2.25H6.75" />
  </svg>
);
export const BuildingStorefrontIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A2.25 2.25 0 0 1 15.75 11.25h.75m0 0H15.75m0 0c0-1.105-1.12-2-2.5-2S10.75 10.145 10.75 11.25m5.002 0V21m-5.002 0A2.25 2.25 0 0 1 10.75 18.75h.75m0 0c0-1.104-1.12-2-2.5-2S6.75 17.646 6.75 18.75m5.002 0v1.875m-5.002 0A2.25 2.25 0 0 1 6.75 16.5h.75m0 0c0-1.104-1.12-2-2.5-2S2.25 15.396 2.25 16.5m5.002 0V21m-5.002 0A2.25 2.25 0 0 1 2.25 18.75h.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
export const UserTieIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Placeholder (Grommet-icons UserPolice) could be custom or other library
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75 9.75S17.385 2.25 12 2.25ZM8.25 9.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5ZM12 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 15Z" />
    <path d="M12 4.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM9.75 6.75A1.5 1.5 0 0 1 11.25 5.25h1.5a1.5 1.5 0 0 1 1.5 1.5V9A1.5 1.5 0 0 1 12.75 10.5h-1.5A1.5 1.5 0 0 1 9.75 9V6.75Z" />
  </svg>
);
export const UserShieldIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m6.143-4.286a11.956 11.956 0 0 1-2.33 2.33m-2.33-2.33a11.956 11.956 0 0 0-2.33-2.33m2.33 2.33a11.956 11.956 0 0 1 2.33-2.33m-2.33 2.33c-.28.13-.563.256-.853.371a11.956 11.956 0 0 0-2.33 2.33M3.857 5.47a11.956 11.956 0 0 0-2.33 2.33m2.33-2.33a11.956 11.956 0 0 1-2.33 2.33m2.33-2.33c.28.13.563.256.853.371m-.853-.371A11.956 11.956 0 0 1 2.67 7.803M11.25 4.5A15.75 15.75 0 0 1 21.75 12c0 5.124-2.52 9.585-6.42 12.13a12.02 12.02 0 0 1-1.49.798M11.25 4.5A15.75 15.75 0 0 0 .75 12c0 5.124 2.52 9.585 6.42 12.13a12.02 12.02 0 0 0 1.49.798M11.25 4.5a11.956 11.956 0 0 0-2.33-2.33" />
  </svg>
);
export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);
export const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);
export const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.34 0 .672-.015 1.004-.046M12 21c-.34 0-.672-.015-1.004-.046M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3a9.004 9.004 0 0 1 8.716 6.747M12 3c-.34 0-.672-.015-1.004-.046M12 3c.34 0 .672-.015 1.004-.046M16.5 9.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-1.874.375a2.25 2.25 0 1 1-4.252 0 2.25 2.25 0 0 1 4.252 0Z" />
  </svg>
);
export const GavelIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons BeakerIcon (as Gavel is not in outline) or custom
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662v4.159c0 .694.069 1.376.204 2.043L8.309 21.75H7.25A2.25 2.25 0 0 1 5 19.5V12Zm1.5-3H5.625M15 12H9" />
  </svg>
);
export const BellAlertIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons BellAlertIcon Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M12.75 4.5v.75A.75.75 0 0 1 12 6h0A.75.75 0 0 1 11.25 5.25v-.75" />
  </svg>
);
export const IdentificationIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
export const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21m-9-9h3.375M12 15h3.375M12 9.75h3.375M12 12.75h3.375M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-4.5 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
  </svg>
);
export const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);
export const ReceiptPercentIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
  </svg>
);
export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline for PartyTrackingPage
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);
export const ArrowUturnLeftIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons Outline for Back button
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);
export const AutomationIcon = (props: React.SVGProps<SVGSVGElement>) => ( // CubeTransparentIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M12 7.5V5.25m0 2.25l-2.25-1.313M6.75 7.5l-2.25-1.313M6.75 7.5l2.25 1.313M6.75 7.5V5.25m9 0v2.25m0 0l2.25-1.313M17.25 7.5l-2.25 1.313M17.25 7.5V5.25" />
  </svg>
);
export const ListBulletIcon = (props: React.SVGProps<SVGSVGElement>) => ( // ListBulletIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-1.725zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
export const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => ( // MagnifyingGlassIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);


// --- ICONS FOR MIND MAP NODES ---
export const mindMapNodeIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    lightbulb: LightBulbIcon,
    folder: FolderIcon,
    briefcase: BriefcaseIcon,
    users: UsersIcon,
    task: ClipboardListCheckIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    link: LinkIcon,
    calendar: CalendarDaysIcon,
    default: CpuChipIcon, // A generic default
};


// --- TEXT MODELS ---
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';

// --- CHART COLORS (New "Modern Justice" Palette) ---
export const CHART_COLORS = [
  '#00796B', // primary.DEFAULT (Main Teal)
  '#FFC107', // accent.DEFAULT (Amber/Gold)
  '#4DB6AC', // primary.light (Lighter Teal)
  '#F44336', // danger (Red)
  '#607D8B', // secondary.DEFAULT (Blue Grey)
  '#8BC34A', // Light Green
  '#03A9F4', // Light Blue
  '#E91E63', // Pink
  '#673AB7', // Deep Purple
  '#00BCD4', // Cyan
  '#FF9800', // Orange (warning)
  '#795548', // Brown
  '#9E9E9E', // Grey
  '#FFEB3B', // Yellow
  '#CDDC39', // Lime
];

export const TASK_PRIORITY_COLORS: Record<string, string> = {
    'Urgent': CHART_COLORS[3], // Red
    'High': CHART_COLORS[10],   // Orange
    'Medium': CHART_COLORS[6], // Light Blue
    'Low': CHART_COLORS[5],    // Light Green
};

export const RISK_COLORS: Record<RiskLevel, string> = { // Renamed from RISK_LEVEL_CHART_COLORS to avoid confusion
    [RiskLevel.LOW]: CHART_COLORS[5],      // Light Green
    [RiskLevel.MEDIUM]: CHART_COLORS[13],   // Yellow
    [RiskLevel.HIGH]: CHART_COLORS[10],     // Orange
    [RiskLevel.CRITICAL]: CHART_COLORS[3], // Red
};

export const CASE_STATUS_CHART_COLORS: Record<CaseStatus, string> = {
    [CaseStatus.OPEN]: CHART_COLORS[6],           // Light Blue
    [CaseStatus.IN_PROGRESS]: CHART_COLORS[9],    // Cyan
    [CaseStatus.CLOSED]: CHART_COLORS[0],         // Main Teal
    [CaseStatus.PENDING]: CHART_COLORS[8],        // Deep Purple
    [CaseStatus.ON_HOLD]: CHART_COLORS[1],        // Amber
    [CaseStatus.APPEALED]: CHART_COLORS[10],       // Orange
};

export const COMPLIANCE_STATUS_CHART_COLORS: Record<CompStatusEnum, string> = {
    [CompStatusEnum.COMPLIANT]: CHART_COLORS[5],       // Light Green
    [CompStatusEnum.IN_PROGRESS]: CHART_COLORS[6],   // Light Blue
    [CompStatusEnum.OVERDUE]: CHART_COLORS[3],         // Red
    [CompStatusEnum.UNDER_REVIEW]: CHART_COLORS[13],  // Yellow
    [CompStatusEnum.SCHEDULED]: CHART_COLORS[9],       // Cyan
    [CompStatusEnum.NOT_APPLICABLE]: CHART_COLORS[12], // Grey
    [CompStatusEnum.CANCELLED]: CHART_COLORS[11],      // Brown
};

// Added for Dashboard & Reports
export const JUDGMENT_OUTCOME_CHART_COLORS: Record<string, string> = {
    'Won': CHART_COLORS[5],           // Light Green
    'Lost': CHART_COLORS[3],          // Red
    'Settled': CHART_COLORS[6],       // Light Blue
    'PartialWin': CHART_COLORS[0],    // Main Teal
    'Pending': CHART_COLORS[12],      // Grey
};

// Added for Notifications module reports
export const RepresentationRequestStatusChartColors: Record<RepresentationRequestStatus, string> = {
    [RepresentationRequestStatus.PENDING]: CHART_COLORS[13], // Yellow
    [RepresentationRequestStatus.ACCEPTED]: CHART_COLORS[6], // Light Blue
    [RepresentationRequestStatus.REJECTED]: CHART_COLORS[3], // Red
    [RepresentationRequestStatus.COMPLETED]: CHART_COLORS[0], // Main Teal
    [RepresentationRequestStatus.CANCELLED]: CHART_COLORS[12] // Grey
};


// --- START OF RESTORED CONTENT ---

// --- SELECT OPTIONS (Derived from types.ts enums) ---

export const countryOptions: Array<{ value: CountryCode; label: string }> = [
    { value: 'KW', label: 'الكويت' },
    { value: 'SA', label: 'المملكة العربية السعودية' },
    { value: 'AE', label: 'الإمارات العربية المتحدة' },
    { value: 'EG', label: 'مصر' },
    { value: 'JO', label: 'الأردن' },
];

export const caseStatusOptions = Object.values(CaseStatus).map(status => ({ value: status, label: status }));
export const caseMainTypeOptions = Object.values(CaseMainType).map(type => ({ value: type, label: type }));
export const casePriorityOptions = Object.values(CasePriority).map(priority => ({ value: priority, label: priority }));
export const courtLevelOptions = Object.values(CourtLevel).map(level => ({ value: level, label: level }));
export const riskLevelOptions = Object.values(RiskLevel).map(level => ({ value: level, label: level }));
export const complianceCategoryOptions = Object.values(ComplianceCategory).map(cat => ({ value: cat, label: cat }));
export const complianceStatusOptions = Object.values(CompStatusEnum).map(status => ({ value: status, label: status }));
export const complianceFrequencyOptions = Object.values(ComplianceFrequency).map(freq => ({ value: freq, label: freq }));
export const contractTypeKuwaitOptions = Object.values(ContractTypeKuwait).map(type => ({ value: type, label: type }));
export const terminationReasonKuwaitOptions = Object.values(TerminationReasonKuwait).map(reason => ({ value: reason, label: reason }));
export const leaveTypeKuwaitOptions = Object.values(LeaveTypeKuwait).map(type => ({ value: type, label: type }));
export const loanTypeOptions = Object.values(LoanType).map(type => ({ value: type, label: type }));
export const loanStatusOptions = Object.values(LoanStatus).map(status => ({ value: status, label: status }));
export const installmentStatusOptions = Object.values(InstallmentStatus).map(status => ({ value: status, label: status }));
export const violationTypeKuwaitOptions = Object.values(ViolationTypeKuwait).map(type => ({ value: type, label: type }));
export const disciplinaryPenaltyKuwaitOptions = Object.values(DisciplinaryPenaltyKuwait).map(penalty => ({ value: penalty, label: penalty }));
export const disciplinaryActionStatusOptions = Object.values(DisciplinaryActionStatus).map(status => ({ value: status, label: status }));
export const employeeRequestTypeOptions = Object.values(EmployeeRequestType).map(type => ({ value: type, label: type }));
export const employeeRequestStatusOptions = Object.values(EmployeeRequestStatus).map(status => ({ value: status, label: status }));
export const propertyTypeOptions = Object.values(PropertyType).map(type => ({ value: type, label: type }));
export const propertyUnitStatusOptions = Object.values(PropertyUnitStatus).map(status => ({ value: status, label: status }));
export const leaseAgreementStatusOptions = Object.values(LeaseAgreementStatus).map(status => ({ value: status, label: status }));
export const rentPaymentFrequencyOptions = Object.values(RentPaymentFrequency).map(freq => ({ value: freq, label: freq }));
export const rentPaymentStatusOptions = Object.values(RentPaymentStatus).map(status => ({ value: status, label: status }));
export const settlementStatusOptions = Object.values(SettlementStatus).map(status => ({ value: status, label: status }));
export const companyDocumentTypeOptions = Object.values(CompanyDocumentType).map(type => ({ value: type, label: type }));
export const companyDocumentStatusOptions = Object.values(CompanyDocumentStatus).map(status => ({ value: status, label: status }));
export const legalResourceTypeOptions = Object.values(LegalResourceType).map(type => ({ value: type, label: type }));
export const lawBranchOptions = Object.values(LawBranch).map(branch => ({ value: branch, label: branch }));
export const legalResourceStatusOptions = Object.values(LegalResourceStatus).map(status => ({ value: status, label: status }));
export const propertyCategoryKuwaitOptions = Object.values(PropertyCategoryKuwait).map(cat => ({ value: cat, label: cat }));
export const propertyUnitTypeKuwaitOptions = Object.values(PropertyUnitTypeKuwait).map(type => ({ value: type, label: type }));
export const propertyIntendedUseKuwaitOptions = Object.values(PropertyIntendedUseKuwait).map(use => ({ value: use, label: use }));
export const leaseTermTypeOptions = Object.values(LeaseTermType).map(type => ({ value: type, label: type }));
export const companyLegalFormOptionsKuwait = Object.values(CompanyLegalFormKuwait).map(form => ({ value: form, label: form }));
export const boardMemberPositionOptions = Object.values(BoardMemberPosition).map(pos => ({ value: pos, label: pos }));
export const companyMeetingTypeOptions = Object.values(CompanyMeetingType).map(type => ({ value: type, label: type }));
export const corporateActionTypeOptions = Object.values(CorporateActionType).map(type => ({ value: type, label: type }));
export const corporateActionStatusOptions = Object.values(CorporateActionStatus).map(status => ({ value: status, label: status }));
export const adminTaskStatusOptions = Object.values(AdminTaskStatus).map(status => ({ value: status, label: status }));
export const adminTaskPriorityOptions = Object.values(AdminTaskPriority).map(priority => ({ value: priority, label: priority }));
export const contactTypeOptions = Object.values(ContactType).map(type => ({ value: type, label: type }));
export const financialTransactionTypeOptions = Object.values(FinancialTransactionType).map(type => ({ value: type, label: type }));
export const paymentMethodOptions = Object.values(PaymentMethod).map(method => ({ value: method, label: method }));
export const expenseCategoryOptions = Object.values(ExpenseCategory).map(cat => ({ value: cat, label: cat }));
export const purchaseCategoryOptions = Object.values(PurchaseCategory).map(cat => ({ value: cat, label: cat }));
export const userStatusOptions = Object.values(UserStatus).map(status => ({ value: status, label: status }));
export const userRoleOptions = Object.values(UserRole).map(role => ({ value: role, label: role }));
export const kbaLawyerEnrollmentStatusOptions = Object.values(KBALawyerEnrollmentStatus).map(status => ({ value: status, label: status }));
export const kbaPublicationTypeOptions = Object.values(KBAPublicationType).map(type => ({ value: type, label: type }));
export const kbaSeminarStatusOptions = Object.values(KBASeminarStatus).map(status => ({ value: status, label: status }));
export const kbaSeminarRegistrationStatusOptions = Object.values(KBASeminarRegistrationStatus).map(status => ({ value: status, label: status }));
export const representationRequestStatusOptions = Object.values(RepresentationRequestStatus).map(status => ({ value: status, label: status }));
export const partyRelationshipTypeOptions = Object.values(PartyRelationshipType).map(type => ({ value: type, label: type }));
export const trackingStatusOptions = Object.values(TrackingStatus).map(status => ({ value: status, label: status }));
export const maintenanceCategoryOptions = Object.values(MaintenanceCategory).map(cat => ({ value: cat, label: cat }));
export const maintenancePriorityOptions = Object.values(MaintenancePriority).map(prio => ({ value: prio, label: prio }));
export const maintenanceStatusOptions = Object.values(MaintenanceStatus).map(status => ({ value: status, label: status }));
export const propertyDocumentTypeOptions = Object.values(PropertyDocumentType).map(type => ({ value: type, label: type }));
export const executionActionTypeOptions = Object.values(ExecutionActionType).map(type => ({ value: type, label: type }));
export const executionActionStatusOptions = Object.values(ExecutionActionStatus).map(status => ({ value: status, label: status }));
export const investigationStatusOptions = Object.values(InvestigationStatus).map(status => ({ value: status, label: status }));
export const investigationPartyTypeOptions = Object.values(InvestigationPartyType).map(type => ({ value: type, label: type }));
export const expertFieldOptions = Object.values(ExpertField).map(field => ({ value: field, label: field }));
export const expertActionStatusOptions = Object.values(ExpertActionStatus).map(status => ({ value: status, label: status }));

export const mindMapLayoutOptions = [
    { value: MindMapLayoutType.TREE_HORIZONTAL, label: "شجري (أفقي)" },
    { value: MindMapLayoutType.ORGANIZATION_CHART, label: "هيكل تنظيمي (رأسي)" },
    { value: MindMapLayoutType.FLOWCHART_HORIZONTAL, label: "مخطط انسيابي (أفقي)" },
    { value: MindMapLayoutType.FLOWCHART_VERTICAL, label: "مخطط انسيابي (رأسي)" },
    { value: MindMapLayoutType.RADIAL, label: "دائري (عنكبوتي)" },
];

export const mindMapShapeOptions = [
    { value: MindMapShape.ROUNDED, label: 'مستطيل مستدير' },
    { value: MindMapShape.RECTANGLE, label: 'مستطيل حاد' },
    { value: MindMapShape.PILL, label: 'كبسولة' },
    { value: MindMapShape.OVAL, label: 'بيضاوي' },
    { value: MindMapShape.DIAMOND, label: 'معين' },
    { value: MindMapShape.PARALLELOGRAM, label: 'متوازي أضلاع' },
];

export interface PermissionOption {
    value: Permission;
    label: string;
    description: string;
}

export interface PermissionGroup {
    title: string;
    permissions: PermissionOption[];
}

export const permissionGroups: PermissionGroup[] = [
    {
        title: "الإدارة والنظام",
        permissions: [
            { value: Permission.MANAGE_USERS, label: "إدارة المستخدمين والصلاحيات", description: "إضافة/تعديل/حذف المستخدمين وتغيير صلاحيات الأدوار." },
            { value: Permission.MANAGE_SETTINGS, label: "إدارة إعدادات النظام", description: "تغيير الإعدادات العامة للتطبيق مثل قوالب الإشعارات." },
        ]
    },
    {
        title: "الوصول إلى الوحدات الرئيسية",
        permissions: [
            { value: Permission.VIEW_FINANCIALS, label: "عرض السجلات المالية", description: "الوصول إلى وحدة الإدارة المالية وعرض المعاملات." },
            { value: Permission.EDIT_FINANCIALS, label: "تعديل السجلات المالية", description: "إضافة أو تعديل أو حذف المعاملات المالية." },
            { value: Permission.VIEW_EMPLOYEE_AFFAIRS, label: "عرض شؤون الموظفين", description: "الاطلاع على ملفات الموظفين وبياناتهم الحساسة." },
            { value: Permission.EDIT_EMPLOYEE_AFFAIRS, label: "تعديل سجلات الموظفين", description: "تعديل ملفات الموظفين، معالجة الإجازات والقروض." },
            { value: Permission.MANAGE_COMPANY_AFFAIRS, label: "إدارة شؤون الشركات", description: "الوصول وتعديل سجلات اجتماعات وقرارات الشركة." },
        ]
    },
    {
        title: "الإجراءات الحساسة والميزات الخاصة",
        permissions: [
            { value: Permission.ACCESS_AI_FEATURES, label: "استخدام ميزات الذكاء الاصطناعي", description: "الوصول إلى أدوات تحليل العقود والمساعد القانوني." },
            { value: Permission.EXPORT_REPORTS, label: "تصدير التقارير", description: "القدرة على تصدير البيانات من وحدة التقارير إلى ملفات خارجية." },
            { value: Permission.DELETE_MASTER_RECORDS, label: "حذف السجلات الرئيسية", description: "القدرة على حذف سجلات هامة بشكل دائم (مثل القضايا، الموظفين، العقارات)." },
        ]
    },
    {
        title: "الوصول إلى أجهزة الجهاز",
        permissions: [
            { value: Permission.USE_CAMERA, label: "استخدام الكاميرا", description: "السماح بالتقاط صور من خلال التطبيق." },
            { value: Permission.USE_MICROPHONE, label: "استخدام الميكروفون", description: "السماح بتسجيل الصوت من خلال التطبيق (لميزات مستقبلية)." },
        ]
    }
];


// Added missing exports to fix import errors
export const legalFormCategoryOptions = Object.values(LegalFormCategoryOptions).map(cat => ({ value: cat, label: cat }));
export const notificationChannelOptions = Object.values(NotificationChannel).map(channel => ({ value: channel, label: channel }));
export const notificationStatusOptions = Object.values(NotificationStatus).map(status => ({ value: status, label: status }));
export const notificationTypeOptions = Object.values(NotificationType).map(type => ({ value: type, label: type }));

// START: UPDATED OPTIONS FOR CASE LIST PAGE
export const partyRoleOptions = [
    { value: 'مدعي', label: 'مدعي' },
    { value: 'مدعى عليه', label: 'مدعى عليه' },
    { value: 'مستأنف', label: 'مستأنف' },
    { value: 'مستأنف ضده', label: 'مستأنف ضده' },
    { value: 'طاعن', label: 'طاعن' },
    { value: 'مطعون ضده', label: 'مطعون ضده' },
    { value: 'متهم', label: 'متهم' },
    { value: 'مجني عليه', label: 'مجني عليه' },
    { value: 'سلطة اتهام', label: 'سلطة اتهام' },
    { value: 'مستشكل', label: 'مستشكل' },
    { value: 'مستشكل ضده', label: 'مستشكل ضده' },
    { value: 'خصم مدخل', label: 'خصم مدخل' },
    { value: 'متدخل هجومي', label: 'متدخل هجومي' },
    { value: 'متدخل فرعي', label: 'متدخل فرعي' },
    { value: 'متظلم', label: 'متظلم' },
    { value: 'متظلم ضده', label: 'متظلم ضده' },
    { value: 'منذر', label: 'منذر' },
    { value: 'منذر اليه', label: 'منذر اليه' },
];

export const caseFilterStatusOptions = [
    { value: 'متداول', label: 'متداول' },
    { value: 'منتهي', label: 'منتهي' },
    { value: 'تنفيذ', label: 'تنفيذ' },
    { value: 'سحب القضية', label: 'سحب القضية' },
];

export const courtDegreeOptions = [
    { value: 'أول درجة', label: 'أول درجة' },
    { value: 'استئناف', label: 'استئناف' },
    { value: 'التماس', label: 'التماس' },
    { value: 'تمييز', label: 'تمييز' },
    { value: 'معارضة', label: 'معارضة' },
];

export const hearingTypeOptions = [
    { value: 'جلسة محكمة', label: 'جلسة محكمة' },
    { value: 'جلسة خبراء', label: 'جلسة خبراء' },
    { value: 'حكم', label: 'حكم' },
    { value: 'شئون', label: 'شئون' },
];

export const reportTypeOptions = [
    { value: 'تقرير موكل', label: 'تقرير موكل' },
    { value: 'تقرير مستشار', label: 'تقرير مستشار' },
    { value: 'تقرير مجموعة', label: 'تقرير مجموعة' },
    { value: 'تقرير مكتب', label: 'تقرير مكتب' },
];

export const caseGroupOptions = [
    { value: 'قضايا هامة', label: 'قضايا هامة' }, 
    { value: 'قضايا مكتب الرياض', label: 'قضايا مكتب الرياض' }, 
    { value: 'قضايا بنكية', label: 'قضايا بنكية' }
];
// END: UPDATED OPTIONS FOR CASE LIST PAGE


export const caseSubTypeExamples: Record<CaseMainType, {value:string, label:string}[]> = {
    [CaseMainType.COMMERCIAL]: [{value:'منازعات بنكية', label:'منازعات بنكية'}, {value:'عقود توريد', label:'عقود توريد'}, {value:'وكالات تجارية', label:'وكالات تجارية'}],
    [CaseMainType.LABOR]: [{value:'فصل تعسفي', label:'فصل تعسفي'}, {value:'مطالبة بمستحقات', label:'مطالبة بمستحقات'}, {value:'إصابة عمل', label:'إصابة عمل'}],
    [CaseMainType.REAL_ESTATE]: [{value:'دعوى إخلاء', label:'دعوى إخلاء'}, {value:'مطالبة بأجرة', label:'مطالبة بأجرة'}, {value:'نزاع ملكية', label:'نزاع ملكية'}],
    [CaseMainType.CRIMINAL]: [{value:'جنحة شيك بدون رصيد', label:'جنحة شيك بدون رصيد'}, {value:'جنحة سب وقذف', label:'جنحة سب وقذف'}, {value:'جنحة سرقة', label:'جنحة سرقة'}],
    [CaseMainType.CIVIL]: [{value:'مطالبة مالية', label:'مطالبة مالية'}, {value:'تعويض عن ضرر', label:'تعويض عن ضرر'}, {value:'دعوى صحة توقيع', label:'دعوى صحة توقيع'}],
    [CaseMainType.ADMINISTRATIVE]: [{value:'دعوى إلغاء قرار إداري', label:'دعوى إلغاء قرار إداري'}, {value:'دعوى تسوية وظيفية', label:'دعوى تسوية وظيفية'}],
    [CaseMainType.PERSONAL_STATUS]: [{value:'دعوى طلاق', label:'دعوى طلاق'}, {value:'دعوى نفقة', label:'دعوى حضانة'}, {value: 'دعوى حضانة', label: 'دعوى حضانة'}],
    [CaseMainType.INTELLECTUAL_PROPERTY]: [{value:'نزاع علامة تجارية', label:'نزاع علامة تجارية'}, {value:'تعدي على براءة اختراع', label:'تعدي على براءة اختراع'}],
    [CaseMainType.MARITIME]: [{value:'مطالبة بحرية', label:'مطالبة بحرية'}],
    [CaseMainType.OTHER]: [],
};

export const currencyOptions = [
    { value: 'KWD', label: 'دينار كويتي (KWD)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
];

export const financialEntityOptions = [
    { value: 'case', label: 'قضية' },
    { value: 'employee', label: 'موظف' },
    { value: 'vendor', label: 'مورد' },
    { value: 'client', label: 'موكل' },
    { value: 'property', label: 'عقار' },
    { value: 'company_profile', label: 'ملف الشركة' },
    { value: 'other', label: 'أخرى' },
];

export const kbaMembershipTypeOptions = [
    { value: 'محام جدول (أ) - تحت التمرين', label: 'محام جدول (أ) - تحت التمرين' },
    { value: 'محام جدول (ب) - مشتغلون', label: 'محام جدول (ب) - مشتغلون' },
    { value: 'مقبول أمام الاستئناف', label: 'مقبول أمام الاستئناف' },
    { value: 'مقبول أمام التمييز والدستورية', label: 'مقبول أمام التمييز والدستورية' },
];

export const KUWAIT_GOVERNMENT_BODIES_LIST = [
    { value: 'وزارة العدل', label: 'وزارة العدل' },
    { value: 'وزارة التجارة والصناعة', label: 'وزارة التجارة والصناعة' },
    { value: 'وزارة الداخلية', label: 'وزارة الداخلية' },
    { value: 'بلدية الكويت', label: 'بلدية الكويت' },
    { value: 'الهيئة العامة للقوى العاملة', label: 'الهيئة العامة للقوى العاملة' },
    { value: 'الهيئة العامة للمعلومات المدنية (PACI)', label: 'الهيئة العامة للمعلومات المدنية (PACI)' },
];

export const KUWAIT_COURTS_LIST = [
    { value: 'قصر العدل', label: 'قصر العدل' },
    { value: 'الرقعي', label: 'الرقعي' },
    { value: 'حولي', label: 'حولي' },
    { value: 'الأحمدي', label: 'الأحمدي' },
    { value: 'الجهراء', label: 'الجهراء' },
    { value: 'اسرة العاصمة', label: 'اسرة العاصمة' },
    { value: 'اسرة الرقعي', label: 'اسرة الرقعي' },
    { value: 'اسرة حولي', label: 'اسرة حولي' },
    { value: 'اسرة المهبولة', label: 'اسرة المهبولة' },
    { value: 'اسرة مبارك الكبير', label: 'اسرة مبارك الكبير' },
    { value: 'اسرة الجهراء', label: 'اسرة الجهراء' },
    { value: 'خبراء الرقعي', label: 'خبراء الرقعي' },
    { value: 'خبراء حولي', label: 'خبراء حولي' },
    { value: 'خبراء المهبولة', label: 'خبراء المهبولة' },
    { value: 'خبراء مبارك الكبير', label: 'خبراء مبارك الكبير' },
    { value: 'خبراء الجهراء', label: 'خبراء الجهراء' },
    { value: 'المحكمة الدستورية', label: 'المحكمة الدستورية' },
];
export const KUWAIT_PROSECUTIONS_LIST = [
     { value: 'النيابة العامة (قصر العدل)', label: 'النيابة العامة (قصر العدل)' },
     { value: 'نيابة العاصمة', label: 'نيابة العاصمة' },
     { value: 'نيابة حولي', label: 'نيابة حولي' },
     { value: 'نيابة الأموال العامة', label: 'نيابة الأموال العامة' },
];
export const KUWAIT_JUDICIAL_DEPARTMENTS_LIST = [
    { value: 'إدارة التنفيذ المدني', label: 'إدارة التنفيذ المدني'},
    { value: 'إدارة الخبراء', label: 'إدارة الخبراء'},
    { value: 'إدارة التسجيل العقاري والتوثيق', label: 'إدارة التسجيل العقاري والتوثيق'},
];

export const kuwaitIssuingAuthoritiesOptions = [
    ...KUWAIT_GOVERNMENT_BODIES_LIST,
    ...KUWAIT_COURTS_LIST,
    ...KUWAIT_PROSECUTIONS_LIST,
    ...KUWAIT_JUDICIAL_DEPARTMENTS_LIST,
    { value: 'مجلس الأمة الكويتي', label: 'مجلس الأمة الكويتي' },
    { value: 'أمير الكويت', label: 'أمير الكويت' },
    { value: 'الكويت اليوم (الجريدة الرسمية)', label: 'الكويت اليوم (الجريدة الرسمية)'}
];

export const nodeColorOptions = [
  { value: 'bg-primary', label: 'أساسي (أزرق مخضر)' },
  { value: 'bg-secondary', label: 'ثانوي (رمادي مزرق)' },
  { value: 'bg-accent', label: 'مميز (ذهبي)' },
  { value: 'bg-red-500', label: 'أحمر' },
  { value: 'bg-blue-600', label: 'أزرق' },
  { value: 'bg-green-600', label: 'أخضر' },
  { value: 'bg-yellow-500', label: 'أصفر' },
  { value: 'bg-purple-600', label: 'بنفسجي' },
  { value: 'bg-pink-600', label: 'وردي' },
  { value: 'bg-teal-500', label: 'أزرق مخضر فاتح' },
  { value: 'bg-gray-500', label: 'رمادي' },
];

// --- NAVIGATION ITEMS (The main missing constant) ---
export const NAVIGATION_ITEMS: NavItem[] = [
    { name: 'لوحة التحكم', path: '/dashboard', icon: HomeIcon },
    {
        name: 'الإدارة القانونية', path: '/legal-management', icon: ScaleIcon,
        children: [
            { name: 'إدارة القضايا', path: '/cases', icon: BriefcaseIcon },
            { name: 'تحليل العقود (AI)', path: '/contracts', icon: DocumentTextIcon },
            { name: 'المساعد القانوني (AI)', path: '/ai-assistant', icon: SparklesIcon },
            { name: 'المكتبة القانونية', path: '/resources', icon: BookOpenIcon },
            { name: 'النماذج القانونية', path: '/legal-forms', icon: DocumentDuplicateIcon },
            { name: 'الخرائط الذهنية الذكية', path: '/smart-mind-maps', icon: BrainIcon },
        ]
    },
    {
        name: 'الإدارة الشاملة', path: '/comprehensive-management', icon: FolderIcon,
        children: [
            { name: 'الإدارة المالية', path: '/finance', icon: BanknotesIcon },
            { name: 'إدارة العقارات', path: '/property-management', icon: BuildingOffice2Icon,
                children: [
                    { name: 'سجل الصيانة', path: '/property-management/maintenance', icon: WrenchScrewdriverIcon },
                    { name: 'تسوية المديونيات', path: '/property-management/debt-settlement', icon: ReceiptPercentIcon },
                    { name: 'مستندات العقارات', path: '/property-management/property-documents', icon: FolderIcon },
                    { name: 'تقارير العقارات', path: '/property-management/property-reports', icon: PresentationChartLineIcon },
                ]
            },
            { name: 'شؤون الشركات', path: '/company-affairs', icon: BuildingLibraryIcon },
            { name: 'شؤون الموظفين', path: '/employee-affairs', icon: UsersIcon,
                children: [
                    { name: 'ملفات الموظفين', path: '/employee-affairs/profiles', icon: UserCircleIcon },
                    { name: 'إدارة الإجازات', path: '/employee-affairs/leave-management', icon: CalendarDaysIcon },
                    { name: 'القروض والسلف', path: '/employee-affairs/loans', icon: CurrencyDollarIcon },
                    { name: 'الإجراءات التأديبية', path: '/employee-affairs/disciplinary', icon: ExclamationTriangleIcon },
                    { name: 'التحقيقات الإدارية', path: '/employee-affairs/investigations', icon: GavelIcon },
                    { name: 'طلبات الموظفين', path: '/employee-affairs/requests', icon: ChatBubbleLeftEllipsisIcon },
                    { name: 'احتساب نهاية الخدمة', path: '/employee-affairs/end-of-service', icon: CalculatorIcon },
                ]
            },
            { name: 'الامتثال والالتزامات', path: '/compliance', icon: ShieldCheckIcon },
        ]
    },
    {
        name: 'التواصل والتنظيم', path: '/communication', icon: ShareIcon,
        children: [
            { name: 'الإنابة القانونية', path: '/legal-representation', icon: ShareIcon },
            { name: 'جهات الاتصال', path: '/admin-tools/contacts', icon: UserGroupIcon },
            { name: 'إدارة التنبيهات', path: '/notifications', icon: BellAlertIcon },
        ]
    },
    {
        name: 'الأتمتة والتكاملات', path: '/automation', icon: AutomationIcon,
        children: [
            { name: 'الرول اليومي الآلي', path: '/automated-docket', icon: ListBulletIcon },
            { name: 'بحث بوابة العدل', path: '/moj-search', icon: MagnifyingGlassIcon },
            { name: 'تتبع الأطراف والمهام', path: '/party-tracking', icon: MapPinIcon },
        ]
    },
    {
        name: 'الأدوات والتقارير', path: '/tools-and-reports', icon: WrenchScrewdriverIcon,
        children: [
            { name: 'إدارة المهام الإدارية', path: '/admin-tools/tasks', icon: ClipboardDocumentListIcon },
            { name: 'التقارير الشاملة', path: '/reports', icon: ReportMoneyIcon },
            { name: 'شؤون جمعية المحامين', path: '/kba', icon: GavelIcon },
            { name: 'حاسبة المواعيد القانونية', path: '/tools/legal-deadlines', icon: ClockIcon },
            { name: 'حاسبة الرسوم القضائية', path: '/tools/court-fees', icon: CalculatorIcon },
        ]
    },
    { name: 'الإعدادات', path: '/settings', icon: CogIcon },
];