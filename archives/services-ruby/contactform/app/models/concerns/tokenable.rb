module Tokenable
  extend ActiveSupport::Concern

  included do
    after_validation :set_token, on: [ :create ]
  end

  protected

  def set_token
    self.token = loop do
      random_token = SecureRandom.hex(6)
      break random_token unless self.class.exists?(token: random_token)
    end
  end
end
