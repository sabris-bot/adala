import React from 'react';
import { motion } from 'motion/react';
import { ClockIcon, ShieldCheckIcon, LockClosedIcon } from '../../../constants';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  module: string;
  ipAddress: string;
}

interface AuditLogTabProps {
  auditLogs: AuditLogEntry[];
  translate: (ar: string, en: string) => string;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({
  auditLogs,
  translate
}) => {
  return (
    <div className="bg-white dark:bg-dm-card p-6 rounded-[32xl] border border-gray-150/45 dark:border-gray-800 shadow-xs space-y-6">
      
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl">
            <LockClosedIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-dm-text">{translate('سجل رصد ورقابة الأمان والامتثال الحوكمي', 'Immutable Security Audit Logs & Access ledger')}</h4>
            <p className="text-[10px] text-gray-400 font-bold">{translate('سجل تاريخي دائم لكافة العمليات والقرارات والتعديلات وتغيير الأدوار بقاعدة البيانات', 'Real-time record of all operational queries, role switches, exports and administrative commits')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-100/30">
          <ShieldCheckIcon className="w-4.5 h-4.5" />
          <span>{translate('مؤرشف ومشفر كلياً (SHA-256)', 'LEDGER INTEGRITY LOCKED (SHA-256)')}</span>
        </div>
      </div>

      {/* Logs timeline layout */}
      <div className="relative pl-6 space-y-6 border-l-2 border-stone-100 dark:border-gray-850 ml-4 py-2">
        {auditLogs.map((log) => (
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id} 
            className="relative space-y-2 bg-gray-50/50 dark:bg-dm-background p-4 rounded-2xl border border-gray-100/40 dark:border-gray-850"
          >
            {/* Pulsing indicator bullet inside line */}
            <div className="absolute -left-[31px] top-5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-dm-card" />
            
            <div className="flex flex-wrap justify-between items-center text-[10px] font-bold text-gray-400 gap-2">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-mono">{log.timestamp}</span>
              </span>
              <span className="bg-gray-100 dark:bg-dark-border px-2 py-0.5 rounded-md font-mono">{log.ipAddress}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-gray-150/15 pb-2">
              <span className="text-xs font-black text-gray-850 dark:text-white">{log.user}</span>
              <span className="text-[9px] text-gray-400 bg-blue-50 dark:bg-blue-950/35 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-md font-black">{log.role}</span>
              <span className="text-[10px] text-gray-400 font-bold">»</span>
              <span className="text-[10px] text-zinc-900 dark:text-slate-200 font-extrabold">{log.action}</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
              {log.details}
            </p>

            <div className="flex justify-between items-center text-[9px] text-gray-400 font-extrabold pt-1">
              <span>{translate('القسم الإداري:', 'Impact Module:')} <strong className="text-blue-600">{log.module}</strong></span>
              <span className="font-mono text-stone-400">UID: {log.id}</span>
            </div>

          </motion.div>
        ))}
      </div>

    </div>
  );
};
