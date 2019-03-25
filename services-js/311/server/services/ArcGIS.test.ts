import {
  sortUnits,
  samFeatureToUnit,
  sortAddressCandidates,
  formatAddress,
  candidateToSearchResult,
} from './ArcGIS';

import { LiveSamFeature } from './ArcGIS';
import FIND_ADDRESS_CANDIDATES from './__fixtures__/findAddressCandidates.json';
import LIVE_SAM_RESPONSE from './__fixtures__/liveSamResponse.json';

const UNITS: LiveSamFeature[] = LIVE_SAM_RESPONSE.features;

describe('formatAddress', () => {
  it('formats PointAddress values', () => {
    expect(formatAddress('37 Testing Hill St, Brighton, 02135'))
      .toEqual(`37 Testing Hill St
Brighton, 02135`);
  });

  it('formats StreetAddress values ', () => {
    expect(formatAddress('37 Testing Hill ST, Boston, MA'))
      .toEqual(`37 Testing Hill ST
Boston, MA`);
  });

  it('formats hypothetical ideal values', () => {
    expect(formatAddress('37 Testing Hill St, Brighton, MA, 02135'))
      .toEqual(`37 Testing Hill St
Brighton, MA, 02135`);
  });

  it('handles surprising commas', () => {
    expect(formatAddress('764 E FAKE ST, 1, SOUTH BOSTON, MA, 02127'))
      .toEqual(`764 E FAKE ST, 1
SOUTH BOSTON, MA, 02127`);
  });

  it('handles surprising commas without a state', () => {
    expect(formatAddress('764 E FAKE ST, 1, SOUTH BOSTON, 02127'))
      .toEqual(`764 E FAKE ST, 1
SOUTH BOSTON, 02127`);
  });

  it('handles surprising commas without a zip', () => {
    expect(formatAddress('764 E FAKE ST, 1, SOUTH BOSTON, MA'))
      .toEqual(`764 E FAKE ST, 1
SOUTH BOSTON, MA`);
  });
});

describe('sort and format findAddressCandidates', () => {
  it('matches the snapshot', async () => {
    expect(
      await Promise.all(
        sortAddressCandidates(FIND_ADDRESS_CANDIDATES.candidates).map(
          candidateToSearchResult.bind(null, null as any)
        )
      )
    ).toMatchSnapshot();
  });
});

describe('sortUnits', () => {
  it('sorts by street and number', () => {
    expect(
      sortUnits(UNITS).map(u => u.attributes.FULL_ADDRESS)
    ).toMatchSnapshot();
  });
});

describe('samFeatureToUnit', () => {
  it('matches the snapshot', () => {
    expect(samFeatureToUnit(UNITS[0])).toMatchSnapshot();
  });
});
