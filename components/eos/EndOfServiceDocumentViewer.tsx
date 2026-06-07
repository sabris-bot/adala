import React, { useState, useMemo, useEffect } from 'react';
import { 
  Printer, FileText, Download, CheckSquare, 
  Sparkles, Check, Bookmark, FileSpreadsheet, Key, Laptop, Scale
} from 'lucide-react';
import { EOS_Settlement } from '../../types';
import { useLanguage } from '../i18n/LanguageProvider';

interface EndOfServiceDocumentViewerProps {
  activeCase: EOS_Settlement;
  activeRole: 'hr' | 'legal' | 'finance' | 'manager' | 'gm' | 'executive';
  onSignOff: (updatedSignatures: any, updatedApprovals: any, comment: string) => void;
}

export const EndOfServiceDocumentViewer: React.FC<EndOfServiceDocumentViewerProps> = ({
  activeCase,
  activeRole,
  onSignOff
}) => {
  const { language } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('unified');
  const [userComment, setUserComment] = useState<string>('');
  const [editableText, setEditableText] = useState<string>('');

  // 10 Official Document Templates Catalog (Bilingual Title Mapping)
  const docTemplates = [
    { 
      id: 'unified', 
      titleAr: 'سند التسوية العمالية والمخالصة النهائية الموحدة', 
      titleEn: 'Unified Labor Settlement Act and Mutual Discharge' 
    },
    { 
      id: 'clearance', 
      titleAr: 'شهادة براءة الذمة التفصيلية ومخالصة العهد', 
      titleEn: 'Detailed Certificate of Release and Clearance of Assets' 
    },
    { 
      id: 'experience', 
      titleAr: 'شهادة خبرة وخدمة عمالية معتمدة', 
      titleEn: 'Certified Employment Experience & Service Certificate' 
    },
    { 
      id: 'termination', 
      titleAr: 'قرار إداري نهائي بإنهاء خدمة عمالية', 
      titleEn: 'Official Administrative Decision for Employee Dismissal' 
    },
    { 
      id: 'resignation', 
      titleAr: 'إشعار قبول استقالة الموظف رسمياً', 
      titleEn: 'Official Acceptance Notice of Employee Resignation' 
    },
    { 
      id: 'handover', 
      titleAr: 'محضر تصفية وجرد العهد والأنظمة العينية', 
      titleEn: 'Record of Liquidation and Auditing of Corporate Handover' 
    },
    { 
      id: 'receipt', 
      titleAr: 'إقرار استلام مالي ومخالصة إبرائية مطلقة', 
      titleEn: 'Irrevocable Receipt of Dues & Mutual Release Agreement' 
    },
    { 
      id: 'warning', 
      titleAr: 'إشعار عمالي وإنذار إداري بالانقطاع', 
      titleEn: 'Legal Notice and Administrative Warning for Absence' 
    },
    { 
      id: 'financial_ledger', 
      titleAr: 'كشف ميزان الحساب المالي التفصيلي للمستحقات', 
      titleEn: 'Detailed Financial Ledger Balance of Entitlements' 
    },
    { 
      id: 'mutual_settlement', 
      titleAr: 'اتفاقية تسوية ودية موحدة لفض النزاعات', 
      titleEn: 'Unified Mutual Amicable Settlement Agreement' 
    }
  ];

  // Helper values
  const formattedNet = useMemo(() => activeCase.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedIndemnity = useMemo(() => activeCase.indemnityAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedLeave = useMemo(() => activeCase.leaveBalanceAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedSalary = useMemo(() => (activeCase.accruedSalaryAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedOther = useMemo(() => (activeCase.otherBonuses || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedLoans = useMemo(() => (activeCase.loansDeduction || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedAbsence = useMemo(() => (activeCase.absenceDeduction || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedDisciplinary = useMemo(() => (activeCase.disciplinaryDeductions || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  const formattedIns = useMemo(() => (activeCase.socialInsuranceDeduction || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }), [activeCase]);
  
  const totalDuesTotal = activeCase.indemnityAmount + activeCase.leaveBalanceAmount + (activeCase.accruedSalaryAmount || 0) + (activeCase.noticePeriodAmount || 0) + (activeCase.otherBonuses || 0);
  const totalDeductsTotal = (activeCase.loansDeduction || 0) + (activeCase.absenceDeduction || 0) + (activeCase.disciplinaryDeductions || 0) + (activeCase.socialInsuranceDeduction || 0);

  const formattedDuesTotal = useMemo(() => totalDuesTotal.toLocaleString(undefined, { minimumFractionDigits: 3 }), [totalDuesTotal]);
  const formattedDeductsTotal = useMemo(() => totalDeductsTotal.toLocaleString(undefined, { minimumFractionDigits: 3 }), [totalDeductsTotal]);

  const printDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Numeral Converter: Translate Arabic inputs and dates to Eastern numbers
  const toEasternArabicNumerals = (numStr: string): string => {
    if (language !== 'ar') return numStr;
    const easternNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return numStr.replace(/[0-9]/g, (w) => easternNumbers[parseInt(w)]);
  };

  // Load dynamic office names to synchronize with user profile preferences
  const officeNameAr = useMemo(() => {
    try {
      const savedOffice = localStorage.getItem('profile_office_info');
      if (savedOffice) {
        const parsed = JSON.parse(savedOffice);
        if (parsed.name) return parsed.name;
      }
    } catch (e) {
      console.error('Error loading dynamic office name in document viewer', e);
    }
    return "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية";
  }, []);

  const officeNameEn = useMemo(() => {
    try {
      const savedOffice = localStorage.getItem('profile_office_info');
      if (savedOffice) {
        const parsed = JSON.parse(savedOffice);
        if (parsed.name && parsed.name !== "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية") {
          return parsed.name.replace(/مكتب المحامي/g, "Lawyer").replace(/للمحاماة والاستشارات القانونية/g, "Law Firm & Legal Consultations");
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "Sabri Shatta Law Firm & Legal Consultations";
  }, []);

  // Generate textual content for the 10 document types dynamically (AR and EN Symmetrical Duality)
  const documentContent = useMemo(() => {
    const isAr = language === 'ar';

    switch (selectedTemplate) {
      case 'clearance':
        if (isAr) {
          return `شهادة براءة ذمة عمالية تفصيلية وإبراء مالي وقانوني
الرقم المرجعي للسند المعتمد: [ ${toEasternArabicNumerals(String(activeCase.settlementNumber || activeCase.id))} ]
التاريخ الفعلي للمخالصة الصادرة: ${toEasternArabicNumerals(printDate)}

بموجب حضور الأطراف المعنية، يقرر قسم الشؤون القانونية والموارد البشرية بـ [ ${officeNameAr} ] برعاية [ عدالة - منظومة الإدارة القانونية المتكاملة v3 ] بأن الموظف المذكور أدناه قد تمت براءة ذمته المالية تجاه المنشأة بصفة نهائية:

■ بيانات الموظف المعتمدة:
  • اسم الموظف: السيد/ ${activeCase.employeeName}
  • الرقم المدني المعتمد: [ ${toEasternArabicNumerals(activeCase.employeeId)} ]
  • المسمى الوظيفي والصفة: ${activeCase.jobTitle || 'عضو الكادر الإداري'}
  • القسم/القطاع الفني: ${activeCase.department || 'قطاع التشغيل والمباشرة'}
  • تاريخ بدء العلاقة التعاقدية: ${toEasternArabicNumerals(activeCase.joiningDate || 'تاريخ التعيين المرفوع')}
  • تاريخ انتهاء علاقة العمل: ${toEasternArabicNumerals(activeCase.lastWorkingDay)}

■ فحص العهد والأصول العينية المُستلمة:
  - جهاز الحاسب المحمول (اللابتوب) وملحقاته: (تم الفحص والاستلام بحالة سليمة ✔)
  - بطاقة المرور والدخول الذكي للأقسام والمباني: (تم الإلغاء وسحب الصلاحيات ✔)
  - مفاتيح المكاتب والخزائن العينية المخصصة: (تم الجرد والاسترداد الكامل ✔)
  - القروض الشخصية والسلف والخصومات اللائحية: (تمت المقاصة والتصفية المالية الكاملة ✔)

وبموجب هذا، تمنح براءة الذمة هذه للموظف تمهيداً لإجراء التحويل البنكي لصافي مستحقات نهاية خدمته والبالغ قدره [ ${toEasternArabicNumerals(formattedNet)} د.ك ] (دينار كويتي)، ولا يترتب على جهة العمل أي مطالبات مستقبلية بموجب هذا السند المعتمد.`;
        } else {
          return `Detailed Certificate of Release, Financial & Asset Settlement
Reference Verification ID: [ ${activeCase.settlementNumber || activeCase.id} ]
Date of Clearance Issuance: ${printDate}

By present witness, the Department of HR and Legal Affairs of [ ${officeNameEn} ] (Powered by Adalah Legal Management System v3) hereby certifies that the employee listed below has settled all their obligations and custody assets:

■ Employee Profiles & Custody Details:
  • Employee Name: Mr. ${activeCase.employeeName}
  • Kuwaiti Civil ID: [ ${activeCase.employeeId} ]
  • Official Job Designation: ${activeCase.jobTitle || 'Administrative Specialist'}
  • Assigned Department: ${activeCase.department || 'Technical Division'}
  • Employment Commencement Date: ${activeCase.joiningDate || 'Approved Hire Date'}
  • Final Day of Employment: ${activeCase.lastWorkingDay}

■ Asset Handover Verification:
  - Corporate Laptop & Professional Peripheral Devices: Checked and Received in Good Condition ✔
  - Corporate Access Card & Digital Building Clearances: Revoked & Cleared Successfully ✔
  - Physical Keys, Storage & Office Cabinets Custody: Inspected & Transferred Back ✔
  - Personal Loans, Cash Advances & Disciplinary Offsets: Adjusted for Legal Net Settlements ✔

Therefore, this certificate is issued to confirm that the employee has no outstanding liabilities. This release is granted in preparation for the direct bank transfer of the net payout amounting to [ ${formattedNet} KWD ], with no further claims permitted by either party.`;
        }

      case 'experience':
        if (isAr) {
          return `شهادة خدمة وخبرة عملية وقانونية معتمدة
الرقم التسلسلي الصادر: Ref-#-EXP-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ الطباعة المعتمدة: ${toEasternArabicNumerals(printDate)}

يشهد [ ${officeNameAr} ] بدولة الكويت (برعاية عدالة - منظومة الإدارة القانونية المتكاملة) بأن السيد/ ${activeCase.employeeName}، الحامل للرقم المدني [ ${toEasternArabicNumerals(activeCase.employeeId)} ] وبموجب جنسيته [ ${activeCase.nationality || 'غير كويتي'} ]، قد عمل لدينا بانتظام وتفاني تام:

• المسمى الوظيفي المعتاد: ${activeCase.jobTitle || 'عضو الكادر التقني والقانوني'}
• القسم والقطاع المعين به: ${activeCase.department || 'إدارة الشؤون والتشغيل المهني'}
• فترة العمل الفعلية المسجلة: 
  من تاريخ: [ ${toEasternArabicNumerals(activeCase.joiningDate || 'تاريخ التعيين')} ]  إلى تاريخ: [ ${toEasternArabicNumerals(activeCase.lastWorkingDay)} ]
• مدة الخدمة الطولية المنجزة: ${toEasternArabicNumerals(String(activeCase.serviceYears))} سنة ، ${toEasternArabicNumerals(String(activeCase.serviceMonths))} أشهر ، و ${toEasternArabicNumerals(String(activeCase.serviceDays))} يوماً عمالياً.

وقد تميز الموظف خلال فترة مباشرتهم للعمل بالسلوك القانوني والمهني الراقي، والالتزام بأهداف المنشأة وقواعد لائحته الإدارية، ولم يتخلل مساره المهني أي مخالفات تشكل خروجاً عن مقتضيات الأمانة أو القانون العام. 

وقدمت له هذه الشهادة الرسمية بناءً على رغبته الشخصية لاستخدامها في تقديماتها المهنية القادمة دون أدنى مسؤولية أو التزام قانوني يقع عاتق هذا المكتب الوطني.`;
        } else {
          return `Certified Employment Experience & Service Certificate
Reference Certification Serial: Ref-#-EXP-${activeCase.id}
Verification Date: ${printDate}

Sabri Shatta Law Firm & Legal Consultations in the State of Kuwait hereby certifies that Mr. ${activeCase.employeeName}, holder of Civil ID [ ${activeCase.employeeId} ] and of nationality [ ${activeCase.nationality || 'Non-Kuwaiti'} ], has been employed by our organization with integrity and dedication:

• Operational Job Title: ${activeCase.jobTitle || 'Legal Practitioner'}
• Division or Department: ${activeCase.department || 'Legal Operations'}
• Period of Active Service:
  From: [ ${activeCase.joiningDate || 'Date of hire'} ]  To: [ ${activeCase.lastWorkingDay} ]
• Total Duration of Service: ${activeCase.serviceYears} Years, ${activeCase.serviceMonths} Months, and ${activeCase.serviceDays} Days of active duty.

During their tenure, the employee demonstrated exceptional legal skills, professional work ethics, and compliance with administrative charts. No warnings or incidents of default were recorded.

This certificate is provided to the employee upon their personal request for future career opportunities, without any financial or collateral liability on our firm.`;
        }

      case 'termination':
        if (isAr) {
          return `قرار مبرم رسمي بإنهاء الرابطة وعقد العمل الفردي
رقم الإشعار التنفيذي: HR-DEC-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ صدور وتعميم القرار الإداري: ${toEasternArabicNumerals(printDate)}

تعلن الإدارة العامة بالشركة والمدير العام التنفيذي، بعد الاطلاع على لجان قانون العمل الكويتي رقم 6 لسنة 2010 واللوائح الإدارية المبرمة، ما يلي:

أولاً: يُنهى عقد العمل الموثق مع السيد/ ${activeCase.employeeName} (الرقم المدني: ${toEasternArabicNumerals(activeCase.employeeId)}) الحاصل على مسمى: ${activeCase.jobTitle || 'موظف'}، وذلك لأسباب تعود لـ:
  [ ${activeCase.terminationReason} ]

ثانياً: يعتبر تاريخ [ ${toEasternArabicNumerals(activeCase.lastWorkingDay)} ] هو آخر أيام الخدمة الفعلية المباشرة والمدرجة بالكشف العمالي، ولا تجوز له ممارسة أي صفة تمثيلية للمنشأة بعد هذا التاريخ عمالياً في دولة الكويت.

ثالثاً: تقوم الدائرة المالية وشؤون الحسابات آلياً بتصفية حقوق الموظف بشكل متكامل وفقاً لقانون العمل لتسليمه صافي مخصص الاندمنتي والبالغ [ ${toEasternArabicNumerals(formattedNet)} د.ك ]، بعد الخصومات المعتمدة وقيمتها الكلية [ ${toEasternArabicNumerals(formattedDeductsTotal)} د.ك ].

رابعاً: يُعمم هذا القرار الإداري على كافة الفروع وقطاعات نظم المعلومات لإلغاء تراخيص الحوسبة، مع تمنيات الإدارة للموظف بالتوفيق والنجاح.`;
        } else {
          return `Official Administrative Decision for Separation & Dismissal
Administrative Notification ID: HR-DEC-${activeCase.id}
Notification Issuance Date: ${printDate}

The Executive Management and Board of Directors, having reviewed the Kuwaiti Labor Law No. 6 of 2010 and the internal administrative charts, hereby decree:

First: The employment relationship of Mr. ${activeCase.employeeName} (Civil ID: ${activeCase.employeeId}, Designation: ${activeCase.jobTitle || 'Employee'}) is terminated due to:
  [ ${activeCase.terminationReason} ]

Second: The final day of active service in our records will be [ ${activeCase.lastWorkingDay} ]. After this date, the employee has no legal capacity to represent the firm.

Third: The Treasury and Payroll Sector shall process the final settlement. The net payout is computed at [ ${formattedNet} KWD ] after deducting total pending offsets of [ ${formattedDeductsTotal} KWD ].

Fourth: This decree shall be circulated internally for the revocation of IT access, system logins, and building permissions. We wish the employee success in their future endeavors.`;
        }

      case 'resignation':
        if (isAr) {
          return `خطاب قبول رسمي ومسبق لطلب الاستقالة العمالية
رقم الإشارة القانوني: HR-RESIG-ACCEPT-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ التوثيق والقبول: ${toEasternArabicNumerals(printDate)}

إلى السيد الزميل الموقر/ ${activeCase.employeeName}
تحية طيبة وبعد،،

بالإشارة إلى طلب الاستقالة الفردية الطوعية المقدم من طرفكم للعمل في منشأتنا والمسجل برغبتكم بموجب مواد الباب الخامس من قانون العمل الكويتي، تود الشؤون الإدارية إعلامكم بالتالي:

١. تم موافقة وقبول طلب استقالتكم رسمياً وبموجب مقتضيات المادة (53) من القانون العمالي.
٢. يعتبر تاريخ [ ${toEasternArabicNumerals(activeCase.lastWorkingDay)} ] هو التاريخ الأخير لإنهاء الارتباط والمباشرة في مكاتبنا.
٣. يرجى مراجعة ممثل الدائرة القانونية والمالية لإجراء تفتيش وجرد العهد الممنوحة لاستبراء براءة الذمة.
٤. تم حوسبة مستحقات تصفية الخدمة والنسبة الخاضعة لسنوات خدمتكم البالغة (${toEasternArabicNumerals(String(activeCase.serviceYears))} سنوات) بشكل نهائي، تمنياتنا لكم بمسارات مهنية ملؤها النجاح الباهر في مستقبلكم.`;
        } else {
          return `Official Receipt and Formal Acceptance of Job Resignation
Administrative Act ID: HR-RESIG-ACCEPT-${activeCase.id}
Date of Formal Sanction: ${printDate}

To: Mr. ${activeCase.employeeName}
Subject: Formal Acceptance of Resignation

With reference to your submitted voluntary resignation from our organization, governed by the Kuwait Labor Law (Private Sector), we hereby inform you of the following:

1. Your request for resignation has been accepted under the statutory provisions of Article (53) of the Kuwaiti Labor Law.
2. Your final date of employment is set for [ ${activeCase.lastWorkingDay} ].
3. You are kindly requested to complete the physical and digital asset handover with the IT and HR departments to finalize your general clearance certificate.
4. Your final end-of-service indemnity calculations have been calculated for your total service of (${activeCase.serviceYears} Years). We wish you prosperity and success in your future path.`;
        }

      case 'handover':
        if (isAr) {
          return `محضر تصفية وجرد العهد العينية والأصول المؤسسية
رقم محضر الجرد التفتيشي: Ref-#-HANDOVER-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ إجراء المعاينة الفنية: ${toEasternArabicNumerals(activeCase.lastWorkingDay)}

تم في هذا اليوم تشكيل لجنة تفتيش مصغرة من قطاع الموارد التقنية وشؤون الكادر لجرد وفحص العهد العينية المسلمة بعهدة الموظف السيد/ ${activeCase.employeeName}:

١. الأجهزة والوسائط التكنولوجية:
  • جهاز لابتوب الشركة: (تم التسليم ✔ • الحالة الفنية: ممتازة وخالية من الإعطاب)
  • شاحن وبطارية إضافية وحقيبة العمل الرسمية: (مستلم بالكامل ✔)

٢. الأمان والملفات وسيارات الكادر:
  • كروت ذكية وبطاقات النفاذ لبوابات الكادر وأجهزة الحوسبة: (تم سحبها وتعطيل كود الأمن ✔)
  • مفاتيح مكتبية وخزائن عينية مخصصة: (مستردة وتم فحص الأوراق السارية ✔)

٣. ملاحظات فنية قانونية إضافية:
تم قطع خط الموبايل المخصص والاستقطاع التمحيصي من الموازنة ولا يوجد أي عجز أو ذمة مالية تقع على عاتق الكوادر. وبموجب هذا الإقرار يوقع ممثل الإدارة بالاستلام الفوري للأصول.`;
        } else {
          return `Record of Custody Auditing & Corporate Asset Handover
Handover Serial Number: Ref-#-HANDOVER-${activeCase.id}
Inspection Audit Date: ${activeCase.lastWorkingDay}

A special audit committee was formed by the Asset Management division to inspect and verify the return of all firm-owned assets under the custody of Mr. ${activeCase.employeeName}:

1. Technological Hardware and Digital Storage:
   • Work laptop and associated hardware: (Returned ✔ • Clean inspected status)
   • Extra power adapter, cables, and official laptop bag: (Returned ✔)

2. Building Security and Confidential Files:
   • Employee access cards, badges, and server keys: (Deactivated & Cryptographically Revoked ✔)
   • Office drawers, storage lockers, and physical keys: (Returned & Securely Logged ✔)

3. Legal and Accountancy Remarks:
   Mobile SIM cards and associated plans are terminated. No outstanding asset mismatches remain. We hereby sign this record to authorize the release of the final settlement.`;
        }

      case 'receipt':
        if (isAr) {
          return `إقرار استلام نقدي وبراءة ذمة مطلقة لا رجعة فيها
الرقم المرجعي القانوني: Ref-#-RECEIPT-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ الوفاء المالي الموثق بالتوقيع: ${toEasternArabicNumerals(printDate)}

أقر أنا الموظف الموقع أدناه بكامل أهليتي الوجوبية العقلية وإرادتي الحرة المستقلة بما يلي:

١. أنني قد استلمت من جهة عملي [ ${officeNameAr} ] كافة مستحقاتي ونهاية خدمتي العمالية والراتب المتأخر وتعويض إجازاتي السنوية البالغ صافيها الرقمي: [ ${toEasternArabicNumerals(formattedNet)} دينار كويتي لا غير ]، وذلك بموجب تفويض تحويل بنكي مباشر لصالح حساب الأيبان الخاص بي.

٢. أنني بموجب توقيع هذا السند، أعلن براءة طرف جهة عملي براءة تامة، مطلقة، مانعة، ولا رجعة فيها عمالياً وقانونياً أمام المحاكم والهيئات بوزارة القوى العاملة بدولة الكويت من أي علاقة عمالية سابقة أو حالية، سارية أو مستقبلية.

٣. ألتزم التزاماً كلياً بعدم تنظيم أي شكاوى، ملاحقات قضائية، نزاعات، أو دعاوى في الحاضر والمستقبل، وأن توقيع هذا المستند الموحد يعتبر مخالصة ختامية وتنازل تام عن الخلاف.`;
        } else {
          return `Absolute and Irrevocable Receipt of Dues & Mutual Release
Legal Instrument ID: Ref-#-RECEIPT-${activeCase.id}
Date of Verified Remittance: ${printDate}

I, the undersigned employee, in full mental and legal capacity, hereby declare and acknowledge that:

1. I have received my final end-of-service indemnity, unused annual leaves, unpaid salary, and other allowances which total the net sum of [ ${formattedNet} KWD ] through direct automatic bank transfer to my designated IBAN bank account.

2. By signing this document, I declare that my employer is completely, absolutely, and irrevocably cleared of any liabilities. This serves as a mutual discharge of all obligations or labor rights under the Kuwaiti labor authorities or judicial structures.

3. I solemnly commit not to initiate any complaints, disputes, or civil lawsuits before the Public Authority for Manpower or any competent court in the State of Kuwait.`;
        }

      case 'warning':
        if (isAr) {
          return `إشعار قانوني وإنذار إداري بالانقطاع والغياب العشوائي
الرقم المرجعي للإنذار: HR-WARN-ABSENCE-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ توثيق المخالفة: ${toEasternArabicNumerals(activeCase.lastWorkingDay)}

إلى السيد الموظف/ ${activeCase.employeeName}
الحائز على البطاقة المدنية رقم [ ${toEasternArabicNumerals(activeCase.employeeId)} ]

يرجى إحاطتكم علماً بأن المنظومة الرقابية لتسجيل الحضور والانصراف قد رصدت انقطاعكم المتكرر عن الدوام دون إذن رسمي مسبق أو عذر مدعوم بالمستندات الطبية لما يلي:
  - عدد أيام الانقطاع والغياب غير المبررة: [ ${toEasternArabicNumerals(String(activeCase.absenceDays || 0))} ] يوماً عمالياً.
  - قيمة الخصم المترتب على الغياب: [ ${toEasternArabicNumerals(formattedAbsence)} د.ك ].

وتعتبر هذه المخالفة العمالية خروجاً عن مقتضيات المادة (42) من قانون العمل في القطاع الأهلي الكويتي، ونحيطكم علماً بأن استمراركم الغياب لأكثر من 7 أيام متصلة أو 15 يوماً منفصلة سيعرضكم للفصل الفوري التسبيبي بموجب المادة (41) مع حرمان كامل من الاندمنتي ونهاية الخدمة.`;
        } else {
          return `Legal Notice & Administrative Warning for Unexcused Absence
Notice Reference ID: HR-WARN-ABSENCE-${activeCase.id}
Notice Generation Date: ${activeCase.lastWorkingDay}

To: Mr. ${activeCase.employeeName}
Kuwaiti Civil ID: [ ${activeCase.employeeId} ]

Please be advised that the Attendance Registry and payroll systems have recorded multiple unexcused absences without prior approval or supporting medical documents:
  - Total Unexcused Absent Days: [ ${activeCase.absenceDays || 0} ] active working days.
  - Calculated Accrued Salary Deduction: [ ${formattedAbsence} KWD ].

This conduct violates Article (42) of the Kuwaiti Labor Law for Private Sector. Constant unexcused absence for more than 7 consecutive days or 15 non-consecutive days will result in disciplinary dismissal under Article (41) with full loss of indemnity benefits.`;
        }

      case 'financial_ledger':
        if (isAr) {
          return `كشف حساب وميزان دائن عمالي تفصيلي للعمليات المالية
الرقم المالي المرجعي للموازنة: Ref-#-LEDGER-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ تقرير الميزان التفصيلي: ${toEasternArabicNumerals(printDate)}

بيانات كشف مخصص تصفية نهاية الخدمة والعمليات الرياضية للراتب:
اسم الموظف: السيد/ ${activeCase.employeeName}  |  الأجر الإجمالي: ${toEasternArabicNumerals(String(activeCase.grossSalary || 0))} د.ك

١. ميزان الدائن لمدفوعات ومكتسبات الكادر (+):
  • مكافأة نهاية الخدمة التراكمية (الاندمنتي): ${toEasternArabicNumerals(formattedIndemnity)} د.ك
  • تعويض تسييل كاش رصيد الإجازات (${toEasternArabicNumerals(String(activeCase.leaveBalanceDays || 0))} يوماً): ${toEasternArabicNumerals(formattedLeave)} د.ك
  • الراتب المتراصد عن الأيام الفعلية المباشرة بالشهر الأخير: ${toEasternArabicNumerals(formattedSalary)} د.ك
  • بدلات، عمولات، ومخصصات إضافية ممتازة: ${toEasternArabicNumerals(formattedOther)} د.ك
  • تعويض بدل مهلة الإنذار عمالياً: ${toEasternArabicNumerals((activeCase.noticePeriodAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }))} د.ك
  -----------------------------------------------
  » مجموع المستحقات والامتيازات الإيجابية: ${toEasternArabicNumerals(formattedDuesTotal)} د.ك

٢. ميزان المقاصة والخصومات العكسية للمنشأة (-):
  • مقاصة القروض الشخصية والسلف المصرفية: ${toEasternArabicNumerals(formattedLoans)} د.ك
  • خصومات غيابات غير مستندة: ${toEasternArabicNumerals(formattedAbsence)} د.ك
  • خصومات في لائحة العقوبات والمجالس التأديبية: ${toEasternArabicNumerals(formattedDisciplinary)} د.ك
  • استقطاع التأمينات والتقاعد الوطنية للمؤسسة: ${toEasternArabicNumerals(formattedIns)} د.ك
  -----------------------------------------------
  » مجموع الاستردادات والخصومات المستبعدة: ${toEasternArabicNumerals(formattedDeductsTotal)} د.ك

الصافي المالي النهائي المعد للتحويل والصرف الموثق: [ ${toEasternArabicNumerals(formattedNet)} د.ك ]`;
        } else {
          return `Detailed Financial Ledger & Balance Sheet of Entitlements
Financial Dossier ID: Ref-#-LEDGER-${activeCase.id}
Balance Computations Date: ${printDate}

Verification of End-of-Service Entitlements & Payroll Deductions:
Employee Name: Mr. ${activeCase.employeeName}  |  Base Monthly Gross Salary: ${activeCase.grossSalary || 0} KWD

1. Positive Credits & Employee Accrued Entitlements (+):
   • Indemnity / End of Service Gratuity Balance: ${formattedIndemnity} KWD
   • Compensation for Unused Leave Days (${activeCase.leaveBalanceDays || 0} Days): ${formattedLeave} KWD
   • Unpaid Accrued Days from Last Salary Cycle: ${formattedSalary} KWD
   • Approved Corporate Bonuses, Allowances, and Commendations: ${formattedOther} KWD
   • Compensation for notice period: ${(activeCase.noticePeriodAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD
   -------------------------------------------------
   » Total Gross Credits: ${formattedDuesTotal} KWD

2. Negative Debits & Corporate Recoveries / Deductions (-):
   • Setoff of Staff Loans and Cash Advances: ${formattedLoans} KWD
   • Unauthorized Absence Deductions (Article 42): ${formattedAbsence} KWD
   • Disciplinary Fines & Administrative Code Penalties: ${formattedDisciplinary} KWD
   • Social Security (PIFSS) and National Pension Deductions: ${formattedIns} KWD
   -------------------------------------------------
   » Total Deductions: ${formattedDeductsTotal} KWD

Net Entitlements Eligible for Remittance:
» Net Approved Transfer Balance: [ ${formattedNet} KWD Only ]`;
        }

      case 'mutual_settlement':
        if (isAr) {
          return `اتفاقية تسوية ودية موحدة وعقد صلح عمالي لفض النزع
رقم الاتفاقية القضائية: HR-MUTUAL-SETTLE-${toEasternArabicNumerals(String(activeCase.id))}
تاريخ التوثيق للصلح: ${toEasternArabicNumerals(printDate)}

إنه في هذا اليوم المبرم، تم الاتفاق والصلح الرضائي الودي بين كل من:
• الطرف الأول (صاحب العمل): ${officeNameAr} (برعاية عدالة - منظومة الإدارة القانونية المتكاملة v3)
• الطرف الثاني (العامل): السيد/ ${activeCase.employeeName}

تمهيداً للمصالحة، وبموجب نشوء خلاف عمالي حول تصفية نهاية الخدمة وقواعد الخصم، اتفق الطرفان طوعاً وبنية حسنة على فض الخلاف حبياً خارج قاعات المحاكم كالتالي:

أولاً: يلتزم الطرف الأول بسداد مبلغ مقطوع متفق عليه وقدره [ ${toEasternArabicNumerals(formattedNet)} دينار كويتي ] بموجب مخالصة الصرف المصرفي كحصاد مطلق ونهائي لكافة مستحقات العامل.

ثانياً: يقر الطرف الثاني الموظف بالقبول بهذا التعويض الودي وموافقته الشاملة وتنازله المطلق عن كافة الدعاوى المسجلة أمام الهيئة العامة للقوى العاملة بدولة الكويت أو المحكمة العمالية.

ثالثاً: يقر الطرفان بنقاء المباشرة وبراءة الذمة من أي متعلقات وعُهد عينية أو ممتلكات متبادلة، وتعتبر هذه الاتفاقية عقداً ملزماً ونهائياً ومخالصة تامة للحقوق طوعياً.`;
        } else {
          return `Unified Mutual Amicable Settlement Agreement & Dispute Resolution
Legal Settle ID: HR-MUTUAL-SETTLE-${activeCase.id}
Agreement Execution Date: ${printDate}

By this mutual agreement, a final and amicable labor settlement has been executed between:
• First Party (Employer): Sabri Shatta Law Firm & Legal Consultations
• Second Party (Employee): Mr. ${activeCase.employeeName}

To avoid potential litigation, both parties have settled all active employment claims out of court as follows:

First: The First Party agrees to pay a lump sum of [ ${formattedNet} KWD ] in full satisfaction of the Second Party's end-of-service entitlements.

Second: The Second Party accepts this amicable compensation and waives all complaints filed with the Public Authority for Manpower or the Kuwaiti labor courts.

Third: Both parties confirm that all company assets, files, and custody items have been returned in full, making this agreement a final, binding, and absolute discharge.`;
        }

      default: // unified (A4)
        if (isAr) {
          return `براءة ذمة شاملة وإقرار مخالصة عمالية نهائية موحدة
الرقم المرجعي للسند المعتمد: [ ${toEasternArabicNumerals(String(activeCase.settlementNumber || activeCase.id))} ]
تاريخ إصدار وتوثيق السند الكلي للطباعة: ${toEasternArabicNumerals(printDate)}

أولاً: بيانات كارت الهوية والتعاقد الرئيسي:
■ الطرف الأول (العامل): السيد/ ${activeCase.employeeName}
■ الرقم المدني المعتمد: [ ${toEasternArabicNumerals(activeCase.employeeId)} ]
■ المسمى الوظيفي: ${activeCase.jobTitle || 'موظف بقطاع المباشرة'}  |  عقد العمل الموثق: [ ${activeCase.contractType || 'غير محدد المدة'} ]
■ القطاع العمالي: [ القطاع الأهلي / النفطي خاضع لقانون العمل الكويتي ]
■ تاريخ إبرام المباشرة للعمل: ${toEasternArabicNumerals(activeCase.joiningDate || '2022-01-01')}  |  تاريخ آخر يوم عمل فعلي في المنشأة: ${toEasternArabicNumerals(activeCase.lastWorkingDay)}
■ مدة الخدمة الفعلية الإجمالية المعتمدة: ${toEasternArabicNumerals(String(activeCase.serviceYears))} سنة ، ${toEasternArabicNumerals(String(activeCase.serviceMonths))} أشهر ، ${toEasternArabicNumerals(String(activeCase.serviceDays))} أيام
■ مبرر إنهاء العلاقة القانونية: [ ${activeCase.terminationReason} ]

ثانياً: ميزان العمليات المالية والخصم اللائحي:
١. ذمم المخصصات والمستحقات المكتسبة للموظف (+):
  • مكافأة نهاية الخدمة (Indemnity Gratuity): ${toEasternArabicNumerals(formattedIndemnity)} د.ك
  • تعويض تسييل رصيد الإجازات السنوية المتبقية (${toEasternArabicNumerals(String(activeCase.leaveBalanceDays || 0))} يوماً): ${toEasternArabicNumerals(formattedLeave)} د.ك
  • الراتب المتراصد عن الأيام الفعلية المباشرة بالشهر الأخير: ${toEasternArabicNumerals(formattedSalary)} د.ك
  • مكافآت وبدلات وعلاوات إضافية أخرى بالبيرول: ${toEasternArabicNumerals(formattedOther)} د.ك
  • بدل مهلة الإنذار والإخطار عمالياً: ${toEasternArabicNumerals((activeCase.noticePeriodAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 }))} د.ك
  -----------------------------------------------
  » إجمالي مستحقات وبدلات الكادر التراكمية: ${toEasternArabicNumerals(formattedDuesTotal)} د.ك

٢. الاقتطاعات والاستحقاقات العكسية المسددة للمنشأة (-):
  • سداد ذمة القروض الشخصية وعجز السلف: ${toEasternArabicNumerals(formattedLoans)} د.ك
  • الغيابات غير المستندة والانقطاعات العشوائية مادة 42: ${toEasternArabicNumerals(formattedAbsence)} د.ك
  • الخصومات اللائحية والأحكام الجزئية التأديبية: ${toEasternArabicNumerals(formattedDisciplinary)} د.ك
  • استقطاعات التأمينات والاشتراكات الوطنية للمؤسسة: ${toEasternArabicNumerals(formattedIns)} د.ك
  -----------------------------------------------
  » إجمالي اقتطاعات وخصومات الموظف الكلية: ${toEasternArabicNumerals(formattedDeductsTotal)} د.ك

الصافي المالي النهائي المعد للصرف البنكي المباشر:
» صافي غلة الحصاد المالي المعتمد للتحويل: [ ${toEasternArabicNumerals(formattedNet)} دينار كويتي لا غير ]

ثالثاً: السند والتفسير القانوني طبقاً لمشرّع دولة الكويت:
بموجب سبب انتهاء العلاقة المصنف عمالياً بـ ( ${activeCase.terminationReason} )، تم موازنة المكافأة وتطبيق مواد الباب الرابع والباب الخامس من قانون العمل رقم (٦) لعام ٢٠١٠ بشأن العمل في القطاع الأهلي الكويتي والمعدلات الخاضعة لقرارات ديوان الخدمة المدنية ومؤسسة البترول الوطنية.

رابعاً: إقرار الاستلام وبراءة الذمة ومخالصة عدم نزاع عمالي:
بموجب إظهاري وتوقيعي على هذا المحضر الشامل، أقر أنا الموظف المذكور أعلاه بكامل أهليتي وإرادتي الحرة بأنني تسلمت من جهة العمل كامل مستحقاتي العمالية الناشئة عن عقد العمل، وبموجب ذلك أعلن براءة ذمة جهة عملي براءة ذمة تامة وشاملة ومطلقة ووفاءً رضائياً لا رجعة فيه من أي حق مالي أو عيني أو مطالبات مهنية سارية أو مستقبلية، متعهداً بعدم رفع أي شكاوى أو تنظيم دعاوى أمام الهيئة العامة للقوى العاملة أو لجان فض المنازعات العمالية أو جهة المحاكم القضائية المختصة بدولة الكويت.`;
        } else {
          return `Unified Certificate of Release & General Mutual Labor Discharge
Reference Act Number: [ ${activeCase.settlementNumber || activeCase.id} ]
Record Generation Date: ${printDate}

First: Personal Profile & Contract Indication:
■ Employer Party: Sabri Shatta Law Firm & Legal Consultations
■ Employee Party: Mr. ${activeCase.employeeName}
■ Civil ID Card Verified: [ ${activeCase.employeeId} ]
■ Registered Designation: ${activeCase.jobTitle || 'Staff Member'}  |  Employment Frame: [ ${activeCase.contractType || 'Open-Term Contract'} ]
■ Regulatory Labor Category: [ Private Sector - Governed by Kuwaiti Labor Law ]
■ Service Engagement Commenced: ${activeCase.joiningDate || '2022-01-01'}  |  Last Day of Active Duty in the Firm: ${activeCase.lastWorkingDay}
■ Total Verified Length of Service: ${activeCase.serviceYears} Years, ${activeCase.serviceMonths} Months, and ${activeCase.serviceDays} Days
■ Separation Reason: [ ${activeCase.terminationReason} ]

Second: Financial Calculation Ledger and Offsetting:
1. Accrued Labor Entitlements (+):
   • Indemnity / End of Service Gratuity: ${formattedIndemnity} KWD
   • Unused Annual Leave Compensation (${activeCase.leaveBalanceDays || 0} Days): ${formattedLeave} KWD
   • Accrued Delayed Basic Salary (Last working month days): ${formattedSalary} KWD
   • Additional Bonuses, Commissions & Allowances: ${formattedOther} KWD
   • Notice Period Compensation: ${(activeCase.noticePeriodAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD
   -------------------------------------------------------------
   » Total Gross Entitlements: ${formattedDuesTotal} KWD

2. Approved Debater Deductions & Setoffs (-):
   • Outstanding Advances and Loan Deductions: ${formattedLoans} KWD
   • Unauthorized Absent Days Deduction (Article 42): ${formattedAbsence} KWD
   • Disciplinary Financial Deductions with Sanction Ref: ${formattedDisciplinary} KWD
   • Social Insurance and Pension National Deductions: ${formattedIns} KWD
   -------------------------------------------------------------
   » Total Deductions: ${formattedDeductsTotal} KWD

Final Net Amount Due for Direct Bank Transfer:
» Net Payable Balance to Be Remitted: [ ${formattedNet} KWD Only ]

Third: Statutory Framework Under State of Kuwait Labor Law:
Based on the labor separation categorization of ( ${activeCase.terminationReason} ), the calculated indemnity corresponds precisely to the executive provisions of Chapter IV and Chapter V of Law No. 6 of 2010 on Private Sector Labor Regulations, as well as Civil Service Commission resolutions.

Fourth: General Settlement Acknowledgement & Universal Discharge:
By executing this comprehensive instrument, I, the undersigned employee, in full legal capacity and of my own free will, declare that I have received all my labor dues arising from the employment contract. Consequently, I hereby grant the employer a final, absolute, and irrevocable release of all current, prior, and future financial claims, labor dues, or professional grievances. I solemnly pledge not to initiate any complaints or lawsuits before the Public Authority for Manpower, labor dispute committees, or courts of law in the State of Kuwait.`;
        }
    }
  }, [language, selectedTemplate, activeCase, printDate, formattedNet, formattedIndemnity, formattedLeave, formattedSalary, formattedOther, formattedLoans, formattedAbsence, formattedDisciplinary, formattedIns, formattedDuesTotal, formattedDeductsTotal]);

  useEffect(() => {
    setEditableText(documentContent);
  }, [documentContent]);

  // Handle Dynamic Digital Seal & Timestamp affixation
  const handleAffixSignatureLocal = () => {
    const updatedSignatures = { ...activeCase.signatures };
    const updatedApprovals = { ...activeCase.approvals };
    let finalStatus = activeCase.status;

    const timestampStr = language === 'ar'
      ? `تم الاعتماد إدارياً ورقمياً وبصمة الختم القانوني بواسطة [${activeRole.toUpperCase()}] في ${new Date().toLocaleTimeString('ar-KW')} - ${toEasternArabicNumerals(printDate)}`
      : `Approved administratively and digitally via official stamp by [${activeRole.toUpperCase()}] at ${new Date().toLocaleTimeString('en-US')} - ${printDate}`;

    if (activeRole === 'hr') {
      updatedSignatures.hr = `HR Specialist: ${timestampStr}`;
      updatedApprovals.hr = 'مكتمل';
      finalStatus = 'UnderFinancialReview';
    } else if (activeRole === 'legal') {
      updatedSignatures.legal = `Legal Counsel: ${timestampStr}`;
      updatedApprovals.legal = 'معتمد';
      finalStatus = 'LegallyApproved';
    } else if (activeRole === 'finance') {
      updatedSignatures.fin = `Chief Auditor: ${timestampStr}`;
      updatedApprovals.finance = 'مكتمل';
      finalStatus = 'FinanciallyApproved';
    } else if (activeRole === 'manager') {
      updatedSignatures.manager = `Direct Manager: ${timestampStr}`;
      updatedApprovals.manager = 'معتمد';
    } else if (activeRole === 'gm') {
      updatedApprovals.gm = 'معتمد';
      finalStatus = 'Completed';
    } else if (activeRole === 'executive') {
      updatedSignatures.executive = `Executive CEO: ${timestampStr}`;
      updatedApprovals.executive = 'معتمد';
      finalStatus = 'Completed';
    }

    onSignOff(updatedSignatures, updatedApprovals, userComment);
    setUserComment('');
  };

  // Modern Export triggers (Word Markdown & CSV Excel Ledger) Symmetrical Translation Support
  const handleExportTextWord = () => {
    const blob = new Blob([editableText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTemplate}-document-${activeCase.employeeName.replace(/\s+/g, '_')}.txt`;
    link.click();
    
    const alertMsg = language === 'ar'
      ? 'تم توليد وتصدير السند بصيغة نصية مطابقة لمعالجات Word بنجاح.'
      : 'Document generated and exported successfully as clean Word-compatible text.';
    alert(alertMsg);
  };

  const handleExportExcelLedger = () => {
    const isAr = language === 'ar';
    let csvContent = '';

    if (isAr) {
      csvContent = 
`البند المالي,القيمة المالية بالدينار الكويتي (KWD),ملاحظات المحاسبة والشؤون القانونية
اسم الموظف,${activeCase.employeeName},براءة ذمة ومخالصة شاملة
الرقم المدني,${activeCase.employeeId},مطابقة الهيئة العامة للقوى العاملة
مكافأة نهاية الخدمة التراكمية,${activeCase.indemnityAmount},حوسبة قانون العمل رقم 6 لعام 2010
صرف تسييل الإجازات السنوية,${activeCase.leaveBalanceAmount},رصيد يبلغ ${activeCase.leaveBalanceDays || 0} يوما عمالياً
الراتب المتراصد المتأخر,${activeCase.accruedSalaryAmount || 0},الأيام الفعلية للشهر الأخير
بدلات تعاقدية أخرى,${activeCase.otherBonuses || 0},بدلات وامتيازات البيرول المباشرة
اقتطاع السلف والقروض,${activeCase.loansDeduction || 0},مقاصة مديونية معلقة تسييل فوري
خصم غيابات غير مستندة,${activeCase.absenceDeduction || 0},خصم انقطاع عشوائي عن الدوام
خصم جزاءات وعقوبات لائحية,${activeCase.disciplinaryDeductions || 0},قرارات مجالس التحقيق التأديبية
صافي المبلغ المعد للصرف البنكي,${activeCase.netPayable},الرصيد الصافي المعتمد للتحويل`;
    } else {
      csvContent = 
`Financial Particular,Amount in Kuwaiti Dinar (KWD),Legal & Accounting Audit Remarks
Employee Name,${activeCase.employeeName},Labor settlement and complete release
Civil ID No,${activeCase.employeeId},Verified by Public Authority for Manpower
EndOfService Gratuity (Indemnity),${activeCase.indemnityAmount},Calculated under Labor Law No.6 of 2010
Accrued Leaves Liquidated,${activeCase.leaveBalanceAmount},Corresponds to ${activeCase.leaveBalanceDays || 0} unspent days
Unpaid Salary Balance,${activeCase.accruedSalaryAmount || 0},Active service days of the final month
Other Contractual Bonuses,${activeCase.otherBonuses || 0},Direct payroll premiums and bonuses
Deduction of Outstanding Loans,${activeCase.loansDeduction || 0},Immediate loan deduction settlement
Deduction for Unexcused Absences,${activeCase.absenceDeduction || 0},Absence cuts under Article 42
Deduction for Disciplinary Sanctions,${activeCase.disciplinaryDeductions || 0},Fines from administrative board reviews
Net Amount Payable,${activeCase.netPayable},Net approved amount for bank remittance`;
    }

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financial-ledger-${activeCase.employeeId}.csv`;
    link.click();
    
    const alertMsg = isAr
      ? 'تم تصدير كشف الحساب والتحليل المالي بصيغة Excel CSV مع ترميز الملفات بنجاح.'
      : 'Financial calculations and ledger exported successfully in Excel-compatible CSV format.';
    alert(alertMsg);
  };

  const handlePrintDocument = () => {
    const isAr = language === 'ar';
    const activeTitle = isAr 
      ? docTemplates.find(t => t.id === selectedTemplate)?.titleAr 
      : docTemplates.find(t => t.id === selectedTemplate)?.titleEn;

    const openW = window.open('', '_blank');
    if (openW) {
      openW.document.write(`
        <html dir="${isAr ? 'rtl' : 'ltr'}">
          <head>
            <title>${activeTitle} - ${activeCase.employeeName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Inter:wght@400;500;600;700;800&display=swap');
              body { 
                font-family: ${isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif"}; 
                padding: 40px; 
                color: #1e293b; 
                line-height: ${isAr ? '1.8' : '1.6'}; 
                font-size: 11px; 
                font-weight: 500;
              }
              .legal-print-header {
                display: flex;
                flex-direction: column;
                width: 100%;
                font-family: inherit;
              }
              .bar-upper {
                width: 100%;
                height: 4px;
                background-color: #00796B;
                margin-bottom: 2px;
              }
              .bar-sub {
                width: 100%;
                height: 1.5px;
                background-color: rgba(0, 121, 107, 0.3);
                margin-bottom: 20px;
              }
              .flex-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 20px;
                padding-bottom: 8px;
              }
              .col-right {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                width: 35%;
                text-align: right;
              }
              .col-center {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex-grow: 1;
              }
              .col-left {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: flex-end;
                gap: 12px;
                width: 35%;
              }
              .office-name-ar {
                font-size: 15px;
                font-weight: 900;
                color: #00796B;
                margin: 0 0 2px 0;
                line-height: 1.2;
              }
              .office-name-en {
                font-size: 13px;
                font-weight: bold;
                color: #00796B;
                margin: 0 0 2px 0;
                line-height: 1.2;
                font-family: 'Inter', sans-serif;
                text-align: left;
              }
              .subtitle-ar {
                font-size: 9px;
                font-weight: 950;
                color: #475569;
                margin: 0;
              }
              .subtext-ar {
                font-size: 8px;
                font-weight: bold;
                color: #64748b;
                margin: 2px 0 0 0;
              }
              .subtext-mono {
                font-size: 8px;
                font-family: monospace;
                color: #94a3b8;
                margin: 2px 0 0 0;
              }
              .logo-box {
                background-color: #fff;
                padding: 6px;
                border: 2px solid rgba(0, 121, 107, 0.15);
                border-radius: 50%;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .logo-badge {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: linear-gradient(135deg, #134D41 0%, #00796B 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-weight: 800;
                font-size: 12px;
              }
              .logo-brand-en {
                font-size: 8px;
                font-weight: 900;
                color: #00796B;
                letter-spacing: 0.15em;
                margin: 1px 0 0 0;
              }
              .logo-brand-ar {
                font-size: 13px;
                font-weight: bold;
                color: #00796B;
                margin: 0;
              }
              .logo-brand-sub {
                font-size: 7px;
                font-weight: bold;
                color: #94a3b8;
                margin: 2px 0 0 0;
              }
              .qr-container {
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 4px;
                background-color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              .meta-box {
                background-color: #f8fafc;
                padding: 4px 6px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                font-size: 8px;
                font-family: monospace;
                color: #475569;
                text-align: left;
                white-space: nowrap;
                align-self: flex-start;
              }
              .title-banner {
                margin-top: 15px;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
              }
              .title-line {
                position: absolute;
                top: 50%;
                left: 0;
                width: 100%;
                height: 1px;
                background-color: #cbd5e1;
                z-index: 1;
              }
              .title-badge {
                background-color: #ffffff;
                border: 2px solid rgba(0, 121, 107, 0.2);
                padding: 8px 24px;
                border-radius: 12px;
                text-align: center;
                z-index: 2;
                box-shadow: 0 1px 3px rgba(0,0,0,0.02);
              }
              .title-badge h1 {
                font-size: 13px;
                font-weight: 900;
                color: #00796B;
                margin: 0;
              }
              .title-badge p {
                font-size: 8px;
                color: #475569;
                font-weight: bold;
                margin: 4px 0 0 0;
                text-decoration: underline;
                text-decoration-color: rgba(0, 121, 107, 0.2);
                text-underline-offset: 3px;
              }
              .bar-lower-double {
                margin-top: 12px;
                width: 100%;
                height: 2.5px;
                background-color: rgba(0, 121, 107, 0.3);
                margin-bottom: 2px;
              }
              .bar-lower-single {
                width: 100%;
                height: 0.5px;
                background-color: rgba(0, 121, 107, 0.15);
                margin-bottom: 25px;
              }
              .content { 
                white-space: pre-wrap; 
                margin-bottom: 30px; 
                border: 1px solid #cbd5e1; 
                border-radius: 10px; 
                background-color: #f8fafc; 
                padding: 25px; 
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
                font-size: 11px;
                font-weight: 600;
                color: #334155;
              }
              .signature-title { 
                font-weight: 900; 
                font-size: 11px; 
                margin-bottom: 16px; 
                text-decoration: underline; 
                color: #00796B;
              }
              .signatures-grid { 
                display: grid; 
                grid-template-cols: repeat(4, 1fr); 
                gap: 15px; 
                font-size: 9px; 
                page-break-inside: avoid; 
                margin-bottom: 30px;
              }
              .signature-box { 
                border: 1px dashed #cbd5e1; 
                padding: 10px; 
                border-radius: 6px; 
                background-color: #fff;
              }
              .stamp-container { 
                display: flex; 
                justify-content: ${isAr ? 'flex-start' : 'flex-end'}; 
                margin-top: 20px;
              }
              .stamp { 
                border: 4px double #00796B; 
                width: 85px; 
                height: 85px; 
                border-radius: 50%; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                transform: rotate(${isAr ? '10deg' : '-10deg'}); 
                color: #00796B; 
                font-weight: 950; 
                font-size: 8px; 
                background-color: #f0fdfa;
              }
              .footer { 
                border-t: 1px dashed #cbd5e1; 
                padding-top: 12px; 
                margin-top: 40px; 
                font-size: 8.5px; 
                color: #64748b; 
                display: flex; 
                justify-content: space-between;
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="legal-print-header" dir="rtl">
              <div class="bar-upper"></div>
              <div class="bar-sub"></div>
              
              <div class="flex-header">
                <!-- Right Side: Arabic Office Name & Credentials -->
                <div class="col-right">
                  <h2 class="office-name-ar">${officeNameAr}</h2>
                  <p class="subtitle-ar">للمحاماة والاستشارات القانونية والتحكيم</p>
                  <p class="subtext-ar">المقر الرئيسي: مرخص لدى كافة درجات المحاكم</p>
                  <p class="subtext-mono">الرقم الموحد: 7766554433</p>
                </div>
                
                <!-- Center: Logo and Branding -->
                <div class="col-center">
                  <div class="logo-box">
                    <div class="logo-badge">⚖</div>
                  </div>
                  <span class="logo-brand-en">ADALAH</span>
                  <span class="logo-brand-ar">عدالة</span>
                  <span class="logo-brand-sub">منظومة الإدارة القانونية المتكاملة v3</span>
                </div>
                
                <!-- Left Side: English Office Name & Document Metas + QR Code Support -->
                <div class="col-left" dir="ltr">
                  <div class="qr-container">
                    <svg width="42" height="42" viewBox="0 0 100 100" fill="#0f172a">
                      <rect width="100" height="100" fill="white" />
                      <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z" />
                      <path d="M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z" />
                      <path d="M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" />
                      <rect x="45" y="5" width="10" height="10" />
                      <rect x="45" y="25" width="10" height="15" />
                      <rect x="5" y="45" width="15" height="10" />
                      <rect x="25" y="45" width="10" height="10" />
                      <rect x="45" y="45" width="20" height="20" />
                      <rect x="75" y="45" width="10" height="15" />
                      <rect x="75" y="70" width="20" height="20" />
                      <rect x="45" y="75" width="15" height="10" />
                    </svg>
                    <span style="font-size: 6px; font-family: monospace; font-weight: bold; color: #94a3b8; margin-top: 2px;">سند آمن</span>
                  </div>
                  
                  <div class="header-left-meta">
                    <h2 class="office-name-en">${officeNameEn}</h2>
                    <span style="font-size: 8px; color: #64748b; font-weight: 600; text-transform: uppercase;">Law Firm & Legal consultations</span>
                    <div class="meta-box">
                      <div>Date: ${printDate}</div>
                      <div>Ref: EOS-${toEasternArabicNumerals(String(activeCase.settlementNumber || activeCase.id))}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Document Title Section -->
              <div class="title-banner">
                <div class="title-line"></div>
                <div class="title-badge">
                  <h1>${activeTitle}</h1>
                  <p>${isAr ? 'عقد تصفية ومخالصة عمالية معتمدة' : 'Official Mutual Release & Labor Settlement Key'}</p>
                </div>
              </div>
              
              <div class="bar-lower-double"></div>
              <div class="bar-lower-single"></div>
            </div>
            
            <div class="content">${editableText}</div>
            
            <div class="signature-title">
              ${isAr ? 'بصمة وتواقيع الإدارة والاعتماد الخماسي المعتمد:' : 'Administrative Approvals & Electronic Signatures Grid:'}
            </div>
            <div class="signatures-grid">
              <div class="signature-box">
                <strong>${isAr ? '١. الموظف عمالياً:' : '1. Employee Handover:'}</strong><br/><br/>______________________<br/>
                <span style="color:#94a3b8; font-size: 7px;">${isAr ? 'توقيع وبصمة العامل' : 'Sign & Thumbprint'}</span>
              </div>
              <div class="signature-box">
                <strong>${isAr ? '٢. الشؤون الإدارية (HR):' : '2. Admin / HR Department:'}</strong><br/><br/>
                <span style="color:#00796B; font-weight: bold;">✔ ${activeCase.signatures?.hr ? (isAr ? 'مكتمل المصادقة' : 'Sign Completed') : (isAr ? 'بانتظار المرجعة' : 'Pending Review')}</span>
              </div>
              <div class="signature-box">
                <strong>${isAr ? '٣. المستشار القانوني:' : '3. Legal Advisor Counselor:'}</strong><br/><br/>
                <span style="color:#3b82f6; font-weight: bold;">✔ ${activeCase.signatures?.legal ? (isAr ? 'معتمد ومطابق' : 'Approved') : (isAr ? 'بانتظار الفحص' : 'Pending Audit')}</span>
              </div>
              <div class="signature-box">
                <strong>${isAr ? '٤. المراقب المالي الصرف:' : '4. Financial Controller:'}</strong><br/><br/>
                <span style="color:#f59e0b; font-weight: bold;">✔ ${activeCase.signatures?.fin ? (isAr ? 'مصروف للتحويل' : 'Remitted') : (isAr ? 'بانتظار التدقيق' : 'Pending Ledger')}</span>
              </div>
            </div>
            
            <div class="stamp-container">
              <div class="stamp">
                <span>${isAr ? 'عدالة سيستم' : 'ADALA SYS'}</span>
                <span style="font-size: 6px; margin: 2px 0;">${isAr ? 'الشؤون القانونية' : 'Legal Affairs'}</span>
                <span style="font-size: 6px; font-family: monospace;">KWD_Valid</span>
              </div>
            </div>

            <div class="footer">
              <span>
                ${isAr 
                  ? '* مستند رسمي منتج لآثاره القانونية ومبرم للخصومة والنزاع العمالي طبقاً لأحكام دولة الكويت.' 
                  : '* Official instrument executing complete labor settlement and release of rights under Kuwait Law.'}
              </span>
              <span>
                ${isAr 
                  ? `صفحة ١ من ١ • هاتف: ٢٢٤٤٨٨٩٩` 
                  : `Page 1 of 1 • Tel: 22448899`}
              </span>
            </div>
          </body>
        </html>
      `);
      openW.document.close();
    }
  };

  const isAr = language === 'ar';

  return (
    <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Tab Selectors of 10 Docs */}
      <div className="space-y-3">
        <label className="block text-xs font-black text-gray-700 dark:text-gray-300">
          {isAr
            ? 'اختر أحد النماذج الرسمية المتكاملة والمشروحة لبراءة الذمة (10 نماذج وقرارات):'
            : 'Select one of the 10 available official legal templates and discharge certificates:'}
        </label>
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 dark:bg-slate-950/60 rounded-xl max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-800">
          {docTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${selectedTemplate === t.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              id={`template-btn-${t.id}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? t.titleAr : t.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PAPER CONTAINER A4 SIMULATOR */}
      <div className="bg-gray-100/60 dark:bg-slate-950/40 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
        
        {/* Modern Logical Alignments: dir & text-start replaces absolute right alignment */}
        <div 
          className="bg-white text-gray-900 p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 max-w-4xl mx-auto space-y-6 min-h-[550px] relative text-start transition-all duration-300" 
          id="a4-printed-element"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          
          {/* LAW FIRM Header: Shifts dynamically to adjust side-offsets respectively for AR vs. EN modes */}
          <div className="flex justify-between items-start border-b-2 border-primary pb-4 gap-4">
            <div className="space-y-1 text-start">
              <h3 className="font-extrabold text-sm text-primary tracking-tight font-tajawal">
                {isAr ? officeNameAr : officeNameEn}
              </h3>
              <p className="text-[9px] text-gray-500 font-bold">
                {isAr ? 'عدالة - منظومة الإدارة القانونية المتكاملة v3 | بوابة صياغة وصرف مستحقات نهاية الخدمة والعمل' : 'Adalah - Integrated Legal Management System v3 | Unified Labor Settlement Gateway'}
              </p>
            </div>
            <div className="text-end leading-none font-mono shrink-0 space-y-1.5">
              <span className="text-xs font-black text-[#00796B]">
                {isAr ? `سند رقم: ${toEasternArabicNumerals(String(activeCase.settlementNumber || activeCase.id))}` : `Ref No: #${activeCase.settlementNumber || activeCase.id}`}
              </span>
              <p className="text-[9px] text-gray-400 font-bold">
                {isAr ? `تاريخ التحرير: ${toEasternArabicNumerals(printDate)}` : `Date of Issue: ${printDate}`}
              </p>
            </div>
          </div>

          {/* Dynamic computed text of A4 with interactive direct on-screen editing */}
          <div className="space-y-2">
            <span className="text-[10px] text-primary font-bold bg-primary/5 px-2.5 py-1 rounded inline-flex items-center gap-1 mb-2 select-none print:hidden border border-primary/10">
              ✍️ {isAr 
                ? 'هذا النموذج قابل للتعديل المباشر: انقر واكتب داخل المربع الأبيض أدناه لتعديل أي بند قبل الطباعة.' 
                : 'This template is fully editable: Click inside the white box below to adapt any clause before printing.'}
            </span>
            <textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full min-h-[480px] font-sans leading-relaxed text-gray-800 text-[11px] font-semibold bg-primary/[0.005] hover:bg-primary/[0.015] focus:bg-white border-2 border-dashed border-gray-150 focus:border-primary p-4 rounded-xl outline-none transition-all resize-y shadow-inner-sm text-start"
              placeholder={isAr ? 'نص النموذج قيد التحرير المباشر...' : 'Template text being edited directly...'}
              dir={isAr ? 'rtl' : 'ltr'}
              id="a4-document-editor"
            />
          </div>

          {/* 5-PARTY SIGNATURE GRID (Dynamic Layout Mirroring) */}
          <div className="mt-8 border-t border-double border-gray-900 pt-5 space-y-3.5">
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider mb-2 leading-none">
              {isAr ? 'مصفوفة التوقيعات والشهادة الخماسية المعتمدة رقمياً لملف الموظف:' : 'Approved Multi-Party Endorsements & Digital Stamps Ledger:'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-[7.5px] text-gray-500 font-bold">
              <div className="space-y-1 text-start">
                <span className="text-gray-900 font-extrabold">{isAr ? '١. الموظف عمالياً:' : '1. Discharged Employee:'}</span>
                <div className="h-4 border-b border-dashed border-gray-400 w-full" />
                <p className="text-[6.5px] text-gray-400 truncate">{isAr ? 'بصمة وتوقيع العامل' : 'Sign & Thumbprint'}</p>
              </div>

              <div className="space-y-1 text-start">
                <span className="text-gray-900 font-extrabold">{isAr ? '٢. الشؤون الإدارية (HR):' : '2. HR Department:'}</span>
                <p className={`font-mono text-[7px] ${activeCase.signatures?.hr ? 'text-success' : 'text-gray-450'}`}>
                  {activeCase.signatures?.hr ? `✅ ${isAr ? 'مكتمل المصادقة' : 'Sign Completed'}` : (isAr ? '✖ معلق التدقيق' : '✖ Pending Audit')}
                </p>
              </div>

              <div className="space-y-1 text-start">
                <span className="text-gray-900 font-extrabold">{isAr ? '٣. المستشار القانوني:' : '3. Legal Advisor (Counsel):'}</span>
                <p className={`font-mono text-[7px] ${activeCase.signatures?.legal ? 'text-blue-600' : 'text-gray-450'}`}>
                  {activeCase.signatures?.legal ? `✅ ${isAr ? 'معتمد ومطابق' : 'Approved'}` : (isAr ? '✖ معلق الفحص' : '✖ Pending Review')}
                </p>
              </div>

              <div className="space-y-1 text-start">
                <span className="text-gray-900 font-extrabold">{isAr ? '٤. المراقب المالي:' : '4. Finance Section:'}</span>
                <p className={`font-mono text-[7px] ${activeCase.signatures?.fin ? 'text-amber-600' : 'text-gray-450'}`}>
                  {activeCase.signatures?.fin ? `✅ ${isAr ? 'مصروف للتحويل' : 'Remitted'}` : (isAr ? '✖ معلق الصرف' : '✖ Pending Payout')}
                </p>
              </div>

              {/* Digital seal mockup rendering rotate */}
              <div className="flex items-center justify-center shrink-0">
                <div className={`w-18 h-18 border-double border-4 border-primary/50 text-[#00796B] rounded-full flex flex-col items-center justify-center text-[6px] font-bold ${isAr ? 'rotate-12' : '-rotate-12'} bg-emerald-50/20 select-none scale-95`}>
                  <span className="font-extrabold text-[8px]">{isAr ? 'الوجيان' : 'SHATTA'}</span>
                  <span>{isAr ? 'التحقق الرقمي' : 'Digital Verify'}</span>
                  <span className="font-mono text-[5.5px]">{activeCase.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure verify tag */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-150 text-[8px] text-gray-400 font-mono font-bold gap-4 flex-col sm:flex-row">
            <span>
              {isAr 
                ? '* مستند تصفية رقمي ساري مبرم ومطابق للمادة 51, 53 من قانون تنظيم العمل الكويتي' 
                : '* Secure digital instrument compiled in accordance with Articles 51 & 53 of the Kuwaiti Labor Law'}
            </span>
            <div className="flex items-center gap-1 bg-gray-50 px-1 py-0.5 border rounded">
              <span className="text-[7px]">TOKEN_ID:</span>
              <span className="text-gray-900 text-[6.5px]">{activeCase.settlementNumber || activeCase.id}</span>
            </div>
          </div>

        </div>

        {/* CONTROLS ZONE: DIGITAL SIGN-OFF & EXPORTS */}
        <div className="bg-white dark:bg-dm-card p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 text-start">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3 border-gray-100 dark:border-gray-800">
            <div>
              <h5 className="font-black text-xs text-[#00796B] flex items-center gap-1 select-none">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>
                  {isAr 
                    ? `المصادقة الرقمية والتوقيع المباشر كـ: [ ${activeRole.toUpperCase()} ]` 
                    : `Digital Sign-off & Verification Authority as: [ ${activeRole.toUpperCase()} ]`}
                </span>
              </h5>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                {isAr 
                  ? 'اضغط لتثبيت المصادقة بصيغتها الإلكترونية في السند والورقة فورياً مع الختم المزدوج.' 
                  : 'Affix administrative approvals and digital signatures straight onto the dossier page in real time.'}
              </p>
            </div>
            <button
              onClick={handleAffixSignatureLocal}
              className="px-4 py-2 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20 shrink-0"
              id="sign-off-btn"
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'إمضاء وتوثيق مستند التصفية' : 'Approve & Digital Sign Ledger'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-400">
              {isAr ? 'إضافة حاشية تدقيقية أو تعليق قبل التثبيت (اختياري):' : 'Add audit footnotes or comments before signing (optional):'}
            </span>
            <input 
              type="text"
              placeholder={isAr ? 'مثال: تم تدقيق الرصيد ورسائل الاسترداد للعهد بنجاح...' : 'e.g., Audited and verified outstanding balances under Kuwaiti regulations...'}
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
              className="w-full text-xs h-9 px-3 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-800 outline-none focus:border-primary font-bold"
              id="sign-comment-input"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2 justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold self-center">
              {isAr ? 'تصدير وحفظ بمختلف الصيغ المعتمدة:' : 'Export Ledger & Save Document:'}
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handlePrintDocument}
                className="px-3.5 h-9 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                id="print-pdf-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isAr ? 'طباعة الورقة / PDF' : 'Print / PDF'}</span>
              </button>
              <button
                onClick={handleExportTextWord}
                className="px-3.5 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-700"
                id="export-word-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصدير Word (نصي)' : 'Word Text Export'}</span>
              </button>
              <button
                onClick={handleExportExcelLedger}
                className="px-3.5 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-700"
                id="export-excel-btn"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصدير Excel (كشف)' : 'Excel Ledger CSV'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
