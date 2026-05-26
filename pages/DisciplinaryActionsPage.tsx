import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useLocation, Link } from 'react-router-dom';
import { useJurisdiction } from '../components/JurisdictionContext';
import { sampleEmployees } from '../data/employeeData';
import { geminiService } from '../services/geminiService';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

// Icons & Consts
import { 
    ExclamationTriangleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, ChartBarIcon, MagnifyingGlassIcon, 
    CheckCircleIcon, ClockIcon, LinkIcon, PrinterIcon, ShieldCheckIcon,
    ScaleIcon, DocumentTextIcon, GavelIcon, UsersIcon, OFFICE_NAME
} from '../constants';
import { Employee, DisciplinaryAction, ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus } from '../types';
import { violationTypeKuwaitOptions, disciplinaryPenaltyKuwaitOptions, disciplinaryActionStatusOptions } from '../constants';

const mockEmployees: Employee[] = sampleEmployees.slice(0, 8);

// Active investigations available for direct automated linking/import
const activeMockInvestigations = [
    {
        id: 'INV-2024-001',
        employeeId: 'emp-002',
        employeeName: 'فاطمة علي حسين السيد',
        violationType: ViolationTypeKuwait.CONFIDENTIALITY_BREACH,
        reportedBy: 'نظم المعلومات',
        details: 'إفشاء أسرار مهنية متعلقة بمناقصة (مشروع الربط الكهربائي) لجهة خارجية منافسة عبر تصدير ملفات مشفرة.',
        investigator: 'أ. عبدالله الفهد (رئيس قطاع الامتثال القانوني)',
        summary: 'كشفت التحقيقات الرقمية وجلسات الاستماع عن قيام الموظفة بنقل ملفات حساسة من خارج بيئة العمل بحساب غير مفوض عذر الإهمال مرفوض للسرية الشديدة.'
    },
    {
        id: 'INV-2024-002',
        employeeId: 'emp-001',
        employeeName: 'أحمد محمود مبارك',
        violationType: ViolationTypeKuwait.PERFORMANCE_NEGLIGENCE,
        reportedBy: 'لجنة التدقيق المخطط',
        details: 'رصد عجز مالي وقصور في المطابقة المحاسبية بالعهد اليومية للخزينة الرئيسية بمقدار 150 د.ك.',
        investigator: 'لجنة الرقابة الشاملة والتدقيق المالي',
        summary: 'أقر المحاسب بحدوث خطأ يدوي عارض بقيد اليومية، والتزم بتسوية الفرق ماليًا مع إنذاره لخطورة العهدة.'
    },
    {
        id: 'INV-2024-003',
        employeeId: 'emp-003',
        employeeName: 'سارة عبدالله الكندري',
        violationType: ViolationTypeKuwait.ATTENDANCE_ABSENCE,
        reportedBy: 'إدارة الموارد البشرية',
        details: 'غياب مستمر عن مقر العمل لمدة 4 أيام متصلة دون تقديم أي أعذار طبية أو إذن مسبق.',
        investigator: 'أ. خالد الهاجري (مستشار عمالي)',
        summary: 'أفادت الموظفة لاحقاً بالتعرض لوعكة طارئة دون الاحتفاظ بنسخة لتقرير طبي معتمد.'
    }
];

// Initial Disciplinary Cases data
const initialDisciplinaryActions: DisciplinaryAction[] = [ 
  {
    id: 'da1',
    employeeId: 'emp-001',
    employeeName: 'أحمد محمود مبارك',
    violationDate: '2024-07-10',
    reportDate: '2024-07-11',
    reportedBy: 'رئيس القسم المباشر',
    violationType: ViolationTypeKuwait.ATTENDANCE_LATENESS,
    violationDetails: 'تأخير متكرر عن مواعيد الدوام الرسمي لأكثر من 5 مرات خلال الشهر الجاري بدون عذر قانوني مقبول بالرغم من توجيه تنبيهات شفهية تكرارًا.',
    investigation: {
      investigator: 'عبدالعزيز الصالح',
      investigationSummary: 'تمت مواجهة الموظف بسجل البصمة الإلكتروني الخاص بالشؤون الإدارية، وأقر بالتأخير متذرعاً بالازدحام المروري، وهو عذر غير معتبر لائحياً لتكراره المتصل.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
    penaltyDetails: 'إنذار كتابي أول مع التنبيه بخصم المرتب في حال تكرار الواقعة بموجب المادة 35 لعام 2010.',
    actionEffectiveDate: '2024-07-12',
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-07-11',
    linkedInvestigationId: 'INV-2024-012'
  },
  {
    id: 'da2',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين السيد',
    violationDate: '2024-08-10',
    reportDate: '2024-08-11',
    reportedBy: 'إدارة نظم المعلومات',
    violationType: ViolationTypeKuwait.CONFIDENTIALITY_BREACH,
    violationDetails: 'إفشاء أسرار مهنية متعلقة بمناقصة (مشروع الربط الكهربائي) لجهة خارجية منافسة، مما تسبب بإضرار مباشر بمركز المنشأة.',
    investigation: {
        investigator: 'اللجنة القانونية العليا',
        investigationSummary: 'كشفت التحقيقات الرقمية عن تسريب ملفات مشفرة للمنافسين. الموظفة أنكرت في البداية ثم واجهتها اللجنة بالأدلة التقنية الموثقة بحضور محاميها مما يشير للضرر الفادح المذكور بالمادة 41.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.TERMINATION_WITHOUT_NOTICE,
    penaltyDetails: 'فصل تأديبي فوري بموجب المادة 41 البند (د) مع حرمان من مكافأة نهاية الخدمة لتسريب أسرار فادحة الأثر.',
    actionEffectiveDate: '2024-08-12',
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-08-11',
    linkedInvestigationId: 'INV-2024-088'
  },
  {
    id: 'da3',
    employeeId: 'emp-003',
    employeeName: 'جاسم محمد الراشد',
    violationDate: '2024-05-15',
    reportDate: '2024-05-17',
    reportedBy: 'إدارة شؤون العملاء',
    violationType: ViolationTypeKuwait.PERFORMANCE_NEGLIGENCE,
    violationDetails: 'إهمال توثيق واستكمال عقود المراجعين للفرع الجنوبي مما تسبب في غرامات تعاقدية من جهة تنظيمية.',
    investigation: {
      investigator: 'أ. جود الصقر',
      investigationSummary: 'الوقوف على تراكم المعاملات العالقة لفترة تزيد عن أسبوعين كإهمال وظيفي ظاهر لم تبرره ضغوط العمل.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_3,
    penaltyDetails: 'خصم من الراتب يعادل 3 أيام عمل لدواعي الإهمال غير الجسيم المتسبب في خسارة.',
    actionEffectiveDate: '2024-05-20',
    status: DisciplinaryActionStatus.INVESTIGATION_COMPLETE,
    createdAt: '2024-05-17',
    linkedInvestigationId: 'INV-2024-009'
  }
];

// Initial Raw Violations Database
const initialViolationsLogs = [
  { id: 'v-1', employeeId: 'emp-002', employeeName: 'فاطمة علي حسين السيد', violationType: ViolationTypeKuwait.PERFORMANCE_NEGLIGENCE, violationDate: '2026-05-01', reportedBy: 'مدير العمليات البيئية', details: 'تأخير صيانة خوادم قاعدة البيانات الاحتياطية مما أدى لتعطل مرحلي لنظام فرع المباركية لمدة ساعتين.', severity: 'HIGH', status: 'Under Investigation' },
  { id: 'v-2', employeeId: 'emp-001', employeeName: 'أحمد محمود مبارك', violationType: ViolationTypeKuwait.ATTENDANCE_LATENESS, violationDate: '2026-05-12', reportedBy: 'سجل البينة الرقمي', details: 'تأشير تأخير متتالي بمعدل 45 دقيقة لأيام العمل الزوجية دون مستند رسمي.', severity: 'LOW', status: 'New Violation' },
  { id: 'v-3', employeeId: 'emp-003', employeeName: 'جاسم محمد الراشد', violationType: ViolationTypeKuwait.OFFICE_ETIQUETTE, violationDate: '2026-05-20', reportedBy: 'رئيس وحدة الموارد الإنسانية', details: 'مشادة لفظية وصوت مرتفع مسيء أمام الجمهور والشاشات بقسم خدمة المراجعين.', severity: 'MEDIUM', status: 'New Violation' }
];

// Initial Appeals/Grievances Database
const initialAppealsLogs = [
  { id: 'app-1', caseId: 'da1', caseNumber: 'VERDICT-DA1', employeeName: 'أحمد محمود مبارك', appealDate: '2024-07-15', reason: 'غياب البصمة ليومين من المذكورين كان بفعل إجراء جراحة عاجلة للأسنان ومرفق التقرير الصادر من المركز التخصصي.', status: 'Under Review', comments: 'بانتظار التحقق من شهادة المركز الطبي ليتسنى حفظ الغرامة أو تعويضها.' },
  { id: 'app-2', caseId: 'da3', caseNumber: 'VERDICT-DA3', employeeName: 'جاسم محمد الراشد', appealDate: '2024-05-22', reason: 'حجم العمل المتزايد وتوقف النظام الأساسي المعتمد هو السبب الفعلي لعدم التسوية ولا تقع المسؤولية الكاملة على كاهلي يدوياً.', status: 'Rejected', comments: 'جرى مراجعة سجلات النظام واتضح قيام الموظف بتأخير المعاملة لفترات طويلة قبل تعطل السحابة الكهربائية.' }
];

// Automatic Legal Recommendation rules under Kuwaiti Labor Law (Law No. 6 of 2010)
interface LegalRule {
  penalty: DisciplinaryPenaltyKuwait;
  articles: string;
  advice: string;
  limitExplanation?: string;
}

const getKuwaitiLaborLawRecommendation = (type: ViolationTypeKuwait, historyCount: number): LegalRule => {
  switch (type) {
    case ViolationTypeKuwait.ATTENDANCE_LATENESS:
      if (historyCount === 0) {
        return {
          penalty: DisciplinaryPenaltyKuwait.VERBAL_WARNING,
          articles: 'المادة 35 من قانون العمل الكويتي رقم 6 لسنة 2010',
          advice: 'تنصح اللائحة بالتدرج التأديبي، والبدء دائمًا بتوجيه تنبيه شفوي مسجل بملف شؤون الموظفين.'
        };
      } else if (historyCount === 1) {
        return {
          penalty: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
          articles: 'المادة 35 من قانون العمل الكويتي رقم 6/2010',
          advice: 'عقوبة كتابية تأديبية مسجلة تسبق الاقتطاع المالي لإقامة الحجة القانونية.'
        };
      } else {
        return {
          penalty: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_1,
          articles: 'المادة 35 - الحد الأقصى للاقتطاع العمالي',
          advice: 'خصم أجر يوم واحد. تذكر ألا تتجاوز الخصومات اليومية 5 أيام في الشهر الواحد.',
          limitExplanation: 'المادة 35 تمنع الخصم العمالي لأكثر من 5 أيام من أجر الشهر تلافياً للبطلان الإداري.'
        };
      }
    case ViolationTypeKuwait.ATTENDANCE_ABSENCE:
      if (historyCount === 0) {
        return {
          penalty: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_1,
          articles: 'المادة 35 والمادة 42 من قانون العمل الكويتي',
          advice: 'خصم أجر أيام الغياب الفعلية بقوة القانون إضافة لجزاء مالي مستقل بمقدار يوم واحد تجنباً للخلل.'
        };
      } else {
        return {
          penalty: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_3,
          articles: 'المادة 35 - تدرج المخالفات الإدارية غياباً',
          advice: 'خصم أجر 3 أيام مع إنذار صريح بالإنهاء الإداري في حال بلوغ الغياب 7 أيام متتالية أو 15 متفرقة.',
          limitExplanation: 'خصم 3 أيام يقترب من سقف الـ 5 أيام المتتالية شهرياً لنفس الموظف.'
        };
      }
    case ViolationTypeKuwait.CONFIDENTIALITY_BREACH:
      return {
        penalty: DisciplinaryPenaltyKuwait.TERMINATION_WITHOUT_NOTICE,
        articles: 'المادة 41 البند (د) من قانون العمل الكويتي رقم 6/2010',
        advice: 'يحق قانوناً الفصل الفوري دون مكافأة أو إخطار إذا ثبت إفشاء أسرار أحدث خسارات مؤكدة للمكتب.',
        limitExplanation: 'عقوبة جسيمة - المادة 41 تشترط التوثيق الدقيق لواقعة التسريب وحجم الضرر الملحق بالمنشأة.'
      };
    case ViolationTypeKuwait.BRIBERY_CORRUPTION:
    case ViolationTypeKuwait.FORGERY_TAMPARING:
      return {
        penalty: DisciplinaryPenaltyKuwait.TERMINATION_WITHOUT_NOTICE,
        articles: 'المادة 41 البند (أ) والبند (و) من قانون العمل',
        advice: 'فصل تأديبي فوري لارتكاب فعل مخل بالشرف والنزاهة المهنية مع التوصية المباشرة بإحالة الملف للنيابة العامة.',
        limitExplanation: 'يتطلب محضر تحقيق رسمي جنائي مدعوم بالأدلة وصورة البصمة ومطابقة المحررات المزورة.'
      };
    case ViolationTypeKuwait.PERFORMANCE_NEGLIGENCE:
      return {
        penalty: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
        articles: 'المادة 35 من قانون العمل - كود الأداء المهني',
        advice: 'توجيه إنذار رسمي لتحسين الأداء وتعيين مشرف مؤقت مع المتابعة لتقييم النتائج قبل تفعيل الخصومات المالية.'
      };
    default:
      return {
        penalty: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
        articles: 'قانون العمل الكويتي واللوائح والقرارات التنظيمية المكملة له',
        advice: 'يوصى بالانتقال إلى الإنذار الكتابي الموثق بخطة علاجية للأداء مسندة للرئيس المباشر.'
      };
  }
};

export const DisciplinaryActionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { selectedJurisdiction } = useJurisdiction();
  
  // State Modules
  const [activeTab, setActiveTab] = useState<'dashboard' | 'violations' | 'actions' | 'appeals' | 'templates'>('dashboard');
  const [actions, setActions] = useState<DisciplinaryAction[]>(initialDisciplinaryActions);
  const [violations, setViolations] = useState(initialViolationsLogs);
  const [appeals, setAppeals] = useState(initialAppealsLogs);
  
  // Filtering & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActionStatus, setFilterActionStatus] = useState<string>('');
  const [filterViolationType, setFilterViolationType] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  // Modals Controlling
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Partial<DisciplinaryAction> | null>(null);
  const [printingAction, setPrintingAction] = useState<DisciplinaryAction | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('warning_1');

  // New Appeal Registration Modal
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [newAppealData, setNewAppealData] = useState({ caseId: '', reason: '' });

  // AI Assistant Panel State
  const [aiAssistantInput, setAiAssistantInput] = useState('');
  const [aiAssistantResponse, setAiAssistantResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-import handler for the form
  const [selectedImportInvId, setSelectedImportInvId] = useState('');

  // Main Form fields tracking for live calculations
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formViolationType, setFormViolationType] = useState<ViolationTypeKuwait>(ViolationTypeKuwait.ATTENDANCE_LATENESS);
  const [formPenaltyCode, setFormPenaltyCode] = useState<DisciplinaryPenaltyKuwait>(DisciplinaryPenaltyKuwait.WRITTEN_WARNING);
  const [formViolationDetails, setFormViolationDetails] = useState('');
  const [formViolationDate, setFormViolationDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReportDate, setFormReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReportedBy, setFormReportedBy] = useState('');
  const [formInvestigator, setFormInvestigator] = useState('');
  const [formInvSummary, setFormInvSummary] = useState('');
  const [formActionStatus, setFormActionStatus] = useState<DisciplinaryActionStatus>(DisciplinaryActionStatus.ACTION_TAKEN);
  const [formLinkedInv, setFormLinkedInv] = useState('');
  const [formEffectiveDate, setFormEffectiveDate] = useState('');

  // Handle direct navigation integration from external state link
  const location = useLocation();
  useEffect(() => {
    if (location.state && (location.state as any).linkedInvestigationId) {
        const { linkedInvestigationId, violationDetails } = location.state as any;
        setFormLinkedInv(linkedInvestigationId || '');
        setFormViolationDetails(violationDetails || '');
        setFormViolationType(ViolationTypeKuwait.OTHER);
        setEditingAction({
            linkedInvestigationId: linkedInvestigationId,
            violationDetails: violationDetails || '',
        });
        setIsFormOpen(true);
        setActiveTab('actions');
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle direct import auto-mapping
  const handleImportInvestigation = (invId: string) => {
    setSelectedImportInvId(invId);
    if (!invId) return;
    const inv = activeMockInvestigations.find(i => i.id === invId);
    if (inv) {
      setFormEmployeeId(inv.employeeId);
      setFormViolationType(inv.violationType);
      setFormViolationDetails(inv.details);
      setFormReportedBy(inv.reportedBy);
      setFormInvestigator(inv.investigator);
      setFormInvSummary(inv.summary);
      setFormLinkedInv(inv.id);
      addToast({
        type: 'success',
        title: 'تم استيراد الملف التلقائي',
        message: 'تم تعبئة حقول المخالفة والتحقيق والموظف واللجنة بنجاح دون تكرار يدوي.'
      });
    }
  };

  // Re-run recommendation logic dynamically when form values change
  const currentEmployeeObj = useMemo(() => {
    return mockEmployees.find(e => e.id === formEmployeeId);
  }, [formEmployeeId]);

  const priorViolationsCount = useMemo(() => {
    return actions.filter(a => a.employeeId === formEmployeeId && a.status === DisciplinaryActionStatus.ACTION_TAKEN).length;
  }, [formEmployeeId, actions]);

  const autoLawRecommendation = useMemo(() => {
    return getKuwaitiLaborLawRecommendation(formViolationType, priorViolationsCount);
  }, [formViolationType, priorViolationsCount]);

  // Live deduction calculations as a helpful payroll integration preview
  const liveFinancialDeduction = useMemo(() => {
    if (!currentEmployeeObj) return null;
    let days = 0;
    if (formPenaltyCode === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_1) days = 1;
    if (formPenaltyCode === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_3) days = 3;
    if (formPenaltyCode === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_5) days = 5;
    if (days === 0) return null;
    const dailyRate = currentEmployeeObj.basicSalary / 30;
    const totalDeduction = dailyRate * days;
    return {
      days,
      basicSalary: currentEmployeeObj.basicSalary,
      valueKwd: totalDeduction.toFixed(3)
    };
  }, [currentEmployeeObj, formPenaltyCode]);

  // Open the Form for adding/editing a penalty
  const handleOpenForm = (existing: Partial<DisciplinaryAction> | null = null) => {
    if (existing) {
      setEditingAction(existing);
      setFormEmployeeId(existing.employeeId || '');
      setFormViolationType(existing.violationType || ViolationTypeKuwait.ATTENDANCE_LATENESS);
      setFormPenaltyCode(existing.actionTaken || DisciplinaryPenaltyKuwait.WRITTEN_WARNING);
      setFormViolationDetails(existing.violationDetails || '');
      setFormViolationDate(existing.violationDate || new Date().toISOString().split('T')[0]);
      setFormReportDate(existing.reportDate || new Date().toISOString().split('T')[0]);
      setFormReportedBy(existing.reportedBy || '');
      setFormInvestigator(existing.investigation?.investigator || '');
      setFormInvSummary(existing.investigation?.investigationSummary || '');
      setFormActionStatus(existing.status || DisciplinaryActionStatus.ACTION_TAKEN);
      setFormLinkedInv(existing.linkedInvestigationId || '');
      setFormEffectiveDate(existing.actionEffectiveDate || '');
    } else {
      setEditingAction(null);
      setFormEmployeeId('');
      setFormViolationType(ViolationTypeKuwait.ATTENDANCE_LATENESS);
      setFormPenaltyCode(DisciplinaryPenaltyKuwait.VERBAL_WARNING);
      setFormViolationDetails('');
      setFormViolationDate(new Date().toISOString().split('T')[0]);
      setFormReportDate(new Date().toISOString().split('T')[0]);
      setFormReportedBy('');
      setFormInvestigator('');
      setFormInvSummary('');
      setFormActionStatus(DisciplinaryActionStatus.ACTION_TAKEN);
      setFormLinkedInv('');
      setFormEffectiveDate('');
      setSelectedImportInvId('');
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId || !formViolationDetails) {
      addToast({
        type: 'warning',
        title: 'تنبيه النقص',
        message: 'يرجى اختيار الموظف المطلوب وتعبئة كامل تفاصيل الحادثة لإتمام المستند.'
      });
      return;
    }

    const matchedEmployee = mockEmployees.find(emp => emp.id === formEmployeeId);
    const resolvedName = matchedEmployee ? matchedEmployee.fullNameAr : 'غير معرف';

    const payload: DisciplinaryAction = {
      id: editingAction?.id || `da-${Date.now()}`,
      employeeId: formEmployeeId,
      employeeName: resolvedName,
      violationDate: formViolationDate,
      reportDate: formReportDate,
      reportedBy: formReportedBy || 'النظام الإداري الآلي',
      violationType: formViolationType,
      violationDetails: formViolationDetails,
      linkedInvestigationId: formLinkedInv || undefined,
      actionTaken: formPenaltyCode || undefined,
      penaltyDetails: `محرر تأديبياً بموجب ${autoLawRecommendation.articles}. توصية الذكاء الاصطناعي: ${autoLawRecommendation.advice}`,
      actionEffectiveDate: formEffectiveDate || undefined,
      status: formActionStatus,
      investigation: formInvestigator || formInvSummary ? {
        investigator: formInvestigator,
        investigationSummary: formInvSummary
      } : undefined,
      createdAt: editingAction?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingAction?.id) {
      setActions(prev => prev.map(a => a.id === editingAction.id ? payload : a));
      addToast({
        type: 'success',
        title: 'تعديل السجل التأديبي',
        message: 'تم معالجة التغييرات وحفظ الملف التأديبي وقرار العقوبة بنجاح.'
      });
    } else {
      setActions(prev => [payload, ...prev]);
      addToast({
        type: 'success',
        title: 'إصدار القرار الإداري',
        message: 'تم قيد البلاغ التأديبي في سجل الموظف بنجاح والاتصال بالموارد البشرية.'
      });
    }
    setIsFormOpen(false);
  };

  // Escalate raw violation reported directly into a formal disciplinary case
  const handleEscalateViolation = (viol: typeof initialViolationsLogs[0]) => {
    setFormEmployeeId(viol.employeeId);
    setFormViolationType(viol.violationType);
    setFormViolationDetails(viol.details);
    setFormViolationDate(viol.violationDate);
    setFormReportedBy(viol.reportedBy);
    setFormInvestigator('');
    setFormInvSummary('');
    setFormPenaltyCode(getKuwaitiLaborLawRecommendation(viol.violationType, 0).penalty);
    setFormActionStatus(DisciplinaryActionStatus.PENDING_INVESTIGATION);
    setEditingAction(null);
    setIsFormOpen(true);
    addToast({
      type: 'info',
      title: 'بدء إجراء تصعيدي',
      message: `تم تحويل مخالفة الموظف ${viol.employeeName} تلقائيًا لنموذج صياغة العقوبات وتغذية الحقول المرجعية.`
    });
  };

  // Create a new appeal against a penalty
  const handleRegisterAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppealData.caseId || !newAppealData.reason) {
      addToast({ type: 'warning', title: 'تعبئة البيانات', message: 'يرجى ملء سبب وجدوى التظلم والملخص القانوني.' });
      return;
    }
    const relatedCase = actions.find(a => a.id === newAppealData.caseId);
    if (!relatedCase) return;

    // Update case status to appealed to show full integration
    setActions(prev => prev.map(a => a.id === relatedCase.id ? { ...a, status: DisciplinaryActionStatus.APPEALED } : a));

    const freshAppeal = {
      id: `app-${Date.now()}`,
      caseId: relatedCase.id,
      caseNumber: `VERDICT-${relatedCase.id.split('-').pop()?.toUpperCase()}`,
      employeeName: relatedCase.employeeName,
      appealDate: new Date().toISOString().split('T')[0],
      reason: newAppealData.reason,
      status: 'Under Review',
      comments: 'تم تسجيل التظلم بنجاح وإرساله فورياً للجنة الاستئناف الإدارية وقيد التعليق.'
    };

    setAppeals(prev => [freshAppeal, ...prev]);
    setIsAppealModalOpen(false);
    setNewAppealData({ caseId: '', reason: '' });
    addToast({
      type: 'success',
      title: 'تقديم شكوى تظلم',
      message: 'تم قيد التظلم القانوني وإدراج الحالة ضمن ملفات الاستئناف للمنشأة.'
    });
  };

  // UI Action handlers
  const handleDuplicateAction = (act: DisciplinaryAction) => {
    const copy: DisciplinaryAction = {
      ...act,
      id: `da-copy-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: DisciplinaryActionStatus.PENDING_INVESTIGATION,
      linkedInvestigationId: act.linkedInvestigationId ? `${act.linkedInvestigationId}-DUPL` : undefined
    };
    setActions(prev => [copy, ...prev]);
    addToast({ type: 'success', title: 'مستند مضاعف', message: 'تم تكرار الملف التأديبي كمسودة جديدة لاستقبال التحديثات.' });
  };

  const handleDeleteAction = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل التأديبي بصفة نهائية؟')) {
      setActions(prev => prev.filter(item => item.id !== id));
      addToast({ type: 'error', title: 'حذف القرار', message: 'تم إزالة القرار التأديبي من الأرشيف تماماً.' });
    }
  };

  const handleUpdateAppealStatus = (appealId: string, nextStatus: 'Reviewing' | 'Approved' | 'Rejected') => {
    setAppeals(prev => prev.map(ap => {
      if (ap.id === appealId) {
        let textComments = ap.comments;
        if (nextStatus === 'Approved') textComments = 'تم قبول تظلم الموظف بالكامل وجاري رد الخصومات والتنبيهات المذكورة عمالياً.';
        if (nextStatus === 'Rejected') textComments = 'تم مراجعة الوقائع وتجنيب تبرير المخاطر وثبت صحة الجزاء والموجب القانوني له.';
        return { ...ap, status: nextStatus, comments: textComments };
      }
      return ap;
    }));
    addToast({ type: 'success', title: 'تحديث حالة التظلم', message: 'تم إعادة تقييم جدوى الشكوى وإخطار الموظف المعني.' });
  };

  // AI Chatbot Integration for Labor Law Advices
  const handleQueryAiAssistant = async () => {
    if (!aiAssistantInput.trim()) return;
    setIsAiLoading(true);
    setAiAssistantResponse(null);
    try {
      const response = await geminiService.getChatbotResponse(
        `أنت خبير ومستشار قانوني كويتي مرخص. تفضل بالإجابة عن هذا الاستفسار المتعلق بلائحة الجزاءات وقانون العمل الكويتي رقم 6 لسنة 2010 والقرارات التنظيمية للموظفين:
        الاستفسار: "${aiAssistantInput}"
        الرجاء صياغة إجابة رصينة ومهنية وموجزة ومستندة لمواد قانونية واضحة.`
      );
      setAiAssistantResponse(response);
    } catch (e) {
      // Robust client fallback model
      let fallbackText = '';
      if (aiAssistantInput.includes('خصم') || aiAssistantInput.includes('المادة 35')) {
        fallbackText = `مراجعة قانونية آلية (قانون العمل الكويتي رقم 6/2010 - المادة 35):
        1. لا يجوز خصم أكثر من أجر خمسة أيام في الشهر التأديبي الواحد لنفس الموظف.
        2. لا يجوز إجراء الخصم إلا بعد مواجهة العامل ودفاعه وسماع أقوال المحيطين بمحضر رسمي.
        3. يرجى رصد التدرج التأديبي لحفظ مرجعية القانون من أي بطلان قضائي لدى هيئات تسوية النزاعات العمالية.`;
      } else if (aiAssistantInput.includes('فصل') || aiAssistantInput.includes('المادة 41') || aiAssistantInput.includes('إنهاء')) {
        fallbackText = `مراجعة قانونية آلية (قانون العمل الكويتي رقم 6/2010 - المادة 41):
        يجوز لأصحاب الأعمال تسريح العمال دون إشعار ودون نهاية خدمة في حالات محددة على سبيل الحصر:
        - البند (أ): التزوير وتلاعب إثبات الهوية.
        - البند (ج): التسبب في حدوث تلف جسيم وخسارة مادية فادحة بشرط إخطار قطاع الشؤون خلال 3 أيام.
        - البند (د): إفشاء أسرار المكتب الفنية وعقود المناقصات مما تسبب بأثر سيء.
        - يوصى بعدم الفصل التعسفي دون توثيق فني وقانوني تالٍ لجلسات الاستماع.`;
      } else {
        fallbackText = `الاستفسار الاستشاري الرديف (الذكاء الاصطناعي - عدالة):
        عملاً بأحكام قانون العمل بدولة الكويت، فإن ممارسات الجزاء وحفظ التحقيق والتحذير تتطلب اتخاذ محاضر مكتوبة وممهورة بتواقيع أطراف الواقعة. يرجى توجيه الإنذارات كمسودات رسمية تم تسليمها باليد أو البريد الإلكتروني المعتمر لحصانة مركزك القضائي وصحة دفوعك العمالية لاحقاً.`;
      }
      setAiAssistantResponse(fallbackText);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Recharts aggregation values
  const analyticsByViolationType = useMemo(() => {
    const counts: Record<string, number> = {};
    actions.forEach(a => {
      counts[a.violationType] = (counts[a.violationType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [actions]);

  const analyticsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    actions.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [actions]);

  const STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  // Search & Filters computation
  const filteredActions = useMemo(() => {
    return actions.filter(item => {
      const matchSearch = String(item.employeeName).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(item.violationDetails).toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterActionStatus ? item.status === filterActionStatus : true;
      const matchType = filterViolationType ? item.violationType === filterViolationType : true;
      return matchSearch && matchStatus && matchType;
    });
  }, [actions, searchQuery, filterActionStatus, filterViolationType]);

  const selectedCaseObj = useMemo(() => {
    if (!selectedCaseId) return null;
    return actions.find(a => a.id === selectedCaseId) || null;
  }, [selectedCaseId, actions]);

  // Pre-compiled Printable Corporate HR Legal Letter templates with inline CSS for print-preview
  const textTemplates = useMemo(() => {
    return {
      warning_1: {
        title: 'صيغة إنذار كتابي رسمي أول لتكرار الإهمال والغياب',
        body: `تاريخ المستند: ${new Date().toLocaleDateString('ar-EG')}
الرقم المرجعي الرسمي: ADALA-WARN-REF-${Date.now().toString().slice(-4)}

السيد / الموقر المعني بمسودة الإنذار العمالي،
نحيطكم علماً بأنه قد تلاحظ للرئاسة المباشرة وإدارة شؤون موظفي المكتب استمرار مخالفتكم لقواعد العمل والوقار الوظيفي المعتمدة لائحياً وذلك بالتاريخ والإفادة المرجعية المذكورة ببطاقة الواقعة.

وعليه، فقد قررت الإدارة القانونية بموجب الصلاحيات والتحقيقات توجيه هذا "الإنذار الكتابي الرسمي الأول"، مطالبين إياكم بالالتزام التام ببنود العقد وحسن سلوك العمل، مع التنبيه بأن تكرار الواقعة سيعرضكم لتطبيق تدابير مالية وخصومات متتالية من الأساسي الشهري قد تتصاعد لفسخ عقد الاستقدام دون تعويض عملاً بالمادة 35 لعام 2010.`
      },
      deduction_1: {
        title: 'صيغة قرار إداري رسمي بخصم مالي مقتطع من تفريغ اليومية',
        body: `تاريخ صدور القرار: ${new Date().toLocaleDateString('ar-EG')}
رقم ملف القرار التأديبي: ADALA-DED-REF-${Date.now().toString().slice(-4)}

بموجب أحكام المادة الكودية 35 من قانون العمل الكويتي رقم 6 لسنة 2010 واللائحة النموذجية للمكتب،
وبناءً على مخرجات ملف التحقيق الموثق رقمياً، حيث ثبت قيام الموظف بمخالفة أقر بوجودها وسماعه للشهود بقنوات التحقق المعتمدة،

قررنا الآتي:
أولاً: خصم ما يعادل من أيام الدوام المنصوص عليها ببطاقة الصياغة من إجمالي الراتب الأساسي الشهري المستحق للموظف عن شهر العمل الجاري.
ثانياً: يحال القرار لقسمPayroll لمباشرة الاقتطاع المالي وتحديث مستحقات البصمة الإجمالية، مع إقران نسخة بحقيبته الإلكترونية الشخصية لتدارس السلوك.`
      },
      suspension_1: {
        title: 'صيغة قرار وقف مؤقت عن العمل احترازياً لإتمام التحقيقات',
        body: `التاريخ الرسمي: ${new Date().toLocaleDateString('ar-EG')}
الرقم الإشاري للملف الإداري: ADALA-SUSP-REF-${Date.now().toString().slice(-4)}

بناءً على الصلاحيات التأديبية وتفويض قطاع الشؤون، ولحاجة منشأة التحقيق في حماية الملف الصادر،
تجاه الواقعة الجسيمة والاتهامات المنظورة عمالياً للموظف المعني بالتحفظ،

تقرر رسمياً:
إيقاف الموظف مؤقتاً ومرحلياً عن أداء التزامات العمل والمناوبة مع وقف مخصصات الراتب بنسبة 50% أو كاملة عملاً بالتدرج القانوني المعمول به، وذلك لفترة لا تزيد عن 10 أيام أو حتى انتهاء اللجنة القانونية من إعداد تقرير الفصل والمساءلة، وتجنيب دخوله مقر النظم أو الحاسبات لضمان تداول الأدلة بموضوعية وتجرد وحياد تام.`
      }
    };
  }, []);

  const [customEditableTemplateBody, setCustomEditableTemplateBody] = useState('');

  useEffect(() => {
    const selected = textTemplates[selectedTemplateId as keyof typeof textTemplates];
    if (selected) {
      setCustomEditableTemplateBody(selected.body);
    }
  }, [selectedTemplateId, textTemplates]);

  return (
    <div className="space-y-6 pb-20 text-right" dir="rtl">
      {/* Upper Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 print:hidden">
            <Link to="/employee-affairs" className="text-xs text-indigo-600 hover:underline font-bold">شؤون الموظفين</Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs text-slate-400">إدارة الجزاءات والقضايا التأديبية</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            <GavelIcon className="w-8 h-8 text-rose-600 ml-3" />
            منظومة العقوبات والجزاءات التأديبية
          </h1>
          <p className="text-slate-500 font-bold mt-1 text-sm">التطابق التام والتحقق القياسي واللوائح المعمول بها عمالياً بدولة الكويت</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="border-slate-300 text-slate-700 font-bold text-xs" onClick={() => setIsAppealModalOpen(true)}>
            تقديم شكوى تظلم
          </Button>
          <Button onClick={() => handleOpenForm(null)} leftIcon={<PlusCircleIcon className="w-5 h-5 ml-1" />}>
            تسجيل قرار جزائي
          </Button>
        </div>
      </div>

      {/* Primary Tab Bar */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white p-2 rounded-xl shadow-xs gap-1">
        {[
          { id: 'dashboard', label: 'لوحة التحكم والتحليل والذكاء', icon: <ChartBarIcon className="w-4 h-4 ml-1" /> },
          { id: 'violations', label: 'إدارة البلاغات ومخالفات البصمة', icon: <ExclamationTriangleIcon className="w-4 h-4 ml-1" /> },
          { id: 'actions', label: 'سجل العقوبات والقرارات المعتمدة', icon: <GavelIcon className="w-4 h-4 ml-1" /> },
          { id: 'appeals', label: 'التظلمات والالتماسات العمالية', icon: <ScaleIcon className="w-4 h-4 ml-1" /> },
          { id: 'templates', label: 'حجج الصياغة والنماذج والطباعة الكودية', icon: <DocumentTextIcon className="w-4 h-4 ml-1" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSelectedCaseId(null); }}
            className={`flex items-center px-4 py-2.5 rounded-lg text-xs font-black transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Switch Tab Content Container */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-b-4 border-slate-900 shadow-sm bg-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحالات والمنازعات</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{actions.length}</p>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700"><DocumentTextIcon className="w-5 h-5" /></div>
              </div>
            </Card>
            <Card className="border-b-4 border-emerald-600 shadow-sm bg-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">جزاءات نافذة بالأجر</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">
                    {actions.filter(a => a.status === DisciplinaryActionStatus.ACTION_TAKEN).length}
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></div>
              </div>
            </Card>
            <Card className="border-b-4 border-amber-500 shadow-sm bg-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تظلمات واستئنافات معلقة</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">
                    {appeals.filter(ap => ap.status === 'Under Review').length}
                  </p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg text-amber-500"><ScaleIcon className="w-5 h-5" /></div>
              </div>
            </Card>
            <Card className="border-b-4 border-red-500 shadow-sm bg-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التسريحات والفصل بموجب المادة 41</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">
                    {actions.filter(a => a.actionTaken === DisciplinaryPenaltyKuwait.TERMINATION_WITHOUT_NOTICE).length}
                  </p>
                </div>
                <div className="p-2.5 bg-red-50 rounded-lg text-red-500"><ExclamationTriangleIcon className="w-5 h-5" /></div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Analytics Charts Card */}
            <Card className="lg:col-span-2 bg-white" title="رسم بياني لتوزيع وصحة الجزاءات والمخالفات" icon={<ChartBarIcon className="w-5 h-5 text-indigo-600" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 text-center mb-4">تصنيف الوقائع والمخالفات عمالياً</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsByViolationType}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 text-center mb-4">الحالة التنفيذية وسجلات الإخلاء</h3>
                  <div className="h-64 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analyticsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>

            {/* Smart Laws & AI Consultation Console */}
            <Card className="bg-slate-900 text-white" title="استشارة الذكاء الاصطناعي بلائحة الجزاءات (AI)" icon={<ClockIcon className="w-5 h-5 text-amber-400" />}>
              <div className="space-y-4 pt-2">
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  اكتب سؤالًا قانونيًا أو صفة مخالفة وسيرد المساعد عماليًا لتسوية الدفوع بمقتضى قانون العمل الكويتي رقم 6 لسنة 2010.
                </p>
                <div className="space-y-2 text-slate-900">
                  <textarea
                    value={aiAssistantInput}
                    onChange={e => setAiAssistantInput(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: هل يجوز خصم 7 أيام مرة واحدة للموظف الغائب؟"
                  />
                  <Button
                    onClick={handleQueryAiAssistant}
                    isLoading={isAiLoading}
                    className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-black py-2"
                  >
                    عرض الرأي القانوني المدعوم بالذكاء كويتياً
                  </Button>
                </div>

                {aiAssistantResponse && (
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-[11px] leading-relaxed max-h-56 overflow-y-auto custom-scrollbar text-amber-100">
                    <p className="font-black text-xs text-white mb-1.5 flex items-center gap-1">
                      <span>الرأي والمقترح الاستشاري للمنظومة:</span>
                    </p>
                    <div className="whitespace-pre-line">{aiAssistantResponse}</div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Warnings & Alerts feed */}
          <Card className="bg-white" title="تنبيهات عاجلة ونداءات الضوابط العمالية" icon={<ExclamationTriangleIcon className="w-5 h-5 text-red-600" />}>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <p className="font-bold text-slate-800">تراكم بلاغات الغياب والتأخر:</p>
                </div>
                <p className="text-slate-500 italic">الموظف أحمد محمود مبارك لديه أكثر من 3 إفادات تأخير مسجلة هذا الشهر دون قرار جزائي.</p>
              </div>
              <div className="py-3 flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <p className="font-bold text-slate-800">طلب اعتماد فصل جسيم:</p>
                </div>
                <p className="text-slate-500 italic">بانتظار توقيع الطرف الثاني المعترف بالمخالفة لإتمام الفصل تحت المادة 41 للموظفة فاطمة السيد.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'violations' && (
        <Card className="bg-white" title="بلاغات المخالفات قيد التحفظ والمراجعة" icon={<ExclamationTriangleIcon className="w-5 h-5 text-indigo-600" />}>
          <p className="text-xs text-slate-500 font-bold mb-4">
            هذه مخالفات جرى رصدها من الرؤساء المباشرين، وتخضع للفرز الأولي للوقوف على مدى ملاءمتها للإحالة إلى تحقيق تأديبي رسمي.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-xs">
              <thead className="bg-slate-50">
                <tr className="border-b divide-x divide-x-reverse divide-slate-100">
                  {['الموظف المشكو بحقه', 'تصنيف الواقعة', 'تاريخ الرصد', 'جهة البلاغ', 'تفاصيل الواقعة المشكو منها', 'الحالة والمستوى', 'الإجراء القانوني'].map(h => (
                    <th key={h} className="px-4 py-3 font-black text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {violations.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold">{v.employeeName}</td>
                    <td className="px-4 py-3 text-slate-600">{v.violationType}</td>
                    <td className="px-4 py-3 text-slate-400">{v.violationDate}</td>
                    <td className="px-4 py-3 text-slate-500">{v.reportedBy}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{v.details}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                        v.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {v.severity} - {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 py-1 px-3 text-[10px]" onClick={() => handleEscalateViolation(v)}>
                        تصعيد عقوبة جزائية
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6">
          {/* Advanced Search & Filtering Controls */}
          <Card className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-1 md:col-span-2">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم الموظف أو مقتضى السجل..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none text-right"
                />
              </div>

              <div>
                <Select
                  value={filterActionStatus}
                  onChange={e => setFilterActionStatus(e.target.value)}
                  options={[
                    { value: '', label: 'كافة الحالات الوظيفية' },
                    ...disciplinaryActionStatusOptions
                  ]}
                  containerClassName="mb-0"
                />
              </div>

              <div>
                <Select
                  value={filterViolationType}
                  onChange={e => setFilterViolationType(e.target.value)}
                  options={[
                    { value: '', label: 'كافة التصنيفات القانونية' },
                    ...violationTypeKuwaitOptions
                  ]}
                  containerClassName="mb-0"
                />
              </div>
            </div>
          </Card>

          {/* Cases Grid Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table or list representation */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <h2 className="text-sm font-black text-slate-800">القرارات والمسؤوليات التأديبية المنظورة ({filteredActions.length})</h2>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full text-right">
                  <thead className="bg-slate-50">
                    <tr className="border-b">
                      {['الموظف المحكوم بحقه', 'تصنيف وجرم الاتهام', 'ملخص الواقعة والقرار المكتوب', 'الحكم الإداري المتخذ', 'التحقيق المالي للموارد', 'إجراءات'].map(h => (
                        <th key={h} className="px-4 py-3 font-bold text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredActions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">لا توجد قرارات مطابقة لخيارات الفرز الحالية.</td>
                      </tr>
                    ) : (
                      filteredActions.map(act => (
                        <tr
                          key={act.id}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedCaseId === act.id ? 'bg-slate-50/80 font-semibold' : ''}`}
                          onClick={() => setSelectedCaseId(act.id)}
                        >
                          <td className="px-4 py-4 font-black text-slate-900">
                            {act.employeeName}
                            <p className="text-[10px] text-slate-400 mt-0.5">كود: {act.employeeId}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{act.violationType}</td>
                          <td className="px-4 py-4 max-w-xs truncate text-slate-500">{act.violationDetails}</td>
                          <td className="px-4 py-4 font-bold text-rose-700 bg-rose-50/50">{act.actionTaken || 'بانتظار التقرير'}</td>
                          <td className="px-4 py-4 text-slate-400">{act.linkedInvestigationId || 'لا يوجد ملف'}</td>
                          <td className="px-4 py-4 space-x-1 space-x-reverse" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" className="p-1 hover:bg-slate-100" onClick={() => setPrintingAction(act)}>
                              <PrinterIcon className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button variant="ghost" className="p-1 hover:bg-slate-100 text-amber-600" onClick={() => handleOpenForm(act)}>
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className="p-1 hover:bg-slate-100 text-indigo-600" onClick={() => handleDuplicateAction(act)}>
                              <PlusCircleIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className="p-1 hover:bg-slate-100 text-rose-600" onClick={() => handleDeleteAction(act.id)}>
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Case File Detailed Profile Sidebar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedCaseObj ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-sm font-black text-slate-900">ملف القضية التأديبية المتكامل</h3>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                      VERDICT-{selectedCaseObj.id.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold">الموظف المعني:</span>
                      <span className="text-xs font-black text-slate-900">{selectedCaseObj.employeeName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold">تاريخ المخالفة:</span>
                      <span className="text-xs font-bold text-slate-700">{selectedCaseObj.violationDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold">الرأي والتصنيف:</span>
                      <span className="text-xs font-bold text-slate-700">{selectedCaseObj.violationType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold">العقوبة النافذة:</span>
                      <span className="text-xs font-black text-rose-700">{selectedCaseObj.actionTaken || 'لم تقرر بعد'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">حالة المستند:</span>
                      <span className="font-bold underline text-slate-800">{selectedCaseObj.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">تفاصيل الحادث والمخالفة المثبتة</h4>
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {selectedCaseObj.violationDetails}
                    </p>
                  </div>

                  {selectedCaseObj.investigation && (
                    <div className="space-y-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                      <h4 className="text-[10px] font-black text-indigo-700 flex items-center gap-1">
                        <ScaleIcon className="w-3.5 h-3.5" />
                        <span>منطوق ومحضر التحقيق الإداري</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">رئيس التحقيق: {selectedCaseObj.investigation.investigator}</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">{selectedCaseObj.investigation.investigationSummary}</p>
                    </div>
                  )}

                  {/* Case Progress Timeline Visualizer */}
                  <div className="space-y-4 pt-2 border-t border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ وسجل تتبع المحاكمة</h4>
                    <div className="space-y-3.5 relative pr-4 border-r-2 border-slate-200">
                      <div className="relative">
                        <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white" />
                        <p className="text-xs font-black text-slate-800">صياغة وقيد البلاغ الأولي</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">البوابة الإدارية بتاريخ {selectedCaseObj.reportDate}</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-500 border-2 border-white" />
                        <p className="text-xs font-black text-slate-800">إحالة الملف وجلسات الاستماع</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">من الشؤون القانونية وسماع أقوال الأطراف</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                        <p className="text-xs font-black text-slate-800">اعتماد القرار ورسمية العقوبة</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">نفاذ الجزاء بملف شؤون الموظفين عمالياً</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 italic text-xs">
                  يرجى النقر فوق أي سطر من سجل العقوبات بالجدول الأيمن لمظاهرة وإظهار ملف التحقيق المتكامل والجدول الزمني التأديبي للموظف.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appeals' && (
        <div className="space-y-6">
          <Card className="bg-white" title="رصد وإدارة تظلمات الموظفين والالتماسات القانونية" icon={<ScaleIcon className="w-5 h-5 text-indigo-600" />}>
            <p className="text-xs text-slate-500 font-bold mb-4">
              يحق للموظفين توجيه تظلمات رسمية من الجزاءات المالية المباشرة والإنذارات خلال 15 يوماً من إبلاغهم كتابياً بصدور القرار وذلك للرجوع للإدارة العليا.
            </p>
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full text-right">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {['الموظف المتظلم', 'القضية المرجعية', 'تاريخ القضية والتظلم', 'أسباب عدم قبول الجزاء والطلب', 'الحالة الحالية', 'تعليق الإدارة القانونية العليا', 'معالجة'].map(h => (
                      <th key={h} className="px-4 py-3 font-black text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appeals.map(ap => (
                    <tr key={ap.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-black">{ap.employeeName}</td>
                      <td className="px-4 py-4 font-mono text-indigo-600 font-bold">{ap.caseNumber}</td>
                      <td className="px-4 py-4 text-slate-400">{ap.appealDate}</td>
                      <td className="px-4 py-4 max-w-xs">{ap.reason}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${
                          ap.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          ap.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ap.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500 max-w-xs italic">{ap.comments}</td>
                      <td className="px-4 py-4 space-x-1 space-x-reverse">
                        <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 py-0.5 px-2 text-[10px]" onClick={() => handleUpdateAppealStatus(ap.id, 'Approved')}>
                          قبول التظلم وإلغاء العقوبة
                        </Button>
                        <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 py-0.5 px-2 text-[10px]" onClick={() => handleUpdateAppealStatus(ap.id, 'Rejected')}>
                          رفض وتأييد الجزاء
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card className="bg-white" title="فهرس النماذج الرسمية" icon={<DocumentTextIcon className="w-5 h-5 text-indigo-600" />}>
              <p className="text-xs text-slate-400 font-bold mb-4">اختر مسودة النموذج القانوني لتفريده وتعديله وتحضير المظهر النهائي للطباعة:</p>
              <div className="space-y-2">
                {[
                  { id: 'warning_1', title: 'إنذار كتابي رسمي لتكرار تقصير' },
                  { id: 'deduction_1', title: 'قرار خصم تأديبي بالأجر الموحد' },
                  { id: 'suspension_1', title: 'قرار وقف احترازي مبرر' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTemplateId(item.id)}
                    className={`w-full text-right text-xs px-3 py-2.5 rounded-lg border font-bold transition-all ${
                      selectedTemplateId === item.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-white" title="محرر التفاصيل اليدوي للخطاب">
              <textarea
                value={customEditableTemplateBody}
                onChange={e => setCustomEditableTemplateBody(e.target.value)}
                rows={12}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-slate-900 outline-none leading-relaxed text-right font-mono"
              />
              <p className="text-[10px] text-slate-400 font-bold mt-2">
                يمكنك الكتابة والتعديل مباشرة في نافذة الصندوق أعلاه وسينعكس النص في قالب مظهر الطباعة الرسمي تلقائيًا.
              </p>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div id="adala-official-printhead" className="p-8 bg-white border border-slate-300 rounded-xl shadow-xs text-slate-800 leading-relaxed font-sans relative">
              <style>{`
                @media print {
                  body { background: white !important; font-size: 11pt !important; }
                  #adala-official-printhead { border: none !important; padding: 0 !important; box-shadow: none !important; }
                  .no-print-section { display: none !important; }
                }
              `}</style>
              
              {/* Official Custom Header */}
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
                <div className="text-right">
                  <h2 className="text-sm font-black text-slate-900">{OFFICE_NAME}</h2>
                  <p className="text-[10px] text-slate-500 font-black">إدارة الموارد الإدارية والشؤون القانونية</p>
                  <p className="text-[10px] text-slate-400">وحدة ضبط وموازنة الجزاءات العمالية</p>
                </div>
                <div className="text-center font-mono">
                  <div className="w-12 h-12 border border-slate-800 mx-auto flex items-center justify-center text-[8px] font-bold p-1 leading-none">
                    ADALA OFFICIAL SEAL
                  </div>
                  <p className="text-[8px] mt-1 text-slate-400">QR-CODE VERIFIED</p>
                </div>
                <div className="text-left font-mono text-[9px] text-slate-500">
                  <p>تاريخ الصدور: {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>المرجع: CO-DISC-2026</p>
                  <p>الحالة: نسخة سارية الصدور</p>
                </div>
              </div>

              {/* Editable Body Document Area */}
              <div className="whitespace-pre-line text-xs leading-relaxed text-slate-800 min-h-96">
                {customEditableTemplateBody}
              </div>

              {/* Formal Stamps and Signatures section */}
              <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-slate-200 text-center text-[10px] font-bold text-slate-600">
                <div>
                  <p className="underline mb-12">الطرف والجهة المصدرة للقرار (الشؤون الإدارية للقانون)</p>
                  <p>مدير الموارد البشرية والامتثال العمالي للمكتب</p>
                  <p className="text-[9px] text-slate-300">............................................</p>
                </div>
                <div>
                  <p className="underline mb-12">مستلم الإنذار أو إقرار إثبات الواقعة</p>
                  <p>توقيع الطرف المعني بالاستلام بالعلم والاطلاع</p>
                  <p className="text-[9px] text-slate-300">............................................</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-8 border-t pt-4 no-print-section">
                <Button variant="ghost" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4 ml-1" />}>
                  طباعة فورية للمستند الرسمي
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disciplinary actions generation and editing modal form */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="تسجيل وصياغة العقوبات والقرارات" size="xl">
        <form onSubmit={handleFormSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-4 custom-scrollbar text-right">
          
          {/* Automated active investigation link picker */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <h3 className="text-xs font-black text-indigo-900 mb-1 flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-indigo-600" />
              <span>استيراد تلقائي من محاضر جلسات التحقيق الإداري المتكاملة</span>
            </h3>
            <p className="text-[10px] text-indigo-700 font-bold mb-3">
              لتفادي تكرار البيانات، اختر أحد الملفات الفعالة لتحجيم وحقن تفاصيل الموظف ومذكرة الرأي تلقائيًا بالنموذج.
            </p>
            <Select
              label="اختر رقم التحقيق المفتوح"
              value={selectedImportInvId}
              onChange={e => handleImportInvestigation(e.target.value)}
              options={[
                { value: '', label: 'بدء مستند فارغ بالكامل دون استيراد' },
                ...activeMockInvestigations.map(i => ({ value: i.id, label: `${i.id} - الموظف: ${i.employeeName} (${i.violationType})` }))
              ]}
              containerClassName="mb-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card title="بيانات الموظف والواقعة" icon={<UsersIcon className="w-4.5 h-4.5 text-slate-600" />}>
                <div className="space-y-3 text-xs">
                  <Select
                    label="الموظف المعني بالجزاء"
                    value={formEmployeeId}
                    onChange={e => setFormEmployeeId(e.target.value)}
                    options={mockEmployees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId}) - الراتب: ${e.basicSalary} د.ك` }))}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="تاريخ وقوع الحادثة"
                      type="date"
                      value={formViolationDate}
                      onChange={e => setFormViolationDate(e.target.value)}
                      required
                    />
                    <Input
                      label="تاريخ قيد البلاغ"
                      type="date"
                      value={formReportDate}
                      onChange={e => setFormReportDate(e.target.value)}
                      required
                    />
                  </div>

                  <Select
                    label="نوع وتوصيف المخالفة"
                    value={formViolationType}
                    onChange={e => setFormViolationType(e.target.value as any)}
                    options={violationTypeKuwaitOptions}
                    required
                  />

                  <Input
                    label="جهة وتفاصيل محرك الشكوى"
                    value={formReportedBy}
                    onChange={e => setFormReportedBy(e.target.value)}
                    placeholder="رئيس القسم المباشر / سجل البصمة الإضافي"
                  />

                  <TextArea
                    label="التفاصيل العينية المنسوبة وسرد السلوك"
                    value={formViolationDetails}
                    onChange={e => setFormViolationDetails(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </Card>

              <Card title="العقوبة والمنطوق المتخذ" icon={<GavelIcon className="w-4.5 h-4.5 text-rose-600" />}>
                <div className="space-y-3 text-xs">
                  <Select
                    label="الجزاء التأديبي النهائي المعمول به"
                    value={formPenaltyCode}
                    onChange={e => setFormPenaltyCode(e.target.value as any)}
                    options={disciplinaryPenaltyKuwaitOptions}
                    required
                  />

                  <Input
                    label="تاريخ سريان ونفاذ العقوبة"
                    type="date"
                    value={formEffectiveDate}
                    onChange={e => setFormEffectiveDate(e.target.value)}
                  />

                  {/* Multi-user automated salary calculations */}
                  {liveFinancialDeduction && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-[10px] text-amber-900 font-extrabold flex items-center gap-1 mb-1">
                        <ScaleIcon className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>محاكاة مالية الكترونية فورية لPayroll ورواتب المنشأة:</span>
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed font-bold">
                        الامتثال للمادة 35: خصم {liveFinancialDeduction.days} أيام من أصل الراتب {liveFinancialDeduction.basicSalary} د.ك يعادل قيمة مالية مقتطعة وقدرها 
                        <span className="text-rose-700 font-black px-1 text-sm underline">{liveFinancialDeduction.valueKwd} دينار كويتي</span> شهرياً.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {/* Intelligent Automatic Recommendation and Legal Reference Advisor */}
              <Card className="bg-slate-50 border-indigo-100 border text-xs" title="مرشد التوجيه الآلي والتكييف كويتياً" icon={<ClockIcon className="w-4.5 h-4.5 text-indigo-600" />}>
                <div className="space-y-3 py-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>تكرار العقوبات بملف الموظف:</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-black">{priorViolationsCount} واقعة تأديبية سابقة</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-2">
                    <p className="text-[10px] text-slate-500 font-black">العقوبة الموصى بها عملاً باللائحة والتدرج:</p>
                    <p className="font-extrabold text-indigo-700 text-xs">{autoLawRecommendation.penalty}</p>
                    <p className="text-[9px] text-slate-400 font-bold italic">السند المرجعي: {autoLawRecommendation.articles}</p>
                  </div>

                  <div className="p-2.5 bg-indigo-50/50 rounded-lg text-slate-600 text-[11px] leading-relaxed">
                    <p className="font-bold mb-1 text-slate-700">التوصية التحذيرية للذكاء:</p>
                    <p>{autoLawRecommendation.advice}</p>
                  </div>

                  {autoLawRecommendation.limitExplanation && (
                    <div className="p-2 bg-red-50 text-red-900 rounded border border-red-100 text-[10px] leading-normal font-bold">
                      {autoLawRecommendation.limitExplanation}
                    </div>
                  )}
                </div>
              </Card>

              <Card title="ملخص التحقيق الإداري ومحضر اللجنة">
                <div className="space-y-3 text-xs">
                  <Input
                    label="رقم ملف التحقيق المدمج"
                    value={formLinkedInv}
                    onChange={e => setFormLinkedInv(e.target.value)}
                    placeholder="INV-2024-XXX"
                  />

                  <Input
                    label="رئيس هيئة التحقيق المباشر"
                    value={formInvestigator}
                    onChange={e => setFormInvestigator(e.target.value)}
                    placeholder="أ. مستشار قانوني الشؤون"
                  />

                  <TextArea
                    label="ملخص وتفاصيل الرأي القانوني ومحضر الإفادات والشهود"
                    value={formInvSummary}
                    onChange={e => setFormInvSummary(e.target.value)}
                    rows={4}
                    placeholder="بيان مدى ثبوت التهمة في روع اللجنة ونتائج أقوال الشهود."
                  />

                  <Select
                    label="حالة القضية والقرار التأديبي الإجمالية"
                    value={formActionStatus}
                    onChange={e => setFormActionStatus(e.target.value as any)}
                    options={disciplinaryActionStatusOptions}
                    required
                  />
                </div>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white py-2 z-10 no-print-section">
            <Button type="button" variant="ghost" className="text-xs text-slate-600 font-bold" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
            <Button type="submit" variant="primary" className="px-8 text-xs font-black">إصدار وترصيد القرار التأديبي</Button>
          </div>
        </form>
      </Modal>

      {/* New Appeal Registration Modal Component */}
      <Modal isOpen={isAppealModalOpen} onClose={() => setIsAppealModalOpen(false)} title="تسجيل شكوى تظلم وعقد جلسة استئناف" size="md">
        <form onSubmit={handleRegisterAppeal} className="space-y-4 p-4 text-right text-xs">
          <p className="text-[11px] text-slate-500 font-bold">يرجى اختيار القرار المتظلم منه وكتابة الدفوع والشهادات المطلوبة لفتح السجل الاستئنافي.</p>
          
          <Select
            label="اختر ملف القرار التأديبي"
            value={newAppealData.caseId}
            onChange={e => setNewAppealData(prev => ({ ...prev, caseId: e.target.value }))}
            options={[
              { value: '', label: 'الرجاء الاختيار من القائمة' },
              ...actions.map(a => ({ value: a.id, label: `قرار الموظف: ${a.employeeName} (${a.actionTaken})` }))
            ]}
            required
          />

          <TextArea
            label="شرح الدفوع والأعذار الرسمية المعارضة للجزاء وصحة الطلب"
            value={newAppealData.reason}
            onChange={e => setNewAppealData(prev => ({ ...prev, reason: e.target.value }))}
            rows={5}
            placeholder="مثال: يرجى إلغاء عقوبة الخصم يومين نظراً لتقديم التقرير المرضي المعتمد أو وجود تكليف رسمي خارج المكتب."
            required
          />

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAppealModalOpen(false)}>إلغاء الإجراء</Button>
            <Button type="submit" variant="primary">تقديم التظلم للمراجعة</Button>
          </div>
        </form>
      </Modal>

      {/* Finalized printable decree decision popover */}
      <Modal isOpen={!!printingAction} onClose={() => setPrintingAction(null)} title="تقرير قرار جزائي تأديبي رسمي" size="lg">
        {printingAction && (
          <div className="space-y-6 p-4 text-right">
            <div id="decision-printable-area" className="p-8 bg-white border border-slate-300 rounded-xl max-h-[70vh] overflow-y-auto custom-scrollbar leading-relaxed text-xs text-slate-800">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black">{OFFICE_NAME}</h3>
                  <p className="text-[10px] text-slate-600 font-bold">وحدة الامتثال والشؤون العمالية - الإدارة الإنسانية</p>
                </div>
                <div className="text-left font-mono text-[9px] text-slate-400">
                  <p>رقم المستند: VERDICT-{printingAction.id.toUpperCase()}</p>
                  <p>تاريخ النشر: {new Date().toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-base font-black text-slate-900 underline underline-offset-4 decoration-rose-600">قرار جزائي تأديبي رسمي نافذ</h2>
                <p className="text-[10px] text-slate-400 mt-1">قرار إداري داخلي وموثق بموجب مواد قانون العمل الكويتي رقم 6 لسنة 2010</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-4 mb-6">
                <p>الموظف المعني: <strong>{printingAction.employeeName}</strong></p>
                <p>تاريخ الفرز: <strong>{printingAction.reportDate}</strong></p>
                <p>نوع المخالفة: <strong>{printingAction.violationType}</strong></p>
                <p>رقم المحضر المرتبط: <strong>{printingAction.linkedInvestigationId || 'لا يوجد'}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold underline text-slate-900 mb-1">أولاً: تفريغ الوقائع المنسوبة والمثبتة بالأقوال:</h4>
                  <p className="text-slate-600 pl-2 leading-relaxed">{printingAction.violationDetails}</p>
                </div>

                {printingAction.investigation && (
                  <div>
                    <h4 className="font-bold underline text-slate-900 mb-1">ثانياً: تكييف لجنة التحقيق والتعليق الإداري:</h4>
                    <p className="text-slate-600 pl-2 text-[11px] leading-relaxed italic">{printingAction.investigation.investigationSummary}</p>
                  </div>
                )}

                <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-300 rounded-xl text-center my-6">
                  <p className="text-[10px] uppercase font-black tracking-wider text-rose-800 mb-1">وبموجب اللائحة التنظيمية المكملة فقد تـقـرر نـفـاذ عقـوبـة</p>
                  <p className="text-xl font-black text-rose-950 underline underline-offset-4">
                    {printingAction.actionTaken || 'عقوبة كتابية بملف الفرز'}
                  </p>
                  {printingAction.actionEffectiveDate && (
                    <p className="text-[10px] text-slate-500 font-bold mt-2">تسري الآثار القانونية من تاريخ: {printingAction.actionEffectiveDate}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12 text-center text-[10px] border-t pt-4">
                  <div>
                    <p className="underline mb-12">توقيع المستلم بما يفيد العلم الوظيفي</p>
                    <p>الموظف الصادر بحقه القرار</p>
                  </div>
                  <div>
                    <p className="underline mb-12">اعتماد مستشار الشؤون القانونية</p>
                    <p>خاتم وحدة الامتثال والإدارة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="ghost" onClick={() => setPrintingAction(null)}>حفظ المسودة وإغلاق</Button>
              <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4" />}>طباعة القرار التنفيذي</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DisciplinaryActionsPage;
