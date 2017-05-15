// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { runInAction } from 'mobx';

import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import LocationPopUp from './LocationPopUp';

const ACTIONS = {
  nextFunc: jest.fn(),
  nextIsSubmit: false,
};

describe('rendering', () => {
  let store;
  let requestForm;

  beforeEach(() => {
    store = new AppStore();
    store.apiKeys.mapbox = 'fake-api-key';

    requestForm = new RequestForm();
  });

  it('renders without an address', () => {
    runInAction(() => { requestForm.address = ''; });

    const component = renderer.create(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders with an address', () => {
    runInAction(() => { requestForm.address = 'City Hall Square\nBoston, MA'; });
    const component = renderer.create(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders a map on a small screen', () => {
    store.ui.visibleWidth = 320;
    const component = renderer.create(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
