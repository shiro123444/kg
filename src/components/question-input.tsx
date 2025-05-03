'use client';

import { useState } from 'react';
import type * as React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function QuestionInput({ onSubmit, isLoading = false, className }: QuestionInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onSubmit(question);
    // Optionally clear the input after submit
    // setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('w-full flex flex-col items-center space-y-4 animate-fade-in', className)}
    >
      <div className="relative w-full">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="pr-16 rounded-lg shadow-sm resize-none min-h-[60px] focus:ring-2 focus:ring-primary/50 transition-shadow duration-200 ease-in-out"
          rows={1}
          disabled={isLoading}
          aria-label="Question input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 bottom-2 rounded-full w-10 h-10"
          disabled={isLoading || !question.trim()}
          aria-label={isLoading ? "Submitting question" : "Submit question"}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
