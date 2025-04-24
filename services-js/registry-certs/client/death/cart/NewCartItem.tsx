/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import {
  CHARLES_BLUE,
  SANS,
  SERIF,
  QuantityDropdown,
  AddRemoveRadioBtn,
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
    usage = 'summary',
    quantity,
    handleQuantityChange,
    handleRemove,
  } = props;
  const { id, firstName, lastName, age, deathDate } = props.cert;
  // console.log(`$CartItem(props.cert): `, props.cert);

  return (
    <div css={CARTITEM}>
      <div className={`col`}>
        <div className={`row name main`}>
          <label>
            {firstName} {lastName ? lastName : ''}
          </label>
        </div>

        {deathDate && typeof deathDate === 'string' && deathDate.length > 0 && (
          <div className={`row main`}>
            <label>
              Date of {certificateTypeStr}: <span>{deathDate}</span>
            </label>
          </div>
        )}

        {age &&
          typeof age === 'string' &&
          age.length > 0 &&
          certificateTypeStr === 'death' && (
            <div className={`row main`}>
              <label>
                Age:{' '}
                <span>
                  {age}
                  {!age.includes('days') && !age.includes('yr') ? `yrs` : ''}
                </span>
              </label>
            </div>
          )}
        {usage === 'summary' && (
          <div className={`row certTypeName main`}>
            <label>
              <span>{certificateTypeStr} certificate</span> (Paper Copy)
            </label>
          </div>
        )}
      </div>

      {quantity && quantity > 0 && (
        <div className={`col qty`}>
          <div className={`row`}>
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
    font-size: 1.125em;
    font-weight: 600;

    span {
      font-weight: normal;
    }
  }

  > label:nth-of-type(1) {
    font-family: ${SANS};
    font-size: 50px;
    background: red;
    text-transform: uppercase;
  }
`;
