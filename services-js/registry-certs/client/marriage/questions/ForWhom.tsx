/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';

import { observer } from 'mobx-react';

import RadioItemComponent from '../../common/question-components/RadioItemComponent';
import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import RelatedIcon from '../../common/icons/RelatedIcon';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import {
  SECTION_HEADING_STYLING,
  RADIOGROUP_STYLING,
} from '../../common/question-components/styling';
import { Relation } from '../../types';

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
}

type Whom = 'self' | 'other' | 'client' | null;

interface State {
  forWhom: Whom;
}

/**
 * Initial question of the workflow. Selecting “my client” displays
 * ClientInstructions, and prevents the user from proceeding.
 */
@observer
export default class ForWhom extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      forWhom: this.startingValue(),
    };
  }

  public static isComplete(
    marriageCertificateRequest: MarriageCertificateRequest
  ): boolean {
    return marriageCertificateRequest.requestInformation.forSelf !== null;
  }

  private startingValue(): Whom {
    const {
      forSelf,
    } = this.props.marriageCertificateRequest.requestInformation;

    if (forSelf === true) {
      return 'self';
    } else if (forSelf === false) {
      return 'other';
    }

    return null;
  }

  private handleChange(forWhom: Whom) {
    this.setState({ forWhom });
  }

  public componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    const { forWhom } = this.state;

    // Update answers in response to local state change.
    if (forWhom !== prevState.forWhom) {
      if (forWhom === 'self') {
        this.props.marriageCertificateRequest.answerQuestion({
          forSelf: true,
          howRelated: '',
        });
      } else {
        this.props.marriageCertificateRequest.answerQuestion({
          forSelf: false,
          howRelated: forWhom as Relation,
        });
      }
    }

    // Ensure value is reflected if it was previously provided.
    if (
      this.props.marriageCertificateRequest.requestInformation.forSelf !==
      prevProps.marriageCertificateRequest.requestInformation.forSelf
    ) {
      this.setState({
        forWhom: this.startingValue(),
      });
    }
  }

  public render() {
    const { marriageCertificateRequest, handleProceed } = this.props;
    const { forWhom } = this.state;

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
              questionValue={forWhom as string}
              itemValue="self"
              labelText="Mine"
              handleChange={() => this.handleChange('self')}
            >
              <RelatedIcon name="myself" />
            </RadioItemComponent>

            <RadioItemComponent
              questionName="forSelf"
              questionValue={forWhom as string}
              itemValue="other"
              labelText="Someone else’s"
              handleChange={() => this.handleChange('other')}
            >
              <RelatedIcon name="someoneElse" />
            </RadioItemComponent>

            <RadioItemComponent
              questionName="forSelf"
              questionValue={forWhom as string}
              itemValue="client"
              labelText="My client"
              handleChange={() => this.handleChange('client')}
            >
              <RelatedIcon name="client" />
            </RadioItemComponent>
          </div>
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
