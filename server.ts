
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // --- Gemini Setup ---
  const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
  const GEMINI_MODEL = "gemini-3.5-flash";

  if (!ai) {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI features will be disabled.");
  }

  // --- API Routes ---
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', api: !!ai });
  });

  app.post('/api/gemini/chat', async (req, res) => {
    if (!ai) return res.status(500).json({ error: 'AI not initialized' });
    
    try {
      const { message, history, file, systemInstruction } = req.body;
      
      const contents: any[] = [...history];
      const currentParts = [];
      
      if (file) {
        currentParts.push({
          inlineData: { mimeType: file.mimeType, data: file.base64Data }
        });
      }
      
      currentParts.push({ text: message || "الرجاء تحليل المدخلات" });
      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          temperature: 0.7,
          ...(systemInstruction ? { systemInstruction } : {})
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gemini/generate', async (req, res) => {
    if (!ai) return res.status(500).json({ error: 'AI not initialized' });
    
    try {
      const { prompt, systemInstruction, responseMimeType } = req.body;
      
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { 
          temperature: 0.2,
          ...(responseMimeType ? { responseMimeType } : {}),
          ...(systemInstruction ? { systemInstruction } : {})
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini Generate Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/version', (req, res) => {
    res.json({ version: '3.1.0-gold', buildTime: new Date().toISOString() });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    
    // Serve static files with long-term caching (since they have hashes)
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false // we handle index separately
    }));

    // Handle index.html - NEVER cache this file to ensure users get the new hashed assets
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
