// @flow

import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';

import { getDependencies } from '../app';
import type Cart from '../store/Cart';

type DefaultProps = {|
  cart: Cart,
|};

type Props = {|
  ...DefaultProps,
|};

@observer
export default class Nav extends React.Component<Props> {
  static get defaultProps(): DefaultProps {
    const { cart } = getDependencies();
    return { cart };
  }

  render() {
    const { cart } = this.props;

    return (
      <nav className="nv-s nv-s--sticky" aria-label="Shopping cart">
        <div className="nv-s-l bar">
          <Link href="/death/cart">
            <a className="nv-s-l-b back-link back-link-right">View Cart</a>
          </Link>

          <Link href="/death/cart">
            <a className="cart-link">{cart.size}</a>
          </Link>
        </div>

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
  }
}
