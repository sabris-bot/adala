import React from 'react';
import { Search, RotateCcw, Plus, LayoutGrid, List, X } from 'lucide-react';

interface EmployeeFilterBarProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    filterDept: string;
    onDeptChange: (val: string) => void;
    filterStatus: string;
    onStatusChange: (val: string) => void;
    filterContractType: string;
    onContractTypeChange: (val: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onResetFilters: () => void;
    onAddEmployee: () => void;
    totalCount: number;
    filteredCount: number;
}

export const EmployeeFilterBar: React.FC<EmployeeFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    filterDept,
    onDeptChange,
    filterStatus,
    onStatusChange,
    filterContractType,
    onContractTypeChange,
    viewMode,
    onViewModeChange,
    onResetFilters,
    onAddEmployee,
    totalCount,
    filteredCount,
}) => {
    const isFiltered = searchQuery !== '' || filterDept !== 'ALL' || filterStatus !== 'ALL' || filterContractType !== 'ALL';

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 md:p-4 shadow-2xs transition-colors space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search Bar & Dropdown Filters */}
                <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 flex-wrap">
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64 md:w-72">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="البحث بالاسم، الرقم الوظيفي، أو المدني..."
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-8 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute left-2.5 top-2.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Department Dropdown */}
                    <div className="relative w-full sm:w-40">
                        <select
                            value={filterDept}
                            onChange={(e) => onDeptChange(e.target.value)}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="ALL">جميع الأقسام</option>
                            <option value="Consultation">الاستشارات والمرافعات</option>
                            <option value="Litigation">التقاضي والإعلانات</option>
                            <option value="Finance">الحسابات والمالية</option>
                            <option value="HR">الموارد البشرية</option>
                        </select>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative w-full sm:w-36">
                        <select
                            value={filterStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="ALL">جميع الحالات</option>
                            <option value="Active">على رأس العمل</option>
                            <option value="On Leave">في إجازة</option>
                            <option value="Suspended">موقوف</option>
                        </select>
                    </div>

                    {/* Contract Type Dropdown */}
                    <div className="relative w-full sm:w-36">
                        <select
                            value={filterContractType}
                            onChange={(e) => onContractTypeChange(e.target.value)}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="ALL">جميع العقود</option>
                            <option value="غير محدد المدة">غير محدد المدة</option>
                            <option value="محدد المدة">محدد المدة</option>
                            <option value="مؤقت">مؤقت</option>
                            <option value="جزئي">دوام جزئي</option>
                        </select>
                    </div>

                    {/* Reset Button (Visible when filters are active) */}
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer border-none shrink-0"
                            title="إعادة ضبط الفلاتر"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            <span>إلغاء الفلترة</span>
                        </button>
                    )}
                </div>

                {/* Right / Left Action Toolbar */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    
                    {/* Filter count & View Mode Switcher */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                            {filteredCount} من {totalCount} موظف
                        </span>

                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                            <button
                                type="button"
                                onClick={() => onViewModeChange('grid')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent'
                                }`}
                                title="عرض شبكي (بطاقات)"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onViewModeChange('list')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent'
                                }`}
                                title="عرض جدول (قائمة)"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Prominent "+ إضافة موظف جديد" Button */}
                    <button
                        type="button"
                        onClick={onAddEmployee}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer border-none active:scale-98"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة موظف جديد</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
