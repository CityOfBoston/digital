# payment-webhooks-server

[![Build Status](https://travis-ci.org/CityOfBoston/payment-webhooks-server.svg?branch=develop)](https://travis-ci.org/CityOfBoston/payment-webhooks-server)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Service to update iNovah based on webhook calls from a payment provider

## Testing

### `charge.succeeded` webhook
```
env SKIP_IDEMPOTENCY_CHECKS=1 npm run dev
npm run test-latest-charge
```

This requires at least one charge in Stripe.
