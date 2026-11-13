# api/config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*' # Em produção, troque pelo domínio específico
    resource '*',
      headers: :any,
      expose: ['Authorization'],
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end