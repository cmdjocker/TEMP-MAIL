
import { GoogleGenAI, Type } from "@google/genai";
import { Email } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateIncomingEmails = async (targetEmail: string, currentEmailCount: number): Promise<Email[]> => {
  // Use gemini-3-flash-preview for fast generation
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 1 to 3 realistic incoming emails for the temporary email address: ${targetEmail}. 
      The emails should vary in type: one might be a verification code, one a promotional offer, one a personal message, or spam.
      Current inbox has ${currentEmailCount} emails.
      Ensure the sender names and emails are diverse.
      Use professional yet realistic subjects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              senderName: { type: Type.STRING },
              senderEmail: { type: Type.STRING },
              subject: { type: Type.STRING },
              body: { type: Type.STRING, description: 'The email content in markdown format' },
              category: { 
                type: Type.STRING, 
                enum: ['primary', 'social', 'promotions', 'spam'] 
              },
            },
            required: ['senderName', 'senderEmail', 'subject', 'body', 'category']
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    const generated = JSON.parse(jsonStr);

    return generated.map((mail: any, index: number) => ({
      ...mail,
      id: `gen-${Date.now()}-${index}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000)).toISOString(),
      isRead: false
    }));
  } catch (error) {
    console.error("Error generating emails:", error);
    return [];
  }
};
