# api/config/routes.rb
Rails.application.routes.draw do
  devise_for :users, 
    path: "auth", 
    path_names: { sign_in: "login", sign_out: "logout", registration: "register" },
    controllers: {
      sessions: 'api/v1/sessions',
      registrations: 'api/v1/registrations'
    }

  # --- ADICIONE ESTE BLOCO ---
      namespace :api do
    namespace :v1 do
      resources :tickets, only: [:index, :create] do
        member do
          patch :assume
          patch :update_status
          patch :assign 
          post :add_comment
        end
      end
      resources :categories, only: [:index, :create, :update] # <-- NOVO
      
      # Rota customizada para listar técnicos
      get 'users/technicians', to: 'users#technicians' # <-- NOVO
    end
  end
  # ---------------------------

  get "/health", to: proc { [200, {}, [{ status: "ok" }.to_json]] }
end