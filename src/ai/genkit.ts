import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Genkit configuration for AeroIntel.
 * Standardized on Gemini 1.5 Flash for high throughput and reliability.
 */

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
  ],
  model: 'googleai/gemini-1.5-flash',
});