import React from 'react';

import { WHITE } from '@cityofboston/react-fleet';

export default function IdIcon(props): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 181 134"
      aria-hidden="true"
      focusable="false"
    >
      {props.side === 'front' ? frontElements() : backElements()}
    </svg>
  );

  function frontElements() {
    return (
      <>
        <path fill={WHITE} d="M2 2h176v130H2z" />

        <g fill="currentColor">
          <path d="M181 134H0V0h181zM4 130h172V4H4z" />
          <path d="M95 30h63v4H95z" />
          <path d="M95 48h63v4H95z" />
          <path d="M95 66h63v4H95z" />
          <path d="M95 83h63v4H95z" />
          <path d="M95 101h63v4H95z" />
        </g>

        <g fill={WHITE} stroke="currentColor" strokeWidth="3">
          <path d="M25 32h51v71H25z" />
          <path d="M57 70H44l-10 7v25h33V77z" />
          <ellipse cx="9" cy="9" rx="9" ry="9" transform="translate(41 46)" />
        </g>
      </>
    );
  }

  function backElements() {
    return (
      <>
        <path fill={WHITE} d="M2 2h176v130H2z" />

        <g fill="currentColor">
          <path d="M181 134H0V0h181zM4 130h172V4H4z" />

          <path d="M2 21h176v25H2z" />

          <path d="M16 69h5v41h-5z" />
          <path d="M51 69h5v41h-5z" />
          <path d="M70 69h5v41h-5z" />
          <path d="M38 69h5v41h-5z" />
          <path d="M23 69h2v41h-2z" />
          <path d="M28 69h2v41h-2z" />
          <path d="M45 69h2v41h-2z" />
          <path d="M65 69h2v41h-2z" />
          <path d="M58 69h2v41h-2z" />
          <path d="M36 69h2v41h-2z" />
        </g>

        <g fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M93 71h70" />
          <path d="M93 83h70" />
          <path d="M93 94h70" />
          <path d="M93 105h70" />
        </g>
      </>
    );
  }
}
