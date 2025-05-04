// src/app/graph/page.tsx
'use client';

import { KnowledgeGraphDisplay } from '@/components/knowledge-graph-display';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { GenerateAnswerOutput } from '@/ai/flows/generate-answer'; // Adjust path if needed

// Derive Node and Edge types from the exported GenerateAnswerOutput type
type Node = NonNullable<GenerateAnswerOutput['nodes']>[number];
type Edge = NonNullable<GenerateAnswerOutput['edges']>[number];

function GraphPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nodesParam = searchParams.get('nodes');
    const edgesParam = searchParams.get('edges');

    try {
      const parsedNodes = nodesParam ? JSON.parse(decodeURIComponent(nodesParam)) : [];
      const parsedEdges = edgesParam ? JSON.parse(decodeURIComponent(edgesParam)) : [];

      // Add basic validation if needed
      if (!Array.isArray(parsedNodes) || !Array.isArray(parsedEdges)) {
          throw new Error("Invalid data format in URL parameters.");
      }

      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setError(null);
    } catch (e) {
      console.error("Error parsing graph data from URL:", e);
      setError("Failed to load graph data. It might be corrupted or missing.");
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
        <div className="w-full flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-center text-foreground flex-grow">
            Knowledge Graph
          </h1>
          <div className="w-10"></div> {/* Spacer to balance the back button */}
        </div>

        {isLoading && <p className="text-muted-foreground">Loading graph data...</p>}
        {error && <p className="text-destructive text-center">{error}</p>}

        {!isLoading && !error && (
            <KnowledgeGraphDisplay nodes={nodes} edges={edges} className="w-full mt-6" />
        )}
      </div>
    </main>
  );
}


// Wrap the component in Suspense for useSearchParams
export default function GraphPage() {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <GraphPageContent />
      </Suspense>
    );
  }
