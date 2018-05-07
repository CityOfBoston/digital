/**
 * @fileOverview
 *
 * This file exports functions from `sql-ts`. We make it its own module because
 * its dependencies fail on the latest version of `mssql`.
 *
 * There are some "nohoist" shenannigans in the top-level package.json to force
 * this package to have its own local install of knex, to keep that library from
 * finding an mssql it’s incompatible with.
 *
 * knex@0.14.4 should solve this issue, but sql-ts is pegged at ^0.13.
 */

import sqlts, { Database, Config } from '@rmp135/sql-ts';

const makeConfig = (connection: Config['connection']) => ({
  dialect: 'mssql',
  client: 'mssql',
  connection,
});

export async function toObject(
  connection: Config['connection']
): Promise<Database> {
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
