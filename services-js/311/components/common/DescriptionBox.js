// @flow

import React from 'react';
import { css } from 'glamor';

export type DefaultProps = {|
  minHeight: number,
  maxHeight: number,
  onFocus: ?(ev: SyntheticInputEvent) => mixed,
  onBlur: ?(ev: SyntheticInputEvent) => mixed,
|}

export type Props = {|
  /* :: ...DefaultProps, */
  text: string,
  placeholder: string,
  onInput: (ev: SyntheticInputEvent) => mixed,
|}

const TEXTAREA_STYLE = css({
  display: 'block',
  resize: 'none',
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

export default class DescriptionBox extends React.Component {
  props: Props;
  state: {
    height: ?number,
  };

  static defaultProps: DefaultProps = {
    minHeight: 222,
    maxHeight: 500,
    onFocus: null,
    onBlur: null,
  };

  textarea: ?HTMLElement = null;

  constructor(props: Props) {
    super(props);

    let height;

    if (props.minHeight === props.maxHeight) {
      height = props.minHeight;
    } else if (props.text) {
      height = null;
    } else {
      height = props.minHeight;
    }

    this.state = {
      height,
    };
  }

  componentDidMount() {
    this.maybeRecalculateHeight();
  }

  componentDidUpdate() {
    this.maybeRecalculateHeight();
  }

  maybeRecalculateHeight() {
    const { minHeight, maxHeight } = this.props;
    if (this.state.height === null && this.textarea) {
      // We’re ok with the tiny layout thrash here to recalculate the right height
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        height: Math.min(maxHeight, Math.max(minHeight, this.textarea.scrollHeight)),
      });
    }
  }

  textareaRef = (textarea: ?HTMLElement) => {
    this.textarea = textarea;
  }

  onInput = (ev: SyntheticInputEvent) => {
    const { minHeight, maxHeight, onInput } = this.props;

    this.setState({
      // || minHeight avoids NaN height in enzyme tests
      height: Math.min(maxHeight, Math.max(minHeight, ev.target.scrollHeight)) || minHeight,
    });

    return onInput(ev);
  }

  onBlur = (ev: SyntheticInputEvent) => {
    const { minHeight, maxHeight, onBlur } = this.props;

    if (minHeight !== maxHeight) {
      this.setState({ height: null });
    }

    if (onBlur) {
      onBlur(ev);
    }
  }

  render() {
    const { text, placeholder, onFocus } = this.props;
    const { height } = this.state;

    return (
      <textarea
        className={css(TEXTAREA_STYLE, { height })}
        name="description"
        placeholder={placeholder}
        defaultValue={text}
        onInput={this.onInput}
        onFocus={onFocus}
        onBlur={this.onBlur}
        ref={this.textareaRef}
      />
    );
  }
}
