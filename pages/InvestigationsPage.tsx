import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import Select from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

import { 
    Scale, Folder, Clock, CheckCircle2, AlertTriangle, Scroll, FileText, 
    PlusCircle, Search, Trash2, Printer, Edit2, Users, FilePlus, ChevronRight, 
    ShieldAlert, Award, ArrowUpRight, HelpCircle, Check, Play, BookOpen, AlertCircle,
    Plus, RotateCcw, CheckSquare, Square, Sparkles, ChevronLeft, TrendingUp, Eye,
    UserCheck, FileSpreadsheet, Lock, Archive, Calendar
} from 'lucide-react';

// Import modular types, templates, and seed data
import { 
    CaseStatus, 
    InvestigationCase, 
    LegalSafeguards, 
    InvestigationWitness, 
    InvestigationEvidence, 
    InvestigationSession,
    InvestigationSessionQuestion
} from './investigations/types';

import { PRINT_TEMPLATES, parseTemplateTokens } from './investigations/templates';
import { defaultCasesSeed, initialQuestionsLibrary, defaultEmployeesSeed } from './investigations/data';
import { DashboardTab } from './investigations/DashboardTab';
import { QuestionLibraryTab } from './investigations/QuestionLibraryTab';

const InvestigationsPage: React.FC = () => {
    const { addToast } = useToast();

    // ----------------------------------------------------
    // LOCAL STORAGE STATE INITIALIZERS (DATA PRESERVATION)
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

    // Save states back to local storage
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
    // MAIN TAB AND FILTER VIEW STATES
    // ----------------------------------------------------
    const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'cases' | 'questions'>('cases');
    const [activeCaseId, setActiveCaseId] = useState<string>(cases[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Case Workspace inner sub-tabs
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'safeguards_profile' | 'sessions_qa' | 'witnesses_evidence' | 'approvals' | 'print_editor'>('safeguards_profile');

    // Case selection computed
    const selectedCase = useMemo(() => {
        return cases.find(c => c.id === activeCaseId) || cases[0];
    }, [cases, activeCaseId]);

    // ----------------------------------------------------
    // CREATION FORM STATE MODAL
    // ----------------------------------------------------
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newEmployeeId, setNewEmployeeId] = useState('');
    const [newInvestigator, setNewInvestigator] = useState('أ. صبري صبري (رئيس قطاع الامتثال والقوانين)');
    const [newComplainant, setNewComplainant] = useState('');
    const [newComplainantTitle, setNewComplainantTitle] = useState('');
    const [newCategory, setNewCategory] = useState('الإهمال الوظيفي والتقصير');

    // ----------------------------------------------------
    // ACTIVE TICKET ACTION BUILDERS
    // ----------------------------------------------------
    // Sessions
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessionPartyType, setSessionPartyType] = useState<'employee' | 'witness'>('employee');
    const [sessionPartyName, setSessionPartyName] = useState('');
    const [customQuestionInput, setCustomQuestionInput] = useState('');
    const [customAnswerInput, setCustomAnswerInput] = useState('');
    const [activeSessionQuestions, setActiveSessionQuestions] = useState<InvestigationSessionQuestion[]>([]);
    const [isOathTaken, setIsOathTaken] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');

    // Witness & Evidence
    const [witnessName, setWitnessName] = useState('');
    const [witnessPhone, setWitnessPhone] = useState('');
    const [witnessStatement, setWitnessStatement] = useState('');
    const [witnessStatus, setWitnessStatus] = useState<'summoned' | 'attended' | 'absent'>('summoned');

    const [evidenceName, setEvidenceName] = useState('');
    const [evidenceType, setEvidenceType] = useState('ملفات تقنية ومستندات');
    const [evidenceNotes, setEvidenceNotes] = useState('');

    // Print & Editor helper
    const [selectedTemplateId, setSelectedTemplateId] = useState('minutes_inv');
    const [editorText, setEditorText] = useState('');

    // Reset template editor when active case or template choice changes
    useEffect(() => {
        if (selectedCase) {
            const template = PRINT_TEMPLATES.find(t => t.id === selectedTemplateId);
            if (template) {
                // Return custom document text, or default to parsed template text
                setEditorText(selectedCase.customDocTemplateContent || template.text(selectedCase));
            }
        }
    }, [selectedCase, selectedTemplateId]);

    // ----------------------------------------------------
    // DYNAMIC METADATA AND COUNTS
    // ----------------------------------------------------
    const statsSummary = useMemo(() => {
        return {
            total: cases.length,
            new: cases.filter(c => c.status === CaseStatus.NEW).length,
            ongoing: cases.filter(c => c.status === CaseStatus.ONGOING).length,
            closed: cases.filter(c => c.status === CaseStatus.CLOSED).length,
            onHold: cases.filter(c => c.status === CaseStatus.ON_HOLD).length,
        };
    }, [cases]);

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesSearch = 
                c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.subject.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [cases, searchQuery, statusFilter]);

    // ----------------------------------------------------
    // CORE INVESTIGATION HANDLERS (INTEGRATED WRITES)
    // ----------------------------------------------------
    const handleCreateCase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject || !newEmployeeId) {
            addToast({ type: 'warning', title: 'فشل في إنشاء الملف', message: 'يرجى اختيار الموظف المطلوب وتحديد موضوع المخالفة.' });
            return;
        }

        const selectedEmp = employees.find(emp => emp.id === newEmployeeId) || { fullNameAr: 'موظف عشوائي', jobTitle: 'إداري', department: 'العمليات' };
        const randRefNo = `QA-INV-2026-${Math.floor(100 + Math.random() * 900)}`;

        const newObj: InvestigationCase = {
            id: `inv-new-${Date.now()}`,
            caseNumber: randRefNo,
            subject: newSubject,
            employeeId: newEmployeeId,
            employeeName: selectedEmp.fullNameAr || selectedEmp.fullName || 'موظف مجهول',
            employeeJobTitle: selectedEmp.jobTitle || 'موظف',
            employeeDepartment: selectedEmp.department || 'العمليات',
            investigator: newInvestigator,
            status: CaseStatus.NEW,
            startDate: new Date().toISOString().split('T')[0],
            complainantName: newComplainant || 'إدارة الرصد والامتثال الداخلي',
            complainantTitle: newComplainantTitle || 'رئيس التدقيق والجودة الإدارية',
            violations: [newSubject],
            evidence: [],
            witnesses: [],
            sessions: [],
            category: newCategory,
            recommendation: '',
            proposedPenalty: '',
            approvedByInvestigator: false,
            approvedByLegalManager: false,
            approvedByGeneralManager: false,
            createdAt: new Date().toISOString().split('T')[0],
            safeguards: {
                within15Days: true,
                writtenNotice: true,
                heardEmployee: false,
                signedOnPages: false,
                proportionalPenalty: false
            }
        };

        const updatedCases = [newObj, ...cases];
        setCases(updatedCases);
        setActiveCaseId(newObj.id);
        setIsCreateModalOpen(false);

        // Clear create form fields
        setNewSubject('');
        setNewComplainant('');
        setNewComplainantTitle('');

        // Update employee record to tag hasActiveInvestigation = true
        const updatedEmployees = employees.map(emp => {
            if (emp.id === newEmployeeId) {
                const invArr = emp.investigations || [];
                return {
                    ...emp,
                    hasActiveInvestigation: true,
                    investigations: [
                        ...invArr,
                        {
                            id: newObj.id,
                            caseNumber: newObj.caseNumber,
                            date: newObj.startDate,
                            subject: newObj.subject,
                            investigator: newObj.investigator,
                            results: 'تحت المداولة المستمرة',
                            status: 'Open'
                        }
                    ]
                };
            }
            return emp;
        });
        setEmployees(updatedEmployees);
        addToast({ type: 'success', title: 'تم فتح القضية والربط', message: `تم قيد التحقيق العمالي برقم القيد ${randRefNo} وتحديث ملف الموظف بنجاح.` });
    };

    const handleDeleteCase = (id: string, no: string) => {
        if (!window.confirm(`هل أنت متأكد من مسح وإلغاء قضية التحقيق ${no} تماماً؟`)) return;
        
        const updated = cases.filter(c => c.id !== id);
        setCases(updated);
        if (activeCaseId === id) {
            setActiveCaseId(updated[0]?.id || '');
        }
        addToast({ type: 'success', title: 'تم إلغاء الملف', message: 'تم إزالة سجل القضية عمالياً بنجاح.' });
    };

    // Toggle a legal guarantee checkbox
    const handleToggleSafeguard = (field: keyof LegalSafeguards) => {
        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                const currentSafeguards = c.safeguards || { within15Days: true, writtenNotice: false, heardEmployee: false, signedOnPages: false, proportionalPenalty: false };
                return {
                    ...c,
                    safeguards: {
                        ...currentSafeguards,
                        [field]: !currentSafeguards[field]
                    }
                };
            }
            return c;
        });
        setCases(updated);
        addToast({ type: 'success', title: 'تحديث الضمانات', message: 'تم تعديل بنود مؤشر الامتثال ومطابقة مادة قانون العمل الكويتي.' });
    };

    // Sessions handling
    const handleAddQuestionToDraft = () => {
        if (!customQuestionInput.trim()) return;
        const newQ: InvestigationSessionQuestion = {
            id: `q-num-${Date.now()}-${Math.random()}`,
            question: customQuestionInput,
            answer: customAnswerInput || 'بانتظار تدوين ودفاع المتهم...'
        };
        setActiveSessionQuestions([...activeSessionQuestions, newQ]);
        setCustomQuestionInput('');
        setCustomAnswerInput('');
    };

    // Inject question from library
    const handleInjectLibraryQuestion = (qText: string) => {
        setCustomQuestionInput(qText);
        addToast({ type: 'success', title: 'تلقيم السؤال', message: 'تم سحب الصياغة ومرفق للتعديل أو الإجابة.' });
    };

    const handleSaveSession = () => {
        if (activeSessionQuestions.length === 0) {
            addToast({ type: 'warning', title: 'جلسة فرعية فارغة', message: 'يرجى إضافة سؤال تحقيق واحد على الأقل قبل تسجيل الجلسة.' });
            return;
        }

        const party = sessionPartyName.trim() || selectedCase.employeeName;
        const sObj: InvestigationSession = {
            id: `sess-${Date.now()}`,
            sessionDate,
            partyName: party,
            partyType: sessionPartyType,
            questions: activeSessionQuestions,
            isOathTaken: sessionPartyType === 'witness' ? isOathTaken : false,
            notes: sessionNotes || 'أقر الأطراف بصحة التدوين من خلال استبيان محاور التحقيق.',
            digitalSignature: `مصادق إلكترونياً بقلم: ${party}`
        };

        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                const curSafeguards = c.safeguards || { within15Days: true, writtenNotice: false, heardEmployee: false, signedOnPages: false, proportionalPenalty: false };
                return {
                    ...c,
                    sessions: [...c.sessions, sObj],
                    status: CaseStatus.ONGOING,
                    safeguards: {
                        ...curSafeguards,
                        heardEmployee: sObj.partyType === 'employee' ? true : curSafeguards.heardEmployee,
                        signedOnPages: true
                    }
                };
            }
            return c;
        });

        setCases(updated);
        setActiveSessionQuestions([]);
        setSessionPartyName('');
        setSessionNotes('');
        setIsOathTaken(false);
        addToast({ type: 'success', title: 'سجل محضر السماع', message: 'تم تدوين وحفظ محضر الجلسة عمالياً وجاري مطابقة البيانات.' });
    };

    // Witness handling
    const handleAddWitness = () => {
        if (!witnessName.trim()) return;
        const wObj: InvestigationWitness = {
            id: `wit-${Date.now()}`,
            name: witnessName.trim(),
            phone: witnessPhone || 'غير مسجل',
            status: witnessStatus,
            statement: witnessStatement
        };

        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                return {
                    ...c,
                    witnesses: [...c.witnesses, wObj]
                };
            }
            return c;
        });
        setCases(updated);
        setWitnessName('');
        setWitnessPhone('');
        setWitnessStatement('');
        addToast({ type: 'success', title: 'تم تثبيت الشاهد', message: 'تم استدعاء وتقييد الشاهد في أوراق الملف.' });
    };

    const handleDeleteWitness = (witId: string) => {
        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                return {
                    ...c,
                    witnesses: c.witnesses.filter(w => w.id !== witId)
                };
            }
            return c;
        });
        setCases(updated);
        addToast({ type: 'success', title: 'إزالة الشاهد', message: 'تم مسح وإزالة الشاهد من أوراق القضية.' });
    };

    // Evidence handling
    const handleAddEvidence = () => {
        if (!evidenceName.trim()) return;
        const eObj: InvestigationEvidence = {
            id: `ev-${Date.now()}`,
            name: evidenceName.trim(),
            type: evidenceType,
            dateAdded: new Date().toISOString().split('T')[0],
            notes: evidenceNotes
        };

        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                return {
                    ...c,
                    evidence: [...c.evidence, eObj]
                };
            }
            return c;
        });
        setCases(updated);
        setEvidenceName('');
        setEvidenceNotes('');
        addToast({ type: 'success', title: 'تسجيل حرز فني', message: 'تم حيازة وتدوين الدليل في فهارس التحقيق.' });
    };

    const handleDeleteEvidence = (evId: string) => {
        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                return {
                    ...c,
                    evidence: c.evidence.filter(e => e.id !== evId)
                };
            }
            return c;
        });
        setCases(updated);
        addToast({ type: 'success', title: 'شطب حرز', message: 'تم إزالة الحرز من مستندات القضية.' });
    };

    // Text Template Modification
    const handleSaveTemplateText = () => {
        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                return {
                    ...c,
                    customDocTemplateContent: editorText
                };
            }
            return c;
        });
        setCases(updated);
        addToast({ type: 'success', title: 'تعديل المحتوى المحرّر', message: 'تم حفظ تعديلاتك على مسودة المستند بنجاح لطباعته.' });
    };

    // Inject variable placeholder directly at current text selection end
    const handleInjectToken = (token: string) => {
        setEditorText(prev => prev + ' ' + token);
        addToast({ type: 'success', title: 'تم حقن المتغير', message: `تم إدراج الرمز ${token} في نص المحرر الجاري.` });
    };

    // STAGES APPROVAL & DISCIPLINARY SYNC WRITES
    const handleApproveRole = (role: 'investigator' | 'legal_manager' | 'general_manager') => {
        const updated = cases.map(c => {
            if (c.id === activeCaseId) {
                const uCase = { ...c };
                if (role === 'investigator') uCase.approvedByInvestigator = true;
                if (role === 'legal_manager') {
                    uCase.approvedByLegalManager = true;
                    uCase.status = CaseStatus.ONGOING;
                }
                if (role === 'general_manager') {
                    uCase.approvedByGeneralManager = true;
                    uCase.status = CaseStatus.CLOSED;
                    uCase.endDate = new Date().toISOString().split('T')[0];
                }
                return uCase;
            }
            return c;
        });
        setCases(updated);

        // SYNC BACK TO EMPLOYEE DOSSIER AND DISCIPLINARY MODULE
        if (role === 'general_manager') {
            const currentC = updated.find(c => c.id === activeCaseId);
            if (currentC) {
                // 1. Write back to Employee Dossier List in LocalStorage
                const updatedEmployees = employees.map(emp => {
                    if (emp.id === currentC.employeeId) {
                        const discArr = emp.disciplinaryActions || [];
                        return {
                            ...emp,
                            hasActiveInvestigation: false,
                            disciplinaryActions: [
                                ...discArr,
                                {
                                    id: `disc-action-${Date.now()}`,
                                    violationDate: currentC.startDate,
                                    violationType: currentC.category || 'مخالفة عامة للتدرج',
                                    violationDetails: currentC.subject,
                                    penalty: currentC.proposedPenalty || 'إنذار كتابي أول بملفه لتعديل الممارسات المالية.',
                                    authorityDeciding: 'الشركاء والمدير العام بموجب التحقيق القضائي',
                                    status: 'Approved'
                                }
                            ]
                        };
                    }
                    return emp;
                });
                setEmployees(updatedEmployees);

                // 2. Write back to alwagayan_disciplinary as well for Sanctions Syncing
                const storedDisc = localStorage.getItem('alwagayan_disciplinary');
                let existingDiscArr = [];
                if (storedDisc) {
                    try { existingDiscArr = JSON.parse(storedDisc); } catch(ex) {}
                }
                const newPenalty = {
                    id: `da-${Date.now()}`,
                    employeeId: currentC.employeeId,
                    employeeName: currentC.employeeName,
                    violationDate: currentC.startDate,
                    reportDate: new Date().toISOString().split('T')[0],
                    reportedBy: currentC.complainantName,
                    violationType: currentC.category || 'إهمال وظيفي تقصيري',
                    violationDetails: currentC.subject,
                    investigation: {
                        investigator: currentC.investigator,
                        investigationSummary: currentC.recommendation || 'أثبتت التحقيقات وقوع التقصير بصفة كاملة وموثقة بـ عدالة.',
                    },
                    actionTaken: currentC.proposedPenalty || 'الخصم من الأجر ليوم كامل للتأديب',
                    penaltyDetails: `تم إغلاق القضية رقم ${currentC.caseNumber} بامتثال تام لقرار الهيئة العامة للقوى العاملة.`,
                    actionEffectiveDate: new Date().toISOString().split('T')[0],
                    status: 'ACTION_TAKEN',
                    createdAt: new Date().toISOString().split('T')[0],
                    linkedInvestigationId: currentC.caseNumber
                };
                localStorage.setItem('alwagayan_disciplinary', JSON.stringify([newPenalty, ...existingDiscArr]));
            }
            addToast({ type: 'success', title: 'توقيع المدير العام وتصديق الأثر ماليًا', message: 'تم إقفال القضية كلياً، وتحديث سجل جزاءات الموظف وتسويات كشوف الرواتب.' });
        } else {
            addToast({ type: 'success', title: 'تم التوقيع والمصادقة', message: 'تم إدراج توقيعك على وثيقة التحقيق المرفقة.' });
        }
    };

    // Calculate current compliance rate of active case based on safeguards check list
    const activeCaseComplianceScore = useMemo(() => {
        if (!selectedCase || !selectedCase.safeguards) return 60;
        const checks = selectedCase.safeguards;
        const valid = Object.values(checks).filter(Boolean).length;
        return (valid / 5) * 100;
    }, [selectedCase]);

    // Parse live text matching placeholder templates
    const resolvedPrintText = useMemo(() => {
        if (!selectedCase) return '';
        // If there's modified text, parse that, otherwise parse default template
        const textToParse = selectedCase.customDocTemplateContent || PRINT_TEMPLATES.find(t => t.id === selectedTemplateId)?.text(selectedCase) || '';
        return parseTemplateTokens(textToParse, selectedCase);
    }, [selectedCase, selectedTemplateId, editorText]);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-12 font-sans" style={{ direction: 'rtl' }}>
            
            {/* Header section with brand identity */}
            <div className="bg-slate-900 text-white border-b border-amber-600/30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Scale className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                بوابـة عدالة للامتثال والتحقيقات العمالية • الكويت
                            </span>
                            <h1 className="text-2xl font-black tracking-tight">
                                منظومة التحقيقات الإدارية والامتثال القانوني الشامل
                            </h1>
                            <p className="text-xs text-slate-400 font-bold">
                                رصد القضايا، أرشفة الجلسات والشهود، صياغة ومطابقة الضمانات الإجرائية وفق قانون العمل الكويتي رقم 6 لسنة 2010.
                            </p>
                        </div>
                        
                        <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-right">
                            <p className="text-[10px] text-slate-400 font-black block">مكتب ومسجل الشؤون القانونية</p>
                            <p className="text-xs font-black text-white">الوقيان والعبدالله والشركاء للمحاماة</p>
                            <p className="text-[9px] text-amber-400 font-mono font-bold mt-1">
                                {new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Row for Main Tabs */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-reverse space-x-4 h-14 items-center">
                        {[
                            { id: 'cases', title: 'سجل القضايا والتحقيقات الجارية', count: cases.length, icon: <Folder className="w-4 h-4" /> },
                            { id: 'dashboard', title: 'لوحة التحكم والتحليلات الرقابية', count: null, icon: <TrendingUp className="w-4 h-4" /> },
                            { id: 'questions', title: 'مكتبة الأسئلة الاسترشادية التفاعلية', count: Object.keys(library).length, icon: <BookOpen className="w-4 h-4" /> },
                        ].map(t => {
                            const isActive = activeMainTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveMainTab(t.id as any)}
                                    className={`relative h-14 px-3 flex items-center gap-2 text-xs font-black border-b-2 transition-all ${isActive ? 'border-indigo-600 text-indigo-700 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                                >
                                    {t.icon}
                                    <span>{t.title}</span>
                                    {t.count !== null && (
                                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black ${isActive ? 'bg-indigo-100 text-indigo-750' : 'bg-slate-100 text-slate-500'}`}>
                                            {t.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main view container */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                
                {/* 1. DASHBOARD TAB VIEW */}
                {activeMainTab === 'dashboard' && (
                    <DashboardTab 
                        cases={cases}
                        stats={statsSummary}
                        onSelectCase={(id) => {
                            setActiveCaseId(id);
                            setActiveMainTab('cases');
                            setActiveWorkspaceTab('safeguards_profile');
                        }}
                        onAddCaseTrigger={() => setIsCreateModalOpen(true)}
                    />
                )}

                {/* 2. QUESTION LIBRARY TAB VIEW */}
                {activeMainTab === 'questions' && (
                    <QuestionLibraryTab 
                        library={library}
                        onUpdateLibrary={(newLib) => setLibrary(newLib)}
                        onResetLibrary={() => {
                            setLibrary(initialQuestionsLibrary);
                            localStorage.setItem('alwagayan_questions_library', JSON.stringify(initialQuestionsLibrary));
                        }}
                    />
                )}

                {/* 3. CORE CASES INDEX & WORKSPACE */}
                {activeMainTab === 'cases' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT COLUMN: CASES LEDGER INDEX */}
                        <div className="space-y-4 lg:col-span-1">
                            
                            <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3 shadow-md">
                                <div className="flex justify-between items-center text-xs font-black">
                                    <h3 className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-amber-400" />
                                        سجل الواقعات وبلاغات الامتثال
                                    </h3>
                                    <button 
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1 shadow-sm transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-slate-950" />
                                        فتح فتح تحقيق
                                    </button>
                                </div>
                                
                                {/* Search input */}
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 text-white text-xs font-bold rounded-xl pr-10 pl-3 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-500"
                                        placeholder="بحث برقم القضية، الموظف، الموضوع..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                                </div>

                                {/* Status Filters Select */}
                                <div className="flex items-center justify-between text-[11px] font-black gap-2 pt-1">
                                    <span className="text-slate-400 shrink-0">حالة التصفية:</span>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 text-white text-[10px] font-bold rounded-lg p-1.5 focus:outline-none focus:border-amber-500"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="ALL">الكل ({cases.length})</option>
                                        <option value={CaseStatus.NEW}>مسجل جديد</option>
                                        <option value={CaseStatus.ONGOING}>قيد التحقيق</option>
                                        <option value={CaseStatus.ON_HOLD}>معلق</option>
                                        <option value={CaseStatus.CLOSED}>منتهي ومغلق</option>
                                    </select>
                                </div>
                            </div>

                            {/* Case scroll list */}
                            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                                {filteredCases.length === 0 ? (
                                    <div className="p-8 border border-slate-150 rounded-2xl bg-white text-center text-slate-400 text-xs font-black">
                                        لا توجد قضايا ومحاضر مطابقة لشروط التصفية الحالية.
                                    </div>
                                ) : (
                                    filteredCases.map(c => {
                                        const isSelected = c.id === activeCaseId;
                                        // Count compliance guarantees
                                        const checks = c.safeguards || { within15Days: true, writtenNotice: false, heardEmployee: false, signedOnPages: false, proportionalPenalty: false };
                                        const ticks = Object.values(checks).filter(Boolean).length;
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => {
                                                    setActiveCaseId(c.id);
                                                    setActiveWorkspaceTab('safeguards_profile');
                                                }}
                                                className={`p-4 rounded-3xl border transition-all cursor-pointer relative text-right flex flex-col justify-between hover:shadow-md ${isSelected ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/10' : 'bg-white border-slate-200'}`}
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-mono font-black text-slate-400">{c.caseNumber}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                                            c.status === CaseStatus.NEW ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                                                            c.status === CaseStatus.ONGOING ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                                                            c.status === CaseStatus.CLOSED ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                                            'bg-red-50 text-red-700 border border-red-150'
                                                        }`}>
                                                            {c.status}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-xs font-black text-slate-900 leading-normal line-clamp-1">{c.employeeName}</h4>
                                                    <p className="text-[10px] text-slate-500 font-extrabold line-clamp-1">{c.subject}</p>
                                                    <p className="text-[9px] font-mono text-slate-400">تاريخ البدء: {c.startDate}</p>
                                                </div>

                                                <div className="border-t mt-3 pt-2.5 flex justify-between items-center text-[9px] font-black text-slate-400">
                                                    <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md text-[8px]">
                                                        {c.category || 'تظلم عمالي'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>الامتثال:</span>
                                                        <span className={ticks === 5 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                                                            {ticks}/5 بنود
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ACTIVE CASE WORKSPACE */}
                        <div className="lg:col-span-2 space-y-4 text-right">
                            
                            {!selectedCase ? (
                                <div className="p-12 border bg-white rounded-3xl text-center text-slate-400 text-xs font-black">
                                    يرجى اختيار قضية تحقيق من السجل الجاري لفتح بيئة العمل المتكاملة.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    
                                    {/* Workspace Title Card displaying top metadata */}
                                    <div className="p-6 bg-white border rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-lg">
                                                    ملف رقابي نشط: {selectedCase.caseNumber}
                                                </span>
                                                <span className="text-xs font-extrabold text-slate-400">|</span>
                                                <span className="text-xs font-bold text-slate-500">{selectedCase.category || 'إجراء تأديبي'}</span>
                                            </div>
                                            <h2 className="text-base font-black text-slate-900 leading-normal">{selectedCase.employeeName}</h2>
                                            <p className="text-xs text-slate-400 font-bold">{selectedCase.employeeJobTitle} بقسم {selectedCase.employeeDepartment}</p>
                                        </div>

                                        <div className="flex md:flex-col items-end gap-1 text-[11px] font-black shrink-0">
                                            <span className="text-slate-400 font-extrabold text-right block">المحقق المستشار:</span>
                                            <span className="text-slate-800 underline decoration-amber-500 decoration-2">{selectedCase.investigator}</span>
                                            <button 
                                                onClick={() => handleDeleteCase(selectedCase.id, selectedCase.caseNumber)} 
                                                className="text-[9px] font-bold text-red-500 hover:text-red-700 bg-rose-50 px-2 py-1 rounded-lg border border-red-200 mt-1"
                                            >
                                                مسح وحذف القضية
                                            </button>
                                        </div>
                                    </div>

                                    {/* Case Workspace Sub-tabs Navigation */}
                                    <div className="bg-slate-100 p-1 rounded-2xl flex space-x-reverse space-x-1 border">
                                        {[
                                            { id: 'safeguards_profile', title: 'الملف وضمانات الامتثال', badge: activeCaseComplianceScore + '%' },
                                            { id: 'sessions_qa', title: 'جلسات التحقيق و س ع', badge: selectedCase.sessions?.length || null },
                                            { id: 'witnesses_evidence', title: 'الأحراز والشهود عياناً', badge: (selectedCase.witnesses?.length || 0) + (selectedCase.evidence?.length || 0) || null },
                                            { id: 'approvals', title: 'التوصية والاعتماد الثلاثي', badge: selectedCase.approvedByGeneralManager ? 'مُعتمد' : 'تحت المراجعة' },
                                            { id: 'print_editor', title: 'المحرر وطباعة النماذج الـ 11', badge: 'مسودة' }
                                        ].map(wsTab => {
                                            const isActive = activeWorkspaceTab === wsTab.id;
                                            return (
                                                <button
                                                    key={wsTab.id}
                                                    onClick={() => setActiveWorkspaceTab(wsTab.id as any)}
                                                    className={`flex-grow py-2.5 px-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${isActive ? 'bg-slate-900 text-white shadow font-black' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    <span>{wsTab.title}</span>
                                                    {wsTab.badge !== null && (
                                                        <span className={`px-1 rounded-md text-[8px] shrink-0 font-mono font-extrabold ${isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                                                            {wsTab.badge}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* WORKSPACE SUB-TAB CONTENT RENDERS */}

                                    {/* TAB 1: PROFILE & LEGAL SAFEGUARDS CHECKLIST */}
                                    {activeWorkspaceTab === 'safeguards_profile' && (
                                        <div className="space-y-4">
                                            
                                            {/* Top Card: Metadata Profiles */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                                                <h3 className="text-xs font-black text-slate-900 border-b pb-2">تفاصيل البلاغ والجهة المشتكية</h3>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-black">
                                                    <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                                                        <span className="text-[10px] text-slate-400 font-bold block">مقدّم البلاغ والمذكرة:</span>
                                                        <p className="text-slate-800">{selectedCase.complainantName}</p>
                                                        <p className="text-[10px] text-slate-500">{selectedCase.complainantTitle}</p>
                                                    </div>

                                                    <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                                                        <span className="text-[10px] text-slate-400 font-bold block">تاريخ رصد الواقعة:</span>
                                                        <p className="text-slate-800 font-mono">{selectedCase.startDate}</p>
                                                        <p className="text-[10px] text-indigo-600">مهلة التحقيق تنتهي بـ {selectedCase.startDate} (كحد أقصى)</p>
                                                    </div>
                                                </div>

                                                <div className="bg-amber-500/5 border border-dashed border-amber-300 p-4 rounded-2xl">
                                                    <span className="text-[10px] font-black text-amber-800 block mb-1">تفصيل تكييف الواقعة والموضوع عمالياً:</span>
                                                    <p className="text-xs font-extrabold text-slate-700 leading-relaxed font-sans">{selectedCase.subject}</p>
                                                </div>
                                            </Card>

                                            {/* Safeguards Checklists with interactive counts */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                                                <div className="flex justify-between items-center border-b pb-3">
                                                    <div className="space-y-1">
                                                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg text-[9px] inline-block">
                                                            صمام الأمان لـ عدالة
                                                        </span>
                                                        <h3 className="text-xs font-black text-slate-900 block flex items-center gap-1">
                                                            الضمانات الإجرائية ومؤشر الامتثال الكويتي
                                                        </h3>
                                                    </div>

                                                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                                                        activeCaseComplianceScore === 100 ? 'bg-emerald-500 text-white font-black' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        مؤشر الامتثال: {activeCaseComplianceScore}%
                                                    </span>
                                                </div>

                                                <p className="text-[11px] leading-relaxed text-slate-500 font-bold">بموجب المادتين 35 و 102 من قانون العمل الكويتي رقم 6 لسنة 2010، يُشترط استيفاء هذه البنود لسلامة القرار التأديبي أمام الدوائر العمالية ومحاكم الدولة:</p>

                                                <div className="space-y-2 pt-2">
                                                    {[
                                                        { key: 'within15Days', title: "تم بدء التحقيق والمساءلة خلال 15 يوماً من كشف المخالفة (مادة 35)", desc: "لا تجوز مساءلة العامل عمالياً على واقعة اكتشفت ومضت عليها مدة 15 يوماً دون إثبات." },
                                                        { key: 'writtenNotice', title: "إبلاغ الموظف المحال كتابة بالواقعات ومواعيد المثول للجنة", desc: "يُحظر إجراء تحقيق مع العامل شفوياً دون إعلان كتابي مسبق يثبت علمه بالمثول القانوني." },
                                                        { key: 'heardEmployee', title: "سماع وتحقيق دفوع وأقوال موجه المتهم في محضر رسمي", desc: "الحق في شرح الحجة والمبرر وسؤال المتهم وتسجيل دفوعه خطياً لضمان النزاهة القانونية للقرار." },
                                                        { key: 'signedOnPages', title: "توقيع ومصادقة الموظف على كل ورقة من محاضر السماع والجلسات", desc: "توقيع الموظف أو تدوين سبب امتناعه يثبت تداول المستندات ومطابقتها تحت عدالة." },
                                                        { key: 'proportionalPenalty', title: "العقوبة التأديبية موصى بها تدرجاً وفق لائحة الجزاءات المعتمدة", desc: "أن تطابق العقوبة المادة 102 لدرء البطلان أو الإلغاء القضائي وتجنب عواقب الهيئة العامة للقوى العاملة." }
                                                    ].map(check => {
                                                        const isChecked = selectedCase.safeguards?.[check.key as keyof LegalSafeguards] || false;
                                                        return (
                                                            <div 
                                                                key={check.key}
                                                                onClick={() => handleToggleSafeguard(check.key as any)}
                                                                className={`p-3.5 border rounded-2xl flex items-start gap-3 cursor-pointer transition-all ${
                                                                    isChecked ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <button className="pt-0.5 shrink-0">
                                                                    {isChecked ? (
                                                                        <div className="w-4 h-4 bg-indigo-600 rounded-md flex items-center justify-center">
                                                                            <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-4 h-4 rounded-md border border-slate-350"></div>
                                                                    )}
                                                                </button>
                                                                
                                                                <div className="space-y-0.5">
                                                                    <p className={`text-xs font-black ${isChecked ? 'text-indigo-900 font-black' : 'text-slate-800'}`}>{check.title}</p>
                                                                    <p className="text-[10px] text-slate-450 leading-normal font-bold font-sans">{check.desc}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Legal Warning triggers */}
                                                {activeCaseComplianceScore < 100 && (
                                                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-start gap-2 text-[10px] leading-relaxed font-bold">
                                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                        <div className="space-y-1 text-right">
                                                            <p className="font-black">تنبيه صمام الأمان والضمانات:</p>
                                                            <p className="font-medium font-sans">لم يستوفِ هذا الملف 100% من بنود الامتثال. تطبيق عقوبة في الوضع الراهن قد يتعرض للبطلان وتسهيل الطعن العمالي لعدم توثيق كافة ضمانات الدفاع خطياً.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        </div>
                                    )}

                                    {/* TAB 2: INVESTIGATION SESSIONS & Q&A */}
                                    {activeWorkspaceTab === 'sessions_qa' && (
                                        <div className="space-y-4">
                                            
                                            {/* Sub-tab interactive question injector panel */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                                                <h3 className="text-xs font-black text-slate-900 border-b pb-2.5">تلقيم أسئلة التحقيق الفورية من الفهرس الاسترشادي</h3>
                                                <p className="text-[11px] text-slate-500 font-bold">اختر السؤال بضغطة واحدة من الفئتين ذوات الصلة بموضوع المتهم لتلقيمه مباشرة في صياغات المحاضر وجلسات السماع:</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[190px] overflow-y-auto pr-1">
                                                    {Object.keys(library).slice(0, 6).map(catName => (
                                                        <div key={catName} className="p-3 bg-slate-50 rounded-xl border border-dashed space-y-1.5">
                                                            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 inline-block">{catName}</span>
                                                            <div className="space-y-1">
                                                                {(library[catName] || []).slice(0, 2).map((qTxt, qIdx) => (
                                                                    <button
                                                                        key={qIdx}
                                                                        type="button"
                                                                        className="w-full text-right text-[10px] font-black text-slate-700 hover:text-indigo-600 block line-clamp-1 py-1 px-1 bg-white hover:bg-indigo-50 border rounded transition-all"
                                                                        onClick={() => handleInjectLibraryQuestion(qTxt)}
                                                                        title={qTxt}
                                                                    >
                                                                        • {qTxt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>

                                            {/* Sessions Q&A Form interface */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                                                <div className="flex justify-between items-center border-b pb-3">
                                                    <div className="space-y-1">
                                                        <span className="bg-amber-50 border border-amber-150 text-amber-800 px-2.5 py-0.5 rounded-lg text-[9px] font-black inline-block">
                                                            تسجيل وتوثيق الجلسة
                                                        </span>
                                                        <h3 className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4 text-amber-500" />
                                                            إنشاء وضبط محضر سماع أقوال جديد
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-black">
                                                    <div className="space-y-1 text-right">
                                                        <label className="text-slate-500 font-bold">تاريخ الانعقاد:</label>
                                                        <input 
                                                            type="date" 
                                                            className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
                                                            value={sessionDate}
                                                            onChange={(e) => setSessionDate(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-1 text-right">
                                                        <label className="text-slate-500 font-bold">صفة الطرف المستجوب:</label>
                                                        <select 
                                                            className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
                                                            value={sessionPartyType}
                                                            onChange={(e) => {
                                                                const val = e.target.value as any;
                                                                setSessionPartyType(val);
                                                                if (val === 'employee') {
                                                                    setSessionPartyName(selectedCase.employeeName);
                                                                } else {
                                                                    setSessionPartyName('');
                                                                }
                                                            }}
                                                        >
                                                            <option value="employee">الموظف المعني بالتحقيق (المتهم)</option>
                                                            <option value="witness">شاهد عيان أو طرف خارجي</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1 text-right">
                                                        <label className="text-slate-500 font-bold">اسم الطرف الماثل:</label>
                                                        <input 
                                                            type="text" 
                                                            className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
                                                            placeholder="اكتب الاسم كاملاً..."
                                                            value={sessionPartyName}
                                                            onChange={(e) => setSessionPartyName(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* If party is witness, display Oath checkpoint under civil rules */}
                                                {sessionPartyType === 'witness' && (
                                                    <div className="p-3 bg-amber-500/5 border border-dashed border-amber-300 rounded-xl flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-amber-800">حلف اليمين إدارياً (للشهود فقط):</span>
                                                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isOathTaken} 
                                                                onChange={() => setIsOathTaken(!isOathTaken)}
                                                            />
                                                            أقسم بالله العظيم أن أدلي بالحق دون ميل
                                                        </label>
                                                    </div>
                                                )}

                                                {/* Questions block under current draft */}
                                                <div className="p-4 border border-dashed rounded-2xl bg-slate-50/50 space-y-3">
                                                    <h4 className="text-[11px] font-black text-slate-800">مجرى الأسئلة والأقوال خطياً:</h4>
                                                    
                                                    {/* Active draft array display */}
                                                    {activeSessionQuestions.length > 0 && (
                                                        <div className="space-y-2 max-h-[160px] overflow-y-auto bg-white border p-3 rounded-xl">
                                                            {activeSessionQuestions.map((q, idx) => (
                                                                <div key={q.id} className="text-xs border-b pb-2 last:border-b-0 space-y-1 font-bold">
                                                                    <p className="text-slate-800">{q.question}</p>
                                                                    <p className="text-indigo-600 font-medium font-sans pr-2">{q.answer}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="space-y-2 text-xs font-black">
                                                        <div className="space-y-1">
                                                            <span className="text-slate-450 block text-[10px]">نص سؤال المحقق:</span>
                                                            <input 
                                                                type="text" 
                                                                className="w-full font-bold border rounded-xl p-2 bg-white"
                                                                placeholder="س: ما هي أسباب..."
                                                                value={customQuestionInput}
                                                                onChange={(e) => setCustomQuestionInput(e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <span className="text-slate-450 block text-[10px]">إفادة وجواب الطرف الماثل:</span>
                                                            <textarea 
                                                                className="w-full font-bold border rounded-xl p-2 bg-white"
                                                                placeholder="ج: إن مبررات الواقعة..."
                                                                rows={2}
                                                                value={customAnswerInput}
                                                                onChange={(e) => setCustomAnswerInput(e.target.value)}
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl text-[10px] shadow hover:bg-slate-800"
                                                            onClick={handleAddQuestionToDraft}
                                                        >
                                                            + إدراج وضبط بند السؤال المعين
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-right text-xs font-black">
                                                    <label className="text-slate-500 font-bold pb-0.5">ملاحظات ختامية حول سلوك المستجوب:</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
                                                        placeholder="أقر الطرف بصحة التدوين وصق العقد واللائحة..."
                                                        value={sessionNotes}
                                                        onChange={(e) => setSessionNotes(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2 border-t">
                                                    <Button 
                                                        variant="primary" 
                                                        className="bg-indigo-600 text-xs font-black py-2 rounded-xl"
                                                        onClick={handleSaveSession}
                                                    >
                                                        حفظ وتوثيق محضر السماع النهائي الجاري
                                                    </Button>
                                                </div>
                                            </Card>

                                            {/* Historic registered sessions view list */}
                                            {selectedCase.sessions?.length > 0 && (
                                                <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                                                    <h3 className="text-xs font-black text-slate-950 flex items-center justify-between border-b pb-2">
                                                        <span>محاضر السماع وسجل الأرشيف بالجلسة الكلية</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">تاريخ المطابقة الإلكترونية</span>
                                                    </h3>

                                                    <div className="space-y-3">
                                                        {selectedCase.sessions.map((sess, idx) => (
                                                            <div key={sess.id} className="p-4 bg-slate-50 border rounded-2xl text-right text-xs font-black space-y-2">
                                                                <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                                                                    <span className="text-indigo-700 bg-indigo-50 border px-2 py-0.5 rounded-lg">
                                                                        محضر رقم {idx + 1} • {sess.partyType === 'employee' ? 'المتهم' : 'الشاهد'}
                                                                    </span>
                                                                    <span>تاريخ الانعقاد: {sess.sessionDate}</span>
                                                                </div>

                                                                <h4 className="font-extrabold text-slate-900">سماع أقوال: {sess.partyName}</h4>
                                                                {sess.isOathTaken && <p className="text-[9px] font-black text-amber-700">✓ حلف الشاهد اليمين القانونية قبل التفرع.</p>}

                                                                <div className="bg-white border rounded-xl p-3 divide-y space-y-2">
                                                                    {sess.questions.map(q => (
                                                                        <div key={q.id} className="pt-2 first:pt-0 space-y-1">
                                                                            <p className="text-slate-800 font-black">{q.question}</p>
                                                                            <p className="text-indigo-600 font-extrabold font-sans pr-2.5">{q.answer}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <p className="text-[10px] text-slate-400 leading-normal font-sans italic">ملاحظات المحقق: {sess.notes}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 3: WITNESSES & EVIDENCE MANAGEMENT */}
                                    {activeWorkspaceTab === 'witnesses_evidence' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            
                                            {/* PART A: WITNESSES DIRECTORY */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4 text-right">
                                                <div className="border-b pb-2">
                                                    <h3 className="text-xs font-black text-slate-900 block">إدارة واستدعاء الشهود عيالاً</h3>
                                                    <p className="text-[10px] text-slate-500 font-bold">تسجيل وتوثيق الشهود وإخطار التخلف بموجب الضوابط العمالية.</p>
                                                </div>

                                                <div className="space-y-2.5 text-xs font-black">
                                                    <div className="space-y-1">
                                                        <span className="text-slate-500 block text-[10px]">اسم الشاهد المستدعى:</span>
                                                        <input 
                                                            type="text" 
                                                            className="w-full font-bold border rounded-xl p-2 bg-slate-50 focus:bg-white focus:outline-none"
                                                            placeholder="اكتب الاسم الكامل للشاهد..."
                                                            value={witnessName}
                                                            onChange={(e) => setWitnessName(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-slate-500 block text-[10px]">رقم هاتف الاتصال:</span>
                                                        <input 
                                                            type="text" 
                                                            className="w-full font-bold border rounded-xl p-2 bg-slate-50 focus:bg-white focus:outline-none text-left font-mono"
                                                            placeholder="9650000000"
                                                            value={witnessPhone}
                                                            onChange={(e) => setWitnessPhone(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-slate-500 block text-[10px]">إفادة الشاهد اليدوية المسبقة:</span>
                                                        <textarea 
                                                            className="w-full font-bold border rounded-xl p-2 bg-slate-50 focus:bg-white focus:outline-none"
                                                            placeholder="سرد ما عاينته عين الشاهد بالدقة..."
                                                            rows={2}
                                                            value={witnessStatement}
                                                            onChange={(e) => setWitnessStatement(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <span className="text-slate-500 block text-[10px]">الحالة الإجرائية:</span>
                                                            <select 
                                                                className="w-full font-bold border rounded-xl p-2 bg-slate-50 focus:bg-white focus:outline-none text-[11px]"
                                                                value={witnessStatus}
                                                                onChange={(e) => setWitnessStatus(e.target.value as any)}
                                                            >
                                                                <option value="summoned">تم إرسال إخطار المثول</option>
                                                                <option value="attended">حضر وأدلى بالشهادة</option>
                                                                <option value="absent">تخلف أو ممتنع عن الحضور</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex items-end shadow-inner">
                                                            <button
                                                                type="button"
                                                                className="w-full bg-slate-900 text-white font-black p-2 rounded-xl text-[10px] h-10 hover:bg-slate-800 transition-colors"
                                                                onClick={handleAddWitness}
                                                            >
                                                                + إدراج الشاهد وجرد أقواله
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Witnesses Queue List */}
                                                <div className="space-y-1.5 pt-2 max-h-[220px] overflow-y-auto">
                                                    {(selectedCase.witnesses || []).map(w => (
                                                        <div key={w.id} className="p-3 bg-slate-50 border rounded-xl font-bold flex justify-between items-start gap-1">
                                                            <div className="space-y-1 text-right text-xs">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'attended' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                                    <span className="text-slate-950 font-extrabold">{w.name}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500">هاتف: {w.phone}</p>
                                                                {w.statement && (
                                                                    <p className="bg-white border rounded p-1.5 mt-1 text-[10px] leading-relaxed text-slate-650 italic font-mono font-normal">
                                                                        الإفادة: "{w.statement}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteWitness(w.id)}
                                                                className="p-1 hover:bg-rose-100 text-rose-500 rounded border"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>

                                            {/* PART B: EVIDENCE & RECORD INDEX */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4 text-right">
                                                <div className="border-b pb-2">
                                                    <h3 className="text-xs font-black text-slate-900 block">إدارة الأدلة، المستندات والأحراز الفنية</h3>
                                                    <p className="text-[10px] text-slate-500 font-bold">تسجيل وتتبع البراهين الرقمية والمحاسبية لسلامة التكييف القضائي.</p>
                                                </div>

                                                <div className="space-y-2.5 text-xs font-black">
                                                    <div className="space-y-1">
                                                        <span className="text-slate-500 block text-[10px]">اسم الدليل أو المستند الحرز:</span>
                                                        <input 
                                                            type="text" 
                                                            className="w-full font-bold border rounded-xl p-2 bg-slate-50 focus:bg-white focus:outline-none"
                                                            placeholder="سجل الكود البصمي، مستند الجرد المفاجئ..."
                                                            value={evidenceName}
                                                            onChange={(e) => setEvidenceName(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-slate-500 block text-[10px]">نوع الحرز وتصنيفه الرقابي:</span>
                                                        <select 
                                                            className="w-full font-bold border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none text-[11px]"
                                                            value={evidenceType}
                                                            onChange={(e) => setEvidenceType(e.target.value)}
                                                        >
                                                            <option value="ملفات تقنية ومستندات">ملفات تقنية ومستندات</option>
                                                            <option value="تقارير جرد مالية">تقارير جرد محاسبية ومستندات بنك</option>
                                                            <option value="تسجيلات كاميرات المراقبة">تسجيلات بصمة أو كاميرات الدوائر</option>
                                                            <option value="مراسلات وبريد إلكترونى">مراسلات إلكترونية وإثبات محادثات</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-slate-500 block text-[10px]">توضيحات وملاحظات المحقق حول الحرز:</span>
                                                        <input 
                                                            type="text" 
                                                            className="w-full font-bold border rounded-xl p-2 bg-slate-50 focus:bg-white focus:outline-none"
                                                            placeholder="ساعة الاستخراج وموقع الخادم..."
                                                            value={evidenceNotes}
                                                            onChange={(e) => setEvidenceNotes(e.target.value)}
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="w-full bg-slate-900 text-amber-400 font-black p-2 rounded-xl text-[10px] h-10 hover:bg-slate-800 transition-colors"
                                                        onClick={handleAddEvidence}
                                                    >
                                                        + حيازة الحرز وتسجيله بالأوراق الرسمية
                                                    </button>
                                                </div>

                                                {/* Evidence List */}
                                                <div className="space-y-1.5 pt-2 max-h-[220px] overflow-y-auto">
                                                    {(selectedCase.evidence || []).map(e => (
                                                        <div key={e.id} className="p-3 bg-slate-50 border rounded-xl font-bold flex justify-between items-start gap-1 text-xs text-right">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-indigo-700 bg-indigo-50 border text-[9px] px-1.5 py-0.5 rounded">
                                                                        {e.type}
                                                                    </span>
                                                                    <span className="text-slate-950 font-extrabold">{e.name}</span>
                                                                </div>
                                                                {e.notes && <p className="text-[10px] text-slate-505 font-medium leading-relaxed italic pr-2 font-sans">توضيح: {e.notes}</p>}
                                                                <p className="text-[9px] text-slate-400 font-mono font-bold">تاريخ الحيازة بالأوراق: {e.dateAdded}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteEvidence(e.id)}
                                                                className="p-1 hover:bg-rose-100 text-rose-500 rounded border shrink-0"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* TAB 4: DIRECT ACTION RECOMMENDATIONS & DIGITAL TRIPLE SIGNATURES */}
                                    {activeWorkspaceTab === 'approvals' && (
                                        <div className="space-y-4">
                                            
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4 text-right">
                                                <div className="border-b pb-2">
                                                    <h3 className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
                                                        <Award className="w-4.5 h-4.5 text-indigo-700" />
                                                        صياغة التوصيات والجزاءات التأديبية (اللائحة والمادة 102)
                                                    </h3>
                                                    <p className="text-[11px] text-slate-500 font-bold">يرجى صياغة الخلاصة وتحديد حجم الغرامة أو الجزاء عمالياً لربطه فوراً بملف الموظف وحساب الرواتب ماليًا.</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-black">
                                                    
                                                    {/* Select recommended penalty category */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-slate-500 font-bold">العقوبة المقترحة قانوناً (المادة 102):</label>
                                                        <select 
                                                            className="w-full text-xs font-black border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                                            value={selectedCase.proposedPenalty}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const updated = cases.map(c => {
                                                                    if (c.id === activeCaseId) return { ...c, proposedPenalty: val };
                                                                    return c;
                                                                });
                                                                setCases(updated);
                                                            }}
                                                        >
                                                            <option value="">-- اختر عقوبة لائحية متناسبة --</option>
                                                            <option value="تنبيه خطي بسيط مع لفت نظر مشدد لدرء التكرار بموجب الضوابط">1. إنذار وإنذار أول كتابي لملفه</option>
                                                            <option value="خصم راتب يوم كامل عمالياً مع توجيه تعهد خطي">2. خصم من الراتب يوم واحد</option>
                                                            <option value="خصم راتب 3 أيام عمل عمالياً بامتثال لائحة شؤون الموظفين">3. خصم من الراتب لمدة 3 أيام</option>
                                                            <option value="خصم راتب 5 أيام عمل بحد أقصى مسموح به شهرياً عمالياً">4. خصم من الراتب لمدة 5 أيام (الحد الأقصى للمرحلة الأولى)</option>
                                                            <option value="إيقاف مؤقت لمدة أسبوع وحرمان من نصف الأجر بموجب لائحة الشكاوى">5. الإيقاف المؤقت عن العمل لمدة أسبوع</option>
                                                            <option value="فصل ومغادرة المنشأة بالتنفيذ الفوري مع الحفاظ على مستحقات الضمان">6. فصل تأديبي لارتكاب مخالفة جسيمة جداً (مادة 41)</option>
                                                        </select>
                                                    </div>

                                                    {/* Recommended classification details */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-slate-550 font-bold">تصنيف المخالفة الرئيسي بالملف:</label>
                                                        <select
                                                            className="w-full text-xs font-black border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                                            value={selectedCase.category || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const updated = cases.map(c => {
                                                                    if (c.id === activeCaseId) return { ...c, category: val };
                                                                    return c;
                                                                });
                                                                setCases(updated);
                                                            }}
                                                        >
                                                            <option value="الإهمال الوظيفي والتقصير">الإهمال الوظيفي والتقصير</option>
                                                            <option value="المخالفات المالية وعجز الخزينة">المخالفات المالية وعجز الخزينة</option>
                                                            <option value="إفشاء المعلومات والسرية المهنية">إفشاء المعلومات والسرية المهنية</option>
                                                            <option value="الغياب التام والامتناع">الغياب التام والامتناع</option>
                                                            <option value="التأخير والإنصراف">التأخير والإنصراف</option>
                                                            <option value="إساءة استخدام السلطة والصلاحيات">إساءة استخدام السلطة والصلاحيات</option>
                                                            <option value="المخالفات السلوكية والتعدي اللفظي">المخالفات السلوكية والتعدي اللفظي</option>
                                                            <option value="مخالفات أمن ونظم المعلومات">مخالفات أمن ونظم المعلومات</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 pt-1 text-xs font-black">
                                                    <label className="text-slate-500 font-bold">مذكرة وخلاصة التكييف القانوني من الباحث المقيد:</label>
                                                    <textarea 
                                                        className="w-full font-bold border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                                        placeholder="يكتب المحقق بيده خلاصة ثبوت التهم من واقع تداول أقوال الشريك أو الشهود والاستنباط..."
                                                        rows={3}
                                                        value={selectedCase.recommendation}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const updated = cases.map(c => {
                                                                    if (c.id === activeCaseId) return { ...c, recommendation: val };
                                                                    return c;
                                                                });
                                                                setCases(updated);
                                                        }}
                                                    />
                                                </div>
                                            </Card>

                                            {/* Advanced Digital Approvals Workflow With Stamps */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4 text-right">
                                                <h3 className="text-xs font-black text-slate-900 border-b pb-2">نظام اعتماد التحقيق والتوقيع الرقمي الثلاثي (الحفظ القانوني)</h3>
                                                <p className="text-[11px] text-slate-500 font-bold leading-normal">تتطلب تكييفات القرار العمالي وتوقيع عقوبات الخصم المالي ثلاث مراحل متتالية من الاعتمادات المتوافقة لائحياً بالمؤسسة:</p>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                                    
                                                    {/* Step 1: Investigator Approval */}
                                                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between items-center text-center space-y-3">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-bold text-slate-450 block">المرحلة الأولى</span>
                                                            <h4 className="text-xs font-black text-slate-800">الباحث والمحقق القانوني</h4>
                                                            <p className="text-[9px] text-slate-450 font-bold">صياغة الوقائع ومطابقة الأقوال</p>
                                                        </div>

                                                        {selectedCase.approvedByInvestigator ? (
                                                            <div className="border border-indigo-600/30 bg-indigo-50/50 p-2.5 rounded-xl text-indigo-750 space-y-1.5 w-full relative overflow-hidden flex flex-col items-center">
                                                                <span className="text-[8px] tracking-widest font-black uppercase text-indigo-600 block animate-pulse">✓ تم التدقيق والتصديق</span>
                                                                <span className="text-[9px] font-extrabold font-mono text-slate-700 bg-white border px-2 py-0.5 rounded">أ. صبري صبري</span>
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary" 
                                                                className="text-[10px] bg-slate-900 text-white rounded-lg px-4"
                                                                onClick={() => handleApproveRole('investigator')}
                                                            >
                                                                توقيع المحقق المباشر
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Step 2: Legal Manager Approval */}
                                                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between items-center text-center space-y-3">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-bold text-slate-450 block">المرحلة الثانية</span>
                                                            <h4 className="text-xs font-black text-slate-800">رئيس الشؤون القانونية</h4>
                                                            <p className="text-[9px] text-slate-450 font-bold">التأكد وصواب الضمانات الإجرائية</p>
                                                        </div>

                                                        {selectedCase.approvedByLegalManager ? (
                                                            <div className="border border-emerald-600/30 bg-emerald-50/50 p-2.5 rounded-xl text-emerald-800 space-y-1.5 w-full relative overflow-hidden flex flex-col items-center">
                                                                <span className="text-[8px] tracking-widest font-black uppercase text-emerald-600 block">✓ تم الاعتماد والمطابقة</span>
                                                                <span className="text-[9px] font-extrabold font-mono text-slate-700 bg-white border px-2 py-0.5 rounded">أ. عبدالله الفهد</span>
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary" 
                                                                className="text-[10px] bg-indigo-650 text-white rounded-lg px-4"
                                                                disabled={!selectedCase.approvedByInvestigator}
                                                                onClick={() => handleApproveRole('legal_manager')}
                                                            >
                                                                مصادقة الشؤون القانونية
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Step 3: General Manager Approval */}
                                                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between items-center text-center space-y-3">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-bold text-slate-450 block">المرحلة الثالثة</span>
                                                            <h4 className="text-xs font-black text-slate-800">المدير العام والشركاء</h4>
                                                            <p className="text-[9px] text-slate-450 font-bold">التصديق النهائي وتطبيق الأثر المالي</p>
                                                        </div>

                                                        {selectedCase.approvedByGeneralManager ? (
                                                            <div className="border-2 border-amber-500 bg-amber-500/10 p-2 py-2.5 rounded-2xl text-amber-950 space-y-1 w-full relative overflow-hidden flex flex-col items-center">
                                                                {/* Golden visual stamp of closure */}
                                                                <div className="absolute right-0 bottom-0 w-12 h-12 bg-amber-500/10 rounded-full translate-y-6 translate-x-6 border border-amber-500/20"></div>
                                                                <span className="text-[9px] font-black text-amber-800 tracking-wider">★ الشريك الإداري العام ★</span>
                                                                <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">تم الاعتماد والإغلاق</span>
                                                                <span className="text-[9px] font-extrabold font-mono text-slate-600">الوقيان والعبدالله</span>
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary" 
                                                                className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg px-4 border-none"
                                                                disabled={!selectedCase.approvedByLegalManager}
                                                                onClick={() => handleApproveRole('general_manager')}
                                                            >
                                                                الاعتماد النهائي من المدير
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* TAB 5: DOCUMENT EDITOR & DIGITAL stationery PRINT PREVIEW */}
                                    {activeWorkspaceTab === 'print_editor' && (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            
                                            {/* Panel Left: Interactive Text Editor with variable injection assistance */}
                                            <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4 text-right">
                                                <div className="border-b pb-2">
                                                    <h3 className="text-xs font-black text-slate-900 block font-sans">محرر صياغة نماذج التحقيق الـ 11 التفاعلية</h3>
                                                    <p className="text-[10px] text-slate-505 font-bold">عدل وحرر الصياغات الرسمية للنصوص واستخدم أدوات التلقيم المساعد لطباعة ملفات معتمدة وموجهة.</p>
                                                </div>

                                                {/* Select printable template */}
                                                <div className="space-y-1 text-xs font-black">
                                                    <label className="text-slate-500 font-bold block">اختر مستند التحقيق المراد تعديله وطباعته:</label>
                                                    <select
                                                        className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
                                                        value={selectedTemplateId}
                                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                                    >
                                                        {PRINT_TEMPLATES.map(t => (
                                                            <option key={t.id} value={t.id}>{t.title}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Interactive Placeholders Injection Box */}
                                                <div className="bg-slate-550/5 border p-3 rounded-2xl space-y-2">
                                                    <span className="text-[9px] font-black text-indigo-700 block bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md inline-block">تلقيم المتغيرات المساعد (انقر للحقن)</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {[
                                                            { token: '{employee_name}', label: 'اسم المتهم' },
                                                            { token: '{employee_id}', label: 'الرقم الوظيفي' },
                                                            { token: '{job_title}', label: 'المسمى الوظيفي' },
                                                            { token: '{department}', label: 'التفريع/القسم' },
                                                            { token: '{case_number}', label: 'رقم التحقيق' },
                                                            { token: '{start_date}', label: 'تاريخ البدء' },
                                                            { token: '{investigator}', label: 'اسم المحقق' },
                                                            { token: '{proposed_penalty}', label: 'التوصية بالعقوبة' }
                                                        ].map(v => (
                                                            <button
                                                                key={v.token}
                                                                type="button"
                                                                onClick={() => handleInjectToken(v.token)}
                                                                className="text-[9px] font-extrabold bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 p-1 px-1.5 rounded-lg shadow-sm font-mono hover:ring-1 hover:ring-indigo-600 transition-all"
                                                            >
                                                                {v.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Raw textarea editor */}
                                                <div className="space-y-1 text-xs font-black">
                                                    <label className="text-slate-500 font-bold block">نص قالب المسودة المحررة:</label>
                                                    <textarea 
                                                        className="w-full font-mono text-xs font-bold border rounded-xl p-4 bg-slate-50 focus:bg-white focus:outline-none leading-relaxed font-semibold h-[340px]"
                                                        value={editorText}
                                                        onChange={(e) => setEditorText(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t">
                                                    <Button 
                                                        variant="primary" 
                                                        className="bg-indigo-600 text-xs font-black rounded-xl"
                                                        onClick={handleSaveTemplateText}
                                                    >
                                                        حفظ التغييرات بالمسودة
                                                    </Button>

                                                    <Button 
                                                        variant="outline" 
                                                        className="text-xs font-black rounded-xl"
                                                        onClick={() => {
                                                            const template = PRINT_TEMPLATES.find(t => t.id === selectedTemplateId);
                                                            if (template && window.confirm('هل تود استعادة صياغة النص الإداري الأصلي للقالب؟')) {
                                                                setEditorText(template.text(selectedCase));
                                                                const updated = cases.map(c => {
                                                                    if (c.id === activeCaseId) {
                                                                        const copy = { ...c };
                                                                        delete copy.customDocTemplateContent;
                                                                        return copy;
                                                                    }
                                                                    return c;
                                                                });
                                                                setCases(updated);
                                                                addToast({ type: 'success', title: 'استعادة القالب الرئيسي', message: 'تم إعادة تهيئة نص النموذج المختار للأصلي.' });
                                                            }
                                                        }}
                                                    >
                                                        إعادة القالب للاحق
                                                    </Button>
                                                </div>
                                            </Card>

                                            {/* Panel Right: Beautiful Adala stationery printable simulator with watermark */}
                                            <Card className="p-6 bg-slate-500/5 border rounded-3xl text-right flex flex-col justify-between">
                                                <div className="space-y-2 mb-4">
                                                    <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-lg text-[9px] inline-block shadow-sm">
                                                        المعاينة الحية والطباعة الإدارية
                                                    </span>
                                                    <h3 className="text-xs font-black text-slate-800">الأوراق الرسمية لـ الوقيان والعبدالله</h3>
                                                    <p className="text-[10px] text-slate-500 leading-normal font-sans font-bold">هذا الإطار يمثل الصورة النهائية للمستند عقب تصفية المتغيرات. أنقر "طباعة المستند" لإرسال الملف للطابعة الورقية مباشرة.</p>
                                                </div>

                                                {/* Simulated official letterhead paper */}
                                                <div 
                                                    id="printable-adala-stationery"
                                                    className="bg-white border-2 border-amber-600/30 shadow-md p-6 rounded-2xl min-h-[480px] text-right text-xs font-black leading-relaxed font-sans relative overflow-hidden flex flex-col justify-between select-none"
                                                >
                                                    {/* Central Subtle Stamp Watermark */}
                                                    <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none transform -rotate-12 select-none">
                                                        <Scale className="w-80 h-80 text-amber-900" />
                                                    </div>

                                                    {/* Printable Stationery header */}
                                                    <div className="flex justify-between items-start border-b-2 border-amber-600/20 pb-3 mb-4 select-none">
                                                        <div className="text-right space-y-0.5">
                                                            <p className="text-[11px] font-black text-slate-900">مجموعة الوقيان والعبدالله للتحقيقات</p>
                                                            <p className="text-[9px] text-slate-500">مستشاري الشؤون العمالية والامتثال القانوني</p>
                                                            <p className="text-[8px] font-mono font-bold text-slate-400">STATE OF KUWAIT • LAW FIRM</p>
                                                        </div>

                                                        {/* Brand logo mini inside letterhead */}
                                                        <div className="text-left shrink-0">
                                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-amber-600">
                                                                <Scale className="h-5 w-5 text-amber-500 animate-pulse" />
                                                            </span>
                                                            <p className="text-[7px] text-amber-600 font-mono font-bold mt-1">ADALA SUITE</p>
                                                        </div>
                                                    </div>

                                                    {/* Render resolved content matching tokens */}
                                                    <div className="flex-grow text-[11px] font-bold text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-amber-200">
                                                        {resolvedPrintText}
                                                    </div>

                                                    {/* Stamp & Footer Area inside letterhead */}
                                                    <div className="border-t border-dashed border-slate-300 pt-3 mt-6 flex justify-between items-end text-[8px] font-black text-slate-400 select-none">
                                                        <div className="text-right">
                                                            <p className="text-slate-500 text-[9px] font-black">طبع عبر: نظام لجان التحقيق الموحد لـ عدالة</p>
                                                            <p>تاريخ الاستخراج الفني للملف: {new Date().toISOString().split('T')[0]}</p>
                                                        </div>

                                                        {/* Visual stamp of general manager authorization */}
                                                        {selectedCase.approvedByGeneralManager ? (
                                                            <div className="border-2 border-dashed border-amber-600 text-amber-700 bg-amber-500/5 px-2.5 py-1.5 rounded-lg text-center transform -rotate-2 select-none">
                                                                <span className="text-[7px] block font-black text-amber-600">مجموعة الشركاء المعتمدة</span>
                                                                <span className="text-[8px] font-black block">مكتب الوقيان والعبدالله</span>
                                                                <span className="text-[6px] tracking-wider font-mono block">SER. REGIST 965-01</span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[8px] font-bold text-slate-350 italic">بانتظار مصادقة المدير العام للتوقيع...</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    className="w-full mt-4 h-11 bg-slate-900 border-none text-white text-xs font-black shadow flex items-center justify-center gap-1.5"
                                                    onClick={() => window.print()}
                                                >
                                                    <Printer className="w-4 h-4 text-amber-400" />
                                                    طباعة المستند الإداري المختار ورنياً
                                                </Button>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ----------------------------------------------------
                CREATE NEW INVESTIGATION CASE DIALOG MODAL
            ---------------------------------------------------- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm" style={{ direction: 'rtl' }}>
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border text-right">
                        
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                <PlusCircle className="w-5 h-5 text-indigo-700" />
                                فتح لجنة تحقيق إداري وبلاغ رسمي
                            </h3>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-xs text-slate-400 hover:text-slate-650 font-black p-1 px-2 hover:bg-slate-50 border rounded-lg"
                            >
                                إغلاق
                            </button>
                        </div>

                        <form onSubmit={handleCreateCase} className="space-y-4 text-xs font-black">
                            
                            {/* Choose employee to pursue */}
                            <div className="space-y-1">
                                <label className="text-slate-500 font-bold">1. اختر الموظف المشكو بحقه (المتهم):</label>
                                <select 
                                    className="w-full text-xs font-bold border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                    value={newEmployeeId}
                                    onChange={(e) => setNewEmployeeId(e.target.value)}
                                >
                                    <option value="">-- انقر لاختيار موظف من القوائم الجارية --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.fullNameAr || emp.fullName} | {emp.jobTitle} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Choose violation category */}
                            <div className="space-y-1">
                                <label className="text-slate-500 font-bold">2. تصنيف المخالفة الرئيسي بالملف المعني:</label>
                                <select 
                                    className="w-full text-xs font-black border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                >
                                    <option value="الإهمال الوظيفي والتقصير">الإهمال الوظيفي والتقصير</option>
                                    <option value="المخالفات المالية وعجز الخزينة">المخالفات المالية وعجز الخزينة</option>
                                    <option value="إفشاء المعلومات والسرية المهنية">إفشاء المعلومات والسرية المهنية</option>
                                    <option value="الغياب التام والامتناع">الغياب التام والامتناع</option>
                                    <option value="التأخير والإنصراف">التأخير والإنصراف</option>
                                    <option value="إساءة استخدام السلطة والصلاحيات">إساءة استخدام السلطة والصلاحيات</option>
                                    <option value="المخالفات السلوكية والتعدي اللفظي">المخالفات السلوكية والتعدي اللفظي</option>
                                    <option value="مخالفات أمن ونظم المعلومات">مخالفات أمن ونظم المعلومات</option>
                                </select>
                            </div>

                            {/* Detail text of subject */}
                            <div className="space-y-1">
                                <label className="text-slate-500 font-bold">3. تفصيل تكييف موضوع الواقعة والاتهامات الموجهة خطياً:</label>
                                <textarea 
                                    className="w-full text-xs font-bold border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                    placeholder="يرجى كتابة أفعال الإهمال أو التقصير والمسلك بالتفصيل من واقع مذكرة الامتثال..."
                                    rows={3}
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                />
                            </div>

                            {/* Complainant details */}
                            <div className="grid grid-cols-2 gap-3 text-xs font-black">
                                <div className="space-y-1">
                                    <label className="text-slate-550 font-bold">مقدّم البلاغ أو القسم الشاكي:</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                        placeholder="مثال: م. وليد العتيبي..."
                                        value={newComplainant}
                                        onChange={(e) => setNewComplainant(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-slate-550 font-bold">صفته ومسماه الوظيفي:</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                        placeholder="مثال: رئيس قطاع تتبع الجودة..."
                                        value={newComplainantTitle}
                                        onChange={(e) => setNewComplainantTitle(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Assigned investigator */}
                            <div className="space-y-1">
                                <label className="text-slate-500 font-bold">4. تعيين الباحث القانوني والمحقق المكلف بالمباشرة:</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                                    value={newInvestigator}
                                    onChange={(e) => setNewInvestigator(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2.5 pt-4 border-t">
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="w-full bg-indigo-650 h-11 text-xs font-black rounded-xl"
                                >
                                    فتح وبدء قيد التحقيق العمالي
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-40 h-11 text-xs font-black rounded-xl"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    إلغاء الأمر
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestigationsPage;
