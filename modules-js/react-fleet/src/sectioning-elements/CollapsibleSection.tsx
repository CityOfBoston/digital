/** @jsx jsx */

import React, { ReactNode, ReactNodeArray } from 'react';

import { css, jsx } from '@emotion/core';
import hash from 'string-hash';

import {
  FOCUS_INDICATOR_COLOR,
  OPTIMISTIC_BLUE_DARK,
} from '../utilities/constants';

/**
 * Accessible collapsing content section component.
 *
 * Content loads expanded by default; pass “startCollapsed” prop to override.
 *
 * Pass in “disabled” property to remove expand/collapse functionality.
 *
 * Expand/collapse can be controlled by a parent element via “isCollapsed” prop;
 * componentDidUpdate() manages this behavior (for cases where sections should
 * expand/collapse based upon other sections’ state)
 *
 * Custom styling can be passed in to the <section> element via “className” prop.
 *
 * Inspired by https://inclusive-components.design/collapsible-sections/
 */

// todo: currently duplicates SectionHeader component;
// todo: modify that component to accept a string or element
// todo: have this trigger element be generic; if no <h1-6> present,

// todo: move utility style objects to react-fleet

interface Props {
  title: string;
  children: ReactNode | ReactNodeArray;
  subheader?: boolean;
  disabled?: boolean;
  startCollapsed?: boolean;
  isCollapsed?: boolean;
  className?: string;
}

interface State {
  expanded: boolean;
}

// utility styling object; clears most default button styling and ensures
// visible focus state (limited to :focus-visible, when supported)

// if IE/Edge isn’t a concern, “all: inherit” could be used instead
const BUTTON_CLEAR_DEFAULT_STYLING = css`
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  &:focus {
    outline: auto;
    outline-color: ${FOCUS_INDICATOR_COLOR};

    &:not(:focus-visible) {
      outline: none;
    }
  }
`;

// ensure button text inherits from its parent
const BUTTON_INHERIT_FONT_STYLING = css`
  text-transform: inherit;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
`;

const BUTTON_STYLING = css`
  ${BUTTON_CLEAR_DEFAULT_STYLING} ${BUTTON_INHERIT_FONT_STYLING}

  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    margin-right: auto;
  }

  svg {
    width: 0.9em;
    height: 0.9em;

    stroke: ${OPTIMISTIC_BLUE_DARK};

    transition: transform 0.4s;
  }

  &[aria-expanded='true'] > svg {
    transform: rotate(-180deg);
    transform-origin: center;
  }
`;

const HEADER_STYLING = css`
  width: 100%;
  margin-bottom: 0;
  padding-right: 0;
`;

export default class CollapsibleSection extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    disabled: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      expanded: !this.props.startCollapsed,
    };
  }

  private toggleExpanded = (): void => {
    this.setState({ expanded: !this.state.expanded });
  };

  private triggerContent = (id: string): ReactNode => {
    // If component has been disabled, only return the title string. This is
    // aria-hidden because the title is already used as a label in the parent
    // <section>.
    if (this.props.disabled) {
      return <span id={id}>{this.props.title}</span>;
    } else {
      return (
        <button
          type="button"
          css={BUTTON_STYLING}
          aria-expanded={this.state.expanded}
          onClick={this.toggleExpanded}
        >
          <span id={id}>{this.props.title}</span>

          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            overflow="visible"
          >
            <path
              d="M 2,5 10,16 18,5"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      );
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isCollapsed !== this.props.isCollapsed) {
      this.setState({ expanded: !this.props.isCollapsed });
    }
  }

  render() {
    const id = `collapsiblesection-${hash(this.props.title)}`;

    const headerAttributes = {
      className: 'sh-title',
      css: HEADER_STYLING,
    };

    // We use aria-label for the region so that we can give the <button> a label
    // that explains whether it’s expanding or collapsing.
    return (
      <section aria-labelledby={id} className={this.props.className}>
        {/* trigger element: */}
        <div className={`sh ${this.props.subheader ? 'sh--sm' : ''}`}>
          {this.props.subheader ? (
            <h3 {...headerAttributes}>{this.triggerContent(id)}</h3>
          ) : (
            <h2 {...headerAttributes}>{this.triggerContent(id)}</h2>
          )}
        </div>

        {/* collapsible content */}
        <div hidden={!this.state.expanded}>{this.props.children}</div>
      </section>
    );
  }
}
