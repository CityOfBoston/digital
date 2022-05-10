import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
// import IdVerification from './IdVerification';

const readFile = promisify(fs.readFile);

export default class IdVerificationFake {
  async loadFixture(filename: string, env: string): Promise<any> {
    return JSON.parse(
      await readFile(
        path.join(
          __dirname,
          `../../../fixtures/id-verification/${env}/${filename}.json`
        ),
        'utf-8'
      )
    );
  }
}
