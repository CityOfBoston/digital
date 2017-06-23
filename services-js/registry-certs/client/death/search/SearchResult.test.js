// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

import SearchResult from './SearchResult';

describe('rendering', () => {
  it('renders a typical certificate', () => {
    expect(
      renderer
        .create(<SearchResult certificate={TYPICAL_CERTIFICATE} />)
        .toJSON(),
    ).toMatchSnapshot();
  });

  it('renders a pending certificate', () => {
    expect(
      renderer
        .create(<SearchResult certificate={PENDING_CERTIFICATE} />)
        .toJSON(),
    ).toMatchSnapshot();
  });

  it('renders a certificate without a death date', () => {
    expect(
      renderer
        .create(<SearchResult certificate={NO_DATE_CERTIFICATE} />)
        .toJSON(),
    ).toMatchSnapshot();
  });
});
