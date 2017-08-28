// @flow

import * as React from 'react';
import { css } from 'glamor';
import { observable, action, reaction } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';
import type RequestForm from '../../../data/store/RequestForm';

import { LocationMapWithLibrary } from '../../map/LocationMap';
import { MEDIA_LARGE, HEADER_HEIGHT } from '../../style-constants';

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
  height: `calc(100vh - ${HEADER_HEIGHT}px - 0.44rem)`,
  [MEDIA_LARGE]: {
    height: 'auto',
    flex: 'none',
  },
});

const FORM_WRAPPER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  [MEDIA_LARGE]: {
    flex: 'none',
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
  height: '40vh',
});

export type Props = {|
  store: AppStore,
  requestForm: RequestForm,
  nextFunc: () => mixed,
  nextIsSubmit: boolean,
|};

@observer
export default class LocationPopUp extends React.Component<Props> {
  @observable addressQuery: string = '';

  searchField: ?HTMLInputElement;

  queryClearerDisposer: Function;
  updateFormFromMapDisposer: Function;

  @action
  componentWillMount() {
    const { store: { mapLocation, accessibility }, requestForm } = this.props;

    mapLocation.query = '';
    // We let the rest of mapLocation's state stay the same so that it can
    // cache e.g. units.

    this.updateFormFromMapDisposer = reaction(
      () => ({
        location: mapLocation.location,
        address: mapLocation.address,
        addressId: mapLocation.addressId,
      }),
      ({ location, address, addressId }) => {
        requestForm.location = location;
        requestForm.address = address;
        requestForm.addressId = addressId;

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

    this.queryClearerDisposer = reaction(
      () => requestForm.location,
      location => {
        // only clear if there's a new address. Otherwise we want to keep
        // the existing search term so the user can fix it
        if (location) {
          this.addressQuery = '';
          if (this.searchField) {
            this.searchField.blur();
          }
        }
      },
      {
        name: 'location query clearer',
      }
    );
  }

  componentWillUnmount() {
    this.queryClearerDisposer();
    this.updateFormFromMapDisposer();
  }

  setSearchField = (searchField: ?HTMLInputElement) => {
    this.searchField = searchField;
  };

  @action.bound
  whenSearchInput(ev: SyntheticInputEvent<>) {
    const { store: { mapLocation } } = this.props;

    this.addressQuery = ev.target.value;
    mapLocation.notFound = false;
  }

  @action.bound
  whenUnitChange(ev: SyntheticInputEvent<>) {
    const { store: { mapLocation } } = this.props;

    const unit = mapLocation.units.find(u => u.addressId === ev.target.value);
    if (unit) {
      mapLocation.addressId = unit.addressId;
      mapLocation.address = unit.address;
    }
  }

  @action.bound
  whenSearchSubmit(ev: SyntheticInputEvent<>) {
    ev.preventDefault();

    const { store: { mapLocation } } = this.props;
    mapLocation.search(this.addressQuery);
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
      store: { mapLocation, ui },
    } = this.props;
    const { locationRequirementsMet, locationRequired } = requestForm;
    const { notFound, address, location, units } = mapLocation;
    const { belowMediaLarge } = ui;

    return (
      <div className={CONTENT_STYLE}>
        {this.maybeRenderMap()}

        <div className={`p-a300 ${FORM_WRAPPER_STYLE.toString()}`}>
          <form
            className="sf sf--sm sf--y"
            onSubmit={this.whenSearchSubmit}
            action="#"
          >
            <div className="sf-i">
              <input
                className="sf-i-f"
                onChange={this.whenSearchInput}
                value={this.addressQuery}
                ref={this.setSearchField}
                aria-label="Address search field"
                placeholder={
                  belowMediaLarge
                    ? 'Search address or intersection…'
                    : 'Search for a street address or intersection…'
                }
                type="text"
              />

              <button
                className="sf-i-b"
                type="submit"
                disabled={this.addressQuery.length === 0}
              >
                Search
              </button>
            </div>
          </form>

          <div className={ADDRESS_WRAPPER_STYLE}>
            {notFound
              ? <div className="t--info m-v300">
                  <span className="t--err">
                    {location
                      ? 'Please pick a location within Boston'
                      : `We could not find an address or intersection in Boston for “${this
                          .addressQuery}”`}
                  </span>
                </div>
              : <div className="m-v400">
                  {!!address &&
                    <div
                      className="addr addr--s"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {address}
                    </div>}
                </div>}

            {units.length > 0 &&
              <div className="sel m-v400">
                <label
                  className="sel-l"
                  htmlFor="unit-menu"
                  style={{ marginTop: 0 }}
                >
                  Apartment or Unit
                </label>
                <div className="sel-c sel-c--fw">
                  <select
                    id="unit-menu"
                    className="sel-f"
                    value={mapLocation.addressId || ''}
                    onChange={this.whenUnitChange}
                  >
                    {units.map(({ addressId, streetAddress }) =>
                      <option value={addressId} key={addressId}>
                        {streetAddress}
                      </option>
                    )}
                  </select>
                </div>
              </div>}
          </div>

          <div className={`g ${BUTTON_ROW_STYLE.toString()}`}>
            <div className="g--7 t--subinfo m-v200">
              {!locationRequired &&
                <a
                  href="javascript:void(0)"
                  onClick={this.continueWithoutLocation}
                >
                  Continue without location
                </a>}
            </div>
            <button
              type="button"
              className="btn g--5"
              disabled={!locationRequirementsMet}
              onClick={this.continueWithLocation}
            >
              {nextIsSubmit ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  maybeRenderMap() {
    const { store } = this.props;
    const { belowMediaLarge } = store.ui;

    if (!belowMediaLarge) {
      return null;
    }

    return (
      <div className={`${MAP_CONTAINER_STYLE.toString()}`}>
        <LocationMapWithLibrary store={store} mode="picker" mobile />
      </div>
    );
  }
}
