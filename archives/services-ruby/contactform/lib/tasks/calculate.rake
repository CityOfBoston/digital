namespace :calculate do
  task :time => :environment do
    @emails = Email.where.not(replied: nil).where.not(sent: nil).where(response_time: nil)

    @emails.each do |email|
      response_time = email[:replied] - email[:sent]
      email[:response_time] = response_time
      email.save!
    end
  end
end
