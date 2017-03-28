// @flow

import { observable, computed } from 'mobx';
import type { IObservable } from 'mobx';

import RequestSearch from '../../../data/store/RequestSearch';
import SearchMarkerPool from './SearchMarkerPool';

const FAKE_MAP: any = {};

class FakeMarker {
  static markers = [];

  map: mixed;
  options: Object;

  constructor(options: Object) {
    this.options = options;
    this.map = options.map || null;
    FakeMarker.markers.push(this);
  }

  addListener = jest.fn();
  setMap(map) { this.map = map; }
  getMap() { return this.map; }
  setIcon = jest.fn();
  setZIndex = jest.fn();
  setOpacity = jest.fn();
}

export const MOCK_REQUEST = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'open',
  address: 'City Hall Plaza, Boston, MA 02131',
  location: {
    lat: 4,
    lng: 5,
  },
  updatedAtRelativeString: '4 minutes ago',
  mediaUrl: null,
};

let opacityBox: IObservable<boolean>;
let requestSearch;
let searchMarkerPool: SearchMarkerPool;

beforeEach(() => {
  FakeMarker.markers = [];
  requestSearch = new RequestSearch();

  opacityBox = observable(1);
  const opacityComputed = computed(() => opacityBox.get());

  searchMarkerPool = new SearchMarkerPool((FakeMarker: any), FAKE_MAP, requestSearch, opacityComputed);
});

afterEach(() => {
  searchMarkerPool.dispose();
});

describe('generation', () => {
  test('request with location', () => {
    requestSearch.results = [MOCK_REQUEST];

    const marker = FakeMarker.markers[0];
    expect(marker).toBeDefined();
    expect(marker.options.position.lat).toEqual(MOCK_REQUEST.location.lat);
    expect(marker.options.position.lng).toEqual(MOCK_REQUEST.location.lng);
  });

  test('request without location', () => {
    requestSearch.results = [{ ...MOCK_REQUEST, location: null }];
    expect(FakeMarker.markers.length).toEqual(0);
  });

  it('caches markers', () => {
    requestSearch.results = [MOCK_REQUEST];
    expect(FakeMarker.markers.length).toEqual(1);

    requestSearch.results = [{ ...MOCK_REQUEST }];
    // new Marker was not created
    expect(FakeMarker.markers.length).toEqual(1);
  });

  it('disposes of old markers', () => {
    requestSearch.results = [MOCK_REQUEST];
    const marker = FakeMarker.markers[0];

    requestSearch.results = [{ ...MOCK_REQUEST, id: 'new-request-id' }];
    // new Marker was created
    expect(FakeMarker.markers.length).toEqual(2);
    expect(marker.map).toEqual(null);
  });
});

describe('opacity update', () => {
  it('sets a map', () => {
    requestSearch.results = [MOCK_REQUEST];
    const marker = FakeMarker.markers[0];
    expect(marker.map).toEqual(FAKE_MAP);
  });

  it('clears the map', () => {
    requestSearch.results = [MOCK_REQUEST];
    const marker = FakeMarker.markers[0];
    opacityBox.set(0);
    expect(marker.setOpacity).toHaveBeenCalledWith(0);
    expect(marker.map).toEqual(null);
  });
});

describe('icon update', () => {
  it('sets an icon', () => {
    requestSearch.results = [MOCK_REQUEST];
    const marker = FakeMarker.markers[0];
    expect(marker.setIcon).toHaveBeenCalledWith('/static/img/waypoint-open.png');
  });

  it('sets a closed icon', () => {
    requestSearch.results = [{ ...MOCK_REQUEST, status: 'closed' }];
    const marker = FakeMarker.markers[0];
    expect(marker.setIcon).toHaveBeenCalledWith('/static/img/waypoint-closed.png');
  });

  it('updates to hover when selected', () => {
    requestSearch.results = [MOCK_REQUEST];
    const marker = FakeMarker.markers[0];
    marker.setIcon.mockReset();

    requestSearch.selectedRequest = MOCK_REQUEST;
    expect(marker.setIcon).toHaveBeenCalledWith('/static/img/waypoint-open-selected.png');
  });
});

test('click handler', () => {
  requestSearch.results = [MOCK_REQUEST];
  const marker = FakeMarker.markers[0];

  expect(marker.addListener).toHaveBeenCalledWith('click', expect.anything());
  const clickHandler = marker.addListener.mock.calls[0][1];

  expect(requestSearch.selectedRequest).toEqual(null);

  clickHandler();

  expect(requestSearch.selectedRequest).toEqual(MOCK_REQUEST);
});
