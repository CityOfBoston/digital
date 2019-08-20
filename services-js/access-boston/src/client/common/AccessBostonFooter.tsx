/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { OPTIMISTIC_BLUE_LIGHT, SANS } from '@cityofboston/react-fleet';

export default function AccessBostonFooter() {
  return (
    <footer className="ft">
      <div className="ft-c" style={{ paddingTop: 0 }}>
        <div className="g g--vc p-v200">
          <div className="g--8">
            <div css={FOOTER_LEGAL_STYLE}>
              The Access Boston Portal, and the systems, data and other
              resources that require Access Boston authentication for access are
              only to be used for legitimate City of Boston purposes. Use may be
              monitored, and unauthorized access or improper use of the
              resources may be subject to civil and/or criminal penalties under
              applicable federal, state and/or local law.
            </div>
          </div>
          <div className="g--4 ta-r">
            <a
              href="https://www.boston.gov/access-boston-portal-help"
              target="_blank"
              css={FOOTER_LINK_STYLE}
            >
              Need Help?
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FOOTER_LINK_STYLE = css({
  color: OPTIMISTIC_BLUE_LIGHT,
  fontFamily: SANS,
  textTransform: 'uppercase',
});

const FOOTER_LEGAL_STYLE = css({
  color: 'white',
  fontSize: '90%',
});
