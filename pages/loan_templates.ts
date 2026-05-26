export interface LegalTemplate {
  id: string;
  category: 'claims' | 'agreements' | 'notices' | 'receipts';
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
}

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    id: "temp-01",
    category: "claims",
    categoryAr: "طلبات ونماذج تقديم",
    categoryEn: "Forms & Applications",
    titleAr: "طلب قرض موظف رسمي",
    titleEn: "Official Employee Loan Application",
    contentAr: `رقم الطلب: [REF_NUMBER]
التاريخ: [DATE]

إلى السيد مدير إدارة الشؤون الإدارية والمالية المحترم،
موضوع الطلب: طلب الحصول على قرض حسن للموظفين

بموجب هذا، أنا الموقع أدناه [EMPLOYEE_NAME]، الذي يشغل وظيفة [JOB_TITLE] في قسم [DEPARTMENT] براتبي الأساسي البالغ [BASIC_SALARY] د.ك، أتقدم بطلبي هذا للحصول على قرض مالي من الشركة بقيمة [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي لا غير).

وأود تبيان سبب هذا القرض لظروفي الخاصة وهي:
[PURPOSE]

وأرجو الموافقة على جدولة سداد هذا المبلغ على عدد أقسام ([TERM] شهر)، بواقع قسط شهري قيمته [MONTHLY_INSTALLMENT] د.ك، على أن يبدأ الاستقطاع اعتباراً من راتب شهر [START_DATE] بما يتوافق مع نص المادة 20 من قانون العمل الكويتي.

وتقبلوا فائق الاحترام والتقدير.
مقدم الطلب (الموظف): [EMPLOYEE_NAME]
التوقيع: ............................`,
    contentEn: `Request ID: [REF_NUMBER]
Date: [DATE]

To: Director of Administrative and Financial Affairs,
Subject: Official Employee Loan Application (Qard-Hasan)

I, the undersigned [EMPLOYEE_NAME], holding the position of [JOB_TITLE] in the [DEPARTMENT] department, with a basic monthly salary of [BASIC_SALARY] KWD, hereby apply for an interest-free internal corporate loan of [LOAN_AMOUNT] KWD (Only [LOAN_AMOUNT_WORDS] Kuwaiti Dinars).

I am requesting this loan due to the following personal/urgent circumstances:
[PURPOSE]

I propose to repay this loan in [TERM] monthly installments of [MONTHLY_INSTALLMENT] KWD each, commencing with the payroll cycle of [START_DATE], in full alignment with Article 20 of the Kuwait Labor Law.

Sincerely,
Applicant: [EMPLOYEE_NAME]
Signature: ............................`
  },
  {
    id: "temp-02",
    category: "claims",
    categoryAr: "طلبات ونماذج تقديم",
    categoryEn: "Forms & Applications",
    titleAr: "طلب سلفة سريعة على الراتب الأساسي",
    titleEn: "Emergency Salary Advance Form",
    contentAr: `رقم الطلب: [REF_NUMBER]
التاريخ: [DATE]

إلى إدارة الشؤون المالية والرواتب المحترمين،
الموضوع: طلب سلفة عاجلة على الراتب لشهر جاري

أرجو التكرم بالموثقة على صرف سلفة معجلة على راتبي الأساسي المستحق للشهر الجاري بقيمة [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي) لمواجهة التزامات مستعجلة وطارئة.

وأفوضكم بموجب هذا تفويضاً مطلقاً وغير قابل للنقض بخصم هذا المبلغ بالكامل وبقسط واحد من راتبي الأساسي الذي سيصرف في نهاية هذا الشهر.

وتفضلوا بقبول الاحترام والتقدير.
الموظف: [EMPLOYEE_NAME]
الرقم الوظيفي: [EMPLOYEE_ID]
التوقيع: ............................`,
    contentEn: `Request ID: [REF_NUMBER]
Date: [DATE]

To: Payroll and Finance Department,
Subject: Urgent Salary Advance Request on Basic Wage

I hereby request approval for an emergency advance on my basic salary outstanding for the current month in the amount of [LOAN_AMOUNT] KWD (Only [LOAN_AMOUNT_WORDS] Kuwaiti Dinars) to meet immediate urgent personal liabilities.

I hereby execute an absolute, irrevocable authorization for the company to deduct this advanced amount in full (100% in a single installment) from my basic monthly salary payable at the end of this current month.

Best regards,
Employee: [EMPLOYEE_NAME]
Employee ID: [EMPLOYEE_ID]
Signature: ............................`
  },
  {
    id: "temp-03",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "قرار موافقة إدارية وصرف تمويل",
    titleEn: "Administrative Approval & Disbursement Memo",
    contentAr: `الرقم المرجعي للإدارة: [REF_NUMBER]
التاريخ: [DATE]
الجهة المصدرة: إدارة الموارد البشرية والتدقيق المالي

بناءً على الطلب المقدم من الموظف [EMPLOYEE_NAME] برقم مرجعي [REF_NUMBER] للحصول على قرض/سلفة بقيمة [LOAN_AMOUNT] د.ك، واطلاع الإدارة على تقرير الملاءة وسجل الالتزام الائتماني الداخلي للموظف.

تقرر ما يلي:
1. الموافقة النهائية على منح الموظف [EMPLOYEE_NAME] سلفة بقيمة [LOAN_AMOUNT] د.ك يتم صرفها نقداً أو بتحويل بنكي.
2. يتم سداد القرض على [TERM] شهر، بقيمة قسط شهري [MONTHLY_INSTALLMENT] د.ك والذي يمثل نسبة [DEDUCTION_PERCENTAGE]% من الراتب الأساسي، مع مراعاة السقف القانوني البالغ 10%.
3. تبدأ عملية استقطاع الأقساط بشكل استباقي ومباشر من الرواتب ابتداءً من [START_DATE].

مدير إدارة الموارد البشرية: ..............................
توقيع رئيس التدقيق المالي: .............................
خاتم الاعتماد الرسمي للشركة: [OFFICIAL_SEAL]`,
    contentEn: `Administrative Ref: [REF_NUMBER]
Date: [DATE]
Issued By: HR & Financial Audit Department

Based on the loan application submitted by [EMPLOYEE_NAME] under Reference [REF_NUMBER] for a loan of [LOAN_AMOUNT] KWD, and after auditing the employee's internal financial standing and disciplinary records.

It is hereby decided:
1. Final corporate approval is granted to issue an internal loan of [LOAN_AMOUNT] KWD to [EMPLOYEE_NAME] via direct bank transfer or check.
2. The loan is to be repaid over [TERM] months with a monthly deduction of [MONTHLY_INSTALLMENT] KWD, representing [DEDUCTION_PERCENTAGE]% of the basic monthly salary (satisfying the 10% statutory cap).
3. Automatic payroll deductions shall start from [START_DATE].

HR Corporate Manager: ..............................
Chief Financial Auditor: .............................
Official Seal: [OFFICIAL_SEAL]`
  },
  {
    id: "temp-04",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "نموذج تخويل رسمي بالاستقطاع من الراتب",
    titleEn: "Formal Wage Deduction Authorization Consent",
    contentAr: `رقم الترخيص الداخلي: [REF_NUMBER]
أنا الموقع أدناه [EMPLOYEE_NAME]، الجنسية [NATIONALITY]، المدني [CIVIL_ID]، أعمل بوظيفة [JOB_TITLE].

أقر بكامل أهليتي القانونية والشرعية وبدون أي إكراه، بأنني أفوض شركة [COMPANY_NAME] تفويضاً كلياً ونهائياً لا رجوع فيه بقصم واقتطاع مبلغ شهري ثابت وقدره [MONTHLY_INSTALLMENT] د.ك من راتبي الشهري والمستحقات العمالية الدورية وفاءً للمديونية المستحقة علي والبالغة [LOAN_AMOUNT] د.ك عن القرض الممنوح لي بتاريخ [DATE].

ويعتبر هذا التفويض التزاماً قانونياً صارماً حيال الجهات المالية والإدارية المعنية لحين السداد التام للقرض.

المقر بالتفويض (الموظف): [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع والبصمة: ............................`,
    contentEn: `Deduction Authorization Ref: [REF_NUMBER]
I, the undersigned [EMPLOYEE_NAME], Nationality: [NATIONALITY], Civil ID: [CIVIL_ID], employed as [JOB_TITLE].

Do hereby declare under full legal capacity and without any coercion, that I grant to [COMPANY_NAME] an absolute, final, and irrevocable consent to deduct a fixed monthly stipend of [MONTHLY_INSTALLMENT] KWD from my basic monthly salary and related periodic allowances to repay the outstanding debt of [LOAN_AMOUNT] KWD issued on [DATE].

This authorization is a binding financial covenant to HR and Payroll Systems until the total debt is satisfied in full.

Executing Employee: [EMPLOYEE_NAME]
Civil ID: [CIVIL_ID]
Signature & Fingerprint: ............................`
  },
  {
    id: "temp-05",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "جدول كشف الأقساط وخطة السداد المعتمدة",
    titleEn: "Amortization & Repayment Schedule Record",
    contentAr: `رقم الخطة: [REF_NUMBER]
التاريخ: [DATE]
المقترض: [EMPLOYEE_NAME] | راتب: [BASIC_SALARY] د.ك
نوع القرض: [LOAN_TYPE] | المبلغ: [LOAN_AMOUNT] د.ك

مخطط توزيع الديون والأقساط الشهرية (بما يتوافق مع قيود الشؤون العمالية والكويتية):
- القسط الشهري الثابت: [MONTHLY_INSTALLMENT] د.ك
- نسبة الاقتطاع الفعلي: [DEDUCTION_PERCENTAGE]% من الراتب الأساسي
- تاريخ أول قسط استحقاق: [START_DATE]
- تاريخ آخر قسط استحقاق: [END_DATE]

جدول الاستقطاعات الآلية المقررة بنظام الأجور والرواتب:
[INSTALLMENTS_TABLE]

أقر بالتزامي الكامل بجدول السداد المستقطع أعلاه.
توقيع المقترض: ....................  توقيع محاسب الأجور: ....................`,
    contentEn: `Schedule Ref: [REF_NUMBER]
Date: [DATE]
Borrower: [EMPLOYEE_NAME] | Salary: [BASIC_SALARY] KWD
Loan Type: [LOAN_TYPE] | Total: [LOAN_AMOUNT] KWD

Amortization map in strict compliance with the Kuwaiti Labor Office guidelines:
- Fixed Monthly Installment: [MONTHLY_INSTALLMENT] KWD
- Actual deduction percentage: [DEDUCTION_PERCENTAGE]% of basic salary
- First installment due date: [START_DATE]
- Last installment due date: [END_DATE]

Automatic Payroll deduction steps scheduled inside Adala HR system:
[INSTALLMENTS_TABLE]

I hereby acknowledge and agree to follow this schedule.
Borrower's Signature: ....................  Payroll Clerk Seal: ....................`
  },
  {
    id: "temp-06",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "إقرار مديونية رسمي والتزام بالسداد",
    titleEn: "Debt Acknowledgment & Repayment Covenant",
    contentAr: `الرقم المدني القانوني: [CIVIL_ID]
رقم الإقرار المالي: [REF_NUMBER]

أقر أنا الموقع أدناه [EMPLOYEE_NAME]، صاحب الرقم المدني [CIVIL_ID]، بأن في ذمتي مديونية مالية أكيدة وثابتة لصالح شركة [COMPANY_NAME] وقدرها [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي) والناتجة عن سلفة شخصية حصلت عليها.

وأتعهد بموجب هذا بسداد هذا الدين بالكامل دون تأخير عن طريق أقساط شهرية متتالية بقيمة [MONTHLY_INSTALLMENT] د.ك تخصم مباشرة من أجري الشهري، وفي حال تركي العمل لأي سبب من الأسباب قبل تمام السداد، يحل باقي الدين فوراً ويحق للشركة استيفاؤه من مستحقات نهاية الخدمة والبدلات والإجازات ومكافأة نهاية الخدمة، وهذا إقرار قطعي مني بذلك.

المقر بالمديونية (الموظف): [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع والبصمة القانونية: ............................`,
    contentEn: `Debt Registry ID: [REF_NUMBER]
Personal Civil ID: [CIVIL_ID]

I, the undersigned [EMPLOYEE_NAME], Civil ID [CIVIL_ID], do hereby solemnly declare and acknowledge that I owe a definitive and outstanding debt to [COMPANY_NAME] in the sum of [LOAN_AMOUNT] KWD (Only [LOAN_AMOUNT_WORDS] Kuwaiti Dinars) received as an internal corporate loan.

I unconditionally pledge to repay this amount through fixed monthly payroll deductions of [MONTHLY_INSTALLMENT] KWD. In the event of contract termination or separation for any reason prior to full settlement, the entire unpaid balance shall become immediately due and payable. The company is fully authorized to recover all outstanding amounts from my End-of-Service benefits (gratuity), leave balances, and other final settlements.

Debtor Name: [EMPLOYEE_NAME]
Civil ID: [CIVIL_ID]
Signature & Thumbprint: ............................`
  },
  {
    id: "temp-07",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "إقرار وتعهد كفيل ضامن وشخصي",
    titleEn: "Guarantor Personal Indemnity & Pledge Sheet",
    contentAr: `الرقم المرجعي للسند: [REF_NUMBER]
التاريخ: [DATE]

بناءً على القرض الممنوح للموظف [EMPLOYEE_NAME] بقيمة [LOAN_AMOUNT] د.ك.

أنا الموقع أدناه [GUARANTOR_NAME]، الجنسية: [GUARANTOR_NATIONALITY]، المدني: [GUARANTOR_CIVIL_ID]، أعمل بوظيفة [GUARANTOR_JOB]، براتب شهري [GUARANTOR_SALARY] د.ك، بصفتي كفيلاً ضامناً متضامناً للموظف المقترض.

أتعهد وأضمن كفالة شخصية تضامنية مطلقة لا رجعة فيها بسداد كافة الالتزامات والأقساط المترتبة على المقترض المذكور أعلاه في حال تخلفه عن السداد أو امتناعه لسبب من الأسباب. وألتزم بالوفاء بكامل رصيد المديونية للغير عند الإشعار الأول كمدين أصيل متضامن مع المقترض بالتكافل والتضامن.

اسم الكفيل الضامن: [GUARANTOR_NAME]
الرقم المدني: [GUARANTOR_CIVIL_ID]
التوقيع وصورة الهوية المرفقة: ............................`,
    contentEn: `Guarantor Bond Ref: [REF_NUMBER]
Date: [DATE]

In consideration of the corporate loan granted to the employee [EMPLOYEE_NAME] in the amount of [LOAN_AMOUNT] KWD.

I, the undersigned [GUARANTOR_NAME], Nationality: [GUARANTOR_NATIONALITY], Civil ID: [GUARANTOR_CIVIL_ID], Job Title: [GUARANTOR_JOB], Monthly Basic Wage: [GUARANTOR_SALARY] KWD, do hereby act as a joint guarantor for the aforementioned borrowing employee.

I execute an absolute, joint-and-several, irrevocable surety and personal guarantee to fulfill all repayments of the debtor if they default or exit employment. I covenant to pay the remaining debt immediately upon first notification as a primary debtor without defense.

Guarantor Name: [GUARANTOR_NAME]
Civil ID: [GUARANTOR_CIVIL_ID]
Signature & Civil ID Attachment: ............................`
  },
  {
    id: "temp-08",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "اتفاقية مخصصة للخصم المباشر من الراتب",
    titleEn: "Direct Basic Salary Deduction Corporate Agreement",
    contentAr: `رقم الاتفاقية الثنائية: [REF_NUMBER]
التاريخ: [DATE]

الطرف الأول: شركة [COMPANY_NAME] (بصفتها صاحب العمل والمقرض)
الطرف الثاني: السيد [EMPLOYEE_NAME] (بصفته العامل والمقترض)

موضوع الاتفاق:
حيث رغب الطرف الثاني في الحصول على تمويل بمبلغ [LOAN_AMOUNT] د.ك وتمت الموافقة من الطرف الأول، فقد اتفقا على ما يلي:
1. يتم خصم قسط شهري بقيمة [MONTHLY_INSTALLMENT] د.ك من راتب الطرف الثاني الأساسي.
2. يقر المقترض بأن هذا الخصم يقع ضمن السقف المصرح به قانونياً طبقاً للمادة 20 من القانون الكويتي 6/2010.
3. التزام كامل بأحكام السداد المنتظم بموجب اللائحة الإدارية للطرف الأول.

الطرف الأول (عن الشركة): .........................
الطرف الثاني (الموظف): .........................`,
    contentEn: `Bilateral Agreement Ref: [REF_NUMBER]
Date: [DATE]

First Party: [COMPANY_NAME] (As Employer and Lender)
Second Party: Mr./Ms. [EMPLOYEE_NAME] (As Employee and Borrower)

Subject of Agreement:
Since the Second Party requested a corporate loan of [LOAN_AMOUNT] KWD and the First Party approved, it is agreed:
1. A fixed monthly deduction of [MONTHLY_INSTALLMENT] KWD shall be automatically deducted from the Second Party's basic salary.
2. The borrower certifies this deduction is in full conformity with Kuwait Labor Law 6/2010, Article 20.
3. Full compliance with the repayment scheme set forth in company financial handbook.

First Party (For Company): .........................
Second Party (Employee): .........................`
  },
  {
    id: "temp-09",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "اتفاقية استقطاع واسترداد من مكافأة نهاية الخدمة",
    titleEn: "Deduction from End-of-Service Benefits (EOS) Accord",
    contentAr: `التحفظ القانوني بموجب المادة 51: [REF_NUMBER]
التاريخ: [DATE]

أقر أنا الموظف [EMPLOYEE_NAME]، بموافقتي المطلقة غير المشروطة على أنه في حال انتهاء خدمتي أو إنهائها من قبلي أو من قبل الشركة لأي سبب من الأسباب المنصوص عليها بقانون العمل الكويتي، وكان لا يزال في ذمتي رصيد مديونية غير مسدد للشركة ناتج عن القرض البالغ [LOAN_AMOUNT] د.ك.

فإنني أصرح وأفوض الشركة بخصم كامل الرصيد المتبقي وقدره [REMAINING_BALANCE] د.ك فوراً وبدفعة واحدة من قيمة مكافأة نهاية الخدمة المستحقة لي، أو بدلات الإجازات، أو الرواتب الموقوفة، أو أي مستحقات أخرى لديهم دون الحاجة للأحكام القضائية أو اتخاذ أي إجراء رسمي.

الموظف المقر: [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع: ............................`,
    contentEn: `Statutory Reservation (Article 51) Ref: [REF_NUMBER]
Date: [DATE]

I, the employee [EMPLOYEE_NAME], do hereby declare my absolute and unconditional consent that upon separation, resignation, or termination of my employment contract under any statutory clause in Kuwait, if there remains any outstanding balance of [LOAN_AMOUNT] KWD loan.

I authorize the Company to deduct the remaining outstanding balance of [REMAINING_BALANCE] KWD immediately and in a single transaction from my earned End-of-Service Benefit (gratuity), untaken annual leave compensation, escrowed salary, or any final financial packages, without further judicial declaration.

Declaring Employee: [EMPLOYEE_NAME]
Civil ID: [CIVIL_ID]
Signature: ............................`
  },
  {
    id: "temp-10",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    titleAr: "مذكرة تسوية جزئية للمديونية العالقة",
    titleEn: "Partial Debt Settlement Agreement Memo",
    contentAr: `رقم التسوية الودية: [REF_NUMBER]
التاريخ: [DATE]

جرت هذه التسوية لإنهاء وتعديل جدولة المديونية لـ [EMPLOYEE_NAME].
حيث تبين تعثر أو صعوبة التزام الموظف بسداد القسط المقدر بـ [MONTHLY_INSTALLMENT] د.ك، تقرر تعديل بنود الاسترداد بالتراضي على النحو التالي:
1. دفع مبلغ معجل كدفعة جزئية نقدية قيمتها [LOAN_AMOUNT] د.ك.
2. تقسيط باقي مديونية الموظف البالغة [REMAINING_BALANCE] د.ك على فترة ممددة تبلغ [TERM] شهراً إضافياً.
3. تعديل قيمة الاستقطاع الجديد لتصبح [MONTHLY_INSTALLMENT] د.ك ليتلاءم بشكل آمن ومستمر مع راتب الموظف ونظمه المالية.

توقيع محاسب التدقيق: ....................  توقيع الموظف المقر: ....................`,
    contentEn: `Amicable Settlement Ref: [REF_NUMBER]
Date: [DATE]

This settlement is executed to restructure the active debt profile of [EMPLOYEE_NAME].
Due to verified financial difficulties or changing payroll metrics, both parties agree to amend the repayment schedule as follows:
1. An immediate partial cash repayment of [LOAN_AMOUNT] KWD is executed.
2. The remaining outstanding balance of [REMAINING_BALANCE] KWD is amortized over a stretched period of [TERM] months.
3. The new monthly deduction rate is recalibrated to [MONTHLY_INSTALLMENT] KWD safeguarding basic living standards.

Auditing Accountant: ....................  Debilitated Employee Signature: ....................`
  },
  {
    id: "temp-11",
    category: "notices",
    categoryAr: "إشعارات وتنبيهات مالية",
    categoryEn: "Notices & Alerts",
    titleAr: "إشعار تأخير متأخرات وتنبيه بالسداد (إنذار)",
    titleEn: "Overdue Installment & Repayment Warning",
    contentAr: `رقم الإنذار المالي: [REF_NUMBER]
التاريخ: [DATE]

إنذار رسمي أول / تنبيه سداد أقساط متعثرة
إلى الموظف: [EMPLOYEE_NAME] المحترم
الرقم الوظيفي: [EMPLOYEE_ID]

نود إخطاركم رسمياً بأن نظام التدقيق المالي الآلي في [COMPANY_NAME] قد رصد تعثراً وتأخراً في سداد أقساط القرض الممنوح لكم برقم [REF_NUMBER]. حيث تبين وجود أقساط متراكمة متأخرة بلغت [LOAN_AMOUNT] د.ك وهي مستحقة منذ فترة ولم تسدد.

نهيب بكم سرعة مراجعة الشؤون المالية لتسوية هذا التأخير خلال (5) أيام عمل، أو تفويض الإدارة باستقطاع المبلغ تماشياً مع اللائحة الداخلية لمنع أي تداعيات قانونية أو إدارية.

عن الدائرة المالية والتدقيق: ....................
قسم الحسابات العامة: ....................`,
    contentEn: `Repayment Warning Ref: [REF_NUMBER]
Date: [DATE]

Official Delinquency Warning / Overdue Notice
To: Mr./Ms. [EMPLOYEE_NAME]
Employee ID: [EMPLOYEE_ID]

We hereby officially notify you that the automated financial system at [COMPANY_NAME] has recorded a delay in your mortgage/loan repayment schedule under agreement [REF_NUMBER]. Outstanding overdue balances have reached [LOAN_AMOUNT] KWD.

You are requested to visit the Payroll and Accounts department within (5) business days to settle this deficit or authorize corrective actions, avoiding further administrative consequences.

Chief Financial Auditor: ....................
Accounts Receivable Wing: ....................`
  },
  {
    id: "temp-12",
    category: "notices",
    categoryAr: "إشعارات وتنبيهات مالية",
    categoryEn: "Notices & Alerts",
    titleAr: "إقرار الالتزام بجدولة جديدة وحساب استقطاع مستقل",
    titleEn: "Restructured Payment Promise Covenant",
    contentAr: `رقم الجدولة الجديدة: [REF_NUMBER]
التاريخ: [DATE]

أقر أنا الموقع أدناه [EMPLOYEE_NAME]، برأفتي بمديونيتي القائمة بمبلغ [REMAINING_BALANCE] د.ك، وبسبب توقف السداد وتعديل الراتب، فإنني أتعهد بإقرار والتزام قاطع وصارم بسداد الأقساط الشهرية بعد إعادة جدولتها لتصبح بقيمة [MONTHLY_INSTALLMENT] د.ك تستقطع دورياً من راتبي الأساسي أو حسابي البنكي الشخصي لدى بنك [BANK_NAME].

وهذا تعهد قاطع بالالتزام الكامل ببنود الجدولة وتجنيداً لتراكم أي متأخرات إضافية.

توقيع الموظف المقر بالالتزام: ............................`,
    contentEn: `Restructured Bond Ref: [REF_NUMBER]
Date: [DATE]

I, the undersigned [EMPLOYEE_NAME], acknowledging my current liabilities of [REMAINING_BALANCE] KWD, and due to temporary payment suspension, do hereby pledge and promise to pay the restructured monthly installments of [MONTHLY_INSTALLMENT] KWD directly via bank transfer or payroll deductions.

This is a solemn binding commitment to prevent any subsequent default or credit actions.

Committed Employee Signature: ............................`
  },
  {
    id: "temp-13",
    category: "receipts",
    categoryAr: "إيصالات ومخالصات مخلقة",
    categoryEn: "Receipts & Releases",
    titleAr: "سند براءة ذمة ومخالصة مالية نهائية",
    titleEn: "Formal Debt Clearance & Release Certificate",
    contentAr: `رقم براءة الذمة: [REF_NUMBER]
التاريخ: [DATE]

مخالصة نهائية وبراءة ذمة مستخلص قرض مالي

تشهد شركة [COMPANY_NAME] بأن الموظف [EMPLOYEE_NAME]، المدني [CIVIL_ID]، قد قام بسداد كامل قيمة القرض الممنوح له والبالغ قيمته [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي لا غير) والمسجل بالطلب رقم [REF_NUMBER].

وبناءً عليه، تقر الشركة ببراءة ذمة الموظف براءة تامة ونهائية مانعة من المطالبة من تاريخ هذا السند بخصوص القرض المذكور أعلاه، وتم إلغاء كافة التعهدات والكفالات والخصومات المرتبطة بهذا القرض في النظام المالي للرواتب.

رئيس الحسابات العامة: ....................
توقيع المدير المالي والإداري: ....................
خاتم المخالصة الرسمي: [OFFICIAL_SEAL]`,
    contentEn: `Clearance Certificate Ref: [REF_NUMBER]
Date: [DATE]

Final Loan Settlement & Complete Release Certificate

[COMPANY_NAME] hereby certifies that employee [EMPLOYEE_NAME], Civil ID [CIVIL_ID], has satisfied and paid in full the corporate loan value of [LOAN_AMOUNT] KWD (Only [LOAN_AMOUNT_WORDS] Kuwaiti Dinars) registered under reference [REF_NUMBER].

Accordingly, the company issues a complete, absolute and final financial clearance, releasing the employee and the guarantor from all connected bonds. This loan file is officially closed.

Head of General Accounts: ....................
Finance & Administrative Director: ....................
Official Stamp: [OFFICIAL_SEAL]`
  },
  {
    id: "temp-14",
    category: "claims",
    categoryAr: "طلبات ونماذج تقديم",
    categoryEn: "Forms & Applications",
    titleAr: "سلفة طارئة قصيرة الأجل (لحساب السداد البنكي المباشر)",
    titleEn: "Rapid Micro-Advance Short-Term Request",
    contentAr: `رقم الطلب الصغير: [REF_NUMBER]
التاريخ: [DATE]

أتقدم أنا الموظف [EMPLOYEE_NAME] بطلب سلفة فورية ميسرة بقيمة [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي) على أن يتم خصم هذا المبلغ فوراً من الحوافز التشجيعية أو الراتب الإضافي للشهر القادم.

التزم طواعية بإجراء السداد والتسوية المادية السريعة قبل السقف المحدد.

الموظف المستلم: [EMPLOYEE_NAME]
التوقيع والبصمة: ............................`,
    contentEn: `Micro Request ID: [REF_NUMBER]
Date: [DATE]

I, the employee [EMPLOYEE_NAME], hereby apply for a rapid micro-advance of [LOAN_AMOUNT] KWD (Only [LOAN_AMOUNT_WORDS] Kuwaiti Dinars) with understanding that it will be fully set off from incentives or overtime bonuses next month.

I voluntarily pledge to complete this settlement in short term.

Recipient Employee Signature: ............................`
  }
];

export const getTemplateById = (id: string): LegalTemplate | undefined => {
  return LEGAL_TEMPLATES.find(t => t.id === id);
};

export const fillTemplate = (
  template: LegalTemplate,
  lang: 'ar' | 'en',
  replacements: { [key: string]: string }
): string => {
  let content = lang === 'ar' ? template.contentAr : template.contentEn;
  Object.keys(replacements).forEach(key => {
    const placeholder = `[${key}]`;
    content = content.replaceAll(placeholder, replacements[key]);
  });
  return content;
};
