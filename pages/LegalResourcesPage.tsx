
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LegalResource, LegalResourceType, LawBranch, LegalResourceStatus, CountryCode } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { LegalResourceStatusBadge } from '../components/ui/Badge';
import { 
    FolderIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, InformationCircleIcon, PrinterIcon, 
    BookOpenIcon, BuildingLibraryIcon, CloudArrowUpIcon, SparklesIcon, BrainIcon,
    CalendarDaysIcon, ScaleIcon, ListBulletIcon, LinkIcon, ArrowUpRightIcon, ShareIcon, TagIcon,
    ClipboardDocumentListIcon, GavelIcon, SaveIcon, SendIcon, MagnifyingGlassIcon, Squares2X2Icon, HistoryIcon
} from '../constants';
import PrintHeader from '../components/ui/PrintHeader';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
    legalResourceTypeOptions, 
    lawBranchOptions, 
    legalResourceStatusOptions, 
    countryOptions,
    kuwaitIssuingAuthoritiesOptions
} from '../constants';
import { mockProperties } from '../data/propertyData';

const mockLegalResourcesData: LegalResource[] = [
  // --- KUWAIT LAWS ---
  {
    id: 'kw-constitution',
    title: 'دستور دولة الكويت',
    type: LegalResourceType.LAW,
    documentNumber: '1 لسنة 1962',
    country: 'KW',
    publishDate: '1962-11-11',
    lawBranch: LawBranch.CONSTITUTIONAL,
    issuingAuthority: 'المجلس التأسيسي',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['دستور', 'حريات', 'نظام الحكم', 'الكويت'],
    description: 'الوثيقة الدستورية العليا التي تحدد نظام الحكم والسلطات والحقوق والواجبات في دولة الكويت.',
  },
  {
    id: 'kw-law-civil-1980',
    title: 'القانون المدني الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'المرسوم بالقانون رقم 67 لسنة 1980',
    country: 'KW',
    publishDate: '1980-08-07',
    effectiveDate: '1981-02-25',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'أمير الكويت (بعد موافقة مجلس الأمة)',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مدني', 'عقود', 'التزامات', 'الكويت'],
    description: 'القانون الأساسي المنظم للمعاملات المدنية في دولة الكويت.',
    officialGazetteDetails: 'الكويت اليوم، العدد 1316',
  },
  {
    id: 'kw-penal-code',
    title: 'قانون الجزاء الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 16 لسنة 1960',
    country: 'KW',
    publishDate: '1960-06-01',
    lawBranch: LawBranch.CRIMINAL,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['جزاء', 'جنايات', 'جنح', 'عقوبات'],
    description: 'القانون الذي يحدد الجرائم والعقوبات المقررة لها في الكويت.',
  },
  {
    id: 'kw-procedures',
    title: 'قانون المرافعات المدنية والتجارية',
    type: LegalResourceType.LAW,
    documentNumber: 'المرسوم بقانون رقم 38 لسنة 1980',
    country: 'KW',
    publishDate: '1980-06-04',
    lawBranch: LawBranch.CIVIL,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مرافعات', 'إجراءات', 'محاكم', 'إعلان'],
    description: 'القانون المنظم لإجراءات التقاضي أمام المحاكم المدنية والتجارية.',
  },
  {
    id: 'kw-law-companies-2016',
    title: 'قانون الشركات الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 1 لسنة 2016',
    country: 'KW',
    publishDate: '2016-01-17',
    lawBranch: LawBranch.COMPANIES,
    issuingAuthority: 'مجلس الأمة الكويتي',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['شركات', 'تجاري', 'تأسيس شركات', 'حوكمة'],
    description: 'القانون المنظم لجميع أنواع الشركات التجارية في الكويت.',
  },
  {
    id: 'kw-cybercrime',
    title: 'قانون مكافحة جرائم تقنية المعلومات',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 63 لسنة 2015',
    country: 'KW',
    publishDate: '2015-07-07',
    lawBranch: LawBranch.CRIMINAL,
    keywords: ['جرائم إلكترونية', 'إنترنت', 'ابتزاز', 'تزوير إلكتروني'],
    description: 'القانون المعني بالجرائم التي ترتكب باستخدام الوسائل الإلكترونية.',
  },
  {
    id: 'kw-labor-2010',
    title: 'قانون العمل في القطاع الأهلي',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 6 لسنة 2010',
    country: 'KW',
    publishDate: '2010-02-20',
    lawBranch: LawBranch.OTHER, // Labor
    keywords: ['عمل', 'عمال', 'قطاع أهلي', 'مستحقات', 'نهاية خدمة'],
    description: 'القانون الذي ينظم العلاقة بين أصحاب العمل والعمال في القطاع الأهلي بدولة الكويت، ويحدد الحقوق والالتزامات ومكافأة نهاية الخدمة.',
  },
  {
    id: 'kw-env-law',
    title: 'قانون حماية البيئة الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 42 لسنة 2014',
    country: 'KW',
    publishDate: '2014-07-20',
    lawBranch: LawBranch.ENVIRONMENTAL,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['بيئة', 'تلوث', 'محميات', 'المرور'],
    description: 'قانون شامل يهدف إلى حماية البيئة ومكافحة التلوث والحفاظ على الموارد الطبيعية في الكويت.',
  },
  {
    id: 'kw-decision-ecommerce',
    title: 'لائحة تنظيم التجارة الإلكترونية',
    type: LegalResourceType.MINISTERIAL_DECISION,
    documentNumber: 'قرار وزاري رقم 209 لسنة 2023',
    country: 'KW',
    publishDate: '2023-10-15',
    lawBranch: LawBranch.COMMERCIAL,
    issuingAuthority: 'وزارة التجارة والصناعة',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['تجارة إلكترونية', 'مواقع', 'مستهلك', 'تراخيص'],
    description: 'قرار ينظم ضوابط وإجراءات ممارسة التجارة الإلكترونية وحماية المستهلك عبر المنصات الرقمية.',
  },
  {
    id: 'eg-investment-law',
    title: 'قانون الاستثمار المصري الجديد',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 72 لسنة 2017',
    country: 'EG',
    publishDate: '2017-05-31',
    lawBranch: LawBranch.COMMERCIAL,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مصر', 'استثمار', 'حوافز', 'مناطق حرة'],
    description: 'القانون الذي ينظم الاستثمارات الأجنبية والمحلية ويمنح حوافز استثمارية في جمهورية مصر العربية.',
  },
  {
    id: 'uk-arbitration-act',
    title: 'قانون التحكيم الإنجليزي (Arbitration Act 1996)',
    type: LegalResourceType.LAW,
    documentNumber: 'Arbitration Act 1996',
    country: 'EG', 
    publishDate: '1996-06-17',
    lawBranch: LawBranch.INTERNATIONAL,
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['تحكيم', 'دولي', 'إنجلترا', 'لندن'],
    description: 'من أهم القوانين الدولية المنظمة للتحكيم التجاري، ويُعد مرجعاً عالمياً في المنازعات الدولية.',
  },
  {
    id: 'kw-court-decision-family',
    title: 'اللائحة التنفيذية لقانون محكمة الأسرة',
    type: LegalResourceType.EXECUTIVE_REGULATION,
    documentNumber: 'قرار وزاري رقم 123 لسنة 2015',
    country: 'KW',
    publishDate: '2015-06-30',
    lawBranch: LawBranch.PERSONAL_STATUS,
    issuingAuthority: 'وزارة العدل',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['أسرة', 'محكمة الأسرة', 'إجراءات', 'حضانة', 'نفقة'],
    description: 'اللائحة المنظمة لسير العمل في محكمة الأسرة وإجراءات التقاضي والوساطة الأسرية.',
  },
  {
    id: 'fr-civil-code',
    title: 'القانون المدني الفرنسي (Code Civil)',
    type: LegalResourceType.LAW,
    documentNumber: 'Code Napoléon',
    country: 'SA', 
    publishDate: '1804-03-21',
    lawBranch: LawBranch.CIVIL,
    resourceStatus: LegalResourceStatus.HISTORICAL_REFERENCE,
    keywords: ['فرنسا', 'مدني', 'نابليون', 'تاريخ قانوني'],
    description: 'قانون نابليون، الأساس التاريخي لمعظم القوانين المدنية في العالم العربي ومنها الكويت ومصر.',
  },
  {
    id: 'kw-central-bank-circular',
    title: 'تعليمات بنك الكويت المركزي بشأن التمويل الميسر',
    type: LegalResourceType.MINISTERIAL_DECISION,
    documentNumber: 'تعميم رقم 2/ب/456',
    country: 'KW',
    publishDate: '2020-04-12',
    lawBranch: LawBranch.COMMERCIAL,
    issuingAuthority: 'بنك الكويت المركزي',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['بنوك', 'مركزي', 'تمويل', 'قروض', 'كورونا'],
    description: 'تعليمات وضوابط البنك المركزي للبنوك المحلية بشأن تقديم التمويل الميسر للمتضررين من الأزمات.',
  },
  {
    id: 'intl-vienna-convention',
    title: 'اتفاقية فيينا بشأن عقود البيع الدولي للبضائع (CISG)',
    type: LegalResourceType.LAW,
    documentNumber: 'CISG 1980',
    country: 'JO', 
    publishDate: '1980-04-11',
    lawBranch: LawBranch.INTERNATIONAL,
    resourceStatus: LegalResourceStatus.ACTIVE,
    propertyId: 'prop2', // Added for demo
    keywords: ['بيع دولي', 'بضائع', 'فيينا', 'اتفاقية'],
    description: 'الاتفاقية الدولية التي توحد قواعد البيع الدولي للبضائع والالتزامات المترتبة عليها.',
  },
  {
    id: 'kw-penal-procedure',
    title: 'قانون الإجراءات والمحاكمات الجزائية الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'قانون رقم 17 لسنة 1960',
    country: 'KW',
    publishDate: '1960-06-01',
    lawBranch: LawBranch.CRIMINAL,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['إجراءات جزائية', 'تحقيق', 'قبض', 'تفتيش', 'محاكمة'],
    description: 'القانون المنظم لإجراءات التحقيق والمحاكمة في المسائل الجزائية بدولة الكويت.',
  },
  {
    id: 'kw-administrative-court',
    title: 'قانون إنشاء الدائرة الإدارية بالمحكمة الكلية',
    type: LegalResourceType.LAW,
    documentNumber: 'قانون رقم 20 لسنة 1981',
    country: 'KW',
    publishDate: '1981-05-15',
    lawBranch: LawBranch.ADMINISTRATIVE,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['قضاء إداري', 'إلغاء', 'تعويض', 'موظفين عموميين'],
    description: 'القانون الذي ينظم اختصاصات الدائرة الإدارية بالنظر في منازعات الموظفين والقرارات الإدارية.',
  },
  {
    id: 'kw-real-estate-reg',
    title: 'قانون التسجيل العقاري الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'قانون رقم 5 لسنة 1959',
    country: 'KW',
    publishDate: '1959-01-01',
    lawBranch: LawBranch.REAL_ESTATE,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    propertyId: 'prop1', // Added for demo
    keywords: ['عقار', 'تسجيل', 'ملكية', 'توثيق'],
    description: 'القانون المنظم لإجراءات تسجيل الملكية العقارية والحقوق العينية في الكويت.',
  },
  {
    id: 'book-penal-shame',
    title: 'أصول إجراءات التحقيق والمحاكمة في القانون الكويتي',
    type: LegalResourceType.LEGAL_ARTICLE,
    category: 'كتب ومراجع فقهية',
    country: 'KW',
    publishDate: '2015-10-10',
    lawBranch: LawBranch.CRIMINAL,
    issuingAuthority: 'المؤلف: د. فيصل الكندري',
    keywords: ['كتاب', 'جزائي', 'إجراءات', 'تحقيق'],
    description: 'مرجع فقهي هام في شرح قانون الإجراءات والمحاكمات الجزائية الكويتي.',
  },

  // --- INTERNATIONAL / REGIONAL LAWS ---
  {
    id: 'eg-civil-code',
    title: 'القانون المدني المصري',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 131 لسنة 1948',
    country: 'EG',
    publishDate: '1948-07-16',
    lawBranch: LawBranch.CIVIL,
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مصر', 'مدني', 'سنهوري', 'أم القوانين'],
    description: 'القانون المدني المصري، المصدر التاريخي والرئيسي للعديد من القوانين المدنية العربية.',
  },
  {
    id: 'ksa-civil-transactions',
    title: 'نظام المعاملات المدنية السعودي',
    type: LegalResourceType.LAW,
    documentNumber: 'مرسوم ملكي رقم (م/191)',
    country: 'SA',
    publishDate: '2023-06-19',
    lawBranch: LawBranch.CIVIL,
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['السعودية', 'مدني', 'معاملات', 'تشريع حديث'],
    description: 'النظام الجديد الذي ينظم المعاملات المدنية في المملكة العربية السعودية.',
  },
  {
    id: 'uae-personal-data',
    title: 'قانون حماية البيانات الشخصية الإماراتي',
    type: LegalResourceType.LAW,
    documentNumber: 'مرسوم بقانون اتحادي رقم 45 لسنة 2021',
    country: 'AE',
    publishDate: '2021-09-20',
    lawBranch: LawBranch.OTHER, // Technology/Privacy
    keywords: ['الإمارات', 'بيانات', 'خصوصية', 'تقنية'],
    description: 'القانون الاتحادي بشأن حماية البيانات الشخصية في دولة الإمارات العربية المتحدة.',
  },

  // --- BOOKS & LEGAL REFERENCES (LIBRARY) ---
  {
    id: 'book-sanhuri-waseet',
    title: 'الوسيط في شرح القانون المدني الجديد',
    type: LegalResourceType.LEGAL_ARTICLE, // Using Article type for Books/References
    category: 'كتب ومراجع فقهية',
    country: 'EG', // Origin
    publishDate: '1952-01-01',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'المؤلف: عبد الرزاق السنهوري',
    resourceStatus: LegalResourceStatus.HISTORICAL_REFERENCE,
    keywords: ['كتاب', 'فقه', 'سنهوري', 'مرجع', 'مدني'],
    description: 'الموسوعة القانونية الأشهر "الوسيط"، وتعتبر المرجع الأول في شرح القانون المدني في العالم العربي.',
    internalNotes: 'متوفر نسخة PDF في المكتبة الداخلية.',
  },
  {
    id: 'book-admin-law',
    title: 'مبادئ القانون الإداري الكويتي',
    type: LegalResourceType.LEGAL_ARTICLE,
    category: 'كتب ومراجع فقهية',
    country: 'KW',
    publishDate: '2010-01-01',
    lawBranch: LawBranch.ADMINISTRATIVE,
    issuingAuthority: 'المؤلف: د. عادل الطبطبائي',
    keywords: ['كتاب', 'إداري', 'قرارات إدارية', 'مجلس الدولة'],
    description: 'كتاب شامل يشرح النظام الإداري والقضاء الإداري في دولة الكويت.',
  },
  {
    id: 'book-commercial-papers',
    title: 'الأوراق التجارية والإفلاس في القانون الكويتي',
    type: LegalResourceType.LEGAL_ARTICLE,
    category: 'كتب ومراجع فقهية',
    country: 'KW',
    publishDate: '2018-05-01',
    lawBranch: LawBranch.COMMERCIAL,
    issuingAuthority: 'المؤلف: د. طعمة الشمري',
    keywords: ['كتاب', 'تجاري', 'شيكات', 'كمبيالة', 'إفلاس'],
    description: 'شرح وافٍ لأحكام الأوراق التجارية (الشيك، الكمبيالة، السند لأمر) ونظام الإفلاس.',
  },
  {
    id: 'ref-cassation-principles',
    title: 'مجموعة المبادئ القانونية الصادرة عن محكمة التمييز (القسم المدني)',
    type: LegalResourceType.JUDICIAL_PRECEDENT,
    category: 'مجموعات أحكام',
    country: 'KW',
    publishDate: '2022-12-31',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'المكتب الفني لمحكمة التمييز',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['أحكام', 'تمييز', 'مبادئ', 'سوابق'],
    description: 'تجميع للمبادئ القانونية التي قررتها محكمة التمييز الكويتية خلال السنوات العشر الأخيرة.',
  },
];

// Form Modal Component
interface LegalResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: LegalResource) => void;
  initialData?: Partial<LegalResource> | null;
}

const LegalResourceFormModal: React.FC<LegalResourceFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const getInitialFormData = (): Partial<LegalResource> => {
    return initialData || {
      type: LegalResourceType.LAW,
      country: 'KW' as CountryCode, 
      publishDate: new Date().toISOString().split('T')[0],
      keywords: [],
      resourceStatus: LegalResourceStatus.ACTIVE,
      relatedDocuments: [],
    };
  };

  const [formData, setFormData] = useState<Partial<LegalResource>>(getInitialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'content' | 'relations'>('basic');

  useEffect(() => {
    if (isOpen) {
        setFormData(getInitialFormData());
        setIsUploading(false);
        setActiveFormTab('basic');
    }
  }, [initialData, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({ 
        ...prev, 
        filePathOrLink: file.name,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "") 
      }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'keywords') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else if (name === 'country') {
      setFormData(prev => ({ ...prev, [name]: value as CountryCode }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRelatedDocsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const lines = e.target.value.split('\n');
      const relatedDocs = lines.map(line => {
          const parts = line.split('|'); 
          return { title: parts[0]?.trim() || '', number: parts[1]?.trim(), relationType: parts[2]?.trim() || 'مرتبط بـ' };
      }).filter(doc => doc.title);
      setFormData(prev => ({ ...prev, relatedDocuments: relatedDocs }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.country || !formData.publishDate) {
        alert("يرجى ملء الحقول الإلزامية: العنوان، النوع، الدولة، وتاريخ النشر.");
        return;
    }
    onSubmit(formData as LegalResource);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'تعديل مصدر قانوني' : 'إضافة مصدر قانوني جديد'} size="xl">
      <div className="flex border-b border-gray-100 mb-6 px-1">
          {['معلومات أساسية', 'المحتوى والملخص', 'الارتباطات القانونية'].map((tab, i) => {
              const tabId = ['basic', 'content', 'relations'][i] as any;
              return (
                <button
                    key={tabId}
                    type="button"
                    onClick={() => setActiveFormTab(tabId)}
                    className={`py-3 px-4 text-xs font-bold transition-all relative ${activeFormTab === tabId ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {tab}
                    {activeFormTab === tabId && <motion.div layoutId="formTabBar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                </button>
              );
          })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {activeFormTab === 'basic' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <Input name="title" label="عنوان المصدر/الكتاب/القانون" value={formData.title || ''} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="type" label="نوع المصدر" value={formData.type} options={legalResourceTypeOptions} onChange={handleChange} required />
                    <Input name="documentNumber" label="رقم القانون/المجلد" value={formData.documentNumber || ''} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="country" label="الدولة" value={formData.country} options={countryOptions} onChange={handleChange} required />
                    <Select name="lawBranch" label="فرع القانون" value={formData.lawBranch || ''} options={[{value: '', label: 'اختر فرع القانون'}, ...lawBranchOptions]} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="issuingAuthority" label="الجهة المصدرة / المؤلف" value={formData.issuingAuthority || ''} onChange={handleChange} placeholder="مثال: مجلس الأمة أو اسم المؤلف" />
                    <Input name="officialGazetteDetails" label="تفاصيل النشر" value={formData.officialGazetteDetails || ''} onChange={handleChange} placeholder="مثال: الكويت اليوم، العدد XXX"/>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input name="publishDate" label="تاريخ النشر" type="date" value={formData.publishDate} onChange={handleChange} required />
                    <Input name="effectiveDate" label="تاريخ السريان" type="date" value={formData.effectiveDate || ''} onChange={handleChange} />
                    <Select name="resourceStatus" label="الحالة" value={formData.resourceStatus} options={legalResourceStatusOptions} onChange={handleChange} containerClassName="md:col-span-2" />
                </div>
            </motion.div>
        )}

        {activeFormTab === 'content' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <TextArea name="description" label="وصف موجز / ملخص" value={formData.description || ''} onChange={handleChange} rows={5} />
                <Input name="keywords" label="الكلمات المفتاحية (يفصل بينها بفاصلة)" value={formData.keywords?.join(', ') || ''} onChange={handleChange} />
                
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">رفع المرفق</label>
                    <div className="flex items-center gap-3">
                        <label className={`flex-grow border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${formData.filePathOrLink ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}>
                            <CloudArrowUpIcon className={`w-8 h-8 ${formData.filePathOrLink ? 'text-primary' : 'text-gray-400'}`} />
                            <span className={`text-xs ${formData.filePathOrLink ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                {formData.filePathOrLink ? `تم اختيار: ${formData.filePathOrLink}` : 'ارفع نسخة رقمية للمصدر (PDF/DOC)'}
                            </span>
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>
                <Input name="filePathOrLink" label="أو رابط خارجي" type="url" value={formData.filePathOrLink || ''} onChange={handleChange} placeholder="https://..." />
            </motion.div>
        )}

        {activeFormTab === 'relations' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <TextArea 
                    name="relatedDocumentsText"
                    label="تشريعات ومراجع مرتبطة (كل مستند في سطر: العنوان|الرقم|العلاقة)" 
                    value={formData.relatedDocuments?.map(d => `${d.title}|${d.number || ''}|${d.relationType}`).join('\n') || ''} 
                    onChange={handleRelatedDocsChange} 
                    rows={4}
                    placeholder="مثال: دستور الكويت|1962|المرجع الأساسي"
                />
                <TextArea name="internalNotes" label="مذكرات داخلية (للمحامين فقط)" value={formData.internalNotes || ''} onChange={handleChange} rows={4} />
            </motion.div>
        )}

        <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="w-32">إلغاء</Button>
          <Button type="submit" variant="primary" className="w-48">{initialData?.id ? 'حفظ التعديلات' : 'إضافة إلى المكتبة'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// View Details Modal Component
interface ViewLegalResourceModalProps {
  resource: LegalResource | null;
  onClose: () => void;
}

const ViewLegalResourceModal: React.FC<ViewLegalResourceModalProps> = ({ resource, onClose }) => {
  if (!resource) return null;
  const formatDateAr = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' }) : 'غير محدد';

  const [aiAnalysisType, setAiAnalysisType] = useState<'summary' | 'impact' | 'expert' | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAiAnalysis = async (type: 'summary' | 'impact' | 'expert') => {
      setAiAnalysisType(type);
      setIsAiLoading(true);
      try {
          let prompt = '';
          if (type === 'summary') {
              prompt = `لخص المصدر القانوني التالي بشكل مهني: ${resource.title}. مع توضيح نطاق التطبيق والجهة المصدرة. الوصف المتاح: ${resource.description}`;
          } else if (type === 'impact') {
               prompt = `ما هو الأثر القانوني والعملي لهذا المصدر: ${resource.title} على الأفراد والشركات في ${resource.country}؟ وكيف يؤثر على المراكز القانونية القائمة؟`;
          } else {
               prompt = `بصفتك مستشاراً قانونياً خبيراً، قدم تحليلاً نقدياً متعمقاً للمصدر: ${resource.title}. اذكر الثغرات المحتملة، وكيفية استغلال ثغراته في الدفاع أو التقاضي، ونقاط القوة والضعف في صياغته.`;
          }
          const response = await geminiService.getChatbotResponse(prompt);
          setAiResponse(response);
      } catch (e) {
          setAiResponse("عذراً، فشل المساعد الذكي في توليد التحليل المطلوب.");
      } finally {
          setIsAiLoading(false);
      }
  };

  return (
    <Modal isOpen={!!resource} onClose={onClose} title={`عرض المصدر: ${resource.title}`} size="xl">
      <div className="printable-resource-wrapper grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="bg-gradient-to-l from-gray-50 to-white p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-primary-dark leading-tight">{resource.title}</h2>
                    <LegalResourceStatusBadge status={resource.resourceStatus} />
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <InformationCircleIcon className="w-4 h-4" /> <span>الرقم: {resource.documentNumber || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <BuildingLibraryIcon className="w-4 h-4" /> <span>الجهة: {resource.issuingAuthority || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <CalendarDaysIcon className="w-4 h-4" /> <span>نُشر في: {formatDateAr(resource.publishDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <ScaleIcon className="w-4 h-4" /> <span>الفرع: {resource.lawBranch || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-bold text-gray-700 border-r-4 border-primary pr-3 flex items-center gap-2">
                    <ListBulletIcon className="w-5 h-5 text-primary" /> نبذة وجوهر المصدر
                </h3>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed text-sm">
                    {resource.description || 'لا يوجد وصف تفصيلي متوفر.'}
                </div>
            </div>

            {resource.relatedDocuments && resource.relatedDocuments.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 border-r-4 border-amber-500 pr-3 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-amber-500" /> ارتباطات قانونية وثيقة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resource.relatedDocuments.map((doc, idx) => (
                            <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between group cursor-pointer hover:bg-amber-100 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-amber-900">{doc.title}</span>
                                    <span className="text-[10px] text-amber-700 opacity-60">{doc.relationType} | {doc.number}</span>
                                </div>
                                <ArrowUpRightIcon className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl shadow-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary-light">
                    <BrainIcon className="w-6 h-6" /> التحليل الذكي المتقدم (AI)
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                    <Button variant={aiAnalysisType === 'summary' ? 'primary' : 'ghost'} size="sm" onClick={() => getAiAnalysis('summary')} className="text-white border-white/20">توليد ملخص تنفيذي</Button>
                    <Button variant={aiAnalysisType === 'impact' ? 'primary' : 'ghost'} size="sm" onClick={() => getAiAnalysis('impact')} className="text-white border-white/20">تحليل الأثر القانوني</Button>
                    <Button variant={aiAnalysisType === 'expert' ? 'primary' : 'ghost'} size="sm" onClick={() => getAiAnalysis('expert')} className="text-white border-white/20">رأي المستشار الذكي</Button>
                </div>
                
                <AnimatePresence mode="wait">
                    {isAiLoading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                                <SparklesIcon className="w-10 h-10 text-amber-400" />
                            </motion.div>
                            <p className="text-xs italic text-gray-400 animate-pulse">جاري صياغة التحليل القانوني...</p>
                        </motion.div>
                    ) : aiResponse ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="chatbot-md bg-white/5 p-4 rounded-xl text-xs text-gray-300 border border-white/10 leading-loose">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </motion.div>
                    ) : (
                        <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-gray-500 text-xs italic">
                            اختر نوع التحليل المطلوب للبدء
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        <div className="space-y-4 print-hide">
            <div className="bg-primary p-6 rounded-3xl text-white shadow-lg shadow-primary/20">
                <h4 className="font-bold mb-4 text-sm">إجراءات سريعة</h4>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-xs border-white/30 text-white hover:bg-white/10" onClick={() => window.print()}>
                        <PrinterIcon className="w-4 h-4 me-2" /> طباعة هذا التقرير
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs border-white/30 text-white hover:bg-white/10" onClick={() => {
                        if (resource.filePathOrLink) window.open(resource.filePathOrLink, '_blank');
                    }}>
                        <CloudArrowUpIcon className="w-4 h-4 me-2" /> فتح الملف الأصلي
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs border-white/30 text-white hover:bg-white/10">
                        <ShareIcon className="w-4 h-4 me-2" /> مشاركة مع زميل
                    </Button>
                </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-4 text-sm flex items-center gap-2">
                    <TagIcon className="w-4 h-4" /> فئات ومفاتيح
                </h4>
                <div className="flex flex-wrap gap-2">
                    {resource.keywords.map(k => (
                        <span key={k} className="px-2 py-1 bg-white rounded-lg border border-amber-200 text-[10px] text-amber-700 font-bold">#{k}</span>
                    ))}
                </div>
            </div>

            {resource.internalNotes && (
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-4 text-sm flex items-center gap-2">
                        <PencilIcon className="w-4 h-4" /> ملاحظات المكتب
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed italic">"{resource.internalNotes}"</p>
                </div>
            )}
        </div>
      </div>
      
      <div className="print-hide w-full flex justify-end pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} className="w-32">إغلاق النافذة</Button>
      </div>
    </Modal>
  );
};


const ResourceTable: React.FC<{
    resources: LegalResource[];
    pinnedIds: string[];
    togglePin: (id: string) => void;
    onView: (res: LegalResource) => void;
    onEdit: (res: LegalResource) => void;
    onDelete: (id: string) => void;
}> = ({ resources, pinnedIds, togglePin, onView, onEdit, onDelete }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try { return new Date(dateString).toLocaleDateString('ar-EG'); } catch(e) { return dateString || '-'; }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-3 w-8"></th>
                        {['العنوان', 'التصنيف', 'الدولة', 'الفرع', 'المصدر/المؤلف', 'التاريخ', 'إجراءات'].map(header => (
                            <th key={header} scope="col" className="px-3 py-3 text-right font-medium text-gray-600 uppercase tracking-wider">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                    {resources.map((res, index) => (
                    <motion.tr 
                        key={res.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                        className="group hover:bg-primary-light/[0.03] transition-colors"
                    >
                        <td className="px-3 py-2 text-center">
                            <button onClick={() => togglePin(res.id)} className={`transition-colors ${pinnedIds.includes(res.id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'}`}>
                                {pinnedIds.includes(res.id) ? <SaveIcon className="w-4 h-4 fill-current" /> : <SaveIcon className="w-4 h-4" />}
                            </button>
                        </td>
                        <td className="px-3 py-2">
                            <div className="font-bold text-gray-800 max-w-xs truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => onView(res)} title={res.title}>{res.title}</div>
                            {res.documentNumber && <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{res.documentNumber}</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${res.type === LegalResourceType.LAW ? 'bg-blue-100 text-blue-700' : res.type === LegalResourceType.LEGAL_ARTICLE ? 'bg-purple-100 text-purple-700' : res.type === LegalResourceType.MINISTERIAL_DECISION ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {res.type === LegalResourceType.LEGAL_ARTICLE ? 'كتاب/مرجع' : res.type === LegalResourceType.LAW ? 'قانون' : res.type === LegalResourceType.MINISTERIAL_DECISION ? 'قرار وزاري' : res.type}
                            </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 flex items-center gap-2">
                            <span className="text-lg">{countryOptions.find(c=>c.value===res.country)?.value === 'KW' ? '🇰🇼' : countryOptions.find(c=>c.value===res.country)?.value === 'SA' ? '🇸🇦' : '🌍'}</span>
                            {countryOptions.find(c=>c.value===res.country)?.label || res.country}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600">{res.lawBranch || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 max-w-[150px] truncate" title={res.issuingAuthority}>{res.issuingAuthority || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 font-mono text-xs">{formatDate(res.publishDate)}</td>
                        <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => onView(res)} title="عرض"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(res)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(res.id)} className="text-danger" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                        </td>
                    </motion.tr>
                    ))}
                </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};

const ResourceGrid: React.FC<{
    resources: LegalResource[];
    pinnedIds: string[];
    togglePin: (id: string) => void;
    onView: (res: LegalResource) => void;
    onEdit: (res: LegalResource) => void;
}> = ({ resources, pinnedIds, togglePin, onView, onEdit }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try { return new Date(dateString).toLocaleDateString('ar-EG'); } catch(e) { return dateString || '-'; }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
            {resources.map((res) => (
                <Card 
                    key={res.id} 
                    className="flex flex-col border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all group overflow-hidden relative"
                >
                    <div className="h-2 w-full bg-primary/20 absolute top-0 left-0" style={{ backgroundColor: res.type === LegalResourceType.LAW ? '#3b82f6' : res.type === LegalResourceType.LEGAL_ARTICLE ? '#8b5cf6' : '#f59e0b'}} />
                    
                    <div className="flex-grow p-5 pt-7">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-primary-dark opacity-50">{res.country}</span>
                            <button onClick={() => togglePin(res.id)} className={`${pinnedIds.includes(res.id) ? 'text-amber-500' : 'text-gray-300'}`}>
                                <SaveIcon className={`w-4 h-4 ${pinnedIds.includes(res.id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors cursor-pointer" onClick={() => onView(res)}>{res.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-3 mb-4 min-h-[2.5rem]">{res.description || 'لا يوجد وصف متاح لهذا المصدر.'}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                            {res.keywords.slice(0, 3).map(k => <span key={k} className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border">{k}</span>)}
                        </div>
                    </div>

                    <div className="p-4 pt-0 mt-auto bg-gray-50/50 flex items-center justify-between border-t border-gray-100/50">
                        <div className="text-[10px] text-gray-400 font-medium">{formatDate(res.publishDate)}</div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => onView(res)}><EyeIcon className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(res)} className="text-primary"><PrinterIcon className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const LegalResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LegalResource[]>(mockLegalResourcesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>(''); // Can be 'Book', 'Law', etc.
  const [filterCountry, setFilterCountry] = useState<CountryCode | ''>('');
  const [filterLawBranch, setFilterLawBranch] = useState<LawBranch | ''>('');
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');
  const [filterScope, setFilterScope] = useState<'LOCAL' | 'REGIONAL' | 'INTERNATIONAL' | ''>('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<LegalResource> | null>(null);
  const [viewingResource, setViewingResource] = useState<LegalResource | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [groupBy, setGroupBy] = useState<'branch' | 'property' | 'none'>('none');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'ai'>('all');

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const stats = useMemo(() => ({
    total: resources.length,
    laws: resources.filter(r => r.type === LegalResourceType.LAW).length,
    books: resources.filter(r => r.type === LegalResourceType.LEGAL_ARTICLE || r.category?.includes('كتب')).length,
    decisions: resources.filter(r => r.type === LegalResourceType.MINISTERIAL_DECISION).length,
    precedents: resources.filter(r => r.type === LegalResourceType.JUDICIAL_PRECEDENT).length
  }), [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // Exclude 'Template' type from LegalResourcesPage display
      if (res.type === LegalResourceType.TEMPLATE) return false;

      if (activeTab === 'bookmarks' && !pinnedIds.includes(res.id)) return false;
      
      const searchMatch = (
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        res.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      let typeMatch = true;
      if (filterType === 'BOOK') {
          typeMatch = res.type === LegalResourceType.LEGAL_ARTICLE || (res.keywords && res.keywords.includes('كتاب'));
      } else if (filterType === 'LAW') {
          typeMatch = res.type === LegalResourceType.LAW || res.type === LegalResourceType.DECREE;
      } else if (filterType === 'DECISION') {
          typeMatch = res.type === LegalResourceType.MINISTERIAL_DECISION || res.type === LegalResourceType.EXECUTIVE_REGULATION;
      } else if (filterType) {
          typeMatch = res.type === filterType;
      }

      const countryMatch = filterCountry ? res.country === filterCountry : true;
      const lawBranchMatch = filterLawBranch ? res.lawBranch === filterLawBranch : true;

      // Grouping property support
      const propertyMatch = filterPropertyId ? res.propertyId === filterPropertyId : true;

      let scopeMatch = true;
      if (filterScope === 'LOCAL') {
        scopeMatch = res.country === 'KW';
      } else if (filterScope === 'REGIONAL') {
        scopeMatch = ['SA', 'AE', 'EG', 'JO'].includes(res.country || '');
      } else if (filterScope === 'INTERNATIONAL') {
        scopeMatch = res.lawBranch === LawBranch.INTERNATIONAL || (res.keywords && res.keywords.includes('دولي'));
      }

      return searchMatch && typeMatch && countryMatch && lawBranchMatch && scopeMatch && propertyMatch;
    }).sort((a,b) => {
        // Pinned ones first
        const aPinned = pinnedIds.includes(a.id);
        const bPinned = pinnedIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
  }, [resources, searchTerm, filterType, filterCountry, filterLawBranch, filterScope, pinnedIds, activeTab, filterPropertyId]);

  const groupedResources = useMemo(() => {
    if (groupBy === 'none') return null;
    const groups: Record<string, LegalResource[]> = {};
    filteredResources.forEach(res => {
      let key = 'Other';
      if (groupBy === 'branch') key = res.lawBranch || 'متفرقة';
      if (groupBy === 'property') key = res.propertyId || 'عام';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(res);
    });
    return groups;
  }, [filteredResources, groupBy]);

  const handleAddResource = () => {
    setEditingResource(null);
    setIsFormModalOpen(true);
  };

  const handleEditResource = (resource: LegalResource) => {
    setEditingResource(resource);
    setIsFormModalOpen(true);
  };

  const handleViewResource = (resource: LegalResource) => {
    setViewingResource(resource);
  };

  const handleDeleteResource = useCallback((resourceId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المصدر؟')) {
      setResources(prev => prev.filter(r => r.id !== resourceId));
    }
  }, []);

  const togglePin = (id: string) => {
    setPinnedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleFormSubmit = (data: LegalResource) => {
    if (editingResource?.id) {
      setResources(prev => prev.map(r => (r.id === editingResource.id ? { ...data, id: r.id } : r)));
    } else {
      setResources(prev => [{ ...data, id: `res-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingResource(null);
  };

  const handleAskAi = async () => {
      if (!aiQuestion.trim()) return;
      setIsAiLoading(true);
      try {
          const libraryContext = resources.slice(0, 5).map(r => `- ${r.title}: ${r.description}`).join('\n');
          const prompt = `أنت مساعد قانوني خبير في مكتب "صبري شطا". 
          بناءً على المصادر المتاحة في مكتبتنا (أهمها:\n${libraryContext})\n
          أجب على السؤال التالي بعمق ومهنية: ${aiQuestion}`;
          const response = await geminiService.getChatbotResponse(prompt);
          setAiResponse(response);
      } catch (err) {
          setAiResponse("عذراً، حدث خطأ أثناء معالجة السؤال الذكي.");
      } finally {
          setIsAiLoading(false);
      }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('ar-EG'); } catch(e) { return dateString; }
  };

  return (
    <div className="space-y-6">
      <PrintHeader title="المكتبة الرقمية والمراجع القانونية" subtitle="تقرير جرد وتحليل محتويات المكتبة القانونية" />

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center mb-4 md:mb-0">
            <div className="p-3 bg-primary/10 rounded-2xl me-4">
                <BuildingLibraryIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-primary-dark">المكتبة الرقمية</h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">المرجع المتكامل للتشريعات والمبادئ القانونية</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('ai')} className={activeTab === 'ai' ? 'ring-2 ring-primary border-primary' : ''}>
                <SparklesIcon className="w-5 h-5 me-2 text-amber-500" />
                المساعد الذكي
            </Button>
            <Button onClick={handleAddResource} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
                إضافة مصدر جديد
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: 'القوانين', count: stats.laws, icon: ScaleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'مراجع وفقه', count: stats.books, icon: BookOpenIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'قرارات ولائحة', count: stats.decisions, icon: ClipboardDocumentListIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'سوابق قضائية', count: stats.precedents, icon: GavelIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -4 }}
                className={`${stat.bg} p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between`}
              >
                  <div>
                      <p className={`text-xs font-bold ${stat.color} mb-1`}>{stat.label}</p>
                      <p className="text-2xl font-black text-gray-800">{stat.count}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-40`} />
              </motion.div>
          ))}
      </div>

      <div className="flex border-b border-gray-200">
          {[
              { id: 'all', label: 'كافة المصادر', icon: ListBulletIcon },
              { id: 'bookmarks', label: 'المصادر المفضلة', icon: SaveIcon },
              { id: 'ai', label: 'البحث الذكي (AI)', icon: SparklesIcon },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 text-sm font-medium transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}
              </button>
          ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ai' ? (
            <motion.div 
                key="ai-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
            >
                <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                                <BrainIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary">المساعد القانوني الذكي</h3>
                                <p className="text-xs text-gray-500">اطرح أسئلة قانونية بناءً على محتوى المكتبة</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <TextArea 
                                placeholder="مثال: ما هي شروط الاستقالة في قانون العمل الكويتي؟ أو ابحث عن القوانين المنظمة للجرائم الإلكترونية..."
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                containerClassName="flex-grow"
                                rows={2}
                            />
                            <Button 
                                onClick={handleAskAi} 
                                isLoading={isAiLoading}
                                className="self-end h-[60px]"
                                leftIcon={<SendIcon className="w-5 h-5" />}
                            >
                                اسأل
                            </Button>
                        </div>
                    </div>
                </Card>

                {aiResponse && (
                    <Card className="bg-white chatbot-md p-6 leading-relaxed border-primary/30">
                        <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-400 border-b pb-2">
                            <span className="flex items-center gap-2 italic">
                                <InformationCircleIcon className="w-4 h-4" /> إجابة مولدة آلياً
                            </span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setAiResponse(null)} className="text-gray-400">مسح</Button>
                                <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-primary"><PrinterIcon className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        <div className="markdown-body">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </div>
                    </Card>
                )}
            </motion.div>
        ) : (
            <motion.div 
                key="list-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
            >
                <Card>
                    <div className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-grow w-full">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input 
                                    placeholder="ابحث بالعنوان، المؤلف، المحتوى..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 bg-gray-50 border-transparent focus:border-primary shadow-sm"
                                    containerClassName="mb-0"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className={`flex-1 md:flex-initial gap-2 ${showAdvancedFilters ? 'bg-primary/5 border-primary text-primary' : ''}`}
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                >
                                    <ListBulletIcon className="w-4 h-4" />
                                    تصفية متقدمة
                                </Button>
                                <div className="flex bg-gray-50 rounded-lg p-1 border">
                                    <button className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow text-primary' : 'text-gray-400'}`} onClick={() => setViewMode('table')}><ListBulletIcon className="w-5 h-5" /></button>
                                    <button className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-400'}`} onClick={() => setViewMode('grid')}><Squares2X2Icon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showAdvancedFilters && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                                >
                                    <Select label="النوع" options={[{value: '', label: 'الكل'}, ...legalResourceTypeOptions]} value={filterType} onChange={(e) => setFilterType(e.target.value)} containerClassName="mb-0"/>
                                    <Select label="الدولة" options={[{value:'', label:'الكل'}, ...countryOptions]} value={filterCountry} onChange={(e) => setFilterCountry(e.target.value as CountryCode | '')} containerClassName="mb-0"/>
                                    <Select label="الفرع القانوني" options={[{value: '', label: 'الكل'}, ...lawBranchOptions]} value={filterLawBranch} onChange={(e) => setFilterLawBranch(e.target.value as LawBranch | '')} containerClassName="mb-0"/>
                                    <Select label="العقار المرتبط" options={[{value: '', label: 'أي عقار'}, ...mockProperties.map(p => ({ value: p.id, label: p.name }))]} value={filterPropertyId} onChange={(e) => setFilterPropertyId(e.target.value)} containerClassName="mb-0" />
                                    
                                    <div className="lg:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">تجميع حسب</label>
                                        <div className="flex gap-2">
                                            {[
                                                {id: 'none', label: 'بدون تجميع'},
                                                {id: 'branch', label: 'الفرع القانوني'},
                                                {id: 'property', label: 'العقار'}
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setGroupBy(opt.id as any)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${groupBy === opt.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-end lg:col-span-2">
                                        <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterCountry(''); setFilterLawBranch(''); setFilterPropertyId(''); setFilterScope(''); setGroupBy('none'); }} className="text-gray-400 hover:text-danger">إعادة تعيين كافة المرشحات</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 border-t border-gray-50">
                        {groupBy !== 'none' && groupedResources ? (
                            <div className="space-y-12">
                                {Object.entries(groupedResources).map(([key, docs]) => {
                                    const groupName = groupBy === 'property' ? mockProperties.find(p => p.id === key)?.name || 'عام' : key;
                                    return (
                                        <div key={key} className="space-y-4">
                                            <div className="flex items-center gap-3 border-r-4 border-primary pr-3 py-1">
                                                <h3 className="text-lg font-black text-gray-800">{groupName}</h3>
                                                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-400 rounded-full">{docs.length}</span>
                                            </div>
                                            {viewMode === 'table' ? (
                                                <ResourceTable resources={docs} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} onDelete={handleDeleteResource} />
                                            ) : (
                                                <ResourceGrid resources={docs} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            filteredResources.length > 0 ? (
                                viewMode === 'table' ? (
                                    <ResourceTable resources={filteredResources} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} onDelete={handleDeleteResource} />
                                ) : (
                                    <ResourceGrid resources={filteredResources} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} />
                                )
                            ) : (
                                <div className="text-center py-20 text-gray-400 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                                    <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-medium">عذراً، لم نجد ما تبحث عنه</p>
                                    <p className="text-sm italic">جرب تغيير معايير البحث أو التصفية</p>
                                </div>
                            )
                        )}
                    </div>
                    
                    {filteredResources.length > 0 && (
                        <div className="p-4 border-t flex justify-between items-center text-[10px] text-gray-400 font-medium bg-gray-50/30">
                            <span>إجمالي النتائج: {filteredResources.length}</span>
                            <span className="flex items-center gap-1"><HistoryIcon className="w-3 h-3" /> تم التحديث: {new Date().toLocaleTimeString('ar-KW')}</span>
                        </div>
                    )}
                </Card>
            </motion.div>
        )}
      </AnimatePresence>

      <LegalResourceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingResource}
      />
      <ViewLegalResourceModal
        resource={viewingResource}
        onClose={() => setViewingResource(null)}
      />
    </div>
  );
};

export default LegalResourcesPage;
