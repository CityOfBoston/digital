import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { Formik, FormikProps } from 'formik';
import { ValidationError } from 'yup';
import { css } from 'emotion';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import CrumbContext from '../client/CrumbContext';
import AccessBostonHeader from '../client/AccessBostonHeader';
import PasswordPolicy from '../client/PasswordPolicy';
import TextInput from '../client/TextInput';

import { changePasswordSchema, addValidationError } from '../lib/validation';

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
  // Disables JS submission so we can test non-JavaScript cases in the
  // integration tests.
  noJs?: boolean;
}

interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'> {
  testSubmittingModal?: boolean;
}

interface State {
  showSubmittingModal: boolean;
}

interface FormValues {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  crumb: string;
}

export default class ChangePasswordPage extends React.Component<Props, State> {
  static getInitialProps: GetInitialProps<InitialProps> = async (
    { req, res, query },
    { fetchGraphql }: GetInitialPropsDependencies
  ) => {
    const serverErrors: { [key: string]: string } = {};

    const noJs = (req && req.method === 'POST') || !!query['noJs'];

    // This is the no-JavaScript case. We still want to be able to change
    // passwords and such.
    if (req && req.method === 'POST') {
      const values: FormValues = req.payload || ({} as any);

      try {
        await changePasswordSchema.validate(values, { abortEarly: false });

        const { status, error } = await changePassword(
          fetchGraphql,
          values.password,
          values.newPassword,
          values.confirmPassword
        );

        if (status === 'ERROR') {
          Object.assign(serverErrors, changePasswordErrorToFormErrors(error));
        } else {
          // res will be non-null because req was set.
          res!.writeHead(302, {
            Location: `/?message=${FlashMessage.CHANGE_PASSWORD_SUCCESS}`,
          });
          res!.end();
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
      account: await fetchAccount(fetchGraphql),
      serverErrors,
      noJs,
    };
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      showSubmittingModal: !!props.testSubmittingModal,
    };
  }

  private handleSubmit = async (
    { password, newPassword, confirmPassword }: FormValues,
    { setSubmitting, setErrors }
  ) => {
    this.setState({ showSubmittingModal: true });

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
          Router.push({
            pathname: '/',
            query: { message: FlashMessage.CHANGE_PASSWORD_SUCCESS },
          });
          break;
      }
    } finally {
      this.setState({ showSubmittingModal: false });
      setSubmitting(false);
    }
  };

  render() {
    const { account } = this.props;
    const { showSubmittingModal } = this.state;

    return (
      <CrumbContext.Consumer>
        {crumb => {
          const initialValues: FormValues = {
            username: account.employeeId,
            password: '',
            newPassword: '',
            confirmPassword: '',
            crumb,
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
                  <SectionHeader title="Change Password" />

                  <Formik
                    initialValues={initialValues}
                    validationSchema={changePasswordSchema}
                    onSubmit={this.handleSubmit}
                    render={this.renderForm}
                  />
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
              label="Current Password"
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
          </div>
        </div>

        {this.props.serverErrors.form && (
          <>
            <div className="t--info t--err m-b500">
              There was a problem changing your password:{' '}
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
          Change Password
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
