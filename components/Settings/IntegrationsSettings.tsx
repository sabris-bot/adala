import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { 
  BuildingOffice2Icon, GlobeAltIcon, PhoneIcon, InformationCircleIcon, CheckCircleIcon 
} from '../../constants';
import { Play } from 'lucide-react';

interface IntegrationsSettingsProps {
  accent: any;
  addToast: (toast: any) => void;
}

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ accent, addToast }) => {
  const [isMOJModalOpen, setIsMOJModalOpen] = useState(false);
  const [mojCivilId, setMojCivilId] = useState(() => localStorage.getItem('moj_civil_id') || '285041209931');
  const [mojApiKey, setMojApiKey] = useState(() => localStorage.getItem('moj_api_key') || 'ADALA_SEC_9981X');

  // Scraper Simulation states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<string[]>(['قصر العدل', 'محكمة الرقعي']);

  const courtsList = ['قصر العدل', 'محكمة الرقعي', 'محكمة حولي', 'محكمة الفروانية', 'محكمة الأحمدي', 'محكمة الجهراء'];

  const toggleCourt = (court: string) => {
    if (selectedCourts.includes(court)) {
      setSelectedCourts(selectedCourts.filter(c => c !== court));
    } else {
      setSelectedCourts([...selectedCourts, court]);
    }
  };

  const handleSaveMOJ = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('moj_civil_id', mojCivilId);
    localStorage.setItem('moj_api_key', mojApiKey);
    addToast({
      type: 'success',
      title: 'تم تفعيل الربط الحكومي',
      message: 'تم تعيين الرقم الموحد والـ API تزامناً مع بوابة العدل بنجاح.',
    });
    setIsMOJModalOpen(false);
  };

  const startMOJSyncMock = () => {
    setIsSyncing(true);
    setSyncProgress(5);
    setSyncLogs(['[10:04:12] جاري رصد واستدعاء بروتوكول بوابة العدل الكويتية (moj.gov.kw)...']);

    const steps = [
      { p: 20, log: '[10:04:13] استخدام مفتاح الربط والتحقق المعتمد لدى الإشراف التقني...' },
      { p: 45, log: '[10:04:15] تم الدخول للموقع الحكومي وتفكيك صفحة رول قضايا الخبراء وجلسات النيابة.' },
      { p: 65, log: `[10:04:16] تصفية المحاكم المختارة: [${selectedCourts.join(' ، ')}]...` },
      { p: 85, log: '[10:04:18] عثر على 4 مواعيد جلسات متباينة وتأكيد رول الاستئناف التجاري.' },
      { p: 95, log: '[10:04:19] جاري مطابقة القضبان ودمج الأرصدة وتلقائيات المواريث والملوكية.' },
      { p: 100, log: '[10:04:20] تم اكتمال محاكي المزامنة وجلب 4 تحديثات وتغذية منظومة التنبيهات الموقوتة!' },
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSyncProgress(step.p);
        setSyncLogs(prev => [...prev, step.log]);
        if (step.p === 100) {
          setIsSyncing(false);
          addToast({
            type: 'success',
            title: 'اكتمل محاكي الجلب الآلي',
            message: 'تم سحب بيانات الجلسات والخبراء الأخيرة بنجاح وتوطينها بالمنظومة اليدوية!',
          });
        }
      }, (idx + 1) * 800);
    });
  };

  const extIntegrations = [
    {
      id: 'moj',
      name: 'بوابة بوابة العدل الكويتية (Kuwait MOJ)',
      desc: 'جلب بيانات القضايا تلقائياً، مواعيد الجلسات، الأحكام والقرارات الحكومية الفورية لوزارة العدل.',
      icon: <BuildingOffice2Icon className="w-7 h-7 text-amber-600" />,
      status: 'متصل ومحكوم',
    },
    {
      id: 'google',
      name: 'مزامنة تقويم Google Workspace & Meet',
      desc: 'مزامنة المواعيد والمؤتمرات القانونية وإقرارات الجلسات في البريد.',
      icon: <GlobeAltIcon className="w-7 h-7 text-blue-500" />,
      status: 'غير متصل',
    },
    {
      id: 'whatsapp',
      name: 'بوابة إرسال الواتساب المتكامل (WhatsApp API)',
      desc: 'تزويد العملاء بقرارات المحكمة وتلقائيات دفع المطالبات تلقائياً.',
      icon: <PhoneIcon className="w-7 h-7 text-emerald-500" />,
      status: 'غير متصل',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-dm-text">مركز الربط وتكاملات البوابات</h4>
            <p className="text-xs text-slate-400 font-medium block mt-0.5">صهر أنظمة المحاكم والتقاويم والاتصالات ببيئة عملك المباشرة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {extIntegrations.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all bg-slate-50/50 dark:bg-dm-background/50"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-white dark:bg-dm-card rounded-2xl shadow-sm">{item.icon}</div>
                  <Badge text={item.status} variant={item.status.includes('متصل') ? 'success' : 'secondary'} size="xs" />
                </div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-dm-text">{item.name}</h5>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold rounded-xl"
                onClick={() => {
                  if (item.id === 'moj') setIsMOJModalOpen(true);
                  else {
                    addToast({
                      type: 'info',
                      title: 'ربط سحابي متطور',
                      message: `إضافة ربط ${item.name} يحتاج لتفويض حساب المالك المباشر بالبوابة السحابية.`,
                    });
                  }
                }}
              >
                {item.status.includes('متصل') ? 'إعدادات وتفاصيل الربط' : 'إطلاق معيار الربط'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* INTEGRATED MOJ MODAL POPUP */}
      <Modal isOpen={isMOJModalOpen} onClose={() => setIsMOJModalOpen(false)} title="تكامـل مع بوابة العدل الكويتية الموحدة (Active Scraper)">
        <form onSubmit={handleSaveMOJ} className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex gap-3 text-xs font-semibold leading-relaxed">
            <InformationCircleIcon className="w-5 h-5 shrink-0" />
            <span>يتيح تكامل بوابتك القانونية الموحد جلب معلومات القضايا والآراد الصادرة، ورصد رول الجلسات ونحوه تلقائياً دون الحاجة للتحقق اليدوي الخارجي.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الرقم المدني الموحد للمكتب / الجهة"
              value={mojCivilId}
              onChange={(e) => setMojCivilId(e.target.value)}
              placeholder="Civil ID"
              required
              className="rounded-xl font-mono border-slate-200 dark:border-slate-700"
            />
            <Input
              label="مفتاح الـ API والربط الحكومي"
              type="password"
              value={mojApiKey}
              onChange={(e) => setMojApiKey(e.target.value)}
              placeholder="Government gateway API token"
              required
              className="rounded-xl font-mono border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Court selection checkboxes */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">مستوعبات التوطين ومراقبة المحاكم</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {courtsList.map(court => {
                const active = selectedCourts.includes(court);
                return (
                  <button
                    key={court}
                    type="button"
                    onClick={() => toggleCourt(court)}
                    className={`p-3 rounded-xl border text-right text-xs font-bold transition-all flex items-center justify-between ${
                      active
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-300'
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 dark:bg-dm-background dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span>{court}</span>
                    {active && <CheckCircleIcon className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE SCRAPER INTEGRATED SIMULATOR FOR USER INTERACTIVITY */}
          <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-dm-text flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" /> محاكاة وفحص الربط المباشر (Live Scraper Testing)
                </h5>
                <p className="text-xs text-slate-400 font-medium block mt-0.5">تحقق فوراً من توافق الأرقام وقناة السحب الحكومية</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl px-4 text-xs font-bold shrink-0"
                disabled={isSyncing}
                onClick={startMOJSyncMock}
              >
                {isSyncing ? 'جاري السحب ومعايرة البيانات...' : 'تشغيل فحص سحب فوري'}
              </Button>
            </div>

            {/* Progress display */}
            {(isSyncing || syncProgress > 0) && (
              <div className="space-y-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 font-mono">
                  <span>مستوى معالجة البيانات</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[10px] h-32 overflow-y-auto space-y-1 text-left">
                  {syncLogs.map((log, lIdx) => (
                    <div key={lIdx} className="leading-relaxed border-l-2 border-indigo-500 pl-2">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" className="rounded-xl" onClick={() => setIsMOJModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit" className={`rounded-xl px-8 ${accent.bg}`}>
              حفظ التراخيص وتأكيد الربط
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
