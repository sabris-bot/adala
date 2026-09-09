import React, { useState } from 'react';
import { ShieldCheck, Search, Trash2, Clock, CheckCircle } from 'lucide-react';
import { RedesignedAuditLogEntry } from './types';

interface EosAuditLoggerProps {
  logs: RedesignedAuditLogEntry[];
  onClearLogs: () => void;
}

export const EosAuditLogger: React.FC<EosAuditLoggerProps> = ({ logs, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.timestamp.includes(searchQuery)
  );

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">سجل تدقيق ومراقبة العمليات الحسابية (Audit Log)</h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">يسجل هذا الجدول تلقائياً أي تغيير في معطيات المخالصة المالية لضمان الشفافية وموثوقية السجلات.</p>
        </div>
        
        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من تصفير سجل التدقيق بالكامل؟')) {
                onClearLogs();
              }
            }}
            className="text-[10px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>تفريغ السجل</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن عملية أو تعديل محدد..."
          className="w-full text-xs font-semibold h-9 pr-9 pl-3 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 rounded-lg outline-none focus:border-[#134D41] dark:text-white"
        />
      </div>

      {/* Logs List */}
      <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            لا توجد أي تعديلات أو عمليات مسجلة تطابق بحثك حالياً.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-3 text-xs flex items-start gap-3 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
              <span className="p-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">{log.details}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
