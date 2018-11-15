import url from 'url';
import fetch from 'node-fetch';
import HttpsProxyAgent from 'https-proxy-agent';
import { DetailedServiceRequest } from './Open311';

interface CaseTypePredictionResponse {
  status: string;
  type: string[];
  time: string;
}

export class Prediction {
  public readonly agent: any;
  public readonly endpoint: string;
  public readonly newEndpoint: string;
  public readonly opbeat: any;

  constructor(
    endpoint: string | undefined,
    newEndpoint: string | undefined,
    opbeat: any
  ) {
    if (!endpoint || !newEndpoint) {
      throw new Error('Missing prediction endpoint');
    }

    this.endpoint = endpoint;
    this.newEndpoint = newEndpoint;
    this.opbeat = opbeat;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  public url(path: string): string {
    return url.resolve(this.endpoint, path);
  }

  // returns case types in order of most likely to least likely,
  public async caseTypes(text: string): Promise<string[]> {
    const transaction =
      this.opbeat &&
      this.opbeat.startTransaction('case_type_prediction', 'Prediction');

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

    if (transaction) {
      transaction.end();
    }

    return responseJson.type;
  }

  public async caseCreated(
    c: DetailedServiceRequest,
    description: string
  ): Promise<void> {
    const transaction =
      this.opbeat &&
      this.opbeat.startTransaction('create_case_request', 'Prediction');

    const requestJson = {
      case_id: c.service_request_id,
      case_type: c.service_code,
      opened_dttm: c.requested_datetime,
      updated_dttm: c.updated_datetime || c.requested_datetime,
      user_description: description,
      status: c.status,
    };

    try {
      const response = await fetch(this.url('create_case_request'), {
        method: 'POST',
        body: JSON.stringify(requestJson),
        agent: this.agent,
      });

      // TODO(finh): what's the error case here? (alternately, do we care?)
      await response.json();
    } finally {
      if (transaction) {
        transaction.end();
      }
    }
  }
}
