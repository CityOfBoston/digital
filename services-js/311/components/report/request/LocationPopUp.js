// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, action, runInAction } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';

import { SMALL_SCREEN } from '../../style-constants';

const CONTENT_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  [SMALL_SCREEN]: {
    marginTop: 0,
  },
});

const BUTTON_ROW_STYLE = css({
  alignItems: 'center',
});

export type Props = {
  store: AppStore,
  addressSearch: ?((string) => Promise<boolean>),
  nextFunc: () => void,
}

@observer
export default class LocationPopUp extends React.Component {
  props: Props;
  @observable addressQuery: string = '';

  @action.bound
  whenSearchInput(ev: SyntheticInputEvent) {
    this.addressQuery = ev.target.value;
  }

  whenSearchSubmit = async (ev: SyntheticInputEvent) => {
    const { addressSearch } = this.props;

    ev.preventDefault();

    if (!addressSearch) {
      return;
    }

    const found = await addressSearch(this.addressQuery);
    if (found) {
      runInAction('whenSearchSubmit success', () => {
        this.addressQuery = '';
      });
    }
  }

  render() {
    const { store, nextFunc, addressSearch } = this.props;
    const { address, requirementsMet, required } = store.locationInfo;

    return (
      <div className={CONTENT_STYLE}>
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

            <button className="sf-i-b" type="submit" disabled={this.addressQuery.length === 0 || !addressSearch}>Search</button>
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
}
