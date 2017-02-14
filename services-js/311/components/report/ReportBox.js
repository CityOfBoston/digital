// @flow
/* eslint react/prefer-stateless-function: 0 */

import React from 'react';

export type ValueProps = {
  text: string,
};

export type ActionProps = {
  onInput: (SyntheticInputEvent) => void,
}

export default class ReportBox extends React.Component {
  props: ValueProps & ActionProps;

  render() {
    const { text, onInput } = this.props;
    return <textarea name="description" defaultValue={text} onInput={onInput} />;
  }
}
