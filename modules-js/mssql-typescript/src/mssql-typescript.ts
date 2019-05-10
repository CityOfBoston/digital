/**
 * @fileOverview
 *
 * This file exports functions from `sql-ts`. It was historically its own module
 * because of versioning conflicts with knex and mssql.
 *
 * We have dependencies on mssql because knex dynamically depends on it. We also
 * pull in the knex TypeScript types because sql-ts uses them.
 */

import sqlts, { Config } from '@rmp135/sql-ts';
import { DecoratedDatabase } from '@rmp135/sql-ts/dist/Typings';

const makeConfig = (connection: Config['connection']) => ({
  dialect: 'mssql',
  client: 'mssql',
  connection,
});

export async function toObject(
  connection: Config['connection']
): Promise<DecoratedDatabase> {
  return await sqlts.toObject(makeConfig(connection));
}

export async function toTypeScript(
  connection: Config['connection']
): Promise<string> {
  const database = await toObject(connection);

  // Columns in SqlServer can have spaces in them. We iterate through and add
  // quotes around them so that the generated TypeScript syntax-checks.
  database.tables.forEach(({ columns }) => {
    columns.forEach(column => {
      if (column.name.includes(' ')) {
        column.name = `'${column.name}'`;
      }
    });
  });

  return `
${sqlts.fromObject(database, makeConfig(connection))}

${database.tables
  .map(
    // Make "All" versions of the tables that have their properties all
    // required.
    ({ name }) => `export type ${name}EntityAll = Required<${name}Entity>;`
  )
  .join('\n')}
`;
}
