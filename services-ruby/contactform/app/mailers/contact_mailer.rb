class ContactMailer < ApplicationMailer
  def city_email(email)
    mail(
      to: email.to_address,
      from: email.from_address,
      subject: email.subject,
      body: email.message
    )
  end
end
