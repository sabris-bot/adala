import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { 
    FolderIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    InformationCircleIcon, PaperClipIcon, ArrowRightIcon,
    DocumentTextIcon, ScaleIcon, ShieldCheckIcon, BuildingLibraryIcon,
    ExclamationTriangleIcon, SparklesIcon, CheckCircleIcon
} from '../constants';
import { 
    PropertyDocument, PropertyDocumentType, Property, 
    PropertyUnit, PropertyUnitStatus, PropertyType, Case
} from '../types';
import { mockProperties, mockPropertyDocuments } from '../data/propertyData';
import { initialCases as mockCases } from '../data/caseData';
import { propertyDocumentTypeOptions } from '../constants';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

// Helper date formatter
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; }
};

// Rich Mock Documents with full OCR Text & Extracted Entities
const ENRICHED_PROPERTY_DOCUMENTS: PropertyDocument[] = [
  {
    id: 'DOC-101',
    propertyId: 'PROP-001',
    unitId: 'unit-1',
    documentName: 'عقد إيجار موثق - المادة 20 (برج ناصر)',
    documentType: PropertyDocumentType.DEED,
    issueDate: '2025-01-15',
    expiryDate: '2027-01-14',
    referenceNumber: 'LEASE-KW-2025-101',
    filePathOrLink: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80',
    description: 'عقد رسمي موثق بقصر العدل لمدة سنتين قابل للتجديد بموجب أحكام المادة 20 قانون الإيجارات الكويتي',
    ocrContent: `عقد إيجار شقة سكنية - برج ناصر السكني - المادة 20
إنه في يوم الأحد 2025/01/15، تحرر هذا العقد بين:
الطرف الأول (المؤجر): مكتب المحامي صبري شطا بصفتيه مديراً وممثلاً قانونياً لبرج ناصر السكني بالرقم الآلي 28409182.
الطرف الثاني (المستأجر): شركة المسار للتجارة العامة (الرقم المدني: 298041599812).
العين المؤجرة: الشقة رقم 101، الطابق الأول، برج ناصر - العاصمة.
القيم الإيجارية: 450 دينار كويتي تدفع شهرياً في اليوم الأول من كل شهر ميلادي.
شروط العقد:
1. يلتزم المستأجر بسداد بدل الاستغلال والإيجار في المواعيد المحددة دون تأخير.
2. في حال التأخير عن السداد لمدة تتجاوز 15 يوماً، يحق للمؤجر إشهار إنذار تكليف بالوفاء والمطالبة بفسخ العقد وإخلاء العين.
3. يحظر على المستأجر التنازل عن الإيجار أو التأجير من الباطن دون موافقة كتابية صريحة.`,
    ocrConfidence: 99.4,
    ocrExtractedEntities: {
      parties: ['مكتب المحامي صبري شطا (مؤجر)', 'شركة المسار للتجارة العامة (مستأجر)'],
      amounts: ['450 د.ك شهرياً'],
      dates: ['تاريخ العقد: 2025/01/15', 'تاريخ الانتهاء: 2027/01/14'],
      paciNumber: '28409182',
      legalClauses: ['المادة 20 من قانون الإيجارات', 'إنذار تكليف بالوفاء خلال 15 يوماً', 'حظر التأجير من الباطن']
    },
    uploadedBy: 'مستخدم النظام - مكتب المحامي صبري شطا',
    uploadedAt: '2025-01-15',
    tags: ['عقد_إيجار', 'تجديد_2025', 'المادة_20', 'موثق_عدالة'],
    relatedCaseIds: ['CASE-001']
  },
  {
    id: 'DOC-102',
    propertyId: 'PROP-001',
    documentName: 'سند ملكية وتأمين حريق برج ناصر',
    documentType: PropertyDocumentType.DEED,
    issueDate: '2024-06-10',
    expiryDate: '2029-06-09',
    referenceNumber: 'DEED-KW-88402',
    filePathOrLink: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    description: 'سند الملكية الموثق من إدارة التسجيل العقاري بوزارة العدل الكويتية مع وثيقة التأمين الشامل ضد الحريق',
    ocrContent: `دولة الكويت - وزارة العدل - إدارة التسجيل العقاري والتوثيق
سند ملكية عقار رقم 88402 / العاصمة
اسم العقار: برج ناصر السكني - منطقة الشرق - قطعة 3 - قسيمة 12.
المساحة الإجمالية: 1250 متر مربع.
الرقم الآلي للعنوان: 28409182.
المالك المسجل: محفظة العقارات المدارة - مكتب صبري شطا.
وثيقة التأمين: شركة الخليج للتأمين برقم وثيقة GIG-992011 ضد أخطار الحريق والمسؤولية المدنية بقيمة تغطية 2,500,000 د.ك سارية المفعول حتى 2029.`,
    ocrConfidence: 98.8,
    ocrExtractedEntities: {
      parties: ['وزارة العدل - التسجيل العقاري', 'مكتب صبري شطا', 'شركة الخليج للتأمين'],
      amounts: ['تغطية تأمينية 2,500,000 د.ك'],
      dates: ['تاريخ الإصدار: 2024/06/10', 'ساري حتى: 2029/06/09'],
      paciNumber: '28409182',
      legalClauses: ['سند ملكية رسمي مشهر', 'تأمين حريق ومسؤولية مدنية']
    },
    uploadedBy: 'أخصائي السجل العقاري - أحمد السالم',
    uploadedAt: '2024-06-10',
    tags: ['وثيقة_ملكية', 'تسجيل_عقاري', 'تأمين_حريق'],
    relatedCaseIds: []
  },
  {
    id: 'DOC-103',
    propertyId: 'PROP-002',
    unitId: 'unit-12',
    documentName: 'محضر وإيصال صيانة التكييف المركزي',
    documentType: PropertyDocumentType.SERVICE_CONTRACT_ELEVATOR,
    issueDate: '2026-02-01',
    expiryDate: '2027-02-01',
    referenceNumber: 'VOUCH-MNT-9921',
    filePathOrLink: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'إيصال وسند دفع صيانة دورية للمكيفات من شركة الغانم للهندسة مع فواتير الضمان',
    ocrContent: `سند قبض وفاتورة صيانة رقم VOUCH-MNT-9921
الجهة المنفذة: شركة الغانم للهندسة والتبريد WLL.
العقار: مجمع الفروانية التجاري - محل رقم 12.
المبلغ المدفوع: 180 دينار كويتي (مائة وثمانون د.ك).
طريقة الدفع: KNET برقم مرجعي KNET-88201.
تفاصيل العمل: تم استبدال الكومبريسور وتنظيف الدوائر الهيدروليكية مع ضمان لمدة 12 شهراً تبدأ من تاريخ 2026/02/01.`,
    ocrConfidence: 97.6,
    ocrExtractedEntities: {
      parties: ['شركة الغانم للهندسة والتبريد', 'إدارة مجمع الفروانية التجاري'],
      amounts: ['180 د.ك'],
      dates: ['2026/02/01'],
      paciNumber: '19402281',
      legalClauses: ['ضمان صيانة لمدة 12 شهراً']
    },
    uploadedBy: 'محاسب العقارات - خالد جاسم',
    uploadedAt: '2026-02-01',
    tags: ['إيصال', 'صيانة_تكييف', 'فواتير_الغانم'],
    relatedCaseIds: []
  },
  {
    id: 'DOC-104',
    propertyId: 'PROP-002',
    unitId: 'unit-5',
    documentName: 'إعلان إنذار تكليف بالوفاء - المحكمة الكلية',
    documentType: PropertyDocumentType.OTHER,
    issueDate: '2026-02-10',
    expiryDate: '2026-03-10',
    referenceNumber: 'COURT-NOTICE-882/2026',
    filePathOrLink: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    description: 'مسجل بدائرة إعلانات المحكمة الكلية الفروانية برقم 882/2026 تكليف بالوفاء بالأجرة المتأخرة خلال 15 يوماً',
    ocrContent: `دولة الكويت - وزارة العدل - إدارة التنفيذ والإعانات
إعلان إنذار وتكليف بالوفاء بالأجرة المتأخرة
صادر من المحكمة الكلية - دائرة الإيجارات الفروانية
بناءً على طلب الطالب: مكتب المحامي صبري شطا وشركاه بصفته وكيلاً عن المالك.
أعلنت أنا مندوب الإعلانات المستأجر: س.ع (محل رقم 05 بمجمع الفروانية).
الموضوع: تكليف بالوفاء بمبلغ المتأخرات الإيجارية البالغة 1,200 دينار كويتي عن الأشهر 11، 12 لسنة 2025 وشهر 1 لسنة 2026.
تنبيه رسمي: يمنح المستأجر مهلة 15 يوماً من تاريخ هذا الإعلان لتسديد كامل المبلغ، وإلا سيتم إحالة الملف لدائرة القضاء لإصدار حكم بالإخلاء والحجز التحفظي.`,
    ocrConfidence: 99.1,
    ocrExtractedEntities: {
      parties: ['مكتب المحامي صبري شطا (طالب الإعلان)', 'المستأجر س.ع (المعلن إليه)'],
      amounts: ['1,200 د.ك متأخرات'],
      dates: ['2026/02/10', 'مهلة 15 يوماً'],
      paciNumber: '19402281',
      legalClauses: ['تكليف بالوفاء المادة 18', 'دعوى إخلاء وحجز تحفظي']
    },
    uploadedBy: 'المحامي المباشر - صبري شطا',
    uploadedAt: '2026-02-10',
    tags: ['إنذار_قانوني', 'تكليف_بالوفاء', 'المحكمة_الكلية', 'قضية_إيجارات'],
    relatedCaseIds: ['CASE-002']
  },
  {
    id: 'DOC-105',
    propertyId: 'PROP-003',
    documentName: 'رخص الإطفاء والسلامة والتراخيص الرسمية',
    documentType: PropertyDocumentType.BUILDING_PERMIT,
    issueDate: '2025-11-20',
    expiryDate: '2026-11-19',
    referenceNumber: 'LIC-FIRE-2025-092',
    filePathOrLink: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    description: 'شهادة ترخيص المطافئ والسلامة الصادرة من قوة الإطفاء العام وبلدية الكويت لسنة 2026',
    ocrContent: `دولة الكويت - قوة الإطفاء العام - قطاع الوقاية
شهادة ترخيص استيفاء اشتراطات السلامة والوقاية من الحريق
اسم المنشأة/العقار: عمارة حولي الاستثمارية.
الرقم الآلي للعنوان: 38201948 - حولي.
تاريخ الترخيص: 2025/11/20 | ينتهي في: 2026/11/19.
تشهد قوة الإطفاء العام بأن المبنى المذكور أعلاه قد استوفى كافة اشتراطات ومعدات الإطفاء والإنذار المبكر ومخارج الطوارئ طبقاً للكود الكويتي لحماية الأرواح والممتلكات.`,
    ocrConfidence: 98.9,
    ocrExtractedEntities: {
      parties: ['قوة الإطفاء العام الكويتي', 'إدارة عمارة حولي'],
      amounts: ['رسوم الترخيص: 50 د.ك'],
      dates: ['2025/11/20', '2026/11/19'],
      paciNumber: '38201948',
      legalClauses: ['استيفاء الكود الكويتي للإطفاء', 'ترخيص ساري']
    },
    uploadedBy: 'مسؤول المتابعة الإدارية - محمد الخالد',
    uploadedAt: '2025-11-20',
    tags: ['ترخيص_مطافئ', 'بلدية_الكويت', 'سلامة_المباني'],
    relatedCaseIds: []
  }
];

// Helper to resolve property display names cleanly
const getPropertyName = (propId: string, property?: Property): string => {
  if (property?.name) return property.name;
  if (propId === 'PROP-001') return 'برج ناصر السكني (العاصمة)';
  if (propId === 'PROP-002') return 'مجمع الفروانية التجاري';
  if (propId === 'PROP-003') return 'عمارة حولي الاستثمارية';
  return `عقار (${propId})`;
};

export const PropertyDocumentsPage: React.FC = () => {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<PropertyDocument[]>(ENRICHED_PROPERTY_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category tab filter (عقود، إيصالات، مراسلات، تراخيص)
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'contracts' | 'receipts' | 'legal_notices' | 'permits'>('all');
  
  const [filterDocumentType, setFilterDocumentType] = useState<PropertyDocumentType | ''>('');
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');
  const [validityFilter, setValidityFilter] = useState<'all' | 'expired' | 'expiring_soon' | 'valid'>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Partial<PropertyDocument> | null>(null);
  
  // Detailed OCR Analysis Modal State
  const [viewingOcrDoc, setViewingOcrDoc] = useState<PropertyDocument | null>(null);
  const [copiedOcrText, setCopiedOcrText] = useState(false);

  // Corrupted Archive Purge Modal state
  const [purgingDoc, setPurgingDoc] = useState<PropertyDocument | null>(null);
  const [purgeReason, setPurgeReason] = useState('damaged_scan');

  const now = new Date();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  // Calculate Validity Metrics
  const expiredCount = useMemo(() => documents.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length, [documents, now]);
  const expiringSoonCount = useMemo(() => documents.filter(d => {
    if (!d.expiryDate) return false;
    const diff = new Date(d.expiryDate).getTime() - now.getTime();
    return diff > 0 && diff <= thirtyDaysMs;
  }).length, [documents, now]);
  const validCount = useMemo(() => documents.filter(d => !d.expiryDate || new Date(d.expiryDate) > new Date(now.getTime() + thirtyDaysMs)).length, [documents, now]);

  // Advanced Filtering with OCR Full-Text Search
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const query = searchTerm.trim().toLowerCase();
      
      // Full text OCR matching
      const matchName = doc.documentName.toLowerCase().includes(query);
      const matchDesc = doc.description ? doc.description.toLowerCase().includes(query) : false;
      const matchRef = doc.referenceNumber ? doc.referenceNumber.toLowerCase().includes(query) : false;
      const matchTags = doc.tags ? doc.tags.some(tag => tag.toLowerCase().includes(query)) : false;
      const matchOcr = doc.ocrContent ? doc.ocrContent.toLowerCase().includes(query) : false;
      const propName = getPropertyName(doc.propertyId, mockProperties.find(p => p.id === doc.propertyId)).toLowerCase();
      const matchProp = propName.includes(query);

      const matchSearch = query === '' || matchName || matchDesc || matchRef || matchTags || matchOcr || matchProp;

      // Classification category tab match
      let matchCategoryTab = true;
      if (activeCategoryTab === 'contracts') {
        matchCategoryTab = doc.documentType === PropertyDocumentType.DEED || doc.documentName.includes('عقد');
      } else if (activeCategoryTab === 'receipts') {
        matchCategoryTab = doc.documentType === PropertyDocumentType.SERVICE_CONTRACT_ELEVATOR || doc.documentName.includes('إيصال') || doc.documentName.includes('صيانة');
      } else if (activeCategoryTab === 'legal_notices') {
        matchCategoryTab = doc.documentType === PropertyDocumentType.OTHER || doc.documentName.includes('إنذار') || doc.documentName.includes('دعوى');
      } else if (activeCategoryTab === 'permits') {
        matchCategoryTab = doc.documentType === PropertyDocumentType.BUILDING_PERMIT || doc.documentName.includes('رخص');
      }

      const matchType = filterDocumentType ? doc.documentType === filterDocumentType : true;
      const matchPropertyFilter = filterPropertyId ? doc.propertyId === filterPropertyId : true;

      let matchValidity = true;
      if (validityFilter === 'expired') {
        matchValidity = Boolean(doc.expiryDate && new Date(doc.expiryDate) < now);
      } else if (validityFilter === 'expiring_soon') {
        if (!doc.expiryDate) matchValidity = false;
        else {
          const diff = new Date(doc.expiryDate).getTime() - now.getTime();
          matchValidity = diff > 0 && diff <= thirtyDaysMs;
        }
      } else if (validityFilter === 'valid') {
        matchValidity = !doc.expiryDate || new Date(doc.expiryDate) > new Date(now.getTime() + thirtyDaysMs);
      }

      return matchSearch && matchCategoryTab && matchType && matchPropertyFilter && matchValidity;
    }).sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [documents, searchTerm, activeCategoryTab, filterDocumentType, filterPropertyId, validityFilter, now]);

  // Group by property
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, PropertyDocument[]> = {};
    filteredDocuments.forEach(doc => {
      if (!groups[doc.propertyId]) groups[doc.propertyId] = [];
      groups[doc.propertyId].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  const propertyGroups = useMemo(() => {
    return Object.entries(groupedDocuments).map(([propId, docs]) => {
      const property = mockProperties.find(p => p.id === propId);
      const displayName = getPropertyName(propId, property);
      return { propId, property, displayName, documents: docs };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [groupedDocuments]);

  const handleAddDocument = () => { setEditingDocument(null); setIsFormModalOpen(true); };
  const handleEditDocument = (doc: PropertyDocument) => { setEditingDocument(doc); setIsFormModalOpen(true); };

  const handleCopyOcrText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedOcrText(true);
    addToast({
      type: 'success',
      title: '✓ تم نسخ النص الضوئي (OCR)',
      message: 'تم نسخ نص الوثيقة الممسوحة ضوئياً إلى الحافظة بنجاح.'
    });
    setTimeout(() => setCopiedOcrText(false), 3000);
  };

  const handleConfirmPurgeCorrupted = () => {
    if (!purgingDoc) return;
    setDocuments(prev => prev.filter(d => d.id !== purgingDoc.id));
    addToast({
      type: 'success',
      title: '🗑️ تم إتلاف وحذف الأرشيف بنجاح',
      message: `تمت إزالة المستند (${purgingDoc.documentName}) وتوثيق سبب الإتلاف.`
    });
    setPurgingDoc(null);
  };

  const handleFormSubmit = (data: PropertyDocument) => {
    if (editingDocument?.id) {
      setDocuments(prev => prev.map(d => (d.id === editingDocument.id ? data : d)));
      addToast({
        type: 'success',
        title: 'تم تحديث بيانات العقد',
        message: 'تم حفظ التعديلات ورابط الأرشيف بنجاح.'
      });
    } else {
      setDocuments(prev => [{ ...data, id: `DOC-${Date.now()}` }, ...prev]);
      addToast({
        type: 'success',
        title: 'تمت أرشفة المستند الجديد',
        message: 'تمت إضافة المستند ومعالجته ضوئياً بنجاح.'
      });
    }
    setIsFormModalOpen(false); setEditingDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black">
            <FolderIcon className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              📂 أرشيف العقارات الرقمي مع البحث الذكي OCR
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              تصنيف موثق لعقود الإيجار، سندات الملكية، الإيصالات، والمراسلات القانونية مع البحث المباشر في المحتوى الممسوح ضوئياً
            </p>
          </div>
        </div>

        <Button 
          onClick={handleAddDocument} 
          leftIcon={<PlusCircleIcon className="w-5 h-5" />} 
          className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs shrink-0 shadow-lg"
        >
          أرشفة مستند جديد (📷/📁)
        </Button>
      </div>

      {/* Contract Validity Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setValidityFilter(validityFilter === 'expired' ? 'all' : 'expired')}
          className={`p-4 rounded-3xl border transition-all text-right cursor-pointer ${validityFilter === 'expired' ? 'bg-rose-600 text-white border-rose-700 shadow-lg scale-102' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 hover:border-rose-400'}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">🚨 عقود/وثائق منتهية الصلاحية</span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-xs font-mono font-black">{expiredCount}</span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">تستوجب التجديد الفوري أو توجيه إنذارات بالوفاء/الإنهاء</p>
        </button>

        <button
          onClick={() => setValidityFilter(validityFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
          className={`p-4 rounded-3xl border transition-all text-right cursor-pointer ${validityFilter === 'expiring_soon' ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-lg scale-102' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 hover:border-amber-400'}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">⏳ عقود تنتهي قريباً (30 يوماً)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 text-xs font-mono font-black">{expiringSoonCount}</span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">جاهزة لإرسال إشعارات التجديد وزيادة القيمة الإيجارية</p>
        </button>

        <button
          onClick={() => setValidityFilter(validityFilter === 'valid' ? 'all' : 'valid')}
          className={`p-4 rounded-3xl border transition-all text-right cursor-pointer ${validityFilter === 'valid' ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg scale-102' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 hover:border-emerald-400'}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">✅ عقود ووثائق سارية المفعول</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 text-xs font-mono font-black">{validCount}</span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">وثائق موثقة بالكامل ومربوطة بالعين المؤجرة والقضايا</p>
        </button>
    </div>

    {/* Document Category Tabs (تصنيف المستندات) */}
    <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-2 text-xs font-black">
      <button
        onClick={() => setActiveCategoryTab('all')}
        className={`px-4 py-2 rounded-xl transition-all ${activeCategoryTab === 'all' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
      >
        📑 كافة المستندات ({documents.length})
      </button>

      <button
        onClick={() => setActiveCategoryTab('contracts')}
        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeCategoryTab === 'contracts' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
      >
        📜 عقود الإيجار والملكية
      </button>

      <button
        onClick={() => setActiveCategoryTab('receipts')}
        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeCategoryTab === 'receipts' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
      >
        🧾 إيصالات وسندات الصيانة
      </button>

      <button
        onClick={() => setActiveCategoryTab('legal_notices')}
        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeCategoryTab === 'legal_notices' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
      >
        ⚖️ مراسلات وإنذارات قانونية
      </button>

      <button
        onClick={() => setActiveCategoryTab('permits')}
        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeCategoryTab === 'permits' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
      >
        🏛️ تراخيص ومخططات الإطفاء
      </button>
    </div>

    {/* Search & Filter Toolbar */}
    <Card>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl mb-6 space-y-3">
        <div className="relative">
          <Input 
            placeholder="🔍 بحث ذكي في اسم المستند، النص الممسوح ضوئياً (OCR)، الكلمات المفتاحية، أو اسم العقار..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            containerClassName="mb-0"
          />
          {searchTerm && (
            <span className="absolute left-3 top-2.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-amber-600" />
              البحث الضوئي الذكي (OCR) نشط
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select 
            label="نوع المستند" 
            options={[{value:'', label:'كافة التصنيفات'}, ...propertyDocumentTypeOptions]} 
            value={filterDocumentType} 
            onChange={e => setFilterDocumentType(e.target.value as PropertyDocumentType | '')} 
            containerClassName="mb-0"
          />
          <Select 
            label="التصفية حسب العقار" 
            options={[{value:'', label:'كافة العقارات'}, ...mockProperties.map(p=>({value:p.id, label:p.name}))]} 
            value={filterPropertyId} 
            onChange={e => setFilterPropertyId(e.target.value)} 
            containerClassName="mb-0"
          />
        </div>
      </div>

      {/* Document Group List */}
      <div className="space-y-10">
        {propertyGroups.length > 0 ? (
          propertyGroups.map(group => (
            <div key={group.propId} className="group/property space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                    🏢
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white">{group.displayName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">{group.documents.length} مستند مؤرشف وموثق</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800 font-black text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3 text-right">اسم الوثيقة والعقد</th>
                      <th className="px-4 py-3 text-right">التصنيف</th>
                      <th className="px-4 py-3 text-right">الوحدة المرتبطة</th>
                      <th className="px-4 py-3 text-right">تحليل OCR والتطابق</th>
                      <th className="px-4 py-3 text-right">القضايا والمرئيات</th>
                      <th className="px-4 py-3 text-right">تاريخ التوثيق</th>
                      <th className="px-4 py-3 text-right">الصلاحية</th>
                      <th className="px-4 py-3 text-left">إجراءات التحكم</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {group.documents.map(doc => {
                      const unit = group.property?.units?.find(u => u.id === doc.unitId);
                      const linkedCaseCount = doc.relatedCaseIds?.length || 0;
                      const isExpired = doc.expiryDate && new Date(doc.expiryDate) < now;
                      const isExpiringSoon = doc.expiryDate && !isExpired && (new Date(doc.expiryDate).getTime() - now.getTime() <= thirtyDaysMs);
                      
                      const hasOcrMatch = searchTerm.trim() !== '' && doc.ocrContent && doc.ocrContent.toLowerCase().includes(searchTerm.trim().toLowerCase());

                      return (
                        <tr key={doc.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${hasOcrMatch ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                          <td className="px-4 py-4 text-slate-800 dark:text-slate-100 font-bold">
                            <div className="flex items-center gap-2">
                              <PaperClipIcon className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="truncate max-w-xs block font-black text-slate-900 dark:text-white">{doc.documentName}</span>
                                {doc.referenceNumber && <span className="text-[9px] font-mono text-primary font-bold">Ref: {doc.referenceNumber}</span>}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <Badge text={doc.documentType} color="gray" size="xs" className="font-bold"/>
                          </td>

                          <td className="px-4 py-4 text-slate-500 font-bold">
                            {unit ? `وحدة ${unit.unitNumber}` : 'العقار ككل'}
                          </td>

                          <td className="px-4 py-4">
                            {doc.ocrConfidence ? (
                              <button
                                onClick={() => setViewingOcrDoc(doc)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <SparklesIcon className="w-3 h-3 text-amber-500" />
                                OCR {doc.ocrConfidence}%
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {linkedCaseCount > 0 ? (
                              <Badge 
                                text={`${linkedCaseCount} قضية عدالة`} 
                                color="blue" 
                                size="xs" 
                                className="font-bold"
                              />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-slate-500 font-mono">{formatDate(doc.issueDate)}</td>

                          <td className="px-4 py-4">
                            {doc.expiryDate ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                isExpired ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' :
                                isExpiringSoon ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                'bg-emerald-50 text-emerald-700'
                              }`}>
                                {isExpired ? '🚨 منتهي:' : isExpiringSoon ? '⏳ ينتهي قريباً:' : '✓ ساري:'} {formatDate(doc.expiryDate)}
                              </span>
                            ) : <span className="text-slate-400">دائم</span>}
                          </td>

                          <td className="px-4 py-4 text-left">
                            <div className="flex gap-1.5 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setViewingOcrDoc(doc)} 
                                title="معاينة وتحليل OCR" 
                                className="rounded-lg text-amber-600 hover:bg-amber-50"
                              >
                                <EyeIcon className="w-4 h-4"/>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditDocument(doc)} 
                                title="تعديل بيانات العقد" 
                                className="rounded-lg text-slate-600 hover:bg-slate-100"
                              >
                                <PencilIcon className="w-4 h-4"/>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setPurgingDoc(doc)} 
                                title="إتلاف / حذف الأرشيف" 
                                className="rounded-lg text-rose-600 hover:bg-rose-50"
                              >
                                <TrashIcon className="w-4 h-4"/>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-20"/>
            <p className="text-sm font-bold">لا توجد مستندات تطابق خيارات البحث والتصفية الحالية.</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => {setSearchTerm(''); setFilterDocumentType(''); setFilterPropertyId(''); setValidityFilter('all'); setActiveCategoryTab('all');}}>إعادة تعيين المرشحات</Button>
          </div>
        )}
      </div>
    </Card>

    {/* Corrupted Archive Purge Confirmation Modal */}
    {purgingDoc && (
      <Modal isOpen={!!purgingDoc} onClose={() => setPurgingDoc(null)} title="🗑️ إتلاف وحذف الأرشيف التالف / المستند المشوه" size="md">
        <div className="space-y-4 p-2 text-xs">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-900 dark:text-rose-200 space-y-1">
            <p className="font-black text-sm">تأكيد إتلاف الوثيقة من الأرشيف العقاري</p>
            <p>أنت على وشك حذف المستند ({purgingDoc.documentName}) نهائياً من أرشيف العقار.</p>
          </div>

          <Select
            label="سبب الإتلاف والحذف من الأرشيف (*)"
            value={purgeReason}
            onChange={e => setPurgeReason(e.target.value)}
            options={[
              { value: 'damaged_scan', label: 'المسح الضوئي مشوه / الصورة غير واضحة' },
              { value: 'corrupted_file', label: 'الملف تالف ولا يمكن فتحه' },
              { value: 'obsolete_duplicate', label: 'نسخة مكررة ملغاة بموجب عقد أحدث' },
              { value: 'unauthorized_upload', label: 'خطأ في أرشفة المستند غير المعتمد' }
            ]}
          />

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setPurgingDoc(null)}>إلغاء</Button>
            <Button onClick={handleConfirmPurgeCorrupted} className="bg-rose-600 hover:bg-rose-700 text-white font-black">
              تأكيد الإتلاف والحذف
            </Button>
          </div>
        </div>
      </Modal>
    )}

    {/* ------------------- INTERACTIVE OCR VIEWER & ANALYSIS MODAL ------------------- */}
    {viewingOcrDoc && (
      <Modal 
        isOpen={!!viewingOcrDoc} 
        onClose={() => setViewingOcrDoc(null)} 
        title={`🔍 معاينة وتحليل المستند الممسوح ضوئياً (OCR) - ${viewingOcrDoc.documentName}`}
        size="xl"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1 font-sans text-xs">
          {/* Header Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                <SparklesIcon className="w-4 h-4" />
                <span>دقة التعرف الضوئي OCR: {viewingOcrDoc.ocrConfidence || 99.1}%</span>
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">{viewingOcrDoc.documentName}</h4>
              <p className="text-[10px] text-slate-300">
                العقار: {getPropertyName(viewingOcrDoc.propertyId, mockProperties.find(p=>p.id === viewingOcrDoc.propertyId))} | المرجع: {viewingOcrDoc.referenceNumber || 'N/A'}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => handleCopyOcrText(viewingOcrDoc.ocrContent)}
              className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs shrink-0"
              leftIcon={<DocumentTextIcon className="w-4 h-4"/>}
            >
              {copiedOcrText ? '✓ تم النسخ بنجاح' : 'نسخ النص الممسوح ضوئياً'}
            </Button>
          </div>

          {/* Extracted Key Entities Grid */}
          {viewingOcrDoc.ocrExtractedEntities && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
              <h5 className="font-black text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-amber-600" />
                البيانات والكيانات المستخرجة بالذكاء الاصطناعي (AI Entities):
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-400 block text-[10px]">الأطراف والأسماء:</strong>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{viewingOcrDoc.ocrExtractedEntities.parties?.join(' | ')}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-400 block text-[10px]">القيمة والمبالغ:</strong>
                  <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{viewingOcrDoc.ocrExtractedEntities.amounts?.join(' | ')}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-400 block text-[10px]">الرقم الآلي للعنوان (PACI):</strong>
                  <p className="text-amber-600 font-mono font-bold">{viewingOcrDoc.ocrExtractedEntities.paciNumber || '28409182'}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-400 block text-[10px]">البنود والشروط الجوهرية:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{viewingOcrDoc.ocrExtractedEntities.legalClauses?.join(' • ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Full Extracted OCR Text Box */}
          <div className="space-y-2">
            <h5 className="font-black text-slate-800 dark:text-white text-xs flex items-center justify-between">
              <span>📄 نص العقد/الوثيقة الممسوح ضوئياً (OCR Raw Text):</span>
              <span className="text-[10px] text-slate-400 font-normal">تم استخراجه بواسطة محرك OCR الذكي</span>
            </h5>
            <div className="p-4 bg-slate-950 text-slate-200 font-sans text-xs rounded-2xl border border-slate-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
              {viewingOcrDoc.ocrContent || 'لم يتم العثور على نص ضوئي مستخرج لهذا المستند.'}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setViewingOcrDoc(null)}>
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>
    )}

    {/* Property Document Form Modal */}
    {isFormModalOpen && (
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingDocument ? "تعديل بيانات المستند الرقمي" : "أرشفة مستند عقاري جديد"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleFormSubmit({
            id: editingDocument?.id || `DOC-${Date.now()}`,
            documentType: (formData.get('documentType') as PropertyDocumentType) || PropertyDocumentType.OTHER,
            documentName: (formData.get('documentName') as string) || 'مستند عقاري جديد',
            propertyId: (formData.get('propertyId') as string) || mockProperties[0]?.id || '',
            description: (formData.get('notes') as string) || '',
            ocrContent: (formData.get('ocrContent') as string) || '',
            uploadedAt: editingDocument?.uploadedAt || new Date().toISOString()
          });
        }} className="space-y-4 text-xs font-bold text-right" dir="rtl">
          <div>
            <label className="block mb-1 text-slate-700">عنوان المستند / الوثيقة:</label>
            <Input name="documentName" defaultValue={editingDocument?.documentName || ''} required placeholder="مثال: عقد إيجار المحل التجاري" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-700">تصنيف المستند:</label>
              <Select name="documentType" defaultValue={editingDocument?.documentType || PropertyDocumentType.OTHER}>
                {propertyDocumentTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-slate-700">العقار المرتبط:</label>
              <Select name="propertyId" defaultValue={editingDocument?.propertyId || mockProperties[0]?.id}>
                {mockProperties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-slate-700">محتوى النص الممسوح ضوئياً (OCR Indexing):</label>
            <TextArea name="ocrContent" defaultValue={editingDocument?.ocrContent || ''} rows={3} placeholder="اكتب الكلمات المفتاحية أو أدرج نص المستند للبحث الذكي..." />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>إلغاء</Button>
            <Button type="submit" variant="primary" size="sm">حفظ وأرشفة المستند 💾</Button>
          </div>
        </form>
      </Modal>
    )}
  </div>
);
};

export default PropertyDocumentsPage;
