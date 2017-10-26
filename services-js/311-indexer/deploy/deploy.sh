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

echo "StackName='${APP_STACK}-Deploy'" >> deploy-message.txt
echo "LogicalResourceId='${APP_STACK}-Deploy'" >> deploy-message.txt
echo "ResourceStatus='CHANGE_SET_CREATE'" >> deploy-message.txt
echo "ChangeSetName='${TRAVIS_BRANCH}-${TAG}'" >> deploy-message.txt
echo "ChangeSetProperties='" >> deploy-message.txt

aws cloudformation create-change-set \
  --stack-name "${APP_STACK}-Deploy" \
  --template-url "${DEPLOY_TEMPLATE_S3_HTTPS}" \
  --change-set-name "${TRAVIS_BRANCH}-${TAG}" \
  --parameters \
    ParameterKey=ClusterStack,ParameterValue=$CLUSTER_STACK \
    ParameterKey=AppStack,ParameterValue=$APP_STACK \
    ParameterKey=RepositoryName,ParameterValue=$REPOSITORY_NAME \
    ParameterKey=DesiredCount,ParameterValue=$DESIRED_COUNT \
    ParameterKey=Tag,ParameterValue=$TAG \
    ParameterKey=GitBranch,ParameterValue=$TRAVIS_BRANCH \
    ParameterKey=GitRevision,ParameterValue=$TRAVIS_COMMIT \
  --notification-arns "${DEPLOY_NOTIFICATION_ARN}" >> deploy-message.txt

echo "'" >> deploy-message.txt

cat deploy-message.txt

aws sns publish --message file://deploy-message.txt --topic "${DEPLOY_NOTIFICATION_ARN}"
