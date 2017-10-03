// @flow

import React from 'react';

type Props = {
  close: () => mixed,
  userAgent?: string,
};

export default function FeedbackForm({ close, userAgent }: Props) {
  return (
    <div className="md">
      <div className="md-c">
        <button
          className="md-cb"
          type="button"
          style={{ border: 'none' }}
          onClick={close}
        >
          Close
        </button>
        <div className="mb-b p-a300 p-a600--xl">
          <div className="sh m-b500">
            <div className="sh-title">Contact Us</div>
          </div>
          <div>
            <form
              action="https://contactform.boston.gov/emails"
              method="POST"
              target="_blank"
              onSubmit={() => window.setTimeout(close, 0)}
            >
              <input
                id="contactFormToAddress"
                name="email[to_address]"
                type="hidden"
                value="feedback@boston.gov"
              />
              <input
                id="contactFormURL"
                name="email[url]"
                type="hidden"
                value={
                  typeof window !== 'undefined'
                    ? window.location.toString()
                    : ''
                }
              />
              <input
                id="contactFormBrowser"
                name="email[browser]"
                type="hidden"
                value={
                  userAgent ||
                  (typeof navigator !== 'undefined' ? navigator.userAgent : '')
                }
              />
              <div className="fs">
                <div className="fs-c">
                  <div className="txt m-b300">
                    <label htmlFor="email[name]" className="txt-l txt-l--mt000">
                      Full Name
                    </label>
                    <input
                      name="email[name]"
                      type="text"
                      className="txt-f txt-f--sm bos-contact-name"
                      size="10"
                      value=""
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="email[from_address]"
                      className="txt-l txt-l--mt000"
                    >
                      Email Address
                    </label>
                    <input
                      name="email[from_address]"
                      type="text"
                      placeholder="email@address.com"
                      className="txt-f txt-f--sm bos-contact-email"
                      value=""
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="email[subject]"
                      className="txt-l txt-l--mt000"
                    >
                      Subject
                    </label>
                    <input
                      name="email[subject]"
                      type="text"
                      className="txt-f txt-f--sm bos-contact-subject"
                      size="10"
                      value="BOS:311 Feedback"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="email[message]"
                      className="txt-l txt-l--mt000"
                    >
                      Message
                    </label>
                    <textarea
                      name="email[message]"
                      type="text"
                      className="txt-f txt-f--sm bos-contact-message"
                      rows="10"
                    />
                  </div>
                </div>

                <div className="bc bc--r p-t500">
                  <button type="submit" className="btn btn--700">
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
