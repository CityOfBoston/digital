# README

### Setup

#### Dependencies

```
  docker run --rm --name redis -p 6379:6379 -d redis
  docker run --rm --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

### Initialization
```
  bin/rails db:create db:migrate
  bundle exec rake users:add["App Name"]
```

### Development

`foreman start`

### Production

#### Adding a new app

To post feedback to this app, use the `<cob-contact-form>` custom element
provided in the [Fleet patterns library](https://patterns.boston.com/). The
component documentation can be found here:
https://patterns.boston.gov/components/detail/contact_form.html

Each site that sends feedback through this app needs two things:

1. Its own app token
1. To be whitelisted by the CORS configuration

To create an app token, run `bundle exec rake users:add["App Name"]`. The token
will be written to STDERR. This should be done by running a custom task in ECS,
with the overwritten command:

`bundle,exec,rake,users:add["App Name"]`

To use the token, include it as the `token` attribute in the
`<cob-contact-form>` custom element.

By default, all apps on *.boston.gov are whitelisted by CORS, so you may not
have to do anything. To add additional domains, include them in the `ORIGINS`
environment variable (in .env), which is a comma-separated list of domains.

#### Looking up an email

To see the metadata associated with an email, you can look up all emails from a
given address in production.

Run `bundle exec rake emails:search["foo@example.com"]`. The matching email
records will be written to STDERR as JSON objects. This should be done by
running a custom task in ECS, with the overwritten command:

`bundle,exec,rake,emails:search["foo@example.com"]`

#### Restoring the DB

1. Get a `pg_dump` custom-formatted dump file
1. Upload it to the config bucket at `db/cob_contact.dump`
1. Run a one-off task with:
  - `DISABLE_DATABASE_ENVIRONMENT_CHECK=1`
  - `rake db:restore`
1. Delete the dump file from the bucket

Putting the dump file in the config bucket is a simple way to get it loaded into
a container.

### Testing

#### Upaknee subscriptions

```
curl -k -X POST -d "subscriber[email]=XXXXXXX" -d "subscriber[zipcode]=02201" 'https://localhost:5000/subscriptions?list=2' 
```
