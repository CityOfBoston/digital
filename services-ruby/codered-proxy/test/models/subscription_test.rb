require 'test_helper'

class SubscriptionTest < ActiveSupport::TestCase
  test "should not validate subscription without email or phone" do
    subscripton = Subscription.new
    subscripton.call = '1'
    subscripton.first_name = 'Elah'
    assert_not subscripton.valid?
  end

end
