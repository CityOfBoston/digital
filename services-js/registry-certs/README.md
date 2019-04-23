<img src="https://cloud.githubusercontent.com/assets/9234/19400090/8c20c53c-9222-11e6-937c-02bce55e5301.png" alt="City of Boston" width="150" />

The source code for ordering registry certificates online.

[![Build Status](https://travis-ci.org/CityOfBoston/registry-certs.svg?branch=develop)](https://travis-ci.org/CityOfBoston/registry-certs)

## Developers

This is a Node project using the [Next.js](https://github.com/zeit/next.js/)
framework for server-side rendering.

 * **Development Server**: `yarn dev` <http://localhost:3000/>
 * **React Storybook**: `yarn storybook` <http://localhost:9001/>
 * **Tests**: `yarn test`

 ## Testing

You can use GraphiQL to run GraphQL queries against the backend: <http://localhost:3000/graphiql>

Test query for submitting a death certificate order:

(You will need to update `idempotencyKey` in each request.)

```
mutation {
  submitDeathCertificateOrder(
    contactName: "Jyn Doe"
    contactEmail: "jyn@fake.com"
    contactPhone: "5551234567"
    shippingName: "Jyn Doe"
    shippingAddress1: "123 Fake St."
    shippingCity: "Boston"
    shippingState: "MA"
    shippingZip: "02210"
    cardToken: "tok_visa"
    cardLast4: "1234"
    cardholderName: "Jyn X. Doe"
    billingAddress1: "321 Faux Pl."
    billingAddress2: ""
    billingCity: "Boston"
    billingState: "MA"
    billingZip: "02211"
    idempotencyKey: "1234"
    items: [{
      id: "1234"
      name: "Robert Frost"
      quantity: 11
    }]
  ) {
    id
  } 
}
 ```

Stripe has a [list of card numbers and
tokens](https://stripe.com/docs/testing#cards) that cause different API
responses in test.

### Testing on IE11

Next.js’s hot-reloading dev mode is not supported in IE11. You will need to run
`npm run build` to compile the JS and then run `npm run dev` with the
`USE_BUILD` environment variable set.

Don’t forget to re-compile the JS when you change it.
