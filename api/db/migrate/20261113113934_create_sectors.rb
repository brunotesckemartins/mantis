class CreateSectors < ActiveRecord::Migration[8.1]
  def change
    create_table :sectors do |t|
      t.string :name
      t.string :building
      t.string :description

      t.timestamps
    end
  end
end
