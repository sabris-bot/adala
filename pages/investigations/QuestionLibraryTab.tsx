import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    BookOpen, Search, Plus, Sparkles, Scale, Copy, Check, 
    ChevronLeft, HelpCircle, Shield, AlertCircle
} from 'lucide-react';
import { initialQuestionsLibrary } from './data';

interface QuestionLibraryTabProps {
    library?: Record<string, string[]>;
    onInjectQuestion: (qText: string) => void;
    addToast: (toast: { type: string; title: string; message: string }) => void;
}

export const QuestionLibraryTab: React.FC<QuestionLibraryTabProps> = ({
    library = initialQuestionsLibrary,
    onInjectQuestion,
    addToast
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

    const categories = Object.keys(library);

    // Filter questions
    const filteredQuestions: { category: string; question: string; index: number }[] = [];

    categories.forEach(cat => {
        if (selectedCategory === 'ALL' || selectedCategory === cat) {
            library[cat].forEach((q, idx) => {
                if (!searchQuery.trim() || q.toLowerCase().includes(searchQuery.toLowerCase()) || cat.toLowerCase().includes(searchQuery.toLowerCase())) {
                    filteredQuestions.push({
                        category: cat,
                        question: q,
                        index: idx
                    });
                }
            });
        }
    });

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        addToast({
            type: 'success',
            title: 'تم النسخ',
            message: 'تم نسخ نص السؤال الاستقصائي إلى الحافظة.'
        });
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleInject = (q: string) => {
        onInjectQuestion(q);
        addToast({
            type: 'success',
            title: 'تم إدراج السؤال',
            message: 'تم إلحاق السؤال مباشرة في محرر جلسة التحقيق الحالية.'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in text-right font-sans" style={{ direction: 'rtl' }}>
            {/* Header Description */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <BookOpen className="w-5 h-5" />
                    </span>
                    <div>
                        <h2 className="text-base font-black text-white">بنك الأسئلة الاستقصائية والضمانات اللائحية</h2>
                        <p className="text-xs text-slate-300">مكتبة مرجعية لأسئلة التحقيق المعتمدة وفق أحكام قانون العمل الكويتي رقم 6 لسنة 2010 واللوائح التأديبية</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ابحث في نصوص الأسئلة، الكلمات المفتاحية، أو الوقائع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 transition-all outline-none"
                        />
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                selectedCategory === 'ALL'
                                    ? 'bg-slate-900 text-amber-400 shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            الكل ({Object.values(library).reduce((acc, curr) => acc + curr.length, 0)})
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedCategory === cat
                                        ? 'bg-amber-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.length === 0 ? (
                    <div className="col-span-2 p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                        <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">لا توجد أسئلة تطابق معايير البحث الحالية.</p>
                        <p className="text-[11px] text-slate-400">جرب استخدام كلمات بحث بديلة أو اختيار تصنيف مختلف.</p>
                    </div>
                ) : (
                    filteredQuestions.map((item, idx) => {
                        const uniqueId = `${item.category}-${item.index}`;
                        const isCopied = copiedIndex === uniqueId;
                        return (
                            <div 
                                key={idx}
                                className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-amber-400/80 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-md">
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            #Q-{idx + 1}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">
                                        {item.question}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => handleCopy(item.question, uniqueId)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-emerald-700">تم النسخ</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>نسخ</span>
                                            </>
                                        )}
                                    </button>

                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="text-[11px] font-black rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-1"
                                        onClick={() => handleInject(item.question)}
                                    >
                                        <Plus className="w-3.5 h-3.5 ml-1 inline-block" />
                                        إدراج بالمحضر
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
