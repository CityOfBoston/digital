import React from 'react';
import { detect, parseUserAgent } from 'detect-browser';

export enum Message {
  NO_SCRIPT,
  OLD_BROWSER,
}

export interface Props {
  userAgent: string;
}

/**
 * Place this component on the page to show browser compatibility warnings.
 *
 * This component needs to be able to run purely server-side, with any
 * client-side JS handled outside of React. That’s because old browsers
 * potentially won’t be able to start up the app JS at all.
 *
 * If you’re using Next, a good place for this is just after <Main /> in
 * _document.tsx.
 */
export default function CompatibilityWarning({ userAgent }: Props) {
  let oldBrowser = false;

  // Safety in case the version is odd or anything unexpected happens. We don't
  // want the browser check to crash the app.
  try {
    const { name, version } = userAgent ? parseUserAgent(userAgent) : detect();
    const versionMajor = parseInt(version.split('.')[0]);

    // Right now we just warn old IE. We could add other browsers, such as old
    // iOS, if we want.
    oldBrowser = name === 'ie' && versionMajor < 11;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return (
    <>
      <noscript>
        <CompatibilityWarningContent message={Message.NO_SCRIPT} />
      </noscript>

      {oldBrowser && (
        <CompatibilityWarningContent message={Message.OLD_BROWSER} />
      )}
    </>
  );
}

interface ContentProps {
  message: Message;
}

/**
 * Exported so we can run stories over the different possibilities.
 */
export function CompatibilityWarningContent({ message }: ContentProps) {
  let text;

  switch (message) {
    case Message.NO_SCRIPT:
      text = (
        <>
          You have JavaScript turned off in your browser. This site won’t work
          right without it.
        </>
      );
      break;

    case Message.OLD_BROWSER:
      text = (
        <>
          <div>
            Your web browser is a little out-of-date. This site may not look or
            work right.
          </div>

          <div className="m-t100">
            We recommend using the latest version of Chrome, Firefox, IE Edge,
            or Safari.
          </div>
        </>
      );
      break;
  }

  const checkboxId = `compat-warning-${message}`;

  // We use a cookie to allow users to hide at least the "old browser" warning.
  // (The no-JS warning sticks around since we don’t have JS to hide it.)
  const cookieName = 'compat-warning';
  const cookieExpirationDate = new Date();
  cookieExpirationDate.setDate(cookieExpirationDate.getDate() + 30);

  // We use a fixed value for test so that Snapshots can be consistent.
  const cookieExpirationDateString =
    process.env.NODE_ENV === 'test'
      ? 'Fri, 09 Nov 2018 14:47:00 GMT'
      : cookieExpirationDate.toUTCString();

  return (
    <>
      <input
        id={checkboxId}
        type="checkbox"
        className="bwarning-cb"
        defaultChecked
      />

      <div className="bwarning-b">
        <label htmlFor={checkboxId} className="bwarning-x">
          {/* We use an “x” rather than a unicode symbol for better browser support. */}
          x
        </label>

        <h3 className="txt-l txt-l--mt000">Browser Warning</h3>
        {text}
      </div>

      {message !== Message.NO_SCRIPT && (
        // We use a <script> tag because the React app won't necessarily start
        // on older browsers.
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var id = "${checkboxId}";
                var cookieName = "${cookieName}";

                var getCookie = function(name) {
                  var value = "; " + document.cookie;
                  var parts = value.split("; " + name + "=");
                  if (parts.length == 2) return parts.pop().split(";").shift();
                };

                var checkbox = document.getElementById(id);
                if (!checkbox) {
                  return;
                }

                if (getCookie(cookieName)) {
                  checkbox.checked = false;
                }

                checkbox.onChange = function() {
                  document.cookie = '${cookieName}=1; expires=${cookieExpirationDateString}';
                }
              })();
            `,
          }}
        />
      )}
    </>
  );
}
