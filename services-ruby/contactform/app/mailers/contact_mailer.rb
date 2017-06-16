class ContactMailer < ApplicationMailer
  def city_email(email)
    mail(
      to: email.to_address,
      from: get_reply_to(email),
      reply_to: get_reply_to(email),
      subject: email.subject,
      body: email.message
    )
  end

  private

  def get_reply_to(email)
    return "Boston.gov Contact Form <#{email.token}@#{ENV['EMAIL_HOST']}>"
  end
end
