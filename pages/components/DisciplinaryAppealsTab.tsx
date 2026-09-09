import React, { useState, useMemo } from 'react';
import { 
    Undo2, Clock, CheckCircle2, XCircle, AlertTriangle, 
    ShieldCheck, PlusCircle, FileText, ArrowRight, Check, 
    User, Calendar, Scale, ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
    DisciplinaryRecord, 
    DisciplinaryActionStatus, 
    calculate20DayCountdown 
} from './DisciplinaryTypes';

interface DisciplinaryAppealsTabProps {
    records: DisciplinaryRecord[];
    onOpenNewAppealModal: () => void;
    onUpdateAppealStatus: (
        recordId: string, 
        resolution: 'accepted' | 'reduced' | 'rejected', 
        comment: string, 
        reducedSanction?: string
    ) => void;
}

export const DisciplinaryAppealsTab: React.FC<DisciplinaryAppealsTabProps> = ({
    records,
    onOpenNewAppealModal,
    onUpdateAppealStatus
}) => {
    const { addToast } = useToast();

    // Filter appeals only
    const appealsList = useMemo(() => {
        return records.filter(r => r.status === DisciplinaryActionStatus.APPEALED || r.appealsLogs);
    }, [records]);

    const [selectedAppealId, setSelectedAppealId] = useState<string>(appealsList[0]?.id || '');
    const [appealFilter, setAppealFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    
    // Adjudication inputs
    const [resolutionComment, setResolutionComment] = useState('');
    const [reducedSanctionText, setReducedSanctionText] = useState('تنبيه كتابي بدلاً من الخصم المالي');

    const filteredAppeals = useMemo(() => {
        return appealsList.filter(r => {
            if (appealFilter === 'pending') {
                return r.appealsLogs?.status === 'pending' || r.status === DisciplinaryActionStatus.APPEALED;
            }
            if (appealFilter === 'resolved') {
                return r.appealsLogs?.status !== 'pending' && r.status !== DisciplinaryActionStatus.APPEALED;
            }
            return true;
        });
    }, [appealsList, appealFilter]);

    const activeAppeal = useMemo(() => {
        return appealsList.find(r => r.id === selectedAppealId) || filteredAppeals[0] || appealsList[0];
    }, [appealsList, selectedAppealId, filteredAppeals]);

    // Handle Resolution Action
    const handleResolve = (action: 'accepted' | 'reduced' | 'rejected') => {
        if (!activeAppeal) return;
        if (!resolutionComment.trim()) {
            addToast({ 
                type: 'error', 
                title: 'تنبيه', 
                message: 'يرجى كتابة أسباب وحيثيات قرار البت في التظلم للتسجيل بالملف.' 
            });
            return;
        }

        onUpdateAppealStatus(
            activeAppeal.id, 
            action, 
            resolutionComment, 
            action === 'reduced' ? reducedSanctionText : undefined
        );

        setResolutionComment('');
        addToast({ 
            type: 'success', 
            title: 'تم إصدار قرار البت في التظلم', 
            message: `تم اعتماد القرار وتحديث السجل التأديبي للموظف ${activeAppeal.employeeName}.` 
        });
    };

    return (
        <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-xs">
                        <Undo2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                            سجل التظلمات والاعتراضات القانونية وقرارات البت
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                مهلة الـ 20 يوماً
                            </span>
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            المادة 102: يحق للعامل التظلم خلال 20 يوماً من تاريخ الإخطار وتلتزم الإدارة بالبت المسبب.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                        <button
                            onClick={() => setAppealFilter('all')}
                            className={`px-3 py-1 rounded-lg transition-all ${appealFilter === 'all' ? 'bg-white dark:bg-slate-900 text-[#113F36] dark:text-teal-400 shadow-xs' : 'text-slate-500'}`}
                        >
                            الكل ({appealsList.length})
                        </button>
                        <button
                            onClick={() => setAppealFilter('pending')}
                            className={`px-3 py-1 rounded-lg transition-all ${appealFilter === 'pending' ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs' : 'text-slate-500'}`}
                        >
                            قيد الدراسة ({appealsList.filter(r => r.status === DisciplinaryActionStatus.APPEALED).length})
                        </button>
                        <button
                            onClick={() => setAppealFilter('resolved')}
                            className={`px-3 py-1 rounded-lg transition-all ${appealFilter === 'resolved' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500'}`}
                        >
                            تم البت فيها
                        </button>
                    </div>

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenNewAppealModal}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-black text-xs h-9 px-4 rounded-xl shadow-xs"
                    >
                        <PlusCircle className="w-4 h-4 ml-1.5" />
                        تسجيل تظلم جديد
                    </Button>
                </div>
            </div>

            {/* Content: Appeals Stream + Adjudication Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Stream */}
                <div className="lg:col-span-6 space-y-3">
                    {filteredAppeals.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 font-bold text-xs">
                            لا توجد تظلمات مسجلة تطابق التصفية المختارة.
                        </div>
                    ) : (
                        filteredAppeals.map(rec => {
                            const isSelected = rec.id === activeAppeal?.id;
                            const countdown = calculate20DayCountdown(rec.notificationDate, rec.appealDeadlineDate);

                            return (
                                <div
                                    key={rec.id}
                                    onClick={() => setSelectedAppealId(rec.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden space-y-3 ${
                                        isSelected
                                            ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-400 shadow-md ring-1 ring-purple-400/30'
                                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-mono text-[10px] font-black text-purple-700 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-900/40 px-2 py-0.5 rounded-md">
                                                {rec.recordNumber}
                                            </span>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1">
                                                {rec.employeeName}
                                            </h4>
                                            <span className="text-[10px] text-slate-500">
                                                {rec.employeeJobTitle} • {rec.employeeDepartment}
                                            </span>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                            countdown.statusSeverity === 'urgent' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                            countdown.statusSeverity === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                            'bg-teal-100 text-teal-800 border-teal-300'
                                        }`}>
                                            {countdown.statusSeverity === 'urgent' ? 'عاجل جداً' :
                                             countdown.statusSeverity === 'warning' ? 'تنبيه مهلة' : 'آمن'}
                                        </span>
                                    </div>

                                    {/* Sanction and Reason */}
                                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xs space-y-1">
                                        <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                                            <span>العقوبة المعترض عليها:</span>
                                            <strong className="text-purple-700 dark:text-purple-400">{rec.sanctionType}</strong>
                                        </div>
                                        {rec.appealsLogs?.reason && (
                                            <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                                                «{rec.appealsLogs.reason}»
                                            </p>
                                        )}
                                    </div>

                                    {/* 20 Days progress */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-500">مهلة البت في التظلم:</span>
                                            <span className="font-mono">{countdown.remainingDays} / 20 يوماً متبقية</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${
                                                    countdown.statusSeverity === 'urgent' ? 'bg-rose-600' :
                                                    countdown.statusSeverity === 'warning' ? 'bg-amber-500' : 'bg-purple-600'
                                                }`}
                                                style={{ width: `${countdown.progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right Adjudication Console */}
                <div className="lg:col-span-6">
                    {activeAppeal ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs sticky top-6">
                            
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                                <span className="text-[10px] font-mono font-black text-purple-700 dark:text-purple-400 block">
                                    {activeAppeal.recordNumber}
                                </span>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                    منصة دراسة التظلم والبت القانوني المسبب
                                </h3>
                            </div>

                            {/* Appeal Details */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>مقدم التظلم:</span>
                                    <strong className="text-slate-900 dark:text-white">{activeAppeal.employeeName}</strong>
                                </div>
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>تاريخ تقديم التظلم:</span>
                                    <span className="font-mono">{activeAppeal.appealsLogs?.appealDate || activeAppeal.notificationDate}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-bold text-slate-500 block">عريضة وأسباب الاعتراض:</span>
                                    <p className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 leading-relaxed font-medium">
                                        {activeAppeal.appealsLogs?.reason || 'لا توجد عريضة مكتوبة مسجلة.'}
                                    </p>
                                </div>
                                {activeAppeal.appealsLogs?.evidenceNote && (
                                    <div className="space-y-1">
                                        <span className="font-bold text-slate-500 block">المستندات المؤيدة المرفقة:</span>
                                        <p className="p-2 bg-white dark:bg-slate-900 rounded-lg text-amber-900 dark:text-amber-300 text-[11px] border border-slate-200 dark:border-slate-700">
                                            {activeAppeal.appealsLogs.evidenceNote}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Adjudication Controls */}
                            <div className="space-y-3 pt-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white block">
                                    حيثيات قرار المستشار القانوني (صبري شطا):
                                </span>

                                <textarea
                                    value={resolutionComment}
                                    onChange={e => setResolutionComment(e.target.value)}
                                    rows={3}
                                    placeholder="اكتب الأسباب القانونية للبت في التظلم استناداً للائحة وقانون العمل الكويتي..."
                                    className="w-full text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#113F36]"
                                />

                                {/* If reducing, sanction text */}
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-bold block">العقوبة البديلة عند التخفيض:</span>
                                    <input
                                        type="text"
                                        value={reducedSanctionText}
                                        onChange={e => setReducedSanctionText(e.target.value)}
                                        className="w-full text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleResolve('accepted')}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[11px] h-9 rounded-xl shadow-xs"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                                        قبول وإلغاء الجزاء
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleResolve('reduced')}
                                        className="border-indigo-500 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 font-black text-[11px] h-9 rounded-xl"
                                    >
                                        <Scale className="w-3.5 h-3.5 ml-1" />
                                        تخفيض العقوبة
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleResolve('rejected')}
                                        className="border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50 font-black text-[11px] h-9 rounded-xl"
                                    >
                                        <XCircle className="w-3.5 h-3.5 ml-1" />
                                        رفض وتأييد القرار
                                    </Button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl text-center text-slate-400 text-xs font-bold">
                            اختر تظلماً من القائمة لبدء المراجعة والبت القانوني
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};
