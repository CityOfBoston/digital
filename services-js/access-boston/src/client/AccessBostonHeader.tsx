import React from 'react';
import { CHARLES_BLUE, SANS } from '@cityofboston/react-fleet';
import { css } from 'emotion';

import { InfoResponse } from '../lib/api';
import CrumbContext from '../client/CrumbContext';

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
  info: InfoResponse;
}

export default class AccessBostonHeader extends React.Component<Props> {
  render() {
    const { employeeId } = this.props.info;

    return (
      <CrumbContext.Consumer>
        {crumb => (
          <div className={`${HEADER_STYLE} p-a200`}>
            <h1 className={`${ACCESS_BOSTON_TITLE_STYLE}`}>Access Boston</h1>
            <div className={`${HEADER_RIGHT_STYLE}`}>
              <span style={{ marginRight: '1em' }}>{employeeId}</span>
              <form action="/logout" method="POST">
                <input type="hidden" name="crumb" value={crumb} />
                <button className="btn btn--sm btn--100">Logout</button>
              </form>
            </div>
          </div>
        )}
      </CrumbContext.Consumer>
    );
  }
}
