# limpa o banco antes de recriar os dados ficticios
puts "Limpando o banco de dados..."
TicketEvent.destroy_all
Ticket.destroy_all
User.destroy_all
Category.destroy_all
Sector.destroy_all
Faq.destroy_all

# setores e blocos do campus para demonstracao
puts "Criando Setores..."
s1 = Sector.create!(name: "Biblioteca Central", building: "Bloco A", description: "Acesso pelo térreo, salas de estudo e computadores públicos")
s2 = Sector.create!(name: "Laboratório de Informática", building: "Bloco B", description: "Salas 201 a 205 - suporte de máquinas e rede")
s3 = Sector.create!(name: "Coordenação de Engenharia", building: "Bloco C", description: "3º Andar - atendimento a alunos e professores")
s4 = Sector.create!(name: "Secretaria Acadêmica", building: "Bloco A", description: "Sala 104 - atendimento das 08h às 19h")
s5 = Sector.create!(name: "Auditório Principal", building: "Bloco D", description: "Projetores, som e transmissão de eventos")
s6 = Sector.create!(name: "Núcleo de TI (Suporte)", building: "Bloco B", description: "Sala 102 - atendimento presencial e manutenção")

# categorias de chamados (uma inativa pra testar a tela de gerenciar categorias)
puts "Criando Categorias..."
c1 = Category.create!(name: "Hardware", active: true)
c2 = Category.create!(name: "Software", active: true)
c3 = Category.create!(name: "Rede / Internet", active: true)
c4 = Category.create!(name: "Impressoras", active: true)
c5 = Category.create!(name: "Projetores / Áudio", active: true)
c6 = Category.create!(name: "Acesso / Sistemas", active: true)
Category.create!(name: "Telefonia Antiga", active: false)

# duvidas frequentes com categoria preenchida pra funcionar na busca da tela de faq
puts "Criando FAQs..."
Faq.create!(
  category: "Rede",
  question: "Como acesso o Wi-Fi da UFSC?",
  answer: "Use seu login e senha do idUFSC na rede 'eduroam'. Se for aluno novo, procure o Núcleo de TI no Bloco B."
)
Faq.create!(
  category: "Rede",
  question: "A internet caiu na sala de aula, o que verificar antes?",
  answer: "Confira se o cabo de rede atrás do computador está bem encaixado e se outros aparelhos conectam no eduroam. Se continuar fora, abra um chamado informando o bloco e a sala."
)
Faq.create!(
  category: "Conta",
  question: "Esqueci minha senha, o que fazer?",
  answer: "Dirija-se ao Núcleo de TI no Bloco B (Sala 102) com um documento com foto para redefinir seu acesso."
)
Faq.create!(
  category: "Chamados",
  question: "Como abrir um chamado urgente?",
  answer: "Ao criar o chamado, selecione a prioridade 'Crítica' e anexe uma foto se possível. A equipe recebe notificação na hora."
)
Faq.create!(
  category: "Chamados",
  question: "Posso reabrir um chamado que já foi resolvido?",
  answer: "Sim. Entre nos detalhes do chamado resolvido e clique em 'Reabrir Chamado' caso o problema tenha voltado."
)
Faq.create!(
  category: "Impressão",
  question: "A impressora travou ou acabou o toner, como proceder?",
  answer: "Não puxe o papel com força para evitar dano. Abra um chamado na categoria 'Impressoras' informando o setor e o modelo."
)
Faq.create!(
  category: "Laboratórios",
  question: "Como solicitar instalação de software nos laboratórios?",
  answer: "Abra um chamado na categoria 'Software' com pelo menos 48h de antecedência informando o nome do programa e as salas."
)
Faq.create!(
  category: "Projetores",
  question: "O projetor da sala não dá imagem no notebook",
  answer: "Teste pressionar Win + P (Windows) e escolher 'Duplicar', ou verifique se o adaptador HDMI/VGA está bem conectado."
)

# usuarios de teste mantendo os logins padrao do projeto
puts "Criando Usuários..."
gestor = User.create!(
  name: "Gestor Teste", email: "gestor@ufsc.br", password: "password123",
  role: "manager", sector: s6, identification: "Coordenador de Suporte TI"
)
tecnico1 = User.create!(
  name: "Tecnico Teste", email: "tecnico@ufsc.br", password: "password123",
  role: "technician", sector: s2, identification: "Técnico N2 - Laboratórios"
)
tecnico2 = User.create!(
  name: "Amanda Souza", email: "amanda@ufsc.br", password: "password123",
  role: "technician", sector: s6, identification: "Técnica de Redes e Infra"
)
solicitante1 = User.create!(
  name: "Usuario Teste", email: "teste@ufsc.br", password: "password123",
  role: "requester", sector: s1, identification: "Aluno - Eng. de Software (6ª fase)"
)
solicitante2 = User.create!(
  name: "João da Silva", email: "joao@ufsc.br", password: "password123",
  role: "requester", sector: s3, identification: "Prof. Sistemas Operacionais"
)
solicitante3 = User.create!(
  name: "Marina Costa", email: "marina@ufsc.br", password: "password123",
  role: "requester", sector: s4, identification: "Servidora - Secretaria Acadêmica"
)

# helper pra criar chamado com datas e historico realistas (inclui resolved_at pro calculo de tma)
puts "Criando Chamados e Históricos..."
def create_ticket(requester:, title:, desc:, status:, priority:, category:, technician: nil, solution: nil, created_ago: 1.day, resolved_after: nil)
  opened_at = Time.current - created_ago
  resolved_at = (status == "resolvido" && resolved_after) ? opened_at + resolved_after : nil

  ticket = Ticket.create!(
    requester: requester,
    title: title,
    description: desc,
    status: status,
    priority: priority,
    category: category,
    technician: technician,
    solution: solution,
    created_at: opened_at,
    resolved_at: resolved_at
  )

  TicketEvent.create!(ticket: ticket, user: requester, content: "Chamado aberto.", created_at: opened_at)

  if technician
    TicketEvent.create!(ticket: ticket, user: technician, content: "Chamado assumido pelo técnico #{technician.name}.", created_at: opened_at + 20.minutes)
  end

  if solution && technician
    TicketEvent.create!(ticket: ticket, user: technician, content: "Problema resolvido: #{solution}", created_at: resolved_at || Time.current)
  end
end

create_ticket(
  requester: solicitante1, title: "Impressora não puxa papel",
  desc: "A impressora do laboratório 2 está com papel preso na bandeja.",
  status: "aberto", priority: "alta", category: c4, created_ago: 3.hours
)
create_ticket(
  requester: solicitante1, title: "Computador não liga",
  desc: "O PC 12 da sala 204 não dá sinal de vídeo nem liga a fonte.",
  status: "em_atendimento", priority: "critica", category: c1,
  technician: tecnico1, created_ago: 6.hours
)
create_ticket(
  requester: solicitante2, title: "Sem acesso à internet",
  desc: "Não consigo conectar no Wi-Fi eduroam nas salas do bloco C.",
  status: "resolvido", priority: "media", category: c3,
  technician: tecnico2, solution: "Reiniciado o ponto de acesso do 3º andar.",
  created_ago: 2.days, resolved_after: 2.hours
)
create_ticket(
  requester: solicitante2, title: "Instalar VS Code e Docker",
  desc: "Preciso das ferramentas instaladas no lab 202 para a aula prática de sexta.",
  status: "aberto", priority: "baixa", category: c2, created_ago: 1.day
)
create_ticket(
  requester: solicitante1, title: "Teclado com teclas falhando",
  desc: "As teclas A e E do terminal da biblioteca não respondem.",
  status: "resolvido", priority: "media", category: c1,
  technician: tecnico1, solution: "Teclado substituído por um novo.",
  created_ago: 3.days, resolved_after: 3.hours
)
create_ticket(
  requester: solicitante3, title: "Sistema acadêmico travando no login",
  desc: "Ao tentar emitir histórico de aluno, a tela fica carregando e dá erro 500.",
  status: "em_atendimento", priority: "alta", category: c6,
  technician: tecnico2, created_ago: 5.hours
)
create_ticket(
  requester: solicitante2, title: "Projetor sem imagem no auditório",
  desc: "Cabo HDMI parece com mau contato durante a palestra.",
  status: "resolvido", priority: "critica", category: c5,
  technician: tecnico1, solution: "Trocado o cabo HDMI e testado com notebook.",
  created_ago: 4.days, resolved_after: 1.hour
)
create_ticket(
  requester: solicitante3, title: "Trocar toner da impressora da secretaria",
  desc: "Impressões saindo muito claras e com listras.",
  status: "aberto", priority: "media", category: c4, created_ago: 10.hours
)
create_ticket(
  requester: solicitante1, title: "Mouse sem scroll na sala 205",
  desc: "O botão do meio do mouse da máquina 07 está travado.",
  status: "resolvido", priority: "baixa", category: c1,
  technician: tecnico2, solution: "Mouse trocado na bancada 07.",
  created_ago: 5.days, resolved_after: 4.hours
)

puts "Seed finalizado com sucesso!"
