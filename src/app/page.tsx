'use client';

import type { GenerateAnswerInput, GenerateAnswerOutput } from '@/ai/flows/generate-answer';
import { generateAnswer } from '@/ai/flows/generate-answer';
import { QuestionInput } from '@/components/question-input';
import { QADisplay } from '@/components/qa-display';
import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionSubmit = async (inputQuestion: string) => {
    if (!inputQuestion.trim()) return;

    setQuestion(inputQuestion);
    setAnswer(null);
    setIsLoading(true);
    setError(null);

    try {
      const input: GenerateAnswerInput = { question: inputQuestion };
      const result: GenerateAnswerOutput = await generateAnswer(input);
      setAnswer(result.answer);
    } catch (err) {
      console.error('Error generating answer:', err);
      setError('Sorry, something went wrong while generating the answer. Please try again.');
    } finally {
      setIsLoading(false);
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
      </div>
    </main>
  );
}
