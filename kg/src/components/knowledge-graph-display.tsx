// src/components/knowledge-graph-display.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { GenerateAnswerOutput } from '@/ai/flows/generate-answer'; // Adjust path if needed

// Derive Node and Edge types from the exported GenerateAnswerOutput type
type Node = NonNullable<GenerateAnswerOutput['nodes']>[number];
type Edge = NonNullable<GenerateAnswerOutput['edges']>[number];


interface KnowledgeGraphDisplayProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

export function KnowledgeGraphDisplay({ nodes, edges, className }: KnowledgeGraphDisplayProps) {

    if (!nodes || nodes.length === 0) {
        return (
          <div className={cn("w-full text-center text-muted-foreground", className)}>
            No graph data to display.
          </div>
        );
      }


  return (
    <div className={cn('w-full space-y-6', className)}>
      <Card className="w-full shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-secondary/30 p-4 border-b">
          <CardTitle className="text-lg font-medium text-foreground/90">Detected Entities (Nodes)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-2">
          {nodes.map((node) => (
            <div key={node.id} className="text-sm text-foreground/80 bg-muted/50 p-2 rounded-md">
              <span className="font-semibold">ID:</span> {node.id} |{' '}
              <span className="font-semibold">Label:</span> {node.label}
              {node.type && (
                <> | <span className="font-semibold">Type:</span> {node.type}</>
              )}
            </div>
          ))}
          {nodes.length === 0 && <p className="text-muted-foreground text-sm">No nodes found.</p>}
        </CardContent>
      </Card>

      {edges && edges.length > 0 && (
        <Card className="w-full shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-secondary/30 p-4 border-b">
            <CardTitle className="text-lg font-medium text-foreground/90">Detected Relationships (Edges)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-2">
            {edges.map((edge) => (
              <div key={edge.id} className="text-sm text-foreground/80 bg-muted/50 p-2 rounded-md">
                 <span className="font-semibold">ID:</span> {edge.id} |{' '}
                 <span className="font-semibold">Source:</span> {edge.source} -&gt;{' '}
                 <span className="font-semibold">Target:</span> {edge.target} |{' '}
                 <span className="font-semibold">Label:</span> {edge.label}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
