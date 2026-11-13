class ApplicationController < ActionController::API
  # Desativa a verificação de CSRF para APIs
  skip_before_action :verify_authenticity_token, raise: false
  
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :role])
  end
end