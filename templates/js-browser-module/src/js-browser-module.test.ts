import path from 'path';
import fs from 'fs';
import Khaos from 'khaos';
import tmp from 'tmp';
import shell from 'shelljs';
import lockFile from 'lockfile';

// We need to have a lock so that two simultaneous 'yarn install's from separate
// templates don’t trample on each other.
const LOCKFILE_PATH = path.resolve(__dirname, '..', '..', 'template-test.lock');

let tmpDir;
let gotLock = false;

// Need enough time to wait for the lock.
jest.setTimeout(5 * 60 * 1000);

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    lockFile.lock(LOCKFILE_PATH, { wait: 5 * 60 * 1000 }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  gotLock = true;

  const buildDir = path.resolve(__dirname, '..', 'build');

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  tmpDir = tmp.dirSync({
    dir: buildDir,
    unsafeCleanup: true,
  });
});

afterEach(() => {
  if (tmpDir) {
    tmpDir.removeCallback();
    tmpDir = null;
  }

  if (gotLock) {
    lockFile.unlockSync(LOCKFILE_PATH);
    gotLock = false;
  }
});

it('generates a template with installable package.json and passing tests', function*() {
  const khaos = new Khaos('./template');

  const moduleName = path.basename(tmpDir.name);
  const answers = { name: moduleName, description: 'A test module' };

  const files = yield khaos.read();
  const schema = yield khaos.parse(files);

  // Guardrail: Ensure that we have values in `answers` for all of the questions
  // in the template. Otherwise Khaos will try to prompt on the command line.
  expect(Object.keys(answers)).toEqual(
    expect.arrayContaining(Object.keys(schema))
  );

  yield khaos.write(tmpDir.name, files, answers);

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(tmpDir.name, 'package.json'), 'utf-8')
  );
  expect(packageJson.name).toEqual(`@cityofboston/${moduleName}`);

  shell.cd(tmpDir.name);
  expect(
    shell.exec('yarn install --pure-lockfile --ignore-scripts', {
      silent: false,
    }).code
  ).toEqual(0);
  expect(shell.exec('yarn run test', { silent: true }).code).toEqual(0);
});
