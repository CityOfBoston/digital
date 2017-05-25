class SubscribeWorker
  include Sidekiq::Worker

  def perform(subscriber)
    # Do something
  end
end
