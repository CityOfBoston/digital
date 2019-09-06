# Group Management

(GraphQL/REST) API that connects and interacts with Access-Boston's Internal user directory. This API allows you to retrieve Groups and Person information.

## Development

We a GraphQL endpoint that allows you to get Groups and Persons, and update Groups.

```json
# Find Person by cn (min-char: 3 || returns error obj)
query {
  person(cn: "050") { dn, cn }
}

# Returns
{
  "data": {
    "person": [
      {
        "dn": "cn=050086,cn=Internal Users,dc=boston,dc=cob",
        "cn": "050086"
      }
    ]
  }
}
```
