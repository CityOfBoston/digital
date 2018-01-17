require 'test_helper'

class SubscriptionTest < ActiveSupport::TestCase
  test "should not validate subscription without email or phone" do
    subscripton = Subscription.new
    subscripton.call = '1'
    subscripton.first_name = 'Elah'
    assert_not subscripton.valid?
  end

  test "should not validate subscription without call or text" do
    subscripton = Subscription.new
    subscripton.first_name = 'Elah'
    subscripton.email = 'e@e.com'
    assert_not subscripton.valid?
  end

  test "should not validate subscription without valid email" do
    subscripton = Subscription.new
    subscripton.call = '1'
    subscripton.first_name = 'Elah'
    subscripton.email = 'e'
    assert_not subscripton.valid?
    subscripton.email = 'e@io'
    assert_not subscripton.valid?
    subscripton.email = 'e@example.com'
    assert subscripton.valid?
    subscripton.email = 'e@example.io'
    assert subscripton.valid?
  end
end
