import React from 'react';
import { 
    RiskLevel, CaseStatus, CasePriority, ComplianceStatus, LoanStatus, 
    InstallmentStatus, DisciplinaryActionStatus, EmployeeRequestStatus, 
    PropertyUnitStatus, LeaseAgreementStatus, RentPaymentStatus, 
    CompanyDocumentStatus, LegalResourceStatus, AdminTaskStatus, 
    AdminTaskPriority, FinancialTransactionType, UserStatus, UserRole,
    RepresentationRequestStatus, // Added
    SettlementStatus, // Added for Debt Settlement
    KBALawyerEnrollmentStatus, // Added for KBA Module
    KBASeminarStatus, // Added for KBA Module
    KBASeminarRegistrationStatus, // Added for KBA Module
    MaintenanceStatus, // Added import for MaintenanceStatus
    ExecutionActionStatus, // Added for Case Execution Actions
    ExpertActionStatus // NEW
} from '../../types';

export type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange' | 'cyan' | 'pink' | 'indigo' | 'teal';

interface BadgeProps {
  text: string;
  color?: BadgeColor;
  className?: string;
  size?: 'xs' | 'sm';
}

export const Badge: React.FC<BadgeProps> = ({ text, color = 'gray', className = '', size = 'xs' }) => {
  const colorStyles: Record<BadgeColor, string> = {
    green: 'bg-success/20 text-green-700 dark:bg-green-700/30 dark:text-green-300', 
    yellow: 'bg-warning/20 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300', 
    red: 'bg-danger/20 text-red-700 dark:bg-red-700/30 dark:text-red-300',
    blue: 'bg-info/20 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300',
    gray: 'bg-gray-500/20 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300',
    purple: 'bg-purple-500/20 text-purple-700 dark:bg-purple-700/30 dark:text-purple-300',
    orange: 'bg-orange-500/20 text-orange-700 dark:bg-orange-700/30 dark:text-orange-300',
    cyan: 'bg-cyan-500/20 text-cyan-700 dark:bg-cyan-700/30 dark:text-cyan-300',
    pink: 'bg-pink-500/20 text-pink-700 dark:bg-pink-700/30 dark:text-pink-300',
    indigo: 'bg-indigo-500/20 text-indigo-700 dark:bg-indigo-700/30 dark:text-indigo-300',
    teal: 'bg-teal-500/20 text-teal-700 dark:bg-teal-700/30 dark:text-teal-300',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-0.5 text-xs',
    sm: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={`rounded-full font-semibold inline-block whitespace-nowrap ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
    >
      {text}
    </span>
  );
};

export const RiskLevelBadge: React.FC<{ level: RiskLevel, size?: 'xs' | 'sm' }> = ({ level, size }) => {
  let color: BadgeColor = 'gray';
  if (level === RiskLevel.LOW) color = 'green';
  else if (level === RiskLevel.MEDIUM) color = 'yellow';
  else if (level === RiskLevel.HIGH) color = 'orange';
  else if (level === RiskLevel.CRITICAL) color = 'red';
  return <Badge text={level} color={color} size={size}/>;
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  if (status === CaseStatus.OPEN) color = 'blue';
  else if (status === CaseStatus.IN_PROGRESS) color = 'cyan';
  else if (status === CaseStatus.CLOSED) color = 'green';
  else if (status === CaseStatus.PENDING) color = 'purple';
  else if (status === CaseStatus.ON_HOLD) color = 'yellow';
  else if (status === CaseStatus.APPEALED) color = 'orange';
  return <Badge text={status} color={color} size={size}/>;
};

export const PriorityBadge: React.FC<{ priority: CasePriority | AdminTaskPriority, size?: 'xs' | 'sm' }> = ({ priority, size }) => { 
  let color: BadgeColor = 'gray';
  if (priority === CasePriority.LOW || priority === AdminTaskPriority.LOW) color = 'green';
  else if (priority === CasePriority.NORMAL || priority === AdminTaskPriority.MEDIUM) color = 'blue';
  else if (priority === CasePriority.HIGH || priority === AdminTaskPriority.HIGH) color = 'orange';
  else if (priority === CasePriority.URGENST || priority === AdminTaskPriority.CRITICAL) color = 'red';
  return <Badge text={priority} color={color} size={size}/>;
};

export const AdminTaskStatusBadge: React.FC<{ status: AdminTaskStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch (status) {
    case AdminTaskStatus.TODO: color = 'blue'; break;
    case AdminTaskStatus.IN_PROGRESS: color = 'cyan'; break;
    case AdminTaskStatus.COMPLETED: color = 'green'; break;
    case AdminTaskStatus.BLOCKED: color = 'orange'; break;
    case AdminTaskStatus.CANCELLED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const AdminTaskPriorityBadge: React.FC<{ priority: AdminTaskPriority, size?: 'xs' | 'sm' }> = ({ priority, size }) => {
  return <PriorityBadge priority={priority} size={size} />;
}


export const ComplianceStatusBadge: React.FC<{ status: ComplianceStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case ComplianceStatus.COMPLIANT: color = 'green'; break;
    case ComplianceStatus.IN_PROGRESS: color = 'cyan'; break;
    case ComplianceStatus.OVERDUE: color = 'red'; break;
    case ComplianceStatus.UNDER_REVIEW: color = 'yellow'; break;
    case ComplianceStatus.SCHEDULED: color = 'blue'; break;
    case ComplianceStatus.NOT_APPLICABLE: case ComplianceStatus.CANCELLED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const LoanStatusBadge: React.FC<{ status: LoanStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case LoanStatus.PENDING_APPROVAL: color = 'yellow'; break;
    case LoanStatus.APPROVED: case LoanStatus.ACTIVE: color = 'blue'; break;
    case LoanStatus.PAID_IN_FULL: color = 'green'; break;
    case LoanStatus.REJECTED: case LoanStatus.CANCELLED: color = 'gray'; break;
    case LoanStatus.DEFAULTED: color = 'red'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const InstallmentStatusBadge: React.FC<{ status: InstallmentStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case InstallmentStatus.PENDING: color = 'blue'; break;
    case InstallmentStatus.PAID: color = 'green'; break;
    case InstallmentStatus.PARTIALLY_PAID: color = 'orange'; break;
    case InstallmentStatus.OVERDUE: color = 'red'; break;
    case InstallmentStatus.UPCOMING: color = 'cyan'; break;
    case InstallmentStatus.WAIVED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const LegalResourceStatusBadge: React.FC<{ status: LegalResourceStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case LegalResourceStatus.ACTIVE: 
    case LegalResourceStatus.ACTIVE_AMENDED: 
        color = 'green'; break;
    case LegalResourceStatus.REPEALED: 
    case LegalResourceStatus.SUPERSEDED: 
        color = 'red'; break;
    case LegalResourceStatus.AMENDED_BY_OTHER: 
    case LegalResourceStatus.DRAFT: 
        color = 'yellow'; break;
    case LegalResourceStatus.HISTORICAL_REFERENCE: 
        color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const PropertyUnitStatusBadge: React.FC<{ status: PropertyUnitStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case PropertyUnitStatus.VACANT: color = 'blue'; break;
    case PropertyUnitStatus.RENTED: color = 'green'; break;
    case PropertyUnitStatus.UNDER_MAINTENANCE: color = 'yellow'; break;
    case PropertyUnitStatus.UNAVAILABLE: color = 'red'; break;
    case PropertyUnitStatus.SOLD: color = 'purple'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const LeaseAgreementStatusBadge: React.FC<{ status: LeaseAgreementStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case LeaseAgreementStatus.ACTIVE:
    case LeaseAgreementStatus.RENEWED:
         color = 'green'; break;
    case LeaseAgreementStatus.DRAFT: 
    case LeaseAgreementStatus.PENDING_START: 
    case LeaseAgreementStatus.PENDING_RENEWAL:
        color = 'yellow'; break;
    case LeaseAgreementStatus.EXPIRED: 
    case LeaseAgreementStatus.TERMINATED:
        color = 'red'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const RentPaymentStatusBadge: React.FC<{ status: RentPaymentStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case RentPaymentStatus.PAID: color = 'green'; break;
    case RentPaymentStatus.PENDING: color = 'blue'; break;
    case RentPaymentStatus.PARTIALLY_PAID: color = 'orange'; break;
    case RentPaymentStatus.OVERDUE: color = 'red'; break;
    case RentPaymentStatus.WAIVED: case RentPaymentStatus.CANCELLED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const SettlementStatusBadge: React.FC<{ status: SettlementStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case SettlementStatus.ACTIVE: color = 'blue'; break;
    case SettlementStatus.PAID_IN_FULL: color = 'green'; break;
    case SettlementStatus.DEFAULTED: case SettlementStatus.LEGAL_ACTION_PENDING: color = 'red'; break;
    case SettlementStatus.CANCELLED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const CompanyDocumentStatusBadge: React.FC<{ status: CompanyDocumentStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case CompanyDocumentStatus.ACTIVE:
    case CompanyDocumentStatus.APPROVED:
    case CompanyDocumentStatus.SIGNED:
         color = 'green'; break;
    case CompanyDocumentStatus.DRAFT:
    case CompanyDocumentStatus.UNDER_REVIEW:
        color = 'yellow'; break;
    case CompanyDocumentStatus.ARCHIVED:
    case CompanyDocumentStatus.CANCELLED:
    case CompanyDocumentStatus.EXPIRED:
    case CompanyDocumentStatus.SUPERSEDED:
        color = 'gray'; break;
    case CompanyDocumentStatus.SENT:
    case CompanyDocumentStatus.RECEIVED:
        color = 'blue'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const DisciplinaryActionStatusBadge: React.FC<{ status: DisciplinaryActionStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case DisciplinaryActionStatus.PENDING_INVESTIGATION: color = 'yellow'; break;
    case DisciplinaryActionStatus.INVESTIGATION_IN_PROGRESS: color = 'cyan'; break;
    case DisciplinaryActionStatus.INVESTIGATION_COMPLETE: color = 'blue'; break;
    case DisciplinaryActionStatus.ACTION_TAKEN: color = 'green'; break;
    case DisciplinaryActionStatus.CLOSED: color = 'gray'; break;
    case DisciplinaryActionStatus.APPEALED: color = 'orange'; break;
    case DisciplinaryActionStatus.CANCELLED: color = 'red'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const EmployeeRequestStatusBadge: React.FC<{ status: EmployeeRequestStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case EmployeeRequestStatus.PENDING: color = 'yellow'; break;
    case EmployeeRequestStatus.PROCESSING: color = 'cyan'; break;
    case EmployeeRequestStatus.APPROVED: color = 'blue'; break;
    case EmployeeRequestStatus.COMPLETED: color = 'green'; break;
    case EmployeeRequestStatus.REJECTED: color = 'red'; break;
    case EmployeeRequestStatus.CANCELLED: color = 'gray'; break;
    case EmployeeRequestStatus.INFO_REQUIRED: color = 'orange'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const FinancialTransactionTypeBadge: React.FC<{ type: FinancialTransactionType, size?: 'xs' | 'sm' }> = ({ type, size }) => {
  let color: BadgeColor = 'gray';
  switch(type) {
    case FinancialTransactionType.REVENUE:
    case FinancialTransactionType.OTHER_INCOME:
        color = 'green'; break;
    case FinancialTransactionType.EXPENSE:
    case FinancialTransactionType.OTHER_OUTGOING:
        color = 'red'; break;
    case FinancialTransactionType.PURCHASE:
        color = 'orange'; break;
    case FinancialTransactionType.SALARY_PAYMENT:
        color = 'blue'; break;
  }
  return <Badge text={type} color={color} size={size} />;
};

export const RepresentationRequestStatusBadge: React.FC<{ status: RepresentationRequestStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch (status) {
    case RepresentationRequestStatus.PENDING: color = 'yellow'; break;
    case RepresentationRequestStatus.ACCEPTED: color = 'blue'; break;
    case RepresentationRequestStatus.REJECTED: color = 'red'; break;
    case RepresentationRequestStatus.COMPLETED: color = 'green'; break;
    case RepresentationRequestStatus.CANCELLED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

// KBA Badges
export const KBALawyerEnrollmentStatusBadge: React.FC<{ status: KBALawyerEnrollmentStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case KBALawyerEnrollmentStatus.ACTIVE: color = 'green'; break;
    case KBALawyerEnrollmentStatus.SUSPENDED: color = 'orange'; break;
    case KBALawyerEnrollmentStatus.EXPIRED: color = 'red'; break;
    case KBALawyerEnrollmentStatus.UNDER_REVIEW: color = 'yellow'; break;
    case KBALawyerEnrollmentStatus.NEW_APPLICATION: color = 'blue'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const KBASeminarStatusBadge: React.FC<{ status: KBASeminarStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case KBASeminarStatus.UPCOMING: color = 'blue'; break;
    case KBASeminarStatus.ONGOING: color = 'cyan'; break;
    case KBASeminarStatus.COMPLETED: color = 'green'; break;
    case KBASeminarStatus.CANCELLED: color = 'gray'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const KBARegistrationStatusBadge: React.FC<{ status: KBASeminarRegistrationStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case KBASeminarRegistrationStatus.NOT_REGISTERED: color = 'gray'; break;
    case KBASeminarRegistrationStatus.REGISTERED: color = 'blue'; break;
    case KBASeminarRegistrationStatus.ATTENDED: color = 'green'; break;
    case KBASeminarRegistrationStatus.ABSENT: color = 'red'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

// Maintenance Status Badge (NEW)
const getMaintenanceStatusBadgeColor = (status: MaintenanceStatus): BadgeColor => {
    switch(status) {
        case MaintenanceStatus.COMPLETED_CLOSED: return 'green';
        case MaintenanceStatus.COMPLETED_PENDING_REVIEW: return 'teal';
        case MaintenanceStatus.PENDING_APPROVAL: 
        case MaintenanceStatus.APPROVED_PENDING_ASSIGNMENT: 
            return 'yellow';
        case MaintenanceStatus.ASSIGNED_TO_VENDOR: 
        case MaintenanceStatus.IN_PROGRESS: 
            return 'blue';
        case MaintenanceStatus.ON_HOLD_PARTS_NEEDED: 
        case MaintenanceStatus.ON_HOLD_TENANT_UNAVAILABLE: 
            return 'orange';
        case MaintenanceStatus.CANCELLED: 
        case MaintenanceStatus.REJECTED: 
            return 'red';
        default: return 'gray';
    }
};

export const MaintenanceStatusBadge: React.FC<{ status: MaintenanceStatus, size?: 'xs' | 'sm' }> = ({ status, size = 'xs' }) => (
    <Badge text={status} color={getMaintenanceStatusBadgeColor(status)} size={size} />
);

// --- NEW: Execution Action Status Badge ---
export const ExecutionActionStatusBadge: React.FC<{ status: ExecutionActionStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case ExecutionActionStatus.PENDING_SUBMISSION:
    case ExecutionActionStatus.SUBMITTED_PENDING_DECISION:
        color = 'orange'; break;
    case ExecutionActionStatus.ACTIVE:
        color = 'blue'; break;
    case ExecutionActionStatus.PARTIALLY_COMPLETED:
        color = 'cyan'; break;
    case ExecutionActionStatus.COMPLETED:
        color = 'green'; break;
    case ExecutionActionStatus.LIFTED:
    case ExecutionActionStatus.CANCELLED_BY_APPLICANT:
        color = 'gray'; break;
    case ExecutionActionStatus.REJECTED_BY_COURT:
        color = 'red'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};
// --- END OF NEW Execution Action Status Badge ---

// --- NEW: Expert Action Status Badge ---
export const ExpertActionStatusBadge: React.FC<{ status: ExpertActionStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case ExpertActionStatus.PENDING_ASSIGNMENT:
        color = 'yellow'; break;
    case ExpertActionStatus.IN_PROGRESS:
        color = 'blue'; break;
    case ExpertActionStatus.REPORT_SUBMITTED:
        color = 'cyan'; break;
    case ExpertActionStatus.AWAITING_DISCUSSION:
        color = 'orange'; break;
    case ExpertActionStatus.COMPLETED:
        color = 'green'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const UserStatusBadge: React.FC<{ status: UserStatus, size?: 'xs' | 'sm' }> = ({ status, size }) => {
  let color: BadgeColor = 'gray';
  switch(status) {
    case UserStatus.ACTIVE: color = 'green'; break;
    case UserStatus.INACTIVE: color = 'gray'; break;
    case UserStatus.PENDING_VERIFICATION: color = 'yellow'; break;
  }
  return <Badge text={status} color={color} size={size} />;
};

export const UserRoleBadge: React.FC<{ role: UserRole, size?: 'xs' | 'sm' }> = ({ role, size }) => {
  let color: BadgeColor = 'purple';
  switch(role) {
    case UserRole.ADMIN: color = 'red'; break;
    case UserRole.LAWYER: color = 'blue'; break;
    case UserRole.ASSISTANT: color = 'teal'; break;
    case UserRole.ACCOUNTANT: color = 'orange'; break;
    case UserRole.GUEST: color = 'gray'; break;
  }
  return <Badge text={role} color={color} size={size} />;
};
