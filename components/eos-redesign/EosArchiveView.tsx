import React from 'react';
import { 
  Search, Trash2, FolderOpen, Calendar, DollarSign, 
  User, Briefcase, Award, ArrowLeftRight 
} from 'lucide-react';

interface EosArchiveViewProps {
  employees: any[];
  archiveSearch: string;
  setArchiveSearch: (val: string) => void;
  archiveNationalityFilter: 'all' | 'kuwaiti' | 'expat';
  setArchiveNationalityFilter: (val: 'all' | 'kuwaiti' | 'expat') => void;
  onSelectEmployee: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EosArchiveView: React.FC<EosArchiveViewProps> = ({
  employees,
  archiveSearch,
  setArchiveSearch,
  archiveNationalityFilter,
  setArchiveNationalityFilter,
  onSelectEmployee,
  onDeleteEmployee
}) => {
  
  const filtered = employees.filter((emp) => {
    const matchesSearch = 
      (emp.employeeName || '').toLowerCase().includes(archiveSearch.toLowerCase()) ||
      (emp.civilId || '').includes(archiveSearch) ||
      (emp.id || '').includes(archiveSearch) ||
      (emp.jobTitle || '').toLowerCase().includes(archiveSearch.toLowerCase());

    const isKuwaitiBool = emp.isKuwaiti;
    const matchesNationality = 
      archiveNationalityFilter === 'all' ||
      (archiveNationalityFilter === 'kuwaiti' && isKuwaitiBool) ||
      (archiveNationalityFilter === 'expat' && !isKuwaitiBool);

    return matchesSearch && matchesNationality;
  });

  return (
    <div className="space-y-6 text-right">
      
      {/* Archive Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 shadow-xs">
        
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={archiveSearch}
            onChange={(e) => setArchiveSearch(e.target.value)}
            placeholder="ابحث بالاسم، الرقم المدني، المسمى الوظيفي..."
            className="w-full text-xs font-semibold h-10 pr-9 pl-3 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 rounded-xl focus:border-[#134D41] dark:text-white"
          />
        </div>

        {/* Nationality Filter */}
        <div>
          <select
            value={archiveNationalityFilter}
            onChange={(e) => setArchiveNationalityFilter(e.target.value as any)}
            className="w-full text-xs font-semibold h-10 px-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">عرض كافة الجنسيات المسجلة</option>
            <option value="kuwaiti">عرض المواطنين الكويتيين فقط</option>
            <option value="expat">عرض الوافدين فقط</option>
          </select>
        </div>

      </div>

      {/* Dossier Dossier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 border border-slate-100 rounded-2xl shadow-xs text-slate-400 text-xs">
            لا توجد أي ملفات محفوظة تطابق معايير البحث الحالية.
          </div>
        ) : (
          filtered.map((emp) => (
            <div 
              key={emp.id} 
              className="bg-white dark:bg-slate-800 border border-slate-200/60 hover:border-amber-500/30 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              {/* Card top banner */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg">
                    <FolderOpen className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-[10px] font-black text-slate-400">ID: {emp.id}</span>
                </div>
                
                <span className="text-[10px] font-bold text-[#134D41] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/10">
                  {emp.isKuwaiti ? 'مواطن كويتي 🇰🇼' : 'وافد'}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3.5 flex-grow">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{emp.employeeName || 'موظف غير مسمى'}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{emp.jobTitle || 'المسمى الوظيفي غير محدد'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                    <span className="text-[9px] text-slate-400 font-sans block">الراتب الشامل:</span>
                    <strong className="text-slate-900 dark:text-white">{(emp.basicSalary + emp.allowableAllowance).toFixed(3)} د.ك</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1a202c] p-2 rounded-lg">
                    <span className="text-[9px] text-slate-400 font-sans block">صافي التصفية:</span>
                    <strong className="text-[#134D41] dark:text-emerald-400 font-black">
                      {(emp.computations?.netPayout || 0).toFixed(3)} د.ك
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 font-sans font-bold">
                  <span>من: {emp.joiningDate}</span>
                  <span>إلى: {emp.exitDate}</span>
                </div>
              </div>

              {/* Card Footer Triggers */}
              <div className="bg-slate-50/50 dark:bg-slate-900/20 p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectEmployee(emp.id)}
                  className="flex-grow flex items-center justify-center gap-1 bg-[#134D41] hover:bg-[#0c332b] text-white text-[11px] font-black h-8 rounded-lg cursor-pointer transition-colors"
                >
                  <span>استدعاء الملف</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف هذا الملف نهائياً؟')) {
                      onDeleteEmployee(emp.id);
                    }
                  }}
                  className="p-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                  title="حذف الملف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
