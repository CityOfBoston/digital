import { observable } from 'mobx';

import { BirthCertificateRequestInformation } from '../types';

// This is used for initial state, and to reset all fields if
// user selects “start over”
export const initialRequestInformation: BirthCertificateRequestInformation = {
  forSelf: null,
  howRelated: '',
  bornInBoston: '',
  parentsLivedInBoston: '',
  firstName: '',
  lastName: '',
  altSpelling: '',
  birthDate: '',
  parentsMarried: '',
  parent1FirstName: '',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
};

export default class BirthCertificateRequest {
  @observable quantity: number = 0;
  @observable
  requestInformation: BirthCertificateRequestInformation = initialRequestInformation;

  public setQuantity(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  // A user’s answer may span several fields:
  public answerQuestion(answers: object): void {
    this.requestInformation = {
      ...this.requestInformation,
      ...answers,
    };
  }

  public clearBirthCertificateRequest(): void {
    this.quantity = 0;
    this.requestInformation = initialRequestInformation;
  }
}
