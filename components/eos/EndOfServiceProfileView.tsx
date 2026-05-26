import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, ChevronRight, FileText, CheckSquare, Sparkles, Printer, Download, Eye, Send,
    Shield, Briefcase, Landmark, AlertTriangle, FileSignature, CheckCircle2, Bot, HelpCircle,
    RotateCcw, Scale, QrCode, ClipboardCheck, ArrowLeft, Stamp, FileCheck, Layers, FileDown,
    Building, User, Award, Plus, Trash2, CheckCircle
} from 'lucide-react';
import { EOS_Settlement, TerminationReasonKuwait, ContractTypeKuwait } from '../../types';

interface ProfileProps {
    settlement: EOS_Settlement;
    onBack: () => void;
    lang: 'ar' | 'en';
}

export const EndOfServiceProfileView: React.FC<ProfileProps> = ({
    settlement,
    onBack,
    lang
}) => {
    // Tab tracking
    const [subTab, setSubTab] = useState<'financial' | 'clearance' | 'documents' | 'ai-analyst'>('financial');
    
    // Checklist state
    const [checklist, setChecklist] = useState<Array<{ id: string, labelAr: string, labelEn: string, done: boolean }>>([
        { id: '1', labelAr: "تسليم رخص الحاسوب الشخصي والهاتف والأجهزة اللوحية", labelEn: "Handover corporate laptop, phone, & devices", done: true },
        { id: '2', labelAr: "إلغاء وتجميد الحسابات وكلمات المرور المشتركة لقواعد البيانات", labelEn: "Deactivate active accounts & credentials on databases", done: true },
        { id: '3', labelAr: "إرجاع بطاقة الهوية والتراخيص الأمنية وبصمة المنشأة", labelEn: "Return ID badge, secure access keys, & parking permit", done: false },
        { id: '4', labelAr: "مراجعة الذمم والحسابات المالية والقروض والتأشيرات", labelEn: "Settle outstanding petty cash, loans, & travel visa keys", done: false },
        { id: '5', labelAr: "توقيع الموظف المباشر بالإدارة على نقل المسؤولية للمستلم الدائم", labelEn: "Acquire direct manager sign-off for task handovers documentation", done: false }
    ]);

    // Attachments state
    const [attachments, setAttachments] = useState<Array<{ name: string, date: string, size: string }>>([
        { name: "kuwait_civil_id_scan.pdf", date: "2026-05-10", size: "1.2 MB" },
        { name: "employment_contract_stamped.pdf", date: "2026-05-10", size: "2.8 MB" },
        { name: "annual_leave_outstanding_statement.pdf", date: "2026-05-11", size: "840 KB" }
    ]);
    const [newAttachName, setNewAttachName] = useState('');

    // Document Generation & Editor States
    const [activeTemplate, setActiveTemplate] = useState<string>('final_settlement');
    const [editorText, setEditorText] = useState<string>('');
    const [templateCategory, setTemplateCategory] = useState<'all' | 'resign' | 'terminate' | 'deduct' | 'release' | 'cert'>('all');
    
    // Printable styles
    const [showStampLegal, setShowStampLegal] = useState(true);
    const [showStampPaid, setShowStampPaid] = useState(false);
    const [showStampsSignatures, setShowStampsSignatures] = useState(true);
    const [showCompanyLogo, setShowCompanyLogo] = useState(true);

    // AI Chat Advisor
    const [aiQuery, setAiQuery] = useState('');
    const [aiChatLog, setAiChatLog] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
        { 
            sender: 'bot', 
            text: lang === 'ar' 
                ? 'مرحباً بك في وحدة التحليل ومطابقة الامتثال الجنائي والمدني لآدلة الكوت. لقد قمت بتحليل قيود هذا الملف تلقائياً. المجموعات المالية والمدد تقع ضمن النطاق الآمن لتعليمات الهيئة العامة للقوى العاملة. اسألني عن أية توصيات خاصة بصياغة الاتفاقية.'
                : 'Welcome to the Adala Statutory Alignment Panel. I have audited this files parameters. The financial tallies and career tenure reside in the safe tier of PAM specifications. Inquire about draft revisions.' 
        }
    ]);
    const [isAiThinking, setIsAiThinking] = useState(false);

    const isRtl = lang === 'ar';

    // 15 Comprehensive Legal and clearances templates dictionary
    const templatesRegistry = useMemo(() => {
        const salaryTotal = (settlement.basicSalary || 0) + (settlement.allowances || 0);
        
        return {
            resignation_request: {
                titleAr: "1. طلب الاستقالة الرسمي للموظف",
                titleEn: "1. Employee Resignation Request Notice",
                category: "resign",
                text: `طلب إنهاء علاقة تعاقدية بالاستقالة الاختيارية

التاريخ: ${settlement.settlementDate || "2026-05-24"}
إلى السيد / مدير الموارد البشرية والشؤون في شركة المجموعة الوطنية الكويتية الموقر،

تحية طيبة وبعد،
أنا الموقع أدناه، الواردة بياناتي طيه:
الاسم الكامل: ${settlement.employeeName}
الرقم المدني: ${settlement.employeeId || "290101509432"}
المسمى الوظيفي: ${settlement.jobTitle || "محاسب أول"}

أتقدم لسيادتكم بطلب قبول استقالتي الرسمية من العمل لدى المنشأة، واعتبار تاريخ آخر يوم عمل فعلي في المرفق هو ${settlement.lastWorkingDay}، ملتزماً بفترة الإخطار القانونية المقررة لمصلحة العمل وهي (ثلاثة أشهر)، وذلك طبقاً لنصوص المادة (44) من القانون رقم (6) لسنة 2010 بشأن العمل بالقطاع الأهلي الكويتي.

أرجو من سيادتكم توجيه القسم المالي لإعداد الحساب النهائي وصرف كافة مستحقات نهاية خدمتي وبدل الإجازات النقدية المترصدة وصرف صك براءة الذمة بعد تصفية العهد المودعة تحت تصرفي.

وتفضلوا بقبول وافر الاحترام والتقدير وبراءة ذمتي القانونية.

مقدم الطلب (التوقيع): ________________________
تاريخ تقديمه باليد: ________________________`
            },
            resignation_acceptance: {
                titleAr: "2. قرار قبول الاستقالة من الإدارة",
                titleEn: "2. Management Formal Resignation Acceptance Letter",
                category: "resign",
                text: `قرار إداري رقم (${settlement.id?.substring(0, 4).toUpperCase() || "ADMIN"}/2026) بشأن الموافقة على طلب استقالة

التاريخ: ${settlement.settlementDate || "2026-05-24"}
الموضوع: قبول الاستقالة وتحديد تاريخ الانفصال

إشارة إلى طلب الاستقالة المقدم بواسطة الموظف السيد/السيدة: ${settlement.employeeName}
الرقم المدني: ${settlement.employeeId || "290101509432"}
القسم: ${settlement.department || "القسم المالي"}

نفيدكم بأنه تقرر موافقة مجلس الإدارة وشؤون الموظفين على طلبكم المؤتلف بإنهاء الخدمة بالاستقالة. وبناءً عليه:
1. يعتبر تاريخ ${settlement.lastWorkingDay} هو اليوم الأخير لتقديم الخدمات الرسمية بالشركة.
2. يلتزم العامل بإعادة وتسليم كافة العهد والأجهزة المعهودة من المنشأة لمدير العمليات واكتساب موافقة براءة الذمة.
3. يحال هذا القرار للقسم المالي والدفاتر لإدراج صرف مكافأة نهاية الخدمة البالغة (${settlement.indemnityAmount} د.ك) بالتوافق مع المادة (53) من فصول القانون.

نتمنى لكم حياة مهنية موفقة في خطوتكم القادمة.

مدير شؤون الموظفين والامتثال (التوقيع والختم المعتمد):
________________________`
            },
            termination_notice: {
                titleAr: "3. إخطار إنهاء خدمة من رب العمل (مادة 44)",
                titleEn: "3. Notice of Termination by Employer (Art. 44)",
                category: "terminate",
                text: `إخطار إنهاء الخدمة والعقد الفردي بموجب المادة 44

التاريخ: ${settlement.settlementDate || "2026-05-24"}
إلى السيد/السيدة: ${settlement.employeeName}
الوظيفة: ${settlement.jobTitle || "محاسب أول"}

نحيطكم علماً بأن إدارة شركة المجموعة الوطنية الكويتية تقرر عدم الاستمرار في العلاقة التعاقدية المشتركة، ولذلك تقرر توجيه هذا الإخطار الرسمي لإنهاء خدماتكم التعاقدية بصفة نهائية.
- يسري هذا الإخطار اعتباراً من تاريخ تقديمه طيه، ويعتبر آخر يوم عمل لكم فعلي ومصرح به في المرفق هو ${settlement.lastWorkingDay}.
- تم الاحتفاظ بفترة الإخطار العمالية طبقاً للمادة 44 من قانون العمل الكويتي (براتب شامل) ويحق للشركة إعفاءكم من ممارسته مع دفع بدل فترة الإخطار النقدي البالغ (${settlement.noticePeriodAmount} د.ك) في تصفية الحساب.
- نرجو مراجعة الإدارة لإتمام مقاصة العهد بالتوافق مع دليل الشركة تفادياً لتعذر صرف مستحقاتكم البالغة (${settlement.netPayable} د.ك).

شاكرين لكم مساهمتكم في المنشأة.

إدارة شؤون الموظفين (ختم المنشأة):
________________________`
            },
            disciplinary_termination: {
                titleAr: "4. قرار فصل تأديبي بموجب المادة 41",
                titleEn: "4. Disciplinary Dismissal Order under Article 41",
                category: "terminate",
                text: `قرار فصل وحرمان تأديبي عمالي تحت طائلة المادة (41)

التاريخ: ${settlement.settlementDate || "2026-05-24"}
بشأن الموظف: ${settlement.employeeName}
الرقم المدني: ${settlement.employeeId || "290101509432"}

بعد مراجعة نتائج التحقيق الإداري المحرر بمعرفة قسم الامتثال والبحث القانوني، وثبوت ارتكاب العامل للمخالفة الجسيمة الجنائية وتعديه الواضح داخل المرفق:
وبموجب أحكام المادة (41) من فصول قانون العمل بالقطاع الأهلي بدولة الكويت (رقم 6 لسنة 2010)، تقرر:
1. فصل الموظف السيد: ${settlement.employeeName} فصلاً تأديبياً فورياً وحرمانه من مستحقات مكافأة نهاية خدمته السارية البالغة (${settlement.indemnityAmount} د.ك) بالكامل.
2. يقتصر استحقاق الصرف والتحويل المالي للموظف على بدل الإجازات السنوية المترصدة طبقا للمادتين (72 و76).
3. يلتزم الموظف تحت الملاحقة والجزاء بإرجاع كامل الأصول المودعة وتسليم الدفاتر والأوراق بغير تعقيد.

تعتبر قرارات قسم الامتثال نهائية وموثقة بالسجلات للقوى العاملة.

المستشار التنفيذي العام والتحقيق (توقيع وختم آدلة):
________________________`
            },
            final_settlement: {
                titleAr: "5. صحيفة براءة التدفق المالي وحساب التصفية",
                titleEn: "5. Comprehensive Final Settlement Breakdown Statement",
                category: "release",
                text: `صحيفة التصفية والحساب النهائي الشامل لشؤون الموظفين

رقم التصفية المرجعي: ${settlement.settlementNumber || "EOS-" + settlement.id?.substring(0, 5).toUpperCase()}
اسم الموظف: ${settlement.employeeName}
الرقم المدني: ${settlement.employeeId || "290101509432"}
تاريخ الالتحاق: ${settlement.joiningDate || "2019-02-12"} | آخر يوم عمل: ${settlement.lastWorkingDay}
مدة الخدمة الكلية الفعالة: ${settlement.serviceYears} سنة، ${settlement.serviceMonths} شهر، ${settlement.serviceDays} يوم

أولاً: الاستحقاقات المالية الإضافية (Earnings & Additions):
1. مكافأة تصفية نهاية الخدمة: ${settlement.indemnityAmount} د.ك
2. تعويض رصيد الإجازات النقدي المتبقي: ${settlement.leaveBalanceAmount} د.ك
3. الراتب المستحق المترصد (أيام العمل في شهر التصفية): ${settlement.accruedSalaryAmount} د.ك
4. بدل فترة الإخطار (في حال الاستحقاق): ${settlement.noticePeriodAmount} د.ك
5. علاوات وبدلات دورية ومكافآت عهد: ${settlement.otherBonuses} د.ك
إجمالي الاستحقاق المالي الإضافي: ${settlement.indemnityAmount + settlement.leaveBalanceAmount + settlement.accruedSalaryAmount + settlement.noticePeriodAmount + settlement.otherBonuses} د.ك

ثانياً: الاستقطاعات والالتزامات الصادرة (Deductions & Liabilities):
1. سلف وقروض وتسهيلات عمالية: ${settlement.loansDeduction} د.ك
2. غياب غير مصرح به وأيام خصم مباشر: ${settlement.absenceDeduction} د.ك
3. خصومات أخرى وتأمينات اجتماعية: ${settlement.otherDeductions} د.ك
إجمالي الخصومات والاقتطاعات الإدارية: ${settlement.loansDeduction + settlement.absenceDeduction + settlement.otherDeductions} د.ك

ثالثاً: الصافي النهائي المستحق للصرف والتحويل:
المبلغ النهائي المستحق (Net Payable Amount): ${settlement.netPayable} د.ك
(فقط وقدره ثلاثة آلاف وستمائة واثنان وتسعون ديناراً كويتياً وثمانمائة فلس لا غير)

المصرف المحلي والتحويل: ${settlement.notes?.includes('Bank:') ? settlement.notes.split('Bank:')[1].split('\n')[0] : "بيت التمويل الكويتي (KFH)"}
رقم الحساب الدولي (IBAN Code): ${settlement.employeeId || "KW89NBK0000000010194830129"}

القسم المالي والتدقيق الموثق (توقيع): ________________________`
            },
            gratuity_report: {
                titleAr: "6. تقرير مراجعة احتساب المكافأة القانونية",
                titleEn: "6. Gratuity Computation Audit & Calculations Report",
                category: "release",
                text: `تقرير تدقيق وتدقيق احتساب مكافأة الصفية العمالية (قانون رقم 6/2010 والنفطي 28/1969)

الموضوع: مراجعة الدقة الحسابية والاستحقاق القانوني للقوى العاملة
الاسم المختص: ${settlement.employeeName}
الراتب الأساسي الساري: ${settlement.basicSalary} د.ك
العلاوات المشتركة المستمرة المستحقة: ${settlement.allowances} د.ك
الأجر الشامل (وعاء الاحتساب الأساسي للراتب): ${salaryTotal} د.ك
القسم اليومي المعتمد للأيام: الأجر الشامل / 26 = ${Math.round((salaryTotal / 26) * 1000) / 1000} د.ك (للموظف الشهري)

سجل فترات الخدمة والمدد العينية الحسابية:
- المدة الإجمالية الخام للموظف: ${settlement.serviceYears} سنوات و ${settlement.serviceMonths} أشهر.
- أيام غياب غير مدفوع الأجر / إجازات بدون راتب مستقطعة تلقائياً: ${settlement.unpaidLeaveDays || 0} أيام.
- الأثر القانوني لخدمة الموظف:
1. السنوات الخمس الأولى: 15 يوماً لكل سنة = ${(Math.min(5, (settlement.serviceYears || 1)) * 15)} أيام مستحقة.
2. السنوات التالية للخدمة: شهراً كاملاً (30 يوماً) لكل سنة تالية = ${Math.max(0, (settlement.serviceYears || 0) - 5) * 30} أيام مستحقة.
- عامل تعديل طبيعة الانفصال والسيرة:
السبب المدرج: ${settlement.terminationReason}
معامل التعديل والخصم القانوني (استحقاق المادة 53): ${(settlement.status.includes('Approved') || settlement.netPayable > 3000) ? "100% (استحقاق كامل بنصيب سنين الخدمة)" : "ثلثي الاستحقاق للنسبة أو حرمان مؤقت"}

توصية مدقق آدلة المعتمد للالتزام العمالي بالكويت:
تم احتساب الحساب الحسابي بالامتثال لوزارة الشؤون الاجتماعية ومطابقة اللوائح الداخلية السارية بالشركة. المعاملة سليمة ومجتازة لكافة الفحوص.

تاريخ التدقيق الإداري: ${settlement.settlementDate}
إمضاء المدقق الداخلي: ________________________`
            },
            employee_acknowledgment: {
                titleAr: "7. إقرار الموظف باستلام مستحقاته وإبراء الذمة",
                titleEn: "7. Employee Liability Discharge & Settlement Receipt Form",
                category: "release",
                text: `سند إقرار بمخالصة عامة نهائية وإبراء ذمة غير قابلة للنقض

أقر أنا الموقع أدناه:
الاسم الكامل: ${settlement.employeeName}
الجنسية: ${settlement.nationality || "وافد / مقيم"}
البطاقة المدنية الكويتية: ${settlement.employeeId || "290101509432"}

بأنني استلمت من شركة المجموعة الوطنية الكبرى الكويتية كامل مستحقاتي العمالية والمالية الوديعة السارية الناتجة عن فترة عملي بموجب عقد العمل الموحد، والبالغة قيمتها براءة الصرف الفوري المقدر بـ: (${settlement.netPayable} د.ك) وذلك عبر التحويل المصرفي الموثق.
وبناءً عليه، أقر بمخالصة تامة وإبراء ذمة صريحة لرب العمل والشركة وفروعها من كافة الالتزامات والطلبات والرواتب وبدل الإجازات وساعاتها ومكافأة نهاية الخدمة، تنازلاً عاماً شاملاً لا رجعة فيه ولا يجوز لي بموجبه اللجوء لوزارة الشؤون الاجتماعية والعمل أو الهيئة العامة للقوى العاملة أو المحاكم المدنية والعمالية الكويتية لمطالبة الشركة.

توقيع الموظف المقر بالاستلام التام:
________________________
التوقيع الرقمي / بصمة الإبهام طيه: ________________________
رقم الهاتف الشخصي الموثق: ________________________`
            },
            clearance_form: {
                titleAr: "8. نموذج إخلاء الغرض وتصفية العهد والمسؤولية",
                titleEn: "8. Corporate Asset Handover & Clearance Certificate",
                category: "release",
                text: `نموذج إخلاء طرف وتصفية تسليم العهد الإدارية والفنية بالمنشأة

رقم المعاملة: C-${settlement.id?.substring(0,6).toUpperCase()}
الاسم المختص: ${settlement.employeeName} | الإدارة والعمل: ${settlement.department || "المالية"}

نشهد نحن شركة المجموعة الوطنية للمشروعات الفردية بأن الموظف المذكورة بياناته أعلاه قد أتم تسليم كافة الأصول والعهد التي كانت مخولة تحت حوزته بغير خلل وفقاً لشهادات الأقسام التثبتية التالية:

1. شؤون تكنولوجيا العمليات (IT Division): تم إرجاع لابتوب وشاحن وجهاز الاتصال وإعطاب شفرات المرور لقاعدة البيانات (مكتمل بالامتياز).
2. الشؤون الإدارية والأمنية: تم إرجاع البطاقة الأمنية وبصمة الولوج للمبنى والموقف والملف السري (مكتمل).
3. الشؤون اللوجستية والسيارات: تم تسليم دفتري عهدة الشركة وبطاقة تعبئة الوقود ومفاتيح السيارات (مكتمل).
4. القسم المالي والمحاسبة: تم سداد جميع السلف والقروض وتسوية أرصدة التوريد النقدي والعهد المؤقتة (مكتمل).

وبموجب هذه الشهادة يعتبر الموظف قد أخلى ذمته بالوفاء التام من كافة العهود وتصرح الإدارة بالصرف الفوري للمستحقات الاستكمالية.

المفوض الإداري العام شؤون التوريد والعهد:
________________________`
            },
            settlement_agreement: {
                titleAr: "9. اتفاقية التسوية والصلح العمالي لإنهاء النزاع",
                titleEn: "9. Employer-Employee Legal Settlement & Accord Release",
                category: "legal",
                text: `عقد اتفاق صلح وتراضي وتسوية عمالية لإنهاء العلاقة بصورة ودية

تم تحرير هذا العقد بالتوافق في دولة الكويت بصحيفة الشؤون والامتثال بين:
طرف أول (صاحب العمل): شركة المجموعة الوطنية الكويتية المشتركة ويمثلها المدير العام المخول.
طرف ثاني (العامل): السيد/السيدة: ${settlement.employeeName} جنسية: ${settlement.nationality || "كويتي / مقيم"}

البند الأول: تمهيد الصلح والاتفاقية
اتفق الطرفان تراضياً وبكامل الأهلية القانونية على إنهاء العقد وصرف براءات المخالصة بقيمة تسوية نهائية للصلح مبلغه الكلي المستحق ليد العامل هو (${settlement.netPayable} د.ك) لقفل أي منازعة نشأت أو ستنشأ بين الطرفين.

البند الثاني: سداد مديونيات واستقطاعات الموظف
تم إثبات اقتطاع قروض وسلف العامل البالغة (${settlement.loansDeduction} د.ك) من إجمالي استحقاقه العيني وتعتبر هذه الديون ملغاة ومسددة بموجب هذه الصحيفة ولا يترتب عليها أي ملاحقة مدنية.

البند الثالث: التنازل المتبادل وإبراء الذمتين
بمجرد التوصل بالتنسيق البنكي لتحويل الصافي المذكور بالبند الأول، يبرئ الطرف الثاني ذمة الطرف الأول إبراءً عاماً فاصلاً غير معلق على شرط من كافة الحقوق والدعاوى ويلتزم بعدم تقديم أية شكاوى أو بلاغات بالامتثال لوزارة الشؤون.

تحرر هذا العقد من نسختين بيد كل طرف نسخة للعمل والامتناع عن الدفوع.

الطرف الأول (التوقيع والختم الإداري):                   الطرف الثاني (العامل):
________________________                    ________________________`
            },
            legal_undertaking: {
                titleAr: "10. سند تعهد قانوني لالتزامات ما بعد الخدمة",
                titleEn: "10. Irrevocable Post-Employment Legal Undertaking",
                category: "legal",
                text: `سند تعهد عمالي مقيد بأحكام عدم المنافسة وسرية المعلومات

التاريخ: ${settlement.settlementDate || "2026-05-24"}
أنا الموقع أدناه السيد: ${settlement.employeeName}
الرقم المدني: ${settlement.employeeId || "290101509432"}

بمناسبة تصفية مستحقات نهاية خدمتي وصرف الصافي النهائي وتدفق براءة ذمتي، أتعهد للشركة التزاماً قطعياً بالبنود القانونية التالية:
1. سرية البيانات والأسرار الصناعية: التزم التزاماً مطلقاً بعدم إفشاء أو استخدام كافة أسرار المرفق وصياغات الاتفاقيات والزبائن وقواعد البيانات التي اطلعت عليها طيلة فترة عملي.
2. بند عدم المنافسة المهنية: التزم التزاماً جاداً ومتطابقاً بعدم العمل لدى أي كيان منافس أو تشييد نشاط مماثل لنشاط الشركة بشكل مباشر أو غير مباشر في دولة الكويت والخليج لمدة عامين من تاريخ اليوم.
3. الامتناع عن التشهير أو الإضرار بالسمعة: التزم بعدم كتابة أو نشر أو إبداء أية آراء أو طروح قد تسيء لمصالح أو سمعة المجموعة وفروعها.

ويحظر عليّ الإخلال بأي من الالتزامات أعلاه تحت طائلة غرامة تعويضية فورية متفق عليها قيمتها (15,000 د.ك) دون الحاجة للجوء لإثبات الضرر.

المقر بالتعهد والالتزام الموحد:
________________________`
            },
            salary_deduction_authorization: {
                titleAr: "11. تفويض وتوكيل معتمد بالخصم من الراتب",
                titleEn: "11. Statutory Wage & Compensation Deduction Mandate",
                category: "deduct",
                text: `تفويض قانوني وإذن خصم معتمد من راتب الخدمة وتصفية الاستحقاق

أنا الموقع أدناه الموظف: ${settlement.employeeName}
بهذا، أفوض شركة المجموعة الوطنية الكويتية تفويضاً صريحاً دائماً لا رجعة فيه بخصم واقتطاع كافة المستحقات والمديونيات والتلفيات والتعويضات من راتبي أو من مكافأة تصفية نهاية خدمتي البالغة (${settlement.indemnityAmount} د.ك).
- تفاصيل وقيمة الخصومات المعتمدة:
1. خصم الغياب غير المبرر: ${settlement.absenceDeduction} د.ك
2. أعباء الغرامات والخصومات والمخالفات العينية: ${settlement.otherDeductions} د.ك
إجمالي وعاء الاقتطاعات المشمول بالتفريض: ${settlement.absenceDeduction + settlement.otherDeductions} د.ك

أتعهد بأن هذا التفويض ممتد لالتزاماتي القانونية تجاه تسييل بدل رصيد الإجازات السنوية ولا يجوز لي الاعتراض عليه باللوائح العمالية.

توقيع الموظف المفوض بالخصم والمصادقة:
________________________`
            },
            loan_deduction_agreement: {
                titleAr: "12. اتفاقية حصر واقتطاع قروض وسلف المنشأة",
                titleEn: "12. Loan Balance Clearance & Reimbursement Accord",
                category: "deduct",
                text: `محضر حصر وتصفية السلف والقروض العمالية المستحقة والمسجلة

التاريخ: ${settlement.settlementDate || "2026-05-24"}
إشارة لسجل السلف المالية، يتضح حصر مديونية الموظف السيد: ${settlement.employeeName} بمبلغ كلي غير مسدد قدره (${settlement.loansDeduction} د.ك) كقرض شخصي مستحق لشركة المجموعة الوطنية.

تقرر تصفية المديونية بالتسوية الإدارية التالية:
1. يعتبر هذا المحضر إذناً محاسبياً رسمياً لاقتطاع وتسوية الرصيد المذكور بالكامل بقيمة (${settlement.loansDeduction} د.ك) من صافي مكافأة نهاية الخدمة المستحقة للموظف.
2. يعتبر حساب القرض مغلقاً تماماً ولا يودع بحق الموظف أي عجز مالي بالدفاتر عدا خصم الصافي الفردي.
3. يحق للموظف الحصول على صك بصلح القرض وصرف الصافي المتبقي البالغ (${settlement.netPayable} د.ك).

إمضاء المشرف المالي وشؤون سلف الكادر:
________________________`
            },
            work_completion: {
                titleAr: "13. شهادة إنجاز العمل ومغادرة المرفق",
                titleEn: "13. Work Completion & Services Handover Certificate",
                category: "cert",
                text: `شهادة إنجاز العمل وإبراء طرف ومغادرة الكادر الفردي

تاريخ الإدراج: ${settlement.settlementDate || "2026-05-24"}
نشهد نحن شركة المجموعة الوطنية للمشروعات الفردية بأن الموظف السيد: ${settlement.employeeName}
قد أتم العمل والواجبات الموكولة إليه بكفاءة تامة وانتهت خدماته بسلام وتراضٍ من الإدارة وتاريخ إنهاء الخدمة الفعلي هو ${settlement.lastWorkingDay}.

وقد تم تصفية ملفات شؤون الموظفين وتسليم المهام والمشاريع المسؤولة من جانبه، وبذلك تشهد الإدارة بالثناء التام وحسن السلوك والأداء الممتاز الذي تحلى به الموظف خلال مدته الوظيفية البالغة ${settlement.serviceYears} سنة و ${settlement.serviceMonths} شهر.

وجهت هذه الشهادة ليد الموظف لتقديمها لمن يهمه الأمر دون أدنى التزام أو عبء مالي على المنشأة والمساهمين.

إدارة الموارد الوظيفية والامتثال:
________________________`
            },
            experience_certificate: {
                titleAr: "14. شهادة الخبرة المهنية وسيرة الكادر بالكويت",
                titleEn: "14. Official Professional Experience Letter Certificate",
                category: "cert",
                text: `شهادة خبرة وكفاءة مهنية موثقة بسجلات شركة آدلة آدمن

تاريخ صدور السند: ${settlement.settlementDate || "2026-05-24"}
مستند رسمي صادر للأهمية والاعتماد،
نفيد ونشهد نحن شركة المجموعة الوطنية الكويتية المشتركة بأن السيد / السيد: ${settlement.employeeName}
الجنسية الكريمة: ${settlement.nationality || "وافد / كويتي"}
قد اشتغل بالشركة في وظيفة: ${settlement.jobTitle || "محاسب أول"}
وذلك طيلة مدة الخدمة الفعلية المتعاقدة:
بدءاً من تاريخ الالتحاق والمباشرة: ${settlement.joiningDate || "2019-02-12"}
وحتى تاريخ الانفصال والانتهاء التام: ${settlement.lastWorkingDay}

وكان طوال مدته الوظيفية مخلصاً لعمله، كفؤاً بتنفيذ واجبه، متميزاً بأخلاقه ونضجه الإداري ومساهمته بنهضة أعمال الإدارة ومشاريع السلسلة.

وقد منحت هذه الشهادة بطلب من الموظف لتقديمها لجهات الاستقطاب والتوظيف الرسمية بغير مسؤولية أو التزام على عاتق الشركة.

شؤون التوظيف وشفرات الموارد البشرية:
________________________`
            },
            payout_release: {
                titleAr: "15. سند تسريح ومخالصة ختامي لصيغة الدفع",
                titleEn: "15. Final releases & Payout Release settlement waiver",
                category: "release",
                text: `محضر تصفية مخالصة وصرف مستحقات تحويل بنكي قطعي

الموضوع: محضر رسمي ومخالصة عمالية نهائية
المسؤولة: شركة المجموعة الوطنية الكويتية
المستلم: السيد الحسابي: ${settlement.employeeName}

يشهد الممثل المالي للشركة باتخاذ الإجراء الفوري وصرف الحوالة المالية المقررة لتصفية حساب نهاية الخدمة بالتعيين السلمي:
مستحق صرف حوالة البنك المحولة: (${settlement.netPayable} د.ك)
المصرف المحيل: بيت التمويل الكويتي (KFH)
رقم الحوالة المرجعي: K-FT-${settlement.id?.substring(0,6).toUpperCase()}

بناءً على هذا التحويل، يتبادل الطرفان إبراء طرف شامل ويفسخ عقد العمل الموحد بصفة ترتب الصلح العام وقفل السجلات والمحاضر العمالية تماماً. يعتبر هذا السند إقراراً بالاستلام بمجرد قيد المعاملة بحساب الموظف.

توقيع واعتماد مدير إدارة الماليات:
________________________`
            }
        };
    }, [settlement, lang]);

    // Track active text when active template shifts
    useEffect(() => {
        if (templatesRegistry[activeTemplate as keyof typeof templatesRegistry]) {
            setEditorText(templatesRegistry[activeTemplate as keyof typeof templatesRegistry].text);
        }
    }, [activeTemplate, templatesRegistry]);

    // Handle template reset
    const handleResetTemplate = () => {
        if (templatesRegistry[activeTemplate as keyof typeof templatesRegistry]) {
            setEditorText(templatesRegistry[activeTemplate as keyof typeof templatesRegistry].text);
        }
    };

    // Filter templates
    const filteredTemplatesKeys = useMemo(() => {
        return Object.keys(templatesRegistry).filter(key => {
            const current = templatesRegistry[key as keyof typeof templatesRegistry];
            if (templateCategory === 'all') return true;
            return current.category === templateCategory;
        });
    }, [templatesRegistry, templateCategory]);

    // Live AI compliance recommendations simulation inside the dossier profile
    const dossierDeductionRatio = useMemo(() => {
        const totalAdditions = (settlement.indemnityAmount || 0) + (settlement.leaveBalanceAmount || 0) + (settlement.accruedSalaryAmount || 0) + (settlement.noticePeriodAmount || 0) + (settlement.otherBonuses || 0);
        const totalDeductions = (settlement.loansDeduction || 0) + (settlement.absenceDeduction || 0) + (settlement.otherDeductions || 0);
        
        if (totalAdditions === 0) return 0;
        return (totalDeductions / totalAdditions) * 100;
    }, [settlement]);

    const handleSendAdvisorQuery = () => {
        if (!aiQuery.trim()) return;
        
        const q = aiQuery;
        setAiChatLog(prev => [...prev, { sender: 'user', text: q }]);
        setAiQuery('');
        setIsAiThinking(true);

        setTimeout(() => {
            let res = '';
            const msg = q.toLowerCase();

            if (msg.includes('خصم') || msg.includes('deduction') || msg.includes('قرض')) {
                res = lang === 'ar'
                    ? `مستشار الامتثال القانوني لآدلة الكويتي:
- تحت هذا الملف، تبلغ نسبة الاستقطاعات والمديونية حوالي ${dossierDeductionRatio.toFixed(1)}% من مجموع الاستحقاقات الإجمالية.
- تنبيه قانوني هام: تنص اللوائح على حظر حجز أو استقطاع أكثر من 10% من أجر العامل أو مكافأته لسداد القروض إلا بموافقة كتابية موقعة ومعتمدة.
- توصية آدلة: قم فوراً بتحميل نموذج "تفويض وتوكيل معتمد بالخصم من الراتب" أو "اتفاقية قروض المنشأة" وحث الموظف على التوقيع الرقمي عليها طيه لتجنب الطعن ببطلان الخصم.`
                    : `Adala Compliance Advisor Review:
- In this specific file, deductions total ${dossierDeductionRatio.toFixed(1)}% of gross entitlements.
- Statutory Critical Guard: Kuwait laws restrict deductions to a maximum of 10% of remunerations for loans repayments without written employee consent.
- Action Needed: Generate and execute the "Statutory Wage Deduction Mandate" using our documents tab, and obtain the digital signature to secure corporate compliance.`;
            } else if (msg.includes('إرسال') || msg.includes('تحويل') || msg.includes('iban')) {
                res = lang === 'ar'
                    ? `شؤون التدفق المالي بالدولة:
- رقم الآيبان المدخل هو (${settlement.employeeId || "KW89NBK..."}) والمصرف المحال إليه هو بيت التمويل الكويتي (KFH).
- ننصح بالاقتران بنظام "حماية الأجور" المعتمد بالبنوك المحلية المبرمج مسبقاً طيه. تم رصد هيكل براءة الذمة كخالٍ من النزاع.`
                    : `State Financial Routing:
- The IBAN is configured. Disbursement must be channeled under "Workforce Wage Protection" directly. The record is clear and safe for immediate banking release.`;
            } else {
                res = lang === 'ar'
                    ? `بناءً على مراجعة المعايير العمالية لهذا الحساب: الموظف ${settlement.employeeName} ذو خدمة تعادل ${settlement.serviceYears} سنة تحت قطاع العمل السائد. ننصح بإدراج وثيقة "شهادة الخبرة المهنية" و "إقرار الموظف بالمخالصة" كجزء من حزمة الخروج القانونية الموحدة لضمان الأمان والالتزام.`
                    : `Based on the parameters: Employee ${settlement.employeeName} carrying ${settlement.serviceYears} years career longevity under Kuwait codes. We recommend binding the "Professional Experience letter" and the "Employee Liability Discharge" to safeguard against post-employment disputes.`;
            }

            setAiChatLog(prev => [...prev, { sender: 'bot', text: res }]);
            setIsAiThinking(false);
        }, 1200);
    };

    // Simulated actions
    const handleTriggerPrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* RETURNING COMPACT PROFILE HEADER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xxs">
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        id="btn-back-to-registry"
                        className="w-10 h-10 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 rounded-xl text-slate-600 dark:text-slate-350 flex items-center justify-center transition-all cursor-pointer ring-1 ring-slate-100 dark:ring-slate-800"
                    >
                        {isRtl ? <ChevronRight className="w-5 h-5"/> : <ChevronLeft className="w-5 h-5"/>}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] font-black">
                                {isRtl ? "ملف الموظف وحساب التصفية الشامل" : "Personnel Settlement Profile View"}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 font-mono">#{settlement.settlementNumber || "EOS-" + settlement.id?.substring(0, 5).toUpperCase()}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2 flex items-center gap-1.5">
                            <User className="w-5 h-5 text-slate-400" />
                            {settlement.employeeName}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setSubTab('documents')}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                        <FileSignature className="w-4 h-4" />
                        <span>{isRtl ? "صياغة الاتفاقيات" : "Generate Agreements Studio"}</span>
                    </button>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        {isRtl ? "رجوع للسجل" : "Back to Directory"}
                    </button>
                </div>
            </div>

            {/* SUBOBJECTS INTERACTIVE TABS */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 dark:border-slate-800">
                {[
                    { id: 'financial', label: isRtl ? "التسوية والمستحقات الأجرية" : "Detailed Financial Accruals", icon: Landmark },
                    { id: 'clearance', label: isRtl ? "براءة الذمة العينية والعهد" : "Corporate Asset clearance Check", icon: ClipboardCheck },
                    { id: 'documents', label: isRtl ? "صناعة وصياغة الوثائق (15 نموذجاً)" : "Interactive Documentation Studio", icon: FileText },
                    { id: 'ai-analyst', label: isRtl ? "التدقيق ومطابقة الامتثال الموحد (AI)" : "Statutory Adala AI Auditor", icon: Sparkles }
                ].map(tab => {
                    const Icon = tab.icon;
                    const active = subTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id as any)}
                            className={`h-11 px-5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${active ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xxs' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* MAIN CONTAINER RENDER PORTS */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={subTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.12 }}
                    >

                        {/* SUBTAB 1: FINANCIAL ACCOUNTS DETAILS WITH LAW REFS */}
                        {subTab === 'financial' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* DETAILED ACCOUNTING TABLE */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
                                    <div className="border-b pb-4 border-slate-50 dark:border-slate-800">
                                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                            <Landmark className="w-5 h-5 text-indigo-650" />
                                            {isRtl ? "تفصيل الأرصدة والتدفقات المالية المستحقة" : "Comprehensive Settlement Accruals Accounting Ledger"}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-bold mt-1">
                                            {isRtl ? "بيانات وعاء الأجر الشامل ومكافأة نهاية الخدمة، مع الخصومات والديون الصادرة للتصفية" : "Verified entries specifying basic and gross allowances paired with personal or payroll debits."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">{isRtl ? "الأجر الأساسي الشرياني" : "Declared Basic Salary"}</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{new Intl.NumberFormat(lang === 'ar' ? 'ar-KW' : 'en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(settlement.basicSalary)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">{isRtl ? "البدلات الدورية والمستمرة" : "Declared Continuous Allowances"}</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{new Intl.NumberFormat(lang === 'ar' ? 'ar-KW' : 'en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(settlement.allowances || 0)}</p>
                                        </div>
                                    </div>

                                    {/* STRUCTURED CALCULATION ENTRIES ROW BY ROW */}
                                    <div className="space-y-4">
                                        <h5 className="font-extrabold text-[11px] uppercase text-slate-400 tracking-wider">
                                            {isRtl ? "أولاً: الاستحقاقات والإضافات الأجرية المستحقة" : "First: Earned Additions & Compensations"}
                                        </h5>

                                        <div className="space-y-2">
                                            {[
                                                { label: isRtl ? "مكافأة تصفية نهاية الخدمة المتراصنة" : "End-of-Service Indemnity Compensation", val: settlement.indemnityAmount, law: "المادة 51 & 53", style: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20" },
                                                { label: isRtl ? "تعويض رصيد الإجازات السنوية النقدية" : "Annual Leaves Liquidation Compensating Package", val: settlement.leaveBalanceAmount, law: "المادة 72 & 76", style: "text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-850" },
                                                { label: isRtl ? "الأجر المترصد عن أيام العمل الفعلية بشهر التصفية" : "Prorated Accrued Final Month Salary", val: settlement.accruedSalaryAmount || 0, law: "المادة الأجرية للعمل", style: "text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-850" },
                                                { label: isRtl ? "بدل فترة الإخطار (النقص أو عدم المنح للإنذار)" : "Written Notice Period compensation Damages", val: settlement.noticePeriodAmount || 0, law: "المادة 44", style: "text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-850" },
                                                { label: isRtl ? "مكافآت عهد وعلاوات استثنائية وأداء" : "Auxiliary Performance Bonuses & Credits", val: settlement.otherBonuses || 0, law: "لائحة المنشأة", style: "text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-850" }
                                            ].map((item, idx) => (
                                                <div key={idx} className={`p-4 rounded-xl flex justify-between items-center ${item.style}`}>
                                                    <div>
                                                        <p className="font-extrabold text-xs">{item.label}</p>
                                                        <span className="text-[10px] text-slate-400 font-bold mt-1 block">{isRtl ? "المستند التشريعي:" : "Legal clause basis:"} {item.law}</span>
                                                    </div>
                                                    <span className="font-black text-xs">{new Intl.NumberFormat(lang === 'ar' ? 'ar-KW' : 'en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(item.val || 0)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <h5 className="font-extrabold text-[11px] uppercase text-slate-400 tracking-wider pt-3">
                                            {isRtl ? "ثانياً: الاقتطاعات والاستقطاعات الصادرة (الديون)" : "Second: Subtracted Liabilities & Corporate Deductions"}
                                        </h5>

                                        <div className="space-y-2">
                                            {[
                                                { label: isRtl ? "سلف وقروض عمالية شخصية" : "Outstanding Personal Advances & Loans Cleared", val: settlement.loansDeduction || 0, law: "سجل السلف", style: "text-rose-650 dark:text-rose-300 bg-rose-50/10 dark:bg-rose-950/10" },
                                                { label: isRtl ? "أيام غياب تخصم من شهر تصفية الخدمة" : "Unexcused AbsenteeismDirect Salary Deductions", val: settlement.absenceDeduction || 0, law: "لائحة المحاسبات الكودية", style: "text-rose-650 dark:text-rose-300 bg-rose-50/10 dark:bg-rose-950/10" },
                                                { label: isRtl ? "استقطاعات أخرى وتأمينات اجتماعية (PIFSS)" : "Kuwait Pension Fund Contributions (PIFSS) / Fines", val: settlement.otherDeductions || 0, law: "قانون التأمينات الشاملة", style: "text-rose-650 dark:text-rose-300 bg-rose-50/10 dark:bg-rose-950/10" }
                                            ].map((item, idx) => (
                                                <div key={idx} className={`p-4 rounded-xl flex justify-between items-center ${item.style}`}>
                                                    <div>
                                                        <p className="font-extrabold text-xs">{item.label}</p>
                                                        <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold mt-1 block">{isRtl ? "المستند التشريعي:" : "Clause baseline:"} {item.law}</span>
                                                    </div>
                                                    <span className="font-black text-xs">-{new Intl.NumberFormat(lang === 'ar' ? 'ar-KW' : 'en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(item.val || 0)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                {/* SIDEBAR: SUMMARY LEDGER AND FILES ATTACHMENTS */}
                                <div className="space-y-6">
                                    
                                    {/* COMPACT GOLD STAT OUTLAY */}
                                    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-950 shadow-lg space-y-4">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                            {isRtl ? "مجموع صافي التدفق المالي المستحق للموظف" : "Final Liquid Net Payable to Employee"}
                                        </p>
                                        <p className="text-3xl font-black text-emerald-400">
                                            {new Intl.NumberFormat(lang === 'ar' ? 'ar-KW' : 'en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(settlement.netPayable)}
                                        </p>
                                        <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 font-bold leading-relaxed space-y-1">
                                            <p>{isRtl ? "المصرف التحويلي المبرمج:" : "Direct bank channel routing:"} <span className="text-white font-extrabold">{settlement.notes?.includes('Bank:') ? settlement.notes.split('Bank:')[1].split('\n')[0] : "بيت التمويل الكويتي (KFH)"}</span></p>
                                            <p className="truncate">{isRtl ? "الحساب الدولي (IBAN):" : "IBAN Code:"} <span className="font-mono text-white text-[9px]">{settlement.notes?.includes('IBAN:') ? settlement.notes.split('IBAN:')[1].split('\n')[0] : "KW89NBK0000000010194830129"}</span></p>
                                        </div>
                                        <div className="pt-2">
                                            <button 
                                                onClick={() => setSubTab('documents')}
                                                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <Printer className="w-4 h-4" />
                                                <span>{isRtl ? "رسم الوثائق والطباعة" : "Render & Print Documents"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* ATTACHMENTS SYSTEM */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-indigo-500" />
                                            {isRtl ? "ملف المستندات والمرفقات السوية" : "Dossier Secure Attachments Vault"}
                                        </h4>
                                        
                                        <div className="space-y-2">
                                            {attachments.map((file, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex justify-between items-center text-[11px] font-bold">
                                                    <div className="truncate pr-2">
                                                        <span className="text-slate-800 dark:text-slate-200 block truncate">{file.name}</span>
                                                        <span className="text-[9px] text-slate-400 block mt-0.5">{file.date} | {file.size}</span>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        <button 
                                                            onClick={() => alert(`Reviewing: ${file.name}`)}
                                                            className="w-7 h-7 bg-white dark:bg-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-650 flex items-center justify-center border border-transparent hover:border-indigo-100"
                                                        >
                                                            <Eye className="w-3" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                            className="w-7 h-7 bg-white dark:bg-slate-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-650 flex items-center justify-center"
                                                        >
                                                            <Trash2 className="w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 border-t pt-3 border-slate-50 dark:border-slate-800">
                                            <input 
                                                type="text" 
                                                className="flex-1 h-9 px-3 bg-slate-50 dark:bg-slate-850 border-none rounded-lg text-[10px] font-bold text-slate-800 dark:text-white"
                                                placeholder={isRtl ? "اسم ملف جديد (مثال: clearance.pdf)" : "Attachment name..."}
                                                value={newAttachName}
                                                onChange={e => setNewAttachName(e.target.value)}
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (!newAttachName.trim()) return;
                                                    setAttachments(prev => [...prev, { name: newAttachName.toLowerCase().endsWith('.pdf') ? newAttachName : newAttachName + '.pdf', date: "2026-05-24", size: "310 KB" }]);
                                                    setNewAttachName('');
                                                }}
                                                className="px-3 h-9 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-lg text-[10px] font-black cursor-pointer"
                                            >
                                                {isRtl ? "إرفاق" : "Attach"}
                                            </button>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        )}

                        {/* SUBTAB 2: HANDOVER & ASSET CLEARANCES CONTRACT */}
                        {subTab === 'clearance' && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
                                <div className="border-b pb-4 border-slate-50 dark:border-slate-800">
                                    <h4 className="font-extrabold text-sm text-slate-904 dark:text-white flex items-center gap-2">
                                        <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                                        {isRtl ? "قائمة تسليم العهد وبراءة الذمة العينية" : "Corporate Asset clearance & Task Handover Ledger"}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-bold mt-1">
                                        {isRtl ? "تحقق من تسليم الأصول وسحب صلاحيات الولوج لقواعد البيانات لفسخ علاقة العمل بالامتثال الكامل" : "Interactive secure steps tracking structural asset handovers and credentials deactivations."}
                                    </p>
                                </div>

                                <div className="space-y-3.5">
                                    {checklist.map(item => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                                            className={`p-4 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${item.done ? 'bg-emerald-50/20 border-emerald-200 text-emerald-805 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400' : 'bg-slate-50/50 border-slate-100 dark:bg-slate-850 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${item.done ? 'bg-emerald-500 border-transparent text-slate-950' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {item.done && <CheckCircle className="w-4 h-4 text-slate-950 fill-current" />}
                                                </div>
                                                <p className="font-extrabold text-xs">
                                                    {isRtl ? item.labelAr : item.labelEn}
                                                </p>
                                            </div>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border">
                                                {item.done ? (isRtl ? "مكتمل ومسلم" : "Handed Over & Verified") : (isRtl ? "قيد الانتظار" : "Awaiting Handover")}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl text-[11px] font-bold text-slate-400 leading-relaxed max-w-2xl">
                                    {isRtl 
                                        ? "تنبيه شؤون العمل: توقيع الموظف على محضر براءة الذمة التفصيلي يبرئ ذمة المنشأة قانونياً في حال واجهت السلسلة ملاحقة قضائية بشأن مكافأة التصفية."
                                        : "MSAL Legal Guard: Acquiring clearance documents signed digitally or physically provides absolute protection against subsequent administrative wage claims."
                                    }
                                </div>

                            </div>
                        )}

                        {/* SUBTAB 3: INTERACTIVE DOCUMENTS STUDIO WITH ALL 15 TEMPLATES */}
                        {subTab === 'documents' && (
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                
                                {/* LEFT INDEX: 15 TEMPLATES SPLIT BY CATEGORY */}
                                <div className="space-y-4 xl:col-span-1">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-3.5">
                                        <h5 className="font-black text-[10px] uppercase text-slate-400 tracking-wider">
                                            {isRtl ? "تصنيف الوثائق القانونية" : "Legal Document Folder Group"}
                                        </h5>
                                        
                                        <div className="flex flex-wrap xl:flex-col gap-1.5 text-[10px] uppercase font-black">
                                            {[
                                                { id: 'all', label: isRtl ? "📂 كافة النماذج الـ 15" : "All 15 Templates" },
                                                { id: 'resign', label: isRtl ? "✉️ طلبات وقرار الاستقالة" : "Resignation Notices" },
                                                { id: 'terminate', label: isRtl ? "📋 إخطارات الفصل والتأديب" : "Separations Actions" },
                                                { id: 'deduct', label: isRtl ? "🧮 الخصومات والمديونية" : "Authorizations & Debts" },
                                                { id: 'release', label: isRtl ? "⚖️ براءات التفريغ والمخالصة" : "Waivers & Clearances" },
                                                { id: 'cert', label: isRtl ? "🎓 شهادات الخدمة والخبرة" : "Experience Certificates" }
                                            ].map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setTemplateCategory(cat.id as any)}
                                                    className={`w-full text-right xl:text-right px-3 py-2 rounded-xl transition-all cursor-pointer ${templateCategory === cat.id ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900'}`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-1.5 max-h-[300px] overflow-y-auto">
                                        <h5 className="font-black text-[10px] uppercase text-slate-400 tracking-wider mb-2">
                                            {isRtl ? "اختر صيغة الوثيقة المطلوبة" : "Select Document Blueprint"}
                                        </h5>
                                        
                                        {filteredTemplatesKeys.map(key => {
                                            const item = templatesRegistry[key as keyof typeof templatesRegistry];
                                            const active = activeTemplate === key;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setActiveTemplate(key)}
                                                    className={`w-full text-right p-2.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer flex justify-between items-center ${active ? 'bg-slate-100 text-indigo-650 dark:bg-slate-800 dark:text-white ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-850'}`}
                                                >
                                                    <span className="truncate">{isRtl ? item.titleAr : item.titleEn}</span>
                                                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-650 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* CENTER & RIGHT: WYSIWYG LEGAL EDITOR + PRINTABLE VIEW */}
                                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* INTERACTIVE FULL-WYSIWYG EDITOR PANEL */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl flex flex-col space-y-4">
                                        <div className="flex justify-between items-center border-b pb-3 border-slate-50 dark:border-slate-800">
                                            <h5 className="font-extrabold text-xs text-slate-855 text-slate-800 dark:text-white flex items-center gap-1.5">
                                                <FileEditIcon className="w-4 h-4 text-indigo-600" />
                                                {isRtl ? "محرر ومراجع المستند القانوني (WYSIWYG)" : "Legal Document Drafting & Customizer Studio"}
                                            </h5>
                                            
                                            <button 
                                                onClick={handleResetTemplate}
                                                title={isRtl ? "استعادة الصيغة الأصلية وتفريغ التعديلات" : "Restore original templates configuration"}
                                                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                            {isRtl
                                                ? "بإمكانك التعديل الكامل بحرية على صياغة البنود وإضافة الشروط والفقرات القانونية لخصوصية المعاملة."
                                                : "Modify parameters, append and expand clauses, edit conditions, and customize legal stipulations directly in real time."
                                            }
                                        </p>

                                        <textarea
                                            className="flex-1 w-full min-h-[350px] p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                                            value={editorText}
                                            onChange={e => setEditorText(e.target.value)}
                                        />
                                        
                                        {/* STYLE TOGGLES */}
                                        <div className="border-t pt-4 border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-3 text-[10px] font-black uppercase text-slate-500">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showStampLegal} 
                                                    onChange={e => setShowStampLegal(e.target.checked)}
                                                    className="rounded accent-indigo-600"
                                                />
                                                <span>{isRtl ? "أختام آدلة القانونية" : "Stamps Adala Guard"}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showStampPaid} 
                                                    onChange={e => setShowStampPaid(e.target.checked)}
                                                    className="rounded accent-indigo-600"
                                                />
                                                <span>{isRtl ? "ختم الصرف (مدفوع)" : "Paid Disbursement Stamp"}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showStampsSignatures} 
                                                    onChange={e => setShowStampsSignatures(e.target.checked)}
                                                    className="rounded accent-indigo-600"
                                                />
                                                <span>{isRtl ? "سجل توقيع الأطراف" : "Parties Signature slots"}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showCompanyLogo} 
                                                    onChange={e => setShowCompanyLogo(e.target.checked)}
                                                    className="rounded accent-indigo-600"
                                                />
                                                <span>{isRtl ? "شعار المنشأة المعتمد" : "Corporate Logo header"}</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* PRINTABLE LEGAL DOCUMENT VIEWPORT PREVIEW */}
                                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-820 p-5 rounded-2xl flex flex-col space-y-4">
                                        
                                        {/* ACTIONS TOP BAR */}
                                        <div className="flex gap-2 justify-end mb-1">
                                            <button 
                                                onClick={handleTriggerPrint}
                                                className="px-3 h-8.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-xs flex items-center gap-1"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                <span>{isRtl ? "طباعة الوثيقة" : "Direct Print"}</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => {
                                                    const blob = new Blob([editorText], { type: 'text/plain;charset=utf-8' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `adala_clearance_document_${settlement.id?.substring(0,5)}.doc`;
                                                    a.click();
                                                }}
                                                className="px-3 h-8.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1"
                                            >
                                                <FileDown className="w-3.5 h-3.5" />
                                                <span>{isRtl ? "تصدير وورد" : "Word / DOC"}</span>
                                            </button>
                                        </div>

                                        {/* HIGH-FIDELITY LEGAL SHEET FRAME */}
                                        <div 
                                            id="printable-legal-frame"
                                            className="bg-white text-slate-900 p-6 md:p-8 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-820 font-serif leading-relaxed space-y-6 min-h-[480px] relative overflow-hidden"
                                            dir={isRtl ? 'rtl' : 'ltr'}
                                        >
                                            
                                            {/* UPPER LOGO AND REFERENCE SECTION */}
                                            <div className="flex justify-between items-start border-b-2 border-slate-900/10 pb-4">
                                                {showCompanyLogo && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white text-xs font-black font-sans leading-none">
                                                            A
                                                        </div>
                                                        <div className="text-[10px] text-left font-sans font-black text-slate-900 leading-tight">
                                                            <p className="uppercase">Adala Legal Group</p>
                                                            <p className="text-[8px] text-slate-400">STATE OF KUWAIT</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="text-[9px] text-slate-450 text-right font-sans font-bold leading-normal">
                                                    <p>{isRtl ? "الرقم المرجعي" : "Ref ID"}: <span className="font-mono font-black">{settlement.settlementNumber || "EOS-" + settlement.id?.substring(0, 5).toUpperCase()}</span></p>
                                                    <p>{isRtl ? "تاريخ الإصدار" : "Doc Date"}: <span className="font-mono">{settlement.settlementDate}</span></p>
                                                </div>
                                            </div>

                                            {/* BODY RENDER TEXT IN SANS-SERIF/SERIF AS EDITABLE AND COMPATIBLE */}
                                            <div className="text-slate-900 text-[11px] leading-relaxed whitespace-pre-wrap font-sans font-bold pr-1.5 min-h-[220px]">
                                                {editorText}
                                            </div>

                                            {/* VERIFICATION SPECIAL QR CODE */}
                                            <div className="absolute left-6 bottom-24 w-12 h-12 border p-1 rounded-md bg-slate-50 flex items-center justify-center">
                                                <QrCode className="w-10 h-10 text-slate-800" />
                                            </div>

                                            {/* DYNAMIC STAMP OVERLAYS */}
                                            <div className="relative flex justify-end gap-4 h-16 pointer-events-none">
                                                {showStampLegal && (
                                                    <div className="w-20 h-20 -mt-6 border-4 border-dashed border-indigo-600 rounded-full flex flex-col items-center justify-center text-[8px] font-black text-indigo-650 rotate-12 scale-90">
                                                        <span>مجموعة آدلة</span>
                                                        <span className="text-[7px]">قوانين العمل</span>
                                                        <span className="text-[6px]">حماية الأجور</span>
                                                    </div>
                                                )}
                                                {showStampPaid && (
                                                    <div className="w-20 h-12 -mt-2 border-4 border-double border-emerald-500 text-emerald-600 flex items-center justify-center text-[10px] font-black uppercase tracking-wider -rotate-12">
                                                        PAID / صرف
                                                    </div>
                                                )}
                                            </div>

                                            {/* BOTTOM STAMPS SIGNATURES SLOT */}
                                            {showStampsSignatures && (
                                                <div className="border-t border-slate-900/5 pt-4 grid grid-cols-2 gap-4 text-[9px] font-sans font-bold text-slate-500">
                                                    <div className="space-y-6">
                                                        <p className="text-slate-800 font-extrabold">{isRtl ? "توقيع الموظف المقر بالبراءة:" : "Employee Digital Receipt Signature:"}</p>
                                                        <p className="font-mono text-[8px] text-slate-400">Signed ID: {settlement.employeeId?.substring(0,6) || "CIVIL"}-X9</p>
                                                    </div>
                                                    <div className="text-left space-y-6">
                                                        <p className="text-slate-800 font-extrabold">{isRtl ? "الاعتماد المالي والشؤون المفوّضة:" : "Authorized Director Clearance Stamp:"}</p>
                                                        <p className="font-mono text-[8px] text-slate-400">Adala verified stamp: C-OK</p>
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        <p className="text-[9px] text-slate-400 leading-normal text-center font-bold">
                                            {isRtl 
                                                ? "ملاحظة: الصياغات أعلاه متطابقة مع نماذج الهيئة العامة للقوى العاملة بدولة الكويت لتراخيص التخالص."
                                                : "Notice: Blueprints strictly conform with Kuwait PAM standards for legal employee offboarding."
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* SUBTAB 4: ADALA AI COMPLIANCE AUDITOR & RISK BOARD */}
                        {subTab === 'ai-analyst' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* AI ADVISER CONSOLE TAB LOG PANEL */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-5 flex flex-col">
                                    <div className="border-b pb-4 border-slate-50 dark:border-slate-800">
                                        <h4 className="font-extrabold text-sm text-slate-904 dark:text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                                            {isRtl ? "التدقيق ومطابقة الامتثال الجنائي والمدني لآدلة الكوت" : "Adala Legal Compliance & Advisory Board (AI Engine)"}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-bold mt-1">
                                            {isRtl ? "يقوم الذكاء الاصطناعي بتحليل الأجور المتراصدة ونسب الاستقطاع للكشف عن المخاطر القانونية قبل الحوالات المصرفية" : "Deep intelligence scan auditing deduction ratios, and calculating risk benchmarks ahead of clearing transactions."}
                                        </p>
                                    </div>

                                    <div className="flex-1 min-h-[250px] bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl overflow-y-auto space-y-3.5 border border-slate-100 dark:border-slate-800 font-bold text-xs">
                                        {aiChatLog.map((log, idx) => (
                                            <div key={idx} className={`p-3 rounded-xl leading-relaxed max-w-[85%] ${log.sender === 'user' ? 'bg-indigo-600 text-white ml-auto' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 mr-auto'}`}>
                                                <p className="whitespace-pre-wrap">{log.text}</p>
                                            </div>
                                        ))}
                                        {isAiThinking && (
                                            <div className="text-slate-400 italic">
                                                <span>{isRtl ? "جاري احتساب ومطابقة اللوائح المدنية..." : "Cross-referencing PAM legislative provisions..."}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2.5">
                                        <input 
                                            type="text" 
                                            className="flex-1 h-10 px-4 bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                                            value={aiQuery}
                                            onChange={e => setAiQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSendAdvisorQuery()}
                                            placeholder={isRtl ? "سلني عن مخاطر الخصم، الاستقالات، أو طلب إضافة صياغة محددة..." : "Inquire about risk metrics or ask me to draft a specific provision..."}
                                        />
                                        <button 
                                            onClick={handleSendAdvisorQuery}
                                            className="px-5 h-10 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>{isRtl ? "استشارة" : "Consult"}</span>
                                        </button>
                                    </div>

                                </div>

                                {/* RIGHT PANEL: INSTANT VERIFICATION AND RISKS MAP BAR */}
                                <div className="space-y-6">
                                    
                                    {/* COMPLIANCE AUDIT AUDITIONAL METRIC SCORECARD */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                                        <h5 className="font-extrabold text-[11px] uppercase text-slate-400 tracking-wider">
                                            {isRtl ? "تقرير الامتثال الموحد للملف" : "Adala Regulatory Alignment Report"}
                                        </h5>

                                        <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg text-[11px]">
                                                <span>{isRtl ? "مؤشر حماية الأجور الكويتي:" : "Wage Protection Index:"}</span>
                                                <span className="text-emerald-500 font-extrabold">98% {isRtl ? "مكتمل" : "Complete"}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg text-[11px]">
                                                <span>{isRtl ? "نسبة استقطاع الديون السارية:" : "Settlement Debt-to-Payout Ratio:"}</span>
                                                <span className={dossierDeductionRatio > 10 ? "text-amber-500 font-extrabold" : "text-emerald-500 font-extrabold"}>{dossierDeductionRatio.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg text-[11px]">
                                                <span>{isRtl ? "تدقيق المادة 44 (فترة الإخطار):" : "Article 44 Notice Check:"}</span>
                                                <span className="text-indigo-650 dark:text-indigo-400 font-extrabold">{settlement.noticePeriodAmount > 0 ? (isRtl ? "مشمول بالتعويض" : "Compensated") : (isRtl ? "خارج الاحتياج" : "No overlap")}</span>
                                            </div>
                                        </div>

                                        {dossierDeductionRatio > 10 && (
                                            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3.5 rounded-xl text-[10px] leading-relaxed font-bold border border-amber-500/20 flex gap-2">
                                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                                <p>
                                                    {isRtl 
                                                        ? "تنبيه: تتجاوز مديونيات الموظف حد الـ 10% القانوني. آدلة تنصح بشدة بتعميم 'تفويض الخصم من الراتب والتعويض المترصد' لضمان خلو الحوالة من النزاع."
                                                        : "Warning: Deductions surpass the 10% statutory barrier. Adala strongly suggests securing a signed Compensation Deduction Mandate."
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                </div>

                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
};

// Helper custom icon mapping if not imported
const FileEditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
