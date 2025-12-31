import { generateText, streamText, type CoreMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { type AIConfig, getAIConfig } from './config.js';

export interface GenerateOptions {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatOptions {
  messages: CoreMessage[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export function createAIClient(config?: AIConfig) {
  const resolvedConfig = config || getAIConfig();

  const getModel = () => {
    switch (resolvedConfig.provider) {
      case 'google': {
        const google = createGoogleGenerativeAI({
          apiKey: resolvedConfig.apiKey,
        });
        return google(resolvedConfig.model || 'gemini-1.5-flash');
      }
      case 'openai': {
        const openai = createOpenAI({
          apiKey: resolvedConfig.apiKey,
        });
        return openai(resolvedConfig.model || 'gpt-4o-mini');
      }
      default:
        throw new Error(`Unsupported provider: ${resolvedConfig.provider}`);
    }
  };

  return {
    async generate(options: GenerateOptions) {
      const result = await generateText({
        model: getModel(),
        prompt: options.prompt,
        system: options.system,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      });
      return result.text;
    },

    async *stream(options: GenerateOptions) {
      const result = streamText({
        model: getModel(),
        prompt: options.prompt,
        system: options.system,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      });

      for await (const chunk of result.textStream) {
        yield chunk;
      }
    },

    async chat(options: ChatOptions) {
      const result = await generateText({
        model: getModel(),
        messages: options.messages,
        system: options.system,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      });
      return result.text;
    },

    getConfig() {
      return resolvedConfig;
    },
  };
}

export type AIClient = ReturnType<typeof createAIClient>;
