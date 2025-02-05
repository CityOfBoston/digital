/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactNode } from 'react';

import { MEDIA_LARGE } from '@cityofboston/react-fleet';

import { Account } from '../graphql/fetch-account';

import AccessBostonHeader from './AccessBostonHeader';
import AccessBostonFooter from './AccessBostonFooter';

import { MAIN_CLASS } from '../styles';

interface Props {
  children: ReactNode;
  account?: Account;
  noLinks?: boolean;
}

export default function AppWrapper(props: Props) {
  return (
    <div css={WRAPPER_STYLING}>
      <AccessBostonHeader account={props.account} noLinks={props.noLinks} />

      <main className={MAIN_CLASS}>{props.children}</main>

      <AccessBostonFooter />
    </div>
  );
}

const WRAPPER_STYLING = css({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',

  '.mn': {
    paddingTop: '47px',
  },

  '> main': {
    flexGrow: 1,

    display: 'flex',
    flexDirection: 'column',
  },

  [MEDIA_LARGE]: {
    '.sh-title': {
      fontSize: 'calc(22px + 15 * ((100vw - 480px) / 960))',
    },
  },
});
