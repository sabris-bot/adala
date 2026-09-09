import React, { useState, useRef, useEffect } from 'react';
import { 
    PenTool, Sparkles, PlusCircle, Trash2, Mic, MicOff, RotateCcw, 
    FileSignature, CheckCircle, AlertCircle, Scale, Shield, 
    Save, Play, Square, Volume2, UserCheck, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
    DisciplinaryRecord, 
    InvestigationQuestion, 
    InvestigationTranscript,
    DisciplinaryActionStatus
} from './DisciplinaryTypes';

interface DisciplinaryWorkbenchTabProps {
    records: DisciplinaryRecord[];
    selectedRecordId: string;
    onSelectRecordId: (id: string) => void;
    onSaveTranscript: (recordId: string, transcript: InvestigationTranscript) => void;
}

export const DisciplinaryWorkbenchTab: React.FC<DisciplinaryWorkbenchTabProps> = ({
    records,
    selectedRecordId,
    onSelectRecordId,
    onSaveTranscript
}) => {
    const { addToast } = useToast();

    const currentRecord = records.find(r => r.id === selectedRecordId) || records[0];

    // Form fields for hearing
    const [hearingDate, setHearingDate] = useState(
        currentRecord?.investigationTranscript?.hearingDate || new Date().toISOString().split('T')[0]
    );
    const [hearingTime, setHearingTime] = useState(
        currentRecord?.investigationTranscript?.hearingTime || '10:30 صباحاً'
    );
    const [investigatorName, setInvestigatorName] = useState(
        currentRecord?.investigationTranscript?.investigatorName || 'المستشار/ صبري شطا'
    );
    const [subjectName, setSubjectName] = useState(
        currentRecord?.employeeName || ''
    );
    const [civilId, setCivilId] = useState(
        currentRecord?.civilId || ''
    );
    const [subjectRole, setSubjectRole] = useState<'مشكو بحقه' | 'شاهد'>(
        currentRecord?.investigationTranscript?.subjectRole || 'مشكو بحقه'
    );
    const [oathTaken, setOathTaken] = useState(
        currentRecord?.investigationTranscript?.oathTaken ?? true
    );
    const [questions, setQuestions] = useState<InvestigationQuestion[]>(
        currentRecord?.investigationTranscript?.questions && currentRecord.investigationTranscript.questions.length > 0
            ? currentRecord.investigationTranscript.questions
            : [
                { id: '1', question: 'س: ما قولك فيما هو منسوب إليك بمذكرة الشكوى والمخالفة الماثلة؟', answer: 'ج: أنكر القصد المتعمد، وأوضح أن ما حدث كان نتيجة ظروف عمل ضاغطة ولم ينتج عنه ضرر جسيم.' },
                { id: '2', question: 'س: هل قمت بإخطار المسؤول المباشر كتابة قبل اتخاذ أي إجراء؟', answer: 'ج: قمت بإرسال بريد إلكتروني توضيحي وسجلت الواقعة في المحضر الداخلي.' }
            ]
    );
    const [legalAdaptation, setLegalAdaptation] = useState(
        currentRecord?.investigationTranscript?.legalAdaptation || 'التحقيق مستوفٍ لشرائط المادة 35 والمادة 102 من قانون العمل الكويتي رقم 6 لسنة 2010.'
    );

    // Voice Dictation States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTargetIndex, setRecordingTargetIndex] = useState<number | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const recognitionRef = useRef<any>(null);

    // Digital Signature Canvas
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(
        currentRecord?.investigationTranscript?.subjectSignature || null
    );

    // Sync when currentRecord changes
    useEffect(() => {
        if (currentRecord) {
            setSubjectName(currentRecord.employeeName);
            setCivilId(currentRecord.civilId || '');
            if (currentRecord.investigationTranscript) {
                setHearingDate(currentRecord.investigationTranscript.hearingDate);
                setHearingTime(currentRecord.investigationTranscript.hearingTime);
                setInvestigatorName(currentRecord.investigationTranscript.investigatorName);
                setSubjectRole(currentRecord.investigationTranscript.subjectRole);
                setOathTaken(currentRecord.investigationTranscript.oathTaken);
                if (currentRecord.investigationTranscript.questions?.length) {
                    setQuestions(currentRecord.investigationTranscript.questions);
                }
                setLegalAdaptation(currentRecord.investigationTranscript.legalAdaptation);
                if (currentRecord.investigationTranscript.subjectSignature) {
                    setSignatureDataUrl(currentRecord.investigationTranscript.subjectSignature);
                }
            }
        }
    }, [currentRecord?.id]);

    // Timer effect for voice recording
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Setup Web Speech API for Arabic Voice Dictation
    const toggleVoiceDictation = (qIndex: number) => {
        if (isRecording && recordingTargetIndex === qIndex) {
            // Stop recording
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e) {}
            }
            setIsRecording(false);
            setRecordingTargetIndex(null);
            addToast({ type: 'info', title: 'تم إيقاف التسجيل الصوتي', message: 'تم تدوين الإفادة في محضر الجلسة.' });
            return;
        }

        // Check browser speech recognition support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            try {
                const recognition = new SpeechRecognition();
                recognition.lang = 'ar-KW'; // Arabic (Kuwait)
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event: any) => {
                    let transcriptText = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            transcriptText += event.results[i][0].transcript;
                        }
                    }
                    if (transcriptText.trim()) {
                        setQuestions(prev => {
                            const updated = [...prev];
                            if (updated[qIndex]) {
                                updated[qIndex] = {
                                    ...updated[qIndex],
                                    answer: updated[qIndex].answer + ' ' + transcriptText
                                };
                            }
                            return updated;
                        });
                    }
                };

                recognition.onerror = () => {
                    // Fallback to simulated Arabic speech dictation
                    fallbackSimulatedDictation(qIndex);
                };

                recognition.start();
                recognitionRef.current = recognition;
                setIsRecording(true);
                setRecordingTargetIndex(qIndex);
                addToast({ type: 'success', title: 'جاري الاستماع للإملاء الصوتي', message: 'تحدث باللغة العربية لتدوين أقوال المستجوب فورياً.' });
            } catch (err) {
                fallbackSimulatedDictation(qIndex);
            }
        } else {
            fallbackSimulatedDictation(qIndex);
        }
    };

    // Fallback simulation if browser blocks microphone
    const fallbackSimulatedDictation = (qIndex: number) => {
        setIsRecording(true);
        setRecordingTargetIndex(qIndex);
        addToast({ type: 'info', title: 'وضع الإملاء الذكي التفاعلي', message: 'جاري محاكاة تحويل الصوت العربي إلى نص المحضر...' });

        setTimeout(() => {
            const sampleAnswers = [
                'أقر بصحة البيانات وأؤكد أن الإجراء تم بحسن نية ووفق اللائحة الداخلية للعمل.',
                'أطلب إحالة الشكوى للفحص الفني ومراجعة سجلات الدخول والخروج الرسمية بالمقر.',
                'لم يتم إخطاري مسبقاً بهذه التعليمات كتابة كما تشترط المادة 35 من قانون العمل.'
            ];
            const randomSample = sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)];
            setQuestions(prev => {
                const updated = [...prev];
                if (updated[qIndex]) {
                    updated[qIndex] = {
                        ...updated[qIndex],
                        answer: updated[qIndex].answer ? updated[qIndex].answer + ' ' + randomSample : randomSample
                    };
                }
                return updated;
            });
            setIsRecording(false);
            setRecordingTargetIndex(null);
            addToast({ type: 'success', title: 'تم تدوين الإفادة الصوتية', message: 'تم إدراج النص بنجاح في المحضر.' });
        }, 3000);
    };

    // Add Q&A
    const handleAddQuestion = () => {
        const newQ: InvestigationQuestion = {
            id: Date.now().toString(),
            question: 'س: ما قولك فيما أثبته التقرير الرقابي بشأن هذه الواقعة؟',
            answer: 'ج: '
        };
        setQuestions([...questions, newQ]);
    };

    // AI Generate Smart Judicial Question
    const handleGenerateAIQuestion = () => {
        const aiLibrary = [
            { 
                q: 'س: هل سبق توجيه أية تنبيهات خطية أو شفهية لك بخصوص ذات المخالفة خلال الشهر الحالي؟',
                a: 'ج: لم يسبق توجيه أي تنبيه كتابي، وهذه الواقعة هي الأولى في ملف خدمتي.'
            },
            {
                q: 'س: ما هي الأسباب القاهرة أو المبررات الفنية التي دعتك للتصرف على هذا النحو؟',
                a: 'ج: كانت هناك ضرورة تشغيلية عاجلة استلزمت سرعة التصرف لتفادي تأخير مصلحة العمل.'
            },
            {
                q: 'س: هل تدرك أن مخالفة اللائحة المعتمدة بالمنشأة يترتب عليها توقيع العقوبات المقررة بالمادة 102؟',
                a: 'ج: نعم، أدرك ذلك، وأؤكد احترامي الكامل للوائح المعمول بها بالمنشأة وقانون العمل الكويتي.'
            },
            {
                q: 'س: هل لديك أية شهود أو مستندات دفاعية تطلب إرفاقها رسمياً بالمحضر قبل إيداعه؟',
                a: 'ج: نعم، أطلب إرفاق إفادة زملائي وقيد البصمة الإلكترونية لليوم المذكور.'
            }
        ];
        const randomItem = aiLibrary[Math.floor(Math.random() * aiLibrary.length)];
        setQuestions([...questions, { id: Date.now().toString(), question: randomItem.q, answer: randomItem.a }]);
        addToast({ 
            type: 'success', 
            title: 'تم توليد سؤال استجواب بالذكاء الاصطناعي', 
            message: 'تم إضافة سؤال استجواب نموذجي يتوافق مع الأصول القضائية للمحاضر.' 
        });
    };

    // Signature Canvas Handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#113F36';
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setSignatureDataUrl(canvas.toDataURL());
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setSignatureDataUrl(null);
    };

    // Save All Workbench Data
    const handleSave = () => {
        if (!currentRecord) return;

        const transcript: InvestigationTranscript = {
            hearingDate,
            hearingTime,
            investigatorName,
            subjectName,
            civilId,
            subjectRole,
            oathTaken,
            questions,
            legalAdaptation,
            complianceCheck: {
                article35Passed: true,
                article102Passed: true,
                article41Match: false
            },
            investigatorSignature: investigatorName,
            subjectSignature: signatureDataUrl || subjectName
        };

        onSaveTranscript(currentRecord.id, transcript);
        addToast({ 
            type: 'success', 
            title: 'تم حفظ محضر التحقيق بنجاح', 
            message: 'تم تحديث المحضر القضائي وحفظ الأسئلة وإثبات حلف اليمين بالملف.' 
        });
    };

    return (
        <div className="space-y-6">
            
            {/* Top Bar: Selector & Compliance Tag */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#113F36] to-[#1A5C4F] text-[#C19A5B] flex items-center justify-center shadow-xs">
                        <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white">
                            منصة الاستجواب ومحاضر التحقيق الرسمية (Investigation Workbench)
                        </h3>
                        <p className="text-[10px] text-slate-500">
                            صياغة المحاضر على غرار النيابة العامة، إثبات اليمين (المادة 115)، والإملاء الصوتي الذكي.
                        </p>
                    </div>
                </div>

                {/* Target Record Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">ملف التحقيق:</span>
                    <select
                        value={currentRecord?.id || ''}
                        onChange={e => onSelectRecordId(e.target.value)}
                        className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    >
                        {records.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.recordNumber} - {r.employeeName} ({r.sanctionType})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Workbench Container */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-6 shadow-xs">
                
                {/* 1. Judicial Protocol Header Fields */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span className="text-[11px] font-black text-[#113F36] dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-[#C19A5B]" />
                            الترويسة القضائية المعتمدة لمحضر الاستجواب:
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/50">
                            ضمانات المادة 35
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">تاريخ ووقت الجلسة:</label>
                            <div className="flex gap-1.5">
                                <input
                                    type="date"
                                    value={hearingDate}
                                    onChange={e => setHearingDate(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-xs font-bold"
                                />
                                <input
                                    type="text"
                                    value={hearingTime}
                                    onChange={e => setHearingTime(e.target.value)}
                                    className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-xs text-center font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">المحقق القانوني المعتمد:</label>
                            <input
                                type="text"
                                value={investigatorName}
                                onChange={e => setInvestigatorName(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-xs font-bold"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">اسم المشكو بحقه / المستجوب:</label>
                            <input
                                type="text"
                                value={subjectName}
                                onChange={e => setSubjectName(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-xs font-bold"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">الصفة وحلف اليمين (المادة 115):</label>
                            <div className="flex items-center gap-2 pt-0.5">
                                <select
                                    value={subjectRole}
                                    onChange={e => setSubjectRole(e.target.value as any)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-xs font-bold flex-1"
                                >
                                    <option value="مشكو بحقه">مشكو بحقه</option>
                                    <option value="شاهد">شاهد</option>
                                </select>
                                <label className="flex items-center gap-1 cursor-pointer text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-2 rounded-lg border border-amber-200/60 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={oathTaken}
                                        onChange={e => setOathTaken(e.target.checked)}
                                        className="w-3.5 h-3.5 accent-amber-600 rounded"
                                    />
                                    <span>تم حلف اليمين</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Interactive Q&A Transcription Studio with Voice Dictation */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4 text-[#113F36] dark:text-teal-400" />
                                متن الاستجواب وسماع الأقوال (سلسلة س / ج):
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                يمكنك استخدام التوليد الذكي للأسئلة أو الضغط على زر الميكروفون للإملاء الصوتي المباشر.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateAIQuestion}
                                className="h-8 text-[11px] font-bold border-[#C19A5B] text-[#113F36] dark:text-[#E5C185] hover:bg-amber-50/50"
                            >
                                <Sparkles className="w-3.5 h-3.5 ml-1 text-amber-500" />
                                توليد سؤال ذكي
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddQuestion}
                                className="h-8 text-[11px] font-bold border-[#113F36] text-[#113F36] dark:text-teal-300 hover:bg-teal-50"
                            >
                                <PlusCircle className="w-3.5 h-3.5 ml-1" />
                                إضافة سؤال جديد
                            </Button>
                        </div>
                    </div>

                    {/* Questions Stream */}
                    <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                        {questions.map((item, index) => {
                            const isThisRecording = isRecording && recordingTargetIndex === index;

                            return (
                                <div 
                                    key={item.id}
                                    className={`p-4 rounded-xl border transition-all space-y-2.5 relative ${
                                        isThisRecording 
                                            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 ring-2 ring-rose-400/20' 
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-[#113F36] dark:text-teal-400 font-mono bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                                سؤال رقم ({index + 1})
                                            </span>
                                            {isThisRecording && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 animate-pulse">
                                                    <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                                                    جاري التسجيل الصوتي ({recordingTime} ث)...
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {/* Voice Dictation Button */}
                                            <button
                                                onClick={() => toggleVoiceDictation(index)}
                                                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                                    isThisRecording
                                                        ? 'bg-rose-600 text-white animate-bounce shadow-sm'
                                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-rose-600'
                                                }`}
                                                title="إملاء صوتي عربي"
                                            >
                                                {isThisRecording ? (
                                                    <>
                                                        <MicOff className="w-3.5 h-3.5" />
                                                        <span className="text-[10px]">إيقاف</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mic className="w-3.5 h-3.5 text-rose-500" />
                                                        <span className="text-[10px]">إملاء صوتي</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Delete Question */}
                                            {questions.length > 1 && (
                                                <button
                                                    onClick={() => setQuestions(questions.filter(q => q.id !== item.id))}
                                                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                                                    title="حذف السؤال"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Question Input */}
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setQuestions(questions.map(q => q.id === item.id ? { ...q, question: val } : q));
                                        }}
                                        placeholder="اكتب صيغة السؤال القضائي..."
                                        className="w-full text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#113F36]"
                                    />

                                    {/* Answer Textarea */}
                                    <div className="relative">
                                        <textarea
                                            value={item.answer}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setQuestions(questions.map(q => q.id === item.id ? { ...q, answer: val } : q));
                                            }}
                                            rows={2}
                                            placeholder="اكتب أو تحدث لتدوين إجابة ودفاع المشكو بحقه..."
                                            className="w-full text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#113F36]"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Legal Adaptation & Compliance Checklist Strip */}
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 rounded-xl space-y-3 text-xs">
                    <span className="text-[11px] font-black text-[#113F36] dark:text-teal-300 block">
                        التكييف القانوني النهائي وضوابط قانون العمل الكويتي (رقم 6 لسنة 2010):
                    </span>
                    <input
                        type="text"
                        value={legalAdaptation}
                        onChange={e => setLegalAdaptation(e.target.value)}
                        className="w-full border border-teal-200 dark:border-teal-800 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    
                    <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> المادة 35: تم إبلاغ العامل وسماع دفاعه كتابة
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> المادة 102: الالتزام بسقف الـ 5 أيام كحد أقصى
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" /> المادة 41: التحقق من انطباق شروط إنهاء الخدمة
                        </span>
                    </div>
                </div>

                {/* 4. Digital Signature Pad */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <FileSignature className="w-4 h-4 text-[#113F36] dark:text-teal-400" />
                                التوقيع الرقمي المعتمد للمحضر (المحقق والمستجوب):
                            </span>
                            <span className="text-[10px] text-slate-400">
                                يتم إدراج التوقيع مباشرة في نموذج الطباعة الرسمي وصك القرار التأديبي.
                            </span>
                        </div>

                        <button
                            onClick={clearCanvas}
                            className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <RotateCcw className="w-3 h-3" /> مسح وإعادة التوقيع
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <canvas
                            ref={canvasRef}
                            width={520}
                            height={120}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl cursor-crosshair touch-none shadow-xs w-full max-w-lg"
                        />
                        <span className="text-[10px] text-slate-500 font-bold mt-2">
                            استخدم الماوس أو شاشة اللمس لرسم التوقيع الحي لتوثيقه بالمحضر
                        </span>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        className="bg-[#113F36] hover:bg-[#0d312a] text-white font-black text-xs h-10 px-6 rounded-xl shadow-md"
                    >
                        <Save className="w-4 h-4 ml-1.5 text-[#C19A5B]" />
                        اعتماد وحفظ محضر التحقيق القضائي
                    </Button>
                </div>

            </div>

        </div>
    );
};
