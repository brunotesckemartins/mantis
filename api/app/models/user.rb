# app/models/user.rb
class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  has_many :requested_tickets, class_name: 'Ticket', foreign_key: 'requester_id'
  has_many :assigned_tickets, class_name: 'Ticket', foreign_key: 'technician_id'
    has_many :ticket_events # <-- Adicione isso

  devise :database_authenticatable, :registerable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  # Define os perfis: solicitante, técnico, gestor
  enum :role, { requester: "requester", technician: "technician", manager: "manager" }

  validates :name, presence: true
end