class ContactMailer < ApplicationMailer
  def city_email(email)
    mail(
      to: email.to_address,
      from: email.from_address,
      reply_to: get_reply_to(email),
      subject: email.subject,
      body: email.message
    )
  end

  private

  def get_reply_to(email)
    domain = Mail::Address.new(email.to_address).domain
    allowed_hosts = ENV['ALLOWED_EMAIL_HOSTS'].split(/\s*,\s*/)

    if allowed_hosts.include?(domain)
      return "#{email.token}@#{ENV['EMAIL_HOST']}"
    else
      return email.to_address
    end
  end
end
