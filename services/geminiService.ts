
import { GoogleGenAI, Type } from "@google/genai";
import { Email } from "../types";

export const generateIncomingEmails = async (targetEmail: string, currentEmailCount: number): Promise<Email[]> => {
  // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
  // Using direct process.env.API_KEY as per coding guidelines for initializing GoogleGenAI.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 1 to 2 realistic incoming emails for the temporary email address: ${targetEmail}. 
      The emails should vary in type: one might be a verification code for Netflix or Spotify, a promotional offer, or a login alert.
      Ensure the sender names and emails look legitimate for the service.
      Return the response in JSON format.`,
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

    // Access .text property as per guidelines for Extracting Text Output.
    const jsonStr = response.text?.trim() || "[]";
    const generated = JSON.parse(jsonStr);

    return generated.map((mail: any, index: number) => ({
      ...mail,
      id: `gen-${Date.now()}-${index}`,
      timestamp: new Date().toISOString(),
      isRead: false
    }));
  } catch (error) {
    console.error("Error generating emails:", error);
    return [];
  }
};
