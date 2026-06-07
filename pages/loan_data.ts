import { Loan } from '../types';

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

export const initialLoans: Loan[] = [];
export const initialLoanLogs: LoanActivityLog[] = [];

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
