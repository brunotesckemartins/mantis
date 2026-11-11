module Api
  module V1
    class CategoriesController < ApplicationController
      before_action :authenticate_user!

      def index
        if current_user.manager?
          @categories = Category.all.order(:name)
        else
          @categories = Category.where(active: true).order(:name)
        end
        render json: @categories
      end

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

      def update
        if current_user.manager?
          @category = Category.find(params[:id])
          if @category.update(category_params)
            render json: @category, status: :ok
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