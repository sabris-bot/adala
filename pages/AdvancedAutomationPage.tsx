import React from 'react';
import { useToast } from '../components/ui/Toast';
import AdvancedAutomationSettings from '../components/Settings/AdvancedAutomationSettings';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Scale, Layers } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const AdvancedAutomationPage: React.FC = () => {
  const { addToast } = useToast();

  const brandAccent = {
    bg: 'bg-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    ring: 'focus:ring-indigo-500/20',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/20'
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      {/* Breadcrumbs & Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <NavLink to="/dashboard" className="hover:text-indigo-600 transition-colors">الرئيسية</NavLink>
            <span>/</span>
            <NavLink to="/settings" className="hover:text-indigo-600 transition-colors">الإعدادات والتهيئة</NavLink>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">إعدادات الأتمتة المتقدمة</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
              <Zap className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                إعدادات الأتمتة المتقدمة (Automation Rules Engine)
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                مركز التحكم في قواعد المواعيد، الإنذارات التلقائية، مصفوفة مخاطر المستأجرين، وقوالب الإخطارات القضائية
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/settings"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمركز الإعدادات</span>
          </NavLink>
        </div>
      </div>

      {/* TOP KPI Quick Status Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">قواعد الأتمتة النشطة</span>
            <span className="text-lg font-black text-slate-900 dark:text-white block mt-0.5 font-mono">12 قاعدة</span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">⚙️</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">إخطارات المادة 20 المرسلة</span>
            <span className="text-lg font-black text-emerald-600 block mt-0.5 font-mono">48 إنذاراً</span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">📜</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">مستأجرين قيد تصنيف الخطر</span>
            <span className="text-lg font-black text-amber-600 block mt-0.5 font-mono">156 ملفاً</span>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">🛡️</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">نسبة الاستجابة التلقائية</span>
            <span className="text-lg font-black text-blue-600 block mt-0.5 font-mono">99.4%</span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">⚡</div>
        </div>
      </div>

      {/* Main Advanced Automation Component */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <AdvancedAutomationSettings accent={brandAccent} addToast={addToast} />
      </div>
    </div>
  );
};

export default AdvancedAutomationPage;
