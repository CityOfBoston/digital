class EmailProcessor
  def initialize(email)
    @email = email
  end

  def process
    email_to_send = {
      :from_address => @email.from[:full],
      :to_address => get_emails(@email.to),
      :cc => get_emails(@email.cc),
      :bcc => get_emails(@email.bcc),
      :subject => @email.subject,
      :body => @email.raw_body
    }

    if is_allowed_host?
      ConstituentMailer.constituent_email(email_to_send).deliver_later
    else
      puts "Host not allowed"
    end
  end

  private

  def get_emails(addresses)
    address_array = []

    addresses.each do |address|
      address_array << address[:full]
    end

    address_array
  end

  def is_allowed_host?
    allowed_hosts = ENV['ALLOWED_EMAIL_HOSTS'].split(/\s*,\s*/)
    return allowed_hosts.include?(@email.from[:host])
  end
end
