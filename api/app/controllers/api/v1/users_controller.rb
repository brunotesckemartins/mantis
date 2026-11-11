module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      # GET /users/technicians (Lista todos os técnicos para o gestor)
      def technicians
        if current_user.manager?
          @technicians = User.where(role: 'technician')
          render json: @technicians, only: [:id, :name, :email]
        else
          render json: { error: 'Acesso negado.' }, status: :unauthorized
        end
      end
    end
  end
end