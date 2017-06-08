require 'test_helper'

class EmailsControllerTest < ActionDispatch::IntegrationTest
  test 'email is enqueued to be delivered later' do
    assert_enqueued_jobs 1 do
      post emails_url, :params => {
        :email => {
          :from_address => 'matthew.crist@boston.gov',
          :to_address => 'digital@boston.gov',
          :message => 'This is a test',
          :subject => 'Test subject',
          :url => 'https://www.boston.gov'
        }
      }
    end
  end

  test 'email is delivered with expected content' do
    perform_enqueued_jobs do
      post emails_url, :params => {
        :email => {
          :from_address => 'matthew.crist@boston.gov',
          :to_address => 'digital@boston.gov',
          :message => 'This is a test',
          :subject => 'Test subject',
          :url => 'https://www.boston.gov'
        }
      }

      delivered_email = ActionMailer::Base.deliveries.last

      # assert our email has the expected content, e.g.
      assert_includes delivered_email.to, 'digital@boston.gov'
      assert_includes delivered_email.body, 'This is a test'
    end
  end
end
