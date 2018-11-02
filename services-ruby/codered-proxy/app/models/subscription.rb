class Subscription
  include ActiveModel::Model

  attr_accessor :email, :phone_number, :call, :text
  attr_accessor :first_name, :last_name, :zip, :language, :tdd

  validate :email_or_phone?
  validate :call_or_text?
  if self.email.blank!
	validates_format_of :email,:with => /\A[^@\s]+@([^@\s]+\.)+[^@\s]+\z/
  end

  def call_or_text?
    if self.call.blank? && self.text.blank?
      errors.add :base, "Please select text or call"
    end
  end

  def email_or_phone?
    if self.phone_number.blank? && self.email.blank?
      errors.add :base, "Please enter an email address or phone number"
    end
  end
end
