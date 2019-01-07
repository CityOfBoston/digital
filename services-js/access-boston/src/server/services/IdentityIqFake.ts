import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import IdentityIq, { LaunchedWorkflowResponse } from './IdentityIq';

const readFile = promisify(fs.readFile);

export default class IdentityIqFake implements Required<IdentityIq> {
  private async loadFixture(name: string): Promise<any> {
    return JSON.parse(
      await readFile(
        path.join(__dirname, `../../../fixtures/identityiq/${name}.json`),
        'utf-8'
      )
    );
  }

  async changePassword(_userId, password): Promise<LaunchedWorkflowResponse> {
    if (password === 'wrong-password') {
      return this.loadFixture('LaunchWorkflow-ChangePassword-failure');
    } else {
      return this.loadFixture('LaunchWorkflow-ChangePassword-success');
    }
  }

  async updateUserRegistration(): Promise<any> {}

  async resetPassword(
    _userId,
    _password,
    token
  ): Promise<LaunchedWorkflowResponse> {
    if (!token) {
      throw new Error('Reset password token was not provided');
    }

    return this.loadFixture('LaunchWorkflow-ResetPassword-success');
  }

  async fetchWorkflow(): Promise<LaunchedWorkflowResponse> {
    return this.loadFixture('LaunchWorkflow-ChangePassword-failure');
  }
}
