/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import {
  SERIF,
  OPTIMISTIC_BLUE_DARK,
  DEFAULT_TEXT,
  GRAY_000,
} from '../utilities/constants';

export const ToolTip = (data: {
  icon: string | '? | i';
  msg: string;
}): JSX.Element => {
  const { icon, msg } = data;

  const $wrapper = css(`
    display: flex;
    flex-grow: 1;
    position: relative;

    .icon {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      font-size: 0.75rem;
      background: ${OPTIMISTIC_BLUE_DARK};

      margin: 5px 0px 0 5px;
      padding: 5.4px 0 0 3.00px;
      line-height: 0px;
      font-size: 8px;
      color: white;

      &::before {
        content: '?';
      }
    }

    .tt--info {
      text-transform: lowercase;
      padding-left: 3.5px;
      &::before { content: 'i' }
    }

    .msg {
      flex-grow: 1;
      visibility: hidden;
      z-index: 2;

      
      padding: 0.25em 0.5em;
      color: ${DEFAULT_TEXT};
      font-family: ${SERIF};
      font-weight: 300;
      font-style: italic;
      text-transform: initial;
      background-color: ${GRAY_000};
      
      min-width: 150px;

      position: absolute;
      margin-left: 20px;
      top: calc(-30% + 1px);
    }

    .icon:hover + .msg { visibility: visible; }
  `);

  let cssObj_labelReq = { icon: 'icon' };

  if (icon && icon === 'i') {
    cssObj_labelReq['tt--info'] = 'tt--info';
  }

  // Filter out object key/value with empty strings eq. ``
  Object.keys(cssObj_labelReq).forEach(
    k => cssObj_labelReq[k] == '' && delete cssObj_labelReq[k]
  );

  // Output obj values as string of classNames
  let cssArrToString: string = Object.keys(cssObj_labelReq)
    .map(obj => cssObj_labelReq[obj])
    .toString()
    .replace(/,/g, ' ');

  return (
    <span className={'tool-tip__wrapper'} css={$wrapper}>
      <div className={cssArrToString} />
      <div className="msg">{msg}</div>
    </span>
  );
};

export default ToolTip;
