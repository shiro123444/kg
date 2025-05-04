import { graphRetriever } from './retriever';
import { deepseekClient } from '../deepseek/client';

export class GraphRAGService {
  async answerQuestion(question: string) {
    try {
      // 1. Retrieve relevant context from the knowledge graph
      const graphContext = await graphRetriever.retrieveRelevantContext(question);
      
      // 2. Format the context for the LLM
      const formattedContext = graphRetriever.formatContextForLLM(graphContext);
      
      // 3. Generate answer using DeepSeek
      const answer = await deepseekClient.generateAnswer(question, formattedContext);
      
      return {
        answer,
        context: graphContext,
        formattedContext
      };
    } catch (error) {
      console.error('Error in GraphRAG service:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const graphRAGService = new GraphRAGService();
