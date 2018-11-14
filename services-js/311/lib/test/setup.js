// @flow

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { setConfig } from 'next/config';

import type { Config } from '../config';

Enzyme.configure({ adapter: new Adapter() });

setConfig(
  ({
    publicRuntimeConfig: {
      assetPrefix: '',
      cacheParam: '',
      cloudinaryUrl: '',
      cloudinaryUploadPreset: 'public',
      graphqlApiKey: '',
      liveAgentButtonId: '',
      mapboxAccessToken: 'FAKE_MAPBOX_ACCESS_TOKEN',
      mapboxStylePath: 'cityofboston/cj1p0mw1x000b2rmrocwwpyui',
    },
    serverRuntimeConfig: {},
  }: Config)
);
