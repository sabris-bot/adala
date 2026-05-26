import React, { useState, useMemo } from 'react';
import { 
  Printer, FileText, Download, CheckSquare, 
  Sparkles, Check, Bookmark, FileSpreadsheet, Key, Laptop, Scale
} from 'lucide-react';
import { EOS_Settlement } from '../../types';

interface EndOfServiceDocumentViewerProps {
  activeCase: EOS_Settlement;
  activeRole: 'hr' | 'legal' | 'finance' | 'gm';
  onSignOff: (updatedSignatures: any, updatedApprovals: any, comment: string) => void;
}

export const EndOfServiceDocumentViewer: React.FC<EndOfServiceDocumentViewerProps> = ({
  activeCase,
  activeRole,
  onSignOff
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('unified');
  const [userComment, setUserComment] = useState<string>('');

  // 10 Official Document Templates Catalog
  const docTemplates = [
    { id: 'unified', titleAr: 'سند التسوية العمالية والمخالصة النهائية الموحدة' },
    { id: 'clearance', titleAr: 'شهادة براءة الذمة التفصيلية ومخالصة العهد' },
    { id: 'experience', titleAr: 'شهادة خبرة وخدمة عمالية معتمدة' },
    { id: 'termination', titleAr: 'قرار إداري نهائي بإنهاء خدمة عمالية' },
    { id: 'resignation', titleAr: 'إشعار قبول استقالة الموظف رسمياً' },
    { id: 'handover', titleAr: 'محضر تصفية وجرد العهد والأنظمة العينية' },
    { id: 'receipt', titleAr: 'إقرار استلام مالي ومخالصة إبرائية مطلقة' },
    { id: 'warning', titleAr: 'إشعار عمالي وإنذار إداري بالانقطاع' },
    { id: 'financial_ledger', titleAr: 'كشف ميزان الحساب المالي التفصيلي للمستحقات' },
    { id: 'mutual_settlement', titleAr: 'اتفاقية تسوية ودية موحدة لفض النزاعات' }
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

  // Generate textual content for the 10 document types dynamically
  const documentContent = useMemo(() => {
    switch (selectedTemplate) {
      case 'clearance':
        return `شهادة براءة ذمة عمالية تفصيلية وإبراء مالي وقانوني
الرقم المرجعي للسند المعتمد: [ ${activeCase.settlementNumber || activeCase.id} ]
التاريخ الفعلي للمخالصة الصادرة: ${printDate}

بموجب حضور الإطراف المعنية بالشأن، يقرر قسم الشؤون القانونية والموارد البشرية بمكتب الوجيان وبدر العجيل للشؤون القانونية بأن الموظف المذكوب أدناه قد طهرت ذمته المالية بالمنشأة تماماً:

■ بيانات الموظف المبرومة:
  • اسم الموظف: السيد/ ${activeCase.employeeName}
  • الرقم المدني المعتمد لديه: [ ${activeCase.employeeId} ]
  • المسمى الوظيفي والصفة: ${activeCase.jobTitle || 'عضو الكادر الإداري'}
  • القسم/القطاع الفني: ${activeCase.department || 'قطاع التشغيل والمباشرة'}
  • تاريخ بدء الارتباط العقدى: ${activeCase.joiningDate || 'تاريخ التعيين المرفوع'}
  • تاريخ فك الرابطة العمالية: ${activeCase.lastWorkingDay}

■ فحص العهد والأصول العينية المُستلمة:
  - جهاز الحاسب الآلي الشخصي وملحقاته الفنية: (تم الفحص والاستلام بحالة سليمة ✔)
  - كارت المرور والدخول الذكي للأقسام والمباني: (تم الإلغاء وتسييل الصلاحيات الفورية ✔)
  - المفاتيح العينية وكافة الخزائن المرتبطة: (تم الجرد والإنجاز الكامل ✔)
  - مديونيات الكافية وسجل السلف الطويل والخصومات اللائحية: (تمت المقاصة القانونية المانعة للنزاع ✔)

وبموجب هذا، تمنح براءة الذمة هذه للموظف تمهيداً لعقد التحويل البنكي لصافي الأجر وحصاد نهاية خدمته والبالغ قدره [ ${formattedNet} د.ك ]، ولا يترتب على جهة العمل أي مطالبات مستقبلية بموجب هذا السند المعتمد.`;

      case 'experience':
        return `شهادة خدمة وخبرة عملية وقانونية معتمدة
الرقم التسلسلي الصادر: Ref-#-EXP-${activeCase.id}
تاريخ الطباعة المعتمدة: ${printDate}

يشهد مكتب الوجيان وبدر العجيل للشؤون القانونية والمحاماة بدولة الكويت بأن السيد/ ${activeCase.employeeName}، الحامل للرقم المدني [ ${activeCase.employeeId} ] وبموجب جنسيته [ ${activeCase.nationality || 'غير كويتي'} ]، قد عمل لدينا بانتظام وتفاني تام:

• المسمى الوظيفي المعتاد: ${activeCase.jobTitle || 'عضو الكادر التقني والقانوني'}
• القسم والقطاع المعين به: ${activeCase.department || 'إدارة الشؤون والتشغيل المهني'}
• فترة العمل الفعلية المسجلة: 
  من تاريخ: [ ${activeCase.joiningDate || 'تاريخ التعيين'} ]  إلى تاريخ: [ ${activeCase.lastWorkingDay} ]
• مدة الخدمة الطولية المنجزة: ${activeCase.serviceYears} سنة ، ${activeCase.serviceMonths} أشهر ، و ${activeCase.serviceDays} يوماً عمالياً.

وقد تميز الموظف خلال فترة مباشرتهم للعمل بالسلوك القانوني والمهني الراقي، والالتزام بأهداف المنشأة وقواعد لائحته الإدارية، ولم يتخلل مساره المهني أي مخالفات تشكل خروجاً عن مقتضيات الأمانة أو القانون العام. 

وقدمت له هذه الشهادة الرسمية بناءً على رغبته الشخصية لاستخدامها في تقديماتها المهنية القادمة دون أدنى مسؤولية أو التزام قانوني يقع عاتق هذا المكتب الوطني.`;

      case 'termination':
        return `قرار مبرم رسمي بإنهاء الرابطة وعقد العمل الفردي
رقم الإشعار التنفيذي: HR-DEC-${activeCase.id}
تاريخ صدور وتعميم القرار الإداري: ${printDate}

تعلن الإدارة العامة بالشركة والمدير العام التنفيذي، بعد الاطلاع على لجان قانون العمل الكويتي رقم 6 لسنة 2010 واللوائح الإدارية المبرمة، ما يلي:

أولاً: يُنهى عقد العمل الموثق مع السيد/ ${activeCase.employeeName} (الرقم المدني: ${activeCase.employeeId}) الحاصل على مسمى: ${activeCase.jobTitle || 'موظف'}، وذلك لأسباب تعود لـ:
  [ ${activeCase.terminationReason} ]

ثانياً: يعتبر تاريخ [ ${activeCase.lastWorkingDay} ] هو آخر أيام الخدمة الفعلية المباشرة والمدرجة بالكشف العمالي، ولا تجوز له ممارسة أي صفة تمثيلية للمنشأة بعد هذا التاريخ عمالياً في دولة الكويت.

ثالثاً: تقوم الدائرة المالية وشؤون الحسابات آلياً بتصفية حقوق الموظف بشكل متكامل وفقاً لقانون العمل لتسليمه صافي مخصص الاندمنتي والبالغ [ ${formattedNet} د.ك ]، بعد الخصومات المعتمدة وقيمتها الكلية [ ${formattedDeductsTotal} د.ك ].

رابعاً: يُعمم هذا القرار الإداري على كافة الفروع وقطاعات نظم المعلومات لإلغاء تراخيص الحوسبة، مع تمنيات الإدارة للموظف بالتوفيق والنجاح.`;

      case 'resignation':
        return `خطاب قبول رسمي ومسبق لطلب الاستقالة العمالية
رقم الإشارة القانوني: HR-RESIG-ACCEPT-${activeCase.id}
تاريخ التوثيق والقبول: ${printDate}

إلى السيد الزميل الموقر/ ${activeCase.employeeName}
تحية طيبة وبعد،،

بالإشارة إلى طلب الاستقالة الفردية الطوعية المقدم من طرفكم للعمل في منشأتنا والمسجل برغبتكم بموجب مواد الباب الخامس من قانون العمل الكويتي، تود الشؤون الإدارية إعلامكم بالتالي:

١. تم موافقة وقبول طلب استقالتكم رسمياً وبموجب مقتضيات المادة (53) من القانون العمالي.
٢. يعتبر تاريخ [ ${activeCase.lastWorkingDay} ] هو التاريخ الأخير لإنهاء الارتباط والمباشرة في مكاتبنا.
٣. يرجى مراجعة ممثل الدائرة القانونية والمالية لإجراء تفتيش وجرد العهد الممنوحة لاستبراء براءة الذمة.
٤. تم حوسبة مستحقات تصفية الخدمة والنسبة الخاضعة لسنوات خدمتكم البالغة (${activeCase.serviceYears} سنوات) بشكل نهائي، تمنياتنا لكم بمسارات مهنية ملؤها النجاح الباهر في مستقبلكم.`;

      case 'handover':
        return `محضر تصفية وجرد العهد العينية والأصول المؤسسية
رقم محضر الجرد التفتيشي: Ref-#-HANDOVER-${activeCase.id}
تاريخ إجراء المعاينة الفنية: ${activeCase.lastWorkingDay}

تم في هذا اليوم تشكيل لجنة تفتيش مصغرة من قطاع الموارد التقنية وشؤون الكادر لجرد وفحص العهد العينية المسلمة بعهدة الموظف السيد/ ${activeCase.employeeName}:

١. الأجهزة والوسائط التكنولوجية:
  • جهاز لابتوب الشركة: (تم التسليم ✔ • الحالة الفنية: ممتازة وخالية من الإعطاب)
  • شاحن وبطارية إضافية وحقيبة العمل الرسمية: (مستلم بالكامل ✔)

٢. الأمان والملفات وسيارات الكادر:
  • كروت ذكية وبطاقات النفاذ لبوابات الكادر وأجهزة الحوسبة: (تم سحبها وتعطيل كود الأمن ✔)
  • مفاتيح مكتبية وخزائن عينية مخصصة: (مستردة وتم فحص الأوراق السارية ✔)

٣. ملاحظات فنية قانونية إضافية:
تم قطع خط الموبايل المخصص والاستقطاع التمحيصي من الموازنة ولا يوجد أي عجز أو ذمة مالية تقع على عاتق الكوادر. وبموجب هذا الإقرار يوقع ممثل الإدارة بالاستلام الفوري للأصول.`;

      case 'receipt':
        return `إقرار استلام نقدي وبراءة ذمة مطلقة لا رجعة فيها
الرقم المرجعي القانوني: Ref-#-RECEIPT-${activeCase.id}
تاريخ الوفاء المالي الموثق بالتوقيع: ${printDate}

أقر أنا الموظف الموقع أدناه بكامل أهليتي الوجوبية العقلية وإرادتي الحرة المستقلة بما يلي:

١. أنني قد استلمت من جهة عملي [ مكتب صبري شطا والوجيان ] كافة مستحقاتي ونهاية خدمتي العمالية والراتب المتأخر وتعويض إجازاتي السنوية البالغ صافيها الرقمي: [ ${formattedNet} دينار كويتي لا غير ]، وذلك بموجب تفويض تحويل بنكي مباشر لصالح حساب الأيبان الخاص بي.

٢. أنني بموجب توقيع هذا السند، أعلن براءة طرف جهة عملي براءة تامة، مطلقة، مانعة، ولا رجعة فيها عمالياً وقانونياً أمام المحاكم والهيئات بوزارة القوى العاملة بدولة الكويت من أي علاقة عمالية سابقة أو حالية، سارية أو مستقبلية.

٣. ألتزم التزاماً كلياً بعدم تنظيم أي شكاوى، ملاحقات قضائية، نزاعات، أو دعاوى في الحاضر والمستقبل، وأن توقيع هذا المستند الموحد يعتبر مخالصة ختامية وتنازل تام عن الخلاف.`;

      case 'warning':
        return `إشعار قانوني وإنذار إداري بالانقطاع والغياب العشوائي
الرقم المرجعي للإنذار: HR-WARN-ABSENCE-${activeCase.id}
تاريخ توثيق المخالفة: ${activeCase.lastWorkingDay}

إلى السيد الموظف/ ${activeCase.employeeName}
الحائز على البطاقة المدنية رقم [ ${activeCase.employeeId} ]

يرجى إحاطتكم علماً بأن المنظومة الرقابية لتسجيل الحضور والانصراف قد رصدت انقطاعكم المتكرر عن الدوام دون إذن رسمي مسبق أو عذر مدعوم بالمستندات الطبية لما يلي:
  - عدد أيام الانقطاع والغياب غير المبررة: [ ${activeCase.absenceDays || 0} ] يوماً عمالياً.
  - قيمة الخصم المترتب على الغياب: [ ${formattedAbsence} د.ك ].

وتعتبر هذه المخالفة العمالية خروجاً عن مقتضيات المادة (42) من قانون العمل في القطاع الأهلي الكويتي، ونحيطكم علماً بأن استمراركم الغياب لأكثر من 7 أيام متصلة أو 15 يوماً منفصلة سيعرضكم للفصل الفوري التسبيبي بموجب المادة (41) مع حرمان كامل من الاندمنتي ونهاية الخدمة.`;

      case 'financial_ledger':
        return `كشف حساب وميزان دائن عمالي تفصيلي للعمليات المالية
الرقم المالي المرجعي للموازنة: Ref-#-LEDGER-${activeCase.id}
تاريخ تقرير الميزان التفصيلي: ${printDate}

بيانات كشف مخصص تصفية نهاية الخدمة والعمليات الرياضية للراتب:
اسم الموظف: السيد/ ${activeCase.employeeName}  |  الأجر الإجمالي: ${activeCase.grossSalary || 0} د.ك

١. ميزان الدائن لمدفوعات ومكتسبات الكادر (+):
  • مكافأة نهاية الخدمة التراكمية (الاندمنتي): ${formattedIndemnity} د.ك
  • تعويض تسييل كاش رصيد الإجازات (${activeCase.leaveBalanceDays || 0} يوماً): ${formattedLeave} د.ك
  • الراتب المتراصد عن الأيام الفعلية المباشرة بالشهر الأخير: ${formattedSalary} د.ك
  • بدلات، عمولات، ومخصصات إضافية ممتازة: ${formattedOther} د.ك
  • تعويض بدل مهلة الإنذار عمالياً: ${(activeCase.noticePeriodAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
  -----------------------------------------------
  » مجموع المستحقات والامتيازات الإيجابية: ${formattedDuesTotal} د.ك

٢. ميزان المقاصة والخصومات العكسية للمنشأة (-):
  • مقاصة القروض الشخصية والسلف المصرفية: ${formattedLoans} د.ك
  • خصومات غيابات غير مستندة: ${formattedAbsence} د.ك
  • خصومات في لائحة العقوبات والمجالس التأديبية: ${formattedDisciplinary} د.ك
  • استقطاع التأمينات والتقاعد الوطنية للمؤسسة: ${formattedIns} د.ك
  -----------------------------------------------
  » مجموع الاستردادات والخصومات المستبعدة: ${formattedDeductsTotal} د.ك

الصافي المالي النهائي المعد للتحويل والصرف الموثق: [ ${formattedNet} د.ك ]`;

      case 'mutual_settlement':
        return `اتفاقية تسوية ودية موحدة وعقد صلح عمالي لفض النزع
رقم الاتفاقية القضائية: HR-MUTUAL-SETTLE-${activeCase.id}
تاريخ التوثيق للصلح: ${printDate}

إنه في هذا اليوم المبرم، تم الاتفاق والصلح الرضائي الودي بين كل من:
• الطرف الأول (صاحب العمل): مكتب الشؤون القانونية والمحاماة
• الطرف الثاني (العامل): السيد/ ${activeCase.employeeName}

تمهيداً للمصالحة، وبموجب نشوء خلاف عمالي حول تصفية نهاية الخدمة وقواعد الخصم، اتفق الطرفان طوعاً وبنية حسنة على فض الخلاف حبياً خارج قاعات المحاكم كالتالي:

أولاً: يلتزم الطرف الأول بسداد مبلغ مقطوع متفق عليه وقدره [ ${formattedNet} دينار كويتي ] بموجب مخالصة الصرف المصرفي كحصاد مطلق ونهائي لكافة Dues العامل.

ثانياً: يقر الطرف الثاني الموظف بالقبول بهذا التعويض الودي وموافقته الشاملة وتنازله المطلق عن كافة الدعاوى المسجلة أمام الهيئة العامة للقوى العاملة بدولة الكويت أو المحكمة العمالية.

ثالثاً: يقر الطرفان بنقاء المباشرة وبراءة الذمة من أي متعلقات وعُهد عينية أو ممتلكات متبادلة، وتعتبر هذه الاتفاقية عقداً ملزماً ونهائياً ومخالصة تامة للحقوق طوعياً.`;

      default: // unified (A4)
        return `براءة ذمة شاملة وإقرار مخالصة عمالية نهائية موحدة
الرقم المرجعي للسند المعتمد: [ ${activeCase.settlementNumber || activeCase.id} ]
تاريخ إصدار وتوثيق السند الكلي للطباعة: ${printDate}

أولاً: بيانات كارت الهوية والتعاقد الرئيسي:
■ الطرف الأول (العامل): السيد/ ${activeCase.employeeName}
■ الرقم المدني المعتمد: [ ${activeCase.employeeId} ]
■ المسمى الوظيفي: ${activeCase.jobTitle || 'موظف بقطاع المباشرة'}  |  عقد العمل الموثق: [ ${activeCase.contractType || 'غير محدد المدة'} ]
■ القطاع العمالي: [ القطاع الأهلي / النفطي خاضع لقانون العمل الكويتي ]
■ تاريخ إبرام المباشرة للعمل: ${activeCase.joiningDate || '2022-01-01'}  |  تاريخ آخر يوم عمل فعلي في المنشأة: ${activeCase.lastWorkingDay}
■ مدة الخدمة الفعلية الإجمالية المعتمدة: ${activeCase.serviceYears} سنة ، ${activeCase.serviceMonths} أشهر ، ${activeCase.serviceDays} أيام
■ مبرر إنهاء العلاقة القانونية: [ ${activeCase.terminationReason} ]

ثانياً: ميزان العمليات المالية والخصم اللائحي:
١. ذمم المخصصات والمستحقات المكتسبة للموظف (+):
  • مكافأة نهاية الخدمة (Indemnity Gratuity): ${formattedIndemnity} د.ك
  • تعويض تسييل رصيد الإجازات السنوية المتبقية (${activeCase.leaveBalanceDays || 0} يوماً): ${formattedLeave} د.ك
  • الراتب المتراصد عن الأيام الفعلية المباشرة بالشهر الأخير: ${formattedSalary} د.ك
  • مكافآت وبدلات وعلاوات إضافية أخرى بالبيرول: ${formattedOther} د.ك
  • بدل مهلة الإنذار والإخطار عمالياً: ${(activeCase.noticePeriodAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
  -----------------------------------------------
  » إجمالي مستحقات وبدلات الكادر التراكمية: ${formattedDuesTotal} د.ك

٢. الاقتطاعات والاستحقاقات العكسية المسددة للمنشأة (-):
  • سداد ذمة القروض الشخصية وعجز السلف: ${formattedLoans} د.ك
  • الغيابات غير المستندة والانقطاعات العشوائية مادة 42: ${formattedAbsence} د.ك
  • الخصومات اللائحية والأحكام الجزئية التأديبية: ${formattedDisciplinary} د.ك
  • استقطاعات التأمينات والاشتراكات الوطنية للمؤسسة: ${formattedIns} د.ك
  -----------------------------------------------
  » إجمالي اقتطاعات وخصومات الموظف الكلية: ${formattedDeductsTotal} د.ك

الصافي المالي النهائي المعد للصرف البنكي المباشر:
» صافي غلة الحصاد المالي المعتمد للتحويل: [ ${formattedNet} دينار كويتي لا غير ]

ثالثاً: السند والتفسير القانوني طبقاً لمشرّع دولة الكويت:
بموجب سبب انتهاء العلاقة المصنف عمالياً بـ ( ${activeCase.terminationReason} )، تم موازنة المكافأة وتطبيق مواد الباب الرابع والباب الخامس من قانون العمل رقم (٦) لعام ٢٠١٠ بشأن العمل في القطاع الأهلي الكويتي والمعدلات الخاضعة لقرارات ديوان الخدمة المدنية ومؤسسة البترول الوطنية.

رابعاً: إقرار الاستلام وبراءة الذمة ومخالصة عدم نزاع عمالي:
بموجب إظهاري وتوقيعي على هذا المحضر الشامل، أقر أنا الموظف المذكور أعلاه بكامل أهليتي وإرادتي الحرة بأنني تسلمت من جهة العمل كامل مستحقاتي العمالية الناشئة عن عقد العمل، وبموجب ذلك أعلن براءة ذمة جهة عملي براءة ذمة تامة وشاملة ومطلقة ووفاءً رضائياً لا رجعة فيه من أي حق مالي أو عيني أو مطالبات مهنية سارية أو مستقبلية، متعهداً بعدم رفع أي شكاوى أو تنظيم دعاوى أمام الهيئة العامة للقوى العاملة أو لجان فض المنازعات العمالية أو جهة المحاكم القضائية المختصة بدولة الكويت.`;
    }
  }, [selectedTemplate, activeCase, printDate, formattedNet, formattedIndemnity, formattedLeave, formattedSalary, formattedOther, formattedLoans, formattedAbsence, formattedDisciplinary, formattedIns, formattedDuesTotal, formattedDeductsTotal]);

  // Handle Dynamic Digital Seal & Timestamp affixation
  const handleAffixSignatureLocal = () => {
    const updatedSignatures = { ...activeCase.signatures };
    const updatedApprovals = { ...activeCase.approvals };
    let finalStatus = activeCase.status;

    const timestampStr = `تم الاعتماد إدارياً ورقمياً وبصمة الختم القانوني بواسطة [${activeRole.toUpperCase()}] في ${new Date().toLocaleTimeString()} - ${printDate}`;

    if (activeRole === 'hr') {
      updatedSignatures.hr = `أخصائي HR معتمد: ${timestampStr}`;
      updatedApprovals.hr = 'مكتمل';
      finalStatus = 'UnderFinancialReview';
    } else if (activeRole === 'legal') {
      updatedSignatures.legal = `المستشار القانوني: ${timestampStr}`;
      updatedApprovals.legal = 'معتمد';
      finalStatus = 'LegallyApproved';
    } else if (activeRole === 'finance') {
      updatedSignatures.fin = `مدير تدقيق الحسابات: ${timestampStr}`;
      updatedApprovals.finance = 'مكتمل';
      finalStatus = 'FinanciallyApproved';
    } else if (activeRole === 'gm') {
      updatedApprovals.gm = 'معتمد';
      finalStatus = 'Completed';
    }

    onSignOff(updatedSignatures, updatedApprovals, userComment);
    setUserComment('');
  };

  // Modern Export triggers (Word Markdown & CSV Excel Ledger)
  const handleExportTextWord = () => {
    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTemplate}-document-${activeCase.employeeName.replace(/\s+/g, '_')}.txt`;
    link.click();
    alert('تم توليد وتصدير السند بصيغة نصية مطابقة لمعالجات Word بنجاح.');
  };

  const handleExportExcelLedger = () => {
    // Generates a clean comma-separated CSV ledger representational format
    const csvContent = 
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

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financial-ledger-${activeCase.employeeId}.csv`;
    link.click();
    alert('تم تصدير كشف الحساب والتحليل المالي بصيغة Excel CSV مع ترميز الملفات بنجاح.');
  };

  const handlePrintDocument = () => {
    const openW = window.open('', '_blank');
    if (openW) {
      openW.document.write(`
        <html dir="rtl">
          <head>
            <title>${docTemplates.find(t => t.id === selectedTemplate)?.titleAr} - ${activeCase.employeeName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
              body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #1e293b; line-height: 1.8; font-size: 11px; font-weight: 500;}
              .header { display: flex; justify-content: space-between; border-b: 2px solid #00796B; padding-bottom: 12px; margin-bottom: 25px; align-items: center;}
              .office-title { color: #00796B; font-size: 14px; font-weight: 900; }
              .content { white-space: pre-wrap; margin-bottom: 30px; border: 1px solid #e2e8f0; p: 20px; border-radius: 8px; background-color: #fafafa; padding: 25px; box-shadow: inset 0 0 10px rgba(0,0,0,0.02);}
              .signature-title { font-weight: 900; font-size: 11px; margin-bottom: 20px; text-decoration: underline; color: #00796B;}
              .signatures-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 15px; font-size: 9px; page-break-inside: avoid; margin-bottom: 30px;}
              .signature-box { border: 1px dashed #cbd5e1; padding: 10px; border-radius: 6px; background-color: #fff;}
              .stamp-container { display: flex; justify-content: flex-end; margin-top: 20px;}
              .stamp { border: 4px double #00796B; width: 85px; height: 85px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(10deg); color: #00796B; font-weight: 950; font-size: 8px; font-mono: true; background-color: #f0fdfa;}
              .footer { border-t: 1px dashed #cbd5e1; padding-t: 12px; margin-top: 40px; font-size: 8.5px; color: #64748b; display: flex; justify-content: space-between;}
            </style>
          </head>
          <body onload="window.print()">
            <div class="header">
              <div>
                <span class="office-title">مكتب الوجيان وبدر العجيل للشؤون القانونية والمحاماة</span>
                <div style="font-size: 8.5px; color: #64748b; margin-top: 3px;">برنامج عدالة • منظومة براءة الذمة والتصفيات العمالية الموحدة</div>
              </div>
              <div style="text-align: left; font-size: 9px;">
                <strong>الرقم المرجعي: ${activeCase.settlementNumber || activeCase.id}</strong><br/>
                تاريخ الطباعة: ${printDate}
              </div>
            </div>
            <div class="content">${documentContent}</div>
            <div class="signature-title">بصمة وتواقيع الإدارة والاعتماد الخماسي المعتمد:</div>
            <div class="signatures-grid">
              <div class="signature-box"><strong>١. الموظف المقر ببراءة الذمة:</strong><br/><br/>______________________<br/><span style="color:#94a3b8; font-size: 7px;">توقيع وبصمة إبهام العامل</span></div>
              <div class="signature-box"><strong>٢. الشؤون الإدارية والـ HR:</strong><br/><br/><span style="color:#00796B; font-weight: bold;">✔ ${activeCase.signatures?.hr ? 'مكتمل المصادقة' : 'بانتظار المراجعة'}</span></div>
              <div class="signature-box"><strong>٣. الشؤون القانونية والمستشار:</strong><br/><br/><span style="color:#3b82f6; font-weight: bold;">✔ ${activeCase.signatures?.legal ? 'معتمد ومطابق للقانون' : 'بانتظار الفحص'}</span></div>
              <div class="signature-box"><strong>٤. الرقابة والتدقيق المالي:</strong><br/><br/><span style="color:#f59e0b; font-weight: bold;">✔ ${activeCase.signatures?.fin ? 'مصروف للتحويل المصرفي' : 'بانتظار مقاصة السلف'}</span></div>
            </div>
            
            <div class="stamp-container">
              <div class="stamp">
                <span>عدالة سيستم</span>
                <span style="font-size: 6px; margin: 2px 0;">الشؤون القانونية</span>
                <span style="font-size: 6px; font-family: monospace;">Valid_Kuwait</span>
              </div>
            </div>

            <div class="footer">
              <span>* مستند رسمي منتج لآثاره القانونية ومبرم للخصومة والنزاع العمالي طبقاً لأحكام دولة الكويت.</span>
              <span>عدالة v3 • هاتف: 22448899</span>
            </div>
          </body>
        </html>
      `);
      openW.document.close();
    }
  };

  return (
    <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Tab Selectors of 10 Docs */}
      <div className="space-y-3">
        <label className="block text-xs font-black text-gray-700 dark:text-gray-300">
          اختر أحد النماذج الرسمية المتكاملة والمشروحة براءة الـ ذمة (10 نماذج وقرارات):
        </label>
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 dark:bg-slate-950/60 rounded-xl max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-800">
          {docTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${selectedTemplate === t.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.titleAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PAPER CONTAINER A4 SIMULATOR */}
      <div className="bg-gray-100/60 dark:bg-slate-950/40 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
        
        <div className="bg-white text-gray-900 p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 max-w-4xl mx-auto space-y-6 min-h-[550px] relative text-right" id="a4-printed-element">
          
          {/* LOGO & Header letters */}
          <div className="flex justify-between items-start border-b-2 border-primary pb-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-primary tracking-tight">مكتب الوجيان وبدر العجيل للشؤون القانونية والمحاماة</h3>
              <p className="text-[9px] text-gray-500 font-bold">بوابة أتمتة صياغة وصرف مستحقات المباشرة للكادر والعمل القطاع الأهلي</p>
            </div>
            <div className="text-left leading-none font-mono shrink-0">
              <span className="text-xs font-black text-[#00796B]">سند رقم: #{activeCase.settlementNumber || activeCase.id}</span>
              <p className="text-[9px] text-gray-400 font-bold mt-1.5">تاريخ التحرير: {printDate}</p>
            </div>
          </div>

          {/* Dynamic computed text of A4 */}
          <div className="font-sans leading-relaxed text-gray-800 text-[11px] font-semibold whitespace-pre-wrap leading-relaxed pr-1 pl-1">
            {documentContent}
          </div>

          {/* 5-PARTY SIGNATURE TABLE */}
          <div className="mt-8 border-t border-double border-gray-900 pt-5 space-y-3.5">
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider mb-2 leading-none">مصفوفة التوقيعات والشهادة الخماسية المعتمدة رقمياً للدراسات:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-[7.5px] text-gray-500 font-bold">
              <div className="space-y-1">
                <span className="text-gray-900 font-extrabold">١. الموظف عمالياً:</span>
                <div className="h-4 border-b border-dashed border-gray-400 w-full" />
                <p className="text-[6.5px] text-gray-400 truncate">بصمة يدوي والتحول آلي</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-900 font-extrabold">٢. الشؤون الإدارية (HR):</span>
                <p className={`font-mono text-[7px] ${activeCase.signatures?.hr ? 'text-success' : 'text-gray-450'}`}>
                  {activeCase.signatures?.hr ? `✅ ${activeCase.signatures.hr.slice(0, 35)}...` : '✖ معلق التدقيق'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-900 font-extrabold">٣. المستشار القانوني:</span>
                <p className={`font-mono text-[7px] ${activeCase.signatures?.legal ? 'text-blue-600' : 'text-gray-450'}`}>
                  {activeCase.signatures?.legal ? `✅ ${activeCase.signatures.legal.slice(0, 35)}...` : '✖ معلق الفحص'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-900 font-extrabold">٤. المراقب المالي الصرف:</span>
                <p className={`font-mono text-[7px] ${activeCase.signatures?.fin ? 'text-amber-600' : 'text-gray-450'}`}>
                  {activeCase.signatures?.fin ? `✅ ${activeCase.signatures.fin.slice(0, 35)}...` : '✖ معلق الصرف'}
                </p>
              </div>

              {/* Digital seal mockup rendering rotate */}
              <div className="flex items-center justify-center shrink-0">
                <div className="w-18 h-18 border-double border-4 border-primary/50 text-[#00796B] rounded-full flex flex-col items-center justify-center text-[6px] font-bold rotate-12 bg-emerald-50/20 select-none scale-95">
                  <span className="font-extrabold text-[8px]">الوجيان</span>
                  <span>التحقق الرقمي</span>
                  <span className="font-mono text-[5.5px]">{activeCase.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure verify tag */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-150 text-[8px] text-gray-400 font-mono font-bold">
            <span>* مستند تصفية رقمي ساري مبرم ومطابق للمادة 51, 53 من قانون تنظيم العمل الكويتي</span>
            <div className="flex items-center gap-1 bg-gray-50 px-1 py-0.5 border rounded">
              <span className="text-[7px]">VERIFIED_TOKEN_ID:</span>
              <span className="text-gray-900 text-[6.5px]">{activeCase.settlementNumber || activeCase.id}</span>
            </div>
          </div>

        </div>

        {/* CONTROLS ZONE: DIGITAL SIGN-OFF & EXPORTS */}
        <div className="bg-white dark:bg-dm-card p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3 border-gray-100 dark:border-gray-800">
            <div>
              <h5 className="font-black text-xs text-[#00796B] flex items-center gap-1 select-none">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>المصادقة الرقمية والتوقيع المباشر كـ: [ {activeRole.toUpperCase()} ]</span>
              </h5>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                اضغط لتثبيت المصادقة بصيغتها الإلكترونية في السند والورقة فورياً مع الختم المزدوج.
              </p>
            </div>
            <button
              onClick={handleAffixSignatureLocal}
              className="px-4 py-2 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
            >
              <Check className="w-4 h-4" />
              <span>إمضاء وتوثيق مستند التصفية</span>
            </button>
          </div>

          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-400">إضافة حاشية تدقيقية أو تعليق قبل التثبيت (اختياري):</span>
            <input 
              type="text"
              placeholder="مثال: تم تدقيق الرصيد ورسائل الاسترداد للعهد بنجاح..."
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
              className="w-full text-xs h-9 px-3 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-800 outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 justify-between">
            <span className="text-[10px] text-gray-400 font-bold self-center">تصدير وحفظ بمختلف الصيغ المعتمدة:</span>
            <div className="flex gap-2">
              <button
                onClick={handlePrintDocument}
                className="px-3.5 h-9 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الورقة / PDF</span>
              </button>
              <button
                onClick={handleExportTextWord}
                className="px-3.5 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Word (نصي)</span>
              </button>
              <button
                onClick={handleExportExcelLedger}
                className="px-3.5 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>تصدير Excel (كشف)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
