import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Users, UserCheck, ShieldCheck, Scale, FileText, 
  HelpCircle, Calendar, PlusCircle, Trash, AlertTriangle,
  Calculator, DollarSign, Search, Sparkles, CheckCircle2,
  TrendingUp, Download, Eye, Award
} from 'lucide-react';
import { LeaveTypeKuwait } from '../../types';
import { DetailedLeaveRequest } from '../LeaveManagementPage';

interface LeaveBalancesTabProps {
  lang: 'ar' | 'en';
  employeesList: any[];
  requests: DetailedLeaveRequest[];
  getDeptLabel: (deptKey?: string) => string;
  onOpenProfile: (employee: any) => void;
  onAddManualEmployee: () => void;
  showManualEmployee: boolean;
  setShowManualEmployee: (val: boolean) => void;
  manualEmpName: string;
  setManualEmpName: (val: string) => void;
  manualEmpJob: string;
  setManualEmpJob: (val: string) => void;
  manualEmpDept: string;
  setManualEmpDept: (val: string) => void;
  manualEmpJoined: string;
  setManualEmpJoined: (val: string) => void;
  manualEmpCivilId: string;
  setManualEmpCivilId: (val: string) => void;
  manualEmpEntitlement: number;
  setManualEmpEntitlement: (val: number) => void;
  manualEmpCarriedOver: number;
  setManualEmpCarriedOver: (val: number) => void;
  onSaveManualEmployee: (e: React.FormEvent) => void;
}

export const LeaveBalancesTab: React.FC<LeaveBalancesTabProps> = ({
  lang,
  employeesList,
  requests,
  getDeptLabel,
  onOpenProfile,
  onAddManualEmployee,
  showManualEmployee,
  setShowManualEmployee,
  manualEmpName,
  setManualEmpName,
  manualEmpJob,
  setManualEmpJob,
  manualEmpDept,
  setManualEmpDept,
  manualEmpJoined,
  setManualEmpJoined,
  manualEmpCivilId,
  setManualEmpCivilId,
  manualEmpEntitlement,
  setManualEmpEntitlement,
  manualEmpCarriedOver,
  setManualEmpCarriedOver,
  onSaveManualEmployee
}) => {
  const isAr = lang === 'ar';
  const [balanceSearch, setBalanceSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Interactive Accrual & Encashment Calculator State
  const [calcSalary, setCalcSalary] = useState<number>(1200);
  const [calcMonthsWorked, setCalcMonthsWorked] = useState<number>(12);
  const [calcDaysBalance, setCalcDaysBalance] = useState<number>(15);
  const [calcDivisor, setCalcDivisor] = useState<26 | 30>(26); // 26 working days standard in Kuwait private sector or 30 days

  // Calculated Encashment
  const calculatedValues = useMemo(() => {
    // 2.5 days accrued per month
    const accruedDays = Math.round((calcMonthsWorked * 2.5) * 10) / 10;
    // Daily wage = monthly salary / divisor
    const dailyWage = calcSalary / calcDivisor;
    // Leave payout = daily wage * remaining days
    const leavePayout = Math.round(dailyWage * calcDaysBalance * 1000) / 1000;
    
    return {
      accruedDays,
      dailyWage: Math.round(dailyWage * 1000) / 1000,
      leavePayout
    };
  }, [calcSalary, calcMonthsWorked, calcDaysBalance, calcDivisor]);

  // Filter employees
  const filteredEmployees = employeesList.filter(emp => {
    const matchesSearch = 
      (emp.fullNameAr && emp.fullNameAr.toLowerCase().includes(balanceSearch.toLowerCase())) ||
      (emp.fullNameEn && emp.fullNameEn.toLowerCase().includes(balanceSearch.toLowerCase())) ||
      (emp.civilId && emp.civilId.includes(balanceSearch));
    const matchesDept = selectedDeptFilter === 'All' || emp.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-2xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-850 dark:text-white">
              {isAr ? 'منظومة إدارة مستحقات وأرصدة الموارد البشرية' : 'HR Accruals & Leave Ledger'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr 
                ? 'احتساب الاستحقاق السنوي (المادة 70) وتصفية بدلات الإجازات النقدية وفق قانون العمل الكويتي رقم 6 لسنة 2010' 
                : 'Kuwait Labour Law No. 6/2010 Leave Accrual & Encashment System'}
            </p>
          </div>
        </div>

        <Button 
          variant="primary" 
          size="sm"
          className="text-xs font-bold shrink-0"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setShowManualEmployee(!showManualEmployee)}
        >
          {showManualEmployee ? (isAr ? 'إغلاق نافذة الإدخال' : 'Close Form') : (isAr ? 'إدراج موظف مالي مخصص' : 'Add Custom Employee')}
        </Button>
      </div>

      {/* Manual Add Employee Block */}
      {showManualEmployee && (
        <Card title={isAr ? 'إضافة وتعيين موظف جديد لدفتر الإجازات' : 'Enroll Custom Employee Profile'}>
          <form onSubmit={onSaveManualEmployee} className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'الاسم الكامل (بالعربية)' : 'Full Name (Arabic)'}</label>
                <input
                  type="text"
                  required
                  value={manualEmpName}
                  onChange={(e) => setManualEmpName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="محمد أحمد الهاجري"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'المسمى الوظيفي / القضائي' : 'Job Title / Legal Grade'}</label>
                <input
                  type="text"
                  required
                  value={manualEmpJob}
                  onChange={(e) => setManualEmpJob(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="محام استئناف وتمييز"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'القسم والشعبة' : 'Department Assignment'}</label>
                <select
                  value={manualEmpDept}
                  onChange={(e) => setManualEmpDept(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="Consultation">{isAr ? 'قسم الاستشارات والعقود' : 'Consultation'}</option>
                  <option value="Litigation">{isAr ? 'قسم التقاضي والمحاكم' : 'Litigation'}</option>
                  <option value="Corporate">{isAr ? 'قسم الشركات والتجاري' : 'Corporate'}</option>
                  <option value="Admin">{isAr ? 'الشؤون الإدارية العامة' : 'General Admin'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'تاريخ التعيين' : 'Hiring Date'}</label>
                <input
                  type="date"
                  required
                  value={manualEmpJoined}
                  onChange={(e) => setManualEmpJoined(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'الرقم المدني الكويتي (١٢ خانة)' : 'Kuwait Civil ID (12 digits)'}</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={manualEmpCivilId}
                  onChange={(e) => setManualEmpCivilId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  placeholder="295051501981"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'الاستحقاق السنوي (أيام)' : 'Annual Entitlement'}</label>
                <input
                  type="number"
                  required
                  value={manualEmpEntitlement}
                  onChange={(e) => setManualEmpEntitlement(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{isAr ? 'الرصيد المرحل من العام الماضي' : 'Carried Over Balance'}</label>
                <input
                  type="number"
                  required
                  value={manualEmpCarriedOver}
                  onChange={(e) => setManualEmpCarriedOver(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit" size="sm" className="font-bold">
                {isAr ? 'تثبيت وحفظ الموظف' : 'Enroll Personnel'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* HR Statutory Leave & Encashment Calculator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">
              {isAr ? 'حاسبة استحقاق وبدل رصيد الإجازات النقدي (المادة 70 و 71)' : 'Statutory Leave Accrual & Encashment Calculator'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'حساب الاستحقاق النسبي وبدل الإجازات النقدية عند التصفية أو نهاية الخدمة' : 'Prorated accruals and financial compensation'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          
          {/* Input 1: Monthly Salary */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'الراتب الإجمالي الشهري (د.ك):' : 'Monthly Gross Salary (KWD):'}
            </label>
            <div className="relative">
              <input
                type="number"
                min={100}
                step={50}
                value={calcSalary}
                onChange={(e) => setCalcSalary(Math.max(0, Number(e.target.value)))}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-[10px] text-slate-400 font-mono pointer-events-none">
                KWD
              </span>
            </div>
          </div>

          {/* Input 2: Months Worked */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'أشهر الخدمة خلال السنة:' : 'Service Months this Year:'}
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={calcMonthsWorked}
              onChange={(e) => setCalcMonthsWorked(Math.max(1, Math.min(12, Number(e.target.value))))}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary text-center"
            />
          </div>

          {/* Input 3: Days Remaining for Payout */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'أيام الرصيد المراد تصفيتها:' : 'Days for Cash Settlement:'}
            </label>
            <input
              type="number"
              min={0}
              max={90}
              value={calcDaysBalance}
              onChange={(e) => setCalcDaysBalance(Math.max(0, Number(e.target.value)))}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary text-center"
            />
          </div>

          {/* Input 4: Working Days Basis */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'أساس احتساب اليومية:' : 'Daily Wage Divisor:'}
            </label>
            <select
              value={calcDivisor}
              onChange={(e) => setCalcDivisor(Number(e.target.value) as 26 | 30)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={26}>{isAr ? '٢٦ يوم عمل (المعيار القضائي الكويتي)' : '26 Days (Kuwait Standard)'}</option>
              <option value={30}>{isAr ? '٣٠ يوم تقويمي' : '30 Calendar Days'}</option>
            </select>
          </div>

        </div>

        {/* Calculator Output KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'الاستحقاق النسبي المكتسب' : 'Accrued Entitlement'}</p>
            <p className="text-xl font-mono font-black text-slate-850 dark:text-white mt-1">
              {calculatedValues.accruedDays} <span className="text-xs font-normal text-slate-400">{isAr ? 'يوماً' : 'days'}</span>
            </p>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1">
              {isAr ? 'بمعدل 2.5 يوم / شهر' : '2.5 days / month'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'أجر اليوم الواحد' : 'Daily Wage Rate'}</p>
            <p className="text-xl font-mono font-black text-slate-850 dark:text-white mt-1">
              {calculatedValues.dailyWage.toFixed(3)} <span className="text-xs font-normal text-slate-400">KWD</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {isAr ? `الراتب ÷ ${calcDivisor}` : `Salary ÷ ${calcDivisor}`}
            </p>
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-900/40">
            <p className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">{isAr ? 'صافي البدل المالي المستحق' : 'Net Cash Encashment'}</p>
            <p className="text-xl font-mono font-black text-teal-700 dark:text-teal-400 mt-1">
              {calculatedValues.leavePayout.toFixed(3)} <span className="text-xs font-normal text-teal-600">KWD</span>
            </p>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1">
              {isAr ? 'مستحق الصرف قبل الإجازة أو مع التسوية' : 'Payable upon leave or settlement'}
            </p>
          </div>

        </div>
      </div>

      {/* Main Balances Table Ledger with Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">
              {isAr ? 'دفتر مستحقات وأرصدة إجازات كوادر العمل' : 'Employee Vacation Balances Ledger'}
            </h4>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={balanceSearch}
                onChange={(e) => setBalanceSearch(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم أو الرقم المدني...' : 'Search employee...'}
                className="w-full pr-8 pl-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary text-right"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="All">{isAr ? 'كل الأقسام' : 'All Depts'}</option>
              <option value="Consultation">{isAr ? 'الاستشارات' : 'Consultation'}</option>
              <option value="Litigation">{isAr ? 'التقاضي' : 'Litigation'}</option>
              <option value="Corporate">{isAr ? 'الشركات' : 'Corporate'}</option>
              <option value="Admin">{isAr ? 'الإدارية' : 'Admin'}</option>
            </select>
          </div>
        </div>

        {/* Balances Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs" dir="rtl">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="p-3 font-bold text-right">{isAr ? 'الموظف' : 'Employee'}</th>
                <th className="p-3 font-bold text-right">{isAr ? 'القسم' : 'Department'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'تاريخ التعيين' : 'Hiring Date'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'الاستحقاق السنوي' : 'Annual'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'مُرحّل' : 'Carried'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'مستهلك' : 'Consumed'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'صافي المتبقي' : 'Net Remaining'}</th>
                <th className="p-3 font-bold text-right">{isAr ? 'حالة الامتثال القانوني' : 'Compliance'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'الملف' : 'Dossier'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEmployees.map((emp) => {
                // Calculate consumption
                const empRequests = requests.filter(r => r.employeeId === emp.id && (r.status === 'Approved' || r.status === 'Completed'));
                const annualConsumed = empRequests
                  .filter(r => r.leaveType === LeaveTypeKuwait.ANNUAL || r.leaveType === LeaveTypeKuwait.UNPAID)
                  .reduce((sum, r) => sum + r.numberOfDays, 0);

                const annual = emp.annualLeaveEntitlement || 30;
                const carried = emp.carriedOverBalance || 0;
                const total = annual + carried;
                const remaining = Math.max(0, total - annualConsumed);

                // Check probation under Article 70 (probation is 6 months)
                const hiringDate = new Date(emp.hiringDate || '2026-01-15');
                const diffTime = Math.abs(Date.now() - hiringDate.getTime());
                const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
                const isUnderProbation = diffMonths < 6;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    
                    <td className="p-3 font-bold text-slate-850 dark:text-white text-right">
                      {emp.fullNameAr}
                      <span className="block text-[10px] text-slate-400 font-normal font-mono mt-0.5">
                        {isAr ? 'الرقم المدني:' : 'Civil ID:'} {emp.civilId || '295051501981'}
                      </span>
                    </td>

                    <td className="p-3 text-right text-slate-500">
                      {getDeptLabel(emp.department)}
                    </td>

                    <td className="p-3 text-center font-mono text-slate-400">
                      {emp.hiringDate || '2026-01-15'}
                    </td>

                    <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {annual} <span className="text-[10px] font-normal text-slate-400">{isAr ? 'يوم' : 'd'}</span>
                    </td>

                    <td className="p-3 text-center font-medium text-slate-500">
                      {carried} <span className="text-[10px] font-normal text-slate-400">{isAr ? 'يوم' : 'd'}</span>
                    </td>

                    <td className="p-3 text-center font-bold text-amber-600">
                      {annualConsumed} <span className="text-[10px] font-normal text-slate-400">{isAr ? 'يوم' : 'd'}</span>
                    </td>

                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800">
                        {remaining} {isAr ? 'يوماً' : 'Days'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      {isUnderProbation ? (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {isAr ? 'فترة تجربة (< ٦ أشهر)' : 'Under Probation'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isAr ? 'مستحق إجازة كاملة' : 'Eligible'}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2.5 py-1 text-[11px] h-7 font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                        onClick={() => onOpenProfile(emp)}
                      >
                        {isAr ? 'الملف' : 'Dossier'}
                      </Button>
                    </td>

                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-slate-400 dark:text-slate-500">
                    {isAr ? 'لا يوجد موظفون مطابقون لخيارات البحث.' : 'No matching employees found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

