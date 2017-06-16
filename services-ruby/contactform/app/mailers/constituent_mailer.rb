class ConstituentMailer < ApplicationMailer
  def constituent_email(email)
    unless email[:attachments].nil?
      email[:attachments].each do |attachment|
        attachments[attachment[:name]] = {
          mime_type: attachment[:content_type],
          content: attachment[:content]
        }
      end
    end

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
