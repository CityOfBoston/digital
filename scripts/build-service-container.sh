#!/bin/bash

set -e

docker build -f services-js/$SERVICE_NAME/deploy/Dockerfile -t $TAG_NAME .
