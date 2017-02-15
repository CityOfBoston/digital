#!/bin/bash

pushd `dirname "${BASH_SOURCE}"`/..

NODE_ENV=production

rm -rf build
rm -rf .next

yarn babel -- --ignore __mocks__ --ignore *.test.js -d ./build/server server
yarn babel -- --ignore __mocks__ --ignore *.test.js -d ./build/store store
yarn next build
