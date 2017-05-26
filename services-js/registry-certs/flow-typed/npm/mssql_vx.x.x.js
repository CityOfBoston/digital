// flow-typed signature: 5046362a13c44270de5811db47cf4613
// flow-typed version: <<STUB>>/mssql_v4.0.4/flow_v0.46.0

declare module 'mssql' {

  declare export type RequestResult = {|
    recordsets: Array<Array<Object>>,
    recordset: ?Array<Object>,
    output: Object,
    rowsAffected: Array<number>,
    returnVaule: number,
  |};

  declare export type BasicCallback = (err: ?Error) => void;
  declare export type RequestResultCallback = (err: ?Error, result: ?RequestResult) => void;

  declare export type ConnectionPoolConfig = {|
    user: string,
    password: string,
    server: string,
    port?: number,
    domain?: string,
    database?: string,
    connectionTimeout?: number,
    requestTimeout?: number,
    stream?: boolean,
    parseJSON?: boolean,
    pool?: {|
      max?: number,
      min?: number,
      idleTimeoutMillis?: number,
    |},
    options?: {|
      encrypt?: boolean,
    |},
  |};

  declare export class ConnectionPool {
    constructor(config: string | ConnectionPoolConfig, callback?: BasicCallback): this;
    connect(): Promise<this>;
    connect(callback: BasicCallback): this;
    close(): Promise<this>;
    close(callback: BasicCallback): this;

    request(): Request;
  }

  declare export class Request {
    constructor(parent?: ConnectionPool): this;
    input(name: string, type: mixed, value: mixed): this;
    input(name: string, value: mixed): this;
    output(name: string, type: mixed, value?: mixed): this;
    execute(command: string): Promise<RequestResult>;
    execute(command: string, callback: RequestResultCallback): this;
  }
}
