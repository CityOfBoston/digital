import { observable, computed } from 'mobx';
import * as L from 'leaflet';
import * as Mapbox from 'mapbox.js';

import RequestSearch from '../../data/store/RequestSearch';
import SearchMarkerPool from './SearchMarkerPool';
import waypointMarkers from './WaypointMarkers';

const FAKE_MAPBOX_L: typeof Mapbox = {
  ...L,
  marker: jest.fn(),
  MapboxMap: L.Map,
  mapbox: {
    map: jest.fn(),
    accessToken: '',
    styleLayer: jest.fn(),
  },
};

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
  requestedAt: 1490804343,
  requestedAtRelativeString: '4 minutes ago',
  images: [],
};

let map;
let opacityBox;
let requestSearch;
let searchMarkerPool: SearchMarkerPool;
let createdMarkers;
let outsideClickHandler;

beforeEach(() => {
  createdMarkers = [];
  (FAKE_MAPBOX_L.marker as jest.Mock).mockImplementation((latlng, opts) => {
    const marker = L.marker(latlng, opts);
    createdMarkers.push(marker);
    return marker;
  });

  requestSearch = new RequestSearch();

  opacityBox = observable.box(1);
  const opacityComputed = computed(() => opacityBox.get());
  outsideClickHandler = jest.fn();

  map = L.map(document.createElement('div'));

  searchMarkerPool = new SearchMarkerPool(
    FAKE_MAPBOX_L,
    map,
    requestSearch,
    opacityComputed,
    true,
    outsideClickHandler
  );
});

afterEach(() => {
  map.remove();
  searchMarkerPool.dispose();
});

describe('generation', () => {
  test('request with location', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });

    const marker = createdMarkers[0];
    expect(marker).toBeDefined();
    expect(marker.getLatLng().lat).toEqual(MOCK_REQUEST.location.lat);
    expect(marker.getLatLng().lng).toEqual(MOCK_REQUEST.location.lng);
    expect(map.hasLayer(marker)).toEqual(true);
  });

  test('request without location', () => {
    requestSearch.updateCaseSearchResults({
      cases: [{ ...MOCK_REQUEST, location: null }],
      query: '',
    });
    expect(createdMarkers.length).toEqual(0);
  });

  it('caches markers', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
    expect(createdMarkers.length).toEqual(1);

    requestSearch.updateCaseSearchResults({
      cases: [{ ...MOCK_REQUEST }],
      query: '',
    });
    // new Marker was not created
    expect(createdMarkers.length).toEqual(1);
  });

  it('disposes of old markers', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
    const marker = createdMarkers[0];

    requestSearch.updateCaseSearchResults({
      cases: [{ ...MOCK_REQUEST, id: 'new-request-id' }],
      query: 'new query',
    });
    // new Marker was created
    expect(createdMarkers.length).toEqual(2);
    expect(map.hasLayer(marker)).toEqual(false);
  });
});

describe('opacity update', () => {
  it('sets a map', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
    const marker = createdMarkers[0];
    expect(map.hasLayer(marker)).toEqual(true);
  });

  it('clears the map', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
    const marker = createdMarkers[0];
    opacityBox.set(0);
    expect(marker.options.opacity).toEqual(0);
    expect(map.hasLayer(marker)).toEqual(false);
  });
});

describe('icon update', () => {
  it('sets an icon', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
    const marker = createdMarkers[0];
    if (!marker.options.icon) {
      expect(marker.options.icon).toBeDefined();
      return;
    }
    expect(marker.options.icon.options).toEqual(waypointMarkers.greenEmpty);
  });

  it('sets a closed icon', () => {
    requestSearch.updateCaseSearchResults({
      cases: [{ ...MOCK_REQUEST, status: 'closed' }],
      query: '',
    });
    const marker = createdMarkers[0];
    if (!marker.options.icon) {
      expect(marker.options.icon).toBeDefined();
      return;
    }
    expect(marker.options.icon.options).toEqual(waypointMarkers.orangeEmpty);
  });

  it('updates to hover when selected', () => {
    requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
    const marker = createdMarkers[0];

    requestSearch.selectedRequest = MOCK_REQUEST;
    if (!marker.options.icon) {
      expect(marker.options.icon).toBeDefined();
      return;
    }
    expect(marker.options.icon.options).toEqual(waypointMarkers.greenFilled);
  });

  it('updates to hover when selected', () => {
    requestSearch.updateCaseSearchResults({
      cases: [{ ...MOCK_REQUEST, status: 'closed' }],
      query: '',
    });
    const marker = createdMarkers[0];

    requestSearch.selectedRequest = MOCK_REQUEST;
    if (!marker.options.icon) {
      expect(marker.options.icon).toBeDefined();
      return;
    }
    expect(marker.options.icon.options).toEqual(waypointMarkers.orangeFilled);
  });
});

test('click handler', () => {
  requestSearch.updateCaseSearchResults({ cases: [MOCK_REQUEST], query: '' });
  const marker = createdMarkers[0];

  expect(requestSearch.selectedRequest).toEqual(null);

  marker.fire('click');

  expect(requestSearch.selectedRequest).toEqual(MOCK_REQUEST);
  expect(outsideClickHandler).toHaveBeenCalled();
});
