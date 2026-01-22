import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppHeader } from './components/AppHeader';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.notificationCard}>
          <Ionicons name="person-add" size={24} color="#4CAF50" />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Nova Conexão</Text>
            <Text style={styles.notificationText}>Maria Garcia aceitou sua solicitação de conexão</Text>
            <Text style={styles.notificationTime}>há 5 minutos</Text>
          </View>
        </View>

        <View style={styles.notificationCard}>
          <Ionicons name="heart" size={24} color="#E91E63" />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Curtida</Text>
            <Text style={styles.notificationText}>Alex Johnson curtiu seu post</Text>
            <Text style={styles.notificationTime}>há 1 hora</Text>
          </View>
        </View>

        <View style={styles.notificationCard}>
          <Ionicons name="chatbubble" size={24} color="#2196F3" />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Comentário</Text>
            <Text style={styles.notificationText}>Chen Wei comentou no seu post</Text>
            <Text style={styles.notificationTime}>há 2 horas</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});
