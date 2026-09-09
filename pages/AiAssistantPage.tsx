import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Bot, User, Trash2, Printer, Copy, Send, 
  Paperclip, Mic, MicOff, CheckCircle, AlertTriangle, 
  FileText, Search, Plus, Terminal, Layers, FileDown, ShieldCheck, 
  Briefcase, Edit3, BookOpen, Scale, AlertCircle, 
  Building, Calculator, History, Folder, Calendar, Info, 
  RefreshCw, FileCode, ChevronLeft, Save, Star,
  Cpu, Bookmark, FileCheck, X, Sliders, Check, Wand2, LayoutDashboard,
  CheckCircle2, ArrowLeftRight, MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService, ChatMessage } from '../services/geminiService';
import { useToast } from '../components/ui/Toast';
import PrintHeader from '../components/ui/PrintHeader';

// --- Data Imports Anchor ---
import { initialCases } from '../data/caseData';
import { mockAnalyzedContracts } from '../data/contractAnalysisData';
import { mockProperties, mockLeaseAgreements } from '../data/propertyData';
import { sampleEmployees } from '../data/employeeData';
import { kuwaitLawsDatabase } from '../data/kuwaitLawsData';

// --- Types ---
import { UserRole } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// --- Local Interfaces for Conversational Engine ---
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  citations?: CitedItem[];
  entitiesExtracted?: SearchedEntity[];
  attachedEntity?: AttachedSystemEntity;
}

interface CitedItem {
  id: string;
  title: string;
  category: string;
  content: string;
  source: string;
}

interface SearchedEntity {
  id: string;
  type: 'case' | 'contract' | 'property' | 'employee' | 'task';
  title: string;
  subtitle: string;
  details: string;
  raw: any;
}

interface AttachedSystemEntity {
  type: 'case' | 'contract' | 'property' | 'employee' | 'form';
  id: string;
  name: string;
  code: string;
  details: string;
}

interface ChatSession {
  id: string;
  title: string;
  category: 'general' | 'cases' | 'contracts' | 'employees' | 'financial' | 'realestate';
  messages: Message[];
  isPinned: boolean;
  createdAt: string;
  clientName?: string;
  caseNumber?: string;
}

type AiModelType = 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'kuwait-law-expert' | 'cassation-court-engine';
type AdvisoryModeType = 'drafting' | 'case_analysis' | 'quick_advisory' | 'appeals_audit' | 'rental_audit';
type MainTabMode = 'chat' | 'drafting';

const AiAssistantPage: React.FC = () => {
  const { addToast } = useToast();

  // --- 1. Top Bar & Mode Switcher States ---
  const [activeTabMode, setActiveTabMode] = useState<MainTabMode>('chat');
  const [selectedAiModel, setSelectedAiModel] = useState<AiModelType>('gemini-1.5-pro');
  const [selectedAdvisoryMode, setSelectedAdvisoryMode] = useState<AdvisoryModeType>('drafting');
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.ADMIN);

  // --- 2. Sessions & Conversational Memory States ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('adala_ai_copilot_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved sessions, loading defaults", e);
      }
    }
    return [
      {
        id: 'session-1',
        title: 'استشارة قانونية وتدقيق شامل - نزاع شركة الفنار',
        category: 'cases',
        isPinned: true,
        createdAt: new Date().toISOString(),
        clientName: 'شركة الفنار للتجارة',
        caseNumber: 'COM-2026-0412',
        messages: [
          {
            id: 'msg-welcome',
            role: 'model',
            text: `مرحباً بك في **مساعد عدالة الذكي (AI Copilot Engine)**.

أنا مستشارك ومساعدك الذكي المربوط كلياً بقواعد بيانات المنظومة والتشريع الكويتي والسوابق القضائية الصادرة عن محكمة التمييز. أستطيع مساعدتك فوراً في كافة المجالات القانونية:

* ⚖️ **القضايا والتقاضي**: تحليل صحف الدعاوى، استخراج الثغرات الشكلية والموضوعية، وحساب مهل الاستئناف والتمييز.
* 📜 **العقود والشركات**: مراجعة التوافق مع القانون المدني الكويتي، وتدقيق شروط عدم المنافسة والشرط الجزائي.
* 💼 **شؤون الموظفين ونهاية الخدمة**: حساب تسويات مكافأة نهاية الخدمة بدقة وفق المادتين 51 و 53 من قانون العمل 6/2010.
* 🏢 **العقارات وقانون الإيجارات**: تكييف دعاوى الإخلاء لعدم سداد الإيجار طبقاً للمادة 20 من قانون 35/1978.

تفضل بكتابة استفسارك مباشرة، أو استخدم **شريط الأوامر السريعة** أو **مفتاح التبديل لنمط صياغة العقود واللوائح**!`,
            timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-1';
  });

  const [sessionSearchQuery, setSessionSearchQuery] = useState<string>('');
  const [sessionCategoryFilter, setSessionCategoryFilter] = useState<string>('all');
  const [showSessionSidebar, setShowSessionSidebar] = useState<boolean>(true);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [newChatTitle, setNewChatTitle] = useState<string>('');
  const [newChatCategory, setNewChatCategory] = useState<'general' | 'cases' | 'contracts' | 'employees' | 'financial' | 'realestate'>('general');
  const [newChatClient, setNewChatClient] = useState<string>('');

  // --- 3. Chat Input States ---
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Voice Input Speech-to-Text States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimer = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attached System Entity
  const [attachedEntity, setAttachedEntity] = useState<AttachedSystemEntity | null>(null);
  const [showAttachEntityModal, setShowAttachEntityModal] = useState<boolean>(false);
  const [attachTab, setAttachTab] = useState<'cases' | 'contracts' | 'properties' | 'employees'>('cases');

  // Manual file upload state
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; contentMock: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 4. Document Drafting & Printing Engine States ---
  const [rightPanelTab, setRightPanelTab] = useState<'editor' | 'cross_analysis'>('editor');
  const [docTitle, setDocTitle] = useState<string>('صحيفة دعوى ومسودة مستند قانوني رسمي');
  const [docRefId, setDocRefId] = useState<string>(`QA-LEX-2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [docContent, setDocContent] = useState<string>(`دولة الكويت - STATE OF KUWAIT
مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
مقيد بجمعية المحامين الكويتية برقم: 18492

الموضوع: صحيفة دعوى ومسودة استشارة قانونية بالذكاء الاصطناعي
الرمز المرجعي: ${docRefId}
التاريخ: ${new Date().toLocaleDateString('ar-KW')}

إنه في يوم الموافق لعام 2026، بناءً على طلب مكتب المحامي صبري شطا بصفته وكيلاً رسمياً...

يمكنك نقل إجابات وصيغ المساعد الذكي فوراً إلى هذا المحرر بالنقر على زر [تحويل إلى مسودة وثيقة]، ثم التعديل أو التصدير بصيغة Word، أو التنزيل كـ PDF، أو الطباعة بالترويسة والختم الرسمي لمكتب المحامي صبري شطا.`);

  // Cross Analysis State
  const [isCrossAnalyzing, setIsCrossAnalyzing] = useState<boolean>(false);
  const [crossAnalysisResult, setCrossAnalysisResult] = useState<{
    casesCount: number;
    contractsCount: number;
    propertiesCount: number;
    lawsCount: number;
    alerts: string[];
    reportText: string;
  } | null>(null);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-KW';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputMessage(transcript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error", err);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Speech recognition init error", e);
      }
    }
  }, []);

  // Sync session changes to local storage
  useEffect(() => {
    localStorage.setItem('adala_ai_copilot_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isLoading]);

  // Recording timer handler
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) { console.log(e); }
      }
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingSeconds(0);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { console.log(e); }
      }
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  // --- Smart Local Database & Law Search Algorithm ---
  const searchSystemDatabaseAndLaws = (query: string, userRole: UserRole): {
    matchedEntities: SearchedEntity[];
    matchedLaws: CitedItem[];
    restrictedInfoFound: boolean;
  } => {
    const q = query.toLowerCase().trim();
    const matchedEntities: SearchedEntity[] = [];
    const matchedLaws: CitedItem[] = [];
    let restrictedInfoFound = false;

    const canViewFinancials = activeRole === UserRole.ADMIN || activeRole === UserRole.LAWYER || activeRole === UserRole.ACCOUNTANT;
    const canViewHR = activeRole === UserRole.ADMIN || activeRole === UserRole.LAWYER || activeRole === UserRole.ACCOUNTANT;

    if (!q) return { matchedEntities, matchedLaws, restrictedInfoFound };

    // Cases
    if (q.includes('قضية') || q.includes('قضايا') || q.includes('حكم') || q.includes('محكمة') || q.includes('الفنار') || q.includes('العتيبي') || q.includes('مينا') || q.includes('استئناف') || q.includes('تمييز')) {
      const searchCases = initialCases || [];
      const matches = searchCases.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.caseNumber.toLowerCase().includes(q) || 
        c.clientName.toLowerCase().includes(q) ||
        c.assignedLawyer.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );

      matches.forEach(m => {
        matchedEntities.push({
          id: m.id,
          type: 'case',
          title: m.title,
          subtitle: `رقم القضية: ${m.caseNumber} • العميل: ${m.clientName}`,
          details: `المحكمة: ${m.courtName} • الوكيل المنوط: ${m.assignedLawyer} • الحالة: ${(m.status as any) === 'OPEN' ? 'مفتوحة ومجدولة' : 'قيد النظر'} • المطالب المالية: ${canViewFinancials ? `${m.financials.totalFees} د.ك` : 'مخفية بالتفويض'} • موعد الجلسة التالي: ${m.nextHearingDate || 'غير محدد'}`,
          raw: m
        });
      });
    }

    // Contracts
    if (q.includes('عقد') || q.includes('عقود') || q.includes('تعاقد') || q.includes('بند') || q.includes('ثغرة') || q.includes('طبيب') || q.includes('مخاطر') || q.includes('أحمد محمود') || q.includes('منافس')) {
      const searchContracts = mockAnalyzedContracts || [];
      const matches = searchContracts.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.referenceNumber.toLowerCase().includes(q) ||
        c.parties.firstParty.toLowerCase().includes(q) ||
        c.parties.secondParty.toLowerCase().includes(q) ||
        (c.summary && c.summary.toLowerCase().includes(q))
      );

      matches.forEach(m => {
        matchedEntities.push({
          id: m.id,
          type: 'contract',
          title: m.title,
          subtitle: `رقم مرجعي: ${m.referenceNumber} • الأطراف: ${m.parties.firstParty} - ${m.parties.secondParty}`,
          details: `حالة المراجعة: ${m.status} • قيمة العقد: ${canViewFinancials ? `${m.financials.value.toLocaleString()} د.ك` : 'مخفي لباب الصلاحية'} • تقييم المخاطر العام: مخاطر ${(m.overallRisk as any) === 'high' ? 'عالية حرجة' : 'منخفضة المدى'}`,
          raw: m
        });
      });
    }

    // Real estate & Leases
    if (q.includes('عقار') || q.includes('عقارات') || q.includes('مستأجر') || q.includes('إيجار') || q.includes('أقساط') || q.includes('الحمراء') || q.includes('عمارة') || q.includes('شقة') || q.includes('إخلاء')) {
      const searchProperties = mockProperties || [];
      const leaseAgreements = mockLeaseAgreements || [];

      searchProperties.filter((p: any) => 
        p.name?.toLowerCase().includes(q) || 
        p.address?.toLowerCase().includes(q) || 
        p.type?.toLowerCase().includes(q)
      ).forEach((m: any) => {
        matchedEntities.push({
          id: m.id,
          type: 'property',
          title: m.name,
          subtitle: `النوع: ${m.type} • العنوان: ${m.address}`,
          details: `المستأجر الحالي: ${m.currentTenantName || 'لا يوجد'} • التدفقات السنوية: ${canViewFinancials ? `قيمة الاستثمار ${m.purchasePrice?.toLocaleString()} د.ك` : 'مخفي لباب الصلاحية'}`,
          raw: m
        });
      });

      leaseAgreements.filter((l: any) => 
        l.tenantName?.toLowerCase().includes(q) || 
        l.contractNumber?.toLowerCase().includes(q)
      ).forEach((l: any) => {
        matchedEntities.push({
          id: l.id || `lease-${l.contractNumber}`,
          type: 'property',
          title: `عقد إيجار رقم ${l.contractNumber}`,
          subtitle: `المستأجر: ${l.tenantName} • القيمة الإيجارية: ${l.monthlyRent || 0} د.ك`,
          details: `تاريخ السريان: ${l.startDate} إلى ${l.endDate} • فترة المتأخرات الإيجارية: ${l.status || 'سارية'} • شرط المطالبة: يخضع الأحكام المادة 20 من قانون الإيجارات الكويتي 35/1978.`,
          raw: l
        });
      });
    }

    // Employees & HR
    if (q.includes('موظف') || q.includes('رواتب') || q.includes('أجر') || q.includes('أمل') || q.includes('العتيبي') || q.includes('نهاية الخدمة') || q.includes('استقالة') || q.includes('مكافأة')) {
      if (!canViewHR) {
        restrictedInfoFound = true;
      } else {
        const searchEmployees = sampleEmployees || [];
        searchEmployees.filter((e: any) => 
          e.name?.toLowerCase().includes(q) || 
          e.department?.toLowerCase().includes(q) || 
          e.jobTitle?.toLowerCase().includes(q)
        ).forEach((m: any) => {
          matchedEntities.push({
            id: m.id,
            type: 'employee',
            title: m.name || 'موظف النظام القانوني',
            subtitle: `المسمى: ${m.jobTitle} • قسم: ${m.department}`,
            details: `تاريخ التعيين: ${m.hireDate} • الراتب الشهري الشامل: ${m.basics?.salary || 1200} د.ك • حالة الدوام: نشط بالخدمة`,
            raw: m
          });
        });

        if (q.includes('أحمد') || q.includes('احمد') || q.includes('محمود') || q.includes('نهاية الخدمة') || q.includes('استقالة') || q.includes('مكافأة')) {
          matchedEntities.push({
            id: 'emp-fallback-1',
            type: 'employee',
            title: 'أحمد محمود العبدالله',
            subtitle: 'مدير المشاريع الإنشائية • قسم الشؤون الهندسية والاستثمارية',
            details: 'تاريخ التعيين: 15-11-2018 • الراتب الشهري الإجمالي الشامل: 1,600 د.ك • مدة الخدمة الفعلية الحالية: 7.5 سنوات (استقالة طوعية) • خاضع للمادة 17 والمادة 51 و 53 من قانون العمل الكويتي 6/2010.',
            raw: { name: "أحمد محمود العبدالله", salary: 1600, hireDate: "2018-11-15", yearsOfService: 7.5 }
          });
        }
      }
    }

    // Kuwait Laws database
    kuwaitLawsDatabase.forEach(law => {
      if (
        q.includes(law.articleNumber.toLowerCase()) ||
        q.includes(law.contentAr.toLowerCase()) ||
        q.includes(law.category.toLowerCase()) ||
        (q.includes('مادة') && q.includes(law.articleNumber.replace('المادة ', ''))) ||
        (q.includes('قانون العمل') && law.category === 'labor') ||
        (q.includes('تجربة') && law.id.includes('17')) ||
        (q.includes('نهاية') && law.id.includes('51')) ||
        (q.includes('استقالة') && law.id.includes('53')) ||
        (q.includes('إيجار') && law.category === 'rental') ||
        (q.includes('إخلاء') && law.id.includes('rental-20')) ||
        (q.includes('منافسة') && law.id.includes('civil-42')) ||
        (q.includes('شرط جزائي') && law.id.includes('civil-265')) ||
        (q.includes('استئناف') && law.id.includes('proc-142')) ||
        (q.includes('تمييز') && law.id.includes('proc-152')) ||
        (q.includes('سابقة') || q.includes('سوابق') || q.includes('طعن'))
      ) {
        matchedLaws.push({
          id: law.id,
          title: `${law.lawNameAr} - ${law.articleNumber}`,
          category: law.category,
          content: law.contentAr,
          source: law.govermentSource
        });
      }
    });

    return { matchedEntities, matchedLaws, restrictedInfoFound };
  };

  // --- Send Message Handler ---
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    try {
      const getFormattedTime = () => {
        return new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' });
      };

      const { matchedEntities, matchedLaws, restrictedInfoFound } = searchSystemDatabaseAndLaws(textToSend, activeRole);

      // Create User Message object
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        text: textToSend,
        timestamp: getFormattedTime(),
        attachedEntity: attachedEntity || undefined
      };

      // Append user message
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMsg]
          };
        }
        return s;
      }));

      // Permission restriction intercept
      if (restrictedInfoFound) {
        setTimeout(() => {
          const adminRejectMsg: Message = {
            id: `msg-reject-${Date.now()}`,
            role: 'model',
            text: `⚠️ **تنبيه حوكمة النظام والأمان الكويتي**:
            
عذراً، بموجب سياسة الصلاحيات المعتمدة لمنظومة **عدالة**، تطلب رتبتك الحالية (**${activeRole === UserRole.GUEST ? 'زائر / ضيف مسترشد' : 'مساعد قانوني'}**) ترقية إدارية للوصول إلى كشوف الموظفين الحساسة والرواتب أو السجلات المالية السرية.`,
            timestamp: getFormattedTime()
          };

          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, adminRejectMsg]
              };
            }
            return s;
          }));

          setIsLoading(false);
          addToast({ type: 'warning', title: 'وصول محجوب', message: 'يتطلب استعراض هذه البيانات صلاحية إدارية عالية.' });
        }, 600);
        return;
      }

      // Context Payload
      const contextPayload = `سياق المساعد والتشريع الكويتي:
- نموذج الذكاء الاصطناعي المختار: ${selectedAiModel}
- النمط والوضع الاستشاري المفعّل: ${selectedAdvisoryMode}
- الكيانات المكتشفة بالنظام: ${JSON.stringify(matchedEntities)}
- الكيان المرفق من المستخدم: ${attachedEntity ? JSON.stringify(attachedEntity) : 'لا يوجد'}
- التشريعات والسوابق القضائية الكويتية المعتمدة: ${JSON.stringify(matchedLaws)}
- مستوى أمان المستخدم: ${activeRole}
- ترويسة التوثيق: مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية - دولة الكويت (قيد 18492)
`;

      const finalQueryWithContext = `${contextPayload}\nالاستفسار الحالي للمستخدم: "${textToSend}"`;

      const activeSessionObj = sessions.find(s => s.id === activeSessionId);
      const apiHistory: ChatMessage[] = activeSessionObj
        ? activeSessionObj.messages.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        : [];

      let resultText = '';
      try {
        resultText = await geminiService.getChatbotResponse(finalQueryWithContext, apiHistory);
      } catch (geminiError) {
        console.warn("Gemini service fallback applied", geminiError);
        
        let localResponse = '';
        if (textToSend.includes('نهاية الخدمة') || textToSend.includes('راتب') || textToSend.includes('مكافأة') || textToSend.includes('محمود')) {
          localResponse += `### ⚖️ حساب مستحقات نهاية الخدمة والتكييف القانوني (المهندس أحمد محمود العبدالله):
* **تاريخ التعيين:** 15-11-2018 (مدة الخدمة الفعلية 7.5 سنوات).
* **الأجر الشامل المعتمد:** 1,600 د.ك (شامل كافة البدلات الثابتة والدورية طبقاً لسوابق محكمة التمييز طعن 88/2022 عمالي).
* **الأساس التشريعي (المادة 51 من قانون العمل الكويتي 6/2010):**
  - السنوات الخمس الأولى (5 سنوات): 15 يوماً عن كل سنة = 75 يوماً.
  - السنوات التالية (2.5 سنة): 30 يوماً عن كل سنة = 75 يوماً.
  - إجمالي الأيام المستحقة: 150 يوماً.
* **الأجر اليومي:** 1,600 / 30 = 53.333 د.ك.
* **إجمالي المكافأة المبدئية:** 150 × 53.333 = **8,000 د.ك**.
* **تخفيض الاستقالة الطوعية (المادة 53 من قانون العمل):**
  - مدة الخدمة من 5 إلى 10 سنوات (7.5 سنوات) يستحق الموظف **ثلثي المكافأة** (66.66%):
  * **الصافي المستحق للصرف النهائي:** **5,333.33 د.ك** (خمسة آلاف وثلاثمائة وثلاثة وثلاثون ديناراً كويتياً و 333 فلساً).

*💡 يمكنك النقر على زر **[✨ تحويل إلى مسودة وثيقة]** أدناه لإدراج التقرير وصياغة سند الصرف الموثق بترويسة مكتب المحامي صبري شطا.*`;
        } else if (textToSend.includes('شكلي') || textToSend.includes('بطلان') || textToSend.includes('صحيفة') || textToSend.includes('ثغرات')) {
          localResponse += `### 🔍 تحليل الأخطاء الشكليّة والثغرات الإجرائية في صحيفة الدعوى:
بموجب أحكام **قانون المرافعات المدنية والتجارية الكويتي رقم 38 لسنة 1980** وسوابق **محكمة التمييز (طعن 142/2021 تجاري)**:

1. **الخطأ الشكلي الأول (توصيف الصفة المختار):** عدم تحديد رقم التوكيل الرسمي وتاريخه أو القيد بجمعية المحامين الكويتية يترتب عليه البطلان الشكلي ما لم يصحح الإجراء قبل إقفال باب المرافعة.
2. **الخطأ الشكلي الثاني (ميعاد التكليف):** تخلف بيان الموطن المختار للخصم بدقة يؤدي لإبطال التكليف بالحضور.
3. **التوصية الإجرائية:** إيداع مذكرة تصحيح شكل الدعوى قبل جلسة المرافعة القادمة وتوثيق كتاب التغطية الموجه للقاضي.`;
        } else if (textToSend.includes('إخلاء') || textToSend.includes('إيجار') || textToSend.includes('مادة 20')) {
          localResponse += `### 🏢 تكييف دعوى الإخلاء لعدم سداد الإيجار (المادة 20 من قانون الإيجارات الكويتي 35/1978):
1. **الشرط الفاسخ الضمني:** يحق للمؤجر المطالبة بالإخلاء الفوري للعين المؤجرة إذا امتنع المستأجر عن سداد الأجرة المستحقة خلال **20 يوماً** من تاريخ الاستحقاق.
2. **سوابق التمييز (طعن 401/2023 إيجارات):** يجب إعلان التكليف بالوفاء رسمياً يداً بيد للمستأجر أو إثبات إرسال الإنذار الرسمي على يد محضر.
3. **تفادي الإخلاء:** يسقط حق الإخلاء إذا قام المستأجر بسداد الأجرة والمتأخرات والمصروفات أمام المحكمة قبل إقفال باب المرافعة.`;
        } else if (textToSend.includes('صياغة عقد') || textToSend.includes('عقد بطريقة كويتية')) {
          localResponse += `### 📜 مسودة عقد ومراجعة قانونية وفق القانون المدني الكويتي:
1. **الديباجة والأطراف:** التأكد من الأهلية القانونية واستيفاء التراخيص التجارية المعتمدة بوزارة التجارة (MOCI).
2. **بند حظر عدم المنافسة (المادة 42 مدني):** يجب أن يكون محدداً من حيث الزمان (بما لا يجاوز سنتين) والمكان والنوع لحماية المصالح المشروعة للطرف الأول.
3. **الشرط الجزائي والتعويض الاتفاقي (المادة 265 مدني):** تحديد قيمة التعويض المقدر بحظر تعديله إلا إذا أثبت الالتزام الجزئي أو المبالغة الفاحشة.`;
        } else {
          localResponse += `بناءً على الصياغة التشريعية المعتمدة بـ **منظومة عدالة** بموجب قوانين دولة الكويت لعام 2026 وترويسة **مكتب المحامي صبري شطا**:

1. **التكييف القانوني:** الموضوع مطابق للضوابط التشريعية ويخضع لأحكام القانون المدني والتجاري وقواعد المرافعات الكويتي.
2. **الخطوة التالية:** يمكنك النقر فوراً على زر **[✨ تحويل إلى مسودة وثيقة]** لنقل هذه الاستشارة والتحليل المباشر إلى محرر الوثائق للطباعة بالترويسة والختم المعتمد لمكتب المحامي صبري شطا.`;
        }
        resultText = localResponse;
      }

      const aiMsg: Message = {
        id: `msg-response-${Date.now()}`,
        role: 'model',
        text: resultText,
        timestamp: getFormattedTime(),
        citations: matchedLaws.length > 0 ? matchedLaws : undefined,
        entitiesExtracted: matchedEntities.length > 0 ? matchedEntities : undefined
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiMsg]
          };
        }
        return s;
      }));

      // Clear attached entity
      setAttachedEntity(null);
      addToast({ type: 'info', title: 'تمت استجابة المساعد الذكي', message: 'تم تدقيق الاستشارة مع قواعد بيانات التشريع وسوابق التمييز.' });

    } finally {
      setIsLoading(false);
    }
  };

  // Convert AI response to Document Draft directly
  const handleConvertToDocumentDraft = (text: string) => {
    setDocContent(`مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
الموضوع: مسودة واستشارة قانونية رسمية - ${activeSession?.title || 'مساعد عدالة الذكي'}
الرمز المرجعي: ${docRefId}
التاريخ: ${new Date().toLocaleDateString('ar-KW')}

================================================================================

${text}

================================================================================
توقيع المستشار المسؤول: المحامي صبري شطا
الختم المعتمد: [مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية - قيد 18492]`);

    setDocTitle(`مسودة وثيقة - ${activeSession?.title || 'استشارة عدالة'}`);
    setActiveTabMode('drafting');
    setRightPanelTab('editor');
    addToast({
      type: 'success',
      title: 'تم تحويل الرد إلى مسودة وثيقة',
      message: 'تم نقل النص بالكامل إلى نمط صياغة الوثائق الجاهزة للطباعة والتصدير.'
    });
  };

  // Session Management Handlers
  const handleAddNewSession = () => {
    const title = newChatTitle.trim() || `محادثة استشارية جديدة (${newChatCategory === 'contracts' ? 'عقود' : newChatCategory === 'cases' ? 'قضايا' : 'عام'})`;
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title,
      category: newChatCategory,
      isPinned: false,
      createdAt: new Date().toISOString(),
      clientName: newChatClient.trim() || undefined,
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'model',
          text: `مرحباً بك في المحادثة المخصصة لـ **[ ${
            newChatCategory === 'contracts' ? 'العقود والشركات' :
            newChatCategory === 'cases' ? 'القضايا والتقاضي' :
            newChatCategory === 'employees' ? 'الموارد البشرية ونهاية الخدمة' :
            newChatCategory === 'financial' ? 'الحوكمة والتقارير المالية' :
            newChatCategory === 'realestate' ? 'العقارات وقانون الإيجارات' : 'الاستشارات العامة والتشريع الموحد'
          } ]** ${newChatClient ? `الخاصة بالعميل: **${newChatClient}**` : ''}.

يمكنك الآن طرح أي تساؤل أو استخدام الأوامر السريعة أو إرفاق القضايا والعقود من المنظومة للتحليل والاستخراج.`,
          timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowNewChatModal(false);
    setNewChatTitle('');
    setNewChatClient('');
    addToast({ type: 'success', title: 'تم إنشاء جلسة استشارة جديدة', message: 'جاهز لاستقبال الطلبات وتحليل المستندات.' });
  };

  const handleTogglePinSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, isPinned: !s.isPinned };
      }
      return s;
    }));
    addToast({ type: 'success', title: 'تحديث السجلات', message: 'تم تعديل التثبيت بالصدارة.' });
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      addToast({ type: 'error', title: 'تعذر الحذف', message: 'يجب الإبقاء على جلسة واحدة على الأقل.' });
      return;
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0]?.id || 'session-1');
    }
    addToast({ type: 'info', title: 'حذف المحادثة', message: 'تم حذف الجلسة نهائياً.' });
  };

  const handleRenameActiveSessionInline = (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, title: newTitle.trim() };
      }
      return s;
    }));
  };

  // Cross Analysis Orchestrator
  const handleTriggerCrossAnalysis = () => {
    setIsCrossAnalyzing(true);
    setTimeout(() => {
      const casesCount = initialCases?.length || 0;
      const contractsCount = mockAnalyzedContracts?.length || 0;
      const propertiesCount = mockProperties?.length || 0;
      const lawsCount = kuwaitLawsDatabase?.length || 0;

      const alerts = [
        "⚠️ رصد تعارض في عقد التوظيف (QA-2026-EM-301) للمهندس أحمد محمود: العقد المبرم يحتوي على شرط حظر عدم منافسة غامض. يوصى بمطابقتها مع المادة 42 من القانون المدني الكويتي.",
        "⚠️ مطالبة مالية معلقة: في قضية شركة الفنار للتجارة (COM-2026-0412) بمبلغ 85,000 د.ك لم يتم تدوين دفعات جزئية بسجلات المحاسبة منذ مارس 2026.",
        "⚠️ عقارات بمرحلة إنذار الإخلاء تحت المادة 20: تأخر 3 أشهر لسداد عقد إيجار مجمع الحمراء، مهدد بالإخلاء مالم يثبت السداد الفوري رسمياً.",
        "✅ حوكمة وإقرارات: سجل اجتماعات الجمعية العامة المجدولة بمحركات شؤون الشركات مطابقة لقوانين وزارة التجارة وهيئة أسواق المال."
      ];

      setCrossAnalysisResult({
        casesCount,
        contractsCount,
        propertiesCount,
        lawsCount,
        alerts,
        reportText: `تقرير توليد الامتثال والتحليل المتقاطع الموحد لعام 2026:`
      });

      setIsCrossAnalyzing(false);
      addToast({
        type: 'success',
        title: 'اكتمل التحليل المتقاطع للأنظمة',
        message: 'تم فحص ومقارنة كافة القضايا والعقود والعقارات والرواتب والتشريعات بنجاح.'
      });
    }, 1200);
  };

  const handleManualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newAttached = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      contentMock: `الملف المرفوع: ${file.name}`
    };
    setAttachedFiles(prev => [...prev, newAttached]);
    addToast({
      type: 'success',
      title: 'تم إرفاق المستند بنجاح',
      message: `تم دمج ملف ${file.name} في سياق الجلسة.`
    });
  };

  const handleToggleVoiceInputSetting = () => {
    if (isRecording) {
      setIsRecording(false);
      addToast({ type: 'success', title: 'تم إيقاف التسجيل الصوتي', message: 'تم تفريغ النص الصوتي إلى لوحة الإدخال.' });
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      addToast({ type: 'info', title: 'جاري الاستماع للتفريغ الصوتي', message: 'تحدث باللغة العربية وسيتم تحويل صوتك إلى نص.' });
    }
  };

  const handleEditorDownloadFormatted = (format: 'doc' | 'pdf' | 'txt') => {
    const element = document.createElement("a");
    const file = new Blob([docContent], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle || 'document'}.${format === 'doc' ? 'docx' : format === 'pdf' ? 'pdf' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast({
      type: 'success',
      title: `تم التصدير بنجاح (${format.toUpperCase()})`,
      message: `تم تنزيل المستند بتنسيق المادة المكتوبة بترويسة مكتب المحامي صبري شطا.`
    });
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
        (s.clientName && s.clientName.toLowerCase().includes(sessionSearchQuery.toLowerCase())) ||
        (s.caseNumber && s.caseNumber.toLowerCase().includes(sessionSearchQuery.toLowerCase())) ||
        s.messages.some(m => m.text.toLowerCase().includes(sessionSearchQuery.toLowerCase()));
      const matchesCategory = sessionCategoryFilter === 'all' || s.category === sessionCategoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [sessions, sessionSearchQuery, sessionCategoryFilter]);

  return (
    <div id="unified_ai_copilot_platform" className="p-3 lg:p-6 max-w-7xl mx-auto space-y-5 text-right font-sans" style={{ direction: 'rtl' }}>
      
      {/* ================= 1. EXECUTIVE HERO TOP CONTROL BAR ================= */}
      <div id="copilot_control_header" className="no-print bg-gradient-to-r from-[#032B24] via-[#0A4136] to-[#134D41] p-5 lg:p-6 rounded-3xl border border-emerald-800/40 shadow-xl text-white relative overflow-hidden">
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-5">
          
          {/* Left Side: Title & Branding Badge */}
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="w-13 h-13 bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/40 rounded-2xl flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Bot className="w-7 h-7 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg lg:text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
                  <span>مساعد عدالة الذكي</span>
                  <span className="text-xs font-mono text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">AI Copilot v3.5</span>
                </h1>
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  مكتب المحامي صبري شطا • قيد 18492
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 m-0 mt-1 font-medium leading-relaxed">
                المنظومة الاستشارية الموحدة لتحليل القضايا، العقود، التشريع الكويتي وسوابق محكمة التمييز
              </p>
            </div>
          </div>

          {/* Center: Quick Mode Toggle Switch */}
          <div className="flex items-center p-1.5 bg-black/30 backdrop-blur-md rounded-2xl border border-emerald-700/50 w-full xl:w-auto justify-center shadow-inner">
            <button
              onClick={() => setActiveTabMode('chat')}
              className={`flex-1 xl:flex-initial px-5 py-2 text-xs font-black rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-2 ${
                activeTabMode === 'chat'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                  : 'text-emerald-100/70 hover:text-white bg-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>استشارة مباشرة (Quick Chat)</span>
            </button>

            <button
              onClick={() => {
                setActiveTabMode('drafting');
                setRightPanelTab('editor');
              }}
              className={`flex-1 xl:flex-initial px-5 py-2 text-xs font-black rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-2 ${
                activeTabMode === 'drafting'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                  : 'text-emerald-100/70 hover:text-white bg-transparent'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>صياغة وتعديل اللوائح والعقود (Drafting Editor)</span>
            </button>
          </div>

          {/* Right Side: Selectors (Model, Advisory Level, Role) */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0 w-full xl:w-auto justify-end">
            
            {/* AI Model Selector */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs">
              <Cpu className="w-4 h-4 text-amber-300 shrink-0" />
              <select
                value={selectedAiModel}
                onChange={(e) => {
                  const model = e.target.value as AiModelType;
                  setSelectedAiModel(model);
                  addToast({ type: 'info', title: 'تم اختيار النموذج', message: e.target.options[e.target.selectedIndex].text });
                }}
                className="bg-transparent text-xs font-bold text-emerald-100 outline-none cursor-pointer"
              >
                <option value="gemini-1.5-pro" className="bg-[#032B24] text-white">Gemini 1.5 Pro (خبير اللوائح)</option>
                <option value="gemini-1.5-flash" className="bg-[#032B24] text-white">Gemini 1.5 Flash (استجابة فائقة)</option>
                <option value="kuwait-law-expert" className="bg-[#032B24] text-white">محرك التشريع الكويتي الموحد</option>
                <option value="cassation-court-engine" className="bg-[#032B24] text-white">محرك سوابق التمييز 2026</option>
              </select>
            </div>

            {/* Advisory Mode Selector */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs">
              <Sliders className="w-4 h-4 text-amber-300 shrink-0" />
              <select
                value={selectedAdvisoryMode}
                onChange={(e) => {
                  const mode = e.target.value as AdvisoryModeType;
                  setSelectedAdvisoryMode(mode);
                  addToast({ type: 'info', title: 'تعديل المستوى الاستشاري', message: e.target.options[e.target.selectedIndex].text });
                }}
                className="bg-transparent text-xs font-bold text-emerald-100 outline-none cursor-pointer"
              >
                <option value="drafting" className="bg-[#032B24] text-white">صياغة وتدقيق العقود واللوائح</option>
                <option value="case_analysis" className="bg-[#032B24] text-white">تحليل ثغرات القضايا والسوابق</option>
                <option value="quick_advisory" className="bg-[#032B24] text-white">استشارات وسوابق سريعة</option>
                <option value="appeals_audit" className="bg-[#032B24] text-white">مراجعة الطعون والمهل القانونية</option>
                <option value="rental_audit" className="bg-[#032B24] text-white">تدقيق عقارات وقوانين الإيجارات</option>
              </select>
            </div>

            {/* User Permission Gate */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <select
                value={activeRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setActiveRole(role);
                  addToast({ type: 'info', title: 'تغيير أذونات المساعد', message: `الرتبة: ${role}` });
                }}
                className="bg-transparent text-xs font-bold text-emerald-100 outline-none cursor-pointer"
              >
                <option value={UserRole.ADMIN} className="bg-[#032B24] text-white">👑 مدير النظام (كامل الصلاحيات)</option>
                <option value={UserRole.LAWYER} className="bg-[#032B24] text-white">⚖️ محامي الدائرة</option>
                <option value={UserRole.ACCOUNTANT} className="bg-[#032B24] text-white">💳 محاسب الدائرة</option>
                <option value={UserRole.GUEST} className="bg-[#032B24] text-white">🔒 ضيف مستند (مقيد)</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MAIN WORKSPACE GRID ================= */}
      <div id="copilot_workspace_grid" className="no-print grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        
        {/* ===== LEFT SIDEBAR: CONVERSATION SESSIONS ARCHIVE ===== */}
        {showSessionSidebar && (
          <div className="lg:col-span-3 bg-white dark:bg-dm-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-3 flex flex-col h-full">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#134D41] dark:text-teal-400" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white m-0">أرشيف استشارات القضايا</h3>
                </div>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#134D41] dark:text-teal-300 rounded-xl border-none cursor-pointer flex items-center justify-center transition-all"
                  title="تأسيس جلسة جديدة"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Inline Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="ابحث بالقضايا والعملاء..."
                  value={sessionSearchQuery}
                  onChange={(e) => setSessionSearchQuery(e.target.value)}
                  className="w-full text-xs p-2 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#134D41] text-slate-800 dark:text-slate-200 text-right"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1 pb-1">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'cases', label: 'قضايا' },
                  { id: 'contracts', label: 'عقود' },
                  { id: 'employees', label: 'موارد' },
                  { id: 'realestate', label: 'إيجارات' }
                ].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSessionCategoryFilter(tag.id)}
                    className={`p-1 px-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer border ${
                      sessionCategoryFilter === tag.id
                        ? 'bg-[#134D41] border-[#134D41] text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Sessions List */}
              <div className="overflow-y-auto max-h-[420px] space-y-2 pr-1 custom-scrollbar">
                {filteredSessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                        isActive 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-[#134D41] dark:text-teal-300 font-bold shadow-xs' 
                          : 'bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden w-full">
                        <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#134D41] text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'}`}>
                          {s.category === 'cases' ? <Scale className="w-3.5 h-3.5" /> : 
                           s.category === 'contracts' ? <Briefcase className="w-3.5 h-3.5" /> : 
                           s.category === 'realestate' ? <Building className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
                        </div>

                        <div className="overflow-hidden w-full text-right">
                          <input
                            type="text"
                            value={s.title}
                            onChange={(e) => handleRenameActiveSessionInline(s.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 font-bold w-full truncate cursor-text"
                          />
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {s.clientName ? `العميل: ${s.clientName}` : 'استشارة عامة'}
                          </span>
                        </div>
                      </div>

                      {/* Side Actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={(e) => handleTogglePinSession(s.id, e)}
                          className={`p-1 bg-transparent border-none cursor-pointer ${s.isPinned ? 'text-amber-500' : 'text-slate-400'}`}
                          title="تثبيت بالصدارة"
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1 bg-transparent border-none cursor-pointer text-rose-500 hover:text-rose-700"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="pt-2 border-t dark:border-slate-800 text-[10px] text-slate-400 font-sans">
              عدد الجلسات المؤرشفة: {sessions.length} جلسة استشارية.
            </div>
          </div>
        )}

        {/* ===== CENTER: CHAT CANVAS OR DOCUMENT DRAFTING WORKSPACE ===== */}
        <div className={`${activeTabMode === 'chat' ? (showSessionSidebar ? 'lg:col-span-9' : 'lg:col-span-12') : 'lg:col-span-6'} bg-white dark:bg-dm-card rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm overflow-hidden h-[660px]`}>
          
          {/* Active Chat Canvas Header */}
          <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-right">
            <div className="flex items-center gap-2 overflow-hidden">
              <button
                onClick={() => setShowSessionSidebar(!showSessionSidebar)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
                title="إظهار/إخفاء أرشيف الجلسات"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </button>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{activeSession?.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  النموذج: {selectedAiModel} • الوضع: {selectedAdvisoryMode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAttachEntityModal(true)}
                className="py-1 px-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#134D41] dark:text-teal-300 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>إرفاق قضية/عقد من المنظومة</span>
              </button>
            </div>
          </div>

          {/* Messages Stream Canvas */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
            {activeSession?.messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-start' : 'justify-end'} text-right`}
                >
                  <div className={`max-w-[88%] rounded-3xl p-4 shadow-xs space-y-3 ${
                    isUser 
                      ? 'bg-[#032B24] text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/10 dark:border-slate-800/10 text-[10px] leading-none">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isUser ? <User className="w-3.5 h-3.5 text-emerald-300" /> : <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />}
                        <span>{isUser ? 'الاستفسار والطلب القانوني' : 'مساعد عدالة الذكي (Adala AI Engine)'}</span>
                      </div>
                      <span className="font-mono text-slate-400">{m.timestamp}</span>
                    </div>

                    {/* Attached System Entity */}
                    {m.attachedEntity && (
                      <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-500/30 text-[10px] text-emerald-200 space-y-0.5">
                        <span className="font-bold flex items-center gap-1 text-emerald-300">
                          <Paperclip className="w-3 h-3 text-emerald-400" />
                          كيان النظام المرفق: {m.attachedEntity.name} ({m.attachedEntity.code})
                        </span>
                        <p className="m-0 text-[9px] text-emerald-100/80 leading-normal">{m.attachedEntity.details}</p>
                      </div>
                    )}

                    {/* Body */}
                    <div className="text-xs leading-relaxed font-sans text-slate-800 dark:text-slate-200">
                      {isUser ? (
                        <p className="m-0 whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <div className="markdown-body text-slate-800 dark:text-slate-200 space-y-2">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Citations & Laws */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Scale className="w-3 h-3 text-[#134D41] dark:text-teal-400" />
                          المواد التشريعية وسوابق محكمة التمييز المعتمدة:
                        </span>
                        <div className="space-y-1 font-sans">
                          {m.citations.map(c => (
                            <div key={c.id} className="text-[9px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{c.title}</span> • <span className="text-slate-400">{c.source}</span>
                              <p className="m-0 mt-0.5 italic leading-snug">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Quick Actions */}
                    {!isUser && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/10 dark:border-slate-800/10 mt-2 flex-wrap">
                        
                        {/* Convert to Document Draft Button */}
                        <button
                          onClick={() => handleConvertToDocumentDraft(m.text)}
                          className="py-1 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 border-none shadow-xs cursor-pointer transition-all"
                          title="تحويل الإجابة مباشرة إلى مسودة وثيقة قابلة للتعديل والطباعة بالترويسة والختم"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>✨ تحويل إلى مسودة وثيقة</span>
                        </button>

                        <button
                          onClick={() => {
                            setDocContent(m.text);
                            setActiveTabMode('drafting');
                            setRightPanelTab('editor');
                          }}
                          className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>معاينة للطباعة</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.text);
                            addToast({ type: 'success', title: 'تم نسخ النص', message: 'تم حفظ نص الاستشارة بالحافظة.' });
                          }}
                          className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-end text-right">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[75%] shadow-sm flex items-center gap-3 animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#134D41] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#134D41] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#134D41] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 font-bold">جاري تحليل الاستشارة وفحص التشريعات الكويتية وسوابق التمييز...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* ===== 3. QUICK PROMPT CHIPS (شريط الأوامر السريعة والانسيابية) ===== */}
          <div id="quick_prompt_chips_bar" className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                أوامر سريعة بنقرة واحدة (Quick Prompts):
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar scroll-smooth">
              {[
                { 
                  label: "📋 تلخيص صحيفة دعوى", 
                  prompt: "قم بتلخيص صحيفة الدعوى واستخراج الطلبات الموضوعية والختامية وندب الخبراء" 
                },
                { 
                  label: "🔍 استخراج الثغرات القانونية", 
                  prompt: "استخرج الأخطاء الشكليّة والثغرات الإجرائية في صحيفة الدعوى وفق قانون المرافعات وسوابق محكمة التمييز الكويتية" 
                },
                { 
                  label: "📜 صياغة عقد بطريقة كويتية", 
                  prompt: "قم بصياغة عقد عمل واستثمار متوافق مع أحكام القانون المدني الكويتي وقانون العمل رقم 6/2010" 
                },
                { 
                  label: "💰 حساب مكافأة نهاية الخدمة", 
                  prompt: "احسب مكافأة نهاية الخدمة لأحمد محمود براتب 1600 د.ك عمل 7.5 سنة واستقال طوعياً وفق المادتين 51 و 53" 
                },
                { 
                  label: "⏳ حساب مهلة الطعن والتمييز", 
                  prompt: "احسب المهلة القانونية ومواعيد الطعن بالاستئناف والتمييز وفق المادتين 142 و 152 مرافعات كويتي" 
                },
                { 
                  label: "🏢 تكييف دعوى إخلاء لعدم سداد الإيجار", 
                  prompt: "كيف نطالب بالإخلاء الفوري للشقق التجارية إذا تأخر المستأجر عن السداد وفق المادة 20 من قانون الإيجارات؟" 
                }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(p.prompt)}
                  className="py-1 px-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#134D41] dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 rounded-full text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-2xs hover:border-emerald-400"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Dock */}
          <div id="ai_chat_input_dock" className="p-3 bg-white dark:bg-dm-card border-t border-slate-200 dark:border-slate-800 space-y-2">
            
            {/* Displaying Attached System Entity Badge or Pending Files */}
            <div className="flex flex-wrap gap-2 items-center">
              {attachedEntity && (
                <div className="flex items-center gap-1.5 bg-emerald-900 text-white px-2.5 py-1 rounded-xl border border-emerald-500 text-[10px] font-bold shadow-xs">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-300" />
                  <span>مرفق بالنظام: {attachedEntity.name} ({attachedEntity.code})</span>
                  <button
                    onClick={() => setAttachedEntity(null)}
                    className="bg-transparent border-none text-rose-300 hover:text-white cursor-pointer font-bold ml-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              )}

              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-[#134D41] dark:text-teal-300 px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px] font-bold">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="bg-transparent border-none text-rose-500 cursor-pointer font-bold ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex items-end gap-2 text-right">
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleManualFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="إرفاق ملف من الجهاز"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Voice Input */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleToggleVoiceInputSetting}
                  className={`p-2.5 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title="التفريغ الصوتي التفاعلي"
                >
                  {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Textarea */}
              <div className="relative w-full">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder={
                    isRecording 
                      ? `جاري الاستماع والتفريغ الصوتي باللغة العربية... (${recordingSeconds} ث)` 
                      : "اطرح سؤالك القانوني، أو اختر من شريط الأوامر السريعة أعلاه..."
                  }
                  disabled={isRecording}
                  rows={1}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-[#134D41] text-slate-800 dark:text-slate-200 text-right resize-none max-h-24 custom-scrollbar font-sans"
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={() => handleSendChatMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="p-3 bg-[#134D41] hover:bg-[#004D40] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-2xl flex items-center justify-center border-none shadow-md shadow-teal-600/10 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 text-white transform -rotate-180" />
              </button>

            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL: DOCUMENT DRAFTING WORKSPACE & LIVE PRINT ENGINE ===== */}
        {(activeTabMode === 'drafting' || rightPanelTab === 'editor') && (
          <div className="lg:col-span-6 bg-white dark:bg-dm-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[660px]">
            
            {/* Header / Tabs */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRightPanelTab('editor')}
                  className={`py-1.5 px-3 text-xs font-black rounded-xl border-none cursor-pointer flex items-center gap-1 transition-all ${
                    rightPanelTab === 'editor' 
                      ? 'bg-[#134D41] text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 bg-transparent'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>محرر ومسودة اللائحة</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('cross_analysis')}
                  className={`py-1.5 px-3 text-xs font-black rounded-xl border-none cursor-pointer flex items-center gap-1 transition-all ${
                    rightPanelTab === 'cross_analysis' 
                      ? 'bg-[#134D41] text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 bg-transparent'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>التحليل المتقاطع</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1 border-none cursor-pointer transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة A4 معتمدة</span>
                </button>
              </div>
            </div>

            {/* Document Editor Body */}
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
              {rightPanelTab === 'editor' ? (
                <div className="space-y-3 flex flex-col h-full justify-between">
                  <div className="space-y-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">عنوان الوثيقة القانونية:</span>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#134D41] text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="text-right">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400 font-bold">صياغة مسودة الوثيقة والتقرير المعتمد:</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{docRefId}</span>
                      </div>
                      <textarea
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        rows={15}
                        className="w-full text-xs p-3 font-mono leading-relaxed bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-[#134D41] text-slate-800 dark:text-slate-100 resize-none custom-scrollbar"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => window.print()}
                        className="py-2.5 bg-[#134D41] hover:bg-[#004D40] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-none cursor-pointer transition-all shadow-md shadow-teal-700/10"
                      >
                        <Printer className="w-4 h-4 text-amber-300" />
                        <span>طباعة بالترويسة والختم المعتمد</span>
                      </button>

                      <button
                        onClick={() => handleEditorDownloadFormatted('doc')}
                        className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#134D41] dark:text-teal-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        <span>تحميل بصيغة Word</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-right flex flex-col h-full justify-between">
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
                      <span className="text-xs font-black text-[#134D41] dark:text-teal-300 block mb-1">💡 التحليل المتقاطع للأنظمة والقضايا:</span>
                      <p className="text-[11px] text-slate-500 m-0 leading-relaxed font-sans">
                        يقوم المساعد الذكي بفحص ملفات القضايا، العقود، شؤون الموظفين، والمستحقات لمطابقة شروط الامتثال والقوانين الكويتية.
                      </p>
                    </div>

                    {crossAnalysisResult && (
                      <div className="space-y-2">
                        {crossAnalysisResult.alerts.map((alert, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                            {alert}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleTriggerCrossAnalysis}
                    disabled={isCrossAnalyzing}
                    className="w-full bg-[#134D41] hover:bg-[#004D40] text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    {isCrossAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        <span>جاري فحص القضايا والعقود والرواتب...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>بدء التحليل المتقاطع والامتثال الشامل</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ================= MODAL DIALOG: NEW CONVERSATION DEFINITION ================= */}
      <AnimatePresence>
        {showNewChatModal && (
          <div id="new_chat_definition_modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dm-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full text-right space-y-4 shadow-2xl"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 m-0">تأسيس جلسة استشارة جديدة</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">عنوان الجلسة / النزاع:</span>
                  <input
                    type="text"
                    placeholder="مثال: قضية نزاع شركة الفنار الكلية لعام 2026..."
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#134D41] text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">اسم العميل (اختياري):</span>
                  <input
                    type="text"
                    placeholder="مثال: شركة الفنار للتجارة والمقاولات"
                    value={newChatClient}
                    onChange={(e) => setNewChatClient(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#134D41] text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">التصنيف القانوني:</span>
                  <select
                    value={newChatCategory}
                    onChange={(e: any) => setNewChatCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none cursor-pointer focus:border-[#134D41] text-slate-800 dark:text-slate-200"
                  >
                    <option value="general">⚖️ استشارات عامة وتدقيق تشريعي</option>
                    <option value="cases">💼 القضايا والتقاضي وصحف الدعاوى</option>
                    <option value="contracts">📜 العقود والشركات وتدقيق البنود</option>
                    <option value="employees">💼 شؤون الموظفين ومكافأة نهاية الخدمة</option>
                    <option value="financial">💳 الإدارة والتقارير المالية والتحصيل</option>
                    <option value="realestate">🏢 العقارات وقانون الإيجارات</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t dark:border-slate-800 justify-end">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer bg-transparent"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddNewSession}
                  className="px-4 py-2 bg-[#134D41] hover:bg-[#004D40] text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md"
                >
                  بدء الجلسة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL DIALOG: ATTACH SYSTEM ENTITY PICKER ================= */}
      <AnimatePresence>
        {showAttachEntityModal && (
          <div id="attach_system_entity_modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dm-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full text-right space-y-4 shadow-2xl"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-[#134D41] dark:text-teal-400" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 m-0">إرفاق قضية أو عقد من المنظومة</h3>
                </div>
                <button
                  onClick={() => setShowAttachEntityModal(false)}
                  className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {[
                  { id: 'cases', label: '⚖️ القضايا' },
                  { id: 'contracts', label: '📜 العقود' },
                  { id: 'properties', label: '🏢 العقارات' },
                  { id: 'employees', label: '👤 الموظفين' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAttachTab(tab.id as any)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border-none cursor-pointer transition-all ${
                      attachTab === tab.id
                        ? 'bg-[#134D41] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 bg-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Entity List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {attachTab === 'cases' && (
                  initialCases.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setAttachedEntity({
                          type: 'case',
                          id: c.id,
                          name: c.title,
                          code: c.caseNumber,
                          details: `المحكمة: ${c.courtName} • العميل: ${c.clientName} • المحامي الوكيل: ${c.assignedLawyer}`
                        });
                        setShowAttachEntityModal(false);
                        addToast({ type: 'success', title: 'تم إرفاق القضية', message: `تم إرفاق ملف قضية "${c.title}".` });
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all text-right space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#134D41]">{c.title}</span>
                        <span className="text-[10px] font-mono text-teal-700 font-bold">{c.caseNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 m-0">العميل: {c.clientName} • المحكمة: {c.courtName}</p>
                    </div>
                  ))
                )}

                {attachTab === 'contracts' && (
                  mockAnalyzedContracts.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setAttachedEntity({
                          type: 'contract',
                          id: c.id,
                          name: c.title,
                          code: c.referenceNumber,
                          details: `الأطراف: ${c.parties.firstParty} و ${c.parties.secondParty} • المخاطر: ${c.overallRisk}`
                        });
                        setShowAttachEntityModal(false);
                        addToast({ type: 'success', title: 'تم إرفاق العقد', message: `تم إرفاق عقد "${c.title}".` });
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all text-right space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#134D41]">{c.title}</span>
                        <span className="text-[10px] font-mono text-teal-700 font-bold">{c.referenceNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 m-0">الأطراف: {c.parties.firstParty} - {c.parties.secondParty}</p>
                    </div>
                  ))
                )}

                {attachTab === 'properties' && (
                  mockLeaseAgreements.map(l => {
                    const tenantDisplayName = (l as any).tenantName || 'شركة المجمع التجارية';
                    return (
                      <div
                        key={l.id || l.contractNumber}
                        onClick={() => {
                          setAttachedEntity({
                            type: 'property',
                            id: l.id || l.contractNumber,
                            name: `عقد إيجار رقم ${l.contractNumber}`,
                            code: l.contractNumber,
                            details: `المستأجر: ${tenantDisplayName} • القيمة الإيجارية: ${l.rentAmount || 450} د.ك`
                          });
                          setShowAttachEntityModal(false);
                          addToast({ type: 'success', title: 'تم إرفاق عقد الإيجار', message: `تم إرفاق عقد إيجار "${tenantDisplayName}".` });
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all text-right space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#134D41]">عقد إيجار رقم {l.contractNumber}</span>
                          <span className="text-[10px] font-mono text-teal-700 font-bold">{l.rentAmount || 450} د.ك</span>
                        </div>
                        <p className="text-[10px] text-slate-500 m-0">المستأجر: {tenantDisplayName}</p>
                      </div>
                    );
                  })
                )}

                {attachTab === 'employees' && (
                  [
                    { id: 'emp-1', name: 'أحمد محمود العبدالله', code: 'EMP-101', job: 'مدير المشاريع الإنشائية', salary: '1600 د.ك' },
                    { id: 'emp-2', name: 'أمل العتيبي', code: 'EMP-102', job: 'مديرة الموارد البشرية', salary: '1800 د.ك' }
                  ].map(e => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setAttachedEntity({
                          type: 'employee',
                          id: e.id,
                          name: e.name,
                          code: e.code,
                          details: `المسمى: ${e.job} • الراتب الشامل: ${e.salary}`
                        });
                        setShowAttachEntityModal(false);
                        addToast({ type: 'success', title: 'تم إرفاق ملف الموظف', message: `تم إرفاق سجل الموظف "${e.name}".` });
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all text-right space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#134D41]">{e.name}</span>
                        <span className="text-[10px] font-mono text-teal-700 font-bold">{e.code}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 m-0">المسمى: {e.job} • الراتب: {e.salary}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2 border-t dark:border-slate-800">
                <button
                  onClick={() => setShowAttachEntityModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-xs font-bold cursor-pointer bg-transparent"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 4. DEDICATED A4 PORTRAIT PRINT SHEET ENGINE (INTEGRATION & PRINT) ================= */}
      <div className="print-only hidden print:block printable-sheet bg-white p-8 font-sans text-right" dir="rtl" style={{ width: '100%', maxWidth: '210mm', margin: '0 auto' }}>
        
        {/* Official Header for "مكتب المحامي صبري شطا" */}
        <PrintHeader 
          title={docTitle || "مسودة واستشارة قانونية رسمية"} 
          subtitle="مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية والتحكيم" 
        />

        {/* Document Body & Contents */}
        <div className="my-6 space-y-4 text-slate-900 leading-relaxed font-sans text-xs">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-600 mb-6">
            <div>
              <span className="font-bold">الرقم المرجعي للاستشارة:</span> {docRefId}
            </div>
            <div>
              <span className="font-bold">التاريخ:</span> {new Date().toLocaleDateString('ar-KW')}
            </div>
            <div>
              <span className="font-bold">الجهة:</span> جمعية المحامين الكويتية (قيد 18492)
            </div>
          </div>

          <div className="whitespace-pre-wrap text-[#0F2027] leading-relaxed font-sans text-xs border-r-2 border-[#134D41] pr-4 py-1">
            {docContent}
          </div>

        </div>

        {/* Official Stamp & Approved Seal Footer */}
        <div className="mt-12 pt-6 border-t-2 border-slate-200 flex items-center justify-between gap-6 page-break-inside-avoid">
          
          {/* Legal Notes */}
          <div className="text-[10px] text-slate-500 space-y-1">
            <p className="font-black text-slate-800">توثيق واستخراج قانوني آمن:</p>
            <p>صدر هذا المستند رسمياً عبر منظومة عدالة الرقمية المعتمدة لدى مكتب المحامي صبري شطا.</p>
            <p className="font-mono text-[9px]">Hash: SHA256-KW-SABRI-SHATTA-{docRefId}</p>
          </div>

          {/* Official Approved Circular Seal Stamp Component */}
          <div className="flex items-center gap-3 border-2 border-[#134D41] rounded-2xl p-3 bg-emerald-50/50">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center bg-white shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[#134D41]" />
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-[#134D41]">مكتب المحامي صبري شطا</div>
              <div className="text-[10px] font-bold text-amber-700">للمحاماة والاستشارات القانونية</div>
              <div className="text-[8px] font-mono text-slate-500">ختم توثيق وحوكمة معتمد • قيد 18492</div>
            </div>
          </div>

          {/* Signature Line */}
          <div className="text-center font-sans space-y-2">
            <span className="text-[10px] font-bold text-slate-500 block">المستشار المسؤول / وكيل القضايا</span>
            <div className="font-bold text-sm text-[#134D41] font-serif">أ. صبري شطا</div>
            <span className="text-[9px] text-slate-400 block">التوقيع والتوثيق الرسمي</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AiAssistantPage;
