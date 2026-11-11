# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_11_133333) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.boolean "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ticket_events", force: :cascade do |t|
    t.bigint "ticket_id", null: false
    t.bigint "user_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ticket_id"], name: "index_ticket_events_on_ticket_id"
    t.index ["user_id"], name: "index_ticket_events_on_user_id"
  end

  create_table "tickets", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.string "status", default: "aberto"
    t.string "priority"
    t.bigint "requester_id", null: false
    t.bigint "technician_id"
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "solution"
    t.index ["category_id"], name: "index_tickets_on_category_id"
    t.index ["requester_id"], name: "index_tickets_on_requester_id"
    t.index ["technician_id"], name: "index_tickets_on_technician_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name", null: false
    t.string "role", default: "requester", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "jti"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "ticket_events", "tickets"
  add_foreign_key "ticket_events", "users"
  add_foreign_key "tickets", "categories"
  add_foreign_key "tickets", "users", column: "requester_id"
  add_foreign_key "tickets", "users", column: "technician_id"
end
