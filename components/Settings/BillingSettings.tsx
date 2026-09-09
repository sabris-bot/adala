import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UsersIcon, CloudArrowUpIcon, ActivityIcon } from '../../constants';

interface BillingSettingsProps {
  accent: any;
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({ accent }) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 md:p-10 rounded-[32px] border-none shadow-lg bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="space-y-3 text-center lg:text-right">
            <Badge text="باقات ومهام المنظومة" variant="warning" className="bg-white/10 text-amber-300 font-bold" />
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">باقة التميز القانوني والذكاء غير المحدود</h3>
            <p className="text-slate-300 text-xs font-semibold leading-relaxed">
              تاريخ الاستحقاق أو التجديد التلقائي لترخيص المكتب: <span className="font-mono text-amber-300">24 ديسمبر 2026</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-10 font-bold shadow-xl shrink-0">
              ترقية / إدارة الباقة
            </Button>
            <p className="text-[10px] text-center font-bold text-white/60 uppercase tracking-wider">معدل المقاعد والترخيص مصادق</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card text-center space-y-4 rounded-2xl shadow-sm">
          <div className={`p-4 bg-indigo-50 dark:bg-dm-background ${accent.text} rounded-3xl w-fit mx-auto`}>
            <UsersIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-slate-400 block pb-1">المقاعد الموظفة بالفريق</span>
          <div className="relative pt-1 font-mono text-xs font-bold text-slate-600 block">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-slate-800 dark:text-white">3/10 مقاعد</span>
              <span className="text-indigo-600">30% مستهلك</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card text-center space-y-4 rounded-2xl shadow-sm">
          <div className="p-4 bg-emerald-50 dark:bg-dm-background text-emerald-600 rounded-3xl w-fit mx-auto">
            <CloudArrowUpIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-slate-400 block pb-1">السعة السحابية الموظفة</span>
          <div className="relative pt-1 font-mono text-xs font-bold text-slate-600 block">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-slate-800 dark:text-white">12.5GB/50GB</span>
              <span className="text-emerald-600">25% مستهلك</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-4 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-dm-background text-amber-600 rounded-xl">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-slate-900 dark:text-dm-text">معدلات واستهلاك "مساعد عدالة الذكي"</h5>
          </div>
          <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-dm-background/50 rounded-xl">
              <span>تحليل وصياغة العقود</span>
              <span className="text-slate-900 dark:text-white font-bold">45/200 مستند</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-dm-background/50 rounded-xl">
              <span>جلب رول بوابة العدل المباشر</span>
              <span className="text-emerald-600 font-bold">12/∞ غير محدود</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-dm-background/50 rounded-xl">
              <span>عمليات الاستعلام والاستخلاص</span>
              <span className="text-slate-900 dark:text-white font-bold">890/5000 رمز</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
