# MANTIS — Campus Systems

O Mantis é um sistema mobile de abertura e acompanhamento de chamados de TI (Helpdesk), desenvolvido para otimizar o suporte técnico em ambientes universitários.

O projeto resolve a limitação de sistemas legados baseados em desktop, oferecendo uma experiência mobile-first que permite a técnicos atuarem em campo e solicitantes abrirem chamados de qualquer local.

## Stack Tecnológica

**Backend (API):**
- Ruby on Rails 8.x (Modo API)
- PostgreSQL (Banco de Dados)
- Devise-JWT (Autenticação via Token)
- Active Storage (Armazenamento de Imagens)
- Action Mailer (Notificações por E-mail)

**Frontend (Mobile):**
- React Native com Expo
- TypeScript
- React Navigation (Bottom Tabs e Stack)
- Expo Blur (Efeito "Liquid Glass")

## Funcionalidades Principais

O sistema é dividido em três perfis de acesso, cada um com permissões específicas:

**Solicitante (Aluno/Professor)**
- Abertura de chamados com categoria, prioridade e anexo de múltiplas fotos.
- Acompanhamento do status em tempo real e histórico de conversas.
- Notificações via Push e E-mail a cada atualização no chamado.
- Possibilidade de reabrir um chamado caso o problema persista.

**Técnico**
- Visualização da fila de chamados abertos e dos atribuídos a ele.
- Assunção de chamados e alteração de status (Aberto → Em Atendimento → Resolvido).
- Registro de solução aplicada diretamente pelo celular.

**Gestor**
- Dashboard com métricas em tempo real (Total, Abertos, Resolvidos).
- Cálculo de Tempo Médio de Atendimento (TMA) e Ranking de Técnicos.
- Atribuição de chamados a técnicos específicos e gestão de categorias/setores.

## Regras de Negócio Implementadas (Backend)

- **Segurança:** Autenticação baseada em token JWT com revogação. Rotas privadas exigem autenticação.
- **Código Único:** Cada chamado recebe um código amigável gerado automaticamente (ex: `MANTIS-2026-A1B2`).
- **Auditoria:** O histórico do chamado registra automaticamente mudanças de status, atribuições e resoluções.
- **Restrição de Acesso:** Um solicitante só vê seus próprios chamados; um técnico vê apenas os abertos e os seus; o gestor vê todos.

## Como Rodar o Projeto

### Pré-requisitos
- Ruby 3.x e Rails 8.x
- Node.js 20.x
- PostgreSQL 15+

### 1. Configurando o Backend (API)

```bash
# Entre na pasta da API
cd api

# Instale as dependências
bundle install

# Configure as variáveis de ambiente para o envio de e-mail
# (Copie o arquivo .env.example e preencha com suas credenciais de Gmail - Senha de App)
cp .env.example .env

# Crie o banco de dados, rode as migrações e popule com dados de teste
rails db:create
rails db:migrate
rails db:seed

# Inicie o servidor
rails s -b 0.0.0.0
