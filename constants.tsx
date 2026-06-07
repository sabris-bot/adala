

import React from 'react';
import { 
    CaseStatus, CasePriority, RiskLevel, CaseMainType, CourtLevel,
    LegalResourceType, LawBranch, LegalResourceStatus,
    UserRole, UserStatus, Permission,
    ComplianceCategory, ComplianceStatus, ComplianceFrequency, CompliancePriority,
    LitigationStage, NotificationStatus,
    ContractTypeKuwait, TerminationReasonKuwait, LeaveTypeKuwait,
    PropertyType, PropertyUnitStatus, LeaseAgreementStatus, RentPaymentFrequency, RentPaymentStatus,
    PropertyCategoryKuwait, PropertyUnitTypeKuwait, PropertyIntendedUseKuwait, LeaseTermType,
    PaymentMethod,
    CompanyDocumentType, CompanyDocumentStatus, CompanyLegalFormKuwait, CompanyMeetingType, BoardMemberPosition, CorporateActionType, CorporateActionStatus,
    AdminTaskStatus, AdminTaskPriority, AdminTaskCategory,
    ContactType,
    LoanType, LoanStatus, InstallmentStatus,
    ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus,
    EmployeeRequestType, EmployeeRequestStatus,
    MindMapLayoutType, MindMapShape,
    FinancialTransactionType, ExpenseCategory, PurchaseCategory,
    KBALawyerEnrollmentStatus, KBAPublicationType, KBASeminarStatus, KBASeminarRegistrationStatus,
    KBAProBonoStatus,
    RepresentationRequestStatus, RepresentationPriority,
    TrackingStatus, PartyRelationshipType, FieldTaskCategory,
    SettlementStatus,
    MaintenanceCategory, MaintenancePriority, MaintenanceStatus,
    PropertyDocumentType,
    InvestigationStatus, InvestigationPartyType,
    ExpertActionStatus, ExpertField,
    ExecutionActionType, ExecutionActionStatus,
    LegalFormCategoryOptions,
    NavItem,
    Jurisdiction
} from './types';

// --- ICONS ---
// Helper to create simple SVG icons
const createIcon = (path: React.ReactNode) => (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {path}
  </svg>
);

export const MenuIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />);
export const BellIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />);
export const TableCellsIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5V4.875c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125v14.625m-17.25 0a1.125 1.125 0 001.125 1.125m15.75 0a1.125 1.125 0 011.125-1.125m-15.75 0a1.125 1.125 0 01-1.125-1.125M20.625 19.5a1.125 1.125 0 00-1.125 1.125m-15.75 0a1.125 1.125 0 001.125 1.125m15.75 0a1.125 1.125 0 001.125-1.125M3.375 19.5h17.25" />);
export const BeakerIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .892-.567 1.686-1.392 1.908l-4.47.893c-.482.096-.838.539-.838 1.05v11.29c0 1.125.9 2.036 2.01 2.105a41.018 41.018 0 013.758.337c1.479.231 3.062.231 4.544 0a41.018 41.018 0 013.758-.337c1.11-.069 2.01-.98 2.01-2.105V8.2c0-.511-.356-.954-.838-1.05l-4.47-.893c-.825-.222-1.392-1.016-1.392-1.908V3.104m-8.196 0c0-.616.48-1.135 1.104-1.2h6.084c.624.065 1.104.584 1.104 1.2" />);
export const PlusIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />);
export const ClipboardDocumentCheckIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const XMarkIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />);
export const XIcon = XMarkIcon;
export const GlobeAsiaAustraliaIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253m0 0A8.966 8.966 0 0112 6c1.725 0 3.32-.487 4.674-1.332m-9.348 0A8.966 8.966 0 0012 6c1.725 0 3.32-.487 4.674-1.332" />);
export const LanguageIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />);
export const SwatchIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.903a9.75 9.75 0 0115.804-15.804m-15.804 15.804a9.75 9.75 0 0015.804-15.804m-15.804 15.804V6.75A2.25 2.25 0 016.348 4.5h1.352a2.25 2.25 0 012.25 2.25v3.348a2.25 2.25 0 002.25 2.25h3.348a2.25 2.25 0 012.25 2.25v1.352a2.25 2.25 0 01-2.25 2.25h-6.75a2.25 2.25 0 01-2.25-2.25v-3.348a2.25 2.25 0 00-2.25-2.25H4.5v1.352a2.25 2.25 0 002.25 2.25h1.352" />);
export const Square3Stack3DIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25m11.142 0l4.179-2.25m-15.321 4.5L12 21.75l9.75-5.25" />);
export const KeyIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />);
export const CommandLineIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />);
export const DatabaseIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />);

export const ArrowUturnLeftIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />);
export const PrinterIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />);
export const BoltIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />);
export const CubeIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />);
export const LifebuoyIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-16.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM12 9a3 3 0 100 6 3 3 0 000-6z" />);
export const CursorArrowRaysIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.042 15.19l3.355 3.355m-3.355-10.69L18.397 4.5m-10.69 10.69L4.5 18.397m7.5-12.75V2.25m-7.5 10.5H2.25m9-9h9M9 13.5v9m6-12h9m-9-9v9" />);
export const MagnifyingGlassPlusIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 05.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM10.5 7.5v6m3-3h-6" />);
export const MagnifyingGlassMinusIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 05.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM13.5 10.5h-6" />);
export const ArrowsPointingOutIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />);
export const BellAlertIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />);
export const XCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const ChevronDownIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />);
export const ScaleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />);
export const BriefcaseIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.111 48.111 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />);
export const ClipboardListCheckIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />);
export const UsersIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.164-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />);
export const BuildingOffice2Icon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />);
export const HomeIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />);
export const ShieldCheckIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 011.043 3.296 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />);
export const BanknotesIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.245 0 .487.03.722.086c.621-.504 1.125-1.125 1.125-1.125V6zM3 16.5v-.75A.75.75 0 013.75 15h.75m0 0h-.75a1.125 1.125 0 00-1.125 1.125v1.5a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75v-1.5zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />);
export const DocumentTextIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />);
export const MinimizeIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5l-5.25-5.25" />);
export const MaximizeIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />);
export const SparklesIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />);
export const BookOpenIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />);
export const DocumentDuplicateIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />);
export const BrainIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-4m0-4V6m-5 9h10M7 9h10m-3-6l-2 2-2-2m2 18l2-2h-4" />); // Modern circuit-brain hybrid for AI
export const BuildingLibraryIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0112 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />);
export const ShareIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />);
export const StarIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 00-.183.563l1.171 5.428c.101.466-.41.836-.826.568l-4.701-3.134a.562.562 0 00-.566 0l-4.701 3.134c-.416.268-.927-.102-.826-.568l1.171-5.428a.562.562 0 00-.183-.563L2.51 10.392c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />);
export const FunnelIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />);
export const ChatBubbleLeftRightIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.883.214 1.5 1.035 1.5 1.99v.243c0 .956-.617 1.776-1.5 1.99m0-4.223v4.222m-13.5-3.32h5.25a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5zm0-3h7.5a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5zm0 6h4.5a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5zm0 3h2.25a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5zM21 15.75c0-1.14-.394-2.215-1.054-3.065m1.054 3.065c0 1.258-.512 2.408-1.341 3.255m1.341-3.255H18m0 0l-1.5 1.5m0 0l-1.5-1.5m1.5 1.5V11.25" />);
export const UserGroupIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />);
export const ListBulletIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />);
export const MagnifyingGlassIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 05.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />);
export const MapPinIcon = createIcon(<><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>);
export const ReportMoneyIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />); // Reusing Doc Text Icon roughly or similar
export const GavelIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M14 5l6.5 6.5M11.5 7.5l6.5 6.5M3 21l8-8M19 14l-7-7" />); // Clean Gavel path
export const ClockIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const CalculatorIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75h.008v.008H15.75v-.008zm0-2.25h.008v.008H15.75V13.5zm0-2.25h.008v.008H15.75v-.008zm-2.25 4.5h.008v.008h-.008v-.008zm0-2.25h.008v.008h-.008V13.5zm0-2.25h.008v.008h-.008v-.008zm-2.25 4.5h.008v.008H11.25v-.008zm0-2.25h.008v.008H11.25V13.5zm0-2.25h.008v.008H11.25v-.008zm-2.25 4.5h.008v.008H9v-.008zm0-2.25h.008v.008H9V13.5zm0-2.25h.008v.008H9v-.008zM6.75 18h10.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0017.25 3H6.75A2.25 2.25 0 004.5 5.25v10.5A2.25 2.25 0 006.75 18z" />);
export const TagIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />);
export const SaveIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />);
export const PlusCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const EyeIcon = createIcon(<><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>);
export const PencilIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />);
export const TrashIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />);
export const DocumentPlusIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />);
export const ArchiveBoxIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />);
export const QuestionMarkCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />);
export const ChatBubbleBottomCenterTextIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />);
export const FolderIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />);
export const ShieldExclamationIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002zM12 15.75h.007v.008H12v-.008z" />);
export const LightBulbIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-1.5m0 0a4.875 4.875 0 10-4.875-4.875c0 1.46.656 2.77 1.671 3.655.337.295.67.62.969.986.357.435.79.815 1.282 1.114.318.196.685.32 1.053.32zm0 0v4.5m0 0h1.5m-1.5 0h-1.5m-3-12a1.5 1.5 0 013 0v4.5a1.5 1.5 0 01-3 0v-4.5z" />); // Generic bulb
export const PaperClipIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />);
export const CameraIcon = createIcon(<><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></>);
export const InformationCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />);
export const CurrencyDollarIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const CalendarDaysIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />);
export const AwardIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0V3.75c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125v15m9 0H6.75" />);
export const TargetIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002zM12 15.75h.007v.008H12v-.008z" />);
export const HistoryIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0" />);
export const SearchIcon = MagnifyingGlassIcon;
export const FileEditIcon = PencilIcon;
export const UserCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />);
export const ExclamationTriangleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />);
export const ChatBubbleLeftEllipsisIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />);
export const ClipboardIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />);
export const ReceiptPercentIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184 48.208 48.208 0 011.927.184 2.25 2.25 0 011.927 2.185v.194a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75v-.194c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927.184z" />); // Approximated
export const LinkIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />);
export const WrenchScrewdriverIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M11.423 20.25a2.25 2.25 0 01-1.07-1.916V15c0-1.242.712-2.316 1.743-2.836l3.704-1.85a4.5 4.5 0 014.28 7.376l-1.042 1.041a.75.75 0 11-1.06-1.06l1.042-1.041a3 3 0 00-2.854-4.834l-3.704 1.85c-.464.232-.782.713-.782 1.254v3.334c0 .355.195.684.508.858l3.473 1.93a.75.75 0 01-.73 1.311l-3.475-1.931a2.25 2.25 0 01-1.127-1.931zM3 15.75V4.5A2.25 2.25 0 015.25 2.25h13.5A2.25 2.25 0 0121 4.5v3.75" />);
export const PresentationChartLineIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />);
export const CogIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.795c0 1.987-.332 3.919-.938 5.727m.938-11.522c.728.32 1.403.712 2.022 1.168.527.394.621 1.096.227 1.623l-.38.506a1.125 1.125 0 01-1.622.228 20.9 20.9 0 00-2.25-1.525m2.022-2.001a18.062 18.062 0 012.75 3.5m-5.772 8.022c-.728-.32-1.403-.712-2.022-1.168a1.125 1.125 0 01-.227-1.623l.38-.506a1.125 1.125 0 011.622-.228 20.9 20.9 0 002.25 1.525m-2.022 2.001a18.062 18.062 0 01-2.75-3.5" />); // Actually Globe/Network, used for settings or general
export const IdentificationIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM10.875 12a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />);
export const ClipboardDocumentListIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />);
export const EnvelopeIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />);
export const SendIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />);
export const PhoneIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />);
export const BuildingStorefrontIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />);
export const UserTieIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 18a6 6 0 0115 0M11 11l1 4 1-4h-2z" />);
export const CheckCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const CheckIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />);
export const ActivityIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l3-9 3 18 3-18 3 18 3-9h3.75" />);
export const ShoppingCartIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />);
export const ChartBarIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125-1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />);
export const PaperAirplaneIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />);
export const GlobeAltIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253m0 0A8.966 8.966 0 0112 6c1.725 0 3.32-.487 4.674-1.332m-9.348 0A8.966 8.966 0 0012 6c1.725 0 3.32-.487 4.674-1.332" />);
export const ArrowPathIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />);
export const ArrowUpRightIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0V15.75" />);
export const ArrowDownRightIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />);
export const MinusCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const Bars3Icon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />);
export const ArrowRightIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />);
export const ArrowLeftIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />);
export const ArrowUpCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const ArrowDownCircleIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const CpuChipIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z" />); // Approximate
export const ViewColumnsIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />);
export const LockClosedIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />);
export const UserPlusIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 19.125a9.86 9.86 0 0110.5-3.75 6.375 6.375 0 00-9.25 4.75h-1.25z" />);
export const TrendingUpIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />);
export const TrendingDownIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />);
export const ArrowDownTrayIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />);
export const DevicePhoneMobileIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />);
export const ComputerDesktopIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.878 2.122L7.5 21h9l-.622-.621a3 3 0 01-.878-2.122V17.25m-7.5 0h7.5m-7.5 0a1.125 1.125 0 01-1.125-1.125V5.25A1.125 1.125 0 015.25 4.125h13.5A1.125 1.125 0 0120.25 5.25v10.875a1.125 1.125 0 01-1.125 1.125H5.25z" />);
export const RectangleGroupIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />);
export const AdjustmentsHorizontalIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />);
export const ChevronLeftIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />);
export const ChevronRightIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />);
export const Squares2X2Icon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h6.75v6.75H3.75V3.75zm10.5 0h6.75v6.75h-6.75V3.75zm-10.5 10.5h6.75v6.75H3.75v-6.75zm10.5 0h6.75v6.75h-6.75v-6.75z" />);
export const ArrowsRightLeftIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />);
export const ChartPieIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.276c4.07.19 7.365 3.485 7.555 7.555a.5.5 0 00.5.5h3.276c.276 0 .5-.224.5-.5A10.01 10.01 0 0010.5.5a.5.5 0 00-.5.5v2.276a.5.5 0 00.5.5z M3.276 13.5a10.01 10.01 0 007.224 7.224.5.5 0 00.5-.5v-3.276a.5.5 0 00-.5-.5 7.555 7.555 0 01-7.224-7.224.5.5 0 00-.5-.5H.5a.5.5 0 00-.5.5 10.01 10.01 0 003.276 3.276z" />); // Approximate
export const CheckBadgeIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 011.043 3.296 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />);
export const CreditCardIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />);
export const PuzzlePieceIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.08V4.5a2.25 2.25 0 00-4.5 0v1.58c0 .13.02.26.07.38a2.25 2.25 0 01-1.97 3.04 2.25 2.25 0 01-2.44-2.07 2.25 2.25 0 00-2.25-2.18h-1.5a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h.06c.13 0 .26.02.38.07a2.25 2.25 0 011.04 3.12 2.25 2.25 0 01-3.12 1.04 2.25 2.25 0 00-2.18-2.25v1.5a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-.06c0-.13.02-.26.07-.38a2.25 2.25 0 013.12-1.04 2.25 2.25 0 011.04 3.12 2.25 2.25 0 002.25 2.18h1.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-.06c-.13 0-.26-.02-.38-.07a2.25 2.25 0 01-1.04-3.12 2.25 2.25 0 013.12-1.04 2.25 2.25 0 002.18 2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v.06c0 .13-.02.26-.07.38a2.25 2.25 0 01-3.12 1.04 2.25 2.25 0 01-1.04-3.12 2.25 2.25 0 00-2.25-2.18h1.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-.06c-.13 0-.26-.02-.38-.07a2.25 2.25 0 01-1.04-3.12 2.25 2.25 0 013.12-1.04 2.25 2.25 0 002.18 2.25v1.5a2.25 2.25 0 002.25 2.25z" />);
 // Approximate path
export const AcademicCapIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.174L12 14.5l7.74-4.326a.75.75 0 000-1.348L12 4.5l-7.74 4.326a.75.75 0 000 1.348zM12 14.5v6.25m-7.5-6.25l7.5 4.326M19.5 14.5l-7.5 4.326" />);
export const CloudArrowUpIcon = createIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />);

// --- CONSTANTS ---
export const GEMINI_TEXT_MODEL = "gemini-3-flash-preview";

export const OFFICE_NAME = "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية";

// --- JURISDICTIONS ---
export const JURISDICTIONS: Jurisdiction[] = [
  {
    code: 'KW',
    name: 'الكويت',
    nameEn: 'Kuwait',
    currencyCode: 'KWD',
    currencySymbol: 'د.ك',
    currencyNameAr: 'دينار كويتي',
    flag: '🇰🇼',
    legalInterest: {
      civilRate: 4,
      commercialRate: 7,
      isCappedAtPrincipal: true,
      defaultAttorneyFeesPercent: 5,
      defaultAttorneyFeesMin: 10
    },
    courtFeesConfig: {
      fixedFees: {
        totalCourt: 100,
        partialCourt: 100,
        appeal: 100,
        cassation: 100,
        petition: 10,
        expert: 300
      },
      proportionalRules: {
        minFee: 10,
        tiers: [
          { limit: 30000, rate: 0.05 },
          { limit: 150000, rate: 0.035 },
          { limit: 500000, rate: 0.025 },
          { limit: 5000000, rate: 0.015 },
          { limit: Infinity, rate: 0.01 }
        ]
      }
    },
    laborLaw: {
      annualLeaveDays: 30,
      indemnityRules: {
        firstPeriodYears: 5,
        firstPeriodDaysPerYear: 15,
        subsequentPeriodDaysPerYear: 30,
        maxIndemnityMonths: 18,
        resignationAdjustment: {
          under3Years: 0,
          threeToFiveYears: 0.5,
          fiveToTenYears: 0.666,
          overTenYears: 1
        }
      },
      sickLeaveRules: {
        fullPayDays: 15,
        threeQuarterPayDays: 10,
        halfPayDays: 10,
        quarterPayDays: 10,
        noPayDays: 30
      },
      references: {
        annualLeaveArticle: 'المادة 70',
        sickLeaveArticle: 'المادة 69',
        indemnityArticle: 'المادة 51',
        disciplinaryArticle: 'المواد 26-29',
        lawNameAr: 'قانون العمل في القطاع الأهلي رقم 6 لسنة 2010'
      },
      disciplinaryRules: {
        maxDeductionDaysPerMonth: 5,
        investigationRequired: true,
        appealPeriodDays: 15,
        rules: [
            { article: '35', text: 'لا يجوز توقيع جزاء على العامل إلا بعد إبلاغه كتابة بما هو منسوب إليه وسماع أقواله وتحقيق دفاعه وإثبات ذلك في محضر يودع بملفه الخاص.' },
            { article: '35 (مكرر)', text: 'يجب أن يكون الجزاء متناسباً مع المخالفة المرتكبة، ولا يجوز توقيع أكثر من جزاء واحد عن المخالفة الواحدة.' },
            { article: '36', text: 'لا يجوز توقيع الجزاء بعد مضي 15 يوماً من تاريخ ثبوت المخالفة، كما لا يجوز توقيعه بعد مضي 30 يوماً من تاريخ وقوع المخالفة المستمرة.' },
            { article: '37', text: 'الجزاءات التي يجوز لصاحب العمل توقيعها هي: الإنذار، الخصم من الأجر (بما لا يجاوز 5 أيام في الشهر)، الإيقاف عن العمل (بما لا يجاوز 10 أيام)، الحرمان من العلاوة السنوية أو تأجيلها (بما لا يجاوز 3 أشهر)، الحرمان من الترقية أو تأجيلها (بما لا يجاوز سنة)، الفصل من الخدمة.' },
            { article: '38', text: 'يجوز وقف العامل عن العمل لمصلحة التحقيق لمدة لا تتجاوز 10 أيام مع صرف أجره، فإذا انتهى التحقيق بالحفظ أو رأت الإدارة عدم مجازاة العامل، صُرف له ما قد يكون قد استقطع من أجره.' },
            { article: '41', text: 'يجوز لصاحب العمل فصل العامل دون إنذار أو مكافأة في حالات محددة كارتكاب خطأ جسيم أدى لخسارة جسيمة، أو إفشاء أسرار المنشأة، أو الاعتداء على صاحب العمل، أو الغياب لأكثر من 7 أيام متصلة أو 20 يوماً متقطعة.' }
        ]
      }
    }
  },
  {
    code: 'EG',
    name: 'مصر',
    nameEn: 'Egypt',
    currencyCode: 'EGP',
    currencySymbol: 'ج.م',
    currencyNameAr: 'جنيه مصري',
    flag: '🇪🇬',
    legalInterest: {
      civilRate: 4,
      commercialRate: 5,
      isCappedAtPrincipal: false,
      defaultAttorneyFeesPercent: 0
    },
    courtFeesConfig: {
      fixedFees: {
        totalCourt: 50,
        partialCourt: 25,
        appeal: 50,
        cassation: 100,
        petition: 5,
        expert: 100
      },
      proportionalRules: {
        minFee: 5,
        tiers: [
          { limit: 10000, rate: 0.02 },
          { limit: Infinity, rate: 0.01 }
        ]
      }
    },
    laborLaw: {
      annualLeaveDays: 21, // 30 after 10 years or over 50
      indemnityRules: {
        firstPeriodYears: 5,
        firstPeriodDaysPerYear: 15,
        subsequentPeriodDaysPerYear: 30,
        resignationAdjustment: {
          under3Years: 1, // Egypt specific resignation rules differ, usually no "reduction" but "entitlement"
          threeToFiveYears: 1,
          fiveToTenYears: 1,
          overTenYears: 1
        }
      },
      sickLeaveRules: {
        fullPayDays: 0, // Rules are complex (Social Security)
        threeQuarterPayDays: 90, // approx
        halfPayDays: 90,
        quarterPayDays: 0,
        noPayDays: 180
      },
      references: {
        annualLeaveArticle: 'المادة 47',
        sickLeaveArticle: 'المادة 54',
        disciplinaryArticle: 'المواد 58-69',
        lawNameAr: 'قانون العمل المصري رقم 12 لسنة 2003'
      },
      disciplinaryRules: {
        maxDeductionDaysPerMonth: 5,
        investigationRequired: true,
        appealPeriodDays: 15,
        rules: [
            { article: '58', text: 'لا يجوز توقيع جزاء تأديبي على العامل إلا بعد إبلاغه بما نُسب إليه كتابة وسماع أقواله وتحقيق دفاعه.' },
            { article: '62', text: 'لا يجوز لصاحب العمل أن يوقع جزاء الخصم من الأجر عن المخالفة الواحدة بما يزيد على أجر خمسة أيام.' },
            { article: '64', text: 'يختص المدير المسؤول بتوقيع جزائي الإنذار والخصم من الأجر لمـدة لا تتجاوز ثلاثة أيام.' }
        ]
      }
    }
  },
  {
    code: 'SA',
    name: 'السعودية',
    nameEn: 'Saudi Arabia',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    currencyNameAr: 'ريال سعودي',
    flag: '🇸🇦',
    legalInterest: {
      civilRate: 0, 
      commercialRate: 5,
      isCappedAtPrincipal: true,
      defaultAttorneyFeesPercent: 10
    },
    courtFeesConfig: {
      fixedFees: {
        totalCourt: 500,
        partialCourt: 250,
        appeal: 500,
        cassation: 1000,
        petition: 100,
        expert: 500
      },
      proportionalRules: {
        minFee: 100,
        tiers: [
          { limit: Infinity, rate: 0.05 }
        ]
      }
    },
    laborLaw: {
      annualLeaveDays: 21, // 30 after 5 years
      indemnityRules: {
        firstPeriodYears: 5,
        firstPeriodDaysPerYear: 15,
        subsequentPeriodDaysPerYear: 30,
        resignationAdjustment: {
          under3Years: 0,
          threeToFiveYears: 0.333,
          fiveToTenYears: 0.666,
          overTenYears: 1
        }
      },
      sickLeaveRules: {
        fullPayDays: 30,
        threeQuarterPayDays: 60,
        halfPayDays: 0,
        quarterPayDays: 0,
        noPayDays: 0
      }
    }
  },
  {
    code: 'AE',
    name: 'الإمارات',
    nameEn: 'UAE',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    currencyNameAr: 'درهم إماراتي',
    flag: '🇦🇪',
    legalInterest: {
      civilRate: 9,
      commercialRate: 12,
      isCappedAtPrincipal: true,
      defaultAttorneyFeesPercent: 0
    },
    courtFeesConfig: {
      fixedFees: {
        totalCourt: 500,
        partialCourt: 250,
        appeal: 500,
        cassation: 1000,
        petition: 100,
        expert: 500
      },
      proportionalRules: {
        minFee: 100,
        tiers: [{ limit: Infinity, rate: 0.05 }]
      }
    },
    laborLaw: {
      annualLeaveDays: 30,
      indemnityRules: {
        firstPeriodYears: 5,
        firstPeriodDaysPerYear: 21,
        subsequentPeriodDaysPerYear: 30,
        resignationAdjustment: {
          under3Years: 1,
          threeToFiveYears: 1,
          fiveToTenYears: 1,
          overTenYears: 1
        }
      },
      sickLeaveRules: {
        fullPayDays: 15,
        threeQuarterPayDays: 0,
        halfPayDays: 30,
        quarterPayDays: 0,
        noPayDays: 45
      }
    }
  }
];

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: 'الرئيسية',
    translationKey: 'dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    sectionHeader: 'النظام الأساسي',
    sectionTranslationKey: 'main_system'
  },
  {
    name: 'إدارة القضايا',
    translationKey: 'case_management',
    path: '/cases',
    icon: BriefcaseIcon
  },
  {
    name: 'المساعد الذكي',
    translationKey: 'ai_assistant',
    path: '/ai-assistant',
    icon: BrainIcon
  },
  {
    name: 'الخرائط الذهنية',
    translationKey: 'smart_mind_maps',
    path: '/smart-mind-maps',
    icon: Squares2X2Icon
  },
  {
    name: 'شؤون الشركات',
    translationKey: 'company_affairs',
    path: '/company-affairs',
    icon: BuildingLibraryIcon,
    sectionHeader: 'الأعمال والأصول',
    sectionTranslationKey: 'business_assets'
  },
  {
    name: 'إدارة العقارات',
    translationKey: 'property_management',
    path: '/property-management',
    icon: BuildingOffice2Icon,
    children: [
        { name: 'العقارات والوحدات', translationKey: 'properties_units', path: '/property-management', icon: HomeIcon },
        { name: 'تسوية الديون', translationKey: 'debt_settlement', path: '/property-management/debt-settlement', icon: BanknotesIcon },
        { name: 'صيانة العقارات', translationKey: 'maintenance', path: '/property-management/maintenance', icon: WrenchScrewdriverIcon },
        { name: 'وثائق العقارات', translationKey: 'property_documents', path: '/property-management/property-documents', icon: FolderIcon },
        { name: 'تقارير العقارات', translationKey: 'property_reports', path: '/property-management/reports', icon: PresentationChartLineIcon },
    ]
  },
  {
    name: 'تحليل العقود (AI)',
    translationKey: 'contract_analysis',
    path: '/contracts',
    icon: DocumentTextIcon
  },
  {
    name: 'شؤون الموظفين', 
    translationKey: 'employee_affairs',
    path: '/employee-affairs', 
    icon: UsersIcon,
    sectionHeader: 'الموارد والامتثال',
    sectionTranslationKey: 'hr_compliance',
    children: [
        { name: 'ملفات الموظفين', translationKey: 'employee_profiles', path: '/employee-affairs/profiles', icon: UserCircleIcon },
        { name: 'التحقيقات الإدارية', translationKey: 'investigations', path: '/employee-affairs/investigations', icon: GavelIcon },
        { name: 'الجزاءات التأديبية', translationKey: 'disciplinary_actions', path: '/employee-affairs/disciplinary', icon: ScaleIcon },
        { name: 'الإجازات', translationKey: 'leaves', path: '/employee-affairs/leave-management', icon: CalendarDaysIcon },
        { name: 'القروض والسلف', translationKey: 'loans', path: '/employee-affairs/loans', icon: BanknotesIcon },
        { name: 'تقييم الأداء', translationKey: 'performance_appraisal', path: '/employee-affairs/performance', icon: ActivityIcon },
        { name: 'طلبات الموظفين', translationKey: 'employee_requests', path: '/employee-affairs/requests', icon: EnvelopeIcon },
        { name: 'نهاية الخدمة', translationKey: 'end_of_service', path: '/employee-affairs/end-of-service', icon: CalculatorIcon },
    ]
  },
  {
    name: 'الامتثال الرقابي',
    translationKey: 'compliance',
    path: '/compliance',
    icon: ShieldCheckIcon
  },
  {
    name: 'أدوات التقاضي',
    translationKey: 'litigation_management',
    path: '/litigation-tools',
    icon: CpuChipIcon,
    sectionHeader: 'الأدوات الرقمية',
    sectionTranslationKey: 'digital_tools',
    children: [
        { name: 'الرول الآلي', translationKey: 'automated_docket', path: '/automated-docket', icon: CalendarDaysIcon },
        { name: 'بحث بوابة العدل', translationKey: 'moj_search', path: '/moj-search', icon: MagnifyingGlassIcon },
        { name: 'تتبع الأطراف', translationKey: 'party_tracking', path: '/party-tracking', icon: MapPinIcon },
        { name: 'الإنابة القانونية', translationKey: 'legal_representation', path: '/legal-representation', icon: ShareIcon },
        { name: 'جمعية المحامين', translationKey: 'kba', path: '/kba', icon: BuildingLibraryIcon },
    ]
  },
  {
    name: 'الحاسبات القانونية',
    translationKey: 'legal_calculators',
    path: '/tools/legal-financial-calc',
    icon: CalculatorIcon,
    children: [
        { name: 'حاسبة المواريث', translationKey: 'inheritance_calc', path: '/tools/inheritance', icon: AcademicCapIcon },
        { name: 'رسوم المحاكم', translationKey: 'court_fees', path: '/tools/court-fees', icon: CreditCardIcon },
        { name: 'الفوائد القانونية', translationKey: 'legal_interests', path: '/tools/legal-interests', icon: TrendingUpIcon },
        { name: 'المواعيد القانونية', translationKey: 'legal_deadlines', path: '/tools/legal-deadlines', icon: ClockIcon },
    ]
  },
  {
    name: 'المكتبة القانونية',
    translationKey: 'legal_resources',
    path: '/resources',
    icon: BookOpenIcon,
    sectionHeader: 'المعرفة والوثائق',
    sectionTranslationKey: 'knowledge_docs'
  },
  {
    name: 'النماذج القانونية',
    translationKey: 'legal_forms',
    path: '/legal-forms',
    icon: DocumentDuplicateIcon
  },
  {
    name: 'منظومة الطباعة والصكوك',
    translationKey: 'deeds_printing_studio',
    path: '/deeds-print',
    icon: PrinterIcon
  },
  {
    name: 'الإدارة المالية',
    translationKey: 'financial_management',
    path: '/finance',
    icon: CurrencyDollarIcon,
    sectionHeader: 'الإدارة والنظام',
    sectionTranslationKey: 'admin_management',
  },
  {
    name: 'أدوات الإدارة',
    translationKey: 'admin_tools',
    path: '/admin-tools',
    icon: CogIcon,
    children: [
        { name: 'إدارة المهام', translationKey: 'task_management', path: '/admin-tools/tasks', icon: ClipboardDocumentListIcon },
        { name: 'جهات الاتصال', translationKey: 'contacts', path: '/admin-tools/contacts', icon: UserGroupIcon },
        { name: 'الإشعارات', translationKey: 'notifications', path: '/notifications', icon: BellAlertIcon },
        { name: 'التقارير المركزية', translationKey: 'reports', path: '/reports', icon: PresentationChartLineIcon },
        { name: 'الإعدادات', translationKey: 'settings', path: '/settings', icon: CogIcon },
    ]
  }
];

// --- INVESTIGATION TEMPLATES ---
export const INVESTIGATION_TEMPLATES = [
    {
        id: 'absenteeism',
        title: 'تحقيق غياب بدون إذن / انقطاع مفاجئ',
        questions: [
            'ما هو العذر القانوني لغيابك عن العمل في الفترة من (...) إلى (...)؟',
            'هل قمت بمراجعة أي منشأة طبية رسمية خلال فترة الغياب؟',
            'لماذا لم تقم بإبلاغ المسؤول المباشر عبر أي وسيلة اتصال متاحة؟',
            'هل تدرك أن الانقطاع لمدة 7 أيام متصلة ينهي عقدك قانوناً وفق المادة 41؟',
            'هل سبق وأن تم توجيه لفت نظر لك بخصوص الغياب أو التأخير؟'
        ]
    },
    {
        id: 'negligence',
        title: 'تحقيق في إهمال وظيفي جسيم / خسارة مادية',
        questions: [
            'ما هي الخطوات المتبعة رسمياً للقيام بمهمة (...) وفقاً للوائح المنشأة؟',
            'كيف حدث الخطأ الفني الذي أدى لتوقف العمل أو الخسارة المالية؟',
            'هل كنت تحت إشراف مباشر وقت وقوع الحادثة؟',
            'لماذا لم يتم تدارك الخطأ قبل تفاقمه؟ وهل هناك أعطال تقنية ساهمت في ذلك؟',
            'هل تقر بمسؤوليتك المباشرة عن الخسارة المادية المقدرة بـ (...)؟'
        ]
    },
    {
        id: 'social_media',
        title: 'إساءة استخدام وسائل التواصل (السلوك الرقمي)',
        questions: [
            'هل قمت بنشر المحتوى المنسوب إليك في منصة التواصل الاجتماعي؟',
            'هل تدرك أن الإساءة لسمعة المنشأة أو عملائها رقمياً يعد مخالفة جسيمة؟',
            'ما هو القصد من التدوينة التي تناولت فيها أسرار العمل الداخلية؟',
            'هل اطلعت على سياسة التواصل والظهور الإعلامي المعتمدة بالمنشأة؟',
            'من هم الأشخاص الذين قاموا بالتفاعل أو مشاركة هذا المحتوى معك؟'
        ]
    },
    {
        id: 'conflict_of_interest',
        title: 'تضارب المصالح / العمل لدى جهة منافسة',
        questions: [
            'هل تمارس أي نشاط تجاري أو مهني في نفس مجال تخصص الشركة؟',
            'ما هي علاقتك بشركة (...) التي تعد منافساً مباشراً لنا؟',
            'هل قمت بتقديم خدمات فنية أو استشارية خارج أوقات الدوام لجهات أخرى؟',
            'هل تتقاضى أي مبالغ مالية أو عمولات من الموردين المتعاقد معهم؟',
            'لماذا لم تفصح عن علاقتك بـ (...) عند توقيع نموذج الإفصاح السنوي؟'
        ]
    },
    {
        id: 'harassment_bullying',
        title: 'تحقيق في مضايقة / تنمر / تحرش في بيئة العمل',
        questions: [
            'ما هو ردك على تفاصيل الشكوى المقدمة من الزميل(ة) (...)؟',
            'هل تنكر استخدام الألفاظ أو الإيحاءات الواردة في نص الشكوى؟',
            'كيف تصف طبيعة العلاقة والتعامل اليومي بينك وبين الشاكي؟',
            'هل هناك أي احتيكاك أو خلافات سابقة كانت هي السبب في هذا التصرف؟',
            'هل أنت على علم بسياسة (Zero Tolerance) التي تتبعها الإدارة تجاه التنمر؟'
        ]
    },
    {
        id: 'confidentiality',
        title: 'إفشاء أسرار العمل / تسريب بيانات حساسة',
        questions: [
            'من هم الأشخاص الذين لديهم صلاحية الوصول لملفات (...) غيرك؟',
            'هل قمت بنسخ بيانات العملاء أو الخطط الاستراتيجية على وسائط خارجية؟',
            'كيف انتقلت هذه المعلومات السرية لجهة منافسة وفقاً لتقرير أمن المعلومات؟',
            'هل تدرك التبعات الجنائية والمدنية (تزوير/إساءة أمانة) لهذه الواقعة؟'
        ]
    },
    {
        id: 'attendance_fraud',
        title: 'تلاعب في سجلات الحضور والانصراف (تزوير البصمة)',
        questions: [
            'من قام بإجراء البصمة الخاصة بك في تمام الساعة (...) يوم (...)؟',
            'لماذا لا يتطابق وقت البصمة مع وقت ظهورك في كاميرات المراقبة بالمدخل؟',
            'هل قمت بإعطاء كلمة السر أو وسيلة التعريف الخاصة بك لزميل آخر؟',
            'هل هناك عطل تقني في جهاز البصمة تدعيه في هذا الوقت؟',
            'ما هو ردك على اتهامك بتزوير ساعات العمل الإضافية؟'
        ]
    },
    {
        id: 'drugs_alcohol',
        title: 'الحضور تحت تأثير مسكرات أو مواد مخدرة',
        questions: [
            'ما هو سبب المظهر غير المتزن أو الرائحة الغريبة التي لاحظها الزملاء؟',
            'هل تتناول أي عقاقير طبية موثقة بتقارير رسمية قد تسبب هذا الخمول؟',
            'لماذا رفضت الخضوع للفحص الطبي الأولي عند طلبه من قبل الأمن؟',
            'هل تدرك أن التواجد في العمل بحالة سكر يعد مخالفة توجب الفصل الفوري؟'
        ]
    },
    {
        id: 'insubordination',
        title: 'عدم تنفيذ الأوامر / التمرد على الرئيس المباشر',
        questions: [
            'لماذا رفضت تنفيذ التعليمات الصادره لك بخصوص (...)؟',
            'هل هناك مبرر قانوني أو فني يمنعك من تنفيذ هذا الأمر؟',
            'لماذا استخدمت أسلوباً غير لائق في التحدث مع مديرك المباشر؟',
            'هل تدرك أن مخالفة الأوامر المشروعة تعد إخلالاً جوهرياً بعقد العمل؟'
        ]
    },
    {
        id: 'safety_damage',
        title: 'إتلاف ممتلكات أو مخالفة تعليمات السلامة',
        questions: [
            'كيف حدث التلف في الماكينة/النظام رقم (...)؟',
            'هل كان التلف ناتجاً عن إهمال، أم بفعل فاعل متعمد كما ورد بتقرير الصيانة؟',
            'لماذا لم تبلغ عن التلف فور وقوعه؟',
            'لماذا لم تلتزم بارتداء مهمات الوقاية الشخصية أثناء العمل في الموقع؟'
        ]
    },
    {
        id: 'sabotage',
        title: 'إتلاف ممتلكات أو تخريب متعمد',
        questions: [
            'كيف حدث التلف في الماكينة/النظام رقم (...)؟',
            'ما هي أسباب توقف العمل المفاجئ بعد استخدامك مباشرة للشاشة؟',
            'هل كان التلف ناتجاً عن إهمال، أم بفعل فاعل متعمد كما ورد بتقرير الصيانة؟',
            'لماذا لم تبلغ عن التلف فور وقوعه؟'
        ]
    }
];

// --- LEGAL RULES (Labor Law) ---
export const KUWAIT_LABOR_LAW_INVESTIGATION_RULES = [
    { article: '35', text: 'لا يجوز توقيع جزاء على العامل إلا بعد إبلاغه كتابة بما هو منسوب إليه وسماع أقواله وتحقيق دفاعه إثبات ذلك في محضر يودع بملفه الخاص.' },
    { article: '35 (مكرر)', text: 'يجب أن يكون الجزاء متناسباً مع المخالفة المرتكبة، ولا يجوز توقيع أكثر من جزاء واحد عن المخالفة الواحدة.' },
    { article: '36', text: 'لا يجوز توقيع الجزاء بعد مضي 15 يوماً من تاريخ ثبوت المخالفة، كما لا يجوز توقيعه بعد مضي 30 يوماً من تاريخ وقوع المخالفة المستمرة.' },
    { article: '37', text: 'الجزاءات التي يجوز لصاحب العمل توقيعها هي: الإنذار، الخصم من الأجر (بما لا يجاوز 5 أيام في الشهر)، الإيقاف عن العمل (بما لا يجاوز 10 أيام)، الحرمان من العلاوة السنوية أو تأجيلها (بما لا يجاوز 3 أشهر)، الحرمان من الترقية أو تأجيلها (بما لا يجاوز سنة)، الفصل من الخدمة.' },
    { article: '38', text: 'يجوز وقف العامل عن العمل لمصلحة التحقيق لمدة لا تتجاوز 10 أيام مع صرف أجره، فإذا انتهى التحقيق بالحفظ أو رأت الإدارة عدم مجازاة العامل، صُرف له ما قد يكون قد استقطع من أجره.' },
    { article: '41', text: 'يجوز لصاحب العمل فصل العامل دون إنذار أو مكافأة في حالات محددة كارتكاب خطأ جسيم أدى لخسارة جسيمة، أو إفشاء أسرار المنشأة، أو الاعتداء على صاحب العمل، أو الغياب لأكثر من 7 أيام متصلة أو 20 يوماً متقطعة.' }
];

export const KUWAIT_LEGAL_VIOLATIONS = [
    { id: 'v1', label: 'إفشاء أسرار المنشأة', article: '41', severity: 'High', punishment: 'Termination' },
    { id: 'v2', label: 'الاعتداء على صاحب العمل أو المسؤول', article: '41', severity: 'High', punishment: 'Termination' },
    { id: 'v3', label: 'الغياب المتصل (أكثر من 7 أيام)', article: '41', severity: 'Medium', punishment: 'Termination' },
    { id: 'v4', label: 'ارتكاب خطأ جسيم أدى لخسارة مادية', article: '41', severity: 'High', punishment: 'Termination' },
    { id: 'v5', label: 'مخالفة تعليمات السلامة واللوائح', article: '37', severity: 'Medium', punishment: 'Suspension/Fine' },
    { id: 'v6', label: 'انخفاض الكفاءة الإنتاجية المستمر', article: '37', severity: 'Low', punishment: 'Warning' },
    { id: 'v7', label: 'التواجد في حالة سكر أو تعاطي مؤثرات', article: '41', severity: 'High', punishment: 'Termination' },
    { id: 'v8', label: 'التزوير في محررات المنشأة', article: '41', severity: 'High', punishment: 'Termination' },
    { id: 'v9', label: 'تحريض العمال على الإضراب م41', article: '41', severity: 'High', punishment: 'Termination' },
    { id: 'v10', label: 'منافسة رب العمل في ذات النشاط', article: '41', severity: 'Medium', punishment: 'Termination' },
];

export const INVESTIGATION_STATUS_LEGAL = [
    { value: 'Summoned', label: 'إخطار بالحضور (إعلان)', color: 'blue' },
    { value: 'In_Progress', label: 'جلسة تحقيق جارية', color: 'amber' },
    { value: 'Referred_to_Legal', label: 'محال للرأي القانوني', color: 'indigo' },
    { value: 'Decision_Pending', label: 'بانتظار القرار النهائي', color: 'purple' },
    { value: 'Archived', label: 'حفظ لعدم الأهمية/الثبوت', color: 'slate' },
    { value: 'Penalty_Issued', label: 'صدر قرار جزائي', color: 'rose' }
];
export const caseStatusOptions = Object.values(CaseStatus).map(s => ({ value: s, label: s }));
export const casePriorityOptions = Object.values(CasePriority).map(p => ({ value: p, label: p }));
export const riskLevelOptions = Object.values(RiskLevel).map(r => ({ value: r, label: r }));
export const caseMainTypeOptions = Object.values(CaseMainType).map(t => ({ value: t, label: t }));
export const courtLevelOptions = Object.values(CourtLevel).map(l => ({ value: l, label: l }));

// Mock lists for filtering (can be expanded or fetched from API in real app)
export const courtDegreeOptions = courtLevelOptions; 
export const caseGroupOptions = [{value: 'قضايا هامة', label: 'قضايا هامة'}, {value: 'مجموعة أ', label: 'مجموعة أ'}, {value: 'مجموعة ب', label: 'مجموعة ب'}];
export const partyRoleGroups = [
  {
    label: 'التقاضي (مدني/تجاري/إداري)',
    options: [
      { value: 'مدعي', label: 'مدعي' },
      { value: 'مدعى عليه', label: 'مدعى عليه' },
      { value: 'مستأنف', label: 'مستأنف' },
      { value: 'مستأنف ضده', label: 'مستأنف ضده' },
      { value: 'طاعن', label: 'طاعن' },
      { value: 'مطعون ضده', label: 'مطعون ضده' },
      { value: 'خصم', label: 'خصم' },
      { value: 'خصم متدخل', label: 'خصم متدخل' },
      { value: 'متدخل انضمامي', label: 'متدخل انضمامي' },
      { value: 'متدخل هجومي', label: 'متدخل هجومي' },
      { value: 'معترض', label: 'معترض' },
      { value: 'متظلم', label: 'متظلم' },
      { value: 'متظلم ضده', label: 'متظلم ضده' },
    ]
  },
  {
    label: 'الطلبات وأوامر الأداء',
    options: [
      { value: 'طالب', label: 'طالب' },
      { value: 'مطلوب ضده', label: 'مطلوب ضده' },
      { value: 'طالب أمر', label: 'طالب أمر' },
      { value: 'مستشكل', label: 'مستشكل' },
    ]
  },
  {
    label: 'الجنائي والجزائي',
    options: [
      { value: 'شاكي', label: 'شاكي' },
      { value: 'مشكو في حقه', label: 'مشكو في حقه' },
      { value: 'متهم', label: 'متهم' },
      { value: 'مجني عليه', label: 'مجني عليه' },
      { value: 'مدعي بالحق المدني', label: 'مدعي بالحق المدني' },
      { value: 'مسؤول مدني', label: 'مسؤول مدني' },
    ]
  },
  {
    label: 'التنفيذ والإفلاس',
    options: [
      { value: 'طالب تنفيذ', label: 'طالب تنفيذ' },
      { value: 'منفذ ضده', label: 'منفذ ضده' },
      { value: 'دائن', label: 'دائن' },
      { value: 'مدين', label: 'مدين' },
      { value: 'كفيل', label: 'كفيل' },
      { value: 'ضامن', label: 'ضامن' },
      { value: 'محجوز لديه', label: 'محجوز لديه' },
      { value: 'طالب شهر إفلاس', label: 'طالب شهر إفلاس' },
      { value: 'مفلس', label: 'مفلس' },
    ]
  },
  {
    label: 'الأحوال الشخصية والمدني',
    options: [
      { value: 'وارث', label: 'وارث' },
      { value: 'مورث', label: 'مورث' },
      { value: 'قاصر', label: 'قاصر' },
      { value: 'ولي طبيعي', label: 'ولي طبيعي' },
      { value: 'وصي', label: 'وصي' },
      { value: 'قيّم', label: 'قيّم' },
      { value: 'حارس قضائي', label: 'حارس قضائي' },
      { value: 'مستفيد', label: 'مستفيد' },
    ]
  },
  {
    label: 'الشركات والوظائف',
    options: [
      { value: 'ممثل قانوني', label: 'ممثل قانوني' },
      { value: 'ممثل الشركة', label: 'ممثل الشركة' },
      { value: 'المدير المسؤول', label: 'المدير المسؤول' },
      { value: 'المصفي', label: 'المصفي' },
      { value: 'الشريك', label: 'الشريك' },
      { value: 'صاحب العمل', label: 'صاحب العمل' },
      { value: 'العامل', label: 'العامل' },
      { value: 'الموظف', label: 'الموظف' },
      { value: 'جهة إدارية', label: 'جهة إدارية' },
      { value: 'جهة حكومية', label: 'جهة حكومية' },
      { value: 'شركة', label: 'شركة' },
      { value: 'مؤسسة', label: 'مؤسسة' },
    ]
  },
  {
    label: 'العقود والالتزامات',
    options: [
      { value: 'المؤجر', label: 'المؤجر' },
      { value: 'المستأجر', label: 'المستأجر' },
      { value: 'البائع', label: 'البائع' },
      { value: 'المشتري', label: 'المشتري' },
      { value: 'المقاول', label: 'المقاول' },
      { value: 'محال له', label: 'محال له' },
      { value: 'محيل', label: 'محيل' },
      { value: 'مؤمن', label: 'مؤمن' },
      { value: 'شركة تأمين', label: 'شركة تأمين' },
      { value: 'متسبب بالضرر', label: 'متسبب بالضرر' },
      { value: 'متضرر', label: 'متضرر' },
    ]
  },
  {
    label: 'أطراف أخرى',
    options: [
      { value: 'خبير', label: 'خبير' },
      { value: 'شاهد', label: 'شاهد' },
      { value: 'محكم', label: 'محكم' },
      { value: 'وكيل', label: 'وكيل' },
      { value: 'موكل', label: 'موكل' },
    ]
  }
];

export const partyRoleOptions = partyRoleGroups.flatMap(group => group.options);
export const hearingTypeOptions = [{value: 'جلسة أولى', label: 'جلسة أولى'}, {value: 'مرافعة', label: 'مرافعة'}, {value: 'نطق بالحكم', label: 'نطق بالحكم'}, {value: 'تقديم مستندات', label: 'تقديم مستندات'}, {value: 'تحقيق', label: 'تحقيق'}, {value: 'خبراء', label: 'خبراء'}];
export const reportTypeOptions = [{value: 'status', label: 'حسب الحالة'}, {value: 'lawyer', label: 'حسب المحامي'}, {value: 'type', label: 'حسب النوع'}];
export const caseFilterStatusOptions = [{value: '', label: 'الكل'}, ...caseStatusOptions];

export const KUWAIT_COURTS_LIST = [
    { value: 'المحكمة الكلية (قصر العدل)', label: 'المحكمة الكلية (قصر العدل)' },
    { value: 'محكمة الاستئناف (قصر العدل)', label: 'محكمة الاستئناف (قصر العدل)' },
    { value: 'محكمة التمييز (قصر العدل)', label: 'محكمة التمييز (قصر العدل)' },
    { value: 'المحكمة الدستورية', label: 'المحكمة الدستورية' },
    { value: 'محكمة الأسرة (حولي)', label: 'محكمة الأسرة (حولي)' },
    { value: 'محكمة الأسرة (الأحمدي)', label: 'محكمة الأسرة (الأحمدي)' },
    { value: 'محكمة الأسرة (الفروانية)', label: 'محكمة الأسرة (الفروانية)' },
    { value: 'محكمة الأسرة (الجهراء)', label: 'محكمة الأسرة (الجهراء)' },
    { value: 'محكمة الأسرة (مبارك الكبير)', label: 'محكمة الأسرة (مبارك الكبير)' },
    { value: 'محكمة الأسرة (العاصمة)', label: 'محكمة الأسرة (العاصمة)' },
    { value: 'مجمع محاكم الرقعي', label: 'مجمع محاكم الرقعي' },
    { value: 'مجمع محاكم حولي', label: 'مجمع محاكم حولي' },
    { value: 'مجمع محاكم الأحمدي', label: 'مجمع محاكم الأحمدي' },
    { value: 'مجمع محاكم الجهراء', label: 'مجمع محاكم الجهراء' },
    { value: 'مجمع محاكم الفروانية', label: 'مجمع محاكم الفروانية' },
];

// Legal Resources
export const legalResourceTypeOptions = Object.values(LegalResourceType).map(t => ({ value: t, label: t }));
export const lawBranchOptions = Object.values(LawBranch).map(b => ({ value: b, label: b }));
export const legalResourceStatusOptions = Object.values(LegalResourceStatus).map(s => ({ value: s, label: s }));
export const countryOptions = [
    { value: 'KW', label: 'الكويت' },
    { value: 'SA', label: 'السعودية' },
    { value: 'AE', label: 'الإمارات' },
    { value: 'EG', label: 'مصر' },
    { value: 'JO', label: 'الأردن' },
];
export const kuwaitIssuingAuthoritiesOptions = [
    { value: 'مجلس الأمة', label: 'مجلس الأمة' },
    { value: 'مجلس الوزراء', label: 'مجلس الوزراء' },
    { value: 'وزارة العدل', label: 'وزارة العدل' },
    { value: 'وزارة التجارة والصناعة', label: 'وزارة التجارة والصناعة' },
    { value: 'وزارة الشؤون الاجتماعية', label: 'وزارة الشؤون الاجتماعية' },
    { value: 'وزارة الداخلية', label: 'وزارة الداخلية' },
    { value: 'ديوان الخدمة المدنية', label: 'ديوان الخدمة المدنية' },
    { value: 'الهيئة العامة للقوى العاملة', label: 'الهيئة العامة للقوى العاملة' },
    { value: 'المحكمة الدستورية', label: 'المحكمة الدستورية' },
    { value: 'محكمة التمييز', label: 'محكمة التمييز' },
];

// Settings & Permissions
export const userRoleOptions = Object.values(UserRole).map(r => ({ value: r, label: r }));
export const userStatusOptions = Object.values(UserStatus).map(s => ({ value: s, label: s }));
export const permissionGroups = [
    { title: 'إدارة النظام', permissions: [{ value: Permission.MANAGE_USERS, label: 'إدارة المستخدمين', description: 'إضافة وتعديل وحذف المستخدمين' }, { value: Permission.MANAGE_SETTINGS, label: 'إدارة الإعدادات', description: 'تغيير إعدادات النظام العامة' }] },
    { title: 'المالية', permissions: [{ value: Permission.VIEW_FINANCIALS, label: 'عرض المالية', description: 'الاطلاع على التقارير المالية' }, { value: Permission.EDIT_FINANCIALS, label: 'تعديل المالية', description: 'إضافة وتعديل المعاملات المالية' }] },
    { title: 'الموارد البشرية', permissions: [{ value: Permission.VIEW_EMPLOYEE_AFFAIRS, label: 'عرض شؤون الموظفين', description: 'الاطلاع على ملفات الموظفين' }, { value: Permission.EDIT_EMPLOYEE_AFFAIRS, label: 'تعديل شؤون الموظفين', description: 'إدارة الموظفين والإجازات والرواتب' }] },
    { title: 'الميزات المتقدمة', permissions: [{ value: Permission.ACCESS_AI_FEATURES, label: 'استخدام الذكاء الاصطناعي', description: 'الوصول للمساعد الذكي وتحليل العقود' }, { value: Permission.EXPORT_REPORTS, label: 'تصدير التقارير', description: 'تصدير البيانات والتقارير' }] },
];

// Compliance
export const complianceCategoryOptions = Object.values(ComplianceCategory).map(c => ({ value: c, label: c }));
export const complianceStatusOptions = Object.values(ComplianceStatus).map(s => ({ value: s, label: s }));
export const complianceFrequencyOptions = Object.values(ComplianceFrequency).map(f => ({ value: f, label: f }));
export const compliancePriorityOptions = Object.values(CompliancePriority).map(p => ({ value: p, label: p }));

// HR / Employee Affairs
export const contractTypeKuwaitOptions = Object.values(ContractTypeKuwait).map(c => ({ value: c, label: c }));
export const terminationReasonKuwaitOptions = Object.values(TerminationReasonKuwait).map(r => ({ value: r, label: r }));
export const leaveTypeKuwaitOptions = Object.values(LeaveTypeKuwait).map(l => ({ value: l, label: l }));
export const loanTypeOptions = Object.values(LoanType).map(t => ({ value: t, label: t }));
export const loanStatusOptions = Object.values(LoanStatus).map(s => ({ value: s, label: s }));
export const installmentStatusOptions = Object.values(InstallmentStatus).map(s => ({ value: s, label: s }));
export const violationTypeKuwaitOptions = Object.values(ViolationTypeKuwait).map(v => ({ value: v, label: v }));
export const disciplinaryPenaltyKuwaitOptions = Object.values(DisciplinaryPenaltyKuwait).map(p => ({ value: p, label: p }));
export const disciplinaryActionStatusOptions = Object.values(DisciplinaryActionStatus).map(s => ({ value: s, label: s }));
export const employeeRequestTypeOptions = Object.values(EmployeeRequestType).map(t => ({ value: t, label: t }));
export const employeeRequestStatusOptions = Object.values(EmployeeRequestStatus).map(s => ({ value: s, label: s }));

// Property Management
export const propertyTypeOptions = Object.values(PropertyType).map(t => ({ value: t, label: t }));
export const propertyUnitStatusOptions = Object.values(PropertyUnitStatus).map(s => ({ value: s, label: s }));
export const leaseAgreementStatusOptions = Object.values(LeaseAgreementStatus).map(s => ({ value: s, label: s }));
export const rentPaymentFrequencyOptions = Object.values(RentPaymentFrequency).map(f => ({ value: f, label: f }));
export const rentPaymentStatusOptions = Object.values(RentPaymentStatus).map(s => ({ value: s, label: s }));
export const propertyCategoryKuwaitOptions = Object.values(PropertyCategoryKuwait).map(c => ({ value: c, label: c }));
export const propertyUnitTypeKuwaitOptions = Object.values(PropertyUnitTypeKuwait).map(t => ({ value: t, label: t }));
export const propertyIntendedUseKuwaitOptions = Object.values(PropertyIntendedUseKuwait).map(u => ({ value: u, label: u }));
export const leaseTermTypeOptions = Object.values(LeaseTermType).map(t => ({ value: t, label: t }));
export const paymentMethodOptions = Object.values(PaymentMethod).map(m => ({ value: m, label: m }));
export const maintenanceCategoryOptions = Object.values(MaintenanceCategory).map(c => ({ value: c, label: c }));
export const maintenancePriorityOptions = Object.values(MaintenancePriority).map(p => ({ value: p, label: p }));
export const maintenanceStatusOptions = Object.values(MaintenanceStatus).map(s => ({ value: s, label: s }));
export const propertyDocumentTypeOptions = Object.values(PropertyDocumentType).map(t => ({ value: t, label: t }));
export const settlementStatusOptions = Object.values(SettlementStatus).map(s => ({ value: s, label: s }));

// Company Affairs
export const companyDocumentTypeOptions = Object.values(CompanyDocumentType).map(t => ({ value: t, label: t }));
export const companyDocumentStatusOptions = Object.values(CompanyDocumentStatus).map(s => ({ value: s, label: s }));
export const companyLegalFormOptionsKuwait = Object.values(CompanyLegalFormKuwait).map(f => ({ value: f, label: f }));
export const companyMeetingTypeOptions = Object.values(CompanyMeetingType).map(t => ({ value: t, label: t }));
export const boardMemberPositionOptions = Object.values(BoardMemberPosition).map(p => ({ value: p, label: p }));
export const corporateActionTypeOptions = Object.values(CorporateActionType).map(t => ({ value: t, label: t }));
export const corporateActionStatusOptions = Object.values(CorporateActionStatus).map(s => ({ value: s, label: s }));

// Admin Tools
export const adminTaskStatusOptions = Object.values(AdminTaskStatus).map(s => ({ value: s, label: s }));
export const adminTaskPriorityOptions = Object.values(AdminTaskPriority).map(p => ({ value: p, label: p }));
export const adminTaskCategoryOptions = Object.values(AdminTaskCategory).map(c => ({ value: c, label: c }));
export const contactTypeOptions = Object.values(ContactType).map(t => ({ value: t, label: t }));

// Legal Forms
export const legalFormCategoryOptions = Object.values(LegalFormCategoryOptions).map(c => ({ value: c, label: c }));

// Mind Maps
export const mindMapLayoutOptions = Object.values(MindMapLayoutType).map(l => ({ value: l, label: (l as string).replace('_', ' ') }));
export const mindMapShapeOptions = Object.values(MindMapShape).map(s => ({ value: s, label: s }));
export const nodeColorOptions = [
    { value: 'bg-primary', label: 'Primary (Blue)' },
    { value: 'bg-secondary', label: 'Secondary (Gray)' },
    { value: 'bg-green-600', label: 'Success (Green)' },
    { value: 'bg-red-500', label: 'Danger (Red)' },
    { value: 'bg-yellow-500', label: 'Warning (Yellow)' },
    { value: 'bg-blue-600', label: 'Info (Light Blue)' },
    { value: 'bg-purple-600', label: 'Purple' },
    { value: 'bg-pink-600', label: 'Pink' },
    { value: 'bg-teal-500', label: 'Teal' },
    { value: 'bg-indigo-600', label: 'Indigo' },
];
export const mindMapNodeIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    'default': LightBulbIcon,
    'idea': LightBulbIcon,
    'task': ClipboardListCheckIcon,
    'warning': ExclamationTriangleIcon,
    'info': InformationCircleIcon,
    'folder': FolderIcon,
    'users': UsersIcon,
    'money': BanknotesIcon,
    'law': ScaleIcon,
    'briefcase': BriefcaseIcon,
    'lightbulb': LightBulbIcon
};

// Financial
export const financialTransactionTypeOptions = Object.values(FinancialTransactionType).map(t => ({ value: t, label: t }));
export const expenseCategoryOptions = Object.values(ExpenseCategory).map(c => ({ value: c, label: c }));
export const purchaseCategoryOptions = Object.values(PurchaseCategory).map(c => ({ value: c, label: c }));
export const currencyOptions = [{ value: 'KWD', label: 'دينار كويتي (KWD)' }, { value: 'USD', label: 'دولار أمريكي (USD)' }, { value: 'EUR', label: 'يورو (EUR)' }, { value: 'SAR', label: 'ريال سعودي (SAR)' }, { value: 'AED', label: 'درهم إماراتي (AED)' }];
export const financialEntityOptions = [ { value: 'case', label: 'قضية' }, { value: 'employee', label: 'موظف' }, { value: 'client', label: 'عميل/موكل' }, { value: 'vendor', label: 'مورد' }, { value: 'property', label: 'عقار' }, { value: 'company_profile', label: 'الشركة (داخلي)' }, { value: 'other', label: 'أخرى' } ];

// KBA
export const kbaLawyerEnrollmentStatusOptions = Object.values(KBALawyerEnrollmentStatus).map(s => ({ value: s, label: s }));
export const kbaPublicationTypeOptions = Object.values(KBAPublicationType).map(t => ({ value: t, label: t }));
export const kbaSeminarStatusOptions = Object.values(KBASeminarStatus).map(s => ({ value: s, label: s }));
export const kbaSeminarRegistrationStatusOptions = Object.values(KBASeminarRegistrationStatus).map(s => ({ value: s, label: s }));
export const kbaMembershipTypeOptions = [
    { value: 'مقبول أمام التمييز والدستورية', label: 'مقبول أمام التمييز والدستورية' },
    { value: 'مقبول أمام الاستئناف', label: 'مقبول أمام الاستئناف' },
    { value: 'مقبول أمام المحكمة الكلية', label: 'مقبول أمام المحكمة الكلية' },
    { value: 'محام تحت التدريب', label: 'محام تحت التدريب' },
];
export const kbaProBonoStatusOptions = Object.values(KBAProBonoStatus).map(s => ({ value: s, label: s }));

// Legal Representation
export const representationRequestStatusOptions = Object.values(RepresentationRequestStatus).map(s => ({ value: s, label: s }));
export const representationPriorityOptions = Object.values(RepresentationPriority).map(p => ({ value: p, label: p }));

// Party Tracking
export const trackingStatusOptions = Object.values(TrackingStatus).map(s => ({ value: s, label: s }));
export const partyRelationshipTypeOptions = Object.values(PartyRelationshipType).map(t => ({ value: t, label: t }));
export const fieldTaskCategoryOptions = Object.values(FieldTaskCategory).map(c => ({ value: c, label: c }));

// Investigations
export const investigationStatusOptions = Object.values(InvestigationStatus).map(s => ({ value: s, label: s }));
export const investigationPartyTypeOptions = Object.values(InvestigationPartyType).map(t => ({ value: t, label: t }));

// Execution & Experts
export const executionActionTypeOptions = Object.values(ExecutionActionType).map(t => ({ value: t, label: t }));
export const executionActionStatusOptions = Object.values(ExecutionActionStatus).map(s => ({ value: s, label: s }));
export const expertFieldOptions = Object.values(ExpertField).map(f => ({ value: f, label: f }));
export const expertActionStatusOptions = Object.values(ExpertActionStatus).map(s => ({ value: s, label: s }));
export const litigationStageOptions = Object.values(LitigationStage).map(s => ({ value: s, label: s }));
export const notificationStatusOptions = Object.values(NotificationStatus).map(s => ({ value: s, label: s }));


// --- CHART COLORS ---
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0', '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff'];

export const CASE_STATUS_CHART_COLORS: Record<string, string> = {
    [CaseStatus.OPEN]: '#3B82F6', // Blue
    [CaseStatus.IN_PROGRESS]: '#06B6D4', // Cyan
    [CaseStatus.CLOSED]: '#10B981', // Green
    [CaseStatus.PENDING]: '#8B5CF6', // Purple
    [CaseStatus.ON_HOLD]: '#F59E0B', // Yellow
    [CaseStatus.APPEALED]: '#F97316', // Orange
};

export const RISK_COLORS: Record<string, string> = {
    [RiskLevel.LOW]: '#10B981', // Green
    [RiskLevel.MEDIUM]: '#F59E0B', // Yellow
    [RiskLevel.HIGH]: '#EF4444', // Red
    [RiskLevel.CRITICAL]: '#7F1D1D', // Dark Red
};

export const JUDGMENT_OUTCOME_CHART_COLORS: Record<string, string> = {
    'Won': '#10B981',
    'Lost': '#EF4444',
    'Settled': '#3B82F6',
    'PartialWin': '#F59E0B',
    'Pending': '#6B7280',
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
    [AdminTaskPriority.LOW]: '#10B981',
    [AdminTaskPriority.MEDIUM]: '#3B82F6',
    [AdminTaskPriority.HIGH]: '#F59E0B',
    [AdminTaskPriority.CRITICAL]: '#EF4444',
};

export const COMPLIANCE_STATUS_CHART_COLORS: Record<string, string> = {
    [ComplianceStatus.COMPLIANT]: '#10B981',
    [ComplianceStatus.IN_PROGRESS]: '#06B6D4',
    [ComplianceStatus.OVERDUE]: '#EF4444',
    [ComplianceStatus.UNDER_REVIEW]: '#F59E0B',
    [ComplianceStatus.SCHEDULED]: '#3B82F6',
    [ComplianceStatus.NOT_APPLICABLE]: '#9CA3AF',
    [ComplianceStatus.CANCELLED]: '#6B7280',
};

export const RepresentationRequestStatusChartColors: Record<string, string> = {
    [RepresentationRequestStatus.PENDING]: '#F59E0B',
    [RepresentationRequestStatus.ACCEPTED]: '#3B82F6',
    [RepresentationRequestStatus.REJECTED]: '#EF4444',
    [RepresentationRequestStatus.COMPLETED]: '#10B981',
    [RepresentationRequestStatus.CANCELLED]: '#6B7280',
};