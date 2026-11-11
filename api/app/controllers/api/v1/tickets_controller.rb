module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!

      # GET /tickets
      def index
        if current_user.requester?
          @tickets = current_user.requested_tickets
        elsif current_user.technician?
          @tickets = Ticket.where(status: 'aberto').or(Ticket.where(technician_id: current_user.id))
        else
          @tickets = Ticket.all
        end

        @tickets = @tickets.where(status: params[:status]) if params[:status].present?
        @tickets = @tickets.where(priority: params[:priority]) if params[:priority].present?
        
        if params[:search].present?
          search_term = "%#{params[:search]}%"
          @tickets = @tickets.where("title ILIKE :search OR description ILIKE :search", search: search_term)
        end

        # Otimização e ordenação
        @tickets = @tickets.order(created_at: :desc).includes(:category, :requester, :technician, ticket_events: :user, photo_attachment: :blob)

        # Gera o JSON incluindo a URL da foto
        tickets_json = @tickets.map do |ticket|
          ticket.as_json(include: [:category, :requester, :technician, { ticket_events: { include: :user } }]).merge(
            photo_url: ticket.photo.attached? ? Rails.application.routes.url_helpers.rails_blob_path(ticket.photo, only_path: true) : nil
          )
        end

        render json: tickets_json
      end

      # POST /tickets
      def create
        @ticket = current_user.requested_tickets.new(ticket_params)
        
        if @ticket.save
          render json: @ticket, status: :created
        else
          render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /tickets/:id/assume
      def assume
        @ticket = Ticket.find(params[:id])
        
        if current_user.technician? && @ticket.status == 'aberto'
          @ticket.update(technician_id: current_user.id, status: 'em_atendimento')
          render json: @ticket, status: :ok
        else
          render json: { error: 'Não é possível assumir este chamado.' }, status: :unprocessable_entity
        end
      end

      # PATCH /tickets/:id/update_status
      def update_status
        @ticket = Ticket.find(params[:id])
        
        if current_user.technician? && @ticket.technician_id == current_user.id
          if @ticket.update(status: params[:status], solution: params[:solution])
            render json: @ticket, status: :ok
          else
            render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Ação não permitida.' }, status: :unauthorized
        end
      end

      # PATCH /tickets/:id/assign
      def assign
        @ticket = Ticket.find(params[:id])
        
        if current_user.manager?
          if @ticket.update(technician_id: params[:technician_id], status: 'em_atendimento')
            render json: @ticket, status: :ok
          else
            render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Apenas gestores podem atribuir chamados.' }, status: :unauthorized
        end
      end

      # POST /tickets/:id/add_comment
      def add_comment
        @ticket = Ticket.find(params[:id])
        @event = @ticket.ticket_events.new(user: current_user, content: params[:content])

        if @event.save
          render json: @event, status: :created
        else
          render json: { errors: @event.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def ticket_params
        # Inclui o :photo na lista de permitidos
        params.require(:ticket).permit(:title, :description, :priority, :category_id, :photo)
      end
    end
  end
end