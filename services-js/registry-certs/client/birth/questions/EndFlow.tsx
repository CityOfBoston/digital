import React from 'react';

import { YesNoUnknownAnswer } from '../QuestionsFlow';

interface Props {
  forSelf: boolean | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  bornInBoston: YesNoUnknownAnswer;
  parentsMarried: YesNoUnknownAnswer;
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
      quantity: 0,
      canProceed:
        props.bornInBoston === 'yes' || props.parentsLivedInBoston === 'yes',
    };
  }

  // todo
  // private handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  //   this.setState({ quantity: +event.target.value });
  // };

  public render() {
    return (
      <>
        {this.state.canProceed ? (
          // Request Summary:
          <div>
            {/* todo */}
            [[ summary of provided information; select number of copies to
            order; order breakdown and pricing ]] [[ back button ]] [[ start
            over button ]] [[ enter checkout workflow ]]
          </div>
        ) : (
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
          </>
        )}
      </>
    );
  }
}
