/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { useEffect, useState, Fragment, ReactChild } from 'react';

import hash from 'string-hash';

import { CLEAR_DEFAULT_STYLING } from '../utilities/css';
import { OPTIMISTIC_BLUE_DARK } from '../utilities/constants';

interface Props {
  summaryContent: ReactChild;
  id?: string;
  children: ReactChild | ReactChild[];
  handleToggle?: (isOpen: boolean) => void;
}

/**
 * Show/Hide Disclosure component; renders native <details> element when
 * supported, and provides an a11y-friendly widget as a fallback.
 *
 * https://www.w3.org/TR/wai-aria-practices/#disclosure
 */
export default function DetailsDisclosure(props: Props): JSX.Element {
  const [detailsElementIsSupported, setDetailsElementIsSupported] = useState<
    boolean
  >(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (props.handleToggle) {
      props.handleToggle(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    // ie11 does not support the <details> element, but we can test for support
    // by checking if the “open” attribute is present.
    const testElement = document.createElement('details');

    setDetailsElementIsSupported('open' in testElement);
  }, []); // effect only needs to run once

  return (
    <Fragment>
      {detailsElementIsSupported ? (
        // @ts-ignore - DetailsHTMLAttributes<T> erroneously does not include onToggle
        <details
          css={DETAILS_STYLING}
          onToggle={() => setIsOpen(isOpen => !isOpen)}
        >
          <summary>{summaryElement(props.summaryContent)}</summary>

          {props.children}
        </details>
      ) : (
        <Fallback
          summaryContent={props.summaryContent}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          {props.children}
        </Fallback>
      )}
    </Fragment>
  );
}

interface FallbackProps {
  children: ReactChild | Array<ReactChild>;
  summaryContent: ReactChild;
  isOpen: boolean;
  setIsOpen: any;
  id?: string;
}

function Fallback(props: FallbackProps) {
  const { children, isOpen, setIsOpen, summaryContent } = props;

  // If an id is not passed in, a unique id is required in case more
  // than one <DetailsDisclosure> component is present.
  const id = props.id || hash(props.summaryContent);

  const toggleIsOpen = () => {
    setIsOpen(isOpen => !isOpen);
  };

  return (
    <div css={FALLBACK_STYLING} id={id}>
      <button
        type="button"
        css={CLEAR_DEFAULT_STYLING.BUTTON}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        onClick={toggleIsOpen}
      >
        {summaryElement(summaryContent)}
      </button>

      <div id={`${id}-content`} className="details-content">
        {children}
      </div>
    </div>
  );
}

function summaryElement(content: ReactChild): ReactChild {
  return (
    // Using <> shorthand results in “React is not defined” errors in Storybook:
    // https://github.com/emotion-js/emotion/issues/1303
    <Fragment>
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
        overflow="visible"
        css={SVG_STYLING}
      >
        <path d="M 2,5 10,20 18,5 Z" />
      </svg>
      {content}
    </Fragment>
  );
}

const DETAILS_STYLING = css({
  summary: {
    listStyle: 'none',

    '::-webkit-details-marker': {
      display: 'none',
    },
  },

  '&:hover': {
    cursor: 'pointer',

    '> summary': {
      color: OPTIMISTIC_BLUE_DARK,
      textDecoration: 'underline',
    },
  },

  // We rotate the path rather than the entire svg because the focus ring of the
  // summary component gets visually pushed out as the svg rotates in Chrome.
  path: {
    transformOrigin: 'center',
    transform: 'rotate(-90deg)',
    transition: 'transform 0.15s',
  },

  '&[open] path': {
    transform: 'rotate(0deg)',
  },
});

const FALLBACK_STYLING = css({
  '> .details-content': {
    display: 'none',
  },

  button: {
    cursor: 'pointer',

    // ie11 doesn’t respect rotate() being applied to the path, so we instead
    // transform the entire svg in this case.
    svg: {
      transform: 'rotate(-90deg)',
      transition: 'transform 0.15s',
    },

    '&:hover': {
      color: OPTIMISTIC_BLUE_DARK,
      textDecoration: 'underline',
    },

    '&[aria-expanded="true"]': {
      svg: {
        transform: 'rotate(0deg)',
      },

      '& ~ .details-content': {
        display: 'block',
      },
    },
  },
});

const SVG_STYLING = css({
  width: '0.7em',
  height: '0.7em',
  marginRight: '0.4em',
  color: OPTIMISTIC_BLUE_DARK,

  path: {
    fill: 'currentColor',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinejoin: 'round',
  },
});
