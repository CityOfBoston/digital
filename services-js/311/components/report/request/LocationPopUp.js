// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, action, runInAction, reaction } from 'mobx';
import { observer } from 'mobx-react';

import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import searchAddress from '../../../data/dao/search-address';

import type { AppStore } from '../../../data/store';

import LocationMap from '../map/LocationMap';

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

export type Props = {
  store: AppStore,
  loopbackGraphql: LoopbackGraphql,
  nextFunc: () => void,
}

@observer
export default class LocationPopUp extends React.Component {
  props: Props;

  @observable addressQuery: string = '';

  queryClearerDisposer: Function;

  componentWillMount() {
    const { store } = this.props;

    this.queryClearerDisposer = reaction(
      () => store.requestForm.locationInfo.address,
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

    const { loopbackGraphql, store: { requestForm: { locationInfo } } } = this.props;

    locationInfo.location = null;

    const place = await searchAddress(loopbackGraphql, this.addressQuery);

    runInAction('address search result', () => {
      if (place) {
        this.addressQuery = '';
        locationInfo.location = place.location;
        locationInfo.address = place.address;
      } else {
        locationInfo.address = '';
      }
    });
  }

  render() {
    const { store: { requestForm }, nextFunc } = this.props;
    const { address, requirementsMet, required } = requestForm.locationInfo;

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
              placeholder={address ? 'Search for another address…' : 'Search for an address…'}
              type="text"
            />

            <button className="sf-i-b" type="submit" disabled={this.addressQuery.length === 0}>Search</button>
          </div>
        </form>

        <div className={`g ${BUTTON_ROW_STYLE.toString()}`}>
          <div className="g--6">
            { !required && <a href="javascript:void(0)" onClick={nextFunc}>Continue without location</a> }
          </div>
          <button className="btn g--6" disabled={!requirementsMet} onClick={nextFunc}>Next</button>
        </div>
      </div>
    );
  }

  maybeRenderMap() {
    const { store, loopbackGraphql } = this.props;
    const { belowMediaLarge } = store.ui;

    if (!belowMediaLarge) {
      return null;
    }

    return (
      <div className={`m-b300 ${MAP_CONTAINER_STYLE.toString()}`}>
        <LocationMap store={store} mode="picker" opacityRatio={1} loopbackGraphql={loopbackGraphql} />
      </div>
    );
  }
}
