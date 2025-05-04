'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface QADisplayProps {
  question: string;
  answer: string | null;
  isLoading: boolean;
  className?: string;
}

export function QADisplay({ question, answer, isLoading, className }: QADisplayProps) {
  return (
    <div className={cn('w-full space-y-6 animate-slide-up', className)}>
      {/* Question Card */}
      <Card className="w-full shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/30 p-4 border-b">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium text-foreground/90">Your Question</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <p className="text-foreground/80 whitespace-pre-wrap">{question}</p>
        </CardContent>
      </Card>

      {/* Answer Card */}
      {(answer || isLoading) && (
        <Card className="w-full shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/30 p-4 border-b">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium text-foreground/90">AI Answer</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ) : (
              <p className="text-foreground/80 whitespace-pre-wrap">{answer}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
