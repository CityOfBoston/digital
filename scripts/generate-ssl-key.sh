#!/bin/sh

set -e

FILENAME_BASE=${2:-server}

cd $1

openssl genrsa -des3 -passout pass:swordfish -out "${FILENAME_BASE}.pass.key" 2048
openssl rsa -passin pass:swordfish -in "${FILENAME_BASE}.pass.key" -out "${FILENAME_BASE}.key"
rm "${FILENAME_BASE}.pass.key"
openssl req -new -key "${FILENAME_BASE}.key" -out "${FILENAME_BASE}.csr" \
  -subj "/C=US/ST=Massachusetts/L=Boston/O=Department of Innovation and Technology/OU=Digital/CN=${WORKSPACE:-default}"
openssl x509 -req -days 365 -in "${FILENAME_BASE}.csr" -signkey "${FILENAME_BASE}.key" -out "${FILENAME_BASE}.crt"
rm "${FILENAME_BASE}.csr"
