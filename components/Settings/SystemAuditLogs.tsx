import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useToast } from '../ui/Toast';
import { Search, AlertCircle, Activity as AuditIcon, FileSpreadsheet } from 'lucide-react';

interface SystemAuditLogsProps {
  logs: any[];
  setLogs: (logs: any[]) => void;
  accent: any;
}

export const SystemAuditLogs: React.FC<SystemAuditLogsProps> = ({ logs, setLogs }) => {
  const { addToast } = useToast();
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
        log.details.toLowerCase().includes(searchFilter.toLowerCase()) ||
        log.user.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesCat = categoryFilter === 'all' || log.section === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [logs, searchFilter, categoryFilter]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['رقم السجل,التصنيف,العملية,المسؤول,التوقيت,التفاصيل'].join(',') +
      '\n' +
      logs.map((l: any) => `${l.id},${l.section},${l.action},${l.user},${l.time},${l.details}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adala_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'تم تصدير كشف التدقيق',
      message: 'تم تجميع سجلات سلامة المنظومة وتحميل ملف CSV الفوري بنجاح.',
    });
  };

  const handleClearLogs = () => {
    if (confirm('هل ترغب بتصفير سجلات التدقيق الآمنة الحالية وقفل الدفتر؟')) {
      setLogs([]);
      localStorage.setItem('adala_audit_logs', JSON.stringify([]));
      addToast({
        type: 'info',
        title: 'تصفير السجلات',
        message: 'تم تفريغ مستندات التدقيق المؤقتة وحمايتها.',
      });
    }
  };

  return (
    <Card className="rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-dm-text flex items-center gap-2">
            <AuditIcon className="w-5 h-5 text-indigo-500" /> سجل التدقيق وحركات الأمان الموحد
          </h3>
          <p className="text-xs text-slate-400 font-medium block mt-0.5">تتبع وإحصاء كافة قرارات وحركات الموظفين وتحديثات السيرفر لتجهيز سجل الحصانة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold bg-slate-50 border-slate-200 flex items-center gap-2" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> تصدير كشف CSV
          </Button>
          <Button variant="secondary" size="sm" className="rounded-xl text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100" onClick={handleClearLogs}>
            تصفير السجلات
          </Button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="البحث بالعملية، المسؤول أو تفاصيل التغيير الفني..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="rounded-xl pr-10 text-xs h-10 w-full border-slate-200 dark:border-slate-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
        <Select
          options={[
            { value: 'all', label: 'كافة الأقسام والمستوعبات' },
            { value: 'security', label: 'الأمان وحصانة الولوج (Security)' },
            { value: 'users', label: 'فريق العمل والمقاعد' },
            { value: 'system', label: 'تحديثات النظام وترقيم القضايا' },
            { value: 'database', label: 'قاعدة البيانات والتخزين الوقائي' },
            { value: 'integrations', label: 'الربط الحكومي وبوابة العدل' },
          ]}
          value={categoryFilter}
          onChange={(e: any) => setCategoryFilter(e.target.value)}
          containerClassName="mb-0 min-w-[210px]"
        />
      </div>

      {/* LOGS COMPACT FLOW PANEL */}
      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pl-1">
        {filteredLogs.map((log: any) => (
          <div key={log.id} className="p-4 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-200 transition-all text-xs font-medium space-y-1">
            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  log.section === 'security'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : log.section === 'integrations'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                    : log.section === 'database'
                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40'
                }`}
              >
                {log.section}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
            </div>
            <h5 className="font-bold text-slate-900 dark:text-dm-text text-xs">{log.action}</h5>
            <p className="text-xs text-slate-400 font-medium block mt-0.5">{log.details}</p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>المسؤول الفني: {log.user}</span>
              <span className="font-mono text-slate-400 select-all">{log.id}</span>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            لا تشير السجلات المشحونة لأي مطابقة بالبحث المجرى حالياً.
          </div>
        )}
      </div>
    </Card>
  );
};
