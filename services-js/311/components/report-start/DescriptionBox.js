// @flow

import React from 'react';
import { css } from 'glamor';

export type ValueProps = {
  text: string,
};

export type ActionProps = {
  onInput: (SyntheticInputEvent) => mixed,
};

export type Props = ValueProps & ActionProps;

const TEXTAREA_STYLE = css({
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
});

export default function DescriptionBox({ text, onInput }: Props) {
  return (
    <textarea className={TEXTAREA_STYLE} name="description" placeholder="How can we help?" defaultValue={text} onInput={onInput} />
  );
}
