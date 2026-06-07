export interface LegalDocTemplate {
    id: string;
    titleAr: string;
    titleEn: string;
    category: 'resign' | 'terminate' | 'release' | 'legal' | 'cert';
    textAr: string;
    textEn: string;
}

export const getDocTemplates = (data: {
    employeeName: string;
    employeeCivilId: string;
    jobTitle: string;
    department: string;
    joiningDate: string;
    lastWorkingDay: string;
    netPayable: number;
    basicSalary: number;
    allowances: number;
    grossSalary: number;
    indemnityAmount: number;
    leaveBalanceAmount: number;
    loansDeduction: number;
    absenceDeduction: number;
    otherBonuses: number;
    settlementNumber: string;
}): LegalDocTemplate[] => {
    const totalEarnings = data.indemnityAmount + data.leaveBalanceAmount + data.otherBonuses;
    const totalDeductions = data.loansDeduction + data.absenceDeduction;

    return [
        {
            id: 'resignation_letter',
            titleAr: "1. كتاب طلب الاستقالة الرسمي",
            titleEn: "1. Official Resignation Letter",
            category: 'resign',
            textAr: `طلب إنهاء علاقة تعاقدية بالاستقالة الاختيارية
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
إلى السيد / مدير الموارد البشرية والشؤون الإيجابية الموقر،
تحية طيبة وبعد،

أنا الموقع أدناه، الموظف: ${data.employeeName}
الرقم المدني: ${data.employeeCivilId}
المسمى الوظيفي: ${data.jobTitle}

أتقدم لسيادتكم بطلب قبول استقالتي الرسمية من العمل لدى المنشأة، واعتبار تاريخ آخر يوم عمل فعلي في المرفق هو ${data.lastWorkingDay}، ملتزماً بفترة الإخطار القانونية المقررة لمصلحة العمل وهي (ثلاثة أشهر)، وذلك طبقاً لنصوص المادة (44) من القانون رقم (6) لسنة 2010 بشأن العمل بالقطاع الأهلي الكويتي.

مقدم الطلب (التوقيع): ________________________`,
            textEn: `Employee Resignation Notice Document
Date: ${new Date().toLocaleDateString('en-US')}
To: HR & Personnel Manager,

I, the undersigned Employee: ${data.employeeName}
Civil ID: ${data.employeeCivilId}
Job Title: ${data.jobTitle}

Hereby tender my official resignation from employment. My last working day will be ${data.lastWorkingDay}, in accordance with the statutory 3-month notice period required under Article 44 of Kuwait Labor Law No. 6 of 2010.

Employee Signature: ________________________`
        },
        {
            id: 'resignation_acceptance',
            titleAr: "2. قرار قبول الاستقالة الإداري",
            titleEn: "2. Management Resignation Acceptance Notice",
            category: 'resign',
            textAr: `قرار إداري رقم (${data.settlementNumber}/2026) بشأن الموافقة على الاستقالة
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
الموضوع: قبول الاستقالة وتحديد تاريخ المغادرة

بناء على الطلب المقدم من الموظف: ${data.employeeName}
تقرر الموافقة الإدارية على الاستقالة واعتبار يوم ${data.lastWorkingDay} آخر يوم عمل له بالمنشأة.
يحال الملف للمالية لصرف مستحقات نهاية الخدمة والبالغة صافي (${data.netPayable} د.ك) بعد إخلاء طرفه وتسليم عهده.

مدير شؤون الموظفين (التوقيع والختم): ________________________`,
            textEn: `Administrative Resolution No. (${data.settlementNumber}/2026)
Date: ${new Date().toLocaleDateString('en-US')}
Subject: Approval of Resignation

Regarding the request submitted by employee: ${data.employeeName}
The management hereby accepts the resignation. The last working day shall be ${data.lastWorkingDay}.
The file is referred to Finance for settling end of service benefits totaling Net (${data.netPayable} KWD) upon clearance.

HR Director (Signature & Seal): ________________________`
        },
        {
            id: 'termination_letter',
            titleAr: "3. إخطار إنهاء العقد (بقرار الإدارة)",
            titleEn: "3. Contract Termination Letter (Employer Action)",
            category: 'terminate',
            textAr: `إخطار إنهاء الخدمة والعقد الفردي بموجب المادة 44
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
إلى السيد/السيدة: ${data.employeeName}

نحيطكم علماً بأن إدارة المنشأة قررت عدم الاستمرار في العلاقة التعاقدية المشتركة بصفة نهائية.
ويعتبر آخر يوم عمل لكم فعلي في المرفق هو ${data.lastWorkingDay}. ويحق للشركة دفع بدل فترة الإخطار النقدي في تصفية الحساب.
نرجو مراجعة الإدارة لإتمام تسليم العهد وتصفية حسابكم البالغ (${data.netPayable} د.ك).

إدارة شؤون الموظفين (ختم المنشأة): ________________________`,
            textEn: `Official Notice of Termination under Article 44
Date: ${new Date().toLocaleDateString('en-US')}
To: ${data.employeeName}

Please be advised that the management has resolved to terminate your employment contract.
Your last working day will be ${data.lastWorkingDay}. The company shall process notice pay in accordance with Article 44.
Please finalize asset handovers to receive your net dues of (${data.netPayable} KWD).

HR Department Seal: ________________________`
        },
        {
            id: 'termination_notice',
            titleAr: "4. إنذار بمخالفة الأداء وفترة الإنذار مادة 41",
            titleEn: "4. Violation Dismissal Notice under Article 41",
            category: 'terminate',
            textAr: `قرار فصل وحرمان تأديبي عمالي تحت طائلة المادة (41)
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
الموضوع: فصل الموظف: ${data.employeeName}

بعد نتائج التحقيق الإداري وثبوت ارتكاب العامل للمخالفة الجسيمة، وبموجب أحكام المادة (41) من فصول قانون العمل بالقطاع الأهلي بدولة الكويت، تقرر فصل الموظف فصلاً تأديبياً فورياً وحرمانه من مستحقات مكافأة نهاية الخدمة بالكامل. ويقتصر استحقاقه على بدل الإجازات السنوية المترصدة.

المستشار التنفيذي العام والتحقيق: ________________________`,
            textEn: `Disciplinary Dismissal Order under Article 41
Date: ${new Date().toLocaleDateString('en-US')}
To Employee: ${data.employeeName}

Following the administrative investigation and proven structural misconduct, pursuant to Article 41 of Kuwait Labor Law, the company hereby terminates your services immediately. Gratuity of (${data.indemnityAmount} KWD) is forfeited. Only accrued leave balance is compensated.

Legal Counsel Signature: ________________________`
        },
        {
            id: 'clearance_certificate',
            titleAr: "5. شهادة براءة طرف وإخلاء العهد",
            titleEn: "5. Corporate Clearance Certificate",
            category: 'release',
            textAr: `نموذج إخلاء طرف وتصفية تسليم العهد الإدارية والفنية بالمنشأة
رقم الإخلاء: CL-${data.settlementNumber}
الاسم: ${data.employeeName} | الإدارة والعمل: ${data.department}

نشهد بأن الموظف المذكورة بياناته قد أتم تسليم كافة الأصول والعهد التي كانت مخولة تحت حوزته بغير خلل وفقاً لشهادات الأقسام التثبتية التالية:
1. العهد التقنية (لابتوب/هاتف): [مكتمل بالامتياز]
2. شؤون الأمن والبصمة والبطاقات: [مكتمل]
3. الشؤون اللوجستية والسيارات: [مكتمل]
4. القسم المالي والقروض والسلف: [مكتمل ومسترد بمقدار ${data.loansDeduction} د.ك]

المفوض الإداري العام شؤون التوريد والعهد: ________________________`,
            textEn: `Corporate Asset Handover & Clearance Certificate
Reference: CL-${data.settlementNumber}
Employee: ${data.employeeName} | Department: ${data.department}

This is to certify that the employee has returned all company property and holds no liabilities:
1. Technical Equipment (Laptop/Mobile): [Approved]
2. Security Badges & Access Controls: [Approved]
3. Fleet Vehicles & Logistics: [Approved]
4. Financial Credit/Outstanding Loans: [Settle & deducted: ${data.loansDeduction} KWD]

Authorized Logistics Manager: ________________________`
        },
        {
            id: 'final_settlement',
            titleAr: "6. اتفاقية حساب التسوية النهائية مادة 51",
            titleEn: "6. Final Settlement Agreement Article 51",
            category: 'release',
            textAr: `صحيفة الحساب النهائي الشامل لشؤون الموظفين بالتراضي
رقم السند: ${data.settlementNumber}
اسم الموظف: ${data.employeeName} | الرقم المدني: ${data.employeeCivilId}
تاريخ الالتحاق: ${data.joiningDate} | آخر يوم عمل: ${data.lastWorkingDay}

أولاً: الاستحقاقات المالية (Earnings):
1. مكافأة تصفية نهاية الخدمة مادة 51: ${data.indemnityAmount} د.ك
2. تعويض رصيد الإجازات السنوية: ${data.leaveBalanceAmount} د.ك
3. مكافآت وتعديلات وعلاوات: ${data.otherBonuses} د.ك
إجمالي الاستحقاقات: ${totalEarnings} د.ك

ثانياً: الخصومات والاقتطاعات (Deductions):
1. سلف وقروض وتسهيلات عمالية: ${data.loansDeduction} د.ك
2. غياب غير مصرح به وأيام الخصم: ${data.absenceDeduction} د.ك
إجمالي الاقتطاعات: ${totalDeductions} د.ك

الصافي النهائي المستحق للصرف والتحويل: ${data.netPayable} د.ك
القسم المالي والتدقيق الموثق (توقيع): ________________________`,
            textEn: `Comprehensive Final Settlement Financial Statement
Reference: ${data.settlementNumber}
Employee: ${data.employeeName} | Civil ID: ${data.employeeCivilId}
Hired: ${data.joiningDate} | Last Working Day: ${data.lastWorkingDay}

1. Statutory Earnings & Additions:
- Indemnity Gratuity Amount (Art. 51): ${data.indemnityAmount} KWD
- Outstanding Leave Compensation: ${data.leaveBalanceAmount} KWD
- Overtime & Other Additions: ${data.otherBonuses} KWD
Total Gross Additions: ${totalEarnings} KWD

2. Statutory Deductions & Offsets:
- Loan Balances & Cash Advances: ${data.loansDeduction} KWD
- Unexcused Presence Deductions: ${data.absenceDeduction} KWD
Total Deductions: ${totalDeductions} KWD

Net Payable Amount: ${data.netPayable} KWD
Finance Auditor (Signature & Stamp): ________________________`
        },
        {
            id: 'receipt_of_dues',
            titleAr: "7. سند مخالصة وإقرار باستلام كامل المبالغ",
            titleEn: "7. Settlement Liability Dismissal Receipt",
            category: 'release',
            textAr: `سند إقرار بمخالصة عامة نهائية وإبراء ذمة غير قابلة للنقض
أقر أنا الموقع أدناه: ${data.employeeName}، الرقم المدني: ${data.employeeCivilId}
بأنني استلمت من صاحب العمل كامل مستحقاتي العمالية والمالية السارية الناتجة عن فترة عملي بموجب العقد والبالغة قيمتها براءة الصرف الفوري المقدر بـ: (${data.netPayable} د.ك) وذلك عبر التحويل المصرفي الموثق.
وبناءً عليه، أقر بمخالصة تامة وإبراء ذمة صريحة لرب العمل والشركة وفروعها من كافة الالتزامات ولا يحق لي الطعن أمام المحاكم الكويتية.

توقيع الموظف المقر بالاستلام التام: ________________________`,
            textEn: `Statutory Wage Waiver & Liability Discharge Agreement
I, the undersigned Employee: ${data.employeeName}, Civil ID: ${data.employeeCivilId}
Hereby acknowledge direct receipt of my final end of service compensation totaling Net (${data.netPayable} KWD) via bank transfer.
Accordingly, I declare full discharge of all corporate liabilities, waiving all futuristic claims before Kuwait courts or Ministry of Labor.

Employee Authorized Signature: ________________________`
        },
        {
            id: 'eos_benefit_receipt',
            titleAr: "8. إيصال استلام مكافأة نهاية الخدمة والراتب الكلي",
            titleEn: "8. End of Service Benefit Receipt",
            category: 'release',
            textAr: `إيصال صرف مالي لمستحقات الخدمة والرواتب المتراكمة
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
استلمت أنا: ${data.employeeName}
مبلغاً وقدره: ${data.netPayable} دينار كويتي (KWD)
وذلك عن مكافأة نهاية خدمتي والرواتب المتبقية والمستحقة لخدمتي في المنشأة المستحقة بموجب الأنظمة والقانون الكويتي.

اسم وتوقيع المستلم: ________________________`,
            textEn: `Financial Voucher: End of Service Benefit Release
Date: ${new Date().toLocaleDateString('en-US')}
I, ${data.employeeName}, hereby acknowledge receipt of the sum of ${data.netPayable} KWD (Kuwaiti Dinars) being the final settlement of my career gratuity, remaining salaries, and related statutory allowances.

Recipient Name & Signature: ________________________`
        },
        {
            id: 'employee_undertaking',
            titleAr: "9. سند تعهد الموظف بعدم المنافسة وسرية المعلومات",
            titleEn: "9. Employee Confidentiality & Non-Compete Undertaking",
            category: 'legal',
            textAr: `سند تعهد عمالي مقيد بأحكام عدم المنافسة وسرية المعلومات
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
المعهد: ${data.employeeName} | الرقم المدني: ${data.employeeCivilId}

بمناسبة تصفية مستحقاتي وصرف الصافي، أتعهد للشركة التزاماً قطعياً بالبنود التالية:
1. عدم إفشاء المعلومات والأسرار الصناعية وقواعد البيانات التي اطلعت عليها.
2. عدم العمل لدى أي منافس أو تشييد نشاط مماثل لنشاط الشركة في دولة الكويت لمدة عامين.
3. الامتناع عن التشهير أو الإضرار بالسمعة التجارية للمجموعة ونشاطها.

المقر بالتعهد والالتزام الموحد: ________________________`,
            textEn: `Irrevocable Post-Employment Non-Compete Undertaking
Date: ${new Date().toLocaleDateString('en-US')}
I, ${data.employeeName}, Civil ID: ${data.employeeCivilId}, in consideration of receiving my final benefits, hereby promise and agree to:
1. Maintain strict confidentiality regarding all trade secrets, client folders, and technologies.
2. Refrain from active employment with direct competitors in Kuwait for a period of 2 years.
3. Refrain from defaming or harming the corporate brand or online presence.

Declarant Signature: ________________________`
        },
        {
            id: 'financial_settlement_form',
            titleAr: "10. كشف التسوية المالية المفصل (Payroll Ledger)",
            titleEn: "10. Detailed Financial Settlement Form (Payroll Ledger)",
            category: 'release',
            textAr: `بيان التسوية والمخرجات السنوية الختامية للموظف: ${data.employeeName}
تاريخ براءة الصرف: ${new Date().toLocaleDateString('ar-KW')}
الراتب الأساسي: ${data.basicSalary} د.ك | راتب مضاف إليه البدلات: ${data.grossSalary} د.ك

مكافأة السنين الاحتسابية: ${data.indemnityAmount} د.ك
رصيد الإجازة مستحق التسييل: ${data.leaveBalanceAmount} د.ك
إجمالي الدخل المترصد: ${totalEarnings} د.ك
الديون والسلف المقتطعة: ${data.loansDeduction} د.ك
الغيابات المطبق عليها الجزاء: ${data.absenceDeduction} د.ك
إجمالي الخصم المالي: ${totalDeductions} د.ك

الصافي المحول للبنك: ${data.netPayable} د.ك

شؤون الرواتب والبيرول (توقيع): ________________________`,
            textEn: `Statutory Payroll Accounting Statement & Breakdown
Employee: ${data.employeeName}
Value Date: ${new Date().toLocaleDateString('en-US')}
Base Pay: ${data.basicSalary} KWD | Gross Salary: ${data.grossSalary} KWD

Accumulated Career Indenmity: ${data.indemnityAmount} KWD
Unused Leave Compensation: ${data.leaveBalanceAmount} KWD
Gross Credit Additions: ${totalEarnings} KWD
Company Loans Deducted: ${data.loansDeduction} KWD
Absence Penalties Offset: ${data.absenceDeduction} KWD
Total Charge Deductions: ${totalDeductions} KWD

Net Disbursed Funds: ${data.netPayable} KWD

Authorized Payroll Officer: ________________________`
        },
        {
            id: 'waiver_and_release',
            titleAr: "11. إقرار التنازل والتسوية الودية المانعة للجهالة",
            titleEn: "11. Release of Liability and Amicable Accord Waiver",
            category: 'legal',
            textAr: `عقد اتفاق صلح وتراضي وتسوية عمالية قانونية مبرمة
الطرف الأول (صاحب العمل): شركة المجموعة الوطنية الممثلة بمستشارها القانوني
الطرف الثاني (العامل): السيد/السيدة: ${data.employeeName}

اتفقت أطراف العقد بموجب بنود الصلح والرضا على إغلاق كافة صحائف العمل بدولة الكويت. يترصد للطرف الثاني بموجب هذا الاتفاق قيمة تسوية نهائية مبلغها (${data.netPayable} د.ك) لقاء تراض قطعي وإغلاق تام للقضية وتنازل مانع للجهالة عن الحقوق العقدية.

الطرف الأول: ________________________             الطرف الثاني: ________________________`,
            textEn: `Amicable Mutual Legal Release Settlement
First Party (Employer): The National Group JSC
Second Party (Employee): ${data.employeeName}

By mutual consent, the parties hereby execute this legal release under Kuwait Civil and Labor laws. The Employee receives a compromise payout of Net (${data.netPayable} KWD) in return for full and complete withdrawal of any claims, disputes, or grievances.

First Party: ________________________             Second Party: ________________________`
        },
        {
            id: 'employment_closure',
            titleAr: "12. كتاب غلق ملف الموظف وإلغاء بطاقة العمل",
            titleEn: "12. Employment Contract Deactivation & Closure Form",
            category: 'cert',
            textAr: `طلب إلغاء عقد العمل والربط بوزارة الشؤون والقوى العاملة
التاريخ: ${new Date().toLocaleDateString('ar-KW')}
اسم المقيم/الموظف: ${data.employeeName} | البطاقة المدنية: ${data.employeeCivilId}

إشارة إلى إنهاء خدمات الموظف أعلاه وصرف كافة مستحقات تصفية الخدمة المودعة وصافيها البالغ والبالغ (${data.netPayable} د.ك). يرجى اتخاذ الإجراء الإداري لإلغاء إذن العمل وإيقاف تسجيل وتوطين الموظف على كفالة ملف الشركة لدى الهيئة العامة للقوى العاملة بدولة الكويت.

مدير قسم الامتثال والربط الحكومي: ________________________`,
            textEn: `Notification of Government Personnel File Closure
Date: ${new Date().toLocaleDateString('en-US')}
Employee: ${data.employeeName} | Civil ID: ${data.employeeCivilId}

Following the full checkout and disbursement of end of service benefits totaling (${data.netPayable} KWD). Please initiate administrative procedures to cancel the work permit and deactivate this personnel registration from of our corporate registry with the Public Authority of Manpower.

External Relations Manager: ________________________`
        }
    ];
};
