import React, { ReactNode, ReactNodeArray, MouseEvent } from 'react';
import { css } from 'emotion';

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
 */
export default function StatusModal({
  children,
  message,
  error,
  waiting,
  onClose,
}: Props): JSX.Element {
  return (
    <div
      className={`md ${waiting ? WAITING_MODAL_STYLE : ''}`}
      role="alertdialog"
      aria-labelledby="statusModal"
    >
      <div className={`md-c br br-t400 ${MODAL_STYLE}`} role="document">
        <div className="md-b p-a300">
          <div className={`t--intro ${error ? 't--err' : ''}`} id="statusModal">
            {message}
          </div>

          {children}

          {onClose && (
            <div className="m-t300 ta-r">
              <button
                className="btn btn--sm btn--100"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
