import fs from 'fs';
import path from 'path';
import { driver, withNeo4jSession } from './config';

interface Entity {
  name: string;
  type: string;
  description?: string;
}

interface Relationship {
  from: string;
  to: string;
  type: string;
}

interface KnowledgeData {
  entities: Entity[];
  relationships: Relationship[];
}

async function clearDatabase() {
  console.log('Clearing existing database...');
  await withNeo4jSession(async (session) => {
    await session.run('MATCH (n) DETACH DELETE n');
  });
  console.log('Database cleared.');
}

async function createEntities(entities: Entity[]) {
  console.log('Creating entities...');
  await withNeo4jSession(async (session) => {
    for (const entity of entities) {
      await session.run(
        `
        CREATE (e:Entity {
          name: $name,
          type: $type,
          description: $description
        })
        WITH e
        CALL apoc.create.addLabels(e, [$type]) YIELD node
        RETURN node
        `,
        {
          name: entity.name,
          type: entity.type,
          description: entity.description || ''
        }
      );
    }
  });
  console.log(`Created ${entities.length} entities.`);
}

async function createRelationships(relationships: Relationship[]) {
  console.log('Creating relationships...');
  await withNeo4jSession(async (session) => {
    for (const rel of relationships) {
      await session.run(
        `
        MATCH (from:Entity {name: $from})
        MATCH (to:Entity {name: $to})
        CREATE (from)-[r:RELATION {type: $type}]->(to)
        RETURN r
        `,
        {
          from: rel.from,
          to: rel.to,
          type: rel.type
        }
      );
    }
  });
  console.log(`Created ${relationships.length} relationships.`);
}

export async function importKnowledgeData(filePath: string) {
  try {
    console.log('Starting knowledge data import...');
    
    // Read JSON file
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data: KnowledgeData = JSON.parse(rawData);
    
    // Clear existing data
    await clearDatabase();
    
    // Import entities
    if (data.entities && data.entities.length > 0) {
      await createEntities(data.entities);
    }
    
    // Import relationships
    if (data.relationships && data.relationships.length > 0) {
      await createRelationships(data.relationships);
    }
    
    console.log('Knowledge data import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await driver.close();
  }
}

// If executed directly
if (require.main === module) {
  const dataPath = 'E:\\ai_neo4j\\ai_knowledge.json';
  importKnowledgeData(dataPath).catch(console.error);
}
