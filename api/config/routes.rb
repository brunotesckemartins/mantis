Rails.application.routes.draw do
  devise_for :users, 
    path: "auth", 
    path_names: { sign_in: "login", sign_out: "logout" },
    controllers: {
      sessions: 'api/v1/sessions',
      registrations: 'api/v1/registrations'
    }

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
      
      resources :categories, only: [:index, :create, :update]
      resources :sectors, only: [:index, :create]
      resources :faqs, only: [:index, :create]
      
      get 'users/technicians', to: 'users#technicians'
      get 'profile', to: 'users#profile'
      patch 'profile/avatar', to: 'users#update_avatar'
      patch 'profile/password', to: 'users#update_password'
      patch 'profile/identification', to: 'users#update_identification'
      patch 'profile/sector', to: 'users#update_sector'
      
      get 'dashboard', to: 'dashboards#index'
    end
  end

  get "/health", to: proc { [200, {}, [{ status: "ok" }.to_json]] }
end