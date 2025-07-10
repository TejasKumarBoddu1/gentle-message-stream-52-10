
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const callGeminiAI = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response;
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
};

export const callGeminiWithStructuredOutput = async (prompt: string) => {
  const structuredPrompt = `
    ${prompt}
    
    IMPORTANT: Return your response in valid JSON format only. 
    No additional text outside the JSON.
  `;
  
  const response = await callGeminiAI(structuredPrompt);
  return JSON.parse(response.text());
};
