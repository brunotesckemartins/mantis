# db/migrate/XXXX_devise_create_users.rb
class DeviseCreateUsers < ActiveRecord::Migration[8.0] # (A versão pode ser 7.1, 7.2, etc)
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      # --- ADICIONE ESTAS DUAS LINHAS AQUI ---
      t.string :name, null: false
      t.string :role, null: false, default: "requester"
      # ---------------------------------------

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      # ... (outros campos do devise)

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
  end
end