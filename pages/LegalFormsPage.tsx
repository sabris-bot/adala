import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { DocumentDuplicateIcon, PlusCircleIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon, ClipboardIcon, PrinterIcon } from '../constants';
import { LegalResource, LegalResourceType, CountryCode, LegalFormCategoryOptions } from '../types'; 
import { countryOptions, legalFormCategoryOptions } from '../constants'; 

const mockLegalFormsData: LegalResource[] = [
  // --- العقود ---
  {
    id: 'tpl_contract_sale_car_01',
    title: 'نموذج عقد بيع سيارة (ابتدائي)',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.CONTRACTS,
    country: 'KW',
    publishDate: '2024-07-10',
    keywords: ['بيع', 'سيارة', 'عقد ابتدائي', 'مركبة'],
    description: 'نموذج أساسي لعقد بيع سيارة بين طرفين، يحدد تفاصيل السيارة، الثمن، وشروط مبدئية.',
    contentTemplate: `عقد بيع سيارة (ابتدائي)\n\nحرر هذا العقد في يوم {{تاريخ_العقد}} الموافق لـ {{تاريخ_العقد_هجري}} بمدينة {{مكان_التوقيع}}.\n\nبين كل من:\nالطرف الأول (البائع): السيد/ {{اسم_البائع}}، كويتي الجنسية، يحمل بطاقة مدنية رقم: {{رقم_مدنية_البائع}}، وعنوانه: {{عنوان_البائع}}.\nالطرف الثاني (المشتري): السيد/ {{اسم_المشتري}}، {{جنسية_المشتري}} الجنسية، يحمل بطاقة مدنية/جواز سفر رقم: {{رقم_هوية_المشتري}}، وعنوانه: {{عنوان_المشتري}}.\n\nتمهيد:\nيمتلك الطرف الأول السيارة الموضحة أدناه ويرغب في بيعها، وقد أبدى الطرف الثاني رغبته في شرائها بعد معاينتها المعاينة التامة النافية للجهالة.\n\nالبند الأول: موضوع العقد\nباع وأسقط وتنازل الطرف الأول بموجب هذا العقد للطرف الثاني القابل لذلك، السيارة بالبيانات التالية:\n- نوع السيارة: {{نوع_السيارة}}\n- موديل السيارة: {{موديل_السيارة}}\n- رقم اللوحة: {{رقم_اللوحة}}\n- رقم الشاصي: {{رقم_الشاصي}}\n- اللون: {{لون_السيارة}}\n\nالبند الثاني: الثمن\nتم هذا البيع نظير ثمن إجمالي وقدره {{مبلغ_البيع_رقما}} د.ك (فقط {{مبلغ_البيع_كتابة}} دينار كويتي)، وقد قام الطرف الثاني بسداد كامل المبلغ للطرف الأول عند التوقيع على هذا العقد، ويعتبر توقيع الطرف الأول على هذا العقد بمثابة مخالصة نهائية بقبض الثمن.\n\nالبند الثالث: المعاينة والضمان\nيقر الطرف الثاني بأنه عاين السيارة موضوع العقد معاينة تامة نافية للجهالة، وقبلها بحالتها الراهنة وقت التعاقد. ويقر الطرف الأول بخلو السيارة من أي رهونات أو حجوزات تمنع نقل ملكيتها للطرف الثاني.\n\nالبند الرابع: نقل الملكية\nيلتزم الطرف الأول بتقديم كافة المستندات اللازمة وتسهيل إجراءات نقل ملكية السيارة باسم الطرف الثاني خلال مدة أقصاها {{مدة_نقل_الملكية}} أيام من تاريخ هذا العقد.\n\nالبند الخامس: أحكام عامة\nتسري أحكام القانون الكويتي على هذا العقد. وفي حالة نشوء أي نزاع بخصوص تفسير أو تنفيذ هذا العقد، يكون الاختصاص القضائي للمحاكم الكويتية.\n\nحرر هذا العقد من نسختين، بيد كل طرف نسخة للعمل بموجبها.\n\nالطرف الأول (البائع)\nالاسم: {{اسم_البائع}}\nالتوقيع: ..........................\n\nالطرف الثاني (المشتري)\nالاسم: {{اسم_المشتري}}\nالتوقيع: ..........................`,
    variables: ['تاريخ_العقد', 'تاريخ_العقد_هجري', 'مكان_التوقيع', 'اسم_البائع', 'رقم_مدنية_البائع', 'عنوان_البائع', 'اسم_المشتري', 'جنسية_المشتري', 'رقم_هوية_المشتري', 'عنوان_المشتري', 'نوع_السيارة', 'موديل_السيارة', 'رقم_اللوحة', 'رقم_الشاصي', 'لون_السيارة', 'مبلغ_البيع_رقما', 'مبلغ_البيع_كتابة', 'مدة_نقل_الملكية'],
    instructions: 'املأ جميع المتغيرات المطلوبة. تأكد من صحة البيانات قبل التوقيع. يمكن إضافة شهود إذا لزم الأمر.',
  },
  {
    id: 'tpl_contract_nda_01',
    title: 'نموذج اتفاقية عدم إفصاح (NDA)',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.CONTRACTS,
    country: 'KW',
    publishDate: '2024-08-07',
    keywords: ['سرية', 'nda', 'عدم إفصاح', 'معلومات'],
    description: 'اتفاقية قانونية بين طرفين للحفاظ على سرية المواد أو المعرفة أو المعلومات التي يتشاركونها لأغراض معينة.',
    contentTemplate: `اتفاقية سرية وعدم إفصاح\n\nبين كل من:\nالطرف الأول: {{اسم_الطرف_الأول}} (الطرف المفصح)\nالطرف الثاني: {{اسم_الطرف_الثاني}} (الطرف المتلقي)\n\nالبند الأول: المعلومات السرية\nيقصد بـ "المعلومات السرية" كافة المعلومات الفنية أو التجارية أو المالية التي يفصح عنها الطرف الأول للطرف الثاني.\n\nالبند الثاني: التزام السرية\nيلتزم الطرف المتلقي بالحفاظ على سرية المعلومات المستلمة وعدم استخدامها إلا للغرض المحدد وهو {{الغرض_من_الإفصاح}}.\n\n(بقية البنود...)`,
    variables: ['اسم_الطرف_الأول', 'اسم_الطرف_الثاني', 'الغرض_من_الإفصاح'],
    instructions: 'حدد الطرف المفصح والمتلقي بدقة، ووصف الغرض من تبادل المعلومات.'
  },
  {
    id: 'tpl_contract_work_01',
    title: 'نموذج عقد عمل محدد المدة',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.CONTRACTS,
    country: 'KW',
    publishDate: '2024-08-01',
    keywords: ['عمل', 'عقد عمل', 'موظف', 'محدد المدة'],
    description: 'عقد عمل يحدد حقوق والتزامات العامل وصاحب العمل وفق قانون العمل الكويتي.',
    contentTemplate: `عقد عمل محدد المدة... (محتوى طويل)`,
    variables: ['اسم_صاحب_العمل', 'اسم_العامل', 'الوظيفة', 'الراتب', 'تاريخ_البدء', 'مدة_العقد'],
  },
  {
    id: 'tpl_contract_partnership_01',
    title: 'نموذج عقد شراكة بين طرفين',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.CONTRACTS,
    country: 'KW',
    publishDate: '2024-08-02',
    keywords: ['شراكة', 'شركة', 'عقد'],
    description: 'عقد تأسيس شراكة بين طرفين يوضح الحصص، الإدارة، وتوزيع الأرباح والخسائر.',
    contentTemplate: `عقد شراكة... (محتوى طويل)`,
    variables: ['اسم_الشريك_الاول', 'اسم_الشريك_الثاني', 'رأس_المال', 'نسبة_الحصص', 'عنوان_الشركة'],
  },
  // --- التوكيلات ---
  {
    id: 'tpl_poa_case_01',
    title: 'نموذج توكيل خاص بالقضايا',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.POWERS_OF_ATTORNEY,
    country: 'KW',
    publishDate: '2024-08-06',
    keywords: ['توكيل', 'قضايا', 'محامي', 'وكالة'],
    description: 'توكيل خاص يمنح المحامي صلاحيات محددة لتمثيل الموكل في قضية معينة أمام جميع المحاكم.',
    contentTemplate: `توكيل خاص\n\nأنا الموقع أدناه، {{اسم_الموكل}}، حامل بطاقة مدنية رقم {{رقم_مدنية_الموكل}}، قد وكلت بموجب هذا التوكيل المحامي الأستاذ/ {{اسم_المحامي}} لينوب عني ويمثلني في الدفاع والمرافعة في القضية رقم {{رقم_القضية}} المرفوعة من/ضد {{اسم_الخصم}}.\n\n(بقية الصلاحيات...)`,
    variables: ['اسم_الموكل', 'رقم_مدنية_الموكل', 'اسم_المحامي', 'رقم_القضية', 'اسم_الخصم'],
    instructions: 'املأ بيانات الموكل والمحامي والقضية بدقة. يمكن تعديل الصلاحيات الممنوحة حسب الحاجة.'
  },
  // --- مذكرات قانونية ---
  {
    id: 'tpl_memo_appeal_01',
    title: 'نموذج مذكرة استئناف حكم مدني',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.LEGAL_MEMOS,
    country: 'KW',
    publishDate: '2024-08-08',
    keywords: ['استئناف', 'مذكرة', 'حكم', 'مدني'],
    description: 'هيكل أساسي لمذكرة استئناف تقدم للمحكمة للطعن على حكم صادر من محكمة أول درجة في نزاع مدني.',
    contentTemplate: `مذكرة بدفاع\nالسيد/ {{اسم_المستأنف}} (مستأنف)\nضــــد\nالسيد/ {{اسم_المستأنف_ضده}} (مستأنف ضده)\n\nفي الاستئناف رقم {{رقم_الاستئناف}} لسنة {{سنة_الاستئناف}}\nالمحدد له جلسة {{تاريخ_الجلسة}}\n\n(الوقائع - أسباب الاستئناف - الطلبات...)`,
    variables: ['اسم_المستأنف', 'اسم_المستأنف_ضده', 'رقم_الاستئناف', 'سنة_الاستئناف', 'تاريخ_الجلسة'],
    instructions: 'يجب أن تركز أسباب الاستئناف على الخطأ في تطبيق القانون أو الفساد في الاستدلال الذي شاب الحكم الابتدائي.'
  },
  // --- صيغ دعاوى وطلبات ---
  {
    id: 'tpl_lawsuit_financial_01',
    title: 'نموذج صيغة دعوى مطالبة مالية',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.LAWSUITS,
    country: 'KW',
    publishDate: '2024-08-03',
    keywords: ['دعوى', 'مطالبة مالية', 'مدني'],
    description: 'صيغة قانونية لرفع دعوى أمام المحكمة للمطالبة بمبلغ مالي (دين).',
    contentTemplate: `صحيفة دعوى مطالبة مالية... (محتوى طويل)`,
    variables: ['اسم_المدعي', 'اسم_المدعى_عليه', 'مبلغ_المطالبة', 'سبب_الدين', 'المحكمة_المختصة'],
  },
  // --- إنذارات وإخطارات ---
  {
    id: 'tpl_notice_eviction_01',
    title: 'نموذج إنذار بإخلاء عين مؤجرة',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.NOTICES,
    country: 'KW',
    publishDate: '2024-08-09',
    keywords: ['إنذار', 'إخلاء', 'إيجار', 'عقار'],
    description: 'إنذار رسمي يوجه للمستأجر لتكليفه بالوفاء بالأجرة المتأخرة أو إخلاء العين المؤجرة.',
    contentTemplate: `إنذار رسمي على يد محضر\n\nبناءً على طلب السيد/ {{اسم_المؤجر}}، موطنه المختار مكتب المحامي {{اسم_المحامي}}.\n\nأنا {{اسم_المحضر}} محضر محكمة {{اسم_المحكمة}} قد انتقلت وأعلنت:\nالسيد/ {{اسم_المستأجر}}، المقيم في {{عنوان_العقار}}.\n\nوأنذرته بالآتي:\nتكليفكم بسداد الأجرة المتأخرة وقدرها {{مبلغ_الأجرة}} د.ك خلال {{مدة_السداد}} أيام أو إخلاء العين المؤجرة.\n\n(بقية التفاصيل...)`,
    variables: ['اسم_المؤجر', 'اسم_المحامي', 'اسم_المحضر', 'اسم_المحكمة', 'اسم_المستأجر', 'عنوان_العقار', 'مبلغ_الأجرة', 'مدة_السداد'],
    instructions: 'يجب أن يتم إعلان هذا الإنذار رسميًا عن طريق مندوب الإعلان (المحضر) ليكون له أثر قانوني.'
  },
  // --- نماذج شركات ---
  {
    id: 'tpl_corporate_resolution_01',
    title: 'نموذج قرار مجلس إدارة',
    type: LegalResourceType.TEMPLATE,
    category: LegalFormCategoryOptions.CORPORATE,
    country: 'KW',
    publishDate: '2024-08-10',
    keywords: ['قرار', 'مجلس إدارة', 'شركة', 'corporate'],
    description: 'نموذج لتوثيق قرار معين تم اتخاذه من قبل مجلس إدارة الشركة بالتمرير أو في اجتماع رسمي.',
    contentTemplate: `قرار مجلس إدارة شركة {{اسم_الشركة}}\n\nاجتمع مجلس الإدارة بتاريخ {{تاريخ_الاجتماع}} وقرر بالإجماع ما يلي:\n\nالمادة الأولى: {{نص_القرار}}.\n\nالمادة الثانية: يفوض السيد/ {{اسم_المفوض}} باتخاذ كافة الإجراءات اللازمة لتنفيذ هذا القرار.\n\nرئيس مجلس الإدارة\n{{اسم_رئيس_المجلس}}`,
    variables: ['اسم_الشركة', 'تاريخ_الاجتماع', 'نص_القرار', 'اسم_المفوض', 'اسم_رئيس_المجلس'],
    instructions: 'يجب أن يكون القرار واضحًا ومحددًا. يتم توقيعه من قبل رئيس المجلس أو من له حق التوقيع حسب عقد التأسيس.'
  },
];


// Template Form Modal
interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: LegalResource) => void;
  initialData?: LegalResource | null;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const getInitialFormData = (): Partial<LegalResource> => {
        return initialData || {
            type: LegalResourceType.TEMPLATE,
            title: '',
            category: legalFormCategoryOptions[0]?.value || '',
            country: 'KW' as CountryCode,
            publishDate: new Date().toISOString().split('T')[0],
            keywords: [],
            contentTemplate: '',
            variables: [],
            instructions: '',
        };
    };

    const [formData, setFormData] = useState<Partial<LegalResource>>(getInitialFormData);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'keywords' || name === 'variables') {
// FIX: The chained methods `.split().map().filter()` on the `value` from the event target were causing a type inference issue for TypeScript. The fix is to break the chain into a separate, explicitly typed `string[]` constant before using it in `setFormData`.
        const values: string[] = String(value).split('\n').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, [name]: values }));
        } else if (name === 'country') {
        setFormData(prev => ({ ...prev, [name]: value as CountryCode }));
        }
        else {
        setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
  
  const handleRelatedDocsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const lines = e.target.value.split('\n');
      const relatedDocs = lines.map(line => {
          const parts = line.split('|'); // title|number|relationType
          return { title: parts[0]?.trim() || '', number: parts[1]?.trim(), relationType: parts[2]?.trim() || 'مرتبط بـ' };
      }).filter(doc => doc.title);
      setFormData(prev => ({ ...prev, relatedDocuments: relatedDocs }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.contentTemplate) {
        alert("يرجى ملء حقلي العنوان ومحتوى النموذج.");
        return;
    }
    onSubmit({ ...formData, type: LegalResourceType.TEMPLATE, publishDate: new Date().toISOString().split('T')[0] } as LegalResource);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'تعديل نموذج قانوني' : 'إضافة نموذج قانوني جديد'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
        <Input name="title" label="عنوان النموذج" value={formData.title || ''} onChange={handleChange} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="category" label="فئة النموذج" value={formData.category || ''} options={legalFormCategoryOptions} onChange={handleChange} required />
          <Select name="country" label="الدولة المعنية" value={formData.country || ''} options={countryOptions} onChange={handleChange} />
        </div>
        <TextArea name="instructions" label="إرشادات استخدام النموذج" value={formData.instructions || ''} onChange={handleChange} rows={3} placeholder="اشرح كيفية استخدام هذا النموذج، أو أي ملاحظات قانونية هامة..."/>
        <TextArea name="contentTemplate" label="محتوى النموذج (استخدم {{متغير}} للمتغيرات)" value={formData.contentTemplate || ''} onChange={handleChange} rows={10} required placeholder="اكتب أو الصق نص النموذج هنا. استخدم أقواسًا مزدوجة متعرجة حول أسماء المتغيرات، مثال: {{اسم_العميل}}."/>
        <TextArea name="variables" label="المتغيرات (كل متغير في سطر جديد، بدون أقواس)" value={formData.variables?.join('\n') || ''} onChange={handleChange} rows={4} placeholder="اسم_العميل\nرقم_القضية\nتاريخ_العقد"/>
        <TextArea name="keywords" label="الكلمات المفتاحية (كل كلمة في سطر جديد)" value={formData.keywords?.join('\n') || ''} onChange={handleChange} rows={3} placeholder="عقد\nبيع\nسيارة"/>
        <div className="flex justify-end space-x-3 space-x-reverse pt-2">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" variant="primary">{initialData ? 'حفظ التعديلات' : 'إضافة النموذج'}</Button>
        </div>
      </form>
    </Modal>
  );
};


// Use Template Modal
interface UseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: LegalResource | null;
}

const UseTemplateModal: React.FC<UseTemplateModalProps> = ({ isOpen, onClose, template }) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [populatedTemplate, setPopulatedTemplate] = useState('');

  useEffect(() => {
    if (template) {
      const initialValues: Record<string, string> = {};
      template.variables?.forEach(v => initialValues[v] = '');
      setVariableValues(initialValues);
      setPopulatedTemplate(template.contentTemplate || '');
    } else {
      setVariableValues({});
      setPopulatedTemplate('');
    }
  }, [template]);

  useEffect(() => {
    if (template?.contentTemplate) {
      let newContent = template.contentTemplate;
      for (const key in variableValues) {
        // Use a placeholder for empty values to make them visible
        const replacement = variableValues[key] || `{{${key}}}`;
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        newContent = newContent.replace(regex, replacement);
      }
      setPopulatedTemplate(newContent);
    }
  }, [variableValues, template]);
  
  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = () => {
      navigator.clipboard.writeText(populatedTemplate.replace(/\{\{.*?\}\}/g, '__________')).then(() => alert('تم نسخ النص إلى الحافظة!')).catch(err => console.error("Copy failed", err));
  };
  
  const handlePrint = () => {
      window.print();
  };

  if (!isOpen || !template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`استخدام نموذج: ${template.title}`} size="xl">
        <style>{`
          @media print {
              .non-printable { display: none !important; }
              #printable-area-wrapper .grid { display: block !important; }
              #printable-template-content {
                 font-family: 'Times New Roman', serif;
                 font-size: 12pt;
                 line-height: 1.5;
                 color: black;
              }
              #printable-template-content .bg-gray-50 { background: white !important; }
              #printable-template-content .border { border: none !important; }
              #printable-template-content h3 { display: none !important; }
              #printable-template-content .print-header { display: block !important; text-align: center; margin-bottom: 2rem; }
          }
          .print-header { display: none; }
        `}</style>
      <div id="printable-area-wrapper">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh]">
            <div className="md:col-span-4 space-y-3 overflow-y-auto p-2 scrollbar-thin non-printable">
              <h3 className="text-md font-semibold text-primary-dark">ملء متغيرات النموذج</h3>
              {(template.description || template.instructions) && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 space-y-1">
                  {template.description && <p><strong>الوصف:</strong> {template.description}</p>}
                  {template.instructions && <p><strong>إرشادات:</strong> {template.instructions}</p>}
                </div>
              )}
              {template.variables && template.variables.length > 0 ? (
                template.variables.map(variable => (
                  <Input
                    key={variable}
                    label={variable.replace(/_/g, ' ')}
                    value={variableValues[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    containerClassName="mb-2"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">هذا النموذج لا يحتوي على متغيرات قابلة للتعبئة.</p>
              )}
            </div>
            
            <div className="md:col-span-8 space-y-3 overflow-y-auto p-2">
               <h3 className="text-md font-semibold text-primary-dark non-printable">معاينة النص النهائي</h3>
               <div id="printable-template-content">
                    <div className="print-header">
                        <h2 className="text-xl font-bold">{template.title}</h2>
                        <p className="text-sm">تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md h-full text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {populatedTemplate}
                    </div>
               </div>
            </div>
          </div>
        <div className="flex justify-end space-x-2 space-x-reverse pt-4 border-t mt-4 non-printable">
            <Button onClick={handleCopyToClipboard} variant="outline" leftIcon={<ClipboardIcon className="w-4"/>}>نسخ النص</Button>
            <Button onClick={handlePrint} variant="primary" leftIcon={<PrinterIcon className="w-4"/>}>طباعة</Button>
        </div>
      </div>
    </Modal>
  );
};


const LegalFormsPage: React.FC = () => {
    const [templates, setTemplates] = useState<LegalResource[]>(mockLegalFormsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<LegalFormCategoryOptions | ''>('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<LegalResource | null>(null);
    const [usingTemplate, setUsingTemplate] = useState<LegalResource | null>(null);
    
    const filteredTemplates = useMemo(() => {
        return templates.filter(template => 
            (template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (template.keywords && template.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())))
            ) && (filterCategory ? template.category === filterCategory : true)
        ).sort((a,b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }, [templates, searchTerm, filterCategory]);

    const groupedTemplates = useMemo(() => {
        return filteredTemplates.reduce((acc, template) => {
            const category = template.category || LegalFormCategoryOptions.OTHER;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(template);
            return acc;
        }, {} as Record<string, LegalResource[]>);
    }, [filteredTemplates]);
    
    const handleAddTemplate = () => { setEditingTemplate(null); setIsFormModalOpen(true); };
    const handleEditTemplate = (template: LegalResource) => { setEditingTemplate(template); setIsFormModalOpen(true); };
    const handleUseTemplate = (template: LegalResource) => { setUsingTemplate(template); };
    const handleDeleteTemplate = useCallback((templateId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا النموذج؟")) {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        }
    }, []);
    const handleFormSubmit = (data: LegalResource) => {
        if (editingTemplate?.id) {
            setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data : t));
        } else {
            const newTemplate = { ...data, id: `tpl-${Date.now()}` };
            setTemplates(prev => [newTemplate, ...prev]);
        }
        setIsFormModalOpen(false);
        setEditingTemplate(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                    <DocumentDuplicateIcon className="w-8 h-8 text-primary me-3" />
                    <h1 className="text-3xl font-bold text-primary-dark">مكتبة النماذج والصيغ القانونية</h1>
                </div>
                <Button onClick={handleAddTemplate} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>إضافة نموذج جديد</Button>
            </div>
            
            <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-700 leading-relaxed">
                        أدر مكتبتك من النماذج القانونية الجاهزة للاستخدام. يمكنك إنشاء وتعديل وحفظ النماذج شائعة الاستخدام (مثل العقود، المذكرات، الإنذارات)، وتعبئتها بالبيانات المطلوبة بسهولة عند الحاجة، ثم طباعتها أو نسخها.
                    </p>
                </div>
            </Card>

            <Card>
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <Input placeholder="ابحث بالكلمات المفتاحية (عنوان، وصف...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} containerClassName="mb-4" />
                    <Select label="تصفية حسب الفئة" options={[{value: '', label: 'الكل'}, ...legalFormCategoryOptions]} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as LegalFormCategoryOptions | '')} containerClassName="mb-0"/>
                </div>
                
                 <div className="space-y-8">
                    {Object.entries(groupedTemplates).length > 0 ? (
                        Object.entries(groupedTemplates).map(([category, templatesInCategory]) => (
                            <div key={category}>
                                <h3 className="text-xl font-semibold text-primary-dark mb-3 border-b-2 border-primary-light pb-1">
                                    {legalFormCategoryOptions.find(opt => opt.value === category)?.label || category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {templatesInCategory.map(template => (
                                        <Card key={template.id} title={template.title} className="hover:shadow-lg transition-shadow flex flex-col">
                                            <div className="flex-grow">
                                                <p className="text-xs text-gray-500 mb-2">{template.category}</p>
                                                <p className="text-sm text-gray-700 line-clamp-3">{template.description}</p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                                <Button size="sm" onClick={() => handleUseTemplate(template)}>استخدام النموذج</Button>
                                                <div className="flex space-x-1 space-x-reverse">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                           <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            لا توجد نماذج تطابق معايير البحث الحالية.
                        </div>
                    )}
                </div>
            </Card>
            
            <TemplateFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingTemplate} />
            <UseTemplateModal isOpen={!!usingTemplate} onClose={() => setUsingTemplate(null)} template={usingTemplate} />
        </div>
    );
};

export default LegalFormsPage;
