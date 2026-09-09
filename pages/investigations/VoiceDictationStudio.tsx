import React, { useState } from 'react';
import { 
    Mic, MicOff, Volume2, Sparkles, Plus, Copy, Check, Trash2, 
    CornerDownLeft, FileText, UserCheck, Scale, HelpCircle, Shield, 
    Settings2, Radio, Globe, AlertCircle, Play, Square, MessageSquare
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useVoiceDictation } from '../../hooks/useVoiceDictation';
import { useToast } from '../../components/ui/Toast';

interface VoiceDictationStudioProps {
    onInjectQuestion?: (text: string) => void;
    onInjectAnswer?: (text: string) => void;
    onInjectDirectQA?: (qText: string, aText: string) => void;
    onInjectWitnessStatement?: (text: string) => void;
    onInjectNotes?: (text: string) => void;
    onInjectFacts?: (text: string) => void;
    initialMode?: 'compact' | 'full';
    className?: string;
    activePartyName?: string;
}

export const VoiceDictationStudio: React.FC<VoiceDictationStudioProps> = ({
    onInjectQuestion,
    onInjectAnswer,
    onInjectDirectQA,
    onInjectWitnessStatement,
    onInjectNotes,
    onInjectFacts,
    initialMode = 'full',
    className = '',
    activePartyName = 'الموظف / الشاهد'
}) => {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(initialMode === 'full');

    const {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        fullTranscript,
        audioLevel,
        recordingDuration,
        error,
        language,
        startListening,
        stopListening,
        toggleListening,
        resetTranscript,
        setTranscript,
        setLanguage,
        appendMacro
    } = useVoiceDictation({
        language: 'ar-KW',
        onError: (err) => {
            addToast({
                type: 'error',
                title: 'تنبيه الميكروفون',
                message: err
            });
        }
    });

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCopy = () => {
        if (!fullTranscript) return;
        navigator.clipboard.writeText(fullTranscript);
        setCopied(true);
        addToast({
            type: 'success',
            title: 'تم النسخ',
            message: 'تم نسخ نص الإفادة المسموعة إلى الحافظة.'
        });
        setTimeout(() => setCopied(false), 2000);
    };

    // Smart Actions
    const handlePushToQuestion = () => {
        if (!fullTranscript) return;
        if (onInjectQuestion) {
            onInjectQuestion(fullTranscript);
            addToast({
                type: 'success',
                title: 'تم تدوين السؤال',
                message: 'تم إدراج النص المسموع كـ (سؤال استجواب المحقق) بنجاح.'
            });
        }
    };

    const handlePushToAnswer = () => {
        if (!fullTranscript) return;
        if (onInjectAnswer) {
            onInjectAnswer(fullTranscript);
            addToast({
                type: 'success',
                title: 'تم تدوين الإفادة',
                message: 'تم إدراج النص المسموع كـ (إفادة ودفاع المتكلم) بنجاح.'
            });
        }
    };

    const handlePushDirectQA = () => {
        if (!fullTranscript) return;
        if (onInjectDirectQA) {
            // Check if text has question markers
            let q = 'س: ما أقوالك فيما هو منسوب إليك بملف التحقيق؟';
            let a = fullTranscript;

            if (fullTranscript.includes('س:') && fullTranscript.includes('ج:')) {
                const parts = fullTranscript.split('ج:');
                q = parts[0].replace('س:', '').trim();
                a = parts[1].trim();
            } else if (fullTranscript.includes('؟')) {
                const parts = fullTranscript.split('؟');
                q = parts[0].trim() + '؟';
                a = parts.slice(1).join('؟').trim() || 'أجاب المذكور وفق ما تم تدوينه وتوثيقه.';
            }

            onInjectDirectQA(q, a);
            resetTranscript();
            addToast({
                type: 'success',
                title: 'إدراج فوري للمحضر',
                message: 'تم إضافة سؤال وإجابة محضر السماع مباشرة لمسودة الجلسة.'
            });
        }
    };

    const handlePushWitness = () => {
        if (!fullTranscript) return;
        if (onInjectWitnessStatement) {
            onInjectWitnessStatement(fullTranscript);
            addToast({
                type: 'success',
                title: 'شهادة الشاهد',
                message: 'تم تثبيت الأقوال الصوتية في سجل إفادة الشاهد.'
            });
        }
    };

    const handlePushNotes = () => {
        if (!fullTranscript) return;
        if (onInjectNotes) {
            onInjectNotes(fullTranscript);
            addToast({
                type: 'success',
                title: 'ملاحظات المحقق',
                message: 'تم إدراج النص الصوتي في ملاحظات ومرئيات المحقق.'
            });
        }
    };

    const handlePushFacts = () => {
        if (!fullTranscript) return;
        if (onInjectFacts) {
            onInjectFacts(fullTranscript);
            addToast({
                type: 'success',
                title: 'وقائع التحقيق',
                message: 'تم إدراج النص الصوتي في سرد مجريات الواقعة.'
            });
        }
    };

    const wordCount = fullTranscript ? fullTranscript.split(/\s+/).filter(Boolean).length : 0;
    const charCount = fullTranscript.length;

    if (!isSupported) {
        return (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl text-right text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>خدمة التدوين الصوتي المباشر</span>
                </div>
                <p className="text-amber-700 dark:text-amber-400 font-bold">
                    واجهة التعرف الصوتي تتطلب متصفحاً حديثاً يدعم Web Speech API (مثل Google Chrome أو Edge). يرجى التأكد من تشغيل الموقع عبر متصفح متوافق ومنح الإذن للميكروفون.
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden text-right ${className}`} style={{ direction: 'rtl' }}>
            
            {/* Background Sound wave Ambient Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400" />
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-750/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                        isListening 
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/20 animate-pulse' 
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                        {isListening ? <Radio className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5 text-teal-400" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white tracking-wide">
                                استوديو التدوين الصوتي المباشر لجلسات التحقيق
                            </h3>
                            <span className="text-[9px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                                ميكروفون حي (Speech-to-Text)
                            </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 font-bold mt-0.5">
                            تحويل إفادات وشهادات المستجوبين والشهود الصوتية إلى نصوص رسمية موثقة فورياً
                        </p>
                    </div>
                </div>

                {/* Right controls: Language & Status & Timer */}
                <div className="flex items-center gap-2">
                    {/* Dialect selector */}
                    <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-inner">
                        <Globe className="w-3.5 h-3.5 text-teal-400" />
                        <select
                            aria-label="لهجة ولغة التدوين الصوتي"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent text-white font-black text-[10px] focus:outline-none cursor-pointer"
                        >
                            <option value="ar-KW" className="bg-slate-900 text-white">العربية (الكويت - معتمد)</option>
                            <option value="ar-SA" className="bg-slate-900 text-white">العربية (السعودية / الخليج)</option>
                            <option value="ar-EG" className="bg-slate-900 text-white">العربية (مصر)</option>
                            <option value="ar" className="bg-slate-900 text-white">العربية (الفصحى)</option>
                            <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
                        </select>
                    </div>

                    {/* Recording Timer */}
                    {isListening && (
                        <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-mono font-black animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                            <span>{formatTimer(recordingDuration)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Audio Wave Visualizer bar */}
            {isListening && (
                <div className="mt-4 p-3 bg-slate-950/60 rounded-2xl border border-teal-500/30 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-teal-400 animate-pulse" />
                        <span className="text-[11px] font-black text-teal-300">
                            مستشعر الصوت نشط - تحدث الآن بوضوح ({audioLevel}%)
                        </span>
                    </div>

                    {/* Dynamic Graphic Equalizer Bars */}
                    <div className="flex items-center gap-1 h-6">
                        {[15, 30, 60, 90, 45, 75, 100, 50, 80, 40, 65, 35, 85, 20].map((h, i) => {
                            const dynamicH = Math.max(15, Math.min(100, (audioLevel * (h / 60))));
                            return (
                                <div
                                    key={i}
                                    className="w-1 bg-gradient-to-t from-teal-500 to-emerald-300 rounded-full transition-all duration-75"
                                    style={{ height: `${dynamicH}%` }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Live Transcript Display Box */}
            <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-[10.5px] font-black text-slate-300">
                    <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        <span>نص الإفادة والشهادة المسجلة حياً:</span>
                        {isListening && <span className="text-emerald-400 font-extrabold animate-pulse">(جارِ الكتابة الفورية...)</span>}
                    </span>
                    <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                        <span>{wordCount} كلمة</span>
                        <span>•</span>
                        <span>{charCount} حرف</span>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        rows={4}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={
                            isListening
                                ? 'جارِ الاستماع لصوت المتكلم وتسجيل الكلمات فورياً... تحدث الآن أمام الميكروفون'
                                : 'انقر على زر "بدء الاستماع والتسجيل الصوتي" أدناه، ثم ابدأ في تلاوة الأسئلة أو أقوال المستجوب...'
                        }
                        className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-teal-400 focus:bg-slate-950 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-y shadow-inner"
                    />

                    {/* Live Interim Transcript overlay badge when speaking */}
                    {interimTranscript && isListening && (
                        <div className="absolute bottom-3 left-3 right-3 bg-teal-950/90 border border-teal-500/50 text-teal-200 text-[11px] font-bold p-2 rounded-xl backdrop-blur-sm shadow-md animate-fade-in flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
                            <span className="truncate">جاري التقاط: "{interimTranscript}"</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Legal Punctuation & Macros Quick Toolbar */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-black text-slate-400 ml-1">علامات ضبط المحضر:</span>
                
                <button
                    type="button"
                    onClick={() => appendMacro('.')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                    + نقطة .
                </button>

                <button
                    type="button"
                    onClick={() => appendMacro('،')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                    + فاصلة ،
                </button>

                <button
                    type="button"
                    onClick={() => appendMacro('؟')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                    + استفهام ؟
                </button>

                <button
                    type="button"
                    onClick={() => appendMacro('\n')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                    <CornerDownLeft className="w-2.5 h-2.5" /> سطر جديد
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                <button
                    type="button"
                    onClick={() => appendMacro('سؤال المحقق المستشار: ')}
                    className="px-2.5 py-1 bg-teal-900/60 hover:bg-teal-800 text-teal-200 text-[10px] font-black rounded-lg border border-teal-700/50 transition-all cursor-pointer"
                >
                    + س: سؤال
                </button>

                <button
                    type="button"
                    onClick={() => appendMacro('إفادة ودفاع الطرف المستجوب: ')}
                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-black rounded-lg border border-emerald-700/50 transition-all cursor-pointer"
                >
                    + ج: جواب
                </button>

                <button
                    type="button"
                    onClick={() => appendMacro('شهادة الشاهد بعد حلف اليمين: ')}
                    className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[10px] font-black rounded-lg border border-amber-700/50 transition-all cursor-pointer"
                >
                    + ش: شهادة
                </button>

                <button
                    type="button"
                    onClick={() => appendMacro('أقر بصحة الواقعة مع نفي القصد العمدي.')}
                    className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-[9.5px] font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                    إقرار ونفي التعمد
                </button>
            </div>

            {/* Primary Control Buttons & Action Row */}
            <div className="mt-5 pt-4 border-t border-slate-750/80 flex flex-wrap items-center justify-between gap-3">
                
                {/* Left: Main Mic Start/Stop & Clear */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => toggleListening()}
                        className={`px-5 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                            isListening
                                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-teal-500/20'
                        }`}
                    >
                        {isListening ? (
                            <>
                                <Square className="w-4 h-4 fill-white" />
                                <span>إيقاف الاستماع الصوتي ⏹</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4 text-slate-950" />
                                <span>بدء التدوين الصوتي المباشر 🎙</span>
                            </>
                        )}
                    </button>

                    {fullTranscript && (
                        <>
                            <button
                                type="button"
                                onClick={resetTranscript}
                                title="مسح النص المسجل"
                                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-2xl border border-slate-700 transition-all cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={handleCopy}
                                title="نسخ النص"
                                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </>
                    )}
                </div>

                {/* Right: Direct Record Insertion Triggers */}
                {fullTranscript && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 block w-full sm:w-auto text-right">
                            إدراج النص في السجل:
                        </span>

                        {onInjectAnswer && (
                            <button
                                type="button"
                                onClick={handlePushToAnswer}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                            >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>إدراج في إفادة المتكلم (ج)</span>
                            </button>
                        )}

                        {onInjectQuestion && (
                            <button
                                type="button"
                                onClick={handlePushToQuestion}
                                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[10.5px] font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                            >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>إدراج في سؤال الاستجواب (س)</span>
                            </button>
                        )}

                        {onInjectDirectQA && (
                            <button
                                type="button"
                                onClick={handlePushDirectQA}
                                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5 text-slate-950 font-black" />
                                <span>إضافة فورية للمحضر (س و ج) ✨</span>
                            </button>
                        )}

                        {onInjectWitnessStatement && (
                            <button
                                type="button"
                                onClick={handlePushWitness}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                                <Shield className="w-3 h-3 text-amber-400" />
                                <span>أقوال الشاهد</span>
                            </button>
                        )}

                        {onInjectNotes && (
                            <button
                                type="button"
                                onClick={handlePushNotes}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                                <Scale className="w-3 h-3 text-teal-400" />
                                <span>ملاحظات المحقق</span>
                            </button>
                        )}

                        {onInjectFacts && (
                            <button
                                type="button"
                                onClick={handlePushFacts}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                                <FileText className="w-3 h-3 text-teal-400" />
                                <span>سرد الوقائع</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
