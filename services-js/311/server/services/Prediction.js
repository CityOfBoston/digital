// @flow
import 'isomorphic-fetch';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';

import type { DetailedServiceRequest } from './Open311';

export type CaseTypePrediction = {
  type: string,
  probability: number,
  sf_type_id: string,
};

type CaseTypePredictionResponse = {
  types: ?(CaseTypePrediction[]),
  // ISO 8601 date/time
  created: ?string,
  message: ?string,
};

export default class Prediction {
  agent: any;
  endpoint: string;
  opbeat: any;

  constructor(endpoint: ?string, opbeat: any) {
    if (!endpoint) {
      throw new Error('Missing ArcGIS endpoint');
    }

    this.endpoint = endpoint;
    this.opbeat = opbeat;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  url(path: string): string {
    return url.resolve(this.endpoint, path);
  }

  // returns case types in order of most likely to least likely, filtering
  // out any with a too-low probability.
  async caseTypes(
    text: string,
    threshold: number
  ): Promise<CaseTypePrediction[]> {
    const transaction =
      this.opbeat &&
      this.opbeat.startTransaction('case_type_prediction', 'Prediction');

    const requestJson = {
      text,
      time: new Date().toISOString(),
    };

    const response = await fetch(this.url('case_type_prediction'), {
      method: 'POST',
      body: JSON.stringify(requestJson),
      agent: this.agent,
    });

    const responseJson: CaseTypePredictionResponse = await response.json();

    if (transaction) {
      transaction.end();
    }

    if (typeof responseJson.message === 'string') {
      throw new Error(`Prediction error: ${responseJson.message}`);
    }

    const caseTypes = [...(responseJson.types || [])];
    caseTypes.sort((a, b) => b.probability - a.probability);

    return caseTypes.filter(({ probability }) => probability > threshold);
  }

  async caseCreated(
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
