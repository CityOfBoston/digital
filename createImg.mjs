import path from 'path';
// import { buildImage, makePackageJsonTar } from './modules-js/deploy-tools/build/helpers.js';
import { buildImage } from './modules-js/deploy-tools/build/helpers.js';
import { makePackageJsonTar } from '../digital/createTar.mjs';
// import { buildImage } from './modules-js/deploy-tools/src/helpers';

const dockerfilePath = path.resolve('./services-js/access-boston/deploy/Dockerfile');
const workspaceDir = path.resolve('./');
const repository = `access-boston`;
const cacheTag = 'latest';
const variant = `test`;
const buildNum = `buildNumId`;
const commit = `commitId`;

const versionedTag = `${repository}:codebuild-${buildNum}-${commit}`;
const envTag = variant ? `${variant}` : `default`;
const buildTags = [
  `${repository}:${cacheTag}`,
  `${repository}:deploy-${envTag}`,
  versionedTag,
];

console.error('🎁 Creating package-json.tar…');
await makePackageJsonTar(workspaceDir);
// await makePackageJsonTar(workspaceDir, '');
console.error();

await buildImage(
  workspaceDir,
  dockerfilePath,
  `${repository}:${cacheTag}`,
  buildTags
);

