/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent } from 'react';

import { MEDIA_SMALL } from '@cityofboston/react-fleet';

interface Props {
  quantity: number;
  handleQuantityChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleQuantityBlur: () => void;
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
  const { quantity } = props;

  return (
    <div className="m-r200" css={ADD_TO_CART_FORM_STYLE}>
      <input
        type="number"
        min="1"
        name="quantity"
        aria-label="Quantity"
        className="txt-f txt-f--auto ta-r"
        css={QUANTITY_FIELD_STYING}
        size={3}
        value={quantity}
        onChange={props.handleQuantityChange}
        onBlur={props.handleQuantityBlur}
      />

      <div
        className="sel-c sel-c--sq"
        css={QUANTITY_DROPDOWN_STYLE}
        aria-hidden="true"
      >
        <select
          name="quantityMenu"
          value={quantity <= 10 ? quantity : 'other'}
          className="sel-f sel-f--sq"
          onChange={props.handleQuantityChange}
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

const ADD_TO_CART_FORM_STYLE = css({
  display: 'flex',

  [MEDIA_SMALL]: {
    width: 165,
  },
});

const QUANTITY_FIELD_STYING = css({
  MozAppearance: 'textfield',
  '&::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
  },

  [MEDIA_SMALL]: {
    width: 99,
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
