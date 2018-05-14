#!/bin/sh

set -e

# We make a tar of just the package.json files in the repo. This will let us do
# a yarn install based on those, which will then be mostly cached across builds
# (since package.jsons don’t change very often).
#
# Doing this with a tar is because Docker doesn’t have a native way to COPY in a
# filtered subtree of files. (Glob patterns cause all the files end up in the
# destination directory, not their subdirectories.)
find . -name 'package.json' -not -path "*/node_modules/*" -print0 | tar -cvf package-json.tar --null -T -

docker build -f services-js/$SERVICE_NAME/deploy/Dockerfile -t $TAG_NAME .
