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

export type DefaultProps = {|
  fromCaseView: boolean,
|}

export type Props = {|
  /* :: ...DefaultProps, */
  searchFunc: (q: string) => Promise<void>,
|};

@observer
export default class SearchForm extends React.Component {
  props: Props;
  static defaultProps: DefaultProps = {
    fromCaseView: false,
  };

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
    const { fromCaseView } = this.props;

    return (
      <div className={fromCaseView ? null : CONTAINER_STYLE}>
        <form className={`sf sf--y ${fromCaseView ? 'sf--md' : ''}`} acceptCharset="UTF-8" method="get" action="/lookup" onSubmit={this.onSubmit}>
          <div className="sf-i">
            <input type="text" name="q" placeholder={fromCaseView ? 'Search again…' : 'Search case ID…'} value={this.query} onInput={this.onInput} className="sf-i-f" />
            <button className="sf-i-b">Search</button>
          </div>
        </form>
      </div>
    );
  }
}
