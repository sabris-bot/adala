import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import { Badge } from '../ui/Badge';
import { motion } from 'motion/react';
import { ClockIcon, BellAlertIcon, DevicePhoneMobileIcon } from '../../constants';
import { Send, Calendar } from 'lucide-react';

interface CommunicationSettingsProps {
  notifPrefs: any;
  setNotifPrefs: (prefs: any) => void;
  accent: any;
  addToast: (toast: any) => void;
}

export const CommunicationSettings: React.FC<CommunicationSettingsProps> = ({
  notifPrefs,
  setNotifPrefs,
  accent,
  addToast,
}) => {
  const [activeSubView, setActiveSubView] = useState<'triggers' | 'editor'>('triggers');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // SMTP Test dispatch simulation settings
  const [testTarget, setTestTarget] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const templatesList = [
    {
      id: '1',
      title: 'ترحيب بعميل جديد بالمنشأة',
      desc: 'ترافق الفواتير الأولى لتوثيق رقم الموكل والدخول الآمن',
      content: 'عزيزي العميل، نسعد بانضمامكم لمكتبنا برقم ملف [رقم_القضية] ونعدكم بالنزاهة والعمل الدقيق.',
    },
    {
      id: '2',
      title: 'تأكيد وحجز الجلسة القانونية المستجيبة',
      desc: 'ترسل قبل 24 ساعة من توجه المحامي لمطابقة رول المحكمة',
      content: 'نحيط سيادتكم علماً بأن موعد جلستكم برقم [رقم_القضية] هو يوم [التاريخ] فجر المحكمة المعتمدة.',
    },
    {
      id: '3',
      title: 'تنبيه تحصيل مصاريف ووصول سداد',
      desc: 'إشعار فوري للفواتير المدفوعة إلكترونياً آليا',
      content: 'تم تلقي سداد بمبلغ [المبلغ] دينار كويتي بنجاح لقضيتكم برقم [رقم_القضية]. شكراً لثقتكم.',
    },
  ];

  const togglePref = (key: string) => {
    setNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] });
  };

  const runCommunicationTest = () => {
    if (!testTarget.trim()) {
      alert('الرجاء إدخال بريد أو هاتف لتشغيل محاكي الاختبار!');
      return;
    }
    setIsTesting(true);
    setTestLogs(['[11:15:02] محاكي الشبكة: استدعاء خادم SMTP الآمن وبوابات الربط السلبي...']);

    const testSteps = [
      { p: 30, log: `[11:15:03] معالجة وصهر قالب الترحيب الديناميكي ببيانات الموكل...` },
      { p: 60, log: `[11:15:05] جاري إجراء مطابقة بروتوكول SMS ومزامنة الكيان المرسل [ADALA_MSG]...` },
      { p: 85, log: `[11:15:06] إرسال الحزم السحابية المشفرة بنجاح إلى: ${testTarget}` },
      { p: 100, log: `[11:15:07] الشبكة: استجابة خادم التلقي (200 OK). تم التوصيل وهز شريط التنبيهات!` },
    ];

    testSteps.forEach((step, index) => {
      setTimeout(() => {
        setTestLogs(prev => [...prev, step.log]);
        if (step.p === 100) {
          setIsTesting(false);
          addToast({
            type: 'success',
            title: 'تم إرسال إشعار التجربة',
            message: 'وصلت الرسالة الاختبارية لمحاكي التوصيل بنجاح 100%!',
          });
        }
      }, (index + 1) * 700);
    });
  };

  if (activeSubView === 'editor' && selectedTemplate) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveSubView('triggers')}
            className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
          >
            ← العودة للتصنيفات والتلقائيات
          </button>
          <Badge text="محرر القوالب الذكي" variant="warning" size="xs" />
        </div>

        <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
          <Input
            label="اسم القالب التعريفي"
            value={selectedTemplate.title}
            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
            className="rounded-xl h-12 border-slate-200 dark:border-slate-700"
          />
          <TextArea
            label="نص ومحتوى الإشعار والرسالة التلقائية"
            rows={6}
            value={selectedTemplate.content}
            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, content: e.target.value })}
            className="rounded-2xl border-slate-200 dark:border-slate-700"
          />

          <div className="p-5 bg-slate-50 dark:bg-dm-background rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider text-center">أدرج المتغيرات القانونية والمالية بالنقر المباشر</span>
            <div className="flex flex-wrap justify-center gap-2">
              {['[اسم_العميل]', '[رقم_القضية]', '[التاريخ]', '[اسم_المحامي]', '[المبلغ]', '[موعد_الجلسة]'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTemplate({ ...selectedTemplate, content: selectedTemplate.content + ' ' + tag })}
                  className="px-3 py-1.5 bg-white dark:bg-dm-card border border-slate-200/80 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" className="rounded-xl" onClick={() => setActiveSubView('triggers')}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              className={`rounded-xl px-10 ${accent.bg}`}
              onClick={() => {
                addToast({ type: 'success', title: 'تم حفظ القالب', message: 'تم تحديث قالب الاتصالات والمراسلات بنجاح.' });
                setActiveSubView('triggers');
              }}
            >
              حفظ القالب
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-dm-text">الإشعارات والتلقائيات الموقوتة بالمنظومة</h4>
          <p className="text-xs text-slate-400 font-medium block mt-0.5">تحكم في تنبيهات الموكلين التلقائية ومستوعبات سحب بوابة المحاكم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'emailOverdueTasks',
              label: 'تنبيهات المهام القانونية المتأخرة (Tasks Overdue)',
              desc: 'إشعار تذكير للمحامين المتأخرين بالنيابة.',
              icon: <ClockIcon className="w-5 h-5 text-indigo-500" />,
            },
            {
              key: 'emailUrgentHearings',
              label: 'تذكير الجلسات الموقوتة العاجلة (Hearings Urgent)',
              desc: 'تنبيه الموكل قبل 24 ساعة من موعد الجلسة برابط رولها.',
              icon: <Calendar className="w-5 h-5 text-rose-500" />,
            },
            {
              key: 'whatsappDailySummary',
              label: 'ملخص واتساب يومي للمدير (WhatsApp Summary)',
              desc: 'تقرير يومي عاجل بنبض قضايا وجلسات الخبراء.',
              icon: <DevicePhoneMobileIcon className="w-5 h-5 text-emerald-500" />,
            },
            {
              key: 'smsCriticalAlerts',
              label: 'رسائل قصيرة للحالات القضائية الطارئة',
              desc: 'في حال صدور حكم أو تأجيل حاسم ومباشر بالبوابة.',
              icon: <BellAlertIcon className="w-5 h-5 text-amber-500" />,
            },
          ].map(pref => {
            const active = notifPrefs[pref.key];
            return (
              <div
                key={pref.key}
                onClick={() => togglePref(pref.key)}
                className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-200 transition-all flex items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-dm-background/50"
              >
                <div className="flex gap-3.5 min-w-0">
                  <div className="p-3 bg-white dark:bg-dm-card rounded-xl shadow-sm text-slate-400 shrink-0">{pref.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-dm-text truncate block">{pref.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium block mt-0.5">{pref.desc}</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-all flex items-center shrink-0 ${active ? accent.bg : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-0' : 'translate-x-6'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TEMPLATE QUICK LIST PANEL */}
        <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-4 shadow-sm">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-dm-text">قوالب وإشعارات الموكلين الديناميكية</h4>
            <p className="text-xs text-slate-400 font-medium block mt-0.5">صياغة محتوى الرسائل قبل إطلاق الإشعارات</p>
          </div>

          <div className="space-y-3 pt-2">
            {templatesList.map(tmpl => (
              <div
                key={tmpl.id}
                className="p-4 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between hover:border-indigo-200 transition-all"
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-dm-text block">{tmpl.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">{tmpl.desc}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-[10px] font-bold py-1.5 h-fit shrink-0 bg-white shadow-sm"
                  onClick={() => {
                    setSelectedTemplate(tmpl);
                    setActiveSubView('editor');
                  }}
                >
                  محرر النصوص
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* RELIABILITY DISPATCH TESTING TOOL */}
        <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-4 shadow-sm">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-dm-text flex items-center gap-1.5">
              <Send className="w-4 h-4 text-indigo-500 animate-pulse" /> أداة مطابقة واختبار المراسلات (SMTP Sandbox Tester)
            </h4>
            <span className="text-xs text-slate-400 font-medium block mt-0.5">افحص صحة ووصول الإشعارات للموكلين بشكل حي</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                label="أدخل بريد أو هاتف اختبار"
                value={testTarget}
                onChange={(e) => setTestTarget(e.target.value)}
                placeholder="client@example.com"
                containerClassName="mb-0 flex-1"
                className="rounded-xl bg-slate-50 border-slate-200 text-xs font-mono"
              />
              <Button
                type="button"
                variant="primary"
                className={`rounded-xl self-end h-12 px-6 ${accent.bg}`}
                disabled={isTesting}
                onClick={runCommunicationTest}
              >
                {isTesting ? 'جاري الفحص...' : 'إرسال تجريبي'}
              </Button>
            </div>

            {/* Testing Realtime Outputs display */}
            {(isTesting || testLogs.length > 0) && (
              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[10px] h-32 overflow-y-auto space-y-1 block text-left">
                {testLogs.map((logStr, sIdx) => (
                  <div key={sIdx} className="leading-relaxed border-l border-emerald-500 pl-2">{logStr}</div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
