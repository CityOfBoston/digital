/* eslint no-console: 0 */
require('dotenv').config();

import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

(async function() {
  const body = new URLSearchParams({
    environment: 'production',
    commit: '3bcbcc6776b49ae7646e1d4e8df3ebbdd1d2e041',
  });

  body.append('service', 'test-service');
  body.append('service', 'other-service');

  const res = await fetch(
    `http://localhost:${process.env.PORT || 8000}/internal-slack/deploy`,
    {
      method: 'POST',
      body,
      headers: {
        'X-API-KEY': (process.env.API_KEYS || '').split(',')[0],
      },
    }
  );

  if (!res.ok) {
    throw new Error(`POST failed: ${await res.text()}`);
  }
})().catch(e => {
  console.error(e);
  process.exit(-1);
});
