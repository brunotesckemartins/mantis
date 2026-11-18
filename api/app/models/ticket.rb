class Ticket < ApplicationRecord
  belongs_to :requester, class_name: 'User'
  belongs_to :technician, class_name: 'User', optional: true
  belongs_to :category
  
  has_many :ticket_events, dependent: :destroy
  has_many_attached :photos # <-- Anexos Múltiplos
  
  validates :title, :description, :priority, presence: true
  
  before_create :generate_code

  private

  def generate_code
    self.code = "MANTIS-#{Time.current.year}-#{SecureRandom.hex(2).upcase}"
  end
end