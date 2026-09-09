import React from 'react';
import { Users, UserCheck, CalendarOff, Wallet } from 'lucide-react';
import { ExtendedEmployee } from '../../pages/EmployeeProfileData';

interface EmployeeKpiSummaryBarProps {
    employees: ExtendedEmployee[];
}

export const EmployeeKpiSummaryBar: React.FC<EmployeeKpiSummaryBarProps> = ({ employees }) => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const onLeaveEmployees = employees.filter(e => e.status === 'On Leave').length;
    
    // Calculate total gross monthly payroll in KWD
    const totalPayroll = employees.reduce((sum, emp) => {
        const basic = emp.basicSalary || 0;
        const allowances = emp.allowances?.reduce((aSum, a) => aSum + a.value, 0) || 0;
        return sum + basic + allowances;
    }, 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
            
            {/* KPI 1: Total Employees */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between text-right">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        إجمالي الموظفين
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {totalEmployees}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            موظف مسجل
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100/80 dark:border-teal-900/40 shrink-0">
                    <Users className="w-6 h-6" />
                </div>
            </div>

            {/* KPI 2: Active Employees */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between text-right">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        على رأس العمل
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {activeEmployees}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                            نشط الآن
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/80 dark:border-emerald-900/40 shrink-0">
                    <UserCheck className="w-6 h-6" />
                </div>
            </div>

            {/* KPI 3: On Leave */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between text-right">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        في إجازة
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            {onLeaveEmployees}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                            مجاز حالياً
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100/80 dark:border-amber-900/40 shrink-0">
                    <CalendarOff className="w-6 h-6" />
                </div>
            </div>

            {/* KPI 4: Total Payroll */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between text-right">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        إجمالي الرواتب
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {totalPayroll.toLocaleString('en-US')}
                        </span>
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                            د.ك/شهر
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                    <Wallet className="w-6 h-6" />
                </div>
            </div>

        </div>
    );
};
