import tar from 'tar';
import path from 'path';
import shell from 'shelljs';

// eslint-disable-next-line no-unused-vars
const workspaceDir = path.resolve('./services-js/access-boston');

export async function makePackageJsonTar(workspaceDir) {
  const packages = await getPackages(workspaceDir);
  // console.log('makePackageJsonTar > packages: ', packages);
  await tar
    .create(
      {
        file: 'package-json.tar',
        cwd: workspaceDir,
        portable: true,
        noMtime: true,
      },
      // packages.map(p => p.replace('../../', ''))
      packages
    )
    // eslint-disable-next-line no-unused-vars
    .then(_ => {
      console.log('.. tarball has been created ..');
    });
}

export async function getPackages(workspaceDir) {
  const shellCmd = `find ${workspaceDir} -name 'package.json' -not -path "*/node_modules/*"`;
  const packages = shell.exec(shellCmd, { silent: true }).stdout.split('\n');
  packages.pop();
  console.log('packages: ', packages);
  console.log('workspaceDir:', workspaceDir);

  return packages;
}

// const packages = await getPackages(workspaceDir);
// await makePackageJsonTar(workspaceDir);
