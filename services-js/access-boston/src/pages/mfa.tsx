import React from 'react';
import Head from 'next/head';
import { Formik } from 'formik';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';
import { PHONE_REGEXP } from '@cityofboston/form-common';

import fetchAccount, { Account } from '../client/graphql/fetch-account';
import addMfaDevice, {
  AddMfaDeviceArgs,
} from '../client/graphql/add-mfa-device';

import {
  GetInitialProps,
  GetInitialPropsDependencies,
  PageDependencies,
} from './_app';

import DeviceVerificationForm, {
  FormValues,
} from '../client/device-verification/DeviceVerificationForm';

import DeviceVerificationModal, {
  VerificationStatus,
} from '../client/device-verification/DeviceVerificationModal';
import verifyMfaDevice from '../client/graphql/verify-mfa-device';

import { MfaError, VerificationType } from '../client/graphql/queries';
import RedirectForm from '../client/RedirectForm';
import { registerDeviceSchema } from '../lib/validation';
import { RedirectError } from '../client/auth-helpers';

import AppWrapper from '../client/common/AppWrapper';

interface InitialProps {
  account: Account;
  phoneOrEmail: 'phone' | 'email';
}

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  /** Used for Storybook tests */
  testVerificationCodeModal?: boolean;
}

interface State {
  status: VerificationStatus;
  verificationError: string | null;
  sessionId: string | null;
}

export default class RegisterMfaPage extends React.Component<Props, State> {
  private readonly formikRef = React.createRef<Formik<FormValues>>();
  private readonly doneRedirectRef = React.createRef<RedirectForm>();

  constructor(props: Props) {
    super(props);

    this.state = {
      status: VerificationStatus.NONE,
      verificationError: null,
      sessionId: null,
    };
  }

  static getInitialProps: GetInitialProps<InitialProps> = async (
    { query },
    { fetchGraphql }: GetInitialPropsDependencies
  ) => {
    // We need to do this up top because if the forgot password succeeds on a
    // POST it torches the session.
    const account = await fetchAccount(fetchGraphql);

    if (account.hasMfaDevice) {
      throw new RedirectError('/');
    }

    const out: InitialProps = {
      account,
      // We use the query string for this rather than form state so that people
      // can click "back" from the email version of the form and get the phone
      // version of the form.
      phoneOrEmail: query['email'] === '1' ? 'email' : 'phone',
    };

    return out;
  };

  private formValuesToAddDeviceArgs({
    phoneOrEmail,
    smsOrVoice,
    phoneNumber,
    email,
  }: FormValues): AddMfaDeviceArgs {
    let type: VerificationType;

    if (phoneOrEmail === 'email') {
      type = VerificationType.EMAIL;
    } else {
      if (smsOrVoice === 'sms') {
        type = VerificationType.SMS;
      } else {
        type = VerificationType.VOICE;
      }

      // We normalize all phone numbers to include a country code to get around
      // a problem where Ping thinks that the 857 area code, common to Boston
      // cell phones, is a country code.
      const phoneNumberMatches = phoneNumber.match(PHONE_REGEXP);

      if (phoneNumberMatches) {
        phoneNumber = `+${phoneNumberMatches[1] || '1'} (${
          phoneNumberMatches[2]
        }) ${phoneNumberMatches[3]}-${phoneNumberMatches[4]}`;
      }
    }

    return { email, phoneNumber, type };
  }

  private handleSubmit = async (values: FormValues, { setSubmitting }) => {
    try {
      this.setState({
        status: VerificationStatus.SENDING,
        verificationError: null,
        sessionId: null,
      });

      const { sessionId, error } = await addMfaDevice(
        this.props.fetchGraphql,
        this.formValuesToAddDeviceArgs(values)
      );

      if (error) {
        // Will get caught below.
        throw new Error(error);
      } else {
        this.setState({
          status: VerificationStatus.SENT,
          sessionId,
        });
      }
    } catch (e) {
      // Stopping the submission process closes the modal.
      setSubmitting(false);

      this.setState({
        status: VerificationStatus.NONE,
        verificationError: e.toString(),
      });
    }
  };

  resendVerification = () => {
    const formik = this.formikRef.current;

    if (formik) {
      formik.setSubmitting(false);
      formik.submitForm();
    }
  };

  resetVerification = () => {
    const formik = this.formikRef.current;

    if (formik) {
      formik.resetForm();
    }

    this.setState({
      status: VerificationStatus.NONE,
      sessionId: null,
      verificationError: null,
    });
  };

  validateCode = async (code: string) => {
    const { fetchGraphql } = this.props;
    const { status, sessionId } = this.state;

    if (!sessionId || status === VerificationStatus.CHECKING) {
      return;
    }

    this.setState({
      status: VerificationStatus.CHECKING,
      verificationError: null,
    });

    try {
      const { success, error } = await verifyMfaDevice(
        fetchGraphql,
        sessionId,
        code
      );

      if (success) {
        this.doneRedirectRef.current!.redirect();
      } else if (error === MfaError.WRONG_CODE) {
        this.setState({ status: VerificationStatus.INCORRECT_CODE });
      } else if (error === MfaError.ALREADY_REGISTERED) {
        this.setState({ status: VerificationStatus.ALREADY_REGISTERED });
      } else {
        this.setState({ status: VerificationStatus.OTHER_ERROR });
      }
    } catch (e) {
      this.setState({ status: VerificationStatus.OTHER_ERROR });
    }
  };

  render() {
    const { account, testVerificationCodeModal, phoneOrEmail } = this.props;
    const { status, verificationError } = this.state;

    const initialValues: FormValues = {
      phoneOrEmail,
      smsOrVoice: 'sms',
      email: '',
      phoneNumber: '',
    };

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Add Security Noun</title>
        </Head>

        <AppWrapper account={account}>
          <Formik
            ref={this.formikRef as any}
            initialValues={initialValues}
            // True so Formik response to when phoneOrEmail changes (due to query
            // parameter changing the prop) in initialValues
            enableReinitialize
            isInitialValid={false}
            validationSchema={registerDeviceSchema}
            onSubmit={this.handleSubmit}
            render={formikProps => (
              <>
                <DeviceVerificationForm
                  {...formikProps}
                  serverError={verificationError}
                />

                {(formikProps.isSubmitting || testVerificationCodeModal) && (
                  <DeviceVerificationModal
                    status={status}
                    {...this.formValuesToAddDeviceArgs(formikProps.values)}
                    resendVerification={this.resendVerification}
                    resetVerification={this.resetVerification}
                    validateCode={this.validateCode}
                  />
                )}
              </>
            )}
          />

          {/* TODO(fiona): This needs to go through a single-sign out flow */}
          <RedirectForm ref={this.doneRedirectRef} path="/done" />
        </AppWrapper>
      </>
    );
  }
}
