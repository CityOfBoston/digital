// @flow
/* eslint no-unused-vars: 0 */

type StripeElementType =
  | 'card'
  | 'cardNumber'
  | 'cardExpiry'
  | 'cardCvc'
  | 'postalCode'
  | 'paymentRequestButton';

type StripeStyleOptions = {|
  color?: string,
  fontFamily?: string,
  fontSize?: string,
  fontSmoothing?: string,
  fontStyle?: string,
  fontVariant?: string,
  iconColor?: string,
  lineHeight?: string,
  letterSpacing?: string,
  textAlign?: string,
  textDecoration?: string,
  textShadow?: string,
  textTransform?: string,
  ':hover'?: StripeStyleOptions,
  ':focus'?: StripeStyleOptions,
  '::placeholder'?: StripeStyleOptions,
  '::selection'?: StripeStyleOptions,
  ':-webkit-autofill'?: StripeStyleOptions,
  '::-ms-clear'?: { display?: string },
  paymentRequestButton?: {
    type?: 'default' | 'donate' | 'buy',
    theme?: 'dark' | 'light' | 'light-outline',
    height?: number,
  },
|};

type StripeElementOptions = {|
  classes?: {
    base?: string,
    complete?: string,
    empty?: string,
    focus?: string,
    invalid?: string,
    webkitAutofill?: string,
  },
  hidePostalCode?: boolean,
  hideIcon?: boolean,
  iconStyle?: 'solid' | 'default',
  placeholder?: string,
  style?: {
    base?: StripeStyleOptions,
    complete?: StripeStyleOptions,
    empty?: StripeStyleOptions,
    invalid?: StripeStyleOptions,
  },
  value?: string | { [key: string]: string },
|};

type StripeCheckResult = 'pass' | 'fail' | 'unavailable' | 'unchecked';

type StripeElementChangeEvent = {
  brand: string,
  complete: boolean,
  empty: boolean,
  error: ?{
    code: string,
    message: string,
    type: string,
  },
  value: { [key: string]: string },
};

declare class StripeElement {
  mount(el: string | HTMLElement): void,
  on(
    event: 'change',
    handler: (event: StripeElementChangeEvent) => mixed
  ): void,
  on(event: 'blur' | 'click' | 'focus' | 'ready', handler: () => mixed): void,
  blur(): void,
  clear(): void,
  destroy(): void,
  focus(): void,
  unmount(): void,
  update(options: StripeElementOptions): void,
}

type StripeElements = {|
  create(
    elementType: StripeElementType,
    options?: StripeElementOptions
  ): StripeElement,
|};

type StripeToken = {|
  id: string,
  object: 'token',
  card: {
    id: string,
    object: 'card',
    address_city: ?string,
    address_country: ?string,
    address_line1: ?string,
    address_line1_check: ?StripeCheckResult,
    address_line2: ?string,
    address_state: ?string,
    address_zip: ?string,
    address_zip_check: ?StripeCheckResult,
    brand: string,
    country: string,
    cvc_check: ?StripeCheckResult,
    dynamic_last4: ?string,
    exp_month: number,
    exp_year: number,
    fingerprint: string,
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown',
    last4: string,
    metadata: { [key: string]: string },
    name: ?string,
    tokenization_method: 'apple_pay' | 'android_pay' | null,
  },
  client_ip: ?string,
  created: number,
  livemode: boolean,
  type: 'card' | 'bank_account',
  used: boolean,
|};

type StripeTokenResult =
  | {|
      token: StripeToken,
    |}
  | {|
      error: any,
    |};

type StripeCardData = {|
  name?: ?string,
  address_line1?: ?string,
  address_line2?: ?string,
  address_city?: ?string,
  address_state?: ?string,
  address_zip?: ?string,
  address_country?: ?string,
|};

type StripeInstance = {|
  elements: () => StripeElements,
  createToken: (
    element: StripeElement,
    cardData?: StripeCardData
  ) => Promise<StripeTokenResult>,
|};

declare function Stripe(publishableKey: string): StripeInstance;
