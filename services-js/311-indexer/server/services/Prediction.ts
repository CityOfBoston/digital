import fetch from 'node-fetch';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import { DetailedServiceRequest } from './Open311';

export default class Prediction {
  private readonly agent: any;
  private readonly endpoint: string;

  constructor(endpoint: string | undefined) {
    if (!endpoint) {
      throw new Error('Missing prediction endpoint');
    }

    this.endpoint = endpoint;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  public url(path: string): string {
    return url.resolve(this.endpoint, path);
  }

  public async reportCaseUpdate(
    c: DetailedServiceRequest
  ): Promise<string | undefined> {
    const requestJson = {
      case_id: c.service_request_id,
      case_type: c.service_code,
      opened_dttm: c.requested_datetime,
      updated_dttm: c.updated_datetime || c.requested_datetime,
      status: c.status,
    };

    const response = await fetch(this.url('update_case_request'), {
      method: 'POST',
      body: JSON.stringify(requestJson),
      agent: this.agent,
    });

    // TODO(finh): what's the error case here? (alternately, do we care?)
    return (await response.json()).message;
  }
}
