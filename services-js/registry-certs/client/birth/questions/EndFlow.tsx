import React from 'react';

import { YesNoUnknownAnswer } from '../QuestionsFlow';
// import CostSummary from '../../common/CostSummary';

interface Props {
  forSelf: boolean | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  bornInBoston: YesNoUnknownAnswer;
  parentsLivedInBoston?: YesNoUnknownAnswer;

  handleUserReset: () => void;
  handleStepBack: () => void;
}

interface State {
  quantity: number;
  canProceed: boolean;
}

export default class EndFlow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      quantity: 1,
      canProceed:
        props.bornInBoston === 'yes' || props.parentsLivedInBoston === 'yes',
    };
  }

  // todo
  private handleQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ quantity: +event.target.value });
  };

  public render() {
    return (
      <>
        {this.state.canProceed ? (
          // Request Summary:
          <div>
            {this.props.firstName} {this.props.lastName}{' '}
            {this.props.dateOfBirth}
            <input type="number" onChange={this.handleQuantityChange} />
            {/*<CostSummary*/}
            {/*cart={{ size: this.state.quantity }}*/}
            {/*serviceFeeType="CREDIT"*/}
            {/*allowServiceFeeTypeChoice*/}
            {/*/>*/}
            <button type="button" onClick={this.props.handleStepBack}>
              Go back
            </button>
            <button type="button" onClick={this.props.handleUserReset}>
              Start over
            </button>
            <button type="button">Checkout</button>
          </div>
        ) : (
          // Show if user specifies NO for both “born in Boston” and “parents lived in Boston” questions.
          <>
            <p>
              We only have records for people who were born in the City of
              Boston, or whose parents lived in Boston at the time of their
              birth.
            </p>

            <p>
              You can contact the{' '}
              <a href="https://www.mass.gov/orgs/registry-of-vital-records-and-statistics">
                Massachusetts Registry of Vital Records and Statistics
              </a>{' '}
              to request a birth record for anyone born in the Commonwealth.
            </p>

            <button type="button" onClick={this.props.handleStepBack}>
              Go back
            </button>
            <button type="button" onClick={this.props.handleUserReset}>
              Start over
            </button>
          </>
        )}
      </>
    );
  }
}
