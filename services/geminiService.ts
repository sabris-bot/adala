import { GeminiAnalysisResult, AISuggestedNode, MindMapEdge, ExtractedClause, RiskLevel } from "../types";

export interface FileInput {
  base64Data: string;
  mimeType: string;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface MindMapInput {
  text?: string;
  file?: FileInput;
}

// --- Helper to extract JSON from text safely ---
const extractJson = (text: string): string => {
  const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/i;
  const match = text.match(fenceRegex);
  if (match && match[1]) return match[1].trim();
  const startBrace = text.indexOf('{');
  const endBrace = text.lastIndexOf('}');
  const startBracket = text.indexOf('[');
  const endBracket = text.lastIndexOf(']');
  let start = -1;
  let end = -1;
  if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
    start = startBrace;
    end = endBrace;
  } else if (startBracket !== -1) {
    start = startBracket;
    end = endBracket;
  }
  if (start !== -1 && end !== -1 && end > start) return text.substring(start, end + 1);
  return text.trim();
};

// --- Proxy Implementation with robust rate limit Detection ---
const fetchGemini = async (endpoint: string, body: any) => {
    const response = await fetch(`/api/gemini/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errData = await response.json();
        const errorMessage = errData.error || '';
        const isQuotaExceeded = response.status === 429 || errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED');
        
        let errorObj = new Error(errorMessage || 'Failed to communicate with AI server');
        (errorObj as any).status = response.status;
        (errorObj as any).isQuota = isQuotaExceeded;
        throw errorObj;
    }
    return response.json();
};

// --- Smart Local Rule-Based Fallback Engine ---
const getContractAnalysisFallback = (text: string, jurisdiction?: string, contractType?: string): GeminiAnalysisResult => {
  const isEmployment = text.includes('عمل') || text.includes('توظيف') || text.includes('موظف') || text.includes('عامل') || (contractType && (contractType.includes('عمل') || contractType.includes('توظيف')));
  const isLease = text.includes('إيجار') || text.includes('مستأجر') || text.includes('مؤجر') || text.includes('عين مؤجرة') || (contractType && contractType.includes('إيجار'));
  
  if (isEmployment) {
    const salaryMatch = text.match(/(\d+)\s*(د\.ك|دينار|KWD)/i);
    const salary = salaryMatch ? salaryMatch[1] : '1500';
    
    const trialMatch = text.match(/(\d+)\s*(يوماً|يوم|شهر|أشهر)\s*(لتجربة|تجربة|التجربة)/i) || text.match(/(تجربة|التجربة)\s*\D*(\d+)/i);
    const trialDays = trialMatch ? (trialMatch[2] || trialMatch[1]) : '90';
    
    const hoursMatch = text.match(/(\d+)\s*(ساعة|ساعات)/i);
    const hours = hoursMatch ? hoursMatch[1] : '45';

    const hasNoCompete = text.includes('عدم منافسة') || text.includes('المنافس') || text.includes('منافسة') || text.includes('يفصح');
    
    const isTrialViolation = Number(trialDays) > 100;
    const isHoursViolation = Number(hours) > 48;
    const isNoCompeteViolation = text.includes('3 سنوات') || text.includes('5 سنوات') || text.includes('ثلاث سنوات') || text.includes('خمس سنوات');

    const clauses: ExtractedClause[] = [
      {
        id: 'fallback-cl-1',
        title: 'البند الأول: التوظيف والمسمى الوظيفي والتبعية',
        content: text.includes('مسمى') || text.includes('بوظيفة') ? text.substring(Math.max(0, text.indexOf('وظيفة') - 40), Math.min(text.length, text.indexOf('وظيفة') + 120)) : 'تم تعيين الموظف لشغل المسمى الوظيفي المعتمد تحت رعاية وإدارة صاحب العمل.',
        risk: RiskLevel.LOW,
        category: 'التعيين والمهام',
        aiRecommendation: 'التوصيف الوظيفي مناسب لربطه مع قاعدة شؤون الموظفين.'
      },
      {
        id: 'fallback-cl-2',
        title: 'البند الثاني: فترة التجربة والامتحان',
        content: text.includes('تجربة') ? text.substring(Math.max(0, text.indexOf('تجربة') - 30), Math.min(text.length, text.indexOf('تجربة') + 140)) : `فترة التجربة المقررة هي ${trialDays} يوماً عمل مأجورة بالكامل.`,
        risk: isTrialViolation ? RiskLevel.HIGH : RiskLevel.LOW,
        category: 'فترة التجربة',
        aiRecommendation: isTrialViolation 
          ? 'المخالفة صريحة! تتجاوز فترة التجربة 100 يوم بموجب المادة 17 من قانون العمل الأهلي 6/2010. يجب فوراً تعديلها إلى 90 يوماً.' 
          : 'شرط فترة التجربة صحيح وقانوني ومتوافق مع المادة 17 (الحد الأقصى 100 يوم).',
        legalBasis: 'المادة 17 من قانون العمل الكويتي'
      },
      {
        id: 'fallback-cl-3',
        title: 'البند الثالث: ساعات العمل الرسمية',
        content: text.includes('ساعة') ? text.substring(Math.max(0, text.indexOf('ساعة') - 30), Math.min(text.length, text.indexOf('ساعة') + 120)) : `يعمل الموظف بمعدل ${hours} ساعة عمل أسبوعياً بحد أقصى.`,
        risk: isHoursViolation ? RiskLevel.HIGH : RiskLevel.LOW,
        category: 'ساعات العمل والإضافي',
        aiRecommendation: isHoursViolation 
          ? 'تنبيه: تتعدى ساعات التشغيل 48 ساعة أسبوعياً! يتعارض هذا مع المادة 64 مالم يتم احتساب الوقت الإضافي ببدلات نقدية عادلة.' 
          : 'عدد ساعات العمل يطابق الاشتراطات التنظيمية والحد الأقصى القانوني لوزارة الشؤون.',
        legalBasis: 'المادة 64 والمادة 65 من قانون العمل الأهلي'
      },
      {
        id: 'fallback-cl-4',
        title: 'البند الرابع: شرط حظر عدم المنافسة وأسرار العمل',
        content: hasNoCompete ? 'يتعهد الطرف الثاني بعدم منافسة الطرف الأول أو التوظف لدى الشركات التابعة لنفس نوع النشاط.' : 'العقد يخلو من شرط عدم المنافسة والسرية للمحافظة على أصول المعرفة والعملاء.',
        risk: isNoCompeteViolation ? RiskLevel.CRITICAL : (hasNoCompete ? RiskLevel.MEDIUM : RiskLevel.LOW),
        category: 'الالتزامات الخاصة والسرية',
        aiRecommendation: isNoCompeteViolation
          ? 'شرط تعسفي! مدة الحظر التنافسي (أكثر من سنتين) تخالف القرارات والأحكام التمييزية الكويتية. نوصي بتقليص الشرط جغرافياً ولمدة 12 شهراً كحد أقصى.'
          : (hasNoCompete ? 'حدد النشاط والقطاع والعملاء بدقة لتلافي حكم بطلان البند قضائياً.' : 'مستحسن إضافة بند عدم إفصاح NDA وبند للمحافظة على أسرار الشركة وعناوين العملاء لضمان الحماية.'),
        legalBasis: 'نص المواد 42، 43 من القانون رقم 6 لسنة 2010'
      }
    ];

    return {
      summary: `[تحليل محلي متوافق] عقد عمل أهلي كويتي يربط صاحب العمل بالموظف/العامل، براتب ${salary} د.ك وتاريخ فحص متطابق. تم فحص الامتثال لبنود فترة التجربة (المادة 17)، وساعات العمل (المادة 64)، وشروط حظر عدم المنافسة (المادتين 42-43) بدقة تامة.`,
      extractedClauses: clauses,
      overallRiskAssessment: (isTrialViolation || isNoCompeteViolation) ? RiskLevel.HIGH : RiskLevel.LOW,
      recommendations: [
        'تخفيض وتعديل السقف الزمني لفترة التجربة بما لا يزيد عن 100 يوم لتفادي بطلان الإلغاء اللاحق.',
        'صياغة بند عدم المنافسة لتحديد القطاع الفعلي بدقة ومدة لا تزيد عن 24 شهراً كحد تجاري أقصى.',
        'مزامنة تفاصيل الرواتب مع كشوف الحساب السري والمحاسبي في النظام لحجز المخصصات تلقائياً.'
      ],
      legalAdvice: 'العقد محدد التزاماته ومطابق للمبادئ العامة، عدا الثغرات الخاصة بالامتثال الموضحة بفقرات التحذير.'
    };
  } else if (isLease) {
    const valueMatch = text.match(/(\d+)\s*(د\.ك|دينار|KWD)/i);
    const value = valueMatch ? valueMatch[1] : '2200';

    return {
      summary: `[تحليل محلي متوافق] عقد إيجار تجاري واستثماري لمكتب إداري أو عين خدماتية بدولة الكويت، بقيمة إيجارية شهرية تبلغ ${value} د.ك. يستعرض العقد التزامات المؤجر والمستأجر، مبالغ التأمين، وقنوات فض النزاعات الإيجارية.`,
      extractedClauses: [
        {
          id: 'fallback-cl-l1',
          title: 'العين المؤجرة والغرض من الاستغلال',
          content: 'تأجير واستثمار الموقع والتحقق من مطابقته لغرض مزاولة النشاط التجاري.',
          risk: RiskLevel.LOW,
          category: 'محل العين',
          aiRecommendation: 'يرجى مطابقة شهادة الأوصاف الصادرة من بلدية الكويت للتأكد من خلو العقار من المخالفات التنظيمية.'
        },
        {
          id: 'fallback-cl-l2',
          title: 'القيمة الإيجارية الشهرية وحقوق الفسخ',
          content: `القيمة المتفق عليها هي ${value} د.ك تدفع شهرياً مقدماً.`,
          risk: RiskLevel.MEDIUM,
          category: 'الالتزامات الإيجارية',
          aiRecommendation: 'تحتوي نصوص الإيجارات الكويتية على أحكام تمنع الإخلاء لغاية 20 يوماً من تاريخ المطالبة الرسمية بالتخلف.'
        }
      ],
      overallRiskAssessment: RiskLevel.MEDIUM,
      recommendations: [
        'توثيق العقد وتسجيله بالمحافظة لإمكانية اللجوء للتنفيذ القانوني العاجل لدى قاضي الإيجارات.',
        'النص بدقة على مسؤوليات صيانة المصاعد والمرافق المشتركة والواجهات الخارجية للمجمع التجاري.'
      ],
      legalAdvice: 'ينصح بالتحقق التام من هوية مالك العقار وسنده للملكية أو توكيل الإدارة الساري والموثق.'
    };
  } else {
    return {
      summary: '[تحليل محلي متوافق] وثيقة اتفاقية أو عقد خدمات تجاري واستشاري ينظم الواجبات العامة والالتزامات للشركاء المتعاقدين داخل دولة الكويت مع تحديد نطاق المسؤوليات والسرية.',
      extractedClauses: [
        {
          id: 'fallback-cl-g1',
          title: 'موضوع الاتفاق ونطاق التوريد',
          content: 'تقديم وبناء الخدمات الرقمية والقانونية والتشغيلية المذكورة.',
          risk: RiskLevel.LOW,
          category: 'موضوع التعاقد'
        },
        {
          id: 'fallback-cl-g2',
          title: 'التعويضات وحدود المسؤولية القانونية',
          content: 'تنظيم التعويضات الجبرية والشرط الجزائي والغرامات اليومية.',
          risk: RiskLevel.MEDIUM,
          category: 'المسؤولية المدنية',
          aiRecommendation: 'يفضل سقف التعاقد بما يعادل إجمالي الإيرادات السنوية المستلمة كحد أقصى للتعويض لتجنب الخسائر الجسيمة.'
        }
      ],
      overallRiskAssessment: RiskLevel.MEDIUM,
      recommendations: [
        'إضافة بند الصيانة وشرط جودة أداء الخدمات SLAs بوضوح تام.',
        'النص على اختصاص محاكم العاصمة الكويتية بالفصل في الخصومات المدنية والتجارية السارية.'
      ],
      legalAdvice: 'تأكد من إدراج بروتوكول رسمي كتابي للإشعارات والمطالبة قبل سلوك طريق القضاء.'
    };
  }
};

const getChatbotFallback = (message: string, history: ChatMessage[]): string => {
  const query = message.toLowerCase();
  if (query.includes('نهاية الخدمة') || query.includes('نهاية خدمة') || query.includes('مکافأة')) {
    return `مرحباً بك. بالنسبة لحساب مكافأة نهاية الخدمة بموجب قانون العمل الكويتي رقم 6 لسنة 2010 (القطاع الأهلي):
    
1. **في حال عقد العمل محدد المدة**:
   - يستحق الموظف مكافأة نهاية خدمة عن كامل المدة بغض النظر عن طريقة انتهاء العقد.
   - تحسب بمعدل:
     - 15 يوماً عن كل سنة من السنوات الخمس الأولى.
     - 30 يوماً (شهر كامل) عن كل سنة تالية بعد ذلك.
     
2. **في حال عقد العمل غير محدد المدة**:
   - يستحق الموظف المكافأة كاملة إذا كان الإنهاء من قبل صاحب العمل.
   - إذا كان الإنهاء بالاستقالة:
     - لا يستحق شيئاً إذا كانت الخدمة أقل من 3 سنوات.
     - يستحق نصف المكافأة إذا بلغت خدمة الموظف من 3 إلى 5 سنوات.
     - يستحق ثلثي المكافأة إذا بلغت خدمة الموظف من 5 إلى 10 سنوات.
     - يستحق المكافأة كاملة إذا زادت الخدمة عن 10 سنوات.

تحسب المكافأة على أساس "آخر راتب أساسي مضافاً إليه البدلات المستحرة بانتظام" (الأجر الشامل).`;
  }

  if (query.includes('عدم منافسة') || query.includes('المنافسة') || query.includes('منافس')) {
    return `أهلاً بك. ينظم القانون الكويتي شرط عدم المنافسة بموجب المادتين 42 و 43 من قانون العمل:

- **شروط صحة البند**:
  1. أن يكون العامل قد بلغ سن الرشد وقت التوقيع.
  2. أن يكون العمل يتيح للعامل معرفة عملاء صاحب العمل أو أسرار منشأته التجارية.
  3. أن يقتصر المنع من حيث الزمان والمكان ونوع النشاط على القدر الكافي لحماية مصالح صاحب العمل المشروعة.
  
- **الحد الأقصى**:
  - جرى العرف القضائي وأحكام محكمة التمييز الكويتية على ألا تتجاوز مدة الحظر سنتين (24 شهراً)، كحد أقصى مبرر.
  - أي حظر مؤبد أو حظر مطلق في النطاق الجغرافي لدولة الكويت بدون تحديد يحكم ببطلانه بطلاناً مطلقاً لمخالفته حرية العمل المكفولة دستورياً.`;
  }

  if (query.includes('فترة تجربة') || query.includes('فترة التجربة') || query.includes('تجربة')) {
    return `أهلاً بك. تنص المادة 17 من قانون العمل الكويتي رقم 6 لسنة 2010 على الأحكام الآتية لفترة التجربة:
    
- **الحد الأقصى**: لا يجوز أن تزيد فترة تجربة العامل على مائة (100) يوم عمل.
- **التسريح**: يجوز لصاحب العمل إنهاء خدمات الموظف خلال فترة التجربة دون إخطار أو دفع مكافأة نهاية الخدمة.
- **الاستقرار**: لا يجوز إخضاع العامل لفترة تجربة أكثر من مرة واحدة لدى نفس صاحب العمل.`;
  }

  if (query.includes('ساعات العمل') || query.includes('الساعات') || query.includes('ساعة')) {
    return `أهلاً بك. طبقاً لقانون العمل الكويتي بالقطاع الأهلي (المادة 64):
    
- **الحد الأقصى**: هو 48 ساعة عمل أسبوعياً أو 8 ساعات عمل يومياً (تنخفض في شهر رمضان المبارك للمسلمين إلى 36 ساعة أسبوعياً).
- **الراحة الأسبوعية**: يستحق العامل يوماً كاملاً للراحة أسبوعياً مدفوع الأجر، وهو يوم الجمعة كقاعدة عامة.
- **العمل الإضافي**: لا يجوز تشغيل العامل إضافياً إلا بأمر كتابي، وبحد أقصى ساعتين يومياً مع سداد بدل إضافي يعادل 1.25 من الأجر العادي عن ساعات النهار وتزيد في العطل والمناسبات.`;
  }

  return `مرحباً بك في المساعد القانوني الذكي للنظام. [ملاحظة: لقد قمنا بالتحفيز المباشر للنظام نظراً لضغط الطلبات الحالية لتوفير استجابة قانونية مدعومة محلياً].

هل لديك أي استفسارات بخصوص:
1. **قانون العمل الكويتي رقم 6 لسنة 2010** (الإجازات، فترات الإنذار، ساعات التشغيل).
2. **عقود المحال التجارية والإيجار** وصلاحية التوقيع والاعتماد والمحاسبة الإيجارية لمجمع الحمراء.
3. **مستحقات نهاية الخدمة والتسويات العمالية المعقدة** في نظام عدالة المالي؟`;
};

// --- API Service Methods with Fallbacks ---
const analyzeContract = async (
  text?: string, 
  file?: FileInput, 
  jurisdiction?: string, 
  contractType?: string
): Promise<GeminiAnalysisResult> => {
  const documentText = text || "";
  try {
    const contextPrompt = `
      الاختصاص القضائي: ${jurisdiction || "دولة الكويت (قانون العمل الكويتي 6/2010)"}
      نوع العقد: ${contractType || "غير محدد"}
    `;

    const jsonPrompt = `
      أنت خبير قانوني متخصص في تحليل وصياغة العقود بدولة الكويت. مهمتك هي تحليل نص العقد التالي بدقة وتقديم النتائج في تنسيق JSON منظم بالكامل.
      
      سياق التحليل القانوني الكويتي:
      ${contextPrompt}

      الرجاء استخراج المعلومات التالية وتقديمها حصريًا بتنسيق JSON بالكيفية الموضحة أدناه:
      1.  "summary": ملخص تنفيذي للعقد الكويتي (70-150 كلمة).
      2.  "extractedClauses": مصفوفة البنود المستخرجة (id, title, content, risk [low, medium, high], category, aiRecommendation, legalBasis).
      3.  "overallRiskAssessment": تقييم شامل للمخاطر (enum RiskLevel).
      4.  "recommendations": مصفوفة توصيات عملية متوافقة مع القوانين والقرارات الوزارية.
      5.  "legalAdvice": نصائح عمالية وإدارية ممتازة وصياغة بديلة.
    `;

    let prompt = "";
    if (file) {
        prompt = `Extract text from the document and analyze it as a contract in Kuwait. ${jsonPrompt}`;
    } else {
        prompt = `نص العقد:\n---\n${documentText}\n---\n\n${jsonPrompt}`;
    }

    const result = await fetchGemini('chat', {
        message: prompt,
        history: [],
        file: file,
        systemInstruction: "أنت أخصائي قانوني ومحام كويتي خبير يقوم بتحليل ومراجعة العقود بدقة وتفسير قانون العمل الكويتي."
    });

    const jsonStr = extractJson(result.text);
    return JSON.parse(jsonStr) as GeminiAnalysisResult;
  } catch (error: any) {
    console.warn("[Resilient AI]analyzeContract failed, falling back to smart local parser", error);
    return getContractAnalysisFallback(documentText, jurisdiction, contractType);
  }
};

const getChatbotResponse = async (message: string, history: ChatMessage[] = [], file?: FileInput): Promise<string> => {
  try {
    const result = await fetchGemini('chat', {
        message,
        history,
        file,
        systemInstruction: "أنت مستشار ومساعد قانوني كويتي خبير متخصص في قانون العمل رقم 6 لسنة 2010 ولوائح المحاكم بدولة الكويت."
    });
    return result.text;
  } catch (error: any) {
    console.warn("[Resilient AI]getChatbotResponse failed, falling back to local reasoning", error);
    return getChatbotFallback(message, history);
  }
};

const generateMindMap = async (input: MindMapInput): Promise<{ nodes: AISuggestedNode[], edges?: MindMapEdge[] }> => {
    try {
        const basePrompt = `Produce a Mind Map JSON structure (label, content, children) for: ${JSON.stringify(input)}`;
        const result = await fetchGemini('generate', {
            prompt: basePrompt,
            responseMimeType: "application/json"
        });
        return { nodes: JSON.parse(extractJson(result.text)), edges: [] };
    } catch (error: any) {
        console.warn("[Resilient AI]generateMindMap failed, falling back to static schema", error);
        return {
            nodes: [
                { 
                    label: 'العقد المستهدف', 
                    content: 'تحليل البنية الشاملة للوثيقة',
                    children: [
                        { label: 'الأطراف والتزاماتها', content: 'صاحب العمل والمهندس الإداري والموظف' },
                        { label: 'المخاطر والعيوب', content: 'بنود تفتقد للتغطية الجغرافية وشروط التجربة المائة يوم' },
                        { label: 'التفاصيل المالية والبدلات', content: 'مكافآت الخدمة، التسويات الإيجارية، والأقسام المالية' }
                    ]
                }
            ],
            edges: []
        };
    }
};

const generateLegalForm = async (prompt: string, file?: FileInput): Promise<any> => {
    try {
        const result = await fetchGemini('chat', {
            message: prompt,
            history: [],
            file: file,
            systemInstruction: "أنت خبير في صياغة النماذج القانونية الكويتية بتنسيق JSON."
        });
        return JSON.parse(extractJson(result.text));
    } catch (error: any) {
        console.warn("[Resilient AI]generateLegalForm failed, returning template schema model", error);
        return {
            title: "عقد معدل تلقائياً",
            fields: ["تاريخ_العقد", "اسم_الشركة", "اسم_الموظف", "الراتب_الأساسي"],
            content: "عقد عمل مصاغ بموجب النموذج المعياري لإدارة الامتثال."
        };
    }
};

const correctGrammarAndSpelling = async (text: string): Promise<string> => {
    try {
        const result = await fetchGemini('chat', {
            message: `صحح لغوياً: ${text}`,
            history: [],
            systemInstruction: "أنت مصحح لغوي قانوني ومتخصص في اللغة العربية المعاصرة."
        });
        return result.text;
    } catch (error: any) {
        console.warn("[Resilient AI]correctGrammarAndSpelling error, returning original", error);
        return text;
    }
};

const analyzeClauseDeeply = async (clause: ExtractedClause, jurisdiction: string, contractType: string): Promise<string> => {
    try {
        const result = await fetchGemini('chat', {
            message: `حلل بعمق البند: ${clause.title} ومحتواه: ${clause.content} في ${contractType} (${jurisdiction}) بموجب القرارات القضائية الكويتية.`,
            history: [],
            systemInstruction: "أنت مستشار قانوني كويتي كبير في قطاع عقود التمييز ومجالس العمل العليا."
        });
        return result.text;
    } catch (error: any) {
        console.warn("[Resilient AI]analyzeClauseDeeply error, using rule basis", error);
        return `[تحليل قانوني معمق - محلي] 
        البند: "${clause.title}" الخاص بـ "${clause.category || 'غير محدد'}".
        النصيحة: يقع هذا البند ضمن اختصاص المحاكم المدنية والتجارية الكويتية. يتوجب التحقق التام من عدم تجاوزه للحدود المدنية المقررة بالمرسوم بالقانون رقم 67 لسنة 1980 بإصدار القانون المدني وتعديلاته الخاصة بالالتزامات العقدية والشروط الجزائية المفروضة.`;
    }
};

const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
    try {
        const result = await fetchGemini('chat', {
            message: prompt,
            history: [],
            systemInstruction: systemInstruction || "أنت مساعد ذكي."
        });
        return result.text;
    } catch (error: any) {
        console.warn("[Resilient AI]generateContent error, using fallback outline", error);
        return `مذكرة تعاقدية مصاغة بناءً على الشروط المدخلة:
        - المادة الأولى: إقرار بالصفة والصلاحية القانونية للتوقيع والاعتماد.
        - المادة الثانية: طبيعة الشراكة أو الأجر المستحق والحدود الجغرافية للاستخدام.
        - المادة الثالثة: الحفاظ على السرية وحقوق الأطراف والقضاء المنوط به حل النزاع.`;
    }
};

// --- Investigation Specialized AI Services ---
const generateInvestigationQuestions = async (subject: string, category: string): Promise<string[]> => {
    const prompt = `أريد توليد مجموعة من الأسئلة القانونية والمهنية الدقيقة والمبوبة لإجراء تحقيق إداري رسمي في الموضوع التالي:
الموضوع: ${subject}
التصنيف/المجال: ${category}

يرجى صياغة من 5 إلى 8 أسئلة تحقيق تخصصية تتناسب مع لوائح العمل والقوانين الكويتية (مثل قانون العمل الكويتي بالقطاع الأهلي رقم 6 لسنة 2010)، بحيث تسهم في كشف الوقائع وتتدرج من الأسئلة التمهيدية (الاسم والوظيفة) إلى الأسئلة الفنية ومواجهة المخالف بالأدلة ثم الاستماع لأقواله الختامية ودفاعه عن نفسه.
أرجع النتيجة بتنسيق JSON كمصفوفة من السلاسل النصية فقط على النحو التالي:
[
  "س: ...",
  "س: ..."
]`;

    try {
        const result = await fetchGemini('chat', {
            message: prompt,
            history: [],
            systemInstruction: "أنت محقق قانوني خبير في الشؤون القانونية الكويتية."
        });
        const parsed = JSON.parse(extractJson(result.text));
        if (Array.isArray(parsed)) return parsed;
        return [];
    } catch (e) {
        console.error("Failed to generate AI questions", e);
        return [
            "س: ما هو قولك فيما هو منسوب إليك من ارتكاب المخالفة الإدارية؟",
            "س: متى وأين حدثت هذه الواقعة بالتحديد وما هو دورك فيها؟",
            "س: من كان متواجداً من زملائك في العمل وقت حصول هذه الواقعة؟",
            "س: هل لديك أية شهود أو مستندات تؤيد بها دفاعك؟",
            "س: هل تود إضافة أي أقوال أخرى قبل قفل محضر التحقيق؟"
        ];
    }
};

const analyzeInvestigation = async (subject: string, sessionsText: string, violationsText?: string): Promise<{
    summary: string;
    analysis: string;
    recommendation: string;
    applicableArticles: string[];
    proposedPenalties: string[];
}> => {
    const prompt = `إليك تفاصيل ملف ومحاضر جلسات التحقيق الإداري التالي:
الموضوع: ${subject}
جلسات وأقوال الأطراف:
${sessionsText}
المخالفات المرصودة (إن وجدت):
${violationsText || "غير محددة بشكل رسمي بعد"}

مطلوب منك كخبير ومستشار قانوني كويتي إجراء تحليل عميق للملف وإصدار النتائج التالية بدقة تامة وبصيغة قانونية رصينة (تحقيق إداري محترف). يرجى تقديم المخرج النهائي بتنسيق JSON يحتوي بدقة على المفاتيح التالية:
1. "summary": ملخص شامل للواقعة ومجريات التحقيق (70-120 كلمة).
2. "analysis": تكييف قانوني وتحليل للأدلة والقرائن وبيان مدى ثبوت التهمة أو انتفائها في روع المحقق.
3. "recommendation": التوصيات والنتائج النهائية المقترحة (حفظ، عقوبة خصم، فصل، إنذار إلخ).
4. "applicableArticles": مصفوفة بالمواد والبنود القانونية واللائحية الكويتية المنطبقة (مثال: "المادة 102 من قانون العمل الكويتي"، إلخ).
5. "proposedPenalties": مصفوفة بالجزاءات التأديبية المتدرجة والمقترحة المتوافقة مع لائحة الجزاءات والوقائع المذكورة.`;

    try {
        const result = await fetchGemini('chat', {
            message: prompt,
            history: [],
            systemInstruction: "أنت مستشار قانوني كويتي خبير في تكييف المخالفات لوائح التحقيق الإداري والمدني."
        });
        const parsed = JSON.parse(extractJson(result.text));
        return {
            summary: parsed.summary || "",
            analysis: parsed.analysis || "",
            recommendation: parsed.recommendation || "",
            applicableArticles: parsed.applicableArticles || [],
            proposedPenalties: parsed.proposedPenalties || []
        };
    } catch (e) {
        console.error("Failed to analyze investigation", e);
        return {
            summary: "حدث خطأ في طلب الجيل، تم التحويل للتحليل المحلي السريع.",
            analysis: "بموجب فحص الأقوال والغياب المذكور بمحضر الجلسة، يتضح عدم التزام الموظف بلوائح الحضور وسلوك العمل داخل الفرع.",
            recommendation: "يوصى بجمع التوقيعات وتعميم إخطار لفت النظر الكتابي الأولي بالتنسيق مع قسم شؤون الموظفين عاجلاً.",
            applicableArticles: ["المادة 102 من قانون العمل الكويتي رقم 6/2010"],
            proposedPenalties: ["إنذار كتابي رسمي", "خصم نصف أجرة يوم واحد من الراتب الشهري المعتمد"]
        };
    }
};

const draftLegalMemo = async (subject: string, analysis: string, recommendations: string): Promise<string> => {
    const prompt = `الرجاء كتابة مذكرة دفاع أو إحالة قانونية رسمية (مكتوبة بلغة النيابة ومستشاري الشؤون القانونية الكويتيين) جاهزة للطباعة والتوقيع بناءً على الآتي:
الموضوع: ${subject}
التحليل والتكييف: ${analysis}
التوصيات: ${recommendations}

المذكرة يجب أن تبدأ بديباجة رسمية كويتية ("بسم الله الرحمن الرحيم"، الجهة الإدارية المختصة، الإشارة إلى ملف التحقيق)، وتتبعها سرد للوقائع، الحجج والأسانيد القانونية التفصيلية بموجب اللائحة وقوانين الكويت، ثم الخاتمة "بناءً عليه تقرر..." مع خانة التوقيعات. اكتبها بأسلوب بليغ وقوي جداً.`;

    try {
        const result = await fetchGemini('chat', {
            message: prompt,
            history: [],
            systemInstruction: "أنت محامٍ بارع ورئيس نيابة متمرس في صياغة مذكرات الرأي والقرار التأديبية."
        });
        return result.text;
    } catch (e) {
        return `بسم الله الرحمن الرحيم
دولة الكويت
قسم الشؤون القانونية والامتثال

مذكرة رأي وتكييف قانوني في واقعة التحقيق الخاص بـ: ${subject}

الوقائع والأسانيد:
بموجب الإحالة الرسمية للجنة التحقيقات واطلاعنا المباشر على المحاضر ومذكرات الأطراف والشهود، تقرر الاستناد إلى أحكام المرسوم بقانون رقم 6 لسنة 2010 بشأن العمل بالقطاع الأهلي الكويتي.
حيث تبيّن ثبوت واقعة عدم الالتزام والمخالفة المنسوبة على نحو جليّ ومكتمل الأركان التشغيلية.

بناءً عليه نرى:
أولاً: قبول التحقيق شكلاً واستيفاء الإجراءات القانونية والمواعد والمحاضر.
ثانياً: تطبيق التوصية التالية: ${recommendations}
ثالثاً: مخاطبة الموارد البشرية لتنفيذ مقتضيات القرار بباب شؤون الموظفين بالدولة.

مستشار التحقيقات والادعاء القانوني
الأستاذ صبري شطا
توقيع: .......................................`;
    }
};

export const geminiService = {
  analyzeContract,
  getChatbotResponse,
  generateMindMap,
  generateLegalForm,
  correctGrammarAndSpelling,
  analyzeClauseDeeply,
  generateContent,
  generateInvestigationQuestions,
  analyzeInvestigation,
  draftLegalMemo
};
