// @flow

import React from 'react';

import { css } from 'glamor';

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

export type Props = {|
  googleApiKey: ?string,
|};

export default function LocationMap({ googleApiKey }: Props) {
  return (
    <div className={STYLE.container}>
      <img className={STYLE.image} alt="" src={`https://maps.googleapis.com/maps/api/staticmap?center=Boston%20Common&zoom=13&size=1200x800&maptype=roadmap&scale=2&key=${googleApiKey || ''}`} />
    </div>
  );
}
