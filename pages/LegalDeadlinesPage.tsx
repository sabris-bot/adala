import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  PlusCircleIcon, 
  TrashIcon, 
  PrinterIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CalendarDaysIcon as CalendarIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellAlertIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ScaleIcon,
  TagIcon,
  ClipboardListCheckIcon
} from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';
import PrintHeader from '../components/ui/PrintHeader';
import { initialCases } from '../data/caseData';
import { geminiService } from '../services/geminiService';
import { 
  CaseStatus, 
  CasePriority, 
  RiskLevel, 
  LitigationStage,
  Case 
} from '../types';

// --- TYPES ---

export enum DeadlineStatus {
  ACTIVE = 'نشط',
  SOON = 'قريب جداً',
  EXPIRED = 'منتهي',
  COMPLETED = 'منجز',
  LATE = 'متأخر',
  PENDING_REVIEW = 'بانتظار المراجعة',
  FOLLOWING = 'قيد المتابعة'
}

export interface LegalProcedure {
  id: string;
  label: string;
  days: number;
  reference: string;
  category: 'Judgments' | 'Appeals' | 'Execution' | 'Procedural' | 'FinalVerdict' | 'Delegations' | 'Prescription';
  description: string;
}

export interface TrackedDeadline {
  id: string;
  title: string;
  caseId?: string;
  caseNumber?: string;
  startDate: string; // ISO Inception Date
  endDate: string; // ISO Calced Date
  procedureId: string;
  procedureLabel: string;
  category: string;
  status: DeadlineStatus;
  priority: CasePriority;
  risk: RiskLevel;
  notes?: string;
  clientName?: string;
  court?: string;
  remainingDays: number;
  percentage: number;
  isUrgent?: boolean;
  // Prescription properties if applicable
  isPrescription?: boolean;
  suspensionDays?: number;
  interruptionDate?: string;
}

// --- DATA & CONSTANTS ---

const KUWAIT_LEGAL_PROCEDURES: LegalProcedure[] = [
  // 1. مواعيد الأحكام القضائية (Judgment Deadlines)
  { 
    id: 'jd-pronounce', 
    label: 'ميعاد النطق بالحكم الكويتي', 
    days: 30, 
    reference: 'المادة 115 من قانون المرافعات الكويتي', 
    category: 'Judgments', 
    description: 'يجب النطق بالحكم في جلسة علنية بحد أقصى 30 يوماً من تاريخ قفل باب المرافعة وحجز الدعوى للحكم.' 
  },
  { 
    id: 'jd-deposit', 
    label: 'ميعاد إيداع نسخة مسودة الحكم الأصلية بالملف', 
    days: 3, 
    reference: 'المادة 116 من قانون المرافعات', 
    category: 'Judgments', 
    description: 'يجب على القاضي أو الهيئة كتابة مسودة للحكم مشتملة على أسبابه والإيداع بالتوقيع خلال ٣ أيام من النطق بالقضية.' 
  },
  { 
    id: 'jd-copy-deposit', 
    label: 'إيداع أصل الحكم للتوقيع لدى قلم الكُتّاب', 
    days: 30, 
    reference: 'المادة 118 مرافعات كويتي', 
    category: 'Judgments', 
    description: 'إيداع الحكم الأصلي المشتمل على ديباجته والموقع من الرئيس وقلم الكتاب في ملف الدعوى خلال 30 يوماً من النطق.' 
  },
  { 
    id: 'jd-notify', 
    label: 'إعلان المحكوم عليه بالحكم البدائي المالي', 
    days: 30, 
    reference: 'المادة 121 مرافعات كويتي', 
    category: 'Judgments', 
    description: 'إعلان المحكوم عليه لبدء حساب مواعيد الطعن إذا تخلف عن حضور جلسات المرافعة الأخيرة أو الختامية.' 
  },
  { 
    id: 'jd-correct', 
    label: 'طلب تصحيح الأخطاء المادية والحسابية البحتة بالحكم', 
    days: 1, 
    reference: 'المادة 124 مرافعات كويتي', 
    category: 'Judgments', 
    description: 'مفتوح دائماً بلا تقييد زمني لتصحيح الأخطاء المادية البحتة أو الحسابية في منطوق الحكم بقرار في غرفة المداولة.' 
  },
  { 
    id: 'jd-interpret', 
    label: 'طلب تفسير الغموض والإبهام في منطوق الحكم', 
    days: 1, 
    reference: 'المادة 125 مرافعات كويتي', 
    category: 'Judgments', 
    description: 'طلب تفسير الغموض في منطوق الحكم لبيان حقيقة المراد به، متاح طوال فترة صلاحية التنفيذ الجبري للحكم.' 
  },

  // 2. مواعيد الطعون (Appeal Deadlines)
  { 
    id: 'ap-civil-commercial', 
    label: 'استئناف الأحكام الصادرة في المسائل المدنية والتجارية الكلية', 
    days: 30, 
    reference: 'المادة 129 من قانون المرافعات الكويتي', 
    category: 'Appeals', 
    description: 'ميعاد الاستئناف في الأحكام الصادرة بصفة ابتدائية من الدوائر الكلية بالمحكمة.' 
  },
  { 
    id: 'ap-partial-court', 
    label: 'استئناف أحكام المحكمة الجزئية (الأمور المستعجلة لإدارة الإيجارات)', 
    days: 15, 
    reference: 'المادة 129 مرافعات كويتي', 
    category: 'Appeals', 
    description: 'ميعاد الاستئناف في أحكام المحكمة الجزئية ومسائل قاضي الأمور المستعجلة هو ١٥ يوماً من تاريخ النطق أو الإعلان.' 
  },
  { 
    id: 'ap-penal-misdemeanor', 
    label: 'استئناف الأحكام الجزائية الكويتي (الجنح والجنايات)', 
    days: 20, 
    reference: 'المادة 201 من قانون الإجراءات والمحاكمات الجزائية الكويتي', 
    category: 'Appeals', 
    description: 'ميعاد استئناف الأحكام الصادرة في الجنح والجنايات من تاريخ النطق بالحكم الحضوري أو الإعلان بالغيابي.' 
  },
  { 
    id: 'ap-penal-opposition', 
    label: 'المعارضة في الحكم الغيابي الجزائي أمام الجنح', 
    days: 7, 
    reference: 'المادة 188 إجراءات جزائية كويتي', 
    category: 'Appeals', 
    description: 'ميعاد المعارضة في الاحكام الغيابية الصادرة في الجنح والجنايات من تاريخ الإعلان الرسمي للمحكوم عليه.' 
  },
  { 
    id: 'ap-cassation-civil', 
    label: 'الطعن بالتمييز في الأحكام المدنية والتجارية والعمالية والإدارية', 
    days: 60, 
    reference: 'المادة 153 مرافعات كويتي', 
    category: 'Appeals', 
    description: 'ميعاد الطعن بالتمييز في الأحكام الانتهائية الصادرة من محكمة الاستئناف العليا.' 
  },
  { 
    id: 'ap-cassation-penal', 
    label: 'الطعن بالتمييز في الأحكام الجزائية وجنايات العاصمة', 
    days: 60, 
    reference: 'قانون حالات وإجراءات الطعن بالتمييز الكويتي', 
    category: 'Appeals', 
    description: 'ميعاد الطعن بالتمييز في الأحكام الجزائية الاستئنافية أمام محكمة التمييز.' 
  },
  { 
    id: 'ap-reconsideration', 
    label: 'التماس إعادة النظر في الأحكام الصادرة بصفة انتهائية', 
    days: 30, 
    reference: 'المادة 149 من قانون المرافعات', 
    category: 'Appeals', 
    description: 'يبدأ من تاريخ ظهور الغش، أو ثبوت تزوير الأوراق، أو العثور على أوراق قاطعة حجزها الخصم.' 
  },
  { 
    id: 'ap-admin-grievance', 
    label: 'التظلم الإداري والطعن بالقرار الإداري الفردي واللوائح', 
    days: 60, 
    reference: 'المادة 7 من قانون إنشاء الدائرة الإدارية الكويتي', 
    category: 'Appeals', 
    description: 'ميعاد تقديم التظلم الإداري للجهة المصدرة للقرار قبل رفع دعوى الإلغاء، وميعاد رفع الدعوى ٦٠ يوماً من رفض التظلم.' 
  },

  // 3. مواعيد التنفيذ (Execution Deadlines)
  { 
    id: 'ex-commence-grace', 
    label: 'مهلة الوفاء الاختياري وعمر إعلان السند التنفيذي للمدين', 
    days: 15, 
    reference: 'المادة 212 مرافعات كويتي', 
    category: 'Execution', 
    description: 'المهلة المقررة للمنفذ ضده للوفاء بالالتزام اختيارياً تبدأ من تاريخ إعلانه رسمياً بصيغة السند التنفيذي وتسمى مقدمات التنفيذ.' 
  },
  { 
    id: 'ex-seizure-validity', 
    label: 'سقوط الحجز التحفظي في حال عدم ملاحقته موضوعياً بقضية صحة الحجز', 
    days: 10, 
    reference: 'المادة 256 مرافعات كويتي', 
    category: 'Execution', 
    description: 'يجب على الحاجز رفع دعوى صحة الحجز وثبوت الحق خلال 10 أيام من توقيع الحجز وإلا اعتبر الحجز باطلاً وكأن لم يكن.' 
  },
  { 
    id: 'ex-auction-ad', 
    label: 'ميعاد إعلان البيع والمزاد الجبري للمقولات والأصول', 
    days: 8, 
    reference: 'المادة 268 مرافعات كويتي', 
    category: 'Execution', 
    description: 'يجب الإعلان عن يوم البيع والمنقولات المحجوزة في الجريدة الرسمية بمهلة لا تقل عن 8 أيام قبل تاريخ المزاد الفعلي.' 
  },
  { 
    id: 'ex-objection-ruling', 
    label: 'التظلم من قرارات مأمور إدارة التنفيذ المالي والعدلي', 
    days: 7, 
    reference: 'المادة 212 وما يليها مرافعات كويتي', 
    category: 'Execution', 
    description: 'التظلم يرفع مباشرة لقاضي التنفيذ خلال ٧ أيام من تاريخ علم المتظلم بقرار مأمور الحجز أو التنفيذ الفردي.' 
  },
  { 
    id: 'ex-rental-eviction', 
    label: 'مهلة الإخلاء الإداري للعين المؤجرة السكنية والتجارية', 
    days: 15, 
    reference: 'المرسوم بالقانون 35/1978 بشأن الإيجارات', 
    category: 'Execution', 
    description: 'تمنح إدارة التنفيذ المنفذ ضده بصفة دورية ١٥ يوماً من تاريخ التنبيه عليه بالإخلاء لترك العين المؤجرة اختياراً.' 
  },

  // 4. مواعيد الإجراءات القضائية (Trial/Procedural Deadlines)
  { 
    id: 'pr-summons-civil', 
    label: 'إعلان صحيفة الدعوى المدنية والجزئية للخصومة', 
    days: 3, 
    reference: 'المادة 48 من قانون المرافعات الكويتي', 
    category: 'Procedural', 
    description: 'يجب إعلان الخصم بالصحيفة وتسليمها إليه قبل الجلسة المحددة بـ 3 أيام على الأقل في الجنح والمحاكم الجزئية والمدنية الكلية.' 
  },
  { 
    id: 'pr-summons-commercial', 
    label: 'إعلان صحيفة الدعوى التجارية والشركاء والمنازعات الكبرى', 
    days: 8, 
    reference: 'المادة 48 مرافعات كويتي', 
    category: 'Procedural', 
    description: 'ميعاد إعلان الدعوى أمام المحكمة التجارية الكلية والشركاء يبلغ 8 أيام لتجهيز الأوراق وحوافظ المستندات الدفاعية.' 
  },
  { 
    id: 'pr-resume-dismissal', 
    label: 'تجديد الدعوى المشطوبة من قلم كتاب المحكمة', 
    days: 60, 
    reference: 'المادة 59 من قانون المرافعات الكويتي', 
    category: 'Procedural', 
    description: 'إذا بقيت الدعوى مشطوبة دون تجديد وإعلان للخصم خلال 60 يوماً متواصلة، اعتبرت الخصومة كأن لم تكن وزالت آثارها.' 
  },
  { 
    id: 'pr-resume-abeyance', 
    label: 'تعجيل الدعوى بعد زوال الوقف الاتفاقي أو التعليقي', 
    days: 30, 
    reference: 'المادة 84 مرافعات كويتي', 
    category: 'Procedural', 
    description: 'إذا اتفق أطراف الدعوى على الوقف، ميعاد تعجيل الدعوى هو ٣٠ يوماً من نهاية الوقف وإلا اعتبر المدعي تاركاً لدعواه.' 
  },
  { 
    id: 'pr-rebuttal-deadline', 
    label: 'ميعاد تقديم مذكرات مرافعة تعقيبية لتقرير الخبراء المودع بالوزارة', 
    days: 15, 
    reference: 'المادة 12 من قانون الإثبات الكويتي', 
    category: 'Procedural', 
    description: 'المهلة الشائعة من تاريخ إخطار الخصوم بإيداع تقرير الخبير المدلي لتقديم اعتراضات ومناحي الدفاع المعقب.' 
  },

  // 5. مواعيد الأحكام النهائية (Final Verdict Deadlines)
  { 
    id: 'fv-lapse-execution', 
    label: 'سقوط قوة السند التنفيذي للأحكام القضائية بالتقادم الطويل', 
    days: 5475, // 15 years
    reference: 'المادة 212 والتقادم بموجب القانون المدني الكويتي', 
    category: 'FinalVerdict', 
    description: 'يسقط الحق في تنفيذ الأحكام القضائية بمضي 15 سنة من صيرورة الحكم نهائياً قابلاً للتنفيذ دون ملاحقة رسمية.' 
  },
  { 
    id: 'fv-first-opposition', 
    label: 'ميعاد رفع استشكال التنفيذ الأول لوقف إجراءات البيع أو الحجز الفعلي', 
    days: 1, 
    reference: 'المادة 218 مرافعات كويتي', 
    category: 'FinalVerdict', 
    description: 'الاستشكال الأول يرفع من الملتزم أو من الغير ويوقف التنفيذ فوراً بمجرد رفعه وتحديد جلسة له قبل تمام الإجراء.' 
  },

  // 6. مواعيد الإنابات والإجراءات الإدارية (Delegations & Administrative Deadlines)
  { 
    id: 'ad-expert-file', 
    label: 'ميعاد بدء مهمة الخبير ودعوة الخصوم للاجتماع الإداري', 
    days: 15, 
    reference: 'المادة 78 من قانون الإثبات الكويتي', 
    category: 'Delegations', 
    description: 'يجب على الخبير المعين دعوة أطراف النزاع لأول اجتماع خبرة خلال 15 يوماً من تبلغه بوزارة العدل كحد تنظيمي.' 
  },
  { 
    id: 'ad-objection-expert', 
    label: 'ميعاد طلب رد وتجريح الخبير المنتدب بقضايا المحكمة', 
    days: 5, 
    reference: 'المادة 81 إثبات كويتي', 
    category: 'Delegations', 
    description: 'يحق لأي طرف طلب رد الخبير القضائي وتخريجه لأسباب قانونية ومصالح مشتركة خلال 5 أيام من تاريخ تعيينه الساري.' 
  }
];

// 7. مواعيد التقادم القانوني (Prescription Database)
const KUWAIT_PRESCRIPTION_TEMPLATES = [
  { id: 'lim-civil-general', label: 'التقادم المدني العام الكويتي (١٥ سنة)', years: 15, months: 0, days: 0, reference: 'المادة 438 من القانون المدني الكويتي', description: 'التقادم الطويل الساري على الديون والالتزامات والحقوق التي لم يرد بشأنها نص خاص.' },
  { id: 'lim-commercial', label: 'التقادم التجاري الكويتي للتجار (١٠ سنوات)', years: 10, months: 0, days: 0, reference: 'المادة 96 من قانون التجارة الكويتي', description: 'تتقادم التزامات التجار المتعلقة بأعمالهم التجارية بمضي عشر سنوات ما لم ينص القانون على غير ذلك.' },
  { id: 'lim-labor', label: 'تقادم حقوق العمال والقضايا العمالية (سنة واحدة)', years: 1, months: 0, days: 0, reference: 'المادة 144 من قانون العمل بالقطاع الأهلي 6/2010', description: 'تسقط الدعوى بالمطالبة بالحقوق العمالية بمضي سنة واحدة من تاريخ انتهاء عقد العمل الساري.' },
  { id: 'lim-harmful-act', label: 'التعويض عما لحق من ضرر الفعل الضار (٣ سنوات)', years: 3, months: 0, days: 0, reference: 'المادة 253 من القانون المدني الكويتي', description: 'تسقط دعوى التعويض الناشئة عن العمل غير المشروع بمضي 3 سنوات من يوم علم المضرور بالضرر والمسؤول عنه أو 15 سنة مطلقاً.' },
  { id: 'lim-professional', label: 'تقادم أصحاب المهن الحرة (أطباء، محامون، خبراء) (٥ سنوات)', years: 5, months: 0, days: 0, reference: 'المادة 442 من القانون المدني الكويتي', description: 'الحقوق المستحقة للأطباء والصيادلة والمحامين والمهندسين والخبراء عما أدوه من أعمال بمضي 5 سنوات.' },
  { id: 'lim-taxes', label: 'تقادم الضرائب والرسوم المستحقة للخزانة العامة بالصحراء (٥ سنوات)', years: 5, months: 0, days: 0, reference: 'المواد المالية والامتثال بالدولة', description: 'تتقادم الضرائب والرسوم المستحقة لوزارات وهيئات الدولة بمضي خمس سنوات كاملة من نهاية السنة المالية المستحقة.' },
  { id: 'lim-checks', label: 'التقادم الصرفي للأوراق المالية والشيكات القابلة للوفاء (٦ أشهر)', years: 0, months: 6, days: 0, reference: 'قانون التجارة الكويتي - المادة 530 وما يليها', description: 'تتقادم دعاوى حامل الشيك تجاه الساحب بمضي 6 أشهر من تاريخ انقضاء ميعاد تقديم الشيك المعتمد للوفاء.' },
  { id: 'lim-bill-exchange', label: 'التقادم الصرفي للكمبيالات والسندات الأمر التجارية (٣ سنوات)', years: 3, months: 0, days: 0, reference: 'المادة 514 من قانون التجارة الكويتي', description: 'تتقادم جميع الدعاوى الناشئة عن الكمبيالة تجاه القابل بمضي ثلاث سنوات من تاريخ استحقاق الكمبيالة.' }
];

const KUWAIT_HOLIDAYS: { [key: string]: string[] } = {
  '2024': [
    '2024-01-01', '2024-02-08', '2024-02-25', '2024-02-26', 
    '2024-04-10', '2024-04-11', '2024-04-12', '2024-06-16', 
    '2024-06-17', '2024-06-18', '2024-07-07', '2024-09-15'
  ],
  '2025': [
    '2025-01-01', '2025-01-27', '2025-02-25', '2025-02-26', 
    '2025-03-31', '2025-04-01', '2025-04-02', '2025-06-06', 
    '2025-06-07', '2025-06-08', '2025-06-26', '2025-09-04'
  ],
  '2026': [
    '2026-01-01', '2026-01-15', '2026-02-25', '2026-02-26', 
    '2026-03-19', '2026-03-20', '2026-03-21', '2026-05-26', 
    '2026-05-27', '2026-06-15', '2026-09-10', '2026-12-18'
  ],
  '2027': [
    '2027-01-01', '2027-01-04', '2027-02-25', '2027-02-26', 
    '2027-03-09', '2027-03-10', '2027-03-11', '2027-05-16', 
    '2027-05-17', '2027-05-18', '2027-08-30', '2027-12-05'
  ]
};

// --- HELPER FUNCTIONS ---

const formatDate = (dateString: string) => {
  if (!dateString) return '---';
  const d = new Date(dateString);
  return d.toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
};

const getStatusColor = (status: DeadlineStatus) => {
  switch (status) {
    case DeadlineStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case DeadlineStatus.SOON: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case DeadlineStatus.EXPIRED: return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    case DeadlineStatus.LATE: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case DeadlineStatus.COMPLETED: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

export default function LegalDeadlinesPage() {
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'calculator' | 'prescription' | 'tracked' | 'insights'>('calculator');
  
  // Common states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [notes, setNotes] = useState('');
  const [linkedCase, setLinkedCase] = useState<Case | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Tab 1: Litigation Tool States
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProcedureId, setSelectedProcedureId] = useState(KUWAIT_LEGAL_PROCEDURES[0].id);
  const [distance, setDistance] = useState(0);
  const [customDays, setCustomDays] = useState(0);
  const [isUrgent, setIsUrgent] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // Tab 2: Prescription Rule States
  const [prescInceptionDate, setPrescInceptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPrescId, setSelectedPrescId] = useState(KUWAIT_PRESCRIPTION_TEMPLATES[0].id);
  const [hasPrescSuspension, setHasPrescSuspension] = useState(false);
  const [prescSuspensionYears, setPrescSuspensionYears] = useState(0);
  const [prescSuspensionMonths, setPrescSuspensionMonths] = useState(0);
  const [prescSuspensionDays, setPrescSuspensionDays] = useState(0);
  const [prescSuspensionReason, setPrescSuspensionReason] = useState('عذر قهري مانع من مباشرة الخصومة والمطالبة بالفحص');
  
  const [hasPrescInterruption, setHasPrescInterruption] = useState(false);
  const [prescInterruptionDate, setPrescInterruptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [prescInterruptionReason, setPrescInterruptionReason] = useState('رفع دعوى قضائية للمطالبة الرسمية بالدين أمام المحاكم');
  const [prescriptionResult, setPrescriptionResult] = useState<any>(null);

  // Tracked Deadlines database status
  const [trackedDeadlines, setTrackedDeadlines] = useState<TrackedDeadline[]>(() => {
    const saved = localStorage.getItem('tracked_deadlines_kuwait');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    // Default initial seeded data
    return [
      {
        id: 'seed-dl-1',
        title: 'استئناف قضية الرشيد العقارية - العاصمة كلي تجاري',
        caseNumber: '2024/1155 تجاري كلي دولي',
        startDate: '2026-05-10',
        endDate: '2026-06-09',
        procedureId: 'ap-civil-commercial',
        procedureLabel: 'استئناف الأحكام الصادرة في المسائل المدنية والتجارية الكلية',
        category: 'Appeals',
        status: DeadlineStatus.ACTIVE,
        priority: CasePriority.HIGH,
        risk: RiskLevel.MEDIUM,
        clientName: 'شركة الرشيد للاستثمار العقاري الكويتي',
        remainingDays: 14,
        percentage: 46.6,
        notes: 'الرجاء التحضير التام مع صبري شطا وكافة مستشاري الدفاع لتقديم مذكرة الاستئناف فور فتح الملف.'
      },
      {
        id: 'seed-dl-2',
        title: 'شطب تعويضات عمالية - مستشفى غانم الخاص',
        caseNumber: '2026/89 عمالي جزئي',
        startDate: '2026-04-01',
        endDate: '2026-05-31',
        procedureId: 'pr-resume-dismissal',
        procedureLabel: 'تجديد الدعوى المشطوبة من قلم كتاب المحكمة',
        category: 'Procedural',
        status: DeadlineStatus.SOON,
        priority: CasePriority.HIGH,
        risk: RiskLevel.HIGH,
        clientName: 'الدكتور فواز غانم الراجحي',
        remainingDays: 5,
        percentage: 8.3,
        notes: 'شارفت مهلة الستين يوماً (المادة ٥٩) على الانتهاء التام! تعجيل فوري لمنع زوال الخصومة وصيرورتها كأن لم تكن.'
      },
      {
        id: 'seed-dl-3',
        title: 'المطالبة بباقي ثمن مبيعات تصفية الشعلة - التقادم التجاري',
        caseNumber: 'سندات مطالبة بضائع مبرمجة',
        startDate: '2016-06-15',
        endDate: '2026-06-15',
        procedureId: 'lim-commercial',
        procedureLabel: 'التقادم التجاري الكويتي للتجار (١٠ سنوات)',
        category: 'Prescription',
        status: DeadlineStatus.ACTIVE,
        priority: CasePriority.HIGH,
        risk: RiskLevel.HIGH,
        clientName: 'الشركة المتحدة للمواد الاستهلاكية',
        remainingDays: 20,
        percentage: 1.2,
        isPrescription: true,
        notes: 'شارف التقادم العشري التجاري على الاكتمال وسقوط الحق بالتقادم! تحضير الإعلان والتبليغ يداً بيد لقطع التقادم عاجلاً.'
      }
    ];
  });

  // Save to locale
  useEffect(() => {
    localStorage.setItem('tracked_deadlines_kuwait', JSON.stringify(trackedDeadlines));
  }, [trackedDeadlines]);

  // AI Advisory states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState('');

  // Derived Procedures for Tab 1
  const filteredProcedures = useMemo(() => {
    if (filterCategory === 'All') return KUWAIT_LEGAL_PROCEDURES;
    return KUWAIT_LEGAL_PROCEDURES.filter(p => p.category === filterCategory);
  }, [filterCategory]);

  // Core Calculation for Standard Procedures (Tab 1)
  const calculateStandardDeadline = (start: string, procId: string, dist: number, extra: number, isUrgentMode: boolean = false) => {
    const procedure = KUWAIT_LEGAL_PROCEDURES.find(p => p.id === procId);
    if (!procedure) return null;

    let totalDays = procedure.days + dist + extra;
    let current = new Date(start);
    
    // Per Article 17: Date of judgment/notification doesn't count. Start counting from next day.
    current.setDate(current.getDate() + 1);
    const dayStartCount = new Date(current);
    
    const steps = [];
    steps.push({
      label: `بداية احتساب الموعد القضائي (المادة 17 مرافعات)`,
      date: dayStartCount.toISOString().split('T')[0],
      note: 'القاعدة الذهبية: لا يحسب يوم صدور الحكم أو الإعلان في مساق احتساب المواعيد القانونية.'
    });

    // Add normal days
    current.setDate(current.getDate() + totalDays - 1);
    const deadlineBeforeExtension = new Date(current);

    steps.push({
      label: `الموعد القانوني الأصلي المتراكم (${totalDays} يوماً)`,
      date: deadlineBeforeExtension.toISOString().split('T')[0],
      note: `شامل ميعاد المسافة الإضافي (+${dist} أيام) والأيام الإجرائية الاختيارية (+${extra} أيام).`
    });

    // Check for Article 18 Extensions (Holidays/Weekends)
    let finalDeadline = new Date(current);
    let extended = false;

    const isHoliday = (date: Date) => {
      const ds = date.toISOString().split('T')[0];
      const year = date.getFullYear().toString();
      const holidayList = KUWAIT_HOLIDAYS[year] || [];
      return holidayList.includes(ds);
    };

    const isWeekend = (date: Date) => {
      const day = date.getDay();
      return day === 5 || day === 6; // Friday or Saturday in Kuwait
    };

    if (isUrgentMode) {
      // Urgent and temporary deadlines are immune to final holiday extension per Article 18
      const endsOnHoliday = isHoliday(finalDeadline) || isWeekend(finalDeadline);
      if (endsOnHoliday) {
        steps.push({
          label: `نهاية الميعاد في عطلة رسمية (طلب مستعجل/مؤقت)`,
          date: finalDeadline.toISOString().split('T')[0],
          note: `استثناء المادة 18 مرافعات: لا يمتد الميعاد المستعجل أو المؤقت إذا صادف آخر يوم عطلة رسمية أو نهاية أسبوع، بل يسقط بانقضائه.`
        });
      }
    } else {
      let limitAttempts = 0; // prevent infinite loops
      let checkExtended = false;
      while ((isHoliday(finalDeadline) || isWeekend(finalDeadline)) && limitAttempts < 30) {
        finalDeadline.setDate(finalDeadline.getDate() + 1);
        extended = true;
        checkExtended = true;
        limitAttempts++;
      }

      if (extended) {
        steps.push({
          label: `تمديد الميعاد لمصادفة عطلة نهاية أسبوع أو إجازة رسمية (المادة 18)`,
          date: finalDeadline.toISOString().split('T')[0],
          note: `أمر بقوة القانون: يمتد ميعاد الطعن العادي طوعاً إلى أول يوم عمل تالٍ للعطل الرسمية لتمكين المتقاضين من التبليغ وقلم الكتاب.`
        });
      }
    }

    // Remaining Calculation
    const today = new Date();
    // Midnight to midnight comparison
    const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tToday = resetTime(today);
    const tFinal = resetTime(finalDeadline);
    const diffTime = tFinal.getTime() - tToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 65 * 24)); // exact days calculation helper
    
    // Smooth percentage mapping
    const percentage = Math.max(0, Math.min(100, Math.round((diffDays / Math.max(1, totalDays)) * 100)));

    let status = DeadlineStatus.ACTIVE;
    if (diffDays < 0) status = DeadlineStatus.EXPIRED;
    else if (diffDays === 0) status = DeadlineStatus.SOON;
    else if (diffDays <= 5) status = DeadlineStatus.SOON;

    return {
      procedure,
      startDate: start,
      finalDeadline: finalDeadline.toISOString().split('T')[0],
      steps,
      remainingDays: diffDays,
      percentage,
      status,
      totalDays,
      isUrgent: isUrgentMode
    };
  };

  // Run Standard effect
  useEffect(() => {
    const res = calculateStandardDeadline(startDate, selectedProcedureId, distance, customDays, isUrgent);
    setCalculationResult(res);
  }, [startDate, selectedProcedureId, distance, customDays, isUrgent]);

  // Core Calculation for Statute of Limitations (Tab 2)
  const calculatePrescriptionPeriod = () => {
    const template = KUWAIT_PRESCRIPTION_TEMPLATES.find(p => p.id === selectedPrescId);
    if (!template) return;

    let steps = [];
    const inception = new Date(prescInceptionDate);
    steps.push({
      label: 'تاريخ نشوء الحق القانوني وبدء التقادم',
      date: prescInceptionDate,
      note: 'يبدأ سريان التقادم من اليوم الذي يصبح فيه الحق مستحق الأداء ما لم يكن هناك نص صريح بخلاف ذلك.'
    });

    // Standard baseline add years/months
    let baselineELapse = new Date(inception);
    if (template.years > 0) {
      baselineELapse.setFullYear(baselineELapse.getFullYear() + template.years);
    }
    if (template.months > 0) {
      baselineELapse.setMonth(baselineELapse.getMonth() + template.months);
    }
    
    let adjustedDeadline = new Date(baselineELapse);
    steps.push({
      label: `الموعد الافتراضي العام لسقوط الحق بالتقادم`,
      date: baselineELapse.toISOString().split('T')[0],
      note: `استناداً إلى المادة القانونية المقررة لهذا الحق دون حساب أي الالتزامات اللاحقة من وقف أو قطع بالدولة.`
    });

    // Apply interruption if checked & after inception
    let resetByInterruption = false;
    if (hasPrescInterruption) {
      const intDate = new Date(prescInterruptionDate);
      if (intDate >= inception) {
        resetByInterruption = true;
        // Interruption resets timer completely! It starts brand-new duration from date of interruption
        let newElapse = new Date(intDate);
        if (template.years > 0) {
          newElapse.setFullYear(newElapse.getFullYear() + template.years);
        }
        if (template.months > 0) {
          newElapse.setMonth(newElapse.getMonth() + template.months);
        }
        adjustedDeadline = new Date(newElapse);
        steps.push({
          label: `أثر انقطاع التقادم القانوني (الوزن الكلي الأقصى)`,
          date: prescInterruptionDate,
          note: `الحدث: ${prescInterruptionReason}. يؤدي انقطاع التقادم إلى محو المدة السابقة بالكامل، والبدء باحتساب مدة جديدة مماثلة بدءاً من هذا التاريخ.`
        });
        steps.push({
          label: `الموعد الجديد الممتد بعد الانقطاع الفعلي`,
          date: adjustedDeadline.toISOString().split('T')[0],
          note: 'يعيد حساب المدة الكاملة من الصفر طبقاً لقانون المعاملات المدنية الكويتي.'
        });
      }
    }

    // Apply suspension if checked
    if (hasPrescSuspension) {
      // Suspension adds extra duration to final deadline (clock paused)
      const addedYears = prescSuspensionYears || 0;
      const addedMonths = prescSuspensionMonths || 0;
      const addedDays = prescSuspensionDays || 0;
      
      adjustedDeadline.setFullYear(adjustedDeadline.getFullYear() + addedYears);
      adjustedDeadline.setMonth(adjustedDeadline.getMonth() + addedMonths);
      adjustedDeadline.setDate(adjustedDeadline.getDate() + addedDays);

      steps.push({
        label: `أثر وقف سريان التقادم (إيقاف موقت للبند)`,
        date: new Date().toISOString().split('T')[0], // show impact as current note
        note: `السبب: ${prescSuspensionReason}. وقف التقادم يمنع احتساب الأيام التي حال فيها العذر القهري دون المطالبة. تمدد المهلة بـ (+${addedYears} سنوات، +${addedMonths} أشهر، +${addedDays} أيام).`
      });
    }

    // Calculate remaining
    const today = new Date();
    const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tToday = resetTime(today);
    const tFinal = resetTime(adjustedDeadline);
    const diffTime = tFinal.getTime() - tToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let risk: RiskLevel = RiskLevel.LOW;
    let statusText = 'قائم وساري';
    let labelColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    
    if (diffDays < 0) {
      risk = RiskLevel.CRITICAL;
      statusText = 'سقط بالتقادم';
      labelColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (diffDays <= 180) { // less than 6 months
      risk = RiskLevel.HIGH;
      statusText = 'قريب السقوط (خطر جداً)';
      labelColor = 'text-amber-800 bg-amber-50 border-amber-200 animate-pulse';
    }

    const percentage = Math.max(0, Math.min(100, Math.round((diffDays / Math.max(1, (template.years * 365 + template.months * 30))) * 100)));

    setPrescriptionResult({
      template,
      inceptionDate: prescInceptionDate,
      finalDeadline: adjustedDeadline.toISOString().split('T')[0],
      steps,
      remainingDays: diffDays,
      percentage,
      risk,
      statusText,
      labelColor,
      hasSuspension: hasPrescSuspension,
      hasInterruption: hasPrescInterruption,
      resetByInterruption
    });
  };

  // Run Prescription effect
  useEffect(() => {
    calculatePrescriptionPeriod();
  }, [
    prescInceptionDate, 
    selectedPrescId, 
    hasPrescSuspension, 
    prescSuspensionYears, 
    prescSuspensionMonths, 
    prescSuspensionDays, 
    prescSuspensionReason,
    hasPrescInterruption,
    prescInterruptionDate,
    prescInterruptionReason
  ]);

  // Action Save standard deadline or prescription handler
  const handleSave = () => {
    if (activeTab === 'calculator' && calculationResult) {
      const newDeadline: TrackedDeadline = {
        id: 'dl-' + Math.random().toString(36).substr(2, 9),
        title: linkedCase ? linkedCase.title : `ميعاد إجراء: ${calculationResult.procedure.label}`,
        caseId: linkedCase?.id,
        caseNumber: linkedCase?.caseNumber || 'خصومة مستقلة',
        startDate: calculationResult.startDate,
        endDate: calculationResult.finalDeadline,
        procedureId: calculationResult.procedure.id,
        procedureLabel: calculationResult.procedure.label,
        category: calculationResult.procedure.category,
        status: calculationResult.status,
        priority: linkedCase?.priority || CasePriority.NORMAL,
        risk: calculationResult.status === DeadlineStatus.SOON ? RiskLevel.HIGH : RiskLevel.LOW,
        notes,
        clientName: linkedCase?.clientName || 'غير محدد',
        remainingDays: calculationResult.remainingDays,
        percentage: calculationResult.percentage,
        isUrgent: calculationResult.isUrgent,
        isPrescription: false
      };

      setTrackedDeadlines([newDeadline, ...trackedDeadlines]);
      setActiveTab('tracked');
      // Reset
      setNotes('');
      setLinkedCase(null);
      setIsUrgent(false);
      setAiAnalysisText('');
    } else if (activeTab === 'prescription' && prescriptionResult) {
      const newDeadline: TrackedDeadline = {
        id: 'dl-' + Math.random().toString(36).substr(2, 9),
        title: linkedCase ? linkedCase.title : `تقادم حق: ${prescriptionResult.template.label}`,
        caseId: linkedCase?.id,
        caseNumber: linkedCase?.caseNumber || 'حق غير مقيد بقضية رئيسية بعد',
        startDate: prescriptionResult.inceptionDate,
        endDate: prescriptionResult.finalDeadline,
        procedureId: prescriptionResult.template.id,
        procedureLabel: prescriptionResult.template.label,
        category: 'Prescription',
        status: prescriptionResult.remainingDays < 0 ? DeadlineStatus.EXPIRED : DeadlineStatus.ACTIVE,
        priority: linkedCase?.priority || CasePriority.HIGH,
        risk: prescriptionResult.risk,
        notes: `تقادم قانوني كويتي. ${notes}. انقطاع التقادم المستعمل؟ ${hasPrescInterruption ? "نعم" : "لا"}، وقف التقادم؟ ${hasPrescSuspension ? "نعم" : "لا"}.`,
        clientName: linkedCase?.clientName || 'غير محدد',
        remainingDays: prescriptionResult.remainingDays,
        percentage: prescriptionResult.percentage,
        isPrescription: true,
        suspensionDays: prescSuspensionYears * 365 + prescSuspensionMonths * 30 + prescSuspensionDays,
        interruptionDate: hasPrescInterruption ? prescInterruptionDate : undefined
      };

      setTrackedDeadlines([newDeadline, ...trackedDeadlines]);
      setActiveTab('tracked');
      setNotes('');
      setLinkedCase(null);
      setAiAnalysisText('');
    }
  };

  const handleImportCase = (c: Case) => {
    setLinkedCase(c);
    if (c.judgmentDate) {
      if (activeTab === 'calculator') {
        setStartDate(c.judgmentDate);
      } else {
        setPrescInceptionDate(c.judgmentDate);
      }
    }
    setIsImportModalOpen(false);
  };

  // Call Gemini AI for Litigation Risk forecast
  const handleAskAILitigationStrategy = async () => {
    setIsAiLoading(true);
    setAiAnalysisText('');

    let prompt = '';
    
    if (activeTab === 'calculator' && calculationResult) {
      const p = calculationResult.procedure;
      prompt = `أنت مستشار مالي وقانوني كويتي خبير وخبير مذكرات تمييز.
أريد منك تقديم تحليل استراتيجي ذكي لميعاد الخصومة القضائية التالية لتقديم تقرير مخاطر ومخطط زمني آمن:
- الإجراء أو الميعاد المطلوب: ${p.label}
- المادة القانونية والمرجع الكويتي: ${p.reference}
- بداية سريان الميعاد: ${calculationResult.startDate}
- الموعد النهائي للاستحقاق (المحسوب ذكياً بالاعتماد على تخطي الإجازات المادة 18): ${calculationResult.finalDeadline}
- مهلة الأيام المنقضية والمتبقية: ${calculationResult.remainingDays} يوماً.
- حالة القضية طارئة/مستعجلة؟ ${isUrgent ? 'نعم (مستثناة من المادة 18)' : 'لا (تخضع لتمديد أيام العطل والمصادفات)'}
- الأيام الاحتياطية المضافة: أيام المسافة (+${distance} يوم)، أيام إضافية (+${customDays} يوم).

فضلاً، قدم تقريراً تحليلياً شاملاً باللغة العربية الفصحى يتضمن:
1. التقييم الفني لقانونية هذا الإجراء ومدى خطورة سقوط الميعاد (التوصيل بمسودة الحكم).
2. جدول الإجراءات الوقائية الفورية الواجب اتخاذها من المحامي وتاريخ بدء تجهيز الصحيفة.
3. معالم الطوابق القضائية في الكويت لمثل هذا الحدث (الابتدائي، الاستئناف، التمييز).
4. تحذير قانوني صريح بشأن العطل الرسمية الكويتية وكيفية تجنب الثغرات الإجرائية.
5. نصيحة استراتيجية واضحة للمحامين لمضاعفة فرص قبول الاستئناف/الدعوى شكلاً وموضوعاً.`;
    } else if (activeTab === 'prescription' && prescriptionResult) {
      const p = prescriptionResult.template;
      prompt = `أنت مستشار قانوني كويتي خبير متخصص في قانون المعاملات المدنية الكويتي (لا سيما مواد تقادم الالتزام من المادة 438 والمواد 440-444).
أريد منك تحليل تقادم الحق المالي والقانوني التالي لتوفير حماية تامة من السقوط:
- طبيعة وفئة الحق المطلق: ${p.label}
- السند والمرجع في القانون المدني: ${p.reference}
- تاريخ نشوء الحق الأصلي: ${prescInceptionDate}
- تاريخ السقوط النهائي المحسوب: ${prescriptionResult.finalDeadline}
- عدد الأيام المتبقية قبل السقوط: ${prescriptionResult.remainingDays} يوماً.
- وقف سريان التقادم مُفعّل؟ ${hasPrescSuspension ? `نعم، بسبب مبرر: "${prescSuspensionReason}" ولمدة تبلغ ${prescSuspensionYears} سنة و ${prescSuspensionMonths} شهر و ${prescSuspensionDays} يوم` : 'لا يوجد وقف ساري'}
- انقطاع التقادم مُفعّل؟ ${hasPrescInterruption ? `نعم، بسبب إجراء قاطع: "${prescInterruptionReason}" صادر بتاريخ ${prescInterruptionDate}` : 'لا يوجد انقطاع ساري'}

فضلاً، قدم تقريراً مهنياً دقيقاً باللغة العربية يتضمن:
1. الرأي القانوني في مدى اكتمال أو انفتاح التقادم لهذا الدائن ومطابقة صحة الالتزامات.
2. الكيفية التي أثر بها الوقف (Suspension) أو الانقطاع (Interruption) على سريان حساب الميعاد وفق الفواقد الكويتية.
3. التوصية العملية العاجلة لرفع دعوى أو إعلان مطالبة فوراً لقطع التقادم لو لم يكن الانقطاع معمولاً به بالكامل.
4. تفسير المبادئ والقرارات القضائية التمييزية الكويتية المقررة لمثل هذا الحق التجاري/المدني/العمالي.
5. نصيحة استراتيجية لإدارة الشؤون القانونية بالشركة لتفادي الدفوع الشكلية بسقوط الحق بمضي المدة.`;
    } else {
      setIsAiLoading(false);
      return;
    }

    try {
      const response = await geminiService.getChatbotResponse(prompt);
      setAiAnalysisText(response);
    } catch (err) {
      console.warn("AI Legal Advisor helper failure, using local backup analysis text", err);
      if (activeTab === 'calculator') {
        setAiAnalysisText(`### ⚖️ التحليل والجدول الإجرائي الوقائي (مدعوم تشريعياً)

1. **التقييم القانوني لصحية الميعاد**:
   - الإجراء المطلوب هو ميعاد عادي يخضع لأحكام **المادة 129 من قانون المرافعات الكويتي**.
   - المدة المتبقية هى **${calculationResult?.remainingDays || 0} يوماً**. يعتبر الميعاد في الوضع آمن بشرط المبادرة الفورية لجمع المرفقات.

2. **أثر الإجازات الرسمية الكنائسية (المادة 18)**:
   - تم حساب الميعاد ومواءمته ليتعدى عطل نهاية الأسبوع بدقة بالغة. نوصي بالإيداع بـ 3 أيام قبل الموعد تحوطاً لأي عجز تقني في البوابة الرقمية لوزارة العدل.

3. **التوصية العملية لإدارة الخصومة**:
   - إخطار الموكل رسمياً لقيد سداد الرسوم وإيداع الكفالة بالبوابة، والتوقيع على التوكيلات الرسمية السارية.`);
      } else {
        setAiAnalysisText(`### ⚖️ التحليل المدني الكويتي الشامل لتقادم الالتزام الحقوقي

1. **تقييم مدى بقاء وسقوط الحق**:
   - بموجب مراجعة نصوص القانون المدني الكويتي، فإن الحق المالي المقاس يقع في نطاق معايير الأمان القانوني.
   - المدة المتبقية قبل السقوط بالتقادم تبلغ **${prescriptionResult?.remainingDays || 0} يوماً**.

2. **الوقف المادي والأدبي وانقطاع التقادم**:
   - إجراء قطع التقادم بإرسال مطالبة كتابية أو قيد صحيفة يعيد سريان العداد المالي من الصفر. ننصح بمباشرة الإخطار فوراً عبر كاتب العدل بوزارة العدل.`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Printable Report Handler
  const handlePrintWindow = () => {
    window.print();
  };

  // Export dynamically to CSV (Excel format client side helper)
  const handleExportCSV = () => {
    let headers = ['المعرف', 'الإجراء القانوني / عنوان الحق', 'التصنيف', 'تاريخ البداية', 'الموعد النهائي للسقوط', 'الوقت المتبقي', 'الحالة القضائية', 'الملاحظات'];
    let rows = trackedDeadlines.map(d => [
      d.id,
      d.title + (d.caseNumber ? ` (${d.caseNumber})` : ''),
      d.category,
      d.startDate,
      d.endDate,
      `${d.remainingDays} يوم`,
      d.status,
      d.notes || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_المحرك_القانوني_المواعيد_الكويتية_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter functionality
  const filteredTrackedDeadlines = useMemo(() => {
    return trackedDeadlines.filter(d => {
      const matchSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.procedureLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.caseNumber && d.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (d.clientName && d.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = filterCategory === 'All' || d.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [trackedDeadlines, searchTerm, filterCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors duration-300 rtl text-right" dir="rtl">
      
      {/* Printable Court Header (Visible ONLY inside standard hard-copy prints) */}
      <div className="hidden print:block mb-8 border-b-4 border-double border-slate-900 pb-6 text-center">
        <div className="flex justify-between items-center text-xs font-bold font-mono text-slate-700">
          <div>التاريخ: {new Date().toLocaleDateString('ar-KW')}</div>
          <div>جمهورية الكويت - وزارة العدل - قطاع المحاكم الاستئنافية</div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-4 font-sans tracking-tight">تقرير المواعيد والتقادم القانوني القضائي الشامل</h1>
        <p className="text-sm text-slate-600 mt-2 font-mono">ملف إلكتروني موثق بموجب المحرك الرياضي الذكي (عدالة - الإصدار الثالث)</p>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/40">
            <ScaleIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">المحرك القانوني لحساب المدد والمواعيد والتقادم</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">التطبيق الذكي الشامل لحوكمة مواعيد الطعون، الاستئناف، أحكام المرافعات والتقادم المدني والتجاري الكويتي</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handlePrintWindow}
            className="flex items-center gap-2 px-5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            <PrinterIcon className="w-4 h-4" />
            طباعة / حفظ PDF رسمي
          </Button>
          <Button 
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2 px-5 border-slate-200 dark:border-slate-800 text-slate-705 dark:text-slate-300 hover:bg-slate-100"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            تصدير تقرير Excel
          </Button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-fit print:hidden">
        <button
          onClick={() => { setActiveTab('calculator'); setAiAnalysisText(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'calculator' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ClockIcon className="w-4 h-4" />
          حاسبة المواعيد القضائية (المرافعات)
        </button>
        <button
          onClick={() => { setActiveTab('prescription'); setAiAnalysisText(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'prescription' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ScaleIcon className="w-4 h-4" />
          محرك التقادم القانوني الكويتي الذكي
        </button>
        <button
          onClick={() => { setActiveTab('tracked'); setAiAnalysisText(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'tracked' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardListCheckIcon className="w-4 h-4" />
          المواعيد المتابعة وجدول التقويم
          {trackedDeadlines.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold mr-1">
              {trackedDeadlines.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('insights'); setAiAnalysisText(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'insights' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <BellAlertIcon className="w-4 h-4" />
          سيناريوهات ومثائل استرشادية
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: JUDICIAL & PROCEDURAL CALCULATOR */}
        {activeTab === 'calculator' && (
          <motion.div 
            key="calculator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Input Side */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-emerald-600">⚖️</span>
                    قواعد احتساب المدد ومواعيد الإجراءات
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">حساب آلي دقيق لتواريخ النطق، الاستئناف، التمييز، والاعتمادات</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">تاريخ الحكم / الحدث / التبليغ المرجعي</label>
                    <div className="relative">
                      <Input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pr-10 dark:bg-slate-800 dark:border-slate-700 text-right h-11 rounded-xl"
                      />
                      <CalendarIcon className="w-4.5 h-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">تصنيف فئة الخصومة</label>
                      <Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="dark:bg-slate-800 text-right h-11 rounded-xl"
                      >
                        <option value="All">جميع الفئات القضائية</option>
                        <option value="Judgments">مواعيد الأحكام القضائية</option>
                        <option value="Appeals">مواعيد الطعون والالتماس</option>
                        <option value="Execution">قوانين ومواعيد التنفيذ</option>
                        <option value="Procedural">الإجراءات والوقف والشطب</option>
                        <option value="FinalVerdict">الأحكام النهائية واستشكالاتها</option>
                        <option value="Delegations">الإنابات والخبراء بوزارة العدل</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">الإجراء القضائي الكويتي</label>
                      <Select
                        value={selectedProcedureId}
                        onChange={(e) => setSelectedProcedureId(e.target.value)}
                        className="dark:bg-slate-800 text-right h-11 rounded-xl text-xs font-semibold"
                      >
                        {filteredProcedures.map(p => (
                          <option key={p.id} value={p.id}>{p.label} ({p.days === 1 ? 'مفتوح' : `${p.days} يوماً`})</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <span>أيام ميعاد المسافة</span>
                        <span title="تضاف للمتقاضين المقيمين خارج الكويت أو بمناطق حدودية">
                          <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      </label>
                      <Input 
                        type="number" 
                        min="0"
                        value={distance}
                        onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
                        className="dark:bg-slate-800 text-right h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">أيام احتياطية إضافية</label>
                      <Input 
                        type="number" 
                        min="0"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value) || 0)}
                        className="dark:bg-slate-800 text-right h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Toggle for Emergency cases (Article 18 exceptions) */}
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-900/10 flex items-start justify-between gap-4 text-right">
                    <div className="flex-1">
                      <label className="block text-xs font-extrabold text-amber-800 dark:text-amber-300">دعوى مستعجلة / طلب وقتي مؤقت</label>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        بموجب المادة 18 مرافعات كويتية: تُستثنى المواعيد المستعجلة أو المؤقتة من قاعدة الامتداد في حال مصادفتها لإجازة رسمية أو عطل نهاية الأسبوع. يسقط الميعاد فوراً.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1 shadow-sm shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-250 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">ربط بملف قضية مسجلة</label>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportModalOpen(true)}
                      className="w-full flex items-center justify-between border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 px-4 py-2.5 rounded-xl text-xs"
                    >
                      {linkedCase ? (
                        <span className="text-emerald-600 font-extrabold truncate flex items-center gap-1">
                          <span>✅ {linkedCase.title}</span>
                          <span className="text-[10px] text-slate-400">({linkedCase.caseNumber})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1.5 justify-end w-full">
                          <span>انقر لاستيراد تفاصيل قضية من الأرشيف...</span>
                          <TagIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </Button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">مذكرات الخصومة والحوافظ</label>
                    <textarea 
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 p-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none text-right"
                      placeholder="أدخل أي ملاحظات قضائية بخصوص مواعيد الإيداع أو أسماء المحامين المسؤولين..."
                    />
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={!calculationResult}
                  className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 py-3.5 text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  حفظ ومتابعة هذا الميعاد القضائي
                </Button>
                
                <Button
                  onClick={handleAskAILitigationStrategy}
                  disabled={isAiLoading || !calculationResult}
                  className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-black text-xs px-5 rounded-xl shadow-md flex items-center justify-center gap-1"
                >
                  {isAiLoading ? (
                    <span className="animate-spin text-white">⏳</span>
                  ) : (
                    <span>✨ استرشاد AI</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Calculations Result Side */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {calculationResult && (
                <>
                  {/* Visual Outcome Card */}
                  <Card className="p-8 border-none bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative overflow-hidden shadow-xl rounded-2xl">
                    <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-8 text-white/5 font-extrabold text-9xl select-none select-none font-sans">
                      {calculationResult.remainingDays}
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {calculationResult.procedure.category === 'Appeals' ? 'طعون واستئنافات' : 'مدد إجرائية عامة'}
                          </span>
                          {calculationResult.isUrgent && (
                            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
                              مستعجل ومؤقت ⚠️
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-extrabold text-right">{calculationResult.procedure.label}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="order-2 md:order-1 space-y-5">
                          <div>
                            <p className="text-emerald-100 text-[11px] opacity-90 uppercase tracking-wider mb-1">آخر موعد نهائي لاتخاذ الإجراء قبل السقوط</p>
                            <p className="text-3xl md:text-3xl font-black tabular-nums">
                              {new Date(calculationResult.finalDeadline).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="opacity-95 text-[11px] bg-white/15 px-2.5 py-1 rounded-lg font-bold">{calculationResult.procedure.reference}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4 text-emerald-300" />
                              <span className="font-extrabold">الوقت المتبقي: {calculationResult.remainingDays < 0 ? 'منتهي/ساقط' : `${calculationResult.remainingDays} يوماً`}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/15 order-1 md:order-2 space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-2xl font-black tabular-nums">{calculationResult.percentage}%</span>
                            <span className="text-[11px] font-extrabold opacity-95">المهلة الأمنية المتبقية للحق</span>
                          </div>
                          <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${calculationResult.percentage}%` }}
                              className={`h-full ${calculationResult.remainingDays > 10 ? 'bg-emerald-400' : calculationResult.remainingDays > 3 ? 'bg-amber-400' : 'bg-rose-500'}`}
                            />
                          </div>
                          <p className="text-[9px] text-white/70 text-center">كلما قلت النسبة المئوية زاد مؤشر بطلان الإجراء أو سقوط الدعوى</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI & Local Advisory Report Box */}
                  {aiAnalysisText && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 bg-gradient-to-r from-violet-50/70 via-indigo-50/40 to-slate-50 border border-indigo-100 dark:from-slate-900/60 dark:to-slate-950 dark:border-slate-800 rounded-2xl relative shadow-sm text-xs space-y-3 leading-relaxed"
                    >
                      <button 
                        onClick={() => setAiAnalysisText('')}
                        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-extrabold text-sm border px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-800"
                      >
                        إغلاق الرأي 
                      </button>
                      <div className="flex items-center gap-2 border-b border-indigo-150/40 pb-2.5">
                        <span className="text-xl">🤖</span>
                        <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-400">تحليل جيميناي الاستراتيجي ومستشاري عدالة الماليين</h4>
                      </div>
                      <div className="whitespace-pre-line text-slate-700 dark:text-gray-300 max-h-96 overflow-y-auto pr-1 select-all font-medium leading-relaxed">
                        {aiAnalysisText}
                      </div>
                    </motion.div>
                  )}

                  {/* Detailed Timeline Steps */}
                  <Card className="p-6 md:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-850 pb-4">
                      <div>
                        <h4 className="text-md font-extrabold text-slate-800 dark:text-white">جدول التسلسل الزمني لاحتساب الميعاد</h4>
                        <p className="text-xs text-slate-450 mt-1">تتبع خطوة بخطوة لكيفية تحوير مواعيد الإعلان لتجنب الجزاءات</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black tracking-wider text-slate-500">
                        {calculationResult.procedure.reference}
                      </span>
                    </div>
                    
                    <div className="space-y-0 relative">
                      <div className="absolute top-0 bottom-0 right-[15px] w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block" />
                      
                      {calculationResult.steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative pr-8 pb-8 last:pb-0 text-right">
                          <div className={`absolute right-[7px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 z-10 transition-colors ${
                            idx === 0 ? 'bg-emerald-500 shadow-md shadow-emerald-200' : 
                            idx === calculationResult.steps.length - 1 ? 'bg-rose-500 shadow-md shadow-rose-200' : 'bg-slate-400'
                          }`} />
                          
                          <div className={`p-4 rounded-xl border transition-all ${
                            idx === calculationResult.steps.length - 1 
                              ? 'bg-rose-50/40 border-rose-100/50 dark:bg-rose-950/20 dark:border-rose-900/30' 
                              : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-805'
                          }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                              <h5 className="font-extrabold text-slate-800 dark:text-white text-xs">{step.label}</h5>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatDate(step.date)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: SPECIALIZED PRESCRIPTION / LIMITATION PERIODS */}
         {activeTab === 'prescription' && (
          <motion.div 
            key="prescription"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Input Side Parameters */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-emerald-600">🛡️</span>
                    محددات محرك التقادم القانوني الكويتي
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">حساب دقيق لتقادم ووقف وانقطاع الالتزام بموجب القانون المدني</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">تاريخ استحقاق الالتزام / نشوء الحق</label>
                    <div className="relative">
                      <Input 
                        type="date" 
                        value={prescInceptionDate}
                        onChange={(e) => setPrescInceptionDate(e.target.value)}
                        className="pr-10 dark:bg-slate-800 dark:border-slate-700 text-right h-11 rounded-xl"
                      />
                      <CalendarIcon className="w-4.5 h-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">نوع ومعيار التقادم المحدد بالدولة</label>
                    <Select
                      value={selectedPrescId}
                      onChange={(e) => setSelectedPrescId(e.target.value)}
                      className="dark:bg-slate-800 text-right h-11 rounded-xl text-xs font-black"
                    >
                      {KUWAIT_PRESCRIPTION_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </Select>
                  </div>

                  {/* Interruption of Prescription (انقطاع التقادم) */}
                  <div className="p-4 rounded-xl border border-blue-105 dark:border-slate-800 bg-blue-50/30 dark:bg-slate-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="chk-interrupt"
                          checked={hasPrescInterruption}
                          onChange={(e) => setHasPrescInterruption(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                        <label htmlFor="chk-interrupt" className="font-extrabold text-xs text-slate-800 dark:text-gray-200 cursor-pointer select-none">
                          تفعيل انقطاع التقادم القانوني (Interruption)
                        </label>
                      </div>
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">طلب قاطع</span>
                    </div>
                    {hasPrescInterruption && (
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 transition-all">
                        <p className="text-[10px] text-slate-500 leading-normal">
                          مهم قانوناً: يؤدي انقطاع التقادم لإلغاء المدة السابقة قبل حدوثه وبدء سريان مدة جديدة كلياً تعادل المدة السابقة (مثلاً رفع الدعاوى القضية، أو إخطار رسمي، أو إقرار صريح بحق الساحب).
                        </p>
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 mb-1">تاريخ حصول واقعة قطع التقادم</label>
                          <Input 
                            type="date"
                            value={prescInterruptionDate}
                            onChange={(e) => setPrescInterruptionDate(e.target.value)}
                            className="bg-white dark:bg-slate-800 h-9 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 mb-1">بيان الإجراء القاطع للتقادم</label>
                          <Input 
                            type="text"
                            value={prescInterruptionReason}
                            onChange={(e) => setPrescInterruptionReason(e.target.value)}
                            className="bg-white dark:bg-slate-800 h-9 text-xs"
                            placeholder="مثال: رفع صحيفة دعوى كلي أو إقرار ورشة بالدين..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suspension of Prescription (وقف التقادم) */}
                  <div className="p-4 rounded-xl border border-purple-105 dark:border-slate-800 bg-purple-50/20 dark:bg-slate-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="chk-suspend"
                          checked={hasPrescSuspension}
                          onChange={(e) => setHasPrescSuspension(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                        <label htmlFor="chk-suspend" className="font-extrabold text-xs text-slate-800 dark:text-gray-200 cursor-pointer select-none">
                          تفعيل وقف سريان التقادم المؤقت (Suspension)
                        </label>
                      </div>
                      <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black uppercase">عذر معطل</span>
                    </div>
                    {hasPrescSuspension && (
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 transition-all">
                        <p className="text-[10px] text-slate-500 leading-normal">
                          قاعدة التعطل: لا يسري التقادم كلما وجد مانع يتعذر معه على الدائن أن يطالب بحقه (عذر قهري، مانع أدبي مانع للمطالبة). clock pauses and resumes when resolved.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] font-black text-slate-600 dark:text-slate-400 mb-1">سنوات التعطيل</label>
                            <Input 
                              type="number"
                              min="0"
                              value={prescSuspensionYears}
                              onChange={(e) => setPrescSuspensionYears(parseInt(e.target.value) || 0)}
                              className="bg-white dark:bg-slate-800 h-9 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-600 dark:text-slate-400 mb-1">أشهر التعطيل</label>
                            <Input 
                              type="number"
                              min="0"
                              value={prescSuspensionMonths}
                              onChange={(e) => setPrescSuspensionMonths(parseInt(e.target.value) || 0)}
                              className="bg-white dark:bg-slate-800 h-9 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-600 dark:text-slate-400 mb-1">أيام التعطيل</label>
                            <Input 
                              type="number"
                              min="0"
                              value={prescSuspensionDays}
                              onChange={(e) => setPrescSuspensionDays(parseInt(e.target.value) || 0)}
                              className="bg-white dark:bg-slate-800 h-9 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 mb-1"> تبرير العذر القاهر للوقف</label>
                          <Input 
                            type="text"
                            value={prescSuspensionReason}
                            onChange={(e) => setPrescSuspensionReason(e.target.value)}
                            className="bg-white dark:bg-slate-800 h-9 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">ربط بملف قضية مسجلة</label>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportModalOpen(true)}
                      className="w-full flex items-center justify-between border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 px-4 py-2.5 rounded-xl text-xs"
                    >
                      {linkedCase ? (
                        <span className="text-emerald-600 font-extrabold truncate flex items-center gap-1">
                          <span>✅ {linkedCase.title}</span>
                          <span className="text-[10px] text-slate-400">({linkedCase.caseNumber})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1.5 justify-end w-full">
                          <span>انقر لاستيراد تفاصيل قضية من الأرشيف...</span>
                          <TagIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </Button>
                  </div>

                </div>
              </Card>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={!prescriptionResult}
                  className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 py-3.5 text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  حفظ ومتابعة حق التقادم بالدولة
                </Button>
                
                <Button
                  onClick={handleAskAILitigationStrategy}
                  disabled={isAiLoading || !prescriptionResult}
                  className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-black text-xs px-5 rounded-xl shadow-md flex items-center justify-center gap-1"
                >
                  {isAiLoading ? (
                    <span className="animate-spin text-white">⏳</span>
                  ) : (
                    <span>✨ استرشاد AI</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Calculations Result Side */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {prescriptionResult && (
                <>
                  {/* Visual Outcome Card */}
                  <Card className="p-8 border-none bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-xl rounded-2xl">
                    <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-8 text-white/5 font-extrabold text-9xl select-none font-sans">
                      {prescriptionResult.remainingDays < 0 ? 'سقط' : 'قائم'}
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${prescriptionResult.labelColor}`}>
                          ملفات التقادم القانوني: {prescriptionResult.statusText}
                        </span>
                        <h2 className="text-lg font-extrabold text-right">{prescriptionResult.template.label}</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-4">
                          <div>
                            <p className="text-indigo-200 text-[11px] opacity-90 mb-1">الموعد النهائي المحدد لسقوط الحق بالتقادم</p>
                            <p className="text-2xl font-black tabular-nums">
                              {new Date(prescriptionResult.finalDeadline).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-lg font-bold">{prescriptionResult.template.reference}</span>
                            <div className="flex items-center gap-1 font-extrabold text-indigo-300">
                              <BellAlertIcon className="w-4.5 h-4.5 text-rose-400" />
                              <span>المتبقي: {prescriptionResult.remainingDays < 0 ? 'الحق ساقط فعلاً!' : `${prescriptionResult.remainingDays} يوماً`}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 space-y-3">
                          <h4 className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">الخلاصة الإجرائية للملف</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {prescriptionResult.remainingDays < 0 ? (
                              <span className="text-rose-400 font-extrabold">🚨 انتبه! الحق سقط بموجب التقادم القانوني، يستدعي البحث فوراً عن الدفوع والنزاعات المقابلة (مثل وقف التقادم المادي الخفي).</span>
                            ) : prescriptionResult.remainingDays <= 180 ? (
                              <span className="text-amber-400 font-extrabold">⚠️ خطر مرتفع! السقوط وشيك (أقل من ستة أشهر مستحقة). يوصى فوراً بتسليم برقية تبليغ رسمية وعقد جلسة لإيقاف الهدر المالي.</span>
                            ) : (
                              <span className="text-emerald-400 font-extrabold">✅ وضع آمن. الحق قائم ولا يزال تحت طائلة الملاحقة القانونية دون سقوط. تابع بدقة حوافظ المستندات.</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI & Local Advisory Report Box */}
                  {aiAnalysisText && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 bg-gradient-to-r from-violet-50/70 via-indigo-50/40 to-slate-50 border border-indigo-100 dark:from-slate-900/60 dark:to-slate-950 dark:border-slate-800 rounded-2xl relative shadow-sm text-xs space-y-3 leading-relaxed"
                    >
                      <button 
                        onClick={() => setAiAnalysisText('')}
                        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-extrabold text-sm border px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-800"
                      >
                        إغلاق الرأي 
                      </button>
                      <div className="flex items-center gap-2 border-b border-indigo-150/40 pb-2.5">
                        <span className="text-xl">🤖</span>
                        <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-400">التحليل المدني الكويتي الذكي ومستشاري عدالة الماليين</h4>
                      </div>
                      <div className="whitespace-pre-line text-slate-700 dark:text-gray-300 max-h-96 overflow-y-auto pr-1 select-all font-medium leading-relaxed">
                        {aiAnalysisText}
                      </div>
                    </motion.div>
                  )}

                  {/* Technical Steps Mapping */}
                  <Card className="p-6 md:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                    <h4 className="text-md font-extrabold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">مراحل وخطوات حساب حيازة الحق ومحددات السقوط</h4>
                    
                    <div className="space-y-0 relative">
                      <div className="absolute top-0 bottom-0 right-[15px] w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block" />
                      
                      {prescriptionResult.steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative pr-8 pb-8 last:pb-0 text-right">
                          <div className={`absolute right-[7px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 z-10 transition-colors ${
                            idx === 0 ? 'bg-emerald-500 shadow-md shadow-emerald-200' : 
                            step.label.includes('انقطاع') ? 'bg-blue-500 shadow-md shadow-blue-200' :
                            step.label.includes('وقف') ? 'bg-purple-500 shadow-md shadow-purple-200' : 'bg-slate-400'
                          }`} />
                          
                          <div className={`p-4 rounded-xl border transition-all ${
                            prescriptionResult.remainingDays < 0 && idx === prescriptionResult.steps.length - 1
                              ? 'bg-rose-50/40 border-rose-100/50 dark:bg-rose-950/20 dark:border-rose-900/30' 
                              : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-805'
                          }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                              <h5 className="font-extrabold text-slate-850 dark:text-white text-xs">{step.label}</h5>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatDate(step.date)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: TRACKED LISTS & CENTRAL RECOGNITION DATABASE */}
        {activeTab === 'tracked' && (
          <motion.div 
            key="tracked"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Visual Risk Metric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right rounded-2xl">
                <div className="relative z-10">
                  <div className="text-slate-400 text-xs mb-1">إجمالي المواعيد المحفوظة</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{trackedDeadlines.length}</div>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 text-slate-100 dark:text-slate-800/15">
                  <ClipboardListCheckIcon className="w-full h-full" />
                </div>
              </Card>

              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right rounded-2xl">
                <div className="relative z-10 font-bold">
                  <div className="text-amber-600 text-xs mb-1"> مواعيد قريبة وحرجة (أقل من 7 أيام)</div>
                  <div className="text-2xl font-black text-amber-600 tabular-nums">
                    {trackedDeadlines.filter(d => d.remainingDays >= 0 && d.remainingDays <= 7).length}
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 text-amber-50 dark:text-amber-950/10">
                  <ExclamationTriangleIcon className="w-full h-full" />
                </div>
              </Card>

              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right rounded-2xl">
                <div className="relative z-10">
                  <div className="text-rose-600 text-xs mb-1">الحقوق والمواعيد الساقطة</div>
                  <div className="text-2xl font-black text-rose-600 tabular-nums">
                    {trackedDeadlines.filter(d => d.remainingDays < 0).length}
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 text-rose-50 dark:text-rose-950/10">
                  <BellAlertIcon className="w-full h-full" />
                </div>
              </Card>

              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative text-right rounded-2xl">
                <div className="relative z-10">
                  <div className="text-emerald-600 text-xs mb-1">مواعيد منجزة ومحمية</div>
                  <div className="text-2xl font-black text-emerald-600 tabular-nums">
                    {trackedDeadlines.filter(d => d.status === DeadlineStatus.COMPLETED).length}
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 text-emerald-50 dark:text-emerald-950/10">
                  <CheckCircleIcon className="w-full h-full" />
                </div>
              </Card>
            </div>

            {/* Comprehensive Interactive Table */}
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Input 
                    placeholder="ابحث برقم القضية، الموكل، الإجراء، أو المحامي..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 dark:bg-slate-800 dark:border-slate-700 text-right h-10 text-xs rounded-xl"
                  />
                  <MagnifyingGlassIcon className="w-4.5 h-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="dark:bg-slate-800 text-right h-10 text-xs rounded-xl max-w-[170px]"
                  >
                    <option value="All">جميع التصنيفات</option>
                    <option value="Judgments">المواعيد القضائية</option>
                    <option value="Appeals">الطعون والاستئناف</option>
                    <option value="Execution">إدارة التنفيذ</option>
                    <option value="Procedural">الإجراءات والوقف</option>
                    <option value="FinalVerdict">الأحكام النهائية</option>
                    <option value="Prescription">التقادم القانوني كلي</option>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                    className="text-slate-500 h-10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs px-4 rounded-xl flex items-center gap-1"
                  >
                    <FunnelIcon className="w-3.5 h-3.5" />
                    تصفية الكل
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto select-none">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-black">
                    <tr>
                      <th className="px-5 py-3.5">النوع</th>
                      <th className="px-5 py-3.5">الإجراء / السند القضائي</th>
                      <th className="px-5 py-3.5">تاريخ البداية</th>
                      <th className="px-5 py-3.5">تاريخ السقوط النهائي</th>
                      <th className="px-5 py-3.5 text-center">الوقت المتبقي قبل السقوط</th>
                      <th className="px-5 py-3.5 text-center">المستوى الأمني</th>
                      <th className="px-5 py-3.5 text-left print:hidden">العمليات والمتابعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                    {filteredTrackedDeadlines.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center text-slate-400 flex flex-col items-center gap-3 justify-center w-full">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center">
                            <ClockIcon className="w-8 h-8 opacity-25" />
                          </div>
                          <span className="font-extrabold">لم نعثر على أي نتائج مطابقة لبحثك في المواعيد</span>
                        </td>
                      </tr>
                    ) : (
                      filteredTrackedDeadlines.map((deadline) => (
                        <tr key={deadline.id} className="hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors group">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide ${
                              deadline.isPrescription 
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50'
                            }`}>
                              {deadline.isPrescription ? '⚖️ تقادم التزام' : '📚 خصومة قضائية'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 max-w-[280px]">
                            <div className="font-extrabold text-slate-800 dark:text-white mb-0.5 max-w-xs truncate" title={deadline.procedureLabel}>
                              {deadline.procedureLabel}
                            </div>
                            <div className="text-[10px] text-slate-450 flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-500">{deadline.title}</span>
                              {deadline.caseNumber && (
                                <>
                                  <span className="text-slate-350">|</span>
                                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px]">{deadline.caseNumber}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                            {formatDate(deadline.startDate)}
                          </td>
                          <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatDate(deadline.endDate)}
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            {deadline.remainingDays < 0 ? (
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-extrabold">
                                🚨 سقط بالتقادم
                              </span>
                            ) : (
                              <div className={`inline-flex items-center justify-center min-w-[5rem] px-2.5 py-1 rounded-full text-[11px] font-black ${
                                deadline.remainingDays <= 7 
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse' 
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              }`}>
                                {deadline.remainingDays} يوماً
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest ${
                              deadline.remainingDays < 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                              deadline.remainingDays <= 7 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}>
                              {deadline.remainingDays < 0 ? 'خطورة قصوى' : deadline.remainingDays <= 7 ? 'خطر مرتفع' : 'آمن ونشط'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-left print:hidden whitespace-nowrap">
                            <div className="flex items-center justify-start gap-2">
                              {deadline.status !== DeadlineStatus.COMPLETED ? (
                                <button 
                                  onClick={() => {
                                    setTrackedDeadlines(trackedDeadlines.map(d => d.id === deadline.id ? {...d, status: DeadlineStatus.COMPLETED} : d));
                                  }}
                                  title="تغيير لإجراء منجز ومحمي"
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:scale-105 transform border dark:border-slate-800"
                                >
                                  <CheckCircleIcon className="w-4.5 h-4.5" />
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-0.5 ml-1">✓ منجز</span>
                              )}
                              
                              <button 
                                onClick={() => {
                                  if (deadline.isPrescription) {
                                    setSelectedPrescId(deadline.procedureId);
                                    setPrescInceptionDate(deadline.startDate);
                                    setHasPrescSuspension(!!deadline.suspensionDays);
                                    setHasPrescInterruption(!!deadline.interruptionDate);
                                    if (deadline.interruptionDate) setPrescInterruptionDate(deadline.interruptionDate);
                                    setActiveTab('prescription');
                                  } else {
                                    setSelectedProcedureId(deadline.procedureId);
                                    setStartDate(deadline.startDate);
                                    setIsUrgent(!!deadline.isUrgent);
                                    setActiveTab('calculator');
                                  }
                                }}
                                title="تحميل في المحركات لإعادة المعايرة"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-800"
                              >
                                <ScaleIcon className="w-4.5 h-4.5" />
                              </button>

                              <button 
                                onClick={() => setTrackedDeadlines(trackedDeadlines.filter(d => d.id !== deadline.id))}
                                title="حذف من جدول المتابعة"
                                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950 border dark:border-slate-800"
                              >
                                <TrashIcon className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 4: CASE STUDIES & SCRIPTS */}
        {activeTab === 'insights' && (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-right"
          >
            <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-300">ملاحظة تنظيمية حول المواعيد وسقوط دعاوى التمييز</h4>
              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed mt-2">
                انتبه: محكمة التمييز الكويتية تعتبر مواعيد الـ 60 يوماً للطعن بالتمييز من النظام العام، ولا يجوز الاتفاق على مخالفتها. عدم الإعلان الصحيح بالاستئناف خلال الميعاد قد يجر لتلقي دفع ببطلان الخصومة شكلاً. تتيح هذه الصفحة فحص السيناريوهات التنبؤية واختبار الفتح قبل فوات الأوان.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'طعن بالاستئناف - حكم كلي تجاري', details: 'استئناف حكم كلي صادر بالتعويض لصالح شركة التجهيزات الكويتية', procId: 'ap-civil-commercial', category: 'Appeals', code: 'المادة 129 مرافعات' },
                { title: 'تجديد دعوى من الشطب المالي', details: 'تجديد دعوى تعويض تم شطبها بجلسة الأمس لغياب محامي الطرفين', procId: 'pr-resume-dismissal', category: 'Procedural', code: 'المادة 59 مرافعات كويتية' },
                { title: 'تقادم حقوق عمالية لوافد', details: 'قضية مستحقات نهاية خدمة لموظف استمر لأكثر من سنة دون تحريك قضائي', procId: 'lim-labor', category: 'Prescription', code: 'المادة 144 عمل أهلي' },
                { title: 'تظلم إداري - فوات موعد الإلغاء', details: 'تظلم من تخطي ترقية لوظيفة في أحد الهيئات السيادية قبل الطعن', procId: 'ap-admin-grievance', category: 'Appeals', code: 'المادة 7 دائرة إدارية' },
                { title: 'موعد إعلان البيع والمزاد الجبري للمنقول', details: 'تجهيز مستند الجريدة الرسمية لعرض سيارات المدين للمزاد والبيع', procId: 'ex-auction-ad', category: 'Execution', code: 'المادة 268 مرافعات' }
              ].map((example, i) => (
                <Card key={i} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors group rounded-2xl text-right">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{example.code}</span>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors">
                      <ScaleIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-850 dark:text-white mb-2">{example.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed h-10 overflow-hidden">{example.details}</p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-[10px] font-extrabold border-slate-200 dark:border-slate-800 hover:bg-emerald-600 hover:text-white transition-all py-2 rounded-xl"
                    onClick={() => {
                      if (example.category === 'Prescription') {
                        setSelectedPrescId(example.procId);
                        setAiAnalysisText('');
                        setActiveTab('prescription');
                      } else {
                        setSelectedProcedureId(example.procId);
                        setAiAnalysisText('');
                        setActiveTab('calculator');
                      }
                    }}
                  >
                    تفحص هذا السيناريو القضائي المعياري
                  </Button>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- IMPORT MODAL FOR ACTIVE CASES --- */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="استيراد بيانات من ملفات القضايا المسجلة"
        className="max-w-2xl rtl text-right"
      >
        <div className="p-6 text-right">
          <div className="relative mb-6">
            <Input 
              placeholder="ابحث بالاسم، برقم المحكمة أو الموكل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 h-10 dark:bg-slate-800 dark:border-slate-700 text-xs rounded-xl text-right"
            />
            <MagnifyingGlassIcon className="w-4.5 h-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          
          <div className="max-h-[350px] overflow-y-auto space-y-3 custom-scrollbar pr-0 pl-1" dir="rtl">
            {initialCases
              .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.caseNumber.includes(searchTerm))
              .map(c => (
                <div 
                  key={c.id} 
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all cursor-pointer group text-right"
                  onClick={() => handleImportCase(c)}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-405">{c.caseNumber}</span>
                    <h5 className="font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors text-xs">{c.title}</h5>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 justify-end flex-wrap">
                    <div className="flex items-center gap-1">
                      <span>الرصيد المفتوح: {c.judgmentDate || 'غير محدد'}</span>
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>الفئة: {c.caseMainType}</span>
                      <TagIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      {/* Corporate Sign Off Box (Invisible during standard screen, shown only when rendering standard print hard copies) */}
      <div className="hidden print:block mt-20 border-t border-slate-450 pt-8 text-xs text-slate-650 leading-relaxed font-mono">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold">المستشار القانوني المسؤول عن المراجعة:</p>
            <p className="mt-8">التوقيع والختم الإداري: ................................</p>
          </div>
          <div className="text-left">
            <p className="font-bold">منظومة الإدارة القضائية المتكاملة (عدالة):</p>
            <p className="mt-8">رقم التحقق الإلكتروني: KWL-992-AX20</p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        @media print {
          .print\:hidden { display: none !important; }
          body { background: white !important; color: black !important; font-size: 11px !important; }
          .p-8, .p-10 { padding: 0.5rem !important; }
          .rounded-2xl { border-radius: 0px !important; border: 1px solid #e2e8f0 !important; }
          .bg-gradient-to-br, .bg-gradient-to-r { background: #f8fafc !important; color: black !important; border: 1px solid #cbd5e1 !important; }
        }
      `}</style>
    </div>
  );
}
