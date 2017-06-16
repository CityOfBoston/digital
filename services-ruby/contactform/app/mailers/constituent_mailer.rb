class ConstituentMailer < ApplicationMailer
  def constituent_email(email)
    mail(
      to: email[:to_address],
      from: get_from(email),
      cc: email[:cc],
      bcc: email[:bcc],
      reply_to: email[:from_address],
      subject: email[:subject],
      body: email[:body]
    )
  end

  private

  def get_from(email)
    return "Reply from City of Boston <#{email[:token]}@#{ENV['EMAIL_HOST']}>"
  end
end
