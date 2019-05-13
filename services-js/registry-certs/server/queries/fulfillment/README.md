These queries are used by the fulfillment server.

We went with persisted queries so that the backend doesn’t need to worry about
GraphQL.

### Testing

```
curl -X POST \
  http://localhost/graphql \
  -H 'Content-Type: application/json' \
  -d '{
	"id": "charge-bc-order-v1",
	"variables": {
		"orderId": "RG-BC201902-298421",
		"transactionId": "ch_1E4DgmHEIqCf0Nlg5JtZqN6E"
	}
}'
```

The persisted query mechanism is also tested as part of the server unit tests.
