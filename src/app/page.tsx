// src/app/page.tsx
'use client';

import type { GenerateAnswerInput, GenerateAnswerOutput } from '@/ai/flows/generate-answer';
import { generateAnswer } from '@/ai/flows/generate-answer'; // Import the function and type
import { QuestionInput } from '@/components/question-input';
import { QADisplay } from '@/components/qa-display';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Use next/navigation
import { useState } from 'react';

// Derive Node and Edge types from the exported GenerateAnswerOutput type
type Node = NonNullable<GenerateAnswerOutput['nodes']>[number];
type Edge = NonNullable<GenerateAnswerOutput['edges']>[number];

export default function Home() {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleQuestionSubmit = async (inputQuestion: string) => {
    if (!inputQuestion.trim()) return;

    setQuestion(inputQuestion);
    setAnswer(null);
    setGraphData(null); // Reset graph data
    setIsLoading(true);
    setError(null);

    try {
      const input: GenerateAnswerInput = { question: inputQuestion };
      const result: GenerateAnswerOutput = await generateAnswer(input);
      setAnswer(result.answer);
      // Store graph data if present
      if (result.nodes && result.edges && result.nodes.length > 0) {
        setGraphData({ nodes: result.nodes, edges: result.edges });
      } else {
        setGraphData(null);
      }
    } catch (err) {
      console.error('Error generating answer:', err);
      setError('Sorry, something went wrong while generating the answer. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to generate answer. Please check the console for details.',
        variant: 'destructive',
      });
      setGraphData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGraph = () => {
    if (graphData) {
      // Pass data via query params (URL encoding needed for complex objects)
      // Stringify and encode the data
      const nodesParam = encodeURIComponent(JSON.stringify(graphData.nodes));
      const edgesParam = encodeURIComponent(JSON.stringify(graphData.edges));
      router.push(`/graph?nodes=${nodesParam}&edges=${edgesParam}`);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-foreground">
          AppleQ&amp;A
        </h1>

        <QuestionInput onSubmit={handleQuestionSubmit} isLoading={isLoading} />

        {error && <p className="text-destructive text-center">{error}</p>}

        {(isLoading || question) && (
          <QADisplay question={question} answer={answer} isLoading={isLoading} />
        )}

        {/* Conditionally render View Graph button */}
        {!isLoading && graphData && (
          <Button
            onClick={handleViewGraph}
            variant="outline"
            className="mt-4 animate-fade-in"
            aria-label="View Knowledge Graph"
          >
            <Share2 className="mr-2 h-4 w-4" />
            View Knowledge Graph
          </Button>
        )}
      </div>
    </main>
  );
}
