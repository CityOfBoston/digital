class SubscriptionsController < ApplicationController
  def create
    @subscriber = Subscriber.find_or_create_by(subscriber_params)

    if @subscriber.save
      SubscribeWorker.perform_async(@subscriber)
      render :json => {subscriber: @subscriber.profile_id, list: params[:list]}
    else
      render :json => {errors: @subscriber.errors}
    end
  end

  private

  def subscriber_params
    params.require(:subscriber).permit(:email, :zip_code, :list)
  end
end
