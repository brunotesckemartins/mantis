# api/app/controllers/api/v1/tickets_controller.rb
module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user! # Exige que o usuário esteja logado com o token JWT

      # GET /tickets (Lista os chamados)
            # GET /tickets
      def index
        if current_user.requester?
          @tickets = current_user.requested_tickets.order(created_at: :desc)
        elsif current_user.technician?
          @tickets = Ticket.where(status: 'aberto').or(Ticket.where(technician_id: current_user.id)).order(created_at: :desc)
        else # Gestor
          @tickets = Ticket.all.order(created_at: :desc)
        end

        @tickets = @tickets.includes(:category, :requester, :technician, ticket_events: :user)

        render json: @tickets, include: [:category, :requester, :technician, { ticket_events: { include: :user } }]
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

      # api/app/controllers/api/v1/tickets_controller.rb


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

  # PATCH /tickets/:id/update_status
        def update_status
        @ticket = Ticket.find(params[:id])
        
        if current_user.technician? && @ticket.technician_id == current_user.id
          # Permite atualizar o status e a solução de uma vez
          if @ticket.update(status: params[:status], solution: params[:solution])
            render json: @ticket, status: :ok
          else
            render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Ação não permitida.' }, status: :unauthorized
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

# ... (private ticket_params) ...

      private

      def ticket_params
        # Permite apenas os campos que o solicitante pode enviar ao criar um chamado
        params.require(:ticket).permit(:title, :description, :priority, :category_id)
      end
    end
  end
end