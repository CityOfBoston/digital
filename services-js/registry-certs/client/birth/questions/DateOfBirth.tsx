import React from 'react';
import { css } from 'emotion';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

import { researchFeeDisclosureText } from '../../common/FeeDisclosures';

interface Props {
  forSelf: boolean | null;
  firstName: string;
  birthDate: string;

  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  birthDate: string;
}

// todo: this component will be a datepicker
export default class DateOfBirth extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      birthDate: props.birthDate,
    };
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ birthDate: event.target.value });
  };

  private handleEnterKeypress = (event: React.KeyboardEvent): void => {
    const key = event.key || event.keyCode;

    if ((key === 'Enter' || key === 13) && this.state.birthDate.length) {
      this.props.handleProceed(this.state);
    }
  };

  public render() {
    const { forSelf, firstName } = this.props;

    return (
      <>
        <QuestionComponent
          handleStepBack={this.props.handleStepBack}
          handleProceed={() => this.props.handleProceed(this.state)}
          allowProceed={this.state.birthDate.length > 0}
        >
          <FieldsetComponent
            legendText={
              <h2>When {forSelf ? 'were you' : `was ${firstName}`} born?</h2>
            }
          >
            <TextInput
              label="Date of Birth"
              name="dateOfBirth"
              onChange={this.handleChange}
              onKeyDown={this.handleEnterKeypress}
              className={TEXT_FIELD_STYLING}
            />
          </FieldsetComponent>
        </QuestionComponent>

        <aside className="m-t500">
          <p>
            Are you searching for a newborn’s record? You won’t be able to
            request a newborn’s birth certificate right away. It will be ready
            within 3 weeks after the parent(s) signed paperwork at the hospital.
          </p>

          {/* todo: only show if selected date is prior to 1870? */}
          <p>{researchFeeDisclosureText()}</p>
        </aside>
      </>
    );
  }
}

const TEXT_FIELD_STYLING = css({
  label: {
    textAlign: 'left',
  },
});
