import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';
import { css } from 'emotion';

import DeathCertificateCart from '../store/DeathCertificateCart';
import { CHARLES_BLUE, SERIF } from './style-constants';

interface Props {
  cart: DeathCertificateCart;
}

const BAR_STYLE = css({
  display: 'flex',
  height: 54,
});

const VIEW_CART_LINK_STYLE = css({
  display: 'block !important',
  textAlign: 'right',

  // Remove the chevron for when 2ndary nav is a menu.
  '&:after': {
    display: 'none !important',
  },
});

const CART_STYLE = css({
  display: 'inline-block',
  position: 'relative',
  background: 'white',
  color: CHARLES_BLUE,
  padding: '0.5em 0',
  marginRight: '1.25rem',
  marginLeft: '1.25rem',
  width: '3em',
  textAlign: 'center',
  fontStyle: 'italic',
  fontFamily: SERIF,
  fontSize: '1rem',

  '&:before': {
    content: "''",
    display: 'block',
    borderColor: 'transparent white transparent transparent',
    borderWidth: '5px 10px',
    borderStyle: 'solid',
    position: 'absolute',
    width: 0,
    height: 0,
    left: -20,
    top: 12,
  },
});

@observer
class Nav extends React.Component<Props> {
  render() {
    const { cart } = this.props;

    return (
      <nav className="nv-s nv-s--sticky" aria-label="Shopping cart">
        <div className={`nv-s-l ${BAR_STYLE}`}>
          <Link prefetch={process.env.NODE_ENV !== 'test'} href="/death/cart">
            <a className={`nv-s-l-b ${VIEW_CART_LINK_STYLE}`}>
              View Cart <span className={CART_STYLE}>{cart.size}</span>
            </a>
          </Link>
        </div>
      </nav>
    );
  }
}

// defaultProps hack
export default (Nav as any) as React.ComponentClass<Props>;
