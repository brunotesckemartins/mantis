# api/app/services/push_notification_service.rb
class PushNotificationService
  def self.send_notification(user, title, body, data = {})
    return if user.push_token.blank?

    # Payload exigido pela API do Expo
    message = {
      to: user.push_token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    }

    # Envia a requisição via Net::HTTP para não depender de gems extras
    uri = URI('https://exp.host/--/api/v2/push/send')
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Post.new(uri.path, { 'Content-Type' => 'application/json' })
    request.body = message.to_json
    
    response = http.request(request)
    Rails.logger.info "Push Notification enviada: #{response.body}"
  rescue StandardError => e
    Rails.logger.error "Erro ao enviar push: #{e.message}"
  end
end