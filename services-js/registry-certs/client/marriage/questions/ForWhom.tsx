/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';

import { observer } from 'mobx-react';

import RadioItemComponent from '../../common/question-components/RadioItemComponent';
import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import RelatedIcon from '../../common/icons/RelatedIcon';
import ClientInstructionsContent from '../../common/question-components/ClientInstructionsContent';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import {
  NOTE_BOX_CLASSNAME,
  SECTION_HEADING_STYLING,
  RADIOGROUP_STYLING,
} from '../../common/question-components/styling';

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

    function startingValue(): Whom {
      const { forSelf } = props.marriageCertificateRequest.requestInformation;

      if (forSelf !== null) {
        return forSelf === true ? 'self' : 'other';
      } else {
        return null;
      }
    }

    this.state = {
      forWhom: startingValue(),
    };
  }

  public static isComplete(
    marriageCertificateRequest: MarriageCertificateRequest
  ): boolean {
    return marriageCertificateRequest.requestInformation.forSelf !== null;
  }

  private handleChange(forWhom: Whom) {
    this.setState({ forWhom });
  }

  public componentDidUpdate(
    _prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    const { forWhom } = this.state;

    if (prevState.forWhom !== forWhom) {
      const isClient = forWhom === 'client';

      this.props.marriageCertificateRequest.answerQuestion({
        forSelf: isClient ? null : forWhom === 'self',
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

          {forWhom === 'client' && (
            <div className={NOTE_BOX_CLASSNAME} css={WARNING_BOX_STYLING}>
              <ClientInstructionsContent certificateType="marriage" />
            </div>
          )}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}

const WARNING_BOX_STYLING = css({
  '> div': {
    marginTop: '-0.25rem',
  },
});
