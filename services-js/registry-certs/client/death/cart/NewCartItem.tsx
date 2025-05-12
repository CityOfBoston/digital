/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import {
  CHARLES_BLUE,
  SANS,
  SERIF,
  QuantityDropdown,
  AddRemoveRadioBtn,
  MEDIA_MEDIUM_MAX,
} from '@cityofboston/react-fleet';

interface Props {
  type: 'death' | 'birth' | 'marriage';
  usage?: 'summary' | 'accordion';
  cert: any;
  quantity: number;
  handleQuantityChange: any;
  handleRemove: (() => void) & {};
}

export const $CartItem = (props: Props) => {
  const {
    type: certificateTypeStr,
    // usage = 'summary',
    quantity,
    handleQuantityChange,
    handleRemove,
  } = props;
  const { id, firstName, lastName, age, deathDate, type } = props.cert;

  return (
    <div css={CARTITEM}>
      <div className={`col`}>
        {quantity && quantity > 0 && (
          <span className={`mobile__visible`}>
            <div className={`col`}>
              <QuantityDropdown
                id={`quantityDropDown__${id}`}
                label={`quantity_for_${id}`}
                handleQuantityChange={handleQuantityChange}
                quantity={quantity} // Quantity = [Input] && || [Selecte] value
                selectOptions={{ start: 1, total: 10 }}
              />
            </div>

            <AddRemoveRadioBtn
              labels={['Add', 'Remove']}
              name={`CC_AddRemove`}
              id={`checkoutAddRemove`}
              action={`remove`}
              value={1}
              onClickHandler={handleRemove}
            />
          </span>
        )}

        <span className={`name main`}>
          <label>
            {type === 'death' && <>Name:</>}
            {firstName} {lastName ? lastName : ''}
          </label>
        </span>
        <br />

        {deathDate && typeof deathDate === 'string' && deathDate.length > 0 && (
          <span className={`main`}>
            <label>
              Date of {certificateTypeStr}: <span>{deathDate}</span>
            </label>
          </span>
        )}
        <br />

        {age &&
          typeof age === 'string' &&
          age.length > 0 &&
          certificateTypeStr === 'death' && (
            <span className={`main`}>
              <label>
                Age:{' '}
                <span>
                  {age}
                  {!age.includes('days') && !age.includes('yr') ? `yrs` : ''}
                </span>
              </label>
            </span>
          )}

        {/* {!age && usage === 'summary' && (
          <span className={`certTypeName main`}>
            <label>
              <span>{certificateTypeStr} certificate</span> (Paper Copy with
              raised seal)
            </label>
          </span>
        )} */}
        <br />
      </div>

      {quantity && quantity > 0 && (
        <div className={`col qty`}>
          <div className={`row mobile`}>
            <div className={`col`}>
              <QuantityDropdown
                id={`quantityDropDown__${id}`}
                label={`quantity_for_${id}`}
                handleQuantityChange={handleQuantityChange}
                quantity={quantity} // Quantity = [Input] && || [Selecte] value
                selectOptions={{ start: 1, total: 10 }}
              />
            </div>

            <div className={`col`}>
              <AddRemoveRadioBtn
                labels={['Add', 'Remove']}
                name={`CC_AddRemove`}
                id={`checkoutAddRemove`}
                action={`remove`}
                value={1}
                onClickHandler={handleRemove}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default $CartItem;

const CARTITEM = css`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: ${CHARLES_BLUE};
  font-family: ${SERIF};
  font-size: 1.125em;
  margin-bottom: 1.5rem;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;

    .col {
      background: transparent;
    }
  }

  .main {
    margin-bottom: 0.25rem;
    line-height: 1.5em;
  }

  .name label {
    font-family: ${SANS};
    margin-bottom: 0.25rem;
  }

  .qty label,
  .certTypeName label {
    font-weight: normal;
  }

  .certTypeName label span {
    text-transform: capitalize;
  }

  label {
    color: ${CHARLES_BLUE};
    font-family: ${SERIF};
    font-size: 18px;
    font-weight: 600;

    span {
      font-weight: normal;
    }
  }

  > label:nth-of-type(1) {
    font-family: ${SANS};
    font-size: 50px;
    text-transform: uppercase;
  }

  .mobile__visible {
    display: none;
  }

  ${MEDIA_MEDIUM_MAX} {
    font-size: 16px;

    .mobile,
    .mobile__visible {
      display: flex;
      flex-direction: column;
      align-items: end;
      float: right;
    }

    .mobile {
      display: none;
    }
  }
`;
