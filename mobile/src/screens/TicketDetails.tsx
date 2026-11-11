// mobile/src/screens/TicketDetails.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Image, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';

export default function TicketDetails({ route }: any) {
  const { ticket: initialTicket, userRole } = route.params;
  const { user } = useContext(AuthContext);
  
  const [ticket, setTicket] = useState(initialTicket);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('');
  
  const [newComment, setNewComment] = useState('');
  const [solutionText, setSolutionText] = useState('');
  
  // Estados para controlar a imagem
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
      setTicket(response.data);
      Alert.alert('Sucesso', 'Chamado atribuído!');
    } catch (error) { Alert.alert('Erro', 'Falha ao atribuir.'); }
  }

  async function handleAssume() {
    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/assume`);
      setTicket({ ...ticket, status: response.data.status, technician: response.data.technician });
      Alert.alert('Sucesso', 'Chamado assumido!');
    } catch (error) { Alert.alert('Erro', 'Falha ao assumir.'); }
  }

  async function handleResolve() {
    if (!solutionText) {
      Alert.alert('Atenção', 'Descreva a solução antes de resolver.');
      return;
    }

    try {
      const response = await api.patch(`/api/v1/tickets/${ticket.id}/update_status`, { 
        status: 'resolvido',
        solution: solutionText
      });
      setTicket({ ...ticket, status: response.data.status, solution: response.data.solution });
      Alert.alert('Sucesso', 'Chamado resolvido!');
    } catch (error) { Alert.alert('Erro', 'Falha ao resolver.'); }
  }

  async function handleAddComment() {
    if (!newComment) return;
    try {
      const response = await api.post(`/api/v1/tickets/${ticket.id}/add_comment`, { content: newComment });
      const updatedEvents = [...(ticket.ticket_events || []), { ...response.data, user }];
      setTicket({ ...ticket, ticket_events: updatedEvents });
      setNewComment('');
    } catch (error) { Alert.alert('Erro', 'Falha ao comentar.'); }
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* MODAL PARA ZOOM DA IMAGEM */}
      <Modal visible={isZoomed} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsZoomed(false)}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Fechar</Text>
          </TouchableOpacity>
          <Image 
            source={{ uri: `http://localhost:3000${ticket.photo_url}` }} 
            style={styles.zoomedImage} 
            resizeMode="contain"
          />
        </View>
      </Modal>

      <View style={styles.card}>
        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.desc}>{ticket.description}</Text>
        
        {/* CONTROLE DA FOTO */}
        {ticket.photo_url && (
          <View style={{ marginBottom: 15 }}>
            <TouchableOpacity onPress={() => setShowImage(!showImage)} style={{ marginBottom: 10 }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>
                {showImage ? 'Ocultar Foto do Problema' : 'Mostrar Foto do Problema'}
              </Text>
            </TouchableOpacity>

            {showImage && (
              <TouchableOpacity onPress={() => setIsZoomed(true)}>
                <Image 
                  source={{ uri: `http://localhost:3000${ticket.photo_url}` }} 
                  style={{ width: '100%', height: 250, borderRadius: 8, backgroundColor: '#eee' }} 
                  resizeMode="cover"
                />
                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 5 }}>Clique na foto para expandir</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.infoRow}><Text style={styles.label}>Status:</Text><Text style={styles.value}>{ticket.status.toUpperCase()}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>Prioridade:</Text><Text style={styles.value}>{ticket.priority.toUpperCase()}</Text></View>
        {ticket.technician && <View style={styles.infoRow}><Text style={styles.label}>Técnico:</Text><Text style={styles.value}>{ticket.technician.name}</Text></View>}

        {ticket.solution && (
          <View style={styles.solutionBox}>
            <Text style={styles.label}>Solução Aplicada:</Text>
            <Text style={styles.value}>{ticket.solution}</Text>
          </View>
        )}

        {userRole === 'manager' && ticket.status === 'aberto' && technicians.length > 0 && (
          <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: '#eee', paddingTop: 15 }}>
            <Text style={styles.label}>Atribuir a um Técnico:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedTech} onValueChange={(val) => setSelectedTech(val)}>
                {technicians.map(tech => <Picker.Item key={tech.id} label={tech.name} value={String(tech.id)} />)}
              </Picker>
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#AF52DE' }]} onPress={handleAssign}>
              <Text style={styles.buttonText}>Atribuir Chamado</Text>
            </TouchableOpacity>
          </View>
        )}

        {userRole === 'technician' && ticket.status === 'aberto' && (
          <TouchableOpacity style={[styles.button, { backgroundColor: '#FF9500' }]} onPress={handleAssume}>
            <Text style={styles.buttonText}>Assumir Chamado</Text>
          </TouchableOpacity>
        )}

        {userRole === 'technician' && ticket.status === 'em_atendimento' && (
          <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: '#eee', paddingTop: 15 }}>
            <Text style={styles.label}>Registrar Solução:</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              placeholder="O que foi feito para resolver?"
              multiline
              value={solutionText}
              onChangeText={setSolutionText}
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: '#34C759' }]} onPress={handleResolve}>
              <Text style={styles.buttonText}>Marcar como Resolvido</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.card, { marginTop: 15 }]}>
        <Text style={styles.title}>Histórico</Text>
        
        {ticket.ticket_events?.map((event: any) => (
          <View key={event.id} style={styles.commentBox}>
            <Text style={styles.commentAuthor}>{event.user?.name || 'Usuário'}:</Text>
            <Text style={styles.commentText}>{event.content}</Text>
          </View>
        ))}

        <TextInput 
          style={[styles.input, { marginTop: 15 }]} 
          placeholder="Escreva um comentário..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: '#007AFF' }]} onPress={handleAddComment}>
          <Text style={styles.buttonText}>Enviar Comentário</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  desc: { fontSize: 16, color: '#444', marginBottom: 20, lineHeight: 24 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginRight: 5, color: '#333' },
  value: { fontSize: 16, color: '#333' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, marginTop: 5 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  solutionBox: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 8, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  commentBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#007AFF' },
  commentAuthor: { fontWeight: 'bold', marginBottom: 3, color: '#333' },
  commentText: { fontSize: 15, color: '#444' },
  // ESTILOS DO MODAL DE ZOOM
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '80%' },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 }
});