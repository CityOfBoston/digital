FROM node:14.19.1-alpine as build_phase

ENV WORKSPACE=payment-webhooks

WORKDIR /app

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --no-cache git openssl bash \
  && apk add --update --no-cache python3 curl unzip \
  && ln -sf python3 /usr/bin/python \
  && python3 -m ensurepip \
  && pip3 install --no-cache --upgrade pip setuptools \
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

FROM node:14.19.1-alpine as deploy_phase

ENV WORKSPACE payment-webhooks
ENV NODE_ENV production
ENV USE_SSL 1

WORKDIR /app/services-js/$WORKSPACE

RUN apk add --no-cache git openssl \
  && apk add --update --no-cache python3 curl unzip \
  && ln -sf python3 /usr/bin/python \
  && python3 -m ensurepip \
  && pip3 install --no-cache --upgrade pip setuptools \
  && cd /tmp \
  && curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" \
  && unzip awscli-bundle.zip \
  && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws \
  && rm awscli-bundle.zip \
  && rm -rf awscli-bundle

COPY --from=build_phase /app /app

# Gets our root enterprise cert into the OS. Needed to securely talk to .cob
# servers.
RUN mkdir -m 755 -p /usr/local/share/ca-certificates
ADD https://raw.githubusercontent.com/CityOfBoston/devops-public/master/ca-certificates/CityOfBoston-Enterprise-Root-CA.crt /usr/local/share/ca-certificates/
RUN chmod 644 /usr/local/share/ca-certificates/* && update-ca-certificates 

# Tells Node to use the OS for trusted certificates
ENV NODE_OPTIONS=--use-openssl-ca

EXPOSE 3000

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
CMD ["yarn", "start"]