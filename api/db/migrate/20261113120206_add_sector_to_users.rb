class AddSectorToUsers < ActiveRecord::Migration[8.0]
  def change
    add_reference :users, :sector, null: true, foreign_key: true
  end
end