class SubscribeWorker
  include Sidekiq::Worker

  def perform(profile_id, list)
    bot = SubscribeBot.new

    check_response = bot.check_subscriber(profile_id)
    
    if check_response.code === 200
      upankee_subscriber = Hash.from_xml(check_response.body)

      # Handles the case where the email address was sent a
      # verification email in the past that it never responded
      # to. Resubscribe causes another email to be sent.
      if upankee_subscriber["subscriber"]["status"] === 'pending'
        bot.resubscribe(profile_id)
      end

      bot.add_subscription(profile_id, list)
    else
      subscriber = Subscriber.find_by!(profile_id: profile_id)
      create_response = bot.create_subscriber(subscriber)

      if create_response.code === 201
        bot.add_subscription(subscriber.profile_id, list)
      end
    end
  end
end
