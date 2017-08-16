#!/bin/bash

set -e

`aws ecr get-login --no-include-email`

# We use the Travis build number to make something that increments, and then a
# bit of the commit SHA to identify the code.
TAG="${TRAVIS_BUILD_NUMBER}-${TRAVIS_COMMIT:0:8}"

# We pull the FROM image specifically so that we get any OS / environment
# updates.
FROM_IMAGE=`sed -n 's/FROM \(.*\)/\1/p' Dockerfile`
docker pull $FROM_IMAGE

# We get the last latest to possibly allow caching of the expensive layers (like
# npm install)
docker pull $DEPLOY_REPOSITORY_NAME:latest || echo "No latest image to use as cache. Continuing without."


docker build \
  --tag "$DEPLOY_REPOSITORY_NAME:latest" \
  --tag "$DEPLOY_REPOSITORY_NAME:$TAG" \
  --cache-from "${DEPLOY_REPOSITORY_NAME}:latest" \
  .

docker push $DEPLOY_REPOSITORY_NAME:latest
docker push $DEPLOY_REPOSITORY_NAME:$TAG

aws cloudformation deploy \
  --template-file cloudformation/deploy.yml \
  --stack-name "${DEPLOY_APP_STACK}-Deploy" \
  --parameter-overrides \
    ClusterStack=$DEPLOY_CLUSTER_STACK \
    AppStack=$DEPLOY_APP_STACK \
    RepositoryName=$DEPLOY_REPOSITORY_NAME \
    Tag=$TAG \
    GitBranch=$TRAVIS_BRANCH \
    GitRevision=$TRAVIS_COMMIT 
