import {
  ServerRuntimeConfig as CommonServerRuntimeConfig,
  PublicRuntimeConfig as CommonPublicRuntimeConfig,
} from '@cityofboston/next-client-common';

export interface AppPublicRuntimeConfig {
  assetPrefix: string;
  // This is set by our standard deployment process.
  cacheParam: string;
  cloudinaryUrl: string;
  cloudinaryUploadPreset: string;
  liveAgentButtonId: string;
  mapboxAccessToken: string;
  mapboxStylePath: string;
}

export interface AppServerRuntimeConfig {}

export type PublicRuntimeConfig = AppPublicRuntimeConfig &
  CommonPublicRuntimeConfig;

export type ServerRuntimeConfig = AppServerRuntimeConfig &
  CommonServerRuntimeConfig;

export function makeAssetPrefix(env?: typeof process.env) {
  env = env || process.env;

  return env.ASSET_HOST && env.ASSET_HOST !== '.'
    ? `https://${env.ASSET_HOST}`
    : '';
}

export type NextConfig = {
  publicRuntimeConfig: PublicRuntimeConfig;
  serverRuntimeConfig: ServerRuntimeConfig;
};

// This is for Next's next.config.js configuration feature. Factored out so that
// the Storybook code can use it.
//
// To set values for the Jest unit tests, see /lib/test/setup.js
export function makeNextConfig(
  env?: typeof process.env
): {
  publicRuntimeConfig: AppPublicRuntimeConfig;
  serverRuntimeConfig: AppServerRuntimeConfig;
} {
  env = env || process.env;

  return {
    publicRuntimeConfig: {
      assetPrefix: makeAssetPrefix(env),
      // This is set by our standard deployment process.
      cacheParam: (env.GIT_REVISION && env.GIT_REVISION.substring(0, 8)) || '',
      liveAgentButtonId: env.LIVE_AGENT_BUTTON_ID || '',
      cloudinaryUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD ||
        ''}`,
      cloudinaryUploadPreset: env.CLOUDINARY_UPLOAD_PRESET || '',
      mapboxAccessToken: env.MAPBOX_ACCESS_TOKEN || '',
      mapboxStylePath: env.MAPBOX_STYLE_PATH || '',
    },

    serverRuntimeConfig: {},
  };
}
