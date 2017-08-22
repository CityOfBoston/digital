#!/bin/bash

# USAGE: ClusterStack, AppStack, RepositoryName, DesiredCount

CLUSTER_STACK=$1
APP_STACK=$2
REPOSITORY_NAME=$3
DESIRED_COUNT=$4

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
docker pull $REPOSITORY_NAME:latest || echo "No latest image to use as cache. Continuing without."

docker build \
  --tag "$REPOSITORY_NAME:latest" \
  --tag "$REPOSITORY_NAME:$TAG" \
  --cache-from "${REPOSITORY_NAME}:latest" \
  .

docker push $REPOSITORY_NAME:latest
docker push $REPOSITORY_NAME:$TAG

aws s3 cp $DEPLOY_TEMPLATE_S3_URI deploy.yml

# Add this to prevent execution
# --no-execute-changeset \

aws cloudformation deploy \
  --template-file deploy.yml \
  --stack-name "${APP_STACK}-Deploy" \
  --parameter-overrides \
    ClusterStack=$CLUSTER_STACK \
    AppStack=$APP_STACK \
    RepositoryName=$REPOSITORY_NAME \
    DesiredCount=$DESIRED_COUNT \
    Tag=$TAG \
    GitBranch=$TRAVIS_BRANCH \
    GitRevision=$TRAVIS_COMMIT 
