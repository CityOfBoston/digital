import React, { ReactNode, ReactNodeArray } from 'react';

import { css } from 'emotion';

import { OPTIMISTIC_BLUE } from '../utilities/constants';

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
// todo: <section> must have an aria-label

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

const BUTTON_STYLING = css`
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  text-transform: inherit;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  cursor: pointer;
  &:focus {
    outline: auto;
    outline-color: ${OPTIMISTIC_BLUE};

    &:not(:focus-visible) {
      outline: none;
    }
  }
`;

const HEADER_STYLING = css`
  width: 100%;
  margin-bottom: 0;
  padding-right: 0;
  line-height: normal;

  display: flex;
  align-items: center;

  svg {
    width: 0.9em;
    height: 0.9em;

    stroke: ${OPTIMISTIC_BLUE};

    transition: transform 0.4s;
  }

  [aria-expanded='true'] ~ svg {
    transform: rotate(-180deg);
    transform-origin: center;
  }
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

  private triggerContent = (): ReactNode => {
    // If component has been disabled, only return the title string
    if (this.props.disabled) {
      return this.props.title;
    } else {
      return (
        <>
          <button
            type="button"
            className={BUTTON_STYLING}
            aria-expanded={this.state.expanded}
            onClick={this.toggleExpanded}
          >
            {this.props.title}
          </button>

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
        </>
      );
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isCollapsed !== this.props.isCollapsed) {
      this.setState({ expanded: !this.props.isCollapsed });
    }
  }

  render() {
    const headerAttributes: object = {
      className: `sh-title ${HEADER_STYLING}`,
    };

    return (
      <section className={this.props.className}>
        {/* trigger element: */}
        <div className={`sh ${this.props.subheader ? 'sh--sm' : ''}`}>
          {this.props.subheader ? (
            <h3 {...headerAttributes}>{this.triggerContent()}</h3>
          ) : (
            <h2 {...headerAttributes}>{this.triggerContent()}</h2>
          )}
        </div>

        {/* collapsible content */}
        <div hidden={!this.state.expanded}>{this.props.children}</div>
      </section>
    );
  }
}
