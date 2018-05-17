#!/bin/bash

# USAGE: Dockerfile
#
# Expects CONTAINER_TAG and SERVICE_NAME environment variables.

set -e

DOCKERFILE=$1
FROM_IMAGE=`sed -n 's/FROM \(.*\)/\1/p' $DOCKERFILE`

`aws ecr get-login --no-include-email`

ACCOUNT_ID=`aws sts get-caller-identity | jq '.["Account"]' -r -`
REPOSITORY_NAME=$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cob-digital-apps-prod/$SERVICE_NAME

# We pull the FROM image specifically so that we get any OS / environment
# updates.
docker pull $FROM_IMAGE

# We get the last latest to possibly allow caching of the expensive layers (like
# npm install)
docker pull $REPOSITORY_NAME:latest || echo "No latest image to use as cache. Continuing without."

./deploy/prebuild-service-container.sh

docker build \
  --file $DOCKERFILE \
  --tag "$REPOSITORY_NAME:latest" \
  --tag "$REPOSITORY_NAME:$CONTAINER_TAG" \
  --cache-from "${REPOSITORY_NAME}:latest" \
  .

docker push $REPOSITORY_NAME:latest
docker push $REPOSITORY_NAME:$CONTAINER_TAG

# TODO(finh): Slack notification
echo "DEPLOYED $SERVICE_NAME to $CONTAINER_TAG"
