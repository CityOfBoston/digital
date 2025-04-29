/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { ReactNode } from 'react';

import {
  WHITE,
  GRAY_100,
  OPTIMISTIC_BLUE_DARK,
  CHARLES_BLUE,
} from '@cityofboston/react-fleet';

import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

interface Props {
  children: ReactNode;
}

export const $Drawer = (props: Props): JSX.Element => {
  const { children } = props;

  return (
    <div css={DRAWER_CSS}>
      <div className={`header`}>
        <h1>Your order details</h1>
        {$ArrowUp({ alt: 'blue' })}
        {$ArrowDown({ alt: 'blue' })}
      </div>

      <>
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown', duration: 250 }}
          leave={{ animation: 'slideUp', duration: 250 }}
          role="region"
        >
          {children}
        </VelocityTransitionGroup>
      </>
    </div>
  );
};

export const $ArrowDown = (params: {
  alt?: 'white' | 'blue';
  width?: number;
  height?: number;
}) => {
  const { width = 17, height = 9, alt = 'white' } = params;

  const fillHex =
    alt && alt === 'white' ? `${WHITE}` : `${OPTIMISTIC_BLUE_DARK}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${width}`}
      height={`${height}`}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path
        d="M16.7801 1.28007L9.28007 8.78007C9.21041 8.8498 9.12769 8.90512 9.03665 8.94286C8.9456 8.9806 8.848 9.00003 8.74944 9.00003C8.65088 9.00003 8.55328 8.9806 8.46224 8.94286C8.37119 8.90512 8.28847 8.8498 8.21881 8.78007L0.718815 1.28007C0.578085 1.13934 0.499023 0.948463 0.499023 0.74944C0.499023 0.550417 0.578085 0.359546 0.718815 0.218815C0.859546 0.0780846 1.05042 -0.000976562 1.24944 -0.000976562C1.44846 -0.000976562 1.63933 0.0780846 1.78007 0.218815L8.74944 7.18913L15.7188 0.218815C15.7885 0.149132 15.8712 0.0938572 15.9623 0.0561452C16.0533 0.0184332 16.1509 -0.000976562 16.2494 -0.000976562C16.348 -0.000976562 16.4456 0.0184332 16.5366 0.0561452C16.6277 0.0938572 16.7104 0.149132 16.7801 0.218815C16.8497 0.288498 16.905 0.371223 16.9427 0.462268C16.9804 0.553313 16.9999 0.650894 16.9999 0.74944C16.9999 0.847987 16.9804 0.945568 16.9427 1.03661C16.905 1.12766 16.8497 1.21038 16.7801 1.28007Z"
        fill={`${fillHex}`}
      />
    </svg>
  );
};

export const $ArrowUp = (params: {
  alt?: 'white' | 'blue';
  width?: number;
  height?: number;
}) => {
  const { width = 17, height = 9, alt = 'white' } = params;

  const fillHex =
    alt && alt === 'white' ? `${WHITE}` : `${OPTIMISTIC_BLUE_DARK}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${width}`}
      height={`${height}`}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path
        d="M17.0306 9.53064C16.9609 9.60037 16.8782 9.65569 16.7871 9.69343C16.6961 9.73117 16.5985 9.7506 16.4999 9.7506C16.4014 9.7506 16.3038 9.73117 16.2127 9.69343C16.1217 9.65569 16.039 9.60037 15.9693 9.53064L8.99993 2.56032L2.03055 9.53064C1.88982 9.67137 1.69895 9.75043 1.49993 9.75043C1.30091 9.75043 1.11003 9.67137 0.969304 9.53064C0.828573 9.3899 0.749512 9.19903 0.749512 9.00001C0.749512 8.80099 0.828573 8.61012 0.969304 8.46939L8.4693 0.969385C8.53896 0.899653 8.62168 0.844334 8.71272 0.806591C8.80377 0.768847 8.90137 0.74942 8.99993 0.74942C9.09849 0.74942 9.19608 0.768847 9.28713 0.806591C9.37818 0.844334 9.4609 0.899653 9.53055 0.969385L17.0306 8.46939C17.1003 8.53904 17.1556 8.62176 17.1933 8.7128C17.2311 8.80385 17.2505 8.90145 17.2505 9.00001C17.2505 9.09857 17.2311 9.19617 17.1933 9.28722C17.1556 9.37826 17.1003 9.46098 17.0306 9.53064Z"
        fill={`${fillHex}`}
      />
    </svg>
  );
};

export default $Drawer;

const DRAWER_CSS = css`
  width: 100%;

  background: ${GRAY_100};
  background: #f2f2f2;

  .header,
  .footer {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    cursor: pointer;
    border: 1px dotted green;

    color: ${OPTIMISTIC_BLUE_DARK};
    font-family: Lora;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-decoration-style: solid;
    text-decoration-skip-ink: auto;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;
  }

  .header {
    &:hover {
      color: ${WHITE};
      background: ${OPTIMISTIC_BLUE_DARK};
      text-decoration-line: underline;
    }
  }

  .header.open {
    background: ${CHARLES_BLUE};
    color: ${WHITE};
  }
`;
