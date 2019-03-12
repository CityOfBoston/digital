class ContactMailer < ApplicationMailer
  def city_email(email)
    @email = email

    mail(
      to: @email.to_address,
      from: get_from(@email),
      reply_to: get_reply_to(@email),
      subject: @email.subject
    )
  end

  private

  def get_user_email(email)
    return "#{@email.name} <#{@email.from_address}>"
  end

  # "From" address needs to be boston.gov because that’s the only way Postmark will
  # send it.
  def get_from(email)
    return "Boston.gov Contact Form <#{email.token}@#{ENV['EMAIL_HOST']}>"
  end

  def get_reply_to(email)
    return [get_user_email(email), get_from(email)]
  end
end
