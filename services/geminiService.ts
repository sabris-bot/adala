import { GeminiAnalysisResult, AISuggestedNode, MindMapEdge, ExtractedClause } from "../types";

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

// --- Proxy Implementation ---
const fetchGemini = async (endpoint: string, body: any) => {
    const response = await fetch(`/api/gemini/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to communicate with AI server');
    }
    return response.json();
};

const analyzeContract = async (
  text?: string, 
  file?: FileInput, 
  jurisdiction?: string, 
  contractType?: string
): Promise<GeminiAnalysisResult> => {
  const contextPrompt = `
    الاختصاص القضائي: ${jurisdiction || "الشرق الأوسط (عام)"}
    نوع العقد: ${contractType || "غير محدد"}
  `;

  const jsonPrompt = `
    أنت خبير قانوني متخصص في تحليل وصياغة العقود باللغة العربية. مهمتك هي تحليل نص العقد التالي بدقة وتقديم النتائج في تنسيق JSON منظم.
    
    سياق التحليل:
    ${contextPrompt}

    الرجاء استخراج المعلومات التالية وتقديمها حصريًا بتنسيق JSON بالكيفية الموضحة أدناه:
    1.  "summary": ملخص تنفيذي للعقد (بين 70-150 كلمة).
    2.  "extractedClauses": مصفوفة البنود المستخرجة (title, content, risk [low, medium, high], aiRecommendation).
    3.  "overallRiskAssessment": تقييم شامل للمخاطر.
    4.  "recommendations": مصفوفة توصيات عملية.
    5.  "legalAdvice": نصائح قانونية متخصصة بناءً على ${contractType} في ${jurisdiction}.
  `;

  let prompt = "";
  if (file) {
      prompt = `Extract text from the document and analyze it as a contract. ${jsonPrompt}`;
  } else {
      prompt = `نص العقد:\n---\n${text}\n---\n\n${jsonPrompt}`;
  }

  const result = await fetchGemini('chat', {
      message: prompt,
      history: [],
      file: file,
      systemInstruction: "أنت محامي خبير يقوم بتحليل العقود بدقة متناهية."
  });

  const jsonStr = extractJson(result.text);
  return JSON.parse(jsonStr) as GeminiAnalysisResult;
};

const getChatbotResponse = async (message: string, history: ChatMessage[] = [], file?: FileInput): Promise<string> => {
  const result = await fetchGemini('chat', {
      message,
      history,
      file,
      systemInstruction: "أنت مساعد قانوني خبير متخصص في القانون الكويتي."
  });
  return result.text;
};

const generateMindMap = async (input: MindMapInput): Promise<{ nodes: AISuggestedNode[], edges?: MindMapEdge[] }> => {
    const basePrompt = `Produce a Mind Map JSON structure (label, content, children) for: ${JSON.stringify(input)}`;
    const result = await fetchGemini('generate', {
        prompt: basePrompt,
        responseMimeType: "application/json"
    });
    return { nodes: JSON.parse(extractJson(result.text)), edges: [] };
};

const generateLegalForm = async (prompt: string, file?: FileInput): Promise<any> => {
    const result = await fetchGemini('chat', {
        message: prompt,
        history: [],
        file: file,
        systemInstruction: "أنت خبير في صياغة النماذج القانونية الكويتية بتنسيق JSON."
    });
    return JSON.parse(extractJson(result.text));
};

const correctGrammarAndSpelling = async (text: string): Promise<string> => {
    const result = await fetchGemini('chat', {
        message: `صحح لغوياً: ${text}`,
        history: [],
        systemInstruction: "أنت مصحح لغوي قانوني."
    });
    return result.text;
};

const analyzeClauseDeeply = async (clause: ExtractedClause, jurisdiction: string, contractType: string): Promise<string> => {
    const result = await fetchGemini('chat', {
        message: `حلل بعمق البند: ${clause.title} في ${contractType} (${jurisdiction})`,
        history: [],
        systemInstruction: "أنت مستشار قانوني كبير."
    });
    return result.text;
};

const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const result = await fetchGemini('chat', {
        message: prompt,
        history: [],
        systemInstruction: systemInstruction || "أنت مساعد ذكي."
    });
    return result.text;
};

export const geminiService = {
  analyzeContract,
  getChatbotResponse,
  generateMindMap,
  generateLegalForm,
  correctGrammarAndSpelling,
  analyzeClauseDeeply,
  generateContent,
};
