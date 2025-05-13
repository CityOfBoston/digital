/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { capFirstLetterOfStr, getAgeFromDate } from '../../../utils/helpers';
import {
  CHARLES_BLUE,
  GRAY_100,
  MEDIA_SMALL_MAX,
  QuantityDropdown,
  SERIF,
} from '@cityofboston/react-fleet';

export type CertItemProps = {
  type: 'birth' | 'marriage' | 'death';
  quantity: number;
  showNameLabel: boolean;
  pending?: boolean;
  subinfo?: string;
  firstName?: string;
  lastName?: string;
  fullNames?: string;
  dateStr?: string;
  key?: string;
  handleQuantityChange?: (quantity: string | number | null) => void;
};

export const CertItem = (cert: CertItemProps) => {
  const {
    type,
    quantity = 1,
    fullNames = '',
    subinfo,
    dateStr,
    key = '1',
    handleQuantityChange = () => {},
  } = cert;
  let paperCopyLabel = `Certificate (Paper copy)`;
  let age = ``;

  if (dateStr && type === 'birth') {
    age = getAgeFromDate(dateStr.toString());
  }
  // console.log(`CertItem > cert: `, cert);

  return (
    <div css={CERTITEM_CSS}>
      <div className={`col`}>
        <span className={`mobile__visible`}>
          <div className={`col`}>
            <QuantityDropdown
              id={`quantityDropDown__${key}`}
              label={`quantity_for_${key}`}
              handleQuantityChange={handleQuantityChange}
              quantity={quantity}
              selectOptions={{ start: 1, total: 10 }}
            />
          </div>
        </span>

        {fullNames.length > 0 && (
          <div className={'name-row'}>
            <label>Name [xxx]: </label>
            <span>{fullNames}</span>
          </div>
        )}

        {subinfo && subinfo.length > 0 && dateStr && dateStr.length > 0 && (
          <div className={'name-row'}>
            <label>{subinfo}</label>
            <span>{dateStr}</span>
          </div>
        )}

        {age && age.length > 0 && (
          <div className={'name-row'}>
            <label>Age: </label>
            <span>{age}</span>
          </div>
        )}

        <div>{`${capFirstLetterOfStr(type)} ${paperCopyLabel}`}</div>
      </div>

      {/* <div className={`col`}>
        <div className={`row mobile`}>
          <QuantityDropdown
            id={`quantityDropDown__${key}`}
            label={`quantity_for_${key}`}
            handleQuantityChange={handleQuantityChange}
            quantity={quantity}
            selectOptions={{ start: 1, total: 10 }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default CertItem;

const CERTITEM_CSS = css`
  dislay: flex;
  justify-content: space-between;
  align-items: baseline;
  color: ${CHARLES_BLUE};
  font-family: ${SERIF};
  font-size: 1.125em;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${GRAY_100};
  padding: 18px 0 24px 0;

  .name-row {
    label {
      font-weight: 700;
    }

    margin-bottom: 12px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;

    .col {
      background: transparent;
    }
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

  .mobile__visible {
    // display: none;
    float: right;
  }

  ${MEDIA_SMALL_MAX} {
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
