
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import { 
  SparklesIcon, InformationCircleIcon, LightBulbIcon, CpuChipIcon, 
  BookOpenIcon, ClipboardIcon, PrinterIcon, PaperClipIcon, CameraIcon, 
  XCircleIcon, DocumentTextIcon, EnvelopeIcon, SendIcon, TrashIcon,
  SearchIcon, ScaleIcon, FileEditIcon, HistoryIcon
} from '../constants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  file?: {
    name: string;
    type: string;
    preview?: string;
  };
}

const SuggestionChip: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
  <button 
    onClick={onClick}
    className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full text-[10px] sm:text-xs text-primary-dark transition-all whitespace-nowrap"
  >
    {text}
  </button>
);

const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'consult' | 'research' | 'draft' | 'analyze'>('consult');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        if (base64Data) resolve({ base64Data, mimeType: file.type });
        else reject(new Error("Failed to extract base64 data."));
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && !selectedFile) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      file: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        preview: filePreview || undefined
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentSelectedFile = selectedFile;
    setSelectedFile(null);
    setFilePreview(null);
    setIsLoading(true);

    try {
      let fileInput = undefined;
      if (currentSelectedFile) {
        fileInput = await fileToBase64(currentSelectedFile);
      }

      // Convert history to service format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const aiResponse = await geminiService.getChatbotResponse(textToSend, history, fileInput);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('هل أنت متأكد من رغبتك في مسح المحادثة بالكامل؟')) {
      setMessages([]);
    }
  };

  const suggestions = {
    consult: ["ما هي شروط استحقاق مكافأة نهاية الخدمة؟", "كيف يتم تسجيل علامة تجارية في الكويت؟", "ما هي عقوبة التشهير الإلكتروني؟"],
    research: ["ابحث عن أحكام حديثة في التعويض المعنوي", "ما هي آخر تعديلات قانون الشركات الكويتي؟", "مقالة قانونية عن القوة القاهرة"],
    draft: ["صغ لي مسودة عقد إيجار محل تجاري", "اكتب إخطاراً قانونياً لعدم سداد ديون", "صياغة بند التحكيم في العقود الدولية"],
    analyze: ["لخص هذا المستند المرفق واذكر أهم الالتزامات", "تأكد من مطابقة هذا العقد لـ قانون العمل الكويتي", "استخرج التواريخ الهامة من محضر الاجتماع"]
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[900px] overflow-hidden bg-white dark:bg-dm-background rounded-2xl shadow-xl border border-gray-100 dark:border-secondary-dark font-sans chat-print-container">
      {/* Header */}
      <div className="p-4 border-b dark:border-secondary-dark flex justify-between items-center bg-gray-50/50 dark:bg-dm-card/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg text-white">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-dark dark:text-primary-light">عدالة AI • المساعد القانوني</h1>
            <p className="text-[10px] text-gray-500">مدعوم بتقنيات Gemini المتقدمة لصناعة القانون</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-gray-400 hover:text-primary print-hide" title="طباعة المحادثة">
                <PrinterIcon className="w-4 h-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-400 hover:text-red-500 print-hide" title="مسح المحادثة">
                <TrashIcon className="w-4 h-4"/>
            </Button>
            <div className="hidden sm:flex bg-gray-200 dark:bg-dm-card p-1 rounded-lg">
                {[
                    { id: 'consult', icon: <ScaleIcon className="w-3.5 h-3.5"/>, label: 'استشارة' },
                    { id: 'research', icon: <SearchIcon className="w-3.5 h-3.5"/>, label: 'بحث' },
                    { id: 'draft', icon: <FileEditIcon className="w-3.5 h-3.5"/>, label: 'صياغة' },
                    { id: 'analyze', icon: <DocumentTextIcon className="w-3.5 h-3.5"/>, label: 'تحليل' },
                ].map(mode => (
                    <button 
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeMode === mode.id ? 'bg-white dark:bg-primary/20 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {mode.icon} {mode.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin dark:scrollbar-dark bg-white dark:bg-dm-background chat-messages-print-area">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto opacity-0 animate-fadeIn">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <CpuChipIcon className="w-12 h-12" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light">مرحباً بك في الذكاء القانوني</h2>
                <p className="text-sm text-gray-600 dark:text-dm-text-light">أنا مساعدك الآلي المتخصص في التشريعات الكويتية والعربية. كيف يمكنني دعم عملك القانوني اليوم؟</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="p-4 border dark:border-secondary-dark rounded-xl bg-gray-50/50 dark:bg-dm-card/30 text-right hover:border-primary transition-colors cursor-help group">
                    <LightBulbIcon className="w-6 h-6 text-yellow-500 mb-2 group-hover:scale-110 transition-transform"/>
                    <h3 className="font-bold text-sm mb-1">الاستشارات السريعة</h3>
                    <p className="text-xs text-gray-500">اطرح أي سؤال حول نصوص القوانين أو الإجراءات القضائية.</p>
                </div>
                <div className="p-4 border dark:border-secondary-dark rounded-xl bg-gray-50/50 dark:bg-dm-card/30 text-right hover:border-primary transition-colors cursor-help group">
                    <DocumentTextIcon className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform"/>
                    <h3 className="font-bold text-sm mb-1">تحليل المستندات</h3>
                    <p className="text-xs text-gray-500">ارفع عقدك أو مذكرتك للحصول على ملخص فوري وتدقيق للمخاطر.</p>
                </div>
            </div>
            
            <div className="space-y-2 w-full">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">اقتراحات للبدء:</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {suggestions[activeMode].map((s, idx) => (
                        <SuggestionChip key={idx} text={s} onClick={() => handleSendMessage(s)}/>
                    ))}
                 </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm relative group message-bubble-print ${
                  msg.role === 'user' 
                  ? 'bg-primary text-white rounded-te-none' 
                  : 'bg-white dark:bg-dm-card border dark:border-secondary-dark rounded-ts-none'
                }`}>
                  {msg.file && (
                    <div className={`mb-3 p-2 rounded-lg flex items-center gap-2 text-xs border ${msg.role === 'user' ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                        {msg.file.preview ? (
                            <img src={msg.file.preview} alt="file" className="w-8 h-8 rounded object-cover" />
                        ) : (
                            <DocumentTextIcon className="w-6 h-6 opacity-60" />
                        )}
                        <div className="overflow-hidden">
                            <p className="font-bold truncate">{msg.file.name}</p>
                            <p className="opacity-60 uppercase">{msg.file.type.split('/')[1]}</p>
                        </div>
                    </div>
                  )}
                  
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'model' ? 'markdown-body dark:text-dm-text chatbot-md' : 'text-white'}`}>
                    {msg.role === 'model' ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : msg.text}
                  </div>
                  
                  <div className={`mt-2 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'text-white' : 'text-gray-500'}`}>
                    <span className="text-[9px]">{format(msg.timestamp, 'HH:mm', { locale: ar })}</span>
                    {msg.role === 'model' && (
                        <div className="flex gap-2">
                            <button onClick={() => navigator.clipboard.writeText(msg.text)} title="نسخ"><ClipboardIcon className="w-3 h-3 hover:text-primary cursor-pointer"/></button>
                            <button onClick={() => window.print()} title="طباعة"><PrinterIcon className="w-3 h-3 hover:text-primary cursor-pointer"/></button>
                        </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                 <div className="bg-gray-100 dark:bg-dm-card p-4 rounded-2xl rounded-ts-none flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs text-gray-500 animate-pulse">جاري تفكير عدالة AI...</span>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t dark:border-secondary-dark bg-gray-50/50 dark:bg-dm-card/30 print-hide">
        <div className="max-w-4xl mx-auto space-y-3">
             {/* Action Suggestions (Mini) */}
            {messages.length > 0 && messages[messages.length - 1].role === 'model' && !isLoading && (
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {activeMode === 'consult' && <SuggestionChip text="هل من سوابق قضائية؟" onClick={() => setInput("هل توجد سوابق قضائية مشهورة في الكويت بخصوص هذا الموضوع؟")}/>}
                    {activeMode === 'analyze' && <SuggestionChip text="اقتراحات لتحسين البنود" onClick={() => setInput("ما هي اقتراحاتك لتحسين هذا المستند ليكون أكثر حماية لمصالحنا؟")}/>}
                    <SuggestionChip text="لخص النقاط الأساسية" onClick={() => setInput("هل يمكنك تلخيص النقاط الأساسية في نقاط محددة؟")}/>
                    <SuggestionChip text="صياغة خطاب رسمي" onClick={() => setInput("صغ لي خطاباً رسمياً بناءً على المعلومات المذكورة")}/>
                 </div>
            )}

            {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg animate-fadeIn text-xs text-primary">
                    <div className="flex-grow flex items-center gap-2 truncate">
                         {filePreview ? <img src={filePreview} className="w-6 h-6 rounded" /> : <DocumentTextIcon className="w-5 h-5"/>}
                         <span className="truncate font-bold">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="hover:text-red-500"><XCircleIcon className="w-4 h-4"/></button>
                </div>
            )}

            <div className="relative flex items-end gap-2 bg-white dark:bg-dm-background p-2 rounded-xl border-2 border-gray-100 dark:border-secondary-dark focus-within:border-primary transition-all shadow-sm">
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                        title="إرفاق مستند"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>
                    {/* Hide camera on desktop if needed, or keep for mobile */}
                    <button 
                        className="p-2 text-gray-400 hover:text-primary transition-colors hidden sm:block"
                        title="مسح ضوئي"
                    >
                        <CameraIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <textarea 
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="اكتب استفسارك القانوني هنا..."
                    className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 min-h-[40px] dark:text-dm-text scrollbar-thin overflow-y-auto"
                />
                
                <button 
                    onClick={() => handleSendMessage()}
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className={`p-2.5 rounded-lg transition-all ${(!input.trim() && !selectedFile) || isLoading ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white hover:bg-primary-dark shadow-md active:scale-95'}`}
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : <SendIcon className="w-5 h-5" />}
                </button>
            </div>
            
            <p className="text-[10px] text-center text-gray-400 px-4">
                إخلاء مسؤولية: مساعد عدالة AI يوفر معلومات إرشادية بناءً على القوانين والممارسات العامة. لا يغني هذا عن الاستشارة القانونية الاحترافية.
            </p>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.doc,.docx,image/*" 
      />
    </div>
  );
};

export default AiAssistantPage;
