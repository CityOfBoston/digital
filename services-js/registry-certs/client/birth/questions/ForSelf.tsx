import React from 'react';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import RadioItemComponent from './RadioItemComponent';

import { Relation } from '../QuestionsFlow';

import { RADIOGROUP_STYLING, RADIOGROUP_UNBORDERED_STYLING } from './styling';
import { css } from 'emotion';
import { CHARLES_BLUE } from '@cityofboston/react-fleet';

interface Props {
  forSelf?: boolean;
  howRelated?: Relation;
  handleProceed: (answers: Partial<State>) => void;
}

interface State {
  forSelf: string;
  howRelated?: Relation;
}

export default class ForSelf extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      forSelf: props.forSelf ? props.forSelf.toString() : '',
      howRelated: props.howRelated,
    };
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      [event.target.name]: event.target.value,
    } as any);
  };

  private relationQuestion(
    questionValue: Relation,
    questionDisplayText: string
  ) {
    return (
      <RadioItemComponent
        fieldName="howRelated"
        fieldValue={this.state.howRelated}
        itemValue={questionValue}
        labelText={questionDisplayText}
        handleChange={this.handleChange}
      />
    );
  }

  public render() {
    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        allowProceed={
          !!(this.state.forSelf === 'true' || this.state.howRelated)
        }
      >
        <FieldsetComponent legendText={<h2>Who is this for?</h2>}>
          <div className={RADIOGROUP_STYLING}>
            <RadioItemComponent
              fieldName="forSelf"
              fieldValue={this.state.forSelf}
              itemValue="true"
              labelText="Myself"
              handleChange={this.handleChange}
            />
            <RadioItemComponent
              fieldName="forSelf"
              fieldValue={this.state.forSelf}
              itemValue="false"
              labelText="Someone Else"
              handleChange={this.handleChange}
            />
          </div>
        </FieldsetComponent>

        {/*This question is only presented if the user is NOT requesting their own record.*/}
        {this.state.forSelf === 'false' && (
          <FieldsetComponent legendText={<h3>How are you related?</h3>}>
            <div
              className={`${RADIOGROUP_UNBORDERED_STYLING} ${HOW_RELATED_CONTAINER_STYLING}`}
            >
              {this.relationQuestion('parent', 'Parent')}

              {this.relationQuestion('grandparent', 'Grandparent')}

              {this.relationQuestion('sibling', 'Sibling')}

              {this.relationQuestion('spouse', 'Spouse')}

              {this.relationQuestion('friend', 'Friend')}

              {this.relationQuestion('attorney', 'Attorney')}

              {this.relationQuestion('guardian', 'Guardian')}

              {this.relationQuestion('other', 'Other')}
            </div>
          </FieldsetComponent>
        )}
      </QuestionComponent>
    );
  }
}

const HOW_RELATED_CONTAINER_STYLING = css({
  border: `1px solid ${CHARLES_BLUE}`,
  flexWrap: 'wrap',
  '> div': {
    border: 'inherit',
    flex: '1 0 25%',
  },
});
