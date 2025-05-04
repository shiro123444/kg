// src/ai/flows/generate-answer.ts
'use server';

/**
 * @fileOverview An AI agent for generating answers to user questions and extracting a simple knowledge graph.
 *
 * - generateAnswer - A function that handles the question answering process and graph extraction.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function, including answer and optional graph data.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

// Define schemas for nodes and edges
const NodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node (e.g., the entity name).'),
  label: z.string().describe('Display label for the node.'),
  type: z.string().optional().describe('Optional type or category of the node (e.g., Person, Place, Concept).')
});

const EdgeSchema = z.object({
  id: z.string().describe('Unique identifier for the edge (e.g., sourceId_targetId_type).'),
  source: z.string().describe('ID of the source node.'),
  target: z.string().describe('ID of the target node.'),
  label: z.string().describe('Label describing the relationship between the nodes.')
});

// NOTE: GenerateAnswerOutputSchema is NOT exported directly due to 'use server' constraints.
// Types are derived from GenerateAnswerOutput instead.
const GenerateAnswerOutputSchema = z.object({
  answer: z.string().describe('The textual answer to the question.'),
  nodes: z.array(NodeSchema).optional().describe('Optional list of nodes identified in the question or answer.'),
  edges: z.array(EdgeSchema).optional().describe('Optional list of relationships (edges) between the identified nodes.'),
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
    schema: GenerateAnswerOutputSchema, // Internal use is fine
  },
  prompt: `You are an AI assistant inspired by Apple's design philosophy - clean, intuitive, and helpful. Answer the user's question clearly and concisely.

In addition to providing the answer, analyze the question and your generated answer to identify key entities and their relationships. Extract these as a simple knowledge graph structure.

Represent the graph with:
1.  **nodes**: An array of objects, each with 'id' (unique name/identifier), 'label' (display name), and optionally 'type'.
2.  **edges**: An array of objects, each with 'id' (unique identifier, e.g., source_target_relation), 'source' (source node id), 'target' (target node id), and 'label' (relationship description).

If no clear entities or relationships are found, return empty arrays for nodes and edges.

User Question:
{{{question}}}

Your Answer and Knowledge Graph:`,
});


const generateAnswerFlow = ai.defineFlow<
  typeof GenerateAnswerInputSchema,
  typeof GenerateAnswerOutputSchema // Flow definition still uses the internal schema
>(
  {
    name: 'generateAnswerFlow',
    inputSchema: GenerateAnswerInputSchema,
    outputSchema: GenerateAnswerOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);

    // Ensure output is not null and provides default empty arrays if nodes/edges are missing
    const validatedOutput: GenerateAnswerOutput = {
        answer: output?.answer ?? 'Sorry, I could not generate an answer.',
        nodes: output?.nodes ?? [],
        edges: output?.edges ?? [],
    };

    // Basic validation/cleaning (optional)
    // Ensure unique node IDs
    const nodeIds = new Set<string>();
    validatedOutput.nodes = validatedOutput.nodes?.filter(node => {
        if (!node.id || nodeIds.has(node.id)) return false;
        nodeIds.add(node.id);
        return true;
    });

    // Ensure edges connect existing nodes and have unique IDs
    const edgeIds = new Set<string>();
    validatedOutput.edges = validatedOutput.edges?.filter(edge => {
        if (!edge.id || edgeIds.has(edge.id) || !nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return false;
        edgeIds.add(edge.id);
        return true;
    });


    return validatedOutput;
  }
);
