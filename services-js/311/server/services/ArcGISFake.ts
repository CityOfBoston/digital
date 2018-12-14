import ArcGIS, { SearchResult, UnitResult } from './ArcGIS';

import SEARCH_RESULTS from './__fixtures__/arcgis/search.json';
import UNITS from './__fixtures__/arcgis/units.json';

export default class ArcGISFake implements Required<ArcGIS> {
  public async reverseGeocode(
    _lat: number,
    _lng: number
  ): Promise<SearchResult | null> {
    return null;
  }

  public async search(_query: string): Promise<SearchResult[]> {
    return SEARCH_RESULTS;
  }

  public async lookupUnits(_buildingId: string): Promise<UnitResult[]> {
    return UNITS;
  }
}
