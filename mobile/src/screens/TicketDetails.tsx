// mobile/src/screens/TicketDetails.tsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import XmbBackground from '../components/XmbBackground';
import CustomSelect from '../components/CustomSelect';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import { formatDateTime, getPriorityColor, getPriorityLabel } from '../utils/ticketStatus';

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
  const [showImage, setShowImage] = useState(true);
  const [zoomedUri, setZoomedUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // O backend ainda não tem endpoint de "mostrar um chamado", então busca a lista
  // e pega o chamado desta tela. Assim o status acompanha o que o técnico fez.
  const fetchTicket = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/tickets');
      const fresh = response.data.find((t: any) => t.id === initialTicket.id);
      if (fresh) setTicket(fresh);
    } catch (error) {
      // mantém na tela os dados que já foram carregados
    }
  }, [initialTicket.id]);

  // atualiza ao abrir a tela e ao voltar para ela
  useFocusEffect(useCallback(() => { fetchTicket(); }, [fetchTicket]));

  async function onRefresh() {
    setRefreshing(true);
    await fetchTicket();
    setRefreshing(false);
  }

  // suporta o array photo_urls retornado pelo backend
  const photos: string[] = Array.isArray(ticket.photo_urls)
    ? ticket.photo_urls
    : (ticket.photo_url ? [ticket.photo_url] : []);

  useEffect(() => {
    if (userRole === 'manager') {
      api.get('/api/v1/users/technicians')
        .then(res => {
          setTechnicians(res.data);
          if (res.data.length > 0) setSelectedTech(String(res.data[0].id));
        })
        .catch(() => showToast('Erro ao carregar técnicos.', 'error'));
    }
  }, [userRole]);

  async function handleAssign() {
    if (!selectedTech || submitting) return;
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assign`, { technician_id: Number(selectedTech) });
      setTicket(response.data);
      showToast('Chamado atribuído!', 'success');
    } catch (error) { showToast('Falha ao atribuir.', 'error'); } finally { setSubmitting(false); }
  }
  async function handleAssume() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assume`);
      setTicket(response.data);
      showToast('Chamado assumido!', 'success');
    } catch (error) { showToast('Falha ao assumir.', 'error'); } finally { setSubmitting(false); }
  }
  async function handleResolve() {
    if (!solutionText.trim()) return showToast('Descreva a solução antes de resolver.', 'error');
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/update_status`, { status: 'resolvido', solution: solutionText.trim() });
      setTicket(response.data);
      setSolutionText('');
      showToast('Chamado resolvido!', 'success');
    } catch (error) { showToast('Falha ao resolver.', 'error'); } finally { setSubmitting(false); }
  }
  // permite ao solicitante reabrir o chamado caso o problema volte
  async function handleReopen() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/reopen`);
      setTicket(response.data);
      showToast('Chamado reaberto!', 'success');
    } catch (error) { showToast('Não foi possível reabrir o chamado.', 'error'); } finally { setSubmitting(false); }
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

  return (
    <XmbBackground>
      <Modal visible={!!zoomedUri} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setZoomedUri(null)}><Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Fechar</Text></TouchableOpacity>
          {zoomedUri && <Image source={{ uri: zoomedUri }} style={styles.zoomedImage} resizeMode="contain" />}
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <View style={[styles.requesterBox, { borderColor: colors.border }]}>
            {/* PROTEÇÃO CONTRA DADOS VAZIOS AQUI (requester?) */}
            {ticket.requester?.avatar_url ? (
              <Image source={{ uri: `${baseUrl}${ticket.requester.avatar_url}` }} style={styles.requesterAvatar} />
            ) : (
              <View style={[styles.requesterAvatarPlaceholder, { backgroundColor: colors.accentIce }]}>
                <Text style={[styles.requesterAvatarText, { color: colors.background }]}>
                  {ticket.requester?.name ? ticket.requester.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.requesterName, { color: colors.textPrimary }]}>
                {ticket.requester?.name || 'Solicitante Desconhecido'}
              </Text>
              {ticket.requester?.sector_name && (
                <Text style={[styles.requesterId, { color: colors.accentSilver, fontWeight: 'bold' }]}>Setor: {ticket.requester.sector_name}</Text>
              )}
              {ticket.requester?.identification && <Text style={[styles.requesterId, { color: colors.textSecondary }]}>{ticket.requester.identification}</Text>}
            </View>
          </View>

          {ticket.code && <Text style={{ color: colors.accentSilver, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{ticket.code}</Text>}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{ticket.title}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>{ticket.description}</Text>
          
          {photos.length > 0 && (
            <View style={{ marginBottom: 15 }}>
              <TouchableOpacity onPress={() => setShowImage(!showImage)} style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>{showImage ? 'Ocultar Foto(s)' : 'Mostrar Foto(s)'}</Text>
              </TouchableOpacity>
              {showImage && photos.map((url, idx) => (
                <TouchableOpacity key={idx} onPress={() => setZoomedUri(`${baseUrl}${url}`)} style={{ marginBottom: 10 }}>
                  <Image source={{ uri: `${baseUrl}${url}` }} style={[styles.ticketImage, { backgroundColor: colors.surfaceElevated }]} resizeMode="cover" />
                  <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 5 }}>Clique na foto para expandir</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={[styles.infoRow, { alignItems: 'center' }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Status:</Text>
            <StatusBadge status={ticket.status} />
          </View>
          <View style={[styles.infoRow, { alignItems: 'center' }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Prioridade:</Text>
            <Text style={[styles.value, { color: getPriorityColor(ticket.priority, colors), fontWeight: 'bold' }]}>{getPriorityLabel(ticket.priority)}</Text>
          </View>

          <View style={[styles.timelineBox, { borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textPrimary, marginBottom: 14 }]}>Acompanhamento</Text>
            <StatusTimeline ticket={ticket} />
          </View>

          {ticket.solution && <View style={[styles.solutionBox, { backgroundColor: isDark ? 'rgba(152, 195, 121, 0.1)' : 'rgba(52, 199, 89, 0.1)' }]}><Text style={[styles.label, { color: colors.textPrimary }]}>Solução Aplicada:</Text><Text style={[styles.value, { color: colors.textPrimary }]}>{ticket.solution}</Text></View>}

          {/* botao pro solicitante reabrir chamado resolvido */}
          {user?.id === ticket.requester?.id && ticket.status === 'resolvido' && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.statusWarning, marginTop: 15 }]} onPress={handleReopen} disabled={submitting}>
              <Text style={[styles.buttonText, { color: colors.background }]}>Reabrir Chamado</Text>
            </TouchableOpacity>
          )}

          {/* AÇÕES DO GESTOR */}
          {userRole === 'manager' && ticket.status === 'aberto' && technicians.length > 0 && (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
              <Text style={[styles.label, { color: colors.textPrimary, marginBottom: 10 }]}>Atribuir a um Técnico:</Text>
              
              <CustomSelect 
                options={techOptions}
                selectedValue={selectedTech}
                onValueChange={setSelectedTech}
                placeholder="Selecione o técnico"
              />
              
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver, marginTop: 15 }]} onPress={handleAssign}>
                <Text style={[styles.buttonText, { color: colors.background }]}>Atribuir Chamado</Text>
              </TouchableOpacity>
            </View>
          )}

          {userRole === 'technician' && ticket.status === 'aberto' && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleAssume}>
              <Text style={[styles.buttonText, { color: colors.background }]}>Assumir Chamado</Text>
            </TouchableOpacity>
          )}

          {userRole === 'technician' && ticket.status === 'em_atendimento' && (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Registrar Solução:</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]} placeholder="O que foi feito?" placeholderTextColor={colors.textMuted} multiline value={solutionText} onChangeText={setSolutionText} />
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.statusSuccess }]} onPress={handleResolve}>
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
                <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>
                  {event.user?.name || 'Usuário'}{event.user?.id === user?.id ? ' (você)' : ''}
                </Text>
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
  ticketImage: { width: '100%', height: 250, borderRadius: 12 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '80%' },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 }
});