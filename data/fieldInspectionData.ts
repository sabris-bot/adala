import { FieldPropertyInspection, StructuralConditionRating } from '../types';

export const DEFAULT_STRUCTURAL_ELEMENTS = [
  { elementName: 'الهيكل الخرساني والأساسات', rating: StructuralConditionRating.GOOD, notes: 'لا يوجد تصدعات خرسانية، القواعد بحالة جيدة', hasDefect: false },
  { elementName: 'السباكة والعزل المائي', rating: StructuralConditionRating.MODERATE_MAINTENANCE, notes: 'رشح بسيط في أسطح الحمامات يتطلب تجديد العزل', hasDefect: true },
  { elementName: 'الشبكة الكهربائية والتمديدات', rating: StructuralConditionRating.GOOD, notes: 'اللوحات القاطعة والتوصيلات متطابقة مع معايير وزارة الكهرباء', hasDefect: false },
  { elementName: 'التكييف والتهوية السنترال', rating: StructuralConditionRating.MODERATE_MAINTENANCE, notes: 'انخفاض كفاءة كمبريسور التكييف السنترال بجرار الدور الثالث', hasDefect: true },
  { elementName: 'المصاعد والهيدروليك', rating: StructuralConditionRating.CRITICAL_RISK, notes: 'تآكل في كوابل السحب الرئيسية واهتزاز هيدروليكي كابينة المصعد B', hasDefect: true },
  { elementName: 'الواجهات والألمنيوم', rating: StructuralConditionRating.GOOD, notes: 'الواجهات متماسكة ومظهرها المعماري ممتاز', hasDefect: false },
  { elementName: 'أنظمة السلامة وإطفاء الحريق', rating: StructuralConditionRating.EXCELLENT, notes: 'مضخات الحريق والمطافئ مفحوصة وسارية التراخيص', hasDefect: false }
];

export const INITIAL_MOCK_INSPECTIONS: FieldPropertyInspection[] = [
  {
    id: 'INSP-2026-101',
    referenceNumber: 'INSP-2026/08-101',
    propertyId: 'PROP-01',
    propertyName: 'برج ناصر السكني - الشرق',
    unitId: 'U-301',
    unitNumber: 'شقة 301',
    inspectorName: 'م. أحمد العنيزي (مهندس السلامة والإنشاءات)',
    inspectionDate: '2026-08-10',
    overallCondition: StructuralConditionRating.MODERATE_MAINTENANCE,
    severityLevel: 'MEDIUM',
    structuralElements: [
      { elementName: 'الهيكل الخرساني والأساسات', rating: StructuralConditionRating.GOOD, notes: 'سلامة الهيكل الخرساني بالكامل', hasDefect: false },
      { elementName: 'التكييف والتهوية السنترال', rating: StructuralConditionRating.CRITICAL_RISK, notes: 'تلف كمبريسور التكييف السنترال وارتفاع الحرارة', hasDefect: true },
      { elementName: 'السباكة والعزل المائي', rating: StructuralConditionRating.MODERATE_MAINTENANCE, notes: 'تسريب مائي من شبكة الصرف الرئيسية بالدور الثالث', hasDefect: true },
      { elementName: 'أنظمة السلامة وإطفاء الحريق', rating: StructuralConditionRating.EXCELLENT, notes: 'أجهزة الإنذار تعمل بكفاءة عالية', hasDefect: false }
    ],
    notes: 'تمت المعاينة الميدانية للشقة رقم 301 وتبيّن وجود خلل بضغط التكييف السنترال مع تسريب بالسباكة. يتطلب صيانة عاجلة لحماية التشطيبات.',
    recommendations: 'تبديل كمبريسور وحدات التكييف رقم 3 بالسطح وإعادة عزل أرضيات حمام الوحدة قبل تفاقم التسريب.',
    estimatedRepairCost: 350,
    capturedPhotos: [
      {
        id: 'PHOTO-101',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f172a"/><path d="M50 200 L150 100 L250 220 L350 150" stroke="%2338bdf8" stroke-width="4" fill="none"/><circle cx="150" cy="100" r="10" fill="%23ef4444"/><text x="200" y="270" fill="%23ffffff" font-size="14" font-family="sans-serif" text-anchor="middle">معاينة التكييف السنترال - وحدة 301</text></svg>',
        caption: 'معاينة التكييف السنترال وتضرر الكمبريسور',
        timestamp: '2026-08-10 10:30'
      },
      {
        id: 'PHOTO-102',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><path d="M80 120 Q 200 220 320 120" stroke="%2338bdf8" stroke-width="6" fill="none"/><text x="200" y="270" fill="%2338bdf8" font-size="14" font-family="sans-serif" text-anchor="middle">تسريب السباكة وأنابيب التغذية</text></svg>',
        caption: 'تسريب شبكة التغذية المائية السفلية',
        timestamp: '2026-08-10 10:45'
      }
    ],
    autoLinkToCostEfficiency: true,
    linkedCostEfficiencyId: 'MNT-881',
    createdAt: '2026-08-10T10:45:00Z'
  },
  {
    id: 'INSP-2026-102',
    referenceNumber: 'INSP-2026/08-102',
    propertyId: 'PROP-02',
    propertyName: 'مجمع الفروانية التجاري',
    unitId: 'U-ELEV-B',
    unitNumber: 'المصعد الرئيسي B',
    inspectorName: 'المهندس الفني / فهد خالد المطيري',
    inspectionDate: '2026-08-12',
    overallCondition: StructuralConditionRating.CRITICAL_RISK,
    severityLevel: 'CRITICAL_URGENT',
    structuralElements: [
      { elementName: 'المصاعد والهيدروليك', rating: StructuralConditionRating.CRITICAL_RISK, notes: 'خلل جسيم في الفرامل الهيدروليكية وتآكل أسلاك التعليق', hasDefect: true },
      { elementName: 'أنظمة السلامة وإطفاء الحريق', rating: StructuralConditionRating.MODERATE_MAINTENANCE, notes: 'جرس الطوارئ يعمل لكن جهاز الاتصال الداخلي متعطل', hasDefect: true }
    ],
    notes: 'الفحص الميداني الفني الهندسي لمصعد مجمع الفروانية التجاري أظهر خطورة إنشائية ميكانيكية. تم إيقاف المصعد مؤقتاً لحين الصيانة.',
    recommendations: 'إيقاف المصعد فوراً وإبلاغ شركة الصيانة المعتمدة لتبديل كوابل السحب وتجديد المنظومة الهيدروليكية.',
    estimatedRepairCost: 620,
    capturedPhotos: [
      {
        id: 'PHOTO-103',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23450a0a"/><line x1="100" y1="50" x2="300" y2="250" stroke="%23f87171" stroke-width="8"/><text x="200" y="270" fill="%23fca5a5" font-size="14" font-family="sans-serif" text-anchor="middle">تآكل كوابل المصعد B - خطر إنشائي</text></svg>',
        caption: 'تآكل الكوابل الفولاذية في غرفة المحركات',
        timestamp: '2026-08-12 11:15'
      }
    ],
    autoLinkToCostEfficiency: true,
    linkedCostEfficiencyId: 'MNT-882',
    createdAt: '2026-08-12T11:15:00Z'
  }
];

const LOCAL_STORAGE_KEY = 'qanooni_property_field_inspections';

export const getStoredInspections = (): FieldPropertyInspection[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_INSPECTIONS));
      return INITIAL_MOCK_INSPECTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load field inspections:', err);
    return INITIAL_MOCK_INSPECTIONS;
  }
};

export const saveInspectionRecord = (inspection: FieldPropertyInspection): FieldPropertyInspection[] => {
  const current = getStoredInspections();
  const existingIndex = current.findIndex(item => item.id === inspection.id);
  let updated: FieldPropertyInspection[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...inspection, updatedAt: new Date().toISOString() };
  } else {
    updated = [inspection, ...current];
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save field inspection record:', err);
  }
  return updated;
};

export const deleteInspectionRecord = (id: string): FieldPropertyInspection[] => {
  const current = getStoredInspections();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete field inspection record:', err);
  }
  return updated;
};
