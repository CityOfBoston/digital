# README

### Setup

#### Dependencies

```
  docker run --name redis -p 6379:6379 -d redis
  docker run --rm --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

#### Initialization
```
  bin/rails db:create db:migrate
  bin/rails runner 'User.create(:name => "dev").tap {|u| u.save!; u.generate_auth_token; puts u.auth_token}'
```

### Running

`foreman start`
