import React from 'react';
import { HEIR_CATALOG } from './HeirsTreeCard';
import Modal from '../ui/Modal';
import { Gender } from '../../services/inheritanceEngine';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectHeirType: (typeId: string, gender: Gender, label: string) => void;
    deceasedGender: Gender;
}

export const AddHeirModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSelectHeirType,
    deceasedGender
}) => {
    const categories = [
        { id: 'spouse', title: 'عقد الزوجية القائم' },
        { id: 'descendant', title: 'الفروع (الأولاد والأحفاد)' },
        { id: 'ascendant', title: 'الأصول (الوالدان والأجداد والجدات)' },
        { id: 'sibling', title: 'الحواشي (الإخوة والأخوات)' },
        { id: 'relative', title: 'العصبات النسبية (الأعمام وبنوهم)' }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="إدراج وريث جديد بقائمة المورث"
            size="lg"
        >
            <div className="space-y-6">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    اختر صفة الوارث والقرابة لتنزيله في شجرة التركة وتطبيق قواعد الحجب والفروض الشرعية.
                </p>

                {categories.map(cat => {
                    const items = HEIR_CATALOG.filter(c => c.group === cat.id);
                    // Filter out husband if deceased is male, or wife if deceased is female
                    const validItems = items.filter(c => {
                        if (c.id === 'husband' && deceasedGender === 'M') return false;
                        if (c.id === 'wife' && deceasedGender === 'F') return false;
                        return true;
                    });

                    if (validItems.length === 0) return null;

                    return (
                        <div key={cat.id} className="space-y-2">
                            <h5 className="text-[11px] font-black text-slate-500 dark:text-slate-400 border-r-2 border-slate-400 dark:border-slate-600 pr-2">
                                {cat.title}
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {validItems.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            const defaultGender = item.genders[0] as Gender;
                                            onSelectHeirType(item.id, defaultGender, item.label);
                                            onClose();
                                        }}
                                        className="p-3 text-start bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/60 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 rounded-2xl transition-all flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-bold group"
                                    >
                                        <span className="text-lg bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};
