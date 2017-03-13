// @flow

import React from 'react';
import { css } from 'glamor';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

const CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
  flex: 1,
  paddingBottom: 200,
});

export type Props = {
  searchFunc: (q: string) => Promise<void>,
};

@observer
export default class SearchForm extends React.Component {
  props: Props;

  @observable query: string = '';

  @action.bound
  onInput(ev: SyntheticInputEvent) {
    this.query = ev.target.value;
  }

  onSubmit = (ev: SyntheticEvent) => {
    const { searchFunc } = this.props;

    ev.preventDefault();
    searchFunc(this.query);
  }

  render() {
    return (
      <div className={CONTAINER_STYLE}>
        <form className="sf" acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.onSubmit}>
          <div className="sf-i">
            <input type="text" name="q" placeholder="Search case ID…" value={this.query} onInput={this.onInput} className="sf-i-f" />
            <button className="sf-i-b">Search</button>
          </div>
        </form>
      </div>
    );
  }
}
