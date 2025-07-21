
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a single image for a given travel destination.
 *
 * - generateDestinationImage - A function that takes destination details and returns an image URL.
 * - GenerateDestinationImageInput - The input type for the generateDestinationImage function.
 * - GenerateDestinationImageOutput - The return type for the generateDestinationImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateDestinationImageInputSchema = z.object({
  name: z.string().describe('Nama destinasi.'),
  destinationType: z.string().describe('Tipe destinasi (misalnya, Pantai, Gunung, Museum, Kuliner).'),
});
export type GenerateDestinationImageInput = z.infer<typeof GenerateDestinationImageInputSchema>;

export const GenerateDestinationImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('URL gambar yang dihasilkan untuk destinasi.'),
});
export type GenerateDestinationImageOutput = z.infer<typeof GenerateDestinationImageOutputSchema>;

export async function generateDestinationImage(
  input: GenerateDestinationImageInput
): Promise<GenerateDestinationImageOutput> {
  return generateDestinationImageFlow(input);
}

const generateDestinationImageFlow = ai.defineFlow(
  {
    name: 'generateDestinationImageFlow',
    inputSchema: GenerateDestinationImageInputSchema,
    outputSchema: GenerateDestinationImageOutputSchema,
  },
  async (destination) => {
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Sebuah foto yang indah, berkualitas tinggi, dan realistis dari destinasi wisata: ${destination.name}, Indonesia. Tipe: ${destination.destinationType}.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            }
        });
        if (!media.url) {
            throw new Error("No media URL returned from image generation model.");
        }
        return {
            imageUrl: media.url,
        };
    } catch (error) {
        console.error(`Failed to generate image for ${destination.name}:`, error);
        throw new Error(`Gagal membuat gambar untuk ${destination.name}.`);
    }
  }
);
