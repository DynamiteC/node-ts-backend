import type { FastifyInstance } from 'fastify';
import '@fastify/postgres';
import '@fastify/mysql';
import '@fastify/mongodb';

export class UserService {
  constructor(private app: FastifyInstance) {}

  async findAll() {
    // Demonstration of raw query with fallback if DB not enabled

    // Postgres
    if (this.app.pg) {
      const { rows } = await this.app.pg.query('SELECT * FROM users');
      return rows;
    }

    // MySQL
    if (this.app.mysql) {
      // @fastify/mysql types are sometimes tricky with Promise wrapper, ensuring it's treated as promise
      const [rows] = await this.app.mysql.query('SELECT * FROM users');
      return rows;
    }

    // Mongo
    if (this.app.mongo) {
        return await this.app.mongo.db?.collection('users').find().toArray();
    }

    // Fallback Mock
    return [{ id: 1, name: 'Mock User', email: 'mock@example.com' }];
  }

  async create(data: { name: string; email: string }) {
      // Postgres
      if (this.app.pg) {
          const { rows } = await this.app.pg.query(
              'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
              [data.name, data.email]
          );
          return rows[0];
      }

      // MySQL
      if (this.app.mysql) {
          const [result] = await this.app.mysql.query(
              'INSERT INTO users (name, email) VALUES (?, ?)',
              [data.name, data.email]
          );
          return { id: (result as any).insertId, ...data };
      }

      // Mongo
      if (this.app.mongo) {
          const result = await this.app.mongo.db?.collection('users').insertOne(data);
          return { _id: result?.insertedId, ...data };
      }

      return { id: Date.now(), ...data };
  }
}
