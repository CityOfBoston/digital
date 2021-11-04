// @flow

import { ConnectionPool, config as ConnectionPoolConfig } from 'mssql';

export interface DatabaseConnectionOptions {
  username: string;
  password: string;
  server: string;
  domain?: string;
  database: string;
  encryption?: boolean;
  multiSubnetFailover?: boolean;
}

export async function createConnectionPool(
  {
    username,
    password,
    server,
    domain,
    database,
    encryption,
    multiSubnetFailover,
  }: DatabaseConnectionOptions,
  errorCb: (err: Error) => any
): Promise<ConnectionPool> {
  // DUE to changes to DB Connections to On-Prem COB Servers
  // ^ we are not requiring to encrypt and use multiSubnetFailOver
  const encryptVal = typeof encryption === 'boolean' ? encryption : true;
  const multiSubnetFailoverVal =
    typeof multiSubnetFailover === 'boolean' ? multiSubnetFailover : true;
  const opts: ConnectionPoolConfig = {
    user: username,
    password,
    server,
    database,
    pool: {
      min: 0,
      // Keeps the acquisition from looping forever if there's a failure.
      acquireTimeoutMillis: 10000,
    },
    options: {
      encrypt: encryptVal,
      // @ts-ignore
      multiSubnetFailover: multiSubnetFailoverVal,
    },
  };

  if (domain) {
    opts.domain = domain;
  }

  const pool = new ConnectionPool(opts);

  // We need an error event handler to prevent default Node EventEmitter from
  // crashing the connection pool by throwing any emitted 'error' events that
  // aren't being listened to.
  pool.on('error', err => {
    try {
      errorCb(err);
    } catch (e) {
      // ignore
    }
  });

  await pool.connect();
  return pool;
}
