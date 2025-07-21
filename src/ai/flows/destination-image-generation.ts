// src/ai/flows/destination-image-generation.ts
'use server';
/**
 * @fileOverview Alur Genkit untuk membuat gambar untuk destinasi wisata tertentu.
 *
 * - generateDestinationImage - Fungsi yang menerima nama dan tipe destinasi, lalu mengembalikan URL gambar.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input and Output schemas defined inside the function to keep the file exporting only the async function.
export async function generateDestinationImage(input: { name: string, destinationType: string }): Promise<{ imageUrl?: string }> {
    const GenerateDestinationImageInputSchema = z.object({
        name: z.string().describe('Nama destinasi.'),
        destinationType: z.string().describe('Tipe destinasi (misalnya, Pantai, Gunung).'),
    });

    const validatedInput = GenerateDestinationImageInputSchema.parse(input);

    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Sebuah foto yang indah, berkualitas tinggi, dan realistis dari destinasi wisata di Indonesia: ${validatedInput.name}. Tipe: ${validatedInput.destinationType}.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return { imageUrl: media.url };
    } catch (error) {
        console.error(`Gagal membuat gambar untuk ${validatedInput.name}:`, error);
        // Return an empty object or one with undefined imageUrl on failure
        return { imageUrl: undefined };
    }
}
