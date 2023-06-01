# syntax=docker/dockerfile:1
FROM node:14.19.1-alpine as build_phase

ENV WORKSPACE=registry-certs
ENV NODE_ENV development

WORKDIR /app

#ENV PYTHONUNBUFFERED=1
RUN apk add --no-cache git openssl

# To prevent “Error: could not get uid/gid”
RUN npm config set unsafe-perm true

# Need to upgrade yarn to at least 1.6
RUN yarn global add yarn@^1.6.0

ADD . /app/

# This is the tar'd up collection of package.json files created by
# build-service-container.sh. Working with it and the lockfiles means we can
# cache the yarn install across builds when there are no dependency changes.
#ADD package-json.tar /app/
#ADD yarn.lock lerna.json .yarnrc /app/

RUN yarn install

# This is the time consuming step +/-300secs
WORKDIR /app/services-js/$WORKSPACE
RUN yarn install --ignore-scripts

# syntax=docker/dockerfile:1
FROM node:14.19.1-alpine as deploy_phase

ENV WORKSPACE registry-certs
ENV NODE_ENV development
ENV USE_SSL 1

COPY --from=build_phase /app /app

ENV PYTHONUNBUFFERED=1
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

WORKDIR /app/services-js/${WORKSPACE}
RUN yarn run build

#ADD ./.aws /root/.aws
RUN --mount=type=secret,id=aws,target=/root/.aws/credentials \
  BUILD_ID=$(cat /app/services-js/registry-certs/build/.next/BUILD_ID) && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/${BUILD_ID} s3://cob-digital-apps-staging-static/registry-certs/_next/static/${BUILD_ID}/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/chunks s3://cob-digital-apps-staging-static/registry-certs/_next/static/chunks/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/runtime s3://cob-digital-apps-staging-static/registry-certs/_next/static/runtime/ || \
    echo "OOPS"
#RUN rm -rf /root/.aws

EXPOSE 3000

ENV NODE_ENV production

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
CMD ["yarn", "start"]
