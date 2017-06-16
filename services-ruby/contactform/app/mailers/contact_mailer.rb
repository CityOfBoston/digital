class ContactMailer < ApplicationMailer
  def city_email(email)
    @email = email

    mail(
      to: @email.to_address,
      from: get_from(@email),
      reply_to: get_reply_to(@email),
      subject: @email.subject,
      message: @email.message
    )
  end

  private

  def get_from(email)
    return "Boston.gov Contact Form <#{email.token}@#{ENV['EMAIL_HOST']}>"
  end

  def get_reply_to(email)
    return "#{email.token}@#{ENV['EMAIL_HOST']}, #{@email.from_address}"
  end
end
