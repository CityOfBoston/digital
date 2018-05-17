#!/bin/bash

set -e

# This should run on branches named "production-X" where "X" is the name of a 
# service package of ours recognized by Lerna.
[[ $TRAVIS_BRANCH =~ ^production-(.+) ]] || exit -1

export SERVICE_NAME="${BASH_REMATCH[1]}"

# We use the Travis build number to make something that increments, and then a
# bit of the commit SHA to identify the code.
export CONTAINER_TAG="prod-${TRAVIS_BUILD_NUMBER}-${TRAVIS_COMMIT:0:8}"

npx lerna@^3.0.0-beta.18 run --stream --scope $SERVICE_NAME predeploy
