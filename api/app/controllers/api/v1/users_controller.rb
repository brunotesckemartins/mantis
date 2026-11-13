module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      def technicians
        if current_user.manager?
          @technicians = User.where(role: 'technician')
          render json: @technicians, only: [:id, :name, :email]
        else
          render json: { error: 'Acesso negado.' }, status: :unauthorized
        end
      end

      def profile
        render json: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email,
          role: current_user.role,
          identification: current_user.identification,
          sector_id: current_user.sector_id,
          sector_name: current_user.sector&.name,
          avatar_url: current_user.avatar.attached? ? Rails.application.routes.url_helpers.rails_blob_path(current_user.avatar, only_path: true) : nil,
          stats: calculate_stats
        }
      end

      def update_avatar
        if current_user.avatar.attach(params[:avatar])
          render json: { message: 'Avatar atualizado com sucesso!' }, status: :ok
        else
          render json: { error: 'Erro ao atualizar avatar.' }, status: :unprocessable_entity
        end
      end

      def update_password
        if current_user.valid_password?(params[:current_password])
          if current_user.update(password: params[:new_password])
            render json: { message: 'Senha atualizada com sucesso!' }, status: :ok
          else
            render json: { error: current_user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Senha atual incorreta.' }, status: :unauthorized
        end
      end

      def update_identification
        if current_user.update(identification: params[:identification])
          render json: { message: 'Identificação atualizada!' }, status: :ok
        else
          render json: { error: 'Erro ao atualizar.' }, status: :unprocessable_entity
        end
      end

      def update_sector
        if current_user.update(sector_id: params[:sector_id])
          render json: { message: 'Setor atualizado!' }, status: :ok
        else
          render json: { error: 'Erro ao atualizar.' }, status: :unprocessable_entity
        end
      end

      private

      def calculate_stats
        if current_user.requester?
          { total: current_user.requested_tickets.count, resolvidos: current_user.requested_tickets.where(status: 'resolvido').count, pendentes: current_user.requested_tickets.where(status: ['aberto', 'em_atendimento']).count }
        elsif current_user.technician?
          { total: current_user.assigned_tickets.count, resolvidos: current_user.assigned_tickets.where(status: 'resolvido').count, pendentes: current_user.assigned_tickets.where(status: ['aberto', 'em_atendimento']).count }
        else
          { total: Ticket.count, resolvidos: Ticket.where(status: 'resolvido').count, pendentes: Ticket.where(status: ['aberto', 'em_atendimento']).count }
        end
      end
    end
  end
end