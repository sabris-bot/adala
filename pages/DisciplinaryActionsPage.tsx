
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    ExclamationTriangleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, ChartBarIcon, MagnifyingGlassIcon, 
    CheckCircleIcon, ClockIcon, LinkIcon, PrinterIcon, ShieldCheckIcon,
    ScaleIcon, DocumentTextIcon, GavelIcon, UsersIcon, OFFICE_NAME
} from '../constants';
import { Employee, DisciplinaryAction, ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus, RequestAttachment } from '../types';
import { violationTypeKuwaitOptions, disciplinaryPenaltyKuwaitOptions, disciplinaryActionStatusOptions } from '../constants';
import { DisciplinaryActionStatusBadge } from '../components/ui/Badge';
import { useLocation } from 'react-router-dom';
import { useJurisdiction } from '../components/JurisdictionContext';

const mockEmployees: Employee[] = [
  { 
    id: 'emp-001', 
    employeeId: 'EMP001',
    fullNameAr: 'أحمد محمود مبارك', 
    basicSalary: 850.000,
    jobTitle: 'محاسب أول',
    department: 'المالية',
    joiningDate: '2020-01-15',
    civilId: '290010101234',
    nationality: 'كويتي',
    status: 'Active',
    contractType: 'محدد المدة' as any
  },
  { 
    id: 'emp-002', 
    employeeId: 'EMP002',
    fullNameAr: 'فاطمة علي حسين', 
    basicSalary: 1200.000,
    jobTitle: 'مهندس تنفيذ',
    department: 'المشاريع',
    joiningDate: '2018-05-20',
    civilId: '288050505678',
    nationality: 'كويتية',
    status: 'Active',
    contractType: 'غير محدد المدة' as any
  },
  { 
    id: 'emp-003', 
    employeeId: 'EMP003',
    fullNameAr: 'علي محمد جاسم', 
    basicSalary: 600.000,
    jobTitle: 'سائق فني',
    department: 'الخدمات المساندة',
    joiningDate: '2022-11-01',
    civilId: '295111198765',
    nationality: 'كويتي',
    status: 'Active',
    contractType: 'محدد المدة' as any
  },
];

export const initialDisciplinaryActions: DisciplinaryAction[] = [ 
  {
    id: 'da1',
    employeeId: 'emp-001',
    employeeName: 'أحمد محمود مبارك',
    violationDate: '2024-07-10',
    reportDate: '2024-07-11',
    reportedBy: 'رئيس القسم المباشر',
    violationType: ViolationTypeKuwait.ATTENDANCE_LATENESS,
    violationDetails: 'تأخير متكرر عن مواعيد الدوام الرسمي لأكثر من 5 مرات خلال الشهر الجاري بدون عذر مقبول.',
    investigation: {
      investigator: 'عبدالعزيز الصالح',
      investigationStartDate: '2024-07-12',
      investigationEndDate: '2024-07-14',
      investigationSummary: 'تمت مواجهة الموظف بسجل البصمة، وأقر بالتأخير متذرعاً بالازدحام المروري، وهو عذر غير قانوني للتكرار برغم التنبيه الشفهي المسبق.',
      witnesses: ['مراقب الدوام'],
      evidence: ['كشف بصمة شهر يوليو 2024']
    },
    legalOpinionNotes: 'وفقًا للمادة 25 واللائحة الداخلية، وبما أن هذا هو التنبيه الرسمي الثاني، يستوجب إنذارًا كتابيًا مع خصم يوم واحد.',
    actionTaken: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
    penaltyDetails: 'إنذار كتابي أول مع التنبيه بالفصل في حال التكرار المتصل وفق اللائحة.',
    actionEffectiveDate: '2024-07-15',
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-07-11',
    updatedAt: '2024-07-15',
  },
  {
    id: 'da2',
    employeeId: 'emp-003',
    employeeName: 'علي محمد جاسم',
    violationDate: '2024-08-05',
    reportDate: '2024-08-05',
    reportedBy: 'مدير العمليات',
    violationType: ViolationTypeKuwait.PROPERTY_DAMAGE,
    violationDetails: 'التسبب في تلف وحدة النقل رقم 12 نتيجة الإهمال في إجراءات الفحص الدوري قبل الحركة.',
    investigation: {
        investigator: 'اللجنة الفنية',
        investigationSummary: 'تبين أن العطل ناتج عن نقص الزيت وهو ما يقع ضمن مسؤولية السائق المباشرة للفحص اليومي.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE,
    penaltyDetails: 'خصم أجر 3 أيام من راتب شهر أغسطس.',
    status: DisciplinaryActionStatus.PENDING_INVESTIGATION,
    createdAt: '2024-08-05',
  }
];

const StatsCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className={`border-l-4 ${color} shadow-md transition-transform hover:scale-[1.02]`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-gray-50`}>
                {icon}
            </div>
        </div>
    </Card>
);

interface DisciplinaryActionFormProps {
  initialData?: Partial<DisciplinaryAction> | null;
  onSubmit: (data: DisciplinaryAction) => void;
  onCancel: () => void;
  employees: Employee[];
  preFilledInvestigationId?: string;
  preFilledViolationDetails?: string;
}

const DisciplinaryActionForm: React.FC<DisciplinaryActionFormProps> = ({ initialData, onSubmit, onCancel, employees, preFilledInvestigationId, preFilledViolationDetails }) => {
  const { t } = useTranslation();
  const { selectedJurisdiction } = useJurisdiction();
  const [formData, setFormData] = useState<Partial<DisciplinaryAction>>(
    initialData || {
      employeeId: '',
      violationDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      reportedBy: '',
      violationType: ViolationTypeKuwait.ATTENDANCE_LATENESS,
      status: DisciplinaryActionStatus.PENDING_INVESTIGATION,
      violationDetails: preFilledViolationDetails || '',
      investigation: { investigator: '', witnesses: [], evidence: [], investigationSummary: '' },
      notes: preFilledInvestigationId ? t('linked_to_investigation_num', { defaultValue: 'مرتبط بملف التحقيق رقم' }) + `: ${preFilledInvestigationId}` : '',
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const selectedEmployee = useMemo(() => employees.find(e => e.id === formData.employeeId), [formData.employeeId, employees]);

  const deductionLimit = useMemo(() => {
    if (!selectedEmployee) return 0;
    // Base maxDeductionDaysPerMonth limit (Basic Salary / 30 * limit)
    const limitDays = selectedJurisdiction.laborLaw.disciplinaryRules?.maxDeductionDaysPerMonth || 5;
    return (selectedEmployee.basicSalary / 30) * limitDays;
  }, [selectedEmployee, selectedJurisdiction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvestigationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      investigation: { ...(prev.investigation || {investigator: '', investigationSummary: ''}), [name]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.violationDate || !formData.violationDetails) {
      alert(t('fill_required_fields', { defaultValue: 'يرجى ملء الحقول الإلزامية.' }));
      return;
    }
    onSubmit({ 
        ...formData, 
        employeeName: selectedEmployee?.fullNameAr || t('unknown', { defaultValue: 'غير معروف' }),
        updatedAt: new Date().toISOString().split('T')[0]
    } as DisciplinaryAction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-4 custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title={t('violation_incident_data', { defaultValue: 'بيانات المخالفة والواقعة' })} icon={<InformationCircleIcon className="w-5 h-5 text-primary"/>} titleClassName="text-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label={t('employee_attributed_violation', { defaultValue: 'الموظف المنسوب إليه المخالفة' })} name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
              <Input label={t('incident_date', { defaultValue: 'تاريخ وقوع الواقعة' })} name="violationDate" type="date" value={formData.violationDate} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select label={t('violation_type_legal', { defaultValue: 'نوع المخالفة (التصنيف القانوني)' })} name="violationType" value={formData.violationType} options={violationTypeKuwaitOptions} onChange={handleChange} required />
              <Input label={t('reported_by_label', { defaultValue: 'الشخص المُبلِّغ / جهة الإبلاغ' })} name="reportedBy" value={formData.reportedBy || ''} onChange={handleChange} required placeholder={t('reported_by_placeholder', { defaultValue: 'مثال: مدير العمليات' })}/>
            </div>
            <TextArea label={t('factual_description_violation', { defaultValue: 'الوصف الوقائعي للمخالفة' })} name="violationDetails" value={formData.violationDetails || ''} onChange={handleChange} required rows={5} placeholder={t('violation_details_placeholder', { defaultValue: 'سرد وقائع المخالفة بالتفصيل مع ذكر الوقت والمكان...' })} className="mt-4" />
          </Card>

          <Card title={t('administrative_action_decision', { defaultValue: 'الإجراء الإداري والقرار' })} icon={<GavelIcon className="w-5 h-5 text-secondary"/>} titleClassName="text-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label={t('approved_disciplinary_penalty', { defaultValue: 'الجزاء التأديبي المعتمد' })} name="actionTaken" value={formData.actionTaken || ''} options={[{value: '', label: t('pending_decision', { defaultValue: 'بانتظار القرار' })}, ...disciplinaryPenaltyKuwaitOptions]} onChange={handleChange} />
              <Input label={t('penalty_effective_date', { defaultValue: 'تاريخ سريان الجزاء' })} name="actionEffectiveDate" type="date" value={formData.actionEffectiveDate || ''} onChange={handleChange} />
            </div>
            <TextArea label={t('decision_wording_reasons', { defaultValue: 'منطوق القرار ومسبباته' })} name="penaltyDetails" value={formData.penaltyDetails || ''} onChange={handleChange} rows={3} placeholder={t('legal_reasons_placeholder', { defaultValue: 'الأسباب القانونية التي استند إليها القرار...' })} className="mt-4" />
            
            {formData.actionTaken === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE && selectedEmployee && (
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-orange-800">{t('legal_deduction_calculator', { defaultValue: 'حاسبة الخصم القانوني' })} ({selectedJurisdiction.laborLaw.references?.disciplinaryArticle || t('article_35', { defaultValue: 'المادة 35' })})</span>
                        <span className="text-[10px] bg-orange-200 px-2 py-0.5 rounded text-orange-900 font-bold">{t('max_limit', { defaultValue: 'الحد الأقصى' })}: {deductionLimit.toFixed(3)} {selectedJurisdiction.currencySymbol}</span>
                    </div>
                    <div className="text-xs text-orange-700 bg-white/50 p-2 rounded">
                        <p>{t('employee_salary', { defaultValue: 'راتب الموظف' })}: <strong>{selectedEmployee.basicSalary.toFixed(3)} {selectedJurisdiction.currencySymbol}</strong></p>
                        <p>{t('single_day_value', { defaultValue: 'قيمة اليوم الواحد' })}: <strong>{(selectedEmployee.basicSalary / 30).toFixed(3)} {selectedJurisdiction.currencySymbol}</strong></p>
                    </div>
                </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t('legal_investigation_stage', { defaultValue: 'مرحلة التحقيق القانوني' })} icon={<ScaleIcon className="w-5 h-5 text-accent-DEFAULT"/>} titleClassName="text-md" className="bg-slate-50 border-slate-200">
            <Input label={t('investigation_file_num', { defaultValue: 'رقم ملف التحقيق' })} name="linkedInvestigationId" placeholder="INV-2024-XXX" value={(formData as any).linkedInvestigationId || ''} onChange={handleChange} />
            <Input label={t('responsible_investigator', { defaultValue: 'المحقق المسؤول' })} name="investigator" value={formData.investigation?.investigator || ''} onChange={handleInvestigationChange} className="mt-4" />
            <TextArea label={t('investigation_results_summary', { defaultValue: 'مخلص نتائج التحقيق' })} name="investigationSummary" value={formData.investigation?.investigationSummary || ''} onChange={handleInvestigationChange} rows={6} placeholder={t('investigation_summary_placeholder', { defaultValue: 'ما توصل إليه التحقيق وسماع أقوال الموظف...' })} className="mt-4" />
          </Card>

          <Card title={t('status_documents', { defaultValue: 'الحالة والمستندات' })} titleClassName="text-md">
            <Select label={t('violation_file_status', { defaultValue: 'حالة ملف المخالفة' })} name="status" value={formData.status} options={disciplinaryActionStatusOptions} onChange={handleChange} required />
            <TextArea label={t('additional_notes_recommendations', { defaultValue: 'ملاحظات إضافية / توصيات' })} name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-4" />
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t sticky bottom-0 bg-white py-2 z-10">
        <Button type="button" variant="ghost" onClick={onCancel}>{t('cancel', { defaultValue: 'إلغاء' })}</Button>
        <Button type="submit" variant="primary" className="px-10">
            {formData.id ? t('save_legal_changes', { defaultValue: 'حفظ التعديلات القانونية' }) : t('issue_disciplinary_decision', { defaultValue: 'إصدار قرار تأديبي' })}
        </Button>
      </div>
    </form>
  );
}

const PrintableDisciplinaryActionModal: React.FC<{ action: DisciplinaryAction | null; onClose: () => void }> = ({ action, onClose }) => {
    const { t } = useTranslation();
    const { selectedJurisdiction } = useJurisdiction();
    if (!action) return null;
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
    const currentEmployee = mockEmployees.find(e => e.id === action.employeeId);

    return (
        <Modal isOpen={!!action} onClose={onClose} title={t('disciplinary_decision_notice_print', { defaultValue: 'إخطار قرار تأديبي (نسخة الطباعة)' })} size="lg">
            <div id="printable-disciplinary-content" className="p-10 bg-white text-slate-900 print:p-0" dir="rtl">
                <style>{`
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        #printable-disciplinary-content { p: 0 !important; font-size: 11pt !important; line-height: 1.6; }
                        .no-print { display: none !important; }
                    }
                    .legal-header { border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 2rem; }
                    .legal-title { text-align: center; font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; color: #1e293b; text-decoration: underline; text-underline-offset: 8px; }
                    .legal-section-title { font-weight: 700; background: #f1f5f9; padding: 4px 8px; border-right: 4px solid #0f172a; margin: 1.5rem 0 0.5rem 0; }
                    .signature-table { width: 100%; margin-top: 4rem; border-collapse: collapse; }
                    .signature-table td { width: 50%; padding: 1.5rem; text-align: center; border: 1px solid #e2e8f0; }
                `}</style>

                <div className="legal-header flex justify-between items-start">
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{OFFICE_NAME}</h2>
                        <p className="text-sm">{t('hr_legal_affairs', { defaultValue: 'قسم الموارد البشرية والشؤون القانونية' })}</p>
                        <p className="text-[10px] text-slate-500">{t('justice_system_decision_num', { defaultValue: 'منظومة عدالة - قرار إداري رقم' })} {action.id.split('-').pop()}</p>
                    </div>
                    <div className="text-left">
                        <p className="font-bold">{t('date', { defaultValue: 'التاريخ' })}: {new Date().toLocaleDateString('ar-EG')}</p>
                        <p className="text-xs">{t('top_secret_private', { defaultValue: 'سري للغاية وخاص' })}</p>
                    </div>
                </div>

                <h1 className="legal-title">{t('administrative_decision_notice_penalty', { defaultValue: 'إخطار بقرار إداري (جزاء تأديبي)' })}</h1>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 grid grid-cols-2 gap-4 text-sm font-bold">
                    <p>{t('mr_ms', { defaultValue: 'السيد / ة' })}: {action.employeeName}</p>
                    <p>{t('employee_id', { defaultValue: 'الرقم الوظيفي' })}: {currentEmployee?.employeeId || '-'}</p>
                    <p>{t('job_title_label', { defaultValue: 'المسمى الوظيفي' })}: {currentEmployee?.jobTitle || '-'}</p>
                    <p>{t('department_label', { defaultValue: 'الإدارة' })}: {currentEmployee?.department || '-'}</p>
                </div>

                <div className="space-y-4 text-justify leading-relaxed">
                    <p><strong>{t('subject_disciplinary_decision', { defaultValue: 'الموضوع: قرار توقيع جزاء تأديبي لمخالفة لوائح العمل' })}</strong></p>
                    
                    <p>
                        {t('referring_to_violation', { defaultValue: 'إشارة إلى ما تم رصده من مخالفة متعلقة بـ' })} (<strong>{action.violationType}</strong>) {t('attributed_to_you_on', { defaultValue: 'والمنسوبة إليكم بتاريخ' })} {formatDate(action.violationDate)}، 
                        {t('after_investigation_procedures', { defaultValue: 'وبعد استكمال إجراءات التحقيق الإداري اللازمة رقم' })} ({(action as any).linkedInvestigationId || t('internal_investigation', { defaultValue: 'تحقيق داخلي' })}) {t('granting_defense_right', { defaultValue: 'والذي تم فيه سماح أقوالكم وضمان حق الدفاع القانوني، فقد ثبت للإدارة صحة ما نُسب إليكم من مخالفة مهنية.' })}
                    </p>

                    <div className="legal-section-title">{t('first_penalty_prescribed', { defaultValue: 'أولاً: الجزاء المقرر' })}</div>
                    <div className="p-6 border-2 border-slate-900 bg-slate-50 text-center font-black text-2xl my-6 rounded">
                        {disciplinaryPenaltyKuwaitOptions.find(p => p.value === action.actionTaken)?.label || action.actionTaken}
                    </div>

                    <div className="legal-section-title">{t('second_decision_grounds', { defaultValue: 'ثانياً: موجبات وحيثيات القرار' })}</div>
                    <p className="text-sm p-4 border border-dashed border-slate-300 rounded min-h-[80px]">
                        {action.penaltyDetails || t('management_authority_placeholder', { defaultValue: 'وفقاً لصلاحيات الإدارة وبناءً على لائحة تنظيم العمل والتحقيقات المجراة و' }) + (selectedJurisdiction.laborLaw.references?.lawNameAr || t('labor_law', { defaultValue: 'قانون العمل' })) + "."}
                    </p>

                    <div className="legal-section-title">{t('third_effectiveness_appeal', { defaultValue: 'ثالثاً: سريان القرار والتظلم' })}</div>
                    <p className="text-sm">
                        {t('decision_effective_from', { defaultValue: 'يعتبر هذا القرار نافذاً من تاريخ' })} {formatDate(action.actionEffectiveDate || action.updatedAt)}. 
                        {t('appeal_rights_notice', { defaultValue: 'ويحق لكم التظلم من هذا القرار خلال' })} {selectedJurisdiction.laborLaw.disciplinaryRules?.appealPeriodDays || 15} {t('working_days_from_receipt', { defaultValue: 'يوماً عمل من تاريخ استلامه بالتوقيع أدناه، وذلك أمام الإدارة العليا للشركة.' })} 
                        {t('commitment_notice', { defaultValue: 'ونود التأكيد على ضرورة الالتزام التام بالقواعد المنظمة للعمل تلافياً لتطبيق جزاءات أشد في حال تكرار المخالفة.' })}
                    </p>
                </div>

                <table className="signature-table">
                    <tbody>
                        <tr>
                            <td>
                                <p className="font-bold mb-12">{t('receiving_employee_signature', { defaultValue: 'توقيع الموظف المستلم' })}</p>
                                <div className="text-right text-[10px] space-y-1">
                                    <p>{t('date', { defaultValue: 'التاريخ' })}: .....................</p>
                                    <p>{t('time', { defaultValue: 'الوقت' })}: .....................</p>
                                </div>
                            </td>
                            <td>
                                <p className="font-bold mb-12">{t('hr_approval', { defaultValue: 'اعتماد إدارة الموارد البشرية' })}</p>
                                <div className="w-24 h-24 border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase rotate-12">
                                    {t('official_company_stamp', { defaultValue: 'ختم الشركة الرسمي' })}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-10 pt-4 border-t border-slate-100 text-[9px] text-slate-400 flex justify-between">
                    <span>{t('employee_file_copy_distribution', { defaultValue: 'نسخة لملف الموظف | نسخة للإدارة المالية | نسخة للموظف' })}</span>
                    <span className="font-mono">ADALA LEGAL SYSTEM - VER 4.0</span>
                </div>
            </div>

            <div className="flex justify-end p-4 border-t gap-3 no-print bg-slate-50">
                <Button variant="ghost" onClick={onClose}>{t('close', { defaultValue: 'إغلاق' })}</Button>
                <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>{t('start_printing', { defaultValue: 'بدء الطباعة' })}</Button>
            </div>
        </Modal>
    );
};

const DisciplinaryActionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedJurisdiction } = useJurisdiction();
  const [actions, setActions] = useState<DisciplinaryAction[]>(initialDisciplinaryActions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DisciplinaryActionStatus | ''>('');
  const [filterViolationType, setFilterViolationType] = useState<ViolationTypeKuwait | ''>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Partial<DisciplinaryAction> | null>(null);
  const [viewingAction, setViewingAction] = useState<DisciplinaryAction | null>(null);
  const [printingAction, setPrintingAction] = useState<DisciplinaryAction | null>(null);

  const location = useLocation();
  useEffect(() => {
    if (location.state && (location.state as any).linkedInvestigationId) {
        const { linkedInvestigationId, violationDetails } = location.state as any;
        setEditingAction({
            violationDetails: violationDetails || '',
            notes: t('linked_to_investigation_num', { defaultValue: 'مرتبط بملف التحقيق رقم' }) + `: ${linkedInvestigationId}`,
        });
        setIsFormModalOpen(true);
        window.history.replaceState({}, document.title);
    }
  }, [location, t]);

  const stats = useMemo(() => {
    return {
        total: actions.length,
        pending: actions.filter(a => a.status === DisciplinaryActionStatus.PENDING_INVESTIGATION || a.status === DisciplinaryActionStatus.INVESTIGATION_IN_PROGRESS).length,
        actionTaken: actions.filter(a => a.status === DisciplinaryActionStatus.ACTION_TAKEN).length,
        appealed: actions.filter(a => a.status === DisciplinaryActionStatus.APPEALED).length,
    }
  }, [actions]);

  const filteredActions = useMemo(() => {
    return actions.filter(action =>
      (action.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (action.violationDetails && action.violationDetails.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? action.status === filterStatus : true) &&
      (filterViolationType ? action.violationType === filterViolationType : true)
    ).sort((a,b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }, [actions, searchTerm, filterStatus, filterViolationType]);
  
  const handleFormSubmit = (data: DisciplinaryAction) => {
    if (editingAction && editingAction.id) {
      setActions(prev => prev.map(a => a.id === editingAction.id ? { ...data, id: a.id, createdAt: a.createdAt } : a));
    } else {
      setActions(prev => [{ ...data, id: `da-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingAction(null);
  };
  
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 me-3" />
                {t('employee_investigation_penalties', { defaultValue: 'تحقيق وجزاءات الموظفين' })} - {selectedJurisdiction.name}
            </h1>
            <p className="text-slate-500 mt-1">{t('accountability_management_subtitle', { defaultValue: 'إدارة المساءلة الإدارية وفقاً للائحة تنظيم العمل و' })} {selectedJurisdiction.laborLaw.references?.lawNameAr || t('labor_law', { defaultValue: 'قانون العمل' })}</p>
        </div>
        <Button onClick={() => { setEditingAction(null); setIsFormModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            {t('issue_new_disciplinary_decision', { defaultValue: 'إصدار قرار تأديبي جديد' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title={t('total_records', { defaultValue: 'إجمالي السجلات' })} value={stats.total.toString()} icon={<DocumentTextIcon className="w-6 h-6 text-slate-600"/>} color="border-slate-800" />
        <StatsCard title={t('under_investigation', { defaultValue: 'قيد التحقيق' })} value={stats.pending.toString()} icon={<ClockIcon className="w-6 h-6 text-orange-500"/>} color="border-orange-500" />
        <StatsCard title={t('effective_decisions', { defaultValue: 'قرارات نافذة' })} value={stats.actionTaken.toString()} icon={<ShieldCheckIcon className="w-6 h-6 text-green-600"/>} color="border-green-600" />
        <StatsCard title={t('appeals_and_reviews', { defaultValue: 'تظلمات واستئناف' })} value={stats.appealed.toString()} icon={<ScaleIcon className="w-6 h-6 text-purple-600"/>} color="border-purple-600" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
                <Card className="overflow-hidden border-none shadow-md ring-1 ring-slate-200">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow">
                                <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                                <input 
                                    className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder={t('search_by_employee_or_violation_placeholder', { defaultValue: 'ابحث باسم الموظف أو ملخص المخالفة...' })} 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={filterStatus} options={[{value: '', label: t('all_statuses', { defaultValue: 'كافة الحالات' })}, ...disciplinaryActionStatusOptions]} onChange={e => setFilterStatus(e.target.value as DisciplinaryActionStatus | '')} />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-5 py-4 text-right font-bold text-slate-700">{t('employee', { defaultValue: 'الموظف' })}</th>
                                    <th className="px-5 py-4 text-right font-bold text-slate-700">{t('violation_category', { defaultValue: 'تصنيف المخالفة' })}</th>
                                    <th className="px-5 py-4 text-right font-bold text-slate-700">{t('incident_date', { defaultValue: 'تاريخ الواقعة' })}</th>
                                    <th className="px-5 py-4 text-right font-bold text-slate-700">{t('issued_penalty', { defaultValue: 'الجزاء الصادر' })}</th>
                                    <th className="px-5 py-4 text-right font-bold text-slate-700">{t('status', { defaultValue: 'الحالة' })}</th>
                                    <th className="px-5 py-4 text-center font-bold text-slate-700">{t('actions', { defaultValue: 'إجراءات' })}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredActions.map(action => (
                                    <tr key={action.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-5 py-4 font-bold text-slate-900">{action.employeeName}</td>
                                        <td className="px-5 py-4 text-slate-600">{action.violationType}</td>
                                        <td className="px-5 py-4 text-slate-500">{formatDate(action.violationDate)}</td>
                                        <td className="px-5 py-4">
                                            {action.actionTaken ? (
                                                <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                                    {disciplinaryPenaltyKuwaitOptions.find(p=>p.value===action.actionTaken)?.label || t('notice_warn', { defaultValue: 'لفت نظر' })}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">{t('under_study', { defaultValue: 'قيد الدراسة' })}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4"><DisciplinaryActionStatusBadge status={action.status}/></td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => setViewingAction(action)} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-200 text-slate-500 hover:text-blue-600 transition-all">
                                                    <EyeIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => { setEditingAction(action); setIsFormModalOpen(true); }} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-200 text-slate-500 hover:text-orange-600 transition-all">
                                                    <PencilIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => setPrintingAction(action)} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
                                                    <PrinterIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredActions.length === 0 && <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">{t('no_matching_records_found', { defaultValue: 'لا توجد سجلات مطابقة للبحث...' })}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card title={t('governing_legal_rules', { defaultValue: 'القواعد القانونية المنظمة' })} icon={<ScaleIcon className="w-5 h-5 text-blue-600"/>} className="bg-slate-900 text-slate-200 border-none shadow-xl ring-1 ring-slate-800">
                    <div className="space-y-4">
                         {selectedJurisdiction.laborLaw.disciplinaryRules?.rules.map((rule, idx) => (
                            <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{t('article_prefix', { defaultValue: 'المادة' })} {rule.article}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-300">{rule.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                        <p className="text-[10px] text-blue-400 font-bold mb-2 flex items-center">
                            <InformationCircleIcon className="w-3 h-3 me-1"/> {t('critical_alert', { defaultValue: 'تنبيه حاسم' })}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {t('penalty_proportion_notice', { defaultValue: 'يجب أن يتناسب الجزاء مع المخالفة، ولا يجوز معاقبة الموظف مرتين عن نفس الواقعة. الميقات القانوني لإبلاغ الموظف هو 15 يوماً من ثبوت المخالفة.' })}
                        </p>
                    </div>
                </Card>
                
                <Card title={t('expected_procedures', { defaultValue: 'الإجراءات المتوقعة' })} className="bg-white border-dashed">
                    <div className="space-y-3">
                        <div className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                            <p className="text-[11px] text-slate-600 pt-1">{t('procedure_1', { defaultValue: 'رصد المخالفة وتوثيقها بتقرير أولي من الرئيس المباشر.' })}</p>
                        </div>
                        <div className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                            <p className="text-[11px] text-slate-600 pt-1">{t('procedure_2', { defaultValue: 'إحالة الملف للتحقيق الإداري (إيجابي/سلبي).' })}</p>
                        </div>
                        <div className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">3</div>
                            <p className="text-[11px] text-slate-600 pt-1">{t('procedure_3', { defaultValue: 'سماع أقوال الموظف وتفريغها في محضر رسمي.' })}</p>
                        </div>
                        <div className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">4</div>
                            <p className="text-[11px] text-slate-600 pt-1">{t('procedure_4', { defaultValue: 'تنسيب الجزاء المناسب واعتماده من صاحب الصلاحية.' })}</p>
                        </div>
                    </div>
                </Card>
            </div>
       </div>

      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingAction(null);}} title={editingAction?.id ? t('edit_disciplinary_file', { defaultValue: 'تعديل ملف الإجراء التأديبي' }) : t('open_new_disciplinary_file', { defaultValue: 'فتح ملف إجراء تأديبي جديد' })} size="xl">
          <DisciplinaryActionForm 
            initialData={editingAction} 
            onSubmit={handleFormSubmit} 
            onCancel={() => { setIsFormModalOpen(false); setEditingAction(null); }} 
            employees={mockEmployees} 
            preFilledInvestigationId={(editingAction as any)?.notes?.match(new RegExp(t('linked_to_investigation_num', { defaultValue: 'مرتبط بملف التحقيق رقم' }) + ': ([\\w-]+)'))?.[1] || undefined}
            preFilledViolationDetails={editingAction?.violationDetails}
          />
      </Modal>
      
      {/* Detail View modal */}
      {viewingAction && (
          <Modal isOpen={!!viewingAction} onClose={() => setViewingAction(null)} title={t('comprehensive_disciplinary_file_details', { defaultValue: 'تفاصيل الملف التأديبي الشاملة' })} size="xl">
               <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card title={t('violation_investigation_summary', { defaultValue: 'ملخص المخالفة والتحقيق' })} titleClassName="text-sm">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">{t('incident_and_details', { defaultValue: 'الواقعة والتفاصيل' })}:</label>
                                        <p className="text-sm p-3 bg-slate-50 rounded border mt-1 leading-relaxed">{viewingAction.violationDetails}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">{t('legal_investigation_summary_label', { defaultValue: 'ملخص التحقيق القانوني' })}:</label>
                                        <p className="text-sm p-3 bg-blue-50/30 rounded border border-blue-100 mt-1 leading-relaxed">
                                            {viewingAction.investigation?.investigationSummary || t('no_investigation_summary_available', { defaultValue: 'لم يتم تدوين ملخص تحقيق متاح في هذا الملف.' })}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card title={t('decision_data', { defaultValue: 'بيانات القرار' })} titleClassName="text-sm" className="bg-slate-900 text-white border-none">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold">{t('penalty', { defaultValue: 'الجزاء' })}:</label>
                                        <p className="text-lg font-black text-red-500">{viewingAction.actionTaken || t('under_study', { defaultValue: 'قيد الدراسة' })}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold">{t('start_date', { defaultValue: 'تاريخ البدء' })}:</label>
                                        <p className="text-sm">{formatDate(viewingAction.actionEffectiveDate)}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800">
                                        <DisciplinaryActionStatusBadge status={viewingAction.status} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
               </div>
               <div className="flex justify-end p-4 border-t gap-2 bg-slate-50">
                    <Button variant="ghost" size="sm" onClick={() => setViewingAction(null)}>{t('close', { defaultValue: 'إغلاق' })}</Button>
                    <Button variant="primary" size="sm" onClick={() => { setViewingAction(null); setPrintingAction(viewingAction); }} leftIcon={<PrinterIcon className="w-4 h-4"/>}>{t('issue_notice_for_print', { defaultValue: 'إصدار الإخطار للطباعة' })}</Button>
               </div>
          </Modal>
      )}

      <PrintableDisciplinaryActionModal action={printingAction} onClose={() => setPrintingAction(null)} />
    </div>
  );
};

export default DisciplinaryActionsPage;
