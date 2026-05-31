import React from 'react';
import { 
  User, ShieldAlert, Landmark, Calendar, Award, 
  MapPin, Phone, Mail, Award as Star, Info, ListTodo, Activity
} from 'lucide-react';
import { ExtendedEmployee } from '../../data/employeeExtendedData';
import { useLanguage } from '../i18n/LanguageProvider';

interface EmployeeInfoPanelProps {
  employee: ExtendedEmployee | null;
}

const translations = {
  ar: {
    selectPlaceholder: "حدد موظفاً من قائمة الأفراد الجانبية لعرض موازنة حياتهم وتفاصيل علاقتهم الوظيفية المبرمة بالتفصيل.",
    selectSub: "رصد الرواتب الأساسية، البدلات، العقوبات المرفوعة، والذمم الإقراضية النشطة بدولة الكويت.",
    pendingLoans: "مديونية السلف المعلقة",
    activeViolations: "مخالفات وجزاءات نشطة",
    warnings: "إنذار",
    performance: "التقييم الفني العام",
    contractTitle: "بيانات عقد العمل والتعيين الموثق:",
    contractType: "نوع صك العقد:",
    commencementDate: "تاريخ التعيين:",
    civilIdLabel: "الرقم المدني:",
    workSystem: "نظام الدوام:",
    pifssLabel: "رقم التأمين PIFSS:",
    unlimited: "غير محدد المدة",
    fullTime: "دوام كامل",
    nonKuwaiti: "غير كويتي",
    nationalityLabel: "الجنسية والبلد:",
    financialTitle: "ملف الرواتب والامتيازات المالية المبرمة:",
    baseSalary: "الأجر الأساسي الثابت (Basic Salary):",
    fixedAllowances: "البدلات الخاضعة لاندمنتي:",
    noAllowances: "لا توجد بدلات إضافية مضافة بالكشف.",
    grossSalary: "الراتب الإجمالي الكلي (Gross Salary):",
    disciplinaryTitle: "سجل الجزاءات والتحقيقات التأديبية:",
    noDiscipline: "السجل التأديبي خالي من المخالفات والجزاءات الإدارية تماماً ✔",
    sanctionLabel: "العقوبة المقررة:",
    deductionLabel: "خصم",
    loansTitle: "كشف القروض والسلف المالية المتراكمة ذات المنشأ:",
    noLoans: "لا يوجد سلف أو قروض مسجلة بذمة الموظف حالياً ✔",
    adminLoan: "سلفة إدارية رقم:",
    principalAmount: "قيمة القرض الكلية:",
    monthlyInstallment: "القسط الشهري:",
    paymentStatus: "حالة التراكم السداد:",
    remainingBalance: "الرصيد المتبقي لإجر المقاصة:",
    kwd: "د.ك"
  },
  en: {
    selectPlaceholder: "Please select an employee from the sidebar listing to inspect their labor profile, contractual benefits, and live assets.",
    selectSub: "Tracks base salary structures, allowances, outstanding corporate loans, and disciplinary notices in Kuwait.",
    pendingLoans: "Outstanding Loan Balances",
    activeViolations: "Active HR Infractions",
    warnings: "Warning(s)",
    performance: "Overall Tech Score",
    contractTitle: "Certified Employment Contract Details:",
    contractType: "Contract Type:",
    commencementDate: "Hired Date:",
    civilIdLabel: "Civil ID:",
    workSystem: "Work System:",
    pifssLabel: "Kuwait PIFSS ID:",
    unlimited: "Unlimited Duration",
    fullTime: "Full-Time Shift",
    nonKuwaiti: "Expatriate",
    nationalityLabel: "Nationality & State:",
    financialTitle: "Allocated Base Salaries & Allowances Ledger:",
    baseSalary: "Fixed Base Base Salary (Monthly):",
    fixedAllowances: "Applicable Allowances Package:",
    noAllowances: "No active fixed allowances verified on this ledger.",
    grossSalary: "Gross Accumulated Salary (Gross):",
    disciplinaryTitle: "Disciplinary Infractions & Review Audits:",
    noDiscipline: "Employee disciplinary ledger is entirely clear of infractions ✔",
    sanctionLabel: "Admonition Penalty:",
    deductionLabel: "Deduct",
    loansTitle: "Company Loans & Outstanding Cash Advances:",
    noLoans: "No corporate loans or cash advances charged to this employee ✔",
    adminLoan: "Internal Loan Reference No:",
    principalAmount: "Principal Sum:",
    monthlyInstallment: "Monthly Installment:",
    paymentStatus: "Payment Repay Status:",
    remainingBalance: "Unsettled Balance for Offset:",
    kwd: "KWD"
  }
};

export const EmployeeInfoPanel: React.FC<EmployeeInfoPanelProps> = ({ employee }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const t = translations[language];

  if (!employee) {
    return (
      <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-400 select-none">
        <User className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-2 animate-bounce" />
        <p className="text-xs font-black">{t.selectPlaceholder}</p>
        <p className="text-[10px] text-gray-500 mt-1 leading-snug">{t.selectSub}</p>
      </div>
    );
  }

  // Derived values
  const totalAllowances = employee.allowances?.reduce((sum, item) => sum + item.value, 0) || 0;
  const warningsCount = employee.disciplinaryActions?.filter(d => d.status === 'Approved').length || 0;
  const activeLoans = employee.loans?.filter(l => l.status === 'Active') || [];
  const loansBalance = activeLoans.reduce((sum, l) => sum + l.balanceAmount, 0) || 0;
  const activeEvaluations = employee.evaluations || [];
  const avgPerformance = activeEvaluations.length 
    ? Math.round(activeEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / activeEvaluations.length) 
    : 100;

  return (
    <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6 text-start" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* HEADER HERO AREA */}
      <div className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-800 pb-5 text-start">
        <img 
          src={employee.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
          alt={employee.fullNameEn}
          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-primary/20 bg-slate-100"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-1 text-start">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-gray-950 dark:text-white leading-none">
              {isAr ? employee.fullNameAr : (employee.fullNameEn || employee.fullNameAr)}
            </h4>
            <span className="text-[9px] bg-primary/10 text-primary-dark dark:text-primary-light px-1.5 py-0.5 rounded-md font-bold font-mono shrink-0 select-none">{employee.employeeId}</span>
          </div>
          <p className="text-[10.5px] text-gray-400 font-bold leading-none">{employee.fullNameEn}</p>
          <span className="text-[10px] text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 font-bold block leading-none pt-1">
            {employee.jobTitle} • {isAr ? (employee.department || 'إداري') : (employee.department || 'Administration')}
          </span>
        </div>
      </div>

      {/* QUICK STATS CAPSULES */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[8px] font-bold text-gray-400 block leading-none">{t.pendingLoans}</span>
          <p className="text-xs font-mono font-extrabold mt-1 text-red-500 tracking-tight leading-none">{loansBalance.toLocaleString()} {t.kwd}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[8px] font-bold text-gray-400 block leading-none">{t.activeViolations}</span>
          <p className="text-xs font-mono font-extrabold mt-1 text-amber-500 tracking-tight leading-none">{warningsCount} {t.warnings}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[8px] font-bold text-gray-400 block leading-none">{t.performance}</span>
          <p className="text-xs font-mono font-extrabold mt-1 text-emerald-500 tracking-tight leading-none">{avgPerformance} / 100</p>
        </div>
      </div>

      {/* DETAILED DATA TABS OR GRIDS */}
      <div className="space-y-4 text-start">
        
        {/* CONTRACT STRETCH */}
        <div className="space-y-1 text-start">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{t.contractTitle}</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-semibold leading-normal text-start">
            <div>{t.contractType} <span className="text-gray-900 dark:text-white font-bold">{isAr ? (employee.contractType || 'غير محدد المدة') : (employee.contractType === 'غير محدد المدة' ? 'Unlimited Duration' : (employee.contractType || 'Unlimited Duration'))}</span></div>
            <div>{t.commencementDate} <span className="text-gray-950 dark:text-white font-mono font-bold">{employee.contractStartDate || employee.joiningDate}</span></div>
            <div>{t.civilIdLabel} <span className="text-gray-950 dark:text-white font-mono font-bold">{employee.civilId}</span></div>
            <div>{t.workSystem} <span className="text-gray-950 dark:text-white font-bold">{isAr ? (employee.workSystem || 'دوام كامل') : 'Full-Time Shift'}</span></div>
            <div>{t.pifssLabel} <span className="text-gray-950 dark:text-white font-mono font-bold">{employee.socialSecurityNumber || (isAr ? 'غير كويتي' : 'Expatriate')}</span></div>
            <div>{t.nationalityLabel} <span className="text-gray-950 dark:text-white font-bold">{isAr ? (employee.nationality || 'كويتي') : (employee.nationality === 'كويتي' ? 'Kuwaiti' : (employee.nationality || 'Expatriate'))}</span></div>
          </div>
        </div>

        {/* FINANCIAL SPLIT ALOW */}
        <div className="space-y-1 text-start">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <Star className="w-3.5 h-3.5 text-primary" />
            <span>{t.financialTitle}</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl space-y-2 text-[10px] text-gray-500 font-semibold leading-normal text-start">
            <div className="flex justify-between border-b border-gray-200/40 pb-1 mr-1">
              <span>{t.baseSalary}</span>
              <span className="font-mono text-gray-950 dark:text-white font-black">{employee.basicSalary.toLocaleString()} {t.kwd}</span>
            </div>
            {employee.allowances && employee.allowances.length > 0 ? (
              <div className="space-y-1 text-start">
                <span className="text-[9px] text-gray-400 font-bold block leading-none uppercase">{t.fixedAllowances}</span>
                {employee.allowances.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[9.5px] pr-2 text-gray-450 font-bold">
                    <span>• {isAr ? item.name : (item.name === 'بدل نقل' ? 'Transportation Allowance' : item.name === 'بدل سكن' ? 'Housing Allowance' : item.name)}:</span>
                    <span className="font-mono text-gray-800 dark:text-white">{item.value.toLocaleString()} {t.kwd}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-gray-400">{t.noAllowances}</p>
            )}
            <div className="flex justify-between border-t border-gray-200/40 pt-1.5 mr-1 font-extrabold text-[#00796B]">
              <span>{t.grossSalary}</span>
              <span className="font-mono font-black">{(employee.basicSalary + totalAllowances).toLocaleString()} {t.kwd}</span>
            </div>
          </div>
        </div>

        {/* DISCIPLINARY ACTIONS AUDIT */}
        <div className="space-y-1 text-start">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>{t.disciplinaryTitle}</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl max-h-36 overflow-y-auto space-y-2 text-[10px] text-gray-500 font-semibold leading-normal text-start">
            {employee.disciplinaryActions && employee.disciplinaryActions.length > 0 ? (
              employee.disciplinaryActions.map((act) => (
                <div key={act.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-150 border-r-4 border-r-amber-500 leading-snug text-start">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-gray-900 dark:text-white">{isAr ? act.violationType : (act.violationTypeEn || 'Absence without leave')}</span>
                    <span className="text-[7.5px] font-mono text-gray-400">{act.violationDate}</span>
                  </div>
                  <p className="text-[9.5px] text-gray-450 font-medium leading-normal mt-0.5">{isAr ? act.violationDetails : (act.violationDetailsEn || act.violationDetails)}</p>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100 text-[8px] font-bold">
                    <span>{t.sanctionLabel} <span className="text-red-500 font-black">{isAr ? act.penalty : (act.penaltyEn || act.penalty)}</span></span>
                    {act.penaltyAmount && <span className="font-mono text-red-500 bg-red-100 dark:bg-red-950 p-0.5 rounded">{t.deductionLabel} {act.penaltyAmount} {t.kwd}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[9px] text-gray-400 text-center py-2">{t.noDiscipline}</p>
            )}
          </div>
        </div>

        {/* LOANS TRACK SHEET */}
        <div className="space-y-1 text-start">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <Landmark className="w-3.5 h-3.5 text-[#00796B]" />
            <span>{t.loansTitle}</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl max-h-36 overflow-y-auto space-y-2 text-[10px] text-gray-500 font-semibold leading-normal text-start">
            {employee.loans && employee.loans.length > 0 ? (
              employee.loans.map((loan) => (
                <div key={loan.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-150 border-r-4 border-r-emerald-500 leading-snug text-start">
                  <div className="flex justify-between items-start font-bold text-start">
                    <span className="text-gray-900 dark:text-white">{t.adminLoan} {loan.id}</span>
                    <span className="text-[7.5px] font-mono text-gray-400">{loan.issueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] mt-1 text-gray-400 font-bold">
                    <span>{t.principalAmount} <span className="font-mono font-extrabold text-gray-850 dark:text-white">{loan.principalAmount} {t.kwd}</span></span>
                    <span>{t.monthlyInstallment} <span className="font-mono font-extrabold text-gray-850 dark:text-white">{loan.monthlyInstallment} {t.kwd}</span></span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100 text-[8.5px] font-bold">
                    <span>{t.paymentStatus} <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 rounded pl-1 pr-1 font-extrabold">{isAr ? loan.status : (loan.status === 'Active' ? 'Active Installments' : loan.status)}</span></span>
                    <span>{t.remainingBalance} <span className="font-mono text-red-500 font-black">{loan.balanceAmount} {t.kwd}</span></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[9px] text-gray-400 text-center py-2">{t.noLoans}</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
