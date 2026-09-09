import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Mic, MicOff, Play, Pause, Square, RotateCcw, Volume2, VolumeX,
    Gavel, Scale, Brain, Shield, AlertTriangle, CheckCircle, Clock,
    FileText, Printer, Save, Download, Sparkles, ChevronRight,
    Award, Users, AlertCircle, MessageSquare, Zap, Eye, RefreshCw,
    TrendingUp, ThumbsUp, ThumbsDown, SlidersHorizontal, BookOpen,
    HelpCircle, ChevronDown, Check, ArrowRight
} from 'lucide-react';
import { LitigationCase } from '../litigationData';

// --- Types ---
export interface HearingPreset {
    id: string;
    title: string;
    caseNumber: string;
    court: string;
    circuit: string;
    clientName: string;
    clientRole: 'المدعي' | 'المدعى عليه' | 'المستأنف' | 'المطعون ضده';
    opponentName: string;
    caseType: string;
    facts: string;
    strengths: string[];
    weaknesses: string[];
    counterArguments: string[];
    judgeStyle: 'متشدد شكلياً' | 'يركز على الحسابات والمستندات' | 'حازم في التوقيت' | 'متوازن ومستمع';
    recommendedTimeMinutes: number;
    initialPleading: {
        intro: string;
        proceduralDefenses: string;
        factsAndRebuttal: string;
        substantiveGrounds: string;
        finalRequests: string;
    };
    judgeQuestions: Array<{
        id: string;
        question: string;
        context: string;
        suggestedAnswer: string;
    }>;
}

export const HEARING_PRESETS: HearingPreset[] = [
    {
        id: 'commercial_breach',
        title: 'دعوى مطالبة تجارية بـ 85,000 د.ك وتعويض عن إخلال تعاقدي بتوريد معدات',
        caseNumber: 'COM-2026-0412',
        court: 'قصر العدل - المحكمة الكلية',
        circuit: 'الدائرة التجارية الكلية ٣',
        clientName: 'شركة الفنار للتجارة والمقاولات',
        clientRole: 'المدعي',
        opponentName: 'شركة مينا هومز للاستيراد والتصدير',
        caseType: 'تجاري كلي',
        recommendedTimeMinutes: 7,
        judgeStyle: 'يركز على الحسابات والمستندات',
        facts: 'تعاقد الموكل مع المدعى عليها على توريد 15 وحدة تبريد مركزية ومضخات مطابقة للمواصفات الألمانية بقيمة 85,000 د.ك. بعد استلام الدفعة المقدمة 60,000 د.ك، قامت المدعى عليها بتوريد معدات مقلدة وتالفة وغير مطابقة للمواصفات طبقاً لتقرير فحص معتمد صادر من معهد الكويت للأبحاث العلمية، وامتنعت عن الاستبدال أو رد المبالغ المسددة.',
        strengths: [
            'وجود عقد توريد تجاري مبرم وموقع ومحدد المواصفات الفنية بدقة (المادة 196 تجاري)',
            'تقرير معهد الكويت للأبحاث العلمية يثبت العيوب الجوهرية وعدم مطابقة البضاعة',
            'إشعارات وإنذارات رسمية على يد محضر موجهة للمدعى عليها خلال الميعاد القانوني (المادة 268 تجاري)',
            'تحويلات بنكية وإيصالات قبض تثبت استلام المدعى عليها لمبلغ 60,000 د.ك'
        ],
        weaknesses: [
            'المدعى عليها تتمسك بأن مندوب الموكل وقع على إشعار استلام بوليصة الشحن الأولية',
            'تأخر إقامة الدعوى 4 أشهر بعد رفض البضاعة (احتمال الدفع بسقوط الحق بفوات ميعاد الإخطار)',
            'طلب الخصم الاحتياطي بندب خبير هندسي قد يؤجل الفصل في النزاع لعدة أشهر'
        ],
        counterArguments: [
            'دفع الخصم بسقوط حق المشتري بفوات ميعاد فحص البضاعة (المادة 269 تجاري): الرد بأن العيب كان خفياً لا يكشفه الفحص العادي وإنما استلزم فحوصاً معملية متخصصة وأخطر الخصم فور صدور التقرير',
            'تمسك الخصم ببند الإعفاء من المسؤولية: الرد بأن بند الإعفاء يقع باطلاً بطلاناً مطلقاً لثبوت الغش والخطأ الجسيم من المورد طبقاً للمادة 231 من القانون المدني'
        ],
        initialPleading: {
            intro: 'بسم الله الرحمن الرحيم، سيدي الرئيس، حضرات السادة المستشارين الأجلاء أعضاء الهيئة الموقرة:\nيتشرف دفاع شركة الفنار للتجارة والمقاولات بالوقوف أمام عدالتكم اليوم لنبسط نزاعاً قِوامه الأمانة التعاقدية واستقرار المعاملات التجارية التي صانها المشرع الكويتي في قانوني التجارة والمدني.',
            proceduralDefenses: 'في الشكل:\nنلتمس من عدالة المحكمة رفض كافة الدفوع الشكلية المبداة من دفاع المدعى عليها، وعلى رأسها الدفع المبتسر بسقوط الحق، لكون إخطار العيوب الخفية تم خلال الميعاد المنصوص عليه بالمادة 270 تجاري فور ظهور التقرير الفني المعتمد، مما يضحي معه الدفع جديراً بالالتفات عنه.',
            factsAndRebuttal: 'في الوقائع:\nأودعنا بحافظة مستنداتنا العقد التجاري المؤرخ والموقع بين الطرفين، والذي التزمت بموجبه المدعى عليها بتوريد وحدات تبريد مطابقة للمواصفات الألمانية القياسية، إلا أنها نكلت عن التزامها وقامت بتوريد معدات رديئة وغير مطابقة للمواصفات، ولم تكتفِ بذلك بل حازت أموال موكلتنا دون وجه حق، مما أصاب الموكل بأضرار بالغة وتوقف مشاريعه الإنشائية.',
            substantiveGrounds: 'في الدفوع الموضوعية والسند القانوني:\n1. إعمال المادة (196) و(268) من قانون التجارة رقم 68 لسنة 1980 في شأن ضمان البائع لسلامة المبيع ومطابقته للعقد.\n2. إعمال المادة (209) من القانون المدني في شأن فسخ العقد الملزم للجانبين مع التعويض في حال إخلال أحد المتعاقدين بالتزاماته.\n3. تطبيق قضاء محكمة التمييز الكويتية المستقر في الطعن رقم 312/2021 تجاري: "العبرة في فحص المبيع وظهور عيوبه بتعذر كشفها بالفحص الظاهري واشتراط اللجوء للمختبرات المعتمدة، ولا يسري ميعاد السقوط إلا من تاريخ ثبوت العيب الفني رسمياً".',
            finalRequests: 'بناءً عليه، يصمم دفاع الموكل جازماً على الطلبات الختامية الآتية:\nأولاً: الحكم بفسخ عقد التوريد المبرم بين الطرفين لإخلال المدعى عليها الجسيم.\nثانياً: إلزام المدعى عليها بأن تؤدي للمدعي مبلغ 60,000 د.ك المسدد كدفعة مقدمة، مع الفوائد القانونية بواقع 7% سنوياً من تاريخ المطالبة القضائية وحتى تمام السداد عملاً بنص المادة 110 تجاري.\nثالثاً: إلزام المدعى عليها بتعويض جابر للأضرار المادية والأدبية وتفويت الكسب بمبلغ 25,000 د.ك، مع إلزامها بالمصروفات ومقابل أتعاب المحاماة الفعلية.'
        },
        judgeQuestions: [
            {
                id: 'q1',
                question: 'سعادة المحامي، محامي الخصم قدم توقيعاً من مسؤول المستودع لديكم باستلام الشحنة خالية من الملاحظات، كيف تدفعون هذه الحجية؟',
                context: 'سؤال حول حجية إشعار الاستلام والتسليم الأولي للبضاعة',
                suggestedAnswer: 'سيدي الرئيس، الاستلام كان استلاماً مادياً ظاهرياً للطرود المغلفة دون مطابقة كهروميكانيكية، وقد نصت المادة 269 تجاري صراحة على أن العيوب التي لا تكشف بالفحص المعتاد لا يسقط الضمان بشأنها إلا بعد مهلة الفحص الفني، وهو ما أثبته معهد الأبحاث بتقريره المودع.'
            },
            {
                id: 'q2',
                question: 'المدعى عليها طلبت ندب خبير هندسي، هل تعترضون على هذا الطلب الاحتياطي أم تصممون على حجز الدعوى للحكم؟',
                context: 'طلب الخصم ندب خبير هندسي',
                suggestedAnswer: 'سيدي الرئيس، الأوراق كافية ومستنداتنا قاطعة بالتقرير الحكومي المعتمد من معهد الكويت للأبحاث العلمية، ولا نرى وجهاً لإطالة أمد التقاضي، ولكن إن رأت المحكمة الموقرة الاستئناس برأي إدارة الخبراء فإننا نطلب ألا يترتب على ذلك تأخير حق الموكل في حفظ حقه الاحتياطي وسداد الأمانة على عاتق الخصم.'
            },
            {
                id: 'q3',
                question: 'طلبتم فوائد تأخيرية 7%، هل تضمن العقد شرطاً صريحاً بالفوائد أم تستندون لنص القانون؟',
                context: 'الفوائد التأخيرية في المعاملات التجارية',
                suggestedAnswer: 'نستند إلى نص المادة 110 من قانون التجارة الكويتي التي تقضي بسريان الفائدة القانونية بواقع 7% بقوة القانون في الديون التجارية بمجرد المطالبة القضائية الرسمية دون حاجة لاشتراطها تعاقدياً، وفق ما استقرت عليه الهيئة العامة لمحكمة التمييز.'
            }
        ]
    },
    {
        id: 'labor_arbitrary_dismissal',
        title: 'دعوى عمالية بمستحقات نهاية الخدمة والتعويض عن الفصل التعسفي وبدل الإنذار',
        caseNumber: 'LAB-2026-0881',
        court: 'محكمة العاصمة - مجمع المحاكم بالرقعي',
        circuit: 'الدائرة العمالية الكلية ٢',
        clientName: 'م. أحمد فؤاد المنصوري',
        clientRole: 'المدعي',
        opponentName: 'مجموعة الأفق القابضة للخدمات اللوجستية',
        caseType: 'عمالي كلي',
        recommendedTimeMinutes: 5,
        judgeStyle: 'حازم في التوقيت',
        facts: 'عمل الموكل لدى الشركة المدعى عليها لمدة 8 سنوات بصفة مدير تشغيل براتب شامل 1,500 د.ك (أساسي 1,100 د.ك + بدل سكن وانتقال 400 د.ك). فوجئ الموظف بإنهاء خدماته بقرار مفاجئ دون سابق إنذار ودون ارتكاب أي من المخالفات المنصوص عليها بالمادة 41 من قانون العمل، ورفضت الشركة منحه مكافأة نهاية الخدمة بحجة عدم تسليم مشاريع قيد الإنجاز.',
        strengths: [
            'ثبوت علاقة العمل ومدتها (8 سنوات متصلة) وشهادة الراتب وتحويلات بنك بوبيان',
            'عدم وجود أي تحقيق كتابي رسمي مع الموظف يثبت ارتكابه خطأ جسيماً (المادة 41 قانون 6/2010)',
            'استقرار قضاء التمييز على عدم جواز حرمان العامل من مكافأته بحجة العهدة أو تسليم الأعمال'
        ],
        weaknesses: [
            'ادعاء الشركة بوجود خسائر في قطاع التشغيل الذي كان يديره الموظف',
            'النزاع حول احتساب مكافأة نهاية الخدمة على الراتب الأساسي أم الأجر الشامل'
        ],
        counterArguments: [
            'دفع الخصم بانتهاء العقد لسبب مشروع يتمثل في الخسارة التشغيلية: الرد بأن الخسائر التجارية من مخاطر صاحب العمل ولا تعد سبباً تأديبياً مسوغاً للفصل دون تعويض وفق المادة 46 عمالي'
        ],
        initialPleading: {
            intro: 'سيدي الرئيس، عدالة المحكمة الموقرة:\nيمثل دفاع المدعي م. أحمد المنصوري، العامل الكادح الذي أفنى ثماني سنوات من عمره في خدمة المنشأة المدعى عليها، ليُفاجأ بإنهاء جائر لخدماته في لحظة واحدة دون خطأ جناه أو تحقيق سُئل فيه.',
            proceduralDefenses: 'في الشكل:\nأقيمت الدعوى في المواعيد المقررة قانوناً بعد استنفاد شكوى إدارة العمل بلجنة التوفيق والتحكيم العمالي، وجاءت صحيفتها متفقة وأحكام قانون المرافعات وقانون العمل الكويتي رقم 6 لسنة 2010.',
            factsAndRebuttal: 'في الوقائع:\nالمدعي عمل بإخلاص وتفانٍ طيلة ثماني سنوات، ولم يوقع عليه أي جزاء تأديبي. وبتاريخ 2026/02/01 أخطِر شفهياً بالاستغناء عن خدماته فوراً ومنعه من دخول مقر العمل، ومصادرة مستحقاته العمالية، متذرعة بأعذار واهية لم تجد لها سنداً في الأوراق.',
            substantiveGrounds: 'في الدفوع الموضوعية:\n1. استحقاق مكافأة نهاية الخدمة كاملة عملاً بالمادتين 51 و62 من قانون العمل على أساس الأجر الشامل (1,500 د.ك).\n2. التعويض عن الفصل التعسفي سنداً للمادة (46) و(47) بواقع مرتب ما تبقى من العقد وبما يجبر الضرر المعنوي والمهني.\n3. قضاء التمييز المستقر (طعن 140/2018 عمالي): "لا يجوز لرب العمل حبس مكافأة نهاية خدمة العامل لأي ذريعة كانت، لكونها حقاً معيشياً واجتماعياً اكتسبه العامل بقوة القانون".',
            finalRequests: 'لذلك، يلتمس دفاع المدعي الحكم بـ:\nأولاً: إلزام المدعى عليها بأن تؤدي للمدعي مكافأة نهاية الخدمة بواقع 12,000 د.ك محسوبة على الأجر الشامل.\nثانياً: إلزامها ببدل مهلة الإنذار ورصيد الإجازات السنوية غير المستنفدة بواقع 3,200 د.ك.\nثالثاً: التعويض الجابر عن الفصل التعسفي بمبلغ 9,000 د.ك، وشمول الحكم بالنفاذ المعجل بلا كفالة عملاً بالمادة 147 من قانون العمل.'
        },
        judgeQuestions: [
            {
                id: 'q1',
                question: 'دفاع الموكل، الشركة تدعي أن بدل السكن البالغ 400 د.ك هو بدل متغير ومؤقت، لماذا تطالب باحتسابه ضمن وعاء نهاية الخدمة؟',
                context: 'الفرق بين الأجر الأساسي والأجر الشامل',
                suggestedAnswer: 'سيدي الرئيس، تنص المادة 55 من قانون العمل الكويتي والمبادئ المستقرة للتمييز على أن الأجر هو كل ما يتقاضاه العامل بصفة دورية وثابتة لقاء عمله بما فيه المزايا العينية والبدلات، وبدل السكن صُرف شهرياً بصورة مستقرة طوال 8 سنوات دون انقطاع.'
            },
            {
                id: 'q2',
                question: 'هل تم إجراء تسليم وتسلم للعهدة بين الموظف والشركة وفق الإجراءات الإدارية المعتمدة؟',
                context: 'مسألة تسليم العهدة الإدارية',
                suggestedAnswer: 'نعم سيدي الرئيس، الموكل وجه بريداً إلكترونياً رسمياً للرئيس التنفيذي أبدى فيه استعداده التام لعمل محضر التسليم والتسلم، ولكن الشركة هي التي منعته من دخول المبنى، والقانون يمنع استخدام العهدة كذريعة لحبس المستحقات العمالية.'
            }
        ]
    },
    {
        id: 'civil_tort_accident',
        title: 'دعوى تعويض عن المسؤولية التقصيرية عن حادث مروري وأضرار جسدية ومادية',
        caseNumber: 'CIV-2026-0319',
        court: 'محكمة حولي - مجمع محاكم حولي',
        circuit: 'الدائرة المدنية الكلية ٥',
        clientName: 'عبدالعزيز يوسف الشمري',
        clientRole: 'المدعي',
        opponentName: 'شركة النقل السريع وشركة التأمين الوطنية',
        caseType: 'مدني كلي',
        recommendedTimeMinutes: 6,
        judgeStyle: 'متوازن ومستمع',
        facts: 'أثناء قيادة الموكل لمركبته بطريق الملك فهد، اصطدمت به شاحنة نقل ثقيل تابعة للمدعى عليها الأولى ومؤمنة لدى المدعى عليها الثانية نتيجة رعونة السائق وقطعه لإشارة التوقف. نتج عن الحادث إصابة الموكل بكسور استدعت إجراء جراحات دقيقة وتركيب شرائح طبية، وتدمير مركبته بالكامل وثبوت عجز جسدي دائم بنسبة 25%. صدر حكم جزائي نهائي وبات بإدانة سائق الشاحنة.',
        strengths: [
            'صدور حكم جزائي نهائي بات بإدانة التابع بالخطأ المروري (حجية الأمر المقضي جنائياً أمام القضاء المدني وفق المادة 54 إثبات)',
            'تقرير الطب الشرعي النهائي الذي أثبت نسبة العجز المستديم 25%',
            'فواتير العلاج وتقارير التلفيات الكلية للمركبة المعتمدة من المرور'
        ],
        weaknesses: [
            'شركة التأمين تدفع بتحديد سقف التغطية التأمينية وتطالب بإدخال السائق شخصياً',
            'منازعة الخصوم في تقدير قيمة التعويض الأدبي والمطالبة بتخفيضه'
        ],
        counterArguments: [
            'تمسك شركة التأمين بسقف التغطية: الرد بأن التعويض التضامني يسري على المتبوع وشركة التأمين بنص وثيقة التأمين الإجباري وقانون المرور الكويتي'
        ],
        initialPleading: {
            intro: 'سيدي الرئيس، السادة القضاة الأفاضل:\nنقف اليوم طالبين جبر الضرر عن خطأ فادح كاد يودي بحياة الموكل لولا عناية الرحمن، بفعل رعونة واستهتار ثبتت بحكم جزائي بات حاز حجية قطعية لا مراء فيها.',
            proceduralDefenses: 'في الشكل والحجية:\nندفع بالحجية المطلقة للحكم الجزائي رقم 1142/2025 جنح مرور القاضي بإدانة سائق الشاحنة، إذ قررت المادة 54 من قانون الإثبات الكويتي أن للحكم الجنائي الصادر في موضوع الدعوى الجزائية حجية ملزمة أمام المحاكم المدنية فيما يتعلق بوقوع الجريمة وبوصفها القانوني ونسبتها إلى فاعلها.',
            factsAndRebuttal: 'في عناصر المسؤولية وجسامة الضرر:\nالخطأ ثابت بالحكم الجزائي، والضرر المادي جسيم متمثل في إتلاف السيارة وتكاليف العلاج ونسبة العجز الدائم 25% المقررة رسمياً بالطب الشرعي، والضرر الأدبي أبلغ في الألم النفسي والتشوه ومعاناة شاب في مقتبل عمره المهني.',
            substantiveGrounds: 'في السند القانوني:\n1. المادة (227) من القانون المدني: كل خطأ سبب ضرراً للغير يلزم من ارتكبه بالتعويض.\n2. المادة (240) مدني في مسؤولية المتبوع عن أعمال تابعه غير المشروعة.\n3. تطبيق سوابق التمييز في تحديد معايير تقدير التعويض الجابر للكسب الفائت والفرصة الضائعة.',
            finalRequests: 'بناءً عليه، يطلب دفاع المدعي إلزام المدعى عليهما بالتضامن والتضامم بأن يؤديا للمدعي مبلغ 45,000 د.ك تعويضاً مادياً وأدبياً شاملاً، مع الفوائد والمصروفات ومقابل أتعاب المحاماة الفعلية.'
        },
        judgeQuestions: [
            {
                id: 'q1',
                question: 'محامي المدعي، هل استنفد الموكل مطالبات العلاج بالخارج على نفقة الدولة أم أن كافة المبالغ تم سدادها من ماله الخاص؟',
                context: 'إثبات الضرر المالي الفعلي',
                suggestedAnswer: 'سيدي الرئيس، أرفقنا بحافظة مستنداتنا إيصالات المستشفيات والعيادات الخاصة داخل الكويت وفواتير الأجهزة التعويضية المسددة بالكامل من الحساب الشخصي للموكل دون أي دعم حكومي، وشهادة رسمية من إدارة العلاج بالخارج تفيد بعدم شمول حالته بالابتعاث.'
            }
        ]
    }
];

interface CourtHearingSimulatorPanelProps {
    handleTriggerPrint: (title: string, metadata: Record<string, string>, content: string) => void;
    addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
    cases?: LitigationCase[];
}

export const CourtHearingSimulatorPanel: React.FC<CourtHearingSimulatorPanelProps> = ({
    handleTriggerPrint,
    addToast,
    cases = []
}) => {
    // --- Active Sub-View ---
    const [subView, setSubView] = useState<'prep' | 'rehearse' | 'evaluation' | 'history'>('prep');

    // --- Active Case Preset or Custom Case ---
    const [selectedPresetId, setSelectedPresetId] = useState<string>(HEARING_PRESETS[0].id);
    const currentPreset = useMemo(() => {
        return HEARING_PRESETS.find(p => p.id === selectedPresetId) || HEARING_PRESETS[0];
    }, [selectedPresetId]);

    // --- Pleading Draft State ---
    const [pleadingIntro, setPleadingIntro] = useState(currentPreset.initialPleading.intro);
    const [proceduralDefenses, setProceduralDefenses] = useState(currentPreset.initialPleading.proceduralDefenses);
    const [factsAndRebuttal, setFactsAndRebuttal] = useState(currentPreset.initialPleading.factsAndRebuttal);
    const [substantiveGrounds, setSubstantiveGrounds] = useState(currentPreset.initialPleading.substantiveGrounds);
    const [finalRequests, setFinalRequests] = useState(currentPreset.initialPleading.finalRequests);
    
    // Delivery Notes & Tactics
    const [deliveryNotes, setDeliveryNotes] = useState('التركيز على إبراز التقرير الفني المعتمد عند الحديث عن عيوب البضاعة، وخفض نبرة الصوت عند التماس التعويض لإظهار جسامة الضرر.');

    // Update form when preset changes
    useEffect(() => {
        setPleadingIntro(currentPreset.initialPleading.intro);
        setProceduralDefenses(currentPreset.initialPleading.proceduralDefenses);
        setFactsAndRebuttal(currentPreset.initialPleading.factsAndRebuttal);
        setSubstantiveGrounds(currentPreset.initialPleading.substantiveGrounds);
        setFinalRequests(currentPreset.initialPleading.finalRequests);
    }, [currentPreset]);

    // Word Count & Estimated Speaking Time
    const fullPleadingText = useMemo(() => {
        return `${pleadingIntro}\n\n${proceduralDefenses}\n\n${factsAndRebuttal}\n\n${substantiveGrounds}\n\n${finalRequests}`;
    }, [pleadingIntro, proceduralDefenses, factsAndRebuttal, substantiveGrounds, finalRequests]);

    const wordCount = useMemo(() => {
        return fullPleadingText.trim().split(/\s+/).filter(Boolean).length;
    }, [fullPleadingText]);

    // Estimated speech time in minutes (approx 125 words per minute for court Arabic)
    const estimatedMinutes = useMemo(() => {
        return Math.max(1, Math.round(wordCount / 125));
    }, [wordCount]);

    // --- Rehearsal Timer & Mode State ---
    const [allocatedMinutes, setAllocatedMinutes] = useState<number>(currentPreset.recommendedTimeMinutes);
    const [remainingSeconds, setRemainingSeconds] = useState<number>(currentPreset.recommendedTimeMinutes * 60);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const [timerProgress, setTimerProgress] = useState<number>(100);

    // --- Audio Recording State ---
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<any>(null);

    // --- Judge Interruption System ---
    const [activeQuestion, setActiveQuestion] = useState<HearingPreset['judgeQuestions'][0] | null>(null);
    const [showAnswerGuide, setShowAnswerGuide] = useState<boolean>(false);
    const [lawyerSpokenResponse, setLawyerSpokenResponse] = useState<string>('');

    // --- Evaluation Criteria Sliders (0 - 100) ---
    const [scoreVocalTone, setScoreVocalTone] = useState<number>(85); // نبرة الصوت والإلقاء
    const [scoreTimeManagement, setScoreTimeManagement] = useState<number>(80); // الالتزام بالوقت
    const [scoreLogicalFlow, setScoreLogicalFlow] = useState<number>(90); // ترتيب الدفوع وتسلسلها
    const [scoreLegalGrounding, setScoreLegalGrounding] = useState<number>(95); // السند القضائي وقضاء التمييز
    const [scoreSpontaneousResponse, setScoreSpontaneousResponse] = useState<number>(75); // سرعة البديهة والردود

    // Overall Weighted Score
    const overallScore = useMemo(() => {
        return Math.round(
            (scoreVocalTone * 0.20) +
            (scoreTimeManagement * 0.15) +
            (scoreLogicalFlow * 0.20) +
            (scoreLegalGrounding * 0.25) +
            (scoreSpontaneousResponse * 0.20)
        );
    }, [scoreVocalTone, scoreTimeManagement, scoreLogicalFlow, scoreLegalGrounding, scoreSpontaneousResponse]);

    // Performance Notes
    const [lawyerCritiqueNotes, setLawyerCritiqueNotes] = useState<string>(
        'تم تقديم الدفوع الشكلية بسلاسة دون تلعثم. نبرة الصوت عند استعراض المادة 268 تجاري كانت قوية وحازمة. يحتاج المحامي إلى اختصار سرد الوقائع بمقدار دقيقة لتوفير وقت كافٍ لتفنيد رد الخصم على تقرير معهد الأبحاث.'
    );

    // Rehearsal Saved History
    const [rehearsalHistory, setRehearsalHistory] = useState<Array<{
        id: string;
        date: string;
        caseTitle: string;
        score: number;
        durationSeconds: number;
        notes: string;
    }>>([
        {
            id: 'sim-1',
            date: '2026-09-02 11:30',
            caseTitle: 'دعوى مطالبة تجارية بـ 85,000 د.ك',
            score: 84,
            durationSeconds: 385,
            notes: 'تجربة أولية ناجحة، استيفاء عناصر الإخلال العقدي وطلب الفوائد القانونية.'
        }
    ]);

    // Timer Interval Effect
    useEffect(() => {
        let interval: any = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        playGavelSound();
                        addToast({
                            type: 'info',
                            title: 'انتهت المهلة المحددة للمرافعة',
                            message: 'دقت مطرقة القاضي الافتراضية لانتهاء وقت المرافعة الشفهية.'
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Update progress bar
    useEffect(() => {
        const totalSec = allocatedMinutes * 60;
        if (totalSec > 0) {
            setTimerProgress((remainingSeconds / totalSec) * 100);
        }
    }, [remainingSeconds, allocatedMinutes]);

    // Synthesized Court Gavel Sound (Pure Web Audio API, works everywhere without external audio files)
    const playGavelSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // First strike
            createWoodStrike(ctx, 0);
            // Second strike
            createWoodStrike(ctx, 0.25);
        } catch (e) {
            // Audio context not allowed before interaction
        }
    };

    const createWoodStrike = (ctx: AudioContext, startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime + startTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + startTime + 0.15);

        gain.gain.setValueAtTime(0.8, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + 0.16);
    };

    // --- Audio Recording Handlers ---
    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            // Also trigger timer if not running
            if (!isTimerRunning && remainingSeconds > 0) {
                setIsTimerRunning(true);
            }

            addToast({
                type: 'success',
                title: 'بدأ التسجيل الصوتي للمرافعة',
                message: 'الميكروفون نشط الآن لتسجيل مرافعتك الشفهية الحية.'
            });
        } catch (err) {
            addToast({
                type: 'error',
                title: 'تعذر الوصول للميكروفون',
                message: 'يرجى منح إذن الوصول إلى الميكروفون في المتصفح لتسجيل المرافعة.'
            });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            addToast({
                type: 'info',
                title: 'تم إيقاف التسجيل الصوتي',
                message: 'يمكنك الآن الاستماع إلى أدائك الصوتي وتقييم النبرات.'
            });
        }
    };

    const handleResetRehearsal = () => {
        setIsTimerRunning(false);
        setRemainingSeconds(allocatedMinutes * 60);
        if (isRecording) {
            handleStopRecording();
        }
        setRecordedAudioUrl(null);
        setActiveQuestion(null);
        setShowAnswerGuide(false);
        setLawyerSpokenResponse('');
    };

    const handleTriggerJudgeQuestion = () => {
        playGavelSound();
        const randomQ = currentPreset.judgeQuestions[Math.floor(Math.random() * currentPreset.judgeQuestions.length)];
        setActiveQuestion(randomQ);
        setShowAnswerGuide(false);
        setLawyerSpokenResponse('');
        addToast({
            type: 'info',
            title: 'مقاطعة واستجواب من هيئة المحكمة!',
            message: 'طرح القاضي سؤالاً مفاجئاً، استعد للرد المباشر.'
        });
    };

    // Save Rehearsal Session
    const handleSaveRehearsal = () => {
        const newEntry = {
            id: `sim-${Date.now()}`,
            date: new Date().toLocaleString('ar-KW', { dateStyle: 'short', timeStyle: 'short' }),
            caseTitle: currentPreset.title,
            score: overallScore,
            durationSeconds: (allocatedMinutes * 60) - remainingSeconds,
            notes: lawyerCritiqueNotes
        };
        setRehearsalHistory([newEntry, ...rehearsalHistory]);
        addToast({
            type: 'success',
            title: 'تم حفظ سجل المحاكاة بنجاح',
            message: 'تمت أرشفة جلسة المرافعة وملاحظات الأداء في السجل التاريخي.'
        });
    };

    // Format Seconds to MM:SS
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Print Official Rehearsal Audit Card
    const handlePrintEvaluation = () => {
        const metadata = {
            'رقم الدعوى': currentPreset.caseNumber,
            'المحكمة والدائرة': `${currentPreset.court} - ${currentPreset.circuit}`,
            'صفة التمثيل': `${currentPreset.clientRole} (${currentPreset.clientName})`,
            'الخصم المقابل': currentPreset.opponentName,
            'درجة تقييم المرافعة': `${overallScore} من 100%`,
            'المدة المستغرقة': `${Math.floor(((allocatedMinutes * 60) - remainingSeconds) / 60)} دقيقة و ${((allocatedMinutes * 60) - remainingSeconds) % 60} ثانية`,
            'تاريخ المحاكاة': new Date().toLocaleDateString('ar-KW')
        };

        const content = `
بطاقة تدقيق وتقييم مرافعة شفهية معتمدة
مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية

أولاً: ملخص القضية وموضوع المرافعة:
${currentPreset.facts}

ثانياً: نص المرافعة الشفهية المجهزة:
- الديباجة والمقدمة:
${pleadingIntro}

- الدفوع الشكلية:
${proceduralDefenses}

- الوقائع وتفنيد مزاعم الخصم:
${factsAndRebuttal}

- الدفوع الموضوعية والسند القانوني:
${substantiveGrounds}

- الطلبات الختامية:
${finalRequests}

ثالثاً: معايير تقييم الأداء والملاحظات:
1. نبرة الصوت وقوة الإلقاء: ${scoreVocalTone}%
2. إدارة الوقت والالتزام بالمهلة القضائية: ${scoreTimeManagement}%
3. ترتيب الدفوع وتسلسلها المنطقي: ${scoreLogicalFlow}%
4. السند القانوني وأحكام محكمة التمييز: ${scoreLegalGrounding}%
5. سرعة البديهة والرد على استجواب القاضي: ${scoreSpontaneousResponse}%
المعدل العام التراكمي: ${overallScore}%

ملاحظات وتوصيات المدرب والمستشار القانوني:
${lawyerCritiqueNotes}

رابعاً: نقاط القوة ونقاط الضعف المحددة بالقضية:
- نقاط القوة:
${currentPreset.strengths.map(s => `  • ${s}`).join('\n')}

- نقاط الضعف والثغرات المحتملة:
${currentPreset.weaknesses.map(w => `  • ${w}`).join('\n')}

- خطة التصدي لحجج الخصم:
${currentPreset.counterArguments.map(c => `  • ${c}`).join('\n')}
        `;

        handleTriggerPrint('بطاقة تقييم وتجهيز المرافعة الشفهية الرسمية', metadata, content);
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl border border-teal-800/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                            <Gavel className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-white tracking-wide">
                                    محاكي الجلسات القضائية والمرافعة الشفهية
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    تجهيز وتدريب وتطوير
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                                منصة المحامين لمحاكاة أجواء قاعات المحاكم الكويتية، تجهيز المرافعة شفهياً، اختبار التوقيت، تسجيل الصوت وتقييم نقاط القوة والضعف ومباغتات القضاة.
                            </p>
                        </div>
                    </div>

                    {/* Quick Mode Switcher */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
                        <button
                            type="button"
                            onClick={() => setSubView('prep')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                subView === 'prep'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>1. تجهيز المرافعة</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSubView('rehearse')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                subView === 'rehearse'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                        >
                            <Mic className="w-3.5 h-3.5" />
                            <span>2. تجربة المرافعة شفهياً</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSubView('evaluation')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                subView === 'evaluation'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                        >
                            <Scale className="w-3.5 h-3.5" />
                            <span>3. تقييم الأداء ونقاط القوة</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSubView('history')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                subView === 'history'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                        >
                            <Award className="w-3.5 h-3.5" />
                            <span>4. أرشيف التدريب ({rehearsalHistory.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Case Selection Strip */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                    <Scale className="w-4 h-4 text-amber-500" />
                    <span>اختيار القضية المنظورة للمحاكاة:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {HEARING_PRESETS.map(preset => {
                        const isSelected = preset.id === selectedPresetId;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => setSelectedPresetId(preset.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-right flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-teal-900 text-white border-amber-400 shadow-sm ring-1 ring-amber-400'
                                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span className="truncate max-w-[220px]">{preset.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Case Context Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">رقم القضية والمحكمة</span>
                        <p className="font-bold text-slate-800 dark:text-white font-mono">{currentPreset.caseNumber}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{currentPreset.court} ({currentPreset.circuit})</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">الموكل والصفة القضائية</span>
                        <p className="font-bold text-slate-800 dark:text-white">{currentPreset.clientName}</p>
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">يمثل: {currentPreset.clientRole}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">الخصم ونمط الهيئة القضائية</span>
                        <p className="font-bold text-slate-800 dark:text-white">{currentPreset.opponentName}</p>
                        <p className="text-[11px] text-amber-600 font-bold mt-0.5">طبيعة الهيئة: {currentPreset.judgeStyle}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase block">توقيت المرافعة والكلمات</span>
                        <div className="flex items-center justify-between mt-1">
                            <span className="font-black text-amber-600 dark:text-amber-400">{wordCount} كلمة</span>
                            <span className="text-slate-500 font-bold">~ {estimatedMinutes} دقيقة إلقاء</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SUBVIEW 1: PLEADING PREPARATION --- */}
            {subView === 'prep' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 8 Cols: Structured Pleading Sections */}
                    <div className="lg:col-span-8 space-y-5">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                    <h3 className="font-black text-base text-slate-800 dark:text-white">
                                        هيكلة وصياغة المرافعة الشفهية المعتمدة
                                    </h3>
                                </div>
                                <span className="text-xs text-slate-400 font-bold">
                                    الأصول الخمسة للمرافعة أمام المحاكم الكويتية
                                </span>
                            </div>

                            {/* Section 1: Intro */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                                        الديباجة والمقدمة الرسمية
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">نبرة وقورة ورصينة</span>
                                </div>
                                <textarea
                                    rows={3}
                                    value={pleadingIntro}
                                    onChange={(e) => setPleadingIntro(e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed"
                                    placeholder="اكتب الديباجة وافتتاحية الوقوف أمام هيئة المحكمة..."
                                />
                            </div>

                            {/* Section 2: Procedural Defenses */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
                                        الدفوع الشكلية الأولية (Procedural Defenses)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">أسبقية الدفوع الشكلية قبل الخوض في الموضوع</span>
                                </div>
                                <textarea
                                    rows={3}
                                    value={proceduralDefenses}
                                    onChange={(e) => setProceduralDefenses(e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed"
                                    placeholder="الدفوع بعدم الاختصاص، عدم قبول الدعوى لرفعها من غير ذي صفة، التقادم، بطلان الإعلان..."
                                />
                            </div>

                            {/* Section 3: Facts & Rebuttal */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                                        سرد الوقائع المادية وتفنيد مزاعم الخصم
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">تسلسل زمني مقنع وربط بحافظة المستندات</span>
                                </div>
                                <textarea
                                    rows={4}
                                    value={factsAndRebuttal}
                                    onChange={(e) => setFactsAndRebuttal(e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed"
                                    placeholder="تسلسل الوقائع، إثبات الإخلال، إبراز تناقض دفاع الخصم..."
                                />
                            </div>

                            {/* Section 4: Substantive Grounds */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">4</span>
                                        الدفوع الموضوعية وقضاء محكمة التمييز
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">النصوص التشريعية والمبادئ القضائية الحديثة</span>
                                </div>
                                <textarea
                                    rows={4}
                                    value={substantiveGrounds}
                                    onChange={(e) => setSubstantiveGrounds(e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed"
                                    placeholder="المواد المطبقة، قضاء محكمة التمييز الكويتي، تفنيد شروط المسؤولية..."
                                />
                            </div>

                            {/* Section 5: Final Requests */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">5</span>
                                        الطلبات الختامية الجازمة (الأصلية والاحتياطية)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">صياغة حاسمة وواضحة الأثر</span>
                                </div>
                                <textarea
                                    rows={3}
                                    value={finalRequests}
                                    onChange={(e) => setFinalRequests(e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed"
                                    placeholder="أولاً في الشكل، ثانياً في الموضوع، الفوائد القانونية 7%، المصروفات والأتعاب الفعلية..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubView('rehearse');
                                        addToast({
                                            type: 'success',
                                            title: 'تم اعتماد مسودة المرافعة',
                                            message: 'تم الانتقال إلى قاعة تجربة المرافعة شفهياً.'
                                        });
                                    }}
                                    className="px-6 py-3 rounded-2xl bg-teal-800 hover:bg-teal-700 text-white font-black text-xs transition-all flex items-center gap-2 shadow-md shadow-teal-900/20"
                                >
                                    <span>الانتقال لتجربة المرافعة شفهياً</span>
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right 4 Cols: Tactics & SWOT Preview */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Tactics & Delivery Notes */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                            <h4 className="font-black text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-amber-500" />
                                توجيهات الأداء والتكتيك الشفهي
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                سجل ملاحظاتك التكتيكية لنبرة الصوت، الأماكن التي تتطلب التوقف أو رفع النبرة، والمستندات التي ستشير إليها بيدك.
                            </p>
                            <textarea
                                rows={4}
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                className="w-full p-3 rounded-2xl bg-amber-50/50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed"
                            />
                        </div>

                        {/* Strengths Preview */}
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 space-y-2.5">
                            <h4 className="font-black text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                                نقاط القوة المعتمدة بالقضية
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                {currentPreset.strengths.map((st, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-[11px] leading-relaxed">{st}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses Preview */}
                        <div className="bg-rose-50/60 dark:bg-rose-950/20 p-5 rounded-3xl border border-rose-200 dark:border-rose-800/40 space-y-2.5">
                            <h4 className="font-black text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                                <ThumbsDown className="w-4 h-4 text-rose-600" />
                                الثغرات المحتملة وتأهب الخصم
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                {currentPreset.weaknesses.map((wk, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-[11px] leading-relaxed">{wk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUBVIEW 2: ORAL REHEARSAL ROOM (قاعة تجربة المرافعة) --- */}
            {subView === 'rehearse' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 5 Cols: Rehearsal Cockpit & Audio Controls */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Court Timer & Acoustic Controls */}
                        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 text-center relative overflow-hidden">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="flex items-center gap-1.5 font-bold">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    مؤقت المرافعة الشفهية
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px]">المهلة:</span>
                                    <select
                                        value={allocatedMinutes}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setAllocatedMinutes(val);
                                            setRemainingSeconds(val * 60);
                                        }}
                                        disabled={isTimerRunning}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-300 focus:outline-none"
                                    >
                                        <option value={3}>3 دقائق</option>
                                        <option value={5}>5 دقائق</option>
                                        <option value={7}>7 دقائق</option>
                                        <option value={10}>10 دقائق</option>
                                        <option value={15}>15 دقيقة</option>
                                    </select>
                                </div>
                            </div>

                            {/* Digital Countdown Display */}
                            <div className="py-2">
                                <div className={`text-6xl font-black font-mono tracking-wider transition-colors ${
                                    remainingSeconds <= 60 
                                        ? 'text-rose-500 animate-pulse' 
                                        : remainingSeconds <= 180 
                                            ? 'text-amber-400' 
                                            : 'text-emerald-400'
                                }`}>
                                    {formatTime(remainingSeconds)}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2 font-bold">
                                    {remainingSeconds === 0 
                                        ? 'انتهى الوقت المسموح به!' 
                                        : isTimerRunning 
                                            ? 'المرافعة جارية الآن...' 
                                            : 'جاهز للبدء'}
                                </p>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        remainingSeconds <= 60 
                                            ? 'bg-rose-500' 
                                            : remainingSeconds <= 180 
                                                ? 'bg-amber-400' 
                                                : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${timerProgress}%` }}
                                />
                            </div>

                            {/* Timer Action Buttons */}
                            <div className="flex items-center justify-center gap-3 pt-2">
                                {!isTimerRunning ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsTimerRunning(true)}
                                        className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                                    >
                                        <Play className="w-4 h-4 fill-white" />
                                        <span>بدء التوقيت</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsTimerRunning(false)}
                                        className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer"
                                    >
                                        <Pause className="w-4 h-4" />
                                        <span>إيقاف مؤقت</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleResetRehearsal}
                                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                    title="إعادة تعيين المؤقت"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={playGavelSound}
                                    className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                                    title="طرق مطرقة القاضي الافتراضية"
                                >
                                    <Gavel className="w-4 h-4" />
                                    <span>مطرقة القاضي</span>
                                </button>
                            </div>
                        </div>

                        {/* Live Voice Recording System */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black text-xs text-slate-800 dark:text-white flex items-center gap-2">
                                    <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                                    التسجيل الصوتي المباشر للمرافعة
                                </h4>
                                {isRecording && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold animate-pulse">
                                        تسجيل حي: {formatTime(recordingDuration)}
                                    </span>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                                {!isRecording ? (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-500">
                                            اضغط على زر التسجيل وترافع بصوتك لتسجيل نبرات الإلقاء ومراجعتها لاحقاً.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleStartRecording}
                                            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center gap-2 mx-auto shadow-md shadow-rose-600/30 cursor-pointer"
                                        >
                                            <Mic className="w-4 h-4" />
                                            <span>بدء التسجيل الصوتي</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Simulated Audio Wave Visualizer */}
                                        <div className="flex items-center justify-center gap-1 h-8">
                                            {[18, 35, 60, 80, 45, 90, 70, 40, 65, 85, 30, 75, 55, 95, 40, 20].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 bg-rose-500 rounded-full animate-pulse"
                                                    style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleStopRecording}
                                            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center gap-2 mx-auto shadow-md cursor-pointer"
                                        >
                                            <Square className="w-4 h-4 fill-white" />
                                            <span>إيقاف وحفظ التسجيل</span>
                                        </button>
                                    </div>
                                )}

                                {/* Audio Playback if recorded */}
                                {recordedAudioUrl && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            <span>استمع إلى أدائك الصوتي:</span>
                                            <a
                                                href={recordedAudioUrl}
                                                download={`pleading-${currentPreset.caseNumber}.webm`}
                                                className="text-teal-600 hover:underline flex items-center gap-1"
                                            >
                                                <Download className="w-3 h-3" />
                                                تحميل التسجيل
                                            </a>
                                        </div>
                                        <audio 
                                            controls 
                                            src={recordedAudioUrl} 
                                            className="w-full h-9 rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Virtual Judge Inquiries (اختبار سرعة البديهة ومباغتات القاضي) */}
                        <div className="bg-amber-50/70 dark:bg-slate-900 p-5 rounded-3xl border border-amber-200 dark:border-slate-800 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-amber-600" />
                                    مباغتات واستجوابات هيئة المحكمة
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleTriggerJudgeQuestion}
                                    className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                    <Gavel className="w-3 h-3" />
                                    <span>طرح سؤال مفاجئ</span>
                                </button>
                            </div>

                            {activeQuestion ? (
                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 space-y-3 animate-fadeIn">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 text-xs">
                                            ق
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed">
                                                "{activeQuestion.question}"
                                            </p>
                                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mt-1">
                                                سياق الاستفسار: {activeQuestion.context}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                            إجابة المحامي المباشرة (سجل ما أجبت به شفهياً):
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={lawyerSpokenResponse}
                                            onChange={(e) => setLawyerSpokenResponse(e.target.value)}
                                            placeholder="اكتب خلاصة إجابتك الفورية لتقييمها لاحقاً..."
                                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowAnswerGuide(!showAnswerGuide)}
                                            className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
                                        >
                                            <HelpCircle className="w-3.5 h-3.5" />
                                            {showAnswerGuide ? 'إخفاء الدليل الاسترشادي للرد' : 'عرض الدليل الاسترشادي للرد الأمثل'}
                                        </button>
                                    </div>

                                    {showAnswerGuide && (
                                        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 leading-relaxed font-sans">
                                            <strong>الرد الاستراتيجي المقترح:</strong> {activeQuestion.suggestedAnswer}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 text-center py-4">
                                    اضغط على زر "طرح سؤال مفاجئ" لمحاكاة اعتراض الخصم أو استفسار رئيس الدائرة أثناء مرافعتك.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right 7 Cols: Teleprompter / Pleading Text Viewer */}
                    <div className="lg:col-span-7 space-y-5">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-amber-500" />
                                    <h3 className="font-black text-base text-slate-800 dark:text-white">
                                        منصة إلقاء المرافعة (Teleprompter Mode)
                                    </h3>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">
                                    {wordCount} كلمة | {estimatedMinutes} دقائق تقديرية
                                </span>
                            </div>

                            {/* Pleading Flow Cards */}
                            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                                {/* 1. Intro */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block mb-1">
                                        1. الديباجة والمقدمة
                                    </span>
                                    <p className="text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line">
                                        {pleadingIntro}
                                    </p>
                                </div>

                                {/* 2. Procedural */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block mb-1">
                                        2. الدفوع الشكلية الأولية
                                    </span>
                                    <p className="text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line">
                                        {proceduralDefenses}
                                    </p>
                                </div>

                                {/* 3. Facts */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block mb-1">
                                        3. الوقائع وتفنيد مزاعم الخصم
                                    </span>
                                    <p className="text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line">
                                        {factsAndRebuttal}
                                    </p>
                                </div>

                                {/* 4. Substantive */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block mb-1">
                                        4. الدفوع الموضوعية وأحكام التمييز
                                    </span>
                                    <p className="text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line">
                                        {substantiveGrounds}
                                    </p>
                                </div>

                                {/* 5. Final Requests */}
                                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                                    <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block mb-1">
                                        5. الطلبات الختامية الجازمة
                                    </span>
                                    <p className="text-sm font-serif font-bold leading-relaxed text-slate-900 dark:text-amber-100 whitespace-pre-line">
                                        {finalRequests}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400 font-bold">
                                    أكملت المرافعة الشفهية؟ انتقل إلى مرحلة تقييم الأداء ونقاط القوة والضعف
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsTimerRunning(false);
                                        setSubView('evaluation');
                                    }}
                                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                                >
                                    <span>تسجيل تقييم الأداء</span>
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUBVIEW 3: PERFORMANCE EVALUATION & SWOT ANALYSIS --- */}
            {subView === 'evaluation' && (
                <div className="space-y-6">
                    {/* Overall Score Header Banner */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex items-center justify-center font-mono font-black text-3xl text-amber-400">
                                    {overallScore}%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">
                                    المعدل العام لأداء المرافعة الشفهية
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    {overallScore >= 90
                                        ? 'أداء متميز واستثنائي - جاهزية تامة للمثول أمام هيئة المحكمة الكلية'
                                        : overallScore >= 75
                                            ? 'أداء جيد جداً مع بعض الملاحظات التكتيكية على إدارة الوقت'
                                            : 'بحاجة إلى مزيد من التدريب على سرعة الرد وترتيب الدفوع الموضوعية'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSaveRehearsal}
                                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>حفظ الجلسة في الأرشيف</span>
                            </button>

                            <button
                                type="button"
                                onClick={handlePrintEvaluation}
                                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>طباعة صك تقييم المرافعة</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left 6 Cols: 5 Evaluation Rubrics */}
                        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                                    معايير قياس الأداء الشفهي (Rubric Metrics)
                                </h4>
                                <span className="text-[10px] text-slate-400 font-bold">تحريك المؤشرات للتقييم</span>
                            </div>

                            {/* Metric 1: Tone & Confidence */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-slate-800 dark:text-slate-200">1. نبرة الصوت وقوة الإلقاء والاتزان (20%)</span>
                                    <span className="font-mono font-black text-amber-600">{scoreVocalTone}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scoreVocalTone}
                                    onChange={(e) => setScoreVocalTone(Number(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>متردد / صوت منخفض</span>
                                    <span>واثق / نبرات توكيد واضحة</span>
                                </div>
                            </div>

                            {/* Metric 2: Time Management */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-slate-800 dark:text-slate-200">2. إدارة الوقت والالتزام بالمهلة القضائية (15%)</span>
                                    <span className="font-mono font-black text-amber-600">{scoreTimeManagement}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scoreTimeManagement}
                                    onChange={(e) => setScoreTimeManagement(Number(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>إطالة وتجاوز الوقت</span>
                                    <span>انضباط دقيق ضمن المهلة</span>
                                </div>
                            </div>

                            {/* Metric 3: Logical Flow */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-slate-800 dark:text-slate-200">3. ترتيب الدفوع وتسلسلها المنطقي (20%)</span>
                                    <span className="font-mono font-black text-amber-600">{scoreLogicalFlow}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scoreLogicalFlow}
                                    onChange={(e) => setScoreLogicalFlow(Number(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>تشتت وعدم ترابط</span>
                                    <span>تسلسل فقهي محكم</span>
                                </div>
                            </div>

                            {/* Metric 4: Legal Grounding */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-slate-800 dark:text-slate-200">4. السند القانوني وأحكام محكمة التمييز (25%)</span>
                                    <span className="font-mono font-black text-amber-600">{scoreLegalGrounding}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scoreLegalGrounding}
                                    onChange={(e) => setScoreLegalGrounding(Number(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>استناد عام دون نصوص</span>
                                    <span>تأصيل قانوني وسوابق تمييز</span>
                                </div>
                            </div>

                            {/* Metric 5: Spontaneous Resilience */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-slate-800 dark:text-slate-200">5. سرعة البديهة والرد على استجواب القاضي والخصم (20%)</span>
                                    <span className="font-mono font-black text-amber-600">{scoreSpontaneousResponse}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scoreSpontaneousResponse}
                                    onChange={(e) => setScoreSpontaneousResponse(Number(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>ارتباك وعجز عن الرد</span>
                                    <span>حضور ذهني وردود حاسمة</span>
                                </div>
                            </div>

                            {/* Qualitative Critique Notes */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                                    ملاحظات الأداء التفصيلية للمستشار (Performance Feedback & Notes):
                                </label>
                                <textarea
                                    rows={3}
                                    value={lawyerCritiqueNotes}
                                    onChange={(e) => setLawyerCritiqueNotes(e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-400"
                                    placeholder="دون ملاحظاتك حول نقاط الإخفاق والنجاح في هذه الجلسة..."
                                />
                            </div>
                        </div>

                        {/* Right 6 Cols: Case Strengths & Weaknesses (SWOT Evaluation) */}
                        <div className="lg:col-span-6 space-y-5">
                            {/* Strengths Card */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                                        نقاط القوة التنافسية بالدعوى (Case Strengths)
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 font-bold">
                                        حجج قاطعة
                                    </span>
                                </div>
                                <div className="space-y-2 text-xs">
                                    {currentPreset.strengths.map((st, idx) => (
                                        <div key={idx} className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-2.5">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{st}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weaknesses Card */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                                        <ThumbsDown className="w-4 h-4 text-rose-600" />
                                        نقاط الضعف والثغرات التي قد يستغلها الخصم
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 font-bold">
                                        ثغرات تتطلب تحوطاً
                                    </span>
                                </div>
                                <div className="space-y-2 text-xs">
                                    {currentPreset.weaknesses.map((wk, idx) => (
                                        <div key={idx} className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/30 flex items-start gap-2.5">
                                            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{wk}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Counter-Defense Strategy */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <h4 className="font-black text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-teal-600" />
                                    استراتيجية التصدي لدفاع الخصم والردود المعجزة
                                </h4>
                                <div className="space-y-2 text-xs">
                                    {currentPreset.counterArguments.map((ca, idx) => (
                                        <div key={idx} className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-800/30 text-slate-800 dark:text-slate-200 leading-relaxed">
                                            {ca}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUBVIEW 4: REHEARSAL HISTORY ARCHIVE --- */}
            {subView === 'history' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h3 className="font-black text-base text-slate-800 dark:text-white">
                                أرشيف وسجل جلسات المحاكاة والتدريب السابقة
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">
                            متابعة تطور الأداء والجاهزية القضائية
                        </span>
                    </div>

                    {rehearsalHistory.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-8">
                            لا توجد جلسات محاكاة محفوظة حتى الآن. قم بتجربة مرافعة وحفظها من شاشة التقييم.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <th className="p-3 font-black text-slate-700 dark:text-slate-200">التاريخ والوقت</th>
                                        <th className="p-3 font-black text-slate-700 dark:text-slate-200">عنوان القضية</th>
                                        <th className="p-3 font-black text-slate-700 dark:text-slate-200">المدة الفعلية</th>
                                        <th className="p-3 font-black text-slate-700 dark:text-slate-200">معدل التقييم</th>
                                        <th className="p-3 font-black text-slate-700 dark:text-slate-200">الملاحظات المسجلة</th>
                                        <th className="p-3 font-black text-slate-700 dark:text-slate-200 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rehearsalHistory.map(item => (
                                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-3 font-mono font-bold text-slate-600 dark:text-slate-300">{item.date}</td>
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">{item.caseTitle}</td>
                                            <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{formatTime(item.durationSeconds)} دقيقة</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 rounded-xl font-bold font-mono text-xs ${
                                                    item.score >= 85
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : item.score >= 70
                                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                                                }`}>
                                                    {item.score}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300 max-w-[300px] truncate" title={item.notes}>
                                                {item.notes}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={handlePrintEvaluation}
                                                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                                    title="طباعة بطاقة تقييم هذه الجلسة"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
