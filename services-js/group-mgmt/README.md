# Group Management

(GraphQL/REST) API that connects and interacts with Access-Boston's Internal user directory. This API allows you to retrieve Groups and Person information.

## Development

We a GraphQL endpoint that allows you to get Groups and Persons, and update Groups.

```graphql
# Find Person by cn (min-char: 3 || returns error obj)
query {
  personSearch(cn: "050") { dn, cn }
}
```