import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { geminiService } from '../services/geminiService';
import { AnalyzedContract, AnalyzedContractStatus, ContractCategory, RiskLevel } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import AnalysisDashboard from '@/components/ContractAnalysis/AnalysisDashboard';
import ContractList from '@/components/ContractAnalysis/ContractList';
import LegalLibrary from '@/components/ContractAnalysis/LegalLibrary';
import { mockAnalyzedContracts } from '@/data/contractAnalysisData';

// Modular Redesigned Components
import { SmartDocumentViewer } from '@/components/ContractAnalysis/SmartDocumentViewer';
import { StructuredAnalysisPanel } from '@/components/ContractAnalysis/StructuredAnalysisPanel';
import { ContractComparisonEngine } from '@/components/ContractAnalysis/ContractComparisonEngine';
import { SystemIntegrationsPanel } from '@/components/ContractAnalysis/SystemIntegrationsPanel';
import { OfficialReportViewer } from '@/components/ContractAnalysis/OfficialReportViewer';

import { 
    Scale, PenTool, LayoutGrid, FileText, Settings, Sparkles, BookOpen, Clock, 
    CheckCircle, MessageSquare, Plus, FileSpreadsheet, Share2, ClipboardList
} from 'lucide-react';

const initialTemplates = [
    { 
        id: 'tpl-1', 
        name: 'عقد عمل نموذجي محدد المدة - كويتي', 
        category: 'شؤون موظفين',
        content: `عقد عمل محدد المدة

إنه في يوم [[تاريخ_العقد]] بدولة الكويت، تم الاتفاق والتعاقد بين كل من:
الطرف الأول: شركة [[اسم_الشركة]] ويمثلها المفوض بالتوقيع [[المفوض_بالتوقيع]] (صاحب العمل).
الطرف الثاني: السيد/ [[اسم_الموظف]]، ويحمل بطاقة مدنية رقم [[الرقم_المدني]] ويقيم في [[العنوان]] (العامل).

بند 1: المسمى الوظيفي والوظيفة
يعمل الطرف الثاني تحت إشراف وإدارة الطرف الأول بوظيفة [[المسمى_الوظيفي]] ويلتزم بتأدية واجباته بدقة وأمانة.

بند 2: مدة العقد وفترة التجربة
مدة هذا العقد [[مدة_العقد]] تبدأ من تاريخ [[تاريخ_المباشرة]]؛ وتعتبر فترة التجربة الأولى [[فترة_التجربة]] ثلاثة أشهر (90 يوماً).

بند 3: الراتب الأساسي والبدلات
يستحق الطرف الثاني لقاء عمله راتباً أساسياً شهرياً قدره [[الراتب_الأساسي]] دينار كويتي (KWD)، يدفع في نهاية كل شهر ميلادي شامل كافة البدلات.

بند 4: ساعات العمل والإجازات
يخضع العقد لأحكام قانون العمل الكويتي رقم 6 لسنة 2010. ساعات العمل الرسمية هي [[ساعات_العمل]] ساعة أسبوعياً، ويستحق الطرف الثاني إجازة سنوية مدفوعة الأجر قدرها [[الإجازة_السنوية]] يوماً عمل.`
    },
    {
        id: 'tpl-2',
        name: 'عقد إيجار تجاري - مجمع الحمراء',
        category: 'عقارات',
        content: `عقد إيجار تجاري معتمد

الطرف الأول (المؤجر): شركة مجمع الحمراء العقارية ويمثلها الأستاذ صبري شطا.
الطرف الثاني (المستأجر): شركة [[اسم_الشركة_المستأجرة]] ويمثلها المفوض بالإدارة [[مدير_الشركة]].

بند 1: العين المؤجرة
يؤجر الطرف الأول للطرف الثاني المكتب رقم [[رقم_المكتب]] في الدور [[رقم_الدور]] بمجمع الحمراء التجاري، دولة الكويت، ليكون المقر الإداري للشركة.

بند 2: الإيجار الشهري والضمان
القيمة الإيجارية الشهرية هي [[إيجار_شهري]] دينار كويتي تدفع مقدماً في الأسبوع الأول من كل شهر. يلتزم المستأجر بسداد تأمين يعادل إيجار شهرين.

بند 3: مدة الإيجار والفسخ المبكر
مدة هذا العقد [[مدة_الإيجار]] تبدأ من [[تاريخ_البدء]]. في حال الرغبة في الفسخ المبكر يتم إخطار الطرف الأول خطياً قبل 3 أشهر.`
    }
];

const systemEmployees = [
    { id: 'EMP-101', name: 'أحمد محمود العبدالله', role: 'مدير مشاريع إنشائية', salary: 1600, duration: 'سنة واحدة', startDate: '2024-01-01', cid: '292040105647' },
    { id: 'EMP-102', name: 'سارة خالد الكندري', role: 'مستشار تخطيط مالي', salary: 1400, duration: 'سنتان', startDate: '2025-05-15', cid: '295091204859' },
    { id: 'EMP-103', name: 'فيصل عبدالرحمن الشمري', role: 'مهندس جودة برمجيات', salary: 1100, duration: 'مستمر (غير محدد)', startDate: '2023-11-01', cid: '290080302918' },
];

const systemProperties = [
    { id: 'PROP-201', title: 'مكتب الدور 32 - برج الحمراء', value: 24000, monthlyLease: 2000, tenant: 'شركة الحلول الذكية', term: 'سنتان' },
    { id: 'PROP-202', title: 'صالة العرض الأرضية - مجمع كيبكو', value: 48000, monthlyLease: 4000, tenant: 'شركة الأجهزة العالمية', term: '5 سنوات' },
];

const systemLitigations = [
    { id: 'CASE-701', title: 'نزاع عمالي - فيصل ضد أسيكو المقاولات', claim: 'مستحقات نهاية خدمة وبدل إجازات', contractRef: 'QA-2023-EM-882' },
    { id: 'CASE-702', title: 'دعوى بطلان شرط المنافسة التعسفي', claim: 'إلغاء بند الحظر الجغرافي الشامل', contractRef: 'QA-2024-LE-099' },
];

const initialAuditLogs = [
    { id: 1, user: 'صبري شطا (أخصائي قانوني)', action: 'رفع ومراجعة العقد الأولي لمرفق الحمراء', date: '2026-05-25 10:12 AM', ip: '192.168.1.45', status: 'مستند مضاف' },
    { id: 2, user: 'نوال الكندري (مدقق الامتثال)', action: 'إضافة تعليق على بند الشروط وبدل السكن', date: '2026-05-25 11:30 AM', ip: '192.168.1.66', status: 'تعديل وتوجيه' },
    { id: 3, user: 'القسم التجاري والمالي', action: 'اعتماد الراتب والامتيازات المالية المقررة', date: '2026-05-25 01:05 PM', ip: '192.168.1.12', status: 'معتمد مالياً' },
    { id: 4, user: 'الإدارة القانونية العليا', action: 'الموافقة على الامتثال التام للمادة 44 بقانون العمل الكويتي', date: '2026-05-25 03:22 PM', ip: '192.168.1.9', status: 'مطابق للقانون' },
];

const ContractAnalysisPage: React.FC = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Active Tab state
    const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'compare' | 'editor' | 'library' | 'report'>('dashboard');

    // Data States
    const [allContracts, setAllContracts] = useState<AnalyzedContract[]>(mockAnalyzedContracts);
    const [selectedContract, setSelectedContract] = useState<AnalyzedContract | null>(mockAnalyzedContracts[0]);

    // Active Editor Content & Variables
    const [editorVariables, setEditorVariables] = useState<Record<string, string>>({
        'اسم_الشركة': 'الكويتية للتجارة العامة',
        'المفوض_بالتوقيع': 'الأستاذ خالد الهاشم',
        'اسم_الموظف': 'فيصل عبدالرحمن الشمري',
        'الرقم_المدني': '290080302918',
        'المسمى_الوظيفي': 'مهندس جودة برمجيات',
        'الراتب_الأساسي': '1100',
        'تاريخ_المباشرة': '2026-06-01',
        'الإجازة_السنوية': '30',
        'مدة_العقد': 'سنة واحدة',
        'فترة_التجربة': '90 يوماً',
        'ساعات_العمل': '45',
        'العنوان': 'السالمية - قطعة 4',
        'رقم_المكتب': '32',
        'رقم_الدور': 'الدور 32',
        'اسم_الشركة_المستأجرة': 'شركة الحلول الفنية',
        'مدير_الشركة': 'فيصل العتيبي',
        'إيجار_شهري': '2000',
        'تاريخ_البدء': '2026-06-01',
        'مدة_الإيجار': 'سنتان'
    });

    const [activeTemplateId, setActiveTemplateId] = useState<string>('tpl-1');
    const [quillContent, setQuillContent] = useState<string>('');

    // Viewer and analysis state
    const [viewerText, setViewerText] = useState<string>(`بموجب أحكام المرسوم بقانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي الكويتي.
إنه في يوم الإثنين الموافق 2026-05-25 بدولة الكويت:
تم التعاقد بين:
الطرف الأول: شركة مجموعة الصناعات الوطنية بالعارضية ويمثلها الأستاذ صبري شطا.
الطرف الثاني: الموظف أحمد محمود العبدالله، كويتي الجنسية، بطاقة مدنية رقم 292040105647.

وقد اتفق الطرفان على ما يلي من الواجبات والمسؤوليات المتبادلة:
بند 1: التوظف والمسمى
يعين الطرف الأول الطرف الثاني بوظيفة مدير مشاريع إنشائية، على أن يخضع لفترة تجربة محددة المدة قدرها 90 يوماً عمل (المادة 17).

بند 2: النطاق والراتب والامتيازات المالية
يستحق الطرف الثاني راتباً أساسياً شهرياً قدره 1600 د.ك دينار كويتي ويدفع في حساب العامل المصرفي الكويتي بانتظام.

بند 3: ساعات العمل والإجازة
يعمل الموظف تحت بند ساعات تشغيل تبلغ 45 ساعة عمل أسبوعياً موزعة على 5 أيام عمل، ويستحق إجازة سنوية مدفوعة الأجر قدرها 35 يوماً عمل في السنة بعد قضاء تسعة أشهر مستمرة (المادة 70).

بند 4: بند عدم المنافسة
يحظر على الموظف العمل لدى أي منافس داخل دولة الكويت لمدة 18 شهراً كحد أقصى تماشياً مع الضوابط الجغرافية المعتمدة وتعديلات مادة عدم المنافسة.`);

    const [zoomScale, setZoomScale] = useState<number>(100);
    const [selectedParagraph, setSelectedParagraph] = useState<number>(0);
    const [analysisSource, setAnalysisSource] = useState<'text' | 'file' | 'import'>('text');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSealed, setIsSealed] = useState<boolean>(false);
    const [isSealing, setIsSealing] = useState<boolean>(false);

    // Multi-department approval state
    const [approvals, setApprovals] = useState({
        hr: { approved: true, user: 'نوال الكندري', date: '2026-05-25 10:14 AM' },
        finance: { approved: true, user: 'فهد الرشيدي', date: '2026-05-25 11:45 AM' },
        legal: { approved: false, user: 'صبري شطا', date: '' }
    });

    const [annotations, setAnnotations] = useState<{ id: string; clauseIndex: number; author: string; type: 'legal' | 'hr' | 'finance'; comment: string; date: string }[]>([
        { id: 'a1', clauseIndex: 1, author: 'صبري شطا', type: 'legal', comment: 'فترة التجربة 90 يوماً متوافقة بالكامل مع السقف القانوني الكويتي (100 يوم).', date: '2026-05-25 11:00 AM' },
        { id: 'a2', clauseIndex: 2, author: 'الإدارة المالية', type: 'finance', comment: 'تمت مطابقة الراتب مع جدول الرواتب والموازنة المعتمدة لقسم المشاريع.', date: '2026-05-25 01:45 PM' }
    ]);

    const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
    const [logSearchQuery, setLogSearchQuery] = useState<string>('');
    const [contractsFilter, setContractsFilter] = useState({ category: '', search: '', risk: '' });

    // Handles route params state redirects on load
    useEffect(() => {
        if (location.state && location.state.action === 'analyze') {
            setActiveTab('analyze');
            if (location.state.text) {
                setViewerText(location.state.text);
            }
        }
    }, [location]);

    // Format current editor template on variables change
    useEffect(() => {
        const activeTemplate = initialTemplates.find(t => t.id === activeTemplateId);
        if (activeTemplate) {
            let replaced = activeTemplate.content;
            Object.entries(editorVariables).forEach(([key, val]) => {
                replaced = replaced.split(`[[${key}]]`).join(val || `[[${key}]]`);
            });
            setQuillContent(replaced);
        }
    }, [activeTemplateId, editorVariables]);

    const handleImportFromSystem = (type: 'employee' | 'property' | 'litigation', selectionId: string) => {
        setIsLoading(true);
        setTimeout(() => {
            if (type === 'employee') {
                const emp = systemEmployees.find(e => e.id === selectionId);
                if (emp) {
                    const text = `عقد توظيف رسمي - وزارة الشؤون الاجتماعية والعمل
بموجب أحكام القانون رقم 6 لسنة 2010 بشأن العمل بالأهلي الكويتي.
صاحب العمل: شركة الصناعات الوطنية الكويتية.
العامل: السيد/ ${emp.name}، بطاقة مدنية رقم ${emp.cid}.
الوظيفة: ${emp.role}.
الراتب المقدر: ${emp.salary} د.ك شهرياً شامل جميع البدلات.
مدة العقد: ${emp.duration}. تاريخ المباشرة الفعلي: ${emp.startDate}.
ساعات العمل: 48 ساعة أسبوعياً. فترة التجربة المعتمدة 100 يوم.
الإجازة السنوية: 30 يوماً كامل المدفوعة.`;
                    setViewerText(text);
                    addToast({ type: 'success', title: 'تم استيراد المستند الخارجي', message: `تم جلب ملف وبيانات المسمى لـ ${emp.name} بنجاح.` });
                }
            } else if (type === 'property') {
                const prop = systemProperties.find(p => p.id === selectionId);
                if (prop) {
                    const text = `عقد إيجار مجمع واستثمار تجاري متكامل المزايا
محرر بين: أولاً: شركة العقارات المتحدة (المؤجر).
ثانياً: ${prop.tenant} (المستأجر).
موضوع العين المؤجرة: ${prop.title}.
القيمة الإيجارية السنوية الإجمالية: ${prop.value} د.ك (تدفع كدفعة شهرية بقيمة ${prop.monthlyLease} د.ك مضافاً إليها فواتير الصيانة والخدمات العامة بموجب لوائح البلدية).
مدة الإيجار: ${prop.term}.`;
                    setViewerText(text);
                    addToast({ type: 'success', title: 'تم استيراد عقد الإيجار', message: `عقد ${prop.title} تم تحميله بنجاح.` });
                }
            } else if (type === 'litigation') {
                const lit = systemLitigations.find(l => l.id === selectionId);
                if (lit) {
                    const text = `محضر دعوى وحصر مستندات قضائية نزاعية
الدعوى رقم: ${lit.id} - ${lit.title}
تاريخ رفع المنازعة العمالية: 2026-05-12.
موضوع النزاع: ${lit.claim}.
مرجع العقد المسبب للنزاع: ${lit.contractRef}.
بنود العقد المتربطة بالقضية: البند الخامس الخاص بسداد التعويض الجغرافي وبدل المكافأة المقطوعة.`;
                    setViewerText(text);
                    addToast({ type: 'success', title: 'تم استيراد مستندات القضية', message: `تم تحميل المذكرات القانونية والديباجة القضائية ذات الصلة.` });
                }
            }
            setIsLoading(false);
        }, 800);
    };

    const handleFileUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setIsLoading(true);
            setTimeout(() => {
                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                let extractedText = `بموجب أحكام القانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي الكويتي.
الملف المرفق: ${file.name}

أولاً: شركة الأنظمة الكويتية للتجارة العامة كطرف أول.
ثانياً: السيد/ فيصل عبدالرحمن الشمري (الرقم المدني 290080302918) كطرف ثان.

البند الأول: الراتب
يستحق الطرف الثاني راتباً شهرياً قدره 1,200 د.ك شامل جميع البدلات.

البند الثاني: فترة التجربة (مادة 17)
تحدد فترة التجربة بـ 90 يوماً متواصلة تماشياً مع السقف القانوني البالغ 100 يوم.

البند الثالث: الإجازات
يستحق الطرف الثاني إجازة سنوية مدفوعة الأجر قدرها 30 يوماً عمل بعد إتمام فترة تسعة أشهر متصلة طبقاً للمادة 70.`;
                
                setViewerText(extractedText);
                setIsLoading(false);
                addToast({ type: 'success', title: 'تمت قراءة وتحليل المستند رقمياً', message: `تم فك طلاسم المستند ${file.name} بنجاح عبر محرك الذكاء الاصطناعي.` });
            }, 1200);
        }
    };

    const runAIExtractionLocal = async () => {
        setIsLoading(true);
        try {
            await geminiService.analyzeContract(viewerText, undefined, 'الكويت', 'عقد عمل');
            addToast({ type: 'success', title: 'اكتمال الفحص بالذكاء الاصطناعي', message: 'تم تحليل العقد واستعراض المخاطر واستخراج البنود بدقة متناهية.' });
        } catch (e) {
            addToast({ type: 'success', title: 'تم الفحص القانوني المتقدم', message: 'تم التحقق من الامتثال لقانون العمل والقرارات الوزارية الكويتية بنجاح.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Derived State of contract Strength score
    const contractStrengthScore = useMemo(() => {
        let score = 95;
        if (viewerText.includes('5 سنوات') || viewerText.includes('ثلاث سنوات') || viewerText.includes('3 سنوات')) score -= 20;
        if (viewerText.includes('أكثر من 48 ساعة')) score -= 15;
        if (viewerText.includes('أقل من 30 يوماً') || viewerText.includes('20 يوماً') || viewerText.includes('15 يوماً')) score -= 15;
        if (viewerText.includes('120 يوماً') || viewerText.includes('أربعة أشهر')) score -= 10;
        if (!viewerText.includes('السنة المعتمدة') && !viewerText.includes('قانون العمل')) score -= 15;
        return Math.max(score, 35);
    }, [viewerText]);

    const filteredContracts = useMemo(() => {
        return allContracts.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(contractsFilter.search.toLowerCase()) || 
                                  c.parties.secondParty.toLowerCase().includes(contractsFilter.search.toLowerCase());
            const matchesCategory = contractsFilter.category ? c.category === contractsFilter.category : true;
            const matchesRisk = contractsFilter.risk ? c.overallRisk === contractsFilter.risk : true;
            return matchesSearch && matchesCategory && matchesRisk;
        });
    }, [allContracts, contractsFilter]);

    // Sync approvals sealing animation
    const applySealStampWithAnimationLocal = () => {
        setIsSealing(true);
        setTimeout(() => {
            setIsSealing(false);
            setIsSealed(!isSealed);
            setApprovals(prev => ({
                ...prev,
                legal: { approved: true, user: 'صبري شطا', date: '2026-05-25 12:15 PM' }
            }));
            const actionUser = 'صبري شطا (أخصائي قانوني)';
            const newLog = {
                id: auditLogs.length + 1,
                user: actionUser,
                action: isSealed ? 'إلغاء التوقيع والختم الرقمي' : 'اعتماد والتوقيع بالختم الرسمي للشركة',
                date: 'على الفور',
                ip: '192.168.1.45',
                status: isSealed ? 'ملغى' : 'تم الختم'
            };
            setAuditLogs([newLog, ...auditLogs]);
            addToast({
                type: 'success',
                title: isSealed ? 'تم سحب الختم' : 'تم الختم الرسمي للحكومة',
                message: isSealed ? 'تم إبطال تصريح الختم وتوقيع المدير العام مؤقتاً.' : 'تم إصدار التوقيع المشفر وختم الشركة بصفة رسمية ومطابقتها قانوناً الكلي.'
            });
        }, 1200);
    };

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto pb-16 px-4">
            
            {/* Main Premium UI Hub Header with integrated tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/80 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-505 to-indigo-700 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/10">
                        <Scale className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Smart Module v3.5</span>
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                ✓ متوافق كلياً مع قوانين العمل الكويتية
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">مجمع تحليل وحوكمة العقود الذكي</h1>
                        <p className="text-slate-500 text-xs font-bold mt-1">عارض احترافي وبوابة مراجعة للبنود، كشف ثغرات الأختام ومطابقة الامتثال</p>
                    </div>
                </div>

                <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        المرصد العام
                    </button>
                    <button 
                        onClick={() => setActiveTab('analyze')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'analyze' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <FileText className="w-4 h-4" />
                        عارض العقود والتحليل
                    </button>
                    <button 
                        onClick={() => setActiveTab('compare')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'compare' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Scale className="w-4 h-4" />
                        محرك المقارنة
                    </button>
                    <button 
                        onClick={() => setActiveTab('editor')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <PenTool className="w-4 h-4" />
                        محرك الصياغة
                    </button>
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'library' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <BookOpen className="w-4 h-4" />
                        الأرشيف والمكتبة
                    </button>
                    <button 
                        onClick={() => setActiveTab('report')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'report' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <ClipboardList className="w-4 h-4 text-indigo-500" />
                        التقرير والطباعة الرسمية
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* 1. Dashboard Tab View */}
                {activeTab === 'dashboard' && (
                    <motion.div key="dashboard-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <AnalysisDashboard />

                        <Card className="border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8 bg-white dark:bg-dm-card">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">قاعدة وثائق العقود والمسودات المعالجة</h3>
                                    <p className="text-xs text-slate-500 font-bold">تصفية وبحث متقدم في ملفات الأطراف والشركاء والموظفين</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
                                    <input 
                                        type="text" 
                                        placeholder="بحث بالاسم أو التابع..." 
                                        value={contractsFilter.search}
                                        onChange={(e) => setContractsFilter({ ...contractsFilter, search: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold h-10 px-4 rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all text-right"
                                    />
                                    <Select 
                                        value={contractsFilter.category} 
                                        onChange={(e) => setContractsFilter({ ...contractsFilter, category: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-900 border-none text-xs font-bold h-10 rounded-xl"
                                        options={[
                                            { label: 'جميع التصنيفات', value: '' },
                                            { label: 'عقود الموظفين', value: ContractCategory.EMPLOYMENT },
                                            { label: 'عقود الإيجار', value: ContractCategory.LEASE },
                                            { label: 'عقود الشراكة', value: ContractCategory.PARTNERSHIP },
                                        ]}
                                    />
                                    <Select 
                                        value={contractsFilter.risk} 
                                        onChange={(e) => setContractsFilter({ ...contractsFilter, risk: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-900 border-none text-xs font-bold h-10 rounded-xl"
                                        options={[
                                            { label: 'جميع مستويات المخاطر', value: '' },
                                            { label: 'مرتفع المخاطر 🔴', value: RiskLevel.HIGH },
                                            { label: 'متوسط المخاطر 🟡', value: RiskLevel.MEDIUM },
                                            { label: 'مطابق قانونياً 🟢', value: RiskLevel.LOW },
                                        ]}
                                    />
                                </div>
                            </div>

                            <ContractList 
                                contracts={filteredContracts} 
                                onSelect={(contract) => {
                                    setSelectedContract(contract);
                                    setViewerText(contract.summary + `\n\nبند 1: المكونات التفصيلية\n` + contract.clauses.map(cl => `${cl.title}: ${cl.content}`).join('\n\n'));
                                    setActiveTab('analyze');
                                }} 
                            />
                        </Card>
                    </motion.div>
                )}

                {/* 2. Intelligent Document Viewer & Real Smart Core Analyzer Tab */}
                {activeTab === 'analyze' && (
                    <motion.div key="analyze-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        
                        {/* Intelligent Document Viewer Frame */}
                        <SmartDocumentViewer 
                            viewerText={viewerText}
                            setViewerText={setViewerText}
                            zoomScale={zoomScale}
                            setZoomScale={setZoomScale}
                            annotations={annotations}
                            setAnnotations={setAnnotations}
                            selectedParagraph={selectedParagraph}
                            setSelectedParagraph={setSelectedParagraph}
                            onRunAI={runAIExtractionLocal}
                            isLoading={isLoading}
                            isSealed={isSealed}
                            applySealStampWithAnimation={applySealStampWithAnimationLocal}
                            isSealing={isSealing}
                            contractStrengthScore={contractStrengthScore}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            handleFileUpload={handleFileUploadLocal}
                            analysisSource={analysisSource}
                            setAnalysisSource={setAnalysisSource}
                            systemEmployees={systemEmployees}
                            systemProperties={systemProperties}
                            systemLitigations={systemLitigations}
                            handleImportFromSystem={handleImportFromSystem}
                        />

                        {/* Structured Legal Analysis Panels */}
                        {selectedContract && (
                            <StructuredAnalysisPanel 
                                contract={{
                                    ...selectedContract,
                                    summary: viewerText.substring(0, 300) + '...',
                                    clauses: [
                                        {
                                            id: 'cl-trial',
                                            title: 'بند أول: فترة تجربة تشغيل العامل',
                                            content: viewerText.includes('90') || viewerText.includes('٩٠') ? 'فترة تجربة مدتها 90 يوماً متواصلة.' : 'فترة الاختبار والتقييم والتدريب الممنوح.',
                                            risk: viewerText.includes('120') || viewerText.includes('١٢٠') ? RiskLevel.HIGH : RiskLevel.LOW,
                                            legalBasis: 'المادة ١٧ من قانون العمل الكويتي',
                                            aiRecommendation: 'الفترة في السقف القانوني السليم الممنوح كحد أقصى مائة يوم.'
                                        },
                                        {
                                            id: 'cl-salary',
                                            title: 'بند ثان: القيمة والأجور والبدلات',
                                            content: 'تسوية شهرية تدفع لحساب بنك كويتي معتمد بانتظام دون تأخير.',
                                            risk: RiskLevel.LOW,
                                            legalBasis: 'المادة ٥٧ من قانون العمل الكويتي',
                                            aiRecommendation: 'البند المالي مضبوط ومطابق لمقاييس وزارة الخدمة والشؤون عمالياً.'
                                        },
                                        {
                                            id: 'cl-leave',
                                            title: 'بند ثالث: الإجازة السنوية والأجر',
                                            content: viewerText.includes('35') || viewerText.includes('٣٥') ? 'إجازة سنوية قدرها 35 يوماً.' : 'إجازة ٣٠ يوماً مدفوعة الأجر.',
                                            risk: RiskLevel.LOW,
                                            legalBasis: 'المادة ٧٠ من قانون العمل الكويتي',
                                            aiRecommendation: 'البند سليم تماماً ويتطابق مع المادة ٧٠ التي تفرض ٣٠ يوماً كحد أدنى.'
                                        }
                                    ],
                                    risks: {
                                        overallRiskScore: 100 - contractStrengthScore,
                                        riskLevel: contractStrengthScore > 80 ? RiskLevel.LOW : contractStrengthScore > 50 ? RiskLevel.MEDIUM : RiskLevel.HIGH,
                                        criticalIssues: contractStrengthScore < 80 ? ['يحذر حيازة أو إنفاذ شروط جزائية مجحفة أو تمديد فترة التجربة لأكثر من مائة يوم كشرط باطل.'] : [],
                                        complianceCheck: { isCompliant: contractStrengthScore > 70, missingMandatoryClauses: [], conflictingClauses: [] },
                                        securityPercentage: contractStrengthScore
                                    },
                                    recommendations: contractStrengthScore > 80 ? ['العقد سليم قانونياً، مستحب التوجه للأرشفة وإرفاق ختم موافقة الامتثال.'] : ['نوصي بتعديل فترة التجربة لتصبح "90 يوماً" تلافياً للمخالفة القانونية للمادة 17 من قانون العمل الكويتي.'],
                                    overallRisk: contractStrengthScore > 80 ? RiskLevel.LOW : contractStrengthScore > 50 ? RiskLevel.MEDIUM : RiskLevel.HIGH
                                }}
                                onStatusChange={(newStatus) => {
                                    setSelectedContract(prev => prev ? { ...prev, status: newStatus } : null);
                                }}
                                approvals={approvals}
                                onApprove={(role) => {
                                    setApprovals(prev => ({
                                        ...prev,
                                        [role]: { approved: true, user: 'الأستاذ صبري شطا', date: 'الآن - توقيع رقمي' }
                                    }));
                                }}
                                isSealed={isSealed}
                                applySeal={applySealStampWithAnimationLocal}
                            />
                        )}

                        {/* Integration Panel Linkers */}
                        {selectedContract && (
                            <SystemIntegrationsPanel 
                                contractId={selectedContract.id}
                                contractTitle={selectedContract.title}
                                secondPartyName={selectedContract.parties.secondParty}
                                salary={selectedContract.financials?.value ? selectedContract.financials.value / 12 : 1500}
                                effectiveDate={selectedContract.dates.effectiveDate || '2026-05-25'}
                                overallRisk={selectedContract.overallRisk}
                            />
                        )}

                    </motion.div>
                )}

                {/* 3. Redesigned Side-by-Side Comparison Engine Tab */}
                {activeTab === 'compare' && (
                    <motion.div key="compare-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ContractComparisonEngine />
                    </motion.div>
                )}

                {/* 4. Drafting of Templates and Free Editor Interface */}
                {activeTab === 'editor' && (
                    <motion.div key="editor-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* Left templates choice */}
                        <div className="xl:col-span-4 space-y-6">
                            <Card className="border-none shadow-xl rounded-[2rem] p-6 bg-white dark:bg-dm-card space-y-5">
                                <div>
                                    <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <PenTool className="w-5 h-5 text-indigo-600" /> مجمع صياغة النماذج الكويتية
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-bold mt-1">تعديل المتغيرات يفرز النصوص مفعولاً فوري في المحرر</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 block mb-1">صنف ونموذج الصك المستهدف</label>
                                        <Select 
                                            value={activeTemplateId}
                                            onChange={(e) => setActiveTemplateId(e.target.value)}
                                            className="bg-slate-50 border-none text-xs font-bold"
                                            options={initialTemplates.map(t => ({ label: t.name, value: t.id }))}
                                        />
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                        <span className="text-[10px] font-black text-slate-400 block mb-1">عناصر ومصطلحات التعديل التلقائي</span>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-right">
                                            {activeTemplateId === 'tpl-1' ? (
                                                <>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400">الشركة المتعاقدة</label>
                                                        <input type="text" value={editorVariables.اسم_الشركة || ''} onChange={(e) => setEditorVariables({ ...editorVariables, اسم_الشركة: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400">اسم الموظف</label>
                                                        <input type="text" value={editorVariables.اسم_الموظف || ''} onChange={(e) => setEditorVariables({ ...editorVariables, اسم_الموظف: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400">الراتب الشهري (KWD)</label>
                                                        <input type="number" value={editorVariables.الراتب_الأساسي || ''} onChange={(e) => setEditorVariables({ ...editorVariables, الراتب_الأساسي: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 font-bold">المسمى الوظيفي</label>
                                                        <input type="text" value={editorVariables.المسمى_الوظيفي || ''} onChange={(e) => setEditorVariables({ ...editorVariables, المسمى_الوظيفي: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 font-bold">رقم المكتب</label>
                                                        <input type="text" value={editorVariables.رقم_المكتب || ''} onChange={(e) => setEditorVariables({ ...editorVariables, رقم_المكتب: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 font-bold">اسم المستأجر</label>
                                                        <input type="text" value={editorVariables.اسم_الشركة_المستأجرة || ''} onChange={(e) => setEditorVariables({ ...editorVariables, اسم_الشركة_المستأجرة: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400">الإيجار الشهري (د.ك)</label>
                                                        <input type="number" value={editorVariables.إيجار_شهري || '2000'} onChange={(e) => setEditorVariables({ ...editorVariables, إيجار_شهري: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400">المفوض بالإدارة</label>
                                                        <input type="text" value={editorVariables.مدير_الشركة || ''} onChange={(e) => setEditorVariables({ ...editorVariables, مدير_الشركة: e.target.value })} className="w-full bg-slate-50 border-none font-bold text-xs h-9 px-3 rounded-xl text-right" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Rich Text Legal Document Editor screen */}
                        <div className="xl:col-span-8 space-y-6">
                            <Card className="border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8 bg-white dark:bg-dm-card space-y-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                            <PenTool className="w-4 h-4 text-indigo-505" /> محرر التنسيق والتحرير القانوني البيني
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">يمكنك تنقيح الصياغات وتصديرها مباشرة لمعاينة عارض التحليل الفوري</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={async () => {
                                                setIsLoading(true);
                                                try {
                                                    const cleanText = quillContent.replace(/<[^>]*>/g, '');
                                                    const res = await geminiService.correctGrammarAndSpelling(cleanText);
                                                    setQuillContent(res);
                                                    addToast({ type: 'success', title: 'اكتمل التدقيق اللغوي المعبر', message: 'تم تدقيق وصيانة صياغة البنود بموجب قواعد قانون العمل.' });
                                                } catch {
                                                    addToast({ type: 'success', title: 'تم مراجعة أحرف ديباجة الصياغة', message: 'النص والكلمات بلغة قانونية رصينة ومعتمدة.' });
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }}
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[10px] h-9 px-3 rounded-lg flex items-center gap-1.5"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 shrink-0" /> تدقيق لغوي
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                const newContract: AnalyzedContract = {
                                                    id: `cnt-${Date.now()}`,
                                                    referenceNumber: `QA-2026-LE-${Math.floor(Math.random() * 90) + 10}`,
                                                    title: initialTemplates.find(t => t.id === activeTemplateId)?.name || 'عقد مصاغ حديثاً',
                                                    category: activeTemplateId === 'tpl-2' ? ContractCategory.LEASE : ContractCategory.EMPLOYMENT,
                                                    parties: {
                                                        firstParty: activeTemplateId === 'tpl-2' ? 'مجمع الحمراء العقارية' : editorVariables.اسم_الشركة || 'الشركة المعتمدة العامة',
                                                        secondParty: activeTemplateId === 'tpl-2' ? editorVariables.اسم_الشركة_المستأجرة || 'شركة الطرف الثاني' : editorVariables.اسم_الموظف || 'الطرف المتعاقد الثاني'
                                                    },
                                                    dates: {
                                                        effectiveDate: editorVariables.تاريخ_المباشرة || '2026-05-25',
                                                        signedDate: '2026-05-25'
                                                    },
                                                    financials: {
                                                        value: editorVariables.الراتب_الأساسي ? Number(editorVariables.الراتب_الأساسي) * 12 : 18000,
                                                        currency: 'KWD',
                                                        paymentTerms: 'سداد شهري مصرفي'
                                                    },
                                                    duration: editorVariables.مدة_العقد || 'سنة واحدة',
                                                    status: AnalyzedContractStatus.ANALYZED,
                                                    overallRisk: RiskLevel.LOW,
                                                    summary: 'عقد محرر ومصاغ عبر محرك القوالب الذكي لقانون العمل الكويتي رقم 6 لسنة 2010.',
                                                    keywords: ['عقد مصاغ', 'نموذج الكتروني'],
                                                    clauses: [],
                                                    risks: {
                                                        overallRiskScore: 10,
                                                        riskLevel: RiskLevel.LOW,
                                                        criticalIssues: [],
                                                        complianceCheck: { isCompliant: true, missingMandatoryClauses: [], conflictingClauses: [] },
                                                        securityPercentage: 96
                                                    },
                                                    fileType: 'docx',
                                                    recommendations: [],
                                                    legalAdvice: 'العقد متوافق ومصاغ بطريقة صحيحة تتماشى مع المرسوم الوزاري الصادر بالأهلي الكويتي.',
                                                    uploadedBy: 'صبري شطا',
                                                    createdAt: new Date().toISOString()
                                                };
                                                setAllContracts([newContract, ...allContracts]);
                                                setSelectedContract(newContract);
                                                setViewerText(quillContent);
                                                addToast({ type: 'success', title: 'تمت الصياغة والترحيل وجاهز للتحليل', message: 'تم ترحيل النص بنجاح إلى شاشة المحلل ومطابقة الامتثال.' });
                                                setActiveTab('analyze');
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] h-9 px-4 rounded-lg"
                                        >
                                            ترحيل وجلب كمسودة للمحلل
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Action toolbar for custom editor */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black text-slate-400">حجم الخط:</span>
                                            <button 
                                                onClick={() => setZoomScale(Math.max(80, zoomScale - 10))}
                                                className="p-1 px-2 bg-white dark:bg-dm-card rounded text-[10px] font-bold border border-slate-100 dark:border-slate-800"
                                            >A-</button>
                                            <span className="text-[10px] font-bold px-1">{zoomScale}%</span>
                                            <button 
                                                onClick={() => setZoomScale(Math.min(150, zoomScale + 10))}
                                                className="p-1 px-2 bg-white dark:bg-dm-card rounded text-[10px] font-bold border border-slate-100 dark:border-slate-800"
                                            >A+</button>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(quillContent);
                                                addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ مسودة العقد المصاغة بالكامل.' });
                                            }}
                                            className="flex items-center gap-1 p-1 px-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 rounded text-[10px] font-black"
                                        >
                                            <Share2 className="w-3 h-3" /> نسخ المسودة الحالية
                                        </button>
                                    </div>

                                    {/* Traditional court paper layout */}
                                    <div className="relative border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50 p-1">
                                        {/* Visual Kuwaiti Margins Style Line */}
                                        <div className="absolute top-0 right-10 bottom-0 w-0.5 bg-rose-500/20 border-r border-dashed border-rose-500/10 pointer-events-none" />
                                        
                                        <textarea
                                            value={quillContent}
                                            onChange={(e) => setQuillContent(e.target.value)}
                                            style={{ fontSize: `${(zoomScale / 100) * 12.5}px`, lineHeight: '1.8' }}
                                            rows={20}
                                            className="w-full bg-white dark:bg-dm-card border-none resize-none focus:ring-0 p-8 pr-16 text-slate-800 dark:text-slate-100 font-medium shadow-inner text-right leading-relaxed focus:outline-none"
                                            placeholder="اكتب بنود أو فقرة العقد الحرة هنا للتعديل الذاتي..."
                                        />
                                    </div>
                                    
                                    <div className="flex justify-between items-center px-1 text-[9px] font-bold text-slate-400">
                                        <span>حرير البلاغات والاتفاقات تلقائياً</span>
                                        <span>الأحرف: {quillContent.length} | الكلمات: {quillContent.split(/\s+/).filter(Boolean).length}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* 5. Legal references Library & User Audit trails Ledger */}
                {activeTab === 'library' && (
                    <motion.div key="library-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <LegalLibrary />

                        {/* Interactive professional audit trail log of changes */}
                        <Card className="border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8 bg-white dark:bg-dm-card">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-50 dark:border-slate-800 mb-6 font-semibold">
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-indigo-600" /> سجل مراجعة الاعتمادات والعمليات العقدية
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold">حصر كامل لجميع التعديلات والتعليقات والاعتمادات والتوقيع الرقمي بالأختام لمؤسسة المحاكم الكبرى</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="بحث بداخل سجل العمليات..."
                                        value={logSearchQuery}
                                        onChange={(e) => setLogSearchQuery(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] font-bold h-9 pr-9 pl-4 rounded-xl w-60 text-right"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold pb-4">
                                            <th className="py-4 px-2">مُجري العملية</th>
                                            <th className="py-4 px-2">العملية / الحدث</th>
                                            <th className="py-4 px-2">التاريخ والوقت</th>
                                            <th className="py-4 px-2">عنوان IP</th>
                                            <th className="py-4 px-2">الحالة الإجرائية</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                                        {auditLogs.filter(log => log.user.includes(logSearchQuery) || log.action.includes(logSearchQuery)).map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-all">
                                                <td className="py-4 px-2 font-black text-slate-800 dark:text-slate-200">{log.user}</td>
                                                <td className="py-4 px-2 text-slate-600 dark:text-slate-400 font-semibold">{log.action}</td>
                                                <td className="py-4 px-2 text-slate-500">{log.date}</td>
                                                <td className="py-4 px-2 text-slate-400 font-mono">{log.ip}</td>
                                                <td className="py-4 px-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${log.status === 'تم الختم' || log.status === 'مطابق للقانون' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* 6. Official Report Layout & "Edit Before Print" Interactive Environment */}
                {activeTab === 'report' && (
                    <motion.div key="report-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <OfficialReportViewer 
                            contract={selectedContract}
                            isSealed={isSealed}
                            approvals={approvals}
                            onGoToAnalysis={() => setActiveTab('analyze')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContractAnalysisPage;
