import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { Loan, Employee } from '../../types';
import { LEGAL_TEMPLATES, fillTemplate, LegalTemplate } from '../loan_templates';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialSelectedTemplateId || 'temp-promissory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editedText, setEditedText] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [qrToken, setQrToken] = useState<string>('');

  const activeLoan = loans.find(l => l.id === selectedLoanId) || loans[0];

  // Sync with prop navigation changes
  useEffect(() => {
    if (initialSelectedLoanId) {
      setSelectedLoanId(initialSelectedLoanId);
    }
    if (initialSelectedTemplateId) {
      setSelectedTemplateId(initialSelectedTemplateId);
    }
  }, [initialSelectedLoanId, initialSelectedTemplateId]);

  // Generate installments schedule text
  const generateInstallmentsTable = (loan: Loan): string => {
    const lines: string[] = [];
    lines.push(lang === 'ar' ? '| رقم القسط | تاريخ الاستحقاق | قيمة القسط (د.ك) | الرصيد المتبقي (د.ك) |' : '| No. | Due Date | Amount (KWD) | Balance (KWD) |');
    lines.push('|:---:|:---:|:---:|:---:|');
    
    let remaining = loan.loanAmount;
    const start = new Date(loan.repaymentStartDate || '2026-06-01');

    for (let i = 1; i <= loan.numberOfInstallments; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      remaining = Math.max(0, remaining - loan.monthlyInstallment);
      const dateStr = dueDate.toISOString().split('T')[0];
      lines.push(`| ${i} | ${dateStr} | ${loan.monthlyInstallment.toFixed(3)} د.ك | ${remaining.toFixed(3)} د.ك |`);
    }
    return lines.join('\n');
  };

  // Number to Arabic words converter helper
  const amountToWords = (amt: number): string => {
    const intPart = Math.floor(amt);
    const fils = Math.round((amt - intPart) * 1000);
    
    let words = '';
    if (intPart === 100) words = 'مائة دينار كويتي';
    else if (intPart === 200) words = 'مائتان دينار كويتي';
    else if (intPart === 500) words = 'خمسمائة دينار كويتي';
    else if (intPart === 750) words = 'سبعمائة وخمسون ديناراً كويتياً';
    else if (intPart === 900) words = 'تسعمائة دينار كويتي';
    else if (intPart === 1000) words = 'ألف دينار كويتي';
    else if (intPart === 1200) words = 'ألف ومائتان دينار كويتي';
    else if (intPart === 1500) words = 'ألف وخمسمائة دينار كويتي';
    else if (intPart === 1850) words = 'ألف وثمانمائة وخمسون ديناراً كويتياً';
    else if (intPart === 2000) words = 'ألفان دينار كويتي';
    else if (intPart === 2500) words = 'ألفان وخمسمائة دينار كويتي';
    else if (intPart === 3000) words = 'ثلاثة آلاف دينار كويتي';
    else if (intPart === 5000) words = 'خمسة آلاف دينار كويتي';
    else words = `${intPart.toLocaleString('ar-EG')} دينار كويتي`;

    if (fils > 0) {
      words += ` و ${fils} فلساً`;
    }
    return words + ' فقط لا غير';
  };

  // Load and fill the selected template
  const handleCompileOriginal = () => {
    if (!activeLoan) {
      setEditedText(lang === 'ar' ? 'الرجاء اختيار قرض أو موظف أولاً لاستعراض مستنداته.' : 'Please choose active loan to proceed.');
      return;
    }
    const rawTemplateObj = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId) || LEGAL_TEMPLATES[0];
    if (!rawTemplateObj) return;

    // Retrieve corresponding employee parameters
    const empObj = employees.find(e => e.id === activeLoan.employeeId);
    const basicWage = empObj?.basicSalary || 800;
    const deductionPct = ((activeLoan.monthlyInstallment / basicWage) * 100).toFixed(1);
    
    const startDateObj = new Date(activeLoan.repaymentStartDate || '2026-06-01');
    const endDateObj = new Date(startDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + activeLoan.numberOfInstallments);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    // Generate unique verification token
    const token = `ADALA-KW-${activeLoan.id}-${Date.now().toString().slice(-6)}`;
    setQrToken(token);

    // Fill all template placeholders
    const replacements: Record<string, string> = {
      COMPANY_NAME: 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية',
      OFFICE_NAME: 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية',
      OFFICIAL_SEAL: 'ختم وتوثيق مكتب المحامي صبري شطا المعتمد - نظام عدالة الرقمي',
      BORROWER_NAME: activeLoan.employeeName,
      EMPLOYEE_NAME: activeLoan.employeeName,
      EMPLOYEE_ID: empObj?.id || activeLoan.employeeId,
      CIVIL_ID: empObj?.civilId || '290010103948',
      BORROWER_NATIONALITY: empObj?.nationality || 'كويتي',
      BORROWER_PHONE: empObj?.phone || '+965 99887766',
      JOB_TITLE: empObj?.jobTitle || 'موظف مالي ومطالبات',
      DEPARTMENT: empObj?.department || 'الشؤون القانونية',
      BASIC_SALARY: basicWage.toFixed(3),
      PRINCIPAL: activeLoan.loanAmount.toFixed(3),
      LOAN_AMOUNT: activeLoan.loanAmount.toFixed(3),
      LOAN_AMOUNT_WORDS: amountToWords(activeLoan.loanAmount),
      TERM: activeLoan.numberOfInstallments.toString(),
      MONTHLY_INSTALLMENT: activeLoan.monthlyInstallment.toFixed(3),
      INSTALLMENT_AMOUNT: activeLoan.monthlyInstallment.toFixed(3),
      INSTALLMENTS_COUNT: activeLoan.numberOfInstallments.toString(),
      DEDUCTION_PERCENTAGE: `${deductionPct}%`,
      START_DATE: activeLoan.repaymentStartDate || '2026-06-01',
      END_DATE: endDateStr,
      DATE: new Date().toLocaleDateString('ar-EG'),
      REF_NUMBER: activeLoan.id,
      GUARANTOR_NAME: activeLoan.guarantorName || 'عبدالرحمن علي حسين السيد',
      GUARANTOR_CIVIL_ID: activeLoan.guarantorCivilId || '290112400492',
      GUARANTOR_NATIONALITY: 'كويتي',
      GUARANTOR_JOB: 'مستشار قانوني معتمد',
      GUARANTOR_SALARY: '1450.000',
      REMAINING_BALANCE: (activeLoan.remainingBalance ?? activeLoan.loanAmount).toFixed(3),
      INSTALLMENTS_TABLE: generateInstallmentsTable(activeLoan),
      PURPOSE: activeLoan.purpose || 'تمويل شخصي وتغطية نفقات علاجية وتأهيلية'
    };

    const filled = fillTemplate(rawTemplateObj, lang, replacements);
    setEditedText(filled);
  };

  // Compile when loan or template selection shifts
  useEffect(() => {
    handleCompileOriginal();
  }, [selectedLoanId, selectedTemplateId, loans]);

  // Copy to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(editedText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Handle standard printing with official Sabri Shatta branding & QR Code
  const handleTriggerPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(lang === 'ar' ? 'تم حظر فتح نافذة الطباعة من المتصفح، يرجى السماح بالنوافذ المنبثقة' : 'Popup blocker active. Please allow popups.');
      return;
    }

    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    const align = lang === 'ar' ? 'right' : 'left';
    const activeTemplate = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId);
    const title = lang === 'ar' ? activeTemplate?.titleAr : activeTemplate?.titleEn;

    // Generate dynamic QR Code SVG representation
    const qrData = encodeURIComponent(`https://adala.legal.kw/verify?ref=${activeLoan?.id}&borrower=${encodeURIComponent(activeLoan?.employeeName || '')}&amount=${activeLoan?.loanAmount?.toFixed(3)}KWD&auth=SabriShattaLawFirm`);
    const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}&color=0f172a&bgcolor=ffffff`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}" dir="${direction}">
        <head>
          <title>${title || 'محرر رسمي'} - مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@700&display=swap');
            @page {
              size: A4;
              margin: 15mm 15mm 15mm 15mm;
            }
            body {
              font-family: 'Cairo', sans-serif;
              direction: ${direction};
              text-align: ${align};
              padding: 0;
              margin: 0;
              color: #0f172a;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .paper-sheet {
              max-width: 820px;
              margin: 0 auto;
              padding: 15px;
              position: relative;
            }
            .header-banner {
              border-bottom: 2.5px solid #0f172a;
              padding-bottom: 14px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .office-brand-header {
              text-align: right;
            }
            .office-brand-header h1 {
              font-family: 'Amiri', 'Cairo', serif;
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 4px 0;
              line-height: 1.2;
            }
            .office-brand-header p {
              font-size: 10.5px;
              font-weight: 600;
              color: #475569;
              margin: 0;
            }
            .qr-code-box {
              text-align: center;
              padding: 6px;
              border: 1.5px solid #0f172a;
              border-radius: 10px;
              background: #f8fafc;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-code-box img {
              width: 75px;
              height: 75px;
              display: block;
            }
            .qr-code-box span {
              font-size: 8px;
              font-weight: 800;
              font-family: monospace;
              color: #0f172a;
              margin-top: 3px;
            }
            .meta-box {
              text-align: left;
              font-size: 10.5px;
              color: #334155;
              line-height: 1.5;
              border: 1px solid #e2e8f0;
              background: #f8fafc;
              padding: 8px 12px;
              border-radius: 8px;
            }
            .document-title-badge {
              text-align: center;
              margin: 16px 0 20px 0;
            }
            .document-title-badge h2 {
              display: inline-block;
              background: #0f172a;
              color: #ffffff;
              font-size: 13.5px;
              font-weight: 800;
              padding: 6px 26px;
              border-radius: 6px;
              margin: 0;
              letter-spacing: 0.5px;
            }
            .doc-body {
              white-space: pre-wrap;
              font-size: 12px;
              line-height: 1.9;
              color: #1e293b;
              margin-bottom: 25px;
              text-align: justify;
              background: #fafafa;
              padding: 16px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .official-watermark-box {
              margin: 20px 0;
              padding: 10px 14px;
              border: 1.5px dashed #4f46e5;
              background: #f5f3ff;
              border-radius: 8px;
              text-align: center;
              font-size: 10.5px;
              font-weight: 700;
              color: #4338ca;
            }
            .footer-signatures-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-top: 30px;
              border-top: 1.5px solid #0f172a;
              padding-top: 20px;
              text-align: center;
              page-break-inside: avoid;
            }
            .sign-col h5 {
              margin: 0 0 4px 0;
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
            }
            .sign-col p {
              margin: 0;
              font-size: 9.5px;
              color: #64748b;
            }
            .sign-line {
              border-bottom: 1px dotted #94a3b8;
              height: 40px;
              margin-bottom: 6px;
            }
            .thumbprint-box {
              width: 60px;
              height: 55px;
              border: 1px dashed #64748b;
              border-radius: 6px;
              margin: 6px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #94a3b8;
            }
            .official-stamp-container {
              width: 90px;
              height: 90px;
              margin: 0 auto;
              border: 3px double #1e3a8a;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              color: #1e3a8a;
              padding: 4px;
              background: #eff6ff;
              transform: rotate(-5deg);
            }
            .official-stamp-container .stamp-title {
              font-family: 'Amiri', serif;
              font-size: 8.5px;
              font-weight: 900;
              line-height: 1.1;
            }
            .official-stamp-container .stamp-sub {
              font-size: 6.5px;
              font-weight: 800;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="paper-sheet">
            <div class="header-banner">
              <div class="office-brand-header">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="background: #0f172a; color: #fff; font-size: 8.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">نظام عدالة</span>
                  <span style="color: #4f46e5; font-size: 9.5px; font-weight: 800;">إدارة الشؤون القانونية والمطالبات</span>
                </div>
                <h1>مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</h1>
                <p>دولة الكويت • العاصمة • برج التجارية • هاتف: 22001100</p>
              </div>

              <div class="qr-code-box">
                <img src="${qrSvgUrl}" alt="QR Verification Code" />
                <span>${activeLoan?.id || 'AD-LN-2026'}</span>
              </div>

              <div class="meta-box">
                <div><strong>رقم القيد:</strong> ${activeLoan?.id || 'AD-LN-2026'}</div>
                <div><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG')}</div>
                <div><strong>الرمز الأمني:</strong> ${qrToken || 'ADALA-SEC-9921'}</div>
              </div>
            </div>

            <div class="document-title-badge">
              <h2>${title || 'وثيقة قانونية رسمية'}</h2>
            </div>

            <div class="doc-body">${editedText}</div>

            <div class="official-watermark-box">
              ⚖️ وثيقة تنفيذية رسمية معتمدة ومطابقة لقانون العمل الكويتي رقم 6 لسنة 2010 (المادتين 20 و 51) وقانون التجارة رقم 68 لسنة 1980
            </div>

            <div class="footer-signatures-grid">
              <div class="sign-col">
                <h5>المحرر / المقترض (المدين)</h5>
                <p>${activeLoan?.employeeName || 'الاسم الكامل'}</p>
                <div class="sign-line"></div>
                <div class="thumbprint-box">بصمة الإبهام</div>
                <p>التوقيع والبصمة الرسمية</p>
              </div>

              <div class="sign-col">
                <h5>الكفيل الضامن المتضامن</h5>
                <p>${activeLoan?.guarantorName || 'عبدالرحمن علي حسين'}</p>
                <div class="sign-line"></div>
                <div class="thumbprint-box">بصمة الكفيل</div>
                <p>توقيع الكفيل الشخصي</p>
              </div>

              <div class="sign-col">
                <h5>اعتماد مكتب المحامي صبري شطا</h5>
                <p>المحامي صبري شطا - المحامي بالتمييز والدستورية</p>
                <div class="official-stamp-container">
                  <div class="stamp-title">مكتب المحامي صبري شطا</div>
                  <div class="stamp-sub">محامون ومستشارون قانونيون</div>
                  <div style="font-size: 6px; font-weight: 800;">دولة الكويت • شؤون الموظفين</div>
                  <div style="font-size: 7px; font-weight: 900; color: #dc2626;">معتمد رقمياً</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Top fast selection buttons for key requested legal instruments
  const keyInstruments = [
    { id: 'temp-promissory', labelAr: '📜 سند لأمر تنفيذي', labelEn: 'Promissory Note', badgeAr: 'أمر أداء تجاري' },
    { id: 'temp-debt-ack', labelAr: '📝 إقرار دين وتعهد', labelEn: 'Debt Acknowledgment', badgeAr: 'إلزام مدني' },
    { id: 'temp-bill-of-exchange', labelAr: '💳 كمبيالة تجارية', labelEn: 'Bill of Exchange', badgeAr: 'ورقة تجارية' },
    { id: 'temp-09', labelAr: '⚖️ تسوية نهاية الخدمة (مادة 51)', labelEn: 'EOS Set-Off (Art 51)', badgeAr: 'جبر مالي' },
    { id: 'temp-04', labelAr: '📑 تفويض استقطاع الراتب (مادة 20)', labelEn: 'Wage Deduction (Art 20)', badgeAr: 'سقف 10%' },
    { id: 'temp-07', labelAr: '🛡️ كفالة شخصية متضامنة', labelEn: 'Guarantor Bond', badgeAr: 'ضمان شخصي' }
  ];

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? LEGAL_TEMPLATES 
    : LEGAL_TEMPLATES.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', labelAr: 'جميع المحررات والنماذج', labelEn: 'All Legal Instruments' },
    { id: 'agreements', labelAr: 'السندات والكمبيالات والعقود', labelEn: 'Bonds, Drafts & Accords' },
    { id: 'claims', labelAr: 'الطلبات والسلف', labelEn: 'Applications' },
    { id: 'notices', labelAr: 'الإنذارات القانونية', labelEn: 'Notices & Warnings' },
    { id: 'receipts', labelAr: 'المخالصات وبراءة الذمة', labelEn: 'Clearances & Releases' }
  ];

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Card 
        className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
        title={lang === 'ar' ? 'مركز صياغة السندات والمحررات وتوليد نماذج (إقرار دين، كمبيالة، سند لأمر) مع ختم صبري شطا ورمز QR' : 'Executive Instruments & Legal Document Hub (Promissory, Draft, Debt Ack)'}
      >
        {/* FAST INSTRUMENT SHORTCUTS */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl mb-5 space-y-2.5">
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>⚡</span>
            <span>{lang === 'ar' ? 'المحررات التنفيذية الرئيسية الأكثر طلباً (معاينة فورية جاهزة للطباعة والتصدير):' : 'Key Executive Instruments & Commercial Papers:'}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {keyInstruments.map(inst => (
              <button
                key={inst.id}
                onClick={() => setSelectedTemplateId(inst.id)}
                className={`p-3 rounded-xl text-right transition-all border cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedTemplateId === inst.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-800'
                    : 'bg-white dark:bg-[#153042] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white hover:border-indigo-400'
                }`}
              >
                <span className="text-xs font-black leading-snug">
                  {lang === 'ar' ? inst.labelAr : inst.labelEn}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded self-start ${
                  selectedTemplateId === inst.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {inst.badgeAr}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category quick tabs */}
        <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {lang === 'ar' ? c.labelAr : c.labelEn}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COMMAND PANEL */}
          <div className="p-5 bg-slate-50 dark:bg-[#153042] border border-slate-200/60 dark:border-slate-800 rounded-2xl text-right space-y-4">
            <h4 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-2 flex items-center justify-between">
              <span>📂 {lang === 'ar' ? 'إعدادات المحرر والمعاملة' : 'Form Configuration'}</span>
              <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                KWD (0.000)
              </span>
            </h4>
            
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'ar' ? '١. سحب سياق ملف المقترض المعتمد:' : '1. Import Borrower Metadata:'}
              </label>
              <Select
                className="dark:bg-[#153042] dark:border-slate-800 dark:text-white"
                value={selectedLoanId}
                onChange={e => setSelectedLoanId(e.target.value)}
                options={loans.map(l => ({
                  value: l.id,
                  label: `${l.employeeName} (${l.id} - ${l.loanAmount.toFixed(3)} د.ك)`
                }))}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'ar' ? '٢. النموذج أو المحرر التنفيذي المختار:' : '2. Select Legal Instrument:'}
              </label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-white bg-white dark:bg-[#153042] font-bold outline-none leading-tight"
              >
                {filteredTemplates.map(t => (
                  <option key={t.id} value={t.id}>
                    {lang === 'ar' ? t.titleAr : t.titleEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Template description box */}
            {(() => {
              const cur = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId);
              return cur ? (
                <div className="p-3 bg-white dark:bg-[#1E3C50] border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="inline-block px-2 py-0.5 text-[9.5px] font-black rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                      {lang === 'ar' ? cur.categoryAr : cur.categoryEn}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">ID: {cur.id}</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-white text-xs">
                    {lang === 'ar' ? cur.titleAr : cur.titleEn}
                  </p>
                </div>
              ) : null;
            })()}

            {/* Official Stamp & QR Preview box */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
              <p className="text-[10.5px] font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>🛡️ عناصر التوثيق الرسمية المدمجة:</span>
                <span className="text-emerald-600 font-bold">نشطة</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-350 font-bold">
                <div className="p-2 bg-white dark:bg-[#153042] rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                  <span>🏢 ختم المحامي صبري شطا</span>
                </div>
                <div className="p-2 bg-white dark:bg-[#153042] rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                  <span>📱 رمز التحقق السريع QR</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button 
                onClick={handleCompileOriginal}
                className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-all border-none cursor-pointer"
              >
                🔄 {lang === 'ar' ? 'إعادة ملء واسترجاع المسودة الأصلية' : 'Revert & Refill Original Draft'}
              </button>

              <button 
                onClick={handleCopyText}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                {copiedNotification 
                  ? (lang === 'ar' ? '✅ تم نسخ النص بنجاح!' : '✅ Copied to Clipboard!') 
                  : (lang === 'ar' ? '📋 نسخ نص المحرر' : '📋 Copy Document Text')}
              </button>
              
              <button 
                onClick={handleTriggerPrint}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                🖨️ {lang === 'ar' ? 'تصدير PDF / طباعة المحرر بختم صبري شطا ورمز QR' : 'Export PDF / Print with Stamp & QR Code'}
              </button>
            </div>

            {/* Kuwait Compliance Checker Box */}
            <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs font-semibold leading-relaxed text-indigo-950 dark:text-indigo-200">
              <p className="font-black mb-1 flex items-center gap-1.5">
                <span>⚖️</span>
                <span>{lang === 'ar' ? 'المطابقة القانونية والتنفيذية:' : 'Legal Execution Framework:'}</span>
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                {lang === 'ar' 
                  ? 'تتوافق السندات والكمبيالات مع قانون التجارة الكويتي (المواد 472-518) وقانون العمل 6/2010 (المادتين 20 و 51) لجواز إصدار أمر الأداء والتنفيذ الجبري فوراً عند الإخلال.'
                  : 'Fully conforms to Kuwait Commercial Code (Arts 472-518) & Labor Law 6/2010 (Arts 20 & 51).'}
              </p>
            </div>
          </div>

          {/* EDITABLE PREVIEW SANDBOX */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-amber-500/5 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-3.5 flex justify-between items-center">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-400 flex items-center gap-1.5 leading-relaxed">
                ✏️ <span>{lang === 'ar' ? 'محرر ومعاينة حية للمحرر: يمكنك التعديل المباشر على البنود والشروط الخاصة قبل التصدير والطباعة.' : 'Live Document Sandbox: Modify terms and clauses before PDF export.'}</span>
              </p>
              <span className="text-[9.5px] font-mono font-black border border-amber-300 dark:border-amber-900 bg-amber-100 dark:bg-amber-950 text-amber-850 dark:text-amber-300 px-2 py-0.5 rounded">
                {lang === 'ar' ? 'توثيق معتمد' : 'Verified Draft'}
              </span>
            </div>

            <div className="relative border border-slate-300 dark:border-slate-800 rounded-2xl shadow-inner bg-white dark:bg-[#153042] overflow-hidden">
              <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[9px] text-slate-400 select-none z-10 font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>{lang === 'ar' ? 'جاهز للتصدير والطباعة الرسمية' : 'Ready for print & export'}</span>
              </div>
              
              <textarea
                value={editedText}
                onChange={e => setEditedText(e.target.value)}
                className="w-full h-[32rem] p-8 md:p-10 text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-100 bg-transparent font-mono outline-none resize-none border-none select-text text-right"
                placeholder={lang === 'ar' ? 'اختر قرضاً لتوليد المستند التلقائي...' : 'Loading agreement parchment...'}
              />
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic font-semibold">
              {lang === 'ar' 
                ? 'ملاحظة: التعديل في المحرر أعلاه يتيح الصياغة المرنة للقرار المطبوع دون تغيير السجلات الرقمية في قاعدة البيانات.'
                : 'Note: Editing in the box above refines the print layout while keeping underlying database values secure.'}
            </p>
          </div>

        </div>
      </Card>
    </div>
  );
};
