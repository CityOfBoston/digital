/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactNode } from 'react';

import { GRAY_000 } from '@cityofboston/react-fleet';

interface Props {
  isGray?: boolean;
  ariaLabel?: string;
  stretch?: boolean;
  children: ReactNode;
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

  return (
    <section
      css={[
        {
          backgroundColor: props.isGray ? GRAY_000 : undefined,
        },
        props.stretch ? stretchAttributes : {},
      ]}
      {...ariaLabel}
    >
      <div
        className="b b-c"
        css={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexGrow: 1,
        }}
      >
        {props.children}
      </div>
    </section>
  );
}
