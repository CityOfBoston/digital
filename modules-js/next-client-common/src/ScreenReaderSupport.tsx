import React from 'react';

/**
 * Class that manages an "aria-live" element to announce page changes and other
 * events for the benefit of screen readers.
 *
 * Make sure to add `AnnounceElement` to the page in _document so that
 * screen readers can see it.
 */
export default class ScreenReaderSupport {
  private static ANNOUNCE_ID = 'ScreenReaderSupport-announce';

  private el: HTMLElement | null = null;

  static AnnounceElement() {
    return (
      <div
        className="a11y--h"
        aria-live="polite"
        id={ScreenReaderSupport.ANNOUNCE_ID}
      />
    );
  }

  announce(message: string, interrupt: boolean = false) {
    if (this.el) {
      this.el.innerText = message;
      this.el.setAttribute('aria-live', interrupt ? 'assertive' : 'polite');
    }
  }

  attach() {
    this.el = document.getElementById(ScreenReaderSupport.ANNOUNCE_ID);
  }

  detach() {
    this.el = null;
  }
}
