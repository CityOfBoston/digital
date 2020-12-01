class User < ApplicationRecord
  def generate_auth_token
    token = SecureRandom.hex(30)
    self.update_columns(auth_token: token)
    token
  end

  def invalidate_auth_token
    self.update_columns(auth_token: nil)
  end
end
