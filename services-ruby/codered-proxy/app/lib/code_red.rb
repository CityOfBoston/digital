class CodeRed
  include HTTParty
  base_uri ENV['API_BASE']
  debug_output if Rails.env.development?

  def initialize
    login_response = self.class.post(
      '/api/login',
      body: {
        username: ENV['API_USER'],
        password: ENV['API_PASS']
      }
    )

    @cookie = login_response.header['Set-Cookie']
  end

  def add_contact(subscription)
    contact_response = self.class.post(
      '/api/contacts',
      headers: {
        'Cookie' => @cookie
      },
      body: create_contact_for_post(subscription)
    )

    if contact_response.code == 201
      return contact_response["CustomKey"]
    else
      return false
    end
  end

  def contacts()
    contact_response = self.class.get(
      '/api/contacts',
      headers: {
        'Cookie' => @cookie
      }
    )

    if contact_response.code == 200
      puts contact_response.to_yaml
    else
      return false
    end
  end

  private

    def create_contact_for_post(subscription)
      return {
        'CustomKey' => SecureRandom.hex,
        'HomeEmail' => subscription.email,
        'FirstName' => subscription.first_name,
        'LastName' => subscription.last_name,
        'OtherPhone' => subscription.call ? subscription.phone_number : '',
        'TextNumber' => subscription.text ? subscription.phone_number : '',
        'MobileProvider' => 'Sprint',
        'PreferredLanguage' => subscription.codered_language,
        'Zip' => subscription.zip,
        'Groups' => subscription.groups.join(',')
      }
    end
end
