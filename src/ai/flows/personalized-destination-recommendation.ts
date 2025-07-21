
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
    .describe('Anggaran pengguna untuk perjalanan (misalnya, Dibawah Rp 1.000.000, Rp 1.000.000 - Rp 5.000.000, Diatas Rp 5.000.000).'),
  interests: z
    .string()
    .describe('Minat pengguna (misalnya, alam, budaya, petualangan).'),
  numberOfPeople: z
    .string()
    .describe('Jumlah orang yang akan bepergian (misalnya, 1 orang, 2 orang, 3-5 orang).'),
  location: z.string().describe('Lokasi pengguna saat ini.'),
});

export type PersonalizedDestinationInput = z.infer<
  typeof PersonalizedDestinationInputSchema
>;

const PersonalizedDestinationOutputSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string().describe('Nama destinasi.'),
      description: z.string().describe('Deskripsi singkat tentang destinasi.'),
      estimatedCost: z
        .string()
        .describe('Perkiraan biaya perjalanan ke destinasi dari lokasi pengguna.'),
      destinationType: z.string().describe('Tipe destinasi (misalnya, Pantai, Gunung, Museum, Kuliner).'),
      imageUrl: z.string().optional().describe('URL gambar yang akan dibuat nanti.'),
    })
  ).describe('Daftar destinasi wisata yang direkomendasikan.'),
});

export type PersonalizedDestinationOutput = z.infer<
  typeof PersonalizedDestinationOutputSchema
>;

export async function getPersonalizedDestinations(
  input: PersonalizedDestinationInput
): Promise<PersonalizedDestinationOutput> {
  return personalizedDestinationFlow(input);
}

const textPrompt = ai.definePrompt({
  name: 'personalizedDestinationTextPrompt',
  input: {schema: PersonalizedDestinationInputSchema},
  output: {schema: PersonalizedDestinationOutputSchema}, 
  prompt: `Anda adalah seorang ahli perjalanan yang berspesialisasi dalam pariwisata Indonesia.

  Berdasarkan preferensi pengguna, rekomendasikan beberapa destinasi wisata di Indonesia.
  Sertakan juga deskripsi singkat setiap destinasi, perkiraan biaya dari lokasi pengguna, dan tipe destinasi (contoh: Pantai, Gunung, Museum, Kuliner, Sejarah).
  Gunakan sumber daya blog perjalanan saat ini untuk menyusun rekomendasi Anda.

  Preferensi Pengguna:
  - Anggaran: {{{budget}}}
  - Minat: {{{interests}}}
  - Jumlah Orang: {{{numberOfPeople}}}
  - Lokasi: {{{location}}}

  Harap berikan destinasi dalam format JSON berikut. Jangan membuat gambar, biarkan imageUrl kosong.
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
    const {output} = await textPrompt(input);
    if (!output || !output.destinations) {
        return { destinations: [] };
    }
    
    // The image will be generated on demand when the user saves a destination.
    // For the initial list, we can leave imageUrl empty.
    const destinationsWithoutImages = output.destinations.map(dest => ({
        ...dest,
        imageUrl: undefined,
    }));
    
    return { destinations: destinationsWithoutImages };
  }
);
