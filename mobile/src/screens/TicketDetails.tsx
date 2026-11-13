// mobile/src/screens/TicketDetails.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Image, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function TicketDetails({ route }: any) {
  const { ticket: initialTicket, userRole } = route.params;
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useContext(ThemeContext);
  
  const [ticket, setTicket] = useState(initialTicket);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [showImage, setShowImage] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (userRole === 'manager') {
      api.get('/api/v1/users/technicians').then(res => {
        setTechnicians(res.data);
        if (res.data.length > 0) setSelectedTech(String(res.data[0].id));
      });
    }
  }, [userRole]);

  async function handleAssign() {
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assign`, { technician_id: Number(selectedTech) });
      setTicket(response.data); Alert.alert('Sucesso', 'Chamado atribuído!');
    } catch (error) { Alert.alert('Erro', 'Falha ao atribuir.'); }
  }
  async function handleAssume() {
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assume`);
      setTicket({ ...ticket, status: response.data.status, technician: response.data.technician }); Alert.alert('Sucesso', 'Chamado assumido!');
    } catch (error) { Alert.alert('Erro', 'Falha ao assumir.'); }
  }
  async function handleResolve() {
    if (!solutionText) return Alert.alert('Atenção', 'Descreva a solução antes de resolver.');
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/update_status`, { status: 'resolvido', solution: solutionText });
      setTicket({ ...ticket, status: response.data.status, solution: response.data.solution }); Alert.alert('Sucesso', 'Chamado resolvido!');
    } catch (error) { Alert.alert('Erro', 'Falha ao resolver.'); }
  }
  async function handleAddComment() {
    if (!newComment) return;
    try {
      const response = await api.post(`/api/v1/tickets/${ticket.id}/add_comment`, { content: newComment });
      const updatedEvents = [...(ticket.ticket_events || []), { ...response.data, user }];
      setTicket({ ...ticket, ticket_events: updatedEvents }); setNewComment('');
    } catch (error) { Alert.alert('Erro', 'Falha ao comentar.'); }
  }

  return (
    <XmbBackground>
      <Modal visible={isZoomed} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsZoomed(false)}><Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Fechar</Text></TouchableOpacity>
          <Image source={{ uri: `http://localhost:3000${ticket.photo_url}` }} style={styles.zoomedImage} resizeMode="contain" />
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.requesterBox, { borderColor: colors.border }]}>
            {ticket.requester.avatar_url ? (
              <Image source={{ uri: `http://localhost:3000${ticket.requester.avatar_url}` }} style={styles.requesterAvatar} />
            ) : (
              <View style={[styles.requesterAvatarPlaceholder, { backgroundColor: colors.accentIce }]}><Text style={[styles.requesterAvatarText, { color: colors.background }]}>{ticket.requester.name.charAt(0).toUpperCase()}</Text></View>
            )}
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.requesterName, { color: colors.textPrimary }]}>{ticket.requester.name}</Text>
              {ticket.requester.identification && <Text style={[styles.requesterId, { color: colors.textSecondary }]}>{ticket.requester.identification}</Text>}
            </View>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{ticket.title}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>{ticket.description}</Text>
          
          {ticket.photo_url && (
            <View style={{ marginBottom: 15 }}>
              <TouchableOpacity onPress={() => setShowImage(!showImage)} style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>{showImage ? 'Ocultar Foto' : 'Mostrar Foto'}</Text>
              </TouchableOpacity>
              {showImage && (
                <TouchableOpacity onPress={() => setIsZoomed(true)}>
                  <Image source={{ uri: `http://localhost:3000${ticket.photo_url}` }} style={[styles.ticketImage, { backgroundColor: colors.surfaceElevated }]} resizeMode="cover" />
                  <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 5 }}>Clique na foto para expandir</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <View style={styles.infoRow}><Text style={[styles.label, { color: colors.textPrimary }]}>Status:</Text><Text style={[styles.value, { color: colors.accentSilver }]}>{ticket.status.toUpperCase()}</Text></View>
          <View style={styles.infoRow}><Text style={[styles.label, { color: colors.textPrimary }]}>Prioridade:</Text><Text style={[styles.value, { color: colors.accentSilver }]}>{ticket.priority.toUpperCase()}</Text></View>

          {ticket.solution && <View style={[styles.solutionBox, { backgroundColor: isDark ? 'rgba(152, 195, 121, 0.1)' : 'rgba(52, 199, 89, 0.1)' }]}><Text style={[styles.label, { color: colors.textPrimary }]}>Solução Aplicada:</Text><Text style={[styles.value, { color: colors.textPrimary }]}>{ticket.solution}</Text></View>}

          {userRole === 'manager' && ticket.status === 'aberto' && technicians.length > 0 && (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Atribuir a um Técnico:</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Picker selectedValue={selectedTech} onValueChange={(val) => setSelectedTech(val)} style={{ color: colors.textPrimary }} dropdownIconColor={colors.textPrimary}>
                  {technicians.map(tech => <Picker.Item key={tech.id} label={tech.name} value={String(tech.id)} color={colors.textPrimary} />)}
                </Picker>
              </View>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#AF52DE' }]} onPress={handleAssign}><Text style={styles.buttonText}>Atribuir Chamado</Text></TouchableOpacity>
            </View>
          )}

          {userRole === 'technician' && ticket.status === 'aberto' && (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#FF9500' }]} onPress={handleAssume}><Text style={styles.buttonText}>Assumir Chamado</Text></TouchableOpacity>
          )}

          {userRole === 'technician' && ticket.status === 'em_atendimento' && (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Registrar Solução:</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]} placeholder="O que foi feito?" placeholderTextColor={colors.textMuted} multiline value={solutionText} onChangeText={setSolutionText} />
              <TouchableOpacity style={[styles.button, { backgroundColor: '#34C759' }]} onPress={handleResolve}><Text style={styles.buttonText}>Marcar como Resolvido</Text></TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.card, { marginTop: 15, backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Histórico</Text>
          {ticket.ticket_events?.map((event: any) => (
            <View key={event.id} style={[styles.commentBox, { backgroundColor: colors.surfaceElevated, borderLeftColor: colors.accentSilver }]}>
              <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{event.user?.name || 'Usuário'}:</Text>
              <Text style={[styles.commentText, { color: colors.textSecondary }]}>{event.content}</Text>
            </View>
          ))}
          <TextInput style={[styles.input, { marginTop: 15, backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Escreva um comentário..." placeholderTextColor={colors.textMuted} value={newComment} onChangeText={setNewComment} />
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleAddComment}><Text style={[styles.buttonText, { color: colors.background }]}>Enviar Comentário</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: { padding: 20, borderRadius: 8, borderWidth: 1 },
  requesterBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 15 },
  requesterAvatar: { width: 40, height: 40, borderRadius: 20 },
  requesterAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  requesterAvatarText: { fontWeight: 'bold', fontSize: 18 },
  requesterName: { fontSize: 16, fontWeight: 'bold' },
  requesterId: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  desc: { fontSize: 16, marginBottom: 20, lineHeight: 24 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  value: { fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 10, marginTop: 5, overflow: 'hidden' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  solutionBox: { padding: 15, borderRadius: 8, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16 },
  commentBox: { padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3 },
  commentAuthor: { fontWeight: 'bold', marginBottom: 3 },
  commentText: { fontSize: 15 },
  ticketImage: { width: '100%', height: 250, borderRadius: 8 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '80%' },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 }
});