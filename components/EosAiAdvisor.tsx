import React, { useState } from 'react';
import { Bot, Send, Sparkles, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';

export const EosAiAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'مرحباً بك! أنا مستشارك القانوني الذكي لمنصة "عدالة". يمكنك سؤالي عن أي شيء يخص قانون العمل الكويتي (رقم 6 لسنة 2010)، لاسيما احتساب مكافأة نهاية الخدمة، مستحقات الاستقالة، الأجر الشامل، رصيد الإجازات السنوية، والنزاعات العمالية أمام الهيئة العامة للقوى العاملة والمحاكم الكويتية. ⚖️'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const sampleQueries = [
    {
      title: 'استقالة المرأة للزواج 💍',
      query: 'كيف يتم احتساب مكافأة نهاية الخدمة للمرأة إذا استقالت بسبب زواجها في القانون الكويتي؟ وما هو السند القانوني لذلك؟'
    },
    {
      title: 'مقسم الـ 26 يوماً ⚖️',
      query: 'ما هو حكم محكمة التمييز الكويتية بخصوص استخدام مقسم 26 يوماً بدلاً من 30 يوماً لاحتساب الأجر اليومي لمكافأة نهاية الخدمة ومستحقات الإجازات؟'
    },
    {
      title: 'العناصر الداخلة بالأجر 💰',
      query: 'هل البدلات مثل السكن، الانتقال، وتذاكر السفر، بالإضافة للعمولات والمكافآت السنوية، تدخل ضمن الأجر الشامل لاحتساب نهاية الخدمة بموجب المادة 62؟'
    },
    {
      title: 'الفصل التأديبي (المادة 41) 🚨',
      query: 'ما هي الأسباب والمخالفات الصريحة بموجب المادة 41 من قانون العمل الكويتي التي تتيح لرب العمل فصل العامل فوراً وحرمانه من مكافأة نهاية الخدمة؟'
    }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const newMessages = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInputText('');
    setIsGenerating(true);

    const systemPrompt = `أنت مستشار قانوني كويتي خبير وضليع جداً في قانون العمل في القطاع الأهلي بدولة الكويت (القانون رقم 6 لسنة 2010 وتحديثاته الأخيرة وأحكام محكمة التمييز المستقرة).
مهمتك إعطاء إجابات رصينة، بليغة، دقيقة قانونياً، وواضحة جداً للرد على أسئلة مستخدمي النظام (المحامين، مدراء الموارد البشرية، وأصحاب العمل).
يرجى توثيق إجابتك بالإشارة إلى أرقام المواد القانونية دائماً (مثل المادة 51، 53، 54، 62، 70، 72) وتوضيح طريقة الحساب وموقف القضاء الكويتي.
لا تستخدم مصطلحات من قوانين دول أخرى كـ "سعودي" أو "إماراتي" أو "مصري" - الإجابة يجب أن تكون كويتية خالصة 100%.`;

    const fullPrompt = `${systemPrompt}\n\nالسؤال العمالي الكويتي: ${textToSend}`;

    try {
      const response = await geminiService.getChatbotResponse(fullPrompt);
      setMessages(prev => [...prev, { sender: 'ai' as const, text: response }]);
    } catch (error: any) {
      console.error(error);
      const isQuota = error.isQuota;
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: isQuota
            ? 'عذراً، لقد تجاوزنا الحد المسموح للطلبات حالياً على خادم الذكاء الاصطناعي. الرجاء المحاولة مجدداً بعد دقيقة، أو يمكنك الاعتماد على دليل المواد القانونية الجاهز بالتبويب المجاور.'
            : 'عذراً، حدث خطأ غير متوقع أثناء التواصل مع خادم الذكاء الاصطناعي. يرجى مراجعة اتصال الإنترنت الخاص بك وإعادة المحاولة.'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'تمت إعادة ضبط المستشار القانوني. كيف يمكنني مساعدتك اليوم في شؤون العمل وقانون العمل الكويتي؟ ⚖️'
      }
    ]);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs text-right space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>المستشار العمالي والذكاء الاصطناعي التفاعلي</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                توليد فوري ⚡
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              استشر الذكاء الاصطناعي في حالات الاستقالة الخاصة، الأجر الشامل، الخلافات العمالية، وحقوق صاحب العمل والعمال
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>مسح المحادثة</span>
        </button>
      </div>

      {/* Suggested Queries */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 block">أسئلة واستشارات شائعة جاهزة للاستعلام السريع:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendMessage(item.query)}
              className="text-right p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-950 text-xs font-semibold cursor-pointer transition-all flex items-start gap-2 group disabled:opacity-50"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 group-hover:text-indigo-700" />
              <span className="leading-normal">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Display Container */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[320px] max-h-[480px] overflow-y-auto space-y-4 flex flex-col">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-start' : 'justify-end'} w-full`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed font-medium shadow-3xs ${
                    isUser
                      ? 'bg-slate-100 text-slate-800 rounded-br-xs text-right'
                      : 'bg-emerald-800 text-emerald-50 rounded-bl-xs text-right border border-emerald-900/10'
                  }`}
                >
                  {!isUser && (
                    <span className="text-[9px] text-emerald-300 font-extrabold flex items-center gap-1 mb-1 border-b border-emerald-700/40 pb-1">
                      <Bot className="w-3.5 h-3.5" />
                      <span>عدالة: مستشار قانون كويتي</span>
                    </span>
                  )}
                  {isUser && (
                    <span className="text-[9px] text-slate-400 font-extrabold flex items-center gap-1 mb-1 border-b border-slate-200 pb-1">
                      <span>سؤال المستعلم</span>
                    </span>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isGenerating && (
          <div className="flex justify-end w-full animate-pulse">
            <div className="bg-emerald-800/10 text-emerald-900 rounded-2xl rounded-bl-xs p-4 max-w-[80%] border border-emerald-200/40 flex items-center gap-3">
              <div className="flex space-x-1 space-x-reverse">
                <span className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce delay-200"></span>
                <span className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce delay-300"></span>
              </div>
              <span className="text-xs font-bold text-emerald-800">يقوم المستشار القانوني بتحليل السؤال وتفنيد مواد القانون الكويتي...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isGenerating || !inputText.trim()}
          onClick={() => handleSendMessage(inputText)}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs h-12 w-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0 disabled:text-slate-400"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputText);
          }}
          disabled={isGenerating}
          placeholder="اطرح أي سؤال حول قانون العمل الكويتي (مثال: ما عقوبة تأخير الرواتب؟)"
          className="w-full text-xs font-semibold h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-right disabled:opacity-60"
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-100 p-3 rounded-xl text-[10px] text-amber-800 leading-normal font-semibold">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          تنويه قانوني: يتم توليد التفسيرات والاستشارات من خلال نماذج الذكاء الاصطناعي المدرّبة على قانون العمل الكويتي. يوصى دائماً بالرجوع للمستندات الأصلية ومحامي المتابعة كالمستشار صبري شطا للتدقيق النهائي للخصومات والمنازعات المعقدة.
        </span>
      </div>

    </div>
  );
};
