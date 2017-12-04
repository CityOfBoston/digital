// flow-typed signature: f14b90f19a4f38b9bb1c1328c1cd2011
// flow-typed version: <<STUB>>/stripe_v5.3.0/flow_v0.56.0

import { type Agent } from 'https';

declare module 'stripe' {
  declare export type CheckResult = 'pass' | 'fail' | 'unavailable' | 'unchecked';

  declare export type Request = {|
    api_version: string,
    account?: string,
    idempotency_key?: string,
    method: string,
    path: string,
  |};

  declare export type Response = {|
    api_version: string,
    account?: string,
    idempotency_key?: string,
    method: string,
    path: string,
    status: number,
    request_id: string,
    elapsed: number,
  |};

  declare export type ErrorType =
    | 'api_connection_error'
    | 'api_error'
    | 'authentication_error'
    | 'card_error'
    | 'idempotency_error'
    | 'invalid_request_error'
    | 'rate_limit_error';

  declare export type CardErrorCode =
    | 'invalid_number'
    | 'invalid_expiry_month'
    | 'invalid_expiry_year'
    | 'invalid_cvc'
    | 'invalid_swipe_data'
    | 'incorrect_number'
    | 'expired_card'
    | 'incorrect_cvc'
    | 'incorrect_zip'
    | 'card_declined'
    | 'missing'
    | 'processing_error';

  declare export type Error = {|
    type: ErrorType,
    charge: string,
    message?: string,
    code?: CardErrorCode,
  |};

  declare export type ShippingInfo = {|
    address?: {|
      city: string,
      country: string,
      line1: string,
      line2: string,
      postal_code: string,
      state: string,
    |},
    carrier?: string,
    name?: string,
    phone?: string,
    tracking_number?: string,
  |};

  declare export type ChargeInput = {|
    amount: number,
    currency: string,
    application_fee?: number,
    capture?: boolean,
    description?: ?string,
    destination?: {|
      account: string,
      amount?: number,
    |},
    transfer_group?: string,
    on_behalf_of?: string,
    metadata?: {[key: string]: string},
    receipt_email?: string,
    shipping?: ShippingInfo,
    customer?: string,
    source?: string | {|
      exp_month: number,
      exp_year: number,
      number: string,
      object: 'card',
      cvc?: string,
      address_city?: string,
      address_country?: string,
      address_line1?: string,
      address_line2?: string,
      name?: string,
      address_state?: string,
      address_zip?: string,
    |},
    statement_description?: ?string,
  |};

  declare export type Token = {|
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

  declare export type Card = {|
    id: string,
    object: 'card',
    address_city: string,
    address_country: string,
    address_line1: string,
    address_line1_check: CheckResult,
    address_line2: string,
    address_state: string,
    address_zip: string,
    address_zip_check: CheckResult,
    brand: string,
    country: string,
    customer: ?string,
    cvc_check: CheckResult,
    dynamic_last4: ?string,
    exp_month: number,
    exp_year: number,
    fingerprint: string,
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown',
    last4: string,
    metadata: { [key: string]: string },
    name: string,
    tokenization_method: 'apple_pay' | 'android_pay' | null,
  |};
  
  declare export type Charge = {|
    id: string,
    object: 'charge',
    amount: number,
    amount_refunded: number,
    application: ?string,
    application_fee: ?string,
    balance_transaction: string,
    captured: boolean,
    created: number,
    currency: string,
    customer: ?string,
    description: ?string,
    destination: ?string,
    dispute: ?string,
    failure_code: ?string,
    failure_message: ?string,
    fraud_details: {
      user_report?: 'safe' | 'fraudulent',
      stripe_report?: 'fraudulent',
    },
    invoice: ?string,
    livemode: boolean,
    metadata: { [key: string]: string },
    on_behalf_of: ?string,
    order: ?string,
    outcome: ?{|
      network_status:
        | 'approved_by_network'
        | 'declined_by_network'
        | 'not_sent_to_network'
        | 'reversed_after_approval',
      reason: string,
      risk_level: 'normal' | 'elevated' | 'highest' | 'not_assesed' | 'unknown',
      rule: ?string,
      seller_message: string,
      type:
        | 'authorized'
        | 'manual_review'
        | 'issuer_declined'
        | 'blocked'
        | 'invalid',
    |},
    paid: boolean,
    receipt_email: ?string,
    receipt_number: ?string,
    refunded: boolean,
    refunds: {|
      object: 'list',
      data: Array<{|
        id: string,
        object: 'list',
        amount: number,
        balance_transaction: string,
        charge: string,
        created: number,
        currency: string,
        failure_balance_transaction: ?string,
        failure_reason:
          | 'lost_or_stolen_card'
          | 'expired_or_canceled_card '
          | 'unknown'
          | null,
        metadata: { [key: string]: string },
        reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | null,
        receipt_number: ?string,
        status: 'succeeded' | 'failed' | 'pending' | 'cancelled',
      |}>,
      has_more: boolean,
      total_count: number,
      url: string,
    |},
    review: ?string,
    shipping: ?ShippingInfo,
    source: Card,
    source_transfer: ?string,
    statement_descriptor: ?string,
    status: 'succeeded' | 'pending' | 'failed',
    transfer_group: ?string,
  |};

  // Can't collide with the global Stripe function from stripe.flow.js
  declare export type NodeStripe = {|
    setTimeout(ms: number): void,
    setHttpAgent(agent: Agent): void,
    
    charges: {|
      create: (
        charge: ChargeInput,
        cb?: (err: Error, charge: Charge) => mixed
      ) => Promise<Charge>,
    |},

    tokens: {|
      retrieve: (
        id: string,
        cb?: (err: Error, token: Token) => mixed
      ) => Promise<Token>,
    |},
  |};

  declare export default (secretKey: string) => NodeStripe;
}
