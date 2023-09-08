import knex from 'knex';

export const connection = knex({
  client: 'better-sqlite3',
  connection: {
    filename: './data/data.db',
  },
  useNullAsDefault: true
});