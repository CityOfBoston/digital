import ArcGIS, { SearchResult, UnitResult } from './ArcGIS';

export default class ArcGISFake implements Required<ArcGIS> {
  public async reverseGeocode(
    _lat: number,
    _lng: number
  ): Promise<SearchResult | null> {
    return null;
  }

  public async search(_query: string): Promise<SearchResult[]> {
    return [];
  }

  public async lookupUnits(_buildingId: string): Promise<UnitResult[]> {
    return [];
  }
}
