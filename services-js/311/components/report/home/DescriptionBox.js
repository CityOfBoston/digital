// @flow

import React from 'react';
import { css } from 'glamor';

export type ValueProps = {
  text: string,
  style?: Object,
};

export type ActionProps = {
  onInput: (SyntheticInputEvent) => mixed,
};

export type Props = ValueProps & ActionProps;

const TEXTAREA_STYLE = css({
  display: 'block',
  width: '100%',
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 28,
  fontStyle: 'italic',
  border: 'none',
  backgroundImage: 'url(/static/img/textbox-bg.png)',
  backgroundSize: '38px 45px',
  backgroundAttachment: 'local',
  lineHeight: '45px',
});

export default function DescriptionBox({ text, style, onInput }: Props) {
  return (
    <textarea className={css(TEXTAREA_STYLE, style)} name="description" placeholder="How can we help?" defaultValue={text} onInput={onInput} />
  );
}
