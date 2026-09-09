import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Gavel, Scale, Calendar, Users, FileText, CheckCircle, Clock,
    Printer, Plus, Search, Trash2, Edit, ChevronDown, ChevronRight,
    Shield, Bell, AlertTriangle, Briefcase, MapPin, Share2, DollarSign,
    FileCheck, Landmark, Compass, Award, Building2, History, Check, X,
    Info, Download, ArrowUpRight, Brain, Video, ShieldCheck, Sparkles,
    Copy, Zap, RefreshCw, Send, Lock, Eye, ArrowRight, ExternalLink,
    Smartphone, ChevronLeft, Layers, QrCode, FileSpreadsheet, Play, Pause,
    Volume2, CheckCircle2, UserCheck, Radio, Database, PieChart,
    FilePlus, Sliders, Map, Navigation, ShieldAlert, FileSearch, Filter, RotateCcw
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// --- TYPES & DATA MODELS ---

interface CaseRecord {
    id: string;
    caseNumber: string;
    courtName: string;
    circuit: string;
    claimant: string;
    defendant: string;
    claimAmount: string;
    status: 'ACTIVE' | 'HEARING_TODAY' | 'EXECUTION_PENDING' | 'SETTLED' | 'IN_EXPERTS';
    nextDate: string;
    judge: string;
    urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

interface VirtualHearing {
    id: string;
    caseNumber: string;
    courtVenue: string;
    judgeName: string;
    claimant: string;
    defendant: string;
    hearingTime: string;
    status: 'LIVE_NOW' | 'WAITING' | 'COMPLETED';
    roomUrl: string;
    transcript: { time: string; speaker: string; text: string }[];
}

interface ExecutionAction {
    id: string;
    caseNumber: string;
    debtor: string;
    creditor: string;
    amount: string;
    targetEntity: string;
    actionType: string;
    status: 'EXECUTED_AUTOMATED' | 'PENDING_APPROVAL' | 'REJECTED';
    date: string;
    digitalWarrantId: string;
}

interface ExpertReferral {
    id: string;
    caseNumber: string;
    courtDepartment: string;
    expertName: string;
    subject: string;
    nextSessionDate: string;
    status: 'UNDER_AUDIT' | 'INSPECTION_SCHEDULED' | 'REPORT_SUBMITTED';
    preliminaryReportSummary: string;
    objectionDrafted: boolean;
}

// --- MOCK DATA ---

const INITIAL_CASES: CaseRecord[] = [
    {
        id: 'CAS-9081',
        caseNumber: '9081 / 2026 تجاري كلي',
        courtName: 'مجمع محاكم قصر العدل',
        circuit: 'الدائرة التجارية الكلية',
        claimant: 'شركة الخليج للاستثمارات العقارية',
        defendant: 'شركة الأفق للمقاولات العامة',
        claimAmount: '125,000 د.ك',
        status: 'HEARING_TODAY',
        nextDate: '2026-08-20',
        judge: 'المستشار د. عبد العزيز المطيري',
        urgency: 'HIGH'
    },
    {
        id: 'CAS-1102',
        caseNumber: '1102 / 2025 استئناف تجاري',
        courtName: 'محكمة الاستئناف العليا',
        circuit: 'دائرة الاستئناف التجاريه',
        claimant: 'بنك الخليج ش.م.ك',
        defendant: 'شركة المسار اللوجستية',
        claimAmount: '85,000 د.ك',
        status: 'EXECUTION_PENDING',
        nextDate: '2026-08-25',
        judge: 'المستشار سعود العتيبي',
        urgency: 'HIGH'
    },
    {
        id: 'CAS-8812',
        caseNumber: '8812 / 2025 مدني خبراء',
        courtName: 'إدارة الخبراء - وزارة العدل',
        circuit: 'شعبة المحاسبة الفنية',
        claimant: 'مجموعة التنمية الوطنية',
        defendant: 'شركة الشراع للخدمات',
        claimAmount: '68,400 د.ك',
        status: 'IN_EXPERTS',
        nextDate: '2026-08-28',
        judge: 'الخبير أ.د. طارق الحساوي',
        urgency: 'MEDIUM'
    },
    {
        id: 'CAS-4452',
        caseNumber: '4452 / 2026 أسرة كلي',
        courtName: 'مجمع محاكم حولي',
        circuit: 'دائرة الأحوال الشخصية',
        claimant: 'نورة أحمد علي',
        defendant: 'جاسم محمد خالد',
        claimAmount: '18,000 د.ك',
        status: 'ACTIVE',
        nextDate: '2026-09-02',
        judge: 'المستشار فهد الشمري',
        urgency: 'NORMAL'
    },
    {
        id: 'CAS-1040',
        caseNumber: '1040 / 2026 صلح وتسوية',
        courtName: 'مركز الوساطة والتسوية',
        circuit: 'دائرة الصلح الودي',
        claimant: 'مؤسسة الخدمات المتكاملة',
        defendant: 'شركة الأفق العقارية',
        claimAmount: '45,000 د.ك',
        status: 'SETTLED',
        nextDate: 'تم الإنجاز',
        judge: 'المستشار أحمد الناصر',
        urgency: 'NORMAL'
    }
];

const INITIAL_HEARINGS: VirtualHearing[] = [
    {
        id: 'VH-2026-809',
        caseNumber: '9081 / 2026 تجاري كلي',
        courtVenue: 'محكمة الاستئناف - الدائرة التجارية الأولى',
        judgeName: 'المستشار د. عبد العزيز المطيري',
        claimant: 'شركة الخليج للاستثمارات العقارية',
        defendant: 'شركة الأفق للمقاولات العامة',
        hearingTime: '10:30 صباحاً',
        status: 'LIVE_NOW',
        roomUrl: 'https://virtual-court.gov.kw/room/VH-2026-809',
        transcript: [
            { time: '10:30:15', speaker: 'القاضي', text: 'افتتحت الجلسة الافتراضية علناً بالصوت والصورة عبر المنظومة القضائية الموحدة.' },
            { time: '10:31:02', speaker: 'وكيل المدعي (مكتب صبري شطا)', text: 'حاضر عن شركة الخليج للاستثمارات، ونتمسك بالطلبات الواردة بصحيفة الدعوى وبمذكرة الدفاع المودعة.' },
            { time: '10:32:10', speaker: 'وكيل المدعى عليه', text: 'حاضر عن شركة الأفق، ونلتمس أجلاً للاطلاع والرد مع تقديم التقرير المحاسبي الاستشاري.' },
            { time: '10:33:00', speaker: 'القاضي', text: 'قررت المحكمة إقفال باب المرافعة وتأجيل الجلسة للقرار لجلسة 18 سبتمبر 2026 مع تصريح مذكرات ختامية.' }
        ]
    },
    {
        id: 'VH-2026-812',
        caseNumber: '4452 / 2026 أسرة كلي',
        courtVenue: 'محكمة الأسرة - دائرة الأحوال الشخصية',
        judgeName: 'المستشار فهد الشمري',
        claimant: 'نورة أحمد علي',
        defendant: 'جاسم محمد خالد',
        hearingTime: '11:15 صباحاً',
        status: 'WAITING',
        roomUrl: 'https://virtual-court.gov.kw/room/VH-2026-812',
        transcript: []
    }
];

const INITIAL_EXECUTION_ACTIONS: ExecutionAction[] = [
    {
        id: 'EX-9921',
        caseNumber: '1102 / 2025 تنفيذ آلي',
        debtor: 'شركة المسار اللوجستية',
        creditor: 'بنك الخليج ش.م.ك',
        amount: '125,000 د.ك',
        targetEntity: 'مصرف الكويت المركزي (11 بنك أهلي وتجاري)',
        actionType: 'حجز ما للمدين لدى كافة البنوك',
        status: 'EXECUTED_AUTOMATED',
        date: '2026-08-04',
        digitalWarrantId: 'CBK-WRN-88401'
    },
    {
        id: 'EX-9922',
        caseNumber: '8841 / 2025 تنفيذ آلي',
        debtor: 'سعود عبد الله سالم',
        creditor: 'مكتب المحامي صبري شطا',
        amount: '18,500 د.ك',
        targetEntity: 'وزارة الداخلية - المنافذ والجوازات',
        actionType: 'أمر منع سفر وتطبيقه آلياً بالنظام',
        status: 'EXECUTED_AUTOMATED',
        date: '2026-08-03',
        digitalWarrantId: 'MOI-TB-99120'
    },
    {
        id: 'EX-9923',
        caseNumber: '3310 / 2026 تنفيذ آلي',
        debtor: 'شركة الأفق العقارية',
        creditor: 'مؤسسة الخدمات المتكاملة',
        amount: '45,000 د.ك',
        targetEntity: 'إدارة التسجيل العقاري والتوثيق',
        actionType: 'تأشير الحجز العقاري بالسجل',
        status: 'PENDING_APPROVAL',
        date: '2026-08-05',
        digitalWarrantId: 'REG-BLK-44019'
    }
];

const INITIAL_EXPERT_REFERRALS: ExpertReferral[] = [
    {
        id: 'EXP-4091',
        caseNumber: '8812 / 2025 تجاري / خبراء',
        courtDepartment: 'إدارة الخبراء - وزارة العدل (شعبة المحاسبة)',
        expertName: 'أ.د. طارق الحساوي (خبير أول محاسبي)',
        subject: 'تصفية أرباح شراكة تجارية وفحص الدفاتر والديون المتعثرة',
        nextSessionDate: '2026-08-28',
        status: 'UNDER_AUDIT',
        preliminaryReportSummary: 'انتهى التقرير المبدئي إلى أحقية الموكل بمبلغ 68,400 د.ك أرباح مسددة بنقص، مع تحفظ الخبير على بند المصروفات التسويقية.',
        objectionDrafted: true
    },
    {
        id: 'EXP-4098',
        caseNumber: '1104 / 2026 مدني / هندسي',
        courtDepartment: 'إدارة الخبراء - وزارة العدل (شعبة الهندسة)',
        expertName: 'م. مشعل العازمي (خبير هندسي استشاري)',
        subject: 'فحص عيوب البناء وهبوط الخرسانة بمشروع المجمع السكني',
        nextSessionDate: '2026-09-05',
        status: 'INSPECTION_SCHEDULED',
        preliminaryReportSummary: 'تم تحديد موعد المعاينة الميدانية على الطبيعة بحضور أطراف الدعوى والمهندسين الاستشاريين.',
        objectionDrafted: false
    }
];

export const SmartJudicialSystemPage: React.FC = () => {
    const { addToast } = useToast();

    // --- MAIN TAB STATE (5 Streamlined Key Tabs) ---
    const [activeTab, setActiveTab] = useState<
        'overview' | 'case_filing_wizard' | 'virtual_court' | 'smart_execution' | 'expert_sessions'
    >('overview');

    // --- FILTER STATES ---
    const [circuitFilter, setCircuitFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // --- MAIN DATA STATES ---
    const [cases] = useState<CaseRecord[]>(INITIAL_CASES);
    const [hearings, setHearings] = useState<VirtualHearing[]>(INITIAL_HEARINGS);
    const [selectedHearing, setSelectedHearing] = useState<VirtualHearing>(INITIAL_HEARINGS[0]);
    const [executionList, setExecutionList] = useState<ExecutionAction[]>(INITIAL_EXECUTION_ACTIONS);
    const [expertReferrals, setExpertReferrals] = useState<ExpertReferral[]>(INITIAL_EXPERT_REFERRALS);
    const [selectedExpertCase, setSelectedExpertCase] = useState<ExpertReferral>(INITIAL_EXPERT_REFERRALS[0]);

    // --- INTERACTION MODALS & DRAWERS ---
    const [selectedCaseModal, setSelectedCaseModal] = useState<CaseRecord | null>(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printableContent, setPrintableContent] = useState<string | null>(null);

    // --- VIRTUAL COURT STATE ---
    const [newMemoText, setNewMemoText] = useState('');
    const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

    // --- CASE FILING WIZARD STATE ---
    const [wizardStep, setWizardStep] = useState<number>(1);
    const [filingData, setFilingData] = useState({
        courtLevel: 'المحكمة الكلية',
        courtVenue: 'مجمع محاكم قصر العدل',
        circuit: 'الدائرة التجارية الكلية',
        claimantName: 'شركة الخليج للاستثمارات العقارية ش.م.ك',
        claimantCivilId: '290010108841',
        defendantName: 'شركة الأفق للمقاولات العامة',
        defendantCivilId: '298040507712',
        opponentAddress: 'الكويت - العاصمة - شارع فهد السالم - برج السحاب - الدور 14',
        subjectTitle: 'مطالبة مالية بقيمة بضائع وتعويض عن التأخير في السداد',
        facts: 'تطالب الشركة المدعية المدعى عليه بمبلغ 45,000 دينار كويتي قيمة بضائع تم توريدها واستلامها بموجب فواتير وسندات تسليم موقعة ومؤرخة دون سداد رغم إعلانه بالوفاء.',
        claimAmount: '45000',
        legalBasis: 'المادة 110 من قانون التجارة والمادة 227 من القانون المدني الكويتي',
        documents: ['عقد التوريد الموثق.pdf', 'فواتير الاستلام الموقعة.pdf', 'إخطار رسمي بالسداد.pdf']
    });
    const [createdLawsuitModal, setCreatedLawsuitModal] = useState(false);
    const [createdLawsuitCode, setCreatedLawsuitCode] = useState('');

    // --- EXECUTION MODAL STATE ---
    const [newExecModalOpen, setNewExecModalOpen] = useState(false);
    const [newExecData, setNewExecData] = useState({
        caseNumber: '7720 / 2026 تنفيذ',
        debtor: '',
        creditor: 'مكتب المحامي صبري شطا (وكيلاً)',
        amount: '',
        targetEntity: 'مصرف الكويت المركزي',
        actionType: 'حجز ما للمدين لدى البنوك'
    });

    // --- EXPERT OBJECTION AI STATE ---
    const [isGeneratingObjection, setIsGeneratingObjection] = useState(false);
    const [generatedObjectionText, setGeneratedObjectionText] = useState('');

    // --- FILTERED CASES CALCULATED MEMO ---
    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesSearch =
                c.caseNumber.includes(searchQuery) ||
                c.claimant.includes(searchQuery) ||
                c.defendant.includes(searchQuery) ||
                c.judge.includes(searchQuery);

            const matchesCircuit =
                circuitFilter === 'ALL' ||
                (circuitFilter === 'COMMERCIAL' && c.circuit.includes('تجارية')) ||
                (circuitFilter === 'CIVIL' && c.circuit.includes('مدنية')) ||
                (circuitFilter === 'FAMILY' && c.circuit.includes('الأحوال')) ||
                (circuitFilter === 'EXPERTS' && c.circuit.includes('المحاسبة')) ||
                (circuitFilter === 'SETTLEMENT' && c.circuit.includes('الصلح'));

            const matchesStatus =
                statusFilter === 'ALL' ||
                c.status === statusFilter;

            const matchesDate =
                dateFilter === 'ALL' ||
                (dateFilter === 'TODAY' && c.status === 'HEARING_TODAY') ||
                (dateFilter === 'EXECUTION' && c.status === 'EXECUTION_PENDING');

            return matchesSearch && matchesCircuit && matchesStatus && matchesDate;
        });
    }, [cases, searchQuery, circuitFilter, statusFilter, dateFilter]);

    // --- HELPER AUDIO FEEDBACK ---
    const triggerAudioTone = (freq = 600, duration = 0.2) => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // ignore audio block
        }
    };

    // --- HANDLERS ---
    const handleResetFilters = () => {
        setCircuitFilter('ALL');
        setStatusFilter('ALL');
        setDateFilter('ALL');
        setSearchQuery('');
        addToast({ type: 'info', title: 'إعادة الضبط', message: 'تم مسح جميع الفلاتر وعرض البيانات الكاملة.' });
    };

    const handleSimulateSpeech = (speaker: string, text: string) => {
        setActiveSpeaker(speaker);
        triggerAudioTone(speaker === 'القاضي' ? 440 : 660, 0.25);

        setTimeout(() => {
            const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const updatedTranscript = [
                ...selectedHearing.transcript,
                { time: timeStr, speaker: speaker, text: text }
            ];
            setSelectedHearing(prev => ({ ...prev, transcript: updatedTranscript }));
            setHearings(prev => prev.map(h => h.id === selectedHearing.id ? { ...h, transcript: updatedTranscript } : h));
            setActiveSpeaker(null);
            addToast({ type: 'info', title: `محاكاة المرافعة: ${speaker}`, message: 'تم تدوين المرافعة بمحضر الجلسة الفوري.' });
        }, 1000);
    };

    const handleSendEMemo = () => {
        if (!newMemoText.trim()) {
            addToast({ type: 'warning', title: 'تنبيه', message: 'يرجى كتابة نص المذكرة قبل الإيداع.' });
            return;
        }
        triggerAudioTone(800, 0.2);
        const updatedTranscript = [
            ...selectedHearing.transcript,
            {
                time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                speaker: 'مكتب صبري شطا (إيداع إلكتروني)',
                text: `[مذكرة دفاع موثقة]: ${newMemoText}`
            }
        ];
        setSelectedHearing(prev => ({ ...prev, transcript: updatedTranscript }));
        setHearings(prev => prev.map(h => h.id === selectedHearing.id ? { ...h, transcript: updatedTranscript } : h));
        setNewMemoText('');
        addToast({ type: 'success', title: 'تم إيداع المذكرة', message: 'تم ربط المذكرة بمحضر الجلسة الافتراضية.' });
    };

    const handleCompleteFilingWizard = () => {
        if (!filingData.claimantName || !filingData.defendantName || !filingData.subjectTitle) {
            addToast({ type: 'warning', title: 'بيانات غير مكتملة', message: 'يرجى استكمال أسماء الأطراف وموضوع الدعوى.' });
            return;
        }
        const generatedCode = `MOJ-KW-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        setCreatedLawsuitCode(generatedCode);
        setCreatedLawsuitModal(true);
        triggerAudioTone(880, 0.35);
        addToast({
            type: 'success',
            title: 'تم قيد الدعوى بالمنظومة الإلكترونية',
            message: `تم تسجيل القضية برقم آلي موحد: ${generatedCode}`
        });
    };

    const handleCreateExecutionOrder = () => {
        if (!newExecData.debtor || !newExecData.amount) {
            addToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى إدخال اسم المدين والمبلغ المحكوم به.' });
            return;
        }
        const newEntry: ExecutionAction = {
            id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
            caseNumber: newExecData.caseNumber,
            debtor: newExecData.debtor,
            creditor: newExecData.creditor,
            amount: `${newExecData.amount} د.ك`,
            targetEntity: newExecData.targetEntity,
            actionType: newExecData.actionType,
            status: 'EXECUTED_AUTOMATED',
            date: new Date().toISOString().split('T')[0],
            digitalWarrantId: `WRN-AUT-${Math.floor(10000 + Math.random() * 90000)}`
        };
        setExecutionList([newEntry, ...executionList]);
        setNewExecModalOpen(false);
        setNewExecData({
            caseNumber: '7720 / 2026 تنفيذ',
            debtor: '',
            creditor: 'مكتب المحامي صبري شطا (وكيلاً)',
            amount: '',
            targetEntity: 'مصرف الكويت المركزي',
            actionType: 'حجز ما للمدين لدى البنوك'
        });
        triggerAudioTone(900, 0.3);
        addToast({ type: 'success', title: 'تم التفعيل اللحظي', message: 'تم رفع أمر التنفيذ للجهة المحددة فورياً.' });
    };

    const handleGenerateExpertObjection = async () => {
        setIsGeneratingObjection(true);
        try {
            const prompt = `أنت رئيس قسم الطعون الفنية بإدارة الخبراء بوزارة العدل الكويتية.
صغ صحيفة اعتراض وطعن فني على التقرير المبدئي للخبير:
- القضية: ${selectedExpertCase.caseNumber}
- الخبير: ${selectedExpertCase.expertName}
- النزاع: ${selectedExpertCase.subject}
- خلاصة التقرير المبدئي: ${selectedExpertCase.preliminaryReportSummary}

قدم صحيفة اعتراض رسمية موجزة مع الأسباب الفنية والطلبات الختامية.`;

            const res = await geminiService.generateContent(prompt);
            setGeneratedObjectionText(res || 'تمت صياغة صحيفة الاعتراض الفني على التقرير بنجاح.');
            setExpertReferrals(prev => prev.map(item => item.id === selectedExpertCase.id ? { ...item, objectionDrafted: true } : item));
            addToast({ type: 'success', title: 'تمت الصياغة الفنية', message: 'تم إعداد صحيفة الطعن والاعتراض الفني.' });
        } catch (e) {
            const fallback = `**صحيفة اعتراض وطعن فني على التقرير المبدئي للخبير**\n\n**إلى السيد رئيس قسم إدارة الخبراء بوزارة العدل الموقر**\n**في الدعوى رقم:** ${selectedExpertCase.caseNumber}\n**الخبير المندوب:** ${selectedExpertCase.expertName}\n\n**الدفوع والأسباب الفنية:**\n1. أخطأ التقرير المبدئي في احتساب النسبة المئوية للمصروفات، وتجاهل الحافظة رقم (2).\n2. إغفال الخبير لمعاينة الموقع والمخازن بحضور الأطراف والمهندسين.\n\n**الطلبات الختامية:**\nإعادة فتح باب المناقشة واستدعاء الخبير لإستدراك الأخطاء المحاسبية والهندسية.`;
            setGeneratedObjectionText(fallback);
            addToast({ type: 'info', title: 'نموذج الاعتراض', message: 'تم إنشاء صيغة نموذج الاعتراض الفني.' });
        } finally {
            setIsGeneratingObjection(false);
        }
    };

    const handlePrintOfficial = (title: string, bodyText: string) => {
        setPrintableContent(`
            <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 40px; line-height: 1.8;">
                <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px;">
                    <h2 style="margin:0; color: #0f172a;">دولة الكويت - وزارة العدل</h2>
                    <h3 style="margin:5px 0; color: #475569;">منظومة التقاضي الذكية - مكتب صبري شطا للمحاماة</h3>
                    <p style="margin:0; font-size: 11px; color: #64748b;">مستند رسمي معتمد - كود الاستدلال الرقمي: ADF-MOJ-${Date.now().toString().slice(-6)}</p>
                </div>
                <h3 style="color: #0284c7; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">${title}</h3>
                <div style="white-space: pre-wrap; font-size: 13px; color: #1e293b;">${bodyText}</div>
                <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold;">
                    <div>توقيع المحامي المسؤول: .......................</div>
                    <div>ختم الجلسة / الإدارة: .......................</div>
                </div>
            </div>
        `);
        setPrintModalOpen(true);
    };

    const executeBrowserPrint = () => {
        if (!printableContent) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>طباعة بالترويسة الرسمية - نظام عدالة</title></head>
                    <body onload="window.print(); window.close();">${printableContent}</body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleExportCSV = (dataTitle: string) => {
        let csvRows = [];
        if (dataTitle === 'CASES') {
            csvRows = [
                ['رقم الدعوى', 'المحكمة', 'الدائرة', 'المدعي', 'المدعى عليه', 'المبلغ', 'الحالة', 'تاريخ الجلسة'],
                ...filteredCases.map(c => [c.caseNumber, c.courtName, c.circuit, c.claimant, c.defendant, c.claimAmount, c.status, c.nextDate])
            ];
        } else if (dataTitle === 'EXECUTION') {
            csvRows = [
                ['رقم القضية', 'المدين', 'الدائن', 'المبلغ', 'الجهة المستهدفة', 'نوع الأمر', 'الحالة', 'التاريخ'],
                ...executionList.map(e => [e.caseNumber, e.debtor, e.creditor, e.amount, e.targetEntity, e.actionType, e.status, e.date])
            ];
        } else {
            csvRows = [
                ['رقم القضية', 'الدائرة الفنية', 'الخبير', 'موضوع النزاع', 'التاريخ', 'الحالة'],
                ...expertReferrals.map(ex => [ex.caseNumber, ex.courtDepartment, ex.expertName, ex.subject, ex.nextSessionDate, ex.status])
            ];
        }

        const csvString = csvRows.map(row => row.map(val => `"${val}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${dataTitle}_Adala_Export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast({ type: 'success', title: 'تم التصدير', message: 'تم تحميل الملف بصيغة Excel/CSV بنجاح.' });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-900 dir-rtl" dir="rtl">

            {/* HEADER BANNER */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                            <Landmark className="w-3.5 h-3.5" />
                            <span>منظومة التقاضي الرقمي والمحاكمة الافتراضية الموحدة</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <span>بوابة المنظومة القضائية وإدارة التقاضي الذكية</span>
                        </h1>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl font-medium leading-relaxed">
                            إدارة متكاملة لدورة الدعوى: قيد صحف الدعاوى، المرافعة الافتراضية، أوامر التنفيذ والحظر البنكي، ومتابعة جلسات الخبراء.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700/80 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-xs">
                            <span className="text-slate-400 font-bold block">الربط البرمجي مع وزارة العدل:</span>
                            <span className="font-black text-emerald-400">نشط ومتصل (قصر العدل والتنفيذ)</span>
                        </div>
                    </div>
                </div>

                {/* 4 CLEAN KPI CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                            <span>متوسط زمن الفصل</span>
                            <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-xl font-black text-white">14 يوم عمل</div>
                        <span className="text-[10px] font-bold text-emerald-400">↑ تسريع بنسبة 85%</span>
                    </div>

                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                            <span>الجلسات الافتراضية</span>
                            <Video className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-xl font-black text-white">98.4% عن بُعد</div>
                        <span className="text-[10px] font-bold text-blue-300">متابعة وعقد مباشر</span>
                    </div>

                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                            <span>أوامر التنفيذ والمنع</span>
                            <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-xl font-black text-white">24,850 أمر نشط</div>
                        <span className="text-[10px] font-bold text-amber-300">ربط مع 11 بنكاً والداخلية</span>
                    </div>

                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                            <span>التسويات والسندات</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-xl font-black text-white">82% إنجاز ودّي</div>
                        <span className="text-[10px] font-bold text-emerald-400">سندات تنفيذية موثقة</span>
                    </div>
                </div>
            </div>

            {/* TOP NAVIGATION TABS (5 STREAMLINED TABS) */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
                <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold w-full">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'overview'
                                ? 'bg-slate-900 text-white font-black shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>لوحة القيادة والخدمات</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('case_filing_wizard')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'case_filing_wizard'
                                ? 'bg-slate-900 text-white font-black shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <FilePlus className="w-4 h-4 text-emerald-500" />
                        <span>بوابة الصحائف والقيد الرقمي (MOJ Wizard)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('virtual_court')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'virtual_court'
                                ? 'bg-slate-900 text-white font-black shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Video className="w-4 h-4 text-blue-500" />
                        <span>المحاكمة الافتراضية (Live Court Simulator)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('smart_execution')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'smart_execution'
                                ? 'bg-slate-900 text-white font-black shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>التنفيذ وأوامر المنع</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('expert_sessions')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'expert_sessions'
                                ? 'bg-slate-900 text-white font-black shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>إدارات الخبراء والتقارير</span>
                    </button>
                </div>
            </div>

            {/* FILTER BAR (SMART INTERACTIONS) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Filter className="w-4 h-4 text-amber-500" />
                        <span>تصفية واستعلام الدوائر القضائية:</span>
                    </div>

                    <button
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إعادة الضبط السريع</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث برقم القضية، اسم الخصم، أو القاضي..."
                            className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                        />
                    </div>

                    {/* Circuit Filter */}
                    <div>
                        <select
                            value={circuitFilter}
                            onChange={(e) => setCircuitFilter(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-slate-800"
                        >
                            <option value="ALL">جميع الدوائر القضائية</option>
                            <option value="COMMERCIAL">الدائرة التجارية الكلية</option>
                            <option value="CIVIL">الدائرة المدنية</option>
                            <option value="FAMILY">دائرة الأسرة والأحوال</option>
                            <option value="EXPERTS">شعبة الخبراء والتقارير</option>
                            <option value="SETTLEMENT">دائرة الصلح والتسوية</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-slate-800"
                        >
                            <option value="ALL">جميع حالات الدعاوى</option>
                            <option value="HEARING_TODAY">جلسة اليوم (منعقدة)</option>
                            <option value="EXECUTION_PENDING">قيد أمر التنفيذ</option>
                            <option value="IN_EXPERTS">محالة للخبراء</option>
                            <option value="SETTLED">صلح وتم تسويتها</option>
                            <option value="ACTIVE">قيد المتابعة العادية</option>
                        </select>
                    </div>

                    {/* Date/Timeframe Filter */}
                    <div>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-slate-800"
                        >
                            <option value="ALL">جميع الفترات الزمنية</option>
                            <option value="TODAY">اليوم فقط</option>
                            <option value="EXECUTION">أوامر التنفيذ العاجلة</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* TAB CONTENT RENDERERS */}
            <AnimatePresence mode="wait">

                {/* TAB 1: OVERVIEW & DASHBOARD */}
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        {/* QUICK SERVICES SHORTCUT CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 transition-all">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                                    <FilePlus className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 text-sm">قيد الصحائف (MOJ Wizard)</h3>
                                    <p className="text-slate-500 text-xs">خطوات مبسطة لقيد الدعوى واحتساب الروم القضائية.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('case_filing_wizard')}
                                    className="w-full py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                                >
                                    <span>بدء القيد الرقمي</span>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 text-sm">المحاكمة الافتراضية</h3>
                                    <p className="text-slate-500 text-xs">حضور الجلسات وتدوين وإيداع مذكرات الدفاع فورياً.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('virtual_court')}
                                    className="w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                                >
                                    <span>دخول الجلسة الحالية</span>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-amber-300 transition-all">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 text-sm">التنفيذ وأوامر المنع</h3>
                                    <p className="text-slate-500 text-xs">حجز البنوك الـ 11 وإصدار أوامر منع السفر والربط.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('smart_execution')}
                                    className="w-full py-2 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                                >
                                    <span>متابعة التنفيذ والجبر</span>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 transition-all">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 text-sm">إدارات الخبراء والتقارير</h3>
                                    <p className="text-slate-500 text-xs">متابعة الجلسات المحاسبية والهندسية وصياغة الاعتراضات.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('expert_sessions')}
                                    className="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                                >
                                    <span>فحص الخبراء والتقارير</span>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* MASTER CASES TABLE (CLEAN ANTI-CLUTTER) */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <h2 className="font-black text-slate-900 text-base flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-amber-500" />
                                        <span>جدول الرصد القضائي الشامل للجدول العام</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">عرض الدعاوى والإشعارات القانونية المسجلة بالجدول الموحد ({filteredCases.length} قضية)</p>
                                </div>

                                <button
                                    onClick={() => handleExportCSV('CASES')}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                    <span>تصدير البيانات</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-3.5">رقم الدعوى والمحكمة</th>
                                            <th className="p-3.5">الدائرة القضائية</th>
                                            <th className="p-3.5">المدعي والمدعى عليه</th>
                                            <th className="p-3.5">المبلغ المطالب به</th>
                                            <th className="p-3.5">الحالة والإجراء</th>
                                            <th className="p-3.5 text-center">أدوات الإجراءات السريعة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {filteredCases.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="p-3.5">
                                                    <span className="font-black text-slate-900 block">{c.caseNumber}</span>
                                                    <span className="text-[11px] text-slate-500">{c.courtName}</span>
                                                </td>
                                                <td className="p-3.5 text-slate-700 font-bold">{c.circuit}</td>
                                                <td className="p-3.5">
                                                    <span className="text-slate-900 font-bold block">المدعي: {c.claimant}</span>
                                                    <span className="text-slate-500 text-[11px] block">الخصم: {c.defendant}</span>
                                                </td>
                                                <td className="p-3.5 font-black text-emerald-700">{c.claimAmount}</td>
                                                <td className="p-3.5">
                                                    {c.status === 'HEARING_TODAY' && (
                                                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                                                            <Video className="w-3 h-3 text-amber-600" /> الجلسة اليوم
                                                        </span>
                                                    )}
                                                    {c.status === 'EXECUTION_PENDING' && (
                                                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                                                            <Zap className="w-3 h-3 text-rose-600" /> قيد أمر التنفيذ
                                                        </span>
                                                    )}
                                                    {c.status === 'IN_EXPERTS' && (
                                                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                                                            <Users className="w-3 h-3 text-indigo-600" /> محالة للخبراء
                                                        </span>
                                                    )}
                                                    {c.status === 'SETTLED' && (
                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> تم الصلح والإنهاء
                                                        </span>
                                                    )}
                                                    {c.status === 'ACTIVE' && (
                                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                                                            قيد المتابعة
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCaseModal(c);
                                                                setPreviewModalOpen(true);
                                                            }}
                                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                                                            title="معاينة تفاصيل الدعوى"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                            <span>معاينة</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handlePrintOfficial(`شهادة قيد وتفاصيل الدعوى ${c.caseNumber}`, `المحكمة: ${c.courtName}\nالدائرة: ${c.circuit}\nالمدعي: ${c.claimant}\nالمدعى عليه: ${c.defendant}\nالمبلغ: ${c.claimAmount}\nتاريخ الجلسة القادمة: ${c.nextDate}\nاسم القاضي/الخبير: ${c.judge}`)}
                                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                                                            title="طباعة بالترويسة الرسمية"
                                                        >
                                                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                                                            <span>طباعة</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 2: CASE FILING WIZARD */}
                {activeTab === 'case_filing_wizard' && (
                    <motion.div
                        key="case_filing_wizard"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <FilePlus className="w-5 h-5 text-emerald-600" />
                                        <span>معالج قيد صحف الدعاوى الإلكترونية الموحد (بوابة وزارة العدل)</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">استكمال خطوات قيد القضية واحتساب الروم القضائية والرسم النسبي فورياً.</p>
                                </div>

                                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
                                    {[1, 2, 3, 4, 5].map((step) => (
                                        <button
                                            key={step}
                                            onClick={() => setWizardStep(step)}
                                            className={`px-3 py-1.5 rounded-xl transition-all ${
                                                wizardStep === step
                                                    ? 'bg-emerald-600 text-white font-black shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            الخطوة {step}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* STEP 1 */}
                            {wizardStep === 1 && (
                                <div className="space-y-4 text-xs font-bold max-w-2xl mx-auto">
                                    <h3 className="font-black text-slate-900 text-sm border-b pb-2">الخطوة 1: تحديد درجة المحكمة والمجمع والدائرة القضائية</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-slate-700">درجة المحكمة:</label>
                                            <select
                                                value={filingData.courtLevel}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, courtLevel: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            >
                                                <option value="المحكمة الكلية">المحكمة الكلية (ابتدائي)</option>
                                                <option value="محكمة الاستئناف">محكمة الاستئناف العليا</option>
                                                <option value="محكمة التمييز">محكمة التمييز</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-slate-700">مجمع المحاكم / المقر:</label>
                                            <select
                                                value={filingData.courtVenue}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, courtVenue: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            >
                                                <option value="مجمع محاكم قصر العدل">مجمع محاكم قصر العدل (العاصمة)</option>
                                                <option value="مجمع محاكم حولي">مجمع محاكم حولي</option>
                                                <option value="مجمع محاكم الفروانية">مجمع محاكم الفروانية</option>
                                                <option value="مجمع محاكم الأحمدي">مجمع محاكم الأحمدي</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-slate-700">الدائرة القضائية المتخصصة:</label>
                                        <select
                                            value={filingData.circuit}
                                            onChange={(e) => setFilingData(prev => ({ ...prev, circuit: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        >
                                            <option value="الدائرة التجارية الكلية">الدائرة التجارية الكلية (شركات وتوريد)</option>
                                            <option value="الدائرة المدنية الكلية">الدائرة المدنية الكلية (تعويضات)</option>
                                            <option value="دائرة المنازعات العمالية">دائرة المنازعات العمالية</option>
                                            <option value="دائرة الأحوال الشخصية والأسرة">دائرة الأحوال الشخصية والأسرة</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setWizardStep(2)}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                                    >
                                        <span>الانتقال لإدخال أطراف الدعوى</span>
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {wizardStep === 2 && (
                                <div className="space-y-4 text-xs font-bold max-w-2xl mx-auto">
                                    <h3 className="font-black text-slate-900 text-sm border-b pb-2">الخطوة 2: أطراف الدعوى وعناوين الإعلان المعتمدة</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-slate-700">المدعي (اسم الشركة / الشخص):</label>
                                            <input
                                                type="text"
                                                value={filingData.claimantName}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, claimantName: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-slate-700">الرقم المدني / السجل للمدعي:</label>
                                            <input
                                                type="text"
                                                value={filingData.claimantCivilId}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, claimantCivilId: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-slate-700">المدعى عليه (الخصم):</label>
                                            <input
                                                type="text"
                                                value={filingData.defendantName}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, defendantName: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-slate-700">الرقم المدني / السجل للمدعى عليه:</label>
                                            <input
                                                type="text"
                                                value={filingData.defendantCivilId}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, defendantCivilId: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-slate-700">موطن إعلان الخصم (لتوجيه المحضرين):</label>
                                        <input
                                            type="text"
                                            value={filingData.opponentAddress}
                                            onChange={(e) => setFilingData(prev => ({ ...prev, opponentAddress: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setWizardStep(1)}
                                            className="w-1/3 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                                        >
                                            السابق
                                        </button>
                                        <button
                                            onClick={() => setWizardStep(3)}
                                            className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                                        >
                                            <span>الانتقال لموضوع ووقائع الدعوى</span>
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {wizardStep === 3 && (
                                <div className="space-y-4 text-xs font-bold max-w-2xl mx-auto">
                                    <h3 className="font-black text-slate-900 text-sm border-b pb-2">الخطوة 3: موضوع القضية، الوقائع، والطلبات الختامية</h3>

                                    <div>
                                        <label className="block mb-1 text-slate-700">عنوان وموضوع الدعوى:</label>
                                        <input
                                            type="text"
                                            value={filingData.subjectTitle}
                                            onChange={(e) => setFilingData(prev => ({ ...prev, subjectTitle: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-slate-700">شرح موجز الوقائع والأسانيد:</label>
                                        <textarea
                                            rows={4}
                                            value={filingData.facts}
                                            onChange={(e) => setFilingData(prev => ({ ...prev, facts: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-slate-700">المبلغ المطالب به (دينار كويتي KWD):</label>
                                            <input
                                                type="number"
                                                value={filingData.claimAmount}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, claimAmount: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-slate-700">الأسانيد والمواد القانونية:</label>
                                            <input
                                                type="text"
                                                value={filingData.legalBasis}
                                                onChange={(e) => setFilingData(prev => ({ ...prev, legalBasis: e.target.value }))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setWizardStep(2)}
                                            className="w-1/3 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                                        >
                                            السابق
                                        </button>
                                        <button
                                            onClick={() => setWizardStep(4)}
                                            className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                                        >
                                            <span>الانتقال لحافظة المستندات</span>
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 */}
                            {wizardStep === 4 && (
                                <div className="space-y-4 text-xs font-bold max-w-2xl mx-auto">
                                    <h3 className="font-black text-slate-900 text-sm border-b pb-2">الخطوة 4: حوافظ المستندات والأدلة المرفقة</h3>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                        <span className="block text-slate-700 font-bold">المستندات المرفقة بحافظة المستندات الأولى:</span>
                                        <ul className="space-y-2">
                                            {filingData.documents.map((doc, idx) => (
                                                <li key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                                                    <span className="flex items-center gap-2 text-slate-800">
                                                        <FileText className="w-4 h-4 text-emerald-600" />
                                                        <span>مستند {idx + 1}: {doc}</span>
                                                    </span>
                                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">مفهرس وموثق</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setWizardStep(3)}
                                            className="w-1/3 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                                        >
                                            السابق
                                        </button>
                                        <button
                                            onClick={() => setWizardStep(5)}
                                            className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                                        >
                                            <span>الانتقال لحساب الروم والقيد النهائي</span>
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5 */}
                            {wizardStep === 5 && (
                                <div className="space-y-4 text-xs font-bold max-w-2xl mx-auto">
                                    <h3 className="font-black text-slate-900 text-sm border-b pb-2">الخطوة 5: حساب الروم القضائية والقيد التلقائي</h3>

                                    <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 border border-slate-800">
                                        <h4 className="font-black text-amber-400 text-xs">تفاصيل الروم القضائية المستحقة:</h4>
                                        <div className="space-y-1.5 text-xs text-slate-300">
                                            <div className="flex justify-between border-b border-slate-800 pb-1">
                                                <span>الرسم الثابت لافتتاح الدعوى:</span>
                                                <span className="font-black text-white">10.000 د.ك</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1">
                                                <span>الرسم النسبي (2% من مبلغ المطالبة {filingData.claimAmount} د.ك):</span>
                                                <span className="font-black text-white">{(parseFloat(filingData.claimAmount || '0') * 0.02).toFixed(3)} د.ك</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800 pb-1">
                                                <span>دمغات قضائية وإشعار إعلان المحضرين:</span>
                                                <span className="font-black text-white">5.000 د.ك</span>
                                            </div>
                                            <div className="flex justify-between pt-2 text-sm font-black text-emerald-400">
                                                <span>إجمالي الروم المطلوبة للسداد:</span>
                                                <span>{(10 + 5 + parseFloat(filingData.claimAmount || '0') * 0.02).toFixed(3)} د.ك</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCompleteFilingWizard}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                                    >
                                        <CheckCircle className="w-5 h-5 text-amber-300" />
                                        <span>سداد الرسوم وقيد الدعوى بجدول المحكمة فورياً</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: VIRTUAL COURT SIMULATOR */}
                {activeTab === 'virtual_court' && (
                    <motion.div
                        key="virtual_court"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* COURT STAGE & TRANSSCRIPT */}
                            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 text-white space-y-6 border border-slate-800 shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                            <span className="text-xs font-black text-rose-400">بث مباشر - جلسة افتراضية علنية</span>
                                        </div>
                                        <h2 className="text-lg font-black text-white">{selectedHearing.caseNumber}</h2>
                                        <p className="text-xs text-slate-400">{selectedHearing.courtVenue}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black">
                                        {selectedHearing.judgeName}
                                    </span>
                                </div>

                                {/* Virtual Video Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className={`bg-slate-800 rounded-2xl p-4 border aspect-video flex flex-col justify-between ${activeSpeaker === 'القاضي' ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-700'}`}>
                                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md self-start font-bold">منصة القضاء</span>
                                        <div className="text-center my-auto">
                                            <p className="text-xs font-black text-white">{selectedHearing.judgeName}</p>
                                            <span className="text-[10px] text-slate-400 block">رئيس الدائرة</span>
                                        </div>
                                    </div>

                                    <div className={`bg-slate-800 rounded-2xl p-4 border aspect-video flex flex-col justify-between ${activeSpeaker?.includes('صبري شطا') ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-slate-700'}`}>
                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md self-start font-bold">وكيل المدعي</span>
                                        <div className="text-center my-auto">
                                            <p className="text-xs font-black text-white">مكتب صبري شطا</p>
                                            <span className="text-[10px] text-slate-400 block">وكيلاً عن المدعي</span>
                                        </div>
                                    </div>

                                    <div className={`bg-slate-800 rounded-2xl p-4 border aspect-video flex flex-col justify-between ${activeSpeaker === 'وكيل المدعى عليه' ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-slate-700'}`}>
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md self-start font-bold">وكيل المدعى عليه</span>
                                        <div className="text-center my-auto">
                                            <p className="text-xs font-black text-white">دفاع الخصم</p>
                                            <span className="text-[10px] text-slate-400 block">وكيلاً عن المدعى عليه</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Speech Triggers */}
                                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
                                    <span className="text-xs font-black text-amber-400 block">محاكاة المرافعة الشفهية الفورية:</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <button
                                            onClick={() => handleSimulateSpeech('القاضي', 'افتتحت الجلسة الافتراضية بالصوت والصورة.')}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-xl text-[11px] font-bold"
                                        >
                                            افتتاح الجلسة
                                        </button>

                                        <button
                                            onClick={() => handleSimulateSpeech('مكتب صبري شطا (دفاع)', 'حاضر عن المدعي، ونتمسك بطلبات صحيفة الدعوى.')}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-xl text-[11px] font-bold"
                                        >
                                            مرافعة المدعي
                                        </button>

                                        <button
                                            onClick={() => handleSimulateSpeech('وكيل المدعى عليه', 'نلتمس أجلاً للاطلاع والرد وتقديم تقرير الخبير.')}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-blue-300 rounded-xl text-[11px] font-bold"
                                        >
                                            طلب الخصم
                                        </button>

                                        <button
                                            onClick={() => handleSimulateSpeech('القاضي', 'قررت المحكمة تأجيل الجلسة وتصريح مذكرات ختامية.')}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-rose-300 rounded-xl text-[11px] font-bold"
                                        >
                                            قرار المحكمة
                                        </button>
                                    </div>
                                </div>

                                {/* Instant Brief Deposit */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-300 block">إيداع مذكرة دفاع إلكترونية بالجلسة:</label>
                                    <div className="flex gap-2">
                                        <textarea
                                            rows={2}
                                            value={newMemoText}
                                            onChange={(e) => setNewMemoText(e.target.value)}
                                            placeholder="اكتب خلاصة المذكرة الفورية لإثباتها مباشرة بمحضر ضبط الجلسة..."
                                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                                        />
                                        <button
                                            onClick={handleSendEMemo}
                                            className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shrink-0"
                                        >
                                            إيداع
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* MINUTES & LOGS */}
                            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
                                        <span>محضر ضبط الجلسة اللحظي</span>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">موثق آلياً</span>
                                    </h3>

                                    <div className="space-y-3 max-h-96 overflow-y-auto pl-1">
                                        {selectedHearing.transcript.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                                                <div className="flex justify-between font-bold text-slate-500 text-[10px]">
                                                    <span>{item.speaker}</span>
                                                    <span>{item.time}</span>
                                                </div>
                                                <p className="text-slate-800 font-medium leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePrintOfficial(`محضر ضبط الجلسة الافتراضية ${selectedHearing.caseNumber}`, selectedHearing.transcript.map(t => `[${t.time}] ${t.speaker}: ${t.text}`).join('\n\n'))}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                                >
                                    <Printer className="w-4 h-4 text-amber-400" />
                                    <span>طباعة محضر الجلسة بالترويسة الرسمية</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 4: EXECUTION & TRAVEL BANS */}
                {activeTab === 'smart_execution' && (
                    <motion.div
                        key="smart_execution"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <h2 className="font-black text-slate-900 text-base flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        <span>إدارة أوامر التنفيذ الجبري والحظر والمنع المباشر</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">ربط برمجي مع البنوك الـ 11 وإدارة المنافذ والتوثيق العقاري.</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setNewExecModalOpen(true)}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>إدراج أمر تنفيذ جديد</span>
                                    </button>

                                    <button
                                        onClick={() => handleExportCSV('EXECUTION')}
                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-3.5">رقم الأمر والملف</th>
                                            <th className="p-3.5">المدين المطالب</th>
                                            <th className="p-3.5">المبلغ المحكوم به</th>
                                            <th className="p-3.5">الجهة المستهدفة</th>
                                            <th className="p-3.5">نوع أمر التنفيذ</th>
                                            <th className="p-3.5">الحالة</th>
                                            <th className="p-3.5 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {executionList.map((e) => (
                                            <tr key={e.id} className="hover:bg-slate-50 transition-all">
                                                <td className="p-3.5">
                                                    <span className="font-black text-slate-900 block">{e.id}</span>
                                                    <span className="text-[11px] text-slate-500">{e.caseNumber}</span>
                                                </td>
                                                <td className="p-3.5 font-bold text-slate-900">{e.debtor}</td>
                                                <td className="p-3.5 font-black text-emerald-700">{e.amount}</td>
                                                <td className="p-3.5 text-slate-700 font-bold">{e.targetEntity}</td>
                                                <td className="p-3.5">
                                                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                                                        {e.actionType}
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                                                        منفذ آلياً بالنظام
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handlePrintOfficial(`أمر تنفيذ رقم ${e.id} - ${e.actionType}`, `رقم القضية: ${e.caseNumber}\nاسم المدين: ${e.debtor}\nاسم الدائن: ${e.creditor}\nالمبلغ: ${e.amount}\nالجهة الموجه إليها: ${e.targetEntity}\nرقم المرجع الرقمي: ${e.digitalWarrantId}`)}
                                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                                                        >
                                                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                                                            <span>طباعة</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 5: EXPERT SESSIONS & REPORTS */}
                {activeTab === 'expert_sessions' && (
                    <motion.div
                        key="expert_sessions"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* EXPERT CASES LIST */}
                            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                                <h2 className="font-black text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <span>قائمة قضايا ندب الخبراء</span>
                                </h2>

                                <div className="space-y-3">
                                    {expertReferrals.map((ex) => (
                                        <div
                                            key={ex.id}
                                            onClick={() => setSelectedExpertCase(ex)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                                                selectedExpertCase.id === ex.id
                                                    ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-300'
                                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center text-xs font-black">
                                                <span className="text-slate-900">{ex.caseNumber}</span>
                                                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                                                    جلسة الخبير: {ex.nextSessionDate}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-xs font-bold">{ex.expertName}</p>
                                            <p className="text-slate-500 text-[11px] line-clamp-2">{ex.subject}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AUDIT & AI OBJECTION PANEL */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-base">{selectedExpertCase.caseNumber}</h3>
                                        <p className="text-xs text-slate-500">{selectedExpertCase.courtDepartment}</p>
                                    </div>

                                    <button
                                        onClick={handleGenerateExpertObjection}
                                        disabled={isGeneratingObjection}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>{isGeneratingObjection ? 'جاري صياغة الطعن الفني...' : 'صياغة صحيفة الاعتراض الفني (AI)'}</span>
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                    <span className="text-xs font-black text-slate-800 block">خلاصة التقرير المبدئي للخبير:</span>
                                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                        {selectedExpertCase.preliminaryReportSummary}
                                    </p>
                                </div>

                                {generatedObjectionText && (
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-indigo-900">مسودة صحيفة الاعتراض الفني والطعن:</span>
                                            <button
                                                onClick={() => handlePrintOfficial(`اعتراض فني على تقرير الخبير ${selectedExpertCase.caseNumber}`, generatedObjectionText)}
                                                className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                                            >
                                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                                <span>طباعة الصحيفة</span>
                                            </button>
                                        </div>

                                        <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl text-xs font-mono leading-relaxed max-h-80 overflow-y-auto space-y-2">
                                            <ReactMarkdown>{generatedObjectionText}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* PREVIEW CASE MODAL */}
            {previewModalOpen && selectedCaseModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-black text-slate-900 text-base">{selectedCaseModal.caseNumber}</h3>
                            <button onClick={() => setPreviewModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs font-bold text-slate-700">
                            <p>المحكمة: <span className="text-slate-900">{selectedCaseModal.courtName}</span></p>
                            <p>الدائرة القضائية: <span className="text-slate-900">{selectedCaseModal.circuit}</span></p>
                            <p>المدعي: <span className="text-slate-900">{selectedCaseModal.claimant}</span></p>
                            <p>المدعى عليه: <span className="text-slate-900">{selectedCaseModal.defendant}</span></p>
                            <p>المبلغ المطالب به: <span className="text-emerald-700">{selectedCaseModal.claimAmount}</span></p>
                            <p>القاضي / الخبير المسؤول: <span className="text-slate-900">{selectedCaseModal.judge}</span></p>
                            <p>تاريخ الجلسة القادمة: <span className="text-amber-700">{selectedCaseModal.nextDate}</span></p>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button
                                onClick={() => handlePrintOfficial(`شهادة تفاصيل القضية ${selectedCaseModal.caseNumber}`, `المحكمة: ${selectedCaseModal.courtName}\nالدائرة: ${selectedCaseModal.circuit}\nالمدعي: ${selectedCaseModal.claimant}\nالمدعى عليه: ${selectedCaseModal.defendant}\nالمبلغ: ${selectedCaseModal.claimAmount}`)}
                                className="px-4 py-2 bg-slate-900 text-white font-black text-xs rounded-xl flex items-center gap-1.5"
                            >
                                <Printer className="w-4 h-4 text-amber-400" />
                                <span>طباعة بالترويسة</span>
                            </button>
                            <button
                                onClick={() => setPreviewModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW EXECUTION ORDER MODAL */}
            {newExecModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-black text-slate-900 text-sm">إدراج أمر تنفيذ وحظر جديد</h3>
                            <button onClick={() => setNewExecModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs font-bold">
                            <div>
                                <label className="block mb-1 text-slate-700">رقم قضية التنفيذ:</label>
                                <input
                                    type="text"
                                    value={newExecData.caseNumber}
                                    onChange={(e) => setNewExecData(prev => ({ ...prev, caseNumber: e.target.value }))}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-slate-700">اسم المدين المطالب:</label>
                                <input
                                    type="text"
                                    value={newExecData.debtor}
                                    onChange={(e) => setNewExecData(prev => ({ ...prev, debtor: e.target.value }))}
                                    placeholder="أدخل اسم الشخص أو الشركة..."
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-slate-700">المبلغ المحكوم به (دينار كويتي):</label>
                                <input
                                    type="number"
                                    value={newExecData.amount}
                                    onChange={(e) => setNewExecData(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="مثال: 25000"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-slate-700">الجهة الموجه إليها الأمر الرقمي:</label>
                                <select
                                    value={newExecData.targetEntity}
                                    onChange={(e) => setNewExecData(prev => ({ ...prev, targetEntity: e.target.value }))}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="مصرف الكويت المركزي (11 بنك أهلي وتجاري)">مصرف الكويت المركزي (الحسابات البنكية)</option>
                                    <option value="وزارة الداخلية - المنافذ والجوازات">وزارة الداخلية (أمر منع السفر)</option>
                                    <option value="إدارة التسجيل العقاري والتوثيق">إدارة التسجيل العقاري (حظر العقارات)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 text-slate-700">نوع الإجراء التنفيذي:</label>
                                <select
                                    value={newExecData.actionType}
                                    onChange={(e) => setNewExecData(prev => ({ ...prev, actionType: e.target.value }))}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="حجز ما للمدين لدى البنوك">حجز ما للمدين لدى كافة البنوك</option>
                                    <option value="أمر منع سفر وتطبيقه آلياً">أمر منع سفر وتثبيته بالمنافذ</option>
                                    <option value="تأشير الحجز العقاري">تأشير الحجز العقاري بالسجل</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                            <button
                                onClick={handleCreateExecutionOrder}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
                            >
                                تفعيل وتوجيه الأمر الرقمي فورياً
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATED LAWSUIT SUCCESS MODAL */}
            {createdLawsuitModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 text-center shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <h3 className="font-black text-slate-900 text-base">تم قيد الدعوى بنجاح بالجدول الآلي</h3>
                        <p className="text-xs text-slate-500">تم السداد الإلكتروني وتمرير الصحيفة للجدول الآلي بوزارة العدل.</p>

                        <div className="bg-slate-900 text-amber-400 p-4 rounded-2xl font-mono text-sm font-black border border-slate-800">
                            الرقم الآلي الموحد: {createdLawsuitCode}
                        </div>

                        <button
                            onClick={() => {
                                setCreatedLawsuitModal(false);
                                setActiveTab('overview');
                            }}
                            className="w-full py-3 bg-slate-900 text-white font-black text-xs rounded-xl"
                        >
                            العودة للوحة القيادة
                        </button>
                    </div>
                </div>
            )}

            {/* PRINT MODAL */}
            {printModalOpen && printableContent && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-black text-slate-900 text-sm">معاينة المستند قبل الطباعة الرسمية</h3>
                            <button onClick={() => setPrintModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="border p-4 rounded-2xl bg-slate-50 max-h-96 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: printableContent }} />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button
                                onClick={executeBrowserPrint}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                            >
                                <Printer className="w-4 h-4" />
                                <span>بدء الطباعة الرسمية</span>
                            </button>
                            <button
                                onClick={() => setPrintModalOpen(false)}
                                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SmartJudicialSystemPage;
