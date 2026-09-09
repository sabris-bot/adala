import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Gavel, Scale, FileText, CheckCircle2, Clock, 
  AlertTriangle, Shield, Calendar, Award, Building2, 
  Download, Printer, Share2, Check, ArrowRight, ChevronDown, 
  BookOpen, Info, FileCheck, Layers, Sparkles, Filter, Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  titleEn: string;
  authority: string;
  authorityEn: string;
  estimatedDays: string;
  lawArticles: string;
  lawArticlesEn: string;
  requiredDocuments: string[];
  requiredDocumentsEn: string[];
  mandatoryDeadlines: string;
  mandatoryDeadlinesEn: string;
  practicalTips: string[];
  practicalTipsEn: string[];
  checklist: { id: string; text: string; textEn: string; done: boolean }[];
}

export interface CaseCategoryRoadmap {
  id: string;
  categoryName: string;
  categoryNameEn: string;
  description: string;
  descriptionEn: string;
  iconName: string;
  color: string;
  governingLaw: string;
  governingLawEn: string;
  steps: RoadmapStep[];
}

const ROADMAP_DATA: CaseCategoryRoadmap[] = [
  {
    id: 'civil_commercial',
    categoryName: 'القضايا المدنية والتجارية',
    categoryNameEn: 'Civil & Commercial Litigation',
    description: 'دليل إجراءات التقاضي في المنازعات المدنية والتجارية طبقاً لقانون المرافعات المدنية والتجارية الكويتي (رقم 38 لسنة 1980 وتعديلاته).',
    descriptionEn: 'Procedure roadmap for Civil & Commercial disputes under Kuwait Civil Procedure Law No. 38/1980.',
    iconName: 'Scale',
    color: 'emerald',
    governingLaw: 'قانون المرافعات المدنية والتجارية رقم 38/1980',
    governingLawEn: 'Civil & Commercial Procedure Law No. 38/1980',
    steps: [
      {
        id: 'cc_1',
        stepNumber: 1,
        title: 'إعداد صحيفة الدعوى وإيداعها بقلم الكتاب',
        titleEn: 'Drafting & Registering Case Statement',
        authority: 'قلم كتاب المحكمة الكلية / البوابة الإلكترونية لوزارة العدل',
        authorityEn: 'Plenary Court Registry / MOJ E-Portal',
        estimatedDays: '1 - 3 أيام',
        lawArticles: 'المواد 45 - 48 مرافعات كويتي',
        lawArticlesEn: 'Articles 45-48 Kuwait Civil Procedure Law',
        requiredDocuments: [
          'أصل صحيفة الدعوى موقعة من محامي مقيد بالجدول الدائم',
          'صورة سند التوكيل الرسمي وتوكيل المحاماة',
          'حافظة المستندات المؤيدة للطلبات مع فهرس مسبق',
          'صور بطاقات المدعي والمدعى عليه والرقم المدني'
        ],
        requiredDocumentsEn: [
          'Original Case Petition signed by admitted lawyer',
          'Official Power of Attorney & Bar Association credentials',
          'Documentary evidence folder with index',
          'Civil IDs & Civil Numbers of all parties'
        ],
        mandatoryDeadlines: 'سداد الرسوم القضائية المقررة فور القيد لقيد الدعوى بالجدول الكلي.',
        mandatoryDeadlinesEn: 'Pay court fees immediately upon registration to obtain lawsuit number.',
        practicalTips: [
          'تأكد من مطابقة اسم المدعى عليه المذكور مع سجله لدى الهيئة العامة للمعلومات المدنية.',
          'استخدم بوابة وزارة العدل الإلكترونية (بوابة المحامين) للقيد الفوري وتجنب الازدحام.'
        ],
        practicalTipsEn: [
          'Verify defendant name with Public Authority for Civil Information (PACI).',
          'Use Kuwait MOJ Lawyers Portal for instant electronic filing.'
        ],
        checklist: [
          { id: 'c1_1', text: 'صياغة الوقائع والأسانس القانوني والطلبات الختامية', textEn: 'Draft facts, legal basis and relief sought', done: true },
          { id: 'c1_2', text: 'مراجعة التوكيل الرسمي للتأكد من صلاحية المرافعة والصلح', textEn: 'Verify Power of Attorney scope', done: true },
          { id: 'c1_3', text: 'سداد الرسوم واستلام رقم القيد والدائرة والقاعة', textEn: 'Pay court fee and receive docket number', done: false }
        ]
      },
      {
        id: 'cc_2',
        stepNumber: 2,
        title: 'إعلان الصحيفة وأمر الحضور',
        titleEn: 'Service of Process & Notification',
        authority: 'إدارة مندوبي الإعلان / تطبيق "سهل" الحكومي',
        authorityEn: 'Process Servers Dept / "Sahel" Govt App',
        estimatedDays: '5 - 10 أيام',
        lawArticles: 'المواد 5 - 12 مرافعات كويتي وتعديلاتها الإلكترونية',
        lawArticlesEn: 'Articles 5-12 Civil Procedure Law (E-Notification Amendments)',
        requiredDocuments: [
          'صور صحيفة الدعوى المعتمدة من قلم الكتاب بعدد المدعى عليهم',
          'بيانات العنوان الإلكتروني والرقم المدني لتطبيق "سهل"'
        ],
        requiredDocumentsEn: [
          'Certified copies of Petition per defendant count',
          'Electronic address & Civil ID for Sahel service'
        ],
        mandatoryDeadlines: 'وجوب تسليم أصل الإعلان المعلن للمحكمة قبل تاريخ الجلسة المحددة بـ 24 ساعة على الأقل.',
        mandatoryDeadlinesEn: 'Returned proof of service must be submitted 24h prior to hearing date.',
        practicalTips: [
          'الإعلان عبر تطبيق "سهل" الحكومي يُعتبر منتجاً لكافة آثاره القانونية فور وصول الإشعار.',
          'في حال التعذر، يلزم الانتقال للعنوان المكتبي أو السكني أو الإعلان بشرطة المنطقة.'
        ],
        practicalTipsEn: [
          'Sahel app notification holds full legal force upon delivery.',
          'If e-service fails, request physical service or police station notice.'
        ],
        checklist: [
          { id: 'c2_1', text: 'متابعة إرسال الإعلان الإلكتروني عبر الهيئة العامة للمعلومات المدنية', textEn: 'Track electronic service via PACI', done: false },
          { id: 'c2_2', text: 'استلام محضر الإعلان المؤشر عليه بالاستلام من مندوب الإعلان', textEn: 'Retrieve signed service return from Process Server', done: false }
        ]
      },
      {
        id: 'cc_3',
        stepNumber: 3,
        title: 'الجلسة الأولى والإحالة لإدارة الخبراء',
        titleEn: 'First Hearing & Expert Referral',
        authority: 'دائرة المحكمة الكلية / إدارة الخبراء بوزارة العدل',
        authorityEn: 'Plenary Court Circuit / Experts Dept',
        estimatedDays: '30 - 90 يوماً',
        lawArticles: 'المادة 69 وما بعدها من قانون الإثبات الكويتي رقم 39/1980',
        lawArticlesEn: 'Articles 69+ Kuwait Evidence Law No. 39/1980',
        requiredDocuments: [
          'مذكرة شارحة بالطلبات ومستندات الإثبات الحسابية أو الفنية',
          'صورة إيصال سداد أمانة الخبير فور صدور حكم التمهيدي'
        ],
        requiredDocumentsEn: [
          'Explanatory memorandum with financial/technical evidence',
          'Receipt of Expert Deposit fee payment'
        ],
        mandatoryDeadlines: 'سداد أمانة الخبير خلال الميعاد المحدد بالحكم التمهيدي (غالباً 14 يوماً) تجنباً لسقوط الحكم.',
        mandatoryDeadlinesEn: 'Pay Expert fee within statutory window (usually 14 days) or face forfeiture.',
        practicalTips: [
          'حضور جميع جلسات الخبير المكلف وتقديم كشف الحساب والبيانات بدقة عالية.',
          'تقديم مذكرة ملاحظات فنية فور صدور مسودة التقرير الأولي للخبير.'
        ],
        practicalTipsEn: [
          'Attend all Expert sessions with organized ledgers and audits.',
          'Submit technical notes immediately upon receiving preliminary report draft.'
        ],
        checklist: [
          { id: 'c3_1', text: 'حضور الجلسة الأولى وتأكيد صفة الوكالة وإثبات الإعلان', textEn: 'Attend 1st session & confirm appearance', done: false },
          { id: 'c3_2', text: 'سداد أمانة الخبير بوزارة العدل واستلام ملف الإحالة', textEn: 'Pay Expert Deposit & file transfer', done: false },
          { id: 'c3_3', text: 'تقديم المذكرات والمستندات لأمانة سر الخبير المختص', textEn: 'Submit defense memos to Expert Secretariat', done: false }
        ]
      },
      {
        id: 'cc_4',
        stepNumber: 4,
        title: 'التعقيب على تقرير الخبير وحجز الدعوى للحكم',
        titleEn: 'Expert Report Response & Final Pleading',
        authority: 'دائرة المحكمة الكلية المختصة',
        authorityEn: 'Competent Plenary Court Circuit',
        estimatedDays: '15 - 30 يوماً',
        lawArticles: 'المواد 115 - 120 مرافعات كويتي',
        lawArticlesEn: 'Articles 115-120 Kuwait Civil Procedure Law',
        requiredDocuments: [
          'مذكرة ختامية بالتعقيب على التقرير النهائى للخبراء',
          'المستندات الدالة على وجود عوار أو صحة ما انتهى إليه التقرير'
        ],
        requiredDocumentsEn: [
          'Final closing Memorandum reacting to Expert Report',
          'Supplementary evidence challenging or endorsing Expert findings'
        ],
        mandatoryDeadlines: 'تقديم المذكرات والختام قبل انتهاء الآجال المحددة من القاضي وحجزها للحكم.',
        mandatoryDeadlinesEn: 'Submit final briefs prior to judge\'s reservation for judgment.',
        practicalTips: [
          'ركز المذكرة الختامية على النتيجة الحسابية أو الفنية التي انتهى إليها التقرير لصالح موكلك.',
          'طلب إعادة المأمورية للخبراء في حال وجود خطأ جوهري أو اغفال دفاع رئيسي.'
        ],
        practicalTipsEn: [
          'Emphasize favorable financial conclusions in the Expert Report.',
          'Request re-referral to Expert if major errors or omitted arguments exist.'
        ],
        checklist: [
          { id: 'c4_1', text: 'سحب نسخة معتمدة من تقرير الخبير المودع بقلم الكتاب', textEn: 'Obtain certified copy of filed Expert Report', done: false },
          { id: 'c4_2', text: 'إعداد المذكرة الختامية وحجز الدعوى للحكم', textEn: 'Prepare closing brief & reserve for judgment', done: false }
        ]
      },
      {
        id: 'cc_5',
        stepNumber: 5,
        title: 'صدور الحكم واستخراج النسخة التنفيذية',
        titleEn: 'Judgment Issuance & Executory Copy',
        authority: 'منصة العدل / إدارة كتاب المحكمة الكلية',
        authorityEn: 'MOJ Portal / Plenary Court Clerks',
        estimatedDays: '3 - 7 أيام',
        lawArticles: 'المواد 124 - 128 مرافعات كويتي',
        lawArticlesEn: 'Articles 124-128 Kuwait Civil Procedure Law',
        requiredDocuments: [
          'طلب استخراج الصيغة التنفيذية ممهور بتوقيع رئيس الكتاب',
          'شهادة بعدم الحصول على استئناف في حال فوات المواعيد'
        ],
        requiredDocumentsEn: [
          'Application for Executory Order signed by Chief Clerk',
          'Certificate of Non-Appeal if statutory window elapsed'
        ],
        mandatoryDeadlines: 'حق استخراج الصيغة التنفيذية مكفول للمحكوم له فور تذييل مسودة الحكم بالإيداع.',
        mandatoryDeadlinesEn: 'Executory Formula available to winning party upon filing of judgment transcript.',
        practicalTips: [
          'مطابقة منطوق الحكم المقضي به مع صيغة التنفيذ المطبوعة لمنع أخطاء الطباعة.',
          'استخراج أرقام مدنية للحصول على منع السفر أوالضبط والتنفيذ فوراً.'
        ],
        practicalTipsEn: [
          'Verify Judgment Operative Wording matches the official seal.',
          'Prepare Civil IDs for instant execution & travel prohibition order.'
        ],
        checklist: [
          { id: 'c5_1', text: 'استلام منطوق الحكم والتأكد من شموله بالنفاذ المعجل', textEn: 'Review judgment wording & instant execution clause', done: false },
          { id: 'c5_2', text: 'استلام الصورة التنفيذية المزيلة بالصيغة الرسمية', textEn: 'Receive official Executory Sealed Judgment Copy', done: false }
        ]
      },
      {
        id: 'cc_6',
        stepNumber: 6,
        title: 'الطعن بالاستئناف (محكمة الاستئناف العليا)',
        titleEn: 'Appeal Proceeding (Court of Appeal)',
        authority: 'محكمة الاستئناف العليا - قصر العدل / مجمع المحاكم',
        authorityEn: 'Court of Appeal - Palace of Justice',
        estimatedDays: '30 يوماً (ميعاد الاستئناف)',
        lawArticles: 'المادة 129 ومابعدها مرافعات كويتي',
        lawArticlesEn: 'Article 129+ Kuwait Civil Procedure Law',
        requiredDocuments: [
          'صحيفة الطعن بالاستئناف مودعة بقلم كتاب محكمة الاستئناف',
          'صورة طبق الأصل من حكم محكمة أول درجة أسباباً ومنطوقاً'
        ],
        requiredDocumentsEn: [
          'Appeal Petition filed at Court of Appeal Registry',
          'Certified official transcript of First Instance Judgment'
        ],
        mandatoryDeadlines: 'ميعاد الاستئناف هو (30) يوماً يبدأ من تاريخ إعلان الحكم رسمياً أو صدوره بالحالات الاستثنائية (م 129).',
        mandatoryDeadlinesEn: 'Statutory Appeal Window is exactly 30 days from official service date (Art 129).',
        practicalTips: [
          'حساب مواعيد المسافة وإجازات الأعياد الرسمية بدقة طبقاً للمادتين 16 و18 مرافعات.',
          'طلب إيقاف تنفيذ الحكم الصادر من أول درجة في شق عاجل بشرط خشية وقوع ضرر جسيم.'
        ],
        practicalTipsEn: [
          'Calculate Distance & Official Holiday extensions precisely (Art 16/18).',
          'Include Urgent Request to Stay Execution if irreparable harm is expected.'
        ],
        checklist: [
          { id: 'c6_1', text: 'حساب ميعاد الـ 30 يوماً من تاريخ الإعلان الرسمي للحكم', textEn: 'Calculate 30-day window from official service date', done: false },
          { id: 'c6_2', text: 'قيد صحيفة الاستئناف ودفع كفالة الاستئناف المقررة', textEn: 'File Appeal Brief and pay Statutory Appeal Bond', done: false }
        ]
      },
      {
        id: 'cc_7',
        stepNumber: 7,
        title: 'التنفيذ الجبري وتحصيل المبالغ (إدارة التنفيذ)',
        titleEn: 'Enforcement & Monetary Execution',
        authority: 'إدارة التنفيذ الجبري بوزارة العدل (العاصمة / المحافظات)',
        authorityEn: 'General Enforcement Directorate (MOJ)',
        estimatedDays: 'مستمر حتى التحصيل',
        lawArticles: 'المادة 189 وما بعدها مرافعات كويتي (قانون التنفيذ)',
        lawArticlesEn: 'Article 189+ Kuwait Enforcement Law',
        requiredDocuments: [
          'أصل الصورة التنفيذية للحكم النهائى',
          'محضر إعلان السند التنفيذي والتكليف بالوفاء (خلال 7 أيام)'
        ],
        requiredDocumentsEn: [
          'Original Executory Judgment copy',
          'Service of Executory Instrument & 7-day Payment Demand'
        ],
        mandatoryDeadlines: 'إمهال المنفذ ضده 7 أيام من تاريخ إعلان السند التنفيذي قبل بدء إجراءات الحجز.',
        mandatoryDeadlinesEn: 'Grant debtor 7 days grace period following official execution notice before asset seizure.',
        practicalTips: [
          'إجراء الحجز على بنك الكويت المركزي وحسابات المنفذ ضده فور انقضاء مهلة الـ 7 أيام.',
          'استصدار أمر منع سفر وتوقيع الحجز على العقارات أو المركبات عبر الربط الآلي.'
        ],
        practicalTipsEn: [
          'Place execution attachment on Central Bank of Kuwait accounts immediately after 7 days.',
          'Apply for Travel Ban and vehicle/property attachments via electronic link.'
        ],
        checklist: [
          { id: 'c7_1', text: 'إعلان السند التنفيذي والتكليف بالوفاء إلكترونياً', textEn: 'Serve execution order & payment demand electronically', done: false },
          { id: 'c7_2', text: 'طلب الحجز على البنوك والسيارات والجهات الحكومية', textEn: 'Request bank attachments and asset seizures', done: false }
        ]
      }
    ]
  },
  {
    id: 'labor_cases',
    categoryName: 'القضايا والمنازعات العمالية',
    categoryNameEn: 'Labor & Employment Litigation',
    description: 'خريطة إجراءات دعاوي مستحقات ومنازعات العمل في القطاع الأهلي والنفطي وفق قانون العمل الكويتي رقم 6/2010.',
    descriptionEn: 'Procedure roadmap for employment & labor claims under Kuwait Labor Law No. 6/2010.',
    iconName: 'Briefcase',
    color: 'indigo',
    governingLaw: 'قانون العمل في القطاع الأهلي رقم 6 لسنة 2010',
    governingLawEn: 'Private Sector Labor Law No. 6/2010',
    steps: [
      {
        id: 'lb_1',
        stepNumber: 1,
        title: 'تقديم شكوى إدارية لدى هيئة القوى العاملة',
        titleEn: 'Administrative Complaint at PAM',
        authority: 'الهيئة العامة للقوى العاملة - إدارة علاقات العمل',
        authorityEn: 'Public Authority for Manpower (PAM) - Labor Relations Dept',
        estimatedDays: '7 - 14 يوماً',
        lawArticles: 'المادة 146 من قانون العمل الكويتي 6/2010',
        lawArticlesEn: 'Article 146 Kuwait Labor Law 6/2010',
        requiredDocuments: [
          'أصل وصورة عقد العمل الكويتي إلكترونياً أو ورقياً',
          'كشف حساب بنكي يثبت استلام/انقطاع الرواتب',
          'صورة إذن العمل والبطاقة المدنية وشكوى المستحقات'
        ],
        requiredDocumentsEn: [
          'Employment contract copy (physical or electronic)',
          'Bank statement showing salary transfers/non-payment',
          'Work Permit copy, Civil ID, and Itemized claim statement'
        ],
        mandatoryDeadlines: 'وجوب اللجوء لإدارة علاقات العمل كشرط شكلي جوهري قبل القضاء.',
        mandatoryDeadlinesEn: 'Mandatory administrative conciliation before court filing.',
        practicalTips: [
          'تأكيد المطالبة بجميع العناصر: نهاية الخدمة، بدل الإجازات، الرواتب المتأخرة، التعويض عن الفصل التعسفي.',
          'الاحتفاظ برقم وتسليم مذكرة الإحالة للمحكمة العمالية.'
        ],
        practicalTipsEn: [
          'Itemize all benefits: EOSB, accrued leave, salary arrears, wrongful termination indemnity.',
          'Retain official PAM referral certificate for court filing.'
        ],
        checklist: [
          { id: 'l1_1', text: 'تقديم الشكوى عبر منصة أسهل/إدارة علاقات العمل', textEn: 'Submit complaint via PAM Ashal Portal', done: true },
          { id: 'l1_2', text: 'حضور جلسة التسوية الودية واستلام مذكرة التعذر والإحالة', textEn: 'Attend settlement meeting & receive court referral memo', done: false }
        ]
      },
      {
        id: 'lb_2',
        stepNumber: 2,
        title: 'قيد الدعوى العمالية والإعفاء من الرسوم',
        titleEn: 'Filing Labor Lawsuit (Fee Exempt)',
        authority: 'المحكمة الكلية - الدائرة العمالية',
        authorityEn: 'Plenary Court - Labor Circuit',
        estimatedDays: '3 - 5 أيام',
        lawArticles: 'المادة 147 من قانون العمل الكويتي (الإعفاء من الرسوم)',
        lawArticlesEn: 'Article 147 Labor Law (Court Fee Exemption for Workers)',
        requiredDocuments: [
          'كتاب الإحالة المعتمد الصادر من الهيئة العامة للقوى العاملة',
          'صحيفة الدعوى العمالية ومذكرات المستحقات الفئوية'
        ],
        requiredDocumentsEn: [
          'PAM Official Referral Letter',
          'Labor Court Petition & detailed computation breakdown'
        ],
        mandatoryDeadlines: 'سقوط الدعوى العمالية بمضي سنة واحدة (12 شهراً) من تاريخ انتهاء عقد العمل (م 144).',
        mandatoryDeadlinesEn: 'One-year limitation period from contract termination date (Art 144).',
        practicalTips: [
          'الدعوى العمالية معفاة بحكم القانون من الرسوم القضائية في جميع درجات التقاضي بالنسبة للعامل.',
          'تقديم حاسبة مكافأة نهاية الخدمة المعتمدة لدى المحكمة.'
        ],
        practicalTipsEn: [
          'Labor claims filed by workers are legally exempt from all court fees across all stages.',
          'Attach official court-compliant EOSB calculator output.'
        ],
        checklist: [
          { id: 'l2_1', text: 'إرفاق مذكرة الإحالة مع الصحيفة قبل قيد الجلسات', textEn: 'Attach PAM referral memo to filing', done: false },
          { id: 'l2_2', text: 'التأكد من عدم مرور سنة على انتهاء عقد العمل لمنع السقوط', textEn: 'Verify claim is within 1-year limitation window', done: false }
        ]
      },
      {
        id: 'lb_3',
        stepNumber: 3,
        title: 'ندب خبير عمالي وتدقيق المستحقات والرواتب',
        titleEn: 'Labor Expert Audit & Calculation',
        authority: 'إدارة الخبراء - الدائرة العمالية المختصة',
        authorityEn: 'Experts Dept - Labor Division',
        estimatedDays: '30 - 60 يوماً',
        lawArticles: 'المادتين 51 و70 قانون العمل 6/2010',
        lawArticlesEn: 'Articles 51 & 70 Labor Law 6/2010',
        requiredDocuments: [
          'دفاتر وسجلات الحضور والانصراف بشركة المخدوم',
          'كشوف التحويلات البنكية للأجور الشاملة'
        ],
        requiredDocumentsEn: [
          'Employer attendance records & timesheets',
          'Bank statement of total salary transfers'
        ],
        mandatoryDeadlines: 'تقديم كشوف الرواتب والبدلات أمام الخبير فور تحديد الجلسة الأولى.',
        mandatoryDeadlinesEn: 'Submit salary ledgers at first expert session.',
        practicalTips: [
          'تأكيد أن مكافأة نهاية الخدمة تحسب على أساس آخر أجر شامل (شاملاً بدل السكن والمواصلات والبونص المباشر).',
          'طلب إتاحة مستندات السجل التجاري لضم الشركاء كخصوم متضامنين.'
        ],
        practicalTipsEn: [
          'Ensure EOSB is calculated on Last Gross Salary (including housing, transport & fixed bonuses).',
          'Request company registry documents to join partners as jointly liable.'
        ],
        checklist: [
          { id: 'l3_1', text: 'تقديم مذكرة الحساب الشامل لأجر العامل ومكافأته', textEn: 'Submit comprehensive gross pay calculation brief', done: false },
          { id: 'l3_2', text: 'التوقيع على محضر الخبير بالمطالبات النهائية', textEn: 'Sign expert session protocol with final claims', done: false }
        ]
      },
      {
        id: 'lb_4',
        stepNumber: 4,
        title: 'الحكم العمالي والتنفيذ المعجل لحقوق العامل',
        titleEn: 'Labor Judgment & Instant Execution',
        authority: 'دائرة المحكمة العمالية / إدارة التنفيذ',
        authorityEn: 'Labor Court Circuit / Execution Directorate',
        estimatedDays: '7 - 14 يوماً',
        lawArticles: 'المادة 191 مرافعات (النفاذ المعجل الأحكام العمالية)',
        lawArticlesEn: 'Article 191 Civil Procedure Law (Immediate Labor Execution)',
        requiredDocuments: [
          'الصورة التنفيذية للحكم العمالي المزيل بعبارة النفاذ المعجل بلا كفالة',
          'بيانات الحساب البنكي لتحويل المستحقات المحصلة'
        ],
        requiredDocumentsEn: [
          'Executory Judgment bearing Immediate Execution Order without bond',
          'Worker IBAN for automated funds transfer'
        ],
        mandatoryDeadlines: 'الأحكام العمالية بالرواتب ومكافأة نهاية الخدمة مشمولة بالنفاذ المعجل بقوة القانون.',
        mandatoryDeadlinesEn: 'Labor judgments concerning wages & EOSB are immediately executable by law.',
        practicalTips: [
          'بدء التنفيذ فور صدور الحكم دون انتظار الاستئناف لكون الحكم مشمولاً بالنفاذ المعجل.',
          'حجز السيارات والبنك المركزي فور انقضاء الـ 7 أيام بإنذار الوفاء.'
        ],
        practicalTipsEn: [
          'Commence execution immediately without awaiting appeal due to statutory instant execution clause.',
          'Execute bank & vehicle attachment upon 7-day payment demand expiry.'
        ],
        checklist: [
          { id: 'l4_1', text: 'استخراج النسخة التنفيذية المشمولة بالنفاذ المعجل', textEn: 'Obtain Executory Copy with Instant Execution Clause', done: false },
          { id: 'l4_2', text: 'قيد ملف التنفيذ وإشعار البنك المركزي لتجميد أموال الشركة', textEn: 'Open execution file & notify Central Bank', done: false }
        ]
      }
    ]
  },
  {
    id: 'family_personal',
    categoryName: 'قضايا الأحوال الشخصية والأسرة',
    categoryNameEn: 'Family & Personal Status',
    description: 'دليل دعاوي محكمة الأسرة والتركات والنفقة والحضانة والطلاق وفق قانون أحوال شخصية كويتي 51/1984 وقانون محكمة الأسرة 12/2015.',
    descriptionEn: 'Procedure roadmap for Family Court, Alimony, Child Custody & Personal Status Law No. 51/1984.',
    iconName: 'Shield',
    color: 'rose',
    governingLaw: 'قانون الأحوال الشخصية رقم 51/1984 وقانون محكمة الأسرة رقم 12/2015',
    governingLawEn: 'Personal Status Law No. 51/1984 & Family Court Law No. 12/2015',
    steps: [
      {
        id: 'fm_1',
        stepNumber: 1,
        title: 'تقديم طلب تسوية أسرية بمركز التنمية الأسرية',
        titleEn: 'Family Settlement Conciliation Filing',
        authority: 'مركز مركز تسوية المنازعات الأسرية (بكل محافظة)',
        authorityEn: 'Family Dispute Settlement Center (per Governorate)',
        estimatedDays: '14 - 21 يوماً',
        lawArticles: 'المادة 9 من قانون محكمة الأسرة رقم 12/2015',
        lawArticlesEn: 'Article 9 Family Court Law No. 12/2015',
        requiredDocuments: [
          'عقد الزواج الرسمي أصل وصورة مصدقة',
          'شهادات ميلاد الأبناء والبطاقات المدنية للطرفين',
          'بيانات الدخل والراتب للزوج/المطلق'
        ],
        requiredDocumentsEn: [
          'Official Certified Marriage Certificate',
          'Children Birth Certificates & Civil IDs',
          'Husband/Ex-spouse Income & Salary proof'
        ],
        mandatoryDeadlines: 'طلب التسوية وجوبي قبل رفع دعاوي الطلاق والنفقة وإلا قُضي بعدم قبول الدعوى.',
        mandatoryDeadlinesEn: 'Conciliation application is mandatory prior to filing divorce or alimony lawsuits.',
        practicalTips: [
          'سعي الأخصائيين الاجتماعيين للصلح الودي وتوثيق اتفاقية الحضانة والنفقة برابط تنفيذي.',
          'في حال تعذر الصلح، يتم استلام شهادة التعذر لقيد الدعوى فوراً.'
        ],
        practicalTipsEn: [
          'Social workers mediate to execute an enforceable Settlement Agreement.',
          'If settlement fails, retrieve Certificate of Non-Reconciliation for immediate filing.'
        ],
        checklist: [
          { id: 'f1_1', text: 'تقديم طلب التسوية بمجمع المحاكم المكتبي بالمحافظة', textEn: 'File conciliation request at governorate family court', done: true },
          { id: 'f1_2', text: 'استلام شهادة تعذر الصلح من مركز التسوية الأسرية', textEn: 'Obtain Non-Reconciliation Certificate', done: false }
        ]
      },
      {
        id: 'fm_2',
        stepNumber: 2,
        title: 'قيد دعوى النفقة والأجور بمحكمة الأسرة',
        titleEn: 'Filing Alimony & Maintenance Lawsuit',
        authority: 'محكمة الأسرة - الكلية بالمحافظة المختصة',
        authorityEn: 'Family Court - Plenary Division',
        estimatedDays: '15 - 30 يوماً',
        lawArticles: 'المواد 74 - 83 من قانون الأحوال الشخصية الكويتي 51/1984',
        lawArticlesEn: 'Articles 74-83 Personal Status Law No. 51/1984',
        requiredDocuments: [
          'شهادة التعذر الصادرة من مركز تسوية المنازعات',
          'صحيفة دعوى النفقات (بننسة، عدة، متعة، حضانة، مسكن، أثاث، خادمة، سيارة)'
        ],
        requiredDocumentsEn: [
          'Non-Reconciliation Certificate from Conciliation Center',
          'Alimony Petition itemizing child support, housing, maid & vehicle allowances'
        ],
        mandatoryDeadlines: 'أحكام النفقات مشمولة بالنفاذ المعجل بقوة القانون وبلا كفالة.',
        mandatoryDeadlinesEn: 'Alimony judgments carry instant statutory execution without bond.',
        practicalTips: [
          'طلب الاستعلام من المؤسسة العامة للتأمينات الاجتماعية والجهات الحكومية لمعرفة الراتب الحقيقي.',
          'المطالبة بالنفقة المؤقتة المستعجلة لحين الفصل في أصل الدعوى.'
        ],
        practicalTipsEn: [
          'Apply for official salary query from Public Institution for Social Security (PIFSS).',
          'Request urgent temporary alimony pending final verdict.'
        ],
        checklist: [
          { id: 'f2_1', text: 'استصدار أمر الاستعلام عن راتب الزوج من التأمينات والجهات', textEn: 'Issue salary query order to PIFSS & banks', done: false },
          { id: 'f2_2', text: 'تقديم الطلب العاجل بالنفقة المؤقتة في أول جلسة', textEn: 'Submit urgent temporary alimony petition at 1st hearing', done: false }
        ]
      },
      {
        id: 'fm_3',
        stepNumber: 3,
        title: 'الحكم بالنفقات واستصدار أوامر الصرف والتنفيذ',
        titleEn: 'Alimony Verdict & Automated Payout',
        authority: 'إدارة تنفيذ أحكام الأسرة / بنك الائتمان الكويتي',
        authorityEn: 'Family Execution Dept / Credit Bank',
        estimatedDays: '3 - 7 أيام',
        lawArticles: 'المادة 15 من قانون محكمة الأسرة (صندوق تأمين الأسرة)',
        lawArticlesEn: 'Article 15 Family Court Law (Family Insurance Fund)',
        requiredDocuments: [
          'الصورة التنفيذية لحكم النفقة النهائي أو المؤقت',
          'رقم الحساب البنكي (IBAN) للحاضنة لربطه بصرف النفقة الآلي'
        ],
        requiredDocumentsEn: [
          'Executory Alimony Verdict copy',
          'Custodian IBAN for automated direct monthly credit'
        ],
        mandatoryDeadlines: 'التحصيل الشهري التلقائي من راتب المدين عبر الاستقطاع المباشر من جهة العمل.',
        mandatoryDeadlinesEn: 'Automated monthly payroll deduction directly from debtor employer.',
        practicalTips: [
          'استقطاع النفقة يتم مباشرة من أعلى قائمة ديون الراتب قبل أي قروض استهلاكية.',
          'استصدار أمر منع سفر فوري وحجز مركبات في حال الامتناع عن السداد.'
        ],
        practicalTipsEn: [
          'Alimony deductions take senior priority over consumer bank loans.',
          'Apply for immediate travel ban and vehicle seizure if payments default.'
        ],
        checklist: [
          { id: 'f3_1', text: 'تسليم السند التنفيذي لإدارة تنفيذ الأسرة بوزارة العدل', textEn: 'Submit execution order to Family Execution Dept', done: false },
          { id: 'f3_2', text: 'ربط الحساب البنكي بالاستقطاع المباشر من راتب المدين', textEn: 'Set up direct salary deduction link with employer', done: false }
        ]
      }
    ]
  },
  {
    id: 'real_estate_lease',
    categoryName: 'قضايا العقارات والإيجارات',
    categoryNameEn: 'Real Estate & Lease Disputes',
    description: 'دليل منازعات الإيجارات والتخلية وسداد الأجرة في المحاكم الكويتية وفق قانون الإيجارات رقم 35/1978 وتعديلاته.',
    descriptionEn: 'Procedure roadmap for eviction & rent recovery under Kuwait Rent Law No. 35/1978.',
    iconName: 'Building2',
    color: 'amber',
    governingLaw: 'قانون في شأن إيجار العقارات رقم 35 لسنة 1978 وتعديلاته',
    governingLawEn: 'Real Estate Lease Law No. 35/1978',
    steps: [
      {
        id: 're_1',
        stepNumber: 1,
        title: 'توجيه إنذار رسمي للتخلية أو سداد المتأخرات',
        titleEn: 'Official Eviction / Rent Payment Demand Notice',
        authority: 'إدارة الإعلان القضائي / المحضرين',
        authorityEn: 'Judicial Notification Dept / Bailiffs',
        estimatedDays: '3 - 7 أيام',
        lawArticles: 'المادة 19 و20 من قانون الإيجارات الكويتي 35/1978',
        lawArticlesEn: 'Articles 19 & 20 Kuwait Rent Law No. 35/1978',
        requiredDocuments: [
          'أصل عقد الإيجار الرسمي المؤرخ والمحدد الأجرة',
          'كشف حساب المتأخرات الإيجارية والأجور غير المسددة',
          'إنذار بالوفاء أصل وصورة معتمد من المحضرين'
        ],
        requiredDocumentsEn: [
          'Original official tenancy contract specifying rent amount',
          'Statement of rent arrears and unpaid utilities',
          'Official Demand Notice certified by bailiff'
        ],
        mandatoryDeadlines: 'إمهال المستأجر 20 يوماً لسداد الأجرة المكسورة قبل إقامة دعوى الإخلاء.',
        mandatoryDeadlinesEn: 'Grant tenant 20 days notice to clear rent arrears before filing eviction suit.',
        practicalTips: [
          'التأكد من التوقيع على إعلان الإنذار لشخص المستأجر أو من يمثله قانوناً.',
          'في حال سداد الأجرة بالكامل مع المصاريف خلال الـ 20 يوماً تسقط دعوى التخلية لأول مرة.'
        ],
        practicalTipsEn: [
          'Ensure Demand Notice is served directly on tenant or legal proxy.',
          'Full payment within 20 days cures the first-time eviction cause.'
        ],
        checklist: [
          { id: 'r1_1', text: 'صياغة إنذار سداد القيمة الإيجارية وتحديد فترة الـ 20 يوماً', textEn: 'Draft 20-day Rent Demand Notice', done: true },
          { id: 'r1_2', text: 'إعلان المستأجر رسمياً وتسلم أصل الإنذار المعلن', textEn: 'Serve tenant officially & retrieve return proof', done: false }
        ]
      },
      {
        id: 're_2',
        stepNumber: 2,
        title: 'قيد دعوى الإخلاء وإلزام المستأجر بالأجرة',
        titleEn: 'Filing Eviction & Rent Recovery Lawsuit',
        authority: 'دائرة المنازعات الإيجارية بمجمع المحاكم',
        authorityEn: 'Rent Disputes Circuit at Court Complex',
        estimatedDays: '15 - 30 يوماً',
        lawArticles: 'المادة 26 من قانون الإيجارات (السرعة والنفاذ)',
        lawArticlesEn: 'Article 26 Rent Law (Urgency & Summary Procedure)',
        requiredDocuments: [
          'أصل الإنذار الرسمي المعلن بانقضاء مهلة الـ 20 يوماً',
          'صحيفة دعوى الإخلاء والمطالبة بالأجرة المتأخرة والتعويض'
        ],
        requiredDocumentsEn: [
          'Original served 20-day demand notice with elapsed proof',
          'Eviction & Rent Recovery Petition'
        ],
        mandatoryDeadlines: 'سرعة الفصل في المنازعات الإيجارية خلال جلسات متقاربة نظراً لطبيعتها المستعجلة.',
        mandatoryDeadlinesEn: 'Rent disputes are heard under expedited summary schedule.',
        practicalTips: [
          'إيداع المستأجر للأجرة بخزينة المحكمة يوجب استلام الأجرة فوراً دون المساس بالحق في الإخلاء.',
          'طلب الحكم بالتخلية فوراً وتسليم العين خالية من الشواغل.'
        ],
        practicalTipsEn: [
          'Withdraw tenant court deposits without prejudice to eviction right.',
          'Request immediate premises handover clear of occupants.'
        ],
        checklist: [
          { id: 'r2_1', text: 'قيد دعوى الإخلاء وتحديد أقرب جلسة أمام دائرة الإيجارات', textEn: 'File eviction lawsuit at Rent Circuit', done: false },
          { id: 'r2_2', text: 'المطالبة بالتعويض عن الاستغلال والأجرة لحين التخلية الفعلية', textEn: 'Claim occupational damages until actual handover', done: false }
        ]
      }
    ]
  },
  {
    id: 'criminal_misdemeanor',
    categoryName: 'القضايا الجزائية والجنح والجنايات',
    categoryNameEn: 'Criminal & Misdemeanor Proceedings',
    description: 'دليل إجراءات التحقيق والمحاكمة والطعن في قضايا الجنح والجنايات وفق قانون الإجراءات والمحاكمات الجزائية الكويتي رقم 17/1960.',
    descriptionEn: 'Procedure roadmap for criminal investigation, trial & appeals under Kuwait Criminal Procedure Code No. 17/1960.',
    iconName: 'Gavel',
    color: 'rose',
    governingLaw: 'قانون الإجراءات والمحاكمات الجزائية رقم 17/1960',
    governingLawEn: 'Criminal Procedure Code No. 17/1960',
    steps: [
      {
        id: 'cr_1',
        stepNumber: 1,
        title: 'التحقيق الابتدائي والادعاء العام',
        titleEn: 'Preliminary Investigation & Prosecution',
        authority: 'الإدارة العامة للتحقيقات (للجنح) / النيابة العامة (للجنايات)',
        authorityEn: 'General Investigation Dept (Misdemeanors) / Public Prosecution (Felonies)',
        estimatedDays: '1 - 15 يوماً',
        lawArticles: 'الموا 9 - 15 من قانون الإجراءات والجزاء الكويتي 17/1960',
        lawArticlesEn: 'Articles 9-15 Criminal Procedure Code 17/1960',
        requiredDocuments: [
          'محضر إثبات الحالة وبلاغ المخفر الرسمي',
          'التوكيل الرسمي مع حق الدفاع أمام الجهات الجزائية والنيابة العامة',
          'التقارير الطبية الأولية أو أدلة الإثبات الرقمية'
        ],
        requiredDocumentsEn: [
          'Police station report & initial complaint transcript',
          'Special Criminal Defense Power of Attorney',
          'Medical reports or digital forensics evidence'
        ],
        mandatoryDeadlines: 'وجوب تجديد الحبس الاحتياطي خلال 48 ساعة للشرطة أو 21 يوماً للنيابة.',
        mandatoryDeadlinesEn: 'Remand renewal mandatory within 48h for police or 21 days for Prosecution.',
        practicalTips: [
          'حضور المحامي جلسات تحقيق النيابة العامة والاطلاع على أقوال المتهم والمجني عليه.',
          'تقديم طلب إخلاء سبيل بكفالة مالية أو ضمان شخصي مسبب قانوناً.'
        ],
        practicalTipsEn: [
          'Lawyer presence during prosecution interrogation is statutory right.',
          'Submit reasoned petition for bail/release on financial guarantee.'
        ],
        checklist: [
          { id: 'cr1_1', text: 'الحضور مع المتهم/المجني عليه في التحقيقات الأولية', textEn: 'Attend interrogation with defendant/victim', done: true },
          { id: 'cr1_2', text: 'تقديم طلب إخلاء السبيل بكفالة أمانة أمام رئيس التحقيق', textEn: 'Apply for bail release before Chief Prosecutor', done: false }
        ]
      },
      {
        id: 'cr_2',
        stepNumber: 2,
        title: 'المحاكمة والمرافعة والطعن بالاستئناف الجزائي',
        titleEn: 'Trial, Defense Pleading & Criminal Appeal',
        authority: 'محكمة الجنح / محكمة الجنايات / محكمة الاستئناف الجزائية',
        authorityEn: 'Misdemeanor Court / Felony Court / Criminal Appeal',
        estimatedDays: '20 يوماً (ميعاد استئناف الجنح)',
        lawArticles: 'المادة 202 من قانون الإجراءات والمحاكمات الجزائية',
        lawArticlesEn: 'Article 202 Kuwait Criminal Procedure Code',
        requiredDocuments: [
          'مذكرة الدفاع بالدفع ببطلان القبض والتفتيش أو انتفاء الأركان',
          'تقرير الطعن بالاستئناف المودع بقلم كتاب المحكمة الجزائية'
        ],
        requiredDocumentsEn: [
          'Defense Brief challenging arrest validity or intent',
          'Criminal Appeal Notice filed with Court Clerk'
        ],
        mandatoryDeadlines: 'ميعاد استئناف أحكام الجنح والجنايات هو (20) يوماً حتمية من تاريخ النطق بالحكم (م 202).',
        mandatoryDeadlinesEn: 'Statutory Criminal Appeal Window is exactly 20 days from verdict delivery (Art 202).',
        practicalTips: [
          'الطعن بالاستئناف يوقف تنفيذ العقوبات المالية المقضي بها ما لم يصدر أمر بالحبس النفاذ.',
          'التقديم السريع للمعارضة في الأحكام الغيابية الجزائية خلال 7 أيام من العلم بالحكم.'
        ],
        practicalTipsEn: [
          'Filing criminal appeal stays monetary penalties unless immediate detention is ordered.',
          'File Opposition to in-absentia verdict within 7 days of notification.'
        ],
        checklist: [
          { id: 'cr2_1', text: 'قيد الاستئناف الجزائي خلال ميعاد الـ 20 يوماً الحتمي', textEn: 'File Criminal Appeal within 20-day window', done: false },
          { id: 'cr2_2', text: 'إعداد الدفاع ببطلان إجراءات التحري والضبط والتفتيش', textEn: 'Draft defense challenging search & seizure legality', done: false }
        ]
      }
    ]
  }
];

interface SmartProceduralRoadmapProps {
  initialCategoryId?: string;
  onSelectStep?: (step: RoadmapStep) => void;
}

export const SmartProceduralRoadmap: React.FC<SmartProceduralRoadmapProps> = ({
  initialCategoryId = 'civil_commercial',
  onSelectStep
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategoryId);
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customChecklists, setCustomChecklists] = useState<Record<string, boolean>>({});

  // Active Category Data
  const currentCategory = useMemo(() => {
    return ROADMAP_DATA.find(cat => cat.id === activeCategoryId) || ROADMAP_DATA[0];
  }, [activeCategoryId]);

  // Active Selected Step Data
  const activeStep = useMemo(() => {
    if (!currentCategory) return null;
    if (selectedStepId) {
      const found = currentCategory.steps.find(s => s.id === selectedStepId);
      if (found) return found;
    }
    return currentCategory.steps[0] || null;
  }, [currentCategory, selectedStepId]);

  // Filtered steps based on search
  const filteredSteps = useMemo(() => {
    if (!searchQuery.trim()) return currentCategory.steps;
    const q = searchQuery.toLowerCase();
    return currentCategory.steps.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.titleEn.toLowerCase().includes(q) ||
      s.lawArticles.toLowerCase().includes(q) ||
      s.authority.toLowerCase().includes(q)
    );
  }, [currentCategory, searchQuery]);

  // Overall Completion Stat for Active Category
  const completionPercentage = useMemo(() => {
    if (!currentCategory || currentCategory.steps.length === 0) return 0;
    let totalItems = 0;
    let doneItems = 0;

    currentCategory.steps.forEach(step => {
      step.checklist.forEach(item => {
        totalItems++;
        const isDone = customChecklists[item.id] !== undefined ? customChecklists[item.id] : item.done;
        if (isDone) doneItems++;
      });
    });

    if (totalItems === 0) return 0;
    return Math.round((doneItems / totalItems) * 100);
  }, [currentCategory, customChecklists]);

  const toggleChecklistItem = (itemId: string, defaultDone: boolean) => {
    const currentVal = customChecklists[itemId] !== undefined ? customChecklists[itemId] : defaultDone;
    setCustomChecklists(prev => ({
      ...prev,
      [itemId]: !currentVal
    }));
  };

  const handlePrintRoadmap = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      
      {/* ROADMAP HEADER BANNER */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'الدليل الإجرائي الذكي للتقاضي في الكويت' : 'Kuwait Smart Litigation Roadmap'}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white font-tajawal leading-tight">
              {isAr ? currentCategory.categoryName : currentCategory.categoryNameEn}
            </h2>

            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              {isAr ? currentCategory.description : currentCategory.descriptionEn}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <BookOpen className="w-4 h-4 text-amber-400" />
                {isAr ? currentCategory.governingLaw : currentCategory.governingLawEn}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-emerald-400">
                {currentCategory.steps.length} {isAr ? 'مراحل إجرائية متكاملة' : 'Integrated Stages'}
              </span>
            </div>
          </div>

          {/* Right Action Widgets & Progress */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0 w-full lg:w-auto">
            {/* Progress Bar Badge */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full sm:w-auto min-w-[200px]">
              <div className="flex justify-between items-center text-xs font-black mb-1.5">
                <span className="text-slate-200">{isAr ? 'إنجاز خطوات القضية' : 'Case Milestone Progress'}</span>
                <span className="text-emerald-400 font-mono text-sm font-bold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-300 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Print & Share Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintRoadmap}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'طباعة خريطة الطريق' : 'Print Roadmap'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SWITCHER TABS */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {ROADMAP_DATA.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setSelectedStepId(cat.steps[0]?.id || '');
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Compass className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-slate-950' : 'text-slate-400'}`} />
                <span>{isAr ? cat.categoryName : cat.categoryNameEn}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {cat.steps.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH & STAGE TIMELINE BAR */}
      <div className="p-6 space-y-6">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في خطوات ومواد التقاضي...' : 'Search litigation steps & laws...'}
              className="w-full ps-10 pe-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            <span>{isAr ? 'انقر على أي مرحلة لعرض المهل والمستندات والنصائح العملية' : 'Click any stage node to inspect deadlines, required docs & lawyer tips'}</span>
          </div>
        </div>

        {/* VISUAL ROADMAP TIMELINE (INTERACTIVE NODES) */}
        <div className="relative pt-4 pb-2 overflow-x-auto">
          
          {/* Connector line behind nodes */}
          <div className="hidden lg:block absolute top-1/2 start-8 end-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />

          <div className="flex items-center justify-between gap-4 min-w-[700px] relative z-10">
            {filteredSteps.map((step, index) => {
              const isSelected = activeStep?.id === step.id;
              
              // Determine check status
              let stepCheckDoneCount = 0;
              step.checklist.forEach(c => {
                const isDone = customChecklists[c.id] !== undefined ? customChecklists[c.id] : c.done;
                if (isDone) stepCheckDoneCount++;
              });
              const isFullyDone = step.checklist.length > 0 && stepCheckDoneCount === step.checklist.length;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setSelectedStepId(step.id);
                    if (onSelectStep) onSelectStep(step);
                  }}
                  className={`flex-1 flex flex-col items-center text-center group cursor-pointer transition-all duration-200 ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Circle Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-md ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 scale-110'
                      : isFullyDone
                      ? 'bg-slate-900 text-emerald-400 dark:bg-slate-800 dark:text-emerald-400 border-2 border-emerald-500'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 group-hover:border-emerald-500'
                  }`}>
                    {isFullyDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <span>{step.stepNumber}</span>
                    )}
                  </div>

                  {/* Title & Authority Label */}
                  <div className="mt-3 space-y-1">
                    <h4 className={`text-xs font-black line-clamp-1 max-w-[130px] ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {isAr ? step.title : step.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 max-w-[120px]">
                      {isAr ? step.authority : step.authorityEn}
                    </span>
                  </div>

                  {/* Time Badge */}
                  <span className="mt-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                    ⏱️ {step.estimatedDays}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAILED ACTIVE STEP PANEL */}
        {activeStep && (
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-8 bg-slate-50/80 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-right"
          >
            {/* Stage Title Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                    #{activeStep.stepNumber}
                  </span>
                  <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white font-tajawal">
                    {isAr ? activeStep.title : activeStep.titleEn}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ps-9">
                  🏛️ {isAr ? 'الجهة القضائية المختصة:' : 'Competent Authority:'} <strong className="text-slate-800 dark:text-slate-200">{isAr ? activeStep.authority : activeStep.authorityEn}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 rounded-xl text-xs font-black flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'المدة التقديرية:' : 'Est. Time:'} {activeStep.estimatedDays}</span>
                </span>
              </div>
            </div>

            {/* GRID OF DETAILS (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              
              {/* 1. Legal Articles Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAr ? 'المستند والأساس القانوني' : 'Governing Articles'}</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                  {isAr ? activeStep.lawArticles : activeStep.lawArticlesEn}
                </p>
                <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-900 dark:text-indigo-300 font-medium">
                  ⚖️ {isAr ? 'تطبيق النصوص الآمرة في قانون المرافعات والإجراءات الكويتية' : 'Mandatory provisions under Kuwait procedural codes'}
                </div>
              </div>

              {/* 2. Mandatory Deadlines Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isAr ? 'المواعيد والمهل الحتمية' : 'Mandatory Timers'}</span>
                </div>
                <p className="text-xs text-rose-950 dark:text-rose-300 font-bold leading-relaxed">
                  {isAr ? activeStep.mandatoryDeadlines : activeStep.mandatoryDeadlinesEn}
                </p>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/40 text-[10px] text-rose-700 dark:text-rose-400 font-black">
                  ⚠️ {isAr ? 'مواعيد حتمية بطلان وفوات صفة الطعن' : 'Statutory window - Failure results in forfeiture'}
                </div>
              </div>

              {/* 3. Required Documents Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FileCheck className="w-4 h-4" />
                  <span>{isAr ? 'المستندات الحتمية المطلوبة' : 'Required Documents'}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {(isAr ? activeStep.requiredDocuments : activeStep.requiredDocumentsEn).map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-black shrink-0">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Lawyer Practical Tips Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'نصائح وتوجيهات عملية للمحامي' : 'Practical Lawyer Tips'}</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {(isAr ? activeStep.practicalTips : activeStep.practicalTipsEn).map((tip, idx) => (
                    <li key={idx} className="p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 text-[11px] leading-relaxed">
                      💡 {tip}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* CHECKLIST & TASK TRACKER FOR LAWYER */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'قائمة التكليفات والمهام الإجرائية للمرحلة' : 'Procedural Action Checklist for Lawyer'}</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {isAr ? 'حفظ ديناميكي تلقائي' : 'Auto-saved local state'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeStep.checklist.map((item) => {
                  const isDone = customChecklists[item.id] !== undefined ? customChecklists[item.id] : item.done;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id, item.done)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800 text-slate-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}} // Handled by div click
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`text-xs font-bold leading-relaxed ${isDone ? 'line-through opacity-80' : ''}`}>
                        {isAr ? item.text : item.textEn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default SmartProceduralRoadmap;
