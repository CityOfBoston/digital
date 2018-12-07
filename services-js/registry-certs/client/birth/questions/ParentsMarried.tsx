import React from 'react';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../QuestionsFlow';

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

    return (
      <>
        <QuestionComponent
          handleProceed={() => this.props.handleProceed(this.state)}
          handleStepBack={this.props.handleStepBack}
          allowProceed={this.state.parentsMarried.length > 0}
        >
          <FieldsetComponent
            legendText={
              <h2>
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

        <aside>
          <p>
            If {forSelf ? 'your' : 'the'} parents weren’t married at the time{' '}
            {forSelf ? 'you were' : 'the baby was'} born, the birth certificate
            becomes <strong>restricted</strong>. Restricted records can only be
            requested by the person whose birth certificate this is, or their
            attorney, parent, guardian, or conservator, proper judicial order,
            or a person whose official duties, in the opinion of the city clerk
            or the commissioner of public health, as the case may be, entitle
            them to the information contained therein.
          </p>
        </aside>
      </>
    );
  }
}
