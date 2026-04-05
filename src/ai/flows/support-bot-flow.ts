'use server';
/**
 * @fileOverview AeroLink-7 Tactical Support Node.
 * High-intelligence support agent for the AeroIntel aviation platform.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  content: z.string(),
});

const SupportInputSchema = z.object({
  history: z.array(MessageSchema).optional(),
  message: z.string(),
});
export type SupportInput = z.infer<typeof SupportInputSchema>;

const SupportOutputSchema = z.object({
  reply: z.string(),
});
export type SupportOutput = z.infer<typeof SupportOutputSchema>;

export async function supportBot(input: SupportInput): Promise<SupportOutput> {
  try {
    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `You are AeroLink-7 (A7), the Tactical Support Node for AeroIntel. 
      AeroIntel is a next-generation aviation intelligence platform specializing in:
      1. 3D Stability Hub: Calculating aircraft load and trim (CG %MAC).
      2. Tactical Earth View: High-res satellite tracking of cargo assets.
      3. Warehouse Intel: Automated robotic grid management and environmental monitoring.
      4. CCTV Security: MFA-protected visual telemetry for authorized personnel.
      
      Your personality is: Technical, professional, efficient, and calm. Use "Mission Control" terminology (e.g., "Transmission received", "Link established", "Telemetry synchronized").
      If a user asks about CCTV, remind them that Global Manager or Security Manager roles are required for access.
      If asked about technical specs, provide high-fidelity data.`,
      prompt: `Inbound Transmission: {{{message}}}`,
      messages: input.history?.map(m => ({
        role: m.role,
        content: [{ text: m.content }]
      })),
    });

    if (!text) throw new Error('Empty node response');

    return { reply: text };
  } catch (error: any) {
    console.error('AeroLink-7 Link Interrupted:', error);
    return { 
      reply: "AeroLink-7 Protocol Warning: Primary intelligence link is transiently unstable. I'm operating on local heuristics. I can assist with basic platform navigation, but complex telemetry analysis requires a stable node handshake. Please resend your last packet." 
    };
  }
}
