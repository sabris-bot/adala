import React, { useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  FileText, Printer, Copy, RotateCcw, Edit3, 
  BookOpen, Sparkles, Building, UserCheck 
} from 'lucide-react';

interface LeaveTemplatesTabProps {
  lang: 'ar' | 'en';
  activeTemplateId: string;
  setActiveTemplateId: (id: string) => void;
  templateInputs: {
    companyName: string;
    employeeName: string;
    jobTitle: string;
    deptName: string;
    startDate: string;
    endDate: string;
    durationDays: string;
    refNumber: string;
    reason: string;
    signatory: string;
    managerComments: string;
  };
  setTemplateInputs: (inputs: any) => void;
  compiledTemplateText: string;
  onPrint: () => void;
  onCopy: () => void;
  editableTemplates: any[];
}

export const LeaveTemplatesTab: React.FC<LeaveTemplatesTabProps> = ({
  lang,
  activeTemplateId,
  setActiveTemplateId,
  templateInputs,
  setTemplateInputs,
  compiledTemplateText,
  onPrint,
  onCopy,
  editableTemplates
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Left panel: Form editor and templates checklist (5 cols) */}
      <div className="lg:col-span-5 space-y-4 text-right">
        
        {/* Templates Selector */}
        <Card title={isAr ? 'اختر النموذج القضائي/الإداري' : 'Select Legal/Admin Template'}>
          <div className="space-y-2 mt-2">
            {editableTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplateId(t.id)}
                className={`w-full p-3 rounded-xl border text-right transition flex items-center justify-between gap-2 text-xs font-bold ${
                  activeTemplateId === t.id
                    ? 'bg-primary/5 border-primary text-primary dark:bg-primary-dark/20'
                    : 'border-slate-150 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-slate-850 dark:text-gray-150">{isAr ? t.titleAr : t.titleEn}</div>
                  <div className="text-[10px] text-gray-400 font-normal mt-0.5">{isAr ? t.categoryAr : t.categoryEn}</div>
                </div>
                <BookOpen className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </Card>

        {/* Dynamic Fields Binder */}
        <Card title={isAr ? 'تخصيص وتعبئة متغيرات الكتاب' : 'Customize Document Fields'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'الرقم الإشاري / الصادر' : 'Reference Number'}</label>
              <input
                type="text"
                value={templateInputs.refNumber}
                onChange={(e) => setTemplateInputs({ ...templateInputs, refNumber: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'الشركة / المكتب الفرعي' : 'Company Name'}</label>
              <input
                type="text"
                value={templateInputs.companyName}
                onChange={(e) => setTemplateInputs({ ...templateInputs, companyName: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'اسم الموظف المعني' : 'Employee Name'}</label>
              <input
                type="text"
                value={templateInputs.employeeName}
                onChange={(e) => setTemplateInputs({ ...templateInputs, employeeName: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</label>
              <input
                type="text"
                value={templateInputs.jobTitle}
                onChange={(e) => setTemplateInputs({ ...templateInputs, jobTitle: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'تاريخ البدء' : 'Start Date'}</label>
              <input
                type="date"
                value={templateInputs.startDate}
                onChange={(e) => setTemplateInputs({ ...templateInputs, startDate: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'تاريخ الانتهاء' : 'End Date'}</label>
              <input
                type="date"
                value={templateInputs.endDate}
                onChange={(e) => setTemplateInputs({ ...templateInputs, endDate: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'مدة الإجازة (يوم)' : 'Duration (Days)'}</label>
              <input
                type="number"
                value={templateInputs.durationDays}
                onChange={(e) => setTemplateInputs({ ...templateInputs, durationDays: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card font-bold text-rose-600"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'المبررات والأسانيد' : 'Justification Reason'}</label>
              <input
                type="text"
                value={templateInputs.reason}
                onChange={(e) => setTemplateInputs({ ...templateInputs, reason: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'الموقع المعتمد' : 'Signatory Manager'}</label>
              <input
                type="text"
                value={templateInputs.signatory}
                onChange={(e) => setTemplateInputs({ ...templateInputs, signatory: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-gray-500">{isAr ? 'هوامش وملاحظات الإدارة' : 'Management Margins'}</label>
              <textarea
                value={templateInputs.managerComments}
                onChange={(e) => setTemplateInputs({ ...templateInputs, managerComments: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-lg bg-neutral-card dark:bg-dm-card h-14"
              />
            </div>

          </div>
        </Card>

      </div>

      {/* Right panel: High-fidelity stationary preview (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <Card 
          title={isAr ? 'المستند المطبوع النهائي' : 'Printable Stationary Document'}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Copy className="w-4 h-4" />}
                onClick={onCopy}
              >
                {isAr ? 'نسخ النص' : 'Copy'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={onPrint}
              >
                {isAr ? 'طباعة الكتاب الرسمي' : 'Print Official Letter'}
              </Button>
            </div>
          }
        >
          {/* Real-life Stationary Sheet Mock */}
          <div 
            id="printable-template-area" 
            className="bg-white p-8 border rounded-xl shadow-lg font-sans text-slate-900 mx-auto max-w-2xl text-right text-black relative"
            dir="rtl"
          >
            
            {/* Stamp seal watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none rotate-12">
              <div className="w-64 h-64 rounded-full border-8 border-[#00796B] flex items-center justify-center p-4">
                <span className="text-center font-black text-2xl tracking-widest text-[#00796B]">الوجيان وصبري شطا</span>
              </div>
            </div>

            {/* Document Letterhead */}
            <div className="border-b-4 border-double border-[#00796B] pb-4 flex justify-between items-center text-slate-850">
              <div className="text-right">
                <h1 className="text-sm font-extrabold text-[#00796B] leading-tight">مكتب الوجيان ومكتب صبري شطا</h1>
                <p className="text-[10px] text-gray-500 font-bold mt-0.5">للمحاماة والاستشارات القانونية والتحكيم</p>
                <p className="text-[8px] text-gray-400">دولة الكويت - مقيد أمام المحكمة الدستورية والتمييز</p>
              </div>
              <div className="text-left shrink-0">
                <div className="border-2 border-[#00796B] p-1 px-2 rounded text-center">
                  <span className="block text-[10px] font-black text-[#00796B] leading-none">{isAr ? 'الكتاب الإداري المالي' : 'HR Ledger Book'}</span>
                  <span className="block text-[7px] text-gray-400 mt-1 font-mono tracking-wider">ADALA LEGAL ERP v3</span>
                </div>
              </div>
            </div>

            {/* Compiled Text Body */}
            <div className="my-6 min-h-[340px] text-xs leading-relaxed font-sans whitespace-pre-wrap text-slate-850">
              {compiledTemplateText}
            </div>

            {/* Bottom Stationary signatures and seals */}
            <div className="grid grid-cols-2 gap-4 text-center mt-12 pt-4 border-t border-dashed border-gray-250 text-[10px]">
              <div>
                <span className="text-gray-400 block mb-6">{isAr ? 'توقيع وتفويض الموظف:' : 'Employee Authorization:'}</span>
                <span className="font-bold text-slate-800 block underline">{templateInputs.employeeName}</span>
                <span className="text-[8px] text-gray-400 block mt-0.5">{templateInputs.jobTitle}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-6">{isAr ? 'الاعتماد المكتبي والتصديق:' : 'Corporate Attestation:'}</span>
                <span className="font-bold text-slate-800 block underline">{templateInputs.signatory}</span>
                <span className="text-[8px] text-gray-400 block mt-0.5">{isAr ? 'مكتب الشؤون القانونية الكويتية' : 'Kuwait Compliance Office'}</span>
              </div>
            </div>

          </div>
        </Card>
      </div>

    </div>
  );
};
