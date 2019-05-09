/** @jsx jsx */

import React, { useEffect, useState } from 'react';

import { css } from 'emotion';
import { jsx } from '@emotion/core';

import {
  CLEAR_DEFAULT_STYLING,
  OPTIMISTIC_BLUE_DARK,
} from '@cityofboston/react-fleet';

export default function ApostilleRequestInstructions(): JSX.Element {
  const [detailsElementIsSupported, setDetailsElementIsSupported] = useState<
    boolean
  >(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleIsOpen = () => {
    setIsOpen(isOpen => !isOpen);
  };

  useEffect(
    () => {
      // ie11 does not support the <details> element, but we can test for support
      // by checking if the “open” attribute is present.
      const testElement = document.createElement('details');

      setDetailsElementIsSupported('open' in testElement);
    },
    // Because we only need to test for support once, ensure the effect does
    // not fire again.
    [detailsElementIsSupported]
  );

  if (detailsElementIsSupported) {
    return (
      <details className={DETAILS_STYLING}>
        <summary>{summaryContent()}</summary>

        {detailsContent()}
      </details>
    );
  } else {
    return (
      <aside className={FALLBACK_STYLING}>
        <button
          type="button"
          css={CLEAR_DEFAULT_STYLING.BUTTON}
          aria-expanded={isOpen}
          aria-controls="detailsContent"
          onClick={toggleIsOpen}
        >
          {summaryContent()}
        </button>

        <div id="detailsContent" className="details-content">
          {detailsContent()}
        </div>
      </aside>
    );
  }
}

function summaryContent(): React.ReactChild {
  return (
    <>
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
        overflow="visible"
        className={SVG_STYLING}
      >
        <path d="M 2,5 10,20 18,5 Z" />
      </svg>
      Are you requesting a certificate for international use that requires an
      Apostille from the Massachusetts Secretary of State?
    </>
  );
}

function detailsContent(): React.ReactChild {
  return (
    <>
      <p>
        You need to have a hand signature from the Registry. After you finish
        your order, please email birth@boston.gov with:
      </p>

      <ul>
        <li>the name of the person on the record</li>
        <li>their date of birth, and</li>
        <li>let us know that you need the signature for an Apostille.</li>
      </ul>
    </>
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
