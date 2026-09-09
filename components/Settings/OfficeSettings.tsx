import React, { useRef } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import { CloudArrowUpIcon, BuildingOffice2Icon, CheckIcon } from '@heroicons/react/24/outline';

interface OfficeSettingsProps {
  info: any;
  setInfo: (info: any) => void;
  accent: any;
}

export const OfficeSettings: React.FC<OfficeSettingsProps> = ({ info, setInfo, accent }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInfo({ ...info, logo: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const presets = [
    { name: 'ميزان العدالة الكلاسيكي', svg: '⚖️' },
    { name: 'درع الحماية القانوني', svg: '🛡️' },
    { name: 'الخط العربي الفاخر', svg: '✒️' },
    { name: 'شعار الهلال والتاج', svg: '🌙' },
  ];

  return (
    <Card className="rounded-[32px] p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-8 shadow-sm">
      {/* Header section with logo & quick template picker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div
            onClick={handleLogoClick}
            className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-dm-background border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all cursor-pointer group relative overflow-hidden shrink-0 shadow-inner"
            title="انقر لرفع شعار فريد للمنشأة"
          >
            {info.logo ? (
              info.logo.length < 5 ? (
                <span className="text-4xl">{info.logo}</span>
              ) : (
                <img src={info.logo} alt="شعار المنشأة" className="w-full h-full object-cover" />
              )
            ) : (
              <>
                <CloudArrowUpIcon className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold mt-1 text-center text-slate-500">رفع الشعار</span>
              </>
            )}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              تغيير الصورة
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xl font-black text-slate-900 dark:text-dm-text">{info.name || 'مكتب المحاماة والخدمات القانونية'}</h3>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              مكتب مرخص وموثق • ترخيص رقم: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{info.license}</span>
            </p>
          </div>
        </div>

        {/* LOGO TEMPLATE QUICK PICKER */}
        <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex-1 max-w-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">رموز الهوية الكلاسيكية السريعة</span>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected = info.logo === p.svg;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setInfo({ ...info, logo: p.svg })}
                  className={`h-11 rounded-xl bg-white dark:bg-dm-card border transition-all text-xl flex items-center justify-center relative ${
                    isSelected
                      ? 'border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                  title={p.name}
                >
                  {p.svg}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FORM INPUTS GRID */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>البيانات الأساسية ومعلومات التواصل الرسمي</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="اسم المنشأة القانونية"
            value={info.name}
            onChange={e => setInfo({ ...info, name: e.target.value })}
            containerClassName="mb-0"
            className="rounded-xl border-slate-200 dark:border-slate-700"
          />
          <Input
            label="الرقم الموحد للجهة (تراخيص)"
            value={info.unifiedId}
            onChange={e => setInfo({ ...info, unifiedId: e.target.value })}
            containerClassName="mb-0"
            className="rounded-xl border-slate-200 dark:border-slate-700 font-mono"
          />
          <Input
            label="رقم الترخيص المهني الموثق"
            value={info.license}
            onChange={e => setInfo({ ...info, license: e.target.value })}
            containerClassName="mb-0"
            className="rounded-xl border-slate-200 dark:border-slate-700 font-mono"
          />
          <Input
            label="البريد الإلكتروني الرسمي للمطالبات"
            type="email"
            value={info.email}
            onChange={e => setInfo({ ...info, email: e.target.value })}
            containerClassName="mb-0"
            className="rounded-xl border-slate-200 dark:border-slate-700"
          />
          <Input
            label="رقم هاتف المنشأة للتواصل"
            value={info.phone}
            onChange={e => setInfo({ ...info, phone: e.target.value })}
            containerClassName="mb-0"
            className="rounded-xl border-slate-200 dark:border-slate-700 font-mono"
          />
          <Input
            label="رابط الموقع الإلكتروني الرسمي"
            value={info.website}
            onChange={e => setInfo({ ...info, website: e.target.value })}
            containerClassName="mb-0"
            className="rounded-xl border-slate-200 dark:border-slate-700 font-mono"
          />
          <div className="md:col-span-2">
            <Input
              label="عنوان المقر الرئيسي بالتفصيل"
              value={info.address}
              onChange={e => setInfo({ ...info, address: e.target.value })}
              containerClassName="mb-0"
              className="rounded-xl border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="وصف تعريفي للمنشأة وأهداف العمل"
              value={info.description}
              onChange={e => setInfo({ ...info, description: e.target.value })}
              rows={3}
              className="rounded-2xl border-slate-200 dark:border-slate-700 text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
