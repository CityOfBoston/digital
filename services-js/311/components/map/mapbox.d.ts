declare module 'mapbox.js' {
  import { Map, MapOptions, TileLayer, TileLayerOptions } from 'leaflet';

  export * from 'leaflet';

  export interface MapboxMapOptions extends MapOptions {
    accessToken?: string;
  }

  export class MapboxMap extends Map {}

  export interface Mapbox {
    accessToken: string;

    map(
      element: string | HTMLElement,
      mapId: null | string | object,
      options?: MapboxMapOptions
    ): MapboxMap;

    styleLayer(
      url: string,
      options?: TileLayerOptions & {
        sanitizer?: (str: string) => string;
        accessToken?: string;
      }
    ): TileLayer;
  }

  export const mapbox: Mapbox;
}
