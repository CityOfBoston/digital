import React from 'react';
import renderer from 'react-test-renderer';
import { mount, ReactWrapper } from 'enzyme';
import { runInAction } from 'mobx';

import LocationMap, { Props } from './LocationMap';
import AddressSearch from '../../data/store/AddressSearch';
import BrowserLocation from '../../data/store/BrowserLocation';
import Ui from '../../data/store/Ui';
import RequestSearch from '../../data/store/RequestSearch';

const L = require('mapbox.js');

const makeDefaultProps = (): Props => {
  return {
    L,
    addressSearch: new AddressSearch(),
    browserLocation: new BrowserLocation(),
    requestSearch: new RequestSearch(),
    ui: new Ui(),
    mode: 'picker',
    mobile: false,
  };
};

test('rendering active', () => {
  const component = renderer.create(<LocationMap {...makeDefaultProps()} />, {
    createNodeMock: () => document.createElement('div'),
  });
  expect(component.toJSON()).toMatchSnapshot();
});

describe('mounted map', () => {
  let wrapper: ReactWrapper<{}, {}, LocationMap>;
  let props: Props;
  let locationMap: LocationMap;

  beforeEach(() => {
    props = makeDefaultProps();
    wrapper = mount(<LocationMap {...props} />);
    locationMap = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('positions a marker based on the form location', () => {
    runInAction(() => {
      props.addressSearch.setPlaces(
        [
          {
            address: '1 City Hall Plaza',
            addressId: '12345',
            units: [],
            exact: true,
            alwaysUseLatLng: false,
            location: {
              lat: 42,
              lng: -71,
            },
          },
          {
            address: '2 City Hall Plaza',
            addressId: '12346',
            exact: true,
            alwaysUseLatLng: false,
            units: [],
            location: {
              lat: 43,
              lng: -70,
            },
          },
        ],
        'search',
        false
      );
    });

    const { locationSearchMarkers } = locationMap;
    const locationSearchMarker = locationSearchMarkers[0];

    if (!locationSearchMarker) {
      expect(locationSearchMarker).toBeDefined();
      return;
    }

    const markerLatLng = locationSearchMarker.getLatLng();
    expect(markerLatLng.lat).toEqual(42);
    expect(markerLatLng.lng).toEqual(-71);
  });
});
