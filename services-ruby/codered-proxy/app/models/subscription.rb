class Subscription < ApplicationRecord
  validate :email_or_phone?
  validate :call_or_text?
  validates_format_of :email,:with => /\A[^@\s]+@([^@\s]+\.)+[^@\s]+\z/

  def call_or_text?
    if %w(call text).all?{|attr| self[attr].blank?}
      errors.add :base, "Please select text or call"
    end
  end

  def email_or_phone?
    if %w(phone_number email).all?{|attr| self[attr].blank?}
      errors.add :base, "Please enter an email address or phone number"
    end
  end
end
