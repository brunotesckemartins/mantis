class AddCodeToTickets < ActiveRecord::Migration[8.0]
  def change
    add_column :tickets, :code, :string
    add_index :tickets, :code, unique: true
  end
end