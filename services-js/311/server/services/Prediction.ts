import url from 'url';
import fetch from 'node-fetch';
import HttpsProxyAgent from 'https-proxy-agent';
import { DetailedServiceRequest } from './Open311';

interface CaseTypePredictionResponse {
  status: string;
  type: string[];
  time: string;
}

export default class Prediction {
  private readonly agent: any;
  private readonly endpoint: string;
  private readonly newEndpoint: string;

  constructor(endpoint: string | undefined, newEndpoint: string | undefined) {
    if (!endpoint || !newEndpoint) {
      throw new Error('Missing prediction endpoint');
    }

    this.endpoint = endpoint;
    this.newEndpoint = newEndpoint;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  protected url(path: string): string {
    return url.resolve(this.endpoint, path);
  }

  // returns case types in order of most likely to least likely,
  public async caseTypes(text: string): Promise<string[]> {
    const requestJson = {
      text,
      time: new Date().toISOString(),
    };

    const response = await fetch(this.newEndpoint, {
      method: 'POST',
      body: JSON.stringify(requestJson),
      agent: this.agent,
    });

    const responseJson: CaseTypePredictionResponse = await response.json();

    return responseJson.type;
  }

  public async caseCreated(
    c: DetailedServiceRequest,
    description: string
  ): Promise<void> {
    const requestJson = {
      case_id: c.service_request_id,
      case_type: c.service_code,
      opened_dttm: c.requested_datetime,
      updated_dttm: c.updated_datetime || c.requested_datetime,
      user_description: description,
      status: c.status,
    };

    const response = await fetch(this.url('create_case_request'), {
      method: 'POST',
      body: JSON.stringify(requestJson),
      agent: this.agent,
    });

    // TODO(finh): what's the error case here? (alternately, do we care?)
    await response.json();
  }
}
