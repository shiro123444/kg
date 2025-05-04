const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Neo4j connection configuration
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD;

if (!password) {
  console.error('❌ NEO4J_PASSWORD not found in environment variables.');
  console.error('Please run: node scripts/test-neo4j-connection.js to configure Neo4j connection.');
  process.exit(1);
}

console.log('Connecting to Neo4j with:');
console.log(`URI: ${uri}`);
console.log(`User: ${user}`);
console.log(`Password: ${'*'.repeat(password.length)}\n`);

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function clearDatabase(session) {
  console.log('Clearing existing database...');
  await session.run('MATCH (n) DETACH DELETE n');
  console.log('Database cleared.');
}

async function createEntities(session, entities) {
  console.log('Creating entities...');
  let successCount = 0;
  for (const entity of entities) {
    try {
      // Clean the type name for use as a label
      const cleanType = entity.type.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Create the entity with both Entity label and specific type label
      await session.run(
        `
        CREATE (e:Entity {
          name: $name,
          type: $type,
          description: $description
        })
        WITH e
        CALL apoc.create.addLabels(e, [$cleanType]) YIELD node
        RETURN node
        `,
        {
          name: entity.name,
          type: entity.type,
          cleanType: cleanType,
          description: entity.description || ''
        }
      );
      successCount++;
    } catch (error) {
      // If APOC is not available, fallback to simpler approach
      try {
        const cleanType = entity.type.replace(/[^a-zA-Z0-9]/g, '_');
        await session.run(
          `CREATE (e:Entity:\`${cleanType}\` {
            name: $name,
            type: $type,
            description: $description
          })`,
          {
            name: entity.name,
            type: entity.type,
            description: entity.description || ''
          }
        );
        successCount++;
      } catch (fallbackError) {
        console.error(`Failed to create entity: ${entity.name}`, fallbackError.message);
      }
    }
  }
  console.log(`Created ${successCount} out of ${entities.length} entities.`);
}

async function createRelationships(session, relationships) {
  console.log('Creating relationships...');
  let successCount = 0;
  
  for (const rel of relationships) {
    try {
      // Map the data structure to expected format
      const from = rel.subject || rel.from;
      const to = rel.object || rel.to;
      const type = rel.predicate || rel.type;
      
      if (!from || !to || !type) {
        console.warn(`Skipping invalid relationship: ${JSON.stringify(rel)}`);
        continue;
      }
      
      // Clean the relationship type
      const cleanType = type.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
      
      const result = await session.run(
        `
        MATCH (from:Entity {name: $from})
        MATCH (to:Entity {name: $to})
        CREATE (from)-[r:\`${cleanType}\` {type: $type}]->(to)
        RETURN r
        `,
        {
          from: from,
          to: to,
          type: type
        }
      );
      
      if (result.records.length > 0) {
        successCount++;
      }
    } catch (error) {
      console.error(`Failed to create relationship: ${JSON.stringify(rel)}`, error.message);
    }
  }
  console.log(`Created ${successCount} out of ${relationships.length} relationships.`);
}

async function verifyConnection() {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('✅ Successfully connected to Neo4j');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Neo4j:', error.message);
    console.error('\nPlease check:');
    console.error('1. Neo4j is running');
    console.error('2. Connection details are correct');
    console.error('3. Run: node scripts/test-neo4j-connection.js');
    return false;
  } finally {
    await session.close();
  }
}

async function importKnowledgeData(filePath) {
  // First verify connection
  const isConnected = await verifyConnection();
  if (!isConnected) {
    process.exit(1);
  }

  const session = driver.session();
  
  try {
    console.log('Starting knowledge data import...');
    
    // Read JSON file
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Clear existing data
    await clearDatabase(session);
    
    // Import entities
    if (data.entities && data.entities.length > 0) {
      await createEntities(session, data.entities);
    }
    
    // Import relationships
    if (data.relationships && data.relationships.length > 0) {
      await createRelationships(session, data.relationships);
    }
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    try {
      await session.run('CREATE INDEX entity_name IF NOT EXISTS FOR (e:Entity) ON (e.name)');
      await session.run('CREATE INDEX entity_type IF NOT EXISTS FOR (e:Entity) ON (e.type)');
    } catch (indexError) {
      console.log('Note: Index creation might require Neo4j Enterprise or indexes might already exist');
    }
    
    console.log('Knowledge data import completed successfully!');
    
    // Verify the import
    const countResult = await session.run(`
      MATCH (n:Entity)
      WITH count(n) as nodeCount
      MATCH ()-[r]->()
      WITH nodeCount, count(r) as relCount
      RETURN nodeCount, relCount
    `);
    const counts = countResult.records[0];
    console.log(`\nVerification: ${counts.get('nodeCount')} nodes and ${counts.get('relCount')} relationships in the database.`);
    
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

// Execute import
const dataPath = 'E:\\ai_neo4j\\ai_knowledge.json';
importKnowledgeData(dataPath).catch(console.error);
