class EmailsController < ApplicationController
  def create
    @email = Email.new(email_params)
    @email.ip = request.remote_ip
    @email.sent = DateTime.now.utc

    if @email.save
      render :json => {email: @email.id}
    else
      render :json => {errors: @email.errors}
    end
  end

  private

  def email_params
    params.require(:email).permit(:email, :message, :subject, :browser, :url, :from_address, :to_address)
  end
end
