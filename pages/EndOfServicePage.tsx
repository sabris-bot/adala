import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { CalculatorIcon, PlusCircleIcon, TrashIcon } from '../constants';
import { ContractTypeKuwait, TerminationReasonKuwait, FinancialItem } from '../types';
import { contractTypeKuwaitOptions, terminationReasonKuwaitOptions } from '../constants';

// Structure for detailed calculation results for printing
interface ExtendedCalculationResult {
  companyName: string;
  employeeName: string;
  employeeCivilId: string;
  employeeJobTitle: string;
  joiningDate: string;
  lastWorkDate: string;
  basicSalary: number;
  allowancesSubjectToIndemnity: number;
  contractType: ContractTypeKuwait;
  terminationReason: TerminationReasonKuwait;
  
  annualLeaveEntitlementPerYear: number; // Added for clarity in results
  totalAccruedLeaveDays: number;
  leaveDaysAlreadyTaken: number;
  otherDues: FinancialItem[];
  deductions: FinancialItem[];
  
  serviceYears: number;
  serviceMonths: number;
  serviceDays: number;
  calculationSalary: number;
  
  indemnityForFirst5Years: number;
  indemnityForSubsequentYears: number;
  grossIndemnityBeforeCap: number;
  appliedCapAmount?: number; 
  grossIndemnityAfterCap: number;
  terminationAdjustmentFactor: number;
  adjustedIndemnity: number;
  
  netLeaveBalanceDays: number;
  leaveDayValue: number;
  leaveEncashmentValue: number;
  
  totalOtherDuesValue: number;
  totalDeductionsValue: number;
  
  netPayableAmount: number;
  
  warnings: string[];
  notesOnCalculation?: string[];
}

const tafqeet = (num: number): string => {
  // Basic placeholder for Tafqeet - A full library is needed for production
  const numStr = num.toFixed(3);
  const parts = numStr.split('.');
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parts[1] || "000";

  const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  let integerWords = "";
  if (isNaN(integerPart)) return "خطأ في تحويل الرقم";
  if (integerPart === 0) integerWords = "صفر";
  else if (integerPart < 10) integerWords = units[integerPart];
  else if (integerPart < 20) { 
    if (integerPart === 10) integerWords = "عشرة";
    else if (integerPart === 11) integerWords = "أحد عشر";
    else if (integerPart === 12) integerWords = "اثنا عشر";
    else integerWords = units[integerPart % 10] + " " + tens[1];
  } else if (integerPart < 100) {
    const unitWord = units[integerPart % 10] || "";
    const tenWord = tens[Math.floor(integerPart / 10)] || "";
    integerWords = unitWord + (unitWord && tenWord ? " و" : "") + tenWord;
  } else if (integerPart < 1000) { 
    integerWords = hundreds[Math.floor(integerPart / 100)];
    if (integerPart % 100 !== 0) {
        const remainderTafqeet = tafqeet(integerPart % 100).split(" دينار")[0].trim(); // Recursive call, extract only number words
        if (remainderTafqeet !== "خطأ في تحويل الرقم" && remainderTafqeet !== "صفر") {
             integerWords += " و " + remainderTafqeet;
        }
    }
  } else { 
      integerWords = `${integerPart.toLocaleString('ar-EG')}`; 
  }
  
  return `${integerPart.toLocaleString('ar-EG')} دينار كويتي و ${decimalPart} فلسًا. (فقط ${integerWords} دينار كويتي و ${decimalPart} فلسًا لا غير)`;
};

const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} د.ك`;
};


const PrintableStatementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  result: ExtendedCalculationResult | null;
}> = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
        return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateString; }
  };

  const _formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} د.ك`;
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="كشف حساب التسوية النهائية لمستحقات نهاية الخدمة" size="xl">
      <div id="printable-statement-content-wrapper"> 
        <div id="printable-statement-content" className="p-4 print-statement">
          <style>
            {`
              .print-statement h2 { font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 1rem; color: #0D47A1; }
              .print-statement h3 { font-size: 1.1rem; font-weight: bold; margin-top: 0.8rem; margin-bottom: 0.4rem; color: #1976D2; border-bottom: 1px solid #eee; padding-bottom: 0.2rem; }
              .print-statement p, .print-statement li { margin-bottom: 0.3rem; font-size: 0.9rem; line-height: 1.6; }
              .print-statement strong { font-weight: 600; color: #333; }
              .print-statement .section-block { background-color: #f9f9f9; padding: 0.8rem; border-radius: 6px; margin-bottom: 0.8rem; border: 1px solid #e0e0e0;}
              .print-statement .grid-display { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.8rem; }
              .print-statement .signature-area { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed #ccc; }
              .print-statement .signature-block { margin-top: 1.5rem; text-align: center; }
              .print-statement .signature-block p { margin-bottom: 2rem; }
              .print-statement table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.85rem; }
              .print-statement th, .print-statement td { border: 1px solid #ddd; padding: 6px; text-align: right; }
              .print-statement th { background-color: #f0f0f0; font-weight: bold; }
              .print-statement .total-payable { font-size: 1.3rem; font-weight: bold; color: #4CAF50; text-align: center; padding: 1rem; background-color: #e8f5e9; border-radius: 6px; margin-top: 1rem;}
              .print-statement .legal-text { font-size: 0.8rem; line-height: 1.5; margin-top: 1rem; text-align: justify; }
              .print-statement .warnings-block { border: 1px solid #FFC107; background-color: #FFF9C4; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-top:0.5rem; }
              .print-statement .calculation-notes-block { border: 1px solid #2196F3; background-color: #E3F2FD; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-top:0.5rem; }
            `}
          </style>
          <h2>كشف حساب التسوية النهائية لمستحقات نهاية الخدمة</h2>
          
          <div className="section-block">
              <h3>معلومات الشركة والموظف</h3>
              <div className="grid-display">
                  <p><strong>اسم الشركة/صاحب العمل:</strong> {result.companyName}</p>
                  <p><strong>اسم الموظف:</strong> {result.employeeName}</p>
                  <p><strong>الرقم المدني للموظف:</strong> {result.employeeCivilId}</p>
                  <p><strong>المسمى الوظيفي:</strong> {result.employeeJobTitle}</p>
                  <p><strong>تاريخ الالتحاق بالعمل:</strong> {formatDate(result.joiningDate)}</p>
                  <p><strong>تاريخ آخر يوم عمل:</strong> {formatDate(result.lastWorkDate)}</p>
                  <p><strong>مدة الخدمة:</strong> {result.serviceYears} سنوات و {result.serviceMonths} أشهر و {result.serviceDays} أيام</p>
              </div>
          </div>

          <div className="section-block">
              <h3>تفاصيل الراتب المعتمد لحساب المستحقات</h3>
              <div className="grid-display">
                  <p><strong>الراتب الأساسي الشهري:</strong> {_formatCurrency(result.basicSalary)}</p>
                  <p><strong>البدلات الخاضعة للمكافأة:</strong> {_formatCurrency(result.allowancesSubjectToIndemnity)}</p>
                  <p><strong>إجمالي الراتب المعتمد للحساب:</strong> {_formatCurrency(result.calculationSalary)}</p>
              </div>
          </div>
          
          <div className="section-block">
              <h3>أولاً: حساب مكافأة نهاية الخدمة</h3>
              <p><strong>نوع العقد:</strong> {contractTypeKuwaitOptions.find(opt => opt.value === result.contractType)?.label}</p>
              <p><strong>سبب إنهاء الخدمة:</strong> {terminationReasonKuwaitOptions.find(opt => opt.value === result.terminationReason)?.label}</p>
              <div className="grid-display">
                <p>مكافأة عن الـ 5 سنوات الأولى (أو أقل): {_formatCurrency(result.indemnityForFirst5Years)}</p>
                <p>مكافأة عن السنوات التالية للـ 5 سنوات: {_formatCurrency(result.indemnityForSubsequentYears)}</p>
              </div>
              <p><strong>إجمالي المكافأة قبل تطبيق الحد الأقصى والتعديل:</strong> {_formatCurrency(result.grossIndemnityBeforeCap)}</p>
              {result.appliedCapAmount && <p className="text-danger"><strong>تم تطبيق الحد الأقصى للمكافأة (أجر 18 شهرًا):</strong> {_formatCurrency(result.appliedCapAmount)}</p>}
              <p><strong>إجمالي المكافأة بعد تطبيق الحد الأقصى (إن وجد):</strong> {_formatCurrency(result.grossIndemnityAfterCap)}</p>
              <p><strong>نسبة الاستحقاق بناءً على سبب الإنهاء:</strong> {(result.terminationAdjustmentFactor * 100).toFixed(0)}%</p>
              <p><strong>صافي مكافأة نهاية الخدمة المستحقة:</strong> {_formatCurrency(result.adjustedIndemnity)}</p>
          </div>

          <div className="section-block">
              <h3>ثانياً: حساب مقابل رصيد الإجازات السنوية</h3>
              <div className="grid-display">
                  <p>رصيد الإجازة السنوية الممنوح: {result.annualLeaveEntitlementPerYear} أيام/سنة</p>
                  <p>إجمالي رصيد الإجازات السنوية المستحق: {result.totalAccruedLeaveDays.toFixed(1)} أيام</p>
                  <p>أيام الإجازات السنوية المستخدمة: {result.leaveDaysAlreadyTaken.toFixed(1)} أيام</p>
                  <p><strong>صافي رصيد الإجازات للصرف: {result.netLeaveBalanceDays.toFixed(1)} أيام</strong></p>
                  <p>قيمة يوم الإجازة: {_formatCurrency(result.leaveDayValue)}</p>
              </div>
              <p><strong>إجمالي مقابل رصيد الإجازات السنوية:</strong> {_formatCurrency(result.leaveEncashmentValue)}</p>
          </div>

          {result.otherDues.length > 0 && (
              <div className="section-block">
                  <h3>ثالثاً: المستحقات الأخرى للموظف</h3>
                  <table>
                      <thead><tr><th>اسم البند</th><th>المبلغ (د.ك)</th></tr></thead>
                      <tbody>
                          {result.otherDues.map(due => (
                              <tr key={due.id}><td>{due.name}</td><td>{due.amount.toFixed(3)}</td></tr>
                          ))}
                      </tbody>
                      <tfoot><tr><th>الإجمالي</th><th>{result.totalOtherDuesValue.toFixed(3)}</th></tr></tfoot>
                  </table>
              </div>
          )}

          {result.deductions.length > 0 && (
              <div className="section-block">
                  <h3>رابعاً: الخصومات المستحقة للشركة</h3>
                  <table>
                      <thead><tr><th>اسم البند (قرض، سلفة، إلخ)</th><th>المبلغ (د.ك)</th></tr></thead>
                      <tbody>
                          {result.deductions.map(ded => (
                              <tr key={ded.id}><td>{ded.name}</td><td>{ded.amount.toFixed(3)}</td></tr>
                          ))}
                      </tbody>
                      <tfoot><tr><th>الإجمالي</th><th>{result.totalDeductionsValue.toFixed(3)}</th></tr></tfoot>
                  </table>
              </div>
          )}
          
          <div className="total-payable">
              صافي المبلغ الإجمالي المستحق للدفع: {_formatCurrency(result.netPayableAmount)}
              <br />
              ({tafqeet(result.netPayableAmount)})
          </div>

          {result.notesOnCalculation && result.notesOnCalculation.length > 0 && (
            <div className="calculation-notes-block">
              <p className="font-semibold">ملاحظات على الحساب:</p>
              <ul className="list-disc ps-5">
                {result.notesOnCalculation.map((note, idx) => <li key={idx}>{note}</li>)}
              </ul>
            </div>
          )}
           {result.warnings && result.warnings.length > 0 && (
            <div className="warnings-block">
              <p className="font-semibold">تنبيهات وملاحظات قانونية:</p>
              <ul className="list-disc ps-5">
                {result.warnings.map((warn, idx) => <li key={idx}>{warn}</li>)}
              </ul>
            </div>
          )}

          <div className="legal-text section-block">
              <h3>إقرار استلام وإبراء ذمة</h3>
              <p>
                  أقر أنا الموقع أدناه، <strong>{result.employeeName}</strong>، الحامل للبطاقة المدنية رقم <strong>{result.employeeCivilId}</strong>، بأنني قد استلمت كافة مستحقاتي المالية المترتبة عن فترة عملي لدى <strong>{result.companyName || '[اسم الشركة/صاحب العمل]'}</strong>، وذلك بمبلغ إجمالي وقدره <strong>{_formatCurrency(result.netPayableAmount)} ({tafqeet(result.netPayableAmount)})</strong>، وذلك عن الفترة من تاريخ {formatDate(result.joiningDate)} وحتى تاريخ {formatDate(result.lastWorkDate)}.
              </p>
              <p>
                  وأقر بموجب هذا الإقرار بأنني أبرئ ذمة <strong>{result.companyName || '[اسم الشركة/صاحب العمل]'}</strong> إبراءً شاملاً ونهائياً ومانعاً للجهالة عن كافة حقوقي ومستحقاتي العمالية أياً كانت طبيعتها أو نوعها، سواء كانت ناتجة عن عقد العمل أو القانون، بما في ذلك على سبيل المثال لا الحصر: مكافأة نهاية الخدمة، وبدل الإجازات، وأي أجور أو بدلات أو تعويضات أخرى، وأنني لا أملك أي مطالبات حالية أو مستقبلية تجاه الشركة فيما يتعلق بفترة عملي المذكورة أعلاه. وهذا إقرار مني بذلك، وأنا بكامل قواي العقلية والجسدية المعتبرة شرعاً وقانوناً.
              </p>
          </div>

          <div className="signature-area grid-display">
              <div className="signature-block"><p>توقيع العامل:</p> ........................................</div>
              <div className="signature-block"><p>توقيع ممثل الشركة:</p> ........................................</div>
              <div className="signature-block"><p>الشؤون القانونية:</p> ........................................</div>
              <div className="signature-block"><p>الإدارة المالية:</p> ........................................</div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>التاريخ: ____ / ____ / ________ م</p>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print-hide-in-modal">
        <Button variant="outline" onClick={onClose} className="me-2">إغلاق</Button>
        <Button variant="primary" onClick={() => window.print()}>طباعة الكشف</Button>
      </div>
    </Modal>
  );
};


const EndOfServicePage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeCivilId, setEmployeeCivilId] = useState('');
  const [employeeJobTitle, setEmployeeJobTitle] = useState('');
  
  const [joiningDate, setJoiningDate] = useState('');
  const [lastWorkDate, setLastWorkDate] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [allowancesSubjectToIndemnity, setAllowancesSubjectToIndemnity] = useState('0');
  const [contractType, setContractType] = useState<ContractTypeKuwait>(ContractTypeKuwait.UNLIMITED);
  const [terminationReason, setTerminationReason] = useState<TerminationReasonKuwait>(TerminationReasonKuwait.COMPANY_TERMINATION_UNJUSTIFIED);
  
  const [annualLeaveEntitlementPerYear, setAnnualLeaveEntitlementPerYear] = useState('30');
  const [totalAccruedLeaveDaysDisplay, setTotalAccruedLeaveDaysDisplay] = useState('0'); // Read-only, calculated
  const [leaveDaysAlreadyTaken, setLeaveDaysAlreadyTaken] = useState('0');
  const [netLeaveBalanceDisplay, setNetLeaveBalanceDisplay] = useState('0');


  const [otherDues, setOtherDues] = useState<FinancialItem[]>([]);
  const [currentDueName, setCurrentDueName] = useState('');
  const [currentDueAmount, setCurrentDueAmount] = useState('');

  const [deductions, setDeductions] = useState<FinancialItem[]>([]);
  const [currentDeductionName, setCurrentDeductionName] = useState('');
  const [currentDeductionAmount, setCurrentDeductionAmount] = useState('');

  const [calculationResult, setCalculationResult] = useState<ExtendedCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceDuration, setServiceDuration] = useState<{ years: number, months: number, days: number, totalYears: number } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (joiningDate && lastWorkDate) {
      const startDate = new Date(joiningDate);
      const endDate = new Date(lastWorkDate);

      if (startDate > endDate) {
        setError("تاريخ نهاية الخدمة يجب أن يكون بعد تاريخ الالتحاق.");
        setServiceDuration(null);
        setTotalAccruedLeaveDaysDisplay('0');
        return;
      }
      setError(null);

      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();

      if (days < 0) {
        months--;
        const prevMonthLastDay = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        days += prevMonthLastDay;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      
      days +=1; 
      let currentMonthDays = new Date(startDate.getFullYear() + years, startDate.getMonth() + months +1, 0).getDate();
      if (days >= currentMonthDays) {
          days -= currentMonthDays;
          months++;
          if (months >= 12) {
              months -= 12;
              years++;
          }
      }

      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
      const totalYears = totalDays / 365.25; 

      setServiceDuration({ years, months, days, totalYears });

      // Auto-calculate total accrued leave days
      const annualLeaveEntitlement = parseFloat(annualLeaveEntitlementPerYear) || 0;
      if (annualLeaveEntitlement > 0 && totalYears > 0) {
        setTotalAccruedLeaveDaysDisplay((totalYears * annualLeaveEntitlement).toFixed(1));
      } else {
        setTotalAccruedLeaveDaysDisplay('0');
      }

    } else {
      setServiceDuration(null);
      setTotalAccruedLeaveDaysDisplay('0');
    }
  }, [joiningDate, lastWorkDate, annualLeaveEntitlementPerYear]);

  useEffect(() => {
    const total = parseFloat(totalAccruedLeaveDaysDisplay) || 0;
    const taken = parseFloat(leaveDaysAlreadyTaken) || 0;
    const net = Math.max(0, total - taken);
    setNetLeaveBalanceDisplay(net.toFixed(1)); 
  }, [totalAccruedLeaveDaysDisplay, leaveDaysAlreadyTaken]);

  const handleAddDue = () => {
    if (currentDueName.trim() && parseFloat(currentDueAmount) > 0) {
      setOtherDues([...otherDues, { id: Date.now().toString(), name: currentDueName.trim(), amount: parseFloat(currentDueAmount) }]);
      setCurrentDueName('');
      setCurrentDueAmount('');
    }
  };
  const handleRemoveDue = (id: string) => setOtherDues(otherDues.filter(d => d.id !== id));

  const handleAddDeduction = () => {
    if (currentDeductionName.trim() && parseFloat(currentDeductionAmount) > 0) {
      setDeductions([...deductions, { id: Date.now().toString(), name: currentDeductionName.trim(), amount: parseFloat(currentDeductionAmount) }]);
      setCurrentDeductionName('');
      setCurrentDeductionAmount('');
    }
  };
  const handleRemoveDeduction = (id: string) => setDeductions(deductions.filter(d => d.id !== id));

  const handleCalculate = () => {
    setError(null);
    setCalculationResult(null);
    let currentErrors: string[] = [];

    if (!companyName.trim()) { currentErrors.push("اسم الشركة/صاحب العمل مطلوب."); }
    if (!employeeName.trim()) { currentErrors.push("اسم الموظف بالكامل مطلوب."); }
    if (!employeeCivilId.trim()) { currentErrors.push("الرقم المدني للموظف مطلوب."); }
    if (!employeeJobTitle.trim()) { currentErrors.push("المسمى الوظيفي مطلوب."); }
    if (!joiningDate || !lastWorkDate) { currentErrors.push("تاريخ الالتحاق وتاريخ آخر يوم عمل مطلوبان."); }
    
    const numBasicSalary = parseFloat(basicSalary);
    const numAllowances = parseFloat(allowancesSubjectToIndemnity);
    const numAnnualLeaveEntitlementPerYear = parseFloat(annualLeaveEntitlementPerYear) || 0;
    const numTotalAccruedLeave = parseFloat(totalAccruedLeaveDaysDisplay) || 0;
    const numLeaveTaken = parseFloat(leaveDaysAlreadyTaken) || 0;

    if (isNaN(numBasicSalary) || numBasicSalary <= 0) { currentErrors.push("الراتب الأساسي الشهري مطلوب وبقيمة صحيحة.");}
    if (isNaN(numAllowances) || numAllowances < 0) { currentErrors.push("قيمة البدلات الخاضعة للمكافأة يجب أن تكون رقمًا صحيحًا (أو صفر).");}
    if (isNaN(numAnnualLeaveEntitlementPerYear) || numAnnualLeaveEntitlementPerYear < 0) { currentErrors.push("رصيد الإجازة السنوية (أيام في السنة) يجب أن يكون رقمًا صحيحًا (أو صفر).");}
    if (isNaN(numLeaveTaken) || numLeaveTaken < 0) { currentErrors.push("أيام الإجازات المستخدمة يجب أن تكون رقمًا صحيحًا (أو صفر).");}
    if (numLeaveTaken > numTotalAccruedLeave) { currentErrors.push("أيام الإجازة المستخدمة لا يمكن أن تتجاوز الرصيد الكلي المحسوب.");}


    if (currentErrors.length > 0) {
      setError(currentErrors.join('\n'));
      return;
    }
    
    if (!serviceDuration || serviceDuration.totalYears < 0) {
      setError("يرجى التأكد من صحة تواريخ الخدمة.");
      return;
    }

    const { totalYears, years: sYears, months: sMonths, days: sDays } = serviceDuration;
    const calculationSalary = numBasicSalary + numAllowances;
    let warnings: string[] = [];
    let notesOnCalculation: string[] = [];

    let indemnityForFirst5Years = 0;
    let indemnityForSubsequentYears = 0;

    if (totalYears <= 5) {
      indemnityForFirst5Years = (calculationSalary / 30) * 15 * totalYears;
    } else {
      indemnityForFirst5Years = (calculationSalary / 30) * 15 * 5;
      indemnityForSubsequentYears = calculationSalary * (totalYears - 5);
    }
    let grossIndemnityBeforeCap = indemnityForFirst5Years + indemnityForSubsequentYears;
    
    const maxIndemnity = calculationSalary * 18; 
    let appliedCapAmount: number | undefined = undefined;
    let grossIndemnityAfterCap = grossIndemnityBeforeCap;

    if (grossIndemnityBeforeCap > maxIndemnity) {
        grossIndemnityAfterCap = maxIndemnity;
        appliedCapAmount = maxIndemnity;
        notesOnCalculation.push(`تم تطبيق الحد الأقصى للمكافأة (أجر 18 شهرًا = ${formatCurrency(maxIndemnity)}) وفقًا للمادة 51، حيث كانت المكافأة المحسوبة ${formatCurrency(grossIndemnityBeforeCap)}.`);
    } else {
        notesOnCalculation.push(`المكافأة المحسوبة ${formatCurrency(grossIndemnityBeforeCap)} لم تتجاوز الحد الأقصى (أجر 18 شهرًا).`);
    }
    

    let terminationAdjustmentFactor = 1; 
    const commonResignationNote = "وفقًا للمادة 51 من قانون العمل الكويتي.";
    
    switch (terminationReason) {
        case TerminationReasonKuwait.RESIGNATION_PROBATION:
            terminationAdjustmentFactor = 0;
            warnings.push("مادة 53 (أ): استقالة خلال فترة التجربة لا تستحق مكافأة.");
            break;
        case TerminationReasonKuwait.RESIGNATION_LT_3Y:
            if (contractType === ContractTypeKuwait.UNLIMITED) {
                terminationAdjustmentFactor = 0;
                notesOnCalculation.push(`استقالة من عقد غير محدد المدة وخدمة أقل من 3 سنوات: لا تستحق مكافأة. ${commonResignationNote}`);
            } // Limited contract handled by Art. 52 logic below
            break;
        case TerminationReasonKuwait.RESIGNATION_3_TO_LT_5Y:
            if (contractType === ContractTypeKuwait.UNLIMITED) {
                terminationAdjustmentFactor = 0.5;
                notesOnCalculation.push(`استقالة من عقد غير محدد المدة وخدمة من 3 إلى أقل من 5 سنوات: تستحق نصف المكافأة. ${commonResignationNote}`);
            } // Limited contract handled by Art. 52 logic below
            break;
        case TerminationReasonKuwait.RESIGNATION_5_TO_LT_10Y:
            if (contractType === ContractTypeKuwait.UNLIMITED) {
                terminationAdjustmentFactor = 2/3;
                notesOnCalculation.push(`استقالة من عقد غير محدد المدة وخدمة من 5 إلى أقل من 10 سنوات: تستحق ثلثي المكافأة. ${commonResignationNote}`);
            } // Limited contract: full if >= 5 years, handled by Art. 52 below
            break;
        case TerminationReasonKuwait.RESIGNATION_GE_10Y:
             if (contractType === ContractTypeKuwait.UNLIMITED) {
                terminationAdjustmentFactor = 1;
                notesOnCalculation.push(`استقالة من عقد غير محدد المدة وخدمة 10 سنوات فأكثر: تستحق كامل المكافأة. ${commonResignationNote}`);
            } // Limited contract: full if >= 5 years, handled by Art. 52 below
            break;
        case TerminationReasonKuwait.COMPANY_TERMINATION_JUSTIFIED:
            terminationAdjustmentFactor = 0;
            warnings.push("مادة 41: إنهاء الخدمة بمبرر مشروع لا يستوجب مكافأة.");
            break;
        case TerminationReasonKuwait.FEMALE_MARRIAGE_RESIGNATION:
            terminationAdjustmentFactor = 1;
            notesOnCalculation.push("مادة 53 (ب): استقالة العاملة بسبب الزواج خلال سنة من تاريخه تستحق كامل المكافأة.");
            break;
        case TerminationReasonKuwait.COMPANY_TERMINATION_UNJUSTIFIED:
        case TerminationReasonKuwait.CONTRACT_EXPIRY_LIMITED:
        case TerminationReasonKuwait.RETIREMENT_AGE:
        case TerminationReasonKuwait.DISABILITY_OR_DEATH:
        case TerminationReasonKuwait.FORCE_MAJEURE:
        case TerminationReasonKuwait.OTHER_FULL_ENTITLEMENT:
            terminationAdjustmentFactor = 1; // Full entitlement
            notesOnCalculation.push("الحالة تستوجب كامل المكافأة (إنهاء غير مبرر، انتهاء عقد، تقاعد، عجز/وفاة، أو قوة قاهرة).");
            break;
    }
    
    let adjustedIndemnity = grossIndemnityAfterCap * terminationAdjustmentFactor;

    const isResignationNotSpecial = terminationReason.startsWith("RESIGNATION_") && 
                                  terminationReason !== TerminationReasonKuwait.FEMALE_MARRIAGE_RESIGNATION && 
                                  terminationReason !== TerminationReasonKuwait.RESIGNATION_PROBATION;

    if (contractType === ContractTypeKuwait.LIMITED && isResignationNotSpecial) {
        if (totalYears < 5) {
            terminationAdjustmentFactor = 0; // Override previous factor
            adjustedIndemnity = 0; 
            notesOnCalculation = notesOnCalculation.filter(n => !n.includes("استقالة من عقد")); // Clear previous general resignation notes
            notesOnCalculation.push("مادة 52: استقالة من عقد محدد المدة وخدمة أقل من 5 سنوات لا تستحق مكافأة.");
        } else { // totalYears >= 5
            // Art. 52 implies if service IS 5 years or more, then general rules of Art. 51 apply, which means full indemnity *unless* other reasons for reduction.
            // The "other reasons" are for unlimited contracts. For limited, >=5 years resignation is full.
            terminationAdjustmentFactor = 1;
            adjustedIndemnity = grossIndemnityAfterCap * 1;
             notesOnCalculation = notesOnCalculation.filter(n => !n.includes("استقالة من عقد"));
            notesOnCalculation.push("مادة 52 (تفسير): استقالة من عقد محدد المدة وخدمة 5 سنوات فأكثر تستحق كامل المكافأة المحسوبة.");
        }
    }


    const netLeaveBalanceDays = parseFloat(netLeaveBalanceDisplay) || 0;
    const leaveDayValue = calculationSalary / 26; 
    const leaveEncashmentValue = leaveDayValue * netLeaveBalanceDays;
    
    const totalOtherDuesValue = otherDues.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductionsValue = deductions.reduce((sum, item) => sum + item.amount, 0);

    const netPayableAmount = (adjustedIndemnity + leaveEncashmentValue + totalOtherDuesValue) - totalDeductionsValue;

    setCalculationResult({
      companyName, employeeName, employeeCivilId, employeeJobTitle, joiningDate, lastWorkDate,
      basicSalary: numBasicSalary, allowancesSubjectToIndemnity: numAllowances, contractType, terminationReason,
      annualLeaveEntitlementPerYear: numAnnualLeaveEntitlementPerYear,
      totalAccruedLeaveDays: numTotalAccruedLeave, 
      leaveDaysAlreadyTaken: numLeaveTaken,
      otherDues, deductions,
      serviceYears: sYears, serviceMonths: sMonths, serviceDays: sDays,
      calculationSalary,
      indemnityForFirst5Years, indemnityForSubsequentYears, 
      grossIndemnityBeforeCap, appliedCapAmount, grossIndemnityAfterCap,
      terminationAdjustmentFactor, adjustedIndemnity,
      netLeaveBalanceDays, leaveDayValue, leaveEncashmentValue,
      totalOtherDuesValue, totalDeductionsValue,
      netPayableAmount,
      warnings,
      notesOnCalculation,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <CalculatorIcon className="w-8 h-8 text-primary me-3" />
        <h1 className="text-3xl font-bold text-primary-dark">احتساب نهاية الخدمة (وفق قانون العمل الكويتي - القطاع الخاص)</h1>
      </div>
      
      <Card title="معلومات الشركة والموظف والخدمة">
        <p className="text-gray-600 mb-6 text-sm">
          أدخل البيانات المطلوبة لحساب تقديري لمستحقات نهاية الخدمة. هذه الحاسبة مبنية على أحكام قانون العمل الكويتي رقم 6 لسنة 2010 للقطاع الأهلي.
          <br/>
          <span className="font-semibold">ملاحظة (المادة 57):</span> إذا كان أجر العامل محددًا على أساس اليوم أو الأسبوع أو الساعة أو القطعة، فإن متوسط الأجر اليومي يحدد على أساس متوسط ما تقاضاه العامل عن أيام العمل الفعلية في الشهور الثلاثة الأخيرة. (هذه الآلية غير مطبقة مباشرة في النموذج الحالي المبسط للراتب الشهري، يرجى أخذ ذلك في الاعتبار للعاملين بأجور غير شهرية).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input label="اسم الشركة/صاحب العمل" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="مثال: شركة الأمل للتجارة" />
          <Input label="اسم الموظف بالكامل" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required placeholder="مثال: أحمد عبدالله محمد" />
          <Input label="الرقم المدني للموظف" value={employeeCivilId} onChange={(e) => setEmployeeCivilId(e.target.value)} required placeholder="مثال: 285010112345" />
          <Input label="المسمى الوظيفي" value={employeeJobTitle} onChange={(e) => setEmployeeJobTitle(e.target.value)} required placeholder="مثال: محاسب أول" />
          
          <Input label="تاريخ الالتحاق بالعمل" type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
          <Input label="تاريخ آخر يوم عمل (نهاية الخدمة)" type="date" value={lastWorkDate} onChange={(e) => setLastWorkDate(e.target.value)} required />
          
          {serviceDuration && (
            <div className="md:col-span-2 p-3 bg-gray-100 rounded-md text-sm">
              <strong>مدة الخدمة المحسوبة:</strong> {serviceDuration.years} سنوات, {serviceDuration.months} أشهر, و {serviceDuration.days} أيام. 
              (إجمالي تقريبي: {serviceDuration.totalYears.toFixed(2)} سنوات)
            </div>
          )}
          <Input label="الراتب الأساسي الشهري (د.ك)" type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} placeholder="مثال: 800" required />
          <Input label="مجموع البدلات الشهرية الخاضعة لحساب المكافأة (د.ك)" type="number" value={allowancesSubjectToIndemnity} onChange={(e) => setAllowancesSubjectToIndemnity(e.target.value)} placeholder="مثال: 200 (إن وجدت)" />
           
          <Select label="نوع العقد" options={contractTypeKuwaitOptions} value={contractType} onChange={(e) => setContractType(e.target.value as ContractTypeKuwait)} />
          <Select label="سبب إنهاء الخدمة" options={terminationReasonKuwaitOptions} value={terminationReason} onChange={(e) => setTerminationReason(e.target.value as TerminationReasonKuwait)} />
          
          <Input label="رصيد الإجازة السنوية (أيام في السنة)" type="number" step="1" value={annualLeaveEntitlementPerYear} onChange={(e) => setAnnualLeaveEntitlementPerYear(e.target.value)} placeholder="مثال: 30" required />
          <Input label="إجمالي رصيد الإجازات السنوية المستحق (أيام)" type="number" value={totalAccruedLeaveDaysDisplay} readOnly disabled className="bg-gray-100" />
          <Input label="أيام الإجازات السنوية المستخدمة بالفعل" type="number" step="0.5" value={leaveDaysAlreadyTaken} onChange={(e) => setLeaveDaysAlreadyTaken(e.target.value)} placeholder="مثال: 5" />
          <Input label="صافي رصيد الإجازات المتبقي للصرف (أيام)" type="number" value={netLeaveBalanceDisplay} readOnly disabled className="bg-gray-100" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="المستحقات الأخرى للموظف (إن وجدت)">
            {otherDues.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b">
                    <span>{item.name}: {item.amount.toFixed(3)} د.ك</span>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveDue(item.id)} className="!p-1">
                        <TrashIcon className="w-4 h-4"/>
                    </Button>
                </div>
            ))}
            <div className="flex items-end gap-2 mt-2">
                <Input label="اسم البند (مستحق للموظف)" value={currentDueName} onChange={e => setCurrentDueName(e.target.value)} containerClassName="flex-grow mb-0" placeholder="عمولات متأخرة، مكافآت خاصة..." />
                <Input label="المبلغ (د.ك)" type="number" value={currentDueAmount} onChange={e => setCurrentDueAmount(e.target.value)} containerClassName="w-32 mb-0" step="0.001" />
                <Button onClick={handleAddDue} variant="outline" size="sm" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة</Button>
            </div>
        </Card>
        <Card title="الخصومات / المستحقات للشركة (إن وجدت)">
             {deductions.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b">
                    <span>{item.name}: {item.amount.toFixed(3)} د.ك</span>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveDeduction(item.id)} className="!p-1">
                         <TrashIcon className="w-4 h-4"/>
                    </Button>
                </div>
            ))}
            <div className="flex items-end gap-2 mt-2">
                <Input label="اسم البند (مستحق للشركة)" value={currentDeductionName} onChange={e => setCurrentDeductionName(e.target.value)} containerClassName="flex-grow mb-0" placeholder="رصيد قرض، سلفة، أضرار، جزاءات..."/>
                <Input label="المبلغ (د.ك)" type="number" value={currentDeductionAmount} onChange={e => setCurrentDeductionAmount(e.target.value)} containerClassName="w-32 mb-0" step="0.001"/>
                <Button onClick={handleAddDeduction} variant="outline" size="sm" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة</Button>
            </div>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-center">
          <Button onClick={handleCalculate} variant="primary" size="lg">
              <CalculatorIcon className="w-5 h-5 me-2"/> احسب المستحقات النهائية
          </Button>
      </div>

      {error && (
        <Card className="bg-danger/10 border border-danger text-danger p-4 mt-4">
          <p className="font-semibold">خطأ في الإدخال أو الحساب:</p>
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </Card>
      )}

      {calculationResult && (
        <Card title="النتائج النهائية لمستحقات نهاية الخدمة" className="bg-primary-light/5 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p><strong>مدة الخدمة:</strong> {calculationResult.serviceYears} سنوات و {calculationResult.serviceMonths} أشهر و {calculationResult.serviceDays} أيام</p>
                <p><strong>الراتب المعتمد للحساب:</strong> {formatCurrency(calculationResult.calculationSalary)}</p>
                <p><strong>صافي مكافأة نهاية الخدمة:</strong> <span className="text-lg text-primary">{formatCurrency(calculationResult.adjustedIndemnity)}</span></p>
                <p><strong>مقابل رصيد الإجازات ({calculationResult.netLeaveBalanceDays.toFixed(1)} أيام):</strong> <span className="text-lg text-primary">{formatCurrency(calculationResult.leaveEncashmentValue)}</span></p>
                <p><strong>إجمالي المستحقات الأخرى للموظف:</strong> {formatCurrency(calculationResult.totalOtherDuesValue)}</p>
                <p><strong>إجمالي الخصومات المستحقة للشركة:</strong> {formatCurrency(calculationResult.totalDeductionsValue)}</p>
                
                <div className="md:col-span-2 border-t pt-3 mt-2"></div>
                <p className="md:col-span-2 text-center font-bold text-xl text-success">
                    صافي المبلغ الإجمالي المستحق للدفع: {formatCurrency(calculationResult.netPayableAmount)}
                </p>
            </div>
            {calculationResult.notesOnCalculation && calculationResult.notesOnCalculation.length > 0 && (
                 <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                    <p className="font-semibold text-blue-700">ملاحظات على الحساب:</p>
                    <ul className="list-disc ps-5 text-blue-700">
                        {calculationResult.notesOnCalculation.map((note, idx) => <li key={idx}>{note}</li>)}
                    </ul>
                </div>
            )}
            {calculationResult.warnings && calculationResult.warnings.length > 0 && (
                <div className="mt-3 p-3 bg-warning/10 border border-warning rounded-md text-xs">
                    <p className="font-semibold text-yellow-700">تنبيهات وملاحظات قانونية:</p>
                    <ul className="list-disc ps-5 text-yellow-700">
                        {calculationResult.warnings.map((warn, idx) => <li key={idx}>{warn}</li>)}
                    </ul>
                </div>
            )}
            <div className="mt-6 flex justify-center">
                <Button onClick={() => setIsPrintModalOpen(true)} variant="secondary" size="lg">
                    طباعة كشف التسوية
                </Button>
            </div>
        </Card>
      )}
      
      <PrintableStatementModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={calculationResult}
      />

      <Card title="إخلاء مسؤولية هام" className="border-t-4 border-warning mt-6">
        <p className="text-sm text-gray-700 leading-relaxed">
            هذه الحاسبة تقدم <strong>تقديرًا عامًا فقط</strong> لمستحقات نهاية الخدمة بناءً على فهم مبسط لأحكام قانون العمل الكويتي رقم 6 لسنة 2010 وتعديلاته للقطاع الأهلي. 
            الحسابات الفعلية قد تختلف بناءً على عوامل متعددة تشمل (على سبيل المثال لا الحصر): تفاصيل بنود عقد العمل الفردي، السياسات الداخلية للمنشأة، أي ديون أو استقطاعات على الموظف، وجود أحكام قضائية خاصة، أو أي تعديلات حديثة على القانون لم يتم تضمينها هنا.
        </p>
        <p className="text-sm text-gray-700 mt-2">
            <strong>لا يعتبر هذا الحساب استشارة قانونية أو حسابًا نهائيًا للمستحقات.</strong> 
            ينصح بشدة بالرجوع إلى محامٍ مختص في قوانين العمل أو قسم الموارد البشرية في المؤسسة أو الجهات الحكومية المختصة للحصول على حساب دقيق ونهائي لمستحقات نهاية الخدمة. 
            المطورون والمشغلون لهذا النظام لا يتحملون أي مسؤولية عن أي اختلافات قد تنشأ بين هذا التقدير والمستحقات الفعلية.
        </p>
      </Card>
    </div>
  );
};

export default EndOfServicePage;