import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { BriefcaseIcon, BuildingLibraryIcon, CreditCardIcon, BanknotesIcon, PlusCircleIcon } from '../../constants';
import { Edit, Trash2 } from 'lucide-react';

interface DictionarySettingsProps {
  dictionaries: Record<string, string[]>;
  onChange: (updated: Record<string, string[]>) => void;
  accent: any;
}

export const DictionarySettings: React.FC<DictionarySettingsProps> = ({ dictionaries, onChange, accent }) => {
  const { addToast } = useToast();
  const categoriesConfig = [
    { id: 'case_types', title: 'أنواع القضايا وسرود الصيانة', icon: <BriefcaseIcon className="w-5 h-5" /> },
    { id: 'court_levels', title: 'درجات وسدود المحاكم الكلية', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
    { id: 'payment_methods', title: 'طرق قنوات دفع الرسوم', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'expense_cats', title: 'تصنيفات المصاريف ومستنداتها', icon: <BanknotesIcon className="w-5 h-5" /> },
  ];

  const [activeCatId, setActiveCatId] = useState('case_types');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [editItemValue, setEditItemValue] = useState('');

  const activeCat = categoriesConfig.find(c => c.id === activeCatId) || categoriesConfig[0];
  const items = dictionaries[activeCatId] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const value = newItemValue.trim();
    if (!value) return;
    if (items.includes(value)) {
      addToast({ type: 'error', title: 'تكرار بالقواميس', message: 'هذا العنصر مدرج سلفاً بالقائمة.' });
      return;
    }
    const updated = { ...dictionaries, [activeCatId]: [...items, value] };
    onChange(updated);
    localStorage.setItem('adala_dictionaries', JSON.stringify(updated));
    setNewItemValue('');
    setIsAddOpen(false);
    addToast({ type: 'success', title: 'تم استيفاء الإضافة', message: 'تم إدراج المصطلح في نظام الأتمتة والدفع.' });
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    const value = editItemValue.trim();
    if (!value || selectedItemIndex === null) return;
    if (items.includes(value) && items[selectedItemIndex] !== value) {
      addToast({ type: 'error', title: 'تكرار بالصياغة', message: 'هذا الخيار متوفر مسبقاً.' });
      return;
    }
    const newItems = [...items];
    newItems[selectedItemIndex] = value;
    const updated = { ...dictionaries, [activeCatId]: newItems };
    onChange(updated);
    localStorage.setItem('adala_dictionaries', JSON.stringify(updated));
    setEditItemValue('');
    setSelectedItemIndex(null);
    setIsEditOpen(false);
    addToast({ type: 'success', title: 'تم التحديث الفوري', message: 'تم إعادة بناء المصطلح وتعديله بمحركات البحث.' });
  };

  const handleDeleteItem = (index: number) => {
    const itemVal = items[index];
    if (confirm(`هل أنت متأكد من رغبتك بشطب "${itemVal}" من قائمة ${activeCat.title}؟`)) {
      const newItems = items.filter((_, idx) => idx !== index);
      const updated = { ...dictionaries, [activeCatId]: newItems };
      onChange(updated);
      localStorage.setItem('adala_dictionaries', JSON.stringify(updated));
      addToast({ type: 'info', title: 'تم الحفظ والمحو', message: 'تمت إزالة المصطلح بنجاح.' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-2">
        {categoriesConfig.map(cat => {
          const count = (dictionaries[cat.id] || []).length;
          const isSelected = activeCatId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={`w-full p-4 rounded-2xl border text-right flex items-center gap-3 transition-all ${
                isSelected
                  ? `${accent.bg} text-white shadow-md`
                  : 'bg-white border-slate-200/80 hover:border-indigo-300 dark:bg-dm-card dark:border-slate-800'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-50 dark:bg-dm-background text-indigo-600'}`}>
                {cat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate block ${isSelected ? 'text-white' : 'text-slate-900 dark:text-dm-text'}`}>
                  {cat.title.split(' ')[0]}
                </p>
                <p className={`text-[10px] font-medium block ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{count} عنصر صيانة</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-3">
        <Card className="p-6 md:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card space-y-6 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-dm-text">{activeCat.title}</h4>
              <p className="text-xs text-slate-400 font-medium">إدارة الخيارات المتوفرة في القوائم المنسدلة للتسهيل ومحركات الأتمتة</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className={`rounded-xl px-5 font-bold ${accent.bg} ${accent.hoverBg}`}
              leftIcon={<PlusCircleIcon className="w-4 h-4" />}
              onClick={() => {
                setNewItemValue('');
                setIsAddOpen(true);
              }}
            >
              إضافة عنصر جديد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-200 transition-all group"
              >
                <span className="font-bold text-xs text-slate-900 dark:text-dm-text">{item}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    className="p-1.5 text-indigo-600 hover:bg-white rounded hover:shadow-sm"
                    onClick={() => {
                      setSelectedItemIndex(i);
                      setEditItemValue(item);
                      setIsEditOpen(true);
                    }}
                    title="تعديل المصطلح"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-rose-500 hover:bg-white rounded hover:shadow-sm"
                    onClick={() => handleDeleteItem(i)}
                    title="حذف المصطلح"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ADD AND EDIT DIC MODALS */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={`إضافة عنصر جديد لـ ${activeCat.title.split(' ')[0]}`}>
        <form onSubmit={handleAddItem} className="space-y-6">
          <Input
            label="اسم الصياغة أو المصطلح"
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            required
            placeholder="مثال: تجاري أو تمييز"
            className="rounded-xl bg-slate-50 border-slate-200 h-12"
          />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" className={accent.bg}>
              إدراج للقالب
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="تعديل صياغة الخيار بالقواميس">
        <form onSubmit={handleEditItem} className="space-y-6">
          <Input
            label="القيمة الحالية المعدلة"
            value={editItemValue}
            onChange={(e) => setEditItemValue(e.target.value)}
            required
            className="rounded-xl bg-slate-50 border-slate-200 h-12"
          />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" className={accent.bg}>
              حفظ المترادفة
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
