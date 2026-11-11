# api/app/controllers/api/v1/sessions_controller.rb
module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        if resource.persisted?
          render json: {
            message: 'Login realizado com sucesso.',
            user: {
              id: resource.id,
              name: resource.name,
              email: resource.email,
              role: resource.role
            }
          }, status: :ok
        else
          render json: {
            message: 'Credenciais inválidas.',
            errors: resource.errors.full_messages
          }, status: :unauthorized
        end
      end

      def respond_to_on_destroy
        head :no_content
      end
    end
  end
end