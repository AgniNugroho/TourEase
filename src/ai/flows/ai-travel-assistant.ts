// src/ai/flows/ai-travel-assistant.ts
'use server';

/**
 * @fileOverview Asisten perjalanan AI yang menjawab pertanyaan pengguna tentang destinasi wisata.
 *
 * - aiTravelAssistant - Fungsi yang menangani proses asisten perjalanan.
 * - AITravelAssistantInput - Tipe input untuk fungsi aiTravelAssistant.
 * - AITravelAssistantOutput - Tipe kembalian untuk fungsi aiTravelAssistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITravelAssistantInputSchema = z.object({
  destination: z.string().describe('Destinasi wisata yang ditanyakan oleh pengguna.'),
  question: z.string().describe('Pertanyaan pengguna tentang destinasi wisata.'),
});
export type AITravelAssistantInput = z.infer<typeof AITravelAssistantInputSchema>;

const AITravelAssistantOutputSchema = z.object({
  answer: z.string().describe('Jawaban atas pertanyaan pengguna tentang destinasi wisata.'),
});
export type AITravelAssistantOutput = z.infer<typeof AITravelAssistantOutputSchema>;

export async function aiTravelAssistant(input: AITravelAssistantInput): Promise<AITravelAssistantOutput> {
  return aiTravelAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTravelAssistantPrompt',
  input: {schema: AITravelAssistantInputSchema},
  output: {schema: AITravelAssistantOutputSchema},
  prompt: `Anda adalah asisten perjalanan AI yang membantu. Anda akan menjawab pertanyaan pengguna tentang destinasi wisata.

Destinasi: {{{destination}}}
Pertanyaan: {{{question}}}

Jawaban:`, 
});

const aiTravelAssistantFlow = ai.defineFlow(
  {
    name: 'aiTravelAssistantFlow',
    inputSchema: AITravelAssistantInputSchema,
    outputSchema: AITravelAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
