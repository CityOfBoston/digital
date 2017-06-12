class ContactMailer < ApplicationMailer
  def city_email(email)
    mail(
      to: email.to_address,
      from: email.from_address,
      reply_to: get_reply_to(email.token),
      subject: email.subject,
      body: email.message
    )
  end

  private

  def get_reply_to(token)
    return "#{token}@#{ENV['EMAIL_HOST']}"
  end
end
