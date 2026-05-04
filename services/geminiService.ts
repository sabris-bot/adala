import { GoogleGenAI, GenerateContentResponse, Chat, FunctionDeclaration, Type } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { GeminiAnalysisResult, RiskLevel, AISuggestedNode, MindMapEdge, Case, ComplianceRequirement } from "../types"; // Added Case & ComplianceRequirement
import { initialCases } from "../data/caseData";

// Ensure API_KEY is accessed correctly from environment variables
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API Key not found in process.env.API_KEY. AI features will be mocked or disabled.");
}

// --- Function Declarations for Gemini ---
const searchCasesFunctionDeclaration: FunctionDeclaration = {
  name: "searchCases",
  parameters: {
    type: Type.OBJECT,
    description: "البحث عن القضايا في النظام بناءً على نص البحث (عنوان، رقم، اسم موكل أو خصم).",
    properties: {
      query: {
        type: Type.STRING,
        description: "نص البحث المراد استخدامه للعثور على القضايا.",
      },
    },
    required: ["query"],
  },
};

const getExecutionProceduresFunctionDeclaration: FunctionDeclaration = {
  name: "getExecutionProcedures",
  parameters: {
    type: Type.OBJECT,
    description: "الحصول على كافة إجراءات التنفيذ المسجلة لقضية معينة باستخدام معرف القضية (ID) أو رقم القضية.",
    properties: {
      caseId: {
        type: Type.STRING,
        description: "المعرف الفريد للقضية (ID) أو رقم القضية الآلي.",
      },
    },
    required: ["caseId"],
  },
};

// --- Implementation of Functions ---
const searchCases = (query: string): any[] => {
  const lowerQuery = query.toLowerCase();
  return initialCases.filter(c => 
    c.title.toLowerCase().includes(lowerQuery) ||
    c.caseNumber.toLowerCase().includes(lowerQuery) ||
    c.clientName.toLowerCase().includes(lowerQuery) ||
    (c.opposingPartyName && c.opposingPartyName.toLowerCase().includes(lowerQuery))
  ).map(c => ({
    id: c.id,
    title: c.title,
    caseNumber: c.caseNumber,
    clientName: c.clientName,
    status: c.status
  }));
};

const getExecutionProcedures = (caseId: string): any => {
  const caseItem = initialCases.find(c => c.id === caseId || c.caseNumber === caseId);
  if (!caseItem) return { error: "القضية غير موجودة." };
  return {
    caseTitle: caseItem.title,
    caseNumber: caseItem.caseNumber,
    executionActions: caseItem.executionActions || []
  };
};

interface FileInput {
  base64Data: string;
  mimeType: string;
}

// --- Helper to extract JSON from text safely ---
const extractJson = (text: string): string => {
  // Common case: markdown code blocks
  const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/i;
  const match = text.match(fenceRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Handle case where it might be wrapped in brackets/braces but has text around it
  const startBrace = text.indexOf('{');
  const endBrace = text.lastIndexOf('}');
  const startBracket = text.indexOf('[');
  const endBracket = text.lastIndexOf(']');

  // Decide which one is likely the JSON wrapper
  let start = -1;
  let end = -1;

  if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
    start = startBrace;
    end = endBrace;
  } else if (startBracket !== -1) {
    start = startBracket;
    end = endBracket;
  }

  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }

  return text.trim();
};

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

    const jsonStr = extractJson(response.text);
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


// --- Legal Chatbot (Multimodal & Tool-Aware & History-Aware) ---
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const getChatbotResponse = async (message: string, history: ChatMessage[] = [], file?: FileInput): Promise<string> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Returning mock data for chatbot.");
    let fileInfo = file ? ` وملف مرفق من نوع ${file.mimeType}` : '';
    return Promise.resolve(`أنا مساعدك القانوني الذكي. في الوضع العادي، يمكنني الإجابة على استفساراتك القانونية وتحليل المستندات. (خدمة AI غير نشطة حاليًا). سؤالك كان: "${message}"${fileInfo}.`);
  }

  const systemInstruction = `أنت مساعد قانوني خبير ومتقدم للغاية، متخصص في قوانين الشرق الأوسط، مع تركيز دقيق وعميق على قوانين دولة الكويت (القانون المدني، قانون التجارة، قانون المرافعات، قانون العمل، قانون الجزاء، وقانون الشركات الكويتي). أنت مبني على أحدث نماذج الذكاء الاصطناعي التوليدي (Gemini) وقادر على التعامل مع المدخلات متعددة الوسائط.

مهمتك هي تقديم مساعدة قانونية دقيقة، شاملة، ومستنيرة لمجموعة واسعة من الاستفسارات. عند الإجابة على استفسارات تتعلق بالكويت، يجب عليك استحضار مواد القانون الكويتي ذات الصلة (مثل قانون العمل 6/2010، أو القانون المدني 67/1980) واستخدام المصطلحات القانونية الكويتية الدقيقة (مثلاً: "المحكمة الكلية"، "إدارة التنفيذ"، "مندوب الإعلان").

قدراتك تشمل ولا تقتصر على:
1.  **تحليل المستندات:** إذا تم إرفاق ملف، قم بتحليل محتواه بدقة وربطه بالقانون الكويتي إذا لزم الأمر.
2.  **الإجابة على استفسارات معقدة:** أجب على أسئلة تتعلق بأي حالة قانونية.
3.  **شرح المفاهيم والمصطلحات:** وضح أي مفهوم أو مصطلح قانوني بشكل مبسط ودقيق.
4.  **تلخيص النصوص:** لخص أي نص قانوني يتم تقديمه لك.
5.  **المساعدة في الصياغة:** ساعد في صياغة مسودات أولية لمختلف أنواع الوثائق القانونية.
6.  **البحث القانوني:** ابحث وقدم معلومات عن قوانين محددة أو مبادئ قضائية.
7.  **تحليل السيناريوهات:** حلل سيناريوهات قانونية افتراضية.
8.  **الوصول إلى بيانات النظام:** يمكنك البحث عن القضايا والحصول على تفاصيل إجراءات التنفيذ باستخدام الأدوات المتاحة لك.

**قواعد هامة:**
- إذا لم تكن متأكدًا من إجابة، أنصح المستخدم بالرجوع إلى محامٍ مختص فورًا.
- كن دائمًا مهنيًا ومساعدًا.
- قدم إجاباتك بتنسيق واضح ومنظم (استخدم Markdown للتنسيق مثل العناوين والقوائم).
- أكد دائمًا على أن المعلومات المقدمة هي لأغراض إرشادية ولا تغني عن استشارة محامٍ مرخص.`;
  
  const currentParts = [];

  if (file) {
    currentParts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.base64Data,
      },
    });
  }

  const promptText = message || (file ? "الرجاء تحليل وتلخيص المستند المرفق." : "مرحباً");
  currentParts.push({ text: promptText });

  const contents = [
    ...history,
    { role: "user", parts: currentParts }
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [searchCasesFunctionDeclaration, getExecutionProceduresFunctionDeclaration] }],
      },
    });

    // Check for function calls
    const functionCalls = response.functionCalls;
    if (functionCalls) {
      const toolResponses: any[] = [];
      for (const call of functionCalls) {
        if (call.name === "searchCases") {
          const results = searchCases(call.args.query as string);
          toolResponses.push({
            functionResponse: {
              name: "searchCases",
              response: { result: results }
            }
          });
        } else if (call.name === "getExecutionProcedures") {
          const results = getExecutionProcedures(call.args.caseId as string);
          toolResponses.push({
            functionResponse: {
              name: "getExecutionProcedures",
              response: { result: results }
            }
          });
        }
      }

      // Send tool responses back to model
      const secondResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [
          ...contents,
          { role: "model", parts: response.candidates[0].content.parts },
          { role: "user", parts: toolResponses }
        ],
        config: {
          systemInstruction: systemInstruction,
        }
      });
      return secondResponse.text;
    }

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

        const jsonStr = extractJson(response.text);
        
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


const generateLegalForm = async (prompt: string, file?: FileInput): Promise<{ 
    title: string; 
    category: string; 
    description: string; 
    contentTemplate: string; 
    variables: string[]; 
    instructions: string; 
}> => {
    if (!ai) {
        console.warn("Gemini AI not initialized. Returning mock data for legal form generation.");
        return Promise.resolve({
            title: "نموذج قانوني مولد آلياً",
            category: "CONTRACTS",
            description: "هذا نموذج تجريبي تم توليده بسبب عدم توفر مفتاح API.",
            contentTemplate: `هذا نص تجريبي لنموذج {{نوع_النموذج}}\n\nحرر في {{التاريخ}}\nبين كل من:\nالطرف الأول: {{الاسم_الأول}}\nالطرف الثاني: {{الاسم_الثاني}}`,
            variables: ["نوع_النموذج", "التاريخ", "الاسم_الأول", "الاسم_الثاني"],
            instructions: "تأكد من مراجعة النص قانونياً قبل الاستخدام."
        });
    }

    const systemInstruction = `أنت خبير قانوني ومصاغ محترف متخصص في القوانين الكويتية. 
    مهمتك هي إنشاء "نموذج قانوني" (Template) بناءً على طلب المستخدم أو استخراجه من مستند مرفق.
    يجب أن تكون اللغة بليغة، فصيحة، ودقيقة قانونياً.
    يجب أن يحتوي النموذج على "متغيرات" قابلة للتعبئة محاطة بأقواس متعرجة مزدوجة، مثل {{الاسم_الكامل}}.
    
    يجب أن يكون الرد بتنسيق JSON حصرياً ويحتوي على الحقول التالية:
    1. "title": عنوان مناسب ومختصر للنموذج.
    2. "category": فئة النموذج (أختر من: CONTRACTS, POWERS_OF_ATTORNEY, LEGAL_MEMOS, LAWSUITS, NOTICES, CORPORATE, OTHER).
    3. "description": وصف موجز للنموذج وفائدته.
    4. "contentTemplate": النص الكامل للنموذج مع المتغيرات {{متغير}}.
    5. "variables": مصفوفة بأسماء المتغيرات المستخدمة في النص (بدون الأقواس).
    6. "instructions": إرشادات قانونية هامة لمستخدم هذا النموذج.`;

    const parts = [];
    if (file) {
        parts.push({
            inlineData: {
                mimeType: file.mimeType,
                data: file.base64Data,
            },
        });
        parts.push({ text: `قم باستخراج النص من هذا الملف وتحويله إلى "نموذج قانوني" احترافي مع إضافة متغيرات وتنسيقه بأسلوب بليغ. تعليمات إضافية: ${prompt}` });
    } else {
        parts.push({ text: `قم بإنشاء نموذج قانوني كويتي حسب الطلب التالي: ${prompt}` });
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{ role: "user", parts: parts }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });

        const jsonStr = extractJson(response.text);

        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("Failed to parse legal form JSON:", jsonStr, parseError);
            throw new Error("البيانات المستلمة من الذكاء الاصطناعي بتنسيق غير متوقع.");
        }
    } catch (error) {
        console.error("Error generating legal form:", error);
        throw new Error("فشل توليد النموذج القانوني. حاول مرة أخرى.");
    }
};


export const geminiService = {
  analyzeContract,
  getChatbotResponse,
  generateMindMap,
  generateLegalForm,
};