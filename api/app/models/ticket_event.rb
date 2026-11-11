class TicketEvent < ApplicationRecord
  belongs_to :ticket
  belongs_to :user
  validates :content, presence: true
end