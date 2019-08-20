import React from 'react';
import Head from 'next/head';
import { Formik, FormikProps, FormikActions } from 'formik';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import PasswordPolicy from '../client/common/PasswordPolicy';
import TextInput from '../client/common/TextInput';

import fetchAccount, { Account } from '../client/graphql/fetch-account';

import { forgotPasswordSchema } from '../lib/validation';

import { DEFAULT_PASSWORD_ATTRIBUTES } from '../client/styles';
import {
  GetInitialProps,
  GetInitialPropsDependencies,
  PageDependencies,
} from './_app';
import StatusModal from '../client/StatusModal';

import resetPassword from '../client/graphql/reset-password';
import HelpContactInfo from '../client/common/HelpContactInfo';

import AppWrapper from '../client/common/AppWrapper';

interface InitialProps {
  account: Account;
}

type ModalError = 'NETWORK' | 'SESSION';

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  testSubmittingModal?: boolean;
  testSuccessMessage?: boolean;
  testModalError?: ModalError;
}

interface State {
  showSubmittingModal: boolean;
  showSuccessMessage: boolean;
  showModalError: ModalError | null;
}

interface FormValues {
  username: string;
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export default class ForgotPasswordPage extends React.Component<Props, State> {
  static getInitialProps: GetInitialProps<InitialProps> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ) => {
    return {
      account: await fetchAccount(fetchGraphql),
    };
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      showSubmittingModal: !!props.testSubmittingModal,
      showSuccessMessage: !!props.testSuccessMessage,
      showModalError: props.testModalError || null,
    };
  }

  private handleSubmit = async (
    { newPassword, confirmPassword, token }: FormValues,
    { setSubmitting, setErrors }: FormikActions<FormValues>
  ) => {
    this.setState({ showSubmittingModal: true, showModalError: null });

    try {
      const { status, error } = await resetPassword(
        this.props.fetchGraphql,
        newPassword,
        confirmPassword,
        token
      );

      switch (status) {
        case 'ERROR':
          if (error === 'NO_SESSION') {
            this.setState({ showModalError: 'SESSION' });
          } else {
            setErrors(passwordErrorToFormErrors(error));
            scrollTo(0, 0);

            this.setState({ showSubmittingModal: false });
          }
          break;

        case 'SUCCESS':
          // If things succeeded, heads up that the user's session is no longer
          // valid.
          this.setState({
            showSuccessMessage: true,
            showSubmittingModal: false,
          });
          break;
      }
    } catch {
      this.setState({ showModalError: 'NETWORK' });
    } finally {
      setSubmitting(false);
    }
  };

  render() {
    const { account } = this.props;
    const { showSubmittingModal, showSuccessMessage } = this.state;

    const initialValues: FormValues = {
      username: account.employeeId,
      token: account.resetPasswordToken,
      newPassword: '',
      confirmPassword: '',
    };
    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Forgot Password</title>
        </Head>

        <AppWrapper noLinks>
          <div className="b b-c b-c--hsm">
            {showSuccessMessage ? (
              this.renderSuccessMessage()
            ) : (
              <>
                <SectionHeader title="Forgot Password" />

                <Formik
                  initialValues={initialValues}
                  validationSchema={forgotPasswordSchema}
                  isInitialValid={false}
                  onSubmit={this.handleSubmit}
                  render={this.renderForm}
                />
              </>
            )}
          </div>
        </AppWrapper>

        {showSubmittingModal && this.renderSubmitting()}
      </>
    );
  }

  private renderForm = ({
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    isValid,
  }: FormikProps<FormValues>) => {
    const commonPasswordProps = {
      ...DEFAULT_PASSWORD_ATTRIBUTES,
      onChange: handleChange,
      onBlur: handleBlur,
    };

    // We show server errors (from the non-JS implementation), though if the
    // field gets touched we hide those (this is unlikely, though, if JavaScript
    // is off.) Otherwise, we show validation errors only if the form has been
    // touched.
    const lookupFormError = (key: keyof FormValues) =>
      touched[key] && (errors[key] as any);

    return (
      <form action="" method="POST" className="m-v500" onSubmit={handleSubmit}>
        {/*
          This is here for the benefit of password managers, so they can pick
          up the username associated with the change of password.
          
          See: https://www.chromium.org/developers/design-documents/create-amazing-password-forms
        */}
        <input
          type="text"
          name="username"
          style={{
            position: 'absolute',
            visibility: 'hidden',
          }}
          autoComplete="username"
          value={values.username}
          readOnly
        />

        {/* "g--r" so that we can put the policy first on mobile */}
        <div className="g g--r m-v200">
          <div className="g--6 m-b500">
            <PasswordPolicy
              password={values.newPassword}
              showFailedAsErrors={touched.newPassword}
            />
          </div>

          <div className="g--6">
            <TextInput
              label="New Password"
              error={lookupFormError('newPassword')}
              name="newPassword"
              autoComplete="new-password"
              value={values.newPassword}
              {...commonPasswordProps}
            />

            <TextInput
              label="Confirm Password"
              error={lookupFormError('confirmPassword')}
              name="confirmPassword"
              autoComplete="new-password"
              value={values.confirmPassword}
              {...commonPasswordProps}
            />

            <div className="ta-r">
              <button
                type="submit"
                className="btn"
                disabled={!isValid || isSubmitting}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  private renderSubmitting() {
    const { showModalError } = this.state;

    return (
      <StatusModal>
        {!showModalError && (
          <>
            <div className="t--intro">Saving your new password…</div>
            <div className="t--info m-t300">
              Please be patient and don’t refresh your browser. This might take
              a bit.
            </div>
          </>
        )}
        {showModalError === 'NETWORK' && (
          <>
            <div className="t--intro t--err">There was a network problem</div>
            <div className="t--info m-v300">
              Your password was probably not changed. If this keeps happening,
              please get in touch:
            </div>

            <HelpContactInfo />

            <div className="ta-r">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  this.setState({
                    showSubmittingModal: false,
                    showModalError: null,
                  })
                }
              >
                Try Again
              </button>
            </div>
          </>
        )}
        {showModalError === 'SESSION' && (
          <>
            <div className="t--intro t--err">Your session has expired</div>
            <div className="t--info m-v300">
              Your password was not changed. You will need to log in again to
              reset your password.
            </div>

            <div className="ta-r">
              <button
                type="button"
                className="btn"
                onClick={() => (window.location.href = '/forgot')}
              >
                Log In
              </button>
            </div>
          </>
        )}
      </StatusModal>
    );
  }

  private renderSuccessMessage() {
    return (
      <>
        <SectionHeader title="Reset successful!" />

        <div className="t--intro">
          Your password change has gone through. Log in now with your new
          password.
        </div>

        <div className="m-v500">
          <a href="/login" className="btn">
            Log in
          </a>
        </div>
      </>
    );
  }
}

function passwordErrorToFormErrors(error: string | null) {
  if (!error) {
    return {};
  }

  switch (error) {
    case 'NEW_PASSWORDS_DONT_MATCH':
      return { confirmPassword: 'Password confirmation didn’t match' };
    default:
      return { newPassword: error };
  }
}
