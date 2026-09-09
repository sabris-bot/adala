import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { LockClosedIcon } from '../../constants';
import { Shield } from 'lucide-react';

interface SecuritySettingsProps {
  prefs: any;
  setPrefs: (prefs: any) => void;
  accent: any;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ prefs, setPrefs, accent }) => {
  return (
    <Card className="rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 ${accent.bgLight} ${accent.text} rounded-2xl`}>
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-dm-text tracking-tight">إعدادات الأمان وحصانة العمليات القانونية</h3>
          <p className="text-xs text-slate-400 font-medium block mt-0.5">حماية الولوج للمنظومة وسجلات الحصانة ومصادقة العاملين</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 rounded-[24px] bg-slate-50 dark:bg-dm-background border border-slate-200/60 dark:border-slate-800">
          <div className="flex gap-4">
            <div className="p-2.5 bg-white dark:bg-dm-card rounded-xl text-indigo-600 shadow-sm h-fit">
              <LockClosedIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-dm-text text-sm">المصادقة بمستويين ثنائيين (2FA Authenticator)</p>
              <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-sm mt-1">تأمين سجلات القضايا بإشراك التحقق الإضافي الموائم لجوجل.</p>
            </div>
          </div>
          <Button
            variant={prefs.twoFactorEnabled ? 'secondary' : 'primary'}
            className={`rounded-xl px-6 font-bold text-xs ${!prefs.twoFactorEnabled ? accent.bg + ' ' + accent.hoverBg : ''}`}
            onClick={() => setPrefs({ ...prefs, twoFactorEnabled: !prefs.twoFactorEnabled })}
          >
            {prefs.twoFactorEnabled ? 'تعطيل الحماية الإضافية' : 'تفعيل بالمنظومة فوراً'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-6 bg-slate-50 dark:bg-dm-background rounded-[24px] border border-slate-200/60 dark:border-slate-800">
            <h4 className="font-bold text-xs text-slate-800 dark:text-dm-text mb-3 uppercase tracking-wider">سياسة معرّفات الدخول</h4>
            <Select
              label="الحد الأدنى لصلابة كلمة المرور"
              options={[
                { value: '8', label: '8 خانات' },
                { value: '12', label: '12 خانة معقدة' },
              ]}
              value={prefs.minLength}
              onChange={(e: any) => setPrefs({ ...prefs, minLength: e.target.value })}
              containerClassName="mb-4"
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                checked={prefs.requireSpecialChars}
                onChange={(e: any) => setPrefs({ ...prefs, requireSpecialChars: e.target.checked })}
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">إلزام الرموز والأرقام والحالات الكبيرة</span>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-slate-50 dark:bg-dm-background rounded-[24px] border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-dm-text mb-2 uppercase tracking-wider">الجلسات والمتصفحات النشطة</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">يتواجد حالياً 3 أجهزة متصلة ضمن خلية المكتب المصدقة.</p>
            </div>
            <Button variant="outline" size="sm" className="w-full h-11 rounded-xl border-slate-200 text-rose-500 hover:bg-rose-50 font-bold">
              إنهاء وتنزيل كافة جلسات الدخول الفورية
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
