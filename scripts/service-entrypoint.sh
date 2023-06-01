#!/bin/sh

# Entrypoint downloads our configuration from S3. Our task role is
# authorized to download from this bucket.

set -e

echo "entrypoint.sh: start"

if [ -z "$AWS_S3_CONFIG_URL" ]; then
  echo >&2 'error: missing AWS_S3_CONFIG_URL environment variable'
else
  echo "TESTING > service-entrypoint.sh"
   aws s3 sync $AWS_S3_CONFIG_URL .
   if [ -z "$DEPLOY_VARIANT" ]; then
     echo >&2 'DEPLOY_VARIANT not set'
   else
     echo >&2 "syncing $AWS_S3_CONFIG_URL/$DEPLOY_VARIANT"
     aws s3 sync "$AWS_S3_CONFIG_URL/$DEPLOY_VARIANT" .
   fi
fi

echo "entrypoint.sh: command"

exec "$@"
