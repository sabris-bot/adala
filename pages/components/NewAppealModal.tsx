import React, { useState } from 'react';
import { X, Undo2, Scale, Clock, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { DisciplinaryRecord, calculate20DayCountdown } from './DisciplinaryTypes';

interface NewAppealModalProps {
    isOpen: boolean;
    onClose: () => void;
    records: DisciplinaryRecord[];
    initialRecordId?: string;
    onSubmitAppeal: (recordId: string, reason: string, evidenceNote: string) => void;
}

export const NewAppealModal: React.FC<NewAppealModalProps> = ({
    isOpen,
    onClose,
    records,
    initialRecordId,
    onSubmitAppeal
}) => {
    const { addToast } = useToast();

    if (!isOpen) return null;

    const [selectedRecordId, setSelectedRecordId] = useState<string>(initialRecordId || records[0]?.id || '');
    const [reason, setReason] = useState<string>('');
    const [evidenceNote, setEvidenceNote] = useState<string>('');

    const targetRecord = records.find(r => r.id === selectedRecordId) || records[0];
    const countdown = targetRecord ? calculate20DayCountdown(targetRecord.notificationDate, targetRecord.appealDeadlineDate) : null;

    const handleSubmit = () => {
        if (!selectedRecordId) {
            addToast({ type: 'error', title: 'خطأ', message: 'يرجى اختيار القرار التأديبي المراد التظلم منه.' });
            return;
        }
        if (!reason.trim()) {
            addToast({ type: 'error', title: 'خطأ', message: 'يرجى كتابة أسباب الاعتراض وعريضة الدفاع.' });
            return;
        }

        onSubmitAppeal(selectedRecordId, reason, evidenceNote);
        onClose();
        setReason('');
        setEvidenceNote('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                            <Undo2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                تقديم تظلم واعتراض إلكتروني (Lodge Legal Appeal)
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono">
                                تسجيل رسمي لدى الإدارة القانونية بموجب المادة 102 (مهلة 20 يوماً)
                            </p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="space-y-4 text-xs font-bold">
                    
                    {/* Record Selection */}
                    <div>
                        <label className="text-slate-700 dark:text-slate-300 block mb-1">اختر القرار التأديبي المعترض عليه:</label>
                        <select
                            value={selectedRecordId}
                            onChange={e => setSelectedRecordId(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        >
                            {records.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.recordNumber} - {r.employeeName} ({r.sanctionType})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Summary Box */}
                    {targetRecord && countdown && (
                        <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 rounded-xl space-y-1.5 text-slate-800 dark:text-slate-200">
                            <div className="flex justify-between">
                                <span>الموظف: <strong className="text-slate-900 dark:text-white">{targetRecord.employeeName}</strong></span>
                                <span className="font-mono text-purple-700 dark:text-purple-400">{targetRecord.recordNumber}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                                <span>العقوبة الحالية: {targetRecord.sanctionType}</span>
                                <span>المهلة المتبقية: <strong className="text-purple-800 dark:text-purple-300">{countdown.remainingDays} / 20 يوماً</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Defense Reason */}
                    <div>
                        <label className="text-slate-700 dark:text-slate-300 block mb-1">عريضة وأسباب الاعتراض على القرار:</label>
                        <textarea
                            rows={4}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="اكتب أسباب طلب إعادة النظر، الظروف الاستثنائية، أو الدفوع القانونية والموضوعية..."
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-purple-500"
                        />
                    </div>

                    {/* Evidence Attachment description */}
                    <div>
                        <label className="text-slate-700 dark:text-slate-300 block mb-1">بيان المستندات والأدلة المؤيدة للدفاع:</label>
                        <input
                            type="text"
                            value={evidenceNote}
                            onChange={e => setEvidenceNote(e.target.value)}
                            placeholder="مثال: شهادة طبية، إفادة رئيس القسم، سجل الدخول الإلكتروني..."
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSubmit}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-black text-xs px-5 rounded-xl shadow-xs"
                    >
                        <Undo2 className="w-4 h-4 ml-1.5" />
                        إيداع التظلم رسمياً
                    </Button>
                </div>

            </div>
        </div>
    );
};
