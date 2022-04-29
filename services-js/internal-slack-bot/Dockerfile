FROM node:14.19.1-alpine

ENV WORKSPACE=internal-slack-bot

WORKDIR /app

RUN apk add --no-cache git openssl

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# Install the AWS CLI
RUN apk add --update curl unzip git \
  && cd /tmp \
  && curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" \
  && unzip awscli-bundle.zip \
  && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws \
  && rm awscli-bundle.zip \
  && rm -rf awscli-bundle

# Need to upgrade yarn to at least 1.6
RUN yarn global add yarn@^1.6.0

# Gets our root enterprise cert into the OS. Needed to securely talk to .cob
# servers.
RUN mkdir -m 755 -p /usr/local/share/ca-certificates
ADD https://raw.githubusercontent.com/CityOfBoston/devops-public/master/ca-certificates/CityOfBoston-Enterprise-Root-CA.crt /usr/local/share/ca-certificates/
RUN chmod 644 /usr/local/share/ca-certificates/* && update-ca-certificates 

# Tells Node to use the OS for trusted certificates
ENV NODE_OPTIONS=--use-openssl-ca

# This is the tar'd up collection of package.json files created by
# build-service-container.sh. Working with it and the lockfiles means we can
# cache the yarn install across builds when there are no dependency changes.
ADD package-json.tar /app/
ADD yarn.lock lerna.json .yarnrc /app/

# We don't run the scripts because they will try to build our custom packages,
# which will fail because we don't have the source code at this point.
#
# TODO(finh): Scope this down to $WORKSPACE when yarn has that capability.
RUN yarn install --frozen-lockfile --ignore-scripts

ADD . /app/

RUN /app/scripts/generate-ssl-key.sh /app/services-js/$WORKSPACE

RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare 
RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare-deploy 

EXPOSE 3000
ENV NODE_ENV production
ENV USE_SSL 1

WORKDIR /app/services-js/$WORKSPACE

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
CMD ["yarn", "start"]