
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { ComplianceStatusBadge, CompliancePriorityBadge, Badge } from '../components/ui/Badge';
import { 
    ShieldCheckIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, MagnifyingGlassIcon, FunnelIcon,
    ArrowDownTrayIcon, PrinterIcon, SparklesIcon, CalendarDaysIcon,
    ClockIcon, ExclamationTriangleIcon, CheckBadgeIcon, ChartBarIcon,
    ArrowPathIcon, AdjustmentsHorizontalIcon, DocumentTextIcon,
    ArrowUpCircleIcon, ArrowDownCircleIcon, Squares2X2Icon
} from '../constants';
import { 
    ComplianceRequirement, ComplianceCategory, ComplianceStatus, 
    ComplianceFrequency, CompliancePriority 
} from '../types';
import { 
    complianceCategoryOptions, complianceStatusOptions, 
    complianceFrequencyOptions, compliancePriorityOptions 
} from '../constants';

// --- Data ---
export const initialComplianceData: ComplianceRequirement[] = [
  {
    id: 'comp1',
    title: 'تجديد الرخصة التجارية السنوية',
    description: 'تجديد الرخصة التجارية للمؤسسة قبل تاريخ انتهاء صلاحيتها لضمان قانونية العمليات.',
    category: ComplianceCategory.LICENSES,
    authority: 'وزارة التجارة والصناعة',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-12-15',
    status: ComplianceStatus.SCHEDULED,
    priority: CompliancePriority.HIGH,
    assignedTo: 'أحمد محمود',
    nextReviewDate: '2024-11-01',
    evidenceLink: 'https://example.com/license-docs/1',
    createdAt: '2024-01-10',
  },
  {
    id: 'comp2',
    title: 'تقديم الإقرار الضريبي الربع سنوي',
    description: 'إعداد وتقديم الإقرار الضريبي للربع الثالث من العام المالي لتجنب الغرامات المالية.',
    category: ComplianceCategory.TAX,
    authority: 'الهيئة العامة للضرائب',
    frequency: ComplianceFrequency.QUARTERLY,
    dueDate: '2024-10-25',
    status: ComplianceStatus.IN_PROGRESS,
    priority: CompliancePriority.CRITICAL,
    assignedTo: 'ليلى إبراهيم',
    lastReviewDate: '2024-09-20',
    nextReviewDate: '2024-10-15',
    createdAt: '2024-02-15',
  },
  {
    id: 'comp3',
    title: 'تحديث سياسة حماية البيانات',
    description: 'مراجعة وتحديث سياسة حماية البيانات لتتوافق مع اللوائح الجديدة وإرشادات الخصوصية.',
    category: ComplianceCategory.DATA_PROTECTION,
    authority: 'هيئة حماية البيانات',
    frequency: ComplianceFrequency.AS_NEEDED,
    status: ComplianceStatus.COMPLIANT,
    priority: CompliancePriority.MEDIUM,
    assignedTo: 'سعد العتيبي',
    lastReviewDate: '2024-06-30',
    evidenceLink: 'https://example.com/policy/data-protection-v2.pdf',
    createdAt: '2024-03-20',
    updatedAt: '2024-06-30',
  },
  {
    id: 'comp4',
    title: 'التدريب السنوي على مكافحة غسيل الأموال',
    description: 'إجراء دورة تدريبية إلزامية لجميع الموظفين المعنيين للالتزام بالمعايير القانونية الدولية.',
    category: ComplianceCategory.ANTI_MONEY_LAUNDERING,
    authority: 'وحدة التحريات المالية',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-05-30',
    status: ComplianceStatus.OVERDUE,
    priority: CompliancePriority.HIGH,
    assignedTo: 'مريم الجابر',
    nextReviewDate: '2024-10-01',
    notes: 'تم تجاوز الموعد، يجب الإسراع في التنفيذ لتجنب المساءلة القانونية.',
    createdAt: '2024-04-01',
  },
  {
    id: 'comp10',
    title: 'إيداع البيانات المالية السنوية المدققة',
    description: 'تقديم نسخة من البيانات المالية المدققة عن السنة المالية المنتهية إلى الوكالات التنظيمية.',
    category: ComplianceCategory.FINANCIAL_REPORTING,
    authority: 'وزارة المالية',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-04-30',
    status: ComplianceStatus.COMPLIANT,
    priority: CompliancePriority.CRITICAL,
    assignedTo: 'يوسف العبدالله',
    notes: 'تم الانتهاء من التدقيق الخارجي.',
    createdAt: '2024-01-20',
  },
];

// --- Helpers ---
const StatCard = ({ label, value, icon, trend, trendValue, color, bg }: any) => (
    <motion.div 
        whileHover={{ scale: 1.02, y: -5 }}
        className={`${bg} p-6 rounded-[32px] border border-transparent shadow-sm relative overflow-hidden group`}
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
            {React.cloneElement(icon, { className: "w-32 h-32" })}
        </div>
        <div className="relative z-10">
            <div className={`p-4 rounded-2xl bg-white shadow-xl shadow-${color}/5 w-fit mb-4 text-${color}`}>
                {icon}
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none mb-1 tracking-tighter">{value}</p>
            <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {trendValue}
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const ComplianceRequirementRow = React.forwardRef<HTMLTableRowElement, { item: ComplianceRequirement; onView: (i: any) => void; onEdit: (i: any) => void; onDelete: (id: string) => void }>(({ item, onView, onEdit, onDelete }, ref) => {
    const { t } = useTranslation();
    return (
        <motion.tr 
            ref={ref}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hover:bg-gray-50/50 dark:hover:bg-dm-background/50 transition-colors group"
        >
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${
                        item.status === ComplianceStatus.OVERDUE ? 'bg-red-500' : 
                        item.status === ComplianceStatus.IN_PROGRESS ? 'bg-amber-500' : 
                        'bg-emerald-500'
                    }`} />
                    <div>
                        <p className="font-black text-gray-900 dark:text-dm-text text-sm leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => onView(item)}>{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <FolderIcon className="w-3 h-3"/> {item.category}
                        </p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-xs font-bold text-gray-600 dark:text-dm-text/70">{item.authority}</td>
            <td className="p-4">
                <div className="flex flex-col">
                    <span className={`text-[11px] font-mono font-black ${
                        item.dueDate && new Date(item.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500'
                    }`}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString(t('date_locale', { defaultValue: 'en-GB' })) : '-'}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.frequency}</span>
                </div>
            </td>
            <td className="p-4"><CompliancePriorityBadge priority={item.priority} size="sm" /></td>
            <td className="p-4"><ComplianceStatusBadge status={item.status} size="sm" /></td>
            <td className="p-4 text-xs font-black text-gray-700 dark:text-dm-text/80">{item.assignedTo || '-'}</td>
            <td className="p-4">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => onView(item)} className="p-2 rounded-xl hover:bg-primary/10 text-primary"><EyeIcon className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="p-2 rounded-xl hover:bg-amber-50 text-amber-600"><PencilIcon className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-600"><TrashIcon className="w-4 h-4"/></Button>
                </div>
            </td>
        </motion.tr>
    );
});

// --- Main Component ---
export const CompliancePage: React.FC = () => {
    const { t } = useTranslation();
    const [complianceItems, setComplianceItems] = useState<ComplianceRequirement[]>(initialComplianceData);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'overdue'>('all');
    const [filterCategory, setFilterCategory] = useState<ComplianceCategory | ''>('');
    const [filterStatus, setFilterStatus] = useState<ComplianceStatus | ''>('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ComplianceRequirement> | null>(null);
    const [viewingItem, setViewingItem] = useState<ComplianceRequirement | null>(null);

    const stats = useMemo(() => ({
        total: complianceItems.length,
        compliant: complianceItems.filter(i => i.status === ComplianceStatus.COMPLIANT).length,
        overdue: complianceItems.filter(i => i.status === ComplianceStatus.OVERDUE).length,
        critical: complianceItems.filter(i => i.priority === CompliancePriority.CRITICAL).length,
        score: Math.round((complianceItems.filter(i => i.status === ComplianceStatus.COMPLIANT).length / complianceItems.length) * 100) || 0
    }), [complianceItems]);

    const filteredItems = useMemo(() => {
        return complianceItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.authority.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !filterCategory || item.category === filterCategory;
            const matchesStatus = !filterStatus || item.status === filterStatus;
            
            let matchesTab = true;
            if (activeTab === 'upcoming') matchesTab = item.status === ComplianceStatus.SCHEDULED || item.status === ComplianceStatus.IN_PROGRESS;
            if (activeTab === 'overdue') matchesTab = item.status === ComplianceStatus.OVERDUE;

            return matchesSearch && matchesCategory && matchesStatus && matchesTab;
        }).sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [complianceItems, searchTerm, filterCategory, filterStatus, activeTab]);

    const handleFormSubmit = (data: ComplianceRequirement) => {
        if (editingItem?.id) {
            setComplianceItems(prev => prev.map(item => item.id === editingItem.id ? { ...data, updatedAt: new Date().toISOString() } : item));
        } else {
            setComplianceItems(prev => [{ ...data, id: `comp-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{t('compliance_obligations_record', { defaultValue: 'سجل الامتثال والالتزامات' })}</h1>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                        <SparklesIcon className="w-3 h-3 text-amber-500"/> {t('regulatory_monitoring_desc', { defaultValue: 'مراقبة الالتزام التنظيمي والحوكمة المؤسسية' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl h-12" leftIcon={<PrinterIcon className="w-5 h-5"/>}>{t('export_report', { defaultValue: 'تصدير التقرير' })}</Button>
                    <Button variant="primary" className="rounded-2xl h-12 shadow-xl shadow-primary/20 px-8" leftIcon={<PlusCircleIcon className="w-5 h-5"/>} onClick={() => setIsModalOpen(true)}>{t('add_requirement', { defaultValue: 'إضافة متطلب' })}</Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="إجمالي المتطلبات" value={stats.total} icon={<DocumentTextIcon className="w-6 h-6"/>} bg="bg-indigo-50" color="indigo-600" />
                <StatCard label="نسبة الامتثال" value={`${stats.score}%`} icon={<CheckBadgeIcon className="w-6 h-6"/>} bg="bg-emerald-50" color="emerald-600" trend="up" trendValue="+5%" />
                <StatCard label="متطلبات متأخرة" value={stats.overdue} icon={<ExclamationTriangleIcon className="w-6 h-6"/>} bg="bg-rose-50" color="rose-600" />
                <StatCard label="أولوية قصوى" value={stats.critical} icon={<ClockIcon className="w-6 h-6"/>} bg="bg-amber-50" color="amber-600" />
            </div>

            {/* AI Advisor Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <SparklesIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-6 max-w-2xl">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
                            <InformationCircleIcon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black mb-1">توصية Adala AI <Badge text="جديد" variant="warning" size="xs" /></h4>
                            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                                تم ملاحظة اقتراب موعد تجديد "الرخصة التجارية". نوصي بالبدء في إجراءات التجديد قبل 45 يوماً من الانتهاء لتجنب تعطل العمليات التشغيلية.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-900 rounded-2xl h-12 px-6">تحليل المخاطر الكامل</Button>
                </div>
            </div>

            {/* Filter & List Area */}
            <div className="space-y-6">
                 {/* Tabs Navigation */}
                <div className="bg-gray-100 p-1.5 rounded-3xl flex w-fit shadow-inner">
                    {[
                        { id: 'all', label: 'كافة المتطلبات', icon: <Squares2X2Icon className="w-5 h-5"/> },
                        { id: 'upcoming', label: 'قادمة قريباً', icon: <CalendarDaysIcon className="w-5 h-5"/> },
                        { id: 'overdue', label: 'المتأخرات', icon: <ExclamationTriangleIcon className="w-5 h-5"/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white shadow-xl text-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[40px]">
                    <div className="p-8 border-b dark:border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-dm-card">
                        <div className="relative w-full lg:w-96">
                            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            <input 
                                placeholder="ابحث في المتطلبات، الجهات..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-dm-background rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                            />
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                            <Select 
                                options={[{ value: '', label: 'كل الفئات' }, ...complianceCategoryOptions]} 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value as any)}
                                containerClassName="mb-0 flex-1 md:w-48"
                                className="rounded-2xl border-none bg-gray-50 h-[52px]"
                            />
                            <Select 
                                options={[{ value: '', label: 'كل الحالات' }, ...complianceStatusOptions]} 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                containerClassName="mb-0 flex-1 md:w-48"
                                className="rounded-2xl border-none bg-gray-50 h-[52px]"
                            />
                            <Button variant="outline" className="rounded-2xl h-[52px] bg-gray-50 border-none group">
                                <ArrowPathIcon className="w-6 h-6 text-gray-400 group-hover:rotate-180 transition-transform duration-700"/>
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-dm-background/50 border-b dark:border-gray-800">
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">المتطلب</th>
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">الجهة المختصة</th>
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">الاستحقاق</th>
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">الأولوية</th>
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">الحالة</th>
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">المسؤول</th>
                                    <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                <AnimatePresence mode="popLayout">
                                    {filteredItems.map(item => (
                                        <ComplianceRequirementRow 
                                            key={item.id} 
                                            item={item} 
                                            onView={setViewingItem} 
                                            onEdit={(i) => { setEditingItem(i); setIsModalOpen(true); }}
                                            onDelete={(id) => setComplianceItems(prev => prev.filter(x => x.id !== id))}
                                        />
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'تعديل متطلب' : 'إضافة متطلب جديد'} size="lg">
                <ComplianceForm initialData={editingItem} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <ViewComplianceItemModal item={viewingItem} onClose={() => setViewingItem(null)} />
        </div>
    );
};

// --- Sub-components for Modals ---
const ComplianceForm = ({ initialData, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        category: ComplianceCategory.LICENSES,
        authority: '',
        frequency: ComplianceFrequency.ANNUAL,
        priority: CompliancePriority.MEDIUM,
        status: ComplianceStatus.SCHEDULED
    });

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <Input label="عنوان المتطلب" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="rounded-2xl border-none bg-gray-50 h-12" />
            <div className="grid grid-cols-2 gap-4">
                <Select label="الفئة" options={complianceCategoryOptions} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} containerClassName="mb-0" />
                <Input label="الجهة المختصة" value={formData.authority} onChange={e => setFormData({...formData, authority: e.target.value})} required className="rounded-2xl border-none bg-gray-50 h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Select label="الدورية" options={complianceFrequencyOptions} value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} containerClassName="mb-0" />
                <Select label="الأولوية" options={compliancePriorityOptions} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} containerClassName="mb-0" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="تاريخ الاستحقاق" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="rounded-2xl border-none bg-gray-50 h-12" />
                <Input label="المسؤول المعين" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="rounded-2xl border-none bg-gray-50 h-12" />
            </div>
            <TextArea label="وصف المتطلب" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-2xl border-none bg-gray-50" />
            
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={onCancel} className="rounded-xl px-8">إلغاء</Button>
                <Button type="submit" variant="primary" className="rounded-xl px-12">حفظ</Button>
            </div>
        </form>
    );
};

const ViewComplianceItemModal = ({ item, onClose }: { item: ComplianceRequirement | null; onClose: () => void }) => {
    if (!item) return null;
    return (
        <Modal isOpen={!!item} onClose={onClose} title={t('legal_compliance_details', { defaultValue: 'تفاصيل الالتزام القانوني' })} size="xl">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1">{item.title}</h3>
                        <div className="flex gap-2">
                            <ComplianceStatusBadge status={item.status} size="sm" />
                            <CompliancePriorityBadge priority={item.priority} size="sm" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-50 border-none p-4 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('competent_authority', { defaultValue: 'الجهة المختصة' })}</p>
                        <p className="font-bold text-gray-800">{item.authority}</p>
                    </Card>
                    <Card className="bg-gray-50 border-none p-4 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('due_date', { defaultValue: 'تاريخ الاستحقاق' })}</p>
                        <p className="font-bold text-gray-800 flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4 text-primary"/> {item.dueDate || '-'}</p>
                    </Card>
                    <Card className="bg-gray-50 border-none p-4 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('assigned_official', { defaultValue: 'المسؤول' })}</p>
                        <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">{(item.assignedTo || 'U').charAt(0)}</div>
                             <p className="font-bold text-gray-800">{item.assignedTo || '-'}</p>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h4 className="font-black text-gray-900 border-r-4 border-primary pr-3 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400"/> {t('requirement_description_instructions', { defaultValue: 'وصف المتطلب والتعليمات' })}
                    </h4>
                    <div className="bg-gray-50 p-6 rounded-[32px] text-sm text-gray-600 leading-relaxed">
                        {item.description || t('no_description_available', { defaultValue: 'لا يوجد وصف متاح لهذا المتطلب.' })}
                    </div>
                </div>

                {item.evidenceLink && (
                    <Card className="bg-indigo-50 border-indigo-100 p-6 rounded-[32px]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl text-indigo-600">
                                    <FolderIcon className="w-6 h-6"/>
                                </div>
                                <div>
                                    <p className="font-black text-indigo-900 text-sm">المستندات المؤيدة</p>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase">تم إيداع دليل الامتثال بنجاح</p>
                                </div>
                            </div>
                            <Button variant="primary" size="sm" className="rounded-xl px-6" leftIcon={<EyeIcon className="w-4 h-4"/>}>عرض المستند</Button>
                        </div>
                    </Card>
                )}

                <div className="pt-6 border-t flex justify-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">تاريخ الإنشاء</p>
                        <p className="text-xs font-mono font-bold">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    {item.updatedAt && (
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">آخر تحديث</p>
                            <p className="text-xs font-mono font-bold">{new Date(item.updatedAt).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CompliancePage;
