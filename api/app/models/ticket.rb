class Ticket < ApplicationRecord
  belongs_to :requester, class_name: 'User'
  belongs_to :technician, class_name: 'User', optional: true
  belongs_to :category
  
  has_many :ticket_events, dependent: :destroy
  has_one_attached :photo # <-- Adicionado aqui
  
  validates :title, :description, :priority, presence: true
end