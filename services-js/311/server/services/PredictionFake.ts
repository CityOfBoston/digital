import Prediction from './Prediction';

export default class PredictionFake implements Required<Prediction> {
  public async caseTypes(): Promise<string[]> {
    return ['BIRDINFEST', 'CEMTRYMAIN', 'MTRECYDBI'];
  }

  public async caseCreated() {}
}
