require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test "User should generate new token" do
    u = users(:city)

    u.generate_auth_token
    assert_not_nil(u.auth_token)

    u.invalidate_auth_token
    u.generate_auth_token
    assert_not_nil(u.auth_token)
  end

  test "User should invalidate token" do
    u = users(:city)

    u.generate_auth_token
    u.invalidate_auth_token
    assert_nil(u.auth_token)
  end

  test "User should be found" do
    u = User.find_by_auth_token(users(:with_token).auth_token)

    assert_equal(u.name, users(:with_token).name)
  end
end
