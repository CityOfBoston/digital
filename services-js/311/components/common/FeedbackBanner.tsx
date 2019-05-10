import React from 'react';
import { css } from 'emotion';

import { MEDIA_LARGE, YELLOW } from '@cityofboston/react-fleet';

const BANNER_STYLE = css({
  backgroundColor: YELLOW,
  marginBottom: -30,
  position: 'relative',
  zIndex: 5,

  [MEDIA_LARGE]: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: 0,
  },
});

const FIT_DIALOG_STYLE = css({
  maxWidth: 1300,
  margin: '0 auto',
});

const BANNER_INNER_STYLE = css({
  minHeight: 30,
  padding: '0.5rem 1rem',
  transition: 'max-width 200ms',
});

type Props = {
  fit: 'DIALOG' | 'PAGE';
};

export default class FeedbackBanner extends React.Component<Props> {
  showFeedbackForm = () => {
    const contactFormEl: any = document.getElementById('contactForm');
    if (contactFormEl) {
      contactFormEl.show();
    }
  };

  render() {
    const { fit } = this.props;

    return (
      <div className={`${BANNER_STYLE.toString()}`}>
        <div
          className={`${
            fit === 'PAGE' ? 'b-c' : FIT_DIALOG_STYLE.toString()
          } ${BANNER_INNER_STYLE.toString()}`}
        >
          <span className="t--subtitle t--upper">Welcome to the new 311:</span>{' '}
          <span className="t--info t--s100">
            We would love to hear your{' '}
            <button
              type="button"
              onClick={this.showFeedbackForm}
              className="lnk t--w"
            >
              feedback
            </button>
            .
          </span>
        </div>
      </div>
    );
  }
}
