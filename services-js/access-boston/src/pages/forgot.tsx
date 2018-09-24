import React from 'react';
import Head from 'next/head';
import { Formik, FormikProps } from 'formik';
import { css } from 'emotion';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import CrumbContext from '../client/CrumbContext';
import AccessBostonHeader from '../client/AccessBostonHeader';
import PasswordPolicy from '../client/PasswordPolicy';
import TextInput from '../client/TextInput';

import fetchAccount, { Account } from '../client/graphql/fetch-account';

import { forgotPasswordSchema, addValidationError } from '../lib/validation';

import { MAIN_CLASS, DEFAULT_PASSWORD_ATTRIBUTES } from '../client/styles';
import {
  GetInitialProps,
  GetInitialPropsDependencies,
  PageDependencies,
} from './_app';
import resetPassword from '../client/graphql/reset-password';
import { PasswordError } from '../client/graphql/queries';
import { ValidationError } from 'yup';

const SUBMITTING_MODAL_STYLE = css({
  paddingTop: 0,
  maxWidth: 500,
  top: '15%',
  marginRight: 'auto',
  marginLeft: 'auto',
});

interface InitialProps {
  account: Account;
  serverErrors: { [key: string]: string };
  showSuccessMessage: boolean;
  noJs?: boolean;
}

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  testSubmittingModal?: boolean;
}

interface State {
  showSubmittingModal: boolean;
  showSuccessMessage: boolean;
}

interface FormValues {
  username: string;
  newPassword: string;
  confirmPassword: string;
  crumb: string;
}

export default class ForgotPasswordPage extends React.Component<Props, State> {
  static defaultProps = {
    serverErrors: {},
  };

  static getInitialProps: GetInitialProps<InitialProps> = async (
    { req, query },
    { fetchGraphql }: GetInitialPropsDependencies
  ) => {
    // We need to do this up top because if the forgot password succeeds on a
    // POST it torches the session.
    const account = await fetchAccount(fetchGraphql);

    const serverErrors: { [key: string]: string } = {};

    const noJs = (req && req.method === 'POST') || !!query['noJs'];
    let showSuccessMessage = false;

    // This is the no-JavaScript case. We still want to be able to reset
    // passwords and such.
    if (req && req.method === 'POST') {
      const values: FormValues = req.payload || ({} as any);

      try {
        await forgotPasswordSchema.validate(values, { abortEarly: false });

        const { status, error } = await resetPassword(
          fetchGraphql,
          values.newPassword,
          values.confirmPassword
        );

        if (status === 'ERROR') {
          Object.assign(serverErrors, passwordErrorToFormErrors(error));
        } else {
          // We show "success" in the POST response rather than do a redirect
          // because the session is invalid as soon as the above GraphQL method
          // succeeds.
          showSuccessMessage = true;
        }
      } catch (err) {
        if (err instanceof ValidationError) {
          addValidationError(serverErrors, err);
        } else {
          serverErrors.form = err.message;
        }
      }
    }

    return {
      account,
      serverErrors,
      showSuccessMessage,
      noJs,
    };
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      showSubmittingModal: !!props.testSubmittingModal,
      showSuccessMessage: !!props.showSuccessMessage,
    };
  }

  private handleSubmit = async (
    { newPassword, confirmPassword }: FormValues,
    { setSubmitting, setErrors }
  ) => {
    this.setState({ showSubmittingModal: true });

    try {
      const { status, error } = await resetPassword(
        this.props.fetchGraphql,
        newPassword,
        confirmPassword
      );

      switch (status) {
        case 'ERROR':
          // TODO(finh): Maybe show server errors in the modal?
          setErrors(passwordErrorToFormErrors(error));
          scrollTo(0, 0);
          break;

        case 'SUCCESS':
          // If things succeeded, heads up that the user's session is no longer
          // valid.
          this.setState({ showSuccessMessage: true });
          break;
      }
    } finally {
      this.setState({ showSubmittingModal: false });
      setSubmitting(false);
    }
  };

  render() {
    const { account } = this.props;
    const { showSubmittingModal, showSuccessMessage } = this.state;

    return (
      <CrumbContext.Consumer>
        {crumb => {
          const initialValues: FormValues = {
            username: account.employeeId,
            newPassword: '',
            confirmPassword: '',
            crumb,
          };

          return (
            <>
              <Head>
                <link rel="stylesheet" href={PUBLIC_CSS_URL} />
                <title>Access Boston: Forgot Password</title>
              </Head>

              <AccessBostonHeader noLinks />

              <div className={MAIN_CLASS}>
                <div className="b b-c b-c--hsm">
                  {showSuccessMessage ? (
                    this.renderSuccessMessage()
                  ) : (
                    <>
                      <SectionHeader title="Forgot Password" />

                      <Formik
                        initialValues={initialValues}
                        validationSchema={forgotPasswordSchema}
                        onSubmit={this.handleSubmit}
                        render={this.renderForm}
                      />
                    </>
                  )}
                </div>
              </div>

              {showSubmittingModal && this.renderSubmitting()}
            </>
          );
        }}
      </CrumbContext.Consumer>
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
    const { serverErrors, noJs } = this.props;

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
      (!touched[key] && serverErrors[key]) ||
      (!noJs && touched[key] && (errors[key] as any));

    return (
      <form
        action=""
        method="POST"
        className="m-v500"
        onSubmit={noJs ? () => {} : handleSubmit}
      >
        <input type="hidden" name="crumb" value={values.crumb} />

        {/*
          This is here for the benefit of password managers, so they can pick
          up the username associated with the change of password.
          
          See: https://www.chromium.org/developers/design-documents/create-amazing-password-forms
        */}
        <input
          type="hidden"
          name="username"
          autoComplete="username"
          value={values.username}
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
          </div>
        </div>

        {this.props.serverErrors.form && (
          <>
            <div className="t--info t--err m-b500">
              There was a problem resetting your password:{' '}
              {this.props.serverErrors.form}
            </div>

            <div className="t--info t--err m-b500">
              You can try again. If this keeps happening, please call the Help
              Desk.
            </div>
          </>
        )}

        <button
          type="submit"
          className="btn"
          disabled={
            (process as any).browser && !noJs && (!isValid || isSubmitting)
          }
        >
          Reset Password
        </button>
      </form>
    );
  };

  private renderSubmitting() {
    return (
      <div className="md">
        <div className={`md-c br br-t400 ${SUBMITTING_MODAL_STYLE}`}>
          <div className="md-b p-a300">
            <div className="t--intro">Saving your new password…</div>
            <div className="t--info m-t300">
              Please be patient and don’t refresh your browser. This might take
              a bit.
            </div>
          </div>
        </div>
      </div>
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

function passwordErrorToFormErrors(error: PasswordError | null) {
  if (!error) {
    return {};
  }

  switch (error) {
    case 'NEW_PASSWORDS_DONT_MATCH':
      return { confirmPassword: 'Password confirmation didn’t match' };
    default:
      return { newPassword: 'An unknown error occurred' };
  }
}
