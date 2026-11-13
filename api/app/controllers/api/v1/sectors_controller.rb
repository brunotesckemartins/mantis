module Api
  module V1
    class SectorsController < ApplicationController
      before_action :authenticate_user!
      def index
        render json: Sector.all
      end
    end
  end
end