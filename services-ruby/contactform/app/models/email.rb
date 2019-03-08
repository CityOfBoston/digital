class Email < ApplicationRecord
  include Tokenable

  validates :from_address, presence: true, email: {disposable: true}
  validates :to_address, presence: true
  validates :message, presence: true
end
