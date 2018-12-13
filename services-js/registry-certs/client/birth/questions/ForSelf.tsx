import React from 'react';
import { css } from 'emotion';

import { CHARLES_BLUE } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import RadioItemComponent from './RadioItemComponent';

import { Relation } from '../types';

import { RADIOGROUP_STYLING, RADIOGROUP_UNBORDERED_STYLING } from './styling';

interface Props {
  forSelf?: boolean;
  howRelated?: Relation;
  handleProceed: (answers: State) => void;
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
        <FieldsetComponent
          legendText={
            <h2 id="forSelf">Who are you ordering a birth certificate for?</h2>
          }
        >
          <div
            role="radiogroup"
            aria-labelledby="forSelf"
            className={RADIOGROUP_STYLING}
          >
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
          <FieldsetComponent
            legendText={<h3 id="howRelated">Is this your…</h3>}
          >
            <div
              role="radiogroup"
              aria-labelledby="howRelated"
              className={`${RADIOGROUP_UNBORDERED_STYLING} ${HOW_RELATED_CONTAINER_STYLING}`}
            >
              {this.relationQuestion('spouse', 'Spouse')}

              {this.relationQuestion('child', 'Child')}

              {this.relationQuestion('parent', 'Parent')}

              {this.relationQuestion('familyMember', 'Family member')}

              {this.relationQuestion('friend', 'Friend')}

              {this.relationQuestion('client', 'Client')}
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
    flex: '1 0 33%',
  },
});
