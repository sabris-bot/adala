import React from 'react';
import { User, Edit, FileText, ChevronLeft } from 'lucide-react';
import { ExtendedEmployee } from '../../pages/EmployeeProfileData';

interface EmployeeCardProps {
    employee: ExtendedEmployee;
    isSelected: boolean;
    alertsCount: number;
    onSelect: (emp: ExtendedEmployee) => void;
    onEdit: (emp: ExtendedEmployee) => void;
    onOpenDocs: (emp: ExtendedEmployee) => void;
    onOpenUpload: (emp: ExtendedEmployee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
    employee,
    isSelected,
    alertsCount,
    onSelect,
    onEdit,
    onOpenDocs,
}) => {
    // Calculate gross salary
    const grossSalary = (employee.basicSalary || 0) + (employee.allowances?.reduce((sum, a) => sum + a.value, 0) || 0);
    
    // Calculate remaining leave days
    const remainingLeaves = (employee.annualLeaveEntitlement || 30) + (employee.carriedOverBalance || 0) - (employee.absenceDays || 0);

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
        <div
            className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between gap-4 text-right shadow-2xs hover:shadow-md ${
                isSelected
                    ? 'border-teal-500/80 dark:border-teal-500/60 ring-2 ring-teal-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
        >
            {/* 1. UPPER PORTION: Avatar, Full Name, Job Title, Employee ID, Status Badge */}
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar / Initials */}
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 flex items-center justify-center font-black text-sm border border-teal-100 dark:border-teal-900/40 shadow-2xs">
                                {employee.fullNameAr.split(' ').slice(0, 2).map(n => n[0]).join('')}
                            </div>
                            {alertsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white dark:border-slate-900 shadow-2xs" title={`${alertsCount} تنبيهات وثائق انتهت صلاحيتها`}>
                                    {alertsCount}
                                </span>
                            )}
                        </div>

                        {/* Name & Title */}
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white m-0 truncate leading-snug" title={employee.fullNameAr}>
                                {employee.fullNameAr}
                            </h3>
                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 m-0 uppercase truncate">
                                {employee.fullNameEn}
                            </p>
                            <span className="text-[11.5px] font-bold text-teal-700 dark:text-teal-400 block mt-0.5 truncate">
                                {employee.jobTitle}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            employee.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                                : employee.status === 'On Leave'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                        }`}
                    >
                        {employee.status === 'Active' ? 'على رأس العمل' : employee.status === 'On Leave' ? 'في إجازة' : 'موقوف'}
                    </span>
                </div>

                {/* Info Sub-bar (Dept & Emp ID) */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="truncate">{getDeptLabel(employee.department)}</span>
                    <span className="font-mono text-teal-700 dark:text-teal-400 font-extrabold shrink-0">
                        {employee.employeeId}
                    </span>
                </div>

                {/* 2. MIDDLE PORTION: 3 key metrics in 1 single row */}
                <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-center">
                    <div className="bg-slate-50/80 dark:bg-slate-950/40 p-2 rounded-xl">
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block font-bold">تاريخ المباشرة</span>
                        <span className="text-[10.5px] font-mono font-black text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {employee.joiningDate}
                        </span>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-950/40 p-2 rounded-xl">
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block font-bold">الراتب الإجمالي</span>
                        <span className="text-[10.5px] font-mono font-black text-teal-700 dark:text-teal-400 mt-0.5 block">
                            {grossSalary.toLocaleString()} د.ك
                        </span>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-950/40 p-2 rounded-xl">
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block font-bold">رصيد الإجازات</span>
                        <span className="text-[10.5px] font-mono font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                            {remainingLeaves} يوماً
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. LOWER PORTION: Clean & smooth quick action buttons */}
            <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {/* View Full Profile */}
                <button
                    type="button"
                    onClick={() => onSelect(employee)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-black text-[11px] rounded-xl transition-all cursor-pointer border-none shadow-2xs"
                >
                    <User className="w-3.5 h-3.5" />
                    <span>عرض الملف الشامل</span>
                </button>

                {/* Edit Employee */}
                <button
                    type="button"
                    onClick={() => onEdit(employee)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-xl transition-colors cursor-pointer border-none shrink-0"
                    title="تعديل بيانات الموظف"
                >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                </button>

                {/* Forms & Contracts Studio */}
                <button
                    type="button"
                    onClick={() => {
                        onSelect(employee);
                        onOpenDocs(employee);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-bold text-[11px] rounded-xl transition-colors cursor-pointer border border-teal-100 dark:border-teal-900/30 shrink-0"
                    title="توليد وتعبئة النماذج والعقود الرسمية"
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>النماذج</span>
                </button>
            </div>
        </div>
    );
};
