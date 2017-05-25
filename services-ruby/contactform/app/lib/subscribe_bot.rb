class SubscribeBot
  include HTTParty
  base_uri ENV['API_BASE']
  debug_output

  def initialize
  end

  def add_subscriber(contact)
    self.class.post('/subscribers',
      headers: {
        'Content-Type' => 'application/xml',
      },
      body: contact.to_xml( :only => [:email, :profile_id, :zip_code] )
    )
  end
end
