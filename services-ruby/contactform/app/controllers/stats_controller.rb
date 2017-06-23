class StatsController < ActionController::Base
  layout "application"
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  if Rails.env.production?
    before_action :http_basic_authenticate
  end

  def index
    @count_total = Email.count
    @count_replied = Email.where.not(replied: nil).count
    @percentage = (@count_replied.to_f / @count_total.to_f) * 100

    response_time = Email.where.not(response_time: nil).average(:response_time)

    unless response_time.nil?
      @repsonse_time = response_time / 1.hour
    end
  end

  private

  def http_basic_authenticate
    authenticate_or_request_with_http_basic do |name, password|
      name == ENV["SIDEKIQ_USERNAME"] && password == ENV["SIDEKIQ_PASSWORD"]
    end
  end
end
