import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DealSupportRequest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the Deal Support Intake (Jane)
const DEAL_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    salesManager: { type: Type.STRING },
    businessSegment: { type: Type.STRING, enum: ["TBS", "ENT"] },
    province: { type: Type.STRING },
    requestType: { type: Type.STRING, enum: ["Acquisition", "Renewal & Growth", "Other"] },
    fulfillmentType: { type: Type.STRING },
    contractType: { type: Type.STRING, enum: ["CCA", "Wireless Amendment"] },
    termMonths: { type: Type.NUMBER },
    minCommitment: { type: Type.NUMBER },
    strategyWin: { type: Type.STRING, description: "Strategy to win or compelling reason" },
    customerPainPoints: { type: Type.STRING },
    currentTLCs: { type: Type.STRING, description: "Termination liability charges with current provider" },
    clientValue: { type: Type.STRING, description: "What the client values in an offer" },
    crossSellOps: { type: Type.STRING, description: "Current services and cross-sell opportunities" },
    decisionMakerPersona: { type: Type.STRING, description: "Job title or persona of the contact" },
    roamingProfile: { type: Type.STRING },
    offerToWin: { type: Type.STRING, description: "Specific offer details required to win" },
    dataUsage: { type: Type.STRING },
    hardwarePlans: { type: Type.STRING, description: "Hardware refresh, BYOD, or upgrades" },
    competitiveIntel: { type: Type.STRING }
  },
  required: ["strategyWin", "offerToWin", "businessSegment"]
};

// Schema for the Initiative Scanner (Legacy Feature)
const FEEDBACK_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING, enum: ["Pricing", "Coverage", "Product", "Process", "Other"] },
    sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative", "Frustrated"] },
    category: { type: Type.STRING },
    urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
  },
  required: ["topic", "sentiment", "urgency"]
};

export const parseIntakeFromTranscript = async (transcript: string): Promise<Partial<DealSupportRequest>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Wireless Pricing Assistant processing a transcript for a Deal Support Request (Offer House). 
      Extract the deal details into the structured JSON format. 
      If specific details are missing, leave them null or empty strings.
      
      Transcript:
      ${transcript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: DEAL_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Error parsing transcript:", error);
    return {};
  }
};

export const analyzeTextFeedback = async (text: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the following feedback text from a field sales representative. 
            Categorize it by topic (Pricing, Coverage, Product, Process, Other).
            Determine the sentiment (Positive, Neutral, Negative, Frustrated).
            Assign an urgency level (Low, Medium, High).
            
            Feedback: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: FEEDBACK_SCHEMA,
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result;
    } catch (e) {
        console.error("Error analyzing feedback", e);
        throw e;
    }
};
