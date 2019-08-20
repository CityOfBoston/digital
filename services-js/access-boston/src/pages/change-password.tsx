import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { Formik, FormikProps } from 'formik';
import { format as formatUrl } from 'url';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import PasswordPolicy from '../client/common/PasswordPolicy';
import TextInput from '../client/common/TextInput';
import StatusModal from '../client/StatusModal';

import { changePasswordSchema } from '../lib/validation';

import { DEFAULT_PASSWORD_ATTRIBUTES } from '../client/styles';
import fetchAccount, { Account } from '../client/graphql/fetch-account';
import changePassword from '../client/graphql/change-password';

import { FlashMessage } from './index';

import {
  GetInitialPropsDependencies,
  GetInitialProps,
  PageDependencies,
} from './_app';
import RedirectForm from '../client/RedirectForm';
import HelpContactInfo from '../client/common/HelpContactInfo';

import AppWrapper from '../client/common/AppWrapper';

interface InitialProps {
  account: Account;
}

type ModalError = 'NETWORK' | 'SESSION';

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  testSubmittingModal?: boolean;
  testModalError?: ModalError;
  hasTemporaryPassword?: boolean;
}

interface State {
  showSubmittingModal: boolean;
  showModalError: ModalError | null;
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
      showModalError: props.testModalError || null,
    };
  }

  private handleSubmit = async (
    { password, newPassword, confirmPassword }: FormValues,
    { setSubmitting, setErrors }
  ) => {
    const { account } = this.props;

    this.setState({ showSubmittingModal: true, showModalError: null });

    try {
      const { status, error } = await changePassword(
        this.props.fetchGraphql,
        password,
        newPassword,
        confirmPassword
      );

      switch (status) {
        case 'ERROR':
          if (error === 'NO_SESSION') {
            this.setState({ showModalError: 'SESSION' });
          } else {
            setErrors(changePasswordErrorToFormErrors(error));
            scrollTo(0, 0);
            this.setState({ showSubmittingModal: false });
          }
          break;

        case 'SUCCESS':
          if (account.needsNewPassword && !account.needsMfaDevice) {
            // we were doing registration, but if we don't need an MFA device
            // then we can go straight to done.
            this.doneRedirectRef.current!.redirect();
          } else {
            Router.push(
              formatUrl({
                // clears out any query param since we're setting it below
                pathname: successUrl(account).replace(/\?.*/, ''),
                query: { message: FlashMessage.CHANGE_PASSWORD_SUCCESS },
              })
            );
          }
          break;
      }
    } catch {
      this.setState({ showModalError: 'NETWORK' });
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

        <AppWrapper account={account}>
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

          {showSubmittingModal && this.renderSubmitting()}

          <RedirectForm path="done" ref={this.doneRedirectRef} />
        </AppWrapper>
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

            <div>
              <button
                type="submit"
                className="btn btn--b"
                disabled={!isValid || isSubmitting}
              >
                {account.needsNewPassword
                  ? 'Set new password'
                  : 'Change Password'}
              </button>
            </div>

            {!account.needsNewPassword && (
              <div className="ta-c t--subinfo m-v700">
                <Link href="/">
                  <a>Cancel and go back to Access Boston</a>
                </Link>
              </div>
            )}
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
              change your password.
            </div>

            <div className="ta-r">
              <button
                type="button"
                className="btn"
                onClick={() => (window.location.href = '/change-password')}
              >
                Log In
              </button>
            </div>
          </>
        )}
      </StatusModal>
    );
  }
}

function changePasswordErrorToFormErrors(error: string | null) {
  if (!error) {
    return {};
  }

  switch (error) {
    case 'NEW_PASSWORDS_DONT_MATCH':
      return { confirmPassword: 'Password confirmation didn’t match' };
    default:
      return {
        [error.includes('current password')
          ? 'password'
          : 'newPassword']: error,
      };
  }
}
