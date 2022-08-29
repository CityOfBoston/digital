/* eslint no-debugger:0 */
import React from 'react';
import Head from 'next/head';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

import { AppLayout } from '@cityofboston/react-fleet';
import { makeFormData } from '@cityofboston/form-common';

import ApplicationForm from '../../client/ApplicationForm';
import ApplicationSubmitted from '../../client/ApplicationSubmitted';
import {
  NextContext,
  GtagSiteAnalytics,
  ScreenReaderSupport,
  getParam,
} from '@cityofboston/next-client-common';
import { IncomingMessage } from 'http';
import { Formik, FormikActions } from 'formik';
import { ApplyFormValues, applyFormSchema } from '../../lib/validationSchema';

interface Props {
  commissions: Commission[];
  commissionID?: string;
  testSubmittedPage?: boolean;
}

interface State {
  applicationSubmitted: boolean;
  submissionError: boolean;
}

export default class ApplyPage extends React.Component<Props, State> {
  private screenReaderSupport = new ScreenReaderSupport();

  constructor(props: Props) {
    super(props);

    this.state = {
      applicationSubmitted: !!props.testSubmittedPage,
      submissionError: false,
    };
  }

  static async getInitialProps({
    query: { commissionID },
  }: NextContext<IncomingMessage>): Promise<Props> {
    const commissions = await fetchCommissions();
    commissions.sort((current, next) => current.name.localeCompare(next.name));

    return {
      commissions,
      commissionID: getParam(commissionID),
    };
  }

  componentDidMount() {
    this.screenReaderSupport.attach();
  }

  componentWillUnmount() {
    this.screenReaderSupport.detach();
  }

  handleSubmit = async (
    values: ApplyFormValues,
    { setSubmitting }: FormikActions<ApplyFormValues>
  ) => {
    const siteAnalytics = new GtagSiteAnalytics();

    this.setState({
      applicationSubmitted: false,
      submissionError: false,
    });

    const data = makeFormData(values);

    try {
      siteAnalytics.sendEvent('submit', {
        category: 'Application',
        value: values.commissionIds.length,
      });

      const resp = await fetch('/commissions/submit', {
        method: 'POST',
        body: data,
      });

      if (!resp.ok) {
        throw new Error(`Got ${resp.status} response to apply`);
      }

      // Ensure page is not scrolled after application is submitted.
      this.setState({ applicationSubmitted: true }, () => scrollTo(0, 0));

      siteAnalytics.sendEvent('success', {
        category: 'Application',
      });

      // this.screenReaderSupport.announce('Your application has been submitted');
    } catch (e) {
      this.setState({ submissionError: true });

      const Rollbar = (window as any).Rollbar;
      if (Rollbar) {
        Rollbar.error(e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  render() {
    const { commissions, commissionID } = this.props;

    const initialFormValues: ApplyFormValues = {
      firstName: '',
      middleName: '',
      lastName: '',
      streetAddress: '',
      unit: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      confirmEmail: '',
      commissionIds: commissionID ? [commissionID] : [],
      degreeAttained: '',
      educationalInstitution: '',
      otherInformation: '',
      coverLetter: null,
      resume: null,
    };

    return (
      <AppLayout>
        <Head>
          <title>Apply for a Board or Commission | Boston.gov</title>
        </Head>

        <div className="mn ">
          <div className="b-c b-c--ntp">
            {this.state.applicationSubmitted ? (
              <ApplicationSubmitted />
            ) : (
              <Formik
                initialValues={initialFormValues}
                validationSchema={applyFormSchema}
                onSubmit={this.handleSubmit}
                render={formikProps => (
                  <ApplicationForm
                    {...formikProps}
                    commissions={commissions}
                    submissionError={this.state.submissionError}
                    clearSubmissionError={() =>
                      this.setState({ submissionError: false })
                    }
                  />
                )}
              />
            )}
          </div>
        </div>
      </AppLayout>
    );
  }
}
