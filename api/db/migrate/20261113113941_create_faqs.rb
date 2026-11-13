class CreateFaqs < ActiveRecord::Migration[8.1]
  def change
    create_table :faqs do |t|
      t.string :question
      t.string :answer
      t.string :category

      t.timestamps
    end
  end
end
