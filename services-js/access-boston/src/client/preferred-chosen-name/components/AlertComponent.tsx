/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { ReactNode } from 'react';

interface AlertProps {
  text: ReactNode;
  altText?: ReactNode;
  type?: 'Error' | 'Success';
}

/**
 * AlertComponent to display a success message with a left-aligned icon and message text.
 */
export default function AlertComponent({
  text,
  type,
  altText,
}: AlertProps): JSX.Element {
  const fillColorByType = type && type === 'Error' ? `#9c3d10` : `#00A91C`;

  const errorSvg = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="#D54309"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        />
      </svg>
    );
  };

  const successSvg = () => {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        css={ICON_STYLING}
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
          fill={fillColorByType}
        />
      </svg>
    );
  };

  return (
    <div
      css={
        type && type === 'Error' ? WRAPPER_STYLE_ERROR : WRAPPER_STYLE_SUCCESS
      }
    >
      <div css={ALERT_CONTAINER_STYLING}>
        <div css={ICON_CONTAINER_STYLING}>
          {!type || (type === 'Success' && successSvg())}
          {type && (type === 'Error' && errorSvg())}
        </div>
        <div
          css={
            type && type === 'Error'
              ? TEXT_CONTAINER_STYLING_ERROR
              : TEXT_CONTAINER_STYLING_SUCCESS
          }
        >
          {text && <div className={`mainHeader`}>{text}</div>}
          {altText && <div className={`subTitle`}>{altText}</div>}
        </div>
      </div>
    </div>
  );
}

const WRAPPER_STYLE_ERROR = css({
  backgroundColor: '#F4E3DB',
  borderLeft: '10px solid #D54309',
});

const WRAPPER_STYLE_SUCCESS = css({
  backgroundColor: '#ecf3ec',
  borderLeft: '10px solid #00a91c',
});

const ALERT_CONTAINER_STYLING = css({
  display: 'flex',
  alignItems: 'self-start',
  padding: '16px 40px 16px 30px',
  color: '#000000',
  width: '100%',
  lineHeight: '1.5rem',
  borderRadius: '0px',

  '@media (max-width: 600px)': {
    padding: '10px',
  },
});

const ICON_CONTAINER_STYLING = css({
  marginRight: '16px',
  display: 'flex',

  svg: {
    width: '24px',
    height: '24px',
  },

  '@media (max-width: 600px)': {
    marginRight: '8px',
    padding: '2px',
  },
});

const ICON_STYLING = css({
  width: '32px',
  height: '32px',

  '@media (max-width: 600px)': {
    width: '20px',
    height: '20px',
  },
});

const subTitleCss = css(`
  .subTitle {
    font-size: 16px;
    font-family: Lora;
    font-weight: normal;
    text-transform: none;
    line-height: normal;
    padding-top: 0.25em;
  }  
`);

const mainHeaderCss = css(`
  .mainHeader {
    font-size: 22px;
    font-weight: bold;
    line-height: inherit;
    font-family: Montserrat;
    text-transform: uppercase;
    padding-bottom: 0.25em;
  }  
`);

const TEXT_CONTAINER_STYLING_SUCCESS = css({
  flex: 1,
  ...subTitleCss,
});

const TEXT_CONTAINER_STYLING_ERROR = css({
  flex: 1,
  ...subTitleCss,
  ...mainHeaderCss,
});
