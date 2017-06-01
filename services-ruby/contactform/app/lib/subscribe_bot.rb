class SubscribeBot
  BOT_BASE_URI = ENV['API_BASE']
  BOT_HEADERS = {'Content-Type'=> "application/xml"}
  BOT_AUTH = "#{ENV['API_KEY']}:#{ENV['API_PASS']}"

  def initialize
    puts BOT_AUTH
    puts BOT_BASE_URI
    puts BOT_HEADERS
  end

  def check_subscriber(id)
    response = Typhoeus::Request.get("#{BOT_BASE_URI}/subscribers/#{id}",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS
    )
  end

  def create_subscriber(contact)
    response = Typhoeus::Request.post("#{BOT_BASE_URI}/subscribers",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS,
      body: contact.to_xml( :only => [:email, :profile_id, :zipcode] )
    )
  end

  def add_subscription(contact, list)
    response = Typhoeus::Request.post("#{BOT_BASE_URI}/subscribers/#{contact}/subscriptions",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS,
      body: {subscription: {newsletter_id: list}}.to_xml(root: "subscriptions")
    )
  end

  def validate_email(email)
    response = Typhoeus::Request.get("#{BOT_BASE_URI}/subscribers/#{email}/validate",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS
    )
  end
end
