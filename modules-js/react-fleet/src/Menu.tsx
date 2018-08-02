import React from 'react';

import navigationHtml from '../templates/navigation.html';

export interface Props {
  open?: boolean;
}

export default class Header extends React.Component<Props> {
  /**
   * Makes it so that if you tab from the menu button but the menu is closed, it
   * goes to the first link in the header, rather than into the (hidden) menu.
   */
  menuKeyDownHandler = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Tab' && !ev.shiftKey && !ev.currentTarget.checked) {
      const a: HTMLAnchorElement | null = document.querySelector('header a');
      a && a.focus();
      ev.preventDefault();
    }
  };

  render() {
    const { open } = this.props;

    return (
      <>
        <input
          type="checkbox"
          id="brg-tr"
          className="brg-tr"
          aria-label="Open Boston.gov menu"
          checked={open}
          onKeyDown={this.menuKeyDownHandler}
        />

        <nav
          className="nv-m"
          dangerouslySetInnerHTML={{ __html: navigationHtml }}
          aria-label="Boston.gov menu"
        />
      </>
    );
  }
}
