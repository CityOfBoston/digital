import React, { ReactNode } from 'react';
import { css } from 'emotion';
import { Formik, FormikProps } from 'formik';
import * as yup from 'yup';

import { VerificationType } from '../graphql/queries';
import StatusModal from '../StatusModal';
import TextInput from '../TextInput';
import { SANS } from '@cityofboston/react-fleet';

export enum VerificationStatus {
  NONE,
  SENDING,
  SENT,
  CHECKING,
  INCORRECT_CODE,
  OTHER_ERROR,
}

interface Props {
  status: VerificationStatus;

  type: VerificationType | null;
  email: string | null;
  phoneNumber: string | null;

  resendVerification: () => any;
  resetVerification: () => any;
  validateCode: (code: string) => any;

  testCode?: string;
}

const VERIFICATION_CODE_ROW_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});

const VERIFICATION_CODE_INPUT_STYLE = css({
  flexGrow: 1,
  fontSize: '30px',
  letterSpacing: '3px',
  fontFamily: SANS,
  fontWeight: 'bold',
});

export default class DeviceVerificationModal extends React.Component<Props> {
  render() {
    const { status } = this.props;

    return (
      <StatusModal>
        {status !== VerificationStatus.SENDING && this.renderEnterCode()}
        {status === VerificationStatus.SENDING && (
          <div className="t--intro">
            We’re sending your authentication code…
          </div>
        )}
      </StatusModal>
    );
  }

  renderEnterCode() {
    const {
      status,
      type,
      email,
      phoneNumber,
      validateCode,
      testCode,
    } = this.props;

    let header: ReactNode = null;

    if (status === VerificationStatus.OTHER_ERROR) {
      return this.renderGenericError();
    }

    if (status === VerificationStatus.INCORRECT_CODE) {
      header = (
        <span className="t--err">
          That code didn’t seem right. Can you try again?
        </span>
      );
    } else if (type === VerificationType.EMAIL) {
      header = (
        <>
          Check your inbox! We’ve sent an email to <strong>{email}</strong>.
        </>
      );
    } else if (type === VerificationType.SMS) {
      header = (
        <>
          Check your phone! We’ve sent a text to <strong>{phoneNumber}</strong>.
        </>
      );
    } else if (type === VerificationType.VOICE) {
      header = (
        <>
          Please pick up! We’re making a phone call to{' '}
          <strong>{phoneNumber}</strong>.
        </>
      );
    }

    return (
      <>
        <div className="t--intro">{header}</div>

        <Formik
          initialValues={{ code: testCode || '' }}
          validationSchema={yup.object().shape({
            code: yup
              .string()
              .required()
              .matches(/\d{6}/),
          })}
          isInitialValid={!!testCode}
          onSubmit={async ({ code }, { resetForm }) => {
            await validateCode(code);
            // Clears out the input values. Useful in case the code is incorrect.
            resetForm();
          }}
          render={this.renderFormContents}
        />
      </>
    );
  }

  renderGenericError() {
    const { resendVerification, resetVerification } = this.props;

    return (
      <>
        <div className="t--intro">
          <span className="t--err">Something went wrong.</span>
        </div>

        <div className="m-v400">
          We had a problem verifying that code. You can try to{' '}
          <button type="button" className="lnk" onClick={resendVerification}>
            get a new code
          </button>{' '}
          or{' '}
          <button type="button" className="lnk" onClick={resetVerification}>
            use a different number or email
          </button>.
        </div>

        <div>
          Please get in touch with the helpdesk if this keeps happening.
        </div>
      </>
    );
  }

  renderFormContents = ({
    values: { code },
    handleChange,
    submitForm,
    isValid,
  }: FormikProps<{ code: string }>) => {
    const { status, resendVerification, resetVerification } = this.props;

    return (
      <>
        <div className="m-v500">
          <TextInput
            label="Authentication code"
            name="code"
            value={code}
            maxLength={6}
            pattern="[0-9]*"
            onChange={handleChange}
            className={VERIFICATION_CODE_INPUT_STYLE}
            autoFocus
            hideErrorMessage
            renderInputFunc={({ inputEl }) => (
              <div className={VERIFICATION_CODE_ROW_STYLE}>
                {inputEl}

                <button
                  type="button"
                  className="btn"
                  onClick={submitForm}
                  disabled={!isValid || status === VerificationStatus.CHECKING}
                  style={{
                    whiteSpace: 'nowrap',
                    marginLeft: '1em',
                  }}
                >
                  {status === VerificationStatus.CHECKING
                    ? 'Checking…'
                    : 'Activate'}
                </button>
              </div>
            )}
          />
        </div>

        <div className="t--subinfo ta-c">
          Didn’t get it?{' '}
          <button type="button" className="lnk" onClick={resendVerification}>
            Resend the code
          </button>{' '}
          or{' '}
          <button type="button" className="lnk" onClick={resetVerification}>
            try a different number or email
          </button>.
        </div>
      </>
    );
  };
}
