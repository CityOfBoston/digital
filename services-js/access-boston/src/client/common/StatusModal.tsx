import { css } from 'emotion';
import { ReactNode, ReactNodeArray } from 'react';

const MODAL_STYLE = css({
  paddingTop: 0,
  maxWidth: 500,
  top: '15%',
  marginRight: 'auto',
  marginLeft: 'auto',
});

interface Props {
  children?: ReactNode | ReactNodeArray;
}

export default function StatusModal({ children }: Props) {
  return (
    <div className="md">
      <div className={`md-c br br-t400 ${MODAL_STYLE}`}>
        <div className="md-b p-a300">{children}</div>
      </div>
    </div>
  );
}
