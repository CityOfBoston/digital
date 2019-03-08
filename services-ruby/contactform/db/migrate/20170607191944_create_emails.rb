class CreateEmails < ActiveRecord::Migration[5.1]
  def change
    create_table :emails do |t|
      t.string :name
      t.string :token
      t.string :from_address
      t.string :to_address
      t.string :subject
      t.text :message
      t.string :browser
      t.string :url
      t.string :ip
      t.datetime :sent
      t.datetime :replied
      t.float :response_time

      t.timestamps
    end
  end
end
