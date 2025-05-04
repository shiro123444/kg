import { NextResponse } from 'next/server';
import { graphRAGService } from '@/lib/graphrag/service';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const result = await graphRAGService.answerQuestion(question);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
