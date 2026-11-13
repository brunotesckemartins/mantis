// mobile/src/screens/Profile.tsx
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';
import XmbBackground from '../components/XmbBackground';

export default function Profile() {
  const { signOut } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [identification, setIdentification] = useState('');

  useEffect(() => { 
    fetchProfile(); 
    api.get('/api/v1/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  async function fetchProfile() {
    try {
      const response = await api.get('/api/v1/profile');
      setProfileData(response.data);
      setIdentification(response.data.identification || '');
      if (response.data.sector_id) setSelectedSector(String(response.data.sector_id));
    } catch (error) { console.error(error); }
  }

  async function handlePickAvatar() {
    Alert.alert('Foto de Perfil', 'Escolha a origem da imagem:', [
      { text: 'Câmera', onPress: () => launchAvatarPicker('camera') },
      { text: 'Galeria', onPress: () => launchAvatarPicker('gallery') },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  async function launchAvatarPicker(source: 'camera' | 'gallery') {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permissão Negada', 'Precisamos de acesso à câmera.');
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria.');
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      }

      if (!result.canceled) uploadAvatar(result.assets[0].uri);
    } catch (error) { Alert.alert('Erro', 'Erro ao acessar a mídia.'); }
  }

  async function uploadAvatar(uri: string) {
    const formData = new FormData();
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('avatar', blob, `avatar.jpg`);
    try {
      await api.patch('/api/v1/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      fetchProfile();
    } catch (error) { Alert.alert('Erro', 'Não foi possível atualizar a foto.'); }
  }

  async function handleUpdateSector() {
    if (!selectedSector) return;
    try {
      await api.patch('/api/v1/profile/sector', { sector_id: Number(selectedSector) });
      Alert.alert('Sucesso', 'Setor atualizado!');
      fetchProfile();
    } catch (error) { Alert.alert('Erro', 'Erro ao atualizar setor.'); }
  }

  async function handleUpdateIdentification() {
    try {
      await api.patch('/api/v1/profile/identification', { identification });
      Alert.alert('Sucesso', 'Identificação atualizada!');
      fetchProfile();
    } catch (error) { Alert.alert('Erro', 'Erro ao atualizar identificação.'); }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return Alert.alert('Atenção', 'Preencha ambas as senhas.');
    try {
      await api.patch('/api/v1/profile/password', { current_password: currentPassword, new_password: newPassword });
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setCurrentPassword(''); setNewPassword('');
    } catch (error: any) { Alert.alert('Erro', error.response?.data?.error || 'Erro ao alterar senha.'); }
  }

  const roleNames: any = { requester: 'Solicitante', technician: 'Técnico', manager: 'Gestor' };
  if (!profileData) return <XmbBackground><Text style={{ textAlign: 'center', marginTop: 50, color: colors.textPrimary }}>Carregando...</Text></XmbBackground>;

  return (
    <XmbBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePickAvatar}>
            {profileData.avatar_url ? (
              <Image source={{ uri: `http://localhost:3000${profileData.avatar_url}` }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentSilver }]}>
                <Text style={[styles.avatarText, { color: colors.background }]}>{profileData.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={[styles.changePhotoText, { color: colors.accentSilver }]}>Alterar Foto</Text>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{profileData.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{profileData.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.roleText, { color: colors.textPrimary }]}>{roleNames[profileData.role]}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Identificação</Text>
        <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]} 
            placeholder="Ex: Professor de Física II" 
            placeholderTextColor={colors.textMuted} 
            value={identification} 
            onChangeText={setIdentification} 
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver, marginBottom: 15 }]} onPress={handleUpdateIdentification}>
            <Text style={[styles.buttonText, { color: colors.background }]}>Salvar Identificação</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 5 }]}>Meu Setor/Bloco:</Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.backgroundDeep, borderColor: colors.border }]}>
            <Picker selectedValue={selectedSector} onValueChange={setSelectedSector} style={{ color: colors.textPrimary }} dropdownIconColor={colors.textPrimary}>
              <Picker.Item label="Selecione um setor..." value="" color={colors.textPrimary} />
              {sectors.map(sec => <Picker.Item key={sec.id} label={`${sec.name} (${sec.building})`} value={String(sec.id)} color={colors.textPrimary} />)}
            </Picker>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentIce }]} onPress={handleUpdateSector}>
            <Text style={[styles.buttonText, { color: colors.background }]}>Salvar Setor</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Minhas Estatísticas</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profileData.stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.statusSuccess }]}>{profileData.stats.resolvidos}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Resolvidos</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.statusWarning }]}>{profileData.stats.pendentes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendentes</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Segurança</Text>
        <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Senha Atual" placeholderTextColor={colors.textMuted} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <TextInput style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Nova Senha" placeholderTextColor={colors.textMuted} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleChangePassword}>
            <Text style={[styles.buttonText, { color: colors.background }]}>Alterar Senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.statusDanger }]} onPress={signOut}>
          <Text style={[styles.logoutText, { color: colors.background }]}>Sair da Conta</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
  avatarImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 40, fontWeight: 'bold' },
  changePhotoText: { fontSize: 14, marginBottom: 15, textAlign: 'center' },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 15, marginBottom: 10 },
  roleBadge: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15 },
  roleText: { fontSize: 13, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 25, marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15 },
  statBox: { width: '30%', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 5 },
  box: { padding: 15, marginHorizontal: 15, borderRadius: 10, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  logoutButton: { marginHorizontal: 15, marginTop: 30, padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { fontWeight: 'bold', fontSize: 16 }
});