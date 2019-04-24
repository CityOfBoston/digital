#!/bin/bash

# Source this file in before_install to set the $HAS_ environment variables. We
# do this in before_install rather than in env because env runs before the cache
# is restored, and we’d really like to re-use it.
#
# Expects lerna to be installed and $LERNA_SINCE to be defined.

export HAS_JS_CHANGES=$(
  if lerna la --since=$LERNA_SINCE --scope="@cityofboston/*" --scope="services-js.*" &>/dev/null;
  then echo 1;
fi)

export HAS_TEMPLATE_CHANGES=$(
  if lerna la --since=$LERNA_SINCE --scope="templates.*" &>/dev/null;
  then echo 1;
fi)

export HAS_RUBY_CHANGES=$(
  if lerna la --since=$LERNA_SINCE --scope="services-ruby.*" &>/dev/null;
  then echo 1;
fi)
