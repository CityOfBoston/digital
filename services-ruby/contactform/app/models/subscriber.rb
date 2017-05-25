class Subscriber < ApplicationRecord
  after_validation :set_profile, on: [ :create ]

  validates :email, presence: true, email: {disposable: true}
  validates :zip_code, zipcode: { country_code: :us }, allow_blank: true

  def set_profile
    self.profile_id = SecureRandom.hex(45)
  end
end
