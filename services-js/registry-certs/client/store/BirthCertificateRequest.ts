import { action, observable } from 'mobx';

import { BirthCertificateRequestInformation, Question } from '../types';

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
  @observable quantity: number = 1;
  @observable activeQuestion: Question = 'forSelf';
  @observable
  requestInformation: BirthCertificateRequestInformation = initialRequestInformation;

  @action
  public setQuantity(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  @action
  public setActiveQuestion = (question: Question): void => {
    this.activeQuestion = question;
  };

  // A user’s answer may span several fields:
  @action
  public answerQuestion = (answers: object): void => {
    this.requestInformation = {
      ...this.requestInformation,
      ...answers,
    };
  };

  @action
  public clearBirthCertificateRequest(): void {
    this.quantity = 0;
    this.activeQuestion = 'forSelf';
    this.requestInformation = initialRequestInformation;
  }
}
