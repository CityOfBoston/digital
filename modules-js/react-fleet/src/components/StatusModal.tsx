/** @jsx jsx */

import React, { ReactNode, ReactNodeArray, MouseEvent } from 'react';
import ReactDOM from 'react-dom';

import { css, jsx } from '@emotion/core';

// todo: look at Fin’s latest status modal work in access-boston
// todo: add an error state (i.e. red text, “error” label)

interface Props {
  children?: ReactNode | ReactNodeArray;
  message: string;
  /** If true, the message is rendered in red. */
  error?: boolean;
  /** If true, shows a waiting cursor. */
  waiting?: boolean;
  /** If provided, adds a "Close" button that calls this function when clicked. */
  onClose?: (ev: MouseEvent) => void;
}

const MODAL_STYLE = css({
  paddingTop: 0,
  maxWidth: 500,
  top: '15%',
  marginRight: 'auto',
  marginLeft: 'auto',
});

const WAITING_MODAL_STYLE = css({
  cursor: 'wait',
});

/**
 * Modal component intended to provide a clear “waiting” state to the user.
 * “message” string is used to label the modal, providing better clarity when
 * viewed via screen reader.
 *
 * Suggested child:
 *
 * <div className="t--info m-t300">
 *   Please be patient and don’t refresh your browser. This might take a bit.
 * </div>
 *
 * Add the `Container` element to the DOM in _document.tsx so that screen
 * readers will pick up on the modal automatically when it’s added.
 */
export default class StatusModal extends React.Component<Props> {
  private static ALERT_CONTAINER_ID = 'status-modal';

  /**
   * Adds an "alert"-roled element to the page that the modal can `Portal` into.
   * This gets around a limitation of certain screen readers that don’t announce
   * live elements when they’re dynamically added to the page.
   */
  static Container() {
    return <div role="alert" aria-atomic id={StatusModal.ALERT_CONTAINER_ID} />;
  }

  render(): React.ReactNode {
    const { children, message, error, waiting, onClose } = this.props;

    const alertHolder = document.getElementById(StatusModal.ALERT_CONTAINER_ID);

    const alertContent = (
      <div className="md" css={waiting && WAITING_MODAL_STYLE}>
        <div className="md-c br br-t400" css={MODAL_STYLE}>
          <div className="md-b p-a300">
            <div className={`t--intro ${error ? 't--err' : ''}`}>{message}</div>

            {children}

            {onClose && (
              <div className="m-t300 ta-r">
                <button
                  className="btn btn--sm btn--100"
                  type="button"
                  onClick={onClose}
                  autoFocus
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (alertHolder) {
      return ReactDOM.createPortal(alertContent, alertHolder);
    } else {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.warn(
          'Portal not found. Add StatusModal.makeStatusModalContainer to _document.tsx'
        );
      }
      return alertContent;
    }
  }
}
