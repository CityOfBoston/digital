// @flow

import React from 'react';
import { css } from 'emotion';
import { action, reaction } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';
import type AddressSearch from '../../../data/store/AddressSearch';
import type { SearchAddressPlace, AddressUnit } from '../../../data/types';
import type RequestForm from '../../../data/store/RequestForm';

import LoadingIcons from '../../common/LoadingIcons';
import { LocationMapWithLibrary } from '../../map/LocationMap';
import {
  MEDIA_LARGE,
  HEADER_HEIGHT,
  GRAY_000,
  GRAY_200,
  CHARLES_BLUE,
} from '../../style-constants';

import waypointMarkers, {
  WAYPOINT_NUMBER_STYLE,
} from '../../map/WaypointMarkers';

// On large screen sizes below, the location picker is in a little
// dialog that floats over the map. We let it size itself automatically
// from its content. On mobile devices, the picker has a fixed height
// and we use flex: 1 to fill that height, so that the button at the
// bottom has a consistent position.
//
// We have to disable the flex for desktop because of IE, which renders
// the flexed children with 0 height, rather than letting their
// intrinsic heights grow the flex container.

const CONTENT_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  // We can't flex: 1 to the min-height of the mobile FormDialog in IE
  // 0.44rem is the border top of the dialog
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px - 0.44rem)`,
  [MEDIA_LARGE]: {
    minHeight: 'auto',
    flex: 'none',
  },
});

const FORM_WRAPPER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 0,
  overflowY: 'auto',

  [MEDIA_LARGE]: {
    flex: 'none',
    marginTop: '0.25em',
    overflowY: 'visible',
  },
});

const ADDRESS_WRAPPER_STYLE = css({
  flex: 1,
  [MEDIA_LARGE]: {
    flex: 'none',
  },
});

const BUTTON_ROW_STYLE = css({
  alignItems: 'center',
});

const MAP_CONTAINER_STYLE = css({
  height: '38vh',
  transition: 'height 200ms',
});

const SMALL_MAP_CONTAINER_STYLE = css({
  height: '15vh',
  minHeight: 130,
  transition: 'height 200ms',
});

const ADDRESS_LIST_STYLE = css({
  [MEDIA_LARGE]: {
    maxHeight: 220,
    overflowY: 'auto',
  },
});

const ADDRESS_ROW_STYLE = css({
  textAlign: 'left',
  fontSize: 'inherit',
  width: '100%',
  borderLeft: 'none',
  borderRight: 'none',
  display: 'block',
  position: 'relative',
  outlineOffset: -3,
  outlineWidth: 3,
  color: CHARLES_BLUE,
  ':hover': {
    color: CHARLES_BLUE,
  },
  paddingRight: 94,
  whiteSpace: 'nowrap',
});

const UNIT_PICKER_STYLE = css({
  position: 'absolute',
  zIndex: 2,
  right: 10,
  top: 10,
  '& .sel-c:after': {
    content: '"Units"',
  },
});

const BORDER_TOP_ADDRESS_STYLE = css({
  borderTop: `1.5px dashed ${GRAY_200}`,
});

const NO_BORDER_TOP_ADDRESS_STYLE = css({
  borderTop: `1.5px dashed transparent`,
});

const BORDER_BOTTOM_ADDRESS_STYLE = css({
  borderBottom: `1.5px dashed ${GRAY_200}`,
});

const NO_BORDER_BOTTOM_ADDRESS_STYLE = css({
  borderBottom: `1.5px dashed transparent`,
});

const SELECTED_ADDRESS_STYLE = css(NO_BORDER_TOP_ADDRESS_STYLE, {
  borderColor: 'transparent',
  backgroundColor: GRAY_000,
});

// Needed to reset <button> default styles
const NOT_SELECTED_ADDRESS_STYLE = css({
  background: 'transparent',
});

const WAYPOINT_WRAPPER_STYLE = css({
  verticalAlign: 'middle',
  display: 'inline-block',
  position: 'relative',
  marginRight: '.825em',
});

const WAYPOINT_STYLE = css({
  width: 27,
  height: 50,
});

const SEARCH_RESULTS_HEADER_STYLE = css({
  fontSize: 14,
  color: GRAY_200,
  letterSpacing: '1px',
  paddingBottom: 0,
  paddingTop: 0,
  marginBottom: '.475em',
});

const LOADING_CONTAINER_STYLE = css({ height: 85, display: 'flex' });

export type Props = {|
  store: AppStore,
  requestForm: RequestForm,
  nextFunc: () => mixed,
  nextIsSubmit: boolean,
|};

@observer
export default class LocationPopUp extends React.Component<Props> {
  containerEl: ?HTMLElement;
  searchField: ?HTMLInputElement;

  updateFormFromMapDisposer: Function;

  constructor(props: Props) {
    super(props);
  }

  @action
  componentWillMount() {
    const { store: { addressSearch, accessibility }, requestForm } = this.props;

    addressSearch.query = '';

    this.updateFormFromMapDisposer = reaction(
      () => ({
        location: addressSearch.location,
        address: addressSearch.address,
        addressId: addressSearch.addressId,
        intent: addressSearch.intent,
      }),
      ({ location, address, addressId, intent }) => {
        requestForm.location = location;
        requestForm.address = address;
        requestForm.addressId = addressId;
        requestForm.addressIntent = intent;

        if (requestForm.address) {
          accessibility.message = `Selected address: ${requestForm.address}`;
          accessibility.interrupt = true;
        }
      },
      {
        fireImmediately: true,
        name: 'update form from map',
      }
    );
  }

  componentWillUnmount() {
    this.updateFormFromMapDisposer();
  }

  setContainer = (containerEl: ?HTMLElement) => {
    this.containerEl = containerEl;
  };

  setSearchField = (searchField: ?HTMLInputElement) => {
    this.searchField = searchField;
  };

  @action.bound
  whenSearchInput(ev: SyntheticInputEvent<>) {
    const { store: { addressSearch } } = this.props;
    const query = ev.target.value;

    addressSearch.query = query;

    if (query === '') {
      addressSearch.clearPlaces();
    }
  }

  @action.bound
  whenSearchSubmit(ev: SyntheticInputEvent<>) {
    ev.preventDefault();

    const { store: { ui: { belowMediaLarge }, addressSearch } } = this.props;

    if (this.containerEl) {
      // we update this on search because when the component is mounted it's
      // still being animated down to its small width.
      addressSearch.searchPopupWidth = this.containerEl.getBoundingClientRect().right;
    }

    // on mobile, select the first result by default
    addressSearch.search(belowMediaLarge);
  }

  @action.bound
  continueWithLocation() {
    const { nextFunc, requestForm } = this.props;
    requestForm.sendLocation = true;
    nextFunc();
  }

  @action.bound
  continueWithoutLocation() {
    const { nextFunc, requestForm } = this.props;
    requestForm.sendLocation = false;
    nextFunc();
  }

  render() {
    const {
      requestForm,
      nextIsSubmit,
      store: { addressSearch, ui },
    } = this.props;
    const { belowMediaLarge } = ui;
    const { locationRequirementsMet } = requestForm;
    const {
      places,
      lastSearchError,
      searching,
      query,
      location,
    } = addressSearch;

    return (
      <div className={CONTENT_STYLE}>
        {this.maybeRenderMap()}

        <div
          className={`${FORM_WRAPPER_STYLE.toString()}`}
          ref={this.setContainer}
        >
          <div className="p-a300">
            <form
              className="sf sf--md sf--y"
              onSubmit={this.whenSearchSubmit}
              action="#"
            >
              <div className="sf-i">
                <input
                  className="sf-i-f"
                  onChange={this.whenSearchInput}
                  value={query}
                  ref={this.setSearchField}
                  aria-label="Address search field"
                  placeholder={'Search address…'}
                  type="text"
                />

                <button
                  className="sf-i-b"
                  type="submit"
                  disabled={query.length === 0}
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className={ADDRESS_WRAPPER_STYLE}>
            {searching && this.renderLoading()}
            {lastSearchError && !location && this.renderSearchError()}
            {lastSearchError && location && this.renderGeocodeError()}

            {places &&
              (places.length > 0
                ? this.renderAddressList(places)
                : this.renderNotFound())}
          </div>

          <div className={`g p-a300 ${BUTTON_ROW_STYLE.toString()}`}>
            {!belowMediaLarge && this.renderContinueWithoutLocation()}
            <button
              type="button"
              className="btn g--5"
              disabled={!locationRequirementsMet}
              onClick={this.continueWithLocation}
            >
              {nextIsSubmit ? 'Submit' : 'Next'}
            </button>
            {belowMediaLarge && this.renderContinueWithoutLocation()}
          </div>
        </div>
      </div>
    );
  }

  renderContinueWithoutLocation() {
    const { requestForm: { locationRequired } } = this.props;

    return (
      <div className="g--7 t--subinfo m-v200">
        {!locationRequired &&
          <a href="javascript:void(0)" onClick={this.continueWithoutLocation}>
            Continue without location
          </a>}
      </div>
    );
  }

  maybeRenderMap() {
    const { store } = this.props;
    const { belowMediaLarge } = store.ui;
    const { places } = store.addressSearch;

    if (!belowMediaLarge) {
      return null;
    }

    const smallPicker = places && places.length > 1;

    return (
      <div
        className={`${smallPicker
          ? SMALL_MAP_CONTAINER_STYLE.toString()
          : MAP_CONTAINER_STYLE.toString()}`}
      >
        <LocationMapWithLibrary
          store={store}
          mode="picker"
          mobile
          smallPicker={!!smallPicker}
        />
      </div>
    );
  }

  renderLoading() {
    return (
      <div className={`${LOADING_CONTAINER_STYLE.toString()}`} key="loading">
        <LoadingIcons />
      </div>
    );
  }

  renderSearchError() {
    return (
      <div className="p-a300" key="error" style={{ paddingTop: 0 }}>
        <p className="t--err t--info" style={{ marginTop: 0 }}>
          We couldn’t find that address because of a server problem.
        </p>
        <p className="t--subinfo">
          Please try again later, or choose a location using the map.
        </p>
      </div>
    );
  }

  renderGeocodeError() {
    return (
      <div className="p-a300" key="error" style={{ paddingTop: 0 }}>
        <p className="t--err t--info" style={{ marginTop: 0 }}>
          We couldn’t find an address for the map pin because of a server
          problem.
        </p>
        <p className="t--subinfo">
          If your case is for something at a specific street address, please try
          again later.
        </p>
      </div>
    );
  }

  renderNotFound() {
    const { location, query } = this.props.store.addressSearch;

    return (
      <div className="p-a300 t--info" key="not-found">
        <span className="t--err">
          {location
            ? 'Please pick a location within Boston'
            : `We could not find an address or intersection in Boston for “${query}”`}
        </span>
      </div>
    );
  }

  renderAddressList(places: Array<SearchAddressPlace>) {
    const { addressSearch } = this.props.store;
    const { lastQuery } = addressSearch;

    return (
      <div className="" key="places">
        {!!lastQuery &&
          places.length !== 1 &&
          <div
            className={`t--sans t--upper t--g300 p-a300 t--ellipsis ${SEARCH_RESULTS_HEADER_STYLE.toString()}`}
          >
            {places.length} results for {lastQuery}
          </div>}

        <div className={`${ADDRESS_LIST_STYLE.toString()}`}>
          {places.map((place, idx) =>
            <AddressRow
              place={place}
              index={idx}
              key={place.addressId}
              placeCount={places.length}
              addressSearch={addressSearch}
            />
          )}
        </div>
      </div>
    );
  }
}

type AddressRowProps = {
  place: SearchAddressPlace,
  index: number,
  placeCount: number,
  addressSearch: AddressSearch,
};

@observer
class AddressRow extends React.Component<AddressRowProps> {
  @action.bound
  selectAddress() {
    const { index, addressSearch } = this.props;

    addressSearch.highlightedPlaceIndex = index;

    if (index !== addressSearch.currentPlaceIndex) {
      addressSearch.currentPlaceIndex = index;
      addressSearch.currentUnitIndex = 0;
    }
  }

  @action.bound
  highlightAddress() {
    const { index, addressSearch } = this.props;

    addressSearch.highlightedPlaceIndex = index;
  }

  @action.bound
  whenUnitChange(ev: SyntheticInputEvent<>) {
    const { addressSearch } = this.props;
    addressSearch.currentUnitIndex = parseInt(ev.target.value, 10);
  }

  render() {
    const {
      index,
      place,
      placeCount,
      addressSearch: { address, highlightedPlaceIndex, currentPlaceIndex },
    } = this.props;

    const highlighted = index === highlightedPlaceIndex;
    const current = index === currentPlaceIndex;

    const classes = [
      ADDRESS_ROW_STYLE,
      'p-a300',
      current ? SELECTED_ADDRESS_STYLE : NOT_SELECTED_ADDRESS_STYLE,
      current || index === currentPlaceIndex + 1
        ? NO_BORDER_TOP_ADDRESS_STYLE
        : BORDER_TOP_ADDRESS_STYLE,
      index === placeCount - 1 && index !== currentPlaceIndex
        ? BORDER_BOTTOM_ADDRESS_STYLE.toString()
        : NO_BORDER_BOTTOM_ADDRESS_STYLE.toString(),
    ];

    return (
      <div style={{ position: 'relative' }} key={place.addressId}>
        <button
          type="button"
          className={classes.join(' ')}
          onClick={this.selectAddress}
          onMouseEnter={this.highlightAddress}
          onMouseLeave={this.highlightAddress}
        >
          <div className={`${WAYPOINT_WRAPPER_STYLE.toString()}`}>
            <div
              className={`${WAYPOINT_STYLE.toString()}`}
              dangerouslySetInnerHTML={{
                __html:
                  waypointMarkers[highlighted ? 'greenFilled' : 'orangeFilled']
                    .html,
              }}
            />
            {placeCount > 1 &&
              <div className={`t--sans ${WAYPOINT_NUMBER_STYLE.toString()}`}>
                {index + 1}
              </div>}
          </div>
          <div
            className="addr addr--s"
            style={{
              whiteSpace: 'pre-line',
              display: 'inline-block',
              verticalAlign: 'middle',
              lineHeight: 1.4,
            }}
          >
            {!place.exact &&
              <div className="t--subinfo tt-n">Approximate location</div>}
            {(current
              ? address
              : place.units && place.units.length
                ? place.units[0].address
                : place.address).trim()}
          </div>

          <div style={{ clear: 'both' }} />
        </button>

        {current &&
          place.units.length > 1 &&
          this.renderUnitSelector(place.units)}
      </div>
    );
  }

  renderUnitSelector(units: Array<AddressUnit>) {
    const { currentUnitIndex } = this.props.addressSearch;

    return (
      <div className={`${UNIT_PICKER_STYLE.toString()} sel`}>
        <label className="sel-l sel-l--sq" htmlFor="unit-menu">
          Apartment or Unit
        </label>
        <div className="sel-c sel-c--sq">
          <select
            id="unit-menu"
            className="sel-f sel-f--sq"
            value={currentUnitIndex}
            onChange={this.whenUnitChange}
          >
            {units.map(({ addressId, streetAddress }, idx) =>
              <option value={idx} key={addressId}>
                {streetAddress}
              </option>
            )}
          </select>
        </div>
      </div>
    );
  }
}
