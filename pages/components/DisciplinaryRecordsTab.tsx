import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, PlusCircle, Printer, Eye, Trash2, Clock, 
    ShieldCheck, Undo2, PenTool, LayoutGrid, List, CheckCircle, 
    AlertCircle, FileText, ChevronRight, Scale, User, Calendar, 
    Download, Shield, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { DisciplinaryRecord, DisciplinaryActionStatus, calculate20DayCountdown } from './DisciplinaryTypes';

interface DisciplinaryRecordsTabProps {
    records: DisciplinaryRecord[];
    selectedRecordId: string;
    onSelectRecord: (id: string) => void;
    onOpenPrintModal: (record: DisciplinaryRecord) => void;
    onOpenWorkbenchForRecord: (recordId: string) => void;
    onOpenNewRecordModal: () => void;
    onOpenAppealModalForRecord: (recordId: string) => void;
    onDeleteRecord: (id: string) => void;
    onQuickStatusChange: (id: string, newStatus: DisciplinaryActionStatus) => void;
}

export const DisciplinaryRecordsTab: React.FC<DisciplinaryRecordsTabProps> = ({
    records,
    selectedRecordId,
    onSelectRecord,
    onOpenPrintModal,
    onOpenWorkbenchForRecord,
    onOpenNewRecordModal,
    onOpenAppealModalForRecord,
    onDeleteRecord,
    onQuickStatusChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Filter logic
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = 
                r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.civilId.includes(searchQuery) ||
                r.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.violationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.employeeDepartment && r.employeeDepartment.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [records, searchQuery, statusFilter]);

    // Active selected record for detailed side dossier
    const activeRecord = useMemo(() => {
        return records.find(r => r.id === selectedRecordId) || filteredRecords[0] || records[0];
    }, [records, selectedRecordId, filteredRecords]);

    return (
        <div className="space-y-6">
            
            {/* Top Toolbar: Search, Filters, View Switcher & New Record Button */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="بحث باسم الموظف، الرقم المدني، رقم القرار، أو تصنيف المخالفة..."
                            className="w-full pr-10 pl-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[#113F36] text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Filter Status Selector */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="text-xs font-bold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">جميع الحالات ({records.length})</option>
                                <option value={DisciplinaryActionStatus.PENDING}>{DisciplinaryActionStatus.PENDING}</option>
                                <option value={DisciplinaryActionStatus.APPROVED}>{DisciplinaryActionStatus.APPROVED}</option>
                                <option value={DisciplinaryActionStatus.APPEALED}>{DisciplinaryActionStatus.APPEALED}</option>
                                <option value={DisciplinaryActionStatus.REDUCED}>{DisciplinaryActionStatus.REDUCED}</option>
                                <option value={DisciplinaryActionStatus.CANCELLED}>{DisciplinaryActionStatus.CANCELLED}</option>
                            </select>
                        </div>

                        {/* View Switcher: Cards vs Table */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('cards')}
                                title="عرض البطاقات الذكية"
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                    viewMode === 'cards' 
                                        ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                title="عرض الجدول المتقدم"
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                    viewMode === 'table' 
                                        ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Record Trigger */}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onOpenNewRecordModal}
                            className="bg-[#113F36] hover:bg-[#0d312a] text-white font-black text-xs h-9 px-4 rounded-xl shadow-xs shrink-0"
                        >
                            <PlusCircle className="w-4 h-4 ml-1.5 text-[#C19A5B]" />
                            إضافة قرار
                        </Button>
                    </div>

                </div>

                {/* Quick Status Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
                    <span className="text-slate-400 ml-1">تصفية سريعة:</span>
                    <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-2.5 py-0.5 rounded-lg transition-all ${
                            statusFilter === 'ALL'
                                ? 'bg-[#0F172A] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        الكل ({records.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter(DisciplinaryActionStatus.APPROVED)}
                        className={`px-2.5 py-0.5 rounded-lg transition-all ${
                            statusFilter === DisciplinaryActionStatus.APPROVED
                                ? 'bg-emerald-700 text-white'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                    >
                        معتمد وساري ({records.filter(r => r.status === DisciplinaryActionStatus.APPROVED).length})
                    </button>
                    <button
                        onClick={() => setStatusFilter(DisciplinaryActionStatus.PENDING)}
                        className={`px-2.5 py-0.5 rounded-lg transition-all ${
                            statusFilter === DisciplinaryActionStatus.PENDING
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                        }`}
                    >
                        قيد التحقيق ({records.filter(r => r.status === DisciplinaryActionStatus.PENDING).length})
                    </button>
                    <button
                        onClick={() => setStatusFilter(DisciplinaryActionStatus.APPEALED)}
                        className={`px-2.5 py-0.5 rounded-lg transition-all ${
                            statusFilter === DisciplinaryActionStatus.APPEALED
                                ? 'bg-purple-700 text-white'
                                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                        }`}
                    >
                        تظلم قائم ({records.filter(r => r.status === DisciplinaryActionStatus.APPEALED).length})
                    </button>
                </div>
            </div>

            {/* Main Content Layout: Records Stream + Dossier Side Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Stream: Cards or Table */}
                <div className="lg:col-span-7 space-y-3">
                    
                    {filteredRecords.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 font-bold text-xs space-y-2">
                            <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                            <p>لا توجد قرارات تأديبية تطابق معايير البحث الحالية.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                                className="text-xs font-bold mt-2"
                            >
                                إعادة تعيين البحث
                            </Button>
                        </div>
                    ) : viewMode === 'cards' ? (
                        
                        /* Smart Cards View */
                        <div className="space-y-3">
                            {filteredRecords.map(record => {
                                const isSelected = record.id === activeRecord?.id;
                                const countdown = calculate20DayCountdown(record.notificationDate, record.appealDeadlineDate);

                                return (
                                    <div
                                        key={record.id}
                                        onClick={() => onSelectRecord(record.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                                            isSelected
                                                ? 'bg-gradient-to-r from-teal-50/90 via-white to-white dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900 border-[#113F36] shadow-md ring-1 ring-[#113F36]/20'
                                                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        {/* Right Status Indicator Bar */}
                                        <div className={`absolute top-0 bottom-0 right-0 w-1.5 ${
                                            record.status === DisciplinaryActionStatus.CANCELLED ? 'bg-emerald-500' :
                                            record.status === DisciplinaryActionStatus.APPEALED ? 'bg-purple-600' :
                                            record.status === DisciplinaryActionStatus.PENDING ? 'bg-amber-500' : 
                                            record.status === DisciplinaryActionStatus.REDUCED ? 'bg-indigo-500' : 'bg-[#113F36]'
                                        }`} />

                                        <div className="pr-3 space-y-3">
                                            
                                            {/* Header Info */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] font-black text-[#113F36] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/40">
                                                            {record.recordNumber}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            تاريخ الإبلاغ: {record.notificationDate}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1 group-hover:text-[#113F36] dark:group-hover:text-teal-400 transition-colors">
                                                        {record.employeeName}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                        {record.employeeJobTitle} • {record.employeeDepartment}
                                                    </p>
                                                </div>

                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                                                    record.status === DisciplinaryActionStatus.CANCELLED ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' :
                                                    record.status === DisciplinaryActionStatus.APPEALED ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300' :
                                                    record.status === DisciplinaryActionStatus.PENDING ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300' :
                                                    record.status === DisciplinaryActionStatus.REDUCED ? 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300' :
                                                    'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/50 dark:text-teal-200'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </div>

                                            {/* Violation & Sanction Strip */}
                                            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs flex justify-between items-center font-bold">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <Scale className="w-3.5 h-3.5 text-[#C19A5B] shrink-0" />
                                                    <span className="text-slate-700 dark:text-slate-300 truncate">{record.violationType}</span>
                                                </div>
                                                <span className="text-[#113F36] dark:text-teal-400 font-black shrink-0">{record.sanctionType}</span>
                                            </div>

                                            {/* 20-Day Legal Countdown Mini Indicator */}
                                            <div className="flex items-center justify-between pt-1 text-[10px] font-bold border-t border-slate-100 dark:border-slate-800">
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-3 h-3 text-[#D97706]" />
                                                    مهلة التظلم (المادة 102):
                                                </span>
                                                <span className={`font-mono font-bold ${
                                                    countdown.statusSeverity === 'urgent' ? 'text-rose-600 font-black animate-pulse' :
                                                    countdown.statusSeverity === 'warning' ? 'text-amber-600 font-black' : 'text-emerald-600'
                                                }`}>
                                                    {countdown.remainingDays > 0 ? `متبقي ${countdown.remainingDays} يوماً` : 'انتهت المهلة'}
                                                </span>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex items-center justify-end gap-1.5 pt-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenPrintModal(record);
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                                >
                                                    <Printer className="w-3 h-3 text-[#C19A5B]" />
                                                    <span>طباعة</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenWorkbenchForRecord(record.id);
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/50 flex items-center gap-1"
                                                >
                                                    <PenTool className="w-3 h-3" />
                                                    <span>محضر التحقيق</span>
                                                </button>
                                                {record.status !== DisciplinaryActionStatus.APPEALED && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenAppealModalForRecord(record.id);
                                                        }}
                                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 flex items-center gap-1"
                                                    >
                                                        <Undo2 className="w-3 h-3" />
                                                        <span>تظلم</span>
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        
                        /* Advanced Data Table View */
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-3">رقم القرار</th>
                                            <th className="p-3">الموظف والقسم</th>
                                            <th className="p-3">نوع المخالفة</th>
                                            <th className="p-3">العقوبة</th>
                                            <th className="p-3">الحالة</th>
                                            <th className="p-3 text-left">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                                        {filteredRecords.map(record => (
                                            <tr
                                                key={record.id}
                                                onClick={() => onSelectRecord(record.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    record.id === activeRecord?.id
                                                        ? 'bg-teal-50/80 dark:bg-teal-950/30'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                }`}
                                            >
                                                <td className="p-3 font-mono font-bold text-[#113F36] dark:text-teal-400">
                                                    {record.recordNumber}
                                                </td>
                                                <td className="p-3">
                                                    <strong className="block text-slate-900 dark:text-white">{record.employeeName}</strong>
                                                    <span className="text-[10px] text-slate-400">{record.employeeDepartment}</span>
                                                </td>
                                                <td className="p-3 text-[11px]">
                                                    {record.violationType}
                                                </td>
                                                <td className="p-3 font-bold text-[#113F36] dark:text-teal-300">
                                                    {record.sanctionType}
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-slate-100 dark:bg-slate-800">
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-left" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => onOpenPrintModal(record)}
                                                            className="p-1 rounded text-slate-500 hover:text-[#113F36]"
                                                            title="طباعة"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => onOpenWorkbenchForRecord(record.id)}
                                                            className="p-1 rounded text-slate-500 hover:text-teal-600"
                                                            title="محضر التحقيق"
                                                        >
                                                            <PenTool className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Dossier Panel: Selected Record Detailed View */}
                <div className="lg:col-span-5">
                    {activeRecord ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 sticky top-6 shadow-xs">
                            
                            {/* Dossier Header */}
                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                    <span className="font-mono text-[10px] font-black text-[#113F36] dark:text-teal-400 block">
                                        {activeRecord.recordNumber}
                                    </span>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                                        ملف القرار التأديبي المعتمد
                                    </h2>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-bold text-xs border-[#113F36] text-[#113F36] dark:text-teal-300 hover:bg-teal-50"
                                        onClick={() => onOpenPrintModal(activeRecord)}
                                    >
                                        <Printer className="w-3.5 h-3.5 ml-1 text-[#C19A5B]" />
                                        طباعة القرار
                                    </Button>
                                    <button
                                        onClick={() => onDeleteRecord(activeRecord.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                        title="حذف السجل"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* 20-Day Legal Countdown Box */}
                            {(() => {
                                const cd = calculate20DayCountdown(activeRecord.notificationDate, activeRecord.appealDeadlineDate);
                                return (
                                    <div className={`p-4 rounded-xl border space-y-2 ${
                                        cd.statusSeverity === 'urgent' ? 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200' :
                                        cd.statusSeverity === 'warning' ? 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200' :
                                        'bg-teal-50/70 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:text-teal-200'
                                    }`}>
                                        <div className="flex justify-between items-center text-xs font-black">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-[#D97706]" />
                                                العداد القانوني لمهلة التظلم (20 يوماً):
                                            </span>
                                            <span className="font-mono">{cd.remainingDays} / 20 يوماً</span>
                                        </div>

                                        <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${
                                                    cd.statusSeverity === 'urgent' ? 'bg-rose-600' :
                                                    cd.statusSeverity === 'warning' ? 'bg-amber-600' : 'bg-emerald-600'
                                                }`}
                                                style={{ width: `${cd.progressPercent}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span>تاريخ الإبلاغ: {activeRecord.notificationDate}</span>
                                            <span>الموعد النهائي: {cd.deadlineFormatted}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Employee Information */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>اسم الموظف:</span>
                                    <strong className="text-slate-900 dark:text-white">{activeRecord.employeeName}</strong>
                                </div>
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>الرقم المدني:</span>
                                    <span className="font-mono">{activeRecord.civilId}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>الوظيفة والقسم:</span>
                                    <span>{activeRecord.employeeJobTitle} ({activeRecord.employeeDepartment})</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>رقم محضر التحقيق:</span>
                                    <span className="font-mono text-teal-700 dark:text-teal-400">{activeRecord.relatedInvestigationNo || 'قيد القيد'}</span>
                                </div>
                            </div>

                            {/* Sanction & Grounds */}
                            <div className="space-y-1.5 text-xs">
                                <span className="font-bold text-slate-500 block">العقوبة المعتمدة قانوناً (المادة 102):</span>
                                <div className="p-3 bg-[#113F36]/10 text-[#113F36] dark:text-teal-300 font-black rounded-xl border border-[#113F36]/20 text-sm">
                                    {activeRecord.sanctionType}
                                </div>
                            </div>

                            {/* Violation Details */}
                            <div className="space-y-1.5 text-xs leading-relaxed">
                                <span className="font-bold text-slate-500 block">حيثيات ومفردات المخالفة:</span>
                                <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-800">
                                    {activeRecord.details}
                                </p>
                            </div>

                            {/* Evidence & Hearing Notes */}
                            {activeRecord.evidenceNotes && (
                                <div className="space-y-1 text-xs">
                                    <span className="font-bold text-slate-500 block">القرائن والأدلة المرفقة:</span>
                                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 rounded-xl text-amber-900 dark:text-amber-200 font-medium">
                                        {activeRecord.evidenceNotes}
                                    </div>
                                </div>
                            )}

                            {/* Investigation Status Strip */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-500">ضمانات المادة 35:</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                    <CheckCircle className="w-3 h-3" /> تم التحقيق وتدوين الدفاع
                                </span>
                            </div>

                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl text-center text-slate-400 text-xs font-bold">
                            اختر قراراً من القائمة لمعاينة ملفه الكامل
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};
