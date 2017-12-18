# payment-webhooks-server

[![Build Status](https://travis-ci.org/CityOfBoston/payment-webhooks-server.svg?branch=develop)](https://travis-ci.org/CityOfBoston/payment-webhooks-server)
[![codecov](https://codecov.io/gh/CityOfBoston/payment-webhooks-server/branch/develop/graph/badge.svg)](https://codecov.io/gh/CityOfBoston/payment-webhos-serverok)
[![Greenkeeper badge](https://badges.greenkeeper.io/CityOfBoston/payment-webhooks-server.svg)](https://greenkeeper.io/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Service to update iNovah based on webhook calls from a payment provider

## Testing

Run `npm run dev` first to set up the server.

### `charge.succeeded` webhook
```
npm run test-latest-charge
```

This requires at least one charge in Stripe.
