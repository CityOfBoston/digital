// @flow

import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';

import type Cart from '../store/Cart';

export type LinkOptions = 'lookup' | 'checkout';
export type Props = {|
  cart: Cart,
  link: LinkOptions,
|};

export default observer(function Nav({ cart, link }: Props) {
  return (
    <nav className="nv-s nv-s--sticky">
      {link === 'checkout' && (
        <div className="nv-s-l bar">
          <Link href="/death/cart">
            <a className="nv-s-l-b back-link back-link-right">View Cart</a>
          </Link>

          <Link href="/death/cart">
            <a className="cart-link">{cart.size}</a>
          </Link>
        </div>
      )}

      {link === 'lookup' && (
        <div className="nv-s-l bar">
          <Link href="/death/">
            <a className="nv-s-l-b back-link">Back to Lookup</a>
          </Link>
        </div>
      )}

      <style jsx>{`
        .bar {
          display: flex;
        }
        .back-link {
          display: block !important;
          flex: 1;
        }
        .back-link-right {
          text-align: right;
        }
        .back-link:after {
          display: none !important;
        }

        .cart-link {
          display: block;
          position: relative;
          background: white;
          color: inherit;
          padding: 0.5em 0;
          margin-right: 1.25rem;
          margin-left: 1.25rem;
          width: 3em;
          text-align: center;
          font-style: italic;
        }
        .cart-link:before {
          content: '';
          display: block;
          border-color: transparent white transparent transparent;
          border-width: 5px 10px;
          border-style: solid;
          position: absolute;
          width: 0;
          height: 0;
          left: -20px;
          top: 12px;
        }
      `}</style>
    </nav>
  );
});
