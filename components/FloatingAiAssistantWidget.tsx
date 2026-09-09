import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Case, CaseStatus } from '../types';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useToast } from './ui/Toast';
import { 
    SparklesIcon, 
    BrainIcon, 
    GavelIcon, 
    DocumentTextIcon, 
    ScaleIcon,
    ArrowLeftIcon,
    ClockIcon
} from '../constants';
import { 
    Bot, 
    User, 
    Send, 
    X, 
    Maximize2, 
    Minimize2, 
    Copy, 
    Check, 
    Trash2, 
    Zap, 
    RefreshCw, 
    Briefcase, 
    ChevronDown, 
    MessageSquare,
    AlertCircle,
    ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FloatingAiAssistantWidgetProps {
    currentCase?: Case | null;
    className?: string;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

export const FloatingAiAssistantWidget: React.FC<FloatingAiAssistantWidgetProps> = ({ 
    currentCase,
    className 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputQuery, setInputQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { addToast } = useToast();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Default welcome messages tailored to case context or general litigation
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (currentCase) {
            setMessages([
                {
                    id: 'welcome-case',
                    sender: 'ai',
                    text: `مرحباً بك! أنا مستشارك القانوني الذكي المباشر لقضية **"${currentCase.title}"** (رقم: \`${currentCase.caseNumber || currentCase.internalCaseNumber}\`).\n\nكيف يمكنني مساعدتك الآن؟ يمكنني تحليل الفرص القانونية، صياغة المذكرات، أو تقديم ثغرات الدفاع المساندة.`,
                    timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } else {
            setMessages([
                {
                    id: 'welcome-general',
                    sender: 'ai',
                    text: `أهلاً بك! أنا المساعد الذكي لإدارة القضايا والتكشيف القانوني. أستطيع مساعدتك في تحليل المستندات، مراجعة الدفوع المرفوعة، وتوقع الاتجاهات القضائية وفق القانون الكويتي.`,
                    timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    }, [currentCase?.id]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized, isLoading]);

    const handleSendMessage = async (queryText?: string) => {
        const textToSend = queryText || inputQuery;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: textToSend,
            timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        if (!queryText) setInputQuery('');
        setIsLoading(true);

        try {
            // Build rich context prompt
            let contextPrompt = `أنت مستشار قانوني ذكي متخصص في القانون والتقاضي الكويتي والعربي.\n\n`;

            if (currentCase) {
                contextPrompt += `--- تفاصيل القضية الحالية ---\n`;
                contextPrompt += `عنوان القضية: ${currentCase.title}\n`;
                contextPrompt += `رقم القضية: ${currentCase.caseNumber || currentCase.internalCaseNumber}\n`;
                contextPrompt += `نوع الدعوى: ${currentCase.caseMainType || 'غير محدد'}\n`;
                contextPrompt += `المحكمة والدائرة: ${currentCase.courtName || ''} - ${currentCase.circuit || ''}\n`;
                contextPrompt += `الموكل: ${currentCase.clientName} (${currentCase.clientRole || 'مدعي/مدعى عليه'})\n`;
                contextPrompt += `الخصم: ${currentCase.opposingPartyName || ''} (${currentCase.opponentRole || ''})\n`;
                contextPrompt += `الحالة القضائية: ${currentCase.status}\n`;
                contextPrompt += `درجة التقاضي: ${currentCase.courtLevel || ''}\n`;
                if (currentCase.description) contextPrompt += `ملخص القضية: ${currentCase.description}\n`;
                if (currentCase.hearings && currentCase.hearings.length > 0) {
                    const lastH = currentCase.hearings[currentCase.hearings.length - 1];
                    contextPrompt += `آخر جلسة: بتاريخ ${lastH.date} - القرار: ${lastH.courtDecision || lastH.notes || 'لا يوجد'}\n`;
                }
                contextPrompt += `---------------------------\n\n`;
            }

            contextPrompt += `سؤال/طلب المستخدم: "${textToSend}"\n\n`;
            contextPrompt += `يرجى تقديم إجابة قانونية دقيقة، منظمة ومباشرة باللغة العربية مع نقاط عملية واضحة.`;

            const aiResponse = await geminiService.generateContent(contextPrompt);

            const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: aiResponse || 'لم أتمكن من الحصول على استجابة كاملة. يرجى إعادة المحاولة.',
                timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI Case Assistant Error:', error);
            addToast({ title: 'خطأ', message: 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي', type: 'error' });
            const errorMsg: ChatMessage = {
                id: `err-${Date.now()}`,
                sender: 'ai',
                text: 'عفواً، حدثت مشكلة في الاتصال بالمساعد الذكي. يرجى التحقق من الاتصال وإعادة المحاولة.',
                timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        addToast({ title: 'تم النسخ', message: 'تم نسخ النص إلى الحافظة بنجاح', type: 'success' });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleQuickAction = (actionPrompt: string) => {
        handleSendMessage(actionPrompt);
    };

    return (
        <div className={cn("fixed bottom-6 left-6 z-50 font-tajawal", className)} dir="rtl">
            <AnimatePresence>
                {/* Floating Widget Toggle Trigger Button when Closed */}
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="relative group flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-primary-dark text-white rounded-full shadow-2xl border border-accent/40 hover:border-accent transition-all duration-300"
                    >
                        {/* Pulse Glow Effect */}
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent"></span>
                        </span>

                        <div className="p-2 bg-accent text-slate-950 rounded-full shadow-md shrink-0 group-hover:rotate-12 transition-transform duration-300">
                            <SparklesIcon className="w-5 h-5" />
                        </div>

                        <div className="flex flex-col text-right">
                            <span className="text-xs font-black text-white leading-tight">المساعد الذكي</span>
                            <span className="text-[9px] font-bold text-accent">
                                {currentCase ? `تحليل: ${currentCase.title.slice(0, 16)}...` : 'تحليل وتكشيف القضايا'}
                            </span>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Expanded AI Assistant Modal / Drawer Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={cn(
                            "bg-slate-950 text-white rounded-[2rem] shadow-2xl border border-slate-800 flex flex-col overflow-hidden w-[90vw] sm:w-[440px] transition-all duration-300",
                            isMinimized ? "h-[70px]" : "h-[620px] max-h-[85vh]"
                        )}
                    >
                        {/* Header Bar */}
                        <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-accent/20 border border-accent/30 text-accent rounded-xl shrink-0">
                                    <SparklesIcon className="w-5 h-5" />
                                </div>
                                <div className="truncate">
                                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                                        المساعد الذكي للقضايا
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-md border border-emerald-500/30">
                                            نشط الان
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold truncate">
                                        {currentCase 
                                            ? `قضية: ${currentCase.title} (${currentCase.caseNumber || currentCase.internalCaseNumber})` 
                                            : 'نظام الدعم القانوني الفوري'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button 
                                    onClick={() => setIsMinimized(!isMinimized)} 
                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title={isMinimized ? "توسيع" : "تصغير"}
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                                    title="إغلاق"
                                >
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Context Badge Banner if viewing case */}
                                {currentCase && (
                                    <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between text-[10px] text-slate-300 shrink-0">
                                        <span className="flex items-center gap-1.5 font-bold text-accent">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            سياق القضية المحددة: {currentCase.caseMainType || 'عام'}
                                        </span>
                                        <span className="font-mono text-slate-400">{currentCase.courtName || 'المحكمة الكلية'}</span>
                                    </div>
                                )}

                                {/* Quick Action Recommendation Chips */}
                                <div className="px-4 py-2.5 bg-slate-900/30 border-b border-slate-800/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                                    <span className="text-[9px] font-black text-slate-400 shrink-0">مقترحات:</span>
                                    <button 
                                        onClick={() => handleQuickAction('ما هي أهم الثغرات والدفوع المتاحة لمصلحة موكلنا في هذه القضية؟')}
                                        className="px-2.5 py-1 bg-white/5 hover:bg-accent/20 hover:text-accent border border-white/10 text-[10px] font-bold text-slate-300 rounded-lg whitespace-nowrap transition-all"
                                    >
                                        🔍 استخراج الثغرات
                                    </button>
                                    <button 
                                        onClick={() => handleQuickAction('صغ مسودة دفاع مختصرة تستند لمبادئ محكمة التمييز الكويتية')}
                                        className="px-2.5 py-1 bg-white/5 hover:bg-accent/20 hover:text-accent border border-white/10 text-[10px] font-bold text-slate-300 rounded-lg whitespace-nowrap transition-all"
                                    >
                                        📜 مسودة دفاع
                                    </button>
                                    <button 
                                        onClick={() => handleQuickAction('ما هو التوقع القانوني لمنطوق الحكم ونسبة النجاح المقدرة؟')}
                                        className="px-2.5 py-1 bg-white/5 hover:bg-accent/20 hover:text-accent border border-white/10 text-[10px] font-bold text-slate-300 rounded-lg whitespace-nowrap transition-all"
                                    >
                                        ⚡ توقع منطوق الحكم
                                    </button>
                                </div>

                                {/* Chat Messages Container */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
                                    {messages.map((msg) => (
                                        <div 
                                            key={msg.id}
                                            className={cn(
                                                "flex items-start gap-2.5 max-w-[88%]",
                                                msg.sender === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                                                msg.sender === 'user' 
                                                    ? "bg-accent text-slate-950" 
                                                    : "bg-slate-800 text-accent border border-slate-700"
                                            )}>
                                                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </div>

                                            <div className={cn(
                                                "p-3.5 rounded-2xl relative group transition-all",
                                                msg.sender === 'user'
                                                    ? "bg-accent text-slate-950 font-bold rounded-tl-none shadow-md"
                                                    : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tr-none shadow-sm"
                                            )}>
                                                {msg.sender === 'ai' ? (
                                                    <div className="prose prose-invert prose-xs max-w-none space-y-2">
                                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                )}

                                                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-black/10 dark:border-white/5 text-[9px] text-slate-400">
                                                    <span>{msg.timestamp}</span>
                                                    {msg.sender === 'ai' && (
                                                        <button 
                                                            onClick={() => handleCopy(msg.text, msg.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded transition-all text-slate-400 hover:text-white"
                                                            title="نسخ الإجابة"
                                                        >
                                                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 w-fit text-slate-300">
                                            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[11px] font-bold animate-pulse">جاري صياغة الاستشارة القانونية الذكية...</span>
                                        </div>
                                    )}

                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Footer */}
                                <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                                    <form 
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input 
                                            type="text"
                                            placeholder="اكتب استفسارك أو طلبك القانوني هنا..."
                                            value={inputQuery}
                                            onChange={(e) => setInputQuery(e.target.value)}
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                            disabled={isLoading}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!inputQuery.trim() || isLoading}
                                            className="p-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 text-slate-950 font-black rounded-xl transition-all shrink-0"
                                            title="إرسال"
                                        >
                                            <Send className="w-4 h-4 rotate-180" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingAiAssistantWidget;
