
import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import * as ImagePicker from 'expo-image-picker';

import api from '../api/client';
import XmbBackground from '../components/XmbBackground';
import CustomSelect from '../components/CustomSelect';
import GlassButton from '../components/GlassButton';
import { SPACING } from '../theme';

export default function Profile() {
  const { signOut } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const { showToast } = useToast();

  const baseUrl = api.defaults.baseURL || '';

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [identification, setIdentification] = useState('');

  useEffect(() => {
    fetchProfile(true);

    api
      .get('/api/v1/sectors')
      .then(response => setSectors(response.data))
      .catch(console.error);
  }, []);

  async function fetchProfile(showLoader = false) {
    if (showLoader) {
      setLoading(true);
    }

    try {
      setError(false);

      const response = await api.get('/api/v1/profile');

      setProfileData(response.data);
      setIdentification(response.data.identification || '');

      if (response.data.sector_id) {
        setSelectedSector(String(response.data.sector_id));
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handlePickAvatar() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showToast(
          'Precisamos de permissão para acessar a galeria.',
          'error',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
      showToast('Não foi possível selecionar a foto.', 'error');
    }
  }

  async function uploadAvatar(uri: string) {
    const formData = new FormData();

    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();

        formData.append('avatar', blob, 'avatar.jpg');
      } else {
        formData.append(
          'avatar',
          {
            uri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
          } as any,
        );
      }

      await api.patch('/api/v1/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Foto de perfil atualizada!', 'success');
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar foto.', 'error');
    }
  }

  async function handleUpdateSector() {
    if (!selectedSector) {
      showToast('Selecione um setor primeiro.', 'error');
      return;
    }

    try {
      await api.patch('/api/v1/profile/sector', {
        sector_id: Number(selectedSector),
      });

      showToast('Setor atualizado com sucesso!', 'success');
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar setor.', 'error');
    }
  }

  async function handleUpdateIdentification() {
    try {
      await api.patch('/api/v1/profile/identification', {
        identification,
      });

      showToast('Identificação atualizada!', 'success');
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar identificação.', 'error');
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      showToast('Preencha ambas as senhas.', 'error');
      return;
    }

    try {
      await api.patch('/api/v1/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      showToast('Senha alterada com sucesso!', 'success');

      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(
        err.response?.data?.error || 'Erro ao alterar senha.',
        'error',
      );
    }
  }

  const sectorOptions = sectors.map(sector => ({
    label: `${sector.name} (${sector.building})`,
    value: String(sector.id),
  }));

  const roleNames: Record<string, string> = {
    requester: 'Solicitante',
    technician: 'Técnico',
    manager: 'Gestor',
  };

  if (loading) {
    return (
      <XmbBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.accentSilver}
          />

          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando perfil...
          </Text>
        </View>
      </XmbBackground>
    );
  }

  if (error || !profileData) {
    return (
      <XmbBackground>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.statusDanger }]}>
            Erro ao carregar perfil.
          </Text>

          <Text style={[styles.errorDescription, { color: colors.textSecondary }]}>
            Não foi possível buscar suas informações.
          </Text>

          <GlassButton
            title="Tentar novamente"
            onPress={() => fetchProfile(true)}
            variant="ghost"
          />
        </View>
      </XmbBackground>
    );
  }

  const stats = profileData.stats || {};

  return (
    <XmbBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CABEÇALHO DO PERFIL */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handlePickAvatar}
            activeOpacity={0.8}
            style={styles.avatarContainer}
          >
            {profileData.avatar_url ? (
              <Image
                source={{
                  uri: `${baseUrl}${profileData.avatar_url}`,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.accentSilver },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: colors.background },
                  ]}
                >
                  {(profileData.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.cameraBadge,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: colors.textPrimary }}>+</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.changePhotoText, { color: colors.accentSilver }]}>
            Alterar foto
          </Text>

          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {profileData.name}
          </Text>

          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {profileData.email}
          </Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.roleText, { color: colors.textPrimary }]}>
              {roleNames[profileData.role] || profileData.role}
            </Text>
          </View>
        </View>

        {/* IDENTIFICAÇÃO */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Identificação
        </Text>

        <View
          style={[
            styles.box,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Minha identificação
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundDeep,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Ex: Professor de Física II"
            placeholderTextColor={colors.textMuted}
            value={identification}
            onChangeText={setIdentification}
          />

          <GlassButton
            title="Salvar identificação"
            onPress={handleUpdateIdentification}
            style={styles.actionButton}
          />

          <View
            style={[
              styles.internalDivider,
              { backgroundColor: colors.border },
            ]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Meu setor / bloco
          </Text>

          <View style={styles.selectContainer}>
            <CustomSelect
              options={sectorOptions}
              selectedValue={selectedSector}
              onValueChange={setSelectedSector}
              placeholder="Selecione seu setor..."
            />
          </View>

          <GlassButton
            title="Salvar setor"
            onPress={handleUpdateSector}
            variant="ghost"
          />
        </View>

        {/* ESTATÍSTICAS */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Minhas estatísticas
        </Text>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {stats.total ?? 0}
            </Text>

            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.statusSuccess }]}>
              {stats.resolvidos ?? 0}
            </Text>

            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Resolvidos
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.statusWarning }]}>
              {stats.pendentes ?? 0}
            </Text>

            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pendentes
            </Text>
          </View>
        </View>

        {/* SEGURANÇA */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Segurança
        </Text>

        <View
          style={[
            styles.box,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Senha atual
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundDeep,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Digite sua senha atual"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Nova senha
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundDeep,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Digite sua nova senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <GlassButton
            title="Alterar senha"
            onPress={handleChangePassword}
            variant="ghost"
          />
        </View>

        {/* SAIR DA CONTA */}
        <View style={styles.logoutContainer}>
          <GlassButton
            title="Sair da conta"
            onPress={signOut}
            variant="danger"
          />
        </View>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },

  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },

  avatarContainer: {
    position: 'relative',
  },

  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: 'rgba(201, 208, 216, 0.4)',
  },

  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },

  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },

  name: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },

  email: {
    fontSize: 14,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },

  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
  },

  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },

  box: {
    padding: SPACING.md,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: 15,
  },

  actionButton: {
    marginBottom: SPACING.sm,
  },

  internalDivider: {
    height: 1,
    marginVertical: SPACING.lg,
  },

  selectContainer: {
    marginBottom: SPACING.md,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  statBox: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  statLabel: {
    fontSize: 11,
    marginTop: SPACING.xs,
  },

  logoutContainer: {
    marginTop: SPACING.xl,
  },
});
