import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

interface DocketAudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  onAudioEnabledChange: (enabled: boolean) => void;
  selectedTone: string;
  onSelectedToneChange: (tone: string) => void;
  volume: number; // 0 - 100
  onVolumeChange: (vol: number) => void;
  alertLeadMinutes: number;
  onAlertLeadMinutesChange: (mins: number) => void;
  playTone: (tone?: string, vol?: number) => void;
}

export const SOUND_LIBRARY = [
  {
    id: 'chime',
    name: '🔔 جرس الرول الكلاسيكي (Classic Chime)',
    description: 'نغمة هادئة ومزدوجة ومناسبة لبيئة العمل القضائي'
  },
  {
    id: 'gavel',
    name: '⚖️ طرقة مطرقة المحكمة (Gavel Knock)',
    description: 'صوت وقور محاكي لطرقة المطرقة في قاعة المحكمة'
  },
  {
    id: 'harp',
    name: '🎼 تنبيه هارموني لطيف (Gentle Harp)',
    description: 'نغمة عذبة وغير مزعجة لأثناء التحضير للمذكرات'
  },
  {
    id: 'urgent',
    name: '🚨 نغمة طوارئ الجلسات المستعجلة (Urgent Bell)',
    description: 'تنبيه عالي الوضوح للتذكير قبل انطلاق مرافعة مستعجلة'
  }
];

export const DocketAudioSettingsModal: React.FC<DocketAudioSettingsModalProps> = ({
  isOpen,
  onClose,
  audioEnabled,
  onAudioEnabledChange,
  selectedTone,
  onSelectedToneChange,
  volume,
  onVolumeChange,
  alertLeadMinutes,
  onAlertLeadMinutesChange,
  playTone
}) => {
  const { addToast } = useToast();
  const [localTone, setLocalTone] = useState(selectedTone);
  const [localVolume, setLocalVolume] = useState(volume);
  const [localLead, setLocalLead] = useState(alertLeadMinutes);
  const [localEnabled, setLocalEnabled] = useState(audioEnabled);

  const handleTestTone = (toneId?: string) => {
    const toneToPlay = toneId || localTone;
    playTone(toneToPlay, localVolume);
    addToast({
      type: 'info',
      title: '🔊 اختبار الصوت',
      message: `جاري تشغيل المعاينة بنغمة (${SOUND_LIBRARY.find(s => s.id === toneToPlay)?.name.split('(')[0]}) بمستوى صوت ${localVolume}%.`
    });
  };

  const handleSave = () => {
    onAudioEnabledChange(localEnabled);
    onSelectedToneChange(localTone);
    onVolumeChange(localVolume);
    onAlertLeadMinutesChange(localLead);

    addToast({
      type: 'success',
      title: 'تم حفظ إعدادات الصوت ⚙️',
      message: 'تم تحديث خيارات التنبيهات ونغمة الرول الآلي بنجاح.'
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ إعدادات التنبيهات الصوتية ونغمات الرول الآلي" size="md">
      <div className="space-y-5 text-right">
        
        {/* Enable / Disable Master Toggle */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <h4 className="font-black text-sm text-emerald-400">تفعيل التنبيهات الصوتية الآلية</h4>
            <p className="text-xs text-slate-300">إصدار صوت قبل موعد الجلسة بقاعة المحكمة</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={localEnabled} 
              onChange={(e) => setLocalEnabled(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Lead Time Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-900 dark:text-white block">
            ⏰ التوقيت المسبق للتنبيه قبل الجلسة:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setLocalLead(mins)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${localLead === mins ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}`}
              >
                قبل {mins} دقيقة
              </button>
            ))}
          </div>
        </div>

        {/* Tone Library Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-900 dark:text-white block">
            🎵 اختيار نغمة التنبيه من مكتبة النظام:
          </label>
          <div className="space-y-2">
            {SOUND_LIBRARY.map((item) => {
              const isSelected = localTone === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    setLocalTone(item.id);
                    handleTestTone(item.id);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'}`}
                >
                  <div className="space-y-0.5">
                    <h5 className="font-black text-xs">{item.name}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalTone(item.id);
                      handleTestTone(item.id);
                    }}
                    className="text-xs font-black bg-slate-900 text-emerald-400 hover:bg-slate-800 px-2.5 py-1 rounded-xl shrink-0"
                  >
                    ▶ تجربة
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Level Control */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white">
            <span>🔊 مستوى الصوت (Volume Level)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{localVolume}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={localVolume} 
            onChange={(e) => setLocalVolume(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>كتم (0%)</span>
            <span>متوسط (50%)</span>
            <span>أقصى (100%)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => handleTestTone()}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
          >
            🔊 تجربة الصوت المحدد
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button 
              type="button" 
              size="sm" 
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black"
            >
              حفظ إعدادات الصوت 💾
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default DocketAudioSettingsModal;
