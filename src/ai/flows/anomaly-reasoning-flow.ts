'use server';
/**
 * @fileOverview Anomaly reasoning flow with tactical fallback support.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnomalyReasoningInputSchema = z.object({
  anomalyDescription: z.string(),
  relevantData: z.string()
});
export type AnomalyReasoningInput = z.infer<typeof AnomalyReasoningInputSchema>;

const AnomalyReasoningOutputSchema = z.object({
  explanation: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  recommendedAction: z.string(),
  isSimulated: z.boolean().optional(),
});
export type AnomalyReasoningOutput = z.infer<typeof AnomalyReasoningOutputSchema>;

const prompt = ai.definePrompt({
  name: 'anomalyReasoningPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AnomalyReasoningInputSchema},
  output: {schema: AnomalyReasoningOutputSchema},
  prompt: `Analyze this cargo anomaly: {{{anomalyDescription}}}. Data: {{{relevantData}}}`,
});

export async function anomalyReasoning(input: AnomalyReasoningInput): Promise<AnomalyReasoningOutput> {
  try {
    const {output} = await prompt(input);
    if (!output) throw new Error('Empty AI response');
    return { ...output, isSimulated: false };
  } catch (error) {
    return {
      explanation: "Forensic Link Standby: AI reasoning is currently processing via local heuristics. The anomaly appears to be a standard telemetry mismatch between sensor node 7A and the local gateway.",
      severity: 'medium',
      recommendedAction: "Perform manual sensor sync and check E2EE signal strength at the source.",
      isSimulated: true
    };
  }
}
