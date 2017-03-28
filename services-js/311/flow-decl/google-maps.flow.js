declare module 'google-maps' {
  declare class MVCObject<E> {
    constructor(): this;
    addListener(eventName: E, handler: Function): MapsEventListener;
    bindTo(key: string, target: MVCObject<*>, targetKey?: string, noNotify?: boolean): void;
    get(key: string): mixed;
    notify(key: string): void;
    set(key: string, value: mixed): void;
    setValues(values?: {[key: string]: mixed}): void;
    unbind(key: string): void;
    unbindAll(): void;
  }

  declare class MapsEventListener {
    remove(): void;
  }

  declare class LatLng {
    constructor(lat: number | LatLngLiteral, lng?: number, noWrap?: boolean): this;
    lat(): number;
    lng(): number;
  }

  declare type LatLngLiteral = {|
    lat: number,
    lng: number,
  |};

  declare class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral): this;
    getNorthEast(): LatLng,
    getSouthWest(): LatLng,
    getCenter(): LatLng,
  }

  declare type LatLngBoundsLiteral = {|
    east: number,
    north: number,
    south: number,
    west: number,
  |};

  declare type MapTypeId = 'HYBRID' | 'ROADMAP' | 'SATELLITE' | 'TERRAIN';

  declare type MapTypeStyle = {|
    elementType?: string,
    featureType?: string,
    stylers?: Object[],
  |};

  declare class Point {
    constructor(x: number, y: number): this;
    x: number,
    y: number,
  }

  declare type Projection = {|
    fromLatLngToPoint(latLng: LatLng, point?: Point): Point;
    fromPointToLatLng(pixel: Point, nowrap?: boolean): LatLng;
  |};

  declare type MapOptions = {|
    backgroundColor?: string,
    center?: LatLng | LatLngLiteral,
    clickableIcons?: boolean,
    disableDefaultUI?: boolean,
    disableDoubleClickZoom?: boolean,
    draggable?: boolean,
    draggableCursor?: string,
    draggingCursor?: string,
    fullscreenControl?: boolean,
    fullscreenControlOptions?: Object,
    gestureHandling?: string,
    heading?: number,
    keyboardShortcuts?: boolean,
    mapTypeControl?: boolean,
    mapTypeControlOptions?: Object,
    mapTypeId?: MapTypeId,
    maxZoom?: number,
    minZoom?: number,
    noClear?: boolean,
    panControl?: boolean,
    panControlOptions?: Object,
    rotateControl?: boolean,
    rotateControlOptions?: Object,
    scaleControl?: boolean,
    scaleControlOptions?: Object,
    scrollwheel?: boolean,
    streetView?: Object,
    streetViewControl?: boolean,
    streetViewControlOptions?: Object,
    styles?: MapTypeStyle[],
    tilt?: number,
    zoom?: number,
    zoomControl?: boolean,
    zoomControlOptios?: Object,
  |};

  declare class MouseEVent {
    stop(): void;
    latLng: LatLng;
  }

  declare type MapEvents = 'bounds_changed' | 'center_changed' | 'click' |
    'dblclick' | 'drag' | 'dragend' | 'dragstart' | 'heading_changed' |
    'idle' | 'maptypeid_changed' | 'mousemove' | 'mouseout' | 'projection_changed' |
    'resize' | 'rightclick' | 'tilesloaded' | 'tilt_changed' | 'zoom_changed';

  declare class Map extends MVCObject<MapEvents> {
    constructor(el: HTMLElement, opts: ?MapOptions): this;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getClickableIcons(): boolean;
    getDiv(): HTMLElement;
    getHeading(): number;
    getMapTypeId(): MapTypeId;
    getProjection(): Projection;
    getStreetView(): Object;
    getTilt(): number;
    getZoom(): number;
    panBy(x: number, y: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    panToBounds(latLngBounds: LatLngBounds | LatLngBoundsLiteral): void;
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setClickableIcons(value: boolean): void;
    setHeading(heading: number): void;
    setMapTypeId(mapTypeId: MapTypeId): void;
    setOptions(options: MapOptions): void;
    setStreetView(panorama: Object): void;
    setTilt(tilt: number): void;
    setZoom(zoom: number): void;
  }

  declare type MarkerOptions = {|
    anchorPoint?: Point,
    animation?: string,
    clickable?: boolean,
    crossOnDrag?: boolean,
    cursor?: string,
    draggable?: boolean,
    icon?: string,
    label?: string,
    map?: Map,
    opacity?: number,
    optimized?: boolean,
    place?: Object,
    position: LatLng | LatLngLiteral,
    shape?: Object,
    title?: string,
    visible?: boolean,
    zIndex?: number,
  |};

  declare type MarkerEvents = 'animation_changed' | 'click' | 'clickable_changed' |
    'cursor_changed' | 'dblclick' | 'drag' | 'dragend' | 'draggable_changed' |
    'dragstart' | 'flat_changed' | 'icon_changed' | 'mousedown' | 'mouseout' |
    'mouseover' | 'mouseup' | 'position_changed' | 'rightclick' | 'shape_changed' |
    'title_changed' | 'visible_changed' | 'zindex_changed';

  declare class Marker extends MVCObject<MarkerEvents> {
    constructor(opts?: MarkerOptions): this;
    getAnimation(): ?string;
    getClickable(): boolean;
    getCursor(): ?string;
    getDraggable(): boolean;
    getIcon(): ?string;
    getLabel(): ?string;
    getMap(): ?Map;
    getOpacity(): number;
    getPlace(): ?Object;
    getPosition(): LatLng;
    getShape(): ?Object;
    getTitle(): ?string;
    getVisible(): boolean;
    getZIndex(): number;
    setAnimation(animation: string): void;
    setClickable(flag: boolean): void;
    setCursor(cursor: string): void;
    setDraggable(flag: boolean): void;
    setIcon(icon: string): void;
    setLabel(label: string): void;
    setMap(map: ?Map): void;
    setOpacity(opacity: number): void;
    setOptions(options: MarkerOptions): void;
    setPlace(place: Object): void;
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setShape(shape: Object): void;
    setTitle(title: string): void;
    setVisible(visible: boolean): void;
    setZIndex(zIndex: number): void;
  }

  declare type ComponentRestrictions = {|
    country?: string | string[],
  |}

  declare type PredictionType = 'establishment' | 'geocode' | '(regions)' | '(cities)';

  declare type AutocompletionRequest = {|
    bounds?: LatLngBounds | LatLngBoundsLiteral,
    componentRestrictions?: ComponentRestrictions,
    input: string,
    location?: LatLng,
    offset?: number,
    radius?: number,
    types: PredictionType[],
  |};

  declare type QueryAutocompletionRequest = {|
    bounds?: LatLngBounds | LatLngBoundsLiteral,
    input: string,
    location?: LatLng,
    offset?: number,
    radius?: number,
  |};

  declare type PredictionSubstring = {|
    length: number,
    offset: number,
  |};

  declare type PredictionTerm = {|
    offset: number,
    value: string,
  |};

  declare type AutocompletePrediction = {|
    description: string,
    matched_substrings: PredictionSubstring[],
    place_id: string,
    terms: PredictionTerm[],
    types: string[],
  |};

  declare type QueryAutocompletePrediction = {|
    description: string,
    matched_substrings: PredictionSubstring[],
    place_id: ?string,
    terms: PredictionTerm[],
  |};

  declare type PlacesServiceStatus = 'INVALID_REQUEST' | 'OK' | 'OVER_QUERY_LIMIT' |
    'REQUEST_DENIED' | 'UNKNOWN_ERROR' | 'ZERO_RESULTS';

  declare class AutocompleteService {
    constructor(): this;
    getPlacePredictions(request: AutocompletionRequest, callback: (results: ?AutocompletePrediction[], status: PlacesServiceStatus) => void): void;
    getQueryPredictions(request: QueryAutocompletionRequest, callback: (results: ?QueryAutocompletePrediction[], status: PlacesServiceStatus) => void): void;
  }

  declare module.exports: {
    LatLng: Class<LatLng>,
    Map: Class<Map>,
    Marker: Class<Marker>,
    MapsEventListener: Class<MapsEventListener>,
    places: {
      AutocompleteService: Class<AutocompleteService>,
    }
  }
}

declare var google: {
  maps: $Exports<'google-maps'>,
};
