class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  belongs_to :sector, optional: true # <-- ADICIONE ESTA LINHA AQUI

  has_many :requested_tickets, class_name: 'Ticket', foreign_key: 'requester_id'
  has_many :assigned_tickets, class_name: 'Ticket', foreign_key: 'technician_id'
  has_many :ticket_events
  
  has_one_attached :avatar

  devise :database_authenticatable, :registerable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  enum :role, { requester: "requester", technician: "technician", manager: "manager" }

  validates :name, presence: true
end