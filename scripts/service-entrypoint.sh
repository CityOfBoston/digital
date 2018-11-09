#!/bin/sh

# Entrypoint downloads our configuration from S3. Our task role is
# authorized to download from this bucket.

set -e

echo "entrypoint.sh: start"

if [ -z "$AWS_S3_CONFIG_URL" ]; then
  echo >&2 'error: missing AWS_S3_CONFIG_URL environment variable'
else
  aws s3 sync $AWS_S3_CONFIG_URL .
  if [ -z "$DEPLOY_VARIANT" ]; then
    echo >&2 'DEPLOY_VARIANT not set'
  else
    echo >&2 "syncing $AWS_S3_CONFIG_URL/$DEPLOY_VARIANT"
    aws s3 sync "$AWS_S3_CONFIG_URL/$DEPLOY_VARIANT" .
  fi
fi

# Useful for debugging the AWS syncs
ls

# If we installed any SSH keys, install them to where they’ll be found.
if [ -e id_rsa ]; then
  mkdir -p /root/.ssh
  chmod 700 /root/.ssh

  cp id_rsa* /root/.ssh

  chmod 644 /root/.ssh/id_rsa.pub
  chmod 600 /root/.ssh/id_rsa
fi

echo "entrypoint.sh: command"

exec "$@"
