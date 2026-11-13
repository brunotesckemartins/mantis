module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      def create
        build_resource(sign_up_params)
        resource.save

        if resource.persisted?
          render json: {
            message: 'Conta criada com sucesso.',
            user: {
              id: resource.id,
              name: resource.name,
              email: resource.email,
              role: resource.role
            }
          }, status: :created
        else
          render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def sign_up_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation, :role)
      end
    end
  end
end