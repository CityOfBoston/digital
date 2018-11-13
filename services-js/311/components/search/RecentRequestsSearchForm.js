// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import type RequestSearch from '../../data/store/RequestSearch';

export type Props = {|
  requestSearch: RequestSearch,
|};

@observer
export default class RecentRequestsSearchForm extends React.Component {
  props: Props;

  @action.bound
  handleSearchSubmit(ev: SyntheticInputEvent) {
    // nothing to do, because we are auto-searching
    ev.preventDefault();
  }

  @action.bound
  handleSearchInput(ev: SyntheticInputEvent) {
    const { requestSearch } = this.props;

    requestSearch.query = ev.target.value;
  }

  render() {
    const { requestSearch } = this.props;

    return (
      <form
        className="sf sf--y sf--md"
        acceptCharset="UTF-8"
        method="get"
        action="/lookup"
        onSubmit={this.handleSearchSubmit}
        role="search">
        <div className="sf-i">
          <input
            type="text"
            name="q"
            aria-label="Search field"
            placeholder="Search by case ID or keywords…"
            value={requestSearch.query}
            onChange={this.handleSearchInput}
            className="sf-i-f"
          />
          <button type="submit" className="sf-i-b">Search</button>
        </div>
      </form>
    );
  }
}
