// @flow

import { observable, action } from 'mobx';
import type { SearchRequest, SearchRequestsPage } from '../types';

export default class RequestSearch {
  @observable.shallow results: SearchRequest[] = [];
  @observable.ref selectedRequest: ?SearchRequest = null;
  @observable selectedSource: ?string = null;

  @action.bound
  update({ requests }: SearchRequestsPage) {
    this.results = requests;
    this.selectedRequest = null;
  }
}
