import React, { useMemo } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface CasesPrefixConfigProps {
  config: any;
  setConfig: (config: any) => void;
  accent: any;
  users: any[];
}

export const CasesPrefixConfig: React.FC<CasesPrefixConfigProps> = ({ config, setConfig }) => {
  const currentYear = new Date().getFullYear();

  const mockPreview = useMemo(() => {
    const yearPart = config.includeYear ? `${currentYear}${config.separator}` : '';
    return `${config.prefix}${config.separator}${yearPart}${config.startNumber}`;
  }, [config, currentYear]);

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-dm-text">محدد تسلسلات أرقام وقضايا المنظومة</h4>
          <p className="text-xs text-slate-400 font-medium block mt-0.5">عين قواعد توليد معرّفات القضايا بشكل تلقائي دون تكرار فني</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="البادئة النصية (Prefix)"
            value={config.prefix}
            onChange={(e) => setConfig({ ...config, prefix: e.target.value.toUpperCase() })}
            className="rounded-xl font-mono uppercase border-slate-200 dark:border-slate-700"
            placeholder="مثال: ADALA"
          />
          <Select
            label="فاصل الترميز الموحد"
            options={[
              { value: '-', label: 'علامة طرح (-)' },
              { value: '/', label: 'علامة كسر (/)' },
              { value: '_', label: 'علامة سفلية (_)' },
            ]}
            value={config.separator}
            onChange={(e: any) => setConfig({ ...config, separator: e.target.value })}
            containerClassName="mb-0"
          />
          <Input
            label="رقم البدء التسلسلي الأولي"
            value={config.startNumber}
            onChange={(e) => setConfig({ ...config, startNumber: e.target.value })}
            className="rounded-xl font-mono border-slate-200 dark:border-slate-700"
            placeholder="مثال: 1001"
          />
          <div className="flex flex-col justify-center bg-slate-50 dark:bg-dm-background p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 block mb-1">تضمين السنة الفورية بالتفاصيل</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                checked={config.includeYear}
                onChange={(e) => setConfig({ ...config, includeYear: e.target.checked })}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-dm-text">نعم، أدرج السنة كجزء من المعرّف المولد ({currentYear})</span>
            </div>
          </div>
        </div>

        {/* PROGRESS SEQUENCER PREVIEW GAUGE */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center space-y-2 shadow-inner">
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase block">معرّف القضية القادمة المولد آلياً (Auto-ID Sample)</span>
          <span className="text-2xl font-mono font-black tracking-widest block text-white">{mockPreview}</span>
        </div>
      </Card>

      <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-dm-text">سياسات الإسناد وتصنيف القضايا</h4>
          <p className="text-xs text-slate-400 font-medium block mt-0.5">تلقائيات وخدمات الإسناد المتقاطعة بالمنظومة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="إسناد تلقائي للقضايا المستوردة"
            options={[
              { value: 'lawyer_role', label: 'المحامي المسؤول (تلقائي)' },
              { value: 'admin_role', label: 'المشرف التقني' },
              { value: 'manual', label: 'لا تسند تلقائياً (يدوي)' },
            ]}
            value={config.autoAssignLawyer}
            onChange={(e: any) => setConfig({ ...config, autoAssignLawyer: e.target.value })}
            containerClassName="mb-0"
          />
          <Select
            label="فترة التنبيه الإداري قبل الجلسات"
            options={[
              { value: '12', label: 'قبل 12 ساعة' },
              { value: '24', label: 'قبل 24 ساعة' },
              { value: '48', label: 'قبل يومين' },
              { value: '168', label: 'قبل أسبوع' },
            ]}
            value={config.hearingsAdvanceHours}
            onChange={(e: any) => setConfig({ ...config, hearingsAdvanceHours: e.target.value })}
            containerClassName="mb-0"
          />
        </div>
      </Card>
    </div>
  );
};
