class CodeRed
  include HTTParty
  base_uri ENV['API_BASE']
  debug_output

  def initialize
    post_response = self.class.post(
      '/api/login',
      body: {
        username: ENV['API_USER'],
        password: ENV['API_PASS']
      }
    )

    @cookie = post_response.header['Set-Cookie']
  end

  def add_contact(contact)
    contact_response = self.class.post(
      '/api/contacts',
      headers: {
        'Cookie' => @cookie
      },
      body: create_contact_for_post(contact)
    )

    if contact_response.code == 201
      return true
    else
      return false
    end
  end

  private

    def create_contact_for_post(contact)
      created_contact = {
        'CustomKey' => SecureRandom.hex,
        'HomeEmail' => contact.email,
        'FirstName' => contact.first_name,
        'LastName' => contact.last_name,
        'HomePhone' => contact.call ? contact.phone_number : '',
        'TextNumber' => contact.text ? contact.phone_number : '',
        'MobileProvider' => 'Sprint',
        'Zip' => contact.zip
      }

      created_contact
    end
end
