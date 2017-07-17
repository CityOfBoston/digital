FROM node:8.1.4

WORKDIR /app

# By just bringing these in first, we can re-use the npm install layer when the
# package.json and npm-shrinkwrap haven't changed, speeding up recompilation.
ADD package.json npm-shrinkwrap.json /app/
RUN npm install --loglevel warn

ADD . /app
RUN npm run-script build

EXPOSE 3000

CMD npm start
