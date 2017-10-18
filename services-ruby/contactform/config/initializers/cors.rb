Rails.application.config.middleware.insert_before 0, Rack::Cors do
  origins = (ENV['ORIGINS'] || '').split(',')

  # Lets us put a matcher in for *.boston.gov so that all our webapps can handle
  # this, rather than having to enumerate each one.
  if !ENV['CORS_DOMAIN_ORIGIN'].nil?
    origins << /^https:\/\/.*\.#{Regexp.escape(ENV['CORS_DOMAIN_ORIGIN'])}$/
  end

  allow do
    origins origins
    resource '*',
      headers: :any,
      methods: %i(post)
  end
end
