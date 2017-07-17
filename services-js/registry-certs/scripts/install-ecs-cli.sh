#!/bin/sh

# This directory is in the Travis $PATH by default, so we use it
# to install to. On container-based infrastructure we can't sudo stuff
# into /usr/local/bin
export BIN_DIR=$HOME/.local/bin

mkdir -p $BIN_DIR
curl -o $BIN_DIR/ecs-cli https://s3.amazonaws.com/amazon-ecs-cli/ecs-cli-linux-amd64-latest
chmod a+x $BIN_DIR/ecs-cli
