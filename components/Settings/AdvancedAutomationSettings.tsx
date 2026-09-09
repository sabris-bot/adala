import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellAlertIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '../../constants';
import { 
  Sparkles, 
  Sliders, 
  Calendar, 
  Zap, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  FileEdit, 
  Eye, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  History, 
  ShieldAlert, 
  Clock, 
  Settings2, 
  ListFilter,
  CheckCircle2,
  Send,
  Building2,
  Scale,
  X,
  FileCheck,
  AlertOctagon,
  ArrowRightLeft,
  DollarSign,
  UserCheck,
  Filter,
  Link as LinkIcon,
  BookOpen,
  Printer,
  ChevronDown
} from 'lucide-react';

interface AdvancedAutomationSettingsProps {
  accent?: any;
  addToast?: (toast: any) => void;
}

export interface CustomRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  category: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
  active: boolean;
  lastUpdated?: string;
  noticeTypeBinding?: string;
  legalBasis?: string;
}

export interface NoticeTimingSetting {
  id: string;
  noticeType: string;
  triggerEvent: string;
  timingValue: number;
  timeUnit: 'days' | 'hours';
  boundTemplateId: string;
  dispatchChannels: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    docketDraft: boolean;
  };
  legalRequirement: string;
  enabled: boolean;
}

export const AdvancedAutomationSettings: React.FC<AdvancedAutomationSettingsProps> = ({
  accent,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<'timings' | 'templates' | 'risk_matrix' | 'custom_rules' | 'simulator_logs'>('timings');

  const toast = (data: { type: string; title: string; message: string }) => {
    if (addToast) {
      addToast(data);
    } else {
      alert(`${data.title}: ${data.message}`);
    }
  };

  // -------------------------------------------------------------
  // 1. AUTOMATED LEGAL NOTIFICATIONS TIMINGS & TEMPLATE BINDING STATE
  // -------------------------------------------------------------
  const [noticeTimings, setNoticeTimings] = useState<NoticeTimingSetting[]>(() => {
    const saved = localStorage.getItem('adala_notice_timings_config');
    return saved ? JSON.parse(saved) : [
      {
        id: 'timing-eviction-20',
        noticeType: 'إنذار التكليف بالوفاء والتنبيه بالإخلاء (المادة 20 قانون الإيجارات)',
        triggerEvent: 'تأخر سداد الإيجار وتجاوز مهلة الاستحقاق الأولي',
        timingValue: 20,
        timeUnit: 'days',
        boundTemplateId: 'tpl-eviction-article20',
        dispatchChannels: { sms: true, whatsapp: true, email: true, docketDraft: true },
        legalRequirement: 'مهلة 20 يوماً ملزمة قبل قيد دعوى الإخلاء للعين وفق المادة 20 من القانون رقم 35 لسنة 1978',
        enabled: true
      },
      {
        id: 'timing-friendly-reminder',
        noticeType: 'التذكير الودي المستبق بموعد الإيجار',
        triggerEvent: 'تاريخ استحقاق الإيجار الشهري المعتمد',
        timingValue: 3,
        timeUnit: 'days',
        boundTemplateId: 'tpl-rent-friendly-reminder',
        dispatchChannels: { sms: true, whatsapp: true, email: false, docketDraft: false },
        legalRequirement: 'إخطار وُدي بجدولة السداد وتوفير رابط KNet السريع لتفادي غرامات التأخير',
        enabled: true
      },
      {
        id: 'timing-pre-lawsuit-final',
        noticeType: 'الإنذار القانوني النهائي قبل إحالة الشكوى للمحكمة',
        triggerEvent: 'انقضاء 7 أيام على تاريخ استحقاق الإيجار دون سداد',
        timingValue: 7,
        timeUnit: 'days',
        boundTemplateId: 'tpl-final-pre-lawsuit',
        dispatchChannels: { sms: true, whatsapp: true, email: true, docketDraft: true },
        legalRequirement: 'إنذار رسمي أخير قبل البدء باحتساب الرسوم القضائية وقيد الأمر القضائي',
        enabled: true
      },
      {
        id: 'timing-non-renewal',
        noticeType: 'إخطار عدم الرغبة بتجديد عقد الإيجار (الميعاد الاتفاقي)',
        triggerEvent: 'قبل تاريخ انتهاء مدة عقد الإيجار المعتمد',
        timingValue: 60,
        timeUnit: 'days',
        boundTemplateId: 'tpl-non-renewal-notice',
        dispatchChannels: { sms: true, whatsapp: false, email: true, docketDraft: false },
        legalRequirement: 'مراعاة ميعاد التنبيه بالإخلاء والترك لمنع التجديد الضمني للتاريخ السنوي',
        enabled: true
      },
      {
        id: 'timing-lease-breach',
        noticeType: 'إنذار تصحيح المخالفات وبنود العقد',
        triggerEvent: 'رصد تغيير بالعين أو مخالفة شروط الاستغلال',
        timingValue: 7,
        timeUnit: 'days',
        boundTemplateId: 'tpl-lease-breach-notice',
        dispatchChannels: { sms: true, whatsapp: true, email: true, docketDraft: false },
        legalRequirement: 'منح مهلة 7 أيام لتدارك المخالفة قبل تحرير محضر إثبات حالة ورصد التجاوز',
        enabled: true
      }
    ];
  });

  const [dispatchConfig, setDispatchConfig] = useState(() => {
    const saved = localStorage.getItem('adala_auto_dispatch_config');
    return saved ? JSON.parse(saved) : {
      rentDueDay: 1,
      autoSmsEnabled: true,
      autoWhatsappEnabled: true,
      autoEmailEnabled: true,
      autoDocketDraftOnOverdue: true,
      enforceKuwaitPaciValidation: true,
      autoAttachPaciNumber: true
    };
  });

  // -------------------------------------------------------------
  // 2. LEGAL NOTICE & CONTRACT TEMPLATES STATE (VISUAL EDITOR)
  // -------------------------------------------------------------
  const [templates, setTemplates] = useState<LegalTemplate[]>(() => {
    const saved = localStorage.getItem('adala_legal_notice_templates');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tpl-eviction-article20',
        title: 'إنذار تكليف بالوفاء وتنبيه بالإخلاء (المادة 20 قانون الإيجارات الكويتي)',
        category: 'إنذارات قضائية رسمية',
        subject: 'إنذار وتكليف بالوفاء بسداد دين إيجاري متأخر بالعين المؤجرة',
        body: `إلى المستأجر المكرم/ {اسم_المستأجر} (الرقم المدني: {الرقم_المدني})
تحديداً بالعين المؤجرة: {اسم_العقار} - وحدة رقم: {رقم_الوحدة} (الرقم الآلي للمبنى: {الرقم_الآلي})

نحيطكم علماً بامتناعكم عن سداد الأجرة المستحقة عن الفترة من {تاريخ_البداية} إلى {تاريخ_النهاية}، بمتأخرات قدرها: {المبلغ_المتأخر} د.ك (فقط {المبلغ_المتأخر} دينار كويتي لا غير).

وعليه، نُنذركم وتكلفكم بالوفاء بسداد المبلغ المذكور أعلاه كاملاً خلال مهلة أقصاها {مهلة_الوفاء} يوماً من تاريخ استلام هذا الإشعار عبر الرابط: {رابط_الدفع_السريع}، وإلا سنضطر للبدء فوراً بإجراءات رفع دعوى إخلاء للعين لعدم السداد وطلب أمر أداء بالمبالغ والرسوم القضائية والتعويضات وفق المادة 20 من قانون الإيجارات الكويتي رقم 35 لسنة 1978 وتعديلاته.`,
        active: true,
        lastUpdated: '2026-08-15',
        noticeTypeBinding: 'إشعار المادة 20 للإخلاء',
        legalBasis: 'قانون الإيجارات رقم 35 لسنة 1978 (المادة 20)'
      },
      {
        id: 'tpl-rent-friendly-reminder',
        title: 'إشعار تذكير استحقاق الإيجار الشهري (تذكير ودي)',
        category: 'تذكيرات دورية',
        subject: 'تذكير بموعد سداد الإيجار الشهري المعتمد',
        body: `عزيزي المستأجر/ {اسم_المستأجر}
تذكير ودي من إدارة عقارات مكتب المحامي صبري شطا: يرجى سداد قيمة إيجار شهر {الشهر} للعين المؤجرة لكم بالعقار: {اسم_العقار} (وحدة رقم {رقم_الوحدة})، بمبلغ إجمالي: {المبلغ_المتأخر} د.ك.

يمكنكم السداد المباشر الآمن عبر رابط KNet السريع التالي:
{رابط_الدفع_السريع}

شاكرين لكم حسن تعاونكم ودقة الالتزام بالاستحقاق الشهري.`,
        active: true,
        lastUpdated: '2026-08-01',
        noticeTypeBinding: 'التذكير الودي المستبق',
        legalBasis: 'العقد المبرم والالتزام التعاقدي بالسداد'
      },
      {
        id: 'tpl-final-pre-lawsuit',
        title: 'الإنذار القانوني النهائي قبل القيد بالمحكمة (Pre-Lawsuit Warning)',
        category: 'إنذارات قضائية رسمية',
        subject: 'إنذار نهائي وأخير قبل بدء إجراءات القيد القضائي وأمر الأداء',
        body: `السيد/ {اسم_المستأجر} المحترم (الرقم المدني: {الرقم_المدني})
العين: {اسم_العقار} - شقة/مكتب رقم: {رقم_الوحدة}

بناءً على عدم سدادكم للإيجار المستحق وتراكم مبلغ {المبلغ_المتأخر} د.ك، نحيطكم علماً بأن القطاع القانوني يتأهب لإحالة الملف للمحكمة وقيد دعوى الإخلاء وأمر الأداء.
نمنحكم فرصة أخيرة لتسوية المبلغ خلال 48 ساعة عبر الرابط: {رابط_الدفع_السريع} تجنباً للمصاريف القضائية وأتعاب المحاماة.`,
        active: true,
        lastUpdated: '2026-08-12',
        noticeTypeBinding: 'الإنذار النهائي الشديد',
        legalBasis: 'قانون المرافعات الكويتي (أوامر الأداء)'
      },
      {
        id: 'tpl-non-renewal-notice',
        title: 'إخطار عدم رغبة بتجديد عقد الإيجار (الميعاد الاتفاقي)',
        category: 'إخطارات إنهاء العقود',
        subject: 'إشعار رسمي بعدم رغبة المؤجر بتجديد العقد وطلب تسليم العين',
        body: `السيد المستأجر/ {اسم_المستأجر} (الرقم المدني: {الرقم_المدني})
بالإشارة إلى عقد الإيجار المحرر والمؤرخ في {تاريخ_العقد} بخصوص العين: {اسم_العقار} (وحدة {رقم_الوحدة}).

نحيطكم علماً بصفة رسمية بعدم رغبتنا بتجديد العقد لفترة إيجارية جديدة، ونلتمس منكم تسليم العين خالية من الشواغل والشاغلين وتوفير شهادة براءة ذمة من وزارة الكهرباء والماء بتاريخ انتهاء العقد المحدد بـ {تاريخ_انتهاء_العقد}.`,
        active: true,
        lastUpdated: '2026-07-25',
        noticeTypeBinding: 'إخطار عدم التجديد',
        legalBasis: 'الميعاد الاتفاقي وإخطارات الإخلاء'
      },
      {
        id: 'tpl-lease-breach-notice',
        title: 'إنذار بمخالفة الاستغلال والتغيير بالعين بغير إذن (تصحيح وضع)',
        category: 'إنذارات شروط العقد',
        subject: 'إنذار رسمي بمخالفة بند التغيير وتصحيح المخالفة خلال 7 أيام',
        body: `السيد المستأجر/ {اسم_المستأجر}
بالإشارة للعين المؤجرة لكم بالعقار: {اسم_العقار} (وحدة رقم {رقم_الوحدة}).

تبين لإدارة العقار والقطاع القانوني قيامكم بمخالفة البند المحدد بالعقد (إجراء تغييرات/استغلال غير مصرح)، نطلب منكم تصحيح المخالفة وإعادة العين لأصلها خلال مهلة 7 أيام من تاريخه تجنباً لفسخ العقد بحكم القانون وإخلاء العين.`,
        active: true,
        lastUpdated: '2026-07-15',
        noticeTypeBinding: 'إنذار تصحيح المخالفة',
        legalBasis: 'قواعد فسخ العقد للإضرار بالعين'
      }
    ];
  });

  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('جميع القوالب');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>('tpl-eviction-article20');
  const [editingForm, setEditingForm] = useState<LegalTemplate | null>(templates[0]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');

  // Dynamic Variable Palette Categories
  const variablePalette = [
    {
      group: 'بيانات المستأجر والطرف الآخر',
      vars: [
        { code: '{اسم_المستأجر}', label: 'اسم المستأجر الكامل' },
        { code: '{الرقم_المدني}', label: 'الرقم المدني للمستأجر' },
        { code: '{رقم_الهاتف}', label: 'رقم هاتف التواصل' },
        { code: '{جنسية_المستأجر}', label: 'الجنسية' },
        { code: '{الكفيل_الغارم}', label: 'اسم الكفيل الغارم' }
      ]
    },
    {
      group: 'بيانات العقار والوحدة الإيجارية',
      vars: [
        { code: '{اسم_العقار}', label: 'اسم المجمع / العقار' },
        { code: '{رقم_الوحدة}', label: 'رقم الشقة / المحل / الشاغر' },
        { code: '{الرقم_الآلي}', label: 'الرقم الآلي للمعلومات المدنية (PACI)' },
        { code: '{قيمة_الإيجار}', label: 'القيمة الإيجارية الشهرية' },
        { code: '{تاريخ_العقد}', label: 'تاريخ بداية العقد' },
        { code: '{تاريخ_انتهاء_العقد}', label: 'تاريخ انتهاء العقد' }
      ]
    },
    {
      group: 'المالية والمهل والروابط',
      vars: [
        { code: '{المبلغ_المتأخر}', label: 'إجمالي المبالغ والديون المتأخرة' },
        { code: '{عدد_أشهر_التأخير}', label: 'عدد أشهر التأخير' },
        { code: '{مهلة_الوفاء}', label: 'عدد أيام مهلة الإمهال (مثلاً 20)' },
        { code: '{تاريخ_البداية}', label: 'تاريخ بداية فترة التأخير' },
        { code: '{تاريخ_النهاية}', label: 'تاريخ نهاية فترة التأخير' },
        { code: '{رابط_الدفع_السريع}', label: 'رابط دفع KNet المباشر' },
        { code: '{الشهر}', label: 'اسم الشهر والسنة' }
      ]
    }
  ];

  // -------------------------------------------------------------
  // 3. TENANT RISK SCORING CRITERIA & LEDGER INTEGRATION STATE
  // -------------------------------------------------------------
  const [riskCriteria, setRiskCriteria] = useState(() => {
    const saved = localStorage.getItem('adala_tenant_risk_criteria');
    return saved ? JSON.parse(saved) : {
      // Factors & Weights
      delayDaysWeight: 40, // 40% weight
      bouncedChequeWeight: 35, // 35% weight
      pastViolationsWeight: 15, // 15% weight
      lawsuitHistoryWeight: 10, // 10% weight

      // Thresholds
      lowRiskMaxDelayDays: 3,
      mediumRiskMaxDelayDays: 14,
      highRiskMinDelayDays: 15,
      criticalRiskMinDelayDays: 25,
      maxAllowedBouncedCheques: 0,
      
      // Ledger Linking Rules
      showRiskBadgeInLedger: true,
      blockOnlineReceiptForHighRisk: true,
      autoAttachLegalFeeInLedger: true,
      requireLegalApprovalForSettlement: true,
      highlightOverdueItemsInRed: true,
      autoEscalateToCourtDays: 20
    };
  });

  // Interactive Tenant Risk Score Calculator State
  const [simLateDays, setSimLateDays] = useState<number>(18);
  const [simBouncedCheques, setSimBouncedCheques] = useState<number>(1);
  const [simPastViolations, setSimPastViolations] = useState<number>(2);
  const [simHasLawsuits, setSimHasLawsuits] = useState<boolean>(true);

  // -------------------------------------------------------------
  // 4. CUSTOM RULES ENGINE STATE
  // -------------------------------------------------------------
  const [customRules, setCustomRules] = useState<CustomRule[]>(() => {
    const saved = localStorage.getItem('adala_custom_automation_rules');
    return saved ? JSON.parse(saved) : [
      {
        id: 'rule-1',
        name: 'إنذار المادة 20 التلقائي فور انقضاء 7 أيام تأخير',
        trigger: 'تأخر سداد الإيجار عن 7 أيام من الاستحقاق',
        condition: 'تصنيف المستأجر = عالي الخطر أو متوسط الخطر',
        action: 'توليد إنذار التكليف بالوفاء المادة 20 وإرساله عبر WhatsApp + SMS',
        enabled: true,
        category: 'إيجارات وقضايا'
      },
      {
        id: 'rule-2',
        name: 'تجهيز مسودة صحيفة دعوى إخلاء وأمر أداء تلقائياً',
        trigger: 'انقضاء مهلة الـ 20 يوماً للإنذار دون سداد',
        condition: 'إجمالي المبالغ المتأخرة > 300 د.ك',
        action: 'توليد صحيفة دعوى إخلاء للعين وحساب الرسوم وإشعار المحامي المسئول',
        enabled: true,
        category: 'دعاوى قضائية'
      },
      {
        id: 'rule-3',
        name: 'إخطار عدم تجديد عقد الإيجار قبل 60 يوماً',
        trigger: 'اقتراب تاريخ انتهاء العقد بـ 60 يوماً',
        condition: 'تصنيف المستأجر = عالي الخطر OR وجود شيك مرتجع',
        action: 'إرسال كتاب رسم بعدم رغبة المؤجر بالتجديد وحظر التجديد التلقائي',
        enabled: true,
        category: 'عقود إيجار'
      },
      {
        id: 'rule-4',
        name: 'تجميد المعاملات وإحالة المستأجر للقائمة الحمراء عند ارتجاع شيك',
        trigger: 'تسجيل حالة شيك مرتجع للعين المؤجرة',
        condition: 'أي عقد إيجار نشط',
        action: 'رفع مستوى الخطر فوراً إلى (عالي الخطر) وإشعار الإدارة القانونية',
        enabled: true,
        category: 'مالية وائتمان'
      }
    ];
  });

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState<Omit<CustomRule, 'id'>>({
    name: '',
    trigger: 'تأخر سداد الإيجار عن 5 أيام',
    condition: 'تصنيف المستأجر = متوسط الخطر',
    action: 'إرسال تذكير رسمي بجدول الأقساط',
    enabled: true,
    category: 'إيجارات وقضايا'
  });

  // -------------------------------------------------------------
  // 5. SIMULATOR & AUDIT LOGS STATE
  // -------------------------------------------------------------
  const [executionLogs, setExecutionLogs] = useState([
    { id: 'log-101', time: 'منذ 10 دقائق', event: 'إرسال إنذار المادة 20 تلقائياً', tenant: 'عبدالرحمن الفضلي', property: 'عمارة السالمية ب3', rule: 'rule-1', channel: 'WhatsApp + SMS', status: 'نجاح الإرسال' },
    { id: 'log-102', time: 'منذ ساعتين', event: 'تجهيز مسودة صحيفة دعوى إخلاء', tenant: 'شركة الأمل الدولية', property: 'مجمع حولي التجاري ت4', rule: 'rule-2', channel: 'توليد تلقائي للحقيبة', status: 'جاهز للمراجعة' },
    { id: 'log-103', time: 'أمس 09:30 ص', event: 'ربط مؤشر المخاطر بكشف حساب المستأجر (عالي الخطر)', tenant: 'فهد جاسم العتيبي', property: 'برج الشرق أ1', rule: 'rule-4', channel: 'المحرك الآلي', status: 'مُطبق آلياً بكشف الحساب' },
    { id: 'log-104', time: 'أمس 04:15 م', event: 'إرسال تذكير ودي رابط KNet', tenant: 'نورة الخالد', property: 'عمارة الفروانية خ2', rule: 'تذكير شهري', channel: 'SMS', status: 'تم السداد' }
  ]);

  // Dry Run Simulator Controls
  const [simSelectedTemplate, setSimSelectedTemplate] = useState<string>(templates[0].id);
  const [simTenantName, setSimTenantName] = useState('ناصر محمد العجمي');
  const [simCivilId, setSimCivilId] = useState('288091200344');
  const [simProperty, setSimProperty] = useState('برج الراية العقاري - شقة 14');
  const [simOverdueAmount, setSimOverdueAmount] = useState('850.000');
  const [simOutputText, setSimOutputText] = useState('');

  // -------------------------------------------------------------
  // HELPER CALCULATORS & HANDLERS
  // -------------------------------------------------------------
  const handleSaveAll = () => {
    localStorage.setItem('adala_notice_timings_config', JSON.stringify(noticeTimings));
    localStorage.setItem('adala_auto_dispatch_config', JSON.stringify(dispatchConfig));
    localStorage.setItem('adala_legal_notice_templates', JSON.stringify(templates));
    localStorage.setItem('adala_tenant_risk_criteria', JSON.stringify(riskCriteria));
    localStorage.setItem('adala_custom_automation_rules', JSON.stringify(customRules));

    toast({
      type: 'success',
      title: 'تم حفظ كافة إعدادات الأتمتة المتقدمة 💾',
      message: 'تم تحديث التوقيتات والقوالب ومعايير مخاطر المستأجرين بنجاح.'
    });
  };

  const handleInsertVariable = (variableCode: string) => {
    if (!editingForm) return;
    setEditingForm({
      ...editingForm,
      body: editingForm.body + ` ${variableCode} `
    });
    toast({
      type: 'info',
      title: 'تم إدراج المتغير',
      message: `تمت إضافة ${variableCode} لمحتوى النص.`
    });
  };

  // Comprehensive Risk Calculator Algorithm
  const calculateRiskScoreAndCategory = (lateDays: number, bouncedCheques: number, pastViolations: number, lawsuits: boolean) => {
    let score = 0;
    
    // Delay Days score (max 40)
    if (lateDays > 20) score += 40;
    else if (lateDays > 14) score += 30;
    else if (lateDays > 7) score += 20;
    else if (lateDays > 3) score += 10;

    // Bounced Cheques score (max 35)
    score += Math.min(bouncedCheques * 20, 35);

    // Past Violations (max 15)
    score += Math.min(pastViolations * 7.5, 15);

    // Lawsuit History (max 10)
    if (lawsuits) score += 10;

    if (score >= 70 || bouncedCheques >= 2 || (lawsuits && lateDays > 14)) {
      return {
        score,
        level: 'CRITICAL',
        label: '🔴 عالي الخطر جداً (Critical High Risk)',
        color: 'text-rose-700 bg-rose-50 border-rose-300',
        badgeVariant: 'danger',
        ledgerBadge: '🚨 مستأجر ملاحق قضائياً - حظر السداد الإلكتروني',
        actionDesc: 'تفعيل صحيفة المادة 20 فورا، وحظر تجديد العقد، وتجميد تسويات كشف الحساب إلا بموافقة قانونية.'
      };
    } else if (score >= 40 || bouncedCheques === 1 || lateDays >= 10) {
      return {
        score,
        level: 'HIGH',
        label: '🟧 عالي الخطر (High Risk)',
        color: 'text-amber-700 bg-amber-50 border-amber-300',
        badgeVariant: 'warning',
        ledgerBadge: '⚠️ مستأجر متعثر - يتطلب إنذاراً رسمياً',
        actionDesc: 'إرسال إنذار التكليف بالوفاء، اشتراط كفيل غارم عند التجديد، وإرفاق رسوم متابعة بكشف الحساب.'
      };
    } else if (score >= 20 || lateDays > 3) {
      return {
        score,
        level: 'MEDIUM',
        label: '🟡 متوسط الخطر (Medium Risk)',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
        badgeVariant: 'info',
        ledgerBadge: '⚡ متابعة دورية - تذكير آلي KNet',
        actionDesc: 'إرسال تذكيرات سداد مكثفة عبر واتساب، ومنع تمديد فترات السماح بكشف الحساب.'
      };
    } else {
      return {
        score,
        level: 'LOW',
        label: '🟢 منخفض الخطر (Low Risk - Excellent)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        badgeVariant: 'success',
        ledgerBadge: '✅ مستأجر ممتاز - ملتزم بالسداد',
        actionDesc: 'تجديد تلقائي متسق، إعفاء من رسوم الإنذارات، وأولوية التسهيلات بكشف الحساب.'
      };
    }
  };

  const calculatedRiskResult = calculateRiskScoreAndCategory(simLateDays, simBouncedCheques, simPastViolations, simHasLawsuits);

  const handleRunSimulator = () => {
    const tpl = templates.find(t => t.id === simSelectedTemplate) || templates[0];
    let rendered = tpl.body
      .replaceAll('{اسم_المستأجر}', simTenantName)
      .replaceAll('{الرقم_المدني}', simCivilId)
      .replaceAll('{اسم_العقار}', simProperty.split('-')[0].trim())
      .replaceAll('{رقم_الوحدة}', simProperty.split('-')[1]?.trim() || '14')
      .replaceAll('{الرقم_الآلي}', '99488320')
      .replaceAll('{المبلغ_المتأخر}', simOverdueAmount)
      .replaceAll('{تاريخ_البداية}', '2026-07-01')
      .replaceAll('{تاريخ_النهاية}', '2026-08-01')
      .replaceAll('{مهلة_الوفاء}', '20')
      .replaceAll('{رابط_الدفع_السريع}', 'https://adala.law/pay/knet-9921')
      .replaceAll('{تاريخ_العقد}', '2024-01-01')
      .replaceAll('{تاريخ_انتهاء_العقد}', '2026-12-31')
      .replaceAll('{الشهر}', 'أغسطس 2026');

    setSimOutputText(rendered);

    const newLog = {
      id: `log-${Date.now()}`,
      time: 'الآن (محاكاة)',
      event: `اختبار قالب: ${tpl.title}`,
      tenant: simTenantName,
      property: simProperty,
      rule: 'تجربة محاكي الأتمتة والقوالب',
      channel: 'معاينة شاشة',
      status: 'نجاح التوليد'
    };

    setExecutionLogs([newLog, ...executionLogs]);
    toast({
      type: 'info',
      title: 'تم تشغيل محاكي القوالب',
      message: 'تم الدمج المعاين بين البيانات والديناميكيات المحددة بنجاح.'
    });
  };

  // Filtered Templates
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedTemplateCategory === 'جميع القوالب' || t.category === selectedTemplateCategory;
    const matchesSearch = t.title.includes(templateSearchQuery) || t.body.includes(templateSearchQuery) || t.subject.includes(templateSearchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Top Banner & Fast Actions */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              محرك وقواعد الأتمتة المتقدمة
            </span>
            <span className="text-xs text-slate-400 font-mono">Automation Rules Engine v4.5</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            محرر القوالب وتوقيت الإخطارات ومعايير مخاطر المستأجرين
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed font-medium">
            تخصيص مواعيد إرسال الإخطارات القانونية التلقائية، ربط كل إخطار بقالبه المخصص، تصميم القوالب بالمتغيرات الديناميكية، وضبط معايير المخاطر وربطها بمؤشر كشف حساب المستأجر.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveAll}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs px-6 py-3 shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات والقواعد 💾</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-1 pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('timings')}
          className={`px-4 py-3 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'timings'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>توقيت الإخطارات والقوالب المربوطة (Notice Schedule)</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-3 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'templates'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileEdit className="w-4 h-4 text-indigo-500" />
          <span>محرر قوالب الإخطارات والعقود ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('risk_matrix')}
          className={`px-4 py-3 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'risk_matrix'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>معايير مخاطر المستأجرين ومؤشر كشف الحساب</span>
        </button>

        <button
          onClick={() => setActiveTab('custom_rules')}
          className={`px-4 py-3 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'custom_rules'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings2 className="w-4 h-4 text-blue-500" />
          <span>محرك القواعد الشرطية ({customRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator_logs')}
          className={`px-4 py-3 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'simulator_logs'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4 text-emerald-500" />
          <span>المحاكي وسجل الأتمتة (Simulator & Audit)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: AUTOMATED NOTICE TIMINGS & DEDICATED TEMPLATES MAPPING */}
      {/* ========================================================= */}
      {activeTab === 'timings' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
            <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-black text-amber-900 dark:text-amber-300">
                ضبط المواعيد والقوالب المعتمدة للامتثال لقانون الإيجارات الكويتي
              </h4>
              <p className="text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                تتيح هذه الواجهة تحديد توقيت إرسال الإخطارات القانونية الآلية (مثل مهلة الـ 20 يوماً قبل رفع دعوى الإخلاء بموجب المادة 20)، وتعيين القالب النصي المعتمد لكل نوع إشعار لضمان الحجية والامتثال القضائي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {noticeTimings.map((timing) => {
              const boundTpl = templates.find(t => t.id === timing.boundTemplateId);
              return (
                <div
                  key={timing.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    timing.enabled
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                          <Clock className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{timing.noticeType}</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{timing.triggerEvent}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={timing.enabled}
                          onChange={(e) => {
                            const updated = noticeTimings.map(t => t.id === timing.id ? { ...t, enabled: e.target.checked } : t);
                            setNoticeTimings(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 text-xs font-bold">
                    {/* Timing Control */}
                    <div className="lg:col-span-3 space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300">توقيت الإرسال والتنبيه:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={timing.timingValue}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNoticeTimings(noticeTimings.map(t => t.id === timing.id ? { ...t, timingValue: val } : t));
                          }}
                          className="w-20 bg-slate-50 dark:bg-slate-800 border rounded-xl p-2 font-mono font-bold text-center text-indigo-600 dark:text-indigo-400"
                        />
                        <span className="text-slate-600 dark:text-slate-400">يوماً قبل/بعد الحدث</span>
                      </div>
                    </div>

                    {/* Template Binding Selector */}
                    <div className="lg:col-span-5 space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300">القالب المعتمد المربوط آلياً:</label>
                      <select
                        value={timing.boundTemplateId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoticeTimings(noticeTimings.map(t => t.id === timing.id ? { ...t, boundTemplateId: val } : t));
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold"
                      >
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                        ))}
                      </select>
                      {boundTpl && (
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 line-clamp-1 font-medium">
                          الصيغة: {boundTpl.subject}
                        </p>
                      )}
                    </div>

                    {/* Dispatch Channels */}
                    <div className="lg:col-span-4 space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300">قنوات الإرسال المحددة:</label>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={timing.dispatchChannels.sms}
                            onChange={(e) => {
                              const updated = noticeTimings.map(t => t.id === timing.id ? {
                                ...t,
                                dispatchChannels: { ...t.dispatchChannels, sms: e.target.checked }
                              } : t);
                              setNoticeTimings(updated);
                            }}
                            className="accent-indigo-600"
                          />
                          <span>SMS</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={timing.dispatchChannels.whatsapp}
                            onChange={(e) => {
                              const updated = noticeTimings.map(t => t.id === timing.id ? {
                                ...t,
                                dispatchChannels: { ...t.dispatchChannels, whatsapp: e.target.checked }
                              } : t);
                              setNoticeTimings(updated);
                            }}
                            className="accent-emerald-600"
                          />
                          <span>WhatsApp</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={timing.dispatchChannels.docketDraft}
                            onChange={(e) => {
                              const updated = noticeTimings.map(t => t.id === timing.id ? {
                                ...t,
                                dispatchChannels: { ...t.dispatchChannels, docketDraft: e.target.checked }
                              } : t);
                              setNoticeTimings(updated);
                            }}
                            className="accent-amber-600"
                          />
                          <span>مسودة دعوى</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl text-[10px] text-slate-500 font-medium flex items-center justify-between">
                    <span>الأساس التشريعي: {timing.legalRequirement}</span>
                    <button
                      onClick={() => {
                        setActiveTab('templates');
                        setEditingTemplateId(timing.boundTemplateId);
                        const t = templates.find(x => x.id === timing.boundTemplateId);
                        if (t) setEditingForm(t);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold underline"
                    >
                      مراجعة وتعديل القالب في المحرر ✏️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ADVANCED LEGAL TEMPLATE EDITOR (DESIGNS & VARIABLES) */}
      {/* ========================================================= */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates Directory Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black text-slate-900 dark:text-white">قوالب الإخطارات والعقود:</h3>
              <button
                onClick={() => {
                  const newTpl: LegalTemplate = {
                    id: `tpl-${Date.now()}`,
                    title: 'قالب إخطار كويتي جديد',
                    category: 'إنذارات قضائية رسمية',
                    subject: 'عنوان الإخطار أو العقد الرسمي',
                    body: 'إلى المستأجر المكرم/ {اسم_المستأجر} (الرقم المدني: {الرقم_المدني})\nتحديداً بالعين: {اسم_العقار} (وحدة {رقم_الوحدة})\n\nنحيطكم علماً بأنه...',
                    active: true,
                    lastUpdated: 'الآن'
                  };
                  setTemplates([newTpl, ...templates]);
                  setEditingTemplateId(newTpl.id);
                  setEditingForm(newTpl);
                  toast({ type: 'success', title: 'تم إنشاء قالب جديد', message: 'يمكنك الآن صياغة بنود القالب وإدراج المتغيرات.' });
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>قالب جديد</span>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="بحث في القوالب..."
                value={templateSearchQuery}
                onChange={e => setTemplateSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
              />
              <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none text-[10px]">
                {['جميع القوالب', 'إنذارات قضائية رسمية', 'تذكيرات دورية', 'إخطارات إنهاء العقود', 'إنذارات شروط العقد'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedTemplateCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                      selectedTemplateCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setEditingTemplateId(tpl.id);
                    setEditingForm({ ...tpl });
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    editingTemplateId === tpl.id
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">{tpl.title}</h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{tpl.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Template Workspace Editor & Variable Palette */}
          <div className="lg:col-span-8">
            {editingForm ? (
              <Card className="p-6 space-y-5" title={`محرر تصميم القالب: ${editingForm.title}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان القالب المعتمد:</label>
                    <input
                      type="text"
                      value={editingForm.title}
                      onChange={e => setEditingForm({ ...editingForm, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التصنيف الرئيسي:</label>
                    <select
                      value={editingForm.category}
                      onChange={e => setEditingForm({ ...editingForm, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="إنذارات قضائية رسمية">إنذارات قضائية رسمية</option>
                      <option value="تذكيرات دورية">تذكيرات دورية</option>
                      <option value="إخطارات إنهاء العقود">إخطارات إنهاء العقود</option>
                      <option value="إنذارات شروط العقد">إنذارات شروط العقد</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">موضوع الرسالة/الإشعار:</label>
                  <input
                    type="text"
                    value={editingForm.subject}
                    onChange={e => setEditingForm({ ...editingForm, subject: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                {/* Dynamic Variables Palette Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      لوحة المتغيرات الديناميكية (Dynamic Variables Palette)
                    </span>
                    <span className="text-[10px] text-slate-400">انقر على المتغير لإدراجه في نص الصيغة</span>
                  </div>

                  <div className="space-y-2">
                    {variablePalette.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">{group.group}:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.vars.map((v) => (
                            <button
                              key={v.code}
                              type="button"
                              onClick={() => handleInsertVariable(v.code)}
                              title={v.label}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-mono font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-2xs"
                            >
                              + {v.code}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body Textarea Editor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    محتوى ونص الصيغة القانونية:
                  </label>
                  <textarea
                    rows={10}
                    value={editingForm.body}
                    onChange={e => setEditingForm({ ...editingForm, body: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-sans font-medium leading-relaxed"
                  />
                </div>

                <div className="pt-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const cloned: LegalTemplate = {
                          ...editingForm,
                          id: `tpl-${Date.now()}`,
                          title: `${editingForm.title} (نسخة مكررة)`,
                          lastUpdated: 'الآن'
                        };
                        setTemplates([cloned, ...templates]);
                        toast({ type: 'info', title: 'تم التكرار', message: 'تم إنشاء نسخة مطابقة للقالب.' });
                      }}
                      className="text-xs font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>تكرار القالب</span>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setTemplates(templates.map(t => t.id === editingForm.id ? editingForm : t));
                        toast({ type: 'success', title: 'تم حفظ القالب', message: 'تم حفظ وتحديث صيغة القالب بنجاح.' });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold px-6"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ القالب ✏️</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-600 dark:text-slate-300">اختر قالباً لتصميمه وتعديل المتغيرات الديناميكية</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TENANT RISK MATRIX & ACCOUNT LEDGER INTEGRATION */}
      {/* ========================================================= */}
      {activeTab === 'risk_matrix' && (
        <div className="space-y-6">
          {/* Top Info Header */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-black text-indigo-900 dark:text-indigo-300">
                إدارة معايير تصنيف مخاطر المستأجرين وربطها بمؤشر كشف الحساب
              </h4>
              <p className="text-indigo-800 dark:text-indigo-400 leading-relaxed font-medium">
                تحديد العوامل المؤثرة في احتساب درجة خطر المستأجر (أيام التأخير، تكرار الشيكات المرتجعة، المخالفات السابقة، والسوابق القضائية) وربط الناتج بمؤشر المخاطر التلقائي الظاهر بكشف حساب المستأجر.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Low Risk Level */}
            <Card className="p-5 border-emerald-200 dark:border-emerald-900/50 space-y-3" title="🟢 منخفض الخطر (Low Risk)">
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full block w-max">
                  نطاق التأخير: 0 - {riskCriteria.lowRiskMaxDelayDays} أيام
                </span>
                <p className="text-[11px] text-slate-500">مستأجر ممتاز بدون شيكات مرتجعة أو مخالفات.</p>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-[10px] font-bold">
                  مؤشر كشف الحساب: ✅ مستأجر ممتاز
                </div>
              </div>
            </Card>

            {/* Medium Risk Level */}
            <Card className="p-5 border-yellow-200 dark:border-yellow-900/50 space-y-3" title="🟡 متوسط الخطر (Medium Risk)">
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full block w-max">
                  نطاق التأخير: 4 - {riskCriteria.mediumRiskMaxDelayDays} يوماً
                </span>
                <p className="text-[11px] text-slate-500">مستأجر يتأخر بضعة أيام ويستلزم تنبيهات KNet.</p>
                <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 rounded-xl text-[10px] font-bold">
                  مؤشر كشف الحساب: ⚡ متابعة وتذكير آلي
                </div>
              </div>
            </Card>

            {/* High Risk Level */}
            <Card className="p-5 border-amber-200 dark:border-amber-900/50 space-y-3" title="🟧 عالي الخطر (High Risk)">
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full block w-max">
                  نطاق التأخير: {riskCriteria.highRiskMinDelayDays} - 24 يوماً
                </span>
                <p className="text-[11px] text-slate-500">يتضمن شيكاً مرتجعاً أو إنذار المادة 20.</p>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl text-[10px] font-bold">
                  مؤشر كشف الحساب: ⚠️ مستأجر متعثر
                </div>
              </div>
            </Card>

            {/* Critical High Risk Level */}
            <Card className="p-5 border-rose-200 dark:border-rose-900/50 space-y-3" title="🔴 حرج الشدة (Critical Risk)">
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full block w-max">
                  تأخير &gt; 25 يوماً OR قضايا
                </span>
                <p className="text-[11px] text-slate-500">مستأجر ملاحق قضائياً بقضايا إخلاء وإحالة.</p>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 rounded-xl text-[10px] font-bold">
                  مؤشر كشف الحساب: 🚨 حظر تسويات أونلاين
                </div>
              </div>
            </Card>
          </div>

          {/* Ledger Linking Settings */}
          <Card className="p-6 space-y-4" title="🔗 إعدادات وقواعد ربط تصنيف المخاطر بكشف حساب المستأجر (Tenant Ledger Linking)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded">🏷️</span>
                  <span>إظهار شارة مؤشر المخاطر بأعلى كشف حساب المستأجر</span>
                </div>
                <input
                  type="checkbox"
                  checked={riskCriteria.showRiskBadgeInLedger}
                  onChange={e => setRiskCriteria({ ...riskCriteria, showRiskBadgeInLedger: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 rounded">🚫</span>
                  <span>حظر السداد الإلكتروني وتجميد الخصومات لعلامات الخطر الحرجة</span>
                </div>
                <input
                  type="checkbox"
                  checked={riskCriteria.blockOnlineReceiptForHighRisk}
                  onChange={e => setRiskCriteria({ ...riskCriteria, blockOnlineReceiptForHighRisk: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded">💰</span>
                  <span>تضمين رسوم الإنذارات والمتابعة آلياً بجدول الديون بكشف الحساب</span>
                </div>
                <input
                  type="checkbox"
                  checked={riskCriteria.autoAttachLegalFeeInLedger}
                  onChange={e => setRiskCriteria({ ...riskCriteria, autoAttachLegalFeeInLedger: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded">⚖️</span>
                  <span>اشتراط موافقة الشؤون القانونية للتسوية بكشف الحساب</span>
                </div>
                <input
                  type="checkbox"
                  checked={riskCriteria.requireLegalApprovalForSettlement}
                  onChange={e => setRiskCriteria({ ...riskCriteria, requireLegalApprovalForSettlement: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>
            </div>
          </Card>

          {/* Interactive Calculator Studio */}
          <Card className="p-6 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800" title="🧪 حاسبة ومحاكي تقييم خطر المستأجر ومؤشر الحساب">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">أيام التأخير التاريخية:</label>
                <input
                  type="number"
                  value={simLateDays}
                  onChange={e => setSimLateDays(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border rounded-xl p-2.5 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عدد الشيكات المرتجعة:</label>
                <input
                  type="number"
                  value={simBouncedCheques}
                  onChange={e => setSimBouncedCheques(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border rounded-xl p-2.5 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تكرار المخالفات السابقة:</label>
                <input
                  type="number"
                  value={simPastViolations}
                  onChange={e => setSimPastViolations(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border rounded-xl p-2.5 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 border rounded-xl cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={simHasLawsuits}
                    onChange={e => setSimHasLawsuits(e.target.checked)}
                    className="accent-rose-600"
                  />
                  وجود دعاوى قضائية سابقة
                </label>
              </div>
            </div>

            {/* Assessment Result Output Box */}
            <div className={`mt-5 p-5 rounded-2xl border space-y-2 ${calculatedRiskResult.color}`}>
              <div className="flex justify-between items-center">
                <span className="font-black text-sm">{calculatedRiskResult.label}</span>
                <span className="text-xs font-bold font-mono px-3 py-1 bg-white/80 dark:bg-slate-900 rounded-full border">
                  النقاط المحسوبة: {calculatedRiskResult.score} / 100
                </span>
              </div>
              <p className="text-xs font-bold">{calculatedRiskResult.ledgerBadge}</p>
              <p className="text-[11px] leading-relaxed opacity-90">{calculatedRiskResult.actionDesc}</p>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CUSTOM RULES ENGINE */}
      {/* ========================================================= */}
      {activeTab === 'custom_rules' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">قواعد الأتمتة الشرطية النشطة بالنظام</h3>
              <p className="text-xs text-slate-500 mt-0.5">إضافة شروط وإجراءات مخصصة تنفذ تلقائياً عند تحقق الأحداث.</p>
            </div>
            <Button
              onClick={() => setIsRuleModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قاعدة جديدة</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  rule.enabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200/50">
                      {rule.category}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">{rule.name}</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => {
                        const updated = customRules.map(r => r.id === rule.id ? { ...r, enabled: e.target.checked } : r);
                        setCustomRules(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                    <span className="text-indigo-500 font-black">الحدث:</span>
                    <span>{rule.trigger}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                    <span className="text-amber-500 font-black">الشرط:</span>
                    <span>{rule.condition}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                    <span className="text-emerald-600 font-black">الإجراء:</span>
                    <span>{rule.action}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
                        setCustomRules(customRules.filter(r => r.id !== rule.id));
                        toast({ type: 'info', title: 'تم الحذف', message: 'تم إزالة القاعدة.' });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Rule Modal */}
          {isRuleModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">إضافة قاعدة أتمتة شرطية جديدة</h3>
                  <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم القاعدة:</label>
                    <input
                      type="text"
                      value={newRuleForm.name}
                      onChange={e => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                      placeholder="مثال: إرسال تنبيه قضائي فور مرتجع الشيك"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">الحدث (Trigger):</label>
                    <input
                      type="text"
                      value={newRuleForm.trigger}
                      onChange={e => setNewRuleForm({ ...newRuleForm, trigger: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">الشرط (Condition):</label>
                    <input
                      type="text"
                      value={newRuleForm.condition}
                      onChange={e => setNewRuleForm({ ...newRuleForm, condition: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">الإجراء (Action):</label>
                    <input
                      type="text"
                      value={newRuleForm.action}
                      onChange={e => setNewRuleForm({ ...newRuleForm, action: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsRuleModalOpen(false)}>إلغاء</Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newRuleForm.name) return alert('يرجى كتابة اسم القاعدة');
                      const created: CustomRule = {
                        id: `rule-${Date.now()}`,
                        ...newRuleForm
                      };
                      setCustomRules([...customRules, created]);
                      setIsRuleModalOpen(false);
                      toast({ type: 'success', title: 'تم الحفظ', message: 'تم إدراج القاعدة الجديدة.' });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                  >
                    إدراج القاعدة 🚀
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SIMULATOR & AUDIT LOGS */}
      {/* ========================================================= */}
      {activeTab === 'simulator_logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulator Panel */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 space-y-4" title="🧪 محاكي تجربة قوالب الإنذارات القانونية (Dry Run Simulator)">
              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">اختر القالب للتجربة والمعاينة:</label>
                  <select
                    value={simSelectedTemplate}
                    onChange={e => setSimSelectedTemplate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-2.5"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم المستأجر:</label>
                    <input
                      type="text"
                      value={simTenantName}
                      onChange={e => setSimTenantName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">الرقم المدني:</label>
                    <input
                      type="text"
                      value={simCivilId}
                      onChange={e => setSimCivilId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">العقار والوحدة:</label>
                    <input
                      type="text"
                      value={simProperty}
                      onChange={e => setSimProperty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">المبلغ المتأخر (د.ك):</label>
                    <input
                      type="text"
                      value={simOverdueAmount}
                      onChange={e => setSimOverdueAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRunSimulator}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>دمج وتوليد الصيغة القانونية المعاينة</span>
                </Button>

                {simOutputText && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-inner">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pb-2 border-b">
                      <span>مكتب المحامي صبري شطا - معاينة الإخطار الرسمي المدمج</span>
                      <span>جاهز للإرسال والقيد</span>
                    </div>
                    <pre className="text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {simOutputText}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Audit Logs Table */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 space-y-4" title="📜 سجل العمليات والتنبيهات المنجزة آلياً (Execution Audit Logs)">
              <div className="space-y-3">
                {executionLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 dark:text-white">{log.event}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>المستأجر: {log.tenant} ({log.property})</span>
                      <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAutomationSettings;
