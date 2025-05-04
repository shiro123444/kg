import { withNeo4jSession } from './config';

// Get all entities with their types
export async function getAllEntities() {
  return withNeo4jSession(async (session) => {
    const result = await session.run(
      'MATCH (e:Entity) RETURN e.name as name, e.type as type, e.description as description LIMIT 100'
    );
    return result.records.map(record => ({
      name: record.get('name'),
      type: record.get('type'),
      description: record.get('description')
    }));
  });
}

// Get relationships for D3 visualization
export async function getGraphData() {
  return withNeo4jSession(async (session) => {
    const result = await session.run(
      `
      MATCH (n:Entity)-[r]->(m:Entity)
      RETURN n.name as source, n.type as sourceType, 
             m.name as target, m.type as targetType, 
             type(r) as relationship,
             r.type as relationType
      LIMIT 500
      `
    );
    
    const nodes = new Map();
    const links = [];
    
    result.records.forEach(record => {
      const source = record.get('source');
      const target = record.get('target');
      
      if (!nodes.has(source)) {
        nodes.set(source, { id: source, type: record.get('sourceType') });
      }
      if (!nodes.has(target)) {
        nodes.set(target, { id: target, type: record.get('targetType') });
      }
      
      links.push({
        source: source,
        target: target,
        type: record.get('relationType') || record.get('relationship')
      });
    });
    
    return {
      nodes: Array.from(nodes.values()),
      links: links
    };
  });
}

// Search entities by name or description
export async function searchEntities(searchTerm: string) {
  return withNeo4jSession(async (session) => {
    const result = await session.run(
      `
      MATCH (e:Entity)
      WHERE toLower(e.name) CONTAINS toLower($searchTerm)
         OR toLower(e.description) CONTAINS toLower($searchTerm)
      RETURN e.name as name, e.type as type, e.description as description
      LIMIT 20
      `,
      { searchTerm }
    );
    
    return result.records.map(record => ({
      name: record.get('name'),
      type: record.get('type'),
      description: record.get('description')
    }));
  });
}

// Get entity details with relationships
export async function getEntityDetails(entityName: string) {
  return withNeo4jSession(async (session) => {
    const result = await session.run(
      `
      MATCH (e:Entity {name: $entityName})
      OPTIONAL MATCH (e)-[r]->(target:Entity)
      OPTIONAL MATCH (source:Entity)-[r2]->(e)
      RETURN e,
             collect(DISTINCT {
               target: target.name, 
               type: type(r),
               relationType: r.type,
               direction: 'outgoing'
             }) as outgoingRelations,
             collect(DISTINCT {
               source: source.name, 
               type: type(r2),
               relationType: r2.type,
               direction: 'incoming'
             }) as incomingRelations
      `,
      { entityName }
    );
    
    if (result.records.length === 0) return null;
    
    const record = result.records[0];
    const entity = record.get('e').properties;
    
    return {
      ...entity,
      outgoingRelations: record.get('outgoingRelations').filter(rel => rel.target),
      incomingRelations: record.get('incomingRelations').filter(rel => rel.source)
    };
  });
}
