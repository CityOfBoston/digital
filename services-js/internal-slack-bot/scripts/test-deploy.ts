/* eslint no-console: 0 */
require('dotenv');

import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

(async function() {
  const body = new URLSearchParams({
    environment: 'production',
    commit: 'c0d753e5bb4428cf69770b59c1281fca88e96e5b',
  });

  body.append('service', 'test-service');
  body.append('service', 'other-service');

  await fetch(
    `http://localhost:${process.env.PORT || 8000}/internal-slack/deploy`,
    {
      method: 'POST',
      body,
    }
  );
})().catch(e => {
  console.error(e);
  process.exit(-1);
});
