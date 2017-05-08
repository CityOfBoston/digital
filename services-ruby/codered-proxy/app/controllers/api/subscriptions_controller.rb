class Api::SubscriptionsController < Api::BaseController
  def create
    render json: { errors: [ { detail:"Error with your login or password" }]}, status: 401
  end
end
