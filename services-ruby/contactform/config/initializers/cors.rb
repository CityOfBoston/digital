Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['ORIGINS']
    resource '*',
      headers: :any,
      methods: %i(post)
  end
end
