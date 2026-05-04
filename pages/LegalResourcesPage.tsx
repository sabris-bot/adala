
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
import { FolderIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, InformationCircleIcon, PrinterIcon, BookOpenIcon, BuildingLibraryIcon, CloudArrowUpIcon, SparklesIcon, BrainIcon } from '../constants';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
    legalResourceTypeOptions, 
    lawBranchOptions, 
    legalResourceStatusOptions, 
    countryOptions,
    kuwaitIssuingAuthoritiesOptions
} from '../constants';

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
      country: 'KW' as CountryCode, // Use 'KW'
      publishDate: new Date().toISOString().split('T')[0],
      keywords: [],
      resourceStatus: LegalResourceStatus.ACTIVE,
      relatedDocuments: [],
    };
  };

  const [formData, setFormData] = useState<Partial<LegalResource>>(getInitialFormData);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setFormData(getInitialFormData());
        setIsUploading(false);
    }
  }, [initialData, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // In a real app, you'd upload this to a server. 
      // Here we simulate success and set the "filePathOrLink" to the filename for now
      setFormData(prev => ({ 
        ...prev, 
        filePathOrLink: file.name,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "") // Set title from filename if empty
      }));
      setIsUploading(false);
      alert(`تم رفع الملف: ${file.name} بنجاح (معاينة)`);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'keywords') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
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
    if (!formData.title || !formData.type || !formData.country || !formData.publishDate) {
        alert("يرجى ملء الحقول الإلزامية: العنوان، النوع، الدولة، وتاريخ النشر.");
        return;
    }
    onSubmit(formData as LegalResource);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'تعديل مصدر قانوني' : 'إضافة مصدر قانوني جديد'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
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
            <Input name="officialGazetteDetails" label="تفاصيل النشر (إن وجد)" value={formData.officialGazetteDetails || ''} onChange={handleChange} placeholder="مثال: الكويت اليوم، العدد XXX"/>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="publishDate" label="تاريخ النشر" type="date" value={formData.publishDate} onChange={handleChange} required />
            <Input name="effectiveDate" label="تاريخ السريان" type="date" value={formData.effectiveDate || ''} onChange={handleChange} />
            <Select name="resourceStatus" label="الحالة" value={formData.resourceStatus} options={legalResourceStatusOptions} onChange={handleChange} />
        </div>
        <TextArea name="description" label="وصف موجز / ملخص" value={formData.description || ''} onChange={handleChange} rows={3} />
        <Input name="keywords" label="الكلمات المفتاحية (يفصل بينها بفاصلة)" value={formData.keywords?.join(', ') || ''} onChange={handleChange} />
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">رفع ملف المصدر (PDF, Word, إلخ)</label>
          <div className="flex items-center gap-3">
            <label className={`flex-grow border-2 border-dashed rounded-xl p-3 transition-all cursor-pointer flex items-center justify-center gap-2 ${formData.filePathOrLink ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}>
              <CloudArrowUpIcon className={`w-5 h-5 ${formData.filePathOrLink ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`text-xs ${formData.filePathOrLink ? 'text-primary font-medium' : 'text-gray-500'}`}>
                {formData.filePathOrLink ? `ملف مرفوع: ${formData.filePathOrLink}` : 'اضغط لرفع ملف أو اسحب الملف هنا'}
              </span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,image/*" />
            </label>
            {formData.filePathOrLink && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, filePathOrLink: '' }))} className="text-danger">حذف</Button>
            )}
          </div>
        </div>

        <Input name="filePathOrLink" label="أو رابط (URL) خارجي للمصدر" type="url" value={formData.filePathOrLink || ''} onChange={handleChange} placeholder="https://..." />
        
        <TextArea 
            name="relatedDocumentsText"
            label="مستندات ذات صلة (كل مستند في سطر: العنوان|الرقم|العلاقة)" 
            value={formData.relatedDocuments?.map(d => `${d.title}|${d.number || ''}|${d.relationType}`).join('\n') || ''} 
            onChange={handleRelatedDocsChange} 
            rows={2}
        />
        <TextArea name="internalNotes" label="ملاحظات داخلية" value={formData.internalNotes || ''} onChange={handleChange} rows={2} />

        <div className="flex justify-end space-x-3 space-x-reverse pt-2">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" variant="primary">{initialData?.id ? 'حفظ التعديلات' : 'إضافة المصدر'}</Button>
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
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' }) : 'غير محدد';

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async () => {
      setIsSummarizing(true);
      try {
          const prompt = `قم بتلخيص هذا المصدر القانوني الكويتي/العربي بشكل مهني ومختصر مع ذكر أهم النقاط القانونية:
          العنوان: ${resource.title}
          النوع: ${resource.type}
          الوصف: ${resource.description}
          المؤلف/الجهة: ${resource.issuingAuthority}`;
          const response = await geminiService.getChatbotResponse(prompt);
          setSummary(response);
      } catch (e) {
          setSummary("فشل توليد التلخيص الذكي.");
      } finally {
          setIsSummarizing(false);
      }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={!!resource} onClose={onClose} title={`تفاصيل المصدر: ${resource.title}`} size="lg">
      <div className="printable-resource-wrapper">
        <div className="report-print-header">
            <h1 className="text-xl font-bold">{resource.title}</h1>
            <p className="text-sm">تاريخ النشر: {formatDate(resource.publishDate)} | المصدر: {resource.issuingAuthority || '-'}</p>
        </div>
        <div className="space-y-3 p-2 max-h-[70vh] overflow-y-auto">
            <p><strong>النوع:</strong> {resource.type === LegalResourceType.LEGAL_ARTICLE ? 'كتاب / مرجع' : resource.type}</p>
            {resource.documentNumber && <p><strong>رقم المستند:</strong> {resource.documentNumber}</p>}
            <p><strong>الدولة:</strong> {countryOptions.find(c => c.value === resource.country)?.label || resource.country}</p>
            {resource.lawBranch && <p><strong>فرع القانون:</strong> {resource.lawBranch}</p>}
            {resource.issuingAuthority && <p><strong>الجهة المصدرة / المؤلف:</strong> {resource.issuingAuthority}</p>}
            <p><strong>تاريخ النشر:</strong> {formatDate(resource.publishDate)}</p>
            {resource.resourceStatus && <p><strong>الحالة:</strong> <LegalResourceStatusBadge status={resource.resourceStatus} size="sm"/></p>}
            {resource.description && <div><strong>الوصف:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-gray-100 border rounded">{resource.description}</pre></div>}
            {resource.keywords && resource.keywords.length > 0 && <p><strong>كلمات مفتاحية:</strong> {resource.keywords.join(', ')}</p>}
            {resource.filePathOrLink && (
                <p><strong>الرابط/الملف:</strong> <a href={resource.filePathOrLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{resource.filePathOrLink}</a></p>
            )}
            
            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                    <h5 className="font-bold text-primary flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4"/> ملخص ذكي (AI)
                    </h5>
                    {!summary && (
                        <Button variant="ghost" size="sm" onClick={handleSummarize} isLoading={isSummarizing}>توليد ملخص</Button>
                    )}
                </div>
                {summary && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl chatbot-md text-xs leading-relaxed">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                )}
            </div>

            {resource.internalNotes && <div><strong>ملاحظات داخلية:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">{resource.internalNotes}</pre></div>}
        </div>
      </div>
      <div className="print-hide w-full flex justify-end space-x-2 space-x-reverse pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button variant="primary" onClick={handlePrint} leftIcon={<PrinterIcon className="w-4 h-4"/>}>
            طباعة
          </Button>
      </div>
    </Modal>
  );
};


const LegalResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LegalResource[]>(mockLegalResourcesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>(''); // Can be 'Book', 'Law', etc.
  const [filterCountry, setFilterCountry] = useState<CountryCode | ''>('');
  const [filterLawBranch, setFilterLawBranch] = useState<LawBranch | ''>('');
  const [filterScope, setFilterScope] = useState<'LOCAL' | 'REGIONAL' | 'INTERNATIONAL' | ''>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<LegalResource> | null>(null);
  const [viewingResource, setViewingResource] = useState<LegalResource | null>(null);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // Exclude 'Template' type from LegalResourcesPage display
      if (res.type === LegalResourceType.TEMPLATE) return false;
      
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

      let scopeMatch = true;
      if (filterScope === 'LOCAL') {
        scopeMatch = res.country === 'KW';
      } else if (filterScope === 'REGIONAL') {
        scopeMatch = ['SA', 'AE', 'EG', 'JO'].includes(res.country || '');
      } else if (filterScope === 'INTERNATIONAL') {
        scopeMatch = res.lawBranch === LawBranch.INTERNATIONAL || (res.keywords && res.keywords.includes('دولي'));
      }

      return searchMatch && typeMatch && countryMatch && lawBranchMatch && scopeMatch;
    }).sort((a,b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [resources, searchTerm, filterType, filterCountry, filterLawBranch, filterScope]);

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

  const handleFormSubmit = (data: LegalResource) => {
    if (editingResource?.id) {
      setResources(prev => prev.map(r => (r.id === editingResource.id ? { ...data, id: r.id } : r)));
    } else {
      setResources(prev => [{ ...data, id: `res-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingResource(null);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('ar-EG'); } catch(e) { return dateString; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <BuildingLibraryIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">المكتبة القانونية الشاملة</h1>
        </div>
        <Button onClick={handleAddResource} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إضافة مصدر جديد
        </Button>
      </div>

      <Card className="bg-primary-light/5 border-primary-light/20">
         <div className="flex items-start">
          <BookOpenIcon className="w-6 h-6 text-primary me-3 mt-1 flex-shrink-0"/>
          <div>
            <p className="text-gray-700 leading-relaxed">
              تضم المكتبة مجموعة واسعة من المصادر القانونية: تشريعات وقوانين دولة الكويت، القوانين العربية المقارنة (مصر، السعودية، الإمارات)، بالإضافة إلى قسم خاص للكتب والمراجع الفقهية والأحكام القضائية.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <Input 
                placeholder="ابحث بالعنوان، المؤلف، رقم القانون، الكلمات المفتاحية..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Select label="تصنيف المصدر" 
                    options={[
                        {value: '', label: 'الكل'}, 
                        {value: 'LAW', label: 'قوانين وتشريعات'}, 
                        {value: 'BOOK', label: 'كتب ومراجع فقهية'},
                        {value: 'DECISION', label: 'قرارات وزارية ولوائح'},
                        {value: LegalResourceType.JUDICIAL_PRECEDENT, label: 'أحكام قضائية'}
                    ]} 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)} 
                    containerClassName="mb-0"
                />
                <Select label="النطاق الجغرافي" 
                    options={[
                        {value: '', label: 'الكل'},
                        {value: 'LOCAL', label: 'محلي (كويتي)'},
                        {value: 'REGIONAL', label: 'إقليمي (عربي)'},
                        {value: 'INTERNATIONAL', label: 'دولي/أجنبي'}
                    ]} 
                    value={filterScope} 
                    onChange={(e) => setFilterScope(e.target.value as any)} 
                    containerClassName="mb-0"
                />
                <Select label="الدولة" options={[{value:'', label:'الكل'}, ...countryOptions]} value={filterCountry} onChange={(e) => setFilterCountry(e.target.value as CountryCode | '')} containerClassName="mb-0"/>
                <Select label="فرع القانون" options={[{value: '', label: 'الكل'}, ...lawBranchOptions]} value={filterLawBranch} onChange={(e) => setFilterLawBranch(e.target.value as LawBranch | '')} containerClassName="mb-0"/>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['العنوان', 'التصنيف', 'الدولة', 'الفرع', 'المصدر/المؤلف', 'التاريخ', 'إجراءات'].map(header => (
                  <th key={header} scope="col" className="px-3 py-3 text-right font-medium text-gray-600">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence mode="popLayout">
                {filteredResources.map((res, index) => (
                  <motion.tr 
                    key={res.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2">
                        <div className="font-semibold text-primary-dark max-w-xs truncate" title={res.title}>{res.title}</div>
                        {res.documentNumber && <div className="text-xs text-gray-500">{res.documentNumber}</div>}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${res.type === LegalResourceType.LAW ? 'bg-blue-100 text-blue-800' : res.type === LegalResourceType.LEGAL_ARTICLE ? 'bg-purple-100 text-purple-800' : res.type === LegalResourceType.MINISTERIAL_DECISION ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}>
                          {res.type === LegalResourceType.LEGAL_ARTICLE ? 'كتاب/مرجع' : res.type === LegalResourceType.LAW ? 'قانون' : res.type === LegalResourceType.MINISTERIAL_DECISION ? 'قرار وزاري' : res.type}
                        </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">{countryOptions.find(c=>c.value===res.country)?.label || res.country}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">{res.lawBranch || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700 max-w-[150px] truncate" title={res.issuingAuthority}>{res.issuingAuthority || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">{formatDate(res.publishDate)}</td>
                    <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                      <Button variant="ghost" size="sm" onClick={() => handleViewResource(res)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditResource(res)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(res.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                     <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    لا توجد مصادر تطابق معايير البحث الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         {filteredResources.length > 0 && <p className="pt-4 text-xs text-gray-500 text-center">إجمالي المصادر المعروضة: {filteredResources.length}</p>}
      </Card>

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
