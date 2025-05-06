/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import {
  SANS,
  SERIF,
  CHARLES_BLUE,
  GRAY_400,
  AddRemoveRadioBtn,
  MEDIA_SMALL_MAX,
} from '@cityofboston/react-fleet';

interface Props {
  action: 'add' | 'remove';
  value: 0 | 1;
  onClickHandler: () => void;
}

export const CertMailTracking = (props: Props): JSX.Element => {
  const { action, value, onClickHandler } = props;

  return (
    <div css={TRACKING_STYLING}>
      {/* <h1>Need A Tracking Number?</h1> */}

      <div className="row">
        <div className="col">
          <h1>Need A Tracking Number?</h1>
          You can add <span className={`bold`}>USPS Tracking®</span> services
          for an additional fee of $5.00. After your purchase the Registry will
          follow-up with a tracking number.
        </div>

        <div className="col">
          <AddRemoveRadioBtn
            labels={['Add', 'Remove']}
            name={`CC_AddRemove`}
            id={`checkoutAddRemove`}
            action={action}
            value={value}
            onClickHandler={onClickHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default CertMailTracking;

const TRACKING_STYLING = css`
  color: ${CHARLES_BLUE};
  font-family: ${SERIF};
  font-size: 18px;
  font-weight: normal;
  line-height: 1.5em;
  // margin-top: 2rem;
  // padding: 2rem 0 2rem;
  padding: 1rem 0 1.5rem 0;
  border-color: ${GRAY_400};
  border-top-width: 1px;
  border-top-style: solid;
  border-bottom-width: 1px;
  border-bottom-style: solid;

  h1 {
    font-family: ${SANS};
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
  }

  span.bold {
    font-weight: 700;
  }

  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .col:first-of-type {
      padding-top: 0.75rem;
      max-width: 75%;
    }
  }

  ${MEDIA_SMALL_MAX} {
    .row {
      .col:first-of-type {
        padding-top: 0.75rem;
        max-width: 85%;
      }
    }
  }
`;
