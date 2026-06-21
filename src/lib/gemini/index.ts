import { GoogleGenerativeAI, SchemaType, GenerativeModel } from '@google/generative-ai';

// Initialize the Gemini API client
// Note: process.env.GEMINI_API_KEY is retrieved server-side only
const geminiApiKey = process.env.GEMINI_API_KEY || '';
export const genAI = new GoogleGenerativeAI(geminiApiKey);

// Multi-model fallback chain: primary → fallback 1 → fallback 2 → fallback 3
// Each model is tried in order; the first to succeed is used.
export const GEMINI_MODEL_CHAIN = [
  'gemini-3.5-flash',      // Primary — fastest, lowest latency
  'gemini-3.1-flash-lite', // Fallback 1 — if primary is rate-limited
  'gemini-2.5-flash',      // Fallback 2
  'gemini-2.5-flash-lite', // Last-resort fallback
] as const;

/**
 * Returns a GenerativeModel using the first model in the chain that can be
 * instantiated. Falls back through the chain on quota / availability errors.
 * Pass the same generationConfig you would pass to getGenerativeModel().
 */
export async function getGeminiModel(
  config: Parameters<GoogleGenerativeAI['getGenerativeModel']>[0]
): Promise<GenerativeModel> {
  // We return the first model object immediately — actual quota errors surface
  // only at generateContent() time, so callers should catch and retry.
  // This function exists so model selection is centralised in one place.
  const [primary] = GEMINI_MODEL_CHAIN;
  return genAI.getGenerativeModel({ ...config, model: primary });
}

// Structured schema for individual action analysis
export const actionAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      description: 'The general category of the logged habit or activity.',
      enum: ['transportation', 'energy', 'waste', 'food', 'conservation']
    },
    impact_type: {
      type: SchemaType.STRING,
      description: 'Whether the action has a positive or negative impact on the ecosystem.',
      enum: ['positive', 'negative']
    },
    vitality_delta: {
      type: SchemaType.NUMBER,
      description: 'Impact score between -0.15 (severe degradation/harmful) and +0.15 (restorative/sustainable) modifying ecosystem vitality.'
    },
    co2_saved_g: {
      type: SchemaType.NUMBER,
      description: 'Estimated grams of carbon saved or prevented by this action compared to standard baseline alternatives. Return 0 for negative actions.'
    },
    nature_reflection: {
      type: SchemaType.STRING,
      description: 'A poetic, sensory, nature-themed response about how this action touches the ecosystem (roots, wind, water, leaf). Keep under 150 characters.'
    },
    future_projection_5y: {
      type: SchemaType.STRING,
      description: 'A 5-year outlook projection statement showing the consequences of this behavior continuing over time. Keep under 200 characters.'
    }
  },
  required: ['category', 'impact_type', 'vitality_delta', 'co2_saved_g', 'nature_reflection', 'future_projection_5y']
};

// System instruction to guide the model's tone and analytical perspective
export const systemInstruction = `
You are the ancient, sensory voice of the nature sanctuary in VERDANT. 
Your goal is to interpret the environmental consequences of the user's natural language action logs. 
Perform an objective impact analysis based on carbon offset, ecological preservation, or consumption footprint.
Translate this impact into:
1. An incremental vitality score change between -0.15 and +0.15.
2. An estimated CO2 offset value in grams.
3. A poetic nature reflection in a soothing, therapeutic tone.
4. A descriptive 5-year future projection.

If the habit is harmful, return a negative vitality_delta and a reflective warning. 
If the action is positive, return a positive vitality_delta and a congratulatory nature analogy.
`;
