web: bundle exec puma -b "ssl://0.0.0.0:$PORT?key=server.key&cert=server.crt"
worker: bundle exec sidekiq -c 3
