// mobile/src/screens/Profile.tsx
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext'; // <-- Importando Toast
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';
import XmbBackground from '../components/XmbBackground';
import CustomSelect from '../components/CustomSelect';
import GlassButton from '../components/GlassButton'; // <-- Importando Botão de Vidro

export default function Profile() {
  const { signOut } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const { showToast } = useToast(); // <-- Hook do Toast
  
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) uploadAvatar(result.assets[0].uri);
  }

  async function uploadAvatar(uri: string) {
    const formData = new FormData();
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('avatar', blob, `avatar.jpg`);
    try {
      await api.patch('/api/v1/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Foto de perfil atualizada!', 'success'); // <-- Toast
      fetchProfile();
    } catch (error) { showToast('Erro ao atualizar foto.', 'error'); }
  }

  async function handleUpdateSector() {
    if (!selectedSector) return;
    try {
      await api.patch('/api/v1/profile/sector', { sector_id: Number(selectedSector) });
      showToast('Setor atualizado com sucesso!', 'success'); // <-- Toast
      fetchProfile();
    } catch (error) { showToast('Erro ao atualizar setor.', 'error'); }
  }

  async function handleUpdateIdentification() {
    try {
      await api.patch('/api/v1/profile/identification', { identification });
      showToast('Identificação atualizada!', 'success'); // <-- Toast
      fetchProfile();
    } catch (error) { showToast('Erro ao atualizar identificação.', 'error'); }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return showToast('Preencha ambas as senhas.', 'error');
    try {
      await api.patch('/api/v1/profile/password', { current_password: currentPassword, new_password: newPassword });
      showToast('Senha alterada com sucesso!', 'success'); // <-- Toast
      setCurrentPassword(''); setNewPassword('');
    } catch (error: any) { showToast(error.response?.data?.error || 'Erro ao alterar senha.', 'error'); }
  }

  const sectorOptions = sectors.map(s => ({ label: `${s.name} (${s.building})`, value: String(s.id) }));
  const roleNames: any = { requester: 'Solicitante', technician: 'Técnico', manager: 'Gestor' };

  if (!profileData) return <XmbBackground><Text style={{ textAlign: 'center', marginTop: 50, color: colors.textPrimary }}>Carregando...</Text></XmbBackground>;

  return (
    <XmbBackground>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
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
          <View style={[styles.roleBadge, { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.roleText, { color: colors.textPrimary }]}>{roleNames[profileData.role]}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Identificação</Text>
        <View style={[styles.box, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]} 
            placeholder="Ex: Professor de Física II" 
            placeholderTextColor={colors.textMuted} 
            value={identification} 
            onChangeText={setIdentification} 
          />
          <GlassButton title="Salvar Identificação" onPress={handleUpdateIdentification} style={{ marginBottom: 15 }} />

          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 5 }]}>Meu Setor/Bloco:</Text>
          <View style={{ marginBottom: 10 }}>
            <CustomSelect options={sectorOptions} selectedValue={selectedSector} onValueChange={setSelectedSector} placeholder="Selecione seu setor..." />
          </View>
          <GlassButton title="Salvar Setor" onPress={handleUpdateSector} variant="ghost" />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Minhas Estatísticas</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profileData.stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.statNumber, { color: colors.statusSuccess }]}>{profileData.stats.resolvidos}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Resolvidos</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.statNumber, { color: colors.statusWarning }]}>{profileData.stats.pendentes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendentes</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Segurança</Text>
        <View style={[styles.box, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          <TextInput style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Senha Atual" placeholderTextColor={colors.textMuted} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <TextInput style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Nova Senha" placeholderTextColor={colors.textMuted} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <GlassButton title="Alterar Senha" onPress={handleChangePassword} variant="ghost" />
        </View>

        <GlassButton title="Sair da Conta" onPress={signOut} variant="danger" style={{ marginHorizontal: 15, marginTop: 30 }} />
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
  statBox: { width: '30%', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 5 },
  box: { padding: 15, marginHorizontal: 15, borderRadius: 16, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 10, fontSize: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
});