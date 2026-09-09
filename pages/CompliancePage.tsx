import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/ui/Toast';
import { RiskLevel } from '../types';
import {
    Shield, ShieldCheck, CheckSquare, ShieldAlert, Calendar, FileText, AlertTriangle,
    Activity, Plus, Search, Filter, Eye, Edit, Trash, Copy, Archive,
    Printer, Download, X, Clock, Check, RotateCcw, Building2, Sparkles,
    ArrowUpRight, FileCheck, AlertCircle, RefreshCw, ChevronRight, QrCode
} from 'lucide-react';

export interface ComplianceItem {
    id: string;
    title: string;
    authority: string;
    category: string;
    riskLevel: RiskLevel | 'Critical' | 'High' | 'Medium' | 'Low';
    frequency: 'سنوي' | 'ربع سنوي' | 'شهري' | 'مرة واحدة' | 'مستمر';
    dueDate: string;
    status: 'Compliant' | 'In Progress' | 'Overdue';
    statusAr: string;
    assignedTo: string;
    penaltyAmount?: number;
    description: string;
    notes?: string;
    isArchived?: boolean;
}

const DEFAULT_OBLIGATIONS: ComplianceItem[] = [
    {
        id: 'comp-101',
        title: 'تجديد الترخيص التجاري الرئيسي للمكتب',
        authority: 'وزارة التجارة والصناعة (MOCI)',
        category: 'تراخيص ومعاملات حكومية',
        riskLevel: 'High',
        frequency: 'سنوي',
        dueDate: '2026-09-15',
        status: 'In Progress',
        statusAr: 'قيد المتابعة',
        assignedTo: 'أ. صبري شطا',
        penaltyAmount: 2500,
        description: 'متابعة إجراءات تجديد الرخص التجارية بالسجل التجاري وتضمين كشوف المراجعة الرسمية وتحديث بيانات العنوان.'
    },
    {
        id: 'comp-102',
        title: 'تقديم التقرير السنوي لمكافحة غسيل الأموال (AML/CFT)',
        authority: 'وحدة التحريات المالية الكويتية (KWFIU)',
        category: 'مكافحة غسيل الأموال والحوكمة',
        riskLevel: 'Critical',
        frequency: 'سنوي',
        dueDate: '2026-10-01',
        status: 'In Progress',
        statusAr: 'قيد المتابعة',
        assignedTo: 'أ. أحمد العبدالله',
        penaltyAmount: 5000,
        description: 'إعداد وحصر الموازنات والأنشطة المالية وتأكيد الهوية الرقمية للعملاء وفق القرارات الوزارية والتنظيمية.'
    },
    {
        id: 'comp-103',
        title: 'تجديد عقد إيجار المقر الرئيسي - برج الوجيان',
        authority: 'شركة الوجيان العقارية / إدارة الأملاك',
        category: 'الالتزامات والاشتراطات التعاقدية',
        riskLevel: 'High',
        frequency: 'سنوي',
        dueDate: '2026-09-01',
        status: 'In Progress',
        statusAr: 'قيد المتابعة',
        assignedTo: 'أ. صبري شطا',
        description: 'مراجعة البنود والقيمة الإيجارية السنوية وتحديث الكفالات البنكية ومطابقة محضر الفحص الفني للعين المؤجرة.'
    },
    {
        id: 'comp-104',
        title: 'سداد الاشتراكات الشهرية للعمالة والكوادر',
        authority: 'المؤسسة العامة للتأمينات الاجتماعية',
        category: 'قوانين العمل والتأمينات',
        riskLevel: 'Medium',
        frequency: 'شهري',
        dueDate: '2026-08-31',
        status: 'Compliant',
        statusAr: 'مكتمل',
        assignedTo: 'مريم الكندري',
        description: 'تحويل مبالغ التأمين الاجتماعي الشهري للكوادر الوطنية والمقيمة المعتمدة على كادر المكتب.'
    },
    {
        id: 'comp-105',
        title: 'تحديث بيانات الإفصاح والشفافية للشركاء',
        authority: 'هيئة أسواق المال (CMA)',
        category: 'لوائح هيئة أسواق المال',
        riskLevel: 'High',
        frequency: 'ربع سنوي',
        dueDate: '2026-08-15',
        status: 'Overdue',
        statusAr: 'متأخر',
        assignedTo: 'أ. صبري شطا',
        penaltyAmount: 1500,
        description: 'تقديم تقارير الإفصاح عن المصلحة والشركاء والمحامين المقيدين بالهيئة وفق تعليمات الحوكمة رقم 72.'
    },
    {
        id: 'comp-106',
        title: 'تجديد قيد المحامين المزاولين بالجدول الدائم',
        authority: 'جمعية المحامين الكويتية',
        category: 'الحوكمة والمطابقة المؤسسية',
        riskLevel: 'Low',
        frequency: 'سنوي',
        dueDate: '2026-12-31',
        status: 'Compliant',
        statusAr: 'مكتمل',
        assignedTo: 'أ. صبري شطا',
        description: 'تحديث البطاقات المهنية وشهادات الممارسة وصندوق التكافل واستيفاء ساعات التدريب المستمر.'
    },
    {
        id: 'comp-107',
        title: 'تقديم الإقرار الضريبي والزكاة الموحد',
        authority: 'وزارة المالية - إدارة الخضوع الضريبي',
        category: 'الضرائب والزكاة والجمارك',
        riskLevel: 'Medium',
        frequency: 'سنوي',
        dueDate: '2026-07-30',
        status: 'Compliant',
        statusAr: 'مكتمل',
        assignedTo: 'الحسابات والمالية',
        description: 'اعتماد الميزانية التدقيقية ومطابقة كشوف الإيرادات المصروفة وإصدار شهادة براءة الذمة الضريبية.'
    },
    {
        id: 'comp-108',
        title: 'تجديد شهادة استيفاء نسبة العمالة الوطنية (الكويتة)',
        authority: 'الهيئة العامة للقوى العاملة',
        category: 'قوانين العمل والتأمينات',
        riskLevel: 'High',
        frequency: 'سنوي',
        dueDate: '2026-09-20',
        status: 'In Progress',
        statusAr: 'قيد المتابعة',
        assignedTo: 'الموارد البشرية',
        description: 'استخراج شهادة استيفاء نسبة الكويتة المطلوبة للتقدّم للمناقصات والممارسات الحكومية الرسمية.'
    },
    {
        id: 'comp-109',
        title: 'مراجعة وتحديث سياسة حماية البيانات وسرية المستندات',
        authority: 'الهيئة العامة للاتصالات وتقنية المعلومات (CITRA)',
        category: 'حماية البيانات وسرية المعلومات',
        riskLevel: 'Medium',
        frequency: 'سنوي',
        dueDate: '2026-11-15',
        status: 'In Progress',
        statusAr: 'قيد المتابعة',
        assignedTo: 'فريق تقنية المعلومات والامتثال',
        description: 'تطبيق الاشتراطات الأمنية لحفظ الأرشيف الإلكتروني والتشفير ومنع تسريب بيانات القضايا والعملاء.'
    }
];

export const CompliancePage: React.FC = () => {
    const { addToast } = useToast();

    // Active tab
    const [activeTab, setActiveTab] = useState<
        'dashboard' | 'legal_obligations' | 'contractual_obligations' | 'statutory_deadlines' | 'risk_management'
    >('dashboard');

    // Layout mode
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Items state stored in LocalStorage
    const [items, setItems] = useState<ComplianceItem[]>(() => {
        const saved = localStorage.getItem('adala_compliance_items_v4');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error('Error loading compliance data:', e); }
        }
        return DEFAULT_OBLIGATIONS;
    });

    useEffect(() => {
        localStorage.setItem('adala_compliance_items_v4', JSON.stringify(items));
    }, [items]);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');

    // Modals State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
    const [formData, setFormData] = useState<Partial<ComplianceItem>>({});

    const [selectedProfile, setSelectedProfile] = useState<ComplianceItem | null>(null);
    const [printableItem, setPrintableItem] = useState<ComplianceItem | null>(null);

    // KPI Calculations
    const stats = useMemo(() => {
        const total = items.length;
        const activeCount = items.filter(i => i.status !== 'Compliant').length;
        const compliantCount = items.filter(i => i.status === 'Compliant').length;
        const overdueCount = items.filter(i => i.status === 'Overdue').length;

        // Due soon (within 30 days)
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const dueSoonCount = items.filter(i => {
            if (i.status === 'Compliant' || !i.dueDate) return false;
            const d = new Date(i.dueDate);
            return d >= today && d <= thirtyDaysLater;
        }).length;

        const criticalAndHighRisks = items.filter(i => i.riskLevel === 'Critical' || i.riskLevel === 'High').length;

        // Compliance percentage
        const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

        return {
            total,
            activeCount,
            compliantCount,
            overdueCount,
            dueSoonCount,
            openRisks: overdueCount + criticalAndHighRisks,
            complianceRate
        };
    }, [items]);

    // Data Filtering logic by Active Tab + Search + Filter dropdowns
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Tab filtering
            if (activeTab === 'legal_obligations') {
                if (item.category === 'الالتزامات والاشتراطات التعاقدية') return false;
            } else if (activeTab === 'contractual_obligations') {
                if (item.category !== 'الالتزامات والاشتراطات التعاقدية' && !item.title.includes('عقد') && !item.title.includes('إيجار')) return false;
            } else if (activeTab === 'statutory_deadlines') {
                // Return all items sorted chronologically
            } else if (activeTab === 'risk_management') {
                // Focus on items with Critical or High risks or AML/Governance
            }

            // Search Filter
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = query === '' ||
                item.title.toLowerCase().includes(query) ||
                item.authority.toLowerCase().includes(query) ||
                item.assignedTo.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query);

            // Dropdowns Filter
            const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
            const matchesRisk = filterRisk === 'ALL' || item.riskLevel === filterRisk;
            const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

            return matchesSearch && matchesStatus && matchesRisk && matchesCategory;
        }).sort((a, b) => {
            if (activeTab === 'statutory_deadlines') {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return 0;
        });
    }, [items, activeTab, searchQuery, filterStatus, filterRisk, filterCategory]);

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            id: `comp-${Date.now()}`,
            title: '',
            authority: 'وزارة التجارة والصناعة (MOCI)',
            category: activeTab === 'contractual_obligations' ? 'الالتزامات والاشتراطات التعاقدية' : 'تراخيص ومعاملات حكومية',
            riskLevel: 'Medium',
            frequency: 'سنوي',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'In Progress',
            statusAr: 'قيد المتابعة',
            assignedTo: 'أ. صبري شطا',
            description: '',
            penaltyAmount: 0
        });
        setIsFormOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (item: ComplianceItem) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsFormOpen(true);
    };

    // Form Submit (Save / Edit)
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.authority) {
            addToast({ type: 'error', title: 'بيانات ناقصة', message: 'يرجى كتابة عنوان الالتزام والجهة الرقابية.' });
            return;
        }

        if (editingItem) {
            setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } as ComplianceItem : i));
            addToast({ type: 'success', title: 'تم التحديث بنجاح', message: `تم تحديث بيانات الالتزام: ${formData.title}` });
        } else {
            setItems([formData as ComplianceItem, ...items]);
            addToast({ type: 'success', title: 'تم إضافة الالتزام', message: `تم تسجيل الالتزام الجديد: ${formData.title}` });
        }
        setIsFormOpen(false);
    };

    // Quick Status Update
    const handleToggleStatus = (item: ComplianceItem) => {
        const nextStatus = item.status === 'Compliant' ? 'In Progress' : item.status === 'In Progress' ? 'Overdue' : 'Compliant';
        const nextStatusAr = nextStatus === 'Compliant' ? 'مكتمل' : nextStatus === 'In Progress' ? 'قيد المتابعة' : 'متأخر';

        setItems(items.map(i => i.id === item.id ? { ...i, status: nextStatus, statusAr: nextStatusAr } : i));
        addToast({ type: 'info', title: 'تحديث الحالة', message: `تم تعديل حالة ${item.title} إلى: ${nextStatusAr}` });
    };

    // Delete item
    const handleDeleteItem = (id: string, title: string) => {
        if (confirm(`هل أنت ألكيد من رغبتك في حذف الالتزام (${title})؟`)) {
            setItems(items.filter(i => i.id !== id));
            addToast({ type: 'success', title: 'تم الحذف', message: 'تم إزالة الالتزام بنجاح.' });
        }
    };

    // Reset Filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterStatus('ALL');
        setFilterRisk('ALL');
        setFilterCategory('ALL');
    };

    // Reset All Data
    const handleResetData = () => {
        if (confirm('هل تود إعادة ضبط بيانات الالتزام والامتثال للقيم الأساسية للنظام؟')) {
            setItems(DEFAULT_OBLIGATIONS);
            addToast({ type: 'info', title: 'تمت الاستعادة', message: 'تم إعادة ضبط بيانات الالتزامات والامتثال بنجاح.' });
        }
    };

    // Helper badge for Risk level
    const renderRiskBadge = (risk: string) => {
        switch (risk) {
            case 'Critical':
            case 'High':
                return (
                    <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>عالي الخطورة</span>
                    </span>
                );
            case 'Medium':
                return (
                    <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 inline-flex items-center gap-1">
                        <span>متوسط</span>
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 inline-flex items-center gap-1">
                        <span>منخفض</span>
                    </span>
                );
        }
    };

    // Helper badge for Status
    const renderStatusBadge = (status: string, statusAr: string) => {
        if (status === 'Compliant') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>مكتمل</span>
                </span>
            );
        }
        if (status === 'Overdue') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    <span>متأخر</span>
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>قيد المتابعة</span>
            </span>
        );
    };

    // Helper due date format and urgency check
    const getDueDateStyle = (dueDateStr: string, status: string) => {
        if (status === 'Compliant') return 'text-slate-600 dark:text-slate-400 font-bold';
        const today = new Date();
        const dDate = new Date(dueDateStr);
        if (dDate < today) {
            return 'text-rose-600 dark:text-rose-400 font-black flex items-center gap-1';
        }
        const diffDays = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 30) {
            return 'text-amber-600 dark:text-amber-400 font-black flex items-center gap-1';
        }
        return 'text-slate-700 dark:text-slate-300 font-bold';
    };

    return (
        <div className="space-y-5 text-right font-sans min-h-screen p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 transition-colors">

            {/* 1. CLEAN HEADER (Minimal Clean UI) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 m-0">
                        <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        <span>مركز الحوكمة والامتثال والالتزامات الرقابية</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 m-0">
                        متابعة وتدقيق التراخيص والالتزامات القانونية والتعاقدية وأجندة المواعيد واللوائح لمكتب أ. صبري شطا
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleResetData}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all border-none cursor-pointer"
                        title="إعادة ضبط البيانات"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استعادة البيانات</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI MINI CARDS (4 Main Key Performance Indicators) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* KPI 1: Active Obligations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 m-0">إجمالي الالتزامات النشطة</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.activeCount}</span>
                            <span className="text-xs font-bold text-slate-400">/ {stats.total} إجمالي</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/40">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>

                {/* KPI 2: Due Soon */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 m-0">التزامات قريبة الاستحقاق</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{stats.dueSoonCount}</span>
                            <span className="text-xs font-bold text-amber-600/80 dark:text-amber-400/80">(خلال 30 يوماً)</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                {/* KPI 3: Open Risks / Violations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 m-0">مخالفات/مخاطر مفتوحة</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{stats.openRisks}</span>
                            <span className="text-xs font-bold text-rose-600/80 dark:text-rose-400/80">تتطلب متابعة</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>

                {/* KPI 4: Compliance Rate (%) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div className="w-full">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 m-0">نسبة الالتزام الكلية</p>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{stats.complianceRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                            <div
                                className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.complianceRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CLEAN TAB NAVIGATION (Soft Teal Navigation Bar) */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
                <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        activeTab === 'dashboard'
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    <span>لوحة التحكم والتحليل</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('legal_obligations')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        activeTab === 'legal_obligations'
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Shield className="w-4 h-4" />
                    <span>الالتزامات القانونية والتراخيص</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('contractual_obligations')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        activeTab === 'contractual_obligations'
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>الالتزامات التعاقدية والعقود</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('statutory_deadlines')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        activeTab === 'statutory_deadlines'
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Calendar className="w-4 h-4" />
                    <span>المواعيد النظامية والمهل</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('risk_management')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        activeTab === 'risk_management'
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <ShieldAlert className="w-4 h-4" />
                    <span>إدارة السياسات والمخاطر</span>
                </button>
            </div>

            {/* TAB CONTENT 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Urgent Priorities / Immediate Actions */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white m-0">الالتزامات ذات الأولوية العاجلة</h3>
                                </div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تنبيهات تلقائية</span>
                            </div>

                            <div className="space-y-2.5">
                                {items.filter(i => i.status !== 'Compliant').slice(0, 4).map(item => (
                                    <div
                                        key={item.id}
                                        className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-200 dark:hover:border-teal-800 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-400">{item.id}</span>
                                                {renderRiskBadge(item.riskLevel)}
                                            </div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white m-0">{item.title}</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold m-0">{item.authority}</p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <span className="block text-[10px] text-slate-400 font-bold">تاريخ الاستحقاق</span>
                                                <span className={`text-xs font-mono ${getDueDateStyle(item.dueDate, item.status)}`}>
                                                    {item.dueDate}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProfile(item)}
                                                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-xl transition-colors border border-teal-200/50 dark:border-teal-900/40 cursor-pointer"
                                            >
                                                التفاصيل
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary & Quick Actions */}
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white m-0 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    توزيع حالات الالتزام
                                </h3>
                                <div className="space-y-2 text-xs font-bold">
                                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>مكتمل وملتزم</span>
                                        <span className="font-mono font-black">{stats.compliantCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>قيد المتابعة والتنفيذ</span>
                                        <span className="font-mono font-black">{items.filter(i => i.status === 'In Progress').length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>متأخر يتطلب إجراء</span>
                                        <span className="font-mono font-black">{stats.overdueCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-teal-900 text-white rounded-2xl p-5 space-y-3 shadow-2xs">
                                <h3 className="text-xs font-black text-teal-200 m-0">الإجراءات السريعة للحوكمة</h3>
                                <p className="text-[11px] text-teal-100 font-bold m-0 leading-relaxed">
                                    يمكنك تسجيل التزام جديد أو استخراج شهادة صك المطابقة الرسمية بختم المكتب بضغطة زر.
                                </p>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleOpenAdd}
                                        className="px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-colors"
                                    >
                                        + التزام جديد
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (items.length > 0) setPrintableItem(items[0]);
                                        }}
                                        className="px-3 py-2 bg-teal-800 hover:bg-teal-700 text-teal-100 font-bold text-xs rounded-xl border-none cursor-pointer transition-colors inline-flex items-center justify-center gap-1"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>طباعة صك</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. FILTER BAR (Search, Filters, View Toggle & Add Button) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Search & Select Filters */}
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative text-xs flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="بحث باسم الالتزام، الجهة، أو المسؤول..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                        <option value="ALL">جميع الحالات</option>
                        <option value="Compliant">مكتمل</option>
                        <option value="In Progress">قيد المتابعة</option>
                        <option value="Overdue">متأخر</option>
                    </select>

                    <select
                        value={filterRisk}
                        onChange={e => setFilterRisk(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                        <option value="ALL">جميع مستويات الخطورة</option>
                        <option value="Critical">عالي جداً</option>
                        <option value="High">عالي الخطورة</option>
                        <option value="Medium">متوسط</option>
                        <option value="Low">منخفض</option>
                    </select>

                    {(searchQuery || filterStatus !== 'ALL' || filterRisk !== 'ALL') && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl border-none cursor-pointer"
                            title="إلغاء الفلاتر"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* View Switcher & Add Button */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${
                                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-2xs' : 'text-slate-500'
                            }`}
                            title="عرض جدولي"
                        >
                            جدول
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${
                                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-2xs' : 'text-slate-500'
                            }`}
                            title="عرض شبكي"
                        >
                            بطاقات
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-colors shadow-2xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة التزام جديد</span>
                    </button>
                </div>
            </div>

            {/* 3. INTERACTIVE COMPLIANCE TABLE OR GRID */}
            <div className="space-y-4">
                {filteredItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
                        <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 m-0">لم يتم العثور على أية التزامات مطابقة لشروط البحث</h3>
                        <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">
                            جرب تغيير الفلاتر أو البحث بكلمة أخرى، أو قم بتسجيل التزام جديد بنظام الحوكمة.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all border-none cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إلغاء الفلترة</span>
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                                        <th className="p-3.5 pr-4">اسم الالتزام / التكليف</th>
                                        <th className="p-3.5">الجهة / الجهة الرقابية</th>
                                        <th className="p-3.5">تاريخ الاستحقاق</th>
                                        <th className="p-3.5">مستوى الخطورة</th>
                                        <th className="p-3.5">حالة الالتزام</th>
                                        <th className="p-3.5 pl-4 text-center">إجراءات سريعة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                                    {filteredItems.map(item => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="p-3 pr-4">
                                                <div>
                                                    <div className="font-black text-slate-900 dark:text-white">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-[10.5px] text-slate-400 font-mono font-bold">
                                                        {item.id} | {item.category}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">
                                                {item.authority}
                                            </td>

                                            <td className="p-3 font-mono font-bold">
                                                <span className={getDueDateStyle(item.dueDate, item.status)}>
                                                    {item.dueDate}
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                {renderRiskBadge(item.riskLevel)}
                                            </td>

                                            <td className="p-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(item)}
                                                    className="bg-transparent border-none p-0 cursor-pointer text-right"
                                                    title="اضغط لتغيير الحالة"
                                                >
                                                    {renderStatusBadge(item.status, item.statusAr)}
                                                </button>
                                            </td>

                                            <td className="p-3 pl-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedProfile(item)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-[10.5px] rounded-xl transition-colors cursor-pointer border border-teal-200/50 dark:border-teal-900/40"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>التفاصيل</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] rounded-xl transition-colors cursor-pointer border-none"
                                                        title="تعديل"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        <span>تعديل</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setPrintableItem(item)}
                                                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] rounded-xl transition-colors cursor-pointer border-none"
                                                        title="طباعة الصك"
                                                    >
                                                        <Printer className="w-3 h-3" />
                                                        <span>صك</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteItem(item.id, item.title)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg border-none bg-transparent cursor-pointer"
                                                        title="حذف"
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3"
                            >
                                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                    <div>
                                        <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">{item.id}</span>
                                        <h3 className="text-xs font-black text-slate-900 dark:text-white m-0 leading-tight">{item.title}</h3>
                                    </div>
                                    {renderStatusBadge(item.status, item.statusAr)}
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span className="text-slate-400 font-bold">الجهة:</span>
                                        <span className="font-bold">{item.authority}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span className="text-slate-400 font-bold">تاريخ الاستحقاق:</span>
                                        <span className={`font-mono ${getDueDateStyle(item.dueDate, item.status)}`}>{item.dueDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                        <span className="text-slate-400 font-bold">مستوى الخطورة:</span>
                                        {renderRiskBadge(item.riskLevel)}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProfile(item)}
                                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-xl border-none cursor-pointer transition-colors"
                                    >
                                        عرض التفاصيل
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(item)}
                                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer"
                                            title="تعديل"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPrintableItem(item)}
                                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer"
                                            title="طباعة"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL 1: ADD / EDIT OBLIGATION */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-right"
                        >
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                                <h3 className="text-sm font-black m-0">
                                    {editingItem ? `تعديل الالتزام: ${editingItem.title}` : 'تسجيل التزام جديد بنظام الحوكمة'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 border-none cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 text-xs font-bold max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1">اسم الالتزام / التكليف*</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="مثال: تجديد الرخصة التجارية العامة للمكتب"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">الجهة / السلطة الرقابية*</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.authority || ''}
                                            onChange={e => setFormData({ ...formData, authority: e.target.value })}
                                            placeholder="مثال: وزارة التجارة والصناعة"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">التصنيف</label>
                                        <input
                                            type="text"
                                            value={formData.category || ''}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">تاريخ الاستحقاق*</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.dueDate || ''}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">مستوى الخطورة</label>
                                        <select
                                            value={formData.riskLevel || 'Medium'}
                                            onChange={e => setFormData({ ...formData, riskLevel: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        >
                                            <option value="Critical">عالي جداً (Critical)</option>
                                            <option value="High">عالي الخطورة (High)</option>
                                            <option value="Medium">متوسط (Medium)</option>
                                            <option value="Low">منخفض (Low)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">حالة الالتزام</label>
                                        <select
                                            value={formData.status || 'In Progress'}
                                            onChange={e => {
                                                const st = e.target.value as any;
                                                const stAr = st === 'Compliant' ? 'مكتمل' : st === 'Overdue' ? 'متأخر' : 'قيد المتابعة';
                                                setFormData({ ...formData, status: st, statusAr: stAr });
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        >
                                            <option value="In Progress">قيد المتابعة</option>
                                            <option value="Compliant">مكتمل ومستوفي</option>
                                            <option value="Overdue">متأخر</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">المسؤول عن المتابعة</label>
                                        <input
                                            type="text"
                                            value={formData.assignedTo || ''}
                                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1">التفاصيل والشروط</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border-none cursor-pointer"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl border-none cursor-pointer shadow-3xs"
                                    >
                                        حفظ البيانات
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: VIEW DETAILS DRAWER */}
            <AnimatePresence>
                {selectedProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-right p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                    <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">{selectedProfile.id}</span>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white m-0">{selectedProfile.title}</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProfile(null)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 border-none cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">الجهة الرقابية:</span>
                                    <span className="text-slate-900 dark:text-white">{selectedProfile.authority}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">التصنيف:</span>
                                    <span className="text-slate-900 dark:text-white">{selectedProfile.category}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">تاريخ الاستحقاق:</span>
                                    <span className={`font-mono ${getDueDateStyle(selectedProfile.dueDate, selectedProfile.status)}`}>{selectedProfile.dueDate}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">مسؤول المتابعة:</span>
                                    <span className="text-slate-900 dark:text-white">{selectedProfile.assignedTo}</span>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold block">التفاصيل والاشتراطات:</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold m-0 leading-relaxed">{selectedProfile.description}</p>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPrintableItem(selectedProfile);
                                        setSelectedProfile(null);
                                    }}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer inline-flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>طباعة صك التدقيق</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedProfile(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border-none cursor-pointer"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: OFFICIAL PRINT CERTIFICATE / DEED */}
            <AnimatePresence>
                {printableItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 border border-slate-200 text-slate-900 font-sans space-y-6">
                            {/* Certificate Header */}
                            <div className="border-b-2 border-teal-600 pb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-black text-teal-800 flex items-center gap-2 m-0">
                                        <Shield className="w-5 h-5 text-teal-600" />
                                        <span>منظومة عدالة للحوكمة والامتثال</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 m-0">SABRI SHATTA LAW FIRM - OFFICIAL COMPLIANCE DEED</p>
                                </div>
                                <div className="text-left font-mono text-[10px] text-slate-500">
                                    <div>REF: ADALA-COMP-{printableItem.id}</div>
                                    <div>DATE: {new Date().toISOString().split('T')[0]}</div>
                                </div>
                            </div>

                            {/* Certificate Body */}
                            <div className="space-y-4 text-xs font-bold text-slate-800 leading-relaxed">
                                <div className="text-center py-2 bg-teal-50 rounded-xl border border-teal-100">
                                    <h3 className="text-sm font-black text-teal-900 m-0">صك مطابقة وشهادة التزام حوكمة رسمية</h3>
                                </div>

                                <p>
                                    يشهد مكتب المحامي أ. صبري شطا للمحاماة والاستشارات القانونية بدولة الكويت، بأن الالتزام والنشاط المعنون بـ:
                                </p>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <div className="text-sm font-black text-slate-900">{printableItem.title}</div>
                                    <div className="text-xs text-teal-700 font-bold">الجهة الرقابية: {printableItem.authority}</div>
                                    <div className="text-xs text-slate-500 font-mono">التصنيف: {printableItem.category} | الاستحقاق: {printableItem.dueDate}</div>
                                </div>

                                <p>
                                    قد تم فخِصه وتدقيق شروطه وأوراقه الرسمية وتحديث بياناته بالسجلات وفقاً لأحكام القوانين واللوائح التنظيمية المعمول بها بدولة الكويت.
                                </p>
                            </div>

                            {/* Signature & Stamp */}
                            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-center text-xs font-bold">
                                <div>
                                    <p className="text-slate-400 m-0 mb-2">الختم المائي المعتمد</p>
                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-600 text-teal-700 text-[10px] font-black flex items-center justify-center mx-auto bg-teal-50 rotate-12">
                                        مكتب صبري شطا
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 m-0 mb-1">التوقيع والاعتماد</p>
                                    <p className="font-serif italic font-black text-slate-900 text-sm m-0">صبري شطا</p>
                                    <p className="text-[10px] text-slate-500 m-0">المستشار القانوني العام</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 print:hidden">
                                <button
                                    type="button"
                                    onClick={() => setPrintableItem(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border-none cursor-pointer"
                                >
                                    إغلاق
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>طباعة الصك</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CompliancePage;
