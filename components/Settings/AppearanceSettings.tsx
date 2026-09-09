import React from 'react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Paintbrush, Sparkles, Check } from 'lucide-react';

interface AppearanceSettingsProps {
  brandAccent: string;
  setBrandAccent: (accent: string) => void;
  prefSettings: any;
  setPrefSettings: (prefs: any) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  accent: any;
  officeName: string;
  license: string;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  brandAccent,
  setBrandAccent,
  toggleDarkMode,
  isDarkMode,
  accent,
  officeName,
  license,
}) => {
  const colorOptions = [
    { id: 'indigo', name: 'أزرق ملكي (كلاسيك)', color: 'bg-indigo-600', text: 'text-indigo-600' },
    { id: 'gold', name: 'ذهبي الأصالة القانونية', color: 'bg-amber-600', text: 'text-amber-600' },
    { id: 'emerald', name: 'أخضر النماء والعدل', color: 'bg-emerald-600', text: 'text-emerald-600' },
    { id: 'rose', name: 'وردي النزاهة المدنية', color: 'bg-rose-600', text: 'text-rose-600' },
    { id: 'blue', name: 'أزرق سماوي حاد', color: 'bg-blue-600', text: 'text-blue-600' },
    { id: 'purple', name: 'بنفسجي السمو الفخم', color: 'bg-purple-600', text: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BRAND ACCENT COLOR SELECTION */}
        <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 rounded-[32px]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${accent.bgLight} ${accent.text} rounded-2xl`}>
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-dm-text text-sm">سمة ولون النظام البصري (Branding Style)</h4>
              <p className="text-xs text-slate-400 font-medium block mt-0.5">اختر اللون التعريفي ونبض الأزرار للمنظومة</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {colorOptions.map((opt) => {
              const isSelected = brandAccent === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBrandAccent(opt.id)}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-dm-background shadow-sm'
                      : 'border-slate-200/70 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full ${opt.color} shadow-sm`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-dm-text">{opt.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-slate-900 dark:text-white" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* DARK OR LIGHT THEME PRESETS */}
        <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 rounded-[32px]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-dm-background text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-dm-text text-sm">الوضع الافتراضي للشاشات</h4>
              <p className="text-xs text-slate-400 font-medium block mt-0.5">تبديل واختيار سمة الضوء المريحة للعينين</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => isDarkMode && toggleDarkMode()}
              className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center gap-2.5 transition-all ${
                !isDarkMode
                  ? `${accent.border} bg-white shadow-md shadow-slate-100`
                  : 'border-transparent bg-slate-50 dark:bg-dm-background text-slate-400 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-2xl block">☀️</span>
              <span className="text-xs font-bold block text-slate-800">الوضع النهاري الواضح</span>
            </button>
            <button
              type="button"
              onClick={() => !isDarkMode && toggleDarkMode()}
              className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center gap-2.5 transition-all ${
                isDarkMode
                  ? `${accent.border} bg-slate-900 text-white shadow-md`
                  : 'border-transparent bg-slate-50 text-slate-400 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-2xl block">🌙</span>
              <span className="text-xs font-bold block text-slate-100">الوضع الليلي الغامر</span>
            </button>
          </div>
        </Card>
      </div>

      {/* LIVE CARD ACCENT EMBLEMATIC PREVIEW */}
      <Card className="p-6 md:p-8 bg-slate-900 text-white rounded-[32px] border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-lg">
            <Badge text="بطاقة هوية المنشأة (معاينة الواجهة للعميل)" variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30" />
            <h4 className="text-xl font-bold">خط التقارير والهوية المتطابق</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              هذا النموذج يبين كيف سينعكس شعار مكتبك، وترخيصك، وزخرفة اللون البصري المختار في تذييل التقارير التلقائية ووصولات الدفع التوثيقية الموجهة للعملاء والجهات الحكومية.
            </p>
          </div>

          {/* LIVE CARD RENDER */}
          <div className="w-full lg:max-w-xs p-6 bg-slate-950/80 rounded-[24px] border border-slate-800 shadow-2xl flex flex-col space-y-4">
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner">⚖️</div>
              <div className="text-left font-mono text-[9px] text-slate-500">ADALA LAWYERS • v4</div>
            </div>
            <div>
              <span className="text-xs font-bold text-white block truncate">{officeName}</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">ترخيص رسمي: {license}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-900 flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">اللون المعتمد:</span>
              <span className={`px-2 py-0.5 rounded ${accent.bg} text-white font-bold text-[9px]`}>{brandAccent.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
