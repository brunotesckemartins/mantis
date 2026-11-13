module Api
  module V1
    class FaqsController < ApplicationController
      before_action :authenticate_user!
      def index
        render json: Faq.all
      end
    end
  end
end