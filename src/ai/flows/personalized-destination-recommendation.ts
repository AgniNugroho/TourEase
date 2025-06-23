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

// Schema for the text-only part of the destination info
const DestinationTextInfoSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string().describe('The name of the destination.'),
      description: z.string().describe('A brief description of the destination.'),
      estimatedCost: z
        .string()
        .describe('The estimated cost of traveling to the destination from the user location.'),
    })
  ).describe('A list of recommended travel destinations.'),
});


// The final output schema including the image URL
const PersonalizedDestinationOutputSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string().describe('The name of the destination.'),
      description: z.string().describe('A brief description of the destination.'),
      estimatedCost: z
        .string()
        .describe('The estimated cost of traveling to the destination from the user location.'),
      imageUrl: z.string().url().optional().describe('An optional image of the destination.'),
    })
  ).
  describe('A list of recommended travel destinations, with optional images.'),
});

export type PersonalizedDestinationOutput = z.infer<
  typeof PersonalizedDestinationOutputSchema
>;

export async function getPersonalizedDestinations(
  input: PersonalizedDestinationInput
): Promise<PersonalizedDestinationOutput> {
  return personalizedDestinationFlow(input);
}

// This prompt ONLY generates the text information
const textPrompt = ai.definePrompt({
  name: 'personalizedDestinationTextPrompt',
  input: {schema: PersonalizedDestinationInputSchema},
  output: {schema: DestinationTextInfoSchema}, // Use the text-only schema here
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
    // 1. Get text-based recommendations
    const {output: textOutput} = await textPrompt(input);
    if (!textOutput || !textOutput.destinations) {
        return { destinations: [] };
    }

    // 2. Generate an image for each destination in parallel
    const destinationsWithImages = await Promise.all(
        textOutput.destinations.map(async (destination) => {
            try {
                const { media } = await ai.generate({
                    model: 'googleai/gemini-2.0-flash-preview-image-generation',
                    prompt: `A beautiful, high-quality, realistic photograph of the travel destination: ${destination.name}, Indonesia.`,
                    config: {
                        responseModalities: ['TEXT', 'IMAGE'],
                    }
                });
                return {
                    ...destination,
                    imageUrl: media.url,
                };
            } catch (error) {
                console.error(`Failed to generate image for ${destination.name}:`, error);
                // Return the destination without an image URL if generation fails
                return {
                    ...destination,
                    imageUrl: undefined,
                };
            }
        })
    );

    return { destinations: destinationsWithImages };
  }
);
