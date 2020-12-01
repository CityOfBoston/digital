class Api::SubscriptionsController < Api::BaseController
  TRACKER = Staccato.tracker(ENV['GA_TRACKING'])

  def create
    # Track the initial event
    TRACKER.pageview(path: '/api/subscriptions')

    subscription = Subscription.new(subscription_params)

    if subscription.valid?
      code_red = CodeRed.new
      contact_added = code_red.add_contact(subscription)

      if contact_added
        # Track the success event
        TRACKER.event(category: 'subscription', action: 'success', label: 'success')

        render :json => { :contact => subscription }, :status => 200
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
      params.permit(:email, :phone_number, :call, :text, :first_name, :last_name, :zip, :language, :tdd)
    end
end
