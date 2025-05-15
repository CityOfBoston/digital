/** @jsx jsx */

import { CHARLES_BLUE, GRAY_400, SANS, WHITE } from '@cityofboston/react-fleet';
import { css, jsx } from '@emotion/core';

import { ReactNode, ReactNodeArray } from 'react';

export const CONFIRM_SVG = (): JSX.Element => {
  return (
    <div css={CONFIRM_SVG__CSS}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
        <path
          d="M27.5766 14.9234C27.7514 15.0976 27.8901 15.3046 27.9847 15.5325C28.0793 15.7604 28.128 16.0048 28.128 16.2516C28.128 16.4983 28.0793 16.7427 27.9847 16.9706C27.8901 17.1985 27.7514 17.4055 27.5766 17.5797L18.8266 26.3297C18.6524 26.5045 18.4454 26.6432 18.2175 26.7378C17.9896 26.8325 17.7452 26.8812 17.4984 26.8812C17.2517 26.8812 17.0073 26.8325 16.7794 26.7378C16.5515 26.6432 16.3445 26.5045 16.1703 26.3297L12.4203 22.5797C12.2459 22.4053 12.1076 22.1982 12.0132 21.9703C11.9188 21.7425 11.8702 21.4982 11.8702 21.2516C11.8702 21.0049 11.9188 20.7607 12.0132 20.5328C12.1076 20.3049 12.2459 20.0978 12.4203 19.9234C12.5947 19.749 12.8018 19.6107 13.0297 19.5163C13.2575 19.4219 13.5018 19.3733 13.7484 19.3733C13.9951 19.3733 14.2393 19.4219 14.4672 19.5163C14.6951 19.6107 14.9022 19.749 15.0766 19.9234L17.5 22.3438L24.9234 14.9188C25.0979 14.7447 25.3049 14.6068 25.5327 14.5128C25.7605 14.4189 26.0046 14.3707 26.251 14.3712C26.4974 14.3716 26.7413 14.4206 26.9687 14.5154C27.1962 14.6101 27.4027 14.7488 27.5766 14.9234ZM36.875 20C36.875 23.3376 35.8853 26.6002 34.0311 29.3752C32.1768 32.1503 29.5413 34.3132 26.4578 35.5905C23.3743 36.8677 19.9813 37.2019 16.7079 36.5508C13.4344 35.8996 10.4276 34.2924 8.06758 31.9324C5.70757 29.5724 4.10038 26.5656 3.44926 23.2921C2.79813 20.0187 3.13231 16.6257 4.40954 13.5422C5.68677 10.4587 7.84968 7.8232 10.6248 5.96895C13.3998 4.1147 16.6624 3.125 20 3.125C24.474 3.12996 28.7634 4.90945 31.927 8.07305C35.0906 11.2367 36.87 15.526 36.875 20ZM33.125 20C33.125 17.4041 32.3552 14.8665 30.913 12.7081C29.4709 10.5497 27.421 8.86748 25.0227 7.87408C22.6244 6.88068 19.9854 6.62076 17.4394 7.12719C14.8934 7.63362 12.5548 8.88366 10.7192 10.7192C8.88367 12.5548 7.63363 14.8934 7.1272 17.4394C6.62077 19.9854 6.88069 22.6244 7.87409 25.0227C8.86749 27.421 10.5498 29.4708 12.7081 30.913C14.8665 32.3552 17.4041 33.125 20 33.125C23.4798 33.1213 26.8161 31.7373 29.2767 29.2767C31.7373 26.8161 33.1213 23.4798 33.125 20Z"
          fill="#008817"
        />
      </svg>
    </div>
  );
};

const CONFIRM_SVG__CSS = css`
  svg {
    width: 40px;
    height: 40px;
    margin-right: 20px;
  }
`;

interface BANNER_PROPS {
  children?: ReactNode | ReactNodeArray;
}

export const CONFIRMATION_BANNER__SUCCESS = (
  props: BANNER_PROPS
): JSX.Element => {
  const { children } = props;

  return (
    <div css={BANNER_CSS}>
      <div className={'banner'}>
        <CONFIRM_SVG />

        <div className={`header`}>{children}</div>
      </div>
    </div>
  );
};

const BANNER_CSS = css`
  .banner {
    display: flex;
    color: ${CHARLES_BLUE};
    padding: 24px 32px 10px;
    background: rgba(0, 136, 23, 0.25);
    margin-bottom: 1.25rem;
    align-items: top;

    svg {
      width: 40px;
      height: 40px;
      margin-right: 20px;
    }

    label {
      font-family: ${SANS};
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
    }
  }
`;

export const CONFIRMATION_RECEIPT_SUCCESS = (
  props: BANNER_PROPS
): JSX.Element => {
  const { children } = props;

  return (
    <div css={RECEIPT_BODY_CSS}>
      <div className={'body'}>{children}</div>
    </div>
  );
};

const RECEIPT_BODY_CSS = css`
  .body {
    color: #091f2f;
    font-family: Lora;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;

    padding: 0px 24px 24px;
    background: ${WHITE};
    border: 1px solid ${GRAY_400};

    a {
      line-height: normal;
      text-decoration-line: underline;
      text-decoration-style: solid;
      text-decoration-skip-ink: auto;
      text-decoration-thickness: auto;
      text-underline-offset: -4px;
      text-underline-position: from-font;

      &.print {
        color: #1871bd;
        font-style: 700;
        font-weight: 600;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }
`;

export default CONFIRM_SVG;
