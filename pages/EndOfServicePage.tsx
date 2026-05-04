
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { CalculatorIcon, PlusCircleIcon, TrashIcon, UsersIcon, PrinterIcon, ArrowPathIcon, ExclamationTriangleIcon, InformationCircleIcon, OFFICE_NAME } from '../constants';
import { ContractTypeKuwait, TerminationReasonKuwait, FinancialItem, Jurisdiction } from '../types';
import { contractTypeKuwaitOptions, terminationReasonKuwaitOptions } from '../constants';
import { initialEmployees } from './EmployeeProfilePage';
import { useJurisdiction } from '../components/JurisdictionContext';

// Structure for detailed calculation results for printing
interface ExtendedCalculationResult {
  companyName: string;
  employeeName: string;
  employeeCivilId: string;
  employeeJobTitle: string;
  isKuwaiti: boolean;
  joiningDate: string;
  lastWorkDate: string;
  basicSalary: number;
  allowancesSubjectToIndemnity: number;
  contractType: ContractTypeKuwait;
  terminationReason: TerminationReasonKuwait;
  
  annualLeaveEntitlementPerYear: number;
  totalAccruedLeaveDays: number;
  leaveDaysAlreadyTaken: number;
  manualLeaveAdjustment: number;
  
  noticePeriodDays: number;
  noticePeriodValue: number;
  paidNotice: boolean;

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

const tafqeet = (num: number, jurisdiction: Jurisdiction): string => {
  if (isNaN(num)) return `صفر ${jurisdiction.currencyNameAr}`;
  const numStr = num.toFixed(3);
  const parts = numStr.split('.');
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parts[1] || "000";

  const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  
  const convertGroup = (n: number) => {
      if (n === 0) return "";
      if (n < 10) return units[n];
      if (n < 20) {
          if (n === 10) return "عشرة";
          if (n === 11) return "أحد عشر";
          if (n === 12) return "اثنا عشر";
          return units[n % 10] + " " + tens[1];
      }
      if (n < 100) {
          const unit = n % 10;
          const ten = Math.floor(n / 10);
          return (unit > 0 ? units[unit] + " و" : "") + tens[ten];
      }
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return (hundred > 0 ? hundreds[hundred] : "") + (remainder > 0 ? " و" + convertGroup(remainder) : "");
  };

  let integerWords = "";
  if (integerPart === 0) integerWords = "صفر";
  else if (integerPart < 1000) integerWords = convertGroup(integerPart);
  else if (integerPart < 1000000) {
      const thousand = Math.floor(integerPart / 1000);
      const remainder = integerPart % 1000;
      
      let thousandStr = "";
      if (thousand === 1) thousandStr = "ألف";
      else if (thousand === 2) thousandStr = "ألفان";
      else if (thousand >= 3 && thousand <= 10) thousandStr = units[thousand] + " آلاف";
      else thousandStr = convertGroup(thousand) + " ألف";

      integerWords = thousandStr + (remainder > 0 ? " و" + convertGroup(remainder) : "");
  } else {
      integerWords = `${integerPart}`; 
  }
  
  const filsValue = parseInt(decimalPart);
  const filsText = filsValue > 0 ? ` و ${filsValue} فكة` : "";
  return `فقط ${integerWords} ${jurisdiction.currencyNameAr}${filsText} لا غير`;
};

const formatCurrency = (amount: number | undefined, jurisdiction: Jurisdiction): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} ${jurisdiction.currencySymbol}`;
};


const PrintableStatementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  result: ExtendedCalculationResult | null;
}> = ({ isOpen, onClose, result }) => {
  const { selectedJurisdiction } = useJurisdiction();
  if (!isOpen || !result) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
        return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateString; }
  };

  const _formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} ${selectedJurisdiction.currencySymbol}`;
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="كشف حساب التسوية النهائية لمستحقات نهاية الخدمة" size="xl">
      <div id="printable-statement-content-wrapper"> 
        <div id="printable-statement-content" className="p-4 print-statement bg-white text-black">
          <style>
            {`
              .print-statement h2 { font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 1rem; color: #0D47A1; border-bottom: 2px solid #0D47A1; padding-bottom: 10px; }
              .print-statement h3 { font-size: 1.1rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; color: #333; background-color: #f0f0f0; padding: 5px 10px; border-right: 4px solid #0D47A1; }
              .print-statement p, .print-statement li { margin-bottom: 0.3rem; font-size: 0.95rem; line-height: 1.6; }
              .print-statement strong { font-weight: 700; color: #222; }
              .print-statement .section-block { margin-bottom: 1rem; }
              .print-statement .grid-display { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
              .print-statement table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.9rem; }
              .print-statement th, .print-statement td { border: 1px solid #ccc; padding: 8px; text-align: right; }
              .print-statement th { background-color: #e0e0e0; font-weight: bold; }
              .print-statement .total-payable { font-size: 1.2rem; font-weight: bold; text-align: center; padding: 1rem; border: 2px solid #4CAF50; background-color: #f1f8e9; margin-top: 1.5rem; }
              .print-statement .legal-text { font-size: 0.85rem; line-height: 1.6; margin-top: 1.5rem; text-align: justify; padding: 10px; border: 1px dashed #999; }
              .print-statement .signature-area { margin-top: 3rem; display: flex; justify-content: space-between; page-break-inside: avoid; }
              .print-statement .signature-block { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 10px; }
              @media print {
                  .print-hide-in-modal { display: none !important; }
                  body { background-color: white; color: black; }
              }
            `}
          </style>
          <h2>كشف تسوية مستحقات نهاية الخدمة</h2>
          
          <div className="section-block">
              <h3>1. بيانات الموظف والخدمة</h3>
              <div className="grid-display">
                  <p><strong>اسم الشركة:</strong> {result.companyName}</p>
                  <p><strong>اسم الموظف:</strong> {result.employeeName}</p>
                  <p><strong>الرقم المدني:</strong> {result.employeeCivilId}</p>
                  <p><strong>المسمى الوظيفي:</strong> {result.employeeJobTitle}</p>
                  <p><strong>تاريخ الالتحاق:</strong> {formatDate(result.joiningDate)}</p>
                  <p><strong>تاريخ انتهاء الخدمة:</strong> {formatDate(result.lastWorkDate)}</p>
                  <p><strong>الجنسية:</strong> {result.isKuwaiti ? 'كويتي' : 'غير كويتي'}</p>
                  <p className="col-span-2"><strong>مدة الخدمة الفعلية:</strong> {result.serviceYears} سنوات و {result.serviceMonths} أشهر و {result.serviceDays} أيام</p>
              </div>
          </div>

          <div className="section-block">
              <h3>2. أساس احتساب المستحقات</h3>
              <div className="grid-display">
                  <p><strong>الراتب الأساسي:</strong> {_formatCurrency(result.basicSalary)}</p>
                  <p><strong>البدلات (الخاضعة):</strong> {_formatCurrency(result.allowancesSubjectToIndemnity)}</p>
                  <p className="col-span-2"><strong>الراتب الشامل المعتمد للحساب:</strong> {_formatCurrency(result.calculationSalary)}</p>
                  <p><strong>نوع العقد:</strong> {contractTypeKuwaitOptions.find(opt => opt.value === result.contractType)?.label}</p>
                  <p><strong>سبب الإنهاء:</strong> {terminationReasonKuwaitOptions.find(opt => opt.value === result.terminationReason)?.label}</p>
              </div>
          </div>
          
          <div className="section-block">
              <h3>3. تفاصيل المستحقات</h3>
              <table>
                  <thead>
                      <tr>
                          <th>البيان</th>
                          <th>طريقة الحساب / الملاحظات</th>
                          <th>المبلغ ({selectedJurisdiction.currencyNameAr})</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>مكافأة نهاية الخدمة (الإجمالي)</td>
                          <td>
                            {result.serviceYears > 0 && `${result.serviceYears} سنة `}
                            {result.serviceMonths > 0 && `${result.serviceMonths} شهر `}
                            {result.serviceDays > 0 && `${result.serviceDays} يوم`}
                            <br/>
                            ({selectedJurisdiction.laborLaw.indemnityRules.firstTierDays} يوم لأول {selectedJurisdiction.laborLaw.indemnityRules.firstTierYears} سنوات، {selectedJurisdiction.laborLaw.indemnityRules.secondTierDays} يوم لما بعد ذلك)
                          </td>
                          <td>{_formatCurrency(result.grossIndemnityBeforeCap)}</td>
                      </tr>
                      {result.appliedCapAmount && (
                          <tr style={{color: '#d32f2f'}}>
                              <td>تطبيق الحد الأقصى ({selectedJurisdiction.laborLaw.indemnityRules.maxIndemnityMonths} شهر)</td>
                              <td>تم تخفيض المبلغ إلى سقف {selectedJurisdiction.laborLaw.indemnityRules.maxIndemnityMonths} راتب</td>
                              <td>{_formatCurrency(result.grossIndemnityAfterCap)}</td>
                          </tr>
                      )}
                      <tr>
                          <td>مكافأة نهاية الخدمة (الصافي)</td>
                          <td>نسبة الاستحقاق: {(result.terminationAdjustmentFactor * 100).toFixed(0)}%</td>
                          <td><strong>{_formatCurrency(result.adjustedIndemnity)}</strong></td>
                      </tr>
                      <tr>
                          <td>رصيد الإجازات</td>
                          <td>
                            {result.totalAccruedLeaveDays.toFixed(1)} تراكمي 
                            {result.leaveDaysAlreadyTaken > 0 && ` - ${result.leaveDaysAlreadyTaken} مستهلك`}
                            {result.manualLeaveAdjustment !== 0 && ` ${result.manualLeaveAdjustment > 0 ? '+' : ''}${result.manualLeaveAdjustment} تسوية`}
                            <br/>
                            ({result.netLeaveBalanceDays.toFixed(1)} يوم × {_formatCurrency(result.leaveDayValue)}/يوم)
                          </td>
                          <td><strong>{_formatCurrency(result.leaveEncashmentValue)}</strong></td>
                      </tr>
                      {result.otherDues.map(due => (
                          <tr key={due.id}>
                              <td>{due.name}</td>
                              <td>مستحقات إضافية</td>
                              <td>{due.amount.toFixed(3)} {selectedJurisdiction.currencySymbol}</td>
                          </tr>
                      ))}
                      {result.deductions.map(ded => (
                          <tr key={ded.id} style={{color: '#d32f2f'}}>
                              <td>{ded.name} (خصم)</td>
                              <td>مستحقات للشركة</td>
                              <td>- {ded.amount.toFixed(3)} {selectedJurisdiction.currencySymbol}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          
          <div className="total-payable">
              <p>صافي المبلغ المستحق للدفع</p>
              <p style={{fontSize: '1.5em', margin: '10px 0'}}>{_formatCurrency(result.netPayableAmount)}</p>
              <p style={{fontSize: '0.9em', fontWeight: 'normal'}}>{tafqeet(result.netPayableAmount, selectedJurisdiction)}</p>
          </div>

          <div className="legal-text">
              {result.isKuwaiti && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    * ملاحظة: الموظف كويتي الجنسية، مكافأة نهاية الخدمة تخضع لنظام مؤسسة التأمينات الاجتماعية (PIFSS). المبالغ المحتسبة أعلاه هي للمراجعة أو في حال وجود اتفاقات تعاقدية إضافية.
                </div>
              )}
              <strong>إقرار المخالصة وإبراء الذمة:</strong>
              <p>
                  أقر أنا الموقع أدناه، <strong>{result.employeeName}</strong>، بأنني قد استلمت كافة مستحقاتي العمالية المبينة أعلاه من <strong>{result.companyName}</strong>، وذلك عن فترة عملي المذكورة. وبهذا الاستلام، أبرئ ذمة الشركة إبراءً تاماً وشاملاً ونهائياً من أي حقوق أو مطالبات عمالية ناشئة عن عقد العمل أو انتهائه، ولا يحق لي المطالبة بأي مبالغ أخرى مستقبلاً.
              </p>
          </div>

          <div className="signature-area">
              <div className="signature-block">
                  <p><strong>توقيع الموظف المستلم</strong></p>
                  <br/><br/>
                  <p>الاسم: .......................................</p>
              </div>
              <div className="signature-block">
                  <p><strong>اعتماد المدير المسؤول/الموارد البشرية</strong></p>
                  <br/><br/>
                  <p>التاريخ: ____ / ____ / ________</p>
              </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print-hide-in-modal">
        <Button variant="outline" onClick={onClose} className="me-2">إغلاق</Button>
        <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة الكشف</Button>
      </div>
    </Modal>
  );
};


const EndOfServicePage: React.FC = () => {
  const { selectedJurisdiction } = useJurisdiction();
  // State for Employee Selection
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Form State
  const [companyName, setCompanyName] = useState(OFFICE_NAME);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeCivilId, setEmployeeCivilId] = useState('');
  const [employeeJobTitle, setEmployeeJobTitle] = useState('');
  const [isKuwaiti, setIsKuwaiti] = useState<boolean>(false);
  
  const [joiningDate, setJoiningDate] = useState('');
  const [lastWorkDate, setLastWorkDate] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [allowancesSubjectToIndemnity, setAllowancesSubjectToIndemnity] = useState('0');
  const [contractType, setContractType] = useState<ContractTypeKuwait>(ContractTypeKuwait.UNLIMITED);
  const [terminationReason, setTerminationReason] = useState<TerminationReasonKuwait>(TerminationReasonKuwait.DISMISSAL_WITH_NOTICE);
  
  const [noticePeriodAction, setNoticePeriodAction] = useState<'none' | 'pay_in_lieu' | 'waived'>('none');
  const [noticeMonths, setNoticeMonths] = useState('3');
  
  const [annualLeaveEntitlementPerYear, setAnnualLeaveEntitlementPerYear] = useState('30');
  const [totalAccruedLeaveDaysDisplay, setTotalAccruedLeaveDaysDisplay] = useState('0'); 
  const [leaveDaysAlreadyTaken, setLeaveDaysAlreadyTaken] = useState('0');
  const [manualLeaveAdjustment, setManualLeaveAdjustment] = useState('0');
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

  // Auto-fill logic
  const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const empId = e.target.value;
      setSelectedEmployeeId(empId);
      if (empId) {
          const emp = initialEmployees.find(e => e.id === empId);
          if (emp) {
              setEmployeeName(emp.fullNameAr);
              setEmployeeCivilId(emp.civilId);
              setEmployeeJobTitle(emp.jobTitle);
              setJoiningDate(emp.joiningDate);
              setContractType(emp.contractType);
              setBasicSalary(emp.basicSalary.toString());
              
              const indemnityAllowances = emp.allowances?.filter(a => a.subjectToIndemnity).reduce((sum, a) => sum + a.value, 0) || 0;
              setAllowancesSubjectToIndemnity(indemnityAllowances.toString());
              
              setAnnualLeaveEntitlementPerYear(emp.annualLeaveEntitlement?.toString() || '30');
              setLeaveDaysAlreadyTaken(emp.leaveTakenThisYear?.toString() || '0');
          }
      }
  };

  const handleReset = () => {
      setSelectedEmployeeId('');
      setEmployeeName('');
      setEmployeeCivilId('');
      setEmployeeJobTitle('');
      setJoiningDate('');
      setLastWorkDate('');
      setBasicSalary('');
      setAllowancesSubjectToIndemnity('0');
      setOtherDues([]);
      setDeductions([]);
      setCalculationResult(null);
      setError(null);
  };

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
    const adjustment = parseFloat(manualLeaveAdjustment) || 0;
    const net = Math.max(0, total - taken + adjustment);
    setNetLeaveBalanceDisplay(net.toFixed(1)); 
  }, [totalAccruedLeaveDaysDisplay, leaveDaysAlreadyTaken, manualLeaveAdjustment]);

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
    if (!joiningDate || !lastWorkDate) { currentErrors.push("تاريخ الالتحاق وتاريخ آخر يوم عمل مطلوبان."); }
    
    const numBasicSalary = parseFloat(basicSalary);
    const numAllowances = parseFloat(allowancesSubjectToIndemnity);
    const numAnnualLeaveEntitlementPerYear = parseFloat(annualLeaveEntitlementPerYear) || 0;
    const numTotalAccruedLeave = parseFloat(totalAccruedLeaveDaysDisplay) || 0;
    const numLeaveTaken = parseFloat(leaveDaysAlreadyTaken) || 0;

    if (isNaN(numBasicSalary) || numBasicSalary <= 0) { currentErrors.push("الراتب الأساسي الشهري مطلوب وبقيمة صحيحة.");}
    if (isNaN(numAllowances) || numAllowances < 0) { currentErrors.push("قيمة البدلات الخاضعة للمكافأة يجب أن تكون رقمًا صحيحًا (أو صفر).");}

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

    if (isKuwaiti) {
        notesOnCalculation.push("الموظف كويتي الجنسية: يخضع لنظام التأمينات الاجتماعية (PIFSS). مكافأة نهاية الخدمة تُصرف من التأمينات، إلا إذا وجد اتفاق تعاقدي أفضل.");
    }

    let indemnityForFirst5Years = 0;
    let indemnityForSubsequentYears = 0;

    const dailyRate = calculationSalary / (selectedJurisdiction.code === 'KW' ? 26 : 30);

    // Detailed service breakdown
    const rules = selectedJurisdiction.laborLaw.indemnityRules;
    
    if (totalYears <= rules.firstPeriodYears) {
      indemnityForFirst5Years = dailyRate * rules.firstPeriodDaysPerYear * totalYears;
    } else {
      indemnityForFirst5Years = dailyRate * rules.firstPeriodDaysPerYear * rules.firstPeriodYears;
      indemnityForSubsequentYears = dailyRate * rules.subsequentPeriodDaysPerYear * (totalYears - rules.firstPeriodYears);
    }
    
    let grossIndemnityBeforeCap = indemnityForFirst5Years + indemnityForSubsequentYears;
    
    // Cap calculation (if applicable)
    let appliedCapAmount: number | undefined = undefined;
    let grossIndemnityAfterCap = grossIndemnityBeforeCap;

    if (rules.maxIndemnityMonths) {
        const maxIndemnity = calculationSalary * rules.maxIndemnityMonths;
        if (grossIndemnityBeforeCap > maxIndemnity) {
            grossIndemnityAfterCap = maxIndemnity;
            appliedCapAmount = maxIndemnity;
            notesOnCalculation.push(`تطبيق الحد الأقصى للنظام القانوني الحالي (${rules.maxIndemnityMonths} شهر).`);
        }
    }

    let terminationAdjustmentFactor = 1; 
    
    switch (terminationReason) {
        case TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41:
            terminationAdjustmentFactor = 0;
            warnings.push("فصل العامل لسبب تأديبي يترتب عليه الحرمان من مكافأة نهاية الخدمة بالكامل.");
            break;
        case TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS:
            terminationAdjustmentFactor = rules.resignationAdjustment.under3Years;
            if (terminationAdjustmentFactor < 1) notesOnCalculation.push(`استقالة - خدمة أقل من 3 سنوات: نسبة الاستحقاق ${(terminationAdjustmentFactor * 100).toFixed(0)}%.`);
            break;
        case TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS:
            terminationAdjustmentFactor = rules.resignationAdjustment.threeToFiveYears;
            if (terminationAdjustmentFactor < 1) notesOnCalculation.push(`استقالة - خدمة 3-5 سنوات: نسبة الاستحقاق ${(terminationAdjustmentFactor * 100).toFixed(0)}%.`);
            break;
        case TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS:
            terminationAdjustmentFactor = rules.resignationAdjustment.fiveToTenYears;
            if (terminationAdjustmentFactor < 1) notesOnCalculation.push(`استقالة - خدمة 5-10 سنوات: نسبة الاستحقاق ${(terminationAdjustmentFactor * 100).toFixed(0)}%.`);
            break;
        case TerminationReasonKuwait.RESIGNATION_OVER_10_YEARS:
            terminationAdjustmentFactor = rules.resignationAdjustment.overTenYears;
            if (terminationAdjustmentFactor < 1) notesOnCalculation.push(`استقالة - خدمة 10 سنوات فأكثر: نسبة الاستحقاق ${(terminationAdjustmentFactor * 100).toFixed(0)}%.`);
            break;
        case TerminationReasonKuwait.RESIGNATION_ART_48_EMPLOYER_FAULT:
            terminationAdjustmentFactor = 1;
            notesOnCalculation.push(`ترك العمل لخطأ صاحب العمل: يستحق العامل كامل المكافأة كما لو كان الإنهاء من قبل صاحب العمل.`);
            break;
        case TerminationReasonKuwait.RESIGNATION_WOMAN_MARRIAGE:
            terminationAdjustmentFactor = 1;
            notesOnCalculation.push(`استقالة العاملة بسبب الزواج: يستحق كامل المكافأة إذا كان خلال المدة القانونية.`);
            break;
        default:
            terminationAdjustmentFactor = 1; 
            notesOnCalculation.push(`إنهاء من قبل صاحب العمل أو بقوة القانون: يستحق العامل كامل المكافأة (100%).`);
            break;
    }

    const adjustedIndemnity = isKuwaiti ? 0 : (grossIndemnityAfterCap * terminationAdjustmentFactor);

    let noticePeriodDays = 0;
    let noticePeriodValue = 0;
    let paidNotice = false;

    if (noticePeriodAction === 'pay_in_lieu') {
        const months = parseFloat(noticeMonths) || 3;
        noticePeriodValue = calculationSalary * months;
        noticePeriodDays = Math.round(months * 30);
        paidNotice = true;
        notesOnCalculation.push(`بدل إنذار لمدة ${months} أشهر مدفوع نقداً (مادة 44).`);
    } else if (noticePeriodAction === 'waived') {
        notesOnCalculation.push("تم التنازل عن فترة الإنذار بالاتفاق.");
    }

    const netLeaveBalanceDays = parseFloat(netLeaveBalanceDisplay) || 0;
    const leaveDayValue = dailyRate; 
    const leaveEncashmentValue = leaveDayValue * netLeaveBalanceDays;
    
    const totalOtherDuesValue = otherDues.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductionsValue = deductions.reduce((sum, item) => sum + item.amount, 0);

    const netPayableAmount = (adjustedIndemnity + leaveEncashmentValue + noticePeriodValue + totalOtherDuesValue) - totalDeductionsValue;

    setCalculationResult({
      companyName, employeeName, employeeCivilId, employeeJobTitle, isKuwaiti, joiningDate, lastWorkDate,
      basicSalary: numBasicSalary, allowancesSubjectToIndemnity: numAllowances, contractType, terminationReason,
      annualLeaveEntitlementPerYear: numAnnualLeaveEntitlementPerYear,
      totalAccruedLeaveDays: numTotalAccruedLeave, 
      leaveDaysAlreadyTaken: numLeaveTaken,
      manualLeaveAdjustment: parseFloat(manualLeaveAdjustment) || 0,
      noticePeriodDays, noticePeriodValue, paidNotice,
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
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-3 md:mb-0">
            <CalculatorIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">احتساب نهاية الخدمة - {selectedJurisdiction.name}</h1>
        </div>
        <Button variant="outline" onClick={handleReset} leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>إعادة تعيين النموذج</Button>
      </div>
      
      {/* Auto-fill Section */}
      <Card className="bg-blue-50 border-blue-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
              <UsersIcon className="w-10 h-10 text-blue-500" />
              <div className="flex-grow w-full">
                  <h3 className="font-bold text-blue-800 mb-1">اختيار موظف من السجلات (اختياري)</h3>
                  <p className="text-sm text-blue-600 mb-2">يمكنك اختيار موظف مسجل لتعبئة البيانات الأساسية والمالية تلقائياً.</p>
                  <Select 
                    options={[{value: '', label: '--- اختر موظفاً ---'}, ...initialEmployees.map(e => ({value: e.id, label: e.fullNameAr}))]}
                    value={selectedEmployeeId}
                    onChange={handleEmployeeSelect}
                    containerClassName="mb-0 max-w-md bg-white"
                  />
              </div>
          </div>
      </Card>

      <Card title="1. بيانات الموظف وفترة الخدمة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input label="اسم الشركة/صاحب العمل" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="مثال: شركة الأمل للتجارة" />
          <Input label="اسم الموظف بالكامل" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required placeholder="مثال: أحمد عبدالله" />
          <Input label="الرقم المدني" value={employeeCivilId} onChange={(e) => setEmployeeCivilId(e.target.value)} required placeholder="مثال: 285010112345" />
          <Input label="المسمى الوظيفي" value={employeeJobTitle} onChange={(e) => setEmployeeJobTitle(e.target.value)} required />
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">فئة الموظف</label>
            <div className="flex gap-4 p-2 bg-white border border-gray-300 rounded-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!isKuwaiti} onChange={() => setIsKuwaiti(false)} className="accent-primary" />
                <span>وافد / أجنبي</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={isKuwaiti} onChange={() => setIsKuwaiti(true)} className="accent-primary" />
                <span>مواطن ({selectedJurisdiction.name})</span>
              </label>
            </div>
          </div>
          
          <div className="hidden md:block"></div> { /* spacer */ }
          
          <Input label="تاريخ الالتحاق بالعمل" type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
          <Input label="تاريخ نهاية الخدمة" type="date" value={lastWorkDate} onChange={(e) => setLastWorkDate(e.target.value)} required />
          
          {serviceDuration && (
            <div className="md:col-span-2 p-3 bg-gray-100 rounded-md text-sm border-s-4 border-primary">
              <strong>مدة الخدمة المحسوبة:</strong> {serviceDuration.years} سنوات, {serviceDuration.months} أشهر, و {serviceDuration.days} أيام.
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="2. تفاصيل الراتب والعقد">
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label={`الراتب الأساسي (${selectedJurisdiction.currencySymbol})`} type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} placeholder="مثال: 800" required />
                    <Input label={`البدلات الخاضعة (${selectedJurisdiction.currencySymbol})`} type="number" value={allowancesSubjectToIndemnity} onChange={(e) => setAllowancesSubjectToIndemnity(e.target.value)} placeholder="مثال: 200" />
                </div>
                <div className="p-2 bg-green-50 rounded text-center font-bold text-green-800">
                    الراتب الشامل للحساب: {(parseFloat(basicSalary) || 0) + (parseFloat(allowancesSubjectToIndemnity) || 0)} {selectedJurisdiction.currencySymbol}
                </div>
                <Select label="نوع العقد" options={contractTypeKuwaitOptions} value={contractType} onChange={(e) => setContractType(e.target.value as ContractTypeKuwait)} />
                <Select label="سبب إنهاء الخدمة" options={terminationReasonKuwaitOptions} value={terminationReason} onChange={(e) => setTerminationReason(e.target.value as TerminationReasonKuwait)} />
             </div>
          </Card>

          <Card title="3. رصيد الإجازات">
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="استحقاق الإجازة السنوية (أيام/سنة)" type="number" step="1" value={annualLeaveEntitlementPerYear} onChange={(e) => setAnnualLeaveEntitlementPerYear(e.target.value)} />
                  <Input label="إجمالي الرصيد التراكمي (أيام)" type="number" value={totalAccruedLeaveDaysDisplay} readOnly disabled className="bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="الإجازات المستهلكة/من الرصيد (أيام)" type="number" step="0.5" value={leaveDaysAlreadyTaken} onChange={(e) => setLeaveDaysAlreadyTaken(e.target.value)} placeholder="أدخل الأيام المستخدمة" />
                    <Input label="تسوية يدوية (إضافة + / خصم -)" type="number" step="0.5" value={manualLeaveAdjustment} onChange={(e) => setManualLeaveAdjustment(e.target.value)} placeholder="رصيد مرحل أو تسوية" />
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex justify-between items-center">
                    <span className="text-yellow-800 font-medium">صافي الرصيد المستحق للصرف:</span>
                    <span className="text-2xl font-bold text-yellow-900">{netLeaveBalanceDisplay} يوم</span>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  * يتم احتساب الرصيد التراكمي بناءً على تاريخ الالتحاق وتاريخ ترك العمل (مدة الخدمة الفعلية).
                </p>
             </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="4. إضافات أخرى (مكافآت، عمولات)">
            {otherDues.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b bg-white">
                    <span>{item.name}: <strong>{item.amount.toFixed(3)}</strong> {selectedJurisdiction.currencySymbol}</span>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveDue(item.id)} className="!p-1"><TrashIcon className="w-4 h-4"/></Button>
                </div>
            ))}
            <div className="flex items-end gap-2 mt-2">
                <Input label="الوصف" value={currentDueName} onChange={e => setCurrentDueName(e.target.value)} containerClassName="flex-grow mb-0" placeholder="وصف البند..." />
                <Input label={`المبلغ (${selectedJurisdiction.currencySymbol})`} type="number" value={currentDueAmount} onChange={e => setCurrentDueAmount(e.target.value)} containerClassName="w-32 mb-0" step="0.001" />
                <Button onClick={handleAddDue} variant="outline" size="sm" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة</Button>
            </div>
        </Card>
        <Card title="5. خصومات (سلف، قروض، أضرار)">
             {deductions.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b bg-white">
                    <span className="text-red-600">{item.name}: <strong>- {item.amount.toFixed(3)}</strong> {selectedJurisdiction.currencySymbol}</span>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveDeduction(item.id)} className="!p-1"><TrashIcon className="w-4 h-4"/></Button>
                </div>
            ))}
            <div className="flex items-end gap-2 mt-2">
                <Input label="الوصف" value={currentDeductionName} onChange={e => setCurrentDeductionName(e.target.value)} containerClassName="flex-grow mb-0" placeholder="وصف الخصم..."/>
                <Input label={`المبلغ (${selectedJurisdiction.currencySymbol})`} type="number" value={currentDeductionAmount} onChange={e => setCurrentDeductionAmount(e.target.value)} containerClassName="w-32 mb-0" step="0.001"/>
                <Button onClick={handleAddDeduction} variant="outline" size="sm" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة</Button>
            </div>
        </Card>
      </div>

      <Card title="6. فترة الإنذار (المادة 44)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-sans">الإجراء المتخذ بشأن فترة الإنذار</label>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => setNoticePeriodAction('none')}
                        className={`p-2 text-xs border rounded-md transition-colors ${noticePeriodAction === 'none' ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}`}
                    >
                        العمل خلال الإنذار
                    </button>
                    <button 
                        onClick={() => setNoticePeriodAction('pay_in_lieu')}
                        className={`p-2 text-xs border rounded-md transition-colors ${noticePeriodAction === 'pay_in_lieu' ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}`}
                    >
                        دفع بدل إنذار
                    </button>
                    <button 
                        onClick={() => setNoticePeriodAction('waived')}
                        className={`p-2 text-xs border rounded-md transition-colors ${noticePeriodAction === 'waived' ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}`}
                    >
                        تم التنازل عنها
                    </button>
                </div>
            </div>
            
            {noticePeriodAction === 'pay_in_lieu' && (
                <div className="animate-fade-in">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">مدة بدل الإنذار (أشهر)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" min="1" max="6" step="1" 
                            value={noticeMonths} 
                            onChange={(e) => setNoticeMonths(e.target.value)}
                            className="flex-grow accent-primary"
                        />
                        <span className="font-bold text-primary w-12 text-center">{noticeMonths} أشهر</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic shadow-sm bg-blue-50 p-1 rounded">
                        * المادة 44 تشترط 3 أشهر على الأقل للعقود غير محددة المدة لموظفي الأجر الشهري.
                    </p>
                </div>
            )}
            
            {noticePeriodAction === 'none' && (
                <div className="bg-gray-50 p-4 rounded-md border text-sm text-gray-600 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    يستمر الموظف بالعمل خلال فترة الإنذار ويتقاضى راتبه الشهري المعتاد حتى تاريخ تركه العمل.
                </div>
            )}
        </div>
      </Card>
      
      <div className="mt-4 flex justify-center">
          <Button onClick={handleCalculate} variant="primary" size="lg" className="w-full md:w-1/2">
              <CalculatorIcon className="w-6 h-6 me-2"/> عرض النتيجة التفصيلية
          </Button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
          <p className="font-bold">تنبيه:</p>
          <pre className="whitespace-pre-wrap text-sm font-sans">{error}</pre>
        </div>
      )}

      {calculationResult && (
        <div className="animate-fade-in-right">
            <Card title="نتيجة الحساب النهائية" className="border-t-4 border-primary shadow-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
                    <div className="p-4 bg-white rounded shadow-sm">
                        <p className="text-gray-500 text-sm">مكافأة نهاية الخدمة (الصافي)</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(calculationResult.adjustedIndemnity)}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow-sm">
                        <p className="text-gray-500 text-sm">بدل رصيد الإجازات</p>
                        <p className="text-2xl font-bold text-yellow-600">{formatCurrency(calculationResult.leaveEncashmentValue)}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow-sm">
                        <p className="text-gray-500 text-sm">بدل الإنذار</p>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(calculationResult.noticePeriodValue, selectedJurisdiction)}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow-sm border-2 border-green-500">
                        <p className="text-gray-500 text-sm font-bold">صافي المبلغ المستحق للدفع</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(calculationResult.netPayableAmount)}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded border shadow-inner">
                    <h4 className="font-bold text-gray-700 mb-3 border-b pb-2 flex items-center">
                      <InformationCircleIcon className="w-5 h-5 me-2 text-primary"/>
                      تفاصيل وملاحظات الحساب:
                    </h4>
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-500">مدة الخدمة:</span>
                                <span className="font-bold">{calculationResult.serviceYears} سنة، {calculationResult.serviceMonths} شهر، {calculationResult.serviceDays} يوم</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-500">أجر اليوم (للحساب):</span>
                                <span className="font-bold">{formatCurrency(calculationResult.leaveDayValue)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-500">مكافأة الـ 5 سنوات الأولى:</span>
                                <span className="font-bold">{formatCurrency(calculationResult.indemnityForFirst5Years)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-500">مكافأة ما بعد الـ 5 سنوات:</span>
                                <span className="font-bold">{formatCurrency(calculationResult.indemnityForSubsequentYears)}</span>
                            </div>
                        </div>

                        <ul className="space-y-1 text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                            <li>إجمالي الإضافات الأخرى: <span className="text-green-600 font-bold">+{formatCurrency(calculationResult.totalOtherDuesValue, selectedJurisdiction)}</span></li>
                            <li>إجمالي الخصومات: <span className="text-red-600 font-bold">-{formatCurrency(calculationResult.totalDeductionsValue, selectedJurisdiction)}</span></li>
                            {calculationResult.appliedCapAmount && <li className="text-red-600 font-bold flex items-center"><ExclamationTriangleIcon className="w-4 h-4 me-1"/> تم تطبيق سقف المكافأة ({selectedJurisdiction.laborLaw.indemnityRules.maxIndemnityMonths} شهر) وفقاً للنظام القانوني.</li>}
                            {calculationResult.terminationAdjustmentFactor < 1 && <li>نسبة استحقاق المكافأة: <strong className="text-orange-600">{(calculationResult.terminationAdjustmentFactor * 100).toFixed(1)}%</strong> (بسبب: {terminationReasonKuwaitOptions.find(o=>o.value === calculationResult.terminationReason)?.label})</li>}
                        </ul>

                        {(calculationResult.notesOnCalculation?.length || 0) > 0 && (
                            <div className="mt-2">
                                <p className="text-xs font-bold text-gray-500 mb-1">ملاحظات قانونية:</p>
                                <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 ps-2">
                                    {calculationResult.notesOnCalculation?.map((note, idx) => (
                                        <li key={idx}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {calculationResult.warnings.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-xs">
                                <strong>تنبيهات هامة:</strong>
                                <ul className="list-disc list-inside mt-1">
                                    {calculationResult.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button onClick={() => setIsPrintModalOpen(true)} variant="secondary" size="lg" leftIcon={<PrinterIcon className="w-5"/>}>
                        طباعة كشف التسوية الرسمي
                    </Button>
                </div>
            </Card>
        </div>
      )}
      
      <PrintableStatementModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={calculationResult}
      />
    </div>
  );
};

export default EndOfServicePage;
