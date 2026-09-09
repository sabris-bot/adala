export interface LawArticle {
  id: string;
  lawNameAr: string;
  lawNameEn: string;
  articleNumber: string;
  contentAr: string;
  contentEn: string;
  category: 'labor' | 'civil' | 'rental' | 'commercial' | 'corporate';
  govermentSource: string;
}

export const kuwaitLawsDatabase: LawArticle[] = [
  {
    id: "law-labor-17",
    lawNameAr: "قانون العمل في القطاع الأهلي رقم 6 لسنة 2010",
    lawNameEn: "Kuwait Labor Law No. 6 of 2010 (Private Sector)",
    articleNumber: "المادة 17",
    contentAr: "يجوز تعيين العامل تحت شرط التجربة إذا كان ذلك منصوصاً عليه في عقد العمل، على ألا تزيد فترة التجربة على مائة يوم عمل. ولا يجوز تعيين العامل تحت شرط التجربة أكثر من مرة واحدة لدى صاحب عمل واحد.",
    contentEn: "The employee may be appointed under a probation period if explicitly stated in the employment contract, provided that the probation period does not exceed 100 working days. An employee cannot slide into a probation period more than once with the same employer.",
    category: "labor",
    govermentSource: "جريدة الكويت اليوم الرسمية / الهيئة العامة للقوى العاملة"
  },
  {
    id: "law-labor-51",
    lawNameAr: "قانون العمل في القطاع الأهلي رقم 6 لسنة 2010",
    lawNameEn: "Kuwait Labor Law No. 6 of 2010 (Private Sector)",
    articleNumber: "المادة 51",
    contentAr: "يستحق العامل مكافأة نهاية الخدمة كاملة عند انتهاء خدمته، وتحسب نهاية الخدمة بمعدل أجر 15 يوماً عن كل سنة من السنوات الخمس الأولى، وأجر شهر كامل عن كل سنة من السنوات التالية، على ألا تزيد المكافأة في مجموعها عن أجر سنتين.",
    contentEn: "The worker is entitled to an end-of-service bonus upon termination. The bonus is calculated at the rate of 15 days' salary for each of the first five years, and a full month's salary for each subsequent year, provided the total does not exceed two years' salary.",
    category: "labor",
    govermentSource: "البوابة الرسمية لدولة الكويت / وزارة العدل والتشريع"
  },
  {
    id: "law-labor-53",
    lawNameAr: "قانون العمل في القطاع الأهلي رقم 6 لسنة 2010",
    lawNameEn: "Kuwait Labor Law No. 6 of 2010 (Private Sector)",
    articleNumber: "المادة 53",
    contentAr: "إذا انتهى عقد العمل غير محدد المدة بسبب استقالة العامل، يستحق المكافأة على النحو التالي:\n1. نصف المكافأة إذا بلغت خدمة الموظف من 3 إلى 5 سنوات.\n2. ثلثي المكافأة إذا بلغت خدمة الموظف من 5 إلى 10 سنوات.\n3. المكافأة كاملة إذا زادت مدة الخدمة عن 10 سنوات.\nأما إذا كانت مدة الخدمة أقل من 3 سنوات، فلا يستحق العامل أية مكافأة.",
    contentEn: "If an indefinite employment contract is terminated due to the resignation of the employee, he is entitled to: 1. Half of the bonus for 3 to 5 years of service. 2. Two-thirds of the bonus for 5 to 10 years of service. 3. Full bonus if service exceeds 10 years. Under 3 years of service, no bonus is due.",
    category: "labor",
    govermentSource: "وزارة الشؤون الاجتماعية والعمل - إدارة علاقات العمل"
  },
  {
    id: "law-labor-64",
    lawNameAr: "قانون العمل في القطاع الأهلي رقم 6 لسنة 2010",
    lawNameEn: "Kuwait Labor Law No. 6 of 2010 (Private Sector)",
    articleNumber: "المادة 64",
    contentAr: "لا يجوز تشغيل العامل أكثر من 48 ساعة أسبوعياً أو 8 ساعات يومياً إلا في الأحوال المنصوص عليها في هذا القانون. وتكون ساعات العمل في شهر رمضان المبارك 36 ساعة أسبوعياً للمسافرين والمسلمين.",
    contentEn: "It is prohibited to employ a worker for more than 48 hours per week or 8 hours per day, except as specified. During the Holy Month of Ramadan, work hours are reduced to 36 hours per week for Muslim workers.",
    category: "labor",
    govermentSource: "الهيئة العامة للقوى العاملة"
  },
  {
    id: "law-civil-265",
    lawNameAr: "القانون المدني الكويتي الصادر بالمرسوم بقانون رقم 67 لسنة 1980",
    lawNameEn: "Kuwaiti Civil Code (Decree-Law No. 67 of 1980)",
    articleNumber: "المادة 265",
    contentAr: "يجوز للمتعاقدين أن يحددا مقدماً قيمة التعويض في العقد (الشرط الجزائي). ولا يكون التعويض الاتفاقي مستحقاً إذا أثبت المدين أن الدائن لم يلحقه أي ضرر. ويجوز للقاضي أن يخفض هذا التعويض إذا أثبت المدين أن التقدير كان مبالغاً فيه بدرجة كبيرة، أو أن الالتزام الأصلي قد نفذ في جزء منه.",
    contentEn: "Contracting parties may pre-determine compensatory damages (liquidated damages / penalty clause). Agreement damages are not due if the debtor proves the creditor suffered no damage. The judge may reduce damages if the debtor proves the estimation was highly exaggerated, or if part of the original obligation was fulfilled.",
    category: "civil",
    govermentSource: "قصر العدل - محكمة التمييز الكويتية"
  },
  {
    id: "law-civil-42",
    lawNameAr: "القانون المدني الكويتي الصادر بالمرسوم بقانون رقم 67 لسنة 1980",
    lawNameEn: "Kuwaiti Civil Code (Decree-Law No. 67 of 1980)",
    articleNumber: "المادة 42",
    contentAr: "إذا كان العمل الموكل للعامل يسمح له بمعرفة علماء صاحب العمل أو الاطلاع على أسرار منشأته، جاز للطرفين الاتفاق على ألا يجوز للعامل منافسة صاحب العمل بعد انتهاء العقد. ويشترط لصحة هذا الاتفاق أن يكون العامل بالغاً سن الرشد، وأن يقتصر المنع من حيث الزمان والمكان ونوع العمل على ما هو ضروري لحماية مصالح صاحب العمل المشروعة.",
    contentEn: "If the nature of work permits the employee to know clients or secret trade operations of the employer, both parties can agree that the employee shall not compete with the employer. For validity: the employee must be of legal age, and restriction of time, space, and work must be reasonably necessary to protect legitimate employer interests.",
    category: "civil",
    govermentSource: "البوابة القانونية لوزارة العدل"
  },
  {
    id: "law-rental-20",
    lawNameAr: "قانون الإيجارات الكويتي رقم 35 لسنة 1978",
    lawNameEn: "Kuwait Rental Law No. 35 of 1978",
    articleNumber: "المادة 20",
    contentAr: "يجوز للمؤجر طلب إخلاء العين المؤجرة إذا لم يقم المستأجر بسداد الأجرة المستحقة في مواعيدها المحددة قانوناً، وذلك خلال عشرين يوماً من تاريخ استحقاق الأجرة، ما لم يقم المستأجر بسداد كامل الأجرة المتأخرة وكافة مصروفات الدعوى أمام هيئة المحكمة قبل إقفال باب المرافعة.",
    contentEn: "The landlord may request eviction of the leased unit if the tenant fails to pay rent on statutory due dates, within 20 days. Eviction is blocked if the tenant pays all arrears and court fees before hearings close.",
    category: "rental",
    govermentSource: "قاضي دائرة الإيجارات بوزارة العدل"
  },
  {
    id: "law-corporate-board",
    lawNameAr: "قانون الشركات الكويتي رقم 1 لسنة 2016 وتعديلاته",
    lawNameEn: "Kuwait Companies Law No. 1 of 2016",
    articleNumber: "المادة 120",
    contentAr: "يجب على مجلس إدارة الشركة المساهمة توجيه الدعوة لحضور اجتماع الجمعية العامة العادية السنوية بموافقة وزارة التجارة والصناعة (MOCI)، وتقديم كشف بالميزانية المعتمدة وتقرير أنصبة الأرباح، مع الالتزام بالنشر قبل الاجتماع بـ 15 يوماً على الأقل.",
    contentEn: "The Joint-Stock corporate board must issue invitations for the annual ordinary General Assembly meeting with MOCI approvals, presenting audited budgets and dividend sheets. Notices must be published at least 15 days before the meeting.",
    category: "corporate",
    govermentSource: "وزارة التجارة والصناعة (MOCI الكويت)"
  },
  {
    id: "law-proc-142",
    lawNameAr: "قانون المرافعات المدنية والتجارية الكويتي رقم 38 لسنة 1980",
    lawNameEn: "Kuwaiti Civil & Commercial Procedures Law No. 38 of 1980",
    articleNumber: "المادة 142",
    contentAr: "ميعاد الاستئناف ثلاثون يوماً في الأحكام الصادرة من المحاكم الكلية، وخمسة عشر يوماً في المواد المستعجلة، ويبدأ الميعاد من اليوم التالي لتاريخ صدور الحكم أو الإعلان به وفق الأحكام المنظمة لهذا القانون.",
    contentEn: "The appeal period is 30 days for judgments issued by circuit courts, and 15 days for urgent matter cases. The deadline starts from the day following judgment issuance or formal notification.",
    category: "civil",
    govermentSource: "محكمة الاستئناف - وزارة العدل الكويتية"
  },
  {
    id: "law-proc-152",
    lawNameAr: "قانون المرافعات المدنية والتجارية الكويتي رقم 38 لسنة 1980",
    lawNameEn: "Kuwaiti Civil & Commercial Procedures Law No. 38 of 1980",
    articleNumber: "المادة 152",
    contentAr: "لكل من الخصوم أن يطعن بالتمييز في الأحكام الصادرة من محكمة الاستئناف العليا في أحوال الخطأ في تطبيق القانون أو البطلان في الحكم أو الإجراءات. وميعاد الطعن بالتمييز ستون يوماً من تاريخ إعلان الحكم.",
    contentEn: "Parties may file a Cassation appeal against High Court of Appeal judgments on grounds of legal error or procedural invalidity. Cassation filing deadline is 60 days from judgment notification.",
    category: "civil",
    govermentSource: "محكمة التمييز الكويتية - قصر العدل"
  },
  {
    id: "law-cassation-142-2021",
    lawNameAr: "سوابق وأحكام محكمة التمييز الكويتية (الدائرة التجارية)",
    lawNameEn: "Kuwait Cassation Court Precedent (Commercial Circuit - Appeal 142/2021)",
    articleNumber: "طعن تمييز رقم 142/2021 تجاري",
    contentAr: "تخلف بيان التوصيف الدقيق لصفة الوكيل ومحل إقامته المختار في صحيفة الدعوى التجارية يترتب عليه البطلان الشكلي للصحيفة ما لم يصحح الإجراء قبل قفل المرافعة.",
    contentEn: "Failure to specify precise power of attorney status and elected domicile in commercial suit pleadings results in formal invalidity unless corrected before hearing closure.",
    category: "commercial",
    govermentSource: "مكتب المبادئ والبحوث القانونية - محكمة التمييز"
  },
  {
    id: "law-cassation-88-2022",
    lawNameAr: "سوابق وأحكام محكمة التمييز الكويتية (الدائرة العمالية)",
    lawNameEn: "Kuwait Cassation Court Precedent (Labor Circuit - Appeal 88/2022)",
    articleNumber: "طعن تمييز رقم 88/2022 عمالي",
    contentAr: "الأجر المتخذ أساساً لحساب مكافأة نهاية الخدمة يتضمن الراتب الأساسي مضافاً إليه كافة البدلات الثابتة والدورية المنتظمة التي تصرف للعامل بصفة مستمرة.",
    contentEn: "The salary used as the basis for calculating end-of-service indemnity includes basic salary plus all regular fixed allowances paid continuously to the employee.",
    category: "labor",
    govermentSource: "المكتب الفني لربط الأحكام - محكمة التمييز الكويتية"
  },
  {
    id: "law-cassation-401-2023",
    lawNameAr: "سوابق وأحكام محكمة التمييز الكويتية (دائرة الإيجارات)",
    lawNameEn: "Kuwait Cassation Court Precedent (Rental Circuit - Appeal 401/2023)",
    articleNumber: "طعن تمييز رقم 401/2023 إيجارات",
    contentAr: "عدم إعلان التكليف بالوفاء بالإيجار أصولاً للمستأجر أو عدم منح مهلة العشرين يوماً القانونية يجعل دعوى الإخلاء غير مقبولة شكلاً لانتفاء الشرط الفاسخ الضمني.",
    contentEn: "Failure to formally serve rent payment demand notice or grant statutory 20-day grace renders eviction claim inadmissible for lack of statutory prerequisite.",
    category: "rental",
    govermentSource: "دائرة الإيجارات العليا - محكمة التمييز"
  }
];
