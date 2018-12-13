import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

import { NAME_FIELDS_CONTAINER_STYLING } from './styling';

interface Props {
  firstName?: string;
  lastName?: string;
  altSpelling?: string;

  forSelf: boolean | null;
  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  firstName: string;
  lastName: string;
  altSpelling: string;
}

export default class NameOnRecord extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      firstName: props.firstName || '',
      lastName: props.lastName || '',
      altSpelling: props.altSpelling || '',
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
    const { forSelf } = this.props;

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
            legendText={
              <h2>What was {forSelf ? 'your' : 'their'} name at birth?</h2>
            }
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

            <div className="m-t300">
              <h3>
                Is there an alternative spelling to {forSelf ? 'your' : 'their'}{' '}
                name?
              </h3>

              <TextInput
                style={{ textAlign: 'left' }}
                label="Alternative spelling(s)"
                name="altSpelling"
                defaultValue={this.state.lastName}
                onChange={this.handleChange}
                onKeyDown={this.handleEnterKeypress}
              />
            </div>
          </FieldsetComponent>
        </QuestionComponent>

        <aside className="m-t500">
          <p>
            If {forSelf ? 'you' : 'they'} changed {forSelf ? 'your' : 'their'}{' '}
            name at some point, please use the name {forSelf ? 'you' : 'they'}{' '}
            were given at birth. If {forSelf ? 'you' : 'they'} were adopted, use{' '}
            {forSelf ? 'your' : 'their'} post-adoption name.
          </p>
        </aside>
      </>
    );
  }
}
