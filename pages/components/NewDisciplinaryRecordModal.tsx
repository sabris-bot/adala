import React, { useState } from 'react';
import { X, PlusCircle, Scale, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
    DisciplinaryRecord, 
    DisciplinaryActionStatus, 
    VIOLATIONS_LAW_CATALOG, 
    KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS 
} from './DisciplinaryTypes';

interface NewDisciplinaryRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: any[];
    onSaveRecord: (newRecord: DisciplinaryRecord) => void;
    initialViolationType?: string;
    initialSanctionType?: string;
    initialDeductionDays?: number;
}

export const NewDisciplinaryRecordModal: React.FC<NewDisciplinaryRecordModalProps> = ({
    isOpen,
    onClose,
    employees,
    onSaveRecord,
    initialViolationType,
    initialSanctionType,
    initialDeductionDays
}) => {
    const { addToast } = useToast();

    if (!isOpen) return null;

    const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'emp-101');
    const [violationType, setViolationType] = useState<string>(initialViolationType || VIOLATIONS_LAW_CATALOG[0].type);
    const [violationDate, setViolationDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [notificationDate, setNotificationDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [investigationNo, setInvestigationNo] = useState<string>(`QA-INV-2026-${Math.floor(100 + Math.random() * 900)}`);
    const [sanctionType, setSanctionType] = useState<string>(initialSanctionType || 'خصم من الراتب (يومان)');
    const [deductionDays, setDeductionDays] = useState<number>(initialDeductionDays || 2);
    const [details, setDetails] = useState<string>('');
    const [evidenceNotes, setEvidenceNotes] = useState<string>('');

    const handleEmployeeChange = (empId: string) => {
        setSelectedEmpId(empId);
    };

    const handleSave = () => {
        const emp = employees.find(e => e.id === selectedEmpId) || {
            fullNameAr: 'موظف تجريبي',
            civilId: '290000000000',
            jobTitle: 'موظف',
            department: 'الإدارة العامة'
        };

        if (!details.trim()) {
            addToast({ type: 'error', title: 'خطأ بالبيانات', message: 'يرجى كتابة تفاصيل وحيثيات المخالفة المرتكبة.' });
            return;
        }

        // Validate deduction days
        if (deductionDays > KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS.maxDeductionDaysPerViolation) {
            addToast({ 
                type: 'error', 
                title: 'تجاوز الحد القانوني (المادة 102)', 
                message: 'يحظر قانون العمل الكويتي خصم أكثر من أجر 5 أيام عن المخالفة الواحدة.' 
            });
            return;
        }

        const appealDeadline = new Date(new Date(notificationDate).getTime() + 20 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];

        const newRec: DisciplinaryRecord = {
            id: `da-${Date.now()}`,
            recordNumber: `QA-DISC-2026-${Math.floor(100 + Math.random() * 900)}`,
            employeeId: emp.id || 'emp-custom',
            employeeName: emp.fullNameAr || emp.name || 'موظف',
            civilId: emp.civilId || '290000000000',
            employeeJobTitle: emp.jobTitle || 'موظف',
            employeeDepartment: emp.department || 'القسم الإداري',
            violationType,
            violationDate,
            notificationDate,
            relatedInvestigationNo: investigationNo,
            sanctionType: deductionDays > 0 ? `خصم من الراتب (${deductionDays} أيام)` : sanctionType,
            deductionDays: deductionDays > 0 ? deductionDays : undefined,
            details,
            evidenceNotes,
            status: DisciplinaryActionStatus.APPROVED,
            issueDate: notificationDate,
            appealDeadlineDate: appealDeadline,
            createdAt: new Date().toISOString().split('T')[0]
        };

        onSaveRecord(newRec);
        onClose();
        addToast({ 
            type: 'success', 
            title: 'تم قيد القرار التأديبي بنجاح', 
            message: `تم اعتماد القرار وتفعيل عداد مهلة الـ 20 يوماً للتظلم.` 
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#113F36] dark:text-teal-400 flex items-center justify-center">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                قيد قرار تأديبي جديد (New Disciplinary Action)
                            </h3>
                            <p className="text-[10px] text-slate-500">
                                استيفاء ضمانات المادة 35 وتطبيق سلم العقوبات وفق المادة 102 من قانون العمل
                            </p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 text-xs font-bold max-h-[65vh] overflow-y-auto pr-1">
                    
                    {/* Employee Selector */}
                    <div>
                        <label className="text-slate-700 dark:text-slate-300 block mb-1">الموظف المعني بالقرار:</label>
                        <select
                            value={selectedEmpId}
                            onChange={e => handleEmployeeChange(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        >
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.fullNameAr || e.name} ({e.jobTitle || 'موظف'} - {e.civilId || ''})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Violation Type & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 dark:text-slate-300 block mb-1">تصنيف المخالفة القانونية:</label>
                            <select
                                value={violationType}
                                onChange={e => setViolationType(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                            >
                                {VIOLATIONS_LAW_CATALOG.map((v, idx) => (
                                    <option key={idx} value={v.type}>{v.type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-slate-700 dark:text-slate-300 block mb-1">رقم محضر التحقيق المرفق:</label>
                            <input
                                type="text"
                                value={investigationNo}
                                onChange={e => setInvestigationNo(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 dark:text-slate-300 block mb-1">تاريخ ارتكاب المخالفة:</label>
                            <input
                                type="date"
                                value={violationDate}
                                onChange={e => setViolationDate(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="text-slate-700 dark:text-slate-300 block mb-1">تاريخ الإبلاغ الرسمي:</label>
                            <input
                                type="date"
                                value={notificationDate}
                                onChange={e => setNotificationDate(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Sanction Choice & Deduction Days */}
                    <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 rounded-xl space-y-3">
                        <span className="text-[11px] font-black text-[#113F36] dark:text-teal-400 block">
                            تحديد العقوبة المعتمدة (المادة 102):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1">نوع الجزاء:</label>
                                <select
                                    value={sanctionType}
                                    onChange={e => setSanctionType(e.target.value)}
                                    className="w-full border border-teal-200 dark:border-teal-800 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                                >
                                    <option value="إنذار كتابي أول">إنذار كتابي أول</option>
                                    <option value="إنذار كتابي شديد اللهجة">إنذار كتابي شديد اللهجة</option>
                                    <option value="خصم من الراتب">خصم من الراتب (محدد بالأيام)</option>
                                    <option value="إيقاف مؤقت عن العمل">إيقاف مؤقت عن العمل</option>
                                    <option value="فصل تأديبي (المادة 41)">فصل تأديبي بموجب المادة 41</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1">أيام الخصم (الحد الأقصى 5 أيام):</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    value={deductionDays}
                                    onChange={e => setDeductionDays(Number(e.target.value))}
                                    className="w-full border border-teal-200 dark:border-teal-800 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details and Evidence */}
                    <div>
                        <label className="text-slate-700 dark:text-slate-300 block mb-1">حيثيات ووقائع المخالفة:</label>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="اكتب شرحاً مفصلاً لما ثبت بحق الموظف استناداً للتحقيقات..."
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 dark:text-slate-300 block mb-1">الأدلة والقرائن الثابتة:</label>
                        <input
                            type="text"
                            value={evidenceNotes}
                            onChange={e => setEvidenceNotes(e.target.value)}
                            placeholder="مثال: تسجيل كاميرات، تقرير جرد، سجل البصمة الإلكترونية..."
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
                        onClick={handleSave}
                        className="bg-[#113F36] hover:bg-[#0d312a] text-white font-black text-xs px-5 rounded-xl shadow-xs"
                    >
                        <PlusCircle className="w-4 h-4 ml-1.5 text-[#C19A5B]" />
                        اعتماد وقيد القرار
                    </Button>
                </div>

            </div>
        </div>
    );
};
