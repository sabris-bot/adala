
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { CurrencyDollarIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon } from '../constants'; // Added InformationCircleIcon
import { Loan, Employee, LoanType, LoanStatus, Installment, InstallmentStatus, RequestAttachment } from '../types';
import { loanTypeOptions, loanStatusOptions, installmentStatusOptions } from '../constants';
import { LoanStatusBadge, InstallmentStatusBadge } from '../components/ui/Badge';

const mockEmployees: Pick<Employee, 'id' | 'fullNameAr' | 'employeeId' | 'civilId' | 'jobTitle'>[] = [
  { id: 'emp-001', fullNameAr: 'أحمد محمود مبارك', employeeId: 'EMP001', civilId: '285010112345', jobTitle: 'محام أول' },
  { id: 'emp-002', fullNameAr: 'فاطمة علي حسين', employeeId: 'EMP002', civilId: '290030323456', jobTitle: 'مساعدة قانونية' },
  { id: 'emp-003', fullNameAr: 'علي محمد جاسم', employeeId: 'EMP003', civilId: '300070734567', jobTitle: 'سكرتير تنفيذي' },
];

export const initialLoans: Loan[] = [ // Added export
  {
    id: 'loan1',
    employeeId: 'emp-001',
    employeeName: 'أحمد محمود مبارك',
    loanType: LoanType.PERSONAL,
    loanAmount: 5000,
    purpose: 'مصاريف شخصية طارئة',
    requestDate: '2023-10-15',
    approvalDate: '2023-10-18',
    disbursementDate: '2023-10-20',
    repaymentStartDate: '2023-11-01',
    numberOfInstallments: 12,
    monthlyInstallment: 416.667,
    status: LoanStatus.ACTIVE,
    installments: Array.from({ length: 12 }, (_, i) => ({
      id: `inst1-${i+1}`,
      installmentNumber: i + 1,
      dueDate: new Date(2023, 10 + i, 1).toISOString().split('T')[0],
      amountDue: 416.667,
      status: i < 8 ? InstallmentStatus.PAID : (i === 8 ? InstallmentStatus.PENDING : InstallmentStatus.UPCOMING),
      amountPaid: i < 8 ? 416.667 : undefined,
      paymentDate: i < 8 ? new Date(2023, 10 + i, 1).toISOString().split('T')[0] : undefined,
    })),
    totalPaidAmount: 416.667 * 8,
    remainingBalance: 5000 - (416.667 * 8),
    createdAt: '2023-10-15',
    notes: "القرض الأول للموظف، ملتزم بالسداد."
  },
  {
    id: 'loan2',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين',
    loanType: LoanType.SALARY_ADVANCE,
    loanAmount: 500,
    purpose: 'لتغطية مصاريف عاجلة',
    requestDate: '2024-06-01',
    approvalDate: '2024-06-01',
    disbursementDate: '2024-06-02',
    repaymentStartDate: '2024-07-01',
    numberOfInstallments: 2,
    monthlyInstallment: 250,
    status: LoanStatus.PAID_IN_FULL,
    installments: [
        { id: 'inst2-1', installmentNumber: 1, dueDate: '2024-07-01', amountDue: 250, amountPaid: 250, paymentDate: '2024-07-01', status: InstallmentStatus.PAID },
        { id: 'inst2-2', installmentNumber: 2, dueDate: '2024-08-01', amountDue: 250, amountPaid: 250, paymentDate: '2024-08-01', status: InstallmentStatus.PAID },
    ],
    totalPaidAmount: 500,
    remainingBalance: 0,
    createdAt: '2024-06-01',
  },
  {
    id: 'loan3',
    employeeId: 'emp-003',
    employeeName: 'علي محمد جاسم',
    loanType: LoanType.HOUSING, // سلفة إسكانية
    loanAmount: 10000,
    purpose: 'دفعة أولى لشراء مسكن',
    requestDate: '2024-01-10',
    approvalDate: '2024-01-15',
    disbursementDate: '2024-01-20',
    repaymentStartDate: '2024-03-01',
    numberOfInstallments: 40, // ما يعادل تقريباً 25% من راتب 1000 لمدة 40 شهرًا
    monthlyInstallment: 250, 
    status: LoanStatus.ACTIVE,
    installments: Array.from({ length: 40 }, (_, i) => ({
      id: `inst3-${i+1}`,
      installmentNumber: i + 1,
      dueDate: new Date(2024, 2 + i, 1).toISOString().split('T')[0], // Start from March 2024
      amountDue: 250,
      status: i < 5 ? InstallmentStatus.PAID : InstallmentStatus.UPCOMING, // Assuming 5 installments paid
      amountPaid: i < 5 ? 250 : undefined,
      paymentDate: i < 5 ? new Date(2024, 2 + i, 1).toISOString().split('T')[0] : undefined,
    })),
    totalPaidAmount: 250 * 5,
    remainingBalance: 10000 - (250*5),
    createdAt: '2024-01-10',
    notes: 'سلفة إسكانية حسب سياسة الشركة الداخلية.'
  },
];

interface LoanFormProps {
  initialData?: Partial<Loan> | null;
  onSubmit: (data: Loan) => void;
  onCancel: () => void;
  employees: Pick<Employee, 'id' | 'fullNameAr' | 'employeeId'>[];
}

const LoanForm: React.FC<LoanFormProps> = ({ initialData, onSubmit, onCancel, employees }) => {
  const [formData, setFormData] = useState<Partial<Loan>>(
    initialData || {
      employeeId: employees.length > 0 ? employees[0].id : '',
      loanType: LoanType.PERSONAL,
      loanAmount: 0,
      requestDate: new Date().toISOString().split('T')[0],
      repaymentStartDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Next month
      numberOfInstallments: 12,
      monthlyInstallment: 0,
      status: LoanStatus.PENDING_APPROVAL,
      installments: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  useEffect(() => {
    if (formData.loanAmount && formData.numberOfInstallments && formData.numberOfInstallments > 0) {
        setFormData(prev => ({ ...prev, monthlyInstallment: parseFloat((prev.loanAmount! / prev.numberOfInstallments!).toFixed(3)) }));
    } else if (formData.loanAmount && formData.monthlyInstallment && formData.monthlyInstallment > 0) {
        // Auto-calculate number of installments if monthly is set and number of installments is not (or 0)
        // setFormData(prev => ({ ...prev, numberOfInstallments: Math.ceil(prev.loanAmount! / prev.monthlyInstallment!) }));
    }
  }, [formData.loanAmount, formData.numberOfInstallments, formData.monthlyInstallment]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = ['loanAmount', 'numberOfInstallments', 'monthlyInstallment', 'interestRate'].includes(name) ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.loanAmount || formData.loanAmount <= 0 || !formData.numberOfInstallments || formData.numberOfInstallments <= 0) {
        alert("يرجى ملء الحقول الإلزامية بشكل صحيح: الموظف، مبلغ القرض، وعدد الأقساط.");
        return;
    }
    
    let finalInstallments = formData.installments || [];
    if ((formData.status === LoanStatus.APPROVED || formData.status === LoanStatus.ACTIVE) && finalInstallments.length === 0 && formData.repaymentStartDate && formData.numberOfInstallments && formData.monthlyInstallment) {
        const startDate = new Date(formData.repaymentStartDate);
        for (let i = 0; i < formData.numberOfInstallments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            finalInstallments.push({
                id: `new-inst-${Date.now()}-${i}`,
                installmentNumber: i + 1,
                dueDate: dueDate.toISOString().split('T')[0],
                amountDue: formData.monthlyInstallment,
                status: InstallmentStatus.UPCOMING,
            });
        }
    }
    
    const employee = employees.find(emp => emp.id === formData.employeeId);

    onSubmit({ 
        ...formData, 
        employeeName: employee?.fullNameAr || 'غير معروف', 
        installments: finalInstallments,
        updatedAt: new Date().toISOString().split('T')[0]
    } as Loan);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
      <Card title="تفاصيل طلب القرض" titleClassName="text-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="الموظف" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
          <Select label="نوع القرض" name="loanType" value={formData.loanType} options={loanTypeOptions} onChange={handleChange} required />
        </div>
        <Input label="الغرض من القرض" name="purpose" value={formData.purpose || ''} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="مبلغ القرض (د.ك)" name="loanAmount" type="number" value={String(formData.loanAmount || 0)} onChange={handleChange} required step="0.001" />
          <Input label="تاريخ الطلب" name="requestDate" type="date" value={formData.requestDate} onChange={handleChange} required />
        </div>
      </Card>
      <Card title="تفاصيل السداد" titleClassName="text-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="تاريخ بدء السداد" name="repaymentStartDate" type="date" value={formData.repaymentStartDate} onChange={handleChange} required />
          <Input label="عدد الأقساط" name="numberOfInstallments" type="number" value={String(formData.numberOfInstallments || 0)} onChange={handleChange} required />
          <Input label="القسط الشهري (د.ك)" name="monthlyInstallment" type="number" value={String(formData.monthlyInstallment || 0)} onChange={handleChange} required step="0.001" disabled={!!(formData.loanAmount && formData.numberOfInstallments)} className={ (formData.loanAmount && formData.numberOfInstallments) ? "bg-gray-100" : ""}/>
        </div>
      </Card>
      <Card title="الكفيل (اختياري)" titleClassName="text-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="اسم الكفيل" name="guarantorName" value={formData.guarantorName || ''} onChange={handleChange} />
            <Input label="الرقم المدني للكفيل" name="guarantorCivilId" value={formData.guarantorCivilId || ''} onChange={handleChange} />
        </div>
      </Card>
      <Card title="الحالة والملاحظات" titleClassName="text-md">
        <Select label="حالة القرض" name="status" value={formData.status} options={loanStatusOptions} onChange={handleChange} />
        <TextArea label="ملاحظات إضافية" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} />
      </Card>
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary">{formData.id ? 'حفظ التعديلات' : 'إضافة طلب قرض'}</Button>
      </div>
    </form>
  );
};

const LoanDetailsModal: React.FC<{
    loan: Loan | null;
    onClose: () => void;
    onRecordPayment: (loanId: string, installmentId: string, paymentDate: string, amountPaid: number) => void;
    onPrint: (loan: Loan) => void;
}> = ({ loan, onClose, onRecordPayment, onPrint }) => {
    if (!loan) return null;
    
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [amountPaid, setAmountPaid] = useState('');
    const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);

    const handleRecordPaymentSubmit = () => {
        if (selectedInstallmentId && paymentDate && parseFloat(amountPaid) > 0) {
            onRecordPayment(loan.id, selectedInstallmentId, paymentDate, parseFloat(amountPaid));
            setSelectedInstallmentId(null);
            setAmountPaid('');
        } else {
            alert("يرجى تحديد القسط وإدخال تاريخ ومبلغ الدفع بشكل صحيح.");
        }
    };
    
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

    return (
        <Modal isOpen={!!loan} onClose={onClose} title={`تفاصيل القرض لموظف: ${loan.employeeName}`} size="xl">
            <div className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                <Card title="ملخص القرض" className="bg-gray-50" titleClassName="text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <p><strong>نوع القرض:</strong> {loan.loanType}</p>
                        <p><strong>المبلغ:</strong> {loan.loanAmount.toFixed(3)} د.ك</p>
                        <p><strong>الغرض:</strong> {loan.purpose || '-'}</p>
                        <p><strong>تاريخ الطلب:</strong> {formatDate(loan.requestDate)}</p>
                        <p><strong>تاريخ الموافقة:</strong> {formatDate(loan.approvalDate)}</p>
                        <p><strong>تاريخ الصرف:</strong> {formatDate(loan.disbursementDate)}</p>
                        <p><strong>بدء السداد:</strong> {formatDate(loan.repaymentStartDate)}</p>
                        <p><strong>عدد الأقساط:</strong> {loan.numberOfInstallments}</p>
                        <p><strong>القسط الشهري:</strong> {loan.monthlyInstallment.toFixed(3)} د.ك</p>
                        <p><strong>الحالة:</strong> <LoanStatusBadge status={loan.status} size="sm"/></p>
                        <p><strong>المسدد:</strong> {(loan.totalPaidAmount || 0).toFixed(3)} د.ك</p>
                        <p><strong>المتبقي:</strong> {(loan.remainingBalance || loan.loanAmount).toFixed(3)} د.ك</p>
                    </div>
                </Card>

                <Card title="جدول الأقساط" titleClassName="text-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    {['#', 'الاستحقاق', 'المبلغ المستحق', 'المبلغ المدفوع', 'تاريخ الدفع', 'الحالة', 'تسجيل سداد'].map(h => <th key={h} className="px-2 py-2 text-right font-medium">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {loan.installments.map(inst => (
                                    <tr key={inst.id} className={inst.status === InstallmentStatus.OVERDUE ? 'bg-red-50' : ''}>
                                        <td className="px-2 py-1">{inst.installmentNumber}</td>
                                        <td className="px-2 py-1">{formatDate(inst.dueDate)}</td>
                                        <td className="px-2 py-1">{inst.amountDue.toFixed(3)} د.ك</td>
                                        <td className="px-2 py-1">{(inst.amountPaid || 0).toFixed(3)} د.ك</td>
                                        <td className="px-2 py-1">{formatDate(inst.paymentDate)}</td>
                                        <td className="px-2 py-1"><InstallmentStatusBadge status={inst.status} /></td>
                                        <td className="px-2 py-1">
                                            {(inst.status === InstallmentStatus.PENDING || inst.status === InstallmentStatus.OVERDUE || inst.status === InstallmentStatus.UPCOMING) && (
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedInstallmentId(inst.id); setAmountPaid(inst.amountDue.toFixed(3)) }}>
                                                    تسجيل
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {selectedInstallmentId && (
                        <div className="mt-4 p-3 border rounded-md bg-gray-50 space-y-2">
                            <h4 className="font-semibold text-sm">تسجيل سداد للقسط رقم: {loan.installments.find(i=>i.id === selectedInstallmentId)?.installmentNumber}</h4>
                            <div className="flex items-end gap-2">
                                <Input label="تاريخ الدفع" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} containerClassName="flex-grow mb-0" />
                                <Input label="المبلغ المدفوع" type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} step="0.001" containerClassName="w-32 mb-0" />
                                <Button onClick={handleRecordPaymentSubmit} size="sm">تأكيد الدفع</Button>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedInstallmentId(null)}>إلغاء</Button>
                            </div>
                        </div>
                    )}
                </Card>
                 <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={() => onPrint(loan)}>طباعة ملخص/اتفاقية القرض</Button>
                </div>
            </div>
        </Modal>
    );
};

const PrintableLoanAgreementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}> = ({ isOpen, onClose, loan }) => {
  if (!isOpen || !loan) return null;

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
  const formatCurrency = (num: number) => `${num.toFixed(3)} د.ك`;
  const employeeDetails = mockEmployees.find(e => e.id === loan.employeeId);
  const companyName = "[اسم الشركة/صاحب العمل]"; // Placeholder - should come from settings or a general state

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="نموذج اتفاقية قرض موظف" size="lg">
      <div id="printable-loan-agreement-content" className="p-4 print-statement">
        <style>{`
            .print-statement h2 { font-size: 1.3rem; font-weight: bold; text-align: center; margin-bottom: 1rem; color: #0D47A1; }
            .print-statement h3 { font-size: 1rem; font-weight: bold; margin-top: 0.7rem; margin-bottom: 0.3rem; color: #1976D2; }
            .print-statement p { margin-bottom: 0.4rem; font-size: 0.9rem; line-height: 1.6; }
            .print-statement strong { font-weight: 600; }
            .print-statement .signature-area { margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #ccc; display: flex; justify-content: space-around; }
            .print-statement .signature-block { margin-top: 1rem; text-align: center; }
            .print-statement .signature-block p { margin-bottom: 1.5rem; }
            .print-statement ul { list-style-type: disc; padding-right: 20px; /* RTL padding */ }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print-hide-in-modal { display: none !important; }
              #printable-loan-agreement-content { font-size: 10pt; }
            }
        `}</style>
        <h2>نموذج اتفاقية قرض موظف</h2>
        
        <p><strong>الطرف الأول:</strong> {companyName} (يشار إليه فيما بعد "الشركة")</p>
        <p><strong>الطرف الثاني:</strong> السيد/ {loan.employeeName} (يشار إليه فيما بعد "الموظف")</p>
        <p>الرقم المدني للموظف: {employeeDetails?.civilId || 'غير متوفر'}</p>
        <p>الوظيفة: {employeeDetails?.jobTitle || 'غير متوفر'}</p>

        <h3>تمهيد:</h3>
        <p>
            بناءً على طلب الموظف المؤرخ في {formatDate(loan.requestDate)}، وافقت الشركة على منحه قرضًا حسنًا بدون فوائد وفقًا للشروط والأحكام الموضحة في هذه الاتفاقية، وذلك استنادًا إلى سياسة الشركة الداخلية وأحكام قانون العمل الكويتي رقم 6 لسنة 2010 فيما يتعلق بسلف الموظفين.
        </p>

        <h3>بنود الاتفاقية:</h3>
        <p><strong>1. مبلغ القرض:</strong> وافقت الشركة على منح الموظف قرضًا حسنًا بمبلغ إجمالي وقدره <strong>{formatCurrency(loan.loanAmount)}</strong> (فقط {loan.loanAmount.toFixed(3)} دينار كويتي لا غير).</p>
        <p><strong>2. الغرض من القرض:</strong> {loan.purpose || "أغراض شخصية"}.</p>
        <p><strong>3. تاريخ صرف القرض:</strong> يتوقع صرف مبلغ القرض للموظف في تاريخ {formatDate(loan.disbursementDate || loan.approvalDate)} أو في أقرب وقت ممكن بعد توقيع هذه الاتفاقية.</p>
        <p><strong>4. طريقة السداد:</strong> يلتزم الموظف بسداد مبلغ القرض كاملاً للشركة عن طريق خصم شهري من راتبه على النحو التالي:</p>
        <ul>
            <li>عدد الأقساط: <strong>{loan.numberOfInstallments}</strong> أقساط شهرية متتالية.</li>
            <li>قيمة القسط الشهري: <strong>{formatCurrency(loan.monthlyInstallment)}</strong>.</li>
            <li>تاريخ استحقاق القسط الأول: <strong>{formatDate(loan.repaymentStartDate)}</strong>.</li>
            <li>تستمر الأقساط في نفس اليوم من كل شهر ميلادي تالٍ حتى سداد كامل مبلغ القرض.</li>
        </ul>
        <p><strong>5. الالتزامات والإقرارات:</strong></p>
        <ul>
            <li>يقر الموظف بأنه مدين للشركة بكامل مبلغ القرض المذكور أعلاه، ويتعهد بسداده وفقًا للشروط الموضحة.</li>
            <li>يوافق الموظف على أن تقوم الشركة بخصم قيمة القسط الشهري مباشرة من راتبه المستحق.</li>
            <li>في حالة انتهاء خدمة الموظف لدى الشركة لأي سبب من الأسباب قبل سداد كامل مبلغ القرض، يحق للشركة خصم الرصيد المتبقي من القرض من أي مستحقات نهاية خدمة أو أي مبالغ أخرى مستحقة للموظف لدى الشركة.</li>
            <li>في حال عدم كفاية المستحقات لتغطية الرصيد المتبقي من القرض، يلتزم الموظف بسداد المبلغ المتبقي فورًا للشركة بالطريقة التي تحددها الشركة.</li>
            <li>لا يترتب على هذا القرض أي فوائد أو رسوم إضافية على الموظف.</li>
        </ul>
        <p><strong>6. القانون الواجب التطبيق:</strong> يخضع هذا الاتفاق ويفسر وفقًا لقوانين دولة الكويت.</p>
        <p><strong>7. الإقرار:</strong> يقر الطرفان بأهليتهما الكاملة للتعاقد والتصرف، وبأن هذا الاتفاق ملزم لهما ولخلفهما العام والخاص، وأنهما قد اطلعا على كافة بنوده وفهماها فهماً نافياً للجهالة.</p>
        <p>حُرر هذا الاتفاق من نسختين، بيد كل طرف نسخة للعمل بموجبها.</p>

        <div className="signature-area">
            <div className="signature-block"><p>توقيع الموظف (الطرف الثاني):</p> ........................................ <br/> <small>الاسم: {loan.employeeName}</small> <br/> <small>التاريخ: ____/____/____</small></div>
            <div className="signature-block"><p>توقيع ممثل الشركة (الطرف الأول):</p> ........................................ <br/> <small>الاسم: [اسم ممثل الشركة]</small> <br/> <small>المنصب: [منصب ممثل الشركة]</small> <br/> <small>التاريخ: ____/____/____</small></div>
        </div>
        {loan.guarantorName && (
          <>
            <h3 style={{marginTop: '1.5rem'}}>الكفيل (إن وجد):</h3>
            <p>أنا الموقع أدناه، السيد/ {loan.guarantorName}، حامل البطاقة المدنية رقم ({loan.guarantorCivilId || 'غير محدد'})، أكفل الموظف المذكور أعلاه في سداد هذا القرض للشركة وفقًا للشروط الواردة في هذه الاتفاقية، وأتحمل المسؤولية التضامنية معه في حالة تخلفه عن السداد.</p>
            <div className="signature-area" style={{justifyContent: 'center', borderTop: 'none', paddingTop: '0.5rem'}}>
                 <div className="signature-block"><p>توقيع الكفيل:</p> ........................................ <br/> <small>الاسم: {loan.guarantorName}</small> <br/> <small>التاريخ: ____/____/____</small></div>
            </div>
          </>
        )}
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>تاريخ تحرير الاتفاقية: {formatDate(loan.approvalDate || loan.requestDate)}</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print-hide-in-modal">
        <Button variant="outline" onClick={onClose} className="me-2">إغلاق</Button>
        <Button variant="primary" onClick={() => window.print()}>طباعة النموذج</Button>
      </div>
    </Modal>
  );
};


const LoanManagementPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoanStatus | ''>('');
  const [filterType, setFilterType] = useState<LoanType | ''>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Partial<Loan> | null>(null);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
  const [isPrintAgreementModalOpen, setIsPrintAgreementModalOpen] = useState(false);
  const [loanToPrint, setLoanToPrint] = useState<Loan | null>(null);


  const filteredLoans = useMemo(() => {
    return loans.filter(loan =>
      (loan.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (mockEmployees.find(e => e.id === loan.employeeId)?.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? loan.status === filterStatus : true) &&
      (filterType ? loan.loanType === filterType : true)
    ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [loans, searchTerm, filterStatus, filterType]);
  
  const handleAddLoan = () => {
    setEditingLoan(null);
    setIsFormModalOpen(true);
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setIsFormModalOpen(true);
  };

  const handleViewLoan = (loan: Loan) => {
    setViewingLoan(loan);
  };
  
  const handleDeleteLoan = useCallback((loanId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا القرض؟ سيتم حذف جميع سجلات الأقساط المرتبطة به.')) {
        setLoans(prev => prev.filter(l => l.id !== loanId));
    }
  }, []);

  const handleFormSubmit = (data: Loan) => {
    let updatedLoans;
    if (editingLoan && editingLoan.id) {
      updatedLoans = loans.map(l => l.id === editingLoan.id ? { ...data, id: l.id, createdAt: l.createdAt } : l);
    } else {
      updatedLoans = [{ ...data, id: `loan-${Date.now()}` }, ...loans];
    }
    setLoans(updatedLoans);
    setIsFormModalOpen(false);
    setEditingLoan(null);
    if (viewingLoan && viewingLoan.id === data.id) {
        setViewingLoan(updatedLoans.find(l => l.id === data.id) || null);
    }
  };
  
  const handleRecordPayment = (loanId: string, installmentId: string, paymentDate: string, amountPaid: number) => {
    setLoans(prevLoans => prevLoans.map(loan => {
        if (loan.id === loanId) {
            const updatedInstallments = loan.installments.map(inst => {
                if (inst.id === installmentId) {
                    return { ...inst, amountPaid, paymentDate, status: amountPaid >= inst.amountDue ? InstallmentStatus.PAID : InstallmentStatus.PARTIALLY_PAID };
                }
                return inst;
            });
            const totalPaid = updatedInstallments.reduce((sum, inst) => sum + (inst.amountPaid || 0), 0);
            const remaining = loan.loanAmount - totalPaid;
            const newStatus = remaining <= 0 ? LoanStatus.PAID_IN_FULL : loan.status;

            return { ...loan, installments: updatedInstallments, totalPaidAmount: totalPaid, remainingBalance: remaining, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return loan;
    }));
  };

  const handleOpenPrintAgreement = (loan: Loan) => {
    setLoanToPrint(loan);
    setIsPrintAgreementModalOpen(true);
  };
  
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <CurrencyDollarIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">إدارة قروض وسلف الموظفين</h1>
        </div>
        <Button onClick={handleAddLoan} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إضافة طلب قرض
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">ملاحظة قانونية (قانون العمل الكويتي رقم 6 لسنة 2010)</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    <strong>المادة 32:</strong> لا يجوز اقتطاع أكثر من (10%) من أجر العامل وفاء لديون أو قروض مستحقة لصاحب العمل ولا يتقاضى عنها صاحب العمل أي فائدة. ويسري ذات الحكم على أجور العمال الموزعين.
                    <br/>
                    يستثنى من ذلك قروض بناء أو ترميم المساكن فيجوز لصاحب العمل اقتطاع نسبة لا تتجاوز (25%) من أجر العامل وفاء لهذه القروض.
                </p>
                <p className="text-xs text-blue-500 mt-1">تهدف هذه الوحدة إلى مساعدتك في تتبع القروض والسلف المقدمة للموظفين مع مراعاة هذه الأحكام.</p>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input placeholder="ابحث بالاسم أو الرقم الوظيفي..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select label="تصفية بالحالة" options={[{value: '', label: 'الكل'}, ...loanStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as LoanStatus | '')} containerClassName="mb-0"/>
            <Select label="تصفية بالنوع" options={[{value: '', label: 'الكل'}, ...loanTypeOptions]} value={filterType} onChange={e => setFilterType(e.target.value as LoanType | '')} containerClassName="mb-0"/>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {['اسم الموظف', 'نوع القرض', 'المبلغ', 'الحالة', 'المتبقي', 'القسط التالي', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLoans.map(loan => {
                        const nextUnpaidInstallment = loan.installments.find(i => i.status === InstallmentStatus.PENDING || i.status === InstallmentStatus.UPCOMING || i.status === InstallmentStatus.OVERDUE);
                        return (
                            <tr key={loan.id} className="hover:bg-primary-light/5">
                                <td className="px-3 py-2 whitespace-nowrap font-medium">{loan.employeeName}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{loan.loanType}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{loan.loanAmount.toFixed(3)} د.ك</td>
                                <td className="px-3 py-2 whitespace-nowrap"><LoanStatusBadge status={loan.status}/></td>
                                <td className="px-3 py-2 whitespace-nowrap">{(loan.remainingBalance || loan.loanAmount).toFixed(3)} د.ك</td>
                                <td className="px-3 py-2 whitespace-nowrap">{nextUnpaidInstallment ? formatDate(nextUnpaidInstallment.dueDate) : 'مسدد'}</td>
                                <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewLoan(loan)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditLoan(loan)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLoan(loan.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredLoans.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>لا توجد قروض تطابق بحثك.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingLoan(null);}} title={editingLoan?.id ? `تعديل قرض: ${editingLoan.employeeName}` : "إضافة طلب قرض جديد"} size="xl">
          <LoanForm initialData={editingLoan} onSubmit={handleFormSubmit} onCancel={() => { setIsFormModalOpen(false); setEditingLoan(null); }} employees={mockEmployees} />
      </Modal>
      
      <LoanDetailsModal 
        loan={viewingLoan} 
        onClose={() => setViewingLoan(null)} 
        onRecordPayment={handleRecordPayment}
        onPrint={handleOpenPrintAgreement}
      />

      <PrintableLoanAgreementModal
        isOpen={isPrintAgreementModalOpen}
        onClose={() => setIsPrintAgreementModalOpen(false)}
        loan={loanToPrint}
      />

    </div>
  );
};

export default LoanManagementPage;
