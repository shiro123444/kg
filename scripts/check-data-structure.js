const fs = require('fs');
const path = require('path');

function checkDataStructure(filePath) {
  try {
    console.log('Checking data structure...\n');
    
    // Read JSON file
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Check entities
    console.log('=== ENTITIES ===');
    if (data.entities && Array.isArray(data.entities)) {
      console.log(`Total entities: ${data.entities.length}`);
      
      // Check first few entities
      console.log('\nFirst 3 entities:');
      data.entities.slice(0, 3).forEach((entity, index) => {
        console.log(`Entity ${index + 1}:`, JSON.stringify(entity, null, 2));
      });
      
      // Check for missing properties
      const entitiesWithMissingProps = data.entities.filter(e => !e.name || !e.type);
      if (entitiesWithMissingProps.length > 0) {
        console.log(`\n⚠️  ${entitiesWithMissingProps.length} entities with missing name or type`);
      }
    } else {
      console.log('❌ No entities array found');
    }
    
    // Check relationships
    console.log('\n=== RELATIONSHIPS ===');
    if (data.relationships && Array.isArray(data.relationships)) {
      console.log(`Total relationships: ${data.relationships.length}`);
      
      // Check first few relationships
      console.log('\nFirst 5 relationships:');
      data.relationships.slice(0, 5).forEach((rel, index) => {
        console.log(`Relationship ${index + 1}:`, JSON.stringify(rel, null, 2));
      });
      
      // Check for missing properties
      const invalidRelationships = data.relationships.filter(r => !r.from || !r.to || !r.type);
      if (invalidRelationships.length > 0) {
        console.log(`\n⚠️  ${invalidRelationships.length} relationships with missing from, to, or type`);
        console.log('\nFirst 5 invalid relationships:');
        invalidRelationships.slice(0, 5).forEach((rel, index) => {
          console.log(`Invalid ${index + 1}:`, JSON.stringify(rel, null, 2));
        });
      }
      
      // Check if relationship properties might have different names
      if (data.relationships.length > 0) {
        const firstRel = data.relationships[0];
        console.log('\nFirst relationship keys:', Object.keys(firstRel));
      }
    } else {
      console.log('❌ No relationships array found');
    }
    
    // Check for alternative relationship property names
    if (data.relations) {
      console.log('\n⚠️  Found "relations" property instead of "relationships"');
      console.log(`Total relations: ${data.relations.length}`);
    }
    
  } catch (error) {
    console.error('Error checking data structure:', error);
  }
}

// Execute check
const dataPath = 'E:\\ai_neo4j\\ai_knowledge.json';
checkDataStructure(dataPath);
