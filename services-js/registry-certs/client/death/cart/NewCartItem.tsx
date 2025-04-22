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
  cert: any;
  quantity: number;
  handleQuantityChange: any;
  handleRemove: (() => void) & {};
}

export const $CartItem = (props: Props) => {
  const { quantity, handleQuantityChange, handleRemove } = props;
  const { id, firstName, lastName, age, deathDate } = props.cert;

  return (
    <div css={CARTITEM}>
      <div className={`col`}>
        <div className={`row name`}>
          <label>
            {firstName} {lastName ? lastName : ''}
          </label>
        </div>

        {deathDate && typeof deathDate === 'string' && deathDate.length > 0 && (
          <div className={`row`}>
            <label>
              Date of death: <span>{deathDate}</span>
            </label>
          </div>
        )}

        {age && typeof age === 'string' && age.length > 0 && (
          <div className={`row`}>
            <label>
              Age: <span>{age}</span>
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

    .col {
      background: transparent;
    }
  }

  .name label {
    font-family: ${SANS};
    margin-bottom: 0.25rem;
  }

  .qty label {
    font-weight: normal;
  }

  label {
    color: ${CHARLES_BLUE};
    font-family: ${SERIF};
    font-size: 1.125em;
    font-weight: 600;
    // text-transform: lowercase;

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
