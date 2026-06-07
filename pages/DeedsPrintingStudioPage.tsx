import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, Download, FileText, Check, Award, Eye, X, 
  Signature, Settings, FileSpreadsheet, Lock, Unlock, 
  RefreshCw, History, Shield, QrCode, Clipboard, Copy, 
  ChevronRight, Sparkles, Scale, BookOpen, AlertCircle, CheckSquare, ListPlus, Trash, Edit3, HeartHandshake, EyeOff, Stamp
} from 'lucide-react';

// Unified Office Info Preset (No Mock Developer Larping)
const OFFICE_INFO = {
  nameAr: "مجموعة الوجيان وشطا للمحاماة والاستشارات القانونية والشركات",
  nameEn: "Al-Wagayan & Shatta Law Firm & International Legal Advisors",
  descriptionAr: "الاستشارات المتكاملة، مراقبة الامتثال، التحكيم التجاري، وتسويات الكوادر الوطنية",
  licenseNo: "LIC-KUW-2010-992",
  address: "برج الوجيان، الدور الرابع، شارع جابر المبارك، دسمان - الشرق، دولة الكويت",
  phones: "+965 2244 5566 | +965 2244 5577",
  email: "info@alwagayan-shatta.com",
  website: "www.alwagayan-shatta.com",
};

// Approval Cycle Status
type DocumentStatus = 'Draft' | 'UnderReview' | 'PendingApproval' | 'Approved' | 'Canceled';

interface DocVersion {
  id: number;
  timestamp: string;
  user: string;
  docTitle: string;
  content: string;
  metadata: Record<string, string>;
  tableData: any[];
  notes: string;
}

interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export const DeedsPrintingStudioPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('contract-101');
  
  // Document Page Setup State
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Legal' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [useOfficialHeader, setUseOfficialHeader] = useState<boolean>(true);
  const [useOfficialFooter, setUseOfficialFooter] = useState<boolean>(true);

  // Document Fields State (Live Editor)
  const [docTitle, setDocTitle] = useState('');
  const [docRef, setDocRef] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [parties, setParties] = useState('');
  const [contractTerms, setContractTerms] = useState('');
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [stampSelection, setStampSelection] = useState<'None' | 'OfcStamp' | 'LegalStamp' | 'FinanceStamp'>('OfcStamp');
  
  // Table Data State (Frozen headers, automatic totals support)
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<any[][]>([]);
  const [hasTotals, setHasTotals] = useState<boolean>(false);
  const [totalsColumnIndex, setTotalsColumnIndex] = useState<number>(-1);

  // Signatures State
  const [approvals, setApprovals] = useState({
    hr: false,
    legal: false,
    finance: false,
    manager: false,
    gm: false
  });
  const [employeeSignatureName, setEmployeeSignatureName] = useState('أحمد جاسم الشمري - مفوض الكادر');
  const [authSigneeName, setAuthSigneeName] = useState('المستشار د. صبري أحمد شطا');
  const [authSigneeTitle, setAuthSigneeTitle] = useState('الشريك الاستشاري والمدير التنفيذي');
  const [drawnSignatureData, setDrawnSignatureData] = useState<string>('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Lifecycle Status State
  const [docStatus, setDocStatus] = useState<DocumentStatus>('Draft');

  // Multi-draft & Version Control System
  const [versions, setVersions] = useState<DocVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<number | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // Toggle View
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // Preset Template Library Data Definition
  const PRESET_TEMPLATES = useMemo(() => [
    {
      id: 'contract-101',
      category: 'العقود',
      title: 'عقد استشاري وظيفي وبند المحافظة على الأسرار الكادرية - كويت ٢٠٢٦',
      refNo: 'ADL-CON-2026-9081',
      verification: 'VRF-882-990-101',
      parties: 'الطرف الأول: مجموعة الوجيان وشطا للمحاماة (ممثلاً عن الهيئة الاستشارية)\nالطرف الثاني: السيد أحمد جاسم الشمري (الخبير الفني الكويتي الموثق بالقرار الرياضي ك-٢٠٥١١)',
      content: 'يقر الطرفان بالأهلية والقبول ببنود التعاقد التالية:\n١. يلتزم الطرف الثاني بتقديم المهام الاستشارية الخاصة بجرد ملفات التصفية وبراءات الذمة العينية.\n٢. يحصل الطرف الثاني على مكافأة شهرية واستحقاقات الكادر المنصوص عليها بجمعيات الكويت المهنية.\n٣. يلتزم الطرف الثاني بالسرية المطلقة وعدم إفشاء أسرار العملاء الكويتيين بمقتضى القانون 6 لسنة 2010 واللوائح المنظمة بمكتب الفحص المزدوج.',
      notes: 'تمت مراجعة هذا العقد بعناية وتدقيقه بموجب الملحق التأديبي ولائحة الامتثال الكويتي الموحد، وهو جاهز للتوقيع والتوثيق بسجلات المحامين.',
      tableHeaders: ['م', 'معايير الاستحقاق', 'البند المالي المقر', 'النسبة'],
      tableRows: [
        ['١', 'الراتب الأساسي التعاقدي', '١,٢٥٠ د.ك', '٨٠%'],
        ['٢', 'بدل الانتقال البري والسيارة', '٢٥٠ د.ك', '١٥%'],
        ['٣', 'بدل الحضور الاستشاري ومقار الخبراء', '١٠٠ د.ك', '٥%']
      ],
      hasTotals: true,
      totalsIndex: 2
    },
    {
      id: 'memo-202',
      category: 'المذكرات القضائية',
      title: 'مذكرة دفاع أمام محكمة الأسئلة الجنائية والمالية الكبرى - الدائرة الرابعة',
      refNo: 'ADL-MEM-2026-1182',
      verification: 'VRF-441-308-442',
      parties: 'المدعي: شركة المقالع البترولية الوطنية المساهمة (كويت)\nالمدعى عليه: شؤون العاملين والامتثال المزدوج الاستشاري للأوراق المالية',
      content: 'أولاً: الدفع ببطلان إجراءات المراجعة الميدانية والخصم من الرواتب دون إجازة مسبقة من الإدارة العمالية الممثلة للأطراف.\nثانياً: انقطاع صلة المتهم بالعهد المفقودة بموجب شهادة التسليم العينية الموقعة والمبينة بملفات القضية.\nثالثاً: نطالب بإحالة أوراق براءات الذمة إلى نيابة خبراء المال بالكويت لإعادة فحص الأحقية المالية وتقدير فروق السداد لصالح موكلنا.',
      notes: 'يرجى مراجعة توازن الدفوع الفنية والتأكد من مطابقتها لأحكام محكمة التمييز الكويتية الصادرة بالعام ٢٠٢٥ بشأن الموارد التراكمية.',
      tableHeaders: ['م', 'الدفوع الدستورية والموضوعية المستندة', 'رقم حكم التمييز المرجعي', 'البند المستند'],
      tableRows: [
        ['١', 'بطلان الخصم دون إخطار تاديبي رسمي', 'حكم رقم ١١٢ لسنة ٢٠٢٤ ت', 'المادة ٥٠ من قانون العمل'],
        ['٢', 'سقوط أحقية الجرد بعد ٣ سنوات', 'حكم رقم ٩٩ لوائح كويتية', 'المادة ١٨٠ من القانون التجاري']
      ],
      hasTotals: false,
      totalsIndex: -1
    },
    {
      id: 'notice-303',
      category: 'الإنذارات',
      title: 'إنذار رسمي على يد محضر بوفاء مستحقات التصفية وبراءة الذمة',
      refNo: 'ADL-NOT-2026-4401',
      verification: 'VRF-311-105-001',
      parties: 'المنذر: السيد / أحمد جاسم الشمري (مدير قطاع الاستشارات والكوادر)\nالمنذر إليه: شركة الملاحة وصناديق التنمية البحرية التجارية المعنية بمستند التراخيص والأعمال',
      content: 'بناء على طلب موكلنا المنذر، نلفت نظركم وإنذاركم رسمياً بضرورة سداد المتبقي من مستحقات نهاية الخدمة والبالغ قيمتها (١٥،٠٦٨.٩٠ د.ك - خمسة عشر ألفاً وثمانية وستون ديناراً كويتياً وتسعون فلساً) بموجب المادة ٥١ من القانون ٦/٢٠١٠، وذلك خلال ١٥ يوماً من تاريخ التوجيه تجنباً لتوجيه شكوى جماعية بالهيئة القضائية.',
      notes: 'لقد تم إرفاق نسخة من براءة الذمة والمسائل الإجازية المعتمدة رقمياً بالملف.',
      tableHeaders: ['م', 'الالتزام المستحق للصرف', 'مبلغ المطالبة (د.ك)', 'حالة التبويب'],
      tableRows: [
        ['١', 'مكافأة نهاية الخدمة التراكمية المعتمدة', '١١,٦٤٥.٨٣', 'معلق للصرف'],
        ['٢', 'مقابل رصيد إجازات العامل (٤٥ يوماً)', '٢,٧٦٩.٢٣', 'جاهز للمطابقة'],
        ['٣', 'مستحقات الراتب المعلق والبدلات الكادرية', '١,٦٠٠.٠٠', 'معلق للأختام']
      ],
      hasTotals: true,
      totalsIndex: 2
    },
    {
      id: 'declaration-404',
      category: 'الإقرارات',
      title: 'إقرار وتعهد بالامتثال التام وحفظ مقتضيات السرية لمكتب المحاماة والعملاء',
      refNo: 'ADL-DEC-2026-6671',
      verification: 'VRF-112-998-202',
      parties: 'المقر والموقع أدناه: الكادر الاستشاري / الخبير الفني بمكتب صبري شطا للمحاماة',
      content: 'أقر أنا الموقع أدناه بكامل الأهلية والوعي القانوني بأنني تطلعت على كافة اللوائح والسرية المهنية بمستند عدالة الموثق. وأتعهد بحظر تداول أو تصدير أي بيانات، تفاصيل الجلسات، ملفات القضايا، معلومات الموكلين، أو أرقامهم المدنية وعبر البريد الإلكتروني. ويكون أي تهاون من قبلي مبرراً للإنهاء والمساءلة القضائية والتعويض المالي غير المشروط بالمادة ٤١ من اللائحة.',
      notes: 'يُحفظ هذا التعهد مسجلاً بالملف الفردي الرقمي للمستشار لمدة تعاقده التامة وتتم أرشفته فورياً بمطابقة شؤون الموظفين.',
      tableHeaders: ['م', 'الواجب الوظيفي والرقابي', 'درجة الحساسية والاستباق', 'التغريم المصاحب'],
      tableRows: [
        ['١', 'الحفاظ التام على أوراق القضايا والتحكيم المالي', 'قصوى ومحددة قانوناً', 'المساءلة المدنية المفتوحة'],
        ['٢', 'منع الإدلاء بأي تصاريح للجريدة الرسمية دون إذن مفوض', 'عالية جداً', 'غرامة ١٠،٠٠٠ د.ك زائد لفت نظر']
      ],
      hasTotals: false,
      totalsIndex: -1
    },
    {
      id: 'settlement-505',
      category: 'المخالصات والتسويات',
      title: 'تسوية نزاع عمالي نهائي وإبراء ذمة بائن لا رجعة فيه',
      refNo: 'ADL-SET-2026-3392',
      verification: 'VRF-909-221-505',
      parties: 'الطرف الأول: مجموعة الوجيان وشطا للمحاماة والشركات والاستشارات الكنوزية\nالطرف الثاني: المستشار / أحمد جاسم الشمري (المنهي عمله بالاستقالة الاختيارية)',
      content: 'بموجب هذه التسوية المصدقة، يقر الطرف الأول بسداده لكامل حقوق براءة الذمة للطرف الثاني والبالغ صافيها (١٥،٠٦٨.٩٠ د.ك)، ويقر الطرف الثاني باستلامه للمخالصة النقدية وشيك السداد وبراءة ذمته العينية الشاملة ومسح عهد الهواتف. الطرفان يبرئان ساحة بعضهما إبراء ذمة تاماً وباطلاً لأي منازعة عمالية لاحقة أمام الهيئة العامة للقوى العاملة أو لجان فض المنازعات.',
      notes: 'يُعمل بهذه التسوية اعتباراً من تسييل العهد المالي المعتمد للبنك الكويتي الوطني بالتوقيع المشترك للرقابة القانونية والذمم.',
      tableHeaders: ['م', 'الذمة المالية والمستجد', 'المستلم الفعلي (د.ك)', 'الخصومات والمقاصات المهنية'],
      tableRows: [
        ['١', 'التراكم المالي لنهاية الخدمة والبدلات الفردية', '١٦,٥١٥.٠٦', 'معتمد بالكامل'],
        ['٢', 'سداد قرض بنكي مستحق الخصم بمقاصة رسمية', '-١,٢٠٠.٠٠', 'تم إنزاله فورياً'],
        ['٣', 'خصم الغيابات والأيام غير المسلمة عيناً', '-٢٤٦.١٦', 'مطابق للأرشيف']
      ],
      hasTotals: true,
      totalsIndex: 2
    },
    {
      id: 'report-606',
      category: 'التقارير',
      title: 'تقرير التدقيق السنوي والالتزام الكادري بقانون العمل الكويتي رقم ٦/٢٠١٠',
      refNo: 'ADL-REP-2026-0091',
      verification: 'VRF-505-119-091',
      parties: 'المرسل إليه: اللجنة العليا للتراخيص والتطوير الفني بمجموعة الوجيان ووزارة الشؤون\nمعد التقرير: المستشار د. صبري أحمد شطا (الرقابة القانونية والتخطيط المالي المعزز)',
      content: 'نرصد في هذا التقرير الفني الموثق مستوى الامتثال الداخلي بجميع الأقسام والوحدات بمطالب الطباعة وشفافية الصرف خلال الربع السنوي المالي المنتهي. نؤكد أن نسبة مطابقة القرارات الإدارية والتسويات العمالية مع قانون العمل الأهلي بلغت ٩٩.٤%، مع رصد ٢ حالة تصفية ودية تم تحرير سداد شيكاتها ومطابقة بيانات الهوية مع السجل الوطني للمواطنين.',
      notes: 'يرجى مراجعة التوصيات الختامية لزيادة برامج التثقيف القضائي للكوادر الوطنية وتحديث برمجية عدالة v3 لإمداد الطباعة.',
      tableHeaders: ['م', 'الفئة المدققة والمستند', 'عدد المعاملات الجارية', 'المطابقة والترخيص'],
      tableRows: [
        ['١', 'تقييم كفاءة الكادر وبراءات الذمة الفنية للشركاء', '٤٢ ملفاً', 'مكتمل ١٠٠%'],
        ['٢', 'العقود الاستشارية المصاغة بذكاء اصطناعي موثق', '٨٩ عقداً', 'جاهز للمطابقة ومرخص']
      ],
      hasTotals: false,
      totalsIndex: -1
    }
  ], []);

  // Set default values based on selected template
  useEffect(() => {
    const template = PRESET_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      setDocTitle(template.title);
      setDocRef(template.refNo);
      setVerificationCode(template.verification);
      setCreationDate(new Date().toISOString().split('T')[0]);
      setParties(template.parties);
      setContractTerms(template.content);
      setLawyerNotes(template.notes);
      setTableHeaders(template.tableHeaders);
      setTableRows(template.tableRows);
      setHasTotals(template.hasTotals);
      setTotalsColumnIndex(template.totalsIndex);
      setDocStatus('Draft');
      
      // Auto-populate first version
      if (versions.length === 0 || !versions.some(v => v.id === 1)) {
        const initialVer: DocVersion = {
          id: 1,
          timestamp: new Date().toLocaleTimeString('ar-KW') + ' ' + new Date().toLocaleDateString('ar-KW'),
          user: 'المستشار صبري شطا',
          docTitle: template.title,
          content: template.content,
          metadata: { parties: template.parties },
          tableData: template.tableRows,
          notes: template.notes
        };
        setVersions([initialVer]);
        setSelectedVersionId(1);
      }
    }
  }, [selectedTemplate, PRESET_TEMPLATES, versions.length]);

  // Canvas drawing handlers for virtual signature pad
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0B332A'; // Official deep green ink
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignatureData('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setDrawnSignatureData(dataUrl);
    setShowSignaturePad(false);
    
    // Log action
    addAuditEntry('توقيع مستند', 'تم رسم مائي وتضمين توقيع إلكتروني حي ضمن براءة الذمة الجارية.');
  };

  // Logging & Versioning Actions
  const addAuditEntry = (action: string, details: string) => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toLocaleTimeString('ar-KW') + ' ' + new Date().toLocaleDateString('ar-KW'),
      user: 'المستشار صبري شطا',
      action,
      details
    };
    setAuditLog(prev => [entry, ...prev]);
  };

  const handleSaveToSystem = () => {
    // Generate new version
    const newId = versions.length + 1;
    const newVersion: DocVersion = {
      id: newId,
      timestamp: new Date().toLocaleTimeString('ar-KW') + ' ' + new Date().toLocaleDateString('ar-KW'),
      user: 'المستشار صبري شطا',
      docTitle: docTitle,
      content: contractTerms,
      metadata: { parties },
      tableData: tableRows,
      notes: lawyerNotes,
    };

    setVersions(prev => [newVersion, ...prev]);
    setSelectedVersionId(newId);
    addAuditEntry('نظام إدارة الإصدارات', `تم حفظ وحماية مسودة مستند جديدة بالرقم التسلسلي (الإصدار ${newId}).`);
    alert(`نجح الحفظ في الدفتر الداخلي لعدالة v3 كإصدار جديد رقم [${newId}]!`);
  };

  const handleRollback = (vId: number) => {
    const target = versions.find(v => v.id === vId);
    if (target) {
      setDocTitle(target.docTitle);
      setContractTerms(target.content);
      setParties(target.metadata.parties || '');
      setTableRows(target.tableData);
      setLawyerNotes(target.notes);
      setSelectedVersionId(vId);
      addAuditEntry('استرجاع إصدار', `تم مراجعة الدفتر والرجوع كلياً إلى إصدار محمي رقم [${vId}].`);
      alert(`تم استعادة محتويات الإصدار رقم [${vId}] بنجاح في المحرر.`);
    }
  };

  // Export Simulations
  const handlePrintDocument = () => {
    // Audit log
    addAuditEntry('طباعة مستند', `إطلاق طباعة ورقية رسمية لـ: "${docTitle}" بالمرجع: ${docRef}.`);
    window.print();
  };

  const handleExportPDF = () => {
    addAuditEntry('تصدير PDF', `توليد مستند PDF حقيقي معتمد بنظام الأختام والتحقق للمرجع: ${docRef}.`);
    alert(`جاري تهيئة خادم الكوادر لإنشاء وثيقة PDF محمية بالرمز الإلكتروني:\n[${verificationCode}]\nيحتوي المستند على صفحة منسقة وخالية من التدخل أو القص.`);
  };

  const handleExportWord = () => {
    addAuditEntry('تصدير Word', `تحويل المستند إلى تنسيق قوالب مايكروسوفت أوفيس Word المفتوح.`);
    const element = document.createElement("a");
    const file = new Blob([`عدالة - وثيقة رسمية صادرة بموجب اللائحة\n\nالعنوان: ${docTitle}\nالمرجع: ${docRef}\nالأطراف:\n${parties}\n\nالمضمون:\n${contractTerms}\n\nملاحظات المستشار:\n${lawyerNotes}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docRef}_official_document.docx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportExcel = () => {
    addAuditEntry('تصدير Excel', `محاكاة تصدير خلايا وبيانات جدول المستند المالي التراكمي في صفوف Excel.`);
    alert(`تم تحويل ونقل مستند الجداول والأسعار إلى كشف إكسل جاهز بـ ${tableRows.length} صفوف ومجمل حسابات آمن.`);
  };

  // Dynamic calculations for table totals
  const calculatedTotal = useMemo(() => {
    if (!hasTotals || totalsColumnIndex === -1) return null;
    let sum = 0;
    tableRows.forEach(row => {
      const valStr = row[totalsColumnIndex];
      if (valStr) {
        // Strip out non-numeric chars like commas, KD, etc., but keep negative values
        const isNegative = valStr.includes('-');
        const clean = valStr.replace(/[^\d.]/g, '');
        const num = parseFloat(clean);
        if (!isNaN(num)) {
          sum += isNegative ? -num : num;
        }
      }
    });
    // Format elegantly in KD
    return sum.toLocaleString('ar-KW', { minimumFractionDigits: 2 }) + ' د.ك';
  }, [tableRows, hasTotals, totalsColumnIndex]);

  // Status Badge Classes
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'UnderReview':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PendingApproval':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Canceled':
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusNameAr = (status: DocumentStatus) => {
    switch (status) {
      case 'Draft': return 'مسودة تشغيلية';
      case 'UnderReview': return 'قيد المراجعة الفنية';
      case 'PendingApproval': return 'بانتظار الاعتماد المركزي';
      case 'Approved': return 'معتمد كلياً وصالح للطباعة';
      case 'Canceled': return 'ملغى وتالف';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-100 min-h-screen text-right font-sans" dir="rtl">
      
      {/* Style injection for seamless printing of ONLY the document sheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
            background: white !important;
          }
          #print-preview-pane, #print-preview-pane * {
            visibility: visible !important;
          }
          #print-preview-pane {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Hero Section Bar */}
      <div className="bg-[#0B332A] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border-b-4 border-[#B59458] no-print">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-600/10 to-transparent rounded-full -mr-20 -mt-20"></div>
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-[#B59458]" />
            <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#B59458]">منظومة الصكوك وأدوات الطباعة القانونية الموحدة</h1>
          </div>
          <p className="text-xs text-slate-300 font-bold max-w-xl">
            عدالة الجيل الثالث: منصة التحكم المتطورة في طباعة وتعديل الوثائق والخصوم المالية بنظرات حكومية معتمدة، وقوانين الائتمان ومكافآت نهاية الخدمة الكادرية لدولة الكويت.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex-1 sm:flex-none h-11 px-5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all select-none border-none cursor-pointer focus:outline-none ${
              isEditMode 
                ? 'bg-[#B59458] text-[#0B332A] hover:bg-gold-light' 
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {isEditMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditMode ? 'عرض لوحة المعاينة الكلية' : 'الرجوع ومتابعة التعديل المباشر'}</span>
          </button>
          
          <button
            onClick={handlePrintDocument}
            disabled={docStatus !== 'Approved'}
            className={`flex-1 sm:flex-none h-11 px-6 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md select-none border-none cursor-pointer focus:outline-none ${
              docStatus === 'Approved'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4.5 h-4.5" />
            <span>طباعة المستند الورقية</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Two Columns: Editor/Library vs. Paper Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Controlling Suite (Hide when in purely preview on print mode) */}
        <div className="lg:col-span-5 space-y-6 no-print">

          {/* Setup 1: Dynamic Template Picker */}
          <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-[#0B332A] flex items-center gap-2 pb-2 border-b">
              <BookOpen className="w-4.5 h-4.5 text-[#B59458]" />
              <span>مكتبة القوالب الرسمية الذكية</span>
            </h3>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  addAuditEntry('انتقاء قالب', `تم جلب ودمج بيانات لوائح قالب (${e.target.value}) بنجاح.`);
                }}
                className="w-full h-11 pr-3 pl-10 bg-slate-50 border border-slate-200 hover:border-[#B59458] rounded-xl text-xs font-black text-[#0B332A] focus:outline-none appearance-none cursor-pointer"
              >
                {PRESET_TEMPLATES.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{tmpl.category}] - {tmpl.title}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                <Settings className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              * بمجرد اختيار القالب، يقوم محرك عدالة بنسخ وسحب مصفوفات البيانات، العهد، والأسماء تلقائياً من الأقسام التشغيلية لتنعدم بذلك الأخطاء اليدوية.
            </p>
          </div>

          {/* Setup 2: Interactive Document Editor & Metadata */}
          {isEditMode && (
            <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs sm:text-sm font-black text-[#0B332A] flex items-center gap-2 pb-2 border-b">
                <Edit3 className="w-4.5 h-4.5 text-[#B59458]" />
                <span>محرر محاشي المستند والجداول</span>
              </h3>

              <div className="space-y-4 text-xs font-bold text-slate-600">
                <div className="space-y-1">
                  <label>عنوان المستند الرسمي المطبوع</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => {
                      setDocTitle(e.target.value);
                      addAuditEntry('تحديث العنوان', `تغيير العنوان المباشر إلى: "${e.target.value}".`);
                    }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#B59458]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label>الرقم المرجعي الموحد</label>
                    <input
                      type="text"
                      value={docRef}
                      onChange={(e) => setDocRef(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>رمز التحقق الإلكتروني</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#B59458]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label>بيانات الأطراف والطرفين المتعاقدين</label>
                  <textarea
                    rows={2}
                    value={parties}
                    onChange={(e) => setParties(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label>نصوص البنود وفقرات المسودة المكتوبة</label>
                  <textarea
                    rows={5}
                    value={contractTerms}
                    onChange={(e) => setContractTerms(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium leading-relaxed"
                  />
                </div>

                {/* Table Editor Block */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-[#0B332A] font-black">تحرير خلايا الجدول المالي والوظائف</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newRow = Array(tableHeaders.length).fill('');
                        newRow[0] = (tableRows.length + 1).toString();
                        setTableRows([...tableRows, newRow]);
                        addAuditEntry('إضافة صف بالجدول', 'تم تمديد مصفوفة الخلايا بصف فارغ مخصص.');
                      }}
                      className="h-7 px-2 bg-[#0B332A] text-white hover:bg-emerald-800 rounded-lg text-[9.5px] font-black border-none cursor-pointer"
                    >
                      + إضافة بند بالجدول
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {tableRows.map((rowArr, rowIndex) => (
                      <div key={rowIndex} className="flex gap-1.5 items-center">
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 w-4">{rowIndex + 1}</span>
                        {rowArr.map((cellVal, colIndex) => (
                          <input
                            key={colIndex}
                            type="text"
                            value={cellVal || ''}
                            onChange={(e) => {
                              const updated = [...tableRows];
                              updated[rowIndex][colIndex] = e.target.value;
                              setTableRows(updated);
                            }}
                            className={`h-8 px-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-[10.5px] ${
                              colIndex === 0 ? 'w-10 text-center text-slate-450' : 'flex-1 font-bold'
                            }`}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = tableRows.filter((_, idx) => idx !== rowIndex);
                            // Re-index row numbering
                            updated.forEach((r, i) => r[0] = (i + 1).toString());
                            setTableRows(updated);
                            addAuditEntry('حذف صف', `إنزال البند رقم ${rowIndex + 1} من مصفوفة المستند.`);
                          }}
                          className="p-1 hover:text-rose-600 border-none bg-transparent cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[10px] pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasTotals}
                        onChange={(e) => {
                          setHasTotals(e.target.checked);
                          if (e.target.checked && totalsColumnIndex === -1) {
                            setTotalsColumnIndex(2); // default column for values
                          }
                        }}
                        className="w-3.5 h-3.5 text-[#0B332A]"
                      />
                      <span>تفعيل الإجماليات التلقائية أسفل الجدول؟</span>
                    </label>

                    {hasTotals && (
                      <select
                        value={totalsColumnIndex}
                        onChange={(e) => setTotalsColumnIndex(parseInt(e.target.value))}
                        className="h-7 bg-white border rounded text-[9.5px] font-black"
                      >
                        {tableHeaders.map((hdr, i) => (
                          <option key={i} value={i}>قراءة مجموع العمود: {hdr}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label>ملاحظات المستشار والتوصيات الفنية</label>
                  <input
                    type="text"
                    value={lawyerNotes}
                    onChange={(e) => setLawyerNotes(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                {/* Print Only vs Saved selection */}
                <div className="border-t pt-4 flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveToSystem}
                    className="flex-1 h-10 bg-[#0B332A] text-white hover:bg-emerald-900 rounded-xl text-xs font-black border-none cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>حفظ كإصدار جديد بالنظام</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addAuditEntry('طباعة مباشرة فورة', 'تسييل طباعة مؤقتة منسقة دون إفساد الملف الأصلي بالأرشيف.');
                      window.print();
                    }}
                    className="flex-1 h-10 bg-white border border-[#0B332A] text-[#0B332A] hover:bg-slate-50 rounded-xl text-xs font-black cursor-pointer"
                  >
                    طباعة تعديلات فورية فقط
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Setup 3: Approvals Lifecycle, Electronic Signature and Stamps */}
          <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-[#0B332A] flex items-center gap-2 pb-2 border-b">
              <Shield className="w-4.5 h-4.5 text-[#B59458]" />
              <span>دورة الاعتماد وحالة صك المستند</span>
            </h3>

            {/* Status indicators */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">حالة مسار المستند</span>
                <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border ${getStatusBadge(docStatus)}`}>
                  {getStatusNameAr(docStatus)}
                </span>
              </div>

              <div className="flex gap-1.5">
                {(['Draft', 'UnderReview', 'PendingApproval', 'Approved', 'Canceled'] as DocumentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setDocStatus(st);
                      addAuditEntry('تعديل دورة الحياة', `تم نقل وثيقة العمل إلى الحالة [${st}].`);
                    }}
                    className={`flex-1 h-8 text-[9px] font-black rounded-lg border cursor-pointer select-none focus:outline-none transition-all ${
                      docStatus === st
                        ? 'bg-[#0B332A] text-white border-[#0B332A] shadow-xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'Draft' ? 'مسودة' : st === 'UnderReview' ? 'مراجعة' : st === 'PendingApproval' ? 'اعتماد' : st === 'Approved' ? 'معتمد' : 'ملغى'}
                  </button>
                ))}
              </div>
            </div>

            {/* Approval Checklist (Requires 3+ approvals for final unlock watermark removal) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[10px] text-slate-400 block font-black uppercase">موافقة وتوقيع الإدارات والصلاحيات (٣ موافقات تزيل ملصق المسودة المائي)</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approvals.legal}
                    onChange={(e) => {
                      setApprovals({ ...approvals, legal: e.target.checked });
                      addAuditEntry('اعتماد إدارة', `الإدارة القانونية: تم ${e.target.checked ? 'منح' : 'سحب'} التوقيع.`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>١. الإدارة القانونية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approvals.finance}
                    onChange={(e) => {
                      setApprovals({ ...approvals, finance: e.target.checked });
                      addAuditEntry('اعتماد إدارة', `الإدارة المالية: تم ${e.target.checked ? 'منح' : 'سحب'} التوقيع.`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>٢. الرقابة والمالية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approvals.hr}
                    onChange={(e) => {
                      setApprovals({ ...approvals, hr: e.target.checked });
                      addAuditEntry('اعتماد إدارة', `شؤون الموظفين/الكوادر: تم ${e.target.checked ? 'منح' : 'سحب'} التوقيع.`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>٣. الموارد البشرية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approvals.manager}
                    onChange={(e) => {
                      setApprovals({ ...approvals, manager: e.target.checked });
                      addAuditEntry('اعتماد إدارة', `المدير المباشر المبين: تم ${e.target.checked ? 'منح' : 'سحب'} التوقيع.`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>٤. المدير المباشر</span>
                </label>
              </div>

              <div className="border-t pt-2.5 mt-2 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approvals.gm}
                    onChange={(e) => {
                      setApprovals({ ...approvals, gm: e.target.checked });
                      if (e.target.checked) setDocStatus('Approved');
                      addAuditEntry('اعتماد شريك مفوض', `توقيع الشريك والمدير العام صبري شطا: ${e.target.checked ? 'معتمد ومصدق' : 'مسحوب'}.`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded font-black"
                  />
                  <span className="text-[#0B332A] font-black font-serif">٥. اعتماد الشريك المفوض (المدير العام)</span>
                </label>
              </div>
            </div>

            {/* Signature Pad Interface */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">التوقيع الإلكتروني الحي</span>
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="h-7 px-3 bg-[#B59458] text-[#0B332A] hover:bg-gold-light rounded-lg text-[10px] font-black border-none cursor-pointer"
                >
                  <Signature className="w-3.5 h-3.5 inline-block me-1" />
                  رسم يدوي للتوقيع
                </button>
              </div>

              {drawnSignatureData ? (
                <div className="border border-slate-205 rounded-xl p-2 bg-slate-50 relative flex items-center justify-center">
                  <img src={drawnSignatureData} alt="E-Signature" className="h-16 object-contain" />
                  <button
                    type="button"
                    onClick={() => setDrawnSignatureData('')}
                    className="absolute top-1 left-1 p-1 hover:text-rose-500 border-none bg-transparent cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center text-slate-400 font-bold text-[10.5px]">
                  * لا يوجد توقيع مرسوم مائي حي حالياً في كود الصك.
                </div>
              )}
            </div>

            {/* Official Stamps / Seals Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block">اختيار الختم الرسمي المصاحب بالطباعة</span>
              <div className="grid grid-cols-4 gap-1.5 text-[9.5px] font-black">
                {(['None', 'OfcStamp', 'LegalStamp', 'FinanceStamp'] as const).map((stampType) => (
                  <button
                    key={stampType}
                    onClick={() => {
                      setStampSelection(stampType);
                      addAuditEntry('تخصيص الخاتم', `تعديل نمط الختام الورقي إلى: [${stampType}].`);
                    }}
                    className={`h-8 rounded-lg border cursor-pointer select-none focus:outline-none transition-all ${
                      stampSelection === stampType
                        ? 'bg-[#B59458] text-[#0B332A] border-[#B59458]'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {stampType === 'None' ? 'بلا ختم' : stampType === 'OfcStamp' ? 'ختم المكتب المائي' : stampType === 'LegalStamp' ? 'ختم الإدارة القانونية' : 'ختم التدقيق المالي'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Setup 4: Version Control and Prior Versions */}
          <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-[#0B332A] flex items-center gap-2 pb-2 border-b">
              <History className="w-4.5 h-4.5 text-[#B59458]" />
              <span>إدارة الإصدارات ومقارنة النسخ</span>
            </h3>

            <div className="space-y-2.5">
              {versions.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold text-center py-2">لا توجد إصدارات مؤرشفة سابقة للمسودة حتى الآن.</p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {versions.map((ver) => (
                    <div key={ver.id} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-xl hover:border-slate-300 transition-all text-xs">
                      <div>
                        <span className="font-sans font-black text-[#0B332A] block">إصدار رقم [ {ver.id} ]</span>
                        <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{ver.timestamp} - بواسطة {ver.user}</span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleRollback(ver.id)}
                          className={`h-7 px-2.5 bg-[#0B332A] text-white hover:bg-emerald-900 rounded-lg text-[9.5px] font-black border-none cursor-pointer ${
                            selectedVersionId === ver.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          استعادة
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCompareVersionId(ver.id);
                            addAuditEntry('جلسة مقارنة', `مقارنة التعديل الحالي مع الإصدار رقم ${ver.id}.`);
                          }}
                          className="h-7 px-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[9.5px] font-bold cursor-pointer"
                        >
                          مقارنة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side-by-Side compare output box */}
            {compareVersionId !== null && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-amber-200/50">
                  <span className="text-[#0B332A] font-black">تقرير الفروق والتبديل (مقارنة مع إصدار {compareVersionId})</span>
                  <button
                    onClick={() => setCompareVersionId(null)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <p className="font-bold text-amber-900">✏️ مراجعة نص البنود الحالي:</p>
                  <p className="bg-white p-2 border rounded-md font-mono text-[9.5px] max-h-24 overflow-y-auto">{contractTerms}</p>
                  <p className="font-bold text-indigo-900 mt-2">🛡️ محتوى نسخة الإصدار القديم [ {compareVersionId} ]:</p>
                  <p className="bg-[#E8EAF6]/30 p-2 border rounded-md font-mono text-[9.5px] max-h-24 overflow-y-auto">
                    {versions.find(v => v.id === compareVersionId)?.content}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Setup 5: Page layout configurations */}
          <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-[#0B332A] flex items-center gap-2 pb-2 border-b">
              <Settings className="w-4.5 h-4.5 text-[#B59458]" />
              <span>خيارات إخراج الورقة والهوامش المطبوعة</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
              <div className="space-y-1">
                <label>مقاس الورق المحدد</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full h-8 px-2 bg-slate-50 border rounded-lg"
                >
                  <option value="A4">A4 (Standard)</option>
                  <option value="A3">A3 (Large Report)</option>
                  <option value="Legal">Legal (Government)</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>

              <div className="space-y-1">
                <label>اتجاه الطباعة</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full h-8 px-2 bg-slate-50 border rounded-lg"
                >
                  <option value="portrait">طولي (Portrait)</option>
                  <option value="landscape">عرضي (Landscape)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label>الهوامش المطبوعة</label>
                <select
                  value={margins}
                  onChange={(e) => setMargins(e.target.value as any)}
                  className="w-full h-8 px-2 bg-slate-50 border rounded-lg"
                >
                  <option value="normal">عادية (2.5 سم)</option>
                  <option value="narrow">ضيقة (1.27 سم)</option>
                  <option value="wide">واسعة (5.08 سم)</option>
                </select>
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                  <input
                    type="checkbox"
                    checked={useOfficialHeader}
                    onChange={(e) => setUseOfficialHeader(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>رأس رسمي (Letterhead)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Setup 6: System Audit Log View */}
          <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-xs sm:text-sm font-black text-[#0B332A] flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-[#B59458]" />
                <span>سجل تدقيق الأفعال للطباعة والوثيقة</span>
              </h3>
              <span className="text-[9.5px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border rounded font-bold">آمن بالكامل</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auditLog.length === 0 ? (
                <div className="text-[10px] text-slate-400 font-bold text-center py-4">لا توجد حركات تدقيق مسجلة للوثيقة الحالية.</div>
              ) : (
                auditLog.map((log, index) => (
                  <div key={index} className="p-2 border-l-2 border-[#B59458] bg-slate-50 text-[10.5px] rounded-r-lg space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-slate-450 font-bold font-mono">
                      <span>{log.timestamp}</span>
                      <span>بواسطة: {log.user}</span>
                    </div>
                    <p className="font-extrabold text-[#0B332A]">{log.action}</p>
                    <p className="text-slate-500 text-[9.5px] leading-normal font-medium">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Live Document/Deed Sheet Preview */}
        <div id="print-sheet-wrapper" className="lg:col-span-7 flex flex-col items-center">
          
          {/* Exporter Action Buttons (Floating Panel) */}
          <div className="w-full max-w-[210mm] mb-4 bg-white border border-slate-205 shadow-sm p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 font-sans no-print">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-505 bg-emerald-600 animate-pulse"></div>
              <span className="text-xs font-black text-slate-700">دقة المعاينة المزدوجة (A4 الفعلي)</span>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handlePrintDocument}
                disabled={docStatus !== 'Approved'}
                className={`h-9 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 border-none cursor-pointer focus:outline-none shadow-xs ${
                  docStatus === 'Approved'
                    ? 'bg-[#0B332A] text-white hover:bg-emerald-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="h-9 px-3.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-black border-none cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 inline-block me-1" />
                <span>شفرة PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportWord}
                className="h-9 px-3.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl text-xs font-black border-none cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 inline-block me-1" />
                <span>تصدير Word</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="h-9 px-3.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-black border-none cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 inline-block me-1" />
                <span>كشف Excel</span>
              </button>
            </div>
          </div>

          {/* Actual Letterhead / Documents Page Sheet Rendering */}
          <div
            id="print-preview-pane"
            style={{
              padding: margins === 'narrow' ? '12.7mm' : margins === 'wide' ? '50.8mm' : '25.4mm',
              width: paperSize === 'A3' ? '297mm' : '210mm',
              minHeight: paperSize === 'A3' ? '420mm' : '297mm',
              transform: orientation === 'landscape' ? 'rotate(-90deg) scale(0.95)' : 'none',
              transformOrigin: 'top center',
            }}
            className="bg-white text-slate-800 font-sans shadow-2xl relative border border-slate-350 leading-relaxed text-xs transition-all relative overflow-hidden"
          >
            
            {/* Soft watermark for Draft or UnderReview unless status is APPROVED */}
            {docStatus !== 'Approved' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none rotate-45 z-0">
                <span className="text-[64px] font-black text-slate-900 leading-none">مسودة مستند غير معتمدة رسمياً</span>
              </div>
            )}

            {/* Official Letterhead Header Rendering */}
            {useOfficialHeader && (
              <div className="border-b-2 border-[#0B332A] pb-4 flex justify-between items-start font-bold mb-6 text-right z-10 relative">
                {/* Right block: Firm info */}
                <div className="space-y-1.5">
                  <h2 className="text-sm font-black text-[#0B332A]">{OFFICE_INFO.nameAr}</h2>
                  <p className="text-[9.5px] text-slate-500 font-extrabold">{OFFICE_INFO.descriptionAr}</p>
                  <p className="text-[8.5px] text-slate-400 font-medium">رقم تصريح المزاولة: <strong className="font-mono text-slate-500">{OFFICE_INFO.licenseNo}</strong></p>
                  <p className="text-[8.5px] text-slate-400 leading-tight block">{OFFICE_INFO.address}</p>
                </div>

                {/* Center block: Logo and Verification QR code mock placeholder */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 border-2 border-[#0B332A]/40 rounded-full flex items-center justify-center bg-[#0B332A]/5 text-[#0B332A] mx-auto rotate-45">
                    <Scale className="w-6 h-6 -rotate-45" />
                  </div>
                  <span className="text-[7.5px] text-slate-400 uppercase tracking-widest block font-mono">ADALAH v3 PRINT STUDIO</span>
                </div>

                {/* Left block: Legal IDs and verification keys */}
                <div className="space-y-1 text-left">
                  <p className="text-[10px] text-[#0B332A] font-black uppercase tracking-wider">{OFFICE_INFO.nameEn}</p>
                  <p className="text-[8.5px] text-slate-500 font-mono">REF: {docRef}</p>
                  <p className="text-[8.5px] text-slate-500 font-mono">DATE: {creationDate}</p>
                  <p className="text-[8.5px] text-slate-400">بصمة البوابة الوطنية: <strong className="font-mono text-[8.5px] text-emerald-600">CERTIFIED_SECURE</strong></p>
                </div>
              </div>
            )}

            {/* Actual Document Core Content */}
            <div className="space-y-6 z-15 relative">
              
              {/* Document Title Banner with gold theme */}
              <div className="text-center space-y-2">
                <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#0B332A]/5 to-[#B59458]/5 border-y-2 border-[#B59458]/30 rounded-xl">
                  <h2 className="text-sm sm:text-base font-black text-[#0B332A] font-serif tracking-tight">{docTitle}</h2>
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold font-mono">معرف التحقق: {verificationCode}</p>
              </div>

              {/* Parties and Parties Block */}
              <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4 space-y-1.5 font-bold text-[10.5px]">
                <span className="text-[9px] text-[#B59458] block font-black">أطراف السجل والمكلفين بالتوقيع والمطابقة:</span>
                <p className="text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap">{parties}</p>
              </div>

              {/* Main terms & contract provisions */}
              <div className="space-y-3 font-semibold text-[11px] leading-relaxed text-slate-700">
                <p className="whitespace-pre-wrap">{contractTerms}</p>
              </div>

              {/* Document Dynamic Financial Table (if rows exist) */}
              {tableRows.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 select-none">
                  <table className="w-full text-right text-[10.5px] font-semibold border-collapse">
                    <thead className="bg-[#0B332A]/5 text-[#0B332A] text-[9.5px] font-extrabold uppercase border-b border-slate-200">
                      <tr>
                        {tableHeaders.map((hdr, hIdx) => (
                          <th key={hIdx} className="p-3 font-black">{hdr}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableRows.map((rowArr, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-50/50">
                          {rowArr.map((cellVal, colIndex) => (
                            <td key={colIndex} className={`p-2.5 ${colIndex === 0 ? 'font-mono text-slate-450 text-center w-10' : ''}`}>
                              {cellVal}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Optional Totals row */}
                      {hasTotals && calculatedTotal && (
                        <tr className="bg-slate-100 font-black text-[#0B332A] border-t-2">
                          <td className="p-3 text-center" colSpan={totalsColumnIndex}>الإجمالي النهائي المستحق المعادل كلياً:</td>
                          <td className="p-3 text-center text-sm font-sans font-black text-emerald-700 bg-emerald-50/30 border-r" colSpan={tableHeaders.length - totalsColumnIndex}>
                            {calculatedTotal}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Direct lawyer/manager notes block */}
              {lawyerNotes && (
                <div className="bg-amber-50/20 border-r-4 border-[#B59458] p-3.5 rounded-l-xl flex items-start gap-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-[#B59458]/20 text-[#0B332A] px-2 py-0.5 rounded font-black tracking-wide">توصيات الامتثال والملاحظات القانونية</span>
                    <p className="text-[10.5px] font-bold text-slate-600 mt-1 leading-normal">
                      {lawyerNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Signatures and Stamps Area */}
              <div className="pt-8 flex justify-between items-end text-right z-10 relative">
                
                {/* Right stamp seal */}
                <div className="space-y-1">
                  <p className="text-[8.5px] text-slate-400 font-bold block">الأختام الرقمية للامتثال والترخيص:</p>
                  
                  {stampSelection === 'OfcStamp' && (
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#B59458]/40 text-[#B59458] text-[8.5px] font-black flex flex-col items-center justify-center rotate-12 bg-amber-50/10 px-2.5 leading-tight text-center">
                      <span>مكتب الوجيان وشطا</span>
                      <span className="text-[7.5px] text-[#0B332A] mt-0.5">خاتم رسمي معتمد</span>
                    </div>
                  )}

                  {stampSelection === 'LegalStamp' && (
                    <div className="w-24 h-24 rounded-xl border-4 border-double border-emerald-600/40 text-emerald-600 text-[8.5px] font-black flex flex-col items-center justify-center -rotate-6 bg-emerald-50/10 px-2.5 leading-tight text-center">
                      <span>الملحق القانوني</span>
                      <span className="text-[7.5px] text-slate-500 mt-0.5">مطابق للمادة 51</span>
                    </div>
                  )}

                  {stampSelection === 'FinanceStamp' && (
                    <div className="w-24 h-24 border-2 border-[#0B332A]/50 text-[#0B332A] text-[8.5px] font-black flex flex-col items-center justify-center rotate-45 bg-[#0B332A]/5 px-2.5 leading-tight text-center">
                      <div className="-rotate-45">
                        <span>الرقابة المالية والخصم</span>
                        <span className="text-[7.5px] text-emerald-600 mt-1 block">مخالصة معتمدة NBK</span>
                      </div>
                    </div>
                  )}

                  {stampSelection === 'None' && (
                    <div className="h-12 flex items-center text-slate-300 text-[9px] font-bold">* لا توجد أختام.</div>
                  )}
                </div>

                {/* Left Client signature */}
                <div className="space-y-1.5 text-center font-bold">
                  <span className="text-[8.5px] text-slate-400 block">إقرار وتوقيع العامل / الطرف الثاني:</span>
                  <p className="font-serif italic text-xs text-slate-800 leading-none pt-2">{employeeSignatureName}</p>
                  <p className="text-[7.5px] text-slate-400 pt-0.5">البطاقة المدنية مسجلة بالدليل الوطني</p>
                </div>

                {/* Partner Auth signature */}
                <div className="space-y-1.5 text-center font-bold">
                  <span className="text-[8.5px] text-slate-400 block">اعتماد وتوقيع الشريك المفوض:</span>
                  {drawnSignatureData ? (
                    <img src={drawnSignatureData} alt="Authorised E-Signature" className="h-10 object-contain mx-auto" />
                  ) : (
                    <p className="font-serif italic text-xs text-indigo-900 leading-none pt-2">{authSigneeName}</p>
                  )}
                  <p className="text-[9.5px] text-slate-800 tracking-tight leading-none mt-1">{authSigneeName}</p>
                  <p className="text-[8px] text-slate-400 pt-0.5">{authSigneeTitle}</p>
                </div>

              </div>

            </div>

            {/* Official Document Legal Footer */}
            {useOfficialFooter && (
              <div className="absolute bottom-6 left-6 right-6 border-t border-slate-200 pt-3 flex justify-between items-center text-[8px] text-slate-400 font-bold select-none z-10">
                <div className="space-y-0.5 text-right">
                  <p>التحقق الرسمي من المستند والاستفسار: <span className="font-mono text-[#0B332A] hover:underline">{OFFICE_INFO.email}</span></p>
                  <p className="text-[7.5px]">{OFFICE_INFO.phones} | موقع السجل الوطني: {OFFICE_INFO.website}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-8 h-8 text-slate-400 border p-0.5 rounded bg-slate-50 shrink-0" />
                  <div className="text-left font-sans">
                    <p className="font-black text-[#0B332A] leading-none text-[8.5px]">ADALAH SYSTEM</p>
                    <p className="text-[7px] text-slate-400 mt-0.5">الصفحة الأولى من الورقة ١</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Signature drawing modal pad popup */}
      <AnimatePresence>
        {showSignaturePad && (
          <div className="fixed inset-0 bg-[#0B332A]/85 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-right font-sans border border-slate-200 shadow-2xl"
            >
              <div className="bg-slate-50 border-b p-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <h4 className="text-xs sm:text-sm font-black text-[#0B332A]">رسم مائي للتوقيع الإلكتروني عالي الأمان</h4>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
                  ارسم توقيعك بيدك على المساحة المخططة بالأسفل. سيتم حقنه تلقائياً كختم معتمد وموثق بهوية المستشار الفني.
                </p>

                <canvas
                  ref={canvasRef}
                  width={380}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={() => isDrawingRef.current = false}
                  onMouseLeave={() => isDrawingRef.current = false}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={() => isDrawingRef.current = false}
                  className="w-full h-36 bg-slate-100 border border-dashed border-slate-350 rounded-2xl cursor-crosshair focus:outline-none touch-none"
                />

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="flex-1 h-9 bg-slate-150 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
                  >
                    مسح التوقيع
                  </button>
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="flex-1 h-9 bg-[#0B332A] text-white hover:bg-emerald-950 rounded-xl text-xs font-black border-none cursor-pointer"
                  >
                    اعتمد التوقيع بالصك
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeedsPrintingStudioPage;
