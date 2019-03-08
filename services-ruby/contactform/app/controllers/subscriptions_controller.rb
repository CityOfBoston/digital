class SubscriptionsController < ApplicationController
  def create
    @subscriber = Subscriber.find_or_create_by(subscriber_params)

    if @subscriber.save
      SubscribeWorker.perform_async(@subscriber.profile_id, params[:list])
      render :json => {subscriber: @subscriber.profile_id, list: params[:list]}
    else
      render :json => {errors: @subscriber.errors}
    end
  end

  private

  def subscriber_params
    params.require(:subscriber).permit(:email, :zipcode)
  end
end
