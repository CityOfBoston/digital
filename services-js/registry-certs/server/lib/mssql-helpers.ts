import Rollbar from 'rollbar';
import { ConnectionPool, config as ConnectionPoolConfig } from 'mssql';

export interface DatabaseConnectionOptions {
  user: string | undefined;
  password: string | undefined;
  server: string | undefined;
  domain: string | undefined;
  database: string | undefined;
}

export interface DbResponse<R> {
  recordsets: Array<Array<R>>;
  recordset: Array<R>;
  output: Object;
  rowsAffected: Array<number>;
}

export async function createConnectionPool(
  rollbar: Rollbar,
  { user, password, server, domain, database }: DatabaseConnectionOptions
): Promise<ConnectionPool> {
  if (!(user && password && server && database)) {
    throw new Error('Missing some element of database configuration');
  }

  const opts: ConnectionPoolConfig = {
    user,
    password,
    server,
    database,
    pool: {
      min: 0,
      // Keeps the acquisition from looping forever if there's a failure.
      acquireTimeoutMillis: 10000,
    },
    options: {
      encrypt: true,
    },
  };

  if (domain) {
    opts.domain = domain;
  }

  const pool = new ConnectionPool(opts);

  // We need an error event handler to prevent default Node EventEmitter from
  // crashing the connection pool by throwing any emitted 'error' events that
  // aren't being listened to.
  //
  // On top of that, we need to report to Opbeat because the only permanent
  // errors that will filter up to the GraphQL error reporting are pool timeout
  // errors.
  pool.on('error', err => {
    rollbar.error(err);
  });

  await pool.connect();

  return pool;
}
