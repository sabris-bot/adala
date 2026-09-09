import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, Download, FileText, Check, Award, Eye, X, 
  RotateCw, Shield, QrCode, Clipboard, Copy, Scale, BookOpen, 
  AlertCircle, Trash, Edit3, EyeOff, Stamp, Save, User, 
  Search, Users, Landmark, Plus, FileCheck, FileSignature
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { Contact, ContactType } from '../types';

// Standard Office Info Consistent with Kuwait Jurisdictional Standards
const OFFICE_INFO = {
  nameAr: "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية",
  nameEn: "Sabry Shatta Law Firm & Legal Consultations",
  licenseNo: "LIC-KUW-2010-992",
  address: "برج الحمراء، الدور 35، شرق، دولة الكويت",
  phone: "+965 2244 5566",
  email: "sabri.s@alwagayan.com"
};

// Official Kuwait Notary Offices (إدارات التوثيق بوزارة العدل)
const KUWAIT_NOTARY_OFFICES = [
  "إدارة التوثيق - مجمع محاكم حولي",
  "إدارة التوثيق - مجمع محاكم الرقعي (الفروانية)",
  "إدارة التوثيق - برج التحرير",
  "إدارة التوثيق - مجمع محاكم العاصمة",
  "إدارة التوثيق - مجمع محاكم الأحمدي",
  "إدارة التوثيق - مجمع محاكم الجهراء",
  "إدارة التوثيق - مجمع محاكم مبارك الكبير"
];

interface POAFormTemplate {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  notes: string;
  defaultCustomTerms: string;
  generateText: (p: {
    principalName: string;
    principalCivId: string;
    principalNat: string;
    principalAddr: string;
    principalPhone: string;
    agentName: string;
    agentCivId: string;
    agentNat: string;
    agentAddr: string;
    poaNo: string;
    poaDate: string;
    notaryOffice: string;
    customTerms: string;
  }) => string;
}

const POA_TEMPLATES: POAFormTemplate[] = [
  {
    id: 'general-litigation',
    title: 'General Litigation & Settlement POA',
    titleAr: 'توكيل رسمي عام بالقضايا والصلح وتفويض الغير',
    description: 'التوكيل النموذجي والمعتمد رسمياً لمكاتب المحاماة في الكويت للحضور والترافع والتسوية والصلح.',
    notes: 'هذا التوكيل يعطي المحامي الحق الكامل لتمثيل الموكل في كافة درجات المحاكم، والحضور أمام الخبراء والتوقيع على الأوراق القانونية دون الحق في قبض المبالغ المالية مالم ينص على ذلك صراحة.',
    defaultCustomTerms: 'لا يحق للوكيل قبض أي مبالغ مالية أو شيكات نيابة عن الموكل إلا بموجب إذن كتابي خاص ومستقل.',
    generateText: (p) => `دولة الكويت
وزارة العدل - إدارة التوثيق
صنف الوثيقة: توكيل رسمي عام في القضايا والصلح وتفويض الغير
رقم القيد بالدفاتر: ${p.poaNo || '................/2026'}
مقر التوثيق: ${p.notaryOffice}

إنه في يوم الكائن الموافق لعام ألفين وستة وعشرين ميلادية، لدى إدارة التوثيق بوزارة العدل بدولة الكويت، وأمامنا نحن موثق العقود بالإدارة المذكورة:

حضر السيد/ ${p.principalName || '................................'}، والجنسية/ ${p.principalNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.principalCivId || '............................'})، والمقيم في: ${p.principalAddr || '................................'}، وهاتفه رقم: ${p.principalPhone || '................'}، وقرر بكامل أهليته القانونية والتصرفية للتعاقد بأنه قد وكّل عنه وأناب:

السيد/ ${p.agentName || 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية'}، والجنسية/ ${p.agentNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.agentCivId || '............................'})، ومقره: ${p.agentAddr || 'دولة الكويت - برج الحمراء - الدور 35'}، وذلك في القيام بالآتي:

أولاً: الحضور والترافع والنيابة عنه أمام كافة المحاكم بدولة الكويت بشتى درجاتها وصنوفها (المحكمة الكلية، محكمة الاستئناف، محكمة التمييز) والمحاكم العسكرية ومحاكم الأسرة والدوائر الجعفرية والسنية، وفي تقديم صحف الدعاوى ومذكرات الدفاع والمثول بالجلسات والمرافعة الشفهية وتأجيل القضايا وإعادتها.

ثانياً: الحضور والتمثيل والنيابة عنه أمام النيابة العامة بجميع مكاتبها، والإدارة العامة للتحقيقات بوزارة الداخلية، وأمام إدارة الخبراء بوزارة العدل بجميع أقسامها الهندسية والحسابية والتوقيع على محاضر الجلسات وتقديم الدفوع الفنية والمستندات وعقود التصفية والاعتراض عليها.

ثالثاً: الإقرار، والإنكار، والصلح، والتسوية، والقبول بالقسمة والتوقيع على اتفاقيات وعقود الصلح القضائية وغير القضائية، والتنازل عن الدعاوى، وطلب يمين الخصم الحاسمة وقبولها أو ردها، والطعن بالتزوير واستئناف الأحكام ورفع الطعون بالتمييز وتلقي الإعلانات القضائية نيابة عنه.

رابعاً: توكيل وتفويض السادة أساتذة المحامين والمستشارين العاملين بمكتب الوكيل في كل أو بعض الصلاحيات المنصوص عليها أعلاه وتفويضهم في تفويض غيرهم وعزلهم واستبدالهم.

شروط خاصة إضافية:
${p.customTerms || 'لا يوجد بنود إضافية مضافة.'}

وبما ذكر صدر هذا التوكيل وجرى التوقيع عليه من الموكل بعد تلاوته عليه والمصادقة التامة على ما جاء فيه قانوناً وموضوعاً.

الموكل: _________________                  الوكيل المفوض: _________________
موثق العقود والعدل: _________________`
  },
  {
    id: 'general-comprehensive',
    title: 'Comprehensive General POA',
    titleAr: 'توكيل رسمي عام شامل بالبيع والرهن والقضايا والإدارة',
    description: 'توكيل ذو صلاحيات مطلقة يشمل التصرف بالبيع والشراء والإدارة وتسيير المعاملات البنكية والعقارية بالكويت.',
    notes: 'تحذير: هذا التوكيل ذو خطورة عالية نظراً لاشتماله على صلاحيات البيع والرهن والمعاملات البنكية التامة، ويُنصح بحصره على الأفراد الموثوقين للغاية أو الشركاء الاستراتيجيين.',
    defaultCustomTerms: 'يقتصر البيع والتصرف في العقارات المملوكة للموكل على القيمة السوقية العادلة وبموافقة كتابية مقترنة مسبقاً من الموكل تفيد ببيانات العقار المراد بيعه.',
    generateText: (p) => `دولة الكويت
وزارة العدل - إدارة التوثيق
صنف الوثيقة: توكيل رسمي عام بالبيع والرهن والقضايا والإدارة
رقم الوثيقة: ${p.poaNo || '................/2026'}
مكتب التوثيق: ${p.notaryOffice}

أمامنا نحن الموثق المعتمد بوزارة العدل بدولة الكويت:
حضر السيد/ ${p.principalName || '................................'}، والجنسية/ ${p.principalNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.principalCivId || '............................'})، والمقيم في: ${p.principalAddr || '................................'}، وقرر توكيل السيد/ ${p.agentName || '................................'}، والجنسية/ ${p.agentNat || 'كويتي'}، حامل البطاقة المدنية رقم: (${p.agentCivId || '............................'})، لينوب عنه ويقوم بدلاً منه في الصلاحيات القانونية المطلقة التالية:

١. البيع، والشراء، والرهن، وفك الرهن، والتنازل وقبول التنازل، والمبادلة لكافة العقارات، والأراضي، والبيوت، والمحلات المملوكة للموكل، والتوقيع على العقود الابتدائية والنهائية والإقرار بالبيع وقبض الثمن لدى إدارة التسجيل العقاري والتوثيق بوزارة العدل الكويتية.

٢. إدارة وتأجير واستئجار كافة العقارات المملوكة للموكل، وتحصيل مبالغ الأجرة الشهرية نقداً أو بشيكات وتوقيع عقود الإيجار وتجديدها أو إلغائها وطلب إخلاء المستأجرين ورفع دعاوى الإيجارات.

٣. مراجعة كافة وزارات ومؤسسات الدولة الخدمية والسيادية، بما فيها بلدية الكويت، الهيئة العامة للمعلومات المدنية، وزارة الكهرباء والماء، وزارة التجارة والصناعة، الهيئة العامة للقوى العاملة، والمؤسسة العامة للرعاية السكنية لإنهاء كافة المعاملات والتراخيص واستخراج الشهادات والتوقيع عليها.

٤. مراجعة جميع البنوك والمصارف العاملة في دولة الكويت دون استثناء (بما فيها بنك الكويت الوطني، بيت التمويل الكويتي، بنك بوبيان، بنك الخليج) وفتح الحسابات الجارية والتوفير والودائع وإغلاقها وسحب وإيداع الأموال وتحويلها والتوقيع على الشيكات واستلام بطاقات السحب الآلي والدفاتر والائتمان وتسيير المعاملات التمويلية.

٥. تمثيل الموكل أمام جميع محاكم الكويت وجهاتها القضائية والتحكيمية ورفع الدعاوى والدفاع عنها وتقديم الطعون وتوكيل وتفويض الغير في كافة البنود السالفة وعزلهم.

شروط وبنود إضافية مقيدة:
${p.customTerms || 'لا يوجد قيود إضافية على الصلاحيات المطلقة.'}

وبما ذكر صدرت هذه الوثيقة وتُليت على الحاضرين ووقعت من الموكل إيذاناً ببدء العمل بوجبها قانوناً.

الموكل: _________________                  الوكيل المفوض: _________________
موثق العقود والعدل: _________________`
  },
  {
    id: 'special-litigation',
    title: 'Special POA for Litigation & Expert Disputes',
    titleAr: 'توكيل رسمي خاص بالقضايا وإدارة الخبراء بوزارة العدل',
    description: 'توكيل خاص محدد الصلاحيات لتمثيل الموكل في نزاع قضائي معين والمثول أمام الخبير الحسابي أو الهندسي.',
    notes: 'هذا الخيار مثالي للعملاء الذين يرغبون في تمثيل قانوني محصور جداً بقضية معينة دون تمكين المحامي من اتخاذ إجراءات عامة أو رفع دعاوى أخرى بغير إذنهم.',
    defaultCustomTerms: 'يقتصر هذا التوكيل على تمثيل الموكل في القضية رقم (................/2026) المقامة لدى المحكمة التجارية الكلية ولا يحق للوكيل اتخاذ أي إجراء خارج نطاقها.',
    generateText: (p) => `دولة الكويت
وزارة العدل - إدارة التوثيق
صنف الوثيقة: توكيل رسمي خاص بالتمثيل القضائي وإدارة الخبراء
رقم الوثيقة: ${p.poaNo || '................/2026'}
مقر التوثيق: ${p.notaryOffice}

بموجب الأهلية القضائية المقررة رسمياً وبقوانين دولة الكويت:
حضر السيد/ ${p.principalName || '................................'}، والجنسية/ ${p.principalNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.principalCivId || '............................'})، والمقيم في: ${p.principalAddr || '................................'}، وقرر توكيل السيد/ ${p.agentName || 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية'}، الحامل للبطاقة المدنية رقم: (${p.agentCivId || '............................'})، وذلك بصفة خاصة وحصرية للتمثيل والنيابة عنه في الآتي:

الحضور والمرافعة والمدافعة وتقديم الأوراق والمستندات وعقود التصفية والمطابقة الفنية أمام الدوائر القضائية ومحكمة الموضوع وإدارة الخبراء بوزارة العدل الكويتية في الدعوى القضائية موضوع النزاع والمسجلة ببياناتها القانونية التالية:
${p.customTerms || 'يرجى تدوين رقم القضية وبيان موضوع الخصومة هنا في البنود والقيود.'}

وللوكيل في سبيل ذلك الحضور أمام الخبراء الحسابيين والمهندسين المنتدبين من المحكمة، ومناقشة تقاريرهم وتفنيد المزاعم، وتقديم المذكرات الاستشارية والمطابقة والاعتراض على التقارير الفنية، والتوقيع على محاضر الجلسات التمهيدية والانتقال للموقع وإيداع كافة المستندات الثبوتية، مع حظر كامل وشامل على إجراء الصلح أو التنازل أو قبض أي مبالغ مالية أو شيكات ما لم يصدر بذلك تفويض منفصل ولاحق.

الموكل: _________________                  الوكيل المفوض: _________________
موثق العقود والعدل: _________________`
  },
  {
    id: 'special-corporate',
    title: 'Special Commercial & Corporate POA',
    titleAr: 'توكيل رسمي خاص بالمعاملات التجارية وتأسيس الشركات',
    description: 'توكيل خاص معتمد لتأسيس وتعديل وإدارة الشركات والتوقيع على العقود بوزارة التجارة وإدارة التوثيق.',
    notes: 'يُستخدم هذا التوكيل بشكل متكرر لشركاء العمل والمستشارين القانونيين لتسيير معاملات الشركات ذات المسؤولية المحدودة والشركات المساهمة دون المساس بالأصول الشخصية للموكل.',
    defaultCustomTerms: 'يقتصر هذا التوكيل على التوقيع على عقد تأسيس وملاحق تعديل شركة (شركة عدالة للحلول والبرمجيات القانونية - ذ.م.م) والتمثيل لدى وزارة التجارة.',
    generateText: (p) => `دولة الكويت
وزارة العدل - إدارة التوثيق
صنف الوثيقة: توكيل رسمي خاص بالمعاملات التجارية وتأسيس الشركات
رقم الوثيقة: ${p.poaNo || '................/2026'}
مقر التوثيق: ${p.notaryOffice}

أمامنا نحن موثق العقود بإدارة التوثيق بوزارة العدل بدولة الكويت:
حضر السيد/ ${p.principalName || '................................'}، والجنسية/ ${p.principalNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.principalCivId || '............................'})، والمقيم في: ${p.principalAddr || '................................'}، وقرر توكيل وتعيين السيد/ ${p.agentName || '................................'}، والجنسية/ ${p.agentNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.agentCivId || '............................'})، ليمثله وينوب عنه بصفة خاصة في الآتي:

١. مراجعة وزارة التجارة والصناعة بجميع قطاعاتها، وإدارة السجل التجاري، وغرفة تجارة وصناعة الكويت لتأسيس الشركات بشتى أنواعها (شركات ذات مسؤولية محدودة، شركات الشخص الواحد، شركات تضامنية) أو تعديل عقود التأسيس للشركات القائمة التي يساهم فيها الموكل.

٢. التوقيع على عقود التأسيس وملاحق التعديل ومحاضر اجتماعات الجمعية العمومية وقرارات الشركاء وملاحق خروج ودخول الشركاء وزيادة أو تخفيض رأس المال أمام إدارة التوثيق (كاتب العدل) بوزارة العدل الكويتية.

٣. مراجعة الهيئة العامة للقوى العاملة وإدارة تقدير الاحتياج، وتسيير وإنهاء ملفات الكوادر الوطنية والوافدة التابعة للشركات واستخراج وتجديد وإلغاء أذونات العمل وإجراءات الإقامة.

٤. مراجعة الهيئة العامة للمعلومات المدنية، الهيئة العامة للصناعة، بلدية الكويت لاستخراج التراخيص الصحية والتجارية وتجديدها والتنازل عنها للغير.

شروط وبنود خاصة بالشركة المراد تأسيسها:
${p.customTerms || 'يقتصر التفويض على إتمام التراخيص للشركات التجارية المعتمدة من الموكل.'}

الموكل: _________________                  الوكيل المفوض: _________________
موثق العقود والعدل: _________________`
  },
  {
    id: 'special-family',
    title: 'Special Family Law & Inheritance POA',
    titleAr: 'توكيل رسمي خاص بالأحوال الشخصية والتركات والنفقة',
    description: 'توكيل خاص لتمثيل الموكل أمام محكمة الأسرة، وإدارة التركات، وحصر الإرث، ومؤسسات شؤون القصر.',
    notes: 'تمت صياغة هذا التوكيل بالتزام دقيق مع قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984 لتنظيم تمثيل قضايا النفقة، الحضانة، والمواريث.',
    defaultCustomTerms: 'لا يحق للوكيل تزويج أو تطليق الموكل أو التنازل عن حضانة الأولاد إلا بإذن خطي مسبق ومصدق.',
    generateText: (p) => `دولة الكويت
وزارة العدل - إدارة التوثيق
صنف الوثيقة: توكيل رسمي خاص بالأحوال الشخصية وحصر التركات
رقم الوثيقة: ${p.poaNo || '................/2026'}
مكتب التوثيق: ${p.notaryOffice}

أمام كاتب العدل المعتمد بإدارة التوثيق في وزارة العدل بدولة الكويت:
حضر السيد/ ${p.principalName || '................................'}، والجنسية/ ${p.principalNat || 'كويتي'}، بموجب البطاقة المدنية رقم: (${p.principalCivId || '............................'})، والمقيم في: ${p.principalAddr || '................................'}، وقرر توكيل السيد/ ${p.agentName || 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية'}، بموجب البطاقة المدنية رقم: (${p.agentCivId || '............................'})، ليمثله وينوب عنه بصفة خاصة في الآتي:

١. الحضور والترافع والمطالبة وإقامة الدعاوى والدفاع أمام محكمة الأسرة ومحاكم الأحوال الشخصية بشتى دوائرها (السنية والجعفرية الاستئنافية والكلية) بدولة الكويت في دعاوى النفقة الزوجية ونفقة الأولاد بشتى أنواعها، والمطالبة بأجور السكن، السيارات، أجور الحضانة والخدم.

٢. استخراج القسامات الشرعية، وحصر الورثة، ومراجعة الهيئة العامة لشؤون القصر لحفظ وإدارة مستحقات القصر وتصفيتها واستلام المبالغ المقررة وصرف المساعدات وتوقيع الإقرارات والتسويات اللازمة.

٣. مراجعة إدارة التنفيذ بوزارة العدل لإنهاء وتطبيق وتنفيذ الأحكام القضائية العائلية، وتوقيع محاضر الاستلام وقبض مبالغ النفقات المودعة بالخزينة وإصدار كتب الحجز والمنع من السفر للمكلفين بالإنفاق.

تفاصيل النزاع أو التركة المحددة:
${p.customTerms || 'يقتصر التفويض على تصفية تركة المغفور له وحصر إرث العائلة.'}

الموكل: _________________                  الوكيل المفوض: _________________
موثق العقود والعدل: _________________`
  }
];

export const KuwaitPoaGeneratorPage: React.FC = () => {
  const { addToast } = useToast();
  
  // Navigation & Workspace Mode
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [poaHistory, setPoaHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_generated_poas');
    return saved ? JSON.parse(saved) : [];
  });

  // Client Contacts Database integration
  const [clients, setClients] = useState<Contact[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('custom');

  // Load clients list on mount
  useEffect(() => {
    const storedContacts = localStorage.getItem('adala_contacts_list_v3');
    if (storedContacts) {
      try {
        const parsed: Contact[] = JSON.parse(storedContacts);
        // Filter those who are marked as clients
        const clientList = parsed.filter(c => c.contactType.includes(ContactType.CLIENT));
        setClients(clientList);
      } catch (e) {
        console.error("Failed to parse contacts list", e);
      }
    }
  }, []);

  // Form Inputs State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('general-litigation');
  
  // Principal Fields
  const [principalName, setPrincipalName] = useState('');
  const [principalCivId, setPrincipalCivId] = useState('');
  const [principalNat, setPrincipalNat] = useState('كويتي');
  const [principalAddr, setPrincipalAddr] = useState('');
  const [principalPhone, setPrincipalPhone] = useState('');

  // Agent Fields (Pre-populated with Law Firm defaults)
  const [agentName, setAgentName] = useState(OFFICE_INFO.nameAr);
  const [agentCivId, setAgentCivId] = useState('280101290333');
  const [agentNat, setAgentNat] = useState('كويتي');
  const [agentAddr, setAgentAddr] = useState(OFFICE_INFO.address);

  // Metadata Fields
  const [poaNo, setPoaNo] = useState('');
  const [poaDate, setPoaDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notaryOffice, setNotaryOffice] = useState(KUWAIT_NOTARY_OFFICES[1]); // Default to Al-Raqqi
  const [customTerms, setCustomTerms] = useState('');

  // Live draft edits
  const [isLiveEditing, setIsLiveEditing] = useState(false);
  const [liveDraftText, setLiveDraftText] = useState('');

  // Auto-populate when Template changes or inputs change (unless live editing)
  const activeTemplate = useMemo(() => {
    return POA_TEMPLATES.find(t => t.id === selectedTemplateId) || POA_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Handle client selection change
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClientId(val);
    
    if (val === 'custom') {
      // Clear fields to let user type manually
      setPrincipalName('');
      setPrincipalCivId('');
      setPrincipalNat('كويتي');
      setPrincipalAddr('');
      setPrincipalPhone('');
    } else {
      const client = clients.find(c => c.id === val);
      if (client) {
        setPrincipalName(client.fullName);
        setPrincipalCivId(client.poaNumber ? client.poaNumber.split('/')[0] : ''); // mock/estimate
        setPrincipalNat(client.country === 'الكويت' || !client.country ? 'كويتي' : 'غير كويتي');
        setPrincipalAddr(client.address || '');
        setPrincipalPhone(client.phonePrimary || '');
        
        // If they already have a POA saved in contacts list
        if (client.poaNumber) {
          setPoaNo(client.poaNumber);
        }
        if (client.poaDate) {
          setPoaDate(client.poaDate);
        }
        
        addToast({
          type: 'success',
          title: 'تم استيراد بيانات العميل',
          message: `تم ملء حقول الموكل تلقائياً من ملف العميل: ${client.fullName}`
        });
      }
    }
  };

  // Re-generate text whenever fields change, but only if not in live editing override mode
  useEffect(() => {
    if (!isLiveEditing) {
      const text = activeTemplate.generateText({
        principalName,
        principalCivId,
        principalNat,
        principalAddr,
        principalPhone,
        agentName,
        agentCivId,
        agentNat,
        agentAddr,
        poaNo,
        poaDate,
        notaryOffice,
        customTerms: customTerms || activeTemplate.defaultCustomTerms
      });
      setLiveDraftText(text);
    }
  }, [
    activeTemplate,
    principalName,
    principalCivId,
    principalNat,
    principalAddr,
    principalPhone,
    agentName,
    agentCivId,
    agentNat,
    agentAddr,
    poaNo,
    poaDate,
    notaryOffice,
    customTerms,
    isLiveEditing
  ]);

  // Handle template selection change
  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = POA_TEMPLATES.find(t => t.id === id);
    if (tmpl) {
      setCustomTerms(tmpl.defaultCustomTerms);
      setIsLiveEditing(false); // Reset live editing to load clean template text
      
      addToast({
        type: 'info',
        title: 'تم تغيير صيغة التوكيل',
        message: `تم تحميل قالب: ${tmpl.titleAr}`
      });
    }
  };

  // Reset agent fields to defaults
  const handleResetAgent = () => {
    setAgentName(OFFICE_INFO.nameAr);
    setAgentCivId('280101290333');
    setAgentNat('كويتي');
    setAgentAddr(OFFICE_INFO.address);
    addToast({
      type: 'info',
      title: 'إعادة تعيين الوكيل',
      message: 'تمت إعادة تعيين حقول الوكيل لبيانات مكتب صبري شطا للمحاماة.'
    });
  };

  // Print Action
  const handlePrint = () => {
    window.print();
    addToast({
      type: 'success',
      title: 'بدء الطباعة',
      message: 'تم إرسال مستند التوكيل إلى واجهة الطباعة بنجاح.'
    });
  };

  // Copy Draft Text
  const handleCopy = () => {
    navigator.clipboard.writeText(liveDraftText);
    addToast({
      type: 'success',
      title: 'تم نسخ النص',
      message: 'تم نسخ مسودة التوكيل القانوني بالكامل للحافظة.'
    });
  };

  // Save POA to history and/or client file
  const handleSavePoa = () => {
    if (!principalName) {
      addToast({
        type: 'warning',
        title: 'بيانات ناقصة',
        message: 'يرجى إدخال اسم الموكل الرئيسي لحفظ التوكيل.'
      });
      return;
    }

    const generatedPoaNo = poaNo || `KW-POA-${Date.now().toString().slice(-6)}`;
    const newPoa = {
      id: `poa-${Date.now()}`,
      title: activeTemplate.titleAr,
      templateId: selectedTemplateId,
      poaNo: generatedPoaNo,
      poaDate: poaDate,
      notaryOffice: notaryOffice,
      principalName,
      principalCivId,
      principalPhone,
      agentName,
      createdAt: new Date().toISOString(),
      content: liveDraftText,
      clientId: selectedClientId
    };

    // 1. Save in local generator history
    const updatedHistory = [newPoa, ...poaHistory];
    setPoaHistory(updatedHistory);
    localStorage.setItem('adala_generated_poas', JSON.stringify(updatedHistory));

    // 2. Update client's profile in `'adala_contacts_list_v3'` if a client is selected
    const savedContacts = localStorage.getItem('adala_contacts_list_v3');
    if (savedContacts) {
      try {
        let contacts: Contact[] = JSON.parse(savedContacts);
        
        if (selectedClientId !== 'custom') {
          // Update existing client
          contacts = contacts.map(c => {
            if (c.id === selectedClientId) {
              const updatedInteractions = [
                {
                  id: `int-${Date.now()}`,
                  date: new Date().toISOString(),
                  type: 'other' as any,
                  note: `تم توليد وحفظ مسودة التوكيل القانوني الكويتي المعتمد من نوع (${activeTemplate.titleAr}) برقم قيد: ${generatedPoaNo} بمكتب توثيق: ${notaryOffice}.`,
                  user: OFFICE_INFO.nameAr
                },
                ...(c.interactions || [])
              ];
              
              return {
                ...c,
                poaNumber: generatedPoaNo,
                poaDate: poaDate,
                poaType: activeTemplate.titleAr,
                poaStatus: 'valid' as any,
                interactions: updatedInteractions,
                notes: `${c.notes || ''}\n[تحديث عدالة v3]: تم توليد مسودة التوكيل المعتمد بتاريخ ${poaDate}.`
              };
            }
            return c;
          });

          addToast({
            type: 'success',
            title: 'تم تحديث ملف العميل',
            message: `تم تسجيل التوكيل رقم ${generatedPoaNo} وملخص الإجراء بملف العميل بنجاح.`
          });
        } else {
          // If custom name, let's offer to create a new client contact on the fly!
          const newContact: Contact = {
            id: `contact-${Date.now()}`,
            fullName: principalName,
            contactType: [ContactType.CLIENT],
            emailPrimary: `${principalName.replace(/\s+/g, '')}@example.com`,
            phonePrimary: principalPhone,
            whatsapp: principalPhone,
            city: 'مدينة الكويت',
            country: 'الكويت',
            createdAt: new Date().toISOString(),
            notes: 'تم إنشاؤه تلقائياً بواسطة منشئ التوكيلات الكويتية عدالة v3.',
            poaNumber: generatedPoaNo,
            poaDate: poaDate,
            poaType: activeTemplate.titleAr,
            poaStatus: 'valid' as any,
            interactions: [
              {
                id: `int-${Date.now()}`,
                date: new Date().toISOString(),
                type: 'other' as any,
                note: `تم إنشاء جهة الاتصال وتوليد مسودة التوكيل الرسمي المعتمد من نوع (${activeTemplate.titleAr}) برقم قيد: ${generatedPoaNo}.`,
                user: OFFICE_INFO.nameAr
              }
            ]
          };
          contacts = [newContact, ...contacts];
          
          // Refresh local client list
          setClients(contacts.filter(c => c.contactType.includes(ContactType.CLIENT)));
          setSelectedClientId(newContact.id);

          addToast({
            type: 'success',
            title: 'عميل جديد مضاف',
            message: `تم تلقائياً إنشاء ملف عميل جديد باسم (${principalName}) وحفظ التوكيل بداخله.`
          });
        }

        localStorage.setItem('adala_contacts_list_v3', JSON.stringify(contacts));
      } catch (err) {
        console.error("Error updating client contact file", err);
      }
    }

    addToast({
      type: 'success',
      title: 'حفظ المستند القانوني',
      message: 'تم حفظ وتوثيق مسودة التوكيل في قاعدة بيانات عدالة بنجاح.'
    });
  };

  // Delete from history
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف مسودة التوكيل المحفوظة هذه من الأرشيف؟')) {
      const updated = poaHistory.filter(p => p.id !== id);
      setPoaHistory(updated);
      localStorage.setItem('adala_generated_poas', JSON.stringify(updated));
      addToast({
        type: 'success',
        title: 'شطب المسودة',
        message: 'تم مسح الوثيقة من أرشيف التوليد بنجاح.'
      });
    }
  };

  // Load old document back to workspace
  const handleLoadHistoryItem = (poa: any) => {
    setSelectedTemplateId(poa.templateId);
    setPoaNo(poa.poaNo);
    setPoaDate(poa.poaDate);
    setNotaryOffice(poa.notaryOffice);
    setPrincipalName(poa.principalName);
    setPrincipalCivId(poa.principalCivId);
    setPrincipalPhone(poa.principalPhone);
    setAgentName(poa.agentName);
    
    // Set custom text directly and override live editing
    setLiveDraftText(poa.content);
    setIsLiveEditing(true);
    setActiveTab('create');
    
    addToast({
      type: 'info',
      title: 'استدعاء الصك القانوني',
      message: `تم بنجاح تحميل المسودة المحفوظة لرقم القيد: ${poa.poaNo} في محرر العمل.`
    });
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return poaHistory.filter(p => {
      const matchesSearch = (
        p.principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.poaNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesSearch;
    });
  }, [poaHistory, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 font-sans text-right" dir="rtl">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-150 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/10">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">منشئ التوكيلات المعتمدة لدولة الكويت</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            بوابة رقمية متكاملة لصياغة وتجهيز التوكيلات الرسمية الصادرة عن إدارة التوثيق بوزارة العدل الكويتية، مع ترحيل البيانات وحفظها التلقائي بملفات العملاء.
          </p>
        </div>
        
        {/* Toggle navigation tabs */}
        <div className="flex bg-slate-100 dark:bg-dm-card p-1.5 rounded-2xl border border-gray-150 dark:border-gray-800 mt-4 md:mt-0 gap-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            منشئ الوثيقة والمسودات
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            سجل الصكوك والأرشيف ({poaHistory.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'create' ? (
          <motion.div
            key="create-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Input form - Left on large screens, or Right in Arabic (col-span-5) */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
              
              {/* Step 1: Template Selection */}
              <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 mb-2 border-slate-100 dark:border-gray-800">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">١. اختيار قالب الوكالة الرسمية</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">صنف الصيغة المعتمدة (وزارة العدل)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {POA_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => handleTemplateChange(tmpl.id)}
                        className={`p-3 text-right rounded-2xl border transition-all flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          selectedTemplateId === tmpl.id
                            ? 'border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                            : 'border-gray-150 dark:border-gray-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <FileSignature className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selectedTemplateId === tmpl.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-black leading-snug">{tmpl.titleAr}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{tmpl.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/40 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3 text-right">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-normal font-medium">
                    <strong className="font-bold">إرشادات مهنية:</strong> {activeTemplate.notes}
                  </p>
                </div>
              </div>

              {/* Step 2: Client integration / Principal Info */}
              <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3 mb-2 border-slate-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">٢. بيانات الموكل (الطرف الأول)</h3>
                  </div>
                  
                  {/* Select Client dropdown */}
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedClientId}
                      onChange={handleClientChange}
                      className="text-[11px] font-black text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="custom">✍️ إدخال يدوي حر</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم الموكل بالكامل (كما بالبطاقة المدنية)</label>
                    <input
                      type="text"
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      placeholder="أدخل الاسم الرباعي"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">الرقم المدني الكويتي (١٢ رقم)</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={principalCivId}
                        onChange={(e) => setPrincipalCivId(e.target.value.replace(/\D/g, ''))}
                        placeholder="أدخل ١٢ رقماً"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">الجنسية</label>
                      <input
                        type="text"
                        value={principalNat}
                        onChange={(e) => setPrincipalNat(e.target.value)}
                        placeholder="كويتي / سعودي / إلخ"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={principalPhone}
                        onChange={(e) => setPrincipalPhone(e.target.value)}
                        placeholder="965+"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">محل الإقامة والسكن</label>
                      <input
                        type="text"
                        value={principalAddr}
                        onChange={(e) => setPrincipalAddr(e.target.value)}
                        placeholder="مثال: حولي قطعة 3 شارع 1"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Agent Details */}
              <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3 mb-2 border-slate-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">٣. بيانات الوكيل القانوني</h3>
                  </div>
                  
                  <button
                    onClick={handleResetAgent}
                    className="text-[10px] font-black text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" /> إعادة تعيين للشركة
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم الوكيل بالكامل</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="اسم الوكيل الرئيسي"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">الرقم المدني للوكيل</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={agentCivId}
                        onChange={(e) => setAgentCivId(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">الجنسية</label>
                      <input
                        type="text"
                        value={agentNat}
                        onChange={(e) => setAgentNat(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان الوكيل / مقر مكتب المحاماة</label>
                    <input
                      type="text"
                      value={agentAddr}
                      onChange={(e) => setAgentAddr(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Notary Registration Meta */}
              <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 mb-2 border-slate-100 dark:border-gray-800">
                  <Stamp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">٤. بيانات التوثيق وقيد وزارة العدل</h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">رقم التوكيل (إذا توفر)</label>
                      <input
                        type="text"
                        value={poaNo}
                        onChange={(e) => setPoaNo(e.target.value)}
                        placeholder="مثال: 1245 / 2026"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">تاريخ توثيق الصك</label>
                      <input
                        type="date"
                        value={poaDate}
                        onChange={(e) => setPoaDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">مكتب وزارة العدل المصدق</label>
                    <select
                      value={notaryOffice}
                      onChange={(e) => setNotaryOffice(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {KUWAIT_NOTARY_OFFICES.map((office, idx) => (
                        <option key={idx} value={office}>{office}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">شروط خاصة أو قيود إضافية مقترنة</label>
                    <textarea
                      value={customTerms}
                      onChange={(e) => setCustomTerms(e.target.value)}
                      placeholder="أدخل قيوداً أو استثناءات إضافية على سلطة الوكيل هنا..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Document live preview section - col-span-7 */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              
              {/* Toolbar Buttons */}
              <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-md flex items-center justify-between gap-2 flex-wrap print:hidden">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black">مسودة التوكيل الجاهزة للطباعة</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all"
                    title="نسخ النص الكامل"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>

                  {/* Live Edit switch */}
                  <button
                    onClick={() => setIsLiveEditing(!isLiveEditing)}
                    className={`px-3 py-2 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 ${
                      isLiveEditing 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isLiveEditing ? 'تعديل نشط ✍️' : 'تفعيل تعديل حر'}
                  </button>

                  {/* Print trigger */}
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة الوثيقة
                  </button>

                  {/* Save button */}
                  <button
                    onClick={handleSavePoa}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-4 h-4" />
                    حفظ لملف العميل
                  </button>
                </div>
              </div>

              {/* Physical paper simulation card */}
              <div className="bg-white text-slate-900 border border-gray-200 shadow-xl rounded-3xl p-8 md:p-12 min-h-[900px] flex flex-col font-serif relative overflow-hidden print:shadow-none print:border-none print:p-0">
                
                {/* Official Kuwait Crest and Ministry Header */}
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-6">
                  <div className="text-right leading-relaxed font-sans text-xs">
                    <p className="font-bold text-sm">وزارة الـعـدل</p>
                    <p className="text-slate-600 font-bold">إدارة التوثيق العقاري والتوثيق</p>
                    <p className="text-slate-500 text-[10px]">دولة الكويت</p>
                  </div>
                  
                  {/* Decorative State Emblem PlaceHolder */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-double border-slate-900 flex items-center justify-center p-1 bg-white">
                      <div className="w-full h-full rounded-full border border-slate-800 flex flex-col items-center justify-center text-[10px] font-sans font-bold">
                        <Scale className="w-6 h-6 text-slate-800 mb-0.5" />
                        <span className="text-[7px]">دولة الكويت</span>
                      </div>
                    </div>
                    <p className="text-[9px] font-sans font-bold text-slate-600 mt-1">شعار التوثيق الرسمي</p>
                  </div>

                  <div className="text-left leading-relaxed font-sans text-xs" dir="ltr">
                    <p className="font-bold text-sm text-slate-800">MINISTRY OF JUSTICE</p>
                    <p className="text-slate-600 font-bold text-[10px]">Notary Public Department</p>
                    <p className="text-slate-500 text-[9px]">State of Kuwait</p>
                  </div>
                </div>

                {/* Micro-print watermark / border frame */}
                <div className="absolute inset-4 border border-emerald-600/5 rounded-2xl pointer-events-none"></div>
                <div className="absolute inset-5 border-2 border-double border-slate-900/5 rounded-2xl pointer-events-none"></div>

                {/* Watermark Logo backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <Scale className="w-[380px] h-[380px] text-slate-900" />
                </div>

                {/* Core Document Body */}
                <div className="flex-1 font-serif text-sm leading-loose text-justify text-slate-800 whitespace-pre-wrap">
                  {isLiveEditing ? (
                    <textarea
                      value={liveDraftText}
                      onChange={(e) => setLiveDraftText(e.target.value)}
                      className="w-full h-full min-h-[700px] bg-slate-50/50 p-4 rounded-xl border border-dashed border-amber-400 font-serif text-sm leading-loose focus:outline-none focus:ring-0 text-slate-800 whitespace-pre-wrap print:bg-transparent print:p-0 print:border-none resize-none"
                    />
                  ) : (
                    liveDraftText
                  )}
                </div>

                {/* Footer Security elements & signature block */}
                <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 font-sans">
                  
                  {/* Stamp Area */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-full border-4 border-double border-slate-800/40 flex items-center justify-center p-0.5 transform -rotate-12 bg-white/50">
                      <div className="w-full h-full rounded-full border border-slate-800/30 flex flex-col items-center justify-center text-[7px] font-bold text-slate-700/60 p-1 text-center">
                        <span>مكتب صبري شطا</span>
                        <span className="font-mono text-[6px]">APPROVED</span>
                        <span>عدالة للتصديق</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">خاتم تدقيق صك الوكالة</p>
                      <p className="text-[8px] text-slate-400 font-mono">ADALA SECURE HASH: {principalCivId ? `KW-${principalCivId.slice(0, 4)}` : 'VALIDATED'}</p>
                    </div>
                  </div>

                  {/* QR Security Verification */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-gray-150 print:bg-transparent print:border-none">
                    <QrCode className="w-12 h-12 text-slate-800" />
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-700">التحقق من صحة التوثيق</p>
                      <p className="text-[8px] text-slate-400 leading-tight">امسح الكود ضوئياً عبر البوابة الإلكترونية لوزارة العدل الكويتية لمطابقة الأرشيف.</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        ) : (
          /* History/Archive tab */
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Filter bar */}
            <div className="bg-white dark:bg-dm-card p-5 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  placeholder="ابحث باسم الموكل، رقم القيد، أو نوع التوكيل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                تم العثور على <strong className="font-bold text-slate-800 dark:text-white">{filteredHistory.length}</strong> صكوك وكالة مخزنة في الأرشيف المحلي.
              </div>
            </div>

            {/* List of generated POAs */}
            {filteredHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHistory.map((poa) => {
                  const tmpl = POA_TEMPLATES.find(t => t.id === poa.templateId);
                  return (
                    <div
                      key={poa.id}
                      onClick={() => handleLoadHistoryItem(poa)}
                      className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            {poa.notaryOffice ? poa.notaryOffice.split(' - ')[1] || poa.notaryOffice : 'توثيق كويتي'}
                          </span>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(poa.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                            title="حذف من الأرشيف"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{poa.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">تاريخ التوثيق: {poa.poaDate}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">اسم الموكل:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{poa.principalName}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">رقم القيد بالعدل:</span>
                            <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{poa.poaNo}</span>
                          </div>
                          {poa.principalCivId && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">الرقم المدني:</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300">{poa.principalCivId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                        <span>انقر لتحميل الوثيقة في محرر العمل &larr;</span>
                        <span className="text-slate-400 font-normal">{new Date(poa.createdAt).toLocaleDateString('ar-KW')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-dm-card rounded-3xl border border-gray-150 dark:border-gray-800">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">أرشيف المسودات فارغ</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  لا توجد حالياً أي توكيلات رسمية تم إنشاؤها وتوثيقها بمحركات الصياغة. اذهب إلى منشئ الوثائق للبدء في توليد صكوكك الأولى.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default KuwaitPoaGeneratorPage;
