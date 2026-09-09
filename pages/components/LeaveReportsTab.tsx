import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FileSpreadsheet, Printer, Download, TrendingUp, 
  CheckCircle, AlertTriangle, ShieldCheck, PieChartIcon 
} from 'lucide-react';
import { DetailedLeaveRequest } from '../LeaveManagementPage';
import { LeaveTypeKuwait } from '../../types';

interface LeaveReportsTabProps {
  lang: 'ar' | 'en';
  requests: DetailedLeaveRequest[];
  employeesList: any[];
  getDeptLabel: (deptKey?: string) => string;
  onPrintReport: () => void;
}

export const LeaveReportsTab: React.FC<LeaveReportsTabProps> = ({
  lang,
  requests,
  employeesList,
  getDeptLabel,
  onPrintReport
}) => {
  const isAr = lang === 'ar';

  const [reportYear, setReportYear] = useState<string>('2026');
  const [reportDept, setReportDept] = useState<string>('All');

  // Filter requests according to Year and Department
  const filteredReportRequests = useMemo(() => {
    return requests.filter(r => {
      const yearMatches = r.startDate.startsWith(reportYear);
      const deptMatches = reportDept === 'All' || r.department === reportDept;
      return yearMatches && deptMatches;
    });
  }, [requests, reportYear, reportDept]);

  // Report Metrics Summaries
  const statsSummary = useMemo(() => {
    let totalAnnual = 0;
    let totalSick = 0;
    let totalEmergency = 0;
    let totalUnpaid = 0;
    let totalMaternity = 0;
    let totalHajj = 0;

    filteredReportRequests.forEach(r => {
      if (r.status === 'Approved' || r.status === 'Completed') {
        if (r.leaveType === LeaveTypeKuwait.ANNUAL) totalAnnual += r.numberOfDays;
        else if (r.leaveType === LeaveTypeKuwait.SICK) totalSick += r.numberOfDays;
        else if (r.leaveType === LeaveTypeKuwait.EMERGENCY) totalEmergency += r.numberOfDays;
        else if (r.leaveType === LeaveTypeKuwait.UNPAID) totalUnpaid += r.numberOfDays;
        else if (r.leaveType === LeaveTypeKuwait.MATERNITY) totalMaternity += r.numberOfDays;
        else if (r.leaveType === LeaveTypeKuwait.HAJJ) totalHajj += r.numberOfDays;
      }
    });

    const grandTotal = totalAnnual + totalSick + totalEmergency + totalUnpaid + totalMaternity + totalHajj;

    return {
      totalAnnual,
      totalSick,
      totalEmergency,
      totalUnpaid,
      totalMaternity,
      totalHajj,
      grandTotal
    };
  }, [filteredReportRequests]);

  // Chart data for department distribution
  const deptDistData = useMemo(() => {
    const depts = ['Consultation', 'Litigation', 'Corporate', 'Admin', 'Finance'];
    return depts.map(d => {
      const days = requests
        .filter(r => r.department === d && (r.status === 'Approved' || r.status === 'Completed'))
        .reduce((sum, r) => sum + r.numberOfDays, 0);
      return {
        name: getDeptLabel(d),
        [isAr ? 'أيام الإجازات' : 'Leave Days']: days
      };
    });
  }, [requests, isAr, getDeptLabel]);

  // Pie chart types distribution
  const pieData = useMemo(() => {
    return [
      { name: isAr ? 'سنوية' : 'Annual', value: statsSummary.totalAnnual, color: '#00796B' },
      { name: isAr ? 'مرضية' : 'Sick', value: statsSummary.totalSick, color: '#EF4444' },
      { name: isAr ? 'اضطرارية' : 'Emergency', value: statsSummary.totalEmergency, color: '#F59E0B' },
      { name: isAr ? 'مستثناة وبدون راتب' : 'Unpaid', value: statsSummary.totalUnpaid, color: '#6B7280' },
      { name: isAr ? 'حج' : 'Hajj', value: statsSummary.totalHajj, color: '#8B5CF6' }
    ].filter(item => item.value > 0);
  }, [statsSummary, isAr]);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Control panel for reports parameters */}
      <Card title={isAr ? 'محددات التقرير السنوي الكويتي' : 'Statutory Report Configuration'}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-right">
          
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500">{isAr ? 'الدورة المالية / السنة المالية' : 'Fiscal Year'}</label>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-bold"
            >
              <option value="2026">2026 (السنة الجارية)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500">{isAr ? 'القسم والشعبة الفنية' : 'Department Assignment'}</label>
            <select
              value={reportDept}
              onChange={(e) => setReportDept(e.target.value)}
              className="w-full p-2 border border-slate-200 dark:border-slate-750 rounded-xl text-xs bg-neutral-card dark:bg-dm-card font-semibold"
            >
              <option value="All">{isAr ? 'كل الأقسام والإدارات' : 'All Departments'}</option>
              <option value="Consultation">{isAr ? 'قسم الاستشارات والعقود' : 'Consultation'}</option>
              <option value="Litigation">{isAr ? 'قسم التقاضي والمحاكم' : 'Litigation'}</option>
              <option value="Corporate">{isAr ? 'قسم الشركات والتجاري' : 'Corporate'}</option>
              <option value="Admin">{isAr ? 'الشؤون الإدارية العامة' : 'General Admin'}</option>
              <option value="Finance">{isAr ? 'الإدارة المالية' : 'Finance'}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={onPrintReport}
            >
              {isAr ? 'طباعة الكشف النهائي' : 'Print Report Book'}
            </Button>
          </div>

        </div>
      </Card>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        
        <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 p-4 rounded-2xl text-right">
          <p className="text-[10px] text-gray-400 font-bold">{isAr ? 'إجمالي الأيام الممنوحة' : 'Total Days Out'}</p>
          <p className="text-xl font-black font-mono text-primary mt-1">{statsSummary.grandTotal}</p>
        </div>

        <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 p-4 rounded-2xl text-right">
          <p className="text-[10px] text-gray-400 font-bold">{isAr ? 'السنوية الكلية' : 'Annual'}</p>
          <p className="text-xl font-black font-mono text-slate-800 dark:text-white mt-1">{statsSummary.totalAnnual}</p>
        </div>

        <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 p-4 rounded-2xl text-right">
          <p className="text-[10px] text-gray-400 font-bold">{isAr ? 'المرضية المسجلة' : 'Sick'}</p>
          <p className="text-xl font-black font-mono text-rose-600 mt-1">{statsSummary.totalSick}</p>
        </div>

        <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 p-4 rounded-2xl text-right">
          <p className="text-[10px] text-gray-400 font-bold">{isAr ? 'الإجازة الاضطرارية' : 'Emergency'}</p>
          <p className="text-xl font-black font-mono text-amber-600 mt-1">{statsSummary.totalEmergency}</p>
        </div>

        <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 p-4 rounded-2xl text-right">
          <p className="text-[10px] text-gray-400 font-bold">{isAr ? 'تصفية بدون راتب' : 'Unpaid'}</p>
          <p className="text-xl font-black font-mono text-slate-500 mt-1">{statsSummary.totalUnpaid}</p>
        </div>

        <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 p-4 rounded-2xl text-right">
          <p className="text-[10px] text-gray-400 font-bold">{isAr ? 'فريضة الحج' : 'Hajj'}</p>
          <p className="text-xl font-black font-mono text-indigo-600 mt-1">{statsSummary.totalHajj}</p>
        </div>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Department distribution */}
        <Card title={isAr ? 'توزيع أيام الغياب والإجازات بالأقسام' : 'Distribution of Leave Days by Department'}>
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={10} stroke="#888888" tickLine={false} />
                <YAxis fontSize={10} stroke="#888888" tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey={isAr ? 'أيام الإجازات' : 'Leave Days'} fill="#00796B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Leaves Type share pie */}
        <Card title={isAr ? 'التمثيل النسبي لمسببات وأنواع الإجازات' : 'Proportional Share of Leave Types'}>
          <div className="h-64 w-full mt-2 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ${isAr ? 'يوم' : 'Days'}`, '']} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400">{isAr ? 'لا توجد بيانات تمثيلية مناسبة' : 'No representation data available'}</p>
            )}
          </div>
        </Card>

      </div>

      {/* Dynamic Report Table Ledger */}
      <Card title={isAr ? 'المطابقة الحسابية للدفتر والامتثال' : 'Statutory Compliance Ledger Ledger'}>
        <div className="overflow-x-auto" id="printable-report-area">
          <table className="w-full text-right border-collapse text-xs" dir="rtl">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-gray-200">
                <th className="p-3 text-gray-500 font-black text-right">{isAr ? 'رقم الطلب' : 'Request Number'}</th>
                <th className="p-3 text-gray-500 font-black text-right">{isAr ? 'الموظف' : 'Employee Name'}</th>
                <th className="p-3 text-gray-500 font-black text-right">{isAr ? 'نوع الإجازة' : 'Leave Type'}</th>
                <th className="p-3 text-gray-500 font-black text-right">{isAr ? 'الفترة' : 'Period'}</th>
                <th className="p-3 text-gray-500 font-black text-center">{isAr ? 'الأيام' : 'Days'}</th>
                <th className="p-3 text-gray-500 font-black text-right">{isAr ? 'حالة التصفية' : 'Payroll Impact'}</th>
                <th className="p-3 text-gray-500 font-black text-right">{isAr ? 'تأشيرة مراجع الشؤون' : 'Auditing'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReportRequests.map(r => (
                <tr key={r.id} className="border-b border-gray-150 dark:border-slate-800 hover:bg-slate-50/50">
                  <td className="p-3 font-mono text-gray-400 font-bold">{r.requestNumber}</td>
                  <td className="p-3 font-bold text-slate-850 dark:text-gray-150">{r.employeeName}</td>
                  <td className="p-3 font-bold text-[#00796B]">{r.leaveType}</td>
                  <td className="p-3 font-mono text-gray-500">{r.startDate} • {r.endDate}</td>
                  <td className="p-3 text-center font-bold text-rose-600">{r.numberOfDays} {isAr ? 'ي' : 'd'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.isPaidLeave ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {r.isPaidLeave ? (isAr ? 'مدفوعة الأجر' : 'Fully Paid') : (isAr ? 'خصم مالي' : 'Unpaid')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-full border border-indigo-200">
                      ✓ {isAr ? 'مطابق ومرحل للحسابات' : 'Validated & Posted'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredReportRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">
                    {isAr ? 'لا توجد أي إجازات مسجلة لدورة الفرز الحالية' : 'No leave logs matching current period criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
