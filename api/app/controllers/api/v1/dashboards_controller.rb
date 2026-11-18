module Api
  module V1
    class DashboardsController < ApplicationController
      before_action :authenticate_user!

      def index
        if current_user.manager?
          total = Ticket.count
          abertos = Ticket.where(status: 'aberto').count
          em_atendimento = Ticket.where(status: 'em_atendimento').count
          resolvidos = Ticket.where(status: 'resolvido').count

          # Calcula o Tempo Médio de Atendimento em horas
          avg_time = Ticket.where.not(resolved_at: nil).average("EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600")
          
          ranking = User.where(role: 'technician').map do |tech|
            { name: tech.name, resolved_count: tech.assigned_tickets.where(status: 'resolvido').count }
          end.sort_by { |t| -t[:resolved_count] }

          render json: {
            total: total,
            abertos: abertos,
            em_atendimento: em_atendimento,
            resolvidos: resolvidos,
            tempo_medio_horas: avg_time ? avg_time.round(1) : 0,
            ranking: ranking
          }
        else
          render json: { error: 'Acesso negado.' }, status: :unauthorized
        end
      end
    end
  end
end