class CreateSubscriptions < ActiveRecord::Migration[5.1]
  def change
    create_table :subscriptions do |t|
      t.string :uuid
      t.string :email
      t.string :phone_number
      t.boolean :call
      t.boolean :text
      t.string :first_name
      t.string :last_name
      t.string :zip
      t.string :language
      t.boolean :tdd
      t.timestamps
    end
  end
end
