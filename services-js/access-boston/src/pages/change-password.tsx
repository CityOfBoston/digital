import React from 'react';
import Head from 'next/head';
import { Formik } from 'formik';

import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import CrumbContext from '../client/CrumbContext';
import AccessBostonHeader from '../client/AccessBostonHeader';
import PasswordPolicy from '../client/PasswordPolicy';
import TextInputWrapper from '../client/TextInputWrapper';

import { changePasswordSchema } from '../lib/validation';
import fetchAccount, { Account } from '../client/graphql/fetch-account';

interface Props {
  account: Account;
}

export default class ForgotPassword extends React.Component<Props> {
  static async getInitialProps({ req }) {
    return { account: await fetchAccount(req) };
  }

  render() {
    return (
      <CrumbContext.Consumer>
        {_crumb => (
          <>
            <Head>
              <link rel="stylesheet" href={PUBLIC_CSS_URL} />
              <title>Access Boston: Change Password</title>
            </Head>
            <AccessBostonHeader account={this.props.account} />

            <div className="mn">
              <div className="b b-c b-c--hsm">
                <SectionHeader title="Change Password" />

                <form action="javascript:void(0)" className="m-v500">
                  <Formik
                    initialValues={{
                      password: '',
                      newPassword: '',
                      confirmPassword: '',
                    }}
                    validationSchema={changePasswordSchema}
                    onSubmit={() => {}}
                    render={({
                      values,
                      errors,
                      touched,
                      handleBlur,
                      handleChange,
                    }) => (
                      <>
                        <div className="g m-v200">
                          <div className="g--6">
                            <TextInputWrapper
                              title="Current Password"
                              error={
                                touched.password && (errors.password as any)
                              }
                            >
                              {({ id, className }) => (
                                <input
                                  id={id}
                                  className={className}
                                  type="password"
                                  autoComplete="current-password"
                                  spellCheck={false}
                                  name="password"
                                  value={values.password}
                                  autoFocus={false}
                                  autoCapitalize="off"
                                  autoCorrect="off"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              )}
                            </TextInputWrapper>

                            <TextInputWrapper
                              title="New Password"
                              error={
                                touched.newPassword &&
                                (errors.newPassword as any)
                              }
                            >
                              {({ id, className }) => (
                                <input
                                  id={id}
                                  className={className}
                                  type="password"
                                  autoComplete="new-password"
                                  spellCheck={false}
                                  name="newPassword"
                                  value={values.newPassword}
                                  autoFocus={false}
                                  autoCapitalize="off"
                                  autoCorrect="off"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              )}
                            </TextInputWrapper>

                            <TextInputWrapper
                              title="Confirm Password"
                              error={
                                touched.confirmPassword &&
                                (errors.confirmPassword as any)
                              }
                            >
                              {({ id, className }) => (
                                <input
                                  id={id}
                                  className={className}
                                  type="password"
                                  autoComplete="new-password"
                                  spellCheck={false}
                                  name="confirmPassword"
                                  value={values.confirmPassword}
                                  autoFocus={false}
                                  autoCapitalize="off"
                                  autoCorrect="off"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              )}
                            </TextInputWrapper>
                          </div>

                          <div className="g--6">
                            <PasswordPolicy
                              password={values.newPassword}
                              showFailedAsErrors={touched.newPassword}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn">
                          Change Password
                        </button>
                      </>
                    )}
                  />
                </form>
              </div>
            </div>
          </>
        )}
      </CrumbContext.Consumer>
    );
  }
}
