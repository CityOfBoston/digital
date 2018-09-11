import React from 'react';
import Head from 'next/head';
import { Formik, FormikProps } from 'formik';
import { css } from 'emotion';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import CrumbContext from '../client/CrumbContext';
import AccessBostonHeader from '../client/AccessBostonHeader';
import PasswordPolicy from '../client/PasswordPolicy';
import TextInput from '../client/TextInput';

import { forgotPasswordSchema } from '../lib/validation';

import { MAIN_CLASS } from '../client/styles';

const SUBMITTING_MODAL_STYLE = css({
  paddingTop: 0,
  maxWidth: 500,
  top: '15%',
  marginRight: 'auto',
  marginLeft: 'auto',
});

interface InitialProps {
  serverErrors: { [key: string]: string };
}

interface Props extends InitialProps {
  testSubmittingModal?: boolean;
}

interface State {
  showSubmittingModal: boolean;
}

interface FormValues {
  newPassword: string;
  confirmPassword: string;
  crumb: string;
}

export default class ForgotPasswordPage extends React.Component<Props, State> {
  static defaultProps = {
    serverErrors: {},
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      showSubmittingModal: !!props.testSubmittingModal,
    };
  }

  render() {
    const { showSubmittingModal } = this.state;

    return (
      <CrumbContext.Consumer>
        {crumb => {
          const initialValues: FormValues = {
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

              <AccessBostonHeader />

              <div className={MAIN_CLASS}>
                <div className="b b-c b-c--hsm">
                  <SectionHeader title="Forgot Password" />

                  <Formik
                    initialValues={initialValues}
                    validationSchema={forgotPasswordSchema}
                    onSubmit={() => {}}
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
    const { serverErrors } = this.props;

    const commonPasswordProps = {
      type: 'password',
      required: true,
      spellCheck: false,
      autoFocus: false,
      autoCapitalize: 'off',
      autoCorrect: 'off',
      onChange: handleChange,
      onBlur: handleBlur,
    };

    // We show server errors (from the non-JS implementation), though if the
    // field gets touched we hide those (this is unlikely, though, if JavaScript
    // is off.) Otherwise, we show validation errors only if the form has been
    // touched.
    const lookupFormError = (key: keyof FormValues) =>
      (!touched[key] && serverErrors[key]) ||
      (touched[key] && (errors[key] as any));

    return (
      <form action="" method="POST" className="m-v500" onSubmit={handleSubmit}>
        <input type="hidden" name="crumb" value={values.crumb} />

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
          disabled={(process as any).browser && (!isValid || isSubmitting)}
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
}
