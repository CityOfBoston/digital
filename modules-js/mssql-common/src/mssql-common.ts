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
  // dialect?: 'mssql';
  packetSize?: number;
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
    packetSize,
  }: DatabaseConnectionOptions,
  errorCb: (err: Error) => any
): Promise<ConnectionPool> {
  const encryptVal = typeof encryption === 'boolean' ? encryption : true;
  const multiSubnetFailoverVal =
    typeof multiSubnetFailover === 'boolean' ? multiSubnetFailover : false;
  const packet_Size = typeof packetSize === 'number' ? packetSize : 16384;
  const opts: ConnectionPoolConfig = {
    user: username,
    password,
    server,
    database,
    stream: true,
    pool: {
      min: 0,
      // Keeps the acquisition from looping forever if there's a failure.
      acquireTimeoutMillis: 10000,
    },
    options: {
      encrypt: encryptVal,
      // @ts-ignore
      multiSubnetFailover: multiSubnetFailoverVal,
      // @ts-ignore
      packetSize: packet_Size,
      requestTimeout: 45000,
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
