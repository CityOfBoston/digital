import React from 'react';
import { css } from 'emotion';
import { FREEDOM_RED_DARK, DEFAULT_TEXT } from '@cityofboston/react-fleet';

import { analyzePassword } from '../../lib/validation';

// This needs to be equal or higher priority to '.ul>li:before', so ':before'
// didn't cut it.
const OVERRIDE_LI_BEFORE_SELECTOR = '.ul>&:before';

const OK_PASSWORD_ROW = css({
  // We set the text to default to override in case the parent is in error and
  // set its color to red.
  color: DEFAULT_TEXT,
  [OVERRIDE_LI_BEFORE_SELECTOR]: {
    border: 'none',
    content: 'url("https://patterns.boston.gov/images/public/icons/check.svg")',
    width: '.44444rem',
    height: '.6666666rem',
    position: 'relative',
    top: -5,
    left: -8,
    transform: 'scale(.9)',
  },
});

const ERROR_PASSWORD_ROW = css({
  color: FREEDOM_RED_DARK,
  [OVERRIDE_LI_BEFORE_SELECTOR]: {
    // borderColor: `transparent ${FREEDOM_RED}`,
    border: 'none',
    content: '"×"',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    width: '.44444rem',
    height: '.6666666rem',
    position: 'relative',
    top: '-1.05rem',
    left: -5,
  },
});

interface Props {
  password: string;
  showFailedAsErrors?: boolean;
}

export default function PasswordPolicy({
  password,
  showFailedAsErrors,
}: Props): React.ReactElement<any> {
  const {
    longEnough,
    complexEnough,
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSymbol,
    hasSpaces,
    tooLong,
  } = analyzePassword(password);

  const failedClassName = showFailedAsErrors ? ERROR_PASSWORD_ROW : '';

  return (
    <>
      <div className="txt-l m-b200" style={{ marginTop: 1 }}>
        New passwords must:
      </div>

      <ul className="ul" style={{ lineHeight: 1.6 }}>
        <li className={longEnough ? OK_PASSWORD_ROW : failedClassName}>
          Be at least 10 characters long
        </li>

        <li className={complexEnough ? OK_PASSWORD_ROW : failedClassName}>
          Use at least 3 of these:
          <ul className="ul">
            <li className={hasLowercase ? OK_PASSWORD_ROW : ''}>
              A lowercase letter
            </li>
            <li className={hasUppercase ? OK_PASSWORD_ROW : ''}>
              An uppercase letter
            </li>
            <li className={hasNumber ? OK_PASSWORD_ROW : ''}>A number</li>
            <li className={hasSymbol ? OK_PASSWORD_ROW : ''}>
              A special character
            </li>
          </ul>
        </li>

        <li className={hasSpaces ? ERROR_PASSWORD_ROW : OK_PASSWORD_ROW}>
          Not have spaces
        </li>
        <li className={tooLong ? ERROR_PASSWORD_ROW : OK_PASSWORD_ROW}>
          Not be longer than 32 characters
        </li>
      </ul>

      <div className="t--subinfo m-v300 m-b200">
        Don't use personal info, like your name, ID or address. If you use just
        two consecutive characters from your name or ID in your password, it
        will fail. Your new password will have to be different than your last 5
        passwords.
      </div>
    </>
  );
}
