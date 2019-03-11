class EmailsController < ApplicationController
  if Rails.env.production?
    before_action :require_login!
  end

  def create
    @email = Email.new(email_params)

    # We need to prevent Google Groups from thinking that the contact form is trying to
    # unsubscribe from whatever distribution list is the recipient of the email.
    if @email.subject =~ /unsubscribe/i || @email.subject =~ /remove me/i
      @email.subject = "Subscription question"
    end

    @email.ip = request.remote_ip
    @email.sent = DateTime.now.utc

    if @email.save
      ContactMailer.city_email(@email).deliver_later
      render :json => {email: @email.id}
    else
      render :status => 400, :json => {errors: @email.errors}
    end
  end

  private

  def email_params
    params.require(:email).permit(:name, :email, :message, :subject, :browser, :url, :from_address, :to_address)
  end
end
