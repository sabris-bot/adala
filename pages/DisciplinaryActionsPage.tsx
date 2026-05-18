
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
import { Employee, DisciplinaryAction, ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus } from '../types';
import { violationTypeKuwaitOptions, disciplinaryPenaltyKuwaitOptions, disciplinaryActionStatusOptions, KUWAIT_LEGAL_VIOLATIONS } from '../constants';
import { DisciplinaryActionStatusBadge } from '../components/ui/Badge';
import { useLocation } from 'react-router-dom';
import { useJurisdiction } from '../components/JurisdictionContext';
import { sampleEmployees } from '../data/employeeData';

const mockEmployees: Employee[] = sampleEmployees.slice(0, 5);

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
      investigationSummary: 'تمت مواجهة الموظف بسجل البصمة، وأقر بالتأخير متذرعاً بالازدحام المروري، وهو عذر غير قانوني للتكرار برغم التنبيه الشفهي المسبق.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
    penaltyDetails: 'إنذار كتابي أول مع التنبيه بالفصل في حال التكرار المتصل وفق اللائحة.',
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-07-11',
    linkedInvestigationId: 'INV-2024-012'
  },
  {
    id: 'da-complex-1',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين السيد',
    violationDate: '2024-08-10',
    reportDate: '2024-08-11',
    reportedBy: 'نظم المعلومات',
    violationType: ViolationTypeKuwait.OTHER,
    violationDetails: 'إفشاء أسرار مهنية متعلقة بمناقصة (مشروع الربط الكهربائي) لجهة خارجية منافسة.',
    investigation: {
        investigator: 'اللجنة القانونية العليا',
        investigationSummary: 'كشفت التحقيقات الرقمية عن تسريب ملفات مشفرة للمنافسين. الموظفة أنكرت في البداية ثم واجهتها اللجنة بالأدلة التقنية الموثقة بحضور محاميها.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.TERMINATION_WITHOUT_NOTICE,
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-08-11',
    linkedInvestigationId: 'INV-2024-088'
  }
];

const StatsCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; subtitle?: string }> = ({ title, value, icon, color, subtitle }) => (
    <Card className={`border-b-4 ${color} shadow-lg transition-all hover:translate-y-[-2px] bg-white`}>
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
                {subtitle && <p className="text-[10px] text-slate-500 font-bold">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-2xl bg-opacity-10 ${color.replace('border-', 'bg-')} ${color.replace('border-', 'text-')}`}>
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
}

const DisciplinaryActionForm: React.FC<DisciplinaryActionFormProps> = ({ initialData, onSubmit, onCancel, employees }) => {
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
      investigation: { investigator: '', investigationSummary: '' },
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const selectedEmployee = useMemo(() => employees.find(e => e.id === formData.employeeId), [formData.employeeId, employees]);

  const deductionLimit = useMemo(() => {
    if (!selectedEmployee) return 0;
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
          <Card title="بيانات الوقائع والاتهامات" icon={<InformationCircleIcon className="w-5 h-5 text-primary"/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="الموظف المنسوب إليه المخالفة" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
              <Input label="تاريخ الواقعة" name="violationDate" type="date" value={formData.violationDate} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select label="تصنيف المخالفة" name="violationType" value={formData.violationType} options={violationTypeKuwaitOptions} onChange={handleChange} required />
              <Input label="جهة الإبلاغ" name="reportedBy" value={formData.reportedBy || ''} onChange={handleChange} required />
            </div>
            <TextArea label="الوصف الوقائعي للتهمة" name="violationDetails" value={formData.violationDetails || ''} onChange={handleChange} required rows={5} className="mt-4" />
          </Card>

          <Card title="المنطوق والقرار الجزائي" icon={<GavelIcon className="w-5 h-5 text-secondary"/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="العقوبة المقررة" name="actionTaken" value={formData.actionTaken || ''} options={[{value: '', label: 'بانتظار القرار'}, ...disciplinaryPenaltyKuwaitOptions]} onChange={handleChange} />
              <Input label="تاريخ السريان" name="actionEffectiveDate" type="date" value={formData.actionEffectiveDate || ''} onChange={handleChange} />
            </div>
            <TextArea label="التكيف القانوني والأسباب" name="penaltyDetails" value={formData.penaltyDetails || ''} onChange={handleChange} rows={3} className="mt-4" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="المذكرة القانونية ونتائج التحقيق" icon={<ScaleIcon className="w-5 h-5 text-accent-DEFAULT"/>} className="bg-slate-50">
            <Input label="رقم ملف التحقيق المرتبط" name="linkedInvestigationId" placeholder="INV-2024-XXX" value={(formData as any).linkedInvestigationId || ''} onChange={handleChange} />
            <Input label="رئيس هيئة التحقيق" name="investigator" value={formData.investigation?.investigator || ''} onChange={handleInvestigationChange} className="mt-4" />
            <TextArea label="الرأي الفني والنتيجة" name="investigationSummary" value={formData.investigation?.investigationSummary || ''} onChange={handleInvestigationChange} rows={6} className="mt-4" />
          </Card>

          <Card title="الحالة النهائية للقرار">
            <Select label="حالة الملف" name="status" value={formData.status} options={disciplinaryActionStatusOptions} onChange={handleChange} required />
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t sticky bottom-0 bg-white py-2 z-10">
        <Button type="button" variant="ghost" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary" className="px-10">إصدار الحكم الإداري</Button>
      </div>
    </form>
  );
}

const PrintableDisciplinaryActionModal: React.FC<{ action: DisciplinaryAction | null; onClose: () => void }> = ({ action, onClose }) => {
    const { t } = useTranslation();
    const { selectedJurisdiction } = useJurisdiction();
    if (!action) return null;
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
    
    return (
        <Modal isOpen={!!action} onClose={onClose} title="تقرير قرار جزائي نهائي" size="lg">
            <div id="printable-disciplinary-content" className="p-12 bg-white text-slate-900 shadow-inner" dir="rtl">
                <style>{`
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        #printable-disciplinary-content { padding: 0 !important; font-size: 10pt !important; line-height: 1.5; }
                        .no-print { display: none !important; }
                    }
                    .legal-header { border-bottom: 3px double #000; padding-bottom: 1rem; margin-bottom: 2rem; }
                    .legal-title { text-align: center; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.5rem; color: #000; text-transform: uppercase; }
                    .legal-section-title { font-weight: 800; background: #f1f5f9; padding: 8px 12px; border-right: 6px solid #0f172a; margin: 1.5rem 0 0.75rem 0; font-size: 1.1rem; }
                    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1rem; border: 1px solid #e2e8f0; }
                    .judgment-box { border: 4px double #000; padding: 2rem; text-align: center; margin: 2rem 0; background: #f8fafc; }
                `}</style>

                <div className="legal-header flex justify-between items-center text-right">
                    <div>
                        <h2 className="text-xl font-black">{OFFICE_NAME}</h2>
                        <p className="text-xs font-bold text-slate-600">قطاع الشؤون القانونية - وحدة العقوبات</p>
                    </div>
                    <div className="text-left font-mono text-[10px]">
                        <p>REF: VERDICT-{action.id.split('-').pop()?.toUpperCase()}</p>
                        <p>DATE: {new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="legal-title">قرار جزائي تأديبي نهائي</h1>
                    <p className="text-sm font-bold text-slate-500 underline decoration-slate-300">محرر وفقاً لمواد قانون العمل الكويتي رقم 6 لسنة 2010</p>
                </div>

                <div className="data-grid text-sm mb-6">
                    <p>الموظف الصادر بحقه القرار: <strong>{action.employeeName}</strong></p>
                    <p>رقم ملف التحقيق: <strong>{action.linkedInvestigationId || 'N/A'}</strong></p>
                    <p>تاريخ المخالفة: <strong>{formatDate(action.violationDate)}</strong></p>
                    <p>جهة الإبلاغ: <strong>{action.reportedBy}</strong></p>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="legal-section-title">أولاً: الحيثيات والوقائع</div>
                        <p className="text-sm p-4 bg-slate-50 border leading-relaxed">{action.violationDetails}</p>
                    </div>

                    <div>
                        <div className="legal-section-title">ثانياً: التحليل القانوني ونتيجة التحقيق</div>
                        <p className="text-sm p-4 bg-slate-50 border leading-relaxed">
                            {action.investigation?.investigationSummary || "بناءً على نتائج التحقيقات الإدارية والاعتراف الموثق وسماع أقوال الشهود، ثبتت المخالفة في حق الموظف المذكور أعلاه."}
                        </p>
                    </div>

                    <div className="judgment-box">
                        <h3 className="text-sm font-black text-slate-500 mb-4 tracking-[0.2em] uppercase">لـذلـك فـقـد تـقـرر</h3>
                        <p className="text-3xl font-black text-slate-900 mb-4 underline decoration-red-600 underline-offset-8">
                            {disciplinaryPenaltyKuwaitOptions.find(p => p.value === action.actionTaken)?.label || action.actionTaken}
                        </p>
                        {action.actionEffectiveDate && <p className="text-xs font-bold text-slate-400 italic">يسري هذا القرار من تاريخ: {formatDate(action.actionEffectiveDate)}</p>}
                    </div>

                    <div className="signature-section grid grid-cols-2 gap-10 mt-12 pt-8 border-t">
                        <div className="text-center">
                            <p className="text-xs font-black mb-16 underline">توقيع المستلم (إقرار بالعلم)</p>
                            <p className="text-xs text-slate-300">................................</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black mb-16 underline">اعتماد الإدارة القانونية والمدير العام</p>
                            <div className="flex justify-center gap-4">
                                <div className="w-20 h-20 border-2 border-dashed border-slate-200"></div>
                                <div className="w-20 h-20 border-2 border-dashed border-slate-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end p-4 border-t gap-3 no-print bg-slate-100">
                <Button variant="ghost" onClick={onClose}>إغلاق</Button>
                <Button variant="primary" className="bg-slate-900" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة القرار الرسمي</Button>
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

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Partial<DisciplinaryAction> | null>(null);
  const [printingAction, setPrintingAction] = useState<DisciplinaryAction | null>(null);

  const location = useLocation();
  useEffect(() => {
    if (location.state && (location.state as any).linkedInvestigationId) {
        const { linkedInvestigationId, violationDetails } = location.state as any;
        setEditingAction({
            violationDetails: violationDetails || '',
            linkedInvestigationId: linkedInvestigationId,
        });
        setIsFormModalOpen(true);
        window.history.replaceState({}, document.title);
    }
  }, [location, t]);

  const filteredActions = useMemo(() => {
    return actions.filter(action =>
      (action.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (action.violationDetails && action.violationDetails.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterStatus ? action.status === filterStatus : true)
    ).sort((a,b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }, [actions, searchTerm, filterStatus]);
  
  const handleFormSubmit = (data: DisciplinaryAction) => {
    if (editingAction && editingAction.id) {
      setActions(prev => prev.map(a => a.id === editingAction.id ? { ...data, id: a.id, createdAt: a.createdAt } : a));
    } else {
      setActions(prev => [{ ...data, id: `da-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingAction(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                <ScaleIcon className="w-8 h-8 text-rose-600 me-3" />
                المحكمة التأديبية للشؤون القانونية
            </h1>
            <p className="text-slate-500 font-bold mt-1">وحدة المتابعة والجزاءات الإدارية - Adala Judicial System</p>
        </div>
        <Button onClick={() => { setEditingAction(null); setIsFormModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            تحرير قرار جزائي
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="إجمالي القرارات" value={actions.length.toString()} icon={<DocumentTextIcon className="w-6 h-6"/>} color="border-slate-800" />
        <StatsCard title="قرارات نافذة" value={actions.filter(a=>a.status===DisciplinaryActionStatus.ACTION_TAKEN).length.toString()} icon={<CheckCircleIcon className="w-6 h-6"/>} color="border-green-600" />
        <StatsCard title="تظلمات جارية" value="2" icon={<ScaleIcon className="w-6 h-6"/>} color="border-amber-600" />
        <StatsCard title="إلغاء عقوبة" value="0" icon={<TrashIcon className="w-6 h-6"/>} color="border-indigo-600" />
      </div>

      <Card className="overflow-hidden">
          <div className="bg-slate-50 p-4 border-b">
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                      <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" placeholder="بحث باسم الموظف أو منطوق الحكم..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterStatus} options={[{value: '', label: 'كافة الحالات'}, ...disciplinaryActionStatusOptions]} onChange={e => setFilterStatus(e.target.value as any)} containerClassName="mb-0 w-full md:w-48" />
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y text-sm">
                  <thead className="bg-slate-50">
                      <tr>
                          {['الموظف الصادر بحقه القرار', 'المخالفة المنسوبة', 'الحكم / الجزاء', 'تاريخ القرار', 'الحالة', 'إجراءات'].map(h => <th key={h} className="px-4 py-3 text-right font-black text-slate-700">{h}</th>)}
                      </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                      {filteredActions.map(action => (
                          <tr key={action.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-bold">{action.employeeName}</td>
                              <td className="px-4 py-4 text-slate-600 max-w-[200px] truncate">{action.violationDetails}</td>
                              <td className="px-4 py-4">
                                  <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                                      {disciplinaryPenaltyKuwaitOptions.find(p=>p.value===action.actionTaken)?.label || action.actionTaken}
                                  </span>
                              </td>
                              <td className="px-4 py-4 text-slate-500">{new Date(action.reportDate).toLocaleDateString('ar-EG')}</td>
                              <td className="px-4 py-4"><DisciplinaryActionStatusBadge status={action.status}/></td>
                              <td className="px-4 py-4 space-x-1 space-x-reverse">
                                  <Button variant="ghost" size="sm" onClick={() => setPrintingAction(action)}><PrinterIcon className="w-4 text-slate-600"/></Button>
                                  <Button variant="ghost" size="sm" onClick={() => { setEditingAction(action); setIsFormModalOpen(true); }}><PencilIcon className="w-4 text-amber-600"/></Button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="صياغة قرار جزائي نهائي" size="xl">
          <DisciplinaryActionForm initialData={editingAction} onSubmit={handleFormSubmit} onCancel={() => setIsFormModalOpen(false)} employees={mockEmployees} />
      </Modal>

      <PrintableDisciplinaryActionModal action={printingAction} onClose={() => setPrintingAction(null)} />
    </div>
  );
};

export default DisciplinaryActionsPage;
