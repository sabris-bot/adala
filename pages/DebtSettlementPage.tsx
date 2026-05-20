
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon, ReceiptPercentIcon, PrinterIcon } from '../constants';
import { 
    DebtSettlementRecord, SettlementStatus, SettlementInstallment, InstallmentStatus,
    Tenant, LeaseAgreement, Case 
} from '../types';
import { settlementStatusOptions } from '../constants'; 
import { mockTenants as initialTenants, mockProperties, mockLeaseAgreements } from '../data/propertyData'; 
import { initialCases } from '../data/caseData';
import { SettlementStatusBadge, InstallmentStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';


// Function to generate mock settlement records
export const getMockSettlementRecords = (): DebtSettlementRecord[] => {
    const tenant1 = initialTenants.find(t => t.fullNameAr === 'أحمد عبدالله محمد');
    const leaseForTenant1 = mockLeaseAgreements.find(l => l.tenantId === tenant1?.id);
    const evictionCaseForTenant1 = initialCases.find(c => c.caseNumber === 'RENT-EVICT-001-2024');

    const tenant2 = initialTenants.find(t => t.fullNameAr === 'شركة الأمل للتجارة والمقاولات');
    const leaseForTenant2 = mockLeaseAgreements.find(l => l.tenantId === tenant2?.id);
    const commercialCaseForTenant2 = initialCases.find(c => c.caseNumber === 'CML-2024-101');
    
    return [
        {
            id: 'set-001',
            tenantId: tenant1?.id || 't1-fallback',
            tenantName: tenant1?.fullNameAr || 'أحمد عبدالله محمد',
            leaseAgreementId: leaseForTenant1?.id || 'lease1-fallback',
            leaseContractNumber: leaseForTenant1?.contractNumber || 'LSE-FALLBACK-001',
            propertyId: leaseForTenant1?.propertyId || 'prop-fallback',
            propertyName: leaseForTenant1 ? (mockProperties.find(p => p.id === leaseForTenant1.propertyId)?.name || 'عقار غير معروف') : 'عقار غير معروف',
            originalDebtAmount: 1050, 
            settlementDate: '2024-05-15',
            settledAmount: 900,
            amountCollectedViaLegal: 0,
            status: SettlementStatus.ACTIVE,
            relatedCaseId: evictionCaseForTenant1?.id, 
            relatedCaseNumber: evictionCaseForTenant1?.caseNumber,
            installmentPlan: [
                { id: 'si-001-1', installmentNumber: 1, dueDate: '2024-06-01', amountDue: 300, amountPaid: 300, paymentDate: '2024-06-01', status: InstallmentStatus.PAID },
                { id: 'si-001-2', installmentNumber: 2, dueDate: '2024-07-01', amountDue: 300, amountPaid: 300, paymentDate: '2024-07-01', status: InstallmentStatus.PAID },
                { id: 'si-001-3', installmentNumber: 3, dueDate: '2024-08-01', amountDue: 300, status: InstallmentStatus.PENDING },
            ],
            totalInstallmentsPaidAmount: 600,
            notes: 'تم الاتفاق على تقسيط المبلغ المتبقي على 3 أشهر بعد رفع قضية إخلاء.',
            createdAt: '2024-05-15',
            updatedAt: '2024-07-01',
        },
        {
            id: 'set-002',
            tenantId: tenant2?.id || 't2-fallback',
            tenantName: tenant2?.fullNameAr || 'شركة الأمل للتجارة والمقاولات',
            leaseAgreementId: leaseForTenant2?.id || 'lease2-fallback',
            leaseContractNumber: leaseForTenant2?.contractNumber || 'LSE-FALLBACK-002',
            propertyId: leaseForTenant2?.propertyId || 'prop-fallback-2',
            propertyName: leaseForTenant2 ? (mockProperties.find(p => p.id === leaseForTenant2.propertyId)?.name || 'عقار تجاري') : 'عقار تجاري',
            originalDebtAmount: 2100, 
            settlementDate: '2024-07-01',
            settledAmount: 2100,
            amountCollectedViaLegal: 1400, 
            relatedCaseId: commercialCaseForTenant2?.id, 
            relatedCaseNumber: commercialCaseForTenant2?.caseNumber, 
            status: SettlementStatus.PAID_IN_FULL,
            installmentPlan: [
                {id: 'si-002-1', installmentNumber: 1, dueDate: '2024-07-15', amountDue: 700, amountPaid: 700, paymentDate: '2024-07-15', status: InstallmentStatus.PAID}
            ],
            totalInstallmentsPaidAmount: 700,
            notes: 'تم تحصيل جزء من المبلغ عبر قضية تنفيذ، والجزء المتبقي دفعة واحدة.',
            createdAt: '2024-07-01',
            updatedAt: '2024-07-15',
        }
    ];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; }
};
const formatCurrency = (amount?: number) => amount !== undefined ? `${amount.toFixed(3)} د.ك` : '-';


interface DebtSettlementFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (settlement: DebtSettlementRecord) => void;
    initialData?: Partial<DebtSettlementRecord> | null;
    tenants: Pick<Tenant, 'id' | 'fullNameAr'>[];
    leases: Pick<LeaseAgreement, 'id' | 'contractNumber' | 'tenantId' | 'propertyId'>[];
    cases: Pick<Case, 'id' | 'caseNumber' | 'title'>[];
}

const DebtSettlementFormModal: React.FC<DebtSettlementFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, tenants, leases, cases }) => {
    const { addToast } = useToast();
    const getInitialFormData = useCallback((): Partial<DebtSettlementRecord> => {
        const baseData = {
            settlementDate: new Date().toISOString().split('T')[0],
            status: SettlementStatus.ACTIVE,
            installmentPlan: [], // Ensure installmentPlan is an array
            createdAt: new Date().toISOString().split('T')[0],
        };
        if (initialData) {
            return { ...baseData, ...initialData, installmentPlan: initialData.installmentPlan || [] };
        }
        return baseData;
    }, [initialData]);

    const [formData, setFormData] = useState<Partial<DebtSettlementRecord>>(getInitialFormData);
    const [currentInstallment, setCurrentInstallment] = useState<Partial<SettlementInstallment>>({dueDate: new Date().toISOString().split('T')[0], amountDue: 0, status: InstallmentStatus.UPCOMING});
    
    const availableLeases = useMemo(() => {
        return formData.tenantId ? leases.filter(l => l.tenantId === formData.tenantId) : leases;
    }, [formData.tenantId, leases]);

    useEffect(() => {
        if (isOpen) setFormData(getInitialFormData());
    }, [isOpen, getInitialFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numValue = ['originalDebtAmount', 'settledAmount', 'amountCollectedViaLegal'].includes(name) ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: numValue }));

        if (name === 'tenantId') {
            const tenant = tenants.find(t => t.id === value);
            setFormData(prev => ({ ...prev, tenantName: tenant?.fullNameAr || '', leaseAgreementId: undefined, leaseContractNumber: undefined, propertyId: undefined, propertyName: undefined }));
        } else if (name === 'leaseAgreementId') {
            const lease = leases.find(l => l.id === value);
            if(lease) {
                const property = mockProperties.find(p => p.id === lease.propertyId); 
                setFormData(prev => ({ ...prev, leaseContractNumber: lease.contractNumber, propertyId: lease.propertyId, propertyName: property?.name }));
            }
        } else if (name === 'relatedCaseId') {
            const caseItem = cases.find(c => c.id === value);
            setFormData(prev => ({ ...prev, relatedCaseNumber: caseItem?.caseNumber }));
        }
    };
    
    const handleInstallmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCurrentInstallment(prev => ({...prev, [name]: name === 'amountDue' ? parseFloat(value) || 0 : value}));
    };
    
    const addInstallment = () => {
        if (currentInstallment.dueDate && currentInstallment.amountDue && currentInstallment.amountDue > 0) {
            const newInstallment: SettlementInstallment = {
                ...currentInstallment,
                id: `si-${Date.now()}`,
                installmentNumber: (formData.installmentPlan?.length || 0) + 1,
            } as SettlementInstallment;
            setFormData(prev => ({...prev, installmentPlan: [...(prev.installmentPlan || []), newInstallment]}));
            setCurrentInstallment({dueDate: new Date().toISOString().split('T')[0], amountDue: 0, status: InstallmentStatus.UPCOMING});
            addToast({ type: 'info', title: 'تمت إضافة قسط', message: 'تمت إضافة قسط جديد لجدول السداد.' });
        } else {
            addToast({ type: 'error', title: 'خطأ في الإدخال', message: 'يرجى إدخال تاريخ استحقاق ومبلغ صحيح للقسط.' });
        }
    };
    
    const removeInstallment = (id: string) => {
        setFormData(prev => ({...prev, installmentPlan: prev.installmentPlan?.filter(inst => inst.id !== id)
            .map((inst, index) => ({...inst, installmentNumber: index + 1})) 
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenantId || !formData.leaseAgreementId || !formData.settlementDate || !formData.settledAmount) {
            addToast({ type: 'error', title: 'بيانات ناقصة', message: 'يرجى ملء الحقول الإلزامية: المستأجر، عقد الإيجار، تاريخ التسوية، والمبلغ المتفق عليه.' });
            return;
        }
        const totalPaid = formData.installmentPlan?.filter(i => i.status === InstallmentStatus.PAID).reduce((sum, i) => sum + (i.amountPaid || 0), 0);

        onSubmit({ ...formData, totalInstallmentsPaidAmount: totalPaid, updatedAt: new Date().toISOString() } as DebtSettlementRecord);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData?.id ? "تعديل تسوية مديونية" : "إنشاء تسوية مديونية جديدة"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto p-1 scrollbar-thin">
                <Card title="بيانات المستأجر والعقد" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select label="المستأجر (*)" name="tenantId" value={formData.tenantId || ''} options={tenants.map(t => ({value: t.id, label: t.fullNameAr}))} onChange={handleChange} required placeholder="اختر المستأجر"/>
                        <Select label="عقد الإيجار المرتبط (*)" name="leaseAgreementId" value={formData.leaseAgreementId || ''} options={availableLeases.map(l => ({value: l.id, label: `${l.contractNumber} (${formData.propertyName || 'العقار'})`}))} onChange={handleChange} required placeholder="اختر عقد الإيجار" disabled={!formData.tenantId}/>
                    </div>
                </Card>
                <Card title="تفاصيل المديونية والتسوية" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input label="إجمالي الدين الأصلي (د.ك)" name="originalDebtAmount" type="number" value={String(formData.originalDebtAmount || 0)} onChange={handleChange} step="0.001"/>
                        <Input label="تاريخ التسوية (*)" name="settlementDate" type="date" value={formData.settlementDate} onChange={handleChange} required/>
                        <Input label="المبلغ المتفق عليه في التسوية (د.ك) (*)" name="settledAmount" type="number" value={String(formData.settledAmount || 0)} onChange={handleChange} required step="0.001"/>
                    </div>
                     <Input label="المبلغ المحصل عبر إجراء قانوني (إن وجد)" name="amountCollectedViaLegal" type="number" value={String(formData.amountCollectedViaLegal || 0)} onChange={handleChange} step="0.001"/>
                     <Select label="القضية المرتبطة (إن وجدت)" name="relatedCaseId" value={formData.relatedCaseId || ''} 
                        options={[{value:'', label:'لا يوجد'}, ...cases.map(c=>({value: c.id, label: `${c.caseNumber} - ${c.title}`}))]} onChange={handleChange} />
                </Card>
                <Card title="خطة تقسيط مبلغ التسوية (إن وجدت)" titleClassName="text-sm">
                    <div className="space-y-2 mb-2">
                        {formData.installmentPlan?.map((inst, index) => (
                             <div key={inst.id} className="flex items-center justify-between p-1.5 border rounded bg-slate-100 text-xs">
                                <span>القسط {inst.installmentNumber}: {formatDate(inst.dueDate)} - {formatCurrency(inst.amountDue)} ({inst.status})</span>
                                <Button type="button" variant="danger" size="sm" onClick={() => removeInstallment(inst.id)} className="!p-1"><TrashIcon className="w-3"/></Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-end gap-2 border-t pt-2">
                        <Input label="تاريخ استحقاق القسط" type="date" name="dueDate" value={currentInstallment.dueDate || ''} onChange={handleInstallmentChange} containerClassName="flex-grow mb-0"/>
                        <Input label="مبلغ القسط (د.ك)" type="number" name="amountDue" value={String(currentInstallment.amountDue || '')} onChange={handleInstallmentChange} step="0.001" containerClassName="w-36 mb-0"/>
                        <Button type="button" variant="outline" size="sm" onClick={addInstallment} leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة قسط</Button>
                    </div>
                </Card>
                 <Card title="الحالة والملاحظات" titleClassName="text-sm">
                    <Select label="حالة التسوية" name="status" value={formData.status} options={settlementStatusOptions} onChange={handleChange} required/>
                    <TextArea label="ملاحظات إضافية" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2}/>
                 </Card>
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{formData.id ? 'حفظ التعديلات' : 'إنشاء تسوية'}</Button>
                </div>
            </form>
        </Modal>
    );
};


import { useSearchParams } from 'react-router-dom';


const DebtSettlementPage: React.FC = () => {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [settlements, setSettlements] = useState<DebtSettlementRecord[]>(getMockSettlementRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SettlementStatus | ''>('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Partial<DebtSettlementRecord> | null>(null);
  const [viewingSettlement, setViewingSettlement] = useState<DebtSettlementRecord | null>(null);
  useEffect(() => {
    // Initial check
    const settlementIdToView = searchParams.get('view');
    if (settlementIdToView) {
        const foundSettlement = getMockSettlementRecords().find(s => s.id === settlementIdToView);
        if (foundSettlement) {
            setViewingSettlement(foundSettlement);
        }
    }
  }, [searchParams]);


  const filteredSettlements = useMemo(() => {
    return settlements.filter(s =>
      (s.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.leaseContractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (s.propertyName && s.propertyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (s.relatedCaseNumber && s.relatedCaseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? s.status === filterStatus : true)
    ).sort((a,b) => new Date(b.settlementDate).getTime() - new Date(a.settlementDate).getTime());
  }, [settlements, searchTerm, filterStatus]);

  const handleAddSettlement = () => {
    setEditingSettlement(null);
    setIsFormModalOpen(true);
  };

  const handleEditSettlement = (settlement: DebtSettlementRecord) => {
    setEditingSettlement(settlement);
    setIsFormModalOpen(true);
  };
  
  const handleViewSettlement = (settlement: DebtSettlementRecord) => {
    setViewingSettlement(settlement);
  };

  const handleDeleteSettlement = useCallback((settlementId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف سجل التسوية هذا؟')) {
      setSettlements(prev => prev.filter(s => s.id !== settlementId));
      addToast({ type: 'success', title: 'حذف تسوية', message: 'تم حذف سجل التسوية بنجاح.' });
    }
  }, [addToast]);

  const handleFormSubmit = (data: DebtSettlementRecord) => {
    if (editingSettlement?.id) {
      setSettlements(prev => prev.map(s => (s.id === editingSettlement.id ? data : s)));
      addToast({ type: 'success', title: 'تحديث تسوية', message: 'تم تحديث بيانات التسوية بنجاح.' });
    } else {
      setSettlements(prev => [{ ...data, id: `set-${Date.now()}` }, ...prev]);
      addToast({ type: 'success', title: 'إنشاء تسوية', message: 'تم إنشاء سجل تسوية مديونية جديد.' });
    }
    setIsFormModalOpen(false);
    setEditingSettlement(null);
  };
  
  const handleRecordInstallmentPayment = (settlementId: string, installmentId: string, paymentDate: string, amountPaid: number) => {
    setSettlements(prevSettlements => prevSettlements.map(settlement => {
        if (settlement.id === settlementId) {
            const updatedInstallments = settlement.installmentPlan?.map(inst => {
                if (inst.id === installmentId) {
                    return { ...inst, amountPaid, paymentDate, status: amountPaid >= inst.amountDue ? InstallmentStatus.PAID : InstallmentStatus.PARTIALLY_PAID };
                }
                return inst;
            });
            const totalPaid = updatedInstallments?.filter(i => i.status === InstallmentStatus.PAID || i.status === InstallmentStatus.PARTIALLY_PAID).reduce((sum, i) => sum + (i.amountPaid || 0), 0) || 0;
            let newStatus = settlement.status;
            if (totalPaid >= settlement.settledAmount && (settlement.amountCollectedViaLegal || 0) + totalPaid >= settlement.settledAmount) {
                 newStatus = SettlementStatus.PAID_IN_FULL;
            } else if (totalPaid > 0 || (settlement.amountCollectedViaLegal || 0) > 0) {
                newStatus = SettlementStatus.ACTIVE;
            }
            
            return { ...settlement, installmentPlan: updatedInstallments, totalInstallmentsPaidAmount: totalPaid, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return settlement;
    }));
    // Update viewingSettlement if it's the one being modified
    if (viewingSettlement && viewingSettlement.id === settlementId) {
      setViewingSettlement(prev => prev ? {...settlements.find(s => s.id === settlementId) } : null );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <ReceiptPercentIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">تسوية مديونيات المستأجرين</h1>
        </div>
        <Button onClick={handleAddSettlement} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إضافة تسوية جديدة
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">متابعة تحصيل ديون الإيجارات المتعثرة</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    تساعدك هذه الوحدة على إدارة وتسجيل اتفاقيات التسوية مع المستأجرين المتعثرين في سداد الإيجارات أو أي مستحقات أخرى. يمكنك توثيق المبالغ المتفق عليها، خطط التقسيط، والمبالغ المحصلة سواء عبر التسوية المباشرة أو من خلال الإجراءات القانونية (القضايا).
                </p>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input placeholder="ابحث باسم المستأجر، رقم العقد، اسم العقار، رقم القضية..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select label="تصفية بالحالة" options={[{value: '', label: 'الكل'}, ...settlementStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as SettlementStatus | '')} containerClassName="mb-0"/>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {['المستأجر', 'العقار/العقد', 'مبلغ التسوية', 'المحصل قانونيًا', 'المحصل تقسيطًا', 'المتبقي', 'الحالة', 'تاريخ التسوية', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSettlements.map(s => {
                        const remainingAmount = s.settledAmount - (s.amountCollectedViaLegal || 0) - (s.totalInstallmentsPaidAmount || 0);
                        return (
                        <tr key={s.id} className="hover:bg-primary-light/5">
                            <td className="px-3 py-2 whitespace-nowrap font-medium">{s.tenantName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">{s.propertyName || '-'}<br/>({s.leaseContractNumber})</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(s.settledAmount)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(s.amountCollectedViaLegal)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(s.totalInstallmentsPaidAmount)}</td>
                            <td className="px-3 py-2 whitespace-nowrap font-semibold">{formatCurrency(remainingAmount)}</td>
                            <td className="px-3 py-2 whitespace-nowrap"><SettlementStatusBadge status={s.status}/></td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(s.settlementDate)}</td>
                            <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                                <Button variant="ghost" size="sm" onClick={() => handleViewSettlement(s)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditSettlement(s)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSettlement(s.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                            </td>
                        </tr>
                    );})}
                    {filteredSettlements.length === 0 && (
                        <tr><td colSpan={9} className="text-center py-10 text-gray-500"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>لا توجد تسويات تطابق بحثك.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <DebtSettlementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSettlement}
        tenants={initialTenants}
        leases={mockLeaseAgreements}
        cases={initialCases}
      />
      {viewingSettlement && (
            <Modal isOpen={!!viewingSettlement} onClose={() => setViewingSettlement(null)} title={`تفاصيل تسوية مديونية: ${viewingSettlement.tenantName}`} size="xl">
                <div className="space-y-3 p-2 max-h-[75vh] overflow-y-auto scrollbar-thin printable-sheet">
                    {/* Legal Print Header */}
                    <div className="legal-print-header container mx-auto">
                        <div className="title-box text-right">
                            <h1 className="text-2xl font-black text-primary">منظومة عدالة القانونية</h1>
                            <p className="text-xs text-gray-500 font-bold">تقرير تفصيلي لتسوية مديونية مستأجر</p>
                            <p className="text-[10px] text-gray-400 mt-1">تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div className="logo-box">
                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-xl">ع</div>
                        </div>
                    </div>

                    <Card title="ملخص التسوية" className="bg-gray-50" titleClassName="text-sm">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <p><strong>المستأجر:</strong> {viewingSettlement.tenantName}</p>
                            <p><strong>العقد:</strong> {viewingSettlement.leaseContractNumber} ({viewingSettlement.propertyName})</p>
                            <p><strong>تاريخ التسوية:</strong> {formatDate(viewingSettlement.settlementDate)}</p>
                            <p><strong>إجمالي الدين الأصلي:</strong> {formatCurrency(viewingSettlement.originalDebtAmount)}</p>
                            <p><strong>المبلغ المتفق عليه:</strong> {formatCurrency(viewingSettlement.settledAmount)}</p>
                            <p><strong>الحالة:</strong> <SettlementStatusBadge status={viewingSettlement.status} size="xs"/></p>
                         </div>
                    </Card>
                     <Card title="المبالغ المحصلة" className="bg-gray-50" titleClassName="text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <p><strong>عبر إجراء قانوني:</strong> {formatCurrency(viewingSettlement.amountCollectedViaLegal)}</p>
                            {viewingSettlement.relatedCaseNumber && <p><strong>القضية المرتبطة:</strong> {viewingSettlement.relatedCaseNumber}</p>}
                            <p><strong>عبر الأقساط:</strong> {formatCurrency(viewingSettlement.totalInstallmentsPaidAmount)}</p>
                            <p className="font-bold"><strong>إجمالي المتبقي:</strong> {formatCurrency(viewingSettlement.settledAmount - (viewingSettlement.amountCollectedViaLegal || 0) - (viewingSettlement.totalInstallmentsPaidAmount || 0))}</p>
                        </div>
                     </Card>
                    {viewingSettlement.installmentPlan && viewingSettlement.installmentPlan.length > 0 && (
                        <Card title="خطة الأقساط" titleClassName="text-sm">
                            <ul className="space-y-1 text-xs">
                                {viewingSettlement.installmentPlan.map(inst => (
                                    <li key={inst.id} className={`p-1.5 border rounded flex justify-between items-center ${inst.status === InstallmentStatus.OVERDUE ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                                        <span>القسط {inst.installmentNumber}: {formatDate(inst.dueDate)} - المستحق: {formatCurrency(inst.amountDue)} - المدفوع: {formatCurrency(inst.amountPaid)}</span>
                                        <div className="flex items-center">
                                          <InstallmentStatusBadge status={inst.status} />
                                          { (inst.status === InstallmentStatus.PENDING || inst.status === InstallmentStatus.UPCOMING || inst.status === InstallmentStatus.OVERDUE) &&
                                             <Button size="sm" variant="outline" className="!text-xs !py-0.5 !px-1 ms-2" 
                                                onClick={() => {
                                                    const paymentDate = prompt("أدخل تاريخ الدفع (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
                                                    const amountPaidStr = prompt("أدخل المبلغ المدفوع:", String(inst.amountDue));
                                                    if (paymentDate && amountPaidStr && !isNaN(parseFloat(amountPaidStr))) {
                                                        handleRecordInstallmentPayment(viewingSettlement!.id, inst.id, paymentDate, parseFloat(amountPaidStr));
                                                    }
                                                }}>تسجيل سداد</Button>
                                          }
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                    {viewingSettlement.notes && <Card title="ملاحظات" className="bg-yellow-50 border-yellow-200" titleClassName="text-sm text-yellow-700"><pre className="whitespace-pre-wrap font-sans text-xs p-1">{viewingSettlement.notes}</pre></Card>}
                </div>
                <div className="mt-3 flex justify-end p-2 border-t gap-2 no-print">
                     <Button variant="outline" className="print-hide" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة / PDF</Button>
                     <Button onClick={() => { setViewingSettlement(null); handleEditSettlement(viewingSettlement);}}>تعديل</Button>
                </div>
           </Modal>
      )}
    </div>
  );
};

export default DebtSettlementPage;
