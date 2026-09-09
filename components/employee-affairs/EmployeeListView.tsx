import React from 'react';
import { Edit, FileText, User } from 'lucide-react';
import { ExtendedEmployee } from '../../pages/EmployeeProfileData';

interface EmployeeListViewProps {
    employees: ExtendedEmployee[];
    selectedEmployeeId?: string;
    getAlertsCount: (emp: ExtendedEmployee) => number;
    onSelect: (emp: ExtendedEmployee) => void;
    onEdit: (emp: ExtendedEmployee) => void;
    onOpenDocs: (emp: ExtendedEmployee) => void;
    onOpenUpload: (emp: ExtendedEmployee) => void;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
    employees,
    selectedEmployeeId,
    getAlertsCount,
    onSelect,
    onEdit,
    onOpenDocs,
}) => {
    const getDeptLabel = (dept: string) => {
        switch (dept) {
            case 'Consultation': return 'الاستشارات والمرافعات';
            case 'Litigation': return 'التقاضي والإعلانات';
            case 'Finance': return 'الحسابات والمالية';
            case 'HR': return 'الموارد البشرية';
            default: return dept;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                    <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="p-3.5 pr-4">الموظف والمسمى</th>
                            <th className="p-3.5">الرقم الوظيفي</th>
                            <th className="p-3.5">القسم والإدارة</th>
                            <th className="p-3.5">تاريخ المباشرة</th>
                            <th className="p-3.5">الراتب الإجمالي</th>
                            <th className="p-3.5">رصيد الإجازات</th>
                            <th className="p-3.5">الحالة الوظيفية</th>
                            <th className="p-3.5 pl-4 text-center">الإجراءات السريعة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {employees.map((emp) => {
                            const isSelected = emp.id === selectedEmployeeId;
                            const alertsCount = getAlertsCount(emp);
                            const grossSalary = (emp.basicSalary || 0) + (emp.allowances?.reduce((sum, a) => sum + a.value, 0) || 0);
                            const remainingLeaves = (emp.annualLeaveEntitlement || 30) + (emp.carriedOverBalance || 0) - (emp.absenceDays || 0);

                            return (
                                <tr
                                    key={emp.id}
                                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                                        isSelected ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                                    }`}
                                >
                                    <td className="p-3 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative shrink-0">
                                                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-black flex items-center justify-center text-xs border border-teal-100 dark:border-teal-900/40">
                                                    {emp.fullNameAr.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                                </div>
                                                {alertsCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black">
                                                        {alertsCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-slate-900 dark:text-white truncate">
                                                    {emp.fullNameAr}
                                                </div>
                                                <div className="text-[10.5px] text-teal-700 dark:text-teal-400 font-bold truncate">
                                                    {emp.jobTitle}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-3 font-mono font-bold text-teal-800 dark:text-teal-300">
                                        {emp.employeeId}
                                    </td>

                                    <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">
                                        {getDeptLabel(emp.department)}
                                    </td>

                                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                                        {emp.joiningDate}
                                    </td>

                                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {grossSalary.toLocaleString()} د.ك
                                    </td>

                                    <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                                        {remainingLeaves} يوماً
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-block ${
                                                emp.status === 'Active'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
                                                    : emp.status === 'On Leave'
                                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30'
                                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30'
                                            }`}
                                        >
                                            {emp.status === 'Active' ? 'على رأس العمل' : emp.status === 'On Leave' ? 'في إجازة' : 'موقوف'}
                                        </span>
                                    </td>

                                    <td className="p-3 pl-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(emp)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer border-none shadow-2xs"
                                                title="عرض الملف الشامل"
                                            >
                                                <User className="w-3 h-3" />
                                                <span>عرض الملف</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onEdit(emp)}
                                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] rounded-xl transition-colors cursor-pointer border-none"
                                                title="تعديل"
                                            >
                                                <Edit className="w-3 h-3" />
                                                <span>تعديل</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSelect(emp);
                                                    onOpenDocs(emp);
                                                }}
                                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-bold text-[10.5px] rounded-xl transition-colors cursor-pointer border border-teal-100 dark:border-teal-900/30"
                                                title="النماذج الرسمية"
                                            >
                                                <FileText className="w-3 h-3" />
                                                <span>النماذج</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
