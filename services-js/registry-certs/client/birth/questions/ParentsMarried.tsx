import React from 'react';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../types';

interface Props {
  forSelf: boolean | null;
  firstName: string;
  parentsMarried?: YesNoUnknownAnswer;

  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  parentsMarried: YesNoUnknownAnswer;
}

export default class ParentsMarried extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      parentsMarried: props.parentsMarried || '',
    };
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      [event.target.name]: event.target.value,
    } as any);
  };

  public render() {
    const { forSelf, firstName } = this.props;
    const parentsNotMarried =
      this.state.parentsMarried && this.state.parentsMarried !== 'yes';

    return (
      <>
        <QuestionComponent
          handleProceed={() => this.props.handleProceed(this.state)}
          handleStepBack={this.props.handleStepBack}
          allowProceed={this.state.parentsMarried.length > 0}
        >
          <FieldsetComponent
            legendText={
              <h2 id="parentsMarried">
                Were {forSelf ? 'your' : `${firstName}’s`} parents married at
                the time of {forSelf ? 'your' : 'their'} birth?
              </h2>
            }
          >
            <YesNoUnsureComponent
              questionName="parentsMarried"
              questionValue={this.state.parentsMarried}
              handleChange={this.handleChange}
            />
          </FieldsetComponent>
        </QuestionComponent>

        {parentsNotMarried && (
          <aside className="m-t500">
            <p>{forSelf ? selfInfo() : otherInfo()}</p>
          </aside>
        )}
      </>
    );
  }
}

const selfInfo = () => (
  <>
    If your parents weren’t married at the time of your birth, your record is
    restricted.{' '}
    <strong>
      You will need to provide a valid form of identification (i.e. driver’s
      license, state ID, military ID, or passport) later in this process
    </strong>.
  </>
);

const otherInfo = () => (
  <>
    If their parents weren’t married at the time of the birth, the record is
    restricted and can only be requested by the people listed on the record.{' '}
    <strong>
      If you are listed on the record, you will need to provide a valid form of
      identification (i.e. driver’s license, state ID, military ID, or passport)
      to get a copy
    </strong>. If you are not listed on the record, you will not be able to get
    a copy. Your request will be canceled and your card will not be charged.
  </>
);
