import React from 'react';
import Link from 'next/link';
import { CHARLES_BLUE, SANS, WHITE } from '@cityofboston/react-fleet';
import { css } from 'emotion';

import { Account } from '../graphql/fetch-account';
import RedirectForm from './RedirectForm';

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

interface Props {
  account?: Account;
  noLinks?: boolean;
}

export default class AccessBostonHeader extends React.Component<Props> {
  render() {
    const { account, noLinks } = this.props;

    return (
      <div className={`${HEADER_STYLE} p-a200`}>
        <h1 className={`${ACCESS_BOSTON_TITLE_STYLE}`}>
          {noLinks ? (
            'Access Boston'
          ) : (
            <Link href="/">
              <a style={{ color: 'inherit' }}>Access Boston</a>
            </Link>
          )}
        </h1>
        {account && (
          <div className={`${HEADER_RIGHT_STYLE}`}>
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
      </div>
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
