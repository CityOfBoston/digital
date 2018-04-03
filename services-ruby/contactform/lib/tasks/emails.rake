namespace :emails do
  desc "Looks up all emails by email address"
  task :search, [:email] => :environment do |t, args|
    emails = Email.where(:from_address => args[:email])
    emails.each do |email|
      STDERR.puts JSON.pretty_generate(email.as_json)
    end
  end
end
