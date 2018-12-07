import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

import { NAME_FIELDS_CONTAINER_STYLING } from './styling';

interface Props {
  firstName?: string;
  lastName?: string;

  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  firstName: string;
  lastName: string;
}

export default class NameOnRecord extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      firstName: props.firstName || '',
      lastName: props.lastName || '',
    };
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      [event.target.name]: event.target.value,
    } as any);
  };

  private handleEnterKeypress = (event: React.KeyboardEvent): void => {
    const key = event.key || event.keyCode;

    if (
      (key === 'Enter' || key === 13) &&
      (this.state.firstName.length && this.state.lastName.length)
    ) {
      this.props.handleProceed(this.state);
    }
  };

  public render() {
    return (
      <>
        <QuestionComponent
          handleProceed={() => this.props.handleProceed(this.state)}
          handleStepBack={this.props.handleStepBack}
          allowProceed={
            !!(this.state.firstName.length && this.state.lastName.length)
          }
        >
          <FieldsetComponent
            legendText={<h2>What is the name on the birth record?</h2>}
          >
            <div className={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name="firstName"
                defaultValue={this.state.firstName}
                onChange={this.handleChange}
              />

              <TextInput
                label="Last Name"
                name="lastName"
                defaultValue={this.state.lastName}
                onChange={this.handleChange}
                onKeyDown={this.handleEnterKeypress}
              />
            </div>
          </FieldsetComponent>
        </QuestionComponent>

        <aside>
          <p>
            {/* todo: wording irt asking for name given at birth */}
            Please use the name you were given at birth. If you were adopted,
            please use your post-adoption name.
          </p>

          <p>
            Is there an alternative spelling of the name? Was the first name
            missing from the original birth record? Was there more than one last
            name on the record? Did they enter their married name instead of
            their birth name? Have they had a legal name change? Some birth
            records were registered more than a year after the birth so Registry
            staff has to search our books for the record.
          </p>
        </aside>
      </>
    );
  }
}
