import neo4j from 'neo4j-driver';

// Neo4j connection configuration
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

// Create Neo4j driver instance
export const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Session management helper
export async function withNeo4jSession<T>(operation: (session: any) => Promise<T>): Promise<T> {
  const session = driver.session();
  try {
    return await operation(session);
  } finally {
    await session.close();
  }
}

// Verify connection
export async function verifyConnection(): Promise<boolean> {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('Successfully connected to Neo4j');
    return true;
  } catch (error) {
    console.error('Failed to connect to Neo4j:', error);
    return false;
  } finally {
    await session.close();
  }
}
