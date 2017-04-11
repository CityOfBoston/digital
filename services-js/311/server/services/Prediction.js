// @flow
import 'isomorphic-fetch';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';

export type CaseTypePrediction = {
  type: string,
  probability: number,
};

type CaseTypePredictionResponse = {
  types: CaseTypePrediction[],
  // ISO 8601 date/time
  created: string,
};

export default class Prediction {
  agent: any;
  endpoint: string
  opbeat: any

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
  async caseTypes(text: string, threshold: number): Promise<CaseTypePrediction[]> {
    const requestJson = {
      text,
      time: (new Date()).toISOString(),
    };

    const response = await fetch(this.url('case_type_prediction'), {
      method: 'POST',
      body: JSON.stringify(requestJson),
      agent: this.agent,
    });

    const responseJson: CaseTypePredictionResponse = await response.json();

    const caseTypes = [...responseJson.types];
    caseTypes.sort((a, b) => b.probability - a.probability);

    return caseTypes.filter(({ probability }) => probability > threshold);
  }
}
