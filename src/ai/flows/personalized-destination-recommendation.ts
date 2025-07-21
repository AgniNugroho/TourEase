
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
import { getPlaceDetails, PlaceDetails } from '@/services/placesService';

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

const DestinationSchema = z.object({
  name: z.string().describe('Nama destinasi.'),
  description: z.string().describe('Deskripsi singkat tentang destinasi.'),
  estimatedCost: z
    .string()
    .describe('Perkiraan biaya perjalanan ke destinasi dari lokasi pengguna.'),
  destinationType: z.string().describe('Tipe destinasi (misalnya, Pantai, Gunung, Museum, Kuliner).'),
  imageUrl: z.string().describe('URL gambar yang akan ditampilkan. HARUS diisi dengan memanggil tool getPlaceInfo.'),
  latitude: z.number().describe('Garis lintang destinasi. HARUS diisi dengan memanggil tool getPlaceInfo.'),
  longitude: z.number().describe('Garis bujur destinasi. HARUS diisi dengan memanggil tool getPlaceInfo.'),
});


const PersonalizedDestinationOutputSchema = z.object({
  destinations: z.array(DestinationSchema).describe('Daftar destinasi wisata yang direkomendasikan.'),
});

export type PersonalizedDestinationOutput = z.infer<
  typeof PersonalizedDestinationOutputSchema
>;

export async function getPersonalizedDestinations(
  input: PersonalizedDestinationInput
): Promise<PersonalizedDestinationOutput> {
  return personalizedDestinationFlow(input);
}

const getPlaceInfo = ai.defineTool(
    {
        name: 'getPlaceInfo',
        description: 'Dapatkan detail untuk sebuah tempat, termasuk URL foto, latitude, dan longitude. Gunakan ini untuk mengisi field imageUrl, latitude, dan longitude.',
        inputSchema: z.object({
            query: z.string().describe('Nama tempat atau destinasi yang akan dicari. Jadikan se-spesifik mungkin, contoh: "Candi Borobudur Magelang" atau "Pantai Kuta Bali".'),
        }),
        outputSchema: z.custom<PlaceDetails>(),
    },
    async (input) => {
        return getPlaceDetails(input.query);
    }
);

const textPrompt = ai.definePrompt({
  name: 'personalizedDestinationTextPrompt',
  input: {schema: PersonalizedDestinationInputSchema},
  output: {schema: PersonalizedDestinationOutputSchema}, 
  tools: [getPlaceInfo],
  prompt: `Anda adalah seorang ahli perjalanan yang berspesialisasi dalam pariwisata Indonesia.

  Berdasarkan preferensi pengguna, rekomendasikan beberapa destinasi wisata di Indonesia.
  Sertakan juga deskripsi singkat setiap destinasi, perkiraan biaya dari lokasi pengguna, dan tipe destinasi (contoh: Pantai, Gunung, Museum, Kuliner, Sejarah).
  Gunakan sumber daya blog perjalanan saat ini untuk menyusun rekomendasi Anda.

  PENTING: Untuk setiap destinasi yang Anda rekomendasikan, Anda WAJIB memanggil tool 'getPlaceInfo' dengan nama destinasi sebagai query untuk mendapatkan URL gambar, latitude, dan longitude yang relevan dan mengisinya ke dalam field yang sesuai. Buat query untuk tool se-spesifik mungkin untuk hasil terbaik.

  Preferensi Pengguna:
  - Anggaran: {{{budget}}}
  - Minat: {{{interests}}}
  - Jumlah Orang: {{{numberOfPeople}}}
  - Lokasi: {{{location}}}

  Harap berikan daftar destinasi dalam format JSON yang diminta.
  `,
});

const personalizedDestinationFlow = ai.defineFlow(
  {
    name: 'personalizedDestinationFlow',
    inputSchema: PersonalizedDestinationInputSchema,
    outputSchema: PersonalizedDestinationOutputSchema,
  },
  async input => {
    const {output} = await textPrompt(input);
    if (!output) {
      return { destinations: [] };
    }
    return output;
  }
);
