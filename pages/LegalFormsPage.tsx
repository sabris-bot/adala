import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircleIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  EyeIcon, 
  DocumentDuplicateIcon, 
  TrashIcon, 
  PencilIcon, 
  ClockIcon,
  PaperClipIcon,
  XIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CloudArrowUpIcon
} from '../constants';
import { 
  LegalResource, 
  LegalResourceType, 
  LawBranch
} from '../types';
import { 
  legalFormCategoryOptions, 
  lawBranchOptions, 
  countryOptions 
} from '../constants';
import { geminiService } from '../services/geminiService';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

// --- MOCK DATA ---
const INITIAL_LEGAL_FORMS: LegalResource[] = [
  {
    id: 'form-1',
    title: 'صحيفة دعوى مطالبة مالية (ندب خبير وبحث مديونية)',
    type: LegalResourceType.TEMPLATE,
    category: 'LAWSUITS',
    lawBranch: LawBranch.COMMERCIAL,
    publishDate: '2024-01-15',
    keywords: ['مطالبة', 'ندب خبير', 'مديونية', 'تجاري'],
    description: 'صحيفة دعوى شاملة للمطالبة بمستحقات مالية ناتجة عن تعاملات تجارية مع طلب ندب خبير هندسي/محاسبي.',
    contentTemplate: `إنه في يوم          الموافق   /    / 202
بناء على طلب / {{اسم_المدعي}} - المقيم في {{عنوان_المدعي}} - ومحله المختار مكتب المحامي / ....................

أنا              مندوب الإعلان بمحكمة          قد انتقلت حيث إعلان:
السيد / {{اسم_المدعى_عليه}} - المقيم في {{عنوان_المدعى_عليه}}

الموضوع:
بموجب {{سند_المطالبة}}، يداين الطالب المعلن إليه بمبلغ وقدره {{المبلغ}} د.ك ناتجة عن {{تفاصيل_المعاملة}}...
ولما كان المعلن إليه قد امتنع عن السداد رغم الالتزام التعاقدي...

لذلك:
يلتمس الطالب الحكم بـ:
1- ندب خبير في الدعوى لبيان المديونية.
2- إلزام المعلن إليه بالمبلغ المذكور والفوائد القانونية بواقع 7% من تاريخ المطالبة القضائية وحتى تمام السداد.`,
    variables: ['اسم_المدعي', 'عنوان_المدعي', 'اسم_المدعى_عليه', 'عنوان_المدعى_عليه', 'سند_المطالبة', 'المبلغ', 'تفاصيل_المعاملة'],
    instructions: 'تأكد من إرفاق كافة الفواتير والمراسلات المؤيدة للمديونية عند تقديم الصحيفة للمحكمة.'
  },
  {
    id: 'form-2',
    title: 'عقد تأسيس شركة الشخص الواحد (وفق قانون الشركات الجديد)',
    type: LegalResourceType.TEMPLATE,
    category: 'CORPORATE',
    lawBranch: LawBranch.COMPANIES,
    publishDate: '2023-11-20',
    keywords: ['تأسيس', 'شركة الشخص الواحد', 'عقد'],
    description: 'نموذج عقد تأسيس شركة الشخص الواحد متوافق مع تعديلات قانون الشركات الكويتي.',
    contentTemplate: `عقد تأسيس شركة {{اسم_الشركة}} (شركة الشخص الواحد ذ.م.م)

أقر أنا المقع أدناه:
السيد / {{اسم_الشريك_الوحيد}} - جنسيته {{الجنسية}} - بطاقة مدنية رقم {{الرقم_المدني}}
بأنني قد أسست هذه الشركة وفقاً لأحكام قانون الشركات رقم 1 لسنة 2016 وتعديلاته...

المادة (1): غرض الشركة هو {{غرض_الشركة}}.
المادة (2): رأس مال الشركة مبلغ {{رأس_المال}} دينار كويتي.
المادة (3): مدة الشركة {{مدة_الشركة}} سنوات تبدأ من تاريخ القيد في السجل التجاري.`,
    variables: ['اسم_الشركة', 'اسم_الشريك_الوحيد', 'الجنسية', 'الرقم_المدني', 'غرض_الشركة', 'رأس_المال', 'مدة_الشركة'],
    instructions: 'يجب توثيق هذا العقد لدى كاتب العدل بوزارة العدل قبل القيد في السجل التجاري.'
  },
  {
    id: 'form-3',
    title: 'مذكرة دفاع في دعوى عمالية (دفع بسقوط الحق بالتقادم)',
    type: LegalResourceType.TEMPLATE,
    category: 'LEGAL_MEMOS',
    lawBranch: LawBranch.LABOR,
    publishDate: '2024-02-05',
    keywords: ['دفاع', 'عمالي', 'تقادم', 'مذكرة'],
    description: 'مذكرة دفاع قانونية تتضمن الدفع بسقوط حق العامل في المطالبة بمستحقاته بمضي سنة من تاريخ انتهاء العقد (المادة 144 من قانون العمل).',
    contentTemplate: `مذكرة دفاع
مقدمة من / {{اسم_الشركة_المدعى_عليها}} (مدعى عليها)
ضد / {{اسم_العامل_المدعي}} (مدعي)
في الدعوى رقم {{رقم_الدعوى}} / {{سنة_الدعوى}} عمالي الكلية/{{الدائرة}}

أولاً: الدفع بسقوط الحق في إقامة الدعوى بالتقادم الحولي:
حيث أن الثابت من أوراق الدعوى أن علاقة العمل قد انتهت بتاريخ {{تاريخ_نهاية_الخدمة}}، بينما أقيمت الدعوى بتاريخ {{تاريخ_رفع_الدعوى}}...
وحيث تنص المادة 144 من القانون 6/2010 بشأن العمل في القطاع الأهلي على...

ثانياً: واقع حال النزاع وموضوعه:
...`,
    variables: ['اسم_الشركة_المدعى_عليها', 'اسم_العامل_المدعي', 'رقم_الدعوى', 'سنة_الدعوى', 'الدائرة', 'تاريخ_نهاية_الخدمة', 'تاريخ_رفع_الدعوى'],
    instructions: 'يجب الحصول على شهادة ببيانات الحركة من المنافذ للتأكد من توقيت نهاية الخدمة بدقة.'
  },
  {
    id: 'form-4',
    title: 'إنذار رسمي (عدلي) بمطالبة بمبلغ مالي',
    type: LegalResourceType.TEMPLATE,
    category: 'NOTICES',
    lawBranch: LawBranch.CIVIL,
    publishDate: '2024-03-10',
    keywords: ['إنذار عدلي', 'مطالبة', 'وزارة العدل'],
    description: 'صيغة إنذار رسمي يوجه عن طريق مندوب الإعلان بوزارة العدل للمطالبة بسداد دين أو تنفيذ التزام.',
    contentTemplate: `إنذار رسمي (عدلي)
إنه في يوم          الموافق   /    / 202
بناء على طلب / {{المنذر}} - المقيم في {{عنوان_المنذر}}
أنا              محضر محكمة          قد انتقلت حيث إعلان:
السيد / {{المنذر_إليه}} - المقيم في {{عنوان_المنذر_إليه}}

وأنذرته بالآتي:
بموجب {{سبب_الإنذار}}، يطالبكم المنذر بسداد مبلغ {{المبلغ}} د.ك في موعد غايته {{المهلة}}...
وفي حال تخلفكم عن ذلك، سيلجأ المنذر للقضاء لاتخاذ الإجراءات القانونية اللازمة بما فيها المطالبة بالفوائد القانونية والتعويض.`,
    variables: ['المنذر', 'عنوان_المنذر', 'المنذر_إليه', 'عنوان_المنذر_إليه', 'سبب_الإنذار', 'المبلغ', 'المهلة'],
    instructions: 'يجب تقديم ثلاث نسخ من هذا الإنذار لقسم الإعلان بالمحكمة المختصة.'
  },
  {
    id: 'form-5',
    title: 'اتفاقية سرية وعدم إفشاء المعلومات (NDA)',
    type: LegalResourceType.TEMPLATE,
    category: 'CONTRACTS',
    lawBranch: LawBranch.COMMERCIAL,
    publishDate: '2024-04-01',
    keywords: ['NDA', 'سرية المعلومات', 'اتفاقية'],
    description: 'اتفاقية قانونية متكاملة لحماية الأسرار التجارية والبيانات الحساسة أثناء المفاوضات.',
    contentTemplate: `اتفاقية سرية المعلومات
أبرمت هذه الاتفاقية بين كل من:
أولاً: شركة {{الطرف_المفصح}} - ويمثلها في التوقيع {{الممثل_الأول}}
ثانياً: شركة {{الطرف_المتلقي}} - ويمثلها في التوقيع {{الممثل_الثاني}}

الهدف من الاتفاقية هو حماية المعلومات السرية المتعلقة بـ {{طبيعة_المشروع}}...
يلتزم الطرف المتلقي بعدم إفشاء أي معلومات سرية لمدة {{مدة_السرية}} سنوات من تاريخه...
تخضع هذه الاتفاقية لقوانين دولة الكويت، والمحاكم الكويتية هي المختصة بنظر أي نزاع.`,
    variables: ['الطرف_المفصح', 'الممثل_الأول', 'الطرف_المتلقي', 'الممثل_الثاني', 'طبيعة_المشروع', 'مدة_السرية'],
    instructions: 'يفضل توقيع هذه الاتفاقية قبل البدء بأي نقاشات فنية أو تبادل مستندات حساسة.'
  },
  {
    id: 'form-6',
    title: 'عقد إيجار سكن خاص (وفق القانون الكويتي)',
    type: LegalResourceType.TEMPLATE,
    category: 'CONTRACTS',
    lawBranch: LawBranch.CIVIL,
    publishDate: '2024-01-20',
    keywords: ['إيجار', 'سكني', 'عقد'],
    description: 'نموذج عقد إيجار لشقة أو فيلا سكنية يتضمن كافة البنود التي تحمي المؤجر والمستأجر.',
    contentTemplate: `عقد إيجار سكن خاص

أولاً: السيد / {{المؤجر}} (طرف أول)
ثانياً: السيد / {{المستأجر}} (طرف ثاني)

المادة (1): أجر الطرف الأول للطرف الثاني {{وصف_العين_المؤجرة}} الكائنة في {{منطقة_العقار}}.
المادة (2): القيمة الإيجارية الشهرية هي {{الآجر_الشهري}} د.ك تدفع في موعد غايته اليوم {{يوم_الدفع}} من كل شهر.
المادة (3): مدة العقد {{مدة_العقد}} تبدأ من تاريخ التسلم.`,
    variables: ['المؤجر', 'المستأجر', 'وصف_العين_المؤجرة', 'منطقة_العقار', 'الآجر_الشهري', 'يوم_الدفع', 'مدة_العقد'],
    instructions: 'يُنصح بسداد الإيجار عبر تحويل بنكي أو الحصول على وصولات رسمية موفعة لتفادي أي نزاع مستقبلي.'
  },
  {
    id: 'form-7',
    title: 'وكالة عامة رسمية (شاملة لكافة التصرفات)',
    type: LegalResourceType.TEMPLATE,
    category: 'POWERS_OF_ATTORNEY',
    lawBranch: LawBranch.CIVIL,
    publishDate: '2024-04-15',
    keywords: ['وكالة عامة', 'وزارة العدل', 'تفويض'],
    description: 'نموذج وكالة عامة رسمية تتيح للوكيل تمثيل الموكل أمام كافة الجهات الحكومية والغير وبيع وشراء العقارات.',
    contentTemplate: `وكالة عامة

أنا الموقع أدناه:
السيد / {{الموكل}} - جنسيته {{جنسية_الموكل}} - يحمل بطاقة مدنية رقم {{مدني_الموكل}}
قد وكلت عني:
السيد / {{الوكيل}} - جنسيته {{جنسية_الوكيل}} - يحمل بطاقة مدنية رقم {{مدني_الوكيل}}

وذلك لينوب عني ويمثلني في القيام بكافة الأعمال والتصرفات القانونية...
بما في ذلك البيع والشراء والرهن والقبض والتوقيع على كافة العقود...
وتمثيلي أمام محاكم الكويت بجميع درجاتها وأنواعها...`,
    variables: ['الموكل', 'جنسية_الموكل', 'مدني_الموكل', 'الوكيل', 'جنسية_الوكيل', 'مدني_الوكيل'],
    instructions: 'يجب إصدار هذه الوكالة رسمياً أمام كاتب العدل بوزارة العدل، ويُنصح بتحديد صلاحياتها بدقة لتفادي إساءة الاستخدام.'
  }
];

// --- COMPONENTS ---

const LegalFormsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'generate' | 'upload'>('browse');
  const [forms, setForms] = useState<LegalResource[]>(INITIAL_LEGAL_FORMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<{base64: string, type: string, name: string} | null>(null);
  const [selectedFormForPreview, setSelectedFormForPreview] = useState<LegalResource | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'CONTRACTS',
    description: '',
    content: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const filteredForms = useMemo(() => {
    return forms.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           f.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !filterCategory || f.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [forms, searchQuery, filterCategory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          base64: (reader.result as string).split(',')[1],
          type: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateForm = async () => {
    if (!aiPrompt && !selectedFile) return;
    
    setAiLoading(true);
    setGeneratedResult(null);
    
    try {
      const fileInput = selectedFile ? { base64Data: selectedFile.base64, mimeType: selectedFile.type } : undefined;
      const result = await geminiService.generateLegalForm(aiPrompt || "استخراج النموذج من الملف المرفق", fileInput);
      setGeneratedResult(result);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التوليد. يرجى المحاولة لاحقاً.");
    } finally {
      setAiLoading(false);
    }
  };

  const addToLibrary = () => {
    if (!generatedResult) return;
    const newForm: LegalResource = {
      id: `form-${Date.now()}`,
      title: generatedResult.title,
      type: LegalResourceType.TEMPLATE,
      category: generatedResult.category,
      description: generatedResult.description,
      contentTemplate: generatedResult.contentTemplate,
      variables: generatedResult.variables || [],
      instructions: generatedResult.instructions || '',
      publishDate: new Date().toISOString().split('T')[0],
      keywords: [generatedResult.category, generatedResult.title.split(' ')[0]],
    };
    setForms([newForm, ...forms]);
    setGeneratedResult(null);
    setAiPrompt('');
    setSelectedFile(null);
    setActiveTab('browse');
    alert("تمت إضافة النموذج إلى المكتبة بنجاح!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم نسخ النص للذاكرة بنجاح!");
  };

  const handleManualUpload = () => {
    if (!uploadData.title || !uploadData.content) {
      alert("يرجى إدخال العنوان والمحتوى على الأقل");
      return;
    }

    const newForm: LegalResource = {
      id: `manual-${Date.now()}`,
      title: uploadData.title,
      type: LegalResourceType.TEMPLATE,
      category: uploadData.category as any,
      description: uploadData.description,
      contentTemplate: uploadData.content,
      variables: [],
      instructions: 'نموذج مرفوع يدوياً من قبل المستخدم.',
      publishDate: new Date().toISOString().split('T')[0],
      keywords: ['uploaded', uploadData.title.split(' ')[0]],
    };

    setForms([newForm, ...forms]);
    setUploadData({ title: '', category: 'CONTRACTS', description: '', content: '' });
    setSelectedFile(null);
    setActiveTab('browse');
    alert("تم رفع النموذج بنجاح وإضافته للمكتبة!");
  };

  const saveChanges = () => {
    if (!selectedFormForPreview) return;
    setForms(prev => prev.map(f => f.id === selectedFormForPreview.id ? { ...f, contentTemplate: editingContent } : f));
    setSelectedFormForPreview(null);
    alert("تم حفظ التغييرات على النموذج بنجاح!");
  };

  const saveAsNewTemplate = () => {
    if (!selectedFormForPreview) return;
    const newForm: LegalResource = {
      ...selectedFormForPreview,
      id: `custom-${Date.now()}`,
      title: `${selectedFormForPreview.title} (نسخة معدلة)`,
      contentTemplate: editingContent,
      publishDate: new Date().toISOString().split('T')[0],
      keywords: [...selectedFormForPreview.keywords, 'customized']
    };
    setForms([newForm, ...forms]);
    setSelectedFormForPreview(null);
    alert("تم حفظ النموذج الجديد بنجاح!");
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-right" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans tracking-tight">مكتبة النماذج والصيغ القانونية</h1>
          <p className="text-gray-500 max-w-2xl">
            مستودع شامل لأرقى الصيغ القانونية المتوافقة مع القانون الكويتي، مصاغة بلغة بليغة ودقة احترافية.
          </p>
        </div>
        <div className="flex gap-2">
            <Button 
                onClick={() => setActiveTab('generate')}
                leftIcon={<SparklesIcon className="w-5 h-5" />}
            >
                توليد بالذكاء الاصطناعي
            </Button>
            <Button 
                variant="outline"
                onClick={() => setActiveTab('upload')}
                leftIcon={<PlusCircleIcon className="w-5 h-5" />}
            >
                إضافة نموذج جديد
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex gap-1">
        <button 
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === 'browse' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          تصفح المكتبة
        </button>
        <button 
          onClick={() => setActiveTab('generate')}
          className={`px-6 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === 'generate' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          إنشاء نموذج جديد (AI)
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          رفع ملفات خاصة
        </button>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div 
              key="browse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
                {/* Search & Filter */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="relative md:col-span-2">
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="ابحث عن نموذج، الكلمات المفتاحية..." 
                            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <ChevronDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select 
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none bg-white"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">جميع التصنيفات</option>
                            {legalFormCategoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        عرض {filteredForms.length} نموذجاً متاحاً
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredForms.map((form) => (
                        <motion.div 
                            key={form.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
                            layout
                        >
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
                                        {legalFormCategoryOptions.find(o => o.value === form.category)?.label || form.category}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 active:scale-95" title="تعديل">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-50 rounded-full text-red-400 active:scale-95" title="حذف">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{form.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                    {form.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {form.keywords.slice(0, 3).map((k, i) => (
                                        <span key={i} className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100 font-mono italic">#{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    تحديث: {form.publishDate}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline"
                                        onClick={() => {
                                            setSelectedFormForPreview(form);
                                            setEditingContent(form.contentTemplate || '');
                                        }}
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        معاينة
                                    </button>
                                    <button 
                                        className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:brightness-110"
                                        onClick={() => handleCopy(form.contentTemplate)}
                                    >
                                        <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                                        نسخ
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredForms.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <DocumentDuplicateIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد نتائج بحث</h3>
                        <p className="text-gray-400 text-sm">جرب كلمات مفتاحية أخرى أو قم بتوليد نموذج جديد بالذكاء الاصطناعي</p>
                    </div>
                )}
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">رفع نموذج قانوني خاص</h2>
                    <p className="text-sm text-gray-500">أضف نماذجك الخاصة وصيغك المفضلة إلى المكتبة للوصول السريع إليها مستقبلاً.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">عنوان النموذج</label>
                    <input 
                      type="text" 
                      placeholder="عنوان واضح للنموذج..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">التصنيف</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none bg-white"
                      value={uploadData.category}
                      onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    >
                      {legalFormCategoryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* File Dropzone in Upload Tab */}
                <div className="mb-6">
                    <label className="text-sm font-bold text-gray-700 mb-2 block">تحميل ملف موجود (اختياري للأتمتة)</label>
                    <div className="flex gap-4 items-center">
                        <label className="flex-grow">
                            <div className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex items-center justify-center gap-3 ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}>
                                <CloudArrowUpIcon className={`w-5 h-5 ${selectedFile ? 'text-primary' : 'text-gray-400'}`} />
                                <span className={`text-xs ${selectedFile ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                    {selectedFile ? `تم اختيار: ${selectedFile.name}` : 'اضغط هنا لرفع ملف Word أو PDF لاستخراج النص آلياً'}
                                </span>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,image/*" />
                            </div>
                        </label>
                        {selectedFile && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                    setIsUploading(true);
                                    try {
                                        const fileInput = { base64Data: selectedFile.base64, mimeType: selectedFile.type };
                                        const result = await geminiService.generateLegalForm("استخرج بيانات النموذج القانوني من هذا الملف", fileInput);
                                        setUploadData({
                                            title: result.title,
                                            category: result.category,
                                            description: result.description,
                                            content: result.contentTemplate
                                        });
                                    } catch (e) {
                                        alert("فشل استخراج البيانات من الملف.");
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }}
                                isLoading={isUploading}
                                leftIcon={<SparklesIcon className="w-4 h-4" />}
                            >
                                استخراج النص
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-sm font-bold text-gray-700">وصف مختصر</label>
                  <input 
                    type="text" 
                    placeholder="وصف للنموذج واستخداماته..."
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-sm font-bold text-gray-700">نص النموذج / الصيغة</label>
                  <textarea 
                    placeholder="الصق نص النموذج هنا... يمكنك استخدام {{متغير}} لتمييز الخانات المطلوب تعبئتها."
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm min-h-[300px] font-serif"
                    value={uploadData.content}
                    onChange={(e) => setUploadData({...uploadData, content: e.target.value})}
                  />
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                    سيظهر هذا النموذج في تبويب التصفح تحت تصنيفه المختار.
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setUploadData({title: '', category: 'CONTRACTS', description: '', content: ''})}>إعادة تعيين</Button>
                    <Button onClick={handleManualUpload}>حفظ في المكتبة</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-linear-to-br from-primary/5 to-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <SparklesIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">مساعد التوليد الذكي</h2>
                      <p className="text-sm text-gray-500">أوصف النموذج المطلوب، وسيقوم النظام بإنشائه بأسلوب بليغ متماشياً مع القانون الكويتي.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea 
                      placeholder="مثال: إنشاء صحيفة دعوى تعويض عن حادث مروري شاملة كافة الأضرار المادية والأدبية..."
                      className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm min-h-[140px] shadow-sm resize-none"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    
                    {/* File Attachment Area */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <label className="flex-1 w-full">
                            <div className={`border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-center gap-3 ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}>
                                <PaperClipIcon className={`w-5 h-5 ${selectedFile ? 'text-primary' : 'text-gray-400'}`} />
                                <span className={`text-sm ${selectedFile ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                    {selectedFile ? `ملف مرفق: ${selectedFile.name}` : 'إرفاق ملف مرجعي (Word, PDF, صورة)'}
                                </span>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,image/*" />
                            </div>
                        </label>
                        {selectedFile && (
                            <button 
                                onClick={() => setSelectedFile(null)}
                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors active:scale-95"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        )}
                        <Button 
                            disabled={aiLoading || (!aiPrompt && !selectedFile)}
                            onClick={handleGenerateForm}
                            className="w-full md:w-auto"
                            isLoading={aiLoading}
                        >
                            ابدأ التوليد
                        </Button>
                    </div>
                  </div>
                </div>

                {/* AI Result Area */}
                <AnimatePresence>
                  {generatedResult && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-50/50"
                    >
                        <div className="p-8">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                                <div className="absolute left-6 top-6 flex gap-2">
                                    <Button 
                                        onClick={addToLibrary}
                                        variant="primary"
                                        leftIcon={<CheckCircleIcon className="w-5 h-5" />}
                                    >
                                        إضافة للمكتبة
                                    </Button>
                                </div>

                                <div className="mb-6 border-r-4 border-primary pr-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{generatedResult.title}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono uppercase tracking-widest">{generatedResult.category}</span>
                                </div>

                                <div className="mb-6 bg-blue-50 border-r-4 border-blue-500 p-4 rounded-l-lg flex gap-3 items-start">
                                    <InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900">إرشادات قانونية:</h4>
                                        <p className="text-xs text-blue-800 leading-relaxed">{generatedResult.instructions}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <PencilIcon className="w-4 h-4" />
                                        نص النموذج:
                                    </h4>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 font-serif text-gray-800 leading-[2] whitespace-pre-wrap text-sm md:text-base selection:bg-primary/20">
                                        {generatedResult.contentTemplate.split(/(\{\{.*?\}\})/).map((chunk: string, i: number) => 
                                            chunk.startsWith('{{') ? (
                                                <span key={i} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-sans font-bold text-[0.8em]">
                                                    [{chunk.replace('{{', '').replace('}}', '')}]
                                                </span>
                                            ) : chunk
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-6">
                                    <span className="text-xs font-bold text-gray-400 w-full mb-1">المتغيرات المضافة:</span>
                                    {generatedResult.variables?.map((v: string) => (
                                        <span key={v} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold">#{v}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedFormForPreview}
        onClose={() => setSelectedFormForPreview(null)}
        title={selectedFormForPreview?.title || 'معاينة النموذج'}
        size="lg"
      >
        {selectedFormForPreview && (
          <div className="space-y-6 text-right" dir="rtl">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
                    {legalFormCategoryOptions.find(o => o.value === selectedFormForPreview.category)?.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">تاريخ النشر: {selectedFormForPreview.publishDate}</span>
                </div>
                <p className="text-sm text-gray-500">{selectedFormForPreview.description}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}
                onClick={() => handleCopy(selectedFormForPreview.contentTemplate)}
              >
                نسخ النص كاملاً
              </Button>
            </div>

            <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-l-lg flex gap-3 items-start">
              <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">إرشادات قانونية هامة:</h4>
                <p className="text-xs text-amber-800 leading-relaxed">{selectedFormForPreview.instructions}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <PencilIcon className="w-4 h-4" />
                متن النموذج (قابل للتعديل):
              </h4>
              <div className="relative group">
                <textarea 
                  className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 font-serif text-gray-800 leading-[2.2] whitespace-pre-wrap text-sm md:text-base min-h-[400px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all scrollbar-thin scrollbar-thumb-gray-200"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-gray-400 w-full mb-1">المتغيرات المطلوب تعبئتها:</span>
              {selectedFormForPreview.variables?.map((v: string) => (
                <span key={v} className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  [{v}]
                </span>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 flex-wrap">
              <Button variant="ghost" onClick={() => setSelectedFormForPreview(null)}>إلغاء</Button>
              <Button variant="outline" onClick={saveAsNewTemplate} leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}>حفظ كنموذج جديد</Button>
              <Button onClick={saveChanges} leftIcon={<ArrowPathIcon className="w-4 h-4" />}>حفظ التغييرات</Button>
              <Button variant="ghost" onClick={() => window.print()} leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}>طباعة / تصدير</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalFormsPage;
