# app/controllers/api/v1/registrations_controller.rb
module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      private

      # Precisamos permitir que o nosso app envie o 'name' e o 'role' no cadastro
      def sign_up_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation, :role)
      end
    end
  end
end