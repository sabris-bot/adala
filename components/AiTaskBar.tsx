import React, { useState } from 'react';
import { motion } from 'motion/react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { Hearing } from '../types';

interface AiTaskBarProps {
  onParseAndFill: (parsedForm: Partial<Hearing>) => void;
}

const QUICK_PROMPTS = [
  '⚡ جلسة مستعجلة للمحكمة التجارية بالرقعي غداً الساعة 09:30',
  '⚖️ مرافعة أمام خبير أحوال شخصية حولي بعد غد 10:00 الموكل شركة الأمل',
  '🏛️ استئناف مدني كلي بقصر العدل الأسبوع القادم الساعة 09:00',
  '📋 تقديم مذكرات دفاع جزائي لمجمع محاكم الفروانية 11:00'
];

export const AiTaskBar: React.FC<AiTaskBarProps> = ({ onParseAndFill }) => {
  const { addToast } = useToast();
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parseNaturalLanguage = (text: string) => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const today = new Date();
      let targetDate = new Date();

      if (text.includes('غداً') || text.includes('غدا')) {
        targetDate.setDate(today.getDate() + 1);
      } else if (text.includes('بعد غد')) {
        targetDate.setDate(today.getDate() + 2);
      } else if (text.includes('الأسبوع القادم')) {
        targetDate.setDate(today.getDate() + 7);
      }

      // Time extraction
      const timeMatch = text.match(/(\d{1,2}:\d{2})/);
      const timeStr = timeMatch ? timeMatch[1].padStart(5, '0') : '09:30';

      // Court location extraction
      let courtLocation = 'قصر العدل قاعة 14';
      if (text.includes('الرقعي') || text.includes('الفروانية')) {
        courtLocation = 'مجمع محاكم الفروانية بالرقعي - قاعة 8';
      } else if (text.includes('حولي')) {
        courtLocation = 'مجمع محاكم حولي - قاعة الأسرة 3';
      } else if (text.includes('الأحمدي')) {
        courtLocation = 'مجمع محاكم الأحمدي - قاعة 12';
      } else if (text.includes('الجهراء')) {
        courtLocation = 'مجمع محاكم الجهراء - قاعة 5';
      }

      // Hearing type & notes
      let hearingType = 'جلسة مرافعة وتقديم مذكرات';
      if (text.includes('مستعجلة')) {
        hearingType = 'جلسة أمور مستعجلة وحاسمة';
      } else if (text.includes('خبير')) {
        hearingType = 'جلسة خبراء ودراسة التقرير الحسابي';
      } else if (text.includes('استئناف')) {
        hearingType = 'جلسة نظر استئناف مدني/تجاري';
      } else if (text.includes('جزائي')) {
        hearingType = 'جلسة محاكمة جزائية ومرافعة شفهية';
      }

      // Client name parsing
      let clientName = 'شركة الأمل الدولية';
      if (text.includes('الموكل')) {
        const clientPart = text.split('الموكل')[1]?.trim();
        if (clientPart) clientName = clientPart.split(' ')[0] + ' ' + (clientPart.split(' ')[1] || '');
      }

      const parsedForm: Partial<Hearing> = {
        caseId: '1',
        caseTitle: `دعوى قضائية - ${hearingType}`,
        clientName: clientName,
        date: targetDate.toISOString().split('T')[0],
        time: timeStr,
        courtRoomOrLocation: courtLocation,
        type: hearingType,
        status: 'Scheduled',
        notes: `تم التخليق والتعبئة تلقائياً بالذكاء الاصطناعي بناءً على الاستعلام: "${text}"`,
        courtDecision: 'مدرج بجدول الرول التلقائي'
      };

      setIsAnalyzing(false);
      onParseAndFill(parsedForm);

      addToast({
        type: 'success',
        title: '🪄 تعبئة تلقائية بالذكاء الاصطناعي',
        message: 'تم استخراج بيانات الجلسة وتعبئتها في نموذج الإضافة بنجاح!'
      });
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      addToast({ type: 'error', title: 'حقل فارغ', message: 'يرجى إدخال نص الاستعلام الذكي أولاً.' });
      return;
    }
    parseNaturalLanguage(promptText);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 rounded-3xl border border-emerald-500/30 shadow-lg space-y-3">
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
            🪄
          </span>
          <div>
            <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
              شريط مهام الذكاء الاصطناعي (AI Task Bar)
            </h3>
            <p className="text-[10px] text-emerald-300 font-medium">
              أدخل نصاً طبيعياً لجدولة وتعبئة بيانات الجلسة بالرول تلقائياً
            </p>
          </div>
        </div>

        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
          ⚡ معالج ذكي للغة الطبيعية
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="مثال: جدولة جلسة مستعجلة للمحكمة التجارية بالرقعي غداً الساعة 10:30 الموكل شركة الأمل..."
            className="w-full text-xs bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-2xl py-2.5 px-4 text-white font-medium outline-none transition-all placeholder:text-slate-500"
          />
          {promptText && (
            <button 
              type="button" 
              onClick={() => setPromptText('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isAnalyzing}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-1 animate-pulse">جاري التحليل...</span>
          ) : (
            <>🪄 تعبئة نموذج الجلسة</>
          )}
        </Button>
      </form>

      {/* Quick Prompts Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-slate-400 font-bold me-1">أمثلة سريعة:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button 
            key={idx}
            type="button"
            onClick={() => {
              setPromptText(prompt);
              parseNaturalLanguage(prompt);
            }}
            className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl border border-slate-700/60 transition-all text-right"
          >
            {prompt}
          </button>
        ))}
      </div>

    </div>
  );
};

export default AiTaskBar;
