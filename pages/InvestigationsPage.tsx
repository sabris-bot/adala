import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { 
    Scale, Folder, Search, BookOpen, PlusCircle, Trash2, Printer, 
    Plus, TrendingUp, Lock, ShieldCheck, CheckCircle2, FileText, 
    Users, ChevronDown, ChevronUp, Sparkles, Download, Clock, Archive, 
    AlertCircle, Send, Check, RefreshCw, Eye, X, Filter, Grid, List, 
    SlidersHorizontal, ShieldAlert, ArrowRight, Calendar, MessageSquare, 
    Award, ChevronRight, ChevronLeft, FileCheck, AlertTriangle, Mic,
    ArrowRightLeft, Activity
} from 'lucide-react';

// Import modular subcomponents
import { GeneralInfoTab } from './investigations/GeneralInfoTab';
import { SessionsTab } from './investigations/SessionsTab';
import { ResolutionsTab } from './investigations/ResolutionsTab';
import { DashboardTab } from './investigations/DashboardTab';
import { QuestionLibraryTab } from './investigations/QuestionLibraryTab';
import { InvestigationPrintModal } from './investigations/InvestigationPrintModal';
import { VoiceDictationStudio } from './investigations/VoiceDictationStudio';
import { VoiceDictationButton } from '../components/VoiceDictation/VoiceDictationButton';

// Import types, templates, and seed data
import { CaseStatus, InvestigationCase, LegalSafeguards } from './investigations/types';
import { PRINT_TEMPLATES, parseTemplateTokens } from './investigations/templates';
import { defaultCasesSeed, initialQuestionsLibrary, defaultEmployeesSeed } from './investigations/data';
import { geminiService } from '../services/geminiService';

export const InvestigationsPage: React.FC = () => {
    const { addToast } = useToast();

    // ----------------------------------------------------
    // LOCAL STORAGE STATE INITIALIZERS
    // ----------------------------------------------------
    const [employees, setEmployees] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return defaultEmployeesSeed;
    });

    const [cases, setCases] = useState<InvestigationCase[]>(() => {
        const stored = localStorage.getItem('alwagayan_investigations');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return defaultCasesSeed;
    });

    const [library, setLibrary] = useState<Record<string, string[]>>(() => {
        const stored = localStorage.getItem('alwagayan_questions_library');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {}
        }
        return initialQuestionsLibrary;
    });

    // Save states to local storage
    useEffect(() => {
        localStorage.setItem('alwagayan_investigations', JSON.stringify(cases));
    }, [cases]);

    useEffect(() => {
        localStorage.setItem('alwagayan_questions_library', JSON.stringify(library));
    }, [library]);

    useEffect(() => {
        localStorage.setItem('alwagayan_employees', JSON.stringify(employees));
    }, [employees]);

    // ----------------------------------------------------
    // MAIN TAB NAVIGATION (5 STRUCTURED SECTIONS)
    // ----------------------------------------------------
    // 1. dashboard: لوحة المؤشرات الإحصائية (Dashboard & KPIs)
    // 2. registry: سجل التحقيقات والجلسات (Investigations & Sessions Registry)
    // 3. voice_studio: استوديو التدوين الصوتي (Voice Dictation Studio)
    // 4. resolutions: سجل القرارات والتظلمات (Decisions & Appeals Registry)
    // 5. question_bank: بنك الأسئلة والضمانات اللائحية (Question Bank & Safeguards)
    const [activeMainTab, setActiveMainTab] = useState<
        'dashboard' | 'registry' | 'voice_studio' | 'resolutions' | 'question_bank'
    >('dashboard');

    // Sub-tab when inspecting a case in the Registry
    const [registrySubTab, setRegistrySubTab] = useState<'facts' | 'sessions'>('facts');
    const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(true);

    // Filter & Search Controls for Dossier List
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [deptFilter, setDeptFilter] = useState<string>('ALL');
    const [investigatorFilter, setInvestigatorFilter] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');


    // Selected Active Case for Editing across tabs
    const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
        return cases.length > 0 ? cases[0].id : '';
    });

    const activeCase = useMemo(() => {
        return cases.find(c => c.id === selectedCaseId) || (cases.length > 0 ? cases[0] : null);
    }, [cases, selectedCaseId]);

    // Modals
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printCase, setPrintCase] = useState<InvestigationCase | null>(null);

    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
        isOpen: boolean;
        caseId: string;
        caseNo: string;
        actionType: 'archive' | 'delete';
    } | null>(null);

    // AI Advisor & Editor States
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
    const [isAiMemoDrafting, setIsAiMemoDrafting] = useState(false);
    const [aiAdvisorChatText, setAiAdvisorChatText] = useState('');
    const [aiAdvisorChatHistory, setAiAdvisorChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
    const [isAiAdvisorChatLoading, setIsAiAdvisorChatLoading] = useState(false);

    const [editorText, setEditorText] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('minutes_inv');

    // Creation Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newEmployeeId, setNewEmployeeId] = useState('');
    const [newInvestigator, setNewInvestigator] = useState('أ. صبري شطا (رئيس قطاع الامتثال والقوانين)');
    const [newComplainant, setNewComplainant] = useState('');
    const [newComplainantTitle, setNewComplainantTitle] = useState('');
    const [newCategory, setNewCategory] = useState('الإهمال الوظيفي والتقصير');
    const [newFacts, setNewFacts] = useState('');
    const [newParties, setNewParties] = useState('');
    const [newAssociatedDates, setNewAssociatedDates] = useState('');
    const [newConfidentialNotes, setNewConfidentialNotes] = useState('');

    // Dynamic Metadata & Statistics Summary Bar
    const statsSummary = useMemo(() => {
        const total = cases.length;
        const newCount = cases.filter(c => c.status === CaseStatus.NEW).length;
        const ongoing = cases.filter(c => c.status === CaseStatus.ONGOING).length;
        const closed = cases.filter(c => c.status === CaseStatus.CLOSED).length;
        const onHold = cases.filter(c => c.status === CaseStatus.ON_HOLD).length;
        const archivedOrReferred = cases.filter(c => c.status === CaseStatus.ARCHIVED).length;
        return { total, new: newCount, ongoing, closed, onHold, archivedOrReferred };
    }, [cases]);

    // Filtered Cases List for Dossier Registry
    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            // Search Query Filter
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch = !q || 
                c.employeeName.toLowerCase().includes(q) ||
                c.caseNumber.toLowerCase().includes(q) ||
                c.subject.toLowerCase().includes(q) ||
                c.investigator.toLowerCase().includes(q);

            // Dropdown Filters
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            const matchesDept = deptFilter === 'ALL' || c.employeeDepartment === deptFilter;
            const matchesInvestigator = investigatorFilter === 'ALL' || c.investigator.includes(investigatorFilter);

            return matchesSearch && matchesStatus && matchesDept && matchesInvestigator;
        });
    }, [cases, searchQuery, statusFilter, deptFilter, investigatorFilter]);

    // Reset template editor text
    useEffect(() => {
        if (activeCase) {
            const template = PRINT_TEMPLATES.find(t => t.id === selectedTemplateId);
            if (template) {
                setEditorText(activeCase.customDocTemplateContent || template.text(activeCase));
            }
        }
    }, [activeCase, selectedTemplateId]);

    // Handlers
    const handleResetToSeedData = () => {
        if (window.confirm('هل تريد إعادة ضبط سجلات وقضايا التحقيق للنسخة النموذجية الأصلية لمكتب صبري شطا؟')) {
            setCases(defaultCasesSeed);
            localStorage.setItem('alwagayan_investigations', JSON.stringify(defaultCasesSeed));
            setEmployees(defaultEmployeesSeed);
            localStorage.setItem('alwagayan_employees', JSON.stringify(defaultEmployeesSeed));
            addToast({ type: 'success', title: 'تمت الاستعادة بنجاح', message: 'تم إعادة ضبط المحاضر والسجلات لبيانات العرض الرسمية.' });
        }
    };

    const handleExportCSV = () => {
        if (cases.length === 0) {
            addToast({ type: 'warning', title: 'تصدير البيانات', message: 'لا توجد قضايا مسجلة للتصدير.' });
            return;
        }
        const headers = ['رقم المحضر', 'الموظف المحقق معه', 'الرقم المدني', 'المسمى الوظيفي', 'القسم', 'تاريخ الفتح', 'موضوع التحقيق', 'التصنيف', 'المحقق المسؤول', 'حالة الملف', 'الجزاء التقديري'];
        const rows = cases.map(c => [
            `"${c.caseNumber || ''}"`,
            `"${c.employeeName || ''}"`,
            `"${c.civilId || ''}"`,
            `"${c.employeeJobTitle || ''}"`,
            `"${c.employeeDepartment || ''}"`,
            `"${c.startDate || ''}"`,
            `"${(c.subject || '').replace(/"/g, '""')}"`,
            `"${c.category || ''}"`,
            `"${c.investigator || ''}"`,
            `"${c.status || ''}"`,
            `"${(c.proposedPenalty || c.recommendation || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `adala_investigations_registry_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast({ type: 'success', title: 'تم تصدير السجل', message: 'تم تحميل كراسة التحقيقات الرسمية بصيغة CSV بنجاح.' });
    };

    const handleCreateCase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject || !newEmployeeId) {
            addToast({ type: 'warning', title: 'تنبيه', message: 'يرجى اختيار الموظف وتدوين موضوع الواقعة.' });
            return;
        }

        const selectedEmp = employees.find(emp => emp.id === newEmployeeId) || { fullNameAr: 'موظف مجهول', civilId: '292000000000', jobTitle: 'إداري', department: 'العمليات' };
        const autoRefNo = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

        const newObj: InvestigationCase = {
            id: `inv-new-${Date.now()}`,
            caseNumber: autoRefNo,
            subject: newSubject,
            employeeId: newEmployeeId,
            employeeName: selectedEmp.fullNameAr || selectedEmp.fullName || 'موظف مجهول',
            civilId: selectedEmp.civilId || '292000000000',
            employeeJobTitle: selectedEmp.jobTitle || 'موظف',
            employeeDepartment: selectedEmp.department || 'العمليات',
            investigator: newInvestigator,
            status: CaseStatus.NEW,
            startDate: new Date().toISOString().split('T')[0],
            complainantName: newComplainant || 'إدارة الامتثال والتدقيق الداخلي',
            complainantTitle: newComplainantTitle || 'رئيس قسم النزاهة والتحقيقات',
            violations: [newSubject],
            evidence: [],
            witnesses: [],
            sessions: [],
            category: newCategory,
            recommendation: '',
            proposedPenalty: '',
            deductionDays: 0,
            approvedByInvestigator: false,
            approvedByLegalManager: false,
            approvedByGeneralManager: false,
            createdAt: new Date().toISOString().split('T')[0],
            safeguards: {
                within15Days: true,
                writtenNotice: true,
                heardEmployee: false,
                signedOnPages: false,
                proportionalPenalty: true
            },
            facts: newFacts,
            parties: newParties,
            associatedDates: newAssociatedDates,
            confidentialNotes: newConfidentialNotes,
            legalReferences: [
                'المادة 35 من قانون العمل الكويتي رقم 6 لسنة 2010',
                'المادة 102 من قانون العمل الكويتي رقم 6 لسنة 2010'
            ]
        };

        const updatedCases = [newObj, ...cases];
        setCases(updatedCases);
        setSelectedCaseId(newObj.id);
        setIsCreateModalOpen(false);

        // Reset inputs
        setNewSubject('');
        setNewComplainant('');
        setNewComplainantTitle('');
        setNewFacts('');
        setNewParties('');
        setNewAssociatedDates('');
        setNewConfidentialNotes('');

        addToast({ type: 'success', title: 'تم قيد التحقيق', message: `تم إضافة محضر التحقيق رقم ${autoRefNo} بنجاح.` });
    };

    const handleConfirmDeleteOrArchive = () => {
        if (!deleteConfirmModal) return;
        const { caseId, actionType } = deleteConfirmModal;
        if (actionType === 'archive') {
            const updated = cases.map(c => c.id === caseId ? { ...c, status: CaseStatus.ARCHIVED } : c);
            setCases(updated);
            addToast({ type: 'success', title: 'تمت الأرشفة', message: 'تم نقل محضر التحقيق لأرشيف القضايا وحمايته.' });
        } else {
            const updated = cases.filter(c => c.id !== caseId);
            setCases(updated);
            if (selectedCaseId === caseId && updated.length > 0) {
                setSelectedCaseId(updated[0].id);
            }
            addToast({ type: 'success', title: 'تم الحذف', message: 'تم حذف محضر التحقيق نهائياً من السجلات.' });
        }
        setDeleteConfirmModal(null);
    };

    // AI Analysis Handlers
    const handleRunAiAnalysis = async () => {
        if (!activeCase) return;
        setIsAiAnalyzing(true);
        try {
            const sessionLines = activeCase.sessions && activeCase.sessions.length > 0
                ? activeCase.sessions.map((sess, idx) => {
                    const qLines = sess.questions.map(q => `س: ${q.question} \nج: ${q.answer}`).join('\n');
                    return `الجلسة ${idx + 1} مع ${sess.partyName} (${sess.partyType === 'employee' ? 'المستجوب' : 'الشاهد'}):\n${qLines}`;
                }).join('\n\n')
                : 'لم يتم تدوين جلسات استماع في هذا الملف بعد.';

            const analysisData = await geminiService.analyzeInvestigation(
                activeCase.subject || 'موضوع التحقيق',
                sessionLines,
                activeCase.violations ? activeCase.violations.join(' - ') : activeCase.category || ''
            );

            setAiAnalysisResult({
                summary: analysisData.summary,
                recommendation: analysisData.recommendation || analysisData.analysis,
                applicableArticles: analysisData.applicableArticles,
                proposedPenalties: analysisData.proposedPenalties
            });
            addToast({ type: 'success', title: 'اكتمل التحليل الذكي', message: 'تم توليد الرأي القانوني والتكييف اللائحي بنجاح.' });
        } catch (e) {
            console.error(e);
            addToast({ type: 'error', title: 'خطأ', message: 'تعذر إجراء التحليل الذكي في الوقت الحالي.' });
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    const handleApplyAiRecommendation = () => {
        if (!activeCase || !aiAnalysisResult) return;
        const updated = cases.map(c => {
            if (c.id === activeCase.id) {
                return {
                    ...c,
                    recommendation: aiAnalysisResult.recommendation || aiAnalysisResult.summary
                };
            }
            return c;
        });
        setCases(updated);
        addToast({ type: 'success', title: 'تم تثبيت التوصية', message: 'تم حفظ الرأي القانوني في ملف التحقيق.' });
    };

    const handleApproveRole = (role: 'investigator' | 'legal_manager' | 'general_manager') => {
        if (!activeCase) return;
        const updated = cases.map(c => {
            if (c.id === activeCase.id) {
                const patch: Partial<InvestigationCase> = {};
                if (role === 'investigator') patch.approvedByInvestigator = true;
                if (role === 'legal_manager') patch.approvedByLegalManager = true;
                if (role === 'general_manager') {
                    patch.approvedByGeneralManager = true;
                    patch.status = CaseStatus.CLOSED;
                    patch.endDate = new Date().toISOString().split('T')[0];
                }
                return { ...c, ...patch };
            }
            return c;
        });
        setCases(updated);
        addToast({ type: 'success', title: 'تم توثيق الاعتماد', message: 'تم تسجيل توقيع المصادقة في سجل التحقيق.' });
    };

    const handleSaveGeneralInfo = (data: {
        facts: string;
        parties: string;
        associatedDates: string;
        confidentialNotes: string;
        witnesses?: any[];
        evidence?: any[];
        safeguards?: LegalSafeguards;
    }) => {
        if (!activeCase) return;
        const updated = cases.map(c => {
            if (c.id === activeCase.id) {
                return {
                    ...c,
                    facts: data.facts,
                    parties: data.parties,
                    associatedDates: data.associatedDates,
                    confidentialNotes: data.confidentialNotes,
                    witnesses: data.witnesses || c.witnesses,
                    evidence: data.evidence || c.evidence,
                    safeguards: data.safeguards || c.safeguards
                };
            }
            return c;
        });
        setCases(updated);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 text-right font-sans" style={{ direction: 'rtl' }}>
            
            {/* Top Page Header */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-slate-900 text-amber-400">
                            <Scale className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">قسم التحقيقات الإدارية والأوليات القانونية</h1>
                            <p className="text-xs text-slate-500 font-bold">
                                منظومة «عدالة» • مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        onClick={handleResetToSeedData}
                        title="إعادة ضبط السجلات للنسخة النموذجية"
                    >
                        <RefreshCw className="w-3.5 h-3.5 ml-1" />
                        إعادة ضبط
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        onClick={handleExportCSV}
                    >
                        <Download className="w-3.5 h-3.5 ml-1" />
                        تصدير كراسة التحقيقات (CSV)
                    </Button>

                    <Button
                        size="sm"
                        variant="primary"
                        className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 ml-1" />
                        قيد بلاغ تحقيق جديد
                    </Button>
                </div>
            </div>

            {/* 5 Hydraulic Navigation Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                    {[
                        { id: 'dashboard', label: 'لوحة المؤشرات الإحصائية', icon: <TrendingUp className="w-4 h-4" /> },
                        { id: 'registry', label: 'سجل التحقيقات والجلسات', icon: <Folder className="w-4 h-4" />, badge: cases.length },
                        { id: 'voice_studio', label: 'استوديو التدوين الصوتي', icon: <Mic className="w-4 h-4 text-rose-500" /> },
                        { id: 'resolutions', label: 'سجل القرارات والتظلمات', icon: <Award className="w-4 h-4 text-amber-600" /> },
                        { id: 'question_bank', label: 'بنك الأسئلة والضمانات اللائحية', icon: <BookOpen className="w-4 h-4" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMainTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeMainTab === tab.id
                                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                    activeMainTab === tab.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Case Selector Ribbon (Visible across editing tabs) */}
            {activeMainTab !== 'dashboard' && activeMainTab !== 'question_bank' && activeCase && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-400">الملف النشط حالياً:</span>
                        <select
                            value={selectedCaseId}
                            onChange={(e) => setSelectedCaseId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                        >
                            {cases.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.caseNumber} • {c.employeeName} ({c.status})
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-800">{activeCase.employeeName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({activeCase.employeeDepartment})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                activeCase.status === CaseStatus.CLOSED ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                activeCase.status === CaseStatus.ONGOING ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                                {activeCase.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-bold bg-slate-50 hover:bg-slate-100"
                            onClick={() => {
                                setPrintCase(activeCase);
                                setIsPrintModalOpen(true);
                            }}
                        >
                            <Printer className="w-3.5 h-3.5 ml-1" />
                            طباعة محضر رسمي (PDF)
                        </Button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT SWITCHER */}
            {activeMainTab === 'dashboard' && (
                <DashboardTab
                    cases={cases}
                    stats={statsSummary}
                    onSelectCase={(id) => {
                        setSelectedCaseId(id);
                        setActiveMainTab('registry');
                    }}
                    onAddCaseTrigger={() => setIsCreateModalOpen(true)}
                    onOpenVoiceStudio={() => setActiveMainTab('voice_studio')}
                    onNavigateTab={(t) => {
                        if (t === 'general_dossier' || t === 'sessions') {
                            setActiveMainTab('registry');
                            if (t === 'sessions') setRegistrySubTab('sessions');
                            else setRegistrySubTab('facts');
                        } else {
                            setActiveMainTab(t as any);
                        }
                    }}
                />
            )}

            {/* 2. REGISTRY TAB: SESSIONS & INVESTIGATION DOSSIERS */}
            {activeMainTab === 'registry' && (
                <div className="space-y-6">
                    {/* Filter & View Mode Bar */}
                    <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
                        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="ابحث برقم المحضر، اسم الموظف، المحقق، أو موضوع الواقعة..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 transition-all outline-none"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                                >
                                    <option value="ALL">جميع الحالات</option>
                                    <option value={CaseStatus.NEW}>وارد جديد</option>
                                    <option value={CaseStatus.ONGOING}>قيد التحقيق</option>
                                    <option value={CaseStatus.CLOSED}>منتهي ومغلق</option>
                                    <option value={CaseStatus.ARCHIVED}>مؤرشف</option>
                                </select>

                                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400'}`}
                                        title="عرض جدول بيانات"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400'}`}
                                        title="عرض بطاقات"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Cases List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCases.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        setSelectedCaseId(c.id);
                                        setIsCaseDetailsOpen(true);
                                    }}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                                        selectedCaseId === c.id
                                            ? 'bg-amber-50/30 border-amber-500 ring-2 ring-amber-400/20 shadow-sm'
                                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                            {c.caseNumber}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                            c.status === CaseStatus.CLOSED ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                            c.status === CaseStatus.ONGOING ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-slate-900 line-clamp-1">{c.employeeName}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">{c.employeeJobTitle} • {c.employeeDepartment}</p>
                                    </div>

                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                        {c.subject}
                                    </p>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>جلسات: {c.sessions?.length || 0}</span>
                                        <span className="font-mono">{c.startDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <table className="w-full text-xs text-right">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                    <tr>
                                        <th className="p-3.5">رقم المحضر</th>
                                        <th className="p-3.5">الموظف المشكو بحقه</th>
                                        <th className="p-3.5">القسم</th>
                                        <th className="p-3.5">موضوع البلاغ</th>
                                        <th className="p-3.5">المحقق</th>
                                        <th className="p-3.5">جلسات التحقيق</th>
                                        <th className="p-3.5">الحالة</th>
                                        <th className="p-3.5 text-center">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCases.map(c => (
                                        <tr 
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCaseId(c.id);
                                                setIsCaseDetailsOpen(true);
                                            }}
                                            className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                                                selectedCaseId === c.id ? 'bg-amber-50/40' : ''
                                            }`}
                                        >
                                            <td className="p-3.5 font-mono font-bold text-slate-800">{c.caseNumber}</td>
                                            <td className="p-3.5 font-bold text-slate-900">{c.employeeName}</td>
                                            <td className="p-3.5 text-slate-500">{c.employeeDepartment}</td>
                                            <td className="p-3.5 text-slate-700 max-w-xs truncate">{c.subject}</td>
                                            <td className="p-3.5 text-slate-600">{c.investigator}</td>
                                            <td className="p-3.5 font-mono font-bold text-slate-700">
                                                {c.sessions?.length || 0} جلسات
                                            </td>
                                            <td className="p-3.5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    c.status === CaseStatus.CLOSED ? 'bg-emerald-50 text-emerald-800' :
                                                    c.status === CaseStatus.ONGOING ? 'bg-amber-50 text-amber-800' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-[10px] font-bold py-1 px-3 bg-white hover:bg-slate-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCaseId(c.id);
                                                        setIsCaseDetailsOpen(true);
                                                    }}
                                                >
                                                    فتح الملف
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Integrated Case Dossier Detail Card */}
                    {activeCase && isCaseDetailsOpen && (
                        <div className="pt-2 space-y-4">
                            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                                        <FileText className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-white">تفاصيل ملف التحقيق: {activeCase.caseNumber}</h3>
                                            <span className="text-xs text-amber-400 font-bold">({activeCase.employeeName})</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">إدارة الوقائع، الأدلة، الشهود، ومحاضر الاستجواب وجلسات السماع</p>
                                    </div>
                                </div>

                                {/* Sub-tab switch inside Case Details */}
                                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => setRegistrySubTab('facts')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            registrySubTab === 'facts'
                                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        وقائع البلاغ والأدلة والشهود
                                    </button>
                                    <button
                                        onClick={() => setRegistrySubTab('sessions')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            registrySubTab === 'sessions'
                                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        محاضر الاستجواب والجلسات ({activeCase.sessions?.length || 0})
                                    </button>
                                </div>
                            </div>

                            {/* Render Sub Tab Content */}
                            {registrySubTab === 'facts' ? (
                                <GeneralInfoTab
                                    selectedCase={activeCase}
                                    onSave={handleSaveGeneralInfo}
                                    addToast={addToast}
                                />
                            ) : (
                                <SessionsTab
                                    selectedCase={activeCase}
                                    cases={cases}
                                    setCases={setCases}
                                    library={library}
                                    addToast={addToast}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 3. VOICE DICTATION STUDIO TAB */}
            {activeMainTab === 'voice_studio' && (
                <div className="space-y-6">
                    <VoiceDictationStudio
                        activePartyName={activeCase ? activeCase.employeeName : 'المستجوب / الشاهد'}
                        onInjectQuestion={(qText) => {
                            if (!activeCase) return;
                            setActiveMainTab('registry');
                            setRegistrySubTab('sessions');
                            addToast({ type: 'success', title: 'تم حقن السؤال', message: 'تم إدراج السؤال في محرر الجلسة.' });
                        }}
                        onInjectAnswer={(aText) => {
                            if (!activeCase) return;
                            setActiveMainTab('registry');
                            setRegistrySubTab('sessions');
                            addToast({ type: 'success', title: 'تم حقن الإفادة', message: 'تم إدراج الإفادة في محرر الجلسة.' });
                        }}
                        onInjectDirectQA={(qText, aText) => {
                            if (!activeCase) return;
                            const updatedSessions = [...(activeCase.sessions || [])];
                            if (updatedSessions.length > 0) {
                                const last = { ...updatedSessions[updatedSessions.length - 1] };
                                last.questions = [
                                    ...(last.questions || []),
                                    { id: `q-${Date.now()}`, question: qText, answer: aText }
                                ];
                                updatedSessions[updatedSessions.length - 1] = last;
                            } else {
                                updatedSessions.push({
                                    id: `sess-${Date.now()}`,
                                    sessionDate: new Date().toISOString().split('T')[0],
                                    partyName: activeCase.employeeName,
                                    partyType: 'employee',
                                    questions: [{ id: `q-${Date.now()}`, question: qText, answer: aText }],
                                    isOathTaken: true
                                });
                            }
                            const updatedCases = cases.map(c => c.id === activeCase.id ? { ...c, sessions: updatedSessions } : c);
                            setCases(updatedCases);
                            setActiveMainTab('registry');
                            setRegistrySubTab('sessions');
                            addToast({ type: 'success', title: 'تم الإدراج المباشر', message: 'تم إضافة سؤال وجواب المحضر في الجلسة.' });
                        }}
                        onInjectFacts={(text) => {
                            if (!activeCase) return;
                            const updatedCases = cases.map(c => c.id === activeCase.id ? { ...c, facts: (c.facts ? c.facts + '\n' : '') + text } : c);
                            setCases(updatedCases);
                            setActiveMainTab('registry');
                            setRegistrySubTab('facts');
                            addToast({ type: 'success', title: 'تم إدراج الوقائع', message: 'تم تحديث سرد الوقائع للمحضر.' });
                        }}
                    />
                </div>
            )}

            {/* 4. RESOLUTIONS & APPEALS REGISTRY TAB */}
            {activeMainTab === 'resolutions' && (
                <ResolutionsTab
                    selectedCase={activeCase}
                    cases={cases}
                    setCases={setCases}
                    isAiAnalyzing={isAiAnalyzing}
                    aiAnalysisResult={aiAnalysisResult}
                    isAiMemoDrafting={isAiMemoDrafting}
                    onRunAiAnalysis={handleRunAiAnalysis}
                    onApplyAiRecommendation={handleApplyAiRecommendation}
                    onDraftAiLegalMemo={handleRunAiAnalysis}
                    aiAdvisorChatText={aiAdvisorChatText}
                    setAiAdvisorChatText={setAiAdvisorChatText}
                    aiAdvisorChatHistory={aiAdvisorChatHistory}
                    isAiAdvisorChatLoading={isAiAdvisorChatLoading}
                    onSendAdvisorMessage={() => {}}
                    editorText={editorText}
                    setEditorText={setEditorText}
                    resolvedPrintText={editorText}
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    onSaveTemplateText={() => {}}
                    onResetTemplateText={() => {}}
                    onApproveRole={handleApproveRole}
                    onOpenPrintModal={() => {
                        setPrintCase(activeCase);
                        setIsPrintModalOpen(true);
                    }}
                    addToast={addToast}
                />
            )}

            {/* 5. QUESTION BANK & SAFEGUARDS TAB */}
            {activeMainTab === 'question_bank' && (
                <QuestionLibraryTab
                    library={library}
                    onInjectQuestion={(qText) => {
                        if (activeCase) {
                            const updatedSessions = [...(activeCase.sessions || [])];
                            if (updatedSessions.length > 0) {
                                const last = { ...updatedSessions[updatedSessions.length - 1] };
                                last.questions = [
                                    ...(last.questions || []),
                                    { id: `q-${Date.now()}`, question: qText, answer: 'بانتظار إفادة ودفاع الموظف المشكو بحقه...' }
                                ];
                                updatedSessions[updatedSessions.length - 1] = last;
                            } else {
                                updatedSessions.push({
                                    id: `sess-${Date.now()}`,
                                    sessionDate: new Date().toISOString().split('T')[0],
                                    partyName: activeCase.employeeName,
                                    partyType: 'employee',
                                    questions: [{ id: `q-${Date.now()}`, question: qText, answer: 'بانتظار إفادة ودفاع الموظف المشكو بحقه...' }],
                                    isOathTaken: true
                                });
                            }
                            const updatedCases = cases.map(c => c.id === activeCase.id ? { ...c, sessions: updatedSessions } : c);
                            setCases(updatedCases);
                            setActiveMainTab('registry');
                            setRegistrySubTab('sessions');
                        }
                    }}
                    addToast={addToast}
                />
            )}


            {/* CREATE NEW INVESTIGATION MODAL */}
            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="قيد بلاغ ومحضر تحقيق جديد">
                    <form onSubmit={handleCreateCase} className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">الموظف المشكو في حقه:</label>
                            <select
                                value={newEmployeeId}
                                onChange={(e) => setNewEmployeeId(e.target.value)}
                                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                required
                            >
                                <option value="">-- اختر الموظف المعني من القائمة --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.fullNameAr || emp.fullName} ({emp.jobTitle} - {emp.department})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">الجهة الشاكية / مقدّم المذكرة:</label>
                                <input
                                    type="text"
                                    placeholder="مثال: إدارة الرقابة والتدقيق الداخلي"
                                    value={newComplainant}
                                    onChange={(e) => setNewComplainant(e.target.value)}
                                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">صفة الشاكي ومسماه:</label>
                                <input
                                    type="text"
                                    placeholder="مثال: رئيس قسم الجودة والامتثال"
                                    value={newComplainantTitle}
                                    onChange={(e) => setNewComplainantTitle(e.target.value)}
                                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">المحقق المسؤول:</label>
                                <input
                                    type="text"
                                    value={newInvestigator}
                                    onChange={(e) => setNewInvestigator(e.target.value)}
                                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">تصنيف المخالفة:</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                >
                                    <option value="الإهمال الوظيفي والتقصير">الإهمال الوظيفي والتقصير</option>
                                    <option value="الغياب التام والامتناع">الغياب التام والامتناع</option>
                                    <option value="المخالفات المالية والعهدة">المخالفات المالية والعهدة</option>
                                    <option value="إفشاء المعلومات والسرية المهنية">إفشاء المعلومات والسرية المهنية</option>
                                    <option value="مخالفات مسلكية وسلوكية">مخالفات مسلكية وسلوكية</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">موضوع وبلاغ التحقيق:</label>
                            <textarea
                                placeholder="اكتب ملخصاً لموضوع الشكوى أو المخالفة المنسوبة للموظف..."
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-20"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-700">سرد الوقائع المبدئي:</label>
                                <VoiceDictationButton
                                    value={newFacts}
                                    onTranscript={(t) => setNewFacts(t)}
                                    placeholderTitle="تدوين الوقائع صوتياً"
                                    size="sm"
                                />
                            </div>
                            <textarea
                                placeholder="تفاصيل الواقعة والاستدلالات المبدئية..."
                                value={newFacts}
                                onChange={(e) => setNewFacts(e.target.value)}
                                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-20"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                className="text-xs"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs"
                            >
                                قيد الملف وبدء التحقيق
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* OFFICIAL PRINT MODAL */}
            {isPrintModalOpen && printCase && (
                <InvestigationPrintModal
                    investigation={printCase}
                    onClose={() => {
                        setIsPrintModalOpen(false);
                        setPrintCase(null);
                    }}
                />
            )}

            {/* DELETE / ARCHIVE CONFIRMATION MODAL */}
            {deleteConfirmModal && (
                <Modal 
                    isOpen={deleteConfirmModal.isOpen} 
                    onClose={() => setDeleteConfirmModal(null)} 
                    title={deleteConfirmModal.actionType === 'archive' ? 'أرشفة محضر التحقيق' : 'حذف محضر التحقيق'}
                >
                    <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <p className="text-xs text-slate-700 leading-relaxed">
                            {deleteConfirmModal.actionType === 'archive'
                                ? `هل أنت متأكد من أرشفة محضر التحقيق رقم (${deleteConfirmModal.caseNo})؟ سيتم نقله للأرشيف وحمايته من التعديل.`
                                : `هل أنت متأكد من حذف محضر التحقيق رقم (${deleteConfirmModal.caseNo}) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`}
                        </p>
                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmModal(null)}>إلغاء</Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className={deleteConfirmModal.actionType === 'archive' ? 'bg-amber-600' : 'bg-rose-600'}
                                onClick={handleConfirmDeleteOrArchive}
                            >
                                تأكيد {deleteConfirmModal.actionType === 'archive' ? 'الأرشفة' : 'الحذف'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default InvestigationsPage;
