import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(user?.bio || '');
  const [editedLocation, setEditedLocation] = useState(user?.location || '');
  const [editedWebsite, setEditedWebsite] = useState(user?.website || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const handleSave = async () => {
    await updateUser({
      bio: editedBio,
      location: editedLocation,
      website: editedWebsite,
      phone: editedPhone,
    });
    setIsEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado!');
  };

  const handleCancel = () => {
    setEditedBio(user.bio || '');
    setEditedLocation(user.location || '');
    setEditedWebsite(user.website || '');
    setEditedPhone(user.phone || '');
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com foto de capa e perfil */}
      <View style={styles.header}>
        <View style={styles.coverImage}>
          <TouchableOpacity style={styles.editCoverButton}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#007AFF" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil-outline" size={16} color="#007AFF" />
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{user.posts}</Text>
          <Text style={styles.statLabel}>Publicações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{user.followers}</Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{user.following}</Text>
          <Text style={styles.statLabel}>Seguindo</Text>
        </TouchableOpacity>
      </View>

      {/* Informações do perfil */}
      <View style={styles.infoSection}>
        {isEditing ? (
          <>
            <View style={styles.infoItem}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Bio"
                value={editedBio}
                onChangeText={setEditedBio}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Localização"
                value={editedLocation}
                onChangeText={setEditedLocation}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="link-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Website"
                value={editedWebsite}
                onChangeText={setEditedWebsite}
                keyboardType="url"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={editedPhone}
                onChangeText={setEditedPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {user.bio && (
              <View style={styles.infoItem}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{user.bio}</Text>
              </View>
            )}
            {user.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{user.location}</Text>
              </View>
            )}
            {user.website && (
              <View style={styles.infoItem}>
                <Ionicons name="link-outline" size={20} color="#666" />
                <Text style={[styles.infoText, styles.linkText]}>{user.website}</Text>
              </View>
            )}
            {user.phone && (
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{user.phone}</Text>
              </View>
            )}
            {user.email && (
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Opções */}
      <View style={styles.optionsSection}>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="settings-outline" size={22} color="#333" />
          <Text style={styles.optionText}>Configurações</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="notifications-outline" size={22} color="#333" />
          <Text style={styles.optionText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="lock-closed-outline" size={22} color="#333" />
          <Text style={styles.optionText}>Privacidade</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="help-circle-outline" size={22} color="#333" />
          <Text style={styles.optionText}>Ajuda e Suporte</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  coverImage: {
    height: 150,
    backgroundColor: '#007AFF',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  editCoverButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -50,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    color: '#007AFF',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  optionsSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
