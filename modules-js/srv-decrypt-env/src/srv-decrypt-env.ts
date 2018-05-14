// @flow
/* eslint no-console: 0 */

import AWS from 'aws-sdk';

// Decrypts any vars that end with "_KMS_ENCRYPTED" and adds them back in to the
// environment.
export default async function decryptEnv(): Promise<void> {
  if (!process.env.AWS_REGION) {
    console.log('AWS region not set, not decrypting environment variables');
    return;
  }

  AWS.config.update({ region: process.env.AWS_REGION });
  const kms = new AWS.KMS();

  const environmentKeys = Object.keys(process.env);

  await Promise.all(
    environmentKeys.map(envKey => {
      const match = envKey.match(/(.*)_KMS_ENCRYPTED$/);

      if (!match) {
        return Promise.resolve({});
      }

      const decryptedEnvKey = match[1];

      const decryptParams = {
        CiphertextBlob: Buffer.from(process.env[envKey] || '', 'base64'),
      };

      return new Promise((resolve, reject) => {
        kms.decrypt(decryptParams, (err, data) => {
          if (err) {
            reject(err);
          } else if (!data.Plaintext) {
            reject(new Error(`Plaintext for key ${envKey} was blank`));
          } else {
            process.env[decryptedEnvKey] = data.Plaintext.toString();
            resolve({});
          }
        });
      });
    })
  );
}
