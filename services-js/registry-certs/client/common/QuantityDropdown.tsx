/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MEDIA_SMALL } from '@cityofboston/react-fleet';
import { useEffect, useRef, useState } from 'react';

interface Props {
  quantity: number;
  handleQuantityChange: (value: number | null) => void;
}

/**
 * Component which combines a number input with a dropdown to allow user to
 * adjust quantity for a certificate request.
 *
 * Dropdown portion is hidden for screenreaders, since it duplicates the
 * functionality provided by the number input.
 *
 * Dropdown portion will only appear in larger viewports.
 */
export default function QuantityDropdown(props: Props) {
  const [selectValue, setSelectValue] = useState<string>('1');
  const [quantity, setQuantity] = useState<number>(1);
  const inputField = useRef<HTMLInputElement>(null);

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
    if (quantity < 1) handleQuantityChange('1');
  };

  // If the quantity is passed down as props, use that value.
  useEffect(() => {
    if (props.quantity) handleQuantityChange(props.quantity.toString());
  }, []);

  useEffect(() => {
    props.handleQuantityChange(quantity);
  }, [quantity]);

  return (
    <div css={CONTAINER_STYLE}>
      <input
        ref={inputField}
        type="number"
        min="1"
        name="quantity"
        aria-label="Quantity"
        className="txt-f txt-f--auto ta-r"
        css={QUANTITY_FIELD_STYING}
        size={3}
        value={quantity}
        onChange={event => handleQuantityChange(event.target.value)}
        onBlur={handleQuantityInputBlur}
      />

      <div
        className="sel-c sel-c--sq"
        css={QUANTITY_DROPDOWN_STYLE}
        aria-hidden="true"
      >
        <select
          name="quantityMenu"
          value={selectValue}
          className="sel-f sel-f--sq"
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
          <option value="10">10</option>
          <option disabled>---------------</option>
          <option value="other">Other…</option>
        </select>
      </div>
    </div>
  );
}

const CONTAINER_STYLE = css({ display: 'flex' });

const QUANTITY_FIELD_STYING = css({
  MozAppearance: 'textfield',
  '&::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
  },

  flexGrow: 1,

  [MEDIA_SMALL]: {
    width: 70,
    borderRight: 0,
  },
});

const QUANTITY_DROPDOWN_STYLE = css({
  display: 'none',

  [MEDIA_SMALL]: {
    display: 'block',
  },

  '&:after': {
    content: "'Qty'",
  },
});
