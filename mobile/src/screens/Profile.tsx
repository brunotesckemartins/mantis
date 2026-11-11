// mobile/src/screens/Profile.tsx
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';

export default function Profile() {
  const { user, signOut } = useContext(AuthContext);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Estados para troca de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await api.get('/api/v1/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  }

  async function uploadAvatar(uri: string) {
    const formData = new FormData();
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileExt = uri.split('.').pop() || 'jpg';
    formData.append('avatar', blob, `avatar.${fileExt}`);

    try {
      await api.patch('/api/v1/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      fetchProfile(); // Recarrega os dados
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      Alert.alert('Atenção', 'Preencha ambas as senhas.');
      return;
    }
    try {
      await api.patch('/api/v1/profile/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao alterar senha.');
    }
  }

  const roleNames: any = { requester: 'Solicitante', technician: 'Técnico', manager: 'Gestor' };

  if (!profileData) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickAvatar}>
          {profileData.avatar_url ? (
            <Image source={{ uri: `http://localhost:3000${profileData.avatar_url}` }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{profileData.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>Alterar Foto</Text>
        </TouchableOpacity>

        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>{roleNames[profileData.role]}</Text></View>
      </View>

      {/* ESTATÍSTICAS */}
      <Text style={styles.sectionTitle}>Minhas Estatísticas</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profileData.stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{profileData.stats.resolvidos}</Text>
          <Text style={styles.statLabel}>Resolvidos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{profileData.stats.pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {/* ALTERAR SENHA */}
      <Text style={styles.sectionTitle}>Segurança</Text>
      <View style={styles.passwordBox}>
        <TextInput style={styles.input} placeholder="Senha Atual" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
        <TextInput style={styles.input} placeholder="Nova Senha" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  changePhotoText: { color: '#007AFF', fontSize: 14, marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 15, color: '#666', marginBottom: 10 },
  roleBadge: { backgroundColor: '#e0e0e0', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15 },
  roleText: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 25, marginBottom: 10, color: '#333' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15 },
  statBox: { backgroundColor: '#fff', width: '30%', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  passwordBox: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, borderRadius: 10, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#FF3B30', marginHorizontal: 15, marginTop: 30, padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});