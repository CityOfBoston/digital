// @flow

export type PublicRuntimeConfig = {|
  assetPrefix: string,
  // This is set by our standard deployment process.
  cacheParam: string,
  cloudinaryUrl: string,
  cloudinaryUploadPreset: string,
  graphqlApiKey: string,
  liveAgentButtonId: string,
  mapboxAccessToken: string,
  mapboxStylePath: string,
|};
export type ServerRuntimeConfig = {};

export type Config = {|
  publicRuntimeConfig: PublicRuntimeConfig,
  // Will be empty when the code is running on the client.
  serverRuntimeConfig: ServerRuntimeConfig | {||},
|};

export function makeAssetPrefix(env?: { [key: string]: ?string }) {
  env = env || process.env;

  return env.ASSET_HOST && env.ASSET_HOST !== '.'
    ? `https://${env.ASSET_HOST}`
    : '';
}

// This is for Next's next.config.js configuration feature. Factored out so that
// the Storybook code can use it.
//
// To set values for the Jest unit tests, see /lib/test/setup.js
export default function makeConfig(env?: { [key: string]: ?string }): Config {
  env = env || process.env;

  return {
    publicRuntimeConfig: ({
      assetPrefix: makeAssetPrefix(env),
      // This is set by our standard deployment process.
      cacheParam: (env.GIT_REVISION && env.GIT_REVISION.substring(0, 8)) || '',
      graphqlApiKey: env.WEB_API_KEY || '',
      liveAgentButtonId: env.LIVE_AGENT_BUTTON_ID || '',
      cloudinaryUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD ||
        ''}`,
      cloudinaryUploadPreset: env.CLOUDINARY_UPLOAD_PRESET || '',
      mapboxAccessToken: env.MAPBOX_ACCESS_TOKEN || '',
      mapboxStylePath: env.MAPBOX_STYLE_PATH || '',
    }: PublicRuntimeConfig),

    serverRuntimeConfig: ({}: ServerRuntimeConfig),
  };
}
