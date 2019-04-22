#!/usr/bin/env node

/* eslint no-console: 0 */

const path = require('path');
const fs = require('fs');
const util = require('util');

const shell = require('shelljs');

const stat = util.promisify(fs.stat);

const SOURCES = ['package.json', 'bin', 'src'];
const PACKAGE_FILE = 'deploy-tools.tgz';
// puts deploy-tools.tgz at the root
const PACKAGE_PATH = path.resolve(__dirname, '..', '..', '..', PACKAGE_FILE);

/**
 * Detects if any source files have changed since the last time the npm .tgz
 * package was built. If so, re-runs npm pack.
 *
 * Meant to be run as a pre-commit hook.
 *
 * This file is written in Node 8–compatible JavaScript so that it doesn’t need
 * to be pre-compiled before using.
 */
(async function() {
  const sourceTimestampsMs = shell.ls('-Rl', SOURCES).map(s => s.mtimeMs);

  const latestSourceTimestampMs = Math.max(...sourceTimestampsMs);

  const targetTimestampMs = await stat(PACKAGE_PATH).then(
    s => s.mtime,
    // If the stat fails (probably because the file doesn’t exist) pretend it
    // has a timestamp of 0 so that it will get re-cretaed.
    () => 0
  );

  if (targetTimestampMs > latestSourceTimestampMs) {
    console.info(`📆 ${PACKAGE_FILE} is up-to-date`);
    return;
  }

  console.info(`🏚  ${PACKAGE_FILE} is out-of-date and needs rebuilding…`);

  const { stdout, code } = shell.exec(`npm pack`, { silent: true });

  if (code !== 0) {
    throw new Error(`npm pack failed with error ${code}`);
  }

  // npm pack prints out the destination file name as the last line of output.
  const fileName = stdout
    .trim()
    .split('\n')
    .pop()
    .trim();

  // We rename the output to "deploy-tools.tgz" because the actual name,
  // "cityofboston-deploy-tools-0.0.0.tgz" is somewhat unwieldy. We also put it
  // at the root of the repo so it’s easier to refer to in npx commands.
  shell.mv(fileName, PACKAGE_PATH);

  // This git command checks to see if the working directory version of the file
  // differs from what’s in staging / HEAD. If it returns 1 then there is a
  // difference, which means we need to add the file.
  //
  // We don’t git add in all cases because we want to show the message that
  // we’re doing something, since the file won’t appear in the comments when
  // making the commit message.
  const changed =
    shell.exec(`git diff --quiet -- ${PACKAGE_PATH}`, { env: {} }).code === 1;

  if (changed) {
    shell.exec(`git add ${PACKAGE_PATH}`, { env: {} });
    console.info();
    console.info(
      `🗂  ${PACKAGE_FILE} has changed. Automatically adding it to your commit.`
    );
  } else {
    console.info(`🙊 No changes to ${PACKAGE_FILE} were found.`);
  }
})().then(
  () => {},
  err => {
    console.error(err);
    process.exit(-1);
  }
);
