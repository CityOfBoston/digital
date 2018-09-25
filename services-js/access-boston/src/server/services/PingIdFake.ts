import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import PingId, { UserDetails, ErrorId } from './PingId';

const readFile = promisify(fs.readFile);

export default class PingIdFake implements Required<PingId> {
  private async loadFixture(name: string): Promise<any> {
    return JSON.parse(
      await readFile(
        path.join(__dirname, `../../../fixtures/pingid/${name}.json`),
        'utf-8'
      )
    );
  }

  async addUser() {
    return (await this.loadFixture('adduser')).responseBody;
  }

  async getUserDetails(userId: string): Promise<UserDetails | null> {
    if (userId.startsWith('NEW')) {
      return null;
    } else {
      return (await this.loadFixture('getuserdetails-exists')).responseBody
        .userDetails;
    }
  }

  async startPairing(): Promise<string> {
    return 'oacts_rxodmgpbVkjVltIBVP7C7m6y6ddsOY-a8BYqpDHHxZY';
  }

  async finalizePairing(
    _sessionId,
    otp
  ): Promise<true | ErrorId.WRONG_PASSWORD> {
    if (otp === '999999') {
      return ErrorId.WRONG_PASSWORD;
    } else {
      return true;
    }
  }
}
