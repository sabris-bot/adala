import { Loan, LoanType, LoanStatus, InstallmentStatus } from '../types';
import { initialEmployees } from './EmployeeProfilePage';

export interface LoanActivityLog {
  id: string;
  loanId: string;
  action: string;
  actionEn: string;
  user: string;
  date: string;
  notes: string;
  notesEn: string;
}

export const initialLoans: Loan[] = [
  {
    id: 'AD-LN-2026-0001',
    employeeId: initialEmployees[0]?.id || 'emp-001',
    employeeName: initialEmployees[0]?.fullNameAr || 'أحمد محمود مبارك',
    loanType: LoanType.PERSONAL,
    loanAmount: 4000.000,
    purpose: 'ترميم وإصلاحات عاجلة بالمسكن لظروف الشتاء',
    requestDate: '2025-11-10',
    approvalDate: '2025-11-12',
    disbursementDate: '2025-11-15',
    repaymentStartDate: '2025-12-01',
    numberOfInstallments: 10,
    monthlyInstallment: 400.000,
    status: LoanStatus.ACTIVE,
    installments: Array.from({ length: 10 }, (_, i) => ({
      id: `inst-1-${i + 1}`,
      installmentNumber: i + 1,
      dueDate: new Date(2025, 11 + i, 1).toISOString().split('T')[0],
      amountDue: 400.000,
      status: i < 5 ? InstallmentStatus.PAID : (i === 5 ? InstallmentStatus.PENDING : InstallmentStatus.UPCOMING),
      amountPaid: i < 5 ? 400.000 : undefined,
      paymentDate: i < 5 ? new Date(2025, 11 + i, 25).toISOString().split('T')[0] : undefined,
    })),
    totalPaidAmount: 2000.000,
    remainingBalance: 2000.000,
    guarantorName: 'فهد عبد العزيز العوضي',
    guarantorCivilId: '288041209384',
    createdAt: '2025-11-10',
    updatedAt: '2026-04-25',
    notes: 'تم فحص الملاءة المالية للموظف، ولديه كفالة معتمدة من المقر الإداري، مع التزام تام بالسداد حتى تاريخه.'
  },
  {
    id: 'AD-LN-2026-0002',
    employeeId: initialEmployees[1]?.id || 'emp-002',
    employeeName: initialEmployees[1]?.fullNameAr || 'فاطمة علي حسين',
    loanType: LoanType.SALARY_ADVANCE,
    loanAmount: 800.000,
    purpose: 'تغطية نفقات علاجية طارئة لأحد أفراد العائلة داخل الكويت',
    requestDate: '2026-05-02',
    approvalDate: '2026-05-03',
    disbursementDate: '2026-05-04',
    repaymentStartDate: '2026-06-01',
    numberOfInstallments: 4,
    monthlyInstallment: 200.000,
    status: LoanStatus.APPROVED,
    installments: Array.from({ length: 4 }, (_, i) => ({
      id: `inst-2-${i + 1}`,
      installmentNumber: i + 1,
      dueDate: new Date(2026, 5 + i, 1).toISOString().split('T')[0],
      amountDue: 200.000,
      status: InstallmentStatus.UPCOMING,
    })),
    totalPaidAmount: 0.000,
    remainingBalance: 800.000,
    createdAt: '2026-05-02',
    updatedAt: '2026-05-03',
    notes: 'السلفة تقع تماماً ضمن النطاق المسموح به للمادة 20. تم إرجاء استقطاع أول قسط حماية للمعيشة المادية لشهر يونيو.'
  },
  {
    id: 'AD-LN-2026-0003',
    employeeId: initialEmployees[2]?.id || 'emp-003',
    employeeName: initialEmployees[2]?.fullNameAr || 'علي محمد جاسم',
    loanType: LoanType.HOUSING,
    loanAmount: 8500.000,
    purpose: 'تسوية الدفعات الإسكانية الخاصة بهيئة الرعاية السكنية بالكويت',
    requestDate: '2026-04-10',
    approvalDate: '2026-04-13',
    disbursementDate: '2026-04-15',
    repaymentStartDate: '2026-05-01',
    numberOfInstallments: 34,
    monthlyInstallment: 250.000,
    status: LoanStatus.DEFAULTED,
    installments: Array.from({ length: 34 }, (_, i) => ({
      id: `inst-3-${i + 1}`,
      installmentNumber: i + 1,
      dueDate: new Date(2026, 4 + i, 1).toISOString().split('T')[0],
      amountDue: 250.000,
      status: i === 0 ? InstallmentStatus.OVERDUE : InstallmentStatus.UPCOMING,
    })),
    totalPaidAmount: 0.000,
    remainingBalance: 8500.000,
    guarantorName: 'جاسم محمد غانم',
    guarantorCivilId: '291030204938',
    createdAt: '2026-04-10',
    updatedAt: '2026-05-10',
    notes: 'تأخر الموظف في تسوية القسط الأول لشهر مايو نتيجة ظروف طارئة. تم إرسال الإنذار المالي القانوني الأول للكفيل والالتزام مستمر.'
  },
  {
    id: 'AD-LN-2026-0004',
    employeeId: initialEmployees[3]?.id || 'emp-004',
    employeeName: initialEmployees[3]?.fullNameAr || 'خالد وليد الشمري',
    loanType: LoanType.EMERGENCY,
    loanAmount: 300.000,
    purpose: 'سلفة سفر عاجلة قصيرة الأجل لإنجاز مهمة عائلية طارئة بالخارج',
    requestDate: '2026-05-20',
    approvalDate: '2026-05-21',
    disbursementDate: '2026-05-22',
    repaymentStartDate: '2026-05-30',
    numberOfInstallments: 1,
    monthlyInstallment: 300.000,
    status: LoanStatus.ACTIVE,
    installments: [
      {
        id: 'inst-4-1',
        installmentNumber: 1,
        dueDate: '2026-05-30',
        amountDue: 300.000,
        status: InstallmentStatus.PENDING
      }
    ],
    totalPaidAmount: 0,
    remainingBalance: 300.000,
    createdAt: '2026-05-20',
    updatedAt: '2026-05-21',
    notes: 'سلفة تعويضية طارئة على الراتب للشهر الحالي، سيتم خصمها بالكامل في غضون 10 أيام مع دفعة الراتب الحالية بحد أقصى.'
  },
  {
    id: 'AD-LN-2026-0005',
    employeeId: initialEmployees[4]?.id || 'emp-005',
    employeeName: initialEmployees[4]?.fullNameAr || 'هدى يوسف الصالح',
    loanType: LoanType.PERSONAL,
    loanAmount: 1200.000,
    purpose: 'شراء أثاث مسكن وتجهيز وتأهيل المعيشة الخاصة',
    requestDate: '2026-05-15',
    status: LoanStatus.UNDER_FINANCIAL_REVIEW,
    repaymentStartDate: '2026-07-01',
    numberOfInstallments: 12,
    monthlyInstallment: 100.000,
    installments: [],
    totalPaidAmount: 0,
    remainingBalance: 1200.000,
    createdAt: '2026-05-15',
    updatedAt: '2026-05-16',
    notes: 'بانتظار موافقة المدقق والمطابقة مع إدارات الالتزام لمنع ازدواجية القروض ومطابقة النطاق القانوني للمادة 20.'
  }
];

export const initialLoanLogs: LoanActivityLog[] = [
  {
    id: 'log1',
    loanId: 'AD-LN-2026-0001',
    action: 'تأسيس قرار طلب القرض',
    actionEn: 'Loan Application Created',
    user: 'سارة الصراف (الموارد البشرية)',
    date: '2025-11-10',
    notes: 'تم الرفع في النظام مع كافة مستندات ثبوت الرصيد المدني وطلب القرض الموقع.',
    notesEn: 'Uploaded with all verified Civil ID documents and signed request form.'
  },
  {
    id: 'log2',
    loanId: 'AD-LN-2026-0001',
    action: 'التدقيق والاعتماد المالي',
    actionEn: 'Financial Review & Approval',
    user: 'محمد عبد الله (المدير المالي)',
    date: '2025-11-12',
    notes: 'تم فحص الملاءة المالية والتحقق من عدم تجاوز قسط 400 د.ك لـ 10% من راتب الموظف الأساسي.',
    notesEn: 'Verified basic salary ratio is well within the 10% statutory mandate.'
  },
  {
    id: 'log3',
    loanId: 'AD-LN-2026-0001',
    action: 'صرف المبلغ وتحويل الدفعة',
    actionEn: 'Funds Disbursed',
    user: 'إدارة الخزينة والمدفوعات',
    date: '2025-11-15',
    notes: 'تحويل بنكي برقم معاملة TXN-202584192 بالكامل إلى الحساب بنك الخليج للموظف.',
    notesEn: 'Bank transfer TXN-202584192 successfully completed to Gulf Bank account.'
  },
  {
    id: 'log4',
    loanId: 'AD-LN-2026-0003',
    action: 'إصدار إنذار قانوني وتنبيه تأخير',
    actionEn: 'Overdue Legal Warning Issued',
    user: 'شؤون الالتزام والضوابط المالية',
    date: '2026-05-10',
    notes: 'تم إخطار الكفيل هاتفياً وإرسال إشعار المتأخرات للقسط العبري للوفاء بالسداد العاجل.',
    notesEn: 'Guarantor notified of the outstanding first installment to avoid subsequent litigation.'
  }
];

// Helper calculations compliant with Kuwaiti labor law (Article 20 & Article 51)
export const validateKuwaitiLoanRules = (
  employeeSalary: number,
  monthlyInstallment: number,
  hasPreviousActive: boolean
) => {
  const result = {
    isValid: true,
    warnings: [] as string[],
    errors: [] as string[],
    limitAmount: employeeSalary * 0.10,
    actualPercentage: (monthlyInstallment / employeeSalary) * 100
  };

  if (monthlyInstallment > result.limitAmount) {
    result.isValid = false;
    result.errors.push(
      `مخالفة صريحة للمادة (20) من قانون العمل الكويتي: يتجاوز القسط الشهري الحد الأقصى للاستقطاع (10% من الراتب الأساسي البالغ ${employeeSalary.toFixed(3)} د.ك). الحد الأقصى المسموح به هو ${result.limitAmount.toFixed(3)} د.ك.`
    );
  }

  if (hasPreviousActive) {
    result.warnings.push(
      "يوجد قرض نشط وقائم بالفعل لصالح هذا الموظف. في القانون الكويتي والسياسات المالية للمكتب، يفضل دمج الديون أو جدولة القرض الجديد بالتتابع لتجنب تراكم الالتزامات والأحمال المالية على راتب الموظف."
    );
  }

  return result;
};
