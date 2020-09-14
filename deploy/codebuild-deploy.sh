#!/bin/bash

set -e

export DEPLOY_BRANCH="${CODEBUILD_SOURCE_VERSION}"

# This should run on branches named "production/X" where "X" is the name of a 
# service package of ours recognized by Lerna.
[[ $DEPLOY_BRANCH =~ ^(production|staging)/([^/@]+) ]] || exit -1

export SERVICE_NAME="${BASH_REMATCH[2]}"

# We use npm rather than installing yarn when deploying, since the real work is
# done inside building the container.
#
# The "*" in the scope is there to handle that package names are prefixed with
# their directory so we can filter them with Lerna.
npx lerna run --npm-client npm --stream --scope "*.$SERVICE_NAME" codebuild-deploy
