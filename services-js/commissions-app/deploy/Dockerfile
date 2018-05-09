FROM node:8-alpine

ENV WORKSPACE=commissions-app

WORKDIR /app

RUN apk add --no-cache git openssl 

# Need to upgrade yarn to at least 1.6
RUN yarn global add yarn@^1.6.0

ADD . /app/

RUN ./scripts/generate-ssl-key.sh /app/services-js/$WORKSPACE

# This command filters the package.json’s workspace definition down just to
# $WORKSPACE and its transitive dependencies. The first yarn install will cause
# the prepare scripts to run, which will build the packages. We need dev
# dependencies for this to work. The second yarn install, with production=true,
# will effectively remove the dev dependencies from node_modules, which keeps
# the layer size smaller. Since our packages are already installed, it won’t
# call "prepare" on them a second time (which would fail without the dev
# dependencies.)
RUN node ./scripts/filter-package-workspaces.js $WORKSPACE > filtered-package.json \
  && mv -f filtered-package.json package.json \
  && yarn install --production=false \
  && yarn install --production=true

EXPOSE 3000

ENV NODE_ENV production
ENV USE_SSL 1

CMD ["yarn", "--cwd=/app/services-js/commissions-app", "start"]
