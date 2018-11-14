# These are the values that CodeRed requires for its API. We use ISO 639
# language codes elsewhere to avoid fragility.
CODERED_LANGUAGES = {
  "en" => "English",
  "zh_TW" => "Chinese (Traditional, Hong Kong S.A.R.)",
  "fr" => "French (France)",
  "es" => "Spanish",
}

LANGUAGE_GROUPS = {
  "en" => "English",
  "zh_TW" => "Traditional Chinese",
  "fr" => "French",
  "es" => "Spanish",
}

LANGUAGE_NAMES = {
  "en" => "English",
  "zh_TW" => "繁體中文",
  "fr" => "Français",
  "es" => "Español",
}

class Subscription
  include ActiveModel::Model

  attr_accessor :email, :phone_number, :call, :text
  attr_accessor :first_name, :last_name, :zip, :language, :tdd

  validate :email_or_phone?

  def email_or_phone?
    if self.phone_number.blank? && self.email.blank?
      errors.add :base, "Please enter an email address or phone number"
    end
  end

  def as_json(opts)
    {
      :email => self.email,
      :phone_number => self.phone_number,
      :call => self.call,
      :text => self.text,
      :first_name => self.first_name,
      :last_name => self.last_name,
      :zip => self.zip,
      :lanugage => self.language,
      :language_name => self.language_name,
      :tdd => self.tdd,
    }
  end

  def language
    @language || 'en'
  end

  def language_name
    LANGUAGE_NAMES[self.language]
  end

  def language_group
    LANGUAGE_GROUPS[self.language]
  end

  def codered_language
    CODERED_LANGUAGES[self.language] || CODERED_LANGUAGES['en']
  end

  def groups
    groups = ENV['API_GROUPS'].split(',')

    # Need to wait until CodeRED has these groups defined
    if ENV['USE_LANGUAGE_GROUPS']
      groups << self.language_group
      if self.language != 'en'
        groups << 'Non English'
      end
    end

    groups
  end
end
