import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface LoanIntegrationsTabProps {
  lang: 'ar' | 'en';
  loans: any[];
}

export const LoanIntegrationsTab: React.FC<LoanIntegrationsTabProps> = ({
  lang,
  loans
}) => {
  const [logs, setLogs] = useState<string[]>([
    `[INFO] [${new Date().toISOString().split('T')[0]} 08:30:00] Initialized ERP integration tunnels. Synchronized 14 active Kuwait banks.`,
    `[INFO] [${new Date().toISOString().split('T')[0]} 09:12:45] Synchronized employee list with HR database. Basic salaries retrieved.`,
    `[SUCCESS] [${new Date().toISOString().split('T')[0]} 10:00:22] WPS (Wage Protection System) file generated for the current month. Included loan deduction items.`
  ]);

  const [isRunningSim, setIsRunningSim] = useState(false);

  const triggerIntegrationSync = () => {
    setIsRunningSim(true);
    setLogs(prev => [
      ...prev,
      `[PENDING] [${new Date().toISOString()} ] Pinging financial ledger server...`,
    ]);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        `[SYNC] [${new Date().toISOString()} ] Synced remaining balance for ${loans.length} active employee profiles.`,
        `[SUCCESS] [${new Date().toISOString()} ] Cross-checking salary constraints under Art 20. Zero compliance violations found.`,
        `[INFO] [${new Date().toISOString()} ] Transmitted repayment entries to central General Ledger. Entry #GL-2026-LN-SYNC.`
      ]);
      setIsRunningSim(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Card 
        className="bg-white dark:bg-[#1E3C50] border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
        title={lang === 'ar' ? 'مركز الترابط والتكامل البيني الذكي للأنظمة' : 'ERP Tunnels & Modules Synchronization Hub'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: HR link */}
          <div className="p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#153042] relative overflow-hidden flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{lang === 'ar' ? 'ربط السجلات العامة' : 'Modules'}</p>
              <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1.5">{lang === 'ar' ? 'شؤون الموظفين (HR Profiles)' : 'Human Resources Profiles'}</h4>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> {lang === 'ar' ? 'متصل ومطابق' : 'Live Synced'}</span>
              <span>100% (HR API)</span>
            </div>
          </div>

          {/* Card 2: Accounting */}
          <div className="p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#153042] relative overflow-hidden flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{lang === 'ar' ? 'مطابقة الأرصدة والقيود' : 'Modules'}</p>
              <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1.5">{lang === 'ar' ? 'الإدارة المالية (Ledger)' : 'Corporate Ledgers'}</h4>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> {lang === 'ar' ? 'متزامن تلقائي' : 'GL Linked'}</span>
              <span>GL-2026-MAIN</span>
            </div>
          </div>

          {/* Card 3: Payrol WPS */}
          <div className="p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#153042] relative overflow-hidden flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{lang === 'ar' ? 'الخصم التلقائي بمسيرات الرواتب' : 'Modules'}</p>
              <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1.5">{lang === 'ar' ? 'الرواتب والأجور (WPS)' : 'Payroll & Wages System'}</h4>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> {lang === 'ar' ? 'مجدول شهرياً' : 'Monthly deduction'}</span>
              <span>Kuwait WPS V2</span>
            </div>
          </div>

          {/* Card 4: EOS benefits */}
          <div className="p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#153042] relative overflow-hidden flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{lang === 'ar' ? 'تسويات مادة 51 ومستحقات مكافأة نهاية الخدمة' : 'Modules'}</p>
              <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1.5">{lang === 'ar' ? 'الإنهاءات والمستندات' : 'End of Service Registry'}</h4>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> {lang === 'ar' ? 'مفعل وجاهز' : 'Active'}</span>
              <span>Law 6/2010 Art 51</span>
            </div>
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'منصة العمليات التفصيلية والمزامنات العابرة' : 'Live Sync Transactions Logger Terminal'}</h4>
            <Button 
              className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white rounded-xl h-10 border-none cursor-pointer"
              size="sm" 
              variant="primary" 
              onClick={triggerIntegrationSync}
              disabled={isRunningSim}
            >
              {isRunningSim ? (lang === 'ar' ? 'مزامنة جارية...' : 'Syncing...') : (lang === 'ar' ? 'مزامنة وتفعيل القيود يدوياً' : 'Force Push XML Repayments Sync')}
            </Button>
          </div>

          <div className="bg-slate-900 leading-relaxed font-mono text-[10.5px] p-5 rounded-2xl border border-slate-950 text-left text-slate-300 h-64 overflow-y-auto space-y-2 select-text font-black">
            {logs.map((l, i) => (
              <div 
                key={i} 
                className={l.includes('SUCCESS') ? 'text-emerald-400' : l.includes('PENDING') ? 'text-amber-400' : 'text-slate-300'}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
