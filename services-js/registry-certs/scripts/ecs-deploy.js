// Builds and deploys to AWS ECS
//
// Assumes docker and ecs-cli are installed.
//
// Meant to be run directly by Node without any npm packages,
// so that Travis can execute it from a clean environment.

const { spawn } = require('child_process');

function containerImage(serviceName) {
  const repositoryPieces = [
    process.env['AWS_ECS_REGISTRY'],
    process.env['AWS_ECS_REPOSITORY_NAMESPACE'],
    serviceName,
  ];

  // We tag the images with the Travis build number, so we can trace that back (and because it’s nicely
  // incrementing for sort) and the current Git commit so we know what version of the code it is.
  const containerTag =
    process.env['TRAVIS_BUILD_NUMBER'] && process.env['TRAVIS_COMMIT']
      ? `${process.env['TRAVIS_BUILD_NUMBER']}-${process.env['TRAVIS_COMMIT']}`
      : 'dev';

  return `${repositoryPieces.filter(p => !!p).join('/')}:${containerTag}`;
}

function buildContainer(image) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['build', '-t', image, '.'], {
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

function pushContainer(image) {
  return new Promise((resolve, reject) => {
    const child = spawn('ecs-cli', ['push', image], {
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

function deployService(serviceName, image) {
  return new Promise((resolve, reject) => {
    if (!process.env['AWS_ECS_SERVICE_ROLE']) {
      throw new Error('AWS_ECS_SERVICE_ROLE not set');
    }

    if (!process.env['AWS_ECS_TASK_ROLE']) {
      throw new Error('AWS_ECS_TASK_ROLE not set');
    }

    if (!process.env['AWS_ECS_CLUSTER']) {
      throw new Error('AWS_ECS_CLUSTER not set');
    }

    if (!process.env['AWS_CLOUDWATCH_LOGS_GROUP']) {
      throw new Error('AWS_CLOUDWATCH_LOGS_GROUP not set');
    }

    if (!process.env['AWS_EC2_TARGET_GROUP_ARN']) {
      throw new Error('AWS_EC2_TARGET_GROUP_ARN not set');
    }

    if (!process.env['AWS_S3_CONFIG_BUCKET']) {
      throw new Error('AWS_S3_CONFIG_BUCKET not set');
    }

    const child = spawn(
      'ecs-cli',
      [
        'compose',
        '--project-name',
        serviceName,
        '--cluster',
        process.env.AWS_ECS_CLUSTER,
        '--task-role-arn',
        process.env.AWS_ECS_TASK_ROLE,
        'service',
        'up',
        '--role',
        process.env.AWS_ECS_SERVICE_ROLE,
        '--target-group-arn',
        process.env.AWS_EC2_TARGET_GROUP_ARN,
        // these must match docker-compose.yml
        '--container-name',
        'app-server',
        '--container-port',
        '3000',
      ],
      {
        env: Object.assign({}, process.env, {
          // Used by docker-compose.yml
          APP_SERVER_IMAGE: image,
          AWS_S3_CONFIG_URL: `s3://${process.env
            .AWS_S3_CONFIG_BUCKET}/${serviceName}`,
          AWS_CLOUDWATCH_LOGS_GROUP: process.env.AWS_CLOUDWATCH_LOGS_GROUP,
          AWS_CLOUDWATCH_LOGS_PREFIX: serviceName,
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
  if (!process.env['AWS_ECS_SERVICE_NAME']) {
    throw new Error(`Missing $AWS_ECS_SERVICE_NAME`);
  }

  const serviceName = process.env['AWS_ECS_SERVICE_NAME'];

  const image = containerImage(serviceName);

  Promise.resolve(true)
    .then(() => buildContainer(image))
    .then(() => pushContainer(image))
    .then(() => deployService(serviceName, image))
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
