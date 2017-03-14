import React from 'react';
import { css } from 'glamor';

import Link from 'next/link';

const STYLE = {
  nav: css({
    backgroundColor: 'black',
    color: 'white',
    textTransform: 'uppercase',
    padding: 10,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-end',

    '& a': {
      color: 'white',
      textDecoration: 'none',
      margin: '0 10px',
    },
  }),
};

export default function Nav() {
  return (
    <div className={`nav ft-ll ${STYLE.nav}`}>
      <Link prefetch href="/report" as="/"><a>Report a problem</a></Link>
      <Link prefetch href="/lookup"><a>Case look up</a></Link>
      <Link prefetch href="/go"><a>311 on the go</a></Link>
      <Link prefetch href="/faq"><a>FAQ</a></Link>
    </div>
  );
}
