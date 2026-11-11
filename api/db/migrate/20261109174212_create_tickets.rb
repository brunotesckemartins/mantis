class CreateTickets < ActiveRecord::Migration[8.0]
  def change
    create_table :tickets do |t|
      t.string :title
      t.text :description
      t.string :status, default: "aberto"
      t.string :priority
      t.references :requester, null: false, foreign_key: { to_table: :users } # <-- Ajuste aqui
      t.references :technician, foreign_key: { to_table: :users }             # <-- Ajuste aqui (técnico pode ser nulo no início)
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end
  end
end