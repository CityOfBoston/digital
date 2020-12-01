#!/bin/sh

# Entrypoint downloads our configuration from S3. Our task role is
# authorized to download from this bucket.

set -e

echo "entrypoint.sh: start"

if [ -z "$AWS_S3_CONFIG_URL" ]; then
  echo >&2 'error: missing AWS_S3_CONFIG_URL environment variable'
  exit 1
fi

aws s3 sync $AWS_S3_CONFIG_URL .

echo "entrypoint.sh: command"

exec "$@"
