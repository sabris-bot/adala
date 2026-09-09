import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import { 
    PlusCircleIcon, SparklesIcon, MagnifyingGlassIcon, ChevronDownIcon, EyeIcon, 
    DocumentDuplicateIcon, TrashIcon, PencilIcon, ClockIcon, PaperClipIcon, XIcon,
    CheckCircleIcon, InformationCircleIcon, ArrowDownTrayIcon, ArrowPathIcon,
    CloudArrowUpIcon, PrinterIcon, Squares2X2Icon, ListBulletIcon, PlusIcon,
    StarIcon, ScaleIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon, GavelIcon,
    BuildingLibraryIcon, IdentificationIcon, BriefcaseIcon, LinkIcon, ShareIcon,
    SendIcon, ChatBubbleLeftRightIcon, HistoryIcon, CreditCardIcon
} from '../constants';
import PrintHeader from '../components/ui/PrintHeader';
import { LegalResource, LegalResourceType, LawBranch, CountryCode } from '../types';
import { 
    legalFormCategoryOptions, 
    lawBranchOptions, 
    countryOptions 
} from '../constants';
import { geminiService } from '../services/geminiService';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';

// --- RICH COMPREHENSIVE REGIONAL WORKSPACE LEGAL TEMPLATES ---
const INITIAL_LEGAL_FORMS: LegalResource[] = [
  {
    id: 'financial-claim-suit',
    title: 'صحيفة دعوى مطالبة مالية واعتداد بنظام ندب الخبير الكويتي',
    type: LegalResourceType.TEMPLATE,
    category: 'LITIGATION',
    country: 'KW' as CountryCode,
    publishDate: '2026-05-15',
    keywords: ['مطالبة مالية', 'قيد دعوى', 'ندب خبير', 'الكويت', 'مقاولة'],
    description: 'صحيفة دعوى نموذجية لمقاضاة الشركات والأفراد المتخلفين عن سداد عقود التوريد والمقاولات مع إرفاق طلب ندب قضاة الدائرة ومحاسب عدلي المنتدب.',
    contentTemplate: `إنه في يوم الكائن الموافق لعام ٢٠٢٦، بناءً على طلب السيد/ {{اسم_المدعي}}، المقيم في {{عنوان_المدعي}}، ورقم هويته المدنية {{الهوية_المدنية}}، ومحله المختار مكتب المستشار صبري شطا للمحاماة بمجمع محاكم الرقعي.
أنا محضر محكمة {{المحكمة_الجزئية}} الكلية بدولة الكويت قد انتقلت وأعلنت:
السيد/ {{المدعى_عليه}}، المقيم في {{عنوان_المدعى_عليه}}، والمطالب بأداء المستحقات موضوع النزاع.

الموضوع:
بموجب العقد المؤرخ في {{تاريخ_العقد}}، التزم المعلن إليه الأول (المدعى عليه) بأن يؤدي للمدعي مبلغاً وقدره {{المبلغ}} دينار كويتي مقابل {{الخدمة_المقدمة}}. ويشترط المدعي سداد المديونية فور التسليم وهو ما تم توثيقه. وحيث تقاعس المدعى عليه وغلت يده عن الوفاء رغم الإنذارات الرسمية.

بناءً عليه:
أنا المحضر سالف الذكر قد انتقلت وسلمت المعلن إليه صورة من هذه الصحيفة وكلفته الحضور للمثول أمام محكمة الكويت الكلية للحكم بـ:
أولاً: ندب خبير هندسي وحسابي من وزارة العدل لتصفية الحساب بين الطرفين.
ثانياً: إلزام المدعى عليه بسداد مبلغ {{المبلغ}} د.ك مع الفائدة القانونية 7%.
ثالثاً: إلزام المدعى عليه بمصاريف المذكرة وأتعاب المحاماة الفعلية.`,
    variables: ['اسم_المدعي', 'عنوان_المدعي', 'الهوية_المدنية', 'المحكمة_الجزئية', 'المدعى_عليه', 'عنوان_المدعى_عليه', 'تاريخ_العقد', 'المبلغ', 'الخدمة_المقدمة'],
    instructions: 'يجب تقديم أصل العقد المالي بالإضافة إلى كشف الحساب المصرفي المعتد به ورسوم القضية بقيمة ٢ % من المديونية.'
  },
  {
    id: 'ksa-lease-agreement',
    title: 'عقد إيجار عقار سكني موحد (المقاصد المدنية السعودية والخليجية)',
    type: LegalResourceType.TEMPLATE,
    category: 'REAL_ESTATE',
    country: 'SA' as CountryCode,
    publishDate: '2026-03-10',
    keywords: ['عقد إيجار', 'السعودية', 'ترخيص عقاري', 'سكن متكامل'],
    description: 'النموذج القياسي لعقود الإيجار السكنية المتكاملة مع بيان بنود الصيانة، المقابل السنوي، وتأمين التلفيات.',
    contentTemplate: `بعون الله وتوفيقه، تم إبرام هذا العقد بالرياض بين:
الطرف الأول (المؤجر): السيد/ {{اسم_المؤجر}}، المقيم في {{مقر_المؤجر}}، الحامل لبطاقة هويته الوطنية رقم {{هوية_المؤجر}}.
الطرف الثاني (المستأجر): السيد/ {{اسم_المستأجر}}، المقيم في {{عنوان_المستأجر}}، الحامل لهوية وطنية سارية {{هوية_المستأجر}}.

موضوع الإيجار وبنود التعاقد:
أجر الطرف الأول للطرف الثاني الوحدة السكنية رقم {{رقم_الشقة}} الكائنة بعمارة {{اسم_العقار}} بحي {{الحي}} لمدة سنة تبدأ من {{تاريخ_البدء}}.
يلتزم المستأجر بسداد المقابل الإيجاري الإجمالي وقدره {{القيمة_السنوية}} ريال سعودي مقسطة على {{عدد_الدفعات}} دفعات دورية. 
كما يتعهد بدفع تأمين ضمان تلفيات بقيمة {{مبلغ_التأمين}} ريال يُرد عند الإخلاء وتسليم العين المؤجرة بحالتها الأصلية الخالية من الأضرار الجسيمة.

التوقيعات:
توقيع المؤجر: __________________
توقيع المستأجر: __________________`,
    variables: ['اسم_المؤجر', 'مقر_المؤجر', 'هوية_المؤجر', 'اسم_المستأجر', 'عنوان_المستأجر', 'هوية_المستأجر', 'رقم_الشقة', 'اسم_العقار', 'الحي', 'تاريخ_البدء', 'القيمة_السنوية', 'عدد_الدفعات', 'مبلغ_التأمين'],
    instructions: 'يسجل هذا العقد فور التوقيع في شبكة إيجار الوطنية لضمان اعتماده سنداً تنفيذياً أمام قاضي التنفيذ.'
  },
  {
    id: 'hr-disciplinary-warning',
    title: 'إنذار تأديبي بفصل موظف ولائحة تحقيق داخلي (قوانين العمل)',
    type: LegalResourceType.TEMPLATE,
    category: 'HR',
    country: 'KW' as CountryCode,
    publishDate: '2026-04-20',
    keywords: ['إنذار موظف', 'تحقيق تأديبي', 'قانون العمل الكويتي', 'الغياب'],
    description: 'نموذج الإنذار التأديبي الأول للموظف المتغيب عن العمل أو المخل بسلوكه الوظيفي، متوافقاً مع المادة 85 من قانون العمل الكويتي.',
    contentTemplate: `إدارة الموارد البشرية والشؤون القانونية بـ {{اسم_المنشأة}}
التاريخ الفعلي: {{تاريخ_الإنذار}}

إنذار رسمي أول بالتقيد والالتزام بوجه العمل
إلى السيد الموظف/ {{اسم_الموظف}}، بوظيفة {{المسمى_الوظيفي}}، بالقسم {{الإدارة}}.

بموجب هذا المستند القانوني، نوجه لسيادتكم إنذاراً رسمياً أولاً بسبب تفريطكم وإخلالكم بواجبات الخدمة الموكلة لكم والمتمثلة في: {{بند_المخالفة}} وذلك في تاريخ {{تاريخ_الواقعة}}.
وحيث أن هذا السلوك مخل باللوائح والأنظمة الداخلية للشركة ومخالف لأحكام المادة 85 من قانون العمل الكويتي رقم 6 لسنة 2010.

بناءً عليه:
يتوجب عليكم الحضور أمام لجنة الشؤون القانونية والتحقيق بالمنشأة بجلسة يوم {{تاريخ_جلسة_التحقيق}} في تمام الساعة {{ساعة_الجلسة}} لسماع أقوالكم ودفاعكم.
في حالة تخلفكم أو الإحجام عن تبرير هذا التقاعس، ستقوم الشركة بإنهاء خدماتكم فوراً مع حرمانكم من مستحقات مكافأة نهاية الخدمة طبقاً للوائح النافذة.

المعتمد القانوني للمنشأة: __________________`,
    variables: ['اسم_المنشأة', 'تاريخ_الإنذار', 'اسم_الموظف', 'المسمى_الوظيفي', 'الإدارة', 'بند_المخالفة', 'تاريخ_الواقعة', 'تاريخ_جلسة_التحقيق', 'ساعة_الجلسة'],
    instructions: 'يسلم هذا الإنذار للموظف يداً بيد أو يرسل بخطاب مسجل بعلم الوصول على عنوانه الثابت بملفه المكتبي خلال خمسة أيام كأقصى حد.'
  },
  {
    id: 'egypt-performance-order',
    title: 'طلب أمر أداء مستعجل برسم الوفاء بقيمة كمبيالة (القانون المصري)',
    type: LegalResourceType.TEMPLATE,
    category: 'LITIGATION',
    country: 'EG' as CountryCode,
    publishDate: '2026-02-18',
    keywords: ['أمر أداء', 'كمبيالة', 'القانون المصري', 'قاضي الأمور المستعجلة'],
    description: 'طلب موجه لقاضي الأمور الوقتية لإصدار قرار تنفيذي فوري بدفع كمبيالة مستحقة ومعلومة المقدار وثابتة بالكتابة.',
    contentTemplate: `السيد الأستاذ المستشار/ رئيس محكمة {{المحكمة_المصرية}} الجزئية بصفته قاضياً للأمور الوقتية.
مقدمه لسيادتكم الأستاذ/ صبري شطا المحامي، الوكيل عن السيد/ {{اسم_الدائن}} بموجب توكيل رسمي عام قضايا {{رقم_التوكيل}}.

ضد:
السيد/ {{اسم_المدين}}، المقيم في {{عنوان_المدين}}، والمهنة {{مهنة_المدين}}.

الوقائع والأسباب:
تتمثل مطالبة الطالب بإحدى الديون المدنية الثابتة بالكتابة وحالّة الأداء بموجب {{سند_الدين}} المؤرخ في {{تاريخ_سند_الدين}} والذي وقع عليه المنذر إليه بقيمة مالية جوهرية وقدرها {{مبلغ_الدين}} جنيه مصري.
وحيث أن الطالب قد وجه تكليفاً رسمياً بالوفاء للمدين بموجب إنذار على يد محضر في تاريخ {{تاريخ_الإنذار_المسبق}}، إلا أنه تمنع عن السداد متعمداً الإضرار بالحق المالي.

لذلك:
نلتمس من سيادتكم إصدار أمركم العادل لـ:
أولاً: إلزام المدين بأن يؤدي للطالب مبلغ وقدره {{مبلغ_الدين}} ج.م والفوائد القانونية بواقع 4% من تاريخ استحقاق الدين.
ثانياً: شمول الأمر بالنفاذ المعجل بلا كفالة وبالمصاريف الفعلية.`,
    variables: ['المحكمة_المصرية', 'اسم_الدائن', 'رقم_التوكيل', 'اسم_المدين', 'عنوان_المدين', 'مهنة_المدين', 'سند_الدين', 'تاريخ_سند_الدين', 'مبلغ_الدين', 'تاريخ_الإنذار_المسبق'],
    instructions: 'يرفق بالطلب أصل الكمبيالة أو السند المكتوب بالإضافة إلى أصل التكليف بالوفاء المسلم يداً بيد أو الموجه رسمياً.'
  },
  {
    id: 'prosecution-transmittal-memo',
    title: 'كتاب تغطية وإحالة مستندات وتوصيات للنيابة العامة',
    type: LegalResourceType.TEMPLATE,
    category: 'LITIGATION',
    country: 'KW' as CountryCode,
    publishDate: '2026-08-09',
    keywords: ['النيابة العامة', 'كتاب تغطية', 'إحالة مستندات', 'توصيات', 'صبري شطا'],
    description: 'كتاب تغطية رسمي موجه لمكتب أحمد الخشتي وأسماء الجري للرفع للنيابة العامة مرفقاً به المستندات والتوصيات القانونية.',
    contentTemplate: `السادة / مكتب أحمد الخشتي وأسماء الجري محامون ومستشارون قانونيون            المحترمين

عناية الأستاذ/ علي الأنصاري                                                                 المحترم

تحية طيبة وبعد ،،

  نرفق لكم طيه كافة التوصيات والمستندات المطلوبة وذلك للاطلاع وتقديمها إلي النيابة حسب رأي النيابة المرفق .  

                                                                                وتفضلوا بقبول وافر الإحترام والتقدير ،،

                                                                                       الإدارة القانونية

                                                                                      مستشار / صبري شطا`,
    variables: [],
    instructions: 'يستخدم هذا الخطاب الرسمي ككتاب تغطية (Cover Letter) لإحالة المستندات والتوصيات القانونية المطلوبة للنيابة العامة.'
  }
];

// --- DOCUMENT VERSION INTERFACE ---
interface DocVersion {
  id: string;
  timestamp: string;
  userName: string;
  content: string;
  changesNote: string;
}

const LegalFormsPage: React.FC = () => {
  const { addToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<'browse' | 'generate' | 'upload'>('browse');
  
  // Storage State Customizer
  const [forms, setForms] = useState<LegalResource[]>(() => {
    const saved = localStorage.getItem('qanooni_templates_forms');
    return saved ? JSON.parse(saved) : INITIAL_LEGAL_FORMS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
     const saved = localStorage.getItem('qanooni_favorites_forms');
     return saved ? JSON.parse(saved) : ['financial-claim-suit'];
  });

  useEffect(() => {
    localStorage.setItem('qanooni_templates_forms', JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
     localStorage.setItem('qanooni_favorites_forms', JSON.stringify(favorites));
  }, [favorites]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<CountryCode | ''>('');

  // AI-Generation Mode
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  // Split-Screen Customizer Model State
  const [selectedFormForPreview, setSelectedFormForPreview] = useState<LegalResource | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [variableBindings, setVariableBindings] = useState<Record<string, string>>({});
  
  // Custom Signatures & Ink configuration
  const [customSignatures, setCustomSignatures] = useState({
    partyOneSign: '',
    partyTwoSign: 'صبري شطا (المستشار)',
    stampSelection: 'shata' as 'shata' | 'outbound' | 'approved' | 'confidential',
    showStamp: true,
    showWatermark: true,
    customFieldLabel: '',
    customFieldValue: ''
  });

  // Version Control History inside the editor
  const [documentVersions, setDocumentVersions] = useState<DocVersion[]>([]);
  const [compareVersionId, setCompareVersionId] = useState<string>('');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Manual Template Uploading Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'CONTRACTS',
    country: 'KW' as CountryCode,
    description: '',
    contentTemplate: '',
    keywordsAr: 'مطالبة، عقد بيع، الكويت',
    variablesAr: 'اسم_المدعي، المبلغ_المطلوب',
    instructions: 'يرجى مراجعة قانون العمل وإقرار الوفاء قبل ملء هذا السند.'
  });
  const [isUploading, setIsUploading] = useState(false);

  const filteredForms = useMemo(() => {
    return forms.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           f.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !filterCategory || f.category === filterCategory;
      const matchesCountry = !filterCountry || f.country === filterCountry;
      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [forms, searchQuery, filterCategory, filterCountry]);

  // Handle adding template manually 
  const handleCreateTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.contentTemplate) {
        addToast({
            type: 'warning',
            title: 'حقول فارغة',
            message: 'يرجى إرسال العنوان والنصوص التشريعية الكاملة.'
        });
        return;
    }

    const keywords = uploadData.keywordsAr.split('،').map(k => k.trim()).filter(k => k);
    const variables = uploadData.variablesAr.split('،').map(v => v.trim()).filter(v => v);

    const newTemplate: LegalResource = {
       id: `custom-tpl-${Date.now()}`,
       title: uploadData.title,
       type: LegalResourceType.TEMPLATE,
       category: uploadData.category,
       country: uploadData.country,
       publishDate: new Date().toISOString().split('T')[0],
       keywords,
       description: uploadData.description || 'جدول مرجعي معتمد',
       contentTemplate: uploadData.contentTemplate,
       variables,
       instructions: uploadData.instructions
    };

    setForms(prev => [newTemplate, ...prev]);
    addToast({
       type: 'success',
       title: 'تم حفظ القالب',
       message: 'تم تخزينه بنجاح وتوفره للاستخدام والشخصنة الفورية.'
    });

    // Reset upload state
    setUploadData({
      title: '',
      category: 'CONTRACTS',
      country: 'KW' as CountryCode,
      description: '',
      contentTemplate: '',
      keywordsAr: 'مطالبة، عقد بيع، الكويت',
      variablesAr: 'اسم_المدعي، المبلغ_المطلوب',
      instructions: 'يرجى مراجعة قانون العمل وإقرار الوفاء قبل ملء هذا السند.'
    });
    setActiveTab('browse');
  };

  // Generate Template via AI
  const handleGenerateViaAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setGeneratedResult(null);
    try {
        const result = await geminiService.generateLegalForm(aiPrompt);
        // Transform and format result
        setGeneratedResult(result);
        addToast({
           type: 'success',
           title: 'اكتمل التوليد الذكي',
           message: 'تم تشكيل القالب الكامل وصياغة المتغيرات المطلوبة.'
        });
    } catch (err) {
        addToast({
           type: 'warning',
           title: 'فشل التوليد',
           message: 'المساعد الذكي لم يستطع صياغة المواد المطلوبة حالياً.'
        });
    } finally {
        setAiLoading(false);
    }
  };

  const importAiResultToTemplates = () => {
      if (!generatedResult) return;
      
      const newForm: LegalResource = {
         id: `ai-tpl-${Date.now()}`,
         title: generatedResult.title || 'مسودة عقد مولدة ذكياً',
         type: LegalResourceType.TEMPLATE,
         category: generatedResult.category || 'CONTRACTS',
         country: 'KW' as CountryCode,
         publishDate: new Date().toISOString().split('T')[0],
         keywords: generatedResult.keywords || ['مولد ذكياً', 'مسودة'],
         description: generatedResult.description || 'عقد/صحيفة دعوى مولدة بمساعدة الذكاء الاصطناعي لمكتب صبري شطا.',
         contentTemplate: generatedResult.contentTemplate || '',
         variables: generatedResult.variables || [],
         instructions: generatedResult.instructions || 'يخضع للمطابقة والتخصيص الفني.'
      };

      setForms(prev => [newForm, ...prev]);
      addToast({
         type: 'success',
         title: 'تم الاستيراد بنجاح',
         message: 'تم ضم القولبة الذكية لقائمة المراجعة القانونية الدائمة.'
      });
      setSelectedFormForPreview(newForm);
      setEditingContent(newForm.contentTemplate);
      // Auto-extract dynamic variables
      const binders: Record<string, string> = {};
      newForm.variables?.forEach((v: string) => { binders[v] = ''; });
      setVariableBindings(binders);

      // Auto create Version 1 of this newly created document
      setDocumentVersions([
        { id: 'v-1', timestamp: new Date().toLocaleTimeString(), userName: 'صبري شطا', content: newForm.contentTemplate, changesNote: 'المسودة الأولى المحدثة والمولدة' }
      ]);
      setCompareVersionId('v-1');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'success',
      title: 'تم نسخ النص',
      message: 'تم حفظ محتويات اللائحة بالحافظة.'
    });
  };

  const toggleFavorite = (id: string) => {
     setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Open the interactive customizer split screen
  const openCustomizer = (form: LegalResource) => {
     setSelectedFormForPreview(form);
     setEditingContent(form.contentTemplate);
     const initialBindings: Record<string, string> = {};
     form.variables?.forEach((v: string) => {
        initialBindings[v] = '';
     });
     setVariableBindings(initialBindings);
     
     // Initialize default versioning
     setDocumentVersions([
        { id: 'v-original', timestamp: new Date().toLocaleTimeString(), userName: 'صبري شطا (الأصل)', content: form.contentTemplate, changesNote: 'المسند الأصلي للقالب الفني' }
     ]);
     setCompareVersionId('v-original');
     setIsCompareMode(false);
  };

  // Render the filled template in real-time replacing variables with highlighted versions
  const renderedContentOutput = useMemo(() => {
     let text = editingContent;
     Object.entries(variableBindings).forEach(([key, val]) => {
         const searchStr = `{{${key}}}`;
         const replacement = val.trim() ? val : `[ ${key.replace(/_/g, ' ')} ]`;
         // Global replacement is tricky in JS if not using Regex, let's use split-join
         text = text.split(searchStr).join(replacement);
     });
     return text;
  }, [editingContent, variableBindings]);

  // AI-Assisted clause additions
  const handleAIClauseSuggestion = async () => {
      addToast({ type: 'info', title: 'تحليل البنية', message: 'جاري استدعاء المعايرة الفقهية لإضافة البنود الاحترازية...' });
      try {
         const prompt = `بصفتك باحثاً قانونياً بمحكمة التمييز، أوجز صيغة مادة "شرط جزائي ملزم وقائم على التعويض الفعلي في حال التأخر أو الإخلال" متطابقاً مع القانون المدني وصياغة تخدم المستند التالي: "${editingContent}". قدم فقط نص الشرط القضائي باللغة العربية البليغة وبدون علامات تنصيص زائدة.`;
         const text = await geminiService.getChatbotResponse(prompt);
         setEditingContent(prev => `${prev}\n\nبند مضاف بالتحليل الذكي (الشرط الجزائي والتعويض):\n${text}`);
         addToast({ type: 'success', title: 'تم استحقاق البند', message: 'تم إدراج بند الشرط الجزائي الذكي في أسفل السند.' });
         
         // Log version auto-saved
         const vId = `v-${Date.now()}`;
         setDocumentVersions(prev => [
            ...prev,
            { id: vId, timestamp: new Date().toLocaleTimeString(), userName: 'صبري شطا (AI)', content: editingContent + `\n\nبند مضاف بالتحليل الذكي (الشرط الجزائي والتعويض):\n${text}`, changesNote: 'توسيع وحقن شرط جزائي ذكي' }
         ]);
      } catch (err) {
         addToast({ type: 'warning', title: 'فشل التوسيع', message: 'لا يمكن جلب الرد الفوري.' });
      }
  };

  // Optimize Tone with AI
  const handleAIToneOptimization = async () => {
     addToast({ type: 'info', title: 'موازنة الصياغة', message: 'جاري صقل البلاغة وتعديل المرجع اللفظي للمكلف...' });
     try {
        const text = await geminiService.correctGrammarAndSpelling(editingContent);
        setEditingContent(text);
        addToast({ type: 'success', title: 'اكتمل التهذيب النحوي', message: 'تم إعادة بناء السند بالصيغة الفقهية الموزونة لغوياً.' });
        
        const vId = `v-${Date.now()}`;
        setDocumentVersions(prev => [
           ...prev,
           { id: vId, timestamp: new Date().toLocaleTimeString(), userName: 'صبري شطا (AI)', content: text, changesNote: 'صقل البلاغة وضبط النحو الجنائي' }
        ]);
     } catch (err) {
        addToast({ type: 'warning', title: 'فشل التعديل', message: 'فشل تواصل محرك التدقيق المعرفي.' });
     }
  };

  // Record Version checkpoint
  const saveCustomVersion = (note: string) => {
      const vId = `v-${Date.now()}`;
      const newVer: DocVersion = {
         id: vId,
         timestamp: new Date().toLocaleTimeString(),
         userName: 'المستشار صبري شطا',
         content: editingContent,
         changesNote: note || 'حفظ تغييرات عادية للموكل'
      };
      setDocumentVersions(prev => [...prev, newVer]);
      addToast({ type: 'success', title: 'تم تسجيل الإصدار', message: 'تم تسجيل نسخة احتياطية من التعديلات الحالية.' });
  };

  const deleteTemplate = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف قالب النموذج "${title}" والتعليمات الخاصة به؟`)) {
       setForms(prev => prev.filter(f => f.id !== id));
       addToast({
          type: 'success',
          title: 'تم الحذف',
          message: 'تم إقصاء القالب بنجاح.'
       });
    }
  };

  return (
    <div id="qanooni-forms-management" className="space-y-6 text-right" dir="rtl">
      {/* Dynamic Official Page Prints */}
      <PrintHeader title="أرشيف ومنظومة صياغة العقود والنماذج واللوائح" subtitle="مكتب صبري شطا للمحاماة والاستشارات القانونية" />

      {/* Primary Navigation and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                  <ClipboardDocumentCheckIcon className="w-8 h-8" />
              </div>
              <div>
                  <h1 className="text-3xl font-black text-gray-900 leading-tight">القرائن والعقود والنماذج القانونية الذكية</h1>
                  <p className="text-sm text-gray-400 mt-1 font-medium">
                      منشئ وصائل عقود متوائم، صياغة ومطابقة أوتوماتيكية للفرائض والمتغيرات مع تذييل التوقيعات والأختام الرسمية المعتمدة.
                  </p>
              </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl border mt-4 md:mt-0 font-bold text-xs">
              {[
                 { id: 'browse', label: 'تصفح النماذج المتوفرة', icon: ListBulletIcon },
                 { id: 'generate', label: 'توليد ذكي بالـ (AI)', icon: SparklesIcon },
                 { id: 'upload', label: 'إضافة قالب نموذج جديد', icon: PlusCircleIcon }
              ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 py-2 px-5 rounded-xl transition-all ${activeTab === t.id ? 'bg-white text-primary shadow-xs font-black' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                  </button>
              ))}
          </div>
      </div>

      {/* MAIN VIEWPORT PANELS */}
      <AnimatePresence mode="wait">
         {activeTab === 'browse' && (
             <motion.div 
               key="browse-panel"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                 {/* Search Toolbar */}
                 <div className="bg-white p-5 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="relative flex-grow w-full">
                           <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                           <Input 
                             placeholder="البحث في صيغ الدعاوى، عقود الإيجار السكني، إنذارات الشركات والموارد البشرية..."
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="pr-10 bg-gray-50/50"
                             containerClassName="mb-0"
                           />
                      </div>
                      <div className="flex gap-2 w-full md:w-auto shrink-0">
                           <Select 
                             options={[{value: '', label: 'جميع الأقسام'}, ...legalFormCategoryOptions]}
                             value={filterCategory}
                             onChange={(e) => setFilterCategory(e.target.value)}
                             containerClassName="mb-0 flex-1 md:w-48"
                           />
                           <Select 
                             options={[{value: '', label: 'جميع الدول والمقاصد'}, ...countryOptions]}
                             value={filterCountry}
                             onChange={(e) => setFilterCountry(e.target.value as CountryCode | '')}
                             containerClassName="mb-0 flex-1 md:w-48"
                           />
                      </div>
                 </div>

                 {/* GRID LISTING OF TEMPLATES */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {filteredForms.map((item) => (
                          <Card 
                            key={item.id}
                            className="flex flex-col border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all bg-white relative p-0 overflow-hidden"
                          >
                            <div className="p-5 flex-grow space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-slate-100 py-1 px-3 rounded-md">
                                        {legalFormCategoryOptions.find(o => o.value === item.category)?.label || 'قالب عام'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleFavorite(item.id)} className={`transition-all active:scale-95 ${favorites.includes(item.id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}>
                                            <StarIcon className={`w-4.5 h-4.5 ${favorites.includes(item.id) ? 'fill-current text-amber-500' : ''}`} />
                                        </button>
                                        <button onClick={() => deleteTemplate(item.id, item.title)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <TrashIcon className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 leading-snug hover:text-primary transition-colors cursor-pointer" onClick={() => openCustomizer(item)}>
                                     {item.title}
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                                     {item.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                     {item.keywords.map(kw => (
                                         <span key={kw} className="text-[9px] bg-slate-50 text-gray-500 px-2 py-0.5 rounded border border-slate-100">#{kw}</span>
                                     ))}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50/70 border-t flex justify-between items-center text-xs">
                                <div className="font-bold flex items-center gap-1.5">
                                    <span>{item.country === 'KW' ? '🇰🇼 دولة الكويت' : item.country === 'EG' ? '🇪🇬 جمهورية مصر' : item.country === 'SA' ? '🇸🇦 السعودية' : '🌎 الخليج العربي'}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-400 text-[10px]">{item.variables?.length || 0} متغيرات</span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openCustomizer(item)}
                                  className="text-[10px] font-bold py-1 bg-white border-slate-200"
                                >
                                     تخصيص السند وتعبئة البيانات 
                                </Button>
                            </div>
                          </Card>
                      ))}
                 </div>
             </motion.div>
         )}

         {activeTab === 'generate' && (
             <motion.div 
               key="generate-ai-panel"
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               className="space-y-6"
             >
                 <Card className="border-primary/20 bg-gradient-to-tr from-primary/5 via-white to-purple-500/5">
                     <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-gradient-to-l from-primary to-purple-600 rounded-xl text-white shadow-lg shadow-primary/10">
                                  <SparklesIcon className="w-6 h-6 animate-pulse" />
                              </div>
                              <div>
                                   <h3 className="text-xl font-black text-gray-900">مصمم القوالب القانونية الذكي بالكامل</h3>
                                   <p className="text-xs text-gray-500 mt-1">
                                        اكتب تفاصيل المستند المطلوب، وسيقوم المساعد الذكي بتصميم قالب قانوني كامل غني بمواد الدعم والمتغيرات لتخصيصها وحفظها بشكل مباشر.
                                   </p>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <textarea 
                                placeholder="مثال: صغ لي قالب اتفاقية صلح جنائي مخالصة نهائية في جنحة تعدي وإضرار مالي، مع تحديد مبالغ الوفاء والتعويض ومتغيرات اسم المدعي، المجني عليه، المحضر، ورقم الجلسة بقضاء الكويت."
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="w-full text-sm p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 min-h-[120px] font-serif"
                              />

                              <div className="flex justify-end pt-2">
                                  <Button 
                                    onClick={handleGenerateViaAI}
                                    isLoading={aiLoading}
                                    className="bg-primary hover:bg-primary-dark font-bold text-white px-8 py-3.5 rounded-xl shadow-lg shadow-primary/10"
                                    leftIcon={<SparklesIcon className="w-5 h-5me-1.5" />}
                                  >
                                       تشغيل الذكاء الاصطناعي وبدء التبويب فورا
                                  </Button>
                              </div>
                          </div>
                     </div>
                 </Card>

                 {generatedResult && (
                      <Card className="bg-white border-primary/30 shadow-2xl p-6 rounded-3xl relative overflow-hidden space-y-6">
                           <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <span className="font-bold text-primary flex items-center gap-2">
                                     <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                     قالب توليدي جاهز للفحص والضم
                                </span>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  onClick={importAiResultToTemplates}
                                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                     استيراد هذا القالب الفني لأرشيفي الدائم
                                </Button>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               <div className="lg:col-span-2 space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 font-serif whitespace-pre-wrap leading-[2.2] text-sm text-gray-800">
                                         {generatedResult.contentTemplate}
                                    </div>
                               </div>
                               <div className="bg-slate-50 p-6 rounded-2xl border space-y-4 text-xs">
                                    <h4 className="font-bold text-gray-800 border-r-2 border-primary pr-2">البطاقة الفنية</h4>
                                    <div><strong>العنوان الموصى به:</strong> {generatedResult.title}</div>
                                    <div><strong>القسم:</strong> {generatedResult.category}</div>
                                    <div><strong>المتغيرات المستنتجة:</strong>
                                         <div className="flex flex-wrap gap-1.5 mt-2">
                                              {generatedResult.variables?.map((v: string) => (
                                                  <span key={v} className="bg-white border text-gray-600 px-2 py-0.5 rounded font-mono font-bold">#{v}</span>
                                              ))}
                                         </div>
                                    </div>
                                    <div><strong>إرشادات السلامة للموكلين:</strong> 
                                         <p className="text-gray-500 leading-relaxed mt-1">{generatedResult.instructions}</p>
                                    </div>
                               </div>
                           </div>
                      </Card>
                 )}
             </motion.div>
         )}

         {activeTab === 'upload' && (
             <motion.div 
               key="upload-custom-panel"
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               className="max-w-3xl mx-auto"
             >
                 <Card className="p-6 border-gray-100">
                      <div className="flex items-center gap-3 mb-6 border-b pb-4">
                           <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <PlusIcon className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl font-black text-gray-900">إدخال وحفظ قالب نموذج قانوني مخصص</h2>
                      </div>

                      <form onSubmit={handleCreateTemplateSubmit} className="space-y-4">
                           <Input 
                             name="upload_title"
                             label="اسم وعنوان القالب القانوني" 
                             value={uploadData.title}
                             onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                             placeholder="مثال: صحيفة استئناف فرعية أو عقد بيع مركبة ومقاصة مالية"
                             required
                           />
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select 
                                  label="التبويب الخاص بالنموذج"
                                  options={legalFormCategoryOptions}
                                  value={uploadData.category}
                                  onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                                />
                                <Select 
                                  label="الولاية القضائية / الدولة"
                                  options={countryOptions}
                                  value={uploadData.country}
                                  onChange={(e) => setUploadData({...uploadData, country: e.target.value as CountryCode})}
                                />
                           </div>

                           <TextArea 
                             label="وصف وشروط هذا السند"
                             value={uploadData.description}
                             onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                             placeholder="نبذة تساعد المحامين في الحصول على قالب العمل المناسب..."
                             rows={2}
                           />

                           <TextArea 
                             label="النص التشغيلي والقرائن (تحوي حقول متغيرات مثل {{الاسم_الكلي}})"
                             value={uploadData.contentTemplate}
                             onChange={(e) => setUploadData({...uploadData, contentTemplate: e.target.value})}
                             placeholder={`قيد دعوى مطالبة مالية...\nبناء على سعي المدعي {{اسم_المدعي}} نطالب بإلزام {{المدعى_عليه}} بدفع {{المبلغ}} دينار كويتي.`}
                             rows={6}
                             required
                           />

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <Input 
                                  label="المتغيرات المرغوبة (افصلها بفاصلة لإنتاج حقول ذكية)"
                                  value={uploadData.variablesAr}
                                  onChange={(e) => setUploadData({...uploadData, variablesAr: e.target.value})}
                                  placeholder="مثل: اسم_المدعي، المدعى_عليه، المبلغ"
                                />
                                <Input 
                                  label="الكلمات الدلالية المفتاحية"
                                  value={uploadData.keywordsAr}
                                  onChange={(e) => setUploadData({...uploadData, keywordsAr: e.target.value})}
                                  placeholder="مثل: عمالي، تفويض، الكويت"
                                />
                           </div>

                           <TextArea 
                             label="الوصايا والإرشادات قبل الطباعة الفنية"
                             value={uploadData.instructions}
                             onChange={(e) => setUploadData({...uploadData, instructions: e.target.value})}
                             rows={2}
                           />

                           <div className="flex justify-end pt-4 border-t gap-3">
                                <Button type="button" variant="outline" onClick={() => setActiveTab('browse')}>{isRtl ? 'إلغاء' : 'Cancel'}</Button>
                                <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark font-bold text-white px-8">{isRtl ? 'حفظ النموذج وإضافته للمصادر' : 'Save Template'}</Button>
                           </div>
                      </form>
                 </Card>
             </motion.div>
         )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE DRAFT DESIGN EDITOR MODAL */}
      <Modal
        isOpen={!!selectedFormForPreview}
        onClose={() => setSelectedFormForPreview(null)}
        title={selectedFormForPreview?.title || 'لوحة تكييف العقود والعرائض'}
        size="xl"
      >
        {selectedFormForPreview && (
            <div className="space-y-6" dir="rtl">
                 <div className="flex justify-between items-center border-b pb-4">
                      <div>
                           <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 py-1 px-3 rounded-md">
                                {legalFormCategoryOptions.find(o => o.value === selectedFormForPreview.category)?.label}
                           </span>
                           <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedFormForPreview.title}</h2>
                      </div>
                      <div className="flex gap-2 print:hidden">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-gray-500 gap-1"
                             onClick={() => handleCopy(editingContent)}
                           >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                                نسخ مسودة المتن
                           </Button>
                      </div>
                 </div>

                 {/* Instructions and checklist */}
                 <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-xl flex gap-3 text-xs leading-relaxed">
                      <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                           <h4 className="font-bold text-amber-900 mb-0.5">الوصايا القانونية وموجبات المشرع:</h4>
                           <p className="text-amber-800">{selectedFormForPreview.instructions}</p>
                      </div>
                 </div>

                 {/* THE CORE SPLIT SCREEN CUSTOMIZATION ZONE */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      {/* Right side (For RTL, standard Arabic users scan files from Right to Left): Inputs Panel */}
                      <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                           <div className="space-y-4">
                               <div className="flex justify-between items-center border-b pb-2">
                                    <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                                         <PlusCircleIcon className="w-5 h-5 text-primary" />
                                         تعبئة المتغيرات والبيانات
                                    </h4>
                                    
                                    {/* Auto record sync selector */}
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white p-1 rounded border">AUTO-SYNC ENABLED</span>
                               </div>
                               
                               {/* Real data bindings and injection widgets */}
                               <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1">
                                    {selectedFormForPreview.variables?.map((v) => (
                                         <div key={v} className="space-y-1">
                                              <label className="text-[11px] font-bold text-gray-600 block">{v.replace(/_/g, ' ')}</label>
                                              <input 
                                                type="text" 
                                                className="w-full text-xs p-2 rounded-lg border bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                                                value={variableBindings[v] || ''}
                                                onChange={(e) => setVariableBindings({ ...variableBindings, [v]: e.target.value })}
                                                placeholder={`أدخل ${v.replace(/_/g, ' ')}...`}
                                              />
                                         </div>
                                    ))}
                               </div>
                           </div>

                           {/* Signatures & Seal parameters config */}
                           <div className="border-t pt-4 space-y-3">
                                <h4 className="text-xs font-bold text-gray-700">{isRtl ? 'أختام وتحقق مصلحة صبري شطا' : 'Stamps and Signatures'}</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                     <input 
                                       type="text" 
                                       value={customSignatures.partyOneSign} 
                                       onChange={(e) => setCustomSignatures({...customSignatures, partyOneSign: e.target.value})} 
                                       placeholder="اسم الموكل للتوقيع" 
                                       className="p-2 border rounded-lg bg-white text-xs text-right"
                                     />
                                     <select 
                                       value={customSignatures.stampSelection} 
                                       onChange={(e) => setCustomSignatures({...customSignatures, stampSelection: e.target.value as any})}
                                       className="p-2 border rounded-lg bg-white text-xs text-right"
                                     >
                                         <option value="shata">خاتم صبري شطا</option>
                                         <option value="outbound">الصادر القانوني</option>
                                         <option value="approved">الاعتماد والاعتداد</option>
                                         <option value="confidential">سري للغاية</option>
                                     </select>
                                </div>
                           </div>
                      </div>

                      {/* Left side: Compiled preview layout & direct editor */}
                      <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                           <div className="space-y-2 flex-grow flex flex-col">
                                <div className="flex justify-between items-center">
                                     <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                          <PencilIcon className="w-4 h-4 text-primary" />
                                          المحرر ومسار المستند التفاعلي
                                     </h4>
                                     <div className="flex gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={handleAIToneOptimization} 
                                            className="text-[10px] text-primary bg-primary/5 hover:bg-primary/10 flex items-center gap-1 py-1 px-2.5 font-bold"
                                          >
                                               <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                                               صياغة AI الموزونة
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={handleAIClauseSuggestion} 
                                            className="text-[10px] text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center gap-1 py-1 px-2.5 font-bold"
                                          >
                                               <PlusIcon className="w-3.5 h-3.5 text-purple-600" />
                                               حقن شرط جزائي
                                          </Button>
                                     </div>
                                </div>

                                {/* Rich compilation textarea with bindings display */}
                                <div className="space-y-4 flex-grow flex flex-col">
                                     <textarea 
                                       className="w-full flex-grow p-4 border rounded-2xl bg-slate-50 font-serif whitespace-pre-wrap leading-[2.1] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary min-h-[300px] resize-none"
                                       value={editingContent}
                                       onChange={(e) => setEditingContent(e.target.value)}
                                     />
                                </div>
                           </div>
                      </div>
                 </div>

                 {/* DUAL MODE INTERACTIVE DIFF PREVIEW BUTTON */}
                 <div className="bg-slate-100 p-4 rounded-2xl space-y-3 text-xs border">
                      <div className="flex justify-between items-center">
                           <h4 className="font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1"><HistoryIcon className="w-4 h-4 text-primary" /> تتبع التحقق والمقارنة (Version logs / Diffs)</h4>
                           <div className="flex gap-2">
                                <select 
                                  value={compareVersionId} 
                                  onChange={(e) => setCompareVersionId(e.target.value)}
                                  className="p-1.5 rounded-lg border bg-white focus:outline-none"
                                >
                                    {documentVersions.map(v => (
                                        <option key={v.id} value={v.id}>{v.userName} - {v.timestamp} ({v.changesNote})</option>
                                    ))}
                                </select>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="py-1"
                                  onClick={() => {
                                      const targetVer = documentVersions.find(v => v.id === compareVersionId);
                                      if (targetVer) {
                                          setIsCompareMode(!isCompareMode);
                                      }
                                  }}
                                >
                                     {isCompareMode ? 'إغلاق نافذة المقارنة' : 'المقارنة مع الأصل أو الإصدار'}
                                </Button>
                           </div>
                      </div>
                      
                      {isCompareMode && (
                           <div className="grid grid-cols-2 gap-4 border-t pt-3 font-serif leading-relaxed h-[180px] overflow-y-auto bg-white p-3 rounded-lg text-[10px]">
                                <div>
                                     <strong className="text-primary block border-b pb-1 mb-2">الإصدار المحدد للمقارنة:</strong>
                                     <pre className="whitespace-pre-wrap">{documentVersions.find(v => v.id === compareVersionId)?.content || 'لا توجد مراجعات.'}</pre>
                                </div>
                                <div className="border-r pr-3">
                                     <strong className="text-emerald-700 block border-b pb-1 mb-2">المسودة النشطة الحالية:</strong>
                                     <pre className="whitespace-pre-wrap">{editingContent}</pre>
                                </div>
                           </div>
                      )}
                 </div>

                 {/* SUBMISSION SAVE AND OFFICIAL MULTI-PAGE EXPORTS */}
                 <div className="flex justify-between items-center pt-5 border-t gap-4 flex-wrap print:hidden">
                      <div className="flex gap-2">
                           <Button variant="outline" onClick={() => {
                                saveCustomVersion(prompt('مذكرة الحفظ:', 'تعديل البيانات الأساسية') || 'تعديل جزئي');
                           }} className="text-xs">
                                تسجيل نسخة مراجعة
                           </Button>
                           <Button 
                             variant="outline" 
                             onClick={() => addToast({ type: 'info', title: 'خادم الوورد', message: 'يجري معالجة الصيغة الدلالية وتحويل الحقول لتطابق مايكروسوفت وورد...' })}
                             className="text-xs"
                           >
                               تصدير مستند Word معتمد
                           </Button>
                      </div>

                      <div className="flex gap-2">
                           <Button variant="ghost" onClick={() => setSelectedFormForPreview(null)}>إرجاع</Button>
                           <Button 
                             variant="outline" 
                             leftIcon={<PrinterIcon className="w-4 h-4" />}
                             onClick={() => {
                                 setTimeout(() => window.print(), 350);
                             }}
                             className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                           >
                                وطباعة السند المعتمد 
                           </Button>
                           <Button 
                             variant="primary" 
                             onClick={() => {
                                  // Find form and replace inside state
                                  setForms(prev => prev.map(f => f.id === selectedFormForPreview.id ? { ...f, contentTemplate: editingContent } : f));
                                  addToast({
                                     type: 'success',
                                     title: 'تم التخزين',
                                     message: 'تم حفظ كافة التغيرات على القالب القانوني ونظام المتغيرات.'
                                  });
                                  setSelectedFormForPreview(null);
                             }}
                             className="bg-primary hover:bg-primary-dark text-white font-bold w-48"
                           >
                                حفظ التعديلات وحفظ
                           </Button>
                      </div>
                 </div>

                 {/* PHYSICAL OFFICIAL PRINTING SHEET FORMATTING CONTAINER - RENDERS IN PRINT RUNTIME */}
                 <div className="hidden print:block printable-sheet bg-white p-8 text-black shadow-none border-none font-serif leading-[2.3] text-sm">
                      <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-8 text-[11px] text-gray-400">
                           <div className="text-right">
                                <span className="block font-bold">مكتب صبري شطا للمحاماة والاستشارات</span>
                                <span className="block">الكويت - مجمع محاكم الرقعي</span>
                           </div>
                           <div className="text-left font-mono">
                                <span className="block font-bold">SABRI SHATA LAW WORKSPACE</span>
                                <span className="block">Verification: REF-FORMS-2026</span>
                           </div>
                      </div>

                      {customSignatures.showWatermark && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 transform -rotate-45">
                              <span className="text-8xl font-black text-gray-900 tracking-widest uppercase">OFFICIAL APPROVED COPY</span>
                          </div>
                      )}

                      <h2 className="text-center font-black text-lg text-slate-900 border-b pb-3 mb-6">{selectedFormForPreview.title}</h2>
                      
                      <div className="legal-body text-justify font-serif text-sm whitespace-pre-wrap leading-[2.4] px-4">
                           {renderedContentOutput}
                      </div>

                      <div className="grid grid-cols-2 gap-10 mt-16 pt-8 border-t border-gray-200 text-xs">
                           <div className="text-right">
                                <p className="font-bold mb-10">{customSignatures.partyOneSign || 'الموكل المنهي للتوقيع:'} ____________________</p>
                                <p className="text-[10px] text-gray-400">بصفته طرفاً تعاقدياً أول</p>
                           </div>
                           <div className="text-left">
                                <p className="font-bold mb-10">{customSignatures.partyTwoSign || 'اعتماد مستشاري صبري شطا:'} ____________________</p>
                                <p className="text-[10px] text-gray-400">التصديق المعتمد والمراجعة الرسمية</p>
                           </div>
                      </div>

                      {customSignatures.showStamp && (
                           <div className="flex justify-center mt-12">
                                <div className="border-4 border-double border-primary text-primary px-5 py-2.5 rounded-full text-center max-w-[250px] transform rotate-3">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest">مكتب صبري شطا للمحاماة</span>
                                     <span className="block font-black text-xs">مراجعة معتمدة ومودعة</span>
                                     <span className="block text-[9px] font-mono">Date Seal: {new Date().toLocaleDateString()}</span>
                                </div>
                           </div>
                      )}
                 </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalFormsPage;
