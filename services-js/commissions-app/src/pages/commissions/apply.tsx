import React from 'react';
import Head from 'next/head';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

import { AppLayout, StatusModal } from '@cityofboston/react-fleet';

import ApplicationForm from '../../client/ApplicationForm';
import ApplicationSubmitted from '../../client/ApplicationSubmitted';
import { NextContext } from '@cityofboston/next-client-common';
import { IncomingMessage } from 'http';

interface Props {
  commissions: Commission[];
  commissionID?: string;
}

interface State {
  isSubmitting: boolean;
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
      isSubmitting: false,
      applicationSubmitted: false,
      submissionError: false,
    };
  }

  static async getInitialProps({
    query: { commissionID },
  }: NextContext<IncomingMessage>): Promise<Props> {
    const commissions = await fetchCommissions();

    return { commissions, commissionID };
  }

  handleSubmit = async () => {
    const form = this.formRef.current;
    if (!form) {
      return;
    }

    this.setState({
      isSubmitting: true,
      submissionError: false,
    });

    // This will include the uploaded files
    const data = new FormData(form);

    try {
      const resp = await fetch('/commissions/submit', {
        method: 'POST',
        body: data,
      });

      if (resp.ok) {
        this.setState({ applicationSubmitted: true });
      } else {
        this.setState({ submissionError: true });
      }
    } catch (e) {
      this.setState({
        submissionError: true,
      });
    } finally {
      this.setState({
        isSubmitting: false,
      });
    }
  };

  render() {
    const { commissions, commissionID } = this.props;

    const commissionsWithoutOpenSeats = commissions
      .filter(commission => commission.openSeats === 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    const commissionsWithOpenSeats = commissions
      .filter(commission => commission.openSeats > 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    return (
      <AppLayout>
        <Head>
          <title>Apply for a Board or Commission | Boston.gov</title>
        </Head>

        <div className="mn">
          <div className="b-c b-c--ntp">
            {this.state.applicationSubmitted ? (
              <ApplicationSubmitted error={this.state.submissionError} />
            ) : (
              <ApplicationForm
                selectedCommissionId={commissionID || null}
                commissionsWithOpenSeats={commissionsWithOpenSeats}
                commissionsWithoutOpenSeats={commissionsWithoutOpenSeats}
                formRef={this.formRef}
                handleSubmit={this.handleSubmit}
              />
            )}

            {this.state.isSubmitting && (
              <StatusModal message="Submitting application…">
                <div className="t--info m-t300">
                  Please be patient and don’t refresh your browser. This might
                  take a bit.
                </div>
              </StatusModal>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }
}
