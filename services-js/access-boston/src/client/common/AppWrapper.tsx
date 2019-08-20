/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactNode } from 'react';

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

  '> main': {
    flexGrow: 1,

    display: 'flex',
    flexDirection: 'column',
  },
});
