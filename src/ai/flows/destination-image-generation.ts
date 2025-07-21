
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a single image for a given travel destination.
 *
 * - generateDestinationImage - A function that takes destination details and returns an image URL.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

type GenerateDestinationImageInput = {
  name: string;
  destinationType: string;
};

type GenerateDestinationImageOutput = {
  imageUrl: string;
};

export async function generateDestinationImage(
  input: GenerateDestinationImageInput
): Promise<GenerateDestinationImageOutput> {
  const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Sebuah foto yang indah, berkualitas tinggi, dan realistis dari destinasi wisata: ${input.name}, Indonesia. Tipe: ${input.destinationType}.`,
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
}
