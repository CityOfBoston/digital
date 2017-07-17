// Builds and deploys to AWS ECS
//
// Assumes docker and ecs-cli are installed.
//
// Meant to be run directly by Node without any npm packages,
// so that Travis can execute it from a clean environment.

const { spawn } = require('child_process');

function containerImageName() {
  const registryName = process.env['APP_SERVER_CONTAINER_REGISTRY'] || 'local';
  const repostoryName =
    process.env['APP_SERVER_CONTAINER_REPOSITORY'] || 'app-server';
  const containerTag =
    process.env['TRAVIS_BUILD_NUMBER'] && process.env['TRAVIS_COMMIT']
      ? `${process.env['TRAVIS_BUILD_NUMBER']}-${process.env['TRAVIS_COMMIT']}`
      : 'dev';

  return `${registryName}/${repostoryName}:${containerTag}`;
}

function buildContainer(name) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['build', '-t', name, '.'], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

function pushContainer(name) {
  return new Promise((resolve, reject) => {
    const child = spawn('ecs-cli', ['push', name], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

function deployService(name) {
  return new Promise((resolve, reject) => {
    if (!process.env['AWS_ECS_TASK_ROLE_ARN']) {
      throw new Error('AWS_ECS_TASK_ROLE_ARN not set');
    }

    if (!process.env['AWS_ECS_CLUSTER']) {
      throw new Error('AWS_ECS_CLUSTER not set');
    }

    if (!process.env['AWS_CLOUDWATCH_LOGS_GROUP']) {
      throw new Error('AWS_CLOUDWATCH_LOGS_GROUP not set');
    }

    if (!process.env['AWS_ECS_TARGET_GROUP_ARN']) {
      throw new Error('AWS_ECS_TARGET_GROUP_ARN not set');
    }

    const child = spawn(
      'ecs-cli',
      [
        'compose',
        '--task-role-arn',
        process.env['AWS_ECS_TASK_ROLE_ARN'],
        'service',
        'up',
        '--cluster',
        process.env['AWS_ECS_CLUSTER'],
        '--role',
        'ecsServiceRole',
        '--container-name',
        'app-server',
        '--container-port',
        '3000',
        '--target-group-arn',
        process.env['AWS_ECS_TARGET_GROUP_ARN'],
      ],
      {
        env: Object.assign({}, process.env, {
          // Used by docker-compose.yml
          APP_SERVER_IMAGE: name,
          // copying this in to be clear about what env vars are required
          AWS_CLOUDWATCH_LOGS_GROUP: process.env['AWS_CLOUDWATCH_LOGS_GROUP'],
          AWS_CLOUDWATCH_LOGS_PREFIX: 'containers',
        }),
        stdio: 'inherit',
      }
    );

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

(function() {
  const name = containerImageName();

  Promise.resolve(true)
    .then(() => buildContainer(name))
    .then(() => pushContainer(name))
    .then(() => deployService(name))
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Deploy successful.');
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('ERROR DEPLOYING CONTAINER', err);
      process.exit(1);
    });
})();
