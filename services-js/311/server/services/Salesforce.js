// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import HttpsProxyAgent from 'https-proxy-agent';
import DataLoader from 'dataloader';

// Small slice of the data available
export type ServiceVersion = {|
  Id: string,
  Name: string,
  Incap311__Service_Location_Required__c: boolean,
|};

export default class Salesforce {
  agent: any;
  hostname: string;
  token: string;
  serviceVersionLoader: DataLoader<string, ?ServiceVersion>;

  constructor(hostname: ?string, token: ?string) {
    if (!hostname || !token) {
      throw new Error('Must specify a hostname and token for Salesforce');
    }

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }

    this.hostname = hostname;
    this.token = token;

    this.serviceVersionLoader = new DataLoader(async (codes: string[]) => {
      const query = `SELECT Id, Name, Incap311__Service_Type_Code__c, Incap311__Service_Location_Required__c
        FROM Incap311__Service_Type_Version__c
        WHERE Incap311__Service_Type_Code__c in (${codes.map((c) => `'${c}'`).join(',')})`;

      const params = new URLSearchParams();
      params.append('q', query);

      const opts = {
        agent: this.agent,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };

      const resp = await fetch(`https://${this.hostname}/services/data/v37.0/query?${params.toString()}`, opts);
      const json = await resp.json();

      if (!resp.ok) {
        const message = Array.isArray(json) ? json.map((e) => e.message).join('\n') : json.message;
        throw new Error(`Bad response from Salesforce: ${message}`);
      }

      const serviceVersionsByCode = {};
      json.records.forEach((r) => { serviceVersionsByCode[r.Incap311__Service_Type_Code__c] = r; });
      return codes.map((c) => serviceVersionsByCode[c] || null);
    });
  }

  serviceVersion(code: string): Promise<?ServiceVersion> {
    if (!code.match(/^[a-zA-Z0-9-]*$/)) {
      throw new Error(`Malformed version code: ${code}`);
    }

    return this.serviceVersionLoader.load(code);
  }
}
