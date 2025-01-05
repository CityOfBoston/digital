/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactNode } from 'react';

import { GRAY_000 } from '@cityofboston/react-fleet';

interface Props {
  isGray?: boolean;
  ariaLabel?: string;
  stretch?: boolean;
  children: ReactNode;
  css?: any;
}

/**
 * Utility component to provide full-width background color as needed.
 */
export default function Section(props: Props) {
  const ariaLabel = props.ariaLabel ? { 'aria-label': props.ariaLabel } : null;

  const stretchAttributes = css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  });

  const prepCss = [
    {
      backgroundColor: props.isGray ? GRAY_000 : undefined,
    },
    props.stretch ? stretchAttributes : {},
  ];

  return (
    <section css={prepCss} {...ariaLabel}>
      <div
        className="b"
        css={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexGrow: 1,
          fontSize: '1.2em',
          lineHeight: '1.75rem',
        }}
      >
        {props.children}
      </div>
    </section>
  );
}
