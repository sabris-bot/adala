import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DocumentTextIcon, SparklesIcon, FileEditIcon } from '../../../constants';

interface DocumentGeneratorTabProps {
  translate: (ar: string, en: string) => string;
  onTriggerPrint: (item: any) => void;
  triggerToast: (title: string, desc: string, type: 'success' | 'warning' | 'error') => void;
}

export const DocumentGeneratorTab: React.FC<DocumentGeneratorTabProps> = ({
  translate,
  onTriggerPrint,
  triggerToast
}) => {
  const [template, setTemplate] = useState<'Commitment' | 'Violation' | 'Declaration' | 'Audit' | 'DisciplinaryLetter'>('Declaration');
  const [targetParty, setTargetParty] = useState('');
  const [refCode, setRefCode] = useState(`KW-GOV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [officialBoard, setOfficialBoard] = useState('');
  const [detailsText, setDetailsText] = useState('');
  const [assignedCounsel, setAssignedCounsel] = useState('');

  // Settle predefined prompts on template change
  const handleTemplateChange = (temp: typeof template) => {
    setTemplate(temp);
    if (temp === 'Declaration') {
      setDetailsText(translate(
        'نشهد نحن في الإدارة القانونية بمكتب عدالة بأن منظومة الشركة وجميع أنظمتها الحوكمية تتطابق بالكامل مع معايير مكافحة غسيل الأموال وتمويل الإرهاب AML-CFT والبنود الاحترازية المقررة بهيئة أسواق المال.',
        'We certify that our governance frameworks fully align with CMA policies and AML-CFT provisions guidelines.'
      ));
      setOfficialBoard(translate('هيئة أسواق المال والجرائم المالية', 'Capital Markets Authority & Financial Crimes Council'));
    } else if (temp === 'Commitment') {
      setDetailsText(translate(
        'يتعهد الطرف المذكور أدناه بموجب هذا الصند بالتزام تلافي معايير الخلل البيئية وتقديم التقارير الفنية الدورية للهيئة العامة للبيئة في دولة الكويت قبل الوقت المحدد لتلافي الغرامة.',
        'The undersigned commits to remediate operational metrics anomalies and send periodic technical audits to KEPA before due deadlines.'
      ));
      setOfficialBoard(translate('الهيئة العامة للبيئة الكويتيّة', 'Kuwait Environment Public Authority - KEPA'));
    } else if (temp === 'Violation') {
      setDetailsText(translate(
        'رداً على إشعار الغرامة المستلم، نرفع بموجبه تظلماً رسمياً مستعجلاً استناداً إلى تعديلات قانون الشركات واللوائح الحوكمة لتجميد أو خفض المطالبات المالية الصادرة لتأخر تقديم القوائم المالية المستحقة.',
        'Responding to the invoice ticket received, we hereby lodge an urgent administrative appeal resting on Corporate Law revisions to waive computed penalties.'
      ));
      setOfficialBoard(translate('هيئة أسواق المال ولجنة التظلمات', 'CMA & Grievances Committee'));
    } else if (temp === 'Audit') {
      setDetailsText(translate(
        'محضر اجتماع ومراجعة ماليّة إدارية داخلية لمراجعة أخطاء الحسابات المحصورة بفرع حولي وضوابط الخزينة وإعلان قائمة التوصيات لضمان حظر مخالفات الصرف العشوائي خارج السند المقر.',
        'Minutes and findings from the internal operational audit for Hawally branch to monitor financial compliance and lock arbitrary cash flows.'
      ));
      setOfficialBoard(translate('جمعية المحاسبين والمدققين الكويتية', 'Kuwait Association of Auditors'));
    } else {
      setDetailsText(translate(
        'بناء على توصيات لجنة التحقيق، نوجه بموجب هذا الصند إنذاراً نهائياً مسجلاً لتجاوز الصلاحيات الإدارية المنصوص عليها بلائحة العمل وملازمة التوقيع على محاضر الإقرار والتعهد لتلافي جزاء الفصل المباشر.',
        'Based on disciplinary findings, the HR committee issues a final warnings claim regarding administrative code breaches; signing commitments is required.'
      ));
      setOfficialBoard(translate('لجنة شؤون الموظفين بوزارة الشؤون', 'Internal Disciplinary and Labor Relations panel'));
    }
  };

  const handleCompileDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetParty || !detailsText) {
      triggerToast(
        translate('خطأ بالبيانات', 'Form Incomplete'),
        translate('يرجى ملء مسمى الجهة وشروح الوثيقة أولاً لتوليد الصك.', 'Please specify target recipient and details text to compile document.'),
        'warning'
      );
      return;
    }

    // Construct a printable conform item matching modal signature layout
    const compiledItem = {
      id: refCode || 'KW-C902',
      title: translate(
        template === 'Declaration' ? `إقرار مطابقة لـ ${targetParty}` :
        template === 'Commitment' ? `كتاب تعهد حوكمي لـ ${targetParty}` :
        template === 'Violation' ? `رد تظلم غرامة لـ ${targetParty}` :
        template === 'Audit' ? `محضر تدقيق إداري لـ ${targetParty}` :
        `كتاب لفت نظر إداري لـ ${targetParty}`,
        `${template} Document for ${targetParty}`
      ),
      category: translate(
        template === 'Declaration' ? 'إعلانات وإقرارات حوكمية' :
        template === 'Commitment' ? 'التزامات وتعهدات رسمية' :
        template === 'Violation' ? 'ردود وتظلمات قانونية' :
        template === 'Audit' ? 'محاضر تدقيق ورقابة مستقلة' :
        'لوائح وإجراءات تأديبية',
        template
      ),
      authority: officialBoard,
      riskLevel: template === 'Violation' || template === 'DisciplinaryLetter' ? 'High' : 'Medium',
      dueDate: new Date().toLocaleDateString('en-GB'),
      assignedTo: assignedCounsel || translate('المستشار القانوني صبري شطا', 'General Counsel Sabri Shatta'),
      description: detailsText
    };

    onTriggerPrint({ item: compiledItem, submodule: 'documents' });
    triggerToast(
      translate('تم التجميع بنجاح', 'Compiled Successfully'),
      translate('تم ربط القوالب الرسمية وفتح نافذة الفحص والتوثيق والختم.', 'Loaded official certificate template with signing, seals and print controls.'),
      'success'
    );
  };

  return (
    <div className="bg-white dark:bg-dm-card p-6 rounded-[32xl] border border-gray-150/45 dark:border-gray-800 shadow-xs">
      
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl">
          <DocumentTextIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-gray-900 dark:text-dm-text">{translate('منشئ صكوك التقارير والقرارات والوثائق الرسمية', 'Certified Group Document and Official Forms Builder')}</h4>
          <p className="text-[10px] text-gray-400 font-bold">{translate('مكتبة التعهدات وقرارات المطابقة وإعتمادات عدالة الموقرة', 'Instantly draft letters, undertakings, or declarations matching Kuwait specifications')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Templates Selection sidebar panel (1 Col) */}
        <div className="md:col-span-1 space-y-4">
          <label className="text-xs font-black text-gray-500 block uppercase">{translate('اختيار قالب الوثيقة الرئيسي', 'Select Form Template Outline')}</label>
          <div className="flex flex-col gap-2">
            {[
              { key: 'Declaration', ar: 'إقرار مطابقة حوكمي الصنع', en: 'Conformity Declaration Card', desc: 'Declaration of compliance with CMA/CBK policies' },
              { key: 'Commitment', ar: 'كتاب كفالة وتعهد بالامتثال', en: 'Official Undertaking Bond', desc: 'Commitment letter to regulatory bodies or authorities' },
              { key: 'Violation', ar: 'تظلم رسمي لوقف أو تخفيض الغرامة', en: 'Appeals / Fine Mitigation Letter', desc: 'Waiver appeal letter against government tickets' },
              { key: 'Audit', ar: 'محضر اجتماع وتدقيق إداري متبادل', en: 'Operational Audit Minutes Form', desc: 'Registry checklist and minutes of independent review' },
              { key: 'DisciplinaryLetter', ar: 'خطاب لفت نظر وتأديب وظيفي', en: 'Employment Disciplinary Letter', desc: 'Formal Warning regarding staff administrative breaches' }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTemplateChange(item.key as any)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-1 ${
                  template === item.key 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-dark-border text-gray-800 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black">{translate(item.ar, item.en)}</span>
                </div>
                <span className={`text-[9px] font-bold ${template === item.key ? 'text-indigo-200' : 'text-gray-400'}`}>{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Drafting inputs section (2 Cols) */}
        <div className="md:col-span-2 bg-gray-50/75 dark:bg-dm-background p-6 rounded-3xl border border-gray-100 dark:border-gray-850">
          <form onSubmit={handleCompileDocument} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">{translate('الجهة / الفرد المستهدف بالصك', 'Target Recipient / Department')}</label>
                <input 
                  type="text" 
                  value={targetParty} 
                  onChange={(e) => setTargetParty(e.target.value)}
                  placeholder={translate('مثال: شركة عدالة العقارية، إدارة الموارد البشرية إلخ', 'e.g., Adala Real Estate, HR Department')}
                  className="bg-white dark:bg-dm-card p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">{translate('ترميز المعيار السري المولد', 'Generated Administrative Code')}</label>
                <input 
                  type="text" 
                  value={refCode} 
                  onChange={(e) => setRefCode(e.target.value)}
                  className="bg-white dark:bg-dm-card p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-blue-700 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">{translate('الجهة الرسمية المستحقة (وزارة التجارة، المركزي إلخ)', 'Official Regulator / Issuing Council')}</label>
                <input 
                  type="text" 
                  value={officialBoard} 
                  onChange={(e) => setOfficialBoard(e.target.value)}
                  className="bg-white dark:bg-dm-card p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">{translate('مستشار المطابقة المندوب للتوقيع والتحقيق', 'Assigned Corporate Counsel signee')}</label>
                <input 
                  type="text" 
                  value={assignedCounsel} 
                  onChange={(e) => setAssignedCounsel(e.target.value)}
                  placeholder={translate('المستشار صبري شطا شريك حوكمة المجموع', 'Counsel Sabri Shatta')}
                  className="bg-white dark:bg-dm-card p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">{translate('مضمون الشروح والملاحظات القانونية والتدابير الاستيعابية للشركة', 'Scope Details Narrative & Official Decisions text')}</label>
              <textarea 
                rows={5}
                value={detailsText} 
                onChange={(e) => setDetailsText(e.target.value)}
                className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-slate-300 focus:outline-hidden focus:border-indigo-600 leading-relaxed"
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-150/40 flex justify-end">
              <button 
                type="submit"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all"
              >
                <SparklesIcon className="w-4.5 h-4.5" />
                {translate('إنشاء الصك المعتمد التفاعلي والمبرم فورا', 'Compile Template & Open verified Preview')}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
