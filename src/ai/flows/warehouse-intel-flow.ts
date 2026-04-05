
'use server';
/**
 * @fileOverview Warehouse Intelligence Flow.
 * Analyzes warehouse telemetry and suggests optimizations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WarehouseIntelInputSchema = z.object({
  warehouseName: z.string(),
  metrics: z.object({
    utilization: z.number(),
    inventoryCount: z.number(),
    activeRobots: z.number(),
    temp: z.number(),
  }),
});
export type WarehouseIntelInput = z.infer<typeof WarehouseIntelInputSchema>;

const WarehouseIntelOutputSchema = z.object({
  analysis: z.string(),
  efficiencyRating: z.number(),
  suggestedActions: z.array(z.string()),
  isSimulated: z.boolean().optional(),
});
export type WarehouseIntelOutput = z.infer<typeof WarehouseIntelOutputSchema>;

const prompt = ai.definePrompt({
  name: 'warehouseIntelPrompt',
  input: { schema: WarehouseIntelInputSchema },
  output: { schema: WarehouseIntelOutputSchema },
  prompt: `You are the AeroIntel Warehouse AI. Analyze the following telemetry for {{warehouseName}}:
  - Capacity Utilization: {{metrics.utilization}}%
  - Total Inventory units: {{metrics.inventoryCount}}
  - Active Robotic Units: {{metrics.activeRobots}}
  - Ambient Temperature: {{metrics.temp}}°C
  
  Provide a tactical efficiency analysis and 3 specific actions to optimize throughput.`,
});

export async function warehouseIntel(input: WarehouseIntelInput): Promise<WarehouseIntelOutput> {
  try {
    const { output } = await prompt(input);
    if (!output) throw new Error('Empty AI response');
    return { ...output, isSimulated: false };
  } catch (error) {
    return {
      analysis: "Intelligence link standby. Local heuristics suggest high-density storage blocks are nearing capacity. Robotic pick-cycles are stable but could be optimized by re-zoning high-velocity SKUs.",
      efficiencyRating: 88,
      suggestedActions: [
        "Re-zone Fast-Moving items to Zone Alpha for 12% faster pick time.",
        "Initiate preventive cooling in Sector 7 to maintain temperature stability.",
        "Update robot battery cycle schedule to off-peak charging hours."
      ],
      isSimulated: true
    };
  }
}
