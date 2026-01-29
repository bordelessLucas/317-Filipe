import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreatePhotoVideoPost } from './CreatePhotoVideoPost';
import { CreatePollPost } from './CreatePollPost';
import { CreateLiveStream } from './CreateLiveStream';
import { CreateSpark } from './CreateSpark';

export function CreatePost() {
  const [postText, setPostText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showPhotoVideo, setShowPhotoVideo] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [showSpark, setShowSpark] = useState(false);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const postOptions = [
    { id: 'photo', label: 'Foto', icon: 'image-outline', color: '#4CAF50' },
    { id: 'video', label: 'Vídeo', icon: 'videocam-outline', color: '#FF9800' },
    { id: 'poll', label: 'Enquete', icon: 'bar-chart-outline', color: '#2196F3' },
    { id: 'live', label: 'Ao Vivo', icon: 'radio-outline', color: '#FF3B30' },
    { id: 'spark', label: 'Spark', icon: 'flash-outline', color: '#FF6B00' },
  ];

  const handleOptionSelect = (optionId: string) => {
    switch (optionId) {
      case 'photo':
        setMediaType('photo');
        setShowPhotoVideo(true);
        break;
      case 'video':
        setMediaType('video');
        setShowPhotoVideo(true);
        break;
      case 'poll':
        setShowPoll(true);
        break;
      case 'live':
        setShowLive(true);
        break;
      case 'spark':
        setShowSpark(true);
        break;
    }
  };

  const handlePhotoVideoPost = (post: { text: string; mediaUri: string; mediaType: 'photo' | 'video' }) => {
    // Mock: adicionar ao feed
    console.log('Post de foto/vídeo:', post);
    Alert.alert('Sucesso!', 'Post publicado no feed!');
  };

  const handlePollPost = (post: { text: string; question: string; options: any[]; allowMultiple: boolean }) => {
    // Mock: adicionar ao feed
    console.log('Post de enquete:', post);
    Alert.alert('Sucesso!', 'Enquete publicada no feed!');
  };

  const handleLiveStart = (stream: { title: string; description: string }) => {
    // Mock: iniciar transmissão
    console.log('Iniciando transmissão:', stream);
  };

  const handleSparkPost = (spark: { title: string; videoUri: string; thumbnailUri?: string }) => {
    // Mock: adicionar Spark
    console.log('Spark publicado:', spark);
    Alert.alert('Sucesso!', 'Spark publicado!');
  };

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
                  setShowOptions(false);
                  handleOptionSelect(option.id);
                }}
              >
                <Ionicons name={option.icon as any} size={24} color={option.color} />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modals for different post types */}
      <CreatePhotoVideoPost
        visible={showPhotoVideo}
        onClose={() => setShowPhotoVideo(false)}
        onPost={handlePhotoVideoPost}
      />
      <CreatePollPost
        visible={showPoll}
        onClose={() => setShowPoll(false)}
        onPost={handlePollPost}
      />
      <CreateLiveStream
        visible={showLive}
        onClose={() => setShowLive(false)}
        onStart={handleLiveStart}
      />
      <CreateSpark
        visible={showSpark}
        onClose={() => setShowSpark(false)}
        onPost={handleSparkPost}
      />
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
