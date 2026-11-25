class AddLocationToTickets < ActiveRecord::Migration[8.0]
  def change
    add_column :tickets, :location, :string
  end
end