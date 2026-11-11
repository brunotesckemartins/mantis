class CreateTicketEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :ticket_events do |t|
      t.references :ticket, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content

      t.timestamps
    end
  end
end
