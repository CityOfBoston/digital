// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, action, runInAction } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';

import { LocationMapWithLib } from '../map/LocationMap';

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
  addressSearch: ?((query: string) => Promise<boolean>),
  nextFunc: () => void,
}

@observer
export default class LocationPopUp extends React.Component {
  props: Props;
  @observable addressQuery: string = '';

  addressSearch: ?((query: string) => Promise<boolean>);

  constructor(props: Props) {
    super(props);

    this.addressSearch = props.addressSearch;
  }

  setAddressSearch = (addressSearch: ?((query: string) => Promise<boolean>)) => {
    this.addressSearch = addressSearch;
  }

  @action.bound
  whenSearchInput(ev: SyntheticInputEvent) {
    this.addressQuery = ev.target.value;
  }

  whenSearchSubmit = async (ev: SyntheticInputEvent) => {
    ev.preventDefault();

    if (!this.addressSearch) {
      return;
    }

    const found = await this.addressSearch(this.addressQuery);
    if (found) {
      runInAction('whenSearchSubmit success', () => {
        this.addressQuery = '';
      });
    }
  }

  render() {
    const { store, nextFunc } = this.props;
    const { address, requirementsMet, required } = store.locationInfo;

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

            <button className="sf-i-b" type="submit" disabled={this.addressQuery.length === 0 || !this.addressSearch}>Search</button>
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
    const { store } = this.props;
    const { belowMediaLarge } = store.ui;

    if (!belowMediaLarge) {
      return null;
    }

    return (
      <div className={`m-b300 ${MAP_CONTAINER_STYLE.toString()}`}>
        <LocationMapWithLib store={store} mode="picker" setLocationMapSearch={this.setAddressSearch} opacityRatio={1} />
      </div>
    );
  }
}
