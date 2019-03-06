require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'shared/shared_mailer_tests'

class ActiveSupport::TestCase
  include ActiveJob::TestHelper

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...
end

class ActionMailer::TestCase
  include SharedMailerTests
end
