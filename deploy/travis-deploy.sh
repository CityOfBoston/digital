#!/bin/bash

set -e

# This should run on branches named "production-X" where "X" is the name of a 
# service package of ours recognized by Lerna.
[[ $TRAVIS_BRANCH =~ ^(production|staging)/([^/@]+) ]] || exit -1

export SERVICE_NAME="${BASH_REMATCH[2]}"

npx lerna run --stream --scope $SERVICE_NAME travis-deploy
