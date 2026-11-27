import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import XmbBackground from '../components/XmbBackground';
import CustomSelect from '../components/CustomSelect';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import PhotoGallery from '../components/PhotoGallery';
import { formatDateTime, getPriorityColor, getPriorityLabel } from '../utils/ticketStatus';
import { confirmAction } from '../utils/confirm';
import { getApiErrorMessage } from '../utils/apiError';

export default function TicketDetails({ route }: any) {
  const { ticket: initialTicket, userRole } = route.params;
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useContext(ThemeContext);
  const { showToast } = useToast();
  const baseUrl = api.defaults.baseURL || '';
  
  const [ticket, setTicket] = useState(initialTicket);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/tickets');
      const fresh = response.data.find((t: any) => t.id === initialTicket.id);
      if (fresh) setTicket(fresh);
    } catch (error) {}
  }, [initialTicket.id]);

  useFocusEffect(useCallback(() => { fetchTicket(); }, [fetchTicket]));

  async function onRefresh() {
    setRefreshing(true); await fetchTicket(); setRefreshing(false);
  }

  const photos: string[] = Array.isArray(ticket.photo_urls) ? ticket.photo_urls : (ticket.photo_url ? [ticket.photo_url] : []);

  useEffect(() => {
    if (userRole === 'manager') {
      api.get('/api/v1/users/technicians').then(res => {
          setTechnicians(res.data);
          const current = initialTicket.technician?.id;
          if (current) setSelectedTech(String(current));
          else if (res.data.length > 0) setSelectedTech(String(res.data[0].id));
        }).catch(() => showToast('Erro ao carregar técnicos.', 'error'));
    }
  }, [userRole]);

  async function handleAssign() {
    if (!selectedTech || submitting) return;
    if (ticket.technician?.id && String(ticket.technician.id) === selectedTech) return showToast('Este técnico já é o responsável.', 'info');
    const techName = technicians.find(t => String(t.id) === selectedTech)?.name || 'o técnico';
    const isReassign = !!ticket.technician;
    
    const ok = await confirmAction({
      title: isReassign ? 'Reatribuir chamado' : 'Atribuir chamado',
      message: `Encaminhar o chamado para ${techName}?`,
      confirmText: isReassign ? 'Reatribuir' : 'Atribuir',
    });
    if (!ok) return;
    
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assign`, { technician_id: Number(selectedTech) });
      setTicket(response.data);
      showToast(isReassign ? 'Chamado reatribuído!' : 'Chamado atribuído!', 'success');
    } catch (error) { showToast(getApiErrorMessage(error, 'Falha ao atribuir.'), 'error'); } finally { setSubmitting(false); }
  }

  async function handleAssume() {
    if (submitting) return;
    const ok = await confirmAction({ title: 'Assumir chamado', message: 'Você ficará responsável por este atendimento.', confirmText: 'Assumir' });
    if (!ok) return;
    
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assume`);
      setTicket(response.data);
      showToast('Chamado assumido!', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Falha ao assumir.'), 'error');
      fetchTicket();
    } finally { setSubmitting(false); }
  }


  // técnico devolve o chamado para a fila
  async function handleUnassume() {
    if (submitting) return;
    const ok = await confirmAction({
      title: 'Deixar chamado',
      message: 'Tem certeza que deseja devolver o chamado para a fila?',
      confirmText: 'Deixar',
      destructive: true,
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/unassume`);
      setTicket(response.data);
      showToast('Chamado devolvido para a fila.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Falha ao deixar o chamado.'), 'error');
    } finally { setSubmitting(false); }
  }
  async function handleResolve() {
    if (!solutionText.trim()) return showToast('Descreva a solução antes de resolver.', 'error');
    if (submitting) return;
    const ok = await confirmAction({ title: 'Resolver chamado', message: 'Confirma que o problema foi resolvido?', confirmText: 'Resolver' });
    if (!ok) return;
    
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/update_status`, { status: 'resolvido', solution: solutionText.trim() });
      setTicket(response.data); setSolutionText('');
      showToast('Chamado resolvido!', 'success');
    } catch (error) { showToast(getApiErrorMessage(error, 'Falha ao resolver.'), 'error'); } finally { setSubmitting(false); }
  }

  async function handleReopen() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/reopen`);
      setTicket(response.data); showToast('Chamado reaberto!', 'success');
    } catch (error) { showToast('Não foi possível reabrir.', 'error'); } finally { setSubmitting(false); }
  }

  async function handleAddComment() {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/api/v1/tickets/${ticket.id}/add_comment`, { content: newComment.trim() });
      const updatedEvents = [...(ticket.ticket_events || []), { ...response.data, user }];
      setTicket({ ...ticket, ticket_events: updatedEvents });
      setNewComment('');
    } catch (error) { showToast('Falha ao comentar.', 'error'); } finally { setSubmitting(false); }
  }

  const techOptions = technicians.map(t => ({ label: t.name, value: String(t.id) }));
  const isMyTicket = !!user?.id && ticket.technician?.id === user.id;
  const canManagerAssign = userRole === 'manager' && (ticket.status === 'aberto' || ticket.status === 'em_atendimento') && technicians.length > 0;
  const busyStyle = submitting ? { opacity: 0.6 } : null;

  return (
    <XmbBackground>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <View style={[styles.requesterBox, { borderColor: colors.border }]}>
            {ticket.requester?.avatar_url ? (
              <Image source={{ uri: `${baseUrl}${ticket.requester.avatar_url}` }} style={styles.requesterAvatar} />
            ) : (
              <View style={[styles.requesterAvatarPlaceholder, { backgroundColor: colors.accentIce }]}>
                <Text style={[styles.requesterAvatarText, { color: colors.background }]}>{ticket.requester?.name ? ticket.requester.name.charAt(0).toUpperCase() : '?'}</Text>
              </View>
            )}
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.requesterName, { color: colors.textPrimary }]}>{ticket.requester?.name || 'Solicitante Desconhecido'}</Text>
              {ticket.requester?.sector_name && <Text style={[styles.requesterId, { color: colors.accentSilver, fontWeight: 'bold' }]}>Setor: {ticket.requester.sector_name}</Text>}
              {ticket.requester?.identification && <Text style={[styles.requesterId, { color: colors.textSecondary }]}>{ticket.requester.identification}</Text>}
            </View>
          </View>

          {ticket.code && <Text style={{ color: colors.accentSilver, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{ticket.code}</Text>}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{ticket.title}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>{ticket.description}</Text>
          
          <PhotoGallery urls={photos.map(url => `${baseUrl}${url}`)} />

          <View style={[styles.infoRow, { alignItems: 'center' }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Status:</Text>
            <StatusBadge status={ticket.status} />
          </View>
          <View style={[styles.infoRow, { alignItems: 'center' }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Prioridade:</Text>
            <Text style={[styles.value, { color: getPriorityColor(ticket.priority, colors), fontWeight: 'bold' }]}>{getPriorityLabel(ticket.priority)}</Text>
          </View>
          
          {ticket.category?.name && (
            <View style={[styles.infoRow, { alignItems: 'center' }]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Categoria:</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>{ticket.category.name}</Text>
            </View>
          )}

          {/* NOVO CAMPO: EXIBIÇÃO DA LOCALIZAÇÃO */}
          {ticket.location && (
            <View style={[styles.infoRow, { alignItems: 'center' }]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Local:</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>{ticket.location}</Text>
            </View>
          )}

          {userRole !== 'requester' && (
            <View style={[styles.infoRow, { alignItems: 'center' }]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Técnico:</Text>
              <Text style={[styles.value, { color: ticket.technician ? colors.textSecondary : colors.textMuted }]}>
                {ticket.technician ? `${ticket.technician.name}${isMyTicket ? ' (você)' : ''}` : 'Ninguém assumiu ainda'}
              </Text>
            </View>
          )}

          <View style={[styles.timelineBox, { borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textPrimary, marginBottom: 14 }]}>Acompanhamento</Text>
            <StatusTimeline ticket={ticket} />
          </View>

          {ticket.solution && <View style={[styles.solutionBox, { backgroundColor: isDark ? 'rgba(152, 195, 121, 0.1)' : 'rgba(52, 199, 89, 0.1)' }]}><Text style={[styles.label, { color: colors.textPrimary }]}>Solução Aplicada:</Text><Text style={[styles.value, { color: colors.textPrimary }]}>{ticket.solution}</Text></View>}

          {user?.id === ticket.requester?.id && ticket.status === 'resolvido' && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.statusWarning, marginTop: 15 }]} onPress={handleReopen} disabled={submitting}>
              <Text style={[styles.buttonText, { color: colors.background }]}>Reabrir Chamado</Text>
            </TouchableOpacity>
          )}

          {canManagerAssign && (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
              <Text style={[styles.label, { color: colors.textPrimary, marginBottom: 10 }]}>{ticket.technician ? 'Reatribuir para outro Técnico:' : 'Atribuir a um Técnico:'}</Text>
              <CustomSelect options={techOptions} selectedValue={selectedTech} onValueChange={setSelectedTech} placeholder="Selecione o técnico" />
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver, marginTop: 15 }, busyStyle]} onPress={handleAssign} disabled={submitting}>
                <Text style={[styles.buttonText, { color: colors.background }]}>{ticket.technician ? 'Reatribuir Chamado' : 'Atribuir Chamado'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {userRole === 'technician' && ticket.status === 'aberto' && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }, busyStyle]} onPress={handleAssume} disabled={submitting}>
              <Text style={[styles.buttonText, { color: colors.background }]}>Assumir Chamado</Text>
            </TouchableOpacity>
          )}

          {userRole === 'technician' && ticket.status === 'em_atendimento' && !isMyTicket && (
            <Text style={{ color: colors.textMuted, marginTop: 15, fontStyle: 'italic' }}>Este chamado está com {ticket.technician?.name || 'outro técnico'}.</Text>
          )}

          {userRole === 'technician' && ticket.status === 'em_atendimento' && isMyTicket && (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.statusWarning, marginTop: 0, marginBottom: 20 }, busyStyle]} onPress={handleUnassume} disabled={submitting}>
                <Text style={[styles.buttonText, { color: '#000' }]}>Deixar Chamado (Voltar para fila)</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.textPrimary }]}>Registrar Solução:</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]} placeholder="O que foi feito?" placeholderTextColor={colors.textMuted} multiline value={solutionText} onChangeText={setSolutionText} />
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.statusSuccess }, busyStyle]} onPress={handleResolve} disabled={submitting}>
                <Text style={[styles.buttonText, { color: colors.background }]}>Marcar como Resolvido</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.card, { marginTop: 15, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 50 }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Histórico</Text>
          {ticket.ticket_events?.map((event: any) => (
            <View key={event.id} style={[styles.commentBox, { backgroundColor: colors.surfaceElevated, borderLeftColor: colors.accentSilver }]}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{event.user?.name || 'Usuário'}{event.user?.id === user?.id ? ' (você)' : ''}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{formatDateTime(event.created_at)}</Text>
              </View>
              <Text style={[styles.commentText, { color: colors.textSecondary }]}>{event.content}</Text>
            </View>
          ))}
          <TextInput style={[styles.input, { marginTop: 15, backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Escreva um comentário..." placeholderTextColor={colors.textMuted} value={newComment} onChangeText={setNewComment} />
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleAddComment}>
            <Text style={[styles.buttonText, { color: colors.background }]}>Enviar Comentário</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  requesterBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 15 },
  requesterAvatar: { width: 45, height: 45, borderRadius: 22.5 },
  requesterAvatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  requesterAvatarText: { fontWeight: 'bold', fontSize: 18 },
  requesterName: { fontSize: 16, fontWeight: 'bold' },
  requesterId: { fontSize: 13, marginTop: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  desc: { fontSize: 16, marginBottom: 20, lineHeight: 24 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  value: { fontSize: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  solutionBox: { padding: 15, borderRadius: 12, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16 },
  commentBox: { padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 3 },
  timelineBox: { marginTop: 10, paddingTop: 15, borderTopWidth: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontWeight: 'bold', flexShrink: 1, marginRight: 8 },
  commentText: { fontSize: 15 },
});
