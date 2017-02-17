// @flow
/* eslint react/prefer-stateless-function: 0 */

import React from 'react';
import { css } from 'glamor';

export type ValueProps = {
  text: string,
};

export type ActionProps = {
  onInput: (SyntheticInputEvent) => void,
}

const STYLES = {
  text: css({
    width: '70%',
    height: 222,
    margin: '0 40px 40px 0',
    display: 'block',
    fontFamily: '"Lora", Georgia, serif',
    fontSize: 28,
    fontStyle: 'italic',
    border: 'none',
    backgroundImage: 'url(/static/img/textbox-bg.png)',
    backgroundSize: '38px 45px',
    backgroundAttachment: 'local',
    lineHeight: '45px',
  }),
};

export default class ReportBox extends React.Component {
  props: ValueProps & ActionProps;

  render() {
    const { text, onInput } = this.props;
    return <textarea className={STYLES.text} name="description" placeholder="How can we help?" defaultValue={text} onInput={onInput} />;
  }
}
