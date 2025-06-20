'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized travel destination recommendations based on user preferences.
 *
 * - getPersonalizedDestinations - A function that takes user preferences and returns a list of recommended destinations.
 * - PersonalizedDestinationInput - The input type for the getPersonalizedDestinations function.
 * - PersonalizedDestinationOutput - The output type for the getPersonalizedDestinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedDestinationInputSchema = z.object({
  budget: z
    .string()
    .describe('The user budget for the trip (e.g., low, medium, high).'),
  interests: z
    .string()
    .describe('The user interests (e.g., nature, culture, adventure).'),
  travelStyle: z
    .string()
    .describe('The user preferred travel style (e.g., solo, family, couple).'),
  location: z.string().describe('The current user location.'),
});

export type PersonalizedDestinationInput = z.infer<
  typeof PersonalizedDestinationInputSchema
>;

const PersonalizedDestinationOutputSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string().describe('The name of the destination.'),
      description: z.string().describe('A brief description of the destination.'),
      estimatedCost: z
        .string()
        .describe('The estimated cost of traveling to the destination from the user location.'),
    })
  ).
  describe('A list of recommended travel destinations.'),
});

export type PersonalizedDestinationOutput = z.infer<
  typeof PersonalizedDestinationOutputSchema
>;

export async function getPersonalizedDestinations(
  input: PersonalizedDestinationInput
): Promise<PersonalizedDestinationOutput> {
  return personalizedDestinationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedDestinationPrompt',
  input: {schema: PersonalizedDestinationInputSchema},
  output: {schema: PersonalizedDestinationOutputSchema},
  prompt: `You are a travel expert specializing in Indonesian tourism.

  Based on the user's preferences, recommend several travel destinations in Indonesia.
  Also, include a brief description of each destination and the estimated cost from the user's location.
  Use current travel blog resources to curate your recommendations.

  User Preferences:
  - Budget: {{{budget}}}
  - Interests: {{{interests}}}
  - Travel Style: {{{travelStyle}}}
  - Location: {{{location}}}

  Please provide the destinations in the following JSON format:
  {{$instructions}}`,
});

const personalizedDestinationFlow = ai.defineFlow(
  {
    name: 'personalizedDestinationFlow',
    inputSchema: PersonalizedDestinationInputSchema,
    outputSchema: PersonalizedDestinationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
