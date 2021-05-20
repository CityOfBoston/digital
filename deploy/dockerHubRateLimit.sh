#!/bin/bash

# set -e

# export DOCKERHUBCREDS="${DOCKERHUB_USERNAME}:${DOCKERHUB_PASSWORD}"
# AUTHSTRIN="Authorization: Bearer "
# TOKEN=$(curl --user $DOCKERHUBCREDS "https://auth.docker.io/token?service=registry.docker.io&scope=repository:ratelimitpreview/test:pull" | grep -Po '"token": *\K"[^"]*"' | sed -e 's/^"//' -e 's/"$//')
# curl -v -H "Authorization: Bearer $TOKEN" https://registry-1.docker.io/v2/ratelimitpreview/test/manifests/latest 2>&1 | grep RateLimit
