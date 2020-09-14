#!/bin/sh

set -e

FILENAME_BASE=${2:-server}
SSL_KEY_PASSWORD="${AWS_CODEBUILD_SSL_KEYGEN_PASS}"
SSL_PASS=$(openssl rand -base64 14)

cd $1

echo "FILE: generate-ssl-key.sh"
echo "ECHO PASS Next?"

if [ -z "$SSL_KEY_PASS" ]; then
  echo "SSL_KEY_PASS PRESENT: ${SSL_KEY_PASS}"
fi

if [ -z "$AWS_CODEBUILD_SSL_KEYGEN_PASS" ]; then
  echo "AWS_CODEBUILD_SSL_KEYGEN_PASS: [${AWS_CODEBUILD_SSL_KEYGEN_PASS}]"
fi

echo "SSL_KEY_PASSWORD: [${SSL_KEY_PASSWORD}]"
echo "SSL_KEYGEN_PASS: [${SSL_KEYGEN_PASS}]"
echo "AWS_CODEBUILD_SSL_KEYGEN_PASS: [${AWS_CODEBUILD_SSL_KEYGEN_PASS}]"
echo $SSL_KEYGEN_PASS
echo $AWS_CODEBUILD_SSL_KEYGEN_PASS
echo ${env}

echo $SSL_PASS | openssl genrsa -des3 -passout stdin -out "${FILENAME_BASE}.pass.key" 2048
echo $SSL_PASS | openssl rsa -passin stdin -in "${FILENAME_BASE}.pass.key" -out "${FILENAME_BASE}.key"
rm "${FILENAME_BASE}.pass.key"
openssl req -new -key "${FILENAME_BASE}.key" -out "${FILENAME_BASE}.csr" \
  -subj "/C=US/ST=Massachusetts/L=Boston/O=Department of Innovation and Technology/OU=Digital/CN=${WORKSPACE:-default}"
openssl x509 -req -days 365 -in "${FILENAME_BASE}.csr" -signkey "${FILENAME_BASE}.key" -out "${FILENAME_BASE}.crt"
rm "${FILENAME_BASE}.csr"
