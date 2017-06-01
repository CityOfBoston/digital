class CreateSubscribers < ActiveRecord::Migration[5.1]
  def change
    create_table :subscribers do |t|
      t.string :email
      t.string :zipcode
      t.string :profile_id

      t.timestamps
    end
  end
end
