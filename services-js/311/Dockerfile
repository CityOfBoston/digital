FROM node:8-alpine

WORKDIR /app

# Install the AWS CLI
RUN apk add --update python python-dev curl unzip git \
  && cd /tmp \
  && curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" \
  && unzip awscli-bundle.zip \
  && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws \
  && rm awscli-bundle.zip \
  && rm -rf awscli-bundle

# Yes. I know. https://github.com/npm/npm/issues/16807
RUN yarn global add npm@5.6.0 && npm version

# By just bringing these in first, we can re-use the npm install layer when the
# package.json and npm-shrinkwrap haven't changed, speeding up recompilation.
ADD package.json npm-shrinkwrap.json /app/
RUN npm install --loglevel warn

ADD . /app
RUN npm run-script build
RUN chmod a+x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]
