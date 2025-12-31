export type AIProvider = 'google' | 'openai';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export function getAIConfig(): AIConfig {
  const googleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (googleKey) {
    return {
      provider: 'google',
      apiKey: googleKey,
      model: process.env.AI_MODEL || 'gemini-2.0-flash-exp',
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: process.env.AI_MODEL || 'gpt-4o-mini',
    };
  }

  throw new Error(
    'No AI API key found. Set GOOGLE_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in your environment.'
  );
}

export function createAIConfig(config: AIConfig): AIConfig {
  if (!config.apiKey) {
    throw new Error('API key is required');
  }
  return {
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model,
  };
}
