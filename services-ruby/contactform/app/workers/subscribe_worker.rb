class SubscribeWorker
  include Sidekiq::Worker

  def perform(profile_id, list)
    bot = SubscribeBot.new

    subscriber = Subscriber.find_by!(profile_id: profile_id)

    response = bot.subscribe(subscriber, list)

    if response.code == 200
      subscriber_details = Hash.from_xml(response.body)

      unless subscriber_details["result"]["profile_id"].nil?
        status_check = bot.check_subscriber(subscriber_details["result"]["profile_id"])
        status_response = Hash.from_xml(status_check.body)

        unless status_response["subscriber"]["status"]
          bot.resubscribe(subscriber_details["result"]["profile_id"])
        end

        subscriber.destroy!
      end
    end
  end
end
