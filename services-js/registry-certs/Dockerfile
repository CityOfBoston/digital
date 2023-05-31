FROM node:14.19.1-alpine as build_phase

ENV WORKSPACE=registry-certs
ENV NODE_ENV production

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

ADD . /app/

ADD ./.aws /root/.aws
ADD ./scripts/service-entrypoint.sh /app/scripts/

# I think we can do this in the second container?
RUN aws s3 cp s3://cob-digital-apps-staging-config/registry-certs/.env /app/services-js/$WORKSPACE && \
  aws s3 cp s3://cob-digital-apps-staging-config/registry-certs/server.key /app/services-js/$WORKSPACE && \
  aws s3 cp s3://cob-digital-apps-staging-config/registry-certs/server.crt /app/services-js/$WORKSPACE

# This is the time consuming step +/-300secs
RUN cd /app/services-js/$WORKSPACE && \
    yarn install --ignore-scripts  #--frozen-lockfile

RUN cd /app && \
    yarn install

#RUN rm -rf /app/yarn.lock && rm -rf /app/services-js/$WORKSPACE/yarn.lock

# RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare 
# RUN npx lerna run --stream --include-filtered-dependencies --scope services-js.$WORKSPACE prepare-deploy 

FROM node:14.19.1-alpine as deploy_phase

ENV WORKSPACE registry-certs
ENV NODE_ENV production
ENV USE_SSL 1

COPY --from=build_phase /app /app
COPY --from=build_phase /root/.aws /root/.aws

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

RUN BUILD_ID=$(cat /app/services-js/registry-certs/build/.next/BUILD_ID) && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/${BUILD_ID} s3://cob-digital-apps-staging-static/registry-certs/_next/static/${BUILD_ID}/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/chunks s3://cob-digital-apps-staging-static/registry-certs/_next/static/chunks/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/runtime s3://cob-digital-apps-staging-static/registry-certs/_next/static/runtime/ || \
    echo "OOPS"

EXPOSE 3000

RUN rm -rf /root/.aws

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
CMD ["yarn", "start"]
