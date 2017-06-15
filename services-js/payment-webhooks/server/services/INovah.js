// @flow

import soap from 'soap';
import Boom from 'boom';

type Opbeat = $Exports<'opbeat'>;

export type SoapCallback<T> = (
  err: ?Error,
  result: T,
  raw: any,
  soapHeader: Object,
) => void;

export type RegisterSecurityKeyInput = {|
  'strSignOnUserName': string,
  'strPassword': string,
|};

export type RegisterSecurtyKeyOutput = {|
  RegisterSecurityKeyResult: {|
    StandardResult: {|
      Result:
        | {|
            ReturnCode: 'Failure',
            ErrorType: string,
            ShortErrorMessage: string,
            LongErrorMessage: string,
            StatusInfo: null,
          |}
        | {|
            ReturnCode: 'Success',
            ErrorType: string,
            ShortErrorMessage: null,
            LongErrorMessage: null,
            StatusInfo: string,
            SecurityKey: string,
          |},
    |},
  |},
|};

export interface INovahClient {
  describe(): Object,
  RegisterSecurityKey(
    input: RegisterSecurityKeyInput,
    cb: SoapCallback<RegisterSecurtyKeyOutput>,
  ): void,
}

export default class INovah {
  endpoint: string;
  username: string;
  password: string;
  opbeat: Opbeat;

  constructor(
    endpoint: ?string,
    username: ?string,
    password: ?string,
    opbeat: Opbeat,
  ) {
    if (!endpoint) {
      throw new Error('Must specify INOVAH_ENDPOINT');
    }

    if (!username) {
      throw new Error('Must specify INOVAH_USERNAME');
    }

    if (!password) {
      throw new Error('Must specify INOVAH_PASSWORD');
    }

    this.endpoint = endpoint;
    this.username = username;
    this.password = password;
    this.opbeat = opbeat;
  }

  makeClient(): Promise<INovahClient> {
    const wsdlUrl = `${this.endpoint}?WSDL`;
    return new Promise((resolve, reject) => {
      soap.createClient(wsdlUrl, {}, (err, client) => {
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });
  }

  async registerSecurityKey(): Promise<string> {
    const client = await this.makeClient();

    return new Promise((resolve, reject) => {
      client.RegisterSecurityKey(
        {
          strSignOnUserName: this.username,
          strPassword: this.password,
        },
        (err, output: RegisterSecurtyKeyOutput) => {
          if (err) {
            reject(err);
          } else {
            const result =
              output.RegisterSecurityKeyResult.StandardResult.Result;

            switch (result.ReturnCode) {
              case 'Failure':
                reject(Boom.unauthorized(result.LongErrorMessage));
                break;

              case 'Success':
                resolve(result.SecurityKey);
                break;
            }
          }
        },
      );
    });
  }
}
