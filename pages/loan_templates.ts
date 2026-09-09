export interface LegalTemplate {
  id: string;
  category: 'claims' | 'agreements' | 'notices' | 'receipts';
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  isCore?: boolean;
  docType?: 'promissory' | 'debt_ack' | 'bill_exchange' | 'wage_deduction' | 'eos_settlement' | 'general';
  contentAr: string;
  contentEn: string;
}

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  // 1. سند لأمر تنفيذي تجاري (Promissory Note)
  {
    id: "temp-promissory",
    category: "agreements",
    categoryAr: "سندات ومحررات تنفيذية",
    categoryEn: "Executive Instruments",
    isCore: true,
    docType: "promissory",
    titleAr: "سند لأمر تنفيذي تجاري واجب الوفاء",
    titleEn: "Commercial Promissory Note (Executive Order)",
    contentAr: `الرقم المرجعي للسند: [REF_NUMBER]
تاريخ الإنشاء: [DATE]
مكان الإنشاء: دولة الكويت - العاصمة

سند لأمر تجاري واجب الوفاء دون قيد أو شرط
(محرر تنفيذي وفقاً لنصوص المواد 506 إلى 518 من قانون التجارة الكويتي رقم 68 لسنة 1980)

أتعهد أنا الموقع أدناه:
- اسم المدين المحرر: [EMPLOYEE_NAME]
- الرقم المدني: [CIVIL_ID]
- الجنسية: [BORROWER_NATIONALITY]
- العنوان المعتمد: دولة الكويت - هاتف: [BORROWER_PHONE]

بأن أدفع بموجب هذا السند التنفيذي لأمر:
المستفيد / [OFFICE_NAME] (مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية)

مبلغاً وقدره: [LOAN_AMOUNT] د.ك
(فقط وقدره: [LOAN_AMOUNT_WORDS] لا غير)

شروط وميعاد الوفاء:
1. مكان الوفاء: دولة الكويت - الحساب البنكي المعتمد أو الخزينة العامة لمكتب المحامي صبري شطا.
2. ميعاد السداد: يسدد هذا المبلغ على عدد ([TERM]) قسطاً شهرياً متتالياً، قيمة كل قسط [MONTHLY_INSTALLMENT] د.ك، يبدأ استحقاق القسط الأول في [START_DATE].
3. سقوط الأجل والحلول الفوري: في حال التخلف عن سداد أي قسط في ميعاده المحدد، أو في حال انتهاء العلاقة التعاقدية أو العمالية لأي سبب، تسقط كافة الآجال فوراً ويحل كامل رصيد المديونية المتبقي وقدره [REMAINING_BALANCE] د.ك فوراً، ويكون واجب الأداء والتحصيل الجبري دون الحاجة إلى إنذار رسمي أو إعذار أو حكم قضائي مسبق.
4. التنازل عن الدفوع: يتنازل محرر السند صراحةً عن أي دفوع شكلية أو موضوعية، ويقر بأن هذا السند محرر تجاري نافذ ومنتج لكافة آثاره القانونية والتنفيذية وفق القانون الكويتي.

بيانات الكفيل الضامن المتضامن:
- الاسم: [GUARANTOR_NAME]
- الرقم المدني: [GUARANTOR_CIVIL_ID]
- التوقيع: ............................

المحرر والمدين الأصلي: [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع: ............................
البصمة القانونية الإلزامية: [   بصمة الإبهام الأيمن   ]

اعتماد وتوثيق مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
الختم والرمز الرقمي المعتمد: [OFFICIAL_SEAL]`,
    contentEn: `Promissory Note Ref: [REF_NUMBER]
Execution Date: [DATE]
Execution Place: State of Kuwait

Commercial Promissory Note Payable on Demand
(Executive Commercial Instrument pursuant to Articles 506-518 of Kuwait Commercial Code No. 68/1980)

I, the undersigned Promisor / Debtor:
- Name: [EMPLOYEE_NAME]
- Civil ID: [CIVIL_ID]
- Nationality: [BORROWER_NATIONALITY]
- Domicile: State of Kuwait

Hereby unconditionally promise to pay to the order of:
Beneficiary: [OFFICE_NAME] (Sabri Shatta Law Firm & Legal Consultations)

The total principal sum of: [LOAN_AMOUNT] KWD
(Only: [LOAN_AMOUNT_WORDS])

Terms of Repayment:
1. Place of Payment: State of Kuwait.
2. Repayment Schedule: Amortized over ([TERM]) consecutive monthly installments of [MONTHLY_INSTALLMENT] KWD each, starting on [START_DATE].
3. Acceleration of Maturity: Default in any installment or termination of employment causes immediate maturity of the remaining balance ([REMAINING_BALANCE] KWD), enforceable immediately without prior judicial decree.

Promisor / Debtor: [EMPLOYEE_NAME]
Civil ID: [CIVIL_ID]
Signature: ............................   Thumbprint: ............................
Guarantor: [GUARANTOR_NAME] (Civil ID: [GUARANTOR_CIVIL_ID])
Official Stamp & QR Authentication: [OFFICIAL_SEAL]`
  },

  // 2. إقرار دين رسمي والتزام بالسداد (Debt Acknowledgment)
  {
    id: "temp-debt-ack",
    category: "agreements",
    categoryAr: "إقرارات والتزامات مالية",
    categoryEn: "Debt Acknowledgments",
    isCore: true,
    docType: "debt_ack",
    titleAr: "إقرار دين رسمي وتعهد بالوفاء والمسؤولية",
    titleEn: "Formal Debt Acknowledgment & Undertaking",
    contentAr: `الرقم المرجعي للإقرار: [REF_NUMBER]
تاريخ التوثيق: [DATE]
المكان: دولة الكويت

إقرار دين شرعي وقانوني وتعهد بالسداد
(صادر بموجب أحكام القانون المدني الكويتي وقانون الإثبات في المواد المدنية والتجارية)

أقر أنا الموقع أدناه بكامل قواي العقلية وأهليتي القانونية المعتبرة شرعاً وقانوناً وبدون أي إكراه أو تدليس:
- الاسم الكامل: [EMPLOYEE_NAME]
- الرقم المدني: [CIVIL_ID]
- المسمى الوظيفي: [JOB_TITLE]
- جهة العمل: [COMPANY_NAME]
- الراتب الأساسي الشهري: [BASIC_SALARY] د.ك

بأنني مدين ومديون ومسؤول شخصياً تجاه:
الدائن / [OFFICE_NAME] (مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية)

بمبلغ نقدي معلوم وقدره: [LOAN_AMOUNT] د.ك
(فقط وقدره: [LOAN_AMOUNT_WORDS] لا غير)

سبب المديونية:
تمويل مالي (سلفة / قرض حسن للموظفين) ممنوح لي لتغطية: [PURPOSE]، وقد استلمت كامل المبلغ المذكور نقداً / بموجب تحويل بنكي لحسابي، وذمتي مشغولة به.

التعهد بالوفاء وجدول الخصم:
1. أتعهد بالتزام قاطع بسداد المديونية على أقساط شهرية منتظمة قدرها [MONTHLY_INSTALLMENT] د.ك لكل شهر لمدة ([TERM]) شهراً تبدأ من [START_DATE].
2. أفوض الدائن تفويضاً نهائياً لا رجعة فيه بخصم هذا القسط مباشرة من مسير راتبي الشهري أو أية مخصصات أخرى، بما لا يتعارض مع سقف المادة (20) من قانون العمل الكويتي (10% من الراتب الأساسي).
3. أقر بأنه في حال عدم الوفاء، يحق للدائن اتخاذ كافة الإجراءات التنفيذية وحجز المستحقات والتحصيل الجبري.

المقر بما فيه (المدين): [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع: ............................
البصمة المعتمدة: [   بصمة الإبهام الأيمن   ]

شاهد وإقرار الكفيل الضامن:
الاسم: [GUARANTOR_NAME] - المدني: [GUARANTOR_CIVIL_ID]
التوقيع: ............................

توثيق مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
الختم الرسمي: [OFFICIAL_SEAL]`,
    contentEn: `Debt Acknowledgment Ref: [REF_NUMBER]
Date: [DATE]
Location: State of Kuwait

Formal Legal Debt Acknowledgment & Undertaking
(Pursuant to Kuwait Civil Law and Evidence Code in Civil & Commercial Matters)

I, the undersigned, in full legal capacity and without coercion:
- Debtor Name: [EMPLOYEE_NAME]
- Civil ID: [CIVIL_ID]
- Position: [JOB_TITLE]
- Employer: [COMPANY_NAME]
- Basic Wage: [BASIC_SALARY] KWD

Do hereby acknowledge that I am fully indebted and liable to:
Creditor: [OFFICE_NAME] (Sabri Shatta Law Firm)

In the principal sum of: [LOAN_AMOUNT] KWD
(Only: [LOAN_AMOUNT_WORDS])

Being an internal employee loan granted for: [PURPOSE].

I pledge to amortize this sum in monthly installments of [MONTHLY_INSTALLMENT] KWD over ([TERM]) months starting [START_DATE], authorizing direct payroll deductions compliant with Article 20 of Kuwait Labor Law.

Debtor: [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID])
Signature & Thumbprint: ............................
Guarantor: [GUARANTOR_NAME]
Official Law Firm Stamp: [OFFICIAL_SEAL]`
  },

  // 3. كمبيالة تجارية واجبة الدفع (Bill of Exchange / Commercial Draft)
  {
    id: "temp-bill-of-exchange",
    category: "agreements",
    categoryAr: "سندات ومحررات تنفيذية",
    categoryEn: "Executive Instruments",
    isCore: true,
    docType: "bill_exchange",
    titleAr: "كمبيالة تجارية واجبة الدفع والوفاء",
    titleEn: "Commercial Bill of Exchange (Draft)",
    contentAr: `رقم الكمبيالة المرجعي: [REF_NUMBER]
تاريخ الإنشاء: [DATE]
مكان الإنشاء: دولة الكويت - العاصمة
مبلغ الكمبيالة: [LOAN_AMOUNT] د.ك ([LOAN_AMOUNT_WORDS])

كمبيالة تجارية رسمية
(محررة وفقاً لنصوص المواد 472 إلى 505 من قانون التجارة الكويتي رقم 68 لسنة 1980)

إلى المسحوب عليه (المدين):
- الاسم: [EMPLOYEE_NAME]
- الرقم المدني: [CIVIL_ID]
- العنوان: دولة الكويت

ادفعوا بموجب هذه الكمبيالة التجارية لأمر:
المستفيد / [OFFICE_NAME] (مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية)

المبلغ المذكور أعلاه وقدره: [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] لا غير).

ميعاد الاستحقاق:
[END_DATE]، أو على أقساط متتابعة بواقع [MONTHLY_INSTALLMENT] د.ك شهرياً اعتباراً من [START_DATE].

مكان الوفاء: دولة الكويت - الحساب الرسمي لمكتب المحامي صبري شطا.

القبول والتعهد بالدفع:
أقر أنا المسحوب عليه [EMPLOYEE_NAME] بقبولي الصريح لهذه الكمبيالة وتعهدي غير المشروط بالوفاء بقيمتها في الميعاد المحدد دون أي تأخير، مع تنازلي عن عمل الاحتجاج (بروتستو عدم الوفاء) وعن كافة الإخطارات القانونية.

قبول المسحوب عليه (المدين): [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع: ............................
البصمة: [   بصمة الإبهام   ]

الكفيل الاحتياطي (الضامن الاحتياطي Aval):
الاسم: [GUARANTOR_NAME] (المدني: [GUARANTOR_CIVIL_ID])
توقيع الضامن الاحتياطي: ............................

الساحب: مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
الختم والاعتماد: [OFFICIAL_SEAL]`,
    contentEn: `Bill of Exchange Ref: [REF_NUMBER]
Date: [DATE]
Place of Issue: State of Kuwait
Amount: [LOAN_AMOUNT] KWD ([LOAN_AMOUNT_WORDS])

Commercial Bill of Exchange (Draft)
(Pursuant to Articles 472-505 of Kuwait Commercial Code No. 68/1980)

To Drawee (Debtor):
- Name: [EMPLOYEE_NAME]
- Civil ID: [CIVIL_ID]
- Domicile: State of Kuwait

Pay against this Bill of Exchange to the order of:
Beneficiary: [OFFICE_NAME] (Sabri Shatta Law Firm)

The sum of: [LOAN_AMOUNT] KWD (Only [LOAN_AMOUNT_WORDS]).

Maturity Date: [END_DATE] (or monthly installments of [MONTHLY_INSTALLMENT] KWD starting [START_DATE]).

Drawee Acceptance & Undertaking:
Accepted unconditionally by Drawee: [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID]).
Signature & Thumbprint: ............................
Aval / Guarantor: [GUARANTOR_NAME] (Civil ID: [GUARANTOR_CIVIL_ID])
Drawer: Sabri Shatta Law Firm
Official Stamp & QR: [OFFICIAL_SEAL]`
  },

  // 4. اتفاقية ومخالصة تسوية نهاية الخدمة (مادة 51)
  {
    id: "temp-09",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    isCore: true,
    docType: "eos_settlement",
    titleAr: "اتفاقية ومخالصة تسوية مديونية من مكافأة نهاية الخدمة (المادة 51)",
    titleEn: "EOS Benefits Liquidation & Set-Off Accord (Art 51)",
    contentAr: `رقم تسوية المادة 51: [REF_NUMBER]
تاريخ التسوية: [DATE]
المكان: دولة الكويت

اتفاقية ومخالصة تسوية مديونية واستقطاع من مستحقات نهاية الخدمة
(إعمالاً لصريح نص المادتين 20 و 51 من قانون العمل الكويتي رقم 6 لسنة 2010)

الطرف الأول (صاحب العمل / الدائن):
[OFFICE_NAME] (مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية)

الطرف الثاني (الموظف / المدين):
الاسم: [EMPLOYEE_NAME] - الرقم المدني: [CIVIL_ID] - الرقم الوظيفي: [EMPLOYEE_ID]

التمهيد والوقائع:
حيث أن الطرف الثاني كان مديناً للطرف الأول برصيد مديونية ناجم عن تمويل مالي / قرض معلق قيمته الأصلية [LOAN_AMOUNT] د.ك، ومتبقٍ في ذمته رصيد قائم قدره [REMAINING_BALANCE] د.ك.
وحيث انتهت خدمة الطرف الثاني لدى الطرف الأول وتقررت له مستحقات مكافأة نهاية الخدمة وبدل الإجازات ومستحقات الأجور،
فقد اتفق الطرفان بكامل الأهلية والرضا التام على البنود التالية:

البند الأول (الجبر التلقائي والمقاصة القانونية):
يوافق الطرف الثاني ويفوض الطرف الأول تفويضاً صريحاً ونهائياً لا رجعة فيه بإجراء المقاصة والجبر المالي باقتطاع كامل رصيد المديونية المتبقي البالغ [REMAINING_BALANCE] د.ك من إجمالي مكافأة نهاية خدمته، وذلك دون التقيد بسقف الاستقطاع الشهري (10%) المنصوص عليه بالمادة 20، نظراً لانتهاء علاقة العمل وجواز استيفاء كامل المديونيات من مستحقات نهاية الخدمة طبقاً للمادتين 20 و 51.

البند الثاني (صرف صافي المستحقات):
يقوم الطرف الأول بتحويل صافي مكافأة نهاية الخدمة المتبقية بعد إجراء المقاصة لحساب الطرف الثاني البنكي.

البند الثالث (براءة الذمة الشاملة وإلغاء السندات):
بمجرد تنفيذ هذا الاستقطاع والمقاصة، تعتبر ذمة الطرف الثاني والكفيل الضامن [GUARANTOR_NAME] بريئة براءة تامة ونهائية وناجزة من أي التزام يخص هذا القرض، وتلغى كافة الكمبيالات وسندات الأمر والكفالات المرتبطة به.

الطرف الأول (عن الإدارة القانونية والمالية): ..............................
الطرف الثاني (الموظف المقر بالمخالصة): [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع: ............................  البصمة: [   بصمة الإبهام   ]

توثيق واعتماد مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
خاتم التسوية والمخالصة المعتمد: [OFFICIAL_SEAL]`,
    contentEn: `Article 51 Settlement Ref: [REF_NUMBER]
Date: [DATE]
Location: State of Kuwait

End of Service Debt Liquidation & Set-Off Accord
(Pursuant to Articles 20 & 51 of Kuwait Labor Law No. 6/2010)

First Party: [OFFICE_NAME] (Sabri Shatta Law Firm)
Second Party (Employee): [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID])

Whereas the Second Party holds an outstanding debt balance of [REMAINING_BALANCE] KWD, and employment has terminated with accrued End of Service indemnity benefits.

Both parties mutually agree:
1. Automatic Set-Off & Offset: Full deduction of [REMAINING_BALANCE] KWD from End-of-Service benefits without the 10% monthly limit under Articles 20 & 51.
2. Net Payout: First Party shall disburse the net remaining balance to Second Party.
3. Full & Final Discharge: Total cancellation of all promissory notes, drafts, and guarantor liabilities.

First Party: Sabri Shatta Law Firm
Second Party: [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID])
Signature & Thumbprint: ............................
Official Stamp: [OFFICIAL_SEAL]`
  },

  // 5. إقرار وتفويض رسمي بالاستقطاع الدوري من الراتب (المادة 20)
  {
    id: "temp-04",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    isCore: true,
    docType: "wage_deduction",
    titleAr: "إقرار وتفويض استقطاع شهري من الراتب (المادة 20)",
    titleEn: "Direct Wage Deduction Authorization (Art 20)",
    contentAr: `رقم الترخيص والتفويض: [REF_NUMBER]
التاريخ: [DATE]

إقرار وتفويض رسمي بالاستقطاع الدوري من الراتب
(وفقاً لأحكام المادة 20 من قانون العمل الكويتي رقم 6 لسنة 2010)

أنا الموقع أدناه:
- الاسم: [EMPLOYEE_NAME]
- الرقم المدني: [CIVIL_ID]
- الوظيفة: [JOB_TITLE]
- جهة العمل: [COMPANY_NAME]
- الراتب الأساسي الشهري: [BASIC_SALARY] د.ك

أقر بكامل أهليتي المعتبرة شرعاً وقانوناً، وبدون أي إكراه، بأنني أفوض إدارة [OFFICE_NAME] تفويضاً صريحاً ومطلقاً ونهائياً لا رجوع فيه باستقطاع مبلغ شهري ثابت وقدره [MONTHLY_INSTALLMENT] د.ك من راتبي الأساسي الشهري والبدلات الدورية، وهو ما يمثل نسبة [DEDUCTION_PERCENTAGE]% من راتبي الأساسي (ضمن سقف 10% القانوني المقرر بالمادة 20)، وذلك وفاءً للقرض الممنوح لي والبالغ إجماليه [LOAN_AMOUNT] د.ك المقيد بالملف رقم [REF_NUMBER].

ويستمر هذا الاستقطاع شهرياً بانتظام اعتباراً من [START_DATE] وحتى تمام السداد الكامل لكافة الأقساط البالغة ([TERM]) قسطاً شهرياً.

المقر والمفوض (الموظف): [EMPLOYEE_NAME]
الرقم المدني: [CIVIL_ID]
التوقيع: ............................  البصمة: ............................

اعتماد مكتب المحامي صبري شطا
الختم الرسمي: [OFFICIAL_SEAL]`,
    contentEn: `Authorization Reference: [REF_NUMBER]
Date: [DATE]

Formal Direct Wage Deduction Authorization
(In compliance with Article 20 of Kuwait Labor Law No. 6/2010)

I, the undersigned:
- Name: [EMPLOYEE_NAME]
- Civil ID: [CIVIL_ID]
- Position: [JOB_TITLE]
- Basic Wage: [BASIC_SALARY] KWD

Grant [OFFICE_NAME] irrevocable authorization to deduct monthly installment of [MONTHLY_INSTALLMENT] KWD ([DEDUCTION_PERCENTAGE]% of basic wage - compliant with 10% Article 20 cap) to satisfy corporate loan [REF_NUMBER] of [LOAN_AMOUNT] KWD over ([TERM]) months starting [START_DATE].

Authorizing Employee: [EMPLOYEE_NAME]
Civil ID: [CIVIL_ID]
Signature & Thumbprint: ............................
Official Stamp: [OFFICIAL_SEAL]`
  },

  // 6. طلب قرض موظف رسمي
  {
    id: "temp-01",
    category: "claims",
    categoryAr: "طلبات ونماذج تقديم",
    categoryEn: "Forms & Applications",
    isCore: true,
    titleAr: "طلب قرض موظف مالي رسمي",
    titleEn: "Official Employee Loan Application",
    contentAr: `رقم الطلب المرجعي: [REF_NUMBER]
التاريخ: [DATE]
الجهة الموجه إليها: إدارة الشؤون المالية والإدارية - [OFFICE_NAME]

الموضوع: طلب الحصول على قرض مالي للموظفين (قرض حسن)

أتقدم أنا الموظف الموقع أدناه بالبيانات التالية:
- اسم الموظف: [EMPLOYEE_NAME]
- الرقم المدني: [CIVIL_ID]
- المسمى الوظيفي: [JOB_TITLE]
- القسم / الدائرة: [DEPARTMENT]
- الراتب الأساسي الشهري: [BASIC_SALARY] د.ك

أرجو التكرم بالموافقة على منحي قرضاً ميسراً من صندوق المكتب بمبلغ وقدره: [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي لا غير).

أسباب ومبررات طلب القرض:
[PURPOSE]

خطة السداد المقترحة:
أقترح سداد هذا التمويل على عدد ([TERM]) قسطاً شهرياً متتالياً، بقيمة [MONTHLY_INSTALLMENT] د.ك لكل قسط شهري، على أن يبدأ أول استقطاع من مسير رواتب شهر [START_DATE]، مع إقراري التام بأن هذا الاستقطاع يقع ضمن السقف القانوني المقرر بالمادة (20) من قانون العمل الكويتي رقم 6 لسنة 2010 (10% من الراتب الأساسي).

بيانات الكفيل الضامن (إن وجد):
- اسم الكفيل: [GUARANTOR_NAME]
- الرقم المدني للكفيل: [GUARANTOR_CIVIL_ID]

مقدم الطلب: [EMPLOYEE_NAME]
التوقيع: ............................  البصمة: ............................`,
    contentEn: `Reference ID: [REF_NUMBER]
Date: [DATE]
To: Department of Administrative & Financial Affairs - [OFFICE_NAME]

Subject: Official Employee Loan Application

Applicant Details:
- Name: [EMPLOYEE_NAME] | Civil ID: [CIVIL_ID] | Position: [JOB_TITLE] | Basic Salary: [BASIC_SALARY] KWD

I request approval for an internal loan of [LOAN_AMOUNT] KWD ([LOAN_AMOUNT_WORDS]) over ([TERM]) monthly installments of [MONTHLY_INSTALLMENT] KWD starting [START_DATE] in compliance with Article 20 of Kuwait Labor Law.

Applicant: [EMPLOYEE_NAME]
Signature & Thumbprint: ............................`
  },

  // 7. إقرار وتعهد كفيل ضامن شخصي
  {
    id: "temp-07",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    isCore: true,
    titleAr: "إقرار وتعهد كفيل ضامن شخصي متضامن",
    titleEn: "Guarantor Joint Surety & Indemnity Pledge",
    contentAr: `رقم سند الكفالة: [REF_NUMBER]
التاريخ: [DATE]
جهة الكفالة: [OFFICE_NAME]

سند كفالة شخصية تضامنية مطلقة
(وفقاً لأحكام الكفالة في القانون المدني والتجاري الكويتي)

بناءً على التمويل المالي الممنوح للمدين الأصلي (الموظف): [EMPLOYEE_NAME] (المدني: [CIVIL_ID]) بمبلغ [LOAN_AMOUNT] د.ك.

أقر أنا الموقع أدناه:
- اسم الكفيل الضامن: [GUARANTOR_NAME]
- الرقم المدني للكفيل: [GUARANTOR_CIVIL_ID]
- الجنسية: [GUARANTOR_NATIONALITY]
- جهة العمل / الوظيفة: [GUARANTOR_JOB]
- الراتب الشهري: [GUARANTOR_SALARY] د.ك

بصفتي كفيلاً ضامناً متضامناً للمدين الأصلي المذكور أعلاه، ألتزم وأتعهد بكفالة شخصية تضامنية مطلقة وغير قابلة للرجوع بسداد كافة الأقساط والالتزامات المترتبة على المقترض في ذمة [OFFICE_NAME]، متنازلاً عن حق التجريد والتجرؤ، معتبراً نفسي مديناً أصيلاً متضامناً بالتكافل والتضامن في الوفاء بكامل رصيد المديونية عند أول إشعار بالسداد.

اسم الكفيل الضامن: [GUARANTOR_NAME]
الرقم المدني: [GUARANTOR_CIVIL_ID]
التوقيع والبصمة: ............................`,
    contentEn: `Guarantor Bond Ref: [REF_NUMBER]
Date: [DATE]
Beneficiary: [OFFICE_NAME]

Absolute Joint & Several Personal Guarantee Bond
(Under Kuwait Civil & Commercial Code provisions)

In consideration of the corporate loan granted to Principal Debtor: [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID]) in the amount of [LOAN_AMOUNT] KWD.

I, Guarantor [GUARANTOR_NAME] (Civil ID: [GUARANTOR_CIVIL_ID]), unconditionally guarantee punctual payment of all installments and liabilities owed by the borrower to [OFFICE_NAME].

Guarantor Signature & Thumbprint: ............................`
  },

  // 8. شهادة براءة ذمة ومخالصة مالية نهائية
  {
    id: "temp-13",
    category: "receipts",
    categoryAr: "إيصالات ومخالصات مخلقة",
    categoryEn: "Receipts & Releases",
    titleAr: "شهادة براءة ذمة ومخالصة مالية نهائية من القرض",
    titleEn: "Final Debt Clearance & Discharge Certificate",
    contentAr: `رقم براءة الذمة: [REF_NUMBER]
التاريخ: [DATE]
الجهة المصدرة: إدارة الحسابات العامة والتدقيق - [OFFICE_NAME]

شهادة براءة ذمة ومخالصة مالية نهائية من القرض

تشهد إدارة [OFFICE_NAME] بأن الموظف:
- الاسم: [EMPLOYEE_NAME]
- الرقم المدني: [CIVIL_ID]
- الرقم الوظيفي: [EMPLOYEE_ID]

قد قام بسداد كامل قيمة القرض الممنوح له والبالغ قيمته [LOAN_AMOUNT] د.ك (فقط [LOAN_AMOUNT_WORDS] دينار كويتي لا غير) المسجل بالملف رقم [REF_NUMBER]، وأصبح رصيد المديونية صفراً (0.000 د.ك).

وبناءً عليه، تقر الإدارة بإبراء ذمة الموظف والكفيل الضامن [GUARANTOR_NAME] إبراءً تاماً وشاملاً ونهائياً مانعاً من أي رجوع أو مطالبة مستقبلية بخصوص هذا القرض، وتم إيقاف أي استقطاعات بالرواتب وإلغاء السندات التنفيذية المرتبطة به.

رئيس الحسابات العامة: ....................
المدير المالي والإداري: ....................
خاتم المخالصة الرسمي المعتمد: [OFFICIAL_SEAL]`,
    contentEn: `Clearance Certificate Ref: [REF_NUMBER]
Date: [DATE]
Issued By: General Accounts & Audit Division - [OFFICE_NAME]

Final Loan Clearance & Liability Discharge Certificate

[OFFICE_NAME] hereby certifies that employee [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID]) has satisfied in full the corporate loan of [LOAN_AMOUNT] KWD ([LOAN_AMOUNT_WORDS]) under file [REF_NUMBER], reducing the outstanding balance to zero (0.000 KWD).

All obligations and guarantor liabilities are hereby fully discharged and canceled.

Head of General Accounts: ....................
Finance & Admin Director: ....................
Official Stamp: [OFFICIAL_SEAL]`
  },

  // 9. إنذار مالي قانوني رسمي للمقترض والكفيل
  {
    id: "temp-11",
    category: "notices",
    categoryAr: "إشعارات وتنبيهات مالية",
    categoryEn: "Notices & Alerts",
    titleAr: "إنذار مالي قانوني رسمي للمقترض والكفيل بتعثر السداد",
    titleEn: "Legal Delinquency & Default Warning Notice",
    contentAr: `رقم الإنذار المالي: [REF_NUMBER]
التاريخ: [DATE]

إنذار رسمي أول / تنبيه سداد أقساط متعثرة
إلى الموظف المقترض: [EMPLOYEE_NAME] (المدني: [CIVIL_ID])
وإلى الكفيل الضامن المتضامن: [GUARANTOR_NAME] (المدني: [GUARANTOR_CIVIL_ID])

نود إخطاركم رسمياً بأن نظام التدقيق المالي الآلي في [OFFICE_NAME] قد رصد تعثراً وتأخراً في سداد أقساط القرض الممنوح لكم برقم [REF_NUMBER]، حيث بلغت الأقساط المتراكمة المتأخرة [LOAN_AMOUNT] د.ك من إجمالي رصيد متبقٍ قدره [REMAINING_BALANCE] د.ك.

نهيب بكم سرعة مراجعة الدائرة المالية لتسوية هذا التأخير خلال (5) أيام عمل من تاريخه، وإلا سيتم تفعيل السند التنفيذي لأمر وإجراءات التنفيذ القضائي وحجز الراتب ومنع السفر بحق المقترض والكفيل المتضامن طبقاً للقانون الكويتي.

عن الدائرة القانونية والتدقيق المالي: ....................
خاتم الإشعار: [OFFICIAL_SEAL]`,
    contentEn: `Delinquency Warning Ref: [REF_NUMBER]
Date: [DATE]

Official Legal Delinquency Warning & Default Notice
To Debtor: [EMPLOYEE_NAME] (Civil ID: [CIVIL_ID])
And Joint Guarantor: [GUARANTOR_NAME] (Civil ID: [GUARANTOR_CIVIL_ID])

We hereby notify you of default in loan repayment under agreement [REF_NUMBER] with overdue amount of [LOAN_AMOUNT] KWD. Settle within 5 business days to avoid legal execution and travel ban procedures under Kuwait Law.

Legal & Financial Audit Division: ....................
Official Seal: [OFFICIAL_SEAL]`
  },

  // 10. جدول إفصاح كشف الأقساط والجدولة المالية
  {
    id: "temp-05",
    category: "agreements",
    categoryAr: "اتفاقيات وقرارات إدارية",
    categoryEn: "Agreements & Decisions",
    isCore: true,
    titleAr: "جدول إفصاح كشف الأقساط والجدولة المالية",
    titleEn: "Disclosed Amortization & Repayment Schedule",
    contentAr: `رقم الجدولة المعتمد: [REF_NUMBER]
تاريخ الإصدار: [DATE]
المقترض: [EMPLOYEE_NAME] | الرقم المدني: [CIVIL_ID]
الراتب الأساسي: [BASIC_SALARY] د.ك | إجمالي التمويل: [LOAN_AMOUNT] د.ك

كشف تفصيلي بجدولة الأقساط الشهرية ونسب الاستقطاع المقررة:
- القسط الشهري الثابت: [MONTHLY_INSTALLMENT] د.ك
- عدد الأقساط الإجمالية: [TERM] شهراً
- نسبة الاستقطاع من الراتب الأساسي: [DEDUCTION_PERCENTAGE]% (مطابقة للمادة 20)
- تاريخ أول قسط استحقاق: [START_DATE]
- تاريخ انتهاء السداد المتوقع: [END_DATE]

جدول توزيع الأقساط الشهرية:
[INSTALLMENTS_TABLE]

أقر أنا الموظف [EMPLOYEE_NAME] باطلاعي التام وموافقتي على جدول الأقساط المبين أعلاه والتزامي بعدم منازعته.

توقيع المقترض: ............................   توقيع محاسب التدقيق والرواتب: ............................`,
    contentEn: `Amortization Schedule Ref: [REF_NUMBER]
Date of Issue: [DATE]
Borrower: [EMPLOYEE_NAME] | Civil ID: [CIVIL_ID]
Basic Wage: [BASIC_SALARY] KWD | Total Principal: [LOAN_AMOUNT] KWD

Installment Schedule:
[INSTALLMENTS_TABLE]

Borrower Signature: ............................   Payroll Auditor Signature: ............................`
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
    content = content.replaceAll(placeholder, replacements[key] || '');
  });
  return content;
};
