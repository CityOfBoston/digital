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
  const headerAttributes = () => {
    if (props.account) {
      return {
        account: props.account,
        noLinks: props.noLinks,
      };
    }

    return { noLinks: true };
  };

  return (
    <div css={WRAPPER_STYLING}>
      <AccessBostonHeader {...headerAttributes()} />

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
  },
});
