web: bundle exec puma -b "ssl://127.0.0.1:$PORT?key=server.key&cert=server.crt"
worker: bundle exec sidekiq -c 3
