import { Loan, LoanType, LoanStatus, InstallmentStatus, Installment } from '../types';

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

// 1. Initial High-Fidelity Loans with Installments mapping to actual employee IDs
export const initialLoans: Loan[] = [
  {
    id: "AD-LN-2026-001",
    employeeId: "emp-101",
    employeeName: "فاطمة علي حسين السيد",
    loanType: LoanType.PERSONAL,
    loanAmount: 1850.000,
    purpose: "تمويل الرسوم الدراسية العليا والتسجيل الأكاديمي الدولي للأبناء ببريطانيا بموجب موافقة الشؤون القانونية.",
    requestDate: "2026-04-10",
    approvalDate: "2026-04-12",
    disbursementDate: "2026-04-15",
    repaymentStartDate: "2026-05-01",
    numberOfInstallments: 10,
    monthlyInstallment: 185.000,
    status: LoanStatus.ACTIVE,
    installments: [],
    totalPaidAmount: 555.000,
    remainingBalance: 1295.000,
    guarantorName: "عبدالرحمن علي حسين السيد",
    guarantorCivilId: "290112400492",
    isPromissoryNoteSigned: true,
    notes: "مطابق تماماً لنسبة استقطاع المادة 20 (تمثل القيمة 10.0% من الراتب الأساسي البالغ 1850 د.ك شهرياً). تم تحويل القيد لحساب الرواتب البنكي بصيغة آمنة.",
    createdAt: "2026-04-12"
  },
  {
    id: "AD-LN-2026-002",
    employeeId: "emp-102",
    employeeName: "أحمد محمود مبارك",
    loanType: LoanType.CAR,
    loanAmount: 900.000,
    purpose: "سلفة سيارة عاجلة لإصلاح المركبة العائلية الأساسية لتسهيل الحضور اليومي للمقر.",
    requestDate: "2026-03-01",
    approvalDate: "2026-03-02",
    disbursementDate: "2026-03-05",
    repaymentStartDate: "2026-04-01",
    numberOfInstallments: 12,
    monthlyInstallment: 75.000,
    status: LoanStatus.DEFAULTED,
    installments: [],
    totalPaidAmount: 75.000,
    remainingBalance: 825.000,
    guarantorName: "عادل حمد المنصوري",
    guarantorCivilId: "284051000311",
    isPromissoryNoteSigned: true,
    courtExecutionNumber: "2026/8942-ت عمالي",
    courtExecutionStatus: "منع سفر قائم وحجز راتب ساري",
    notes: "تم تسجيل تعثر مالي للموظف نتيجة تراكم مديونيات خارجية وامتناع الكفيل عن السداد حتى تاريخه. تم إرسال إنذار كفالة قانوني رسمي رقم 4 بالبريد المسجل.",
    createdAt: "2026-03-02"
  },
  {
    id: "AD-LN-2026-003",
    employeeId: "emp-101",
    employeeName: "فاطمة علي حسين السيد",
    loanType: LoanType.EMERGENCY,
    loanAmount: 200.000,
    purpose: "سلفة علاجية طارئة ومؤقتة لدواعي كشف فني طبي معجل في مستشفى كويتي خاص.",
    requestDate: "2026-07-01",
    approvalDate: "2026-07-02",
    disbursementDate: "2026-07-03",
    repaymentStartDate: "2026-08-01",
    numberOfInstallments: 1,
    monthlyInstallment: 200.000,
    status: LoanStatus.UNDER_FINANCIAL_REVIEW,
    installments: [],
    totalPaidAmount: 0.000,
    remainingBalance: 200.000,
    isPromissoryNoteSigned: false,
    notes: "سلفة طارئة قصيرة الأجل يتم استردادها بالكامل من راتب شهر أغسطس 2026 القادم. تحت التدقيق المالي لتجاوزها سقف 10% لشهر واحد بموجب مادة 20 تفويض استثنائي.",
    createdAt: "2026-07-02"
  }
];

// Populate sub-installments automatically for the initial loans
initialLoans.forEach((loan) => {
  const installmentsList: Installment[] = [];
  const startD = new Date(loan.repaymentStartDate);
  
  for (let i = 1; i <= loan.numberOfInstallments; i++) {
    const dueD = new Date(startD);
    dueD.setMonth(startD.getMonth() + (i - 1));
    
    let instStatus = InstallmentStatus.UPCOMING;
    let paidAmt = 0;
    let payDate = undefined;
    
    // Logic to make static loans look paid or overdue
    if (loan.status === LoanStatus.ACTIVE) {
      if (i <= 3) {
        instStatus = InstallmentStatus.PAID;
        paidAmt = loan.monthlyInstallment;
        payDate = dueD.toISOString().split('T')[0];
      }
    } else if (loan.status === LoanStatus.DEFAULTED) {
      if (i === 1) {
        instStatus = InstallmentStatus.PAID;
        paidAmt = loan.monthlyInstallment;
        payDate = dueD.toISOString().split('T')[0];
      } else if (dueD < new Date()) {
        instStatus = InstallmentStatus.PENDING; // Overdue/Defaulted
      }
    }
    
    installmentsList.push({
      id: `inst-${loan.id}-${i}`,
      installmentNumber: i,
      dueDate: dueD.toISOString().split('T')[0],
      amountDue: loan.monthlyInstallment,
      status: instStatus,
      amountPaid: paidAmt,
      paymentDate: payDate
    });
  }
  loan.installments = installmentsList;
});

// 2. Initial Comprehensive Activity Logs representing audits, actions, and collections
export const initialLoanLogs: LoanActivityLog[] = [
  {
    id: "log-1001",
    loanId: "AD-LN-2026-003",
    action: "تأسيس معاملة قيد المراجعة المالية",
    actionEn: "Registered & Pending Audit",
    user: "أمين الخزينة الرئيسي",
    date: "2026-07-02",
    notes: "تم قيد طلب السلفة العلاجية بقيمة 200 د.ك وتحويله تلقائياً لمدير الرواتب بسبب تخطي قسط الدفع لـ 10% من الراتب العادي، لاستثناء الحالة طبياً بموجب لائحة الشؤون.",
    notesEn: "Registered 200 KWD emergency advance, routed for exception approval due to 10% basic salary cap bypass."
  },
  {
    id: "log-1002",
    loanId: "AD-LN-2026-002",
    action: "تسجيل امتناع وتعثر وإرسال إنذار قانوني",
    actionEn: "Disputed & Guarantor Warning Sent",
    user: "رئيس الشؤون القانونية والمطابقة",
    date: "2026-06-15",
    notes: "تم رصد تخلف الموظف عن دفع 3 أقساط متتالية بمجموع 225 د.ك. تم تفعيل بند الكفيل الشخصي الضامن وتوجيه إشعار قانوني رقم 4 بالخصم المباشر من مخصصاته المدنية.",
    notesEn: "Failed 3 consecutive payments (225 KWD total). Activated surety personal liability, formal civil notification sent."
  },
  {
    id: "log-1003",
    loanId: "AD-LN-2026-001",
    action: "صرف واعتماد سلفة الـ 10% المعتمدة",
    actionEn: "Disbursement Finalized & Active",
    user: "المدير المالي والامتثال",
    date: "2026-04-15",
    notes: "تم ترحيل مبلغ التمويل بالكامل (1850 د.ك) لحساب الموظفة البنكي بعد توقيع سند التفويض بالخصم مادة 20 وتوثيق الكفيل الضامن قانونياً.",
    notesEn: "Transferred 1850 KWD to employee account after securing Article 20 consent and guarantor signature."
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
