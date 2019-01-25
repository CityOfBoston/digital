import React from 'react';

import RadioItemComponent from '../RadioItemComponent';
import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import RelatedIcon from '../icons/RelatedIcon';

import { Relation } from '../../types';

import {
  HOW_RELATED_CONTAINER_STYLING,
  SECTION_HEADING_STYLING,
  RADIOGROUP_STYLING,
  RADIOITEM_STYLING,
} from '../styling';

interface Props {
  forSelf: boolean | null;
  howRelated?: Relation;

  handleStepCompletion: (isStepComplete: boolean) => void;
  handleProceed: (answers: State) => void;
}

interface State {
  forSelf: string;
  howRelated?: Relation;
}

/**
 * Initial question of the workflow. If the user is not requesting their
 * own record, the howRelated question is also asked.
 */
export default class ForWhom extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      forSelf: props.forSelf !== null ? props.forSelf.toString() : '',
      howRelated: props.howRelated,
    };

    props.handleStepCompletion(!!(props.forSelf === true || props.howRelated));
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState(
      {
        [event.target.name]: event.target.value,
      } as any,
      () => {
        this.props.handleStepCompletion(this.allowProceed());
      }
    );
  };

  // Shows progress for this step.
  private allowProceed(): boolean {
    return !!(this.state.forSelf === 'true' || this.state.howRelated);
  }

  private relationQuestion(
    answerValue: Relation,
    questionDisplayText: string
  ): React.ReactChild {
    return (
      <RadioItemComponent
        questionName="howRelated"
        questionValue={this.state.howRelated}
        itemValue={answerValue}
        labelText={questionDisplayText}
        className={RADIOITEM_STYLING}
        handleChange={this.handleChange}
      >
        <RelatedIcon name={answerValue} />
      </RadioItemComponent>
    );
  }

  public render() {
    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        allowProceed={this.allowProceed()}
      >
        <FieldsetComponent
          legendText={
            <h2 id="forSelf" className={SECTION_HEADING_STYLING}>
              Who are you ordering a birth certificate for?
            </h2>
          }
        >
          <div
            role="radiogroup"
            aria-labelledby="forSelf"
            className={RADIOGROUP_STYLING}
          >
            <RadioItemComponent
              questionName="forSelf"
              questionValue={this.state.forSelf}
              itemValue="true"
              labelText="Myself"
              className={RADIOITEM_STYLING}
              handleChange={this.handleChange}
            >
              <RelatedIcon name="myself" />
            </RadioItemComponent>

            <RadioItemComponent
              questionName="forSelf"
              questionValue={this.state.forSelf}
              itemValue="false"
              labelText="Someone else"
              className={RADIOITEM_STYLING}
              handleChange={this.handleChange}
            >
              <RelatedIcon name="someoneElse" />
            </RadioItemComponent>
          </div>
        </FieldsetComponent>

        {this.state.forSelf === 'false' && (
          <FieldsetComponent
            legendText={
              <h3 id="howRelated" className={SECTION_HEADING_STYLING}>
                Is it for your…
              </h3>
            }
          >
            <div
              role="radiogroup"
              aria-labelledby="howRelated"
              className={HOW_RELATED_CONTAINER_STYLING}
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
