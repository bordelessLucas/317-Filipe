import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
    setShowMenu(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.logo}>CONNECT</Text>
      </View>
      
      <View style={styles.rightSection}>
        {/* Lupa de Pesquisa */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            // Navegar para tela de pesquisa
            console.log('Pesquisa');
          }}
        >
          <Ionicons name="search" size={22} color="#333" />
        </TouchableOpacity>

        {/* Botão Adicionar Amigos */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            // Navegar para adicionar amigos
            console.log('Adicionar Amigos');
          }}
        >
          <Ionicons name="person-add-outline" size={22} color="#333" />
        </TouchableOpacity>

        {/* Sininho de Notificações */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            router.push('/notifications' as any);
          }}
        >
          <Ionicons name="notifications-outline" size={22} color="#333" />
        </TouchableOpacity>

        {/* Botão de Mensagens */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            router.push('/messages' as any);
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" />
        </TouchableOpacity>

        {/* Foto de Perfil com Menu */}
        <View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setShowMenu(true)}
          >
            {user?.avatar ? (
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileInitial}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.profileImage}>
                <Ionicons name="person" size={18} color="#007AFF" />
              </View>
            )}
          </TouchableOpacity>

          <Modal
            visible={showMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowMenu(false)}
            >
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    router.push('/(tabs)/profile' as any);
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Ver perfil</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.menuItemText, styles.logoutText]}>Sair</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  profileButton: {
    marginLeft: 4,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#FF3B30',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
});
