class Api::SubscriptionsController < Api::BaseController
  TRACKER = Staccato.tracker(ENV['GA_TRACKING'])

  def create
    # Track the initial event
    TRACKER.pageview(path: '/api/subscriptions')

    subscription = Subscription.create(subscription_params)

    if subscription.valid?
      code_red = CodeRed.new
      contact_added = code_red.add_contact(subscription)

      @real_subscription = subscription.dup

      if contact_added
        subscription.email = Faker::Internet.email
        subscription.phone_number = Faker::PhoneNumber.phone_number
        subscription.call = true
        subscription.text = true
        subscription.uuid = contact_added
        subscription.first_name = Faker::Name.first_name
        subscription.last_name = Faker::Name.last_name
        subscription.zip = Faker::Address.zip
        subscription.save!

        # Track the success event
        TRACKER.event(category: 'subscription', action: 'success', label: 'success')

        render :json => { :contact => @real_subscription }, :status => 200
      else
        # Track the failure event
        TRACKER.event(category: 'subscription', action: 'failure', label: 'failure')

        render :json => { :errors => "We were unable to subscribe you to emergency alerts. Please contact <a href='mailto:311@boston.gov'>311@boston.gov</a> for help." }, :status => 422
      end
    else
      render :json => { :errors => subscription.errors.full_messages }, :status => 422
    end
  end

  private

    def subscription_params
      params.permit(:email, :phone_number, :call, :text, :first_name, :last_name, :zip)
    end
end
