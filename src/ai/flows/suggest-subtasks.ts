// Implemented the suggestSubtasks flow using Genkit to provide users with relevant subtask suggestions for better task management.

'use server';
/**
 * @fileOverview This file defines a Genkit flow to suggest subtasks for a given task.
 *
 * - suggestSubtasks - A function that takes a task description and returns a list of suggested subtasks.
 * - SuggestSubtasksInput - The input type for the suggestSubtasks function.
 * - SuggestSubtasksOutput - The return type for the suggestSubtasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSubtasksInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the main task for which subtasks are to be suggested.'),
});
export type SuggestSubtasksInput = z.infer<typeof SuggestSubtasksInputSchema>;

const SuggestSubtasksOutputSchema = z.object({
  subtasks: z
    .array(z.string())
    .describe('An array of suggested subtasks for the given task.'),
});
export type SuggestSubtasksOutput = z.infer<typeof SuggestSubtasksOutputSchema>;

export async function suggestSubtasks(input: SuggestSubtasksInput): Promise<SuggestSubtasksOutput> {
  return suggestSubtasksFlow(input);
}

const suggestSubtasksPrompt = ai.definePrompt({
  name: 'suggestSubtasksPrompt',
  input: {schema: SuggestSubtasksInputSchema},
  output: {schema: SuggestSubtasksOutputSchema},
  prompt: `You are a helpful task management assistant. Your goal is to suggest subtasks for a given task.

  Task Description: {{{taskDescription}}}

  Please provide a list of subtasks that would help the user break down the main task into smaller, more manageable steps.
  The subtasks should be clear, concise, and actionable.

  Format the output as a JSON object with a "subtasks" array containing the suggested subtasks.
  `,
});

const suggestSubtasksFlow = ai.defineFlow(
  {
    name: 'suggestSubtasksFlow',
    inputSchema: SuggestSubtasksInputSchema,
    outputSchema: SuggestSubtasksOutputSchema,
  },
  async input => {
    const {output} = await suggestSubtasksPrompt(input);
    return output!;
  }
);
