// Mock internal safe connector
// "Never use raw SQL outside queries.json" implies we read from json and execute via this connector.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Simplified mock. In real life, this would connect to a DB pool.
export class SafeConnector {
  async query<T>(
    queryFile: string,
    queryName: string,
    _params: Record<string, unknown> = {},
  ): Promise<T[]> {
    const queriesPath = path.resolve(process.cwd(), queryFile);
    try {
      const queriesContent = await readFile(queriesPath, 'utf-8');
      const queries = JSON.parse(queriesContent);
      if (!queries[queryName]) {
        throw new Error(`Query ${queryName} not found in ${queryFile}`);
      }
      // Mock execution
      // console.log(`Executing ${queryName} with params`, _params);

      return [] as T[];
    } catch (e) {
      throw new Error(`DB Error executing ${queryName}: ${e}`);
    }
  }

  // Support for ACID transactions
  // In a real implementation, this would get a client from the pool, BEGIN, run the callback, COMMIT/ROLLBACK.
  async runTransaction<T>(callback: (tx: SafeConnector) => Promise<T>): Promise<T> {
    // console.log('BEGIN TRANSACTION');
    // We intentionally keep the try/catch block to simulate where transaction logic (COMMIT/ROLLBACK) would reside
    try {
      const result = await callback(this);
      // console.log('COMMIT');
      return result;
    } catch (e) {
      // console.log('ROLLBACK');
      // biome-ignore lint/complexity/noUselessCatch: Boilerplate structure for transaction handling
      throw e;
    }
  }
}

export const db = new SafeConnector();
