// polyfill Array.find() for IE
import 'core-js/fn/array/find';

import React from 'react';
import Head from 'next/head';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

import {
  AppLayout,
  PUBLIC_CSS_URL,
  StatusModal,
} from '@cityofboston/react-fleet';

import ApplicationForm from '../../client/ApplicationForm';
import ApplicationSubmitted from '../../client/ApplicationSubmitted';

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
  constructor(props: Props) {
    super(props);

    this.state = {
      isSubmitting: false,
      applicationSubmitted: false,
      submissionError: false,
    };
  }

  static async getInitialProps({ query: commissionID }): Promise<Props> {
    const commissions = await fetchCommissions();

    return { commissions, commissionID };
  }

  // handleSubmit = formData => {
  //   console.log(formData);
  // };

  render() {
    const { commissions, commissionID } = this.props;

    const commissionsWithoutOpenSeats = commissions
      .filter(commission => commission.openSeats === 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    const commissionsWithOpenSeats = commissions
      .filter(commission => commission.openSeats > 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    // if a CommissionID has been passed as a prop, return the Commission
    const preselectedCommission: Commission | undefined = commissions.find(
      // @ts-ignore
      commission => commission.id === +commissionID
    );

    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <AppLayout>
          <div className="b-c b-c--ntp">
            {this.state.applicationSubmitted ? (
              <ApplicationSubmitted error={this.state.submissionError} />
            ) : (
              <ApplicationForm
                selectedCommission={preselectedCommission}
                commissionsWithOpenSeats={commissionsWithOpenSeats}
                commissionsWithoutOpenSeats={commissionsWithoutOpenSeats}
                handleSubmit={() => {}}
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
        </AppLayout>
      </div>
    );
  }
}
