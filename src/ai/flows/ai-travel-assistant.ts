// src/ai/flows/ai-travel-assistant.ts
'use server';

/**
 * @fileOverview An AI travel assistant that answers user questions about travel destinations.
 *
 * - aiTravelAssistant - A function that handles the travel assistant process.
 * - AITravelAssistantInput - The input type for the aiTravelAssistant function.
 * - AITravelAssistantOutput - The return type for the aiTravelAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITravelAssistantInputSchema = z.object({
  destination: z.string().describe('The travel destination the user is asking about.'),
  question: z.string().describe('The user question about the travel destination.'),
});
export type AITravelAssistantInput = z.infer<typeof AITravelAssistantInputSchema>;

const AITravelAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question about the travel destination.'),
});
export type AITravelAssistantOutput = z.infer<typeof AITravelAssistantOutputSchema>;

export async function aiTravelAssistant(input: AITravelAssistantInput): Promise<AITravelAssistantOutput> {
  return aiTravelAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTravelAssistantPrompt',
  input: {schema: AITravelAssistantInputSchema},
  output: {schema: AITravelAssistantOutputSchema},
  prompt: `You are a helpful AI travel assistant. You will answer user questions about travel destinations.

Destination: {{{destination}}}
Question: {{{question}}}

Answer:`, 
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
