import path from 'path';
import tar from 'tar';
import { buildImage, makePackageJsonTar } from './modules-js/deploy-tools/build/helpers.js';
// import { buildImage } from './modules-js/deploy-tools/src/helpers';

// await buildImage(
//   workspaceDir,
//   dockerfilePath,
//   `${repository}:${cacheTag}`,
//   buildTags
// );

// const versionedTag = `${repository}:codebuild-${buildNum}-${commit}`;
// const envTag = variant ? `${variant}` : `default`;
// const buildTags = [
//   `${repository}:${cacheTag}`,
//   `${repository}:deploy-${envTag}`,
//   versionedTag,
// ];

const dockerfilePath = path.resolve('./services-js/access-boston/deploy/Dockerfile');
const workspaceDir = path.resolve('services-js/access-boston');
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
await makePackageJsonTar(workspaceDir, '');
console.error();

// await buildImage(
//   workspaceDir,
//   dockerfilePath,
//   `${repository}:${cacheTag}`,
//   buildTags
// );

