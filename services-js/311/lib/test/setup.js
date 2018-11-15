const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const { setConfig } = require('next/config');

Enzyme.configure({ adapter: new Adapter() });

setConfig({
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
});
