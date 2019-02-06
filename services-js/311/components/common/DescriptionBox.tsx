import React, { FormEvent, FocusEvent } from 'react';
import { css } from 'emotion';

import { SERIF } from '@cityofboston/react-fleet';

import { assetUrl } from '../style-constants';

type Props = {
  minHeight: number;
  maxHeight: number;
  onFocus: null | ((ev: FocusEvent<HTMLTextAreaElement>) => unknown);
  onBlur: null | ((ev: FocusEvent<HTMLTextAreaElement>) => unknown);

  text: string;
  placeholder: string;
  setTextarea: (el: HTMLElement | null) => unknown;
  onInput: (ev: FormEvent<HTMLTextAreaElement>) => unknown;
};

type State = {
  height: number | null;
};

const WRAPPER_STYLE = css({
  overflowY: 'auto',
  padding: 16,
});

const TEXTAREA_STYLE = css({
  display: 'block',
  resize: 'none',
  width: '100%',
  height: '100%',
  fontFamily: SERIF,
  fontSize: 28,
  fontStyle: 'italic',
  border: 'none',
  backgroundImage: `url(${assetUrl('img/textbox-bg.png')})`,
  backgroundSize: '38px 45px',
  backgroundAttachment: 'local',
  lineHeight: '45px',
  overflow: 'hidden',
});

export default class DescriptionBox extends React.Component<Props, State> {
  static defaultProps: Pick<
    Props,
    'minHeight' | 'maxHeight' | 'onFocus' | 'onBlur'
  > = {
    minHeight: 222,
    maxHeight: 500,
    onFocus: null,
    onBlur: null,
  };

  textarea: HTMLElement | null = null;

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
        height: Math.min(
          maxHeight,
          Math.max(minHeight, this.textarea.scrollHeight)
        ),
      });
    }
  }

  textareaRef = (textarea: HTMLTextAreaElement | null) => {
    const { setTextarea } = this.props;

    this.textarea = textarea;
    setTextarea(textarea);
  };

  updateHeight(el: HTMLElement) {
    this.setState({
      height: el.scrollHeight,
    });
  }

  onInput = (ev: FormEvent<HTMLTextAreaElement>) => {
    const { onInput } = this.props;

    this.updateHeight(ev.currentTarget);

    return onInput(ev);
  };

  onFocus = (ev: FocusEvent<HTMLTextAreaElement>) => {
    const { onFocus } = this.props;

    this.updateHeight(ev.currentTarget);

    if (onFocus) {
      onFocus(ev);
    }
  };

  onBlur = (ev: FocusEvent<HTMLTextAreaElement>) => {
    const { minHeight, maxHeight, onBlur } = this.props;

    if (minHeight !== maxHeight) {
      this.setState({ height: null });
    }

    if (onBlur) {
      onBlur(ev);
    }
  };

  render() {
    const { text, placeholder, minHeight, maxHeight } = this.props;
    const { height } = this.state;

    return (
      <div
        className={`br br-a100 ${WRAPPER_STYLE.toString()}`}
        style={{ minHeight, maxHeight }}
      >
        <textarea
          className={TEXTAREA_STYLE}
          style={{ height: height === null ? undefined : height }}
          name="description"
          aria-label="Description of the problem"
          placeholder={placeholder}
          defaultValue={text}
          onInput={this.onInput}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          ref={this.textareaRef}
        />
      </div>
    );
  }
}
