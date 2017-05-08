require 'test_helper'

class SubscriptionTest < ActiveSupport::TestCase
  test "should not save subscription without email or phone" do
    subscripton = Subscription.new
    subscripton.call = true
    subscripton.first_name = 'Elah'
    assert_not subscripton.save
  end

  test "should not save subscription without call or text" do
    subscripton = Subscription.new
    subscripton.call = false
    subscripton.text = false
    subscripton.first_name = 'Elah'
    subscripton.email = 'e@e.com'
    assert_not subscripton.save
  end

  test "should not save subscription without valid email" do
    subscripton = Subscription.new
    subscripton.call = true
    subscripton.text = false
    subscripton.first_name = 'Elah'
    subscripton.email = 'e'
    assert_not subscripton.save
    subscripton.email = 'e@io'
    assert_not subscripton.save
    subscripton.email = 'e@example.com'
    assert subscripton.save
    subscripton.email = 'e@example.io'
    assert subscripton.save
  end
end
