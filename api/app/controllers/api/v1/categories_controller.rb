module Api
  module V1
    class CategoriesController < ApplicationController
      before_action :authenticate_user!

      # GET /categories (O app vai usar isso para preencher o dropdown)
      def index
        @categories = Category.where(active: true)
        render json: @categories
      end

      # POST /categories (Apenas gestor pode criar)
      def create
        if current_user.manager?
          @category = Category.new(category_params)
          if @category.save
            render json: @category, status: :created
          else
            render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Acesso negado.' }, status: :unauthorized
        end
      end

      private

      def category_params
        params.require(:category).permit(:name, :active)
      end
    end
  end
end