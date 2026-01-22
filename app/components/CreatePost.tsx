import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function CreatePost() {
  const [postText, setPostText] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const postOptions = [
    { id: 'photo', label: 'Foto', icon: 'image-outline', color: '#4CAF50' },
    { id: 'video', label: 'Vídeo', icon: 'videocam-outline', color: '#FF9800' },
    { id: 'music', label: 'Música', icon: 'musical-notes-outline', color: '#9C27B0' },
    { id: 'achievement', label: 'Conquista', icon: 'trophy-outline', color: '#FFD700' },
    { id: 'poll', label: 'Enquete', icon: 'bar-chart-outline', color: '#2196F3' },
    { id: 'live', label: 'Ao Vivo', icon: 'radio-outline', color: '#FF3B30' },
    { id: 'spark', label: 'Spark', icon: 'flash-outline', color: '#FF6B00' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.postInputContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#007AFF" />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="No que você está pensando, John?"
          placeholderTextColor="#999"
          value={postText}
          onChangeText={setPostText}
          multiline
        />
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowOptions(true)}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.postButton, !postText && styles.postButtonDisabled]}
          disabled={!postText}
        >
          <Text style={styles.postButtonText}>Postar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsMenu}>
            {postOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => {
                  console.log('Selecionado:', option.label);
                  setShowOptions(false);
                }}
              >
                <Ionicons name={option.icon as any} size={24} color={option.color} />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f0f0f0',
  },
  postInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    minHeight: 40,
    maxHeight: 100,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});
