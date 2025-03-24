/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { useEffect, useRef, useState } from 'react';

import { SERIF, CHARLES_BLUE, GRAY_200 } from '@cityofboston/react-fleet';

interface Props {
  quantity: number;
  largeQ: boolean;
  handleQuantityChange: (value: number | null) => void;
}

const QuantityDropdown = (props: Props) => {
  const { largeQ } = props;

  const inputField = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [selectValue, setSelectValue] = useState<string>('1');
  const [quantity, setQuantity] = useState<number>(1);

  const ignoreKeys = [
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Backspace',
  ];

  const handleIconClick = () => {
    if (inputField && inputField.current) {
      inputField.current.focus();
    }
  };

  const handleLabelClick = () => {
    if (selectRef && selectRef.current) {
      selectRef.current.focus();
    }
  };

  const handleQuantityChange = (value: string): void => {
    // Allows user to delete the characters before typing in new ones.
    if (value) {
      setQuantity(+value);
      setSelectValue(+value > 10 ? 'other' : value);
    } else {
      setQuantity('' as any);
    }
  };

  const handleSelectValueChange = (value: string): void => {
    setSelectValue(value);

    if (value !== 'other') {
      setQuantity(+value);
    } else {
      setQuantity('' as any);

      if (inputField && inputField.current) inputField.current.focus();
    }
  };

  const handleQuantityInputBlur = (): void => {
    // If user erases value in field, return quantity to 1 on blur
    // console.log(`handleQuantityInputBlur > quantity: ${quantity}`);
    if (Number.isNaN(quantity)) handleQuantityChange('1');
    if (quantity < 1) handleQuantityChange('1');
  };

  const handleInputKeyDown = event => {
    const key = event.key;
    if (isNaN(key) && !ignoreKeys.includes(key)) {
      event.preventDefault();
    }
  };

  // If the quantity is passed down as props, use that value.
  useEffect(() => {
    if (props.quantity) handleQuantityChange(props.quantity.toString());
  }, []);

  useEffect(() => {
    props.handleQuantityChange(quantity);
  }, [quantity]);

  return (
    <div css={CS_QUANTITYDROPDOWN}>
      <div
        className="quantity__main-wrapper"
        data-type={largeQ ? 'input' : 'select'}
      >
        {largeQ ? (
          <label htmlFor={`quantity_txtInput`} onClick={handleIconClick}>
            Quantity:
          </label>
        ) : (
          <label htmlFor={`quantityMenu`} onClick={handleLabelClick}>
            Quantity:
          </label>
        )}

        {largeQ && (
          <div className={`input_wrapper`}>
            <input
              type="text"
              name="quantity_txtInput"
              value={quantity}
              aria-label="Quantity"
              size={3}
              tabIndex={0}
              ref={inputField}
              onChange={event => handleQuantityChange(event.target.value)}
              onBlur={handleQuantityInputBlur}
              onKeyDown={handleInputKeyDown}
            />

            <div className={`icon`} onClick={handleIconClick} />
          </div>
        )}

        {!largeQ && (
          <select
            name={`quantityMenu`}
            value={selectValue}
            ref={selectRef}
            tabIndex={0}
            onChange={event => handleSelectValueChange(event.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10+</option>
          </select>
        )}
      </div>
    </div>
  );
};

const CS_QUANTITYDROPDOWN = css`
  display: flex;

  .quantity__main-wrapper {
    display: flex;
    width: max-content;
    align-content: center;
    align-items: baseline;

    border: 1px solid ${CHARLES_BLUE};
    padding: 10px 8px;

    font-family: ${SERIF};
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0%;
    color: ${CHARLES_BLUE};

    input,
    select,
    option {
      font-family: ${SERIF};
      font-weight: 400;
      font-size: 18px;
      line-height: 100%;
      letter-spacing: 0%;
      text-align: center;
    }

    label {
      margin-right: 0.15rem;
      cursor: pointer;
      color: ${CHARLES_BLUE};
    }

    .input_wrapper {
      display: flex;
      width: max-content;
      align-content: center;
      align-items: baseline;

      input[type='text'] {
        max-width: 35px;
        padding: 3px 2px 3px 2px;
        border: 1px solid transparent;
        // border: 1px solid ${CHARLES_BLUE};

        &:focus {
          background: ${GRAY_200};
          outline: none;
        }

        &:focus + .icon,
        &:active + .icon {
          display: none;
        }
      }

      .icon {
        width: 24px;
        height: 24px;
        background-image: url('data:image/svg+xml, %3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%0A%20%20%3Cpath%20d%3D%22M20.0306%209.53062L12.5306%2017.0306C12.4609%2017.1003%2012.3782%2017.1557%2012.2871%2017.1934C12.1961%2017.2312%2012.0985%2017.2506%2011.9999%2017.2506C11.9014%2017.2506%2011.8038%2017.2312%2011.7127%2017.1934C11.6217%2017.1557%2011.539%2017.1003%2011.4693%2017.0306L3.9693%209.53062C3.82857%209.38988%203.74951%209.19901%203.74951%208.99999C3.74951%208.80097%203.82857%208.61009%203.9693%208.46936C4.11003%208.32863%204.30091%208.24957%204.49993%208.24957C4.69895%208.24957%204.88982%208.32863%205.03055%208.46936L11.9999%2015.4397L18.9693%208.46936C19.039%208.39968%2019.1217%208.34441%2019.2128%208.30669C19.3038%208.26898%2019.4014%208.24957%2019.4999%208.24957C19.5985%208.24957%2019.6961%208.26898%2019.7871%208.30669C19.8781%208.34441%2019.9609%208.39968%2020.0306%208.46936C20.1002%208.53905%2020.1555%208.62177%2020.1932%208.71282C20.2309%208.80386%2020.2503%208.90144%2020.2503%208.99999C20.2503%209.09854%2020.2309%209.19612%2020.1932%209.28716C20.1555%209.37821%2020.1002%209.46093%2020.0306%209.53062Z%22%20fill%3D%22%231871BD%22%2F%3E%0A%3C%2Fsvg%3E');
        background-repeat: no-repeat;
        background-position: 0px 4px;
        background-size: 24px 24px;
      }
    }

    select {
      appearance: none;
      border: 1px solid transparent;

      background-image: url('data:image/svg+xml, %3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%0A%20%20%3Cpath%20d%3D%22M20.0306%209.53062L12.5306%2017.0306C12.4609%2017.1003%2012.3782%2017.1557%2012.2871%2017.1934C12.1961%2017.2312%2012.0985%2017.2506%2011.9999%2017.2506C11.9014%2017.2506%2011.8038%2017.2312%2011.7127%2017.1934C11.6217%2017.1557%2011.539%2017.1003%2011.4693%2017.0306L3.9693%209.53062C3.82857%209.38988%203.74951%209.19901%203.74951%208.99999C3.74951%208.80097%203.82857%208.61009%203.9693%208.46936C4.11003%208.32863%204.30091%208.24957%204.49993%208.24957C4.69895%208.24957%204.88982%208.32863%205.03055%208.46936L11.9999%2015.4397L18.9693%208.46936C19.039%208.39968%2019.1217%208.34441%2019.2128%208.30669C19.3038%208.26898%2019.4014%208.24957%2019.4999%208.24957C19.5985%208.24957%2019.6961%208.26898%2019.7871%208.30669C19.8781%208.34441%2019.9609%208.39968%2020.0306%208.46936C20.1002%208.53905%2020.1555%208.62177%2020.1932%208.71282C20.2309%208.80386%2020.2503%208.90144%2020.2503%208.99999C20.2503%209.09854%2020.2309%209.19612%2020.1932%209.28716C20.1555%209.37821%2020.1002%209.46093%2020.0306%209.53062Z%22%20fill%3D%22%231871BD%22%2F%3E%0A%3C%2Fsvg%3E');
      background-repeat: no-repeat;
      padding: 5px 5px 5px 5px;
      background-position: center right;
      padding-right: calc(0.75em + 0.75rem);
      background-size: 22px;

      option {
        text-align: center;
        background: green;
      }
    }
  }

  [data-type='select'] {
    border: 1px solid transparent;
  }

  [data-type='input'] {
    border: 1px solid ${CHARLES_BLUE};
  }
`;

export default QuantityDropdown;
