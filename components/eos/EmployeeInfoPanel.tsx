import React from 'react';
import { 
  User, ShieldAlert, Landmark, Calendar, Award, 
  MapPin, Phone, Mail, Award as Star, Info, ListTodo, Activity
} from 'lucide-react';
import { ExtendedEmployee } from '../../data/employeeExtendedData';

interface EmployeeInfoPanelProps {
  employee: ExtendedEmployee | null;
}

export const EmployeeInfoPanel: React.FC<EmployeeInfoPanelProps> = ({ employee }) => {
  if (!employee) {
    return (
      <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-400 select-none">
        <User className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-2 animate-bounce" />
        <p className="text-xs font-black">حدد موظفاً من قائمة الأفراد الجانبية لعرض موازنة حياتهم وتفاصيل علاقتهم الوظيفية المبرمة بالتفصيل.</p>
        <p className="text-[10px] text-gray-500 mt-1 leading-snug">رصد الرواتب الأساسية، البدلات، العقوبات المرفوعة، والذمم الإقراضية النشطة بدولة الكويت.</p>
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
    <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6 text-right">
      
      {/* HEADER HERO AREA */}
      <div className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-800 pb-5">
        <img 
          src={employee.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
          alt={employee.fullNameEn}
          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-primary/20 bg-slate-100"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-gray-950 dark:text-white leading-none">{employee.fullNameAr}</h4>
            <span className="text-[9px] bg-primary/10 text-primary-dark dark:text-primary-light px-1.5 py-0.5 rounded-md font-bold font-mono shrink-0 select-none">{employee.employeeId}</span>
          </div>
          <p className="text-[10.5px] text-gray-400 font-bold leading-none">{employee.fullNameEn}</p>
          <span className="text-[10px] text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 font-bold block leading-none pt-1">
            {employee.jobTitle} • {employee.department}
          </span>
        </div>
      </div>

      {/* QUICK STATS CAPSULES */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[8px] font-bold text-gray-400 block leading-none">مديونية السلف المعلقة</span>
          <p className="text-xs font-mono font-extrabold mt-1 text-red-500 tracking-tight leading-none">{loansBalance.toLocaleString()} د.ك</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[8px] font-bold text-gray-400 block leading-none">مخالفات وجزاءات نشطة</span>
          <p className="text-xs font-mono font-extrabold mt-1 text-amber-500 tracking-tight leading-none">{warningsCount} إنذار</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[8px] font-bold text-gray-400 block leading-none">التقييم الفني العام</span>
          <p className="text-xs font-mono font-extrabold mt-1 text-emerald-500 tracking-tight leading-none">{avgPerformance} / 100</p>
        </div>
      </div>

      {/* DETAILED DATA TABS OR GRIDS */}
      <div className="space-y-4">
        
        {/* CONTRACT STRETCH */}
        <div className="space-y-1">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>بيانات عقد العمل والتعيين الموثق:</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-semibold leading-normal">
            <div>نوع صك العقد: <span className="text-gray-900 dark:text-white font-bold">{employee.contractType || 'غير محدد المدة'}</span></div>
            <div>تاريخ التعيين: <span className="text-gray-950 dark:text-white font-mono font-bold">{employee.contractStartDate || employee.joiningDate}</span></div>
            <div>الرقم المدني: <span className="text-gray-950 dark:text-white font-mono font-bold">{employee.civilId}</span></div>
            <div>نظام الدوام: <span className="text-gray-950 dark:text-white font-bold">{employee.workSystem || 'دوام كامل'}</span></div>
            <div>رقم التأمين PIFSS: <span className="text-gray-950 dark:text-white font-mono font-bold">{employee.socialSecurityNumber || 'غير كويتي'}</span></div>
            <div>الجنسية والبلد: <span className="text-gray-950 dark:text-white font-bold">{employee.nationality || 'كويتي'}</span></div>
          </div>
        </div>

        {/* FINANCIAL SPLIT ALOW */}
        <div className="space-y-1">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <Star className="w-3.5 h-3.5 text-primary" />
            <span>ملف الرواتب والامتيازات المالية المبرمة:</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl space-y-2 text-[10px] text-gray-500 font-semibold leading-normal">
            <div className="flex justify-between border-b border-gray-200/40 pb-1 mr-1">
              <span>الأجر الأساسي الثابت (Basic Salary):</span>
              <span className="font-mono text-gray-950 dark:text-white font-black">{employee.basicSalary.toLocaleString()} د.ك</span>
            </div>
            {employee.allowances && employee.allowances.length > 0 ? (
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 font-bold block leading-none uppercase">البدلات الخاضعة لاندمنتي:</span>
                {employee.allowances.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[9.5px] pr-2 text-gray-400 font-bold">
                    <span>• {item.name}:</span>
                    <span className="font-mono text-gray-800 dark:text-white">{item.value.toLocaleString()} د.ك</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-gray-400">لا توجد بدلات إضافية مضافة بالكشف.</p>
            )}
            <div className="flex justify-between border-t border-gray-200/40 pt-1.5 mr-1 font-extrabold text-[#00796B]">
              <span>الراتب الإجمالي الكلي (Gross Salary):</span>
              <span className="font-mono font-black">{(employee.basicSalary + totalAllowances).toLocaleString()} د.ك</span>
            </div>
          </div>
        </div>

        {/* DISCIPLINARY ACTIONS AUDIT */}
        <div className="space-y-1">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>سجل الجزاءات والتحقيقات التأديبية:</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl max-h-36 overflow-y-auto space-y-2 text-[10px] text-gray-500 font-semibold leading-normal">
            {employee.disciplinaryActions && employee.disciplinaryActions.length > 0 ? (
              employee.disciplinaryActions.map((act) => (
                <div key={act.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-150 border-r-4 border-r-amber-500 leading-snug">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-gray-900 dark:text-white">{act.violationType}</span>
                    <span className="text-[7.5px] font-mono text-gray-400">{act.violationDate}</span>
                  </div>
                  <p className="text-[9.5px] text-gray-400 font-medium leading-normal mt-0.5">{act.violationDetails}</p>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100 text-[8px] font-bold">
                    <span>العقوبة المقررة: <span className="text-red-500 font-black">{act.penalty}</span></span>
                    {act.penaltyAmount && <span className="font-mono text-red-500 bg-red-100 p-0.5 rounded">خصم {act.penaltyAmount} د.ك</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[9px] text-gray-400 text-center py-2">السجل التأديبي خالي من المخالفات والجزاءات الإدارية تماماً ✔</p>
            )}
          </div>
        </div>

        {/* LOANS TRACK SHEET */}
        <div className="space-y-1">
          <h5 className="font-black text-[11px] text-gray-900 dark:text-white flex items-center gap-1 leading-none select-none">
            <Landmark className="w-3.5 h-3.5 text-[#00796B]" />
            <span>كشف القروض والسلف المالية المتراكمة ذات المنشأ:</span>
          </h5>
          <div className="bg-gray-50 dark:bg-slate-950/45 border border-gray-100 dark:border-gray-800 p-3 rounded-xl max-h-36 overflow-y-auto space-y-2 text-[10px] text-gray-500 font-semibold leading-normal">
            {employee.loans && employee.loans.length > 0 ? (
              employee.loans.map((loan) => (
                <div key={loan.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-150 border-r-4 border-r-emerald-500 leading-snug">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-gray-900 dark:text-white">سلفة إدارية رقم: {loan.id}</span>
                    <span className="text-[7.5px] font-mono text-gray-400">{loan.issueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] mt-1 text-gray-400 font-bold">
                    <span>قيمة القرض الكلية: <span className="font-mono font-extrabold text-gray-800 dark:text-white">{loan.principalAmount} د.ك</span></span>
                    <span>القسط الشهري: <span className="font-mono font-extrabold text-gray-800 dark:text-white">{loan.monthlyInstallment} د.ك</span></span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100 text-[8.5px] font-bold">
                    <span>حالة التراكم السداد: <span className="text-emerald-600 bg-emerald-50 rounded pl-1 pr-1 font-extrabold">{loan.status}</span></span>
                    <span>الرصيد المتبقي لإجر المقاصة: <span className="font-mono text-red-500 font-black">{loan.balanceAmount} د.ك</span></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[9px] text-gray-400 text-center py-2">لا يوجد سلف أو قروض مسجلة بذمة الموظف حالياً ✔</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
