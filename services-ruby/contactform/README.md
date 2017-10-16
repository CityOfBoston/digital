# README

### Setup

#### Dependencies

```
  docker run --rm --name redis -p 6379:6379 -d redis
  docker run --rm --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

#### Initialization
```
  bin/rails db:create db:migrate
  bin/rails runner 'User.create(:name => "dev").tap {|u| u.save!; u.generate_auth_token; puts u.auth_token}'
```

### Running

`foreman start`


### Restoring the DB

1. Get a `pg_dump` custom-formatted dump file
1. Upload it to the config bucket at `db/cob_contact.dump`
1. Run a one-off task with:
  - `DISABLE_DATABASE_ENVIRONMENT_CHECK=1`
  - `rake db:restore`
1. Delete the dump file from the bucket

Putting the dump file in the config bucket is a simple way to get it loaded into
a container.
