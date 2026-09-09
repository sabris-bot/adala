import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from './ui/Button';

export interface DocketActivityLogItem {
  id: string;
  timestamp: string;
  hearingId: string;
  caseTitle: string;
  oldStatus: string;
  newStatus: string;
  actionType: 'status_change' | 'reorder' | 'ai_filled';
  performedBy?: string;
}

interface DocketActivityLogProps {
  logs: DocketActivityLogItem[];
  onUndoLast: () => void;
  onUndoSpecific: (logId: string) => void;
  onClearLogs: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">🟢 جاهز للمرافعة</span>;
    case 'Postponed':
      return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">🟡 مؤجلة</span>;
    case 'Completed':
      return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">🔵 تم الحضور</span>;
    default:
      return <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-bold">{status}</span>;
  }
};

export const DocketActivityLog: React.FC<DocketActivityLogProps> = ({
  logs,
  onUndoLast,
  onUndoSpecific,
  onClearLogs
}) => {
  const canUndo = logs.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
            📜
          </span>
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              سجل نشاط عمليات السحب والإسقاط (Drag-and-Drop Activity Log)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تسجيل تلقائي زمني لكافة تغييرات حالة الجلسات وإعادة الترتيب بالرول
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <Button
              size="sm"
              onClick={onUndoLast}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>↩️ التراجع عن التغيير الأخير (Undo)</span>
            </Button>
          )}

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2 py-1"
            >
              مسح السجل
            </button>
          )}
        </div>
      </div>

      {/* Log Feed */}
      {logs.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          <span>🎯 لم تتم أي عمليات سحب وإسقاط مؤخراً. قم بسحب أي جلسة لتغيير حالتها فورياً!</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence>
            {logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs transition-all ${idx === 0 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {log.timestamp}
                    </span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">{log.caseTitle}</strong>
                    {idx === 0 && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                        الأحدث
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span>تغيير حالة السحب من:</span>
                    {getStatusBadge(log.oldStatus)}
                    <span>← إلى:</span>
                    {getStatusBadge(log.newStatus)}
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => onUndoSpecific(log.id)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-all flex items-center gap-1"
                  >
                    <span>↩️ تراجع</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

export default DocketActivityLog;
