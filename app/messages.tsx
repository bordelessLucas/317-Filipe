import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppHeader } from './components/AppHeader';

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Mensagens</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={styles.messageCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#007AFF" />
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>Maria Garcia</Text>
              <Text style={styles.messageTime}>5m</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              Ei! Você vai ao Tech Summit? Podemos nos encontrar lá.
            </Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>2</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#4CAF50" />
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>Priya Patel</Text>
              <Text style={styles.messageTime}>1h</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              Adorei suas fotos da comunidade de fotografia!
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#FF9800" />
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>Alex Johnson</Text>
              <Text style={styles.messageTime}>2h</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              Obrigado pela conexão! Vamos conversar mais.
            </Text>
          </View>
        </TouchableOpacity>
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
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
