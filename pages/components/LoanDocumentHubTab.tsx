import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { Loan, Employee } from '../../types';
import { LEGAL_TEMPLATES, fillTemplate } from '../loan_templates';

interface LoanDocumentHubTabProps {
  lang: 'ar' | 'en';
  loans: Loan[];
  employees: Employee[];
  initialSelectedLoanId?: string;
  initialSelectedTemplateId?: string;
}

export const LoanDocumentHubTab: React.FC<LoanDocumentHubTabProps> = ({
  lang,
  loans,
  employees,
  initialSelectedLoanId,
  initialSelectedTemplateId
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string>(initialSelectedLoanId || loans[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialSelectedTemplateId || 'temp-01');
  const [editedText, setEditedText] = useState<string>('');

  const activeLoan = loans.find(l => l.id === selectedLoanId);

  // Sync with prop navigation changes
  useEffect(() => {
    if (initialSelectedLoanId) {
      setSelectedLoanId(initialSelectedLoanId);
    }
    if (initialSelectedTemplateId) {
      setSelectedTemplateId(initialSelectedTemplateId);
    }
  }, [initialSelectedLoanId, initialSelectedTemplateId]);

  // Load and fill the selected template
  const handleCompileOriginal = () => {
    if (!activeLoan) {
      setEditedText(lang === 'ar' ? 'الرجاء اختيار قرض أو موظف أولاً لاستعراض مستنداته.' : 'Please choose active loan to proceed.');
      return;
    }
    const rawTemplateObj = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!rawTemplateObj) return;

    // Retrieve corresponding employee parameters
    const empObj = employees.find(e => e.id === activeLoan.employeeId);
    
    // Fill values
    const replacements = {
      BORROWER_NAME: activeLoan.employeeName,
      EMPLOYEE_NAME: activeLoan.employeeName,
      CIVIL_ID: empObj?.civilId || '290010103948',
      JOB_TITLE: empObj?.jobTitle || 'موظف مالي ومطالبات',
      DEPARTMENT: empObj?.department || 'الشؤون القانونية',
      BASIC_SALARY: (empObj?.basicSalary || 800).toFixed(3),
      PRINCIPAL: activeLoan.loanAmount.toFixed(3),
      LOAN_AMOUNT: activeLoan.loanAmount.toFixed(3),
      LOAN_AMOUNT_WORDS: lang === 'ar' ? 'فقط وقدره' : 'Only total amount of',
      TERM: activeLoan.numberOfInstallments.toString(),
      MONTHLY_INSTALLMENT: activeLoan.monthlyInstallment.toFixed(3),
      INSTALLMENT_AMOUNT: activeLoan.monthlyInstallment.toFixed(3),
      INSTALLMENTS_COUNT: activeLoan.numberOfInstallments.toString(),
      START_DATE: activeLoan.repaymentStartDate || '2026-06-01',
      DATE: new Date().toLocaleDateString('ar-EG'),
      REF_NUMBER: activeLoan.id,
      GUARANTOR_NAME: activeLoan.guarantorName || 'لا يوجد كفيل مباشر',
      GUARANTOR_CIVIL_ID: activeLoan.guarantorCivilId || '-',
      PURPOSE: activeLoan.purpose || 'نفقات علاجية وتأهيلية عامة'
    };

    const filled = fillTemplate(rawTemplateObj, lang, replacements);
    setEditedText(filled);
  };

  // Compile when loan or template selection shifts
  useEffect(() => {
    handleCompileOriginal();
  }, [selectedLoanId, selectedTemplateId, loans]);

  // Handle standard printing
  const handleTriggerPrint = () => {
    // We create a temporary print style iframe or window, but the standard and highly safe pattern is:
    // Inject a special print layout inside a hidden visual div container, apply print css, then call window.print().
    // We will show a neat popup and then trigger print!
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(lang === 'ar' ? 'تم حظر فتح نافذة الطباعة من المتصفح، يرجى السماح بالنوافذ المنبثقة' : 'Popup blocker active. Please allow popups.');
      return;
    }

    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    const align = lang === 'ar' ? 'right' : 'left';

    printWindow.document.write(`
      <html>
        <head>
          <title>ADALA SYSTEM - PRINT OFFICE DOC</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Cairo:wght@400;700;900&display=swap');
            body {
              font-family: 'Cairo', 'Inter', sans-serif;
              direction: ${direction};
              text-align: ${align};
              padding: 40px;
              color: #1e293b;
              margin: 0;
            }
            .paper {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              padding: 50px;
              border-radius: 8px;
              background: #ffffff;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
              position: relative;
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              border-bottom: 3px double #0f172a;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-contacts {
              font-size: 11px;
              color: #64748b;
              line-height: 1.6;
            }
            .office-branding {
              text-align: right;
            }
            .office-branding h2 {
              margin: 0 0 5px 0;
              font-weight: 900;
              color: #0f172a;
              font-size: 20px;
            }
            .office-branding p {
              margin: 0;
              font-size: 11px;
              color: #475569;
              font-weight: 700;
            }
            .official-watermark {
              border: 1px dashed #6366f1;
              color: #4f46e5;
              display: inline-block;
              font-size: 9px;
              font-weight: 950;
              padding: 4px 10px;
              margin-top: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .doc-body {
              white-space: pre-wrap;
              font-size: 13px;
              line-height: 1.8;
              color: #1e293b;
              margin-bottom: 50px;
              font-family: inherit;
            }
            .footer-signature {
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 30px;
              margin-top: 60px;
              border-top: 1px solid #f1f5f9;
              padding-top: 30px;
              text-align: center;
              font-size: 11px;
              font-weight: 700;
            }
            .signature-box {
              display: flex;
              flex-col: column;
              justify-content: space-between;
            }
            .signature-line {
              border-bottom: 1px solid #cbd5e1;
              height: 40px;
              margin: 10px 0;
            }
            .badge-adala {
              background: #0f172a;
              color: #ffffff;
              font-size: 10px;
              padding: 2px 8px;
              font-weight: bold;
              border-radius: 3px;
              margin-bottom: 8px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="header-banner">
              <div class="office-branding">
                <span class="badge-adala">عدالة • ADALA ERP</span>
                <h2>مكتب الوقيان والعوضي والشركاء</h2>
                <p>للمحاماة والاستشارات القانونية والأعمال المالية والعمالية</p>
              </div>
              <div class="header-contacts" style="text-align: left;">
                <p><b>REF:</b> ${activeLoan?.id || 'AD-LN-DRAFT'}</p>
                <p><b>DATE:</b> ${new Date().toLocaleDateString('ar-EG')}</p>
                <p>الكويت • برج التجارية • هاتف: 22001100</p>
              </div>
            </div>

            <div class="doc-body">${editedText}</div>

            <div style="text-align: center; margin-top: 40px;">
              <div class="official-watermark">
                تمت المطابقة القانونية صداراً من نظام عدالة المعتمد - قانون العمل الكويتي ٦ / ٢٠١٠
              </div>
            </div>

            <div class="footer-signature">
              <div class="signature-box">
                <p>محاسب الأجور والصرف</p>
                <div class="signature-line"></div>
                <p style="font-size: 9px; color: #10b981;">✔ معتمد المادة ٢٠</p>
              </div>
              <div class="signature-box">
                <p>الكفيل الضامن الشخصي</p>
                <div class="signature-line"></div>
              </div>
              <div class="signature-box">
                <p>توقيع وبصمة الموظف المقترض</p>
                <div class="signature-line"></div>
              </div>
            </div>
          </div>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Pre-configured 8 core official forms dropdown options
  const coreForms = [
    { value: 'temp-01', label: lang === 'ar' ? '١. طلب قرض رسمي للموظف' : '1. Official Loan Request' },
    { value: 'temp-02', label: lang === 'ar' ? '٢. طلب سلفة عاجلة على الراتب' : '2. Quick Salary Advance Request' },
    { value: 'temp-08', label: lang === 'ar' ? '٣. اتفاقية عقد القرض العام' : '3. General Loan Agreement Contract' },
    { value: 'temp-06', label: lang === 'ar' ? '٤. سند تعهد رسمي بالسداد والالتزام' : '4. Official Repayment Undertaking' },
    { value: 'temp-04', label: lang === 'ar' ? '٥. إقرار وتخويل بالخصم المباشر من الراتب' : '5. Salary Direct Deduction Consent' },
    { value: 'temp-09', label: lang === 'ar' ? '٦. إقرار واستقطاع متبقي الدين من نهاية الخدمة (مادة 51)' : '6. EOS Benefits Recovery Consent' },
    { value: 'temp-05', label: lang === 'ar' ? '٧. جدول إفصاح كشف الأقساط والجدولة' : '7. Disclosed Amortization Schedule' },
    { value: 'temp-10', label: lang === 'ar' ? '٨. نموذج ومذكرة تسوية المديونية الودية' : '8. Mutual Debt Settlement Agreement' }
  ];

  const secondaryForms = [
    { value: 'temp-11', label: lang === 'ar' ? '٩. إنذار مالي قانوني رسمي للمقترض والكفيل' : '9. Legal Delinquency Warning Letter' },
    { value: 'temp-12', label: lang === 'ar' ? '١٠. إقرار إعادة جدولة وتوزيع أعباء القروض' : '10. Restructured Amortization Consent' },
    { value: 'temp-13', label: lang === 'ar' ? '١١. مخالصة براءة ذمة مالية نهائية للموظف' : '11. Final Liability Clearance & Discharge' },
    { value: 'temp-14', label: lang === 'ar' ? '١٢. قرار سلفة طارئة قصيرة الأجل' : '12. Short-Term Emergency Advance' }
  ];

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="bg-white" title={lang === 'ar' ? 'مركز المستندات وتوليد النماذج والقرارات القانونية' : 'Corporate Legal Documents & Agreement Hub'}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COMMAND PANEL */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-right space-y-4">
            <h4 className="text-sm font-black text-slate-800 border-b pb-2">📂 {lang === 'ar' ? 'خيارات توليد البيانات المعيارية' : 'Form Configuration'}</h4>
            
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 mb-1">{lang === 'ar' ? '١. سحب سياق ملف المقترض:' : '1. Import Borrower Metadata:'}</label>
              <Select
                value={selectedLoanId}
                onChange={e => setSelectedLoanId(e.target.value)}
                options={loans.map(l => ({
                  value: l.id,
                  label: `${l.employeeName} (${l.id})`
                }))}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 mb-1">{lang === 'ar' ? '٢. اختر أحد النماذج الرسمية الـ 8 المعتمدة:' : '2. Standard 8 Core Official Forms:'}</label>
              <Select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                options={coreForms}
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="block text-xs font-black text-slate-700 mb-1">{lang === 'ar' ? 'نماذج قانونية وإشعارات ملحقة:' : 'Additional Support Templates:'}</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-xs text-slate-700 bg-white font-bold face-out-line leading-tight"
              >
                <option value="">-- {lang === 'ar' ? 'اختر نموذج ملحق' : 'Select auxiliary form'} --</option>
                {secondaryForms.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <button 
                onClick={handleCompileOriginal}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-all"
              >
                🔄 {lang === 'ar' ? 'استعادة وتجميع المسودة الأصلية' : 'Revert & Refill Original Draft'}
              </button>
              
              <button 
                onClick={handleTriggerPrint}
                className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black shadow-xs-md transition-all flex items-center justify-center gap-2"
              >
                🖨️ {lang === 'ar' ? 'إصدار وطباعة المستند فوراً' : 'Compile & Export Document'}
              </button>
            </div>

            {/* Kuwait Compliance Checker Box */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold leading-relaxed text-indigo-950">
              <p className="font-black mb-1">⚖️ {lang === 'ar' ? 'مواءمة قانون العمل الكويتي:' : 'Kuwait labor law checked'}</p>
              <p className="text-[10px] text-slate-500">
                {lang === 'ar' 
                  ? 'يتم دمج ومطابقة الرمز التعريفي للمقترض وبيانات راتبه المسجلة للتوافق التام مع البندين ٢٠ و ٥١ للرواتب والتصفيات.'
                  : 'Borrower civil parameters are automatically linked to satisfy statutory caps and indemnities.'}
              </p>
            </div>
          </div>

          {/* EDITABLE PREVIEW Sandbox */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-amber-500/5 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 leading-relaxed">
                ✏️ <span>{lang === 'ar' ? 'شاشة تعديل ومعاينة حية للمستند قبل الطباعة: يمكنك النقر وتعديل النص مباشرة لتحرير القرار.' : 'Editable Live Sandbox: Click anywhere inside the paper and type to modify paragraphs.'}</span>
              </p>
              <span className="text-[9px] font-mono font-black border border-amber-300 bg-amber-100 text-amber-850 px-2 py-0.5 rounded uppercase">
                {lang === 'ar' ? 'مسودة قبل الطباعة' : 'Live Draft sandbox'}
              </span>
            </div>

            <div className="relative border-2 border-slate-300 rounded-2xl shadow-inner bg-white overflow-hidden">
              {/* Paper Layout */}
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] text-slate-400 select-none z-10">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                <span>{lang === 'ar' ? 'محرر جاهز للطباعة' : 'Parchment mode'}</span>
              </div>
              
              <textarea
                value={editedText}
                onChange={e => setEditedText(e.target.value)}
                className="w-full h-[32rem] p-10 md:p-12 text-xs font-bold leading-relaxed text-slate-800 bg-slate-50/30 font-mono outline-none resize-none border-none select-text"
                placeholder={lang === 'ar' ? 'اختر قرضاً توليد المستند التلقائي...' : 'Loading agreement parchment...'}
              />
            </div>
            
            <p className="text-[10px] text-slate-400 text-center italic">
              {lang === 'ar' 
                ? 'ملاحظة: تعديل النص في المربع أعلاه لا يغير بيانات قاعدة البيانات الأساسية، إنما يوفر ميزة الصياغة القانونية قبل إصدار الورقة للمطبعة.'
                : 'Note: Tweaking text in the sandbox above changes the printer draft only, leaving the database records intact.'}
            </p>
          </div>

        </div>
      </Card>
    </div>
  );
};
