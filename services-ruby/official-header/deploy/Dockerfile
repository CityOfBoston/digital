FROM ruby:2.5

ENV WORKSPACE=official-header

WORKDIR /app

# throw errors if Gemfile has been modified since Gemfile.lock
RUN bundle config --global frozen 1

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

RUN ls

CMD ["bundle", "exec", "rackup", "-E", "production"]
EXPOSE 9292
