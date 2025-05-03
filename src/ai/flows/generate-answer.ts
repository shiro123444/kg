// src/ai/flows/generate-answer.ts
'use server';

/**
 * @fileOverview An AI agent for generating answers to user questions using the Deepseek API.
 *
 * - generateAnswer - A function that handles the question answering process.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The question to be answered.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The answer to the question.'),
    }),
  },
  prompt: `You are an AI assistant that answers questions.

  Question: {{{question}}}
  Answer: `,
});

const generateAnswerFlow = ai.defineFlow<
  typeof GenerateAnswerInputSchema,
  typeof GenerateAnswerOutputSchema
>(
  {
    name: 'generateAnswerFlow',
    inputSchema: GenerateAnswerInputSchema,
    outputSchema: GenerateAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
