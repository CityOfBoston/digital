import React from 'react';
import Head from 'next/head';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

import { PUBLIC_CSS_URL, StatusModal } from '@cityofboston/react-fleet';

import ApplicationForm from '../../client/ApplicationForm';
import ApplicationSubmitted from '../../client/ApplicationSubmitted';

interface Props {
  commissions: Commission[];
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

  static async getInitialProps(): Promise<Props> {
    const commissions = await fetchCommissions();

    return { commissions };
  }

  // handleSubmit = formData => {
  //   console.log(formData);
  // };

  render() {
    const { commissions } = this.props;

    const commissionsWithoutOpenSeats = commissions
      .filter(commission => commission.openSeats === 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    const commissionsWithOpenSeats = commissions
      .filter(commission => commission.openSeats > 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <div className="b b-c">
          {this.state.applicationSubmitted ? (
            <ApplicationSubmitted error={this.state.submissionError} />
          ) : (
            <ApplicationForm
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
      </div>
    );
  }
}
