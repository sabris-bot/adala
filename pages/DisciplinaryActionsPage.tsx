import React, { useState, useMemo, useEffect } from 'react';
import { 
    Scale, Activity, Clock, ShieldCheck, Undo2, Compass, 
    Printer, PlusCircle, LayoutDashboard, ListFilter, PenTool,
    Shield, CheckCircle2, ChevronRight, Award, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';

// Modular Components & Types
import { 
    DisciplinaryActionStatus, 
    InvestigationQuestion, 
    InvestigationTranscript, 
    DisciplinaryRecord,
    INITIAL_DISCIPLINARY_SEED
} from './components/DisciplinaryTypes';

import { DisciplinaryDashboardTab } from './components/DisciplinaryDashboardTab';
import { DisciplinaryRecordsTab } from './components/DisciplinaryRecordsTab';
import { DisciplinaryWorkbenchTab } from './components/DisciplinaryWorkbenchTab';
import { DisciplinarySimulatorTab } from './components/DisciplinarySimulatorTab';
import { DisciplinaryAppealsTab } from './components/DisciplinaryAppealsTab';
import { DisciplinaryPDFEngineModal } from './components/DisciplinaryPDFEngineModal';
import { NewDisciplinaryRecordModal } from './components/NewDisciplinaryRecordModal';
import { NewAppealModal } from './components/NewAppealModal';

// Re-export for backward compatibility
export { DisciplinaryActionStatus };
export type { InvestigationQuestion, InvestigationTranscript, DisciplinaryRecord };

export const DisciplinaryActionsPage: React.FC = () => {
    const { addToast } = useToast();

    // 1. Employees loaded from localStorage
    const [employees] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try { 
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch(e) {}
        }
        return [
            { id: 'emp-101', fullNameAr: 'فاطمة علي حسين السيد', civilId: '292081501234', jobTitle: 'مهندس تنفيذ وبناء أول', department: 'قسم الاستشارات والشركات' },
            { id: 'emp-102', fullNameAr: 'أحمد محمود مبارك', civilId: '295031209876', jobTitle: 'محاسب الخزانة والعهدة الرئيسية', department: 'الإدارة المالية' },
            { id: 'emp-103', fullNameAr: 'بدر فهد المطيري', civilId: '288110405678', jobTitle: 'مندوب ومتابع قضايا المحاكم', department: 'قسم التقاضي والمحاكم' },
            { id: 'emp-104', fullNameAr: 'سارة عبد الرحمن الدوسري', civilId: '294120803456', jobTitle: 'أخصائي شؤون قانونية وعقود', department: 'قسم العقود والتوثيق' }
        ];
    });

    // 2. Disciplinary Records loaded from localStorage
    const [records, setRecords] = useState<DisciplinaryRecord[]>(() => {
        const stored = localStorage.getItem('alwagayan_disciplinary');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return INITIAL_DISCIPLINARY_SEED;
    });

    useEffect(() => {
        localStorage.setItem('alwagayan_disciplinary', JSON.stringify(records));
    }, [records]);

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'analytics' | 'records' | 'workbench' | 'simulator' | 'appeals'>('analytics');
    
    // Selection state
    const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || 'da-101');

    // Modals
    const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState<boolean>(false);
    const [isNewAppealModalOpen, setIsNewAppealModalOpen] = useState<boolean>(false);
    const [appealTargetRecordId, setAppealTargetRecordId] = useState<string>('');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
    const [printTargetRecord, setPrintTargetRecord] = useState<DisciplinaryRecord | null>(null);

    // Pre-fill state from Simulator
    const [simPreFill, setSimPreFill] = useState<{
        violationType?: string;
        sanctionType?: string;
        deductionDays?: number;
    }>({});

    // Handlers
    const handleSaveNewRecord = (newRecord: DisciplinaryRecord) => {
        setRecords([newRecord, ...records]);
        setSelectedRecordId(newRecord.id);
        setActiveTab('records');
    };

    const handleSaveTranscript = (recordId: string, transcript: InvestigationTranscript) => {
        setRecords(records.map(r => {
            if (r.id === recordId) {
                return {
                    ...r,
                    investigationTranscript: transcript,
                    status: r.status === DisciplinaryActionStatus.PENDING ? DisciplinaryActionStatus.APPROVED : r.status
                };
            }
            return r;
        }));
    };

    const handleSubmitAppeal = (recordId: string, reason: string, evidenceNote: string) => {
        const today = new Date().toISOString().split('T')[0];
        const targetRec = records.find(r => r.id === recordId);
        const notifyDate = targetRec?.notificationDate || today;
        const deadlineDate = new Date(new Date(notifyDate).getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        setRecords(records.map(r => {
            if (r.id === recordId) {
                return {
                    ...r,
                    status: DisciplinaryActionStatus.APPEALED,
                    appealDeadlineDate: deadlineDate,
                    appealsLogs: {
                        appealDate: today,
                        reason,
                        evidenceNote,
                        status: 'pending',
                        comments: 'تم إيداع اعتراض الموظف رسمياً وبدأت مهلة البت (20 يوماً).'
                    }
                };
            }
            return r;
        }));

        setActiveTab('appeals');
        addToast({ 
            type: 'success', 
            title: 'تم تسجيل التظلم بنجاح', 
            message: 'تم إخطار المستشار القانوني وبدأ عداد مهلة الـ 20 يوماً.' 
        });
    };

    const handleUpdateAppealStatus = (
        recordId: string, 
        resolution: 'accepted' | 'reduced' | 'rejected', 
        comment: string, 
        reducedSanction?: string
    ) => {
        setRecords(records.map(r => {
            if (r.id === recordId) {
                let nextStatus = r.status;
                let nextSanction = r.sanctionType;

                if (resolution === 'accepted') {
                    nextStatus = DisciplinaryActionStatus.CANCELLED;
                    nextSanction = 'مُلغى بالكامل بموجب قرار التظلم';
                } else if (resolution === 'reduced') {
                    nextStatus = DisciplinaryActionStatus.REDUCED;
                    if (reducedSanction) nextSanction = reducedSanction;
                } else if (resolution === 'rejected') {
                    nextStatus = DisciplinaryActionStatus.APPROVED;
                }

                return {
                    ...r,
                    status: nextStatus,
                    sanctionType: nextSanction,
                    appealsLogs: r.appealsLogs ? {
                        ...r.appealsLogs,
                        status: resolution,
                        comments: comment
                    } : {
                        appealDate: new Date().toISOString().split('T')[0],
                        reason: 'تظلم رسمي',
                        status: resolution,
                        comments: comment
                    }
                };
            }
            return r;
        }));
    };

    const handleDeleteRecord = (recordId: string) => {
        if (records.length <= 1) {
            addToast({ type: 'warning', title: 'تنبيه', message: 'لا يمكن حذف كافة السجلات التأديبية.' });
            return;
        }
        setRecords(records.filter(r => r.id !== recordId));
        if (selectedRecordId === recordId) {
            setSelectedRecordId(records.find(r => r.id !== recordId)?.id || '');
        }
        addToast({ type: 'info', title: 'تم الحذف', message: 'تم إزالة السجل التأديبي بنجاح.' });
    };

    const handleQuickStatusChange = (id: string, newStatus: DisciplinaryActionStatus) => {
        setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
        addToast({ type: 'success', title: 'تم تحديث الحالة', message: `تم تعديل حالة القرار إلى: ${newStatus}` });
    };

    const handleApplyFromSimulator = (violationType: string, sanctionType: string, deductionDays: number) => {
        setSimPreFill({
            violationType,
            sanctionType,
            deductionDays
        });
        setIsNewRecordModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-right" dir="rtl">
            
            {/* 1. Main Header Title & Identity */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#113F36]/10 text-[#113F36] dark:text-teal-400 border border-[#113F36]/20">
                            نظام عدالة للمحاماة • إدارة شؤون الموظفين
                        </span>
                        <span className="text-xs text-[#C19A5B] font-bold">قانون العمل الكويتي رقم 6 لسنة 2010</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Scale className="w-7 h-7 text-[#113F36] dark:text-teal-400" />
                        الجزاءات التأديبية والتحقيقات الإدارية والتظلمات
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed font-medium">
                        المنصة الموحدة للتحقيقات القضائية، التدرج التأديبي (المادة 102)، محاكي الامتثال القانوني، وضمانات سماع الدفاع (المادة 35).
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            setSimPreFill({});
                            setIsNewRecordModalOpen(true);
                        }}
                        className="bg-[#113F36] hover:bg-[#0d312a] text-white font-black text-xs h-10 px-4 rounded-xl shadow-xs"
                    >
                        <PlusCircle className="w-4 h-4 ml-1.5 text-[#C19A5B]" />
                        قيد قرار تأديبي جديد
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setAppealTargetRecordId(selectedRecordId);
                            setIsNewAppealModalOpen(true);
                        }}
                        className="border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 font-bold text-xs h-10 px-4 rounded-xl"
                    >
                        <Undo2 className="w-4 h-4 ml-1.5" />
                        تقديم تظلم إلكتروني
                    </Button>
                </div>
            </div>

            {/* 2. Hydraulic Tab Navigation Bar */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto gap-1">
                
                {/* Tab 1: Dashboard */}
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        activeTab === 'analytics'
                            ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <LayoutDashboard className="w-4 h-4 text-[#C19A5B]" />
                    <span>لوحة المؤشرات والإحصائيات الحية</span>
                </button>

                {/* Tab 2: Records */}
                <button
                    onClick={() => setActiveTab('records')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        activeTab === 'records'
                            ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <ListFilter className="w-4 h-4 text-[#113F36] dark:text-teal-400" />
                    <span>سجل القرارات والملفات التأديبية ({records.length})</span>
                </button>

                {/* Tab 3: Workbench */}
                <button
                    onClick={() => setActiveTab('workbench')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        activeTab === 'workbench'
                            ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <PenTool className="w-4 h-4 text-[#D97706]" />
                    <span>منصة الاستجواب ومحاضر التحقيق (م 35)</span>
                </button>

                {/* Tab 4: Simulator */}
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        activeTab === 'simulator'
                            ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>محاكي قانون العمل والتدقيق الآلي</span>
                </button>

                {/* Tab 5: Appeals */}
                <button
                    onClick={() => setActiveTab('appeals')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        activeTab === 'appeals'
                            ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Undo2 className="w-4 h-4 text-purple-600" />
                    <span>سجل التظلمات (مهلة 20 يوماً)</span>
                </button>

            </div>

            {/* 3. Tab Contents with Fluid Hydraulic Motion Transitions */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    {activeTab === 'analytics' && (
                        <DisciplinaryDashboardTab
                            records={records}
                            onNavigateTab={setActiveTab}
                            onOpenNewRecordModal={() => {
                                setSimPreFill({});
                                setIsNewRecordModalOpen(true);
                            }}
                            onOpenNewAppealModal={() => {
                                setAppealTargetRecordId(selectedRecordId);
                                setIsNewAppealModalOpen(true);
                            }}
                            onSelectRecordForDossier={(id) => {
                                setSelectedRecordId(id);
                                setActiveTab('records');
                            }}
                        />
                    )}

                    {activeTab === 'records' && (
                        <DisciplinaryRecordsTab
                            records={records}
                            selectedRecordId={selectedRecordId}
                            onSelectRecord={setSelectedRecordId}
                            onOpenPrintModal={(rec) => {
                                setPrintTargetRecord(rec);
                                setIsPrintModalOpen(true);
                            }}
                            onOpenWorkbenchForRecord={(id) => {
                                setSelectedRecordId(id);
                                setActiveTab('workbench');
                            }}
                            onOpenNewRecordModal={() => {
                                setSimPreFill({});
                                setIsNewRecordModalOpen(true);
                            }}
                            onOpenAppealModalForRecord={(id) => {
                                setAppealTargetRecordId(id);
                                setIsNewAppealModalOpen(true);
                            }}
                            onDeleteRecord={handleDeleteRecord}
                            onQuickStatusChange={handleQuickStatusChange}
                        />
                    )}

                    {activeTab === 'workbench' && (
                        <DisciplinaryWorkbenchTab
                            records={records}
                            selectedRecordId={selectedRecordId}
                            onSelectRecordId={setSelectedRecordId}
                            onSaveTranscript={handleSaveTranscript}
                        />
                    )}

                    {activeTab === 'simulator' && (
                        <DisciplinarySimulatorTab
                            onApplyToNewDecision={handleApplyFromSimulator}
                        />
                    )}

                    {activeTab === 'appeals' && (
                        <DisciplinaryAppealsTab
                            records={records}
                            onOpenNewAppealModal={() => {
                                setAppealTargetRecordId(selectedRecordId);
                                setIsNewAppealModalOpen(true);
                            }}
                            onUpdateAppealStatus={handleUpdateAppealStatus}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* 4. Modals */}
            <NewDisciplinaryRecordModal
                isOpen={isNewRecordModalOpen}
                onClose={() => setIsNewRecordModalOpen(false)}
                employees={employees}
                onSaveRecord={handleSaveNewRecord}
                initialViolationType={simPreFill.violationType}
                initialSanctionType={simPreFill.sanctionType}
                initialDeductionDays={simPreFill.deductionDays}
            />

            <NewAppealModal
                isOpen={isNewAppealModalOpen}
                onClose={() => setIsNewAppealModalOpen(false)}
                records={records}
                initialRecordId={appealTargetRecordId || selectedRecordId}
                onSubmitAppeal={handleSubmitAppeal}
            />

            <DisciplinaryPDFEngineModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                record={printTargetRecord}
            />

        </div>
    );
};

export default DisciplinaryActionsPage;
