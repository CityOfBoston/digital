// @flow

import React from 'react';
import { connect } from 'react-redux';

import type { State } from '../../store';

type Props = {
  request: $PropertyType<State, 'request'>,
}

function CompleteFormContainer({ request }: Props) {
  return (
    <div>
      <h2>{request.code}</h2>
      <p>{request.description}</p>
    </div>
  );
}

const mapStateToProps = ({ request }: State) => ({
  request,
});

export default connect(mapStateToProps)(CompleteFormContainer);
