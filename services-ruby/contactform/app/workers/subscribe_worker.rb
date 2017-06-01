class SubscribeWorker
  include Sidekiq::Worker

  def perform(subscriber, list)
    bot = SubscribeBot.new

    # Add the subscriber
    subscriber_check = bot.check_subscriber(subscriber)

    if subscriber_check.code === 200
      subscription = bot.add_subscription(subscriber, list)
    else
      subscriber = Subscriber.find_by(profile_id: subscriber)
      subscriber_check = bot.create_subscriber(subscriber)

      if subscriber_check.code === 201
        subscription = bot.add_subscription(subscriber.profile_id, list)
      end
    end
  end
end
