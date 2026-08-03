import React, { Component } from 'react';
import { action } from '@storybook/addon-actions';
import { runInAction } from 'mobx';
import Router from 'next/router';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import { DeathCertificate } from '../../types';
import DeathCertificateCart from '../../store/DeathCertificateCart';
import CertifiedMail from '../../models/CertifiedMail';
import CardType from '../../models/CardType';
import Order from '../../models/Order';
import SearchPage from '../search/SearchPage';
import CartPage from '../cart/CartPage';
import CheckoutPage from '../checkout/CheckoutPage';
import CertificatePage from './CertificatePage';
import CertificateOptionsPage from './CertificateOptionsPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

export const PAGE_SIZE = 20;
export const MANY_RESULT_COUNT = 43;

const FIXTURES: DeathCertificate[] = [
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
];

type Step = 'search' | 'certificate' | 'options' | 'cart' | 'checkout';

type CheckoutInfo =
  | { page: 'shipping' }
  | { page: 'payment' }
  | { page: 'review' }
  | { page: 'confirmation'; orderId: string; contactEmail: string };

/** Build `count` result rows from fixtures with unique ids for Storybook. */
export function makePageResults(
  count: number,
  idOffset = 0
): DeathCertificate[] {
  return Array.from({ length: count }, (_, i) => {
    const fixture = FIXTURES[i % FIXTURES.length];
    return {
      ...fixture,
      id: String(100000 + idOffset + i),
      lastName: `${fixture.lastName} ${idOffset + i + 1}`,
    };
  });
}

export function certificateFromId(id: string): DeathCertificate {
  const numericId = parseInt(id, 10);
  if (Number.isFinite(numericId) && numericId >= 100000) {
    return makePageResults(1, numericId - 100000)[0];
  }

  return (
    FIXTURES.find(c => c.id === id) || {
      ...TYPICAL_CERTIFICATE,
      id,
    }
  );
}

function searchResultsPayload({
  page,
  resultCount,
  results,
}: {
  page: number;
  resultCount: number;
  results: DeathCertificate[];
}) {
  return {
    page,
    pageSize: PAGE_SIZE,
    pageCount: resultCount === 0 ? 0 : Math.ceil(resultCount / PAGE_SIZE),
    resultCount,
    results,
  };
}

function hrefFromRouterArg(url: any): string {
  if (typeof url === 'string') {
    return url;
  }
  if (url && typeof url === 'object') {
    const path = url.pathname || '';
    const query = url.query || {};
    const qs = Object.keys(query)
      .map(
        k => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`
      )
      .join('&');
    return qs ? `${path}?${qs}` : path;
  }
  return String(url);
}

function getQueryParam(href: string, name: string): string | null {
  const match = href.match(new RegExp(`[?&]${name}=([^&]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

function parseCheckoutInfo(href: string): CheckoutInfo {
  const pageParam = getQueryParam(href, 'page') || 'shipping';

  if (pageParam === 'payment') {
    return { page: 'payment' };
  }
  if (pageParam === 'review') {
    return { page: 'review' };
  }
  if (pageParam === 'confirmation') {
    return {
      page: 'confirmation',
      orderId: getQueryParam(href, 'orderId') || 'RG-STORYBOOK-0001',
      contactEmail: getQueryParam(href, 'contactEmail') || '',
    };
  }

  return { page: 'shipping' };
}

function makeStorybookOrder(): Order {
  return new Order(
    {
      storeContactAndShipping: false,
      storeBilling: false,

      contactName: 'Juliana Donovan',
      contactEmail: 'test@boston.gov',
      confirmContactEmail: 'test@boston.gov',
      contactPhone: '(617) 555-0100',

      shippingName: 'Juliana Donovan',
      shippingCompanyName: '',
      shippingAddress1: '1 City Hall Square',
      shippingAddress2: '',
      shippingCity: 'Boston',
      shippingState: 'MA',
      shippingZip: '02201',

      cardholderName: 'Juliana Donovan',
      cardLast4: '4242',
      cardToken: 'tok_storybook',
      cardFunding: 'credit',

      billingAddressSameAsShippingAddress: true,

      billingAddress1: '1 City Hall Square',
      billingAddress2: '',
      billingCity: 'Boston',
      billingState: 'MA',
      billingZip: '02201',
    },
    false
  );
}

/**
 * Stand-in Stripe.js for Storybook so the payment card field mounts and can be
 * completed without a real publishable key.
 */
function makeStorybookStripe(): stripe.Stripe {
  return {
    elements: () => ({
      create: (_type: string, options: any = {}) => {
        let mountedEl: HTMLElement | null = null;
        let input: HTMLInputElement | null = null;
        let changeHandler:
          | ((ev: stripe.elements.ElementChangeResponse) => void)
          | null = null;

        const emitChange = () => {
          if (!changeHandler || !input) {
            return;
          }
          const digits = input.value.replace(/\D/g, '');
          changeHandler({
            elementType: 'card',
            empty: digits.length === 0,
            complete: digits.length >= 15,
            brand: 'visa',
            error: undefined,
          } as stripe.elements.ElementChangeResponse);
        };

        return {
          mount: (el: string | HTMLElement) => {
            mountedEl =
              typeof el === 'string' ? document.querySelector(el) : el;
            if (!mountedEl) {
              return;
            }
            input = document.createElement('input');
            input.type = 'text';
            input.autocomplete = 'cc-number';
            input.placeholder = 'Card number';
            input.setAttribute('aria-label', 'Credit or Debit Card');
            input.className =
              (options.classes && options.classes.base) || 'txt-f';
            input.addEventListener('input', emitChange);
            mountedEl.appendChild(input);
          },
          unmount: () => {
            if (input && mountedEl && input.parentNode === mountedEl) {
              mountedEl.removeChild(input);
            }
            input = null;
            mountedEl = null;
          },
          destroy: () => {
            if (input && mountedEl && input.parentNode === mountedEl) {
              mountedEl.removeChild(input);
            }
            input = null;
            mountedEl = null;
            changeHandler = null;
          },
          on: (event: string, handler: any) => {
            if (event === 'change') {
              changeHandler = handler;
            }
          },
          update: () => {},
          blur: () => {},
          clear: () => {
            if (input) {
              input.value = '';
              emitChange();
            }
          },
          focus: () => {
            if (input) {
              input.focus();
            }
          },
        };
      },
    }),
    createToken: async () => ({
      token: {
        id: 'tok_storybook',
        object: 'token',
        client_ip: null,
        created: Date.now(),
        livemode: false,
        type: 'card',
        used: false,
        card: {
          id: 'card_storybook',
          object: 'card',
          brand: 'Visa',
          country: 'US',
          exp_month: 12,
          exp_year: 2030,
          funding: 'credit',
          last4: '4242',
        },
      },
    }),
  } as unknown as stripe.Stripe;
}

type FlowState = {
  step: Step;
  query: string;
  page: number;
  /** null = user has not searched yet (landing). */
  resultCount: number | null;
  certificate: DeathCertificate | null;
  backUrl: string | null;
  quantity: number;
  checkoutInfo: CheckoutInfo;
};

export type InteractiveDeathFlowProps = {
  initialStep?: Step;
  initialQuery?: string;
  initialPage?: number;
  /** null = landing / no search yet */
  initialResultCount?: number | null;
  initialCertificate?: DeathCertificate | null;
  initialQuantity?: number;
  /** Used when submitting a new search from the landing page */
  defaultSearchResultCount?: number;
  /** When starting on options, seed the SSN answer for Storybook variants */
  seedIncludeSsn?: boolean | null;
  /** Mutate the shared cart before first render (e.g. CartPage stories) */
  seedCart?: (cart: DeathCertificateCart) => void;
  certifiedMail?: boolean;
  cardType?: '-1' | '0' | '1';
};

type OptionsPageProps = {
  id: string;
  quantity: number;
  backUrl: string | null;
  certificate: DeathCertificate;
  deathCertificateCart: DeathCertificateCart;
  siteAnalytics: GaSiteAnalytics;
  seedIncludeSsn?: boolean | null;
};

class SeededCertificateOptionsPage extends Component<OptionsPageProps> {
  private pageRef = React.createRef<CertificateOptionsPage>();

  componentDidMount() {
    this.applySeed();
  }

  componentDidUpdate(prevProps: OptionsPageProps) {
    if (prevProps.seedIncludeSsn !== this.props.seedIncludeSsn) {
      this.applySeed();
    }
  }

  applySeed() {
    const page = this.pageRef.current;
    if (!page || this.props.seedIncludeSsn === undefined) {
      return;
    }
    page.includeSsn = this.props.seedIncludeSsn;
    if (this.props.seedIncludeSsn) {
      page.relationship = 'spouse';
      page.identityDocumentType = 'drivers-license';
    }
  }

  render() {
    const {
      id,
      quantity,
      backUrl,
      certificate,
      deathCertificateCart,
      siteAnalytics,
    } = this.props;

    return (
      <CertificateOptionsPage
        ref={this.pageRef}
        id={id}
        quantity={quantity}
        backUrl={backUrl}
        certificate={certificate}
        deathCertificateCart={deathCertificateCart}
        siteAnalytics={siteAnalytics}
      />
    );
  }
}

/**
 * Storybook death-certificate flow: search ↔ results ↔ STEP 2 ↔ STEP 3 ↔ cart,
 * with a mocked Next.js router so links and form submits work in Storybook.
 */
export default class InteractiveDeathFlow extends Component<
  InteractiveDeathFlowProps,
  FlowState
> {
  private previousRouter: any = null;
  private cart = new DeathCertificateCart();
  private siteAnalytics = new GaSiteAnalytics();
  private historyStack: Step[] = [];
  private order = makeStorybookOrder();
  private stripe = makeStorybookStripe();
  private certMail: CertifiedMail;
  private cardType: CardType;
  private certMailProvider: {
    get: () => Promise<CertifiedMail>;
    clear: () => void;
  };
  private cardTypeProvider: {
    get: () => Promise<CardType>;
    clear: () => void;
  };
  private orderProvider: {
    get: () => Promise<Order>;
    clear: () => void;
  };
  private checkoutDao: {
    tokenizeCard: (
      order: Order,
      cardElement: stripe.elements.Element | null
    ) => Promise<void>;
    submitDeathCertificateCart: () => Promise<string>;
  };

  state: FlowState = {
    step: this.props.initialStep || 'search',
    query: this.props.initialQuery || '',
    page: this.props.initialPage || 1,
    resultCount:
      this.props.initialResultCount === undefined
        ? null
        : this.props.initialResultCount,
    certificate: this.props.initialCertificate || null,
    backUrl: null,
    quantity: this.props.initialQuantity || 1,
    checkoutInfo: { page: 'shipping' },
  };

  constructor(props: InteractiveDeathFlowProps) {
    super(props);

    if (props.seedCart) {
      props.seedCart(this.cart);
    }

    this.certMail = new CertifiedMail({
      requestCertifiedMail: !!props.certifiedMail,
      certMailForBirth: false,
      certMailForMarriage: false,
      certMailForDeath: !!props.certifiedMail,
    });
    this.cardType = new CardType({
      cardType: props.cardType || '1',
    });
    this.certMailProvider = {
      get: () => Promise.resolve(this.certMail),
      clear: () => {
        this.certMail = new CertifiedMail({
          requestCertifiedMail: false,
          certMailForBirth: false,
          certMailForMarriage: false,
          certMailForDeath: false,
        });
      },
    };
    this.cardTypeProvider = {
      get: () => Promise.resolve(this.cardType),
      clear: () => {
        this.cardType = new CardType({ cardType: '-1' });
      },
    };
    this.orderProvider = {
      get: () => Promise.resolve(this.order),
      clear: () => {
        this.order = makeStorybookOrder();
      },
    };
    this.checkoutDao = {
      tokenizeCard: async (order, _cardElement) => {
        action('tokenize-card')();
        runInAction(() => {
          order.info.cardToken = 'tok_storybook';
          order.info.cardLast4 = '4242';
          order.info.cardFunding = 'credit';
        });
      },
      submitDeathCertificateCart: async () => {
        action('submit-order')();
        return 'RG-STORYBOOK-0001';
      },
    };
  }

  componentDidMount() {
    this.previousRouter = (Router as any).router;
    this.installRouter();
  }

  componentWillUnmount() {
    (Router as any).router = this.previousRouter;
  }

  private goToStep(next: Partial<FlowState> & { step: Step }) {
    this.historyStack.push(this.state.step);
    this.setState(prev => ({ ...prev, ...next }));
  }

  private handleRouterBack = () => {
    const previous = this.historyStack.pop();
    if (previous) {
      action('router-back')(previous);
      this.setState({ step: previous });
      window.scroll(0, 0);
      return;
    }

    action('router-back')('search');
    this.setState({
      step: 'search',
      query: '',
      page: 1,
      resultCount: null,
      certificate: null,
      backUrl: null,
    });
    window.scroll(0, 0);
  };

  private resultCountForQuery(rawQuery: string): number {
    const q = rawQuery.trim().toLowerCase();
    if (!q) {
      return 0;
    }
    if (
      q === 'none' ||
      q === 'noresults' ||
      q === 'no results' ||
      q === 'zzz'
    ) {
      return 0;
    }
    return this.props.defaultSearchResultCount != null
      ? this.props.defaultSearchResultCount
      : MANY_RESULT_COUNT;
  }

  private installRouter() {
    const handlePush = (url: any, as?: any) => {
      const href = hrefFromRouterArg(url);
      const asPath = as ? hrefFromRouterArg(as) : href;
      const combined = `${href} ${asPath}`;

      if (combined.includes('certificate-options')) {
        const id =
          getQueryParam(href, 'id') ||
          (asPath.match(/\/death\/certificate\/([^/?]+)/) || [])[1] ||
          (this.state.certificate && this.state.certificate.id) ||
          '';
        const quantityParam = getQueryParam(href, 'quantity');
        const backUrl = getQueryParam(href, 'backUrl');
        const quantity = quantityParam
          ? parseInt(quantityParam, 10)
          : this.state.quantity;

        action('open-certificate-options')({ id, quantity, backUrl });
        this.goToStep({
          step: 'options',
          certificate: certificateFromId(id),
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          backUrl: backUrl || this.state.backUrl,
        });
        window.scroll(0, 0);
        return Promise.resolve(true);
      }

      if (combined.includes('/death/certificate')) {
        const id =
          getQueryParam(href, 'id') ||
          (asPath.match(/\/death\/certificate\/([^/?]+)/) || [])[1] ||
          '';
        const backUrl = getQueryParam(href, 'backUrl');

        action('open-certificate')(id);
        this.goToStep({
          step: 'certificate',
          certificate: certificateFromId(id),
          backUrl:
            backUrl ||
            (this.state.query
              ? `/death?q=${encodeURIComponent(this.state.query)}&page=${
                  this.state.page
                }`
              : '/death'),
        });
        window.scroll(0, 0);
        return Promise.resolve(true);
      }

      if (combined.includes('/death/cart')) {
        action('open-cart')(href);
        this.goToStep({ step: 'cart' });
        window.scroll(0, 0);
        return Promise.resolve(true);
      }

      if (combined.includes('/death/checkout')) {
        const checkoutInfo = parseCheckoutInfo(href);
        action('open-checkout')(checkoutInfo);

        if (this.state.step === 'checkout') {
          this.setState({ checkoutInfo });
        } else {
          this.goToStep({ step: 'checkout', checkoutInfo });
        }

        window.scroll(0, 0);
        return Promise.resolve(true);
      }

      if (href.includes('/death')) {
        const qParam = getQueryParam(href, 'q');
        const pageParam = getQueryParam(href, 'page');
        const nextPage = pageParam ? parseInt(pageParam, 10) : 1;

        if (qParam === null && !href.includes('q=')) {
          action('open-landing')();
          this.goToStep({
            step: 'search',
            query: '',
            page: 1,
            resultCount: null,
            certificate: null,
            backUrl: null,
          });
          window.scroll(0, 0);
          return Promise.resolve(true);
        }

        const query = (qParam || '').trim();
        if (!query) {
          action('open-landing')();
          this.goToStep({
            step: 'search',
            query: '',
            page: 1,
            resultCount: null,
            certificate: null,
            backUrl: null,
          });
          window.scroll(0, 0);
          return Promise.resolve(true);
        }

        const sameQuery = query === this.state.query;
        const resultCount = sameQuery
          ? this.state.resultCount != null
            ? this.state.resultCount
            : this.resultCountForQuery(query)
          : this.resultCountForQuery(query);

        action('search')({ query, page: nextPage, resultCount });
        this.goToStep({
          step: 'search',
          query,
          page: nextPage,
          resultCount,
          certificate: null,
          backUrl: null,
        });
        window.scroll(0, 0);
        return Promise.resolve(true);
      }

      action('navigate')(href);
      return Promise.resolve(true);
    };

    (Router as any).router = {
      pathname: '/death',
      route: '/death',
      query: this.state.query ? { q: this.state.query } : {},
      asPath: this.state.query
        ? `/death?q=${encodeURIComponent(this.state.query)}`
        : '/death',
      components: {},
      push: handlePush,
      replace: handlePush,
      prefetch: () => Promise.resolve(),
      reload: () => {},
      back: this.handleRouterBack,
      beforePopState: () => {},
      events: {
        on: () => {},
        off: () => {},
        emit: () => {},
      },
    };
  }

  private renderCartPage() {
    return (
      <CartPage
        deathCertificateCart={this.cart}
        siteAnalytics={this.siteAnalytics}
        certMailProvider={this.certMailProvider as any}
        cardTypeProvider={this.cardTypeProvider as any}
        certifiedMailForTest={this.certMail}
        cardTypeForTest={this.cardType}
      />
    );
  }

  private renderCheckoutPage() {
    const { checkoutInfo } = this.state;

    return (
      <CheckoutPage
        key={checkoutInfo.page}
        info={checkoutInfo}
        deathCertificateCart={this.cart}
        siteAnalytics={this.siteAnalytics}
        orderProvider={this.orderProvider as any}
        certMailProvider={this.certMailProvider as any}
        cardTypeProvider={this.cardTypeProvider as any}
        checkoutDao={this.checkoutDao as any}
        stripe={this.stripe}
        orderForTest={this.order}
        certifiedMailForTest={this.certMail}
        cardTypeForTest={this.cardType}
      />
    );
  }

  render() {
    const {
      step,
      query,
      page,
      resultCount,
      certificate,
      backUrl,
      quantity,
    } = this.state;

    if (step === 'checkout') {
      return this.renderCheckoutPage();
    }

    if (step === 'cart') {
      return this.renderCartPage();
    }

    if (step === 'options' && certificate) {
      return (
        <SeededCertificateOptionsPage
          id={certificate.id}
          quantity={quantity}
          backUrl={
            backUrl || `/death?q=${encodeURIComponent(query)}&page=${page}`
          }
          certificate={certificate}
          deathCertificateCart={this.cart}
          siteAnalytics={this.siteAnalytics}
          seedIncludeSsn={this.props.seedIncludeSsn}
        />
      );
    }

    if (step === 'certificate' && certificate) {
      return (
        <CertificatePage
          id={certificate.id}
          certificate={certificate}
          backUrl={
            backUrl ||
            (query
              ? `/death?q=${encodeURIComponent(query)}&page=${page}`
              : '/death')
          }
          deathCertificateCart={this.cart}
          siteAnalytics={this.siteAnalytics}
        />
      );
    }

    if (resultCount === null) {
      return (
        <SearchPage
          key="landing"
          query={query}
          page={1}
          results={null}
          siteAnalytics={this.siteAnalytics}
          deathCertificateCart={this.cart}
        />
      );
    }

    const pageCount = Math.max(1, Math.ceil(resultCount / PAGE_SIZE) || 1);
    const safePage = Math.min(Math.max(1, page), pageCount || 1);
    const startIdx = (safePage - 1) * PAGE_SIZE;
    const count =
      resultCount === 0
        ? 0
        : Math.min(PAGE_SIZE, Math.max(0, resultCount - startIdx));

    return (
      <SearchPage
        key={`results-${query}-${safePage}`}
        query={query}
        page={safePage}
        results={searchResultsPayload({
          page: safePage,
          resultCount,
          results: makePageResults(count, startIdx),
        })}
        siteAnalytics={this.siteAnalytics}
        deathCertificateCart={this.cart}
      />
    );
  }
}
