import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    Users, Plus, Trash2, CheckCircle2, AlertTriangle, BookOpen, 
    FileText, UserCheck, Scale, Sparkles, HelpCircle, PenTool, RefreshCw, Type, Check, Mic 
} from 'lucide-react';
import { 
    InvestigationSession, 
    InvestigationSessionQuestion, 
    InvestigationWitness, 
    InvestigationEvidence,
    CaseStatus
} from './types';
import { VoiceDictationStudio } from './VoiceDictationStudio';
import { VoiceDictationButton } from '../../components/VoiceDictation/VoiceDictationButton';

interface SessionsTabProps {
    selectedCase: any;
    cases: any[];
    setCases: (cases: any[]) => void;
    library: Record<string, string[]>;
    addToast: (toast: { type: string; title: string; message: string }) => void;
}

// Reusable Signature Pad Canvas Component
const CanvasSignaturePad: React.FC<{
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    onDrawEnd: (hasDrawn: boolean) => void;
    placeholder: string;
    clearTrigger: number;
}> = ({ canvasRef, onDrawEnd, placeholder, clearTrigger }) => {
    const isDrawingRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Match drawing dimensions to the visual display size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 350;
        canvas.height = rect.height || 120;
        
        ctx.strokeStyle = '#0f172a'; // slate-900
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Clear canvas on clearTrigger
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDrawEnd(false);
    }, [canvasRef, clearTrigger]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        isDrawingRef.current = true;
        ctx.beginPath();
        
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (e.cancelable) e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            onDrawEnd(true);
        }
    };

    return (
        <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-inner">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[120px] block cursor-crosshair touch-none"
            />
            <div className="absolute top-2 right-2 pointer-events-none text-[9px] font-black text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-150 dark:border-slate-800 shadow-3xs">
                {placeholder}
            </div>
        </div>
    );
};

export const SessionsTab: React.FC<SessionsTabProps> = ({
    selectedCase,
    cases,
    setCases,
    library,
    addToast
}) => {
    // Session Drafting States
    const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [sessionPartyName, setSessionPartyName] = useState('');
    const [sessionPartyType, setSessionPartyType] = useState<'employee' | 'witness'>('employee');
    const [isOathTaken, setIsOathTaken] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');
    
    // Electronic Signature States
    const [invSigMode, setInvSigMode] = useState<'draw' | 'type'>('draw');
    const [partySigMode, setPartySigMode] = useState<'draw' | 'type'>('draw');
    
    const [invSigText, setInvSigText] = useState('');
    const [partySigText, setPartySigText] = useState('');
    
    const [invSigFont, setInvSigFont] = useState('font-serif italic text-lg');
    const [partySigFont, setPartySigFont] = useState('font-serif italic text-lg');

    const investigatorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const partyCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const [invSigDrawn, setInvSigDrawn] = useState(false);
    const [partySigDrawn, setPartySigDrawn] = useState(false);

    // Incremental values for resetting canvas pads
    const [invClearCount, setInvClearCount] = useState(0);
    const [partyClearCount, setPartyClearCount] = useState(0);

    useEffect(() => {
        if (selectedCase) {
            setInvSigText(selectedCase.investigator || 'أ. صبري صبري');
            setPartySigText(sessionPartyName || selectedCase.employeeName || 'الموظف المشكو بحقه');
        }
    }, [selectedCase, sessionPartyName]);

    // AI Question Generator States
    const [aiIncidentType, setAiIncidentType] = useState<string>('إهمال وتقصير في العمل والمسؤوليات');
    const [aiAdditionalDetails, setAiAdditionalDetails] = useState<string>('');
    const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<string[]>([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

    const handleGenerateAIQuestions = async () => {
        setIsGeneratingQuestions(true);
        try {
            const response = await fetch('/api/gemini/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    incidentType: aiIncidentType,
                    additionalDetails: aiAdditionalDetails
                })
            });
            const data = await response.json();
            if (data && data.questions) {
                setAiGeneratedQuestions(data.questions);
                addToast({
                    type: 'success',
                    title: 'توليد الأسئلة بالذكاء الاصطناعي',
                    message: `تم توليد ${data.questions.length} أسئلة استقصائية ذكية بنجاح بناءً على واقعة (${aiIncidentType}).`
                });
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Error generating AI questions:', error);
            addToast({
                type: 'error',
                title: 'فشل التوليد الذكي',
                message: 'حدث خطأ أثناء محاولة توليد الأسئلة الاستقصائية بالذكاء الاصطناعي.'
            });
        } finally {
            setIsGeneratingQuestions(false);
        }
    };
    
    // Custom Question/Answer states
    const [customQuestionInput, setCustomQuestionInput] = useState('');
    const [customAnswerInput, setCustomAnswerInput] = useState('');
    const [activeSessionQuestions, setActiveSessionQuestions] = useState<InvestigationSessionQuestion[]>([]);

    // Witness Form States
    const [witnessName, setWitnessName] = useState('');
    const [witnessPhone, setWitnessPhone] = useState('');
    const [witnessStatus, setWitnessStatus] = useState<'summoned' | 'attended' | 'absent'>('summoned');
    const [witnessStatement, setWitnessStatement] = useState('');

    // Evidence Form States
    const [evidenceName, setEvidenceName] = useState('');
    const [evidenceType, setEvidenceType] = useState('مستند ورقي رقمي');
    const [evidenceNotes, setEvidenceNotes] = useState('');

    // Scribing Add Question To Draft
    const handleAddQuestionToDraft = () => {
        if (!customQuestionInput.trim()) return;
        const newQ: InvestigationSessionQuestion = {
            id: `q-num-${Date.now()}-${Math.random()}`,
            question: customQuestionInput.trim(),
            answer: customAnswerInput.trim() || 'بانتظار تدوين ودفاع المشكو بحقه...'
        };
        setActiveSessionQuestions([...activeSessionQuestions, newQ]);
        setCustomQuestionInput('');
        setCustomAnswerInput('');
    };

    const handleInjectLibraryQuestion = (qText: string) => {
        setCustomQuestionInput(qText);
        addToast({ type: 'success', title: 'تلقيم السؤال', message: 'تم سحب صياغة الاستجواب وتثبيتها بالمحرر للتعديل.' });
    };

    const handleLoadPredefinedTemplate = (type: 'hearing' | 'confrontation' | 'unpacking') => {
        if (!selectedCase) return;

        const employeeName = selectedCase.employeeName || 'الموظف المشكو بحقه';
        const employeeJobTitle = selectedCase.employeeJobTitle || 'الموظف';
        const employeeDepartment = selectedCase.employeeDepartment || 'إدارة الشركة';
        const complainantName = selectedCase.complainantName || 'إدارة الرصد والامتثال الداخلي';
        const complainantTitle = selectedCase.complainantTitle || 'رئيس التدقيق والجودة الإدارية';
        const caseNumber = selectedCase.caseNumber || 'QA-INV-2026-xxx';
        const subject = selectedCase.subject || 'واقعة التقصير المنسوبة';
        const investigator = selectedCase.investigator || 'أ. صبري صبري (رئيس قطاع الامتثال والقوانين)';

        setSessionPartyName(employeeName);
        setSessionPartyType('employee');
        setIsOathTaken(false);

        let notes = '';
        let questions: InvestigationSessionQuestion[] = [];

        if (type === 'hearing') {
            notes = `تم استدعاء الموظف المشكو بحقه (${employeeName}) وسماع إفادته ودفاعه بخصوص الشكوى المقدمة ضده من (${complainantName}).`;
            questions = [
                {
                    id: `q-tpl-${Date.now()}-1`,
                    question: `ما اسمك ووظيفتك الحاليّة في الشركة وهل يربطك أي خلاف مهني أو شخصي بخصوص هذا التحقيق؟`,
                    answer: `اسمي ${employeeName}، وأعمل في وظيفة ${employeeJobTitle} بـ ${employeeDepartment}، ولا توجد خلافات تمنعني من الإفادة بصحة الوقائع ونفي التقصير المنسوب.`
                },
                {
                    id: `q-tpl-${Date.now()}-2`,
                    question: `ما ردك وتفنيدك وتوضيحك للشكوى المقدمة من ${complainantName} (${complainantTitle}) بشأن واقعة "${subject}"؟`,
                    answer: `إن هذه واقعة لها أبعاد إدارية تشغيلية في القسم، وقمت بجهود مخلصة لتفادي أي تقصير، ولم يكن هناك أي تهاون أو إخلال مقصود بالالتزامات من جانبي.`
                },
                {
                    id: `q-tpl-${Date.now()}-3`,
                    question: `هل لديك أي وثائق، إثباتات أو شهود تود إرفاقها لبيان موقفك وتأكيد التزامك بضوابط الشركة؟`,
                    answer: `نعم، سأقوم بتقديم كشوف وسجلات البريد المهني التي توضح التعليمات الواردة وصعوبة التنفيذ الفني بظروف العمل لتضمينها بملف التحقيق رقم ${caseNumber}.`
                },
                {
                    id: `q-tpl-${Date.now()}-4`,
                    question: `هل تود إضافة أية أقوال أخرى لدفاعك أو تطلب أي إجراء من لجان التحقيق الإدارية؟`,
                    answer: `أكتفي بما أدليت به من أقوال، وأطلب بكل احترام مراجعة سجلي الوظيفي والمهني الممتاز وحفظ التحقيق لعدم القصد.`
                }
            ];
            addToast({
                type: 'success',
                title: 'تم تحميل قالب سماع الأقوال',
                message: `تم تلقيم المحضر وتعبئة بيانات القضية رقم ${caseNumber} والموظف ${employeeName} تلقائياً.`
            });
        } else if (type === 'confrontation') {
            notes = `مواجهة الموظف المشكو بحقه (${employeeName}) بالشهادات والقرائن المادية المسجلة بملف التحقيق الإداري رقم ${caseNumber}.`;
            questions = [
                {
                    id: `q-tpl-${Date.now()}-1`,
                    question: `نواجهك بالواقعة المنسوبة إليك في ملف ${caseNumber} وهي "${subject}" المدعومة بتقرير ${complainantName}، فما قولك؟`,
                    answer: `أقر بوجود التباس إداري في التنفيذ ولكنني أرفض وصفه بالإهمال أو المخالفة المسلكية؛ حيث قمت باتخاذ تدابير استثنائية لمصلحة سير العمل المباشر.`
                },
                {
                    id: `q-tpl-${Date.now()}-2`,
                    question: `نواجهك بشهادات الشهود والتقارير التي تفيد بوقوع تجاوز للتعليمات المباشرة والتأخر في معالجة الملفات، فما مبررك لذلك؟`,
                    answer: `إن التأخر ناتج كلياً عن أسباب تقنية وخارجة عن إرادتي في قسم ${employeeDepartment}، وتجاوز التعليمات كان بالتنسيق الشفهي المؤقت مع المشرفين لحين استقرار النظام.`
                },
                {
                    id: `q-tpl-${Date.now()}-3`,
                    question: `ما قولك فيما ثبت لجان التحقيق من عدم اتخاذك الضمانات التشغيلية اللازمة لمنع حدوث التجاوزات المذكورة؟`,
                    answer: `لقد اجتهدت في ضوء الموارد المتاحة، وسجل أدائي الوظيفي يشهد بحرصي الدائم، ولا أتحمل بمفردي العواقب الناتجة عن تداخل الصلاحيات.`
                },
                {
                    id: `q-tpl-${Date.now()}-4`,
                    question: `هل لديك شهود أو مستندات تدفع بها ما تم مواجهتك به الآن؟`,
                    answer: `نعم، أطلب سماع أقوال المشرف الفني بالقسم، كما أطلب استخراج سجل الدخول التقني للنظام لإثبات تاريخ وساعة تقديم الطلبات والامتثال التام.`
                }
            ];
            addToast({
                type: 'success',
                title: 'تم تحميل قالب المواجهة',
                message: `تم تلقيم محضر المواجهة والاستجواب لبيان الحقيقة للموظف ${employeeName}.`
            });
        } else if (type === 'unpacking') {
            notes = `تفريغ محتويات الأحراز والقرائن ومواجهة الموظف المشكو بحقه (${employeeName}) بمحضر الواقعة رقم ${caseNumber}.`;
            questions = [
                {
                    id: `q-tpl-${Date.now()}-1`,
                    question: `نقوم الآن أمامك بتفريغ الحرز المادي (المستند الفني / المراسلات / تقارير الرصد الإلكترونية) بملف القضية رقم ${caseNumber}، فما مبررك لمحتوى هذه القرائن الموجهة ضدك؟`,
                    answer: `هذه المراسلات والتقارير تمت بمرونة تامة لضمان استمرار تقديم الخدمة، وكانت جزءاً من حلول سريعة مؤقتة تقتضيها حاجة العمل الملحة في قسم ${employeeDepartment}.`
                },
                {
                    id: `q-tpl-${Date.now()}-2`,
                    question: `يظهر من فحص السجلات الفنية وجود تباين واضح في التواريخ والبيانات المالية أو الإدارية المدونة بمعرفتك، فما سبب ذلك؟`,
                    answer: `التباين يعود إلى فارق التوقيت في تحديث قاعدة البيانات المركزية للشركة، وليس تعديلاً يدوياً مقصوداً من جانبي، وسأثبت ذلك ببيان تفصيلي من إدارة الدعم الفني.`
                },
                {
                    id: `q-tpl-${Date.now()}-3`,
                    question: `هل توافق على صحة ما تم استخلاصه وتفريغه إلكترونياً من ملفات والمنسوب لواقعة الشكوى: "${subject}"؟`,
                    answer: `أوافق على صحة المستند كوثيقة رسمية، ولكنني أختلف تماماً مع التفسير القانوني الموجه ضدي، حيث لم تقع أي أضرار مادية أو معنوية بالشركة نتيجة لذلك.`
                },
                {
                    id: `q-tpl-${Date.now()}-4`,
                    question: `هل ترغب في تدوين أي تحفظ أو مبرر تطلب من المستشار المحقق (${investigator}) النظر فيه قبل اتخاذ القرار؟`,
                    answer: `نعم، أطلب استبعاد نية التعمد وإتاحة فرصة للتسوية الإدارية وتوضيح الإجراءات الفنية المتبعة لتجنب تكرار مثل هذا اللبس مستقبلاً.`
                }
            ];
            addToast({
                type: 'success',
                title: 'تم تحميل قالب التفرغ / التفريغ',
                message: `تم تلقيم محضر تفريغ الأحراز والقرائن بنجاح وتوفير بيانات الدفاع للموظف.`
            });
        }

        setSessionNotes(notes);
        setActiveSessionQuestions(questions);
    };

    // Save Scribed Session
    const handleSaveSession = () => {
        if (activeSessionQuestions.length === 0) {
            addToast({ type: 'warning', title: 'جلسة فارغة', message: 'يرجى إضافة سؤال تحقيق واحد على الأقل قبل تسجيل وحفظ الجلسة.' });
            return;
        }

        const party = sessionPartyName.trim() || selectedCase.employeeName;
        
        // Extract signatures: canvas png base64 or stylized cursive text
        const investigatorSignatureData = invSigMode === 'draw' && invSigDrawn
            ? investigatorCanvasRef.current?.toDataURL('image/png')
            : `TEXT:${invSigText || selectedCase.investigator || 'أ. صبري صبري'}:${invSigFont}`;

        const partySignatureData = partySigMode === 'draw' && partySigDrawn
            ? partyCanvasRef.current?.toDataURL('image/png')
            : `TEXT:${partySigText || party}:${partySigFont}`;

        const sObj: InvestigationSession = {
            id: `sess-${Date.now()}`,
            sessionDate,
            partyName: party,
            partyType: sessionPartyType,
            questions: activeSessionQuestions,
            isOathTaken: sessionPartyType === 'witness' ? isOathTaken : false,
            notes: sessionNotes.trim() || 'أقر الأطراف بصحة التدوين من خلال استبيان ومحاور لجان التحقيق.',
            digitalSignature: `مصادق وموقع إلكترونياً بقلم: ${party}`,
            investigatorName: selectedCase.investigator || 'أ. صبري صبري',
            investigatorSignatureData,
            partySignatureData
        };

        const updated = cases.map(c => {
            if (c.id === selectedCase.id) {
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
        setInvSigDrawn(false);
        setPartySigDrawn(false);
        setInvClearCount(c => c + 1);
        setPartyClearCount(c => c + 1);
        addToast({ type: 'success', title: 'سجل محضر السماع بالتوقيع الرقمي', message: 'تم تدوين وحفظ محضر الجلسة وتوثيق التوقيعات الإلكترونية للأطراف بنجاح.' });
    };

    // Witnesses Handlers
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
            if (c.id === selectedCase.id) {
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
        addToast({ type: 'success', title: 'تم تثبيت الشاهد', message: 'تم استدعاء وتقييد الشاهد في أوراق الملف بنجاح.' });
    };

    const handleDeleteWitness = (witId: string) => {
        const updated = cases.map(c => {
            if (c.id === selectedCase.id) {
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

    // Evidence Handlers
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
            if (c.id === selectedCase.id) {
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
        addToast({ type: 'success', title: 'تسجيل حرز فني', message: 'تم حيازة وتدوين الدليل المادي في فهارس التحقيق.' });
    };

    const handleDeleteEvidence = (evId: string) => {
        const updated = cases.map(c => {
            if (c.id === selectedCase.id) {
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

    return (
        <div className="space-y-6 animate-fade-in text-right" style={{ direction: 'rtl' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Right Column: Scribe New Hearing Session (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100/80 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-slate-50 text-slate-750">
                                    <Users className="w-4 h-4 text-slate-600" />
                                </span>
                                <h3 className="text-xs font-extrabold text-slate-900">تدوين وصياغة محضر سماع أقوال جديد</h3>
                            </div>
                            <span className="text-[9px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">لجنة التحقيق الإدارية</span>
                        </div>

                        {/* Live Speech-to-Text Dictation Studio for Investigation Sessions */}
                        <VoiceDictationStudio 
                            activePartyName={sessionPartyName || selectedCase?.employeeName || 'الموظف / الشاهد'}
                            onInjectQuestion={(qText) => setCustomQuestionInput(qText)}
                            onInjectAnswer={(aText) => setCustomAnswerInput(aText)}
                            onInjectDirectQA={(qText, aText) => {
                                const newQ: InvestigationSessionQuestion = {
                                    id: `q-voice-${Date.now()}-${Math.random()}`,
                                    question: qText,
                                    answer: aText
                                };
                                setActiveSessionQuestions([...activeSessionQuestions, newQ]);
                            }}
                            onInjectWitnessStatement={(wText) => setWitnessStatement(wText)}
                            onInjectNotes={(nText) => setSessionNotes(nText)}
                        />

                        {/* Load Minutes Templates / تحميل قوالب المحاضر */}
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/60 space-y-3 text-right">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">تحميل قوالب المحاضر الجاهزة (تلقيم تلقائي):</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">تعبئة البيانات الأساسية تلقائياً</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => handleLoadPredefinedTemplate('hearing')}
                                    className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-450 dark:hover:border-slate-700 rounded-xl text-[10.5px] font-black text-slate-850 dark:text-slate-200 text-center transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-slate-950 dark:text-white font-extrabold">قالب سماع أقوال</span>
                                    <span className="text-[8.5px] font-semibold text-slate-400">تحقيق واستماع دفاع</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleLoadPredefinedTemplate('confrontation')}
                                    className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-450 dark:hover:border-slate-700 rounded-xl text-[10.5px] font-black text-slate-850 dark:text-slate-200 text-center transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-slate-950 dark:text-white font-extrabold">قالب مواجهة</span>
                                    <span className="text-[8.5px] font-semibold text-slate-400">مواجهة بالشهادات والأدلة</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleLoadPredefinedTemplate('unpacking')}
                                    className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-450 dark:hover:border-slate-700 rounded-xl text-[10.5px] font-black text-slate-850 dark:text-slate-200 text-center transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-slate-950 dark:text-white font-extrabold">قالب تفرغ / تفريغ</span>
                                    <span className="text-[8.5px] font-semibold text-slate-400">تفريغ وفحص أحراز القضية</span>
                                </button>
                            </div>
                        </div>

                        {/* AI Investigative Question Generator / توليد الأسئلة الاستقصائية بالذكاء الاصطناعي */}
                        <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/40 dark:from-teal-950/20 dark:to-emerald-950/10 p-5 rounded-2xl border border-teal-150 dark:border-teal-900/40 space-y-4 text-right">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-teal-650 dark:text-teal-400 animate-pulse" />
                                    <span className="text-xs font-black text-teal-950 dark:text-teal-300">مساعد التحقيق والذكاء الاصطناعي لتوليد الأسئلة:</span>
                                </div>
                                <span className="text-[8.5px] font-black bg-teal-100 dark:bg-teal-900/50 text-teal-850 dark:text-teal-300 px-2 py-0.5 rounded-full">تعزيز الدقة القانونية (المادة 115)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-black text-slate-500 block">نوع الواقعة موضوع التحقيق:</span>
                                    <select
                                        className="w-full border border-teal-200 dark:border-teal-800 rounded-xl p-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:border-teal-500 font-bold text-xs"
                                        value={aiIncidentType}
                                        onChange={(e) => setAiIncidentType(e.target.value)}
                                    >
                                        <option value="إهمال وتقصير في العمل والمسؤوليات">إهمال وتقصير في العمل والمسؤوليات</option>
                                        <option value="غياب وانقطاع عن العمل دون إذن">غياب وانقطاع عن العمل دون إذن</option>
                                        <option value="سرقة واختلاس ممتلكات أو عهد">سرقة واختلاس ممتلكات أو عهد</option>
                                        <option value="مخالفة مسلكية أو سلوك غير لائق">مخالفة مسلكية أو سلوك غير لائق</option>
                                        <option value="إفشاء أسرار العمل والمنشأة">إفشاء أسرار العمل والمنشأة</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-black text-slate-500 block">تفاصيل أو قرائن إضافية (اختياري لزيادة الدقة):</span>
                                    <input
                                        type="text"
                                        className="w-full border border-teal-200 dark:border-teal-800 rounded-xl p-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:border-teal-500 font-bold text-xs"
                                        placeholder="مثال: غياب 5 أيام دون عذر، أو تأخر تسليم التقرير المالي..."
                                        value={aiAdditionalDetails}
                                        onChange={(e) => setAiAdditionalDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleGenerateAIQuestions}
                                    disabled={isGeneratingQuestions}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 border-none"
                                >
                                    {isGeneratingQuestions ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                                            جاري توليد الأسئلة الاستقصائية...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                                            توليد الأسئلة الاستقصائية بالذكاء الاصطناعي ✨
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Generated AI Questions Output */}
                            {aiGeneratedQuestions.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-teal-200/40 dark:border-teal-900/20">
                                    <span className="text-[10px] font-black text-teal-900 dark:text-teal-400 block">الأسئلة الاستقصائية المقترحة من النظام الذكي:</span>
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {aiGeneratedQuestions.map((qText, index) => (
                                            <div key={index} className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-teal-100 dark:border-teal-950 text-xs space-y-2 hover:shadow-2xs transition-all text-right">
                                                <p className="m-0 font-extrabold text-slate-800 dark:text-slate-200 leading-relaxed text-right" style={{ direction: 'rtl' }}>
                                                    {index + 1}. {qText}
                                                </p>
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleInjectLibraryQuestion(qText)}
                                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold text-[9px] rounded-lg transition-all border-none cursor-pointer"
                                                    >
                                                        تلقيم بالمحرر
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newQ: InvestigationSessionQuestion = {
                                                                id: `q-ai-${Date.now()}-${index}-${Math.random()}`,
                                                                question: qText,
                                                                answer: 'بانتظار تدوين ودفاع المشكو بحقه...'
                                                            };
                                                            setActiveSessionQuestions([...activeSessionQuestions, newQ]);
                                                            addToast({
                                                                type: 'success',
                                                                title: 'إضافة فورية',
                                                                message: 'تم إضافة السؤال الاستقصائي لمسودة المحضر مباشرة.'
                                                            });
                                                        }}
                                                        className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[9px] rounded-lg transition-all border-none cursor-pointer"
                                                    >
                                                        إضافة فورية للجلسة ✓
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scribe Identity & Settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-black text-slate-500 block">تاريخ وعقد الجلسة الجارية:</span>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-bold transition-all shadow-xs"
                                    value={sessionDate}
                                    onChange={(e) => setSessionDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[11px] font-black text-slate-500 block">اسم الطرف المستمع لإفادته:</span>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-bold transition-all shadow-xs"
                                    placeholder={selectedCase.employeeName}
                                    value={sessionPartyName}
                                    onChange={(e) => setSessionPartyName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[11px] font-black text-slate-500 block">صفة المستدعى للإفادة عمالياً:</span>
                                <select 
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-bold transition-all shadow-xs text-xs"
                                    value={sessionPartyType}
                                    onChange={(e) => setSessionPartyType(e.target.value as any)}
                                >
                                    <option value="employee">الموظف المشكو بحقه (المتهم)</option>
                                    <option value="witness">شاهد إثبات / نفي</option>
                                </select>
                            </div>

                            {sessionPartyType === 'witness' && (
                                <div className="space-y-1.5 flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-400"
                                            checked={isOathTaken}
                                            onChange={(e) => setIsOathTaken(e.target.checked)}
                                        />
                                        <span className="text-[10px] text-amber-900 font-extrabold bg-amber-500/10 border border-amber-250/50 px-2.5 py-1.5 rounded-lg">
                                            ✓ حلف اليمين القانونية قبل الإفادة (المادة 115)
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Scribing Interrogator Question and Answer fields */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4 shadow-xs">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500 block">أداة تلقيم الأسئلة المباشرة والتدوين:</span>
                                
                                {/* Quick Category Question Selector */}
                                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                    <span className="text-[9px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                                        قوالب أسئلة استجواب:
                                    </span>
                                    <select
                                        className="text-[10.5px] font-bold border border-slate-250 bg-white rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-slate-450 shadow-3xs cursor-pointer max-w-[210px] truncate"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleInjectLibraryQuestion(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>اختر سؤالاً للإدراج المباشر...</option>
                                        {Object.entries(library).map(([cat, questions]) => (
                                            <optgroup key={cat} label={`📂 ${cat}`}>
                                                {questions.map((q, idx) => (
                                                    <option key={idx} value={q}>
                                                        {q}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-3 font-bold text-xs">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 text-[11px] font-black block">س: استجواب المحقق المستشار:</span>
                                        <VoiceDictationButton 
                                            value={customQuestionInput}
                                            onTranscript={(t) => setCustomQuestionInput(t)}
                                            placeholderTitle="تسجيل السؤال صوتياً"
                                            size="sm"
                                        />
                                    </div>
                                    <input 
                                        type="text"
                                        className="w-full border border-slate-250 rounded-xl p-3 bg-white focus:outline-none focus:border-slate-400 transition-all font-bold"
                                        placeholder="اكتب السؤال الجاري أو تحدث بالميكروفون أو اختر صياغة جاهزة..."
                                        value={customQuestionInput}
                                        onChange={(e) => setCustomQuestionInput(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 text-[11px] font-black block">ج: إفادة ودفاع الطرف المتكلم:</span>
                                        <VoiceDictationButton 
                                            value={customAnswerInput}
                                            onTranscript={(t) => setCustomAnswerInput(t)}
                                            placeholderTitle="تسجيل الإفادة والرد صوتياً"
                                            size="sm"
                                        />
                                    </div>
                                    <textarea 
                                        rows={3}
                                        className="w-full border border-slate-250 rounded-xl p-3 bg-white focus:outline-none focus:border-slate-400 transition-all font-bold"
                                        placeholder="اكتب رد وإقرار الموظف أو الشاهد حرفياً، أو انقر أيقونة الميكروفون بالأعلى للتدوين الصوتي التلقائي المباشر..."
                                        value={customAnswerInput}
                                        onChange={(e) => setCustomAnswerInput(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end pt-1">
                                    <Button
                                        variant="outline"
                                        onClick={handleAddQuestionToDraft}
                                        className="text-[10px] font-black hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-1 border-slate-300"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        إضافة السؤال والإجابة إلى مسودة المحضر
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active drafted questions preview */}
                        {activeSessionQuestions.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black text-slate-500 block">محتوى الجلسة الجاري صياغتها ({activeSessionQuestions.length} أسئلة):</span>
                                <div className="space-y-2.5 border-r-2 border-slate-400 pr-3.5 text-right">
                                    {activeSessionQuestions.map((q, qIdx) => (
                                        <div key={q.id} className="text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-1 shadow-xs">
                                            <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                                                <span>السؤال رقم {qIdx + 1}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setActiveSessionQuestions(activeSessionQuestions.filter(x => x.id !== q.id))}
                                                    className="text-rose-600 hover:text-rose-800 font-black cursor-pointer"
                                                >
                                                    إلغاء السؤال
                                                </button>
                                            </div>
                                            <p className="text-slate-900 font-black">س: {q.question}</p>
                                            <p className="text-slate-600 font-bold">ج: {q.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Extra Session Notes */}
                        <div className="space-y-1.5 font-bold text-xs text-right">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black text-slate-500 block">ملاحظات ومرئيات المحقق حول سلوك المستجوب خلال الجلسة:</span>
                                <VoiceDictationButton 
                                    value={sessionNotes}
                                    onTranscript={(t) => setSessionNotes(t)}
                                    placeholderTitle="تسجيل ملاحظات المحقق صوتياً"
                                    size="sm"
                                />
                            </div>
                            <input 
                                type="text"
                                className="w-full border border-slate-200 rounded-xl p-3.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-all font-bold shadow-xs"
                                placeholder="مثال: يظهر عليه الارتباك / متمسك بالدفاع القانوني ورفض المنسوب إليه..."
                                value={sessionNotes}
                                onChange={(e) => setSessionNotes(e.target.value)}
                            />
                        </div>

                        {/* Electronic Signatures Section */}
                        <div className="border-t border-slate-150 pt-5 space-y-4 text-right">
                            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <PenTool className="w-4 h-4 text-slate-900" />
                                <h4 className="text-xs font-black text-slate-900">منظومة التوقيع الرقمي الموثق للأطراف</h4>
                                <span className="text-[9px] font-bold text-slate-400 mr-auto">المادة 115 و 116 من قانون العمل الكويتي</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Investigator Signature (المحقق) */}
                                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-3xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-slate-900">توقيع السيد المحقق المستشار:</span>
                                        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setInvSigMode('draw')}
                                                className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${invSigMode === 'draw' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                رسم رقمي
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInvSigMode('type')}
                                                className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${invSigMode === 'type' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                خط يدوي جاهز
                                            </button>
                                        </div>
                                    </div>

                                    {invSigMode === 'draw' ? (
                                        <div className="space-y-2">
                                            <CanvasSignaturePad
                                                canvasRef={investigatorCanvasRef}
                                                onDrawEnd={(hasDrawn) => setInvSigDrawn(hasDrawn)}
                                                placeholder="ارسم توقيعك هنا باستخدام الفأرة أو اللمس"
                                                clearTrigger={invClearCount}
                                            />
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className={invSigDrawn ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-slate-400 font-bold'}>
                                                    {invSigDrawn ? '✓ تم تسجيل رسم التوقيع' : 'بانتظار رسم التوقيع...'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => { setInvClearCount(c => c + 1); setInvSigDrawn(false); }}
                                                    className="text-rose-600 hover:text-rose-800 font-black flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                                                >
                                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> مسح
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5 text-xs font-bold">
                                            <input
                                                type="text"
                                                className="w-full border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-450 font-bold shadow-3xs text-xs"
                                                placeholder="اسم المحقق للتوقيع..."
                                                value={invSigText}
                                                onChange={(e) => setInvSigText(e.target.value)}
                                            />
                                            <div className="grid grid-cols-3 gap-1">
                                                {[
                                                    { id: 'font-serif italic text-lg', name: 'خط كلاسيكي' },
                                                    { id: 'font-mono tracking-widest text-[11px] font-bold uppercase', name: 'خط معاصر' },
                                                    { id: 'font-sans font-black tracking-tighter text-sm italic', name: 'خط مائل حاد' }
                                                ].map(f => (
                                                    <button
                                                        key={f.id}
                                                        type="button"
                                                        onClick={() => setInvSigFont(f.id)}
                                                        className={`p-1.5 border text-[9px] font-black rounded-lg cursor-pointer text-center ${invSigFont === f.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                                                    >
                                                        {f.name}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center min-h-[50px] shadow-3xs overflow-hidden">
                                                <span className={`${invSigFont} text-slate-900 whitespace-nowrap`}>
                                                    {invSigText || 'التوقيع الرقمي'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Party Signature (المستجوب) */}
                                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-3xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-slate-900">توقيع الطرف المستمع إليه:</span>
                                        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setPartySigMode('draw')}
                                                className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${partySigMode === 'draw' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                رسم رقمي
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPartySigMode('type')}
                                                className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${partySigMode === 'type' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                خط يدوي جاهز
                                            </button>
                                        </div>
                                    </div>

                                    {partySigMode === 'draw' ? (
                                        <div className="space-y-2">
                                            <CanvasSignaturePad
                                                canvasRef={partyCanvasRef}
                                                onDrawEnd={(hasDrawn) => setPartySigDrawn(hasDrawn)}
                                                placeholder="ارسم التوقيع هنا باستخدام الفأرة أو اللمس"
                                                clearTrigger={partyClearCount}
                                            />
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className={partySigDrawn ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-slate-400 font-bold'}>
                                                    {partySigDrawn ? '✓ تم تسجيل رسم التوقيع' : 'بانتظار رسم التوقيع...'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => { setPartyClearCount(c => c + 1); setPartySigDrawn(false); }}
                                                    className="text-rose-600 hover:text-rose-800 font-black flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                                                >
                                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> مسح
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5 text-xs font-bold">
                                            <input
                                                type="text"
                                                className="w-full border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-455 font-bold shadow-3xs text-xs"
                                                placeholder="اسم المستجوب للتوقيع..."
                                                value={partySigText}
                                                onChange={(e) => setPartySigText(e.target.value)}
                                            />
                                            <div className="grid grid-cols-3 gap-1">
                                                {[
                                                    { id: 'font-serif italic text-lg', name: 'خط كلاسيكي' },
                                                    { id: 'font-mono tracking-widest text-[11px] font-bold uppercase', name: 'خط معاصر' },
                                                    { id: 'font-sans font-black tracking-tighter text-sm italic', name: 'خط مائل حاد' }
                                                ].map(f => (
                                                    <button
                                                        key={f.id}
                                                        type="button"
                                                        onClick={() => setPartySigFont(f.id)}
                                                        className={`p-1.5 border text-[9px] font-black rounded-lg cursor-pointer text-center ${partySigFont === f.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                                                    >
                                                        {f.name}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center min-h-[50px] shadow-3xs overflow-hidden">
                                                <span className={`${partySigFont} text-slate-900 whitespace-nowrap`}>
                                                    {partySigText || 'التوقيع الرقمي'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Session Action */}
                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <Button
                                variant="primary"
                                onClick={handleSaveSession}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-3.5 rounded-xl shadow-md cursor-pointer border-none"
                            >
                                اعتماد وحفظ محضر سماع الأقوال رسمياً والتوقيع رقمياً
                            </Button>
                        </div>
                    </Card>

                    {/* Section: Scribe Quick Template seed buttons */}
                    <Card className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4">
                        <div className="flex items-center gap-1.5 border-b border-slate-100/80 pb-2.5">
                            <span className="p-1 rounded bg-slate-50 text-slate-700">
                                <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            </span>
                            <h4 className="text-xs font-extrabold text-slate-900">حقن صياغات الاستجواب الاسترشادية الجاهزة</h4>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(library).slice(0, 3).map(([category, questions]) => (
                                <div key={category} className="space-y-1.5 text-right">
                                    <span className="text-[9px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md inline-block">
                                        {category}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {questions.slice(0, 2).map((qText, qIdx) => (
                                            <button
                                                key={qIdx}
                                                type="button"
                                                onClick={() => handleInjectLibraryQuestion(qText)}
                                                className="w-full text-right text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-3 rounded-xl transition-all block truncate cursor-pointer shadow-2xs"
                                            >
                                                {qText}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Left Column: Log, Witnesses, Evidences (5 Columns) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Log: Past Saved Sessions */}
                    <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100/80 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-900">سجل المحاضر والجلسات المعتمدة</h3>
                            <span className="text-[9.5px] font-extrabold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg shadow-3xs">
                                {selectedCase.sessions?.length || 0} محضر معتمد
                            </span>
                        </div>

                        {(!selectedCase.sessions || selectedCase.sessions.length === 0) ? (
                            <p className="text-[11px] text-slate-400 font-bold text-center py-6">لم يتم حفظ وتوثيق أي جلسة تحقيق عمالية لهذا الملف حتى الآن.</p>
                        ) : (
                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                {selectedCase.sessions.map((sess: any, idx: number) => (
                                    <div key={sess.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2 text-xs shadow-2xs">
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 border-b border-slate-200/50 pb-1.5">
                                            <span>التحقيق رقم {idx + 1} | {sess.sessionDate}</span>
                                            <span className="text-slate-800 font-black">{sess.partyType === 'employee' ? 'المشكو بحقه' : 'شاهد'}</span>
                                        </div>
                                        <p className="font-black text-slate-900">الطرف المستدعى: {sess.partyName}</p>
                                        <div className="space-y-2 border-r-2 border-slate-300 pr-2 my-1">
                                            {sess.questions.map((q: any, qIdx: number) => (
                                                <div key={q.id || qIdx} className="text-[11px] leading-relaxed space-y-0.5">
                                                    <p className="text-slate-900 font-black">س: {q.question}</p>
                                                    <p className="text-slate-500 font-bold">ج: {q.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {sess.notes && <p className="text-[10px] text-slate-450 font-black">ملاحظات المحقق: {sess.notes}</p>}
                                        
                                        {/* Render Signatures */}
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 mt-2">
                                            {/* Investigator Signature Card */}
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60 text-right space-y-1">
                                                <span className="text-[8px] text-slate-400 block font-bold">توقيع المحقق الإداري:</span>
                                                {sess.investigatorSignatureData && sess.investigatorSignatureData.startsWith('TEXT:') ? (
                                                    <div className="flex items-center justify-center min-h-[30px] border border-dashed border-slate-100 bg-slate-50 rounded-lg p-1 overflow-hidden">
                                                        <span className={`${sess.investigatorSignatureData.split(':')[2] || 'font-serif italic text-xs'} font-black text-slate-800 text-[11px] whitespace-nowrap`}>
                                                            {sess.investigatorSignatureData.split(':')[1]}
                                                        </span>
                                                    </div>
                                                ) : sess.investigatorSignatureData ? (
                                                    <div className="flex items-center justify-center min-h-[30px] border border-dashed border-slate-100 bg-slate-50 rounded-lg p-1 overflow-hidden">
                                                        <img src={sess.investigatorSignatureData} alt="توقيع المحقق" className="max-h-[24px] max-w-full object-contain" referrerPolicy="no-referrer" />
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] font-black text-slate-450 italic">موقع رقمياً</span>
                                                )}
                                                <span className="text-[8px] text-slate-500 font-black block text-center truncate">{sess.investigatorName || 'المحقق الإداري'}</span>
                                            </div>

                                            {/* Party Signature Card */}
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60 text-right space-y-1">
                                                <span className="text-[8px] text-slate-400 block font-bold">{sess.partyType === 'employee' ? 'توقيع الموظف المشكو بحقه:' : 'توقيع الشاهد المستمع:'}</span>
                                                {sess.partySignatureData && sess.partySignatureData.startsWith('TEXT:') ? (
                                                    <div className="flex items-center justify-center min-h-[30px] border border-dashed border-slate-100 bg-slate-50 rounded-lg p-1 overflow-hidden">
                                                        <span className={`${sess.partySignatureData.split(':')[2] || 'font-serif italic text-xs'} font-black text-slate-800 text-[11px] whitespace-nowrap`}>
                                                            {sess.partySignatureData.split(':')[1]}
                                                        </span>
                                                    </div>
                                                ) : sess.partySignatureData ? (
                                                    <div className="flex items-center justify-center min-h-[30px] border border-dashed border-slate-100 bg-slate-50 rounded-lg p-1 overflow-hidden">
                                                        <img src={sess.partySignatureData} alt="توقيع الطرف" className="max-h-[24px] max-w-full object-contain" referrerPolicy="no-referrer" />
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] font-black text-slate-450 italic">{sess.digitalSignature || 'موقع رقمياً'}</span>
                                                )}
                                                <span className="text-[8px] text-slate-500 font-black block text-center truncate">{sess.partyName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Scribe Witnesses summon list */}
                    <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4">
                        <div className="border-b border-slate-100/80 pb-3 flex justify-between items-center">
                            <h3 className="text-xs font-extrabold text-slate-900">سجل الشهود والاستدعاءات</h3>
                            <span className="text-[9.5px] font-extrabold bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-100 shadow-3xs">
                                {selectedCase.witnesses?.length || 0} شهود
                            </span>
                        </div>

                        {/* Add Witness Form */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-200/60 shadow-2xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-450 block font-black">اسم الشاهد كاملاً:</span>
                                    <input 
                                        type="text" 
                                        className="w-full text-xs font-bold border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-400 transition-all"
                                        placeholder="أحمد الشمري..."
                                        value={witnessName}
                                        onChange={(e) => setWitnessName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-450 block font-black">رقم الاتصال:</span>
                                    <input 
                                        type="text" 
                                        className="w-full text-xs font-bold border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-400 transition-all"
                                        placeholder="965xxxxxxx"
                                        value={witnessPhone}
                                        onChange={(e) => setWitnessPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-450 block font-black">أقوال ومستخلص شهادة الشاهد إثباتاً للواقعة:</span>
                                    <VoiceDictationButton 
                                        value={witnessStatement}
                                        onTranscript={(t) => setWitnessStatement(t)}
                                        placeholderTitle="تسجيل أقوال الشاهد صوتياً"
                                        size="sm"
                                    />
                                </div>
                                <textarea 
                                    className="w-full text-xs font-bold border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-400 transition-all"
                                    placeholder="أفاد الشاهد بأنه عاين تكرار الامتناع وتلقي إنذارات..."
                                    rows={2}
                                    value={witnessStatement}
                                    onChange={(e) => setWitnessStatement(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-200/60">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-400 font-black">الحالة:</span>
                                    <select 
                                        className="bg-white border border-slate-250 rounded-lg p-1.5 text-[10px] font-black focus:outline-none focus:border-slate-400"
                                        value={witnessStatus}
                                        onChange={(e) => setWitnessStatus(e.target.value as any)}
                                    >
                                        <option value="summoned">تم توجيه الاستدعاء</option>
                                        <option value="attended">حضر وأدلى بأقواله</option>
                                        <option value="absent">تغيب عن الجلسة</option>
                                    </select>
                                </div>
                                <Button 
                                    onClick={handleAddWitness}
                                    className="bg-slate-900 hover:bg-slate-850 text-white font-black text-[9.5px] px-3.5 py-2 rounded-xl border-none cursor-pointer shadow-xs"
                                >
                                    إدراج وتوجيه استدعاء
                                </Button>
                            </div>
                        </div>

                        {/* Witnesses list */}
                        {selectedCase.witnesses?.length > 0 && (
                            <div className="space-y-2 text-xs font-bold max-h-[220px] overflow-y-auto">
                                {selectedCase.witnesses.map((w: any) => (
                                    <div key={w.id} className="p-3 border border-slate-200/60 rounded-xl bg-slate-50/50 flex justify-between items-start gap-2 shadow-2xs">
                                        <div className="space-y-0.5 text-right flex-grow">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-slate-900">{w.name}</span>
                                                <span className="text-[9px] text-slate-400">({w.phone})</span>
                                            </div>
                                            {w.statement && <p className="text-[10.5px] text-slate-500 leading-normal font-sans font-extrabold">شهادة الشاهد: {w.statement}</p>}
                                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black inline-block ${
                                                w.status === 'attended' ? 'bg-emerald-50 text-emerald-700' :
                                                w.status === 'absent' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {w.status === 'attended' ? 'حضر وأدلى بأقواله' : w.status === 'absent' ? 'تغيب عن الجلسة' : 'تم توجيه الاستدعاء'}
                                            </span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteWitness(w.id)}
                                            className="text-rose-600 hover:text-rose-800 p-1 shrink-0 mt-0.5 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Scribe Evidences checklist */}
                    <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4">
                        <div className="border-b border-slate-100/80 pb-3 flex justify-between items-center">
                            <h3 className="text-xs font-extrabold text-slate-900">سجل حيازة الأدلة والأحراز الفنية</h3>
                            <span className="text-[9.5px] font-extrabold bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-100 shadow-3xs">
                                {selectedCase.evidence?.length || 0} حرز مادي
                            </span>
                        </div>

                        {/* Add Evidence Form */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-200/60 shadow-2xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-450 block font-black">مسمى الدليل / الحرز:</span>
                                    <input 
                                        type="text" 
                                        className="w-full text-xs font-bold border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-400 transition-all"
                                        placeholder="كشف حسابات مراجع التدقيق..."
                                        value={evidenceName}
                                        onChange={(e) => setEvidenceName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-450 block font-black">طبيعة الدليل القانوني:</span>
                                    <select 
                                        className="w-full text-xs font-bold border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-400 transition-all"
                                        value={evidenceType}
                                        onChange={(e) => setEvidenceType(e.target.value)}
                                    >
                                        <option value="مستند ورقي رقمي">مستند ورقي رسمي</option>
                                        <option value="تقرير فني مالي">تقرير مالي تخصصي</option>
                                        <option value="تسجيل كاميرات مراقبة">تسجيل كاميرات CCTV</option>
                                        <option value="مراسلات وبريد إلكتروني">مراسلات إلكترونية / هاتفية</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-450 block font-black">موقع استخلاص وملاحظات الدليل:</span>
                                    <VoiceDictationButton 
                                        value={evidenceNotes}
                                        onTranscript={(t) => setEvidenceNotes(t)}
                                        placeholderTitle="تسجيل ملاحظات الدليل صوتياً"
                                        size="sm"
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full text-xs font-bold border border-slate-250 bg-white rounded-xl p-2.5 focus:outline-none focus:border-slate-400 transition-all"
                                    placeholder="تم سحب البيانات من الخادم المركزي للمحاسبة..."
                                    value={evidenceNotes}
                                    onChange={(e) => setEvidenceNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end pt-1 border-t border-slate-200/60">
                                <Button 
                                    onClick={handleAddEvidence}
                                    className="bg-slate-900 hover:bg-slate-850 text-white font-black text-[9.5px] px-3.5 py-2 rounded-xl border-none cursor-pointer shadow-xs"
                                >
                                    حيازة وإدراج الحرز الفني
                                </Button>
                            </div>
                        </div>

                        {/* Evidence list */}
                        {selectedCase.evidence?.length > 0 && (
                            <div className="space-y-2 text-xs font-bold max-h-[220px] overflow-y-auto">
                                {selectedCase.evidence.map((e: any) => (
                                    <div key={e.id} className="p-3 border border-slate-200/60 rounded-xl bg-slate-50/50 flex justify-between items-start gap-2 shadow-2xs">
                                        <div className="space-y-0.5 text-right flex-grow">
                                            <span className="font-black text-slate-900">{e.name}</span>
                                            <p className="text-[10.5px] text-slate-450 font-bold leading-normal">طبيعة الدليل: {e.type} | {e.dateAdded}</p>
                                            {e.notes && <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{e.notes}</p>}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteEvidence(e.id)}
                                            className="text-rose-600 hover:text-rose-800 p-1 shrink-0 mt-0.5 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                </div>
            </div>
        </div>
    );
};
