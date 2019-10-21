/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { Component } from 'react';

import Link from 'next/link';

import { CHARLES_BLUE, SANS, WHITE } from '@cityofboston/react-fleet';

import { Account } from '../graphql/fetch-account';
import RedirectForm from '../RedirectForm';

interface Props {
  account?: Account;
  noLinks?: boolean;
}

export default class AccessBostonHeader extends Component<Props> {
  render() {
    const { account, noLinks } = this.props;
    // console.log('header > account: ', account);

    return (
      <header className="p-a200" css={HEADER_STYLE}>
        <h1 css={ACCESS_BOSTON_TITLE_STYLE}>
          {noLinks ? (
            'Access Boston'
          ) : (
            <Link href="/">
              <a style={{ color: 'inherit' }}>Access Boston</a>
            </Link>
          )}
        </h1>
        {account && (
          <div css={HEADER_RIGHT_STYLE}>
            <span style={{ marginRight: '1em' }}>
              {getEmployeeName(account)}
            </span>

            {!noLinks && (
              <RedirectForm path="/logout">
                <button type="submit" className="btn btn--sm btn--100">
                  Logout
                </button>
              </RedirectForm>
            )}
          </div>
        )}
      </header>
    );
  }
}

function getEmployeeName({ firstName, lastName, employeeId }: Account): string {
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim();
  } else {
    return employeeId;
  }
}

const HEADER_STYLE = css({
  display: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: CHARLES_BLUE,
  color: WHITE,
  zIndex: 2,
});

const HEADER_RIGHT_STYLE = css({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
});

const ACCESS_BOSTON_TITLE_STYLE = css({
  fontFamily: SANS,
  textTransform: 'uppercase',
  fontSize: '1.25rem',
  fontWeight: 'bold',
});
