import React from 'react';
import { storiesOf } from '@storybook/react';

import DeviceVerificationModal, {
  VerificationStatus,
} from './DeviceVerificationModal';
import { action } from '@storybook/addon-actions';
import { VerificationType } from '../graphql/queries';

const resendVerification = action('resendVerification');
const resetVerification = action('resetVerification');

const validateCode = (...args) =>
  action('validateCode')(args) || Promise.resolve(true);

storiesOf('RegisterMfaPage/DeviceVerificationModal', module)
  .add('sending', () => (
    <DeviceVerificationModal
      status={VerificationStatus.SENDING}
      type={null}
      phoneNumber={null}
      email={null}
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
    />
  ))
  .add('waiting for email code', () => (
    <DeviceVerificationModal
      status={VerificationStatus.SENT}
      type={VerificationType.EMAIL}
      phoneNumber={null}
      email="test@boston.gov"
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
      testCode="133789"
    />
  ))
  .add('waiting for SMS code', () => (
    <DeviceVerificationModal
      status={VerificationStatus.SENT}
      type={VerificationType.SMS}
      phoneNumber="(617) 555-1234"
      email={null}
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
    />
  ))
  .add('waiting for voice code', () => (
    <DeviceVerificationModal
      status={VerificationStatus.SENT}
      type={VerificationType.VOICE}
      phoneNumber="(617) 555-1234"
      email={null}
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
    />
  ))
  .add('checking the code', () => (
    <DeviceVerificationModal
      status={VerificationStatus.CHECKING}
      type={VerificationType.VOICE}
      phoneNumber="(617) 555-1234"
      email={null}
      testCode="133789"
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
    />
  ))
  .add('incorrect code', () => (
    <DeviceVerificationModal
      status={VerificationStatus.INCORRECT_CODE}
      type={VerificationType.VOICE}
      phoneNumber="(617) 555-1234"
      email={null}
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
    />
  ))
  .add('other error', () => (
    <DeviceVerificationModal
      status={VerificationStatus.OTHER_ERROR}
      type={VerificationType.VOICE}
      phoneNumber="(617) 555-1234"
      email={null}
      resendVerification={resendVerification}
      resetVerification={resetVerification}
      validateCode={validateCode}
    />
  ));
