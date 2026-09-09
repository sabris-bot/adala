import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  CalendarDays, ChevronLeft, ChevronRight, PlusCircle, 
  ListTodo, Info, CheckCircle2, AlertCircle, AlertTriangle,
  Users, Filter, Sparkles
} from 'lucide-react';
import { DetailedLeaveRequest } from '../LeaveManagementPage';
import { LeaveTypeKuwait } from '../../types';

interface LeaveCalendarTabProps {
  lang: 'ar' | 'en';
  requests: DetailedLeaveRequest[];
  onAddRequestTrigger: () => void;
  onViewRequest: (request: DetailedLeaveRequest) => void;
  setFastAddDate: (startDate: string, endDate: string) => void;
}

export const LeaveCalendarTab: React.FC<LeaveCalendarTabProps> = ({
  lang,
  requests,
  onAddRequestTrigger,
  onViewRequest,
  setFastAddDate
}) => {
  const isAr = lang === 'ar';

  // State for selected Year & Month
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [calDeptFilter, setCalDeptFilter] = useState('All');

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthName = isAr ? monthNamesAr[currentMonth] : monthNamesEn[currentMonth];

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filter requests by dept if selected
  const filteredRequestsByDept = useMemo(() => {
    if (calDeptFilter === 'All') return requests;
    return requests.filter(r => r.department === calDeptFilter);
  }, [requests, calDeptFilter]);

  // Generate days in month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: { dayNum?: number; dateStr?: string }[] = [];

    // Padding for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({});
    }

    // Actual days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      cells.push({
        dayNum: d,
        dateStr
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Filters leaves matching this month
  const visibleMonthRequests = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return filteredRequestsByDept.filter(r => {
      return r.startDate.startsWith(monthPrefix) || r.endDate.startsWith(monthPrefix);
    });
  }, [filteredRequestsByDept, currentYear, currentMonth]);

  // Conflict detection: Dates where 2 or more employees are on leave
  const conflictDates = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRequestsByDept.forEach(req => {
      if (req.status === 'Approved' || req.status === 'Pending') {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          counts[dateStr] = (counts[dateStr] || 0) + 1;
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return counts;
  }, [filteredRequestsByDept]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Calendar Grid Section (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Calendar Header Card */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">
                {isAr ? `أجندة الإجازات: ${currentMonthName} ${currentYear}` : `Leave Calendar: ${currentMonthName} ${currentYear}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'خريطة الحضور ومؤشرات تعارض إجازات الكوادر' : 'Staff attendance & conflict mapping'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={calDeptFilter}
              onChange={(e) => setCalDeptFilter(e.target.value)}
              className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="All">{isAr ? 'كل الأقسام' : 'All Departments'}</option>
              <option value="Consultation">{isAr ? 'الاستشارات' : 'Consultation'}</option>
              <option value="Litigation">{isAr ? 'التقاضي' : 'Litigation'}</option>
              <option value="Corporate">{isAr ? 'الشركات' : 'Corporate'}</option>
              <option value="Admin">{isAr ? 'الإدارية' : 'Admin'}</option>
            </select>

            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handlePrevMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleNextMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Days Grid Box */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-slate-400 text-[10px] mb-2 uppercase tracking-wider">
            <span>{isAr ? 'الأحد' : 'Sun'}</span>
            <span>{isAr ? 'الاثنين' : 'Mon'}</span>
            <span>{isAr ? 'الثلاثاء' : 'Tue'}</span>
            <span>{isAr ? 'الأربعاء' : 'Wed'}</span>
            <span>{isAr ? 'الخميس' : 'Thu'}</span>
            <span>{isAr ? 'الجمعة' : 'Fri'}</span>
            <span>{isAr ? 'السبت' : 'Sat'}</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const hasDate = !!cell.dateStr;
              
              // Find leaves covering this cell
              const leavesOnDay = hasDate
                ? filteredRequestsByDept.filter(r => r.startDate <= cell.dateStr! && r.endDate >= cell.dateStr!)
                : [];

              const approvedLeaves = leavesOnDay.filter(r => r.status === 'Approved' || r.status === 'Completed');
              const upcomingLeaves = leavesOnDay.filter(r => r.status === 'Pending' || r.status === 'UnderReview' || r.status === 'AwaitingEmployeeDocuments');

              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
              const isConflict = hasDate && (conflictDates[cell.dateStr!] || 0) >= 2;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasDate) {
                      setFastAddDate(cell.dateStr!, cell.dateStr!);
                    }
                  }}
                  className={`p-2 border rounded-xl min-h-[85px] flex flex-col justify-between transition-all group relative ${
                    hasDate 
                      ? isConflict
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 cursor-pointer hover:border-amber-400'
                        : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-teal-500/50 cursor-pointer' 
                      : 'bg-transparent border-dashed border-slate-100 dark:border-slate-900/10 opacity-20 pointer-events-none'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${
                      isToday
                        ? 'bg-teal-700 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {cell.dayNum}
                    </span>

                    {isConflict && (
                      <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5" title={isAr ? 'تنبيه: أكثر من موظف في إجازة بنفس اليوم' : 'Conflict warning'}>
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}

                    {hasDate && !isConflict && (
                      <span className="opacity-0 group-hover:opacity-100 text-[8px] bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-1 rounded font-bold transition-opacity">
                        +{isAr ? 'جدولة' : 'Add'}
                      </span>
                    )}
                  </div>

                  {/* Overlapped Leaves stack */}
                  <div className="space-y-1 mt-auto overflow-y-auto scrollbar-none max-h-[50px]">
                    {approvedLeaves.map(vac => (
                      <div
                        key={vac.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequest(vac);
                        }}
                        title={`${vac.employeeName} - ${vac.leaveType} (${vac.numberOfDays}ي)`}
                        className="text-[8px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-r-2 border-emerald-500 px-1 py-0.5 rounded truncate font-bold hover:brightness-95 transition text-right flex items-center justify-between gap-0.5"
                      >
                        <span className="truncate">{vac.employeeName.split(' ')[0]}</span>
                        <span className="text-[7px]">✓</span>
                      </div>
                    ))}

                    {upcomingLeaves.map(vac => (
                      <div
                        key={vac.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequest(vac);
                        }}
                        title={`${vac.employeeName} - ${vac.leaveType} (${vac.numberOfDays}ي) [معلق]`}
                        className="text-[8px] bg-amber-50 text-amber-850 dark:bg-amber-950/40 dark:text-amber-300 border-r-2 border-amber-500 px-1 py-0.5 rounded truncate font-bold hover:brightness-95 transition text-right flex items-center justify-between gap-0.5"
                      >
                        <span className="truncate">{vac.employeeName.split(' ')[0]}</span>
                        <span className="text-[7px]">⏳</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map indicators */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>{isAr ? 'إجازة معتمدة نافذة' : 'Approved Leave'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span>{isAr ? 'إجازة معلقة قيد المراجعة' : 'Pending Review'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-400 rounded-full border border-amber-600"></span>
              <span>{isAr ? 'يوم به تداخل/تعارض' : 'Conflict day (≥2 staff)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-teal-700 rounded-full"></span>
              <span>{isAr ? 'اليوم الحالي' : 'Today'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Monthly Agenda Sidebar (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Quick Scheduler card */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow border border-teal-900/40">
          <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-amber-300" />
            {isAr ? 'الجدولة والتخصيص السريع' : 'Fast Schedule'}
          </h4>
          <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
            {isAr 
              ? 'احجز طلب إجازة رسمي مع تفويض مهام العمل للزميل البديل وتحديد نطاق الأجر تلقائياً.' 
              : 'Add leave request with colleague handover delegation.'}
          </p>
          <Button
            variant="accent"
            size="sm"
            className="mt-4 w-full h-9 bg-amber-400 hover:bg-amber-500 text-slate-900 border-none rounded-xl text-xs font-bold shadow-sm"
            onClick={onAddRequestTrigger}
          >
            {isAr ? 'تقديم طلب إجازة جديد ➔' : 'Schedule Leave ➔'}
          </Button>
        </div>

        {/* Month Feed card */}
        <Card title={isAr ? `أجندة شهر ${currentMonthName}` : `Agenda for ${currentMonthName}`}>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
            {visibleMonthRequests.length > 0 ? (
              visibleMonthRequests.map(item => {
                const isApproved = item.status === 'Approved' || item.status === 'Completed';
                return (
                  <div 
                    key={item.id}
                    onClick={() => onViewRequest(item)}
                    className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 text-right space-y-1 hover:border-teal-500/40 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-center gap-1">
                      <strong className="text-xs text-teal-800 dark:text-teal-300 font-extrabold truncate max-w-[130px]">
                        {item.employeeName}
                      </strong>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isApproved 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {isApproved ? (isAr ? 'معتمدة' : 'Approved') : (isAr ? 'مرتقبة' : 'Pending')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{item.leaveType}</span>
                      <span className="font-mono font-semibold">{item.startDate} {isAr ? 'إلى' : 'to'} {item.endDate}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                {isAr ? 'لا توجد طلبات إجازة مسجلة لهذا الشهر' : 'No leaves recorded for this month'}
              </div>
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};

