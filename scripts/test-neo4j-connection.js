const neo4j = require('neo4j-driver');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(uri, user, password) {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  
  try {
    console.log('Testing connection to Neo4j...');
    await session.run('RETURN 1');
    console.log('✅ Successfully connected to Neo4j!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Neo4j:', error.message);
    return false;
  } finally {
    await session.close();
    await driver.close();
  }
}

async function main() {
  console.log('Neo4j Connection Tester');
  console.log('=======================\n');
  
  // Get connection details from user
  const uri = await question('Enter Neo4j URI (default: bolt://localhost:7687): ') || 'bolt://localhost:7687';
  const user = await question('Enter Neo4j username (default: neo4j): ') || 'neo4j';
  const password = await question('Enter Neo4j password: ');
  
  if (!password) {
    console.log('❌ Password is required!');
    rl.close();
    return;
  }
  
  console.log('\nTesting connection with:');
  console.log(`URI: ${uri}`);
  console.log(`User: ${user}`);
  console.log(`Password: ${'*'.repeat(password.length)}\n`);
  
  const success = await testConnection(uri, user, password);
  
  if (success) {
    console.log('\nWould you like to save these settings to .env.local? (y/n)');
    const save = await question('> ');
    
    if (save.toLowerCase() === 'y') {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      
      // Update or add Neo4j settings
      const envLines = envContent.split('\n');
      const updatedLines = envLines.filter(line => !line.startsWith('NEO4J_'));
      
      updatedLines.push(`NEO4J_URI=${uri}`);
      updatedLines.push(`NEO4J_USER=${user}`);
      updatedLines.push(`NEO4J_PASSWORD=${password}`);
      
      fs.writeFileSync(envPath, updatedLines.join('\n'));
      console.log('✅ Settings saved to .env.local');
    }
  }
  
  rl.close();
}

main().catch(console.error);
