import React from 'react';
import Link from 'next/link';
import { CHARLES_BLUE, SANS } from '@cityofboston/react-fleet';
import { css } from 'emotion';

import CrumbContext from '../client/CrumbContext';
import { Account } from './graphql/fetch-account';

const HEADER_STYLE = css({
  display: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: CHARLES_BLUE,
  color: 'white',
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
}

export default class AccessBostonHeader extends React.Component<Props> {
  render() {
    const { account } = this.props;

    return (
      <CrumbContext.Consumer>
        {crumb => (
          <div className={`${HEADER_STYLE} p-a200`}>
            <h1 className={`${ACCESS_BOSTON_TITLE_STYLE}`}>
              <Link href="/">
                <a style={{ color: 'inherit' }}>Access Boston</a>
              </Link>
            </h1>
            {account && (
              <div className={`${HEADER_RIGHT_STYLE}`}>
                <span style={{ marginRight: '1em' }}>{account.employeeId}</span>
                <form action="/logout" method="POST">
                  <input type="hidden" name="crumb" value={crumb} />
                  <button className="btn btn--sm btn--100">Logout</button>
                </form>
              </div>
            )}
          </div>
        )}
      </CrumbContext.Consumer>
    );
  }
}
