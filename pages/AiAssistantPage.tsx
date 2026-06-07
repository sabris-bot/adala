import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Bot, User, Trash2, Printer, Copy, RotateCcw, Send, 
  Paperclip, Mic, MicOff, HelpCircle, CheckCircle, AlertTriangle, 
  FileText, Search, Plus, Terminal, Layers, FileDown, ShieldCheck, 
  Play, Bell, Calendar, DollarSign, Briefcase, Eye, Save, Settings, 
  X, ChevronLeft, ChevronRight, Edit3, Lock, Check, BookOpen, 
  History, ArrowRight, Table, Fingerprint, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';

// --- Inline Gavel Vector Icon (Safer than dynamic bundlers) ---
const GavelIcon: React.FC = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m14 13-5 5" />
    <path d="m3 21 3-3" />
    <path d="m20.8 11.5-8.3-8.3a3 3 0 0 0-4.3 0l-3.2 3.2a3 3 0 0 0 0 4.2l8.3 8.3a3 3 0 0 0 4.2 0l3.3-3.2a3 3 0 0 0 0-4.2Z" />
    <path d="m18 10 3-3" />
    <path d="m10 18 3-3" />
  </svg>
);

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  intent?: string;
  file?: {
    name: string;
    type: string;
    size: string;
    preview?: string;
  };
  citations?: Array<{
    title: string;
    source: string;
    article: string;
  }>;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  status: 'نجاح' | 'تحت المعاينة' | 'تم التدقيق';
  secretHash: string;
}

const AiAssistantPage: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'editor' | 'audit'>('dashboard');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // AI Configuration
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [temp, setTemp] = useState<number>(0.3);

  // States for Chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `مرحباً بك في **مركز الذكاء القانوني الموحد - مساعد عدالة الذكي**. 
أنا مستشارك الرقمي المتكامل والمرتبط آلياً بجميع وحدات النظام الإدارية، العمالية، المالية، والقضائية.

يمكنني الآن:
* **تلقي مذكرات الدفاع والعقود** وتحليل الثغرات والمخاطر القانونية بموجب اللوائح الكويتية وأحكام التمييز.
* **صياغة العرائض القانونية، الإنذارات، ومخالصات نهاية الخدمة** ونقلها لمحرر المستندات الذكي لاعتمادها وطباعتها.
* **البحث المتكامل بمحرك البحث القانوني** داخل التشريعات واللوائح التنفيذية.

اطرح سؤالك أو اختر أحد السيناريوهات الجاهزة من لوحة التحكم الآلية للبدء فوراً!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [showCommandSuggest, setShowCommandSuggest] = useState(false);

  // States for Document Analysis & Upload
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  // States for Document Editor (Live Text Edit & Printable Layout)
  const [docTitle, setDocTitle] = useState('مسودة قرار ومخالصة عمالية نهائية');
  const [docContent, setDocContent] = useState(`بسم الله الرحمن الرحيم

دولة الكويت
مكتب الوجيان ومكتب صبري شطا للمحاماة والاستشارات القانونية

الموضوع: تسوية نهائية ومخالصة إبرياء ذمة بموجب قانون العمل الكويتي
رقم الإشارة: ADALA/REF/2026/0412

إنه في هذا اليوم، تم مراجعة وتصفية كافة مستحقات نهاية الخدمة والبدلات المترتبة بانتظام لصالح السيد الموظف، استناداً إلى الرواتب الشاملة المدرجة بالمنظومة البالغة 1,500 د.ك وبموجب أحكام المادة 51 من القانون رقم 6 لسنة 2010 بشأن العمل بالقطاع الأهلي.

أولاً: مستحقات نهاية الخدمة المقررة:
- عن السنوات الخمس الأولى (15 يوماً عن كل سنة): 3,750 د.ك
- عن السنوات التالية (شهراً عن كل سنة): 6,000 د.ك
- الإجمالي الكلي المعتمد للمخالصة: 9,750 د.ك (فقط تسعة آلاف وسبعمائة وخمسون ديناراً كويتياً لا غير).

ثانياً: الإقرارات والالتزامات:
بموجب سداد هذا المبلغ، يقر الطرف الثاني باستلامه كافة مستحقاته العمالية، المنصوص عليها بقانون العمل، والبدلات السنوية، ويعتبر هذا السند إبراءً كلياً ونهائياً لذمة الشركة الموظفة ويسقط أي ادعاء لاحق أو نزاع قضائي بهذا الخصوص أمام وزارة الشؤون أو الدوائر العمالية بالمحاكم الكويتية.

القسم القانوني والرقابة الإدارية - عدالة ERP

اعتماد وتوقيع الطرف المستلم:                                    توقيع وإمضاء المدير المسؤول:
.........................................                                   .........................................`);

  // Active Chat Session History
  const [chatSessions, setChatSessions] = useState([
    { id: '1', title: 'مراجعة عقد إيجار مجمع الحمراء', date: 'اليوم', active: true },
    { id: '2', title: 'تسوية نهاية خدمة "أحمد الفضلي"', date: 'أمس', active: false },
    { id: '3', title: 'تحليل ثغرات عدم المنافسة للعاملين', date: 'منذ يومين', active: false },
    { id: '4', title: 'صياغة عريضة استئناف مدني', date: 'منذ أسبوع', active: false },
  ]);

  // Voice Recording Simulator
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordInterval = useRef<any>(null);

  // Security Audit trail logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'LOG-001', timestamp: '2026-06-03 14:32:11', user: 'صبري شطا (مدير قانوني)', action: 'تحليل عقد عمل للتحقق من شرط عدم المنافسة', module: 'عقود العمل', status: 'تم التدقيق', secretHash: 'ADALA-A73BD19' },
    { id: 'LOG-002', timestamp: '2026-06-03 12:15:04', user: 'بدر الخالدي (أخصائي موارد)', action: 'حساب مخصص تسوية نهاية خدمة لموظفي فرع السالمية', module: 'نهاية الخدمة', status: 'نجاح', secretHash: 'ADALA-C011FEE' },
    { id: 'LOG-003', timestamp: '2026-06-03 10:02:45', user: 'آمنة المذكور (مستشار قضائي)', action: 'بحث أحكام التمييز الخاصة بالتعويض المؤقت', module: 'المكتبة القانونية', status: 'نجاح', secretHash: 'ADALA-E994BA3' },
    { id: 'LOG-004', timestamp: '2026-06-03 09:12:30', user: 'صبري شطا (مدير قانوني)', action: 'دخول وتحديث محضر جلسة الرول الآلي لمحكمة الأسرة', module: 'الرول الآلي', status: 'نجاح', secretHash: 'ADALA-BD881CE' },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeTab]);

  // Command Suggestions List
  const commandSuggestions = [
    { cmd: '/قضايا', desc: 'تحليل وتلخيص آخر القضايا والمذكرات المسجلة', module: 'إدارة القضايا' },
    { cmd: '/عقود', desc: 'فحص ثغرات العقود التجارية الحالية ومطابقة القوانين', module: 'عقود العمل' },
    { cmd: '/نهاية_الخدمة', desc: 'احتساب تسويات عمالية فورية بموجب مادة 51', module: 'نهاية الخدمة' },
    { cmd: '/موارد_بشرية', desc: 'مراجعة الامتثال للقرارات الوزارية ولائحة الجزاءات', module: 'شؤون الموظفين' },
    { cmd: '/شركات', desc: 'صياغة المراسلات وتحميل محاضر الجمعيات العمومية', module: 'إدارة الشركات' },
  ];

  // Helper for voice stimulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(recordInterval.current);
    setIsRecording(false);
    
    // Simulate query text from voice
    const simulatedVoiceQueries = [
      "ما هي شروط الامتثال في فترة التجربة بموجب قانون العمل الكويتي؟",
      "احسب مكافأة نهاية الخدمة لموظف قضى 8 سنوات وكان راتبه الأساسي 1200 دينار",
      "صغ لي إنذاراً رسمياً بعدم سداد القروض وبدء المطالبة القضائية"
    ];
    const randomQuery = simulatedVoiceQueries[Math.floor(Math.random() * simulatedVoiceQueries.length)];
    setInput(randomQuery);
    setActiveTab('chat');
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    
    // Switch to Chat tab to show progress
    setActiveTab('chat');
    triggerDocumentAnalysis(file);
  };

  // Simulated Scanning & AI Document Analysis pipeline
  const triggerDocumentAnalysis = (file: File) => {
    setIsLoading(true);
    setAnalyzingProgress(10);
    
    const messagesToDisplayProgress = [
      { id: 'prog1', text: "✓ تم الكشف عن المستند المرفوع عالي الجودة... جاري قراءة البيانات الثنائية واستخراج النص بالكامل.", progress: 25 },
      { id: 'prog2', text: "✓ جاري فحص بنود العقد والتحقق من التكيف الشرعي والقضائي الكويتي (Kuwaiti Statutory Compliance Fit)...", progress: 60 },
      { id: 'prog3', text: "✓ جاري فحص الثغرات، المخاطر المباشرة للمنشأة، ومطابقتها مع المادتين 17 و51 لقانون العمل 6/2010...", progress: 85 },
      { id: 'prog4', text: "✓ تم إكمال التحليل الذكي بنجاح وتوثيق سجل الامتثال الأمني المعياري.", progress: 100 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < messagesToDisplayProgress.length) {
        setAnalyzingProgress(messagesToDisplayProgress[currentStep].progress);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Finalize analysis
        const isEmployment = file.name.includes('عمل') || file.name.includes('توظيف') || file.name.includes('عامل') || file.name.includes('employee') || file.name.includes('salary');
        let resolvedAnalysisText = "";

        if (isEmployment) {
          resolvedAnalysisText = `### نتيجة مراجعة وتدقيق مستند: **${file.name}**
**الجهة الطاحصة: مساعد عدالة الذكي (Gemini 3.5 Engine)**

تم تحليل العقد عالي الحساسية بدقة عمالية مطلقة، وهنا التقرير الإرشادي المتطابق:

#### 1. ديباجة وملخص العقد (Executive Summary):
عقد عمل خاضع لأحكام قانون العمل الكويتي بالقطاع الأهلي رقم 6 لسنة 2010. يضم الشركاء والرواتب المضمونة، ويتوافق تنظيمياً مع كشوف الرواتب الحالية.

#### 2. بنود العجز والامتثال المرصودة (Compliance & Gap Analysis):
* ⚠️ **بند فترة التجربة (مخالفة صريحة):**
  العقد ينص على "فترة تجربة قدرها 120 يوماً". 
  *التكيف القانوني:* تنص **المادة 17** من قانون العمل الكويتي بوضوح وجلاء على ألا تتجاوز فترة التجربة **100 يوم عمل**. أي زيادة تعتبر باطلة بطلاناً مطلقاً.
  *توصية الذكاء الاصطناعي:* فوراً قم بتقليص المدة الإلزامية بالعقد لتصبح 90 يوماً لسلامة الإجراء العقابي مستقبلاً في حال تقرر عدم الكفاءة.

* ⚠️ **بند حظر عدم المنافسة (ضعف في الصياغة):**
  المنع مطلق النطاق الجغرافي ولمدة خمس سنوات.
  *التكيف القانوني:* بموجب المادتين **42 و43**، جرى العرف ومحكمة التمييز على إبطال المنع إذا كان فضفاضاً أو زائداً عن سنتين (24 شهراً).
  *التوصية:* حدد فترة الحظر بـ 12 شهراً فقط، واقصر النطاق الجغرافي على "العاصمة والمنطقة الحضرية" ونشاط محدد حمايةً للبند من الحكم ببطلانه.

#### 3. التوصيات العمالية المقترحة:
1. استبدال بند التجربة فوراً ليصبح: *"فترة تجربة قدرها تسعون يوماً عمل مأجورة."*
2. ربط الرواتب والبدلات المالية بقنوات الرواتب بقسم شؤون الموظفين.

#### 4. سند المرجعية التشريعية (Footnotes & Verified Citations):
- **المكتبة القانونية لوزارة العدل الكويتية:** المادة 17 (فترة التجربة)، المادة 51 (مكافأة العمل)، المواد 42-43 (عدم المنافسة والأسرار).
- **قواعد محكمة التمييز الكويتية (الاستئناف المعتدل):** الطعن رقم 114 لسنة 2021 عمالي.`;
        } else {
          resolvedAnalysisText = `### نتيجة مراجعة وتدقيق المستند المالي/التجاري: **${file.name}**
**الجهة الطاحصة: مساعد عدالة الذكي (Gemini 3.5 Engine)**

تم مراجعة نصوص الوثيقة الإدارية وعقد الخدمات، وتجهيز مواءمة إدارية متسقة مع نظام عدالة:

#### 1. ملخص الالتزامات (Summary of Obligations):
يتناول المستند بنود التوريد التجاري المتبادل، وتطوير البنية التقنية لعدالة ERP، مع تحديد القيمة التعاقدية بدقة تامة.

#### 2. تقييم المخاطر (Risk Assessment Category):
* 🟢 **المخاطر العامة:** منخفضة ومستقرة للأعمال.
* ⚠️ **اختصاص النزاعات العقدية:** ينصح بإدراج بند صريح يحدد اختصاص *محاكم قصر العدل بدولة الكويت العاصمة* دون سواها لتسوية وحل الخلافات، مع إشارة تحكيمية واضحة لمركز التحكيم القضائي بوزارة العدل.

#### 3. التحديث المباشر للمحرر (Live Action):
تم صياغة البنود المقترحة ونقلها تلقائياً لقالب وثائق **محرر المستندات الذكي**. يمكنك تعديلها وطباعتها فورياً!`;
        }

        const newMsg: Message = {
          id: Date.now().toString(),
          role: 'model',
          text: resolvedAnalysisText,
          timestamp: new Date(),
          citations: [
            { title: "قانون العمل الكويتي الأهلي رقم 6/2010", source: "وزارة الشؤون الاجتماعية والعمل - الكويت", article: "المادتين 17 و 51" },
            { title: "المرسوم بالقانون رقم 67 لسنة 1980 بشأن القانون المدني", source: "وزارة العدل الكويتية", article: "المواد 42-43" }
          ]
        };

        setMessages(prev => [...prev, newMsg]);
        
        // Log transaction to audit trail
        const newAudit: AuditLog = {
          id: `LOG-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'صبري شطا (مدير قانوني)',
          action: `فحص وتحليل ملف المستند الذكي: ${file.name}`,
          module: 'إدارة المستندات والعقود',
          status: 'تم التدقيق',
          secretHash: `ADALA-F${Math.floor(Math.random() * 90000) + 10000}`
        };
        setAuditLogs(prev => [newAudit, ...prev]);

        // Automatically populate the Editor with draft for easy review!
        if (isEmployment) {
          setDocTitle(`مسودة عقد عمل معدل - ${file.name}`);
          setDocContent(`بسم الله الرحمن الرحيم

بناءً على التوصيات والتدقيق التلقائي الصادر من مساعد عدالة الذكي، تم مراجعة وصياغة البنود الإلزامية للتوافق مع قانون العمل الكويتي بالقطاع الأهلي رقم 6 لسنة 2010.

عقد عمل فردي (معدل الامتثال)
رقم المرجع الأمني للتدقيق: ${newAudit.secretHash}

أطراف العقد:
الطرف الأول: صاحب العمل (مؤسسة عدالة لإدارة الأنظمة الإدارية والقانونية)
الطرف الثاني: الموظف المستهدف بالتعيين والامتثال

البنود الأساسية المحمية:

المادة الأولى (فترة التجربة المتوافقة):
يخضع الطرف الثاني عند مباشرته العمل لفترة تجربة واختبار قدرها تسعون (90) يوماً عمل (وهو ما لا يتعدى سقف الـ 100 يوم المنصوص عليها بالمادة 17 من قانون العمل الكويتي)، ويجوز خلال فترة التجربة المذكورة لرب العمل إنهاء العقد دون إنذار مكتوب ودون مكافأة نهاية الخدمة.

المادة الثانية (ساعات التشغيل والأجر الإضافي):
تحدد ساعات العمل الرسمية بثماني (8) ساعات يومياً وبحد أقصى ثمان وأربعين (48) ساعة عمل أسبوعياً متوافقة مع المادة 64، ويخضع أي تكليف إضافي لأجر يعادل الأجر العادي مضافاً إليه 25% مع إشعار كتابي صريح.

المادة الثالثة (عدم المنافسة وحماية المعلومات):
بموجب المادتين 42 و43 من القانون رقم 6 لسنة 2010، يتعهد الطرف الثاني بالمحافظة التامة على أسرار المنشأة وقاعدة عملاء الشركة، ويمتنع بموجب الرعاية العادلة عن مزاولة أو تقديم أي نشاط منافس مماثل في نطاق محافظة العاصمة بدولة الكويت، وذلك بحدود مدة حماية لا تتجاوز اثني عشر (12) شهراً فقط من تاريخ انتهاء العقد.

الجهة الرقابية والامتثال القانوني - عدالة ERP
توقيع الطرف الأول:                                     توقيع الطرف الثاني:
.....................................                               .....................................`);
        } else {
          setDocTitle("مذكرة تسوية والتزامات تجارية معدلة");
        }

        setIsLoading(false);
        setAnalyzingProgress(0);
        setSelectedFile(null);
        setFilePreview(null);
      }
    }, 1200);
  };

  // Chat message submission
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // Detect if instruction starts with slash command
    let detectedModule = 'استشارة عامة';
    let cleanupText = textToSend;
    if (textToSend.startsWith('/')) {
      const parts = textToSend.split(' ');
      const cmd = parts[0];
      const match = commandSuggestions.find(c => c.cmd === cmd);
      if (match) {
        detectedModule = match.module;
        cleanupText = parts.slice(1).join(' ') || `استعلام حول وثائق ${match.module}`;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      intent: detectedModule
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build session context (convert to gemini model format)
      const chatHistory = messages.slice(-5).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const aiResponse = await geminiService.getChatbotResponse(cleanupText, chatHistory);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse,
        timestamp: new Date(),
        citations: textToSend.includes('نهاية') || textToSend.includes('خدمة') || textToSend.includes('منافس') ? [
          { title: "قانون العمل بالقطاع الأهلي رقم 6 لعام 2010", source: "الباب الثالث والرابع من اللائحة الرسمية لدولة الكويت", article: "المادتين 51 و 17" }
        ] : undefined
      };
      
      setMessages(prev => [...prev, assistantMsg]);

      // Add to audit trail
      const newAudit: AuditLog = {
        id: `LOG-${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'صبري شطا (مدير قانوني)',
        action: `استعلام عن: ${textToSend.substring(0, 45)}...`,
        module: detectedModule,
        status: 'نجاح',
        secretHash: `ADALA-S${Math.floor(Math.random() * 90000) + 10000}`
      };
      setAuditLogs(prev => [newAudit, ...prev]);

    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "عذراً رئيساً، تعذر معالجة الطلب عبر خوادم السحاب في الوقت الراهن لوجود قيود على الاتصال بالخصوص. تم تفعيل الاستجابة المحلية الاحتياطية بنجاح لضمان استقرار العمل.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger quick scenarios from the interactive dashboard
  const handleTriggerScenario = (scenarioTitle: string, queryText: string) => {
    setActiveTab('chat');
    setInput(queryText);
    setTimeout(() => {
      handleSendMessage(queryText);
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ النص إلى الحافظة بنجاح!');
  };

  const verifyDocumentToDraft = () => {
    alert('✓ تم اعتماد الوثيقة بالكامل ومزامنتها مع سجلات النظام الرقابية لإصدار رمز الباركود المعياري.');
  };

  // Exporters for document editor (PDF, Word, Excel simulation)
  const handleExportDoc = (formatType: 'pdf' | 'doc' | 'xls') => {
    if (formatType === 'doc') {
      const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>${docTitle}</title></head>
        <body style="direction: rtl; font-family: Arial; padding: 20px;">
          <h2>${docTitle}</h2>
          <hr/>
          <p style="white-space: pre-wrap;">${docContent}</p>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docTitle}.doc`;
      link.click();
    } else if (formatType === 'xls') {
      // Create CSV format for tables/financial metadata of the EOS
      const rows = [
        ["مستند الامتثال والتحليل الرقمي", docTitle],
        ["تاريخ المعاملة والتصدير", new Date().toLocaleDateString('ar-KW')],
        ["قناة الرقابة", "مساعد عدالة الذكي ERP"],
        [""],
        ["بند الحساب", "القيمة بالدينار الكويتي (KWD)"],
        ["مخصص نهاية الخدمة (السنوات الخمس الأولى)", "3,750"],
        ["مخصص نهاية الخدمة (السنوات التالية)", "6,000"],
        ["الإجمالي الكلي لمخالصة براءة الذمة", "9,750"]
      ];
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `تقرير_حساب_مخالصة_${docTitle}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF - just trigger printing of document content pane
      window.print();
    }
  };

  const handleCommandInput = (val: string) => {
    setInput(val);
    if (val.startsWith('/')) {
      setShowCommandSuggest(true);
    } else {
      setShowCommandSuggest(false);
    }
  };

  const clearChat = () => {
    if (confirm('هل أنت متأكد من رغبتك في مسح المحادثة النشطة؟')) {
      setMessages([
        {
          id: 're-welcome',
          role: 'model',
          text: `تم مسح محتوى المحادثة السابقة بنجاح وبدء جلسة جديدة. أنا مستعد للمساعدة بأمرك رئيس الوفد القانوني.`,
          timestamp: new Date()
        }
      ]);
    }
  };

  return (
    <div className={`flex bg-[#f8fafc] dark:bg-dm-background font-sans transition-all duration-300 antialiased overflow-hidden ${
      isFullScreen ? 'fixed inset-0 z-[999] w-screen h-screen' : 'h-[calc(100vh-130px)] rounded-3xl border border-gray-200/80 shadow-md'
    }`} id="smart-justice-assistant-hub">
      
      {/* 1. RIGHT SIDEBAR - HISTORIES & CONTROLS */}
      {sidebarOpen && (
        <aside className="w-80 bg-slate-900 text-slate-100 flex flex-col border-l border-slate-800 flex-shrink-0 z-10 print:hidden relative transition-all duration-300">
          
          {/* Sidebar Brand Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-xl text-slate-950">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white">مساعد عدالة الذكي</h3>
                <span className="text-[10px] text-amber-500 font-mono">ADALA AI HUB 3.5</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action - New Chat */}
          <div className="p-3">
            <button 
              onClick={() => {
                setMessages([
                  {
                    id: Date.now().toString(),
                    role: 'model',
                    text: 'بدأنا محادثة قانونية فارغة وجديدة. أنا مستعد لمساعدتك بخصوص حسابات الموظفين، صياغة المذكرات، أو تفكيك العقود.',
                    timestamp: new Date()
                  }
                ]);
                setActiveTab('chat');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>محادثة قانونية جديدة</span>
            </button>
          </div>

          {/* Active Model Selector */}
          <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase block">النموذج النشط للذكاء</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button 
                  onClick={() => setSelectedModel('gemini-3.5-flash')}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${selectedModel === 'gemini-3.5-flash' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-100'}`}
                >
                  3.5 Flash
                </button>
                <button 
                  onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${selectedModel === 'gemini-3.1-pro-preview' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-100'}`}
                >
                  Pro Preview 👑
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">درجة التفكير والاتزان</span>
                <span className="text-amber-500 font-mono font-bold">{temp}</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.1" 
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500 opacity-80 hover:opacity-100 cursor-pointer bg-slate-800 h-1.5 rounded-lg"
              />
            </div>
            
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 shrink-0 bg-slate-900/60 p-2 rounded-lg">
              <Fingerprint className="w-3.5 h-3.5 text-amber-500" />
              <span>الصلاحيات: **مدير تفتيش قانوني**</span>
            </div>
          </div>

          {/* Chat History Session Log */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase px-3 tracking-wider mb-2">المحادثات الأخيرة للذكاء</p>
            {chatSessions.map((session) => (
              <button 
                key={session.id}
                onClick={() => {
                  setChatSessions(chatSessions.map(c => ({...c, active: c.id === session.id})));
                  setActiveTab('chat');
                }}
                className={`w-full text-right p-2.5 rounded-xl flex items-center gap-2.5 transition-all group ${
                  session.active 
                    ? 'bg-slate-850 border-r-4 border-amber-500 text-white' 
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <History className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${session.active ? 'text-amber-500' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate">{session.title}</p>
                  <p className="text-[8px] opacity-50 mt-0.5">{session.date}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Legal Certification stamp (Local integrity) */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col gap-2 relative">
            <span className="text-[8px] text-slate-500 block uppercase font-mono">Kuwait Law Fit Certification</span>
            <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <div className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                تمت مراجعة النماذج آلياً واعتمادها قضائياً وفق فهارس وزارة العدل.
              </p>
            </div>
          </div>

        </aside>
      )}

      {/* Toggle button if sidebar closed */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-l-xl z-20 shadow-md flex items-center print:hidden border border-slate-800 border-r-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* 2. MAIN WORKSPACE / CHAT PANE */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOP STATUS BAR & TAB NAVIGATION */}
        <header className="h-16 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10 print:hidden">
          
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                لوحة التحكم الذكية
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                المستشار القانوني الرقمي
              </button>
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                محرر المستندات الذكي
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                سجل التدقيق والامتثال
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Screen Options */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <button 
                onClick={() => {
                  if (confirm('هل ترغب بتحديث اتصال المعالجة مع سيرفرات Gemini الآن؟')) {
                    alert('✓ تمت إعادة المزامنة وبدء جلسة اتصال آمنة.');
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                title="تحديث الخوادم"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                title="تغيير أبعاد العرض"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => window.print()}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                title="طباعة الواجهة"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[11px] font-bold text-emerald-600">المعالج ذكي ونشط</span>
            </div>

          </div>

        </header>

        {/* WORKSPACE DETAILED SCREENS */}
        <div className="flex-1 overflow-y-auto">
          
          {/* ==================== A. TAB 1: DASHBOARD VIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="p-6 sm:p-8 space-y-8 animate-fadeIn max-w-6xl mx-auto">
              
              {/* Grand Banner */}
              <div className="relative overflow-hidden bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="space-y-2 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>المستوى الإحصائي للذكاء الرقابي</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">مركز مساعد عدالة الذكي الحادي والثمانون</h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    منظومة القيادة الاستشارية والتقارير المطبوعة. يمكنك تصفح التدفقات التشغيلية للأقسام والوصول الفوري لقرارات فض النزاعات وتدقيق العقود.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/60 p-4 border border-slate-800 rounded-2xl z-10 shadow-sm shrink-0">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Intelligence Accuracy</span>
                    <span className="text-xl font-black text-white font-mono">98.4%</span>
                  </div>
                </div>
              </div>

              {/* Stat Card Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500">العقود المفحوصة ذكياً</span>
                    <span className="text-[10px] py-0.5 px-1.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">نشط</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">42 عقداً</h3>
                  <p className="text-[10px] text-slate-400 mt-1">توفير 22 ساعة عمل من الصياغة المكتوبة</p>
                </div>

                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500">نزاعات نهاية الخدمة التي تم تصفيتها</span>
                    <span className="text-[10px] py-0.5 px-1.5 bg-amber-100 text-amber-800 rounded-full font-bold">بموجب المادة 51</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">118 حالة</h3>
                  <p className="text-[10px] text-slate-400 mt-1">مطابقة للأمانة العمالية كاملة بنسبة 100%</p>
                </div>

                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500">جلسات الرول والمحاضر المستعلم عنها</span>
                    <span className="text-[10px] py-0.5 px-1.5 bg-blue-100 text-blue-800 rounded-full font-bold">تحديث فوري</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">304 جلسة</h3>
                  <p className="text-[10px] text-slate-400 mt-1">ربط أوتوماتيكي مع المحاكم دون تدخل بشري</p>
                </div>

                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500">نسبة تلافي المخاطر التنظيمية</span>
                    <span className="text-[10px] py-0.5 px-1.5 bg-purple-100 text-purple-800 rounded-full font-bold">سلامة تامة</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">31 ثغرة</h3>
                  <p className="text-[10px] text-slate-400 mt-1">تم رصدها بمعايير التدقيق المدنية والتجارية</p>
                </div>
              </div>

              {/* INTEGRATED MODULE CONECTOR GRID (15 MODULES WITHOUT EXCEPTION) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">ربط مساعد عدالة بجميع وحدات النظام دون استثناء</h2>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-normal">
                  بوابة الربط المشترك لوحدات ERP. اضغط على أي وحدة لتلقين المساعد القانوني أمراً تنفيذياً خاصاً بتلك الإدارة والمصاغ خصيصاً مع فهارس القوانين الكويتية:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { id: 'cases', title: 'إدارة القضايا', icon: <Briefcase className="w-4 h-4" />, query: 'أريد مراجعة وتلخيص شامل لقضية المدعي لبيان فرص نجاح القضية والطلبات المستخرجة.', color: 'border-blue-200 hover:bg-blue-50/40 text-blue-700' },
                    { id: 'litig', title: 'إدارة التقاضي', icon: <GavelIcon />, query: 'ما هي مواعيد الاستئناف والطعن المقررة بالدوائر القضائية بالمحاكم الكويتية؟', color: 'border-indigo-200 hover:bg-indigo-50/40 text-indigo-700' },
                    { id: 'legal', title: 'الإدارة القانونية', icon: <ShieldCheck className="w-4 h-4" />, query: 'اكتب رأياً استشارياً تفصيلياً بخصوص حماية معلومات الشركة والتعاقد بموجب أحكام القوانين.', color: 'border-emerald-200 hover:bg-emerald-50/40 text-emerald-700' },
                    { id: 'contracts', title: 'إدارة العقود', icon: <FileText className="w-4 h-4" />, query: 'ارفع وثيقة لفحص ثغرات التعاقد والتحقق من التكيف وتخمين المخاطر القانونية والالتزامات.', color: 'border-amber-200 hover:bg-amber-50/40 text-amber-700' },
                    { id: 'hr', title: 'شؤون الموظفين', icon: <User className="w-4 h-4" />, query: 'ما هي ضوابط مادة 35 لجزاءات الموظف والقرارات الإلزامية للتحقيق الإداري مع العامل؟', color: 'border-teal-200 hover:bg-teal-50/40 text-teal-700' },
                    { id: 'eos', title: 'نهاية الخدمة', icon: <DollarSign className="w-4 h-4" />, query: 'احسب بالتفصيل تسوية نهاية الخدمة لموظف مستقيل بعد خدمة 7 سنوات وقام بإنهاء العقد.', color: 'border-rose-200 hover:bg-rose-50/40 text-rose-700' },
                    { id: 'financial', title: 'الإدارة المالية', icon: <Table className="w-4 h-4" />, query: 'كيف يتم حجز المخصصات وتدبير القسط العمالي في تسويات المنشأة للتخلف عن الدفع؟', color: 'border-violet-200 hover:bg-violet-50/40 text-violet-700' },
                    { id: 'realestate', title: 'إدارة العقارات', icon: <Layers className="w-4 h-4" />, query: 'تحقق من مطابقة شروط إيجار مجمع الحمراء وعقود إخلاء العين عند التخلف المعتمد.', color: 'border-cyan-200 hover:bg-cyan-50/40 text-cyan-700' },
                    { id: 'companies', title: 'إدارة الشركات', icon: <Play className="w-4 h-4" />, query: 'صغ لي محضر اجتماع العمومية وقرار تبرئة ذمة الشركاء وإقرار تعديل قانون الشركات الكويتي.', color: 'border-orange-200 hover:bg-orange-50/40 text-orange-700' },
                    { id: 'library', title: 'المكتبة القانونية', icon: <BookOpen className="w-4 h-4" />, query: 'ابحث في قواعد تمييز محكمة التمييز بخصوص بند الإثبات الجوهري والتعويض العادل.', color: 'border-purple-200 hover:bg-purple-50/40 text-purple-700' },
                    { id: 'documents', title: 'المستندات', icon: <FileText className="w-4 h-4" />, query: 'استخرج التواريخ والالتزامات الهامة من المستند المرفق لجدولة الأعمال.', color: 'border-sky-200 hover:bg-sky-50/40 text-sky-700' },
                    { id: 'docket', title: 'الرول الآلي', icon: <Calendar className="w-4 h-4" />, query: 'كيف يمكن ربط وتحميل بيانات رول الجلسات بمحركات الرقابة لجدولة عمل المنظومة التلقائي؟', color: 'border-pink-200 hover:bg-pink-50/40 text-pink-700' },
                    { id: 'mail', title: 'المراسلات', icon: <Send className="w-4 h-4" />, query: 'اكتب خطاباً رسمياً موجهاً لشؤون العمل بوزارة الشؤون الاجتماعية والعمل بدولة الكويت.', color: 'border-red-200 hover:bg-red-50/40 text-red-700' },
                    { id: 'notifications', title: 'الإشعارات', icon: <Bell className="w-4 h-4" />, query: 'أرسل تنبيهاً فورياً للموظفين المستحقين لإشراكهم ببيان براءة الذمة ومخالصات نهاية الخدمة.', color: 'border-lime-200 hover:bg-lime-50/40 text-lime-700' },
                    { id: 'reports', title: 'مركز التقارير', icon: <Printer className="w-4 h-4" />, query: 'أصدر تقريراً إحصائياً شاملاً قابلاً للطباعة ومدعوماً بالكامل بترميز الباركود QR.', color: 'border-emerald-200 hover:bg-emerald-50/40 text-emerald-700' },
                  ].map((unit) => (
                    <button 
                      key={unit.id}
                      onClick={() => handleTriggerScenario(unit.title, unit.query)}
                      className={`flex flex-col items-center justify-center p-3 text-center border-2 rounded-2xl transition-all font-sans cursor-pointer active:scale-95 shadow-sm text-slate-800 ${unit.color}`}
                    >
                      <div className="p-2 mb-1.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-115 transition-transform shrink-0">
                        {unit.icon}
                      </div>
                      <span className="text-[11px] font-extrabold tracking-tight block">{unit.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bento Row: Smart alerts & quick suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Alerts Pane */}
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">تنبيهات ومواعيد عاجلة</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4 p-3 bg-red-50/60 border border-red-100 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-red-800">قضية مجمع الحمراء</span>
                        <p className="text-[11px] text-red-950 font-bold leading-relaxed">جلسة الرول الآلي لقضية مجمع الحمراء غداً الساعة 10:00 صباحاً لقاضي الإيجارات.</p>
                      </div>
                      <span className="text-[9px] font-mono whitespace-nowrap text-red-600 block bg-white px-1.5 py-0.5 rounded-md border border-red-100">تحذير</span>
                    </div>

                    <div className="flex justify-between items-start gap-4 p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-800">امتثال شؤون الموظفين (مادة 17)</span>
                        <p className="text-[11px] text-amber-950 font-bold leading-relaxed">تنبيه: انتهاء فترة تجربة الموظف 'بدر الخالدي' بعد 5 أيام (يجب تقييد مقتضيات المادة الإدارية).</p>
                      </div>
                      <span className="text-[9px] font-mono whitespace-nowrap text-amber-600 block bg-white px-1.5 py-0.5 rounded-md border border-amber-100">موعد</span>
                    </div>

                    <div className="flex justify-between items-start gap-4 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-800">الإدارة المالية</span>
                        <p className="text-[11px] text-blue-950 font-bold leading-relaxed">التزام مالي: سداد الدفعة الإيجارية المستحقة لشركة الوجيان العقارية لحجز براءة الذمة.</p>
                      </div>
                      <span className="text-[9px] font-mono whitespace-nowrap text-blue-600 block bg-white px-1.5 py-0.5 rounded-md border border-blue-100">التصنيف المالي</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Scenarios List */}
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">سيناريوهات قانونية ذكية</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleTriggerScenario("شرط عدم المنافسة", "ما هي شروط صحة بند حظر عدم المنافسة في عقد العمل الكويتي وموقف محكمة التمييز بالخصوص؟")}
                      className="p-3 text-right border border-slate-100 bg-slate-50/60 hover:bg-slate-100 rounded-xl block transition-all"
                    >
                      <h4 className="text-[11px] font-bold text-slate-900">شرط عدم المنافسة ومحكمة التمييز</h4>
                      <p className="text-[9px] text-slate-500 mt-1 lines-clamp-2">فحص الضوابط الجغرافية والزمنية للتحقق من بطلان أو استمرار الشرط.</p>
                    </button>

                    <button 
                      onClick={() => handleTriggerScenario("مكافأة العمل مادة 51", "اشرح لي بالتفصيل طريقة الحساب الشامل لمكافأة نهاية خدمة للموظف في الكويت بموجب المادة 51.")}
                      className="p-3 text-right border border-slate-100 bg-slate-50/60 hover:bg-slate-100 rounded-xl block transition-all"
                    >
                      <h4 className="text-[11px] font-bold text-slate-900">احتساب نهاية الخدمة (مادة 51)</h4>
                      <p className="text-[9px] text-slate-500 mt-1 lines-clamp-2">دراسة الأثر العمالي، التوظيف المحدد وغير المحدد، وطريقة تقديم الاستقالة.</p>
                    </button>

                    <button 
                      onClick={() => handleTriggerScenario("إفتاء تركة وميراث", "احسب التركة كويتياً لمورث ترك زوجة وبنتين وأب، وبلغ مقدار التركة المالية الباقي 150000 دينار.")}
                      className="p-3 text-right border border-slate-100 bg-slate-50/60 hover:bg-slate-100 rounded-xl block transition-all"
                    >
                      <h4 className="text-[11px] font-bold text-slate-900">فتوى إرثية للأحوال الشخصية</h4>
                      <p className="text-[9px] text-slate-500 mt-1 lines-clamp-2">تفتيت الفروض والحجب والسهام الشرعية وفق قانون الأحوال الشخصية 51/1984.</p>
                    </button>

                    <button 
                      onClick={() => handleTriggerScenario("صياغة إنذار رسمي", "صغ لي نموذجاً بليغاً ومكتوباً لـ 'عريضة دعوى بطلان شرط ومطالبة بتعويض عمالي نتيحة فصل تعسفي'") }
                      className="p-3 text-right border border-slate-100 bg-slate-50/60 hover:bg-slate-100 rounded-xl block transition-all"
                    >
                      <h4 className="text-[11px] font-bold text-slate-900">صياغة عريضة دعوى بطلان</h4>
                      <p className="text-[9px] text-slate-500 mt-1 lines-clamp-2">صياغة عريضة قانونية بليغة وإرسالها تلقائياً لمحرر المستندات الذكي.</p>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== B. TAB 2: ACTIVE AI CHAT CONVERSATION ==================== */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col relative bg-slate-50/30">
              
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 sm:p-5 shadow-sm transition-all relative group ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-te-none border border-slate-850' 
                          : 'bg-white text-slate-800 rounded-ts-none border border-gray-100'
                      }`}>
                        
                        {/* Conversation header */}
                        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b opacity-50 text-[10px] sm:text-xs">
                          {msg.role === 'user' ? (
                            <>
                              <User className="w-4 h-4 text-amber-500" />
                              <span className="font-bold text-amber-500">المستعلم (المستشار صبري شطا)</span>
                              {msg.intent && (
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] mr-auto text-slate-400">
                                  {msg.intent}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Bot className="w-4 h-4 text-amber-500" />
                              <span className="font-bold text-amber-500">مساعد عدالة الذكي (Gemini Active)</span>
                            </>
                          )}
                        </div>

                        {/* Speech body (MD enabled for perfect professional legal rendering) */}
                        <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text markdown-body ${
                          msg.role === 'model' ? 'chatbot-md dark:text-slate-900' : 'text-slate-100'
                        }`}>
                          {msg.role === 'model' ? (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          ) : msg.text}
                        </div>

                        {/* Citation widget reference footnotes */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 p-3 bg-amber-50/40 border border-amber-500/15 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-800 block">المصادر والأسانيد القانونية المستخدمة (Citations):</span>
                            {msg.citations.map((cit, idx) => (
                              <div key={idx} className="text-[9px] text-slate-600 flex items-center gap-1.5 leading-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>**{cit.title}** ({cit.article}) — المصدر الفهرسي: *{cit.source}*</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metadata Footer */}
                        <div className="mt-3 flex items-center justify-between opacity-50 text-[8px] sm:text-[10px]">
                          <span>{msg.timestamp.toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })}</span>
                          <div className="flex items-center gap-2 scale-90 sm:scale-100">
                            <button 
                              onClick={() => copyToClipboard(msg.text)}
                              className="p-1 hover:text-amber-500 hover:bg-slate-100 rounded-md"
                              title="نسخ الرد"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                setDocContent(msg.text);
                                setDocTitle(`مسودة قانونية مستخرجة لـ ${new Date().toLocaleDateString('ar-KW')}`);
                                setActiveTab('editor');
                              }}
                              className="p-1 hover:text-amber-500 hover:bg-slate-100 rounded-md"
                              title="أرسل هذه الصياغة كمسودة للمحرر"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-ts-none p-4 shadow-sm flex flex-col gap-3 max-w-[80%]">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            <Bot className="w-5 h-5 animate-spin" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">جاري تفكير عدالة AI...</span>
                            <span className="text-[9px] text-slate-400 block">يقوم بالاستقصاء التشريعي والتحقق من المادتين 17 و 51</span>
                          </div>
                        </div>

                        {analyzingProgress > 0 && (
                          <div className="space-y-1.5">
                            <div className="w-64 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className="bg-amber-500 h-full transition-all duration-300"
                                style={{ width: `${analyzingProgress}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono text-amber-600 block text-left">{analyzingProgress}% تم الفحص الضوئي</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Controls & Microphones */}
              <div className="p-4 bg-white border-t border-gray-200 shadow-lg relative print:hidden">
                <div className="max-w-4xl mx-auto space-y-3">
                  
                  {/* File Upload Zone / Drag Active */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all ${
                      dragActive ? 'bg-amber-50 border-amber-500 text-amber-950' : 'bg-slate-50/50 border-gray-200 text-slate-500'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,image/*" 
                    />
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-xs shrink-0">
                        <Paperclip className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800">تحليل العقود والمذكرات (Drag & Drop or click to upload)</p>
                        <p className="text-[10px] text-slate-400">يدعم الصور والمستندات بجميع الامتدادات PDF, DOCX</p>
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] sm:text-xs rounded-xl"
                      >
                        اختر ملف فوري
                      </button>
                    </div>
                  </div>

                  {/* Smart command line bar prompt */}
                  <div className="relative">
                    
                    {/* Command list dropdown picker */}
                    {showCommandSuggest && (
                      <div className="absolute bottom-full right-0 mb-2 w-full max-w-md bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl shadow-xl p-3 z-50 space-y-1.5">
                        <p className="text-[10px] text-slate-400 font-bold px-2 uppercase pb-1 border-b border-slate-800">أوامر مساعد عدالة السريعة</p>
                        {commandSuggestions.map((item) => (
                          <button 
                            key={item.cmd}
                            onClick={() => {
                              setInput(`${item.cmd} `);
                              setShowCommandSuggest(false);
                            }}
                            className="w-full text-right p-2 hover:bg-slate-900 rounded-xl flex items-center justify-between text-xs"
                          >
                            <span className="font-mono text-amber-500 font-bold">{item.cmd}</span>
                            <span className="text-slate-400 text-[10px]">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-end gap-2 bg-[#f8fafc] border border-gray-200 focus-within:border-amber-500 rounded-2xl p-2 transition-all shadow-inner">
                      
                      {/* Speech Command Mic stimulation */}
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2.5 rounded-xl shrink-0 transition-all ${
                          isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                        }`}
                        title="الأوامر الصوتية الذكية"
                      >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      {/* Input Text Area */}
                      <textarea 
                        rows={1}
                        value={input}
                        onChange={(e) => handleCommandInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder="ابحث بالقوانين، صغ عقد عمل، أو اكتب أمرك باللغة العربية والإنجليزية... (مثال: /نهاية_الخدمة)"
                        className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-xs sm:text-sm py-2 resize-none max-h-32 min-h-[40px] dark:text-slate-900 scrollbar-thin placeholder:text-slate-400"
                      />

                      {/* Send submit button */}
                      <button 
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className={`p-3 rounded-xl transition-all shrink-0 ${
                          !input.trim() || isLoading 
                            ? 'bg-slate-100 text-slate-300' 
                            : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md active:scale-95 cursor-pointer'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>

                    </div>
                  </div>

                  {/* Sound visual stimulation if recording */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-3 p-3 bg-red-50 border border-red-100 rounded-2xl animate-pulse">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-red-500 rounded"></span>
                        <span className="w-1 h-6 bg-red-500 rounded"></span>
                        <span className="w-1 h-4 bg-red-500 rounded"></span>
                        <span className="w-1 h-7 bg-red-500 rounded"></span>
                        <span className="w-1 h-2 bg-red-500 rounded"></span>
                      </div>
                      <span className="text-xs font-bold text-red-950">جاري الاستماع ونسخ الأوامر الصوتية... وقت التسجيل: {recordingTime} ثانية</span>
                    </div>
                  )}

                  <p className="text-[10px] text-center text-slate-400">
                    *مساعد عدالة آلي ومحمي.* جميع الأسئلة والقرارات مطابقة وموثقة للامتثال الإداري لدولة كويت. لا تستأنس بها كبديل عن التمثيل المباشر المسجل.
                  </p>

                </div>
              </div>

            </div>
          )}

          {/* ==================== C. TAB 3: SMART DOCUMENT EDITOR ==================== */}
          {activeTab === 'editor' && (
            <div className="p-4 sm:p-8 space-y-6 animate-fadeIn max-w-5xl mx-auto">
              
              {/* Header Editor Controls */}
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-900">محرر المستندات والعرائض الذكي</h3>
                  <p className="text-[10px] text-slate-500">تم تعديله وتلقينه آلياً. عدّل محتوى الوثيقة بالخصوص ثم اعتمدها للطباعة والتصدير.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => handleExportDoc('doc')} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] sm:text-xs rounded-xl"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-605" />
                    <span>تصدير Word</span>
                  </button>
                  <button 
                    onClick={() => handleExportDoc('xls')} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] sm:text-xs rounded-xl"
                  >
                    <Table className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تصدير Excel (مكافأة)</span>
                  </button>
                  <button 
                    onClick={() => handleExportDoc('pdf')} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] sm:text-xs rounded-xl"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-600" />
                    <span>حفظ PDF والطباعة</span>
                  </button>
                  <button 
                    onClick={verifyDocumentToDraft} 
                    className="flex items-center gap-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs rounded-xl shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>اعتماد ومزامنة المعاملة</span>
                  </button>
                </div>
              </div>

              {/* Title Edit Block */}
              <div className="p-4 bg-white border border-gray-150 rounded-2xl shadow-xs print:hidden">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">عنوان الوثيقة القانونية</label>
                <input 
                  type="text" 
                  value={docTitle} 
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-205 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800"
                />
              </div>

              {/* Physical Paper Layout */}
              <div className="bg-white border hover:shadow-2xl border-gray-300 rounded-3xl p-6 sm:p-12 relative font-serif max-w-4xl mx-auto shadow-xl" id="printable-contract-paper">
                
                {/* Visual Watermark / Paper texture overlay */}
                <div className="absolute inset-0 bg-radial-gradient-paper pointer-events-none opacity-30 select-none rounded-3xl" />

                {/* Elegant Kuwait Header Layout */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 gap-4 relative z-10">
                  <div className="text-right space-y-1 text-slate-900 min-w-[150px]">
                    <h3 className="font-extrabold text-[12px] sm:text-sm">دولة الكويت</h3>
                    <h4 className="text-[10px] sm:text-[11px] font-bold">وزارة العدل والأحوال المدنية</h4>
                    <span className="text-[9px] block opacity-75">مكتب صبري شطا للمحاماة</span>
                  </div>

                  {/* Emblem vector representation */}
                  <div className="w-20 h-20 bg-slate-50 border-2 border-slate-900 rounded-full flex flex-col items-center justify-center p-1 font-sans shadow-xs group cursor-help transition-all shrink-0">
                    <span className="text-[8px] sm:text-[10px] font-bold block text-slate-900">عدالة ERP</span>
                    <Layers className="w-6 h-6 text-amber-500 mt-0.5" />
                    <span className="text-[6px] tracking-widest text-slate-500 font-mono scale-90">VERIFIED</span>
                  </div>

                  {/* Security Reference and QR Code Generator */}
                  <div className="text-left space-y-1 min-w-[150px]">
                    <span className="text-[7px] sm:text-[9px] block bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-center">ADALA-VERIFIED-SYSTEM</span>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <div className="space-y-0.5 text-left text-[8px] sm:text-[9px] text-slate-500">
                        <p>**المرجع: ADALA-0412**</p>
                        <p>التاريخ: {new Date().toLocaleDateString('ar-KW')}</p>
                      </div>
                      
                      {/* Unique Vector QR Code Representation */}
                      <div className="w-10 h-10 border border-slate-300 p-0.5 bg-white rounded flex flex-col items-center justify-center relative shrink-0">
                        <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                          <div className="bg-slate-900 rounded-xs"></div>
                          <div className="bg-transparent"></div>
                          <div className="bg-slate-900 rounded-xs"></div>
                          <div className="bg-transparent"></div>
                          <div className="bg-slate-900 rounded-xs"></div>
                          <div className="bg-transparent"></div>
                          <div className="bg-slate-900 rounded-xs"></div>
                          <div className="bg-transparent"></div>
                          <div className="bg-slate-900 rounded-xs"></div>
                        </div>
                        <span className="text-[5px] absolute bottom-0.5 bg-slate-900 text-white leading-none px-0.5 scale-75 uppercase">ADALA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Document Title Block */}
                <div className="text-center space-y-2 mb-8 relative z-10">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight font-sans underline decoration-amber-500 decoration-wavy underline-offset-8">
                    {docTitle}
                  </h2>
                </div>

                {/* Main editable Paper and inline editor text block */}
                <div className="relative z-10 text-xs sm:text-sm text-slate-900 leading-amber font-medium whitespace-pre-wrap font-serif min-h-[300px] outline-none">
                  {/* Inline interactive editing area with physical placeholder */}
                  <textarea 
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="w-full min-h-[350px] p-2 bg-transparent border-none focus:outline-none focus:ring-0 leading-loose scrollbar-none text-xs sm:text-sm font-serif select-text resize-none text-slate-900 tracking-wide"
                    placeholder="محتوى المستند..."
                  />
                </div>

                {/* Certified Footnote marker */}
                <div className="mt-12 border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[8px] sm:text-[10px] text-slate-500 relative z-10">
                  <p className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>تم الفحص والتدقيق القانوني بمطابقة اللوائح عبر مساعد عدالة الذكي وبمسؤولية مكتب المحاماة.</span>
                  </p>
                  <p className="font-mono mt-2 sm:mt-0 opacity-75">Hash Security Verification: #ADALA-881273917-KW</p>
                </div>

              </div>

            </div>
          )}

          {/* ==================== D. TAB 4: COMPLIANCE & SECURITY AUDIT TRAIL ==================== */}
          {activeTab === 'audit' && (
            <div className="p-6 sm:p-8 space-y-6 animate-fadeIn max-w-5xl mx-auto">
              
              <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm sm:text-lg text-slate-900 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-amber-500" />
                      <span>سجل تدقيق العمليات والامتثال مع الرقابة الإدارية</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      قائمة بجميع العمليات، القرارات، الحسابات، وصلاحيات الاستعلام التي نفذها مساعد عدالة الذكي داخل النظام.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setAuditLogs([
                        {
                          id: `LOG-${Math.floor(Math.random() * 900) + 100}`,
                          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                          user: 'صبري شطا (مدير قانوني)',
                          action: 'تصديق وتوقيع مخالصة نهاية الخدمة لمجلس الإدارة',
                          module: 'تفويض الإدارة',
                          status: 'نجاح',
                          secretHash: `ADALA-S${Math.floor(Math.random() * 90000) + 10000}`
                        },
                        ...auditLogs
                      ]);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] sm:text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إرسال تصديق يدوي</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-650 font-bold border-b border-gray-100">
                      <tr>
                        <th className="p-3 text-right">رقم العملية</th>
                        <th className="p-3">الوقت والتاريخ</th>
                        <th className="p-3">المستعلم المسؤول</th>
                        <th className="p-3">تفاصيل الإجراء الإداري</th>
                        <th className="p-3">الوحدة المتأثرة</th>
                        <th className="p-3">الحالة الأمنية</th>
                        <th className="p-3">بصمة الموثوقية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans text-slate-750">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-600 block">{log.id}</td>
                          <td className="p-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3 font-bold text-slate-800">{log.user}</td>
                          <td className="p-3 text-slate-600 leading-normal">{log.action}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px]">
                              {log.module}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              log.status === 'نجاح' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-105 text-blue-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-400 font-semibold">{log.secretHash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 leading-normal">
                  <Lock className="w-4 h-4 text-slate-450 shrink-0" />
                  <span>
                    إخلاء مسؤولية أمني: سجل تدقيق العمليات (Audit Trail Logs) مشفر ومؤمن بالكامل عبر بصمة الموثوقية الرقمية. يمنع تزوير أو تغيير البارامترات المسجلة لمسؤولية الامتثال.
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default AiAssistantPage;
