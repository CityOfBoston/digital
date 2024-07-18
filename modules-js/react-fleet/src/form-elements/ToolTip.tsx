/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import {
  SERIF,
  OPTIMISTIC_BLUE_DARK,
  DEFAULT_TEXT,
  GRAY_000,
  MEDIA_SMALL_MAX,
} from '../utilities/constants';

export const ToolTip = (data: {
  icon: string | '? | i';
  msg: string;
}): JSX.Element => {
  const { icon, msg } = data;

  const $wrapper = css(`
    position: relative;
    display: inline-block;
    margin-left: 0.25em;
    padding: 5px 0 0 0;

    .wrapper {
      display: flex;
      align-items: center;
    }
    
    .icon {
      background:${OPTIMISTIC_BLUE_DARK};
      line-height: normal;
      color: white;
      font-size: 0.5rem;
      text-align: center;
      width: 10px;
      height: 10px;
      border-radius: 50%;

      &::before {
        content: '?';
      }
    }

    .tt--info {
      text-transform: lowercase;
      &::before { content: 'i' }
    }

    .msg {
      display: none;
      position: absolute;
      line-height: normal;
      z-index: 1000;
      left: 110%;
      top: -10%;
      
      min-width: 250px;
      max-width: 300px;
      
      padding: 0.25em 0.5em;
      font-weight: 300;
      font-style: italic;
      font-size: calc(14px + 2 * ((100vw - 480px) / 960));
      text-align: left;
      text-transform: initial;

      background: ${GRAY_000};
      color: ${DEFAULT_TEXT};
      font-family: ${SERIF};
    }

    .icon:hover + .msg {
      display: block;
    }
    
    ${MEDIA_SMALL_MAX} {
      .msg {
        transform: translate(-51%, -95%);
      }
    }
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
    <div css={$wrapper}>
      <div className={cssArrToString} />
      <div className="msg">{msg}</div>
    </div>
  );
};

export default ToolTip;
