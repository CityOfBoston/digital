// @flow

import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { fromPromise, type IPromiseBasedObservable } from 'mobx-utils';

type Props = {
  close: () => mixed,
  userAgent?: string,
};

type ContentProps = {
  close: () => mixed,
  submit: (?HTMLFormElement) => mixed,
  userAgent?: string,
  loading: boolean,
  success: boolean,
  errorMessage: ?string,
};

export class FeedbackFormContent extends React.Component<ContentProps> {
  formEl: ?HTMLFormElement = null;

  setFormEl = (formEl: ?HTMLFormElement) => {
    this.formEl = formEl;
  };

  render() {
    const { close, success } = this.props;

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

            {success ? this.renderSuccess() : this.renderForm()}
          </div>
        </div>
      </div>
    );
  }

  renderForm() {
    const { userAgent, loading, errorMessage, submit } = this.props;

    return (
      <div>
        <form
          ref={this.setFormEl}
          action="javascript:void(0)"
          method="POST"
          onSubmit={() => submit(this.formEl)}
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
              typeof window !== 'undefined' ? window.location.toString() : ''
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
                <label
                  htmlFor="FeedbackForm-name"
                  className="txt-l txt-l--mt000"
                >
                  Full Name
                </label>
                <input
                  id="FeedbackForm-name"
                  name="email[name]"
                  type="text"
                  className="txt-f txt-f--sm bos-contact-name"
                  size="10"
                  defaultValue=""
                />
              </div>
              <div className="txt m-b300">
                <label
                  htmlFor="FeedbackForm-email"
                  className="txt-l txt-l--mt000"
                >
                  Email Address
                </label>
                <input
                  id="FeedbackForm-email"
                  name="email[from_address]"
                  type="text"
                  placeholder="email@address.com"
                  className="txt-f txt-f--sm bos-contact-email"
                  defaultValue=""
                />
              </div>
              <div className="txt m-b300">
                <label
                  htmlFor="FeedbackForm-subject"
                  className="txt-l txt-l--mt000"
                >
                  Subject
                </label>
                <input
                  id="FeedbackForm-subject"
                  name="email[subject]"
                  type="text"
                  className="txt-f txt-f--sm bos-contact-subject"
                  size="10"
                  defaultValue="BOS:311 Feedback"
                />
              </div>
              <div className="txt m-b300">
                <label
                  htmlFor="FeedbackForm-message"
                  className="txt-l txt-l--mt000"
                >
                  Message
                </label>
                <textarea
                  id="FeedbackForm-message"
                  name="email[message]"
                  type="text"
                  className="txt-f txt-f--sm bos-contact-message"
                  rows="10"
                />
              </div>
            </div>

            {errorMessage &&
              <p className="t--err">
                We couldn’t submit your feedback: {errorMessage}
              </p>}

            <div className="bc bc--r p-t500">
              <button type="submit" className="btn btn--700" disabled={loading}>
                Send Message
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  renderSuccess() {
    return (
      <p>
        Thank you for contacting us. We appreciate your interest in the City. If
        you don’t hear from anyone within five business days, please contact
        BOS:311 at 3-1-1 or 617-635-4500.
      </p>
    );
  }
}

@observer
export default class FeedbackForm extends React.Component<Props> {
  @observable submitPromise: ?IPromiseBasedObservable<mixed> = null;

  submit = action('submit feedback', (formEl: ?HTMLFormElement) => {
    if (!formEl) {
      return;
    }

    const { url, token } = window.__NEXT_DATA__.contactForm;
    const form = new FormData(formEl);

    this.submitPromise = fromPromise(
      fetch(url, {
        method: 'POST',
        headers: new Headers({
          Authorization: `Token ${token}`,
        }),
        body: form,
      })
    );
  });

  render() {
    const { userAgent, close } = this.props;
    const { submitPromise, submit } = this;

    return (
      <FeedbackFormContent
        close={close}
        submit={submit}
        userAgent={userAgent}
        success={!!(submitPromise && submitPromise.state === 'fulfilled')}
        loading={!!(submitPromise && submitPromise.state === 'pending')}
        errorMessage={
          submitPromise && submitPromise.state === 'rejected'
            ? submitPromise.value.toString()
            : null
        }
      />
    );
  }
}
