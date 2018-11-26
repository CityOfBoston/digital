import React from 'react';

import { yesNoUnknownAnswer } from '../QuestionsFlow';
import AnswersSummary from '../AnswersSummary';

interface Props {
  forSelf: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  bornInBoston: yesNoUnknownAnswer;
  parentsMarried: yesNoUnknownAnswer;
  parentsLivedInBoston?: yesNoUnknownAnswer;
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

  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ quantity: +event.target.value });
  };

  render() {
    if (this.state.canProceed) {
      return (
        <>
          <AnswersSummary />

          {this.props.parentsMarried !== 'yes' && (
            <p>
              If {this.props.forSelf ? 'your' : 'the'} parents weren’t married
              at the time {this.props.forSelf ? 'you were' : 'the baby was'}{' '}
              born, the birth certificate becomes <strong>restricted</strong>.
              Restricted records can only be requested by the person whose birth
              certificate this is, or their attorney, parent, guardian, or
              conservator, proper judicial order, or a person whose official
              duties, in the opinion of the city clerk or the commissioner of
              public health, as the case may be, entitle them to the information
              contained therein.
            </p>
          )}
        </>
      );
    }

    return (
      <>
        <p>
          We only have records for people who were born in the City of Boston,
          or whose parents lived in Boston at the time of their birth.
        </p>

        <p>
          You can contact the{' '}
          <a href="https://www.mass.gov/orgs/registry-of-vital-records-and-statistics">
            Massachusetts Registry of Vital Records and Statistics
          </a>{' '}
          to request a birth record for anyone born in the Commonwealth.
        </p>
      </>
    );
  }
}
