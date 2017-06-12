class ConstituentMailer < ApplicationMailer
  def constituent_email(email)
    mail(
      to: 'hi@hondo.co',
      from: email[:from_address],
      cc: email[:cc],
      bcc: email[:bcc],
      reply_to: email[:from_address],
      subject: email[:subject],
      body: email[:body]
    )
  end
end
