import React from 'react';
import { css } from 'emotion';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

interface Props {
  forSelf: boolean | null;
  firstName: string;
  dateOfBirth?: string;

  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  dateOfBirth: string;
}

export default class DateOfBirth extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dateOfBirth: props.dateOfBirth || '',
    };
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ dateOfBirth: event.target.value });
  };

  private handleEnterKeypress = (event: React.KeyboardEvent): void => {
    const key = event.key || event.keyCode;

    if ((key === 'Enter' || key === 13) && this.state.dateOfBirth.length) {
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
          allowProceed={this.state.dateOfBirth.length > 0}
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
