import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
    HelpCircle, Plus, Trash, Edit, Check, RotateCcw, 
    BookOpen, HelpCircle as HelpIcon, ArrowUpRight, Search, FileText
} from 'lucide-react';

interface QuestionLibraryTabProps {
    library: Record<string, string[]>;
    onUpdateLibrary: (newLib: Record<string, string[]>) => void;
    onResetLibrary: () => void;
}

export const QuestionLibraryTab: React.FC<QuestionLibraryTabProps> = ({
    library,
    onUpdateLibrary,
    onResetLibrary
}) => {
    const { addToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(library)[0] || 'التأخير والإنصراف');
    const [newQuestionText, setNewQuestionText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Inline editing state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestionText.trim()) {
            addToast({ type: 'warning', title: 'خطأ الإدخال', message: 'يرجى كتابة نص السؤال أولاً.' });
            return;
        }

        const currentQuestions = library[selectedCategory] || [];
        // Add "س: " prefix if not present for compliance look
        let textToAdd = newQuestionText.trim();
        if (!textToAdd.startsWith('س:')) {
            textToAdd = 'س: ' + textToAdd;
        }

        const updatedQuestions = [...currentQuestions, textToAdd];
        const updatedLibrary = {
            ...library,
            [selectedCategory]: updatedQuestions
        };

        onUpdateLibrary(updatedLibrary);
        setNewQuestionText('');
        addToast({ type: 'success', title: 'تمت إضافة سؤال', message: 'تم إلحاق سؤال التحقيق بنجاح بمكتبة فئة (' + selectedCategory + ')' });
    };

    const handleDeleteQuestion = (indexToDelete: number) => {
        const currentQuestions = library[selectedCategory] || [];
        const updatedQuestions = currentQuestions.filter((_, idx) => idx !== indexToDelete);
        
        const updatedLibrary = {
            ...library,
            [selectedCategory]: updatedQuestions
        };

        onUpdateLibrary(updatedLibrary);
        if (editingIndex === indexToDelete) {
            setEditingIndex(null);
        }
        addToast({ type: 'success', title: 'تم حذف السؤال', message: 'تمت إزالة السؤال المختار من اللائحة الاسترشادية.' });
    };

    const startEditing = (idx: number, text: string) => {
        setEditingIndex(idx);
        setEditingText(text);
    };

    const handleSaveEdit = (idxToSave: number) => {
        if (!editingText.trim()) return;
        const currentQuestions = library[selectedCategory] || [];
        
        const updatedQuestions = currentQuestions.map((q, idx) => 
            idx === idxToSave ? editingText.trim() : q
        );

        const updatedLibrary = {
            ...library,
            [selectedCategory]: updatedQuestions
        };

        onUpdateLibrary(updatedLibrary);
        setEditingIndex(null);
        addToast({ type: 'success', title: 'تم تعديل السؤال', message: 'تم تحديث الصياغة القانونية للسؤال بنجاح.' });
    };

    // Filter categories by search
    const categories = Object.keys(library);
    const filteredQuestions = (library[selectedCategory] || []).filter(q => 
        q.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4">
                    <div className="space-y-1">
                        <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            محاور الاستجواب الموثقة
                        </span>
                        <h2 className="text-base font-black text-slate-900 block">إدارة مكتبة الأسئلة الاسترشادية المتكاملة</h2>
                        <p className="text-xs text-slate-500 font-medium">مجموعة الصياغات القانونية والتحقيقية لمواجهة التجاوزات وضمان العدالة الإجرائية.</p>
                    </div>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-amber-700 bg-amber-50 border-amber-200 text-xs font-black self-end md:self-auto"
                        onClick={() => {
                            if (window.confirm('هل أنت متأكد من استعادة مكتبة الأسئلة الافتراضية؟ سيتم إزالة جميع تعديلاتك.')) {
                                onResetLibrary();
                            }
                        }}
                    >
                        <RotateCcw className="w-3.5 h-3.5 ml-1 inline-block" />
                        استعادة الفهرس الأصلي للأسئلة
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Category Selector */}
                    <div className="lg:col-span-1 space-y-3">
                        <div className="bg-slate-50 p-4 rounded-2xl border text-xs font-black text-slate-800">
                            فئات المخالفات القانونية الـ 10
                        </div>

                        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                            {categories.map((cat) => {
                                const count = library[cat]?.length || 0;
                                const isSelected = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setEditingIndex(null);
                                        }}
                                        className={`w-full text-right p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-between group ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-300'}`}></span>
                                            <span>{cat}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono ${isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-500'}`}>
                                            {count} فصول
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Active Category Questions List & Modifiers */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Search and Quick Add Box */}
                        <div className="bg-slate-50/50 p-4 border border-dashed rounded-2xl space-y-3">
                            <div className="flex justify-between items-center gap-2">
                                <h3 className="text-xs font-black text-slate-800">تفرعات فئة: <span className="text-indigo-700 underline decoration-amber-500 decoration-2">{selectedCategory}</span></h3>
                                {/* Fast search filter */}
                                <div className="relative w-48">
                                    <input 
                                        type="text"
                                        placeholder="بحث في الصياغات..."
                                        className="w-full text-[11px] font-bold border rounded-lg bg-white p-1.5 px-2 pl-7 text-right"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2.5" />
                                </div>
                            </div>

                            {/* Add question form inline */}
                            <form onSubmit={handleAddQuestion} className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-grow text-xs font-bold border rounded-xl p-2.5 bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-[11px]"
                                    placeholder="اكتب سؤال مواجهة استرشادي جديد للاستفادة منه في المحاضر..."
                                    value={newQuestionText}
                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                />
                                <Button type="submit" variant="primary" className="bg-slate-900 text-xs font-black rounded-xl">
                                    <Plus className="w-4 h-4 ml-1 inline-block text-amber-400" />
                                    إضافة سؤال
                                </Button>
                            </form>
                        </div>

                        {/* Questions layout queue */}
                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                            {filteredQuestions.length === 0 ? (
                                <div className="p-8 border border-slate-150 rounded-2xl bg-white text-center text-slate-400 text-xs font-bold leading-relaxed">
                                    <HelpIcon className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                                    لا توجد براهين أو أسئلة تحقيق متطابقة مع شروط الفرز الحاصلة.
                                </div>
                            ) : (
                                filteredQuestions.map((q, idx) => {
                                    const isEditing = editingIndex === idx;
                                    return (
                                        <div 
                                            key={idx} 
                                            className="p-3.5 bg-white border rounded-xl flex items-start justify-between gap-3 shadow-sm hover:ring-1 hover:ring-slate-200 transition-all border-r-4 border-r-indigo-500"
                                        >
                                            <div className="flex-grow text-right space-y-1.5">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full text-xs font-bold border rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                        />
                                                        <div className="flex justify-end gap-1.5 pb-1">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="text-[10px]"
                                                                onClick={() => setEditingIndex(null)}
                                                            >
                                                                إلغاء
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary" 
                                                                className="text-[10px] bg-indigo-650"
                                                                onClick={() => handleSaveEdit(idx)}
                                                            >
                                                                <Check className="w-3.5 h-3.5 ml-0.5 inline-block" />
                                                                تأكيد الحفظ
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded inline-block mb-1">
                                                            معيار رقم {idx + 1}
                                                        </span>
                                                        <p className="text-xs font-extrabold text-slate-950 leading-relaxed font-sans">{q}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action modifiers */}
                                            {!isEditing && (
                                                <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                                                    <button 
                                                        onClick={() => startEditing(idx, q)}
                                                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border"
                                                        title="تعديل السؤال"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteQuestion(idx)}
                                                        className="p-1 px-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border"
                                                        title="حذف السؤال"
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction Footer Banner under Kuwaiti legal rigour */}
            <div className="bg-slate-900 border text-white p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <span className="absolute left-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full translate-y-12 -translate-x-6"></span>
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400 animate-pulse" />
                    <h4 className="text-xs font-black">إرشادات تكييف صياغات مواجهة المتهم عمالياً:</h4>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-350 font-bold">
                    بموجب أحكام القضاء الكويتي بخصوص لجان التأديب ومحاضر الشكوى الإدارية تهدف صياغات " س " و " ج " إلى حث الموظف على تفريغ الحجة، ويُنصح المحقق بتفادي الأسئلة الإيحائية أو المنطوية على ترهيب، والحرص الكامل على منح المتهم الحيز التام لتدوين جوابه بصياغته ودياعته الشخصية عمالياً.
                </p>
            </div>
        </div>
    );
};
