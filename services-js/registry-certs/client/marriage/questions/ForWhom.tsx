/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent, ReactChild } from 'react';

import { observer } from 'mobx-react';

import RadioItemComponent from '../../common/question-components/RadioItemComponent';
import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import RelatedIcon from '../../common/icons/RelatedIcon';

import { Relation } from '../../types';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import {
  HOW_RELATED_CONTAINER_STYLING,
  SECTION_HEADING_STYLING,
  RADIOGROUP_STYLING,
} from '../../common/question-components/styling';

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
}

/**
 * Initial question of the workflow. If the user is not requesting their
 * own record, the howRelated question is also asked.
 *
 * Copied from Birth’s forWhom question, with some changes to howRelated options
 */
@observer
export default class ForWhom extends Component<Props> {
  public static isComplete(
    marriageCertificateRequest: MarriageCertificateRequest
  ): boolean {
    const {
      forSelf,
      howRelated,
    } = marriageCertificateRequest.requestInformation;
    return !!(forSelf === true || howRelated);
  }

  private handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { marriageCertificateRequest } = this.props;
    marriageCertificateRequest.answerQuestion({
      [ev.currentTarget.name]: ev.currentTarget.value,
    });
  };

  private handleBooleanChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { marriageCertificateRequest } = this.props;
    marriageCertificateRequest.answerQuestion({
      [ev.currentTarget.name]: ev.currentTarget.value === 'true',
    });
  };

  private relationQuestion(
    answerValue: Relation,
    questionDisplayText: string
  ): ReactChild {
    const {
      requestInformation: { howRelated },
    } = this.props.marriageCertificateRequest;

    return (
      <RadioItemComponent
        questionName="howRelated"
        questionValue={howRelated}
        itemValue={answerValue}
        labelText={questionDisplayText}
        handleChange={this.handleChange}
      >
        <RelatedIcon name={answerValue} />
      </RadioItemComponent>
    );
  }

  public render() {
    const { marriageCertificateRequest, handleProceed } = this.props;
    const { forSelf } = marriageCertificateRequest.requestInformation;

    const forSelfValue: string = forSelf === null ? '' : forSelf.toString();

    return (
      <QuestionComponent
        handleProceed={handleProceed}
        allowProceed={ForWhom.isComplete(marriageCertificateRequest)}
      >
        <FieldsetComponent
          legendText={
            <h2 id="forSelf" css={SECTION_HEADING_STYLING}>
              Whose marriage certificate are you ordering?
            </h2>
          }
        >
          <div
            role="radiogroup"
            aria-labelledby="forSelf"
            css={RADIOGROUP_STYLING}
          >
            <RadioItemComponent
              questionName="forSelf"
              questionValue={forSelfValue}
              itemValue="true"
              labelText="Mine"
              handleChange={this.handleBooleanChange}
            >
              <RelatedIcon name="myself" />
            </RadioItemComponent>

            <RadioItemComponent
              questionName="forSelf"
              questionValue={forSelfValue}
              itemValue="false"
              labelText="Someone else’s"
              handleChange={this.handleBooleanChange}
            >
              <RelatedIcon name="someoneElse" />
            </RadioItemComponent>
          </div>
        </FieldsetComponent>

        {forSelf === false && (
          <FieldsetComponent
            legendText={
              <h3 id="howRelated" css={SECTION_HEADING_STYLING}>
                I’m ordering the marriage certificate of my…
              </h3>
            }
          >
            <div
              role="radiogroup"
              aria-labelledby="howRelated"
              css={HOW_RELATED_CONTAINER_STYLING}
            >
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
