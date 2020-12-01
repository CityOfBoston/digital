namespace :users do
  desc "Adds a new user to the system. Pass the name as a parameter."
  task :add, [:name] => :environment do |t, args|
    user = User.create(:name => args[:name]).tap do |u|
      u.save!

      # this updates the column
      u.generate_auth_token

      # Write to STDERR so it shows up in the CloudWatch logs
      STDERR.puts u.auth_token
    end
  end
end
