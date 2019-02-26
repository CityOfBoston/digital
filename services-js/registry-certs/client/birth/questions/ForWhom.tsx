import React, { MouseEvent } from 'react';
import { observer } from 'mobx-react';

import RadioItemComponent from '../components/RadioItemComponent';
import QuestionComponent from '../components/QuestionComponent';
import FieldsetComponent from '../components/FieldsetComponent';
import RelatedIcon from '../icons/RelatedIcon';

import { Relation } from '../../types';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import {
  HOW_RELATED_CONTAINER_STYLING,
  SECTION_HEADING_STYLING,
  RADIOGROUP_STYLING,
  RADIOITEM_STYLING,
} from '../styling';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
}

/**
 * Initial question of the workflow. If the user is not requesting their
 * own record, the howRelated question is also asked.
 */
@observer
export default class ForWhom extends React.Component<Props> {
  public static isComplete(
    birthCertificateRequest: BirthCertificateRequest
  ): boolean {
    const { forSelf, howRelated } = birthCertificateRequest.requestInformation;
    return !!(forSelf === true || howRelated);
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { birthCertificateRequest } = this.props;
    birthCertificateRequest.answerQuestion({
      [ev.currentTarget.name]: ev.currentTarget.value,
    });
  };

  private handleBooleanChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { birthCertificateRequest } = this.props;
    birthCertificateRequest.answerQuestion({
      [ev.currentTarget.name]: ev.currentTarget.value === 'true',
    });
  };

  private relationQuestion(
    answerValue: Relation,
    questionDisplayText: string
  ): React.ReactChild {
    const {
      requestInformation: { howRelated },
    } = this.props.birthCertificateRequest;

    return (
      <RadioItemComponent
        questionName="howRelated"
        questionValue={howRelated}
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
    const { birthCertificateRequest, handleProceed } = this.props;
    const { forSelf } = birthCertificateRequest.requestInformation;

    const forSelfValue: string = forSelf === null ? '' : forSelf.toString();

    return (
      <QuestionComponent
        handleProceed={handleProceed}
        allowProceed={ForWhom.isComplete(birthCertificateRequest)}
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
              questionValue={forSelfValue}
              itemValue="true"
              labelText="Myself"
              className={RADIOITEM_STYLING}
              handleChange={this.handleBooleanChange}
            >
              <RelatedIcon name="myself" />
            </RadioItemComponent>

            <RadioItemComponent
              questionName="forSelf"
              questionValue={forSelfValue}
              itemValue="false"
              labelText="Someone else"
              className={RADIOITEM_STYLING}
              handleChange={this.handleBooleanChange}
            >
              <RelatedIcon name="someoneElse" />
            </RadioItemComponent>
          </div>
        </FieldsetComponent>

        {forSelf === false && (
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
