# api/app/controllers/api/v1/dashboards_controller.rb
module Api
  module V1
    class DashboardsController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/dashboard
      def index
        if current_user.manager?
          # Contagens gerais
          total = Ticket.count
          abertos = Ticket.where(status: 'aberto').count
          em_atendimento = Ticket.where(status: 'em_atendimento').count
          resolvidos = Ticket.where(status: 'resolvido').count

          # Ranking de técnicos que mais resolveram chamados
          ranking = User.where(role: 'technician').map do |tech|
            {
              name: tech.name,
              resolved_count: tech.assigned_tickets.where(status: 'resolvido').count
            }
          end.sort_by { |t| -t[:resolved_count] } # Ordena do maior para o menor

          render json: {
            total: total,
            abertos: abertos,
            em_atendimento: em_atendimento,
            resolvidos: resolvidos,
            ranking: ranking
          }
        else
          render json: { error: 'Acesso negado.' }, status: :unauthorized
        end
      end
    end
  end
end