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
    const prompt = `Design a professional book cover for a book titled "${title}" by "${author}". Genre: ${category}. ${description ? `Context: ${description.substring(0, 200)}` : ''}. The image should be high quality, vertical aspect ratio, no text overlay other than the title if possible, or just a clean artistic illustration suitable for a book cover.`;
    
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
