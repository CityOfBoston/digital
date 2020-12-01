class SubscribeBot
  BOT_BASE_URI = ENV['API_BASE']
  BOT_HEADERS = {'Content-Type'=> "application/xml"}
  BOT_AUTH = "#{ENV['API_KEY']}:#{ENV['API_PASS']}"

  def initialize
    puts ENV['API_KEY']
    puts BOT_BASE_URI
    puts BOT_HEADERS
  end

  def check_subscriber(profile_id)
    return Typhoeus::Request.get("#{BOT_BASE_URI}/subscribers/#{profile_id}",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS
    )
  end

  def resubscribe(profile_id)
    return Typhoeus::Request.get("#{BOT_BASE_URI}/subscribers/#{profile_id}/resubscribe",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS
    )
  end

  def validate_email(email)
    return Typhoeus::Request.get("#{BOT_BASE_URI}/subscribers/#{email}/validate",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS
    )
  end

  def subscribe(subscriber, list)
    return Typhoeus::Request.post("#{BOT_BASE_URI}/subscribers",
      userpwd: BOT_AUTH,
      headers: BOT_HEADERS,
      body: build_subscriber(subscriber, list)
    )
  end

  private

  def build_subscriber(subscriber, list)
    subscriber = {
      email: subscriber.email,
      zipcode: subscriber.zipcode,
      subscriptions: {
        subscription: {
          newsletter_id: list
        }
      },
      existing_update: "true"
    }

    return subscriber.to_xml(root: "subscriber")
  end
end
