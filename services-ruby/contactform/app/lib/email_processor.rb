class EmailProcessor
  def initialize(email)
    @email = email
  end

  def process
    token = get_emails(@email.to)

    unless token.nil?
      email = Email.find_by(token: token)

      unless email.nil?
        email.replied = Time.now
        email.save
      end
    end
  end

  private

  def get_email_token(addresses)
    token = nil

    addresses.each do |address|
      if address[:host] == ENV['EMAIL_HOST']
        token = address[:token]
      end
    end

    token
  end
end
