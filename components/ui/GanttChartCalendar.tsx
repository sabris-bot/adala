import React, { useState, useMemo } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { useToast } from './Toast';
import { 
    Calendar, Clock, AlertTriangle, ChevronRight, ChevronLeft, 
    Filter, User, Briefcase, Scale, ArrowRightLeft, ShieldAlert, 
    CheckCircle2, Plus, Sparkles, RefreshCw, Eye, Move, GripVertical, Trash2, Edit3, Download, Search
} from 'lucide-react';

export interface GanttItem {
    id: string;
    title: string;
    caseNumber?: string;
    assignee: string; // Lawyer or Staff member
    category: 'litigation' | 'admin' | 'investigation' | 'property' | 'court_filing';
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
    status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'URGENT';
    courtVenue?: string;
    notes?: string;
}

// Initial Rich Seed Items combining Legal Deadlines + Admin Tasks
export const INITIAL_GANTT_ITEMS: GanttItem[] = [
    {
        id: 'GANTT-101',
        title: 'جلسة تقديم مذكرة أسباب الطعن بالتمييز (م القضايا)',
        caseNumber: 'CASE-2026-8819',
        assignee: 'أستاذ صبري شطا',
        category: 'litigation',
        startDate: '2026-08-18',
        endDate: '2026-08-20',
        priority: 'HIGH',
        status: 'URGENT',
        courtVenue: 'محكمة التمييز - قصر العدل'
    },
    {
        id: 'GANTT-102',
        title: 'جلسة استجواب ومحضر تحقيق الموظف (قضية برج ناصر)',
        caseNumber: 'INV-KW-2026-001',
        assignee: 'أستاذ صبري شطا',
        category: 'investigation',
        startDate: '2026-08-18', // Intentionally conflicts with GANTT-101 on 2026-08-18 for demonstration!
        endDate: '2026-08-18',
        priority: 'HIGH',
        status: 'ACTIVE',
        courtVenue: 'مقر مكتب المحامي صبري شطا'
    },
    {
        id: 'GANTT-103',
        title: 'إيداع أمانة الخبيرة بفرع بنك الخليج وإثبات الدفع',
        caseNumber: 'CASE-2026-7721',
        assignee: 'أحمد محمود المحمد الصباح',
        category: 'court_filing',
        startDate: '2026-08-19',
        endDate: '2026-08-22',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        courtVenue: 'قصر العدل - قسم أمانات الخبراء'
    },
    {
        id: 'GANTT-104',
        title: 'معاينة ميدانية وإعداد تقرير السلامة لبرج الراية',
        caseNumber: 'INSP-2026-904',
        assignee: 'فريق العمل الميداني (مندوب المحاكم)',
        category: 'property',
        startDate: '2026-08-20',
        endDate: '2026-08-23',
        priority: 'NORMAL',
        status: 'ACTIVE',
        courtVenue: 'برج الراية السكني - الشرق'
    },
    {
        id: 'GANTT-105',
        title: 'صياغة ونشر إعلان تكليف بالوفاء لعقد المادة 20',
        caseNumber: 'LEASE-KW-2025-101',
        assignee: 'فاطمة علي حسين',
        category: 'admin',
        startDate: '2026-08-21',
        endDate: '2026-08-25',
        priority: 'HIGH',
        status: 'ACTIVE',
        courtVenue: 'إدارة التنفيذ - وزارة العدل'
    },
    {
        id: 'GANTT-106',
        title: 'حضور جلسة خبراء وزارة العدل الكويتي',
        caseNumber: 'CASE-2026-1102',
        assignee: 'أحمد محمود المحمد الصباح',
        category: 'litigation',
        startDate: '2026-08-22',
        endDate: '2026-08-22',
        priority: 'HIGH',
        status: 'ACTIVE',
        courtVenue: 'إدارة الخبراء - الرقعي'
    },
    {
        id: 'GANTT-107',
        title: 'تدقيق الميزانية والتقرير المالي متعدد العملات للمستثمرين',
        caseNumber: 'PROP-REPORT-001',
        assignee: 'عمر خالد المرزوق',
        category: 'admin',
        startDate: '2026-08-24',
        endDate: '2026-08-28',
        priority: 'NORMAL',
        status: 'ACTIVE'
    }
];

interface GanttChartCalendarProps {
    items?: GanttItem[];
    onItemUpdate?: (updatedItems: GanttItem[]) => void;
    title?: string;
}

export const GanttChartCalendar: React.FC<GanttChartCalendarProps> = ({
    items: externalItems,
    onItemUpdate,
    title = 'تقويم Gantt التفاعلي للمواعيد القضائية والمهام الإدارية'
}) => {
    const { addToast } = useToast();

    // State for items
    const [items, setItems] = useState<GanttItem[]>(() => externalItems || INITIAL_GANTT_ITEMS);
    
    // Timeline view parameters
    const [baseDateStr, setBaseDateStr] = useState<string>('2026-08-18');
    const [viewDaysMode, setViewDaysMode] = useState<7 | 14 | 30>(14);
    
    // Filters
    const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Drag and Drop state
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    // Modal state for Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<GanttItem> | null>(null);

    // Base date calculation
    const baseDate = useMemo(() => new Date(baseDateStr), [baseDateStr]);

    // Timeline column dates array
    const timelineDates = useMemo(() => {
        const dates: string[] = [];
        for (let i = 0; i < viewDaysMode; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    }, [baseDate, viewDaysMode]);

    // Unique list of assignees for filters
    const assigneesList = useMemo(() => {
        const set = new Set<string>();
        items.forEach(it => {
            if (it.assignee) set.add(it.assignee);
        });
        return Array.from(set);
    }, [items]);

    // Conflict Detection Engine: detects when an assignee has 2+ active items on the exact same date!
    const conflictAlerts = useMemo(() => {
        const conflicts: Array<{ assignee: string; date: string; items: GanttItem[] }> = [];

        assigneesList.forEach(assignee => {
            timelineDates.forEach(dateStr => {
                const overlapping = items.filter(it => 
                    it.assignee === assignee && 
                    it.startDate <= dateStr && 
                    it.endDate >= dateStr
                );

                if (overlapping.length >= 2) {
                    conflicts.push({
                        assignee,
                        date: dateStr,
                        items: overlapping
                    });
                }
            });
        });

        return conflicts;
    }, [items, assigneesList, timelineDates]);

    // Helper to check if an item has a scheduling conflict in a given item list
    const checkConflictForItemInList = (itemList: GanttItem[], itemId: string) => {
        const targetItem = itemList.find(it => it.id === itemId);
        if (!targetItem) return null;

        const overlapping = itemList.filter(it => 
            it.assignee === targetItem.assignee &&
            it.id !== targetItem.id &&
            (it.startDate <= targetItem.endDate && it.endDate >= targetItem.startDate)
        );

        return {
            hasConflict: overlapping.length > 0,
            overlapping,
            targetItem
        };
    };

    // Handle shift task by N days
    const handleShiftDates = (itemId: string, daysShift: number) => {
        const updated = items.map(it => {
            if (it.id === itemId) {
                const s = new Date(it.startDate);
                s.setDate(s.getDate() + daysShift);
                const e = new Date(it.endDate);
                e.setDate(e.getDate() + daysShift);
                return {
                    ...it,
                    startDate: s.toISOString().split('T')[0],
                    endDate: e.toISOString().split('T')[0]
                };
            }
            return it;
        });

        setItems(updated);
        if (onItemUpdate) onItemUpdate(updated);

        const conflictCheck = checkConflictForItemInList(updated, itemId);
        if (conflictCheck && conflictCheck.hasConflict) {
            addToast({
                type: 'error',
                title: '🚨 تنبيه تضارب قضائي فوري!',
                message: `رصد تعارض في مواعيد المكلف (${conflictCheck.targetItem.assignee})! تتقاطع مع: (${conflictCheck.overlapping.map(o => o.title).join('، ')}). تم تلوين المهمة باللون الأحمر بالتقويم.`
            });
        } else {
            addToast({
                type: 'success',
                title: 'تم تعديل تاريخ المهمة',
                message: `تمت إزاحة الموعد النهائي بمقدار ${daysShift > 0 ? `+${daysShift}` : daysShift} أيام.`
            });
        }
    };

    // Drag & Drop handlers
    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        setDraggedItemId(itemId);
        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOverCell = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (hoveredDate !== dateStr) {
            setHoveredDate(dateStr);
        }
    };

    const handleDropOnCell = (e: React.DragEvent, targetDateStr: string) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
        setHoveredDate(null);
        setDraggedItemId(null);

        if (!itemId) return;

        const targetItem = items.find(it => it.id === itemId);
        if (!targetItem) return;

        // Calculate original duration in days
        const startMs = new Date(targetItem.startDate).getTime();
        const endMs = new Date(targetItem.endDate).getTime();
        const durationDays = Math.max(0, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

        const newStart = new Date(targetDateStr);
        const newEnd = new Date(targetDateStr);
        newEnd.setDate(newEnd.getDate() + durationDays);

        const newStartStr = newStart.toISOString().split('T')[0];
        const newEndStr = newEnd.toISOString().split('T')[0];

        const updated = items.map(it => {
            if (it.id === itemId) {
                return {
                    ...it,
                    startDate: newStartStr,
                    endDate: newEndStr
                };
            }
            return it;
        });

        setItems(updated);
        if (onItemUpdate) onItemUpdate(updated);

        const conflictCheck = checkConflictForItemInList(updated, itemId);
        if (conflictCheck && conflictCheck.hasConflict) {
            addToast({
                type: 'error',
                title: '🚨 تنبيه تضارب قضائي فوري!',
                message: `تم سحب المهمة لتاريخ يسبّب تعارضاً للمكلف (${conflictCheck.targetItem.assignee}) بتاريخ ${newStartStr}! تم تلوين مربع المهمة باللون الأحمر بالتقويم لضمان الدقة القانونية.`
            });
        } else {
            addToast({
                type: 'success',
                title: 'تمت إعادة الجدولة بالسحب والإفلات 🎯',
                message: `تم نقل "${targetItem.title}" ليبدأ من تاريخ ${newStartStr}.`
            });
        }
    };

    // Auto resolve conflict by shifting lower priority item
    const handleAutoResolveConflict = (conflict: { assignee: string; date: string; items: GanttItem[] }) => {
        if (conflict.items.length < 2) return;
        // Shift second item forward by 2 days
        const targetItem = conflict.items[1];
        handleShiftDates(targetItem.id, 2);

        addToast({
            type: 'success',
            title: 'تم حل التضارب آلياً',
            message: `تمت إزاحة المهمة (${targetItem.title}) بمقدار يومين لتجنب التعارض.`
        });
    };

    // Navigation helpers
    const handleNavigate = (days: number) => {
        const cur = new Date(baseDateStr);
        cur.setDate(cur.getDate() + days);
        setBaseDateStr(cur.toISOString().split('T')[0]);
    };

    // Handle Create / Edit save
    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem?.title || !editingItem?.startDate) {
            addToast({ type: 'error', title: 'بيانات غير مكتملة', message: 'يرجى إدخال اسم المهمة وتاريخ البدء.' });
            return;
        }

        const startDate = editingItem.startDate;
        const endDate = editingItem.endDate || startDate;

        if (editingItem.id) {
            // Update
            const updated = items.map(it => it.id === editingItem.id ? { ...it, ...editingItem, startDate, endDate } as GanttItem : it);
            setItems(updated);
            if (onItemUpdate) onItemUpdate(updated);
            addToast({ type: 'success', title: 'تم تعديل المهمة', message: 'تم تحديث الموعد بنجاح.' });
        } else {
            // Create
            const newItem: GanttItem = {
                id: 'GANTT-' + Math.floor(1000 + Math.random() * 9000),
                title: editingItem.title,
                caseNumber: editingItem.caseNumber || 'غير محدد',
                assignee: editingItem.assignee || 'أستاذ صبري شطا',
                category: editingItem.category || 'litigation',
                startDate,
                endDate,
                priority: editingItem.priority || 'NORMAL',
                status: editingItem.status || 'ACTIVE',
                courtVenue: editingItem.courtVenue || 'قصر العدل',
                notes: editingItem.notes || ''
            };
            const updated = [newItem, ...items];
            setItems(updated);
            if (onItemUpdate) onItemUpdate(updated);
            addToast({ type: 'success', title: 'تمت إضافة المهمة', message: 'تمت إدراج الموعد الجديد بالتقويم.' });
        }

        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (id: string) => {
        const updated = items.filter(it => it.id !== id);
        setItems(updated);
        if (onItemUpdate) onItemUpdate(updated);
        addToast({ type: 'info', title: 'حذف المهمة', message: 'تمت إزالة الموعد من الجدول.' });
    };

    // Filtered items list
    const filteredItems = useMemo(() => {
        return items.filter(it => {
            const matchAssignee = assigneeFilter === 'ALL' || it.assignee === assigneeFilter;
            const matchCategory = categoryFilter === 'ALL' || it.category === categoryFilter;
            const matchSearch = !searchQuery || 
                it.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (it.caseNumber && it.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchAssignee && matchCategory && matchSearch;
        });
    }, [items, assigneeFilter, categoryFilter, searchQuery]);

    // Helper badge config
    const categoryBadgeMap: Record<string, { name: string; bg: string; border: string }> = {
        litigation: { name: 'جلسة قضائية', bg: 'bg-rose-600 text-white', border: 'border-rose-700' },
        investigation: { name: 'تحقيق وأوليات', bg: 'bg-amber-500 text-slate-950 font-black', border: 'border-amber-600' },
        court_filing: { name: 'قيد وإيداع', bg: 'bg-indigo-600 text-white', border: 'border-indigo-700' },
        property: { name: 'معاينة عقار', bg: 'bg-emerald-600 text-white', border: 'border-emerald-700' },
        admin: { name: 'مهمة إدارية', bg: 'bg-slate-700 text-white', border: 'border-slate-800' }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5 text-right font-sans" style={{ direction: 'rtl' }}>
            
            {/* Header & Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
                        <Calendar className="w-6 h-6" />
                    </span>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <span>{title}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                يدعم السحب والإفلات 🎯
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            دمج المواعيد القضائية مع المهام الإدارية لموظفي المكتب وكشف التعارضات فوراً
                        </p>
                    </div>
                </div>

                {/* Right controls: Add Task, Filter, View Range */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingItem({
                                category: 'litigation',
                                priority: 'NORMAL',
                                status: 'ACTIVE',
                                assignee: 'أستاذ صبري شطا',
                                startDate: new Date().toISOString().split('T')[0],
                                endDate: new Date().toISOString().split('T')[0]
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة موعد / مهمة جديدة
                    </Button>

                    {/* Timeline Navigation */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <button
                            onClick={() => handleNavigate(-viewDaysMode)}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
                            title="السابق"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold px-2 text-slate-800 dark:text-slate-200">
                            {baseDateStr}
                        </span>
                        <button
                            onClick={() => handleNavigate(viewDaysMode)}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
                            title="المقبل"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    {/* View Days selector */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {([7, 14, 30] as const).map(days => (
                            <button
                                key={days}
                                onClick={() => setViewDaysMode(days)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                    viewDaysMode === days 
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {days} يوماً
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter and Search Sub-Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="بحث بالعنوان أو رقم القضية..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                    <option value="ALL">جميع الموظفين والمحامين ({assigneesList.length})</option>
                    {assigneesList.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                    <option value="ALL">جميع التصنيفات</option>
                    <option value="litigation">جلسات قضائية</option>
                    <option value="investigation">تحقيقات وأوليات</option>
                    <option value="court_filing">قيد وإيداع حوافظ</option>
                    <option value="property">معاينات عقارية</option>
                    <option value="admin">مهام إدارية</option>
                </select>

                <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
                    <span>إجمالي المواعيد: {filteredItems.length}</span>
                    {conflictAlerts.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-300">
                            {conflictAlerts.length} تضارب ⚠️
                        </span>
                    )}
                </div>
            </div>

            {/* Conflict Detection Banner Alert */}
            {conflictAlerts.length > 0 && (
                <div className="bg-rose-50/90 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-rose-600 text-white shadow-sm">
                                <ShieldAlert className="w-5 h-5 animate-pulse" />
                            </span>
                            <div>
                                <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 flex items-center gap-2">
                                    <span>تنبيه التضارب القضائي الزمني: اكتشاف {conflictAlerts.length} حالة تعارض!</span>
                                </h4>
                                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                                    تم رصد تكليف محامي أو موظف بأكثر من جلسة قضائية أو مهمة في نفس التاريخ والوقت.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {conflictAlerts.map((conf, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 shadow-2xs">
                                <div className="space-y-1">
                                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                                        👤 {conf.assignee} ({conf.date})
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">
                                        المواعيد المتعارضة: {conf.items.map(i => i.title).join(' ⚡ ')}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleAutoResolveConflict(conf)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 shadow-xs"
                                >
                                    حل التضارب تلقائياً
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VISUAL GANTT TIMELINE GRID WITH DRAG & DROP */}
            <div className="overflow-x-auto no-scrollbar border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
                <div className="min-w-[950px]">
                    
                    {/* Header Row (Dates) */}
                    <div className="grid grid-cols-12 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 py-3 px-4">
                        <div className="col-span-4 text-right flex items-center justify-between pe-4">
                            <span>المهمة والمكلف</span>
                            <span className="text-[9px] text-slate-400">اسحب الشريط للتغيير</span>
                        </div>
                        
                        <div className="col-span-8 grid grid-cols-7 text-center font-mono text-[10px] gap-1">
                            {timelineDates.slice(0, 7).map(d => {
                                const parts = d.split('-');
                                const dayNum = parts[2];
                                const monthNum = parts[1];
                                const dateObj = new Date(d);
                                const dayOfWeek = dateObj.getDay(); // 5 = Fri, 6 = Sat
                                const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                                const isToday = d === new Date().toISOString().split('T')[0];
                                const hasConflict = conflictAlerts.some(c => c.date === d);

                                return (
                                    <div 
                                        key={d} 
                                        className={`py-1.5 rounded-lg border transition-all ${
                                            hasConflict 
                                                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-300 font-bold' 
                                                : isToday
                                                    ? 'bg-amber-400 text-slate-950 font-black border-amber-500'
                                                    : isWeekend
                                                        ? 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 border-slate-200'
                                                        : 'border-transparent bg-white/40 dark:bg-slate-900/40'
                                        }`}
                                    >
                                        <div className="font-extrabold">{dayNum}/{monthNum}</div>
                                        <div className="text-[8px] opacity-80">
                                            {isToday ? 'اليوم' : isWeekend ? 'عطلة' : ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'][dayOfWeek]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                لا توجد مواعيد مطابقة لخيارات التصفية الحالية.
                            </div>
                        ) : (
                            filteredItems.map(item => {
                                const badge = categoryBadgeMap[item.category] || categoryBadgeMap['admin'];
                                const isBeingDragged = draggedItemId === item.id;
                                const isItemConflictedOverall = conflictAlerts.some(c =>
                                    c.assignee === item.assignee && c.items.some(i => i.id === item.id)
                                );

                                return (
                                    <div 
                                        key={item.id} 
                                        className={`grid grid-cols-12 items-center p-3 hover:bg-white dark:hover:bg-slate-900/80 transition-colors group ${
                                            isBeingDragged ? 'opacity-40 bg-amber-50/50' : ''
                                        } ${
                                            isItemConflictedOverall ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''
                                        }`}
                                    >
                                        {/* Task metadata column */}
                                        <div className="col-span-4 space-y-1 pe-3 border-e border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${badge.bg}`}>
                                                        {badge.name}
                                                    </span>
                                                    {isItemConflictedOverall && (
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse flex items-center gap-0.5 shadow-xs">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            تضارب زمني أحمر!
                                                        </span>
                                                    )}
                                                    {item.caseNumber && (
                                                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                                                            {item.caseNumber}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Edit / Delete quick buttons */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingItem(item);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-amber-500 rounded"
                                                        title="تعديل"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                                                <span className="truncate" title={item.title}>{item.title}</span>
                                            </h5>

                                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                                                <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                                                    <User className="w-3 h-3 text-amber-500" />
                                                    {item.assignee}
                                                </span>
                                                <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {item.startDate} ➔ {item.endDate}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Gantt Bar timeline dropzone column */}
                                        <div className="col-span-8 grid grid-cols-7 gap-1 p-1 items-center">
                                            {timelineDates.slice(0, 7).map(dateStr => {
                                                const isStart = item.startDate === dateStr;
                                                const isCovered = item.startDate <= dateStr && item.endDate >= dateStr;
                                                const isHoverTarget = hoveredDate === dateStr;

                                                const isCellConflicted = conflictAlerts.some(c => 
                                                    c.assignee === item.assignee && 
                                                    c.date === dateStr && 
                                                    c.items.some(i => i.id === item.id)
                                                );

                                                const taskBarClass = isCellConflicted
                                                    ? 'bg-rose-600 text-white font-black animate-pulse border-2 border-rose-300 ring-2 ring-rose-500/60 shadow-lg shadow-rose-600/50'
                                                    : badge.bg;

                                                return (
                                                    <div
                                                        key={dateStr}
                                                        onDragOver={(e) => handleDragOverCell(e, dateStr)}
                                                        onDrop={(e) => handleDropOnCell(e, dateStr)}
                                                        className={`h-9 rounded-xl flex items-center justify-center transition-all relative ${
                                                            isHoverTarget ? 'bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-500' : ''
                                                        }`}
                                                    >
                                                        {isCovered && (
                                                            <div
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, item.id)}
                                                                className={`w-full h-7 rounded-lg shadow-2xs px-2 flex items-center justify-between text-white text-[10px] font-bold cursor-grab active:cursor-grabbing hover:brightness-110 transition-all ${taskBarClass}`}
                                                                title={isCellConflicted 
                                                                    ? `⚠️ تضارب زمني أحمر للمكلف (${item.assignee}) في هذا التاريخ!` 
                                                                    : `سحب ونقل (${item.title}) - ${item.startDate} إلى ${item.endDate}`}
                                                            >
                                                                <div className="flex items-center gap-1 truncate me-1">
                                                                    <GripVertical className="w-3 h-3 shrink-0 opacity-70" />
                                                                    {isStart && (
                                                                        <span className="truncate flex items-center gap-1">
                                                                            {isCellConflicted && (
                                                                                <span className="bg-rose-950 text-rose-200 text-[8px] font-black px-1 rounded border border-rose-300 shrink-0">
                                                                                    ⚠️ تضارب!
                                                                                </span>
                                                                            )}
                                                                            <span>{item.title}</span>
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Date shift controls on hover */}
                                                                {isStart && (
                                                                    <div className="flex items-center gap-0.5 shrink-0 bg-black/20 p-0.5 rounded text-[9px]">
                                                                        <button 
                                                                            onClick={() => handleShiftDates(item.id, -1)}
                                                                            className="hover:text-amber-300 px-1 font-mono"
                                                                            title="تقديم يوم"
                                                                        >
                                                                            -1
                                                                        </button>
                                                                        <span>|</span>
                                                                        <button 
                                                                            onClick={() => handleShiftDates(item.id, 1)}
                                                                            className="hover:text-amber-300 px-1 font-mono"
                                                                            title="تأخير يوم"
                                                                        >
                                                                            +1
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>

            {/* CREATE / EDIT TASK MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                title={editingItem?.id ? 'تعديل موعد / مهمة قضائية' : 'إضافة موعد أو مهمة جديدة بالتقويم'}
                className="max-w-xl text-right rtl"
            >
                <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-right">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المهمة أو الميعاد القضائي *</label>
                        <Input
                            required
                            type="text"
                            value={editingItem?.title || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            placeholder="مثال: جلسة مرافعة بالطعن أسباب التمييز..."
                            className="text-xs text-right dark:bg-slate-800"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم القضية / الملف</label>
                            <Input
                                type="text"
                                value={editingItem?.caseNumber || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, caseNumber: e.target.value })}
                                placeholder="مثال: CASE-2026-8819"
                                className="text-xs text-right dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المحامي / الموظف المكلف *</label>
                            <Input
                                required
                                type="text"
                                value={editingItem?.assignee || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, assignee: e.target.value })}
                                placeholder="اسم المكلف..."
                                className="text-xs text-right dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التصنيف الإجرائي</label>
                            <select
                                value={editingItem?.category || 'litigation'}
                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                                <option value="litigation">جلسة قضائية</option>
                                <option value="investigation">تحقيق وأوليات</option>
                                <option value="court_filing">قيد وإيداع حوافظ</option>
                                <option value="property">معاينة عقارية</option>
                                <option value="admin">مهمة إدارية</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">جهة المحكمة / المكان</label>
                            <Input
                                type="text"
                                value={editingItem?.courtVenue || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, courtVenue: e.target.value })}
                                placeholder="مثال: قصر العدل / الرقعي..."
                                className="text-xs text-right dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ البدء *</label>
                            <Input
                                required
                                type="date"
                                value={editingItem?.startDate || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                                className="text-xs text-right dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الانتهاء *</label>
                            <Input
                                required
                                type="date"
                                value={editingItem?.endDate || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                                className="text-xs text-right dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                            className="text-xs font-bold"
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
                        >
                            حفظ وتحديث بالجدول
                        </Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};
