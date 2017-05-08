// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, action, reaction } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';
import type RequestForm from '../../../data/store/RequestForm';

import LocationMap from '../../map/LocationMap';

const CONTENT_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
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
|}

@observer
export default class LocationPopUp extends React.Component {
  props: Props;

  @observable addressQuery: string = '';

  searchField: ?HTMLInputElement;

  queryClearerDisposer: Function;
  updateFormFromMapDisposer: Function;

  @action
  componentWillMount() {
    const { store: { mapLocation, accessibility }, requestForm } = this.props;

    mapLocation.query = '';
    mapLocation.address = requestForm.address;
    mapLocation.location = requestForm.location;
    mapLocation.addressId = requestForm.addressId;

    this.updateFormFromMapDisposer = reaction(
      () => ({ location: mapLocation.location, address: mapLocation.address, addressId: mapLocation.addressId }),
      ({ location, address, addressId }) => {
        requestForm.location = location;
        requestForm.address = address;
        requestForm.addressId = addressId;

        if (requestForm.address) {
          accessibility.message = `Selected address: ${requestForm.address}`;
          accessibility.interrupt = true;
        }
      }, {
        fireImmediately: true,
        name: 'update form from map',
      },
    );

    this.queryClearerDisposer = reaction(
      () => requestForm.location,
      (location) => {
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
      },
    );
  }

  componentWillUnmount() {
    this.queryClearerDisposer();
    this.updateFormFromMapDisposer();
  }

  setSearchField = (searchField: ?HTMLInputElement) => {
    this.searchField = searchField;
  }

  @action.bound
  whenSearchInput(ev: SyntheticInputEvent) {
    const { store: { mapLocation } } = this.props;

    this.addressQuery = ev.target.value;
    mapLocation.notFound = false;
  }

  @action.bound
  whenSearchSubmit(ev: SyntheticInputEvent) {
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
    const { requestForm, nextIsSubmit, store: { mapLocation, ui } } = this.props;
    const { locationRequirementsMet, locationRequired } = requestForm;
    const { notFound, address, location } = mapLocation;
    const { belowMediaLarge } = ui;

    return (
      <div className={CONTENT_STYLE}>
        { this.maybeRenderMap() }

        <form className="sf sf--sm sf--y " onSubmit={this.whenSearchSubmit} action="#">
          <div className="sf-i">
            <input
              className="sf-i-f"
              onInput={this.whenSearchInput}
              value={this.addressQuery}
              ref={this.setSearchField}
              aria-label="Address search field"
              placeholder={belowMediaLarge ? 'Search address or intersection…' : 'Search for a street address or intersection…'}
              type="text"
            />

            <button className="sf-i-b" type="submit" disabled={this.addressQuery.length === 0}>Search</button>
          </div>
        </form>

        {notFound
          ? <div className="t--info m-v300"><span className="t--err">{
             location ? 'This address is not in Boston' : 'This address was not found in Boston'
            }</span></div>
          : <div className="m-v400">
            {!!address && <div className="addr addr--s" style={{ whiteSpace: 'pre-line' }}>{ address }</div> }
          </div>
          }

        <div className={`g ${BUTTON_ROW_STYLE.toString()}`}>
          <div className="g--7 t--subinfo m-v200">
            { !locationRequired && <a href="javascript:void(0)" onClick={this.continueWithoutLocation}>Continue without location</a> }
          </div>
          <button className="btn g--5" disabled={!locationRequirementsMet} onClick={this.continueWithLocation}>{ nextIsSubmit ? 'Submit' : 'Next' }</button>
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
      <div className={`m-b300 ${MAP_CONTAINER_STYLE.toString()}`}>
        <LocationMap store={store} mode="picker" mobile />
      </div>
    );
  }
}
