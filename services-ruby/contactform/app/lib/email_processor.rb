class EmailProcessor
  def initialize(email)
    @email = email
  end

  def process
    to_address = get_emails(@email.to)

    unless to_address.blank?
      email_to_send = {
        :from_address => @email.from[:full],
        :to_address => get_emails(@email.to),
        :cc => get_emails(@email.cc),
        :bcc => get_emails(@email.bcc),
        :subject => @email.subject,
        :body => @email.body,
        :token => get_token(@email.to)
      }

      if is_allowed_host?
        ConstituentMailer.constituent_email(email_to_send).deliver_later
      else
        puts "Host not allowed"
      end
    end
  end

  private

  def get_token(addresses)
    token = nil

    addresses.each do |address|
      if address[:host] == ENV['EMAIL_HOST']
        token = address[:token]
      end
    end

    token
  end

  def get_emails(addresses)
    address_array = []

    addresses.each do |address|
      if address[:host] == ENV['EMAIL_HOST']
        email = Email.find_by(token: address[:token])

        unless email.nil?
          address_array << email.from_address

          if email.replied.nil?
            email.update(replied: Time.now)
          end
        end
      else
        address_array << address[:full]
      end
    end

    address_array
  end

  def is_allowed_host?
    allowed_hosts = ENV['ALLOWED_EMAIL_HOSTS'].split(/\s*,\s*/)
    return allowed_hosts.include?(@email.from[:host])
  end
end
