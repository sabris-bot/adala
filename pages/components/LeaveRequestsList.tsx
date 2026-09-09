import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Search, Eye, Edit, Trash2, Check, X, FileText, 
  PlusCircle, Filter, HelpCircle, ShieldAlert, Download,
  Printer, CheckCircle, Clock, AlertCircle, FileCheck,
  Calendar, User, ArrowUpDown
} from 'lucide-react';
import { DetailedLeaveRequest } from '../LeaveManagementPage';
import { LeaveTypeKuwait } from '../../types';

interface LeaveRequestsListProps {
  lang: 'ar' | 'en';
  requests: DetailedLeaveRequest[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterDept: string;
  setFilterDept: (val: string) => void;
  onViewRequest: (request: DetailedLeaveRequest) => void;
  onEditRequest: (request: DetailedLeaveRequest) => void;
  onDeleteRequest: (requestId: string) => void;
  onUpdateStatus: (requestId: string, status: any) => void;
  onAddRequestTrigger: () => void;
  getDeptLabel: (deptKey?: string) => string;
}

export const LeaveRequestsList: React.FC<LeaveRequestsListProps> = ({
  lang,
  requests,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterDept,
  setFilterDept,
  onViewRequest,
  onEditRequest,
  onDeleteRequest,
  onUpdateStatus,
  onAddRequestTrigger,
  getDeptLabel
}) => {
  const isAr = lang === 'ar';
  const [sortField, setSortField] = useState<'requestNumber' | 'startDate' | 'employeeName' | 'numberOfDays'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Status Badge styling helper
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: any }> = {
      'Pending': { 
        label: isAr ? 'بانتظار موافقة الإدارة' : 'Pending Review', 
        cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        icon: Clock
      },
      'UnderReview': { 
        label: isAr ? 'قيد التدقيق القانوني' : 'Under Legal Review', 
        cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
        icon: ShieldAlert
      },
      'AwaitingEmployeeDocuments': { 
        label: isAr ? 'بانتظار المستندات' : 'Awaiting Docs', 
        cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
        icon: AlertCircle
      },
      'Approved': { 
        label: isAr ? 'معتمد رسمياً' : 'Approved & Active', 
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        icon: CheckCircle
      },
      'Rejected': { 
        label: isAr ? 'مرفوض إدارياً' : 'Rejected', 
        cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
        icon: X
      },
      'Completed': { 
        label: isAr ? 'مباشر العمل' : 'Completed', 
        cls: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700',
        icon: FileCheck
      }
    };

    const current = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
    const IconComponent = current.icon;

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1.5 ${current.cls}`}>
        <IconComponent className="w-3 h-3 shrink-0" />
        {current.label}
      </span>
    );
  };

  // Filter requests locally
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.requestNumber && req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.civilId && req.civilId.includes(searchTerm));
    
    const matchesType = filterType === 'All' || req.leaveType === filterType;
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    const matchesDept = filterDept === 'All' || req.department === filterDept;

    return matchesSearch && matchesType && matchesStatus && matchesDept;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'startDate') {
      comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (sortField === 'numberOfDays') {
      comparison = a.numberOfDays - b.numberOfDays;
    } else if (sortField === 'employeeName') {
      comparison = a.employeeName.localeCompare(b.employeeName);
    } else {
      comparison = (a.requestNumber || '').localeCompare(b.requestNumber || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = [
      isAr ? 'رقم الطلب' : 'Request No',
      isAr ? 'اسم الموظف' : 'Employee Name',
      isAr ? 'الرقم المدني' : 'Civil ID',
      isAr ? 'القسم' : 'Department',
      isAr ? 'نوع الإجازة' : 'Leave Type',
      isAr ? 'تاريخ البدء' : 'Start Date',
      isAr ? 'تاريخ الانتهاء' : 'End Date',
      isAr ? 'عدد الأيام' : 'Days',
      isAr ? 'نوع الأجر' : 'Paid Status',
      isAr ? 'الحالة' : 'Status',
      isAr ? 'الموظف البديل' : 'Substitute'
    ];

    const rows = filteredRequests.map(r => [
      r.requestNumber || r.id,
      r.employeeName,
      r.civilId || '',
      getDeptLabel(r.department),
      r.leaveType,
      r.startDate,
      r.endDate,
      r.numberOfDays,
      r.isPaidLeave ? (isAr ? 'مدفوعة' : 'Paid') : (isAr ? 'بدون راتب' : 'Unpaid'),
      r.status,
      r.substituteEmployeeName || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adala_leave_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Action & Toolbar Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Quick Statistics Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">
              {isAr ? 'سجل كشوف وطلبات الإجازات' : 'Leave Requests Registry'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isAr ? `إجمالي السجلات: ${filteredRequests.length} طلب إجازة` : `Total Records: ${filteredRequests.length} applications`}
            </p>
          </div>
        </div>

        {/* Right: Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            {isAr ? 'تصدير الكشوف (CSV)' : 'Export CSV'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            {isAr ? 'طباعة السجل' : 'Print Table'}
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            className="text-xs font-bold"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={onAddRequestTrigger}
          >
            {isAr ? 'تقديم طلب إجازة رسمي' : 'Submit Leave Request'}
          </Button>
        </div>

      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'ابحث باسم الموظف أو الرقم المدني أو الطلب...' : 'Search by name, civil ID, or ID...'}
              className="w-full pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary text-right"
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Filter by Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:ring-1 focus:ring-primary text-right font-medium text-slate-700 dark:text-gray-200"
            >
              <option value="All">{isAr ? '📋 كافة أنواع الإجازات' : 'All Leave Types'}</option>
              {Object.values(LeaveTypeKuwait).map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:ring-1 focus:ring-primary text-right font-medium text-slate-700 dark:text-gray-200"
            >
              <option value="All">{isAr ? '⚖️ كل الحالات الإدارية' : 'All Statuses'}</option>
              <option value="Pending">{isAr ? 'بانتظار موافقة الإدارة' : 'Pending'}</option>
              <option value="UnderReview">{isAr ? 'قيد التدقيق القانوني' : 'Under Review'}</option>
              <option value="AwaitingEmployeeDocuments">{isAr ? 'بانتظار المستندات' : 'Awaiting Docs'}</option>
              <option value="Approved">{isAr ? 'معتمد رسمياً' : 'Approved'}</option>
              <option value="Rejected">{isAr ? 'مرفوض إدارياً' : 'Rejected'}</option>
              <option value="Completed">{isAr ? 'مباشر العمل' : 'Completed'}</option>
            </select>
          </div>

          {/* Filter by Department */}
          <div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950 focus:ring-1 focus:ring-primary text-right font-medium text-slate-700 dark:text-gray-200"
            >
              <option value="All">{isAr ? '🏢 كل الأقسام والإدارات' : 'All Departments'}</option>
              <option value="Consultation">{isAr ? 'قسم الاستشارات والعقود' : 'Consultation'}</option>
              <option value="Litigation">{isAr ? 'قسم التقاضي والمحاكم' : 'Litigation'}</option>
              <option value="Corporate">{isAr ? 'قسم الشركات والتجاري' : 'Corporate'}</option>
              <option value="Admin">{isAr ? 'الشؤون الإدارية العامة' : 'General Admin'}</option>
              <option value="Finance">{isAr ? 'الإدارة المالية' : 'Finance'}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Hydraulic Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs" dir="rtl">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="p-3 font-bold text-right">{isAr ? 'رقم السند' : 'Request No'}</th>
                <th className="p-3 font-bold text-right">{isAr ? 'الموظف المعني' : 'Employee'}</th>
                <th className="p-3 font-bold text-right">{isAr ? 'نوع الإجازة' : 'Leave Type'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'الفترة' : 'Dates'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'الأيام' : 'Days'}</th>
                <th className="p-3 font-bold text-right">{isAr ? 'الزميل البديل' : 'Handover'}</th>
                <th className="p-3 font-bold text-right">{isAr ? 'الأجر' : 'Wage'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'الحالة الإدارية' : 'Status'}</th>
                <th className="p-3 font-bold text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  
                  {/* Request Number */}
                  <td className="p-3 font-mono font-bold text-slate-500 text-right">
                    {req.requestNumber || req.id.slice(0, 8)}
                  </td>

                  {/* Employee Info */}
                  <td className="p-3 text-right">
                    <div className="font-bold text-slate-850 dark:text-white">{req.employeeName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {req.jobTitle || 'محام'} • {getDeptLabel(req.department)}
                    </div>
                  </td>

                  {/* Leave Type */}
                  <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 font-semibold">
                      {req.leaveType}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="p-3 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    <div>{req.startDate}</div>
                    <div className="text-[10px] text-slate-400">إلى {req.endDate}</div>
                  </td>

                  {/* Number of Days */}
                  <td className="p-3 text-center font-black text-slate-850 dark:text-white">
                    {req.numberOfDays} <span className="text-[10px] font-normal text-slate-400">{isAr ? 'يوم' : 'd'}</span>
                  </td>

                  {/* Substitute */}
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400 text-[11px]">
                    {req.substituteEmployeeName || (isAr ? 'لم يُحدد' : 'None')}
                  </td>

                  {/* Paid / Unpaid */}
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      req.isPaidLeave 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                    }`}>
                      {req.isPaidLeave ? (isAr ? 'مدفوعة الأجر' : 'Paid') : (isAr ? 'بدون راتب' : 'Unpaid')}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    {getStatusBadge(req.status)}
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      
                      {/* View Dossier */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 text-[11px] h-7 font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                        onClick={() => onViewRequest(req)}
                      >
                        {isAr ? 'الملف' : 'View'}
                      </Button>

                      {/* Quick Approval / Actions if Pending */}
                      {req.status === 'Pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-1.5 py-1 text-[11px] h-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title={isAr ? 'اعتماد الإجازة فورياً' : 'Quick Approve'}
                          onClick={() => onUpdateStatus(req.id, 'Approved')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-1.5 py-1 text-[11px] h-7 text-slate-500 hover:text-slate-800"
                        title={isAr ? 'تعديل السند' : 'Edit'}
                        onClick={() => onEditRequest(req)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-1.5 py-1 text-[11px] h-7 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title={isAr ? 'حذف السند' : 'Delete'}
                        onClick={() => {
                          if (confirm(isAr ? 'هل أنت متأكد من حذف هذا السجل الإداري نهائياً؟' : 'Are you sure you want to delete this record?')) {
                            onDeleteRequest(req.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>

                    </div>
                  </td>

                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-slate-400 dark:text-slate-500">
                    {isAr ? 'لا توجد سجلات مطابقة لمعايير الفرز والبحث الحالية.' : 'No matching records found in database.'}
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

