import { GoogleGenAI } from "@google/genai";

// As per guidelines, process.env.API_KEY is assumed to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateBookDescription = async (title: string, author: string, category: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY not found. Gemini API calls will fail.");
    return "Não foi possível gerar a descrição neste momento. O serviço de IA não está configurado.";
  }
  
  try {
    const prompt = `Gere uma descrição de livro atraente e concisa, em português, para um livro intitulado "${title}" de ${author}. O gênero é ${category}. A descrição deve ter cerca de 2 a 3 parágrafos e despertar o interesse de um leitor em potencial, sem revelar spoilers importantes.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "Descrição não disponível.";
  } catch (error) {
    console.error("Error generating book description:", error);
    return "Não foi possível gerar a descrição neste momento. Por favor, tente novamente mais tarde.";
  }
};

export const generateBookCover = async (title: string, author: string, category: string, description?: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY not found.");
    return null;
  }

  try {
    // Detailed prompt for better visual results suitable for book covers
    const prompt = `Create a high-quality, professional book cover illustration for a ${category} book titled "${title}".
    
    Context from book description: ${description ? description.substring(0, 300) : 'A compelling story'}.
    
    Style requirements:
    - Vertical aspect ratio (2:3) composition.
    - Cinematic lighting, highly detailed, digital art style.
    - NO TEXT: Do not attempt to write the title or author name on the image. Create only the background art/illustration.
    - Visually striking and suitable for the ${category} genre.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    // Iterate to find image part
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Error generating book cover:", error);
    return null;
  }
};

export interface ReadingMetrics {
  estimatedPages: number;
  readingTimeMinutes: number;
  difficulty: string;
}

export const analyzeReadingMetrics = async (textSample: string, totalCharacterCount: number): Promise<ReadingMetrics | null> => {
  if (!process.env.API_KEY) return null;

  try {
    // We calculate standard pages based on industry standard ~1500 chars per page or 250 words
    // But we ask Gemini to assess complexity to refine the reading time.
    const prompt = `Analyze this text sample from a book: "${textSample.substring(0, 1000)}...". 
    The total book length is ${totalCharacterCount} characters.
    1. Estimate the number of pages assuming standard paperback formatting.
    2. Estimate reading time in minutes for an average reader based on text complexity.
    3. Rate difficulty (Fácil, Médio, Difícil).
    
    Return ONLY a JSON object: { "estimatedPages": number, "readingTimeMinutes": number, "difficulty": string }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ReadingMetrics;
  } catch (error) {
    console.error("Error analyzing reading metrics:", error);
    // Fallback calculation
    return {
      estimatedPages: Math.ceil(totalCharacterCount / 1500),
      readingTimeMinutes: Math.ceil(totalCharacterCount / 1000), // Rough estimate
      difficulty: "Médio"
    };
  }
};