FROM node:14.19.1-alpine

ENV WORKSPACE=311-indexer

WORKDIR /app

# Install the AWS CLI
RUN apk add --update python python-dev curl unzip git \
  && cd /tmp \
  && curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" \
  && unzip awscli-bundle.zip \
  && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws \
  && rm awscli-bundle.zip \
  && rm -rf awscli-bundle

# Need to upgrade yarn to at least 1.6
RUN yarn global add yarn@^1.6.0

# This is the tar'd up collection of package.json files created by
# build-service-container.sh. Working with it and the lockfiles means we can
# cache the yarn install across builds when there are no dependency changes.
ADD package-json.tar /app/
ADD yarn.lock lerna.json .yarnrc /app/

# We don’t run the scripts because they will try to build our custom packages,
# which will fail because we don’t have the source code at this point.
#
# TODO(finh): Scope this down to $WORKSPACE when yarn has that capability.
RUN yarn install --frozen-lockfile --ignore-scripts

ADD . /app/

RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare 
RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare-deploy 


ENV NODE_ENV production

WORKDIR /app/services-js/$WORKSPACE

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
CMD ["yarn", "start"]
