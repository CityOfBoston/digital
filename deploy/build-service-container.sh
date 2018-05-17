#!/bin/sh

set -e

./deploy/prebuild-service-container.sh
docker build -f services-js/$SERVICE_NAME/deploy/Dockerfile -t $TAG_NAME .
