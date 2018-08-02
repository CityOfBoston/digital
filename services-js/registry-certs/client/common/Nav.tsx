import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';

import { getDependencies } from '../app';
import Cart from '../store/Cart';

interface DefaultProps {
  cart: Cart;
}

interface Props extends Partial<DefaultProps> {}

@observer
class Nav extends React.Component<Props & DefaultProps> {
  static get defaultProps(): DefaultProps {
    const { cart } = getDependencies();
    return { cart };
  }

  render() {
    const { cart } = this.props;

    return (
      <nav className="nv-s nv-s--sticky" aria-label="Shopping cart">
        <div className="nv-s-l bar">
          <Link prefetch={process.env.NODE_ENV !== 'test'} href="/death/cart">
            <a className="nv-s-l-b back-link back-link-right">
              View Cart <span className="cart-link">{cart.size}</span>
            </a>
          </Link>
        </div>

        <style jsx>{`
          .bar {
            display: flex;
            height: 54px;
          }

          .back-link {
            display: block !important;
          }

          .back-link-right {
            text-align: right;
          }

          .back-link:after {
            display: none !important;
          }

          .cart-link {
            display: inline-block;
            position: relative;
            background: white;
            color: #091f2f;
            padding: 0.5em 0;
            margin-right: 1.25rem;
            margin-left: 1.25rem;
            width: 3em;
            text-align: center;
            font-style: italic;
            font-family: Lora, Georgia, serif;
            font-size: 1rem;
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

// defaultProps hack
export default (Nav as any) as React.ComponentClass<Props>;
