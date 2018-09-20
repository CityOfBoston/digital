import fs from 'fs';
import path from 'path';
import IdentityIq, { LaunchedWorkflowResponse } from './IdentityIq';

export default class IdentityIqFake implements Required<IdentityIq> {
  private loadFixture(name: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, `../../../fixtures/identityiq/${name}.json`),
        'utf-8',
        (err, str) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(str));
          }
        }
      );
    });
  }

  async changePassword(_userId, password): Promise<LaunchedWorkflowResponse> {
    if (password === 'wrong-password') {
      return this.loadFixture('LaunchWorkflow-ChangePassword-failure');
    } else {
      return this.loadFixture('LaunchWorkflow-ChangePassword-success');
    }
  }

  async resetPassword(): Promise<LaunchedWorkflowResponse> {
    return this.loadFixture('LaunchWorkflow-ResetPassword-success');
  }

  async fetchWorkflow(): Promise<LaunchedWorkflowResponse> {
    return this.loadFixture('LaunchWorkflow-ChangePassword-failure');
  }
}
