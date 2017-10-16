# lib/tasks/db.rake

# Adapted from: https://gist.github.com/hopsoft/56ba6f55fe48ad7f8b90

namespace :db do
  desc "Dumps the database to db/APP_NAME.dump"
  task :dump => :environment do
    cmd = nil
    with_config do |app, host, db, user, password|
      cmd = "pg_dump --host #{host} --username #{user} --verbose --clean --no-owner --no-acl --format=c #{db} > #{Rails.root}/db/#{app}.dump"
      puts cmd
      system({"PGPASSWORD" => password}, cmd)
    end
  end

  desc "Restores the database dump at db/APP_NAME.dump."
  task :restore => :environment do
    cmd = nil
    with_config do |app, host, db, user, password|
      cmd = "pg_restore --verbose --host #{host} --username #{user} --clean --no-owner --no-acl --dbname #{db} #{Rails.root}/db/#{app}.dump"
      Rake::Task["db:drop"].invoke
      Rake::Task["db:create"].invoke
      puts cmd
      system({"PGPASSWORD" => password}, cmd)
    end
  end

  private

  def with_config
    puts ActiveRecord::Base.connection_config
    yield Rails.application.class.parent_name.underscore,
      ActiveRecord::Base.connection_config[:host],
      ActiveRecord::Base.connection_config[:database],
      ActiveRecord::Base.connection_config[:username],
      ActiveRecord::Base.connection_config[:password]
  end
end
