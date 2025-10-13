import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { GeminiAnalysisResult, RiskLevel, AISuggestedNode, MindMapEdge, Case, ComplianceRequirement } from "../types"; // Added Case & ComplianceRequirement

// Ensure API_KEY is accessed correctly from environment variables
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API Key not found in process.env.API_KEY. AI features will be mocked or disabled.");
}

interface FileInput {
  base64Data: string;
  mimeType: string;
}

// --- Contract Analysis (Now Multimodal) ---
const analyzeContract = async (text?: string, file?: FileInput): Promise<GeminiAnalysisResult> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Returning mock data for contract analysis.");
    const inputText = text || "محتوى من ملف وهمي";
    return Promise.resolve({
      summary: "هذا ملخص وهمي للعقد بسبب عدم توفر مفتاح API. النص الأصلي: " + inputText.substring(0, 100) + "...",
      extractedClauses: [
        { title: "شرط تعويضي وهمي", content: "نص شرط تعويضي وهمي.", risk: RiskLevel.MEDIUM },
        { title: "شرط إنهاء وهمي", content: "نص شرط إنهاء وهمي.", risk: RiskLevel.HIGH },
      ],
      overallRiskAssessment: RiskLevel.MEDIUM,
      recommendations: ["مراجعة شرط الإنهاء.", "التأكد من تفاصيل التعويض."]
    });
  }

  const jsonPrompt = `
    أنت خبير قانوني متخصص في تحليل العقود باللغة العربية. مهمتك هي تحليل نص العقد التالي بدقة وتقديم النتائج في تنسيق JSON منظم.
    التركيز على القانون التجاري والمدني السائد في منطقة الشرق الأوسط، مع مراعاة الفروقات الدقيقة في الصياغة القانونية.

    الرجاء استخراج المعلومات التالية وتقديمها حصريًا بتنسيق JSON بالكيفية الموضحة أدناه:
    1.  "summary": ملخص تنفيذي للعقد (بين 70-150 كلمة)، يبرز أهم جوانب الاتفاقية، الأطراف الرئيسية، والغرض الأساسي من العقد.
    2.  "extractedClauses": مصفوفة تحتوي على أهم البنود والشروط المستخرجة من العقد. يجب أن يشمل كل بند في المصفوفة العناصر التالية:
        *   "title": عنوان وصفي دقيق لل بند (أمثلة: "تحديد الأطراف"، "موضوع العقد"، "مدة العقد وشروط التجديد"، "القيمة الإجمالية وشروط الدفع"، "شروط التسليم والقبول"، "الضمانات والتعهدات"، "المسؤولية والتعويضات"، "شروط الإنهاء المبكر للعقد"، "القوة القاهرة"، "القانون الواجب التطبيق وتسوية المنازعات"، "السرية وعدم الإفصاح"، "أحكام عامة ومتنوعة").
        *   "content": النص الحرفي الكامل لل بند كما ورد في العقد.
        *   "risk": تقييم لمستوى المخاطر المحتملة التي قد يفرضها هذا البند على أحد الأطراف أو كليهما. يجب أن يكون التقييم إحدى القيم التالية فقط: "${RiskLevel.LOW}"، "${RiskLevel.MEDIUM}"، أو "${RiskLevel.HIGH}".
    3.  "overallRiskAssessment": تقييم شامل للمخاطر الإجمالية للعقد. يجب أن يكون التقييم إحدى القيم التالية فقط: "${RiskLevel.LOW}"، "${RiskLevel.MEDIUM}"، أو "${RiskLevel.HIGH}".
    4.  "recommendations": مصفوفة من التوصيات والملاحظات العملية (3-5 توصيات على الأقل). يجب أن تكون التوصيات محددة وقابلة للتنفيذ، وتشير إلى بنود معينة تحتاج إلى مراجعة، أو جوانب قد تتطلب توضيحًا إضافيًا، أو اقتراحات لتحسين العقد وحماية مصالح الأطراف.
  `;
  
  let contents: any;

  if (file) {
      const filePart = {
          inlineData: {
              mimeType: file.mimeType,
              data: file.base64Data,
          },
      };
      const textPart = {
          text: `First, extract all text from the provided document image/file. Then, analyze the extracted text as a legal contract. ${jsonPrompt}`
      };
      contents = [{ role: "user", parts: [filePart, textPart] }];

  } else if (text) {
      contents = [{ role: "user", parts: [{ text: `نص العقد المراد تحليله:\n---\n${text}\n---\n\n${jsonPrompt}` }] }];
  } else {
      throw new Error("Either text or a file must be provided for analysis.");
  }


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, 
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as GeminiAnalysisResult;
    
    // Validate and normalize risk levels
    const validRiskLevels = Object.values(RiskLevel).map(rl => rl.toLowerCase());

    if (parsedData.overallRiskAssessment && !validRiskLevels.includes(parsedData.overallRiskAssessment.toLowerCase())) {
        console.warn(`Invalid overallRiskAssessment received: ${parsedData.overallRiskAssessment}. Defaulting to Medium.`);
        parsedData.overallRiskAssessment = RiskLevel.MEDIUM;
    } else if (parsedData.overallRiskAssessment) {
        parsedData.overallRiskAssessment = parsedData.overallRiskAssessment.toLowerCase() as RiskLevel;
    } else {
        parsedData.overallRiskAssessment = RiskLevel.MEDIUM; // Default if missing
    }


    if (parsedData.extractedClauses) {
        parsedData.extractedClauses.forEach(clause => {
            if (clause.risk && !validRiskLevels.includes(clause.risk.toLowerCase())) {
                 console.warn(`Invalid clause risk received: ${clause.risk} for clause "${clause.title}". Defaulting to Medium.`);
                 clause.risk = RiskLevel.MEDIUM;
            } else if (clause.risk) {
                clause.risk = clause.risk.toLowerCase() as RiskLevel;
            } else {
                 clause.risk = RiskLevel.MEDIUM; // Default if missing
            }
        });
    } else {
        parsedData.extractedClauses = []; // Ensure it's an array
    }
    if (!parsedData.recommendations) {
        parsedData.recommendations = []; // Ensure it's an array
    }
    if (!parsedData.summary) {
        parsedData.summary = "لم يتمكن النظام من استخلاص ملخص للعقد.";
    }

    return parsedData;

  } catch (error) {
    console.error("Error analyzing contract with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("مفتاح API المستخدم غير صالح. يرجى التحقق من المفتاح وإعادة المحاولة.");
    }
    throw new Error("فشل تحليل العقد باستخدام Gemini. قد يكون هناك ضغط على الخدمة أو مشكلة في نص العقد. الرجاء المحاولة مرة أخرى لاحقًا.");
  }
};


// --- Legal Chatbot (Multimodal) ---
const getChatbotResponse = async (message: string, file?: FileInput): Promise<string> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Returning mock data for chatbot.");
    let fileInfo = file ? ` وملف مرفق من نوع ${file.mimeType}` : '';
    return Promise.resolve(`أنا مساعدك القانوني الذكي. في الوضع العادي، يمكنني الإجابة على استفساراتك القانونية وتحليل المستندات. (خدمة AI غير نشطة حاليًا). سؤالك كان: "${message}"${fileInfo}.`);
  }

  const systemInstruction = `أنت مساعد قانوني خبير ومتقدم للغاية، متخصص في قوانين الشرق الأوسط، مع تركيز خاص على الكويت ودول الخليج. أنت مبني على أحدث نماذج الذكاء الاصطناعي التوليدي (Gemini) وقادر على التعامل مع المدخلات متعددة الوسائط (نصوص، صور مستندات، ملفات PDF).

مهمتك هي تقديم مساعدة قانونية دقيقة، شاملة، ومستنيرة لمجموعة واسعة جدًا من الاستفسارات والطلبات. قدراتك تشمل ولا تقتصر على:
1.  **تحليل المستندات:** إذا تم إرفاق ملف (صورة أو PDF)، قم أولاً بتحليل محتواه بدقة (استخدم OCR إذا لزم الأمر). ثم أجب على أي سؤال محدد حول المستند، أو قدم ملخصًا وتحليلاً شاملاً إذا لم يتم طرح سؤال محدد.
2.  **الإجابة على استفسارات معقدة:** أجب على أسئلة تتعلق بأي حالة قانونية، أو استفسارات قانونية عامة أو متخصصة.
3.  **شرح المفاهيم والمصطلحات:** وضح أي مفهوم أو مصطلح قانوني بشكل مبسط ودقيق.
4.  **تلخيص النصوص:** لخص أي نص قانوني يتم تقديمه لك، مع إبراز النقاط الجوهرية.
5.  **المساعدة في الصياغة:** ساعد في صياغة مسودات أولية لمختلف أنواع الوثائق القانونية (مثل بنود العقود، فقرات المذكرات، الإنذارات، الطلبات).
6.  **البحث القانوني:** ابحث وقدم معلومات عن قوانين محددة، مواد قانونية، أو مبادئ قضائية عامة ذات صلة بالاستفسار.
7.  **تحليل السيناريوهات:** حلل سيناريوهات قانونية افتراضية وقدم رأيًا مبدئيًا حول التبعات المحتملة.
8.  **المقارنة القانونية:** قارن بين مفاهيم، تشريعات، أو إجراءات قانونية مختلفة، موضحًا الفروقات والتشابهات.

**قواعد هامة:**
- إذا لم تكن متأكدًا من إجابة، أو إذا كان السؤال يتطلب استشارة قانونية متخصصة تتجاوز المعلومات العامة، كن واضحًا جدًا في ذلك وأنصح المستخدم بالرجوع إلى محامٍ مختص فورًا.
- كن دائمًا مهنيًا ومساعدًا.
- قدم إجاباتك بتنسيق واضح ومنظم (استخدم القوائم النقطية، العناوين، والتنسيق الغامق لتحسين القراءة).
- أكد دائمًا على أن المعلومات المقدمة هي لأغراض إرشادية ولا تغني عن استشارة محامٍ مرخص.`;
  
  let contents: any;
  const parts = [];

  if (file) {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.base64Data,
      },
    });
  }

  // Always add the text part, even if it's an empty string. It carries the main prompt context.
  const promptText = message || (file ? "الرجاء تحليل وتلخيص المستند المرفق." : "مرحباً");
  parts.push({ text: promptText });

  contents = [{ role: "user", parts }];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error("مفتاح API المستخدم غير صالح. يرجى التحقق من المفتاح وإعادة المحاولة.");
    }
    throw new Error("حدث خطأ أثناء التواصل مع المساعد القانوني. الرجاء المحاولة مرة أخرى.");
  }
};


// --- Smart Mind Map Generation (Multimodal) ---
interface MindMapInput {
  text?: string;
  file?: FileInput;
  caseData?: Partial<Case>;
  moduleData?: { type: 'Compliance'; data: Partial<ComplianceRequirement>[] };
}
const generateMindMap = async (input: MindMapInput): Promise<{ nodes: AISuggestedNode[], edges?: MindMapEdge[] }> => {
    if (!ai) {
        console.warn("Gemini AI not initialized. Returning mock data for mind map generation.");
        return Promise.resolve({
            nodes: [
                { label: "مدخل متاح (بدون AI)", content: "تم إنشاء هذه الخريطة بشكل وهمي.", children: [
                    { label: "النقطة الأولى من المدخل", content: (input.text || "محتوى وهمي").substring(0, 50) + "..." },
                    { label: "النقطة الثانية", content: "يمكنك تعديل هذه العقد وإضافة المزيد." }
                ]}
            ],
            edges: []
        });
    }

    const basePrompt = `
        أنت متخصص في تحليل المعلومات القانونية والتجارية وتحويلها إلى خرائط ذهنية منظمة باللغة العربية.
        مهمتك هي تحليل المدخل التالي واستخلاص هيكل خريطة ذهنية منطقي منه.
        يجب أن يكون الناتج بتنسيق JSON فقط، ويمثل مصفوفة من العقد الجذرية (top-level nodes).
        كل عقدة في المصفوفة، وفي أي مستوى تفرع، يجب أن تحتوي على:
        - "label": (string) عنوان وصفي مختصر ومناسب للعقدة.
        - "content": (string, optional) محتوى أو تفاصيل إضافية لهذه العقدة.
        - "children": (array of AISuggestedNode, optional) مصفوفة من العقد الفرعية التابعة لهذه العقدة، بنفس الهيكل (label, content, children).

        الهدف هو إنشاء هيكل شجري. حاول تحديد فكرة رئيسية واحدة أو أكثر لتكون الجذور.
        ثم استخرج الأفكار الفرعية الرئيسية كأطفال لها، وهكذا بشكل متدرج لعمق معقول (2-4 مستويات).
        إذا كان المدخل غير واضح، حاول إنشاء عقدة جذرية واحدة مع تلخيص للمحتوى.
        
        تنسيق JSON للمخرجات يجب أن يكون مصفوفة من العقد الجذرية.
        تأكد أن الرد هو JSON صالح فقط، بدون أي نصوص إضافية قبله أو بعده.
    `;

    const parts = [];
    let textPrompt = basePrompt;

    if (input.file) {
        parts.push({
            inlineData: {
                mimeType: input.file.mimeType,
                data: input.file.base64Data,
            },
        });
        textPrompt = `المدخل: قم أولاً باستخلاص النص الكامل من المستند المرفق (صورة أو PDF)، ثم قم بتطبيق التعليمات التالية على النص المستخلص.\n\n${basePrompt}`;
    } else if (input.caseData) {
        const caseText = `
        المدخل: قم بتحليل وتلخيص بيانات القضية التالية:\n
        - عنوان القضية: ${input.caseData.title}\n
        - رقم القضية: ${input.caseData.caseNumber}\n
        - نوع القضية: ${input.caseData.caseMainType}\n
        - الموكل: ${input.caseData.clientName}\n
        - الخصم: ${input.caseData.opposingPartyName}\n
        - وصف القضية: ${input.caseData.description || 'لا يوجد'}\n
        - حالة القضية: ${input.caseData.status}\n
        - المحامي المسؤول: ${input.caseData.assignedLawyer}\n
        \n${basePrompt}
        `;
        textPrompt = caseText;
    } else if (input.moduleData) {
        if (input.moduleData.type === 'Compliance') {
            const complianceText = input.moduleData.data.map(item => `- ${item.title} (الحالة: ${item.status}, الاستحقاق: ${item.dueDate || 'N/A'}, المسؤول: ${item.assignedTo || 'N/A'})`).join('\n');
            textPrompt = `
            المدخل: قم بتحليل وتلخيص قائمة مهام الامتثال التالية. أنشئ عقدة جذرية لكل حالة (Status) مثل "متأخر" أو "قيد التنفيذ"، ثم ضع المهام ذات الصلة كعقد فرعية تحتها.\n\n
            بيانات مهام الامتثال:\n${complianceText}\n\n${basePrompt}
            `;
        }
    } else if (input.text) {
        textPrompt = `المدخل: النص التالي:\n---\n${input.text}\n---\n\n${basePrompt}`;
    } else {
        throw new Error("يجب توفير نص أو ملف أو بيانات قضية لإنشاء الخريطة.");
    }
    
    parts.push({ text: textPrompt });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{ role: "user", parts: parts }],
            config: {
                responseMimeType: "application/json",
                temperature: 0.3, 
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^\`\`\`(?:json)?\s*\n?(.*?)\n?\s*\`\`\`$/si;
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) {
            jsonStr = match[1].trim();
        }
        
        let parsedData: AISuggestedNode[];
        try {
            parsedData = JSON.parse(jsonStr);
        } catch(parseError) {
            console.error("Failed to parse JSON response from AI for mind map:", jsonStr, parseError);
            throw new Error("البيانات المستلمة من الذكاء الاصطناعي لهيكلة الخريطة غير صالحة أو بتنسيق غير متوقع.");
        }
        
        if (!Array.isArray(parsedData) || (parsedData.length > 0 && parsedData.some(node => typeof node.label !== 'string'))) {
            console.error("Invalid mind map structure received from AI (not an array of AISuggestedNode):", parsedData);
            throw new Error("البيانات المستلمة من الذكاء الاصطناعي لهيكلة الخريطة غير صالحة. يجب أن تكون مصفوفة من العقد.");
        }

        return { nodes: parsedData, edges: [] }; 

    } catch (error) {
        console.error("Error generating mind map with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes("API key not valid")) {
                throw new Error("مفتاح API المستخدم غير صالح. يرجى التحقق من المفتاح وإعادة المحاولة.");
            }
            if (error.message.includes("البيانات المستلمة")) {
                throw error;
            }
        }
        throw new Error("فشل إنشاء الخريطة الذهنية باستخدام Gemini. الرجاء المحاولة مرة أخرى.");
    }
};


export const geminiService = {
  analyzeContract,
  getChatbotResponse,
  generateMindMap, 
};