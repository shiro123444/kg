import { withNeo4jSession } from '../neo4j/config';
import { deepseekClient } from '../deepseek/client';

export class GraphRetriever {
  /**
   * Retrieve relevant entities and relationships based on the question
   */
  async retrieveRelevantContext(question: string) {
    return withNeo4jSession(async (session) => {
      // First, find entities mentioned in the question
      const entitiesResult = await session.run(`
        MATCH (e:Entity)
        WHERE toLower($question) CONTAINS toLower(e.name)
        RETURN e
        LIMIT 10
      `, { question });

      const mentionedEntities = entitiesResult.records.map(record => 
        record.get('e').properties
      );

      // If entities are found, get their relationships and neighbors
      if (mentionedEntities.length > 0) {
        const entityNames = mentionedEntities.map(e => e.name);
        
        const contextResult = await session.run(`
          MATCH (e:Entity)-[r]-(related:Entity)
          WHERE e.name IN $entityNames
          RETURN e, type(r) as relType, r.type as relationType, related,
                 CASE WHEN startNode(r) = e THEN 'outgoing' ELSE 'incoming' END as direction
          LIMIT 50
        `, { entityNames });

        const context = {
          entities: mentionedEntities,
          relationships: [],
          relatedEntities: new Map()
        };

        contextResult.records.forEach(record => {
          const source = record.get('e').properties;
          const target = record.get('related').properties;
          const relType = record.get('relationType') || record.get('relType');
          const direction = record.get('direction');

          if (direction === 'outgoing') {
            context.relationships.push({
              source: source.name,
              target: target.name,
              type: relType
            });
          } else {
            context.relationships.push({
              source: target.name,
              target: source.name,
              type: relType
            });
          }

          if (!context.relatedEntities.has(target.name)) {
            context.relatedEntities.set(target.name, target);
          }
        });

        return {
          entities: mentionedEntities,
          relationships: context.relationships,
          relatedEntities: Array.from(context.relatedEntities.values())
        };
      }

      // If no entities found, try semantic search (simple keyword matching)
      const semanticResult = await session.run(`
        MATCH (e:Entity)
        WHERE e.description CONTAINS $question OR e.name CONTAINS $question
        RETURN e
        LIMIT 10
      `, { question });

      return {
        entities: semanticResult.records.map(record => record.get('e').properties),
        relationships: [],
        relatedEntities: []
      };
    });
  }

  /**
   * Generate a text context from the retrieved graph data
   */
  formatContextForLLM(graphContext: any): string {
    let context = '相关实体：\n';
    
    // Format main entities
    graphContext.entities.forEach((entity: any) => {
      context += `- ${entity.name} (${entity.type}): ${entity.description || '无描述'}\n`;
    });

    // Format relationships
    if (graphContext.relationships.length > 0) {
      context += '\n相关关系：\n';
      graphContext.relationships.forEach((rel: any) => {
        context += `- ${rel.source} ${rel.type} ${rel.target}\n`;
      });
    }

    // Format related entities
    if (graphContext.relatedEntities.length > 0) {
      context += '\n相关联的实体：\n';
      graphContext.relatedEntities.forEach((entity: any) => {
        context += `- ${entity.name} (${entity.type}): ${entity.description || '无描述'}\n`;
      });
    }

    return context;
  }
}

// Create singleton instance
export const graphRetriever = new GraphRetriever();
