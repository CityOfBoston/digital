// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, action, runInAction, reaction } from 'mobx';
import { observer } from 'mobx-react';

import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import searchAddress from '../../../data/dao/search-address';

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
  height: '50vh',
});

export type Props = {|
  store: AppStore,
  loopbackGraphql: LoopbackGraphql,
  requestForm: RequestForm,
  nextFunc: () => mixed,
  nextIsSubmit: boolean,
|}

@observer
export default class LocationPopUp extends React.Component {
  props: Props;

  @observable addressQuery: string = '';

  queryClearerDisposer: Function;
  updateFormFromMapDisposer: Function;

  @action
  componentWillMount() {
    const { store, requestForm } = this.props;

    store.mapLocation.address = requestForm.address;
    store.mapLocation.location = requestForm.location;
    store.mapLocation.addressId = requestForm.addressId;

    this.updateFormFromMapDisposer = reaction(
      () => ({ location: store.mapLocation.location, address: store.mapLocation.address, addressId: store.mapLocation.addressId }),
      ({ location, address, addressId }) => {
        requestForm.location = location;
        requestForm.address = address;
        requestForm.addressId = addressId;
      }, {
        fireImmediately: true,
        name: 'update form from map',
      },
    );

    this.queryClearerDisposer = reaction(
      () => requestForm.address,
      (address) => {
        // only clear if there's a new address. Otherwise we want to keep
        // the existing search term so the user can fix it
        if (address) {
          this.addressQuery = '';
        }
      },
      {
        name: 'location query clearer',
      },
    );
  }

  componentWillUnmount() {
    this.queryClearerDisposer();
  }

  @action.bound
  whenSearchInput(ev: SyntheticInputEvent) {
    this.addressQuery = ev.target.value;
  }

  @action.bound
  async whenSearchSubmit(ev: SyntheticInputEvent) {
    ev.preventDefault();

    const { loopbackGraphql, store: { mapLocation } } = this.props;

    mapLocation.location = null;

    const place = await searchAddress(loopbackGraphql, this.addressQuery);

    runInAction('address search result', () => {
      if (place) {
        this.addressQuery = '';
        mapLocation.location = place.location;
        mapLocation.address = place.address;
        mapLocation.addressId = place.addressId;
      } else {
        mapLocation.address = '';
        mapLocation.addressId = null;
      }
    });
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
    const { requestForm, nextIsSubmit } = this.props;
    const { address, locationRequirementsMet, locationRequired } = requestForm;

    return (
      <div className={CONTENT_STYLE}>
        { this.maybeRenderMap() }

        <h3 className="t--info">Where is the problem happening?</h3>

        <hr className="hr hr--dash" />

        { address && <div className="addr addr--s" style={{ whiteSpace: 'pre-line' }}>{ address }</div> }

        <form className="sf sf--sm sf--y m-v300" onSubmit={this.whenSearchSubmit}>
          <div className="sf-i">
            <input
              className="sf-i-f"
              onInput={this.whenSearchInput}
              value={this.addressQuery}
              placeholder={'Search for address or intersection…'}
              type="text"
            />

            <button className="sf-i-b" type="submit" disabled={this.addressQuery.length === 0}>Search</button>
          </div>
        </form>

        <div className={`g ${BUTTON_ROW_STYLE.toString()}`}>
          <div className="g--6">
            { !locationRequired && <a href="javascript:void(0)" onClick={this.continueWithoutLocation}>Continue without location</a> }
          </div>
          <button className="btn g--6" disabled={!locationRequirementsMet} onClick={this.continueWithLocation}>{ nextIsSubmit ? 'Submit' : 'Next' }</button>
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
        <LocationMap store={store} mode="picker" />
      </div>
    );
  }
}
