import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { Formik, FormikProps } from 'formik';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import AccessBostonHeader from '../client/AccessBostonHeader';
import PasswordPolicy from '../client/PasswordPolicy';
import TextInput from '../client/TextInput';
import StatusModal from '../client/StatusModal';

import { changePasswordSchema } from '../lib/validation';

import { MAIN_CLASS, DEFAULT_PASSWORD_ATTRIBUTES } from '../client/styles';
import fetchAccount, { Account } from '../client/graphql/fetch-account';
import changePassword from '../client/graphql/change-password';
import { PasswordError } from '../client/graphql/queries';

import { FlashMessage } from './index';

import {
  GetInitialPropsDependencies,
  GetInitialProps,
  PageDependencies,
} from './_app';
import RedirectForm from '../client/RedirectForm';
import HelpContactInfo from '../client/HelpContactInfo';

interface InitialProps {
  account: Account;
}

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  testSubmittingModal?: boolean;
  testNetworkError?: boolean;
  hasTemporaryPassword?: boolean;
}

interface State {
  showSubmittingModal: boolean;
  showNetworkError: boolean;
}

interface FormValues {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
}

function successUrl(account): string {
  return account.needsMfaDevice
    ? `/mfa?message=${FlashMessage.CHANGE_PASSWORD_SUCCESS}`
    : `/?message=${FlashMessage.CHANGE_PASSWORD_SUCCESS}`;
}

export default class ChangePasswordPage extends React.Component<Props, State> {
  static getInitialProps: GetInitialProps<InitialProps> = async (
    _ctx,
    { fetchGraphql }: GetInitialPropsDependencies
  ) => {
    return {
      account: await fetchAccount(fetchGraphql),
    };
  };

  private readonly doneRedirectRef = React.createRef<RedirectForm>();

  constructor(props: Props) {
    super(props);

    this.state = {
      showSubmittingModal: !!props.testSubmittingModal,
      showNetworkError: !!props.testNetworkError,
    };
  }

  private handleSubmit = async (
    { password, newPassword, confirmPassword }: FormValues,
    { setSubmitting, setErrors }
  ) => {
    const { account } = this.props;

    this.setState({ showSubmittingModal: true, showNetworkError: false });

    try {
      const { status, error } = await changePassword(
        this.props.fetchGraphql,
        password,
        newPassword,
        confirmPassword
      );

      switch (status) {
        case 'ERROR':
          // TODO(finh): Maybe show server errors in the modal?
          setErrors(changePasswordErrorToFormErrors(error));
          scrollTo(0, 0);
          break;

        case 'SUCCESS':
          if (account.needsNewPassword && !account.needsMfaDevice) {
            // we were doing registration, but if we don't need an MFA device
            // then we can go straight to done.
            this.doneRedirectRef.current!.redirect();
          } else {
            Router.push({
              // clears out any query param since we're setting it below
              pathname: successUrl(account).replace(/\?.*/, ''),
              query: { message: FlashMessage.CHANGE_PASSWORD_SUCCESS },
            });
          }
          break;
      }

      this.setState({ showSubmittingModal: false });
    } catch {
      this.setState({ showNetworkError: true });
    } finally {
      setSubmitting(false);
    }
  };

  render() {
    const { account, hasTemporaryPassword } = this.props;
    const { showSubmittingModal } = this.state;

    const setNewPassword = account.needsNewPassword;

    const initialValues: FormValues = {
      username: account.employeeId,
      password: '',
      newPassword: '',
      confirmPassword: '',
    };

    return (
      <>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Access Boston: Change Password</title>
        </Head>

        <AccessBostonHeader account={account} />

        <div className={MAIN_CLASS}>
          <div className="b b-c b-c--hsm">
            <SectionHeader
              title={
                account.needsNewPassword
                  ? 'Create a New Password'
                  : 'Change Password'
              }
            />

            {setNewPassword && (
              <>
                <p className="t--s400 lh--400">
                  You’ll need a new password for Access Boston. We’ve changed
                  the requirements for passwords to make sure that they’re
                  strong enough.
                </p>

                <p className="t--s400 lh--400">
                  You’ll use this password when logging in to Access Boston
                  websites like The Hub. If you work in City Hall or for BPS
                  you’ll also use it for your desktop computer.
                </p>

                {hasTemporaryPassword && (
                  <p className="t--s400 lh--400">
                    Please look for an email from us with your temporary
                    password.
                  </p>
                )}

                <hr className="hr hr--sq" aria-hidden />
              </>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={changePasswordSchema}
              onSubmit={this.handleSubmit}
              render={this.renderForm}
            />
          </div>
        </div>

        {showSubmittingModal && this.renderSubmitting()}

        <RedirectForm path="done" ref={this.doneRedirectRef} />
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
    const { account, hasTemporaryPassword } = this.props;

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
              label={
                hasTemporaryPassword ? 'Temporary Password' : 'Current Password'
              }
              error={lookupFormError('password')}
              name="password"
              autoComplete="current-password"
              value={values.password}
              {...commonPasswordProps}
            />

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
                {account.needsNewPassword
                  ? 'Set new password'
                  : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  private renderSubmitting() {
    const { showNetworkError } = this.state;

    return (
      <StatusModal>
        {!showNetworkError && (
          <>
            <div className="t--intro">Saving your new password…</div>
            <div className="t--info m-t300">
              Please be patient and don’t refresh your browser. This might take
              a bit.
            </div>
          </>
        )}
        {showNetworkError && (
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
                    showNetworkError: false,
                  })
                }
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </StatusModal>
    );
  }
}

function changePasswordErrorToFormErrors(error: PasswordError | null) {
  if (!error) {
    return {};
  }

  switch (error) {
    case 'CURRENT_PASSWORD_WRONG':
      return { password: 'Your current password is incorrect' };
    case 'NEW_PASSWORDS_DONT_MATCH':
      return { confirmPassword: 'Password confirmation didn’t match' };
    default:
      return { password: 'An unknown error occurred' };
  }
}
