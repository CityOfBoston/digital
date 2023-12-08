# syntax=docker/dockerfile:1
FROM node:14.19.1-alpine as build_phase

ENV WORKSPACE=registry-certs
ENV NODE_ENV development

WORKDIR /app

#ENV PYTHONUNBUFFERED=1
# RUN apk add --no-cache git openssl
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

# To prevent “Error: could not get uid/gid”
RUN npm config set unsafe-perm true

# Need to upgrade yarn to at least 1.6
RUN yarn global add yarn@^1.22.19

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
RUN yarn global add yarn@^1.22.19
RUN yarn run build

#ADD ./.aws /root/.aws
RUN --mount=type=secret,id=aws,target=/root/.aws/credentials \
  BUILD_ID=$(cat /app/services-js/registry-certs/build/.next/BUILD_ID) && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/${BUILD_ID} s3://cob-digital-apps-staging-static/registry-certs/_next/static/${BUILD_ID}/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/chunks s3://cob-digital-apps-staging-static/registry-certs/_next/static/chunks/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/runtime s3://cob-digital-apps-staging-static/registry-certs/_next/static/runtime/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/${BUILD_ID} s3://cob-digital-apps-prod-static/registry-certs/_next/static/${BUILD_ID}/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/chunks s3://cob-digital-apps-prod-static/registry-certs/_next/static/chunks/ && \
  aws s3 cp --recursive --acl public-read /app/services-js/registry-certs/build/.next/static/runtime s3://cob-digital-apps-prod-static/registry-certs/_next/static/runtime/ || \
    echo "OOPS"
#RUN rm -rf /root/.aws

EXPOSE 3000

ENV NODE_ENV production

ENTRYPOINT ["/app/scripts/service-entrypoint.sh"]
CMD ["yarn", "start"]

###################################
# NOTES:
#   To use this file:
#       [a] clone the digital repo
#       [b] from a terminal, in the registry-certs folder, run
#           DOCKER_BUILDKIT=1 docker build --pull --cache-from local-dev/registry-certs:latest -f ./Dockerfile -t local-dev/registry-certs:latest --secret id=aws,src=$HOME/.aws/credentials --platform linux/arm64 ../..
#           -> this will create an image tagged local-dev/registry-certs:latest on the local machine
#       [c] from a terminal, in the registry-certs folder, run
#           docker-compose up --no-build -d registry-certs
#           -> this will create a container which should start on your local machine, with your cloned repo mounted into
#               so that your changes are immediately effective in the browser.
#           -> you should be able to see the webapp at https://127.0.0.1:300/marriageintention ..etc
#       [d] In a terminal app, open a session in the container by running:
#           docker exec -it registry-certs /bin/sh
#           -> This has effectively ssh'd you into the container as the defaul (root) user.
#       [e] In the container session, you can start the yarn watcher
#           yarn dev
#           -> this will watch the /app folder (which is a mounted copy from your local computer) and recompile as changes
#               are made.  Thus, you can code and test simultaneously (slight delay as the rebuilds occur)
#   WHEN YOU ARE READY TO DEPLOY TO STAGE:
#       [1] Check your code into github
#       [2] Close down any shells into the container and stop the container:
#           docker stop registry-certs
#       [2.5] Re-login into ECR with this command --> aws ecr get-login-password --region us-east-1 --profile=cityofboston | docker login --username AWS --password-stdin 251803681989.dkr.ecr.us-east-1.amazonaws.com
#       [3] Rebuild the container and apps by running:
#           DOCKER_BUILDKIT=1 docker build --pull --cache-from local-dev/registry-certs:latest -f ./Dockerfile -t 251803681989.dkr.ecr.us-east-1.amazonaws.com/cob-digital-apps-staging/registry-certs:deploy-new-stage --secret id=aws,src=$HOME/.aws/credentials --platform linux/amd64 ../..
#           -> this is essentially the same command as in [b] above, just uses a different tag and ensures the /app folder
#              is physically there and not mounted (using the docker-compose command in [c] above mounts the repo over
#              whatever was added into the the image's /app folder during the docker build command)
#       [4] Push the image to AWS by running
#           docker push 251803681989.dkr.ecr.us-east-1.amazonaws.com/cob-digital-apps-staging/registry-certs:deploy-new-stage
#           -> the deploy should start once the image is transferred/uploaded
#
#   WHEN YOU ARE READY TO DEPLOY TO PROD:
#       [1] Tag the image you pushed to stage with a production tag:
#           docker tag 251803681989.dkr.ecr.us-east-1.amazonaws.com/cob-digital-apps-staging/registry-certs:deploy-new-stage 251803681989.dkr.ecr.us-east-1.amazonaws.com/cob-digital-apps-prod/registry-certs:deploy-new-prod
#       [2] Push the image to AWS by running
#           docker push 251803681989.dkr.ecr.us-east-1.amazonaws.com/cob-digital-apps-prod/registry-certs:deploy-new-prod
#           -> the deploy should start once the image is transferred/uploaded