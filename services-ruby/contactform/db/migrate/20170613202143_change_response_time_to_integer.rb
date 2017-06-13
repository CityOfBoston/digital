class ChangeResponseTimeToInteger < ActiveRecord::Migration[5.1]
  def change
    change_column :emails, :response_time, :float
  end
end
