/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { ReactNode, ReactNodeArray } from 'react';

interface Props {
  children: ReactNode | ReactNodeArray;
  header?: string;
  confirmBtnText?: string;
  error?: boolean;
  hideTopBorderDecoration?: boolean;
  closeModalHandler?: (val: boolean) => void;
  confirmHandler?: (dest: string) => void | undefined;
}

export default function StatusModal(props: Props) {
  const {
    children,
    header,
    confirmBtnText,
    error,
    hideTopBorderDecoration,
    closeModalHandler,
    confirmHandler,
  } = props;

  const topBorderDecorationCss = hideTopBorderDecoration ? '' : ` br br-t400`;

  const closeHandler = () => {
    if (closeModalHandler) closeModalHandler(false);
  };

  let $closeBtnProps = {
    className: 'md-cb',
  };
  if (closeModalHandler) $closeBtnProps['onClick'] = closeHandler;

  let $confirmBtnProps = {
    className: 'btn btn--sm btn--100',
  };
  if (confirmHandler) $confirmBtnProps['onClick'] = confirmHandler;

  return (
    <div className="md">
      <div className={`md-c${topBorderDecorationCss}`} css={MODAL_STYLE}>
        {closeModalHandler && (
          <button {...Object.assign({}, $closeBtnProps)}>Close</button>
        )}
        <div className="md-b p-a300">
          {header && (
            <div className={`t--intro ${error ? 't--err' : ''}`}>{header}</div>
          )}

          {children}

          {confirmHandler && (
            <div className="m-t300 ta-r">
              <button {...Object.assign({}, $confirmBtnProps)}>
                {confirmBtnText && `${confirmBtnText}`}
                {!confirmBtnText && `Close`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MODAL_STYLE = css(`
  padding-top: 0;
  max-width: 500px;
  top: 33%;
  margin-right: auto;
  margin-left: auto;

  button {
    border: 0;
    cursor: pointer;
  }
`);
