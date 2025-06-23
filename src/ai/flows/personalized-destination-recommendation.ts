'use server';
/**
 * @fileOverview File ini mendefinisikan alur Genkit untuk memberikan rekomendasi destinasi wisata yang dipersonalisasi berdasarkan preferensi pengguna.
 *
 * - getPersonalizedDestinations - Fungsi yang menerima preferensi pengguna dan mengembalikan daftar destinasi yang direkomendasikan.
 * - PersonalizedDestinationInput - Tipe input untuk fungsi getPersonalizedDestinations.
 * - PersonalizedDestinationOutput - Tipe output untuk fungsi getPersonalizedDestinations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedDestinationInputSchema = z.object({
  budget: z
    .string()
    .describe('Anggaran pengguna untuk perjalanan (misalnya, rendah, sedang, tinggi).'),
  interests: z
    .string()
    .describe('Minat pengguna (misalnya, alam, budaya, petualangan).'),
  travelStyle: z
    .string()
    .describe('Gaya perjalanan pilihan pengguna (misalnya, solo, keluarga, pasangan).'),
  location: z.string().describe('Lokasi pengguna saat ini.'),
});

export type PersonalizedDestinationInput = z.infer<
  typeof PersonalizedDestinationInputSchema
>;

// Schema for the text-only part of the destination info
const DestinationTextInfoSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string().describe('Nama destinasi.'),
      description: z.string().describe('Deskripsi singkat tentang destinasi.'),
      estimatedCost: z
        .string()
        .describe('Perkiraan biaya perjalanan ke destinasi dari lokasi pengguna.'),
    })
  ).describe('Daftar destinasi wisata yang direkomendasikan.'),
});


// The final output schema including the image URL
const PersonalizedDestinationOutputSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string().describe('Nama destinasi.'),
      description: z.string().describe('Deskripsi singkat tentang destinasi.'),
      estimatedCost: z
        .string()
        .describe('Perkiraan biaya perjalanan ke destinasi dari lokasi pengguna.'),
      imageUrl: z.string().url().optional().describe('Gambar opsional dari destinasi.'),
    })
  ).
  describe('Daftar destinasi wisata yang direkomendasikan, dengan gambar opsional.'),
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
  prompt: `Anda adalah seorang ahli perjalanan yang berspesialisasi dalam pariwisata Indonesia.

  Berdasarkan preferensi pengguna, rekomendasikan beberapa destinasi wisata di Indonesia.
  Sertakan juga deskripsi singkat setiap destinasi dan perkiraan biaya dari lokasi pengguna.
  Gunakan sumber daya blog perjalanan saat ini untuk menyusun rekomendasi Anda.

  Preferensi Pengguna:
  - Anggaran: {{{budget}}}
  - Minat: {{{interests}}}
  - Gaya Perjalanan: {{{travelStyle}}}
  - Lokasi: {{{location}}}

  Harap berikan destinasi dalam format JSON berikut:
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
                    prompt: `Sebuah foto yang indah, berkualitas tinggi, dan realistis dari destinasi wisata: ${destination.name}, Indonesia.`,
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
