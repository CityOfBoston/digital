/* eslint no-console: 0 */

// Use this script to generate an OAuth access token you can put in your .env
// file to authenticate with Salesforce. You will need your username, password,
// and security token.
//
// Make sure that your .env already has values for:
//  SALESFORCE_HOSTNAME
//  SALESFORCE_CLIENT_KEY
//  SALESFORCE_CLIENT_SECRET

const qs = require('querystring');
const http = require('https');
const prompt = require('prompt');

require('dotenv').config();

const options = {
  method: 'POST',
  hostname: process.env.SALESFORCE_HOSTNAME,
  port: null,
  path: '/services/oauth2/token',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
};

const schema = {
  properties: {
    username: {
      required: true,
    },
    password: {
      hidden: true,
      required: true,
    },
    securityToken: {
      hidden: true,
      required: true,
    },
  },
};

prompt.message = '';
prompt.start();
prompt.get(schema, (err, result) => {
  if (err) {
    throw err;
  }

  const req = http.request(options, (res) => {
    const chunks = [];

    res.on('data', (chunk) => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      const body = Buffer.concat(chunks);
      const json = JSON.parse(body.toString());
      if (json.error_description) {
        console.error(json.error_description);
      } else if (json.access_token) {
        console.log(`Bearer ${json.access_token}`);
      } else {
        console.error(body.toString());
      }
    });
  });

  req.write(qs.stringify({
    grant_type: 'password',
    client_id: process.env.SALESFORCE_CLIENT_KEY,
    client_secret: process.env.SALESFORCE_CLIENT_SECRET,
    username: result.username,
    password: `${result.password}${result.securityToken}`,
  }));
  req.end();
});
