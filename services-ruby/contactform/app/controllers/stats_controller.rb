class StatsController < ApplicationController
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  if Rails.env.production?
    before_action :http_basic_authenticate
  end

  def index
    @count_total = Email.count
    @count_replied = Email.where.not(replied: nil).count
    @percentage = @count_replied / @count_total
    @repsonse_time = Email.where.not(response_time: nil).average(:response_time)
  end

  private

  def http_basic_authenticate
    authenticate_or_request_with_http_basic do |name, password|
      name == ENV["SIDEKIQ_USERNAME"] && password == ENV["SIDEKIQ_PASSWORD"]
    end
  end
end
