// @flow
/* eslint no-console: 0 */

import type { Request, Reply } from 'hapi';
import type INovah from './services/iNovah';

export type Dependencies = {|
  inovah: INovah,
|};

export default function makeStripe() {
  return (request: Request, reply: Reply) => {
    const { payload } = request;

    console.log(JSON.stringify(payload, null, 2));

    reply().code(200);
  };
}
