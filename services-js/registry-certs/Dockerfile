FROM node:14.19.1-alpine as build_phase

ENV WORKSPACE=registry-certs
ENV NODE_ENV development

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

# To prevent “Error: could not get uid/gid”
RUN npm config set unsafe-perm true

# Need to upgrade yarn to at least 1.6
RUN yarn global add yarn@^1.6.0

# This is the tar'd up collection of package.json files created by
# build-service-container.sh. Working with it and the lockfiles means we can
# cache the yarn install across builds when there are no dependency changes.
# ADD package-json.tar /app/
# ADD yarn.lock lerna.json .yarnrc /app/

# We don’t run the scripts because they will try to build our custom packages,
# which will fail because we don’t have the source code at this point.
#
# TODO(finh): Scope this down to $WORKSPACE when yarn has that capability.
# RUN yarn install --frozen-lockfile --ignore-scripts
ADD . /app/
# TODO: Copy ./next files to S3 || think of a better way to do this :shrug
ADD ./.aws /root/.aws
ADD ./scripts/service-entrypoint.sh /app/scripts/

RUN aws s3 cp s3://cob-digital-apps-staging-config/registry-certs/.env . && \
aws s3 cp s3://cob-digital-apps-staging-config/registry-certs/server.key . && \
aws s3 cp s3://cob-digital-apps-staging-config/registry-certs/server.crt .

RUN cd /app/services-js/$WORKSPACE && \
    yarn install --ignore-scripts  #--frozen-lockfile

RUN cd /app && \
    yarn install

RUN cd /app/services-js/$WORKSPACE && \
  yarn run build

RUN BUILD_ID=$(cat /app/services-js/registry-certs/build/.next/BUILD_ID) && \
aws s3 cp --recursive /app/services-js/registry-certs/build/.next/static/${BUILD_ID} s3://cob-digital-apps-staging-static/registry-certs/_next/static/

ENV BUILD_ID $BUILD_ID
RUN echo $BUILD_ID

#WORKDIR /app/services-js/$WORKSPACE

#RUN rm -rf /app/yarn.lock && rm -rf /app/services-js/$WORKSPACE/yarn.lock

# RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare 
# RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare-deploy 

FROM node:14.19.1-alpine as deploy_phase

ENV WORKSPACE registry-certs
ENV NODE_ENV production
#ENV USE_SSL 1

COPY --from=build_phase /app /app

WORKDIR /app/services-js/$WORKSPACE
# RUN yarn run build

# RUN apk add --no-cache git openssl \
#   && apk add --update --no-cache python3 curl unzip \
#   && ln -sf python3 /usr/bin/python \
#   && python3 -m ensurepip \
#   && pip3 install --no-cache --upgrade pip setuptools \
#   && cd /tmp \
#   && curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" \
#   && unzip awscli-bundle.zip \
#   && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws \
#   && rm awscli-bundle.zip \
#   && rm -rf awscli-bundle

EXPOSE 3000

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
# ENTRYPOINT ["service-entrypoint.sh"]
CMD ["yarn", "start"]
