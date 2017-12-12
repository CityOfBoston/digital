FROM node:8-alpine

WORKDIR /app

# Install the AWS CLI
RUN apk add --update python python-dev curl unzip \
  && cd /tmp \
  && curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip" \
  && unzip awscli-bundle.zip \
  && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws \
  && rm awscli-bundle.zip \
  && rm -rf awscli-bundle

# By just bringing these in first, we can re-use the npm install layer when the
# package.json and npm-shrinkwrap haven't changed, speeding up recompilation.
ADD package.json npm-shrinkwrap.json /app/
RUN npm install --loglevel warn

ADD . /app
RUN npm run-script build
RUN chmod a+x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

# We run node manually rather than go through npm because npm eats signals and
# exit codes in a not-useful way.
CMD ["node", "./build/server"]
