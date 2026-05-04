
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Case, CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel, Hearing, CaseFile, ExecutionActionType, ExecutionActionStatus, ExpertActionStatus, ExpertField, ExecutionAction, ExpertAction } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { CaseStatusBadge, RiskLevelBadge, PriorityBadge, ExecutionActionStatusBadge, ExpertActionStatusBadge } from '../components/ui/Badge'; 
import { 
    BriefcaseIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    PrinterIcon, DocumentDuplicateIcon, MagnifyingGlassIcon, ScaleIcon, 
    GavelIcon, ClockIcon, BrainIcon, DocumentTextIcon, TagIcon,
    ActivityIcon, CheckCircleIcon, SparklesIcon, HistoryIcon, 
    ArrowPathIcon, ClipboardIcon, InformationCircleIcon, SearchIcon, FileEditIcon
} from '../constants'; 
import ReactMarkdown from 'react-markdown';
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
    expertActionStatusOptions
} from '../constants';

import { initialCases } from '../data/caseData';

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

// --- Case Details Modal Component ---
interface CaseDetailsModalProps {
    caseItem: Case;
    onClose: () => void;
    onUpdateCase: (updatedCase: Case) => void;
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
        <div className="flex items-center w-full mt-4 mb-2 px-2">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center relative flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${index <= finalIndex ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index + 1}
                        </div>
                        <span className={`text-[9px] mt-1 font-medium whitespace-nowrap ${index <= finalIndex ? 'text-primary' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-4 transition-colors ${index < finalIndex ? 'bg-primary' : 'bg-gray-200'}`}></div>
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
        <div className="flex items-center w-full mt-4 mb-2 px-2">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center relative flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${index <= finalIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index + 1}
                        </div>
                        <span className={`text-[9px] mt-1 font-medium whitespace-nowrap ${index <= finalIndex ? 'text-indigo-600' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-4 transition-colors ${index < finalIndex ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
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
    const [formData, setFormData] = useState<Partial<ExecutionAction>>(
        initialData || {
            actionType: ExecutionActionType.TRAVEL_BAN,
            status: ExecutionActionStatus.PENDING_SUBMISSION,
            applicationDate: new Date().toISOString().split('T')[0],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.actionType || !formData.applicationDate) {
            alert('يرجى تعبئة الحقول الإلزامية.');
            return;
        }
        onSubmit({
            ...formData,
            id: formData.id || `exec-${Date.now()}`,
        } as ExecutionAction);
    };

    return (
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
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                <Button type="submit" size="sm">{t('save_action', { defaultValue: 'حفظ الإجراء' })}</Button>
            </div>
        </form>
    );
};

const ExpertActionForm: React.FC<{
    initialData?: Partial<ExpertAction>;
    onSubmit: (action: ExpertAction) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<ExpertAction>>(
        initialData || {
            status: ExpertActionStatus.PENDING_ASSIGNMENT,
            referralDate: new Date().toISOString().split('T')[0],
            expertField: ExpertField.ACCOUNTING,
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.assignedTask || !formData.referralDate) {
            alert('يرجى تعبئة الحقول الإلزامية.');
            return;
        }
        onSubmit({
            ...formData,
            id: formData.id || `exp-${Date.now()}`,
        } as ExpertAction);
    };

    return (
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
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                <Button type="submit" size="sm">{t('save_data', { defaultValue: 'حفظ البيانات' })}</Button>
            </div>
        </form>
    );
};

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ caseItem, onClose, onUpdateCase }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<'details' | 'hearings' | 'archive' | 'execution' | 'ai'>('details');
    const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);
    const [analyzedFiles, setAnalyzedFiles] = useState<Record<string, { tags: string[], summary: string }>>({});
    
    // --- AI Case Summary State ---
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiCaseSummary, setAiCaseSummary] = useState<string | null>(null);

    const handleGenerateAiSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const prompt = `بصفتك خبير قانوني، قم بتحليل بيانات هذه القضية وتلخيصها وتوقع الاحتمالات القانونية لها بناءً على الوقائع المذكورة:
            العنوان: ${caseItem.title}
            رقم القضية: ${caseItem.caseNumber}
            الوقائع: ${caseItem.description}
            الحالة: ${caseItem.status}
            المحكمة: ${caseItem.courtName}
            الخصم: ${caseItem.opposingPartyName}`;
            
            const response = await geminiService.getChatbotResponse(prompt);
            setAiCaseSummary(response);
        } catch (err) {
            console.error(err);
            setAiCaseSummary(t('ai_summary_error', { defaultValue: 'تعذر توليد التلخيص حالياً. يرجى المحاولة لاحقاً.' }));
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const [isAddingExecAction, setIsAddingExecAction] = useState(false);
    const [editingExecAction, setEditingExecAction] = useState<ExecutionAction | null>(null);
    const [isAddingExpertAction, setIsAddingExpertAction] = useState(false);
    const [editingExpertAction, setEditingExpertAction] = useState<ExpertAction | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleAnalyzeFile = (fileId: string) => {
        setAnalyzingFileId(fileId);
        // Simulate AI Analysis Delay
        setTimeout(() => {
            const mockAnalysis = {
                tags: ['عقد', 'ملزم', 'تجاري', 'مراجعة قانونية'],
                summary: 'يحتوي هذا المستند على بنود اتفاقية توريد مواد بناء، مع شرط جزائي بقيمة 10% في حال التأخير. يبدو التوقيع صحيحاً من الطرفين.'
            };
            setAnalyzedFiles(prev => ({ ...prev, [fileId]: mockAnalysis }));
            setAnalyzingFileId(null);
        }, 2000);
    };

    const renderDetailsTab = () => (
        <div className="space-y-4 animate-fade-in-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title={t('parties_info', { defaultValue: 'بيانات الأطراف' })} className="h-full bg-gray-50" titleClassName="text-sm font-bold text-primary">
                    <p><strong>{t('client', { defaultValue: 'الموكل' })}:</strong> {caseItem.clientName} <span className="text-gray-500">({caseItem.clientRole})</span></p>
                    <p><strong>{t('opponent', { defaultValue: 'الخصم' })}:</strong> {caseItem.opposingPartyName} <span className="text-gray-500">({caseItem.opponentRole})</span></p>
                    {caseItem.opposingCounsel && <p><strong>{t('opposing_counsel', { defaultValue: 'محامي الخصم' })}:</strong> {caseItem.opposingCounsel}</p>}
                </Card>
                <Card title={t('court_details_category', { defaultValue: 'بيانات المحكمة والتصنيف' })} className="h-full bg-gray-50" titleClassName="text-sm font-bold text-primary">
                    <p><strong>{t('court', { defaultValue: 'المحكمة' })}:</strong> {caseItem.courtName}</p>
                    <p><strong>{t('court_level', { defaultValue: 'الدرجة' })}:</strong> {caseItem.courtLevel}</p>
                    <p><strong>{t('case_type', { defaultValue: 'النوع' })}:</strong> {caseItem.caseMainType} {caseItem.caseSubType ? `- ${caseItem.caseSubType}` : ''}</p>
                    <p><strong>{t('filing_date', { defaultValue: 'تاريخ الرفع' })}:</strong> {new Date(caseItem.filingDate).toLocaleDateString('ar-EG')}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center">
                    <p className="text-xs text-blue-600 mb-1">{t('status', { defaultValue: 'الحالة' })}</p>
                    <CaseStatusBadge status={caseItem.status} size="sm"/>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <p className="text-xs text-yellow-600 mb-1">{t('priority', { defaultValue: 'الأولوية' })}</p>
                    <PriorityBadge priority={caseItem.priority} size="sm"/>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
                    <p className="text-xs text-red-600 mb-1">{t('risks', { defaultValue: 'المخاطر' })}</p>
                    <RiskLevelBadge level={caseItem.riskLevel} size="sm"/>
                </div>
            </div>

            {caseItem.description && (
                <Card title={t('case_description_facts', { defaultValue: 'وصف القضية والوقائع' })} titleClassName="text-sm font-bold text-primary">
                    <p className="text-gray-700 leading-relaxed text-sm">{caseItem.description}</p>
                </Card>
            )}
        </div>
    );

    const renderHearingsTab = () => (
        <div className="animate-fade-in-right">
            {caseItem.hearings && caseItem.hearings.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-right">{t('date', { defaultValue: 'التاريخ' })}</th>
                                <th className="px-4 py-3 text-right">{t('type', { defaultValue: 'النوع' })}</th>
                                <th className="px-4 py-3 text-right">{t('location', { defaultValue: 'المكان' })}</th>
                                <th className="px-4 py-3 text-right">{t('status', { defaultValue: 'الحالة' })}</th>
                                <th className="px-4 py-3 text-right">{t('notes_decision', { defaultValue: 'ملاحظات/قرار' })}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {caseItem.hearings.map(h => (
                                <tr key={h.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(h.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                    <td className="px-4 py-3">{h.type}</td>
                                    <td className="px-4 py-3">{h.courtRoomOrLocation}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs ${h.status === 'Completed' ? 'bg-green-100 text-green-800' : h.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {h.status === 'Scheduled' ? t('scheduled', { defaultValue: 'مجدولة' }) : h.status === 'Completed' ? t('finished', { defaultValue: 'منتهية' }) : h.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{h.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300"/>
                    {t('no_hearings_recorded', { defaultValue: 'لا توجد جلسات مسجلة لهذه القضية.' })}
                </div>
            )}
        </div>
    );

    const renderSmartArchiveTab = () => (
        <div className="animate-fade-in-right space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex items-start">
                <BrainIcon className="w-6 h-6 text-indigo-600 me-3 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-indigo-800 text-sm">{t('smart_archive_assistant', { defaultValue: 'المساعد الذكي للأرشفة' })}</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                        {t('smart_archive_desc', { defaultValue: 'يقوم النظام بتحليل المستندات المرفقة تلقائياً لاستخراج البيانات الرئيسية، واقتراح التصنيفات، وتلخيص المحتوى القانوني لتسهيل البحث والمراجعة.' })}
                    </p>
                </div>
            </div>

            {caseItem.caseFiles && caseItem.caseFiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {caseItem.caseFiles.map(file => {
                        const analysis = analyzedFiles[file.id];
                        const isAnalyzing = analyzingFileId === file.id;

                        return (
                            <div key={file.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="bg-gray-100 p-2 rounded-lg me-3">
                                            <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{file.fileName}</p>
                                            <p className="text-xs text-gray-500">{file.fileType} • {new Date(file.uploadedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 space-x-reverse">
                                        <Button size="sm" variant="outline" leftIcon={<EyeIcon className="w-3"/>}>{t('view', { defaultValue: 'عرض' })}</Button>
                                        {!analysis && !isAnalyzing && (
                                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleAnalyzeFile(file.id)} leftIcon={<BrainIcon className="w-3"/>}>
                                                {t('smart_analyze', { defaultValue: 'تحليل ذكي' })}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {isAnalyzing && (
                                    <div className="mt-3 text-xs text-indigo-600 flex items-center animate-pulse">
                                        <BrainIcon className="w-4 h-4 me-2" />
                                        {t('analyzing_doc', { defaultValue: 'جاري تحليل المستند واستخراج البيانات...' })}
                                    </div>
                                )}

                                {analysis && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 bg-indigo-50/50 p-3 rounded-md">
                                        <div className="mb-2">
                                            <span className="text-xs font-bold text-indigo-800 block mb-1">{t('suggested_keywords', { defaultValue: 'الكلمات المفتاحية المقترحة:' })}</span>
                                            <div className="flex flex-wrap gap-1">
                                                {analysis.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-white border border-indigo-200 text-indigo-700 text-xxs px-2 py-0.5 rounded-full flex items-center">
                                                        <TagIcon className="w-3 h-3 me-1"/> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-indigo-800 block mb-1">{t('ai_content_summary', { defaultValue: 'ملخص المحتوى (AI):' })}</span>
                                            <p className="text-xs text-gray-700 leading-relaxed bg-white p-2 rounded border border-indigo-100">
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
                <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>
                    {t('no_docs_attached', { defaultValue: 'لا توجد مستندات مرفقة في هذا الملف.' })}
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
            <div className="animate-fade-in-right space-y-8">
                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-center shadow-sm">
                        <div className="bg-primary/10 p-3 rounded-full me-4">
                            <GavelIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xxs text-gray-500 uppercase tracking-wider">{t('total_execution', { defaultValue: 'إجمالي التنفيذ' })}</p>
                            <p className="text-xl font-bold text-primary-dark">{(caseItem.executionActions || []).length}</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center shadow-sm">
                        <div className="bg-blue-100 p-3 rounded-full me-4">
                            <ActivityIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xxs text-gray-500 uppercase tracking-wider">{t('active_actions', { defaultValue: 'إجراءات نشطة' })}</p>
                            <p className="text-xl font-bold text-blue-700">{activeExecCount}</p>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center shadow-sm">
                        <div className="bg-green-100 p-3 rounded-full me-4">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xxs text-gray-500 uppercase tracking-wider">{t('completed_actions', { defaultValue: 'إجراءات مكتملة' })}</p>
                            <p className="text-xl font-bold text-green-700">{completedExecCount}</p>
                        </div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center shadow-sm">
                        <div className="bg-indigo-100 p-3 rounded-full me-4">
                            <ScaleIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xxs text-gray-500 uppercase tracking-wider">{t('expert_actions', { defaultValue: 'إجراءات الخبراء' })}</p>
                            <p className="text-xl font-bold text-indigo-700">{(caseItem.expertActions || []).length}</p>
                        </div>
                    </div>
                </div>

                {/* Execution Actions Section */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <div className="flex items-center">
                            <GavelIcon className="w-5 h-5 me-2 text-primary"/>
                            <div>
                                <h4 className="font-bold text-primary-dark">{t('execution_actions_tracking', { defaultValue: 'تتبع إجراءات التنفيذ' })}</h4>
                                <p className="text-xxs text-gray-400">{t('execution_tracking_desc', { defaultValue: 'سجل الحجوزات والمنوعات والإجراءات التنفيذية' })}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                leftIcon={<PrinterIcon className="w-4 h-4"/>}
                                onClick={() => window.print()}
                            >
                                {t('print_report', { defaultValue: 'طباعة التقرير' })}
                            </Button>
                            <Button size="sm" variant="primary" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} onClick={() => { setIsAddingExecAction(true); setEditingExecAction(null); }}>
                                {t('add_execution_action', { defaultValue: 'إضافة إجراء تنفيذي' })}
                            </Button>
                        </div>
                    </div>

                    {(isAddingExecAction || editingExecAction) && (
                        <div className="mb-6">
                            <ExecutionActionForm 
                                initialData={editingExecAction || undefined} 
                                onSubmit={handleSaveExecAction} 
                                onCancel={() => { setIsAddingExecAction(false); setEditingExecAction(null); }} 
                            />
                        </div>
                    )}

                    {caseItem.executionActions && caseItem.executionActions.length > 0 ? (
                        <div className="space-y-4">
                            {caseItem.executionActions.map((action, index) => (
                                <div key={action.id} className="relative bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                    {/* Timeline indicator */}
                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center mb-1">
                                                <span className="bg-primary/10 text-primary text-xxs font-bold px-2 py-0.5 rounded-md me-2">#{index + 1}</span>
                                                <h5 className="font-bold text-gray-900">{action.actionType}</h5>
                                            </div>
                                            {action.referenceNumber && (
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <TagIcon className="w-3 h-3 me-1"/> {t('reference_number', { defaultValue: 'رقم المرجع' })}: {action.referenceNumber}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3 space-x-reverse">
                                            <ExecutionActionStatusBadge status={action.status} size="sm"/>
                                            <div className="flex space-x-1 space-x-reverse">
                                                <button onClick={() => setEditingExecAction(action)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title={t('edit', { defaultValue: 'تعديل' })}><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteExecAction(action.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('delete', { defaultValue: 'حذف' })}><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xxs text-gray-400 mb-1 uppercase">{t('application_date', { defaultValue: 'تاريخ التقديم' })}</p>
                                            <p className="text-sm font-semibold">{new Date(action.applicationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xxs text-gray-400 mb-1 uppercase">{t('decision_date', { defaultValue: 'تاريخ القرار' })}</p>
                                            <p className="text-sm font-semibold">{action.decisionDate ? new Date(action.decisionDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : t('pending', { defaultValue: 'قيد الانتظار' })}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xxs text-gray-400 mb-1 uppercase">{t('effective_date', { defaultValue: 'تاريخ السريان' })}</p>
                                            <p className="text-sm font-semibold">{action.effectiveDate ? new Date(action.effectiveDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : t('not_started', { defaultValue: 'لم يبدأ بعد' })}</p>
                                        </div>
                                    </div>

                                    {(action.amountInvolved || action.targetDetails) && (
                                        <div className="flex flex-wrap gap-4 mb-3 text-xs">
                                            {action.amountInvolved && (
                                                <div className="flex items-center text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                                    <span className="font-bold me-1">{t('amount', { defaultValue: 'المبلغ' })}:</span> {action.amountInvolved.toLocaleString()} {t('kwd', { defaultValue: 'د.ك' })}
                                                </div>
                                            )}
                                            {action.targetDetails && (
                                                <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                    <span className="font-bold me-1">{t('target', { defaultValue: 'الهدف' })}:</span> {action.targetDetails}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {action.notes && (
                                        <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 italic text-xs text-gray-600">
                                            <p className="font-bold text-amber-800 mb-1 flex items-center"><DocumentTextIcon className="w-3 h-3 me-1"/> {t('execution_notes', { defaultValue: 'ملاحظات التنفيذ' })}:</p>
                                            {action.notes}
                                        </div>
                                    )}

                                    <ExecutionProgressTracker status={action.status} />
                                </div>
                            ))}
                        </div>
                    ) : !isAddingExecAction && (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <GavelIcon className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
                            <p className="text-gray-500 font-medium">لا توجد إجراءات تنفيذ مسجلة حالياً.</p>
                            <p className="text-xs text-gray-400 mt-1">ابدأ بإضافة أول إجراء تنفيذي لتتبع حالة التنفيذ.</p>
                            <Button size="sm" variant="outline" className="mt-4" onClick={() => setIsAddingExecAction(true)}>إضافة إجراء الآن</Button>
                        </div>
                    )}
                </div>

                {/* Expert Actions Section */}
                <div className="pt-4">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h4 className="font-bold text-primary-dark flex items-center">
                            <ScaleIcon className="w-5 h-5 me-2 text-indigo-600"/> تتبع إجراءات الخبراء
                        </h4>
                        <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} onClick={() => { setIsAddingExpertAction(true); setEditingExpertAction(null); }}>
                            إضافة إجراء خبير
                        </Button>
                    </div>

                    {(isAddingExpertAction || editingExpertAction) && (
                        <div className="mb-6">
                            <ExpertActionForm 
                                initialData={editingExpertAction || undefined} 
                                onSubmit={handleSaveExpertAction} 
                                onCancel={() => { setIsAddingExpertAction(false); setEditingExpertAction(null); }} 
                            />
                        </div>
                    )}

                    {caseItem.expertActions && caseItem.expertActions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {caseItem.expertActions.map(exp => (
                                <div key={exp.id} className="bg-white p-5 rounded-xl border shadow-sm hover:border-indigo-200 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-100 group-hover:bg-indigo-500 transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            <div className="bg-indigo-100 p-2.5 rounded-xl me-3">
                                                <ScaleIcon className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900">{exp.expertField}</h5>
                                                <p className="text-xxs text-gray-500 flex items-center">
                                                    <ClockIcon className="w-3 h-3 me-1"/> تاريخ الإحالة: {new Date(exp.referralDate).toLocaleDateString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <ExpertActionStatusBadge status={exp.status} size="sm"/>
                                            <div className="flex space-x-1 space-x-reverse">
                                                <button onClick={() => setEditingExpertAction(exp)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteExpertAction(exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-indigo-50/30 p-3 rounded-xl mb-4 border border-indigo-100/50">
                                        <p className="text-xs font-bold text-indigo-900 mb-1 flex items-center">
                                            <BriefcaseIcon className="w-3 h-3 me-1"/> المهمة الموكلة:
                                        </p>
                                        <p className="text-xs text-gray-700 leading-relaxed">{exp.assignedTask}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4 text-[11px]">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 uppercase text-[9px]">الخبير المنتدب</span>
                                            <span className="font-semibold text-gray-800">{exp.expertName || 'لم يحدد بعد'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 uppercase text-[9px]">إيداع التقرير</span>
                                            <span className={`font-semibold ${exp.reportSubmissionDate ? 'text-green-600' : 'text-gray-400'}`}>
                                                {exp.reportSubmissionDate ? new Date(exp.reportSubmissionDate).toLocaleDateString('ar-EG') : 'قيد الإعداد'}
                                            </span>
                                        </div>
                                    </div>

                                    {exp.notes && (
                                        <div className="text-xs text-gray-500 italic mb-4 border-t pt-2">
                                            <span className="font-bold text-gray-400 not-italic">ملاحظات:</span> {exp.notes}
                                        </div>
                                    )}

                                    <ExpertProgressTracker status={exp.status} />
                                </div>
                            ))}
                        </div>
                    ) : !isAddingExpertAction && (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400 italic">لا توجد إجراءات خبراء مسجلة لهذه القضية.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderAiTab = () => (
        <div className="animate-fade-in-right space-y-6">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                    <SparklesIcon className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="font-bold text-primary-dark">المساعد القانوني الذكي (عدالة AI)</h4>
                    <p className="text-xs text-gray-600">يمكن للمساعد تحليل بيانات القضية الحالية وتقديم ملخصات وتوقعات قانونية دقيقة.</p>
                </div>
            </div>

            <Card title="تحليل القضية بالذكاء الاصطناعي">
                {!aiCaseSummary ? (
                    <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <BrainIcon className="w-8 h-8"/>
                        </div>
                        <div className="max-w-sm mx-auto">
                            <h5 className="font-bold text-sm text-gray-800">هل ترغب في توليد ملخص ذكي لهذه القضية؟</h5>
                            <p className="text-xs text-gray-500 mt-1">سيقوم المساعد بدراسة الوقائع وتلخيصها وتوقع المسار القانوني المقترح بناءً على التشريعات الكويتية.</p>
                        </div>
                        <Button 
                            onClick={handleGenerateAiSummary} 
                            isLoading={isGeneratingSummary}
                            leftIcon={<SparklesIcon className="w-4 h-4"/>}
                        >
                            توليد التلخيص الذكي
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-xs font-bold text-primary flex items-center gap-1">
                                <HistoryIcon className="w-4 h-4"/> تم توليد التلخيص في: {new Date().toLocaleDateString('ar-EG')}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleGenerateAiSummary()} title="إعادة التوليد">
                                    <ArrowPathIcon className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(aiCaseSummary ||'')} title="نسخ">
                                    <ClipboardIcon className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-inner min-h-[200px] chatbot-md text-sm leading-relaxed overflow-y-auto max-h-[500px]">
                            <ReactMarkdown>{aiCaseSummary}</ReactMarkdown>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                            <InformationCircleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"/>
                            <p className="text-[10px] text-amber-800 italic">
                                ملاحظة: التلخيص أعلاه تم إنشاؤه بواسطة الذكاء الاصطناعي بناءً على البيانات المتوفرة في النظام، وهو مخصص للاسترشاد فقط ولا يعتبر رأياً قانونياً نهائياً.
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                    className="p-4 bg-white border rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all text-right group"
                    onClick={() => {
                         alert("سيتم نقلك إلى قسم الأبحاث القانونية مع كلمات مفتاحية مستمدة من هذه القضية.");
                    }}
                 >
                    <SearchIcon className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform"/>
                    <h5 className="font-bold text-sm">أبحاث قانونية متعلقة</h5>
                    <p className="text-[10px] text-gray-500">البحث في السوابق القضائية المشابهة لهذه القضية.</p>
                 </button>
                 <button 
                    className="p-4 bg-white border rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all text-right group"
                    onClick={() => {
                        alert("بدء صياغة مذكرة دفاع مبنية على وقائع هذه القضية.");
                    }}
                 >
                    <FileEditIcon className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform"/>
                    <h5 className="font-bold text-sm">صياغة مسودة دفاع</h5>
                    <p className="text-[10px] text-gray-500">توليد مسودة أولية لمذكرة دفاع بناءً على الثبوتيات.</p>
                 </button>
            </div>
        </div>
    );

    return (
        <Modal isOpen={!!caseItem} onClose={onClose} title={`${t('case_details', { defaultValue: 'تفاصيل القضية' })}: ${caseItem.caseNumber}`} size="xl"
            footer={
                <div className="flex justify-end space-x-2 space-x-reverse print:hidden">
                    <Button variant="outline" onClick={onClose}>{t('close', { defaultValue: 'إغلاق' })}</Button>
                    <Button variant="primary" onClick={handlePrint} leftIcon={<PrinterIcon className="w-4 h-4"/>}>{t('print_full_file', { defaultValue: 'طباعة الملف الكامل' })}</Button>
                </div>
            }
        >
                {/* Full Report for Printing (Hidden on screen, visible during print) */}
                <div className="hidden print:block space-y-10 text-black bg-white antisocial-print">
                    <div className="text-center border-b-4 border-primary pb-8 mb-10">
                        <h1 className="text-3xl font-bold mb-2">{t('integrated_case_report', { defaultValue: 'تقرير ملف قضية متكامل' })}</h1>
                        <p className="text-lg">{t('justice_system_desc', { defaultValue: 'نظام عدالة لإدارة القضايا والخدمات القانونية' })}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-b pb-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">{t('basic_case_data', { defaultValue: 'بيانات القضية الأساسية' })}</h2>
                            <div className="space-y-2 text-md">
                                <p><strong>{t('case_title', { defaultValue: 'عنوان القضية' })}:</strong> {caseItem.title}</p>
                                <p><strong>{t('case_number', { defaultValue: 'رقم القضية' })}:</strong> {caseItem.caseNumber}</p>
                                <p><strong>{t('internal_number', { defaultValue: 'الرقم الداخلي' })}:</strong> {caseItem.internalCaseNumber}</p>
                                <p><strong>{t('client', { defaultValue: 'الموكل' })}:</strong> {caseItem.clientName} ({caseItem.clientRole})</p>
                                <p><strong>{t('opponent', { defaultValue: 'الخصم' })}:</strong> {caseItem.opposingPartyName} ({caseItem.opponentRole})</p>
                                <p><strong>{t('filing_date', { defaultValue: 'تاريخ القيد' })}:</strong> {caseItem.filingDate}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">{t('status_level', { defaultValue: 'الحالة والمستوى' })}</h2>
                            <div className="space-y-2 text-md">
                                <p><strong>{t('case_type', { defaultValue: 'نوع القضية' })}:</strong> {caseItem.caseMainType}</p>
                                <p><strong>{t('court_level_short', { defaultValue: 'الدائرة/المحكمة' })}:</strong> {caseItem.courtLevel}</p>
                                <p><strong>{t('current_status', { defaultValue: 'الحالة الحالية' })}:</strong> {caseItem.status}</p>
                                <p><strong>{t('priority', { defaultValue: 'الأولوية' })}:</strong> {caseItem.priority}</p>
                            </div>
                        </div>
                    </div>

                    <div className="page-break"></div>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border-r-4 border-primary">{t('hearings_record_full', { defaultValue: 'سجل الجلسات (المحاضر والقرارات)' })}</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50 text-right">
                                    <th className="border p-2">{t('date', { defaultValue: 'التاريخ' })}</th>
                                    <th className="border p-2">{t('room', { defaultValue: 'القاعة' })}</th>
                                    <th className="border p-2">{t('facts_decisions', { defaultValue: 'الوقائع والقرارات' })}</th>
                                    <th className="border p-2">{t('next_hearing', { defaultValue: 'الجلسة القادمة' })}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {caseItem.hearings?.map(h => (
                                    <tr key={h.id}>
                                        <td className="border p-2 text-center whitespace-nowrap">{h.date}</td>
                                        <td className="border p-2">{h.courtRoomOrLocation}</td>
                                        <td className="border p-2 text-sm">{h.notes}</td>
                                        <td className="border p-2 text-center">{h.nextHearingDate || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <div className="page-break"></div>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border-r-4 border-primary">{t('execution_expert_procedures', { defaultValue: 'الإجراءات التنفيذية والخبراء' })}</h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-lg mb-3 underline">{t('execution_procedures_followed', { defaultValue: 'إجراءات التنفيذ المتبعة:' })}</h3>
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50 text-right text-sm">
                                            <th className="border p-2">{t('action_type', { defaultValue: 'نوع الإجراء' })}</th>
                                            <th className="border p-2">{t('decision_date', { defaultValue: 'تاريخ القرار' })}</th>
                                            <th className="border p-2">{t('status', { defaultValue: 'الحالة' })}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {caseItem.executionActions?.map(ea => (
                                            <tr key={ea.id}>
                                                <td className="border p-2">{ea.actionType}</td>
                                                <td className="border p-2 text-center">{ea.decisionDate || '-'}</td>
                                                <td className="border p-2 text-center">{ea.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-3 underline">{t('expert_procedures', { defaultValue: 'إجراءات الخبراء:' })}</h3>
                                {caseItem.expertActions?.map(exa => (
                                    <div key={exa.id} className="border p-4 rounded mb-4 bg-gray-50 border-gray-200">
                                        <div className="flex justify-between font-bold mb-2 border-b border-gray-300 pb-1">
                                            <span>{t('assigned_expert', { defaultValue: 'الخبير المختص' })}: {exa.expertName || t('undefined', { defaultValue: 'غير محدد' })} ({exa.expertField})</span>
                                            <span>{t('status', { defaultValue: 'الحالة' })}: {exa.status}</span>
                                        </div>
                                        <p className="text-md"><strong>{t('assigned_task', { defaultValue: 'المهمة الموكلة' })}:</strong> {exa.assignedTask}</p>
                                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm italic">
                                            <p>{t('referral_date', { defaultValue: 'تاريخ الإحالة' })}: {exa.referralDate}</p>
                                            <p>{t('report_submission_date', { defaultValue: 'تاريخ إيداع التقرير' })}: {exa.reportSubmissionDate || t('in_progress', { defaultValue: 'قيد الإجراء' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer className="mt-20 flex justify-between border-t-2 border-black pt-4">
                        <p className="text-xs">{t('automated_report_footer', { defaultValue: 'تم استخراج هذا الملف آلياً من نظام عدالة لإدارة مكاتب المحاماة' })}</p>
                        <p className="text-xs">{t('print_date', { defaultValue: 'تاريخ الطباعة' })}: {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    </footer>
                </div>

                <div className="printable-resource-wrapper text-sm print:hidden">
                <div className="report-print-header">
                    <h1 className="text-xl font-bold">{caseItem.title}</h1>
                    <p className="text-gray-500">{t('case_number', { defaultValue: 'رقم القضية' })}: {caseItem.caseNumber} | {t('internal_code', { defaultValue: 'الكود الداخلي' })}: {caseItem.internalCaseNumber}</p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 mb-4 print:hidden overflow-x-auto">
                    <button onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <BriefcaseIcon className="w-4 h-4 inline-block me-2"/>{t('case_data', { defaultValue: 'بيانات القضية' })}
                    </button>
                    <button onClick={() => setActiveTab('hearings')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'hearings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <GavelIcon className="w-4 h-4 inline-block me-2"/>{t('hearings_record', { defaultValue: 'سجل الجلسات' })}
                    </button>
                    <button onClick={() => setActiveTab('archive')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'archive' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <BrainIcon className="w-4 h-4 inline-block me-2"/>{t('smart_archive', { defaultValue: 'الأرشيف الذكي' })}
                    </button>
                    <button onClick={() => setActiveTab('execution')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'execution' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <ScaleIcon className="w-4 h-4 inline-block me-2"/>{t('execution_expert_followup', { defaultValue: 'التنفيذ والخبراء' })}
                    </button>
                    <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center ${activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <SparklesIcon className="w-4 h-4 inline-block me-2"/>{t('legal_assistant', { defaultValue: 'المساعد القانوني' })}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'details' && renderDetailsTab()}
                    {activeTab === 'hearings' && renderHearingsTab()}
                    {activeTab === 'archive' && renderSmartArchiveTab()}
                    {activeTab === 'execution' && renderExecutionTab()}
                    {activeTab === 'ai' && renderAiTab()}
                </div>

                {/* Print Only Footer */}
                <div className="text-xs text-gray-400 mt-4 text-center hidden print:block">
                    {t('report_extracted_date', { defaultValue: 'تم استخراج هذا التقرير بتاريخ' })} {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')} {t('by_justice_system', { defaultValue: 'بواسطة نظام عدالة.' })}
                </div>
            </div>
        </Modal>
    );
};

// --- Case Form Component (Add/Edit) ---
const CaseForm: React.FC<{
    initialData?: Case | null;
    onSubmit: (caseData: Case) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<Case>>(
        initialData || {
            title: '',
            caseNumber: '',
            internalCaseNumber: '',
            clientName: '',
            clientRole: 'مدعي',
            opposingPartyName: '',
            opponentRole: 'مدعى عليه',
            caseMainType: CaseMainType.COMMERCIAL,
            status: CaseStatus.OPEN,
            priority: CasePriority.NORMAL,
            riskLevel: RiskLevel.LOW,
            courtLevel: CourtLevel.FIRST_INSTANCE,
            filingDate: new Date().toISOString().split('T')[0],
            createdDate: new Date().toISOString(),
        }
    );

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.title || !formData.caseNumber || !formData.clientName) {
            alert(t('fill_required_fields_error', { defaultValue: 'يرجى تعبئة الحقول الإلزامية: عنوان القضية، رقم القضية، واسم الموكل.' }));
            return;
        }
        onSubmit(formData as Case);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            <Card title={t('basic_data', { defaultValue: 'البيانات الأساسية' })} titleClassName="text-sm">
                <Input name="title" label={t('case_title_req', { defaultValue: 'عنوان القضية (*)' })} value={formData.title || ''} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="caseNumber" label={t('case_number_automated_req', { defaultValue: 'رقم القضية (الآلي) (*)' })} value={formData.caseNumber || ''} onChange={handleChange} required />
                    <Input name="internalCaseNumber" label={t('internal_file_number', { defaultValue: 'رقم الملف الداخلي' })} value={formData.internalCaseNumber || ''} onChange={handleChange} />
                </div>
            </Card>

            <Card title={t('parties', { defaultValue: 'الأطراف' })} titleClassName="text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="clientName" label={t('client_name_req', { defaultValue: 'اسم الموكل (*)' })} value={formData.clientName || ''} onChange={handleChange} required />
                    <Select name="clientRole" label={t('client_role', { defaultValue: 'صفة الموكل' })} value={formData.clientRole || ''} options={partyRoleOptions} onChange={handleChange} />
                    <Input name="opposingPartyName" label={t('opponent_name', { defaultValue: 'اسم الخصم' })} value={formData.opposingPartyName || ''} onChange={handleChange} />
                    <Select name="opponentRole" label={t('opponent_role', { defaultValue: 'صفة الخصم' })} value={formData.opponentRole || ''} options={partyRoleOptions} onChange={handleChange} />
                </div>
            </Card>

            <Card title={t('classification_details', { defaultValue: 'التصنيف والتفاصيل' })} titleClassName="text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select name="caseMainType" label={t('main_case_type', { defaultValue: 'نوع القضية الرئيسي' })} value={formData.caseMainType} options={caseMainTypeOptions} onChange={handleChange} />
                    <Select name="status" label={t('case_status', { defaultValue: 'حالة القضية' })} value={formData.status} options={caseStatusOptions} onChange={handleChange} />
                    <Select name="priority" label={t('priority', { defaultValue: 'الأولوية' })} value={formData.priority} options={casePriorityOptions} onChange={handleChange} />
                    <Select name="riskLevel" label={t('risk_level', { defaultValue: 'مستوى المخاطر' })} value={formData.riskLevel} options={riskLevelOptions} onChange={handleChange} />
                    <Select name="courtLevel" label={t('litigation_degree', { defaultValue: 'درجة التقاضي' })} value={formData.courtLevel} options={courtLevelOptions} onChange={handleChange} />
                    <Input name="filingDate" label={t('filing_date', { defaultValue: 'تاريخ رفع الدعوى' })} type="date" value={formData.filingDate || ''} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Select name="courtName" label={t('court', { defaultValue: 'المحكمة' })} value={formData.courtName || ''} options={[{value:'', label: t('choose_court', { defaultValue: 'اختر المحكمة' })}, ...KUWAIT_COURTS_LIST]} onChange={handleChange} />
                    <Input name="assignedLawyer" label={t('assigned_lawyer', { defaultValue: 'المحامي المسؤول' })} value={formData.assignedLawyer || ''} onChange={handleChange} />
                </div>
                <TextArea name="description" label={t('case_description', { defaultValue: 'وصف القضية' })} value={formData.description || ''} onChange={handleChange} rows={3} />
            </Card>

            <div className="flex justify-end space-x-3 space-x-reverse pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                <Button type="submit">{initialData?.id ? t('save_changes', { defaultValue: 'حفظ التعديلات' }) : t('add_case', { defaultValue: 'إضافة القضية' })}</Button>
            </div>
        </form>
    );
};


const CaseListPage: React.FC = () => {
    const { t } = useTranslation();
    const [cases, setCases] = useState<Case[]>(initialCases);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState(initialFilters);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [viewingCase, setViewingCase] = useState<Case | null>(null);

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
        if (window.confirm(t('confirm_delete_case', { defaultValue: 'هل أنت متأكد من حذف هذه القضية؟' }))) {
            setCases(prev => prev.filter(c => c.id !== caseId));
        }
    }, [t]);

    const handleFormSubmit = (caseData: Case) => {
        if (selectedCase && selectedCase.id) {
            setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, ...caseData, lastModifiedDate: new Date().toISOString() } : c));
        } else {
            const newCase: Case = { ...caseData, id: `case-${Date.now()}`, createdDate: new Date().toISOString() };
            setCases(prev => [newCase, ...prev]);
        }
        setIsFormModalOpen(false);
        setSelectedCase(null);
    };

    const handleUpdateCase = (updatedCase: Case) => {
        setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
        if (viewingCase?.id === updatedCase.id) {
            setViewingCase(updatedCase);
        }
    };
    
    const clientOptions = useMemo(() => Array.from(new Set(cases.map(c => c.clientName))).map(name => ({value: name, label: name})), [cases]);
    const opponentOptions = useMemo(() => Array.from(new Set(cases.map(c => c.opposingPartyName))).filter(Boolean).map(name => ({value: name as string, label: name as string})), [cases]);
    const consultantOptions = useMemo(() => Array.from(new Set(cases.map(c => c.assignedLawyer))).map(name => ({value: name, label: name})), [cases]);
    

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-dark flex items-center">
                    <BriefcaseIcon className="w-8 h-8 me-3"/> {t('cases_management', { defaultValue: 'إدارة القضايا' })}
                </h1>
                <Button onClick={handleAddCase} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>{t('add_new_case', { defaultValue: 'إضافة قضية جديدة' })}</Button>
            </div>
            
            <Card>
                 <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-primary">{t('search_filter_options', { defaultValue: 'خيارات البحث والتصفية' })}</h2>
                        <div className="flex space-x-2 space-x-reverse">
                             <Button size="sm" variant="primary" leftIcon={<PrinterIcon className="w-4 h-4" />}>{t('print_list', { defaultValue: 'طباعة القائمة' })}</Button>
                             <Button size="sm" variant="primary" leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}>{t('export_excel', { defaultValue: 'تصدير إكسيل' })}</Button>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <Input
                            placeholder={t('comprehensive_search_placeholder', { defaultValue: 'بحث شامل (بالعنوان، الوصف، اسم الموكل أو الخصم، رقم القضية...)' })}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            containerClassName="mb-0"
                            className="ps-10"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-sm">
                        <Select label={t('court', { defaultValue: 'المحكمة' })} name="court" value={filters.court} onChange={handleFilterChange} options={[{value:'', label: t('all', { defaultValue: 'الكل' })},...KUWAIT_COURTS_LIST]} containerClassName="mb-0"/>
                        <Select label={t('hearing_type', { defaultValue: 'نوع الجلسة' })} name="hearingType" value={filters.hearingType} onChange={handleFilterChange} options={[{value:'', label: t('all', { defaultValue: 'الكل' })},...hearingTypeOptions]} containerClassName="mb-0"/>
                        <Select label={t('status', { defaultValue: 'الحالة' })} name="status" value={filters.status} onChange={handleFilterChange} options={caseFilterStatusOptions} containerClassName="mb-0"/>
                        <Select label={t('group', { defaultValue: 'المجموعة' })} name="group" value={filters.group} onChange={handleFilterChange} options={[{value:'', label: t('all', { defaultValue: 'الكل' })},...caseGroupOptions]} containerClassName="mb-0"/>
                        <Input label={t('from_date', { defaultValue: 'من تاريخ' })} name="fromDate" type="date" value={filters.fromDate} onChange={handleFilterChange} containerClassName="mb-0"/>
                        <Input label={t('to_date', { defaultValue: 'الى تاريخ' })} name="toDate" type="date" value={filters.toDate} onChange={handleFilterChange} containerClassName="mb-0"/>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
                         <Button onClick={clearFilters} variant="outline" size="sm">{t('clear', { defaultValue: 'تفريغ' })}</Button>
                    </div>
                </div>
            </Card>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    {[
                        t('case_code', { defaultValue: 'القضية/الكود' }), 
                        t('client_opponent', { defaultValue: 'الموكل/صفته الخصم/صفته' }), 
                        t('court_level', { defaultValue: 'المحكمة/الدرجة' }), 
                        t('automated_case_no', { defaultValue: 'الرقم الالي/رقم القضية' }), 
                        t('status_hearing_type', { defaultValue: 'الحالة/نوع الجلسة' }), 
                        t('last_hearing_decision', { defaultValue: 'قرار اخر جلسة/تاريخ اخر جلسة' }), 
                        t('group', { defaultValue: 'المجموعة' }), 
                        t('consultant', { defaultValue: 'المستشار' }), 
                        t('actions', { defaultValue: 'عمليات' })
                    ].map(h => (
                       <th key={h} className="px-3 py-2 text-right font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCases.length > 0 ? filteredCases.map(c => {
                    const lastHearing = c.hearings && c.hearings.length > 0 ? c.hearings[c.hearings.length-1] : null;
                    return (
                        <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 align-top">
                                <div className="font-semibold text-primary-dark">{c.title}</div>
                                <div className="text-xs text-gray-500">{c.internalCaseNumber}</div>
                            </td>
                            <td className="px-3 py-2 align-top"><div>{c.clientName} / {c.clientRole}</div><div className="text-xs text-gray-500">{c.opposingPartyName} / {c.opponentRole}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.courtName}</div><div className="text-xs text-gray-500">{c.courtLevel}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.internalCaseNumber}</div><div className="text-xs text-gray-500">{c.caseNumber}</div></td>
                            <td className="px-3 py-2 align-top"><div><CaseStatusBadge status={c.status} /></div><div className="text-xs text-gray-500">{lastHearing?.type}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.judgmentSummary || lastHearing?.notes}</div><div className="text-xs text-gray-500">{lastHearing?.date ? new Date(lastHearing.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : ''}</div></td>
                            <td className="px-3 py-2 align-top">{c.group}</td>
                            <td className="px-3 py-2 align-top">{c.assignedLawyer}</td>
                            <td className="px-3 py-2 align-top whitespace-nowrap">
                                <Button variant="ghost" size="sm" onClick={() => handleViewCase(c)} title={t('view_details', { defaultValue: 'عرض التفاصيل والملف' })}><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditCase(c)} title={t('edit', { defaultValue: 'تعديل' })}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCase(c.id)} title={t('delete', { defaultValue: 'حذف' })} className="text-danger"><TrashIcon className="w-4 h-4 text-danger"/></Button>
                            </td>
                        </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-500">
                        <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        {t('no_cases_found', { defaultValue: 'لا توجد قضايا تطابق معايير البحث.' })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isFormModalOpen && <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedCase ? t('edit_case', { defaultValue: 'تعديل قضية' }) : t('add_case', { defaultValue: 'إضافة قضية' })} size="xl">
                <CaseForm 
                    initialData={selectedCase} 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsFormModalOpen(false)} 
                />
            </Modal>}

            {viewingCase && (
                <CaseDetailsModal 
                    caseItem={viewingCase} 
                    onClose={() => setViewingCase(null)} 
                    onUpdateCase={handleUpdateCase}
                />
            )}
        </div>
    );
};

export default CaseListPage;
