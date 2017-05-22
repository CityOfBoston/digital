// @flow

import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type Cart from '../store/Cart';

const BAR_STYLE = css({
  display: 'flex',
});

const LINK_STYLE = css({
  display: 'block !important',
  flex: 1,

  ':after': {
    display: 'none',
  },
});

const CART_STYLE = css({
  display: 'block',
  background: 'white',
  color: 'inherit',
  padding: '.5em 0',
  width: '3em',
  textAlign: 'center',
  fontStyle: 'italic',
  marginRight: '1.25rem',
  position: 'relative',

  ':before': {
    content: '""',
    display: 'block',
    borderWidth: '5px 10px',
    borderStyle: 'solid',
    position: 'absolute',
    width: 0,
    height: 0,
    borderColor: 'transparent white transparent transparent',
    left: -20,
    top: 12,
  },
});

type Props = {|
  cart: Cart,
  link: 'lookup' | 'checkout',
|};

function renderLink(link: $PropertyType<Props, 'link'>) {
  switch (link) {
    case 'checkout':
      return <Link href="/death/checkout"><a className={`nv-s-l-b ${LINK_STYLE.toString()}`}>Checkout</a></Link>;
    case 'lookup':
      return <Link href="/death"><a className={`nv-s-l-b ${LINK_STYLE.toString()}`}>Back to Lookup</a></Link>;
    default:
      return null;
  }
}

export default observer(function Nav({ cart, link }: Props) {
  return (
    <nav className="nv-s nv-s--sticky">
      <div className={`nv-s-l ${BAR_STYLE.toString()}`}>
        { renderLink(link) }
        <Link href="/death/checkout"><a className={`${CART_STYLE.toString()}`}>{cart.size}</a></Link>
      </div>
    </nav>
  );
});
