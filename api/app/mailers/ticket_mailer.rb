class TicketMailer < ApplicationMailer
  default from: 'nao-responda@mantis.ufsc.br'

  def status_changed(ticket, old_status, new_status)
    @ticket = ticket
    @old_status = old_status
    @new_status = new_status
    mail(to: @ticket.requester.email, subject: "Atualização no chamado #{@ticket.code}")
  end
end