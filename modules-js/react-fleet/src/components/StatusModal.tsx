import React, { ReactNode, ReactNodeArray } from 'react';
import { css } from 'emotion';

// todo: look at Fin’s latest status modal work in access-boston
// todo: add an error state (i.e. red text, “error” label)

interface Props {
  children?: ReactNode | ReactNodeArray;
  message: string;
}

const MODAL_STYLE = css({
  paddingTop: 0,
  maxWidth: 500,
  top: '15%',
  marginRight: 'auto',
  marginLeft: 'auto',
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
export default function StatusModal({ children, message }: Props): JSX.Element {
  return (
    <div className="md" role="alertdialog" aria-labelledby="statusModal">
      <div className={`md-c br br-t400 ${MODAL_STYLE}`} role="document">
        <div className="md-b p-a300">
          <div className="t--intro" id="statusModal">
            {message}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
