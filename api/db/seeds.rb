# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# api/db/seeds.rb
puts "Limpando o banco de dados..."
TicketEvent.destroy_all
Ticket.destroy_all
User.destroy_all
Category.destroy_all
Sector.destroy_all
Faq.destroy_all

puts "Criando Setores..."
s1 = Sector.create!(name: "Biblioteca Central", building: "Bloco A", description: "Acesso pelo térreo")
s2 = Sector.create!(name: "Laboratório de Informática", building: "Bloco B", description: "Salas 201 a 205")
s3 = Sector.create!(name: "Coordenação de Engenharia", building: "Bloco C", description: "3º Andar")

puts "Criando Categorias..."
c1 = Category.create!(name: "Hardware", active: true)
c2 = Category.create!(name: "Software", active: true)
c3 = Category.create!(name: "Rede / Internet", active: true)
c4 = Category.create!(name: "Impressoras", active: true)

puts "Criando FAQs..."
Faq.create!(question: "Como acesso o Wi-Fi da UFSC?", answer: "Use seu login e senha do idUFSC na rede 'eduroam'. Se for aluno novo, vá ao setor de TI.")
Faq.create!(question: "Esqueci minha senha, o que fazer?", answer: "Dirija-se ao setor de TI no Bloco A com um documento com foto.")
Faq.create!(question: "Como abrir um chamado urgente?", answer: "Crie o chamado e marque a prioridade como 'Crítica'. O técnico será notificado imediatamente.")

puts "Criando Usuários..."
gestor = User.create!(name: "Gestor Teste", email: "gestor@ufsc.br", password: "password123", role: "manager", sector: s3)
tecnico1 = User.create!(name: "Tecnico Teste", email: "tecnico@ufsc.br", password: "password123", role: "technician", sector: s2)
tecnico2 = User.create!(name: "Amanda Souza", email: "amanda@ufsc.br", password: "password123", role: "technician", sector: s2)
solicitante1 = User.create!(name: "Usuario Teste", email: "teste@ufsc.br", password: "password123", role: "requester", sector: s1)
solicitante2 = User.create!(name: "João da Silva", email: "joao@ufsc.br", password: "password123", role: "requester", sector: s3)

puts "Criando Chamados e Históricos..."

def create_ticket(requester, title, desc, status, priority, category, technician = nil, solution = nil)
  ticket = Ticket.create!(
    requester: requester, title: title, description: desc,
    status: status, priority: priority, category: category,
    technician: technician, solution: solution
  )
  
  TicketEvent.create!(ticket: ticket, user: requester, content: "Chamado aberto.")
  
  if technician
    TicketEvent.create!(ticket: ticket, user: technician, content: "Chamado assumido pelo técnico.")
  end
  
  if solution
    TicketEvent.create!(ticket: ticket, user: technician, content: "Problema resolvido: #{solution}")
  end
end

create_ticket(solicitante1, "Impressora não puxa papel", "A impressora do laboratório 2 está com papel preso.", "aberto", "alta", c4)
create_ticket(solicitante1, "Computador não liga", "O PC da sala 204 não dá sinal de vídeo.", "em_atendimento", "critica", c1, tecnico1)
create_ticket(solicitante2, "Sem acesso à internet", "Não consigo conectar no Wi-Fi do bloco C.", "resolvido", "media", c3, tecnico2, "Reiniciado o roteador do andar.")
create_ticket(solicitante2, "Instalar AutoCAD", "Preciso do software instalado para a aula de projeto.", "aberto", "baixa", c2)
create_ticket(solicitante1, "Teclado com teclas falhando", "A tecla 'A' e 'E' não funcionam.", "resolvido", "media", c1, tecnico1, "Teclado substituído.")

puts "Seed finalizado com sucesso!"