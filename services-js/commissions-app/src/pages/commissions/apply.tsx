import React from 'react';
import Head from 'next/head';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

import { AppLayout } from '@cityofboston/react-fleet';

import ApplicationForm from '../../client/ApplicationForm';
import ApplicationSubmitted from '../../client/ApplicationSubmitted';
import {
  NextContext,
  GtagSiteAnalytics,
} from '@cityofboston/next-client-common';
import { IncomingMessage } from 'http';
import { Formik } from 'formik';
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
  // We want the HTML <form> element directly for submitting, so we can easily
  // build a FormData object out of it. This is important for sending the
  // uploaded file data along.
  private formRef = React.createRef<HTMLFormElement>();

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

    return { commissions, commissionID };
  }

  handleSubmit = async () => {
    const siteAnalytics = new GtagSiteAnalytics();

    const form = this.formRef.current;
    if (!form) {
      return;
    }

    this.setState({
      applicationSubmitted: false,
      submissionError: false,
    });

    // This will include the uploaded files
    const data = new FormData(form);

    try {
      siteAnalytics.sendEvent('submit', {
        category: 'Application',
        // We wish we could use FormData#getAll here but it’s not widely
        // supported and can’t be polyfilled.
        value: form.querySelectorAll('input:checked[name=commissionIds]')
          .length,
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
    } catch (e) {
      this.setState({ submissionError: true });

      const Rollbar = (window as any).Rollbar;
      Rollbar.error(e);
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
                onSubmit={async (_, { setSubmitting }) => {
                  try {
                    // handleSubmit reads directly from the <form>, so we
                    // don’t pass the current values.
                    await this.handleSubmit();
                  } finally {
                    setSubmitting(false);
                  }
                }}
                render={formikProps => (
                  <ApplicationForm
                    {...formikProps}
                    commissions={commissions}
                    formRef={this.formRef}
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
