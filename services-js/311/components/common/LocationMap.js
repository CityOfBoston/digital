// @flow

import React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';

import type { State } from '../../data/store';

const STYLE = {
  container: css({
    position: 'absolute',
    zIndex: 0,
    width: '100%',
  }),

  image: css({
    width: '100%',
  }),
};

export type ValueProps = {|
  googleApiKey: ?string,
|};

const mapStateToProps = ({ keys }: State): ValueProps => ({
  googleApiKey: keys.googleApi,
});

function LocationMap({ googleApiKey }: ValueProps) {
  return (
    <div className={STYLE.container}>
      <img className={STYLE.image} alt="" src={`https://maps.googleapis.com/maps/api/staticmap?center=Boston%20Common&zoom=13&size=1200x800&maptype=roadmap&scale=2&key=${googleApiKey || ''}`} />
    </div>
  );
}

export default connect(mapStateToProps)(LocationMap);
