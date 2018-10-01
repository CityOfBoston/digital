import React from 'react';
import Head from 'next/head';
import { Formik } from 'formik';

import { PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AccessBostonHeader from '../client/AccessBostonHeader';

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
  validationSchema,
  FormValues,
} from '../client/device-verification/DeviceVerificationForm';

import DeviceVerificationModal, {
  VerificationStatus,
} from '../client/device-verification/DeviceVerificationModal';

interface InitialProps {
  account: Account;
}

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  /** Used for Storybook tests */
  testVerificationCodeModal?: boolean;
}

interface State {
  verificationError: string | null;
  sessionId: string | null;
}

export default class RegisterMfaPage extends React.Component<Props, State> {
  formikRef: React.RefObject<Formik<FormValues>>;

  constructor(props: Props) {
    super(props);

    this.formikRef = React.createRef();

    this.state = {
      verificationError: null,
      sessionId: null,
    };
  }

  static getInitialProps: GetInitialProps<InitialProps> = async (
    _,
    { fetchGraphql }: GetInitialPropsDependencies
  ) => {
    // We need to do this up top because if the forgot password succeeds on a
    // POST it torches the session.
    const account = await fetchAccount(fetchGraphql);

    return {
      account,
    };
  };

  private formValuesToAddDeviceArgs({
    phoneOrEmail,
    smsOrVoice,
    phoneNumber,
    email,
  }: FormValues): AddMfaDeviceArgs {
    let type;

    if (phoneOrEmail === 'email') {
      type = 'EMAIL';
    } else if (smsOrVoice === 'sms') {
      type = 'SMS';
    } else {
      type = 'VOICE';
    }

    return { email, phoneNumber, type };
  }

  private handleSubmit = async (values: FormValues, { setSubmitting }) => {
    try {
      this.setState({
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
        this.setState({ sessionId });
      }
    } catch (e) {
      setSubmitting(false);

      this.setState({
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
      sessionId: null,
      verificationError: null,
    });
  };

  validateCode = async () => {
    const formik = this.formikRef.current;

    if (formik) {
      formik.resetForm();
    }

    window.location.href = '/';
  };

  render() {
    const { account, testVerificationCodeModal } = this.props;
    const {
      verificationError,

      sessionId,
    } = this.state;

    const initialValues: FormValues = {
      phoneOrEmail: 'phone',
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

        <AccessBostonHeader account={account} />

        <Formik
          ref={this.formikRef as any}
          initialValues={initialValues}
          isInitialValid={false}
          validationSchema={validationSchema}
          onSubmit={this.handleSubmit}
          render={formikProps => (
            <>
              <DeviceVerificationForm
                {...formikProps}
                serverError={verificationError}
              />

              {(formikProps.isSubmitting || testVerificationCodeModal) && (
                <DeviceVerificationModal
                  status={
                    sessionId
                      ? VerificationStatus.SENT
                      : VerificationStatus.SENDING
                  }
                  {...this.formValuesToAddDeviceArgs(formikProps.values)}
                  resendVerification={this.resendVerification}
                  resetVerification={this.resetVerification}
                  validateCode={this.validateCode}
                />
              )}
            </>
          )}
        />
      </>
    );
  }
}
