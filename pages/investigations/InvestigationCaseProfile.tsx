import React, { useState, useEffect } from 'react';
import { Investigation, InvestigationSession, InvestigationQuestion, InvestigationPartyType, Employee } from '../../types';
import { INVESTIGATION_TEMPLATES, KUWAIT_LABOR_LAW_INVESTIGATION_RULES } from '../../constants';
import { geminiService } from '../../services/geminiService';
import { sampleEmployees } from '../../data/employeeData';
import SignaturePad from '../../components/ui/SignaturePad';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { 
    Gavel, Users, ShieldAlert, FileText, ClipboardList, ShieldCheck, 
    History, PlusCircle, Trash2, CheckCircle, Sparkles, AlertTriangle, 
    Printer, Send, FileCode, CheckSquare, Edit, Download, Paperclip
} from 'lucide-react';

interface InvestigationCaseProfileProps {
    isOpen: boolean;
    onClose: () => void;
    investigation: Investigation;
    onUpdate: (updated: Investigation) => void;
    onTriggerSummons: (witnessName?: string) => void;
}

export const InvestigationCaseProfile: React.FC<InvestigationCaseProfileProps> = ({
    isOpen,
    onClose,
    investigation,
    onUpdate,
    onTriggerSummons,
}) => {
    const { addToast } = useToast();
    const [currentTab, setCurrentTab] = useState<'profile' | 'sessions' | 'witnesses' | 'evidence' | 'ai-legal' | 'approvals' | 'logs'>('profile');
    
    // Core states
    const [localInvestigation, setLocalInvestigation] = useState<Investigation>(investigation);
    const [activeSession, setActiveSession] = useState<InvestigationSession | null>(null);
    const [isSessionEditorOpen, setIsSessionEditorOpen] = useState(false);
    
    // AI Loading States
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDraftingMemo, setIsDraftingMemo] = useState(false);
    const [aiSubjectCategory, setAiSubjectCategory] = useState('إهمال وظيفي');
    const [aiGeneratedMemo, setAiGeneratedMemo] = useState('');

    // Form states for additions
    const [newWitnessName, setNewWitnessName] = useState('');
    const [newWitnessPhone, setNewWitnessPhone] = useState('');
    const [newEvidenceName, setNewEvidenceName] = useState('');
    const [newEvidenceType, setNewEvidenceType] = useState('مستند ورقي رقمي');
    const [newEvidenceNotes, setNewEvidenceNotes] = useState('');

    useEffect(() => {
        setLocalInvestigation(investigation);
    }, [investigation]);

    const handleUpdateInvestigation = (updated: Investigation) => {
        setLocalInvestigation(updated);
        onUpdate(updated);
    };

    // --- Session editor nested states & save handlers ---
    const startNewSession = () => {
        const newSess: InvestigationSession = {
            id: `sess-${Date.now()}`,
            sessionDate: new Date().toISOString().split('T')[0],
            sessionTime: "10:00",
            partyName: localInvestigation.employeeName || "الموظف المستمع إليه",
            partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
            questions: [],
            notes: ''
        };
        setActiveSession(newSess);
        setIsSessionEditorOpen(true);
    };

    const editExistingSession = (sess: InvestigationSession) => {
        setActiveSession({ ...sess });
        setIsSessionEditorOpen(true);
    };

    const deleteSession = (sessId: string) => {
        if (!window.confirm("هل أنت متأكد من حذف هذه الجلسة كلياً؟")) return;
        const updated = {
            ...localInvestigation,
            sessions: localInvestigation.sessions.filter(s => s.id !== sessId),
            activityLogs: [
                ...(localInvestigation.activityLogs || []),
                { id: `log-${Date.now()}`, action: `تم حذف جلسة تحقيق للطرف من السجلات`, user: "المحقق المعتمد", timestamp: new Date().toISOString() }
            ]
        };
        handleUpdateInvestigation(updated);
        addToast({ type: 'success', title: 'تم الحذف', message: 'تم إزالة محضر الجلسة بنجاح.' });
    };

    // --- AI Question Generator ---
    const handleAiQuestions = async () => {
        setIsGeneratingQuestions(true);
        try {
            const aiQuestions = await geminiService.generateInvestigationQuestions(
                localInvestigation.subject, 
                aiSubjectCategory
            );
            if (activeSession && aiQuestions.length > 0) {
                const formattedQuestions: InvestigationQuestion[] = aiQuestions.map((qText, index) => ({
                    id: `q-ai-${Date.now()}-${index}`,
                    questionText: qText,
                    timestamp: new Date().toISOString()
                }));
                const updatedSession = {
                    ...activeSession,
                    questions: [...(activeSession.questions || []), ...formattedQuestions]
                };
                setActiveSession(updatedSession);
                addToast({ type: 'success', title: 'توليد الأسئلة', message: 'قام الذكاء الاصطناعي بإدراج أسئلة تحقيق تخصصية للواقعة.' });
            }
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'خطأ', message: 'فشل تواصل الخادم مع الذكاء الاصطناعي.' });
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const saveSessionInInvestigation = (sess: InvestigationSession) => {
        if (!sess.partyName || !sess.sessionDate) {
            addToast({ type: 'error', title: 'خطأ', message: 'يرجى استيفاء الحقول الأساسية للجلسة.' });
            return;
        }
        
        // Prevent duplicate session dates for the same employee
        const hasDuplicate = localInvestigation.sessions.some(s => s.id !== sess.id && s.sessionDate === sess.sessionDate && s.partyName === sess.partyName);
        if (hasDuplicate) {
            addToast({ type: 'warning', title: 'تنبيه تعارض المواعيد', message: 'هناك جلسة تحقيق مجدولة بالفعل لذات الطرف في هذا اليوم.' });
        }

        const isNew = !localInvestigation.sessions.some(s => s.id === sess.id);
        const updatedSessions = isNew 
            ? [...localInvestigation.sessions, sess] 
            : localInvestigation.sessions.map(s => s.id === sess.id ? sess : s);

        const updated = {
            ...localInvestigation,
            sessions: updatedSessions,
            activityLogs: [
                ...(localInvestigation.activityLogs || []),
                { 
                    id: `log-${Date.now()}`, 
                    action: isNew ? `تم توثيق محضر جلسة تحقيق جديدة للطرف ${sess.partyName}` : `تم تعديل بيانات وأسئلة محضر الجلسة للطرف ${sess.partyName}`, 
                    user: "المحقق الإداري", 
                    timestamp: new Date().toISOString() 
                }
            ]
        };

        handleUpdateInvestigation(updated);
        setIsSessionEditorOpen(false);
        setActiveSession(null);
        addToast({ type: 'success', title: 'تم الحفظ', message: 'تم حفظ محضر التحقيق وتحديث سجلات الإفادة بنجاح.' });
    };

    // --- Witness & Summons Handlers ---
    const addWitness = () => {
        if (!newWitnessName.trim()) return;
        
        // Double check duplicate witness name
        const isDup = (localInvestigation.witnesses || []).some(w => w.name.trim() === newWitnessName.trim());
        if (isDup) {
            addToast({ type: 'warning', title: 'تكرار اسم الشاهد', message: 'لقد تم إدراج هذا الشاهد مسبقاً في ملف التحقيق.' });
            return;
        }

        const newWit = {
            id: `wit-${Date.now()}`,
            name: newWitnessName,
            phone: newWitnessPhone || "غير متوفر",
            status: 'summoned' as 'summoned'
        };

        const updated = {
            ...localInvestigation,
            witnesses: [...(localInvestigation.witnesses || []), newWit],
            activityLogs: [
                ...(localInvestigation.activityLogs || []),
                { id: `log-${Date.now()}`, action: `تم تسجيل شاهد جديد: ${newWitnessName} وجاري إصدار إعلان إلكتروني`, user: "المحقق الإداري", timestamp: new Date().toISOString() }
            ]
        };

        handleUpdateInvestigation(updated);
        setNewWitnessName('');
        setNewWitnessPhone('');
        addToast({ type: 'success', title: 'تم تسجيل الشاهد', message: 'تمت الإضافة وجدولته للإفادة.' });
    };

    const toggleWitnessAttendance = (witId: string, currentStatus: string) => {
        const nextStatus = (currentStatus === 'summoned' ? 'attended' : currentStatus === 'attended' ? 'absent' : 'summoned') as 'summoned' | 'attended' | 'absent';
        const updatedWitnesses = (localInvestigation.witnesses || []).map(w => w.id === witId ? { ...w, status: nextStatus } : w);
        const witObj = (localInvestigation.witnesses || []).find(w => w.id === witId);

        const updated = {
            ...localInvestigation,
            witnesses: updatedWitnesses,
            activityLogs: [
                ...(localInvestigation.activityLogs || []),
                { id: `log-${Date.now()}`, action: `تحديث حالة حضور الشاهد ${witObj?.name} إلى: ${nextStatus === 'attended' ? 'حاضر وممتثل' : nextStatus === 'absent' ? 'متخلف عن المثول' : 'تم استدعاءه'}`, user: "المحقق الإداري", timestamp: new Date().toISOString() }
            ]
        };
        handleUpdateInvestigation(updated);
        addToast({ type: 'info', title: 'تحديث الحضور', message: `تم تعديل ممتثل الشاهد الشحصي.` });
    };

    // --- Evidence Ledger Handlers ---
    const addEvidence = () => {
        if (!newEvidenceName.trim()) return;
        const newEv = {
            id: `ev-${Date.now()}`,
            name: newEvidenceName,
            type: newEvidenceType,
            notes: newEvidenceNotes,
            dateAdded: new Date().toISOString().split('T')[0]
        };

        const updated = {
            ...localInvestigation,
            evidence: [...(localInvestigation.evidence || []), newEv],
            activityLogs: [
                ...(localInvestigation.activityLogs || []),
                { id: `log-${Date.now()}`, action: `إدراج حرز ومستند إثبات: ${newEvidenceName} من نوع: ${newEvidenceType}`, user: "المحقق الإداري", timestamp: new Date().toISOString() }
            ]
        };

        handleUpdateInvestigation(updated);
        setNewEvidenceName('');
        setNewEvidenceNotes('');
        addToast({ type: 'success', title: 'تم إرفاق الدليل', message: 'تم إدراج الحرز الثبوتي في ملف الأحراز والمستندات.' });
    };

    // --- AI Legal Analytics Engine ---
    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        
        // Compile testimonies text from sessions Q&As
        const compiledSessionsText = localInvestigation.sessions.map((sess, idx) => {
            const qaLines = sess.questions.map(q => `س: ${q.questionText}\nج: ${q.answerText || "(لم يجب)"}`).join('\n');
            return `--- محضر جلسة (${idx + 1}) مع الطرف: ${sess.partyName} (صفته: ${sess.partyType}) ---\n${qaLines}`;
        }).join('\n\n');

        const compiledViolations = (localInvestigation.violations || []).join(', ') || 'مخالفة سلوك وظيفي وإهمال';

        try {
            const analysisResult = await geminiService.analyzeInvestigation(
                localInvestigation.subject,
                compiledSessionsText,
                compiledViolations
            );

            const updatedRecommendations = `[تقرير معالجة الذكاء الاصطناعي]
■ ملخص الواقعة الإجرائي:
${analysisResult.summary}

■ تكييف الواقعة والتحليل الاستدلالي:
${analysisResult.analysis}

■ المواد والبنود القانونية الكويتية المنطبقة:
${analysisResult.applicableArticles.join(' | ')}

■ العقوبة والجزاء المقترح لوائحياً:
${analysisResult.proposedPenalties.join(' أو ')}

■ قرار لجنة الرأي والتوصية النهائية القانونية:
${analysisResult.recommendation}`;

            const updated = {
                ...localInvestigation,
                summary: analysisResult.summary,
                recommendation: updatedRecommendations,
                legalReferences: [...(localInvestigation.legalReferences || []), ...analysisResult.applicableArticles],
                activityLogs: [
                    ...(localInvestigation.activityLogs || []),
                    { id: `log-${Date.now()}`, action: `تم إجراء فحص استدلالي شامل بمساعد الذكاء الاصطناعي بنجاح وتوليد الأسانيد القانونية ورصيد الجزاء العمالي الكويتي`, user: "النظام (عدالة AI)", timestamp: new Date().toISOString() }
                ]
            };
            handleUpdateInvestigation(updated);
            addToast({ type: 'success', title: 'تحليل ذكي متكامل', message: 'تم تحديث ملخص القضية والأسانيد وعقوبات لائحة الجزاءات تلقائياً.' });
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'خطأ معالجة', message: 'تعذر على الذكاء الاصطناعي تحليل جلسات التحقيق.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- AI Prosecution Memo Drafter ---
    const handleAiMemoDraft = async () => {
        setIsDraftingMemo(true);
        try {
            const memoText = await geminiService.draftLegalMemo(
                localInvestigation.subject,
                localInvestigation.summary || "يرجى مراجعة محاضر الجلسات وتلخيص الواقعة",
                localInvestigation.recommendation || "التوصية هي إصدار إنذار وخصم من الراتب"
            );
            setAiGeneratedMemo(memoText);
            addToast({ type: 'success', title: 'صياغة المذكرة', message: 'تم صياغة مسودة المذكرة العمالية بنجاح.' });
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'فشل الصياغة', message: 'اصطدم النظام بخطأ مع خادم صياغة مذكرات الديباجة الكافية.' });
        } finally {
            setIsDraftingMemo(false);
        }
    };

    // --- Sign approvals simulated handler ---
    const signApprovalState = (appId: string, authorName: string) => {
        const updatedApprovals = (localInvestigation.approvals || []).map(app => 
            app.id === appId ? { ...app, status: 'APPROVED' as 'APPROVED', date: new Date().toISOString().split('T')[0] } : app
        );
        const appObj = (localInvestigation.approvals || []).find(a => a.id === appId);

        const updated = {
            ...localInvestigation,
            approvals: updatedApprovals,
            activityLogs: [
                ...(localInvestigation.activityLogs || []),
                { id: `log-${Date.now()}`, action: `اعتماد وتوقيع المذكرة من قبل ${appObj?.role}: ${authorName}`, user: authorName, timestamp: new Date().toISOString() }
            ]
        };
        handleUpdateInvestigation(updated);
        addToast({ type: 'success', title: 'تم توقيع الاعتماد', message: `تم رصد التوثيق والتصديق بنشاط الموظف المشرع.` });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`ملف التحقيق العمالي الإداري الشامل: ${localInvestigation.investigationNumber}`} size="full">
            <div className="flex flex-col lg:flex-row gap-6 h-[85vh] overflow-hidden text-right" dir="rtl">
                
                {/* Left side panel - Quick Stats & Progress indicator */}
                <div className="w-full lg:w-1/4 bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex flex-col justify-between overflow-y-auto">
                    <div className="space-y-4">
                        <div className="border-b pb-3 mb-2 flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-black text-slate-900 text-sm">أطراف الواقعة الاستقصائية</h3>
                        </div>

                        {/* Defendent Card preview */}
                        <div className="bg-white border p-3 rounded-lg shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400">المتهم / المحال للتحقيق</p>
                            <p className="font-bold text-sm text-slate-800 mt-1">{localInvestigation.employeeName || 'غير محدد'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{localInvestigation.employeeJobTitle || 'وظيفة عامة'} | {localInvestigation.employeeDepartment || 'إدارة العمليات'}</p>
                            <div className="flex gap-2.5 items-center mt-3 text-xs bg-indigo-50 border border-indigo-100 p-1.5 rounded text-indigo-800 font-bold font-sans">
                                <span>ID: {localInvestigation.employeeId || 'EMP00'}</span>
                            </div>
                        </div>

                        {/* Complainant Card */}
                        <div className="bg-white border p-3 rounded-lg shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400">مقدم الشكوى والادعاء</p>
                            <p className="font-bold text-sm text-slate-800 mt-1">{localInvestigation.complainantName || "إدارة النظم والمراقبة"}</p>
                            <p className="text-xs text-slate-500">{localInvestigation.complainantTitle || "المنظمة الإدارية"}</p>
                        </div>

                        {/* Summary status tracker */}
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border text-xs leading-relaxed space-y-2 font-sans">
                            <p className="font-black text-slate-700">■ الحالة الإجرائية الحالية للتحقيق:</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                                <span className="font-sans font-bold text-slate-900">{localInvestigation.status}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans">المحقق المسؤول: {localInvestigation.investigator}</p>
                            <p className="text-[10px] text-slate-500 font-sans">تاريخ المباشرة: {localInvestigation.startDate}</p>
                        </div>

                        {/* Quick action drawer */}
                        <div className="space-y-2">
                            <Button variant="primary" className="w-full text-xs" size="sm" onClick={() => onTriggerSummons()} leftIcon={<Users className="w-4 h-4"/>}>إصدار إعلان حضور الموظف</Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4 text-[10px] font-mono text-slate-400 text-center uppercase tracking-wider">
                        Adala Case Tracker • AI Enabled
                    </div>
                </div>

                {/* Right Tabbed Panel Workspace */}
                <div className="flex-grow flex flex-col h-full overflow-hidden">
                    {/* Tabs Headers Panel */}
                    <div className="flex gap-1.5 border-b pb-1 mb-4 overflow-x-auto select-none no-scrollbar">
                        {[
                            { id: 'profile', label: 'ملف الواقعة والادعاء', icon: <FileText className="w-4 h-4" /> },
                            { id: 'sessions', label: `سماح الأقوال والجلسات (${localInvestigation.sessions.length})`, icon: <ClipboardList className="w-4 h-4" /> },
                            { id: 'witnesses', label: `سجل الشهود والتبليغ (${(localInvestigation.witnesses || []).length})`, icon: <Users className="w-4 h-4" /> },
                            { id: 'evidence', label: `أحراز الإثبات والمرفقات (${(localInvestigation.evidence || []).length})`, icon: <Paperclip className="w-4 h-4" /> },
                            { id: 'ai-legal', label: 'التحليل القانوني ومذكرات الرأي', icon: <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> },
                            { id: 'approvals', label: 'مصفوفة الاعتمادات والتصديق', icon: <ShieldCheck className="w-4 h-4" /> },
                            { id: 'logs', label: 'سجلات المراجعة والأنشطة', icon: <History className="w-4 h-4" /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentTab(tab.id as any)}
                                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all border whitespace-nowrap ${currentTab === tab.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Active Tab Body Contents Panel */}
                    <div className="flex-grow overflow-y-auto pr-1 pb-10">
                        {currentTab === 'profile' && (
                            <div className="space-y-4">
                                <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
                                    <h4 className="font-black text-slate-900 text-base border-b pb-2">بيان المخالفة ومحضر الادعاء</h4>
                                    
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500">موضوع ملف الواقعة والاتهام:</p>
                                        <div className="bg-slate-50 border p-3 rounded-lg text-sm text-slate-800 font-bold whitespace-pre-wrap">
                                            {localInvestigation.subject}
                                        </div>
                                    </div>

                                    {(localInvestigation.violations && localInvestigation.violations.length > 0) && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-slate-500">التوصيف والمخالفات المرتكبة بالتحديد:</p>
                                            <ul className="list-disc list-inside text-xs pr-4 space-y-1 font-sans font-bold">
                                                {localInvestigation.violations.map((v, idx) => (
                                                    <li key={idx} className="bg-rose-50 border border-rose-100 text-rose-800 p-2 rounded-lg">■ {v}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500">أسانيد القانون الكويتي واللوائح المعمول بها:</p>
                                        <div className="flex flex-wrap gap-2 text-xs font-sans font-bold">
                                            {(localInvestigation.legalReferences || ['لوائح الانضباط ومخالفة السلوك الوظيفي العامة']).map((ref, idx) => (
                                                <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <span>§</span>
                                                    <span>{ref}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs shadow-sm">
                                        <p className="font-black flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            <span>دليل محطة التحقيق في قوانين العمل والخدمة المدنية الكويتية:</span>
                                        </p>
                                        <p className="mt-1 font-sans">بموجب قوانين الخدمة المدنية وقوانين العمل الكويتية بالقطاع الأهلي، لا يجوز توقيع جزاء عمالي تأديبي على العامل إلا بعد سؤاله وتدبير دفاعه وسماع شهوده كتابياً وإفادته بمحضر رسمي يحمل توقيعه الشخصي على كل صفحة من صفحات تفريغ التحقيق.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTab === 'sessions' && (
                            <div className="space-y-4">
                                {isSessionEditorOpen && activeSession ? (
                                    // SESSION WORKSPACE EDITOR
                                    <div className="bg-white border rounded-xl p-5 space-y-4 shadow-md border-t-4 border-indigo-600">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h4 className="font-black text-indigo-900 text-sm">محرر تفريغ وضبط أقاول جلسة الحضور</h4>
                                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">المعرف الفرعي: {activeSession.id}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Input label="تاريخ انعقاد الجلسة" type="date" value={activeSession.sessionDate} onChange={e => setActiveSession({...activeSession, sessionDate: e.target.value})} />
                                            <Input label="وقت الانعقاد" type="time" value={activeSession.sessionTime || "10:00"} onChange={e => setActiveSession({...activeSession, sessionTime: e.target.value})} />
                                            <Input label="صفة واسم الطرف المستجوب" value={activeSession.partyName} onChange={e => setActiveSession({...activeSession, partyName: e.target.value})} />
                                            <Select label="التوصيف والصفة القانونية" value={activeSession.partyType} options={[{value: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT, label: 'موظف (مشكو بحقه)'}, {value: InvestigationPartyType.WITNESS, label: 'شاهد'}, {value: InvestigationPartyType.EXPERT, label: 'خبير فني'}, {value: InvestigationPartyType.COMPLAINANT, label: 'مقدم الشكوى'}, {value: InvestigationPartyType.OTHER, label: 'طرف آخص'}]} onChange={e => setActiveSession({...activeSession, partyType: e.target.value as any})} />
                                        </div>

                                        {/* AI Question Tool */}
                                        <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-xs font-black text-indigo-900 flex items-center gap-1">
                                                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                                    <span>مساعد الذكاء الاصطناعي التوليدي لفرز وتصنيف الأسئلة</span>
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-sans mt-0.5">صياغة وتوليد أسئلة مواجهة احترافية تتماشى مع وقائع الشكوى والقانون الكويتي</p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <Select value={aiSubjectCategory} options={[{value: 'إهمال وظيفي وجسيم', label: 'إهمال وظيفي'}, {value: 'إفشاء أسرار عمل وبيانات مادية', label: 'إفشاء أسرار'}, {value: 'تزوير مستندات وتقارير طبية', label: 'تزوير مستندات'}, {value: 'غياب متكرر بدون إذن ومبرر', label: 'غياب بدون إذن'}, {value: 'مشاجرة وعصيان وأمر إداري', label: 'مشادات وعصيان'}]} onChange={e => setAiSubjectCategory(e.target.value)} containerClassName="mb-0" />
                                                <Button size="sm" variant="primary" onClick={handleAiQuestions} disabled={isGeneratingQuestions} rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                                                    {isGeneratingQuestions ? 'جاري التوليد...' : 'توليد الأسئلة'}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Questions & Testimony Q&A container */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <p className="font-black text-slate-800 text-xs">ضبط تفريغ السماع (سؤال وجواب):</p>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    const newQ: InvestigationQuestion = {
                                                        id: `q-${Date.now()}`,
                                                        questionText: 'س: ',
                                                        answerText: 'ج: ',
                                                        timestamp: new Date().toISOString()
                                                    };
                                                    setActiveSession({
                                                        ...activeSession,
                                                        questions: [...(activeSession.questions || []), newQ]
                                                    });
                                                }} leftIcon={<PlusCircle className="w-4 h-4"/>}>إدراج سؤال وجواب يدوياً</Button>
                                            </div>

                                            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                                {activeSession.questions && activeSession.questions.map((q, idx) => (
                                                    <div key={q.id} className="border p-3 rounded-lg bg-slate-50 relative group transition-all hover:shadow">
                                                        <button 
                                                            className="absolute top-2 left-2 text-rose-500 hover:bg-rose-50 p-1.5 rounded-full" 
                                                            onClick={() => {
                                                                setActiveSession({
                                                                    ...activeSession,
                                                                    questions: activeSession.questions?.filter(qi => qi.id !== q.id) || []
                                                                });
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="space-y-2">
                                                            <div className="flex gap-2 items-center">
                                                                <span className="text-[10px] font-black bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-mono">سؤال {idx + 1}</span>
                                                            </div>
                                                            <input 
                                                                className="w-full text-xs font-black text-slate-900 bg-white border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                                                                value={q.questionText} 
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setActiveSession({
                                                                        ...activeSession,
                                                                        questions: activeSession.questions?.map(qi => qi.id === q.id ? { ...qi, questionText: val } : qi) || []
                                                                    });
                                                                }}
                                                            />
                                                            <textarea 
                                                                className="w-full text-xs text-slate-700 bg-white border rounded p-2 focus:ring-1 focus:ring-indigo-500 resize-none h-14"
                                                                value={q.answerText || ''} 
                                                                placeholder="أقوال وإجابة الطرف (ج: ...)"
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setActiveSession({
                                                                        ...activeSession,
                                                                        questions: activeSession.questions?.map(qi => qi.id === q.id ? { ...qi, answerText: val } : qi) || []
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!activeSession.questions || activeSession.questions.length === 0) && (
                                                    <p className="text-center text-slate-400 py-6 text-xs italic">لا توجد أي أسئلة مسجلة في هذه الجلسة. استخدم المولد الذكي أو الزر لإضافة أسئلة.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Signatures simulation inside Editor */}
                                        <div className="bg-slate-100 p-4 rounded-xl border space-y-3">
                                            <p className="text-xs font-black text-slate-700">توقيع وإثبات الهوية الأكيدة للأقوال (إقرار وتعهد):</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-3 border rounded-lg text-center flex flex-col items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600">إمضاء الطرف المستجوب/الشاهد</span>
                                                    {activeSession.partySignature ? (
                                                        <img src={activeSession.partySignature} alt="Party Sign" className="h-16 object-contain my-2 border p-1" />
                                                    ) : (
                                                        <div className="h-14 w-full border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300 italic my-2">بانتظار التوقيع اليدوي</div>
                                                    )}
                                                    <Button size="sm" variant="outline" className="text-[10px]" onClick={() => {
                                                        const mockSig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAbCAYAAAC3R4K7AAAABmJLR0QA/wD/AP+gvaeTAAAAcElEQVRo3u3QsQ0AIAzEwCDZf2gWYg7G9A7U6Oon69Y198yWvWfO9g3DMIgYREDEIAIiBhEQMYiAiEEERAwiIGIQARGDCIgYREDEIAIiBhEQMYiAiEEERAwiIGIQARGDCIgYREDEIAIiBhEQMYjYv70BFzZ8E+b84gYAAAAASUVORK5CYII=";
                                                        setActiveSession({...activeSession, partySignature: mockSig});
                                                        addToast({ type: 'info', title: 'توقيع إلكتروني', message: 'تم رصد توقيع الموظف وإقرار الأقوال بنجاح.' });
                                                    }}>محاكاة توقيع الطرف</Button>
                                                </div>
                                                <div className="bg-white p-3 border rounded-lg text-center flex flex-col items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600">توقيع المحقق القانوني المعتمد</span>
                                                    {activeSession.investigatorSignature ? (
                                                        <img src={activeSession.investigatorSignature} alt="Investigator Sign" className="h-16 object-contain my-2 border p-1" />
                                                    ) : (
                                                        <div className="h-14 w-full border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300 italic my-2">بانتظار توقيع المحقق</div>
                                                    )}
                                                    <Button size="sm" variant="outline" className="text-[10px]" onClick={() => {
                                                        const mockSig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAbCAYAAAC3R4K7AAAABmJLR0QA/wD/AP+gvaeTAAAAcElEQVRo3u3QsQ0AIAzEwCDZf2gWYg7G9A7U6Oon69Y198yWvWfO9g3DMIgYREDEIAIiBhEQMYiAiEEERAwiIGIQARGDCIgYREDEIAIiBhEQMYiAiEEERAwiIGIQARGDCIgYREDEIAIiBhEQMYjYv70BFzZ8E+b84gYAAAAASUVORK5CYII=";
                                                        setActiveSession({...activeSession, investigatorSignature: mockSig});
                                                        addToast({ type: 'info', title: 'تم توقيع المحقق', message: 'تم التوقيع كضابط تحقيق معتمد.' });
                                                    }}>محاكاة توقيع المحقق</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            <Button variant="outline" onClick={() => { setIsSessionEditorOpen(false); setActiveSession(null); }}>إلغاء</Button>
                                            <Button variant="primary" onClick={() => saveSessionInInvestigation(activeSession)}>حفظ واعتماد الجلسة</Button>
                                        </div>
                                    </div>
                                ) : (
                                    // SESSIONS LIST WORKSPACE
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white border p-4 rounded-xl shadow-sm">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm">مجريات ومحاضر جلسات الاستماع</h4>
                                                <p className="text-[10px] text-slate-500 font-sans mt-0.5">جدولة تفريغات التحقيق، الاستجوابات أو سماع الشهود لملف القضية</p>
                                            </div>
                                            <Button variant="primary" size="sm" onClick={startNewSession} leftIcon={<PlusCircle className="w-4 h-4"/>}>إضافـة محاضر جلسة جديدة</Button>
                                        </div>

                                        <div className="space-y-3">
                                            {localInvestigation.sessions.map((sess, idx) => (
                                                <div key={sess.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-sans font-black px-2 py-0.5 rounded">جلسة رقم ({idx + 1})</span>
                                                            <h5 className="font-bold text-slate-900 text-xs">سماع أقوال: {sess.partyName} ({sess.partyType})</h5>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 mt-1.5 font-sans">تاريخ وجدولة الانعقاد: {sess.sessionDate} • الوقت: {sess.sessionTime || "10:00 صباحاً"}</p>
                                                        <p className="text-[10px] text-slate-400 font-sans mt-1">✓ سجل الأسئلة المفرغة: ({sess.questions.length} سؤال وإفادة مرصودة)</p>
                                                    </div>
                                                    <div className="flex gap-1.5 self-end md:self-auto text-xs">
                                                        <Button variant="outline" size="sm" onClick={() => editExistingSession(sess)} leftIcon={<Edit className="w-3.5 h-3.5"/>}>تحديث ومواجهة</Button>
                                                        <Button variant="ghost" className="text-rose-500 hover:bg-rose-50" size="sm" onClick={() => deleteSession(sess.id)}><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {localInvestigation.sessions.length === 0 && (
                                                <div className="text-center bg-white border p-12 rounded-xl text-slate-400 italic text-xs">
                                                    لا توجد جلسات سماع مرصودة في ملف الاستدلال الجاري. انقر على تسجيل جلسة جديدة للبدء.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentTab === 'witnesses' && (
                            <div className="space-y-4">
                                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                                    <h4 className="font-black text-slate-900 text-sm border-b pb-2">سجل شهود العيان والمستدعين للإفادة</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border items-end">
                                        <Input label="اسم الشاهد الثلاثي" placeholder="مثال: وليد خالد الحريص" value={newWitnessName} onChange={e => setNewWitnessName(e.target.value)} containerClassName="mb-0" />
                                        <Input label="رقم الهاتف للتبليغ والاتصال" placeholder="99001122" value={newWitnessPhone} onChange={e => setNewWitnessPhone(e.target.value)} containerClassName="mb-0" />
                                        <Button variant="primary" onClick={addWitness} disabled={!newWitnessName} leftIcon={<PlusCircle className="w-4 h-4"/>}>إضافـة الشاهد وتكليفه</Button>
                                    </div>

                                    <div className="space-y-3">
                                        {(localInvestigation.witnesses || []).map((wit, idx) => (
                                            <div key={wit.id} className="border p-3 rounded-xl flex justify-between items-center bg-white hover:bg-slate-50/50">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-xs">شاهد ({idx + 1}): {wit.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-sans">هاتف: {wit.phone || '99001122'} | الممتثل الحالي: {wit.status === 'summoned' ? 'تم استدعاءه وإرسال الإخطار' : wit.status === 'attended' ? 'حاضر وأقر بأقواله' : 'متخلف وغائب'}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="text-[10px]" onClick={() => toggleWitnessAttendance(wit.id, wit.status || 'summoned')}>
                                                        تعديل حالة الممتثل: {(wit as any).status === 'summoned' ? 'تعيين كحاضر' : (wit as any).status === 'attended' ? 'تعيين كغائب' : 'إعادة استدعاء'}
                                                    </Button>
                                                    <Button variant="secondary" size="sm" className="text-[10px] bg-slate-900" onClick={() => onTriggerSummons(wit.name)} leftIcon={<Printer className="w-3.5 h-3.5"/>}>طباعة إعلان الاستدعاء</Button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!localInvestigation.witnesses || localInvestigation.witnesses.length === 0) && (
                                            <p className="text-center text-slate-400 py-6 text-xs italic">لا يوجد شهود مدرجين في هذا المحضر الإداري حالياً.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTab === 'evidence' && (
                            <div className="space-y-4">
                                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                                    <h4 className="font-black text-slate-900 text-sm border-b pb-2">سجل أحراز الإثبات والقرائن والمستندات الثبوتية</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border items-end">
                                        <Input label="اسم ووصف الدليل الثبوتي" placeholder="مثال: مستخرج سجل الدخول على الخوادم..." value={newEvidenceName} onChange={e => setNewEvidenceName(e.target.value)} containerClassName="mb-0 col-span-1 md:col-span-2" />
                                        <Select label="تصنيف الحرز" value={newEvidenceType} options={[{value: 'مستند ورقي رقمي', label: 'مستند ورقي رقمي'}, {value: 'بيان وسجلات رقمية', label: 'بيانات رقمية وإلكترونية'}, {value: 'تقرير لجنة فنية رئيسية', label: 'تقارير لجان فيدية'}, {value: 'تسجيل كاميرات وقرائن عينية', label: 'تسجيل مرئي أو مادي'}]} onChange={e => setNewEvidenceType(e.target.value)} containerClassName="mb-0" />
                                        <Button variant="primary" onClick={addEvidence} disabled={!newEvidenceName} leftIcon={<PlusCircle className="w-4 h-4" />}>إرفاق وإدراج الحرز للتأمين</Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(localInvestigation.evidence || []).map((ev, idx) => (
                                            <div key={ev.id} className="border p-3 rounded-xl bg-slate-50/50 flex items-start gap-3">
                                                <div className="p-2 border rounded-lg bg-indigo-50 text-indigo-700">
                                                    <Paperclip className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="font-bold text-slate-900 text-xs">حرز ({idx + 1}): {ev.name}</h5>
                                                    <p className="text-[10px] text-indigo-700 font-bold">{ev.type} • تاريخ الحاق بالتأمين: {ev.dateAdded}</p>
                                                    {ev.notes && <p className="text-[10px] text-slate-500 font-sans mt-0.5">{ev.notes}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {(!localInvestigation.evidence || localInvestigation.evidence.length === 0) && (
                                        <p className="text-center text-slate-400 py-6 text-xs italic">لا توجد أي مستندات أو أحراز عينية ملحقة بملف الواقعة لإثبات التهمة.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentTab === 'ai-legal' && (
                            <div className="space-y-4">
                                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-black text-slate-900 text-sm">مستشـار التحقيقات وصائغ المذكرات بالذكاء الاصطناعي (Adala AI)</h4>
                                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded font-bold">باقة المساعد الكويتي للرأي القضائي</span>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed font-sans">يقوم النظام بعمل تفريغ فوري وفحص استباقي لكافة أقاول المتهم، والشهود، وأحراز الإثبات في الجلسات السابقة، وصياغتها وتكييفها فورياً وفقاً للائحة الجزاءات ونظام السلوك بدولة الكويت وقانون العمل في القطاع الأهلي.</p>

                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="primary" onClick={handleAiAnalysis} disabled={isAnalyzing} leftIcon={<Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}>
                                            {isAnalyzing ? 'جاري الفحص القانوني المتقدم وتدقيق الجلسات...' : 'فحص استدلالي وتحديث قرار الرأي تلقائياً'}
                                        </Button>
                                        <Button variant="secondary" className="bg-slate-900" onClick={handleAiMemoDraft} disabled={isDraftingMemo} leftIcon={<FileCode className="w-4 h-4" />}>
                                            {isDraftingMemo ? 'جاري صياغة مذكرات الديباجة القانونية...' : 'صياغة المذكرة الرسمية للطباعة والتسيير'}
                                        </Button>
                                    </div>

                                    {/* Display of recommended results editing */}
                                    <div className="space-y-3">
                                        <TextArea 
                                            label="القرار والنتيجة والأسانيد القانونية المعتمدة (قابلة للتعديل والاعتماد):" 
                                            value={localInvestigation.recommendation || ''} 
                                            onChange={e => handleUpdateInvestigation({...localInvestigation, recommendation: e.target.value})}
                                            rows={6}
                                            placeholder="انقر فوق الفحص الذكي بالأعلى لتوليد الصياغة تلقائياً أو اكتب التوصية ومستند رصد الجزاء يدوياً..."
                                        />
                                    </div>

                                    {/* AI Memo generated display and print */}
                                    {aiGeneratedMemo && (
                                        <div className="bg-slate-50 border border-slate-300 p-5 rounded-xl space-y-3 relative">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <p className="text-xs font-black text-indigo-950 flex items-center gap-1">
                                                    <FileText className="w-4 h-4 text-indigo-700" />
                                                    <span>مسودة مذكرة قرار النيابة الإدارية والشؤون القانونية:</span>
                                                </p>
                                                <Button size="sm" variant="outline" className="text-[10px]" onClick={() => {
                                                    const printWindow = window.open('', '', 'height=500,width=700');
                                                    if (printWindow) {
                                                        printWindow.document.write('<html><head><title>مذكرة إدارية رسمية</title></head><body style="direction: rtl; font-family: serif; padding: 40px; line-height: 1.6;">');
                                                        printWindow.document.write('<pre style="white-space: pre-wrap; font-family: inherit;">' + aiGeneratedMemo + '</pre>');
                                                        printWindow.document.write('</body></html>');
                                                        printWindow.document.close();
                                                        printWindow.print();
                                                    }
                                                }} leftIcon={<Printer className="w-3 h-3"/>}>طباعة المذكرة</Button>
                                            </div>
                                            <pre className="text-xs font-serif leading-relaxed text-slate-800 whitespace-pre-wrap select-text pr-3 max-h-96 overflow-y-auto bg-white p-3 border rounded-lg">
                                                {aiGeneratedMemo}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentTab === 'approvals' && (
                            <div className="space-y-4">
                                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                                    <h4 className="font-black text-slate-900 text-sm border-b pb-2">مصفوفة الاعتمادات والتوقيعات الإدارية للتوصيات</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(localInvestigation.approvals || [
                                            { id: 'ap-1', role: 'المحقق القانوني المكلف', name: localInvestigation.investigator || 'أ. عبدالله الفهد', status: 'APPROVED', date: localInvestigation.startDate },
                                            { id: 'ap-2', role: 'مدير شؤون الموظفين والامتثال', name: 'أ. عبدالعزيز العصفور', status: 'PENDING' },
                                            { id: 'ap-3', role: 'مستشار المدير التنفيذي العام والتحقق', name: 'د. يوسف الملا', status: 'PENDING' }
                                        ]).map((app) => (
                                            <div key={app.id} className="border p-4 rounded-xl flex justify-between items-center bg-white shadow-inner hover:border-slate-400">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-xs">{app.role}</p>
                                                    <p className="text-[11px] text-slate-500 mt-1">{app.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{app.status === 'APPROVED' ? `✓ تم التوقيع والاعتماد رسمي في: ${app.date}` : '⌛ بانتظار تصديق الامتثال'}</p>
                                                </div>
                                                <div>
                                                    {app.status === 'APPROVED' ? (
                                                        <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg">معتمد وموقع</span>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="text-[11px]" onClick={() => signApprovalState(app.id, app.name)}>اعتماد وتوقيع الآن</Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTab === 'logs' && (
                            <div className="space-y-4">
                                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
                                    <h4 className="font-black text-slate-900 text-sm border-b pb-2">سجل مراقبة التدقيق الإجرائي والأمان (Activity Audit Trail)</h4>
                                    
                                    <div className="flow-root font-sans">
                                        <ul className="-mb-8 text-xs font-sans font-bold text-slate-600">
                                            {(localInvestigation.activityLogs || [
                                                { id: 'l1', action: 'تم فتح وقيد ملف التحقيق الإداري وتعيين المحقق', user: 'محرر ومسؤول النظام', timestamp: localInvestigation.createdAt + 'T09:00:00Z' }
                                            ]).map((log, logIdx) => (
                                                <li key={log.id}>
                                                    <div className="relative pb-8">
                                                        {logIdx !== (localInvestigation.activityLogs || []).length - 1 ? (
                                                            <span className="absolute top-4 right-4 -mr-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                                        ) : null}
                                                        <div className="relative flex space-x-3 space-x-reverse items-start text-right">
                                                            <div>
                                                                <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white border">
                                                                    <History className="w-4 h-4 text-slate-500" />
                                                                </span>
                                                            </div>
                                                            <div className="flex-grow pt-1.5 min-w-0">
                                                                <p className="text-slate-900">{log.action}</p>
                                                                <div className="text-[10px] text-slate-400 mt-1 font-sans flex gap-3">
                                                                    <span>المجرى بواسطة: {log.user}</span>
                                                                    <span>•</span>
                                                                    <span>تاريخ النشاط: {new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
