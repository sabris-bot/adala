
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Case, CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel, Hearing, CaseFile, ExecutionActionType, ExecutionActionStatus, ExpertActionStatus, ExpertField, ExecutionAction, ExpertAction, LitigationStage, NotificationStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import LegalRoleSelector from '../components/LegalRoleSelector';
import SignaturePad from '../components/ui/SignaturePad';
import PrintHeader from '../components/ui/PrintHeader';
import { CaseStatusBadge, RiskLevelBadge, PriorityBadge, ExecutionActionStatusBadge, ExpertActionStatusBadge } from '../components/ui/Badge'; 
import { 
    BriefcaseIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    PrinterIcon, DocumentDuplicateIcon, MagnifyingGlassIcon, ScaleIcon, 
    GavelIcon, ClockIcon, BrainIcon, DocumentTextIcon, TagIcon,
    ActivityIcon, CheckCircleIcon, SparklesIcon, HistoryIcon, 
    ArrowPathIcon, ClipboardIcon, InformationCircleIcon, SearchIcon, FileEditIcon,
    XCircleIcon, BanknotesIcon, TrendingUpIcon, BellAlertIcon, BuildingLibraryIcon,
    ViewColumnsIcon
} from '../constants'; 
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react'; 
import { geminiService } from '../services/geminiService';
import { 
    caseStatusOptions, 
    courtDegreeOptions,
    caseGroupOptions,
    partyRoleOptions,
    hearingTypeOptions,
    reportTypeOptions,
    caseMainTypeOptions,
    riskLevelOptions,
    casePriorityOptions,
    caseFilterStatusOptions,
    KUWAIT_COURTS_LIST,
    courtLevelOptions,
    executionActionTypeOptions,
    executionActionStatusOptions,
    expertFieldOptions,
    expertActionStatusOptions,
    litigationStageOptions,
    notificationStatusOptions
} from '../constants';

import { useToast } from '../components/ui/Toast';
import { initialCases } from '../data/caseData';
import { useJurisdiction } from '../components/JurisdictionContext';
import { useNavigate } from 'react-router-dom';

const initialFilters = {
    internalCaseNumber: '',
    clientName: '',
    clientRole: '',
    opponentName: '',
    opponentRole: '',
    consultant: '',
    court: '',
    hearingType: '',
    courtLevel: '',
    status: '',
    reportType: '',
    group: '',
    automatedNo: '',
    caseNumber: '',
    fromDate: '',
    toDate: '',
};

// --- Helper for role display ---
const formatRole = (role: string | string[] | undefined) => {
    if (!role) return '';
    if (Array.isArray(role)) return role.join('، ');
    return role;
};

const renderRoleBadge = (role: string | string[] | undefined, type: 'client' | 'opponent') => {
    if (!role) return null;
    const roles = Array.isArray(role) ? role : [role];
    return (
        <div className="flex flex-wrap gap-1 mt-0.5">
            {roles.map((r, i) => {
                const isPlaintiff = ['مدعي', 'طالب', 'شاكي', 'طالب تنفيذ', 'طاعن', 'مستأنف', 'طالب أمر', 'دائن', 'مستفيد'].includes(r);
                const isDefendant = ['مدعى عليه', 'مطلوب ضده', 'مشكو في حقه', 'منفذ ضده', 'متهم', 'مستأنف ضده', 'مطعون ضده', 'مدين'].includes(r);
                
                let badgeClass = "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50";
                if (type === 'client') {
                    if (isPlaintiff) {
                        badgeClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20";
                    } else if (isDefendant) {
                        badgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/20";
                    } else {
                        badgeClass = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20";
                    }
                } else {
                    // opponent
                    if (isDefendant) {
                        badgeClass = "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/20";
                    } else if (isPlaintiff) {
                        badgeClass = "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100/30 dark:border-sky-900/20";
                    } else {
                        badgeClass = "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50";
                    }
                }

                return (
                    <span 
                        key={i} 
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-tight leading-none ${badgeClass}`}
                    >
                        {r}
                    </span>
                );
            })}
        </div>
    );
};

// --- Case Details Modal Component ---
interface CaseDetailsModalProps {
    caseItem: Case;
    onClose: () => void;
    onUpdateCase: (updatedCase: Case) => void;
    onPrint?: () => void;
}

const ExecutionProgressTracker: React.FC<{ status: ExecutionActionStatus }> = ({ status }) => {
    const { t } = useTranslation();
    const steps = [
        { label: t('submit_request', { defaultValue: 'تقديم الطلب' }), statuses: [ExecutionActionStatus.PENDING_SUBMISSION, ExecutionActionStatus.SUBMITTED_PENDING_DECISION, ExecutionActionStatus.ACTIVE, ExecutionActionStatus.PARTIALLY_COMPLETED, ExecutionActionStatus.COMPLETED] },
        { label: t('execution_decision', { defaultValue: 'قرار التنفيذ' }), statuses: [ExecutionActionStatus.SUBMITTED_PENDING_DECISION, ExecutionActionStatus.ACTIVE, ExecutionActionStatus.PARTIALLY_COMPLETED, ExecutionActionStatus.COMPLETED] },
        { label: t('start_effect', { defaultValue: 'بدء السريان' }), statuses: [ExecutionActionStatus.ACTIVE, ExecutionActionStatus.PARTIALLY_COMPLETED, ExecutionActionStatus.COMPLETED] },
        { label: t('final_execution', { defaultValue: 'التنفيذ النهائي' }), statuses: [ExecutionActionStatus.COMPLETED] },
    ];

    const currentStepIndex = [...steps].reverse().findIndex(step => step.statuses.includes(status));
    const finalIndex = currentStepIndex === -1 ? -1 : steps.length - 1 - currentStepIndex;

    return (
        <div className="flex items-center w-full mt-6 mb-4 px-4 bg-slate-50 py-4 rounded-2xl border border-slate-100">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center relative flex-1">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black z-10 transition-all duration-500 shadow-sm ${index <= finalIndex ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-white text-slate-300 border border-slate-100'}`}>
                            {index + 1}
                        </div>
                        <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${index <= finalIndex ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`h-1 flex-1 -mt-6 transition-all duration-700 rounded-full ${index < finalIndex ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const ExpertProgressTracker: React.FC<{ status: ExpertActionStatus }> = ({ status }) => {
    const { t } = useTranslation();
    const steps = [
        { label: t('expert_assign', { defaultValue: 'ندب الخبير' }), statuses: [ExpertActionStatus.PENDING_ASSIGNMENT, ExpertActionStatus.IN_PROGRESS, ExpertActionStatus.REPORT_SUBMITTED, ExpertActionStatus.AWAITING_DISCUSSION, ExpertActionStatus.COMPLETED] },
        { label: t('start_task', { defaultValue: 'مباشرة المهمة' }), statuses: [ExpertActionStatus.IN_PROGRESS, ExpertActionStatus.REPORT_SUBMITTED, ExpertActionStatus.AWAITING_DISCUSSION, ExpertActionStatus.COMPLETED] },
        { label: t('submit_report', { defaultValue: 'إيداع التقرير' }), statuses: [ExpertActionStatus.REPORT_SUBMITTED, ExpertActionStatus.AWAITING_DISCUSSION, ExpertActionStatus.COMPLETED] },
        { label: t('discussion_finish', { defaultValue: 'المناقشة/الانتهاء' }), statuses: [ExpertActionStatus.AWAITING_DISCUSSION, ExpertActionStatus.COMPLETED] },
    ];

    const currentStepIndex = [...steps].reverse().findIndex(step => step.statuses.includes(status));
    const finalIndex = currentStepIndex === -1 ? -1 : steps.length - 1 - currentStepIndex;

    return (
        <div className="flex items-center w-full mt-6 mb-4 px-4 bg-slate-50 py-4 rounded-2xl border border-slate-100">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center relative flex-1">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black z-10 transition-all duration-500 shadow-sm ${index <= finalIndex ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-white text-slate-300 border border-slate-100'}`}>
                            {index + 1}
                        </div>
                        <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${index <= finalIndex ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`h-1 flex-1 -mt-6 transition-all duration-700 rounded-full ${index < finalIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const ExecutionActionForm: React.FC<{
    initialData?: Partial<ExecutionAction>;
    onSubmit: (action: ExecutionAction) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [formData, setFormData] = useState<Partial<ExecutionAction>>(
        initialData || {
            actionType: ExecutionActionType.TRAVEL_BAN,
            status: ExecutionActionStatus.PENDING_SUBMISSION,
            applicationDate: new Date().toISOString().split('T')[0],
            lawyerSignature: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.actionType || !formData.applicationDate) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى تعبئة الحقول الإلزامية لتسجيل الإجراء.'
            });
            return;
        }

        if (!formData.lawyerSignature) {
            setShowSignaturePad(true);
            return;
        }

        onSubmit({
            ...formData,
            id: formData.id || `exec-${Date.now()}`,
        } as ExecutionAction);
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h5 className="font-bold text-sm border-b pb-2 mb-3">{initialData?.id ? t('edit_execution_action', { defaultValue: 'تعديل إجراء تنفيذي' }) : t('add_execution_action', { defaultValue: 'إضافة إجراء تنفيذي جديد' })}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="actionType" label={t('action_type_req', { defaultValue: 'نوع الإجراء (*)' })} value={formData.actionType} options={executionActionTypeOptions} onChange={handleChange} required />
                    <Select name="status" label={t('status_req', { defaultValue: 'الحالة (*)' })} value={formData.status} options={executionActionStatusOptions} onChange={handleChange} required />
                    <Input name="applicationDate" label={t('application_date_req', { defaultValue: 'تاريخ التقديم (*)' })} type="date" value={formData.applicationDate || ''} onChange={handleChange} required />
                    <Input name="decisionDate" label={t('decision_date', { defaultValue: 'تاريخ القرار' })} type="date" value={formData.decisionDate || ''} onChange={handleChange} />
                    <Input name="effectiveDate" label={t('effective_date', { defaultValue: 'تاريخ السريان' })} type="date" value={formData.effectiveDate || ''} onChange={handleChange} />
                    <Input name="referenceNumber" label={t('reference_number', { defaultValue: 'رقم المرجع/الملف' })} value={formData.referenceNumber || ''} onChange={handleChange} />
                    <Input name="amountInvolved" label={t('amount_involved', { defaultValue: 'المبلغ المرتبط (إن وجد)' })} type="number" value={formData.amountInvolved || ''} onChange={handleChange} />
                    <Input name="targetDetails" label={t('target_details', { defaultValue: 'تفاصيل الهدف (حساب/مركبة/إلخ)' })} value={formData.targetDetails || ''} onChange={handleChange} />
                </div>
                <TextArea name="notes" label={t('notes', { defaultValue: 'ملاحظات' })} value={formData.notes || ''} onChange={handleChange} rows={2} />
                
                {formData.lawyerSignature && (
                    <div className="flex flex-col items-center p-3 border rounded bg-white w-fit mx-auto">
                        <p className="text-[10px] font-bold mb-2">توقيع المحامي المسؤول</p>
                        <img src={formData.lawyerSignature} alt="Lawyer Signature" className="h-12 border p-1" />
                        <Button variant="ghost" size="sm" className="mt-1 text-primary" onClick={() => setShowSignaturePad(true)}>إعادة التوقيع</Button>
                    </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                    <Button type="submit" size="sm">{formData.lawyerSignature ? t('save_action', { defaultValue: 'حفظ الإجراء' }) : t('proceed_to_sign', { defaultValue: 'التوقيع والاعتماد' })}</Button>
                </div>
            </form>

            {showSignaturePad && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dm-card p-6 rounded-2xl shadow-2xl max-w-lg w-full">
                        <SignaturePad 
                            title="توقيع المحامي المسؤول على الإجراء التنفيذي"
                            onSave={(sig) => {
                                setFormData(p => ({ ...p, lawyerSignature: sig }));
                                setShowSignaturePad(false);
                            }}
                            onCancel={() => setShowSignaturePad(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const ExpertActionForm: React.FC<{
    initialData?: Partial<ExpertAction>;
    onSubmit: (action: ExpertAction) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [formData, setFormData] = useState<Partial<ExpertAction>>(
        initialData || {
            status: ExpertActionStatus.PENDING_ASSIGNMENT,
            referralDate: new Date().toISOString().split('T')[0],
            expertField: ExpertField.ACCOUNTING,
            lawyerSignature: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.assignedTask || !formData.referralDate) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى تحديد المهمة الموكلة للخبير وتاريخ الإحالة.'
            });
            return;
        }

        if (!formData.lawyerSignature) {
            setShowSignaturePad(true);
            return;
        }

        onSubmit({
            ...formData,
            id: formData.id || `exp-${Date.now()}`,
        } as ExpertAction);
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h5 className="font-bold text-sm border-b pb-2 mb-3">{initialData?.id ? t('edit_expert_action', { defaultValue: 'تعديل إجراء خبير' }) : t('add_expert_action', { defaultValue: 'إضافة إجراء خبير جديد' })}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="expertField" label={t('expert_field_req', { defaultValue: 'مجال الخبرة (*)' })} value={formData.expertField} options={expertFieldOptions} onChange={handleChange} required />
                    <Select name="status" label={t('status_req', { defaultValue: 'الحالة (*)' })} value={formData.status} options={expertActionStatusOptions} onChange={handleChange} required />
                    <Input name="referralDate" label={t('referral_date_req', { defaultValue: 'تاريخ الإحالة (*)' })} type="date" value={formData.referralDate || ''} onChange={handleChange} required />
                    <Input name="expertName" label={t('expert_name', { defaultValue: 'اسم الخبير المنتدب' })} value={formData.expertName || ''} onChange={handleChange} />
                    <Input name="reportSubmissionDate" label={t('report_submission_date', { defaultValue: 'تاريخ إيداع التقرير' })} type="date" value={formData.reportSubmissionDate || ''} onChange={handleChange} />
                    <Input name="reportDiscussionDate" label={t('report_discussion_date', { defaultValue: 'تاريخ جلسة المناقشة' })} type="date" value={formData.reportDiscussionDate || ''} onChange={handleChange} />
                </div>
                <TextArea name="assignedTask" label={t('assigned_task_req', { defaultValue: 'المهمة الموكلة (*)' })} value={formData.assignedTask || ''} onChange={handleChange} rows={2} required />
                <TextArea name="notes" label={t('additional_notes', { defaultValue: 'ملاحظات إضافية' })} value={formData.notes || ''} onChange={handleChange} rows={2} />
                
                {formData.lawyerSignature && (
                    <div className="flex flex-col items-center p-3 border rounded bg-white w-fit mx-auto">
                        <p className="text-[10px] font-bold mb-2">توقيع المحامي المسؤول (متابعة الخبراء)</p>
                        <img src={formData.lawyerSignature} alt="Lawyer Signature" className="h-12 border p-1" />
                        <Button variant="ghost" size="sm" className="mt-1 text-primary" onClick={() => setShowSignaturePad(true)}>إعادة التوقيع</Button>
                    </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                    <Button type="submit" size="sm">{formData.lawyerSignature ? t('save_data', { defaultValue: 'حفظ البيانات' }) : t('proceed_to_sign', { defaultValue: 'التوقيع والاعتماد' })}</Button>
                </div>
            </form>

            {showSignaturePad && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dm-card p-6 rounded-2xl shadow-2xl max-w-lg w-full">
                        <SignaturePad 
                            title="توقيع المحامي المسؤول على متابعة مهمة الخبير"
                            onSave={(sig) => {
                                setFormData(p => ({ ...p, lawyerSignature: sig }));
                                setShowSignaturePad(false);
                            }}
                            onCancel={() => setShowSignaturePad(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Hearing Form Component ---
const HearingForm: React.FC<{
    initialData?: Partial<Hearing>;
    onSubmit: (hearing: Hearing) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [formData, setFormData] = useState<Partial<Hearing>>(
        initialData || {
            type: 'مرافعة',
            status: 'Scheduled',
            date: new Date().toISOString().split('T')[0],
            lawyerSignature: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.type || !formData.date) {
            addToast({
                type: 'warning',
                title: 'تنبيه',
                message: 'يجب اختيار نوع الجلسة وتاريخها.'
            });
            return;
        }

        if (!formData.lawyerSignature && formData.status === 'Completed') {
            setShowSignaturePad(true);
            return;
        }

        onSubmit({
            ...formData,
            id: formData.id || `hear-${Date.now()}`,
        } as Hearing);
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-slate-50 rounded-[32px] border-2 border-slate-100 shadow-inner">
                <h5 className="font-black text-lg text-slate-800 border-b-2 border-white pb-4 mb-6 italic">{initialData?.id ? t('edit_hearing_details', { defaultValue: 'تعديل تفاصيل الجلسة' }) : t('record_new_hearing', { defaultValue: 'قيد جلسة جديدة بالنظام' })}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select name="type" label={t('hearing_type_req', { defaultValue: 'نوع الجلسة (*)' })} value={formData.type} options={hearingTypeOptions} onChange={handleChange} required />
                    <Select name="status" label={t('hearing_status_req', { defaultValue: 'حالة الجلسة (*)' })} value={formData.status} options={[
                        { label: 'مجدولة', value: 'Scheduled' },
                        { label: 'منتهية', value: 'Completed' },
                        { label: 'مؤجلة', value: 'Postponed' },
                        { label: 'ملغاة', value: 'Cancelled' }
                    ]} onChange={handleChange} required />
                    <Input name="date" label={t('hearing_date_req', { defaultValue: 'تاريخ الجلسة (*)' })} type="date" value={formData.date || ''} onChange={handleChange} required />
                    <Input name="courtRoomOrLocation" label={t('court_hall', { defaultValue: 'رقم القاعة / الموقع' })} value={formData.courtRoomOrLocation || ''} onChange={handleChange} />
                    <Input name="nextHearingDate" label={t('deferred_to_date', { defaultValue: 'تاريخ الجلسة القادمة (إن وجد)' })} type="date" value={formData.nextHearingDate || ''} onChange={handleChange} />
                </div>
                <TextArea name="notes" label={t('hearing_minutes_summary', { defaultValue: 'ملخص وقائع الجلسة والقرار' })} value={formData.notes || ''} onChange={handleChange} rows={3} />
                
                {formData.lawyerSignature && (
                    <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white w-fit mx-auto shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">توقيع المحامي الحاضر للجلسة</p>
                        <img src={formData.lawyerSignature} alt="Lawyer Signature" className="h-16 mix-blend-multiply border-b border-gray-100 pb-2" />
                        <Button variant="ghost" size="sm" className="mt-2 text-indigo-600 font-bold" onClick={() => setShowSignaturePad(true)}>إعادة التوقيع</Button>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" className="rounded-2xl px-8 h-12 font-black" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                    <Button type="submit" className="rounded-2xl px-10 h-12 font-black bg-slate-900 shadow-xl shadow-slate-900/10">
                        {(!formData.lawyerSignature && formData.status === 'Completed') ? t('proceed_to_sign_minutes', { defaultValue: 'التوقيع واعتماد المحضر' }) : t('save_hearing_record', { defaultValue: 'حفظ سجل الجلسة' })}
                    </Button>
                </div>
            </form>

            {showSignaturePad && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] max-w-xl w-full">
                        <SignaturePad 
                            title="توقيع المحامي على محضر وقائع الجلسة"
                            onSave={(sig) => {
                                setFormData(p => ({ ...p, lawyerSignature: sig }));
                                setShowSignaturePad(false);
                            }}
                            onCancel={() => setShowSignaturePad(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ caseItem, onClose, onUpdateCase }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'details' | 'legal' | 'hearings' | 'archive' | 'execution' | 'financials' | 'notes' | 'ai'>('details');

    // --- State for Execution & Expert ---
    const [isAddingExecAction, setIsAddingExecAction] = useState(false);
    const [editingExecAction, setEditingExecAction] = useState<ExecutionAction | null>(null);
    const [isAddingExpertAction, setIsAddingExpertAction] = useState(false);
    const [editingExpertAction, setEditingExpertAction] = useState<ExpertAction | null>(null);
    const [isAddingHearing, setIsAddingHearing] = useState(false);
    const [editingHearing, setEditingHearing] = useState<Hearing | null>(null);

    // --- AI Analysis State ---
    const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);
    const [analyzedFiles, setAnalyzedFiles] = useState<Record<string, { summary: string; tags: string[] }>>({});
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiCaseSummary, setAiCaseSummary] = useState<string | null>(null);

    const handleAnalyzeFile = async (fileId: string) => {
        setAnalyzingFileId(fileId);
        try {
            // Mocking analysis for now, but using geminiService if we wanted real analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            setAnalyzedFiles(prev => ({
                ...prev,
                [fileId]: {
                    summary: "تم تحليل المستند وتبين أنه يحتوي على مذكرات دفاع ودفوع قانونية تتعلق بالبطلان الإجرائي.",
                    tags: ["مذكرة دفاع", "بطلان", "إجراءات"]
                }
            }));
        } finally {
            setAnalyzingFileId(null);
        }
    };

    const handleGenerateAiSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const context = {
                title: caseItem.title,
                type: caseItem.caseMainType,
                description: caseItem.description,
                demands: caseItem.legalDemands,
                hearings: (caseItem.hearings || []).map(h => ({ date: h.date, type: h.type, notes: h.notes })),
                execution: (caseItem.executionActions || []).map(e => ({ type: e.actionType, status: e.status, notes: e.notes })),
                experts: (caseItem.expertActions || []).map(ex => ({ task: ex.assignedTask, field: ex.expertField, status: ex.status, notes: ex.notes }))
            };
            
            const prompt = `أنت مستشار قانوني خبير متخصص في القانون الكويتي. برجاء تقديم ملخص قانوني استراتيجي وشامل للقضية التالية بناءً على البيانات المقدمة. 
بيانات القضية:
${JSON.stringify(context, null, 2)}`;

            const summary = await geminiService.getChatbotResponse(prompt);
            setAiCaseSummary(summary);
        } catch (error) {
            console.error("AI Summary generation failed", error);
            setAiCaseSummary("تعذر إنشاء الملخص حالياً. يرجى المحاولة لاحقاً.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };
    
    // --- Tabs Configuration ---
    const tabs = [
        { id: 'details', label: 'البيانات الأساسية', icon: <InformationCircleIcon className="w-4 h-4"/> },
        { id: 'legal', label: 'الشق القانوني', icon: <ScaleIcon className="w-4 h-4"/> },
        { id: 'hearings', label: 'الجلسات', icon: <GavelIcon className="w-4 h-4"/> },
        { id: 'archive', label: 'الأرشيف', icon: <FolderIcon className="w-4 h-4"/> },
        { id: 'execution', label: 'التنفيذ', icon: <ClockIcon className="w-4 h-4"/> },
        { id: 'financials', label: 'المالية', icon: <BanknotesIcon className="w-4 h-4"/> },
        { id: 'notes', label: 'الملاحظات', icon: <DocumentTextIcon className="w-4 h-4"/> },
        { id: 'ai', label: 'التحليل الذكي', icon: <SparklesIcon className="w-4 h-4"/> },
    ];

    const renderDetailsTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-xl text-primary">
                            <TagIcon className="w-5 h-5"/>
                        </div>
                        <h4 className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">أطراف النزاع</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">الموكل</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{caseItem.clientName}</span>
                            </div>
                            <div className="shrink-0">{renderRoleBadge(caseItem.clientRole || 'مدعي', 'client')}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">الخصم</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{caseItem.opposingPartyName || '---'}</span>
                            </div>
                            <div className="shrink-0">{renderRoleBadge(caseItem.opponentRole || 'مدعى عليه', 'opponent')}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-xl text-green-500">
                            <ScaleIcon className="w-5 h-5"/>
                        </div>
                        <h4 className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">جهة التقاضي</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">المحكمة</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{caseItem.courtName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">درجة التقاضي</span>
                            <span className="text-sm font-black text-green-600">{caseItem.courtLevel}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-xl text-orange-500">
                            <ClockIcon className="w-5 h-5"/>
                        </div>
                        <h4 className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">المواعيد</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">تاريخ القيد</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 tabular-nums">{new Date(caseItem.filingDate).toLocaleDateString('ar-KW')}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">الجلسة القادمة</span>
                            <span className="text-sm font-black text-orange-500 tabular-nums">{caseItem.nextHearingDate ? new Date(caseItem.nextHearingDate).toLocaleDateString('ar-KW') : 'لا يوجد'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">الحالة</div>
                    <CaseStatusBadge status={caseItem.status} size="sm" />
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">الأولوية</div>
                    <PriorityBadge priority={caseItem.priority} size="sm" />
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">المخاطر</div>
                    <RiskLevelBadge level={caseItem.riskLevel} size="sm" />
                </div>
            </div>

            {caseItem.description && (
                <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-lg space-y-4">
                    <h4 className="font-black text-sm flex items-center gap-2 uppercase tracking-tight italic">
                        <DocumentTextIcon className="w-5 h-5 text-primary"/>
                        وصف موضوع الدعوى والوقائع
                    </h4>
                    <p className="text-xs font-medium leading-relaxed text-slate-300">
                        {caseItem.description}
                    </p>
                </div>
            )}
        </div>
    );

    const renderLegalTab = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[40px] p-10 border-none bg-slate-50 dark:bg-dm-card shadow-sm group">
                    <h4 className="font-black text-lg mb-6 flex items-center gap-3 italic text-gray-900 dark:text-dm-text">
                        <ScaleIcon className="w-6 h-6 text-indigo-600"/>
                        {t('legal_demands', { defaultValue: 'الطلبات والهدف من الدعوى' })}
                    </h4>
                    <div className="p-6 bg-white dark:bg-dm-background rounded-3xl border border-gray-100 dark:border-gray-800 italic leading-loose text-sm text-gray-700">
                        {caseItem.legalDemands || t('demands_not_set', { defaultValue: 'لم يتم قيد الطلبات الختامية بعد.' })}
                    </div>
                </Card>

                <Card className="rounded-[40px] p-10 border-none bg-slate-50 dark:bg-dm-card shadow-sm group">
                    <h4 className="font-black text-lg mb-6 flex items-center gap-3 italic text-gray-900 dark:text-dm-text">
                        <BriefcaseIcon className="w-6 h-6 text-emerald-600"/>
                        {t('legal_team', { defaultValue: 'فريق العمل المختص' })}
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-dm-background rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                                {caseItem.assignedLawyer.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-sm text-gray-900 dark:text-dm-text">{caseItem.assignedLawyer}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('main_lawyer', { defaultValue: 'قائم بالعمل / رئيس الفريق' })}</p>
                            </div>
                        </div>
                        {caseItem.assignedLegalTeam?.filter(l => l !== caseItem.assignedLawyer).map((lawyer, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/60 dark:bg-dm-background/50 rounded-2xl border border-gray-50 dark:border-gray-800/40">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dm-card flex items-center justify-center text-gray-600 dark:text-gray-400 font-black text-xs">
                                    {lawyer.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-sm text-gray-700 dark:text-dm-text">{lawyer}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('legal_associate', { defaultValue: 'باحث قانوني / معاون' })}</p>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full rounded-2xl h-12 border-dashed font-black text-gray-400 hover:text-indigo-600 hover:border-indigo-600">
                            + {t('add_team_member', { defaultValue: 'إضافة عضو للفريق' })}
                        </Button>
                    </div>
                </Card>
            </div>
            
            <Card className="rounded-[40px] p-10 border-none bg-indigo-50 dark:bg-dm-card shadow-sm">
                 <h4 className="font-black text-lg mb-6 flex items-center gap-3 italic text-gray-900 dark:text-dm-text">
                    <ClipboardIcon className="w-6 h-6 text-amber-500"/>
                    {t('additional_legal_notes', { defaultValue: 'توصيات وملاحظات فريق العمل' })}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(caseItem.caseNotes || []).map((note, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-dm-background rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{note.author} • {new Date(note.date).toLocaleDateString('ar-EG')}</p>
                                <TagIcon className="w-4 h-4 text-gray-200"/>
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-dm-text leading-relaxed">{note.note}</p>
                        </div>
                    ))}
                    <button className="flex flex-col items-center justify-center p-8 bg-dashed border-4 border-gray-100 dark:border-gray-800 rounded-[40px] text-gray-300 hover:border-indigo-400 hover:text-indigo-400 transition-all group">
                         <PlusCircleIcon className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform"/>
                         <span className="font-black text-xs uppercase tracking-widest">{t('add_legal_note', { defaultValue: 'إضافة ملاحظة فنية' })}</span>
                    </button>
                </div>
            </Card>
        </div>
    );

    const renderFinancialsTab = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-12 bg-white rounded-[44px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 text-center group">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <BanknotesIcon className="w-8 h-8"/>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{t('contract_value', { defaultValue: 'قيمة العقد الإجمالية' })}</p>
                    <p className="text-3xl font-black italic text-slate-900 tabular-nums">{caseItem.financials?.totalFees || 0} <span className="text-xs text-slate-400">{caseItem.financials?.currency || 'د.ك'}</span></p>
                </div>
                <div className="p-12 bg-emerald-50 rounded-[44px] border border-emerald-100/50 text-center group">
                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <CheckCircleIcon className="w-8 h-8"/>
                    </div>
                    <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-2 italic">{t('received_amount', { defaultValue: 'إجمالي المحصل' })}</p>
                    <p className="text-3xl font-black italic text-emerald-700 tabular-nums">{caseItem.financials?.paid || 0} <span className="text-xs text-emerald-600/40">{caseItem.financials?.currency || 'د.ك'}</span></p>
                </div>
                <div className="p-12 bg-rose-50 rounded-[44px] border border-rose-100/50 text-center group">
                    <div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <ActivityIcon className="w-8 h-8"/>
                    </div>
                    <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest mb-2 italic">{t('outstanding_bal', { defaultValue: 'الرصيد المتبقي' })}</p>
                    <p className="text-3xl font-black italic text-rose-700 tabular-nums">{caseItem.financials?.remaining || 0} <span className="text-xs text-rose-600/40">{caseItem.financials?.currency || 'د.ك'}</span></p>
                </div>
            </div>

            <Card className="rounded-[44px] p-12 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-10">
                     <h4 className="font-black text-xl text-slate-900 italic flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <HistoryIcon className="w-6 h-6"/>
                        </div>
                        {t('audit_trail', { defaultValue: 'كشف حركة المالية' })}
                    </h4>
                    <Button variant="outline" size="sm" className="rounded-2xl h-12 px-8 font-black border-2 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition-all">{t('record_payment', { defaultValue: 'تسجيل توريد' })}</Button>
                </div>
                
                <div className="overflow-hidden rounded-[32px] border border-slate-50">
                    <table className="w-full text-right">
                         <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-8">{t('trans_date', { defaultValue: 'تاريخ القيد' })}</th>
                                <th className="p-8">{t('trans_desc', { defaultValue: 'البيان المحاسبي' })}</th>
                                <th className="p-8">{t('trans_amount', { defaultValue: 'القيمة' })}</th>
                                <th className="p-8">{t('trans_mode', { defaultValue: 'آلية السداد' })}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs">
                            <tr className="hover:bg-slate-50/50 transition-all">
                                <td className="p-8 font-black tabular-nums">12/05/2024</td>
                                <td className="p-8 font-medium italic text-slate-500">دفعة مقدمة لفتح ملف الدعوى</td>
                                <td className="p-8 font-black text-emerald-600">1,500 د.ك</td>
                                <td className="p-8"><span className="px-4 py-1.5 bg-slate-100 rounded-lg font-black text-[9px] tracking-widest">KNET PAY</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderNotesTab = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[40px] p-10 border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute -right-8 -bottom-8 text-white/5 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"><ClockIcon className="w-48 h-48"/></div>
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-black text-xl italic flex items-center gap-3">
                                <HistoryIcon className="w-7 h-7 text-amber-500"/>
                                {t('reminders_alerts', { defaultValue: 'تنبيهات ومواعيد هامة' })}
                            </h4>
                            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"><PlusCircleIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4">
                            {caseItem.reminders?.map((rem, i) => (
                                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/rem cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${rem.isRead ? 'bg-gray-600' : 'bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse'}`}/>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-gray-100 mb-1">{rem.message}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{new Date(rem.date).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                        <button className="opacity-0 group-hover/rem:opacity-100 text-rose-400 hover:text-white transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            )) || (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 font-bold italic text-sm">{t('no_reminders_set', { defaultValue: 'لا توجد تنبيهات نشطة' })}</p>
                                </div>
                            )}
                        </div>
                     </div>
                </Card>

                <Card className="rounded-[40px] p-10 border-none bg-white shadow-xl group">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-black text-xl text-gray-900 italic flex items-center gap-3">
                            <PlusCircleIcon className="w-7 h-7 text-indigo-600"/>
                            {t('linked_tasks', { defaultValue: 'المهام المرتبطة بالقضية' })}
                        </h4>
                        <Button variant="ghost" size="sm" className="rounded-xl font-black text-indigo-600 hover:bg-indigo-50 border-none underline">{t('view_all_tasks', { defaultValue: 'عرض المهام' })}</Button>
                    </div>
                    <div className="space-y-4">
                         <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400"><ClipboardIcon className="w-6 h-6"/></div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm">مراجعة تقرير الخبير المبدئي</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">بواسطة: أ. أحمد محمود • الأولوية: عاجل</p>
                                </div>
                            </div>
                            <span className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase">قيد الانتظار</span>
                        </div>
                        <div className="p-6 bg-emerald-50/50 rounded-[32px] border border-emerald-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm text-emerald-600"><CheckCircleIcon className="w-6 h-6"/></div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm line-through opacity-50">إخطار الخصم بالدعوى</p>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase">تم الإنجاز بنجاح</p>
                                </div>
                            </div>
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase">مكتملة</span>
                        </div>
                        <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-gray-300 font-black text-xs hover:border-indigo-400 hover:text-indigo-400 transition-all">+ إضافة مهمة تشغيلية</button>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderHearingsTab = () => {
        const handleSaveHearing = (hearing: Hearing) => {
            const currentHearings = caseItem.hearings || [];
            let updatedHearings;
            if (editingHearing) {
                updatedHearings = currentHearings.map(h => h.id === hearing.id ? hearing : h);
            } else {
                updatedHearings = [...currentHearings, hearing];
            }
            onUpdateCase({ ...caseItem, hearings: updatedHearings });
            setIsAddingHearing(false);
            setEditingHearing(null);
        };

        const handleDeleteHearing = (hearingId: string) => {
            if (window.confirm(t('confirm_delete_hearing', { defaultValue: 'هل أنت متأكد من حذف سجل هذه الجلسة؟' }))) {
                const updatedHearings = (caseItem.hearings || []).filter(h => h.id !== hearingId);
                onUpdateCase({ ...caseItem, hearings: updatedHearings });
            }
        };

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <div className="flex items-center justify-between no-print">
                    <h4 className="font-black text-2xl text-slate-900 italic flex items-center gap-4">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                            <GavelIcon className="w-6 h-6"/>
                        </div>
                        {t('hearings_chronology', { defaultValue: 'التسلسل الزمني للجلسات والمقررات' })}
                    </h4>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-2xl font-black h-14 px-10 shadow-2xl shadow-indigo-100 bg-slate-900 text-white"
                        leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
                        onClick={() => { setIsAddingHearing(true); setEditingHearing(null); }}
                    >
                        {t('add_hearing', { defaultValue: 'إضافة جلسة جديدة' })}
                    </Button>
                </div>

                {(isAddingHearing || editingHearing) && (
                    <div className="animate-in zoom-in-95 duration-300">
                        <HearingForm 
                            initialData={editingHearing || undefined} 
                            onSubmit={handleSaveHearing} 
                            onCancel={() => { setIsAddingHearing(false); setEditingHearing(null); }} 
                        />
                    </div>
                )}

                {caseItem.hearings && caseItem.hearings.length > 0 ? (
                    <div className="relative space-y-12 ps-16">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-slate-200 rounded-full" />

                        {caseItem.hearings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, idx) => (
                            <div key={h.id} className="relative group">
                                {/* Timeline Node */}
                                <div className="absolute -left-[44px] top-8 w-10 h-10 bg-white border-2 border-slate-100 rounded-2xl z-10 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
                                    <ClockIcon className="w-5 h-5 pointer-events-none"/>
                                </div>
                                
                                <Card className="rounded-[40px] p-12 border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden group/item">
                                    <div className="absolute top-0 right-0 w-2 h-0 group-hover/item:h-full bg-slate-900 transition-all duration-700"/>
                                    
                                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                                        <div className="lg:w-64 shrink-0 text-center lg:text-right space-y-4">
                                            <div className="inline-block px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic">
                                                {new Date(h.date).toLocaleDateString('ar-EG', { weekday: 'long' })}
                                            </div>
                                            <div className="flex flex-col items-center lg:items-end">
                                                <p className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{new Date(h.date).getDate()}</p>
                                                <p className="text-lg font-black text-slate-400 uppercase tracking-widest mt-2">{new Date(h.date).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-8">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                                <div className="flex-1">
                                                    <h5 className="font-black text-3xl text-slate-900 italic tracking-tight mb-2">
                                                        {h.type}
                                                    </h5>
                                                    <div className="flex items-center gap-3 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                                        <BuildingLibraryIcon className="w-4 h-4 text-indigo-400"/>
                                                        {h.courtRoomOrLocation || t('main_hall', { defaultValue: 'قاعة المرافعة الرئيسية' })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 no-print shrink-0">
                                                    <button onClick={() => setEditingHearing(h)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-amber-500 hover:text-white transition-all"><PencilIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteHearing(h.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><TrashIcon className="w-5 h-5"/></button>
                                                    <div className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-slate-100 ${
                                                        h.status === 'Completed' 
                                                        ? 'bg-emerald-50 text-emerald-600' 
                                                        : 'bg-amber-50 text-amber-700 animate-pulse'
                                                    }`}>
                                                        {h.status === 'Scheduled' ? t('scheduled', { defaultValue: 'مجدولة' }) : h.status === 'Completed' ? t('finished', { defaultValue: 'منتهية' }) : h.status}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 relative group/notes overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"/>
                                                <p className="text-lg text-slate-700 leading-loose font-medium italic relative z-10">
                                                    {h.notes || t('no_notes_for_hearing', { defaultValue: 'لم يتم تدوين ملخص وقائع الجلسة لهذه الفترة.' })}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6">
                                                {h.nextHearingDate && (
                                                    <div className="flex items-center gap-6 p-6 bg-slate-900 text-white rounded-[32px] border border-slate-800 w-fit shadow-xl shadow-slate-900/10 transition-transform hover:scale-105 duration-500">
                                                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl"><ArrowPathIcon className="w-6 h-6 text-primary"/></div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('deferred_to', { defaultValue: 'تأجيل للجلسة القادمة' })}</p>
                                                            <p className="text-lg font-black tabular-nums">{new Date(h.nextHearingDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {h.lawyerSignature && (
                                                    <div className="flex items-center gap-6 p-6 bg-white rounded-[32px] border border-slate-100 w-fit shadow-sm relative overflow-hidden group/sig">
                                                        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 opacity-0 group-hover/sig:opacity-100 transition-all"/>
                                                        <div className="flex flex-col items-center">
                                                            <img src={h.lawyerSignature} alt="Signature" className="h-10 mix-blend-multiply opacity-80" />
                                                            <span className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-tight italic">اعتماد حضور الجلسة</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-slate-50 rounded-[80px] border-4 border-dashed border-white shadow-inner">
                        <div className="p-10 bg-white rounded-full w-40 h-40 mx-auto flex items-center justify-center text-slate-200 mb-10 border-8 border-white shadow-2xl animate-bounce">
                            <ClockIcon className="w-20 h-20"/>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4 italic tracking-tight">{t('no_chronology_recorded', { defaultValue: 'لم يتم القيد في سجل الجلسات' })}</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto opacity-60">{t('start_by_adding_hearing_desc', { defaultValue: 'قم بإضافة موعد الجلسة الأولى ليبدأ النظام في بناء التسلسل الزمني لملف القضية.' })}</p>
                        <Button variant="primary" className="mt-14 rounded-2xl h-16 px-16 font-black shadow-2xl shadow-slate-900/20 bg-slate-900" onClick={() => { setIsAddingHearing(true); setEditingHearing(null); }}>{t('add_first_hearing', { defaultValue: 'إضافة أول جلسة مجدولة' })}</Button>
                    </div>
                )}
            </div>
        );
    };

    const renderSmartArchiveTab = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
                    <BrainIcon className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                            <SparklesIcon className="w-8 h-8 text-indigo-300" />
                        </div>
                        <h4 className="font-black text-2xl italic">{t('ai_archive_intelligence', { defaultValue: 'ذكاء الأرشفة الرقمي (AI)' })}</h4>
                    </div>
                    <p className="text-sm text-indigo-100/60 leading-relaxed max-w-2xl font-medium">
                        {t('smart_archive_desc', { defaultValue: 'يقوم النظام بتحليل المستندات المرفقة تلقائياً لاستخراج البيانات الرئيسية، واقتراح التصنيفات، وتلخيص المحتوى القانوني لتسهيل البحث والمراجعة.' })}
                    </p>
                </div>
            </div>

            {caseItem.caseFiles && caseItem.caseFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {caseItem.caseFiles.map(file => {
                        const analysis = analyzedFiles[file.id];
                        const isAnalyzing = analyzingFileId === file.id;

                        return (
                            <div key={file.id} className="group bg-white dark:bg-dm-card rounded-[32px] p-8 border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gray-50 dark:bg-dm-background/50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                            <DocumentTextIcon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-dm-text">{file.fileName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{file.fileType} • {new Date(file.uploadedAt).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="p-3 bg-gray-50 dark:bg-dm-background/50 rounded-xl hover:bg-white"><EyeIcon className="w-5 h-5"/></Button>
                                    </div>
                                </div>

                                {!analysis && !isAnalyzing && (
                                    <button 
                                        onClick={() => handleAnalyzeFile(file.id)}
                                        className="w-full py-4 mt-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-xs hover:bg-indigo-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-3"
                                    >
                                        <SparklesIcon className="w-4 h-4"/>
                                        {t('perform_smart_analysis', { defaultValue: 'تحليل البيانات ذكياً' })}
                                    </button>
                                )}

                                {isAnalyzing && (
                                    <div className="py-6 flex flex-col items-center justify-center gap-4 animate-pulse">
                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t('analyzing_with_ai', { defaultValue: 'النظام يحلل الآن...' })}</p>
                                    </div>
                                )}

                                {analysis && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="mb-4">
                                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2">{t('suggested_tags', { defaultValue: 'الكلمات الدلالية' })}</span>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-gray-50 dark:bg-dm-background-light px-3 py-1 rounded-lg text-[10px] font-bold text-gray-600 dark:text-dm-text flex items-center gap-2">
                                                        <TagIcon className="w-3 h-3 text-indigo-400"/> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10 italic">
                                            <p className="text-xs text-gray-700 dark:text-dm-text-muted leading-loose">
                                                {analysis.summary}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-dm-background/50 rounded-[48px] border-4 border-dashed border-white dark:border-gray-800 shadow-inner">
                    <FolderIcon className="w-20 h-20 mx-auto mb-6 text-gray-200 dark:text-gray-800"/>
                    <h3 className="text-xl font-black text-gray-800 dark:text-dm-text">{t('no_archives_found', { defaultValue: 'الأرشيف الحالي فارغ' })}</h3>
                    <p className="text-gray-400 text-sm mt-1">{t('upload_docs_to_start', { defaultValue: 'قم برفع مستندات القضية لتبدأ عملية الأرشفة الذكية والتحليل الآلي.' })}</p>
                    <Button variant="outline" className="mt-8 rounded-2xl h-12 px-10 font-black" onClick={() => {}}>{t('upload_documents', { defaultValue: 'بدء رفع المستندات' })}</Button>
                </div>
            )}
        </div>
    );

    const renderExecutionTab = () => {
        const handleSaveExecAction = (action: ExecutionAction) => {
            const currentActions = caseItem.executionActions || [];
            let updatedActions;
            if (editingExecAction) {
                updatedActions = currentActions.map(a => a.id === action.id ? action : a);
            } else {
                updatedActions = [...currentActions, action];
            }
            onUpdateCase({ ...caseItem, executionActions: updatedActions });
            setIsAddingExecAction(false);
            setEditingExecAction(null);
        };

        const handleDeleteExecAction = (actionId: string) => {
            if (window.confirm(t('confirm_delete_action', { defaultValue: 'هل أنت متأكد من حذف هذا الإجراء؟' }))) {
                const updatedActions = (caseItem.executionActions || []).filter(a => a.id !== actionId);
                onUpdateCase({ ...caseItem, executionActions: updatedActions });
            }
        };

        const handleSaveExpertAction = (action: ExpertAction) => {
            const currentActions = caseItem.expertActions || [];
            let updatedActions;
            if (editingExpertAction) {
                updatedActions = currentActions.map(a => a.id === action.id ? action : a);
            } else {
                updatedActions = [...currentActions, action];
            }
            onUpdateCase({ ...caseItem, expertActions: updatedActions });
            setIsAddingExpertAction(false);
            setEditingExpertAction(null);
        };

        const handleDeleteExpertAction = (actionId: string) => {
            if (window.confirm(t('confirm_delete_expert_action', { defaultValue: 'هل أنت متأكد من حذف إجراء الخبير هذا؟' }))) {
                const updatedActions = (caseItem.expertActions || []).filter(a => a.id !== actionId);
                onUpdateCase({ ...caseItem, expertActions: updatedActions });
            }
        };

        const activeExecCount = (caseItem.executionActions || []).filter(a => a.status === ExecutionActionStatus.ACTIVE).length;
        const completedExecCount = (caseItem.executionActions || []).filter(a => a.status === ExecutionActionStatus.COMPLETED).length;

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-dm-card p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <GavelIcon className="w-6 h-6"/>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('total_executions', { defaultValue: 'إجمالي التنفيذ' })}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-dm-text">{(caseItem.executionActions || []).length}</p>
                    </div>
                    <div className="bg-white dark:bg-dm-card p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <CheckCircleIcon className="w-6 h-6"/>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('completed_execution', { defaultValue: 'منتهي' })}</p>
                        <p className="text-2xl font-black text-emerald-600">{completedExecCount}</p>
                    </div>
                    <div className="bg-white dark:bg-dm-card p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <ActivityIcon className="w-6 h-6"/>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('active_now', { defaultValue: 'نشط حالياً' })}</p>
                        <p className="text-2xl font-black text-rose-500">{activeExecCount}</p>
                    </div>
                    <div className="bg-white dark:bg-dm-card p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <div className="w-12 h-12 bg-indigo-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <ScaleIcon className="w-6 h-6"/>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('expert_procedures', { defaultValue: 'إجراءات الخبراء' })}</p>
                        <p className="text-2xl font-black text-indigo-900 dark:text-indigo-400">{(caseItem.expertActions || []).length}</p>
                    </div>
                </div>

                {/* Execution Timeline */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between no-print">
                        <h4 className="font-black text-xl text-gray-900 italic flex items-center gap-3">
                            <GavelIcon className="w-8 h-8 text-black"/>
                            {t('execution_actions_log', { defaultValue: 'سجل تتبع الإجراءات التنفيذية' })}
                        </h4>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-2xl font-black h-12 px-8 shadow-xl shadow-indigo-100" 
                            leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
                            onClick={() => { setIsAddingExecAction(true); setEditingExecAction(null); }}
                        >
                            {t('add_exec_action', { defaultValue: 'إضافة إشكال/حجز' })}
                        </Button>
                    </div>

                    {(isAddingExecAction || editingExecAction) && (
                        <div className="animate-in zoom-in-95 duration-300">
                             <ExecutionActionForm 
                                initialData={editingExecAction || undefined} 
                                onSubmit={handleSaveExecAction} 
                                onCancel={() => { setIsAddingExecAction(false); setEditingExecAction(null); }} 
                            />
                        </div>
                    )}

                    {caseItem.executionActions && caseItem.executionActions.length > 0 ? (
                        <div className="space-y-6">
                            {caseItem.executionActions.map((action, idx) => (
                                <div key={action.id} className="group bg-white dark:bg-dm-card rounded-[40px] p-10 border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-2 h-full bg-gray-50 group-hover:bg-indigo-600 transition-colors duration-700"/>
                                     <div className="flex flex-col lg:flex-row gap-10">
                                         <div className="flex-1 space-y-6">
                                             <div className="flex items-center gap-4">
                                                 <div className="p-3 bg-gray-50 dark:bg-dm-background/50 text-gray-400 rounded-2xl font-black text-xs">#{idx + 1}</div>
                                                 <h5 className="font-black text-2xl text-gray-900 dark:text-dm-text tracking-tighter italic">{action.actionType}</h5>
                                                 <ExecutionActionStatusBadge status={action.status} size="sm" />
                                             </div>
                                             
                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                 <div className="space-y-1">
                                                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('entry_date', { defaultValue: 'تاريخ القيد' })}</div>
                                                     <div className="text-sm font-black text-gray-800">{new Date(action.applicationDate).toLocaleDateString('ar-EG')}</div>
                                                 </div>
                                                 <div className="space-y-1">
                                                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('decision_on', { defaultValue: 'القرار في' })}</div>
                                                     <div className="text-sm font-black text-emerald-600">{action.decisionDate ? new Date(action.decisionDate).toLocaleDateString('ar-EG') : t('under_study', { defaultValue: 'قيد الدراسة' })}</div>
                                                 </div>
                                                 <div className="space-y-1">
                                                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('referral_no', { defaultValue: 'رقم الإحالة' })}</div>
                                                     <div className="text-sm font-black text-gray-800">{action.referenceNumber || '—'}</div>
                                                 </div>
                                                 <div className="space-y-1">
                                                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('involved_capital', { defaultValue: 'المبلغ المحجوز' })}</div>
                                                     <div className="text-sm font-black text-rose-500">{action.amountInvolved ? `${action.amountInvolved.toLocaleString()} د.ك` : '—'}</div>
                                                 </div>
                                             </div>

                                             <div className="p-6 bg-gray-50/50 dark:bg-dm-background/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 italic">
                                                 <p className="text-xs text-gray-500 font-medium leading-relaxed">{action.notes || t('no_execution_notes', { defaultValue: 'لا توجد تفاصيل إضافية لهذا الإجراء.' })}</p>
                                             </div>

                                             <div className="w-full pt-4">
                                                 <ExecutionProgressTracker status={action.status} />
                                             </div>
                                         </div>
                                         <div className="lg:w-12 flex lg:flex-col items-center justify-center gap-3 no-print">
                                             <button onClick={() => setEditingExecAction(action)} className="p-3 shadow-sm bg-gray-50 hover:bg-amber-500 hover:text-white rounded-2xl transition-all"><PencilIcon className="w-5 h-5"/></button>
                                             <button onClick={() => handleDeleteExecAction(action.id)} className="p-3 shadow-sm bg-gray-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"><TrashIcon className="w-5 h-5"/></button>
                                         </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="py-20 flex flex-col items-center justify-center border-none bg-gray-50/50 dark:bg-dm-background-light rounded-[48px]">
                             <ActivityIcon className="w-16 h-16 text-gray-200 mb-4"/>
                             <p className="text-gray-400 font-black text-sm italic">{t('no_execution_actions_recorded', { defaultValue: 'لم يتم البدء بإجراءات تنفيذية لهذه القضية.' })}</p>
                        </Card>
                    )}
                    {/* Expert Procedures Log */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between no-print">
                            <h4 className="font-black text-xl text-gray-900 italic flex items-center gap-3">
                                <ScaleIcon className="w-8 h-8 text-black"/>
                                {t('expert_procedures_log', { defaultValue: 'سجل متابعة إجراءات الخبراء' })}
                            </h4>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-2xl font-black h-12 px-8 border-2" 
                                leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
                                onClick={() => { setIsAddingExpertAction(true); setEditingExpertAction(null); }}
                            >
                                {t('add_expert_action', { defaultValue: 'إضافة إحالة للخبراء' })}
                            </Button>
                        </div>

                        {(isAddingExpertAction || editingExpertAction) && (
                            <div className="animate-in zoom-in-95 duration-300">
                                 <ExpertActionForm 
                                    initialData={editingExpertAction || undefined} 
                                    onSubmit={handleSaveExpertAction} 
                                    onCancel={() => { setIsAddingExpertAction(false); setEditingExpertAction(null); }} 
                                />
                            </div>
                        )}

                        {caseItem.expertActions && caseItem.expertActions.length > 0 ? (
                            <div className="space-y-6">
                                {caseItem.expertActions.map((action, idx) => (
                                    <div key={action.id} className="group bg-white dark:bg-dm-card rounded-[40px] p-10 border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                                         <div className="absolute top-0 right-0 w-2 h-full bg-gray-50 group-hover:bg-amber-600 transition-colors duration-700"/>
                                         <div className="flex flex-col lg:flex-row gap-10">
                                             <div className="flex-1 space-y-6">
                                                 <div className="flex items-center gap-4">
                                                     <div className="p-3 bg-gray-50 dark:bg-dm-background/50 text-gray-400 rounded-2xl font-black text-xs">#{idx + 1}</div>
                                                     <h5 className="font-black text-2xl text-gray-900 dark:text-dm-text tracking-tighter italic">{action.expertField}</h5>
                                                     <ExpertActionStatusBadge status={action.status} size="sm" />
                                                 </div>
                                                 
                                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                     <div className="space-y-1">
                                                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('referral_date', { defaultValue: 'تاريخ الإحالة' })}</div>
                                                         <div className="text-sm font-black text-gray-800">{new Date(action.referralDate).toLocaleDateString('ar-EG')}</div>
                                                     </div>
                                                     <div className="space-y-1">
                                                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('expert_name', { defaultValue: 'اسم الخبير' })}</div>
                                                         <div className="text-sm font-black text-indigo-600">{action.expertName || '—'}</div>
                                                     </div>
                                                     <div className="space-y-1">
                                                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('submission_date', { defaultValue: 'إيداع التقرير' })}</div>
                                                         <div className="text-sm font-black text-gray-800">{action.reportSubmissionDate ? new Date(action.reportSubmissionDate).toLocaleDateString('ar-EG') : '—'}</div>
                                                     </div>
                                                     <div className="space-y-1">
                                                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('discussion_date', { defaultValue: 'المناقشة' })}</div>
                                                         <div className="text-sm font-black text-gray-800">{action.reportDiscussionDate ? new Date(action.reportDiscussionDate).toLocaleDateString('ar-EG') : '—'}</div>
                                                     </div>
                                                 </div>

                                                 <div className="p-6 bg-amber-50/30 dark:bg-dm-background/50 rounded-3xl border border-dashed border-amber-200 dark:border-gray-800 italic">
                                                     <p className="text-[10px] font-black text-amber-600 uppercase mb-2">{t('assigned_task', { defaultValue: 'المهمة الموكلة بالخبير' })}</p>
                                                     <p className="text-xs text-gray-600 font-medium leading-relaxed">{action.assignedTask}</p>
                                                 </div>

                                                 <div className="w-full pt-4">
                                                     <ExpertProgressTracker status={action.status} />
                                                 </div>

                                                 {action.lawyerSignature && (
                                                     <div className="flex flex-col items-end mt-4 pt-4 border-t border-gray-100 border-dashed">
                                                         <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center">
                                                             <img src={action.lawyerSignature} alt="Signature" className="h-10 mix-blend-multiply opacity-80" />
                                                             <span className="text-[7px] font-black text-gray-400 mt-1 uppercase tracking-tight italic">اعتماد متابعة الخبراء</span>
                                                         </div>
                                                     </div>
                                                 )}
                                             </div>
                                             <div className="lg:w-12 flex lg:flex-col items-center justify-center gap-3 no-print">
                                                 <button onClick={() => setEditingExpertAction(action)} className="p-3 shadow-sm bg-gray-50 hover:bg-amber-500 hover:text-white rounded-2xl transition-all"><PencilIcon className="w-5 h-5"/></button>
                                                 <button onClick={() => handleDeleteExpertAction(action.id)} className="p-3 shadow-sm bg-gray-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"><TrashIcon className="w-5 h-5"/></button>
                                             </div>
                                         </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card className="py-20 flex flex-col items-center justify-center border-none bg-gray-50/50 dark:bg-dm-background-light rounded-[48px]">
                                 <ScaleIcon className="w-16 h-16 text-gray-200 mb-4"/>
                                 <p className="text-gray-400 font-black text-sm italic">{t('no_expert_actions_recorded', { defaultValue: 'لم يتم البدء بإجراءات خبراء لهذه القضية.' })}</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAiTab = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.2),rgba(0,0,0,0))]"/>
                <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl mb-6">
                        <SparklesIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h4 className="text-3xl font-black tracking-tighter mb-3 italic">{t('ai_legal_consultant', { defaultValue: 'مستشار عدالة الذكي' })}</h4>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed italic px-10">
                        {t('ai_consultant_desc', { defaultValue: 'نموذج ذكاء اصطناعي سيادي مدرب على التشريعات الكويتية، يقدم تحليلات استراتيجية وتوقعات مسار التقاضي بناءً على معطيات هذا الملف.' })}
                    </p>
                </div>
            </div>

            <Card className="rounded-[2.5rem] p-0 border border-slate-100 bg-white dark:bg-dm-card shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {!aiCaseSummary ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center space-y-8">
                        <div className="w-32 h-32 bg-indigo-50 dark:bg-dm-background rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
                            <BrainIcon className="w-16 h-16 opacity-30 animate-pulse"/>
                        </div>
                        <div className="max-w-md">
                            <h5 className="text-2xl font-black text-gray-900 dark:text-dm-text mb-2 italic">{t('generate_analysis_prompt', { defaultValue: 'هل أنت جاهز للتحليل الذكي؟' })}</h5>
                            <p className="text-gray-400 text-sm font-medium italic">{t('analysis_processing_note', { defaultValue: 'ستتم معالجة كافة بيانات الخصوم والمحكمة والقرارات السابقة لتوليد التقرير.' })}</p>
                        </div>
                        <Button 
                            onClick={handleGenerateAiSummary} 
                            isLoading={isGeneratingSummary}
                            className="h-16 px-12 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 animate-in zoom-in duration-500"
                            leftIcon={<SparklesIcon className="w-6 h-6"/>}
                        >
                            {t('generate_intelligence_report', { defaultValue: 'توليد تقرير الاستخبارات القانونية' })}
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-700">
                        <div className="p-6 bg-gray-50/80 dark:bg-dm-background/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('intelligence_report_v1', { defaultValue: 'تقرير الاستخبارات القانونية - v1.0' })}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-white shadow-sm" onClick={() => handleGenerateAiSummary()} title={t('regenerate', { defaultValue: 'إعادة التوليد' })}>
                                    <ArrowPathIcon className="w-5 h-5 text-indigo-600"/>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-white shadow-sm" onClick={() => navigator.clipboard.writeText(aiCaseSummary ||'')} title={t('copy', { defaultValue: 'نسخ لملف خارجي' })}>
                                    <ClipboardIcon className="w-5 h-5 text-emerald-600"/>
                                </Button>
                            </div>
                        </div>
                        <div className="p-12 chatbot-md text-gray-800 dark:text-dm-text leading-[1.8] text-base font-medium max-h-[600px] overflow-y-auto custom-scrollbar italic">
                            <ReactMarkdown>{aiCaseSummary}</ReactMarkdown>
                        </div>
                        <div className="p-8 bg-amber-50/50 border-t border-amber-100 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg text-amber-500 shadow-sm">
                                <InformationCircleIcon className="w-6 h-6"/>
                            </div>
                            <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic">
                                {t('ai_legal_disclaimer', { defaultValue: 'تنبيه قانوني: هذا التقرير هو نتاج عمليات معالجة لغوية متقدمة من نظام (عدالة AI)، ويجب استخدامه كأداة داعمة للمحامي المسؤول وليس كبديل عن الرأي القانوني البشري المتخصص.' })}
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                 <button 
                    className="p-8 bg-white dark:bg-dm-card border-none rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 text-right group relative overflow-hidden"
                    onClick={() => {}}
                 >
                    <div className="absolute -right-4 -bottom-4 text-indigo-600/5 group-hover:scale-125 transition-transform duration-700"><SearchIcon className="w-32 h-32"/></div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-[20px] w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <SearchIcon className="w-7 h-7"/>
                    </div>
                    <h5 className="font-black text-xl text-gray-900 dark:text-dm-text mb-2 italic">{t('legal_research', { defaultValue: 'أبحاث سوابق مشابهة' })}</h5>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('find_matching_judgments', { defaultValue: 'إيجاد أحكام مطابقة لنفس الوقائع' })}</p>
                 </button>
                 <button 
                    className="p-8 bg-white dark:bg-dm-card border-none rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 text-right group relative overflow-hidden"
                    onClick={() => {}}
                 >
                    <div className="absolute -right-4 -bottom-4 text-emerald-600/5 group-hover:scale-125 transition-transform duration-700"><FileEditIcon className="w-32 h-32"/></div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-[20px] w-fit mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                        <FileEditIcon className="w-7 h-7"/>
                    </div>
                    <h5 className="font-black text-xl text-gray-900 dark:text-dm-text mb-2 italic">{t('draft_memo', { defaultValue: 'صياغة مذكرة دفاع' })}</h5>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('ai_drafting_tool', { defaultValue: 'توليد مسودة قانونية أولية' })}</p>
                 </button>
            </div>
        </div>
    );

    return (
        <Modal 
            isOpen={!!caseItem} 
            onClose={onClose} 
            title={``}
            size="xl"
            hideHeader
            footer={
                <div className="flex justify-end gap-3 no-print p-6">
                    <Button variant="outline" className="rounded-2xl h-12 px-8 font-black border-2" onClick={onClose}>{t('back_to_list', { defaultValue: 'العودة للقائمة' })}</Button>
                </div>
            }
        >
            <div className="flex flex-col h-full bg-white dark:bg-dm-background overflow-hidden lg:rounded-[48px]">
                {/* Custom Premium Modal Header */}
                <div className="relative p-12 pb-2 shrink-0 no-print bg-white/40 backdrop-blur-3xl border-b border-slate-50">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                        <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest italic">{caseItem.caseMainType}</span>
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200"/>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{t('internal_id', { defaultValue: 'رقم الملف الداخلي' })}: {caseItem.internalCaseNumber}</span>
                              </div>
                              <h2 className="text-44xl font-black text-slate-900 tracking-tighter italic leading-tight">{caseItem.title}</h2>
                              <div className="flex items-center gap-8">
                                <div className="flex flex-col text-right">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-0.5">{t('automated_number', { defaultValue: 'الرقم الآلي' })}</span>
                                    <span className="text-sm font-black text-indigo-600 tabular-nums">{caseItem.caseNumber}</span>
                                </div>
                                {caseItem.circuit && (
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-0.5">{t('court_cabinet', { defaultValue: 'الدائرة المختصة' })}</span>
                                        <span className="text-sm font-black text-slate-700">{caseItem.circuit}</span>
                                    </div>
                                )}
                              </div>
                         </div>
                         <button 
                             onClick={onClose}
                             className="p-4 bg-white hover:bg-slate-900 hover:text-white rounded-[20px] text-slate-400 transition-all duration-500 shadow-sm border border-slate-50"
                         >
                             <XCircleIcon className="w-6 h-6"/>
                         </button>
                    </div>

                    {/* Premium Navigation Tabs - Coordinated & Refined */}
                    <div className="flex gap-1 mt-12 pb-0 overflow-x-auto no-scrollbar scroll-smooth">
                        {[
                            { id: 'details', label: t('case_summary', { defaultValue: 'ملف القضية' }), icon: BriefcaseIcon },
                            { id: 'legal', label: t('legal_mission', { defaultValue: 'المهمة' }), icon: ScaleIcon },
                            { id: 'hearings', label: t('chronos', { defaultValue: 'الجدول الزمني' }), icon: GavelIcon },
                            { id: 'archive', label: t('archive', { defaultValue: 'الأرشيف' }), icon: FolderIcon },
                            { id: 'execution', label: t('enforcement', { defaultValue: 'التنفيذ والخبراء' }), icon: ActivityIcon },
                            { id: 'financials', label: t('financials', { defaultValue: 'المالية' }), icon: BanknotesIcon },
                            { id: 'notes', label: t('notes', { defaultValue: 'الملاحظات' }), icon: DocumentTextIcon },
                            { id: 'ai', label: t('ai_insights', { defaultValue: 'التحليل الذكي' }), icon: SparklesIcon }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-t-[20px] font-black text-[10px] transition-all duration-500 whitespace-nowrap relative group ${
                                        isActive 
                                        ? 'bg-slate-50 text-indigo-600' 
                                        : 'text-slate-400 hover:bg-slate-50/50 hover:text-slate-700'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'text-indigo-600' : 'text-slate-300 group-hover:scale-110'}`}/>
                                    <span className="uppercase tracking-widest">{tab.label}</span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Modal Scrollable Content - Softer Background */}
                <div className="flex-1 overflow-y-auto p-14 pt-10 custom-scrollbar bg-slate-50/30 dark:bg-dm-background">
                    {activeTab === 'details' && renderDetailsTab()}
                    {activeTab === 'legal' && renderLegalTab()}
                    {activeTab === 'hearings' && renderHearingsTab()}
                    {activeTab === 'archive' && renderSmartArchiveTab()}
                    {activeTab === 'execution' && renderExecutionTab()}
                    {activeTab === 'financials' && renderFinancialsTab()}
                    {activeTab === 'notes' && renderNotesTab()}
                    {activeTab === 'ai' && renderAiTab()}
                </div>

                {/* Hidden Print Content */}
                <div className="hidden print:block printable-sheet text-black bg-white p-12">
                    <PrintHeader 
                        title={t('legal_case_report', { defaultValue: 'تقرير ملف قضية قانونية' })} 
                        subtitle={`${caseItem.title} - ${caseItem.internalCaseNumber}`} 
                    />

                    <div className="grid grid-cols-2 gap-16 mb-16">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black uppercase tracking-tighter border-r-8 border-indigo-600 pr-4 mb-8 italic">{t('basic_entity_data', { defaultValue: 'بيانات القضية الأساسية' })}</h3>
                            <div className="space-y-4 text-lg">
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('case_identity', { defaultValue: 'موضوع القضية' })}:</span> <span className="font-black">{caseItem.title}</span></p>
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('court_case_no', { defaultValue: 'رقم القضية' })}:</span> <span className="font-black tabular-nums">{caseItem.caseNumber}</span></p>
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('client_name', { defaultValue: 'طرف الموكل' })}:</span> <span className="font-black">{caseItem.clientName}</span></p>
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('opponent_name', { defaultValue: 'طرف الخصم' })}:</span> <span className="font-black">{caseItem.opposingPartyName}</span></p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black uppercase tracking-tighter border-r-8 border-emerald-600 pr-4 mb-8 italic">{t('legal_status', { defaultValue: 'الموقف القانوني' })}</h3>
                            <div className="space-y-4 text-lg">
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('litigation_level', { defaultValue: 'درجة التقاضي' })}:</span> <span className="font-black">{caseItem.courtLevel}</span></p>
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('handling_court', { defaultValue: 'المحكمة المختصة' })}:</span> <span className="font-black">{caseItem.courtName}</span></p>
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('current_state', { defaultValue: 'الحالة الإجرائية' })}:</span> <span className="font-black">{caseItem.status}</span></p>
                                <p className="flex justify-between border-b pb-2"><span className="text-gray-400 font-black">{t('priority_level', { defaultValue: 'درجة الأهمية' })}:</span> <span className="font-black">{caseItem.priority}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                         <section>
                            <h3 className="text-2xl font-black uppercase tracking-tighter border-r-8 border-black pr-4 mb-8 italic">{t('facts_summary', { defaultValue: 'ملخص وقائع الدعوى' })}</h3>
                            <div className="p-8 bg-gray-50 rounded-3xl border-2 border-gray-100 italic text-xl leading-relaxed">
                                {caseItem.description}
                            </div>
                         </section>

                         <section>
                            <h3 className="text-2xl font-black uppercase tracking-tighter border-r-8 border-black pr-4 mb-8 italic">{t('hearings_and_decisions', { defaultValue: 'سجل الجلسات والقرارات القضائية' })}</h3>
                            <div className="rounded-[32px] border-4 border-gray-900 overflow-hidden">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-gray-900 text-white">
                                        <tr>
                                            <th className="p-4 font-black">{t('date', { defaultValue: 'التاريخ' })}</th>
                                            <th className="p-4 font-black">{t('type', { defaultValue: 'نوع الجلسة' })}</th>
                                            <th className="p-4 font-black">{t('lawyer_sig', { defaultValue: 'توقيع المحامي' })}</th>
                                            <th className="p-4 font-black">{t('decision_notes', { defaultValue: 'القرار / الملاحظات' })}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-100">
                                        {caseItem.hearings?.map(h => (
                                            <tr key={h.id}>
                                                <td className="p-4 font-black tabular-nums">{new Date(h.date).toLocaleDateString('ar-EG')}</td>
                                                <td className="p-4 font-black">{h.type}</td>
                                                <td className="p-4">
                                                    {h.lawyerSignature && (
                                                        <img src={h.lawyerSignature} alt="Sig" className="h-6 mix-blend-multiply border-b border-gray-100" />
                                                    )}
                                                </td>
                                                <td className="p-4 font-medium italic">{h.notes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </section>

                         {(caseItem.executionActions && caseItem.executionActions.length > 0) && (
                            <section>
                                <h3 className="text-2xl font-black uppercase tracking-tighter border-r-8 border-slate-700 pr-4 mb-8 italic">{t('execution_report', { defaultValue: 'تقرير الإجراءات التنفيذية' })}</h3>
                                <div className="space-y-6">
                                    {caseItem.executionActions.map(ex => (
                                        <div key={ex.id} className="p-8 bg-gray-50 rounded-[32px] border-2 border-gray-100 flex justify-between items-center">
                                            <div className="space-y-2 text-right">
                                                <p className="font-black text-xl text-slate-900">{ex.actionType} - <span className="text-sm opacity-50">{ex.status}</span></p>
                                                <p className="text-sm font-bold text-slate-500 tabular-nums">تاريخ التقديم: {new Date(ex.applicationDate).toLocaleDateString('ar-KW')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </section>
                          )}

                          {(caseItem.expertActions && caseItem.expertActions.length > 0) && (
                             <section>
                                 <h3 className="text-2xl font-black uppercase tracking-tighter border-r-8 border-amber-600 pr-4 mb-8 italic">{t('expert_report', { defaultValue: 'تقرير الخبراء' })}</h3>
                                 <div className="space-y-6">
                                     {caseItem.expertActions.map(ex => (
                                         <div key={ex.id} className="p-8 bg-gray-50 rounded-[32px] border-2 border-gray-100 flex justify-between items-center">
                                             <div className="space-y-2 text-right">
                                                 <p className="font-black text-xl text-slate-900">{ex.expertField} - <span className="text-sm opacity-50">{ex.status}</span></p>
                                                 <p className="text-sm font-bold text-slate-500 tabular-nums">تاريخ الإحالة: {new Date(ex.referralDate).toLocaleDateString('ar-KW')}</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </section>
                          )}
                     </div>
                </div>
            </div>
        </Modal>
    );
};
const CaseForm: React.FC<{
    initialData: Case | null;
    onSubmit: (caseData: Case) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<Case>>(
        initialData || {
            title: '',
            caseNumber: '',
            internalCaseNumber: '',
            fileNumber: '',
            clientName: '',
            clientRole: 'مدعي',
            opposingPartyName: '',
            opponentRole: 'مدعى عليه',
            caseMainType: CaseMainType.COMMERCIAL,
            status: CaseStatus.OPEN,
            priority: CasePriority.NORMAL,
            riskLevel: RiskLevel.LOW,
            courtLevel: CourtLevel.FIRST_INSTANCE,
            litigationStage: LitigationStage.FIRST_INSTANCE,
            filingDate: new Date().toISOString().split('T')[0],
            createdDate: new Date().toISOString(),
            poaNumbers: [],
            notificationStatus: NotificationStatus.NOT_SUBMITTED,
        }
    );

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const values = e.target.value.split(',').map(v => v.trim()).filter(v => v !== '');
        setFormData(prev => ({ ...prev, poaNumbers: values }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.title || !formData.caseNumber || !formData.clientName) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: t('fill_required_fields_error', { defaultValue: 'يرجى تعبئة الحقول الإلزامية: عنوان القضية، رقم القضية، واسم الموكل.' })
            });
            return;
        }
        onSubmit(formData as Case);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-4 custom-scrollbar">
            {/* القسم الأول: معلومات التعريف */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={t('primary_identification', { defaultValue: 'التعريف والترقيم' })} titleClassName="text-sm font-black italic">
                    <div className="space-y-4 pt-2">
                        <Input name="title" label={t('case_title_req', { defaultValue: 'عنوان القضية (*)' })} value={formData.title || ''} onChange={handleChange} required placeholder="مثلاً: شركة أ ضد السيد ب - مطالبة مالية" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="caseNumber" label={t('automated_no', { defaultValue: 'الرقم الآلي للمحكمة (*)' })} value={formData.caseNumber || ''} onChange={handleChange} required placeholder="123456789" />
                            <Input name="fileNumber" label={t('office_file_no', { defaultValue: 'رقم ملف المكتب' })} value={formData.fileNumber || ''} onChange={handleChange} placeholder="OFF-2024-001" />
                        </div>
                        <Input name="internalCaseNumber" label={t('internal_ref', { defaultValue: 'الرقم المرجعي الداخلي' })} value={formData.internalCaseNumber || ''} onChange={handleChange} placeholder="LIT-KW-2024" />
                    </div>
                </Card>

                <Card title={t('parties_involved', { defaultValue: 'أطراف المنازعة' })} titleClassName="text-sm font-black italic">
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <Input name="clientName" label={t('client_name_req', { defaultValue: 'اسم الموكل (*)' })} value={formData.clientName || ''} onChange={handleChange} required />
                            </div>
                            <div className="md:col-span-1">
                                <LegalRoleSelector 
                                    label={t('role', { defaultValue: 'الصفة' })} 
                                    value={formData.clientRole || 'مدعي'} 
                                    isMulti={true}
                                    onChange={(val) => setFormData(prev => ({ ...prev, clientRole: val }))} 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <Input name="opposingPartyName" label={t('opponent_name', { defaultValue: 'اسم الخصم' })} value={formData.opposingPartyName || ''} onChange={handleChange} />
                            </div>
                            <div className="md:col-span-1">
                                <LegalRoleSelector 
                                    label={t('role', { defaultValue: 'الصفة' })} 
                                    value={formData.opponentRole || 'مدعى عليه'} 
                                    isMulti={true}
                                    onChange={(val) => setFormData(prev => ({ ...prev, opponentRole: val }))} 
                                />
                            </div>
                        </div>
                        <Input name="opposingCounsel" label={t('opposing_lawyer', { defaultValue: 'محامي الخصم / مكتب المحاماة' })} value={formData.opposingCounsel || ''} onChange={handleChange} />
                    </div>
                </Card>
            </div>

            {/* القسم الثاني: تصنيف القضية والمحكمة */}
            <Card title={t('case_classification_court', { defaultValue: 'تصنيف الدعوى وجهة التقاضي' })} titleClassName="text-sm font-black italic">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                    <Select name="caseMainType" label={t('case_type', { defaultValue: 'نوع القضية' })} value={formData.caseMainType} options={caseMainTypeOptions} onChange={handleChange} />
                    <Select name="courtLevel" label={t('litigation_degree', { defaultValue: 'درجة التقاضي' })} value={formData.courtLevel} options={courtLevelOptions} onChange={handleChange} />
                    <Select name="litigationStage" label={t('current_stage', { defaultValue: 'المرحلة الحالية' })} value={formData.litigationStage || ''} options={litigationStageOptions} onChange={handleChange} />
                    <Select name="courtName" label={t('court', { defaultValue: 'المحكمة المختصة' })} value={formData.courtName || ''} options={[{value:'', label: t('choose_court', { defaultValue: 'اختر المحكمة' })}, ...KUWAIT_COURTS_LIST]} onChange={handleChange} />
                    <Input name="circuit" label={t('court_circuit', { defaultValue: 'الدائرة' })} value={formData.circuit || ''} onChange={handleChange} placeholder="مثلاً: تجاري كلي 7" />
                    <Input name="judgeName" label={t('judge_name', { defaultValue: 'اسم رئيس الدائرة / القاضي' })} value={formData.judgeName || ''} onChange={handleChange} />
                    <Input name="assignedLawyer" label={t('lawyer_in_charge', { defaultValue: 'المحامي المسؤول' })} value={formData.assignedLawyer || ''} onChange={handleChange} />
                    <Select name="status" label={t('file_status', { defaultValue: 'حالة الملف' })} value={formData.status} options={caseStatusOptions} onChange={handleChange} />
                </div>
            </Card>

            {/* القسم الثالث: المواعيد والإجراءات القانونية */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={t('legal_deadlines_notifications', { defaultValue: 'المواعيد والإعلانات' })} titleClassName="text-sm font-black italic">
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Input name="filingDate" label={t('filing_date', { defaultValue: 'تاريخ رفع الدعوى' })} type="date" value={formData.filingDate || ''} onChange={handleChange} />
                        <Input name="statuteOfLimitationsDate" label={t('limitations_date', { defaultValue: 'تاريخ سقوط الحق / التقادم' })} type="date" value={formData.statuteOfLimitationsDate || ''} onChange={handleChange} />
                        <Select name="notificationStatus" label={t('notification_status', { defaultValue: 'حالة الإعلان' })} value={formData.notificationStatus || ''} options={notificationStatusOptions} onChange={handleChange} />
                        <Input name="poaNumbers" label={t('poa_numbers_comma', { defaultValue: 'أرقام التوكيلات (مفصولة بفواصل)' })} value={formData.poaNumbers?.join(', ') || ''} onChange={handlePoaChange} placeholder="123/2024-أ, 456/2024-ح" />
                    </div>
                </Card>

                <Card title={t('priorities_risks', { defaultValue: 'الأولوية والمخاطر' })} titleClassName="text-sm font-black italic">
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Select name="priority" label={t('priority', { defaultValue: 'درجة الأهمية' })} value={formData.priority} options={casePriorityOptions} onChange={handleChange} />
                        <Select name="riskLevel" label={t('risk_analysis', { defaultValue: 'تحليل المخاطر' })} value={formData.riskLevel} options={riskLevelOptions} onChange={handleChange} />
                        <div className="col-span-2">
                           <Input name="caseObjective" label={t('case_objective', { defaultValue: 'الهدف الاستراتيجي من القضية' })} value={formData.caseObjective || ''} onChange={handleChange} placeholder="مثال: الحصول على حكم بالتعويض المادي لجبر الضرر..." />
                        </div>
                    </div>
                </Card>
            </div>

            {/* القسم الرابع: الموضوع والطلبات */}
            <Card title={t('subject_and_demands', { defaultValue: 'الموضوع والطلبات والملاحظات' })} titleClassName="text-sm font-black italic">
                <div className="space-y-4 pt-2">
                    <TextArea name="description" label={t('case_description', { defaultValue: 'ملخص موضوع الدعوى' })} value={formData.description || ''} onChange={handleChange} rows={3} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextArea name="legalDemands" label={t('legal_demands_form', { defaultValue: 'الطلبات الختامية' })} value={formData.legalDemands || ''} onChange={handleChange} rows={3} />
                        <TextArea name="legalNotes" label={t('legal_notes_form', { defaultValue: 'ملاحظات قانونية خاصة' })} value={formData.legalNotes || ''} onChange={handleChange} rows={3} />
                    </div>
                </div>
            </Card>

            {/* القسم الخامس: البيانات المالية */}
            <Card title={t('financial_data', { defaultValue: 'الاتفاق المادي والأتعاب' })} titleClassName="text-sm font-black italic">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('total_agreed_fees', { defaultValue: 'إجمالي الأتعاب المتفق عليها' })}</label>
                        <Input 
                            type="number" 
                            value={formData.financials?.totalFees || 0} 
                            onChange={(e) => setFormData(p => ({...p, financials: {...(p.financials || {paid:0, remaining:0, currency:'د.ك'}), totalFees: Number(e.target.value)}}))}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('paid_amount', { defaultValue: 'المبلغ المسدد' })}</label>
                        <Input 
                            type="number" 
                            value={formData.financials?.paid || 0} 
                            onChange={(e) => setFormData(p => ({...p, financials: {...(p.financials || {totalFees:0, remaining:0, currency:'د.ك'}), paid: Number(e.target.value)}}))}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('remaining_balance', { defaultValue: 'المتبقي المستحق' })}</label>
                        <Input 
                            type="number" 
                            value={(formData.financials?.totalFees || 0) - (formData.financials?.paid || 0)} 
                            disabled
                            className="bg-slate-50 font-black text-indigo-600"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('currency', { defaultValue: 'العملة' })}</label>
                        <Input 
                            value={formData.financials?.currency || 'د.ك'} 
                            onChange={(e) => setFormData(p => ({...p, financials: {...(p.financials || {totalFees:0, paid:0, remaining:0}), currency: e.target.value}}))}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-white/90 backdrop-blur-md pt-6 pb-2 border-t border-slate-100 no-print z-10">
                <Button type="button" variant="outline" className="px-8 rounded-xl h-12 font-black text-[11px] uppercase tracking-widest" onClick={onCancel}>{t('discard', { defaultValue: 'إلغاء الإجراء' })}</Button>
                <Button type="submit" className="px-12 rounded-xl h-12 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10">
                    {initialData?.id ? t('update_case_file', { defaultValue: 'تحديث ملف القضية' }) : t('create_case_file', { defaultValue: 'فتح ملف تقاضي جديد' })}
                </Button>
            </div>
        </form>
    );
};

interface PrintableCaseReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseItem: Case | null;
}

const PrintableCaseReportModal: React.FC<PrintableCaseReportModalProps> = ({ isOpen, onClose, caseItem }) => {
    const { t } = useTranslation();
    if (!caseItem) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('case_report_print', { defaultValue: 'طباعة تقرير القضية' })} size="xl">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4 printable-area">
                <PrintHeader 
                    title={t('legal_case_report', { defaultValue: 'تقرير ملف قضية قانونية' })} 
                    subtitle={`${caseItem.title} - ${caseItem.internalCaseNumber}`} 
                />

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2 text-right text-black">
                        <p className="flex justify-between border-b pb-1 font-medium"><span className="text-gray-500">{t('case_title', { defaultValue: 'موضوع القضية' })}:</span> <span>{caseItem.title}</span></p>
                        <p className="flex justify-between border-b pb-1 font-medium"><span className="text-gray-500">{t('case_number', { defaultValue: 'رقم القضية' })}:</span> <span className="tabular-nums">{caseItem.caseNumber}</span></p>
                        <p className="flex justify-between border-b pb-1 font-medium"><span className="text-gray-500">{t('client_name', { defaultValue: 'الموكل' })}:</span> <span>{caseItem.clientName}</span></p>
                    </div>
                    <div className="space-y-2 text-right text-black">
                        <p className="flex justify-between border-b pb-1 font-medium"><span className="text-gray-500">{t('opponent_name', { defaultValue: 'الخصم' })}:</span> <span>{caseItem.opposingPartyName}</span></p>
                        <p className="flex justify-between border-b pb-1 font-medium"><span className="text-gray-500">{t('court_name', { defaultValue: 'المحكمة' })}:</span> <span>{caseItem.courtName}</span></p>
                        <p className="flex justify-between border-b pb-1 font-medium"><span className="text-gray-500">{t('court_level', { defaultValue: 'درجة التقاضي' })}:</span> <span>{caseItem.courtLevel}</span></p>
                    </div>
                </div>

                {caseItem.description && (
                    <div className="p-4 bg-gray-50 rounded-xl text-right text-black">
                        <h4 className="font-bold text-sm mb-2">{t('case_description', { defaultValue: 'وصف الدعوى' })}</h4>
                        <p className="text-xs text-gray-700 leading-relaxed">{caseItem.description}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 no-print pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>{t('close', { defaultValue: 'إغلاق' })}</Button>
                    <Button onClick={handlePrint}>{t('print', { defaultValue: 'طباعة' })}</Button>
                </div>
            </div>
        </Modal>
    );
};

const CaseListPage: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [cases, setCases] = useState<Case[]>(initialCases);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState(initialFilters);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [viewingCase, setViewingCase] = useState<Case | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [viewType, setViewType] = useState<'table' | 'grid' | 'board'>('grid');

    const stats = useMemo(() => {
        const total = cases.length;
        const open = cases.filter(c => c.status === CaseStatus.OPEN || c.status === CaseStatus.IN_PROGRESS).length;
        const closed = cases.filter(c => c.status === CaseStatus.CLOSED).length;
        const totalFees = cases.reduce((acc, c) => acc + (c.financials?.totalFees || 0), 0);
        const totalRemaining = cases.reduce((acc, c) => acc + ((c.financials?.totalFees || 0) - (c.financials?.paid || 0)), 0);
        
        return { total, open, closed, totalFees, totalRemaining };
    }, [cases]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };
    
    const clearFilters = () => {
        setFilters(initialFilters);
        setSearchTerm('');
    };

    const filteredCases = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();

        return cases.filter(c => {
            const searchMatch = lowerSearchTerm === '' ? true : (
                c.title.toLowerCase().includes(lowerSearchTerm) ||
                (c.description && c.description.toLowerCase().includes(lowerSearchTerm)) ||
                c.clientName.toLowerCase().includes(lowerSearchTerm) ||
                (c.opposingPartyName && c.opposingPartyName.toLowerCase().includes(lowerSearchTerm)) ||
                c.caseNumber.toLowerCase().includes(lowerSearchTerm) ||
                (c.internalCaseNumber && c.internalCaseNumber.toLowerCase().includes(lowerSearchTerm))
            );

            if (!searchMatch) return false;

            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const caseValue = (c as any)[key];
                if (key === 'fromDate') return new Date(c.filingDate) >= new Date(String(value));
                if (key === 'toDate') return new Date(c.filingDate) <= new Date(String(value));
                if(typeof caseValue === 'string') return caseValue.toLowerCase().includes(String(value).toLowerCase());
                return true;
            });
        });
    }, [cases, filters, searchTerm]);

    const handleAddCase = () => {
        setSelectedCase(null);
        setIsFormModalOpen(true);
    };

    const handleEditCase = (caseToEdit: Case) => {
        setSelectedCase(caseToEdit);
        setIsFormModalOpen(true);
    };
    
    const handleViewCase = (caseToView: Case) => {
        setViewingCase(caseToView);
    };

    const handleDeleteCase = useCallback((caseId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
            setCases(prev => prev.filter(c => c.id !== caseId));
            addToast({
                type: 'success',
                title: 'تم الحذف',
                message: 'تم حذف القضية بنجاح من النظام.'
            });
        }
    }, [addToast]);

    const handleFormSubmit = (caseData: Case) => {
        if (selectedCase && selectedCase.id) {
            setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, ...caseData, lastModifiedDate: new Date().toISOString() } : c));
            addToast({
                type: 'success',
                title: 'تم التحديث',
                message: 'تم تحديث بيانات القضية بنجاح.'
            });
        } else {
            const newCase: Case = { ...caseData, id: `case-${Date.now()}`, createdDate: new Date().toISOString() };
            setCases(prev => [newCase, ...prev]);
            addToast({
                type: 'success',
                title: 'تمت الإضافة',
                message: 'تمت إضافة القضية الجديدة بنجاح.'
            });
        }
        setIsFormModalOpen(false);
        setSelectedCase(null);
    };

    const handleUpdateCase = (updatedCase: Case) => {
        setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
        if (viewingCase?.id === updatedCase.id) {
            setViewingCase(updatedCase);
        }
        addToast({
            type: 'info',
            title: 'تحديث البيانات',
            message: 'تم تحديث سجلات القضية.'
        });
    };

    const renderBoardView = () => {
        const columns = [
            { title: 'قضايا مفتوحة', status: CaseStatus.OPEN, color: 'bg-emerald-50/30', accent: 'border-emerald-100', icon: <BriefcaseIcon className="w-5 h-5 text-emerald-600" /> },
            { title: 'قيد التنفيذ', status: CaseStatus.IN_PROGRESS, color: 'bg-blue-50/30', accent: 'border-blue-100', icon: <TrendingUpIcon className="w-5 h-5 text-blue-600" /> },
            { title: 'قيد الانتظار', status: CaseStatus.PENDING, color: 'bg-amber-50/30', accent: 'border-amber-100', icon: <ClockIcon className="w-5 h-5 text-amber-600" /> },
            { title: 'مستأنفة', status: CaseStatus.APPEALED, color: 'bg-rose-50/30', accent: 'border-rose-100', icon: <ScaleIcon className="w-5 h-5 text-rose-600" /> },
            { title: 'مغلقة', status: CaseStatus.CLOSED, color: 'bg-gray-50/30', accent: 'border-gray-100', icon: <CheckCircleIcon className="w-5 h-5 text-gray-600" /> },
        ];

        return (
            <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar h-[600px]">
                {columns.map(col => {
                    const casesInColumn = filteredCases.filter(c => c.status === col.status);
                    return (
                        <div key={col.status} className={`flex-shrink-0 w-80 rounded-2xl ${col.color} border border-gray-100 flex flex-col`}>
                            <div className="p-4 flex justify-between items-center border-b border-white/50">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm">{col.icon}</div>
                                    <h3 className="font-bold text-gray-800 text-sm">{col.title}</h3>
                                </div>
                                <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 shadow-sm border border-gray-100">
                                    {casesInColumn.length}
                                </span>
                            </div>

                            <div className="p-3 overflow-y-auto flex-1 space-y-3">
                                {casesInColumn.map(c => (
                                    <div 
                                        key={c.id} 
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all cursor-pointer group"
                                        onClick={() => handleViewCase(c)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{c.internalCaseNumber}</span>
                                            <PriorityBadge priority={c.priority} size="xs" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-xs mb-3 group-hover:text-primary line-clamp-2">{c.title}</h4>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="text-[9px] text-gray-400">{c.assignedLawyer}</div>
                                            <button className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">التفاصيل</button>
                                        </div>
                                    </div>
                                ))}
                                {casesInColumn.length === 0 && (
                                    <div className="text-center py-10 opacity-20 italic text-[10px]">لا يوجد قضايا</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 font-sans">
            <PrintHeader title="سجل القضايا والملفات القانونية" subtitle="تقرير جرد القضايا الجارية والمنتهية والملفات القضائية" />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center no-print px-1">
                <div className="flex items-center mb-4 md:mb-0">
                    <BriefcaseIcon className="w-8 h-8 text-primary me-3 text-primary-dark" />
                    <div className="flex flex-col text-right">
                        <h1 className="text-3xl font-bold text-primary-dark">إدارة القضايا والملفات</h1>
                        <p className="text-xs text-gray-500 font-medium">نظام إدارة ومتابعة ملفات التقاضي والعمليات القانونية</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleAddCase} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
                        إضافة قضية جديدة
                    </Button>
                </div>
            </div>

            {/* Info Card */}
            <Card className="bg-primary-light/5 border-primary-light/20 no-print mx-1">
                <div className="flex items-start">
                    <ScaleIcon className="w-6 h-6 text-primary me-3 mt-1 flex-shrink-0"/>
                    <div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                            منظومة إدارة القضايا تتيح لك متابعة كافة الجلسات، التنبيهات القانونية، الأرشيف الإلكتروني للمستندات، والإجراءات التنفيذية. يمكنك استخدام الفلاتر المتقدمة للوصول السريع للملفات المطلوبة.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Filters & Content Section */}
            <Card className="no-print mx-1 shadow-sm border-gray-100">
                <div className="p-4 bg-gray-50 rounded-lg mb-6 border border-gray-100">
                    <div className="relative group mb-4">
                        <input 
                            type="text" 
                            className="block w-full h-11 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-right font-medium text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
                            placeholder="البحث برقم القضية، الرقم الآلي، الموكل، الخصم أو موضوع الدعوى..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <SearchIcon className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <Select 
                            label="المحكمة" 
                            name="court"
                            options={[{label: 'كافة المحاكم', value: ''}, ...KUWAIT_COURTS_LIST]} 
                            value={filters.court} 
                            onChange={handleFilterChange}
                            containerClassName="mb-0"
                            className="h-10 rounded-xl border-gray-200"
                        />
                        <Select 
                            label="نوع الجلسة" 
                            name="hearingType"
                            options={[{label: 'الكل', value: ''}, ...hearingTypeOptions]} 
                            value={filters.hearingType} 
                            onChange={handleFilterChange}
                            containerClassName="mb-0"
                            className="h-10 rounded-xl border-gray-200"
                        />
                        <Select 
                            label="حالة القضية" 
                            name="status"
                            options={[{label: 'كافة الحالات', value: ''}, ...caseStatusOptions]} 
                            value={filters.status} 
                            onChange={handleFilterChange}
                            containerClassName="mb-0"
                            className="h-10 rounded-xl border-gray-200"
                        />
                        <Select 
                            label="المجموعة" 
                            name="group"
                            options={[{label: 'الكل', value: ''}, ...caseGroupOptions]} 
                            value={filters.group} 
                            onChange={handleFilterChange}
                            containerClassName="mb-0"
                            className="h-10 rounded-xl border-gray-200"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <LegalRoleSelector 
                            label="صفة الموكل" 
                            value={filters.clientRole} 
                            isMulti={false}
                            onChange={(val) => setFilters(prev => ({ ...prev, clientRole: val as string }))} 
                        />
                        <LegalRoleSelector 
                            label="صفة الخصم" 
                            value={filters.opponentRole} 
                            isMulti={false}
                            onChange={(val) => setFilters(prev => ({ ...prev, opponentRole: val as string }))} 
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-4 items-end">
                        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                            <Input 
                                label="من تاريخ"
                                type="date" 
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="h-10 rounded-xl border-gray-200"
                            />
                            <Input 
                                label="إلى تاريخ"
                                type="date" 
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="h-10 rounded-xl border-gray-200"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 md:flex-none h-10 px-8 rounded-xl border-gray-200"
                                onClick={clearFilters}
                                leftIcon={<ArrowPathIcon className="w-4 h-4"/>}
                            >
                                تفريغ البحث
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 no-print px-1">
                     <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { key: 'all', label: 'كافة القضايا' },
                            { key: 'urgent', label: 'المستعجلة' },
                            { key: 'recent', label: 'النشاط الأخير' }
                        ].map((pill) => (
                            <button 
                                key={pill.key} 
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${pill.key === 'all' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {pill.label}
                            </button>
                        ))}
                     </div>
                     
                     <div className="flex items-center gap-3">
                         <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                             <button 
                                onClick={() => setViewType('table')}
                                className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                 <ClipboardIcon className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => setViewType('grid')}
                                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                 <FolderIcon className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => setViewType('board')}
                                className={`p-2 rounded-lg transition-all ${viewType === 'board' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                 <ViewColumnsIcon className="w-4 h-4" />
                             </button>
                         </div>
                     </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {viewType === 'table' ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600">القضية</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600">الموكل/الخصم</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600">المحكمة</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600">آخر قرار</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">المستشار</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-600">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredCases.length > 0 ? (
                                            filteredCases.map((c, index) => {
                                                const lastHearing = c.hearings?.[c.hearings.length-1];
                                                return (
                                                    <motion.tr 
                                                        key={c.id} 
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                                                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                                        onClick={() => handleViewCase(c)}
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="font-bold text-primary-dark max-w-xs truncate">{c.title}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">#{c.caseNumber} | {c.internalCaseNumber}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col gap-1.5 min-w-[200px]">
                                                                <div className="flex flex-wrap items-center justify-between gap-1">
                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="الموكل" />
                                                                        <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[125px]">{c.clientName}</span>
                                                                    </div>
                                                                    <div className="shrink-0">{renderRoleBadge(c.clientRole, 'client')}</div>
                                                                </div>
                                                                <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" title="الخصم" />
                                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[125px]">{c.opposingPartyName || '---'}</span>
                                                                    </div>
                                                                    <div className="shrink-0">{renderRoleBadge(c.opponentRole, 'opponent')}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-xs text-gray-700">{c.courtName}</div>
                                                            <div className="text-[10px] text-gray-400">{c.courtLevel}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <CaseStatusBadge status={c.status} size="xs" />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-[11px] text-gray-600 line-clamp-1 max-w-[150px]">{lastHearing?.notes || '---'}</div>
                                                            <div className="text-[10px] text-gray-400">{lastHearing?.date || '---'}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-xs text-gray-700">{c.assignedLawyer}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => handleViewCase(c)} title="عرض"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => handleEditCase(c)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCase(c.id)} className="w-8 h-8 p-0 text-danger" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-20 text-gray-500">
                                                    <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 opacity-30" />
                                                    لا توجد قضايا تطابق معايير البحث.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : viewType === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCases.map((c) => (
                                    <div 
                                        key={c.id} 
                                        className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
                                        onClick={() => handleViewCase(c)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">{c.internalCaseNumber}</span>
                                                <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{c.title}</h4>
                                            </div>
                                            <PriorityBadge priority={c.priority} size="xs" />
                                        </div>
                                        
                                        <div className="space-y-2 py-3 border-y border-gray-50 mb-4">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">المحكمة:</span>
                                                <span className="font-semibold text-gray-700">{c.courtName}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">آخر قرار:</span>
                                                <span className="font-medium text-primary truncate max-w-[120px]">{c.hearings?.[c.hearings.length-1]?.notes || '---'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <CaseStatusBadge status={c.status} size="xs" />
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleEditCase(c)} className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors"><PencilIcon className="w-3.5 h-3.5"/></button>
                                                <button onClick={() => handleDeleteCase(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-3.5 h-3.5"/></button>
                                                <button onClick={() => handleViewCase(c)} className="p-1.5 text-primary hover:scale-105 transition-all text-[10px] font-bold">عرض</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : renderBoardView() }
                    </motion.div>
                </AnimatePresence>
                
                {filteredCases.length > 0 && <p className="pt-6 text-[9px] text-gray-400 text-center uppercase tracking-[0.2em] font-bold opacity-60">إجمالي القضايا النشطة: {filteredCases.length}</p>}
            </Card>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedCase ? 'تعديل بيانات القضية' : 'إضافة قضية جديدة'} size="xl">
                <CaseForm 
                    initialData={selectedCase} 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsFormModalOpen(false)} 
                />
            </Modal>

            {viewingCase && (
                <CaseDetailsModal 
                    caseItem={viewingCase} 
                    onClose={() => setViewingCase(null)} 
                    onUpdateCase={handleUpdateCase}
                    onPrint={() => setIsPrintModalOpen(true)}
                />
            )}

            <PrintableCaseReportModal 
                isOpen={isPrintModalOpen} 
                onClose={() => setIsPrintModalOpen(false)} 
                caseItem={viewingCase} 
            />
        </div>
    );
};

export default CaseListPage;
